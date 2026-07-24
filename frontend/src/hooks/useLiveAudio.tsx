import { useCallback, useEffect, useRef, useState } from "react";

type Scorecard = Record<string, number | string>;
export type TranscriptMessage = { id: string; speaker: "user" | "agent"; text: string };

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useLiveAudio(
  personaId: string,
  isSessionActive: boolean,
  sessionConfig?: Record<string, string>,
) {
  const sessionConfigPayload = JSON.stringify(sessionConfig ?? {});
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePlaybackRef = useRef(0);
  const nextPlaybackTimeRef = useRef(0);
  const demoStartedRef = useRef(false);
  const demoActiveRef = useRef(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const demoTurnRef = useRef(0);
  const demoReplyRef = useRef<((text: string) => void) | null>(null);
  const askedQuestionsRef = useRef(new Set<string>());

  const [isConnected, setIsConnected] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const [coachAdvice, setCoachAdvice] = useState("Escute a objecao inteira antes de responder.");

  const cleanup = useCallback(() => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMediaStream(null);
    }

    const socket = wsRef.current;
    wsRef.current = null;
    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close(1000, "Session ended");
    }

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    activePlaybackRef.current = 0;
    nextPlaybackTimeRef.current = 0;
    demoStartedRef.current = false;
    demoActiveRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    demoReplyRef.current = null;
    askedQuestionsRef.current.clear();
    window.speechSynthesis?.cancel();
    setIsAgentSpeaking(false);
    setIsListening(false);
    setIsDemoMode(false);
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    cleanup();
    setError(null);
    setBackendFeedback(null);
    setTranscriptMessages([]);
    setCoachAdvice("Escute a objecao inteira antes de responder.");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001";
      const socket = new WebSocket(`${baseUrl}/ws/arena/${personaId}`);
      socket.binaryType = "arraybuffer";
      wsRef.current = socket;
      const startDemoFallback = () => {
        if (demoStartedRef.current || wsRef.current !== socket) return;
        demoStartedRef.current = true;
        demoActiveRef.current = true;
        wsRef.current = null;
        setError(null);
        setIsConnected(true);
        setIsDemoMode(true);

        const openingLines: Record<string, string> = {
          rude_customer: "Vamos direto ao ponto. Sua proposta parece cara. Por que eu deveria continuar ouvindo?",
          aggressive_customer: "Voce tem pouco tempo. Qual resultado concreto isso entrega?",
          price_sensitive: "O concorrente cobra menos. Por que eu pagaria mais para voce?",
          ceo: "Qual e o impacto no negocio e em quanto tempo ele aparece?",
        };

        const chooseResponse = (heard: string) => {
          const text = heard.toLowerCase();
          const chooseUnused = (options: string[]) => {
            const available = options.filter((option) => !askedQuestionsRef.current.has(option));
            const selected = available[0] ?? options[demoTurnRef.current % options.length];
            askedQuestionsRef.current.add(selected);
            demoTurnRef.current += 1;
            return selected;
          };
          if (/pre.o|valor|desconto|caro/.test(text)) {
            return chooseUnused(personaId === "rude_customer"
              ? ["Isso ainda nao justifica o preco. Qual ganho financeiro concreto eu teria?", "Voce esta desviando. Quanto isso devolve para a empresa?", "Sem desconto agora. Primeiro me prove o valor em numeros."]
              : ["Qual retorno financeiro compensa esse investimento?", "Como voce compara esse custo com o resultado esperado?", "Qual economia ou receita eu consigo medir com isso?"]);
          }
          if (/resultado|retorno|roi|receita|econom/.test(text)) {
            return chooseUnused(["Em quanto tempo esse resultado aparece?", "Como vamos medir esse resultado na pratica?", "Qual premissa sustenta esse numero?"]);
          }
          if (/cliente|empresa|caso|exemplo/.test(text)) {
            return chooseUnused(["Qual cliente parecido comigo ja conseguiu isso?", "O que mudou nesse cliente depois da implantacao?", "Esse caso tinha o mesmo tamanho e desafio da minha empresa?"]);
          }
          if (/seguran.a|risco|integra/.test(text)) {
            return chooseUnused(["Qual e o risco real de implementacao?", "Quem assume a integracao e quanto tempo ela leva?", "O que acontece se a implantacao atrasar?"]);
          }
          const followUps = personaId === "rude_customer"
            ? ["Voce esta sendo generico. Qual e o numero?", "Isso nao respondeu minha pergunta. Qual e o beneficio concreto?", "Por que eu compraria agora?", "Quem vai se responsabilizar se isso nao funcionar?", "Resuma em uma frase por que isso importa."]
            : ["Pode quantificar esse beneficio?", "O que diferencia voce do concorrente?", "Qual seria o proximo passo, exatamente?", "Quem precisa participar dessa decisao?", "Qual problema devo priorizar primeiro?"];
          return chooseUnused(followUps);
        };
        const updateCoach = (heard: string) => {
          const text = heard.toLowerCase();
          if (/pre.o|valor|desconto|caro/.test(text)) {
            setCoachAdvice("Nao ofereca desconto ainda. Conecte o preco a um ganho financeiro mensuravel.");
          } else if (/resultado|retorno|roi|receita|econom/.test(text)) {
            setCoachAdvice("Diga um numero, um prazo e como esse resultado sera medido.");
          } else if (/cliente|empresa|caso|exemplo/.test(text)) {
            setCoachAdvice("Use um caso semelhante em uma frase: problema, acao e resultado.");
          } else {
            setCoachAdvice("Responda em ate duas frases e termine com uma pergunta de descoberta.");
          }
        };

        const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        setVoiceInputSupported(Boolean(Recognition));
        const startListening = () => {
          if (!demoActiveRef.current || window.speechSynthesis.speaking || !Recognition) return;
          const recognition = new Recognition();
          recognitionRef.current = recognition;
          recognition.lang = "pt-BR";
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.onresult = (event) => {
            let heard = "";
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
              heard += event.results[index][0]?.transcript ?? "";
            }
            setIsListening(false);
            if (heard.trim()) {
              demoReplyRef.current?.(heard.trim());
            }
          };
          recognition.onend = () => {
            setIsListening(false);
            if (demoActiveRef.current && !window.speechSynthesis.speaking) {
              window.setTimeout(startListening, 250);
            }
          };
          recognition.onerror = () => setIsListening(false);
          try {
            recognition.start();
            setIsListening(true);
          } catch {
            setIsListening(false);
          }
        };

        const speak = (text: string) => {
          recognitionRef.current?.abort();
          setIsListening(false);
          setTranscriptMessages((current) => [...current, { id: crypto.randomUUID(), speaker: "agent", text }]);
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "pt-BR";
          utterance.rate = 1.12;
          utterance.pitch = 0.88;
          const voices = window.speechSynthesis.getVoices();
          const portugueseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("pt"));
          utterance.voice = portugueseVoices.find((voice) => /natural|antonio|daniel|google/i.test(voice.name))
            ?? portugueseVoices[0]
            ?? null;
          utterance.onstart = () => setIsAgentSpeaking(true);
          utterance.onend = () => {
            setIsAgentSpeaking(false);
            window.setTimeout(startListening, 180);
          };
          utterance.onerror = () => {
            setIsAgentSpeaking(false);
            window.setTimeout(startListening, 180);
          };
          window.speechSynthesis.speak(utterance);
        };
        demoReplyRef.current = (text) => {
          const cleanText = text.trim();
          if (!cleanText || !demoActiveRef.current) return;
          setTranscriptMessages((current) => [...current, { id: crypto.randomUUID(), speaker: "user", text: cleanText }]);
          updateCoach(cleanText);
          speak(chooseResponse(cleanText));
        };

        window.setTimeout(
          () => speak(openingLines[personaId] ?? "Pode comecar. Qual problema voce resolve e qual resultado entrega?"),
          350,
        );
      };

      socket.onopen = async () => {
        if (wsRef.current !== socket) return;

        setIsConnected(true);
        setError(null);
        socket.send(JSON.stringify({
          type: "session_config",
          data: JSON.parse(sessionConfigPayload),
        }));
        const audioContext = new window.AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (wsRef.current !== socket || audioContextRef.current !== audioContext) {
            audioStream.getTracks().forEach((track) => track.stop());
            return;
          }

          let videoStream: MediaStream | null = null;
          try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (cameraError) {
            console.warn("Camera unavailable; continuing with audio only.", cameraError);
          }

          if (wsRef.current !== socket || audioContextRef.current !== audioContext) {
            audioStream.getTracks().forEach((track) => track.stop());
            videoStream?.getTracks().forEach((track) => track.stop());
            return;
          }

          const stream = new MediaStream([
            ...audioStream.getAudioTracks(),
            ...(videoStream?.getVideoTracks() ?? []),
          ]);
          streamRef.current = stream;
          setMediaStream(stream);

          const source = audioContext.createMediaStreamSource(audioStream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          source.connect(processor);
          processor.connect(audioContext.destination);
          processor.onaudioprocess = (event) => {
            if (socket.readyState !== WebSocket.OPEN || wsRef.current !== socket) return;
            const pcmData = convertFloat32ToInt16(event.inputBuffer.getChannelData(0));
            socket.send(pcmData.buffer);
          };

          if (stream.getVideoTracks().length > 0) {
            const videoElement = document.createElement("video");
            videoElement.srcObject = stream;
            videoElement.play().catch((playError) => console.warn("Video preview unavailable.", playError));
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            videoIntervalRef.current = setInterval(() => {
              if (socket.readyState !== WebSocket.OPEN || videoElement.videoWidth === 0) return;
              canvas.width = Math.min(videoElement.videoWidth, 640);
              canvas.height = videoElement.videoHeight * (canvas.width / videoElement.videoWidth);
              context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              socket.send(JSON.stringify({
                realtime_input: {
                  media_chunks: [{ mime_type: "image/jpeg", data: canvas.toDataURL("image/jpeg", 0.5) }],
                },
              }));
            }, 1000);
          }
        } catch (mediaError) {
          console.error(mediaError);
          setError("Nao foi possivel acessar o microfone. Verifique a permissao do navegador.");
          cleanup();
        }
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "error") {
              setError(data.message || "O backend do coach de IA encontrou um erro.");
            } else if (data.type === "transcript" && data.text && data.final !== false) {
              const speaker = data.speaker === "user" ? "user" : "agent";
              setTranscriptMessages((current) => [
                ...current,
                { id: crypto.randomUUID(), speaker, text: String(data.text) },
              ]);
              if (speaker === "user") setCoachAdvice("Responda ao ponto principal e termine com uma pergunta objetiva.");
            } else if (data.type === "scorecard") {
              setScorecard(data.data);
            } else if (data.type === "tool_call" && data.name === "detect_objection") {
              setBackendFeedback(data.result?.status);
              setTimeout(() => setBackendFeedback(null), 3000);
            }
          } catch (parseError) {
            console.error("Could not parse WebSocket message.", parseError);
          }
          return;
        }

        const audioData = event.data as ArrayBuffer;
        const audioContext = audioContextRef.current;
        if (!audioContext || audioData.byteLength === 0) return;

        try {
          const pcm16 = new Int16Array(audioData);
          const float32 = Float32Array.from(pcm16, (sample) => sample / 0x8000);
          const buffer = audioContext.createBuffer(1, float32.length, 24000);
          buffer.copyToChannel(float32, 0);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          const startAt = Math.max(audioContext.currentTime, nextPlaybackTimeRef.current);
          nextPlaybackTimeRef.current = startAt + buffer.duration;
          activePlaybackRef.current += 1;
          setIsAgentSpeaking(true);
          source.onended = () => {
            activePlaybackRef.current = Math.max(0, activePlaybackRef.current - 1);
            if (activePlaybackRef.current === 0) setIsAgentSpeaking(false);
          };
          source.start(startAt);
        } catch (playbackError) {
          console.error("Audio playback error.", playbackError);
        }
      };

      socket.onclose = (event) => {
        if (wsRef.current !== socket) return;
        if (event.code !== 1000) {
          startDemoFallback();
          return;
        }
        wsRef.current = null;
        setIsConnected(false);
        cleanup();
      };

      socket.onerror = () => {
        if (wsRef.current === socket) {
          startDemoFallback();
        }
      };
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : "Falha ao iniciar a conexao.");
      cleanup();
    }
  }, [cleanup, personaId, sessionConfigPayload]);

  const sendDemoText = useCallback((text: string) => {
    demoReplyRef.current?.(text);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (isSessionActive) {
        void connect();
      } else {
        cleanup();
      }
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isSessionActive, connect, cleanup]);

  return {
    isConnected,
    isAgentSpeaking,
    isListening,
    isDemoMode,
    voiceInputSupported,
    error,
    scorecard,
    setScorecard,
    backendFeedback,
    mediaStream,
    transcriptMessages,
    coachAdvice,
    sendDemoText,
  };
}

function convertFloat32ToInt16(buffer: Float32Array) {
  const pcm = new Int16Array(buffer.length);
  for (let index = 0; index < buffer.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, buffer[index]));
    pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return pcm;
}
