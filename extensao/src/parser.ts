// responsavel por reconhecer os números de processos judiciais


function reconhecerProcessos(texto_analisado: string): string {

    const processos: string[] = [];

    const resultado = texto_analisado.match(/[0-9.]+/g);

    if(resultado !== null){
        
        
    }
    return texto_analisado;
}