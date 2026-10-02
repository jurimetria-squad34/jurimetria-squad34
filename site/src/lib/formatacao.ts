// ============================================
// Formatação de números, datas e listas
// Funções puras, testáveis
// ============================================

/**
 * Formata um número no padrão brasileiro.
 * Ex.: 11957116 -> "11.957.116"
 */
export function formatarNumero(valor: number): string {
    return valor.toLocaleString('pt-BR');
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 * Ex.: "2024-07-26" -> "26/07/2024"
 */
export function formatarData(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    if (!ano || !mes || !dia) return iso;
    return `${dia}/${mes}/${ano}`;
}

/**
 * Junta uma lista de strings em uma frase em português.
 * Ex.: ["STF", "STJ"] -> "STF e STJ"
 * Ex.: ["A", "B", "C"] -> "A, B e C"
 */
export function listarEmPortugues(itens: string[]): string {
    return new Intl.ListFormat('pt-BR', {
        style: 'long',
        type: 'conjunction',
    }).format(itens);
}
