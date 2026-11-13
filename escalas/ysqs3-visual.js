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

// ysqs3-visual.js - YSQ-S3 (Young Schema Questionnaire - Short Form 3), versao oficial brasileira. 90 itens, 1-6, 18 esquemas x 5 itens.
// CHAVE OFICIAL (folha de correcao): esquema k (1..18) = itens k, k+18, k+36, k+54, k+72 (INTERCALADOS). Total e media por esquema; total e media geral.
// A folha oficial NAO traz pontos de corte: a regua mostra a posicao da media (1 a 6) no espectro verde -> vermelho (pouca -> muita identificacao).
// O site antigo usava blocos seguidos (1-5, 6-10...) e niveis Baixa/Media/Alta (40%/70%) sem fonte.
// d.respostas: chaves 1..90 com 1-6. versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS = ["Eu n\u00e3o tive ningu\u00e9m para me dar afeto, cuidado e prote\u00e7\u00e3o, que partilhasse sua vida comigo, ou que se importasse de verdade com as coisas que me acontecem.","Eu percebo que me agarro \u00e0s pessoas que s\u00e3o pr\u00f3ximas de mim com medo de que elas me abandonem.","Eu sinto que as pessoas v\u00e3o tirar vantagem de mim.","Eu n\u00e3o me encaixo.","Nenhum homem/mulher que eu deseje seria capaz de me amar depois de ver meus defeitos ou falhas.","Quase nada do que eu fa\u00e7o no trabalho (ou nos estudos) \u00e9 t\u00e3o bom quanto o que os outros s\u00e3o capazes de fazer.","Eu n\u00e3o me sinto capaz de me virar sem a ajuda dos outros no dia a dia.","Parece que eu n\u00e3o consigo parar de sentir que algo ruim est\u00e1 prestes a acontecer.","Eu ainda n\u00e3o consegui me separar dos meus pais (ambos ou um deles) do jeito que as outras pessoas da minha idade parecem ter se separado.","Eu sinto que, se eu fizer o que quero, os outros n\u00e3o me apoiar\u00e3o e poder\u00e3o ficar bravos ou chateados comigo.","Geralmente sou eu quem acaba cuidando das pessoas que s\u00e3o pr\u00f3ximas de mim.","Eu sou envergonhado demais para demonstrar sentimentos positivos para os outros (por ex.: afeto; demonstrar que me importo com eles).","Eu tenho que ser o melhor na maioria das coisas que eu fa\u00e7o; n\u00e3o consigo aceitar o segundo lugar.","Eu tenho muita dificuldade de aceitar um \u201cn\u00e3o\u201d quando quero algo dos outros.","Parece que eu n\u00e3o consigo me disciplinar para concluir a maioria das tarefas rotineiras ou entediantes.","Ter dinheiro e conhecer pessoas importantes faz com que eu me sinta uma pessoa com valor.","Mesmo quando as coisas parecem estar indo bem, eu sinto que \u00e9 apenas quest\u00e3o de tempo para que elas comecem a dar errado.","Se eu cometer algum erro, mere\u00e7o ser punido.","Eu n\u00e3o tenho quem me d\u00ea carinho, apoio e afeto.","Eu preciso tanto das pessoas que fico muito preocupado com a possibilidade de perd\u00ea-las.","Eu sinto que n\u00e3o posso baixar a guarda na presen\u00e7a de outras pessoas, sen\u00e3o elas ir\u00e3o me machucar de prop\u00f3sito.","Eu sou fundamentalmente diferente das outras pessoas.","Ningu\u00e9m que eu deseje iria querer ficar perto de mim se conhecesse quem eu sou de verdade.","Eu sou incompetente quando se refere a realiza\u00e7\u00f5es pessoais/profissionais.","Eu me vejo como uma pessoa dependente dos outros no que se refere ao meu funcionamento di\u00e1rio.","Eu sinto que uma trag\u00e9dia (natural, financeira, criminal ou de sa\u00fade) pode acontecer a qualquer momento.","Eu e meu pai/m\u00e3e temos a tend\u00eancia de nos envolver demais nos problemas e na vida uns dos outros.","Eu sinto como se eu n\u00e3o tivesse outra op\u00e7\u00e3o a n\u00e3o ser ceder aos desejos dos outros, sen\u00e3o eles ir\u00e3o ficar bravos, me rejeitar ou retaliar de alguma forma.","Sou uma boa pessoa por pensar mais nos outros do que em mim.","Eu acho constrangedor demonstrar o que eu sinto para as outras pessoas.","Eu tento fazer o meu melhor; eu n\u00e3o consigo me conformar em ser \u201cbom o suficiente\u201d.","Eu sou diferenciado e n\u00e3o deveria ter que aceitar muitas das restri\u00e7\u00f5es ou limita\u00e7\u00f5es impostas \u00e0s outras pessoas.","Se n\u00e3o consigo atingir um objetivo, eu logo me frustro e desisto.","Minhas conquistas t\u00eam mais valor para mim se forem notadas pelas outras pessoas.","Se algo de bom acontece, fico preocupado e pensando que algo ruim provavelmente vai acontecer depois.","Se eu n\u00e3o der o meu melhor, eu tenho que me dar mal mesmo.","Eu nunca me senti especial para ningu\u00e9m.","Eu me preocupo muito com a possibilidade de que pessoas pr\u00f3ximas a mim me deixem ou me abandonem.","\u00c9 s\u00f3 uma quest\u00e3o de tempo at\u00e9 algu\u00e9m me trair.","Eu n\u00e3o fa\u00e7o parte: sou uma pessoa solit\u00e1ria.","Eu n\u00e3o sou digno de receber amor, aten\u00e7\u00e3o e o respeito dos outros.","A maioria das pessoas \u00e9 mais capaz do que eu no trabalho e nas realiza\u00e7\u00f5es pessoais.","Me falta bom senso.","Eu me preocupo muito em ser agredido fisicamente por algu\u00e9m.","Eu e meu pai/m\u00e3e temos dificuldades de deixar de contar detalhes \u00edntimos uns para os outros sem nos sentirmos culpados.","Nos relacionamentos, eu geralmente deixo que a outra pessoa tome as decis\u00f5es e esteja no controle.","Eu passo tanto tempo fazendo coisas para as pessoas com quem me importo que acabo tendo pouco tempo para mim mesmo.","Eu acho dif\u00edcil me sentir livre e ser espont\u00e2neo perto de outras pessoas.","Eu tenho que dar conta de todas as minhas responsabilidades.","Eu detesto me sentir obrigado a fazer algo ou que me impe\u00e7am de fazer aquilo que eu quero.","Para mim, \u00e9 muito dif\u00edcil abrir m\u00e3o de prazeres imediatos para atingir objetivos de longo prazo.","Se as pessoas n\u00e3o me d\u00e3o muita aten\u00e7\u00e3o, eu me sinto menos importante.","Todo cuidado \u00e9 pouco, quase sempre algo vai dar errado.","Se eu n\u00e3o fizer minhas tarefas de forma correta, devo sofrer as consequ\u00eancias.","Eu n\u00e3o tive ningu\u00e9m que realmente me escutasse, compreendesse, ou estivesse conectado com as minhas verdadeiras necessidades e sentimentos.","Quando algu\u00e9m importante para mim parece estar se fechando ou se afastando, eu fico desesperado.","Eu desconfio bastante das inten\u00e7\u00f5es das outras pessoas.","Eu me sinto isolado ou desconectado dos outros.","Eu sinto que sou algu\u00e9m que n\u00e3o pode ser amado.","Eu n\u00e3o sou t\u00e3o talentoso no trabalho quanto a maioria das pessoas.","N\u00e3o se pode contar com meu julgamento em situa\u00e7\u00f5es do dia a dia.","Eu tenho medo de perder todo o meu dinheiro, de passar necessidades ou ficar muito pobre.","Eu frequentemente sinto como se meus pais vivessem a minha vida ou vivessem atrav\u00e9s de mim \u2013 \u00e9 como se eu n\u00e3o tivesse uma vida pr\u00f3pria.","Eu sempre deixei as outras pessoas escolherem por mim, ent\u00e3o nem sei o que eu quero para mim mesmo.","Eu sempre fui aquele que escuta os problemas de todo mundo.","Eu me controlo tanto que muitas pessoas acham que eu n\u00e3o tenho emo\u00e7\u00f5es ou sou insens\u00edvel.","Sinto que h\u00e1 uma press\u00e3o constante para que eu conquiste e termine as coisas.","Eu sinto que n\u00e3o deveria ter que seguir as regras e normas que as outras pessoas t\u00eam que seguir.","Eu n\u00e3o consigo me for\u00e7ar a fazer coisas que eu n\u00e3o goste, mesmo quando sei que \u00e9 para o meu pr\u00f3prio bem.","Quando eu fa\u00e7o coment\u00e1rios em uma reuni\u00e3o, ou sou apresentado a algu\u00e9m em uma situa\u00e7\u00e3o social, para mim \u00e9 importante receber reconhecimento e admira\u00e7\u00e3o.","Independentemente de quanto eu trabalhe, preocupo-me com a ideia de ter problemas financeiros s\u00e9rios e perder quase tudo que tenho.","N\u00e3o importa os motivos que me levaram a cometer um erro. Quando fa\u00e7o algo errado, devo sofrer as consequ\u00eancias.","Eu n\u00e3o tenho tido uma pessoa forte ou s\u00e1bia para me dar conselhos \u00fateis ou orienta\u00e7\u00e3o quando n\u00e3o tenho certeza do que fazer.","\u00c0s vezes eu me preocupo tanto que as pessoas possam me abandonar que as afasto de mim.","Eu geralmente estou atento aos motivos ocultos e \u00e0s segundas inten\u00e7\u00f5es das outras pessoas.","Eu sempre me sinto deslocado ou de fora dos grupos.","Sou inaceit\u00e1vel demais para mostrar para as pessoas como eu sou ou deixar que elas me conhe\u00e7am bem.","N\u00e3o sou t\u00e3o inteligente no trabalho (ou estudos) quanto a maioria das pessoas.","N\u00e3o tenho confian\u00e7a na minha habilidade de resolver os problemas que surgem no dia a dia.","Eu me preocupo com a possibilidade de desenvolver uma doen\u00e7a grave, mesmo que nada s\u00e9rio tenha sido diagnosticado por um m\u00e9dico.","Eu muitas vezes sinto que n\u00e3o tenho uma identidade separada da do meu pai/m\u00e3e ou companheiro(a).","Para mim, \u00e9 muito dif\u00edcil exigir que meus direitos sejam respeitados e que meus sentimentos sejam levados em considera\u00e7\u00e3o.","As pessoas consideram que fa\u00e7o demais pelos outros e n\u00e3o fa\u00e7o o suficiente por mim mesmo.","As pessoas me veem como algu\u00e9m mais fechado emocionalmente.","Eu n\u00e3o posso \u201cpegar leve\u201d comigo mesmo ou ficar arranjando desculpas pelos meus erros.","Eu sinto que o que tenho a oferecer tem muito mais valor quando comparado ao que os outros t\u00eam para dar.","Eu raramente consigo seguir com minhas resolu\u00e7\u00f5es ou projetos pessoais/profissionais.","Receber muitos elogios dos outros faz com que eu me sinta uma pessoa de valor.","Eu me preocupo que uma decis\u00e3o errada possa causar um desastre.","Sou uma pessoa m\u00e1 e que merece ser punida."];

var COR = '#00897b';
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
var ROT = ['Completamente falso sobre mim', 'Em grande parte falso sobre mim', 'Um pouco mais verdadeiro do que falso sobre mim', 'Moderadamente verdadeiro sobre mim', 'Em grande parte verdadeiro sobre mim', 'Me descreve perfeitamente'];
var REFS = [
    'SOUZA, L. H. de; DAMASCENO, E. S.; FERRONATTO, F.; OLIVEIRA, M. da S. Adapta\u00e7\u00e3o brasileira do Question\u00e1rio de Esquemas de Young - vers\u00e3o breve (YSQ-S3). Avalia\u00e7\u00e3o Psicol\u00f3gica, v. 19, n. 4, 2020. DOI: 10.15689/ap.2020.1904.17377.11.',
    'YOUNG, J. E.; KLOSKO, J. S.; WEISHAAR, M. E. Terapia do esquema: guia de t\u00e9cnicas cognitivo-comportamentais inovadoras. Porto Alegre: Artmed, 2008.',
    'YOUNG, J. E. Question\u00e1rio de Esquemas de Young - vers\u00e3o breve (YSQ-S3). Tradu\u00e7\u00e3o e adapta\u00e7\u00e3o oficial para uso no Brasil: Lauren Heineck de Souza, Elisa Steinhorst Damasceno e Margareth da Silva Oliveira. \u00a9 2014 Jeffrey Young, Ph.D. Autoriza\u00e7\u00e3o exclusiva do Schema Therapy Institute.'
];
var AVISO = 'O YSQ-S3 descreve o quanto a pessoa se identifica com 18 esquemas iniciais desadaptativos (padr\u00f5es amplos e duradouros de pensamentos, emo\u00e7\u00f5es, sensa\u00e7\u00f5es e mem\u00f3rias sobre si e sobre os outros, formados desde cedo). N\u00e3o \u00e9 diagn\u00f3stico de transtorno e a folha oficial de corre\u00e7\u00e3o n\u00e3o traz pontos de corte: por isso o relat\u00f3rio mostra a posi\u00e7\u00e3o da m\u00e9dia de cada esquema no espectro (verde = pouca identifica\u00e7\u00e3o; vermelho = muita identifica\u00e7\u00e3o) e n\u00e3o classifica em baixo, m\u00e9dio ou alto. A mesma m\u00e9dia pode ter significados diferentes conforme a hist\u00f3ria e o momento de vida. Nenhum instrumento isolado descreve a pessoa por inteiro: o resultado deve ser interpretado por profissional qualificado, junto com a entrevista e outras fontes. O texto do question\u00e1rio \u00e9 de uso autorizado e protegido por direitos autorais (Jeffrey Young; Schema Therapy Institute).';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function calcular(resp) {
    if (!resp) throw new Error('YSQ-S3: respostas incompletas');
    var r = {v: {}, e: [], total: 0}, i, k;
    for (i = 1; i <= 90; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 6)) throw new Error('YSQ-S3: resposta invalida no item ' + i);
        r.v[i] = x; r.total += x;
    }
    ESQ.forEach(function (e) {
        var its = [e.n, e.n + 18, e.n + 36, e.n + 54, e.n + 72], s = 0, alt = 0;
        its.forEach(function (n) { s += r.v[n]; if (r.v[n] >= 5) alt++; });
        r.e.push({n: e.n, itens: its, total: s, media: s / 5, alt: alt});
    });
    r.media = r.total / 90;
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return 'M\u00e9dia geral ' + fmt(r.media) + ' (de 1 a 6); sem pontos de corte oficiais'; }
function dadosPainel(r) {
    var o = {};
    ESQ.forEach(function (e, i) { var s = r.e[i]; o[e.cur] = {pontuacao: s.total, max: 30, media: Math.round(s.media * 100) / 100, classificacao: 'M\u00e9dia ' + fmt(s.media)}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= 90; i++) o[i] = r.v[i]; return o; }
function pctDe(m) { return (m - 1) / 5 * 100; }
// ===== SINTESE AUTOMATICA (regras fixas escritas pelo autor; NAO e inteligencia artificial) =====
// Texto discursivo e cauteloso (hipoteses para a conversa clinica). Usa apenas comparacoes entre as medias e as ancoras de resposta do instrumento;
// nao cria pontos de corte clinicos. A frase de cada esquema (IMP) e uma leitura geral da teoria dos esquemas, nunca uma conclusao sobre a pessoa.
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
    var e = r.e.slice().sort(function (a, c) { return c.media - a.media || a.n - c.n; }), g = r.media, k = r.total % 3;
    var nome = function (x) { return ESQ[x.n - 1].nome; }, mm = function (x) { return fmt(x.media); };
    var top = e[0], empate = e.filter(function (x) { return x.media === top.media; }), out = [];
    // 1. tom geral
    var adj = g < 2 ? 'pequena' : g < 3 ? 'pequena' : g < 4 ? 'intermedi\u00e1ria' : 'ampla';
    out.push(['No conjunto, as respostas indicam ', 'De modo geral, as respostas sugerem ', 'Olhando o conjunto das respostas, v\u00ea-se '][k] + 'identifica\u00e7\u00e3o ' + adj + ' com os esquemas avaliados (m\u00e9dia geral ' + fmt(g) + ')' + (g >= 2 && g < 3 && top.media >= 3 ? ', com alguns pontos mais marcados' : '') + '.');
    // 2. esquemas em destaque
    var prox = ['o que pode significar que', 'o que sugere que', 'o que pode indicar que'][(k + 1) % 3];
    if (empate.length === 18) {
        out.push('Todos os esquemas tiveram a mesma m\u00e9dia (' + mm(top) + '), sem nenhum em destaque.');
    } else if (top.media < 3) {
        out.push(empate.length > 1
            ? 'Nenhum esquema se destacou de forma marcante; as m\u00e9dias mais altas (' + mm(top) + ') ficaram em ' + (empate.length > 3 ? empate.slice(0, 3).map(nome).join(', ') + ' e mais ' + (empate.length - 3) + (empate.length - 3 === 1 ? ' esquema' : ' esquemas') : lista(empate.map(nome))) + '.'
            : 'Nenhum esquema se destacou de forma marcante; o mais alto foi ' + nome(top) + ' (' + mm(top) + '), que vale apenas como ponto de partida para a conversa.');
    } else if (empate.length > 3) {
        out.push('V\u00e1rios esquemas empataram na m\u00e9dia mais alta (' + mm(top) + '), entre eles ' + empate.slice(0, 3).map(nome).join(', ') + ', o que dificulta apontar um \u00fanico em destaque.');
    } else {
        var tops = e.slice(0, 3).filter(function (x) { return x.media >= 3; });
        out.push((tops.length === 1 ? 'O esquema de ' : 'Os esquemas de ') + lista(tops.map(function (x) { return nome(x) + ' (' + mm(x) + ')'; })) + (tops.length === 1 ? ' apresentou a pontua\u00e7\u00e3o mais alta, ' + prox + ' ele tem maior proemin\u00eancia' : ' apresentaram as pontua\u00e7\u00f5es mais altas, ' + prox + ' t\u00eam maior proemin\u00eancia') + ' na forma como a pessoa interpreta a si mesma e as suas rela\u00e7\u00f5es.' + (tops.length > 1 && top.media - e[1].media >= 0.8 ? ' ' + nome(top) + ' se destaca nitidamente dos demais.' : ''));
        out.push('Em ' + nome(tops[0]) + ', o padr\u00e3o sugere que a pessoa ' + IMP[tops[0].n] + '.' + (tops.length > 1 ? ' J\u00e1 em ' + nome(tops[1]) + ', sugere que a pessoa ' + IMP[tops[1].n] + '.' : ''));
    }
    // 3. dominios
    var dm = DOMINIOS.map(function (d, ix) { var s = 0; d.esq.forEach(function (n) { s += r.e[n - 1].media; }); return {nome: d.nome, m: s / d.esq.length, tema: TEMA[ix]}; }).sort(function (a, c) { return c.m - a.m; });
    var lo = dm[dm.length - 1];
    if (dm[0].m - lo.m < 0.005) out.push('Os cinco dom\u00ednios tiveram a mesma m\u00e9dia (' + fmt(lo.m) + ').');
    else if (dm[0].m - lo.m < 0.5) out.push('As respostas se distribuem de forma parecida entre os dom\u00ednios, sem uma \u00e1rea claramente \u00e0 frente.');
    else out.push('Por dom\u00ednio, as respostas se concentram em "' + dm[0].nome + '" (' + fmt(dm[0].m) + '), \u00e1rea ligada a ' + dm[0].tema + ', o que ' + ['pode apontar para um ponto sens\u00edvel', 'sugere um ponto sens\u00edvel', 'pode indicar uma \u00e1rea mais sens\u00edvel'][k] + ' na hist\u00f3ria e na experi\u00eancia da pessoa.');
    // 4. detalhes
    var cheios = e.filter(function (x) { return x.alt === 5; }), vari = e.filter(function (x) { var vs = x.itens.map(function (n) { return r.v[n]; }); return Math.max.apply(null, vs) - Math.min.apply(null, vs) >= 4 && x.media >= 2.5; });
    if (cheios.length && cheios.length < 18) out.push('Em ' + lista(cheios.slice(0, 3).map(nome)) + ', todas as afirma\u00e7\u00f5es foram sentidas como muito verdadeiras (5 ou 6), o que refor\u00e7a a intensidade ' + (cheios.length === 1 ? 'desse esquema' : 'desses esquemas') + '.');
    if (vari.length) out.push('Em ' + lista(vari.slice(0, 2).map(nome)) + ', as respostas oscilaram bastante entre as afirma\u00e7\u00f5es, ent\u00e3o vale olhar item a item.');
    // 5. fecho
    out.push('Essas leituras s\u00e3o hip\u00f3teses para a conversa cl\u00ednica, e n\u00e3o conclus\u00f5es: dependem da hist\u00f3ria de vida e do contexto. Texto montado por regras fixas, sem intelig\u00eancia artificial.');
    return out.map(function (x, i) { return {t: 'p' + i, x: x}; });
}
function blocks(r) {
    var b = [], ordem = r.e.slice().sort(function (a, c) { return c.media - a.media || a.n - c.n; }), alt90 = 0, i;
    for (i = 1; i <= 90; i++) if (r.v[i] >= 5) alt90++;
    var top = ordem[0];
    b.push({t: 'hero', fundo: '#e0f2f1', borda: COR, cor: '#004d40', titulo: 'M\u00e9dia geral das respostas: ' + fmt(r.media) + ' (de 1 a 6)', sub: 'Cada esquema tem uma r\u00e9gua do verde (pouca identifica\u00e7\u00e3o) ao vermelho (muita identifica\u00e7\u00e3o). N\u00e3o h\u00e1 pontos de corte oficiais: o relat\u00f3rio mostra a posi\u00e7\u00e3o, sem classificar.'});
    b.push({t: 'cards', itens: [
        {rot: 'M\u00c9DIA GERAL', valor: fmt(r.media), de: 'de 1 a 6', cor: COR},
        {rot: 'TOTAL', valor: String(r.total), de: 'de 90 a 540', cor: '#004d40'},
        {rot: 'ITENS 5 OU 6', valor: String(alt90), de: 'de 90 itens', cor: '#ef6c00'},
        {rot: 'MAIOR M\u00c9DIA', valor: fmt(top.media), de: ESQ[top.n - 1].cur, cor: '#c62828'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este relat\u00f3rio', itens: [
        {t: 'O que o YSQ-S3 mostra', x: 'Quanto a pessoa se reconhece em afirma\u00e7\u00f5es sobre si mesma e sobre as rela\u00e7\u00f5es, ao longo do \u00faltimo ano. As 90 afirma\u00e7\u00f5es se organizam em 18 esquemas (5 afirma\u00e7\u00f5es cada). Os esquemas s\u00e3o padr\u00f5es de pensamento, emo\u00e7\u00e3o e comportamento que costumam se formar cedo, a partir de necessidades emocionais que n\u00e3o foram bem atendidas, e que podem seguir influenciando a vida adulta.'},
        {t: 'Como as respostas viram resultado', x: 'Cada resposta vai de 1 ("completamente falso sobre mim") a 6 ("me descreve perfeitamente"). Para cada esquema soma-se as 5 respostas (de 5 a 30) e calcula-se a m\u00e9dia (de 1 a 6). A m\u00e9dia geral \u00e9 a m\u00e9dia das 90 respostas.'},
        {t: 'Como ler a r\u00e9gua de cores', x: 'A r\u00e9gua segue as cores do espectro vis\u00edvel, come\u00e7ando no verde: verde = a pessoa se identifica pouco com aquele esquema; amarelo e laranja = identifica\u00e7\u00e3o intermedi\u00e1ria; vermelho = identifica\u00e7\u00e3o muito grande. O ponteiro marca a m\u00e9dia do esquema. Quanto mais para a direita e mais vermelho, mais a pessoa se reconhece naquelas afirma\u00e7\u00f5es.'},
        {t: 'O que este relat\u00f3rio n\u00e3o diz', x: 'A folha oficial n\u00e3o traz pontos de corte; por isso n\u00e3o dizemos que um esquema \u00e9 "baixo", "m\u00e9dio" ou "alto", nem que existe um transtorno. Veja tamb\u00e9m os itens marcados com 5 ou 6, que ajudam a entender o que est\u00e1 por tr\u00e1s da m\u00e9dia.'}
    ]});
    var its = [];
    DOMINIOS.forEach(function (d) {
        its.push({grupo: d.nome, grupoDesc: d.desc});
        d.esq.forEach(function (n) {
            var e = r.e[n - 1], q = ESQ[n - 1];
            its.push({rot: q.nome, sub: q.desc, txt: 'm\u00e9dia ' + fmt(e.media) + '  |  soma ' + e.total + ' de 30', pct: pctDe(e.media), ticks: [1, 2, 3, 4, 5, 6].map(function (v) { return {pct: pctDe(v), rot: String(v)}; })});
        });
    });
    b.push({t: 'regua', titulo: 'Mapa dos 18 esquemas', legenda: 'R\u00e9gua de 1 a 6 (m\u00e9dia das 5 respostas do esquema). Verde = pouca identifica\u00e7\u00e3o; vermelho = muita identifica\u00e7\u00e3o. 1 = completamente falso sobre mim; 6 = me descreve perfeitamente.', itens: its});
    b.push({t: 'tabela', titulo: 'Esquemas em ordem de m\u00e9dia (do maior para o menor)', minAltura: 60, cols: [{h: '#', w: 8, al: 'c'}, {h: 'Esquema', w: 82, al: 'l'}, {h: 'Soma (5 a 30)', w: 30, al: 'c'}, {h: 'M\u00e9dia (1 a 6)', w: 30, al: 'c'}, {h: 'Itens 5 ou 6', w: 30, al: 'c'}], linhas: ordem.map(function (e, ix) { return {c: [String(ix + 1), ESQ[e.n - 1].nome, String(e.total), fmt(e.media), e.alt + ' de 5']}; })});
    var linhasAlt = [];
    for (i = 1; i <= 90; i++) if (r.v[i] >= 5) { var en = ((i - 1) % 18) + 1; linhasAlt.push({c: [ESQ[en - 1].cur, String(i), ITENS[i - 1], String(r.v[i])]}); }
    linhasAlt.sort(function (a, c) { return ESQ.map(function (q) { return q.cur; }).indexOf(a.c[0]) - ESQ.map(function (q) { return q.cur; }).indexOf(c.c[0]) || parseInt(a.c[1], 10) - parseInt(c.c[1], 10); });
    if (linhasAlt.length) b.push({t: 'tabela', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa (respostas 5 ou 6)', minAltura: 50, cols: [{h: 'Esquema', w: 34, al: 'l'}, {h: '#', w: 8, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 122, al: 'l'}, {h: 'Resp.', w: 16, al: 'c'}], linhas: linhasAlt});
    else b.push({t: 'textos', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa', itens: [{t: 'Respostas 5 ou 6', x: 'Nenhuma afirma\u00e7\u00e3o foi marcada com 5 ou 6.'}]});
    var todas = ITENS.map(function (t, i) { var n = i + 1, en = ((n - 1) % 18) + 1; return {c: [String(n), ESQ[en - 1].cur, t, String(r.v[n])]}; });
    b.push({t: 'tabela', titulo: 'Todas as respostas', minAltura: 60, cols: [{h: '#', w: 8, al: 'c'}, {h: 'Esquema', w: 34, al: 'l'}, {h: 'Afirma\u00e7\u00e3o', w: 122, al: 'l'}, {h: 'Resp.', w: 16, al: 'c'}], linhas: todas});
    b.push({t: 'textos', titulo: 'S\u00edntese dos resultados', itens: [{t: 'Em resumo', x: sintese(r).map(function (p) { return p.x; }).join(' ')}]});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try { if (d.versaoEscala !== 2) return null; return calcular(d.respostas); } catch (e) { return null; }
}
var base = symMake({
    id: 'ysqs3', nome: 'YSQ-S3', cor: COR, cor2: '#004d40', escalaPainel: ['YSQ-S3'],
    sub1: 'Question\u00e1rio de Esquemas de Young - Vers\u00e3o Breve (YSQ-S3) - 90 itens, 18 esquemas',
    sub2: 'Jeffrey Young | vers\u00e3o oficial para uso no Brasil: Souza, Damasceno e Oliveira',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_YSQS3 = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, ESQ: ESQ, DOMINIOS: DOMINIOS, sintese: sintese};

})();
