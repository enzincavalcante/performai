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
      const finalText = [...finalSegmentsRef.current.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, text]) => text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() || interimRef.current;

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
