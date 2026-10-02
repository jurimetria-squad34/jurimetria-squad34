import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import type { PontoAnual } from "@/types/recorte";

interface Props {
  pontos: PontoAnual[];
}

interface LinhaGrafico {
  ano: number;
  taxaStj: number | null;
  taxaStjAndamento: number | null;
  taxaStf: number | null;
  taxaStfAndamento: number | null;
}

function prepararDados(pontos: PontoAnual[]): LinhaGrafico[] {
  const porAno = new Map<number, LinhaGrafico>();
  const taxaDoPonto = (p: PontoAnual): number | null => {
    const resultado = calcularTaxa(p.total, p.favoraveis);
    return resultado.status === "ok" ? resultado.taxa * 100 : null;
  };

  for (const p of pontos) {
    if (!porAno.has(p.ano)) {
      porAno.set(p.ano, { ano: p.ano, taxaStj: null, taxaStjAndamento: null, taxaStf: null, taxaStfAndamento: null });
    }
    const linha = porAno.get(p.ano)!;
    const taxa = taxaDoPonto(p);
    if (p.tribunal === "STJ") {
      if (p.emAndamento) linha.taxaStjAndamento = taxa;
      else linha.taxaStj = taxa;
    } else {
      if (p.emAndamento) linha.taxaStfAndamento = taxa;
      else linha.taxaStf = taxa;
    }
  }

  const linhas = [...porAno.values()].sort((a, b) => a.ano - b.ano);
  const penultima = linhas.at(-2);
  if (penultima) {
    penultima.taxaStjAndamento = penultima.taxaStj;
    penultima.taxaStfAndamento = penultima.taxaStf;
  }
  return linhas;
}

export default function GraficoTaxaAnual({ pontos }: Props) {
  const dados = prepararDados(pontos);
  const anoAndamento = pontos.find((p) => p.emAndamento)?.ano;

  return (
    <div role="img" aria-label="Gráfico de linha: taxa favorável por ano, STJ e STF, dos últimos 11 anos">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-linha)" vertical={false} />
            <XAxis dataKey="ano" tick={{ fontSize: 12, fill: "var(--color-tinta)" }} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 12, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              formatter={(valor) => (typeof valor === "number" ? formatarPercentual(valor / 100) : valor)}
              labelFormatter={(ano) => (ano === anoAndamento ? `${ano} (em andamento)` : String(ano))}
              contentStyle={{ fontFamily: "var(--font-corpo)", fontSize: 13, borderColor: "var(--color-linha)" }}
            />
            <Legend wrapperStyle={{ fontSize: 13, fontFamily: "var(--font-corpo)" }} />
            <Line type="monotone" dataKey="taxaStj" name="STJ" stroke="var(--color-stj)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            <Line
              type="monotone"
              dataKey="taxaStjAndamento"
              name="STJ (em andamento)"
              stroke="var(--color-stj)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3 }}
              legendType="none"
              connectNulls={false}
            />
            <Line type="monotone" dataKey="taxaStf" name="STF" stroke="var(--color-stf)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            <Line
              type="monotone"
              dataKey="taxaStfAndamento"
              name="STF (em andamento)"
              stroke="var(--color-stf)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3 }}
              legendType="none"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {anoAndamento && (
        <p className="mt-2 text-sm text-tinta/70">
          O trecho tracejado ({anoAndamento}) é o ano em andamento: ainda faltam decisões desse ano para serem
          publicadas, então a taxa tende a mudar.
        </p>
      )}
    </div>
  );
}