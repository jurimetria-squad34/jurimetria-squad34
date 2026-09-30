# Observatório do STJ e do STF

Site público e indexável que mostra, em gráficos, como o STJ e o STF decidem: taxa de decisões favoráveis
por classe, matéria, relator e período. É a Frente 1 do projeto Jurimetria (Squad 34) e serve de vitrine:
o advogado encontra a página no Google e chega ao produto principal a partir dela.

O site só lê o arquivo `dados/observatorio.json`, fornecido pela Krohn. Não acessa banco, API nem faz
raspagem de site de tribunal.

## Stack

- **Astro** — gera um site estático; a maior parte das páginas não precisa de JavaScript no navegador.
- **React**, só nos componentes interativos (as "ilhas" do Astro) — os gráficos e os filtros.
- **Recharts** — biblioteca dos gráficos.
- **TypeScript** em modo estrito.
- **Tailwind CSS** — estilização.
- **Vitest** — testes automatizados, principalmente do cálculo de taxa e de tendência.

## Status atual

Setup inicial concluído: projeto Astro configurado com React, Tailwind, TypeScript estrito, ESLint (com
regras de acessibilidade) e Vitest. Ainda não há páginas nem componentes finais — só uma página de teste
que confirma que Astro, React e Recharts funcionam juntos.

Próximos passos: tipagem dos dados, regras de negócio (taxa, base pequena, tendência) com testes, script
de build que divide o `observatorio.json`, e as quatro páginas do escopo (Início, Série Histórica,
Relatores, Metodologia).

## Como rodar

```bash
cd observatorio
npm install
npm run dev
```

Abre em http://localhost:4321.

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Serve a build gerada, para conferir antes de publicar |
| `npm run check` | Checagem de tipos do TypeScript e do Astro |
| `npm run lint` | ESLint, incluindo regras de acessibilidade |
| `npm test` | Roda os testes com Vitest |

Requer Node 22.12 ou mais novo.