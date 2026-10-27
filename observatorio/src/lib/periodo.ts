import type { LinhaMensal, LinhaRelator } from "@/types/recorte";

export function formatarPeriodo(primeiroAno: number, ultimoAno: number, anoEmAndamento?: number): string {
  const faixa = primeiroAno === ultimoAno ? `${primeiroAno}` : `${primeiroAno}–${ultimoAno}`;
  return anoEmAndamento === ultimoAno ? `${faixa} (${ultimoAno} em andamento)` : faixa;
}

export function periodoDoMensal(mensal: LinhaMensal[]): string {
  if (mensal.length === 0) return "sem dados";
  const anos = mensal.map((l) => Number(l.mes.slice(0, 4)));
  const mesAberto = mensal.find((l) => l.emAndamento);
  return formatarPeriodo(Math.min(...anos), Math.max(...anos), mesAberto ? Number(mesAberto.mes.slice(0, 4)) : undefined);
}

export function periodoDosRelatores(linhas: LinhaRelator[], anoEmAndamento?: number): string {
  if (linhas.length === 0) return "sem dados";
  const anos = linhas.map((l) => l.ano);
  return formatarPeriodo(Math.min(...anos), Math.max(...anos), anoEmAndamento);
}

export function formatarFaixaDeAnos(anos: readonly number[]): string {
  if (anos.length === 0) return "";
  return formatarPeriodo(Math.min(...anos), Math.max(...anos));
}