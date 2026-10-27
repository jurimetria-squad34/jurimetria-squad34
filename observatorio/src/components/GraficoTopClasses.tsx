import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularTaxa } from "@/lib/taxa";
import { formatarPercentual } from "@/lib/formato";
import type { ClasseDestaque } from "@/types/recorte";

interface Props {
  classes: ClasseDestaque[];
}

const CORES: Record<string, string> = { STJ: "var(--color-stj)", STF: "var(--color-stf)" };

export default function GraficoTopClasses({ classes }: Props) {
  const dados = [...classes].reverse().map((c) => ({
    ...c,
    rotulo: c.classe,
    taxa: (() => {
      const r = calcularTaxa(c.total, c.favoraveis);
      return r.status === "ok" ? r.taxa : null;
    })(),
  }));

  return (
    <div role="img" aria-label={`Gráfico de barras: as ${classes.length} classes processuais com mais decisões, STJ e STF juntos`}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-tinta)" }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="rotulo"
              type="category"
              tick={{ fontSize: 13, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip
              formatter={(valor, _nome, item) => {
                const taxa = (item.payload as { taxa: number | null }).taxa;
                const decisoes = typeof valor === "number" ? valor.toLocaleString("pt-BR") : String(valor);
                return [`${decisoes} decisões${taxa !== null ? ` · taxa ${formatarPercentual(taxa)}` : ""}`, item.payload.tribunal];
              }}
              contentStyle={{ fontFamily: "var(--font-corpo)", fontSize: 13, borderColor: "var(--color-linha)" }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
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