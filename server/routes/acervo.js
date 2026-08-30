/* ==========================================================================
   BiblioZen — Rotas de CRUD do acervo (/api/acervo)
   --------------------------------------------------------------------------
   Create, Read, Update e Delete sobre os itens persistidos em acervo.json.
   A validação/normalização do corpo fica em schema.js; a persistência em db.js;
   o upload/remoção da capa em covers.js.

   As rotas de escrita aceitam tanto JSON quanto multipart/form-data (com o
   arquivo no campo `capa`). Sem arquivo, o `caminho_capa` vem do corpo — o que
   permite preservar a capa atual na edição enviando-a num campo oculto.
   ========================================================================== */
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { readAll, writeAll } from '../db.js';
import { normalize, validate } from '../schema.js';
import { saveCover, deleteCover, isImage } from '../covers.js';

const router = Router();

// Upload em memória (capas são pequenas); limite de 5 MB.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

// CREATE — cria um novo item (id gerado no servidor). Aceita capa opcional.
router.post('/', upload.single('capa'), wrap(async (req, res) => {
    const item = normalize(req.body);
    const errors = validate(item);
    if (req.file && !isImage(req.file)) {
        errors.push('A capa deve ser uma imagem (jpg, png, gif, webp ou svg).');
    }
    if (errors.length) return res.status(400).json({ errors });

    const id = randomUUID();
    if (req.file) item.caminho_capa = await saveCover(id, req.file);

    const items = await readAll();
    const record = { id, ...item };
    items.push(record);
    await writeAll(items);
    res.status(201).json(record);
}));

// UPDATE — substitui um item existente (preserva o id). Aceita nova capa.
router.put('/:id', upload.single('capa'), wrap(async (req, res) => {
    const items = await readAll();
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item não encontrado.' });

    const item = normalize(req.body);
    const errors = validate(item);
    if (req.file && !isImage(req.file)) {
        errors.push('A capa deve ser uma imagem (jpg, png, gif, webp ou svg).');
    }
    if (errors.length) return res.status(400).json({ errors });

    const old = items[idx];
    if (req.file) item.caminho_capa = await saveCover(req.params.id, req.file);

    // Remove a capa antiga se foi trocada por outra (extensão diferente) ou
    // removida (campo vazio no update).
    if (old.caminho_capa && old.caminho_capa !== item.caminho_capa) {
        await deleteCover(old.caminho_capa);
    }

    const record = { id: req.params.id, ...item };
    items[idx] = record;
    await writeAll(items);
    res.json(record);
}));

// DELETE — remove um item por id (e sua capa, se houver).
router.delete('/:id', wrap(async (req, res) => {
    const items = await readAll();
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item não encontrado.' });

    const [removed] = items.splice(idx, 1);
    await writeAll(items);
    await deleteCover(removed.caminho_capa);
    res.json(removed);
}));

export default router;
