
import { useEffect, useRef, useState } from "react";

export default function useThrottle<T>(
  value: T,
  limit: number
): T {
  const [throttledValue, setThrottledValue] =
    useState<T>(value);

  const lastUpdatedAt = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const remainingTime =
      limit - (now - lastUpdatedAt.current);

    if (remainingTime <= 0) {
      setThrottledValue(value);
      lastUpdatedAt.current = now;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setThrottledValue(value);
      lastUpdatedAt.current = Date.now();
    }, remainingTime);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, limit]);

  return throttledValue;
}
