/**
 * Rótulos legíveis para valores que, no arquivo, vêm como código (sem
 * acento, em minúsculo) — pensados para o banco de dados, não para a tela.
 */

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

/**
 * Traduz o código de matéria do arquivo para o texto que aparece na tela.
 * `null` (decisão sem matéria registrada) e "outro" (matéria registrada como
 * "outra") são coisas diferentes, por isso têm rótulos diferentes.
 */
export function rotularMateria(materia: string | null): string {
  if (materia === null) return "Sem matéria informada";
  return ROTULOS_MATERIA[materia] ?? materia; // nunca esconde um código novo/desconhecido
}