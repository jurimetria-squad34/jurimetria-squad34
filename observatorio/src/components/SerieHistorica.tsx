import { useSelecaoRecorte } from "./useSelecaoRecorte";
import FiltrosRecorte from "./FiltrosRecorte";
import GraficoTaxaMensal from "./GraficoTaxaMensal";
import GraficoVolumeMensal from "./GraficoVolumeMensal";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import { rotularMateria } from "@/lib/rotulos";

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

  return (
    <div>
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