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

// whodas-visual.js - WHODAS 2.0, versao de 12 itens (OMS), respostas 1-5 (Nenhuma ... Extrema/Nao conseguiu) = 0-4 pontos, soma 0-48, percentual = soma/48.
// Calculo mantido como no site (percentual = (soma - 12) / 48 * 100) e conferido com Andrews et al. (2009): soma simples 0-48 ("0 = sem incapacidade, 48 = incapacidade completa").
// Retiradas: faixas de gravidade (0-4 / 5-24 / 25-49 / 50-95 / 96-100) e classificacao por dominio. Andrews et al. (2009): nao ha ponto de corte acordado e a versao de 12 itens
// justifica normas gerais, nao normas por subescala (2 itens por area nao formam escore de dominio).
// Referencia descritiva (Andrews et al., 2009, adultos australianos): 45% marcaram 0, 34% marcaram 1-4, 12% marcaram 5-9 e cerca de 10% marcaram 10-48.
// ATENCAO: d.respostas guarda os valores 1-5 (igual ao registro antigo); a soma 0-48 e a pontuacao de cada item = resposta - 1.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var DOMINIOS = {
"Cogni\u00e7\u00e3o": [0,1],
"Mobilidade": [2,3],
"Autocuidado": [4,5],
"Rela\u00e7\u00f5es": [6,7],
"Atividades de Vida": [8,9],
"Participa\u00e7\u00e3o": [10,11]
};

var ITENS=[
{texto:"Concentrar-se em fazer algo por dez minutos?", dominio:"Cogni\u00e7\u00e3o"},
{texto:"Aprender uma nova tarefa, por exemplo, aprender como chegar a um lugar novo?", dominio:"Cogni\u00e7\u00e3o"},
{texto:"Ficar de p\u00e9 por longos per\u00edodos, como 30 minutos?", dominio:"Mobilidade"},
{texto:"Andar uma longa dist\u00e2ncia, como um quil\u00f4metro?", dominio:"Mobilidade"},
{texto:"Lavar todo o corpo?", dominio:"Autocuidado"},
{texto:"Vestir-se?", dominio:"Autocuidado"},
{texto:"Lidar com pessoas que voc\u00ea n\u00e3o conhece?", dominio:"Rela\u00e7\u00f5es"},
{texto:"Manter uma amizade?", dominio:"Rela\u00e7\u00f5es"},
{texto:"Cuidar das suas responsabilidades dom\u00e9sticas?", dominio:"Atividades de Vida"},
{texto:"Realizar o seu trabalho ou atividades escolares?", dominio:"Atividades de Vida"},
{texto:"Participar de atividades comunit\u00e1rias (por exemplo: festividades, atividades religiosas, etc.) da mesma forma que qualquer outra pessoa?", dominio:"Participa\u00e7\u00e3o"},
{texto:"Quanto voc\u00ea foi emocionalmente afetado(a) pela sua condi\u00e7\u00e3o de sa\u00fade?", dominio:"Participa\u00e7\u00e3o"}
];

var OPCOES=[{valor:1,texto:"Nenhuma"},{valor:2,texto:"Leve"},{valor:3,texto:"Moderada"},{valor:4,texto:"Grave"},{valor:5,texto:"Extrema/N\u00e3o conseguiu"}];

var PREFIXO = "Nos \u00faltimos 30 dias, quanta dificuldade voc\u00ea teve para:";

var AREAS = [
    {k: 'Cognicao', dom: 'Cogni\u00e7\u00e3o', nome: 'Cogni\u00e7\u00e3o (entender e se comunicar)'},
    {k: 'Mobilidade', dom: 'Mobilidade', nome: 'Mobilidade (locomo\u00e7\u00e3o)'},
    {k: 'Autocuidado', dom: 'Autocuidado', nome: 'Autocuidado'},
    {k: 'Relacoes', dom: 'Rela\u00e7\u00f5es', nome: 'Rela\u00e7\u00f5es (conviver com as pessoas)'},
    {k: 'AtividadesVida', dom: 'Atividades de Vida', nome: 'Atividades de vida (casa, trabalho ou escola)'},
    {k: 'Participacao', dom: 'Participa\u00e7\u00e3o', nome: 'Participa\u00e7\u00e3o na sociedade'}
];
var CURTO = [
    'Concentrar-se por dez minutos', 'Aprender uma nova tarefa', 'Ficar em p\u00e9 por 30 minutos', 'Andar um quil\u00f4metro',
    'Lavar o corpo todo', 'Vestir-se', 'Lidar com pessoas desconhecidas', 'Manter uma amizade',
    'Cuidar das responsabilidades dom\u00e9sticas', 'Trabalho ou escola do dia a dia', 'Participar de atividades comunit\u00e1rias', 'Ser afetado(a) emocionalmente pela condi\u00e7\u00e3o de sa\u00fade'
];
var REF_FAIXAS = [
    {de: 0, ate: 1, nome: 'zero', cor: '#90a4ae', rot: '0'},
    {de: 1, ate: 5, nome: '1 a 4', cor: '#4fc3f7', rot: '1 a 4'},
    {de: 5, ate: 10, nome: '5 a 9', cor: '#0288d1', rot: '5 a 9'},
    {de: 10, ate: 49, nome: '10 a 48', cor: '#01579b', rot: '10 a 48'}
];
var REFS = [
    'SILVEIRA, C. et al. Adapta\u00e7\u00e3o transcultural da Escala de Avalia\u00e7\u00e3o de Incapacidades da Organiza\u00e7\u00e3o Mundial de Sa\u00fade (WHODAS 2.0) para o Portugu\u00eas. Revista da Associa\u00e7\u00e3o M\u00e9dica Brasileira, v. 59, n. 3, p. 234-240, 2013.',
    'WORLD HEALTH ORGANIZATION. Measuring health and disability: manual for WHO Disability Assessment Schedule (WHODAS 2.0). Geneva: WHO, 2010.',
    'ANDREWS, G.; KEMP, A.; SUNDERLAND, M.; VON KORFF, M.; USTUN, T. B. Normative data for the 12 item WHO Disability Assessment Schedule 2.0. PLoS ONE, v. 4, n. 12, e8343, 2009. DOI: 10.1371/journal.pone.0008343.'
];
var AVISO = 'O WHODAS 2.0 (vers\u00e3o de 12 itens) mostra a dificuldade que a pessoa percebeu, nos \u00faltimos 30 dias, para atividades do dia a dia por causa de condi\u00e7\u00f5es de sa\u00fade; n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica ou funcional. N\u00e3o h\u00e1 ponto de corte definido para incapacidade significativa, e os dados de adultos australianos citados servem apenas como refer\u00eancia, pois os pr\u00f3prios autores recomendam normas de cada pa\u00eds. A reda\u00e7\u00e3o dos itens 2 e 9 foi ajustada em novembro de 2026 \u00e0 vers\u00e3o oficial de 12 itens da OMS e n\u00e3o \u00e9 a reda\u00e7\u00e3o publicada da adapta\u00e7\u00e3o brasileira. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria cl\u00ednica.';

function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('WHODAS: respostas incompletas');
    var r = {v: [], p: [], raw: 0, areas: []}, i, a;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x >= 1 && x <= 5)) throw new Error('WHODAS: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.p.push(x - 1); r.raw += x - 1;
    }
    r.pct = Math.round(r.raw / 48 * 1000) / 10;
    for (a = 0; a < AREAS.length; a++) {
        var idx = DOMINIOS[AREAS[a].dom], s = 0, j;
        if (!idx) throw new Error('WHODAS: area ausente ' + AREAS[a].dom);
        for (j = 0; j < idx.length; j++) s += r.p[idx[j]];
        r.areas.push({k: AREAS[a].k, idx: idx, soma: s, max: idx.length * 4});
    }
    r.faixaRef = r.raw === 0 ? 0 : (r.raw < 5 ? 1 : (r.raw < 10 ? 2 : 3));
    r.graves = [];
    for (i = 0; i < r.v.length; i++) { if (r.v[i] >= 4) r.graves.push(i); }
    return r;
}
function escore(r) { return r.pct; }
function classifGeral(r) { return 'Sem classifica\u00e7\u00e3o de gravidade (escore ' + r.raw + ' de 48)'; }
function dadosPainel(r) {
    var o = {};
    r.areas.forEach(function (d) { o[d.k] = {pontuacao: d.soma, max: d.max, classificacao: d.soma + ' de ' + d.max + ' pontos (2 itens)'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var b = [], i, a;
    b.push({t: 'hero', fundo: '#e1f5fe', borda: '#0277bd', cor: '#01579b', titulo: 'Escore ' + r.raw + ' de 48 pontos (' + fmt(r.pct) + '%)', sub: 'Quanto maior, mais dificuldade relatada nos \u00faltimos 30 dias. N\u00e3o h\u00e1 ponto de corte definido.'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE (0 A 48)', valor: String(r.raw), de: 'soma dos 12 itens', cor: '#0277bd'},
        {rot: 'PERCENTUAL', valor: fmt(r.pct) + '%', de: 'do m\u00e1ximo poss\u00edvel (48)', cor: '#0288d1'},
        {rot: 'DIFICULDADE GRAVE OU EXTREMA', valor: r.graves.length + ' de 12', de: 'atividades com resposta 4 ou 5', cor: '#01579b'}
    ]});
    b.push({t: 'faixas', titulo: 'Como adultos australianos se distribuem (refer\u00eancia, n\u00e3o \u00e9 classifica\u00e7\u00e3o)', min: 0, max: 49, pino: r.raw + 0.5, ativo: r.faixaRef, faixas: REF_FAIXAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que o WHODAS 2.0 mede', x: 'Quanta dificuldade a pessoa teve, nos \u00faltimos 30 dias, para fazer atividades do dia a dia por causa de condi\u00e7\u00f5es de sa\u00fade: doen\u00e7as, les\u00f5es, problemas mentais ou emocionais e problemas com \u00e1lcool ou drogas. Ele se baseia na CIF, a classifica\u00e7\u00e3o de funcionalidade da OMS.'},
        {t: 'Como interpretar', x: 'Cada resposta vale de 0 (nenhuma dificuldade) a 4 (extrema ou n\u00e3o conseguiu). A soma dos 12 itens vai de 0 a 48, e o percentual \u00e9 essa soma dividida por 48. Quanto maior o escore, mais dificuldade foi relatada. O estudo de normatiza\u00e7\u00e3o da vers\u00e3o de 12 itens (Andrews et al., 2009) apoia o uso do escore geral, e n\u00e3o de notas separadas por \u00e1rea.'},
        {t: 'Sobre pontos de corte e compara\u00e7\u00f5es', x: 'N\u00e3o h\u00e1 ponto de corte acordado para incapacidade significativa. Em adultos australianos (Andrews et al., 2009), 45% marcaram 0, 34% marcaram de 1 a 4, 12% marcaram de 5 a 9 e cerca de 10% marcaram 10 ou mais; os autores consideram que quem marca 10 ou mais provavelmente tem incapacidade clinicamente significativa. Esses n\u00fameros s\u00e3o de outro pa\u00eds e servem s\u00f3 como refer\u00eancia.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico, n\u00e3o mostra se a dificuldade vem de causa f\u00edsica ou mental e retrata como a pessoa percebeu o \u00faltimo m\u00eas. N\u00e3o substitui a avalia\u00e7\u00e3o cl\u00ednica.'}
    ]});
    var bars = r.areas.map(function (d, ix) {
        var ps = d.idx.map(function (q) { return r.p[q]; });
        return {rot: AREAS[ix].nome, txt: 'itens ' + d.idx.map(function (q) { return q + 1; }).join(' e ') + ': ' + ps.join(' e ') + ' ponto(s), soma ' + d.soma + ' de ' + d.max, pct: d.soma / d.max * 100, cor: '#0277bd'};
    });
    b.push({t: 'barras', titulo: 'Respostas por \u00e1rea da vida (descritivo)', nota: 'Com apenas 2 itens por \u00e1rea, isto descreve as respostas e n\u00e3o \u00e9 um escore de \u00e1rea.', itens: bars});
    var conta = r.p.join(' + ');
    var grav = r.graves.length ? r.graves.map(function (q) { return 'item ' + (q + 1) + ' (' + CURTO[q].toLowerCase() + ')'; }).join('; ') + '. \u00c9 apenas a descri\u00e7\u00e3o das respostas dadas, sem leitura cl\u00ednica por si s\u00f3.' : 'Nenhuma atividade teve resposta grave ou extrema.';
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Nenhuma = 0, Leve = 1, Moderada = 2, Grave = 3, Extrema ou n\u00e3o conseguiu = 4. Com as respostas desta pessoa: ' + conta + ' = ' + r.raw + ' pontos, de um m\u00e1ximo de 48. Percentual: ' + r.raw + ' / 48 = ' + fmt(r.pct) + '%.'},
        {t: 'Atividades com dificuldade grave ou extrema', x: grav}
    ]});
    var linhas = ITENS.map(function (it, ix) {
        return {c: [String(ix + 1), it.dominio, it.texto, OPCOES[r.v[ix] - 1].texto, String(r.p[ix])]};
    });
    b.push({t: 'tabela', titulo: 'Respostas (nos \u00faltimos 30 dias, quanta dificuldade voc\u00ea teve para...)', minAltura: 95, cols: [{h: '#', w: 6, al: 'c'}, {h: '\u00c1rea', w: 26, al: 'c'}, {h: 'Atividade', w: 92, al: 'l'}, {h: 'Resposta', w: 38, al: 'c'}, {h: 'Pontos', w: 18, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 1 && x <= 5)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'whodas', nome: 'WHODAS 2.0', cor: '#0277bd', cor2: '#01579b', escalaPainel: ['WHODAS 2.0'],
    sub1: 'WHO Disability Assessment Schedule 2.0 - vers\u00e3o de 12 itens, \u00faltimos 30 dias',
    sub2: 'Organiza\u00e7\u00e3o Mundial da Sa\u00fade (2010) | adapta\u00e7\u00e3o brasileira: Silveira et al. (2013)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_WHODAS = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, DOMINIOS: DOMINIOS, PREFIXO: PREFIXO};

})();
