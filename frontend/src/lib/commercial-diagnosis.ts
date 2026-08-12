export const DIAGNOSIS_STORAGE_KEY = "performai_initial_diagnosis";

export type CommercialDiagnosisAnswers = {
  areas: string[];
  otherArea: string;
  problems: string[];
  otherProblem: string;
  priorities: string[];
  objective: string;
  otherObjective: string;
  role: string;
  teamSize: string;
  segment: string;
  commercialScore: number;
  mainDifficulty: string;
  offer: string;
  audience: string;
};

export type CommercialDiagnosis = CommercialDiagnosisAnswers & {
  createdAt: string;
  updatedAt: string;
  primaryBottleneck: string;
  secondaryBottlenecks: string[];
  impact: string;
  thesis: string;
  plan: Array<{ title: string; detail: string; moduleId: string; lesson: string }>;
  recommendedTraining: { moduleId: string; title: string; lesson: string };
  recommendedSimulation: { scenario: string; difficulty: string; clientType: string; context: string };
  mission: string;
  coachRecommendation: string;
};

type Recommendation = { moduleId: string; title: string; lesson: string; action: string };

const RECOMMENDATIONS: Array<[RegExp, Recommendation]> = [
  [/pitch|abordagem|comunica/, { moduleId: "pitch", title: "Pitch de Vendas", lesson: "Pitch consultivo", action: "Reconstrua a mensagem a partir do problema, impacto, valor e validacao." }],
  [/objec|resistencia/, { moduleId: "objecoes", title: "Contorno de Objecoes", lesson: "Diagnostico da objecao real", action: "Investigue a causa da resistencia antes de argumentar ou conceder." }],
  [/fech|proximo passo|follow.?up/, { moduleId: "fechamento", title: "Tecnicas de Fechamento", lesson: "Fechamento consultivo", action: "Transforme interesse em acao, responsavel, data e criterio de avanco." }],
  [/prospec|lead|oportunidade|marketing|conteudo/, { moduleId: "prospeccao", title: "Prospeccao Multicanal", lesson: "Estrategia outbound", action: "Aumente relevancia, qualidade do contato e taxa de resposta antes de ampliar volume." }],
  [/necessidade|discovery|diagnost|qualifica|convers/, { moduleId: "processo", title: "Processo Comercial Completo", lesson: "Diagnostico", action: "Padronize problema, impacto, urgencia, decisao e proximo passo." }],
  [/negocia|preco|margem/, { moduleId: "processo", title: "Processo Comercial Completo", lesson: "Negociacao", action: "Proteja valor e troque concessoes por compromissos verificaveis." }],
  [/processo|organiz|crm|acompanha/, { moduleId: "crm", title: "CRM e Pipeline", lesson: "Pipeline bem definido", action: "Defina etapas, criterios de avanco e governanca de proximo passo." }],
  [/produtiv|meta|resultado|consistencia/, { moduleId: "produtividade", title: "Produtividade Comercial", lesson: "Planejamento semanal", action: "Converta metas em comportamento, agenda, indicador e revisao semanal." }],
  [/gestao|lider|equipe|trein/, { moduleId: "fundamentos", title: "Fundamentos de Vendas", lesson: "Vendedores de alta performance", action: "Instale rotina de coaching baseada em evidencias e gaps reais." }],
  [/atendimento|cliente|retenc/, { moduleId: "atendimento", title: "Atendimento e Pos-venda", lesson: "Atendimento consultivo", action: "Padronize escuta, expectativa, primeiro valor e continuidade do relacionamento." }],
];

const DEFAULT_RECOMMENDATION: Recommendation = {
  moduleId: "processo",
  title: "Processo Comercial Completo",
  lesson: "Diagnostico",
  action: "Localize a etapa de maior perda antes de aumentar volume, investimento ou equipe.",
};

export const DIAGNOSIS_AREAS = [
  "Vendas", "Comercial", "Produtividade", "Prospeccao", "Conversao", "Negociacao", "Fechamento",
  "Atendimento ao cliente", "Gestao do time", "Marketing", "Publicacao de conteudo", "Processos internos",
  "Organizacao", "Lideranca", "Metas e resultados", "Outro",
];

export const DIAGNOSIS_PROBLEMS = [
  "Poucas vendas", "Poucos leads", "Leads ruins", "Baixa conversao", "Vendedores sem preparo",
  "Dificuldade para prospectar", "Dificuldade para abordar clientes", "Pitch de vendas fraco",
  "Dificuldade para identificar a necessidade do cliente", "Muitas objecoes", "Dificuldade para contornar objecoes",
  "Dificuldade para negociar", "Dificuldade para fechar vendas", "Follow-up ruim", "Falta de processo comercial",
  "Falta de organizacao", "Baixa produtividade", "Equipe desmotivada", "Metas nao sao atingidas",
  "Falta de acompanhamento da equipe", "Falta de treinamento", "Dificuldade para criar estrategias",
  "Marketing nao gera oportunidades", "Conteudo nao gera resultado", "Falta de consistencia nas publicacoes",
  "Nao sabemos exatamente onde estamos errando", "Outro",
];

export const DIAGNOSIS_OBJECTIVES = [
  "Vender mais", "Aumentar o faturamento", "Melhorar a conversao", "Conseguir mais clientes",
  "Treinar melhor meus vendedores", "Criar um processo comercial", "Melhorar meu time", "Aumentar produtividade",
  "Melhorar negociacao", "Melhorar fechamento", "Criar uma estrategia comercial", "Organizar a empresa",
  "Escalar a operacao", "Melhorar marketing e conteudo", "Outro objetivo",
];

export const EMPTY_DIAGNOSIS_ANSWERS: CommercialDiagnosisAnswers = {
  areas: [], otherArea: "", problems: [], otherProblem: "", priorities: [], objective: "", otherObjective: "",
  role: "", teamSize: "2-10 pessoas", segment: "SaaS / Tecnologia", commercialScore: 5, mainDifficulty: "",
  offer: "", audience: "",
};

export function recommendationFor(value: string): Recommendation {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return RECOMMENDATIONS.find(([pattern]) => pattern.test(normalized))?.[1] ?? DEFAULT_RECOMMENDATION;
}

export function buildCommercialDiagnosis(answers: CommercialDiagnosisAnswers, previousCreatedAt?: string): CommercialDiagnosis {
  const selectedProblems = answers.problems.map((item) => item === "Outro" ? answers.otherProblem : item).filter(Boolean);
  const priorities = answers.priorities.length ? answers.priorities : selectedProblems.slice(0, 3);
  const primary = priorities[0] || selectedProblems[0] || "Nao sabemos exatamente onde estamos errando";
  const recommendation = recommendationFor(primary);
  const objective = answers.objective === "Outro objetivo" ? answers.otherObjective || answers.objective : answers.objective;
  const now = new Date().toISOString();
  const uniquePlan = [...priorities, ...selectedProblems]
    .map((problem) => ({ problem, recommendation: recommendationFor(problem) }))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.recommendation.moduleId === item.recommendation.moduleId) === index)
    .slice(0, 5);

  return {
    ...answers,
    objective,
    priorities,
    createdAt: previousCreatedAt || now,
    updatedAt: now,
    primaryBottleneck: primary,
    secondaryBottlenecks: priorities.slice(1, 3),
    impact: `${primary} tende a reduzir qualidade, velocidade ou compromisso dentro do funil. A primeira decisao e comprovar em qual etapa a perda acontece antes de aumentar volume ou investimento.`,
    thesis: `A prioridade e diagnosticar a causa de ${primary.toLowerCase()}, corrigir o comportamento associado, padronizar o que funcionar e somente entao escalar.`,
    plan: uniquePlan.map(({ problem, recommendation: item }) => ({ title: item.action, detail: `Foco relacionado a: ${problem}. Acompanhe evidencia e evolucao semanal.`, moduleId: item.moduleId, lesson: item.lesson })),
    recommendedTraining: { moduleId: recommendation.moduleId, title: recommendation.title, lesson: recommendation.lesson },
    recommendedSimulation: {
      scenario: /prospec|abordagem|lead/i.test(primary) ? "Cold Call" : /objec/i.test(primary) ? "Objecoes" : /negocia/i.test(primary) ? "Negociacao" : /fech|follow/i.test(primary) ? "Fechamento" : "Discovery Call",
      difficulty: answers.commercialScore >= 8 ? "Especialista" : answers.commercialScore >= 6 ? "Dificil" : "Medio",
      clientType: /preco|negocia|objec/i.test(primary) ? "Cliente economico" : "Diretor Comercial",
      context: `Treinar ${primary.toLowerCase()} para ${answers.audience || "o publico informado"}, considerando ${answers.offer || "a oferta da empresa"}.`,
    },
    mission: `Conclua uma simulacao focada em ${primary.toLowerCase()} e alcance nota acima de 80, aplicando o comportamento recomendado.`,
    coachRecommendation: `Comece investigando a causa real de ${primary.toLowerCase()}. Use o Coach para preparar uma situacao concreta, praticar a resposta e revisar o raciocinio antes da proxima conversa.`,
  };
}

export function readCommercialDiagnosis(): CommercialDiagnosis | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(DIAGNOSIS_STORAGE_KEY) || "null") as CommercialDiagnosis | null; }
  catch { return null; }
}

export function diagnosisContext(diagnosis?: CommercialDiagnosis | null) {
  if (!diagnosis) return "";
  return `Diagnostico inicial: foco principal ${diagnosis.primaryBottleneck}; prioridades ${diagnosis.priorities.join(", ")}; objetivo ${diagnosis.objective}; cargo ${diagnosis.role}; time ${diagnosis.teamSize}; segmento ${diagnosis.segment}; nota percebida ${diagnosis.commercialScore}/10; dificuldade declarada ${diagnosis.mainDifficulty || "nao detalhada"}.`;
}
