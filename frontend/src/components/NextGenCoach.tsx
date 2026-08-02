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
import { CallReview } from "./CallReview";

type HubTab = "training" | "battle" | "replay" | "twin" | "doctor" | "career";
type ConversationMessage = { speaker: "coach" | "seller"; text: string };

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

const tabs: Array<{ id: HubTab; label: string; icon: typeof Bot }> = [
  { id: "training", label: "Treinar uma Venda", icon: Bot },
  { id: "battle", label: "Desafios Comerciais", icon: Trophy },
  { id: "doctor", label: "Estrategia de Negociacao", icon: BriefcaseBusiness },
  { id: "career", label: "Minha Evolucao", icon: BarChart3 },
];

const missions = [
  ["Fechamento com decisor", "Conquiste um proximo passo com data, pauta e participantes.", "600 XP", "Elite", "Fechamento sem urgencia", "Sem urgencia", "Confirmar decisao e compromisso sem pressao artificial.", "Nota 85, resumo final e proximo passo completo."],
  ["Cliente indeciso", "Conduza um comprador inseguro ate um criterio claro de decisao.", "440 XP", "Avancado", "Cliente interessado e indeciso", "Sem urgencia", "Descobrir o medo real e construir seguranca sem pressionar.", "Nota 80 em escuta, clareza e compromisso."],
  ["Objecao de preco", "Proteja margem e reconstrua valor sem oferecer desconto.", "520 XP", "Dificil", "Negociacao de preco", "Preco", "Diagnosticar a causa real antes de argumentar.", "Nota 82 em objecoes e nenhuma concessao prematura."],
  ["Prospeccao em 60 segundos", "Ganhe permissao para continuar sem usar um pitch generico.", "420 XP", "Avancado", "Primeiro contato com executivo", "Sem urgencia", "Gerar relevancia e curiosidade em uma abertura curta.", "Nota 80 em clareza, autoridade e proximo passo."],
  ["Negociacao com concorrente", "Crie contraste sem atacar a solucao atual do cliente.", "480 XP", "Avancado", "Concorrente ja contratado", "Concorrente", "Reenquadrar criterios de decisao e custo de permanencia.", "Nota 82 em valor, negociacao e postura consultiva."],
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

export function NextGenCoach() {
  const [tab, setTab] = useState<HubTab>("training");
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
  });
  const [planReady, setPlanReady] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [replayFile, setReplayFile] = useState("");
  const [missionStep, setMissionStep] = useState<"brief" | "session" | "result">("brief");
  const [missionMessage, setMissionMessage] = useState("");
  const [missionConversation, setMissionConversation] = useState<ConversationMessage[]>([]);
  const [trainingConfig, setTrainingConfig] = useState({
    clientName: "",
    company: "",
    segment: "Tecnologia B2B",
    size: "51 a 200 funcionarios",
    role: "CEO",
    profile: "CEO impaciente",
    scenario: "Descoberta com decisor cetico",
    difficulty: "Avancado",
    sellerCompany: "",
    offer: "",
    objective: "Entender a necessidade e conquistar um proximo passo",
    objection: "Preco",
    context: "",
  });
  const customer = useMemo(
    () => ({
      name: trainingConfig.clientName || ["Roberto Almeida", "Camila Nunes", "Marcos Ferraz"][seed % 3],
      role: trainingConfig.role || ["CEO", "Diretora Financeira", "Gerente de Operacoes"][seed % 3],
      company: trainingConfig.company || ["Atlas Logistica", "Nexa Tecnologia", "Grupo Horizonte"][seed % 3],
      personality: [
        "Direto e impaciente",
        "Analitica e desconfiada",
        "Competitivo e exigente",
      ][seed % 3],
    }),
    [seed, trainingConfig.clientName, trainingConfig.company, trainingConfig.role],
  );

  const startSession = () => {
    setConversation([
      {
        speaker: "coach",
        text: `Sou ${customer.name}, ${customer.role} da ${customer.company}. ${trainingConfig.context ? `${trainingConfig.context} ` : ""}Tenho poucos minutos. Voce quer conversar sobre ${trainingConfig.offer}. Por que isso merece minha atencao agora e como isso se conecta ao meu contexto?`,
      },
    ]);
    setStep("session");
  };
  const sendMessage = () => {
    if (!message.trim()) return;
    const sellerMessage = message.trim();
    const turn = conversation.filter((item) => item.speaker === "seller").length;
    setConversation((items) => [
      ...items,
      { speaker: "seller", text: sellerMessage },
      {
        speaker: "coach",
        text: createBuyerReply(
          sellerMessage,
          turn,
          trainingConfig.scenario,
          trainingConfig.objection,
          trainingConfig.profile,
        ),
      },
    ]);
    setMessage("");
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
    return {
      overall,
      scores: [
        ["Comunicacao", Math.min(94, base + 12)],
        ["Descoberta", discovery],
        ["Perguntas", Math.min(96, base + questions * 9)],
        ["Argumentacao", Math.min(94, value + (hasValue ? 4 : 0))],
        ["Objecoes", Math.min(92, value + 2)],
        ["Negociacao", Math.min(94, value + (hasNextStep ? 8 : 1))],
        ["Fechamento", closing],
        ["Escuta", Math.min(94, discovery + 3)],
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
      best: trainingConfig.objection === "Preco"
        ? "Quando voce diz caro, esta comparando com o orcamento, com outra proposta ou com o retorno que espera gerar?"
        : `Antes de responder sobre ${trainingConfig.objection.toLowerCase()}, qual risco ou criterio esta por tras dessa preocupacao?`,
      next: hasNextStep
        ? "Repita com dificuldade maior e valide o compromisso sem oferecer desconto."
        : "Repita o treino e termine com um proximo passo que tenha data, participantes e pauta.",
    };
  }, [conversation, trainingConfig.objection]);

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
    const closing = Math.min(96, 55 + (nextStep ? 28 : 0));
    const overall = Math.round((communication + discovery + value + objections + closing) / 5);
    return { overall, communication, discovery, value, objections, closing, questions, nextStep, discount };
  }, [missionConversation]);

  const sendMissionMessage = () => {
    if (!missionMessage.trim() || selectedMission === null) return;
    const text = missionMessage.trim();
    const mission = missions[selectedMission];
    const turn = missionConversation.filter((item) => item.speaker === "seller").length;
    const reply = createBuyerReply(text, turn, mission[4], mission[5], missionProfiles[selectedMission].psychology);
    setMissionConversation((current) => [...current, { speaker: "seller", text }, { speaker: "coach", text: reply }]);
    setMissionMessage("");
  };

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
          <strong>2.840 XP</strong>
          <small>Nivel 12 · Closer Intermediario</small>
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
                <button onClick={() => setSeed((value) => value + 1)}>
                  <RefreshCw /> Gerar outro cliente
                </button>
              </div>
              <div className="customer-builder">
                <article className="generated-customer">
                  <span>
                    <UserRound />
                  </span>
                  <p>CLIENTE GERADO</p>
                  <h2>{customer.name}</h2>
                  <strong>
                    {trainingConfig.profile} · {customer.company}
                  </strong>
                  <dl>
                    <div>
                      <dt>Personalidade</dt>
                      <dd>{trainingConfig.profile}</dd>
                    </div>
                    <div>
                      <dt>Experiencia</dt>
                      <dd>Comprador experiente</dd>
                    </div>
                    <div>
                      <dt>Orcamento</dt>
                      <dd>Restrito e nao confirmado</dd>
                    </div>
                    <div>
                      <dt>Objetivo oculto</dt>
                      <dd>Reduzir risco da decisao</dd>
                    </div>
                  </dl>
                </article>
                <div className="coach-config">
                  <label>
                    Nome do cliente
                    <input value={trainingConfig.clientName} onChange={(event) => setTrainingConfig((current) => ({ ...current, clientName: event.target.value }))} placeholder="Ex.: Roberto Almeida" />
                  </label>
                  <label>
                    Empresa do cliente
                    <input value={trainingConfig.company} onChange={(event) => setTrainingConfig((current) => ({ ...current, company: event.target.value }))} placeholder="Ex.: Atlas Logistica" />
                  </label>
                  <label>
                    Segmento
                    <select value={trainingConfig.segment} onChange={(event) => setTrainingConfig((current) => ({ ...current, segment: event.target.value }))}>
                      <option>Tecnologia B2B</option>
                      <option>Servicos</option>
                      <option>Varejo</option>
                      <option>Industria</option>
                      <option>Saude</option>
                    </select>
                  </label>
                  <label>
                    Porte da empresa
                    <select value={trainingConfig.size} onChange={(event) => setTrainingConfig((current) => ({ ...current, size: event.target.value }))}>
                      <option>51 a 200 funcionarios</option>
                      <option>Pequena empresa</option>
                      <option>Enterprise</option>
                    </select>
                  </label>
                  <label>
                    Quem estara do outro lado?
                    <select value={trainingConfig.profile} onChange={(event) => setTrainingConfig((current) => ({ ...current, profile: event.target.value }))}>
                      <option>CEO impaciente</option>
                      <option>CFO rigoroso com orcamento</option>
                      <option>Diretor comercial cetico</option>
                      <option>Comprador agressivo</option>
                      <option>Cliente mal-educado</option>
                      <option>Gestor indeciso</option>
                      <option>Cliente fiel ao concorrente</option>
                    </select>
                  </label>
                  <label>
                    Cargo
                    <input value={trainingConfig.role} onChange={(event) => setTrainingConfig((current) => ({ ...current, role: event.target.value }))} placeholder="Ex.: Diretor Financeiro" />
                  </label>
                  <label>
                    Cenario
                    <select value={trainingConfig.scenario} onChange={(event) => setTrainingConfig((current) => ({ ...current, scenario: event.target.value }))}>
                      <option>Descoberta com decisor cetico</option>
                      <option>Negociacao de preco</option>
                      <option>Concorrente ja contratado</option>
                      <option>Fechamento sem urgencia</option>
                    </select>
                  </label>
                  <label>
                    Dificuldade
                    <select value={trainingConfig.difficulty} onChange={(event) => setTrainingConfig((current) => ({ ...current, difficulty: event.target.value }))}>
                      <option>Avancado</option>
                      <option>Intermediario</option>
                      <option>Elite</option>
                    </select>
                  </label>
                  <label className="wide">
                    O que sua empresa vende?
                    <input
                      value={trainingConfig.sellerCompany}
                      onChange={(event) => setTrainingConfig((current) => ({ ...current, sellerCompany: event.target.value }))}
                      placeholder="Ex.: software para gestao de equipes"
                    />
                  </label>
                  <label className="wide">
                    Produto que quero vender
                    <input
                      value={trainingConfig.offer}
                      onChange={(event) => setTrainingConfig((current) => ({ ...current, offer: event.target.value }))}
                      placeholder="Ex.: plataforma de gestao comercial B2B"
                    />
                  </label>
                  <label className="wide">
                    Objetivo da conversa
                    <input value={trainingConfig.objective} onChange={(event) => setTrainingConfig((current) => ({ ...current, objective: event.target.value }))} placeholder="Ex.: conquistar reuniao com o decisor" />
                  </label>
                  <label className="wide">
                    Descreva o cliente que voce quer simular
                    <textarea value={trainingConfig.context} onChange={(event) => setTrainingConfig((current) => ({ ...current, context: event.target.value }))} placeholder="Ex.: Diretor financeiro de uma empresa com 200 funcionarios, usa um concorrente e acha nossa solucao cara." />
                  </label>
                  <div className="coach-objections">
                    <span>Objecoes ativas</span>
                    {[
                      "Preco",
                      "Concorrente",
                      "Sem urgencia",
                      "Sem autoridade",
                    ].map((item) => (
                      <button
                        type="button"
                        className={trainingConfig.objection === item ? "selected" : ""}
                        aria-pressed={trainingConfig.objection === item}
                        onClick={() => setTrainingConfig((current) => ({ ...current, objection: item }))}
                        key={item}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <button className="start-coaching" onClick={startSession} disabled={!trainingConfig.offer.trim()}>
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
                <strong>
                  {trainingConfig.profile} · {customer.company}
                </strong>
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
                </div>
                <div className="inline-coach">
                  <Lightbulb />
                  <span>
                    <strong>Coach silencioso</strong>Explore impacto antes de
                    apresentar funcionalidades.
                  </span>
                </div>
                <form className="coach-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                  <button type="button" aria-label="Entrada por voz indisponivel nesta demonstracao" title="Entrada por voz em breve" disabled>
                    <Mic />
                  </button>
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Responda por texto ou use o microfone"
                    aria-label="Sua resposta ao cliente"
                  />
                  <button type="submit" disabled={!message.trim()} aria-label="Enviar">
                    <Send />
                  </button>
                </form>
                <button
                  className="finish-session"
                  onClick={() => setStep("result")}
                  disabled={conversation.filter((item) => item.speaker === "seller").length < 2}
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
                    <strong>{score}</strong>
                    <div>
                      <i style={{ width: `${score}%` }} />
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
                const mission = missions[selectedMission];
                const profile = missionProfiles[selectedMission];
                const [clientName, role = "Decisor"] = profile.client.split(" · ");
                setMissionConversation([{ speaker: "coach", text: `Sou ${clientName}, ${role}. ${profile.story} ${mission[1]} Voce esta dentro deste desafio. Comece a conversa e conduza a decisao.` }]);
                setMissionStep("session");
              }}><Play /> Iniciar este desafio</button></>}
              {missionStep === "session" && <div className="mission-session"><aside><UserRound /><small>CLIENTE DO DESAFIO</small><strong>{missionProfiles[selectedMission].client}</strong><p>{missionProfiles[selectedMission].psychology}</p><dl><div><dt>Objetivo</dt><dd>{missions[selectedMission][6]}</dd></div><div><dt>Dificuldade</dt><dd>{missions[selectedMission][3]}</dd></div><div><dt>Recompensa</dt><dd>{missions[selectedMission][2]}</dd></div></dl></aside><main><div className="mission-transcript">{missionConversation.map((item, index) => <article className={item.speaker} key={index}><small>{item.speaker === "coach" ? missionProfiles[selectedMission].client.split(" · ")[0] : "Voce"}</small><p>{item.text}</p></article>)}</div><div className="mission-decision-tip"><Lightbulb /><span><strong>Decisao do turno</strong>Use a resposta do cliente para escolher entre aprofundar, construir valor ou pedir compromisso.</span></div><form onSubmit={(event) => { event.preventDefault(); sendMissionMessage(); }}><input value={missionMessage} onChange={(event) => setMissionMessage(event.target.value)} placeholder="Responda ao cliente deste desafio..." /><button disabled={!missionMessage.trim()}><Send /></button></form><button className="mission-finish" disabled={missionConversation.filter((item) => item.speaker === "seller").length < 3} onClick={() => setMissionStep("result")}>Finalizar desafio e receber nota</button></main></div>}
              {missionStep === "result" && <div className="mission-result"><header><div><small>DESAFIO CONCLUIDO</small><h2>{missionEvaluation.overall >= 80 ? "Missao cumprida" : "Missao concluida com pontos para evoluir"}</h2><p>{missions[selectedMission][0]} · avaliacao exclusiva desta experiencia</p></div><strong>{missionEvaluation.overall}<span>/100</span></strong></header><div className="mission-result-scores">{[["Comunicacao", missionEvaluation.communication], ["Descoberta", missionEvaluation.discovery], ["Construcao de valor", missionEvaluation.value], ["Objecoes", missionEvaluation.objections], ["Fechamento", missionEvaluation.closing]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${value}%` }} /></i></article>)}</div><div className="mission-result-feedback"><article><CheckCircle2 /><div><strong>Pontos fortes</strong><p>{missionEvaluation.questions > 1 ? "Voce usou perguntas para entender a resistencia antes de responder." : "Voce manteve a conversa ativa e apresentou sua linha de raciocinio."}</p></div></article><article><ShieldAlert /><div><strong>Pontos a melhorar</strong><p>{missionEvaluation.discount ? "Houve concessao de preco antes de esgotar a construcao de valor." : !missionEvaluation.nextStep ? "Faltou transformar a conversa em um proximo passo com responsavel e data." : "Aprofunde impacto e criterio de decisao antes da proposta final."}</p></div></article><article><Sparkles /><div><strong>Melhor abordagem</strong><p>Valide a resistencia, investigue a causa, conecte valor a uma evidencia e confirme uma acao verificavel.</p></div></article><article><Award /><div><strong>XP conquistado</strong><p>{missionEvaluation.overall >= 80 ? missions[selectedMission][2] : "60% do XP · repita para conquistar a recompensa completa"}</p></div></article></div><footer><button onClick={() => { setMissionStep("brief"); setMissionConversation([]); }}>Rever contexto</button><button onClick={() => { setMissionStep("session"); setMissionConversation([]); const profile = missionProfiles[selectedMission]; setMissionConversation([{ speaker: "coach", text: `${profile.story} Vamos recomecar. Conduza esta conversa com uma abordagem melhor.` }]); }}><RefreshCw /> Tentar novamente</button></footer></div>}
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
                    Abrir missao <ChevronRight />
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
              <p>ESTRATEGIA DE NEGOCIACAO</p>
              <h2>Entre em cada reuniao com um plano personalizado.</h2>
            </div>
          </div>
          <div className="doctor-layout">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPlanReady(true);
              }}
            >
              <label>
                O que sua empresa vende?
                <input value={meeting.sellerCompany} onChange={(event) => setMeeting({ ...meeting, sellerCompany: event.target.value })} placeholder="Negocio, oferta principal e diferencial" />
              </label>
              <label>
                Empresa do cliente
                <input
                  value={meeting.company}
                  onChange={(event) =>
                    setMeeting({ ...meeting, company: event.target.value })
                  }
                  placeholder="Nome do cliente"
                />
              </label>
              <label>
                Segmento
                <select
                  value={meeting.industry}
                  onChange={(event) =>
                    setMeeting({ ...meeting, industry: event.target.value })
                  }
                >
                  <option>Tecnologia</option>
                  <option>Varejo</option>
                  <option>Servicos</option>
                  <option>Industria</option>
                </select>
              </label>
              <label>
                Produto ou servico
                <input
                  value={meeting.product}
                  onChange={(event) =>
                    setMeeting({ ...meeting, product: event.target.value })
                  }
                  placeholder="Sua oferta"
                />
              </label>
              <label>
                Cliente / oportunidade
                <input value={meeting.client} onChange={(event) => setMeeting({ ...meeting, client: event.target.value })} placeholder="Nome do lead ou area compradora" />
              </label>
              <label>
                Decisor
                <input value={meeting.decisionMaker} onChange={(event) => setMeeting({ ...meeting, decisionMaker: event.target.value })} placeholder="Cargo e perfil do decisor" />
              </label>
              <label>
                Objetivo
                <select
                  value={meeting.goal}
                  onChange={(event) =>
                    setMeeting({ ...meeting, goal: event.target.value })
                  }
                >
                  <option>Descoberta</option>
                  <option>Demonstracao</option>
                  <option>Negociacao</option>
                  <option>Fechamento</option>
                </select>
              </label>
              <label>
                Estagio da negociacao
                <select value={meeting.stage} onChange={(event) => setMeeting({ ...meeting, stage: event.target.value })}><option>Descoberta</option><option>Proposta</option><option>Negociacao</option><option>Fechamento</option><option>Recuperacao</option></select>
              </label>
              <label>
                Valor do negocio
                <input value={meeting.dealValue} onChange={(event) => setMeeting({ ...meeting, dealValue: event.target.value })} placeholder="Ex.: R$ 80 mil por ano" />
              </label>
              <label>
                Dores identificadas
                <textarea value={meeting.pains} onChange={(event) => setMeeting({ ...meeting, pains: event.target.value })} placeholder="Problemas, impacto e urgencia" />
              </label>
              <label>
                Objecoes ja apresentadas
                <textarea value={meeting.objections} onChange={(event) => setMeeting({ ...meeting, objections: event.target.value })} placeholder="Preco, prazo, risco, prioridade..." />
              </label>
              <label>
                Concorrentes
                <input value={meeting.competitors} onChange={(event) => setMeeting({ ...meeting, competitors: event.target.value })} placeholder="Empresas ou alternativa atual" />
              </label>
              <label>
                Resultado que voce quer alcancar
                <textarea value={meeting.desiredResult} onChange={(event) => setMeeting({ ...meeting, desiredResult: event.target.value })} placeholder="Decisao, reuniao, proposta ou contrato" />
              </label>
              <button disabled={!meeting.company || !meeting.product}>
                <Sparkles /> Preparar minha reuniao
              </button>
            </form>
            {planReady ? (
              <div className="meeting-plan">
                <header>
                  <CheckCircle2 />
                  <div>
                    <small>PLANO GERADO</small>
                    <h2>
                      {meeting.company} · {meeting.goal}
                    </h2>
                  </div>
                </header>
                {[
                  ["1. Contexto da oportunidade", `${meeting.company}, segmento ${meeting.industry}, estagio ${meeting.stage}. Oferta: ${meeting.product}${meeting.dealValue ? `, valor ${meeting.dealValue}` : ""}.`],
                  ["2. Perfil provavel do comprador", `${meeting.decisionMaker || "Decisor ainda nao confirmado"}. Tende a proteger risco, prioridade e resultado mensuravel.`],
                  ["3. Objetivo estrategico", meeting.desiredResult || `Avancar a oportunidade para ${meeting.goal.toLowerCase()} com compromisso verificavel.`],
                  ["4. Diagnostico", meeting.pains || "Confirmar problema atual, impacto, urgencia, processo de decisao e custo de nao agir."],
                  ["5. Estrategia principal", "Conduza por diagnostico, contraste entre situacao atual e resultado desejado, prova e compromisso progressivo."],
                  ["6. Argumentos de valor", `Conecte ${meeting.product} a impacto financeiro, velocidade, risco e previsibilidade usando dados do proprio cliente.`],
                  ["7. Perguntas estrategicas", "Como o problema afeta meta, custo ou velocidade? Por que resolver agora? Quem decide? Qual criterio define a melhor escolha?"],
                  ["8. Como conduzir a reuniao", "Abra com agenda, diagnostique, resuma o entendimento, apresente somente o valor relevante, trate riscos e confirme o proximo passo."],
                  ["9. Possiveis objecoes", meeting.objections || "Preco, prioridade, risco de implantacao, concorrente e falta de autoridade."],
                  ["10. Respostas as objecoes", "Valide, esclareca a causa real, responda com evidencia e confirme se a resistencia foi resolvida antes de avancar."],
                  ["11. Estrategia de negociacao", "Negocie por interesses e trocas. Nao conceda desconto sem contrapartida de prazo, escopo, volume ou compromisso."],
                  ["12. Pontos de pressao", `${meeting.stage}, impacto da dor, risco de permanencia e janela de decisao. Nunca invente urgencia.`],
                  ["13. Concessoes possiveis", "Prazo de pagamento, implantacao faseada, escopo inicial ou condicao vinculada a compromisso. Preserve margem e valor percebido."],
                  ["14. O que nao fazer", "Nao apresentar cedo demais, atacar concorrentes, prometer sem prova, oferecer desconto prematuro ou encerrar sem data."],
                  ["15. Como gerar urgencia", "Quantifique o custo da inacao e conecte a decisao a um evento real do negocio, prazo ou meta do cliente."],
                  ["16. Como conduzir para o fechamento", "Resuma criterios atendidos, pergunte o que ainda impede o avancar e proponha acao, responsavel, data e pauta."],
                  ["17. Plano B", "Se nao houver decisao, combine uma validacao menor: workshop tecnico, piloto com criterio de sucesso ou conversa com o decisor."],
                  ["18. Proximos passos", `Enviar resumo para ${meeting.client || meeting.company}, confirmar participantes e agendar a proxima etapa com objetivo definido.`],
                  ["19. Script recomendado", `\"Pelo que entendi, ${meeting.pains || "o problema atual"} impede o resultado esperado. Se mostrarmos como ${meeting.product} reduz esse impacto com risco controlado, faz sentido avancar com ${meeting.decisionMaker || "o decisor"}?\"`],
                  ["20. Checklist antes da reuniao", `Revisar dores; confirmar decisor; validar valor ${meeting.dealValue || "do negocio"}; preparar prova; mapear ${meeting.competitors || "alternativas"}; definir proximo passo e Plano B.`],
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
                  A IA combina empresa, segmento, oferta e objetivo para
                  preparar perguntas, riscos, pitch e fechamento.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "career" && (
        <section>
          <div className="coach-section-title">
            <div>
              <p>PAINEL DE EVOLUCAO PROFISSIONAL</p>
              <h2>Sua evolucao, competencias e proximos niveis em um so lugar.</h2>
            </div>
            <button>
              <Award /> Revisao mensal
            </button>
          </div>
          <div className="career-hero">
            <div>
              <small>NIVEL PROFISSIONAL ESTIMADO</small>
              <h2>Closer Intermediario</h2>
              <p>
                Voce esta a 320 XP e duas competencias do nivel Closer Avancado.
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
              "Quiz de negociacao",
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
    </div>
  );
}
