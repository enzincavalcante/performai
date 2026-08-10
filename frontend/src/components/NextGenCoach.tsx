"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight, FileText,
  Flame,
  Gauge,
  Lightbulb,
  Mic,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import "./next-gen-coach.css";
import "./next-gen-coach-premium.css";
import "./next-gen-upgrades.css";
import { CallReview } from "./CallReview";
import { useSpeechToText } from "@/hooks/useSpeechToText";

type HubTab = "training" | "battle" | "replay" | "twin" | "doctor" | "career";
type ConversationMessage = { speaker: "coach" | "seller"; text: string };
type SimulationPersona = {
  name: string;
  role: string;
  segment: string;
  personality: string;
  difficulty: string;
  context: string;
  objection: string;
  objective: string;
};

const CLIENT_POOL = [
  { name: "Helena Prado", role: "CEO", company: "Norte Cloud", segment: "Tecnologia", personality: "Objetiva e orientada a ROI", difficulty: "Dificil", objection: "Retorno", visible: "Decisora final, pouco tempo e foco em impacto financeiro", hidden: "Precisa reduzir churn, mas so revela isso se o vendedor investigar consequencias e prioridade." },
  { name: "Camila Torres", role: "CFO", company: "Grupo Arco", segment: "Servicos", personality: "Racional e protetora de margem", difficulty: "Dificil", objection: "Preco", visible: "Controla o orcamento e exige previsibilidade", hidden: "Tem verba, mas testa se o vendedor concede desconto antes de construir valor." },
  { name: "Roberto Nunes", role: "Gerente de Operacoes", company: "Logvia", segment: "Logistica", personality: "Interessado, cauteloso e detalhista", difficulty: "Medio", objection: "Autoridade", visible: "Conhece o problema, mas nao aprova sozinho", hidden: "Pode virar aliado se receber uma justificativa segura para levar ao diretor." },
  { name: "Patricia Gomes", role: "Empresaria", company: "Vitta Mais", segment: "Saude", personality: "Desconfiada por uma experiencia ruim", difficulty: "Dificil", objection: "Risco", visible: "Interrompe promessas vagas e pede provas", hidden: "Quer mudar de fornecedor, mas teme outra implantacao fracassada." },
  { name: "Marcos Vieira", role: "Diretor Comercial", company: "Atlas Vendas", segment: "Educacao", personality: "Impaciente e competitivo", difficulty: "Extremo", objection: "Concorrente", visible: "Pressiona por preco e respostas curtas", hidden: "A prioridade real e padronizar o time; aceita pagar mais se o risco de adocao for reduzido." },
  { name: "Beatriz Melo", role: "Head de Marketing", company: "Onda Digital", segment: "Marketing", personality: "Receptiva e tecnica", difficulty: "Medio", objection: "Integracao", visible: "Faz muitas perguntas sobre implantacao", hidden: "Tem urgencia de 45 dias, mas so compartilha o prazo depois de uma pergunta de impacto." },
  { name: "Daniel Faria", role: "Fundador", company: "Prisma Tech", segment: "SaaS", personality: "Direto e avesso a conversa decorada", difficulty: "Dificil", objection: "Prioridade", visible: "Conhece solucoes concorrentes e questiona diferenciais", hidden: "O caixa permite a compra, mas a equipe esta sobrecarregada e teme a mudanca." },
  { name: "Ana Luiza Costa", role: "Gerente de Compras", company: "Nova Industria", segment: "Industria", personality: "Firme e orientada a processo", difficulty: "Medio", objection: "Condicoes", visible: "Compara propostas e exige criterios objetivos", hidden: "Nao e usuaria da solucao; precisa de evidencias para defender a escolha internamente." },
];

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function createBuyerReply(message: string, turn: number, scenario: string, objection: string, profile: string) {
  const text = normalizeText(message);
  const askedQuestion = message.includes("?");
  if (text.includes("desconto") || text.includes("%")) {
    return "Desconto ajuda, mas nao resolve minha duvida. Que resultado concreto justifica esse investimento e como voce mede isso?";
  }
  if (text.includes("reuniao") || text.includes("agenda") || text.includes("quinta") || text.includes("proximo passo")) {
    return turn < 2
      ? "Posso considerar essa conversa. Defina quem precisa participar, qual decisao vamos tomar e o que voce enviara antes da reuniao."
      : `O proximo passo esta claro. Antes de confirmar, como voce pretende reduzir o risco de ${objection.toLowerCase()} neste cenario?`;
  }
  if (text.includes("concorrent") || text.includes("alternativa atual")) {
    return "Ja temos um fornecedor e trocar gera risco. Nao quero uma comparacao de funcionalidades: qual criterio voce usaria para provar que a mudanca vale o esforco?";
  }
  if (text.includes("roi") || text.includes("resultado") || text.includes("impacto")) {
    if (!askedQuestion) return "Resultado e importante, mas isso ainda esta abstrato. Pode ligar essa promessa a um problema especifico da minha operacao?";
    return turn === 0
      ? "Hoje perdemos tempo com retrabalho e pouca previsibilidade. Preciso entender em quanto tempo eu veria mudanca e quem teria de participar."
      : "Se eu recuperasse duas oportunidades por mes, a conversa mudaria. Como voce provaria esse ganho sem prometer um numero que ainda nao conhece?";
  }
  if (askedQuestion) {
    if (turn === 0) return `O maior problema e a equipe perder oportunidades no acompanhamento. Como ${profile.toLowerCase()}, eu nao assumo um projeto no cenario de ${scenario.toLowerCase()} sem reduzir o risco.`;
    if (turn === 1) return `O impacto maior esta na previsibilidade da receita. Minha resistencia e ${objection.toLowerCase()}; o que voce precisa descobrir antes de defender sua proposta?`;
    return "Voce entendeu o problema. Agora quero objetividade: qual evidencia, prazo de validacao e compromisso voce propoe sem criar urgencia artificial?";
  }
  return turn === 0
    ? "Voce apresentou a solucao, mas ainda nao mostrou que entendeu meu contexto. Que pergunta faria para descobrir onde isso realmente afeta o negocio?"
    : turn === 1
      ? "Entendi a proposta, mas ainda nao vi prioridade nem seguranca para mudar. O que voce precisa validar comigo antes de continuar?"
      : "A conversa avancou, mas falta transformar valor em compromisso. Resuma o que entendeu e proponha uma acao concreta.";
}

async function requestBuyerReply(mode: "training" | "mission", message: string, conversation: ConversationMessage[], persona: SimulationPersona) {
  const response = await fetch("/api/v1/simulations/respond", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode, message, conversation, persona }),
  });
  const payload = await response.json() as { reply?: string; detail?: string };
  if (!response.ok || !payload.reply?.trim()) throw new Error(payload.detail || "A resposta do cliente falhou.");
  return payload.reply.trim();
}

const tabs: Array<{ id: HubTab; label: string; icon: typeof Bot }> = [
  { id: "training", label: "Treinar uma Venda", icon: Bot },
  { id: "battle", label: "Desafios Comerciais", icon: Trophy },
  { id: "career", label: "Minha Evolucao", icon: BarChart3 },
];

const missions = [
  ["Salve o negocio", "O cliente estava quase fechando, mas recebeu uma proposta 25% mais barata. Recupere a oportunidade sem guerra de preco.", "500 XP", "Dificil", "Concorrente 25% mais barato", "Concorrente", "Defender valor e reduzir risco sem conceder desconto.", "Nota 85 em valor, negociacao e protecao de margem."],
  ["Descubra a verdadeira objecao", "O cliente gostou, mas disse que vai pensar. Descubra o que realmente impede a compra.", "350 XP", "Medio", "Cliente quer pensar", "Sem urgencia", "Revelar a objecao oculta e construir um criterio de decisao.", "Nota 80 em escuta, descoberta e compromisso."],
  ["Chegue ao decisor", "Seu contato apoia a solucao, mas nao pode aprovar. Avance ate o decisor sem perder o aliado atual.", "450 XP", "Dificil", "Contato sem autoridade", "Sem autoridade", "Construir uma ponte segura ate quem decide.", "Nota 82 em qualificacao, influencia e proximo passo."],
  ["Venda sem dar desconto", "O cliente quer comprar, mas exige 20% de desconto. Preserve margem e mantenha a oportunidade viva.", "500 XP", "Dificil", "Exigencia de desconto", "Preco", "Negociar escopo, prazo e valor antes de mexer no preco.", "Nota 85 em negociacao e nenhuma concessao prematura."],
  ["Recupere o cliente", "O lead parou de responder depois da proposta. Crie um follow-up que reabra a conversa sem parecer insistente.", "400 XP", "Medio", "Silencio depois da proposta", "Sem urgencia", "Gerar uma resposta e definir se a oportunidade continua ativa.", "Nota 80 em relevancia, empatia e proximo passo."],
  ["Recuperacao de cliente perdido", "Reconstrua confianca depois de uma experiencia ruim e recupere a oportunidade.", "540 XP", "Dificil", "Cliente perdido por falha no atendimento", "Concorrente", "Reconhecer o erro, diagnosticar impacto e propor recuperacao segura.", "Nota 84 em empatia, responsabilidade e plano de recuperacao."],
  ["Cliente sem orcamento", "Crie valor e um caminho viavel sem empurrar desconto.", "550 XP", "Dificil", "Necessidade confirmada sem verba disponivel", "Preco", "Separar falta de verba, prioridade e percepcao de retorno.", "Nota 85 em qualificacao, valor e protecao de margem."],
  ["Inteligencia emocional", "Mantenha clareza diante de interrupcoes e respostas hostis.", "500 XP", "Dificil", "Cliente agressivo e impaciente", "Preco", "Regular o ritmo e recuperar uma conversa tensa.", "Nota 84 em postura, tom e controle da conversa."],
  ["Upsell baseado em resultado", "Amplie o contrato conectando a nova oferta ao resultado que o cliente ja conquistou.", "460 XP", "Avancado", "Expansao de conta ativa", "Sem urgencia", "Diagnosticar uma nova necessidade antes de oferecer o plano superior.", "Nota 82 em expansao, valor e timing comercial."],
  ["Cross-sell consultivo", "Apresente uma solucao complementar sem parecer uma venda forcada.", "430 XP", "Avancado", "Nova solucao para cliente atual", "Preco", "Conectar a oferta complementar a um problema real ainda nao resolvido.", "Nota 80 em descoberta, relevancia e proximo passo."],
];

const missionProfiles = [
  { client: "Helena Prado · CEO de SaaS", psychology: "Analitica, controladora e avessa a risco", story: "A diretoria adiou duas decisoes por medo de implantacao. Helena so avanca com compromisso claro, risco controlado e impacto financeiro." },
  { client: "Roberto Nunes · Diretor Industrial", psychology: "Inseguro, detalhista e avesso a arrependimento", story: "Roberto reconhece a necessidade, mas adia toda decisao por medo de escolher errado. Ele precisa construir seus proprios criterios de seguranca." },
  { client: "Camila Torres · CFO", psychology: "Racional, firme e orientada a margem", story: "Camila congelou novos investimentos e exigira comparacao entre custo, retorno e risco. Desconto precoce reduz sua confianca." },
  { client: "Marcos Vieira · VP Comercial", psychology: "Ocupado, competitivo e seletivo", story: "Marcos recebe dezenas de abordagens. Voce tem 60 segundos para provar relevancia e conquistar uma conversa maior." },
  { client: "Ana Luiza · Head de Operacoes", psychology: "Leal ao fornecedor atual e detalhista", story: "Ana usa o concorrente ha quatro anos. Ela reconhece problemas, mas teme o custo da mudanca." },
  { client: "Felipe Andrade · Fundador", psychology: "Frustrado, cauteloso e pragmatista", story: "Felipe cancelou depois de uma falha no atendimento e migrou para um concorrente. Responsabilidade e um plano concreto podem reabrir a oportunidade." },
  { client: "Patricia Gomes · Diretora de Receita", psychology: "Objetiva, pressionada por caixa e orientada a retorno", story: "Patricia confirmou o problema, mas nao possui verba aprovada neste trimestre. Ela diferencia vendedores consultivos de quem oferece desconto cedo demais." },
  { client: "Sergio Matos · Dono de rede varejista", psychology: "Hostil, emocional e pouco paciente", story: "Sergio teve uma experiencia ruim com outro fornecedor. Ele interrompe e testa a calma do vendedor." },
  { client: "Beatriz Melo · Gerente de Marketing", psychology: "Satisfeita, criteriosa e orientada a resultado", story: "Beatriz ja usa o produto basico e obteve resultado. Ela so amplia o contrato se a nova capacidade resolver uma prioridade comprovada." },
  { client: "Daniel Faria · Diretor de Operacoes", psychology: "Pratico, estrategico e avesso a venda forcada", story: "Daniel e cliente atual e tem outro problema operacional. A oferta complementar precisa surgir do diagnostico, nao de uma lista de produtos." },
];

const missionOpeners = [
  "Gostei da sua solucao, mas recebi uma proposta 25% mais barata. Sinceramente, nao sei como justificar essa diferenca para a diretoria.",
  "A apresentacao foi boa. Vou pensar com calma e depois te retorno.",
  "Eu gosto da ideia, mas quem aprova esse investimento e a diretora. Nao quero envolver ela antes de ter certeza.",
  "Podemos fechar, desde que voce reduza 20% do valor. Sem isso, nao consigo avancar.",
  "Recebi sua proposta. Agora estou sem tempo para olhar isso e prefiro retomar mais para frente.",
  "Eu ja tive uma experiencia ruim com voces. Por que deveria acreditar que desta vez sera diferente?",
  "A necessidade existe, mas nao temos verba neste trimestre. Nao adianta insistir.",
  "Se for demorar para explicar, pode encerrar. Eu quero saber o preco e pronto.",
  "O plano atual funciona. O que exatamente eu ganharia ampliando o contrato agora?",
  "Nao quero receber uma lista de outros produtos. Qual problema real voce acha que ainda existe aqui?",
];

const missionDecisions = [
  "Investigar quais criterios, alem do preco, definem a decisao",
  "Perguntar o que exatamente o cliente precisa pensar",
  "Construir com o contato uma pauta de valor para envolver o decisor",
  "Negociar escopo e contrapartidas antes de discutir preco",
  "Retomar a prioridade com uma evidencia curta e uma pergunta simples",
];

const replayMoments = [
  {
    time: "01:18",
    tone: "good",
    said: "Antes de explicar, quero entender como voces fazem isso hoje.",
    better:
      "Boa escolha. Um profissional de elite manteria a pergunta e acrescentaria: onde esse processo mais prejudica o resultado?",
    principle: "Escuta ativa e aprofundamento progressivo.",
  },
  {
    time: "04:42",
    tone: "warning",
    said: "Nossa plataforma tem dashboard, automacoes e varios relatorios.",
    better:
      "Pelo que voce descreveu, a automacao reduziria o retrabalho que hoje consome 12 horas da equipe. Isso resolveria a prioridade deste trimestre?",
    principle: "Valor contextual em vez de lista de funcionalidades.",
  },
  {
    time: "08:06",
    tone: "bad",
    said: "Posso dar 10% de desconto se fecharmos hoje.",
    better:
      "O que precisa estar claro para o investimento fazer sentido sem alterar o escopo?",
    principle: "Protecao de margem e negociacao por interesse.",
  },
];

export function NextGenCoach({ initialTab = "training" }: { initialTab?: HubTab }) {
  const [tab, setTab] = useState<HubTab>(initialTab);
  const [step, setStep] = useState<"setup" | "session" | "result">("setup");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [seed, setSeed] = useState(1);
  const [meeting, setMeeting] = useState({
    sellerCompany: "",
    company: "",
    industry: "Tecnologia",
    product: "",
    client: "",
    decisionMaker: "",
    goal: "Descoberta",
    stage: "Descoberta",
    dealValue: "",
    pains: "",
    objections: "",
    competitors: "",
    desiredResult: "",
    batna: "",
    limit: "",
  });
  const [planReady, setPlanReady] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [replayFile, setReplayFile] = useState("");
  const [missionStep, setMissionStep] = useState<"brief" | "session" | "result">("brief");
  const [missionMessage, setMissionMessage] = useState("");
  const [missionConversation, setMissionConversation] = useState<ConversationMessage[]>([]);
  const [buyerThinking, setBuyerThinking] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [missionThinking, setMissionThinking] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    sellerName: "",
    sellerRole: "",
    sellerExperience: "",
    sellerStrengths: "",
    sellerWeaknesses: "",
    product: "",
    objective: "Conquistar um proximo passo",
    clientName: "Ricardo",
    role: "Diretor Comercial",
    segment: "Tecnologia",
    difficulty: "Medio",
    context: "",
  });
  const customer = useMemo(() => CLIENT_POOL[seed % CLIENT_POOL.length], [seed]);
  const inferredProfile = customer.personality;
  const inferredObjection = customer.objection;

  const generateCustomer = () => {
    setClientLoading(true);
    setConversation([]);
    setMessage("");
    setStep("setup");
    window.setTimeout(() => { setSeed((value) => value + 1); setClientLoading(false); }, 420);
  };

  const startSession = () => {
    setConversation([
      {
        speaker: "coach",
        text: `Sou ${customer.name}, ${customer.role} da ${customer.company}. Tenho poucos minutos. Comece a conversa e me mostre por que vale a pena continuar.`,
      },
    ]);
    setStep("session");
  };
  const sendMessage = async (providedMessage?: string) => {
    const sellerMessage = (providedMessage ?? message).trim();
    if (!sellerMessage || buyerThinking) return;
    const turn = conversation.filter((item) => item.speaker === "seller").length;
    const history = conversation;
    setConversation((items) => [...items, { speaker: "seller", text: sellerMessage }]);
    setMessage("");
    setBuyerThinking(true);
    try {
      const reply = await requestBuyerReply("training", sellerMessage, history, {
        name: customer.name,
        role: customer.role,
        segment: customer.segment,
        personality: inferredProfile,
        difficulty: customer.difficulty,
        context: `${customer.hidden} Produto: ${trainingConfig.product || "nao informado"}. Vendedor: ${trainingConfig.sellerRole}, experiencia ${trainingConfig.sellerExperience || "nao informada"}. Objetivo: ${trainingConfig.objective}.`,
        objection: inferredObjection,
        objective: trainingConfig.objective,
      });
      setConversation((items) => [...items, { speaker: "coach", text: reply }]);
    } catch {
      setConversation((items) => [...items, {
        speaker: "coach",
        text: createBuyerReply(sellerMessage, turn, trainingConfig.context || "Conversa comercial", inferredObjection, inferredProfile),
      }]);
    } finally {
      setBuyerThinking(false);
    }
  };
  const evaluation = useMemo(() => {
    const sellerMessages = conversation.filter((item) => item.speaker === "seller");
    const combined = normalizeText(sellerMessages.map((item) => item.text).join(" "));
    const questions = sellerMessages.filter((item) => item.text.includes("?")).length;
    const hasValue = /(impacto|resultado|roi|econom|reduz|aument)/.test(combined);
    const hasNextStep = /(proximo passo|reuniao|agenda|quinta|sexta|data)/.test(combined);
    const base = Math.min(70, 48 + sellerMessages.length * 6);
    const discovery = Math.min(96, base + questions * 8);
    const value = Math.min(96, base + (hasValue ? 18 : 0));
    const closing = Math.min(96, base + (hasNextStep ? 20 : 0));
    const overall = Math.round((discovery + value + closing) / 3);
    const note = (score: number) => Number((Math.max(0, Math.min(100, score)) / 10).toFixed(1));
    return {
      overall,
      scores: [
        ["Abertura", note(base + 4)],
        ["Rapport e adaptacao", note(base + 2)],
        ["Agenda e controle", note(base + (sellerMessages.length > 2 ? 8 : 0))],
        ["Descoberta do contexto", note(discovery)],
        ["Impacto e custo da inacao", note(value)],
        ["Qualificacao", note(discovery - 6)],
        ["Escuta ativa", note(discovery + 3)],
        ["Qualidade das perguntas", note(base + questions * 9)],
        ["Pitch contextual", note(value + (hasValue ? 4 : 0))],
        ["Construcao de valor e prova", note(value)],
        ["Tratamento de objecoes", note(value + 2)],
        ["Negociacao e margem", note(value + (hasNextStep ? 8 : 1))],
        ["Fechamento", note(closing)],
        ["Proximo passo", note(closing + (hasNextStep ? 3 : -8))],
        ["Tom, postura e compliance", note(base + 10)],
      ] as Array<[string, number]>,
      headline: hasNextStep
        ? "Voce conduziu a conversa para um compromisso claro."
        : questions
          ? "Boa investigacao; falta transformar valor em um proximo passo."
          : "Sua proposta precisa partir de mais descoberta antes de avancar.",
      error: hasNextStep
        ? "O proximo passo apareceu, mas ainda faltou confirmar explicitamente quem decide e qual criterio comprovara o valor."
        : questions
          ? "Voce investigou o contexto, mas encerrou sem combinar responsavel, data e objetivo da proxima conversa."
          : "Voce apresentou a solucao antes de investigar o impacto e o criterio de decisao do cliente.",
      best: inferredObjection === "Preco"
        ? "Quando voce diz caro, esta comparando com o orcamento, com outra proposta ou com o retorno que espera gerar?"
        : `Antes de responder sobre ${inferredObjection.toLowerCase()}, qual risco ou criterio esta por tras dessa preocupacao?`,
      next: hasNextStep
        ? "Repita com dificuldade maior e valide o compromisso sem oferecer desconto."
        : "Repita o treino e termine com um proximo passo que tenha data, participantes e pauta.",
    };
  }, [conversation, inferredObjection]);

  const missionEvaluation = useMemo(() => {
    const seller = missionConversation.filter((item) => item.speaker === "seller");
    const combined = normalizeText(seller.map((item) => item.text).join(" "));
    const questions = seller.filter((item) => item.text.includes("?")).length;
    const valueSignals = (combined.match(/valor|impacto|resultado|risco|retorno|prioridade/g) ?? []).length;
    const nextStep = /proximo passo|agenda|reuniao|data|quinta|sexta|decis/.test(combined);
    const discount = /desconto|reduzir o preco|baixar o preco/.test(combined);
    const communication = Math.min(96, 58 + seller.length * 6);
    const discovery = Math.min(96, 52 + questions * 10);
    const value = Math.min(96, 54 + valueSignals * 7 - (discount ? 12 : 0));
    const objections = Math.min(96, 57 + questions * 5 + valueSignals * 4 - (discount ? 15 : 0));
    const negotiation = Math.min(96, 55 + valueSignals * 5 + (nextStep ? 9 : 0) - (discount ? 18 : 0));
    const closing = Math.min(96, 55 + (nextStep ? 28 : 0));
    const overall = Math.round((communication + discovery + value + objections + negotiation + closing) / 6);
    const decisive = seller.reduce((best, item) => item.text.length > best.length ? item.text : best, "");
    return { overall, communication, discovery, value, objections, negotiation, closing, questions, nextStep, discount, decisive };
  }, [missionConversation]);

  const sendMissionMessage = async (suggested?: string) => {
    const text = (suggested ?? missionMessage).trim();
    if (!text || selectedMission === null || missionThinking) return;
    const mission = missions[selectedMission];
    const turn = missionConversation.filter((item) => item.speaker === "seller").length;
    const history = missionConversation;
    const profile = missionProfiles[selectedMission];
    setMissionConversation((current) => [...current, { speaker: "seller", text }]);
    setMissionMessage("");
    setMissionThinking(true);
    try {
      const reply = await requestBuyerReply("mission", text, history, {
        name: profile.client.split(" · ")[0],
        role: profile.client.split(" · ")[1] || "Decisor",
        segment: mission[4],
        personality: profile.psychology,
        difficulty: mission[3],
        context: `${profile.story} ${mission[1]}`,
        objection: mission[5],
        objective: mission[6],
      });
      setMissionConversation((current) => [...current, { speaker: "coach", text: reply }]);
    } catch {
      setMissionConversation((current) => [...current, {
        speaker: "coach",
        text: createBuyerReply(text, turn, mission[4], mission[5], profile.psychology),
      }]);
    } finally {
      setMissionThinking(false);
    }
  };
  const trainingSpeech = useSpeechToText((text) => { void sendMessage(text); });
  const missionSpeech = useSpeechToText((text) => { void sendMissionMessage(text); });

  return (
    <div className="coach-hub">
      <header className="coach-hub-heading">
        <div>
          <p>PERFORMA AI · TREINO DE VENDAS IA</p>
          <h1>Pratique vendas com clientes simulados.</h1>
          <span>
            Configure uma situacao real, converse, receba nota e descubra exatamente o que melhorar.
          </span>
        </div>
        <div>
          <strong>Desempenho profissional</strong>
          <small>Ultima avaliacao · 8,1/10</small>
        </div>
      </header>
      <nav className="coach-tabs">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
              key={item.id}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {tab === "training" && (
        <section className="coach-core">
          {step === "setup" && (
            <>
              <div className="coach-section-title">
                <div>
                  <p>CLIENTE INFINITO</p>
                  <h2>Configure o treino. A IA cria o resto.</h2>
                </div>
                <button onClick={generateCustomer} disabled={clientLoading}>
                  <RefreshCw className={clientLoading ? "spin" : ""} /> {clientLoading ? "Criando novo cliente..." : "Gerar outro cliente"}
                </button>
              </div>
              <div className="customer-builder">
                <article className="generated-customer">
                  <span>
                    <UserRound />
                  </span>
                  <p>CLIENTE GERADO</p>
                  <h2>{clientLoading ? "Criando novo cliente..." : customer.name}</h2>
                  <strong>{customer.role} · {customer.company}</strong>
                  <dl>
                    <div>
                      <dt>Personalidade</dt>
                      <dd>{customer.personality}</dd>
                    </div>
                    <div>
                      <dt>Dificuldade</dt>
                      <dd>{customer.difficulty}</dd>
                    </div>
                    <div>
                      <dt>A IA cria automaticamente</dt>
                      <dd>Necessidades, intencoes e objecoes ocultas</dd>
                    </div>
                  </dl>
                </article>
                <div className="coach-config quick-training-config">
                  <header><span>CONFIGURACAO RAPIDA</span><h3>Responda uma opcao por pergunta.</h3><p>Clique na seta para abrir as alternativas. O cliente e o restante do cenario sao criados automaticamente.</p></header>
                  <label className="quick-select wide"><span>1. Qual e o seu cargo?</span><select value={trainingConfig.sellerRole} onChange={(event) => setTrainingConfig((current) => ({ ...current, sellerRole: event.target.value }))}><option value="">Escolha seu cargo</option><option>SDR</option><option>BDR</option><option>Closer</option><option>Executivo de Vendas</option><option>Vendedor</option><option>Gerente Comercial</option><option>Outro</option></select></label>
                  <label className="quick-select wide"><span>2. Qual e a sua experiencia em vendas?</span><select value={trainingConfig.sellerExperience} onChange={(event) => setTrainingConfig((current) => ({ ...current, sellerExperience: event.target.value }))}><option value="">Escolha sua experiencia</option><option>Iniciante</option><option>Intermediario</option><option>Avancado</option></select></label>
                  <label className="quick-select wide"><span>3. O que voce vende?</span><select value={trainingConfig.product} onChange={(event) => setTrainingConfig((current) => ({ ...current, product: event.target.value }))}><option value="">Escolha o tipo de oferta</option><option>SaaS</option><option>Servico</option><option>Produto fisico</option><option>Consultoria</option><option>Imoveis</option><option>Educacao</option><option>Financeiro</option><option>Outro</option></select></label>
                  {(trainingConfig.sellerRole === "Outro" || trainingConfig.product === "Outro") && <label className="wide">Outro - escrever resposta<input value={trainingConfig.context} onChange={(event) => setTrainingConfig((current) => ({ ...current, context: event.target.value }))} placeholder="Escreva seu cargo ou o que voce vende" /></label>}
                  <button className="start-coaching" onClick={startSession} disabled={!trainingConfig.sellerRole || !trainingConfig.sellerExperience || !trainingConfig.product || clientLoading}>
                    <Play /> Iniciar treino <ArrowRight />
                  </button>
                </div>
              </div>
            </>
          )}
          {step === "session" && (
            <div className="live-coaching">
              <aside>
                <span>
                  <UserRound />
                </span>
                <p>CLIENTE EM SIMULACAO</p>
                <h2>{customer.name}</h2>
                <strong>{customer.role} · {customer.personality}</strong>
                <div>
                  <i />
                  <span>Conversa ativa</span>
                  <b>06:42</b>
                </div>
                <small>
                  A personalidade e as objecoes mudam conforme suas respostas.
                </small>
              </aside>
              <main>
                <div className="live-transcript">
                  {conversation.map((item, index) => (
                    <article className={item.speaker} key={index}>
                      <small>
                        {item.speaker === "coach" ? customer.name : "Voce"}
                      </small>
                      <p>{item.text}</p>
                    </article>
                  ))}
                  {buyerThinking && <article className="coach ai-thinking" aria-live="polite"><small>{customer.name}</small><p><i /><i /><i /> Analisando o que voce disse...</p></article>}
                </div>
                <div className="inline-coach">
                  <Lightbulb />
                  <span>
                    <strong>Coach silencioso</strong>Explore impacto antes de
                    apresentar funcionalidades.
                  </span>
                </div>
                <form className="coach-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                  <button type="button" className={`speech-composer-button ${trainingSpeech.status}`} onClick={trainingSpeech.toggle} disabled={buyerThinking || trainingSpeech.status === "processing"} aria-label={trainingSpeech.status === "recording" ? "Parar gravacao" : "Falar sua resposta"} title={trainingSpeech.label}>
                    <Mic />
                  </button>
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Responda por texto ou use o microfone"
                    aria-label="Sua resposta ao cliente"
                    disabled={buyerThinking}
                  />
                  <button type="submit" disabled={!message.trim() || buyerThinking} aria-label="Enviar">
                    <Send />
                  </button>
                </form>
                {(trainingSpeech.error || trainingSpeech.status === "recording" || trainingSpeech.status === "processing") && <p className={`speech-composer-status ${trainingSpeech.status}`}><i />{trainingSpeech.error || trainingSpeech.label}</p>}
                <button
                  className="finish-session"
                  onClick={() => setStep("result")}
                  disabled={buyerThinking || conversation.filter((item) => item.speaker === "seller").length < 2}
                  title={conversation.filter((item) => item.speaker === "seller").length < 2 ? "Responda ao cliente pelo menos duas vezes" : undefined}
                >
                  Finalizar e receber avaliacao
                </button>
              </main>
            </div>
          )}
          {step === "result" && (
            <div className="coach-result">
              <header>
                <div>
                  <p>TREINO CONCLUIDO</p>
                  <h2>
                    {evaluation.headline}
                  </h2>
                </div>
                <strong>
                  {evaluation.overall}<small>/100</small>
                </strong>
              </header>
              <div className="coach-score-grid">
                {evaluation.scores.map(([label, score]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{score}/10</strong>
                    <div>
                      <i style={{ width: `${score * 10}%` }} />
                    </div>
                  </article>
                ))}
              </div>
              <div className="coach-result-columns">
                <article>
                  <ShieldAlert />
                  <h3>Maior erro</h3>
                  <p>
                    {evaluation.error}
                  </p>
                </article>
                <article>
                  <Sparkles />
                  <h3>Melhor resposta</h3>
                  <p>
                    &ldquo;{evaluation.best}&rdquo;
                  </p>
                </article>
                <article>
                  <Target />
                  <h3>Proxima acao</h3>
                  <p>
                    {evaluation.next}
                  </p>
                </article>
              </div>
              <footer>
                <button onClick={() => setTab("battle")}>
                  Ver desafios comerciais
                </button>
                <button onClick={() => setStep("setup")}>
                  <RefreshCw /> Treinar novamente
                </button>
              </footer>
            </div>
          )}
        </section>
      )}

      {tab === "battle" && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>DESAFIOS COMERCIAIS</p>
              <h2>Missoes profissionais com metas, niveis e recompensas.</h2>
            </div>
            <span className="daily-streak">
              <Flame /> 7 dias de sequencia
            </span>
          </div>
          {selectedMission !== null && (
            <div className="mission-room">
              <button className="mission-back" onClick={() => { setSelectedMission(null); setMissionStep("brief"); setMissionConversation([]); }}>Voltar aos desafios</button>
              <header><div><p>MISSAO {String(selectedMission + 1).padStart(2, "0")} · {missions[selectedMission][3]}</p><h2>{missions[selectedMission][0]}</h2><span>{missions[selectedMission][1]}</span></div><strong>{missions[selectedMission][2]}</strong></header>
              {missionStep === "brief" && <><div className="mission-story"><div><UserRound /><span><small>CLIENTE EXCLUSIVO</small><strong>{missionProfiles[selectedMission].client}</strong><p>{missionProfiles[selectedMission].psychology}</p></span></div><p>{missionProfiles[selectedMission].story}</p></div>
              <div className="mission-briefing"><article><Target /><h3>Objetivo exclusivo</h3><p>{missions[selectedMission][6]}</p></article><article><Gauge /><h3>Criterio de aprovacao</h3><p>{missions[selectedMission][7]}</p></article><article><Brain /><h3>Decisoes avaliadas</h3><p>Perguntas, construcao de valor, tratamento da resistencia e proximo passo.</p></article><article><Award /><h3>Recompensas</h3><p>{missions[selectedMission][2]}, moedas, medalha e pontos no ranking.</p></article></div>
              <button className="mission-start" onClick={() => {
                setMissionConversation([{ speaker: "coach", text: missionOpeners[selectedMission] }]);
                setMissionStep("session");
              }}><Play /> Aceitar missao</button></>}
              {missionStep === "session" && <div className="mission-session">
                <aside><UserRound /><small>CLIENTE DO DESAFIO</small><strong>{missionProfiles[selectedMission].client}</strong><p>{missionProfiles[selectedMission].psychology}</p><dl><div><dt>Objetivo</dt><dd>{missions[selectedMission][6]}</dd></div><div><dt>Dificuldade</dt><dd>{missions[selectedMission][3]}</dd></div><div><dt>Recompensa</dt><dd>{missions[selectedMission][2]}</dd></div></dl></aside>
                <main>
                  <div className="mission-transcript">{missionConversation.map((item, index) => <article className={item.speaker} key={index}><small>{item.speaker === "coach" ? missionProfiles[selectedMission].client.split(" · ")[0] : "Voce"}</small><p>{item.text}</p></article>)}{missionThinking && <article className="coach ai-thinking" aria-live="polite"><small>{missionProfiles[selectedMission].client.split(" · ")[0]}</small><p><i /><i /><i /> Preparando uma resposta realista...</p></article>}</div>
                  <div className="mission-decision-tip"><Lightbulb /><span><strong>Como voce quer avancar?</strong>Escolha uma estrategia ou escreva sua propria resposta.</span></div>
                  <div className="mission-decisions">{[
                    missionDecisions[selectedMission] ?? "Investigar o criterio de decisao antes de argumentar",
                    "Fazer uma pergunta para quantificar impacto e urgencia",
                    "Conectar valor a uma evidencia e confirmar entendimento",
                    "Propor um proximo passo com objetivo e responsavel",
                  ].map((choice, index) => <button type="button" disabled={missionThinking} onClick={() => sendMissionMessage(choice)} key={choice}><b>{String.fromCharCode(65 + index)}</b>{choice}</button>)}</div>
                  <form onSubmit={(event) => { event.preventDefault(); sendMissionMessage(); }}><button type="button" className={`mission-speech ${missionSpeech.status}`} onClick={missionSpeech.toggle} disabled={missionThinking || missionSpeech.status === "processing"} aria-label={missionSpeech.label}><Mic /></button><input value={missionMessage} onChange={(event) => setMissionMessage(event.target.value)} placeholder="Escreva ou fale sua resposta..." disabled={missionThinking} /><button disabled={!missionMessage.trim() || missionThinking}><Send /></button></form>
                  {(missionSpeech.error || missionSpeech.status === "recording" || missionSpeech.status === "processing") && <p className={`speech-composer-status mission-speech-status ${missionSpeech.status}`}><i />{missionSpeech.error || missionSpeech.label}</p>}
                  <button className="mission-finish" disabled={missionThinking || missionConversation.filter((item) => item.speaker === "seller").length < 3} onClick={() => setMissionStep("result")}>Finalizar desafio e receber nota</button>
                </main>
              </div>}
              {missionStep === "result" && <div className="mission-result"><header><div><small>MISSAO CONCLUIDA</small><h2>{missionEvaluation.overall >= 80 ? "Missao cumprida" : "Missao concluida com pontos para evoluir"}</h2><p>{missions[selectedMission][0]} · avaliacao exclusiva desta experiencia</p></div><strong>{missionEvaluation.overall}<span>/100</span></strong></header><div className="mission-result-scores">{[["Comunicacao", missionEvaluation.communication], ["Descoberta", missionEvaluation.discovery], ["Argumentacao", missionEvaluation.value], ["Objecoes", missionEvaluation.objections], ["Negociacao", missionEvaluation.negotiation], ["Fechamento", missionEvaluation.closing]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${value}%` }} /></i></article>)}</div><div className="mission-result-feedback"><article><CheckCircle2 /><div><strong>O que voce fez bem</strong><p>{missionEvaluation.questions > 1 ? "Voce usou perguntas para entender a resistencia antes de responder." : "Voce manteve a conversa ativa e apresentou sua linha de raciocinio."}</p></div></article><article><ShieldAlert /><div><strong>Onde voce perdeu pontos</strong><p>{missionEvaluation.discount ? "Houve concessao de preco antes de esgotar a construcao de valor." : !missionEvaluation.nextStep ? "Faltou transformar a conversa em um proximo passo com responsavel e data." : "Aprofunde impacto e criterio de decisao antes da proposta final."}</p></div></article><article><Target /><div><strong>Momento decisivo</strong><p>{missionEvaluation.decisive ? `Sua resposta com maior impacto foi: “${missionEvaluation.decisive}”` : "Faltou uma resposta completa que mudasse o rumo da negociacao."}</p></div></article><article><Sparkles /><div><strong>O que um vendedor de alta performance faria</strong><p>Validaria a resistencia, investigaria a causa, conectaria valor a uma evidencia e confirmaria uma acao verificavel.</p></div></article><article><Lightbulb /><div><strong>Proximo passo</strong><p>{missionEvaluation.nextStep ? "Repita a missao em nivel maior e preserve a mesma clareza no compromisso." : "Treine um fechamento com data, responsavel e objetivo da proxima conversa."}</p></div></article><article><Award /><div><strong>Recompensa</strong><p>{missionEvaluation.overall >= 80 ? `${missions[selectedMission][2]} · Missao concluida` : "60% do XP · repita para conquistar a recompensa completa"}</p></div></article></div><footer><button onClick={() => { setMissionStep("brief"); setMissionConversation([]); }}>Rever contexto</button><button onClick={() => { setMissionStep("session"); setMissionConversation([{ speaker: "coach", text: missionOpeners[selectedMission] }]); }}><RefreshCw /> Tentar novamente</button></footer></div>}
            </div>
          )}
          {selectedMission === null && <div className="battle-grid">
            {missions.map((mission, index) => (
              <article key={mission[0]}>
                <header>
                  <span>MISSÃO {String(index + 1).padStart(2, "0")}</span>
                  <b>{mission[3]}</b>
                </header>
                <Target />
                <h3>{mission[0]}</h3>
                <p>{mission[1]}</p>
                <footer>
                  <strong>{mission[2]}</strong>
                  <button
                    onClick={() => { setSelectedMission(index); setMissionStep("brief"); setMissionConversation([]); }}
                  >
                    Aceitar missao <ChevronRight />
                  </button>
                </footer>
              </article>
            ))}
          </div>}
        </section>
      )}

      {tab === "replay" && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>ANALISE INTELIGENTE DE VENDAS</p>
              <h2>Envie uma call e descubra exatamente onde evoluir.</h2>
            </div>
            <button>
              <Play /> Reproduzir coaching
            </button>
          </div>
          <CallReview />
          {false && <><div className="replay-upload">
            <FileText />
            <div><strong>{replayFile || "Selecione uma ligacao ou reuniao gravada"}</strong><span>Audio ou video · analise de fala, tom, estrutura, objecoes e fechamento.</span></div>
            <label><input type="file" accept="audio/*,video/*" onChange={(event) => setReplayFile(event.target.files?.[0]?.name || "")} />{replayFile ? "Trocar arquivo" : "Selecionar gravacao"}</label>
            <button disabled={!replayFile}><Sparkles /> Analisar com IA</button>
          </div>
          <div className="analysis-scope">{["Nota geral", "Tempo de fala", "Abertura", "Descoberta", "Rapport", "Solucao", "Objecoes", "Tom de voz", "Fechamento", "Plano de evolucao"].map((item) => <span key={item}><CheckCircle2 /> {item}</span>)}</div>
          <div className="heatmap">
            <div>
              {replayMoments.map((item) => (
                <button
                  className={item.tone}
                  style={{ width: "33.33%" }}
                  key={item.time}
                >
                  <span>{item.time}</span>
                </button>
              ))}
            </div>
            <small>Excelente</small>
            <small>Neutro</small>
            <small>Precisa melhorar</small>
          </div>
          <div className="replay-list">
            {replayMoments.map((item) => (
              <article key={item.time}>
                <span className={item.tone}>{item.time}</span>
                <div>
                  <small>O QUE VOCE DISSE</small>
                  <blockquote>{item.said}</blockquote>
                </div>
                <div>
                  <small>RESPOSTA TOP 1%</small>
                  <blockquote>{item.better}</blockquote>
                  <p>
                    <Brain /> {item.principle}
                  </p>
                </div>
              </article>
            ))}
          </div></>}
        </section>
      )}

      {tab === "twin" && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>SIMULADOR DE CLIENTES IA</p>
              <h2>Treine com compradores realistas, adaptativos e imprevisiveis.</h2>
            </div>
            <span className="twin-status">
              <i /> Atualizado com 18 sessoes
            </span>
          </div>
          <div className="twin-layout">
            <article className="twin-profile">
              <span>
                <Brain />
              </span>
              <h2>Enzo · Digital Twin v2.4</h2>
              <p>Perfil consultivo, comunicacao direta e ritmo acelerado.</p>
              <div>
                {[
                  ["Velocidade de fala", "Alta"],
                  ["Perguntas abertas", "Em evolucao"],
                  ["Escuta", "Intermediaria"],
                  ["Estilo de fechamento", "Direto"],
                  ["Confianca", "Alta"],
                ].map((item) => (
                  <span key={item[0]}>
                    <small>{item[0]}</small>
                    <strong>{item[1]}</strong>
                  </span>
                ))}
              </div>
            </article>
            <div className="pattern-list">
              {[
                [
                  "Padrao critico",
                  "Voce interrompe quando o cliente demora a responder.",
                  "Aguarde dois segundos antes da proxima pergunta.",
                ],
                [
                  "Oportunidade",
                  "Seu desempenho sobe 18% quando quantifica impacto.",
                  "Use uma pergunta numerica em toda descoberta.",
                ],
                [
                  "Risco recorrente",
                  "Voce evita aprofundar preco quando encontra resistencia.",
                  "Investigue referencia, impacto e prioridade antes de negociar.",
                ],
                [
                  "Evolucao",
                  "Sua escuta ativa melhorou em quatro semanas.",
                  "Mantenha o resumo de entendimento antes do pitch.",
                ],
              ].map((item, index) => (
                <article key={item[0]}>
                  <span>{index + 1}</span>
                  <div>
                    <small>{item[0]}</small>
                    <h3>{item[1]}</h3>
                    <p>{item[2]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "doctor" && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>ESTRATEGIAS COMERCIAIS</p>
              <h2>Diagnostique o gargalo e transforme analise em execucao.</h2>
              <span>Desenvolve a operacao comercial. Para desenvolver uma habilidade pessoal, use o Coach Comercial.</span>
            </div>
          </div>
          <div className="doctor-layout">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPlanReady(true);
              }}
            >
              <label>Contexto da oportunidade<textarea value={meeting.sellerCompany} onChange={(event) => setMeeting({ ...meeting, sellerCompany: event.target.value })} placeholder="O que voce vende, para qual empresa e em que estagio a negociacao esta" /></label>
              <label>Objetivo da reuniao<input value={meeting.goal} onChange={(event) => setMeeting({ ...meeting, goal: event.target.value })} placeholder="Ex.: validar proposta e combinar decisao" /></label>
              <label>Cliente e interesses<textarea value={meeting.pains} onChange={(event) => setMeeting({ ...meeting, pains: event.target.value })} placeholder="Decisor, prioridades, dores e criterios conhecidos" /></label>
              <label>Valor e limite negociavel<input value={meeting.limit} onChange={(event) => setMeeting({ ...meeting, limit: event.target.value })} placeholder="Preco-alvo, margem minima e o que nao pode ceder" /></label>
              <label>BATNA / melhor alternativa<textarea value={meeting.batna} onChange={(event) => setMeeting({ ...meeting, batna: event.target.value })} placeholder="O que voce fara se nao houver acordo" /></label>
              <label>Objecao principal<textarea value={meeting.objections} onChange={(event) => setMeeting({ ...meeting, objections: event.target.value })} placeholder="Qual resistencia precisa ser resolvida" /></label>
              <button disabled={!meeting.sellerCompany.trim() || !meeting.goal.trim()}>
                <Sparkles /> Preparar minha reuniao
              </button>
            </form>
            {planReady ? (
              <div className="meeting-plan">
                <header>
                  <CheckCircle2 />
                  <div>
                    <small>PLANO GERADO</small>
                    <h2>Plano de negociacao · {meeting.goal}</h2>
                  </div>
                </header>
                {[
                  ["1. Contexto", meeting.sellerCompany],
                  ["2. Objetivo verificavel", `${meeting.goal}. A conversa deve terminar com decisao, responsavel e data, nao apenas com a promessa de manter contato.`],
                  ["3. Interesses do cliente", meeting.pains || "Valide impacto, prioridade, risco percebido, criterio de decisao e custo da inacao antes de defender qualquer condicao."],
                  ["4. BATNA e limite", `${meeting.batna || "Defina sua melhor alternativa caso nao haja acordo."} ${meeting.limit ? `Limite declarado: ${meeting.limit}.` : "Defina margem minima e condicoes inegociaveis."}`],
                  ["5. Estrategia recomendada", `Negocie por interesses: reconheca ${meeting.objections || "a resistencia principal"}, esclareca a causa, quantifique valor e troque cada concessao por uma contrapartida. A ZOPA existe somente entre seu limite e o maximo sustentavel para o cliente; valide esse intervalo.`],
                  ["6. Proximo movimento", "Recapitule o diagnostico em ate 40 segundos, confirme a leitura, trate apenas a objecao decisiva e proponha uma acao com data. Condicione qualquer desconto a prazo, volume, escopo ou compromisso formal."],
                  ["7. Linguagem sugerida", `\"Entendi que o ponto central e ${meeting.objections || "reduzir o risco da decisao"}. Antes de alterar a condicao, quero confirmar o impacto e o criterio de escolha. Se ajustarmos uma parte, qual compromisso concreto voces assumem em contrapartida?\"`],
                ].map((item) => (
                  <article key={item[0]}>
                    <strong>{item[0]}</strong>
                    <p>{item[1]}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="doctor-empty">
                <BriefcaseBusiness />
                <h2>Seu plano aparecera aqui.</h2>
                <p>
                  Preencha seis pontos essenciais para receber uma estrategia direta, com BATNA, limite, ZOPA, concessoes condicionais e proximo movimento.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "career" && !showWeeklyReview && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>PAINEL DE EVOLUCAO PROFISSIONAL</p>
              <h2>Sua evolucao, competencias e proximos niveis em um so lugar.</h2>
            </div>
            <button onClick={() => setShowWeeklyReview(true)}>
              <Award /> Revisao semanal
            </button>
          </div>
          <div className="career-hero">
            <div>
              <small>NIVEL PROFISSIONAL ESTIMADO</small>
              <h2>Closer Intermediario</h2>
              <p>
                Seu historico mostra consistencia em comunicacao e uma lacuna prioritaria em protecao de valor.
              </p>
              <div>
                <i style={{ width: "72%" }} />
              </div>
            </div>
            <Gauge />
          </div>
          <div className="career-grid">
            {[
              ["Comunicacao", "+14%", "88"],
              ["Descoberta", "+21%", "81"],
              ["Confianca", "+9%", "86"],
              ["Objecoes", "+6%", "72"],
              ["Fechamento", "+11%", "77"],
            ].map((item) => (
              <article key={item[0]}>
                <span>{item[0]}</span>
                <strong>{item[2]}</strong>
                <small>{item[1]} em 30 dias</small>
              </article>
            ))}
          </div>
          <div className="weekly-plan">
            <header>
              <div>
                <p>PLANO PERSONALIZADO · ESTA SEMANA</p>
                <h2>Proteja valor durante objecoes.</h2>
              </div>
              <strong>3 de 7 atividades</strong>
            </header>
            {[
              "Aula: diagnostico da objecao real",
              "Battle: venda sem desconto",
              "Replay: revisar momento 08:06",
              "Playbook: matriz de objecoes",
              "Simulacao com CFO",
              "Exercicio: 20 decisoes de negociacao",
              "Call real para validacao",
            ].map((item, index) => (
              <button className={index < 3 ? "done" : ""} key={item}>
                {index < 3 ? <CheckCircle2 /> : <span>{index + 1}</span>}
                <strong>{item}</strong>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}

      {tab === "career" && showWeeklyReview && (
        <section className="weekly-review-page">
          <div className="coach-section-title">
            <div><p>REVISAO SEMANAL</p><h2>Uma leitura completa da sua semana comercial.</h2></div>
            <button onClick={() => setShowWeeklyReview(false)}><RefreshCw /> Voltar para minha evolucao</button>
          </div>
          <div className="weekly-review-summary">
            <article><small>MEDIA DA SEMANA</small><strong>8,1</strong><span>+0,6 comparado a semana anterior</span></article>
            <article><small>TREINOS CONCLUIDOS</small><strong>4</strong><span>3 simulacoes e 1 exercicio</span></article>
            <article><small>CALLS AVALIADAS</small><strong>3</strong><span>2 discovery e 1 negociacao</span></article>
            <article><small>FOCO PRIORITARIO</small><strong>7,2</strong><span>Objecoes e protecao de margem</span></article>
          </div>
          <div className="weekly-review-grid">
            <article><small>AVANCOS COMPROVADOS</small><h3>Descoberta mais profunda</h3><p>Voce passou a investigar impacto e urgencia antes do pitch. Em duas calls, o cliente verbalizou o custo da inacao, criando base concreta para valor.</p></article>
            <article><small>PADRAO DE RISCO</small><h3>Concessao antes da contrapartida</h3><p>Em momentos de resistencia a preco, voce oferece flexibilidade cedo demais. Isso reduz poder de negociacao e enfraquece a percepcao de valor.</p></article>
            <article><small>MELHOR MOMENTO</small><h3>Call de descoberta · 04:18</h3><p>“Se nada mudar neste trimestre, qual impacto isso gera na meta?” A pergunta conectou o problema ao resultado e melhorou a qualidade da conversa.</p></article>
            <article><small>MOMENTO DE ATENCAO</small><h3>Negociacao · 08:06</h3><p>“Posso dar 10% de desconto.” Melhor resposta: “Antes de alterar a condicao, qual criterio ainda impede a decisao?”</p></article>
          </div>
          <div className="weekly-action-plan">
            <header><div><p>PLANO DE DESENVOLVIMENTO</p><h2>As cinco acoes da proxima semana.</h2></div><strong>Prazo: sexta-feira</strong></header>
            {["Concluir aula sobre diagnostico da objecao real", "Responder 20 cenarios de negociacao", "Realizar duas simulacoes sem oferecer desconto", "Revisar uma call real e marcar tres momentos criticos", "Aplicar uma concessao condicional em conversa supervisionada"].map((item, index) => <button key={item}><span>{index + 1}</span><strong>{item}</strong><ChevronRight /></button>)}
          </div>
        </section>
      )}
    </div>
  );
}
