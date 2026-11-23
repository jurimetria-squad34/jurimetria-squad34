# Jurimetria - Squad 34

Este é o repositório do **Squad 34** para o Desafio Jurimetria. Ele contém a entrega dos três produtos que ampliam o alcance da plataforma Jurimetria: o Observatório público de dados, o Site de apresentação e a Extensão para Chrome.

O repositório está organizado em pastas independentes. Cada uma tem seu próprio ecossistema (dependências, testes e CI), permitindo que sejam desenvolvidas e publicadas de forma isolada.

## 👥 Integrantes do Squad 34

- Caio Seabra de Queiroz
- Cauã de Paula Bento Neves
- Davi Luiz Abrantes Lima
- Eduardo Martins Rodrigues
- João Pedro Cunha Ávila
- Leonardo Yudi Umetsu Ueyama
- Lucas Alves Izaias
- Lucas Daniel Antunes Amorim
- Luiz Miguel Nunes Pimenta
- Murilo Gonçalves de Lira

## 📂 Estrutura do repositório

| Pasta | Desafio | O que é? |
|---|---|---|
| [`observatorio/`](./observatorio/) | Desafio 1 | Site público com gráficos e dados agregados de como o STJ e o STF decidem. Serve como vitrine para o produto. |
| [`site/`](./site/) | Desafio 2 | Site institucional de apresentação do Jurimetria, com planos, formulário de captação e páginas de conteúdo (SEO). |
| [`extensao/`](./extensao/) | Desafio 3 | Extensão de Chrome (Manifest V3) que reconhece números de processos nas páginas do STJ e STF e exibe a ficha da decisão. |

> 💡 **Documentação detalhada:** Cada pasta possui o seu próprio `README.md` com instruções específicas de instalação, execução, testes e publicação. **Recomendamos a leitura individual de cada uma.**

## 🚀 Como rodar o projeto localmente

Como as pastas são independentes, você deve entrar em cada uma e instalar as dependências. É necessário ter o **Node.js 22 ou superior** instalado.

### 1. Observatório
```bash
cd observatorio
npm install
npm run dev
```
Acesse em: http://localhost:4321

### 2. Site
```bash
cd site
npm install
npm run extrair-universo
npm run extrair-recortes
npm run extrair-relatores
npm run dev
```
Acesse em: http://localhost:4321

### 3. Extensão
```bash
cd extensao
npm install
npm run build
```
> Para testar a extensão no Chrome, siga o passo a passo no extensao/README.md. Para subir o servidor de dados de      exemplo e testar a ficha, rode npm run serve em outro terminal.

## 🧪 Testes Automatizados

A qualidade e a precisão dos dados são prioridades neste projeto. Todos os cálculos complexos (taxas, tendências, reconhecimento de números de processo) possuem testes unitários.

Para rodar os testes de uma pasta específica:
```bash
cd observatorio  # ou site / extensao
npm test
```

## ⚙️ Integração Contínua (CI)

O repositório possui workflows do GitHub Actions (.github/workflows/) configurados para rodar de forma independente. Cada workflow é acionado apenas quando arquivos da sua respectiva pasta são alterados.

- observatorio.yml: Roda testes e build do observatório.
- site.yml: Roda testes e build do site.
- extensao.yml: Roda os testes do parser e o build da extensão.
- lighthouse.yml: Mede a performance e acessibilidade das páginas estáticas.

## 📌 Regras de Negócio e Metodologia

Todas as aplicações seguem as regras estritas de exibição de jurimetria definidas no escopo do desafio:

1. Transparência: Todo número exibido é acompanhado de seu universo (tribunal, classe, matéria), período e critério de "favorável".
2. Base Pequena: Recortes com menos de 30 decisões não exibem porcentagem, mas sim o aviso "base pequena".
3. Privacidade: Nenhum dado sensível ou nome de parte é utilizado ou exposto.
4. Fonte Oficial: Toda decisão exibida possui link direto para o tribunal de origem.

## 📦 Publicação

As instruções específicas de deploy (Cloudflare, Vercel, Netlify) estão documentadas no README.md de cada pasta. O site e o observatório são gerados de forma estática (Astro), e a extensão está pronta para ser empacotada para a Chrome Web Store.

---

Desenvolvido pelo Squad 34.