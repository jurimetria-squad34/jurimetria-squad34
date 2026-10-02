// ============================================
// Tipos do observatorio.json (parcial)
// Só o que o Site precisa
// ============================================
export interface UniversoObservatorio {
    tribunais: string[];
    decisoes: number;
    de: number;
    ate: number;
}

// ============================================
// Formato do observatorio.json
// O script lê só essas três chaves
// ============================================
export interface Observatorio {
    gerado_em: string;
    criterio: string;
    universo: UniversoObservatorio;
}

// ============================================
// Formato do universo.json que o Site consome
// ============================================
export interface Universo {
    gerado_em: string;
    criterio: string;
    universo: UniversoObservatorio;
}
