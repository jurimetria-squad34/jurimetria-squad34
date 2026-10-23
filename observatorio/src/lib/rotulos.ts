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