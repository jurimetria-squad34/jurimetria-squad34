import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import type { TribunalResumo } from "@/types/recorte";

interface Props {
  porTribunal: TribunalResumo[];
}

const CORES: Record<string, string> = { STJ: "var(--color-stj)", STF: "var(--color-stf)" };

export default function GraficoTaxaPorTribunal({ porTribunal }: Props) {
  const dados = porTribunal.map((t) => {
    const r = calcularTaxa(t.total, t.favoraveis);
    return { tribunal: t.tribunal, taxa: r.status === "ok" ? r.taxa * 100 : 0, status: r.status };
  });

  return (
    <div role="img" aria-label="Gráfico de barras: taxa favorável geral, STJ comparado com STF">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="tribunal" tick={{ fontSize: 13, fill: "var(--color-tinta)" }} tickLine={false} axisLine={false} />
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
            <Bar dataKey="taxa" radius={[4, 4, 0, 0]} maxBarSize={72}>
              {dados.map((d) => (
                <Cell key={d.tribunal} fill={CORES[d.tribunal]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}