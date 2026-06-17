import { useState, useRef, useCallback } from 'react';

// ============================================================
// HOOK: usePullToRefresh
// ============================================================
export function usePullToRefresh(onRefresh, scrollContainerRef) {
  const [pullDistance, setPullDistance]   = useState(0);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const touchStartY                        = useRef(null);
  const isDragging                         = useRef(false);

  const THRESHOLD = 80; // px to trigger refresh

  const handleTouchStart = useCallback((e) => {
    const el = scrollContainerRef.current;
    if (el && el.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      isDragging.current  = true;
    }
  }, [scrollContainerRef]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      // Rubber-band resistance: feels natural
      setPullDistance(Math.min(delta * 0.45, THRESHOLD * 1.5));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(0);
      await onRefresh();
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = null;
  }, [pullDistance, onRefresh, THRESHOLD]);

  return { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, THRESHOLD };
}