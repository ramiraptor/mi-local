import { describe, expect, it } from "vitest";
import { escapeCsvCell, toCsv } from "@/lib/csv";

describe("escapeCsvCell — protección CSV formula injection (Anexo §5.8)", () => {
  it("prefija apóstrofo a valores que inician con = + - @", () => {
    expect(escapeCsvCell("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(escapeCsvCell("+56912345678")).toBe("'+56912345678");
    expect(escapeCsvCell("-100")).toBe("'-100");
    expect(escapeCsvCell("@import")).toBe("'@import");
  });

  it("prefija también tab y CR iniciales", () => {
    expect(escapeCsvCell("\t=cmd")).toMatch(/^"?'/);
  });

  it("no altera valores normales", () => {
    expect(escapeCsvCell("Local comercial")).toBe("Local comercial");
    expect(escapeCsvCell(123456)).toBe("123456");
    expect(escapeCsvCell(true)).toBe("true");
  });

  it("NULL se distingue de 0 y de texto vacío", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
    expect(escapeCsvCell(0)).toBe("0");
  });

  it("encierra en comillas y escapa comillas internas", () => {
    expect(escapeCsvCell('Local "El Rincón", Ñuñoa')).toBe('"Local ""El Rincón"", Ñuñoa"');
    expect(escapeCsvCell("línea1\nlínea2")).toBe('"línea1\nlínea2"');
  });

  it("serializa multivalor con convención pipe", () => {
    expect(escapeCsvCell(["Ñuñoa", "Providencia"])).toBe("Ñuñoa|Providencia");
  });

  it("fechas en ISO 8601", () => {
    expect(escapeCsvCell(new Date("2026-11-04T12:00:00Z"))).toBe("2026-11-04T12:00:00.000Z");
  });
});

describe("toCsv", () => {
  it("genera BOM UTF-8, cabeceras y CRLF", () => {
    const csv = toCsv(["id", "nombre"], [["u1", "Pérez"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("id,nombre\r\n");
    expect(csv).toContain("u1,Pérez\r\n");
  });
});
