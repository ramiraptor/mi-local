import { describe, expect, it } from "vitest";
import { daysSince, formatCLP } from "@/lib/format";

describe("formato es-CL", () => {
  it("CLP sin decimales", () => {
    const s = formatCLP(1500000);
    expect(s).toContain("1.500.000");
    expect(s).toContain("$");
  });

  it("null se muestra como —, no como $0", () => {
    expect(formatCLP(null)).toBe("—");
    expect(formatCLP(0)).not.toBe("—");
  });

  it("daysSince calcula días transcurridos", () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 86_400_000).toISOString();
    expect(daysSince(fortyDaysAgo)).toBe(40);
    expect(daysSince(null)).toBeNull();
  });
});
