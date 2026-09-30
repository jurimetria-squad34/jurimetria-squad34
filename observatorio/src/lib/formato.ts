export function formatarPercentual(taxa: number): string {
  return `${(taxa * 100).toFixed(1).replace(".", ",")}%`;
}