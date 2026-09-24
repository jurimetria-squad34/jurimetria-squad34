# Frente 2: Site de apresentação do produto

## Objetivo

O site que um advogado encontra antes de conhecer o produto: o que o Jurimetria faz, para quem é, quanto custa e
como pedir acesso. Também traz páginas de conteúdo que respondem a buscas reais de advogados no Google.

## O que o produto faz (base para o texto)

- **Busca de jurisprudência** do STJ e do STF: 12 milhões de decisões, por palavra e por sentido, com filtros de
  tribunal, classe, matéria, relator, resultado, artigo, súmula e tema.
- **Tela da decisão**: ementa, dispositivo e inteiro teor com os termos buscados destacados, as citações, as decisões
  parecidas e o link oficial do tribunal.
- **Jurimetria**: taxa de decisões favoráveis por classe, matéria, relator e ano, sempre com universo, período e
  critério declarados, e a lista de decisões por trás de cada número.
- **Pesquisa por caso**: o advogado cola os fatos ou a petição, revisa o plano de busca, e a IA devolve precedentes
  separados em favoráveis, contrários e de distinção, cada um com trecho literal da decisão e link oficial. Junto
  vêm os números da tese e das decisões parecidas, e um relatório pronto para o cliente.
- **Alertas**: a busca salva avisa quando entra decisão nova que casa com ela.

O que o produto não faz, e o site não pode prometer: não gera peça processual, não prevê resultado de processo e não
busca por nome de parte.

## Páginas

1. **Início**: proposta de valor em uma frase, as cinco funções acima com imagem, prova (números da base), chamada
   para pedir acesso.
2. **Como funciona**: o passo a passo da pesquisa por caso, com a regra de ouro do produto: tudo o que aparece vem
   da base, com trecho literal e link oficial; nada é inventado pela IA.
3. **Planos**: uma tabela com dois planos de exemplo (valores serão definidos por nós; deixem os números num
   arquivo de configuração, não espalhados pelo código).
4. **Pedir acesso**: formulário com nome, e-mail, escritório, área de atuação e tamanho do escritório. Nesta versão
   o envio vai para um serviço de formulário (Formspree, Netlify Forms ou similar), sem backend próprio.
5. **Conteúdo**: pelo menos 6 páginas de conteúdo, uma por tema que advogado busca (por exemplo "como pesquisar
   jurisprudência do STJ sobre prisão preventiva", "o que é jurimetria", "taxa de concessão de habeas corpus no
   STJ"). Os números dessas páginas vêm do `observatorio.json` da frente 1, com universo, período e critério.
6. **Privacidade e termos**: páginas simples, com texto que nós vamos revisar.

As capturas de tela do produto são entregues por nós. Até lá, usem espaços reservados do mesmo tamanho.

## Critérios de aceite

- [ ] Nenhuma promessa fora do que está na lista acima (sem "prevê o resultado", sem "gera a petição").
- [ ] Todo número mostrado tem universo, período e critério.
- [ ] Formulário com validação, mensagem de sucesso e de erro, e proteção contra spam (honeypot ou captcha do
      serviço de formulário).
- [ ] Lighthouse acima de 90 nas quatro categorias, no modo celular; funciona a 375 px e só com teclado.
- [ ] Título, descrição, Open Graph e dados estruturados (`schema.org`) em cada página; sitemap e robots.txt.
- [ ] Textos em português claro, sem jargão de tecnologia para o advogado.
- [ ] README com como rodar, como editar os textos e como publicar.

## Fora do escopo

Login, pagamento, qualquer integração com o produto real. O botão "entrar" aponta para um endereço que nós
informamos depois.
