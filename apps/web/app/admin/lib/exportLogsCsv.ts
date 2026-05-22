import type { LogSistemaItem } from "@/app/lib/admin";

/** Exporta linhas visíveis da página atual para CSV (download no browser). */
export function downloadLogsCsv(items: LogSistemaItem[], filenamePrefix = "logs-auditoria") {
  if (items.length === 0) return false;

  const escape = (v: string) => {
    const s = v.replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };

  const header = ["id", "timestamp", "acao", "userName", "userId", "jsonDados"];
  const rows = items.map((log) =>
    [
      String(log.id),
      log.timestamp ?? "",
      log.acao,
      log.userName ?? "",
      log.userId ?? "",
      log.jsonDados ?? "",
    ]
      .map(escape)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenamePrefix}-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
