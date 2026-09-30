/**
 * Roda o script de build contra o dados/observatorio.json de verdade e confere números conhecidos
 */
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { lerObservatorio, normalizarDados } from "../scripts/ler-dados.ts";
import { montarSaida } from "../scripts/process-data.ts";

const caminhoDadosReais = fileURLToPath(new URL("../dados/observatorio.json", import.meta.url));

describe("process-data com o arquivo real", () => {
  test("gera um número razoável de recortes (nem 1, nem 100 mil)", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const { arquivos } = montarSaida(dados);
    expect(arquivos.size).toBeGreaterThan(1000);
    expect(arquivos.size).toBeLessThan(5000);
  });

  test("nenhum arquivo passa de 200 KB (limite de segurança para o Lighthouse mobile)", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const { arquivos } = montarSaida(dados);
    for (const [nomeArquivo, conteudo] of arquivos) {
      const tamanhoKB = JSON.stringify(conteudo).length / 1024;
      expect(tamanhoKB, `${nomeArquivo} tem ${tamanhoKB.toFixed(1)} KB`).toBeLessThan(200);
    }
  });

  test("a soma de 'total' de todos os recortes bate com universo.decisoes", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const { manifesto } = montarSaida(dados);
    const somaRecortes = manifesto.recortes.reduce((soma, r) => soma + r.totalDecisoes, 0);
    expect(somaRecortes).toBe(dados.universo.decisoes);
  });

  test("o recorte STJ + REsp + civil existe e tem o formato esperado", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const { arquivos } = montarSaida(dados);
    const recorte = arquivos.get("recortes/STJ-REsp-civil.json");
    expect(recorte).toBeDefined();
    expect(recorte!.classeOriginais).toContain("REsp");
    expect(recorte!.mensal.length).toBeGreaterThan(0);
    expect(Object.keys(recorte!.mensal[0]).sort()).toEqual(["emAndamento", "favoraveis", "mes", "total"]);
  });
});