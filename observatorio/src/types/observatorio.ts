export type Tribunal = "STF" | "STJ";

export interface Universo {
  tribunais: Tribunal[];
  decisoes: number;
  de: number;
  ate: number;
}

export interface Mensal {
  tribunal: Tribunal;
  materia: string | null;
  classe: string;
  mes: string;
  total: number;
  favoraveis: number;
}

export interface Relator {
  tribunal: Tribunal;
  materia: string | null;
  classe: string;
  relator: string;
  ano: number;
  total: number;
  favoraveis: number;
  contrarios: number;
  outros: number;
}

export interface ObservatorioData {
  gerado_em: string;
  criterio: string;
  universo: Universo;
  mensal: Mensal[];
  relatores: Relator[];
}