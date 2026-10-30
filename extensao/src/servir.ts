import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { criarServidor } from "./servidor.ts";

const pasta = join(dirname(fileURLToPath(import.meta.url)), "../exemplos");
const porta = Number(process.env.PORT ?? 8787);

criarServidor(pasta).listen(porta, "127.0.0.1", () => {
    console.log(`API local em http://127.0.0.1:${porta}`);
});
