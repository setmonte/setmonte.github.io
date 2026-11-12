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

// qiiahsd-visual.js - QIIAHSD-R (Questionario de Identificacao de Indicadores de Altas Habilidades/Superdotacao - Responsaveis), perguntas 5 a 63.
// Instrumento de PEREZ, S. G. P. B.; FREITAS, S. N. Manual de identificacao de Altas Habilidades/Superdotacao. Guarapuava: Apprehendere, 2016
// (formularios com a nota "(c) Dra. Susana Graciela Perez Barrera Perez (2016)"). Conferido no proprio manual (pp. 75-91):
//  - o manual diz que NAO existe gabarito: a interpretacao compara cada resposta com o "Quadro 2 - respostas mais comuns em pessoas com AH/SD" e
//    a confirmacao dos indicadores exige constatar intensidade e frequencia durante um periodo longo (4 meses a 1 ano) e comparar fontes.
//  - por isso a versao anterior do site (soma 1-5 e rotulos Baixa/Media/Alta/Muito Alta) foi SUBSTITUIDA: nao ha soma, ponto de corte nem classificacao.
//    O relatorio mostra cada resposta ao lado da resposta mais comum e conta, de forma DESCRITIVA, quantas coincidem.
//  - as perguntas 5 a 9 sao ABERTAS (idade em que comecou a ler, horas de leitura, assuntos, idade dos amigos, areas): agora sao campos de texto,
//    nao escala de frequencia. Perguntas 10 a 63: Nunca, Raramente, As vezes, Frequentemente, Sempre (valores 1-5 guardados, como antes).
//  - blocos como no livro: Caracteristicas Gerais (5-18), Habilidade Acima da Media (19-30), Criatividade (31-45), Comprometimento com a Tarefa (46-58),
//    Lideranca (59-63). A versao anterior chamava as perguntas 10-18 + 59 de "Comunicacao" (nome inexistente no livro).
//  - REGISTROS ANTIGOS (sem versaoEscala = 2): chaves 1..59 na ordem antiga da pagina; as 5 abertas foram respondidas em escala de frequencia e sao
//    desconsideradas; as perguntas 10-63 sao reaproveitadas.
// d.respostas (v2): chaves 10..63 com valores 1-5; d.abertas: chaves 5..9 com texto.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var BLOCOS = {
"Caracter\u00edsticas Gerais":[
"Com quantos anos seu/sua filho/a come\u00e7ou a ler (n\u00e3o s\u00f3 o seu nome, mas frases)?",
"Ele/ela l\u00ea por conta pr\u00f3pria livros de seu interesse? (fora os da escola). Quantos por ano?",
"Sobre que assuntos seu/sua filho/a mais gosta de conversar ou estudar ou que atividades mais gosta de fazer?",
"Que idade t\u00eam os/as 4 melhores amigos/as dele/dela?",
"Em quais \u00e1reas seu/sua filho/a \u00e9 um/uma dos/das melhores da sua turma?"
],
"Comunica\u00e7\u00e3o":[
"Seu/sua filho/a se sente diferente aos seus colegas na maneira de pensar, sentir ou agir?",
"Seu/sua filho/a prefere trabalhar/estudar/treinar/praticar sozinho/a?",
"Seu/sua filho/a prefere ler livros mais dif\u00edceis, ou enciclop\u00e9dias, biografias ou atlas?",
"Seu/sua filho/a \u00e9 independente e faz as coisas sozinho/a?",
"Seu/sua filho/a tem senso de humor e \u00e0s vezes encontra humor em situa\u00e7\u00f5es que n\u00e3o s\u00e3o humor\u00edsticas para os demais?",
"Seu/sua filho/a se preocupa com temas que normalmente interessam aos adultos, como viol\u00eancia, corrup\u00e7\u00e3o, fome, injusti\u00e7a?",
"Seu/sua filho/a \u00e9 perfeccionista?",
"Ele/a \u00e9 mais observador/a que seus colegas, percebendo coisas que os demais n\u00e3o percebem?",
"Seu/sua filho/a gosta e prefere jogar xadrez ou jogos de estrat\u00e9gia?",
"Seu/sua filho/a \u00e9 autossuficiente?"
],
"Lideran\u00e7a":[
"Seu/sua filho/a \u00e9 escolhido/a pelos seus colegas e amigos para fun\u00e7\u00f5es de l\u00edder (l\u00edder de turma, coordenador/a)?",
"Ele/ela \u00e9 cooperativo/a com os demais?",
"Ele/ela tende a organizar o grupo?",
"Ele/ela sabe se expressar bem e convence os outros com os seus argumentos?"
],
"Habilidade Acima da M\u00e9dia":[
"A mem\u00f3ria dele/a \u00e9 muito destacada, especialmente em assuntos do seu interesse?",
"Ele/ela tem muitas informa\u00e7\u00f5es sobre os temas que s\u00e3o de seu interesse?",
"Seu/sua filho/a conhece mais palavras que seus colegas, ou palavras mais dif\u00edceis e complexas que seus colegas n\u00e3o conhecem?",
"Ele/a tenta entender coisas complicadas examinando-as parte por parte?",
"Seu/sua filho/a aprende rapidamente coisas que lhe interessam e usa o que aprendeu em outras \u00e1reas?",
"Seu/sua filho/a percebe facilmente as rela\u00e7\u00f5es entre as partes e o todo?",
"Normalmente, seu/sua filho/a aprende mais de uma hist\u00f3ria, um filme, etc. do que as outras crian\u00e7as de sua idade?",
"Seu/sua filho/a tenta descobrir o 'como' e o 'porqu\u00ea' das coisas fazendo perguntas inteligentes?",
"As notas ou conceitos do/a seu/sua filho/a na escola s\u00e3o melhores que as dos demais colegas da sua turma?",
"Seu/sua filho/a aprende mais r\u00e1pido que seus colegas?",
"Seu/sua filho/a se adapta facilmente a situa\u00e7\u00f5es novas ou as modifica?",
"Seu/sua filho/a tem um pensamento abstrato muito desenvolvido?"
],
"Criatividade":[
"As ideias que ele/ela prop\u00f5e s\u00e3o vistas como diferentes ou esquisitas pelos demais?",
"Seu/sua filho/a \u00e9 muito curioso/a?",
"Seu/sua filho/a tem muitas ideias, solu\u00e7\u00f5es e respostas incomuns, diferentes e inteligentes?",
"Seu/sua filho/a gosta de arriscar-se?",
"Ele/a gosta de enfrentar desafios?",
"Ele/ela \u00e9 muito imaginativo/a e inventivo/a?",
"Ele/a \u00e9 sens\u00edvel \u00e0s coisas bonitas?",
"Seu/sua filho/a \u00e9 inconformista e n\u00e3o se importa em ser diferente?",
"Seu/sua filho/a sabe compreender ideias diferentes das suas?",
"Fica chateado/a quando tem que repetir um exerc\u00edcio de algo que j\u00e1 sabe?",
"Ele/a descobre novos e diferentes caminhos para solucionar problemas?",
"Ele/ela \u00e9 questionador/a quando algum adulto fala algo com o qual n\u00e3o concorda?",
"Ele/a presta aten\u00e7\u00e3o, mesmo que o assunto n\u00e3o lhe interesse?",
"Os cadernos dele/a s\u00e3o completos e organizados?",
"Ele/a gosta de cumprir regras?"
],
"Comprometimento com a Tarefa":[
"Seu/sua filho/a dedica muito mais tempo e energia a algum tema ou atividade que gosta ou que lhe interessa?",
"Seu/sua filho/a \u00e9 muito exigente e cr\u00edtico/a consigo mesmo/a, e nunca fica satisfeito/a com o que faz?",
"Seu/sua filho/a insiste em buscar solu\u00e7\u00f5es para os problemas?",
"Ele/a tem sua pr\u00f3pria organiza\u00e7\u00e3o?",
"Seu/sua filho/a \u00e9 muito seguro/a e, \u00e0s vezes, teimoso/a, em suas convic\u00e7\u00f5es?",
"Ele/a precisa de muito est\u00edmulo para terminar um trabalho que lhe interessa?",
"Seu/sua filho/a deixa de fazer outras coisas para envolver-se numa atividade que lhe interessa?",
"Seu/sua filho/a sabe identificar as \u00e1reas de dificuldade que podem surgir em uma atividade?",
"Seu/sua filho/a sabe estabelecer prioridades com facilidade?",
"Ele/a consegue prever as etapas e os detalhes para realizar uma atividade?",
"Ele/ela \u00e9 persistente nas atividades que lhe interessam e busca concluir as tarefas?",
"Seu/sua filho/a \u00e9 interessado/a e eficiente na organiza\u00e7\u00e3o de tarefas?",
"Ele/ela sabe distinguir as consequ\u00eancias e os efeitos de a\u00e7\u00f5es?"
]
};

var FLAT = [];
Object.keys(BLOCOS).forEach(function (k) { BLOCOS[k].forEach(function (t) { FLAT.push(t); }); });
// ordem antiga da pagina (i = 1..59) -> numero da pergunta no livro
function qDe(i) { if (i <= 14) return i + 4; if (i === 15) return 59; if (i <= 19) return i + 44; return i - 1; }
var TXT = {};
FLAT.forEach(function (t, ix) { TXT[qDe(ix + 1)] = t; });
var BLOCOS_LIVRO = [
    {nome: 'Caracter\u00edsticas Gerais', de: 5, ate: 18},
    {nome: 'Habilidade Acima da M\u00e9dia', de: 19, ate: 30},
    {nome: 'Criatividade', de: 31, ate: 45},
    {nome: 'Comprometimento com a Tarefa', de: 46, ate: 58},
    {nome: 'Lideran\u00e7a', de: 59, ate: 63}
];
var ROT = ['', 'Nunca', 'Raramente', '\u00c0s vezes', 'Frequentemente', 'Sempre'];
var NR = {43: 1, 44: 1, 45: 1, 51: 1};
var ABERTAS = {
    5: {comum: 'Antes dos 6 anos', num: true},
    6: {comum: 'Mais de 7 horas por semana', num: true},
    7: {comum: 'Pouco comuns para a faixa et\u00e1ria ou o meio social'},
    8: {comum: 'Muito mais velhos ou muito mais novos do que ele(a)'},
    9: {comum: 'Qualquer \u00e1rea'}
};
var REFS = [
    'P\u00c9REZ, S. G. P. B.; FREITAS, S. N. Manual de identifica\u00e7\u00e3o de Altas Habilidades/Superdota\u00e7\u00e3o. Guarapuava: Apprehendere, 2016. 121 p. ISBN 978-85-68398-11-1. (Question\u00e1rio de Identifica\u00e7\u00e3o de Indicadores de AH/SD - Respons\u00e1veis, QIIAHSD-R, perguntas 5 a 63; \u00a9 Dra. Susana Graciela P\u00e9rez Barrera P\u00e9rez, 2016.)'
];
var AVISO = 'Este relat\u00f3rio usa as perguntas 5 a 63 do QIIAHSD-R (P\u00e9rez e Freitas, 2016); n\u00e3o inclui as perguntas de identifica\u00e7\u00e3o e contexto socioecon\u00f4mico (1 a 4) nem o bloco de atividades art\u00edsticas e esportivas (64 a 78). Segundo o pr\u00f3prio manual, n\u00e3o existe gabarito: o instrumento \u00e9 interpretado comparando as respostas com as respostas mais comuns em pessoas com AH/SD (Quadro 2 do manual), e a exist\u00eancia dos indicadores s\u00f3 se confirma pela intensidade e frequ\u00eancia observadas durante um per\u00edodo mais longo (de 4 meses a 1 ano), cruzando mais de uma fonte (respons\u00e1veis, professores e o pr\u00f3prio aluno). A contagem de coincid\u00eancias mostrada aqui \u00e9 apenas descritiva: n\u00e3o \u00e9 escore, n\u00e3o tem ponto de corte e n\u00e3o classifica. Resultados devem ser interpretados por profissional qualificado.';

function esperado(q) { return NR[q] ? [1, 2] : [4, 5]; }
function comumTxt(q) {
    if (q === 27) return 'Frequentemente/Sempre (tipo acad\u00eamico) ou Raramente/Nunca (tipo produtivo-criativo)';
    return NR[q] ? 'Nunca/Raramente' : 'Frequentemente/Sempre';
}
function bloco(q) { for (var i = 0; i < BLOCOS_LIVRO.length; i++) { if (q >= BLOCOS_LIVRO[i].de && q <= BLOCOS_LIVRO[i].ate) return i; } return -1; }
function numero(s) { var v = parseFloat(String(s == null ? '' : s).replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(v) ? null : v; }

// entrada: {escala: {10..63: 1-5}, abertas: {5..9: texto}}
function calcular(entrada, extra) {
    extra = extra || {};
    if (!entrada || !entrada.escala) throw new Error('QIIAHSD: sem respostas');
    var r = {itens: [], blocos: BLOCOS_LIVRO.map(function (b) { return {nome: b.nome, comp: 0, coinc: 0}; }), extra: extra, legacy: !!extra.legacy, abertas: entrada.abertas || {}}, q;
    for (q = 5; q <= 9; q++) {
        var ab = ABERTAS[q], txt = String(r.abertas[q] == null ? '' : r.abertas[q]).trim(), st = 'avaliar';
        if (!r.legacy && ab.num) {
            var n = numero(txt);
            if (n === null) st = 'semdado';
            else if (q === 5) st = n < 6 ? 'coincide' : 'nao';
            else st = n > 7 ? 'coincide' : 'nao';
        }
        if (r.legacy) st = 'semdado';
        r.itens.push({q: q, aberta: true, texto: TXT[q], resp: txt, comum: ab.comum, status: st});
    }
    for (q = 10; q <= 63; q++) {
        var v = parseInt(entrada.escala[q], 10);
        if (!(v >= 1 && v <= 5)) throw new Error('QIIAHSD: resposta invalida na pergunta ' + q);
        var s = 'avaliar';
        if (q !== 27) s = esperado(q).indexOf(v) >= 0 ? 'coincide' : 'nao';
        r.itens.push({q: q, aberta: false, texto: TXT[q], v: v, resp: ROT[v], comum: comumTxt(q), status: s});
    }
    r.total = 0; r.comp = 0;
    r.itens.forEach(function (it) {
        var bi = bloco(it.q);
        if (it.status === 'coincide' || it.status === 'nao') {
            r.blocos[bi].comp++; r.comp++;
            if (it.status === 'coincide') { r.blocos[bi].coinc++; r.total++; }
        }
    });
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return 'Descritivo (sem classifica\u00e7\u00e3o): ' + r.total + ' de ' + r.comp + ' respostas coincidem com as mais comuns em AH/SD'; }
function dadosPainel(r) {
    var o = {};
    r.blocos.forEach(function (b) { o[b.nome] = {pontuacao: b.coinc, max: b.comp, classificacao: b.coinc + ' de ' + b.comp + ' coincidem'}; });
    return o;
}
function respostasObj(r) { var o = {}; r.itens.forEach(function (it) { if (!it.aberta) o[it.q] = it.v; }); return o; }
function abertasObj(r) { var o = {}; r.itens.forEach(function (it) { if (it.aberta) o[it.q] = it.resp; }); return o; }

var ST = {coincide: 'Sim', nao: 'N\u00e3o', avaliar: 'Avaliar', semdado: '-'};
function htmlQuestionario() {
    var h = '', i, q;
    BLOCOS_LIVRO.forEach(function (b) {
        h += '<div class="bloco"><div class="bloco-header">' + b.nome + '</div>';
        for (q = b.de; q <= b.ate; q++) {
            if (q <= 9) {
                h += '<div class="item-aberto" style="padding:14px 20px;border-bottom:1px solid #f0f0f0"><div class="item-texto"><span class="item-numero">' + q + '.</span> ' + TXT[q] + '</div><input type="text" id="ab' + q + '" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;font-size:15px" placeholder="' + (q === 5 ? 'Idade em anos (ex.: 4)' : q === 6 ? 'Horas por semana (ex.: 8)' : q === 8 ? 'Idade dos 4 melhores amigos (ex.: 12, 13, 8, 7)' : q === 9 ? 'At\u00e9 4 \u00e1reas, por ordem de import\u00e2ncia' : 'Resposta livre') + '"></div>';
                continue;
            }
            h += '<div class="item"><div class="item-texto"><span class="item-numero">' + q + '.</span> ' + TXT[q] + '</div><div class="opcoes">';
            for (i = 1; i <= 5; i++) h += '<div class="opcao"><input type="radio" id="q' + q + '_' + i + '" name="q' + q + '" value="' + i + '"><label for="q' + q + '_' + i + '">' + ROT[i] + '</label></div>';
            h += '</div></div>';
        }
        h += '</div>';
    });
    return h;
}
function blocks(r) {
    var b = [], leg = r.legacy;
    b.push({t: 'hero', fundo: '#e8eaf6', borda: '#3949ab', cor: '#1a237e', titulo: r.total + ' de ' + r.comp + ' respostas coincidem com as mais comuns em AH/SD',
        sub: 'Leitura descritiva pelo Quadro 2 do manual (P\u00e9rez e Freitas, 2016). N\u00e3o h\u00e1 soma, ponto de corte nem classifica\u00e7\u00e3o.'});
    if (leg) b.push({t: 'textos', itens: [{t: 'Registro da vers\u00e3o anterior', x: 'Este registro foi respondido na vers\u00e3o anterior da p\u00e1gina, em que as perguntas abertas 5 a 9 (idade em que come\u00e7ou a ler, horas de leitura, assuntos, idade dos amigos e \u00e1reas) eram respondidas em escala de frequ\u00eancia. Essas cinco respostas foram desconsideradas. As perguntas 10 a 63 foram reaproveitadas e comparadas ao Quadro 2; a soma e a classifica\u00e7\u00e3o "Baixa/M\u00e9dia/Alta" da vers\u00e3o anterior deixaram de ser usadas.'}]});
    b.push({t: 'barras', titulo: 'Respostas que coincidem com as mais comuns, por bloco', nota: 'Contagem descritiva. As perguntas marcadas "Avaliar" (7, 8, 9 e 27) pedem leitura qualitativa e ficam fora da contagem.',
        itens: r.blocos.map(function (x) { return {rot: x.nome, txt: x.coinc + ' de ' + x.comp + ' respostas coincidem', pct: x.comp ? x.coinc / x.comp * 100 : 0, cor: '#3949ab'}; })});
    var ab = [];
    r.itens.filter(function (it) { return it.aberta; }).forEach(function (it) {
        ab.push({t: 'Pergunta ' + it.q, x: it.texto + ' Resposta: ' + (it.resp || '(em branco)') + '. Resposta mais comum em AH/SD: ' + it.comum + '.' + (it.status === 'coincide' ? ' Coincide.' : (it.status === 'nao' ? ' N\u00e3o coincide.' : (it.status === 'avaliar' ? ' Avaliar qualitativamente.' : ''))), tag: ST[it.status] === '-' ? '' : ST[it.status], tagCor: it.status === 'coincide' ? '#3949ab' : '#78909c'});
    });
    ab.forEach(function (x) { if (!x.tag) { delete x.tag; delete x.tagCor; } });
    b.push({t: 'textos', titulo: 'Perguntas abertas (5 a 9)', itens: ab});
    b.push({t: 'textos', titulo: 'Cuidados na leitura (segundo o manual)', itens: [
        {t: 'N\u00e3o existe gabarito', x: 'O Quadro 2 mostra as respostas mais comuns em pessoas com AH/SD, mas as respostas podem ser afetadas por fatores individuais, familiares, sociais e educacionais, que n\u00e3o invalidam os indicadores, apenas podem camufl\u00e1-los ou subvaloriz\u00e1-los. A confirma\u00e7\u00e3o vem da intensidade e da frequ\u00eancia durante um per\u00edodo mais longo (de 4 meses a 1 ano) e da compara\u00e7\u00e3o com outras fontes.'},
        {t: 'Subavalia\u00e7\u00e3o', x: 'Pessoas com baixa autoestima, especialmente meninas, podem subavaliar os indicadores. As contradi\u00e7\u00f5es costumam aparecer no pr\u00f3prio question\u00e1rio, em entrevistas e nas respostas de segundas fontes.'},
        {t: 'Perguntas que variam com o contexto', x: 'Leitura precoce e volume de leitura (5 e 6) e xadrez (18) dependem das condi\u00e7\u00f5es econ\u00f4micas. As perguntas 27, 43, 44 e 45 podem diferir entre o tipo acad\u00eamico e o produtivo-criativo. Lideran\u00e7a (59, 60 e 62) nem sempre est\u00e1 presente. As perguntas 11 e 40 podem diferir em \u00e1reas art\u00edsticas ou esportivas. Perguntas sobre comportamentos mais incentivados em meninos (13, 34, 35, 50, 53, 54, 55, 59 e 62) tendem a ter "frequentemente/sempre" menos vezes em meninas; no estudo piloto do manual, na pergunta 35 foram 54,5% das meninas contra 88,9% dos meninos. Na pergunta 37 (sensibilidade a coisas bonitas) a rela\u00e7\u00e3o foi inversa: 90,9% das meninas contra 44,4% dos meninos.'}
    ]});
    var linhas = [], atual = -1;
    r.itens.forEach(function (it) {
        if (it.aberta) return;
        var bi = bloco(it.q);
        if (bi !== atual) { atual = bi; linhas.push({grupo: BLOCOS_LIVRO[bi].nome}); }
        linhas.push({c: [String(it.q), it.texto, it.resp, it.comum, ST[it.status]]});
    });
    b.push({t: 'tabela', titulo: 'Perguntas 10 a 63: resposta e resposta mais comum em AH/SD', cols: [{h: '#', w: 8, al: 'c'}, {h: 'Pergunta', w: 78, al: 'l'}, {h: 'Resposta', w: 26, al: 'c'}, {h: 'Mais comum em AH/SD', w: 46, al: 'c'}, {h: 'Coincide', w: 22, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var escala = {}, i, q;
    if (d.versaoEscala === 2) {
        for (q = 10; q <= 63; q++) { if (d.respostas[q] === undefined) return null; escala[q] = d.respostas[q]; }
        return calcular({escala: escala, abertas: d.abertas || {}}, {});
    }
    for (i = 6; i <= 59; i++) { if (d.respostas[i] === undefined) return null; escala[qDe(i)] = d.respostas[i]; }
    return calcular({escala: escala, abertas: {}}, {legacy: true});
}
var base = symMake({
    id: 'qiiahsd', nome: 'QIIAHSD', cor: '#3949ab', cor2: '#00897b', escalaPainel: ['QIIAHSD'],
    sub1: 'Question\u00e1rio de Identifica\u00e7\u00e3o de Indicadores de AH/SD - Respons\u00e1veis (QIIAHSD-R), perguntas 5 a 63',
    sub2: 'P\u00e9rez e Freitas (2016) | interpreta\u00e7\u00e3o pelo Quadro 2 do manual: sem gabarito, sem ponto de corte',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_QIIAHSD = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, abertasObj: abertasObj, escore: escore, htmlQuestionario: htmlQuestionario, qDe: qDe, TXT: TXT};

})();
