import type { Decisao } from "./api.ts";
import { linkJurimetria } from "./config.ts";

const CSS = `
:host { all: initial; }
.cartao {
    box-sizing: border-box;
    width: 22rem;
    max-width: calc(100vw - 16px);
    max-height: min(24rem, 70vh);
    overflow: auto;
    padding: 0.75rem 0.9rem;
    background: #fff;
    color: #1c1917;
    border: 1px solid #d6d3d1;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    font: 14px/1.45 system-ui, sans-serif;
}
.titulo { font-weight: 650; margin: 0 0 0.55rem; }
.estado { margin: 0; }
.decisao + .decisao {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e7e5e4;
}
.resultado { font-weight: 650; margin: 0; }
.meta, .tese { margin: 0.2rem 0 0; }
.links { margin: 0.4rem 0 0; display: flex; flex-wrap: wrap; gap: 0.75rem; }
a { color: #1d4ed8; }
a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
`;

const MENSAGENS = {
    carregando: "Buscando decisões…",
    vazio: "Nenhuma decisão encontrada.",
    erro: "Não foi possível consultar a API.",
    cnj: "Número CNJ reconhecido. Esta versão não consulta a API.",
} as const;

export type EstadoFicha =
    | { tipo: "carregando" | "vazio" | "erro" | "cnj"; titulo: string }
    | { tipo: "decisoes"; titulo: string; base: string; decisoes: Decisao[] };

export type ControleFicha = {
    host: HTMLElement;
    mostrar(estado: EstadoFicha): void;
    primeiroLink(): HTMLAnchorElement | null;
    aoTecla(ouvinte: (evento: KeyboardEvent) => void): void;
};

function dataBr(iso: string): string {
    const [ano, mes, dia] = iso.split("-");
    if (!ano || !mes || !dia) {
        return iso;
    }
    return `${dia}/${mes}/${ano}`;
}

function blocoDecisao(base: string, decisao: Decisao): HTMLElement {
    const artigo = document.createElement("article");
    artigo.className = "decisao";

    const resultado = document.createElement("p");
    resultado.className = "resultado";
    resultado.textContent = decisao.resultado_rotulo;
    artigo.append(resultado);

    const meta = document.createElement("p");
    meta.className = "meta";
    const partes = [decisao.relator, dataBr(decisao.data_publicacao)];
    if (decisao.orgao_julgador) {
        partes.push(decisao.orgao_julgador);
    }
    meta.textContent = partes.filter(Boolean).join(" · ");
    artigo.append(meta);

    if (decisao.tese) {
        const tese = document.createElement("p");
        tese.className = "tese";
        tese.textContent = decisao.tese;
        artigo.append(tese);
    }

    const links = document.createElement("p");
    links.className = "links";

    const oficial = document.createElement("a");
    oficial.href = decisao.link_oficial;
    oficial.target = "_blank";
    oficial.rel = "noopener noreferrer";
    oficial.textContent = "Página oficial";

    const jurimetria = document.createElement("a");
    jurimetria.href = linkJurimetria(base, decisao.url);
    jurimetria.target = "_blank";
    jurimetria.rel = "noopener noreferrer";
    jurimetria.textContent = "Abrir no Jurimetria";

    links.append(oficial, jurimetria);
    artigo.append(links);
    return artigo;
}

export function criarFicha(): ControleFicha {
    const host = document.createElement("div");
    host.dataset.jurimetriaFicha = "";
    host.style.position = "fixed";
    host.style.zIndex = "2147483647";
    host.style.display = "none";
    host.style.margin = "0";
    host.style.padding = "0";
    host.style.border = "0";
    host.style.background = "transparent";

    const shadow = host.attachShadow({ mode: "open" });
    const estilo = document.createElement("style");
    estilo.textContent = CSS;
    const caixa = document.createElement("div");
    caixa.className = "cartao";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-label", "Ficha da decisão");
    caixa.setAttribute("aria-live", "polite");
    shadow.append(estilo, caixa);

    function ajustarHost() {
        host.style.width = `${caixa.offsetWidth}px`;
        host.style.height = `${caixa.offsetHeight}px`;
    }

    return {
        host,
        mostrar(estado) {
            host.dataset.estado = estado.tipo;
            caixa.replaceChildren();

            const titulo = document.createElement("p");
            titulo.className = "titulo";
            titulo.textContent = estado.titulo;
            caixa.append(titulo);

            if (estado.tipo === "decisoes") {
                for (const decisao of estado.decisoes.slice(0, 10)) {
                    caixa.append(blocoDecisao(estado.base, decisao));
                }
            } else {
                const mensagem = document.createElement("p");
                mensagem.className = "estado";
                mensagem.textContent = MENSAGENS[estado.tipo];
                caixa.append(mensagem);
            }

            ajustarHost();
        },
        primeiroLink() {
            return shadow.querySelector("a");
        },
        aoTecla(ouvinte) {
            shadow.addEventListener("keydown", ouvinte);
        },
    };
}
