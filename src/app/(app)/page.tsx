"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

interface HomeStats {
  reviewDue: number;
  streak: number;
  totalLearned: number;
  userId?: number;
}

const quickActions = [
  { href: "/today", label: "오늘의 학습", icon: "📖", color: "from-blue-500 to-indigo-600" },
  { href: "/flashcard", label: "플래시카드", icon: "🃏", color: "from-purple-500 to-pink-600" },
  { href: "/quiz", label: "퀴즈", icon: "❓", color: "from-amber-500 to-orange-600" },
  { href: "/review", label: "복습", icon: "🔄", color: "from-green-500 to-emerald-600" },
];

export default function HomePage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<HomeStats | null>(null);

  useEffect(() => {
    fetch(`/api/learning-record?lang=${language}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [language]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voca</h1>
          <p className="text-sm text-gray-500">
            {language === "en" ? "영어" : "일본어"} 학습
          </p>
        </div>
        <LanguageToggle />
      </div>

      {/* Streak & Stats Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">연속 학습</p>
            <p className="text-4xl font-bold">{stats?.streak ?? 0}일</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-80">
              학습 단어 <span className="font-semibold">{stats?.totalLearned ?? 0}</span>
            </p>
            <p className="text-sm opacity-80">
              복습 대기 <span className="font-semibold text-yellow-300">{stats?.reviewDue ?? 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">빠른 시작</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`bg-gradient-to-br ${action.color} rounded-2xl p-5 text-white shadow-md active:scale-[0.97] transition-transform`}
          >
            <span className="text-3xl block mb-2">{action.icon}</span>
            <span className="font-semibold text-sm">{action.label}</span>
            {action.href === "/review" && stats?.reviewDue ? (
              <span className="ml-1 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">
                {stats.reviewDue}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
