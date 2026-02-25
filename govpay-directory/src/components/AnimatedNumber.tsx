"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: string;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    // Extract numeric part (e.g., "$85,432" -> 85432, "2,431" -> 2431)
    const numericStr = value.replace(/[^0-9.]/g, "");
    const target = parseFloat(numericStr);
    if (isNaN(target) || target === 0) return;

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.disconnect();

        const duration = 600;
        const start = performance.now();

        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);

          // Reconstruct the formatted string by replacing the numeric portion
          setDisplay(
            value.replace(numericStr, current.toLocaleString("en-US"))
          );

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setDisplay(value);
          }
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
