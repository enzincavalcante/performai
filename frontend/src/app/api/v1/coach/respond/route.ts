import { NextResponse } from "next/server";

type CoachLayer = {
  direct: string;
  hypotheses: string[];
  reasoning: string;
  action: string;
  question: string;
  options: string[];
  next: string[];
};
type CoachRequest = {
  message?: string;
  context?: { product?: string; customer?: string; stage?: string; objective?: string };
  history?: Array<{ role?: string; text?: string }>;
};
type GeminiPayload = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
type GatewayPayload = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

function parseLayer(raw: string): CoachLayer | null {
  try {
    const clean = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const value = JSON.parse(clean) as Partial<CoachLayer>;
    if (!value.direct?.trim()) return null;
    return {
      direct: value.direct.trim(),
      hypotheses: Array.isArray(value.hypotheses) ? value.hypotheses.filter(Boolean).slice(0, 4) : [],
      reasoning: value.reasoning?.trim() ?? "",
      action: value.action?.trim() ?? "",
      question: value.question?.trim() ?? "",
      options: Array.isArray(value.options) ? value.options.filter(Boolean).slice(0, 5) : [],
      next: Array.isArray(value.next) ? value.next.filter(Boolean).slice(0, 5) : [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: CoachRequest;
  try { body = await request.json() as CoachRequest; } catch { return NextResponse.json({ detail: "Solicitacao invalida." }, { status: 400 }); }
  const message = body.message?.replace(/\s+/g, " ").trim().slice(0, 3500) ?? "";
  if (!message) return NextResponse.json({ detail: "Escreva uma pergunta para o Coach." }, { status: 422 });

  const context = body.context ?? {};
  const history = (body.history ?? []).filter((item) => item.text?.trim()).slice(-10).map((item) => `${item.role === "coach" ? "COACH" : "VENDEDOR"}: ${item.text?.slice(0, 1200)}`).join("\n");
  const systemPrompt = `Voce e o Coach Comercial da Performa AI, um mentor senior de vendas B2B e B2C. Converse em portugues brasileiro natural, humano e profissional.

REGRAS OBRIGATORIAS:
- Responda DIRETAMENTE o que o usuario perguntou na primeira frase. Nunca desvie para uma pergunta generica.
- Leia o historico e mantenha continuidade. Nao repita recomendacoes ja dadas.
- Nao invente empresa, cliente, numeros, fatos ou resultados. Separe fatos, hipoteses e informacoes ausentes.
- Primeiro interprete a intencao: cumprimento, continuacao, duvida, problema, pedido de opiniao, ensino, analise ou negociacao.
- Se a mensagem for casual, responda de forma casual e curta. Nao transforme conversa simples em aula.
- Entenda girias, abreviacoes, erros de portugues, frases incompletas e audio transcrito sem corrigir o usuario.
- Se a pergunta estiver clara, responda sem pedir contexto antes. Se faltar algo decisivo, responda o que ja e possivel e faca no maximo UMA pergunta especifica ao final.
- Explique por que a recomendacao funciona e entregue uma acao ou frase aplicavel.
- Questione conclusoes ruins com respeito. Nao concorde automaticamente com desconto, culpa do cliente ou pressao artificial.
- Adapte a extensao e o tom automaticamente: pergunta simples pede resposta simples; caso complexo pede analise profunda. Acompanhe o nivel e a formalidade do usuario.
- Domine prospeccao, SDR, BDR, closer, SPIN, BANT, MEDDIC/MEDDPICC, discovery, pitch, demonstracao, objecoes, negociacao, follow-up, fechamento, CRM, pipeline, forecast, gestao, B2B, B2C, SaaS, outbound, inbound e social selling, mas use metodologia apenas quando ela resolver o caso.
- Nunca use frases vazias como "otima pergunta", "certamente" ou "com base nas informacoes fornecidas".
- Sugira opcoes clicaveis somente quando ajudarem a continuar, no maximo cinco.

CONTEXTO DISPONIVEL:
Oferta: ${context.product || "nao informada"}.
Publico: ${context.customer || "nao informado"}.
Etapa: ${context.stage || "nao informada"}.
Objetivo: ${context.objective || "nao informado"}.

Retorne SOMENTE JSON valido. Em resposta simples, reasoning, action, question, options e hypotheses podem ficar vazios. Em resposta complexa, use esses campos para permitir conteudo expansivel:
{"direct":"resposta direta e humana","hypotheses":["hipoteses somente se relevantes"],"reasoning":"explicacao especifica","action":"acao pratica ou exemplo de frase","question":"uma unica pergunta necessaria ou string vazia","options":["ate 5 respostas clicaveis, incluindo Outro - escrever resposta quando houver pergunta"],"next":["3 a 5 proximas acoes clicaveis"]}`;
  const prompt = `HISTORICO:\n${history || "Primeira mensagem."}\n\nMENSAGEM ATUAL:\n${message}`;
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || request.headers.get("x-vercel-oidc-token");
  const apiKey = process.env.GEMINI_API_KEY;

  if (gatewayToken) {
    try {
      const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${gatewayToken}`, "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.AI_GATEWAY_COACH_MODEL || "google/gemini-2.5-flash-lite", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.45, max_tokens: 1200 }),
        signal: AbortSignal.timeout(22_000),
      });
      const payload = await response.json() as GatewayPayload;
      const layer = parseLayer(payload.choices?.[0]?.message?.content ?? "");
      if (response.ok && layer) return NextResponse.json({ layer, provider: "vercel-ai-gateway" });
    } catch { /* Try the direct provider. */ }
  }

  if (apiKey) {
    for (const model of [process.env.GEMINI_COACH_MODEL, "gemini-2.5-flash-lite", "gemini-2.5-flash"].filter(Boolean) as string[]) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.45, maxOutputTokens: 1600 } }),
          signal: AbortSignal.timeout(22_000),
        });
        const payload = await response.json() as GeminiPayload;
        const layer = parseLayer(payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "");
        if (response.ok && layer) return NextResponse.json({ layer, provider: model });
        if (![404, 429].includes(response.status)) break;
      } catch { break; }
    }
  }

  return NextResponse.json({ detail: "O motor contextual esta temporariamente indisponivel." }, { status: 503 });
}
