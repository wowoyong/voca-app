"use client";

import { useCallback, useRef } from "react";

/** TTS(음성합성) 훅 - Google TTS API 우선, Web Speech API 폴백 */
export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 텍스트를 음성으로 재생 (Google TTS 실패 시 Web Speech API 사용)
  const speak = useCallback(async (text: string, lang: "en" | "jp") => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Use Google TTS via server API (primary)
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioRef.current = new Audio(url);
        await audioRef.current.play();
        return;
      }
    } catch {
      // Fall through to Web Speech API
    }

    // Fallback: Web Speech API
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : "ja-JP";
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // 현재 재생 중인 음성을 중지
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
