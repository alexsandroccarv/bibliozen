/* ==========================================================================
   BiblioZen — Capas do acervo (upload/remoção de imagens em /capas)
   --------------------------------------------------------------------------
   As imagens de capa ficam numa pasta local `capas/` na raiz do projeto (fora
   do git). O arquivo é nomeado pelo UUID do item (`<uuid>.<ext>`), garantindo
   unicidade; no acervo.json guarda-se apenas o caminho relativo
   (`/capas/<uuid>.<ext>`), servido estaticamente pelo servidor.
   ========================================================================== */
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const CAPAS_DIR = join(here, '..', 'capas');

// Tipos de imagem aceitos e a extensão canônica de cada um.
const EXT_BY_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
};

// True se o arquivo enviado é uma imagem de tipo aceito.
export function isImage(file) {
    return !!(file && EXT_BY_MIME[file.mimetype]);
}

async function ensureDir() {
    if (!existsSync(CAPAS_DIR)) await mkdir(CAPAS_DIR, { recursive: true });
}

/**
 * Salva a capa de um item e devolve o caminho relativo a gravar no JSON.
 * @param {string} id UUID do item (vira o nome do arquivo)
 * @param {{buffer: Buffer, mimetype: string, originalname: string}} file
 * @returns {Promise<string>} caminho relativo (ex.: "/capas/<uuid>.jpg")
 */
export async function saveCover(id, file) {
    await ensureDir();
    const ext = EXT_BY_MIME[file.mimetype] || extname(file.originalname).toLowerCase() || '.img';
    const filename = `${id}${ext}`;
    await writeFile(join(CAPAS_DIR, filename), file.buffer);
    return `/capas/${filename}`;
}

/**
 * Remove o arquivo de capa apontado por um caminho relativo. Silencioso se o
 * caminho for vazio, externo (não começa por /capas/) ou o arquivo não existir.
 * @param {string} caminho caminho relativo salvo no item
 */
export async function deleteCover(caminho) {
    if (!caminho || typeof caminho !== 'string') return;
    const m = caminho.match(/^\/?capas\/([^/\\]+)$/);
    if (!m) return; // não é uma capa gerenciada por nós
    const name = m[1];
    if (name.includes('..')) return;
    const p = join(CAPAS_DIR, name);
    try {
        if (existsSync(p)) await unlink(p);
    } catch {
        /* ignora falha ao remover capa órfã */
    }
}
