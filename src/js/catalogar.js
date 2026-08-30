/* ==========================================================================
   BiblioZen — Catalogação (consome a API /api/acervo)
   --------------------------------------------------------------------------
   Liga o formulário e a listagem à API REST do backend local: criar (POST),
   editar (PUT), excluir (DELETE) e listar (GET). O envio é multipart
   (FormData), de modo que a capa (campo `capa`) vai junto do cadastro; na
   edição sem novo arquivo, o `caminho_capa` atual é preservado (campo oculto).
   ========================================================================== */
(function () {
    'use strict';

    var API = '/api/acervo';
    var form = document.getElementById('acervoForm');
    var lista = document.getElementById('lista');
    var contador = document.getElementById('contador');
    var formErro = document.getElementById('formErro');
    var capaInput = document.getElementById('capa');
    var capaPreview = document.getElementById('capaPreview');

    // Escapa texto para inserção segura no HTML da listagem.
    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function setErro(msgs) {
        if (!msgs || !msgs.length) { formErro.hidden = true; formErro.innerHTML = ''; return; }
        formErro.hidden = false;
        formErro.innerHTML = msgs.map(function (m) { return esc(m); }).join('<br>');
    }

    // Alterna entre "novo" e "edição" no cabeçalho/botão do formulário.
    function setModo(editando) {
        document.querySelector('#formTitulo span').textContent = editando ? 'Editar item' : 'Novo item';
        document.getElementById('btnSalvarLabel').textContent = editando ? 'Atualizar' : 'Salvar';
    }

    function limparForm() {
        form.reset();
        document.getElementById('id').value = '';
        document.getElementById('caminho_capa').value = '';
        capaPreview.hidden = true;
        capaPreview.removeAttribute('src');
        setErro(null);
        setModo(false);
    }

    // Miniatura do card: usa a capa se houver, senão um ícone de livro.
    function thumb(item) {
        if (item.caminho_capa) {
            return '<img src="' + esc(item.caminho_capa) + '" alt="Capa de ' + esc(item.titulo) +
                '" class="w-12 h-16 object-cover rounded border border-gray-200 dark:border-gray-700 shrink-0" ' +
                'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'w-12 h-16 rounded border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center text-gray-400\',innerHTML:\'<i class=\\\'fa-solid fa-book\\\'></i>\'}))">';
        }
        return '<span class="w-12 h-16 rounded border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center text-gray-400"><i aria-hidden="true" class="fa-solid fa-book"></i></span>';
    }

    function cardHTML(item) {
        var meta = [];
        meta.push('CDD: ' + (item.cdd != null && item.cdd !== '' ? esc(item.cdd) : '—'));
        meta.push('Cutter: ' + (item.cutter ? esc(item.cutter) : '—'));
        return '' +
            '<article class="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">' +
                thumb(item) +
                '<div class="min-w-0 flex-1">' +
                    '<p class="font-semibold truncate">' + esc(item.titulo || '(sem título)') + '</p>' +
                    (item.autor_principal ? '<p class="text-xs text-gray-500 dark:text-gray-400 truncate">' + esc(item.autor_principal) + '</p>' : '') +
                    '<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">' + meta.join(' &middot; ') + '</p>' +
                '</div>' +
                '<div class="flex flex-col gap-1 shrink-0">' +
                    '<button type="button" data-edit="' + esc(item.id) + '" title="Editar" aria-label="Editar" class="text-gray-500 hover:text-brand-600 dark:hover:text-accent-400 w-8 h-8 flex items-center justify-center rounded"><i aria-hidden="true" class="fa-solid fa-pen"></i></button>' +
                    '<button type="button" data-del="' + esc(item.id) + '" title="Excluir" aria-label="Excluir" class="text-gray-500 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded"><i aria-hidden="true" class="fa-solid fa-trash"></i></button>' +
                '</div>' +
            '</article>';
    }

    var cache = [];

    function render(items) {
        cache = items;
        contador.textContent = '(' + items.length + ')';
        if (!items.length) {
            lista.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Nenhum item cadastrado ainda.</p>';
            return;
        }
        lista.innerHTML = items.map(cardHTML).join('');
    }

    async function carregar() {
        lista.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Carregando…</p>';
        try {
            var res = await fetch(API);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            render(await res.json());
        } catch (e) {
            lista.innerHTML = '<p class="text-sm text-red-600">Falha ao carregar o acervo: ' + esc(e.message) +
                '. O servidor está rodando (<code>npm start</code>)?</p>';
        }
    }

    async function salvar(e) {
        e.preventDefault();
        setErro(null);
        var id = document.getElementById('id').value.trim();
        var fd = new FormData(form);
        // Não enviar o input de arquivo vazio como parte do corpo textual.
        if (capaInput.files.length === 0) fd.delete('capa');
        // O id vai na URL, não no corpo.
        fd.delete('id');

        var url = id ? API + '/' + encodeURIComponent(id) : API;
        var method = id ? 'PUT' : 'POST';
        var btn = document.getElementById('btnSalvar');
        btn.disabled = true;
        try {
            var res = await fetch(url, { method: method, body: fd });
            var data = await res.json().catch(function () { return {}; });
            if (!res.ok) {
                setErro(data.errors || [data.error || ('Erro HTTP ' + res.status)]);
                return;
            }
            limparForm();
            await carregar();
        } catch (err) {
            setErro(['Falha de rede ao salvar: ' + err.message]);
        } finally {
            btn.disabled = false;
        }
    }

    function editar(id) {
        var item = cache.find(function (it) { return it.id === id; });
        if (!item) return;
        setErro(null);
        document.getElementById('id').value = item.id;
        ['tipo_material', 'titulo', 'subtitulo', 'autor_principal', 'organizador',
         'edicao', 'cidade_publicacao', 'editora', 'ano', 'paginas_duracao',
         'tipo_capa', 'cdd', 'cutter'].forEach(function (f) {
            var el = document.getElementById(f);
            if (el) el.value = item[f] != null ? item[f] : '';
        });
        document.getElementById('autores_secundarios').value =
            Array.isArray(item.autores_secundarios) ? item.autores_secundarios.join('; ') : '';
        document.getElementById('caminho_capa').value = item.caminho_capa || '';
        capaInput.value = '';
        if (item.caminho_capa) {
            capaPreview.src = item.caminho_capa;
            capaPreview.hidden = false;
        } else {
            capaPreview.hidden = true;
            capaPreview.removeAttribute('src');
        }
        setModo(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function excluir(id) {
        var item = cache.find(function (it) { return it.id === id; });
        var nome = item ? (item.titulo || 'este item') : 'este item';
        if (!window.confirm('Excluir "' + nome + '"? Esta ação não pode ser desfeita.')) return;
        try {
            var res = await fetch(API + '/' + encodeURIComponent(id), { method: 'DELETE' });
            if (!res.ok && res.status !== 200) throw new Error('HTTP ' + res.status);
            // Se estava editando este item, limpa o formulário.
            if (document.getElementById('id').value === id) limparForm();
            await carregar();
        } catch (e) {
            window.alert('Falha ao excluir: ' + e.message);
        }
    }

    // Pré-visualização ao escolher um arquivo novo.
    capaInput.addEventListener('change', function () {
        var f = capaInput.files[0];
        if (!f) return;
        var url = URL.createObjectURL(f);
        capaPreview.src = url;
        capaPreview.hidden = false;
    });

    lista.addEventListener('click', function (e) {
        var ed = e.target.closest('[data-edit]');
        var de = e.target.closest('[data-del]');
        if (ed) editar(ed.getAttribute('data-edit'));
        else if (de) excluir(de.getAttribute('data-del'));
    });

    form.addEventListener('submit', salvar);
    document.getElementById('btnCancelar').addEventListener('click', limparForm);
    document.getElementById('btnRecarregar').addEventListener('click', carregar);

    carregar();
})();
