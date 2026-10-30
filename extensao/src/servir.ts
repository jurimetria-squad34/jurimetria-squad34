import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { criarServidor } from "./servidor.ts";

const raiz = dirname(fileURLToPath(import.meta.url));
const pasta = join(raiz, "../exemplos");
const pagina = join(raiz, "../pagina-local.html");
const porta = Number(process.env.PORT ?? 8787);

criarServidor(pasta, pagina).listen(porta, "127.0.0.1", () => {
    console.log(`Página de exemplo em http://127.0.0.1:${porta}`);
    console.log(`API local em http://127.0.0.1:${porta}/api/decisoes/por-numero`);
});
