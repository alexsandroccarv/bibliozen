# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Modificado
- Adotado o fluxo padrão de contribuição (issue documentada → resolução na
  `main` → `CHANGELOG.md`/`historico.html` → `Closes #`), com numeração por
  [SemVer 2.0.0](https://semver.org/lang/pt-BR/) (CORREÇÃO automática pelo CI;
  MENOR/MAIOR só quando solicitado) — documentado no `CLAUDE.md` (#10).

### Modificado
- Rodapé: o próprio número da versão passa a ser o link para as notas de
  versão (`historico.html`); removida a entrada só-ícone de histórico.

### Adicionado
- Conteúdo real de **Termo de Uso** e **Política de Privacidade** trazido do
  lattesZen e adaptado ao template: nome "TemplateZen" como placeholder,
  cláusulas genericizadas (sem especificidades do Lattes), sem analytics,
  terceiros = Tailwind/Font Awesome/Google Fonts, licença via `LICENSE`.
  Estrutura com índice e seções (LGPD, direitos do titular etc.).

### Modificado
- `historico.html` passa a ter uma estrutura de notas de versão (uma seção
  por versão, com os issues fechados), à moda do `notas-de-versao.html` do
  lattesZen. Documenta a numeração `MAIOR.MENOR.PATCH` (PATCH automático;
  MAIOR/MENOR explícitos) e monta os links de issue a partir de
  `APP_CONFIG.repo` (via `data-issue`), portável entre projetos.

### Adicionado (Go-Live 1.0.0)
- Checklist `docs/GO-LIVE-1.0.md` com as tarefas obrigatórias antes da
  v1.0.0 (jurídico, documentação, suporte, engenharia).
- Manifesto `.github/go-live-issues.json` + workflow
  `seed-go-live-issues.yml` (workflow_dispatch, idempotente) que cria essas
  tarefas como issues no novo repositório — já que issues não são copiadas
  pelo "Use this template".

### Adicionado (onboarding)
- `scripts/setup.mjs`: troca os placeholders do template de uma vez (nome,
  repositório, autor, licença e cor da marca — com escala Tailwind gerada a
  partir de um hex). Interativo ou por flags.
- README e CLAUDE.md atualizados com tudo desta etapa (temas/fontes,
  acessibilidade, páginas de apoio, SEO/sitemap, scaffolding e o setup).

### Adicionado (SEO)
- URLs Open Graph/Twitter absolutas e `<link rel="canonical">`: o `build.mjs`
  substitui o placeholder `%SITE_URL%` pela URL real (env/variável
  `SITE_URL`) no HTML e no `robots.txt`.
- `sitemap.xml` gerado no build (index + páginas de apoio; 404 excluído),
  referenciado no `robots.txt`. `deploy.yml` passa `SITE_URL` (repo variable)
  e confere o `sitemap.xml`.

### Adicionado (SEO/social/erros e qualidade)
- SEO/social: `<meta name="description">` e tags Open Graph/Twitter no
  `index.html` (URLs a trocar por absolutas em produção).
- Página de erro `src/404.html` (com cabeçalho/rodapé compartilhados) e
  `src/robots.txt`.
- `tools/contrast-check.mjs`: auditoria de contraste WCAG das paletas,
  executada no CI (`deploy.yml`) como portão de qualidade; o CI também
  confere que todas as páginas de apoio e o 404 são publicados.

### Adicionado (infraestrutura do repositório)
- Colaboração no GitHub: modelo de Pull Request (`Closes #`), modelo de
  issue de bug + `config.yml` (chooser), `CONTRIBUTING.md`, `SECURITY.md` e
  `CODE_OF_CONDUCT.md`.
- Higiene do repositório: `.editorconfig`, `.gitattributes` (LF + binários) e
  `.nvmrc` (Node 20, igual ao CI).

### Acessibilidade
- Hierarquia de headings das páginas de apoio: o título de cada página vira
  `<h1>` e as seções sobem para `<h2>`; o nome do app no cabeçalho
  compartilhado deixa de ser `<h1>` (vira apenas identidade visual), então
  cada página de apoio passa a ter um único `<h1>` (o seu tópico).
- Link "pular para o conteúdo" (skip link) como primeiro foco de todas as
  páginas, saltando para o `<main>` (injetado pelo `chrome.js`).
- `prefers-reduced-motion`: transições/animações reduzidas para quem pede
  menos movimento.
- Separadores "|" do cabeçalho/rodapé marcados como decorativos
  (`aria-hidden`), reduzindo o ruído em leitores de tela.
- Alto contraste agora prevalece sobre qualquer tema selecionado
  (especificidade reforçada).
- Campo "outro valor" da página "Doe um café" ganhou `aria-label`.

### Modificado
- Engrenagem de Configurações agora aparece no topo à direita de todas as
  páginas (nas páginas de apoio, leva para `index.html#config`, que abre o
  painel automaticamente).
- Seletor de temas voltou a ser um `<select>` de linha única (a prévia da
  fonte aparece por opção no dropdown, onde o navegador suportar).
- Tema padrão do template passa a ser **Dracula** (quando nada foi
  escolhido); "Padrão (segue o sistema)" continua disponível na lista.
- A data de modificação exibida no rodapé (`lastModified`) passa a vir
  automaticamente da data do build (via `js/version.js`, preenchido pelo
  `build.mjs`), em vez de um valor fixo em `config.js`.
- Acesso ao `localStorage` tolerante a falhas (aba anônima/storage
  bloqueado) no `layout.js`, no script inicial de tema (`index.html`) e no
  `Footer.jsx` — a aplicação segue sem persistir em vez de quebrar.
- Abas acessíveis: navegação por teclado (setas/Home/End), `tabindex`
  rotativo e ligação `aria-controls`/`aria-labelledby` entre botões e
  painéis.
- `Footer.jsx` seguro para SSR (Next.js): inicializadores de estado com
  guarda `typeof` para `document`/`localStorage`.

### Adicionado
- Prévia de fonte no seletor de temas: o seletor virou uma lista
  (radiogroup) em que o nome de cada tema é exibido na própria fonte do
  tema; as fontes de prévia carregam ao abrir a aba Configurações.
- `<meta name="theme-color">` dinâmico: a barra do navegador (mobile)
  acompanha a cor do cabeçalho do tema. Barra de rolagem colorida por tema
  (Firefox e WebKit). Segundo destaque por tema (`--tz-accent-2`) para
  estados de sucesso (ex.: confirmação "copiado").
- Temas agora recolorem também: campos de formulário (superfície/borda/
  texto e marcação de radios/checkboxes), links de conteúdo e ícones de
  destaque, seleção de texto (`::selection`) e o anel/contorno de foco —
  deixando os 16 temas coesos além do cabeçalho/rodapé.
- Cada tema agora também define uma fonte característica (via Google Fonts;
  Rawline oficial no gov.br), carregada sob demanda ao selecionar o tema.
  Padrão e GitHub usam a fonte do sistema.
- Seção "Tema" em Configurações: seletor de temas prontos e consolidados —
  Dracula, Solarized Dark/Light, gov.br, Nord, Gruvbox, Tokyo Night, One
  Dark, Monokai e Catppuccin Mocha (além de "Padrão"). Aplicados a todo o
  site via paletas CSS (`data-tz-theme`), persistidos em `localStorage` e
  aplicados cedo (no `cdn.js`) para evitar "flash".
- Página "Doe um café" com Pix funcional (QR code, código copia e cola
  gerado no navegador via BR Code/EMVCo e chave Pix) e seção de parcerias/
  afiliados, adaptada do lattesZen às cores/chrome do template.
- Páginas de apoio externas que replicam cabeçalho e rodapé: `termodeuso`,
  `politicadeprivacidade`, `ajuda`, `sobre`, `doeumcafe` e `historico`
  (histórico de versão). Ficam em `src/` e são copiadas pelo build.
- Novas entradas no rodapé: Sobre (`fa-circle-info`), Doe um café
  (`fa-mug-hot`) e Histórico de versão (`fa-clock-rotate-left`), links
  configuráveis em `config.links`.
- Entrada "Ajuda" no rodapé (ícone de interrogação `fa-circle-question`,
  link configurável em `config.links.help`), no mesmo padrão só-ícone com
  texto no hover. Nas versões HTML e React.

### Corrigido
- Varredura de contraste (WCAG AA) em todos os 16 temas: `muted` clareados,
  Solarized Light/Dark reequilibrados (texto/abas/destaque) e hover do
  rodapé passa a usar a cor de texto do rodapé + sublinhado (não mais o
  destaque, que ficava escuro demais em alguns temas).
- Temas com cabeçalho claro/colorido (ex.: Solarized Light, gov.br): nome
  do usuário, sigla e separadores do cabeçalho ficavam invisíveis por usar
  a cor de destaque igual ao fundo — agora usam a cor de texto do cabeçalho.

### Modificado
- Tema gov.br: passa a usar a **Rawline self-hospedada** (`src/fonts/rawline/`,
  pesos 400/600/700 em woff2, via `@font-face`) — sem dependência de CDN
  externa (nem SERPRO nem Google).
- Removido o botão de alternância claro/escuro do rodapé: a aparência passa
  a ser controlada só pela escolha de tema (Configurações); "Padrão" segue
  o modo claro/escuro do sistema.
- Adicionados os temas GitHub Dark, GitHub Light, Ayu, Rosé Pine,
  Everforest e Material (16 temas no total, além de "Padrão").
- Removida a aba "Sobre" do cabeçalho (o conteúdo já é acessível pela
  página "Sobre" no rodapé).
- Ícones da barra de abas (segunda linha do cabeçalho) 50% maiores.
- Configurações: a engrenagem saiu da barra de abas e passou para a linha
  superior do cabeçalho, na extrema direita, só com ícone (abre o painel de
  Configurações ao clicar). Paridade via prop `onConfigClick` no `Header.jsx`.
- Rodapé: "Doe um café" movido para o grupo da direita (após o autor), com
  texto ao lado do ícone; "Repositório" removido do rodapé.
- Cabeçalho/rodapé extraídos para `src/js/chrome.js` (fonte única) e
  carregador de CDN para `src/js/cdn.js`, eliminando duplicação entre as
  páginas. O rodapé do `index.html` agora é injetado pelo `chrome.js`.
- `applyConfig` compõe o título da aba a partir de `<body data-page-title>`
  (ex.: "MeuApp — Termo de uso") nas páginas de apoio.
- Favicon a partir do logo do projeto em SVG (`src/logo.svg`), referenciado
  em `index.html`. Convenção registrada no `CLAUDE.md`: favicon é sempre o
  logo, em SVG.

### Modificado
- Rodapé: versão e data movidas para o grupo do lado direito (junto a
  autor/repositório/licença). Nas versões HTML e React.
- Rodapé: "Termo de uso", "Política de privacidade", "Tema escuro" e
  "Alto contraste" passam a ser somente ícone; o texto aparece no hover
  (`title`) e é mantido para leitores de tela (`aria-label`). Nas versões
  HTML e React.

### Adicionado
- Campo "Nome:" na aba Configurações: o valor digitado aparece no
  cabeçalho ao lado do nome do aplicativo (`| nome`) e é persistido em
  `localStorage`. Paridade na versão React via prop `userName` em
  `src/components/Header.jsx`.
- Ícones no rodapé para versão (`fa-tag`), termo de uso
  (`fa-file-contract`) e política de privacidade (`fa-shield-halved`),
  ao lado do texto, no mesmo padrão dos demais itens — nas versões
  HTML (`src/index.html`) e React (`src/components/Footer.jsx`).

### Modificado
- A versão exibida no rodapé passa a vir automaticamente do arquivo
  `VERSION` (via novo `src/js/version.js`, preenchido pelo `build.mjs`),
  em vez de um número fixo em `src/js/config.js`.
