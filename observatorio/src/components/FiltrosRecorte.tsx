import { materiaDoParametro, materiaParaParametro } from "./useSelecaoRecorte";
import { rotularMateria } from "@/lib/rotulos";
import type { Selecao } from "./useSelecaoRecorte";
import type { Tribunal } from "@/types/recorte";

interface Props {
  tribunais: Tribunal[];
  classes: string[];
  materias: (string | null)[];
  selecao: Selecao;
  mudarTribunal: (tribunal: Tribunal) => void;
  mudarClasse: (classe: string) => void;
  mudarMateria: (materia: string | null) => void;
}

export default function FiltrosRecorte({ tribunais, classes, materias, selecao, mudarTribunal, mudarClasse, mudarMateria }: Props) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-linha pb-8">
      <div>
        <label htmlFor="filtro-tribunal" className="block text-sm text-tinta/70">
          Tribunal
        </label>
        <select
          id="filtro-tribunal"
          value={selecao.tribunal}
          onChange={(e) => mudarTribunal(e.target.value as Tribunal)}
          className="mt-1 rounded border border-linha bg-white px-3 py-2 text-tinta"
        >
          {tribunais.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-classe" className="block text-sm text-tinta/70">
          Classe
        </label>
        <select
          id="filtro-classe"
          value={selecao.classe}
          onChange={(e) => mudarClasse(e.target.value)}
          className="mt-1 rounded border border-linha bg-white px-3 py-2 text-tinta"
        >
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-materia" className="block text-sm text-tinta/70">
          Matéria
        </label>
        <select
          id="filtro-materia"
          value={materiaParaParametro(selecao.materia)}
          onChange={(e) => mudarMateria(materiaDoParametro(e.target.value))}
          className="mt-1 rounded border border-linha bg-white px-3 py-2 text-tinta"
        >
          {materias.map((m) => (
            <option key={materiaParaParametro(m)} value={materiaParaParametro(m)}>
              {rotularMateria(m)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}