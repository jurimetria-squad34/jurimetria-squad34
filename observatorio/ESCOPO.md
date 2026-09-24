# Frente 1: Observatório público de jurimetria

## Objetivo

Um site público e indexável ("Observatório do STJ e do STF") que mostra em gráficos como os tribunais decidem: a
taxa favorável ao longo do tempo, a comparação entre relatores e os recortes por classe e matéria. É a vitrine do
produto e traz advogados pelo Google.

## Dados

`dados/observatorio.json`, gerado por nós a partir do banco e atualizado toda semana (vocês recebem a versão nova
por arquivo). São só contagens agregadas, sem texto de decisão e sem nome de parte.

```json
{
  "gerado_em": "2026-09-23T15:40:00.000Z",
  "criterio": "Favorável = resultado concedido, provido ou parcial, ...",
  "universo": { "tribunais": ["STF", "STJ"], "decisoes": 11957116, "de": 1892, "ate": 2026 },
  "mensal": [
    { "tribunal": "STJ", "materia": "penal", "classe": "HC", "mes": "2025-03", "total": 5120, "favoraveis": 1210 }
  ],
  "relatores": [
    { "tribunal": "STJ", "materia": "penal", "classe": "HC", "relator": "NOME DO MINISTRO", "ano": 2025,
      "total": 3400, "favoraveis": 610, "contrarios": 2700, "outros": 90 }
  ]
}
```

- `mensal`: 85 mil linhas, uma por mês, tribunal, matéria e classe.
- `relatores`: por ano, de 2015 em diante, só com linhas de pelo menos 20 decisões.
- A taxa favorável é `favoraveis / total`. O texto de `criterio` explica o que conta como favorável e tem de
  aparecer na tela.
- `materia` pode vir `null`, sobretudo no STF antigo. Tratem como "sem matéria informada", não como erro.
- O arquivo tem 9,7 MB. Não carreguem tudo no navegador de uma vez: gerem, no build, arquivos menores por recorte
  (por exemplo um JSON por classe) ou páginas estáticas já calculadas.
- Os relatores são ministros, que são autoridades públicas. O arquivo não tem nome de parte.

## O que construir

Um site estático. A stack é livre; sugestão: Astro ou Next.js exportado estático, com Observable Plot, Recharts ou
ECharts. Páginas mínimas:

1. **Início**: os números gerais do universo e três gráficos de destaque (por exemplo: taxa de HC concedido por ano
   no STJ; matérias com mais decisões; volume mensal do último ano).
2. **Série histórica**: filtros de tribunal, classe e matéria; gráfico da taxa favorável e do volume por mês.
3. **Relatores**: para um recorte de classe e matéria, uma tabela e um gráfico dos relatores com total, taxa e
   tendência (os 3 últimos anos contra os 3 anteriores).
4. **Metodologia**: de onde vêm os dados, o critério de favorável, as limitações (no acervo antigo o resultado é
   lido do texto da decisão; a cobertura varia por período) e o link para o produto.

## Critérios de aceite

- [ ] Todo gráfico e toda tabela mostram, junto, o universo (tribunal, classe, matéria), o período e o critério.
- [ ] Recorte com menos de 30 decisões não mostra taxa; mostra "base pequena".
- [ ] Trocar o `observatorio.json` e rodar o build atualiza o site inteiro, sem edição manual.
- [ ] Funciona a 375 px de largura, sem rolagem horizontal, e navegável só com teclado.
- [ ] Lighthouse acima de 90 em desempenho e acessibilidade, no modo celular.
- [ ] Cada página com título e descrição próprios, e filtros na URL (`?classe=HC&materia=penal`), para indexação.
- [ ] Testes do cálculo de taxa e da tendência.
- [ ] README com como rodar e como publicar (Vercel, Netlify ou GitHub Pages).

## Fora do escopo

Busca de decisões, login, backend. O observatório só lê o arquivo.
