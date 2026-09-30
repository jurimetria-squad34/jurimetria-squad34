import { describe, expect, test } from "vitest";
import { formatarPercentual } from "../src/lib/formato.ts";

describe("formatarPercentual", () => {
  test("formata com vírgula decimal e uma casa, estilo brasileiro", () => {
    expect(formatarPercentual(0.381)).toBe("38,1%");
  });

  test("arredonda em vez de truncar", () => {
    expect(formatarPercentual(0.4249)).toBe("42,5%"); 
  });

  test("funciona em 0% e 100%", () => {
    expect(formatarPercentual(0)).toBe("0,0%");
    expect(formatarPercentual(1)).toBe("100,0%");
  });
});