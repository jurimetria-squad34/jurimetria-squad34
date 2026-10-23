import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LinhaMensal } from "@/types/recorte";

interface Props {
  mensal: LinhaMensal[];
}

export default function GraficoVolumeMensal({ mensal }: Props) {
  return (
    <div role="img" aria-label="Gráfico de barras: volume de decisões por mês, do recorte selecionado">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mensal} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-tinta)" }} tickLine={false} interval="preserveStartEnd" minTickGap={32} />
            <YAxis
              tickFormatter={(v: number) => v.toLocaleString("pt-BR")}
              tick={{ fontSize: 12, fill: "var(--color-tinta)" }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(valor) => (typeof valor === "number" ? valor.toLocaleString("pt-BR") : valor)}
              labelFormatter={(mes, payload) => (payload[0]?.payload.emAndamento ? `${mes} (em andamento)` : mes)}
              contentStyle={{ fontFamily: "var(--font-corpo)", fontSize: 13, borderColor: "var(--color-linha)" }}
            />
            <Bar isAnimationActive={false} dataKey="total" name="Decisões" radius={[2, 2, 0, 0]}>
              {mensal.map((l) => (
                // o mês em andamento fica mais claro (opacidade menor), não escondido
                <Cell key={l.mes} fill="var(--color-stj)" fillOpacity={l.emAndamento ? 0.4 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}