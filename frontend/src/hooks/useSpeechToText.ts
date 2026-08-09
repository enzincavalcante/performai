"use client";

import { useEffect, useRef, useState } from "react";

type SpeechStatus = "idle" | "recording" | "processing" | "unsupported" | "error";

type SpeechResultEvent = Event & {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechErrorEvent = Event & { error: string };

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart?: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop?: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => Recognition;

const normalizedToken = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]/g, "")
  .toLowerCase();

function mergeSpeechSegments(segments: string[]) {
  const output: string[] = [];

  for (const segment of segments) {
    const incoming = segment.split(/\s+/).filter(Boolean);
    if (!incoming.length) continue;
    const normalizedOutput = output.map(normalizedToken);
    const normalizedIncoming = incoming.map(normalizedToken);
    const current = normalizedOutput.join(" ");
    const next = normalizedIncoming.join(" ");

    if (!next || current === next || current.endsWith(next)) continue;
    if (next.startsWith(current) && current) {
      output.splice(0, output.length, ...incoming);
      continue;
    }

    let overlap = Math.min(output.length, incoming.length);
    while (overlap > 0) {
      const tail = normalizedOutput.slice(-overlap).join(" ");
      const head = normalizedIncoming.slice(0, overlap).join(" ");
      if (tail === head) break;
      overlap -= 1;
    }
    output.push(...incoming.slice(overlap));
  }

  // Some speech engines emit the same short phrase as several final chunks.
  for (let size = Math.min(12, Math.floor(output.length / 2)); size >= 1; size -= 1) {
    let index = size;
    while (index + size <= output.length) {
      const previous = output.slice(index - size, index).map(normalizedToken).join(" ");
      const repeated = output.slice(index, index + size).map(normalizedToken).join(" ");
      if (previous && previous === repeated) output.splice(index, size);
      else index += 1;
    }
  }

  return output.join(" ").replace(/\s+/g, " ").trim();
}

function recognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return (Reflect.get(window, "SpeechRecognition") ?? Reflect.get(window, "webkitSpeechRecognition")) as RecognitionConstructor | undefined;
}

export function useSpeechToText(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const finalSegmentsRef = useRef(new Map<number, string>());
  const interimRef = useRef("");
  const deliveredRef = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = () => {
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setStatus("unsupported");
      setError("Seu navegador nao oferece transcricao por voz. Use o Chrome ou Edge atualizado.");
      return;
    }

    setError("");
    finalSegmentsRef.current.clear();
    interimRef.current = "";
    deliveredRef.current = false;
    failedRef.current = false;
    const recognition = new Constructor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setStatus("recording");
    recognition.onresult = (event) => {
      const interimParts: string[] = [];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = (result[0]?.transcript ?? "").replace(/\s+/g, " ").trim();
        if (!text) continue;
        if (result.isFinal) finalSegmentsRef.current.set(index, text);
        else interimParts.push(text);
      }
      interimRef.current = interimParts.join(" ").trim();
    };
    recognition.onerror = (event) => {
      failedRef.current = true;
      setStatus("error");
      setError(event.error === "not-allowed" ? "Permita o uso do microfone para falar." : "Nao foi possivel entender o audio. Tente novamente.");
    };
    recognition.onend = () => {
      const finalSegments = [...finalSegmentsRef.current.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, text]) => text);
      const finalText = mergeSpeechSegments(finalSegments.length ? finalSegments : [interimRef.current]);

      if (finalText && !deliveredRef.current && !failedRef.current) {
        deliveredRef.current = true;
        setStatus("processing");
        window.setTimeout(() => {
          onTranscriptRef.current(finalText);
          setStatus("idle");
        }, 180);
      } else if (!failedRef.current) {
        setStatus("idle");
      }
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    setStatus("processing");
    if (recognitionRef.current.stop) recognitionRef.current.stop();
    else recognitionRef.current.abort();
  };

  const toggle = () => status === "recording" ? stop() : start();

  return {
    status,
    error,
    toggle,
    supported: status !== "unsupported",
    label: status === "recording" ? "Gravando..." : status === "processing" ? "Processando audio..." : "Falar",
  };
}
