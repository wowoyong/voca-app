"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "kakao") {
      setError("카카오 로그인에 실패했습니다");
    }
  }, [searchParams]);

  const handleKakaoLogin = () => {
    window.location.href = "/api/auth/kakao";
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="bg-card border rounded-3xl shadow-lg p-8 w-full max-w-sm">
        {/* 앱 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/icon.jpg"
              alt="Wordio"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* 앱 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Wordio</h1>
          <p className="text-muted-foreground text-base">영어/일본어 단어공부</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        )}

        {/* 카카오 로그인 버튼 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full h-14 rounded-xl bg-[#FEE500] text-[#000000] font-semibold flex items-center justify-center gap-3 hover:bg-[#FDD835] active:scale-[0.98] transition-all shadow-md"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.76 1.915 5.184 4.677 6.566-.167.735-.619 2.629-.691 2.966-.084.403.15.398.332.289.135-.082 2.113-1.421 3.098-2.065.517.074 1.05.112 1.584.112 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
          </svg>
          카카오톡으로 3초 만에 시작
        </button>

        {/* 약관 링크 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            로그인하면{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">
              이용약관
            </a>
            {" "}및{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              개인정보처리방침
            </a>
            에<br />동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
