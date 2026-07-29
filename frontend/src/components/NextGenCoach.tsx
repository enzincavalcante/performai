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
  MessageSquareText,
  Mic,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import "./next-gen-coach.css";

type HubTab = "coach" | "battle" | "replay" | "twin" | "doctor" | "career";
type ConversationMessage = { speaker: "coach" | "seller"; text: string };

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function createMentorReply(question: string, level: string, goal: string) {
  const text = normalizeText(question);
  const prefix = `Pensando no seu nivel ${level.toLowerCase()} e no objetivo de ${goal.toLowerCase()}:`;

  if (text.includes("preco") || text.includes("caro") || text.includes("desconto")) {
    return `${prefix} nao defenda o preco imediatamente. Acolha e investigue: "Quando voce diz que esta caro, esta comparando com outra proposta, com o orcamento disponivel ou com o retorno esperado?" Depois conecte o investimento ao impacto citado pelo cliente. Qual dessas tres comparacoes apareceu na conversa?`;
  }
  if (text.includes("pitch") || text.includes("apresent")) {
    return `${prefix} reduza seu pitch a problema, impacto e evidencia. Experimente: "Ajudamos [perfil] a reduzir [problema mensuravel] por meio de [diferencial], sem [risco comum]." Escreva agora quem e o cliente e qual resultado voce consegue provar; eu ajusto a frase com voce.`;
  }
  if (text.includes("objec") || text.includes("concorrent")) {
    return `${prefix} use a sequencia acolher, esclarecer e confirmar. Primeiro: "Faz sentido comparar antes de decidir. O que mais pesa para voce nessa escolha?" A resposta revela se a resistencia e valor, risco ou processo. Qual foi a frase exata do cliente?`;
  }
  if (text.includes("fech") || text.includes("proximo passo")) {
    return `${prefix} teste compromisso sem pressionar: "Se resolvermos os pontos que discutimos, faz sentido envolver [decisor] em uma conversa de 30 minutos na quinta?" Antes disso, confirme o criterio de decisao e quem participa. O que ainda impede um proximo passo com data?`;
  }
  if (text.includes("descob") || text.includes("pergunta")) {
    return `${prefix} aprofunde em tres camadas: como funciona hoje, qual impacto isso causa e por que mudar agora. Comece com "Onde esse processo mais atrasa o resultado do time?" e use a resposta para a proxima pergunta. Que problema o cliente ja reconheceu?`;
  }
  return `${prefix} vejo contexto, mas ainda falta um dado para orientar uma acao precisa. Resuma em uma frase: o que voce vende, para quem, em qual etapa a conversa travou e o que o cliente disse literalmente. Com isso eu monto uma resposta e explico a tecnica por tras dela.`;
}

function createBuyerReply(message: string, turn: number, scenario: string, objection: string) {
  const text = normalizeText(message);
  const askedQuestion = message.includes("?");
  if (text.includes("desconto") || text.includes("%")) {
    return "Desconto ajuda, mas nao resolve minha duvida. Que resultado concreto justifica esse investimento e como voce mede isso?";
  }
  if (text.includes("roi") || text.includes("resultado") || text.includes("impacto")) {
    return askedQuestion
      ? "Hoje perdemos tempo com retrabalho e pouca previsibilidade. Mas preciso entender em quanto tempo eu veria mudanca e quem teria de participar."
      : "Resultado e importante, mas isso ainda esta abstrato. Pode ligar essa promessa a um problema especifico da minha operacao?";
  }
  if (askedQuestion) {
    return turn < 2
      ? `O maior problema e a equipe perder oportunidades no acompanhamento. Ainda assim, no cenario de ${scenario.toLowerCase()}, eu nao posso assumir um projeto sem reduzir o risco.`
      : `Isso faz sentido. Minha principal resistencia agora e ${objection.toLowerCase()}. Como voce sugere validar isso sem alongar o processo?`;
  }
  if (text.includes("reuniao") || text.includes("agenda") || text.includes("quinta") || text.includes("proximo passo")) {
    return "Posso considerar uma proxima conversa, desde que ela tenha uma pauta objetiva, duracao definida e envolva a pessoa certa. O que voce propoe?";
  }
  return turn < 2
    ? "Voce apresentou a solucao, mas ainda nao mostrou que entendeu meu contexto. Que pergunta faria para descobrir onde isso realmente afeta o negocio?"
    : "Entendi a proposta. Ainda preciso enxergar prioridade e seguranca para mudar. Por que eu deveria tratar disso agora?";
}

const tabs: Array<{ id: HubTab; label: string; icon: typeof Bot }> = [
  { id: "coach", label: "Mentor IA de Vendas", icon: Bot },
  { id: "battle", label: "Desafios Comerciais", icon: Trophy },
  { id: "replay", label: "Analise Inteligente", icon: RefreshCw },
  { id: "twin", label: "Simulador de Clientes", icon: Brain },
  { id: "doctor", label: "Estrategia de Negociacao", icon: BriefcaseBusiness },
  { id: "career", label: "Evolucao Profissional", icon: BarChart3 },
];

const missions = [
  [
    "Orcamento bloqueado",
    "Descubra valor sem oferecer desconto.",
    "450 XP",
    "Dificil",
  ],
  [
    "Cliente do concorrente",
    "Crie contraste sem atacar a solucao atual.",
    "380 XP",
    "Avancado",
  ],
  [
    "Fechamento em 10 minutos",
    "Conduza diagnostico e compromisso no tempo limite.",
    "600 XP",
    "Elite",
  ],
  [
    "Cinco objecoes",
    "Acolha, investigue e confirme cada resistencia.",
    "520 XP",
    "Dificil",
  ],
  [
    "Venda sem falar preco",
    "Construa valor durante a primeira metade da conversa.",
    "420 XP",
    "Avancado",
  ],
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
  const [tab, setTab] = useState<HubTab>("coach");
  const [step, setStep] = useState<"setup" | "session" | "result">("setup");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [seed, setSeed] = useState(1);
  const [meeting, setMeeting] = useState({
    company: "",
    industry: "Tecnologia",
    product: "",
    goal: "Descoberta",
  });
  const [planReady, setPlanReady] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [replayFile, setReplayFile] = useState("");
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [mentorLevel, setMentorLevel] = useState("Intermediario");
  const [mentorGoal, setMentorGoal] = useState("Resolver uma dificuldade");
  const [trainingConfig, setTrainingConfig] = useState({
    segment: "Tecnologia B2B",
    size: "51 a 200 funcionarios",
    scenario: "Descoberta com decisor cetico",
    difficulty: "Avancado",
    offer: "",
    objection: "Preco",
  });
  const [mentorMessages, setMentorMessages] = useState<
    Array<{ speaker: "mentor" | "seller"; text: string }>
  >([
    {
      speaker: "mentor",
      text: "O que voce precisa melhorar hoje: abordagem, descoberta, objecoes, negociacao ou fechamento? Conte o contexto e eu vou construir a estrategia com voce.",
    },
  ]);
  const customer = useMemo(
    () => ({
      name: ["Roberto Almeida", "Camila Nunes", "Marcos Ferraz"][seed % 3],
      role: ["CEO", "Diretora Financeira", "Gerente de Operacoes"][seed % 3],
      company: ["Atlas Logistica", "Nexa Tecnologia", "Grupo Horizonte"][
        seed % 3
      ],
      personality: [
        "Direto e impaciente",
        "Analitica e desconfiada",
        "Competitivo e exigente",
      ][seed % 3],
    }),
    [seed],
  );

  const startSession = () => {
    setConversation([
      {
        speaker: "coach",
        text: `Sou ${customer.name}, ${customer.role} da ${customer.company}. Tenho poucos minutos. Voce quer conversar sobre ${trainingConfig.offer}. Por que isso merece minha atencao agora?`,
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
        ["Confianca", Math.min(92, base + 8)],
        ["Descoberta", discovery],
        ["Rapport", Math.min(90, base + questions * 5)],
        ["Objecoes", Math.min(92, value + 2)],
        ["Fechamento", closing],
        ["Escuta", Math.min(94, discovery + 3)],
        ["Estrutura", Math.min(92, base + (hasValue ? 10 : 2))],
        ["Inteligencia emocional", Math.min(91, base + 7)],
      ] as Array<[string, number]>,
      headline: hasNextStep
        ? "Voce conduziu a conversa para um compromisso claro."
        : questions
          ? "Boa investigacao; falta transformar valor em um proximo passo."
          : "Sua proposta precisa partir de mais descoberta antes de avancar.",
      error: questions
        ? "Voce investigou o contexto, mas encerrou sem combinar responsavel, data e objetivo da proxima conversa."
        : "Voce apresentou a solucao antes de investigar o impacto e o criterio de decisao do cliente.",
      next: hasNextStep
        ? "Repita com dificuldade maior e valide o compromisso sem oferecer desconto."
        : "Repita o treino e termine com um proximo passo que tenha data, participantes e pauta.",
    };
  }, [conversation]);

  return (
    <div className="coach-hub">
      <header className="coach-hub-heading">
        <div>
          <p>PERFORMA AI · COACHING ECOSYSTEM</p>
          <h1>Seu treinador comercial inteligente.</h1>
          <span>
            Pratique, receba feedback e evolua com um sistema que aprende com
            cada conversa.
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

      {tab === "coach" && (
        <section className="coach-core mentor-workspace">
          <div className="mentor-intro">
            <div>
              <span>
                <Bot />
              </span>
              <div>
                <p>MENTOR COMERCIAL DISPONIVEL 24 HORAS</p>
                <h2>Converse com um especialista que entende seu contexto.</h2>
                <small>
                  Ele pergunta, corrige, explica tecnicas e transforma sua
                  dificuldade em um plano aplicavel.
                </small>
              </div>
            </div>
            <div>
              {[
                "Melhorar meu pitch",
                "Quebrar uma objecao",
                "Preparar uma negociacao",
                "Revisar um erro",
              ].map((item) => (
                <button onClick={() => setMentorQuestion(item)} key={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mentor-conversation">
            <main>
              {mentorMessages.map((item, index) => (
                <article className={item.speaker} key={index}>
                  <small>
                    {item.speaker === "mentor" ? "Mentor IA" : "Voce"}
                  </small>
                  <p>{item.text}</p>
                </article>
              ))}
            </main>
            <aside>
              <div>
                <Lightbulb />
                <span>
                  <strong>Como obter uma resposta melhor</strong>Inclua produto,
                  perfil do cliente, etapa da venda e dificuldade encontrada.
                </span>
              </div>
              <h3>Contexto desta sessao</h3>
              <label>
                Nivel do vendedor
                <select value={mentorLevel} onChange={(event) => setMentorLevel(event.target.value)}>
                  <option>Intermediario</option>
                  <option>Iniciante</option>
                  <option>Avancado</option>
                </select>
              </label>
              <label>
                Objetivo
                <select value={mentorGoal} onChange={(event) => setMentorGoal(event.target.value)}>
                  <option>Resolver uma dificuldade</option>
                  <option>Aprender uma tecnica</option>
                  <option>Preparar uma call</option>
                  <option>Revisar um erro</option>
                </select>
              </label>
            </aside>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const question = mentorQuestion.trim();
                if (!question) return;
                setMentorMessages((items) => [
                  ...items,
                  { speaker: "seller", text: question },
                  { speaker: "mentor", text: createMentorReply(question, mentorLevel, mentorGoal) },
                ]);
                setMentorQuestion("");
              }}
            >
              <textarea
                value={mentorQuestion}
                onChange={(event) => setMentorQuestion(event.target.value)}
                placeholder="Explique sua situacao comercial..."
                aria-label="Situacao comercial para o mentor"
              />
              <button type="submit" disabled={!mentorQuestion.trim()}>
                <Send /> Enviar ao mentor
              </button>
            </form>
          </div>
          <div className="coach-separator">
            <span>OU PRATIQUE COM UM CLIENTE GERADO PELA IA</span>
          </div>
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
                    {customer.role} · {customer.company}
                  </strong>
                  <dl>
                    <div>
                      <dt>Personalidade</dt>
                      <dd>{customer.personality}</dd>
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
                    O que voce vende?
                    <input
                      value={trainingConfig.offer}
                      onChange={(event) => setTrainingConfig((current) => ({ ...current, offer: event.target.value }))}
                      placeholder="Ex.: plataforma de gestao comercial B2B"
                    />
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
                    <Play /> Iniciar coaching <ArrowRight />
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
                  {customer.role} · {customer.company}
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
                  Finalizar e receber coaching
                </button>
              </main>
            </div>
          )}
          {step === "result" && (
            <div className="coach-result">
              <header>
                <div>
                  <p>COACHING CONCLUIDO</p>
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
                    &ldquo;Quando voce diz caro, esta comparando com qual
                    alternativa ou com o impacto esperado?&rdquo;
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
                <button onClick={() => setTab("replay")}>
                  Abrir replay inteligente
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
              <button className="mission-back" onClick={() => setSelectedMission(null)}>Voltar aos desafios</button>
              <header><div><p>MISSAO {String(selectedMission + 1).padStart(2, "0")} · {missions[selectedMission][3]}</p><h2>{missions[selectedMission][0]}</h2><span>{missions[selectedMission][1]}</span></div><strong>{missions[selectedMission][2]}</strong></header>
              <div className="mission-briefing"><article><Target /><h3>Objetivo</h3><p>Cumpra a missao sem perder rapport ou controle comercial.</p></article><article><Gauge /><h3>Aprovacao</h3><p>Nota minima 80 e proximo passo confirmado.</p></article><article><Award /><h3>Recompensas</h3><p>XP, moedas, medalha e pontos no ranking.</p></article></div>
              <button className="mission-start" onClick={() => { setSelectedMission(null); setTab("coach"); setStep("setup"); }}><Play /> Iniciar simulacao da missao</button>
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
                    onClick={() => setSelectedMission(index)}
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
          <div className="replay-upload">
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
          </div>
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
                Empresa
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
                  [
                    "Estrategia",
                    "Conduza a conversa por impacto, prioridade e risco de nao agir.",
                  ],
                  [
                    "Perguntas de descoberta",
                    "Como esse problema afeta meta, custo ou velocidade hoje? Quem mais participa da decisao?",
                  ],
                  [
                    "Objecoes provaveis",
                    "Prioridade concorrente, risco de implantacao e comparacao de preco.",
                  ],
                  [
                    "Fechamento recomendado",
                    "Confirme criterios e agende o proximo passo com participantes e data.",
                  ],
                  [
                    "Risco principal",
                    "Apresentar a solucao antes de confirmar urgencia e autoridade.",
                  ],
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
