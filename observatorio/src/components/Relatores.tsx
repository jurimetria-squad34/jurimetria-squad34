import { lazy, Suspense } from "react";
import { useSelecaoRecorte } from "./useSelecaoRecorte";
import FiltrosRecorte from "./FiltrosRecorte";
import LegendaDados from "./LegendaDados";
import QuandoVisivel from "./QuandoVisivel";
import { agregarPorRelator, MINIMO_DECISOES_RELATOR_ANO, selecionarRelatoresParaGrafico } from "@/lib/relatores";
import { LIMITE_BASE_PEQUENA } from "@/lib/taxa";
import { calcularJanelasDeAnos, calcularTendencia, formatarTendencia } from "@/lib/tendencia";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import { descreverUniverso } from "@/lib/rotulos";
import { formatarFaixaDeAnos, periodoDosRelatores } from "@/lib/periodo";

const GraficoRelatores = lazy(() => import("./GraficoRelatores"));

const CARREGANDO_GRAFICO = <p className="text-sm text-tinta/70">Carregando gráfico…</p>;

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
  const { pontos: pontosGrafico, elegiveis } = selecionarRelatoresParaGrafico(relatores);
  const faixaAnterior = formatarFaixaDeAnos(anosAnteriores);
  const faixaRecente = formatarFaixaDeAnos(anosRecentes);

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

      {carregandoRecorte && <p className="mt-8 text-tinta/70">Carregando dados do recorte…</p>}
      {erroRecorte && <p className="mt-8 text-tinta/70">Não consegui carregar este recorte. Tente outro filtro.</p>}

      {recorte && !carregandoRecorte && !erroRecorte && (
        <section className="mt-8" aria-labelledby="titulo-relatores">
          <h2 id="titulo-relatores" className="font-titulo text-xl font-semibold text-toga">
            Relatores
          </h2>

          {recorte && pontosGrafico.length > 0 && (
            <div className="mt-6">
              <h3 className="font-titulo text-lg font-semibold text-toga">Taxa favorável por janela de anos</h3>
              <p className="mt-1 max-w-prose text-sm text-tinta/70">
                {elegiveis > pontosGrafico.length
                  ? `Os ${pontosGrafico.length} relatores com mais decisões, entre ${elegiveis} com base suficiente em pelo menos uma das janelas. `
                  : `${pontosGrafico.length === 1 ? "O relator" : `Os ${pontosGrafico.length} relatores`} com base suficiente em pelo menos uma das janelas. `}
                Janela sem barra tem base pequena (menos de {LIMITE_BASE_PEQUENA} decisões). Todos os relatores estão na tabela.
              </p>
              <div className="mt-4">
                <QuandoVisivel alturaMinima={pontosGrafico.length * 52 + 80}>
                  <Suspense fallback={CARREGANDO_GRAFICO}>
                    <GraficoRelatores
                      pontos={pontosGrafico}
                      faixaAnterior={faixaAnterior}
                      faixaRecente={faixaRecente}
                      tribunal={recorte.tribunal}
                    />
                  </Suspense>
                </QuandoVisivel>
              </div>
              <LegendaDados
                universo={descreverUniverso(recorte.tribunal, recorte.classe, recorte.materia, recorte.classeOriginais)}
                periodo={`taxa de ${faixaAnterior} e de ${faixaRecente} (os 3 últimos anos fechados contra os 3 anteriores)`}
                criterio={manifest.criterio}
              />
            </div>
          )}

          {recorte && relatores.length > 0 && pontosGrafico.length === 0 && (
            <p className="mt-6 max-w-prose text-sm text-tinta/70">
              Nenhum relator tem {LIMITE_BASE_PEQUENA} decisões ou mais em {faixaAnterior} ou em {faixaRecente}, por isso
              não há gráfico. A tabela mostra todos os relatores.
            </p>
          )}

          {relatores.length === 0 ? (
            <p className="mt-4 text-sm text-tinta/70">
              Nenhum relator com dados suficientes neste recorte (a fonte só traz relatores com{" "}
              {MINIMO_DECISOES_RELATOR_ANO} decisões ou mais em um mesmo ano).
            </p>
          ) : (
            <div className="mt-10">
              <h3 className="font-titulo text-lg font-semibold text-toga">Tabela completa</h3>
              <div className="mt-4 overflow-x-auto" role="region" aria-label="Tabela de relatores (rolagem horizontal)" tabIndex={0}>
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <caption className="sr-only">
                    Relatores de {selecao.tribunal} {selecao.classe}, com total de decisões, taxa favorável e
                    tendência entre {faixaAnterior} e {faixaRecente}
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
                        Tendência ({faixaAnterior} → {faixaRecente})
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
            </div>
          )}
          
          {relatores.length > 0 && (
            <LegendaDados
              universo={descreverUniverso(recorte.tribunal, recorte.classe, recorte.materia, recorte.classeOriginais)}
              periodo={`total e taxa de ${periodoDosRelatores(recorte.relatores, anoReferencia)}; tendência: ${faixaRecente} contra ${faixaAnterior}`}
              criterio={manifest.criterio}
              observacao={`Só entram relatores com pelo menos ${MINIMO_DECISOES_RELATOR_ANO} decisões em um mesmo ano; por isso a soma da tabela pode ser menor que o total do recorte.`}
            />
          )}
        </section>
      )}
    </div>
  );
}