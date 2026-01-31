"use client";

import { useRef, useCallback, useState } from "react";

interface SwipeState {
  offsetX: number;
  swiping: boolean;
  direction: "left" | "right" | null;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 100 }: UseSwipeOptions) {
  const startX = useRef(0);
  const currentOffsetX = useRef(0);
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    swiping: false,
    direction: null,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentOffsetX.current = 0;
    setState({ offsetX: 0, swiping: true, direction: null });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    currentOffsetX.current = dx;
    const direction = dx > 0 ? "right" : dx < 0 ? "left" : null;
    setState({ offsetX: dx, swiping: true, direction });
  }, []);

  const handleTouchEnd = useCallback(() => {
    const dx = currentOffsetX.current;
    if (dx > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dx < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    currentOffsetX.current = 0;
    setState({ offsetX: 0, swiping: false, direction: null });
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return {
    ...state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    style: {
      transform: state.swiping
        ? `translateX(${state.offsetX}px) rotate(${state.offsetX * 0.05}deg)`
        : "translateX(0) rotate(0)",
      transition: state.swiping ? "none" : "transform 0.3s ease",
    },
  };
}
