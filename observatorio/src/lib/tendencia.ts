/**
 * Tendência dos relatores: compara a taxa favorável agregada dos 3 últimos
 * anos fechados com a dos 3 anteriores. Regra combinada com o Bruno por
 * e-mail em 28/09/2026.
 */
import { LIMITE_BASE_PEQUENA } from "./taxa.ts";
import { formatarPercentual } from "./formato.ts";

/** Uma janela de anos já somada: total de decisões e quantas favoráveis, na janela inteira. */
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

/**
 * Compara duas janelas de anos já somadas. A taxa de cada janela é o total de
 * favoráveis dividido pelo total de decisões da janela inteira — NÃO é a
 * média das taxas de cada ano, porque um ano com 50 decisões não pode pesar
 * o mesmo que um ano com 800 (é a mesma ideia de calcularTaxa, só que numa
 * janela de vários anos somados em vez de um recorte só).
 */
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
    // arredondado para remover "sujeira" de ponto flutuante (ex.: 0.4 - 0.5
    // não dá exatamente -0.1 num computador — dá -0.09999999999999998).
    // 6 casas sobra de sobra, já que a tela só mostra 1 casa decimal.
    diferencaPontosPercentuais: Math.round((taxaRecente - taxaAnterior) * 100 * 1e6) / 1e6,
  };
}

/**
 * Monta o texto para a tela, no formato que o Bruno pediu:
 * "▲ +4,2 p.p. (38,1% → 42,3%)". A seta e o sinal invertem numa queda.
 */
export function formatarTendencia(resultado: ResultadoTendencia): string {
  if (resultado.status === "base-pequena") return "base pequena";
  const { diferencaPontosPercentuais, taxaAnterior, taxaRecente } = resultado;
  const seta = diferencaPontosPercentuais >= 0 ? "▲" : "▼";
  const sinal = diferencaPontosPercentuais >= 0 ? "+" : "";
  const diferencaTexto = diferencaPontosPercentuais.toFixed(1).replace(".", ",");
  return `${seta} ${sinal}${diferencaTexto} p.p. (${formatarPercentual(taxaAnterior)} → ${formatarPercentual(taxaRecente)})`;
}

/**
 * A partir do ano em que os dados foram gerados (o ano corrente, ainda
 * incompleto, fica fora — mesma ideia do mês em andamento), devolve os dois
 * grupos de 3 anos fechados que a tendência compara. Com dados gerados em
 * 2026: recentes = [2023,2024,2025], anteriores = [2020,2021,2022] — igual
 * ao exemplo que o Bruno deu.
 */
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