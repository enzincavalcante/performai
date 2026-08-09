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
  if (process.env.CALL_REVIEW_ENGINE !== "legacy") return buildEvidenceRubricReport(transcript);
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

function buildEvidenceRubricReport(transcript: string) {
  const clean = transcript.trim();
  const normalized = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const parsed = clean.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\[(\d{2,}:\d{2})\]\s*(Pessoa\s+\d+):\s*(.+)$/i);
    return match ? [{ timestamp: match[1], speaker: match[2], text: match[3].trim() }] : [];
  });
  const rows = parsed.length ? parsed : [{ timestamp: "00:00", speaker: "Pessoa nao identificada", text: clean }];
  const sellerCandidates = [...new Set(rows.map((row) => row.speaker))].map((speaker) => {
    const speakerRows = rows.filter((row) => row.speaker === speaker);
    const joined = speakerRows.map((row) => row.text).join(" ").toLowerCase();
    const commercial = (joined.match(/\b(nossa|solucao|proposta|contrato|investimento|agenda|produto|servico|resultado)\b/g) ?? []).length;
    return { speaker, rows: speakerRows, signal: commercial * 2 + speakerRows.filter((row) => row.text.includes("?")).length };
  }).sort((a, b) => b.signal - a.signal);
  const seller = sellerCandidates[0];
  const sellerRows = seller?.rows ?? rows;
  const enoughEvidence = clean.length >= 120 && sellerRows.length >= 2;
  const insufficient = "Nao foi possivel avaliar este criterio com evidencia suficiente nesta ligacao.";
  type Criterion = { name: string; weight: number; signals: RegExp; negative?: RegExp; improve: string; example: string };
  const criteria: Criterion[] = [
    { name: "Abertura", weight: 5, signals: /bom dia|boa tarde|tudo bem|obrigad|prazer|tempo disponivel/, improve: "Abra com contexto, objetivo e confirmacao de tempo.", example: "Obrigado pelo tempo. Proponho entender o cenario, avaliar aderencia e combinar um proximo passo. Funciona para voce?" },
    { name: "Rapport e adaptacao", weight: 5, signals: /entendo|faz sentido|voce comentou|pelo que disse|obrigad/, improve: "Reconheca uma fala concreta do cliente antes de avancar.", example: "Entendi o ponto que voce trouxe. Quero aprofundar isso antes de falar da solucao." },
    { name: "Agenda e controle", weight: 5, signals: /agenda|objetivo da conversa|primeiro.*depois|combinado|proponho/, improve: "Defina agenda e transicoes claras.", example: "Primeiro entendo o contexto, depois avaliamos aderencia e definimos o proximo passo." },
    { name: "Descoberta do contexto", weight: 10, signals: /como funciona|como fazem|cenario atual|hoje|processo|desafio|problema/, improve: "Investigue processo, problema e causa antes de apresentar.", example: "Como esse processo funciona hoje e em qual etapa ele mais trava?" },
    { name: "Impacto e custo da inacao", weight: 10, signals: /impacto|quanto custa|perde|receita|meta|se nada mudar|consequencia|urgencia/, improve: "Quantifique a dor em receita, tempo, risco ou produtividade.", example: "Se nada mudar neste trimestre, qual impacto isso gera na meta?" },
    { name: "Qualificacao", weight: 8, signals: /orcamento|investimento|decisor|quem decide|prazo|prioridade|criterio|aprova/, improve: "Confirme autoridade, decisao, prazo, prioridade e investimento.", example: "Quem participa da decisao e quais criterios precisam ser atendidos?" },
    { name: "Escuta ativa", weight: 7, signals: /entao.*voce|pelo que entendi|se entendi|voce disse|correto|faz sentido/, improve: "Parafraseie e valide antes de mudar de tema.", example: "Pelo que entendi, o impacto principal e a falta de previsibilidade. Correto?" },
    { name: "Qualidade das perguntas", weight: 7, signals: /\?/, improve: "Use perguntas abertas e aprofunde respostas vagas.", example: "O que torna isso prioritario agora e como voces medem o impacto?" },
    { name: "Pitch contextual", weight: 8, signals: /por isso|com base|nesse cenario|para resolver|resultado|beneficio/, negative: /temos dashboard|temos automacao|varias funcionalidades/, improve: "Conecte somente capacidades relevantes as dores confirmadas.", example: "Como voce relatou perda de previsibilidade, a proposta e reduzir esse ponto com acompanhamento mensuravel." },
    { name: "Construcao de valor e prova", weight: 8, signals: /case|cliente semelhante|dados|resultado|retorno|roi|econom|prova/, improve: "Use evidencia verificavel e numeros do cliente.", example: "Qual indicador seria valido para comprovar resultado neste projeto?" },
    { name: "Tratamento de objecoes", weight: 8, signals: /entendo a preocupacao|o que esta por tras|alem do preco|se resolvermos|objecao|resistencia/, improve: "Valide, esclareca, responda com evidencia e confirme.", example: "Alem do valor, existe algum risco ou criterio que ainda impede a decisao?" },
    { name: "Negociacao e protecao de margem", weight: 6, signals: /contrapartida|condicionado|escopo|volume|prazo de pagamento|troca/, negative: /desconto.*(agora|hoje)|posso dar.*desconto/, improve: "Nao conceda preco antes de diagnosticar valor e obter contrapartida.", example: "Posso avaliar uma condicao se alinharmos prazo, escopo e compromisso. O que voces assumem em contrapartida?" },
    { name: "Fechamento", weight: 6, signals: /faz sentido avancar|podemos fechar|o que falta|decisao|compromisso/, improve: "Teste compromisso e confirme o que impede a decisao.", example: "O que ainda precisa estar claro para avancarmos?" },
    { name: "Proximo passo", weight: 5, signals: /proximo passo|agendar|data|quinta|sexta|responsavel|enviar ate/, improve: "Finalize com acao, responsavel, data e objetivo.", example: "Eu envio o resumo hoje e nos reunimos quinta com o decisor. Correto?" },
    { name: "Tom, postura e compliance", weight: 2, signals: /transparente|nao consigo prometer|limite|condicao|confirmar/, negative: /garantido|certeza absoluta|sem risco/, improve: "Use linguagem clara e sem promessas nao comprovadas.", example: "Vou separar o que e comprovado, os limites e como o resultado sera medido." },
  ];
  const blocks = criteria.map((criterion) => {
    const matches = sellerRows.filter((row) => criterion.signals.test(row.text));
    const negatives = criterion.negative ? sellerRows.filter((row) => criterion.negative!.test(row.text)) : [];
    const questionBonus = criterion.name === "Qualidade das perguntas" ? Math.min(4, sellerRows.filter((row) => row.text.includes("?")).length) : 0;
    const score = enoughEvidence ? Math.max(1, Math.min(10, 3 + matches.length * 2 + questionBonus - negatives.length * 3)) : null;
    const evidence = matches[0] ?? negatives[0];
    return { name: criterion.name, weight: criterion.weight, score, reason: score === null ? insufficient : matches.length ? `Foram encontradas ${matches.length} evidencia(s) explicita(s) deste comportamento.` : "A transcricao integral nao mostrou evidencia explicita deste comportamento.", what_worked: matches.length ? `Comportamento observado em ${matches.map((row) => row.timestamp).slice(0, 3).join(", ")}.` : insufficient, what_to_improve: criterion.improve, how_to_improve: "Pratique o exemplo, aplique em simulacao e compare o mesmo criterio na proxima call.", practical_example: criterion.example, excerpt: evidence ? `[${evidence.timestamp}] ${evidence.text}` : insufficient };
  });
  const evaluable = blocks.filter((block): block is typeof block & { score: number } => typeof block.score === "number");
  const totalWeight = evaluable.reduce((sum, block) => sum + block.weight, 0);
  const overall10 = totalWeight ? evaluable.reduce((sum, block) => sum + block.score * block.weight, 0) / totalWeight : 0;
  const descending = [...evaluable].sort((a, b) => b.score - a.score);
  const ascending = [...descending].reverse();
  const strengths = descending.filter((block) => block.score >= 6).slice(0, 3).map((block) => ({ title: block.name, evidence: block.excerpt, why_it_worked: block.reason, how_to_repeat: "Repita o comportamento e conecte-o ao proximo movimento da conversa." }));
  const improvements = ascending.slice(0, 3).map((block) => ({ title: block.name, error: block.reason, impact: "Esta lacuna reduz conversao e previsibilidade comercial.", how_to_fix: block.how_to_improve, prevention: block.what_to_improve, practical_example: block.practical_example }));
  const criticalMoments = blocks.filter((block) => block.excerpt !== insufficient).slice(0, 6).map((block) => ({ timestamp: block.excerpt.match(/^\[(\d{2,}:\d{2})\]/)?.[1] ?? "00:00", text: block.excerpt.replace(/^\[[^\]]+\]\s*/, ""), type: Number(block.score) >= 6 ? "positive" : "improvement", insight: `${block.name}: ${block.reason}`, recommendation: block.practical_example }));
  const topStrength = descending[0];
  const topGap = ascending[0];
  const questionCount = sellerRows.filter((row) => row.text.includes("?")).length;
  return {
    overall_score: Math.round(overall10 * 10),
    summary: enoughEvidence ? `A call recebeu ${overall10.toFixed(1)}/10 na matriz ponderada de 15 competencias, usando a transcricao integral e evidencias por criterio.` : insufficient,
    diagnosis: { executive_summary: enoughEvidence ? `Desempenho de ${overall10.toFixed(1)}/10. Principal forca: ${topStrength?.name}. Prioridade: ${topGap?.name}.` : insufficient, call_objective: "Nao identificado de forma segura na transcricao.", conversation_context: `${rows.length} falas processadas e ${questionCount} perguntas atribuidas ao vendedor.`, seller_conduction: seller ? `${seller.speaker} foi tratado como vendedor por concentrar perguntas e sinais comerciais.` : insufficient, overall_diagnosis: topGap ? `${topGap.name} e a prioridade de desenvolvimento.` : insufficient, missed_opportunities: topGap?.what_to_improve ?? insufficient, missing_questions: "Investigue impacto, custo da inacao, decisao, prazo e compromisso final.", objections_analysis: blocks.find((block) => block.name === "Tratamento de objecoes")?.reason ?? insufficient, better_approach: topGap?.practical_example ?? insufficient, professional_conclusion: "Compare os mesmos 15 criterios nas proximas calls para medir evolucao real." },
    strengths,
    improvements,
    competency_scores: blocks.map((block) => ({ name: block.name, score: block.score, explanation: block.reason, impact: `Peso de ${block.weight}% na nota.`, level: block.score === null ? "Nao avaliado" : block.score >= 8 ? "Avancado" : block.score >= 6 ? "Intermediario" : "Em desenvolvimento", gap: block.what_to_improve, next_step: block.practical_example })),
    next_actions: improvements.map((item, index) => ({ priority: `Prioridade ${index + 1}`, objective: item.title, practical_action: item.how_to_fix, exercise: item.practical_example, target: "Aplicar na proxima call", expected_result: "Gerar evidencia melhor no mesmo criterio." })),
    critical_moments: criticalMoments,
    evaluation_blocks: blocks,
    crm_report: { callData: { vendedor: seller?.speaker ?? "Nao identificado", lead_empresa: "Nao identificado", produto_servico: "Nao identificado", etapa_funil: "Nao identificada" }, temperature: { classification: "NAO IDENTIFICADA", justification: "Exige sinais concretos de urgencia, orcamento, autoridade e engajamento." }, conversationSummary: enoughEvidence ? `A transcricao integral foi processada em ${rows.length} falas. O relatorio preserva somente informacoes sustentadas pela conversa.` : insufficient, pains: /dor|problema|desafio|dificuldade/.test(normalized) ? ["Existe referencia explicita a problema ou desafio; consulte o trecho correspondente."] : ["Nao identificado"], objections: [], qualification: { orcamento: normalized.includes("orcamento") ? "Mencionado na call." : "Nao identificado", autoridade: /decisor|quem decide|aprova/.test(normalized) ? "Mencionada na call." : "Nao identificada", necessidade: /problema|desafio|dor/.test(normalized) ? "Sinalizada na call." : "Nao identificada", prazo_urgencia: /prazo|urgencia|data|trimestre/.test(normalized) ? "Sinalizado na call." : "Nao identificado" }, nextSteps: [], sellerObservations: "Nenhum dado foi inventado; ausencias foram marcadas como nao identificadas.", quickEvaluation: { score: Number(overall10.toFixed(1)), verdict: topGap ? `Prioridade de desenvolvimento: ${topGap.name}.` : insufficient } },
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
  if (!apiKey && !deepgramKey && !suppliedTranscript) {
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
- competency_scores com EXATAMENTE as mesmas 15 competencias de evaluation_blocks. Cada objeto deve conter name, score de 0 a 10, explanation, impact, level, gap e next_step;
- next_actions com EXATAMENTE 3 objetos contendo priority, objective, practical_action, exercise, target e expected_result;
- evaluation_blocks com EXATAMENTE 15 itens. Cada item deve ter name, weight, score de 0 a 10, reason, what_worked, what_to_improve, how_to_improve, practical_example e excerpt;
- use estes 15 criterios, nesta ordem e com estes pesos: Abertura (5); Rapport e adaptacao (5); Agenda e controle (5); Descoberta do contexto (10); Impacto e custo da inacao (10); Qualificacao (8); Escuta ativa (7); Qualidade das perguntas (7); Pitch contextual (8); Construcao de valor e prova (8); Tratamento de objecoes (8); Negociacao e protecao de margem (6); Fechamento (6); Proximo passo (5); Tom, postura e compliance (2).
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
Baseie-se SOMENTE na transcricao. Nunca invente dados, valores, combinacoes, falas ou timestamps. Quando nao houver evidencia suficiente para pontuar um criterio, use score null e escreva exatamente "Nao foi possivel avaliar este criterio com evidencia suficiente nesta ligacao.". Calcule a nota geral apenas com criterios avaliaveis, renormalizando os pesos.
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
