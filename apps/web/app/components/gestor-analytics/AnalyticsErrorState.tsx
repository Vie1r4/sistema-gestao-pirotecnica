"use client";

/** Erro de carregamento em widgets de analytics (distinto de lista vazia). */
export default function AnalyticsErrorState({
  message = "Não foi possível carregar os dados. Verifique se o servidor está disponível.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
