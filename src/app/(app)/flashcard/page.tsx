"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";
import TTSButton from "@/components/TTSButton";

interface WordData {
  id: number;
  english?: string;
  japanese?: string;
  reading?: string;
  korean: string;
  pronunciation?: string;
  example?: string;
  exampleKorean?: string;
}

interface ExpressionData {
  id: number;
  expression: string;
  reading?: string;
  meaning: string;
  example?: string;
  exampleKorean?: string;
}

interface GrammarData {
  id: number;
  title: string;
  titleReading?: string;
  explanation: string;
  correct: string;
  correctReading?: string;
  incorrect?: string;
  tip?: string;
}

type CardMode = "blank" | "meaning";

interface BlankCard {
  id: number;
  contentType: "word" | "expression" | "grammar";
  mode: CardMode;
  // blank mode
  sentence?: string;
  blanked?: string;
  sentenceKorean?: string;
  // meaning mode
  hint?: string;
  // common
  answer: string;
  answerSub?: string;
  ttsText: string;
  options: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBlank(example: string, word: string): string {
  // Try word boundary match first
  const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  if (regex.test(example)) {
    return example.replace(regex, "_____");
  }
  // Fallback: case-insensitive substring
  const idx = example.toLowerCase().indexOf(word.toLowerCase());
  if (idx !== -1) {
    return example.substring(0, idx) + "_____" + example.substring(idx + word.length);
  }
  return example + " (_____)";
}

function pickWrong(pool: string[], answer: string, count: number): string[] {
  return shuffle(
    pool.filter((t) => t.toLowerCase() !== answer.toLowerCase())
  ).slice(0, count);
}

export default function FlashcardPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<BlankCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchCards = useCallback(() => {
    setLoading(true);
    fetch(`/api/today?lang=${language}`)
      .then((r) => r.json())
      .then((d) => {
        setUserId(d.userId);

        const words: WordData[] = [...(d.newWords || []), ...(d.reviewWords || [])];
        const exprs: ExpressionData[] = [...(d.newExpressions || []), ...(d.reviewExpressions || [])];
        const grammars: GrammarData[] = d.grammar || [];

        // Build option pools
        const wordPool = words.map((w) => language === "en" ? w.english! : w.japanese!);
        const exprPool = exprs.map((e) => e.expression);

        const result: BlankCard[] = [];

        // Words
        for (const w of words) {
          const answer = language === "en" ? w.english! : w.japanese!;
          const answerSub = language === "en" ? w.pronunciation : w.reading;

          if (w.example) {
            // Blank fill mode
            const wrong = pickWrong(wordPool, answer, 3);
            result.push({
              id: w.id,
              contentType: "word",
              mode: "blank",
              sentence: w.example,
              blanked: makeBlank(w.example, answer),
              sentenceKorean: w.exampleKorean,
              answer,
              answerSub: answerSub ?? undefined,
              ttsText: w.example,
              options: shuffle([answer, ...wrong]),
            });
          } else {
            // Meaning match mode
            const wrong = pickWrong(wordPool, answer, 3);
            result.push({
              id: w.id,
              contentType: "word",
              mode: "meaning",
              hint: w.korean,
              answer,
              answerSub: answerSub ?? undefined,
              ttsText: answer,
              options: shuffle([answer, ...wrong]),
            });
          }
        }

        // Expressions
        for (const e of exprs) {
          const answer = e.expression;

          if (e.example) {
            const wrong = pickWrong(
              exprPool.length >= 4 ? exprPool : [...exprPool, ...wordPool],
              answer,
              3
            );
            result.push({
              id: e.id,
              contentType: "expression",
              mode: "blank",
              sentence: e.example,
              blanked: makeBlank(e.example, answer),
              sentenceKorean: e.exampleKorean,
              answer,
              answerSub: language === "jp" ? e.reading ?? undefined : undefined,
              ttsText: e.example,
              options: shuffle([answer, ...wrong]),
            });
          } else {
            const wrong = pickWrong(
              exprPool.length >= 4 ? exprPool : [...exprPool, ...wordPool],
              answer,
              3
            );
            result.push({
              id: e.id,
              contentType: "expression",
              mode: "meaning",
              hint: e.meaning,
              answer,
              answerSub: language === "jp" ? e.reading ?? undefined : undefined,
              ttsText: answer,
              options: shuffle([answer, ...wrong]),
            });
          }
        }

        // Grammar
        for (const g of grammars) {
          const answer = g.correct;
          const wrongSentences = [
            ...(g.incorrect ? [g.incorrect] : []),
            ...grammars.filter((x) => x.id !== g.id).map((x) => x.correct),
            ...words.slice(0, 3).map((w) => w.example).filter(Boolean) as string[],
          ];
          const wrong = shuffle(wrongSentences).slice(0, 3);

          result.push({
            id: g.id,
            contentType: "grammar",
            mode: "meaning",
            hint: `${g.title}\n${g.explanation}`,
            answer,
            answerSub: language === "jp" ? g.correctReading ?? undefined : undefined,
            ttsText: answer,
            options: shuffle([answer, ...wrong]),
          });
        }

        setCards(shuffle(result));
        setCurrentIdx(0);
        setScore(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSelect = async (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const card = cards[currentIdx];
    const isCorrect = option === card.answer;
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);

    if (userId) {
      fetch("/api/learning-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: language,
          userId,
          contentType: card.contentType,
          contentId: card.id,
          quality: isCorrect ? 5 : 1,
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setSelected(null);
      setAnswered(false);
      setCorrect(false);
      setCurrentIdx((i) => i + 1);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <p className="text-gray-500 mt-20 text-lg">오늘 학습할 항목이 없습니다</p>
      </div>
    );
  }

  const completed = currentIdx >= cards.length;
  const card = !completed ? cards[currentIdx] : null;

  const typeLabel =
    card?.contentType === "word"
      ? "단어"
      : card?.contentType === "expression"
      ? "표현"
      : "문법";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">빈칸 채우기</h1>
        <LanguageToggle />
      </div>

      <ProgressBar
        current={Math.min(currentIdx + 1, cards.length)}
        total={cards.length}
        className="mb-6"
      />

      {completed ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {score === cards.length
              ? "🏆"
              : score >= cards.length * 0.7
              ? "🎉"
              : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">완료!</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 inline-block">
            <p className="text-5xl font-bold text-indigo-600">
              {score}{" "}
              <span className="text-xl text-gray-400">/ {cards.length}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              정답률 {Math.round((score / cards.length) * 100)}%
            </p>
          </div>
          <br />
          <button
            onClick={fetchCards}
            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold active:scale-95 transition-transform"
          >
            다시 도전
          </button>
        </div>
      ) : card ? (
        <div key={currentIdx}>
          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {typeLabel}
                </span>
                <span className="text-xs text-gray-400">
                  {card.mode === "blank"
                    ? "빈칸에 들어갈 단어는?"
                    : "이 뜻에 해당하는 것은?"}
                </span>
              </div>
              <TTSButton text={card.ttsText} lang={language} />
            </div>

            {card.mode === "blank" ? (
              <>
                <p className="text-lg text-gray-800 leading-relaxed">
                  {answered
                    ? card.blanked!.split("_____").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span
                              className={`font-bold px-1 rounded ${
                                correct
                                  ? "text-green-600 bg-green-100"
                                  : "text-red-600 bg-red-100"
                              }`}
                            >
                              {card.answer}
                            </span>
                          )}
                        </span>
                      ))
                    : card.blanked!.split("_____").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block w-24 border-b-2 border-indigo-400 mx-1" />
                          )}
                        </span>
                      ))}
                </p>
                {card.sentenceKorean && (
                  <p className="text-sm text-gray-500 mt-3">
                    {card.sentenceKorean}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                {card.hint}
              </p>
            )}
          </div>

          {/* Word options */}
          <div className="grid grid-cols-2 gap-3">
            {card.options.map((option) => {
              let btnClass =
                "bg-white border-gray-200 hover:border-indigo-300 active:scale-[0.97]";

              if (answered) {
                if (option === card.answer) {
                  btnClass = "bg-green-100 border-green-500";
                } else if (option === selected) {
                  btnClass = "bg-red-100 border-red-500 quiz-incorrect";
                } else {
                  btnClass = "bg-white border-gray-200 opacity-50";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={answered}
                  className={`rounded-xl border-2 p-4 text-center font-medium text-sm leading-snug transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
