"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SwipeableCard, { CardData } from "@/components/SwipeableCard";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";

export default function ReviewPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch review words (using today endpoint - reviewWords)
    fetch(`/api/today?lang=${language}`)
      .then((r) => r.json())
      .then((d) => {
        setUserId(d.userId);
        const reviewWords = d.reviewWords || [];
        const reviewExprs = d.reviewExpressions || [];

        const wordCards: CardData[] = reviewWords.map((w: Record<string, string | number | null>) => ({
          id: w.id as number,
          type: "word" as const,
          front: language === "en" ? w.english : w.japanese,
          back: w.korean,
          sub: language === "en" ? w.pronunciation : w.reading,
          example: w.example,
          exampleTranslation: w.exampleKorean,
          ttsText: language === "en" ? w.english : w.japanese,
          ttsLang: language,
        }));

        const exprCards: CardData[] = reviewExprs.map((e: Record<string, string | number | null>) => ({
          id: e.id as number,
          type: "expression" as const,
          front: e.expression,
          back: e.meaning,
          sub: language === "jp" ? e.reading : undefined,
          example: e.example,
          exampleTranslation: e.exampleKorean,
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
    if (!userId || !cards[currentIdx]) return;

    await fetch("/api/learning-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: language,
        userId,
        contentType: cards[currentIdx].type,
        contentId: cards[currentIdx].id,
        quality,
      }),
    }).catch(() => {});

    setCurrentIdx((i) => i + 1);
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
        <p className="text-5xl mt-16 mb-4">🎯</p>
        <p className="text-gray-500 text-lg">복습할 단어가 없습니다</p>
        <p className="text-gray-400 text-sm mt-1">모든 복습을 완료했어요!</p>
      </div>
    );
  }

  const completed = currentIdx >= cards.length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">복습</h1>
        <LanguageToggle />
      </div>

      <ProgressBar current={Math.min(currentIdx + 1, cards.length)} total={cards.length} className="mb-6" />

      {completed ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">복습 완료!</h2>
          <p className="text-gray-500">{cards.length}개의 항목을 복습했습니다</p>
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
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-400">
            <span>← 모르겠어요</span>
            <span>알아요! →</span>
          </div>
        </>
      )}
    </div>
  );
}
