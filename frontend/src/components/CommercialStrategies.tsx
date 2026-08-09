"use client";

import { FormEvent, useState } from "react";
import { BarChart3, BriefcaseBusiness, CheckCircle2, ShieldAlert, Sparkles, Target } from "lucide-react";
import "./commercial-strategies.css";

const PROBLEMS = ["Aquisicao", "Conversao", "Ticket medio", "Retencao", "Margem", "Equipe comercial", "Processo", "Nao sei identificar", "Outro"];
const GOALS = ["Aumentar vendas", "Aumentar margem", "Gerar oportunidades", "Aumentar conversao", "Estruturar comercial", "Escalar operacao", "Outro"];
const COUNCIL = ["Aprofundar estrategia", "Criar plano de 90 dias", "Analisar meus numeros", "Melhorar minha oferta", "Simular cenarios", "Questionar essa estrategia"];

export function CommercialStrategies() {
  const [problem, setProblem] = useState("");
  const [goal, setGoal] = useState("");
  const [detail, setDetail] = useState("");
  const [other, setOther] = useState("");
  const [metrics, setMetrics] = useState({ leads: "", meetings: "", sales: "", ticket: "" });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [council, setCouncil] = useState("");
  const leads = Number(metrics.leads);
  const meetings = Number(metrics.meetings);
  const sales = Number(metrics.sales);
  const ticket = Number(metrics.ticket.replace(",", "."));
  const hasFunnel = leads > 0 && meetings >= 0 && sales >= 0;

  const generate = (event: FormEvent) => {
    event.preventDefault();
    const freeText = (other || detail).trim();
    if (!problem || !goal) { setError("Escolha o problema e o objetivo para continuar."); return; }
    if ((problem === "Outro" || goal === "Outro") && freeText.length < 12) { setError("Explique o caso em uma frase completa. Nao vamos inventar o contexto que falta."); return; }
    if (freeText && /^(a|b|c|sim|nao|sei la)$/i.test(freeText)) { setError("Essa resposta nao descreve um problema comercial. Conte o que esta acontecendo."); return; }
    setError("");
    setCouncil("");
    setReady(true);
  };

  return <div className="commercial-strategies">
    <header><div><p>ESTRATEGIAS COMERCIAIS</p><h1>Decisoes melhores para o seu comercial.</h1><span>Entende o problema da empresa, questiona premissas, cria prioridades e transforma o diagnostico em execucao mensuravel.</span></div><aside><BriefcaseBusiness /><span><strong>Motor de estrategia</strong><small>Fatos separados de hipoteses</small></span></aside></header>
    <div className="strategies-distinction"><Target /><p><b>Use aqui:</b> &ldquo;Como aumentar a conversao do meu time?&rdquo;</p><span><b>Use o Coach:</b> &ldquo;Como posso melhorar meu fechamento?&rdquo;</span></div>
    <section className="strategies-layout">
      <form onSubmit={generate}>
        <fieldset><legend>Onde esta seu maior problema?</legend><div className="strategy-options">{PROBLEMS.map((item) => <button type="button" className={problem === item ? "active" : ""} onClick={() => { setProblem(item); setReady(false); }} key={item}>{item}</button>)}</div></fieldset>
        <fieldset><legend>Qual e seu principal objetivo?</legend><div className="strategy-options">{GOALS.map((item) => <button type="button" className={goal === item ? "active" : ""} onClick={() => { setGoal(item); setReady(false); }} key={item}>{item}</button>)}</div></fieldset>
        {(problem === "Outro" || goal === "Outro") && <label>Outro - escrever resposta<textarea value={other} onChange={(event) => setOther(event.target.value)} placeholder="Explique o problema ou objetivo em uma frase" /></label>}
        <label>O que voce ja observou? <small>Opcional</small><textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Use fatos. Ex.: 500 leads, 50 reunioes e 10 vendas." /></label>
        <details><summary><BarChart3 /> Analisar numeros reais (opcional)</summary><div className="strategy-metrics"><label>Leads<input inputMode="numeric" value={metrics.leads} onChange={(event) => setMetrics({ ...metrics, leads: event.target.value })} /></label><label>Reunioes<input inputMode="numeric" value={metrics.meetings} onChange={(event) => setMetrics({ ...metrics, meetings: event.target.value })} /></label><label>Vendas<input inputMode="numeric" value={metrics.sales} onChange={(event) => setMetrics({ ...metrics, sales: event.target.value })} /></label><label>Ticket medio<input inputMode="decimal" value={metrics.ticket} onChange={(event) => setMetrics({ ...metrics, ticket: event.target.value })} /></label></div></details>
        {error && <p className="strategy-error"><ShieldAlert />{error}</p>}
        <button type="submit" className="strategy-submit"><Sparkles /> Criar plano estrategico</button>
      </form>
      {!ready ? <div className="strategy-empty"><BriefcaseBusiness /><h2>Simples por fora, rigoroso por dentro.</h2><p>Escolha problema e objetivo. Voce recebera diagnostico, prioridades, execucao, metricas, riscos e cenarios sem informacoes inventadas.</p></div> : <div className="strategy-plan">
        <header><CheckCircle2 /><div><small>PLANO ESTRATEGICO COMERCIAL</small><h2>{goal} com foco em {problem.toLowerCase()}</h2></div></header>
        <article><h3>Diagnostico</h3><p><b>Fato informado:</b> o problema selecionado foi {problem.toLowerCase()} e o objetivo e {goal.toLowerCase()}. {detail.trim() ? `Evidencia relatada: ${detail.trim()}` : "Nenhum dado operacional adicional foi informado."}</p><p><b>Hipotese a validar:</b> o gargalo pode estar em volume, qualidade, passagem de etapa ou consistencia. A selecao aponta a area, mas nao prova a causa.</p></article>
        <article><h3>Problema central</h3><p>O sintoma e {problem.toLowerCase()}. Confirme a causa comparando entrada, conversao por etapa, ciclo, perdas e variacao entre vendedores.</p></article>
        <article><h3>Oportunidades</h3><p>Mapear a etapa com maior perda, reproduzir comportamentos dos melhores vendedores e remover uma friccao por ciclo.</p></article>
        <article><h3>Estrategia principal</h3><p>Instrumentar o funil, escolher um gargalo verificavel e executar um ciclo curto de melhoria. Isso evita mudar aquisicao, oferta, equipe e processo ao mesmo tempo.</p></article>
        <div className="strategy-timeline">{[["24 horas", "Extrair os numeros atuais e criar uma linha de base."], ["7 dias", "Ouvir calls, classificar perdas e testar uma mudanca."], ["30 dias", "Treinar o comportamento e comparar com a linha de base."], ["90 dias", "Consolidar o que funcionou, documentar e escalar."]].map(([period, action]) => <article key={period}><small>{period}</small><p>{action}</p></article>)}</div>
        <article><h3>Prioridades: impacto x esforco x urgencia</h3><p>1. Medir conversao: alto impacto, baixo esforco, urgente. 2. Revisar evidencia de calls: alto impacto, esforco medio. 3. Alterar oferta ou contratar: alto esforco, somente depois do diagnostico.</p></article>
        <article><h3>Metricas</h3>{hasFunnel ? <p>Lead para reuniao: {((meetings / leads) * 100).toFixed(1)}%. Reuniao para venda: {meetings > 0 ? ((sales / meetings) * 100).toFixed(1) : "0.0"}%. Conversao total: {((sales / leads) * 100).toFixed(1)}%. {ticket > 0 ? `Receita calculada: R$ ${(sales * ticket).toLocaleString("pt-BR")}.` : "Ticket nao informado; receita nao calculada."}</p> : <p>Numeros nao informados. Acompanhe volume por etapa, conversao, ciclo, ticket, margem e motivo de perda. Nenhum numero foi estimado.</p>}</article>
        <article><h3>Riscos</h3><p>Confundir correlacao com causa, mudar varias variaveis juntas, usar amostra pequena e pressionar volume sem qualidade.</p></article>
        <article><h3>Cenarios</h3><p><b>Acima do esperado:</b> documente e replique. <b>Sem evolucao:</b> revise hipotese e execucao. <b>Novo problema:</b> preserve a linha de base e teste uma variavel.</p></article>
        <article className="strategy-first"><h3>O que eu faria primeiro?</h3><p>Hoje, reuniria as oportunidades recentes por etapa e analisaria as cinco perdas mais representativas para descobrir onde a conversao realmente quebra.</p></article>
        <div className="strategy-council"><b>Conselho estrategico</b><div>{COUNCIL.map((item) => <button onClick={() => setCouncil(item)} key={item}>{item}</button>)}</div></div>
        {council && <article className="strategy-question"><h3>{council}</h3>{council === "Questionar essa estrategia" ? <><p><b>Premissa possivelmente errada:</b> {problem.toLowerCase()} pode ser apenas o sintoma mais visivel.</p><p><b>Informacao faltante:</b> conversao por etapa, tempo, origem e vendedor.</p><p><b>Maior risco:</b> otimizar volume enquanto a perda real ocorre na qualificacao ou oferta.</p><p><b>Alternativa:</b> comparar uma coorte de ganhos e perdas antes de alterar todo o processo.</p><p><b>O que invalida a conclusao:</b> dados mostrando que o gargalo esta em outra etapa.</p></> : <p>Esta frente exige dados adicionais antes de uma recomendacao especifica. Complete os numeros relevantes e gere novamente; nenhum contexto sera inventado.</p>}</article>}
      </div>}
    </section>
  </div>;
}
