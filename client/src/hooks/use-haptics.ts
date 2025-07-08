import { useCallback } from "react";

export function useHaptics() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      // Progressive enhancement for different feedback types
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 10, 10],
        warning: [20, 10, 20],
        error: [50, 10, 50]
      };
      
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic };
}