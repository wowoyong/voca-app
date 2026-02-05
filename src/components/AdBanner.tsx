"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    adfit?: {
      display: (unitId: string) => void;
    };
  }
}

/** AdFit 배너 광고 컴포넌트 - 하단에 고정 표시 */
export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unitId = process.env.NEXT_PUBLIC_ADFIT_BANNER_UNIT_ID;
    if (!unitId) return;

    // AdFit 스크립트 로드 (중복 방지)
    if (document.querySelector("script[src*='ba.min.js']")) {
      setLoaded(true);
      if (window.adfit) {
        window.adfit.display(unitId);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    script.onload = () => {
      setLoaded(true);
      if (window.adfit) {
        window.adfit.display(unitId);
      }
    };
    script.onerror = () => {
      console.error("AdFit script failed to load");
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector("script[src*='ba.min.js']");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const unitId = process.env.NEXT_PUBLIC_ADFIT_BANNER_UNIT_ID;
  if (!unitId) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="max-w-lg mx-auto h-[50px] flex items-center justify-center">
        {!loaded && (
          <div className="w-full h-full bg-muted animate-pulse" />
        )}
        <div
          id={`adfit-banner-${unitId}`}
          className="w-full h-full flex items-center justify-center"
        >
          {/* AdFit 광고가 여기에 로드됩니다 */}
        </div>
      </div>
    </div>
  );
}
