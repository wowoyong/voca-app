"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("잘못된 PIN입니다");
        setPin("");
      }
    } catch {
      setError("연결 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d: string) => {
    if (pin.length < 6) setPin(pin + d);
  };

  const removeDigit = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voca</h1>
          <p className="text-gray-500 text-sm">PIN을 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  pin.length > i ? "bg-indigo-500 scale-110" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => addDigit(String(n))}
                className="h-14 rounded-xl bg-gray-100 text-xl font-semibold text-gray-800 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                {n}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => addDigit("0")}
              className="h-14 rounded-xl bg-gray-100 text-xl font-semibold text-gray-800 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={removeDigit}
              className="h-14 rounded-xl bg-gray-100 text-lg text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            disabled={pin.length < 4 || loading}
            className="w-full h-12 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
