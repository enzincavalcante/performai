import { NextResponse } from "next/server";

type StrategyRequest = {
  offer?: string;
  goal?: string;
  problem?: string;
  channel?: string;
  context?: string;
};

type StrategyPriority = {
  title: string;
  what: string;
  why: string;
  how: string;
  owner: string;
  cadence: string;
  resources: string;
  kpi: string;
  expectedImpact: string;
  review: string;
  risk: string;
};

type StrategyReport = {
  executiveSummary: string;
  currentState: string;
  desiredState: string;
  centralDiagnosis: string;
  bottlenecks: string[];
  opportunities: string[];
  strategicBridge: string;
  notNow: string;
  priorities: StrategyPriority[];
  plan7: string;
  plan30: string;
  plan90: string;
  dashboard: Array<{ group: string; indicators: string[] }>;
  governance: Array<{ cadence: string; focus: string; owner: string; decision: string }>;
  scaleCriteria: string[];
  conclusion: string;
};

type GatewayPayload = { choices?: Array<{ message?: { content?: string } }> };
type GeminiPayload = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

function meaningful(value: string) {
  const words = value.toLowerCase().match(/[a-z0-9À-ÿ]+/g) ?? [];
  return value.trim().length >= 45 && words.length >= 8 && new Set(words).size >= 6;
}

function parseReport(raw: string): StrategyReport | null {
  try {
    const clean = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const value = JSON.parse(clean) as Partial<StrategyReport>;
    if (!value.executiveSummary || !value.currentState || !value.desiredState || !value.strategicBridge || !Array.isArray(value.priorities) || value.priorities.length !== 3) return null;
    const priorities = value.priorities.map((item) => ({
      title: item.title?.trim(), what: item.what?.trim(), why: item.why?.trim(), how: item.how?.trim(), owner: item.owner?.trim(), cadence: item.cadence?.trim(), resources: item.resources?.trim(), kpi: item.kpi?.trim(), expectedImpact: item.expectedImpact?.trim(), review: item.review?.trim(), risk: item.risk?.trim(),
    }));
    if (priorities.some((item) => Object.values(item).some((field) => !field))) return null;
    return {
      executiveSummary: value.executiveSummary.trim(),
      currentState: value.currentState.trim(),
      desiredState: value.desiredState.trim(),
      centralDiagnosis: value.centralDiagnosis?.trim() || "Validar o diagnostico com dados do funil antes de escalar investimento.",
      bottlenecks: Array.isArray(value.bottlenecks) ? value.bottlenecks.filter(Boolean).slice(0, 4) : [],
      opportunities: Array.isArray(value.opportunities) ? value.opportunities.filter(Boolean).slice(0, 4) : [],
      strategicBridge: value.strategicBridge.trim(),
      notNow: value.notNow?.trim() || "Evitar ampliar investimento antes de comprovar a restricao principal.",
      priorities: priorities as StrategyPriority[],
      plan7: value.plan7?.trim() || "Medir a linha de base e validar o gargalo em uma amostra real.",
      plan30: value.plan30?.trim() || "Executar o teste prioritario, treinar o time e comparar os indicadores.",
      plan90: value.plan90?.trim() || "Padronizar o que funcionou e escalar com governanca.",
      dashboard: Array.isArray(value.dashboard) ? value.dashboard.filter((item) => item?.group && Array.isArray(item.indicators)).slice(0, 5) as StrategyReport["dashboard"] : [],
      governance: Array.isArray(value.governance) ? value.governance.filter((item) => item?.cadence && item?.focus && item?.owner && item?.decision).slice(0, 4) as StrategyReport["governance"] : [],
      scaleCriteria: Array.isArray(value.scaleCriteria) ? value.scaleCriteria.filter(Boolean).slice(0, 9) : [],
      conclusion: value.conclusion?.trim() || "Primeiro diagnosticar onde o sistema quebra, corrigir o comportamento associado, padronizar o que funciona e somente entao escalar com previsibilidade e margem.",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: StrategyRequest;
  try { body = await request.json() as StrategyRequest; } catch { return NextResponse.json({ detail: "Solicitacao invalida." }, { status: 400 }); }
  const context = body.context?.replace(/\s+/g, " ").trim().slice(0, 5000) ?? "";
  if (!body.offer || !body.goal || !body.problem || !body.channel || !meaningful(context)) {
    return NextResponse.json({ detail: "Ainda nao tenho informacao suficiente para montar uma estrategia realmente boa. Explique como a empresa vende hoje, onde esta travando e qual resultado deseja alcancar." }, { status: 422 });
  }

  const systemPrompt = `Voce e um consultor comercial senior. Produza uma estrategia especifica, executavel e fundamentada somente nos dados fornecidos. Nunca invente faturamento, equipe, conversao ou resultado.

Raciocine nesta ordem: diagnosticar -> corrigir -> padronizar -> escalar. Produza cenario atual, cenario desejado, diagnostico, tese, gargalos, oportunidades, ponte estrategica, exatamente tres prioridades, execucao 7/30/90 dias, dashboard executivo, governanca, criterios de escala e conclusao para o CEO.
Cada prioridade deve explicar o que fazer, por que, como executar em detalhes, quem deve liderar, cadencia, recursos, KPI, impacto esperado sem prometer resultado, momento de revisao e risco.
No dashboard, se nao houver dado ou meta, escreva "A definir apos diagnostico". Separe aquisicao, funil, vendas, gestao e economico. Na governanca, detalhe diario, semanal, quinzenal e mensal. Nunca trate hipotese como fato. Nao recomende simplesmente aumentar leads, investimento ou equipe antes de localizar a restricao comercial dominante.
Use toda a descricao da empresa. Se uma recomendacao servir para qualquer empresa, torne-a mais especifica. Escreva em portugues brasileiro executivo, claro e profundo.

Retorne SOMENTE JSON valido no formato:
{"executiveSummary":"resumo profissional em 2 ou 3 paragrafos","currentState":"situacao atual detalhada","desiredState":"cenario desejado detalhado","centralDiagnosis":"diagnostico central e tese estrategica","bottlenecks":["3 ou 4 gargalos"],"opportunities":["3 ou 4 oportunidades"],"strategicBridge":"ponte detalhada entre atual e desejado","notNow":"o que nao priorizar agora e por que","priorities":[{"title":"","what":"","why":"","how":"","owner":"","cadence":"","resources":"","kpi":"","expectedImpact":"","review":"","risk":""}],"plan7":"","plan30":"","plan90":"","dashboard":[{"group":"Aquisicao","indicators":["Leads: A definir apos diagnostico"]},{"group":"Funil","indicators":[]},{"group":"Vendas","indicators":[]},{"group":"Gestao","indicators":[]},{"group":"Economico","indicators":[]}],"governance":[{"cadence":"Diario","focus":"","owner":"","decision":""},{"cadence":"Semanal","focus":"","owner":"","decision":""},{"cadence":"Quinzenal","focus":"","owner":"","decision":""},{"cadence":"Mensal","focus":"","owner":"","decision":""}],"scaleCriteria":["criterios objetivos"],"conclusion":"conclusao executiva forte para o CEO"}`;
  const prompt = `OFERTA: ${body.offer}\nOBJETIVO: ${body.goal}\nPROBLEMA DECLARADO: ${body.problem}\nCANAL ATUAL: ${body.channel}\nDESCRICAO DA EMPRESA: ${context}`;
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || request.headers.get("x-vercel-oidc-token");
  const apiKey = process.env.GEMINI_API_KEY;

  if (gatewayToken) {
    try {
      const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${gatewayToken}`, "content-type": "application/json" }, body: JSON.stringify({ model: process.env.AI_GATEWAY_STRATEGY_MODEL || "google/gemini-2.5-flash", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], response_format: { type: "json_object" }, temperature: 0.35, max_tokens: 3800 }), signal: AbortSignal.timeout(28_000) });
      const payload = await response.json() as GatewayPayload;
      const report = parseReport(payload.choices?.[0]?.message?.content ?? "");
      if (response.ok && report) return NextResponse.json({ report, provider: "vercel-ai-gateway" });
    } catch { /* Try direct provider. */ }
  }

  if (apiKey) {
    for (const model of [process.env.GEMINI_STRATEGY_MODEL, "gemini-2.5-flash", "gemini-2.5-flash-lite"].filter(Boolean) as string[]) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.35, maxOutputTokens: 4200 } }), signal: AbortSignal.timeout(28_000) });
        const payload = await response.json() as GeminiPayload;
        const report = parseReport(payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "");
        if (response.ok && report) return NextResponse.json({ report, provider: model });
        if (![404, 429].includes(response.status)) break;
      } catch { break; }
    }
  }

  return NextResponse.json({ detail: "A IA estrategica esta temporariamente indisponivel. Use o plano profissional gerado pela plataforma e tente aprofundar novamente em instantes." }, { status: 503 });
}
