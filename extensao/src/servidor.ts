import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { join } from "node:path";

const ROTA = "/api/decisoes/por-numero";

const CABECALHOS = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Private-Network": "true",
};

function parametroValido(valor: string | null, formato: RegExp): valor is string {
    return valor !== null && formato.test(valor);
}

export function criarServidor(pastaExemplos: string, paginaLocal?: string): Server {
    return createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        if (
            paginaLocal &&
            req.method === "GET" &&
            (url.pathname === "/" || url.pathname === "/pagina-local.html")
        ) {
            const html = await readFile(paginaLocal);
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(html);
            return;
        }

        if (url.pathname === ROTA && req.method === "OPTIONS") {
            res.writeHead(204, {
                ...CABECALHOS,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            });
            res.end();
            return;
        }

        if (req.method !== "GET" || url.pathname !== ROTA) {
            res.writeHead(404, CABECALHOS);
            res.end(JSON.stringify({ erro: "rota nao encontrada" }));
            return;
        }

        const tribunal = url.searchParams.get("tribunal");
        const classe = url.searchParams.get("classe");
        const numero = url.searchParams.get("numero");
        if (
            !parametroValido(tribunal, /^[A-Za-z]+$/) ||
            !parametroValido(classe, /^[A-Za-z]+$/) ||
            !parametroValido(numero, /^\d+$/)
        ) {
            res.writeHead(400, CABECALHOS);
            res.end(JSON.stringify({ erro: "informe tribunal, classe e numero" }));
            return;
        }

        const nome = `por-numero_${tribunal}_${classe}_${numero}.json`;
        try {
            const corpo = await readFile(join(pastaExemplos, nome), "utf8");
            res.writeHead(200, CABECALHOS);
            res.end(corpo);
        } catch {
            const vazio = await readFile(join(pastaExemplos, "por-numero_nao-encontrado.json"), "utf8");
            res.writeHead(200, CABECALHOS);
            res.end(vazio);
        }
    });
}
