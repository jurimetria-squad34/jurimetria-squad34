# Desafio do squad 34: Jurimetria

## O produto

O Jurimetria é uma ferramenta de jurisprudência para advogados, já em produção. Ele reúne 12 milhões de decisões do
Superior Tribunal de Justiça (STJ) e do Supremo Tribunal Federal (STF), atualizadas todo dia, e oferece:

- busca por palavra e por sentido, com filtros de tribunal, classe, matéria, relator e resultado;
- a tela de cada decisão, com ementa, dispositivo, inteiro teor e link oficial do tribunal;
- jurimetria: a taxa de decisões favoráveis por classe, matéria, relator e ano;
- pesquisa por caso com IA: o advogado descreve o caso e recebe os precedentes favoráveis, contrários e de distinção,
  cada um com trecho literal da decisão;
- alertas de decisão nova.

A coleta, o banco de dados, a busca e a IA estão prontos. O desafio de vocês é construir três produtos em volta do
Jurimetria, que ampliam o alcance dele sem depender do código nem do banco.

## Como vai funcionar

- **Repositório:** um só, `jurimetria-squad34`, criado na conta de um de vocês, com acesso de leitura para o Bruno
  (usuário GitHub `BRK13`).
- **Estrutura:** uma pasta por desafio: `observatorio/`, `site/` e `extensao/`. Cada pasta tem o seu `package.json`,
  o seu README (como rodar e como publicar) e o seu workflow de CI no GitHub Actions, que só roda quando aquela pasta
  muda.
- **Dados:** vêm no pacote `jurimetria-squad34.zip`, que recebem junto com este documento. Ninguém precisa de acesso ao
  nosso servidor, ao nosso banco ou a chave de API.
- **Rotina:** commits pequenos, com mensagem que diz o que mudou. Pull Requests dentro do repositório, revisados por
  um colega antes de pedirem a nossa revisão.
- **Testes:** automatizados onde houver lógica: cálculo de taxa, filtros, reconhecimento de número de processo.

## Regras que valem para os três

1. **Todo número de jurimetria aparece com o universo, o período e o critério.** Universo: tribunal, classe, matéria.
   Período: de que ano a que ano. Critério: o que conta como decisão favorável. Taxa sem essas três informações não
   vai para a tela.
2. **Base pequena não vira taxa.** Com menos de 30 decisões no recorte, a tela diz "base pequena" em vez de mostrar
   porcentagem.
3. **Nada por nome de parte.** Os dados não têm nome de parte, e ninguém procura esse dado em outro lugar.
4. **Toda decisão mostrada tem o link oficial do tribunal.**
5. **Nenhuma raspagem de site de tribunal.** Os dados vêm do pacote e, no desafio 3, da nossa API.

## Desafio 1: Observatório público de jurimetria (`observatorio/`)

Um site público que mostra em gráficos como o STJ e o STF decidem. Ele serve de vitrine: o advogado acha a página no
Google, entende o que a jurimetria mostra e chega ao produto.

**Dados:** `observatorio.json`, com contagens agregadas das 12 milhões de decisões. Traz a série mensal por tribunal,
classe e matéria, e os relatores por ano desde 2015. Não tem texto de decisão nem nome de parte. O formato está
descrito no `ESCOPO.md` da pasta. O arquivo tem 9,7 MB: no build, dividam em arquivos menores por recorte, em vez de
carregar tudo no navegador.

**Páginas:**
- **Início:** os números gerais e três gráficos de destaque.
- **Série histórica:** filtros de tribunal, classe e matéria; taxa favorável e volume por mês.
- **Relatores:** para um recorte, os relatores com total, taxa e tendência (os 3 últimos anos contra os 3 anteriores).
- **Metodologia:** de onde vêm os dados, o critério, as limitações e o link para o produto.

**Pronto quando:**
- as regras 1 e 2 valem em todo gráfico e tabela;
- trocar o `observatorio.json` e rodar o build atualiza o site inteiro;
- funciona a 375 px, sem rolagem lateral, e só com o teclado;
- o Lighthouse dá acima de 90 em desempenho e acessibilidade, no celular;
- cada página tem título e descrição próprios, e os filtros vão na URL (`?classe=HC&materia=penal`);
- o cálculo de taxa e de tendência tem testes.

## Desafio 2: Site de apresentação do produto (`site/`)

O site que o advogado encontra antes de conhecer o Jurimetria: o que o produto faz, para quem é, quanto custa e como
pedir acesso.

**Páginas:**
- **Início:** a proposta em uma frase, as cinco funções do produto e a chamada para pedir acesso.
- **Como funciona:** o passo a passo da pesquisa por caso, deixando claro que tudo o que aparece vem da base, com
  trecho literal e link oficial, e que nada é inventado pela IA.
- **Planos:** dois planos de exemplo. Os valores ficam num arquivo de configuração, porque nós vamos definir depois.
- **Pedir acesso:** formulário com nome, e-mail, escritório, área de atuação e tamanho do escritório, enviado por um
  serviço de formulário (Formspree, Netlify Forms ou similar), sem backend próprio.
- **Conteúdo:** seis páginas sobre temas que advogado busca no Google (por exemplo "o que é jurimetria" ou "taxa de
  concessão de habeas corpus no STJ"), com números tirados do `observatorio.json` e as regras 1 e 2.
- **Privacidade e termos:** páginas simples. Nós revisamos o texto.

As capturas de tela do produto são mandadas por nós. Até chegarem, usem espaços reservados do mesmo tamanho.

**O que o site não pode prometer:** que o produto gera petição, que prevê o resultado de um processo ou que busca por
nome de parte. Ele não faz nenhuma dessas coisas.

**Pronto quando:**
- o formulário tem validação, mensagens de sucesso e de erro, e proteção contra spam;
- o Lighthouse dá acima de 90 nas quatro categorias, no celular;
- cada página tem título, descrição, Open Graph e dados estruturados (schema.org), e o site tem sitemap e robots.txt;
- os textos estão em português claro, sem jargão de tecnologia;
- o README explica como editar os textos e publicar.

## Desafio 3: Extensão de Chrome "Jurimetria no tribunal" (`extensao/`)

O advogado passa o dia nas páginas do STJ e do STF. A extensão reconhece números de processo nessas páginas ("HC
123.456", "AgRg no AREsp 2.345.678/SP", o número CNJ de 20 dígitos). Ao passar o mouse, mostra uma ficha curta da
decisão: resultado, relator, data, tese e link para a decisão no Jurimetria.

**A API:** a rota que a extensão consulta já existe do nosso lado:

```
GET {BASE}/api/decisoes/por-numero?tribunal=STJ&classe=HC&numero=123456
```

Ela devolve até 10 decisões do processo, da mais recente para a mais antiga. O formato da resposta está no `ESCOPO.md`
da pasta. Para desenvolver, usem os 22 exemplos reais do pacote (`exemplos/`), servidos por um servidor local simples
(um script de 20 linhas). Liberamos o acesso à API de verdade quando a extensão estiver pronta.

**O que construir:**
- Uma extensão Chrome com Manifest V3, em TypeScript, com build simples (esbuild ou Vite).
- **Um parser de números de processo**, com testes, que reconheça:
  - as classes HC, RHC, REsp, AREsp, AgRg, AgInt, EDcl, MS, RMS, Rcl e CC, e no STF também ARE, RE, ADI e ADPF;
  - o número com e sem pontos;
  - a UF opcional ("/SP");
  - o número CNJ, que nesta versão só é reconhecido e mostrado, sem consulta.
- Funcionamento em `processo.stj.jus.br`, `scon.stj.jus.br` e `portal.stf.jus.br`: sublinhado discreto no número e a
  ficha ao passar o mouse ou ao dar foco pelo teclado.
- Uma página de opções com o endereço da API.
- Cache por número durante a sessão.

**Pronto quando:**
- o parser tem pelo menos 30 casos de teste, a maioria tirada do arquivo `numeros-reais-de-ementas.txt` do pacote,
  incluindo o que não pode ser reconhecido: datas, CPF, número de página, artigo de lei;
- a extensão não quebra o layout das páginas dos tribunais e só consulta a API para número reconhecido;
- não lê, guarda nem envia o conteúdo das páginas: só classe e número vão para a API;
- a ficha funciona com o teclado, mostra o link oficial e trata os estados carregando, não encontrado e erro;
- o README mostra como instalar em modo desenvolvedor, com um GIF curto do uso.

## Entrega e avaliação

Cada desafio está entregue quando todos os itens de "Pronto quando" passam e o Bruno aprova. Revisamos em até dois
dias úteis depois do pedido de revisão. Dúvida de escopo: perguntem antes de decidir sozinhos.

Os detalhes técnicos de cada desafio (formato dos arquivos, contrato da API, exemplos) estão no `ESCOPO.md` de cada
pasta do pacote.
