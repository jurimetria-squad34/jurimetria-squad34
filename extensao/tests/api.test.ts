import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { consultarDecisoes, type RespostaDecisoes } from "../src/api.ts";
import { reconhecerProcessos } from "../src/parser.ts";
import { criarServidor } from "../src/servidor.ts";

const pasta = join(dirname(fileURLToPath(import.meta.url)), "../exemplos");

function instalarSessao(): Map<string, RespostaDecisoes> {
    const dados = new Map<string, RespostaDecisoes>();
    (globalThis as { chrome?: unknown }).chrome = {
        storage: {
            session: {
                async get(chave: string) {
                    return { [chave]: dados.get(chave) };
                },
                async set(itens: Record<string, RespostaDecisoes>) {
                    for (const [chave, valor] of Object.entries(itens)) {
                        dados.set(chave, valor);
                    }
                },
            },
        },
    };
    return dados;
}

describe("cliente da API", () => {
    let servidor: Server;
    let base: string;
    let chamadas = 0;
    const fetchOriginal = globalThis.fetch;

    before(async () => {
        instalarSessao();
        servidor = criarServidor(pasta);
        await new Promise<void>((resolve) => {
            servidor.listen(0, "127.0.0.1", resolve);
        });
        const endereco = servidor.address();
        if (!endereco || typeof endereco === "string") {
            throw new Error("porta do servidor indisponivel");
        }
        base = `http://127.0.0.1:${endereco.port}`;
        globalThis.fetch = async (input, init) => {
            chamadas += 1;
            return fetchOriginal(input, init);
        };
    });

    after(async () => {
        globalThis.fetch = fetchOriginal;
        delete (globalThis as { chrome?: unknown }).chrome;
        await new Promise<void>((resolve, reject) => {
            servidor.close((erro) => (erro ? reject(erro) : resolve()));
        });
    });

    it("consulta HC 1000028 uma vez e reusa o cache na segunda", async () => {
        const [referencia] = reconhecerProcessos("HC 1000028");
        const esperado = JSON.parse(readFileSync(join(pasta, "por-numero_STJ_HC_1000028.json"), "utf8"));

        const primeira = await consultarDecisoes(base, referencia, "STJ");
        const depoisDaPrimeira = chamadas;
        const segunda = await consultarDecisoes(base, referencia, "STJ");

        assert.deepEqual(primeira, esperado);
        assert.deepEqual(segunda, esperado);
        assert.equal(depoisDaPrimeira, 1);
        assert.equal(chamadas, 1);
    });

    it("nao consulta a API para numero CNJ", async () => {
        const [referencia] = reconhecerProcessos("0000000-00.0000.0.00.0000");
        const antes = chamadas;

        const resposta = await consultarDecisoes(base, referencia, "STJ");

        assert.equal(referencia.tipo, "cnj");
        assert.equal(resposta, null);
        assert.equal(chamadas, antes);
    });

    it("envia so tribunal, classe e numero", async () => {
        const [referencia] = reconhecerProcessos("AgRg no AREsp n. 575.696/MG");
        let urlConsultada = "";
        const fetchAtual = globalThis.fetch;
        globalThis.fetch = async (input, init) => {
            urlConsultada = String(input);
            return fetchAtual(input, init);
        };

        await consultarDecisoes(base, referencia, "STJ");

        const url = new URL(urlConsultada);
        assert.deepEqual(
            [...url.searchParams.keys()].sort(),
            ["classe", "numero", "tribunal"],
        );
        assert.equal(url.searchParams.get("tribunal"), "STJ");
        assert.equal(url.searchParams.get("classe"), "AREsp");
        assert.equal(url.searchParams.get("numero"), "575696");
        globalThis.fetch = fetchAtual;
    });
});
