/**
 * Roda o script de build contra o dados/observatorio.json de verdade e confere números conhecidos
 */
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { lerObservatorio, normalizarDados } from "../scripts/ler-dados.ts";
import { montarResumo, montarSaida } from "../scripts/process-data.ts";

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

describe("montarResumo com o arquivo real", () => {
  test("marca exatamente um ano como emAndamento, igual ao ano de gerado_em", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const resumo = montarResumo(dados);
    const anoReferencia = Number(dados.gerado_em.slice(0, 4));
    const anosEmAndamento = new Set(resumo.porAno.filter((p) => p.emAndamento).map((p) => p.ano));
    expect(anosEmAndamento).toEqual(new Set([anoReferencia]));
  });

  test("topClasses tem no máximo 8 classes, ordenadas da maior para a menor", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const resumo = montarResumo(dados);
    expect(resumo.topClasses.length).toBeLessThanOrEqual(8);
    const totais = resumo.topClasses.map((c) => c.total);
    expect(totais).toEqual([...totais].sort((a, b) => b - a));
  });

  test("porTribunalVolume tem STJ e STF, e a soma dos dois bate com universo.decisoes", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const resumo = montarResumo(dados);
    expect(resumo.porTribunalVolume.map((t) => t.tribunal).sort()).toEqual(["STF", "STJ"]);
    const soma = resumo.porTribunalVolume.reduce((s, t) => s + t.total, 0);
    expect(soma).toBe(dados.universo.decisoes);
  });

  test("porAno nunca mistura duas classes diferentes no mesmo tribunal", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const resumo = montarResumo(dados);
    const classesPorTribunal = new Map<string, Set<string>>();
    for (const ponto of resumo.porAno) {
      if (!classesPorTribunal.has(ponto.tribunal)) classesPorTribunal.set(ponto.tribunal, new Set());
      classesPorTribunal.get(ponto.tribunal)!.add(ponto.classe);
    }
    for (const [tribunal, classes] of classesPorTribunal) {
      expect(classes.size, `${tribunal} tem mais de uma classe em porAno: ${[...classes].join(", ")}`).toBe(1);
    }
    expect(classesPorTribunal.get("STJ")).toEqual(new Set(["AREsp"]));
    expect(classesPorTribunal.get("STF")).toEqual(new Set(["ARE"]));
  });

  test("resumo.json fica bem pequeno", () => {
    const dados = normalizarDados(lerObservatorio(caminhoDadosReais));
    const resumo = montarResumo(dados);
    const tamanhoKB = JSON.stringify(resumo).length / 1024;
    expect(tamanhoKB).toBeLessThan(20);
  });
});