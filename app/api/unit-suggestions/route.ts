import { NextResponse } from "next/server";
import { generateUnitSuggestions } from "@/app/api/chat/llamaindex/streaming/unitSuggestion";

export async function POST(req: Request) {
  const { type, discipline, grade, bnccGuidelines } = await req.json();

  try {
    // Passa um objeto com os parâmetros
    const suggestions = await generateUnitSuggestions({
      type,
      discipline,
      grade,
      bnccGuidelines
      // numberOfUnits: opcional, se quiser usar o padrão não precisa incluir
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar sugestões" },
      { status: 500 }
    );
  }
}
