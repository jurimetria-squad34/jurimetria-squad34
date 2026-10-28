
import { reconhecerProcessos } from "../src/parser";

const texto = "HC 176.473/RR e processo 0001135-13.2021.8.19.0000";

const resultado = reconhecerProcessos(texto);

console.log(resultado);


//Comando para teste: npx esbuild src/teste-parser.ts --bundle --platform=node --outfile=node_modules/.cache/teste-parser.cjs && node node_modules/.cache/teste-parser.cjs