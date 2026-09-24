# Jurimetria: frentes do squad 34 (Residência Tecnológica Católica)

O Jurimetria é uma ferramenta de jurisprudência para advogados. Ele reúne 12 milhões de decisões do STJ e do STF,
com busca por palavra e por sentido, jurimetria (taxas de concessão por classe, matéria, relator e ano), pesquisa
por caso com IA e alertas de decisão nova. Coleta, banco, busca e IA já estão prontos e em produção.

Vocês vão construir três projetos em torno do produto, num repositório de vocês. Nenhum precisa do código,
do banco ou das chaves do Jurimetria. Tudo o que é preciso está neste pacote.

| Frente | Pasta | O que é |
|---|---|---|
| 1 | `frente-1-observatorio/` | Site público de gráficos de jurimetria, a partir de um arquivo de dados agregados |
| 2 | `frente-2-site-do-produto/` | Site de apresentação do produto: o que faz, planos, formulário de interesse, conteúdo para o Google |
| 3 | `frente-3-extensao/` | Extensão de Chrome que reconhece números de processo nas páginas dos tribunais e mostra a ficha da decisão |

## Como trabalhar

1. Um repositório só, `jurimetria-squad34`, na conta de um de vocês, com acesso para o Bruno (usuário GitHub
   `BRK13`). Uma pasta por frente (`observatorio/`, `site/`, `extensao/`), cada uma com seu `package.json` e seu
   README explicando como rodar e como publicar. Os dados deste pacote vão juntos, na pasta de cada frente.
2. Um workflow de CI por pasta (GitHub Actions com filtro de caminho): mexeu no observatório, roda só o que é do
   observatório.
3. Commits pequenos e com mensagem que diga o que mudou. Pull Requests dentro do próprio repositório, revisados
   entre vocês antes de pedir a nossa revisão.
4. Testes automatizados onde houver lógica: parser, cálculo de taxa, filtros.

## Regras do produto que valem para as três frentes

- Todo número de jurimetria aparece com o universo (tribunal, classe, matéria), o período e o critério. Taxa sem
  essas três coisas não vai para a tela.
- Recorte com menos de 30 decisões não mostra taxa. Mostra "base pequena".
- Nada por nome de parte. Os dados não têm nome de parte; não tentem buscar em outro lugar.
- Toda decisão mostrada tem o link oficial do tribunal.
- Nenhuma raspagem de site de tribunal. Os dados vêm dos arquivos deste pacote (e, na frente 3, da nossa API quando
  ela for liberada).

## Entrega e avaliação

Cada frente tem uma lista de critérios de aceite no seu `ESCOPO.md`. A frente está entregue quando todos passam e o
Bruno aprova. Revisamos em até dois dias úteis depois do pedido. Dúvida de escopo: perguntem antes de inventar.
