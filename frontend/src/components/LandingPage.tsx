"use client";

import Image from "next/image";
import type * as React from "react";
import { motion } from "framer-motion";
import {
  Award, BarChart3, Bot, BriefcaseBusiness, CheckCircle2, ChevronRight, FileAudio, GraduationCap,
  LayoutDashboard, Mic, Play, Plus, ShieldCheck, Sparkles, Target, Trophy, Users, Zap,
} from "lucide-react";
import "./landing.css";
import "./landing-video-hero.css";

const BRAND_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/performai-logo.png`;
const CHECKOUTS = {
  monthly: "https://pay.kiwify.com.br/AN6yNFj",
  quarterly: "https://pay.kiwify.com.br/DeD12Hq",
  annual: "https://pay.kiwify.com.br/FsHajV6",
};

function Brand() {
  return <span className="landing-brand">
    <Image src={BRAND_LOGO} alt="" width={28} height={28} />
    <span>Performa <b>AI</b></span>
  </span>;
}

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const ease = [0.16, 1, 0.3, 1] as const;

  return <main className="landing-page">
    <motion.nav className="video-landing-nav" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease }}>
      <div className="video-nav-left"><Brand /><button className="video-menu-pill" onClick={() => scrollTo("produto")}><span><Plus size={12} strokeWidth={3} /></span>Menu</button><div className="video-nav-tags"><span>Treino por voz</span><span>Coach Comercial</span></div></div>
      <div className="video-nav-right"><div className="video-adaptive-pill"><button onClick={onEnter} aria-label="Entrar na plataforma"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="5" r="1.5"/><circle cx="11" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/></svg></button><span>Inteligencia adaptativa</span></div></div>
    </motion.nav>

    <section className="landing-video-hero">
      <motion.div className="landing-video-stage" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease }}><video autoPlay muted loop playsInline preload="metadata" poster="/brand/training-academy-hero-v2.png"><source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4" type="video/mp4" /></video></motion.div>
      <motion.div className="landing-video-footer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: 1, ease }}>
        <div className="landing-video-copy">
          <motion.p className="landing-video-kicker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6, duration: .8, ease }}><i /> Treinamento comercial inteligente, disponivel 24/7</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .8, duration: .8, ease }}>Treine vendedores.<br />Evolua cada conversa.</motion.h1>
          <motion.p className="landing-video-description" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9, duration: .8, ease }}>Coach comercial, simulacoes realistas e analise profissional de calls em uma plataforma feita para melhorar desempenho de verdade.</motion.p>
          <motion.div className="landing-video-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: .8, ease }}><button className="primary" onClick={onEnter}>Conhecer a plataforma</button><button onClick={() => scrollTo("precos")}>Ver planos</button></motion.div>
        </div>
        <motion.div className="landing-video-tags" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: .8, ease }}><span>Coach IA</span><span>Analise de Calls</span><span>Treinamentos</span></motion.div>
      </motion.div>
    </section>

    <nav className="landing-nav" hidden aria-hidden="true">
      <Brand />
      <div className="landing-nav-links">
        <button onClick={() => scrollTo("produto")}>Produto</button>
        <button onClick={() => scrollTo("precos")}>Precos</button>
      </div>
      <div className="landing-nav-cta">
        <button className="landing-btn landing-btn-ghost" onClick={onEnter}>Entrar</button>
        <button className="landing-btn landing-btn-solid" onClick={onEnter}>Testar agora</button>
      </div>
    </nav>

    <section className="landing-hero" hidden aria-hidden="true">
      <div className="landing-glow-top" />
      <div className="landing-badge"><i /> Inteligencia comercial para equipes de alta performance</div>
      <h1>Desenvolva vendedores. Acelere resultados.</h1>
      <p className="landing-lede">Treinamentos inteligentes, Coach Comercial, analise automatica de ligacoes e certificacoes em uma unica plataforma.</p>
      <div className="landing-hero-ctas">
        <button className="landing-btn landing-btn-solid" onClick={onEnter}>Comecar gratuitamente <ChevronRight /></button>
        <button className="landing-btn landing-btn-ghost" onClick={() => scrollTo("preview")}>Ver demonstracao</button>
      </div>
      <div className="landing-hero-stat"><span><b>8 modulos essenciais</b> para treinar, analisar e desenvolver sua equipe comercial.</span></div>

      <div className="landing-demo-shell">
        <div className="landing-demo-head">
          <div className="landing-demo-avatar">IA</div>
          <div><strong>Cliente simulado · Objecao de preco</strong><small>chamada em treino</small></div>
          <div className="landing-live"><i /> ao vivo</div>
        </div>
        <div className="landing-bubble landing-bubble-ai"><span>IA CLIENTE</span>Achei o valor bem acima do que eu esperava pra esse tipo de solucao.</div>
        <div className="landing-bubble landing-bubble-seller"><span>VENDEDOR</span>Entendo. Posso te mostrar o que esta incluso que reduz seu custo com...?</div>
        <div className="landing-bubble landing-bubble-ai"><span>IA CLIENTE</span>Pode, mas ja vou te avisar: tambem estou olhando o concorrente X.</div>
        <div className="landing-adherence"><span>Aderencia ao script</span><div><i /></div></div>
      </div>
    </section>

    <section className="landing-product-preview" id="preview" aria-labelledby="preview-title">
      <div className="landing-wrap">
        <div className="landing-preview-heading">
          <div>
            <p className="landing-eyebrow">Veja antes de entrar</p>
            <h2 id="preview-title">É assim que sua operação fica depois da compra.</h2>
            <p>Um ambiente único para treinar, analisar ligações, acompanhar evolução e mostrar ao gestor exatamente onde agir.</p>
          </div>
          <button className="landing-btn landing-btn-solid" onClick={onEnter}>Explorar o aplicativo <ChevronRight /></button>
        </div>
        <div className="landing-app-preview">
          <aside className="landing-preview-sidebar">
            <Brand />
            <div className="landing-preview-workspace"><small>WORKSPACE</small><strong>Equipe Comercial</strong></div>
            <nav>
              <span className="active"><LayoutDashboard /> Visão geral</span>
              <span><GraduationCap /> Treinamentos</span>
              <span><Mic /> Simulação por voz</span>
              <span><FileAudio /> Análise de calls</span>
              <span><Trophy /> Ranking do time</span>
            </nav>
            <div className="landing-preview-balance"><b>52 min</b><small>saldo nesta semana</small></div>
          </aside>
          <div className="landing-preview-content">
            <header><div><small>PAINEL DE DESENVOLVIMENTO</small><h3>Bom dia, equipe Cavalcante.</h3><p>Veja o que evoluiu e qual é a próxima ação recomendada.</p></div><button onClick={onEnter}><Mic /> Iniciar treino</button></header>
            <div className="landing-preview-kpis">
              <article><Target /><span>Nota média</span><strong>8,4</strong><small>+0,6 neste mês</small></article>
              <article><FileAudio /><span>Calls analisadas</span><strong>128</strong><small>18 nesta semana</small></article>
              <article><BarChart3 /><span>Evolução</span><strong>+24%</strong><small>últimos 30 dias</small></article>
            </div>
            <div className="landing-preview-grid">
              <article className="landing-preview-path">
                <header><div><small>TRILHA EM DESTAQUE</small><h4>Vendas de alta performance</h4></div><b>68%</b></header>
                <div className="landing-preview-progress"><i /></div>
                <ul><li><CheckCircle2 /> Prospecção e abordagem</li><li><CheckCircle2 /> Rapport</li><li className="current"><Play /> Descoberta de necessidade</li><li><Target /> Quebra de objeções</li></ul>
              </article>
              <article className="landing-preview-insight">
                <Sparkles />
                <small>RECOMENDAÇÃO INTELIGENTE</small>
                <h4>Reforce descoberta antes do pitch.</h4>
                <p>O time apresenta a solução cedo demais. Treine impacto, urgência e decisão antes de falar da oferta.</p>
                <button onClick={onEnter}>Abrir treinamento <ChevronRight /></button>
              </article>
            </div>
          </div>
        </div>
        <div className="landing-preview-proof">
          <span><CheckCircle2 /> Treinamento guiado</span>
          <span><CheckCircle2 /> Feedback após cada call</span>
          <span><CheckCircle2 /> Gestão de equipe</span>
          <span><CheckCircle2 /> Trilhas e certificados</span>
        </div>
      </div>
    </section>

    <section className="landing-logo-strip">
      <p>Uma operacao comercial completa, organizada em um unico ambiente</p>
      <div><span>Treinamento</span><span>Coach Comercial</span><span>Calls</span><span>Equipe</span><span>Certificacao</span></div>
    </section>

    <section className="landing-block landing-benefits" id="beneficios">
      <div className="landing-wrap">
        <p className="landing-eyebrow">Plataforma completa</p>
        <h2>Tudo que seu time comercial precisa para evoluir.</h2>
        <p className="landing-sub">Menos ferramentas desconectadas. Mais clareza sobre o que treinar, como praticar e onde melhorar.</p>
        <div className="landing-benefit-grid">
          {[
            ["Coach Comercial", "Orienta, explica e ajuda a resolver situacoes comerciais em uma conversa contextual.", Bot],
            ["Treinamentos", "Aulas, materiais, exercicios completos e certificacao.", GraduationCap],
            ["Analise de Calls", "Avalia ligacoes e transforma erros em um plano pratico.", FileAudio],
            ["Estrategias Comerciais", "Diagnostico, prioridades e planos de crescimento para a operacao.", BriefcaseBusiness],
            ["Dashboard", "Indicadores claros para vendedores, gestores e equipes.", LayoutDashboard],
            ["Certificados", "Documentos profissionais com progresso e validacao.", Award],
          ].map(([title, text, Icon], index) => { const Component = Icon as typeof Bot; return <article style={{ "--delay": `${index * 65}ms` } as React.CSSProperties} key={title as string}><span><Component /></span><h3>{title as string}</h3><p>{text as string}</p><i><ChevronRight /></i></article>; })}
        </div>
      </div>
    </section>

    <section className="landing-block landing-process" id="processo">
      <div className="landing-wrap">
        <p className="landing-eyebrow">Implementacao simples</p>
        <h2>Da configuracao ao desenvolvimento em cinco passos.</h2>
        <div className="landing-process-track">
          {[["01","Cadastre sua empresa",ShieldCheck],["02","Convide sua equipe",Users],["03","Treine com IA",Bot],["04","Analise resultados",BarChart3],["05","Evolua continuamente",Zap]].map(([number,title,Icon]) => { const Component = Icon as typeof Bot; return <article key={number as string}><span>{number as string}</span><Component /><strong>{title as string}</strong></article>; })}
        </div>
      </div>
    </section>

    <section className="landing-block" id="produto">
      <div className="landing-wrap">
        <p className="landing-eyebrow">O problema</p>
        <h2>Treino comercial de verdade custa caro, demora e nao escala.</h2>
        <p className="landing-sub">Simulacao com colega, role-play marcado no calendario, gestor sentado do lado ouvindo ligacao - funciona, mas nao da pra fazer todo dia com todo mundo.</p>
        <div className="landing-cards">
          <article><small>FALHA 01</small><h3>O feedback chega tarde</h3><p>O vendedor so descobre o que fez errado dias depois, quando ja perdeu a venda e esqueceu o contexto.</p></article>
          <article><small>FALHA 02</small><h3>Treino depende de agenda</h3><p>Precisa marcar horario com gestor ou colega. Na pratica, cada vendedor treina uma vez por mes - se treinar.</p></article>
          <article><small>FALHA 03</small><h3>Cada um treina de um jeito</h3><p>Sem padrao, cada gestor cobra uma coisa diferente. O time novo demora meses pra falar a lingua da empresa.</p></article>
        </div>
      </div>
    </section>

    <section className="landing-block landing-pricing-section" id="precos">
      <div className="landing-wrap">
        <p className="landing-eyebrow">Planos</p>
        <h2>Treino continuo, no ritmo do seu time.</h2>
        <p className="landing-sub">Escolha o periodo ideal para comecar. Todos os planos liberam a experiencia completa de treinamento.</p>
        <div className="landing-pricing">
          <article className="landing-price-card">
            <div>
              <span className="landing-price-period">1 mes</span>
              <h3>Mensal</h3>
            </div>
            <span className="landing-list-price">De <s>R$ 499,00</s> por</span>
            <div className="landing-price"><small>R$</small><strong>49,90</strong></div>
            <span className="landing-saving">Voce economiza R$ 449,10</span>
            <ul className="landing-price-benefits">
              <li>Acesso por 30 dias</li>
              <li><strong>60 minutos de treino por semana</strong></li>
              <li>Treinos com IA por voz</li>
              <li>Cenarios e perfis de comprador</li>
              <li>Feedback ao final da simulacao</li>
            </ul>
            <a className="landing-btn landing-btn-ghost" href={CHECKOUTS.monthly} target="_blank" rel="noopener noreferrer">Comecar agora</a>
          </article>

          <article className="landing-price-card landing-price-card-featured">
            <span className="landing-price-highlight">Mais escolhido</span>
            <div>
              <span className="landing-price-period">3 meses</span>
              <h3>Trimestral</h3>
            </div>
            <span className="landing-list-price">De <s>R$ 1.497,90</s> por</span>
            <div className="landing-price"><small>R$</small><strong>129,90</strong></div>
            <span className="landing-saving">Voce economiza R$ 1.368,00</span>
            <ul className="landing-price-benefits">
              <li>Acesso por 90 dias</li>
              <li><strong>60 minutos de treino por semana</strong></li>
              <li>Treinos com IA por voz</li>
              <li>Cenarios e perfis de comprador</li>
              <li>Feedback ao final da simulacao</li>
            </ul>
            <a className="landing-btn landing-btn-solid" href={CHECKOUTS.quarterly} target="_blank" rel="noopener noreferrer">Escolher trimestral</a>
          </article>

          <article className="landing-price-card">
            <div>
              <span className="landing-price-period">12 meses</span>
              <h3>Anual</h3>
            </div>
            <span className="landing-list-price">De <s>R$ 3.890,90</s> por</span>
            <div className="landing-price"><small>R$</small><strong>389,90</strong></div>
            <span className="landing-saving">Voce economiza R$ 3.501,00</span>
            <ul className="landing-price-benefits">
              <li>Acesso por 12 meses</li>
              <li><strong>60 minutos de treino por semana</strong></li>
              <li>Treinos com IA por voz</li>
              <li>Cenarios e perfis de comprador</li>
              <li>Feedback ao final da simulacao</li>
            </ul>
            <a className="landing-btn landing-btn-ghost" href={CHECKOUTS.annual} target="_blank" rel="noopener noreferrer">Escolher anual</a>
          </article>
        </div>
        <p className="landing-pricing-note">Os minutos de treino sao renovados a cada 7 dias e nao acumulam para a semana seguinte.</p>
      </div>
    </section>

    <section className="landing-block">
      <div className="landing-wrap">
        <div className="landing-quote">
          <p>&quot;Meu time treina antes de qualquer ligacao importante agora. Deixou de ser &apos;vamos simular quando der&apos; pra virar rotina - igual esquentar antes de entrar em quadra.&quot;</p>
          <div><i>GC</i><span><strong>Gestor comercial</strong><small>usuario do treino com IA</small></span></div>
        </div>
      </div>
    </section>

    <section className="landing-block" id="comecar">
      <div className="landing-wrap landing-final">
        <div />
        <h2>Bora colocar seu time pra treinar hoje?</h2>
        <p>Configura em minutos, sem curso longo pra aprender a usar. Seu vendedor liga pra IA e ja comeca o primeiro treino.</p>
        <button className="landing-btn landing-btn-solid" onClick={onEnter}>Quero comecar agora</button>
      </div>
    </section>

    <footer className="landing-footer"><Brand /><span>© 2026 - treinamento comercial com IA.</span></footer>
  </main>;
}
