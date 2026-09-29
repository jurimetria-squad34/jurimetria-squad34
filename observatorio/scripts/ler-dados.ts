/**
 * Este módulo só roda em Node (usa node:fs). Nunca deve ser importado por um
 * componente React (.tsx): esses rodam no navegador, que não tem sistema de
 * arquivos.
 */

import { readFileSync } from "node:fs";
import type { Mensal, ObservatorioData, Relator, Tribunal } from "../src/types/observatorio.ts";

export type MensalNormalizado = Mensal & { classeOriginal: string; emAndamento: boolean };
export type RelatorNormalizado = Relator & { classeOriginal: string };

export interface ObservatorioNormalizado {
  gerado_em: string;
  criterio: string;
  universo: ObservatorioData["universo"];
  mensal: MensalNormalizado[];
  relatores: RelatorNormalizado[];
}


//Lê o observatorio.json do caminho informado e confere o formato mínimo esperado.
export function lerObservatorio(caminhoArquivo: string): ObservatorioData {
  const texto = readFileSync(caminhoArquivo, "utf-8");
  const dados = JSON.parse(texto) as ObservatorioData;

  for (const chave of ["gerado_em", "criterio", "universo", "mensal", "relatores"] as const) {
    if (!(chave in dados)) {
      throw new Error(`observatorio.json inválido: falta a chave "${chave}".`);
    }
  }
  if (!Array.isArray(dados.mensal) || !Array.isArray(dados.relatores)) {
    throw new Error("observatorio.json inválido: \"mensal\" e \"relatores\" precisam ser listas.");
  }

  const somaMensal = dados.mensal.reduce((soma, linha) => soma + linha.total, 0);
  if (somaMensal !== dados.universo.decisoes) {
    throw new Error(
      `observatorio.json inconsistente: a soma de "total" em "mensal" é ${somaMensal}, ` +
        `mas "universo.decisoes" diz ${dados.universo.decisoes}.`,
    );
  }

  return dados;
}

function escolherFormaCanonica(ocorrencias: Map<string, number>): string {
  let melhor = "";
  let melhorTotal = -1;
  for (const [classe, total] of [...ocorrencias.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (total > melhorTotal) {
      melhor = classe;
      melhorTotal = total;
    }
  }
  return melhor;
}

/** Monta, por tribunal, um mapa de "classe em minúsculo" -> "grafia oficial escolhida". */
function montarMapaDeClasses(dados: ObservatorioData): Map<Tribunal, Map<string, string>> {
  const volumePorGrupo = new Map<Tribunal, Map<string, Map<string, number>>>();

  const contar = (tribunal: Tribunal, classe: string, total: number) => {
    const chave = classe.toLowerCase();
    if (!volumePorGrupo.has(tribunal)) volumePorGrupo.set(tribunal, new Map());
    const porTribunal = volumePorGrupo.get(tribunal)!;
    if (!porTribunal.has(chave)) porTribunal.set(chave, new Map());
    const porGrafia = porTribunal.get(chave)!;
    porGrafia.set(classe, (porGrafia.get(classe) ?? 0) + total);
  };

  for (const linha of dados.mensal) contar(linha.tribunal, linha.classe, linha.total);
  for (const linha of dados.relatores) contar(linha.tribunal, linha.classe, linha.total);

  const resultado = new Map<Tribunal, Map<string, string>>();
  for (const [tribunal, grupos] of volumePorGrupo) {
    const porTribunal = new Map<string, string>();
    for (const [chave, ocorrencias] of grupos) {
      porTribunal.set(chave, escolherFormaCanonica(ocorrencias));
    }
    resultado.set(tribunal, porTribunal);
  }
  return resultado;
}

/** Aplica a unificação de classes e a marcação de mês em andamento nas duas listas. */
export function normalizarDados(dados: ObservatorioData): ObservatorioNormalizado {
  const mapaClasses = montarMapaDeClasses(dados);
  const mesReferencia = dados.gerado_em.slice(0, 7);

  const classeCanonica = (tribunal: Tribunal, classe: string): string =>
    mapaClasses.get(tribunal)?.get(classe.toLowerCase()) ?? classe;

  return {
    gerado_em: dados.gerado_em,
    criterio: dados.criterio,
    universo: dados.universo,
    mensal: dados.mensal.map((linha) => ({
      ...linha,
      classeOriginal: linha.classe,
      classe: classeCanonica(linha.tribunal, linha.classe),
      emAndamento: linha.mes === mesReferencia,
    })),
    relatores: dados.relatores.map((linha) => ({
      ...linha,
      classeOriginal: linha.classe,
      classe: classeCanonica(linha.tribunal, linha.classe),
    })),
  };
}