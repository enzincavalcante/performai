"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, Check, CheckCircle2, Goal, GripVertical,
  Lightbulb, Megaphone, Rocket, Settings2, Sparkles, Target, TrendingUp, UserRound, Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildCommercialDiagnosis, DIAGNOSIS_AREAS, DIAGNOSIS_OBJECTIVES, DIAGNOSIS_PROBLEMS,
  EMPTY_DIAGNOSIS_ANSWERS, type CommercialDiagnosis, type CommercialDiagnosisAnswers,
} from "@/lib/commercial-diagnosis";
import "./initial-diagnosis.css";

type InitialProfile = { segment: string; offer: string; audience: string; teamSize: string; challenge: string; goal: string };

const AREA_ICONS = [TrendingUp, BriefcaseBusiness, Rocket, Target, BarChart3, Settings2, Goal, UserRound, Users, Megaphone];
const ROLES = ["Empresario", "CEO", "Diretor", "Gestor comercial", "Gerente", "SDR", "BDR", "Closer", "Vendedor", "Outro"];
const TEAM_SIZES = ["Apenas eu", "2-10 pessoas", "11-50 pessoas", "51-100 pessoas", "Mais de 100 pessoas"];
const SEGMENTS = ["SaaS / Tecnologia", "Servicos B2B", "E-commerce", "Educacao", "Financeiro", "Varejo", "Saude", "Industria", "Marketing / Agencia", "Outro"];

function toggle(items: string[], value: string) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function InitialDiagnosis({
  profile,
  existing,
  onComplete,
}: {
  profile: InitialProfile;
  existing?: CommercialDiagnosis | null;
  onComplete: (diagnosis: CommercialDiagnosis, profile: InitialProfile) => void;
}) {
  const initial = useMemo<CommercialDiagnosisAnswers>(() => existing ? {
    areas: existing.areas, otherArea: existing.otherArea, problems: existing.problems, otherProblem: existing.otherProblem,
    priorities: existing.priorities, objective: existing.objective, otherObjective: existing.otherObjective, role: existing.role,
    teamSize: existing.teamSize, segment: existing.segment, commercialScore: existing.commercialScore,
    mainDifficulty: existing.mainDifficulty, offer: existing.offer, audience: existing.audience,
  } : { ...EMPTY_DIAGNOSIS_ANSWERS, teamSize: profile.teamSize, segment: profile.segment, offer: profile.offer, audience: profile.audience }, [existing, profile]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initial);
  const [result, setResult] = useState<CommercialDiagnosis | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const totalSteps = 7;
  useEffect(() => shellRef.current?.scrollTo({ top: 0, behavior: "smooth" }), [step]);
  const update = <K extends keyof CommercialDiagnosisAnswers>(key: K, value: CommercialDiagnosisAnswers[K]) => setAnswers((current) => ({ ...current, [key]: value }));
  const selectedProblems = answers.problems.map((item) => item === "Outro" ? answers.otherProblem : item).filter(Boolean);
  const canContinue = step === 0
    || (step === 1 && answers.areas.length > 0 && (!answers.areas.includes("Outro") || answers.otherArea.trim().length >= 3))
    || (step === 2 && answers.problems.length >= 1 && (!answers.problems.includes("Outro") || answers.otherProblem.trim().length >= 3))
    || (step === 3 && answers.priorities.length === Math.min(3, selectedProblems.length))
    || (step === 4 && Boolean(answers.objective) && (answers.objective !== "Outro objetivo" || answers.otherObjective.trim().length >= 3))
    || (step === 5 && Boolean(answers.role && answers.teamSize && answers.segment && answers.offer.trim() && answers.audience.trim()))
    || step === 6;

  const selectPriority = (problem: string) => {
    const current = answers.priorities;
    update("priorities", current.includes(problem) ? current.filter((item) => item !== problem) : current.length < 3 ? [...current, problem] : current);
  };
  const reorder = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= answers.priorities.length) return;
    const next = [...answers.priorities];
    [next[index], next[target]] = [next[target], next[index]];
    update("priorities", next);
  };
  const finish = () => {
    const diagnosis = buildCommercialDiagnosis(answers, existing?.createdAt);
    setResult(diagnosis);
    setStep(6);
  };
  const save = () => {
    if (!result) return;
    onComplete(result, {
      ...profile,
      segment: result.segment,
      offer: result.offer,
      audience: result.audience,
      teamSize: result.teamSize,
      challenge: result.primaryBottleneck,
      goal: result.objective,
    });
  };

  return <div ref={shellRef} className="diagnosis-shell" role="dialog" aria-modal="true" aria-label="Diagnostico comercial inicial">
    <aside className="diagnosis-brand-panel">
      <div><span className="diagnosis-brand-mark"><Sparkles /></span><strong>Performa <b>AI</b></strong></div>
      <section><small>DIAGNOSTICO COMERCIAL</small><h2>A plataforma precisa entender antes de recomendar.</h2><p>Suas respostas personalizam treinamentos, Coach, simulacoes, estrategias e prioridades da Home.</p></section>
      <footer><CheckCircle2 /><span><strong>Leva poucos minutos</strong><small>Voce pode revisar depois.</small></span></footer>
    </aside>
    <main className="diagnosis-main">
      <header className="diagnosis-progress"><div><span>{step === 6 ? "Diagnostico concluido" : `Etapa ${step + 1} de ${totalSteps}`}</span><strong>{Math.round(((step + 1) / totalSteps) * 100)}%</strong></div><i><b style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></i></header>
      <AnimatePresence mode="wait">
        <motion.section className="diagnosis-stage" key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .28 }}>
          {step === 0 && <div className="diagnosis-intro"><span><Target /></span><small>ANTES DE COMECAR</small><h1>Vamos entender onde voce mais precisa evoluir.</h1><p>Responda algumas perguntas rapidas. A plataforma vai usar suas respostas para personalizar seu treinamento, estrategias, desafios e recomendacoes.</p><div><article><Sparkles /><strong>Diagnostico personalizado</strong><p>Nao entregamos a mesma jornada para todo mundo.</p></article><article><TrendingUp /><strong>Prioridade clara</strong><p>Voce entra sabendo o que corrigir primeiro.</p></article></div></div>}

          {step === 1 && <div><small>MAPA DE NECESSIDADES</small><h1>Quais areas mais precisam melhorar hoje?</h1><p className="diagnosis-help">Selecione todas que fizerem sentido.</p><div className="diagnosis-option-grid areas">{DIAGNOSIS_AREAS.map((item, index) => { const Icon = AREA_ICONS[index % AREA_ICONS.length]; const selected = answers.areas.includes(item); return <button className={selected ? "selected" : ""} onClick={() => update("areas", toggle(answers.areas, item))} key={item}><Icon /><span>{item}</span>{selected && <Check />}</button>; })}</div>{answers.areas.includes("Outro") && <label className="diagnosis-open-field">Qual outra area?<input autoFocus value={answers.otherArea} onChange={(event) => update("otherArea", event.target.value)} placeholder="Escreva em poucas palavras" /></label>}</div>}

          {step === 2 && <div><small>GARGALOS ATUAIS</small><h1>Quais problemas mais atrapalham seus resultados?</h1><p className="diagnosis-help">Marque os problemas observados. Na proxima etapa voce vai definir os tres mais urgentes.</p><div className="diagnosis-problem-grid">{DIAGNOSIS_PROBLEMS.map((item) => { const selected = answers.problems.includes(item); return <button className={selected ? "selected" : ""} onClick={() => update("problems", toggle(answers.problems, item))} key={item}><span>{item}</span><i>{selected ? <Check /> : <span />}</i></button>; })}</div>{answers.problems.includes("Outro") && <label className="diagnosis-open-field">Descreva o outro problema<input autoFocus value={answers.otherProblem} onChange={(event) => update("otherProblem", event.target.value)} placeholder="Ex.: perdemos vendas depois da proposta" /></label>}</div>}

          {step === 3 && <div><small>ORDEM DE ATAQUE</small><h1>Quais sao os 3 problemas mais urgentes?</h1><p className="diagnosis-help">Escolha tres. Depois use as setas para colocar o maior problema em primeiro.</p><div className="diagnosis-priority-layout"><div className="diagnosis-priority-source">{selectedProblems.map((problem) => <button className={answers.priorities.includes(problem) ? "selected" : ""} onClick={() => selectPriority(problem)} key={problem}><span>{problem}</span>{answers.priorities.includes(problem) ? <Check /> : <ArrowRight />}</button>)}</div><ol>{[0, 1, 2].map((index) => <li className={answers.priorities[index] ? "filled" : ""} key={index}><b>{index + 1}o</b>{answers.priorities[index] ? <><GripVertical /><span>{answers.priorities[index]}</span><div><button aria-label="Subir prioridade" disabled={index === 0} onClick={() => reorder(index, -1)}>↑</button><button aria-label="Descer prioridade" disabled={index === 2 || index === answers.priorities.length - 1} onClick={() => reorder(index, 1)}>↓</button></div></> : <span>Selecione uma prioridade</span>}</li>)}</ol></div></div>}

          {step === 4 && <div><small>OBJETIVO PRINCIPAL</small><h1>O que voce mais quer conquistar agora?</h1><p className="diagnosis-help">Escolha o resultado que deve orientar as proximas recomendacoes.</p><div className="diagnosis-objectives">{DIAGNOSIS_OBJECTIVES.map((item) => <button className={answers.objective === item ? "selected" : ""} onClick={() => update("objective", item)} key={item}><Goal /><span>{item}</span>{answers.objective === item && <Check />}</button>)}</div>{answers.objective === "Outro objetivo" && <label className="diagnosis-open-field">Qual objetivo?<input autoFocus value={answers.otherObjective} onChange={(event) => update("otherObjective", event.target.value)} placeholder="Escreva seu objetivo" /></label>}</div>}

          {step === 5 && <div><small>CONTEXTO DA OPERACAO</small><h1>Agora, vamos adaptar o plano a sua realidade.</h1><p className="diagnosis-help">Respostas curtas sao suficientes.</p><div className="diagnosis-form-grid"><label>Seu cargo<select value={answers.role} onChange={(event) => update("role", event.target.value)}><option value="">Selecionar cargo</option>{ROLES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Tamanho do time<select value={answers.teamSize} onChange={(event) => update("teamSize", event.target.value)}>{TEAM_SIZES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Segmento<select value={answers.segment} onChange={(event) => update("segment", event.target.value)}>{SEGMENTS.map((item) => <option key={item}>{item}</option>)}</select></label><label>O que voce vende?<input value={answers.offer} onChange={(event) => update("offer", event.target.value)} placeholder="Ex.: software de gestao" /></label><label className="wide">Para quem voce vende?<input value={answers.audience} onChange={(event) => update("audience", event.target.value)} placeholder="Ex.: gestores de clinicas" /></label><label className="wide score">Como voce avalia seu comercial hoje?<div><input type="range" min="0" max="10" value={answers.commercialScore} onChange={(event) => update("commercialScore", Number(event.target.value))} /><strong>{answers.commercialScore}<small>/10</small></strong></div></label><label className="wide">Qual e a maior dificuldade, com suas palavras?<textarea value={answers.mainDifficulty} maxLength={380} onChange={(event) => update("mainDifficulty", event.target.value)} placeholder="Ex.: conseguimos reunioes, mas o cliente some depois da proposta." /><span>{answers.mainDifficulty.length}/380</span></label></div></div>}

          {step === 6 && result && <div className="diagnosis-result"><header><span><CheckCircle2 /></span><small>DIAGNOSTICO PERSONALIZADO</small><h1>Seu diagnostico esta pronto.</h1><p>A Performa AI organizou o problema declarado em uma ordem de execucao. As conclusoes abaixo sao hipoteses iniciais e devem ser validadas com treinos, calls e dados do funil.</p></header><section className="diagnosis-result-hero"><div><small>PRINCIPAL GARGALO IDENTIFICADO</small><h2>{result.primaryBottleneck}</h2><p>{result.impact}</p></div><strong>{result.commercialScore}<span>/10</span><small>avaliacao atual</small></strong></section><div className="diagnosis-result-grid"><article><small>TESE INICIAL</small><h3>Diagnosticar antes de escalar</h3><p>{result.thesis}</p></article><article><small>OBJETIVO DECLARADO</small><h3>{result.objective}</h3><p>O plano prioriza comportamentos e processos ligados a este objetivo, sem prometer resultado financeiro.</p></article></div><section className="diagnosis-ranked"><header><div><small>SUAS PRIORIDADES</small><h2>Ordem recomendada de trabalho</h2></div></header>{result.priorities.map((item, index) => <article key={item}><b>{index + 1}</b><span><strong>{item}</strong><small>{index === 0 ? "Resolver primeiro e medir semanalmente" : "Trabalhar depois que a prioridade anterior estiver em execucao"}</small></span></article>)}</section><section className="diagnosis-plan"><header><small>SEU PLANO INICIAL</small><h2>Da dificuldade para a pratica.</h2></header>{result.plan.map((item, index) => <article key={`${item.moduleId}-${index}`}><span>{index + 1}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</section><section className="diagnosis-next"><div><Lightbulb /><span><small>PRIMEIRA RECOMENDACAO</small><strong>{result.recommendedTraining.title}</strong><p>Aula: {result.recommendedTraining.lesson}</p></span></div><p>{result.coachRecommendation}</p></section></div>}
        </motion.section>
      </AnimatePresence>
      <footer className="diagnosis-footer">
        {step > 0 && step < 6 ? <button onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Voltar</button> : <span />}
        {step < 5 && <button className="primary" disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>Continuar <ArrowRight /></button>}
        {step === 5 && <button className="primary" disabled={!canContinue} onClick={finish}><Sparkles /> Analisar minhas respostas</button>}
        {step === 6 && <button className="primary" onClick={save}>{existing ? "Salvar novo diagnostico" : "Entrar na minha plataforma"} <ArrowRight /></button>}
      </footer>
    </main>
  </div>;
}
