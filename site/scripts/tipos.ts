// ============================================
// Tipos do observatorio.json (parcial)
// ============================================

/** Registro mensal da série do observatorio.json. */
export interface RegistroMensal {
    tribunal: string;
    materia: string | null;
    classe: string;
    mes: string;
    total: number;
    favoraveis: number;
}

/** Registro de relator do observatorio.json. */
export interface RegistroRelator {
    tribunal: string;
    materia: string | null;
    classe: string;
    relator: string;
    ano: number;
    total: number;
    favoraveis: number;
    contrarios: number;
    outros: number;
}

/** Universo do observatorio.json. */
export interface UniversoObservatorio {
    tribunais: string[];
    decisoes: number;
    de: number;
    ate: number;
}

/** Formato do observatorio.json. */
export interface Observatorio {
    gerado_em: string;
    criterio: string;
    universo: UniversoObservatorio;
    mensal: RegistroMensal[];
    relatores: RegistroRelator[];
}

/** Formato do universo.json que o Site consome. */
export interface Universo {
    gerado_em: string;
    criterio: string;
    universo: UniversoObservatorio;
}

/** Recorte agregado de um período. */
export interface Recorte {
    total: number;
    favoraveis: number;
    taxa: number | null;
    basePequena: boolean;
}

/** Recortes usados pelos artigos do Site. */
export interface Recortes {
    gerado_em: string;
    criterio: string;
    universo: UniversoObservatorio;
    recortes: {
        hc_stj_10_anos: Recorte;
        hc_stj_recente: Recorte;
        hc_stj_anterior: Recorte;
        resp_stj_10_anos: Recorte;
        resp_stj_recente: Recorte;
        resp_stj_anterior: Recorte;
    };
    janelas: {
        recente: string;
        anterior: string;
    };
}

/** Relator com taxa agregada. */
export interface RelatorAgregado {
    nome: string;
    total: number;
    favoraveis: number;
    taxa: number | null;
    basePequena: boolean;
    anos: number[];
}

/** Relatores extraídos para os gráficos do Site. */
export interface Relatores {
    gerado_em: string;
    criterio: string;
    recorte: {
        tribunal: string;
        classe: string;
        materia: string;
        periodo: string;
        minimoDecisoes: number;
    };
    relatores: RelatorAgregado[];
}
