"use client";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileAudio,
  Lightbulb,
  LineChart,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import "./intelligence-home.css";
import type { CommercialDiagnosis } from "@/lib/commercial-diagnosis";

type HomeTarget = "learning" | "simulation" | "calls" | "performance" | "coach";

export function IntelligenceHome({ onNavigate, diagnosis }: { onNavigate: (view: HomeTarget) => void; diagnosis?: CommercialDiagnosis | null }) {
  const focus = diagnosis?.primaryBottleneck || "investigar a objecao antes de responder";
  const training = diagnosis?.recommendedTraining;
  const mission = diagnosis?.mission || "Faca uma simulacao de negociacao e alcance nota acima de 80.";
  const openTraining = () => {
    if (training) window.localStorage.setItem("performai_training_focus", JSON.stringify(training));
    onNavigate("learning");
  };
  const openSimulation = () => {
    if (diagnosis) window.localStorage.setItem("performai_simulation_recommendation", JSON.stringify(diagnosis.recommendedSimulation));
    onNavigate("simulation");
  };
  const actions = [
    ["Treinar uma venda", "Pratique uma conversa real com um cliente simulado.", Mic, "simulation"],
    ["Analisar uma call", "Transforme a gravacao inteira em diagnostico e plano de melhoria.", FileAudio, "calls"],
    ["Falar com o Coach", "Resolva uma dificuldade comercial com orientacao profissional.", Sparkles, "coach"],
  ] as const;

  return <div className="intelligence-home">
    <section className="home-command-hero professional-home-hero">
      <div className="home-command-copy">
        <span className="home-command-eyebrow"><i /> SUA JORNADA PERSONALIZADA</span>
        <h1>Treine. Simule.<br/><b>Analise. Evolua.</b></h1>
        <h2>Seu foco principal hoje e {focus.toLowerCase()}.</h2>
        <p>{diagnosis?.thesis || "A plataforma transforma treinamentos e calls em dados objetivos para mostrar onde voce esta, o que precisa melhorar e qual acao executar agora."}</p>
        <div><button onClick={openSimulation}><Mic /> Treinar prioridade <ArrowRight /></button><button onClick={() => onNavigate("calls")}><FileAudio /> Analisar ligacao</button></div>
      </div>
      <div className="home-performance-visual" aria-label="Performance comercial atual">
        <header><span><LineChart /> PERFORMANCE ATUAL</span><b>Ultimos 30 dias</b></header>
        <div className="home-score-display"><div><small>NOTA GERAL</small><strong>82<span>/100</span></strong><em>+7 pontos no periodo</em></div><div className="home-score-track"><i /><b /></div></div>
        <div className="home-evolution-chart">{[54,58,56,64,67,72,70,77,82].map((value,index)=><i style={{height:`${value}%`,animationDelay:`${index*55}ms`}} key={index}><span>{index===8?value:""}</span></i>)}</div>
        <footer><span><i /> Descoberta <b>86</b></span><span><i /> Objecoes <b>64</b></span><span><i /> Fechamento <b>76</b></span></footer>
      </div>
    </section>

    <section className="home-now-grid professional-now-grid">
      <article className="home-recommendation home-priority-card">
        <Lightbulb />
        <span>PRINCIPAL PONTO DE MELHORIA</span>
        <h2>{focus}</h2>
        <p>{diagnosis?.impact || "Diferencie comparacao, falta de verba e ausencia de valor percebido antes de argumentar."}</p>
        <button onClick={openSimulation}>Treinar esta competencia <ArrowRight /></button>
      </article>
      <article className="home-continue home-next-training">
        <header><div><span>PROXIMA AULA RECOMENDADA</span><h2>{training?.title || "Protecao de valor na negociacao"}</h2></div><strong>25 min</strong></header>
        <p>{training ? `${training.lesson}. Recomendado a partir do seu diagnostico inicial.` : "Pratique diagnostico da resistencia, construcao de valor e concessoes condicionais."}</p>
        <div className="home-progress"><i style={{width:"35%"}} /></div>
        <footer><span><CheckCircle2 /> Recomendado pelo seu diagnostico</span><button onClick={openTraining}>Abrir treinamento <ArrowRight /></button></footer>
      </article>
    </section>

    <section className="home-focus-layout professional-focus-layout">
      <article className="home-last-call">
        <header><div><FileAudio /><span><small>ULTIMA AVALIACAO</small><strong>Call de proposta</strong></span></div><b>78<small>/100</small></b></header>
        <div><Target /><span><small>EVIDENCIA PRINCIPAL</small><p>O cliente citou risco de implantacao, mas a conversa avancou para o pitch sem aprofundar impacto e criterio de decisao.</p></span></div>
        <button onClick={() => onNavigate("calls")}>Ver avaliacao completa <ArrowRight /></button>
      </article>
      <article className="home-weekly-rhythm professional-week-review">
        <header><span><BarChart3 /> REVISAO SEMANAL</span><strong>4 calls</strong></header>
        <h2>Missao personalizada da semana.</h2>
        <p>{mission}</p>
        <button onClick={() => onNavigate("performance")}>Abrir revisao semanal <ArrowRight /></button>
      </article>
    </section>

    <section className="home-action-rail">
      <header><div><span>ACOES PRINCIPAIS</span><h2>O que voce precisa fazer agora?</h2></div><p>Escolha uma acao e comece.</p></header>
      <div>{actions.map(([title,text,Icon,target],index)=><button style={{"--delay":`${index*70}ms`} as React.CSSProperties} onClick={()=>onNavigate(target)} key={title}><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight /></button>)}</div>
    </section>

    <section className="home-signal-band"><LineChart /><div><span>COACH RECOMENDA</span><strong>{diagnosis?.coachRecommendation || "Quantifique o impacto antes do pitch e confirme o proximo passo."}</strong></div><button onClick={() => onNavigate("coach")}><Sparkles /> Falar com Coach</button></section>
  </div>;
}
