import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, normalizeCspHeader } from "@/lib/csp";

describe("buildContentSecurityPolicy", () => {
  it("inclui nonce em script-src e style-src em produção", () => {
    const policy = buildContentSecurityPolicy("abc123", false);
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(policy).toContain("style-src 'self' 'nonce-abc123'");
    expect(policy).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("permite unsafe-eval (script) e unsafe-inline (style) só em desenvolvimento", () => {
    const policy = buildContentSecurityPolicy("devnonce", true);
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).not.toMatch(/style-src[^;]*nonce/);
  });

  it("inclui tiles OpenStreetMap e connect-src API", () => {
    const policy = buildContentSecurityPolicy("n", false);
    expect(policy).toContain("https://*.tile.openstreetmap.org");
    expect(policy).toContain("connect-src");
  });
});

describe("normalizeCspHeader", () => {
  it("colapsa espaços e newlines", () => {
    expect(normalizeCspHeader("default-src  'self';\n  script-src 'self'")).toBe(
      "default-src 'self'; script-src 'self'"
    );
  });
});
