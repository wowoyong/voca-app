"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SwipeableCard, { CardData } from "@/components/SwipeableCard";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";

interface ReviewWord {
  id: number;
  english?: string;
  japanese?: string;
  reading?: string;
  korean: string;
  pronunciation?: string;
  koreanReading?: string;
  example?: string;
  exampleKorean?: string;
  exampleReading?: string;
}

interface ReviewExpression {
  id: number;
  expression: string;
  reading?: string;
  koreanReading?: string;
  meaning: string;
  example?: string;
  exampleKorean?: string;
  exampleReading?: string;
}

export default function ReviewPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Track review completion - must be before conditional returns
  useEffect(() => {
    if (completed && cards.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      fetch("/api/daily-session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          type: "review",
          language: language === "en" ? "en" : "jp",
        }),
      }).catch(() => {});
    }
  }, [completed, cards.length, language]);

  useEffect(() => {
    setLoading(true);
    setCompleted(false);
    fetch(`/api/review?lang=${language}`)
      .then((r) => r.json())
      .then((d) => {
        const reviewWords: ReviewWord[] = d.reviewWords || [];
        const reviewExprs: ReviewExpression[] = d.reviewExpressions || [];

        const wordCards: CardData[] = reviewWords.map((w) => ({
          id: w.id,
          type: "word" as const,
          front: language === "en" ? w.english! : w.japanese!,
          back: w.korean,
          sub: language === "en" ? w.pronunciation ?? undefined : w.reading ?? undefined,
          koreanReading: language === "jp" ? w.koreanReading ?? undefined : undefined,
          example: w.example ?? undefined,
          exampleTranslation: w.exampleKorean ?? undefined,
          exampleReading: language === "jp" ? w.exampleReading ?? undefined : undefined,
          exampleTtsText: w.example ?? undefined,
          ttsText: language === "en" ? w.english! : w.japanese!,
          ttsLang: language,
        }));

        const exprCards: CardData[] = reviewExprs.map((e) => ({
          id: e.id,
          type: "expression" as const,
          front: e.expression,
          back: e.meaning,
          sub: language === "jp" ? e.reading ?? undefined : undefined,
          koreanReading: language === "jp" ? e.koreanReading ?? undefined : undefined,
          example: e.example ?? undefined,
          exampleTranslation: e.exampleKorean ?? undefined,
          exampleReading: language === "jp" ? e.exampleReading ?? undefined : undefined,
          exampleTtsText: e.example ?? undefined,
          ttsText: e.expression,
          ttsLang: language,
        }));

        setCards([...wordCards, ...exprCards]);
        setCurrentIdx(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const handleSwipe = async (quality: number) => {
    if (!cards[currentIdx]) return;

    await fetch("/api/learning-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: language,
        contentType: cards[currentIdx].type,
        contentId: cards[currentIdx].id,
        quality,
      }),
    }).catch(() => {});

    if (currentIdx >= cards.length - 1) {
      setCompleted(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
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
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mt-16 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-muted-foreground text-lg">복습할 단어가 없습니다</p>
        <p className="text-muted-foreground/60 text-sm mt-1">모든 복습을 완료했어요!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">복습</h1>
        <LanguageToggle />
      </div>

      <ProgressBar
        current={completed ? cards.length : currentIdx + 1}
        total={cards.length}
        className="mb-6"
      />

      {completed ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">복습 완료!</h2>
          <p className="text-muted-foreground">{cards.length}개의 항목을 복습했습니다</p>
        </div>
      ) : (
        <>
          <SwipeableCard
            key={currentIdx}
            card={cards[currentIdx]}
            onSwipeRight={() => handleSwipe(5)}
            onSwipeLeft={() => handleSwipe(0)}
            showSwipeHints
          />
          <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span>&larr; 모르겠어요</span>
            <span>알아요! &rarr;</span>
          </div>
        </>
      )}
    </div>
  );
}
