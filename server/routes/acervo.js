/* ==========================================================================
   BiblioZen — Rotas de CRUD do acervo (/api/acervo)
   --------------------------------------------------------------------------
   Create, Read, Update e Delete sobre os itens persistidos em acervo.json.
   A validação/normalização do corpo fica em schema.js; a persistência em db.js.
   ========================================================================== */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { readAll, writeAll } from '../db.js';
import { normalize, validate } from '../schema.js';

const router = Router();

// Envolve um handler async e encaminha erros ao middleware de erro do Express.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// READ — lista todos os itens do acervo.
router.get('/', wrap(async (_req, res) => {
    const items = await readAll();
    res.json(items);
}));

// READ — um item por id.
router.get('/:id', wrap(async (req, res) => {
    const items = await readAll();
    const item = items.find((it) => it.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
    res.json(item);
}));

// CREATE — cria um novo item (id gerado no servidor).
router.post('/', wrap(async (req, res) => {
    const item = normalize(req.body);
    const errors = validate(item);
    if (errors.length) return res.status(400).json({ errors });

    const items = await readAll();
    const record = { id: randomUUID(), ...item };
    items.push(record);
    await writeAll(items);
    res.status(201).json(record);
}));

// UPDATE — substitui um item existente (preserva o id).
router.put('/:id', wrap(async (req, res) => {
    const items = await readAll();
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item não encontrado.' });

    const item = normalize(req.body);
    const errors = validate(item);
    if (errors.length) return res.status(400).json({ errors });

    const record = { id: req.params.id, ...item };
    items[idx] = record;
    await writeAll(items);
    res.json(record);
}));

// DELETE — remove um item por id.
router.delete('/:id', wrap(async (req, res) => {
    const items = await readAll();
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item não encontrado.' });

    const [removed] = items.splice(idx, 1);
    await writeAll(items);
    res.json(removed);
}));

export default router;
