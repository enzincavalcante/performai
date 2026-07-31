"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Flame,
  Headphones,
  Library,
  Lightbulb,
  Lock,
  MessageSquareText,
  Mic,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { EnterpriseView } from "./EnterprisePlatform";
import "./premium-training.css";

type ModuleIcon = typeof BookOpen;
type TrainingModule = {
  id: string;
  number: number;
  title: string;
  description: string;
  outcome: string;
  level: string;
  hours: string;
  color: string;
  icon: ModuleIcon;
  videoId: string;
  lessons: string[];
};

const MODULES: TrainingModule[] = [
  { id: "fundamentos", number: 1, title: "Fundamentos de Vendas", description: "Mentalidade, disciplina e processo comercial moderno.", outcome: "Construa a base comportamental de um vendedor de alta performance.", level: "Essencial", hours: "4h 20min", color: "blue", icon: Star, videoId: "4XpoIWWaja4", lessons: ["Mentalidade comercial", "Vendedores de alta performance", "Processo comercial moderno", "Perfil dos melhores vendedores", "Disciplina e consistencia"] },
  { id: "produto", number: 2, title: "Conhecimento de Produto", description: "Domine valor, beneficios e diferenciais da sua oferta.", outcome: "Apresente valor com seguranca sem cair em uma lista de funcionalidades.", level: "Essencial", hours: "3h 45min", color: "violet", icon: BriefcaseBusiness, videoId: "MPRP2eGXdFM", lessons: ["Dominio da oferta", "Caracteristica versus beneficio", "Construcao de diferenciais", "Prova e confianca", "Estudo de caso: pitch de valor"] },
  { id: "prospeccao", number: 3, title: "Prospeccao Multicanal", description: "Inbound, outbound, cold call, email, WhatsApp e LinkedIn.", outcome: "Crie abordagens relevantes e aumente respostas positivas.", level: "Intermediario", hours: "6h 10min", color: "cyan", icon: Target, videoId: "ZPSv41d-bMM", lessons: ["Inbound e velocidade no lead", "Estrategia outbound", "Cold call em 30 segundos", "Cold email que gera resposta", "WhatsApp comercial", "LinkedIn e prospeccao ativa"] },
  { id: "processo", number: 4, title: "Processo Comercial Completo", description: "Da qualificacao ao pos-venda, sem etapas perdidas.", outcome: "Conduza oportunidades com previsibilidade e controle.", level: "Intermediario", hours: "8h 30min", color: "green", icon: BarChart3, videoId: "03K40pFJ3Iw", lessons: ["Diagnostico", "Qualificacao", "Reuniao comercial", "Apresentacao da solucao", "Negociacao", "Fechamento", "Pos-venda e indicacoes"] },
  { id: "objecoes", number: 5, title: "Contorno de Objecoes", description: "Preco, tempo, concorrencia, confianca e indecisao.", outcome: "Investigue a resistencia real e responda sem perder valor.", level: "Avancado", hours: "5h 40min", color: "red", icon: MessageSquareText, videoId: "MPRP2eGXdFM", lessons: ["Diagnostico da objecao real", "Objecao de preco", "Agora nao e falta de tempo", "Comparacao com concorrentes", "Vou pensar e falta de confianca", "Laboratorio de respostas"] },
  { id: "pitch", number: 6, title: "Pitch de Vendas", description: "Pitches curtos, consultivos, SPIN e Challenger.", outcome: "Adapte sua mensagem ao canal, ao cliente e ao momento da compra.", level: "Intermediario", hours: "5h 15min", color: "orange", icon: Mic, videoId: "gwuAOJcWauc", lessons: ["Pitch de 30 segundos", "Pitch de 1 minuto", "Pitch consultivo", "Pitch SPIN", "Pitch Challenger", "Pitch para WhatsApp", "Pitch para ligacao e reuniao"] },
  { id: "fechamento", number: 7, title: "Tecnicas de Fechamento", description: "Valor, compromisso, urgencia e fechamento consultivo.", outcome: "Transforme interesse em um proximo passo objetivo e verificavel.", level: "Avancado", hours: "4h 50min", color: "blue", icon: CircleDollarSign, videoId: "gwuAOJcWauc", lessons: ["Sinais de compra", "Fechamento por valor", "Urgencia genuina", "Compromisso progressivo", "Fechamento consultivo", "Simulacao de venda complexa"] },
  { id: "crm", number: 8, title: "CRM e Pipeline", description: "Organizacao, follow-up, agenda e oportunidades.", outcome: "Use o CRM como sistema de decisao, nao como arquivo de contatos.", level: "Essencial", hours: "4h 05min", color: "violet", icon: Library, videoId: "OfzUsYZoDGE", lessons: ["Fundamentos de CRM", "Pipeline bem definido", "Cadastro e qualidade dos dados", "Follow-up e agendamento", "Controle de oportunidades", "Exercicio no CRM ficticio"] },
  { id: "comunicacao", number: 9, title: "Comunicacao Comercial", description: "Tom, persuasao, escuta, rapport e perguntas.", outcome: "Comunique com clareza, confianca e adaptacao ao cliente.", level: "Intermediario", hours: "6h", color: "cyan", icon: Headphones, videoId: "HCtZ55hL0Bc", lessons: ["Tom de voz", "Persuasao responsavel", "Escuta ativa", "Rapport profissional", "Linguagem corporal", "Perguntas inteligentes", "Comunicacao consultiva"] },
  { id: "produtividade", number: 10, title: "Produtividade Comercial", description: "Metas, planejamento, foco, tempo, habitos e disciplina.", outcome: "Crie uma rotina comercial sustentavel que protege as prioridades.", level: "Essencial", hours: "7h 25min", color: "green", icon: Zap, videoId: "40tgo5_1_LI", lessons: ["Objetivos e metas", "Planejamento semanal", "Planejamento diario", "Priorizacao comercial", "Gestao do tempo", "Procrastinacao e habitos", "Organizacao pessoal e profissional", "Rotina de alta performance"] },
  { id: "inteligencia", number: 11, title: "Inteligencia Comercial", description: "Conversao, CAC, LTV, ROI, forecast e KPIs.", outcome: "Leia os numeros e transforme dados em decisoes comerciais.", level: "Avancado", hours: "6h 35min", color: "orange", icon: Brain, videoId: "tYNk3pyyfVM", lessons: ["Metricas que importam", "Taxa de conversao", "CAC e eficiencia", "LTV e retencao", "ROI comercial", "KPIs e forecast", "Dashboard de pipeline"] },
  { id: "atendimento", number: 12, title: "Atendimento e Pos-venda", description: "Experiencia, empatia, fidelizacao e indicacoes.", outcome: "Transforme clientes em promotores e novas oportunidades.", level: "Intermediario", hours: "4h 40min", color: "red", icon: Users, videoId: "HCtZ55hL0Bc", lessons: ["Experiencia do cliente", "Atendimento consultivo", "Empatia aplicada", "Primeiro valor no pos-venda", "Fidelizacao", "Indicacoes e expansao"] },
];

const BENEFITS = [
  "Otimizar o processo comercial",
  "Reduzir o ciclo de vendas",
  "Melhorar a experiencia do cliente",
  "Dominar produtos e servicos",
  "Aumentar produtividade",
  "Reduzir turnover",
  "Melhorar comunicacao",
  "Melhorar atendimento",
  "Elevar a taxa de conversao",
  "Melhorar fechamento",
  "Aumentar receita",
];
const STORAGE_KEY = "performai_premium_training_progress";

function readProgress(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function PremiumTrainingAcademy({ onNavigate }: { onNavigate: (view: EnterpriseView) => void }) {
  const [selected, setSelected] = useState<TrainingModule | null>(null);
  const [lesson, setLesson] = useState(0);
  const [panel, setPanel] = useState<"content" | "exercise" | "quiz" | "mentor">("content");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [progress, setProgress] = useState<Record<string, number[]>>({});
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [exerciseDone, setExerciseDone] = useState([false, false, false]);
  const [notice, setNotice] = useState("");

  useEffect(() => { setProgress(readProgress()); }, []);
  const saveProgress = (next: Record<string, number[]>) => { setProgress(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const moduleProgress = (module: TrainingModule) => Math.round(((progress[module.id]?.length ?? 0) / module.lessons.length) * 100);
  const completedLessons = Object.values(progress).reduce((total, items) => total + items.length, 0);
  const totalLessons = MODULES.reduce((total, module) => total + module.lessons.length, 0);
  const overall = Math.round(completedLessons / totalLessons * 100);
  const completedModules = MODULES.filter((module) => moduleProgress(module) === 100).length;
  const visible = useMemo(() => MODULES.filter((module) => (filter === "Todos" || module.level === filter) && `${module.title} ${module.description} ${module.lessons.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query, filter]);

  const openModule = (module: TrainingModule) => { setSelected(module); setLesson(0); setPanel("content"); setQuizAnswer(null); setExerciseDone([false, false, false]); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const markLesson = () => {
    if (!selected) return;
    const completed = new Set(progress[selected.id] ?? []); completed.add(lesson);
    saveProgress({ ...progress, [selected.id]: [...completed] });
    setNotice("Aula concluida: +120 XP e 30 moedas");
    window.setTimeout(() => setNotice(""), 2800);
    if (lesson < selected.lessons.length - 1) { setLesson(lesson + 1); setPanel("content"); setQuizAnswer(null); setExerciseDone([false, false, false]); }
  };
  const downloadMaterial = () => {
    if (!selected) return;
    const content = `PERFORMA AI\n${selected.title}\n${selected.lessons[lesson]}\n\nRESUMO\n${selected.outcome}\n\nCHECKLIST\n- Entendi o conceito\n- Consigo aplicar em uma conversa\n- Sei reconhecer o erro mais comum\n- Defini uma acao pratica`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${selected.id}-aula-${lesson + 1}.txt`; link.click(); URL.revokeObjectURL(url);
  };

  if (selected) {
    const Icon = selected.icon;
    const completed = progress[selected.id]?.includes(lesson) ?? false;
    const percent = moduleProgress(selected);
    return <div className="premium-academy lesson-workspace">
      {notice && <div className="academy-toast"><Award /> {notice}</div>}
      <header className="lesson-topbar"><button onClick={() => setSelected(null)}><ArrowLeft /> Voltar para trilhas</button><div><span>{selected.title}</span><strong>{percent}% concluido</strong><i><b style={{ width: `${percent}%` }} /></i></div></header>
      <section className="lesson-hero"><div className={`academy-icon ${selected.color}`}><Icon /></div><div><small>MODULO {selected.number} · AULA {lesson + 1} DE {selected.lessons.length}</small><h1>{selected.lessons[lesson]}</h1><p>{selected.outcome}</p></div><aside><span><Clock3 /> 35 minutos</span><span><Star /> 120 XP</span><span><Trophy /> 30 moedas</span></aside></section>
      <nav className="lesson-tabs"><button className={panel === "content" ? "active" : ""} onClick={() => setPanel("content")}><Play /> Aula</button><button className={panel === "exercise" ? "active" : ""} onClick={() => setPanel("exercise")}><Target /> Exercicio</button><button className={panel === "quiz" ? "active" : ""} onClick={() => setPanel("quiz")}><Lightbulb /> Quiz</button><button className={panel === "mentor" ? "active" : ""} onClick={() => setPanel("mentor")}><Sparkles /> IA Mentor</button></nav>
      <div className="lesson-layout">
        <main>
          {panel === "content" && <div className="lesson-content"><div className="academy-video"><iframe src={`https://www.youtube-nocookie.com/embed/${selected.videoId}`} title={selected.lessons[lesson]} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><section><small>CONCEITO APLICADO</small><h2>O que voce precisa dominar</h2><p>{selected.outcome} Nesta aula, voce aprende o conceito, reconhece os erros mais comuns e transforma o conhecimento em uma acao observavel na rotina comercial.</p><div className="lesson-summary"><Lightbulb /><span><strong>Resumo executivo</strong><p>Use o metodo em uma situacao real, confirme o entendimento do cliente e registre o resultado. Conhecimento comercial so vira competencia quando aparece no comportamento.</p></span></div><h3>Aplicacao em campo</h3><ol><li>Prepare o objetivo antes da conversa.</li><li>Use uma pergunta para validar o contexto.</li><li>Aplique a tecnica sem parecer decorado.</li><li>Registre o que funcionou e o que precisa mudar.</li></ol></section></div>}
          {panel === "exercise" && <section className="academy-exercise"><small>EXERCICIO PRATICO</small><h2>Transforme o conceito em comportamento</h2><p>Conclua as tres entregas antes de marcar a aula como finalizada.</p>{["Escreva como voce aplica esta tecnica hoje.", "Crie uma frase melhor para usar na proxima conversa.", "Defina uma metrica para saber se funcionou."].map((item, index) => <button className={exerciseDone[index] ? "done" : ""} onClick={() => setExerciseDone((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} key={item}><span>{exerciseDone[index] ? <Check /> : index + 1}</span><strong>{item}</strong></button>)}<div className="case-study"><BriefcaseBusiness /><div><small>ESTUDO DE CASO</small><h3>O cliente interrompe e pede objetividade.</h3><p>Explique em ate tres frases como voce adaptaria a tecnica desta aula sem perder o controle da conversa.</p><textarea placeholder="Escreva sua resposta e leve para a simulacao..." /></div></div><button className="practice-cta" onClick={() => onNavigate("simulation")}><Mic /> Praticar com cliente de IA <ArrowRight /></button></section>}
          {panel === "quiz" && <section className="academy-quiz"><header><div><small>QUIZ INTELIGENTE · 1 DE 3</small><h2>Qual atitude demonstra melhor dominio desta aula?</h2></div><span>+80 XP</span></header>{["Repetir o mesmo roteiro para todos os clientes.", "Adaptar o metodo ao contexto e confirmar o entendimento.", "Apresentar o maior numero possivel de informacoes.", "Acelerar a conversa antes de ouvir o cliente."].map((answer, index) => <button className={quizAnswer === index ? index === 1 ? "correct" : "wrong" : ""} disabled={quizAnswer !== null} onClick={() => setQuizAnswer(index)} key={answer}><span>{String.fromCharCode(65 + index)}</span>{answer}</button>)}{quizAnswer !== null && <div className={quizAnswer === 1 ? "quiz-feedback correct" : "quiz-feedback wrong"}>{quizAnswer === 1 ? <CheckCircle2 /> : <Target />}<span><strong>{quizAnswer === 1 ? "Resposta correta" : "Ainda nao"}</strong><p>Alta performance exige adaptar a tecnica ao contexto e validar se o cliente acompanhou o raciocinio. O metodo orienta; ele nao substitui a escuta.</p></span></div>}<button className="quiz-reset" disabled={quizAnswer === null} onClick={() => setQuizAnswer(null)}>Refazer pergunta</button></section>}
          {panel === "mentor" && <section className="lesson-mentor"><BotFace /><div><small>IA ESPECIALIZADA NESTE MODULO</small><h2>Tire duvidas sobre {selected.lessons[lesson]}</h2><p>O AI Coach recebe o contexto desta aula e ajuda a aplicar o conteudo em uma situacao real da sua operacao.</p><div>{["Explique com outro exemplo", "Corrija minha abordagem", "Crie um exercicio", "Mostre os erros comuns"].map((item) => <button onClick={() => onNavigate("ai")} key={item}>{item}<ChevronRight /></button>)}</div><button className="mentor-main" onClick={() => onNavigate("ai")}><Sparkles /> Abrir conversa com AI Coach</button></div></section>}
        </main>
        <aside className="lesson-sidebar"><header><small>CONTEUDO DO MODULO</small><h2>{selected.lessons.length} aulas</h2></header>{selected.lessons.map((item, index) => <button className={lesson === index ? "active" : progress[selected.id]?.includes(index) ? "completed" : ""} onClick={() => { setLesson(index); setPanel("content"); setQuizAnswer(null); }} key={item}><span>{progress[selected.id]?.includes(index) ? <Check /> : index + 1}</span><div><strong>{item}</strong><small>{progress[selected.id]?.includes(index) ? "Concluida · revisar" : "35 min · 120 XP"}</small></div><ChevronRight /></button>)}<div className="lesson-tools"><button onClick={downloadMaterial}><Download /> Baixar material</button><button onClick={() => onNavigate("assessments")}><Lightbulb /> Avaliacao final</button></div></aside>
      </div>
      <footer className="lesson-footer"><div>{completed ? <><CheckCircle2 /><span><strong>Aula concluida</strong><small>Voce pode revisar e refazer as atividades quando quiser.</small></span></> : <><Target /><span><strong>Conclua sua jornada</strong><small>Assista, pratique e valide o conhecimento.</small></span></>}</div><button onClick={markLesson}>{completed ? "Continuar evolucao" : "Concluir aula"}<ArrowRight /></button></footer>
    </div>;
  }

  return <div className="premium-academy">
    <section className="academy-hero"><Image src="/brand/sales-academy-cover.png" alt="Equipe comercial em treinamento" fill priority sizes="(max-width: 900px) 100vw, 1200px" /><div className="academy-hero-overlay" /><div className="academy-hero-copy"><span><Sparkles /> ACADEMIA DE ALTA PERFORMANCE</span><h1>Desenvolva vendedores.<br />Construa resultados.</h1><p>Uma jornada completa de vendas, da mentalidade ao fechamento, com pratica, IA, desafios e evolucao mensuravel.</p><div><button onClick={() => openModule(MODULES.find((module) => moduleProgress(module) < 100) ?? MODULES[0])}><Play /> Continuar treinamento</button><button onClick={() => onNavigate("teams")}><Users /> Visao do gestor</button></div></div><aside><div><strong>{overall}%</strong><span>Progresso geral</span></div><div><strong>{completedLessons}</strong><span>Aulas concluidas</span></div><div><strong>{completedLessons * 120}</strong><span>XP conquistado</span></div></aside></section>
    <section className="academy-status"><div><span><Flame /></span><strong>7 dias</strong><small>sequencia atual</small></div><div><span><Trophy /></span><strong>Nivel 12</strong><small>Closer intermediario</small></div><div><span><Award /></span><strong>{completedModules}</strong><small>certificados liberados</small></div><div className="academy-week"><header><span>Meta semanal</span><strong>72 de 120 min</strong></header><i><b style={{ width: "60%" }} /></i><small>Mais 48 minutos para ganhar +300 XP</small></div></section>
    <section className="academy-intro"><div><small>TRILHA MASTER</small><h2>12 modulos para dominar a operacao comercial.</h2><p>Avance no seu ritmo. Aulas concluidas continuam abertas para revisao, novos exercicios e melhoria de nota.</p></div><button onClick={() => onNavigate("certificates")}><Award /> Ver certificados</button></section>
    <section className="academy-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar aula, tecnica ou habilidade" /></label><div>{["Todos", "Essencial", "Intermediario", "Avancado"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></section>
    <section className="academy-grid">{visible.map((module) => { const Icon = module.icon; const percent = moduleProgress(module); return <button className="academy-card" onClick={() => openModule(module)} key={module.id}><header><span className={`academy-icon ${module.color}`}><Icon /></span><b>MODULO {String(module.number).padStart(2, "0")}</b><em>{module.level}</em></header><h3>{module.title}</h3><p>{module.description}</p><div className="academy-card-meta"><span><BookOpen /> {module.lessons.length} aulas</span><span><Clock3 /> {module.hours}</span></div><footer><div><span>{percent}% concluido</span><i><b style={{ width: `${percent}%` }} /></i></div><strong>{percent === 100 ? "Revisar modulo" : percent > 0 ? "Continuar" : "Comecar"}<ChevronRight /></strong></footer></button>; })}</section>
    <section className="academy-benefits"><header><small>IMPACTO NA OPERACAO</small><h2>Treinamento ligado ao resultado.</h2></header><div>{BENEFITS.map((item) => <span key={item}><CheckCircle2 /> {item}</span>)}</div></section>
    <section className="academy-master"><div><Award /><span><small>CERTIFICACAO FINAL</small><h2>Master em Alta Performance Comercial</h2><p>Conclua os 12 modulos, as avaliacoes e os desafios praticos para conquistar a certificacao completa.</p></span></div><aside><strong>{overall}%</strong><i><b style={{ width: `${overall}%` }} /></i><button disabled={overall < 100} onClick={() => onNavigate("certificates")}>{overall < 100 ? <><Lock /> Em andamento</> : <>Ver certificado <ArrowRight /></>}</button></aside></section>
  </div>;
}

function BotFace() { return <div className="bot-face"><Brain /><i /></div>; }
