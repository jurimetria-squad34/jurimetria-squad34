export const CLASSES = [
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
] as const;

export type Classe = (typeof CLASSES)[number];

const PREFIXOS = ["AgInt", "AgRg", "EDcl"] as const;

const POR_NOME = new Map<string, Classe>(CLASSES.map((classe) => [classe.toLowerCase(), classe]));

export type ReferenciaProcesso = {
    tipo: "processo";
    classe: Classe;
    numero: string;
    uf: string | null;
    texto: string;
    inicio: number;
    fim: number;
};

export type ReferenciaCnj = {
    tipo: "cnj";
    numero: string;
    texto: string;
    inicio: number;
    fim: number;
};

export type Referencia = ReferenciaProcesso | ReferenciaCnj;

/**
 * A classe devolvida é a do processo.
 * Em "AgRg no AREsp n. 575.696/MG", AgRg é o recurso e a consulta usa AREsp 575696.
 * O número CNJ entra só para ser mostrado: esta versão não consulta a API.
 */
export function reconhecerProcessos(texto: string): Referencia[] {
    const achados = [...buscarProcessos(texto), ...buscarCnj(texto)];
    achados.sort((a, b) => a.inicio - b.inicio || b.fim - a.fim);

    const aceitos: Referencia[] = [];
    let fimOcupado = -1;

    for (const achado of achados) {
        if (achado.inicio < fimOcupado) {
            continue;
        }
        aceitos.push(achado);
        fimOcupado = achado.fim;
    }

    return aceitos;
}

function buscarProcessos(texto: string): ReferenciaProcesso[] {
    const prefixo = `(?:(?:${PREFIXOS.join("|")})\\s+no\\s+)*`;
    const classe = `(${CLASSES.join("|")})`;
    const numero = `(\\d{1,3}(?:\\.\\d{3})+|\\d+)(?![\\d.])`;
    const uf = `(?:/([A-Za-z]{2})(?![A-Za-z]))?(?![A-Za-z0-9/])`;
    const expressao = new RegExp(`\\b${prefixo}${classe}\\s+(?:n\\.\\s+)?${numero}${uf}`, "gi");
    const referencias: ReferenciaProcesso[] = [];

    for (const match of texto.matchAll(expressao)) {
        if (match.index === undefined) {
            continue;
        }

        const bruta = match[1];
        const canonica = POR_NOME.get(bruta.toLowerCase());
        if (!canonica) {
            continue;
        }

        referencias.push({
            tipo: "processo",
            classe: canonica,
            numero: match[2].replace(/\./g, ""),
            uf: match[3] ? match[3].toUpperCase() : null,
            texto: match[0],
            inicio: match.index,
            fim: match.index + match[0].length,
        });
    }

    return referencias;
}

function buscarCnj(texto: string): ReferenciaCnj[] {
    const expressao = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g;
    const referencias: ReferenciaCnj[] = [];

    for (const match of texto.matchAll(expressao)) {
        if (match.index === undefined) {
            continue;
        }

        referencias.push({
            tipo: "cnj",
            numero: match[0],
            texto: match[0],
            inicio: match.index,
            fim: match.index + match[0].length,
        });
    }

    return referencias;
}
