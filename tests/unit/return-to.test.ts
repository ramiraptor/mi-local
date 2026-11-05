import { describe, expect, it } from "vitest";
import { safeReturnTo } from "@/lib/return-to";

describe("safeReturnTo — solo rutas internas whitelisted (PRD 04)", () => {
  it("acepta rutas internas permitidas", () => {
    expect(safeReturnTo("/explorar")).toBe("/explorar");
    expect(safeReturnTo("/propiedad/123e4567-e89b-12d3-a456-426614174000")).toContain("/propiedad/");
    expect(safeReturnTo("/perfil")).toBe("/perfil");
    expect(safeReturnTo("/mis-locales")).toBe("/mis-locales");
    expect(safeReturnTo(encodeURIComponent("/explorar?tipo=OFICINA"))).toBe("/explorar?tipo=OFICINA");
  });

  it("rechaza redirecciones externas y esquemas", () => {
    expect(safeReturnTo("https://evil.com")).toBeNull();
    expect(safeReturnTo("//evil.com")).toBeNull();
    expect(safeReturnTo("/\\evil.com")).toBeNull();
    expect(safeReturnTo("javascript:alert(1)")).toBeNull();
    expect(safeReturnTo("/explorar://x")).toBeNull();
  });

  it("rechaza rutas internas fuera de la whitelist", () => {
    expect(safeReturnTo("/api/admin/export/intereses")).toBeNull();
    expect(safeReturnTo("/auth/confirm")).toBeNull();
  });

  it("tolera entradas corruptas", () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo("%ZZ")).toBeNull();
    expect(safeReturnTo("")).toBeNull();
  });
});
