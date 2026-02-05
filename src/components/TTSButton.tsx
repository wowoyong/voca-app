"use client";

import { useTTS } from "@/hooks/useTTS";
import { useState } from "react";

interface TTSButtonProps {
  text: string;
  lang: "en" | "jp";
  size?: "sm" | "md";
  className?: string;
}

/** 텍스트 음성 변환(TTS) 재생 버튼 컴포넌트 */
export default function TTSButton({ text, lang, size = "md", className = "" }: TTSButtonProps) {
  const { speak } = useTTS();
  const [playing, setPlaying] = useState(false);

  // 클릭 시 TTS 재생 및 애니메이션 처리
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(true);
    await speak(text, lang);
    setTimeout(() => setPlaying(false), 1000);
  };

  const sizeClass = size === "sm" ? "w-7 h-7" : "w-10 h-10";
  const iconSize = size === "sm" ? 14 : 20;

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center ${sizeClass} rounded-full bg-secondary text-secondary-foreground hover:bg-accent active:scale-95 transition-all ${
        playing ? "animate-pulse" : ""
      } ${className}`}
      aria-label="발음 듣기"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {playing ? (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        )}
      </svg>
    </button>
  );
}
