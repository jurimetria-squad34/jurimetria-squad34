// ============================================
// Validação do formulário de pedido de acesso
// Funções puras, testáveis, sem dependência de DOM
// ============================================

/**
 * Valida o nome completo.
 * Regra: mínimo 2 caracteres depois de remover espaços.
 */
export function validarNome(valor: string): string | null {
    const limpo = valor.trim();
    if (limpo.length === 0) return 'Informe o nome completo.';
    if (limpo.length < 2) return 'O nome precisa ter pelo menos 2 caracteres.';
    if (limpo.length > 100) return 'O nome pode ter no máximo 100 caracteres.';
    return null;
}

/**
 * Valida o e-mail.
 * Regra: formato básico usuario@dominio.tld.
 */
export function validarEmail(valor: string): string | null {
    const limpo = valor.trim();
    if (limpo.length === 0) return 'Informe o e-mail.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(limpo)) return 'Informe um e-mail válido.';
    if (limpo.length > 254) return 'O e-mail pode ter no máximo 254 caracteres.';
    return null;
}

/**
 * Valida o escritório.
 * Regra: não pode ser vazio.
 */
export function validarEscritorio(valor: string): string | null {
    if (valor.trim().length === 0) return 'Informe o escritório.';
    if (valor.trim().length > 150)
        return 'O escritório pode ter no máximo 150 caracteres.';
    return null;
}

/**
 * Valida a área de atuação.
 * Regra: precisa estar na lista de áreas permitidas.
 */
export function validarArea(
    valor: string,
    areasPermitidas: string[],
): string | null {
    if (valor === '') return 'Selecione a área de atuação.';
    if (!areasPermitidas.includes(valor)) return 'Área de atuação inválida.';
    return null;
}

/**
 * Valida o tamanho do escritório.
 * Regra: precisa estar na lista de tamanhos permitidos.
 */
export function validarTamanho(
    valor: string,
    tamanhosPermitidos: string[],
): string | null {
    if (valor === '') return 'Selecione o tamanho do escritório.';
    if (!tamanhosPermitidos.includes(valor))
        return 'Tamanho de escritório inválido.';
    return null;
}
