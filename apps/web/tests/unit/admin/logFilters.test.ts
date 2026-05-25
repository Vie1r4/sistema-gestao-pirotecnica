import { describe, expect, it } from "vitest";
import {
  LOG_TIPO_OPTIONS,
  matchLogTipoId,
} from "@/app/admin/lib/logEntityFilter";

describe("logEntityFilter", () => {
  it("matchLogTipoId só para keyword exata do atalho", () => {
    expect(matchLogTipoId("CRIAD")).toBe("criad");
    expect(matchLogTipoId("criad")).toBe("criad");
    expect(matchLogTipoId("ENCOMENDA_CRIADA")).toBeNull();
    expect(matchLogTipoId("")).toBeNull();
  });

  it("atalhos de tipo usam keywords da API (Contains)", () => {
    expect(LOG_TIPO_OPTIONS.map((o) => o.keyword)).toEqual(["CRIAD", "EDIT", "REJEIT"]);
  });
});
