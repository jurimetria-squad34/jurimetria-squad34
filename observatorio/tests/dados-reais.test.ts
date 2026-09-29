/**
 * Testes de integração: rodam contra o dados/observatorio.json de verdade, não
 * contra um exemplo fabricado.
 */
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { lerObservatorio, normalizarDados } from "../scripts/ler-dados.ts";

const caminhoDadosReais = fileURLToPath(new URL("../dados/observatorio.json", import.meta.url));

describe("dados/observatorio.json (arquivo real)", () => {
  test("passa na validação de lerObservatorio", () => {
    const dados = lerObservatorio(caminhoDadosReais);
    expect(dados.universo.tribunais).toEqual(["STF", "STJ"]);
  });

  test("normalizarDados junta as grafias conhecidas de classe do STJ", () => {
    const dados = lerObservatorio(caminhoDadosReais);
    const resultado = normalizarDados(dados);
    const classesStj = new Set(resultado.mensal.filter((l) => l.tribunal === "STJ").map((l) => l.classe));

    for (const grafiaAntiga of ["RESP", "AGRG", "EDCL"]) {
      expect(classesStj.has(grafiaAntiga)).toBe(false);
    }
    for (const grafiaOficial of ["REsp", "AgRg", "EDcl"]) {
      expect(classesStj.has(grafiaOficial)).toBe(true);
    }
  });

  test("marca exatamente um mês como emAndamento, igual ao mês de gerado_em", () => {
    const dados = lerObservatorio(caminhoDadosReais);
    const resultado = normalizarDados(dados);
    const mesesEmAndamento = new Set(
      resultado.mensal.filter((l) => l.emAndamento).map((l) => l.mes),
    );
    expect(mesesEmAndamento).toEqual(new Set([dados.gerado_em.slice(0, 7)]));
  });
});