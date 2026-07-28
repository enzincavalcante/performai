"use client";

import Image from "next/image";
import {
  BarChart3, CheckCircle2, ChevronRight, FileAudio, GraduationCap,
  LayoutDashboard, Mic, Play, Sparkles, Target, Trophy,
} from "lucide-react";
import "./landing.css";

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

  return <main className="landing-page">
    <nav className="landing-nav">
      <Brand />
      <div className="landing-nav-links">
        <button onClick={() => scrollTo("produto")}>Produto</button>
        <button onClick={() => scrollTo("como-funciona")}>Como funciona</button>
        <button onClick={() => scrollTo("resultado")}>Resultado</button>
        <button onClick={() => scrollTo("precos")}>Precos</button>
      </div>
      <div className="landing-nav-cta">
        <button className="landing-btn landing-btn-ghost" onClick={onEnter}>Entrar</button>
        <button className="landing-btn landing-btn-solid" onClick={onEnter}>Testar agora</button>
      </div>
    </nav>

    <section className="landing-hero">
      <div className="landing-glow-top" />
      <div className="landing-badge"><i /> Novo - treino por chamada, direto no app</div>
      <h1>A Performa AI transforma inseguranca em confianca e treinamento em faturamento.</h1>
      <p className="landing-lede">Cada vendedor enfrenta clientes simulados por IA, pratica objecoes, negociacao e fechamento quantas vezes forem necessarias ate estar preparado para vender de verdade.</p>
      <div className="landing-hero-ctas">
        <button className="landing-btn landing-btn-ghost" onClick={() => scrollTo("como-funciona")}>Ver como funciona</button>
        <button className="landing-btn landing-btn-solid" onClick={() => scrollTo("precos")}>Quero treinar meu time</button>
      </div>
      <div className="landing-hero-stat"><span><b>+80%</b> de melhoria na taxa de conversao<small>*Baseado em clientes da Performa AI apos 7 dias de uso.</small></span></div>

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

    <section className="landing-product-preview" aria-labelledby="preview-title">
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
      <p>Confiado por times comerciais de alta performance</p>
      <div><span>Aircall</span><span>Mojo</span><span>Bamboo</span><span>Citibank</span><span>Ramp</span></div>
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

    <section className="landing-block" id="como-funciona">
      <div className="landing-wrap landing-scenario">
        <div className="landing-scenario-copy">
          <p className="landing-eyebrow">Como funciona</p>
          <h2>O vendedor liga pro robo antes de ligar pro cliente.</h2>
          <p className="landing-sub">Sem instalar nada complicado, sem esperar ninguem ficar livre. O treino mora dentro do app, disponivel a qualquer hora.</p>
        </div>
        <div className="landing-steps">
          <article><b>01</b><h3>Abre o app e liga</h3><p>O vendedor entra no aplicativo e inicia uma chamada com a IA - o cliente que vai treinar com ele agora.</p></article>
          <article><b>02</b><h3>Enfrenta objecoes reais</h3><p>A IA conduz a conversa como um cliente de verdade: questiona preco, compara concorrente, hesita, testa o discurso.</p></article>
          <article><b>03</b><h3>Recebe nota e correcao</h3><p>Ao final, o vendedor ve exatamente onde foi bem, onde travou e o que ajustar - pronto pra ligar de novo, melhor.</p></article>
        </div>
      </div>
    </section>

    <section className="landing-block" id="resultado">
      <div className="landing-wrap">
        <p className="landing-eyebrow">Resultado</p>
        <h2>O que muda quando o treino vira rotina.</h2>
        <div className="landing-stats">
          <article><b>+10x</b><span>Treinos por vendedor / mes</span></article>
          <article><b>24/7</b><span>Disponivel, sem agenda</span></article>
          <article><b>0</b><span>Ator ou colega precisando parar</span></article>
          <article><b>1</b><span>Padrao de discurso pra todo o time</span></article>
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
