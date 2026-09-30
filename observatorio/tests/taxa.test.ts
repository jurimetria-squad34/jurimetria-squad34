import { describe, expect, test } from "vitest";
import { calcularTaxa, LIMITE_BASE_PEQUENA } from "../src/lib/taxa.ts";

describe("calcularTaxa", () => {
  test("calcula a taxa normalmente quando há 30 decisões ou mais", () => {
    const resultado = calcularTaxa(100, 40);
    expect(resultado).toEqual({ status: "ok", taxa: 0.4, total: 100, favoraveis: 40 });
  });

  test(`retorna "base pequena" com menos de ${LIMITE_BASE_PEQUENA} decisões`, () => {
    const resultado = calcularTaxa(29, 10);
    expect(resultado).toEqual({ status: "base-pequena", total: 29 });
  });

  test(`o limite de ${LIMITE_BASE_PEQUENA} decisões já conta como base suficiente (regra é "menos de", não "até")`, () => {
    const resultado = calcularTaxa(LIMITE_BASE_PEQUENA, 15);
    expect(resultado.status).toBe("ok");
  });

  test("recusa favoráveis maior que o total (dado inconsistente)", () => {
    expect(() => calcularTaxa(10, 11)).toThrow(/não pode ser maior/);
  });

  test("aceita total zero, como base pequena e não como divisão por zero", () => {
    const resultado = calcularTaxa(0, 0);
    expect(resultado).toEqual({ status: "base-pequena", total: 0 });
  });
});