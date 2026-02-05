"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    adfit?: {
      display: (unitId: string) => void;
    };
  }
}

/** AdFit 전면 광고 컴포넌트 - 세션당 1회 표시 */
export default function AdInterstitial() {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // 광고 단위 ID가 없으면 표시 안 함
    const unitId = process.env.NEXT_PUBLIC_ADFIT_INTERSTITIAL_UNIT_ID;
    if (!unitId || unitId === "DAN-yyyyy") return;

    // 세션당 1회만 표시
    const shown = sessionStorage.getItem("adfit_interstitial_shown");
    if (shown) return;

    // 광고 표시
    setShow(true);
    sessionStorage.setItem("adfit_interstitial_shown", "true");

    // 카운트다운
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShow(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 3초 후 닫기 버튼 활성화
    const closeTimer = setTimeout(() => {
      setCanClose(true);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(closeTimer);
    };
  }, []);

  useEffect(() => {
    if (!show) return;

    const unitId = process.env.NEXT_PUBLIC_ADFIT_INTERSTITIAL_UNIT_ID;
    if (!unitId) return;

    // AdFit 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    script.onload = () => {
      if (window.adfit) {
        window.adfit.display(unitId);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [show]);

  if (!show) return null;

  // 사용자가 광고 닫기 버튼 클릭 시 처리
  const handleClose = () => {
    if (canClose) {
      setShow(false);
    }
  };

  const unitId = process.env.NEXT_PUBLIC_ADFIT_INTERSTITIAL_UNIT_ID;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 animate-in fade-in duration-300">
      {/* 카운트다운 */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-bold text-sm">
          {countdown}
        </div>
        {canClose && (
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 font-medium text-sm transition-colors"
          >
            광고 닫기 ✕
          </button>
        )}
      </div>

      {/* 광고 영역 */}
      <div className="w-full max-w-md mx-4 bg-white rounded-lg overflow-hidden shadow-2xl">
        <div
          id={`adfit-interstitial-${unitId}`}
          className="w-full min-h-[300px] flex items-center justify-center"
        >
          {/* AdFit 광고가 여기에 로드됩니다 */}
          <div className="text-gray-400 text-sm">광고 로딩 중...</div>
        </div>
      </div>
    </div>
  );
}
