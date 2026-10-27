// ============================================
// Regras do escopo do Squad 34
// Referência: DESAFIO-SQUAD34.md, LEIA-PRIMEIRO.md, site/ESCOPO.md
// ============================================

/** Mínimo de decisões em um recorte para mostrar taxa. */
export const MINIMO_DECISOES = 30;

/**
 * Regra 2 do desafio: recorte com menos de 30 decisões não mostra taxa.
 * Retorna true se pode mostrar taxa, false se deve mostrar "base pequena".
 */
export function podeMostrarTaxa(total: number): boolean {
    return total >= MINIMO_DECISOES;
}

/**
 * Calcula a taxa favorável de um recorte.
 * Retorna null quando a base é pequena (menos de 30 decisões),
 * o que sinaliza para a interface mostrar "base pequena".
 */
export function calcularTaxa(favoraveis: number, total: number): number | null {
    if (!podeMostrarTaxa(total)) return null;
    return favoraveis / total;
}

/**
 * Calcula a taxa agregada de uma janela de anos.
 * Usado no cálculo de tendência dos relatores.
 * A taxa é o total de favoráveis dividido pelo total de decisões
 * da janela inteira, e não a média das taxas anuais.
 */
export function calcularTaxaAgregada(
    janelas: Array<{ favoraveis: number; total: number }>,
): number | null {
    let favoraveis = 0;
    let total = 0;
    for (const j of janelas) {
        favoraveis += j.favoraveis;
        total += j.total;
    }
    return calcularTaxa(favoraveis, total);
}

/**
 * Calcula a tendência entre duas janelas de anos.
 * Retorna a diferença em pontos percentuais, ou null se
 * qualquer uma das janelas tiver base pequena.
 */
export function calcularTendencia(
    recente: Array<{ favoraveis: number; total: number }>,
    anterior: Array<{ favoraveis: number; total: number }>,
): number | null {
    const taxaRecente = calcularTaxaAgregada(recente);
    const taxaAnterior = calcularTaxaAgregada(anterior);
    if (taxaRecente === null || taxaAnterior === null) return null;
    return (taxaRecente - taxaAnterior) * 100;
}
