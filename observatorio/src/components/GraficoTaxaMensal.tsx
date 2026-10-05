import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import type { LinhaMensal } from "@/types/recorte";

interface Props {
  mensal: LinhaMensal[];
}

interface Ponto {
  mes: string;
  taxa: number | null;
  taxaAndamento: number | null;
}

function prepararDados(mensal: LinhaMensal[]): Ponto[] {
  const pontos = mensal.map((l): Ponto => {
    const resultado = calcularTaxa(l.total, l.favoraveis);
    // base pequena: o mês não entra na linha, vira um buraco no gráfico
    if (resultado.status === "base-pequena") return { mes: l.mes, taxa: null, taxaAndamento: null };
    const taxa = resultado.taxa * 100;
    return l.emAndamento ? { mes: l.mes, taxa: null, taxaAndamento: taxa } : { mes: l.mes, taxa, taxaAndamento: null };
  });

  const ultimoFechado = [...pontos].reverse().find((p) => p.taxa !== null);
  const primeiroAndamento = pontos.find((p) => p.taxaAndamento !== null);
  if (ultimoFechado && primeiroAndamento) {
    ultimoFechado.taxaAndamento = ultimoFechado.taxa;
  }

  return pontos;
}

export default function GraficoTaxaMensal({ mensal }: Props) {
  const dados = prepararDados(mensal);
  const temAlgumPonto = dados.some((p) => p.taxa !== null || p.taxaAndamento !== null);
  const temMesEmAndamento = mensal.some((l) => l.emAndamento);
  const temMesBasePequena = mensal.some((l) => calcularTaxa(l.total, l.favoraveis).status === "base-pequena");

  if (!temAlgumPonto) {
    return (
      <p className="text-sm text-tinta/70">
        Nenhum mês deste recorte tem 30 decisões ou mais, então nenhuma taxa mensal pode ser mostrada aqui.
      </p>
    );
  }

  return (
    <div role="img" aria-label="Gráfico de linha: taxa favorável por mês, do recorte selecionado">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-linha)" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: "var(--color-tinta)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={32}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 12, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              formatter={(valor) => (typeof valor === "number" ? formatarPercentual(valor / 100) : valor)}
              contentStyle={{ fontFamily: "var(--font-corpo)", fontSize: 13, borderColor: "var(--color-linha)" }}
            />
            <Line type="monotone" dataKey="taxa" name="Taxa favorável" stroke="var(--color-stj)" strokeWidth={2} dot={false} connectNulls={false} />
            <Line
              type="monotone"
              dataKey="taxaAndamento"
              stroke="var(--color-stj)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              legendType="none"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {(temMesEmAndamento || temMesBasePequena) && (
        <p className="mt-2 text-sm text-tinta/70">
          {temMesEmAndamento && "O trecho tracejado é o mês em andamento, ainda incompleto. "}
          {temMesBasePequena && "Meses com menos de 30 decisões ficam fora da linha (base pequena)."}
        </p>
      )}
    </div>
  );
}