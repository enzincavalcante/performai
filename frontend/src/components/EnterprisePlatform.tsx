"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Award, BarChart3, Bell, BookOpen, Bot, Brain, BriefcaseBusiness,
  CheckCircle2, ChevronRight, ClipboardCheck, Download, FileAudio,
  FileText, FolderOpen, GraduationCap, LayoutDashboard, Library,
  LineChart, ListChecks, Medal, Menu, MessageSquareText, Mic,
  Lock, MoreHorizontal, Play, Search, Settings, ShieldCheck, Sparkles,
  Star, Target, Trophy, Upload, UserPlus, Users, X, Zap,
} from "lucide-react";
import "./enterprise.css";

export type EnterpriseView =
  | "dashboard" | "learning" | "simulation" | "ai" | "calls" | "paths"
  | "assessments" | "gamification" | "performance" | "reports" | "teams"
  | "library" | "certificates" | "notifications" | "settings";

type Navigate = (view: EnterpriseView) => void;

const BRAND_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/performai-logo.png`;
const ACADEMY_COVER = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/sales-academy-cover.png`;
const FOUNDER_SIGNATURE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/founder-signature.png`;

const NAVIGATION: { id: EnterpriseView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "learning", label: "Central de Aprendizagem", icon: GraduationCap },
  { id: "simulation", label: "Simulacao por voz", icon: Mic },
  { id: "ai", label: "Mentor de Vendas IA", icon: Bot },
  { id: "calls", label: "Inteligencia de Calls", icon: FileAudio },
  { id: "paths", label: "Jornada de Aprendizagem", icon: Target },
  { id: "teams", label: "Equipes e Performance", icon: Users },
  { id: "certificates", label: "Certificados", icon: Award },
  { id: "notifications", label: "Notificacoes", icon: Bell },
  { id: "settings", label: "Configuracoes", icon: Settings },
];

export function EnterpriseSidebar({ active, onNavigate }: { active: EnterpriseView; onNavigate: Navigate }) {
  const [open, setOpen] = useState(false);
  const current = NAVIGATION.find((item) => item.id === active) ?? NAVIGATION[0];
  const select = (view: EnterpriseView) => {
    onNavigate(view);
    setOpen(false);
  };
  return <>
    <button className="enterprise-mobile-trigger" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></button>
    {open && <button className="enterprise-menu-backdrop" onClick={() => setOpen(false)} aria-label="Fechar menu" />}
    <aside className={`enterprise-sidebar ${open ? "open" : ""}`}>
      <header>
        <span className="enterprise-brand"><Image src={BRAND_LOGO} alt="" width={34} height={34} /><strong>Performa <b>AI</b></strong></span>
        <button onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button>
      </header>
      <div className="enterprise-workspace"><span>WORKSPACE</span><strong>Equipe Cavalcante</strong><small>Plano demonstracao</small></div>
      <nav aria-label="Modulos da plataforma">{NAVIGATION.map((item) => { const Icon = item.icon; return <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => select(item.id)}><Icon /><span>{item.label}</span>{item.id === "notifications" && <i>4</i>}</button>; })}</nav>
      <footer><div><Zap /><span><strong>60 min</strong><small>saldo semanal</small></span></div><button onClick={() => select("settings")} aria-label="Gerenciar plano"><ChevronRight /></button></footer>
    </aside>
    <div className="enterprise-mobile-current"><current.icon /><span>{current.label}</span></div>
  </>;
}

const KPI_DATA = [
  { label: "Conversao comercial", value: "24,8%", delta: "+4,2%", icon: Target },
  { label: "Calls analisadas", value: "128", delta: "+18 esta semana", icon: FileAudio },
  { label: "Nota media", value: "8,4", delta: "+0,6 pontos", icon: Star },
  { label: "Treinamentos concluidos", value: "86%", delta: "Meta: 90%", icon: GraduationCap },
];

export function EnterpriseDashboard({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="enterprise-page enterprise-dashboard">
    <header className="enterprise-page-heading"><div><p>PAINEL EXECUTIVO</p><h1>O desenvolvimento do time, em um so lugar.</h1><span>Treinamento, pratica, calls reais e desempenho conectados para orientar a proxima acao.</span></div><button onClick={() => onNavigate("simulation")}><Mic /> Iniciar simulacao</button></header>
    <section className="enterprise-kpis">{KPI_DATA.map((item) => { const Icon = item.icon; return <article key={item.label}><div><span>{item.label}</span><Icon /></div><strong>{item.value}</strong><small>{item.delta}</small></article>; })}</section>
    <section className="enterprise-dashboard-grid">
      <article className="enterprise-panel enterprise-recommendation"><header><span><Sparkles /></span><div><p>RECOMENDACAO DA IA</p><h2>O time precisa reforcar descoberta.</h2></div></header><p>Calls recentes mostram que os vendedores apresentam a solucao antes de quantificar o impacto do problema.</p><div className="enterprise-recommendation-actions"><button onClick={() => onNavigate("paths")}>Ver trilha recomendada <ChevronRight /></button><button onClick={() => onNavigate("ai")}>Perguntar para IA</button></div></article>
      <article className="enterprise-panel enterprise-learning-progress"><header><div><p>TRILHA EM DESTAQUE</p><h2>SDR de alta performance</h2></div><span>68%</span></header><div className="enterprise-progress"><i style={{ width: "68%" }} /></div><ul><li className="done"><CheckCircle2 /> Cold Call</li><li className="done"><CheckCircle2 /> Rapport</li><li className="current"><Play /> Diagnostico</li><li><Target /> Objecoes</li></ul><button onClick={() => onNavigate("paths")}>Continuar trilha</button></article>
      <article className="enterprise-panel enterprise-chart"><header><div><p>EVOLUCAO DO TIME</p><h2>Nota media por semana</h2></div><button aria-label="Mais opcoes"><MoreHorizontal /></button></header><div className="enterprise-bars">{[52, 60, 58, 69, 74, 82, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }}><span>{6.5 + index * .3}</span></i>)}</div><footer><span>S1</span><span>S2</span><span>S3</span><span>S4</span><span>S5</span><span>S6</span><span>Atual</span></footer></article>
      <article className="enterprise-panel enterprise-activity"><header><div><p>ATIVIDADE RECENTE</p><h2>Movimento da equipe</h2></div><button onClick={() => onNavigate("notifications")}>Ver tudo</button></header><ul><li><span className="blue"><FileAudio /></span><div><strong>Ana concluiu uma analise de call</strong><small>Nota 9,1 · ha 18 minutos</small></div></li><li><span className="green"><Award /></span><div><strong>Rafael conquistou uma medalha</strong><small>Especialista em Objecoes · ha 1 hora</small></div></li><li><span className="purple"><GraduationCap /></span><div><strong>Marina concluiu a trilha SDR</strong><small>Certificado emitido · ha 3 horas</small></div></li></ul></article>
    </section>
    <section className="enterprise-quick-actions"><button onClick={() => onNavigate("learning")}><GraduationCap /><span><strong>Explorar treinamentos</strong><small>Cursos e conteudos recomendados</small></span><ChevronRight /></button><button onClick={() => onNavigate("calls")}><Upload /><span><strong>Analisar uma call</strong><small>Envie uma ligacao real</small></span><ChevronRight /></button><button onClick={() => onNavigate("reports")}><BarChart3 /><span><strong>Abrir relatorios</strong><small>Indicadores para gestores</small></span><ChevronRight /></button></section>
  </div>;
}

const COURSE_DATA = [
  { id: "discovery", title: "Descoberta que gera urgencia", category: "Diagnostico", level: "Intermediario", time: "1h 25min", progress: 72, tone: "blue", videoId: "03K40pFJ3Iw", videoTitle: "SPIN Selling aplicado de forma pratica", description: "Aprenda a conduzir o cliente ate impacto, urgencia, decisao e proximo passo.", objectives: ["Identificar a dor por tras do sintoma", "Quantificar impacto e prioridade", "Confirmar o processo de decisao"], checklist: ["Assista ao video", "Baixe o roteiro de descoberta", "Responda ao estudo de caso", "Conclua o quiz"] },
  { id: "objections", title: "Objecoes sem conceder desconto", category: "Negociacao", level: "Avancado", time: "58min", progress: 35, tone: "purple", videoId: "MPRP2eGXdFM", videoTitle: "Guia para lidar com objecoes do cliente", description: "Diagnostique a causa da resistencia antes de defender preco, oferecer desconto ou listar funcionalidades.", objectives: ["Diferenciar preco de falta de valor", "Responder com perguntas de diagnostico", "Proteger margem na negociacao"], checklist: ["Assista ao video", "Estude o framework de resposta", "Pratique tres objecoes", "Conclua o desafio"] },
  { id: "cold-call", title: "Cold Call: primeiros 30 segundos", category: "Prospeccao", level: "Essencial", time: "42min", progress: 0, tone: "cyan", videoId: "ZPSv41d-bMM", videoTitle: "Como acertar nos primeiros 30 segundos da chamada fria", description: "Construa uma abertura curta, honesta e relevante que conquiste permissao para continuar.", objectives: ["Ganhar os proximos 30 segundos", "Criar relevancia sem pitch longo", "Finalizar com uma pergunta"], checklist: ["Assista ao video", "Escreva sua abertura", "Grave duas versoes", "Passe no quiz"] },
  { id: "closing", title: "Fechamento e proximos passos", category: "Closer", level: "Intermediario", time: "1h 10min", progress: 0, tone: "green", videoId: "gwuAOJcWauc", videoTitle: "Tecnicas de fechamento de vendas", description: "Transforme interesse em compromisso claro, com responsavel, data e criterio de decisao.", objectives: ["Reconhecer sinais de avancar", "Evitar encerramentos vagos", "Definir um proximo passo calendarizavel"], checklist: ["Assista ao trecho indicado", "Aplique o checklist", "Resolva o estudo de caso", "Conclua a avaliacao"] },
  { id: "mindset", title: "Mentalidade de alta performance", category: "Fundamentos", level: "Essencial", time: "32min", progress: 0, tone: "blue", videoId: "4XpoIWWaja4", videoTitle: "O que todo vendedor precisa entender para vender mais", description: "Desenvolva responsabilidade, resiliencia e consistencia na rotina comercial.", objectives: ["Separar comportamento de resultado", "Aprender com rejeicoes", "Criar uma rotina de evolucao"], checklist: ["Assista ao video", "Defina uma meta", "Registre um aprendizado", "Conclua o quiz"] },
  { id: "prospecting", title: "Prospeccao com relevancia", category: "Prospeccao", level: "Essencial", time: "38min", progress: 0, tone: "cyan", videoId: "w-zDbEIuuQk", videoTitle: "A melhor forma de prospectar clientes", description: "Encontre o perfil certo e crie uma razao relevante para iniciar a conversa.", objectives: ["Definir cliente ideal", "Reconhecer sinais de prioridade", "Criar abordagens relevantes"], checklist: ["Assista ao video", "Defina seu ICP", "Escreva uma abordagem", "Pratique na Arena"] },
  { id: "qualification", title: "Qualificacao de oportunidades", category: "SDR", level: "Intermediario", time: "46min", progress: 0, tone: "green", videoId: "OfzUsYZoDGE", videoTitle: "Como qualificar leads e levantar necessidades", description: "Separe interesse de oportunidade real usando impacto, prioridade e decisao.", objectives: ["Validar aderencia e problema", "Mapear decisores", "Qualificar com fatos"], checklist: ["Assista ao video", "Aplique o checklist", "Revise o pipeline", "Conclua o quiz"] },
  { id: "rapport", title: "Rapport profissional", category: "Fundamentos", level: "Essencial", time: "34min", progress: 0, tone: "purple", videoId: "Hym6EO-cpDI", videoTitle: "Passos simples para dominar rapport em vendas", description: "Construa confianca com contexto, escuta, clareza e adaptacao.", objectives: ["Alinhar expectativas", "Adaptar comunicacao", "Demonstrar escuta ativa"], checklist: ["Assista ao video", "Prepare sua agenda", "Pratique um resumo", "Conclua o quiz"] },
  { id: "pitch", title: "Pitch e proposta de valor", category: "Closer", level: "Intermediario", time: "41min", progress: 0, tone: "blue", videoId: "PUGK8KLgx0w", videoTitle: "Passo a passo de um pitch de vendas", description: "Conecte problema, impacto, solucao e prova sem listar funcionalidades.", objectives: ["Estruturar um pitch curto", "Traduzir recurso em impacto", "Usar provas relevantes"], checklist: ["Assista ao video", "Escreva seu pitch", "Grave uma versao", "Pratique na Arena"] },
  { id: "negotiation", title: "Negociacao sem perder valor", category: "Negociacao", level: "Avancado", time: "52min", progress: 0, tone: "purple", videoId: "3h-s_xGZG6U", videoTitle: "Tecnicas comerciais para conduzir o fechamento", description: "Negocie interesses, contrapartidas e limites protegendo a margem.", objectives: ["Separar posicao de interesse", "Negociar contrapartidas", "Preparar limites"], checklist: ["Assista ao video", "Defina seus limites", "Prepare contrapartidas", "Conclua o desafio"] },
  { id: "post-sale", title: "Pos-venda e fidelizacao", category: "Relacionamento", level: "Intermediario", time: "36min", progress: 0, tone: "green", videoId: "HCtZ55hL0Bc", videoTitle: "Pos-venda: passo a passo pratico", description: "Transforme entrega em adocao, renovacao, expansao e indicacao.", objectives: ["Criar transicao de contexto", "Definir primeiro valor", "Organizar acompanhamento"], checklist: ["Assista ao video", "Crie o plano de 30 dias", "Defina indicadores", "Conclua o quiz"] },
  { id: "role-play", title: "Role play e simulacao de vendas", category: "Pratica", level: "Intermediario", time: "44min", progress: 0, tone: "cyan", videoId: "40tgo5_1_LI", videoTitle: "Role play para aumentar a performance em vendas", description: "Use simulacoes para transformar tecnica em comportamento sob pressao.", objectives: ["Definir um foco por pratica", "Dar feedback observavel", "Repetir com variacao"], checklist: ["Assista ao video", "Escolha um cenario", "Pratique na Arena", "Compare os resultados"] },
  { id: "case-study", title: "Estudo de caso B2B", category: "Estrategia", level: "Avancado", time: "48min", progress: 0, tone: "blue", videoId: "tYNk3pyyfVM", videoTitle: "Como vender servicos B2B: estudo de caso", description: "Analise contexto, lacunas e proximo passo em uma venda complexa.", objectives: ["Separar fatos de suposicoes", "Identificar informacao ausente", "Escolher o proximo passo"], checklist: ["Assista ao caso", "Responda as perguntas", "Compare a estrategia", "Conclua a avaliacao"] },
];

const COURSE_EXPANSIONS = [
  ["Fundamentos", "4XpoIWWaja4", "blue", ["Papel do vendedor consultivo", "Disciplina e rotina comercial", "Escuta ativa na pratica"]],
  ["Prospeccao", "w-zDbEIuuQk", "cyan", ["Definindo o cliente ideal", "Pesquisa e gatilhos de abordagem", "Cadencia multicanal eficiente"]],
  ["SDR", "OfzUsYZoDGE", "green", ["BANT sem interrogatorio", "Mapeamento de decisores", "Passagem de bastao para o closer", "Pipeline limpo e previsivel"]],
  ["Closer", "PUGK8KLgx0w", "green", ["Demonstracao orientada a valor", "Construcao do caso de negocio", "Proposta comercial que facilita a decisao"]],
  ["Negociacao", "3h-s_xGZG6U", "purple", ["Preparacao e limites da negociacao", "Concessoes com contrapartidas", "Negociacao com compras e financeiro"]],
  ["Relacionamento", "HCtZ55hL0Bc", "green", ["Onboarding e primeiro valor", "Reuniao de acompanhamento", "Renovacao e prevencao de churn", "Expansao e indicacoes"]],
  ["Pratica", "40tgo5_1_LI", "cyan", ["Como preparar um role play", "Feedback que muda comportamento", "Simulacao com cliente agressivo", "Simulacao sob pressao de preco"]],
  ["Estrategia", "tYNk3pyyfVM", "blue", ["Planejamento de contas B2B", "Estrategia para vendas complexas", "Analise de oportunidade parada", "Plano de acao comercial"]],
  ["Diagnostico", "03K40pFJ3Iw", "blue", ["Perguntas de situacao e contexto", "Do problema ao impacto financeiro", "Urgencia sem pressionar", "Processo e criterios de decisao"]],
] as const;

const EXPANDED_COURSES = COURSE_EXPANSIONS.flatMap(([category, videoId, tone, titles]) =>
  titles.map((title, index) => ({
    id: `${category.toLowerCase()}-${index + 1}`,
    title,
    category,
    level: index < 1 ? "Essencial" : index < 3 ? "Intermediario" : "Avancado",
    time: `${32 + index * 7}min`,
    progress: 0,
    tone,
    videoId,
    videoTitle: `${title}: aula aplicada`,
    description: `Aprofunde ${title.toLowerCase()} com exemplos comerciais, aplicacao orientada e pratica dentro da Performa AI.`,
    objectives: ["Compreender o metodo", "Aplicar em uma conversa real", "Reconhecer erros comuns"],
    checklist: ["Assista ao video", "Leia o resumo pratico", "Resolva o exercicio", "Valide no quiz"],
  })),
);

const ALL_COURSES = [...COURSE_DATA, ...EXPANDED_COURSES];

function LearningModule({ onNavigate }: { onNavigate: Navigate }) {
  const [category, setCategory] = useState("Todos");
  const [selectedCourse, setSelectedCourse] = useState<(typeof ALL_COURSES)[number] | null>(null);
  const categories = ["Todos", "Fundamentos", "Prospeccao", "SDR", "Diagnostico", "Closer", "Negociacao", "Relacionamento", "Pratica", "Estrategia"];
  if (selectedCourse) return <ModuleFrame eyebrow={selectedCourse.category} title={selectedCourse.title} description={selectedCourse.description} action={<button onClick={() => setSelectedCourse(null)}><ArrowLeft /> Voltar aos treinamentos</button>}>
    <section className="course-player-layout">
      <article className="course-player-main">
        <div className="course-video"><iframe src={`https://www.youtube-nocookie.com/embed/${selectedCourse.videoId}`} title={selectedCourse.videoTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
        <div className="course-player-copy"><small>VIDEO SELECIONADO · FONTE ESPECIALIZADA</small><h2>{selectedCourse.videoTitle}</h2><p>{selectedCourse.description}</p></div>
        <section className="course-objectives"><h3>O que voce vai dominar</h3><div>{selectedCourse.objectives.map((objective) => <span key={objective}><CheckCircle2 /> {objective}</span>)}</div></section>
      </article>
      <aside className="course-lesson-panel"><header><div><small>PROGRESSO DO TREINAMENTO</small><strong>{selectedCourse.progress}%</strong></div><div className="enterprise-progress"><i style={{ width: `${selectedCourse.progress}%` }} /></div></header><h3>Etapas desta aula</h3>{selectedCourse.checklist.map((item, index) => <button className={index < Math.ceil(selectedCourse.progress / 25) ? "done" : ""} key={item}><i>{index < Math.ceil(selectedCourse.progress / 25) ? <CheckCircle2 /> : index + 1}</i><span>{item}</span><ChevronRight /></button>)}<button className="course-practice" onClick={() => onNavigate("simulation")}><Mic /> Praticar com cliente IA</button></aside>
    </section>
  </ModuleFrame>;
  return <ModuleFrame eyebrow="CENTRAL DE APRENDIZAGEM" title="Aprenda, pratique e valide." description="Cursos, videos, avaliacoes e materiais comerciais organizados em um unico lugar." action={<div className="hub-actions"><button onClick={() => onNavigate("assessments")}><ClipboardCheck /> Avaliacoes</button><button onClick={() => onNavigate("library")}><Library /> Biblioteca</button></div>}>
    <div className="enterprise-search-row"><label><Search /><input placeholder="Pesquisar cursos, tecnicas ou habilidades" /></label><div>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    <section className="course-feature academy-feature"><Image src={ACADEMY_COVER} alt="Equipe comercial em treinamento profissional" fill sizes="(max-width: 900px) 100vw, 900px" /><div><p>RECOMENDADO PELA IA</p><h2>Fortaleca a descoberta antes do pitch.</h2><span>Uma selecao baseada nas calls e simulacoes mais recentes do seu time.</span><button onClick={() => setSelectedCourse(ALL_COURSES[0])}><Play /> Iniciar recomendacao</button></div></section>
    <section><SectionTitle eyebrow="CONTEUDO SELECIONADO" title={category === "Todos" ? "Sua aprendizagem" : category} aside={`${ALL_COURSES.filter((course) => category === "Todos" || course.category === category).length} treinamentos`} /><div className="course-grid">{ALL_COURSES.filter((course) => category === "Todos" || course.category === category).map((course) => <article className="course-card" key={`${course.category}-${course.title}`} onClick={() => setSelectedCourse(course)}><div className={`course-cover ${course.tone}`}><Image src={ACADEMY_COVER} alt="" fill sizes="360px" /><span>{course.category}</span><i><Play /></i></div><div className="course-card-body"><small>{course.level} · {course.time}</small><h3>{course.title}</h3><div className="enterprise-progress"><i style={{ width: `${course.progress}%` }} /></div><footer><span>{course.progress ? `${course.progress}% concluido` : "Ainda nao iniciado"}</span><button onClick={() => setSelectedCourse(course)} aria-label={`Abrir ${course.title}`}><ChevronRight /></button></footer></div></article>)}</div></section>
  </ModuleFrame>;
}

function PathsModule() {
  const steps = [
    ["Cold Call", "Concluido", 100], ["Rapport", "Concluido", 100], ["Diagnostico", "Em andamento", 68],
    ["Objecoes", "Proximo", 0], ["Agendamento", "Bloqueado", 0], ["Prova final", "Bloqueado", 0],
  ];
  return <ModuleFrame eyebrow="APRENDIZADO ADAPTATIVO" title="Trilhas de Aprendizagem" description="A IA reorganiza a jornada de cada vendedor conforme desempenho, metas e dificuldades.">
    <section className="path-layout"><article className="enterprise-panel path-main"><header><div><p>TRILHA ATUAL</p><h2>Formacao SDR · Nivel 2</h2><span>4 de 6 etapas · previsao de conclusao em 12 dias</span></div><strong>68%</strong></header><div className="path-steps">{steps.map(([title, status, progress], index) => <div className={Number(progress) === 100 ? "done" : status === "Em andamento" ? "current" : ""} key={title}><i>{Number(progress) === 100 ? <CheckCircle2 /> : index + 1}</i><span><strong>{title}</strong><small>{status}</small></span>{status === "Em andamento" && <button>Continuar</button>}</div>)}</div></article><aside className="enterprise-panel adaptive-panel"><Sparkles /><p>AJUSTE AUTOMATICO</p><h2>Objecoes ganhou prioridade.</h2><span>Suas ultimas 3 calls tiveram nota abaixo de 7 nesta competencia. A IA adicionou dois exercicios antes da proxima etapa.</span><ul><li><CheckCircle2 /> Baseado em desempenho real</li><li><CheckCircle2 /> Atualizado semanalmente</li><li><CheckCircle2 /> Visivel para o gestor</li></ul></aside></section>
  </ModuleFrame>;
}

const FEATURED_PATH = [
  ["Introducao", "Conheca a metodologia, a plataforma e a rotina de evolucao."],
  ["Mentalidade comercial", "Desenvolva disciplina, curiosidade e responsabilidade pelo resultado."],
  ["Prospeccao", "Crie abordagens relevantes e conquiste os primeiros segundos."],
  ["Qualificacao", "Separe oportunidade real de contato sem prioridade ou aderencia."],
  ["Rapport", "Construa confianca sem perder objetividade comercial."],
  ["Descoberta de necessidade", "Investigue dor, impacto, urgencia e processo de decisao."],
  ["Apresentacao de valor", "Conecte sua solucao ao resultado que o cliente precisa."],
  ["Quebra de objecoes", "Acolha, investigue e responda sem entrar em confronto."],
  ["Negociacao", "Proteja margem e troque concessoes por compromissos."],
  ["Fechamento", "Transforme interesse em um proximo passo claro e calendarizado."],
  ["Pos-venda", "Garanta adocao, expansao e indicacoes depois do contrato."],
  ["Exercicios praticos", "Aplique os frameworks em situacoes curtas e objetivas."],
  ["Simulacoes", "Pratique com compradores de diferentes perfis e niveis de pressao."],
  ["Estudos de caso", "Decida como conduzir oportunidades inspiradas em calls reais."],
  ["Avaliacao final", "Comprove conhecimento, diagnostico e execucao comercial."],
  ["Certificacao", "Emita seu certificado depois de cumprir todos os criterios."],
] as const;

function FixedPathsModule({ onNavigate }: { onNavigate: Navigate }) {
  const [completed, setCompleted] = useState(3);
  const [selected, setSelected] = useState(3);
  const progress = Math.round((completed / FEATURED_PATH.length) * 100);
  const current = FEATURED_PATH[selected];
  return <ModuleFrame eyebrow="JORNADA DE APRENDIZAGEM" title="Seu progresso tem um caminho claro." description="Trilha, XP, conquistas e consistencia conectados ao seu desenvolvimento." action={<div className="hub-actions"><button onClick={() => onNavigate("gamification")}><Trophy /> XP e conquistas</button><button onClick={() => onNavigate("certificates")}><Award /> Certificacao</button></div>}>
    <section className="path-layout path-layout-fixed">
      <article className="enterprise-panel path-main"><header><div><p>TRILHA OFICIAL</p><h2>Vendas de alta performance</h2><span>{completed} de {FEATURED_PATH.length} etapas concluidas</span></div><strong>{progress}%</strong></header><div className="enterprise-progress"><i style={{ width: `${progress}%` }} /></div><div className="path-steps path-steps-complete">{FEATURED_PATH.map(([title], index) => { const done = index < completed; const unlocked = index <= completed; return <button className={done ? "done" : index === selected ? "current" : ""} disabled={!unlocked} onClick={() => setSelected(index)} key={title}><i>{done ? <CheckCircle2 /> : unlocked ? index + 1 : <Lock />}</i><span><strong>{title}</strong><small>{done ? "Concluido" : unlocked ? index === completed ? "Disponivel agora" : "Revisar etapa" : "Conclua a etapa anterior"}</small></span><ChevronRight /></button>; })}</div></article>
      <aside className="enterprise-panel path-detail-panel"><span className="path-detail-index">{String(selected + 1).padStart(2, "0")}</span><p>ETAPA SELECIONADA</p><h2>{current[0]}</h2><span>{current[1]}</span><div className="path-detail-items"><div><Play /><span><strong>Aula guiada</strong><small>Video, resumo e exemplos</small></span></div><div><ListChecks /><span><strong>Aplicacao pratica</strong><small>Exercicio e checklist</small></span></div><div><ClipboardCheck /><span><strong>Validacao</strong><small>Quiz com correcao imediata</small></span></div></div>{selected === completed ? <button onClick={() => setCompleted((value) => Math.min(value + 1, FEATURED_PATH.length))}>Concluir e liberar proxima etapa <ChevronRight /></button> : selected < completed ? <button onClick={() => onNavigate("learning")}>Revisar conteudo <ChevronRight /></button> : <small className="path-locked-copy"><Lock /> Esta etapa sera liberada automaticamente.</small>}</aside>
    </section>
  </ModuleFrame>;
}

function AssessmentsModule() {
  return <ModuleFrame eyebrow="VALIDACAO DE COMPETENCIAS" title="Avaliacoes" description="Quizzes, provas e desafios praticos para comprovar conhecimento e liberar certificacoes." action={<button><ClipboardCheck /> Criar avaliacao</button>}>
    <section className="module-kpis"><article><span>Pendentes</span><strong>3</strong><small>1 vence esta semana</small></article><article><span>Nota media</span><strong>8,6</strong><small>+0,4 no mes</small></article><article><span>Taxa de aprovacao</span><strong>91%</strong><small>Meta: 90%</small></article></section>
    <div className="assessment-list">{[
      ["Prova final · SDR Nivel 2", "20 questoes", "35 min", "Obrigatoria"],
      ["Simulado de quebra de objecoes", "8 cenarios", "20 min", "Recomendado pela IA"],
      ["Avaliacao pratica de pitch", "Gravacao por voz", "10 min", "Novo"],
    ].map((item, index) => <article key={item[0]}><span className={index === 0 ? "urgent" : ""}><ClipboardCheck /></span><div><small>{item[3]}</small><h3>{item[0]}</h3><p>{item[1]} · {item[2]} · correcao automatica</p></div><button>Comecar <ChevronRight /></button></article>)}</div>
  </ModuleFrame>;
}

const QUIZ_QUESTIONS = [
  { question: "O cliente diz que a proposta esta cara. Qual e a melhor primeira resposta?", options: ["Oferecer desconto", "Defender funcionalidades", "Acolher e investigar a causa", "Cobrar uma decisao"], answer: 2, explanation: "Investigar separa falta de valor, restricao de caixa e comparacao com concorrentes antes de qualquer concessao." },
  { question: "Um proximo passo comercial de qualidade precisa conter:", options: ["Uma promessa de retorno", "Data, participantes e objetivo", "Somente a proposta", "Apenas o telefone"], answer: 1, explanation: "Um compromisso verificavel define quando, quem participa e qual decisao ou entrega deve acontecer." },
  { question: "Na descoberta, qual sequencia produz um diagnostico melhor?", options: ["Produto, preco e demo", "Situacao, problema, impacto e prioridade", "Pitch, prova e desconto", "Prazo, contrato e pagamento"], answer: 1, explanation: "A sequencia conecta contexto a consequencia e ajuda o cliente a justificar por que precisa mudar." },
  { question: "O decisor nao participou da call. O que fazer antes de enviar a proposta?", options: ["Enviar mesmo assim", "Pedir ao contato que venda internamente", "Mapear criterios e envolver o decisor", "Dar validade de 24 horas"], answer: 2, explanation: "Sem decisor e criterios claros, a proposta vira material de comparacao e perde controle comercial." },
  { question: "Qual pergunta quantifica melhor o impacto de um gargalo?", options: ["Voce gostou da solucao?", "Isso e importante?", "Quantas oportunidades voces perdem por mes?", "Posso mostrar uma tela?"], answer: 2, explanation: "Uma pergunta mensuravel transforma dor abstrata em impacto financeiro ou operacional." },
  { question: "O cliente pede desconto antes de entender a entrega. Qual conduta protege margem?", options: ["Conceder 10%", "Trocar desconto por contrapartida apos reforcar valor", "Ignorar a pergunta", "Retirar suporte"], answer: 1, explanation: "Concessoes devem vir depois de valor claro e sempre ligadas a prazo, volume ou condicao que preserve a negociacao." },
  { question: "Em uma cold call, qual abertura tende a gerar mais permissao?", options: ["Um pitch de dois minutos", "Contexto relevante, motivo curto e pergunta", "Lista de clientes", "Pedido imediato de reuniao"], answer: 1, explanation: "Relevancia e brevidade reduzem resistencia e convidam o prospect a participar da conversa." },
  { question: "Qual comportamento demonstra escuta ativa?", options: ["Preparar a resposta enquanto o cliente fala", "Repetir o pitch", "Resumir o que ouviu e confirmar", "Fazer varias perguntas juntas"], answer: 2, explanation: "Resumir e validar evita suposicoes e mostra que a resposta seguinte nasce do contexto do cliente." },
  { question: "Uma oportunidade esta parada sem urgencia. Qual e a melhor acao?", options: ["Enviar follow-ups diarios", "Criar urgencia artificial", "Revisitar impacto e consequencia de nao agir", "Dar desconto final"], answer: 2, explanation: "Urgencia sustentavel nasce da consequencia do problema, nao da pressao do vendedor." },
  { question: "Qual fechamento indica maior qualidade de pipeline?", options: ["O cliente vai pensar", "Enviei a proposta", "Reuniao decisoria agendada com criterios definidos", "Contato visualizou o e-mail"], answer: 2, explanation: "Uma reuniao decisoria com criterios e participantes confirma avanco real, nao apenas atividade." },
];

function InteractiveAssessmentsModule() {
  const [active, setActive] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const score = Math.round((QUIZ_QUESTIONS.filter((question, index) => answers[index] === question.answer).length / QUIZ_QUESTIONS.length) * 10);
  if (active) return <ModuleFrame eyebrow="AVALIACAO INTERATIVA" title="Dominio comercial essencial" description="Responda as questoes e receba correcao imediata. Nota minima para aprovacao: 7,0." action={<button onClick={() => { setActive(false); setFinished(false); setAnswers([]); }}><ArrowLeft /> Voltar</button>}>
    <section className="quiz-shell">{finished ? <div className="quiz-result"><Award /><p>RESULTADO DA AVALIACAO</p><h2>{score.toFixed(1)}</h2><strong>{score >= 9 ? "Nivel avancado. Excelente dominio comercial." : score >= 7 ? "Nivel intermediario. Proxima etapa liberada." : "Nivel em desenvolvimento. Revise os pontos abaixo."}</strong><div>{QUIZ_QUESTIONS.map((question, index) => <span className={answers[index] === question.answer ? "correct" : "wrong"} key={question.question}>{answers[index] === question.answer ? <CheckCircle2 /> : <Target />} <span><b>{question.question}</b><small>{question.explanation} Resposta correta: {question.options[question.answer]}.</small></span></span>)}</div><button onClick={() => { setFinished(false); setAnswers([]); }}>Refazer avaliacao</button></div> : <>{QUIZ_QUESTIONS.map((question, questionIndex) => <article className="quiz-question" key={question.question}><small>QUESTAO {questionIndex + 1} DE {QUIZ_QUESTIONS.length}</small><h2>{question.question}</h2><div>{question.options.map((option, optionIndex) => <button className={answers[questionIndex] === optionIndex ? "selected" : ""} onClick={() => setAnswers((currentAnswers) => { const next = [...currentAnswers]; next[questionIndex] = optionIndex; return next; })} key={option}><i>{String.fromCharCode(65 + optionIndex)}</i>{option}</button>)}</div></article>)}<button className="quiz-submit" disabled={answers.filter((answer) => answer !== undefined).length !== QUIZ_QUESTIONS.length} onClick={() => setFinished(true)}>Finalizar e corrigir <ChevronRight /></button></>}</section>
  </ModuleFrame>;
  return <ModuleFrame eyebrow="VALIDACAO DE COMPETENCIAS" title="Avaliacoes" description="Quizzes, provas e desafios praticos para comprovar conhecimento e liberar certificacoes.">
    <section className="module-kpis"><article><span>Pendentes</span><strong>3</strong><small>1 vence esta semana</small></article><article><span>Nota media</span><strong>8,6</strong><small>+0,4 no mes</small></article><article><span>Taxa de aprovacao</span><strong>91%</strong><small>Meta: 90%</small></article></section>
    <div className="assessment-list">{[["Dominio comercial essencial", "3 questoes", "5 min", "Disponivel"], ["Simulado de quebra de objecoes", "8 cenarios", "20 min", "Proximo desafio"], ["Avaliacao pratica de pitch", "Gravacao por voz", "10 min", "Em breve"]].map((item, index) => <article key={item[0]}><span className={index === 0 ? "urgent" : ""}><ClipboardCheck /></span><div><small>{item[3]}</small><h3>{item[0]}</h3><p>{item[1]} · {item[2]} · correcao automatica</p></div><button disabled={index > 0} onClick={() => index === 0 && setActive(true)}>{index === 0 ? "Comecar" : "Bloqueado"} {index === 0 ? <ChevronRight /> : <Lock />}</button></article>)}</div>
  </ModuleFrame>;
}

function GamificationModule() {
  return <ModuleFrame eyebrow="ENGAJAMENTO" title="Gamificacao" description="Reconhecimento continuo para transformar desenvolvimento em habito e resultado.">
    <section className="gamification-profile"><div className="level-ring"><strong>24</strong><span>NIVEL</span></div><div><p>SEU PROGRESSO</p><h2>Especialista Comercial</h2><span>1.840 de 2.500 XP para o proximo nivel</span><div className="enterprise-progress"><i style={{ width: "74%" }} /></div></div><dl><div><dt>XP total</dt><dd>8.640</dd></div><div><dt>Moedas</dt><dd>1.280</dd></div><div><dt>Sequencia</dt><dd>12 dias</dd></div></dl></section>
    <section className="gamification-grid"><article className="enterprise-panel"><SectionTitle eyebrow="RANKING SEMANAL" title="Melhores vendedores" aside="Atualizado agora" /><ol className="ranking-list">{[["Ana Lima", "2.840 XP"], ["Rafael Costa", "2.510 XP"], ["Marina Alves", "2.290 XP"], ["Voce", "2.110 XP"]].map((person, index) => <li key={person[0]}><b>{index + 1}</b><i>{person[0].split(" ").map((part) => part[0]).join("")}</i><span><strong>{person[0]}</strong><small>{index === 3 ? "Subiu 2 posicoes" : "Alta performance"}</small></span><em>{person[1]}</em></li>)}</ol></article><article className="enterprise-panel"><SectionTitle eyebrow="MISSOES DA SEMANA" title="Ganhe XP praticando" aside="2 de 4" /><div className="mission-list">{[["Concluir 2 simulacoes", 100], ["Analisar uma call real", 100], ["Finalizar aula de objecoes", 45], ["Manter sequencia por 7 dias", 71]].map((mission) => <div key={mission[0]}><header><strong>{mission[0]}</strong><span>{mission[1]}%</span></header><div className="enterprise-progress"><i style={{ width: `${mission[1]}%` }} /></div></div>)}</div></article></section>
  </ModuleFrame>;
}

function PerformanceModule() {
  return <ModuleFrame eyebrow="GESTAO DE DESEMPENHO" title="Performance comercial" description="Competencias, resultados e aprendizagem analisados em conjunto.">
    <section className="module-kpis"><article><span>Conversao</span><strong>24,8%</strong><small className="positive">+4,2%</small></article><article><span>Tempo de fechamento</span><strong>18 dias</strong><small className="positive">-3 dias</small></article><article><span>Nota das calls</span><strong>8,4</strong><small className="positive">+0,6</small></article><article><span>Tempo estudado</span><strong>42h</strong><small>Ultimos 30 dias</small></article></section>
    <section className="performance-grid"><article className="enterprise-panel skill-panel"><SectionTitle eyebrow="MAPA DE COMPETENCIAS" title="Nivel atual do time" aside="Meta: 8,5" />{[["Rapport", 88], ["Descoberta", 64], ["Pitch", 82], ["Objecoes", 71], ["Fechamento", 76]].map((skill) => <div key={skill[0]}><span>{skill[0]}</span><div className="enterprise-progress"><i style={{ width: `${skill[1]}%` }} /></div><strong>{Number(skill[1]) / 10}</strong></div>)}</article><article className="enterprise-panel performance-insight"><Sparkles /><p>INSIGHT PARA O GESTOR</p><h2>Descoberta limita a conversao.</h2><span>Vendedores com nota acima de 8 em descoberta convertem 32% mais neste periodo.</span><button>Ver vendedores impactados</button></article></section>
  </ModuleFrame>;
}

function ReportsModule() {
  return <ModuleFrame eyebrow="INTELIGENCIA GERENCIAL" title="Relatorios" description="Analise resultados por empresa, equipe, gestor, cargo, periodo e produto." action={<div className="export-actions"><button><Download /> PDF</button><button><Download /> Excel</button><button><Download /> CSV</button></div>}>
    <section className="report-filters">{["Empresa", "Equipe", "Gestor", "Periodo", "Produto", "Cargo"].map((filter) => <label key={filter}><span>{filter}</span><select><option>Todos</option><option>Selecao atual</option></select></label>)}</section>
    <section className="module-kpis"><article><span>ROI estimado</span><strong>3,8x</strong><small>Sobre investimento em T&D</small></article><article><span>Engajamento</span><strong>87%</strong><small>+9% no trimestre</small></article><article><span>Horas estudadas</span><strong>486h</strong><small>62 colaboradores</small></article><article><span>Conclusao</span><strong>82%</strong><small>Meta: 85%</small></article></section>
    <article className="enterprise-panel report-table"><SectionTitle eyebrow="COMPARATIVO" title="Performance por equipe" aside="Ultimos 30 dias" /><div className="data-table"><div className="head"><span>Equipe</span><span>Conversao</span><span>Nota</span><span>Treinamentos</span><span>Evolucao</span></div>{[["Inside Sales", "28,4%", "8,7", "92%", "+12%"], ["Enterprise", "22,1%", "8,4", "84%", "+7%"], ["SDR Outbound", "18,8%", "7,9", "76%", "+4%"]].map((row) => <div key={row[0]}>{row.map((cell, index) => <span className={index === 4 ? "positive" : ""} key={cell}>{cell}</span>)}</div>)}</div></article>
  </ModuleFrame>;
}

function TeamsModule({ onNavigate }: { onNavigate: Navigate }) {
  const [invite, setInvite] = useState<{ code: string; link: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const createInvite = () => {
    const code = crypto.randomUUID().replaceAll("-", "").slice(0, 9).toUpperCase();
    const link = `${window.location.origin}/?equipe=${code}`;
    setInvite({ code, link });
    setMessage("Convite criado e pronto para compartilhar.");
  };
  const joinTeam = () => {
    const code = joinCode.trim().split("/").pop()?.toUpperCase() ?? "";
    setMessage(code.length >= 6 ? `Convite ${code} validado. Voce entrou na Equipe Cavalcante.` : "Informe um codigo ou link de convite valido.");
  };
  return <ModuleFrame eyebrow="EQUIPES E PERFORMANCE" title="Pessoas, evolucao e resultado." description="Acompanhe vendedores, rankings, conversao, volume e orientacoes da IA." action={<div className="team-actions"><button onClick={() => onNavigate("performance")}><BarChart3 /> Ver estatisticas</button><button onClick={createInvite}><UserPlus /> Convidar membro</button></div>}>
    <section className="team-invite-panel"><div><p>CONVITE SEGURO</p><h2>Traga sua equipe para evoluir junto.</h2><span>Gere um codigo exclusivo ou entre com o convite recebido.</span></div>{invite && <div className="invite-created"><label>Codigo da equipe<strong>{invite.code}</strong></label><label>Link exclusivo<input readOnly value={invite.link} /></label><button onClick={() => navigator.clipboard.writeText(invite.link)}><CheckCircle2 /> Copiar link</button></div>}<div className="join-team"><input id="team-code" value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="Cole o codigo ou link do convite" /><button onClick={joinTeam}>Validar e entrar <ChevronRight /></button></div>{message && <small className="team-feedback">{message}</small>}</section>
    <section className="teams-summary"><article><Users /><span><strong>62</strong> colaboradores</span></article><article><BriefcaseBusiness /><span><strong>4</strong> equipes</span></article><article><Target /><span><strong>78%</strong> das metas</span></article></section>
    <div className="team-cards">{[
      ["Inside Sales", "Ana Martins", "18 vendedores", "8,7", "92%"],
      ["SDR Outbound", "Carlos Mendes", "22 vendedores", "7,9", "76%"],
      ["Enterprise", "Juliana Alves", "12 vendedores", "8,4", "84%"],
      ["Customer Success", "Paulo Lima", "10 vendedores", "8,1", "88%"],
    ].map((team) => <article key={team[0]}><header><span><Users /></span><button aria-label="Mais opcoes"><MoreHorizontal /></button></header><h2>{team[0]}</h2><p>Gestor: {team[1]} · {team[2]}</p><dl><div><dt>Nota media</dt><dd>{team[3]}</dd></div><div><dt>Treinamentos</dt><dd>{team[4]}</dd></div></dl><button>Ver equipe <ChevronRight /></button></article>)}</div>
  </ModuleFrame>;
}

function LibraryModule() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [category, setCategory] = useState("Todos");
  const items = useMemo(() => [
    ["Playbook de descoberta", "PDF", "12 paginas"], ["Script de Cold Call", "Template", "Atualizado hoje"],
    ["Matriz de objecoes", "Planilha", "28 respostas"], ["Pitch institucional", "Slides", "16 slides"],
    ["Checklist de fechamento", "Checklist", "9 etapas"], ["Guia de SPIN Selling", "E-book", "24 min"],
  ].filter((item) => item[0].toLowerCase().includes(query.toLowerCase()) && (category === "Todos" || item[1].toLowerCase().includes(category.toLowerCase().replace("s", "")))), [query, category]);
  return <ModuleFrame eyebrow="CONHECIMENTO COMERCIAL" title="Biblioteca IA" description="Playbooks, scripts, guias, videos e materiais praticos organizados para vender melhor." action={<button onClick={() => setNotice("Material adicionado a fila de revisao da biblioteca.")}><Upload /> Adicionar material</button>}>
    <div className="library-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por material, tema ou pergunta" /><button onClick={() => setNotice(query ? `A IA organizou os melhores materiais para: ${query}` : "Digite um tema para receber uma selecao personalizada.")}><Sparkles /> Pesquisar com IA</button></div>
    <div className="library-categories">{[["Videos", Play], ["PDFs", FileText], ["Scripts", MessageSquareText], ["Playbooks", BookOpen], ["Templates", ListChecks], ["Apresentacoes", FolderOpen]].map(([label, Icon]) => { const Component = Icon as typeof Play; return <button className={category === label ? "active" : ""} onClick={() => setCategory(category === label ? "Todos" : label as string)} key={label as string}><Component /><span>{label as string}</span></button>; })}</div>
    {notice && <div className="library-notice"><Sparkles /> {notice}</div>}
    <section><SectionTitle eyebrow="MATERIAIS EM DESTAQUE" title="Conteudo da empresa" aside={`${items.length} resultados`} /><div className="library-grid">{items.map((item) => <article key={item[0]}><span><FileText /></span><div><small>{item[1]}</small><h3>{item[0]}</h3><p>{item[2]}</p></div><button onClick={() => setNotice(`${item[0]} aberto. O material foi salvo no seu historico.`)} aria-label={`Abrir ${item[0]}`}><ChevronRight /></button></article>)}</div></section>
  </ModuleFrame>;
}

function CertificatesModule() {
  const requirements = [["Modulos concluidos", "4 de 13", 31], ["Videos obrigatorios", "4 de 13", 31], ["Avaliacoes aprovadas", "1 de 3", 33], ["Desafios praticos", "2 de 6", 33], ["Analises de call", "1 de 3", 33], ["Tempo de estudo", "6 de 20 horas", 30], ["Sequencia de aprendizagem", "4 de 7 dias", 57], ["Nota minima", "8,1 de 8,0", 100]] as const;
  const readiness = Math.round(requirements.reduce((total, item) => total + item[2], 0) / requirements.length);
  return <ModuleFrame eyebrow="CERTIFICACAO PROFISSIONAL" title="Seu certificado esta em construcao." description="Conclua toda a jornada e comprove dominio pratico antes da emissao.">
    <section className="certificate-lock"><div className="certificate-lock-visual"><span><Lock /></span><p>CERTIFICADO BLOQUEADO</p><h2>Especialista em Vendas Consultivas</h2><small>A emissao sera liberada automaticamente quando todos os criterios chegarem a 100%.</small><div className="enterprise-progress"><i style={{ width: `${readiness}%` }} /></div><strong>{readiness}% pronto para certificacao</strong></div><div className="certificate-paper"><header><Image src={BRAND_LOGO} alt="Performa AI" width={42} height={42} /><strong>Performa <b>AI</b></strong><small>CERTIFICADO DE CONCLUSAO</small></header><p>Certificamos que</p><h2>Nome do participante</h2><p>concluiu a formacao <b>Especialista em Vendas Consultivas</b>, demonstrando dominio teorico e pratico das competencias comerciais avaliadas.</p><footer><div><Image src={FOUNDER_SIGNATURE} alt="Assinatura do fundador" width={180} height={75} /><i /><strong>Enzo Cavalcante</strong><small>Fundador, Performa AI</small></div><span><ShieldCheck /><b>VALIDACAO DIGITAL</b><small>PERFORMA-2026-0001</small></span></footer><em><Lock /> Previa protegida ate a conclusao</em></div><div className="certificate-requirements">{requirements.map(([label, value, progress]) => <article key={label}><header><span>{label}</span><strong>{value}</strong></header><div className="enterprise-progress"><i style={{ width: `${progress}%` }} /></div></article>)}</div></section>
    <aside className="certificate-next"><Sparkles /><div><strong>Proxima acao recomendada</strong><span>Conclua o treinamento de qualificacao e faca a avaliacao para aumentar sua prontidao.</span></div><button>Continuar jornada <ChevronRight /></button></aside>
  </ModuleFrame>;
}

function NotificationsModule() {
  return <ModuleFrame eyebrow="CENTRAL DE ATUALIZACOES" title="Notificacoes" description="Prioridades, conquistas e movimentacoes importantes da sua jornada.">
    <div className="notification-list">{[
      ["Nova call analisada", "Seu relatorio esta pronto. A nota geral foi 8,7.", "Agora", FileAudio, true],
      ["Treinamento recomendado", "A IA adicionou Descoberta que gera urgencia a sua trilha.", "18 min", Sparkles, true],
      ["Ranking atualizado", "Voce subiu duas posicoes no ranking semanal.", "1 hora", Trophy, true],
      ["Certificado emitido", "Seu certificado de Vendas Consultivas esta disponivel.", "Ontem", Award, false],
      ["Missao quase concluida", "Falta uma simulacao para ganhar 300 XP.", "Ontem", Target, false],
    ].map(([title, text, time, Icon, unread]) => { const Component = Icon as typeof Bell; return <article className={unread ? "unread" : ""} key={title as string}><span><Component /></span><div><header><strong>{title as string}</strong><small>{time as string}</small></header><p>{text as string}</p></div><button aria-label="Mais opcoes"><MoreHorizontal /></button></article>; })}</div>
  </ModuleFrame>;
}

function SettingsModule() {
  return <ModuleFrame eyebrow="ADMINISTRACAO" title="Configuracoes" description="Controle usuarios, permissoes, identidade, integracoes e faturamento.">
    <div className="settings-grid">{[
      ["Empresa e identidade", "Logotipo, cores, dados e personalizacao.", BriefcaseBusiness],
      ["Usuarios e permissoes", "Perfis de administrador, gestor e vendedor.", Users],
      ["IA e automacoes", "Comportamento, recomendacoes e limites de uso.", Bot],
      ["Conteudos e categorias", "Cursos, trilhas, cargos e organizacao.", FolderOpen],
      ["Integracoes", "CRM, reunioes, webhooks e ferramentas externas.", Zap],
      ["Plano e faturamento", "Assinatura, consumo, pagamentos e notas.", FileText],
      ["Seguranca e privacidade", "Acesso, auditoria, retencao e LGPD.", ShieldCheck],
      ["Gamificacao", "XP, moedas, badges, desafios e recompensas.", Trophy],
    ].map(([title, text, Icon]) => { const Component = Icon as typeof Settings; return <button key={title as string}><span><Component /></span><div><strong>{title as string}</strong><small>{text as string}</small></div><ChevronRight /></button>; })}</div>
  </ModuleFrame>;
}

export function EnterpriseModule({ view, onNavigate }: { view: EnterpriseView; onNavigate: Navigate }) {
  if (view === "dashboard") return <EnterpriseDashboard onNavigate={onNavigate} />;
  if (view === "learning") return <LearningModule onNavigate={onNavigate} />;
  if (view === "paths") return <FixedPathsModule onNavigate={onNavigate} />;
  if (view === "assessments") return <InteractiveAssessmentsModule />;
  if (view === "gamification") return <GamificationModule />;
  if (view === "performance") return <PerformanceModule />;
  if (view === "reports") return <ReportsModule />;
  if (view === "teams") return <TeamsModule onNavigate={onNavigate} />;
  if (view === "library") return <LibraryModule />;
  if (view === "certificates") return <CertificatesModule />;
  if (view === "notifications") return <NotificationsModule />;
  if (view === "settings") return <SettingsModule />;
  return null;
}

function ModuleFrame({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="enterprise-page"><header className="enterprise-page-heading"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action && <div className="enterprise-heading-actions">{action}</div>}</header>{children}</div>;
}

function SectionTitle({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: string }) {
  return <header className="enterprise-section-title"><div><p>{eyebrow}</p><h2>{title}</h2></div>{aside && <span>{aside}</span>}</header>;
}
