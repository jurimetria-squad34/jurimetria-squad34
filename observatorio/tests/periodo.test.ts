import { describe, expect, test } from "vitest";
import {
  formatarFaixaDeAnos,
  formatarPeriodo,
  periodoDoMensal,
  periodoDosRelatores,
} from "../src/lib/periodo.ts";
import type { LinhaMensal, LinhaRelator } from "../src/types/recorte.ts";

const mes = (m: string, emAndamento = false): LinhaMensal => ({ mes: m, total: 100, favoraveis: 40, emAndamento });
const relator = (ano: number): LinhaRelator => ({ relator: "X", ano, total: 50, favoraveis: 20, contrarios: 25, outros: 5 });

describe("formatarPeriodo", () => {
  test("mostra de que ano a que ano", () => {
    expect(formatarPeriodo(2015, 2026)).toBe("2015–2026");
  });

  test("avisa quando o último ano ainda está em andamento", () => {
    expect(formatarPeriodo(2015, 2026, 2026)).toBe("2015–2026 (2026 em andamento)");
  });

  test("não avisa se o ano em andamento não é o último", () => {
    expect(formatarPeriodo(2015, 2025, 2026)).toBe("2015–2025");
  });

  test("um ano só não vira faixa", () => {
    expect(formatarPeriodo(2024, 2024)).toBe("2024");
  });
});

describe("periodoDoMensal", () => {
  test("usa o primeiro e o último ano da série, mesmo fora de ordem", () => {
    expect(periodoDoMensal([mes("2020-05"), mes("1999-01"), mes("2021-12")])).toBe("1999–2021");
  });

  test("marca o ano do mês em andamento", () => {
    expect(periodoDoMensal([mes("2024-11"), mes("2025-01"), mes("2025-02", true)])).toBe("2024–2025 (2025 em andamento)");
  });

  test("série vazia não inventa período", () => {
    expect(periodoDoMensal([])).toBe("sem dados");
  });
});

describe("periodoDosRelatores", () => {
  test("usa o menor e o maior ano das linhas", () => {
    expect(periodoDosRelatores([relator(2018), relator(2015), relator(2024)])).toBe("2015–2024");
  });

  test("marca o ano em andamento quando ele é o último", () => {
    expect(periodoDosRelatores([relator(2025), relator(2026)], 2026)).toBe("2025–2026 (2026 em andamento)");
  });

  test("sem linhas, diz que não há dados", () => {
    expect(periodoDosRelatores([])).toBe("sem dados");
  });
});

describe("formatarFaixaDeAnos", () => {
  test("três anos seguidos viram uma faixa", () => {
    expect(formatarFaixaDeAnos([2023, 2024, 2025])).toBe("2023–2025");
  });

  test("lista vazia vira texto vazio", () => {
    expect(formatarFaixaDeAnos([])).toBe("");
  });
});