/* ==========================================================================
   BiblioZen — Persistência do acervo em arquivo JSON (data/acervo.json)
   --------------------------------------------------------------------------
   Camada simples de leitura/escrita para um app local single-user. Sem banco
   de dados: o estado vive em `data/acervo.json`. A escrita é atômica (grava um
   arquivo temporário e o renomeia) para não corromper o acervo se o processo
   cair no meio de um `save`. As operações de escrita são serializadas por uma
   fila para evitar corrida entre requisições concorrentes.
   ========================================================================== */
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, '..', 'data');
export const DATA_FILE = join(DATA_DIR, 'acervo.json');

// Serializa as escritas: cada save espera o anterior terminar.
let writeChain = Promise.resolve();

// Garante que o diretório e o arquivo existam (arquivo novo = acervo vazio).
async function ensureFile() {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
    if (!existsSync(DATA_FILE)) await writeFile(DATA_FILE, '[]\n', 'utf8');
}

/**
 * Lê todos os itens do acervo. Tolerante: arquivo ausente vira [] e um JSON
 * inválido lança um erro claro (em vez de derrubar o servidor silenciosamente).
 * @returns {Promise<object[]>}
 */
export async function readAll() {
    await ensureFile();
    const raw = await readFile(DATA_FILE, 'utf8');
    if (!raw.trim()) return [];
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        throw new Error(`acervo.json inválido (JSON malformado): ${e.message}`);
    }
    return Array.isArray(data) ? data : [];
}

/**
 * Grava todo o acervo de forma atômica e serializada.
 * @param {object[]} items
 * @returns {Promise<void>}
 */
export function writeAll(items) {
    writeChain = writeChain.then(async () => {
        await ensureFile();
        const tmp = `${DATA_FILE}.${process.pid}.tmp`;
        await writeFile(tmp, JSON.stringify(items, null, 2) + '\n', 'utf8');
        await rename(tmp, DATA_FILE);
    });
    return writeChain;
}
