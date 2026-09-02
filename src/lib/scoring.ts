import {
  careerOrder,
  type CareerId,
  type CareerScore,
  quizQuestions,
} from "@/data/careers";

export type QuizAnswers = Record<number, string>;

export type MatchResult = {
  id: CareerId;
  raw: number;
  percent: number;
};

const emptyScore = (): CareerScore => ({
  build: 0,
  analyze: 0,
  protect: 0,
  lead: 0,
});

export function calculateMatches(answers: QuizAnswers): MatchResult[] {
  const scores = emptyScore();

  Object.entries(answers).forEach(([questionIndex, optionId]) => {
    const question = quizQuestions[Number(questionIndex)];
    const option = question?.options.find((candidate) => candidate.id === optionId);

    if (!option) return;

    careerOrder.forEach((careerId) => {
      scores[careerId] += option.scores[careerId];
    });
  });

  const maxScore = Math.max(...Object.values(scores), 1);
  const minScore = Math.min(...Object.values(scores));
  const range = Math.max(maxScore - minScore, 1);

  return careerOrder
    .map((id) => ({
      id,
      raw: scores[id],
      percent: Math.round(58 + ((scores[id] - minScore) / range) * 34),
    }))
    .sort((a, b) => b.raw - a.raw);
}

export type AnswerAnalysis = {
  score: number;
  headline: string;
  summary: string;
  checks: { label: string; passed: boolean; detail: string }[];
};

export function analyzeInterviewAnswer(
  answer: string,
  type: "Behavioral" | "Technical",
  keyTerms: string[],
): AnswerAnalysis {
  const normalized = answer.trim().toLowerCase();
  const words = normalized ? normalized.split(/\s+/).length : 0;
  const keywordMatches = keyTerms.filter((term) => normalized.includes(term.toLowerCase()));
  const hasSpecifics = /\b\d+[\d,.%]*\b/.test(normalized) || /\b(result|outcome|impact|improved|reduced|increased|shipped|learned)\b/.test(normalized);
  const hasStructure =
    type === "Behavioral"
      ? /\b(situation|task|challenge|responsib|action|result|outcome|learned|first|then|finally)\b/.test(normalized)
      : /\b(first|then|next|finally|because|verify|measure|test|monitor)\b/.test(normalized);
  const rightLength = words >= 55 && words <= 230;
  const enoughDepth = words >= 35;
  const coverage = keywordMatches.length >= Math.min(2, keyTerms.length);

  const score = Math.min(
    96,
    24 +
      (enoughDepth ? 18 : Math.round(words / 2)) +
      (hasStructure ? 15 : 0) +
      (hasSpecifics ? 14 : 0) +
      (coverage ? 14 : keywordMatches.length * 4) +
      (rightLength ? 10 : 0),
  );

  const headline = score >= 82 ? "Strong signal" : score >= 66 ? "Promising draft" : "Good raw material";
  const summary =
    score >= 82
      ? "Your answer is specific and easy to follow. One tighter closing sentence could make it memorable."
      : score >= 66
        ? "The core idea is here. Add one concrete detail and make your reasoning sequence more visible."
        : "You have a starting point. Build it around one example, the actions you personally took, and a clear result.";

  return {
    score,
    headline,
    summary,
    checks: [
      {
        label: type === "Behavioral" ? "Clear story arc" : "Logical approach",
        passed: hasStructure,
        detail: type === "Behavioral" ? "Move from context to your action to the result." : "Use a sequence that narrows the problem and verifies the result.",
      },
      {
        label: "Concrete evidence",
        passed: hasSpecifics,
        detail: "Add a result, constraint, metric, or observable outcome.",
      },
      {
        label: "Role language",
        passed: coverage,
        detail: keywordMatches.length ? `You used ${keywordMatches.slice(0, 3).join(", ")}.` : `Consider language such as ${keyTerms.slice(0, 3).join(", ")}.`,
      },
      {
        label: "Focused length",
        passed: rightLength,
        detail: words < 55 ? `${words} words—develop the evidence.` : words > 230 ? `${words} words—trim the setup.` : `${words} words—comfortable interview length.`,
      },
    ],
  };
}
