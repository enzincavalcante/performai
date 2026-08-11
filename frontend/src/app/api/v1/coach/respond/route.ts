import { NextResponse } from "next/server";
import { classifyCoachIntent, localCoachResponse, sanitizeCoachLayer, type CoachContext, type CoachHistoryItem, type CoachLayer, type CoachMemory } from "@/lib/coach-brain";

type CoachRequest = { message?: string; context?: CoachContext; history?: CoachHistoryItem[]; memory?: CoachMemory };
type GeminiPayload = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
type GatewayPayload = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

function parseJson(raw: string) {
  try {
    const clean = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(clean) as Partial<CoachLayer>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: CoachRequest;
  try { body = await request.json() as CoachRequest; } catch { return NextResponse.json({ detail: "Solicitacao invalida." }, { status: 400 }); }
  const message = body.message?.replace(/\s+/g, " ").trim().slice(0, 5000) ?? "";
  if (!message) return NextResponse.json({ detail: "Escreva uma pergunta para o Coach." }, { status: 422 });

  const context = body.context ?? {};
  const history = (body.history ?? []).filter((item) => item.text?.trim()).slice(-30);
  const fallback = localCoachResponse(message, context, history, body.memory);
  const intent = classifyCoachIntent(message, history, body.memory);

  if (["incomplete", "greeting", "casual", "definition", "clarification", "example", "practice", "practice_answer"].includes(intent)) {
    return NextResponse.json({ layer: fallback, provider: "performai-coach-brain" });
  }

  const historyText = history.map((item) => `${item.role === "coach" ? "COACH" : "USUARIO"}: ${item.text?.slice(0, 1600)}`).join("\n");
  const memoryText = JSON.stringify(body.memory ?? {});
  const systemPrompt = `Voce e o Coach Comercial da Performa AI: professor, treinador e consultor senior de vendas B2B e B2C. Sua prioridade e entender a intencao real e responder exatamente ao que foi pedido.

PROCESSO INTERNO OBRIGATORIO:
1. Confirme a intencao classificada e leia todo o historico e a memoria.
2. Identifique a pergunta ou necessidade exata.
3. Responda primeiro. Nao abra com pergunta generica.
4. Ensine, analise, crie ou aprofunde somente na medida pedida.
5. Faca no maximo uma pergunta, apenas se ela melhorar decisivamente a proxima resposta.
6. Marque decisionRequired=true e gere options somente quando o usuario realmente precisar escolher entre caminhos explicitamente apresentados. Na maioria das respostas, decisionRequired=false e options=[].

REGRAS DE QUALIDADE:
- Nunca use "entendi seu ponto", "otima pergunta", "antes de responder" ou elogio vazio como template.
- Nao invente empresa, numeros, pesquisa, casos ou resultados.
- Nao repita perguntas respondidas no contexto ou no historico.
- Pergunta simples pede resposta simples. Pedido de aula pede principio, aplicacao, exemplo, erro comum e exercicio.
- Pedido de exemplo recebe exemplo. Pedido de criacao recebe uma primeira versao. Pedido de analise recebe criterio, pontos fortes, lacunas e versao melhor.
- Continuacao deve manter o assunto anterior. Conversa casual deve soar casual.
- Use Oferta, Publico, Etapa e Objetivo quando forem relevantes, sem forcar a mencao em toda resposta.
- Domine prospeccao, outbound, inbound, SDR, BDR, closer, ICP, persona, pitch, rapport, SPIN, BANT, MEDDIC, discovery, objecoes, follow-up, negociacao, fechamento, CRM, pipeline, forecast, metas, gestao, B2B, B2C, retencao, upsell, cross-sell e indicadores.
- Nunca diga que pesquisou se nenhuma ferramenta de pesquisa foi usada.

INTENCAO CLASSIFICADA: ${intent}
CONTEXTO COMERCIAL:
Oferta: ${context.product || "nao informada"}
Publico: ${context.customer || "nao informado"}
Etapa: ${context.stage || "nao informada"}
Objetivo: ${context.objective || "nao informado"}
MEMORIA DA SESSAO: ${memoryText}

Retorne SOMENTE JSON valido:
{"direct":"resposta direta e natural","reasoning":"explicacao ou principio quando necessario","action":"exemplo, aplicacao ou exercicio","question":"no maximo uma pergunta ou string vazia","hypotheses":[],"options":[],"next":[],"intent":"${intent}","decisionRequired":false}`;
  const prompt = `HISTORICO:\n${historyText || "Primeira mensagem."}\n\nMENSAGEM ATUAL:\n${message}`;
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || request.headers.get("x-vercel-oidc-token");
  const apiKey = process.env.GEMINI_API_KEY;

  if (gatewayToken) {
    try {
      const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${gatewayToken}`, "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.AI_GATEWAY_COACH_MODEL || "google/gemini-2.5-flash-lite", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.45, max_tokens: 2400 }),
        signal: AbortSignal.timeout(16_000),
      });
      const payload = await response.json() as GatewayPayload;
      const parsed = parseJson(payload.choices?.[0]?.message?.content ?? "");
      if (response.ok && parsed?.direct) return NextResponse.json({ layer: sanitizeCoachLayer(parsed, fallback), provider: "vercel-ai-gateway" });
    } catch { /* The local commercial brain remains available. */ }
  }

  if (apiKey) {
    for (const model of [process.env.GEMINI_COACH_MODEL, "gemini-2.5-flash-lite", "gemini-2.5-flash"].filter(Boolean) as string[]) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.45, maxOutputTokens: 2800 } }),
          signal: AbortSignal.timeout(16_000),
        });
        const payload = await response.json() as GeminiPayload;
        const parsed = parseJson(payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "");
        if (response.ok && parsed?.direct) return NextResponse.json({ layer: sanitizeCoachLayer(parsed, fallback), provider: model });
        if (![404, 429].includes(response.status)) break;
      } catch { break; }
    }
  }

  return NextResponse.json({ layer: fallback, provider: "performai-coach-brain-fallback" });
}
