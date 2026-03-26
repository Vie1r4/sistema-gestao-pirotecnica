"use client";

import Link from "next/link";

/**
 * Error boundary que substitui o layout completo quando ocorre um erro (incluindo no root layout).
 * Inclui html/body porque em caso de erro o layout não é renderizado.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8f7f5" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              width: "100%",
              padding: "2rem",
              borderRadius: "1rem",
              border: "1px solid #e7e5e4",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: "#1c1917" }}>
              Ocorreu um erro
            </h1>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#57534e" }}>
              Algo correu mal. Pode voltar ao início ou tentar novamente.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: "#f97316",
                  color: "#000",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                }}
              >
                Tentar novamente
              </button>
              <Link
                href="/"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  border: "1px solid #d6d3d1",
                  borderRadius: "0.75rem",
                  color: "#444",
                  textDecoration: "none",
                }}
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
