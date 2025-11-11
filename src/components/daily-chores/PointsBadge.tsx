import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

interface PointsBadgeProps {
  totalPoints: number;
}

export function PointsBadge({ totalPoints }: PointsBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPointsRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const componentMountTimeRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceMount = now - componentMountTimeRef.current;

    // Skip animation for first 3 seconds after component mount to avoid initial data loading animations
    if (timeSinceMount < 3000) {
      prevPointsRef.current = totalPoints;
      return;
    }

    // Skip animation on first render/initialization
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevPointsRef.current = totalPoints;
      return;
    }

    // Trigger animation only when points increase (not on initial load)
    if (prevPointsRef.current !== null && totalPoints > prevPointsRef.current) {
      setIsAnimating(true);
      // Reset animation after it completes (0.8s to match the keyframe duration)
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
    prevPointsRef.current = totalPoints;
  }, [totalPoints]);

  return (
    <Badge
      variant="secondary"
      className="text-lg p-4 text-white dark:text-black"
      data-testid="points-badge"
    >
      <span className={`text-3xl align-middle ${isAnimating ? 'animate-star-celebrate' : ''}`}>
        ⭐
      </span>{' '}
      {totalPoints} points earned today
    </Badge>
  );
}
