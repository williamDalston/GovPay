"use client";

import { useRef, useEffect, useState } from "react";

interface AnimatedBarProps {
  percentage: number;
  colorClass: string;
}

export function AnimatedBar({ percentage, colorClass }: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setWidth(percentage));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(percentage), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [percentage]);

  return (
    <div ref={ref} className="mt-1 h-2 rounded-full bg-navy-800">
      <div
        className={`h-2 rounded-full ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
