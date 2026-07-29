"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Award, BarChart3, Bot, Brain, BriefcaseBusiness, CheckCircle2,
  ChevronRight, Flame, Gauge, Lightbulb, MessageSquareText, Mic, Play,
  RefreshCw, Send, ShieldAlert, Sparkles, Target, Trophy, UserRound, Zap,
} from "lucide-react";
import "./next-gen-coach.css";

type HubTab = "coach" | "battle" | "replay" | "twin" | "doctor" | "career";

const tabs: Array<{ id: HubTab; label: string; icon: typeof Bot }> = [
  { id: "coach", label: "AI Sales Coach", icon: Bot },
  { id: "battle", label: "Battle Mode", icon: Trophy },
  { id: "replay", label: "Sales Replay", icon: RefreshCw },
  { id: "twin", label: "Digital Twin", icon: Brain },
  { id: "doctor", label: "Deal Doctor", icon: BriefcaseBusiness },
  { id: "career", label: "Career Coach", icon: BarChart3 },
];

const missions = [
  ["Orcamento bloqueado", "Descubra valor sem oferecer desconto.", "450 XP", "Dificil"],
  ["Cliente do concorrente", "Crie contraste sem atacar a solucao atual.", "380 XP", "Avancado"],
  ["Fechamento em 10 minutos", "Conduza diagnostico e compromisso no tempo limite.", "600 XP", "Elite"],
  ["Cinco objecoes", "Acolha, investigue e confirme cada resistencia.", "520 XP", "Dificil"],
  ["Venda sem falar preco", "Construa valor durante a primeira metade da conversa.", "420 XP", "Avancado"],
];

const replayMoments = [
  { time: "01:18", tone: "good", said: "Antes de explicar, quero entender como voces fazem isso hoje.", better: "Boa escolha. Um profissional de elite manteria a pergunta e acrescentaria: onde esse processo mais prejudica o resultado?", principle: "Escuta ativa e aprofundamento progressivo." },
  { time: "04:42", tone: "warning", said: "Nossa plataforma tem dashboard, automacoes e varios relatorios.", better: "Pelo que voce descreveu, a automacao reduziria o retrabalho que hoje consome 12 horas da equipe. Isso resolveria a prioridade deste trimestre?", principle: "Valor contextual em vez de lista de funcionalidades." },
  { time: "08:06", tone: "bad", said: "Posso dar 10% de desconto se fecharmos hoje.", better: "O que precisa estar claro para o investimento fazer sentido sem alterar o escopo?", principle: "Protecao de margem e negociacao por interesse." },
];

export function NextGenCoach() {
  const [tab, setTab] = useState<HubTab>("coach");
  const [step, setStep] = useState<"setup" | "session" | "result">("setup");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Array<{ speaker: "coach" | "seller"; text: string }>>([]);
  const [seed, setSeed] = useState(1);
  const [meeting, setMeeting] = useState({ company: "", industry: "Tecnologia", product: "", goal: "Descoberta" });
  const [planReady, setPlanReady] = useState(false);
  const customer = useMemo(() => ({
    name: ["Roberto Almeida", "Camila Nunes", "Marcos Ferraz"][seed % 3],
    role: ["CEO", "Diretora Financeira", "Gerente de Operacoes"][seed % 3],
    company: ["Atlas Logistica", "Nexa Tecnologia", "Grupo Horizonte"][seed % 3],
    personality: ["Direto e impaciente", "Analitica e desconfiada", "Competitivo e exigente"][seed % 3],
  }), [seed]);

  const startSession = () => {
    setConversation([{ speaker: "coach", text: `Sou ${customer.name}, ${customer.role} da ${customer.company}. Tenho poucos minutos. Por que esta conversa merece minha atencao?` }]);
    setStep("session");
  };
  const sendMessage = () => {
    if (!message.trim()) return;
    setConversation((items) => [...items, { speaker: "seller", text: message.trim() }, { speaker: "coach", text: "Entendi, mas isso ainda parece generico. Qual impacto concreto voce acredita que existe no meu negocio?" }]);
    setMessage("");
  };

  return <div className="coach-hub">
    <header className="coach-hub-heading"><div><p>PERFORMA AI · COACHING ECOSYSTEM</p><h1>Seu treinador comercial inteligente.</h1><span>Pratique, receba feedback e evolua com um sistema que aprende com cada conversa.</span></div><div><strong>2.840 XP</strong><small>Nivel 12 · Closer Intermediario</small></div></header>
    <nav className="coach-tabs">{tabs.map((item) => { const Icon = item.icon; return <button className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)} key={item.id}><Icon /><span>{item.label}</span></button>; })}</nav>

    {tab === "coach" && <section className="coach-core">
      {step === "setup" && <><div className="coach-section-title"><div><p>CLIENTE INFINITO</p><h2>Configure o treino. A IA cria o resto.</h2></div><button onClick={() => setSeed((value) => value + 1)}><RefreshCw /> Gerar outro cliente</button></div><div className="customer-builder">
        <article className="generated-customer"><span><UserRound /></span><p>CLIENTE GERADO</p><h2>{customer.name}</h2><strong>{customer.role} · {customer.company}</strong><dl><div><dt>Personalidade</dt><dd>{customer.personality}</dd></div><div><dt>Experiencia</dt><dd>Comprador experiente</dd></div><div><dt>Orcamento</dt><dd>Restrito e nao confirmado</dd></div><div><dt>Objetivo oculto</dt><dd>Reduzir risco da decisao</dd></div></dl></article>
        <div className="coach-config"><label>Segmento<select><option>Tecnologia B2B</option><option>Servicos</option><option>Varejo</option><option>Industria</option><option>Saude</option></select></label><label>Porte da empresa<select><option>51 a 200 funcionarios</option><option>Pequena empresa</option><option>Enterprise</option></select></label><label>Cenario<select><option>Descoberta com decisor cetico</option><option>Negociacao de preco</option><option>Concorrente ja contratado</option><option>Fechamento sem urgencia</option></select></label><label>Dificuldade<select><option>Avancado</option><option>Intermediario</option><option>Elite</option></select></label><label className="wide">O que voce vende?<input placeholder="Ex.: plataforma de gestao comercial B2B" /></label><div className="coach-objections"><span>Objecoes ativas</span>{["Preco","Concorrente","Sem urgencia","Sem autoridade"].map((item)=><button key={item}>{item}</button>)}</div><button className="start-coaching" onClick={startSession}><Play /> Iniciar coaching <ArrowRight /></button></div>
      </div></>}
      {step === "session" && <div className="live-coaching"><aside><span><UserRound /></span><p>CLIENTE EM SIMULACAO</p><h2>{customer.name}</h2><strong>{customer.role} · {customer.company}</strong><div><i /><span>Conversa ativa</span><b>06:42</b></div><small>A personalidade e as objecoes mudam conforme suas respostas.</small></aside><main><div className="live-transcript">{conversation.map((item,index)=><article className={item.speaker} key={index}><small>{item.speaker === "coach" ? customer.name : "Voce"}</small><p>{item.text}</p></article>)}</div><div className="inline-coach"><Lightbulb /><span><strong>Coach silencioso</strong>Explore impacto antes de apresentar funcionalidades.</span></div><div className="coach-composer"><button aria-label="Falar por voz"><Mic /></button><input value={message} onChange={(event)=>setMessage(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&sendMessage()} placeholder="Responda por texto ou use o microfone" /><button onClick={sendMessage} aria-label="Enviar"><Send /></button></div><button className="finish-session" onClick={()=>setStep("result")}>Finalizar e receber coaching</button></main></div>}
      {step === "result" && <div className="coach-result"><header><div><p>COACHING CONCLUIDO</p><h2>Voce criou uma boa base, mas perdeu valor antes do fechamento.</h2></div><strong>78<small>/100</small></strong></header><div className="coach-score-grid">{[["Comunicacao",86],["Confianca",81],["Descoberta",74],["Rapport",84],["Objecoes",68],["Fechamento",65],["Escuta",79],["Estrutura",76],["Inteligencia emocional",83]].map(([label,score])=><article key={label as string}><span>{label}</span><strong>{score}</strong><div><i style={{width:`${score}%`}} /></div></article>)}</div><div className="coach-result-columns"><article><ShieldAlert /><h3>Maior erro</h3><p>Voce respondeu a objecao de preco antes de investigar o criterio usado pelo cliente.</p></article><article><Sparkles /><h3>Melhor resposta</h3><p>&ldquo;Quando voce diz caro, esta comparando com qual alternativa ou com o impacto esperado?&rdquo;</p></article><article><Target /><h3>Proxima acao</h3><p>Complete a aula de objecoes e repita esta missao sem oferecer desconto.</p></article></div><footer><button onClick={()=>setTab("replay")}>Abrir replay inteligente</button><button onClick={()=>setStep("setup")}><RefreshCw /> Treinar novamente</button></footer></div>}
    </section>}

    {tab === "battle" && <section><div className="coach-section-title"><div><p>AI BATTLE MODE</p><h2>Missoes que transformam tecnica em reflexo.</h2></div><span className="daily-streak"><Flame /> 7 dias de sequencia</span></div><div className="battle-grid">{missions.map((mission,index)=><article key={mission[0]}><header><span>MISSÃO {String(index+1).padStart(2,"0")}</span><b>{mission[3]}</b></header><Target /><h3>{mission[0]}</h3><p>{mission[1]}</p><footer><strong>{mission[2]}</strong><button onClick={()=>{setTab("coach");setStep("setup");}}>Aceitar desafio <ChevronRight /></button></footer></article>)}</div></section>}

    {tab === "replay" && <section><div className="coach-section-title"><div><p>AI SALES REPLAY</p><h2>O que voce disse vs. o que os melhores diriam.</h2></div><button><Play /> Reproduzir coaching</button></div><div className="heatmap"><div>{replayMoments.map((item)=><button className={item.tone} style={{width:"33.33%"}} key={item.time}><span>{item.time}</span></button>)}</div><small>Excelente</small><small>Neutro</small><small>Precisa melhorar</small></div><div className="replay-list">{replayMoments.map((item)=><article key={item.time}><span className={item.tone}>{item.time}</span><div><small>O QUE VOCE DISSE</small><blockquote>{item.said}</blockquote></div><div><small>RESPOSTA TOP 1%</small><blockquote>{item.better}</blockquote><p><Brain /> {item.principle}</p></div></article>)}</div></section>}

    {tab === "twin" && <section><div className="coach-section-title"><div><p>SEU DIGITAL SALES TWIN</p><h2>A IA encontrou padroes que uma nota isolada nao mostra.</h2></div><span className="twin-status"><i /> Atualizado com 18 sessoes</span></div><div className="twin-layout"><article className="twin-profile"><span><Brain /></span><h2>Enzo · Digital Twin v2.4</h2><p>Perfil consultivo, comunicacao direta e ritmo acelerado.</p><div>{[["Velocidade de fala","Alta"],["Perguntas abertas","Em evolucao"],["Escuta","Intermediaria"],["Estilo de fechamento","Direto"],["Confianca","Alta"]].map((item)=><span key={item[0]}><small>{item[0]}</small><strong>{item[1]}</strong></span>)}</div></article><div className="pattern-list">{[["Padrao critico","Voce interrompe quando o cliente demora a responder.","Aguarde dois segundos antes da proxima pergunta."],["Oportunidade","Seu desempenho sobe 18% quando quantifica impacto.","Use uma pergunta numerica em toda descoberta."],["Risco recorrente","Voce evita aprofundar preco quando encontra resistencia.","Investigue referencia, impacto e prioridade antes de negociar."],["Evolucao","Sua escuta ativa melhorou em quatro semanas.","Mantenha o resumo de entendimento antes do pitch."]].map((item,index)=><article key={item[0]}><span>{index+1}</span><div><small>{item[0]}</small><h3>{item[1]}</h3><p>{item[2]}</p></div></article>)}</div></div></section>}

    {tab === "doctor" && <section><div className="coach-section-title"><div><p>AI DEAL DOCTOR</p><h2>Entre em cada reuniao com uma estrategia.</h2></div></div><div className="doctor-layout"><form onSubmit={(event)=>{event.preventDefault();setPlanReady(true);}}><label>Empresa<input value={meeting.company} onChange={(event)=>setMeeting({...meeting,company:event.target.value})} placeholder="Nome do cliente" /></label><label>Segmento<select value={meeting.industry} onChange={(event)=>setMeeting({...meeting,industry:event.target.value})}><option>Tecnologia</option><option>Varejo</option><option>Servicos</option><option>Industria</option></select></label><label>Produto ou servico<input value={meeting.product} onChange={(event)=>setMeeting({...meeting,product:event.target.value})} placeholder="Sua oferta" /></label><label>Objetivo<select value={meeting.goal} onChange={(event)=>setMeeting({...meeting,goal:event.target.value})}><option>Descoberta</option><option>Demonstracao</option><option>Negociacao</option><option>Fechamento</option></select></label><button disabled={!meeting.company||!meeting.product}><Sparkles /> Preparar minha reuniao</button></form>{planReady ? <div className="meeting-plan"><header><CheckCircle2 /><div><small>PLANO GERADO</small><h2>{meeting.company} · {meeting.goal}</h2></div></header>{[["Estrategia","Conduza a conversa por impacto, prioridade e risco de nao agir."],["Perguntas de descoberta","Como esse problema afeta meta, custo ou velocidade hoje? Quem mais participa da decisao?"],["Objecoes provaveis","Prioridade concorrente, risco de implantacao e comparacao de preco."],["Fechamento recomendado","Confirme criterios e agende o proximo passo com participantes e data."],["Risco principal","Apresentar a solucao antes de confirmar urgencia e autoridade." ]].map((item)=><article key={item[0]}><strong>{item[0]}</strong><p>{item[1]}</p></article>)}</div> : <div className="doctor-empty"><BriefcaseBusiness /><h2>Seu plano aparecera aqui.</h2><p>A IA combina empresa, segmento, oferta e objetivo para preparar perguntas, riscos, pitch e fechamento.</p></div>}</div></section>}

    {tab === "career" && <section><div className="coach-section-title"><div><p>AI CAREER COACH</p><h2>Sua evolucao profissional, medida ao longo do tempo.</h2></div><button><Award /> Revisao mensal</button></div><div className="career-hero"><div><small>NIVEL PROFISSIONAL ESTIMADO</small><h2>Closer Intermediario</h2><p>Voce esta a 320 XP e duas competencias do nivel Closer Avancado.</p><div><i style={{width:"72%"}} /></div></div><Gauge /></div><div className="career-grid">{[["Comunicacao","+14%","88"],["Descoberta","+21%","81"],["Confianca","+9%","86"],["Objecoes","+6%","72"],["Fechamento","+11%","77"]].map((item)=><article key={item[0]}><span>{item[0]}</span><strong>{item[2]}</strong><small>{item[1]} em 30 dias</small></article>)}</div><div className="weekly-plan"><header><div><p>PLANO PERSONALIZADO · ESTA SEMANA</p><h2>Proteja valor durante objecoes.</h2></div><strong>3 de 7 atividades</strong></header>{["Aula: diagnostico da objecao real","Battle: venda sem desconto","Replay: revisar momento 08:06","Playbook: matriz de objecoes","Simulacao com CFO","Quiz de negociacao","Call real para validacao"].map((item,index)=><button className={index<3?"done":""} key={item}>{index<3?<CheckCircle2 />:<span>{index+1}</span>}<strong>{item}</strong><ChevronRight /></button>)}</div></section>}
  </div>;
}
