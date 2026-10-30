import type { Referencia } from "./parser.ts";

export type Decisao = {
    id: string;
    tribunal: string;
    classe: string;
    numero: string;
    tipo: string;
    data_publicacao: string;
    resultado: string;
    resultado_rotulo: string;
    relator: string;
    orgao_julgador: string | null;
    tese: string | null;
    link_oficial: string;
    url: string;
};

export type RespostaDecisoes = {
    decisoes: Decisao[];
};

export type Tribunal = "STJ" | "STF";

type Sessao = {
    get(chave: string): Promise<Record<string, RespostaDecisoes | undefined>>;
    set(itens: Record<string, RespostaDecisoes>): Promise<void>;
};

function sessao(): Sessao {
    const chrome = (globalThis as { chrome?: { storage: { session: Sessao } } }).chrome;
    if (!chrome) {
        throw new Error("chrome.storage.session indisponivel");
    }
    return chrome.storage.session;
}

function chaveCache(base: string, tribunal: string, classe: string, numero: string): string {
    return `${base}|${tribunal}|${classe}|${numero}`;
}

/**
 * Consulta só tribunal, classe e número. CNJ não chama a API.
 * A resposta fica em chrome.storage.session para a segunda leitura não repetir o pedido.
 */
export async function consultarDecisoes(
    base: string,
    referencia: Referencia,
    tribunal: Tribunal,
): Promise<RespostaDecisoes | null> {
    if (referencia.tipo === "cnj") {
        return null;
    }

    const raiz = base.replace(/\/$/, "");
    const url = new URL(`${raiz}/api/decisoes/por-numero`);
    url.searchParams.set("tribunal", tribunal);
    url.searchParams.set("classe", referencia.classe);
    url.searchParams.set("numero", referencia.numero);

    const chave = chaveCache(raiz, tribunal, referencia.classe, referencia.numero);
    const area = sessao();
    const salvo = await area.get(chave);
    if (salvo[chave]) {
        return salvo[chave];
    }

    const resposta = await fetch(url);
    if (!resposta.ok) {
        throw new Error(`consulta falhou com status ${resposta.status}`);
    }

    const corpo = (await resposta.json()) as RespostaDecisoes;
    await area.set({ [chave]: corpo });
    return corpo;
}
