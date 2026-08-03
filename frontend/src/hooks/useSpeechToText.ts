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
  const transcriptRef = useRef("");

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = () => {
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setStatus("unsupported");
      setError("Seu navegador nao oferece transcricao por voz. Use o Chrome ou Edge atualizado.");
      return;
    }

    setError("");
    transcriptRef.current = "";
    const recognition = new Constructor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setStatus("recording");
    recognition.onresult = (event) => {
      let fullText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        fullText += `${event.results[index][0]?.transcript ?? ""} `;
      }
      if (fullText.trim()) transcriptRef.current = `${transcriptRef.current} ${fullText}`.trim();
    };
    recognition.onerror = (event) => {
      setStatus("error");
      setError(event.error === "not-allowed" ? "Permita o uso do microfone para falar." : "Nao foi possivel entender o audio. Tente novamente.");
    };
    recognition.onend = () => {
      if (transcriptRef.current) {
        setStatus("processing");
        const finalText = transcriptRef.current.replace(/\s+/g, " ").trim();
        window.setTimeout(() => {
          onTranscript(finalText);
          setStatus("idle");
        }, 450);
      } else if (status !== "error") {
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
