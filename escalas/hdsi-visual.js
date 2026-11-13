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

// hdsi-visual.js - HDSI (Hypersexual Disorder Screening Inventory; Reid et al., 2012; psicometria: Parsons et al., 2013), 7 itens, 0-4, ultimos 6 meses.
// ESTRUTURA OFICIAL (Parsons et al., 2013): Secao A = 5 itens (A1-A5); Secao B = 2 itens (B1 sofrimento, B2 prejuizo). 0 = nunca verdadeiro ... 4 = quase sempre verdadeiro.
// Indice de severidade = soma dos 7 itens (0-28). Triagem politetica: resposta 3 ou 4 = endossado; positiva se >= 4 itens da secao A E >= 1 item da secao B.
// Corte dimensional exploratorio: 20 (Parsons et al., 2013; amostra de homens gays e bissexuais muito ativos sexualmente, nao em tratamento; classificacao quase identica a politetica).
// ERROS CORRIGIDOS: (1) o site tratava resposta >= 2 como "presente" (o correto e >= 3); (2) usava 1 item B e um "item C de exclusao Sim/Nao" que NAO faz parte da HDSI
// (a exclusao de substancias/mania e feita na entrevista); (3) a soma ia de 0 a 24 (6 itens) em vez de 0 a 28; (4) faixas de risco 10/15/20 sem fonte; (5) texto dos itens parafraseado.
// ITENS EM PORTUGUES: traducao PROPRIA dos itens oficiais em ingles (Parsons et al., 2013); o texto da adaptacao brasileira (Scanavino et al., 2016) nao foi acessado.
// Transtorno Hipersexual foi PROPOSTO para o DSM-5 (Kafka, 2010) e NAO foi incluido; a CID-11 tem o transtorno do comportamento sexual compulsivo.
// d.respostas: chaves 1..7 (A1-A5, B1, B2) com a resposta 0-4; registros SEM versaoEscala:2 usam a estrutura antiga e NAO sao recalculados.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[{"cod":"A1","texto":"Passei muito tempo consumido(a) por fantasias e impulsos sexuais, assim como planejando e praticando comportamentos sexuais."},{"cod":"A2","texto":"Usei fantasias e comportamentos sexuais para lidar com sentimentos dif\u00edceis (por exemplo: preocupa\u00e7\u00e3o, tristeza, t\u00e9dio, frustra\u00e7\u00e3o, culpa ou vergonha)."},{"cod":"A3","texto":"Usei fantasias e comportamentos sexuais para evitar, adiar ou lidar com estresses e outros problemas ou responsabilidades dif\u00edceis na minha vida."},{"cod":"A4","texto":"Tentei reduzir ou controlar a frequ\u00eancia de fantasias, impulsos e comportamentos sexuais, mas n\u00e3o tive muito sucesso."},{"cod":"A5","texto":"Continuei a ter comportamentos sexuais de risco que poderiam causar ou causaram les\u00e3o, doen\u00e7a ou dano emocional a mim, ao(s) meu(s) parceiro(s) sexual(is) ou a um relacionamento importante."},{"cod":"B1","texto":"Fantasias, impulsos e comportamentos sexuais frequentes e intensos me fizeram sentir muito chateado(a) ou mal comigo mesmo(a) (por exemplo: sentimentos de vergonha, culpa, tristeza, preocupa\u00e7\u00e3o ou nojo), ou tentei manter meu comportamento sexual em segredo."},{"cod":"B2","texto":"Fantasias, impulsos e comportamentos sexuais frequentes e intensos causaram problemas significativos para mim em \u00e1reas pessoais, sociais, profissionais ou outras \u00e1reas importantes da minha vida."}];
var OPCOES=[{"valor":0,"texto":"Nunca verdadeiro"},{"valor":1,"texto":"Raramente verdadeiro"},{"valor":2,"texto":"\u00c0s vezes verdadeiro"},{"valor":3,"texto":"Frequentemente verdadeiro"},{"valor":4,"texto":"Quase sempre verdadeiro"}];

var CORTE = 20;
var NOMES = ['A1 - Tempo consumido pelo comportamento sexual', 'A2 - Sexo para lidar com sentimentos dif\u00edceis', 'A3 - Sexo para lidar com estresse e responsabilidades', 'A4 - Falha em reduzir ou controlar', 'A5 - Comportamento de risco', 'B1 - Sofrimento', 'B2 - Preju\u00edzo em \u00e1reas da vida'];
var REFS = [
    'SCANAVINO, M. T. et al. Sexual Compulsivity Scale, Compulsive Sexual Behavior Inventory, and Hypersexual Disorder Screening Inventory: translation, adaptation, and validation for use in Brazil. Archives of Sexual Behavior, v. 45, n. 1, p. 207-217, 2016.',
    'PARSONS, J. T. et al. A psychometric investigation of the Hypersexual Disorder Screening Inventory among highly sexually active gay and bisexual men: an item response theory analysis. Journal of Sexual Medicine, v. 10, n. 12, 2013. DOI: 10.1111/jsm.12117.',
    'REID, R. C. et al. Report of findings in a DSM-5 field trial for hypersexual disorder. Journal of Sexual Medicine, v. 9, n. 11, p. 2868-2877, 2012.',
    'KAFKA, M. P. Hypersexual disorder: a proposed diagnosis for DSM-V. Archives of Sexual Behavior, v. 39, n. 2, p. 377-400, 2010. DOI: 10.1007/s10508-009-9574-7.'
];
var AVISO = 'A HDSI \u00e9 um instrumento de rastreio, baseado nos crit\u00e9rios propostos por Kafka (2010) para o transtorno hipersexual, que n\u00e3o foi inclu\u00eddo no DSM-5; n\u00e3o \u00e9 diagn\u00f3stico. Reflete o que a pr\u00f3pria pessoa relata sobre os \u00faltimos 6 meses. O ponto de corte de 20 \u00e9 explorat\u00f3rio, vem de um \u00fanico estudo com homens gays e bissexuais muito ativos sexualmente, e n\u00e3o foi validado como crit\u00e9rio cl\u00ednico. A exclus\u00e3o de uso de subst\u00e2ncias, medica\u00e7\u00f5es ou epis\u00f3dio man\u00edaco n\u00e3o \u00e9 feita pela escala e deve ser avaliada na entrevista. Ter muitos comportamentos sexuais n\u00e3o \u00e9, por si s\u00f3, um problema. O texto dos itens em portugu\u00eas \u00e9 uma tradu\u00e7\u00e3o pr\u00f3pria dos itens oficiais em ingl\u00eas e n\u00e3o \u00e9 o texto publicado da adapta\u00e7\u00e3o brasileira. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado.';

function vnum(x) { return typeof x === 'object' && x !== null ? x.valor : x; }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('HDSI: respostas incompletas');
    var r = {v: [], total: 0, a: 0, b: 0}, i;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vnum(vals[i]), 10);
        if (!(x >= 0 && x <= 4)) throw new Error('HDSI: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
        if (x >= 3) { if (i < 5) r.a++; else r.b++; }
    }
    r.politetica = r.a >= 4 && r.b >= 1;
    r.acima20 = r.total >= CORTE;
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return (r.politetica ? 'Rastreio positivo pelos crit\u00e9rios (A \u2265 4 e B \u2265 1)' : 'Rastreio negativo pelos crit\u00e9rios') + '; severidade ' + r.total + ' de 28'; }
function dadosPainel(r) { return {CriterioA: {pontuacao: r.a, max: 5, classificacao: r.a + ' de 5 itens com resposta 3 ou 4 (necess\u00e1rio 4 ou mais)'}, CriterioB: {pontuacao: r.b, max: 2, classificacao: r.b + ' de 2 itens com resposta 3 ou 4 (necess\u00e1rio 1 ou mais)'}}; }
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var b = [];
    b.push({t: 'hero', fundo: r.politetica ? '#fce4ec' : '#eceff1', borda: r.politetica ? '#1a237e' : '#607d8b', cor: r.politetica ? '#1a237e' : '#37474f', titulo: '\u00cdndice de severidade ' + r.total + ' de 28', sub: (r.politetica ? 'Crit\u00e9rios de rastreio preenchidos (4 ou mais itens A e 1 ou mais item B com resposta 3 ou 4)' : 'Crit\u00e9rios de rastreio n\u00e3o preenchidos') + '. Refer\u00eancia explorat\u00f3ria: 20 pontos.'});
    b.push({t: 'cards', itens: [
        {rot: 'SEVERIDADE (0 A 28)', valor: String(r.total), de: 'soma dos 7 itens', cor: '#1a237e'},
        {rot: 'SE\u00c7\u00c3O A', valor: r.a + ' / 5', de: 'itens com 3 ou 4 (precisa de 4 ou mais)', cor: r.a >= 4 ? '#1a237e' : '#78909c'},
        {rot: 'SE\u00c7\u00c3O B', valor: r.b + ' / 2', de: 'itens com 3 ou 4 (precisa de 1 ou mais)', cor: r.b >= 1 ? '#1a237e' : '#78909c'}
    ]});
    b.push({t: 'faixas', titulo: 'Severidade e refer\u00eancia explorat\u00f3ria de 20 pontos', min: 0, max: 29, pino: r.total + 0.5, ativo: r.acima20 ? 1 : 0, faixas: [{de: 0, ate: 20, cor: '#90a4ae', rot: '0 a 19'}, {de: 20, ate: 29, cor: '#1a237e', rot: '20 a 28'}]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a HDSI mede', x: 'Quanto a pessoa relata, nos \u00faltimos 6 meses, fantasias, impulsos e comportamentos sexuais intensos e dif\u00edceis de controlar (se\u00e7\u00e3o A: cinco itens) e o sofrimento e o preju\u00edzo que isso traz (se\u00e7\u00e3o B: dois itens). A escala foi criada para os crit\u00e9rios propostos para o transtorno hipersexual, que foi cogitado para o DSM-5, mas n\u00e3o foi inclu\u00eddo nele.'},
        {t: 'Duas maneiras de olhar o resultado', x: '1) Crit\u00e9rios de triagem: cada resposta 3 ou 4 conta como item presente; a triagem \u00e9 positiva com 4 ou mais itens presentes na se\u00e7\u00e3o A e pelo menos 1 na se\u00e7\u00e3o B. 2) \u00cdndice de severidade: soma dos 7 itens (0 a 28). Num estudo com 202 homens gays e bissexuais muito ativos sexualmente, o corte de 20 classificou quase todos como os crit\u00e9rios (Parsons et al., 2013).'},
        {t: 'Sobre a precis\u00e3o', x: 'N\u00e3o existe corte validado como crit\u00e9rio cl\u00ednico. O corte de 20 \u00e9 explorat\u00f3rio e vem de uma amostra espec\u00edfica, que n\u00e3o estava em tratamento. No estudo brasileiro de adapta\u00e7\u00e3o (Scanavino et al., 2016), a HDSI teve sensibilidade de 71,9% e especificidade de 100%.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico. A escala n\u00e3o avalia se o comportamento sexual se deve a subst\u00e2ncias, medica\u00e7\u00f5es ou a um epis\u00f3dio man\u00edaco: isso precisa ser investigado na entrevista. Tamb\u00e9m n\u00e3o mede a quantidade de comportamento sexual, e sim perda de controle e sofrimento relatados.'}
    ]});
    b.push({t: 'barras', titulo: 'Resposta a cada item (0 a 4)', nota: 'Respostas 3 ou 4 contam como item presente nos crit\u00e9rios de triagem.', itens: ITENS.map(function (it, ix) {
        var p = r.v[ix];
        return {rot: NOMES[ix], txt: OPCOES[p].texto + ' = ' + p, pct: p / 4 * 100, cor: p >= 3 ? '#1a237e' : (p === 2 ? '#7986cb' : '#b0bec5')};
    })});
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: '\u00cdndice de severidade: ' + r.v.join(' + ') + ' = ' + r.total + ' (de 0 a 28). Itens presentes (resposta 3 ou 4): se\u00e7\u00e3o A = ' + r.a + ' de 5; se\u00e7\u00e3o B = ' + r.b + ' de 2. Triagem positiva = pelo menos 4 na se\u00e7\u00e3o A e pelo menos 1 na se\u00e7\u00e3o B.'}
    ]});
    b.push({t: 'tabela', titulo: 'Respostas (\u00faltimos 6 meses)', minAltura: 90, cols: [{h: 'Item', w: 12, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 110, al: 'l'}, {h: 'Resposta', w: 40, al: 'c'}, {h: 'Pontos', w: 18, al: 'c'}], linhas: ITENS.map(function (it, ix) { return {c: [it.cod, it.texto, OPCOES[r.v[ix]].texto, String(r.v[ix])]}; })});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    if (d.versaoEscala !== 2) return null;     // registros antigos usam a estrutura antiga (item B unico e item C): nao recalcular
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 0 && x <= 4)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'hdsi', nome: 'HDSI', cor: '#1a237e', cor2: '#455a64', escalaPainel: ['HDSI'],
    sub1: 'Invent\u00e1rio de Rastreio do Transtorno Hipersexual (Hypersexual Disorder Screening Inventory) - 7 itens, \u00faltimos 6 meses',
    sub2: 'Reid et al. (2012); Parsons et al. (2013) | adapta\u00e7\u00e3o brasileira: Scanavino et al. (2016)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_HDSI = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES};

})();
