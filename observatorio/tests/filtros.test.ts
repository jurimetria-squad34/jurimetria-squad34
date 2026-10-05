import { describe, expect, test } from "vitest";
import {
  classesDisponiveis,
  encontrarRecorte,
  materiasDisponiveis,
  recortePadrao,
  tribunaisDisponiveis,
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