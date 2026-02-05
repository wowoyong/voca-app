"use client";

import { useState } from "react";
import TTSButton from "./TTSButton";

interface QuizOption {
  id: number;
  text: string;
}

interface QuizCardProps {
  question: string;
  ttsText?: string;
  ttsLang: "en" | "jp";
  options: QuizOption[];
  correctId: number;
  onAnswer: (selectedId: number, correct: boolean) => void;
}

/** 4지선다 퀴즈 카드 컴포넌트 */
export default function QuizCard({
  question,
  ttsText,
  ttsLang,
  options,
  correctId,
  onAnswer,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  // 선택지 클릭 시 정답 여부 판별 후 콜백 호출
  const handleSelect = (optionId: number) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const correct = optionId === correctId;
    setTimeout(() => {
      onAnswer(optionId, correct);
      setSelected(null);
      setAnswered(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-card rounded-2xl border p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{question}</h2>
          {ttsText && <TTSButton text={ttsText} lang={ttsLang} />}
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          let bgClass = "bg-card hover:bg-accent border-border";
          if (answered) {
            if (option.id === correctId) {
              bgClass = "bg-green-50 border-green-500 quiz-correct";
            } else if (option.id === selected) {
              bgClass = "bg-red-50 border-red-500 quiz-incorrect";
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${bgClass} ${
                answered ? "cursor-default" : "active:scale-[0.98]"
              }`}
            >
              <span className="text-base text-foreground">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
