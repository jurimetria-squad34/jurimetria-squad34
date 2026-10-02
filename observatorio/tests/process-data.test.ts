import { describe, expect, test } from "vitest";
import { agruparPorRecorte, montarSaida, sanitizarNomeArquivo, montarResumo } from "../scripts/process-data.ts";
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

  test("o manifesto lista os três recortes, com o total de decisões e favoráveis certos", () => {
    const { manifesto } = montarSaida(montarDadosDeExemplo());
    expect(manifesto.recortes).toHaveLength(3);
    const civil = manifesto.recortes.find((r) => r.materia === "civil")!;
    expect(civil.totalDecisoes).toBe(80); 
    expect(civil.totalFavoraveis).toBe(30); 
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

function montarDadosParaResumo(): ObservatorioNormalizado {
  return {
    gerado_em: "2026-06-01T00:00:00.000Z", // ano de referência: 2026
    criterio: "Favorável = concedido, provido ou parcial.",
    universo: { tribunais: ["STF", "STJ"], decisoes: 400, de: 2010, ate: 2026 },
    mensal: [
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "civil", mes: "2025-03", total: 100, favoraveis: 40, emAndamento: false },
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "penal", mes: "2025-03", total: 50, favoraveis: 10, emAndamento: false },
      { tribunal: "STJ", classe: "REsp", classeOriginal: "REsp", materia: "civil", mes: "2026-01", total: 20, favoraveis: 5, emAndamento: true },
      { tribunal: "STJ", classe: "HC", classeOriginal: "HC", materia: "penal", mes: "2025-05", total: 30, favoraveis: 15, emAndamento: false },
      { tribunal: "STF", classe: "RE", classeOriginal: "RE", materia: "constitucional", mes: "2005-01", total: 200, favoraveis: 50, emAndamento: false },
      { tribunal: "STF", classe: "RE", classeOriginal: "RE", materia: "constitucional", mes: "2025-02", total: 60, favoraveis: 30, emAndamento: false },
    ],
    relatores: [],
  };
}

describe("montarResumo", () => {
  test("porTribunal soma TODO o período, incluindo o ano de 2005 fora da janela", () => {
    const resumo = montarResumo(montarDadosParaResumo());
    const stf = resumo.porTribunal.find((t) => t.tribunal === "STF")!;
    expect(stf.total).toBe(260); 
  });

  test("porAno NÃO inclui o ano de 2005 (fora da janela de anos do resumo)", () => {
    const resumo = montarResumo(montarDadosParaResumo());
    const anosStf = resumo.porAno.filter((p) => p.tribunal === "STF").map((p) => p.ano);
    expect(anosStf).not.toContain(2005);
    expect(anosStf).toContain(2025);
  });

  test("porAno marca 2026 (o ano de gerado_em) como emAndamento, e só ele", () => {
    const resumo = montarResumo(montarDadosParaResumo());
    for (const ponto of resumo.porAno) {
      expect(ponto.emAndamento).toBe(ponto.ano === 2026);
    }
  });

  test("topClasses junta as matérias da mesma classe, e ordena por volume (maior primeiro)", () => {
    const resumo = montarResumo(montarDadosParaResumo());
    const resp = resumo.topClasses.find((c) => c.tribunal === "STJ" && c.classe === "REsp")!;
    expect(resp.total).toBe(170); 
    const ordemPorTotal = resumo.topClasses.map((c) => c.total);
    expect(ordemPorTotal).toEqual([...ordemPorTotal].sort((a, b) => b - a));
  });

  test("topClasses não corta nenhuma classe quando há 8 ou menos no total", () => {
    const resumo = montarResumo(montarDadosParaResumo());
    expect(resumo.topClasses).toHaveLength(3);
  });
});