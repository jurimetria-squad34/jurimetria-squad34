import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { criarServidor } from "../src/servidor.ts";

const pasta = join(dirname(fileURLToPath(import.meta.url)), "../exemplos");

describe("servidor local", () => {
    let servidor: Server;
    let base: string;

    before(async () => {
        servidor = criarServidor(pasta);
        await new Promise<void>((resolve) => {
            servidor.listen(0, "127.0.0.1", resolve);
        });
        const endereco = servidor.address();
        if (!endereco || typeof endereco === "string") {
            throw new Error("porta do servidor indisponivel");
        }
        base = `http://127.0.0.1:${endereco.port}`;
    });

    after(async () => {
        await new Promise<void>((resolve, reject) => {
            servidor.close((erro) => (erro ? reject(erro) : resolve()));
        });
    });

    it("devolve o JSON de HC 1000028 no STJ", async () => {
        const resposta = await fetch(`${base}/api/decisoes/por-numero?tribunal=STJ&classe=HC&numero=1000028`);
        const esperado = JSON.parse(readFileSync(join(pasta, "por-numero_STJ_HC_1000028.json"), "utf8"));

        assert.equal(resposta.status, 200);
        assert.deepEqual(await resposta.json(), esperado);
    });

    it("devolve lista vazia para um numero que nao esta nos exemplos", async () => {
        const resposta = await fetch(`${base}/api/decisoes/por-numero?tribunal=STJ&classe=HC&numero=999999999`);

        assert.equal(resposta.status, 200);
        assert.deepEqual(await resposta.json(), { decisoes: [] });
    });

    it("responde 400 quando falta parametro", async () => {
        const resposta = await fetch(`${base}/api/decisoes/por-numero?tribunal=STJ&numero=1000028`);

        assert.equal(resposta.status, 400);
    });
});
