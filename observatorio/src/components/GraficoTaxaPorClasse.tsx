import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import type { ClasseDestaque } from "@/types/recorte";

interface Props {
  classes: ClasseDestaque[];
}

const CORES: Record<string, string> = { STJ: "var(--color-stj)", STF: "var(--color-stf)" };

export default function GraficoTaxaPorClasse({ classes }: Props) {
  const dados = classes.map((c) => {
    const r = calcularTaxa(c.total, c.favoraveis);
    return { ...c, taxa: r.status === "ok" ? r.taxa * 100 : null };
  });

  return (
    <div role="img" aria-label="Gráfico de barras: taxa favorável de cada uma das classes mais volumosas, STJ e STF">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="classe" tick={{ fontSize: 12, fill: "var(--color-tinta)" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 12, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              formatter={(valor) => (typeof valor === "number" ? formatarPercentual(valor / 100) : "base pequena")}
              labelFormatter={(classe, payload) => `${payload[0]?.payload.tribunal} · ${classe}`}
              contentStyle={{ fontFamily: "var(--font-corpo)", fontSize: 13, borderColor: "var(--color-linha)" }}
            />
            <Bar dataKey="taxa" radius={[4, 4, 0, 0]}>
              {dados.map((d) => (
                <Cell key={`${d.tribunal}-${d.classe}`} fill={CORES[d.tribunal]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-sm text-tinta/70">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: "var(--color-stj)" }} />
          STJ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: "var(--color-stf)" }} />
          STF
        </span>
      </div>
    </div>
  );
}