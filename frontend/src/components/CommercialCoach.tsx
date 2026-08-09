"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, CheckCircle2, Lightbulb, Mic, RotateCcw, Send, Sparkles } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import "./commercial-coach.css";

type CoachStyle = "Direto" | "Professor" | "Desafiador" | "Pratico";
type CoachProfile = { offer: string; audience: string; segment: string; goal: string };
type CoachLayer = {
  direct: string;
  hypotheses: string[];
  reasoning: string;
  action: string;
  question: string;
  options: string[];
  next: string[];
  practicePrompt?: string;
  feedback?: { good: string; missing: string; improved: string };
};
type Message = { role: "coach" | "seller"; text: string; layer?: CoachLayer };

const START_MESSAGE: Message = {
  role: "coach",
  text: "Sou seu Coach Comercial. Traga uma situacao real. Primeiro respondo sua duvida, depois separo fatos de hipoteses, explico o raciocinio e treino a habilidade com voce.",
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const isEmptyAnswer = (value: string) => value.trim().length < 3 || /^(a|b|c|sim|nao|sei la)$/i.test(value.trim());

function practiceFeedback(answer: string, topic: string): CoachLayer {
  const text = normalize(answer);
  const hasQuestion = answer.includes("?");
  const hasValidation = /(entendo|faz sentido|compreendo|claro)/.test(text);
  const hasValue = /(resultado|impacto|retorno|custo|prioridade|risco)/.test(text);
  const good = hasQuestion
    ? "Voce devolveu a conversa ao cliente com uma pergunta, evitando argumentar no escuro."
    : "Voce manteve a resposta objetiva e tentou preservar o avancar da conversa.";
  const missing = !hasValidation
    ? "Faltou validar a preocupacao antes de investigar. Sem isso, a pergunta pode soar defensiva."
    : !hasValue
      ? "A resposta acolhe, mas ainda nao conecta a objecao ao impacto, ao risco ou ao criterio de decisao."
      : "Faltou transformar a resposta em um proximo passo verificavel, com responsavel e prazo.";
  return {
    direct: `Sua tentativa em ${topic} tem uma base aproveitavel, mas ainda nao esta pronta para uma conversa decisiva.`,
    hypotheses: ["Avaliacao baseada somente no texto desta tentativa.", "Tom de voz, pausas e reacao do cliente nao foram observados."],
    reasoning: `${good} ${missing}`,
    action: "Refaca em tres movimentos: valide em uma frase, investigue com uma pergunta curta e confirme o proximo criterio da decisao.",
    question: "Como voce quer continuar?",
    options: ["Tentar novamente", "Ver uma resposta modelo", "Treinar uma objecao mais dificil", "Entender a tecnica", "Outro - escrever resposta"],
    next: ["Tentar novamente", "Me de um exemplo", "Ensine outra tecnica", "Simule esse cliente comigo"],
    practicePrompt: "Cliente: Entendi sua proposta, mas ainda acho caro e preciso pensar. Responda como faria na ligacao.",
    feedback: { good, missing, improved: "Exemplo: Faz sentido avaliar com cuidado. Quando voce diz que precisa pensar, o que ainda nao esta claro: retorno, prioridade, risco ou alinhamento com outra pessoa?" },
  };
}

function buildCoachLayer(question: string, style: CoachStyle, context: { product: string; customer: string; stage: string; objective: string }, practiceTopic: string | null): CoachLayer {
  if (practiceTopic) return practiceFeedback(question, practiceTopic);
  const text = normalize(question);
  const setting = context.product && context.customer ? `${context.product} para ${context.customer}` : context.product || "sua oferta";
  const styleLead = style === "Professor"
    ? "Vou explicar o principio antes da frase pronta. "
    : style === "Desafiador"
      ? "Vou questionar a conclusao mais obvia. "
      : style === "Pratico"
        ? "Vamos transformar isso em uma acao que voce pode testar hoje. "
        : "Direto ao ponto: ";

  if (isEmptyAnswer(question)) {
    return {
      direct: "Ainda nao ha contexto suficiente para uma recomendacao responsavel.",
      hypotheses: ["Nao vou inventar empresa, cliente, objetivo ou problema."],
      reasoning: "Uma letra ou resposta isolada nao mostra o que aconteceu nem qual decisao comercial precisa ser tomada.",
      action: "Escolha abaixo a situacao mais proxima do que esta vivendo.",
      question: "Qual e o problema principal agora?",
      options: ["Cliente questiona preco", "Nao consigo descobrir a dor", "Proposta sem resposta", "Dificuldade para fechar", "Outro - escrever resposta"],
      next: ["Explicar meu caso", "Ver exemplos"],
    };
  }
  if (/(caro|preco|desconto|orcamento|pensar)/.test(text)) {
    return {
      direct: `${styleLead}nao defenda preco nem ofereca desconto antes de descobrir o que o cliente esta chamando de "caro".`,
      hypotheses: ["O valor pode nao ter sido conectado a uma dor prioritaria.", "A proposta pode ter chegado antes de o impacto ficar claro.", "A objecao declarada pode esconder risco, falta de autoridade ou ausencia de urgencia."],
      reasoning: `Em ${setting}, preco so pode ser avaliado contra um resultado, um risco ou uma alternativa. Sem esse criterio, listar funcionalidades aumenta informacao, mas nao necessariamente valor.`,
      action: "Use: 'Faz sentido avaliar o investimento. Quando voce diz que esta caro, o ponto e verba, comparacao com outra opcao ou retorno ainda pouco claro?' Depois aprofunde somente a resposta escolhida.",
      question: "O que normalmente acontece depois que voce apresenta o preco?",
      options: ["Questionam o valor", "Dizem que vao pensar", "Comparam concorrentes", "Pedem desconto", "Outro - escrever resposta"],
      next: ["Quero praticar isso", "Analise meu pitch", "Me de uma abordagem melhor", "Quero aprofundar"],
    };
  }
  if (/(descob|dor|pergunta|diagnost)/.test(text)) {
    return {
      direct: `${styleLead}pare de pensar em uma lista de perguntas e conduza uma sequencia: situacao, problema, impacto, prioridade e decisao.`,
      hypotheses: ["Voce pode estar mudando de pergunta antes de aprofundar a resposta anterior.", "O cliente pode responder superficialmente porque ainda nao percebeu relevancia ou seguranca."],
      reasoning: "Boa descoberta nao e quantidade. E usar cada resposta para decidir a proxima pergunta e ajudar o cliente a enxergar o custo de manter o problema.",
      action: "Comece com 'Como voces resolvem isso hoje?', aprofunde com 'Onde mais trava?' e quantifique com 'O que acontece se isso continuar por mais tres meses?'.",
      question: "Em qual parte da descoberta voce mais trava?",
      options: ["Comecar a conversa", "Aprofundar respostas", "Quantificar impacto", "Descobrir quem decide", "Outro - escrever resposta"],
      next: ["Quero praticar isso", "Crie perguntas para meu caso", "Avalie minha pergunta", "Quero aprofundar"],
    };
  }
  if (/(follow|retorno|sumiu|responde)/.test(text)) {
    return {
      direct: `${styleLead}um follow-up precisa adicionar contexto ou facilitar uma decisao; "so passando para saber" transfere todo o trabalho ao cliente.`,
      hypotheses: ["Pode ter faltado um proximo passo combinado na call.", "A mensagem pode nao trazer novidade nem uma pergunta simples de responder."],
      reasoning: "O objetivo nao e cobrar resposta. E reabrir a prioridade, reduzir esforco e permitir que o cliente avance ou encerre com clareza.",
      action: "Envie: 'Na nossa conversa voce destacou [prioridade]. Separei [evidencia] para avaliar [criterio]. Faz sentido decidirmos o proximo passo na terca ou prefere encerrar este tema agora?'.",
      question: "O que ficou combinado na ultima conversa?",
      options: ["Uma data de retorno", "Envio de proposta", "Reuniao com decisor", "Nada ficou combinado", "Outro - escrever resposta"],
      next: ["Escrever meu follow-up", "Avaliar minha mensagem", "Criar cadencia", "Quero praticar"],
    };
  }
  if (/(fech|proximo passo|decidir|conversao)/.test(text)) {
    return {
      direct: `${styleLead}fechamento nao comeca no fim; ele depende de problema reconhecido, criterio de decisao, participantes e prazo construidos durante a conversa.`,
      hypotheses: ["O cliente pode ter interesse sem compromisso.", "Pode faltar um criterio claro para decidir ou outra pessoa na aprovacao."],
      reasoning: "Pressao artificial esconde incerteza. Um bom fechamento transforma a incerteza em uma acao especifica, com responsavel, data e decisao esperada.",
      action: "Resuma o problema e o valor confirmado, pergunte o que ainda impede a decisao e proponha um proximo passo com data e participantes.",
      question: "Qual elemento costuma faltar no fim das suas calls?",
      options: ["Urgencia real", "Decisor presente", "Criterio de decisao", "Data do proximo passo", "Outro - escrever resposta"],
      next: ["Quero praticar isso", "Avalie meu fechamento", "Crie uma pergunta final", "Quero aprofundar"],
    };
  }
  if (/(pitch|apresent|argument|valor|concorrent)/.test(text)) {
    return {
      direct: `${styleLead}um pitch forte nao descreve o produto; ele conecta um problema confirmado a uma mudanca, uma evidencia e um criterio de sucesso.`,
      hypotheses: ["Seu pitch pode estar centrado em recursos.", "A mesma apresentacao pode estar sendo usada para clientes com prioridades diferentes."],
      reasoning: `Para ${setting}, relevancia vem da ligacao entre o que o cliente disse e o resultado que a oferta pode sustentar sem promessas inventadas.`,
      action: "Estruture: 'Pelo que voce descreveu, [problema] afeta [impacto]. A proposta e [mudanca], sustentada por [prova]. Isso atende ao criterio mais importante para voces?'.",
      question: "O que seu pitch destaca primeiro?",
      options: ["Funcionalidades", "Problema do cliente", "Resultados e provas", "Historia da empresa", "Outro - escrever resposta"],
      next: ["Analise meu pitch", "Quero praticar isso", "Me de um exemplo", "Comparar com concorrente"],
    };
  }
  return {
    direct: `${styleLead}entendi a situacao, mas uma recomendacao especifica depende de saber em qual momento a conversa perdeu avancar.`,
    hypotheses: ["Ainda nao ha evidencia suficiente para afirmar a causa.", "Vou investigar uma informacao por vez, sem inventar contexto."],
    reasoning: `Ja considerei o contexto salvo: oferta ${context.product || "nao informada"}, publico ${context.customer || "nao informado"} e etapa ${context.stage.toLowerCase()}.`,
    action: "Escolha o ponto mais proximo do que aconteceu. Na proxima resposta eu monto a abordagem e o treino.",
    question: "Em que momento a conversa travou?",
    options: ["Abertura", "Descoberta", "Apresentacao", "Objecao ou fechamento", "Outro - escrever resposta"],
    next: ["Explicar melhor meu caso", "Quero uma abordagem", "Quero praticar"],
  };
}

export function CommercialCoach({ profile }: { profile: CoachProfile }) {
  const [messages, setMessages] = useState<Message[]>([START_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [style, setStyle] = useState<CoachStyle>("Direto");
  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [context, setContext] = useState({ product: profile.offer, customer: profile.audience, stage: "Descoberta", objective: profile.goal });
  const speech = useSpeechToText((text) => setQuestion((current) => `${current} ${text}`.trim()));

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem("performai_commercial_coach_history");
        if (saved) setMessages(JSON.parse(saved));
      } catch { /* Start a fresh session when saved data is invalid. */ }
    });
  }, []);
  useEffect(() => { window.localStorage.setItem("performai_commercial_coach_history", JSON.stringify(messages.slice(-30))); }, [messages]);

  const suggestions = useMemo(() => ["Cliente diz que esta caro", "Nao consigo descobrir a dor", "Meu follow-up nao tem resposta", "Minhas calls nao avancam"], []);
  const sendText = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const layer = buildCoachLayer(clean, style, context, practiceTopic);
    setMessages((current) => [...current, { role: "seller", text: clean }, { role: "coach", text: layer.direct, layer }]);
    setPracticeTopic(null);
    setQuestion("");
  };
  const send = (event: FormEvent) => { event.preventDefault(); sendText(question); };
  const act = (action: string) => {
    if (/praticar|tentar novamente|simule/i.test(action)) {
      setPracticeTopic(action);
      setMessages((current) => [...current, { role: "coach", text: "Agora voce responde e eu avalio com criterio.", layer: {
        direct: "Vamos praticar em uma situacao realista.", hypotheses: ["A avaliacao considerara apenas sua resposta escrita."], reasoning: "Treinar, receber feedback e tentar novamente consolida melhor a habilidade do que apenas ler uma tecnica.", action: "Responda como se estivesse na ligacao.", question: "Cliente: Gostei da proposta, mas achei caro e preciso pensar. O que voce diz agora?", options: [], next: [] , practicePrompt: "Cliente: Gostei da proposta, mas achei caro e preciso pensar. O que voce diz agora?" } }]);
      return;
    }
    if (/outro/i.test(action)) { setQuestion(""); return; }
    sendText(action);
  };

  return <div className="commercial-coach">
    <header><div><p>COACH COMERCIAL</p><h1>Seu mentor para vender melhor.</h1><span>Desenvolve a pessoa: entende, responde, investiga, ensina, pratica e avalia. Para diagnosticar a operacao da empresa, use Estrategias Comerciais.</span></div><div><Bot /><span><strong>Coach disponivel</strong><small>Contexto e historico preservados</small></span></div></header>
    <div className="coach-style-switch"><span>Como voce quer ser orientado?</span>{(["Direto", "Professor", "Desafiador", "Pratico"] as CoachStyle[]).map((item) => <button className={style === item ? "active" : ""} onClick={() => setStyle(item)} key={item}>{item}</button>)}</div>
    <section className="commercial-coach-layout">
      <main>
        <div className="coach-chat-heading"><div><Sparkles /><span><strong>Sessao de desenvolvimento</strong><small>Resposta direta, criterio e pratica</small></span></div><button onClick={() => { setMessages([START_MESSAGE]); setPracticeTopic(null); }}><RotateCcw /> Nova conversa</button></div>
        <div className="commercial-chat">{messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><small>{message.role === "coach" ? "Coach Comercial" : "Voce"}</small><p>{message.text}</p>{message.layer && <div className="coach-layer">
          <section><b>Hipoteses, nao fatos</b>{message.layer.hypotheses.map((item) => <span key={item}>{item}</span>)}</section>
          <section><b>Por que cheguei nisso</b><span>{message.layer.reasoning}</span></section>
          <section className="coach-action"><b>Acao pratica</b><span>{message.layer.action}</span></section>
          {message.layer.feedback && <section className="coach-feedback"><b>Feedback da tentativa</b><span><strong>Funcionou:</strong> {message.layer.feedback.good}</span><span><strong>Faltou:</strong> {message.layer.feedback.missing}</span><span><strong>Versao melhor:</strong> {message.layer.feedback.improved}</span></section>}
          {message.layer.question && <section className="coach-question"><b>{message.layer.question}</b><div>{message.layer.options.map((option) => <button onClick={() => act(option)} key={option}>{option}</button>)}</div></section>}
          {message.layer.next.length > 0 && <section className="coach-next"><b>O que voce quer fazer agora?</b><div>{message.layer.next.map((option) => <button onClick={() => act(option)} key={option}>{option}</button>)}</div></section>}
        </div>}</article>)}</div>
        <div className="coach-suggestions">{suggestions.map((item) => <button onClick={() => sendText(item)} key={item}>{item}</button>)}</div>
        <form onSubmit={send}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={practiceTopic ? "Responda como se estivesse falando com o cliente..." : "Conte uma situacao real ou faca uma pergunta comercial..."} aria-label="Mensagem para o Coach Comercial" /><div className="commercial-coach-actions"><button type="button" className={`coach-voice-button ${speech.status}`} onClick={speech.toggle} disabled={speech.status === "processing"}><Mic /> {speech.label}</button><button type="submit" disabled={!question.trim()}><Send /> Enviar</button></div>{(speech.error || speech.status === "recording" || speech.status === "processing") && <p className={`coach-voice-status ${speech.status}`}><i />{speech.error || speech.label}</p>}</form>
      </main>
      <aside><div className="coach-context-title"><BrainCircuit /><span><strong>Contexto ja conhecido</strong><small>Evita repetir perguntas desnecessarias</small></span></div><label>Oferta<input value={context.product} onChange={(event) => setContext({ ...context, product: event.target.value })} placeholder="Ainda nao informado" /></label><label>Publico<input value={context.customer} onChange={(event) => setContext({ ...context, customer: event.target.value })} placeholder="Ainda nao informado" /></label><label>Etapa<select value={context.stage} onChange={(event) => setContext({ ...context, stage: event.target.value })}><option>Prospeccao</option><option>Descoberta</option><option>Apresentacao</option><option>Negociacao</option><option>Fechamento</option><option>Follow-up</option></select></label><div className="coach-context-note"><Lightbulb /><span><strong>Qualidade da orientacao</strong><small>O Coach separa evidencia, hipotese e informacao ausente. Ele nao inventa cliente, numeros ou resultados.</small></span></div><ul><li><CheckCircle2 /> Resposta direta primeiro</li><li><CheckCircle2 /> Uma pergunta por vez</li><li><CheckCircle2 /> Estrategia explicada</li><li><CheckCircle2 /> Pratica com feedback</li></ul></aside>
    </section>
  </div>;
}
