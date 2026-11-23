import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { reconhecerProcessos } from "../src/parser.ts";

const arquivo = join(
    dirname(fileURLToPath(import.meta.url)),
    "../exemplos/numeros-reais-de-ementas.txt",
);

const linhas = readFileSync(arquivo, "utf8")
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

const SIGLAS = [
    "AREsp",
    "REsp",
    "RHC",
    "AgInt",
    "AgRg",
    "EDcl",
    "ADPF",
    "ADI",
    "ARE",
    "RMS",
    "Rcl",
    "CC",
    "MS",
    "RE",
    "HC",
];

const CNJ = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
const siglaNaLinha = new RegExp(`\\b(?:${SIGLAS.join("|")})\\b`, "gi");

function ultimaSigla(linha: string): string {
    const encontradas = [...linha.matchAll(siglaNaLinha)];
    const bruta = encontradas.at(-1)?.[0];
    const canonica = SIGLAS.find((sigla) => sigla.toLowerCase() === bruta?.toLowerCase());
    if (!canonica) {
        throw new Error(`Sem classe em: ${linha}`);
    }
    return canonica;
}

function numeroDaLinha(linha: string): string {
    const semUf = linha.replace(/\/[A-Za-z]{2}$/i, "");
    const match = semUf.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*$/);
    if (!match) {
        throw new Error(`Sem número em: ${linha}`);
    }
    return match[1].replace(/\./g, "");
}

const casosReais: Array<[string, string, string, string | null]> = [
    ["HC 176.473/RR", "HC", "176473", "RR"],
    ["AREsp n. 880.709/PR", "AREsp", "880709", "PR"],
    ["AgRg no AREsp n. 575.696/MG", "AREsp", "575696", "MG"],
    ["RHC 75.641/RJ", "RHC", "75641", "RJ"],
    ["REsp n. 2.225.712/SP", "REsp", "2225712", "SP"],
    ["REsp 1.683.930", "REsp", "1683930", null],
    ["AgRg no HC 629.625/SP", "HC", "629625", "SP"],
    ["AgRg no HC 942.889", "HC", "942889", null],
    ["AgInt no AREsp 1.650.251/RS", "AREsp", "1650251", "RS"],
    ["AgInt no AREsp n. 2.365.596/RJ", "AREsp", "2365596", "RJ"],
    ["AgInt no AREsp n. 2.250.305", "AREsp", "2250305", null],
    ["AgRg no RHC n. 174.022/SP", "RHC", "174022", "SP"],
    ["HC n. 95.269/SC", "HC", "95269", "SC"],
    ["AgRg no CC n. 153.692/RJ", "CC", "153692", "RJ"],
    ["CC n. 199.298/RS", "CC", "199298", "RS"],
    ["AgRg no CC n. 197.970/PA", "CC", "197970", "PA"],
    ["EDcl no CC n. 199.241/RN", "CC", "199241", "RN"],
    ["AgInt no CC n. 178.566/SP", "CC", "178566", "SP"],
    ["AgInt no CC n. 178.235/SP", "CC", "178235", "SP"],
    ["EDcl no AREsp n. 2.262.586/SP", "AREsp", "2262586", "SP"],
    ["EDcl no AREsp 2.314.270/SP", "AREsp", "2314270", "SP"],
    ["EDcl no REsp n. 1.903.029/SP", "REsp", "1903029", "SP"],
    ["AgInt no REsp n. 2.056.945/SP", "REsp", "2056945", "SP"],
    ["AgInt no REsp 1.669.141/MG", "REsp", "1669141", "MG"],
    ["AgRg no REsp n. 2.049.194/RS", "REsp", "2049194", "RS"],
    ["AgRg no RHC n. 83.205/PE", "RHC", "83205", "PE"],
    ["REsp 154.518/PE", "REsp", "154518", "PE"],
    ["AREsp 800.235/PE", "AREsp", "800235", "PE"],
];

const classesDoEscopo: Array<[string, string, string, string | null]> = [
    ["Rcl 45.987", "Rcl", "45987", null],
    ["MS 12.345/DF", "MS", "12345", "DF"],
    ["RMS 36.789/SP", "RMS", "36789", "SP"],
    ["ARE 1.322.772", "ARE", "1322772", null],
    ["RE 35.917", "RE", "35917", null],
    ["RE 10.532/SP", "RE", "10532", "SP"],
    ["ADI 7.265/DF", "ADI", "7265", "DF"],
    ["ADPF 760", "ADPF", "760", null],
    ["AgRg 123.456/SP", "AgRg", "123456", "SP"],
    ["AgInt n. 10.000/RJ", "AgInt", "10000", "RJ"],
    ["EDcl 9.999", "EDcl", "9999", null],
    ["HC 176473/RR", "HC", "176473", "RR"],
    ["HC 1000028", "HC", "1000028", null],
    ["REsp 2090350", "REsp", "2090350", null],
    ["EDcl no AgRg no AREsp n. 1.234.567/SP", "AREsp", "1234567", "SP"],
    ["agrg no aresp n. 575.696/mg", "AREsp", "575696", "MG"],
];

const naoReconhece = [
    "10/03/2025",
    "10.03.2025",
    "27/03/2026",
    "123.456.789-00",
    "CPF 123.456.789-00",
    "p. 12",
    "pp. 12-14",
    "fls. 20",
    "art. 5º",
    "art. 121 do Código Penal",
    "Art. 5º da Constituição",
    "Lei n. 8.906/94",
    "Súmula 7 do STJ",
    "HC",
    "AgRg no 123.456",
    "HC 10.03.2025",
    "",
];

function esperaProcesso(texto: string, classe: string, numero: string, uf: string | null) {
    assert.deepEqual(reconhecerProcessos(texto), [
        {
            tipo: "processo",
            classe,
            numero,
            uf,
            texto,
            inicio: 0,
            fim: texto.length,
        },
    ]);
}

describe("números reais das ementas", () => {
    it("lê o arquivo de exemplos", () => {
        assert.ok(linhas.length >= 140);
    });

    for (const linha of linhas) {
        it(`reconhece ${linha}`, () => {
            const [referencia] = reconhecerProcessos(linha);
            assert.equal(referencia?.texto, linha);
            assert.equal(referencia?.inicio, 0);
            assert.equal(referencia?.fim, linha.length);

            if (CNJ.test(linha)) {
                assert.equal(referencia?.tipo, "cnj");
                assert.equal(referencia && referencia.tipo === "cnj" ? referencia.numero : undefined, linha);
                return;
            }

            assert.equal(referencia?.tipo, "processo");
            if (referencia?.tipo !== "processo") {
                return;
            }
            assert.equal(referencia.classe, ultimaSigla(linha));
            assert.equal(referencia.numero, numeroDaLinha(linha));
            assert.equal(referencia.uf, linha.match(/\/([A-Za-z]{2})$/)?.[1] ?? null);
        });
    }

    for (const [texto, classe, numero, uf] of casosReais) {
        it(`${texto} consulta ${classe} ${numero}`, () => {
            esperaProcesso(texto, classe, numero, uf);
        });
    }
});

describe("classes do escopo", () => {
    for (const [texto, classe, numero, uf] of classesDoEscopo) {
        it(`${texto} consulta ${classe} ${numero}`, () => {
            esperaProcesso(texto, classe, numero, uf);
        });
    }

    for (const numero of [
        "0001135-13.2021.8.19.0000",
        "0041795-17.2019.8.19.0001",
        "2307086-46.2022.8.26.0000",
    ]) {
        it(`mostra o CNJ ${numero} sem tratar como classe`, () => {
            assert.deepEqual(reconhecerProcessos(numero), [
                {
                    tipo: "cnj",
                    numero,
                    texto: numero,
                    inicio: 0,
                    fim: numero.length,
                },
            ]);
        });
    }
});

describe("o que não é número de processo", () => {
    for (const texto of naoReconhece) {
        it(`ignora ${JSON.stringify(texto)}`, () => {
            assert.deepEqual(reconhecerProcessos(texto), []);
        });
    }

    it("no meio da frase, só fica o processo", () => {
        const fonte =
            "Conforme o art. 121 e a Lei n. 8.906/94, no HC 176.473/RR, publicado em 10/03/2025, CPF 123.456.789-00, p. 12.";

        assert.deepEqual(
            reconhecerProcessos(fonte).map((referencia) => referencia.texto),
            ["HC 176.473/RR"],
        );
    });
});

describe("texto com várias referências", () => {
    it("devolve na ordem do texto, com classe, número e CNJ separados", () => {
        const fonte =
            "0001135-13.2021.8.19.0000; citado o AgRg no HC 629.625/SP e o REsp 1.683.930, em 10/03/2025.";
        const referencias = reconhecerProcessos(fonte);

        assert.deepEqual(
            referencias.map((referencia) => referencia.texto),
            ["0001135-13.2021.8.19.0000", "AgRg no HC 629.625/SP", "REsp 1.683.930"],
        );
        assert.deepEqual(
            referencias.map((referencia) => fonte.slice(referencia.inicio, referencia.fim)),
            referencias.map((referencia) => referencia.texto),
        );
        assert.equal(referencias[0]?.tipo, "cnj");
        assert.deepEqual(
            referencias[1] && referencias[1].tipo === "processo"
                ? {
                      classe: referencias[1].classe,
                      numero: referencias[1].numero,
                      uf: referencias[1].uf,
                  }
                : null,
            { classe: "HC", numero: "629625", uf: "SP" },
        );
        assert.deepEqual(
            referencias[2] && referencias[2].tipo === "processo"
                ? {
                      classe: referencias[2].classe,
                      numero: referencias[2].numero,
                      uf: referencias[2].uf,
                  }
                : null,
            { classe: "REsp", numero: "1683930", uf: null },
        );
    });

    it("não engole o ponto final da frase", () => {
        const fonte = "Veja HC 176.473/RR.";
        const [referencia] = reconhecerProcessos(fonte);

        assert.equal(referencia?.texto, "HC 176.473/RR");
        assert.ok(referencia);
        assert.equal(fonte.slice(referencia.inicio, referencia.fim), "HC 176.473/RR");
    });
});
