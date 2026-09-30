import { describe, expect, test } from "vitest";
import { rotularMateria } from "../src/lib/rotulos.ts";

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