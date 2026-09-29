import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { lerObservatorio, normalizarDados } from "../scripts/ler-dados.ts";
import type { ObservatorioData } from "../src/types/observatorio.ts";

/** Um arquivo pequeno, no mesmo formato do observatorio.json real, só para os testes. */
function montarDadosDeExemplo(): ObservatorioData {
  return {
    gerado_em: "2026-09-23T15:21:20.992Z",
    criterio: "Favorável = concedido, provido ou parcial.",
    universo: { tribunais: ["STF", "STJ"], decisoes: 190, de: 2020, ate: 2026 },
    mensal: [
      { tribunal: "STJ", materia: "civil", classe: "REsp", mes: "2025-01", total: 100, favoraveis: 40 },
      { tribunal: "STJ", materia: "civil", classe: "RESP", mes: "2025-02", total: 30, favoraveis: 10 },
      { tribunal: "STJ", materia: "civil", classe: "REsp", mes: "2026-09", total: 60, favoraveis: 2 },
    ],
    relatores: [
      { tribunal: "STJ", materia: "civil", classe: "RESP", relator: "MIN. FULANO", ano: 2025, total: 30, favoraveis: 10, contrarios: 18, outros: 2 },
    ],
  };
}

describe("normalizarDados", () => {
  test("junta grafias diferentes da mesma classe, mantendo a de maior volume", () => {
    const resultado = normalizarDados(montarDadosDeExemplo());
    const classesResultantes = new Set(resultado.mensal.map((l) => l.classe));
    expect(classesResultantes).toEqual(new Set(["REsp"]));
  });

  test("guarda a grafia original em classeOriginal, sem perder o dado", () => {
    const resultado = normalizarDados(montarDadosDeExemplo());
    const linhaResp = resultado.mensal.find((l) => l.mes === "2025-02")!;
    expect(linhaResp.classe).toBe("REsp");
    expect(linhaResp.classeOriginal).toBe("RESP");
  });

  test("aplica a mesma unificação de classe também em relatores", () => {
    const resultado = normalizarDados(montarDadosDeExemplo());
    expect(resultado.relatores[0].classe).toBe("REsp");
    expect(resultado.relatores[0].classeOriginal).toBe("RESP");
  });

  test("marca como emAndamento só o mês igual ao de gerado_em", () => {
    const resultado = normalizarDados(montarDadosDeExemplo());
    const porMes = new Map(resultado.mensal.map((l) => [l.mes, l.emAndamento]));
    expect(porMes.get("2026-09")).toBe(true);
    expect(porMes.get("2025-01")).toBe(false);
    expect(porMes.get("2025-02")).toBe(false);
  });
});

describe("lerObservatorio", () => {
  const pasta = mkdtempSync(join(tmpdir(), "observatorio-teste-"));
  afterAll(() => rmSync(pasta, { recursive: true, force: true }));

  test("lê um arquivo válido normalmente", () => {
    const caminho = join(pasta, "valido.json");
    writeFileSync(caminho, JSON.stringify(montarDadosDeExemplo()));
    const dados = lerObservatorio(caminho);
    expect(dados.universo.decisoes).toBe(190);
    expect(dados.mensal).toHaveLength(3);
  });

  test("recusa um arquivo em que a soma de 'total' não bate com universo.decisoes", () => {
    const exemplo = montarDadosDeExemplo();
    exemplo.universo.decisoes = 999; // errado de propósito
    const caminho = join(pasta, "invalido.json");
    writeFileSync(caminho, JSON.stringify(exemplo));
    expect(() => lerObservatorio(caminho)).toThrow(/inconsistente/);
  });

  test("recusa um arquivo sem a chave 'criterio'", () => {
    const exemplo = montarDadosDeExemplo() as Partial<ObservatorioData>;
    delete exemplo.criterio;
    const caminho = join(pasta, "sem-criterio.json");
    writeFileSync(caminho, JSON.stringify(exemplo));
    expect(() => lerObservatorio(caminho)).toThrow(/falta a chave "criterio"/);
  });
});