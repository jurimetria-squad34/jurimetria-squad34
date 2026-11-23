import type { Tribunal } from "./api.ts";

export const BASE_PADRAO = "http://127.0.0.1:8787";

function noDominio(hostname: string, dominio: string): boolean {
    return hostname === dominio || hostname.endsWith(`.${dominio}`);
}

export function tribunalDoHost(hostname: string, marcado: string | null | undefined): Tribunal {
    if (noDominio(hostname, "stf.jus.br")) {
        return "STF";
    }
    if (noDominio(hostname, "stj.jus.br")) {
        return "STJ";
    }
    if (marcado === "STF" || marcado === "STJ") {
        return marcado;
    }
    return "STJ";
}

export function linkJurimetria(base: string, caminho: string): string {
    const raiz = base.endsWith("/") ? base : `${base}/`;
    return new URL(caminho, raiz).href;
}
