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
  {
    href: "/today",
    label: "오늘의 학습",
    description: "새 단어와 표현 학습",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: "/flashcard",
    label: "빈칸 채우기",
    description: "학습한 단어 빈칸 테스트",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    href: "/quiz",
    label: "퀴즈",
    description: "4지선다 실력 테스트",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
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

  const hasReviewDue = (stats?.reviewDue ?? 0) > 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Voca</h1>
          <p className="text-sm text-muted-foreground">
            {language === "en" ? "영어" : "일본어"} 학습
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <LanguageToggle />
        </div>
      </div>

      {/* 연속 학습 카드 */}
      <div className="bg-card border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">연속 학습</p>
            <p className="text-4xl font-bold text-foreground">{stats?.streak ?? 0}<span className="text-lg font-normal text-muted-foreground ml-1">일</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              학습 단어 <span className="font-semibold text-foreground">{stats?.totalLearned ?? 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 복습 CTA 배너 */}
      {hasReviewDue && (
        <Link
          href="/review"
          className="block bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-800 text-sm">복습할 단어가 있어요</p>
                <p className="text-xs text-orange-600">{stats?.reviewDue}개 단어가 복습을 기다리고 있습니다</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-3">빠른 시작</h2>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-card border rounded-2xl p-4 active:scale-[0.98] transition-transform hover:bg-accent flex items-center gap-4"
          >
            <div className="text-foreground shrink-0">{action.icon}</div>
            <div className="flex-1">
              <span className="font-semibold text-sm text-foreground block">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
