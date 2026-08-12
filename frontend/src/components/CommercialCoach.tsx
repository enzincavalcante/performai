"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Check, Download, GraduationCap, Lightbulb, Mic, Pencil, Play, RotateCcw, Save, Send, Sparkles, Target, X } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { localCoachResponse, type CoachLayer, type CoachMemory } from "@/lib/coach-brain";
import "./commercial-coach.css";
import "./coach-context.css";
import "./premium-module-readability.css";
import "./coach-intelligence.css";
import "./coach-brain.css";
import "./coach-teacher.css";

type CoachProfile = { offer: string; audience: string; segment: string; goal: string; challenge: string };
type Message = { role: "coach" | "seller"; text: string; layer?: CoachLayer; source?: string };
type StudyMaterial = { title: string; diagnosis: string; principle: string; example: string; exercise: string; checklist: string[]; mistakes: string[] };

const START_MESSAGE: Message = { role: "coach", text: "Fala! O que voce quer aprender, melhorar ou resolver hoje? Pode perguntar do seu jeito." };
const EMPTY_MEMORY: CoachMemory = { difficulties: [], topics: [], examples: [], decisions: [], activePractice: null };
const STAGES = ["Estruturando vendas", "Prospectando", "Qualificando leads", "Fazendo reunioes", "Negociando", "Fechando", "Pos-venda"];
const IDEAS = ["O que e SPIN Selling?", "Quero melhorar meu pitch", "Tenho dificuldade com objecao de preco", "Crie um follow-up para um cliente que sumiu", "Quero praticar uma negociacao", "Analise uma situacao comercial"];

function buildStudyMaterial(source: string, profile: CoachProfile): StudyMaterial {
  const text = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const topic = text.includes("pitch") ? "Pitch de valor" : text.includes("objec") || text.includes("preco") ? "Tratamento de objecoes" : text.includes("fech") ? "Fechamento consultivo" : text.includes("prospec") || text.includes("abordagem") ? "Prospeccao e abordagem" : text.includes("follow") ? "Follow-up comercial" : "Diagnostico e conversa consultiva";
  const offer = profile.offer || "sua oferta";
  const audience = profile.audience || "seu publico";
  const example = topic === "Pitch de valor"
    ? `Para ${audience}: "Pelo que voce descreveu, [problema] esta causando [impacto]. ${offer} muda [processo] para gerar [resultado verificavel]. Isso atende ao criterio mais importante para voces?"`
    : topic === "Tratamento de objecoes"
      ? `"Faz sentido avaliar isso com cuidado. Quando voce diz que esta caro, esta comparando com o orcamento, outra alternativa ou com o retorno que ainda nao ficou claro?"`
      : `"Antes de recomendar ${offer}, quero entender como ${audience} lida com esse processo hoje, onde mais trava e o que precisaria mudar para virar prioridade."`;
  return {
    title: `${topic} aplicado a ${offer}`,
    diagnosis: `Este material parte da situacao: "${source.slice(0, 260)}". Ele considera a oferta ${offer}, o publico ${audience}, o objetivo ${profile.goal || "comercial"} e a etapa ${profile.challenge || "nao informada"}.`,
    principle: topic === "Pitch de valor" ? "Um pitch profissional nasce do diagnostico: problema confirmado, impacto, mudanca proposta, evidencia e pergunta de validacao." : topic === "Tratamento de objecoes" ? "Validar nao significa concordar. Investigue a causa, responda com valor e confirme se a resistencia foi resolvida." : "Conversa consultiva exige uma pergunta por vez, aprofundamento da resposta e proximo passo verificavel.",
    example,
    exercise: `Escreva uma resposta de ate 45 segundos para uma situacao real envolvendo ${audience}. Conecte ${offer} ao resultado e termine com uma pergunta. Depois envie ao Coach para receber feedback.`,
    checklist: ["Usei informacao real do cliente", "Expliquei resultado antes de recurso", "Evitei promessa sem evidencia", "Fiz uma pergunta de validacao", "Preparei um proximo passo"],
    mistakes: ["Recitar roteiro sem reagir ao cliente", "Apresentar antes de entender impacto", "Responder preco sem investigar", "Encerrar sem compromisso verificavel"],
  };
}

async function requestCoachLayer(message: string, messages: Message[], profile: CoachProfile, strategyContext: string, memory: CoachMemory) {
  const response = await fetch("/api/v1/coach/respond", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message,
      context: { product: profile.offer, customer: profile.audience, stage: profile.challenge, objective: strategyContext ? `${profile.goal}. Estrategia carregada: ${strategyContext}` : profile.goal },
      history: messages.slice(-30).map((item) => ({ role: item.role, text: item.text })),
      memory,
    }),
  });
  const payload = await response.json() as { layer?: CoachLayer; detail?: string };
  if (!response.ok || !payload.layer?.direct) throw new Error(payload.detail || "Coach indisponivel");
  return payload.layer;
}

export function CommercialCoach({ profile, onProfileChange, onOpenTraining }: { profile: CoachProfile; onProfileChange?: (profile: CoachProfile) => void; onOpenTraining?: (moduleId?: string, lesson?: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([START_MESSAGE]);
  const [memory, setMemory] = useState<CoachMemory>(EMPTY_MEMORY);
  const [commercialContext, setCommercialContext] = useState<CoachProfile>(profile);
  const [contextDraft, setContextDraft] = useState<CoachProfile>(profile);
  const [editingContext, setEditingContext] = useState(false);
  const [customStage, setCustomStage] = useState(!STAGES.includes(profile.challenge));
  const [question, setQuestion] = useState("");
  const [idea, setIdea] = useState("");
  const [thinking, setThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [strategyContext, setStrategyContext] = useState("");
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeechToText((text) => setQuestion((current) => `${current} ${text}`.trim()));

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedMessages = window.localStorage.getItem("performai_commercial_coach_history");
        const savedMemory = window.localStorage.getItem("performai_commercial_coach_memory");
        const savedContext = window.localStorage.getItem("performai_coach_context");
        if (savedMessages) setMessages(JSON.parse(savedMessages));
        if (savedMemory) setMemory(JSON.parse(savedMemory));
        if (savedContext) {
          const parsed = { ...profile, ...JSON.parse(savedContext) } as CoachProfile;
          setCommercialContext(parsed); setContextDraft(parsed); setCustomStage(!STAGES.includes(parsed.challenge));
        }
        const strategy = window.localStorage.getItem("performai_coach_strategy_context");
        if (strategy) { setStrategyContext(strategy); window.localStorage.removeItem("performai_coach_strategy_context"); }
      } catch { /* A malformed local session starts with safe defaults. */ }
    });
  }, [profile]);
  useEffect(() => { window.localStorage.setItem("performai_commercial_coach_history", JSON.stringify(messages.slice(-60))); }, [messages]);
  useEffect(() => { window.localStorage.setItem("performai_commercial_coach_memory", JSON.stringify(memory)); }, [memory]);
  useEffect(() => {
    if (!thinking) return;
    const first = window.setTimeout(() => setThinkingStage(1), 550);
    const second = window.setTimeout(() => setThinkingStage(2), 1250);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [thinking]);

  const sendText = async (value: string) => {
    const clean = value.trim();
    if (!clean || thinking) return;
    const previous = messages;
    setMessages((current) => [...current, { role: "seller", text: clean }]);
    setQuestion(""); setIdea(""); setThinkingStage(0); setThinking(true);
    try {
      const layer = await requestCoachLayer(clean, previous, commercialContext, strategyContext, memory);
      setMemory(layer.memory || memory);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer, source: clean }]);
    } catch {
      const layer = localCoachResponse(clean, { product: commercialContext.offer, customer: commercialContext.audience, stage: commercialContext.challenge, objective: commercialContext.goal }, previous.map((item) => ({ role: item.role, text: item.text })), memory);
      setMemory(layer.memory);
      setMessages((current) => [...current, { role: "coach", text: layer.direct, layer, source: clean }]);
    } finally { setThinking(false); }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void sendText(question); };
  const chooseIdea = (value: string) => { setIdea(value); setQuestion(value); window.setTimeout(() => inputRef.current?.focus(), 0); };
  const resetConversation = () => { setMessages([START_MESSAGE]); setMemory(EMPTY_MEMORY); setQuestion(""); };
  const updateDraft = (field: keyof CoachProfile, value: string) => setContextDraft((current) => ({ ...current, [field]: value }));
  const saveContext = () => {
    const next = { ...contextDraft, offer: contextDraft.offer.trim(), audience: contextDraft.audience.trim(), goal: contextDraft.goal.trim(), challenge: contextDraft.challenge.trim() };
    setCommercialContext(next); setContextDraft(next); setEditingContext(false);
    window.localStorage.setItem("performai_coach_context", JSON.stringify(next));
    onProfileChange?.(next);
    setMessages((current) => [...current, { role: "coach", text: `Contexto atualizado. Vou considerar ${next.offer || "sua oferta"}, ${next.audience || "seu publico"}, a etapa ${next.challenge || "nao informada"} e o objetivo ${next.goal || "nao informado"} nas proximas respostas.` }]);
  };
  const openMaterial = () => {
    const source = [...messages].reverse().find((item) => item.role === "seller")?.text || "Quero desenvolver minha conversa comercial";
    setMaterial(buildStudyMaterial(source, commercialContext));
  };
  const downloadMaterial = () => {
    if (!material) return;
    const content = `PERFORMA AI - APOSTILA PERSONALIZADA\n\n${material.title}\n\nDIAGNOSTICO\n${material.diagnosis}\n\nPRINCIPIO\n${material.principle}\n\nEXEMPLO APLICADO\n${material.example}\n\nEXERCICIO\n${material.exercise}\n\nCHECKLIST\n${material.checklist.map((item) => `[ ] ${item}`).join("\n")}\n\nERROS PARA EVITAR\n${material.mistakes.map((item) => `- ${item}`).join("\n")}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "apostila-personalizada-performa-ai.txt"; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="commercial-coach coach-simple">
    {material && <div className="coach-material-backdrop" role="presentation" onClick={() => setMaterial(null)}><article className="coach-material" role="dialog" aria-modal="true" aria-label="Apostila personalizada" onClick={(event) => event.stopPropagation()}><header><div><small>APOSTILA PERSONALIZADA</small><h2>{material.title}</h2><p>Criada com o contexto da sua empresa e da dificuldade apresentada.</p></div><button onClick={() => setMaterial(null)} aria-label="Fechar"><X /></button></header><div><section><h3>Diagnostico</h3><p>{material.diagnosis}</p></section><section><h3>Principio comercial</h3><p>{material.principle}</p></section><section className="wide"><h3>Exemplo aplicado</h3><blockquote>{material.example}</blockquote></section><section><h3>Exercicio pratico</h3><p>{material.exercise}</p></section><section><h3>Checklist</h3>{material.checklist.map((item) => <span key={item}>{item}</span>)}</section><section className="wide"><h3>Erros para evitar</h3>{material.mistakes.map((item) => <span key={item}>{item}</span>)}</section></div><footer><button onClick={downloadMaterial}><Download /> Baixar apostila</button><button onClick={() => { setMaterial(null); onOpenTraining?.(); }}><GraduationCap /> Abrir videoaulas</button></footer></article></div>}
    <header><p>COACH COMERCIAL</p><h1>Um professor comercial para conversar de verdade.</h1><span>Pergunte, peça exemplos, envie seu pitch ou pratique uma situação. O Coach responde primeiro, usa seu contexto e aprofunda somente quando fizer sentido.</span></header>
    <div className="coach-workspace-layout">
      <main className="coach-conversation">
        <div className="coach-chat-heading"><div><Sparkles /><span><strong>Conversa com seu Coach</strong><small>Escuta, interpreta, responde e ensina</small></span></div><nav><button onClick={openMaterial}><BookOpen /> Material</button><button onClick={resetConversation}><RotateCcw /> Nova conversa</button></nav></div>
        {strategyContext && <div className="coach-loaded-context"><Sparkles /><span><strong>Estrategia carregada</strong><small>O Coach ja recebeu o diagnostico e o plano. Pergunte sem copiar e colar.</small></span><button onClick={() => setStrategyContext("")} aria-label="Remover contexto">x</button></div>}
        <div className="commercial-chat">
          {messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><small>{message.role === "coach" ? "Coach Comercial" : "Voce"}</small><p>{message.text}</p>
            {message.layer && <div className="coach-layer">
              {message.layer.lesson ? <section className="coach-mini-lesson"><header><GraduationCap /><div><small>MODO PROFESSOR</small><h3>{message.layer.lesson.title}</h3></div></header>{message.layer.lesson.sections.map((section) => <div className="coach-lesson-section" key={section.title}><h4>{section.title}</h4><p>{section.content}</p></div>)}<div className="coach-example bad"><b>Exemplo ruim</b><p>{message.layer.lesson.badExample}</p></div><div className="coach-example good"><b>Exemplo melhor</b><p>{message.layer.lesson.goodExample}</p></div><div className="coach-lesson-errors"><h4>Principais erros</h4>{message.layer.lesson.mistakes.map((item) => <span key={item}><X /> {item}</span>)}</div><div className="coach-lesson-exercise"><Target /><span><b>Como treinar</b><p>{message.layer.lesson.exercise}</p></span></div></section> : (message.layer.reasoning || message.layer.action) && <section className="coach-inline-explanation">{message.layer.reasoning && <div><h4>Raciocinio</h4><p>{message.layer.reasoning}</p>{message.layer.hypotheses.map((item) => <span key={item}>{item}</span>)}</div>}{message.layer.action && <div><h4>Aplicacao pratica</h4><p>{message.layer.action}</p></div>}</section>}
              {message.layer.feedback && <section className="coach-feedback"><header><Target /><b>Feedback da tentativa</b></header><p><b>Funcionou:</b> {message.layer.feedback.good}</p><p><b>Faltou:</b> {message.layer.feedback.missing}</p><p><b>Versao melhor:</b> {message.layer.feedback.improved}</p></section>}
              {message.layer.training && <section className="coach-training-recommendation"><div><GraduationCap /><span><small>CONTINUE APRENDENDO</small><b>{message.layer.training.title}</b><p>{message.layer.training.lesson} · {message.layer.training.duration} · aula + atividade</p><em>{message.layer.training.activity}</em></span></div><button onClick={() => onOpenTraining?.(message.layer?.training?.moduleId, message.layer?.training?.lesson)}><Play /> Assistir aula</button></section>}
              {message.layer.question && <section className="coach-question"><b>{message.layer.question}</b>{message.layer.decisionRequired && message.layer.options.length > 0 && <div>{message.layer.options.map((option) => <button onClick={() => void sendText(option)} key={option}>{option}</button>)}</div>}</section>}
            </div>}
          </article>)}
          {thinking && <article className="coach coach-thinking" aria-live="polite"><small>Coach Comercial</small><p><i /><i /><i /> {[
            "Analisando sua duvida...", "Consultando contexto e historico...", "Preparando uma explicacao...",
          ][thinkingStage]}</p></article>}
        </div>
        <form className="coach-main-composer" onSubmit={submit}><textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} disabled={thinking} placeholder="Pergunte qualquer coisa sobre vendas..." aria-label="Mensagem para o Coach Comercial" /><div><button type="button" className={`coach-voice-button ${speech.status}`} onClick={speech.toggle} disabled={thinking || speech.status === "processing"}><Mic /> {speech.label}</button><button type="submit" disabled={!question.trim() || thinking}><Send /> Enviar</button></div>{(speech.error || speech.status === "recording" || speech.status === "processing") && <p className={`coach-voice-status ${speech.status}`}><i />{speech.error || speech.label}</p>}</form>
        <label className="coach-idea-select"><Lightbulb /><span>Exemplos de perguntas</span><select value={idea} onChange={(event) => chooseIdea(event.target.value)}><option value="">Escolha apenas se precisar de uma ideia</option>{IDEAS.map((item) => <option key={item}>{item}</option>)}</select></label>
      </main>
      <aside className={`coach-known-context ${editingContext ? "editing" : ""}`}><header><Sparkles /><div><small>CONTEXTO COMERCIAL</small><strong>O Coach usa estes dados</strong></div><button onClick={() => { setEditingContext((current) => !current); setContextDraft(commercialContext); }} aria-label={editingContext ? "Cancelar edicao" : "Editar contexto comercial"}>{editingContext ? <X /> : <Pencil />}</button></header>
        {editingContext ? <form className="coach-context-form" onSubmit={(event) => { event.preventDefault(); saveContext(); }}><label>O que voce vende?<input value={contextDraft.offer} onChange={(event) => updateDraft("offer", event.target.value)} placeholder="Digite seu produto ou servico" /></label><label>Para quem voce vende?<input value={contextDraft.audience} onChange={(event) => updateDraft("audience", event.target.value)} placeholder="Digite seu publico" /></label><label>Em qual etapa voce esta?<select value={customStage ? "Outro" : contextDraft.challenge} onChange={(event) => { const value = event.target.value; setCustomStage(value === "Outro"); if (value !== "Outro") updateDraft("challenge", value); }}><option value="">Selecione</option>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}<option>Outro</option></select></label>{customStage && <label>Etapa personalizada<input value={contextDraft.challenge} onChange={(event) => updateDraft("challenge", event.target.value)} placeholder="Descreva a etapa atual" /></label>}<label>Qual e seu objetivo?<input value={contextDraft.goal} onChange={(event) => updateDraft("goal", event.target.value)} placeholder="Ex.: aumentar conversao" /></label><button type="submit"><Save /> Salvar contexto</button></form> : <><dl><div><dt>Oferta</dt><dd>{commercialContext.offer || "Ainda nao informada"}</dd></div><div><dt>Publico</dt><dd>{commercialContext.audience || "Ainda nao informado"}</dd></div><div><dt>Etapa</dt><dd>{commercialContext.challenge || "Ainda nao informada"}</dd></div><div><dt>Objetivo</dt><dd>{commercialContext.goal || "Ainda nao informado"}</dd></div></dl><p><Check /> Informacoes conhecidas nao serao perguntadas novamente. Edite sempre que seu contexto mudar.</p></>}
      </aside>
    </div>
  </div>;
}
