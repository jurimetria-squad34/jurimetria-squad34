import { useEffect, useRef, useState } from "react";
import {
  classesDisponiveis,
  encontrarRecorte,
  materiasDisponiveis,
  resolverRecorte,
  tribunaisDisponiveis,
} from "@/lib/filtros";
import type { PedidoDeRecorte } from "@/lib/filtros";
import type { ArquivoRecorte, Manifesto, Tribunal } from "@/types/recorte";

const SEM_MATERIA = "sem-materia";
export const materiaParaParametro = (m: string | null): string => m ?? SEM_MATERIA;
export const materiaDoParametro = (v: string): string | null => (v === SEM_MATERIA ? null : v);

export interface Selecao {
  tribunal: Tribunal;
  classe: string;
  materia: string | null;
}

function lerPedidoDaUrl(): PedidoDeRecorte {
  const params = new URLSearchParams(window.location.search);
  const materia = params.get("materia");
  return {
    tribunal: params.get("tribunal") ?? undefined,
    classe: params.get("classe") ?? undefined,
    materia: materia === null ? undefined : materiaDoParametro(materia),
  };
}

function escreverSelecaoNaUrl(selecao: Selecao) {
  const params = new URLSearchParams();
  params.set("tribunal", selecao.tribunal);
  params.set("classe", selecao.classe);
  params.set("materia", materiaParaParametro(selecao.materia));
  const novaUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", novaUrl);
}

export function useSelecaoRecorte() {
  const [manifest, setManifest] = useState<Manifesto | null>(null);
  const [erroManifest, setErroManifest] = useState(false);
  const [selecao, setSelecao] = useState<Selecao | null>(null);
  const [recorte, setRecorte] = useState<ArquivoRecorte | null>(null);
  const [carregandoRecorte, setCarregandoRecorte] = useState(false);
  const [erroRecorte, setErroRecorte] = useState(false);
  const jaLeuUrl = useRef(false);

  useEffect(() => {
    fetch("/data/manifest.json")
      .then((r) => {
        if (!r.ok) throw new Error("manifesto não encontrado");
        return r.json() as Promise<Manifesto>;
      })
      .then(setManifest)
      .catch(() => setErroManifest(true));
  }, []);

  useEffect(() => {
    if (!manifest || jaLeuUrl.current) return;
    jaLeuUrl.current = true;

    const entrada = resolverRecorte(manifest.recortes, lerPedidoDaUrl());
    setSelecao({ tribunal: entrada.tribunal, classe: entrada.classe, materia: entrada.materia });
  }, [manifest]);

  useEffect(() => {
    if (!manifest || !selecao) return;
    escreverSelecaoNaUrl(selecao);

    const entrada = encontrarRecorte(manifest.recortes, selecao.tribunal, selecao.classe, selecao.materia);
    if (!entrada) return;

    setCarregandoRecorte(true);
    setErroRecorte(false);
    fetch(`/data/${entrada.arquivo}`)
      .then((r) => {
        if (!r.ok) throw new Error("recorte não encontrado");
        return r.json() as Promise<ArquivoRecorte>;
      })
      .then((dados) => {
        setRecorte(dados);
        setCarregandoRecorte(false);
      })
      .catch(() => {
        setErroRecorte(true);
        setCarregandoRecorte(false);
      });
  }, [manifest, selecao]);

  const tribunais = manifest ? tribunaisDisponiveis(manifest.recortes) : [];
  const classes = manifest && selecao ? classesDisponiveis(manifest.recortes, selecao.tribunal) : [];
  const materias = manifest && selecao ? materiasDisponiveis(manifest.recortes, selecao.tribunal, selecao.classe) : [];
  const entradaAtual =
    manifest && selecao ? encontrarRecorte(manifest.recortes, selecao.tribunal, selecao.classe, selecao.materia) : undefined;

  const mudarTribunal = (tribunal: Tribunal) => {
    if (!manifest) return;
    const novasClasses = classesDisponiveis(manifest.recortes, tribunal);
    const classe = novasClasses[0];
    const materia = materiasDisponiveis(manifest.recortes, tribunal, classe)[0] ?? null;
    setSelecao({ tribunal, classe, materia });
  };
  const mudarClasse = (classe: string) => {
    if (!manifest || !selecao) return;
    const materia = materiasDisponiveis(manifest.recortes, selecao.tribunal, classe)[0] ?? null;
    setSelecao({ tribunal: selecao.tribunal, classe, materia });
  };
  const mudarMateria = (materia: string | null) => {
    if (!selecao) return;
    setSelecao({ ...selecao, materia });
  };

  return {
    manifest,
    erroManifest,
    selecao,
    tribunais,
    classes,
    materias,
    mudarTribunal,
    mudarClasse,
    mudarMateria,
    entradaAtual,
    recorte,
    carregandoRecorte,
    erroRecorte,
  };
}