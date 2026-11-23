import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
    absWorkingDir: raiz,
    entryPoints: ["src/content.ts", "src/opcoes.ts", "src/fundo.ts"],
    bundle: true,
    outdir: "dist",
    format: "iife",
    platform: "browser",
    target: ["chrome120"],
    legalComments: "none",
});
