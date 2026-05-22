import { useCallback, useEffect, useRef } from "react";

/**
 * Ctrl + roda do rato na zona do gráfico: impede zoom da página e chama onStep.
 * O listener fica no próprio elemento (capture), não na window.
 */
export function attachCtrlWheelZone(
  node: HTMLElement,
  onStep: (zoomIn: boolean) => void
): () => void {
  const onStepRef = { current: onStep };
  onStepRef.current = onStep;

  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    onStepRef.current(e.deltaY < 0);
  };

  node.addEventListener("wheel", onWheel, { passive: false, capture: true });

  return () => {
    node.removeEventListener("wheel", onWheel, true);
  };
}

/** Ref callback + cleanup para zonas montadas condicionalmente (ex. após loading). */
export function useChartCtrlWheelZoneRef(onStep: (zoomIn: boolean) => void) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const setZoneRef = useCallback((node: HTMLDivElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!node) return;

    cleanupRef.current = attachCtrlWheelZone(node, (zoomIn) => {
      onStepRef.current(zoomIn);
    });
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return setZoneRef;
}
