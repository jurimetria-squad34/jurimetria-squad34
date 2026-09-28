import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// TEMPORÁRIO: serve só para provar que React + Recharts funcionam dentro do Astro.
const dadosDeTeste = [
  { ano: "2023", valor: 10 },
  { ano: "2024", valor: 14 },
  { ano: "2025", valor: 12 },
];

export default function TesteIlha() {
  const [cliques, setCliques] = useState(0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setCliques(cliques + 1)}
        className="rounded bg-slate-900 px-3 py-2 text-white"
      >
        Cliques: {cliques}
      </button>
      <div className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosDeTeste}>
            <XAxis dataKey="ano" />
            <YAxis />
            <Line type="monotone" dataKey="valor" stroke="#0f172a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}