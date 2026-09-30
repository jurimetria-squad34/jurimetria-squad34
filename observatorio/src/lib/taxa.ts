/**
 * Cálculo da taxa de decisões favoráveis.
 * um recorte com menos de 30 decisões não mostra porcentagem, mostra "base pequena"
 */

export const LIMITE_BASE_PEQUENA = 30;

export type ResultadoTaxa =
  | { status: "ok"; taxa: number; total: number; favoraveis: number }
  | { status: "base-pequena"; total: number };

export function calcularTaxa(total: number, favoraveis: number): ResultadoTaxa {
  if (favoraveis > total) {
    throw new Error(`calcularTaxa: favoráveis (${favoraveis}) não pode ser maior que total (${total}).`);
  }
  if (total < LIMITE_BASE_PEQUENA) {
    return { status: "base-pequena", total };
  }
  return { status: "ok", taxa: favoraveis / total, total, favoraveis };
}