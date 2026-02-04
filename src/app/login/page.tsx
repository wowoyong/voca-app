"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "voca-saved-credentials";

function LoginForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [savedCreds, setSavedCreds] = useState<{ username: string; password: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const creds = JSON.parse(saved);
        if (creds.username) {
          setSavedCreds(creds);
          setUsername(creds.username);
          setPassword(creds.password || "");
          setRemember(true);
        }
      }
    } catch {}

    const errorParam = searchParams.get("error");
    if (errorParam === "kakao") {
      setError("카카오 로그인에 실패했습니다");
    }
  }, [searchParams]);

  const switchTab = (newTab: "login" | "register") => {
    setTab(newTab);
    setError("");
    if (newTab === "register") {
      setUsername("");
      setPassword("");
    } else if (savedCreds) {
      setUsername(savedCreds.username);
      setPassword(savedCreds.password || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: tab,
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (remember) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: username.trim(), password }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "오류가 발생했습니다");
      }
    } catch {
      setError("연결 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = "/api/auth/kakao";
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Voca</h1>
          <p className="text-muted-foreground text-sm">단어 학습 웹앱</p>
        </div>

        <div className="flex mb-6 bg-secondary rounded-lg p-1">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              className="w-full h-11 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete={tab === "register" ? "new-password" : "current-password"}
              className="w-full h-11 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          {tab === "login" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => {
                  setRemember(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem(STORAGE_KEY);
                    setSavedCreds(null);
                  }
                }}
                className="w-4 h-4 rounded border-border accent-foreground"
              />
              <span className="text-sm text-muted-foreground">아이디 / 비밀번호 기억</span>
            </label>
          )}

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password || loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "처리 중..." : tab === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full h-11 rounded-lg bg-[#FEE500] text-[#000000] font-medium flex items-center justify-center gap-2 hover:bg-[#FEE500]/90 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.76 1.915 5.184 4.677 6.566-.167.735-.619 2.629-.691 2.966-.084.403.15.398.332.289.135-.082 2.113-1.421 3.098-2.065.517.074 1.05.112 1.584.112 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
          </svg>
          카카오톡으로 3초 만에 시작
        </button>
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
