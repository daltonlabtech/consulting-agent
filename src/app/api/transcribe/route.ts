import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/whisper";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "Áudio não encontrado" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      language: "pt",
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (err) {
    console.error("[transcribe]", err);
    return NextResponse.json({ error: "Erro na transcrição" }, { status: 500 });
  }
}
