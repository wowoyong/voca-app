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

export default function TodayPage() {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCompleted(false);
    fetch(`/api/today?lang=${language}`)
      .then((r) => r.json())
      .then((d: TodayData) => {
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
    if (cards.length === 0) return;
    
    // 마지막 단어면 완료 화면으로
    if (currentIdx >= cards.length - 1) {
      setCompleted(true);
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
        <p className="text-muted-foreground mt-20 text-lg">오늘 학습할 내용이 없습니다</p>
      </div>
    );
  }

  // 완료 화면
  if (completed) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">오늘의 학습</h1>
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center justify-center mt-20 space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground">완료하였습니다!</h2>
          <p className="text-muted-foreground text-center">
            오늘의 {cards.length}개 단어를 모두 학습했습니다.
          </p>
          
          <button
            onClick={handleRestart}
            className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium active:scale-95 transition-transform"
          >
            처음으로 돌아가기
          </button>
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
        onSwipeRight={handleNext}
        onSwipeLeft={handleNext}
      />

      {/* 이전/다음 버튼 */}
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
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>{isLast ? "완료" : "다음"}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
