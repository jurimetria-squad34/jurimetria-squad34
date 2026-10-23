import { describe, expect, test } from "vitest";
import {
  classesDisponiveis,
  encontrarRecorte,
  materiasDisponiveis,
  recortePadrao,
  tribunaisDisponiveis,
  resolverRecorte,
} from "../src/lib/filtros.ts";
import type { EntradaManifesto } from "../src/types/recorte.ts";

function montarRecortesDeExemplo(): EntradaManifesto[] {
  return [
    { tribunal: "STJ", classe: "REsp", materia: "civil", totalDecisoes: 100, totalFavoraveis: 40, arquivo: "recortes/STJ-REsp-civil.json" },
    { tribunal: "STJ", classe: "REsp", materia: "penal", totalDecisoes: 50, totalFavoraveis: 10, arquivo: "recortes/STJ-REsp-penal.json" },
    { tribunal: "STJ", classe: "REsp", materia: null, totalDecisoes: 10, totalFavoraveis: 1, arquivo: "recortes/STJ-REsp-sem-materia.json" },
    { tribunal: "STJ", classe: "HC", materia: "penal", totalDecisoes: 300, totalFavoraveis: 150, arquivo: "recortes/STJ-HC-penal.json" },
    { tribunal: "STF", classe: "RE", materia: "constitucional", totalDecisoes: 70, totalFavoraveis: 20, arquivo: "recortes/STF-RE-constitucional.json" },
  ];
}

describe("tribunaisDisponiveis", () => {
  test("lista os tribunais distintos, em ordem alfabética", () => {
    expect(tribunaisDisponiveis(montarRecortesDeExemplo())).toEqual(["STF", "STJ"]);
  });
});

describe("classesDisponiveis", () => {
  test("só traz classes do tribunal pedido", () => {
    expect(classesDisponiveis(montarRecortesDeExemplo(), "STJ")).toEqual(["HC", "REsp"]);
    expect(classesDisponiveis(montarRecortesDeExemplo(), "STF")).toEqual(["RE"]);
  });

  test("não repete a classe mesmo com várias matérias", () => {
    const classes = classesDisponiveis(montarRecortesDeExemplo(), "STJ");
    expect(classes.filter((c) => c === "REsp")).toHaveLength(1);
  });
});

describe("materiasDisponiveis", () => {
  test("lista as matérias daquele tribunal+classe, com null por último", () => {
    expect(materiasDisponiveis(montarRecortesDeExemplo(), "STJ", "REsp")).toEqual(["civil", "penal", null]);
  });

  test("não mistura matérias de outra classe", () => {
    expect(materiasDisponiveis(montarRecortesDeExemplo(), "STJ", "HC")).toEqual(["penal"]);
  });
});

describe("encontrarRecorte", () => {
  test("acha o recorte exato", () => {
    const recorte = encontrarRecorte(montarRecortesDeExemplo(), "STJ", "REsp", "civil");
    expect(recorte?.arquivo).toBe("recortes/STJ-REsp-civil.json");
  });

  test("acha também o recorte sem matéria (materia: null)", () => {
    const recorte = encontrarRecorte(montarRecortesDeExemplo(), "STJ", "REsp", null);
    expect(recorte?.arquivo).toBe("recortes/STJ-REsp-sem-materia.json");
  });

  test("devolve undefined pra uma combinação que não existe", () => {
    expect(encontrarRecorte(montarRecortesDeExemplo(), "STF", "HC", "civil")).toBeUndefined();
  });
});

describe("recortePadrao", () => {
  test("escolhe o de maior volume (STJ HC penal, 300 decisões)", () => {
    expect(recortePadrao(montarRecortesDeExemplo()).arquivo).toBe("recortes/STJ-HC-penal.json");
  });
});

describe("resolverRecorte", () => {
  const entrada = (tribunal: "STJ" | "STF", classe: string, materia: string | null, totalDecisoes: number): EntradaManifesto => ({
    tribunal,
    classe,
    materia,
    totalDecisoes,
    totalFavoraveis: 0,
    arquivo: `recortes/${tribunal}-${classe}-${materia ?? "sem-materia"}.json`,
  });

  const recortes: EntradaManifesto[] = [
    entrada("STJ", "REsp", "civil", 100),
    entrada("STJ", "REsp", "penal", 50),
    entrada("STJ", "REsp", null, 10),
    entrada("STJ", "HC", "penal", 300),
    entrada("STF", "HC", "penal", 20),
    entrada("STF", "HC", null, 900),
    entrada("STF", "RE", "constitucional", 70),
    entrada("STF", "AC", "civil", 80),
    entrada("STJ", "AC", "civil", 5),
  ];
  const arquivoDe = (pedido: Parameters<typeof resolverRecorte>[1]) => resolverRecorte(recortes, pedido).arquivo;

  test("pedido completo acha o recorte exato", () => {
    expect(arquivoDe({ tribunal: "STJ", classe: "REsp", materia: "penal" })).toBe("recortes/STJ-REsp-penal.json");
  });

  test("a URL do desafio, sem tribunal, funciona: ?classe=HC&materia=penal", () => {
    expect(arquivoDe({ classe: "HC", materia: "penal" })).toBe("recortes/STJ-HC-penal.json");
  });

  test("classe que existe nos dois tribunais: vence o recorte com mais decisões", () => {
    expect(arquivoDe({ classe: "AC", materia: "civil" })).toBe("recortes/STF-AC-civil.json");
    expect(arquivoDe({ classe: "HC" })).toBe("recortes/STF-HC-sem-materia.json");
  });

  test("com o tribunal pedido, só olha aquele tribunal", () => {
    expect(arquivoDe({ tribunal: "STJ", classe: "AC" })).toBe("recortes/STJ-AC-civil.json");
  });

  test("sem matéria pedida, escolhe a matéria da classe com mais decisões", () => {
    expect(arquivoDe({ tribunal: "STJ", classe: "REsp" })).toBe("recortes/STJ-REsp-civil.json");
  });

  test("matéria null pede o recorte 'sem matéria'", () => {
    expect(arquivoDe({ classe: "REsp", materia: null })).toBe("recortes/STJ-REsp-sem-materia.json");
  });

  test("não liga para maiúsculas e minúsculas e devolve a grafia certa da classe", () => {
    const recorte = resolverRecorte(recortes, { tribunal: "stj", classe: "resp", materia: "CIVIL" });
    expect(recorte.arquivo).toBe("recortes/STJ-REsp-civil.json");
    expect(recorte.classe).toBe("REsp");
  });

  test("só o tribunal: o recorte com mais decisões dele", () => {
    expect(arquivoDe({ tribunal: "STF" })).toBe("recortes/STF-HC-sem-materia.json");
    expect(arquivoDe({ tribunal: "STJ" })).toBe("recortes/STJ-HC-penal.json");
  });

  test("só a matéria: o recorte dela com mais decisões", () => {
    expect(arquivoDe({ materia: "civil" })).toBe("recortes/STJ-REsp-civil.json");
  });

  test("matéria que a classe não tem: ignora a matéria e fica com a classe", () => {
    expect(arquivoDe({ classe: "HC", materia: "civil" })).toBe("recortes/STF-HC-sem-materia.json");
    expect(arquivoDe({ tribunal: "STJ", classe: "HC", materia: "civil" })).toBe("recortes/STJ-HC-penal.json");
  });

  test("classe que não existe: cai no recorte mais volumoso do tribunal pedido", () => {
    expect(arquivoDe({ tribunal: "STF", classe: "XYZ", materia: "penal" })).toBe("recortes/STF-HC-sem-materia.json");
  });

  test("tribunal inválido é ignorado", () => {
    expect(arquivoDe({ tribunal: "TST", classe: "REsp", materia: "civil" })).toBe("recortes/STJ-REsp-civil.json");
  });

  test("pedido vazio, texto vazio ou tudo inválido: vale o recorte padrão", () => {
    const padrao = recortePadrao(recortes).arquivo;
    expect(arquivoDe({})).toBe(padrao);
    expect(arquivoDe({ tribunal: "", classe: "", materia: "" })).toBe(padrao);
    expect(arquivoDe({ classe: "XYZ", materia: "penal" })).toBe(padrao);
  });
});