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
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function fallbackReply(message: string, turn: number, objection: string) {
  const text = normalize(message);
  const asksQuestion = message.includes("?");
  if (/ola|bom dia|boa tarde|tudo bem/.test(text) && turn <= 1) {
    return "Tudo bem. Tenho alguns minutos agora. O que voce gostaria de entender sobre a minha operacao antes de apresentar sua proposta?";
  }
  if (/preco|valor|investimento|desconto/.test(text)) {
    return "Antes de falar em desconto, eu preciso entender por que esse investimento vale mais do que as alternativas que ja estou avaliando. Que resultado concreto voce acredita que mudaria minha decisao?";
  }
  if (/resultado|impacto|roi|retorno|econom/.test(text)) {
    return asksQuestion
      ? "Hoje o maior impacto esta na previsibilidade e no tempo perdido pela equipe. Como voce comprovaria um ganho real sem prometer um numero que ainda nao conhece?"
      : "Esse resultado parece interessante, mas ainda esta generico para mim. Como ele se conecta ao problema que eu acabei de descrever?";
  }
  if (/reuniao|agenda|proximo passo|sexta|quinta|amanha/.test(text)) {
    return "Posso avaliar uma proxima conversa. Quem precisa participar, qual decisao vamos buscar e o que voce enviara antes da reuniao?";
  }
  if (asksQuestion) {
    return turn < 2
      ? "Meu principal problema e perder oportunidades por falta de acompanhamento e previsibilidade. O que voce precisa entender para saber se sua solucao realmente serve para isso?"
      : `Minha maior resistencia continua sendo ${objection.toLowerCase() || "o risco da mudanca"}. Como voce reduziria esse risco na pratica?`;
  }
  return "Entendi o que voce disse, mas ainda nao consigo relacionar isso com a minha prioridade. Faca uma pergunta sobre o impacto do problema antes de continuar o pitch.";
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
  const turn = (body.conversation ?? []).filter((item) => item.speaker === "seller").length;
  const apiKey = process.env.GEMINI_API_KEY;
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

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
      const payload = await response.json() as GatewayPayload;
      const reply = payload.choices?.[0]?.message?.content?.replace(/\s+/g, " ").trim();
      if (response.ok && reply) return NextResponse.json({ reply, provider: `vercel-ai-gateway:${gatewayModel}` });
    } catch {
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
        const reply = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").replace(/\s+/g, " ").trim();
        if (response.ok && reply) return NextResponse.json({ reply, provider: model });
        if (![404, 429].includes(response.status)) break;
      } catch {
        break;
      }
    }
  }

  return NextResponse.json({ reply: fallbackReply(message, turn, persona.objection ?? "risco da decisao"), provider: "performai-fallback" });
}
