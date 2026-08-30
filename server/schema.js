/* ==========================================================================
   BiblioZen — Modelo de dados (Schema) do acervo + validação/normalização
   --------------------------------------------------------------------------
   Fonte única do formato de um item do acervo. Usado pelas rotas de CRUD para
   normalizar a entrada (aceitar só campos conhecidos, aplicar tipos e
   defaults) e validar as regras de negócio antes de persistir em acervo.json.
   ========================================================================== */

// Campos de texto simples do item (strings). O `id` é gerado no servidor e o
// `ano`/`cdd` (numéricos) e `autores_secundarios` (array) têm tratamento
// próprio abaixo.
export const TEXT_FIELDS = [
    'tipo_material',
    'titulo',
    'subtitulo',
    'autor_principal',
    'organizador',
    'edicao',
    'cidade_publicacao',
    'editora',
    'paginas_duracao',
    'tipo_capa',
    'cutter',
    'caminho_capa',
];

// Converte para string aparada; qualquer valor nulo/indefinido vira ''.
function toStr(v) {
    if (v === null || v === undefined) return '';
    return String(v).trim();
}

// Converte para inteiro; retorna null quando vazio/ inválido (campo opcional).
function toIntOrNull(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
}

// Normaliza `autores_secundarios` para um array de strings não vazias.
// Aceita array ou string separada por ";" ou "," (conveniência de formulário).
function toStrArray(v) {
    if (Array.isArray(v)) {
        return v.map(toStr).filter(Boolean);
    }
    const s = toStr(v);
    if (!s) return [];
    return s
        .split(/[;,]/)
        .map((x) => x.trim())
        .filter(Boolean);
}

/**
 * Normaliza um objeto de entrada para o formato canônico de um item do acervo.
 * NÃO define o `id` (fica a cargo do chamador: gerar no create, preservar no
 * update). Ignora campos desconhecidos.
 * @param {object} input
 * @returns {object} item normalizado (sem `id`)
 */
export function normalize(input) {
    const src = input && typeof input === 'object' ? input : {};
    const item = {};
    for (const f of TEXT_FIELDS) item[f] = toStr(src[f]);
    item.autores_secundarios = toStrArray(src.autores_secundarios);
    item.ano = toIntOrNull(src.ano);
    item.cdd = toIntOrNull(src.cdd);
    return item;
}

/**
 * Valida um item já normalizado. Regras:
 *  - `titulo` obrigatório;
 *  - `ano`, quando informado, deve ser um inteiro plausível (0–9999);
 *  - `cdd`, quando informado, deve ter até 3 dígitos (0–999).
 * @param {object} item item normalizado
 * @returns {string[]} lista de erros (vazia = válido)
 */
export function validate(item) {
    const errors = [];
    if (!item.titulo) errors.push('O campo "titulo" é obrigatório.');
    if (item.ano !== null && (item.ano < 0 || item.ano > 9999)) {
        errors.push('O campo "ano" deve estar entre 0 e 9999.');
    }
    if (item.cdd !== null && (item.cdd < 0 || item.cdd > 999)) {
        errors.push('O campo "cdd" deve ter até 3 dígitos (0–999).');
    }
    return errors;
}
