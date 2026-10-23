import { describe, expect, test } from "vitest";
import {
  descreverUniverso,
  formatarNomeRelator,
  nomeCompletoRelator,
  nomeCurtoRelator,
  quebrarEmLinhas,
  rotularMateria,
} from "../src/lib/rotulos.ts";

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

describe("nomes de relator", () => {
  test("formatarNomeRelator troca CAIXA ALTA por nome próprio e deixa 'de', 'da', 'e' em minúsculas", () => {
    expect(formatarNomeRelator("MARIA THEREZA DE ASSIS MOURA")).toBe("Maria Thereza de Assis Moura");
    expect(formatarNomeRelator("JOÃO OTÁVIO DE NORONHA")).toBe("João Otávio de Noronha");
  });

  test("nomeCurtoRelator tira a observação entre parênteses", () => {
    expect(nomeCurtoRelator("ERICSON MARANHO (DESEMBARGADOR CONVOCADO DO TJ/SP)")).toBe("Ericson Maranho");
    expect(nomeCurtoRelator("NEFI CORDEIRO")).toBe("Nefi Cordeiro");
  });

  test("nomeCompletoRelator mantém a observação entre parênteses como veio", () => {
    expect(nomeCompletoRelator("ERICSON MARANHO (DESEMBARGADOR CONVOCADO DO TJ/SP)")).toBe(
      "Ericson Maranho (DESEMBARGADOR CONVOCADO DO TJ/SP)",
    );
    expect(nomeCompletoRelator("NEFI CORDEIRO")).toBe("Nefi Cordeiro");
  });
});

describe("quebrarEmLinhas", () => {
  test("nome curto fica numa linha só", () => {
    expect(quebrarEmLinhas("Nefi Cordeiro", 18, 2)).toEqual(["Nefi Cordeiro"]);
  });

  test("quebra entre palavras, sem cortar nenhuma", () => {
    expect(quebrarEmLinhas("Maria Thereza de Assis Moura", 18, 2)).toEqual(["Maria Thereza de", "Assis Moura"]);
    expect(quebrarEmLinhas("Walter de Almeida Guilherme", 18, 2)).toEqual(["Walter de Almeida", "Guilherme"]);
  });

  test("se o nome não couber em duas linhas, a última termina em reticências", () => {
    expect(quebrarEmLinhas("Fulano de Tal Beltrano Sicrano Quarto", 14, 2)).toEqual(["Fulano de Tal", "Beltrano…"]);
  });

  test("uma palavra maior que a largura não é cortada", () => {
    expect(quebrarEmLinhas("Anticonstitucionalissimamente", 10, 2)).toEqual(["Anticonstitucionalissimamente"]);
  });

  test("texto vazio não gera linhas", () => {
    expect(quebrarEmLinhas("   ", 18, 2)).toEqual([]);
  });
});