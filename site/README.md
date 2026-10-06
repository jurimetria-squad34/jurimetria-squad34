# Site de apresentação do Jurimetria

Site estático (Astro): o que o produto faz, planos, formulário de pedido de acesso e páginas de conteúdo.

## Requisitos

Node 22.12 ou mais novo.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `PUBLIC_FORMSPREE_URL`: endereço do formulário no Formspree. Obrigatória no build de produção; sem ela o build falha.
- `PUBLIC_URL_ENTRAR`: endereço do botão "Entrar". Enquanto vazia, o botão aponta para `#`.

## Como rodar

    npm ci
    npm run extrair-universo
    npm run extrair-recortes
    npm run extrair-relatores
    npm run dev

Abre em http://localhost:4321. Sem `PUBLIC_FORMSPREE_URL`, o formulário funciona em modo de teste e não envia nada.

## Como atualizar os números

Os números vêm de `../observatorio/dados/observatorio.json`. Troque o arquivo e rode os três comandos `extrair-*`. Eles regravam os arquivos de `src/data/`. Depois rode o build.

## Testes

    npm run test

## Como editar os textos

- Páginas: `src/pages/`
- Artigos de conteúdo (um arquivo por tema): `src/content/conteudo/`
- Planos, valores e perguntas frequentes: `src/config/planos.json` (preço `null` mostra "Valor a definir")
- Menu e rodapé: `src/components/Header.astro` e `Footer.astro`

Regras para qualquer texto novo: sem prometer petição, previsão de resultado ou busca por nome de parte. Todo número leva universo, período e critério. Menos de 30 decisões mostra "base pequena".

## Como publicar

    npm run build

O resultado fica em `dist/`. Antes, defina o domínio final em `astro.config.mjs` (`site`) e em `public/robots.txt`.

- Netlify ou Vercel: aponte para a pasta `site`, comando `npm run build`, saída `dist`, e cadastre as variáveis acima.
- GitHub Pages: use o Formspree. Netlify Forms só funciona na Netlify.
