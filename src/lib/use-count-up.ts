import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start: number | null = null;
    let rafId: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);
  return val;
}
