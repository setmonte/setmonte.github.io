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
            if (b.titulo) secao(c, b.titulo);
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

// ders-visual.js - DERS (Escala de Dificuldades na Regulacao Emocional), 36 itens 1-5, 11 itens invertidos (6 - resposta), total 36-180, 6 subescalas.
// Calculo mantido como no site e conferido com a chave de Gratz e Roemer (2004): invertidos 1,2,6,7,8,10,17,20,22,24,34;
// subescalas Nao aceitacao (11,12,21,23,25,29), Objetivos (13,18,20,26,33), Impulso (3,14,19,24,27,32), Consciencia (2,6,8,10,17,34),
// Estrategias (15,16,22,28,30,31,35,36), Clareza (1,4,5,7,9).
// Retiradas: faixas de gravidade sem fonte (36-79 / 80-99 / 100-130 / 131-180) e cores de alarme. A escala nao tem faixas consagradas.
// ATENCAO: os valores recebidos e salvos (d.respostas) sao os JA PONTUADOS (1-5 depois da inversao), como no registro antigo.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Tenho clareza sobre os meus sentimentos",inv:true},
{texto:"Presto aten\u00e7\u00e3o a como me sinto",inv:true},
{texto:"Sinto-me dominado(a) pelas minhas emo\u00e7\u00f5es e fora de controle",inv:false},
{texto:"N\u00e3o tenho ideia de como estou me sentindo",inv:false},
{texto:"Tenho dificuldade em entender meus sentimentos",inv:false},
{texto:"Sou atento(a) aos meus sentimentos",inv:true},
{texto:"Sei exatamente como estou me sentindo",inv:true},
{texto:"Importo-me com o que estou sentindo",inv:true},
{texto:"Estou confuso(a) sobre como me sinto",inv:false},
{texto:"Quando estou chateado(a), reconhe\u00e7o minhas emo\u00e7\u00f5es",inv:true},
{texto:"Quando estou chateado(a), fico com raiva de mim mesmo(a) por me sentir assim",inv:false},
{texto:"Quando estou chateado(a), fico envergonhado(a) por me sentir assim",inv:false},
{texto:"Quando estou chateado(a), tenho dificuldade em fazer meu trabalho",inv:false},
{texto:"Quando estou chateado(a), fico fora de controle",inv:false},
{texto:"Quando estou chateado(a), acredito que vou ficar assim por muito tempo",inv:false},
{texto:"Quando estou chateado(a), acredito que acabarei me sentindo muito deprimido(a)",inv:false},
{texto:"Quando estou chateado(a), acredito que meus sentimentos s\u00e3o v\u00e1lidos e importantes",inv:true},
{texto:"Quando estou chateado(a), tenho dificuldade em me concentrar em outras coisas",inv:false},
{texto:"Quando estou chateado(a), sinto-me fora de controle",inv:false},
{texto:"Quando estou chateado(a), ainda consigo fazer as coisas",inv:true},
{texto:"Quando estou chateado(a), sinto vergonha de mim mesmo(a) por me sentir assim",inv:false},
{texto:"Quando estou chateado(a), sei que consigo encontrar um jeito de me sentir melhor",inv:true},
{texto:"Quando estou chateado(a), sinto que sou fraco(a)",inv:false},
{texto:"Quando estou chateado(a), sinto que consigo manter o controle dos meus comportamentos",inv:true},
{texto:"Quando estou chateado(a), sinto-me culpado(a) por me sentir assim",inv:false},
{texto:"Quando estou chateado(a), tenho dificuldade em me concentrar",inv:false},
{texto:"Quando estou chateado(a), tenho dificuldade em controlar meus comportamentos",inv:false},
{texto:"Quando estou chateado(a), acredito que n\u00e3o h\u00e1 nada que eu possa fazer para me sentir melhor",inv:false},
{texto:"Quando estou chateado(a), fico irritado(a) comigo mesmo(a) por me sentir assim",inv:false},
{texto:"Quando estou chateado(a), come\u00e7o a me sentir muito mal comigo mesmo(a)",inv:false},
{texto:"Quando estou chateado(a), acredito que a \u00fanica coisa que posso fazer \u00e9 me afundar nisso",inv:false},
{texto:"Quando estou chateado(a), perco o controle dos meus comportamentos",inv:false},
{texto:"Quando estou chateado(a), tenho dificuldade em pensar em qualquer outra coisa",inv:false},
{texto:"Quando estou chateado(a), reservo um tempo para entender o que realmente estou sentindo",inv:true},
{texto:"Quando estou chateado(a), levo muito tempo para me sentir melhor",inv:false},
{texto:"Quando estou chateado(a), minhas emo\u00e7\u00f5es parecem me dominar",inv:false}
];

var OPCOES=[{valor:1,texto:"Quase nunca"},{valor:2,texto:"Algumas vezes"},{valor:3,texto:"Metade das vezes"},{valor:4,texto:"Na maioria das vezes"},{valor:5,texto:"Quase sempre"}];

var DOMINIOS={
"N\u00e3o Aceita\u00e7\u00e3o":[10,11,20,22,24,28],
"Objetivos":[12,17,19,25,32],
"Impulso":[2,13,18,23,26,31],
"Consci\u00eancia":[1,5,7,9,16,33],
"Estrat\u00e9gias":[14,15,21,27,29,30,34,35],
"Clareza":[0,3,4,6,8]
};

var SUB = [
    {k: 'NaoAceitacao', dom: 'N\u00e3o Aceita\u00e7\u00e3o', nome: 'N\u00e3o aceita\u00e7\u00e3o', cor: '#ad1457', desc: 'Reagir com vergonha, culpa, raiva ou cr\u00edtica a si mesmo(a) por estar sentindo o que sente.'},
    {k: 'Objetivos', dom: 'Objetivos', nome: 'Objetivos', cor: '#6a1b9a', desc: 'Dificuldade de se concentrar e de fazer as tarefas quando est\u00e1 chateado(a).'},
    {k: 'Impulso', dom: 'Impulso', nome: 'Impulso', cor: '#c62828', desc: 'Dificuldade de controlar o comportamento e sensa\u00e7\u00e3o de perder o controle quando est\u00e1 chateado(a).'},
    {k: 'Consciencia', dom: 'Consci\u00eancia', nome: 'Consci\u00eancia', cor: '#00838f', desc: 'Pouca aten\u00e7\u00e3o ao que se sente e pouco reconhecimento das pr\u00f3prias emo\u00e7\u00f5es. Os itens s\u00e3o invertidos: responder "quase sempre" a "presto aten\u00e7\u00e3o a como me sinto" diminui a pontua\u00e7\u00e3o.'},
    {k: 'Estrategias', dom: 'Estrat\u00e9gias', nome: 'Estrat\u00e9gias', cor: '#ef6c00', desc: 'Cren\u00e7a de que pouco se pode fazer para se sentir melhor, de que o mal-estar vai durar ou de que n\u00e3o h\u00e1 sa\u00edda.'},
    {k: 'Clareza', dom: 'Clareza', nome: 'Clareza', cor: '#2e7d32', desc: 'Dificuldade de saber e entender ao certo o que se est\u00e1 sentindo.'}
];
var REFS = [
    'GRATZ, K. L.; ROEMER, L. Multidimensional assessment of emotion regulation and dysregulation: development, factor structure, and initial validation of the Difficulties in Emotion Regulation Scale. Journal of Psychopathology and Behavioral Assessment, v. 26, n. 1, p. 41-54, 2004. DOI: 10.1023/B:JOBA.0000007455.08539.94.',
    'CANCIAN, A. C. M. et al. Psychometric properties of the Brazilian version of the Difficulties in Emotion Regulation Scale (DERS). Trends in Psychiatry and Psychotherapy, v. 41, n. 1, p. 18-26, 2019.',
    'MACHADO, B. M.; GURGEL, L. G.; BOECKEL, M. G.; REPPOLD, C. T. Evidences of validity of the Difficulties in Emotion Regulation Scale - DERS. Paid\u00e9ia (Ribeir\u00e3o Preto), v. 30, e3017, 2020. DOI: 10.1590/1982-4327e3017.'
];
var AVISO = 'A DERS descreve as dificuldades de regula\u00e7\u00e3o emocional percebidas pela pr\u00f3pria pessoa; n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica. A escala n\u00e3o possui faixas de gravidade consagradas: o escore total e as subescalas servem para conhecer o perfil e para comparar a pessoa com ela mesma ao longo do tempo. A reda\u00e7\u00e3o dos itens 21, 25 e 34 foi ajustada ao sentido da escala original (Gratz e Roemer, 2004) e n\u00e3o \u00e9 a reda\u00e7\u00e3o publicada de nenhuma vers\u00e3o brasileira. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria cl\u00ednica.';

function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('DERS: respostas incompletas');
    var r = {v: [], raw: [], total: 0, sub: []}, i, s;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x >= 1 && x <= 5)) throw new Error('DERS: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
        r.raw.push(ITENS[i].inv ? 6 - x : x);
    }
    for (s = 0; s < SUB.length; s++) {
        var idx = DOMINIOS[SUB[s].dom], soma = 0, j;
        if (!idx) throw new Error('DERS: subescala ausente ' + SUB[s].dom);
        for (j = 0; j < idx.length; j++) soma += r.v[idx[j]];
        r.sub.push({k: SUB[s].k, n: idx.length, idx: idx, soma: soma, min: idx.length, max: idx.length * 5, media: soma / idx.length});
    }
    r.media = r.total / ITENS.length;
    r.top = 0;
    for (s = 1; s < r.sub.length; s++) { if (r.sub[s].media > r.sub[r.top].media) r.top = s; }
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return 'Perfil descritivo (sem faixas de gravidade): escore ' + r.total + ' de 180'; }
function dadosPainel(r) {
    var o = {};
    r.sub.forEach(function (d) { o[d.k] = {pontuacao: d.soma, max: d.max, classificacao: 'm\u00e9dia ' + fmt(d.media) + ' por item', media: Math.round(d.media * 100) / 100}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var b = [], s, i, tp = r.sub[r.top];
    b.push({t: 'hero', fundo: '#fce4ec', borda: '#ad1457', cor: '#880e4f', titulo: 'Escore ' + r.total + ' de 180 pontos', sub: 'M\u00e9dia de ' + fmt(r.media) + ' por item (de 1 a 5). Escala sem faixas de gravidade: leia o perfil abaixo.'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de 36 a 180 pontos', cor: '#ad1457'},
        {rot: 'M\u00c9DIA POR ITEM', valor: fmt(r.media), de: 'em uma escala de 1 a 5', cor: '#6a1b9a'},
        {rot: 'MAIOR M\u00c9DIA ENTRE AS SUBESCALAS', valor: SUB[r.top].nome, de: 'm\u00e9dia ' + fmt(tp.media) + ' por item', cor: SUB[r.top].cor}
    ]});
    b.push({t: 'barras', titulo: 'Escore total', nota: 'A escala n\u00e3o tem pontos de corte consagrados. Quanto maior a barra, maior a dificuldade relatada.', itens: [
        {rot: 'Total dos 36 itens', txt: r.total + ' pontos (m\u00ednimo 36, m\u00e1ximo 180)', pct: (r.total - 36) / 144 * 100, cor: '#ad1457'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a DERS mede', x: 'As dificuldades da pessoa para lidar com as emo\u00e7\u00f5es quando est\u00e1 chateada: perceber e entender o que sente, aceitar o que sente, controlar o comportamento, manter o foco no que precisa fazer e encontrar formas de se sentir melhor.'},
        {t: 'Como interpretar', x: 'Quanto maior o escore (de 36 a 180), maior a dificuldade relatada. Como n\u00e3o existem faixas de gravidade consagradas, o mais \u00fatil \u00e9 olhar o perfil das seis subescalas e comparar a pessoa com ela mesma em outros momentos.'},
        {t: 'Um cuidado com a Consci\u00eancia', x: 'A subescala Consci\u00eancia se comporta de modo diferente das outras: nos estudos brasileiros ela se relaciona pouco com as demais subescalas (Cancian et al., 2019). Por isso vale olh\u00e1-la separadamente do escore total.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico, n\u00e3o indica a causa das dificuldades e mostra apenas como a pessoa percebe a si mesma. N\u00e3o substitui a entrevista cl\u00ednica.'}
    ]});
    var bars = r.sub.map(function (d, ix) {
        return {rot: SUB[ix].nome + ' (' + d.n + ' itens)', txt: d.soma + ' pontos, de ' + d.min + ' a ' + d.max + ' | m\u00e9dia ' + fmt(d.media), pct: (d.soma - d.min) / (d.max - d.min) * 100, cor: SUB[ix].cor};
    });
    b.push({t: 'barras', titulo: 'Perfil por subescala', nota: 'Cada barra vai do m\u00ednimo ao m\u00e1ximo poss\u00edvel da subescala. N\u00e3o h\u00e1 faixas de refer\u00eancia para as subescalas.', itens: bars});
    b.push({t: 'textos', titulo: 'O que cada subescala mostra', itens: r.sub.map(function (d, ix) {
        return {t: SUB[ix].nome + ' - ' + d.soma + ' de ' + d.max + ' pontos (itens ' + d.idx.map(function (q) { return q + 1; }).sort(function (a, c) { return a - c; }).join(', ') + ')', x: SUB[ix].desc};
    })});
    var cinco = [], conta = [];
    r.sub.forEach(function (d, ix) {
        var l = d.idx.filter(function (q) { return r.v[q] === 5; }).map(function (q) { return q + 1; }).sort(function (a, c) { return a - c; });
        if (l.length) cinco.push(SUB[ix].nome + ': ' + l.join(', '));
    });
    for (i = 0; i < ITENS.length; i++) { if (ITENS[i].inv) conta.push('item ' + (i + 1) + ': respondeu ' + r.raw[i] + ' e vale 6 - ' + r.raw[i] + ' = ' + r.v[i]); }
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Cada resposta vale de 1 (quase nunca) a 5 (quase sempre). Nos itens 1, 2, 6, 7, 8, 10, 17, 20, 22, 24 e 34, que falam de algo positivo (como "tenho clareza sobre os meus sentimentos"), a conta \u00e9 invertida: vale 6 menos a resposta. Com as respostas desta pessoa: ' + conta.slice(0, 3).join('; ') + '. A soma dos 36 itens \u00e9 o escore total e cada subescala soma os seus itens.'},
        {t: 'Itens com pontua\u00e7\u00e3o m\u00e1xima (5 pontos)', x: cinco.length ? cinco.join(' | ') + '. \u00c9 apenas a descri\u00e7\u00e3o das respostas dadas, sem leitura cl\u00ednica por si s\u00f3.' : 'Nenhum item atingiu a pontua\u00e7\u00e3o m\u00e1xima.'}
    ]});
    var linhas = ITENS.map(function (it, ix) {
        var sn = '';
        r.sub.forEach(function (d, si) { if (d.idx.indexOf(ix) >= 0) sn = SUB[si].nome; });
        return {c: [String(ix + 1), it.texto, sn, OPCOES[r.raw[ix] - 1].texto, String(r.v[ix]) + (it.inv ? ' (inv.)' : '')]};
    });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Item', w: 108, al: 'l'}, {h: 'Subescala', w: 22, al: 'c'}, {h: 'Resposta', w: 30, al: 'c'}, {h: 'Pontos', w: 14, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 1 && x <= 5)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'ders', nome: 'DERS', cor: '#ad1457', cor2: '#6a1b9a', escalaPainel: ['DERS'],
    sub1: 'Escala de Dificuldades na Regula\u00e7\u00e3o Emocional (Difficulties in Emotion Regulation Scale) - 36 itens',
    sub2: 'Gratz e Roemer (2004) | valida\u00e7\u00f5es brasileiras: Cancian et al. (2019); Machado et al. (2020)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_DERS = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, DOMINIOS: DOMINIOS};

})();
