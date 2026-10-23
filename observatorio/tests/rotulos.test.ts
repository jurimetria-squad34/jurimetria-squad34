import { describe, expect, test } from "vitest";
import { descreverUniverso, rotularMateria } from "../src/lib/rotulos.ts";

describe("rotularMateria", () => {
  test("traduz um código conhecido", () => {
    expect(rotularMateria("penal")).toBe("Direito penal");
    expect(rotularMateria("processual_civil")).toBe("Direito processual civil");
  });

  test("null vira 'Sem matéria informada' (decisão sem matéria registrada)", () => {
    expect(rotularMateria(null)).toBe("Sem matéria informada");
  });

  test('"outro" é diferente de null (matéria registrada como "outra", não ausente)', () => {
    expect(rotularMateria("outro")).toBe("Outras matérias");
    expect(rotularMateria("outro")).not.toBe(rotularMateria(null));
  });

  test("um código desconhecido aparece como veio, em vez de sumir da tela", () => {
    expect(rotularMateria("codigo-novo-que-ainda-nao-mapeamos")).toBe("codigo-novo-que-ainda-nao-mapeamos");
  });
});

describe("descreverUniverso", () => {
  test("junta tribunal, classe e matéria", () => {
    expect(descreverUniverso("STJ", "HC", "penal")).toBe("STJ, classe HC, direito penal");
  });

  test("decisão sem matéria registrada aparece como tal", () => {
    expect(descreverUniverso("STF", "ARE", null)).toBe("STF, classe ARE, sem matéria informada");
  });

  test("mostra as grafias unificadas só quando há mais de uma", () => {
    expect(descreverUniverso("STJ", "REsp", "civil", ["REsp", "RESP"])).toBe(
      "STJ, classe REsp (grafias unificadas: REsp, RESP), direito civil",
    );
    expect(descreverUniverso("STJ", "HC", "penal", ["HC"])).toBe("STJ, classe HC, direito penal");
  });
});