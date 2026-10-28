
export function reconhecerProcessos(texto_analisado: string): string[] {
    
    const processos: string[] = [];

    const referencias = texto_analisado.match(

        /\b(?:AgRg\s+no\s+AREsp|HC|RHC|REsp|AREsp|MS|Rcl|ARE|RE)\s+n?\.?\s*\d[\d.]*(?:\/[A-Z]{2})?/gi
    );

    const numerosCNJ = texto_analisado.match(

        /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g
    );

    if (referencias !== null) {

        processos.push(...referencias);
    }

    if (numerosCNJ !== null) {

        processos.push(...numerosCNJ);
    }

    return processos;
}
