import type { RespostaDecisoes } from "./api.ts";

export type PedidoConsulta = {
    base: string;
    tribunal: string;
    classe: string;
    numero: string;
};

export type RespostaConsulta =
    | { ok: true; corpo: RespostaDecisoes | null }
    | { ok: false; erro: string };

export type ChromeExtensao = {
    runtime: {
        sendMessage(mensagem: PedidoConsulta): Promise<RespostaConsulta | undefined>;
    };
    storage: {
        local: {
            get(padrao: { base: string }): Promise<{ base: string }>;
            set(itens: { base: string }): Promise<void>;
        };
        onChanged: {
            addListener(
                ouvinte: (mudancas: { base?: { newValue?: string } }, area: string) => void,
            ): void;
        };
    };
};

export function chromeExtensao(): ChromeExtensao {
    const valor = (globalThis as { chrome?: ChromeExtensao }).chrome;
    if (!valor) {
        throw new Error("chrome indisponivel");
    }
    return valor;
}
