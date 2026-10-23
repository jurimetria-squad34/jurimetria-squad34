import type { EntradaManifesto, Tribunal } from "@/types/recorte";

//Tribunais que têm pelo menos um recorte, em ordem alfabética. 
export function tribunaisDisponiveis(recortes: EntradaManifesto[]): Tribunal[] {
  return [...new Set(recortes.map((r) => r.tribunal))].sort();
}

//Classes disponíveis para um tribunal, em ordem alfabética.
export function classesDisponiveis(recortes: EntradaManifesto[], tribunal: Tribunal): string[] {
  const classes = recortes.filter((r) => r.tribunal === tribunal).map((r) => r.classe);
  return [...new Set(classes)].sort((a, b) => a.localeCompare(b));
}

//Matérias disponíveis para um tribunal+classe. `null` (sem matéria) sempre por último.
export function materiasDisponiveis(recortes: EntradaManifesto[], tribunal: Tribunal, classe: string): (string | null)[] {
  const materias = recortes.filter((r) => r.tribunal === tribunal && r.classe === classe).map((r) => r.materia);
  const unicas = [...new Set(materias)];
  return unicas.sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b);
  });
}

export function encontrarRecorte(
  recortes: EntradaManifesto[],
  tribunal: Tribunal,
  classe: string,
  materia: string | null,
): EntradaManifesto | undefined {
  return recortes.find((r) => r.tribunal === tribunal && r.classe === classe && r.materia === materia);
}

export function recortePadrao(recortes: EntradaManifesto[]): EntradaManifesto {
  return [...recortes].sort((a, b) => b.totalDecisoes - a.totalDecisoes)[0];
}

export interface PedidoDeRecorte {
  tribunal?: string;
  classe?: string;
  materia?: string | null;
}

const minusculas = (texto: string): string => texto.toLocaleLowerCase("pt-BR");

export function resolverRecorte(recortes: EntradaManifesto[], pedido: PedidoDeRecorte): EntradaManifesto {
  const tribunalPedido = pedido.tribunal?.trim().toUpperCase();
  const tribunal = tribunalPedido === "STJ" || tribunalPedido === "STF" ? tribunalPedido : undefined;
  const classe = pedido.classe?.trim() || undefined;
  const materia = pedido.materia === "" ? undefined : pedido.materia;

  const tentativas: PedidoDeRecorte[] = [{ tribunal, classe, materia }, { tribunal, classe }, { tribunal }];
  for (const t of tentativas) {
    const candidatos = recortes.filter(
      (r) =>
        (t.tribunal === undefined || r.tribunal === t.tribunal) &&
        (t.classe === undefined || minusculas(r.classe) === minusculas(t.classe)) &&
        (t.materia === undefined ||
          (t.materia === null ? r.materia === null : r.materia !== null && minusculas(r.materia) === minusculas(t.materia))),
    );
    if (candidatos.length > 0) return recortePadrao(candidatos);
  }
  return recortePadrao(recortes);
}