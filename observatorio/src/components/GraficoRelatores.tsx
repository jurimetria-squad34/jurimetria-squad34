import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatarPercentual } from "@/lib/formato";
import { quebrarEmLinhas } from "@/lib/rotulos";
import type { PontoRelatorGrafico } from "@/lib/relatores";
import type { Tribunal } from "@/types/recorte";

interface Props {
  pontos: PontoRelatorGrafico[];
  faixaAnterior: string;
  faixaRecente: string;
  tribunal: Tribunal;
}

const COR_ANTERIOR = "#7a8797";
const COR_RECENTE: Record<Tribunal, string> = { STJ: "var(--color-stj)", STF: "var(--color-stf)" };
const ALTURA_POR_RELATOR = 52;

interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { index: number };
  pontos: PontoRelatorGrafico[];
}

function RotuloRelator({ x = 0, y = 0, payload, pontos }: TickProps) {
  const ponto = payload ? pontos[payload.index] : undefined;
  if (!ponto) return null;
  const nome = quebrarEmLinhas(ponto.nomeCurto, 17, 2);
  const posX = Number(x) - 4;
  const primeiroDeslocamento = -(nome.length * 0.6) + 0.35; 
  return (
    <text x={posX} y={Number(y)} textAnchor="end" fill="var(--color-tinta)">
      {nome.map((linha, i) => (
        <tspan key={linha} x={posX} dy={i === 0 ? `${primeiroDeslocamento}em` : "1.2em"} fontSize={12}>
          {linha}
        </tspan>
      ))}
      <tspan x={posX} dy="1.2em" fontSize={11} fillOpacity={0.7}>
        {ponto.total.toLocaleString("pt-BR")} decisões
      </tspan>
    </text>
  );
}

interface DicaProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  faixaAnterior: string;
  faixaRecente: string;
}

function descreverJanela(taxa: number | null, total: number): string {
  const decisoes = `${total.toLocaleString("pt-BR")} decisões`;
  return taxa === null ? `base pequena (${decisoes})` : `${formatarPercentual(taxa)} (${decisoes})`;
}

function DicaRelator({ active, payload, faixaAnterior, faixaRecente }: DicaProps) {
  const ponto = active && payload?.length ? (payload[0].payload as PontoRelatorGrafico | undefined) : undefined;
  if (!ponto) return null;
  return (
    <div
      className="rounded border border-linha bg-white p-3 text-sm text-tinta shadow-sm"
      style={{ fontFamily: "var(--font-corpo)" }}
    >
      <p className="font-medium">{ponto.nomeCompleto}</p>
      <p className="text-tinta/70">Total: {ponto.total.toLocaleString("pt-BR")} decisões</p>
      <p className="mt-1">
        {faixaAnterior}: {descreverJanela(ponto.taxaAnterior, ponto.totalAnterior)}
      </p>
      <p>
        {faixaRecente}: {descreverJanela(ponto.taxaRecente, ponto.totalRecente)}
      </p>
    </div>
  );
}

const rotuloPercentual = (valor: unknown): string => (typeof valor === "number" ? formatarPercentual(valor / 100) : "");

export default function GraficoRelatores({ pontos, faixaAnterior, faixaRecente, tribunal }: Props) {
  const dados = pontos.map((p) => ({
    ...p,
    pAnterior: p.taxaAnterior === null ? null : p.taxaAnterior * 100,
    pRecente: p.taxaRecente === null ? null : p.taxaRecente * 100,
  }));
  const corRecente = COR_RECENTE[tribunal];

  const maiorTaxa = Math.max(0, ...dados.flatMap((d) => [d.pAnterior ?? 0, d.pRecente ?? 0]));
  const limite = Math.min(100, Math.max(10, Math.ceil(maiorTaxa / 10) * 10));
  const passo = limite > 50 ? 20 : 10;
  const marcas = Array.from({ length: Math.floor(limite / passo) + 1 }, (_, i) => i * passo);

  return (
    <div
      role="img"
      aria-label={`Gráfico de barras: taxa favorável dos ${pontos.length} relatores com mais decisões, em ${faixaAnterior} e em ${faixaRecente}. Os mesmos números estão na tabela abaixo.`}
    >
      <div style={{ height: pontos.length * ALTURA_POR_RELATOR + 40 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 0 }} barGap={2}>
            <XAxis
              type="number"
              domain={[0, limite]}
              ticks={marcas}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 12, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="relator"
              width={128}
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={(props: Omit<TickProps, "pontos">) => <RotuloRelator {...props} pontos={pontos} />}
            />
            <Tooltip
              cursor={{ fill: "rgba(27, 42, 74, 0.06)" }}
              content={(props) => (
                <DicaRelator
                  active={props.active}
                  payload={props.payload}
                  faixaAnterior={faixaAnterior}
                  faixaRecente={faixaRecente}
                />
              )}
            />
            <Bar isAnimationActive={false} dataKey="pAnterior" name={faixaAnterior} fill={COR_ANTERIOR} radius={[0, 3, 3, 0]}>
              <LabelList dataKey="pAnterior" position="right" fontSize={11} fill="var(--color-tinta)" formatter={rotuloPercentual} />
            </Bar>
            <Bar isAnimationActive={false} dataKey="pRecente" name={faixaRecente} fill={corRecente} radius={[0, 3, 3, 0]}>
              <LabelList dataKey="pRecente" position="right" fontSize={11} fill="var(--color-tinta)" formatter={rotuloPercentual} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta/70">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: COR_ANTERIOR }} />
          {faixaAnterior} (barra de cima)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: corRecente }} />
          {faixaRecente} (barra de baixo)
        </span>
      </div>
    </div>
  );
}