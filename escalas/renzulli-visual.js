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

// renzulli-visual.js - Escalas de Renzulli (SRBCSS-R, Renzulli et al., 2013), 14 escalas independentes, 126 itens, 6 opcoes com pesos 1-6.
// Itens: traducao de Virgolim (2005). Pontuacao (edicao 2013): valor da resposta x peso = valor; pontuacao da escala = soma. NAO ha total geral
// (os autores dizem que as escalas medem conjuntos diferentes de comportamentos e nao devem ser somadas) e nao ha normas nacionais.
// Uma escala so e pontuada se TODOS os seus itens foram respondidos; a pessoa pode preencher so algumas escalas.
// d.respostas: chaves 1..126 (numero global do item) com 1-6, so dos itens respondidos. versaoEscala:2 (o registro antigo tinha 40 itens que nao eram da SRBCSS-R).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ESC = [{"k":"Aprendizagem","nome":"Aprendizagem","cor":"#1565c0","ini":0,"n":11},{"k":"Criatividade","nome":"Criatividade","cor":"#ef6c00","ini":11,"n":9},{"k":"Motivacao","nome":"Motiva\u00e7\u00e3o","cor":"#c62828","ini":20,"n":11},{"k":"Lideranca","nome":"Lideran\u00e7a","cor":"#2e7d32","ini":31,"n":7},{"k":"Artistica","nome":"Art\u00edstica","cor":"#ad1457","ini":38,"n":11},{"k":"Musical","nome":"Musical","cor":"#6a1b9a","ini":49,"n":7},{"k":"Dramatica","nome":"Dram\u00e1tica","cor":"#00838f","ini":56,"n":10},{"k":"ComPrecisao","nome":"Comunica\u00e7\u00e3o (Precis\u00e3o)","cor":"#455a64","ini":66,"n":11},{"k":"ComExpressividade","nome":"Comunica\u00e7\u00e3o (Expressividade)","cor":"#5d4037","ini":77,"n":4},{"k":"Planejamento","nome":"Planejamento","cor":"#37474f","ini":81,"n":15},{"k":"Matematica","nome":"Matem\u00e1tica","cor":"#1b5e20","ini":96,"n":10},{"k":"Leitura","nome":"Leitura","cor":"#827717","ini":106,"n":6},{"k":"Tecnologia","nome":"Tecnologia","cor":"#0277bd","ini":112,"n":7},{"k":"Ciencias","nome":"Ci\u00eancias","cor":"#00695c","ini":119,"n":7}];
var ITENS = [{"esc":"Aprendizagem","n":1,"texto":"Vocabul\u00e1rio avan\u00e7ado para sua idade ou s\u00e9rie."},{"esc":"Aprendizagem","n":2,"texto":"Habilidade de fazer generaliza\u00e7\u00f5es sobre eventos, pessoas e coisas."},{"esc":"Aprendizagem","n":3,"texto":"Uma grande bagagem de informa\u00e7\u00f5es sobre um t\u00f3pico espec\u00edfico."},{"esc":"Aprendizagem","n":4,"texto":"Habilidade de entender princ\u00edpios n\u00e3o diretamente observados."},{"esc":"Aprendizagem","n":5,"texto":"Perspic\u00e1cia em perceber rela\u00e7\u00f5es de causa e efeito."},{"esc":"Aprendizagem","n":6,"texto":"Entendimento de material mais complicado atrav\u00e9s de racioc\u00ednio anal\u00edtico."},{"esc":"Aprendizagem","n":7,"texto":"Uma grande bagagem de informa\u00e7\u00f5es sobre uma variedade de t\u00f3picos."},{"esc":"Aprendizagem","n":8,"texto":"Habilidade de lidar com abstra\u00e7\u00f5es."},{"esc":"Aprendizagem","n":9,"texto":"Facilidade para lembrar informa\u00e7\u00f5es."},{"esc":"Aprendizagem","n":10,"texto":"Habilidade de fazer observa\u00e7\u00f5es perspicazes e sutis."},{"esc":"Aprendizagem","n":11,"texto":"Habilidade de transferir aprendizagens de uma situa\u00e7\u00e3o para outra."},{"esc":"Criatividade","n":1,"texto":"Habilidade de pensamento imaginativo."},{"esc":"Criatividade","n":2,"texto":"Senso de humor."},{"esc":"Criatividade","n":3,"texto":"Habilidade de produzir respostas incomuns, \u00fanicas ou inteligentes."},{"esc":"Criatividade","n":4,"texto":"Esp\u00edrito de aventura ou disposi\u00e7\u00e3o para correr riscos."},{"esc":"Criatividade","n":5,"texto":"Habilidade de gerar um grande n\u00famero de ideias ou solu\u00e7\u00f5es para problemas ou quest\u00f5es."},{"esc":"Criatividade","n":6,"texto":"Tend\u00eancia em ver humor em situa\u00e7\u00f5es que n\u00e3o parecem humor\u00edsticas para os outros."},{"esc":"Criatividade","n":7,"texto":"Habilidade de adaptar, melhorar ou modificar objetos ou ideias."},{"esc":"Criatividade","n":8,"texto":"Atitude de brincadeira intelectual, disposi\u00e7\u00e3o para fantasiar e manipular ideias."},{"esc":"Criatividade","n":9,"texto":"Atitude n\u00e3o conformista, n\u00e3o temendo ser diferente."},{"esc":"Motivacao","n":1,"texto":"Habilidade de se concentrar intencionalmente em um t\u00f3pico por um longo per\u00edodo de tempo."},{"esc":"Motivacao","n":2,"texto":"Comportamento que requer pouca orienta\u00e7\u00e3o dos professores."},{"esc":"Motivacao","n":3,"texto":"Interesse constante por certos t\u00f3picos ou problemas."},{"esc":"Motivacao","n":4,"texto":"Obstina\u00e7\u00e3o em procurar informa\u00e7\u00f5es sobre t\u00f3picos do seu interesse."},{"esc":"Motivacao","n":5,"texto":"Persist\u00eancia em seu trabalho escolar, mesmo quando ocorrem contratempos."},{"esc":"Motivacao","n":6,"texto":"Prefer\u00eancia por situa\u00e7\u00f5es nas quais possa ter responsabilidade pessoal sobre o produto de seus esfor\u00e7os."},{"esc":"Motivacao","n":7,"texto":"Persist\u00eancia, indo at\u00e9 o fim quando interessado em um t\u00f3pico ou problema."},{"esc":"Motivacao","n":8,"texto":"Envolvimento intenso quando trabalha certos t\u00f3picos ou problemas."},{"esc":"Motivacao","n":9,"texto":"Compromisso com projetos de longa dura\u00e7\u00e3o, quando interessado em um t\u00f3pico."},{"esc":"Motivacao","n":10,"texto":"Persist\u00eancia quando busca atingir um objetivo."},{"esc":"Motivacao","n":11,"texto":"Pouca necessidade de motiva\u00e7\u00e3o externa para finalizar um trabalho que inicialmente se mostrou estimulante."},{"esc":"Lideranca","n":1,"texto":"Comportamento respons\u00e1vel; pode-se contar com ele para terminar atividades ou projetos que come\u00e7ou."},{"esc":"Lideranca","n":2,"texto":"Tend\u00eancia a ser respeitado pelos colegas."},{"esc":"Lideranca","n":3,"texto":"Habilidade de articular ideias e de se comunicar bem com os outros."},{"esc":"Lideranca","n":4,"texto":"Autoconfian\u00e7a quando interage com colegas da sua idade."},{"esc":"Lideranca","n":5,"texto":"Habilidade de organizar e trazer estrutura a coisas, pessoas e situa\u00e7\u00f5es."},{"esc":"Lideranca","n":6,"texto":"Comportamento cooperativo quando trabalha com os outros."},{"esc":"Lideranca","n":7,"texto":"Tend\u00eancia a dirigir as atividades quando est\u00e1 envolvido com outras pessoas."},{"esc":"Artistica","n":1,"texto":"Gosta de participar de atividades de arte; \u00e9 \u00e1vido em expressar suas ideias visualmente."},{"esc":"Artistica","n":2,"texto":"Incorpora grande n\u00famero de elementos em seus trabalhos de arte; varia o tema e o conte\u00fado dos trabalhos."},{"esc":"Artistica","n":3,"texto":"Chega a solu\u00e7\u00f5es \u00fanicas e n\u00e3o convencionais, a problemas art\u00edsticos ao inv\u00e9s de solu\u00e7\u00f5es tradicionais e convencionais."},{"esc":"Artistica","n":4,"texto":"Se concentra por per\u00edodos longos de tempo em projetos de arte."},{"esc":"Artistica","n":5,"texto":"Gosta de experimentar meios diferentes; experimenta usando uma variedade de materiais e t\u00e9cnicas."},{"esc":"Artistica","n":6,"texto":"Tende a selecionar a arte como meio de express\u00e3o para atividades livres ou projetos de sala de aula."},{"esc":"Artistica","n":7,"texto":"\u00c9 particularmente sens\u00edvel ao ambiente; \u00e9 um observador perspicaz, percebe o incomum, que pode estar sendo negligenciado pelos outros."},{"esc":"Artistica","n":8,"texto":"Produz equil\u00edbrio e ordem em seu trabalho de arte."},{"esc":"Artistica","n":9,"texto":"\u00c9 cr\u00edtico de seu pr\u00f3prio trabalho; estabelece altos padr\u00f5es de qualidade; frequentemente refaz uma cria\u00e7\u00e3o para poder refin\u00e1-la."},{"esc":"Artistica","n":10,"texto":"Demonstra um interesse no trabalho de outros alunos, passa tempo estudando e discutindo o trabalho deles."},{"esc":"Artistica","n":11,"texto":"Elabora as ideias de outras pessoas, usa estas ideias como um \"trampolim\", ao inv\u00e9s de copi\u00e1-las."},{"esc":"Musical","n":1,"texto":"Demonstra um interesse cont\u00ednuo em m\u00fasica, procura oportunidades para ouvir e criar m\u00fasica."},{"esc":"Musical","n":2,"texto":"Percebe finas diferen\u00e7as em tom musical (intensidade, sonoridade, timbre, dura\u00e7\u00e3o)."},{"esc":"Musical","n":3,"texto":"Facilmente se lembra de melodias e pode reproduzi-las com precis\u00e3o."},{"esc":"Musical","n":4,"texto":"Participa com entusiasmo de atividades musicais."},{"esc":"Musical","n":5,"texto":"Toca um instrumento musical (ou indica um forte desejo de tocar um instrumento)."},{"esc":"Musical","n":6,"texto":"\u00c9 sens\u00edvel ao ritmo da m\u00fasica; responde com movimentos corporais a mudan\u00e7as no tempo da m\u00fasica."},{"esc":"Musical","n":7,"texto":"Est\u00e1 atento e pode identificar uma variedade de sons ouvidos em um determinado movimento, \u00e9 sens\u00edvel a ru\u00eddos \"de fundo\", a cordas que acompanham uma melodia, aos sons diferentes de cantores ou instrumentistas em um desempenho."},{"esc":"Dramatica","n":1,"texto":"Gosta de se oferecer para participar em pe\u00e7as da escola."},{"esc":"Dramatica","n":2,"texto":"Conta hist\u00f3rias ou fala de suas experi\u00eancias com facilidade."},{"esc":"Dramatica","n":3,"texto":"Usa gestos e express\u00f5es faciais de forma efetiva para comunicar seus sentimentos."},{"esc":"Dramatica","n":4,"texto":"\u00c9 adepto \u00e0 dramatiza\u00e7\u00e3o e improvisa\u00e7\u00e3o, gostando de representar situa\u00e7\u00f5es que surgem na hora."},{"esc":"Dramatica","n":5,"texto":"Pode prontamente se identificar com os humores e motiva\u00e7\u00f5es dos personagens."},{"esc":"Dramatica","n":6,"texto":"Utiliza o corpo e a postura com facilidade para a sua idade."},{"esc":"Dramatica","n":7,"texto":"Cria pe\u00e7as originais ou inventa pe\u00e7as a partir de hist\u00f3rias."},{"esc":"Dramatica","n":8,"texto":"Comanda e prende a aten\u00e7\u00e3o de um grupo quando fala."},{"esc":"Dramatica","n":9,"texto":"Consegue evocar respostas emocionais dos ouvintes, pode conseguir que as pessoas riam, franzam as sobrancelhas, sintam-se tensos, etc."},{"esc":"Dramatica","n":10,"texto":"Consegue imitar outros, pode imitar o modo com que as pessoas falam, caminham, gesticulam."},{"esc":"ComPrecisao","n":1,"texto":"Fala e escreve de forma clara e vai diretamente ao ponto."},{"esc":"ComPrecisao","n":2,"texto":"Modifica e ajusta a express\u00e3o de ideias para uma m\u00e1xima recep\u00e7\u00e3o."},{"esc":"ComPrecisao","n":3,"texto":"\u00c9 capaz de revisar e modificar ideias de modo conciso, por\u00e9m retendo as ideias essenciais."},{"esc":"ComPrecisao","n":4,"texto":"Explica as coisas de forma clara e concisa."},{"esc":"ComPrecisao","n":5,"texto":"Usa palavras descritivas para adicionar cor, emo\u00e7\u00e3o e beleza no relato."},{"esc":"ComPrecisao","n":6,"texto":"Expressa os seus pensamentos e necessidades de forma clara e concisa."},{"esc":"ComPrecisao","n":7,"texto":"Encontra v\u00e1rios modos de expressar ideias, de forma a se fazer entender pelos outros."},{"esc":"ComPrecisao","n":8,"texto":"Consegue descrever coisas usando poucas palavras, mas de forma muito apropriada."},{"esc":"ComPrecisao","n":9,"texto":"\u00c9 capaz de expressar v\u00e1rias nuances de significado pelo uso de um grande estoque de sin\u00f4nimos."},{"esc":"ComPrecisao","n":10,"texto":"Pode expressar ideias em uma variedade de modos alternativos."},{"esc":"ComPrecisao","n":11,"texto":"Sabe e pode usar muitas palavras bastante relacionadas em significado."},{"esc":"ComExpressividade","n":1,"texto":"Usa a voz expressivamente para transmitir ou aumentar o significado."},{"esc":"ComExpressividade","n":2,"texto":"Gosta de transmitir informa\u00e7\u00f5es n\u00e3o-verbalmente, usando gestos, express\u00f5es faciais, e \"linguagem corporal\"."},{"esc":"ComExpressividade","n":3,"texto":"\u00c9 um interessante contador de hist\u00f3rias."},{"esc":"ComExpressividade","n":4,"texto":"Usa figuras de linguagem v\u00edvidas e imaginativas, como trocadilhos e analogias."},{"esc":"Planejamento","n":1,"texto":"Determina quais informa\u00e7\u00f5es ou recursos s\u00e3o necess\u00e1rios para realizar uma tarefa."},{"esc":"Planejamento","n":2,"texto":"Compreende a rela\u00e7\u00e3o entre etapas espec\u00edficas e o processo como um todo."},{"esc":"Planejamento","n":3,"texto":"Permite tempo para executar todos os passos envolvidos em um processo."},{"esc":"Planejamento","n":4,"texto":"Prev\u00ea consequ\u00eancias ou efeitos de a\u00e7\u00f5es."},{"esc":"Planejamento","n":5,"texto":"Organiza bem o seu trabalho."},{"esc":"Planejamento","n":6,"texto":"Leva em conta detalhes necess\u00e1rios para atingir uma meta."},{"esc":"Planejamento","n":7,"texto":"\u00c9 bom em jogos de estrat\u00e9gia onde \u00e9 necess\u00e1rio se antecipar v\u00e1rios movimentos \u00e0 frente."},{"esc":"Planejamento","n":8,"texto":"Reconhece v\u00e1rios m\u00e9todos alternativos para se atingir uma meta."},{"esc":"Planejamento","n":9,"texto":"Pode localizar as \u00e1reas de dificuldade que poderiam surgir em um procedimento ou atividade."},{"esc":"Planejamento","n":10,"texto":"Organiza os passos de um projeto em uma ordem ou sequ\u00eancia de tempo apropriados."},{"esc":"Planejamento","n":11,"texto":"\u00c9 bom em dividir uma atividade em procedimentos menores, passo a passo."},{"esc":"Planejamento","n":12,"texto":"Estabelece prioridades quando organiza atividades."},{"esc":"Planejamento","n":13,"texto":"Demonstra ser consciente de limita\u00e7\u00f5es relativas a tempo, espa\u00e7o, materiais e habilidades quando trabalhando em grupo ou projetos individuais."},{"esc":"Planejamento","n":14,"texto":"Pode promover detalhes que contribuem ao desenvolvimento de um plano ou procedimento."},{"esc":"Planejamento","n":15,"texto":"V\u00ea modos alternativos de distribuir trabalho ou de nomear as pessoas para realizar uma tarefa."},{"esc":"Matematica","n":1,"texto":"\u00c9 \u00e1vido em resolver problemas matem\u00e1ticos que desafiam (um problema \u00e9 definido como uma tarefa e a solu\u00e7\u00e3o n\u00e3o \u00e9 conhecida previamente)."},{"esc":"Matematica","n":2,"texto":"Organiza dados e informa\u00e7\u00f5es para descobrir modelos matem\u00e1ticos."},{"esc":"Matematica","n":3,"texto":"Gosta de desafios com enigmas matem\u00e1ticos, jogos e problemas l\u00f3gicos."},{"esc":"Matematica","n":4,"texto":"Compreende novos conceitos matem\u00e1ticos e os processa mais facilmente que os outros estudantes."},{"esc":"Matematica","n":5,"texto":"Possui um jeito criativo de resolver problemas matem\u00e1ticos (incomum e divergente)."},{"esc":"Matematica","n":6,"texto":"Demonstra um forte senso num\u00e9rico (pequenos e grandes n\u00fameros, estimando-os mais f\u00e1cil e apropriadamente)."},{"esc":"Matematica","n":7,"texto":"Frequentemente soluciona problemas matem\u00e1ticos abstratamente, n\u00e3o necessitando de materiais (papel, l\u00e1pis, calculadora, etc.)."},{"esc":"Matematica","n":8,"texto":"Tem interesse em analisar a estrutura matem\u00e1tica do problema."},{"esc":"Matematica","n":9,"texto":"Quando est\u00e1 resolvendo um problema \u00e9 capaz de mudar as estrat\u00e9gias de resolu\u00e7\u00e3o facilmente, se apropriado ou necess\u00e1rio."},{"esc":"Matematica","n":10,"texto":"Regularmente utiliza uma variedade de representa\u00e7\u00f5es ao explicar conceitos matem\u00e1ticos (explica\u00e7\u00f5es escritas, ilustra\u00e7\u00f5es, gr\u00e1ficos, equa\u00e7\u00f5es, etc.)."},{"esc":"Leitura","n":1,"texto":"Busca envolver-se em atividades relacionadas \u00e0 leitura."},{"esc":"Leitura","n":2,"texto":"Aplica conceitos liter\u00e1rios aprendidos previamente em novas experi\u00eancias de leitura."},{"esc":"Leitura","n":3,"texto":"Focaliza-se na leitura por um longo per\u00edodo de tempo."},{"esc":"Leitura","n":4,"texto":"Busca material de leitura com n\u00edvel avan\u00e7ado."},{"esc":"Leitura","n":5,"texto":"Busca tenacidade (perseveran\u00e7a) quando \u00e9 proposto desafios de leitura."},{"esc":"Leitura","n":6,"texto":"Apresenta interesse em outro tipo de base de materiais liter\u00e1rios interessantes."},{"esc":"Tecnologia","n":1,"texto":"Demonstra v\u00e1rias aptid\u00f5es com a tecnologia."},{"esc":"Tecnologia","n":2,"texto":"Aprende sobre novas tecnologias sem treinamento formal."},{"esc":"Tecnologia","n":3,"texto":"Gasta seu tempo livre desenvolvendo suas habilidades com tecnologia."},{"esc":"Tecnologia","n":4,"texto":"Auxilia outras pessoas com problemas relacionados \u00e0 tecnologia."},{"esc":"Tecnologia","n":5,"texto":"Incorpora tecnologia no desenvolvimento de produtos, tarefas, apresenta\u00e7\u00f5es criativas."},{"esc":"Tecnologia","n":6,"texto":"Busca oportunidades para a tecnologia."},{"esc":"Tecnologia","n":7,"texto":"Demonstra habilidade com a tecnologia de forma mais intensa que os outros estudantes de sua idade."},{"esc":"Ciencias","n":1,"texto":"Demonstra curiosidade sobre os processos cient\u00edficos."},{"esc":"Ciencias","n":2,"texto":"Demonstra pensamentos (ideias, opini\u00f5es) criativos sobre assuntos cient\u00edficos."},{"esc":"Ciencias","n":3,"texto":"Demonstra entusiasmo nas discuss\u00f5es sobre as ci\u00eancias."},{"esc":"Ciencias","n":4,"texto":"\u00c9 curioso sobre o porqu\u00ea das coisas serem como s\u00e3o."},{"esc":"Ciencias","n":5,"texto":"L\u00ea sobre assuntos relacionados \u00e0 ci\u00eancia em seu tempo livre."},{"esc":"Ciencias","n":6,"texto":"Expressa interesse em projetos ou pesquisas cient\u00edficas."},{"esc":"Ciencias","n":7,"texto":"Expressa com clareza interpreta\u00e7\u00e3o de dados."}];
var OPCOES = [{"valor":1,"texto":"Nunca"},{"valor":2,"texto":"Muito raramente"},{"valor":3,"texto":"Raramente"},{"valor":4,"texto":"Ocasionalmente"},{"valor":5,"texto":"Frequentemente"},{"valor":6,"texto":"Sempre"}];

var COR = '#ff6b35';
var REFS = [
    'RENZULLI, J. S. et al. Scales for Rating the Behavioral Characteristics of Superior Students (Renzulli Scales): revised edition (SRBCSS-R). Waco, TX: Prufrock Press, 2013.',
    'RENZULLI, J. S. et al. Scales for Rating the Behavioral Characteristics of Superior Students: revised edition (SRBCSS-R). Mansfield Center, CT: Creative Learning Press, 2002. Traduzida por Virgolim, 2005.'
];
var AVISO = 'As Escalas de Renzulli registram a estimativa de um professor ou outro observador sobre o quanto o aluno mostra certos comportamentos. Elas n\u00e3o identificam, sozinhas, Altas Habilidades/Superdota\u00e7\u00e3o, n\u00e3o s\u00e3o um teste e n\u00e3o t\u00eam pontos de corte. Os autores informam que cada escala mede um conjunto diferente de comportamentos e que os pontos n\u00e3o devem ser somados em um total, e que n\u00e3o existem normas nacionais (se desejar, podem ser criadas normas locais, por escola e s\u00e9rie). Os itens em portugu\u00eas s\u00e3o a tradu\u00e7\u00e3o de Virgolim (2005) da edi\u00e7\u00e3o de 2002; este relat\u00f3rio usa a pontua\u00e7\u00e3o da edi\u00e7\u00e3o de 2013 (6 op\u00e7\u00f5es, pesos de 1 a 6). Interprete junto com o desempenho, outros instrumentos, a hist\u00f3ria e a observa\u00e7\u00e3o, por profissional qualificado.';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function calcular(resp, ctx) {
    if (!resp) throw new Error('Renzulli: respostas vazias');
    var r = {v: {}, esc: [], ctx: ctx || {}}, i, nCompletas = 0, nResp = 0;
    for (i = 1; i <= ITENS.length; i++) {
        if (resp[i] === undefined || resp[i] === null || resp[i] === '') continue;
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 6)) throw new Error('Renzulli: resposta invalida no item ' + i);
        r.v[i] = x; nResp++;
    }
    ESC.forEach(function (e, ix) {
        var c = 0, s = 0, j;
        for (j = 1; j <= e.n; j++) { var vv = r.v[e.ini + j]; if (vv) { c++; s += vv; } }
        var comp = (c === e.n);
        if (comp) nCompletas++;
        r.esc.push({k: e.k, nome: e.nome, cor: e.cor, ix: ix, n: e.n, ini: e.ini, resp: c, completa: comp, soma: comp ? s : null, min: e.n, max: e.n * 6, media: comp ? s / e.n : null});
    });
    if (nCompletas === 0) throw new Error('Renzulli: nenhuma escala completa');
    r.nCompletas = nCompletas; r.nResp = nResp;
    return r;
}
function escore(r) { return r.nCompletas; }
function classifGeral(r) { return r.nCompletas + ' de 14 escalas preenchidas (as escalas n\u00e3o s\u00e3o somadas em total)'; }
function dadosPainel(r) {
    var o = {};
    r.esc.forEach(function (e) { if (e.completa) o[e.nome] = {pontuacao: e.soma, max: e.max, media: Math.round(e.media * 100) / 100, classificacao: 'Bruto ' + e.soma + '/' + e.max + ' (' + e.n + ' itens)'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) { if (r.v[i]) o[i] = r.v[i]; } return o; }
function pct(e) { return (e.soma - e.min) / (e.max - e.min) * 100; }
function blocks(r) {
    var b = [], comp = r.esc.filter(function (e) { return e.completa; }), nao = r.esc.filter(function (e) { return !e.completa; });
    var resp = r.ctx && r.ctx.respondente ? r.ctx.respondente : '';
    b.push({t: 'hero', fundo: '#fff3e0', borda: COR, cor: '#bf360c', titulo: comp.length + ' de 14 escalas preenchidas', sub: 'Cada escala \u00e9 pontuada separadamente (soma de valores de 1 a 6). N\u00e3o existe pontua\u00e7\u00e3o total: os autores orientam n\u00e3o somar as escalas. N\u00e3o h\u00e1 normas nacionais.'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCALAS PREENCHIDAS', valor: String(comp.length), de: 'de 14', cor: COR},
        {rot: 'ITENS RESPONDIDOS', valor: String(r.nResp), de: 'de 126', cor: '#bf360c'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que as Escalas de Renzulli mostram', x: 'Quanto o professor (ou outro observador) v\u00ea, no aluno, comportamentos associados a habilidades superiores em 14 \u00e1reas: aprendizagem, criatividade, motiva\u00e7\u00e3o, lideran\u00e7a, artes, m\u00fasica, drama, comunica\u00e7\u00e3o (precis\u00e3o e expressividade), planejamento, matem\u00e1tica, leitura, tecnologia e ci\u00eancias.'},
        {t: 'Como a pontua\u00e7\u00e3o \u00e9 feita', x: 'Cada item recebe de 1 (nunca) a 6 (sempre). A pontua\u00e7\u00e3o de uma escala \u00e9 a soma das respostas dos seus itens; por isso o m\u00ednimo \u00e9 o n\u00famero de itens e o m\u00e1ximo \u00e9 seis vezes esse n\u00famero. Para comparar escalas de tamanhos diferentes, o relat\u00f3rio tamb\u00e9m mostra a m\u00e9dia por item (de 1 a 6).'},
        {t: 'Por que n\u00e3o h\u00e1 total nem faixas', x: 'Os autores explicam que as escalas medem conjuntos de comportamentos bem diferentes e que os pontos n\u00e3o devem ser somados; tamb\u00e9m n\u00e3o criaram normas nacionais. Por isso este relat\u00f3rio n\u00e3o diz se uma pontua\u00e7\u00e3o \u00e9 alta ou baixa: ele mostra o perfil do aluno, que deve ser lido junto com o desempenho e com outras fontes. Escolas podem construir normas locais.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o identifica Altas Habilidades/Superdota\u00e7\u00e3o e n\u00e3o \u00e9 diagn\u00f3stico. \u00c9 a estimativa de uma pessoa, que pode variar conforme o quanto ela convive com o aluno e o contexto.'}
    ].concat(resp ? [{t: 'Quem respondeu', x: resp}] : [])});
    b.push({t: 'barras', titulo: 'Perfil por escala', nota: 'A agulha mostra a posi\u00e7\u00e3o entre o m\u00ednimo (esquerda) e o m\u00e1ximo (direita) poss\u00edveis de cada escala. M\u00e9dia por item: 1 = nunca e 6 = sempre. As cores do medidor s\u00f3 marcam a progress\u00e3o, n\u00e3o indicam n\u00edvel.', itens: comp.map(function (e) {
        return {rot: e.nome + ' (' + e.n + ' itens)', txt: e.soma + ' de ' + e.max + ' pontos (m\u00ednimo ' + e.min + ') | m\u00e9dia por item ' + fmt(e.media), pct: pct(e), cor: e.cor};
    })});
    if (nao.length) {
        b.push({t: 'textos', titulo: 'Escalas n\u00e3o preenchidas', itens: [{t: nao.length + ' escala(s) fora do relat\u00f3rio', x: nao.map(function (e) { return e.nome; }).join('; ') + '.'}]});
    }
    var linhas = [];
    comp.forEach(function (e) {
        var j;
        for (j = 1; j <= e.n; j++) { var g = e.ini + j; linhas.push({c: [e.nome, String(j), ITENS[g - 1].texto, OPCOES[r.v[g] - 1].texto, String(r.v[g])]}); }
    });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: 'Escala', w: 30, al: 'l'}, {h: '#', w: 8, al: 'c'}, {h: 'Afirma\u00e7\u00e3o (O aluno demonstra...)', w: 94, al: 'l'}, {h: 'Resposta', w: 30, al: 'c'}, {h: 'Pontos', w: 18, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try {
        if (d.versaoEscala !== 2) return null;
        return calcular(d.respostas, {respondente: d.respondente || ''});
    } catch (e) { return null; }
}
var base = symMake({
    ponteiro: true,
    id: 'renzulli', nome: 'Renzulli', cor: COR, cor2: '#bf360c', escalaPainel: ['RENZULLI'],
    sub1: 'Escalas para Avalia\u00e7\u00e3o das Caracter\u00edsticas Comportamentais de Alunos com Habilidades Superiores (SRBCSS-R) - 126 itens, 14 escalas',
    sub2: 'Renzulli et al. (2013) | tradu\u00e7\u00e3o dos itens: Virgolim (2005)',
    dadosExtra: function (r) { return r.ctx && r.ctx.respondente ? ['Respondente: ' + r.ctx.respondente] : []; },
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_RENZULLI = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, ESC: ESC, OPCOES: OPCOES};

})();
