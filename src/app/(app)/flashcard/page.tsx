"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  sentence?: string;
  blanked?: string;
  sentenceKorean?: string;
  hint?: string;
  answer: string;
  answerSub?: string;
  ttsText: string;
  options: string[];
}

interface SavedState {
  cards: BlankCard[];
  currentIdx: number;
  score: number;
  lang: string;
  mode: string;
}

const SESSION_KEY = "voca-flashcard-state";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBlank(example: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  if (regex.test(example)) {
    return example.replace(regex, "_____");
  }
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

function buildCardsFromWords(words: WordData[], exprs: ExpressionData[], grammars: GrammarData[], language: "en" | "jp"): BlankCard[] {
  const wordPool = words.map((w) => language === "en" ? w.english! : w.japanese!);
  const exprPool = exprs.map((e) => e.expression);
  const result: BlankCard[] = [];

  for (const w of words) {
    const answer = language === "en" ? w.english! : w.japanese!;
    const answerSub = language === "en" ? w.pronunciation : w.reading;
    if (w.example) {
      const wrong = pickWrong(wordPool, answer, 3);
      result.push({
        id: w.id, contentType: "word", mode: "blank",
        sentence: w.example, blanked: makeBlank(w.example, answer),
        sentenceKorean: w.exampleKorean, answer,
        answerSub: answerSub ?? undefined, ttsText: w.example,
        options: shuffle([answer, ...wrong]),
      });
    } else {
      const wrong = pickWrong(wordPool, answer, 3);
      result.push({
        id: w.id, contentType: "word", mode: "meaning",
        hint: w.korean, answer,
        answerSub: answerSub ?? undefined, ttsText: answer,
        options: shuffle([answer, ...wrong]),
      });
    }
  }

  for (const e of exprs) {
    const answer = e.expression;
    const pool = exprPool.length >= 4 ? exprPool : [...exprPool, ...wordPool];
    if (e.example) {
      const wrong = pickWrong(pool, answer, 3);
      result.push({
        id: e.id, contentType: "expression", mode: "blank",
        sentence: e.example, blanked: makeBlank(e.example, answer),
        sentenceKorean: e.exampleKorean, answer,
        answerSub: language === "jp" ? e.reading ?? undefined : undefined,
        ttsText: e.example, options: shuffle([answer, ...wrong]),
      });
    } else {
      const wrong = pickWrong(pool, answer, 3);
      result.push({
        id: e.id, contentType: "expression", mode: "meaning",
        hint: e.meaning, answer,
        answerSub: language === "jp" ? e.reading ?? undefined : undefined,
        ttsText: answer, options: shuffle([answer, ...wrong]),
      });
    }
  }

  for (const g of grammars) {
    const answer = g.correct;
    const wrongSentences = [
      ...(g.incorrect ? [g.incorrect] : []),
      ...grammars.filter((x) => x.id !== g.id).map((x) => x.correct),
      ...words.slice(0, 3).map((w) => w.example).filter(Boolean) as string[],
    ];
    const wrong = shuffle(wrongSentences).slice(0, 3);
    result.push({
      id: g.id, contentType: "grammar", mode: "meaning",
      hint: `${g.title}\n${g.explanation}`, answer,
      answerSub: language === "jp" ? g.correctReading ?? undefined : undefined,
      ttsText: answer, options: shuffle([answer, ...wrong]),
    });
  }

  return shuffle(result);
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
  const [mode, setMode] = useState<"today" | "review">("today");
  const restoredRef = useRef(false);

  const saveState = useCallback((c: BlankCard[], idx: number, s: number, m: string) => {
    try {
      const state: SavedState = { cards: c, currentIdx: idx, score: s, lang: language, mode: m };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {}
  }, [language]);

  // Try restore
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved: SavedState = JSON.parse(raw);
        if (saved.lang === language && saved.cards.length > 0) {
          setCards(saved.cards);
          setCurrentIdx(saved.currentIdx);
          setScore(saved.score);
          setMode((saved.mode || "today") as "today" | "review");
          setLoading(false);
          restoredRef.current = true;
          return;
        }
      }
    } catch {}
    restoredRef.current = false;
  }, [language]);

  const fetchWords = useCallback(async (fetchMode: "today" | "review") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard-words?lang=${language}&mode=${fetchMode}`);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "단어를 가져올 수 없습니다");
        setLoading(false);
        return;
      }

      const words = (data.words || []) as WordData[];
      const built = buildCardsFromWords(words, [], [], language);
      
      setCards(built);
      setCurrentIdx(0);
      setScore(0);
      setMode(fetchMode);
      saveState(built, 0, 0, fetchMode);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("단어를 가져올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [language, saveState]);

  useEffect(() => {
    if (!restoredRef.current) {
      fetchWords("today");
    } else {
      restoredRef.current = false;
    }
  }, [fetchWords]);

  const handleSelect = async (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const card = cards[currentIdx];
    const isCorrect = option === card.answer;
    setCorrect(isCorrect);

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    fetch("/api/learning-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: language,
        contentType: card.contentType,
        contentId: card.id,
        quality: isCorrect ? 5 : 1,
      }),
    }).catch(() => {});

    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      setSelected(null);
      setAnswered(false);
      setCorrect(false);
      setCurrentIdx(nextIdx);
      saveState(cards, nextIdx, newScore, mode);
    }, 1200);
  };

  const handleRetryToday = () => {
    sessionStorage.removeItem(SESSION_KEY);
    fetchWords("today");
  };

  const handleReviewPrevious = () => {
    sessionStorage.removeItem(SESSION_KEY);
    fetchWords("review");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-lg">로딩 중...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <p className="text-muted-foreground mt-20 text-lg">학습할 항목이 없습니다</p>
      </div>
    );
  }

  const completed = currentIdx >= cards.length;
  const card = !completed ? cards[currentIdx] : null;
  const typeLabel = card?.contentType === "word" ? "단어" : card?.contentType === "expression" ? "표현" : "문법";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">빈칸 채우기</h1>
        <LanguageToggle />
      </div>

      <ProgressBar current={Math.min(currentIdx + 1, cards.length)} total={cards.length} className="mb-6" />

      {completed ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">완료!</h2>
          <div className="bg-card rounded-2xl border p-6 mb-6 inline-block">
            <p className="text-5xl font-bold text-primary">
              {score} <span className="text-xl text-muted-foreground">/ {cards.length}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              정답률 {Math.round((score / cards.length) * 100)}%
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <button 
              onClick={handleRetryToday}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-95 transition-transform">
              오늘 단어 다시풀기
            </button>
            <button 
              onClick={handleReviewPrevious}
              className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold active:scale-95 transition-transform">
              이전 단어들 복습하기
            </button>
          </div>
        </div>
      ) : card ? (
        <div key={currentIdx}>
          <div className="bg-card rounded-2xl border p-6 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{typeLabel}</span>
                <span className="text-xs text-muted-foreground">
                  {card.mode === "blank" ? "빈칸에 들어갈 단어는?" : "이 뜻에 해당하는 것은?"}
                </span>
              </div>
              <TTSButton text={card.ttsText} lang={language} />
            </div>

            {card.mode === "blank" ? (
              <>
                <p className="text-lg text-foreground leading-relaxed">
                  {answered
                    ? card.blanked!.split("_____").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className={`font-bold px-1 rounded ${correct ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                              {card.answer}
                            </span>
                          )}
                        </span>
                      ))
                    : card.blanked!.split("_____").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="inline-block w-24 border-b-2 border-primary mx-1" />}
                        </span>
                      ))}
                </p>
                {card.sentenceKorean && <p className="text-sm text-muted-foreground mt-3">{card.sentenceKorean}</p>}
              </>
            ) : (
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-line">{card.hint}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {card.options.map((option) => {
              let btnClass = "bg-card border-border hover:border-primary/50 active:scale-[0.97]";
              if (answered) {
                if (option === card.answer) btnClass = "bg-green-50 border-green-500";
                else if (option === selected) btnClass = "bg-red-50 border-red-500 quiz-incorrect";
                else btnClass = "bg-card border-border opacity-50";
              }
              return (
                <button key={option} onClick={() => handleSelect(option)} disabled={answered}
                  className={`rounded-xl border-2 p-4 text-center font-medium text-sm leading-snug transition-all ${btnClass}`}>
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
