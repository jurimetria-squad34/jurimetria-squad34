import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/", ".astro/", "public/data/", "dados/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  // arquivos .astro, com as regras de acessibilidade (prefixo astro/jsx-a11y/)
  // Esta config também registra o plugin "jsx-a11y" para o projeto todo.
  ...astro.configs["jsx-a11y-recommended"],
  // componentes React (.tsx): liga as regras de acessibilidade originais.
  // Não repetimos "plugins" porque o plugin já foi registrado na linha acima.
  { files: ["**/*.tsx"], rules: jsxA11y.flatConfigs.recommended.rules },

    {
    files: ["**/*.tsx"],
    rules: {
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },
]);