import { lazy, Suspense } from "react";
import { useSelecaoRecorte } from "./useSelecaoRecorte";
import FiltrosRecorte from "./FiltrosRecorte";
import QuandoVisivel from "./QuandoVisivel";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import { rotularMateria } from "@/lib/rotulos";

const GraficoTaxaMensal = lazy(() => import("./GraficoTaxaMensal"));
const GraficoVolumeMensal = lazy(() => import("./GraficoVolumeMensal"));

const CARREGANDO_GRAFICO = <p className="text-sm text-tinta/70">Carregando gráfico…</p>;

export default function SerieHistorica() {
  const {
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
  } = useSelecaoRecorte();

  if (erroManifest) {
    return <p className="text-tinta/70">Não consegui carregar a lista de filtros. Recarregue a página.</p>;
  }
  if (!manifest || !selecao) {
    return <p className="text-tinta/70">Carregando filtros…</p>;
  }

  const taxaAgregada = entradaAtual ? calcularTaxa(entradaAtual.totalDecisoes, entradaAtual.totalFavoraveis) : null;

  const status = carregandoRecorte
  ? "Carregando dados do recorte…"
  : erroRecorte
    ? "Não foi possível carregar este recorte."
    : recorte
      ? `Dados carregados: ${selecao.tribunal}, classe ${selecao.classe}.`
      : "";

  return (
    <div>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      
      <FiltrosRecorte
        tribunais={tribunais}
        classes={classes}
        materias={materias}
        selecao={selecao}
        mudarTribunal={mudarTribunal}
        mudarClasse={mudarClasse}
        mudarMateria={mudarMateria}
      />

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
          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          </dl>

          <section className="mt-10" aria-labelledby="titulo-taxa-mensal">
            <h2 id="titulo-taxa-mensal" className="font-titulo text-xl font-semibold text-toga">
              Taxa favorável por mês
            </h2>
            <div className="mt-4">
              <QuandoVisivel alturaMinima={256}>
                <Suspense fallback={CARREGANDO_GRAFICO}>
                  <GraficoTaxaMensal mensal={recorte.mensal} />
                </Suspense>
              </QuandoVisivel>
            </div>
          </section>

          <section className="mt-10" aria-labelledby="titulo-volume-mensal">
            <h2 id="titulo-volume-mensal" className="font-titulo text-xl font-semibold text-toga">
              Volume de decisões por mês
            </h2>
            <div className="mt-4">
              <QuandoVisivel alturaMinima={224}>
                <Suspense fallback={CARREGANDO_GRAFICO}>
                  <GraficoVolumeMensal mensal={recorte.mensal} />
                </Suspense>
              </QuandoVisivel>
            </div>
          </section>
        </>
      )}
    </div>
  );
}