import { Settings } from "llamaindex";
import { extractUnits } from "./extractUnits";
import { UNIT_SUGGESTION_PROMPT_TEMPLATE } from "./unitSuggestionPrompt";
import { N_UNITS_TO_GENERATE } from "./constants";

// Criar uma interface para os parâmetros
interface GenerateUnitSuggestionsParams {
  type: "theme" | "context";
  discipline: string;
  grade: string;
  bnccGuidelines: string;
  numberOfUnits?: number; // opcional, padrão N_UNITS_TO_GENERATE
}

export async function generateUnitSuggestions({
  type,
  discipline,
  grade,
  bnccGuidelines,
  numberOfUnits = N_UNITS_TO_GENERATE,
}: GenerateUnitSuggestionsParams): Promise<string[]> {
  const llm = Settings.llm;

  const prompt =
    type === "theme"
      ? UNIT_SUGGESTION_PROMPT_TEMPLATE
          .replace("$discipline", discipline)
          .replace("$grade", grade)
          .replace("$bncc_guidelines", bnccGuidelines)
          .replace("$number_of_units", numberOfUnits.toString())
      : `
Você é um assistente pedagógico especialista em BNCC e cultura digital.

Disciplina: ${discipline}
Ano/Série: ${grade}
Diretrizes BNCC: ${bnccGuidelines}

Gere um PARÁGRAFO DESCRITIVO DE CONTEXTO para a unidade de ensino que:

- Estimule a cultura digital e o uso de tecnologias
- Seja contextualizado para a realidade dos alunos
- Inclua ideias de atividades digitais, pesquisa online ou interação com plataformas
- Esteja alinhado às habilidades da BNCC mencionadas
Não inclua placeholders de citação ou links automáticos. Se precisar referenciar algo, inclua apenas referências textuais reais (BNCC, MEC ou materiais digitais).
Não inclua explicações adicionais, apenas o texto do contexto.
`;

  try {
    const response = await llm.complete({ prompt });

    if (type === "theme") {
      return extractUnits(response.text);
    }

    return [response.text.trim()];
  } catch (error) {
    console.error("Error when generating unit suggestions:", error);
    return [];
  }
}
