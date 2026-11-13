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
            .replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u2264/g, '<=').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }

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

// das-visual.js - DAS (Dyadic Adjustment Scale / Escala de Ajustamento Diadico, Spanier 1976), 32 itens, soma 0-151, 4 subescalas. Tela e PDF dos mesmos blocos.
// CORRECOES (novembro/2026), conferidas com a chave de Spanier (1976) publicada em arc.psych.wisc.edu:
//  - subescalas: Consenso 1,2,3,5,7-15 (13 itens, max 65); Satisfacao 16-23, 31, 32 (10 itens, max 50); Coesao 24-28 (5 itens, max 24); Expressao Afetiva 4, 6, 29, 30 (4 itens, max 12).
//    O site colocava o item 23 (beijar) na Expressao e deixava a Satisfacao com 9 itens.
//  - itens 29 e 30 (cansaco para sexo / nao demonstrar amor): Sim = 0 e Nao = 1 (o site fazia o contrario).
//  - corte 101 sem fonte removido; referencia = 97 (cerca de 1 DP abaixo da media dos casais casados do estudo original, ~114, DP 17,8), valor usado na literatura internacional.
//  - removidos: classificacao por subescala (Adequado/Moderado/Baixo) e sugestoes de conduta (Analise Integrada IA).
// d.respostas: chaves 1..32 com o valor de cada opcao. Registros SEM versaoEscala:2 tem os itens 29 e 30 no sentido antigo (Sim=1): sao reinterpretados (1 - valor).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Administra\u00e7\u00e3o das finan\u00e7as da fam\u00edlia",grupo:"consenso",tipo:"acordo"},
{texto:"Quest\u00f5es de lazer e divers\u00e3o",grupo:"consenso",tipo:"acordo"},
{texto:"Quest\u00f5es religiosas",grupo:"consenso",tipo:"acordo"},
{texto:"Demonstra\u00e7\u00f5es de afeto",grupo:"expressao",tipo:"acordo"},
{texto:"Amizades",grupo:"consenso",tipo:"acordo"},
{texto:"Rela\u00e7\u00f5es sexuais",grupo:"expressao",tipo:"acordo"},
{texto:"Conven\u00e7\u00f5es sociais (comportamento correto ou adequado)",grupo:"consenso",tipo:"acordo"},
{texto:"Filosofia de vida",grupo:"consenso",tipo:"acordo"},
{texto:"Maneiras de lidar com pais e sogros",grupo:"consenso",tipo:"acordo"},
{texto:"Objetivos, metas e coisas consideradas importantes",grupo:"consenso",tipo:"acordo"},
{texto:"Quantidade de tempo passado juntos",grupo:"consenso",tipo:"acordo"},
{texto:"Tomada de decis\u00f5es importantes",grupo:"consenso",tipo:"acordo"},
{texto:"Tarefas dom\u00e9sticas",grupo:"consenso",tipo:"acordo"},
{texto:"Interesses e atividades de lazer",grupo:"consenso",tipo:"acordo"},
{texto:"Decis\u00f5es sobre carreira/trabalho",grupo:"consenso",tipo:"acordo"},
{texto:"Com que frequ\u00eancia voc\u00ea discute ou j\u00e1 considerou divorciar-se, separar-se ou terminar o relacionamento?",grupo:"satisfacao",tipo:"frequencia",invertido:true},
{texto:"Com que frequ\u00eancia voc\u00ea ou seu(sua) parceiro(a) sai de casa ap\u00f3s uma briga?",grupo:"satisfacao",tipo:"frequencia",invertido:true},
{texto:"De modo geral, com que frequ\u00eancia voc\u00ea acha que as coisas entre voc\u00ea e seu(sua) parceiro(a) v\u00e3o bem?",grupo:"satisfacao",tipo:"frequencia",invertido:false},
{texto:"Voc\u00ea confia no(a) seu(sua) parceiro(a)?",grupo:"satisfacao",tipo:"frequencia",invertido:false},
{texto:"Voc\u00ea j\u00e1 se arrependeu de ter casado (ou de morar junto)?",grupo:"satisfacao",tipo:"frequencia",invertido:true},
{texto:"Com que frequ\u00eancia voc\u00ea e seu(sua) parceiro(a) brigam?",grupo:"satisfacao",tipo:"frequencia",invertido:true},
{texto:"Com que frequ\u00eancia voc\u00ea e seu(sua) parceiro(a) irritam um ao outro?",grupo:"satisfacao",tipo:"frequencia",invertido:true},
{texto:"Voc\u00ea beija seu(sua) parceiro(a)?",grupo:"satisfacao",tipo:"beijo"},
{texto:"Voc\u00ea e seu(sua) parceiro(a) participam juntos de atividades fora de casa?",grupo:"coesao",tipo:"interesses"},
{texto:"Troca estimulante de ideias",grupo:"coesao",tipo:"eventos"},
{texto:"Rir juntos",grupo:"coesao",tipo:"eventos"},
{texto:"Discutir algo calmamente",grupo:"coesao",tipo:"eventos"},
{texto:"Trabalhar juntos em um projeto",grupo:"coesao",tipo:"eventos"},
{texto:"Estar cansado(a) demais para sexo",grupo:"expressao",tipo:"simNao",invertido:true},
{texto:"N\u00e3o demonstrar amor",grupo:"expressao",tipo:"simNao",invertido:true},
{texto:"Qual o grau de felicidade do seu relacionamento, considerando todos os aspectos?",grupo:"satisfacao",tipo:"felicidade"},
{texto:"Qual das afirma\u00e7\u00f5es abaixo descreve melhor como voc\u00ea se sente sobre o futuro do seu relacionamento?",grupo:"satisfacao",tipo:"futuro"}
];

var OPCOES_ACORDO=[
{valor:5,texto:"Sempre concordamos"},
{valor:4,texto:"Quase sempre concordamos"},
{valor:3,texto:"Ocasionalmente discordamos"},
{valor:2,texto:"Frequentemente discordamos"},
{valor:1,texto:"Quase sempre discordamos"},
{valor:0,texto:"Sempre discordamos"}
];

var OPCOES_FREQUENCIA=[
{valor:0,texto:"Sempre"},
{valor:1,texto:"Quase sempre"},
{valor:2,texto:"Mais que a metade do tempo"},
{valor:3,texto:"Ocasionalmente"},
{valor:4,texto:"Raramente"},
{valor:5,texto:"Nunca"}
];

var OPCOES_FREQUENCIA_POS=[
{valor:5,texto:"Sempre"},
{valor:4,texto:"Quase sempre"},
{valor:3,texto:"Mais que a metade do tempo"},
{valor:2,texto:"Ocasionalmente"},
{valor:1,texto:"Raramente"},
{valor:0,texto:"Nunca"}
];

var OPCOES_BEIJO=[
{valor:4,texto:"Todo dia"},
{valor:3,texto:"Quase todo dia"},
{valor:2,texto:"Ocasionalmente"},
{valor:1,texto:"Raramente"},
{valor:0,texto:"Nunca"}
];

var OPCOES_INTERESSES=[
{valor:4,texto:"Todas"},
{valor:3,texto:"A maioria"},
{valor:2,texto:"Algumas"},
{valor:1,texto:"Muito poucas"},
{valor:0,texto:"Nenhuma"}
];

var OPCOES_EVENTOS=[
{valor:0,texto:"Nunca"},
{valor:1,texto:"Menos de 1x/m\u00eas"},
{valor:2,texto:"1-2x/m\u00eas"},
{valor:3,texto:"1-2x/semana"},
{valor:4,texto:"1x/dia"},
{valor:5,texto:"Mais de 1x/dia"}
];

var OPCOES_SIMNAO=[
{valor:0,texto:"Sim"},
{valor:1,texto:"N\u00e3o"}
];

var OPCOES_FELICIDADE=[
{valor:0,texto:"Extremamente infeliz"},
{valor:1,texto:"Bastante infeliz"},
{valor:2,texto:"Um pouco infeliz"},
{valor:3,texto:"Feliz"},
{valor:4,texto:"Muito feliz"},
{valor:5,texto:"Extremamente feliz"},
{valor:6,texto:"Perfeito"}
];

var OPCOES_FUTURO=[
{valor:5,texto:"Quero desesperadamente que d\u00ea certo e faria quase qualquer coisa para isso"},
{valor:4,texto:"Quero muito que d\u00ea certo e farei tudo que puder"},
{valor:3,texto:"Quero muito que d\u00ea certo e farei minha parte"},
{valor:2,texto:"Seria bom se desse certo, mas n\u00e3o posso fazer muito mais do que j\u00e1 fa\u00e7o"},
{valor:1,texto:"Seria bom se desse certo, mas me recuso a fazer mais do que j\u00e1 fa\u00e7o"},
{valor:0,texto:"Meu relacionamento n\u00e3o pode dar certo e n\u00e3o h\u00e1 mais nada que eu possa fazer"}
];

var OPC = {acordo: OPCOES_ACORDO, frequencia: OPCOES_FREQUENCIA, frequenciaPos: OPCOES_FREQUENCIA_POS, beijo: OPCOES_BEIJO, interesses: OPCOES_INTERESSES, eventos: OPCOES_EVENTOS, simNao: OPCOES_SIMNAO, felicidade: OPCOES_FELICIDADE, futuro: OPCOES_FUTURO};
var SUB = [
    {k: 'consenso', nome: 'Consenso', idx: [0, 1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14], max: 65, cor: '#880e4f', desc: 'O quanto a pessoa percebe que o casal concorda em assuntos importantes: finan\u00e7as, lazer, religi\u00e3o, amizades, valores, decis\u00f5es e tarefas.'},
    {k: 'satisfacao', nome: 'Satisfa\u00e7\u00e3o', idx: [15, 16, 17, 18, 19, 20, 21, 22, 30, 31], max: 50, cor: '#c2185b', desc: 'A satisfa\u00e7\u00e3o com o relacionamento: brigas, irrita\u00e7\u00e3o, confian\u00e7a, pensamentos de separa\u00e7\u00e3o, arrependimento, felicidade e vis\u00e3o do futuro.'},
    {k: 'coesao', nome: 'Coes\u00e3o', idx: [23, 24, 25, 26, 27], max: 24, cor: '#6a1b9a', desc: 'As atividades e conversas que o casal compartilha: sair juntos, trocar ideias, rir, discutir com calma e fazer projetos.'},
    {k: 'expressao', nome: 'Express\u00e3o afetiva', idx: [3, 5, 28, 29], max: 12, cor: '#ad1457', desc: 'Afeto e vida sexual: demonstra\u00e7\u00f5es de afeto, rela\u00e7\u00f5es sexuais, cansa\u00e7o para o sexo e n\u00e3o demonstrar amor. Tem s\u00f3 4 itens (m\u00e1ximo 12).'}
];
var CURTO = [
    'Finan\u00e7as da fam\u00edlia', 'Lazer e divers\u00e3o', 'Quest\u00f5es religiosas', 'Demonstra\u00e7\u00f5es de afeto', 'Amizades', 'Rela\u00e7\u00f5es sexuais', 'Conven\u00e7\u00f5es sociais', 'Filosofia de vida',
    'Pais e sogros', 'Objetivos e metas', 'Tempo passado juntos', 'Decis\u00f5es importantes', 'Tarefas dom\u00e9sticas', 'Interesses e lazer', 'Carreira e trabalho',
    'Discutir ou pensar em separa\u00e7\u00e3o', 'Sair de casa ap\u00f3s uma briga', 'Achar que as coisas v\u00e3o bem', 'Confian\u00e7a no(a) parceiro(a)', 'Arrependimento de ter casado',
    'Brigas', 'Irritar um ao outro', 'Beijar o(a) parceiro(a)', 'Atividades fora de casa juntos', 'Troca estimulante de ideias', 'Rir juntos', 'Discutir algo com calma',
    'Trabalhar juntos em um projeto', 'Cansa\u00e7o demais para sexo', 'N\u00e3o demonstrar amor', 'Felicidade do relacionamento', 'Futuro do relacionamento'
];
var REF_FAIXAS = [
    {de: 0, ate: 98, cor: '#cfd8dc', rot: '0 a 97'},
    {de: 98, ate: 115, cor: '#ec407a', rot: '98 a 114'},
    {de: 115, ate: 152, cor: '#880e4f', rot: '115 a 151'}
];
var REFS = [
    'HERNANDEZ, J. A. E. Avalia\u00e7\u00e3o estrutural da Escala de Ajustamento Di\u00e1dico. Psicologia em Estudo, Maring\u00e1, v. 13, n. 3, p. 593-601, 2008.',
    'SPANIER, G. B. Measuring dyadic adjustment: new scales for assessing the quality of marriage and similar dyads. Journal of Marriage and the Family, v. 38, n. 1, p. 15-28, 1976. DOI: 10.2307/350547.',
    'SPANIER, G. B.; THOMPSON, L. A confirmatory analysis of the Dyadic Adjustment Scale. Journal of Marriage and the Family, v. 44, n. 3, p. 731-738, 1982. DOI: 10.2307/351593.'
];
var AVISO = 'A DAS descreve como a pessoa percebe o ajustamento do seu relacionamento de casal; n\u00e3o \u00e9 diagn\u00f3stico, n\u00e3o mostra como o(a) parceiro(a) v\u00ea a rela\u00e7\u00e3o e n\u00e3o indica conduta. N\u00e3o existem faixas oficiais de classifica\u00e7\u00e3o: o valor 97 \u00e9 usado com frequ\u00eancia na literatura internacional para separar casais com sofrimento, mas n\u00e3o foi definido para a popula\u00e7\u00e3o brasileira. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, em entrevista cl\u00ednica.';

function validos(ix) { var t = ITENS[ix].tipo, o; if (t === 'frequencia') o = ITENS[ix].invertido ? OPC.frequencia : OPC.frequenciaPos; else o = OPC[t]; return o.map(function (x) { return x.valor; }); }
function opcaoDe(ix) { var t = ITENS[ix].tipo; if (t === 'frequencia') return ITENS[ix].invertido ? OPC.frequencia : OPC.frequenciaPos; return OPC[t]; }
function textoOpcao(ix, valor) { var o = opcaoDe(ix), k; for (k = 0; k < o.length; k++) { if (o[k].valor === valor) return o[k].texto; } return ''; }
function maxItem(ix) { return Math.max.apply(null, validos(ix)); }
function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('DAS: respostas incompletas');
    var r = {v: [], total: 0, sub: [], legado: false}, i, s;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (validos(i).indexOf(x) < 0) throw new Error('DAS: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
    }
    for (s = 0; s < SUB.length; s++) {
        var soma = 0, mx = 0;
        SUB[s].idx.forEach(function (q) { soma += r.v[q]; mx += maxItem(q); });
        if (mx !== SUB[s].max) throw new Error('DAS: maximo da subescala ' + SUB[s].nome + ' = ' + mx);
        r.sub.push({k: SUB[s].k, soma: soma, max: mx, n: SUB[s].idx.length});
    }
    r.pct = r.total / 151 * 100;
    r.faixaRef = r.total <= 97 ? 0 : (r.total <= 114 ? 1 : 2);
    r.zeros = [];
    for (i = 0; i < r.v.length; i++) { if (r.v[i] === 0) r.zeros.push(i); }
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return r.total <= 97 ? 'Escore at\u00e9 97 (corte usual na literatura): ' + r.total + ' de 151' : 'Escore acima de 97 (corte usual na literatura): ' + r.total + ' de 151'; }
function dadosPainel(r) {
    var o = {};
    r.sub.forEach(function (d) { o[d.k] = {pontuacao: d.soma, max: d.max, classificacao: d.soma + ' de ' + d.max + ' pontos'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var b = [], i, f = REF_FAIXAS[r.faixaRef];
    b.push({t: 'hero', fundo: '#fce4ec', borda: '#880e4f', cor: '#880e4f', titulo: 'Escore ' + r.total + ' de 151 pontos (' + fmt(r.pct) + '%)', sub: 'Quanto maior, melhor o ajustamento percebido pela pessoa. Valores de refer\u00eancia: 97 e m\u00e9dia original de cerca de 114.'});
    b.push({t: 'cards', itens: r.sub.map(function (d, ix) { return {rot: SUB[ix].nome.toUpperCase(), valor: d.soma + ' / ' + d.max, de: d.n + ' itens', cor: SUB[ix].cor}; })});
    b.push({t: 'faixas', titulo: 'Escore e valores de refer\u00eancia (n\u00e3o s\u00e3o faixas oficiais)', min: 0, max: 152, pino: r.total + 0.5, ativo: r.faixaRef, faixas: REF_FAIXAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    var ler = [
        {t: 'O que a DAS mede', x: 'A qualidade do ajustamento do casal, do ponto de vista de quem responde: o quanto concordam em assuntos importantes (consenso), a satisfa\u00e7\u00e3o com o relacionamento, as atividades e conversas que compartilham (coes\u00e3o) e a express\u00e3o de afeto e a vida sexual.'},
        {t: 'Como interpretar', x: 'A soma vai de 0 a 151: quanto maior, melhor o ajustamento percebido. As quatro subescalas mostram em que parte do relacionamento a pessoa v\u00ea mais ou menos ajustamento. Elas t\u00eam tamanhos diferentes, por isso cada uma deve ser comparada com o seu pr\u00f3prio m\u00e1ximo.'},
        {t: 'Sobre valores de refer\u00eancia', x: 'No estudo original (Spanier, 1976), os casais casados tiveram m\u00e9dia por volta de 114 pontos (desvio-padr\u00e3o de 17,8). Na literatura internacional usa-se com frequ\u00eancia o valor 97, cerca de 1 desvio-padr\u00e3o abaixo, para separar casais com sofrimento. A escala n\u00e3o tem faixas oficiais e esse valor n\u00e3o foi definido para a popula\u00e7\u00e3o brasileira.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'Mostra a percep\u00e7\u00e3o de uma das pessoas do casal, num momento. N\u00e3o diz como o(a) parceiro(a) v\u00ea a rela\u00e7\u00e3o, n\u00e3o explica as causas e n\u00e3o \u00e9 diagn\u00f3stico nem indica o que fazer.'}
    ];
    if (r.legado) ler.push({t: 'Registro anterior a novembro de 2026', x: 'Este registro foi feito com a vers\u00e3o antiga da p\u00e1gina. As respostas dos itens 29 e 30 foram reinterpretadas (Sim = 0, N\u00e3o = 1) e as subescalas Satisfa\u00e7\u00e3o e Express\u00e3o afetiva foram recalculadas pela chave de Spanier; o escore pode diferir do que foi exibido na \u00e9poca.'});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: ler});
    b.push({t: 'barras', titulo: 'As quatro subescalas', nota: 'Cada barra vai de 0 ao m\u00e1ximo da subescala. A Express\u00e3o afetiva tem s\u00f3 4 itens: pequenas mudan\u00e7as alteram bastante o seu percentual.', itens: r.sub.map(function (d, ix) {
        return {rot: SUB[ix].nome + ' (' + d.n + ' itens)', txt: d.soma + ' de ' + d.max + ' pontos (' + Math.round(d.soma / d.max * 100) + '%)', pct: d.soma / d.max * 100, cor: SUB[ix].cor};
    })});
    b.push({t: 'textos', titulo: 'O que cada subescala mostra', itens: SUB.map(function (s, ix) {
        return {t: s.nome + ' - ' + r.sub[ix].soma + ' de ' + r.sub[ix].max + ' pontos (itens ' + s.idx.map(function (q) { return q + 1; }).sort(function (a, c) { return a - c; }).join(', ') + ')', x: s.desc};
    })});
    var zeros = r.zeros.length ? r.zeros.map(function (q) { return 'item ' + (q + 1) + ' (' + CURTO[q].toLowerCase() + ')'; }).join('; ') + '. \u00c9 apenas a descri\u00e7\u00e3o das respostas dadas, sem leitura cl\u00ednica por si s\u00f3.' : 'Nenhum item recebeu pontua\u00e7\u00e3o zero.';
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Cada item vale os pontos da resposta escolhida: 0 a 5 nos itens 1 a 22, 25 a 28 e 32; 0 a 4 nos itens 23 e 24; 0 ou 1 nos itens 29 e 30 (Sim = 0, N\u00e3o = 1, porque "Sim" indica problema); 0 a 6 no item 31. Com as respostas desta pessoa: ' + r.v.join(' + ') + ' = ' + r.total + ' pontos, de um m\u00e1ximo de 151.'},
        {t: 'Itens com pontua\u00e7\u00e3o zero (menor ajustamento no item)', x: zeros}
    ]});
    var sn = function (ix) { var nome = ''; SUB.forEach(function (s) { if (s.idx.indexOf(ix) >= 0) nome = s.nome; }); return nome; };
    var linhas = ITENS.map(function (it, ix) { return {c: [String(ix + 1), sn(ix), it.texto, textoOpcao(ix, r.v[ix]), String(r.v[ix])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Subescala', w: 24, al: 'c'}, {h: 'Item', w: 84, al: 'l'}, {h: 'Resposta', w: 46, al: 'c'}, {h: 'Pontos', w: 20, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i, leg = d.versaoEscala !== 2;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(d.respostas[i], 10);
        if (leg && (i === 29 || i === 30)) x = 1 - x;
        if (!(x >= 0) || validos(i - 1).indexOf(x) < 0) return null;
        v.push(x);
    }
    var r = calcular(v); r.legado = leg;
    return r;
}
var base = symMake({
    id: 'das', nome: 'DAS', cor: '#880e4f', cor2: '#c2185b', escalaPainel: ['DAS'],
    sub1: 'Escala de Ajustamento Di\u00e1dico (Dyadic Adjustment Scale) - 32 itens, relacionamento de casal',
    sub2: 'Spanier (1976) | adapta\u00e7\u00e3o brasileira: Hernandez (2008)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_DAS = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPC: OPC, SUB: SUB};

})();
