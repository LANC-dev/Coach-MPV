import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json({ emocion: "Neutral" });
    }

    // Llamada a OpenAI para analizar emoción
    const prompt = `
    Analiza el siguiente texto y determina la emoción predominante entre: Feliz, Triste, Enojado, Neutral.
    Texto: """${transcript}"""
    Responde solo con una palabra: Feliz, Triste, Enojado o Neutral.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const emocionRaw = response.choices[0].message?.content?.trim() || "Neutral";

    return NextResponse.json({ emocion: emocionRaw });
  } catch (error) {
    console.error("Error en /api/emocion:", error);
    return NextResponse.json({ emocion: "Neutral" });
  }
}
