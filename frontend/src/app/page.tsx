"use client";

import { FormEvent, useEffect, useState } from "react";
import { Activity, BadgeDollarSign, CheckCircle, Eye, EyeOff, FileWarning, LockKeyhole, Mic, MicOff, ShieldAlert, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLiveAudio } from "@/hooks/useLiveAudio";

const DEMO_USER = "Cavalcante";
const DEMO_PASSWORD = "1234";
const BRAND_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/performai-logo.png`;
const PERSONAS = [
  { id: "skeptic", name: "CTO cético", desc: "Interrompe, exige prova e combate buzzwords.", icon: Activity },
  { id: "budget_guardian", name: "CFO guardião do orçamento", desc: "Pressiona por ROI, custo e previsibilidade.", icon: BadgeDollarSign },
  { id: "procurement", name: "Compras agressivo", desc: "Acelera a conversa e negocia cada detalhe.", icon: FileWarning },
];

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
      return;
    }
    setError("Usuário ou senha inválidos.");
  };
  return <main className="auth-shell">
    <div className="auth-visual">
      <div className="brand-lockup"><img src={BRAND_LOGO} alt="" /><span>PerformAI</span></div>
      <div className="auth-copy"><p className="eyebrow">TREINAMENTO COMERCIAL COM IA</p><h1>Transforme cada conversa em evolução.</h1><p>Pratique vendas com compradores difíceis, receba feedback objetivo e desenvolva o time com consistência.</p></div>
      <div className="auth-proof"><span>Role-plays realistas</span><span>Coaching instantâneo</span><span>Scorecards acionáveis</span></div>
    </div>
    <div className="auth-panel">
      <div className="mobile-brand brand-lockup"><img src={BRAND_LOGO} alt="" /><span>PerformAI</span></div>
      <p className="eyebrow">SEU WORKSPACE</p><h2>Entre para treinar</h2><p className="muted">Acesse a arena de performance do seu time.</p>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label>Usuário<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu usuário" autoComplete="username" required /></label>
        <label>Senha<div className="password-field"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        <button className="primary-button" type="submit">Entrar na PerformAI</button>
      </form>
      <p className="security-note"><ShieldAlert size={15} /> Ambiente de demonstração protegido.</p>
    </div>
  </main>;
}

function Workspace({ onLogout }: { onLogout: () => void }) {
  const [selectedPersona, setSelectedPersona] = useState("skeptic");
  const [sessionActive, setSessionActive] = useState(false);
  const { isConnected, error, scorecard, setScorecard, backendFeedback, mediaStream } = useLiveAudio(selectedPersona, sessionActive);
  const persona = PERSONAS.find((item) => item.id === selectedPersona) ?? PERSONAS[0];
  return <main className="workspace-shell">
    <header className="topbar"><div className="brand-lockup"><img src={BRAND_LOGO} alt="" /><span>PerformAI</span></div><div className="topbar-actions"><span className="status-pill"><i className={sessionActive && isConnected ? "live-dot" : "idle-dot"} />{!sessionActive ? "Pronto para treinar" : isConnected ? "IA ao vivo" : "Conectando..."}</span><button className="ghost-button" onClick={onLogout}>Sair</button></div></header>
    <section className="workspace-intro"><div><p className="eyebrow">ARENA DE TREINAMENTO</p><h1>Treine como um closer.</h1><p className="muted">Escolha um comprador, faça seu pitch e receba um scorecard para evoluir na próxima conversa.</p></div><div className="intro-badge"><span>Workspace</span><strong>Cavalcante</strong></div></section>
    <div className="workspace-grid">
      <aside className="persona-panel"><div className="section-heading"><div><p className="eyebrow">SIMULAÇÃO</p><h2>Escolha o comprador</h2></div><span className="count-badge">{PERSONAS.length} perfis</span></div><div className="persona-list">{PERSONAS.map((item) => { const Icon = item.icon; const active = item.id === selectedPersona; return <button key={item.id} disabled={sessionActive} onClick={() => setSelectedPersona(item.id)} className={`persona-card ${active ? "selected" : ""}`}><span className="persona-icon"><Icon size={20} /></span><span><strong>{item.name}</strong><small>{item.desc}</small></span></button>; })}</div><div className="coach-tip"><strong>Dica de coaching</strong><p>Responda à objeção antes de voltar para a sua proposta de valor.</p></div></aside>
      <section className="arena-panel">
        <AnimatePresence mode="wait">{scorecard ? <motion.div key="scorecard" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="scorecard"><div className="scorecard-title"><CheckCircle size={24} /><div><p className="eyebrow">SESSÃO CONCLUÍDA</p><h2>Seu feedback de coaching</h2></div></div><div className="metrics">{["confidence", "objection_handling", "clarity", "value_framing", "closing"].map((metric) => <div className="metric" key={metric}><strong>{scorecard[metric] ?? 0}<small>/10</small></strong><span>{metric.replaceAll("_", " ")}</span></div>)}</div><div className="feedback"><p className="eyebrow">FEEDBACK DA IA</p><p>{scorecard.feedback || "Boa conversa. Na próxima rodada, conecte sua resposta a um impacto de negócio mais específico."}</p></div><button className="secondary-button full" onClick={() => { setScorecard(null); setSessionActive(false); }}>Iniciar nova sessão</button></motion.div> : <motion.div key="arena" className="arena-stage"><div className={`ai-orb ${sessionActive ? "active" : ""}`}>{sessionActive ? <Activity size={58} /> : <Mic size={58} />}</div>{mediaStream && <video className="video-pip" autoPlay playsInline muted ref={(element) => { if (element && element.srcObject !== mediaStream) element.srcObject = mediaStream; }} />}{backendFeedback && <div className="feedback-toast"><ShieldAlert size={17} />{backendFeedback}</div>}{error && <div className="form-error">{error}</div>}<p className="arena-label">{sessionActive ? `Você está falando com ${persona.name}` : "Tudo pronto para começar"}</p><button className={`session-button ${sessionActive ? "stop" : ""}`} onClick={() => setSessionActive((value) => !value)}>{sessionActive ? <><MicOff size={21} /> Encerrar sessão</> : <><Mic size={21} /> Começar pitch</>}</button></motion.div>}</AnimatePresence>
      </section>
    </div>
  </main>;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => setAuthenticated(localStorage.getItem("performai_session") === "active"), []);
  if (!authenticated) return <Login onSuccess={() => setAuthenticated(true)} />;
  return <Workspace onLogout={() => { localStorage.removeItem("performai_session"); setAuthenticated(false); }} />;
}
