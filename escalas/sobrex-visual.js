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

// sobrex-visual.js - Questionario de Indicadores de Sobre-excitabilidade nas AH/SD para Pais e Professoras(es) (NEUMANN, 2022, Revista Cocar 17(35):1-20),
// adaptado de Daniels e Piechowski (2009). 68 indicadores em 5 tipos. Pontuacao (artigo): Nunca 0, As vezes 1, Frequentemente 3, Sempre 4; soma por tipo.
// Niveis (Tabela 1 do artigo): Baixo / Medio / Alto / Muito alto (faixas do maximo de cada tipo). "Limitrofe": primeiro ou ultimo ponto de uma faixa.
// Resposta "Nao sei" (traco no formulario original): nao pontua. CORRECOES: o site chamava o instrumento de OEQ-II, usava 5 opcoes (Nada..Extremamente) e classificava por media.
// d.respostas: chaves 1..68 (ordem imaginativa, emocional, intelectual, psicomotora, sensorial) com 1-5 (1=N, 2=A, 3=F, 4=S, 5=Nao sei). versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var TIPOS = [{"k":"imaginativa","nome":"Imaginativa","max":68,"niv":[17,34,51]},{"k":"emocional","nome":"Emocional","max":64,"niv":[16,32,48]},{"k":"intelectual","nome":"Intelectual","max":64,"niv":[16,32,48]},{"k":"psicomotora","nome":"Psicomotora","max":40,"niv":[10,20,30]},{"k":"sensorial","nome":"Sensorial","max":36,"niv":[9,18,27]}];
var ITENS = [{"tipo":"imaginativa","n":1,"texto":"Ela(e) mostra facilidade em associar imagens e impress\u00f5es vindas dos sentidos (vis\u00e3o, audi\u00e7\u00e3o, tato, paladar e/ou olfato)."},{"tipo":"imaginativa","n":2,"texto":"Utiliza e/ou gosta de met\u00e1foras para expressar ideias."},{"tipo":"imaginativa","n":3,"texto":"Gosta de inventar e/ou construir coisas com os materiais que tem a sua volta."},{"tipo":"imaginativa","n":4,"texto":"Mostra elevada capacidade de enxergar detalhes que outras pessoas, comumente, n\u00e3o percebem."},{"tipo":"imaginativa","n":5,"texto":"Tem sonhos, sejam agrad\u00e1veis ou pesadelos, com muitos detalhes."},{"tipo":"imaginativa","n":6,"texto":"Tem muitas imagina\u00e7\u00f5es a partir de elementos da realidade a sua volta."},{"tipo":"imaginativa","n":7,"texto":"Tem muitas ideias, mas nem sempre consegue colocar em pr\u00e1tica."},{"tipo":"imaginativa","n":8,"texto":"Come\u00e7a uma atividade ou projeto, mas n\u00e3o conclui at\u00e9 o final. Larga pela metade para logo come\u00e7ar outro que tamb\u00e9m n\u00e3o conclui."},{"tipo":"imaginativa","n":9,"texto":"Distrai-se com facilidade com qualquer coisa ao seu redor, pois quase qualquer coisa estimula a imagina\u00e7\u00e3o."},{"tipo":"imaginativa","n":10,"texto":"Se pudesse, gostaria de ficar mais no mundo da imagina\u00e7\u00e3o que no mundo real."},{"tipo":"imaginativa","n":11,"texto":"Em algumas situa\u00e7\u00f5es, mostra-se resistente a mudan\u00e7as."},{"tipo":"imaginativa","n":12,"texto":"Vivencia intensamente suas imagina\u00e7\u00f5es (por exemplo, ao contar uma est\u00f3ria, \u00e9 como se estivesse nela vivendo cada momento)."},{"tipo":"imaginativa","n":13,"texto":"Prefere fic\u00e7\u00f5es (como Senhor dos An\u00e9is, Harry Potter etc) e/ou contos de fadas, f\u00e1bulas, hist\u00f3rias em quadrinhos etc."},{"tipo":"imaginativa","n":14,"texto":"Gosta de inventar/criar est\u00f3rias, fazer desenhos ou qualquer tipo de arte."},{"tipo":"imaginativa","n":15,"texto":"Faz muitos planos e tem muitas ideias."},{"tipo":"imaginativa","n":16,"texto":"\u00c9 intolerante ao t\u00e9dio."},{"tipo":"imaginativa","n":17,"texto":"Tem necessidade de atividades novas e/ou desafiadoras todo ou a maior parte do tempo."},{"tipo":"emocional","n":1,"texto":"Mostra que tem consci\u00eancia de suas emo\u00e7\u00f5es e estados internos."},{"tipo":"emocional","n":2,"texto":"Tem intenso apego e mostra dificuldade em desapegar (por ex.: objetos, pessoas, animais, lugares, etc)."},{"tipo":"emocional","n":3,"texto":"\u00c9 muito autocr\u00edtica(o)."},{"tipo":"emocional","n":4,"texto":"Mostra elevada intensidade em alguns ou todos esses sentimentos: inibi\u00e7\u00e3o, entusiasmo, euforia, orgulho, culpa, vergonha, ansiedade, raiva e medo."},{"tipo":"emocional","n":5,"texto":"Tem estados de nervosismo, dor de est\u00f4mago, tristeza profunda, ins\u00f4nia, palpita\u00e7\u00e3o e/ou suor excessivo."},{"tipo":"emocional","n":6,"texto":"Tem o sono agitado e/ou dorme poucas horas."},{"tipo":"emocional","n":7,"texto":"Irrita-se intensamente quando uma situa\u00e7\u00e3o gera alguma frustra\u00e7\u00e3o e/ou quando contrariada(o)."},{"tipo":"emocional","n":8,"texto":"A raiva ou outra emo\u00e7\u00e3o pode ser tanta que, em alguns momentos, \u201cescapa\u201d do controle e leva a crises emocionais."},{"tipo":"emocional","n":9,"texto":"Mostra-se emp\u00e1tica(o) com o sofrimento em rela\u00e7\u00e3o a pessoas e/ou \u00e0 natureza (por ex.: animais, plantas, etc)."},{"tipo":"emocional","n":10,"texto":"Chora com facilidade por situa\u00e7\u00f5es que comumente n\u00e3o comovem outras pessoas de sua idade ou mesmo as mais velhas."},{"tipo":"emocional","n":11,"texto":"Sente-se profundamente decepcionada(o) quando n\u00e3o \u00e9 correspondida(o) em suas emo\u00e7\u00f5es na rela\u00e7\u00e3o com os outros."},{"tipo":"emocional","n":12,"texto":"Busca estabelecer intenso v\u00ednculo afetivo com outras pessoas."},{"tipo":"emocional","n":13,"texto":"Mostra dificuldade de adapta\u00e7\u00e3o a ambientes novos."},{"tipo":"emocional","n":14,"texto":"Sente responsabilidade pelos outros (por ajudar, cuidar, proteger, etc)."},{"tipo":"emocional","n":15,"texto":"Mostra profunda sensibilidade \u00e0s diferentes situa\u00e7\u00f5es do cotidiano."},{"tipo":"emocional","n":16,"texto":"Identifica-se com as emo\u00e7\u00f5es e sentimentos dos outros, principalmente o sofrimento."},{"tipo":"intelectual","n":1,"texto":"Mostra intensa atividade mental (pensamentos e ideias incomuns para a idade)."},{"tipo":"intelectual","n":2,"texto":"Mostra elevada curiosidade em assuntos de seu interesse."},{"tipo":"intelectual","n":3,"texto":"Mostra grande concentra\u00e7\u00e3o no que gosta de fazer."},{"tipo":"intelectual","n":4,"texto":"Fala de lembran\u00e7as e/ou ideias em detalhes."},{"tipo":"intelectual","n":5,"texto":"\u00c9 observadora(or) em detalhes naquilo que comumente os outros n\u00e3o percebem."},{"tipo":"intelectual","n":6,"texto":"Faz planejamentos detalhados de atividades de seu interesse."},{"tipo":"intelectual","n":7,"texto":"Constr\u00f3i e/ou compreende ideias inesperadas para sua idade."},{"tipo":"intelectual","n":8,"texto":"Fala e pensa sobre suas pr\u00f3prias ideias com frequ\u00eancia."},{"tipo":"intelectual","n":9,"texto":"Fala e pensa sobre as ideias de outras pessoas com frequ\u00eancia (coisas que ouviu algu\u00e9m dizer, que viu num filme, leu num livro, etc)."},{"tipo":"intelectual","n":10,"texto":"Tende a preferir a ficar mais consigo mesma(o) com seus pr\u00f3prios pensamentos."},{"tipo":"intelectual","n":11,"texto":"\u00c9 questionadora(or)."},{"tipo":"intelectual","n":12,"texto":"Tem desejo intenso por conhecimentos de uma \u00e1rea espec\u00edfica (ou v\u00e1rias \u00e1reas)."},{"tipo":"intelectual","n":13,"texto":"Busca saber sempre o porqu\u00ea das coisas, como elas s\u00e3o ou funcionam."},{"tipo":"intelectual","n":14,"texto":"Mostra compreens\u00e3o de ideias inesperadas para sua idade."},{"tipo":"intelectual","n":15,"texto":"Tem preocupa\u00e7\u00f5es inesperadas para sua idade (por ex.: quest\u00f5es \u00e9ticas, morais, pol\u00edticas, ambientais, etc)."},{"tipo":"intelectual","n":16,"texto":"Prefere atividades que exigem racioc\u00ednio l\u00f3gico (por ex.: jogos, brincadeiras, etc)."},{"tipo":"psicomotora","n":1,"texto":"Gosta de atividade f\u00edsica intensa."},{"tipo":"psicomotora","n":2,"texto":"\u00c9 competitiva(o) mesmo que o ambiente social n\u00e3o estimule essa conduta."},{"tipo":"psicomotora","n":3,"texto":"Fala e/ou age sem pensar nas consequ\u00eancias, mostra-se impulsiva(o)."},{"tipo":"psicomotora","n":4,"texto":"Tem dificuldade em ficar quieta(o), mostra-se agitada(o)."},{"tipo":"psicomotora","n":5,"texto":"Fala r\u00e1pido, faz muitas coisas uma na sequ\u00eancia da outra, tem muita energia."},{"tipo":"psicomotora","n":6,"texto":"Prefere esportes e/ou jogos que gaste bastante energia f\u00edsica."},{"tipo":"psicomotora","n":7,"texto":"Mostra vontade intensa para fazer coisas, para agir."},{"tipo":"psicomotora","n":8,"texto":"Ficar parada(o) gera irrita\u00e7\u00e3o."},{"tipo":"psicomotora","n":9,"texto":"Tem necessidade de atividades f\u00edsicas novas e/ou desafiadoras todo ou a maior parte do tempo."},{"tipo":"psicomotora","n":10,"texto":"Envolve-se em brigas, conflitos (\u00e0s vezes, tamb\u00e9m, para defender amigos ou os mais indefesos)."},{"tipo":"sensorial","n":1,"texto":"Apresenta intensos estados de ansiedade (que pode se mostrar como medos e preocupa\u00e7\u00f5es)."},{"tipo":"sensorial","n":2,"texto":"Mostra sensibilidade \u00e0s coisas belas, \u00e0 est\u00e9tica de lugares, de objetos, de plantas, etc."},{"tipo":"sensorial","n":3,"texto":"Detalhes relacionados \u00e0s coisas belas s\u00e3o frequentemente notados e h\u00e1 uma satisfa\u00e7\u00e3o em observ\u00e1-los."},{"tipo":"sensorial","n":4,"texto":"Tem os sentidos mais agu\u00e7ados (por ex.: fala de detalhes do gosto dos alimentos, percebe nuances dos sons, tem sensibilidade no tato, nos cheiros, etc)."},{"tipo":"sensorial","n":5,"texto":"Mostra sensibilidade a certos tipos de luz, sons, gostos, texturas e/ou cheiros ao ponto de o inc\u00f4modo ser tanto que gera profunda irrita\u00e7\u00e3o."},{"tipo":"sensorial","n":6,"texto":"Apresenta necessidade de ser percebido(a) e de receber aten\u00e7\u00e3o dos outros de modo mais intenso que outras crian\u00e7as de sua idade."},{"tipo":"sensorial","n":7,"texto":"Gosta e busca espontaneamente contato f\u00edsico com pessoas (por ex.: abra\u00e7os, beijos, toques, etc)."},{"tipo":"sensorial","n":8,"texto":"Prefere ter a companhia de algu\u00e9m a ficar sozinha(o)."},{"tipo":"sensorial","n":9,"texto":"Busca experi\u00eancias prazerosas e confort\u00e1veis."}];
var OPCOES = [{valor:1,texto:"Nunca",pt:0},{valor:2,texto:"\u00c0s vezes",pt:1},{valor:3,texto:"Frequentemente",pt:3},{valor:4,texto:"Sempre",pt:4},{valor:5,texto:"N\u00e3o sei",pt:0}];

var COR = '#e65100';
var NIVEIS = ['Baixo', 'M\u00e9dio', 'Alto', 'Muito alto'];
var COR_T = {imaginativa: '#6a1b9a', emocional: '#c62828', intelectual: '#1565c0', psicomotora: '#2e7d32', sensorial: '#ef6c00'};
var DESC = {
    imaginativa: 'Imagina\u00e7\u00e3o v\u00edvida e uso de met\u00e1foras, ideias e planos em abund\u00e2ncia, gosto por criar, sonhos detalhados e dificuldade com o t\u00e9dio.',
    emocional: 'Emo\u00e7\u00f5es intensas, apego forte, empatia e sensibilidade, autocr\u00edtica e rea\u00e7\u00f5es do corpo a emo\u00e7\u00f5es (sono, est\u00f4mago, choro).',
    intelectual: 'Atividade mental intensa, curiosidade, concentra\u00e7\u00e3o, perguntas, desejo de conhecer e preocupa\u00e7\u00f5es incomuns para a idade.',
    psicomotora: 'Muita energia e vontade de agir: atividade f\u00edsica intensa, agita\u00e7\u00e3o, rapidez, impulsividade e dificuldade de ficar parado.',
    sensorial: 'Sentidos agu\u00e7ados e sensibilidade a luz, sons, gostos, texturas e cheiros; apre\u00e7o pela beleza, busca de contato e de experi\u00eancias prazerosas.'
};
var REFS = [
    'NEUMANN, P. A sobre-excitabilidade e a educa\u00e7\u00e3o nas altas habilidades ou superdota\u00e7\u00e3o. Revista Cocar, Bel\u00e9m, v. 17, n. 35, p. 1-20, 2022. ISSN 2237-0315.',
    'DANIELS, S.; PIECHOWSKI, M. M. (Ed.). Living with intensity: understanding the sensitivity, excitability, and emotional development of gifted children, adolescents, and adults. Scottsdale, AZ: Great Potential Press, 2009.'
];
var AVISO = 'Este question\u00e1rio descreve indicadores de sobre-excitabilidade (intensidades da experi\u00eancia, segundo a teoria de D\u0105browski) observados por pais ou professores. Os n\u00edveis Baixo, M\u00e9dio, Alto e Muito alto foram definidos pela autora como faixas do valor m\u00e1ximo de cada tipo e usados em um estudo com 25 fam\u00edlias e 10 profissionais; n\u00e3o existem normas nem estudo de validade psicom\u00e9trica. Os pontos n\u00e3o somam em um total e n\u00e3o h\u00e1 ponto de corte para identificar Altas Habilidades/Superdota\u00e7\u00e3o. Itens marcados "n\u00e3o sei" n\u00e3o pontuam e podem diminuir a pontua\u00e7\u00e3o. N\u00e3o \u00e9 diagn\u00f3stico: o resultado deve ser interpretado por profissional qualificado, junto com a entrevista, a observa\u00e7\u00e3o e outras fontes (escola e fam\u00edlia).';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function nivelDe(t, s) {
    var i = s <= t.niv[0] ? 0 : (s <= t.niv[1] ? 1 : (s <= t.niv[2] ? 2 : 3)), lim = '';
    if (i < 3 && s === t.niv[i]) lim = NIVEIS[i + 1];
    else if (i > 0 && s === t.niv[i - 1] + 1) lim = NIVEIS[i - 1];
    return {i: i, nome: NIVEIS[i], lim: lim, txt: NIVEIS[i] + (lim ? ' (lim\u00edtrofe com ' + lim.toLowerCase() + ')' : '')};
}
function calcular(resp, ctx) {
    if (!resp) throw new Error('SE: respostas incompletas');
    var r = {v: {}, p: {}, t: {}, ctx: ctx || {}, ns: 0}, i;
    TIPOS.forEach(function (t) { r.t[t.k] = {soma: 0, n: 0, ns: 0}; });
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 5)) throw new Error('SE: resposta invalida no item ' + i);
        r.v[i] = x;
        var pt = OPCOES[x - 1].pt, tp = ITENS[i - 1].tipo;
        r.p[i] = pt; r.t[tp].soma += pt; r.t[tp].n++;
        if (x === 5) { r.t[tp].ns++; r.ns++; }
    }
    TIPOS.forEach(function (t) { r.t[t.k].nivel = nivelDe(t, r.t[t.k].soma); });
    return r;
}
function escore(r) { return TIPOS.filter(function (t) { return r.t[t.k].nivel.i >= 2; }).length; }
function classifGeral(r) { return TIPOS.map(function (t) { return t.nome + ': ' + r.t[t.k].nivel.nome; }).join('; '); }
function dadosPainel(r) {
    var o = {};
    TIPOS.forEach(function (t) { var s = r.t[t.k]; o[t.nome] = {pontuacao: s.soma, max: t.max, media: Math.round(s.soma / s.n * 100) / 100, classificacao: s.nivel.txt}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function blocks(r) {
    var b = [], c = r.ctx || {};
    b.push({t: 'hero', fundo: '#fff3e0', borda: COR, cor: '#bf360c', titulo: 'Perfil de sobre-excitabilidade em 5 tipos', sub: 'N\u00edveis definidos pela autora (Neumann, 2022), sem normas nem estudo de validade. Os tipos n\u00e3o s\u00e3o somados em um total.'});
    b.push({t: 'cards', itens: TIPOS.map(function (t) { var s = r.t[t.k]; return {rot: t.nome.toUpperCase(), valor: s.soma + ' / ' + t.max, de: s.nivel.nome, cor: COR_T[t.k]}; })});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que o question\u00e1rio mostra', x: 'Quanto pais ou professores observam, na crian\u00e7a ou no adolescente, indicadores de cinco formas de intensidade chamadas de sobre-excitabilidade: imaginativa, emocional, intelectual, psicomotora e sensorial.'},
        {t: 'Como a pontua\u00e7\u00e3o \u00e9 feita', x: 'Cada resposta vale: nunca = 0, \u00e0s vezes = 1, frequentemente = 3, sempre = 4. A soma de cada tipo \u00e9 comparada com as faixas da autora: Baixo, M\u00e9dio, Alto e Muito alto, que dividem o valor m\u00e1ximo de cada tipo em quatro partes. "Lim\u00edtrofe" indica o primeiro ou o \u00faltimo ponto de uma faixa, ou seja, perto do n\u00edvel vizinho.'},
        {t: 'Cuidados', x: 'As faixas foram definidas pela autora e usadas em um estudo pequeno (25 fam\u00edlias e 10 profissionais); n\u00e3o s\u00e3o normas. Itens marcados "n\u00e3o sei" n\u00e3o pontuam. O resultado descreve o que a pessoa observa e n\u00e3o diz, sozinho, se existe Altas Habilidades/Superdota\u00e7\u00e3o ou outra condi\u00e7\u00e3o.'}
    ].concat(c.respondente ? [{t: 'Quem respondeu', x: c.respondente}] : [])});
    b.push({t: 'barras', titulo: 'Pontua\u00e7\u00e3o por tipo', nota: 'A agulha mostra a posi\u00e7\u00e3o entre 0 (esquerda) e o m\u00e1ximo do tipo (direita). As quatro zonas do medidor s\u00e3o os n\u00edveis Baixo, M\u00e9dio, Alto e Muito alto, da menos para a mais intensa.', itens: TIPOS.map(function (t) {
        var s = r.t[t.k];
        return {rot: 'Sobre-excitabilidade ' + t.nome + ' (' + s.n + ' itens)', txt: s.soma + ' de ' + t.max + ' pontos | n\u00edvel: ' + s.nivel.txt, pct: s.soma / t.max * 100, cor: COR_T[t.k],
            cortes: [{pct: (t.niv[0] + 1) / t.max * 100, rot: 'M'}, {pct: (t.niv[1] + 1) / t.max * 100, rot: 'A'}, {pct: (t.niv[2] + 1) / t.max * 100, rot: 'MA'}]};
    })});
    b.push({t: 'textos', titulo: 'Faixas de cada tipo (Neumann, 2022)', itens: TIPOS.map(function (t) {
        return {t: t.nome + ' - m\u00e1ximo ' + t.max, x: 'Baixo 0 a ' + t.niv[0] + ' | M\u00e9dio ' + (t.niv[0] + 1) + ' a ' + t.niv[1] + ' | Alto ' + (t.niv[1] + 1) + ' a ' + t.niv[2] + ' | Muito alto ' + (t.niv[2] + 1) + ' a ' + t.max + '. Resultado: ' + r.t[t.k].soma + ' = ' + r.t[t.k].nivel.txt + '.'};
    })});
    b.push({t: 'textos', titulo: 'O que cada tipo re\u00fane', itens: TIPOS.map(function (t) { return {t: t.nome, x: DESC[t.k]}; })});
    if (r.ns > 0) b.push({t: 'textos', titulo: 'Itens marcados "n\u00e3o sei"', itens: [{t: r.ns + ' item(ns) sem pontua\u00e7\u00e3o', x: TIPOS.filter(function (t) { return r.t[t.k].ns > 0; }).map(function (t) { return t.nome + ': ' + r.t[t.k].ns; }).join('; ') + '. Esses itens contam zero e podem reduzir a pontua\u00e7\u00e3o do tipo.'}]});
    var nomeT = {}; TIPOS.forEach(function (t) { nomeT[t.k] = t.nome; });
    var linhas = ITENS.map(function (it, i) { var n = i + 1; return {c: [nomeT[it.tipo], String(it.n), it.texto, OPCOES[r.v[n] - 1].texto, String(r.p[n])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: 'Tipo', w: 26, al: 'l'}, {h: '#', w: 8, al: 'c'}, {h: 'Indicador', w: 100, al: 'l'}, {h: 'Resposta', w: 30, al: 'c'}, {h: 'Pontos', w: 16, al: 'c'}], linhas: linhas});
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
    id: 'sobrex', nome: 'Sobre-excitabilidade', cor: COR, cor2: '#bf360c', escalaPainel: ['SOBREXCITABILIDADE'],
    sub1: 'Question\u00e1rio de Indicadores de Sobre-excitabilidade nas Altas Habilidades ou Superdota\u00e7\u00e3o - 68 itens',
    sub2: 'Neumann (2022), adaptado de Daniels e Piechowski (2009) | Pais e professores',
    dadosExtra: function (r) { return r.ctx && r.ctx.respondente ? ['Respondente: ' + r.ctx.respondente] : []; },
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_SOBREX = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, TIPOS: TIPOS, OPCOES: OPCOES, nivelDe: nivelDe};

})();
