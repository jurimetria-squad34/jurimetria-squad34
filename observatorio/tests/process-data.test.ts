import { describe, expect, test } from "vitest";
import { agruparPorRecorte, montarSaida, sanitizarNomeArquivo } from "../scripts/process-data.ts";
import type { ObservatorioNormalizado } from "../scripts/ler-dados.ts";

function montarDadosDeExemplo(): ObservatorioNormalizado {
  return {
    gerado_em: "2026-09-23T15:21:20.992Z",
    criterio: "Favorável = concedido, provido ou parcial.",
    universo: { tribunais: ["STF", "STJ"], decisoes: 100, de: 2020, ate: 2026 },
    mensal: [
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "civil", mes: "2025-01", total: 50, favoraveis: 20, emAndamento: false },
      { tribunal: "STJ", classe: "REsp", classeOriginal: "RESP", materia: "civil", mes: "2025-02", total: 30, favoraveis: 10, emAndamento: false },
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "penal", mes: "2025-01", total: 10, favoraveis: 4, emAndamento: false },
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: null, mes: "2025-01", total: 10, favoraveis: 1, emAndamento: false },
    ],
    relatores: [
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "civil", relator: "MIN. FULANO", ano: 2025, total: 30, favoraveis: 10, contrarios: 18, outros: 2 },
    ],
  };
}

describe("agruparPorRecorte", () => {
  test("separa por matéria, mesmo sendo a mesma classe", () => {
    const grupos = agruparPorRecorte(montarDadosDeExemplo());
    expect(grupos.size).toBe(3);
  });

  test("junta as duas linhas de matéria civil (REsp e RESP) no mesmo grupo", () => {
    const grupos = agruparPorRecorte(montarDadosDeExemplo());
    const civil = grupos.get("STJ::REsp::civil")!;
    expect(civil.mensal).toHaveLength(2);
    expect(civil.classeOriginais).toEqual(new Set(["REsp", "RESP"]));
  });

  test("linhas de relatores entram no mesmo grupo das linhas mensais equivalentes", () => {
    const grupos = agruparPorRecorte(montarDadosDeExemplo());
    const civil = grupos.get("STJ::REsp::civil")!;
    expect(civil.relatores).toHaveLength(1);
  });
});

describe("montarSaida", () => {
  test("cria um arquivo por recorte, com o nome esperado", () => {
    const { arquivos } = montarSaida(montarDadosDeExemplo());
    expect([...arquivos.keys()].sort()).toEqual([
      "recortes/STJ-REsp-civil.json",
      "recortes/STJ-REsp-penal.json",
      "recortes/STJ-REsp-sem-materia.json",
    ]);
  });

  test("cada arquivo não repete tribunal/classe/matéria linha a linha", () => {
    const { arquivos } = montarSaida(montarDadosDeExemplo());
    const civil = arquivos.get("recortes/STJ-REsp-civil.json")!;
    expect(civil.tribunal).toBe("STJ");
    expect(civil.classe).toBe("REsp");
    expect(civil.materia).toBe("civil");
    expect(civil.mensal[0]).toEqual({ mes: "2025-01", total: 50, favoraveis: 20, emAndamento: false });
  });

  test("mensal sai ordenado por mês", () => {
    const { arquivos } = montarSaida(montarDadosDeExemplo());
    const civil = arquivos.get("recortes/STJ-REsp-civil.json")!;
    expect(civil.mensal.map((l) => l.mes)).toEqual(["2025-01", "2025-02"]);
  });

  test("o manifesto lista os três recortes, com o total de decisões certo", () => {
    const { manifesto } = montarSaida(montarDadosDeExemplo());
    expect(manifesto.recortes).toHaveLength(3);
    const civil = manifesto.recortes.find((r) => r.materia === "civil")!;
    expect(civil.totalDecisoes).toBe(80); 
  });

  test("o manifesto carrega gerado_em, criterio e universo do arquivo original", () => {
    const { manifesto } = montarSaida(montarDadosDeExemplo());
    expect(manifesto.geradoEm).toBe("2026-09-23T15:21:20.992Z");
    expect(manifesto.criterio).toBe("Favorável = concedido, provido ou parcial.");
    expect(manifesto.universo.decisoes).toBe(100);
  });

  test("recusa dois recortes que gerariam o mesmo nome de arquivo", () => {
    const dados = montarDadosDeExemplo();
    dados.mensal.push({
      tribunal: "STJ",
      classe: "É",
      classeOriginal: "É",
      materia: "civil",
      mes: "2025-01",
      total: 5,
      favoraveis: 1,
      emAndamento: false,
    });
    dados.mensal.push({
      tribunal: "STJ",
      classe: "E",
      classeOriginal: "E",
      materia: "civil",
      mes: "2025-01",
      total: 5,
      favoraveis: 1,
      emAndamento: false,
    });
    expect(() => montarSaida(dados)).toThrow(/nome de arquivo duplicado/);
  });
});

describe("sanitizarNomeArquivo", () => {
  test("tira acento, mantendo o resto do texto", () => {
    expect(sanitizarNomeArquivo("PETIÇÃO")).toBe("PETICAO");
    expect(sanitizarNomeArquivo("EXECUÇ")).toBe("EXECUC");
  });

  test("não mexe em texto que já não tem acento", () => {
    expect(sanitizarNomeArquivo("REsp")).toBe("REsp");
    expect(sanitizarNomeArquivo("ED-RESP")).toBe("ED-RESP");
  });
});