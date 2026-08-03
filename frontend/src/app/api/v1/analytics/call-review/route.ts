import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const DIRECT_UPLOAD_LIMIT = 4 * 1024 * 1024;

type GeminiPayload = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type DeepgramPayload = {
  err_msg?: string;
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
        words?: Array<{
          word?: string;
          punctuated_word?: string;
          speaker?: number;
          start?: number;
        }>;
      }>;
    }>;
    utterances?: Array<{
      speaker?: number;
      transcript?: string;
      start?: number;
    }>;
  };
};

function extractJson(text: string) {
  const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return JSON.parse(clean);
}

function formatTimestamp(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function formatDeepgramTranscript(payload: DeepgramPayload) {
  const utterances = payload.results?.utterances ?? [];
  if (utterances.length > 0) {
    return utterances
      .filter((utterance) => utterance.transcript?.trim())
      .map((utterance) => (
        `[${formatTimestamp(utterance.start)}] Pessoa ${(utterance.speaker ?? 0) + 1}: ${utterance.transcript?.trim()}`
      ))
      .join("\n");
  }

  return payload.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
}

function buildRubricReport(transcript: string) {
  const normalized = transcript.toLocaleLowerCase("pt-BR");
  const questionCount = (transcript.match(/\?/g) ?? []).length;
  const discoverySignals = ["desafio", "problema", "objetivo", "prioridade", "hoje", "impacto"]
    .filter((term) => normalized.includes(term)).length;
  const valueSignals = ["resultado", "econom", "retorno", "valor", "convers", "receita"]
    .filter((term) => normalized.includes(term)).length;
  const closingSignals = ["próximo passo", "proximo passo", "agenda", "reunião", "reuniao", "quando"]
    .filter((term) => normalized.includes(term)).length;

  const discoveryScore = Math.min(100, 45 + questionCount * 8 + discoverySignals * 7);
  const valueScore = Math.min(100, 42 + valueSignals * 10);
  const closingScore = Math.min(100, 40 + closingSignals * 12);
  const communicationScore = transcript.length > 450 ? 76 : transcript.length > 180 ? 66 : 54;
  const overallScore = Math.round(
    discoveryScore * 0.3 + valueScore * 0.25 + closingScore * 0.25 + communicationScore * 0.2,
  );

  const skill = (name: string, score: number, explanation: string, nextStep: string) => ({
    name,
    score: Math.max(0, Math.min(100, Math.round(score))),
    explanation,
    impact: `Esta habilidade influencia diretamente a qualidade da oportunidade e a previsibilidade do proximo passo.`,
    level: score >= 85 ? "Elite" : score >= 72 ? "Avancado" : score >= 58 ? "Intermediario" : "Iniciante",
    gap: score >= 75 ? "Transformar o comportamento em um padrao consistente." : nextStep,
    next_step: nextStep,
  });
  const competencyScores = [
    skill("Abertura", communicationScore, "A nota considera clareza e organizacao observadas no inicio da transcricao.", "Abra com contexto, objetivo e uma pergunta de permissao."),
    skill("Rapport", communicationScore - 2, "Avaliacao baseada na presenca de acolhimento, adaptacao e participacao do cliente.", "Reconheca uma fala do cliente antes de avancar para a agenda."),
    skill("Clareza", communicationScore + 3, "Mede objetividade, encadeamento e facilidade de entendimento da mensagem.", "Use frases curtas e uma ideia principal por vez."),
    skill("Comunicacao", communicationScore, "Mede estrutura, objetividade e capacidade de sustentar a conversa.", "Resuma cada bloco antes de fazer a proxima pergunta."),
    skill("Confianca", communicationScore + 1, "Estimada pela firmeza da conducao e ausencia de desvios na argumentacao.", "Use evidencia concreta e evite promessas que nao possam ser provadas."),
    skill("Descoberta", discoveryScore, "Mede perguntas, aprofundamento e entendimento da situacao atual.", "Explore problema, impacto, urgencia e custo de nao agir."),
    skill("Qualificacao", discoveryScore - 5, "Mede sinais de prioridade, autoridade, prazo e capacidade de decisao.", "Confirme decisores, processo, prazo e criterio de investimento."),
    skill("Perguntas", discoveryScore + Math.min(8, questionCount * 2), `Foram identificados ${questionCount} sinais de pergunta na transcricao.`, "Transforme respostas vagas em perguntas de aprofundamento."),
    skill("Escuta ativa", discoveryScore - 2, "Mede confirmacoes, parafrases e continuidade baseada no que o cliente disse.", "Parafraseie a resposta e valide antes de mudar de assunto."),
    skill("Identificacao de dores", discoveryScore + discoverySignals * 2, "Mede a capacidade de sair do sintoma e chegar ao impacto real.", "Quantifique o efeito da dor em tempo, receita, risco ou produtividade."),
    skill("Construcao de valor", valueScore, "Mede a conexao entre a solucao e um resultado relevante para o cliente.", "Conecte cada capacidade a um impacto mencionado pelo cliente."),
    skill("Pitch", valueScore - 2, "Mede relevancia, concisao e personalizacao da apresentacao.", "Apresente apenas o que responde a dor confirmada."),
    skill("Argumentacao", valueScore + 2, "Mede logica, evidencia e capacidade de sustentar a recomendacao.", "Use problema, impacto, prova e pergunta de validacao."),
    skill("Objecoes", Math.round((valueScore + discoveryScore) / 2), "Mede diagnostico da resistencia antes da resposta comercial.", "Valide, investigue, responda com evidencia e confirme entendimento."),
    skill("Negociacao", Math.round((valueScore + closingScore) / 2), "Mede troca de valor, protecao de margem e alinhamento de interesses.", "Negocie contrapartidas antes de qualquer concessao."),
    skill("Fechamento", closingScore, "Mede capacidade de transformar valor em compromisso claro.", "Confirme decisao, responsavel e data sem criar pressao artificial."),
    skill("Proximo passo", closingScore + 2, "Mede existencia de uma acao objetiva e verificavel ao final da conversa.", "Encerre com acao, responsavel, data e objetivo do proximo encontro."),
  ];

  return {
    overall_score: overallScore,
    summary: `A ligação recebeu nota ${overallScore}/100. A análise identificou a estrutura comercial presente na conversa e priorizou descoberta, construção de valor, clareza da comunicação e definição do próximo passo. Use o plano abaixo como roteiro para a próxima call.`,
    diagnosis: {
      executive_summary: `A call apresentou uma base comercial mensuravel, com nota ${overallScore}/100. O principal equilibrio a desenvolver esta entre descoberta, valor e compromisso final.`,
      call_objective: "O objetivo exato deve ser confirmado pela transcricao e pelo contexto informado no envio.",
      conversation_context: `Foram identificados ${questionCount} sinais de perguntas, ${discoverySignals} sinais de descoberta, ${valueSignals} sinais de valor e ${closingSignals} sinais de fechamento.`,
      seller_conduction: discoveryScore >= valueScore ? "A conducao priorizou investigacao antes da proposta." : "A conversa apresentou valor mais cedo do que aprofundou o diagnostico.",
      overall_diagnosis: "A maior oportunidade e transformar cada resposta do cliente em aprofundamento, evidencia de valor e um compromisso verificavel.",
      missed_opportunities: discoverySignals < 3 ? "Faltou aprofundar impacto, urgencia e consequencia de nao agir antes de apresentar a solucao." : "Havia espaco para quantificar melhor o impacto e validar os criterios de decisao.",
      missing_questions: "Perguntas recomendadas: como funciona hoje, onde mais trava, quanto isso custa, quem participa da decisao e o que precisa acontecer para avancar?",
      objections_analysis: "A objecao deve ser validada e investigada antes da resposta. Sem evidencia explicita, nao e seguro afirmar que houve tratamento completo.",
      better_approach: "Conduza a proxima call em cinco movimentos: agenda, descoberta, impacto, valor contextual e proximo passo com data.",
      professional_conclusion: "Use o plano de melhoria como rotina de preparacao e compare a evolucao nas proximas tres ligacoes.",
    },
    strengths: [
      questionCount > 0
        ? "Houve iniciativa de investigação por meio de perguntas, criando espaço para o cliente participar."
        : "A mensagem comercial manteve foco no contexto da conversa.",
      valueSignals > 0
        ? "A fala conectou a solução a resultados de negócio, elemento essencial para sustentar valor."
        : "A comunicação apresentou a solução de maneira direta e compreensível.",
    ],
    improvements: [
      discoverySignals < 2
        ? "Aprofunde a descoberta: pergunte sobre impacto, urgência, processo atual e consequência de não agir antes de apresentar a solução."
        : "Depois de cada resposta do cliente, faça uma pergunta de aprofundamento para transformar sintomas em impacto mensurável.",
      valueSignals < 2
        ? "Traduza funcionalidades em impacto financeiro ou operacional. Exemplo: 'Se reduzirmos esse gargalo, quantas oportunidades a equipe recupera por mês?'"
        : "Quantifique o valor com números do próprio cliente e confirme se o impacto justifica a mudança.",
      closingSignals < 1
        ? "Finalize com um próximo passo específico, responsável e data. Evite encerrar apenas com 'eu retorno depois'."
        : "Confirme no fechamento quem participa, qual decisão será tomada e o que precisa estar pronto.",
    ],
    competency_scores: competencyScores,
    next_actions: [
      "Prepare cinco perguntas de descoberta sobre cenário atual, impacto, urgência, decisão e orçamento.",
      "Reescreva o pitch em três partes: problema confirmado, impacto mensurável e prova de valor.",
      "Encerre a próxima ligação com data, participantes e objetivo do próximo encontro confirmados em voz alta.",
    ],
    critical_moments: [],
    evaluation_blocks: [
      ["Abertura e rapport", communicationScore], ["Agenda e controle da call", communicationScore],
      ["Descoberta e diagnostico", discoveryScore], ["Escuta ativa", discoveryScore],
      ["Apresentacao da solucao e pitch", valueScore], ["Tratamento de objecoes", valueScore],
      ["Qualificacao e alinhamento", discoveryScore], ["Fechamento e proximos passos", closingScore],
      ["Tom, linguagem e postura", communicationScore], ["Compliance e boas praticas", communicationScore],
    ].map(([name, score]) => ({
      name,
      score: Math.round(Number(score)),
      what_worked: "A transcricao apresentou sinais compativeis com este criterio.",
      what_to_improve: "Aprofunde este bloco com perguntas, confirmacoes e um compromisso verificavel.",
      excerpt: "Nao houve uma fala explicita sobre este ponto durante a ligacao.",
    })),
    crm_report: {
      callData: { vendedor: "Nao mencionado durante a ligacao.", lead_empresa: "Nao mencionado durante a ligacao.", produto_servico: "Nao mencionado durante a ligacao.", etapa_funil: "Nao mencionada explicitamente durante a ligacao." },
      temperature: { classification: "NAO IDENTIFICADA", justification: "A classificacao exige sinais explicitos de urgencia, orcamento, autoridade e engajamento." },
      conversationSummary: "Resumo gerado a partir dos elementos comerciais identificados na transcricao.",
      pains: ["Nenhuma dor foi mencionada de forma explicita durante a ligacao."],
      objections: [],
      qualification: { orcamento: "Nao mencionado durante a ligacao.", autoridade: "Nao mencionada durante a ligacao.", necessidade: "Nao mencionada durante a ligacao.", prazo_urgencia: "Nao mencionado durante a ligacao." },
      nextSteps: [],
      sellerObservations: "Revise a transcricao integral antes de registrar informacoes no CRM.",
      quickEvaluation: { score: Math.round(overallScore / 10), verdict: "A call apresenta base comercial, mas requer aprofundamento nos criterios com menor pontuacao." },
    },
    transcript,
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const suppliedTranscript = String(formData.get("transcript") ?? "").trim();
  const metadata = String(formData.get("metadata") ?? "{}");

  if ((!audio || !(audio instanceof File) || audio.size === 0) && !suppliedTranscript) {
    return NextResponse.json({ detail: "Selecione uma gravacao valida." }, { status: 422 });
  }

  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (backendUrl && audio instanceof File) {
    const proxyBody = new FormData();
    proxyBody.append("audio", audio);
    proxyBody.append("metadata", metadata);
    const response = await fetch(`${backendUrl}/api/v1/analytics/call-review`, {
      method: "POST",
      body: proxyBody,
      signal: AbortSignal.timeout(290_000),
    });
    return new NextResponse(response.body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey && !deepgramKey) {
    return NextResponse.json({
      detail: "O modulo de analise precisa de uma chave Deepgram ou Gemini configurada.",
      code: "call_review_not_configured",
    }, { status: 503 });
  }

  if (audio instanceof File && audio.size > DIRECT_UPLOAD_LIMIT) {
    return NextResponse.json({
      detail: "Para gravacoes acima de 4 MB, configure BACKEND_API_URL com o servico de processamento privado.",
      code: "private_backend_required",
    }, { status: 413 });
  }

  const bytes = audio instanceof File ? Buffer.from(await audio.arrayBuffer()) : Buffer.alloc(0);
  let transcript = suppliedTranscript;

  if (deepgramKey && audio instanceof File && !transcript) {
    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&language=pt-BR&smart_format=true&punctuate=true&diarize=true&utterances=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramKey}`,
          "Content-Type": audio.type || "audio/mpeg",
        },
        body: bytes,
        signal: AbortSignal.timeout(240_000),
      },
    );
    const deepgramPayload = await deepgramResponse.json() as DeepgramPayload;

    if (!deepgramResponse.ok) {
      return NextResponse.json({
        detail: "A transcricao da gravacao falhou. Tente novamente em alguns instantes.",
        provider: "deepgram",
        provider_status: deepgramResponse.status,
        provider_message: deepgramPayload.err_msg?.slice(0, 300),
      }, { status: 502 });
    }

    transcript = formatDeepgramTranscript(deepgramPayload);
    if (!transcript) {
      return NextResponse.json({
        detail: "Nao foi possivel identificar falas nesta gravacao. Verifique o volume e envie novamente.",
        code: "empty_transcript",
      }, { status: 422 });
    }
  }

  try {
    const parsedMetadata = JSON.parse(metadata) as { transcribe_only?: boolean };
    if (parsedMetadata.transcribe_only) {
      return NextResponse.json({ status: "transcribed", transcript });
    }
  } catch {
    // Invalid optional metadata does not block the analysis.
  }

  if (!apiKey && transcript) {
    return NextResponse.json({
      request_id: crypto.randomUUID(),
      status: "completed",
      processing: {
        mode: "deepgram_transcription_commercial_rubric",
        transcription_model: "deepgram-nova-3",
        analysis_model: "performai-commercial-rubric-v1",
        advanced_analysis_pending: true,
      },
      report: buildRubricReport(transcript),
    });
  }

  if (!apiKey) {
    return NextResponse.json({
      detail: "A transcricao nao retornou falas suficientes para gerar a avaliacao.",
      code: "empty_transcript",
    }, { status: 422 });
  }

  const prompt = `Voce e um gerente comercial senior e consultor especialista em avaliacao de calls B2B e B2C, SPIN Selling, Challenger Sale, Sandler, BANT, GPCT e MEDDICC.
Analise integralmente esta call em portugues brasileiro. Entregue um diagnostico profundo, personalizado e sustentado por evidencias da conversa. Separe AVALIACAO TECNICA de RELATORIO GERENCIAL.
Considere os metadados: ${metadata.slice(0, 4000)}.
Retorne SOMENTE JSON valido com:
- overall_score de 0 a 100 e summary;
- diagnosis com executive_summary, call_objective, conversation_context, seller_conduction, overall_diagnosis, missed_opportunities, missing_questions, objections_analysis, better_approach e professional_conclusion. Cada campo deve ter 2 a 5 frases especificas, com evidencias e orientacao pratica;
- strengths com 3 objetos contendo title, evidence, why_it_worked e how_to_repeat;
- improvements com 3 objetos contendo title, error, impact, how_to_fix, prevention e practical_example;
- competency_scores com EXATAMENTE estas 17 habilidades: Abertura; Rapport; Clareza; Comunicacao; Confianca; Descoberta; Qualificacao; Perguntas; Escuta ativa; Identificacao de dores; Construcao de valor; Pitch; Argumentacao; Objecoes; Negociacao; Fechamento; Proximo passo. Cada objeto deve conter name, score de 0 a 100, explanation (o que aconteceu), impact, level (Iniciante, Intermediario, Avancado ou Elite), gap (o que precisa melhorar) e next_step (como melhorar);
- next_actions com EXATAMENTE 3 objetos contendo priority, objective, practical_action, exercise, target e expected_result;
- evaluation_blocks com EXATAMENTE 28 itens. Cada item deve ter name, score de 0 a 100, reason, what_worked, what_to_improve, how_to_improve, practical_example e excerpt;
- use estes 28 criterios, nesta ordem: Abertura da ligacao; Rapport; Descoberta de necessidades; Qualificacao; Comunicacao; Clareza; Escuta ativa; Controle da conversa; Autoridade; Confianca; Tom de voz; Ritmo da conversa; Argumentacao; Pitch de vendas; Demonstracao de valor; Tratamento de objecoes; Contorno de objecoes; Negociacao; Fechamento; Proximos passos; Follow-up; Uso de gatilhos mentais; Inteligencia emocional; Postura consultiva; Capacidade de gerar urgencia; Capacidade de gerar desejo; Persuasao; Organizacao da conversa.
- critical_moments com timestamp real, speaker, quote, issue, recommendation e type (acerto, risco ou oportunidade).
- No diagnostico, identifique explicitamente os principais acertos, principais erros, oportunidades perdidas, objecoes, perguntas que faltaram e como conduzir melhor. Use timestamps somente quando existirem na transcricao.
- Cada explicacao deve citar comportamento ou fala concreta. Explique impacto comercial, motivo da recomendacao, exemplo pratico, erro a evitar e proximo passo. Evite qualquer texto generico.
- crm_report com esta estrutura exata:
  callData (data_hora, duracao, vendedor, lead, empresa, cargo, produto_servico, segmento, objetivo_ligacao, etapa_funil, origem_lead, situacao_cliente, resultado_ligacao);
  temperature (classification: QUENTE, MORNO, FRIO ou NAO IDENTIFICADA; justification);
  conversationSummary com 6 a 10 frases factuais em ordem cronologica;
  pains, needs e presentedSolution (listas);
  objections (lista de objection e handling);
  qualification (orcamento, autoridade, necessidade, prazo_urgencia);
  nextSteps (lista de action, owner, deadline);
  sellerObservations;
  quickEvaluation (score de 0 a 10 e verdict).
Cada critical_moment deve conter timestamp, speaker, quote, issue e recommendation.
Identifique vendedor, lead, empresa, produto, segmento e objetivo automaticamente. Voce pode inferir apenas quando houver evidencias contextuais suficientes e deve sinalizar a inferencia com "(inferido pelo contexto)".
Baseie-se SOMENTE na transcricao. Nunca invente dados, valores, combinacoes, falas ou timestamps. Quando realmente nao houver evidencia, escreva "Informacao nao mencionada durante a ligacao.".
A resposta deve ter profundidade de consultoria profissional, linguagem corporativa clara e recomendacoes executaveis.

TRANSCRICAO:
${transcript || "A gravacao esta anexada nesta solicitacao."}`;

  const configuredModel = process.env.GEMINI_CALL_REVIEW_MODEL;
  const models = configuredModel
    ? [configuredModel]
    : ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

  let response: Response | null = null;
  let payload: GeminiPayload = {};
  let model = models[0];

  for (const candidateModel of models) {
    model = candidateModel;
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: transcript
            ? [{ text: prompt }]
            : [
                { inlineData: { mimeType: audio instanceof File ? audio.type || "audio/mpeg" : "audio/mpeg", data: bytes.toString("base64") } },
                { text: prompt },
              ],
        }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.12, maxOutputTokens: 16384 },
      }),
      signal: AbortSignal.timeout(290_000),
      },
    );

    payload = await response.json();
    const shouldTryFallback = response.status === 404 || response.status === 429;
    if (response.ok || !shouldTryFallback || configuredModel) {
      break;
    }
  }

  if (!response?.ok) {
    const providerError = payload.error;
    if (response?.status === 429 && transcript) {
      return NextResponse.json({
        request_id: crypto.randomUUID(),
        status: "completed",
        processing: {
          mode: "deepgram_transcription_commercial_rubric",
          transcription_model: "deepgram-nova-3",
          analysis_model: "performai-commercial-rubric-v1",
          advanced_analysis_pending: true,
        },
        report: buildRubricReport(transcript),
      });
    }
    return NextResponse.json({
      detail: response?.status === 404
        ? "A chave foi encontrada, mas nao possui acesso a um modelo Gemini compativel. Confirme se ela foi criada no Google AI Studio."
        : "O Gemini nao conseguiu processar esta gravacao.",
      provider_status: response?.status ?? 502,
      provider_message: typeof providerError?.message === "string"
        ? providerError.message.slice(0, 300)
        : undefined,
    }, { status: 502 });
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    return NextResponse.json({ detail: "A IA nao retornou um relatorio valido." }, { status: 502 });
  }

  try {
    const report = extractJson(text) as Record<string, unknown>;
    if (!report.transcript && transcript) {
      report.transcript = transcript;
    }
    return NextResponse.json({
      request_id: crypto.randomUUID(),
      status: "completed",
      processing: {
        mode: deepgramKey ? "deepgram_transcription_gemini_analysis" : "gemini_direct",
        transcription_model: deepgramKey ? "deepgram-nova-3" : model,
        analysis_model: model,
      },
      report,
    });
  } catch {
    return NextResponse.json({ detail: "A IA retornou um relatorio fora do formato esperado." }, { status: 502 });
  }
}
