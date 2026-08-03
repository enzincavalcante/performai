"use client";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileAudio,
  Flame,
  GraduationCap,
  Lightbulb,
  LineChart,
  Mic,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import "./intelligence-home.css";

type HomeTarget = "learning" | "simulation" | "calls" | "gamification" | "performance" | "coach";

export function IntelligenceHome({ onNavigate }: { onNavigate: (view: HomeTarget) => void }) {
  const actions = [
    ["Treinar uma venda", "Pratique uma conversa real com um cliente simulado.", Mic, "simulation"],
    ["Analisar uma call", "Transforme uma gravacao em diagnostico e plano de melhoria.", FileAudio, "calls"],
    ["Falar com o Coach", "Resolva uma duvida comercial antes da proxima conversa.", Sparkles, "coach"],
  ] as const;

  return <div className="intelligence-home">
    <section className="home-command-hero">
      <div className="home-command-copy">
        <span className="home-command-eyebrow"><i /> SUA CENTRAL DE EVOLUCAO</span>
        <h1>Evolua sua performance <b>comercial.</b></h1>
        <h2>Treine. Pratique. Analise. Melhore.</h2>
        <p>A IA acompanha sua evolucao e mostra exatamente o que fazer para vender melhor na proxima conversa.</p>
        <div><button onClick={() => onNavigate("learning")}><GraduationCap /> Continuar treinamento <ArrowRight /></button><button onClick={() => onNavigate("simulation")}><Mic /> Treinar uma venda</button></div>
      </div>
      <div className="home-performance-visual" aria-label="Evolucao da performance comercial">
        <header><span><Zap /> PERFORMANCE EM TEMPO REAL</span><b>Ultimos 30 dias</b></header>
        <div className="home-score-display"><div><small>NOTA ATUAL</small><strong>82<span>/100</span></strong><em>+7 pontos</em></div><div className="home-score-track"><i /><b /></div></div>
        <div className="home-evolution-chart">{[54,58,56,64,67,72,70,77,82].map((value,index)=><i style={{height:`${value}%`,animationDelay:`${index*55}ms`}} key={index}><span>{index===8?value:""}</span></i>)}</div>
        <footer><span><i /> Comunicacao <b>88</b></span><span><i /> Objecoes <b>64</b></span><span><i /> Fechamento <b>76</b></span></footer>
      </div>
    </section>

    <section className="home-now-grid">
      <article className="home-continue">
        <header><div><span>CONTINUE DE ONDE PAROU</span><h2>Negociacao Avancada</h2></div><strong>65%</strong></header>
        <p>Modulo 4 de 6 · Protecao de margem e troca de concessoes</p>
        <div className="home-progress"><i /></div>
        <footer><span><CheckCircle2 /> 8 de 12 aulas concluidas</span><button onClick={() => onNavigate("learning")}>Continuar aula <ArrowRight /></button></footer>
      </article>
      <article className="home-recommendation">
        <Lightbulb />
        <span>PROXIMA RECOMENDACAO</span>
        <h2>Objecoes ainda limitam seu resultado.</h2>
        <p>Voce evoluiu em comunicacao, mas responde preco cedo demais. Investigue comparacao, verba e retorno antes de defender valor.</p>
        <button onClick={() => onNavigate("simulation")}>Treinar objecoes <ArrowRight /></button>
      </article>
    </section>

    <section className="home-focus-layout">
      <article className="home-daily-mission">
        <div><span><Flame /> DESAFIO DO DIA</span><b>Dificil</b></div>
        <h2>Venda sem dar desconto</h2>
        <p>O cliente quer fechar, mas exige 20% de desconto. Preserve margem sem perder a oportunidade.</p>
        <footer><strong>+500 XP</strong><button onClick={() => onNavigate("simulation")}>Aceitar desafio <ArrowRight /></button></footer>
      </article>
      <article className="home-last-call">
        <header><div><FileAudio /><span><small>ULTIMA CALL</small><strong>Call de proposta</strong></span></div><b>78<small>/100</small></b></header>
        <div><Target /><span><small>PRINCIPAL MELHORIA</small><p>Aprofundar descoberta antes de apresentar a solucao.</p></span></div>
        <button onClick={() => onNavigate("calls")}>Ver analise completa <ArrowRight /></button>
      </article>
      <article className="home-weekly-rhythm">
        <header><span><Trophy /> RITMO DA SEMANA</span><strong>4/5</strong></header>
        <div>{["S","T","Q","Q","S"].map((day,index)=><i className={index<4?"done":""} key={`${day}-${index}`}>{index<4?<CheckCircle2 />:day}</i>)}</div>
        <p>Falta uma atividade para concluir sua meta semanal.</p>
        <button onClick={() => onNavigate("performance")}>Ver minha evolucao</button>
      </article>
    </section>

    <section className="home-action-rail">
      <header><div><span>ACOES RAPIDAS</span><h2>Escolha e comece.</h2></div><p>Sem configuracoes desnecessarias.</p></header>
      <div>{actions.map(([title,text,Icon,target],index)=><button style={{"--delay":`${index*70}ms`} as React.CSSProperties} onClick={()=>onNavigate(target)} key={title}><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight /></button>)}</div>
    </section>

    <section className="home-signal-band"><LineChart /><div><span>INSIGHT DA SEMANA</span><strong>Quando voce faz duas perguntas de impacto antes do pitch, sua nota media sobe 11 pontos.</strong></div><button onClick={() => onNavigate("performance")}><BarChart3 /> Ver dados</button></section>
  </div>;
}
