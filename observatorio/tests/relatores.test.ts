import { describe, expect, test } from "vitest";
import { agregarPorRelator } from "../src/lib/relatores.ts";
import type { LinhaRelator } from "../src/types/recorte.ts";

function linha(relator: string, ano: number, total: number, favoraveis: number): LinhaRelator {
  return { relator, ano, total, favoraveis, contrarios: total - favoraveis, outros: 0 };
}

describe("agregarPorRelator", () => {
  const anosAnteriores = [2020, 2021, 2022] as const;
  const anosRecentes = [2023, 2024, 2025] as const;

  test("soma o total e os favoráveis do relator em todos os anos", () => {
    const linhas = [linha("MIN. FULANO", 2023, 100, 40), linha("MIN. FULANO", 2024, 50, 10)];
    const [agregado] = agregarPorRelator(linhas, anosAnteriores, anosRecentes);
    expect(agregado.total).toBe(150);
    expect(agregado.favoraveis).toBe(50);
  });

  test("um ano fora das duas janelas entra no total, mas não em nenhuma janela", () => {
    const linhas = [
      linha("MIN. FULANO", 2015, 200, 80), 
      linha("MIN. FULANO", 2023, 100, 40), 
    ];
    const [agregado] = agregarPorRelator(linhas, anosAnteriores, anosRecentes);
    expect(agregado.total).toBe(300); 
    expect(agregado.janelaRecente).toEqual({ total: 100, favoraveis: 40 });
    expect(agregado.janelaAnterior).toEqual({ total: 0, favoraveis: 0 }); 
  });

  test("separa corretamente janela anterior e janela recente", () => {
    const linhas = [
      linha("MIN. FULANO", 2021, 90, 30), 
      linha("MIN. FULANO", 2024, 110, 55), 
    ];
    const [agregado] = agregarPorRelator(linhas, anosAnteriores, anosRecentes);
    expect(agregado.janelaAnterior).toEqual({ total: 90, favoraveis: 30 });
    expect(agregado.janelaRecente).toEqual({ total: 110, favoraveis: 55 });
  });

  test("não mistura linhas de relatores diferentes", () => {
    const linhas = [linha("MIN. FULANO", 2023, 100, 40), linha("MIN. CICLANA", 2023, 50, 10)];
    const agregados = agregarPorRelator(linhas, anosAnteriores, anosRecentes);
    expect(agregados).toHaveLength(2);
    expect(agregados.find((a) => a.relator === "MIN. FULANO")?.total).toBe(100);
    expect(agregados.find((a) => a.relator === "MIN. CICLANA")?.total).toBe(50);
  });

  test("ordena do relator com mais decisões para o com menos", () => {
    const linhas = [linha("MIN. POUCO", 2023, 30, 10), linha("MIN. MUITO", 2023, 300, 100)];
    const agregados = agregarPorRelator(linhas, anosAnteriores, anosRecentes);
    expect(agregados.map((a) => a.relator)).toEqual(["MIN. MUITO", "MIN. POUCO"]);
  });
});