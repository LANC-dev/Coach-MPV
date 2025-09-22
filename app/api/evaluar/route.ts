import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  if (!transcript) return NextResponse.json({ error: "No se envió transcripción" }, { status: 400 });

  const prompt = `
Evalúa esta transcripción según la rúbrica 1–5 (Claridad, Estructura, Persuasión, Empatía, Negociación). 
Da 2–3 consejos prácticos. Devuelve JSON con: { "puntajes": { ... }, "consejos": ["..."] }
Transcripción: "${transcript}"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const resultText = completion.choices[0].message?.content || "";

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { error: "No se pudo parsear respuesta", raw: resultText };
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
