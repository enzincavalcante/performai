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

async function requestCoachLayer(message: string, messages: Message[], style: CoachStyle, context: { product: string; customer: string; stage: string; objective: string }) {
  const response = await fetch("/api/v1/coach/respond", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, style, context, history: messages.slice(-10).map((item) => ({ role: item.role, text: item.text })) }),
  });
  const payload = await response.json() as { layer?: CoachLayer; detail?: string };
  if (!response.ok || !payload.layer?.direct) throw new Error(payload.detail || "Coach indisponivel");
  return payload.layer;
}

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

  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|tudo bem)[!,.? ]*$/i.test(text.trim())) {
    return {
      direct: "Oi! Tudo bem? Estou aqui com voce. Pode me contar uma dificuldade, mandar seu pitch ou descrever uma conversa que nao saiu como esperava.",
      hypotheses: [],
      reasoning: "",
      action: "",
      question: "Como posso ajudar agora?",
      options: ["Melhorar meu pitch", "Responder uma objecao", "Descobrir a necessidade", "Fechar uma venda", "Outro - escrever resposta"],
      next: [],
    };
  }

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
  if (/(prospec|primeiro contato|abordagem|lista de clientes|novos clientes|mais reunioes)/.test(text)) {
    return {
      direct: `${styleLead}uma prospeccao eficiente comeca por uma hipotese de problema especifica, nao por uma apresentacao longa da empresa.`,
      hypotheses: ["Sua abordagem pode estar falando da oferta antes de criar relevancia.", "O publico ou o gatilho de contato pode estar amplo demais."],
      reasoning: `Para ${setting}, o primeiro contato precisa mostrar por que aquela conversa merece atencao agora. Personalizacao util conecta um sinal observavel a um problema plausivel, sem fingir que ja conhece a dor.`,
      action: "Use esta estrutura: 'Vi [sinal real]. Costumo conversar com [perfil] quando isso gera [problema]. Faz sentido eu fazer duas perguntas para entender se existe relacao com o seu momento?'.",
      question: "Onde sua prospeccao mais trava?",
      options: ["Encontrar o publico certo", "Escrever a abordagem", "Conseguir resposta", "Converter para reuniao", "Outro - escrever resposta"],
      next: ["Criar uma abordagem", "Avaliar minha mensagem", "Montar uma cadencia", "Quero praticar"],
    };
  }
  if (/(meta|produtiv|vender mais|mais vendas|performance|resultado)/.test(text)) {
    return {
      direct: `${styleLead}para vender mais, identifique primeiro em qual conversao do funil voce perde mais oportunidades e melhore esse ponto antes de apenas aumentar o volume.`,
      hypotheses: ["A meta pode estar sendo acompanhada apenas pelo resultado final.", "Volume, qualidade e conversao podem estar misturados em um unico problema."],
      reasoning: "Receita e efeito de uma cadeia: oportunidades criadas, reunioes realizadas, propostas qualificadas, taxa de ganho e ticket. Sem separar essas etapas, qualquer conselho vira palpite.",
      action: "Compare as ultimas quatro semanas e marque a maior queda entre uma etapa e a seguinte. Escolha uma habilidade ligada a essa queda e defina uma pratica diaria mensuravel.",
      question: "Qual numero mais preocupa voce hoje?",
      options: ["Poucos contatos", "Poucas reunioes", "Poucas propostas", "Baixo fechamento", "Outro - escrever resposta"],
      next: ["Diagnosticar meu funil", "Criar plano semanal", "Treinar fechamento", "Melhorar prospeccao"],
    };
  }
  if (/(timid|nervos|insegur|confian|postura|comunic)/.test(text)) {
    return {
      direct: `${styleLead}confianca comercial nao exige falar mais; exige saber o objetivo da etapa, ouvir a resposta inteira e conduzir uma pergunta de cada vez.`,
      hypotheses: ["A inseguranca pode aumentar quando voce tenta lembrar um roteiro palavra por palavra.", "Falar rapido ou preencher silencios pode reduzir sua escuta."],
      reasoning: "Uma estrutura curta reduz a carga mental e deixa espaco para reagir ao cliente. A postura melhora quando voce troca a obrigacao de convencer pela responsabilidade de diagnosticar.",
      action: "Antes da call, escreva apenas tres pontos: objetivo, duas perguntas essenciais e proximo passo desejado. Durante a resposta do cliente, espere um segundo antes de continuar.",
      question: "Em qual momento voce sente mais inseguranca?",
      options: ["Na abertura", "Ao fazer perguntas", "Ao falar de preco", "Ao pedir o fechamento", "Outro - escrever resposta"],
      next: ["Treinar minha abertura", "Simular uma objecao", "Criar meu roteiro", "Avaliar minha postura"],
    };
  }
  if (/(agressiv|mal educ|grosseir|hostil|interrompe)/.test(text)) {
    return {
      direct: `${styleLead}com um cliente agressivo, mantenha o tom calmo, reconheca o ponto sem aceitar desrespeito e recupere o controle com uma pergunta objetiva.`,
      hypotheses: ["A agressividade pode ser pressao, frustracao ou uma forma de testar firmeza.", "Responder no mesmo tom tende a afastar a conversa do problema real."],
      reasoning: "Validar uma preocupacao nao significa concordar com a forma. Limites claros preservam a relacao e permitem descobrir se ainda existe uma conversa comercial produtiva.",
      action: "Diga: 'Entendi que isso incomodou voce. Quero resolver o ponto concreto, mas preciso que a gente converse com objetividade. O problema principal foi prazo, valor ou expectativa?'.",
      question: "O que o cliente fez?",
      options: ["Elevou o tom", "Interrompeu", "Desqualificou a oferta", "Exigiu desconto", "Outro - escrever resposta"],
      next: ["Quero praticar isso", "Criar uma resposta", "Definir um limite", "Treinar negociacao"],
    };
  }
  return {
    direct: `${styleLead}sobre o que voce perguntou, vou trabalhar apenas com o que voce informou e transformar a situacao em uma decisao comercial concreta.`,
    hypotheses: ["A mensagem ainda permite mais de uma interpretacao.", "Nao vou escolher uma causa sem evidencia da conversa."],
    reasoning: `Considerei sua pergunta e o contexto salvo: oferta ${context.product || "nao informada"}, publico ${context.customer || "nao informado"} e etapa ${context.stage.toLowerCase()}. Para ser preciso, preciso localizar somente o momento da dificuldade.`,
    action: "Conte em uma frase o que voce disse e o que o cliente respondeu. Eu vou analisar essa troca e sugerir uma resposta aplicavel, sem inventar o restante da call.",
    question: "Qual foi a ultima resposta do cliente?",
    options: ["Questionou o valor", "Disse que vai pensar", "Parou de responder", "Nao viu prioridade", "Outro - escrever resposta"],
    next: ["Colar a conversa", "Enviar meu pitch", "Quero praticar"],
  };
}

export function CommercialCoach({ profile }: { profile: CoachProfile }) {
  const [messages, setMessages] = useState<Message[]>([START_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [style, setStyle] = useState<CoachStyle>("Direto");
  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [coachThinking, setCoachThinking] = useState(false);
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
  const sendText = async (text: string) => {
    const clean = text.trim();
    if (!clean || coachThinking) return;
    const activePractice = practiceTopic;
    const previousMessages = messages;
    setMessages((current) => [...current, { role: "seller", text: clean }]);
    setQuestion("");
    setCoachThinking(true);
    try {
      const isGreeting = /^(oi|ola|bom dia|boa tarde|boa noite|e ai|tudo bem)[!,.? ]*$/i.test(normalize(clean).trim());
      const layer = activePractice || isGreeting
        ? buildCoachLayer(clean, style, context, activePractice)
        : await requestCoachLayer(clean, previousMessages, style, context);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer }]);
    } catch {
      const layer = buildCoachLayer(clean, style, context, activePractice);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer }]);
    } finally {
      setPracticeTopic(null);
      setCoachThinking(false);
    }
  };
  const send = (event: FormEvent) => { event.preventDefault(); void sendText(question); };
  const act = (action: string) => {
    if (/praticar|tentar novamente|simule/i.test(action)) {
      setPracticeTopic(action);
      setMessages((current) => [...current, { role: "coach", text: "Agora voce responde e eu avalio com criterio.", layer: {
        direct: "Vamos praticar em uma situacao realista.", hypotheses: ["A avaliacao considerara apenas sua resposta escrita."], reasoning: "Treinar, receber feedback e tentar novamente consolida melhor a habilidade do que apenas ler uma tecnica.", action: "Responda como se estivesse na ligacao.", question: "Cliente: Gostei da proposta, mas achei caro e preciso pensar. O que voce diz agora?", options: [], next: [] , practicePrompt: "Cliente: Gostei da proposta, mas achei caro e preciso pensar. O que voce diz agora?" } }]);
      return;
    }
    if (/outro/i.test(action)) { setQuestion(""); return; }
    void sendText(action);
  };

  return <div className="commercial-coach">
    <header><div><p>COACH COMERCIAL</p><h1>Seu mentor para vender melhor.</h1><span>Desenvolve a pessoa: entende, responde, investiga, ensina, pratica e avalia. Para diagnosticar a operacao da empresa, use Estrategias Comerciais.</span></div><div><Bot /><span><strong>Coach disponivel</strong><small>Contexto e historico preservados</small></span></div></header>
    <div className="coach-style-switch"><span>Como voce quer ser orientado?</span>{(["Direto", "Professor", "Desafiador", "Pratico"] as CoachStyle[]).map((item) => <button className={style === item ? "active" : ""} onClick={() => setStyle(item)} key={item}>{item}</button>)}</div>
    <section className="commercial-coach-layout">
      <main>
        <div className="coach-chat-heading"><div><Sparkles /><span><strong>Sessao de desenvolvimento</strong><small>Resposta direta, criterio e pratica</small></span></div><button onClick={() => { setMessages([START_MESSAGE]); setPracticeTopic(null); }}><RotateCcw /> Nova conversa</button></div>
        <div className="commercial-chat">{messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><small>{message.role === "coach" ? "Coach Comercial" : "Voce"}</small><p>{message.text}</p>{message.layer && <div className="coach-layer">
          {message.layer.hypotheses.length > 0 && <section><b>Hipoteses, nao fatos</b>{message.layer.hypotheses.map((item) => <span key={item}>{item}</span>)}</section>}
          {message.layer.reasoning && <section><b>Por que cheguei nisso</b><span>{message.layer.reasoning}</span></section>}
          {message.layer.action && <section className="coach-action"><b>Acao pratica</b><span>{message.layer.action}</span></section>}
          {message.layer.feedback && <section className="coach-feedback"><b>Feedback da tentativa</b><span><strong>Funcionou:</strong> {message.layer.feedback.good}</span><span><strong>Faltou:</strong> {message.layer.feedback.missing}</span><span><strong>Versao melhor:</strong> {message.layer.feedback.improved}</span></section>}
          {message.layer.question && <section className="coach-question"><b>{message.layer.question}</b><div>{message.layer.options.map((option) => <button onClick={() => act(option)} key={option}>{option}</button>)}</div></section>}
          {message.layer.next.length > 0 && <section className="coach-next"><b>O que voce quer fazer agora?</b><div>{message.layer.next.map((option) => <button onClick={() => act(option)} key={option}>{option}</button>)}</div></section>}
        </div>}</article>)}{coachThinking && <article className="coach coach-thinking" aria-live="polite"><small>Coach Comercial</small><p><i /><i /><i /> Pensando na sua pergunta...</p></article>}</div>
        <div className="coach-suggestions">{suggestions.map((item) => <button disabled={coachThinking} onClick={() => void sendText(item)} key={item}>{item}</button>)}</div>
        <form onSubmit={send}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} disabled={coachThinking} placeholder={practiceTopic ? "Responda como se estivesse falando com o cliente..." : "Pergunte qualquer coisa sobre vendas..."} aria-label="Mensagem para o Coach Comercial" /><div className="commercial-coach-actions"><button type="button" className={`coach-voice-button ${speech.status}`} onClick={speech.toggle} disabled={coachThinking || speech.status === "processing"}><Mic /> {speech.label}</button><button type="submit" disabled={!question.trim() || coachThinking}><Send /> Enviar</button></div>{(speech.error || speech.status === "recording" || speech.status === "processing") && <p className={`coach-voice-status ${speech.status}`}><i />{speech.error || speech.label}</p>}</form>
      </main>
      <aside><div className="coach-context-title"><BrainCircuit /><span><strong>Contexto ja conhecido</strong><small>Evita repetir perguntas desnecessarias</small></span></div><label>Oferta<input value={context.product} onChange={(event) => setContext({ ...context, product: event.target.value })} placeholder="Ainda nao informado" /></label><label>Publico<input value={context.customer} onChange={(event) => setContext({ ...context, customer: event.target.value })} placeholder="Ainda nao informado" /></label><label>Etapa<select value={context.stage} onChange={(event) => setContext({ ...context, stage: event.target.value })}><option>Prospeccao</option><option>Descoberta</option><option>Apresentacao</option><option>Negociacao</option><option>Fechamento</option><option>Follow-up</option></select></label><div className="coach-context-note"><Lightbulb /><span><strong>Qualidade da orientacao</strong><small>O Coach separa evidencia, hipotese e informacao ausente. Ele nao inventa cliente, numeros ou resultados.</small></span></div><ul><li><CheckCircle2 /> Resposta direta primeiro</li><li><CheckCircle2 /> Uma pergunta por vez</li><li><CheckCircle2 /> Estrategia explicada</li><li><CheckCircle2 /> Pratica com feedback</li></ul></aside>
    </section>
  </div>;
}
