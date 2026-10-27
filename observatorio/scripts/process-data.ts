/**
 * Lê dados/observatorio.json, normaliza (ler-dados.ts) e divide em arquivos
 * pequenos dentro de public/data/: um por recorte (tribunal + classe +
 * matéria), mais um manifesto com o índice de tudo.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lerObservatorio, normalizarDados } from "./ler-dados.ts";
import type { MensalNormalizado, ObservatorioNormalizado, RelatorNormalizado } from "./ler-dados.ts";
import type { ArquivoRecorte, ClasseDestaque, EntradaManifesto, Manifesto, PontoAnualClasse, Resumo, Tribunal, VolumePorTribunal } from "../src/types/recorte.ts";

const CAMINHO_DADOS = fileURLToPath(new URL("../dados/observatorio.json", import.meta.url));
const PASTA_SAIDA = fileURLToPath(new URL("../public/data", import.meta.url));
const ANOS_RESUMO = 11;

export function sanitizarNomeArquivo(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function nomeDaMateria(materia: string | null): string {
  return materia === null ? "sem-materia" : materia;
}

interface GrupoRecorte {
  tribunal: string;
  classe: string;
  materia: string | null;
  classeOriginais: Set<string>;
  mensal: MensalNormalizado[];
  relatores: RelatorNormalizado[];
}

export function agruparPorRecorte(dados: ObservatorioNormalizado): Map<string, GrupoRecorte> {
  const grupos = new Map<string, GrupoRecorte>();

  const grupoDe = (tribunal: string, classe: string, materia: string | null): GrupoRecorte => {
    const chave = `${tribunal}::${classe}::${materia}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, { tribunal, classe, materia, classeOriginais: new Set(), mensal: [], relatores: [] });
    }
    return grupos.get(chave)!;
  };

  for (const linha of dados.mensal) {
    const grupo = grupoDe(linha.tribunal, linha.classe, linha.materia);
    grupo.classeOriginais.add(linha.classeOriginal);
    grupo.mensal.push(linha);
  }
  for (const linha of dados.relatores) {
    const grupo = grupoDe(linha.tribunal, linha.classe, linha.materia);
    grupo.classeOriginais.add(linha.classeOriginal);
    grupo.relatores.push(linha);
  }

  return grupos;
}

export function montarSaida(dados: ObservatorioNormalizado): {
  arquivos: Map<string, ArquivoRecorte>;
  manifesto: Manifesto;
} {
  const grupos = agruparPorRecorte(dados);
  const arquivos = new Map<string, ArquivoRecorte>();
  const recortesManifesto: EntradaManifesto[] = [];
  const nomesUsados = new Set<string>();

  for (const grupo of grupos.values()) {
    const nomeArquivo =
      `recortes/${grupo.tribunal}-${sanitizarNomeArquivo(grupo.classe)}-${sanitizarNomeArquivo(nomeDaMateria(grupo.materia))}.json`;
    if (nomesUsados.has(nomeArquivo)) {
      throw new Error(
        `process-data: nome de arquivo duplicado "${nomeArquivo}" ` +
          `(tribunal "${grupo.tribunal}", classe "${grupo.classe}", matéria "${grupo.materia}"). ` +
          `Dois recortes diferentes geraram o mesmo nome depois de tirar acento.`,
      );
    }
    nomesUsados.add(nomeArquivo);

    const totalDecisoes = grupo.mensal.reduce((soma, linha) => soma + linha.total, 0);
    const totalFavoraveis = grupo.mensal.reduce((soma, linha) => soma + linha.favoraveis, 0);

    arquivos.set(nomeArquivo, {
      tribunal: grupo.tribunal as ArquivoRecorte["tribunal"],
      classe: grupo.classe,
      materia: grupo.materia,
      classeOriginais: [...grupo.classeOriginais].sort(),
      mensal: grupo.mensal
        .map(({ mes, total, favoraveis, emAndamento }) => ({ mes, total, favoraveis, emAndamento }))
        .sort((a, b) => a.mes.localeCompare(b.mes)),
      relatores: grupo.relatores
        .map(({ relator, ano, total, favoraveis, contrarios, outros }) => ({
          relator,
          ano,
          total,
          favoraveis,
          contrarios,
          outros,
        }))
        .sort((a, b) => a.ano - b.ano || a.relator.localeCompare(b.relator)),
    });

    recortesManifesto.push({
      tribunal: grupo.tribunal as EntradaManifesto["tribunal"],
      classe: grupo.classe,
      materia: grupo.materia,
      totalDecisoes,
      totalFavoraveis,
      arquivo: nomeArquivo,
    });
  }

  recortesManifesto.sort(
    (a, b) =>
      a.tribunal.localeCompare(b.tribunal) ||
      a.classe.localeCompare(b.classe) ||
      (a.materia ?? "").localeCompare(b.materia ?? ""),
  );

  const manifesto: Manifesto = {
    geradoEm: dados.gerado_em,
    criterio: dados.criterio,
    universo: dados.universo,
    recortes: recortesManifesto,
  };

  return { arquivos, manifesto };
}

export function montarResumo(dados: ObservatorioNormalizado): Resumo {
  const anoReferencia = Number(dados.gerado_em.slice(0, 4));
  const anoMinimoResumo = anoReferencia - (ANOS_RESUMO - 1);

  // 1) ranking de classes por volume, todo o período, juntando as matérias
  // (mas nunca juntando classes diferentes entre si).
  const porClasse = new Map<string, ClasseDestaque>();
  for (const linha of dados.mensal) {
    const chave = `${linha.tribunal}::${linha.classe}`;
    if (!porClasse.has(chave)) {
      porClasse.set(chave, { tribunal: linha.tribunal, classe: linha.classe, total: 0, favoraveis: 0 });
    }
    const classe = porClasse.get(chave)!;
    classe.total += linha.total;
    classe.favoraveis += linha.favoraveis;
  }
  const todasClasses = [...porClasse.values()].sort((a, b) => b.total - a.total);
  const topClasses = todasClasses.slice(0, 8);

  // 2) volume por tribunal: é só contagem, então pode somar toda classe —
  // o problema é só com taxa (favoraveis/total), não com volume.
  const volumePorTribunal = new Map<Tribunal, number>();
  for (const classe of todasClasses) {
    volumePorTribunal.set(classe.tribunal, (volumePorTribunal.get(classe.tribunal) ?? 0) + classe.total);
  }

  // 3) a classe mais volumosa de CADA tribunal (todasClasses já está
  // ordenada, então a primeira vez que um tribunal aparece é a sua maior).
  const classeDestaquePorTribunal = new Map<Tribunal, string>();
  for (const classe of todasClasses) {
    if (!classeDestaquePorTribunal.has(classe.tribunal)) {
      classeDestaquePorTribunal.set(classe.tribunal, classe.classe);
    }
  }

  // 4) taxa por ano, só da classe de destaque de cada tribunal — nunca duas
  // classes diferentes no mesmo ponto do gráfico.
  const porAno = new Map<string, PontoAnualClasse>();
  for (const linha of dados.mensal) {
    if (classeDestaquePorTribunal.get(linha.tribunal) !== linha.classe) continue;
    const ano = Number(linha.mes.slice(0, 4));
    if (ano < anoMinimoResumo) continue;

    const chaveAno = `${linha.tribunal}::${ano}`;
    if (!porAno.has(chaveAno)) {
      porAno.set(chaveAno, {
        tribunal: linha.tribunal,
        classe: linha.classe,
        ano,
        total: 0,
        favoraveis: 0,
        emAndamento: ano === anoReferencia,
      });
    }
    const totalAno = porAno.get(chaveAno)!;
    totalAno.total += linha.total;
    totalAno.favoraveis += linha.favoraveis;
  }

  return {
    geradoEm: dados.gerado_em,
    criterio: dados.criterio,
    universo: dados.universo,
    porAno: [...porAno.values()].sort((a, b) => a.tribunal.localeCompare(b.tribunal) || a.ano - b.ano),
    porTribunalVolume: [...volumePorTribunal.entries()]
      .map(([tribunal, total]): VolumePorTribunal => ({ tribunal, total }))
      .sort((a, b) => a.tribunal.localeCompare(b.tribunal)),
    topClasses,
  };
}

export function escreverSaida(
  pastaSaida: string,
  arquivos: Map<string, ArquivoRecorte>,
  manifesto: Manifesto,
  resumo: Resumo,
): void {
  rmSync(pastaSaida, { recursive: true, force: true });
  mkdirSync(join(pastaSaida, "recortes"), { recursive: true });

  for (const [nomeArquivo, conteudo] of arquivos) {
    writeFileSync(join(pastaSaida, nomeArquivo), JSON.stringify(conteudo));
  }
  writeFileSync(join(pastaSaida, "manifest.json"), JSON.stringify(manifesto));
  writeFileSync(join(pastaSaida, "resumo.json"), JSON.stringify(resumo));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dados = lerObservatorio(CAMINHO_DADOS);
  const normalizados = normalizarDados(dados);
  const { arquivos, manifesto } = montarSaida(normalizados);
  const resumo = montarResumo(normalizados);
  escreverSaida(PASTA_SAIDA, arquivos, manifesto, resumo);
  console.log(`public/data/: ${arquivos.size} arquivos de recorte + manifest.json + resumo.json`);
}