"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Activity, ArrowLeft, ArrowRight, BadgeDollarSign, BookOpen,
  Check, CheckCircle, ChevronRight, CircleHelp, Eye, EyeOff, FileAudio, FileWarning,
  Lightbulb, LockKeyhole, LogOut, Medal, Mic, MicOff, Play, Search, ShieldAlert,
  Sparkles, Target, TrendingUp, Trophy, UserRound, Users, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type TranscriptMessage, useLiveAudio } from "@/hooks/useLiveAudio";
import { CallReview } from "@/components/CallReview";
import { NextGenCoach } from "@/components/NextGenCoach";
import { CommercialStrategies } from "@/components/CommercialStrategies";
import { CommercialCoach } from "@/components/CommercialCoach";
import { LandingPage } from "@/components/LandingPage";
import { EnterpriseModule, EnterpriseSidebar, type EnterpriseView } from "@/components/EnterprisePlatform";

const DEMO_USER = "Cavalcante";
const DEMO_PASSWORD = "1234";
const BRAND_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/performai-logo.png`;
const EXECUTIVE_BUYER = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/executive-buyer.png`;
const WEEKLY_USAGE_PREFIX = "performai_weekly_usage";

function currentWeekKey() {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  return `${WEEKLY_USAGE_PREFIX}_${monday.toISOString().slice(0, 10)}`;
}

function readWeeklyUsage() {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(currentWeekKey()) ?? 0);
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const PERSONAS = [
  { id: "skeptic", name: "CTO cetico", desc: "Interrompe, exige provas e combate buzzwords.", icon: Activity },
  { id: "budget_guardian", name: "CFO guardiao do orcamento", desc: "Pressiona por ROI, custo e previsibilidade.", icon: BadgeDollarSign },
  { id: "procurement", name: "Compras agressivo", desc: "Acelera a conversa e negocia cada detalhe.", icon: FileWarning },
  { id: "ceo", name: "CEO estrategico", desc: "Quer impacto no negocio, velocidade e uma decisao clara.", icon: TrendingUp },
  { id: "aggressive_customer", name: "Cliente agressivo", desc: "Interrompe, pressiona e testa sua seguranca sob tensao.", icon: ShieldAlert },
  { id: "rude_customer", name: "Cliente mal-educado", desc: "Responde com impaciencia e pouco interesse na conversa.", icon: UserRound },
  { id: "price_sensitive", name: "Cliente que reclama do preco", desc: "Compara alternativas e insiste em desconto.", icon: BadgeDollarSign },
  { id: "sales_director", name: "Diretor comercial", desc: "Cobra impacto em meta, conversao, ciclo e pipeline.", icon: TrendingUp },
  { id: "operations_manager", name: "Gerente de operacoes", desc: "Questiona implantacao, integracoes e impacto na rotina.", icon: Activity },
  { id: "smb_founder", name: "Fundador de PME", desc: "Protege o caixa e exige prova pratica de retorno rapido.", icon: ShieldAlert },
];

const TRAINING_MODES = [
  { id: "pitch", title: "Pitch de valor", desc: "Comunique valor sem cair em discurso generico.", icon: Sparkles },
  { id: "discovery", title: "Descoberta", desc: "Faca perguntas melhores e encontre a dor real.", icon: CircleHelp },
  { id: "objections", title: "Objecoes", desc: "Responda pressao com clareza e evidencia.", icon: ShieldAlert },
  { id: "closing", title: "Fechamento", desc: "Conduza a conversa para um proximo passo claro.", icon: Target },
];

const CONVERSATION_SCENARIOS = [
  {
    id: "price_objection",
    title: "Objecao de preco",
    desc: "O cliente gostou, mas considera o investimento alto.",
    prompt: "O cliente gostou da solucao, mas disse que o preco esta acima do orcamento e pediu um desconto.",
  },
  {
    id: "competitor",
    title: "Comparacao com concorrente",
    desc: "Outra empresa promete entregar o mesmo por menos.",
    prompt: "O cliente esta comparando a proposta com um concorrente mais barato e quer entender por que deveria escolher nossa solucao.",
  },
  {
    id: "no_priority",
    title: "Sem prioridade agora",
    desc: "Existe interesse, mas o projeto pode ser adiado.",
    prompt: "O cliente reconhece o problema, mas afirma que este projeto nao e prioridade e quer retomar a conversa no proximo trimestre.",
  },
  {
    id: "prove_roi",
    title: "Provar retorno",
    desc: "A compra depende de impacto financeiro mensuravel.",
    prompt: "O cliente exige uma justificativa clara de ROI e nao aceita beneficios genericos antes de avancar.",
  },
  {
    id: "internal_approval",
    title: "Conseguir aprovacao interna",
    desc: "Seu contato precisa defender a compra para a lideranca.",
    prompt: "O cliente gostou da proposta, mas precisa convencer outros decisores e obter aprovacao interna para seguir.",
  },
  {
    id: "close_next_step",
    title: "Fechar o proximo passo",
    desc: "A conversa foi boa, mas ainda nao existe compromisso.",
    prompt: "O cliente demonstrou interesse, mas evita assumir um compromisso; conduza a conversa para um proximo passo claro.",
  },
  {
    id: "custom",
    title: "Cenario personalizado",
    desc: "Descreva uma situacao especifica da sua operacao.",
    prompt: "",
  },
];

type View = EnterpriseView;
type CompanyProfile = {
  segment: string;
  offer: string;
  audience: string;
  teamSize: string;
  challenge: string;
  goal: string;
};

const EMPTY_PROFILE: CompanyProfile = {
  segment: "SaaS / Tecnologia", offer: "", audience: "", teamSize: "2-10 pessoas",
  challenge: "Tratamento de objecoes", goal: "Aumentar conversao",
};

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (username.trim().toLowerCase() === DEMO_USER.toLowerCase() && password === DEMO_PASSWORD) {
      localStorage.setItem("performai_session", "active");
      onSuccess();
    } else setError("Usuario ou senha invalidos.");
  };
  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="brand-lockup"><Image src={BRAND_LOGO} alt="" width={38} height={38} /><span>PerformAI</span></div>
      <div className="auth-copy"><p className="eyebrow">TREINAMENTO COMERCIAL COM IA</p><h1>Transforme cada conversa em evolucao.</h1><p>Pratique vendas com compradores dificeis, receba feedback objetivo e desenvolva o time com consistencia.</p></div>
      <div className="auth-proof"><span>Role-plays realistas</span><span>Coaching instantaneo</span><span>Scorecards acionaveis</span></div>
    </section>
    <section className="auth-panel">
      <div className="mobile-brand brand-lockup"><Image src={BRAND_LOGO} alt="" width={38} height={38} /><span>PerformAI</span></div>
      <p className="eyebrow">SEU WORKSPACE</p><h2>Entre para treinar</h2><p className="muted">Acesse a arena de performance do seu time.</p>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label>Usuario<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu usuario" required /></label>
        <label>Senha<div className="password-field"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Alternar senha">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        <button className="primary-button" type="submit">Entrar na PerformAI</button>
      </form>
      <p className="security-note"><ShieldAlert size={15} /> Ambiente de demonstracao protegido.</p>
    </section>
  </main>;
}

function Onboarding({ initial, onComplete }: { initial: CompanyProfile; onComplete: (profile: CompanyProfile) => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initial);
  const update = (field: keyof CompanyProfile, value: string) => setProfile((current) => ({ ...current, [field]: value }));
  const canContinue = step !== 1 || Boolean(profile.offer.trim() && profile.audience.trim());
  return <div className="modal-backdrop"><motion.section className="onboarding-modal" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
    <div className="step-track">{[0, 1, 2].map((item) => <i key={item} className={item <= step ? "active" : ""} />)}</div>
    {step === 0 && <div className="onboarding-copy"><span className="feature-icon"><Sparkles /></span><p className="eyebrow">BEM-VINDO A PERFORMAI</p><h1>Vamos personalizar seu treinamento.</h1><p>Em dois minutos, a IA entende seu negocio e prepara simulacoes mais proximas das conversas do seu time.</p><div className="benefit-list"><span><Check /> Cenarios alinhados ao seu mercado</span><span><Check /> Feedback focado no seu objetivo</span><span><Check /> Evolucao visivel por competencia</span></div></div>}
    {step === 1 && <div><p className="eyebrow">CONTEXTO COMERCIAL</p><h2>Conte um pouco sobre a operacao</h2><div className="form-grid">
      <label>Segmento<select value={profile.segment} onChange={(e) => update("segment", e.target.value)}>{["SaaS / Tecnologia", "Servicos B2B", "Financeiro", "Varejo", "Industria", "Outro"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Tamanho do time<select value={profile.teamSize} onChange={(e) => update("teamSize", e.target.value)}>{["Apenas eu", "2-10 pessoas", "11-50 pessoas", "Mais de 50"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="wide">O que voce vende?<input value={profile.offer} onChange={(e) => update("offer", e.target.value)} placeholder="Ex.: plataforma de gestao para clinicas" /></label>
      <label className="wide">Para quem voce vende?<input value={profile.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Ex.: diretores de operacoes de empresas medias" /></label>
    </div></div>}
    {step === 2 && <div><p className="eyebrow">FOCO DO TREINAMENTO</p><h2>Onde seu time precisa evoluir?</h2><div className="choice-grid">{["Tratamento de objecoes", "Descoberta de necessidades", "Pitch de valor", "Negociacao e fechamento"].map((value) => <button key={value} className={profile.challenge === value ? "choice selected" : "choice"} onClick={() => update("challenge", value)}><Target size={19} /><span>{value}</span>{profile.challenge === value && <Check size={17} />}</button>)}</div><label className="standalone-label">Principal objetivo<select value={profile.goal} onChange={(e) => update("goal", e.target.value)}>{["Aumentar conversao", "Reduzir ciclo de vendas", "Melhorar consistencia do time", "Preparar novos vendedores"].map((value) => <option key={value}>{value}</option>)}</select></label></div>}
    <footer className="modal-footer"><button className="text-button" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Voltar</button>{step < 2 ? <button className="primary-button compact" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={17} /></button> : <button className="primary-button compact" onClick={() => onComplete(profile)}>Ir para meu workspace <ArrowRight size={17} /></button>}</footer>
  </motion.section></div>;
}

function Tutorial({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const items = [
    { icon: Target, title: "Escolha como treinar", text: "Defina habilidade, comprador e contexto da conversa antes de entrar na Arena." },
    { icon: Mic, title: "Converse de verdade", text: "Permita o microfone e responda ao comprador de IA como faria em uma reuniao." },
    { icon: TrendingUp, title: "Transforme feedback em acao", text: "Use o scorecard para repetir o treino e trabalhar o principal gap do time." },
  ];
  const item = items[step]; const Icon = item.icon;
  return <div className="modal-backdrop"><motion.section className="tutorial-modal" initial={{ scale: .98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><button className="icon-button close" onClick={onClose} aria-label="Fechar"><X /></button><span className="tutorial-visual"><Icon /></span><p className="eyebrow">COMO FUNCIONA · {step + 1} DE 3</p><h2>{item.title}</h2><p>{item.text}</p><div className="tutorial-dots">{items.map((_, index) => <i key={index} className={index === step ? "active" : ""} />)}</div><footer>{step > 0 && <button className="text-button" onClick={() => setStep(step - 1)}>Voltar</button>}<button className="primary-button compact" onClick={() => step === 2 ? onClose() : setStep(step + 1)}>{step === 2 ? "Comecar" : "Proximo"}<ArrowRight size={17} /></button></footer></motion.section></div>;
}

export function Overview({ profile, onTrain, onTeam, onFocus, onEdit, onReview, onTutorial }: { profile: CompanyProfile; onTrain: () => void; onTeam: () => void; onFocus: () => void; onEdit: () => void; onReview: () => void; onTutorial: () => void }) {
  const [weeklyUsage, setWeeklyUsage] = useState(0);
  useEffect(() => { queueMicrotask(() => setWeeklyUsage(readWeeklyUsage())); }, []);
  const weeklyMinutes = Math.floor(weeklyUsage / 60000);
  return <div className="content-stack overview-page"><header className="overview-heading"><p className="eyebrow">CENTRAL DE TREINAMENTO</p><h1>Treine, corrija e venda melhor.</h1><p>Escolha o que precisa fazer agora. A Performa AI prepara a conversa, simula o comprador e mostra exatamente o que melhorar.</p></header>
    <section className="overview-directory" aria-label="Acoes principais">
      <button className="overview-card overview-card-wide" onClick={onTrain}><span className="overview-card-icon"><Mic /></span><div><p className="eyebrow">COMECE POR AQUI</p><h2>Treinar uma ligacao</h2><p>Escolha produto, comprador e cenario. Fale como em uma ligacao real e receba transcricao, nota e orientacao.</p><strong>Preparar simulacao <ChevronRight /></strong></div></button>
      <button className="overview-card overview-card-wide" onClick={onTeam}><span className="overview-card-icon"><Users /></span><div><p className="eyebrow">PARA GESTORES</p><h2>Acompanhar o time</h2><p>Veja quem esta evoluindo, quais habilidades precisam de atencao e qual treino aplicar em seguida.</p><strong>Abrir desempenho <ChevronRight /></strong></div></button>
      <button className="overview-card" onClick={onFocus}><span className="overview-card-icon"><Target /></span><div><p className="eyebrow">DESENVOLVA SUAS HABILIDADES</p><h2>Resolva sua dificuldade</h2><p>Tire duvidas, aprenda a quebrar objecoes e receba um plano pratico para melhorar seu pitch.</p><strong>Receber orientacao <ChevronRight /></strong></div></button>
      <button className="overview-card" onClick={onTutorial}><span className="overview-card-icon"><BookOpen /></span><div><p className="eyebrow">PRIMEIROS PASSOS</p><h2>Entender como funciona</h2><p>Veja como escolher o comprador, conduzir a chamada e usar o feedback da IA.</p><strong>Abrir tutorial <ChevronRight /></strong></div></button>
      <button className="overview-card" onClick={onEdit}><span className="overview-card-icon"><Sparkles /></span><div><p className="eyebrow">PERSONALIZACAO</p><h2>Ensinar seu negocio para a IA</h2><p>Atualize oferta, publico e segmento para receber perguntas mais proximas da sua realidade.</p><strong>Editar contexto <ChevronRight /></strong></div></button>
    </section>
    <section className="overview-usage-band"><div><p className="eyebrow">USO NESTA SEMANA</p><h2><strong>{weeklyMinutes}</strong> de 60 minutos utilizados</h2><p>Seu saldo renova automaticamente a cada sete dias.</p></div><button onClick={onTrain}><Play size={18} /> Iniciar treino agora</button></section>
    <section className="overview-context"><div><p className="eyebrow">CONTEXTO ATUAL DA IA</p><h2>O treino ja conhece sua operacao</h2><p>Esses dados orientam as objecoes e perguntas feitas pelo comprador.</p></div><dl><div><dt>Segmento</dt><dd>{profile.segment}</dd></div><div><dt>Oferta</dt><dd>{profile.offer}</dd></div><div><dt>Publico</dt><dd>{profile.audience}</dd></div></dl></section>
    <section className="private-review-module"><div className="private-review-copy"><span className="private-review-icon"><LockKeyhole /></span><div><p className="eyebrow">MODULO PRIVADO · CALL REVIEW</p><h2>Veja o que realmente aconteceu na sua ligacao.</h2><p>Envie uma call real e receba, em minutos, transcricao, nota, momentos criticos e um relatorio completo com o que manter e o que corrigir.</p></div></div><div className="private-review-action"><span>Acesso reservado para analises da sua operacao</span><button onClick={onReview}><FileAudio size={18} /> Avaliar minha ligacao</button></div></section>
  </div>;
}

export function TeamDashboard() {
  const members = [
    { name: "Ana Lima", score: 9.1, training: 9.3, calls: 8.9, activity: "6 treinos · 4 calls", trend: "+12%" },
    { name: "Rafael Costa", score: 8.4, training: 8.7, calls: 8.1, activity: "5 treinos · 3 calls", trend: "+7%" },
    { name: "Marina Alves", score: 7.8, training: 8.2, calls: 7.4, activity: "4 treinos · 2 calls", trend: "+4%" },
    { name: "Lucas Rocha", score: 7.2, training: 7.6, calls: 6.8, activity: "3 treinos · 2 calls", trend: "-2%" },
  ];
  return <div className="content-stack team-leaderboard-page"><section className="welcome-band leaderboard-hero"><div><p className="eyebrow">PLACAR DA SEMANA</p><h1>Quem esta vendendo melhor?</h1><p>O ranking combina desempenho nos treinos com IA e notas das ligacoes reais enviadas ao Call Review.</p></div><div className="ranking-period"><Trophy /><span>Semana atual</span><strong>Ranking atualizado</strong></div></section>
    <div className="stat-grid leaderboard-stats"><div><span>Participacao do time</span><strong>87%</strong><small>18 atividades concluidas</small></div><div><span>Media geral</span><strong>8.1</strong><small>+0.6 nesta semana</small></div><div><span>Habilidade em destaque</span><strong className="textual">Pitch de valor</strong><small>Melhor evolucao coletiva</small></div></div>
    <section className="podium" aria-label="Melhores vendedores da semana">{members.slice(0, 3).map((member, index) => <article className={`podium-card place-${index + 1}`} key={member.name}><span className="podium-position">{index === 0 ? <Trophy /> : <Medal />} {index + 1}º lugar</span><i>{member.name.split(" ").map((part) => part[0]).join("")}</i><h2>{member.name}</h2><strong>{member.score}</strong><small>nota combinada</small></article>)}</section>
    <section className="team-table-section leaderboard-table"><div className="section-heading"><div><p className="eyebrow">CLASSIFICACAO COMPLETA</p><h2>Desempenho do time</h2><p>A nota final considera 50% dos treinos e 50% das calls reais avaliadas.</p></div><span className="count-badge">{members.length} vendedores</span></div><div className="team-table"><div className="team-row table-head"><span>Posicao e vendedor</span><span>Nota final</span><span>Treinos</span><span>Calls reais</span><span>Atividade</span><span>Evolucao</span></div>{members.map((member, index) => <div className="team-row" key={member.name}><span className="member"><b>{index + 1}</b><i>{member.name.split(" ").map((part) => part[0]).join("")}</i><strong>{member.name}</strong></span><strong>{member.score}</strong><span>{member.training}</span><span>{member.calls}</span><span>{member.activity}</span><span className={member.trend.startsWith("+") ? "positive" : "negative"}>{member.trend}</span></div>)}</div></section>
    <p className="ranking-note">Quando as contas empresariais forem conectadas, este placar sera preenchido automaticamente com os vendedores reais da empresa.</p>
  </div>;
}

const FOCUS_OPTIONS = [
  { id: "objections", title: "Quebrar objecoes", text: "Preco, concorrencia, falta de urgencia ou resistencia interna." },
  { id: "pitch", title: "Melhorar meu pitch", text: "Deixar a proposta mais clara, curta e conectada ao valor." },
  { id: "discovery", title: "Fazer boas perguntas", text: "Descobrir dores, impacto, prioridade e processo de decisao." },
  { id: "closing", title: "Conduzir o fechamento", text: "Criar compromisso e definir um proximo passo concreto." },
];

function FocusCoach({ profile }: { profile: CompanyProfile }) {
  const [difficulty, setDifficulty] = useState("objections");
  const [situation, setSituation] = useState("");
  const [audioStatus, setAudioStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const audioInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ title: string; diagnosis: string; actions: string[]; example: string } | null>(null);
  const selected = FOCUS_OPTIONS.find((item) => item.id === difficulty) ?? FOCUS_OPTIONS[0];
  const analyzeAudio = async (file?: File) => {
    if (!file) return;
    setAudioStatus("processing");
    try {
      const body = new FormData();
      body.append("audio", file);
      body.append("metadata", JSON.stringify({ source: "mentor_audio", seller_role: "seller", call_type: difficulty }));
      const response = await fetch("/api/v1/analytics/call-review", { method: "POST", body, signal: AbortSignal.timeout(120_000) });
      const payload = await response.json();
      if (!response.ok) throw new Error("audio");
      const report = payload?.report ?? payload;
      setSituation(typeof report?.transcript === "string" ? report.transcript : typeof report?.summary === "string" ? report.summary : `Contexto enviado por audio: ${file.name}`);
      setAudioStatus("done");
    } catch {
      setAudioStatus("error");
    }
  };
  const generateGuidance = (event: FormEvent) => {
    event.preventDefault();
    const details = situation.trim() || `Tenho dificuldade em ${selected.title.toLowerCase()} ao vender ${profile.offer}.`;
    const guidance = {
      objections: { title: "Voce precisa investigar antes de responder", diagnosis: "A dificuldade indica que voce pode estar combatendo a objecao cedo demais. Primeiro descubra o motivo real, confirme o impacto e somente depois conecte valor.", actions: ["Acolha a objecao sem se defender.", "Pergunte o que esta por tras da preocupacao.", "Confirme o impacto e responda com uma prova objetiva."], example: `"Entendo sua preocupacao. Quando voce fala em preco, esta comparando com outra solucao ou o retorno ainda nao ficou claro?"` },
      pitch: { title: "Seu pitch precisa sair da funcao e chegar ao resultado", diagnosis: "Um pitch forte explica para quem e a solucao, qual problema resolve e qual mudanca concreta entrega. Evite listar recursos antes de confirmar a prioridade do cliente.", actions: ["Comece pelo problema do publico.", "Conecte a oferta a um resultado mensuravel.", "Termine com uma pergunta de validacao."], example: `"A ${profile.offer} ajuda ${profile.audience} a resolver esse gargalo com mais previsibilidade. Esse resultado faria diferenca hoje?"` },
      discovery: { title: "Troque perguntas soltas por uma linha de investigacao", diagnosis: "Sua descoberta deve sair da situacao atual, passar pelo problema e chegar ao impacto. Assim o cliente verbaliza por que precisa mudar.", actions: ["Entenda como o processo funciona hoje.", "Explore onde trava e quanto isso custa.", "Descubra prioridade, decisores e prazo."], example: `"Como voces fazem isso hoje, onde costuma travar e o que acontece com a meta quando esse problema continua?"` },
      closing: { title: "Fechamento e consequencia de clareza", diagnosis: "Em vez de pressionar por um sim, confirme valor, resolva a ultima inseguranca e proponha um proximo passo com responsavel e data.", actions: ["Resuma o problema e o valor acordado.", "Pergunte o que ainda impede o avanco.", "Combine uma acao, responsavel e prazo."], example: `"Pelo que alinhamos, faz sentido avancarmos. Existe algo que ainda impeça marcarmos o proximo passo para esta semana?"` },
    }[difficulty]!;
    setResult({ ...guidance, diagnosis: `${guidance.diagnosis} Contexto informado: ${details}` });
  };
  return <div className="content-stack focus-coach-page"><header className="focus-heading"><p className="eyebrow">COACH COMERCIAL</p><h1>Qual dificuldade voce quer resolver?</h1><p>Conte onde esta travando. Voce recebe um diagnostico direto, orientacao pratica e uma frase pronta para usar na proxima conversa.</p></header>
    <div className="focus-layout"><form className="focus-form" onSubmit={generateGuidance}><div><p className="eyebrow">1 · ESCOLHA SUA DIFICULDADE</p><div className="focus-options">{FOCUS_OPTIONS.map((option) => <button type="button" key={option.id} className={difficulty === option.id ? "selected" : ""} onClick={() => { setDifficulty(option.id); setResult(null); }}><span>{option.title}</span><small>{option.text}</small>{difficulty === option.id && <CheckCircle />}</button>)}</div></div><label><span>2 · O QUE ESTA ACONTECENDO NA PRATICA?</span><textarea value={situation} onChange={(event) => setSituation(event.target.value)} placeholder={`Ex.: Quando apresento ${profile.offer}, o cliente diz que esta caro e eu nao sei como continuar.`} /></label><div className="mentor-audio"><input ref={audioInput} hidden type="file" accept="audio/*,.mp4" onChange={(event) => analyzeAudio(event.target.files?.[0])} /><button type="button" disabled={audioStatus === "processing"} onClick={() => audioInput.current?.click()}><Mic /> {audioStatus === "processing" ? "Transcrevendo audio..." : "Enviar audio da situacao"}</button><span className={audioStatus}>{audioStatus === "done" ? "Audio transcrito. Revise o texto acima." : audioStatus === "error" ? "Nao foi possivel processar. Tente outro arquivo." : "A IA transforma sua explicacao em contexto."}</span></div><button className="primary-button focus-submit" type="submit"><Lightbulb /> Analisar minha dificuldade</button></form>
      <aside className="focus-context"><p className="eyebrow">CONTEXTO CONSIDERADO</p><h2>Orientacao ligada ao seu negocio</h2><dl><div><dt>Oferta</dt><dd>{profile.offer}</dd></div><div><dt>Publico</dt><dd>{profile.audience}</dd></div><div><dt>Objetivo</dt><dd>{profile.goal}</dd></div></dl></aside></div>
    {result && <motion.section className="focus-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><header><span><Sparkles /></span><div><p className="eyebrow">CONSULTORIA PERSONALIZADA</p><h2>{result.title}</h2><p>{result.diagnosis}</p></div></header><div className="focus-plan"><div><p className="eyebrow">O QUE FAZER AGORA</p><ol>{result.actions.map((action, index) => <li key={action}><span>{index + 1}</span>{action}</li>)}</ol></div><blockquote><p className="eyebrow">EXEMPLO PARA USAR</p><strong>{result.example}</strong></blockquote></div><div className="mentor-followup"><div><p className="eyebrow">VAMOS APROFUNDAR</p><h3>Uma boa orientacao melhora com o contexto.</h3><span>Escolha a pergunta que mais ajuda a explicar o que aconteceu.</span></div>{["O que o cliente disse antes dessa objecao?", "Como voce respondeu imediatamente depois?", "Qual parte da conversa pareceu mais dificil?"].map((question) => <button key={question} onClick={() => { setSituation((current) => `${current}\n\n${question} `); setResult(null); }}>{question}<ArrowRight /></button>)}</div></motion.section>}
  </div>;
}

const SCORE_METRICS = [
  { id: "confidence", label: "Confianca" },
  { id: "objection_handling", label: "Tratamento de objecoes" },
  { id: "clarity", label: "Clareza" },
  { id: "value_framing", label: "Construcao de valor" },
  { id: "closing", label: "Fechamento" },
];

function ScorecardReport({ scorecard, scenario, onRetry, onAdjust }: { scorecard: Record<string, number | string>; scenario: string; onRetry: () => void; onAdjust: () => void }) {
  const competencies = SCORE_METRICS.map((metric) => ({ ...metric, score: typeof scorecard[metric.id] === "number" ? scorecard[metric.id] as number : null }));
  const scored = competencies.filter((metric): metric is typeof metric & { score: number } => metric.score !== null);
  const ranked = [...scored].sort((first, second) => second.score - first.score);
  const overall = scored.length ? Math.round((scored.reduce((sum, metric) => sum + metric.score, 0) / scored.length) * 10) / 10 : null;
  const strengths = ranked.filter((metric) => metric.score >= 7).slice(0, 2);
  const attention = [...ranked].reverse().slice(0, 2);
  const priority = attention[0]?.label ?? "habilidade principal";
  const feedback = typeof scorecard.feedback === "string" && scorecard.feedback.trim() ? scorecard.feedback : "A avaliacao detalhada nao foi enviada nesta sessao. Use as notas por competencia para orientar a proxima tentativa.";
  return <motion.div key="scorecard" className="scorecard scorecard-report" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
    <header className="report-header"><div className="scorecard-title"><CheckCircle /><div><p className="eyebrow">SESSAO CONCLUIDA</p><h2>Relatorio da simulacao</h2><p>Veja o que funcionou e entre na proxima tentativa com um foco claro.</p></div></div><div className="overall-score"><span>NOTA GERAL</span><strong>{overall ?? "--"}<small>/10</small></strong><p>{overall === null ? "Sem dados suficientes" : overall >= 8 ? "Otimo desempenho" : overall >= 6 ? "Boa base para evoluir" : "Ha pontos importantes para praticar"}</p></div></header>
    <section className="report-summary"><div><span className="report-icon positive"><Check /></span><p className="eyebrow">PONTOS FORTES</p><h3>{strengths.length ? strengths.map((item) => item.label).join(" e ") : "Ainda sem destaque confirmado"}</h3><p>{strengths.length ? "Estas foram as competencias com melhor desempenho nesta sessao." : "Nenhuma competencia atingiu nota 7 nesta tentativa."}</p></div><div><span className="report-icon attention"><FileWarning /></span><p className="eyebrow">ERROS A CORRIGIR</p><h3>{attention.length ? attention.map((item) => item.label).join(" e ") : "Avaliacao indisponivel"}</h3><p>{attention.length ? "Estas foram as competencias com menor nota, nao erros transcritos literalmente." : "Nao recebemos notas suficientes para apontar prioridades."}</p></div></section>
    <section className="report-feedback"><div><p className="eyebrow">O QUE MELHORAR</p><h3>Priorize {priority.toLowerCase()}</h3></div><p>{feedback}</p></section>
    <section className="competency-section"><div className="report-section-title"><p className="eyebrow">COMPETENCIAS</p><h3>Resultado por habilidade</h3></div><div className="competency-list">{competencies.map((metric) => <div className="competency-row" key={metric.id}><span>{metric.label}</span><div><i style={{ width: `${(metric.score ?? 0) * 10}%` }} /></div><strong>{metric.score ?? "--"}</strong></div>)}</div></section>
    <section className="action-plan"><div className="report-section-title"><p className="eyebrow">PLANO DE ACAO</p><h3>Sua proxima tentativa</h3></div><ol><li><span>1</span><p><strong>Repita o mesmo cenario</strong>Treine novamente: {scenario}.</p></li><li><span>2</span><p><strong>Concentre-se em {priority.toLowerCase()}</strong>Use o feedback acima como criterio durante a conversa.</p></li><li><span>3</span><p><strong>Compare as novas notas</strong>Verifique se a competencia prioritaria evoluiu.</p></li></ol></section>
    <footer className="report-actions"><button className="secondary-button" onClick={onAdjust}>Ajustar configuracao</button><button className="primary-button compact" onClick={onRetry}><Play size={17} /> Tentar novamente</button></footer>
  </motion.div>;
}

function Training({ profile }: { profile: CompanyProfile }) {
  const [selectedMode, setSelectedMode] = useState("objections");
  const [selectedPersona, setSelectedPersona] = useState("skeptic");
  const [selectedScenario, setSelectedScenario] = useState(CONVERSATION_SCENARIOS[0].id);
  const [context, setContext] = useState(CONVERSATION_SCENARIOS[0].prompt);
  const [trainingOffer, setTrainingOffer] = useState(profile.offer);
  const [demoText, setDemoText] = useState("");
  const [setupStep, setSetupStep] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [weeklyUsage, setWeeklyUsage] = useState(0);
  const [callElapsed, setCallElapsed] = useState(0);
  const connectionStartedAt = useRef<number | null>(null);
  const liveAudio = useLiveAudio(selectedPersona, sessionActive, {
    segment: profile.segment,
    offer: trainingOffer,
    audience: profile.audience,
    goal: TRAINING_MODES.find((item) => item.id === selectedMode)?.title ?? selectedMode,
    challenge: context,
  });
  const { isConnected, isAgentSpeaking, isListening, isDemoMode, voiceInputSupported, error, scorecard, setScorecard, transcriptMessages, coachAdvice, mediaStream, sendDemoText } = liveAudio;
  const submitDemoText = (event: FormEvent) => {
    event.preventDefault();
    const message = demoText.trim();
    if (!message) return;
    sendDemoText(message);
    setDemoText("");
  };
  useEffect(() => { queueMicrotask(() => setWeeklyUsage(readWeeklyUsage())); }, []);
  useEffect(() => {
    if (!isConnected) return;
    const startedAt = Date.now();
    connectionStartedAt.current = startedAt;
    const timer = window.setInterval(() => setCallElapsed(Date.now() - startedAt), 1000);
    return () => {
      window.clearInterval(timer);
      if (connectionStartedAt.current !== startedAt) return;
      const elapsed = Date.now() - startedAt;
      const nextUsage = readWeeklyUsage() + elapsed;
      localStorage.setItem(currentWeekKey(), String(nextUsage));
      setWeeklyUsage(nextUsage);
      connectionStartedAt.current = null;
    };
  }, [isConnected]);
  const persona = PERSONAS.find((item) => item.id === selectedPersona) ?? PERSONAS[0];
  const scenario = CONVERSATION_SCENARIOS.find((item) => item.id === selectedScenario) ?? CONVERSATION_SCENARIOS[0];
  const connectionStatus = error ? "Atencao necessaria" : isAgentSpeaking ? "Comprador falando" : isListening ? "Ouvindo voce" : isDemoMode ? "Conversa por voz" : isConnected ? "Ligacao em andamento" : "Preparando a ligacao";
  if (sessionActive || scorecard) return <section className="arena-panel full-arena"><AnimatePresence mode="wait">{scorecard ? <ScorecardReport scorecard={scorecard} scenario={scenario.title} onAdjust={() => { setScorecard(null); setSessionActive(false); }} onRetry={() => { setScorecard(null); setCallElapsed(0); setSessionActive(true); }} /> : <motion.div key="arena" className="arena-stage"><div className={`call-status ${error ? "error" : isConnected ? "connected" : ""}`}><i />{connectionStatus}<span>{isConnected ? formatDuration(callElapsed) : ""}</span></div><div className={`buyer-presence human-buyer ${isAgentSpeaking ? "speaking" : ""}`}><div className="buyer-avatar"><Image src={EXECUTIVE_BUYER} alt="Executivo simulado por inteligencia artificial" width={224} height={224} priority /><span>IA</span><i className="voice-ring" /></div><div><p>{isAgentSpeaking ? "COMPRADOR FALANDO" : "COMPRADOR SIMULADO"}</p><h2>{persona.name}</h2><small>{isAgentSpeaking ? "Escute a resposta antes de continuar." : persona.desc}</small><div className="voice-bars" aria-hidden="true"><i /><i /><i /><i /></div></div></div>{mediaStream && <video className="video-pip" autoPlay playsInline muted ref={(element) => { if (element && element.srcObject !== mediaStream) element.srcObject = mediaStream; }} />}{error && <div className="form-error">{error}</div>}<div className="live-support"><section className="transcript-panel"><header><div><p className="eyebrow">TRANSCRICAO AO VIVO</p><h3>Conversa</h3></div><span>{transcriptMessages.length ? `${transcriptMessages.length} falas` : "Aguardando fala"}</span></header><div className="transcript-feed" aria-live="polite">{transcriptMessages.length ? transcriptMessages.map((message: TranscriptMessage) => { const isSeller = message.speaker === "user"; return <div className={isSeller ? "transcript-line seller" : "transcript-line buyer"} key={message.id}><strong>{isSeller ? "Voce" : persona.name}</strong><p>{message.text}</p></div>; }) : <div className="transcript-empty"><Mic size={18} /><p>A transcricao aparecera aqui quando a conversa comecar.</p></div>}</div>{(isDemoMode || !voiceInputSupported) && <form className="demo-reply" onSubmit={submitDemoText}><input value={demoText} onChange={(event) => setDemoText(event.target.value)} placeholder="Digite sua resposta..." aria-label="Sua resposta" /><button type="submit" disabled={!demoText.trim()}>Enviar <ArrowRight size={15} /></button></form>}</section><aside className="coach-panel"><div className="coach-heading"><Sparkles /><div><p className="eyebrow">COACH AO VIVO</p><h3>Seu apoio durante a ligacao</h3></div></div><div className="coach-status"><i />Escutando a conversa</div><p>{coachAdvice || "Faca uma pergunta por vez, escute a resposta inteira e conecte sua proposta ao que o cliente acabou de dizer."}</p><div className="coach-prompts"><span>Explore o impacto</span><span>Confirme a dor</span><span>Combine o proximo passo</span></div></aside></div><p className="arena-label">{isAgentSpeaking ? "O comprador esta respondendo." : isConnected ? "Fale naturalmente. O comprador esta ouvindo voce." : "Aguarde enquanto preparamos audio e microfone."}</p><button className="session-button stop" onClick={() => setSessionActive(false)}><MicOff size={21} /> Encerrar sessao</button></motion.div>}</AnimatePresence></section>;
  const steps = ["Objetivo", "Comprador", "Oferta", "Contexto"];
  return <div className="content-stack"><section className="welcome-band training-intro"><div><p className="eyebrow">NOVO TREINO</p><h1>Monte sua simulacao.</h1><p>Quatro escolhas rapidas e voce entra na Arena com um cenario feito para o seu momento.</p></div></section><div className="setup-progress">{steps.map((label, index) => <button key={label} className={index === setupStep ? "active" : index < setupStep ? "done" : ""} onClick={() => index <= setupStep && setSetupStep(index)}><span>{index < setupStep ? <Check size={15} /> : index + 1}</span><strong>{label}</strong></button>)}</div><section className="training-layout guided"><div className="setup-section guided-panel">
    {setupStep === 0 && <motion.div key="goal" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}><p className="eyebrow">PASSO 1 DE 3</p><h2>O que voce quer praticar?</h2><p className="step-description">Escolha a habilidade que mais faria diferenca na sua proxima conversa.</p><div className="mode-grid guided-modes">{TRAINING_MODES.map((mode) => { const Icon = mode.icon; return <button key={mode.id} className={selectedMode === mode.id ? "mode-card selected" : "mode-card"} onClick={() => setSelectedMode(mode.id)}><span className="mode-icon"><Icon /></span><span><strong>{mode.title}</strong><small>{mode.desc}</small></span>{selectedMode === mode.id && <CheckCircle className="selection-check" />}</button>; })}</div></motion.div>}
    {setupStep === 1 && <motion.div key="buyer" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}><p className="eyebrow">PASSO 2 DE 3</p><h2>Quem estara do outro lado?</h2><p className="step-description">A personalidade muda o ritmo, as objecoes e o nivel de pressao da simulacao.</p><div className="persona-list guided-personas">{PERSONAS.map((item) => { const Icon = item.icon; return <button key={item.id} className={selectedPersona === item.id ? "persona-card selected" : "persona-card"} onClick={() => setSelectedPersona(item.id)}><span className="persona-icon"><Icon /></span><span><strong>{item.name}</strong><small>{item.desc}</small></span>{selectedPersona === item.id && <CheckCircle className="selection-check" />}</button>; })}</div></motion.div>}
    {setupStep === 2 && <motion.div key="offer" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}><p className="eyebrow">PASSO 3 DE 4</p><h2>O que voce vende?</h2><p className="step-description">Confirme a oferta desta conversa. Voce pode ajustar sem alterar o perfil da empresa.</p><label className="offer-field">Produto ou servico<input maxLength={160} value={trainingOffer} onChange={(event) => setTrainingOffer(event.target.value)} placeholder="Ex.: plataforma de gestao comercial para empresas B2B" /><small>{trainingOffer.length}/160 caracteres</small></label><div className="context-example"><Sparkles size={17} /><span><strong>Por que isso importa</strong> A IA usa sua oferta para criar objecoes e perguntas mais realistas.</span></div></motion.div>}
    {setupStep === 3 && <motion.div key="context" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}><p className="eyebrow">PASSO 4 DE 4</p><h2>O que esta acontecendo nesta conversa?</h2><p className="step-description">Escolha uma situacao pronta. A IA combina o cenario com seu segmento, oferta e comprador.</p><div className="scenario-grid">{CONVERSATION_SCENARIOS.map((item) => <button key={item.id} className={selectedScenario === item.id ? "scenario-option selected" : "scenario-option"} onClick={() => { setSelectedScenario(item.id); setContext(item.prompt); }}><span><strong>{item.title}</strong><small>{item.desc}</small></span>{selectedScenario === item.id && <CheckCircle className="selection-check" />}</button>)}</div>{selectedScenario === "custom" && <label className="context-field guided-context custom-context">Descreva a situacao<textarea maxLength={300} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Ex.: o cliente gostou da solucao, mas precisa convencer o socio antes de avancar." /><small>{context.length}/300 caracteres</small></label>}<div className="context-example"><Sparkles size={17} /><span><strong>Cenario pronto para a Arena</strong> Voce podera repetir o treino com outro perfil de comprador quando quiser.</span></div></motion.div>}
    <footer className="setup-actions"><button className="text-button" disabled={setupStep === 0} onClick={() => setSetupStep((step) => step - 1)}><ArrowLeft size={17} /> Voltar</button>{setupStep < 3 ? <button className="primary-button compact" disabled={setupStep === 2 && !trainingOffer.trim()} onClick={() => setSetupStep((step) => step + 1)}>Continuar <ArrowRight size={17} /></button> : <button className="primary-button compact" onClick={() => { setCallElapsed(0); setSessionActive(true); }} disabled={!trainingOffer.trim() || !context.trim()}><Play size={18} /> Entrar na Arena</button>}</footer>
  </div><aside className="session-summary guided-summary"><p className="eyebrow">SEU TREINO</p><h2>{TRAINING_MODES.find((item) => item.id === selectedMode)?.title}</h2><p className="summary-helper">Revise suas escolhas antes de comecar.</p><dl><div><dt>Oferta</dt><dd>{trainingOffer || "Ainda nao definida"}</dd></div><div><dt>Comprador</dt><dd>{persona.name}</dd></div><div><dt>Cenario</dt><dd>{selectedScenario === "custom" ? context || "Ainda nao definido" : scenario.title}</dd></div></dl><div className="training-usage"><span>{Math.floor(weeklyUsage / 60000)} min</span><small>utilizados nesta semana</small></div><div className="permission-note"><Mic /><span><strong>Use fones se puder</strong><small>O microfone sera solicitado ao iniciar.</small></span></div></aside></section></div>;
}

function Workspace({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("performai_company_profile");
      if (saved) setProfile(JSON.parse(saved));
    });
  }, []);
  const saveProfile = (next: CompanyProfile) => { localStorage.setItem("performai_company_profile", JSON.stringify(next)); setProfile(next); setEditingProfile(false); };
  const closeTutorial = () => { localStorage.setItem("performai_tutorial_seen", "true"); setShowTutorial(false); };
  const navigate = (next: EnterpriseView) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <main className={`app-shell enterprise-shell view-${view}`}>
    <EnterpriseSidebar active={view} onNavigate={navigate} />
    <header className="topbar enterprise-topbar">
      <label className="enterprise-top-search"><Search /><input placeholder="Pesquisar na plataforma" aria-label="Pesquisar na plataforma" /></label>
      <div className="topbar-actions">
        <button className="icon-button" onClick={() => setShowTutorial(true)} aria-label="Abrir tutorial" title="Tutorial"><BookOpen /></button>
        <button className="avatar" onClick={() => setEditingProfile(true)} aria-label="Editar perfil da empresa" title="Perfil da empresa"><UserRound /></button>
        <button className="ghost-button logout-button" onClick={onLogout} aria-label="Sair da conta" title="Sair da conta"><LogOut /><span>Sair</span></button>
      </div>
    </header>
    <section className="workspace-content">
      {profile && view === "simulation" && <NextGenCoach />}
      {profile && view === "strategies" && <CommercialStrategies onOpenCoach={() => navigate("coach")} />}
      {profile && view === "coach" && <CommercialCoach profile={profile} />}
      {profile && view === "ai" && <FocusCoach profile={profile} />}
      {profile && view === "calls" && <CallReview />}
      {profile && !["simulation", "strategies", "coach", "ai", "calls"].includes(view) && <EnterpriseModule view={view} onNavigate={navigate} />}
    </section>
    {(!profile || editingProfile) && <Onboarding initial={profile ?? EMPTY_PROFILE} onComplete={saveProfile} />}
    {showTutorial && profile && <Tutorial onClose={closeTutorial} />}
  </main>;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  useEffect(() => { queueMicrotask(() => setAuthenticated(localStorage.getItem("performai_session") === "active")); }, []);
  if (authenticated)
    return <Workspace onLogout={() => { localStorage.removeItem("performai_session"); setAuthenticated(false); }} />;
  if (!productOpen) return <LandingPage onEnter={() => setProductOpen(true)} />;
  return <Login onSuccess={() => setAuthenticated(true)} />;
}
