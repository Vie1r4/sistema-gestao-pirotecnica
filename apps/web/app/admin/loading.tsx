export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        <p className="text-sm text-[#78716c] dark:text-[#666]">A carregar…</p>
      </div>
    </div>
  );
}
