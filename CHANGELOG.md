# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.0.3] - 2026-08-30

### Adicionado
- Tela de **catalogação** do acervo (`src/catalogar.html` + `src/js/catalogar.js`):
  formulário com todos os campos do modelo, consumindo a API `/api/acervo`
  (criar, editar, excluir) e listagem dos itens cadastrados com **miniatura da
  capa, título, CDD e Cutter** (#11).
- `tipo_material` e `tipo_capa` como selects com as opções padronizadas
  (Livros, HQ, Revistas… / Brochura, Capa Dura, Espiral, Digital) (#11).
- **Upload de capa**: o arquivo é salvo em `capas/<uuid>.<ext>` e apenas o
  caminho relativo é gravado no `acervo.json`; as capas são servidas em
  `/capas` e a antiga é removida ao substituir/excluir o item
  (`server/covers.js`, dependência `multer`) (#11).
- Link "Catalogar" no cabeçalho compartilhado e atalho na página inicial (#11).

## [0.0.2] - 2026-08-30

### Adicionado
- Backend local em **Node.js + Express** (`server/`) que serve o front-end de
  `src/` e expõe a API REST do acervo — roda em `http://localhost:3000` via
  `npm start` (#10).
- Persistência em arquivo `data/acervo.json` com escrita atômica e serializada
  (`server/db.js`); o arquivo é criado vazio no primeiro start (#10).
- Modelo de dados do acervo + validação/normalização (`server/schema.js`):
  `titulo` obrigatório, `ano`/`cdd` numéricos (CDD 0–999) e
  `autores_secundarios` sempre como array; campos desconhecidos são
  descartados (#10).
- Endpoints CRUD em `/api/acervo` — `GET` (lista), `GET /:id`, `POST`, `PUT` e
  `DELETE` (`server/routes/acervo.js`), com `id` em UUID gerado no servidor
  (#10).

## [0.0.1] - 2026-08-30

### Adicionado
- Versão inicial do **BiblioZen**, criada a partir do template
  [templateZen](https://github.com/alexsandroccarv/templatezen): personalização
  de nome, repositório, autor, licença, cor da marca (mostarda `#8a6a00`) e
  favicon (livro) do projeto.
