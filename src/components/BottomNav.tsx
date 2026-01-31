"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/today", label: "오늘", icon: "📖" },
  { href: "/flashcard", label: "빈칸", icon: "✏️" },
  { href: "/quiz", label: "퀴즈", icon: "❓" },
  { href: "/stats", label: "통계", icon: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors ${
                active ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className={active ? "font-semibold" : ""}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
