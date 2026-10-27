const ROTULOS_MATERIA: Record<string, string> = {
  administrativo: "Direito administrativo",
  civil: "Direito civil",
  constitucional: "Direito constitucional",
  consumidor: "Direito do consumidor",
  eleitoral: "Direito eleitoral",
  empresarial: "Direito empresarial",
  internacional: "Direito internacional",
  outro: "Outras matérias",
  penal: "Direito penal",
  previdenciario: "Direito previdenciário",
  processual_civil: "Direito processual civil",
  trabalho: "Direito do trabalho",
  tributario: "Direito tributário",
};

export function rotularMateria(materia: string | null): string {
  if (materia === null) return "Sem matéria informada";
  return ROTULOS_MATERIA[materia] ?? materia; 
}

export function descreverUniverso(
  tribunal: string,
  classe: string,
  materia: string | null,
  classeOriginais: string[] = [],
): string {
  const grafias = classeOriginais.length > 1 ? ` (grafias unificadas: ${classeOriginais.join(", ")})` : "";
  return `${tribunal}, classe ${classe}${grafias}, ${rotularMateria(materia).toLowerCase()}`;
}

const PARTICULAS_DE_NOME = new Set(["de", "da", "do", "das", "dos", "e"]);

export function formatarNomeRelator(nome: string): string {
  return nome
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .filter(Boolean)
    .map((palavra, i) =>
      i > 0 && PARTICULAS_DE_NOME.has(palavra) ? palavra : palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1),
    )
    .join(" ");
}

export function nomeCurtoRelator(nome: string): string {
  return formatarNomeRelator(nome.replace(/\s*\(.*\)\s*$/, "").trim());
}

export function quebrarEmLinhas(texto: string, largura = 17, maxLinhas = 2): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (!atual || tentativa.length <= largura) {
      atual = tentativa;
      continue;
    }
    linhas.push(atual);
    atual = palavra;
    if (linhas.length === maxLinhas) {
      linhas[maxLinhas - 1] += "…";
      return linhas;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export function nomeCompletoRelator(nome: string): string {
  const achou = /^(.*?)\s*(\(.*\))\s*$/.exec(nome);
  if (!achou) return formatarNomeRelator(nome);
  return `${formatarNomeRelator(achou[1])} ${achou[2]}`;
}