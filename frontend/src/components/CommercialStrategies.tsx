"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, ChevronDown, Clipboard, MessageSquare, RefreshCw, Sparkles, Target } from "lucide-react";
import "./commercial-strategies.css";
import "./premium-module-readability.css";

type Answers = { offer: string; goal: string; problem: string; channel: string; context: string };
type Priority = { title: string; what: string; why: string; how: string; resources: string; kpi: string; risk: string };

const QUESTIONS = [
  { key: "offer", title: "O que sua empresa vende?", placeholder: "Selecionar tipo de oferta", options: ["Software/SaaS", "Servico", "Produto fisico", "Consultoria", "Educacao", "Agencia", "E-commerce", "Outro"] },
  { key: "goal", title: "Qual e o principal objetivo da empresa agora?", placeholder: "Selecionar objetivo", options: ["Aumentar faturamento", "Conseguir mais clientes", "Aumentar conversao", "Aumentar ticket medio", "Melhorar margem/lucro", "Estruturar comercial", "Escalar operacao", "Melhorar retencao", "Entrar em novos mercados", "Outro"] },
  { key: "problem", title: "Qual e hoje o maior problema para crescer?", placeholder: "Selecionar principal problema", options: ["Poucos leads", "Leads ruins", "Poucas reunioes", "Baixa conversao", "Vendedores com baixa performance", "Ciclo de vendas longo", "Ticket baixo", "Muitos cancelamentos", "Falta de processo", "Dificuldade para escalar", "Nao sei identificar", "Outro"] },
  { key: "channel", title: "Como voces conseguem clientes hoje?", placeholder: "Selecionar canal principal", options: ["Indicacao", "Outbound", "Trafego pago", "Conteudo", "Redes sociais", "Parceiros", "Eventos", "Prospeccao", "Equipe comercial", "Combinacao de canais", "Outro"] },
] as const;

const EMPTY: Answers = { offer: "", goal: "", problem: "", channel: "", context: "" };

function prioritySet(problem: string, goal: string): Priority[] {
  const map: Record<string, Priority[]> = {
    "Poucos leads": [
      { title: "Definir ICP e gatilhos de compra", what: "Escolher um segmento, cargo e evento que aumente a chance de necessidade ativa.", why: "Mais volume sem foco aumenta custo e reduz conversao.", how: "Compare os 10 melhores clientes, identifique padroes e crie uma lista-piloto de 50 contas.", resources: "CRM, dados de clientes e 1 responsavel por pesquisa.", kpi: "Taxa de resposta e reunioes por 50 contas.", risk: "ICP amplo demais." },
      { title: "Construir uma cadencia multicanal", what: "Combinar contato relevante por email, telefone e rede social.", why: "Uma tentativa isolada perde oportunidades por timing.", how: "Teste uma sequencia de 8 contatos em 15 dias com duas mensagens de valor.", resources: "CRM e modelos de mensagem.", kpi: "Contatos por conta, respostas e reunioes.", risk: "Automacao sem personalizacao." },
      { title: "Criar um ativo de conversao", what: "Oferecer diagnostico, benchmark ou material ligado ao problema prioritario.", why: "Uma proposta de valor util reduz a barreira do primeiro contato.", how: "Crie um ativo curto e teste em uma unica campanha.", resources: "Especialista interno e pagina simples.", kpi: "Conversao de interesse para reuniao.", risk: "Material generico." },
    ],
    "Baixa conversao": [
      { title: "Localizar a etapa de maior perda", what: "Medir conversao entre reuniao, diagnostico, proposta e fechamento.", why: "A media final esconde onde a venda realmente quebra.", how: "Classifique 30 oportunidades recentes por etapa e motivo de perda.", resources: "CRM e amostra de calls.", kpi: "Conversao por etapa e motivo de perda.", risk: "Dados inconsistentes." },
      { title: "Elevar a qualidade da discovery", what: "Padronizar problema, impacto, prioridade, decisores e criterio de decisao.", why: "Proposta sem diagnostico compete principalmente por preco.", how: "Crie um checklist e revise duas calls por vendedor por semana.", resources: "Gestor, roteiro e Call Review.", kpi: "Descobertas completas e propostas qualificadas.", risk: "Transformar checklist em interrogatorio." },
      { title: "Treinar o principal gap", what: "Concentrar a pratica na competencia com maior impacto sobre perdas.", why: "Treinar tudo ao mesmo tempo dilui a mudanca comportamental.", how: "Execute simulacoes semanais e compare a mesma competencia por quatro semanas.", resources: "Treino com IA e rotina de coaching.", kpi: "Nota da competencia e conversao da etapa.", risk: "Avaliar sem pratica recorrente." },
    ],
    "Muitos cancelamentos": [
      { title: "Diagnosticar churn por causa e momento", what: "Separar cancelamentos por expectativa, adocao, valor, atendimento e perfil.", why: "Retencao nao melhora com uma acao unica para causas diferentes.", how: "Revise os ultimos 20 cancelamentos e entreviste cinco clientes.", resources: "CRM, CS e dados de produto.", kpi: "Churn por causa e tempo ate cancelamento.", risk: "Aceitar motivo declarado sem aprofundar." },
      { title: "Corrigir promessa e onboarding", what: "Alinhar venda, entrega e primeiro valor percebido.", why: "Expectativa errada acelera frustracao e churn.", how: "Defina criterios de sucesso na venda e marcos de 7, 30 e 60 dias.", resources: "Vendas, CS e operacao.", kpi: "Tempo ate valor e ativacao.", risk: "Prometer mais para fechar." },
      { title: "Criar sinais de risco", what: "Monitorar queda de uso, atrasos e ausencia de patrocinador.", why: "Recuperar antes do pedido de cancelamento aumenta a chance de reversao.", how: "Crie alertas e uma rotina semanal de contas em risco.", resources: "CS e dashboard simples.", kpi: "Contas recuperadas e expansao liquida.", risk: "Alertas sem responsavel." },
    ],
  };
  if (map[problem]) return map[problem];
  if (problem === "Leads ruins" || problem === "Poucas reunioes") return prioritySet("Poucos leads", goal);
  if (problem === "Vendedores com baixa performance" || problem === "Ciclo de vendas longo" || problem === "Falta de processo" || problem === "Dificuldade para escalar") return prioritySet("Baixa conversao", goal);
  if (problem === "Ticket baixo") return [
    { title: "Revisar segmentacao e disposicao a pagar", what: "Comparar ticket, margem e valor por segmento.", why: "Ticket baixo pode ser problema de cliente, pacote ou venda de valor.", how: "Analise ganhos e perdas por segmento e tamanho de conta.", resources: "CRM e dados financeiros.", kpi: "Ticket e margem por segmento.", risk: "Aumentar preco sem reposicionar valor." },
    { title: "Redesenhar pacotes", what: "Separar oferta essencial, avancada e expansao.", why: "Empacotamento torna valor e escolha mais claros.", how: "Monte tres pacotes baseados em resultados e limites objetivos.", resources: "Produto, vendas e financeiro.", kpi: "Mix de planos e ticket medio.", risk: "Pacotes definidos apenas por features." },
    { title: "Criar movimento de upsell", what: "Usar resultado conquistado para diagnosticar a proxima necessidade.", why: "Expansao em clientes aderentes custa menos que nova aquisicao.", how: "Mapeie contas elegiveis e crie revisao trimestral de resultado.", resources: "CS e executivo de conta.", kpi: "Receita de expansao e NRR.", risk: "Ofertar antes de comprovar valor." },
  ];
  return prioritySet(goal.includes("retencao") ? "Muitos cancelamentos" : "Baixa conversao", goal);
}

function metric(text: string, label: string) {
  const normalized = text.replaceAll(".", "");
  const afterNumber = normalized.match(new RegExp(`(\\d+(?:,\\d+)?)\\s*(?:${label})`, "i"));
  const afterLabel = normalized.match(new RegExp(`(?:${label})[^\\d]{0,12}(\\d+(?:,\\d+)?)`, "i"));
  const match = afterNumber || afterLabel;
  return match ? Number(match[1].replace(",", ".")) : 0;
}

export function CommercialStrategies({ onOpenCoach }: { onOpenCoach?: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const current = QUESTIONS[step];
  const currentKey = current?.key as keyof Answers | undefined;
  const resolved = (key: keyof Answers) => answers[key] === "Outro" ? custom[key]?.trim() || "Outro nao detalhado" : answers[key];
  const priorities = prioritySet(resolved("problem"), resolved("goal"));
  const leads = metric(answers.context, "leads?");
  const meetings = metric(answers.context, "reunioes?|reuniao");
  const sales = metric(answers.context, "vendas?");
  const ticket = metric(answers.context, "ticket");
  const hasNumbers = leads > 0 && meetings > 0 && sales >= 0;

  const strategyText = `PLANO EXECUTIVO\nObjetivo: ${resolved("goal")}\nProblema principal: ${resolved("problem")}\nOferta: ${resolved("offer")}\nCanal atual: ${resolved("channel")}\nContexto: ${answers.context || "Nao informado"}\n\nPrioridades:\n${priorities.map((item, index) => `${index + 1}. ${item.title}\nO que fazer: ${item.what}\nPor que: ${item.why}\nComo: ${item.how}\nKPI: ${item.kpi}\nRisco: ${item.risk}`).join("\n\n")}\n\nPlano 7 dias: medir a linha de base e validar o principal gargalo.\nPlano 30 dias: executar um teste controlado e treinar o comportamento necessario.\nPlano 90 dias: consolidar o que funcionou, documentar e escalar.`;

  const continueFlow = () => {
    if (step < 4) { setStep((value) => value + 1); return; }
    setReady(true);
  };
  const canContinue = step === 4 || Boolean(currentKey && answers[currentKey] && (answers[currentKey] !== "Outro" || custom[currentKey]?.trim().length >= 3));
  const copy = async (content: string, label: string) => { await navigator.clipboard.writeText(content); setCopied(label); window.setTimeout(() => setCopied(""), 1800); };
  const summarize = async () => {
    setSummarizing(true);
    try {
      const response = await fetch("/api/v1/coach/respond", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `Resuma este plano executivo em diagnostico, objetivo, tres prioridades, metas e proximo passo:\n${strategyText}` }) });
      const payload = await response.json() as { layer?: { direct?: string; action?: string } };
      setAiSummary(response.ok && payload.layer?.direct ? `${payload.layer.direct} ${payload.layer.action || ""}` : `Objetivo: ${resolved("goal")}. Gargalo prioritario: ${resolved("problem")}. Execute ${priorities.map((item) => item.title).join(", ")}. Primeiro passo: medir a linha de base nos proximos 7 dias.`);
    } catch { setAiSummary(`Objetivo: ${resolved("goal")}. Gargalo prioritario: ${resolved("problem")}. Primeiro passo: medir a linha de base e validar a causa antes de escalar investimento.`); }
    finally { setSummarizing(false); }
  };
  const openCoach = () => {
    window.localStorage.setItem("performai_coach_strategy_context", strategyText);
    onOpenCoach?.();
  };
  const restart = () => { setReady(false); setStep(0); setAiSummary(""); };

  return <div className="commercial-strategies strategy-premium">
    <header><div><p>ESTRATEGIAS COMERCIAIS</p><h1>Diagnostico claro. Plano executavel.</h1><span>Responda cinco perguntas. A plataforma cruza o contexto, identifica o gargalo e organiza as tres prioridades de maior impacto.</span></div><aside><BriefcaseBusiness /><span><strong>Consultor estrategico</strong><small>Menos opiniao. Mais criterio.</small></span></aside></header>
    {!ready ? <section className="strategy-wizard">
      <div className="strategy-progress"><span>{step + 1} de 5</span><div><i style={{ width: `${((step + 1) / 5) * 100}%` }} /></div></div>
      <article>
        <small>PERGUNTA {String(step + 1).padStart(2, "0")}</small>
        <h2>{step === 4 ? "Conte rapidamente como sua empresa esta hoje." : current.title}</h2>
        {step < 4 && currentKey ? <>
          <select value={answers[currentKey]} onChange={(event) => setAnswers((value) => ({ ...value, [currentKey]: event.target.value }))}><option value="">{current.placeholder}</option>{current.options.map((item) => <option key={item}>{item}</option>)}</select>
          {answers[currentKey] === "Outro" && <input autoFocus value={custom[currentKey] || ""} onChange={(event) => setCustom((value) => ({ ...value, [currentKey]: event.target.value }))} placeholder="Escreva sua resposta" />}
        </> : <textarea value={answers.context} onChange={(event) => setAnswers((value) => ({ ...value, context: event.target.value }))} placeholder="Pode falar de faturamento, clientes, equipe, ticket, metas, dificuldades ou qualquer informacao que ajude a IA a entender sua empresa." />}
        <footer><button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}><ArrowLeft /> Voltar</button><button className="primary" onClick={continueFlow} disabled={!canContinue}>{step === 4 ? <><Sparkles /> Gerar estrategia</> : <>Continuar <ArrowRight /></>}</button></footer>
      </article>
    </section> : <section className="strategy-results">
      <header><div><small>RESUMO EXECUTIVO</small><h2>{resolved("goal")} com foco em {resolved("problem").toLowerCase()}</h2><p>Para uma empresa de {resolved("offer").toLowerCase()} que hoje depende de {resolved("channel").toLowerCase()}, o primeiro movimento nao e fazer tudo: e validar o gargalo e concentrar execucao nas tres prioridades abaixo.</p></div><strong><Target /> 3 prioridades</strong></header>
      <div className="strategy-diagnosis-grid"><article><small>SITUACAO ATUAL</small><strong>{resolved("channel")}</strong><p>{answers.context || "Contexto operacional adicional nao informado."}</p></article><article><small>PRINCIPAL GARGALO</small><strong>{resolved("problem")}</strong><p>Hipotese orientadora que precisa ser validada com dados do funil e evidencia de clientes.</p></article><article><small>MAIOR OPORTUNIDADE</small><strong>{resolved("goal")}</strong><p>Concentrar recursos na etapa que limita o crescimento antes de ampliar o volume.</p></article><article><small>NAO PRIORIZAR AGORA</small><strong>Mudar tudo ao mesmo tempo</strong><p>Contratacao, novos canais ou desconto sem diagnostico podem ampliar o desperdicio.</p></article></div>
      <details open><summary>Diagnostico da empresa <ChevronDown /></summary><div className="strategy-detail-body"><p><b>Tese:</b> {resolved("problem")} pode ser causa ou apenas o sintoma mais visivel. Cruze conversao por etapa, origem, ciclo, ticket e motivo de perda antes de aumentar investimento.</p><p><b>Risco atual:</b> perseguir {resolved("goal").toLowerCase()} com mais volume sem corrigir a restricao principal.</p><p><b>Prioridade estrategica:</b> localizar a maior perda mensuravel e executar um ciclo curto de melhoria.</p></div></details>
      <details open><summary>Estrategia comercial recomendada <ChevronDown /></summary><div className="strategy-priorities">{priorities.map((item, index) => <article key={item.title}><header><span>PRIORIDADE #{index + 1}</span><h3>{item.title}</h3></header><dl><div><dt>O que fazer</dt><dd>{item.what}</dd></div><div><dt>Por que fazer</dt><dd>{item.why}</dd></div><div><dt>Como executar</dt><dd>{item.how}</dd></div><div><dt>Recursos</dt><dd>{item.resources}</dd></div><div><dt>Indicador</dt><dd>{item.kpi}</dd></div><div><dt>Risco</dt><dd>{item.risk}</dd></div></dl></article>)}</div></details>
      <details><summary>Plano de execucao: 7, 30 e 90 dias <ChevronDown /></summary><div className="strategy-timeline"><article><small>PROXIMOS 7 DIAS</small><b>Validar o gargalo</b><p>Extrair a linha de base, revisar uma amostra real e escolher o teste de maior impacto.</p></article><article><small>PROXIMOS 30 DIAS</small><b>Executar e comparar</b><p>Rodar um experimento, treinar a habilidade necessaria e comparar com a linha de base.</p></article><article><small>PROXIMOS 90 DIAS</small><b>Padronizar e escalar</b><p>Documentar o que funcionou, definir responsaveis e ampliar somente depois da evidencia.</p></article></div></details>
      <details><summary>Metricas e projecoes <ChevronDown /></summary><div className="strategy-detail-body">{hasNumbers ? <><p>Funil informado: {leads} leads, {meetings} reunioes e {sales} vendas. Conversao lead-reuniao: {((meetings / leads) * 100).toFixed(1)}%. Conversao reuniao-venda: {((sales / meetings) * 100).toFixed(1)}%.</p>{ticket > 0 && <p>Receita base calculada: {sales} × R$ {ticket.toLocaleString("pt-BR")} = <b>R$ {(sales * ticket).toLocaleString("pt-BR")}</b>. Projecoes futuras exigem uma hipotese explicita de conversao; nao tratamos potencial como garantia.</p>}</> : <p>Nao ha numeros suficientes para uma projecao responsavel. Informe no contexto leads, reunioes, vendas e ticket para calcular a linha de base sem inventar dados.</p>}</div></details>
      <details><summary>Cenarios e riscos <ChevronDown /></summary><div className="strategy-scenarios"><article><b>Conservador</b><p>Melhora operacional sem novo investimento relevante. Menor risco, aprendizado mais lento.</p></article><article><b>Base</b><p>Executa as tres prioridades com dono, prazo e revisao quinzenal.</p></article><article><b>Agressivo</b><p>Aumenta investimento somente depois que o teste base comprovar conversao e capacidade operacional.</p></article></div></details>
      {aiSummary && <article className="strategy-ai-summary"><Sparkles /><div><small>RESUMO COM IA</small><p>{aiSummary}</p></div></article>}
      <div className="strategy-actions"><button onClick={() => void copy(strategyText, "estrategia")}><Clipboard /> {copied === "estrategia" ? "Estrategia copiada" : "Copiar estrategia"}</button><button onClick={() => void summarize()} disabled={summarizing}><Sparkles /> {summarizing ? "Resumindo..." : "Resumir com IA"}</button><button onClick={openCoach}><MessageSquare /> Conversar com IA sobre esta estrategia</button><button onClick={restart}><RefreshCw /> Refazer estrategia</button></div>
      <article className="strategy-executive-plan"><header><Check /><div><small>PLANO EXECUTIVO</small><h2>Decisao pronta para alinhar com o time</h2></div></header><p><b>Objetivo:</b> {resolved("goal")}</p><p><b>Problema:</b> {resolved("problem")}</p><p><b>KPIs:</b> {priorities.map((item) => item.kpi).join("; ")}</p><p><b>Responsaveis sugeridos:</b> lider comercial, dono da etapa e analista de operacoes/CRM.</p><p><b>Proxima acao:</b> medir a linha de base e validar a causa nos proximos 7 dias.</p><button onClick={() => void copy(strategyText, "plano")}><Clipboard /> {copied === "plano" ? "Plano copiado" : "Copiar plano"}</button></article>
    </section>}
  </div>;
}
