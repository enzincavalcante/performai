"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, ChevronDown, Clipboard, MessageSquare, Mic, RefreshCw, Sparkles, Target } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import "./commercial-strategies.css";
import "./premium-module-readability.css";
import "./strategy-intelligence.css";

type Answers = { offer: string; goal: string; problem: string; channel: string; context: string };
type Priority = { title: string; what: string; why: string; how: string; resources: string; kpi: string; risk: string };
type StrategyPriority = Priority & { owner: string; cadence: string; expectedImpact: string; review: string };
type StrategyReport = {
  executiveSummary: string; currentState: string; desiredState: string; centralDiagnosis: string; bottlenecks: string[]; opportunities: string[]; strategicBridge: string; notNow: string; priorities: StrategyPriority[]; plan7: string; plan30: string; plan90: string;
};

const QUESTIONS = [
  { key: "offer", title: "O que sua empresa vende?", placeholder: "Selecionar tipo de oferta", options: ["Software/SaaS", "Servico", "Produto fisico", "Consultoria", "Educacao", "Agencia", "E-commerce", "Outro"] },
  { key: "goal", title: "Qual e o principal objetivo da empresa agora?", placeholder: "Selecionar objetivo", options: ["Aumentar faturamento", "Conseguir mais clientes", "Aumentar conversao", "Aumentar ticket medio", "Melhorar margem/lucro", "Estruturar comercial", "Escalar operacao", "Melhorar retencao", "Entrar em novos mercados", "Outro"] },
  { key: "problem", title: "Qual e hoje o maior problema para crescer?", placeholder: "Selecionar principal problema", options: ["Poucos leads", "Leads ruins", "Poucas reunioes", "Baixa conversao", "Vendedores com baixa performance", "Ciclo de vendas longo", "Ticket baixo", "Muitos cancelamentos", "Falta de processo", "Dificuldade para escalar", "Nao sei identificar", "Outro"] },
  { key: "channel", title: "Como voces conseguem clientes hoje?", placeholder: "Selecionar canal principal", options: ["Indicacao", "Outbound", "Trafego pago", "Conteudo", "Redes sociais", "Parceiros", "Eventos", "Prospeccao", "Equipe comercial", "Combinacao de canais", "Outro"] },
] as const;

const EMPTY: Answers = { offer: "", goal: "", problem: "", channel: "", context: "" };

function prioritySet(problem: string, goal: string): Priority[] {
  const leadPlan: Priority[] = [
    { title: "Definir ICP e gatilhos de compra", what: "Escolher segmento, cargo, contexto e evento que indiquem necessidade ativa.", why: "Mais volume sem foco aumenta custo, reduz resposta e sobrecarrega a equipe.", how: "Compare os melhores clientes, perdas recentes e sinais de compra; transforme os padroes em uma lista-piloto de 50 contas.", resources: "CRM, dados de clientes, pesquisa de contas e um responsavel pela lista.", kpi: "Taxa de resposta, reunioes por 50 contas e conversao por segmento.", risk: "ICP amplo ou baseado em opiniao, sem evidencia dos clientes que mais compram e permanecem." },
    { title: "Construir uma cadencia multicanal", what: "Combinar email, telefone e rede social com mensagens ligadas ao contexto de cada conta.", why: "Uma tentativa isolada perde oportunidades por timing; automacao pura reduz relevancia.", how: "Teste oito contatos em quinze dias, alternando contexto, problema, evidencia e convite para uma conversa curta.", resources: "CRM, dados de contato, modelos modulares e agenda protegida para prospeccao.", kpi: "Tentativas por conta, respostas positivas, reunioes e no-show.", risk: "Escalar a cadencia antes de comprovar mensagem, lista e capacidade de atendimento." },
    { title: "Criar uma oferta de entrada", what: "Oferecer diagnostico, benchmark ou material ligado ao problema prioritario do ICP.", why: "Uma entrega util reduz a barreira do primeiro contato e demonstra competencia antes da proposta.", how: "Crie um ativo curto, aplique a dez contas e registre quais argumentos geram conversa qualificada.", resources: "Especialista interno, uma pagina simples e casos reais autorizados.", kpi: "Interesse para reuniao, reuniao para oportunidade e custo por oportunidade.", risk: "Material generico que atrai curiosos sem potencial de compra." },
  ];
  const conversionPlan: Priority[] = [
    { title: "Localizar a etapa de maior perda", what: "Medir conversao entre contato, reuniao, diagnostico, proposta e fechamento.", why: "A media final esconde onde a venda realmente quebra e leva o time a atacar sintomas.", how: "Classifique trinta oportunidades recentes por etapa, origem, perfil, motivo de perda e proximo passo ausente.", resources: "CRM, amostra de calls, gestor comercial e planilha de auditoria.", kpi: "Conversao e tempo por etapa, motivo de perda e oportunidades sem proximo passo.", risk: "Tomar decisao com dados incompletos ou motivos de perda preenchidos sem investigacao." },
    { title: "Elevar a qualidade da discovery", what: "Padronizar problema, impacto, prioridade, decisores, processo e criterio de decisao.", why: "Proposta sem diagnostico compete por preco e cria follow-up sem compromisso.", how: "Crie um checklist comportamental, revise duas calls por vendedor por semana e treine o mesmo gap ate estabilizar.", resources: "Gestor, roteiro, Call Review e biblioteca de boas perguntas.", kpi: "Descobertas completas, propostas qualificadas, desconto e conversao proposta-venda.", risk: "Transformar o checklist em interrogatorio ou avaliar sem oferecer pratica e exemplo." },
    { title: "Instalar governanca de proximo passo", what: "Encerrar cada interacao com acao, responsavel, data e objetivo verificavel.", why: "Oportunidades sem compromisso ocupam pipeline e tornam o forecast pouco confiavel.", how: "Defina criterio de avancar e sair de cada etapa, audite o pipeline semanalmente e retire oportunidades sem evidencia.", resources: "CRM configurado, reuniao semanal curta e responsabilidade clara por oportunidade.", kpi: "Oportunidades com proximo passo, ciclo, aging e previsibilidade do forecast.", risk: "Manter negocios antigos para proteger artificialmente o tamanho do pipeline." },
  ];
  const retentionPlan: Priority[] = [
    { title: "Diagnosticar churn por causa e momento", what: "Separar cancelamentos por expectativa, adocao, valor, atendimento e perfil.", why: "Retencao nao melhora com uma acao unica para causas diferentes.", how: "Revise os ultimos vinte cancelamentos, entreviste cinco clientes e identifique o primeiro sinal observavel de risco.", resources: "CRM, CS, dados de produto e entrevistas.", kpi: "Churn por causa, tempo ate cancelamento e contas recuperadas.", risk: "Aceitar o motivo declarado sem aprofundar a causa operacional." },
    { title: "Corrigir promessa e primeiro valor", what: "Alinhar venda, entrega, sucesso esperado e marco de primeiro resultado.", why: "Expectativa errada acelera frustracao e reduz confianca antes da adocao.", how: "Defina criterios de sucesso na venda e marcos de 7, 30 e 60 dias com responsavel dos dois lados.", resources: "Vendas, CS, operacao e plano de onboarding.", kpi: "Tempo ate valor, ativacao e cumprimento dos marcos.", risk: "Prometer alem da capacidade para fechar ou nao envolver o patrocinador do cliente." },
    { title: "Criar gestao preventiva de risco", what: "Monitorar uso, atrasos, engajamento e ausencia de patrocinador.", why: "Atuar antes do pedido de cancelamento aumenta a possibilidade de recuperacao.", how: "Crie uma lista semanal de contas em risco, criterio de severidade e plano de recuperacao com prazo.", resources: "CS, alertas e painel simples de saude.", kpi: "Contas recuperadas, renovacao e receita liquida de retencao.", risk: "Alertas sem dono ou planos sem compromisso do cliente." },
  ];
  if (problem === "Poucos leads" || problem === "Leads ruins" || problem === "Poucas reunioes") return leadPlan;
  if (problem === "Muitos cancelamentos" || goal.toLowerCase().includes("retencao")) return retentionPlan;
  if (problem === "Ticket baixo") return [
    { title: "Revisar segmentacao e disposicao a pagar", what: "Comparar ticket, margem, valor entregue e custo de servir por segmento.", why: "Ticket baixo pode nascer do cliente escolhido, do pacote ou da venda de valor.", how: "Analise ganhos e perdas por segmento, tamanho, caso de uso e resultado obtido.", resources: "CRM, financeiro, entrevistas e dados de uso.", kpi: "Ticket, margem e ciclo por segmento.", risk: "Aumentar preco sem reposicionar valor e prova." },
    { title: "Redesenhar pacotes e ancoragem", what: "Separar oferta essencial, avancada e expansao por resultado e limite de uso.", why: "Empacotamento torna valor e escolha claros e reduz negociacao item a item.", how: "Monte tres pacotes, teste com clientes e documente criterios de recomendacao.", resources: "Produto, vendas, financeiro e casos de valor.", kpi: "Mix de planos, ticket e desconto.", risk: "Pacotes definidos apenas por funcionalidades." },
    { title: "Criar movimento de expansao", what: "Usar resultado comprovado para diagnosticar a proxima necessidade.", why: "Expansao em clientes aderentes custa menos que nova aquisicao.", how: "Mapeie contas elegiveis e conduza revisao trimestral de resultados e lacunas.", resources: "CS, executivo de conta e dados de sucesso.", kpi: "Receita de expansao e NRR.", risk: "Ofertar antes de comprovar o primeiro valor." },
  ];
  return conversionPlan;
}

function meaningfulContext(value: string) {
  const words = value.toLowerCase().match(/[a-z0-9À-ÿ]+/g) ?? [];
  return value.trim().length >= 45 && words.length >= 8 && new Set(words).size >= 6;
}

function metric(text: string, label: string) {
  const normalized = text.replaceAll(".", "");
  const afterNumber = normalized.match(new RegExp(`(\\d+(?:,\\d+)?)\\s*(?:${label})`, "i"));
  const afterLabel = normalized.match(new RegExp(`(?:${label})[^\\d]{0,12}(\\d+(?:,\\d+)?)`, "i"));
  const match = afterNumber || afterLabel;
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function fallbackReport(answers: Answers, resolve: (key: keyof Answers) => string, base: Priority[]): StrategyReport {
  const offer = resolve("offer"); const goal = resolve("goal"); const problem = resolve("problem"); const channel = resolve("channel");
  const priorities = base.map((item, index): StrategyPriority => ({ ...item,
    how: `${item.how} Aplique primeiro em um recorte controlado da operacao de ${offer.toLowerCase()}, registre a linha de base e compare a mudanca antes de ampliar.` ,
    owner: index === 0 ? "Lider comercial com apoio de Operacoes/CRM" : index === 1 ? "Gestor e vendedores responsaveis pela etapa" : "Direcao comercial com o dono do indicador",
    cadence: index === 0 ? "Diagnostico inicial e revisao semanal" : index === 1 ? "Execucao diaria e coaching semanal" : "Revisao quinzenal com decisao de manter, ajustar ou interromper",
    expectedImpact: `Reduzir a perda associada a ${problem.toLowerCase()} e criar evidencia para avancar em ${goal.toLowerCase()}, sem tratar a estimativa como garantia.`,
    review: index === 0 ? "Revisar em 7 dias com a linha de base pronta." : index === 1 ? "Revisar apos duas semanas de execucao comparavel." : "Revisar em 30 dias e escalar apenas com melhoria sustentada.",
  }));
  return {
    executiveSummary: `A empresa atua com ${offer.toLowerCase()}, tem como objetivo ${goal.toLowerCase()} e hoje identifica ${problem.toLowerCase()} como a principal restricao. A aquisicao depende de ${channel.toLowerCase()}, enquanto o contexto relatado mostra que a decisao nao deve ser simplesmente aumentar atividade: primeiro e necessario localizar onde o funil perde qualidade, velocidade ou compromisso.\n\nA recomendacao central e instalar um ciclo de diagnostico, teste e padronizacao. Nos primeiros sete dias, a empresa mede a linha de base e valida a causa. Nos trinta dias seguintes, executa as tres prioridades em um recorte controlado. Em noventa dias, transforma o que comprovadamente funcionou em processo, indicador, responsabilidade e rotina de gestao.`,
    currentState: `Hoje a empresa vende ${offer.toLowerCase()}, busca clientes principalmente por ${channel.toLowerCase()} e relata ${problem.toLowerCase()}. O contexto operacional informado foi: ${answers.context}`,
    desiredState: `Chegar a uma operacao capaz de perseguir ${goal.toLowerCase()} com funil mensuravel, mensagem coerente, responsabilidades claras, treinamento ligado ao gargalo e decisao baseada em evidencia.`,
    centralDiagnosis: `${problem} pode ser a causa central ou o sintoma mais visivel. A primeira obrigacao da estrategia e comprovar em qual etapa a perda acontece e por que.` ,
    bottlenecks: [`${problem} sem causa validada por etapa e evidencia`, `Dependencia de ${channel.toLowerCase()} sem comparacao clara de qualidade`, "Falta de linha de base para separar opiniao de restricao real", "Execucao e treinamento possivelmente desconectados do indicador prioritario"],
    opportunities: [`Transformar ${channel.toLowerCase()} em um processo mensuravel`, `Concentrar o time nas tres mudancas ligadas a ${goal.toLowerCase()}`, "Usar calls, CRM e motivos de perda para acelerar aprendizado", "Padronizar o comportamento vencedor antes de escalar volume"],
    strategicBridge: `A ponte entre o estado atual e o desejado combina tres movimentos: medir a restricao, mudar o comportamento que causa a perda e instalar governanca para sustentar a melhoria. Isso significa definir dono, rotina, indicador, prazo de revisao e criterio de decisao para cada prioridade, usando ${answers.context} como contexto inicial e validando as hipoteses com dados reais.`,
    notNow: "Nao priorizar contratacao, novo canal, desconto ou aumento de investimento antes de validar a restricao. Essas decisoes podem ampliar custo e complexidade sem corrigir a causa.",
    priorities,
    plan7: `Extrair dados do funil, revisar oportunidades e calls, validar a causa de ${problem.toLowerCase()}, definir linha de base, dono e primeiro experimento. A entrega da semana e um diagnostico comprovavel, nao uma lista de ideias.`,
    plan30: `Executar as tres prioridades em um recorte controlado, treinar os comportamentos necessarios, realizar coaching semanal e comparar os indicadores com a linha de base. Interromper acoes sem evidencia e documentar aprendizados.`,
    plan90: `Padronizar mensagem, processo, criterios de etapa e rotina de gestao que apresentarem melhoria sustentada. Depois, ampliar volume ou investimento com capacidade operacional, governanca e meta vinculada a ${goal.toLowerCase()}.`,
  };
}

export function CommercialStrategies({ onOpenCoach }: { onOpenCoach?: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [copied, setCopied] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [contextError, setContextError] = useState("");
  const current = QUESTIONS[step];
  const currentKey = current?.key as keyof Answers | undefined;
  const resolved = (key: keyof Answers) => answers[key] === "Outro" ? custom[key]?.trim() || "Outro nao detalhado" : answers[key];
  const basePriorities = prioritySet(resolved("problem"), resolved("goal"));
  const speech = useSpeechToText((text) => { setAnswers((value) => ({ ...value, context: `${value.context} ${text}`.trim() })); setContextError(""); });

  const generateStrategy = async () => {
    if (!meaningfulContext(answers.context)) { setContextError("Ainda nao tenho informacao suficiente. Conte como a empresa vende hoje, onde esta travando, o que ja tentou e qual resultado deseja alcancar."); return; }
    setGenerating(true); setContextError("");
    const fallback = fallbackReport(answers, resolved, basePriorities);
    try {
      const response = await fetch("/api/v1/strategies/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ offer: resolved("offer"), goal: resolved("goal"), problem: resolved("problem"), channel: resolved("channel"), context: answers.context }) });
      const payload = await response.json() as { report?: StrategyReport };
      setReport(response.ok && payload.report ? payload.report : fallback);
    } catch { setReport(fallback); }
    finally { setGenerating(false); }
  };
  const continueFlow = () => { if (step < 4) setStep((value) => value + 1); else void generateStrategy(); };
  const canContinue = step === 4 || Boolean(currentKey && answers[currentKey] && (answers[currentKey] !== "Outro" || custom[currentKey]?.trim().length >= 3));
  const copy = async (content: string, label: string) => { await navigator.clipboard.writeText(content); setCopied(label); window.setTimeout(() => setCopied(""), 1800); };
  const leads = metric(answers.context, "leads?"); const meetings = metric(answers.context, "reunioes?|reuniao"); const sales = metric(answers.context, "vendas?"); const ticket = metric(answers.context, "ticket");
  const hasNumbers = leads > 0 && meetings > 0 && sales >= 0;
  const strategyText = report ? `PLANO EXECUTIVO\n\n${report.executiveSummary}\n\nCENARIO ATUAL\n${report.currentState}\n\nCENARIO DESEJADO\n${report.desiredState}\n\nPONTE ESTRATEGICA\n${report.strategicBridge}\n\nPRIORIDADES\n${report.priorities.map((item, index) => `${index + 1}. ${item.title}\nO que: ${item.what}\nPor que: ${item.why}\nComo: ${item.how}\nResponsavel: ${item.owner}\nCadencia: ${item.cadence}\nKPI: ${item.kpi}\nImpacto: ${item.expectedImpact}\nRevisao: ${item.review}\nRisco: ${item.risk}`).join("\n\n")}\n\n7 DIAS\n${report.plan7}\n\n30 DIAS\n${report.plan30}\n\n90 DIAS\n${report.plan90}` : "";
  const summarize = async () => {
    if (!report) return; setSummarizing(true);
    try {
      const response = await fetch("/api/v1/coach/respond", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `Crie um resumo executivo profissional com situacao atual, diagnostico, gargalos, oportunidades, estrategia central, tres prioridades, transformacao, resultados esperados e proximo passo:\n${strategyText}` }) });
      const payload = await response.json() as { layer?: { direct?: string; reasoning?: string; action?: string } };
      setAiSummary(response.ok && payload.layer?.direct ? [payload.layer.direct, payload.layer.reasoning, payload.layer.action].filter(Boolean).join("\n\n") : report.executiveSummary);
    } catch { setAiSummary(report.executiveSummary); }
    finally { setSummarizing(false); }
  };
  const openCoach = () => { if (report) window.localStorage.setItem("performai_coach_strategy_context", strategyText); onOpenCoach?.(); };
  const restart = () => { setReport(null); setStep(0); setAiSummary(""); setContextError(""); };

  return <div className="commercial-strategies strategy-premium">
    <header><div><p>ESTRATEGIAS COMERCIAIS</p><h1>Diagnostico claro. Plano executavel.</h1><span>Responda cinco perguntas. A plataforma cruza o contexto, identifica o gargalo e constroi a ponte entre o cenario atual e o resultado desejado.</span></div><aside><BriefcaseBusiness /><span><strong>Consultor estrategico</strong><small>Contexto, criterio e execucao.</small></span></aside></header>
    {!report ? <section className="strategy-wizard">
      <div className="strategy-progress"><span>{step + 1} de 5</span><div><i style={{ width: `${((step + 1) / 5) * 100}%` }} /></div></div>
      <article><small>PERGUNTA {String(step + 1).padStart(2, "0")}</small><h2>{step === 4 ? "Rapidamente, como esta sua empresa hoje?" : current.title}</h2>
        {step < 4 && currentKey ? <><select value={answers[currentKey]} onChange={(event) => setAnswers((value) => ({ ...value, [currentKey]: event.target.value }))}><option value="">{current.placeholder}</option>{current.options.map((item) => <option key={item}>{item}</option>)}</select>{answers[currentKey] === "Outro" && <input autoFocus value={custom[currentKey] || ""} onChange={(event) => setCustom((value) => ({ ...value, [currentKey]: event.target.value }))} placeholder="Escreva sua resposta" />}</> : <><textarea value={answers.context} onChange={(event) => { setAnswers((value) => ({ ...value, context: event.target.value })); setContextError(""); }} placeholder="Explique o que vende, como vende, equipe, resultados, gargalos, o que ja tentou e onde quer chegar. Voce tambem pode falar por 1 ou 2 minutos." /><div className="strategy-audio"><button type="button" className={speech.status} onClick={speech.toggle} disabled={speech.status === "processing"}><Mic /> {speech.label === "Falar" ? "Responder por audio" : speech.label}</button><span>{speech.error || "Fale naturalmente. A transcricao sera adicionada ao contexto acima."}</span></div>{contextError && <p className="strategy-context-error">{contextError}</p>}</>}
        <footer><button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || generating}><ArrowLeft /> Voltar</button><button className="primary" onClick={continueFlow} disabled={!canContinue || generating}>{step === 4 ? <><Sparkles /> {generating ? "Construindo estrategia..." : "Gerar estrategia profissional"}</> : <>Continuar <ArrowRight /></>}</button></footer>
      </article>
    </section> : <section className="strategy-results">
      <header><div><small>RESUMO EXECUTIVO</small><h2>{resolved("goal")} com foco em {resolved("problem").toLowerCase()}</h2><p className="strategy-executive-summary">{report.executiveSummary}</p></div><strong><Target /> 3 prioridades</strong></header>
      <div className="strategy-diagnosis-grid"><article><small>SITUACAO ATUAL</small><strong>{resolved("channel")}</strong><p>{report.currentState}</p></article><article><small>DIAGNOSTICO CENTRAL</small><strong>{resolved("problem")}</strong><p>{report.centralDiagnosis}</p></article><article><small>MAIOR OPORTUNIDADE</small><strong>{resolved("goal")}</strong><p>{report.opportunities[0]}</p></article><article><small>NAO PRIORIZAR AGORA</small><strong>Evitar dispersao</strong><p>{report.notNow}</p></article></div>
      <details open><summary>Diagnostico da empresa <ChevronDown /></summary><div className="strategy-detail-body strategy-diagnosis-detail"><p><b>Cenario atual:</b> {report.currentState}</p><p><b>Cenario desejado:</b> {report.desiredState}</p><div><section><b>Gargalos observados</b>{report.bottlenecks.map((item) => <span key={item}>{item}</span>)}</section><section><b>Oportunidades</b>{report.opportunities.map((item) => <span key={item}>{item}</span>)}</section></div></div></details>
      <details open><summary>Ponte de transformacao <ChevronDown /></summary><div className="strategy-transformation"><article><small>ONDE ESTA</small><p>{report.currentState}</p></article><ArrowRight /><article className="bridge"><small>O QUE PRECISA ACONTECER</small><p>{report.strategicBridge}</p></article><ArrowRight /><article><small>ONDE PODE CHEGAR</small><p>{report.desiredState}</p></article></div></details>
      <details open><summary>Estrategia comercial recomendada <ChevronDown /></summary><div className="strategy-priorities">{report.priorities.map((item, index) => <article key={item.title}><header><span>PRIORIDADE #{index + 1}</span><h3>{item.title}</h3></header><dl><div><dt>O que fazer</dt><dd>{item.what}</dd></div><div><dt>Por que fazer</dt><dd>{item.why}</dd></div><div><dt>Como executar</dt><dd>{item.how}</dd></div><div><dt>Responsavel</dt><dd>{item.owner}</dd></div><div><dt>Cadencia</dt><dd>{item.cadence}</dd></div><div><dt>Recursos</dt><dd>{item.resources}</dd></div><div><dt>Indicador</dt><dd>{item.kpi}</dd></div><div><dt>Impacto esperado</dt><dd>{item.expectedImpact}</dd></div><div><dt>Quando revisar</dt><dd>{item.review}</dd></div><div><dt>Risco</dt><dd>{item.risk}</dd></div></dl></article>)}</div></details>
      <details open><summary>Plano de execucao: 7, 30 e 90 dias <ChevronDown /></summary><div className="strategy-timeline"><article><small>PROXIMOS 7 DIAS</small><b>Diagnosticar e preparar</b><p>{report.plan7}</p></article><article><small>PROXIMOS 30 DIAS</small><b>Executar e comparar</b><p>{report.plan30}</p></article><article><small>PROXIMOS 90 DIAS</small><b>Padronizar e escalar</b><p>{report.plan90}</p></article></div></details>
      <details><summary>Metricas e projecoes <ChevronDown /></summary><div className="strategy-detail-body">{hasNumbers ? <><p>Funil informado: {leads} leads, {meetings} reunioes e {sales} vendas. Conversao lead-reuniao: {((meetings / leads) * 100).toFixed(1)}%. Conversao reuniao-venda: {((sales / meetings) * 100).toFixed(1)}%.</p>{ticket > 0 && <p>Receita base calculada: {sales} x R$ {ticket.toLocaleString("pt-BR")} = <b>R$ {(sales * ticket).toLocaleString("pt-BR")}</b>. Qualquer cenario futuro sera hipotese, nunca garantia.</p>}</> : <p>Nao ha numeros suficientes para uma projecao responsavel. Informe leads, reunioes, vendas e ticket para calcular a linha de base sem inventar dados.</p>}</div></details>
      <details><summary>Cenarios e riscos <ChevronDown /></summary><div className="strategy-scenarios"><article><b>Conservador</b><p>Executa a prioridade principal com recursos atuais. Menor risco e aprendizado mais lento.</p></article><article><b>Base</b><p>Executa as tres prioridades com dono, cadencia e revisao quinzenal.</p></article><article><b>Agressivo</b><p>Aumenta investimento somente quando o teste base comprovar conversao e capacidade.</p></article></div></details>
      {aiSummary && <article className="strategy-ai-summary"><Sparkles /><div><small>RESUMO EXECUTIVO COM IA</small>{aiSummary.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>}
      <div className="strategy-actions"><button onClick={() => void copy(strategyText, "estrategia")}><Clipboard /> {copied === "estrategia" ? "Estrategia copiada" : "Copiar estrategia"}</button><button onClick={() => void summarize()} disabled={summarizing}><Sparkles /> {summarizing ? "Construindo resumo..." : "Gerar resumo executivo"}</button><button onClick={openCoach}><MessageSquare /> Conversar com IA sobre esta estrategia</button><button onClick={restart}><RefreshCw /> Refazer estrategia</button></div>
      <article className="strategy-executive-plan"><header><Check /><div><small>PLANO EXECUTIVO</small><h2>Decisao pronta para alinhar com o time</h2></div></header><p><b>Objetivo:</b> {resolved("goal")}</p><p><b>Diagnostico:</b> {report.centralDiagnosis}</p><p><b>Estrategia:</b> {report.strategicBridge}</p><p><b>KPIs:</b> {report.priorities.map((item) => item.kpi).join("; ")}</p><p><b>Responsaveis sugeridos:</b> {report.priorities.map((item) => item.owner).join("; ")}</p><p><b>Proxima acao:</b> {report.plan7}</p><button onClick={() => void copy(strategyText, "plano")}><Clipboard /> {copied === "plano" ? "Plano copiado" : "Copiar plano"}</button></article>
    </section>}
  </div>;
}
