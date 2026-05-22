"use client";

import { useState, useEffect } from "react";

/**
 * Anima um número de 0 até `target` quando `enabled` passa a true.
 * Usa easing ease-out cúbico para uma sensação suave.
 */
export function useCountUp(
  target: number,
  enabled: boolean,
  durationMs = 900
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (target === 0) {
      setValue(0);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, durationMs]);

  return value;
}
