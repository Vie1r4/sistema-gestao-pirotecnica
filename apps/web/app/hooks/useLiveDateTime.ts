"use client";

import { useEffect, useState } from "react";

/** Data/hora que atualiza ~1s; útil para comparar timestamps sem `Date.now()` no render (regra react-hooks/purity). */
export function useLiveDateTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
