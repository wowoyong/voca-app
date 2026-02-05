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

/** 좌우 스와이프 제스처 감지 훅 - 터치 및 마우스 이벤트 처리 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 100 }: UseSwipeOptions) {
  const startX = useRef(0);
  const currentOffsetX = useRef(0);
  const isDragging = useRef(false);
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    swiping: false,
    direction: null,
  });

  // 드래그 시작 위치 기록
  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    currentOffsetX.current = 0;
    isDragging.current = true;
    setState({ offsetX: 0, swiping: true, direction: null });
  }, []);

  // 드래그 중 오프셋과 방향 계산
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const dx = clientX - startX.current;
    currentOffsetX.current = dx;
    const direction = dx > 0 ? "right" : dx < 0 ? "left" : null;
    setState({ offsetX: dx, swiping: true, direction });
  }, []);

  // 드래그 종료 시 임계값 초과 여부에 따라 스와이프 콜백 실행
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

  // 터치 시작 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  // 터치 이동 핸들러
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  // 터치 종료 핸들러
  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 마우스 클릭 시작 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  // 마우스 클릭 종료 핸들러
  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 마우스가 영역을 벗어나면 드래그 종료 처리
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
