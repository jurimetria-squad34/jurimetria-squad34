import { readdir, readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { join } from "node:path";

const ROTA = "/api/decisoes/por-numero";

const CABECALHOS = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Private-Network": "true",
};

interface DecisaoExemplo {
    id?: string;
    tribunal?: string;
    classe?: string;
    numero?: string;
    tipo?: string;
    data_publicacao?: string;
    resultado?: string;
    resultado_rotulo?: string;
    relator?: string | null;
    orgao_julgador?: string | null;
    tese?: string | null;
    link_oficial?: string | null;
    url?: string;
}

function parametroValido(valor: string | null, formato: RegExp): valor is string {
    return valor !== null && formato.test(valor);
}

function escaparHtml(valor: unknown): string {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function buscarDecisaoPorCaminho(pastaExemplos: string, pathname: string): Promise<DecisaoExemplo | null> {
    const idAlvo = pathname.replace(/^\/decisao\//, "");
    if (!idAlvo) return null;

    const arquivos = await readdir(pastaExemplos);
    for (const arquivo of arquivos) {
        if (!arquivo.endsWith(".json") || arquivo === "por-numero_nao-encontrado.json") {
            continue;
        }
        try {
            const raw = await readFile(join(pastaExemplos, arquivo), "utf8");
            const parsed = JSON.parse(raw) as { decisoes?: DecisaoExemplo[] };
            const encontrada = (parsed.decisoes ?? []).find(
                (item) => item.url === pathname || item.id === idAlvo
            );
            if (encontrada) return encontrada;
        } catch {
            continue;
        }
    }
    return null;
}

function renderizarPaginaDecisao(decisao: DecisaoExemplo): string {
    const titulo = `${escaparHtml(decisao.tribunal ?? "")} ${escaparHtml(decisao.classe ?? "")} ${escaparHtml(decisao.numero ?? "")}`.trim() || "Decisão";
    const linkOficialHtml = decisao.link_oficial
        ? `<p><a href="${escaparHtml(decisao.link_oficial)}" target="_blank" rel="noopener noreferrer">Abrir página oficial do tribunal</a></p>`
        : "<p>Sem link oficial disponível.</p>";

    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo} — Jurimetria (Local)</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; line-height: 1.5; color: #1f2937; }
    .card { border: 1px solid #d1d5db; border-radius: 10px; padding: 20px; background: #f9fafb; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 16px 0; }
    .item { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
    .label { font-size: 12px; color: #6b7280; display: block; }
    .tese { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-top: 12px; }
    a { color: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <small>Visualização local de decisão</small>
    <h1>${titulo}</h1>
    <div class="meta">
      <div class="item"><span class="label">ID</span>${escaparHtml(decisao.id ?? "-")}</div>
      <div class="item"><span class="label">Tipo</span>${escaparHtml(decisao.tipo ?? "-")}</div>
      <div class="item"><span class="label">Data de publicação</span>${escaparHtml(decisao.data_publicacao ?? "-")}</div>
      <div class="item"><span class="label">Resultado</span>${escaparHtml(decisao.resultado_rotulo ?? decisao.resultado ?? "-")}</div>
      <div class="item"><span class="label">Relator</span>${escaparHtml(decisao.relator ?? "-")}</div>
      <div class="item"><span class="label">Órgão julgador</span>${escaparHtml(decisao.orgao_julgador ?? "-")}</div>
    </div>
    <div class="tese">
      <span class="label">Tese</span>
      <div>${escaparHtml(decisao.tese ?? "Não informada")}</div>
    </div>
    ${linkOficialHtml}
  </div>
</body>
</html>`;
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

        if (req.method === "GET" && url.pathname.startsWith("/decisao/")) {
            const decisao = await buscarDecisaoPorCaminho(pastaExemplos, url.pathname);
            if (!decisao) {
                res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
                res.end("<h1>Decisão não encontrada</h1>");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(renderizarPaginaDecisao(decisao));
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
