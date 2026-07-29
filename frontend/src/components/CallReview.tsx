"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle, Clock3, FileAudio,
  Lightbulb, RotateCcw, Sparkles, Target, UploadCloud,
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
  return {
    score: numericScore,
    summary: firstString(source, ["summary", "executive_summary", "feedback"]),
    competencies,
    excerpts,
    strengths: stringList(source.strengths ?? source.positive_points),
    improvements: stringList(source.improvements ?? source.areas_for_improvement),
    actions: stringList(source.actions ?? source.next_actions ?? source.action_plan),
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

async function transcribeLargeFile(file: File) {
  const tokenResponse = await fetch("/api/v1/transcription-token", { method: "POST" });
  const tokenPayload = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !tokenPayload?.token) {
    throw new Error(tokenPayload?.detail ?? "Nao foi possivel preparar o upload seguro.");
  }

  const transcriptionResponse = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-3&language=pt-BR&smart_format=true&punctuate=true&diarize=true&utterances=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPayload.token}`,
        "Content-Type": file.type || "audio/mpeg",
      },
      body: file,
    },
  );
  const transcription = await transcriptionResponse.json();
  if (!transcriptionResponse.ok) {
    throw new Error("A transcricao direta falhou. Tente novamente em alguns instantes.");
  }

  const utterances = transcription?.results?.utterances;
  if (Array.isArray(utterances) && utterances.length) {
    return utterances
      .filter((item: { transcript?: string }) => item.transcript?.trim())
      .map((item: { speaker?: number; transcript?: string; start?: number }) => {
        const total = Math.floor(item.start ?? 0);
        const timestamp = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
        return `[${timestamp}] Pessoa ${(item.speaker ?? 0) + 1}: ${item.transcript?.trim()}`;
      })
      .join("\n");
  }
  return String(transcription?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "").trim();
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

  if (status === "report" && report) return <div className="call-review-page">
    <header className="review-heading">
      <div><p className="eyebrow">ANALISE CONCLUIDA</p><h1>Relatorio da ligacao</h1><p>{file?.name}</p></div>
      <button className="secondary-button" onClick={reset}><RotateCcw size={17} /> Analisar outra</button>
    </header>
    <section className="review-overview">
      {report.score !== undefined && <div className="review-score"><span>Nota geral</span><strong>{report.score}<small>/100</small></strong></div>}
      <div className="review-summary"><p className="eyebrow">RESUMO EXECUTIVO</p><h2>Leitura da conversa</h2><p>{report.summary ?? "Resumo nao fornecido pelo analisador."}</p></div>
    </section>
    {report.competencies.length > 0 && <section className="review-section"><div className="review-section-title"><Target /><div><p className="eyebrow">COMPETENCIAS</p><h2>Desempenho por habilidade</h2></div></div><div className="review-skills">{report.competencies.map((item) => <article key={item.name}><header><strong>{item.name.replaceAll("_", " ")}</strong>{item.score !== undefined && <span>{item.score}/100</span>}</header>{item.score !== undefined && <div><i style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} /></div>}{item.feedback && <p>{item.feedback}</p>}</article>)}</div></section>}
    {report.excerpts.length > 0 && <section className="review-section"><div className="review-section-title"><Clock3 /><div><p className="eyebrow">MOMENTOS-CHAVE</p><h2>Trechos da ligacao</h2></div></div><div className="review-excerpts">{report.excerpts.map((item, index) => <article key={`${item.timestamp}-${index}`}><span>{item.timestamp ?? "--:--"}</span><div><blockquote>{item.text}</blockquote>{item.insight && <p>{item.insight}</p>}</div></article>)}</div></section>}
    <div className="review-columns">
      <section className="review-list strengths"><CheckCircle /><div><p className="eyebrow">PONTOS FORTES</p><h2>O que manter</h2><ul>{report.strengths.length ? report.strengths.map((item) => <li key={item}>{item}</li>) : <li>Nenhum ponto forte foi detalhado pelo analisador.</li>}</ul></div></section>
      <section className="review-list improvements"><Sparkles /><div><p className="eyebrow">MELHORIAS</p><h2>O que desenvolver</h2><ul>{report.improvements.length ? report.improvements.map((item) => <li key={item}>{item}</li>) : <li>Nenhuma melhoria foi detalhada pelo analisador.</li>}</ul></div></section>
    </div>
    {report.actions.length > 0 && <section className="review-actions"><Lightbulb /><div><p className="eyebrow">PROXIMAS ACOES</p><h2>Plano pratico</h2><ol>{report.actions.map((item) => <li key={item}>{item}</li>)}</ol></div></section>}
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
