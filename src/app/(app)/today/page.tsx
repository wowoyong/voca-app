"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SwipeableCard, { CardData } from "@/components/SwipeableCard";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";

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
}

interface TodayExpression {
  id: number;
  expression: string;
  reading?: string;
  meaning: string;
  example?: string;
  exampleKorean?: string;
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
    example: w.example ?? undefined,
    exampleTranslation: w.exampleKorean ?? undefined,
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
    example: e.example ?? undefined,
    exampleTranslation: e.exampleKorean ?? undefined,
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
    ttsText: g.correct,
    ttsLang: lang,
  };
}

export default function TodayPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TodayData | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/today?lang=${language}`)
      .then((r) => r.json())
      .then((d: TodayData) => {
        setData(d);
        const allCards: CardData[] = [
          ...d.newWords.map((w) => wordToCard(w, language)),
          ...d.reviewWords.map((w) => wordToCard(w, language)),
          ...d.newExpressions.map((e) => exprToCard(e, language)),
          ...d.reviewExpressions.map((e) => exprToCard(e, language)),
          ...d.grammar.map((g) => grammarToCard(g, language)),
        ];
        setCards(allCards);
        setCurrentIdx(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const handleNext = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleLearn = async (card: CardData) => {
    if (!data) return;
    await fetch("/api/learning-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: language,
        userId: data.userId,
        contentType: card.type,
        contentId: card.id,
        quality: 4,
      }),
    }).catch(() => {});
    handleNext();
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
        <p className="text-gray-500 mt-20 text-lg">오늘 학습할 내용이 없습니다</p>
      </div>
    );
  }

  const completed = currentIdx >= cards.length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">오늘의 학습</h1>
        <LanguageToggle />
      </div>

      <ProgressBar current={Math.min(currentIdx + 1, cards.length)} total={cards.length} className="mb-6" />

      {completed ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">학습 완료!</h2>
          <p className="text-gray-500">오늘 {cards.length}개의 항목을 학습했습니다</p>
        </div>
      ) : (
        <SwipeableCard
          key={currentIdx}
          card={cards[currentIdx]}
          onSwipeRight={() => handleLearn(cards[currentIdx])}
          onSwipeLeft={handleNext}
        />
      )}

      {!completed && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gray-200 rounded-xl text-gray-700 font-medium active:scale-95 transition-transform"
          >
            건너뛰기
          </button>
          <button
            onClick={() => handleLearn(cards[currentIdx])}
            className="px-6 py-2.5 bg-indigo-500 rounded-xl text-white font-medium active:scale-95 transition-transform"
          >
            학습 완료
          </button>
        </div>
      )}
    </div>
  );
}
