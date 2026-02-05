"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import QuizCard from "@/components/QuizCard";
import ProgressBar from "@/components/ProgressBar";
import LanguageToggle from "@/components/LanguageToggle";

interface QuizQuestion {
  wordId: number;
  question: string;
  ttsText: string;
  correctId: number;
  options: { id: number; text: string }[];
}

interface SavedState {
  questions: QuizQuestion[];
  currentIdx: number;
  score: number;
  lang: string;
  mode: "today" | "review" | "all";
}

const SESSION_KEY = "voca-quiz-state";

export default function QuizPage() {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"today" | "review" | "all">("today");
  const restoredRef = useRef(false);

  const saveState = useCallback((q: QuizQuestion[], idx: number, s: number, m: "today" | "review" | "all") => {
    try {
      const state: SavedState = { questions: q, currentIdx: idx, score: s, lang: language, mode: m };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {}
  }, [language]);

  // Try restore
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved: SavedState = JSON.parse(raw);
        if (saved.lang === language && saved.questions.length > 0) {
          setQuestions(saved.questions);
          setCurrentIdx(saved.currentIdx);
          setScore(saved.score);
          setMode(saved.mode || "today");
          setLoading(false);
          restoredRef.current = true;
          return;
        }
      }
    } catch {}
    restoredRef.current = false;
  }, [language]);

  const fetchQuiz = useCallback((quizMode: "today" | "review" | "all") => {
    setLoading(true);
    setError("");
    const url = quizMode === "all" 
      ? `/api/quiz?lang=${language}&count=10`
      : `/api/quiz?lang=${language}&mode=${quizMode}`;
      
    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setQuestions(d.questions);
        setCurrentIdx(0);
        setScore(0);
        setMode(quizMode);
        saveState(d.questions, 0, 0, quizMode);
      })
      .catch(() => setError("퀴즈를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [language, saveState]);

  // Initial load
  useEffect(() => {
    if (!restoredRef.current) {
      fetchQuiz("today");
    } else {
      restoredRef.current = false;
    }
  }, [fetchQuiz]);

  // Track quiz completion - MUST be before conditional returns
  const completed = currentIdx >= questions.length && questions.length > 0;

  useEffect(() => {
    if (completed) {
      const today = new Date().toISOString().split('T')[0];
      fetch('/api/daily-session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          type: 'quiz',
          language: language === 'en' ? 'en' : 'jp',
        }),
      }).catch((err) => console.error('[Quiz] Failed to mark completion:', err));
    }
  }, [completed, language]);

  const handleAnswer = (_selectedId: number, correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      saveState(questions, nextIdx, newScore, mode);
    }, 200);
  };

  const handleRetry = () => {
    sessionStorage.removeItem(SESSION_KEY);
    fetchQuiz("today");
  };

  const handleReview = () => {
    sessionStorage.removeItem(SESSION_KEY);
    fetchQuiz("review");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-lg">퀴즈 준비 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <p className="text-muted-foreground mt-20 text-lg">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-95 transition-transform"
        >
          오늘 단어 퀴즈
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">퀴즈</h1>
        <LanguageToggle />
      </div>

      {!completed && (
        <ProgressBar current={currentIdx + 1} total={questions.length} className="mb-6" />
      )}

      {completed ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">퀴즈 완료!</h2>
          <div className="bg-card rounded-2xl border p-6 mb-6 inline-block">
            <p className="text-5xl font-bold text-primary">
              {score} <span className="text-xl text-muted-foreground">/ {questions.length}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              정답률 {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleRetry}
              className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-95 transition-transform"
            >
              오늘 단어 다시풀기
            </button>
            <button
              onClick={handleReview}
              className="w-full px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold active:scale-95 transition-transform"
            >
              이전 단어들 복습하기
            </button>
          </div>
        </div>
      ) : (
        <QuizCard
          question={questions[currentIdx].question}
          ttsText={questions[currentIdx].ttsText}
          ttsLang={language}
          options={questions[currentIdx].options}
          correctId={questions[currentIdx].correctId}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
