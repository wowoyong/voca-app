"use client";

import { useState } from "react";
import { useSwipe } from "@/hooks/useSwipe";
import TTSButton from "./TTSButton";

export interface CardData {
  id: number;
  type: "word" | "expression" | "grammar";
  front: string;
  back: string;
  sub?: string;
  koreanReading?: string;
  example?: string;
  exampleTranslation?: string;
  exampleReading?: string;
  exampleTtsText?: string;
  ttsText?: string;
  ttsLang: "en" | "jp";
}

interface SwipeableCardProps {
  card: CardData;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  showSwipeHints?: boolean;
}

export default function SwipeableCard({
  card,
  onSwipeLeft,
  onSwipeRight,
  showSwipeHints = false,
}: SwipeableCardProps) {
  const [flipped, setFlipped] = useState(false);
  const { offsetX, swiping, handlers, style } = useSwipe({
    onSwipeLeft: () => {
      setFlipped(false);
      onSwipeLeft?.();
    },
    onSwipeRight: () => {
      setFlipped(false);
      onSwipeRight?.();
    },
  });

  const bgOverlay =
    swiping && offsetX > 50
      ? "bg-green-50 border-green-300"
      : swiping && offsetX < -50
      ? "bg-red-50 border-red-300"
      : "bg-card border-border";

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {showSwipeHints && swiping && (
        <>
          {offsetX > 50 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-white rounded-lg font-bold text-sm rotate-[-12deg]">
              알아요!
            </div>
          )}
          {offsetX < -50 && (
            <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-500 text-white rounded-lg font-bold text-sm rotate-[12deg]">
              모르겠어요
            </div>
          )}
        </>
      )}

      <div
        {...handlers}
        style={style}
        onClick={() => setFlipped(!flipped)}
        className={`flip-card w-full rounded-2xl border-2 shadow-sm cursor-pointer select-none ${bgOverlay}`}
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flip-card-front flex flex-col items-center justify-center p-8 rounded-2xl">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              {card.type === "word" ? "단어" : card.type === "expression" ? "표현" : "문법"}
            </span>
            <h2 className="text-3xl font-bold text-foreground text-center mb-2">
              {card.front}
            </h2>
            {card.sub && (
              <p className="text-lg text-muted-foreground">{card.sub}</p>
            )}
            {card.koreanReading && (
              <p className="text-sm text-muted-foreground/70 mt-1">[{card.koreanReading}]</p>
            )}
            {card.ttsText && (
              <TTSButton
                text={card.ttsText}
                lang={card.ttsLang}
                className="mt-4"
              />
            )}
            <p className="text-xs text-muted-foreground mt-6">탭하여 뒤집기</p>
          </div>

          {/* Back */}
          <div className="flip-card-back flex flex-col items-center justify-center p-8 rounded-2xl bg-accent">
            <h3 className="text-2xl font-bold text-foreground text-center mb-3">
              {card.back}
            </h3>
            {card.example && (
              <div className="mt-4 w-full bg-background rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-1">{card.example}</p>
                    {card.exampleReading && (
                      <p className="text-xs text-muted-foreground/70 mb-1">[{card.exampleReading}]</p>
                    )}
                    {card.exampleTranslation && (
                      <p className="text-xs text-muted-foreground">{card.exampleTranslation}</p>
                    )}
                  </div>
                  {card.exampleTtsText && (
                    <TTSButton
                      text={card.exampleTtsText}
                      lang={card.ttsLang}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}
            {card.ttsText && (
              <TTSButton
                text={card.ttsText}
                lang={card.ttsLang}
                className="mt-4"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
