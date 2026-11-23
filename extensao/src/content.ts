import { type RespostaDecisoes, type Tribunal } from "./api.ts";
import { chromeExtensao } from "./chrome.ts";
import { BASE_PADRAO, tribunalDoHost } from "./config.ts";
import { criarFicha } from "./ficha.ts";
import { reconhecerProcessos, type Referencia } from "./parser.ts";

const ficha = criarFicha();
let baseAtual = BASE_PADRAO;
let tribunal: Tribunal = "STJ";
let ancora: HTMLElement | null = null;
let geracao = 0;
let fechamento: ReturnType<typeof setTimeout> | undefined;

function normalizarBase(valor: string | undefined): string {
    const texto = (valor || BASE_PADRAO).trim().replace(/\/$/, "");
    return texto || BASE_PADRAO;
}

function ignorar(no: Node): boolean {
    const pai = no.parentElement;
    if (!pai) {
        return true;
    }
    return Boolean(
        pai.closest(
            "[data-jurimetria], [data-jurimetria-ficha], script, style, textarea, input, select, noscript, [contenteditable='true']",
        ),
    );
}

function cancelarFechamento() {
    clearTimeout(fechamento);
}

function agendarFechamento() {
    cancelarFechamento();
    fechamento = setTimeout(fechar, 200);
}

function fechar() {
    geracao += 1;
    cancelarFechamento();
    ficha.host.style.display = "none";
    if (ancora) {
        ancora.setAttribute("aria-expanded", "false");
        ancora = null;
    }
}

function posicionar(marca: HTMLElement) {
    const margem = 8;
    ficha.host.style.display = "block";
    const rect = marca.getBoundingClientRect();
    const largura = ficha.host.offsetWidth || 352;
    const altura = ficha.host.offsetHeight || 72;
    let esquerda = rect.left;
    let topo = rect.bottom + margem;
    if (esquerda + largura > window.innerWidth - margem) {
        esquerda = window.innerWidth - largura - margem;
    }
    if (topo + altura > window.innerHeight - margem) {
        topo = rect.top - altura - margem;
    }
    ficha.host.style.left = `${Math.max(margem, esquerda)}px`;
    ficha.host.style.top = `${Math.max(margem, topo)}px`;
}

async function pedirDecisoes(referencia: Referencia): Promise<RespostaDecisoes | null> {
    if (referencia.tipo === "cnj") {
        return null;
    }

    const resposta = await chromeExtensao().runtime.sendMessage({
        base: baseAtual,
        tribunal,
        classe: referencia.classe,
        numero: referencia.numero,
    });
    if (!resposta?.ok) {
        throw new Error(resposta?.erro ?? "consulta falhou");
    }
    return resposta.corpo;
}

async function abrir(marca: HTMLElement, referencia: Referencia) {
    cancelarFechamento();
    if (ancora && ancora !== marca) {
        ancora.setAttribute("aria-expanded", "false");
    }
    ancora = marca;
    marca.setAttribute("aria-expanded", "true");
    const atual = ++geracao;
    const titulo = referencia.texto;

    if (referencia.tipo === "cnj") {
        ficha.mostrar({ tipo: "cnj", titulo });
        posicionar(marca);
        return;
    }

    ficha.mostrar({ tipo: "carregando", titulo });
    posicionar(marca);

    try {
        const corpo = await pedirDecisoes(referencia);
        if (atual !== geracao) {
            return;
        }
        if (!corpo || corpo.decisoes.length === 0) {
            ficha.mostrar({ tipo: "vazio", titulo });
        } else {
            ficha.mostrar({
                tipo: "decisoes",
                titulo,
                base: baseAtual,
                decisoes: corpo.decisoes,
            });
        }
    } catch {
        if (atual !== geracao) {
            return;
        }
        ficha.mostrar({ tipo: "erro", titulo });
    }

    if (atual === geracao) {
        posicionar(marca);
    }
}

function criarMarca(referencia: Referencia): HTMLSpanElement {
    const marca = document.createElement("span");
    marca.dataset.jurimetria = "";
    marca.tabIndex = 0;
    marca.setAttribute("role", "button");
    marca.setAttribute("aria-haspopup", "dialog");
    marca.setAttribute("aria-expanded", "false");
    marca.textContent = referencia.texto;
    marca.style.display = "inline";
    marca.style.font = "inherit";
    marca.style.color = "inherit";
    marca.style.background = "none";
    marca.style.padding = "0";
    marca.style.margin = "0";
    marca.style.border = "0";
    marca.style.lineHeight = "inherit";
    marca.style.letterSpacing = "inherit";
    marca.style.textDecoration = "underline dotted";
    marca.style.textUnderlineOffset = "2px";
    marca.style.cursor = "pointer";

    marca.addEventListener("mouseenter", () => {
        void abrir(marca, referencia);
    });
    marca.addEventListener("mouseleave", agendarFechamento);
    marca.addEventListener("focus", () => {
        void abrir(marca, referencia);
    });
    marca.addEventListener("blur", agendarFechamento);
    marca.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            evento.preventDefault();
            fechar();
            marca.focus();
            return;
        }
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            void abrir(marca, referencia);
            return;
        }
        if (evento.key === "Tab" && !evento.shiftKey && ancora === marca && ficha.host.style.display !== "none") {
            const link = ficha.primeiroLink();
            if (link) {
                evento.preventDefault();
                link.focus();
            }
        }
    });

    return marca;
}

function substituir(texto: Text) {
    const valor = texto.data;
    const referencias = reconhecerProcessos(valor);
    if (referencias.length === 0 || !texto.parentNode) {
        return;
    }

    const fragmento = document.createDocumentFragment();
    let cursor = 0;
    for (const referencia of referencias) {
        if (referencia.inicio > cursor) {
            fragmento.append(valor.slice(cursor, referencia.inicio));
        }
        fragmento.append(criarMarca(referencia));
        cursor = referencia.fim;
    }
    if (cursor < valor.length) {
        fragmento.append(valor.slice(cursor));
    }
    texto.replaceWith(fragmento);
}

function realcar(raiz: Node) {
    if (raiz.nodeType === Node.TEXT_NODE) {
        if (!ignorar(raiz)) {
            substituir(raiz as Text);
        }
        return;
    }

    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
        acceptNode(no) {
            return ignorar(no) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
    });
    const textos: Text[] = [];
    let atual: Node | null = walker.nextNode();
    while (atual) {
        textos.push(atual as Text);
        atual = walker.nextNode();
    }
    for (const texto of textos) {
        substituir(texto);
    }
}

function observar() {
    const observer = new MutationObserver((mutacoes) => {
        for (const mutacao of mutacoes) {
            for (const no of mutacao.addedNodes) {
                if (no instanceof HTMLElement) {
                    if (no.hasAttribute("data-jurimetria") || no.hasAttribute("data-jurimetria-ficha")) {
                        continue;
                    }
                } else if (no.nodeType !== Node.TEXT_NODE) {
                    continue;
                }
                realcar(no);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

async function carregarBase() {
    try {
        const salvo = await chromeExtensao().storage.local.get({ base: BASE_PADRAO });
        baseAtual = normalizarBase(salvo.base);
    } catch {
        baseAtual = BASE_PADRAO;
    }
}

async function iniciar() {
    chromeExtensao().storage.onChanged.addListener((mudancas, area) => {
        if (area === "local" && mudancas.base) {
            baseAtual = normalizarBase(mudancas.base.newValue);
        }
    });
    await carregarBase();
    tribunal = tribunalDoHost(location.hostname, document.documentElement.dataset.tribunal);
    document.body.append(ficha.host);
    ficha.host.addEventListener("mouseenter", cancelarFechamento);
    ficha.host.addEventListener("mouseleave", agendarFechamento);
    ficha.host.addEventListener("focusin", cancelarFechamento);
    ficha.host.addEventListener("focusout", agendarFechamento);
    ficha.aoTecla((evento) => {
        if (evento.key === "Escape" && ancora) {
            evento.preventDefault();
            const destino = ancora;
            fechar();
            destino.focus();
            return;
        }
        const primeiro = ficha.primeiroLink();
        if (evento.key === "Tab" && evento.shiftKey && evento.target === primeiro && ancora) {
            evento.preventDefault();
            ancora.focus();
        }
    });
    window.addEventListener("resize", () => {
        if (ancora && ficha.host.style.display !== "none") {
            posicionar(ancora);
        }
    });
    realcar(document.body);
    observar();
}

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            void iniciar();
        }, { once: true });
    } else {
        void iniciar();
    }
}
