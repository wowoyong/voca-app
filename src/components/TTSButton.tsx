"use client";

import { useTTS } from "@/hooks/useTTS";
import { useState } from "react";

interface TTSButtonProps {
  text: string;
  lang: "en" | "jp";
  className?: string;
}

export default function TTSButton({ text, lang, className = "" }: TTSButtonProps) {
  const { speak } = useTTS();
  const [playing, setPlaying] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(true);
    await speak(text, lang);
    setTimeout(() => setPlaying(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 active:scale-95 transition-all ${
        playing ? "animate-pulse" : ""
      } ${className}`}
      aria-label="발음 듣기"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
