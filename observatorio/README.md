# Observatório do STJ e do STF

Site público e indexável que mostra, em gráficos, como o STJ e o STF decidem: taxa de decisões favoráveis
por classe, matéria, relator e período. É a Frente 1 do projeto Jurimetria (Squad 34) e serve de vitrine:
o advogado encontra a página no Google e chega ao produto principal a partir dela.

O site só lê o arquivo `dados/observatorio.json`, fornecido pela Krohn. Não acessa banco, API nem faz
raspagem de site de tribunal.

## Páginas

| Página | Endereço | O que mostra |
|---|---|---|
| Início | `/` | Números gerais, taxa favorável por ano e as classes com mais decisões |
| Série histórica | `/serie-historica/` | Filtros por tribunal, classe e matéria; taxa favorável e volume de decisões por mês |
| Relatores | `/relatores/` | Gráfico e tabela por relator: total de decisões, taxa favorável e tendência |
| Metodologia | `/metodologia/` | De onde vêm os dados, o que conta como decisão favorável e os limites dos números |

Os filtros ficam na URL, então qualquer recorte pode ser compartilhado:
`/serie-historica/?tribunal=STJ&classe=HC&materia=penal`. A URL pode vir incompleta
(`?classe=HC&materia=penal`): o que faltar é escolhido pelo recorte com mais decisões. Se o pedido não
existir, o site abre o recorte padrão (o mais volumoso).

## Stack

- **Astro**: gera um site estático; a maior parte das páginas não precisa de JavaScript no navegador.
- **React**, só nos componentes interativos (as "ilhas" do Astro): os gráficos e os filtros.
- **Recharts**: biblioteca dos gráficos.
- **TypeScript** em modo estrito.
- **Tailwind CSS**: estilização.
- **Vitest**: testes automatizados, principalmente do cálculo de taxa e de tendência.

## Como rodar

Requer **Node 22.12 ou mais novo** (confira com `node -v`).

```bash
cd observatorio
npm install
npm run dev
```

Abre em <http://localhost:4321>. Em seguida, os comandos do dia a dia:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento. Só serve para programar: é lento e não representa o site publicado |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Serve a build gerada, para conferir antes de publicar |
| `npm run data` | Só regenera os arquivos de dados em `public/data/`, sem gerar o site |
| `npm run check` | Checagem de tipos do TypeScript e do Astro |
| `npm run lint` | ESLint, incluindo regras de acessibilidade |
| `npm test` | Roda os testes com Vitest |

`npm run dev` e `npm run build` regeneram `public/data/` sozinhos antes de começar. Essa pasta é gerada e
não vai para o Git: nunca edite nada dentro dela.

## Como atualizar os dados

A Krohn manda uma versão nova do `observatorio.json` toda semana. Para atualizar o site:

1. Troque o arquivo `dados/observatorio.json` pela versão nova.
2. Rode `npm run build`.
3. Confira o resultado (veja "Como conferir a build" abaixo).
4. Faça o commit do `dados/observatorio.json` e envie. A plataforma de hospedagem publica sozinha.

Não há mais nada para editar. Os números, os períodos, a data de atualização e as descrições dos gráficos
saem dos dados. Se o build parar com `observatorio.json inválido` ou `observatorio.json inconsistente`, o
arquivo veio incompleto ou com a soma errada: peça uma nova versão em vez de tentar corrigir à mão.

## Como o projeto funciona

```text
dados/observatorio.json ──► scripts/process-data.ts ──► public/data/ ──► páginas
   (um arquivo só)           (roda no build)            manifest.json
                                                        resumo.json
                                                        recortes/*.json (um por recorte)
```

- O `observatorio.json` é dividido em um arquivo pequeno por **recorte** (tribunal + classe + matéria),
  mais um `manifest.json` (a lista de recortes, usada pelos filtros) e um `resumo.json` (usado na Início
  e na Metodologia).
- A Início e a Metodologia são geradas no build, a partir do `resumo.json`.
- A Série histórica e os Relatores baixam, no navegador, só o arquivo do recorte escolhido. Os gráficos só
  são desenhados quando a pessoa rola até eles, para a página abrir rápido no celular.

### Regras de apresentação

As regras completas estão no [`ESCOPO.md`](./ESCOPO.md). As principais:

- **Universo, período e critério**: todo gráfico e toda tabela mostram, logo abaixo, o universo (tribunal,
  classe e matéria), o período e o que conta como decisão favorável (componente `LegendaDados`).
- **Base pequena**: um recorte com menos de 30 decisões não mostra porcentagem, só "base pequena"
  (constante `LIMITE_BASE_PEQUENA`, em `src/lib/taxa.ts`).
- **Tendência**: compara a taxa dos 3 últimos anos fechados com a dos 3 anteriores (`src/lib/tendencia.ts`).
- **Relatores**: a fonte só traz relator-ano com pelo menos 20 decisões, de 2015 em diante.

## Como publicar

O build gera um site estático na pasta `dist/` e pode ser publicado em qualquer hospedagem de arquivos.
Dois cuidados valem para todas:

1. **O projeto está dentro da pasta `observatorio/`** do repositório, então é preciso dizer à plataforma
   para trabalhar nela.
2. **O comando de build tem que ser `npm run build`**, e não `astro build`. É o `npm run build` que roda,
   antes, o script que gera `public/data/`. Sem isso, o site sobe sem dados.

O site precisa ficar na **raiz** de um endereço (por exemplo `https://observatorio.exemplo.com.br/`). Ele usa
caminhos como `/data/...` e `/_astro/...`, que não funcionam se o site ficar numa subpasta
(`https://usuario.github.io/nome-do-repo/`).

### Vercel (recomendado)

1. Em [vercel.com](https://vercel.com), escolha **Add New… → Project** e selecione o repositório.
2. Em **Root Directory**, clique em **Edit** e escolha `observatorio`.
3. Em **Build and Output Settings**, confira:
   - **Build Command**: `npm run build` (ative o *Override* se estiver diferente);
   - **Output Directory**: `dist`.
4. Clique em **Deploy**. A cada envio para a branch principal, o site é publicado de novo.

O Vercel lê o campo `engines` do `package.json` e usa uma versão de Node compatível (22.12 ou mais nova).

### Netlify

1. Em [netlify.com](https://www.netlify.com), escolha **Add new project → Import an existing project** e
   selecione o repositório.
2. Em **Build settings**, preencha:
   - **Base directory**: `observatorio`;
   - **Build command**: `npm run build`;
   - **Publish directory**: `dist` (ela é relativa à base, por isso não é `observatorio/dist`).
3. Clique em **Deploy**.

O Netlify lê o arquivo `.nvmrc` desta pasta para escolher a versão do Node.

### GitHub Pages

Só serve se o site ficar na raiz do endereço: com **domínio próprio** ou num repositório chamado
`usuario.github.io`. Um site de projeto, no endereço `usuario.github.io/nome-do-repo/`, **não funciona**:
o CSS, o JavaScript e as fontes dão erro 404 e os filtros nem aparecem. Mesmo no caso que funciona, é
preciso um workflow do GitHub Actions que rode `npm ci` e `npm run build` dentro de `observatorio/` e
publique a pasta `observatorio/dist`. Por isso a Vercel e o Netlify são mais simples para este projeto.

### Depois de publicar

- Abra as quatro páginas no endereço público e confira que os gráficos aparecem.
- Abra um link com filtros, como `/serie-historica/?classe=HC&materia=penal`, e confira que ele abre no
  recorte certo.
- Abra as ferramentas do navegador (F12 → Rede) e confira que não há arquivo com erro 404.
- Meça o Lighthouse do endereço público, em janela anônima e no modo **Mobile**.

## Como conferir a build

Para ver o site como ele será publicado, antes de enviar:

```bash
npm run build
npx serve dist
```

O `serve` comprime os arquivos como as hospedagens fazem, então os tempos ficam parecidos com os reais.
Para medir o Lighthouse localmente, use esse endereço, em janela anônima e no modo **Mobile**. Não meça no
`npm run dev`: ele serve código sem minificar e dá notas muito piores do que as do site publicado.

## Antes de enviar uma alteração

```bash
npm run lint
npm test
npm run check
npm run build
```

Os quatro precisam passar sem erro. Os testes ficam em `tests/` e cobrem as regras de negócio (taxa,
base pequena, tendência, filtros e relatores) e a leitura dos dados.

## Estrutura de pastas

```text
dados/          observatorio.json, a única fonte de dados
scripts/        leitura e divisão do observatorio.json (roda no build)
public/         favicon (e public/data/, gerada no build)
src/pages/      as quatro páginas
src/components/ gráficos, filtros e legenda dos dados
src/lib/        regras de negócio: taxa, tendência, filtros, relatores, rótulos
src/layouts/    layout comum às páginas
tests/          testes automatizados (Vitest)
```