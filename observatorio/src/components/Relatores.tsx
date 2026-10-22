import { useSelecaoRecorte } from "./useSelecaoRecorte";
import FiltrosRecorte from "./FiltrosRecorte";
import { agregarPorRelator } from "@/lib/relatores";
import { calcularJanelasDeAnos, calcularTendencia, formatarTendencia } from "@/lib/tendencia";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import { rotularMateria } from "@/lib/rotulos";

export default function Relatores() {
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

  const anoReferencia = Number(manifest.geradoEm.slice(0, 4));
  const { anosAnteriores, anosRecentes } = calcularJanelasDeAnos(anoReferencia);
  const relatores = recorte ? agregarPorRelator(recorte.relatores, anosAnteriores, anosRecentes) : [];

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

      {recorte && (
        <p className="mt-6 max-w-prose text-sm text-tinta/70">
          <strong className="font-medium text-tinta">Universo:</strong> {selecao.tribunal}, classe {selecao.classe},{" "}
          {rotularMateria(selecao.materia).toLowerCase()}.{" "}
          <strong className="font-medium text-tinta">Critério de decisão favorável:</strong> {manifest.criterio}
          {" "}
          <strong className="font-medium text-tinta">Tendência:</strong> taxa agregada de {anosRecentes.join("–")}{" "}
          contra {anosAnteriores.join("–")}.
        </p>
      )}

      {carregandoRecorte && <p className="mt-8 text-tinta/70">Carregando dados do recorte…</p>}
      {erroRecorte && <p className="mt-8 text-tinta/70">Não consegui carregar este recorte. Tente outro filtro.</p>}

      {recorte && !carregandoRecorte && !erroRecorte && (
        <section className="mt-8" aria-labelledby="titulo-relatores">
          <h2 id="titulo-relatores" className="font-titulo text-xl font-semibold text-toga">
            Relatores
          </h2>

          {relatores.length === 0 ? (
            <p className="mt-4 text-sm text-tinta/70">
              Nenhum relator com dados suficientes neste recorte (a fonte só traz relator-ano com 20 decisões ou
              mais, de 2015 em diante).
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto" role="region" aria-label="Tabela de relatores (rolagem horizontal)" tabIndex={0}>
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <caption className="sr-only">
                  Relatores de {selecao.tribunal} {selecao.classe}, com total de decisões, taxa favorável e
                  tendência entre {anosAnteriores.join("–")} e {anosRecentes.join("–")}
                </caption>
                <thead>
                  <tr className="border-b border-linha text-left text-tinta/70">
                    <th scope="col" className="py-2 pr-4 font-medium">
                      Relator
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      Total
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      Taxa favorável
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      Tendência ({anosAnteriores.join("–")} → {anosRecentes.join("–")})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatores.map((r) => {
                    const taxa = calcularTaxa(r.total, r.favoraveis);
                    const tendencia = calcularTendencia(r.janelaAnterior, r.janelaRecente);
                    return (
                      <tr key={r.relator} className="border-b border-linha last:border-0">
                        <th scope="row" className="py-2 pr-4 text-left font-normal text-tinta">
                          {r.relator}
                        </th>
                        <td className="py-2 pr-4 text-tinta">{r.total.toLocaleString("pt-BR")}</td>
                        <td className="py-2 pr-4 text-tinta">
                          {taxa.status === "ok" ? formatarPercentual(taxa.taxa) : "base pequena"}
                        </td>
                        <td className="py-2 text-tinta">{formatarTendencia(tendencia)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}