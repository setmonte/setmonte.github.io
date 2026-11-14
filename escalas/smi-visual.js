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
    var SPEC_AZ = [[0, [222, 234, 248]], [0.5, [110, 160, 220]], [1, [21, 67, 160]]];
    var SPEC_AZ_CSS = 'linear-gradient(90deg,#deeaf8 0%,#6ea0dc 50%,#1543a0 100%)';
    function espectro(t, pal) {
        var SP = pal === 'azul' ? SPEC_AZ : SPEC;
        t = Math.max(0, Math.min(1, t)); var k = 0;
        while (k < SP.length - 2 && t > SP[k + 1][0]) k++;
        var a = SP[k], b2 = SP[k + 1], f = (t - a[0]) / (b2[0] - a[0]);
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
                    '<div class="' + ID + '-rgb"' + (it.paleta === 'azul' ? ' style="background:' + SPEC_AZ_CSS + '"' : '') + '><div class="' + ID + '-rgp" style="left:' + pc + '%"></div></div><div class="' + ID + '-rgt">' +
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
                for (s = 0; s < NS; s++) { var cc = espectro((s + 0.5) / NS, it.paleta); doc.setFillColor(cc[0], cc[1], cc[2]); doc.rect(xr + wr * s / NS, yb, wr / NS + 0.12, hb, 'F'); }
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

// smi-visual.js - SMI (Schema Mode Inventory), versao CURTA validada (Lobbestael et al., 2010): 118 itens, 14 modos, frequencia de 1 a 6.
// Pontuacao (artigo): media dos itens de cada modo; quanto maior, mais frequente o modo. NAO ha pontos de corte.
// Itens em portugues: TRADUCAO PROPRIA a partir do ingles do artigo (nao e a versao oficial brasileira) - avisado no relatorio.
// O app antigo tinha 124 itens (10 por modo, gerados por IA) e niveis Baixa/Media/Alta 40%/70% sem fonte (removidos).
// d.respostas: chaves 1..118 com 1-6. versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS = [{"n":1,"m":"BA","t":"Eu exijo respeito e n\u00e3o deixo que as outras pessoas passem por cima de mim."},{"n":2,"m":"HC","t":"Eu me sinto amado(a) e aceito(a)."},{"n":3,"m":"PP","t":"Eu me privo de prazeres porque n\u00e3o os mere\u00e7o."},{"n":4,"m":"VC","t":"Eu me sinto fundamentalmente inadequado(a), falho(a) ou defeituoso(a)."},{"n":5,"m":"PP","t":"Eu tenho impulsos de me punir machucando a mim mesmo(a) (por ex.: me cortando)."},{"n":6,"m":"VC","t":"Eu me sinto perdido(a)."},{"n":7,"m":"DP","t":"Eu sou duro(a) comigo mesmo(a)."},{"n":8,"m":"CS","t":"Eu me esfor\u00e7o muito para agradar as outras pessoas, a fim de evitar conflitos, confrontos ou rejei\u00e7\u00e3o."},{"n":9,"m":"PP","t":"Eu n\u00e3o consigo me perdoar."},{"n":10,"m":"SA","t":"Eu fa\u00e7o coisas para ser o centro das aten\u00e7\u00f5es."},{"n":11,"m":"SA","t":"Eu fico irritado(a) quando as pessoas n\u00e3o fazem o que eu pe\u00e7o."},{"n":12,"m":"IC","t":"Eu tenho dificuldade de controlar meus impulsos."},{"n":13,"m":"UC","t":"Se eu n\u00e3o consigo atingir um objetivo, eu me frustro com facilidade e desisto."},{"n":14,"m":"EC","t":"Eu tenho explos\u00f5es de raiva."},{"n":15,"m":"IC","t":"Eu ajo por impulso ou expresso emo\u00e7\u00f5es que me metem em problemas ou machucam outras pessoas."},{"n":16,"m":"PP","t":"A culpa \u00e9 minha quando algo ruim acontece."},{"n":17,"m":"HC","t":"Eu me sinto contente e \u00e0 vontade."},{"n":18,"m":"CS","t":"Eu mudo meu jeito de ser conforme as pessoas com quem estou, para que gostem de mim ou me aprovem."},{"n":19,"m":"HC","t":"Eu me sinto conectado(a) com as outras pessoas."},{"n":20,"m":"HA","t":"Quando h\u00e1 problemas, eu me esfor\u00e7o para resolv\u00ea-los por conta pr\u00f3pria."},{"n":21,"m":"UC","t":"Eu n\u00e3o me disciplino para concluir tarefas rotineiras ou entediantes."},{"n":22,"m":"AC","t":"Se eu n\u00e3o lutar, serei maltratado(a) ou ignorado(a)."},{"n":23,"m":"BA","t":"Se voc\u00ea deixa as outras pessoas zombarem de voc\u00ea ou o intimidarem, voc\u00ea \u00e9 um perdedor."},{"n":24,"m":"EC","t":"Eu agrido fisicamente as pessoas quando estou com raiva delas."},{"n":25,"m":"EC","t":"Quando come\u00e7o a sentir raiva, muitas vezes n\u00e3o consigo control\u00e1-la e perco a cabe\u00e7a."},{"n":26,"m":"SA","t":"\u00c9 importante para mim ser o n\u00famero um (por ex.: o mais popular, o mais bem-sucedido, o mais rico, o mais poderoso)."},{"n":27,"m":"DPT","t":"Eu me sinto indiferente \u00e0 maioria das coisas."},{"n":28,"m":"HA","t":"Eu consigo resolver problemas de forma racional, sem deixar que minhas emo\u00e7\u00f5es me dominem."},{"n":29,"m":"SA","t":"Eu n\u00e3o me contento com o segundo lugar."},{"n":30,"m":"BA","t":"Atacar \u00e9 a melhor defesa."},{"n":31,"m":"DPT","t":"Eu me sinto frio(a) e sem cora\u00e7\u00e3o em rela\u00e7\u00e3o \u00e0s outras pessoas."},{"n":32,"m":"DPT","t":"Eu me sinto desligado(a) (sem contato comigo mesmo(a), com minhas emo\u00e7\u00f5es ou com as outras pessoas)."},{"n":33,"m":"IC","t":"Eu sigo minhas emo\u00e7\u00f5es \u00e0s cegas."},{"n":34,"m":"VC","t":"Eu me sinto desesperado(a)."},{"n":35,"m":"CS","t":"Eu deixo que as outras pessoas me critiquem ou me diminuam."},{"n":36,"m":"CS","t":"Nos relacionamentos, eu deixo a outra pessoa levar vantagem."},{"n":37,"m":"DPT","t":"Eu me sinto distante das outras pessoas."},{"n":38,"m":"IC","t":"Eu n\u00e3o penso no que digo, e isso me causa problemas ou machuca outras pessoas."},{"n":39,"m":"DSS","t":"Eu trabalho ou pratico esportes de forma intensa para n\u00e3o ter que pensar em coisas perturbadoras."},{"n":40,"m":"AC","t":"Eu fico com raiva porque as pessoas tentam tirar minha liberdade ou minha independ\u00eancia."},{"n":41,"m":"DPT","t":"Eu n\u00e3o sinto nada."},{"n":42,"m":"SA","t":"Eu fa\u00e7o o que quero, sem me importar com as necessidades e os sentimentos dos outros."},{"n":43,"m":"DP","t":"Eu n\u00e3o me permito relaxar nem me divertir at\u00e9 terminar tudo o que devo fazer."},{"n":44,"m":"EC","t":"Eu jogo coisas longe quando estou com raiva."},{"n":45,"m":"AC","t":"Eu sinto uma raiva intensa das outras pessoas."},{"n":46,"m":"HC","t":"Eu sinto que me encaixo com as outras pessoas."},{"n":47,"m":"AC","t":"Eu tenho muita raiva acumulada dentro de mim que preciso colocar para fora."},{"n":48,"m":"VC","t":"Eu me sinto sozinho(a)."},{"n":49,"m":"DSS","t":"Eu gosto de fazer algo empolgante ou calmante para evitar meus sentimentos (por ex.: trabalhar, apostar, comer, fazer compras, atividades sexuais, assistir \u00e0 TV)."},{"n":50,"m":"BA","t":"A igualdade n\u00e3o existe, ent\u00e3o \u00e9 melhor ser superior \u00e0s outras pessoas."},{"n":51,"m":"EC","t":"Quando estou com raiva, muitas vezes perco o controle e amea\u00e7o as outras pessoas."},{"n":52,"m":"CS","t":"Eu deixo as outras pessoas fazerem o que querem, em vez de expressar minhas pr\u00f3prias necessidades."},{"n":53,"m":"AC","t":"Quem n\u00e3o est\u00e1 comigo est\u00e1 contra mim."},{"n":54,"m":"DSS","t":"Para me incomodar menos com pensamentos ou sentimentos desagrad\u00e1veis, eu me mantenho sempre ocupado(a)."},{"n":55,"m":"PP","t":"Eu sou uma pessoa m\u00e1 se sinto raiva das outras pessoas."},{"n":56,"m":"DPT","t":"Eu n\u00e3o quero me envolver com as pessoas."},{"n":57,"m":"HC","t":"Eu sinto que tenho bastante estabilidade e seguran\u00e7a na minha vida."},{"n":58,"m":"HA","t":"Eu sei quando expressar minhas emo\u00e7\u00f5es e quando n\u00e3o."},{"n":59,"m":"AC","t":"Eu sinto raiva de algu\u00e9m por me deixar sozinho(a) ou me abandonar."},{"n":60,"m":"DPT","t":"Eu n\u00e3o me sinto conectado(a) com as outras pessoas."},{"n":61,"m":"UC","t":"Eu n\u00e3o consigo me obrigar a fazer coisas que acho desagrad\u00e1veis, mesmo sabendo que \u00e9 para o meu pr\u00f3prio bem."},{"n":62,"m":"IC","t":"Eu quebro regras e me arrependo depois."},{"n":63,"m":"VC","t":"Eu me sinto humilhado(a)."},{"n":64,"m":"HC","t":"Eu confio na maioria das outras pessoas."},{"n":65,"m":"IC","t":"Eu ajo primeiro e penso depois."},{"n":66,"m":"UC","t":"Eu me entedio com facilidade e perco o interesse pelas coisas."},{"n":67,"m":"VC","t":"Mesmo com pessoas ao meu redor, eu me sinto sozinho(a)."},{"n":68,"m":"PP","t":"Eu n\u00e3o me permito fazer coisas prazerosas que as outras pessoas fazem porque sou mau (m\u00e1)."},{"n":69,"m":"HA","t":"Eu afirmo o que preciso sem exagerar."},{"n":70,"m":"SA","t":"Eu me sinto especial e melhor do que a maioria das outras pessoas."},{"n":71,"m":"DPT","t":"Eu n\u00e3o me importo com nada; nada tem import\u00e2ncia para mim."},{"n":72,"m":"AC","t":"Eu fico com raiva quando algu\u00e9m me diz como devo me sentir ou me comportar."},{"n":73,"m":"BA","t":"Se voc\u00ea n\u00e3o dominar as outras pessoas, elas v\u00e3o dominar voc\u00ea."},{"n":74,"m":"IC","t":"Eu digo o que sinto, ou fa\u00e7o coisas por impulso, sem pensar nas consequ\u00eancias."},{"n":75,"m":"AC","t":"Eu tenho vontade de dar uma bronca nas pessoas pela forma como me trataram."},{"n":76,"m":"HA","t":"Eu sou capaz de cuidar de mim mesmo(a)."},{"n":77,"m":"SA","t":"Eu sou bastante cr\u00edtico(a) com as outras pessoas."},{"n":78,"m":"DP","t":"Eu vivo sob press\u00e3o constante para conquistar e realizar coisas."},{"n":79,"m":"DP","t":"Eu tento n\u00e3o cometer erros; do contr\u00e1rio, eu me sinto mal comigo mesmo(a)."},{"n":80,"m":"PP","t":"Eu mere\u00e7o ser punido(a)."},{"n":81,"m":"HA","t":"Eu consigo aprender, crescer e mudar."},{"n":82,"m":"DSS","t":"Eu quero me distrair de pensamentos e sentimentos perturbadores."},{"n":83,"m":"PP","t":"Eu sinto raiva de mim mesmo(a)."},{"n":84,"m":"DPT","t":"Eu me sinto emocionalmente apagado(a)."},{"n":85,"m":"SA","t":"Eu tenho que ser o(a) melhor em tudo o que fa\u00e7o."},{"n":86,"m":"DP","t":"Eu sacrifico prazer, sa\u00fade ou felicidade para atingir meus pr\u00f3prios padr\u00f5es."},{"n":87,"m":"SA","t":"Eu sou exigente com as outras pessoas."},{"n":88,"m":"EC","t":"Se eu fico com raiva, posso perder tanto o controle que machuco outras pessoas."},{"n":89,"m":"BA","t":"Eu sou invulner\u00e1vel."},{"n":90,"m":"PP","t":"Eu sou uma pessoa m\u00e1."},{"n":91,"m":"HC","t":"Eu me sinto seguro(a)."},{"n":92,"m":"HC","t":"Eu sinto que sou ouvido(a), compreendido(a) e validado(a)."},{"n":93,"m":"IC","t":"\u00c9 imposs\u00edvel para mim controlar meus impulsos."},{"n":94,"m":"EC","t":"Eu destruo coisas quando estou com raiva."},{"n":95,"m":"BA","t":"Dominando as outras pessoas, nada pode acontecer com voc\u00ea."},{"n":96,"m":"CS","t":"Eu ajo de forma passiva, mesmo quando n\u00e3o gosto do jeito como as coisas est\u00e3o."},{"n":97,"m":"EC","t":"Minha raiva foge do controle."},{"n":98,"m":"BA","t":"Eu zombo das outras pessoas ou as intimido."},{"n":99,"m":"AC","t":"Eu tenho vontade de descontar ou machucar algu\u00e9m pelo que essa pessoa fez comigo."},{"n":100,"m":"DP","t":"Eu sei que existe um jeito \"certo\" e um jeito \"errado\" de fazer as coisas; eu me esfor\u00e7o para faz\u00ea-las do jeito certo, sen\u00e3o come\u00e7o a me criticar."},{"n":101,"m":"VC","t":"Eu me sinto frequentemente sozinho(a) no mundo."},{"n":102,"m":"VC","t":"Eu me sinto fraco(a) e indefeso(a)."},{"n":103,"m":"UC","t":"Eu sou pregui\u00e7oso(a)."},{"n":104,"m":"CS","t":"Eu aguento qualquer coisa das pessoas que s\u00e3o importantes para mim."},{"n":105,"m":"AC","t":"Eu fui enganado(a) ou tratado(a) de forma injusta."},{"n":106,"m":"VC","t":"Eu me sinto deixado(a) de lado ou exclu\u00eddo(a)."},{"n":107,"m":"BA","t":"Eu menosprezo os outros."},{"n":108,"m":"HC","t":"Eu me sinto otimista."},{"n":109,"m":"SA","t":"Eu sinto que n\u00e3o deveria ter que seguir as mesmas regras que as outras pessoas seguem."},{"n":110,"m":"DP","t":"Eu me cobro para ser mais respons\u00e1vel do que a maioria das outras pessoas."},{"n":111,"m":"HA","t":"Eu consigo me defender quando me sinto criticado(a) injustamente, maltratado(a) ou explorado(a)."},{"n":112,"m":"PP","t":"Eu n\u00e3o mere\u00e7o compaix\u00e3o quando algo ruim acontece comigo."},{"n":113,"m":"VC","t":"Eu sinto que ningu\u00e9m me ama."},{"n":114,"m":"HA","t":"Eu sinto que, no fundo, sou uma boa pessoa."},{"n":115,"m":"HA","t":"Quando necess\u00e1rio, eu fa\u00e7o tarefas entediantes e rotineiras para conseguir o que valorizo."},{"n":116,"m":"HC","t":"Eu me sinto espont\u00e2neo(a) e brincalh\u00e3o(ona)."},{"n":117,"m":"EC","t":"Eu posso ficar com tanta raiva que me sinto capaz de matar algu\u00e9m."},{"n":118,"m":"HA","t":"Eu tenho uma boa no\u00e7\u00e3o de quem eu sou e do que preciso para ser feliz."}];
var MODOS = [{"m":"VC","cod":"cv","nome":"Crian\u00e7a Vulner\u00e1vel","grupo":0},{"m":"AC","cod":"cz","nome":"Crian\u00e7a Zangada","grupo":0},{"m":"EC","cod":"ce","nome":"Crian\u00e7a Enfurecida","grupo":0},{"m":"IC","cod":"ci","nome":"Crian\u00e7a Impulsiva","grupo":0},{"m":"UC","cod":"cu","nome":"Crian\u00e7a Indisciplinada","grupo":0},{"m":"HC","cod":"cf","nome":"Crian\u00e7a Feliz","grupo":0,"saudavel":true},{"m":"CS","cod":"cc","nome":"Capitulador Complacente","grupo":1},{"m":"DPT","cod":"pd","nome":"Protetor Desligado","grupo":1},{"m":"DSS","cod":"ad","nome":"Autoconsolador Desligado","grupo":1},{"m":"SA","cod":"ae","nome":"Autoengrandecedor","grupo":1},{"m":"BA","cod":"pa","nome":"Provocador e Atacante","grupo":1},{"m":"PP","cod":"pp","nome":"Pai/M\u00e3e Punitivo","grupo":2},{"m":"DP","cod":"pe","nome":"Pai/M\u00e3e Exigente","grupo":2},{"m":"HA","cod":"as","nome":"Adulto Saud\u00e1vel","grupo":3,"saudavel":true}];

var COR = '#6a1b9a';
var GRUPOS = [
    {nome: 'Modos Crian\u00e7a', desc: 'Estados emocionais ligados \u00e0 inf\u00e2ncia que podem ser reativados no presente.'},
    {nome: 'Modos de Enfrentamento Disfuncionais', desc: 'Jeitos autom\u00e1ticos de lidar com o sofrimento (ceder, se desligar ou se opor) que antes protegiam, mas hoje podem manter o problema.'},
    {nome: 'Modos Pais Internalizados', desc: 'Vozes cr\u00edticas e exigentes aprendidas na hist\u00f3ria e dirigidas contra si mesmo(a).'},
    {nome: 'Modo Adulto Saud\u00e1vel', desc: 'A parte que cuida, protege, p\u00f5e limites e toma decis\u00f5es equilibradas.'}
];
var DEF = {
    VC: 'Sente-se s\u00f3, desamparado(a), incompreendido(a), fr\u00e1gil e sem apoio.',
    AC: 'Sente raiva e frustra\u00e7\u00e3o porque as necessidades emocionais centrais n\u00e3o est\u00e3o sendo atendidas.',
    EC: 'Raiva intensa, que foge do controle e pode levar a amea\u00e7ar, agredir ou destruir.',
    IC: 'Age por impulso, sem pensar nas consequ\u00eancias, e depois pode se arrepender.',
    UC: 'Dificuldade de se disciplinar, de tolerar t\u00e9dio e frustra\u00e7\u00e3o e de fazer o que \u00e9 desagrad\u00e1vel.',
    HC: 'Sente-se amado(a), seguro(a), conectado(a), contente e espont\u00e2neo(a).',
    CS: 'Age de forma passiva e submissa, cedendo aos outros por medo de conflito ou rejei\u00e7\u00e3o.',
    DPT: 'Desliga sentimentos e necessidades, se afasta emocionalmente das pessoas e se sente vazio(a) ou indiferente.',
    DSS: 'Busca se distrair de sentimentos desagrad\u00e1veis com atividades intensas ou estimulantes.',
    SA: 'Sente-se especial e superior e espera tratamento privilegiado.',
    BA: 'Domina, intimida ou ataca os outros como forma de defesa ou de controle.',
    PP: 'Sente que ele(a) mesmo(a) merece ser punido(a) e age com dureza contra si.',
    DP: 'Sente que precisa atingir padr\u00f5es muito altos, sem errar e sem relaxar.',
    HA: 'Cuida de si, resolve problemas, p\u00f5e limites e tem uma boa no\u00e7\u00e3o de quem \u00e9.'
};
var IMP = {
    VC: 'se sente s\u00f3, fr\u00e1gil e sem apoio, o que pode tornar mais intensas as rea\u00e7\u00f5es a cr\u00edticas, perdas e rejei\u00e7\u00e3o',
    AC: 'sente raiva quando suas necessidades n\u00e3o s\u00e3o atendidas ou quando se sente tratada de forma injusta',
    EC: 'tem uma raiva que pode fugir do controle, o que pode afetar as rela\u00e7\u00f5es e gerar arrependimento',
    IC: 'tende a agir por impulso, sem medir as consequ\u00eancias, o que pode gerar problemas e arrependimento depois',
    UC: 'tem dificuldade de se disciplinar e de tolerar t\u00e9dio e frustra\u00e7\u00e3o, o que pode atrapalhar a conclus\u00e3o de tarefas e metas',
    HC: 'se sente amada, segura e \u00e0 vontade, o que costuma ser um recurso importante',
    CS: 'tende a ceder e a se submeter para evitar conflito ou rejei\u00e7\u00e3o, o que pode lev\u00e1-la a calar suas necessidades e a tolerar o que a machuca',
    DPT: 'tende a se desligar das emo\u00e7\u00f5es e a se afastar das pessoas, o que pode passar uma imagem de frieza ou indiferen\u00e7a, mesmo que haja sofrimento por tr\u00e1s',
    DSS: 'tende a se manter ocupada ou a buscar est\u00edmulos intensos para n\u00e3o sentir, o que pode adiar o contato com o que a incomoda',
    SA: 'tende a se sentir especial e merecedora de privil\u00e9gios, o que pode gerar atritos e dificuldade de considerar os outros',
    BA: 'tende a dominar ou a atacar antes de ser atacada, o que pode proteger no curto prazo, mas afasta as pessoas',
    PP: 'se critica e se pune com dureza, o que pode alimentar culpa, vergonha e dificuldade de se perdoar',
    DP: 'cobra de si padr\u00f5es muito altos e vive sob press\u00e3o constante, o que pode trazer cansa\u00e7o e pouco espa\u00e7o para o prazer',
    HA: 'consegue cuidar de si e resolver problemas com equil\u00edbrio, o que costuma servir de apoio diante dos outros modos'
};
var ROT6 = ['Nunca ou quase nunca', 'Raramente', 'Ocasionalmente', 'Frequentemente', 'Na maioria das vezes', 'Sempre'];
var REFS = [
    'LOBBESTAEL, J.; VAN VREESWIJK, M.; SPINHOVEN, P.; SCHOUTEN, E.; ARNTZ, A. Reliability and validity of the short Schema Mode Inventory (SMI). Behavioural and Cognitive Psychotherapy, v. 38, n. 4, p. 437-458, 2010.',
    'YOUNG, J. E.; ARNTZ, A.; ATKINSON, T.; LOBBESTAEL, J.; WEISHAAR, M. E.; VAN VREESWIJK, M. F.; KLOKMAN, J. The Schema Mode Inventory. New York: Schema Therapy Institute, 2007.',
    'YOUNG, J.; FIRST, M. Lista de modos esquem\u00e1ticos. Tradu\u00e7\u00e3o e adapta\u00e7\u00e3o oficial para uso no Brasil: Elisa Steinhorst Damasceno, Lauren Heineck de Souza e Margareth da Silva Oliveira. \u00a9 2014. Autoriza\u00e7\u00e3o exclusiva do Schema Therapy Institute.',
    'YOUNG, J. E.; KLOSKO, J. S.; WEISHAAR, M. E. Terapia do esquema: guia de t\u00e9cnicas cognitivo-comportamentais inovadoras. Porto Alegre: Artmed, 2008.'
];
var AVISO = 'O SMI descreve com que frequ\u00eancia a pessoa se reconhece em 14 modos esquem\u00e1ticos: estados emocionais e jeitos de reagir que se alternam de momento a momento e que podem ser mais ou menos ativados conforme a situa\u00e7\u00e3o. N\u00e3o \u00e9 diagn\u00f3stico de transtorno e n\u00e3o traz pontos de corte: por isso o relat\u00f3rio mostra a posi\u00e7\u00e3o da m\u00e9dia de cada modo (nos modos disfuncionais, do verde, pouca frequ\u00eancia, ao vermelho, muita frequ\u00eancia; nos modos saud\u00e1veis, em tons de azul) e n\u00e3o classifica em baixo, m\u00e9dio ou alto. Os itens em portugu\u00eas s\u00e3o uma tradu\u00e7\u00e3o pr\u00f3pria a partir do ingl\u00eas do artigo de valida\u00e7\u00e3o da vers\u00e3o curta (Lobbestael et al., 2010) e n\u00e3o a vers\u00e3o oficial brasileira do invent\u00e1rio; por isso o resultado deve ser lido com cautela e interpretado por profissional qualificado, junto com a entrevista e outras fontes. Nenhum instrumento isolado descreve a pessoa por inteiro.';

var MOD = {}; MODOS.forEach(function (m) { MOD[m.m] = m; });
function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function calcular(resp) {
    if (!resp) throw new Error('SMI: respostas incompletas');
    var r = {v: {}, md: [], soma: 0}, i;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 6)) throw new Error('SMI: resposta invalida no item ' + i);
        r.v[i] = x; r.soma += x;
    }
    MODOS.forEach(function (m) {
        var its = [], s = 0, alt = 0;
        ITENS.forEach(function (it) { if (it.m === m.m) { its.push(it.n); s += r.v[it.n]; if (r.v[it.n] >= 5) alt++; } });
        r.md.push({m: m.m, itens: its, n: its.length, soma: s, media: s / its.length, alt: alt});
    });
    var dis = r.md.filter(function (x) { return !MOD[x.m].saudavel; });
    r.dis = dis.reduce(function (a, x) { return a + x.media; }, 0) / dis.length;
    r.media = r.soma / ITENS.length;
    return r;
}
function esc(r) { return r.md.reduce(function (o, x) { o[x.m] = x; return o; }, {}); }
function escore(r) { return Math.round(r.dis * 100) / 100; }
function classifGeral(r) { var e = esc(r); return 'M\u00e9dia dos modos disfuncionais ' + fmt(r.dis) + '; Crian\u00e7a Feliz ' + fmt(e.HC.media) + '; Adulto Saud\u00e1vel ' + fmt(e.HA.media) + ' (escala de 1 a 6; sem pontos de corte)'; }
function dadosPainel(r) {
    var o = {};
    MODOS.forEach(function (m, i) { var s = r.md[i]; o[m.nome] = {pontuacao: s.soma, max: s.n * 6, media: Math.round(s.media * 100) / 100, classificacao: 'M\u00e9dia ' + fmt(s.media)}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function pctDe(m) { return (m - 1) / 5 * 100; }
function lista(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }
// ===== SINTESE AUTOMATICA (regras fixas escritas pelo autor; NAO e inteligencia artificial) =====
function sintese(r) {
    var e = esc(r), k = r.soma % 3, out = [];
    var dis = r.md.filter(function (x) { return !MOD[x.m].saudavel; }).sort(function (a, c) { return c.media - a.media || ITENS.findIndex(function (q) { return q.m === a.m; }) - ITENS.findIndex(function (q) { return q.m === c.m; }); });
    var nome = function (x) { return MOD[x.m].nome; }, mm = function (x) { return fmt(x.media); };
    var g = r.dis, fr = g < 2 ? 'entre "nunca ou quase nunca" e "raramente"' : g < 3 ? 'entre "raramente" e "ocasionalmente"' : g < 4 ? 'entre "ocasionalmente" e "frequentemente"' : 'em torno de "frequentemente" ou mais';
    out.push(['No conjunto, os modos disfuncionais aparecem ', 'De modo geral, os modos disfuncionais se mostram ', 'Olhando o conjunto das respostas, os modos disfuncionais aparecem '][k] + fr + ' (m\u00e9dia ' + fmt(g) + ').');
    var hm = (e.HC.media + e.HA.media) / 2, dif = hm - g, base = 'Os modos saud\u00e1veis (Crian\u00e7a Feliz ' + mm(e.HC) + ' e Adulto Saud\u00e1vel ' + mm(e.HA) + ') ';
    out.push(dif >= 0.5 ? base + 'aparecem com mais frequ\u00eancia do que os disfuncionais, o que costuma funcionar como recurso.' : dif <= -0.5 ? base + 'aparecem com menos frequ\u00eancia do que os disfuncionais, o que pode indicar menos recursos internos de regula\u00e7\u00e3o nos momentos de maior press\u00e3o.' : base + 'aparecem com frequ\u00eancia pr\u00f3xima \u00e0 dos modos disfuncionais.');
    var top = dis[0], empate = dis.filter(function (x) { return x.media === top.media; });
    var prox = ['o que pode significar que', 'o que sugere que', 'o que pode indicar que'][(k + 1) % 3];
    if (empate.length === dis.length) out.push('Todos os modos disfuncionais tiveram a mesma m\u00e9dia (' + mm(top) + '), sem nenhum em destaque.');
    else if (top.media < 3) out.push('Nenhum modo disfuncional se destacou de forma marcante; ' + (empate.length > 1 ? 'as m\u00e9dias mais altas (' + mm(top) + ') ficaram em ' + (empate.length > 3 ? empate.slice(0, 3).map(nome).join(', ') + ' e mais ' + (empate.length - 3) + (empate.length - 3 === 1 ? ' modo' : ' modos') : lista(empate.map(nome))) + '.' : 'o mais alto foi ' + nome(top) + ' (' + mm(top) + '), que vale apenas como ponto de partida para a conversa.'));
    else if (empate.length > 3) out.push('V\u00e1rios modos disfuncionais empataram na m\u00e9dia mais alta (' + mm(top) + '), entre eles ' + empate.slice(0, 3).map(nome).join(', ') + ', o que dificulta apontar um \u00fanico em destaque.');
    else {
        var tops = dis.slice(0, 3).filter(function (x) { return x.media >= 3; });
        out.push((tops.length === 1 ? 'O modo ' : 'Os modos ') + lista(tops.map(function (x) { return nome(x) + ' (' + mm(x) + ')'; })) + (tops.length === 1 ? ' apareceu com mais frequ\u00eancia, ' + prox + ' ele tem maior peso' : ' apareceram com mais frequ\u00eancia, ' + prox + ' t\u00eam maior peso') + ' no modo como a pessoa vive e reage \u00e0s situa\u00e7\u00f5es.' + (tops.length > 1 && top.media - dis[1].media >= 0.8 ? ' ' + nome(top) + ' se destaca nitidamente dos demais.' : ''));
        out.push('No modo ' + nome(tops[0]) + ', o padr\u00e3o sugere que a pessoa ' + IMP[tops[0].m] + '.' + (tops.length > 1 ? ' J\u00e1 no modo ' + nome(tops[1]) + ', sugere que a pessoa ' + IMP[tops[1].m] + '.' : ''));
    }
    var gm = [[0, 1, 2, 3, 4], [6, 7, 8, 9, 10], [11, 12]].map(function (ix, g2) { return {nome: GRUPOS[g2 + (g2 > 0 ? 0 : 0)].nome, m: ix.map(function (i) { return r.md[i].media; }).reduce(function (a, b) { return a + b; }, 0) / ix.length}; });
    gm.sort(function (a, c) { return c.m - a.m; });
    if (gm[0].m - gm[2].m < 0.005) out.push('Os tr\u00eas grupos de modos disfuncionais tiveram a mesma m\u00e9dia (' + fmt(gm[0].m) + ').');
    else if (gm[0].m - gm[2].m < 0.5) out.push('Os grupos de modos disfuncionais (crian\u00e7a, enfrentamento e pais internalizados) se distribuem de forma parecida, sem um grupo claramente \u00e0 frente.');
    else out.push('Entre os grupos de modos disfuncionais, a maior frequ\u00eancia esteve em "' + gm[0].nome + '" (' + fmt(gm[0].m) + ') e a menor em "' + gm[2].nome + '" (' + fmt(gm[2].m) + ').');
    if (e.HA.media < 3) out.push('O modo Adulto Saud\u00e1vel aparece pouco (m\u00e9dia ' + mm(e.HA) + '), o que sugere explorar como a pessoa se acolhe e se regula nos momentos dif\u00edceis.');
    out.push('Essas leituras s\u00e3o hip\u00f3teses para a conversa cl\u00ednica, e n\u00e3o conclus\u00f5es: dependem da hist\u00f3ria de vida e do contexto, e os itens em portugu\u00eas s\u00e3o tradu\u00e7\u00e3o pr\u00f3pria. Texto montado por regras fixas, sem intelig\u00eancia artificial.');
    return out.map(function (x, i) { return {t: 'p' + i, x: x}; });
}
function blocks(r) {
    var b = [], e = esc(r), dis = r.md.filter(function (x) { return !MOD[x.m].saudavel; }).sort(function (a, c) { return c.media - a.media; }), top = dis[0], alt = 0, i;
    for (i = 1; i <= ITENS.length; i++) if (r.v[i] >= 5) alt++;
    b.push({t: 'hero', fundo: '#f3e5f5', borda: COR, cor: '#4a148c', titulo: 'Perfil dos 14 modos esquem\u00e1ticos (m\u00e9dia de 1 a 6)', sub: 'Cada modo tem uma r\u00e9gua: nos modos disfuncionais, do verde (pouca frequ\u00eancia) ao vermelho (muita frequ\u00eancia); nos modos saud\u00e1veis, em tons de azul. N\u00e3o h\u00e1 pontos de corte: o relat\u00f3rio mostra a posi\u00e7\u00e3o, sem classificar.'});
    b.push({t: 'cards', itens: [
        {rot: 'MODOS DISFUNCIONAIS', valor: fmt(r.dis), de: 'm\u00e9dia dos 12 modos', cor: COR},
        {rot: 'CRIAN\u00c7A FELIZ', valor: fmt(e.HC.media), de: 'm\u00e9dia, de 1 a 6', cor: '#1565c0'},
        {rot: 'ADULTO SAUD\u00c1VEL', valor: fmt(e.HA.media), de: 'm\u00e9dia, de 1 a 6', cor: '#1565c0'},
        {rot: 'MAIOR M\u00c9DIA', valor: fmt(top.media), de: MOD[top.m].nome, cor: '#c62828'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este relat\u00f3rio', itens: [
        {t: 'O que o SMI mostra', x: 'Com que frequ\u00eancia a pessoa se reconhece em 118 afirma\u00e7\u00f5es sobre como se sente e age. As afirma\u00e7\u00f5es se organizam em 14 modos esquem\u00e1ticos: estados emocionais e jeitos de reagir que se alternam de momento a momento (por exemplo, sentir-se vulner\u00e1vel, zangado, desligado, ou agir como um pai exigente consigo mesmo). H\u00e1 tamb\u00e9m modos saud\u00e1veis, como a Crian\u00e7a Feliz e o Adulto Saud\u00e1vel.'},
        {t: 'Como a pontua\u00e7\u00e3o \u00e9 feita', x: 'Cada resposta vai de 1 ("nunca ou quase nunca") a 6 ("sempre"). A pontua\u00e7\u00e3o de cada modo \u00e9 a m\u00e9dia das respostas dos seus itens. Quanto maior a m\u00e9dia, com mais frequ\u00eancia a pessoa se reconhece naquele modo.'},
        {t: 'Como ler a r\u00e9gua de cores', x: 'Nos modos disfuncionais, a r\u00e9gua vai do verde (pouca frequ\u00eancia) ao vermelho (muita frequ\u00eancia). Nos modos saud\u00e1veis, a r\u00e9gua \u00e9 azul e mais escuro significa mais frequ\u00eancia: aqui, ter m\u00e9dia alta \u00e9, em geral, um recurso. O ponteiro marca a m\u00e9dia do modo.'},
        {t: 'O que este relat\u00f3rio n\u00e3o diz', x: 'N\u00e3o h\u00e1 pontos de corte, por isso n\u00e3o dizemos que um modo \u00e9 "baixo", "m\u00e9dio" ou "alto", nem que existe um transtorno. Os itens em portugu\u00eas s\u00e3o tradu\u00e7\u00e3o pr\u00f3pria a partir do artigo de valida\u00e7\u00e3o da vers\u00e3o curta, e n\u00e3o a vers\u00e3o oficial brasileira.'}
    ]});
    var its = [], gi;
    GRUPOS.forEach(function (g, ix) {
        its.push({grupo: g.nome, grupoDesc: g.desc});
        MODOS.filter(function (m) { return m.grupo === ix; }).forEach(function (m) {
            var s = e[m.m];
            its.push({rot: m.nome, sub: DEF[m.m], txt: 'm\u00e9dia ' + fmt(s.media) + '  |  ' + s.n + ' itens', pct: pctDe(s.media), paleta: m.saudavel ? 'azul' : null, ticks: [1, 2, 3, 4, 5, 6].map(function (v) { return {pct: pctDe(v), rot: String(v)}; })});
        });
    });
    b.push({t: 'regua', titulo: 'Mapa dos 14 modos', legenda: 'R\u00e9gua de 1 a 6 (m\u00e9dia das respostas do modo). 1 = nunca ou quase nunca; 6 = sempre. Verde a vermelho: modos disfuncionais; azul: modos saud\u00e1veis.', itens: its});
    var ordem = r.md.slice().sort(function (a, c) { return c.media - a.media; });
    b.push({t: 'tabela', titulo: 'Modos em ordem de m\u00e9dia (do maior para o menor)', minAltura: 60, cols: [{h: '#', w: 8, al: 'c'}, {h: 'Modo', w: 76, al: 'l'}, {h: 'Itens', w: 20, al: 'c'}, {h: 'M\u00e9dia (1 a 6)', w: 40, al: 'c'}, {h: 'Itens 5 ou 6', w: 36, al: 'c'}], linhas: ordem.map(function (x, ix) { return {c: [String(ix + 1), MOD[x.m].nome + (MOD[x.m].saudavel ? ' (saud\u00e1vel)' : ''), String(x.n), fmt(x.media), x.alt + ' de ' + x.n]}; })});
    var linhasAlt = [];
    MODOS.forEach(function (m) { ITENS.forEach(function (it) { if (it.m === m.m && r.v[it.n] >= 5) linhasAlt.push({c: [m.nome, String(it.n), it.t, String(r.v[it.n])]}); }); });
    if (linhasAlt.length) b.push({t: 'tabela', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa (respostas 5 ou 6)', minAltura: 50, cols: [{h: 'Modo', w: 38, al: 'l'}, {h: '#', w: 9, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 117, al: 'l'}, {h: 'Resp.', w: 16, al: 'c'}], linhas: linhasAlt});
    else b.push({t: 'textos', titulo: 'Afirma\u00e7\u00f5es que mais descreveram a pessoa', itens: [{t: 'Respostas 5 ou 6', x: 'Nenhuma afirma\u00e7\u00e3o foi marcada com 5 ou 6.'}]});
    b.push({t: 'textos', titulo: 'S\u00edntese dos resultados', itens: [{t: 'Em resumo', x: sintese(r).map(function (p) { return p.x; }).join(' ')}]});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try { if (d.versaoEscala !== 2) return null; return calcular(d.respostas); } catch (e) { return null; }
}
var base = symMake({
    id: 'smi', nome: 'SMI', cor: COR, cor2: '#4a148c', escalaPainel: ['SMI'],
    sub1: 'Invent\u00e1rio de Modos Esquem\u00e1ticos (Schema Mode Inventory) - vers\u00e3o curta - 118 itens, 14 modos',
    sub2: 'Young et al. (2007); vers\u00e3o curta: Lobbestael et al. (2010) | itens em portugu\u00eas: tradu\u00e7\u00e3o pr\u00f3pria',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_SMI = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, MODOS: MODOS, GRUPOS: GRUPOS, sintese: sintese};

})();
