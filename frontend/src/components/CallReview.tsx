"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle, Clock3, FileAudio,
  FileText, Lightbulb, Printer, RotateCcw, Sparkles, Target, UploadCloud,
} from "lucide-react";
import "./call-review.css";

const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,.mp4,.webm,.ogg,.aac";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const VERCEL_DIRECT_LIMIT = 3.8 * 1024 * 1024;

type ReviewReport = {
  score?: number;
  summary?: string;
  competencies: Array<{ name: string; score?: number; feedback?: string }>;
  excerpts: Array<{ timestamp?: string; text: string; insight?: string }>;
  strengths: string[];
  improvements: string[];
  actions: string[];
  evaluationBlocks: Array<{ name: string; score?: number; worked?: string; improve?: string; excerpt?: string }>;
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
        return [{ name, score: typeof row.score === "number" ? row.score : undefined, feedback: firstString(row, ["feedback", "comment", "analysis"]) }];
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
        return text ? [{ text, timestamp: firstString(row, ["timestamp", "time"]), insight: firstString(row, ["recommendation", "issue", "insight", "feedback", "comment"]) }] : [];
      })
    : [];
  const numericScore = typeof source.score === "number" ? source.score : typeof source.overall_score === "number" ? source.overall_score : undefined;
  const rawBlocks = source.evaluation_blocks;
  const evaluationBlocks = Array.isArray(rawBlocks) ? rawBlocks.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const name = firstString(row, ["name", "block", "criterion"]);
    if (!name) return [];
    return [{ name, score: typeof row.score === "number" ? row.score : undefined, worked: firstString(row, ["what_worked", "worked"]), improve: firstString(row, ["what_to_improve", "improve"]), excerpt: firstString(row, ["excerpt", "quote"]) }];
  }) : [];
  const crmReport = source.crm_report && typeof source.crm_report === "object" ? source.crm_report as ReviewReport["crmReport"] : undefined;
  return {
    score: numericScore,
    summary: firstString(source, ["summary", "executive_summary", "feedback"]),
    competencies,
    excerpts,
    strengths: stringList(source.strengths ?? source.positive_points),
    improvements: stringList(source.improvements ?? source.areas_for_improvement),
    actions: stringList(source.actions ?? source.next_actions ?? source.action_plan),
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
  const [file, setFile] = useState<File | null>(null);
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
    const url = URL.createObjectURL(next);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : null);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setDuration(null);
      URL.revokeObjectURL(url);
    };
  };

  const analyze = async () => {
    if (!file) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const endpoint = `${baseUrl}/api/v1/analytics/call-review`;
    setError("");
    setStatus("uploading");
    const processingTimer = window.setTimeout(() => setStatus("processing"), 500);
    try {
      const body = new FormData();
      if (file.size > VERCEL_DIRECT_LIMIT && !baseUrl) {
        const transcript = await transcribeLargeFile(file);
        if (!transcript) throw new Error("Nao foi possivel identificar falas nesta gravacao.");
        body.append("transcript", transcript);
      } else {
        body.append("audio", file);
      }
      body.append("metadata", JSON.stringify({
        source: "seller_upload",
        filename: file.name,
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

  const reset = () => {
    setFile(null);
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
        <section className="crm-call-data"><h2>1. Dados da call</h2><div>{Object.entries(callData).length ? Object.entries(callData).map(([key,value])=><span key={key}><small>{key.replaceAll("_"," ")}</small><strong>{value || "Nao identificado"}</strong></span>) : <span><small>Dados</small><strong>Nao identificados na transcricao</strong></span>}</div></section>
        <section className="crm-temperature"><div><small>2. TEMPERATURA DO LEAD</small><strong>{crm.temperature?.classification ?? "NAO IDENTIFICADA"}</strong></div><p>{crm.temperature?.justification ?? "Nao houve sinais suficientes na transcricao para classificar o lead."}</p></section>
        <section><h2>3. Resumo da conversa</h2><p>{crm.conversationSummary ?? report.summary ?? "Nao identificado."}</p></section>
        <section><h2>4. Dor / necessidade identificada</h2><ul>{crm.pains?.length ? crm.pains.map((item)=><li key={item}>{item}</li>) : <li>Nao identificado.</li>}</ul></section>
        <section><h2>5. Objecoes levantadas</h2><div className="crm-table"><div><b>Objecao</b><b>Como foi tratada</b></div>{crm.objections?.length ? crm.objections.map((item,index)=><div key={index}><span>{item.objection ?? "Nao identificado"}</span><span>{item.handling ?? "Nao identificado"}</span></div>) : <div><span>Nenhuma objecao relevante levantada</span><span>-</span></div>}</div></section>
        <section><h2>6. Qualificacao (BANT / GPCT)</h2><div className="crm-qualification">{Object.entries(crm.qualification ?? {}).map(([key,value])=><p key={key}><b>{key.replaceAll("_"," ")}:</b> {value}</p>)}{!Object.keys(crm.qualification ?? {}).length && <p>Nao identificado.</p>}</div></section>
        <section><h2>7. Proximos passos</h2><div className="crm-table three"><div><b>Acao</b><b>Responsavel</b><b>Prazo</b></div>{crm.nextSteps?.length ? crm.nextSteps.map((item,index)=><div key={index}><span>{item.action ?? "Nao identificado"}</span><span>{item.owner ?? "Nao identificado"}</span><span>{item.deadline ?? "Nao identificado"}</span></div>) : <div><span>Nenhum passo confirmado</span><span>-</span><span>-</span></div>}</div></section>
        <section><h2>8. Observacoes para o gestor</h2><p>{crm.sellerObservations ?? "Nao identificado."}</p></section>
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
    <section className="review-overview">
      {report.score !== undefined && <div className="review-score"><span>Nota geral</span><strong>{report.score}<small>/100</small></strong></div>}
      <div className="review-summary"><p className="eyebrow">RESUMO EXECUTIVO</p><h2>Leitura da conversa</h2><p>{report.summary ?? "Resumo nao fornecido pelo analisador."}</p></div>
    </section>
    {report.evaluationBlocks.length > 0 && <section className="review-section evaluation-blocks"><div className="review-section-title"><Target /><div><p className="eyebrow">AVALIACAO COMPLETA</p><h2>Analise criteriosa em 10 blocos</h2></div></div><div>{report.evaluationBlocks.map((block,index)=><article key={block.name}><header><span>{String(index+1).padStart(2,"0")}</span><h3>{block.name}</h3><strong>{block.score ?? "--"}<small>/10</small></strong></header><div><p><b>O que funcionou</b>{block.worked ?? "Nao identificado com seguranca."}</p><p><b>O que precisa melhorar</b>{block.improve ?? "Nao identificado com seguranca."}</p>{block.excerpt && <blockquote>&ldquo;{block.excerpt}&rdquo;</blockquote>}</div></article>)}</div></section>}
    {report.competencies.length > 0 && <section className="review-section"><div className="review-section-title"><Target /><div><p className="eyebrow">COMPETENCIAS</p><h2>Desempenho por habilidade</h2></div></div><div className="review-skills">{report.competencies.map((item) => <article key={item.name}><header><strong>{item.name.replaceAll("_", " ")}</strong>{item.score !== undefined && <span>{item.score}/100</span>}</header>{item.score !== undefined && <div><i style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} /></div>}{item.feedback && <p>{item.feedback}</p>}</article>)}</div></section>}
    {report.excerpts.length > 0 && <section className="review-section"><div className="review-section-title"><Clock3 /><div><p className="eyebrow">MOMENTOS-CHAVE</p><h2>Trechos da ligacao</h2></div></div><div className="review-excerpts">{report.excerpts.map((item, index) => <article key={`${item.timestamp}-${index}`}><span>{item.timestamp ?? "--:--"}</span><div><blockquote>{item.text}</blockquote>{item.insight && <p>{item.insight}</p>}</div></article>)}</div></section>}
    <div className="review-columns">
      <section className="review-list strengths"><CheckCircle /><div><p className="eyebrow">PONTOS FORTES</p><h2>O que manter</h2><ul>{report.strengths.length ? report.strengths.map((item) => <li key={item}>{item}</li>) : <li>Nenhum ponto forte foi detalhado pelo analisador.</li>}</ul></div></section>
      <section className="review-list improvements"><Sparkles /><div><p className="eyebrow">MELHORIAS</p><h2>O que desenvolver</h2><ul>{report.improvements.length ? report.improvements.map((item) => <li key={item}>{item}</li>) : <li>Nenhuma melhoria foi detalhada pelo analisador.</li>}</ul></div></section>
    </div>
    {report.actions.length > 0 && <section className="review-actions"><Lightbulb /><div><p className="eyebrow">PROXIMAS ACOES</p><h2>Plano pratico</h2><ol>{report.actions.map((item) => <li key={item}>{item}</li>)}</ol></div></section>}
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
        {file ? <><span className="review-file-icon"><FileAudio /></span><div><strong>{file.name}</strong><p>{fileSize(file.size)} <i /> {durationLabel(duration)}</p></div><button type="button" className="text-button" onClick={() => inputRef.current?.click()}>Trocar arquivo</button></> : <><span className="review-file-icon"><UploadCloud /></span><div><strong>Arraste a gravacao para ca</strong><p>ou selecione um arquivo do computador</p></div><button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>Selecionar audio</button><small>MP3, WAV, M4A, MP4, WEBM, OGG ou AAC, ate 25 MB</small></>}
      </div>
      {(status === "uploading" || status === "processing") && <div className="review-progress" aria-live="polite"><span className="review-spinner" /><div><strong>{status === "uploading" ? "Enviando gravacao" : "Analisando a conversa"}</strong><p>{status === "uploading" ? "Preparando o audio para analise..." : "A IA esta avaliando competencias e momentos-chave."}</p></div></div>}
      {status === "error" && <div className="review-error" role="alert"><AlertCircle /><div><strong>Nao foi possivel gerar o relatorio</strong><p>{error}</p><small>A gravacao nao foi pontuada. Tente novamente; para arquivos muito grandes, exporte em MP3 sem cortar a conversa.</small></div></div>}
      <div className="review-submit"><div><strong>Analise baseada na gravacao</strong><span>Nenhuma avaliacao e exibida antes da resposta do backend.</span></div><button className="primary-button compact" disabled={!file || status === "uploading" || status === "processing"} onClick={analyze}>Analisar ligacao <ArrowRight size={17} /></button></div>
    </section>
  </div>;
}
