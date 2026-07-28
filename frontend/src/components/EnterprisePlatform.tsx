"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Award, BarChart3, Bell, BookOpen, Bot, Brain, BriefcaseBusiness,
  CheckCircle2, ChevronRight, ClipboardCheck, Download, FileAudio,
  FileText, FolderOpen, GraduationCap, LayoutDashboard, Library,
  LineChart, ListChecks, Medal, Menu, MessageSquareText, Mic,
  MoreHorizontal, Play, Search, Settings, ShieldCheck, Sparkles,
  Star, Target, Trophy, Upload, UserPlus, Users, X, Zap,
} from "lucide-react";
import "./enterprise.css";

export type EnterpriseView =
  | "dashboard" | "learning" | "simulation" | "ai" | "calls" | "paths"
  | "assessments" | "gamification" | "performance" | "reports" | "teams"
  | "library" | "certificates" | "notifications" | "settings";

type Navigate = (view: EnterpriseView) => void;

const BRAND_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/performai-logo.png`;

const NAVIGATION: { id: EnterpriseView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "learning", label: "Treinamentos", icon: GraduationCap },
  { id: "simulation", label: "Simulacao por voz", icon: Mic },
  { id: "ai", label: "IA Comercial", icon: Bot },
  { id: "calls", label: "Analise de Calls", icon: FileAudio },
  { id: "paths", label: "Trilhas", icon: Target },
  { id: "assessments", label: "Avaliacoes", icon: ClipboardCheck },
  { id: "gamification", label: "Gamificacao", icon: Trophy },
  { id: "performance", label: "Desempenho", icon: BarChart3 },
  { id: "reports", label: "Relatorios", icon: LineChart },
  { id: "teams", label: "Equipes", icon: Users },
  { id: "library", label: "Biblioteca", icon: Library },
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
  { title: "Descoberta que gera urgencia", category: "Diagnostico", level: "Intermediario", time: "1h 25min", progress: 72, tone: "blue" },
  { title: "Objecoes sem conceder desconto", category: "Negociacao", level: "Avancado", time: "58min", progress: 35, tone: "purple" },
  { title: "Cold Call: primeiros 30 segundos", category: "Prospeccao", level: "Essencial", time: "42min", progress: 0, tone: "cyan" },
  { title: "Fechamento e proximos passos", category: "Closer", level: "Intermediario", time: "1h 10min", progress: 0, tone: "green" },
];

function LearningModule({ onNavigate }: { onNavigate: Navigate }) {
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", "Prospeccao", "SDR", "Closer", "Negociacao", "Objecoes", "Lideranca"];
  return <ModuleFrame eyebrow="APRENDIZAGEM" title="Treinamentos" description="Conteudos personalizados para desenvolver as habilidades que mais impactam o resultado comercial." action={<button><Upload /> Adicionar conteudo</button>}>
    <div className="enterprise-search-row"><label><Search /><input placeholder="Pesquisar cursos, tecnicas ou habilidades" /></label><div>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    <section className="course-feature"><div><p>RECOMENDADO PELA IA</p><h2>Fortaleca a descoberta antes do pitch.</h2><span>Uma selecao baseada nas calls e simulacoes mais recentes do seu time.</span><button onClick={() => onNavigate("paths")}><Play /> Iniciar recomendacao</button></div><Brain /></section>
    <section><SectionTitle eyebrow="CONTINUE DE ONDE PAROU" title="Sua aprendizagem" aside="4 treinamentos" /><div className="course-grid">{COURSE_DATA.map((course) => <article className="course-card" key={course.title}><div className={`course-cover ${course.tone}`}><Play /><span>{course.category}</span></div><div className="course-card-body"><small>{course.level} · {course.time}</small><h3>{course.title}</h3><div className="enterprise-progress"><i style={{ width: `${course.progress}%` }} /></div><footer><span>{course.progress ? `${course.progress}% concluido` : "Ainda nao iniciado"}</span><button aria-label={`Abrir ${course.title}`}><ChevronRight /></button></footer></div></article>)}</div></section>
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

function TeamsModule() {
  return <ModuleFrame eyebrow="GESTAO DE PESSOAS" title="Equipes" description="Organize liderancas, metas, treinamentos e desempenho por estrutura comercial." action={<button><UserPlus /> Convidar vendedor</button>}>
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
  const items = useMemo(() => [
    ["Playbook de descoberta", "PDF", "12 paginas"], ["Script de Cold Call", "Template", "Atualizado hoje"],
    ["Matriz de objecoes", "Planilha", "28 respostas"], ["Pitch institucional", "Slides", "16 slides"],
    ["Checklist de fechamento", "Checklist", "9 etapas"], ["Guia de SPIN Selling", "E-book", "24 min"],
  ].filter((item) => item[0].toLowerCase().includes(query.toLowerCase())), [query]);
  return <ModuleFrame eyebrow="CONHECIMENTO COMERCIAL" title="Biblioteca" description="Playbooks, scripts, videos e materiais organizados e pesquisaveis pela IA." action={<button><Upload /> Adicionar material</button>}>
    <div className="library-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por material, tema ou pergunta" /><button><Sparkles /> Pesquisar com IA</button></div>
    <div className="library-categories">{[["Videos", Play], ["PDFs", FileText], ["Scripts", MessageSquareText], ["Playbooks", BookOpen], ["Templates", ListChecks], ["Apresentacoes", FolderOpen]].map(([label, Icon]) => { const Component = Icon as typeof Play; return <button key={label as string}><Component /><span>{label as string}</span></button>; })}</div>
    <section><SectionTitle eyebrow="MATERIAIS EM DESTAQUE" title="Conteudo da empresa" aside={`${items.length} resultados`} /><div className="library-grid">{items.map((item) => <article key={item[0]}><span><FileText /></span><div><small>{item[1]}</small><h3>{item[0]}</h3><p>{item[2]}</p></div><button aria-label={`Abrir ${item[0]}`}><ChevronRight /></button></article>)}</div></section>
  </ModuleFrame>;
}

function CertificatesModule() {
  return <ModuleFrame eyebrow="CERTIFICACOES" title="Meus certificados" description="Comprove habilidades e compartilhe conquistas profissionais.">
    <section className="certificate-highlight"><div><Award /><p>CERTIFICACAO MAIS RECENTE</p><h2>Especialista em Vendas Consultivas</h2><span>Concluido em 24 de julho de 2026 · 12 horas</span><div><button><Download /> Baixar certificado</button><button>Compartilhar</button></div></div><ShieldCheck /></section>
    <div className="certificate-grid">{[["Formacao SDR", "10 horas", "18/07/2026"], ["Dominio de Objecoes", "6 horas", "04/07/2026"], ["Cold Call Essencial", "4 horas", "21/06/2026"]].map((item) => <article key={item[0]}><Medal /><small>PERFORMA AI</small><h3>{item[0]}</h3><p>{item[1]} · {item[2]}</p><footer><span>Certificado validado</span><button><Download /></button></footer></article>)}</div>
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
  if (view === "paths") return <PathsModule />;
  if (view === "assessments") return <AssessmentsModule />;
  if (view === "gamification") return <GamificationModule />;
  if (view === "performance") return <PerformanceModule />;
  if (view === "reports") return <ReportsModule />;
  if (view === "teams") return <TeamsModule />;
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
