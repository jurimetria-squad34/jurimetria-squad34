import { consultarDecisoes, type Tribunal } from "./api.ts";
import type { PedidoConsulta, RespostaConsulta } from "./chrome.ts";
import type { Classe } from "./parser.ts";

type ChromeFundo = {
    runtime: {
        onMessage: {
            addListener(
                ouvinte: (
                    pedido: PedidoConsulta,
                    remetente: unknown,
                    responder: (resposta: RespostaConsulta) => void,
                ) => boolean,
            ): void;
        };
    };
};

const chromeFundo = (globalThis as { chrome?: ChromeFundo }).chrome;
if (chromeFundo) {
    chromeFundo.runtime.onMessage.addListener((pedido, _remetente, responder) => {
        const referencia = {
            tipo: "processo" as const,
            classe: pedido.classe as Classe,
            numero: pedido.numero,
            uf: null,
            texto: "",
            inicio: 0,
            fim: 0,
        };
        consultarDecisoes(pedido.base, referencia, pedido.tribunal as Tribunal)
            .then((corpo) => responder({ ok: true, corpo }))
            .catch((falha: unknown) => {
                responder({
                    ok: false,
                    erro: falha instanceof Error ? falha.message : "consulta falhou",
                });
            });
        return true;
    });
}
