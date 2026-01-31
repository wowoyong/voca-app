"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import StatsCalendar from "@/components/StatsCalendar";
import LanguageToggle from "@/components/LanguageToggle";

interface StatsData {
  reviewDue: number;
  streak: number;
  totalLearned: number;
  calendar: { date: string; count: number }[];
  quizAccuracy: number;
  totalQuizzes: number;
}

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
        <div className="text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">학습 통계</h1>
        <LanguageToggle />
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">학습 달력</h2>
        <StatsCalendar data={stats?.calendar || []} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 mb-1">학습 단어</p>
          <p className="text-3xl font-bold text-indigo-600">{stats?.totalLearned ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 mb-1">퀴즈 정확도</p>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalQuizzes ? `${Math.round(stats.quizAccuracy)}%` : "-"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 mb-1">연속 학습</p>
          <p className="text-3xl font-bold text-orange-500">{stats?.streak ?? 0}일</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs text-gray-500 mb-1">복습 예정</p>
          <p className="text-3xl font-bold text-red-500">{stats?.reviewDue ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
