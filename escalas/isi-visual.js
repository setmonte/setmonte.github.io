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
            if (b.titulo) secao(c, b.titulo);
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
            c.need(30); if (b.titulo) secao(c, b.titulo);
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

// isi-visual.js - ISI (Insomnia Severity Index / Indice de Gravidade de Insonia), 7 itens 0-4, total 0-28. Tela e PDF dos mesmos blocos.
// Calculo mantido como no site e conferido com Bastien, Valli\u00e9res e Morin (2001): 0-7 sem insonia clinica; 8-14 sublimiar; 15-21 clinica moderada;
// 22-28 clinica grave. Informacao adicional (Morin et al., 2011): ponto de corte otimo 10 na comunidade (sensibilidade 86,1%; especificidade 87,7%)
// e 11 em amostra clinica. Retirados: cores de alarme; sem recomendacao de conduta.
// d.respostas: chaves 1..7, valores 0-4 (igual ao registro antigo).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Dificuldade para pegar no sono (adormecer)",grupo:"grupo1"},
{texto:"Dificuldade para permanecer dormindo (acordar durante a noite)",grupo:"grupo1"},
{texto:"Problemas para acordar muito cedo (antes do hor\u00e1rio desejado)",grupo:"grupo1"},
{texto:"Qu\u00e3o SATISFEITO(A)/insatisfeito(a) voc\u00ea est\u00e1 com seu padr\u00e3o de sono atual?",grupo:"grupo2"},
{texto:"Em que medida voc\u00ea acha que seu problema de sono INTERFERE no seu funcionamento di\u00e1rio (fadiga, concentra\u00e7\u00e3o, mem\u00f3ria, humor)?",grupo:"grupo3"},
{texto:"Em que medida os outros PERCEBEM que seu problema de sono prejudica sua qualidade de vida?",grupo:"grupo3"},
{texto:"Qu\u00e3o PREOCUPADO(A) voc\u00ea est\u00e1 com seu problema de sono atual?",grupo:"grupo4"}
];

var OPCOES_GRUPO={
grupo1:[{valor:0,texto:"Nenhuma"},{valor:1,texto:"Leve"},{valor:2,texto:"Moderada"},{valor:3,texto:"Grave"},{valor:4,texto:"Muito grave"}],
grupo2:[{valor:0,texto:"Muito satisfeito(a)"},{valor:1,texto:"Satisfeito(a)"},{valor:2,texto:"Neutro"},{valor:3,texto:"Insatisfeito(a)"},{valor:4,texto:"Muito insatisfeito(a)"}],
grupo3:[{valor:0,texto:"Nada"},{valor:1,texto:"Um pouco"},{valor:2,texto:"Razoavelmente"},{valor:3,texto:"Muito"},{valor:4,texto:"Muit\u00edssimo"}],
grupo4:[{valor:0,texto:"Nada"},{valor:1,texto:"Um pouco"},{valor:2,texto:"Razoavelmente"},{valor:3,texto:"Muito"},{valor:4,texto:"Muit\u00edssimo"}]
};

var FAIXAS = [
    {de: 0, ate: 8, nome: 'Sem ins\u00f4nia cl\u00ednica', rot: '0 a 7', cor: '#607d8b', fundo: '#eceff1', cortexto: '#37474f'},
    {de: 8, ate: 15, nome: 'Ins\u00f4nia sublimiar', rot: '8 a 14', cor: '#f9a825', fundo: '#fff8e1', cortexto: '#8a5a00'},
    {de: 15, ate: 22, nome: 'Ins\u00f4nia cl\u00ednica moderada', rot: '15 a 21', cor: '#fb8c00', fundo: '#ffe0b2', cortexto: '#bf5600'},
    {de: 22, ate: 29, nome: 'Ins\u00f4nia cl\u00ednica grave', rot: '22 a 28', cor: '#e64a19', fundo: '#ffccbc', cortexto: '#9c2c0c'}
];
var TXT = [
    'A pontua\u00e7\u00e3o est\u00e1 na faixa de aus\u00eancia de ins\u00f4nia clinicamente significativa.',
    'A pontua\u00e7\u00e3o indica sintomas de ins\u00f4nia presentes, mas abaixo do n\u00edvel cl\u00ednico (sublimiar). Vale acompanhar a evolu\u00e7\u00e3o.',
    'A pontua\u00e7\u00e3o est\u00e1 na faixa de ins\u00f4nia cl\u00ednica de gravidade moderada.',
    'A pontua\u00e7\u00e3o est\u00e1 na faixa de ins\u00f4nia cl\u00ednica de gravidade grave.'
];
var REFS = [
    'BASTIEN, C. H.; VALLI\u00c8RES, A.; MORIN, C. M. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Medicine, v. 2, n. 4, p. 297-307, 2001.',
    'MORIN, C. M.; BELLEVILLE, G.; B\u00c9LANGER, L.; IVERS, H. The Insomnia Severity Index: psychometric indicators to detect insomnia cases and evaluate treatment response. Sleep, v. 34, n. 5, p. 601-608, 2011.',
    'CASTRO, L. S. Adapta\u00e7\u00e3o e valida\u00e7\u00e3o do \u00cdndice de Gravidade de Ins\u00f4nia (IGI): caracteriza\u00e7\u00e3o populacional, valores normativos e aspectos associados. Disserta\u00e7\u00e3o (Mestrado) - Universidade Federal de S\u00e3o Paulo, 2011. (Ano conforme cita\u00e7\u00e3o anterior do site.)',
    'MORIN, C. M. Insomnia: psychological assessment and management. New York: Guilford Press, 1993.'
];
var AVISO = 'O ISI \u00e9 um instrumento de rastreio e de acompanhamento da gravidade percebida da ins\u00f4nia (\u00faltimas 2 semanas); n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica do sono. As faixas (0-7, 8-14, 15-21 e 22-28) s\u00e3o as da publica\u00e7\u00e3o original (Bastien et al., 2001). Em Morin et al. (2011), o ponto de corte \u00f3timo para identificar casos de ins\u00f4nia foi 10 na comunidade (sensibilidade 86,1% e especificidade 87,7%) e 11 em amostra cl\u00ednica. Os resultados devem ser interpretados por profissional qualificado, junto com a hist\u00f3ria cl\u00ednica.';

function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('ISI: respostas incompletas');
    var r = {v: [], total: 0}, i;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x >= 0 && x <= 4)) throw new Error('ISI: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
    }
    r.faixa = 0;
    for (i = 0; i < FAIXAS.length; i++) { if (r.total < FAIXAS[i].ate) { r.faixa = i; break; } }
    r.sint = r.v[0] + r.v[1] + r.v[2];
    r.imp = r.v[3] + r.v[4] + r.v[5] + r.v[6];
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return FAIXAS[r.faixa].nome; }
function dadosPainel() { return {}; }
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var f = FAIXAS[r.faixa], b = [], i;
    b.push({t: 'hero', fundo: f.fundo, borda: f.cor, cor: f.cortexto, titulo: 'Escore ' + r.total + ' / 28', sub: f.nome + ' (faixa ' + f.rot + ')'});
    b.push({t: 'faixas', titulo: 'Faixas de pontua\u00e7\u00e3o', min: 0, max: 29, pino: r.total + 0.5, ativo: r.faixa, faixas: FAIXAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    b.push({t: 'barras', titulo: 'Pontua\u00e7\u00e3o por item (0 a 4)', itens: ITENS.map(function (it, ix) {
        var op = OPCOES_GRUPO[it.grupo][r.v[ix]].texto;
        return {rot: 'Item ' + (ix + 1), txt: op + ' (' + r.v[ix] + ' de 4)', pct: r.v[ix] / 4 * 100, cor: '#3949ab'};
    })});
    var t = [{t: 'Resultado', x: TXT[r.faixa]}];
    t.push({t: 'Composi\u00e7\u00e3o do escore (descritivo)', x: 'Sintomas de sono (itens 1 a 3): ' + r.sint + ' de 12. Satisfa\u00e7\u00e3o, interfer\u00eancia, percep\u00e7\u00e3o dos outros e preocupa\u00e7\u00e3o (itens 4 a 7): ' + r.imp + ' de 16.'});
    t.push({t: 'Pontos de corte da literatura', x: 'As faixas usadas s\u00e3o as da publica\u00e7\u00e3o original. Em Morin et al. (2011), o ponto de corte \u00f3timo para identificar casos de ins\u00f4nia foi 10 na comunidade (sensibilidade 86,1%, especificidade 87,7%) e 11 em amostra cl\u00ednica.'});
    b.push({t: 'textos', titulo: 'An\u00e1lise', itens: t});
    var linhas = ITENS.map(function (it, ix) { return {c: [String(ix + 1), it.texto, OPCOES_GRUPO[it.grupo][r.v[ix]].texto, String(r.v[ix])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', cols: [{h: '#', w: 8, al: 'c'}, {h: 'Item', w: 102, al: 'l'}, {h: 'Resposta', w: 50, al: 'c'}, {h: 'Pontos', w: 20, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 0 && x <= 4)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'isi', nome: 'ISI', cor: '#1a237e', cor2: '#00897b', escalaPainel: ['ISI'],
    sub1: '\u00cdndice de Gravidade de Ins\u00f4nia (Insomnia Severity Index) - 7 itens, \u00faltimas 2 semanas',
    sub2: 'Bastien, Valli\u00e8res e Morin (2001) | adapta\u00e7\u00e3o brasileira: Castro (2011)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_ISI = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES_GRUPO: OPCOES_GRUPO, FAIXAS: FAIXAS};

})();
