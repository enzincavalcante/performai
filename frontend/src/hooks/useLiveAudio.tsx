import { useEffect, useRef, useState, useCallback } from 'react';

export function useLiveAudio(personaId: string, isSessionActive: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<any>(null); // For final results
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001";
      const wsUrl = `${baseUrl}/ws/arena/${personaId}`;
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.binaryType = "arraybuffer";

      wsRef.current.onopen = async () => {
        setIsConnected(true);
        setError(null);
        
        audioContextRef.current = new window.AudioContext({ sampleRate: 16000 }); // Gemini wants 16kHz typical
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          streamRef.current = stream;
          setMediaStream(stream);

          // Guard: cleanup() may have nulled audioContextRef while getUserMedia was awaiting
          if (!audioContextRef.current) return;

          const source = audioContextRef.current.createMediaStreamSource(stream);
          
          // ScriptProcessor is deprecated but stable for this kind of low-level PCM capture in many browsers
          const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          source.connect(processor);
          processor.connect(audioContextRef.current.destination);
          
          processor.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = convertFloat32ToInt16(inputData);
            wsRef.current.send(pcmData.buffer); 
          };

          // --- Video Frame Extraction ---
          const videoElement = document.createElement("video");
          videoElement.srcObject = stream;
          videoElement.play().catch(e => console.error("Hidden video play error", e));
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          videoIntervalRef.current = setInterval(() => {
              if (wsRef.current?.readyState === WebSocket.OPEN && videoElement.videoWidth > 0 && isSessionActive) {
                  // Downscale video for faster transmission
                  canvas.width = Math.min(videoElement.videoWidth, 640);
                  const scale = canvas.width / videoElement.videoWidth;
                  canvas.height = videoElement.videoHeight * scale;
                  
                  ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL("image/jpeg", 0.5); 
                  
                  wsRef.current.send(JSON.stringify({
                      realtime_input: {
                          media_chunks: [
                              {
                                  mime_type: "image/jpeg",
                                  data: dataUrl
                              }
                          ]
                      }
                  }));
              }
          }, 1000); // Send 1 frame per second

        } catch (err: any) {
          setError("Não foi possível acessar microfone e câmera. Verifique as permissões do navegador.");
          console.error(err);
        }
      };

      wsRef.current.onmessage = async (event) => {
        if (typeof event.data === 'string') {
           try {
             const data = JSON.parse(event.data);
             if (data.type === "scorecard") {
               setScorecard(data.data);
             } else if (data.type === "tool_call" && data.name === "detect_objection") {
               setBackendFeedback(data.result?.status);
               setTimeout(() => setBackendFeedback(null), 3000); // clear after 3s
             }
           } catch (e) { console.error("Could not parse JSON", e); }
           return;
        }

        // Binary audio data — Gemini Live returns raw 16-bit PCM at 24kHz
        // decodeAudioData won't work on raw PCM; manually construct an AudioBuffer instead
        const audioData = event.data as ArrayBuffer;
        if (audioContextRef.current && audioData.byteLength > 0) {
          try {
            const pcm16 = new Int16Array(audioData);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 0x8000;
            }
            const audioCtx = audioContextRef.current;
            const buffer = audioCtx.createBuffer(1, float32.length, 24000);
            buffer.copyToChannel(float32, 0);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
          } catch (e) {
            console.error("Audio playback error:", e);
          }
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        cleanup();
      };
      
        wsRef.current.onerror = () => {
        setError("A conexão com o coach de IA falhou. Confira o backend configurado.");
      };

    } catch (err: any) {
      setError(err.message);
    }
  }, [personaId]);

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
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setMediaStream(null);
    }
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (isSessionActive && !isConnected) {
      connect();
    } else if (!isSessionActive && isConnected) {
      cleanup();
    }
    return () => cleanup();
  }, [isSessionActive, connect, cleanup, isConnected]);

  return { isConnected, error, scorecard, setScorecard, backendFeedback, mediaStream };
}

function convertFloat32ToInt16(buffer: Float32Array) {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
        const s = Math.max(-1, Math.min(1, buffer[l]));
        buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf;
}
