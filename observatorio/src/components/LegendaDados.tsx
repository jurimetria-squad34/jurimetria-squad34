interface Props {
  universo: string;
  periodo: string;
  criterio: string;
  observacao?: string;
}

export default function LegendaDados({ universo, periodo, criterio, observacao }: Props) {
  return (
    <p className="mt-3 max-w-prose text-sm text-tinta/70">
      <strong className="font-medium text-tinta">Universo:</strong> {universo}.{" "}
      <strong className="font-medium text-tinta">Período:</strong> {periodo}.{" "}
      <strong className="font-medium text-tinta">Critério de decisão favorável:</strong> {criterio}
      {observacao ? (
        <>
          {" "}
          <strong className="font-medium text-tinta">Observação:</strong> {observacao}
        </>
      ) : null}
    </p>
  );
}