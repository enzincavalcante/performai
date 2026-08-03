"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Lightbulb, Mic, RotateCcw, Send, Sparkles, Target } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import "./commercial-coach.css";

type Message = { role: "coach" | "seller"; text: string };
type CoachProfile = { offer: string; audience: string; segment: string; goal: string };

const START_MESSAGE: Message = {
  role: "coach",
  text: "Sou seu Coach Comercial. Posso ajudar com abertura, descoberta, pitch, objecoes, negociacao, follow-up e fechamento. Conte o que aconteceu e, se faltar contexto, vou fazer uma pergunta antes de recomendar uma resposta.",
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function coachReply(question: string, messages: Message[], context: { product: string; customer: string; stage: string; objective: string }) {
  const text = normalize(question);
  const priorSellerText = normalize(messages.filter((item) => item.role === "seller").map((item) => item.text).join(" "));
  const hasDetail = question.length > 75 || Boolean(context.product && context.customer);
  const setting = `${context.product ? `Voce vende ${context.product}` : "sua oferta"}${context.customer ? ` para ${context.customer}` : ""}${context.stage ? ` e esta na etapa de ${context.stage.toLowerCase()}` : ""}`;

  if (/(caro|preco|desconto|orcamento)/.test(text)) {
    if (!hasDetail && !/(concorrent|retorno|verba|orcamento)/.test(priorSellerText)) {
      return "Entendi. Antes de montar sua resposta, preciso separar a causa real: ele achou caro comparando com um concorrente, porque nao enxergou retorno ou porque o orcamento disponivel esta abaixo do investimento? Qual foi a frase exata do cliente?";
    }
    return `Considerando que ${setting}, nao ofereca desconto antes de diagnosticar. Responda: "Faz sentido avaliar o investimento com cuidado. Quando voce diz que esta caro, o ponto principal e comparacao, disponibilidade de verba ou retorno ainda pouco claro?" Depois use a resposta do cliente para quantificar impacto e apresentar uma prova relevante. Erro comum: defender o preco com funcionalidades. Proximo passo: escreva qual resultado financeiro ou operacional sua solucao consegue sustentar sem prometer algo que nao pode provar.`;
  }
  if (/(abertura|comecar|cold call|primeiros segundos)/.test(text)) {
    return `Para ${setting}, use uma abertura em quatro partes: contexto real, hipotese de problema, pergunta curta e permissao. Exemplo: "Tenho conversado com empresas de ${context.customer || "perfil semelhante"} que perdem oportunidades por falta de consistencia no processo. Isso tambem aparece por ai ou o desafio e outro?" Evite biografia da empresa nos primeiros segundos. Qual problema mais frequente sua oferta resolve?`;
  }
  if (/(descob|dor|pergunta|diagnost)/.test(text)) {
    return `Organize a descoberta em camadas: situacao atual, problema, impacto, urgencia e decisao. Para ${setting}, comece com "Como voces resolvem isso hoje?", aprofunde com "Onde mais trava?" e quantifique com "O que isso custa em tempo, receita ou risco?" O erro comum e fazer uma lista de perguntas sem usar as respostas. Me diga o que o cliente ja reconheceu para eu sugerir a proxima pergunta.`;
  }
  if (/(follow|retorno|sumiu|responde)/.test(text)) {
    return `Um follow-up profissional adiciona valor e reduz o esforco para responder. Use: "Oi, [nome]. Na nossa conversa, voce destacou [prioridade]. Separei [evidencia] que ajuda a avaliar [criterio]. Faz sentido alinharmos a decisao em 15 minutos na terca ou prefere encerrar este tema por agora?" Evite "so passando para saber". Qual compromisso ficou combinado na ultima conversa?`;
  }
  if (/(fech|proximo passo|pensar|decidir)/.test(text)) {
    return `Nao combata o "vou pensar". Descubra o que precisa ser pensado: "Claro. Para eu nao insistir sem ajudar, o que voce precisa avaliar: retorno, risco, prioridade ou alinhamento com outra pessoa?" Depois confirme criterio, responsavel e prazo. Em ${context.stage || "fechamento"}, o objetivo nao e pressionar; e transformar incerteza em uma proxima acao verificavel. Quem participa da decisao alem do seu contato?`;
  }
  if (/(concorrent|compar)/.test(text)) {
    return `Nao ataque o concorrente. Reenquadre a decisao pelos criterios que importam: resultado, risco, implantacao, suporte e custo de permanencia. Pergunte: "Alem do preco, quais tres criterios definem uma boa decisao para voces?" Compare somente o que puder comprovar e conecte cada diferenca ao impacto. O que o cliente elogiou na proposta concorrente?`;
  }
  if (/(pitch|apresent|argument|valor)/.test(text)) {
    return `Monte o pitch de ${setting} com problema confirmado, impacto, mudanca proposta, evidencia e pergunta de validacao. Exemplo: "Pelo que voce descreveu, [problema] afeta [resultado]. A proposta e [mudanca] para gerar [impacto], sustentada por [prova]. Isso atende ao criterio que voce considera mais importante?" Evite listar recursos. Qual resultado voce consegue demonstrar com um caso ou dado real?`;
  }
  return `Entendi que sua duvida e: "${question}". Para orientar sem resposta generica, me diga quatro pontos: o que voce vende, quem e o cliente, em qual etapa a conversa esta e qual frase ele disse literalmente. Com isso eu monto uma abordagem, explico por que ela funciona, mostro o erro a evitar e proponho o proximo passo.`;
}

export function CommercialCoach({ profile }: { profile: CoachProfile }) {
  const [messages, setMessages] = useState<Message[]>([START_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState({ product: profile.offer, customer: profile.audience, stage: "Descoberta", objective: profile.goal });
  const speech = useSpeechToText((text) => setQuestion((current) => `${current} ${text}`.trim()));

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem("performai_commercial_coach_history");
        if (saved) setMessages(JSON.parse(saved));
      } catch { /* Keep a fresh conversation when stored data is invalid. */ }
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("performai_commercial_coach_history", JSON.stringify(messages.slice(-30)));
  }, [messages]);

  const suggestions = useMemo(() => [
    "Meu cliente disse que esta caro. Como respondo?",
    "Como descobrir a dor sem parecer um interrogatorio?",
    "Como fazer follow-up sem ser insistente?",
    "Como conduzir o cliente para um proximo passo?",
  ], []);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    const reply = coachReply(text, messages, context);
    setMessages((current) => [...current, { role: "seller", text }, { role: "coach", text: reply }]);
    setQuestion("");
  };

  return <div className="commercial-coach">
    <header><div><p>COACH COMERCIAL</p><h1>Converse, pergunte e venda melhor.</h1><span>Receba orientacao contextual, exemplos praticos e proximos passos. Aqui voce conversa com um mentor; as simulacoes ficam no Treino de Vendas IA.</span></div><div><Bot /><span><strong>Coach disponivel</strong><small>Contexto preservado durante a conversa</small></span></div></header>
    <section className="commercial-coach-layout">
      <main>
        <div className="coach-chat-heading"><div><Sparkles /><span><strong>Sessao de orientacao</strong><small>Conte a situacao como aconteceu</small></span></div><button onClick={() => setMessages([START_MESSAGE])}><RotateCcw /> Nova conversa</button></div>
        <div className="commercial-chat">{messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><small>{message.role === "coach" ? "Coach Comercial" : "Voce"}</small><p>{message.text}</p></article>)}</div>
        <div className="coach-suggestions">{suggestions.map((item) => <button onClick={() => setQuestion(item)} key={item}>{item}</button>)}</div>
        <form onSubmit={send}>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: o cliente pediu desconto depois da proposta. O que devo perguntar antes de responder?" aria-label="Mensagem para o Coach Comercial" />
          <div className="commercial-coach-actions">
            <button type="button" className={`coach-voice-button ${speech.status}`} onClick={speech.toggle} disabled={speech.status === "processing"} aria-label={speech.status === "recording" ? "Parar gravacao" : "Falar com o Coach Comercial"}><Mic /> {speech.label}</button>
            <button type="submit" disabled={!question.trim()}><Send /> Enviar</button>
          </div>
          {(speech.error || speech.status === "recording" || speech.status === "processing") && <p className={`coach-voice-status ${speech.status}`}><i />{speech.error || speech.label}</p>}
        </form>
      </main>
      <aside><div className="coach-context-title"><Target /><span><strong>Contexto da conversa</strong><small>Deixe a orientacao mais precisa</small></span></div><label>O que voce vende?<input value={context.product} onChange={(event) => setContext({ ...context, product: event.target.value })} /></label><label>Para quem?<input value={context.customer} onChange={(event) => setContext({ ...context, customer: event.target.value })} /></label><label>Etapa da venda<select value={context.stage} onChange={(event) => setContext({ ...context, stage: event.target.value })}><option>Prospeccao</option><option>Descoberta</option><option>Apresentacao</option><option>Negociacao</option><option>Fechamento</option><option>Follow-up</option></select></label><label>Objetivo<input value={context.objective} onChange={(event) => setContext({ ...context, objective: event.target.value })} /></label><div className="coach-context-note"><Lightbulb /><span><strong>Como receber uma resposta melhor</strong><small>Inclua a frase exata do cliente, o que voce respondeu e o resultado que deseja.</small></span></div><ul><li><CheckCircle2 /> Explicacao da estrategia</li><li><CheckCircle2 /> Exemplo pronto para adaptar</li><li><CheckCircle2 /> Erros comuns</li><li><CheckCircle2 /> Proximo passo pratico</li></ul></aside>
    </section>
  </div>;
}
