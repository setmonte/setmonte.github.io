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

// brief2 visual (Pais e Professores) - BRIEF-2 (Gioia, Isquith, Guy, Kenworthy, 2015), 63 itens, Nunca=1 / As vezes=2 / Frequentemente=3.
// CHAVE (itens por escala), validade (Infrequencia, Negatividade, Inconsistencia) e indices: relatorios interpretativos de exemplo da PAR
// (BRIEF2_Parent_PiC_Interpretive_Sample_Report.pdf e BRIEF2_Teacher_PiC_Interpretive_Sample_Report.pdf). Conferido: as somas dos indices dos exemplos batem.
// O site mostra SOMENTE pontuacao bruta: as tabelas de escore T / percentil sao da editora (PAR) e nao sao reproduzidas.
// d.respostas: chaves 1..63 (numero do item) com 1-3. versaoEscala:2 (a chave antiga do site estava errada).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var FORM = {"tipo":"prof","id":"brief2prof","nome":"BRIEF-2 Professores","escala":"BRIEF-2-PROFESSORES","global":"SYM_BRIEF2T","formulario":"Formul\u00e1rio dos Professores","negCorte":5};
var ITENS = ["\u00c9 inquieto.","Resiste ou tem problema em aceitar uma forma diferente de resolver um problema com trabalho escolar, amigos, trabalhos dom\u00e9sticos, etc.","Quando s\u00e3o dadas tr\u00eas tarefas para fazer, s\u00f3 se lembra da primeira ou da \u00faltima.","N\u00e3o \u00e9 consciente de quanto seu comportamento afeta ou incomoda outros.","O trabalho \u00e9 desleixado.","Tem rea\u00e7\u00f5es explosivas, bravas.","N\u00e3o se planeja com anteced\u00eancia para obriga\u00e7\u00f5es escolares.","N\u00e3o acha coisas na carteira escolar.","N\u00e3o toma iniciativa.","N\u00e3o pensa antes de fazer as coisas (\u00e9 impulsivo).","Tem problemas para se acostumar a novas situa\u00e7\u00f5es (aulas, grupos, amigos).","Tem um per\u00edodo curto de aten\u00e7\u00e3o.","Tem problemas de compreens\u00e3o de suas pr\u00f3prias for\u00e7as e fraquezas.","Tem explos\u00f5es por pequenos motivos.","Apega-se a detalhes e perde a vis\u00e3o geral.","Perde o controle com mais frequ\u00eancia que os amigos.","Fica preso em um t\u00f3pico ou atividade.","Esquece o seu nome.","Tem problemas com tarefas que t\u00eam mais de um passo.","N\u00e3o percebe que certas a\u00e7\u00f5es incomodam outros.","Sua produ\u00e7\u00e3o escrita \u00e9 desorganizada.","Pequenos eventos geram grandes rea\u00e7\u00f5es.","Tem boas ideias, mas n\u00e3o termina os trabalhos (n\u00e3o d\u00e1 continuidade).","Fala em hora errada.","Tem problemas em terminar tarefas (tarefas, trabalho de casa).","N\u00e3o percebe quando seu comportamento causa rea\u00e7\u00f5es negativas.","Reage mais fortemente a situa\u00e7\u00f5es que outras crian\u00e7as.","Tem problemas para se lembrar de fatos, mesmo que em poucos minutos.","Comete erros por descuido.","Fica fora do lugar em horas erradas.","Torna-se angustiado/preocupado com situa\u00e7\u00f5es novas.","Tem problemas em concentrar na li\u00e7\u00e3o, etc.","Tem letra feia ou dif\u00edcil de entender.","Muda de humor frequentemente.","Tem boas ideias, mas n\u00e3o as coloca no papel.","Tem problemas em contar at\u00e9 tr\u00eas.","Deixa bagun\u00e7as que outros t\u00eam de limpar.","Precisa receber uma ordem para iniciar uma tarefa mesmo quando tem vontade.","Age muito agressivo ou 'fora de controle'.","Pensa muito sobre o mesmo t\u00f3pico.","Esquece-se do que ele/ela estava fazendo.","N\u00e3o verifica erros no trabalho.","Explos\u00f5es de bravura ou de choro s\u00e3o intensas mas terminam repentinamente.","Torna-se oprimido por grandes atribui\u00e7\u00f5es.","Perde a lancheira, o dinheiro do lanche, bilhetes autoriza\u00e7\u00e3o, li\u00e7\u00e3o de casa, etc.","Precisa de ajuda de um adulto para permanecer em uma tarefa.","Esquece-se de entregar a li\u00e7\u00e3o de casa, mesmo quando completa.","Tem problemas em colocar freios em suas a\u00e7\u00f5es.","Resiste a mudan\u00e7as de rotina, comidas, lugares, etc.","Tem problemas para iniciar li\u00e7\u00f5es de casa ou obriga\u00e7\u00f5es.","O temperamento \u00e9 facilmente influenciado pela situa\u00e7\u00e3o.","Subestima o tempo necess\u00e1rio para terminar tarefas.","N\u00e3o traz para casa li\u00e7\u00e3o de casa, folhas de anota\u00e7\u00f5es, materiais, etc.","N\u00e3o \u00e9 capaz de achar a porta da frente da escola.","N\u00e3o faz nada por vontade pr\u00f3pria.","Torna-se angustiado facilmente.","Come\u00e7a tarefas no \u00faltimo minuto.","N\u00e3o pensa nas consequ\u00eancias antes de agir.","N\u00e3o tem consci\u00eancia de seu comportamento quando est\u00e1 no grupo.","Tem dificuldade para pensar em maneiras diferentes de resolver um problema.","Vai mal nas provas, mesmo quando sabe as respostas corretas.","Deixa os trabalhos incompletos.","Tem dificuldades para pensar de forma diferente para resolver um problema, quando estagnado."];
var CHAVE = {"Inhibit":[1,10,16,24,30,39,48,58],"SelfMonitor":[4,13,20,26,59],"Shift":[2,11,17,31,40,49,60,63],"EmotionalControl":[6,14,22,27,34,43,51,56],"Initiate":[9,38,50,55],"WorkingMemory":[3,12,19,25,28,32,41,46],"PlanOrganize":[7,15,23,35,44,52,57,61],"TaskMonitor":[5,21,29,33,42,62],"OrgMaterials":[8,37,45,47,53]};
var NEG = [2,11,31,34,37,43,45,49];
var INF = [18,36,54];
var PARES = [[3,19],[4,20],[5,33],[6,14],[12,32],[16,39],[22,56],[60,63]];

var RESP = ['Nunca', '\u00c0s vezes', 'Frequentemente'];
var ESC = [
    {k: 'Inhibit', nome: 'Inibi\u00e7\u00e3o', idx: 'IRC', desc: 'Controle de impulsos: conseguir parar o pr\u00f3prio comportamento na hora certa e resistir a agir sem pensar.'},
    {k: 'SelfMonitor', nome: 'Automonitoramento', idx: 'IRC', desc: 'Perceber o efeito do pr\u00f3prio comportamento sobre os outros e em grupo.'},
    {k: 'Shift', nome: 'Flexibilidade', idx: 'IRE', desc: 'Mudar com facilidade de uma situa\u00e7\u00e3o, atividade ou jeito de resolver um problema para outro; aceitar mudan\u00e7as de rotina.'},
    {k: 'EmotionalControl', nome: 'Controle Emocional', idx: 'IRE', desc: 'Regular as rea\u00e7\u00f5es emocionais: explos\u00f5es, mudan\u00e7as de humor e rea\u00e7\u00f5es exageradas a pequenos eventos.'},
    {k: 'Initiate', nome: 'Iniciativa', idx: 'IRCog', desc: 'Come\u00e7ar uma tarefa ou atividade por conta pr\u00f3pria e ter ideias ou formas de resolver problemas.'},
    {k: 'WorkingMemory', nome: 'Mem\u00f3ria Operacional', idx: 'IRCog', desc: 'Manter informa\u00e7\u00f5es na mente enquanto se faz algo: lembrar instru\u00e7\u00f5es, seguir tarefas com v\u00e1rios passos e sustentar a aten\u00e7\u00e3o.'},
    {k: 'PlanOrganize', nome: 'Planejamento/Organiza\u00e7\u00e3o', idx: 'IRCog', desc: 'Organizar as tarefas de agora e as futuras, com ordem, anteced\u00eancia e vis\u00e3o do conjunto.'},
    {k: 'TaskMonitor', nome: 'Monitoramento da Tarefa', idx: 'IRCog', desc: 'Conferir o pr\u00f3prio trabalho, perceber erros e checar se o resultado est\u00e1 certo.'},
    {k: 'OrgMaterials', nome: 'Organiza\u00e7\u00e3o de Materiais', idx: 'IRCog', desc: 'Ordem nos objetos e espa\u00e7os: materiais escolares, quarto, pertences.'}
];
var IDX = {
    IRC: {nome: 'IRC - \u00cdndice de Regula\u00e7\u00e3o Comportamental', cur: 'IRC', cor: '#00796b', esc: ['Inhibit', 'SelfMonitor']},
    IRE: {nome: 'IRE - \u00cdndice de Regula\u00e7\u00e3o Emocional', cur: 'IRE', cor: '#ef6c00', esc: ['Shift', 'EmotionalControl']},
    IRCog: {nome: 'IRCog - \u00cdndice de Regula\u00e7\u00e3o Cognitiva', cur: 'IRCog', cor: '#6a1b9a', esc: ['Initiate', 'WorkingMemory', 'PlanOrganize', 'TaskMonitor', 'OrgMaterials']}
};
var COR = '#4527a0';
var REFS = [
    'GIOIA, G. A.; ISQUITH, P. K.; GUY, S. C.; KENWORTHY, L. Behavior Rating Inventory of Executive Function, Second Edition (BRIEF2). Lutz, FL: PAR, 2015.',
    'PAR. BRIEF2 ' + (FORM.tipo === 'pais' ? 'Parent' : 'Teacher') + ' Form: Interpretive Report (relat\u00f3rio de exemplo). Lutz, FL: PAR, 2015. Dispon\u00edvel em: https://www.acer.org/files/BRIEF2_' + (FORM.tipo === 'pais' ? 'Parent' : 'Teacher') + '_PiC_Interpretive_Sample_Report.pdf.'
];
var AVISO = 'O BRIEF-2 descreve como o informante (' + (FORM.tipo === 'pais' ? 'pai, m\u00e3e ou cuidador' : 'professor') + ') v\u00ea as fun\u00e7\u00f5es executivas da crian\u00e7a ou do adolescente no dia a dia. Este relat\u00f3rio mostra apenas a pontua\u00e7\u00e3o bruta: a convers\u00e3o em escore T e percentil depende das tabelas normativas da editora (PAR), que n\u00e3o s\u00e3o reproduzidas aqui, e n\u00e3o h\u00e1 normas brasileiras publicadas confirmadas. Por isso n\u00e3o \u00e9 poss\u00edvel dizer, s\u00f3 por este relat\u00f3rio, se uma pontua\u00e7\u00e3o est\u00e1 acima do esperado para a idade. A tradu\u00e7\u00e3o dos itens para o portugu\u00eas n\u00e3o \u00e9 uma vers\u00e3o oficial confirmada. Os indicadores de validade apenas ajudam a conferir o preenchimento. N\u00e3o \u00e9 diagn\u00f3stico e nenhum instrumento isolado descreve a crian\u00e7a por inteiro: o resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria, a observa\u00e7\u00e3o e outras fontes (' + (FORM.tipo === 'pais' ? 'escola, outros cuidadores' : 'pais, outros professores') + ').';

function fmt(n) { return String(n); }
function calcular(resp, ctx) {
    if (!resp) throw new Error('BRIEF-2: respostas incompletas');
    var r = {v: {}, esc: {}, idx: {}, ctx: ctx || {}}, i;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 3)) throw new Error('BRIEF-2: resposta invalida no item ' + i);
        r.v[i] = x;
    }
    var tot = 0, totMax = 0, totMin = 0;
    ESC.forEach(function (e) {
        var s = 0, its = CHAVE[e.k];
        its.forEach(function (n) { s += r.v[n]; });
        r.esc[e.k] = {soma: s, n: its.length, min: its.length, max: its.length * 3};
        tot += s; totMin += its.length; totMax += its.length * 3;
    });
    Object.keys(IDX).forEach(function (k) {
        var s = 0, mn = 0, mx = 0;
        IDX[k].esc.forEach(function (c) { s += r.esc[c].soma; mn += r.esc[c].min; mx += r.esc[c].max; });
        r.idx[k] = {soma: s, min: mn, max: mx};
    });
    r.ig = {soma: tot, min: totMin, max: totMax};
    var inf = 0, neg = 0, dif = 0;
    INF.forEach(function (n) { if (r.v[n] >= 2) inf++; });
    NEG.forEach(function (n) { if (r.v[n] === 3) neg++; });
    r.pares = PARES.map(function (p) { var d = Math.abs(r.v[p[0]] - r.v[p[1]]); dif += d; return {a: p[0], b: p[1], d: d}; });
    r.val = {inf: inf, neg: neg, inc: dif, negCorte: FORM.negCorte, negAtinge: neg >= FORM.negCorte};
    return r;
}
function escore(r) { return r.ig.soma; }
function classifGeral(r) { return 'Pontua\u00e7\u00e3o bruta ' + r.ig.soma + ' (de ' + r.ig.min + ' a ' + r.ig.max + '); sem convers\u00e3o em escore T'; }
function dadosPainel(r) {
    var o = {};
    ESC.forEach(function (e) { var s = r.esc[e.k]; o[e.nome] = {pontuacao: s.soma, max: s.max, media: Math.round(s.soma / s.n * 100) / 100, classificacao: 'Bruto ' + s.soma + '/' + s.max + ' (' + e.idx + ')'}; });
    Object.keys(IDX).forEach(function (k) { var s = r.idx[k]; o[k] = {pontuacao: s.soma, max: s.max, classificacao: 'Bruto ' + s.soma + '/' + s.max}; });
    o.IGFE = {pontuacao: r.ig.soma, max: r.ig.max, classificacao: 'Bruto ' + r.ig.soma + '/' + r.ig.max};
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function pct(s) { return (s.soma - s.min) / (s.max - s.min) * 100; }
function blocks(r) {
    var b = [], V = r.val, c = r.ctx || {};
    b.push({t: 'hero', fundo: '#ede7f6', borda: COR, cor: '#311b92', titulo: 'Pontua\u00e7\u00e3o bruta total: ' + r.ig.soma + ' (de ' + r.ig.min + ' a ' + r.ig.max + ')', sub: 'Soma dos 60 itens das nove escalas. Sem convers\u00e3o em escore T: as tabelas normativas pertencem \u00e0 editora e n\u00e3o est\u00e3o neste relat\u00f3rio.'});
    b.push({t: 'cards', itens: [
        {rot: 'GERAL (IGFE)', valor: String(r.ig.soma), de: 'de ' + r.ig.min + ' a ' + r.ig.max, cor: COR},
        {rot: 'IRC', valor: String(r.idx.IRC.soma), de: 'de ' + r.idx.IRC.min + ' a ' + r.idx.IRC.max, cor: IDX.IRC.cor},
        {rot: 'IRE', valor: String(r.idx.IRE.soma), de: 'de ' + r.idx.IRE.min + ' a ' + r.idx.IRE.max, cor: IDX.IRE.cor},
        {rot: 'IRCog', valor: String(r.idx.IRCog.soma), de: 'de ' + r.idx.IRCog.min + ' a ' + r.idx.IRCog.max, cor: IDX.IRCog.cor}
    ]});
    var quem = [];
    if (c.informante) quem.push('Informante: ' + c.informante);
    if (c.convivio) quem.push('Conv\u00edvio com a crian\u00e7a: ' + c.convivio);
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que o BRIEF-2 mede', x: 'Como ' + (FORM.tipo === 'pais' ? 'quem cuida da crian\u00e7a' : 'o professor') + ' observa, nos \u00faltimos 6 meses, comportamentos ligados \u00e0s fun\u00e7\u00f5es executivas: controle de impulsos, flexibilidade, emo\u00e7\u00f5es, iniciativa, mem\u00f3ria de trabalho, planejamento, confer\u00eancia do trabalho e organiza\u00e7\u00e3o de materiais.'},
        {t: 'Como a pontua\u00e7\u00e3o \u00e9 feita', x: 'Cada item vale 1 (nunca \u00e9 um problema), 2 (\u00e0s vezes) ou 3 (frequentemente \u00e9 um problema). Quanto maior a soma, mais o informante relata problemas naquela \u00e1rea. S\u00e3o 60 itens em nove escalas, agrupadas em tr\u00eas \u00edndices: Regula\u00e7\u00e3o Comportamental (IRC: Inibi\u00e7\u00e3o e Automonitoramento), Regula\u00e7\u00e3o Emocional (IRE: Flexibilidade e Controle Emocional) e Regula\u00e7\u00e3o Cognitiva (IRCog: as outras cinco escalas). A soma dos tr\u00eas \u00e9 o \u00edndice geral (IGFE). Os itens 18, 36 e 54 n\u00e3o entram na soma: servem s\u00f3 como checagem.'},
        {t: 'Sobre o escore T', x: 'Na vers\u00e3o completa da editora, a pontua\u00e7\u00e3o bruta \u00e9 convertida em escore T pelas tabelas de normas (por idade e sexo). Nessa convers\u00e3o, T de 60 a 64 \u00e9 lido como levemente elevado, 65 a 69 como possivelmente elevado e 70 ou mais como clinicamente elevado. Este relat\u00f3rio n\u00e3o faz essa convers\u00e3o, por isso essas faixas n\u00e3o se aplicam aqui \u00e0s pontua\u00e7\u00f5es brutas.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de nenhuma condi\u00e7\u00e3o e n\u00e3o compara a crian\u00e7a com as da mesma idade. \u00c9 a vis\u00e3o de uma pessoa, e deve ser comparada com a de outros informantes e com a observa\u00e7\u00e3o direta.'}
    ].concat(quem.length ? [{t: 'Quem respondeu', x: quem.join(' | ')}] : [])});
    b.push({t: 'barras', titulo: 'Pontua\u00e7\u00e3o bruta por escala', nota: 'Cada barra vai do m\u00ednimo ao m\u00e1ximo poss\u00edvel. Cores: verde = IRC, laranja = IRE, roxo = IRCog.', itens: ESC.map(function (e) {
        var s = r.esc[e.k];
        return {rot: e.nome + ' (' + s.n + ' itens)', txt: s.soma + ' de ' + s.max + ' pontos (m\u00ednimo ' + s.min + ')', pct: pct(s), cor: IDX[e.idx].cor};
    })});
    b.push({t: 'textos', titulo: 'O que cada escala mostra', itens: ESC.map(function (e) {
        return {t: e.nome + ' - itens ' + CHAVE[e.k].join(', '), x: e.desc};
    })});
    var cNeg = V.negAtinge ? 'O escore atingiu esse valor. Quando isso acontece, o informante marcou muitos comportamentos no n\u00edvel m\u00e1ximo, e a vis\u00e3o pode estar mais negativa do que o usual. Vale conferir com outras fontes.' : 'O escore est\u00e1 abaixo desse valor.';
    var cInf = V.inf >= 1 ? 'Em menos de 1% da amostra de padroniza\u00e7\u00e3o o escore foi 1 ou mais. Vale conferir se as perguntas foram entendidas e se o preenchimento foi atento.' : 'Nenhum dos tr\u00eas itens raros foi marcado como "\u00e0s vezes" ou "frequentemente": \u00e9 o esperado.';
    var parTxt = r.pares.map(function (p) { return p.a + 'x' + p.b + ': ' + (r.v[p.a] === r.v[p.b] ? 'iguais' : 'diferen\u00e7a ' + p.d); }).join('; ');
    b.push({t: 'textos', titulo: 'Confer\u00eancia do preenchimento (validade)', itens: [
        {t: 'Infrequ\u00eancia - escore ' + V.inf + ' (itens ' + INF.join(', ') + ')', x: 'Mede se foram marcados como "\u00e0s vezes" ou "frequentemente" comportamentos rar\u00edssimos (' + ITENS[INF[0] - 1].replace(/\.$/, '') + '; ' + ITENS[INF[1] - 1].replace(/\.$/, '') + '; ' + ITENS[INF[2] - 1].replace(/\.$/, '') + '). ' + cInf},
        {t: 'Negatividade - escore ' + V.neg + ' de ' + NEG.length + ' (itens ' + NEG.join(', ') + ')', x: 'Conta quantos desses itens foram marcados como "frequentemente". Em menos de 3% das pessoas da amostra cl\u00ednica o escore foi ' + V.negCorte + ' ou mais. ' + cNeg},
        {t: 'Inconsist\u00eancia - soma das diferen\u00e7as ' + V.inc + ' (m\u00e1ximo ' + (PARES.length * 2) + ')', x: 'S\u00e3o ' + PARES.length + ' pares de itens com significado muito parecido; para cada par se calcula a diferen\u00e7a entre as duas respostas (de 0 a 2) e somam-se as diferen\u00e7as. Quanto maior a soma, mais as respostas se contradisseram. Pares: ' + parTxt + '. A editora classifica essa soma com pontos de corte que n\u00e3o s\u00e3o p\u00fablicos; por isso o site mostra o valor e os pares, sem classificar.'}
    ]});
    var nomeDe = {};
    ESC.forEach(function (e) { CHAVE[e.k].forEach(function (n) { nomeDe[n] = e.nome; }); });
    INF.forEach(function (n) { nomeDe[n] = 'Infrequ\u00eancia'; });
    var linhas = ITENS.map(function (t, i) { var n = i + 1; return {c: [String(n), nomeDe[n], t, RESP[r.v[n] - 1], INF.indexOf(n) >= 0 ? '-' : String(r.v[n])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Escala', w: 34, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 96, al: 'l'}, {h: 'Resposta', w: 28, al: 'c'}, {h: 'Pontos', w: 16, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try {
        if (d.versaoEscala !== 2) return null;
        return calcular(d.respostas, {informante: d.informante || '', convivio: d.convivio || ''});
    } catch (e) { return null; }
}
var base = symMake({
    id: FORM.id, nome: FORM.nome, cor: COR, cor2: '#311b92', escalaPainel: [FORM.escala],
    sub1: 'Invent\u00e1rio de Avalia\u00e7\u00e3o Comportamental das Fun\u00e7\u00f5es Executivas - Segunda edi\u00e7\u00e3o (BRIEF-2) - ' + FORM.formulario + ' - 63 itens',
    sub2: 'Gioia, Isquith, Guy e Kenworthy (2015)',
    dadosExtra: function (r) { var o = []; if (r.ctx && r.ctx.informante) o.push('Informante: ' + r.ctx.informante); if (r.ctx && r.ctx.convivio) o.push('Conv\u00edvio: ' + r.ctx.convivio); return o; },
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window[FORM.global] = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, CHAVE: CHAVE, NEG: NEG, INF: INF, PARES: PARES, ESC: ESC};

})();
