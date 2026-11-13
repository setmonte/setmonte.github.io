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

// csbd19-visual.js - CSBD-19 (Compulsive Sexual Behavior Disorder Scale, Bothe et al., 2020), 19 itens, concordancia 1-4, ultimos 6 meses, soma 19-76.
// REFEITA com o TEXTO OFICIAL em portugues do Brasil (traducao de Marco Scanavino, arquivo dos autores no OSF). Os itens da pagina antiga NAO eram os oficiais
// (eram frases reescritas, em escala de FREQUENCIA, com fatores 4/4/4/3/4). Oficial: escala de CONCORDANCIA; fatores 3/3/3/3/7:
// Controle 1,6,11; Saliencia 2,7,12; Recaida 3,8,13; Insatisfacao 4,9,14; Consequencias negativas 5,10,15-19. Ponto de corte oficial: >= 50 (alto risco de CSBD).
// Removidas as faixas de risco (35/45/55) e de intensidade por media (1,5/2,0/2,5...), sem fonte.
// d.respostas: chaves 1..19 com a resposta 1-4; registros SEM versaoEscala:2 usam os itens antigos e NAO sao recalculados.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[{"texto":"Embora o meu comportamento sexual seja irrespons\u00e1vel ou imprudente, tenho dificuldade em parar."},{"texto":"O sexo tem sido a coisa mais importante na minha vida."},{"texto":"Eu fui capaz de resistir por pouco tempo aos meus impulsos sexuais, at\u00e9 que me rendi a eles."},{"texto":"Eu fiz sexo mesmo quando eu n\u00e3o estava mais gostando."},{"texto":"Os meus desejos e impulsos sexuais mudaram-me de forma negativa."},{"texto":"N\u00e3o consigo controlar a minha vontade e desejo sexual."},{"texto":"Preferia ter rela\u00e7\u00f5es sexuais do que fazer qualquer outra coisa."},{"texto":"A tentativa de reduzir a quantidade de rela\u00e7\u00f5es sexuais que tinha quase nunca funcionou."},{"texto":"Embora as rela\u00e7\u00f5es sexuais j\u00e1 n\u00e3o fossem t\u00e3o satisfat\u00f3rias como antes, continuei a t\u00ea-las."},{"texto":"N\u00e3o realizei tarefas importantes devido ao meu comportamento sexual."},{"texto":"Meus desejos sexuais me controlavam."},{"texto":"Quando eu tinha a oportunidade de fazer sexo, qualquer outra coisa se tornava irrelevante."},{"texto":"N\u00e3o fui bem-sucedido a reduzir a quantidade de rela\u00e7\u00f5es sexuais que tinha."},{"texto":"Embora a minha vida sexual n\u00e3o fosse t\u00e3o satisfat\u00f3ria como antes, tive rela\u00e7\u00f5es sexuais."},{"texto":"As minhas atividades sexuais interferiram com o meu trabalho e/ou educa\u00e7\u00e3o."},{"texto":"Os meus comportamentos sexuais tiveram um impacto negativo nas minhas rela\u00e7\u00f5es com os outros."},{"texto":"J\u00e1 fiquei perturbado devido aos meus comportamentos sexuais."},{"texto":"As minhas atividades sexuais interferiram com a minha capacidade de experienciar rela\u00e7\u00f5es sexuais saud\u00e1veis."},{"texto":"\u00c9 frequente dar por mim em situa\u00e7\u00f5es embara\u00e7osas devido ao meu comportamento sexual."}];
var OPCOES=[{"valor":1,"texto":"Discordo totalmente"},{"valor":2,"texto":"Discordo parcialmente"},{"valor":3,"texto":"Concordo parcialmente"},{"valor":4,"texto":"Concordo totalmente"}];

var FAT = [
    {k: 'Controle', nome: 'Controle', idx: [1, 6, 11], cor: '#880e4f', desc: 'Dificuldade de controlar os impulsos, desejos e a vontade sexual.'},
    {k: 'Saliencia', nome: 'Sali\u00eancia', idx: [2, 7, 12], cor: '#6a1b9a', desc: 'O sexo ocupa um lugar central e passa na frente de outras coisas importantes.'},
    {k: 'Recaida', nome: 'Reca\u00edda', idx: [3, 8, 13], cor: '#00796b', desc: 'Tentativas de resistir ou de reduzir o comportamento sexual que n\u00e3o funcionam.'},
    {k: 'Insatisfacao', nome: 'Insatisfa\u00e7\u00e3o', idx: [4, 9, 14], cor: '#ef6c00', desc: 'Continuar com o comportamento sexual mesmo sem obter o mesmo prazer ou satisfa\u00e7\u00e3o.'},
    {k: 'ConsequenciasNegativas', nome: 'Consequ\u00eancias negativas', curto: 'Consequ\u00eancias', idx: [5, 10, 15, 16, 17, 18, 19], cor: '#455a64', desc: 'Preju\u00edzos no trabalho ou nos estudos, nas rela\u00e7\u00f5es com os outros, na sa\u00fade sexual e sofrimento causados pelo comportamento sexual.'}
];
var CORTE = 50;
var REFS = [
    'B\u0150THE, B. et al. The development of the Compulsive Sexual Behavior Disorder Scale (CSBD-19): an ICD-11 based screening measure across three languages. Journal of Behavioral Addictions, v. 9, n. 2, p. 247-258, 2020. DOI: 10.1556/2006.2020.00034.',
    'B\u0150THE, B. et al. Compulsive sexual behavior disorder in 42 countries: insights from the International Sex Survey and introduction of standardized assessment tools. Journal of Behavioral Addictions, v. 12, n. 2, p. 393-407, 2023. DOI: 10.1556/2006.2023.00028.',
    'SCANAVINO, M. (trad.). Compulsive Sexual Behavior Disorder Scale (CSBD-19): tradu\u00e7\u00e3o para o portugu\u00eas do Brasil. In: B\u0150THE, B. et al. International Sex Survey: translations. Open Science Framework, 2022. Dispon\u00edvel em: https://osf.io/jcz96/.',
    'WORLD HEALTH ORGANIZATION. International classification of diseases: eleventh revision (ICD-11). Geneva: WHO, 2019.'
];
var AVISO = 'A CSBD-19 \u00e9 uma escala de rastreio, baseada nos crit\u00e9rios da CID-11 para o transtorno do comportamento sexual compulsivo, que reflete o que a pr\u00f3pria pessoa relata sobre os \u00faltimos 6 meses; n\u00e3o \u00e9 diagn\u00f3stico. Os autores a descrevem como uma primeira etapa, que deve ser seguida de entrevista cl\u00ednica, e o ponto de corte de 50 pontos foi definido em amostras da comunidade, ainda precisando de valida\u00e7\u00e3o em pessoas em tratamento. Ter muitos comportamentos sexuais n\u00e3o \u00e9, por si s\u00f3, um problema: a escala investiga perda de controle, preju\u00edzo e sofrimento. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado.';

function vnum(x) { return typeof x === 'object' && x !== null ? x.valor : x; }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('CSBD-19: respostas incompletas');
    var r = {v: [], total: 0, fat: []}, i, f;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vnum(vals[i]), 10);
        if (!(x >= 1 && x <= 4)) throw new Error('CSBD-19: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
    }
    for (f = 0; f < FAT.length; f++) {
        var s = 0; FAT[f].idx.forEach(function (q) { s += r.v[q - 1]; });
        r.fat.push({k: FAT[f].k, soma: s, min: FAT[f].idx.length, max: FAT[f].idx.length * 4});
    }
    r.alto = r.total >= CORTE;
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return r.alto ? 'Rastreio positivo (50 pontos ou mais)' : 'Rastreio negativo (abaixo de 50 pontos)'; }
function dadosPainel(r) {
    var o = {};
    r.fat.forEach(function (d) { o[d.k] = {pontuacao: d.soma, max: d.max, classificacao: d.soma + ' de ' + d.max + ' pontos'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var b = [], i;
    b.push({t: 'hero', fundo: r.alto ? '#fce4ec' : '#eceff1', borda: r.alto ? '#880e4f' : '#607d8b', cor: r.alto ? '#880e4f' : '#37474f', titulo: 'Escore ' + r.total + ' de 76 pontos (m\u00ednimo 19)', sub: r.alto ? 'No ponto de corte de 50 pontos ou acima (rastreio positivo)' : 'Abaixo do ponto de corte de 50 pontos (rastreio negativo)'});
    b.push({t: 'cards', itens: r.fat.map(function (d, ix) { return {rot: (FAT[ix].curto || FAT[ix].nome).toUpperCase(), valor: d.soma + ' / ' + d.max, de: 'itens ' + FAT[ix].idx.join(', '), cor: FAT[ix].cor}; })});
    b.push({t: 'faixas', titulo: 'Escore total e ponto de corte dos autores', min: 0, max: 77, pino: r.total + 0.5, ativo: r.alto ? 1 : 0, faixas: [{de: 0, ate: 50, cor: '#90a4ae', rot: '19 a 49'}, {de: 50, ate: 77, cor: '#880e4f', rot: '50 a 76'}]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a CSBD-19 mede', x: 'O quanto a pessoa concorda, pensando nos \u00faltimos 6 meses, com 19 frases sobre pensamentos, sentimentos e comportamentos sexuais. As frases acompanham os crit\u00e9rios do transtorno do comportamento sexual compulsivo na CID-11: controle, sali\u00eancia, reca\u00edda, insatisfa\u00e7\u00e3o e consequ\u00eancias negativas. Nas instru\u00e7\u00f5es, "sexo" inclui qualquer atividade ou comportamento feito para produzir orgasmo ou prazer sexual, com ou sem parceiro(a).'},
        {t: 'Como interpretar', x: 'Cada resposta vale de 1 (discordo totalmente) a 4 (concordo totalmente), e a soma vai de 19 a 76. Os autores indicam 50 pontos como ponto de corte para identificar pessoas com alto risco de ter o transtorno (B\u0151the et al., 2020). Os cinco fatores mostram em que parte do quadro a pessoa mais se reconhece.'},
        {t: 'Sobre o ponto de corte', x: 'O corte de 50 foi definido em amostras da comunidade, e n\u00e3o em pacientes. Os autores lembram que a escala \u00e9 s\u00f3 a primeira etapa de triagem, seguida de entrevista cl\u00ednica. Num estudo com 82.243 pessoas de 42 pa\u00edses, incluindo o Brasil, 4,8% ficaram no grupo de alto risco (B\u0151the et al., 2023).'},
        {t: 'Um cuidado na entrevista', x: 'A literatura aponta que pessoas que desaprovam moralmente o pr\u00f3prio comportamento sexual podem se perceber com mais problemas do que o comportamento em si indica (incongru\u00eancia moral). Vale explorar isso na entrevista.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o mede a quantidade de comportamento sexual: mede perda de controle, preju\u00edzo e sofrimento relatados. Depende de a pessoa responder com franqueza. N\u00e3o substitui a avalia\u00e7\u00e3o cl\u00ednica.'}
    ]});
    b.push({t: 'barras', titulo: 'Os cinco fatores', nota: 'Cada barra vai do m\u00ednimo ao m\u00e1ximo do fator. Os fatores n\u00e3o t\u00eam ponto de corte pr\u00f3prio.', itens: r.fat.map(function (d, ix) {
        return {rot: FAT[ix].nome + ' (' + FAT[ix].idx.length + ' itens)', txt: d.soma + ' de ' + d.max + ' pontos (m\u00ednimo ' + d.min + ')', pct: (d.soma - d.min) / (d.max - d.min) * 100, cor: FAT[ix].cor};
    })});
    b.push({t: 'textos', titulo: 'O que cada fator mostra', itens: FAT.map(function (f, ix) { return {t: f.nome + ' - ' + r.fat[ix].soma + ' de ' + r.fat[ix].max + ' pontos (itens ' + f.idx.join(', ') + ')', x: f.desc}; })});
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Soma das respostas dos 19 itens (1 a 4): ' + r.v.join(' + ') + ' = ' + r.total + ' pontos, de um m\u00ednimo de 19 e um m\u00e1ximo de 76. Controle = itens 1, 6 e 11; sali\u00eancia = 2, 7 e 12; reca\u00edda = 3, 8 e 13; insatisfa\u00e7\u00e3o = 4, 9 e 14; consequ\u00eancias negativas = 5, 10 e 15 a 19. Nenhum item \u00e9 invertido.'}
    ]});
    var fn = function (n) { var nome = ''; FAT.forEach(function (f) { if (f.idx.indexOf(n) >= 0) nome = f.nome; }); return nome; };
    b.push({t: 'tabela', titulo: 'Respostas (pensando nos \u00faltimos 6 meses)', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Fator', w: 24, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 100, al: 'l'}, {h: 'Resposta', w: 34, al: 'c'}, {h: 'Pontos', w: 16, al: 'c'}], linhas: ITENS.map(function (it, ix) { return {c: [String(ix + 1), fn(ix + 1), it.texto, OPCOES[r.v[ix] - 1].texto, String(r.v[ix])]}; })});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    if (d.versaoEscala !== 2) return null;     // registros antigos usam os itens antigos (nao oficiais): nao recalcular
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 1 && x <= 4)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'csbd19', nome: 'CSBD-19', cor: '#880e4f', cor2: '#455a64', escalaPainel: ['CSBD-19'],
    sub1: 'Escala do Transtorno do Comportamento Sexual Compulsivo (Compulsive Sexual Behavior Disorder Scale) - 19 itens, \u00faltimos 6 meses',
    sub2: 'B\u0151the et al. (2020; 2023) | tradu\u00e7\u00e3o para o portugu\u00eas do Brasil: M. Scanavino',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_CSBD19 = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES};

})();
