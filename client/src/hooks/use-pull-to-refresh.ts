import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHaptics } from "./use-haptics";

export function usePullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const queryClient = useQueryClient();
  const { triggerHaptic } = useHaptics();
  const startY = useRef(0);
  const pullThreshold = 80;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      if (diff > 0) {
        e.preventDefault();
        setPullDistance(Math.min(diff, pullThreshold * 1.5));
        
        // Haptic feedback when reaching threshold
        if (diff >= pullThreshold && pullDistance < pullThreshold) {
          triggerHaptic('medium');
        }
      }
    }
  }, [pullThreshold, pullDistance, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      // Refresh all cached data
      await queryClient.invalidateQueries();
      
      // Add a small delay for better UX
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  }, [pullDistance, pullThreshold, isRefreshing, queryClient, triggerHaptic]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / pullThreshold, 1)
  };
}