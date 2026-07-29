import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ detail: "Transcricao nao configurada." }, { status: 503 });
  }

  const response = await fetch("https://api.deepgram.com/v1/auth/grant", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl_seconds: 600 }),
    cache: "no-store",
  });
  const payload = await response.json() as { access_token?: string; expires_in?: number };

  if (!response.ok || !payload.access_token) {
    return NextResponse.json({
      detail: "A chave de transcricao precisa da permissao Member para uploads grandes.",
    }, { status: 502 });
  }

  return NextResponse.json({
    token: payload.access_token,
    expires_in: payload.expires_in ?? 600,
  });
}
