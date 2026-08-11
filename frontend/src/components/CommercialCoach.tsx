"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, Lightbulb, Mic, RotateCcw, Send, Sparkles } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import "./commercial-coach.css";
import "./coach-context.css";
import "./premium-module-readability.css";

type CoachProfile = { offer: string; audience: string; segment: string; goal: string };
type CoachLayer = {
  direct: string;
  hypotheses: string[];
  reasoning: string;
  action: string;
  question: string;
  options: string[];
  next: string[];
  feedback?: { good: string; missing: string; improved: string };
};
type Message = { role: "coach" | "seller"; text: string; layer?: CoachLayer };

const START_MESSAGE: Message = {
  role: "coach",
  text: "Ola! O que voce quer melhorar ou resolver hoje? Pode falar do seu jeito.",
};

const IDEAS = [
  "Tenho uma duvida sobre vendas",
  "Quero melhorar minha abordagem",
  "Preciso lidar com uma objecao",
  "Quero melhorar meu fechamento",
  "Quero aprender uma tecnica",
  "Quero analisar uma situacao comercial",
  "Quero melhorar meu processo comercial",
  "Quero melhorar minha performance como vendedor",
  "Quero ajuda com uma negociacao",
  "Quero ajuda com follow-up",
  "Outro",
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function casualReply(message: string): CoachLayer | null {
  const text = normalize(message).replace(/[!,.?]+$/g, "");
  const simple = (direct: string, question = "", options: string[] = []): CoachLayer => ({ direct, hypotheses: [], reasoning: "", action: "", question, options, next: [] });
  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai)$/.test(text)) return simple("Ola! Tudo bem? Como posso te ajudar hoje?");
  if (/^(tudo bem|como voce esta|como vc ta|suave)$/.test(text)) return simple("Tudo sim! E com voce? O que aconteceu por ai?");
  if (/^(obrigado|obrigada|valeu|vlw|show|beleza)$/.test(text)) return simple("Tamo junto. Quando quiser, continua daqui.");
  if (/(mano|cara|velho).*(aconteceu|rolou|reuniao|call)|aconteceu um negocio/.test(text)) return simple("Conta ai. O que aconteceu?");
  return null;
}

function fallbackLayer(message: string, messages: Message[] = []): CoachLayer {
  const text = normalize(message);
  const previousSeller = [...messages].reverse().find((item) => item.role === "seller")?.text ?? "";
  const previousText = normalize(previousSeller);
  const layer = (direct: string, reasoning: string, action: string, question: string, options: string[], hypotheses: string[] = []): CoachLayer => ({
    direct, reasoning, action, question, options, hypotheses, next: [],
  });
  if (/^(mas|so que|e ele|e ela|depois|agora)/.test(text) && previousSeller) {
    if (/(caro|preco|desconto)/.test(previousText) && /(proposta|pediu|receber|enviar)/.test(text)) return layer(
      "Isso muda a leitura: ele nao rejeitou a conversa. Pediu um material para continuar avaliando, mas a objecao de valor ainda nao esta resolvida.",
      `Antes voce contou: "${previousSeller.slice(0, 160)}". Agora acrescentou que ele pediu a proposta. Interesse e compromisso nao sao a mesma coisa; a proposta precisa sair com criterio e proximo passo.`,
      "Envie a proposta recapitulando problema, impacto e resultado discutidos. Termine confirmando uma data para revisar duvidas e decidir o proximo movimento.",
      "Quando ele pediu a proposta, voces combinaram uma data para conversar novamente?",
      ["Sim, ja tem data", "Nao combinamos", "Ele pediu por mensagem", "Foi durante a call", "Vou explicar"],
    );
    return layer(
      "Entendi. Estou juntando isso ao que voce contou antes, porque essa nova informacao muda a analise.",
      `O contexto anterior foi: "${previousSeller.slice(0, 170)}". A continuacao precisa ser avaliada em conjunto, sem recomecar o diagnostico.`,
      "Conte o que aconteceu imediatamente depois. Eu vou manter a mesma linha da conversa.",
      "Qual foi a reacao seguinte da outra pessoa?",
      ["Concordou", "Fez outra objecao", "Pediu proposta", "Parou de responder", "Vou escrever"],
    );
  }
  if (/(caro|preco|desconto|orcamento|sem verba|pensar)/.test(text)) return layer(
    "Nao responda defendendo o preco de imediato. Primeiro descubra o que 'caro' quer dizer para esse cliente.",
    "Pode ser falta de verba, comparacao com concorrente, retorno pouco claro, baixa prioridade ou apenas negociacao. A resposta certa depende da causa.",
    "Diga: 'Entendi. Quando voce diz que esta caro, esta comparando com o orcamento disponivel, com outra proposta ou com o retorno que espera gerar?'",
    "Ele falou isso logo depois do preco ou depois de voces ja discutirem problema, impacto e resultado?",
    ["Logo depois do preco", "Depois da descoberta", "Comparou concorrente", "Pediu desconto", "Vou explicar melhor"],
    ["Ainda nao da para cravar qual e a objecao real."],
  );
  if (/(follow|nao responde|sumiu|retorno|mensagem)/.test(text)) return layer(
    "Seu follow-up precisa facilitar uma decisao, nao apenas cobrar uma resposta.",
    "Mensagens como 'so passando para saber' nao adicionam contexto nem reduzem o esforco do cliente. Retome a prioridade e proponha uma resposta simples.",
    "Escreva: 'Na nossa conversa voce destacou [prioridade]. Separei [evidencia] para avaliar esse ponto. Faz sentido avancarmos na terca ou prefere encerrar este tema agora?'",
    "O que ficou combinado na ultima conversa?",
    ["Envio de proposta", "Data de retorno", "Reuniao com decisor", "Nada definido", "Vou contar o contexto"],
  );
  if (/(prospec|cold call|abordagem|reunioes|leads|outbound)/.test(text)) return layer(
    "Para conseguir mais reunioes, fale menos da sua empresa e crie relevancia com um sinal real do prospect.",
    "Uma boa abordagem liga um fato observavel a um problema plausivel e pede permissao para investigar. Isso soa consultivo sem fingir que voce ja conhece a dor.",
    "Use: 'Vi [sinal real]. Costumo conversar com [perfil] quando isso gera [problema]. Faz sentido eu fazer duas perguntas para entender se existe relacao com o seu momento?'",
    "Onde sua prospeccao mais trava hoje?",
    ["Encontrar o publico", "Conseguir resposta", "Converter em reuniao", "Montar cadencia", "Vou explicar"],
  );
  if (/(descob|discovery|dor|diagnost|pergunta|spin|bant|meddic)/.test(text)) return layer(
    "Boa discovery nao e uma lista de perguntas. E aprofundar a resposta anterior ate entender problema, impacto, prioridade e decisao.",
    "O cliente se abre quando percebe que cada pergunta nasce do que acabou de dizer. Trocar de assunto cedo demais produz respostas superficiais.",
    "Comece com 'Como voces fazem isso hoje?', aprofunde com 'Onde mais trava?' e quantifique com 'O que acontece se isso continuar por tres meses?'.",
    "Qual parte da discovery mais trava voce?",
    ["Comecar", "Aprofundar", "Quantificar impacto", "Descobrir decisor", "Vou explicar"],
  );
  if (/(fech|proximo passo|conversao|decisao|assinar|contrato)/.test(text)) return layer(
    "Fechamento fica mais natural quando problema, criterio de decisao, participantes e prazo foram construidos durante a conversa.",
    "Pressionar no fim nao corrige uma descoberta incompleta. O objetivo e transformar interesse em uma acao verificavel.",
    "Resuma o que foi confirmado, pergunte o que ainda impede a decisao e proponha data, participantes e objetivo do proximo passo.",
    "O que costuma faltar no fim das suas calls?",
    ["Urgencia", "Decisor", "Criterio de decisao", "Data definida", "Vou explicar"],
  );
  if (/(pitch|apresent|demonstr|valor|beneficio|concorrent)/.test(text)) return layer(
    "Um pitch forte conecta o problema confirmado a uma mudanca, uma evidencia e um criterio de sucesso; ele nao comeca pela lista de recursos.",
    "A mesma funcionalidade vale coisas diferentes para clientes diferentes. Relevancia nasce da ligacao com algo que o cliente realmente disse.",
    "Estruture: 'Pelo que voce descreveu, [problema] afeta [impacto]. A proposta muda [processo], sustentada por [prova]. Isso atende ao criterio mais importante para voces?'",
    "O que seu pitch destaca primeiro?",
    ["Funcionalidades", "Problema", "Resultado e prova", "Historia da empresa", "Quero enviar meu pitch"],
  );
  if (/(meta|gestor|equipe|pipeline|funil|forecast|performance|vender mais)/.test(text)) return layer(
    "Separe o problema por etapa do funil antes de cobrar mais atividade do time.",
    "Receita e efeito de volume, conversao por etapa, ticket e ciclo. Sem localizar a maior perda, aumentar atividade pode apenas ampliar desperdicio.",
    "Compare as ultimas quatro semanas e marque a maior queda entre contatos, reunioes, propostas e vendas. Depois escolha uma habilidade ligada a essa queda.",
    "Qual numero mais preocupa voce agora?",
    ["Poucos contatos", "Poucas reunioes", "Poucas propostas", "Baixo fechamento", "Vou trazer os numeros"],
  );
  return layer(
    "Entendi o ponto. Ainda nao quero assumir uma causa sem conhecer a situacao real.",
    `Voce perguntou sobre: "${message.slice(0, 180)}". Uma resposta util precisa separar o que aconteceu, o que voce esperava e a reacao do cliente.`,
    "Conte a ultima troca da conversa: o que voce disse e o que a outra pessoa respondeu. Eu analiso a partir dali.",
    "Qual foi a ultima resposta do cliente?",
    ["Questionou valor", "Disse que vai pensar", "Parou de responder", "Nao viu prioridade", "Vou escrever a fala"],
  );
}

async function requestCoachLayer(message: string, messages: Message[], profile: CoachProfile, strategyContext: string) {
  const response = await fetch("/api/v1/coach/respond", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message,
      context: { product: profile.offer, customer: profile.audience, objective: strategyContext ? `${profile.goal}. Estrategia carregada: ${strategyContext}` : profile.goal },
      history: messages.slice(-20).map((item) => ({ role: item.role, text: item.text })),
    }),
  });
  const payload = await response.json() as { layer?: CoachLayer; detail?: string };
  if (!response.ok || !payload.layer?.direct) throw new Error(payload.detail || "Coach indisponivel");
  return payload.layer;
}

export function CommercialCoach({ profile }: { profile: CoachProfile }) {
  const [messages, setMessages] = useState<Message[]>([START_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [idea, setIdea] = useState("");
  const [thinking, setThinking] = useState(false);
  const [strategyContext, setStrategyContext] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeechToText((text) => setQuestion((current) => `${current} ${text}`.trim()));

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem("performai_commercial_coach_history");
        if (saved) setMessages(JSON.parse(saved));
        const strategy = window.localStorage.getItem("performai_coach_strategy_context");
        if (strategy) { setStrategyContext(strategy); window.localStorage.removeItem("performai_coach_strategy_context"); }
      } catch { /* Invalid history starts a new conversation. */ }
    });
  }, []);
  useEffect(() => { window.localStorage.setItem("performai_commercial_coach_history", JSON.stringify(messages.slice(-40))); }, [messages]);

  const sendText = async (value: string) => {
    const clean = value.trim();
    if (!clean || thinking) return;
    const previous = messages;
    setMessages((current) => [...current, { role: "seller", text: clean }]);
    setQuestion("");
    setIdea("");
    setThinking(true);
    try {
      const casual = casualReply(clean);
      const layer = casual ?? await requestCoachLayer(clean, previous, profile, strategyContext);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer }]);
    } catch {
      const layer = fallbackLayer(clean, previous);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer }]);
    } finally {
      setThinking(false);
    }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void sendText(question); };
  const chooseIdea = (value: string) => {
    setIdea(value);
    setQuestion(value === "Outro" ? "" : value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return <div className="commercial-coach coach-simple">
    <header>
      <p>COACH COMERCIAL</p>
      <h1>O que voce quer melhorar ou resolver hoje?</h1>
      <span>Converse livremente. O Coach entende o contexto, lembra do que voce disse e adapta a profundidade da resposta.</span>
    </header>
    <main className="coach-conversation">
      <div className="coach-chat-heading"><div><Sparkles /><span><strong>Conversa com seu Coach</strong><small>Orientacao comercial com memoria</small></span></div><button onClick={() => { setMessages([START_MESSAGE]); setQuestion(""); }}><RotateCcw /> Nova conversa</button></div>
      {strategyContext && <div className="coach-loaded-context"><Sparkles /><span><strong>Estrategia carregada</strong><small>O Coach ja recebeu o diagnostico e o plano. Pergunte sem copiar e colar.</small></span><button onClick={() => setStrategyContext("")} aria-label="Remover contexto">x</button></div>}
      <div className="commercial-chat">
        {messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}>
          <small>{message.role === "coach" ? "Coach Comercial" : "Voce"}</small>
          <p>{message.text}</p>
          {message.layer && <div className="coach-layer">
            {message.layer.reasoning && <details><summary>Entenda o porque <ChevronDown /></summary><p>{message.layer.reasoning}</p>{message.layer.hypotheses.map((item) => <span key={item}>{item}</span>)}</details>}
            {message.layer.action && <details><summary>Como aplicar <ChevronDown /></summary><p>{message.layer.action}</p></details>}
            {message.layer.feedback && <details><summary>Feedback da tentativa <ChevronDown /></summary><p><b>Funcionou:</b> {message.layer.feedback.good}</p><p><b>Faltou:</b> {message.layer.feedback.missing}</p><p><b>Versao melhor:</b> {message.layer.feedback.improved}</p></details>}
            {message.layer.question && <section className="coach-question"><b>{message.layer.question}</b><div>{message.layer.options.map((option) => <button onClick={() => option.includes("Vou") ? setQuestion("") : void sendText(option)} key={option}>{option}</button>)}</div></section>}
          </div>}
        </article>)}
        {thinking && <article className="coach coach-thinking" aria-live="polite"><small>Coach Comercial</small><p><i /><i /><i /> Entendendo o que voce disse...</p></article>}
      </div>
      <form className="coach-main-composer" onSubmit={submit}>
        <textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} disabled={thinking} placeholder={idea === "Outro" ? "Escreva o que voce quer perguntar ao Coach" : "Pergunte qualquer coisa sobre vendas..."} aria-label="Mensagem para o Coach Comercial" />
        <div><button type="button" className={`coach-voice-button ${speech.status}`} onClick={speech.toggle} disabled={thinking || speech.status === "processing"}><Mic /> {speech.label}</button><button type="submit" disabled={!question.trim() || thinking}><Send /> Enviar</button></div>
        {(speech.error || speech.status === "recording" || speech.status === "processing") && <p className={`coach-voice-status ${speech.status}`}><i />{speech.error || speech.label}</p>}
      </form>
      <label className="coach-idea-select"><Lightbulb /><span>Precisa de uma ideia?</span><select value={idea} onChange={(event) => chooseIdea(event.target.value)}><option value="">Escolha um atalho</option>{IDEAS.map((item) => <option key={item}>{item}</option>)}</select></label>
    </main>
  </div>;
}
