# Site de apresentação do produto Jurimetria

Site institucional do Jurimetria: o que o produto faz, planos, formulário de interesse e páginas de conteúdo.

## Como rodar

npm install
npm run dev

Abre em http://localhost:4321.

## Como rodar os testes

npm run test

## Como editar os textos

- Textos das páginas: src/pages/
- Páginas de conteúdo (SEO): src/content/
- Valores dos planos: src/config/planos.json

## Como publicar

Build:

npm run build

O site estático fica em dist/. Publique em Netlify, Vercel ou GitHub Pages.
