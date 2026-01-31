"use client";

import { useEffect, useState } from "react";
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

export default function QuizPage() {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuiz = () => {
    setLoading(true);
    setError("");
    fetch(`/api/quiz?lang=${language}&count=10`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setQuestions(d.questions);
        setCurrentIdx(0);
        setScore(0);
      })
      .catch(() => setError("퀴즈를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuiz();
  }, [language]);

  const handleAnswer = (_selectedId: number, correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setCurrentIdx((i) => i + 1);
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-400 text-lg">퀴즈 준비 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 text-center">
        <p className="text-gray-500 mt-20 text-lg">{error}</p>
      </div>
    );
  }

  const completed = currentIdx >= questions.length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">퀴즈</h1>
        <LanguageToggle />
      </div>

      {!completed && (
        <ProgressBar current={currentIdx + 1} total={questions.length} className="mb-6" />
      )}

      {completed ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "🎉" : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">퀴즈 완료!</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 inline-block">
            <p className="text-5xl font-bold text-indigo-600">
              {score} <span className="text-xl text-gray-400">/ {questions.length}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              정답률 {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
          <br />
          <button
            onClick={fetchQuiz}
            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold active:scale-95 transition-transform"
          >
            다시 도전
          </button>
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
