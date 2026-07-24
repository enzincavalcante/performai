import asyncio
from google import genai
from google.genai import types
import os
import json
import base64
from app.personas import PERSONAS
from app.services.extensions.pre_session import pre_session_orchestrator
from app.tools import detect_objection, score_sales_skill


def build_transcript_message(transcription, speaker):
    """Normalize Gemini transcription variants into the frontend contract."""
    text = getattr(transcription, "text", None)
    if not isinstance(text, str) or not text.strip():
        return None
    final = getattr(transcription, "is_final", None)
    if final is None:
        final = getattr(transcription, "finished", False)
    return {
        "type": "transcript",
        "speaker": speaker,
        "text": text.strip(),
        "final": bool(final),
    }


async def connect_to_gemini_live(websocket, persona_id):
    """Manages the bidirectional Live API stream."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY nao configurada no backend")

    if persona_id not in PERSONAS:
        raise ValueError(f"Persona desconhecida: {persona_id}")

    # The current frontend sends audio immediately. A newer frontend may send one
    # session_config message first; preserve any non-config first message.
    first_message = await websocket.receive()
    session_config = {}
    if "text" in first_message:
        try:
            first_data = json.loads(first_message["text"])
            config_value = (
                first_data.get("data")
                if first_data.get("type") == "session_config"
                else first_data.get("session_config")
            )
            if config_value is not None:
                session_config = config_value if isinstance(config_value, dict) else {}
                first_message = None
        except (json.JSONDecodeError, TypeError):
            pass

    client = genai.Client(api_key=api_key)
    persona = PERSONAS[persona_id]
    
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        system_instruction=types.Content(parts=[types.Part.from_text(
            text=pre_session_orchestrator.build_prompt(persona_id, session_config)
        )]),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name=os.environ.get("GEMINI_LIVE_VOICE", "Kore")
                )
            )
        ),
        enable_affective_dialog=True,
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        tools=[detect_objection, score_sales_skill]
    )

    live_model = os.environ.get(
        "GEMINI_LIVE_MODEL",
        "gemini-2.5-flash-native-audio-preview-12-2025",
    )
    async with client.aio.live.connect(model=live_model, config=config) as session:
        print(f"Connected to Gemini Live with Persona: {persona['name']}")
        
        async def frontend_to_gemini():
            message = first_message
            while True:
                if message is None:
                    message = await websocket.receive()
                try:
                    if "bytes" in message:
                        await session.send(input=types.LiveClientRealtimeInput(
                            media_chunks=[types.Blob(data=message["bytes"], mime_type="audio/pcm")]
                        ))
                    elif "text" in message:
                        try:
                            data = json.loads(message["text"])
                            if data.get("realtime_input", {}).get("media_chunks"):
                                chunks = []
                                for chunk in data["realtime_input"]["media_chunks"]:
                                    mime_type = chunk.get("mime_type")
                                    str_data = chunk.get("data")
                                    if mime_type and str_data:
                                        # Remove data:image/jpeg;base64, if present
                                        if "," in str_data:
                                            str_data = str_data.split(",")[1]
                                        raw_bytes = base64.b64decode(str_data)
                                        chunks.append(types.Blob(data=raw_bytes, mime_type=mime_type))
                                if chunks:
                                    await session.send(input=types.LiveClientRealtimeInput(media_chunks=chunks))
                        except Exception as json_err:
                            print(f"JSON parsing error: {json_err}")
                finally:
                    message = None
                
        async def gemini_to_frontend():
            try:
                async for response in session.receive():
                    server_content = response.server_content
                    if server_content is not None:
                        input_transcript = build_transcript_message(
                            getattr(server_content, "input_transcription", None),
                            "user",
                        )
                        if input_transcript:
                            await websocket.send_json(input_transcript)

                        output_transcript = build_transcript_message(
                            getattr(server_content, "output_transcription", None),
                            "agent",
                        )
                        if output_transcript:
                            await websocket.send_json(output_transcript)

                        # Handle audio output
                        model_turn = server_content.model_turn
                        if model_turn is not None:
                            for part in model_turn.parts:
                                if part.inline_data:
                                    await websocket.send_bytes(part.inline_data.data)
                                    
                        # Handle tool calls
                        if server_content.model_turn is None and server_content.turn_complete is False:
                            # Actually, Google GenAI SDK tool calls happen in a specific way.
                            # We might need to handle tool call blocks if they appear in parts.
                            pass
                            
                    # Check for tool calls
                    if response.tool_call is not None:
                        for call in response.tool_call.function_calls:
                            print(f"Tool called: {call.name}")
                            if call.name == "detect_objection":
                                arg_dict = {k: v for k, v in call.args.items()}
                                result = detect_objection(**arg_dict)
                                await websocket.send_json({"type": "tool_call", "name": call.name, "result": result})
                                await session.send(input=types.LiveClientToolResponse(
                                    function_responses=[types.FunctionResponse(
                                        name=call.name,
                                        id=call.id,
                                        response=result
                                    )]
                                ))
                            elif call.name == "score_sales_skill":
                                arg_dict = {k: v for k, v in call.args.items()}
                                result = score_sales_skill(**arg_dict)
                                await websocket.send_json({"type": "scorecard", "data": arg_dict})
                                await session.send(input=types.LiveClientToolResponse(
                                    function_responses=[types.FunctionResponse(
                                        name=call.name,
                                        id=call.id,
                                        response=result
                                    )]
                                ))
            except Exception as e:
                print(f"gemini_to_frontend error: {e}")

        tasks = {
            asyncio.create_task(frontend_to_gemini()),
            asyncio.create_task(gemini_to_frontend()),
        }
        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        await asyncio.gather(*pending, return_exceptions=True)
        for task in done:
            task.result()
