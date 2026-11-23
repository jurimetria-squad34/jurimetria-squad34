# Frente 3: Extensão de navegador "Jurimetria no tribunal"

## Objetivo

O advogado passa o dia nas páginas do STJ e do STF e em PDFs de decisões. A extensão reconhece números de processo
nessas páginas ("HC 123.456", "REsp 1.234.567/SP", "AgRg no AREsp 2.345.678", números CNJ de 20 dígitos) e, ao passar
o mouse, mostra uma ficha curta: resultado, relator, data, tese e um link para a decisão no Jurimetria.

## A API que a extensão consulta

Nós vamos publicar esta rota. Até lá, vocês desenvolvem contra os arquivos de `exemplos/`, que têm exatamente o
formato da resposta, com decisões públicas reais.

```
GET {BASE}/api/decisoes/por-numero?tribunal=STJ&classe=HC&numero=123456
```

- `tribunal`: `STJ` ou `STF`. `classe`: sigla da classe (HC, RHC, REsp, AREsp, MS, Rcl, ARE, RE...). `numero`: só
  dígitos (a extensão tira os pontos).
- Resposta 200:

```json
{
  "decisoes": [
    {
      "id": "uuid",
      "tribunal": "STJ", "classe": "HC", "numero": "123456", "tipo": "monocratica",
      "data_publicacao": "2025-03-10",
      "resultado": "concedido", "resultado_rotulo": "Concedido",
      "relator": "NOME DO MINISTRO", "orgao_julgador": "SEXTA TURMA",
      "tese": "fundamentação concreta da prisão preventiva",
      "link_oficial": "https://processo.stj.jus.br/...",
      "url": "/decisao/uuid"
    }
  ]
}
```

- Um processo pode ter várias decisões (liminar, decisão final, agravo); vêm até 10, da mais recente para a mais
  antiga. Lista vazia quando o número não está na base. `tese` pode vir `null`.
- `url` é relativo: a ficha monta o link completo com o `BASE` configurado.
- 400 quando falta parâmetro.

Em `exemplos/`:
- `por-numero_<tribunal>_<classe>_<numero>.json`: respostas reais;
- `por-numero_nao-encontrado.json`: a resposta vazia;
- `numeros-reais-de-ementas.txt`: números de processo como aparecem de verdade em ementas do STJ e do STF, um por
  linha, para os testes do parser.

Durante o desenvolvimento, sirvam os exemplos com um servidor local simples (um script de 20 linhas que lê o arquivo
certo pela query) e configurem o `BASE` para ele.

## O que construir

- Extensão Chrome, Manifest V3, em TypeScript, com build simples (esbuild ou Vite). Sem framework pesado.
- **Parser de números de processo**, com testes: classe (HC, RHC, REsp, AREsp, AgRg, AgInt, EDcl, MS, RMS, Rcl, CC,
  e no STF também ARE, RE, ADI, ADPF), número com e sem pontos, UF opcional ("/SP"), e o número CNJ de 20 dígitos
  (`0000000-00.0000.0.00.0000`), que nesta versão só é reconhecido e mostrado, sem consulta.
- Roda em `processo.stj.jus.br`, `scon.stj.jus.br`, `portal.stf.jus.br` e, se der, em PDFs abertos no Chrome.
  Sublinha discretamente os números achados; ao passar o mouse (ou dar foco pelo teclado), abre a ficha.
- Página de opções com o `BASE` da API.
- Cache em memória por número durante a sessão, para não repetir consulta.

## Critérios de aceite

- [x] Parser com pelo menos 30 casos de teste, a maioria tirada de `numeros-reais-de-ementas.txt`, incluindo casos
      que não podem casar (datas, CPF, números de página, artigos de lei).
- [x] A extensão não quebra o layout das páginas dos tribunais e só consulta a API para número que o parser
      reconheceu.
- [x] Não lê, guarda nem envia o conteúdo das páginas: só classe e número vão para a API.
- [x] A ficha funciona com teclado, mostra o link oficial e trata os três estados: carregando, não encontrado, erro.
- [x] README com como instalar em modo desenvolvedor e um GIF curto mostrando o uso.

## Fora do escopo

Publicar na Chrome Web Store (fazemos nós), login, qualquer coleta de dados das páginas dos tribunais.
