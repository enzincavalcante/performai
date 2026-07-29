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

  return {
    overall_score: overallScore,
    summary: `A ligação recebeu nota ${overallScore}/100. A análise identificou a estrutura comercial presente na conversa e priorizou descoberta, construção de valor, clareza da comunicação e definição do próximo passo. Use o plano abaixo como roteiro para a próxima call.`,
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
    competency_scores: [
      { name: "Descoberta e qualificação", score: discoveryScore, feedback: "Mede perguntas, aprofundamento e entendimento da necessidade." },
      { name: "Pitch e construção de valor", score: valueScore, feedback: "Mede a conexão entre solução, impacto e resultado esperado." },
      { name: "Fechamento e próximo passo", score: closingScore, feedback: "Mede clareza do compromisso e avanço da oportunidade." },
      { name: "Comunicação e postura", score: communicationScore, feedback: "Mede clareza, objetividade e organização da mensagem." },
    ],
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
      score: Math.round(Number(score) / 10),
      what_worked: "A transcricao apresentou sinais compativeis com este criterio.",
      what_to_improve: "Aprofunde este bloco com perguntas, confirmacoes e um compromisso verificavel.",
      excerpt: "Nao identificado com seguranca no modo de contingencia.",
    })),
    crm_report: {
      callData: { vendedor: "Nao identificado", lead_empresa: "Nao identificado", produto_servico: "Nao identificado", etapa_funil: "Nao identificado" },
      temperature: { classification: "NAO IDENTIFICADA", justification: "A classificacao exige sinais explicitos de urgencia, orcamento, autoridade e engajamento." },
      conversationSummary: "Resumo gerado a partir dos elementos comerciais identificados na transcricao.",
      pains: ["Nao identificado com seguranca no modo de contingencia."],
      objections: [],
      qualification: { orcamento: "Nao identificado", autoridade: "Nao identificado", necessidade: "Nao identificado", prazo_urgencia: "Nao identificado" },
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
  if (!apiKey) {
    return NextResponse.json({
      detail: "O modulo de analise ainda nao possui uma chave Gemini de producao configurada.",
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
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
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

  const prompt = `Voce e especialista em avaliacao de calls B2B e B2C, SPIN Selling, Challenger Sale, BANT e GPCT.
Analise integralmente esta call de vendas em portugues brasileiro e separe AVALIACAO TECNICA de RELATORIO GERENCIAL.
Considere os metadados: ${metadata.slice(0, 4000)}.
Retorne SOMENTE JSON valido com:
- overall_score de 0 a 100, summary, strengths (3), improvements (3), competency_scores, next_actions e critical_moments;
- evaluation_blocks com EXATAMENTE 10 itens. Cada item deve ter name, score de 0 a 10, what_worked, what_to_improve e excerpt;
- use estes blocos: Abertura e rapport; Agenda e controle da call; Descoberta e diagnostico; Escuta ativa; Apresentacao da solucao e pitch; Tratamento de objecoes; Qualificacao e alinhamento de expectativas; Fechamento e proximos passos; Tom, linguagem e postura; Compliance e boas praticas.
- Cada justificativa deve ser especifica, criteriosa e construtiva. Avalie proporcao de fala, perguntas abertas, custo da inacao, decisores, orcamento, prazo, transicoes, prova social, valor, objecoes, compromisso e CRM.
- crm_report com esta estrutura exata:
  callData (data_hora, duracao, vendedor, lead_empresa, cargo, produto_servico, etapa_funil, origem_lead);
  temperature (classification: QUENTE, MORNO, FRIO ou NAO IDENTIFICADA; justification);
  conversationSummary com 4 a 6 frases factuais em ordem cronologica;
  pains (lista);
  objections (lista de objection e handling);
  qualification (orcamento, autoridade, necessidade, prazo_urgencia);
  nextSteps (lista de action, owner, deadline);
  sellerObservations;
  quickEvaluation (score de 0 a 10 e verdict).
Cada critical_moment deve conter timestamp, speaker, quote, issue e recommendation.
Baseie-se SOMENTE na transcricao. Nunca invente dados, valores, combinacoes, falas ou timestamps.
Quando nao houver informacao, escreva exatamente "Nao identificado".
Explique os motivos das recomendacoes, inclua exemplos praticos, erros a evitar e
proximos passos objetivos. A resposta deve ter profundidade de consultoria profissional.

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
        generationConfig: { responseMimeType: "application/json", temperature: 0.15, maxOutputTokens: 8192 },
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
