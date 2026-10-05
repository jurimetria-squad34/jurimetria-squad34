import { useEffect, useRef, useState } from "react";
import {
  classesDisponiveis,
  encontrarRecorte,
  materiasDisponiveis,
  recortePadrao,
  tribunaisDisponiveis,
} from "@/lib/filtros";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import { rotularMateria } from "@/lib/rotulos";
import GraficoTaxaMensal from "./GraficoTaxaMensal";
import GraficoVolumeMensal from "./GraficoVolumeMensal";
import type { ArquivoRecorte, Manifesto, Tribunal } from "@/types/recorte";

const SEM_MATERIA = "sem-materia";
const materiaParaParametro = (m: string | null) => m ?? SEM_MATERIA;
const materiaDoParametro = (v: string): string | null => (v === SEM_MATERIA ? null : v);

interface Selecao {
  tribunal: Tribunal;
  classe: string;
  materia: string | null;
}

function lerSelecaoDaUrl(): Partial<Selecao> {
  const params = new URLSearchParams(window.location.search);
  const tribunal = params.get("tribunal");
  const classe = params.get("classe");
  const materiaParam = params.get("materia");
  return {
    tribunal: tribunal === "STJ" || tribunal === "STF" ? tribunal : undefined,
    classe: classe ?? undefined,
    materia: materiaParam !== null ? materiaDoParametro(materiaParam) : undefined,
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

export default function SerieHistorica() {
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

    const daUrl = lerSelecaoDaUrl();
    const recorteDaUrl =
      daUrl.tribunal && daUrl.classe !== undefined && daUrl.materia !== undefined
        ? encontrarRecorte(manifest.recortes, daUrl.tribunal, daUrl.classe, daUrl.materia)
        : undefined;

    const entrada = recorteDaUrl ?? recortePadrao(manifest.recortes);
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

  if (erroManifest) {
    return <p className="text-tinta/70">Não consegui carregar a lista de filtros. Recarregue a página.</p>;
  }
  if (!manifest || !selecao) {
    return <p className="text-tinta/70">Carregando filtros…</p>;
  }

  const tribunais = tribunaisDisponiveis(manifest.recortes);
  const classes = classesDisponiveis(manifest.recortes, selecao.tribunal);
  const materias = materiasDisponiveis(manifest.recortes, selecao.tribunal, selecao.classe);

  const mudarTribunal = (tribunal: Tribunal) => {
    const novasClasses = classesDisponiveis(manifest.recortes, tribunal);
    const classe = novasClasses[0];
    const materia = materiasDisponiveis(manifest.recortes, tribunal, classe)[0] ?? null;
    setSelecao({ tribunal, classe, materia });
  };
  const mudarClasse = (classe: string) => {
    const materia = materiasDisponiveis(manifest.recortes, selecao.tribunal, classe)[0] ?? null;
    setSelecao({ tribunal: selecao.tribunal, classe, materia });
  };
  const mudarMateria = (materia: string | null) => {
    setSelecao({ ...selecao, materia });
  };

  const entradaAtual = encontrarRecorte(manifest.recortes, selecao.tribunal, selecao.classe, selecao.materia);
  const taxaAgregada = entradaAtual ? calcularTaxa(entradaAtual.totalDecisoes, entradaAtual.totalFavoraveis) : null;

  return (
    <div>
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

      {entradaAtual && recorte && (
        <p className="mt-6 max-w-prose text-sm text-tinta/70">
          <strong className="font-medium text-tinta">Universo:</strong> {selecao.tribunal}, classe {selecao.classe}
          {recorte.classeOriginais.length > 1 ? ` (grafias unificadas: ${recorte.classeOriginais.join(", ")})` : ""}
          , {rotularMateria(selecao.materia).toLowerCase()}.{" "}
          <strong className="font-medium text-tinta">Critério de decisão favorável:</strong> {manifest.criterio}
        </p>
      )}

      {carregandoRecorte && <p className="mt-8 text-tinta/70">Carregando dados do recorte…</p>}
      {erroRecorte && <p className="mt-8 text-tinta/70">Não consegui carregar este recorte. Tente outro filtro.</p>}

      {recorte && !carregandoRecorte && !erroRecorte && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-tinta/70">Decisões no período</dt>
              <dd className="font-titulo text-2xl font-semibold text-toga">
                {entradaAtual!.totalDecisoes.toLocaleString("pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-tinta/70">Taxa favorável</dt>
              <dd className="font-titulo text-2xl font-semibold text-toga">
                {taxaAgregada?.status === "ok" ? formatarPercentual(taxaAgregada.taxa) : "base pequena"}
              </dd>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="titulo-taxa-mensal">
            <h2 id="titulo-taxa-mensal" className="font-titulo text-xl font-semibold text-toga">
              Taxa favorável por mês
            </h2>
            <div className="mt-4">
              <GraficoTaxaMensal mensal={recorte.mensal} />
            </div>
          </section>

          <section className="mt-10" aria-labelledby="titulo-volume-mensal">
            <h2 id="titulo-volume-mensal" className="font-titulo text-xl font-semibold text-toga">
              Volume de decisões por mês
            </h2>
            <div className="mt-4">
              <GraficoVolumeMensal mensal={recorte.mensal} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}