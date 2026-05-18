/**
 * Loading UI global: mostrado automaticamente pelo Next.js enquanto uma rota
 * está a carregar. Substitui a necessidade de loading state em cada página.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fafafa] text-[#57534e] dark:bg-[#0a0a0a] dark:text-gray-400"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
        aria-hidden
      />
      <span className="text-sm">A carregar…</span>
    </div>
  );
}
