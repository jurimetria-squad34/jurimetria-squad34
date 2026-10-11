import type { LinhaRelator } from "@/types/recorte";

export interface JanelaRelator {
  total: number;
  favoraveis: number;
}

export interface RelatorAgregado {
  relator: string;
  total: number;
  favoraveis: number;
  janelaAnterior: JanelaRelator;
  janelaRecente: JanelaRelator;
}

export function agregarPorRelator(
  linhas: LinhaRelator[],
  anosAnteriores: readonly number[],
  anosRecentes: readonly number[],
): RelatorAgregado[] {
  const porRelator = new Map<string, RelatorAgregado>();

  for (const linha of linhas) {
    if (!porRelator.has(linha.relator)) {
      porRelator.set(linha.relator, {
        relator: linha.relator,
        total: 0,
        favoraveis: 0,
        janelaAnterior: { total: 0, favoraveis: 0 },
        janelaRecente: { total: 0, favoraveis: 0 },
      });
    }
    const agregado = porRelator.get(linha.relator)!;
    agregado.total += linha.total;
    agregado.favoraveis += linha.favoraveis;

    if (anosAnteriores.includes(linha.ano)) {
      agregado.janelaAnterior.total += linha.total;
      agregado.janelaAnterior.favoraveis += linha.favoraveis;
    }
    if (anosRecentes.includes(linha.ano)) {
      agregado.janelaRecente.total += linha.total;
      agregado.janelaRecente.favoraveis += linha.favoraveis;
    }
  }

  return [...porRelator.values()].sort((a, b) => b.total - a.total);
}