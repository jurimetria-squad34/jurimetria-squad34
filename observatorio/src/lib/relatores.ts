import type { LinhaRelator } from "@/types/recorte";
import { calcularTaxa } from "./taxa.ts";
import { nomeCompletoRelator, nomeCurtoRelator } from "./rotulos.ts";

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

export interface PontoRelatorGrafico {
  relator: string;
  nomeCurto: string;
  nomeCompleto: string;
  total: number;
  totalAnterior: number;
  totalRecente: number;
  taxaAnterior: number | null;
  taxaRecente: number | null;
}

function taxaOuNulo(janela: JanelaRelator): number | null {
  const resultado = calcularTaxa(janela.total, janela.favoraveis);
  return resultado.status === "ok" ? resultado.taxa : null;
}

export function selecionarRelatoresParaGrafico(
  relatores: RelatorAgregado[],
  limite = 10,
): { pontos: PontoRelatorGrafico[]; elegiveis: number } {
  const elegiveis = relatores
    .map(
      (r): PontoRelatorGrafico => ({
        relator: r.relator,
        nomeCurto: nomeCurtoRelator(r.relator),
        nomeCompleto: nomeCompletoRelator(r.relator),
        total: r.total,
        totalAnterior: r.janelaAnterior.total,
        totalRecente: r.janelaRecente.total,
        taxaAnterior: taxaOuNulo(r.janelaAnterior),
        taxaRecente: taxaOuNulo(r.janelaRecente),
      }),
    )
    .filter((p) => p.taxaAnterior !== null || p.taxaRecente !== null)
    .sort((a, b) => b.total - a.total);

  return { pontos: elegiveis.slice(0, limite), elegiveis: elegiveis.length };
}

export const MINIMO_DECISOES_RELATOR_ANO = 20;