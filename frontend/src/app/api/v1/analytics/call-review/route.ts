import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const DIRECT_UPLOAD_LIMIT = 4 * 1024 * 1024;

function extractJson(text: string) {
  const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const metadata = String(formData.get("metadata") ?? "{}");

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ detail: "Selecione uma gravacao valida." }, { status: 422 });
  }

  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  if (backendUrl) {
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

  if (audio.size > DIRECT_UPLOAD_LIMIT) {
    return NextResponse.json({
      detail: "Para gravacoes acima de 4 MB, configure BACKEND_API_URL com o servico de processamento privado.",
      code: "private_backend_required",
    }, { status: 413 });
  }

  const bytes = Buffer.from(await audio.arrayBuffer());
  const prompt = `Analise integralmente esta call de vendas em portugues brasileiro.
Considere os metadados: ${metadata.slice(0, 4000)}.
Retorne somente JSON com: overall_score de 0 a 100, summary, strengths,
improvements, competency_scores, next_actions, transcript e critical_moments.
Avalie abertura, rapport, pitch, descoberta, qualificacao, escuta ativa,
observacoes e sinais do cliente, postura do SDR ou closer, dominio do servico,
duvidas, objecoes, valor, negociacao, fechamento e proximo passo.
Cada critical_moment deve conter timestamp, speaker, quote, issue e recommendation.
Nao invente falas ou timestamps e seja conservador quando o audio nao permitir certeza.`;

  const model = process.env.GEMINI_CALL_REVIEW_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: audio.type || "audio/mpeg", data: bytes.toString("base64") } },
            { text: prompt },
          ],
        }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(290_000),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json({
      detail: "O Gemini nao conseguiu processar esta gravacao.",
      provider_status: response.status,
    }, { status: 502 });
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    return NextResponse.json({ detail: "A IA nao retornou um relatorio valido." }, { status: 502 });
  }

  try {
    return NextResponse.json({
      request_id: crypto.randomUUID(),
      status: "completed",
      processing: { mode: "vercel_direct", model },
      report: extractJson(text),
    });
  } catch {
    return NextResponse.json({ detail: "A IA retornou um relatorio fora do formato esperado." }, { status: 502 });
  }
}
