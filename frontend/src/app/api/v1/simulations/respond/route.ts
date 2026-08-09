import { NextResponse } from "next/server";

type ConversationMessage = { speaker: "coach" | "seller"; text: string };
type SimulationRequest = {
  mode?: "training" | "mission";
  message?: string;
  conversation?: ConversationMessage[];
  persona?: {
    name?: string;
    role?: string;
    segment?: string;
    personality?: string;
    difficulty?: string;
    context?: string;
    objection?: string;
    objective?: string;
  };
};

type GeminiPayload = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type GatewayPayload = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string; code?: string };
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const has = (text: string, pattern: RegExp) => pattern.test(text);

function selectReply(options: string[], seed: string, previousReplies: string[]) {
  const available = options.filter((option) => !previousReplies.some((reply) => normalize(reply) === normalize(option)));
  const choices = available.length ? available : options;
  const hash = [...seed].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  return choices[hash % choices.length];
}

function fallbackReply(message: string, conversation: ConversationMessage[], persona: NonNullable<SimulationRequest["persona"]>) {
  const text = normalize(message);
  const turn = conversation.filter((item) => item.speaker === "seller").length;
  const previousSeller = [...conversation].reverse().find((item) => item.speaker === "seller")?.text ?? "";
  const previousReplies = conversation.filter((item) => item.speaker === "coach").map((item) => item.text);
  const asksQuestion = message.includes("?");
  const objection = persona.objection || "risco da mudanca";
  const segment = persona.segment || "minha empresa";
  const role = persona.role || "decisor";
  const context = persona.context || "esta conversa";
  const seed = `${text}:${turn}:${role}:${objection}`;
  const aggressive = has(normalize(`${persona.personality} ${persona.difficulty}`), /hostil|agressiv|impaciente|dificil|resistente/);

  if (previousSeller && normalize(previousSeller) === text) {
    return aggressive
      ? "Voce acabou de repetir a mesma coisa. Seja direto: o que muda para o meu negocio?"
      : "Essa parte eu entendi. Pode avancar e conectar sua proposta a um resultado concreto para a minha operacao?";
  }

  if (has(text, /\b(ola|oi|bom dia|boa tarde|boa noite|tudo bem)\b/) && turn <= 1) {
    return selectReply(aggressive ? [
      "Tudo certo. Tenho pouco tempo, entao va direto ao ponto: por que essa conversa merece minha atencao?",
      "Ola. Posso falar por alguns minutos, mas quero objetividade. O que voce precisa entender primeiro?",
    ] : [
      "Tudo bem. Tenho alguns minutos agora. Por onde voce gostaria de comecar?",
      "Ola, tudo certo. Antes de voce apresentar a solucao, o que gostaria de entender sobre a nossa operacao?",
      "Tudo bem, sim. Pode comecar, mas prefiro que voce entenda o contexto antes de falar da proposta.",
    ], seed, previousReplies);
  }

  if (has(text, /como (voces|voce)|processo|funciona hoje|atualmente|cenario atual|rotina/)) {
    return selectReply([
      `Hoje o processo em ${segment.toLowerCase()} depende muito de acompanhamento manual. Quando o volume aumenta, perdemos previsibilidade e algumas oportunidades ficam sem retorno.`,
      "Atualmente cada pessoa acompanha as oportunidades de um jeito. Eu consigo ver o resultado no fim do mes, mas nao enxergo cedo onde a venda esta travando.",
      `O principal problema em ${context.toLowerCase()} e a falta de consistencia. Algumas pessoas performam bem, mas eu nao consigo repetir o mesmo padrao no restante do time.`,
    ], seed, previousReplies);
  }

  if (has(text, /problema|dor|dificuldade|desafio|prioridade|preocupa/)) {
    return selectReply([
      "Minha prioridade e ter previsibilidade sem aumentar ainda mais a cobranca sobre o time. Hoje eu descubro os problemas tarde demais.",
      "O maior desafio e transformar boas conversas em avancos reais. O time fala bastante, mas nem sempre descobre a necessidade ou combina o proximo passo.",
      `Como ${role.toLowerCase()}, eu preciso reduzir o risco da decisao. O problema existe, mas uma implantacao confusa custaria mais do que continuar como estamos.`,
    ], seed, previousReplies);
  }

  if (has(text, /preco|valor|investimento|desconto|barat|caro|por cento|%/)) {
    return selectReply([
      "Preco importa, mas desconto sozinho nao resolve minha duvida. Que resultado concreto justifica esse investimento e como voce pretende medir isso?",
      `Eu ja estou comparando outras alternativas. Antes de negociar valor, mostre por que o risco de ${objection.toLowerCase()} fica menor com a sua proposta.`,
      "Se eu aprovar esse investimento, vou precisar defender o retorno internamente. Qual evidencia voce consegue apresentar sem prometer um numero que ainda nao conhece?",
    ], seed, previousReplies);
  }

  if (has(text, /resultado|impacto|roi|retorno|econom|ganho|receita|conversao/)) {
    return asksQuestion
      ? selectReply([
        "O maior impacto esta na previsibilidade e no tempo perdido pela equipe. Se conseguirmos enxergar os desvios antes, ja existe valor para mim.",
        "Uma oportunidade perdida por falta de acompanhamento pesa mais do que o custo da ferramenta. Mas eu preciso ver como voce provaria essa relacao.",
      ], seed, previousReplies)
      : selectReply([
        "Esse resultado parece interessante, mas ainda esta generico. Como ele se conecta ao problema que eu acabei de descrever?",
        "Voce falou de resultado, mas eu ainda nao vi prazo, indicador nem ponto de partida. O que exatamente mudaria primeiro?",
      ], seed, previousReplies);
  }

  if (has(text, /reuniao|agenda|proximo passo|sexta|quinta|amanha|segunda|marcar|agendar/)) {
    return selectReply([
      "Posso avaliar uma proxima conversa. Quem precisa participar, qual decisao vamos buscar e o que voce enviara antes da reuniao?",
      "Faz sentido avancar, desde que a proxima reuniao tenha uma pauta objetiva. Qual data, participante e resultado voce propoe?",
      "Tenho disponibilidade, mas nao quero outra reuniao apenas para ver uma apresentacao. O que vamos conseguir decidir nela?",
    ], seed, previousReplies);
  }

  if (asksQuestion) {
    if (turn < 2) return selectReply([
      "Meu principal problema e perder oportunidades por falta de acompanhamento e previsibilidade. O que mais voce precisa entender?",
      "Hoje a equipe tem atividade, mas pouca consistencia entre uma conversa e outra. Isso e suficiente para voce avaliar se existe aderencia?",
      `A necessidade existe, principalmente em ${segment.toLowerCase()}, mas eu ainda nao sei se a mudanca compensa o esforco.`,
    ], seed, previousReplies);
    return selectReply([
      `Minha maior resistencia continua sendo ${objection.toLowerCase()}. Como voce reduziria esse risco na pratica?`,
      "O que mais pesa para mim e a implantacao e a adesao do time. Como voce evitaria que isso virasse apenas mais uma ferramenta pouco usada?",
      "Eu vejo potencial, mas ainda preciso de um criterio seguro para decidir. Que evidencia voce sugere validar primeiro?",
    ], seed, previousReplies);
  }

  return selectReply(aggressive ? [
    "Isso ainda parece um discurso pronto. Relacione o que voce disse ao meu problema ou faca uma pergunta objetiva.",
    `Voce esta falando da sua solucao, mas nao respondeu ao risco de ${objection.toLowerCase()}. Por que eu deveria continuar ouvindo?`,
  ] : [
    "Entendi sua proposta, mas ainda nao consigo relaciona-la com a minha prioridade. O que voce precisa descobrir antes de continuar?",
    "Isso pode ser util, mas parece generico para o meu contexto. Qual parte do que eu disse levou voce a essa recomendacao?",
    `A ideia faz sentido, mas eu ainda vejo ${objection.toLowerCase()} como barreira. Como voce trataria isso sem apressar a decisao?`,
  ], seed, previousReplies);
}

export async function POST(request: Request) {
  let body: SimulationRequest;
  try {
    body = await request.json() as SimulationRequest;
  } catch {
    return NextResponse.json({ detail: "Corpo da solicitacao invalido." }, { status: 400 });
  }

  const message = body.message?.replace(/\s+/g, " ").trim().slice(0, 2500) ?? "";
  if (!message) return NextResponse.json({ detail: "Envie uma mensagem para continuar a simulacao." }, { status: 422 });

  const history = (body.conversation ?? [])
    .filter((item) => item && (item.speaker === "coach" || item.speaker === "seller") && item.text?.trim())
    .slice(-14)
    .map((item) => `${item.speaker === "seller" ? "VENDEDOR" : "CLIENTE"}: ${item.text.slice(0, 1800)}`)
    .join("\n");
  const persona = body.persona ?? {};
  const apiKey = process.env.GEMINI_API_KEY;
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || request.headers.get("x-vercel-oidc-token");
  let gatewayState = gatewayToken ? "configured" : "missing-token";
  let geminiState = apiKey ? "configured" : "missing-key";

  const systemPrompt = `Voce interpreta um cliente real em um treinamento de vendas. Fale somente como o cliente, nunca como coach ou assistente.
Persona: ${persona.name || "Cliente"}, ${persona.role || "decisor"}, segmento ${persona.segment || "nao informado"}.
Personalidade: ${persona.personality || "criterioso e objetivo"}. Dificuldade: ${persona.difficulty || "media"}.
Contexto: ${persona.context || "conversa comercial"}. Objecao principal: ${persona.objection || "risco da decisao"}. Objetivo do vendedor: ${persona.objective || "avancar a venda"}.

Regras obrigatorias:
- Leia a ultima fala e responda diretamente ao significado dela.
- Lembre do historico e nao repita perguntas ou frases ja usadas.
- Seja natural, humano e coerente com a persona; varie ritmo e vocabulario.
- Use no maximo 1 a 3 frases curtas e faca no maximo uma pergunta por resposta.
- Revele informacoes aos poucos. Crie objecoes ligadas ao que o vendedor falou, sem mudar de assunto.
- Se o vendedor fizer uma boa pergunta, responda com um detalhe concreto. Se fizer pitch generico, pressione por relevancia ou evidencia.
- Nao avalie, nao ensine, nao elogie a tecnica e nao mencione que e uma IA.`;
  const prompt = `HISTORICO DA CONVERSA:\n${history || "Sem historico anterior."}\n\nULTIMA FALA DO VENDEDOR:\n${message}\n\nResponda agora como o cliente.`;
  const configuredModel = process.env.GEMINI_SIMULATION_MODEL;
  const models = configuredModel ? [configuredModel] : ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"];

  if (gatewayToken) {
    const gatewayModel = process.env.AI_GATEWAY_SIMULATION_MODEL || "google/gemini-2.5-flash-lite";
    try {
      const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${gatewayToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: gatewayModel,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
          temperature: 0.72,
          max_tokens: 220,
          stream: false,
        }),
        signal: AbortSignal.timeout(18_000),
      });
      gatewayState = `http-${response.status}`;
      const payload = await response.json() as GatewayPayload;
      const reply = payload.choices?.[0]?.message?.content?.replace(/\s+/g, " ").trim();
      if (response.ok && reply) return NextResponse.json({ reply, provider: `vercel-ai-gateway:${gatewayModel}` });
    } catch {
      gatewayState = "network-error";
      // Continue to the provider key or deterministic fallback.
    }
  }

  if (apiKey) {
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.72, topP: 0.9, maxOutputTokens: 220 },
          }),
          signal: AbortSignal.timeout(18_000),
        });
        const payload = await response.json() as GeminiPayload;
        geminiState = `http-${response.status}`;
        const reply = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").replace(/\s+/g, " ").trim();
        if (response.ok && reply) return NextResponse.json({ reply, provider: model });
        if (![404, 429].includes(response.status)) break;
      } catch {
        geminiState = "network-error";
        break;
      }
    }
  }

  return NextResponse.json({
    reply: fallbackReply(message, body.conversation ?? [], persona),
    provider: `performai-fallback:gateway-${gatewayState};gemini-${geminiState}`,
  });
}
