"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SwipeableCard, { CardData } from "@/components/SwipeableCard";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

interface TodayWord {
  id: number;
  english?: string;
  japanese?: string;
  reading?: string;
  korean: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  exampleKorean?: string;
  exampleReading?: string;
  koreanReading?: string;
}

interface TodayExpression {
  id: number;
  expression: string;
  reading?: string;
  koreanReading?: string;
  meaning: string;
  example?: string;
  exampleKorean?: string;
  exampleReading?: string;
}

interface TodayGrammar {
  id: number;
  title: string;
  titleReading?: string;
  explanation: string;
  correct: string;
  correctReading?: string;
  incorrect?: string;
  tip?: string;
}

interface TodayData {
  userId: number;
  newWords: TodayWord[];
  reviewWords: TodayWord[];
  newExpressions: TodayExpression[];
  reviewExpressions: TodayExpression[];
  grammar: TodayGrammar[];
}

function wordToCard(w: TodayWord, lang: "en" | "jp"): CardData {
  return {
    id: w.id,
    type: "word",
    front: lang === "en" ? w.english! : w.japanese!,
    back: w.korean,
    sub: lang === "en" ? w.pronunciation ?? undefined : w.reading ?? undefined,
    koreanReading: lang === "jp" ? w.koreanReading ?? undefined : undefined,
    example: w.example ?? undefined,
    exampleTranslation: w.exampleKorean ?? undefined,
    exampleReading: lang === "jp" ? w.exampleReading ?? undefined : undefined,
    exampleTtsText: w.example ?? undefined,
    ttsText: lang === "en" ? w.english! : w.japanese!,
    ttsLang: lang,
  };
}

function exprToCard(e: TodayExpression, lang: "en" | "jp"): CardData {
  return {
    id: e.id,
    type: "expression",
    front: e.expression,
    back: e.meaning,
    sub: lang === "jp" ? e.reading ?? undefined : undefined,
    koreanReading: lang === "jp" ? e.koreanReading ?? undefined : undefined,
    example: e.example ?? undefined,
    exampleTranslation: e.exampleKorean ?? undefined,
    exampleReading: lang === "jp" ? e.exampleReading ?? undefined : undefined,
    exampleTtsText: e.example ?? undefined,
    ttsText: e.expression,
    ttsLang: lang,
  };
}

function grammarToCard(g: TodayGrammar, lang: "en" | "jp"): CardData {
  return {
    id: g.id,
    type: "grammar",
    front: g.title,
    back: g.explanation,
    sub: lang === "jp" ? g.titleReading ?? undefined : undefined,
    example: g.correct,
    exampleTranslation: g.incorrect ? `(X) ${g.incorrect}` : g.tip ?? undefined,
    exampleTtsText: g.correct,
    ttsText: g.correct,
    ttsLang: lang,
  };
}

function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function TodayPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setCompleted(false);
    setError(null);

    fetch(`/api/today?lang=${language}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: TodayData) => {
        const allCards: CardData[] = [
          ...(d.newWords || []).map((w) => wordToCard(w, language)),
          ...(d.reviewWords || []).map((w) => wordToCard(w, language)),
          ...(d.newExpressions || []).map((e) => exprToCard(e, language)),
          ...(d.reviewExpressions || []).map((e) => exprToCard(e, language)),
          ...(d.grammar || []).map((g) => grammarToCard(g, language)),
        ];
        setCards(allCards);

        const storageKey = `today-progress-${language}`;
        const savedProgress = sessionStorage.getItem(storageKey);
        if (savedProgress) {
          try {
            const { currentIdx: savedIdx, date } = JSON.parse(savedProgress);
            const today = getTodayString();
            if (date === today && savedIdx >= 0 && savedIdx < allCards.length) {
              setCurrentIdx(savedIdx);
              return;
            }
          } catch {}
        }
        setCurrentIdx(0);
      })
      .catch((err) => {
        setError(err.message || "데이터를 불러올 수 없습니다");
      })
      .finally(() => setLoading(false));
  }, [language]);

  useEffect(() => {
    if (cards.length > 0 && !completed) {
      const storageKey = `today-progress-${language}`;
      const progress = { currentIdx, date: getTodayString() };
      sessionStorage.setItem(storageKey, JSON.stringify(progress));
    }
  }, [currentIdx, language, cards.length, completed]);

  const saveProgress = async (quality: number) => {
    if (!cards[currentIdx]) return;
    const card = cards[currentIdx];
    try {
      await fetch("/api/learning-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: language,
          contentType: card.type,
          contentId: card.id,
          quality,
        }),
      });
    } catch {}
  };

  const handleNext = async (quality?: number) => {
    if (cards.length === 0) return;
    if (quality !== undefined) {
      await saveProgress(quality);
    }
    if (currentIdx >= cards.length - 1) {
      setCompleted(true);
      const storageKey = `today-progress-${language}`;
      sessionStorage.removeItem(storageKey);

      const today = new Date().toISOString().split("T")[0];
      fetch("/api/daily-session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          type: "today",
          language: language === "en" ? "en" : "jp",
        }),
      }).catch(() => {});
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (cards.length === 0 || currentIdx === 0) return;
    setCurrentIdx((prev) => prev - 1);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setCompleted(false);
    const storageKey = `today-progress-${language}`;
    sessionStorage.removeItem(storageKey);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <div className="mt-20">
          <p className="text-red-500 font-semibold text-lg mb-2">오류 발생</p>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <p className="text-muted-foreground mt-20 text-lg">오늘 학습할 내용이 없습니다</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">오늘의 학습</h1>
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center justify-center mt-16 space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">학습 완료!</h2>
          <p className="text-muted-foreground text-center">
            오늘 {cards.length}개 항목을 모두 학습했습니다.
          </p>

          <div className="w-full space-y-3 mt-4">
            <Link
              href="/quiz"
              className="block w-full px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-center active:scale-95 transition-transform"
            >
              퀴즈로 복습하기
            </Link>
            <Link
              href="/flashcard"
              className="block w-full px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium text-center active:scale-95 transition-transform"
            >
              빈칸 채우기
            </Link>
            <button
              onClick={handleRestart}
              className="w-full px-8 py-3 text-muted-foreground rounded-xl font-medium active:scale-95 transition-transform"
            >
              처음부터 다시 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === cards.length - 1;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">오늘의 학습</h1>
        <LanguageToggle />
      </div>

      <ProgressBar current={currentIdx + 1} total={cards.length} className="mb-6" />

      <SwipeableCard
        key={currentIdx}
        card={cards[currentIdx]}
        onSwipeRight={() => handleNext(5)}
        onSwipeLeft={() => handleNext(2)}
      />

      <div className="flex justify-between items-center gap-4 mt-6">
        {!isFirst ? (
          <button
            onClick={handlePrev}
            className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>이전</span>
          </button>
        ) : (
          <div className="flex-1"></div>
        )}

        <button
          onClick={() => handleNext(5)}
          className={`flex-1 px-6 py-3 rounded-xl font-medium active:scale-95 transition-transform flex items-center justify-center gap-2 ${
            isLast
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <span>{isLast ? "학습 끝내기" : "다음"}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isLast ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </div>
    </div>
  );
}
