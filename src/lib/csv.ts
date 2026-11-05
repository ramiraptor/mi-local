// Generación de CSV: UTF-8 (con BOM para Excel), cabeceras estables
// versionadas, IDs como texto, fechas ISO 8601 y protección contra
// CSV formula injection (prefijo ' a valores que inician con = + - @).

const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s: string;
  if (value instanceof Date) {
    s = value.toISOString();
  } else if (Array.isArray(value)) {
    s = value.join("|"); // convención documentada para multivalor
  } else if (typeof value === "object") {
    s = JSON.stringify(value);
  } else {
    s = String(value);
  }

  const first = s.charAt(0);
  if (FORMULA_TRIGGERS.includes(first)) {
    s = "'" + s;
  }

  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r") || s.includes(";")) {
    s = '"' + s.replaceAll('"', '""') + '"';
  }
  return s;
}

export function toCsv(headers: readonly string[], rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  // BOM para que Excel/Sheets reconozcan UTF-8 (acentos correctos)
  return "﻿" + lines.join("\r\n") + "\r\n";
}
