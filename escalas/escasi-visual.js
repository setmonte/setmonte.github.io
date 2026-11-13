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

// escasi-visual.js - ESCASI (Escala de Ansiedade Infantil), instrumento EXPERIMENTAL, 30 itens, 1-4, 4 dominios (fisica, cognitiva, emocional, ambiental).
// Itens invertidos (afirmacoes positivas): 9,11,13,16,20,21,27,29 (valor = 5 - resposta). Maior pontuacao = mais ansiedade relatada.
// REMOVIDO: faixas de classificacao (45/60/75/90 pontos) que nao tinham fonte. Nao ha normas nem pontos de corte.
// d.respostas: chaves 1..30 com 1-4 (antes de inverter). versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS = [{"texto":"Sente o cora\u00e7\u00e3o bater r\u00e1pido sem motivo aparente","cat":"fisica","inv":false},{"texto":"Preocupa-se excessivamente com o futuro ou com coisas ruins que podem acontecer","cat":"cognitiva","inv":false},{"texto":"Fica irritado ou nervoso com facilidade","cat":"emocional","inv":false},{"texto":"Evita situa\u00e7\u00f5es sociais como festas ou atividades em grupo","cat":"ambiental","inv":false},{"texto":"Tem dores de barriga ou dores de cabe\u00e7a frequentes","cat":"fisica","inv":false},{"texto":"Tem pensamentos repetitivos que n\u00e3o consegue controlar","cat":"cognitiva","inv":false},{"texto":"Sente-se triste ou com vontade de chorar sem motivo claro","cat":"emocional","inv":false},{"texto":"Tem medo de ir \u00e0 escola ou de separar-se dos pais","cat":"ambiental","inv":false},{"texto":"Sente-se relaxado e tranquilo na maior parte do tempo","cat":"emocional","inv":true},{"texto":"Tem dificuldade para respirar ou sensa\u00e7\u00e3o de falta de ar","cat":"fisica","inv":false},{"texto":"Consegue se concentrar facilmente nas tarefas","cat":"cognitiva","inv":true},{"texto":"Sente medo de coisas espec\u00edficas (escuro, animais, altura)","cat":"emocional","inv":false},{"texto":"Adapta-se bem a mudan\u00e7as e situa\u00e7\u00f5es novas","cat":"ambiental","inv":true},{"texto":"Tem tremores ou sensa\u00e7\u00e3o de formigamento no corpo","cat":"fisica","inv":false},{"texto":"Tem dificuldade para tomar decis\u00f5es simples","cat":"cognitiva","inv":false},{"texto":"Sente-se confiante e seguro de si","cat":"emocional","inv":true},{"texto":"Reclama de barulhos ou ambientes muito movimentados","cat":"ambiental","inv":false},{"texto":"Tem problemas para dormir ou pesadelos frequentes","cat":"fisica","inv":false},{"texto":"Pensa que algo ruim vai acontecer com pessoas queridas","cat":"cognitiva","inv":false},{"texto":"Demonstra alegria e entusiasmo nas atividades di\u00e1rias","cat":"emocional","inv":true},{"texto":"Sente-se confort\u00e1vel em ambientes desconhecidos","cat":"ambiental","inv":true},{"texto":"Sente enjoo ou desconforto no est\u00f4mago com frequ\u00eancia","cat":"fisica","inv":false},{"texto":"Tem dificuldade para lembrar de coisas ou se concentrar","cat":"cognitiva","inv":false},{"texto":"Chora ou faz birra quando precisa enfrentar situa\u00e7\u00f5es novas","cat":"emocional","inv":false},{"texto":"Precisa de companhia constante dos pais ou cuidadores","cat":"ambiental","inv":false},{"texto":"Sente cansa\u00e7o ou fraqueza sem ter feito esfor\u00e7o f\u00edsico","cat":"fisica","inv":false},{"texto":"Consegue expressar seus sentimentos e pensamentos claramente","cat":"cognitiva","inv":true},{"texto":"Fica muito assustado com situa\u00e7\u00f5es do dia a dia","cat":"emocional","inv":false},{"texto":"Participa ativamente de brincadeiras e atividades com outras crian\u00e7as","cat":"ambiental","inv":true},{"texto":"Tem suor excessivo nas m\u00e3os ou no corpo","cat":"fisica","inv":false}];
var OPCOES = [{valor:1,texto:"Nunca"},{valor:2,texto:"Poucas vezes"},{valor:3,texto:"Muitas vezes"},{valor:4,texto:"Sempre"}];

var DOM = [
    {k: 'fisica', nome: 'Ansiedade f\u00edsica', cur: 'F\u00edsica', cor: '#e91e63', desc: 'Sintomas no corpo: cora\u00e7\u00e3o acelerado, dores, falta de ar, tremores, sono, enjoo, cansa\u00e7o e suor.'},
    {k: 'cognitiva', nome: 'Ansiedade cognitiva', cur: 'Cognitiva', cor: '#9c27b0', desc: 'Pensamentos: preocupa\u00e7\u00e3o com o futuro, pensamentos repetitivos, dificuldade para decidir, concentrar-se e lembrar.'},
    {k: 'emocional', nome: 'Ansiedade emocional', cur: 'Emocional', cor: '#3f51b5', desc: 'Emo\u00e7\u00f5es: irrita\u00e7\u00e3o, tristeza, medos espec\u00edficos, choro, susto e pouca tranquilidade, confian\u00e7a ou alegria.'},
    {k: 'ambiental', nome: 'Ansiedade ambiental', cur: 'Ambiental', cor: '#00897b', desc: 'Rea\u00e7\u00e3o ao ambiente e \u00e0s pessoas: evitar situa\u00e7\u00f5es sociais, medo da escola ou de separar-se dos pais, mudan\u00e7as e lugares novos.'}
];
var COR = '#6a1b9a';
var REFS = [
    'AMERICAN PSYCHIATRIC ASSOCIATION. Manual diagn\u00f3stico e estat\u00edstico de transtornos mentais: DSM-5-TR. Porto Alegre: Artmed, 2023.'
];
var AVISO = 'A ESCASI \u00e9 um instrumento experimental: os itens foram elaborados a partir de artigos sobre ansiedade infantil e dos crit\u00e9rios gerais do DSM-5-TR, sem estudo de validade, sem normas e sem pontos de corte. Por isso este relat\u00f3rio mostra a pontua\u00e7\u00e3o e o perfil por \u00e1rea, mas n\u00e3o classifica o n\u00edvel de ansiedade. Os quatro grupos (f\u00edsica, cognitiva, emocional e ambiental) s\u00e3o uma organiza\u00e7\u00e3o pr\u00e1tica dos itens, n\u00e3o dom\u00ednios confirmados por pesquisa. N\u00e3o \u00e9 diagn\u00f3stico de transtorno de ansiedade e nenhum instrumento isolado descreve a crian\u00e7a por inteiro: o resultado deve ser interpretado por profissional qualificado, junto com a entrevista, a observa\u00e7\u00e3o e outras fontes (pais, escola).';
var N = ITENS.length;
function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function calcular(resp, ctx) {
    if (!resp) throw new Error('ESCASI: respostas incompletas');
    var r = {v: {}, p: {}, d: {}, ctx: ctx || {}, total: 0}, i;
    DOM.forEach(function (d) { r.d[d.k] = {soma: 0, n: 0}; });
    for (i = 1; i <= N; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 4)) throw new Error('ESCASI: resposta invalida no item ' + i);
        r.v[i] = x;
        var it = ITENS[i - 1], pt = it.inv ? 5 - x : x;
        r.p[i] = pt; r.d[it.cat].soma += pt; r.d[it.cat].n++; r.total += pt;
    }
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return 'Escore total ' + r.total + ' (de ' + N + ' a ' + (N * 4) + '); sem faixas de classifica\u00e7\u00e3o'; }
function dadosPainel(r) {
    var o = {};
    DOM.forEach(function (d) { var s = r.d[d.k]; o[d.cur] = {pontuacao: s.soma, max: s.n * 4, media: Math.round(s.soma / s.n * 100) / 100, classificacao: 'Bruto ' + s.soma + '/' + (s.n * 4)}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= N; i++) o[i] = r.v[i]; return o; }
function blocks(r) {
    var b = [], c = r.ctx || {}, quem = [];
    if (c.respondente) quem.push('Respondente: ' + c.respondente);
    if (c.convivio) quem.push('Conv\u00edvio com a crian\u00e7a: ' + c.convivio);
    b.push({t: 'hero', fundo: '#f3e5f5', borda: COR, cor: '#4a148c', titulo: 'Escore total: ' + r.total + ' (de ' + N + ' a ' + (N * 4) + ')', sub: 'Instrumento experimental, sem normas nem pontos de corte: o relat\u00f3rio mostra o perfil, sem classificar o n\u00edvel de ansiedade.'});
    b.push({t: 'cards', itens: [{rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de ' + N + ' a ' + (N * 4), cor: COR}].concat(DOM.map(function (d) { var s = r.d[d.k]; return {rot: d.cur.toUpperCase(), valor: s.soma + ' / ' + (s.n * 4), de: s.n + ' itens', cor: d.cor}; }))});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a ESCASI mostra', x: 'Como a crian\u00e7a (com apoio, ou o adulto que a conhece) descreve 30 situa\u00e7\u00f5es ligadas \u00e0 ansiedade, em quatro \u00e1reas: corpo, pensamentos, emo\u00e7\u00f5es e ambiente.'},
        {t: 'Como a pontua\u00e7\u00e3o \u00e9 feita', x: 'Cada resposta vale de 1 (nunca) a 4 (sempre). Oito afirma\u00e7\u00f5es descrevem o oposto da ansiedade (itens 9, 11, 13, 16, 20, 21, 27 e 29, por exemplo "Sente-se relaxado e tranquilo") e s\u00e3o recodificadas (valor = 5 - resposta). Assim, quanto maior a soma, mais ansiedade \u00e9 relatada.'},
        {t: 'Por que n\u00e3o h\u00e1 faixas de classifica\u00e7\u00e3o', x: 'N\u00e3o existem estudos que digam a partir de quantos pontos a ansiedade \u00e9 leve, moderada ou elevada. Por isso o relat\u00f3rio mostra s\u00f3 as pontua\u00e7\u00f5es e a posi\u00e7\u00e3o de cada \u00e1rea entre o m\u00ednimo e o m\u00e1ximo poss\u00edveis.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o compara a crian\u00e7a com outras da mesma idade. \u00c9 um registro descritivo para apoiar a conversa cl\u00ednica.'}
    ].concat(quem.length ? [{t: 'Quem respondeu', x: quem.join(' | ')}] : [])});
    b.push({t: 'barras', titulo: 'Perfil por \u00e1rea', nota: 'A agulha mostra a posi\u00e7\u00e3o entre o m\u00ednimo (esquerda) e o m\u00e1ximo (direita) poss\u00edveis de cada \u00e1rea. As cores s\u00f3 marcam a progress\u00e3o, n\u00e3o indicam n\u00edvel.', itens: DOM.map(function (d) {
        var s = r.d[d.k], mx = s.n * 4, mn = s.n;
        return {rot: d.nome + ' (' + s.n + ' itens)', txt: s.soma + ' de ' + mx + ' pontos (m\u00ednimo ' + mn + ') | m\u00e9dia por item ' + fmt(s.soma / s.n), pct: (s.soma - mn) / (mx - mn) * 100, cor: d.cor};
    })});
    b.push({t: 'textos', titulo: 'O que cada \u00e1rea re\u00fane', itens: DOM.map(function (d) { return {t: d.nome + ' - ' + r.d[d.k].n + ' itens', x: d.desc}; })});
    var linhas = ITENS.map(function (it, i) { var n = i + 1, d = DOM.filter(function (x) { return x.k === it.cat; })[0]; return {c: [String(n), d.cur, it.texto, OPCOES[r.v[n] - 1].texto + (it.inv ? ' (inv.)' : ''), String(r.p[n])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: '\u00c1rea', w: 22, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 92, al: 'l'}, {h: 'Resposta', w: 38, al: 'c'}, {h: 'Pontos', w: 16, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try {
        if (d.versaoEscala !== 2) return null;
        return calcular(d.respostas, {respondente: d.respondente || '', convivio: d.convivio || ''});
    } catch (e) { return null; }
}
var base = symMake({
    ponteiro: true,
    id: 'escasi', nome: 'ESCASI', cor: COR, cor2: '#4a148c', escalaPainel: ['ESCASI'],
    sub1: 'Escala de Ansiedade Infantil (instrumento experimental) - 30 itens',
    sub2: 'Elaborada a partir de artigos sobre ansiedade infantil e do DSM-5-TR; sem valida\u00e7\u00e3o',
    dadosExtra: function (r) { var o = []; if (r.ctx && r.ctx.respondente) o.push('Respondente: ' + r.ctx.respondente); if (r.ctx && r.ctx.convivio) o.push('Conv\u00edvio: ' + r.ctx.convivio); return o; },
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_ESCASI = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, DOM: DOM};

})();
