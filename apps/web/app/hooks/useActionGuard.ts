"use client";

import { useRef, useCallback } from "react";

/**
 * Guard anti-duplo-submit.
 *
 * Uso:
 *   const guard = useActionGuard();
 *
 *   const handleSubmit = async () => {
 *     if (!guard.begin()) return;   // já em curso, cancela
 *     try { await doAction(); }
 *     finally { guard.end(); }
 *   };
 *
 *   const busy = guard.isBlocked(mutation.isPending);
 */
export function useActionGuard() {
  const inProgress = useRef(false);

  const begin = useCallback((): boolean => {
    if (inProgress.current) return false;
    inProgress.current = true;
    return true;
  }, []);

  const end = useCallback((): void => {
    inProgress.current = false;
  }, []);

  /**
   * Retorna `true` se o guard ou a mutation estiverem ativos.
   * Usado para desativar botões: `disabled={guard.isBlocked(mutation.isPending)}`
   */
  const isBlocked = useCallback((externalPending = false): boolean => {
    return inProgress.current || externalPending;
  }, []);

  return { begin, end, isBlocked };
}
