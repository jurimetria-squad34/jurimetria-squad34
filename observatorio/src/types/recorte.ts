/**
 * Tipos dos arquivos menores que scripts/process-data.ts gera dentro de public/data/
 */
export type { Tribunal } from "./observatorio.ts";
import type { Tribunal } from "./observatorio.ts";

export interface LinhaMensal {
  mes: string;
  total: number;
  favoraveis: number;
  emAndamento: boolean;
}

export interface LinhaRelator {
  relator: string;
  ano: number;
  total: number;
  favoraveis: number;
  contrarios: number;
  outros: number;
}

export interface ArquivoRecorte {
  tribunal: Tribunal;
  classe: string;
  materia: string | null;
  classeOriginais: string[];
  mensal: LinhaMensal[];
  relatores: LinhaRelator[];
}

export interface EntradaManifesto {
  tribunal: Tribunal;
  classe: string;
  materia: string | null;
  totalDecisoes: number;
  totalFavoraveis: number;
  arquivo: string;
}

export interface Manifesto {
  geradoEm: string;
  criterio: string;
  universo: { tribunais: Tribunal[]; decisoes: number; de: number; ate: number };
  recortes: EntradaManifesto[];
}

export interface PontoAnualClasse {
  tribunal: Tribunal;
  classe: string;
  ano: number;
  total: number;
  favoraveis: number;
  emAndamento: boolean;
}

export interface ClasseDestaque {
  tribunal: Tribunal;
  classe: string;
  total: number;
  favoraveis: number;
}

export interface VolumePorTribunal {
  tribunal: Tribunal;
  total: number;
}

export interface Resumo {
  geradoEm: string;
  criterio: string;
  universo: { tribunais: Tribunal[]; decisoes: number; de: number; ate: number };
  porAno: PontoAnualClasse[];
  porTribunalVolume: VolumePorTribunal[];
  topClasses: ClasseDestaque[];
}