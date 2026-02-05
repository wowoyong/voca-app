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
  const isDragging = useRef(false);
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    swiping: false,
    direction: null,
  });

  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    currentOffsetX.current = 0;
    isDragging.current = true;
    setState({ offsetX: 0, swiping: true, direction: null });
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const dx = clientX - startX.current;
    currentOffsetX.current = dx;
    const direction = dx > 0 ? "right" : dx < 0 ? "left" : null;
    setState({ offsetX: dx, swiping: true, direction });
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = currentOffsetX.current;
    if (dx > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dx < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    currentOffsetX.current = 0;
    setState({ offsetX: 0, swiping: false, direction: null });
  }, [threshold, onSwipeLeft, onSwipeRight]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      handleEnd();
    }
  }, [handleEnd]);

  return {
    ...state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      transform: state.swiping
        ? `translateX(${state.offsetX}px) rotate(${state.offsetX * 0.05}deg)`
        : "translateX(0) rotate(0)",
      transition: state.swiping ? "none" : "transform 0.3s ease",
    },
  };
}
