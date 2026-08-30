/* ==========================================================================
   BiblioZen — Servidor local (Node.js + Express)
   --------------------------------------------------------------------------
   Sobe um servidor local que serve o front-end estático (src/) e expõe a API
   REST do acervo em /api/acervo (CRUD sobre data/acervo.json). Pensado para
   rodar na máquina do usuário — abra http://localhost:3000 no navegador.

   Uso:  npm start   (ou: node server/index.js)
   ========================================================================== */
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import acervoRouter from './routes/acervo.js';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Healthcheck simples.
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bibliozen' }));

// API do acervo (CRUD).
app.use('/api/acervo', acervoRouter);

// Front-end estático: serve os arquivos de src/ (index.html, páginas de apoio,
// js/, css/, logo.svg…). É o mesmo conteúdo que o build.mjs publica em dist/.
app.use(express.static(join(ROOT, 'src')));

// Middleware de erro: responde JSON em vez de derrubar o processo.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[bibliozen] erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor.', detail: String(err.message || err) });
});

app.listen(PORT, () => {
    console.log(`BiblioZen rodando em http://localhost:${PORT}`);
    console.log(`API do acervo:      http://localhost:${PORT}/api/acervo`);
});

export default app;
