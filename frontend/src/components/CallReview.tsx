"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle, Clock3, FileAudio,
  FileText, Lightbulb, Printer, RotateCcw, Sparkles, Target, UploadCloud,
} from "lucide-react";
import "./call-review.css";
import "./call-review-premium.css";

const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,.mp4,.webm,.ogg,.aac";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const VERCEL_DIRECT_LIMIT = 3.8 * 1024 * 1024;

type ReviewReport = {
  score?: number;
  summary?: string;
  diagnosis?: {
    executiveSummary?: string;
    callObjective?: string;
    conversationContext?: string;
    sellerConduction?: string;
    overallDiagnosis?: string;
    professionalConclusion?: string;
  };
  competencies: Array<{ name: string; score?: number; feedback?: string; impact?: string; level?: string; gap?: string; nextStep?: string }>;
  excerpts: Array<{ timestamp?: string; text: string; insight?: string; type?: string }>;
  strengths: Array<{ title: string; evidence?: string; why?: string; repeat?: string }>;
  improvements: Array<{ title: string; error?: string; impact?: string; fix?: string; prevention?: string; example?: string }>;
  actions: Array<{ priority: string; objective?: string; action?: string; exercise?: string; target?: string; expected?: string }>;
  evaluationBlocks: Array<{ name: string; score?: number; reason?: string; worked?: string; improve?: string; how?: string; example?: string; excerpt?: string }>;
  crmReport?: {
    callData?: Record<string, string>;
    temperature?: { classification?: string; justification?: string };
    conversationSummary?: string;
    pains?: string[];
    objections?: Array<{ objection?: string; handling?: string }>;
    qualification?: Record<string, string>;
    nextSteps?: Array<{ action?: string; owner?: string; deadline?: string }>;
    sellerObservations?: string;
    quickEvaluation?: { score?: number; verdict?: string };
  };
};

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) if (typeof source[key] === "string") return source[key] as string;
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => typeof item === "string" ? [item] : []);
}

function structuredStrengths(value: unknown): ReviewReport["strengths"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [{ title: item }];
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = firstString(row, ["title", "name", "strength"]);
    return title ? [{
      title,
      evidence: firstString(row, ["evidence", "what_happened"]),
      why: firstString(row, ["why_it_worked", "why"]),
      repeat: firstString(row, ["how_to_repeat", "repeat"]),
    }] : [];
  });
}

function structuredImprovements(value: unknown): ReviewReport["improvements"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [{ title: item }];
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = firstString(row, ["title", "name", "improvement"]);
    return title ? [{
      title,
      error: firstString(row, ["error", "what_happened"]),
      impact: firstString(row, ["impact"]),
      fix: firstString(row, ["how_to_fix", "fix"]),
      prevention: firstString(row, ["prevention", "how_to_avoid"]),
      example: firstString(row, ["practical_example", "example"]),
    }] : [];
  });
}

function structuredActions(value: unknown): ReviewReport["actions"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap<ReviewReport["actions"][number]>((item, index) => {
    if (typeof item === "string") return [{ priority: `Prioridade ${index + 1}`, action: item }];
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return [{
      priority: firstString(row, ["priority"]) ?? `Prioridade ${index + 1}`,
      objective: firstString(row, ["objective"]),
      action: firstString(row, ["practical_action", "action"]),
      exercise: firstString(row, ["exercise"]),
      target: firstString(row, ["target", "goal"]),
      expected: firstString(row, ["expected_result", "result"]),
    }];
  });
}

function normalizeReport(payload: unknown): ReviewReport {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const source = (root.report && typeof root.report === "object" ? root.report : root) as Record<string, unknown>;
  const rawCompetencies = source.competency_scores ?? source.competencies ?? source.skills ?? source.dimensions;
  const competencies = Array.isArray(rawCompetencies)
    ? rawCompetencies.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const name = firstString(row, ["name", "skill", "dimension", "label"]);
        if (!name) return [];
        return [{
          name,
          score: typeof row.score === "number" ? row.score : undefined,
          feedback: firstString(row, ["explanation", "feedback", "comment", "analysis"]),
          impact: firstString(row, ["impact"]),
          level: firstString(row, ["level"]),
          gap: firstString(row, ["gap", "what_is_missing"]),
          nextStep: firstString(row, ["next_step", "recommendation"]),
        }];
      })
    : rawCompetencies && typeof rawCompetencies === "object"
      ? Object.entries(rawCompetencies as Record<string, unknown>).map(([name, value]) => ({
          name,
          score: typeof value === "number" ? value : undefined,
          feedback: typeof value === "string" ? value : undefined,
        }))
      : [];
  const rawExcerpts = source.critical_moments ?? source.excerpts ?? source.highlights ?? source.key_moments;
  const excerpts = Array.isArray(rawExcerpts)
    ? rawExcerpts.flatMap((item) => {
        if (typeof item === "string") return [{ text: item }];
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const text = firstString(row, ["text", "quote", "transcript"]);
        return text ? [{ text, timestamp: firstString(row, ["timestamp", "time"]), insight: firstString(row, ["recommendation", "issue", "insight", "feedback", "comment"]), type: firstString(row, ["type"]) }] : [];
      })
    : [];
  const numericScore = typeof source.score === "number" ? source.score : typeof source.overall_score === "number" ? source.overall_score : undefined;
  const rawBlocks = source.evaluation_blocks;
  const evaluationBlocks = Array.isArray(rawBlocks) ? rawBlocks.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const name = firstString(row, ["name", "block", "criterion"]);
    if (!name) return [];
    return [{
      name,
      score: typeof row.score === "number" ? row.score : undefined,
      reason: firstString(row, ["reason", "explanation"]),
      worked: firstString(row, ["what_worked", "worked"]),
      improve: firstString(row, ["what_to_improve", "improve"]),
      how: firstString(row, ["how_to_improve", "how"]),
      example: firstString(row, ["practical_example", "example"]),
      excerpt: firstString(row, ["excerpt", "quote"]),
    }];
  }) : [];
  const crmReport = source.crm_report && typeof source.crm_report === "object" ? source.crm_report as ReviewReport["crmReport"] : undefined;
  const rawDiagnosis = source.diagnosis && typeof source.diagnosis === "object" ? source.diagnosis as Record<string, unknown> : {};
  return {
    score: numericScore,
    summary: firstString(source, ["summary", "executive_summary", "feedback"]),
    diagnosis: {
      executiveSummary: firstString(rawDiagnosis, ["executive_summary"]),
      callObjective: firstString(rawDiagnosis, ["call_objective"]),
      conversationContext: firstString(rawDiagnosis, ["conversation_context"]),
      sellerConduction: firstString(rawDiagnosis, ["seller_conduction"]),
      overallDiagnosis: firstString(rawDiagnosis, ["overall_diagnosis"]),
      professionalConclusion: firstString(rawDiagnosis, ["professional_conclusion"]),
    },
    competencies,
    excerpts,
    strengths: structuredStrengths(source.strengths ?? source.positive_points),
    improvements: structuredImprovements(source.improvements ?? source.areas_for_improvement),
    actions: structuredActions(source.actions ?? source.next_actions ?? source.action_plan),
    evaluationBlocks,
    crmReport,
  };
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function durationLabel(seconds: number | null) {
  if (seconds === null) return "Calculando...";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return new Blob([buffer], { type: "audio/wav" });
}

async function transcribeLargeFile(file: File) {
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    const targetRate = 16_000;
    const outputLength = Math.ceil(decoded.duration * targetRate);
    const mono = new Float32Array(outputLength);
    for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
      const input = decoded.getChannelData(channel);
      for (let index = 0; index < outputLength; index += 1) {
        mono[index] += input[Math.min(input.length - 1, Math.floor(index * decoded.sampleRate / targetRate))] / decoded.numberOfChannels;
      }
    }

    const chunkSamples = targetRate * 75;
    const transcripts: string[] = [];
    for (let start = 0, part = 1; start < mono.length; start += chunkSamples, part += 1) {
      const wav = encodeWav(mono.slice(start, Math.min(start + chunkSamples, mono.length)), targetRate);
      const body = new FormData();
      body.append("audio", wav, `parte-${part}.wav`);
      body.append("metadata", JSON.stringify({ transcribe_only: true, part }));
      const response = await fetch("/api/v1/analytics/call-review", { method: "POST", body, signal: AbortSignal.timeout(120_000) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.transcript) throw new Error(payload?.detail ?? `Falha ao transcrever a parte ${part}.`);
      transcripts.push(String(payload.transcript));
    }
    return transcripts.join("\n");
  } finally {
    await context.close();
  }
}

export function CallReview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "report" | "error">("idle");
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [sellerRole, setSellerRole] = useState("closer");
  const [callType, setCallType] = useState("closing");
  const [documentMode, setDocumentMode] = useState(false);

  const selectFile = (next: File | undefined) => {
    if (!next) return;
    const extension = next.name.split(".").pop()?.toLowerCase();
    if (!extension || !["mp3", "wav", "m4a", "mp4", "webm", "ogg", "aac"].includes(extension)) {
      setError("Formato nao suportado. Envie MP3, WAV, M4A, MP4, WEBM, OGG ou AAC.");
      setStatus("error");
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setError("O arquivo excede 100 MB. Exporte apenas o audio da chamada e tente novamente.");
      setStatus("error");
      return;
    }
    setFile(next);
    setError("");
    setReport(null);
    setStatus("idle");
    setDocumentMode(false);
    setDuration(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(next);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : null);
    };
    audio.onerror = () => {
      setDuration(null);
    };
  };

  const analyze = async (selectedFile = file) => {
    if (!selectedFile) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const endpoint = `${baseUrl}/api/v1/analytics/call-review`;
    setError("");
    setStatus("uploading");
    const processingTimer = window.setTimeout(() => setStatus("processing"), 500);
    try {
      const body = new FormData();
      if (selectedFile.size > VERCEL_DIRECT_LIMIT && !baseUrl) {
        const transcript = await transcribeLargeFile(selectedFile);
        if (!transcript) throw new Error("Nao foi possivel identificar falas nesta gravacao.");
        body.append("transcript", transcript);
      } else {
        body.append("audio", selectedFile);
      }
      body.append("metadata", JSON.stringify({
        source: "seller_upload",
        filename: selectedFile.name,
        seller_role: sellerRole,
        call_type: callType,
      }));
      const response = await fetch(endpoint, { method: "POST", body, signal: AbortSignal.timeout(120_000) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : `HTTP ${response.status}`;
        throw new Error(detail);
      }
      const normalized = normalizeReport(payload);
      if (!normalized.summary && normalized.competencies.length === 0 && normalized.excerpts.length === 0) {
        throw new Error("O backend respondeu, mas nao retornou um relatorio reconhecivel.");
      }
      setReport(normalized);
      setStatus("report");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel analisar a ligacao.");
      setStatus("error");
    } finally {
      window.clearTimeout(processingTimer);
    }
  };

  useEffect(() => {
    if (!file || status !== "idle") return;
    const timer = window.setTimeout(() => void analyze(file), 450);
    return () => window.clearTimeout(timer);
    // The analysis starts once for each newly selected recording.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const seekTo = (timestamp?: string) => {
    if (!audioRef.current || !timestamp) return;
    const parts = timestamp.split(":").map(Number);
    if (parts.some(Number.isNaN)) return;
    const seconds = parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + (parts[1] ?? 0);
    audioRef.current.currentTime = Math.max(0, seconds);
    void audioRef.current.play();
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl("");
    setDuration(null);
    setReport(null);
    setError("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  if (status === "report" && report && documentMode) {
    const crm = report.crmReport ?? {};
    const callData = crm.callData ?? {};
    return <div className="call-review-page crm-report-page">
      <header className="review-heading no-print"><div><p className="eyebrow">DOCUMENTO GERENCIAL</p><h1>Relatorio profissional da call</h1><p>Documento objetivo para CRM, acompanhamento e tomada de decisao.</p></div><div className="review-document-actions"><button className="secondary-button" onClick={() => setDocumentMode(false)}>Voltar para avaliacao</button><button className="primary-button compact" onClick={() => window.print()}><Printer size={17} /> Salvar em PDF</button></div></header>
      <article className="crm-document">
        <header><div><strong>Performa <b>AI</b></strong><span>INTELIGENCIA COMERCIAL</span></div><div><small>RELATORIO DE CALL DE VENDA</small><b>{file?.name}</b></div></header>
        <section className="crm-call-data"><h2>1. Dados da call</h2><div>{Object.entries(callData).length ? Object.entries(callData).map(([key,value])=><span key={key}><small>{key.replaceAll("_"," ")}</small><strong>{value || "Informacao nao mencionada durante a ligacao."}</strong></span>) : <span><small>Dados</small><strong>Informacoes nao mencionadas durante a ligacao.</strong></span>}</div></section>
        <section className="crm-temperature"><div><small>2. TEMPERATURA DO LEAD</small><strong>{crm.temperature?.classification ?? "NAO IDENTIFICADA"}</strong></div><p>{crm.temperature?.justification ?? "Nao houve sinais suficientes na transcricao para classificar o lead."}</p></section>
        <section><h2>3. Resumo da conversa</h2><p>{crm.conversationSummary ?? report.summary ?? "A conversa nao trouxe informacoes suficientes para um resumo seguro."}</p></section>
        <section><h2>4. Dor / necessidade identificada</h2><ul>{crm.pains?.length ? crm.pains.map((item)=><li key={item}>{item}</li>) : <li>Nenhuma dor foi mencionada explicitamente durante a ligacao.</li>}</ul></section>
        <section><h2>5. Objecoes levantadas</h2><div className="crm-table"><div><b>Objecao</b><b>Como foi tratada</b></div>{crm.objections?.length ? crm.objections.map((item,index)=><div key={index}><span>{item.objection ?? "Nao identificado"}</span><span>{item.handling ?? "Nao identificado"}</span></div>) : <div><span>Nenhuma objecao relevante levantada</span><span>-</span></div>}</div></section>
        <section><h2>6. Qualificacao (BANT / GPCT)</h2><div className="crm-qualification">{Object.entries(crm.qualification ?? {}).map(([key,value])=><p key={key}><b>{key.replaceAll("_"," ")}:</b> {value}</p>)}{!Object.keys(crm.qualification ?? {}).length && <p>Nao identificado.</p>}</div></section>
        <section><h2>7. Proximos passos</h2><div className="crm-table three"><div><b>Acao</b><b>Responsavel</b><b>Prazo</b></div>{crm.nextSteps?.length ? crm.nextSteps.map((item,index)=><div key={index}><span>{item.action ?? "Nao identificado"}</span><span>{item.owner ?? "Nao identificado"}</span><span>{item.deadline ?? "Nao identificado"}</span></div>) : <div><span>Nenhum passo confirmado</span><span>-</span><span>-</span></div>}</div></section>
        <section><h2>8. Observacoes para o gestor</h2><p>{crm.sellerObservations ?? "A ligacao nao trouxe evidencias suficientes para observacoes adicionais."}</p></section>
        <section className="crm-final-score"><div><small>9. AVALIACAO RAPIDA</small><strong>{crm.quickEvaluation?.score ?? (report.score !== undefined ? (report.score / 10).toFixed(1) : "--")}<span>/10</span></strong></div><p>{crm.quickEvaluation?.verdict ?? report.summary}</p></section>
        <footer>Documento gerado pela Performa AI exclusivamente a partir da transcricao da call.</footer>
      </article>
    </div>;
  }

  if (status === "report" && report) return <div className="call-review-page">
    <header className="review-heading">
      <div><p className="eyebrow">AVALIACAO CONCLUIDA</p><h1>Avaliacao detalhada da call</h1><p>{file?.name}</p></div>
      <button className="secondary-button" onClick={reset}><RotateCcw size={17} /> Analisar outra</button>
    </header>
    {audioUrl && <section className="review-audio-player">
      <div><FileAudio /><span><strong>Gravacao analisada</strong><small>Use os controles ou clique em um momento-chave para navegar pela ligacao.</small></span></div>
      <audio ref={audioRef} controls preload="metadata" src={audioUrl}>Seu navegador nao suporta reproducao de audio.</audio>
    </section>}
    <section className="review-overview">
      {report.score !== undefined && <div className="review-score"><span>Nota geral</span><strong>{report.score}<small>/100</small></strong></div>}
      <div className="review-summary"><p className="eyebrow">RESUMO EXECUTIVO</p><h2>Leitura da conversa</h2><p>{report.summary ?? "Resumo nao fornecido pelo analisador."}</p></div>
    </section>
    {report.diagnosis && <section className="review-section review-diagnosis"><div className="review-section-title"><Sparkles /><div><p className="eyebrow">DIAGNOSTICO PROFISSIONAL</p><h2>Leitura gerencial da ligacao</h2></div></div><div className="review-diagnosis-grid">{[
      ["Objetivo da ligacao", report.diagnosis.callObjective],
      ["Contexto da conversa", report.diagnosis.conversationContext],
      ["Conducao do vendedor", report.diagnosis.sellerConduction],
      ["Diagnostico geral", report.diagnosis.overallDiagnosis],
      ["Conclusao profissional", report.diagnosis.professionalConclusion],
    ].filter((item) => item[1]).map(([title,text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>}
    {report.evaluationBlocks.length > 0 && <section className="review-section evaluation-blocks"><div className="review-section-title"><Target /><div><p className="eyebrow">AVALIACAO COMPLETA</p><h2>Analise criteriosa em {report.evaluationBlocks.length} criterios</h2></div></div><div>{report.evaluationBlocks.map((block,index)=><article key={block.name}><header><span>{String(index+1).padStart(2,"0")}</span><h3>{block.name}</h3><strong>{block.score ?? "--"}<small>/100</small></strong></header><div>{block.reason && <p className="evaluation-reason"><b>Motivo da nota</b>{block.reason}</p>}<p><b>O que funcionou</b>{block.worked ?? "A IA nao encontrou evidencia segura deste comportamento."}</p><p><b>O que precisa melhorar</b>{block.improve ?? "A IA nao encontrou evidencia segura deste comportamento."}</p>{block.how && <p><b>Como melhorar</b>{block.how}</p>}{block.example && <p><b>Exemplo pratico</b>{block.example}</p>}{block.excerpt && <blockquote>&ldquo;{block.excerpt}&rdquo;</blockquote>}</div></article>)}</div></section>}
    {report.competencies.length > 0 && <section className="review-section"><div className="review-section-title"><Target /><div><p className="eyebrow">COMPETENCIAS</p><h2>Desempenho por habilidade</h2></div></div><div className="review-skills">{report.competencies.map((item) => <article key={item.name}><header><strong>{item.name.replaceAll("_", " ")}</strong>{item.score !== undefined && <span>{item.score}/100</span>}</header>{item.score !== undefined && <div><i style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} /></div>}{item.level && <em>{item.level}</em>}{item.feedback && <p>{item.feedback}</p>}{item.impact && <p><b>Impacto:</b> {item.impact}</p>}{item.gap && <p><b>Para evoluir:</b> {item.gap}</p>}{item.nextStep && <p><b>Proximo passo:</b> {item.nextStep}</p>}</article>)}</div></section>}
    {report.excerpts.length > 0 && <section className="review-section"><div className="review-section-title"><Clock3 /><div><p className="eyebrow">MOMENTOS-CHAVE</p><h2>Navegue pelos trechos da ligacao</h2></div></div><div className="review-excerpts">{report.excerpts.map((item, index) => <article className={item.type ? `moment-${item.type}` : ""} key={`${item.timestamp}-${index}`}><button onClick={() => seekTo(item.timestamp)} disabled={!item.timestamp || !audioUrl}>{item.timestamp ?? "--:--"}</button><div><blockquote>{item.text}</blockquote>{item.insight && <p>{item.insight}</p>}</div></article>)}</div></section>}
    <div className="review-columns">
      <section className="review-list strengths"><CheckCircle /><div><p className="eyebrow">PONTOS FORTES</p><h2>O que transformar em padrao</h2><div className="review-rich-list">{report.strengths.length ? report.strengths.map((item) => <article key={item.title}><h3>{item.title}</h3>{item.evidence && <p><b>Evidencia:</b> {item.evidence}</p>}{item.why && <p><b>Por que funcionou:</b> {item.why}</p>}{item.repeat && <p><b>Como repetir:</b> {item.repeat}</p>}</article>) : <p>Nenhum ponto forte foi detalhado pelo analisador.</p>}</div></div></section>
      <section className="review-list improvements"><Sparkles /><div><p className="eyebrow">MELHORIAS</p><h2>O que desenvolver primeiro</h2><div className="review-rich-list">{report.improvements.length ? report.improvements.map((item) => <article key={item.title}><h3>{item.title}</h3>{item.error && <p><b>Erro:</b> {item.error}</p>}{item.impact && <p><b>Impacto:</b> {item.impact}</p>}{item.fix && <p><b>Como corrigir:</b> {item.fix}</p>}{item.prevention && <p><b>Como evitar:</b> {item.prevention}</p>}{item.example && <p><b>Exemplo:</b> {item.example}</p>}</article>) : <p>Nenhuma melhoria foi detalhada pelo analisador.</p>}</div></div></section>
    </div>
    {report.actions.length > 0 && <section className="review-actions"><Lightbulb /><div><p className="eyebrow">PLANO DE ACAO</p><h2>As 3 prioridades para a proxima call</h2><div className="review-action-grid">{report.actions.map((item) => <article key={item.priority}><span>{item.priority}</span>{item.objective && <h3>{item.objective}</h3>}{item.action && <p><b>Acao:</b> {item.action}</p>}{item.exercise && <p><b>Exercicio:</b> {item.exercise}</p>}{item.target && <p><b>Meta:</b> {item.target}</p>}{item.expected && <p><b>Resultado esperado:</b> {item.expected}</p>}</article>)}</div></div></section>}
    <section className="generate-crm-report"><FileText /><div><p className="eyebrow">SEGUNDA ETAPA</p><h2>Transforme a avaliacao em relatorio gerencial</h2><p>Gere um documento separado, objetivo e pronto para CRM ou PDF, com dados, temperatura, dores, objecoes, qualificacao e proximos passos.</p></div><button className="primary-button compact" onClick={() => setDocumentMode(true)}>Gerar relatorio profissional <ArrowRight size={17} /></button></section>
  </div>;

  return <div className="call-review-page">
    <header className="review-heading"><div><p className="eyebrow">COACHING POS-LIGACAO</p><h1>Analisar ligacao</h1><p>Envie uma gravacao real para identificar competencias, momentos-chave e proximas acoes.</p></div></header>
    <section className="review-upload-panel">
      <div className="review-metadata">
        <label>Papel do vendedor<select value={sellerRole} onChange={(event) => setSellerRole(event.target.value)}><option value="sdr">SDR</option><option value="closer">Closer</option><option value="account_executive">Executivo de contas</option><option value="customer_success">Customer Success</option></select></label>
        <label>Tipo de ligacao<select value={callType} onChange={(event) => setCallType(event.target.value)}><option value="prospecting">Prospeccao</option><option value="discovery">Descoberta e qualificacao</option><option value="demo">Demonstracao</option><option value="closing">Negociacao e fechamento</option><option value="follow_up">Follow-up</option></select></label>
      </div>
      <div
        className={`review-dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
        onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_AUDIO} onChange={(event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0])} />
        {file ? <><span className="review-file-icon"><FileAudio /></span><div><strong>{file.name}</strong><p>{fileSize(file.size)} <i /> {durationLabel(duration)}</p></div>{audioUrl && <audio controls preload="metadata" src={audioUrl}>Seu navegador nao suporta este audio.</audio>}<button type="button" className="text-button" onClick={() => inputRef.current?.click()}>Trocar arquivo</button></> : <><span className="review-file-icon"><UploadCloud /></span><div><strong>Arraste a gravacao para ca</strong><p>ou selecione um arquivo do computador</p></div><button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>Selecionar audio</button><small>MP3, WAV, M4A, MP4, WEBM, OGG ou AAC, ate 100 MB</small></>}
      </div>
      {(status === "uploading" || status === "processing") && <div className="review-progress intelligent-processing" aria-live="polite"><span className="review-ai-wave"><i/><i/><i/><i/><i/></span><div><strong>{status === "uploading" ? "Preparando a gravacao" : "Construindo seu diagnostico profissional"}</strong><p>{status === "uploading" ? "Validando audio, duracao e qualidade das falas..." : "A IA esta cruzando contexto, habilidades, objecoes, momentos-chave e proximos passos."}</p><div className="review-processing-steps"><span>Transcricao</span><span>28 criterios</span><span>Plano de acao</span><span>Relatorio</span></div></div></div>}
      {status === "error" && <div className="review-error" role="alert"><AlertCircle /><div><strong>Nao foi possivel gerar o relatorio</strong><p>{error}</p><small>A gravacao nao foi pontuada. Tente novamente; para arquivos muito grandes, exporte em MP3 sem cortar a conversa.</small></div></div>}
      <div className="review-submit"><div><strong>Analise instantanea</strong><span>A avaliacao comeca automaticamente assim que o arquivo e selecionado.</span></div><button className="primary-button compact" disabled={!file || status === "uploading" || status === "processing"} onClick={() => void analyze()}>Analisar novamente <ArrowRight size={17} /></button></div>
    </section>
  </div>;
}
