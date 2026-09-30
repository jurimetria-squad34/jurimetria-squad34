import { describe, expect, test } from "vitest";
import { calcularJanelasDeAnos, calcularTendencia, formatarTendencia } from "../src/lib/tendencia.ts";

describe("calcularTendencia", () => {
  test("compara a taxa agregada das duas janelas, não a média das taxas anuais", () => {
    const anterior = { total: 300, favoraveis: 90 }; 
    const recente = { total: 850, favoraveis: 340 }; 
    const resultado = calcularTendencia(anterior, recente);
    expect(resultado).toEqual({
      status: "ok",
      taxaAnterior: 0.3,
      taxaRecente: 0.4,
      diferencaPontosPercentuais: 10,
    });
  });

  test('retorna "base pequena" se a janela anterior tiver poucas decisões', () => {
    const resultado = calcularTendencia({ total: 20, favoraveis: 5 }, { total: 500, favoraveis: 200 });
    expect(resultado).toEqual({ status: "base-pequena" });
  });

  test('retorna "base pequena" se a janela recente tiver poucas decisões', () => {
    const resultado = calcularTendencia({ total: 500, favoraveis: 200 }, { total: 20, favoraveis: 5 });
    expect(resultado).toEqual({ status: "base-pequena" });
  });

  test("detecta queda (diferença negativa)", () => {
    const resultado = calcularTendencia({ total: 100, favoraveis: 50 }, { total: 100, favoraveis: 40 });
    expect(resultado).toEqual({
      status: "ok",
      taxaAnterior: 0.5,
      taxaRecente: 0.4,
      diferencaPontosPercentuais: -10,
    });
  });
});

describe("formatarTendencia", () => {
  test("formata alta com seta para cima e sinal de mais", () => {
    const resultado = calcularTendencia({ total: 1000, favoraveis: 381 }, { total: 1000, favoraveis: 423 });
    expect(formatarTendencia(resultado)).toBe("▲ +4,2 p.p. (38,1% → 42,3%)");
  });

  test("formata queda com seta para baixo e sinal de menos", () => {
    const resultado = calcularTendencia({ total: 1000, favoraveis: 500 }, { total: 1000, favoraveis: 400 });
    expect(formatarTendencia(resultado)).toBe("▼ -10,0 p.p. (50,0% → 40,0%)");
  });

  test('mostra "base pequena" como texto, sem número', () => {
    const resultado = calcularTendencia({ total: 5, favoraveis: 1 }, { total: 1000, favoraveis: 400 });
    expect(formatarTendencia(resultado)).toBe("base pequena");
  });
});

describe("calcularJanelasDeAnos", () => {
  test("reproduz o exemplo exato que o Bruno deu (dados de 2026)", () => {
    const { anosRecentes, anosAnteriores } = calcularJanelasDeAnos(2026);
    expect(anosRecentes).toEqual([2023, 2024, 2025]);
    expect(anosAnteriores).toEqual([2020, 2021, 2022]);
  });

  test("desloca corretamente para outro ano de referência", () => {
    const { anosRecentes, anosAnteriores } = calcularJanelasDeAnos(2027);
    expect(anosRecentes).toEqual([2024, 2025, 2026]);
    expect(anosAnteriores).toEqual([2021, 2022, 2023]);
  });
});