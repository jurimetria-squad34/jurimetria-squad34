import { LIMITE_BASE_PEQUENA } from "./taxa.ts";
import { formatarPercentual } from "./formato.ts";

export interface JanelaAnual {
  total: number;
  favoraveis: number;
}

export type ResultadoTendencia =
  | {
      status: "ok";
      taxaAnterior: number;
      taxaRecente: number;
      diferencaPontosPercentuais: number;
    }
  | { status: "base-pequena" };

export function calcularTendencia(janelaAnterior: JanelaAnual, janelaRecente: JanelaAnual): ResultadoTendencia {
  if (janelaAnterior.total < LIMITE_BASE_PEQUENA || janelaRecente.total < LIMITE_BASE_PEQUENA) {
    return { status: "base-pequena" };
  }
  const taxaAnterior = janelaAnterior.favoraveis / janelaAnterior.total;
  const taxaRecente = janelaRecente.favoraveis / janelaRecente.total;
  return {
    status: "ok",
    taxaAnterior,
    taxaRecente,
    diferencaPontosPercentuais: Math.round((taxaRecente - taxaAnterior) * 100 * 1e6) / 1e6,
  };
}

export function formatarTendencia(resultado: ResultadoTendencia): string {
  if (resultado.status === "base-pequena") return "base pequena";
  const { diferencaPontosPercentuais, taxaAnterior, taxaRecente } = resultado;
  const percentuais = `(${formatarPercentual(taxaAnterior)} → ${formatarPercentual(taxaRecente)})`;
  if (Number(diferencaPontosPercentuais.toFixed(1)) === 0) return `= 0,0 p.p. ${percentuais}`;
  const seta = diferencaPontosPercentuais >= 0 ? "▲" : "▼";
  const sinal = diferencaPontosPercentuais >= 0 ? "+" : "";
  const diferencaTexto = diferencaPontosPercentuais.toFixed(1).replace(".", ",");
  return `${seta} ${sinal}${diferencaTexto} p.p. ${percentuais}`;
}

export function calcularJanelasDeAnos(anoDosDados: number): {
  anosRecentes: [number, number, number];
  anosAnteriores: [number, number, number];
} {
  const anoFechadoMaisRecente = anoDosDados - 1;
  return {
    anosRecentes: [anoFechadoMaisRecente - 2, anoFechadoMaisRecente - 1, anoFechadoMaisRecente],
    anosAnteriores: [anoFechadoMaisRecente - 5, anoFechadoMaisRecente - 4, anoFechadoMaisRecente - 3],
  };
}