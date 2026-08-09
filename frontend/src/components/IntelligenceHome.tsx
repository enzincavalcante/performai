"use client";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileAudio,
  GraduationCap,
  Lightbulb,
  LineChart,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import "./intelligence-home.css";

type HomeTarget = "learning" | "simulation" | "calls" | "performance" | "coach";

export function IntelligenceHome({ onNavigate }: { onNavigate: (view: HomeTarget) => void }) {
  const actions = [
    ["Treinar uma venda", "Pratique uma conversa real com um cliente simulado.", Mic, "simulation"],
    ["Analisar uma call", "Transforme a gravacao inteira em diagnostico e plano de melhoria.", FileAudio, "calls"],
    ["Falar com o Coach", "Resolva uma dificuldade comercial com orientacao profissional.", Sparkles, "coach"],
  ] as const;

  return <div className="intelligence-home">
    <section className="home-command-hero professional-home-hero">
      <div className="home-command-copy">
        <span className="home-command-eyebrow"><i /> PERFORMANCE COMERCIAL</span>
        <h1>Treine. Simule.<br/><b>Analise. Evolua.</b></h1>
        <h2>Decisoes claras para a proxima conversa.</h2>
        <p>A plataforma transforma treinamentos e calls em dados objetivos para mostrar onde voce esta, o que precisa melhorar e qual acao executar agora.</p>
        <div><button onClick={() => onNavigate("simulation")}><Mic /> Iniciar treino <ArrowRight /></button><button onClick={() => onNavigate("calls")}><FileAudio /> Analisar ligacao</button></div>
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
        <h2>Investigue a objecao antes de responder.</h2>
        <p>Nas ultimas avaliacoes, voce respondeu preco cedo demais. Diferencie comparacao, falta de verba e ausencia de valor percebido antes de argumentar.</p>
        <button onClick={() => onNavigate("simulation")}>Treinar esta competencia <ArrowRight /></button>
      </article>
      <article className="home-continue home-next-training">
        <header><div><span>PROXIMO TREINAMENTO</span><h2>Protecao de valor na negociacao</h2></div><strong>25 min</strong></header>
        <p>Pratique diagnostico da resistencia, construcao de valor e concessoes condicionais.</p>
        <div className="home-progress"><i style={{width:"35%"}} /></div>
        <footer><span><CheckCircle2 /> Recomendado pela sua ultima call</span><button onClick={() => onNavigate("learning")}>Abrir treinamento <ArrowRight /></button></footer>
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
        <h2>Entenda os padroes da sua semana.</h2>
        <p>Compare competencias, erros recorrentes, melhor call e prioridades para os proximos sete dias.</p>
        <button onClick={() => onNavigate("performance")}>Abrir revisao semanal <ArrowRight /></button>
      </article>
    </section>

    <section className="home-action-rail">
      <header><div><span>ACOES PRINCIPAIS</span><h2>O que voce precisa fazer agora?</h2></div><p>Escolha uma acao e comece.</p></header>
      <div>{actions.map(([title,text,Icon,target],index)=><button style={{"--delay":`${index*70}ms`} as React.CSSProperties} onClick={()=>onNavigate(target)} key={title}><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight /></button>)}</div>
    </section>

    <section className="home-signal-band"><LineChart /><div><span>PADRAO IDENTIFICADO</span><strong>Quando voce quantifica o impacto antes do pitch, sua nota media de construcao de valor sobe 11 pontos.</strong></div><button onClick={() => onNavigate("performance")}><BarChart3 /> Ver evolucao</button></section>
  </div>;
}
