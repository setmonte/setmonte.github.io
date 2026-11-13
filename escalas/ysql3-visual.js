(function () {
    'use strict';
// core.src.js - Base comum dos relatorios das escalas (tela + PDF a partir dos MESMOS blocos).
// Cada escala fornece: cfg.blocks(r) -> lista de blocos; este nucleo desenha a tela (HTML) e o PDF (jsPDF) iguais.
// Tipos de bloco: hero, cards, faixas, barras, textos, tabela, aviso, refs (refs so no PDF; a pagina ja mostra as suas).
// IMPORTANTE: o arquivo final e gerado 100% ASCII (acentos como \uXXXX) pelo build.
function symMake(cfg) {
    'use strict';
    var CW = 180, ML = 15, AC = cfg.cor, AC2 = cfg.cor2 || '#455a64', ID = 'sv' + cfg.id;

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u0151/g, 'o').replace(/\u0150/g, 'O').replace(/\u0171/g, 'u').replace(/\u0170/g, 'U').replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u2264/g, '<=').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }

    // ===== regua de espectro: verde -> amarelo -> laranja -> vermelho (como o espectro visivel da luz, a partir do verde) =====
    var SPEC = [[0, [46, 158, 79]], [0.25, [155, 209, 59]], [0.5, [255, 224, 0]], [0.75, [255, 140, 0]], [1, [229, 34, 43]]];
    var SPEC_CSS = 'linear-gradient(90deg,#2e9e4f 0%,#9bd13b 25%,#ffe000 50%,#ff8c00 75%,#e5222b 100%)';
    function espectro(t) {
        t = Math.max(0, Math.min(1, t)); var k = 0;
        while (k < SPEC.length - 2 && t > SPEC[k + 1][0]) k++;
        var a = SPEC[k], b2 = SPEC[k + 1], f = (t - a[0]) / (b2[0] - a[0]);
        return [0, 1, 2].map(function (i) { return Math.round(a[1][i] + (b2[1][i] - a[1][i]) * f); });
    }

    // ===== medidor de intensidade (ponteiro): zonas em tons da cor da escala (neutro, sem bom/ruim) =====
    function mistura(hx, f) { var c = rgb(hx), o = '#'; c.forEach(function (v) { var n = Math.round(255 - (255 - v) * f); o += ('0' + n.toString(16)).slice(-2); }); return o; }
    function zonasDe(it) {
        var lim = [0], ct = (it.cortes || []).map(function (x) { return x.pct; }).sort(function (a, b) { return a - b; }), i;
        if (ct.length) { ct.forEach(function (p) { if (p > 0 && p < 100) lim.push(p); }); } else { lim = [0, 20, 40, 60, 80]; }
        lim.push(100);
        var n = lim.length - 1, z = [];
        for (i = 0; i < n; i++) z.push({de: lim[i], ate: lim[i + 1], cor: mistura(it.cor, 0.22 + 0.78 * (n === 1 ? 1 : i / (n - 1)))});
        return z;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.' + ID + ' h2{color:' + AC + ';margin-bottom:16px;text-align:center}' +
        '.' + ID + ' h3{color:' + AC + ';margin:26px 0 10px;font-size:1.12em}' +
        '.' + ID + '-hero{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.' + ID + '-hero b{font-size:1.45em;display:block}.' + ID + '-hero small{display:block;font-weight:400;font-size:.8em;margin-top:2px}' +
        '.' + ID + '-cards{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}' +
        '.' + ID + '-card{flex:1;min-width:120px;background:#fff;padding:14px;border-radius:10px;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.06);border-top:4px solid ' + AC + '}' +
        '.' + ID + '-card b{display:block;font-size:2em}' +
        '.' + ID + '-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.' + ID + '-bar{position:relative;height:20px;background:#e0e0e0;border-radius:10px;margin:6px 0 2px}.' + ID + '-bar>div{height:20px;border-radius:10px}' +
        '.' + ID + '-mk{position:absolute;top:-4px;width:3px;height:28px;background:#37474f}' +
        '.' + ID + '-rg{margin:10px 0 16px}.' + ID + '-rgh{display:flex;justify-content:space-between;gap:10px;font-size:.95em}.' + ID + '-rgh span{color:#555;font-size:.9em;white-space:nowrap}' +
        '.' + ID + '-rgs{font-size:.8em;color:#777;margin:1px 0 3px}' +
        '.' + ID + '-rgb{position:relative;height:16px;border-radius:8px;margin:12px 0 2px;border:1px solid #cfcfcf;background:' + SPEC_CSS + '}' +
        '.' + ID + '-rgp{position:absolute;top:-9px;width:0;height:0;margin-left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #222}' +
        '.' + ID + '-rgp:after{content:"";position:absolute;left:-1px;top:-1px;width:2px;height:26px;background:#222}' +
        '.' + ID + '-rgt{position:relative;height:14px;font-size:.72em;color:#555}.' + ID + '-rgt i{position:absolute;transform:translateX(-50%);font-style:normal}' +
        '.' + ID + '-rgg{margin:18px 0 4px;padding:6px 10px;background:#eceff1;border-left:4px solid #37474f;font-weight:700;color:#37474f}.' + ID + '-rgg small{display:block;font-weight:400;color:#607d8b;font-size:.82em}' +
        '.' + ID + '-gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}' +
        '.' + ID + '-g{text-align:center}.' + ID + '-gt{font-size:.82em;line-height:1.35;color:#333;margin-top:2px}.' + ID + '-gt span{color:#666;font-size:.92em}' +
        '.' + ID + '-fx{display:flex;height:22px;border-radius:11px;overflow:hidden;margin:8px 0 4px;position:relative}.' + ID + '-fx>div{height:22px}' +
        '.' + ID + '-pino{position:absolute;top:-5px;width:4px;height:32px;background:#000;border-radius:2px}' +
        '.' + ID + '-tag{display:inline-block;padding:2px 10px;border-radius:10px;font-size:.8em;font-weight:700;color:#fff;margin-bottom:6px}' +
        '.' + ID + '-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.' + ID + '-tab th{background:' + AC + ';color:#fff;padding:7px 4px}.' + ID + '-tab td{padding:6px;border-bottom:1px solid #eee;vertical-align:top}' +
        '.' + ID + '-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById(ID + '-css')) return;
        var st = document.createElement('style'); st.id = ID + '-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlBloco(b) {
        var h = '', i;
        if (b.t === 'hero') {
            return '<div class="' + ID + '-hero" style="background:' + b.fundo + ';border-color:' + b.borda + ';color:' + b.cor + '"><b>' + esc(b.titulo) + '</b>' + (b.sub ? '<small>' + esc(b.sub) + '</small>' : '') + '</div>';
        }
        if (b.t === 'cards') {
            h = '<div class="' + ID + '-cards">';
            b.itens.forEach(function (c) { h += '<div class="' + ID + '-card" style="border-top-color:' + (c.cor || AC) + '"><small>' + esc(c.rot) + '</small><b>' + esc(c.valor) + '</b><small>' + esc(c.de || '') + '</small></div>'; });
            return h + '</div>';
        }
        if (b.t === 'regua') {
            h = (b.titulo ? '<h3>' + esc(b.titulo) + '</h3>' : '') + '<div class="' + ID + '-box">';
            if (b.legenda) h += '<div style="font-size:.84em;color:#555;margin-bottom:10px">' + esc(b.legenda) + '</div>';
            b.itens.forEach(function (it) {
                if (it.grupo != null) { h += '<div class="' + ID + '-rgg">' + esc(it.grupo) + (it.grupoDesc ? '<small>' + esc(it.grupoDesc) + '</small>' : '') + '</div>'; return; }
                var pc = Math.max(0, Math.min(100, it.pct));
                h += '<div class="' + ID + '-rg"><div class="' + ID + '-rgh"><b>' + esc(it.rot) + '</b>' + (it.txt ? '<span>' + esc(it.txt) + '</span>' : '') + '</div>' +
                    (it.sub ? '<div class="' + ID + '-rgs">' + esc(it.sub) + '</div>' : '') +
                    '<div class="' + ID + '-rgb"><div class="' + ID + '-rgp" style="left:' + pc + '%"></div></div><div class="' + ID + '-rgt">' +
                    (it.ticks || []).map(function (tk) { return '<i style="left:' + tk.pct + '%">' + esc(tk.rot) + '</i>'; }).join('') + '</div></div>';
            });
            if (b.nota) h += '<div style="font-size:.8em;color:#666;margin-top:6px">' + esc(b.nota) + '</div>';
            return h + '</div>';
        }
        if (b.t === 'faixas') {
            var span = b.max - b.min;
            h = '<div class="' + ID + '-box"><b>' + esc(b.titulo) + '</b><div class="' + ID + '-fx">';
            b.faixas.forEach(function (f, ix) { h += '<div style="width:' + ((f.ate - f.de) / span * 100) + '%;background:' + f.cor + ';opacity:' + (ix === b.ativo ? 1 : 0.35) + '"></div>'; });
            h += '<div class="' + ID + '-pino" style="left:calc(' + Math.max(0, Math.min(99.5, (b.pino - b.min) / span * 100)) + '% - 2px)"></div></div><div style="font-size:.8em;color:#555">';
            b.faixas.forEach(function (f, ix) { h += '<span style="display:inline-block;margin-right:12px"><span style="display:inline-block;width:10px;height:10px;background:' + f.cor + ';border-radius:2px"></span> ' + esc(f.rot) + (ix === b.ativo ? ' <b>(aqui)</b>' : '') + '</span>'; });
            return h + '</div></div>';
        }
        if (b.t === 'barras' && (b.ponteiro || cfg.ponteiro)) {
            h = (b.titulo ? '<h3>' + esc(b.titulo) + '</h3>' : '') + '<div class="' + ID + '-box"><div class="' + ID + '-gg">';
            b.itens.forEach(function (it) {
                var zs = zonasDe(it), R = 90, r0 = 56, cx = 100, cy = 100, ps = '';
                zs.forEach(function (z) {
                    var a0 = Math.PI * (1 - z.de / 100), a1 = Math.PI * (1 - z.ate / 100), g = a1 < a0 ? 1 : 0;
                    var X = function (r, a) { return (cx + r * Math.cos(a)).toFixed(1); }, Y = function (r, a) { return (cy - r * Math.sin(a)).toFixed(1); };
                    ps += '<path d="M' + X(R, a0) + ' ' + Y(R, a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + X(R, a1) + ' ' + Y(R, a1) + ' L' + X(r0, a1) + ' ' + Y(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + X(r0, a0) + ' ' + Y(r0, a0) + ' Z" fill="' + z.cor + '" stroke="#fff" stroke-width="1.5"/>';
                });
                var an = Math.PI * (1 - Math.max(0, Math.min(100, it.pct)) / 100), nx = (cx + 82 * Math.cos(an)).toFixed(1), ny = (cy - 82 * Math.sin(an)).toFixed(1);
                h += '<div class="' + ID + '-g"><svg viewBox="0 0 200 112" width="100%" role="img" aria-label="' + esc(it.rot + (it.txt ? ': ' + it.txt : '')) + '">' + ps +
                    '<line x1="100" y1="100" x2="' + nx + '" y2="' + ny + '" stroke="#222" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="8" fill="#222"/></svg>' +
                    '<div class="' + ID + '-gt"><b>' + esc(it.rot) + '</b>' + (it.txt ? '<br><span>' + esc(it.txt) + '</span>' : '') + '</div></div>';
            });
            h += '</div>';
            if (b.nota) h += '<div style="font-size:.8em;color:#666;margin-top:8px">' + esc(b.nota) + '</div>';
            return h + '</div>';
        }
        if (b.t === 'barras') {
            h = (b.titulo ? '<h3>' + esc(b.titulo) + '</h3>' : '') + '<div class="' + ID + '-box">';
            b.itens.forEach(function (it) {
                h += '<div style="margin:8px 0 12px"><b>' + esc(it.rot) + '</b>' + (it.txt ? ': ' + esc(it.txt) : '') + '<div class="' + ID + '-bar"><div style="width:' + Math.max(1, Math.min(100, it.pct)) + '%;background:' + it.cor + '"></div>' + (it.cortes || []).map(function (ct) { return '<div class="' + ID + '-mk" style="left:' + ct.pct + '%" title="' + esc(ct.rot || '') + '"></div>'; }).join('') + '</div></div>';
            });
            if (b.nota) h += '<div style="font-size:.8em;color:#666">' + esc(b.nota) + '</div>';
            return h + '</div>';
        }
        if (b.t === 'textos') {
            h = b.titulo ? '<h3>' + esc(b.titulo) + '</h3>' : '';
            b.itens.forEach(function (it) {
                h += '<div class="' + ID + '-box">' + (it.tag ? '<span class="' + ID + '-tag" style="background:' + (it.tagCor || AC2) + '">' + esc(it.tag) + '</span><br>' : '') + '<b>' + esc(it.t) + ':</b> ' + esc(it.x) + '</div>';
            });
            return h;
        }
        if (b.t === 'tabela') {
            h = (b.titulo ? '<h3>' + esc(b.titulo) + '</h3>' : '') + '<div style="overflow-x:auto"><table class="' + ID + '-tab"><thead><tr>';
            b.cols.forEach(function (c) { h += '<th' + (c.al === 'l' ? ' style="text-align:left"' : '') + '>' + esc(c.h) + '</th>'; });
            h += '</tr></thead><tbody>';
            b.linhas.forEach(function (ln) {
                if (ln.grupo != null) { h += '<tr><td colspan="' + b.cols.length + '" style="background:#eceff1;font-weight:700;color:#37474f">' + esc(ln.grupo) + '</td></tr>'; return; }
                h += '<tr>'; ln.c.forEach(function (cel, ix) { h += '<td style="text-align:' + (b.cols[ix].al === 'l' ? 'left' : 'center') + (ix === 0 ? ';font-weight:700' : '') + '">' + esc(cel) + '</td>'; }); h += '</tr>';
            });
            return h + '</tbody></table></div>';
        }
        if (b.t === 'aviso') return '<div class="' + ID + '-disc"><b>IMPORTANTE:</b> ' + esc(b.x) + '</div>';
        return '';
    }
    function htmlTela(r) {
        injetarCSS();
        var h = '<div class="' + ID + '"><h2>&#128203; Resultados &#8212; ' + esc(cfg.nome) + '</h2>';
        cfg.blocks(r).forEach(function (b) { h += htmlBloco(b); });
        return h + '</div>';
    }

    // ===================== PDF =====================
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, AC); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AC); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function pdfBloco(c, b) {
        var doc = c.doc, i, y0;
        if (b.t === 'hero') {
            doc.setFont(undefined, 'bold'); doc.setFontSize(13);
            var tl = doc.splitTextToSize(pt(b.titulo), CW - 10); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
            var sl = b.sub ? doc.splitTextToSize(pt(b.sub), CW - 10) : [], hh = 6 + tl.length * 6 + sl.length * 4.2 + 3;
            c.need(hh + 4);
            F(doc, b.fundo); doc.rect(ML, c.y, CW, hh, 'F'); D(doc, b.borda); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, hh, 'S');
            T(doc, b.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(tl, 105, c.y + 7, {align: 'center'});
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); if (sl.length) doc.text(sl, 105, c.y + 7 + tl.length * 6, {align: 'center'});
            c.y += hh + 5; return;
        }
        if (b.t === 'cards') {
            c.need(28); var n = b.itens.length, w = (CW - (n - 1) * 5) / n;
            b.itens.forEach(function (it, ix) {
                var x = ML + ix * (w + 5);
                F(doc, '#f6f7fb'); doc.rect(x, c.y, w, 22, 'F'); F(doc, it.cor || AC); doc.rect(x, c.y, w, 1.6, 'F');
                T(doc, '#555555'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(pt(it.rot), x + w / 2, c.y + 7, {align: 'center'});
                T(doc, '#111111'); doc.setFontSize(16); doc.text(pt(it.valor), x + w / 2, c.y + 15, {align: 'center'});
                T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.5); doc.text(pt(it.de || ''), x + w / 2, c.y + 20, {align: 'center'});
            });
            c.y += 28; return;
        }
        if (b.t === 'regua') {
            if (b.titulo) { c.need(50); secao(c, b.titulo); }
            var xr = ML + 2, wr = CW - 4, NS = 120;
            if (b.legenda) {
                doc.setFont(undefined, 'normal'); doc.setFontSize(8); var lg = doc.splitTextToSize(pt(b.legenda), CW - 4);
                c.need(lg.length * 3.8 + 3); T(doc, '#555555'); doc.text(lg, xr, c.y + 3); c.y += lg.length * 3.8 + 3;
            }
            b.itens.forEach(function (it) {
                if (it.grupo != null) {
                    doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
                    var gd = it.grupoDesc ? doc.splitTextToSize(pt(it.grupoDesc), CW - 12) : [];
                    var gh = 7.5 + gd.length * 3.3; c.need(gh + 24);
                    F(doc, '#eceff1'); doc.rect(ML, c.y, CW, gh, 'F'); F(doc, '#37474f'); doc.rect(ML, c.y, 1.4, gh, 'F');
                    T(doc, '#37474f'); doc.setFont(undefined, 'bold'); doc.setFontSize(9.2); doc.text(pt(it.grupo), ML + 4, c.y + 5);
                    if (gd.length) { T(doc, '#607d8b'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.4); doc.text(gd, ML + 4, c.y + 8.6); }
                    c.y += gh + 2.5; return;
                }
                var hasSub = !!it.sub, hr = 4.6 + (hasSub ? 3.6 : 0) + 4 + 4.4 + 5.2 + 3;
                c.need(hr);
                T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(it.rot), xr, c.y + 3.6);
                if (it.txt) { T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.text(pt(it.txt), xr + wr, c.y + 3.6, {align: 'right'}); }
                var yy = c.y + 4.6;
                if (hasSub) { T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text(doc.splitTextToSize(pt(it.sub), wr)[0], xr, yy + 2.2); yy += 3.6; }
                var yb = yy + 4.2, hb = 4.4, s;
                for (s = 0; s < NS; s++) { var cc = espectro((s + 0.5) / NS); doc.setFillColor(cc[0], cc[1], cc[2]); doc.rect(xr + wr * s / NS, yb, wr / NS + 0.12, hb, 'F'); }
                D(doc, '#b0b0b0'); doc.setLineWidth(0.25); doc.rect(xr, yb, wr, hb, 'S');
                var px = xr + wr * Math.max(0, Math.min(100, it.pct)) / 100;
                F(doc, '#222222'); doc.triangle(px - 2, yb - 3.6, px + 2, yb - 3.6, px, yb - 0.2, 'F');
                D(doc, '#222222'); doc.setLineWidth(0.5); doc.line(px, yb - 0.2, px, yb + hb + 1.2);
                T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.6);
                (it.ticks || []).forEach(function (tk) { var tx = xr + wr * tk.pct / 100; D(doc, '#888888'); doc.setLineWidth(0.2); doc.line(tx, yb + hb, tx, yb + hb + 1); doc.text(pt(tk.rot), tx, yb + hb + 3.6, {align: 'center'}); });
                c.y += hr;
            });
            if (b.nota) { doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); var nl = doc.splitTextToSize(pt(b.nota), CW - 4); c.need(nl.length * 3.2 + 4); T(doc, '#666666'); doc.text(nl, ML + 2, c.y + 3); c.y += nl.length * 3.2 + 4; }
            c.y += 2; return;
        }
        if (b.t === 'faixas') {
            secao(c, b.titulo); c.need(24);
            var x0 = ML + 2, w0 = CW - 4, yb = c.y + 3, hb = 6, span = b.max - b.min;
            b.faixas.forEach(function (f, ix) { F(doc, ix === b.ativo ? f.cor : '#e6e6e6'); doc.rect(x0 + w0 * (f.de - b.min) / span, yb, w0 * (f.ate - f.de) / span, hb, 'F'); });
            var px = x0 + w0 * Math.max(0, Math.min(1, (b.pino - b.min) / span));
            D(doc, '#000000'); doc.setLineWidth(1.0); doc.line(px, yb - 1.8, px, yb + hb + 1.8);
            doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); T(doc, '#555555');
            b.faixas.forEach(function (f) { doc.text(pt(f.rot), x0 + w0 * ((f.de + f.ate) / 2 - b.min) / span, yb + hb + 4.2, {align: 'center'}); });
            c.y += 21; return;
        }
        if (b.t === 'barras' && (b.ponteiro || cfg.ponteiro)) {
            if (b.titulo) { c.need(60); secao(c, b.titulo); }
            var NC = 3, GAP = 4, gw = (CW - 4 - (NC - 1) * GAP) / NC, RO = 17, RI = 10.5, k0, j0;
            for (k0 = 0; k0 < b.itens.length; k0 += NC) {
                var fila = b.itens.slice(k0, k0 + NC), nt = 1, nc = 1;
                doc.setFont(undefined, 'bold'); doc.setFontSize(8);
                var tls = fila.map(function (it) { var l = doc.splitTextToSize(pt(it.rot), gw - 2); nt = Math.max(nt, l.length); return l; });
                doc.setFont(undefined, 'normal'); doc.setFontSize(7);
                var cls = fila.map(function (it) { var l = it.txt ? doc.splitTextToSize(pt(it.txt), gw - 2) : []; nc = Math.max(nc, l.length || 1); return l; });
                var hh = nt * 3.7 + 3 + RO + 3 + nc * 3.1 + 4;
                c.need(hh + 2);
                fila.forEach(function (it, j) {
                    var x0 = ML + 2 + j * (gw + GAP), cx = x0 + gw / 2, cy = c.y + nt * 3.7 + 3 + RO;
                    T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(tls[j], cx, c.y + 3.2, {align: 'center'});
                    zonasDe(it).forEach(function (z) {
                        var a0 = Math.PI * (1 - z.de / 100), a1 = Math.PI * (1 - z.ate / 100), n = Math.max(2, Math.ceil(Math.abs(a0 - a1) / (Math.PI / 45))), pts = [], s;
                        for (s = 0; s <= n; s++) { var a = a0 + (a1 - a0) * s / n; pts.push([cx + RO * Math.cos(a), cy - RO * Math.sin(a)]); }
                        for (s = n; s >= 0; s--) { var a2 = a0 + (a1 - a0) * s / n; pts.push([cx + RI * Math.cos(a2), cy - RI * Math.sin(a2)]); }
                        var rel = [], q; for (q = 1; q < pts.length; q++) rel.push([pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]]);
                        F(doc, z.cor); D(doc, '#ffffff'); doc.setLineWidth(0.5); doc.lines(rel, pts[0][0], pts[0][1], [1, 1], 'FD', true);
                    });
                    var an = Math.PI * (1 - Math.max(0, Math.min(100, it.pct)) / 100);
                    D(doc, '#222222'); doc.setLineWidth(1.1); doc.line(cx, cy, cx + (RO - 1.5) * Math.cos(an), cy - (RO - 1.5) * Math.sin(an));
                    F(doc, '#222222'); doc.circle(cx, cy, 1.7, 'F');
                    T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7); if (cls[j].length) doc.text(cls[j], cx, cy + 5.2, {align: 'center'});
                });
                c.y += hh;
            }
            if (b.nota) { T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text(doc.splitTextToSize(pt(b.nota), CW - 4), ML + 2, c.y + 3); c.y += 9; }
            c.y += 2; return;
        }
        if (b.t === 'barras') {
            if (b.titulo) { c.need(34); secao(c, b.titulo); }
            var xb = ML + 2, wb = CW - 4;
            b.itens.forEach(function (it) {
                var temC = it.cortes && it.cortes.length;
                c.need(temC ? 16 : 12);
                T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(it.rot + (it.txt ? ': ' + it.txt : '')), xb, c.y + 3.6);
                var yb2 = c.y + 5;
                F(doc, '#e0e0e0'); doc.roundedRect(xb, yb2, wb, 5, 2.5, 2.5, 'F');
                F(doc, it.cor); doc.roundedRect(xb, yb2, Math.max(2, wb * Math.min(100, it.pct) / 100), 5, 2.5, 2.5, 'F');
                (it.cortes || []).forEach(function (ct) {
                    var cx = xb + wb * ct.pct / 100;
                    D(doc, '#37474f'); doc.setLineWidth(0.7); doc.line(cx, yb2 - 1.2, cx, yb2 + 6.2);
                    if (ct.rot) { T(doc, '#37474f'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); doc.text(pt(ct.rot), cx, yb2 + 9.4, {align: 'center'}); }
                });
                c.y += temC ? 15 : 12;
            });
            if (b.nota) { T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text(pt(b.nota), ML + 2, c.y + 4); c.y += 9; }
            c.y += 2; return;
        }
        if (b.t === 'textos') {
            if (b.titulo) { c.need(42); secao(c, b.titulo); }
            b.itens.forEach(function (it) {
                doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
                var ln = doc.splitTextToSize(pt(it.x), CW - 10), h = 5.5 + (it.tag ? 6 : 0) + ln.length * 4.1 + 5;
                c.need(h + 2);
                F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
                var yy = c.y + 4.6;
                T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(it.t), ML + 5, yy); yy += 5;
                if (it.tag) { F(doc, it.tagCor || AC2); doc.roundedRect(ML + 5, yy - 3.4, Math.max(22, pt(it.tag).length * 1.9 + 6), 4.6, 1.6, 1.6, 'F'); T(doc, '#ffffff'); doc.setFontSize(7); doc.text(pt(it.tag), ML + 8, yy); yy += 5; }
                T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
                c.y += h + 3;
            });
            return;
        }
        if (b.t === 'tabela') {
            c.need(b.minAltura || 30); if (b.titulo) secao(c, b.titulo);
            var xs = [], xa = ML; b.cols.forEach(function (cl) { xs.push(xa); xa += cl.w; });
            F(doc, AC); doc.rect(ML, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
            b.cols.forEach(function (cl, ix) { if (cl.al === 'l') doc.text(pt(cl.h), xs[ix] + 2, c.y + 4.7); else doc.text(pt(cl.h), xs[ix] + cl.w / 2, c.y + 4.7, {align: 'center'}); });
            c.y += 7; var zebra = 0;
            b.linhas.forEach(function (ln) {
                if (ln.grupo != null) { c.need(14); F(doc, '#eceff1'); doc.rect(ML, c.y, CW, 5.6, 'F'); T(doc, '#37474f'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6); doc.text(pt(String(ln.grupo).toUpperCase()), ML + 2, c.y + 4); c.y += 5.6; zebra = 0; return; }
                doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
                var cel = ln.c.map(function (tx, ix) { return doc.splitTextToSize(pt(tx), b.cols[ix].w - 3); });
                var mx = 1; cel.forEach(function (a) { if (a.length > mx) mx = a.length; });
                var rh = Math.max(5.4, mx * 3.3 + 2.4);
                c.need(rh);
                if (zebra++ % 2 === 0) { F(doc, '#f6f7fb'); doc.rect(ML, c.y, CW, rh, 'F'); }
                cel.forEach(function (a, ix) {
                    T(doc, ix === 0 ? '#000000' : '#333333'); doc.setFont(undefined, ix === 0 ? 'bold' : 'normal');
                    if (b.cols[ix].al === 'l') doc.text(a, xs[ix] + 2, c.y + 3.5); else doc.text(a, xs[ix] + b.cols[ix].w / 2, c.y + (a.length > 1 ? 3.5 : rh / 2 + 1), {align: 'center'});
                });
                c.y += rh;
            });
            c.y += 6; return;
        }
        if (b.t === 'aviso') {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
            var avl = doc.splitTextToSize(pt(b.x), CW - 8), hv = avl.length * 3.8 + 8;
            c.need(hv + 2);
            F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
            T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
            doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
            c.y += hv + 6; return;
        }
        if (b.t === 'refs') {
            c.need(40); secao(c, 'REFER\u00caNCIAS');
            T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.6);
            b.itens.forEach(function (rf) {
                var rl = doc.splitTextToSize(pt(rf), CW - 4);
                c.need(rl.length * 4.2 + 4); doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.2 + 4;
            });
        }
    }
    function pdf(r, info) {
        info = info || {};
        var doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AC); doc.rect(0, 0, 210, 35, 'F'); F(doc, AC2); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold'); doc.text(pt(cfg.nome + ' - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt(cfg.sub1 || ''), 105, 22, {align: 'center'}); doc.text(pt(cfg.sub2 || ''), 105, 28, {align: 'center'});
        var extra = cfg.dadosExtra ? cfg.dadosExtra(r, info) : [], hd = 20 + extra.length * 5, y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, hd, 'F'); F(doc, AC); doc.rect(ML, y, 1.6, hd, 'F');
        T(doc, AC); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text(pt(cfg.dadosTitulo || 'DADOS DO PACIENTE'), 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        extra.forEach(function (ln, ix) { doc.text(pt(ln), 20, y + 22 + ix * 5); });
        c.y = y + hd + 6;
        cfg.blocks(r).forEach(function (b) { pdfBloco(c, b); });
        if (cfg.refs && cfg.refs.length) pdfBloco(c, {t: 'refs', itens: cfg.refs});
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg); doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | ' + pt(cfg.nome) + ' | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save(pt(cfg.nome).replace(/\s+/g, '') + '_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }
    function pdfPainel(d, rec) {
        if (!d || !d.respostas) return false;
        var nm = String(d.escala || '').toUpperCase();
        if ((cfg.escalaPainel || [cfg.nome.toUpperCase()]).indexOf(nm) < 0) return false;
        var r;
        try { r = cfg.fromPainel(d); } catch (e) { return false; }
        if (!r) return false;
        pdf(r, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (rec && rec.date) ? new Date(rec.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }
    return {htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel};
}

// ysql3-visual.js - YSQ-L3 (Young Schema Questionnaire - Long Form 3), versao oficial para uso no Brasil (Oliveira, Souza, Damasceno; (c) 2014 Young).
// 232 itens, 1-6, 18 esquemas em FAIXAS CONSECUTIVAS de itens (folha oficial "Ficha de correcao - YSQ-L3 Brasil").
// PONTUACAO OFICIAL: para cada esquema, contam-se quantos itens receberam 4, 5 e 6; o total do esquema = 4 x (n de 4) + 5 x (n de 5) + 6 x (n de 6)
// (itens com 1, 2 e 3 NAO entram na soma); maximo possivel = 6 x numero de itens. A folha traz a coluna "O quao alta foi sua pontuacao?" mas SEM pontos de corte.
// O site antigo somava TODOS os itens e classificava Baixa/Media/Alta (40%/70%) sem fonte (removido).
// d.respostas: chaves 1..232 com 1-6. versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS = ["As pessoas n\u00e3o estiveram dispon\u00edveis para atender as minhas necessidades emocionais.","Eu n\u00e3o tive amor e aten\u00e7\u00e3o suficientes.","Eu n\u00e3o tive praticamente ningu\u00e9m com quem pudesse contar para me dar conselhos e apoio emocional.","Na maior parte do tempo, eu n\u00e3o tive ningu\u00e9m para me dar afeto, cuidado e prote\u00e7\u00e3o, que partilhasse sua vida comigo ou que se importasse de verdade com tudo que me acontece.","Em grande parte da minha vida, n\u00e3o tive algu\u00e9m que quisesse se aproximar de mim e passar bastante tempo comigo.","No geral, as pessoas n\u00e3o estiveram dispon\u00edveis para me dar conforto, suporte e afeto.","Em boa parte da minha vida, eu n\u00e3o me senti especial para ningu\u00e9m.","Na maior parte do tempo, eu n\u00e3o tive ningu\u00e9m que realmente me escutasse, me compreendesse ou estivesse conectado com as minhas verdadeiras necessidades e sentimentos.","Eu poucas vezes tive uma pessoa forte para me dar conselhos sensatos ou orienta\u00e7\u00e3o. a (pe) 8 Na maior parte do tempo, n\u00e3o tive ningu\u00e9m que realmente me escutasse, me compreendesse ou estivesse conectado com as minhas verdadeiras necessidades e sentimentos.","Me preocupa muito que as pessoas que eu amo morram logo, ainda que n\u00e3o haja raz\u00f5es m\u00e9dicas para essa preocupa\u00e7\u00e3o.","Eu tenho uma tend\u00eancia a me grudar \u00e0s pessoas que s\u00e3o pr\u00f3ximas de mim com medo de que elas me abandonem.","Eu me preocupo muito que pessoas pr\u00f3ximas a mim me deixem ou me abandonem.","Eu sinto que me falta uma base est\u00e1vel de apoio emocional.","Eu sinto que os relacionamentos importantes para mim n\u00e3o ser\u00e3o duradouros; acredito que em algum momento eles terminar\u00e3o.","Eu me sinto viciado em parceiros que n\u00e3o est\u00e3o dispon\u00edveis para mim de forma comprometida.","No final das contas, ficarei sozinho.","Quando eu sinto que algu\u00e9m de que gosto est\u00e1 se afastando de mim, me desespero.","\u00c0s vezes eu me preocupo tanto que as pessoas possam me abandonar que eu acabo as afastando de mim.","Eu fico chateado quando algu\u00e9m me deixa sozinho, mesmo por um per\u00edodo curto de tempo.","Eu n\u00e3o posso achar que as pessoas que me apoiam estar\u00e3o dispon\u00edveis para mim quando eu precisar.","Eu n\u00e3o permito me aproximar muito das outras pessoas, pois n\u00e3o tenho como ter certeza de que elas sempre estar\u00e3o presentes.","Parece que as pessoas importantes na minha vida est\u00e3o sempre indo e vindo.","Eu me preocupo muito que as pessoas que eu amo encontrem uma outra pessoa que elas prefiram e me deixem.","As pessoas pr\u00f3ximas a mim foram sempre muito imprevis\u00edveis: uma hora elas est\u00e3o dispon\u00edveis e s\u00e3o legais comigo; noutra, elas est\u00e3o bravas, chateadas, fechadas no seu pr\u00f3prio mundo, brigando, etc.","Eu preciso tanto das pessoas que fico muito preocupado com a possibilidade de perd\u00ea-las.","Eu n\u00e3o posso ser eu mesmo ou expressar o que eu realmente sinto; se eu fizer isso, as pessoas me deixar\u00e3o.","Eu sinto que as pessoas v\u00e3o tirar vantagem de mim.","Eu frequentemente sinto que preciso me proteger das outras pessoas.","Eu sinto que n\u00e3o posso baixar a guarda na presen\u00e7a de outras pessoas; sen\u00e3o, elas me machucar\u00e3o intencionalmente.","Se alguma pessoa \u00e9 legal comigo, eu j\u00e1 acho que ela quer alguma coisa.","\u00c9 s\u00f3 uma quest\u00e3o de tempo at\u00e9 que algu\u00e9m me traia.","A maioria das pessoas s\u00f3 pensa nelas mesmas.","Eu tenho muita dificuldade em confiar nas pessoas.","Eu desconfio bastante das inten\u00e7\u00f5es das outras pessoas.","As outras pessoas raramente s\u00e3o honestas; geralmente, elas n\u00e3o s\u00e3o o que aparentam.","Eu geralmente estou atento aos motivos ocultos e \u00e0s segundas inten\u00e7\u00f5es das outras pessoas.","Se eu acho que alguma pessoa tem a inten\u00e7\u00e3o de me prejudicar, eu tento prejudic\u00e1-la antes.","As pessoas geralmente precisam me provar quem s\u00e3o para que depois eu possa confiar nelas.","Eu testo as pessoas para ver se elas est\u00e3o me dizendo a verdade e se est\u00e3o bem-intencionadas.","Meu lema \u00e9: \u201cControle ou seja controlado\u201d.","Eu fico com raiva quando penso na forma como fui maltratado pelas pessoas ao longo da minha vida.","Durante a minha vida, aqueles que eram pr\u00f3ximos se aproveitaram de mim ou me usaram para os seus pr\u00f3prios interesses.","Eu fui abusado f\u00edsica, emocional ou sexualmente por pessoas importantes na minha vida.","Eu n\u00e3o me encaixo.","Eu sou fundamentalmente diferente das outras pessoas.","Eu n\u00e3o fa\u00e7o parte: sou uma pessoa solit\u00e1ria.","Eu me sinto afastado das outras pessoas.","Eu me sinto isolado e sozinho.","Eu sempre me sinto deslocado ou de fora dos grupos.","Ningu\u00e9m me entende realmente.","A minha fam\u00edlia sempre foi diferente das outras fam\u00edlias pr\u00f3ximas de n\u00f3s.","Eu \u00e0s vezes sinto como se eu fosse um ET.","Se eu desaparecesse amanh\u00e3, ningu\u00e9m notaria.","Nenhum homem/mulher que eu deseje seria capaz de me amar depois de ver meus defeitos.","Ningu\u00e9m que eu deseje iria querer ficar perto de mim se conhecesse quem eu sou de verdade.","Eu sou defeituoso e cheio de falhas por natureza.","N\u00e3o importa o quanto eu tente, sinto que n\u00e3o serei capaz de fazer com que um homem/mulher que eu admire venha a me respeitar ou sinta que eu valho a pena.","Eu n\u00e3o sou digno do amor, da aten\u00e7\u00e3o e do respeito dos outros.","Eu sinto que n\u00e3o sou digno de receber amor.","Eu sou inaceit\u00e1vel demais em aspectos muito b\u00e1sicos para me mostrar as outras pessoas ou permitir que elas me conhe\u00e7am bem.","Se as outras pessoas descobrissem os meus defeitos fundamentais, eu n\u00e3o conseguiria encar\u00e1- las.","Quando as pessoas gostam de mim, sinto que as estou enganando.","Eu frequentemente me sinto atra\u00eddo por pessoas que s\u00e3o muito cr\u00edticas em rela\u00e7\u00e3o a mim ou me rejeitam.","H\u00e1 algo secreto em mim; n\u00e3o quero que as pessoas pr\u00f3ximas a mim descubram.","\u00c9 minha culpa o fato de meus pais (ambos ou um deles) n\u00e3o terem conseguido me amar o suficiente.","Eu n\u00e3o permito que as pessoas conhe\u00e7am quem eu sou de verdade.","Um dos meus maiores medos \u00e9 que meus defeitos sejam expostos.","N\u00e3o consigo entender como algu\u00e9m poderia me amar.","Quase nada do que eu fa\u00e7o no trabalho (ou nos estudos) \u00e9 t\u00e3o bom quanto o que os outros s\u00e3o capazes de fazer.","Eu sou incompetente no que se refere a realiza\u00e7\u00f5es pessoais/profissionais.","A maioria das pessoas \u00e9 mais capaz do que eu no trabalho e nas realiza\u00e7\u00f5es pessoais.","Eu sou um fracasso.","Eu n\u00e3o sou t\u00e3o talentoso no trabalho (ou estudos) quanto a maioria das pessoas.","Eu n\u00e3o sou t\u00e3o inteligente no trabalho (ou estudos) quanto a maioria das pessoas.","Eu sou humilhado pelas minhas falhas e inadequa\u00e7\u00f5es no trabalho (ou estudos).","Eu frequentemente me sinto envergonhado quando estou com outras pessoas, pois as minhas realiza\u00e7\u00f5es n\u00e3o se comparam \u00e0s delas.","Eu geralmente comparo minhas realiza\u00e7\u00f5es \u00e0s das outras pessoas e sinto que elas s\u00e3o muito mais bem-sucedidas.","Eu n\u00e3o sinto que sou capaz de me virar sem a ajuda dos outros no dia a dia.","Eu preciso da ajuda dos outros para conseguir viver.","Eu sinto que n\u00e3o consigo lidar bem sozinho com as dificuldades da vida.","Eu acredito que as outras pessoas cuidam melhor de mim do que eu mesmo.","Eu tenho dificuldade de realizar atividades novas fora do trabalho, a menos que eu tenha algu\u00e9m para me orientar.","Eu me vejo como uma pessoa que depende muito dos outros no que se refere ao meu funcionamento di\u00e1rio.","Eu estrago tudo que tento fazer, mesmo fora do trabalho (ou estudos).","Eu sou incapaz em quase todas as \u00e1reas na minha vida.","Se eu confiar no meu pr\u00f3prio julgamento para tomar decis\u00f5es no dia-a-dia, eu tomarei as decis\u00f5es erradas.","Me falta bom senso.","N\u00e3o se pode contar com meu julgamento em situa\u00e7\u00f5es do dia a dia.","Eu n\u00e3o tenho confian\u00e7a na minha habilidade de resolver os problemas que surgem no dia a dia.","Eu sinto que necessito de algu\u00e9m com quem possa contar para me dar conselhos a respeito de quest\u00f5es pr\u00e1ticas.","Eu me sinto mais como uma crian\u00e7a do que como um adulto quando \u00e9 preciso lidar com responsabilidades do dia a dia.","Eu acho as responsabilidades do dia a dia sufocantes.","Parece que eu n\u00e3o consigo parar de sentir que algo ruim est\u00e1 prestes a acontecer.","Eu sinto que uma trag\u00e9dia (natural, financeira, criminal ou de sa\u00fade) pode acontecer a qualquer momento.","Eu tenho medo de me tornar um morador de rua ou indigente.","Eu me preocupo bastante com a possibilidade de ser atacado.","Eu tomo muitas precau\u00e7\u00f5es para evitar ficar doente ou me ferir.","Eu me preocupo com a possibilidade de desenvolver uma doen\u00e7a grave, mesmo que nada s\u00e9rio tenha sido diagnosticado pelo m\u00e9dico.","Eu sou uma pessoa medrosa.","Eu me preocupo muito com as coisas ruins que acontecem no mundo: crimes, polui\u00e7\u00e3o, etc.","Eu frequentemente sinto que posso ficar louco.","Eu frequentemente sinto que vou ter uma crise de ansiedade.","Eu frequentemente sinto que terei um ataque card\u00edaco ou c\u00e2ncer, mesmo havendo poucas raz\u00f5es m\u00e9dicas para me preocupar.","Eu sinto que o mundo \u00e9 um lugar perigoso.","Eu ainda n\u00e3o consegui me separar dos meus pais (ambos ou um deles) do jeito que as outras pessoas da minha idade parecem ter se separado.","Eu e meu pai/m\u00e3e temos a tend\u00eancia de nos envolver demais nos problemas e na vida uns dos outros.","Eu e meu pai/m\u00e3e temos dificuldades para guardar detalhes \u00edntimos uns dos outros sem nos sentirmos tra\u00eddos ou culpados.","Eu e meus pais precisamos falar uns com os outros quase todos os dia;, caso contr\u00e1rio, um de n\u00f3s se sente culpado, magoado, desapontado ou sozinho.","Eu muitas vezes sinto que n\u00e3o tenho uma identidade separada da dos meus pais ou companheiro(a).","Eu frequentemente sinto como se meus pais vivessem a minha vida ou vivessem atrav\u00e9s de mim \u2013 \u00e9 como se eu n\u00e3o tivesse uma vida pr\u00f3pria.","Para mim, \u00e9 muito dif\u00edcil manter qualquer tipo de dist\u00e2ncia das pessoas de quem sou \u00edntimo; tenho dificuldade de preservar uma percep\u00e7\u00e3o de identidade separada dos outros.","Eu estou t\u00e3o envolvido com meu companheiro(a) ou com meu pai/m\u00e3e que n\u00e3o sei quem de fato eu sou ou o que eu quero.","Eu tenho dificuldade de separar meu ponto de vista ou opini\u00e3o da do meu pai/m\u00e3e ou parceiro(a).","Quando se trata do meu pai/m\u00e3e ou parceiro(a), eu muitas vezes sinto que n\u00e3o tenho privacidade.","Eu sinto que meus pais (ambos ou somente um deles) est\u00e3o, ou ficariam, muito magoados por eu sair de casa para morar sozinho, longe deles.","Eu deixo as pessoas fazerem as coisas como elas querem, pois tenho receio das consequ\u00eancias.","Eu acho que se eu fizer o que sinto vontade e insistir nas coisas que s\u00e3o importantes para mim, os outros n\u00e3o me apoiar\u00e3o e poder\u00e3o ficar bravos ou descontentes comigo.","Eu sinto que n\u00e3o tenho outra op\u00e7\u00e3o a n\u00e3o ser ceder aos desejos dos outros; sen\u00e3o, eles v\u00e3o ficar bravos, me rejeitar ou retaliar de alguma forma.","Nas rela\u00e7\u00f5es, eu deixo a outra pessoa ter o controle.","Eu sempre deixei as outras pessoas escolherem por mim; ent\u00e3o, eu nem sei o que eu quero para mim mesmo.","Eu sinto que as decis\u00f5es importantes da minha vida n\u00e3o foram de fato tomadas por mim.","Eu me preocupo muito em agradar os outros para que eles n\u00e3o me rejeitem.","Para mim, \u00e9 muito dif\u00edcil exigir que meus direitos sejam respeitados e que meus sentimentos sejam levados em considera\u00e7\u00e3o.","Eu me vingo das pessoas nas pequenas coisas, em vez de demonstrar a minha raiva diretamente.","Eu me esfor\u00e7o mais do que a maioria das pessoas para evitar conflitos.","Eu coloco as necessidades dos outros antes das minhas; sen\u00e3o, me sinto culpado.","Eu me sinto culpado quando decepciono os outros.","Eu dou mais para os outros do que recebo em troca.","Geralmente sou eu quem acaba cuidando das pessoas que s\u00e3o pr\u00f3ximas de mim.","Ao amar algu\u00e9m, n\u00e3o h\u00e1 praticamente nada que eu n\u00e3o possa suportar.","Eu sou uma boa pessoa por pensar mais nos outros do que em mim.","No trabalho, geralmente sou eu quem se oferece para realizar tarefas extras ou trabalhar horas extras.","N\u00e3o importa o qu\u00e3o ocupado eu esteja, eu sempre consigo arranjar tempo para os outros.","Eu posso sobreviver com muito pouco, pois minhas necessidades s\u00e3o m\u00ednimas.","Eu s\u00f3 fico feliz quando as pessoas a minha volta est\u00e3o felizes.","Eu passo tanto tempo fazendo coisas para as pessoas com quem me importo, que acabo tendo pouco tempo para mim mesmo.","Eu sempre fui aquele que escuta os problemas de todo mundo.","Eu me sinto mais confort\u00e1vel dando um presente do que recebendo.","As pessoas consideram que fa\u00e7o demais pelos outros e n\u00e3o fa\u00e7o o suficiente por mim mesmo.","N\u00e3o importa o quanto eu fa\u00e7a, eu sinto que nunca \u00e9 suficiente.","Se eu fa\u00e7o o que eu quero, me sinto muito desconfort\u00e1vel.","Para mim, \u00e9 muito dif\u00edcil pedir que os outros cuidem das minhas necessidades.","Eu me preocupo em perder o controle das minhas a\u00e7\u00f5es.","Me preocupa que eu possa ferir f\u00edsica ou emocionalmente alguma pessoa se a minha raiva sair do controle.","Eu sinto que preciso controlar muito minhas emo\u00e7\u00f5es e impulsos; caso contr\u00e1rio, \u00e9 prov\u00e1vel que algo ruim aconte\u00e7a.","Muita raiva e ressentimento se acumulam dentro de mim, e eu n\u00e3o expresso.","Eu me sinto constrangido demais para demonstrar sentimentos positivos para os outros (p. ex., afeto, demonstrar que me importo).","Eu acho constrangedor demonstrar o que eu sinto para as outras pessoas.","Eu acho dif\u00edcil ser caloroso e espont\u00e2neo.","Eu sou t\u00e3o fechado que muitas pessoas acham que eu n\u00e3o tenho emo\u00e7\u00f5es.","As pessoas acham que tenho dificuldades de expressar as emo\u00e7\u00f5es.","Eu tenho que ser o melhor na maioria das coisas que eu fa\u00e7o; n\u00e3o consigo aceitar o segundo lugar.","Eu me esfor\u00e7o para manter quase tudo em perfeita ordem.","Eu tenho que parecer o melhor poss\u00edvel na maior parte do tempo.","Eu tento fazer o meu melhor; n\u00e3o consigo me conformar em ser \u201cbom o suficiente\u201d.","Eu tenho tanto a realizar que quase n\u00e3o h\u00e1 tempo para relaxar de verdade.","Quase nada do que eu fa\u00e7o \u00e9 de fato bom o suficiente; sempre posso fazer melhor.","Eu preciso dar conta de todas as minhas responsabilidades.","Eu sinto que h\u00e1 uma press\u00e3o constante para que eu conquiste e termine as coisas.","Minhas rela\u00e7\u00f5es sofrem, pois sou exigente demais comigo mesmo.","Minha sa\u00fade est\u00e1 sofrendo, pois coloco press\u00e3o demais sobre mim mesmo para que eu me saia bem.","Eu frequentemente sacrifico prazer e felicidade para atingir meus pr\u00f3prios padr\u00f5es.","Quando eu cometo um erro, mere\u00e7o ser fortemente criticado.","Eu n\u00e3o posso me despreocupar facilmente das minhas responsabilidades ou ficar arranjando desculpas para os meus erros.","Eu sou uma pessoa altamente competitiva.","Eu dou bastante \u00eanfase ao dinheiro ou status.","No que se refere ao meu desempenho, eu preciso ser sempre o \u201cn\u00famero um\u201d.","Eu tenho dificuldade de aceitar um \u201cn\u00e3o\u201d quando quero algo dos outros.","Eu muitas vezes fico bravo ou irritado se n\u00e3o consigo aquilo que quero.","Eu sou diferenciado e n\u00e3o deveria ter que aceitar muitas das restri\u00e7\u00f5es ou limita\u00e7\u00f5es impostas \u00e0s outras pessoas.","Eu detesto que me mandem fazer algo ou me impe\u00e7am de fazer aquilo que eu quero.","Eu sinto que n\u00e3o deveria ter que seguir as regras e normas que as outras pessoas t\u00eam que seguir.","Eu sinto que o que eu tenho a oferecer tem muito mais valor quando comparado ao que os outros t\u00eam para dar.","Eu geralmente coloco as minhas necessidades na frente das dos outros.","Eu muitas vezes percebo que estou t\u00e3o envolvido nas minhas pr\u00f3prias prioridades que n\u00e3o tenho tempo para dar para os amigos ou fam\u00edlia.","As pessoas frequentemente me dizem que controlo demais a forma como as coisas s\u00e3o feitas.","Eu fico muito irritado quando as pessoas n\u00e3o fazem aquilo que pe\u00e7o a elas.","Eu n\u00e3o consigo tolerar outras pessoas me dizendo o que fazer.","Eu tenho uma enorme dificuldade para parar de beber, fumar, comer ou outros comportamentos problem\u00e1ticos.","Parece que eu n\u00e3o consigo me disciplinar para concluir a maioria das tarefas rotineiras ou entediantes.","Eu frequentemente me permito agir conforme meus impulsos e expressar emo\u00e7\u00f5es que me causam problemas ou machucam outras pessoas.","Se eu n\u00e3o consigo atingir um objetivo, me frustro facilmente e desisto.","Eu tenho muita dificuldade em sacrificar gratifica\u00e7\u00f5es imediatas para atingir um objetivo de longo prazo.","Quando eu come\u00e7o a sentir raiva, com frequ\u00eancia simplesmente n\u00e3o consigo control\u00e1-la.","Eu tenho a tend\u00eancia de fazer coisas em excesso, mesmo sabendo que isso me faz mal.","Eu me entedio muito facilmente.","Quando as tarefas ficam dif\u00edceis, eu geralmente n\u00e3o consigo persistir e finaliz\u00e1-las.","Eu n\u00e3o consigo me concentrar em nada por muito tempo.","Eu n\u00e3o consigo me for\u00e7ar para fazer coisas de que eu n\u00e3o goste, mesmo quando sei que \u00e9 para o meu pr\u00f3prio bem.","Eu perco a cabe\u00e7a diante de qualquer ofensa.","Eu raramente consigo seguir com minhas resolu\u00e7\u00f5es ou projetos pessoais/profissionais.","Eu raramente consigo me segurar e n\u00e3o mostrar para as pessoas como realmente me sinto, n\u00e3o importa o quanto isso me custe.","Eu frequentemente fa\u00e7o coisas impulsivamente, e das quais me arrependerei mais tarde.","Para mim, \u00e9 importante que quase todas as pessoas que eu conhe\u00e7o gostem de mim.","Eu me modifico dependendo das pessoas que est\u00e3o comigo; assim, eles gostar\u00e3o mais de mim.","Eu me esfor\u00e7o muito para me encaixar.","Minha autoestima \u00e9 baseada principalmente na forma como as outras pessoas me veem.","Ter dinheiro e conhecer pessoas importantes me faz sentir uma pessoa que tem valor.","Eu gasto muito tempo com a minha apar\u00eancia f\u00edsica; assim, as pessoas me valorizar\u00e3o.","Minhas realiza\u00e7\u00f5es t\u00eam mais valor para mim se os outros reparam nelas.","Eu estou t\u00e3o focado em me encaixar que, \u00e0s vezes, n\u00e3o sei quem eu sou.","Eu acho dif\u00edcil estabelecer meus pr\u00f3prios objetivos sem levar em conta como os outros reagir\u00e3o \u00e0s minhas escolhas.","Quando eu olho para as minhas decis\u00f5es de vida, vejo que tomei a maioria delas pensando na aprova\u00e7\u00e3o das outras pessoas.","Mesmo que eu n\u00e3o goste de uma pessoa, ainda assim quero que ela goste de mim.","Se eu n\u00e3o receber muita aten\u00e7\u00e3o dos outros, me sinto menos importante.","Quando eu fa\u00e7o coment\u00e1rios em uma reuni\u00e3o, ou sou apresentado a algu\u00e9m em uma situa\u00e7\u00e3o social, para mim \u00e9 importante receber reconhecimento e admira\u00e7\u00e3o.","Receber muitos elogios dos outros me faz sentir uma pessoa de valor.","Mesmo quando as coisas parecem estar indo bem, eu sinto que \u00e9 apenas uma quest\u00e3o de tempo para que elas comecem a dar errado.","Se algo de bom acontece, fico preocupado e pensando que algo ruim provavelmente vai acontecer depois.","Cuidado nunca \u00e9 demais; quase sempre algo vai dar errado.","Independentemente de quanto eu trabalhe, me preocup com a ideia de ter problemas financeiros s\u00e9rios e perder quase tudo que tenho.","Eu me preocupo que uma decis\u00e3o errada possa causar um desastre.","Eu frequentemente fico obcecado com decis\u00f5es pequenas, pois as consequ\u00eancias de cometer um erro parecem muito s\u00e9rias.","Eu me sinto melhor imaginando que as coisas n\u00e3o dar\u00e3o certo para mim; dessa forma, n\u00e3o fico decepcionado se elas derem errado.","Eu me concentro mais nos aspectos negativos da vida e das situa\u00e7\u00f5es do que nos positivos.","Eu tenho tend\u00eancia a ser pessimista.","As pessoas pr\u00f3ximas a mim consideram que eu me preocupo demais.","Se as pessoas ficam muito entusiasmadas com alguma coisa, eu me sinto desconfort\u00e1vel e sinto que devo avis\u00e1-las sobre o que pode dar errado.","Se eu cometer um erro, mere\u00e7o ser punido.","Caso eu n\u00e3o me esforce ao m\u00e1ximo, tenho que me dar mal mesmo.","N\u00e3o h\u00e1 desculpas se eu cometer um erro.","As pessoas que n\u00e3o fazem a parte delas devem ser punidas de alguma forma.","Na maior parte do tempo, n\u00e3o aceito as desculpas que os outros d\u00e3o. Eles simplesmente n\u00e3o est\u00e3o dispostos a aceitar as responsabilidades e sofrer as consequ\u00eancias.","Se eu n\u00e3o fizer a minha parte, devo sofrer as consequ\u00eancias.","Eu frequentemente penso nos erros que cometi e fico com raiva de mim mesmo.","Quando as pessoas fazem algo ruim, eu tenho dificuldade de perdoar e esquecer.","Eu guardo m\u00e1goas, mesmo depois de a pessoa ter se desculpado.","Eu fico chateado quando acho que algu\u00e9m \u201cse livrou\u201d de alguma coisa muito facilmente.","Eu fico bravo quando as pessoas inventam desculpas ou culpam os outros por seus problemas.","N\u00e3o importa porque eu cometi um erro; quando fa\u00e7o algo errado, devo sofrer as consequ\u00eancias.","Eu me puno bastante por coisas que estraguei.","Sou uma pessoa m\u00e1 e que merece ser punida."];
var COR = '#3949ab';
var DOMINIOS = [
    {nome: 'Desconex\u00e3o e Rejei\u00e7\u00e3o', desc: 'Expectativa de que as necessidades de seguran\u00e7a, afeto, aceita\u00e7\u00e3o e pertencimento n\u00e3o ser\u00e3o atendidas de forma previs\u00edvel.', esq: [1, 2, 3, 4, 5]},
    {nome: 'Autonomia e Desempenho Prejudicados', desc: 'Expectativas sobre si e sobre o mundo que atrapalham a capacidade de se separar, sobreviver e ter um bom desempenho de forma independente.', esq: [6, 7, 8, 9]},
    {nome: 'Limites Prejudicados', desc: 'Dificuldade com limites internos, com a responsabilidade pelos outros e com metas de longo prazo.', esq: [14, 15]},
    {nome: 'Direcionamento para o Outro', desc: 'Foco excessivo nos desejos, sentimentos e rea\u00e7\u00f5es dos outros, em preju\u00edzo das pr\u00f3prias necessidades, para obter aprova\u00e7\u00e3o, manter v\u00ednculos ou evitar retalia\u00e7\u00e3o.', esq: [10, 11, 16]},
    {nome: 'Supervigil\u00e2ncia e Inibi\u00e7\u00e3o', desc: '\u00canfase exagerada em controlar sentimentos e impulsos ou em cumprir regras e expectativas r\u00edgidas, \u00e0s custas da espontaneidade, do prazer e da sa\u00fade.', esq: [17, 12, 13, 18]}
];
var ESQ = [
    {n: 1, nome: 'Priva\u00e7\u00e3o Emocional', cur: 'Priva\u00e7\u00e3o Emocional', desc: 'Sentir que o apoio, o afeto e a compreens\u00e3o de que precisa n\u00e3o ser\u00e3o oferecidos pelos outros.'},
    {n: 2, nome: 'Abandono', cur: 'Abandono', desc: 'Sentir que as pessoas importantes v\u00e3o deixar de estar presentes ou ser\u00e3o inst\u00e1veis.'},
    {n: 3, nome: 'Desconfian\u00e7a/Abuso', cur: 'Desconfian\u00e7a/Abuso', desc: 'Esperar que os outros v\u00e3o machucar, enganar, manipular ou tirar vantagem.'},
    {n: 4, nome: 'Isolamento Social/Aliena\u00e7\u00e3o', cur: 'Isolamento Social', desc: 'Sentir-se diferente, de fora e desconectado das outras pessoas e dos grupos.'},
    {n: 5, nome: 'Defectividade/Vergonha', cur: 'Defectividade', desc: 'Sentir-se falho, indesej\u00e1vel ou sem valor, e que n\u00e3o seria amado se os outros o conhecessem de verdade.'},
    {n: 6, nome: 'Fracasso', cur: 'Fracasso', desc: 'Acreditar que fracassou, vai fracassar ou \u00e9 menos capaz que os outros nas realiza\u00e7\u00f5es.'},
    {n: 7, nome: 'Depend\u00eancia/Incompet\u00eancia', cur: 'Depend\u00eancia', desc: 'Acreditar que n\u00e3o consegue lidar com as responsabilidades do dia a dia sem a ajuda dos outros.'},
    {n: 8, nome: 'Vulnerabilidade ao dano e doen\u00e7a', cur: 'Vulnerabilidade', desc: 'Medo exagerado de que uma cat\u00e1strofe (de sa\u00fade, financeira, criminal ou natural) possa acontecer a qualquer momento.'},
    {n: 9, nome: 'Emaranhamento', cur: 'Emaranhamento', desc: 'Envolvimento emocional excessivo com pessoas pr\u00f3ximas (em geral os pais), com pouca identidade pr\u00f3pria separada.'},
    {n: 10, nome: 'Subjuga\u00e7\u00e3o', cur: 'Subjuga\u00e7\u00e3o', desc: 'Ceder o controle aos outros por medo de raiva, rejei\u00e7\u00e3o ou retalia\u00e7\u00e3o.'},
    {n: 11, nome: 'Autossacrif\u00edcio', cur: 'Autossacrif\u00edcio', desc: 'Atender voluntariamente \u00e0s necessidades dos outros em preju\u00edzo das pr\u00f3prias.'},
    {n: 12, nome: 'Inibi\u00e7\u00e3o Emocional', cur: 'Inibi\u00e7\u00e3o Emocional', desc: 'Conter emo\u00e7\u00f5es e espontaneidade por medo de desaprova\u00e7\u00e3o, vergonha ou perda de controle.'},
    {n: 13, nome: 'Padr\u00f5es Inflex\u00edveis', cur: 'Padr\u00f5es Inflex\u00edveis', desc: 'Acreditar que \u00e9 preciso atingir padr\u00f5es muito elevados, com press\u00e3o constante e autocr\u00edtica.'},
    {n: 14, nome: 'Arrogo/Grandiosidade', cur: 'Arrogo', desc: 'Sentir-se superior, merecedor de privil\u00e9gios e com dificuldade de aceitar limites.'},
    {n: 15, nome: 'Autocontrole/Autodisciplina Insuficientes', cur: 'Autodisciplina Insuficiente', desc: 'Dificuldade de tolerar frustra\u00e7\u00e3o e de se controlar ou persistir para alcan\u00e7ar metas.'},
    {n: 16, nome: 'Busca de Aprova\u00e7\u00e3o/Reconhecimento', cur: 'Busca de Aprova\u00e7\u00e3o', desc: 'Dar import\u00e2ncia excessiva \u00e0 aprova\u00e7\u00e3o, \u00e0 aten\u00e7\u00e3o e ao status para se sentir valioso.'},
    {n: 17, nome: 'Negatividade/Pessimismo', cur: 'Negatividade', desc: 'Foco persistente no lado negativo da vida e expectativa de que algo ruim vai acontecer.'},
    {n: 18, nome: 'Postura Punitiva', cur: 'Postura Punitiva', desc: 'Acreditar que as pessoas, incluindo a pr\u00f3pria, merecem ser duramente punidas pelos erros.'}
];
var FAIXAS = [[1, 9], [10, 26], [27, 43], [44, 53], [54, 68], [69, 77], [78, 92], [93, 104], [105, 115], [116, 125], [126, 142], [143, 151], [152, 167], [168, 178], [179, 193], [194, 207], [208, 218], [219, 232]];
var REFS = [
    'YOUNG, J. E. Question\u00e1rio de Esquemas de Young - vers\u00e3o longa (YSQ-L3). Tradu\u00e7\u00e3o e adapta\u00e7\u00e3o oficial para uso no Brasil: Margareth da Silva Oliveira, Lauren Heineck de Souza e Elisa Steinhorst Damasceno. \u00a9 2014 Jeffrey Young, Ph.D. Autoriza\u00e7\u00e3o exclusiva do Schema Therapy Institute.',
    'YOUNG, J. E.; KLOSKO, J. S.; WEISHAAR, M. E. Terapia do esquema: guia de t\u00e9cnicas cognitivo-comportamentais inovadoras. Porto Alegre: Artmed, 2008.'
];
var AVISO = 'O YSQ-L3 descreve o quanto a pessoa se identifica com 18 esquemas iniciais desadaptativos (padr\u00f5es amplos e duradouros de pensamentos, emo\u00e7\u00f5es, sensa\u00e7\u00f5es e mem\u00f3rias sobre si e sobre os outros, formados desde cedo). N\u00e3o \u00e9 diagn\u00f3stico de transtorno. Segundo a folha oficial de corre\u00e7\u00e3o, o total de cada esquema soma apenas os itens respondidos com 4, 5 ou 6; a folha tem a coluna "o qu\u00e3o alta foi sua pontua\u00e7\u00e3o?", mas n\u00e3o traz pontos de corte. Por isso o relat\u00f3rio mostra a posi\u00e7\u00e3o de cada esquema (propor\u00e7\u00e3o do m\u00e1ximo poss\u00edvel) no espectro, do verde (pouca identifica\u00e7\u00e3o) ao vermelho (muita identifica\u00e7\u00e3o), e n\u00e3o classifica em baixo, m\u00e9dio ou alto. A mesma pontua\u00e7\u00e3o pode ter significados diferentes conforme a hist\u00f3ria e o momento de vida. Nenhum instrumento isolado descreve a pessoa por inteiro: o resultado deve ser interpretado por profissional qualificado, junto com a entrevista e outras fontes. O texto do question\u00e1rio \u00e9 de uso autorizado e protegido por direitos autorais (Jeffrey Young; Schema Therapy Institute).';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function fp(n) { return String(Math.round(n)) + '%'; }
function calcular(resp) {
    if (!resp) throw new Error('YSQ-L3: respostas incompletas');
    var r = {v: {}, e: [], soma: 0, tot: 0, tmax: 0}, i;
    for (i = 1; i <= 232; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 6)) throw new Error('YSQ-L3: resposta invalida no item ' + i);
        r.v[i] = x; r.soma += x;
    }
    ESQ.forEach(function (e, ix) {
        var a = FAIXAS[ix][0], z = FAIXAS[ix][1], n = z - a + 1, c = {4: 0, 5: 0, 6: 0}, s = 0, ssoma = 0, j, itens = [];
        for (j = a; j <= z; j++) { itens.push(j); ssoma += r.v[j]; if (r.v[j] >= 4) { c[r.v[j]]++; s += r.v[j]; } }
        r.e.push({n: e.n, itens: itens, nItens: n, c4: c[4], c5: c[5], c6: c[6], total: s, max: 6 * n, pct: s / (6 * n) * 100, media: ssoma / n, alt: c[5] + c[6]});
        r.tot += s; r.tmax += 6 * n;
    });
    r.media = r.soma / 232; r.pct = r.tot / r.tmax * 100;
    return r;
}
function escore(r) { return r.tot; }
function classifGeral(r) { return 'Total oficial ' + r.tot + ' de ' + r.tmax + ' (' + fp(r.pct) + '); m\u00e9dia das respostas ' + fmt(r.media) + '; sem pontos de corte oficiais'; }
function dadosPainel(r) {
    var o = {};
    ESQ.forEach(function (e, i) { var s = r.e[i]; o[e.cur] = {pontuacao: s.total, max: s.max, media: Math.round(s.media * 100) / 100, classificacao: fp(s.pct) + ' do m\u00e1ximo (4:' + s.c4 + ' 5:' + s.c5 + ' 6:' + s.c6 + ')'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= 232; i++) o[i] = r.v[i]; return o; }
function nomeEsq(n) { return ESQ[n - 1].nome; }
function blocks(r) {
    var b = [], ordem = r.e.slice().sort(function (a, c) { return c.pct - a.pct || a.n - c.n; }), top = ordem[0], alt = 0, i;
    for (i = 1; i <= 232; i++) if (r.v[i] >= 5) alt++;
    b.push({t: 'hero', fundo: '#e8eaf6', borda: COR, cor: '#1a237e', titulo: 'Total oficial: ' + r.tot + ' de ' + r.tmax + ' pontos (' + fp(r.pct) + ' do m\u00e1ximo)', sub: 'Pontua\u00e7\u00e3o segundo a folha oficial de corre\u00e7\u00e3o do YSQ-L3. Cada esquema tem uma r\u00e9gua do verde (pouca identifica\u00e7\u00e3o) ao vermelho (muita identifica\u00e7\u00e3o). N\u00e3o h\u00e1 pontos de corte oficiais: o relat\u00f3rio mostra a posi\u00e7\u00e3o, sem classificar.'});
    b.push({t: 'cards', itens: [
        {rot: 'TOTAL OFICIAL', valor: String(r.tot), de: 'de ' + r.tmax, cor: COR},
        {rot: 'M\u00c9DIA DAS RESPOSTAS', valor: fmt(r.media), de: 'de 1 a 6', cor: '#1a237e'},
        {rot: 'ITENS 5 OU 6', valor: String(alt), de: 'de 232 itens', cor: '#ef6c00'},
        {rot: 'MAIOR POSI\u00c7\u00c3O', valor: fp(top.pct), de: ESQ[top.n - 1].cur, cor: '#c62828'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este relat\u00f3rio', itens: [
        {t: 'O que o YSQ-L3 mostra', x: 'Quanto a pessoa se reconhece em 232 afirma\u00e7\u00f5es sobre si mesma e sobre as rela\u00e7\u00f5es, ao longo do \u00faltimo ano. As afirma\u00e7\u00f5es se organizam em 18 esquemas, de 9 a 17 afirma\u00e7\u00f5es cada. Os esquemas s\u00e3o padr\u00f5es de pensamento, emo\u00e7\u00e3o e comportamento que costumam se formar cedo, a partir de necessidades emocionais que n\u00e3o foram bem atendidas, e que podem seguir influenciando a vida adulta.'},
        {t: 'Como a pontua\u00e7\u00e3o oficial \u00e9 feita', x: 'Cada resposta vai de 1 ("completamente falso sobre mim") a 6 ("me descreve perfeitamente"). Para cada esquema, a folha oficial pede para contar quantas afirma\u00e7\u00f5es receberam 4, 5 e 6 e somar esses valores; as respostas 1, 2 e 3 n\u00e3o entram na soma. O m\u00e1ximo poss\u00edvel \u00e9 6 vezes o n\u00famero de afirma\u00e7\u00f5es do esquema.'},
        {t: 'Como ler a r\u00e9gua de cores', x: 'A r\u00e9gua segue as cores do espectro vis\u00edvel, come\u00e7ando no verde: verde = a pessoa se identifica pouco com aquele esquema; amarelo e laranja = identifica\u00e7\u00e3o intermedi\u00e1ria; vermelho = identifica\u00e7\u00e3o muito grande. O ponteiro marca a propor\u00e7\u00e3o do m\u00e1ximo poss\u00edvel do esquema (0% a 100%).'},
        {t: 'O que este relat\u00f3rio n\u00e3o diz', x: 'A folha oficial n\u00e3o traz pontos de corte; por isso n\u00e3o dizemos que um esquema \u00e9 "baixo", "m\u00e9dio" ou "alto", nem que existe um transtorno. Veja tamb\u00e9m as afirma\u00e7\u00f5es marcadas com 5 ou 6, que ajudam a entender o que est\u00e1 por tr\u00e1s da pontua\u00e7\u00e3o.'}
    ]});
    var its = [];
    DOMINIOS.forEach(function (d) {
        its.push({grupo: d.nome, grupoDesc: d.desc});
        d.esq.forEach(function (n) {
            var e = r.e[n - 1], q = ESQ[n - 1];
            its.push({rot: q.nome, sub: q.desc, txt: e.total + ' de ' + e.max + ' (' + fp(e.pct) + ')  |  itens 4/5/6: ' + e.c4 + '/' + e.c5 + '/' + e.c6, pct: e.pct, ticks: [0, 25, 50, 75, 100].map(function (v) { return {pct: v, rot: v + '%'}; })});
        });
    });
    b.push({t: 'regua', titulo: 'Mapa dos 18 esquemas', legenda: 'R\u00e9gua de 0% a 100% do m\u00e1ximo poss\u00edvel de cada esquema (total oficial: soma das respostas 4, 5 e 6). Verde = pouca identifica\u00e7\u00e3o; vermelho = muita identifica\u00e7\u00e3o.', itens: its});
    b.push({t: 'tabela', titulo: 'Esquemas em ordem de pontua\u00e7\u00e3o (do maior para o menor)', minAltura: 60, cols: [{h: '#', w: 7, al: 'c'}, {h: 'Esquema', w: 62, al: 'l'}, {h: 'Itens', w: 14, al: 'c'}, {h: '4 / 5 / 6', w: 24, al: 'c'}, {h: 'Total (m\u00e1x.)', w: 29, al: 'c'}, {h: '% do m\u00e1x.', w: 22, al: 'c'}, {h: 'M\u00e9dia', w: 22, al: 'c'}], linhas: ordem.map(function (e, ix) { return {c: [String(ix + 1), nomeEsq(e.n), String(e.nItens), e.c4 + ' / ' + e.c5 + ' / ' + e.c6, e.total + ' (' + e.max + ')', fp(e.pct), fmt(e.media)]}; })});
    var linhasAlt = [];
    ESQ.forEach(function (q, ix) { r.e[ix].itens.forEach(function (n) { if (r.v[n] >= 5) linhasAlt.push({c: [q.cur, String(n), ITENS[n - 1], String(r.v[n])]}); }); });
    if (linhasAlt.length) b.push({t: 'tabela', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa (respostas 5 ou 6)', minAltura: 50, cols: [{h: 'Esquema', w: 34, al: 'l'}, {h: '#', w: 9, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 121, al: 'l'}, {h: 'Resp.', w: 16, al: 'c'}], linhas: linhasAlt});
    else b.push({t: 'textos', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa', itens: [{t: 'Respostas 5 ou 6', x: 'Nenhuma afirma\u00e7\u00e3o foi marcada com 5 ou 6.'}]});
    b.push({t: 'textos', titulo: 'S\u00edntese dos resultados', itens: [{t: 'Em resumo', x: sintese(r).map(function (p) { return p.x; }).join(' ')}]});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try { if (d.versaoEscala !== 2) return null; return calcular(d.respostas); } catch (e) { return null; }
}
var base = symMake({
    ponteiro: true,
    id: 'ysql3', nome: 'YSQ-L3', cor: COR, cor2: '#1a237e', escalaPainel: ['YSQ-L3'],
    sub1: 'Question\u00e1rio de Esquemas de Young - Vers\u00e3o Longa (YSQ-L3) - 232 itens, 18 esquemas',
    sub2: 'Jeffrey Young | vers\u00e3o oficial para uso no Brasil: Oliveira, Souza e Damasceno',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_YSQL3 = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, ESQ: ESQ, DOMINIOS: DOMINIOS, FAIXAS: FAIXAS, sintese: sintese};
var IMP = {
    1: 'espera que o apoio, o afeto e a compreens\u00e3o de que precisa n\u00e3o venham dos outros, o que pode lev\u00e1-la a pedir pouco, a se frustrar em sil\u00eancio ou a sentir que suas necessidades n\u00e3o t\u00eam lugar nas rela\u00e7\u00f5es',
    2: 'teme que as pessoas importantes se afastem ou n\u00e3o permane\u00e7am, o que pode gerar inseguran\u00e7a, apego intenso, ci\u00fame ou a antecipa\u00e7\u00e3o de perdas nos v\u00ednculos',
    3: 'espera ser machucada, enganada ou usada pelos outros, o que pode lev\u00e1-la a manter-se em guarda, a duvidar das inten\u00e7\u00f5es alheias e a ter dificuldade de se abrir',
    4: 'se sente diferente e de fora dos grupos, o que pode favorecer o afastamento, a sensa\u00e7\u00e3o de n\u00e3o pertencer e a dificuldade de se aproximar das pessoas',
    5: 'se v\u00ea como falha, pouco digna de amor ou aqu\u00e9m dos outros, o que pode alimentar autocr\u00edtica, vergonha e o receio de ser rejeitada se for conhecida de verdade',
    6: 'acredita ser menos capaz que os outros ou destinada a falhar, o que pode minar a confian\u00e7a nas pr\u00f3prias realiza\u00e7\u00f5es e levar a evitar desafios ou a subestimar o que conquista',
    7: 'duvida de conseguir lidar sozinha com as demandas do dia a dia, o que pode lev\u00e1-la a buscar apoio e orienta\u00e7\u00e3o com frequ\u00eancia e a hesitar diante de decis\u00f5es',
    8: 'vive com a sensa\u00e7\u00e3o de que algo ruim, de sa\u00fade, financeiro ou de seguran\u00e7a, pode acontecer a qualquer momento, o que pode gerar preocupa\u00e7\u00e3o intensa e comportamentos de precau\u00e7\u00e3o',
    9: 'mant\u00e9m um envolvimento emocional muito estreito com pessoas pr\u00f3ximas, o que pode tornar mais dif\u00edcil sentir-se separada delas e definir os pr\u00f3prios rumos',
    10: 'cede aos desejos dos outros por receio de conflito, rejei\u00e7\u00e3o ou retalia\u00e7\u00e3o, o que pode lev\u00e1-la a calar as pr\u00f3prias vontades e a acumular ressentimento',
    11: 'coloca as necessidades dos outros \u00e0 frente das suas, o que pode gerar sobrecarga, dificuldade de receber cuidado e pouco espa\u00e7o para si mesma',
    12: 'cont\u00e9m emo\u00e7\u00f5es e espontaneidade por receio de ser julgada ou de perder o controle, o que pode passar uma imagem de frieza ou dist\u00e2ncia mesmo quando sente muito',
    13: 'exige de si padr\u00f5es muito altos e sente press\u00e3o constante para render, o que pode trazer cansa\u00e7o, perfeccionismo e pouco espa\u00e7o para descanso e prazer',
    14: 'tende a se sentir merecedora de tratamento especial e a se incomodar com limites, o que pode gerar atritos nas rela\u00e7\u00f5es e dificuldade de considerar o ponto de vista dos outros',
    15: 'tem dificuldade de sustentar o esfor\u00e7o diante do t\u00e9dio ou da frustra\u00e7\u00e3o, o que pode atrapalhar a conclus\u00e3o de tarefas e o alcance de metas de longo prazo',
    16: 'mede o pr\u00f3prio valor pela aten\u00e7\u00e3o, pelo reconhecimento e pelo status que recebe, o que pode lev\u00e1-la a depender da opini\u00e3o alheia e a se afastar do que realmente deseja',
    17: 'tende a enxergar primeiro o lado ruim e a esperar que as coisas deem errado, o que pode gerar preocupa\u00e7\u00e3o constante e dificuldade de aproveitar o que vai bem',
    18: 'acredita que os erros merecem puni\u00e7\u00e3o severa, em si e nos outros, o que pode alimentar culpa, dureza e dificuldade de perdoar'
};
var TEMA = ['v\u00ednculos, aceita\u00e7\u00e3o e sensa\u00e7\u00e3o de pertencer', 'autonomia, seguran\u00e7a e confian\u00e7a no pr\u00f3prio desempenho', 'limites, responsabilidade e autocontrole', 'aten\u00e7\u00e3o \u00e0s necessidades e \u00e0 aprova\u00e7\u00e3o dos outros, em detrimento das pr\u00f3prias', 'controle das emo\u00e7\u00f5es, exig\u00eancia consigo mesma e vigil\u00e2ncia'];
function lista(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }
function sintese(r) {
    var e = r.e.slice().sort(function (a, c) { return c.pct - a.pct || a.n - c.n; }), g = r.media, k = r.soma % 3;
    var nome = function (x) { return ESQ[x.n - 1].nome; }, mm = function (x) { return fp(x.pct); };
    var top = e[0], empate = e.filter(function (x) { return x.pct === top.pct; }), out = [];
    // 1. tom geral
    var adj = g < 2 ? 'pequena' : g < 3 ? 'pequena' : g < 4 ? 'intermedi\u00e1ria' : 'ampla';
    out.push(['No conjunto, as respostas indicam ', 'De modo geral, as respostas sugerem ', 'Olhando o conjunto das respostas, v\u00ea-se '][k] + 'identifica\u00e7\u00e3o ' + adj + ' com os esquemas avaliados (m\u00e9dia geral ' + fmt(g) + ')' + (g >= 2 && g < 3 && top.media >= 3 ? ', com alguns pontos mais marcados' : '') + '.');
    // 2. esquemas em destaque
    var prox = ['o que pode significar que', 'o que sugere que', 'o que pode indicar que'][(k + 1) % 3];
    if (empate.length === 18) {
        out.push('Todos os esquemas tiveram a mesma pontua\u00e7\u00e3o (' + mm(top) + '), sem nenhum em destaque.');
    } else if (top.media < 3) {
        out.push(empate.length > 1
            ? 'Nenhum esquema se destacou de forma marcante; as pontua\u00e7\u00f5es mais altas (' + mm(top) + ') ficaram em ' + (empate.length > 3 ? empate.slice(0, 3).map(nome).join(', ') + ' e mais ' + (empate.length - 3) + (empate.length - 3 === 1 ? ' esquema' : ' esquemas') : lista(empate.map(nome))) + '.'
            : 'Nenhum esquema se destacou de forma marcante; o mais alto foi ' + nome(top) + ' (' + mm(top) + '), que vale apenas como ponto de partida para a conversa.');
    } else if (empate.length > 3) {
        out.push('V\u00e1rios esquemas empataram na pontua\u00e7\u00e3o mais alta (' + mm(top) + '), entre eles ' + empate.slice(0, 3).map(nome).join(', ') + ', o que dificulta apontar um \u00fanico em destaque.');
    } else {
        var tops = e.slice(0, 3).filter(function (x) { return x.media >= 3; });
        out.push((tops.length === 1 ? 'O esquema de ' : 'Os esquemas de ') + lista(tops.map(function (x) { return nome(x) + ' (' + mm(x) + ')'; })) + (tops.length === 1 ? ' apresentou a pontua\u00e7\u00e3o mais alta, ' + prox + ' ele tem maior proemin\u00eancia' : ' apresentaram as pontua\u00e7\u00f5es mais altas, ' + prox + ' t\u00eam maior proemin\u00eancia') + ' na forma como a pessoa interpreta a si mesma e as suas rela\u00e7\u00f5es.' + (tops.length > 1 && top.pct - e[1].pct >= 16 ? ' ' + nome(top) + ' se destaca nitidamente dos demais.' : ''));
        out.push('Em ' + nome(tops[0]) + ', o padr\u00e3o sugere que a pessoa ' + IMP[tops[0].n] + '.' + (tops.length > 1 ? ' J\u00e1 em ' + nome(tops[1]) + ', sugere que a pessoa ' + IMP[tops[1].n] + '.' : ''));
    }
    // 3. dominios
    var dm = DOMINIOS.map(function (d, ix) { var s = 0; d.esq.forEach(function (n) { s += r.e[n - 1].pct; }); return {nome: d.nome, m: s / d.esq.length, tema: TEMA[ix]}; }).sort(function (a, c) { return c.m - a.m; });
    var lo = dm[dm.length - 1];
    if (dm[0].m - lo.m < 0.5) out.push('Os cinco dom\u00ednios tiveram a mesma pontua\u00e7\u00e3o (' + fp(lo.m) + ').');
    else if (dm[0].m - lo.m < 10) out.push('As respostas se distribuem de forma parecida entre os dom\u00ednios, sem uma \u00e1rea claramente \u00e0 frente.');
    else out.push('Por dom\u00ednio, as respostas se concentram em "' + dm[0].nome + '" (' + fp(dm[0].m) + '), \u00e1rea ligada a ' + dm[0].tema + ', o que ' + ['pode apontar para um ponto sens\u00edvel', 'sugere um ponto sens\u00edvel', 'pode indicar uma \u00e1rea mais sens\u00edvel'][k] + ' na hist\u00f3ria e na experi\u00eancia da pessoa.');
    // 4. detalhes
    var cheios = e.filter(function (x) { return x.alt === x.nItens; }), vari = e.filter(function (x) { var vs = x.itens.map(function (n) { return r.v[n]; }); return Math.max.apply(null, vs) - Math.min.apply(null, vs) >= 4 && x.media >= 2.5; });
    if (cheios.length && cheios.length < 18) out.push('Em ' + lista(cheios.slice(0, 3).map(nome)) + ', todas as afirma\u00e7\u00f5es foram sentidas como muito verdadeiras (5 ou 6), o que refor\u00e7a a intensidade ' + (cheios.length === 1 ? 'desse esquema' : 'desses esquemas') + '.');
    if (vari.length) out.push('Em ' + lista(vari.slice(0, 2).map(nome)) + ', as respostas oscilaram bastante entre as afirma\u00e7\u00f5es, ent\u00e3o vale olhar item a item.');
    // 5. fecho
    out.push('Essas leituras s\u00e3o hip\u00f3teses para a conversa cl\u00ednica, e n\u00e3o conclus\u00f5es: dependem da hist\u00f3ria de vida e do contexto. Texto montado por regras fixas, sem intelig\u00eancia artificial.');
    return out.map(function (x, i) { return {t: 'p' + i, x: x}; });
}


})();
