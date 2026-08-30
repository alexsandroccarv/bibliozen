/* ==========================================================================
   BiblioZen — Geração de etiquetas de lombada em PDF (jsPDF)
   --------------------------------------------------------------------------
   Produz um PDF no layout da folha Pimaco 6180 / Avery 5160 (papel Carta):
   3 colunas × 10 linhas, etiqueta de 25,4 mm (altura) × 66,7 mm (largura).

   Cada etiqueta traz:
     - uma faixa horizontal grossa (~4 mm) no topo, cuja cor depende da
       centena (primeiro dígito) do CDD (ver CORES_CDD);
     - o CDD centralizado na 1ª linha e o Cutter na 2ª linha.

   Exposto como window.BiblioZenEtiquetas.gerar(itens, opts).
   Requer jsPDF (window.jspdf.jsPDF) carregado antes deste script.
   ========================================================================== */
(function () {
    'use strict';

    // --- Layout da folha (mm) — Pimaco 6180 / Avery 5160 em papel Carta ------
    var COLS = 3;
    var ROWS = 10;
    var LABEL_W = 66.675;   // largura da etiqueta
    var LABEL_H = 25.4;     // altura da etiqueta
    var MARGIN_LEFT = 4.7625;
    var MARGIN_TOP = 12.7;
    var COL_PITCH = 69.85;  // distância entre inícios de colunas (gap 3,175 mm)
    var ROW_PITCH = 25.4;   // distância entre inícios de linhas (sem gap)
    var PER_PAGE = COLS * ROWS;

    // --- Faixa colorida por centena do CDD -----------------------------------
    var CORES_CDD = {
        0: '#808080', // 000–099
        1: '#8B4513', // 100–199
        2: '#800080', // 200–299
        3: '#00008B', // 300–399
        4: '#FFD700', // 400–499
        5: '#006400', // 500–599
        6: '#FF8C00', // 600–699
        7: '#FF1493', // 700–799
        8: '#FF0000', // 800–899
        9: '#32CD32', // 900–999
    };
    var COR_SEM_CDD = '#CCCCCC'; // sem CDD: faixa neutra

    // Retorna a centena (0–9) do CDD ou null quando ausente/ inválido.
    function centenaCDD(cdd) {
        if (cdd === null || cdd === undefined || cdd === '') return null;
        var n = Number(cdd);
        if (!Number.isFinite(n)) return null;
        var c = Math.floor(Math.abs(n) / 100);
        return Math.min(9, Math.max(0, c));
    }

    // Cor hex (#rrggbb) da faixa para um CDD.
    function corDaFaixa(cdd) {
        var c = centenaCDD(cdd);
        return c === null ? COR_SEM_CDD : CORES_CDD[c];
    }

    function hexToRgb(hex) {
        var h = String(hex).replace('#', '');
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
        ];
    }

    // Desenha uma etiqueta no canto superior-esquerdo (x, y) em mm.
    function desenharEtiqueta(doc, item, x, y) {
        var INSET = 2;        // recuo lateral da faixa
        var BAND_TOP = 2;     // distância do topo da etiqueta até a faixa
        var BAND_H = 4;       // altura da faixa (~4 mm, regra de negócio)

        // Faixa colorida.
        var rgb = hexToRgb(corDaFaixa(item.cdd));
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.rect(x + INSET, y + BAND_TOP, LABEL_W - 2 * INSET, BAND_H, 'F');

        // Textos (CDD e Cutter), centralizados horizontalmente.
        var cx = x + LABEL_W / 2;
        var cddTxt = (item.cdd === null || item.cdd === undefined || item.cdd === '') ? '' : String(item.cdd);
        var cutterTxt = item.cutter ? String(item.cutter) : '';

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(cddTxt, cx, y + BAND_TOP + BAND_H + 6.5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.text(cutterTxt, cx, y + BAND_TOP + BAND_H + 13, { align: 'center' });
    }

    /**
     * Gera e baixa o PDF das etiquetas.
     * @param {object[]} itens itens do acervo a etiquetar (usa cdd e cutter)
     * @param {{startPos?: number, filename?: string}} [opts]
     *        startPos: posição inicial na folha (1..30), para pular etiquetas já usadas.
     */
    function gerar(itens, opts) {
        opts = opts || {};
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('jsPDF não carregou (verifique a conexão para o CDN).');
        }
        if (!itens || !itens.length) throw new Error('Nenhum item selecionado.');

        var JsPDF = window.jspdf.jsPDF;
        var doc = new JsPDF({ unit: 'mm', format: 'letter' });

        var start = parseInt(opts.startPos, 10);
        if (!Number.isFinite(start) || start < 1) start = 1;
        if (start > PER_PAGE) start = PER_PAGE;

        var slot = start - 1; // índice 0-based na página atual
        itens.forEach(function (item) {
            if (slot >= PER_PAGE) {
                doc.addPage();
                slot = 0;
            }
            var col = slot % COLS;
            var row = Math.floor(slot / COLS);
            var x = MARGIN_LEFT + col * COL_PITCH;
            var y = MARGIN_TOP + row * ROW_PITCH;
            desenharEtiqueta(doc, item, x, y);
            slot++;
        });

        doc.save(opts.filename || 'etiquetas-lombada.pdf');
    }

    window.BiblioZenEtiquetas = { gerar: gerar, corDaFaixa: corDaFaixa, CORES_CDD: CORES_CDD };
})();
