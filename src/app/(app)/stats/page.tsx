"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import StatsCalendar from "@/components/StatsCalendar";
import LanguageToggle from "@/components/LanguageToggle";

interface StatsData {
  reviewDue: number;
  streak: number;
  totalLearned: number;
  calendar: { 
    date: string; 
    count: number;
    todayCompleted?: boolean;
    reviewCompleted?: boolean;
    quizCompleted?: boolean;
  }[];
  quizAccuracy: number;
  totalQuizzes: number;
}

/** 학습 통계 페이지 - 연속 학습, 달력, 정확도 표시 */
export default function StatsPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/learning-record?lang=${language}`).then((r) => r.json()),
      fetch(`/api/stats?lang=${language}`).then((r) => r.json()).catch(() => ({
        calendar: [],
        quizAccuracy: 0,
        totalQuizzes: 0,
      })),
    ])
      .then(([recordData, statsData]) => {
        setStats({
          reviewDue: recordData.reviewDue || 0,
          streak: recordData.streak || 0,
          totalLearned: recordData.totalLearned || 0,
          calendar: statsData.calendar || [],
          quizAccuracy: statsData.quizAccuracy || 0,
          totalQuizzes: statsData.totalQuizzes || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">학습 통계</h1>
        <LanguageToggle />
      </div>

      {/* Streak Card - Emphasized */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">연속 학습 일수</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{stats?.streak ?? 0}</span>
              <span className="text-2xl font-medium">일</span>
            </div>
            {(stats?.streak ?? 0) > 0 && (
              <p className="text-sm opacity-80 mt-2">
                {stats?.streak === 1 ? "좋은 시작이에요!" : 
                 stats?.streak && stats.streak < 7 ? "계속 이어가세요!" :
                 stats?.streak && stats.streak < 30 ? "대단해요! 🎉" :
                 "놀라워요! 🏆"}
              </p>
            )}
          </div>
          <div className="text-6xl">🔥</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-2xl border p-4 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">학습 달력</h2>
        <StatsCalendar data={stats?.calendar || []} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-xs text-muted-foreground mb-1">학습 단어</p>
          <p className="text-2xl font-bold text-foreground">{stats?.totalLearned ?? 0}</p>
        </div>
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-xs text-muted-foreground mb-1">퀴즈 정확도</p>
          <p className="text-2xl font-bold text-green-600">
            {stats?.totalQuizzes ? `${Math.round(stats.quizAccuracy)}%` : "-"}
          </p>
        </div>
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-xs text-muted-foreground mb-1">복습 예정</p>
          <p className="text-2xl font-bold text-red-500">{stats?.reviewDue ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
