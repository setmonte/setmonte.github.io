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

// bapq-visual.js - BAPQ (Broad Autism Phenotype Questionnaire, Hurley et al., 2007), versao brasileira BAPQ-Br (Prata et al., 2019), autorrelato, 36 itens, 1-6.
// Itens e invertidos: Prata et al. (2019), Tabela 2. Invertidos (n\u00ba do item): 1,3,7,9,12,15,16,19,21,23,25,28,30,34,36 (valor = 7 - resposta).
// Subescalas ORIGINAIS (Hurley, 2007): Distanciamento (aloof) 12 itens, Rigidez 12, Linguagem Pragmatica 12. Na amostra brasileira os fatores foram
// Interesse Social / Rigidez / Linguagem Pragmatica, e 5 itens de LP (2, 7, 10, 11, 29) migraram para Interesse Social. Aqui usamos a chave original porque
// os pontos de corte publicados (Hurley, 2007; Sasson et al., 2013) so existem para ela. Nao ha ponto de corte brasileiro.
// d.respostas: chaves 1..36 (numero do item) com a resposta 1-6 (antes de inverter). versaoEscala:2 (o registro antigo tinha itens errados).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[{"n":1,"texto":"Eu gosto de estar com outras pessoas","sub":"A","inv":true},{"n":2,"texto":"Eu tenho dificuldade para me expressar com naturalidade (deixar fluir)","sub":"P","inv":false},{"n":3,"texto":"Eu fico \u00e0 vontade com mudan\u00e7as inesperadas de planos","sub":"R","inv":true},{"n":4,"texto":"Eu tenho dificuldade em n\u00e3o me desviar do assunto nas conversas","sub":"P","inv":false},{"n":5,"texto":"Eu prefiro conversar com as pessoas para pedir informa\u00e7\u00e3o do que para me relacionar socialmente","sub":"A","inv":false},{"n":6,"texto":"As pessoas t\u00eam que me convencer a experimentar alguma coisa nova","sub":"R","inv":false},{"n":7,"texto":"Eu me sintonizo com a outra pessoa durante uma conversa","sub":"P","inv":true},{"n":8,"texto":"Eu tenho que me adaptar \u00e0 ideia de visitar um local desconhecido","sub":"R","inv":false},{"n":9,"texto":"Eu gosto de estar em situa\u00e7\u00f5es sociais","sub":"A","inv":true},{"n":10,"texto":"Eu tenho uma voz sem emo\u00e7\u00e3o ou mon\u00f3tona quando falo","sub":"P","inv":false},{"n":11,"texto":"Eu tenho dificuldade de me entrosar com as pessoas nas conversas","sub":"P","inv":false},{"n":12,"texto":"As pessoas acham f\u00e1cil se aproximar de mim","sub":"A","inv":true},{"n":13,"texto":"Eu sinto uma grande necessidade de rotina no dia a dia","sub":"R","inv":false},{"n":14,"texto":"As pessoas me pedem para eu repetir o que disse porque n\u00e3o me entendem","sub":"P","inv":false},{"n":15,"texto":"Eu sou flex\u00edvel em rela\u00e7\u00e3o a como as coisas devem ser feitas","sub":"R","inv":true},{"n":16,"texto":"Eu gosto muito de situa\u00e7\u00f5es em que posso conhecer novas pessoas","sub":"A","inv":true},{"n":17,"texto":"J\u00e1 me disseram que eu falo demais sobre certos assuntos","sub":"P","inv":false},{"n":18,"texto":"Quando participo de conversas \u00e9 apenas por educa\u00e7\u00e3o","sub":"A","inv":false},{"n":19,"texto":"Gosto muito de experimentar coisas novas","sub":"R","inv":true},{"n":20,"texto":"Eu falo muito alto ou muito baixinho","sub":"P","inv":false},{"n":21,"texto":"Eu consigo reconhecer quando algu\u00e9m n\u00e3o est\u00e1 interessado no que eu estou dizendo","sub":"P","inv":true},{"n":22,"texto":"Eu tenho dificuldade para lidar com mudan\u00e7as em minha rotina","sub":"R","inv":false},{"n":23,"texto":"Eu sou bom em puxar conversa sobre assuntos do dia a dia","sub":"A","inv":true},{"n":24,"texto":"Sou uma pessoa sistem\u00e1tica (tenho h\u00e1bitos r\u00edgidos)","sub":"R","inv":false},{"n":25,"texto":"Eu sinto que estou realmente interagindo com as pessoas","sub":"A","inv":true},{"n":26,"texto":"As pessoas ficam frustradas com minha relut\u00e2ncia em ser flex\u00edvel","sub":"R","inv":false},{"n":27,"texto":"Conversas me entediam","sub":"A","inv":false},{"n":28,"texto":"Sou caloroso e simp\u00e1tico nas minhas rela\u00e7\u00f5es com os outros","sub":"A","inv":true},{"n":29,"texto":"Eu deixo acontecer longas pausas em minhas conversas","sub":"P","inv":false},{"n":30,"texto":"Eu altero a minha rotina di\u00e1ria experimentando coisas diferentes","sub":"R","inv":true},{"n":31,"texto":"Eu prefiro estar sozinho a estar com os outros","sub":"A","inv":false},{"n":32,"texto":"Quando estou conversando com as pessoas eu me desvio do assunto principal","sub":"P","inv":false},{"n":33,"texto":"Eu gosto de seguir uma rotina r\u00edgida quando trabalho","sub":"R","inv":false},{"n":34,"texto":"Eu consigo perceber quando \u00e9 hora de mudar de assunto nas conversas","sub":"P","inv":true},{"n":35,"texto":"Eu continuo a fazer as coisas da forma como sei, mesmo que de outra maneira possa ser melhor","sub":"R","inv":false},{"n":36,"texto":"Eu gosto de bater papo com as pessoas","sub":"A","inv":true}];
var OPCOES=[{"valor":1,"texto":"1<br>Muito raramente"},{"valor":2,"texto":"2"},{"valor":3,"texto":"3"},{"valor":4,"texto":"4"},{"valor":5,"texto":"5"},{"valor":6,"texto":"6<br>Muito frequentemente"}];

var SUBS = [
    {k: 'A', nome: 'Distanciamento', cur: 'Distanciamento', painel: 'Distanciamento', cor: '#00796b', desc: 'Pouco interesse ou prazer em estar com os outros e em conversar; preferir ficar sozinho(a). \u00c9 o que o artigo original chama de "aloof" (distante).'},
    {k: 'R', nome: 'Rigidez', cur: 'Rigidez', painel: 'Rigidez', cor: '#ef6c00', desc: 'Dificuldade com mudan\u00e7as de rotina e com situa\u00e7\u00f5es novas; apego a h\u00e1bitos e a jeitos fixos de fazer as coisas.'},
    {k: 'P', nome: 'Linguagem pragm\u00e1tica', cur: 'Linguagem pragm\u00e1tica', painel: 'LinguagemPragmatica', cor: '#6a1b9a', desc: 'Dificuldade no uso social da fala: sintonizar-se com o outro, manter o assunto, perceber a hora de mudar de tema, ritmo e volume da voz.'}
];
var CORTES = {
    Masculino: {orig: {A: 3.25, P: 2.95, R: 3.65, T: 3.35}, sas: {A: 4.13, P: 3.23, R: 3.91, T: 3.55}},
    Feminino: {orig: {A: 3.00, P: 2.70, R: 3.25, T: 3.25}, sas: {A: 3.45, P: 2.94, R: 3.70, T: 3.17}}
};
var REFS = [
    'PRATA, L. L.; CAMARGOS JUNIOR, W.; TEODORO, M. L. M.; ROCHA, F. L. Qualidades psicom\u00e9tricas da vers\u00e3o brasileira da Escala Broad Autism Phenotype Questionnaire (BAPQ-Br). Contextos Cl\u00ednicos, v. 12, n. 1, 2019. DOI: 10.4013/ctc.2019.121.08.',
    'HURLEY, R. S. E. et al. The Broad Autism Phenotype Questionnaire. Journal of Autism and Developmental Disorders, v. 37, n. 9, p. 1679-1690, 2007. DOI: 10.1007/s10803-006-0299-3.',
    'SASSON, N. J. et al. The Broad Autism Phenotype Questionnaire: prevalence and diagnostic classification. Autism Research, v. 6, n. 2, p. 134-143, 2013. DOI: 10.1002/aur.1272.'
];
var AVISO = 'A BAPQ descreve tra\u00e7os de personalidade e de comunica\u00e7\u00e3o que a pr\u00f3pria pessoa relata, associados ao "fen\u00f3tipo ampliado do autismo" (tra\u00e7os leves, parecidos com os do autismo, que aparecem tamb\u00e9m na popula\u00e7\u00e3o geral e em familiares). N\u00e3o \u00e9 um teste de diagn\u00f3stico de autismo e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica. N\u00e3o existe ponto de corte definido para a popula\u00e7\u00e3o brasileira: os pontos de corte mostrados v\u00eam de estudos com adultos dos Estados Unidos e s\u00e3o apenas uma refer\u00eancia. O resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria de vida, a entrevista e outras fontes. Nenhum instrumento isolado descreve a pessoa por inteiro.';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function r2(n) { return Math.round(n * 100) / 100; }
function calcular(resp, sexo) {
    if (!resp) throw new Error('BAPQ: respostas incompletas');
    var r = {v: {}, p: {}, soma: {A: 0, R: 0, P: 0}, media: {}, sexo: sexo}, i;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 6)) throw new Error('BAPQ: resposta invalida no item ' + i);
        r.v[i] = x;
    }
    var tot = 0;
    ITENS.forEach(function (it) { var pt = it.inv ? 7 - r.v[it.n] : r.v[it.n]; r.p[it.n] = pt; r.soma[it.sub] += pt; tot += pt; });
    r.total = tot;
    r.media = {A: r2(r.soma.A / 12), R: r2(r.soma.R / 12), P: r2(r.soma.P / 12), T: r2(tot / 36)};
    r.cortes = CORTES[sexo] || null;
    return r;
}
function escore(r) { return r.media.T; }
function classifGeral(r) { return 'M\u00e9dia total ' + fmt(r.media.T) + ' (escala de 1 a 6); sem ponto de corte brasileiro definido'; }
function dadosPainel(r) {
    var o = {};
    SUBS.forEach(function (s) { o[s.painel] = {pontuacao: r.soma[s.k], max: 72, classificacao: 'm\u00e9dia ' + fmt(r.media[s.k]), media: r.media[s.k], itens: 12}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function pct(m) { return (m - 1) / 5 * 100; }
function compara(m, c) { return m >= c ? 'igual ou acima' : 'abaixo'; }
function blocks(r) {
    var b = [], c = r.cortes, M = r.media;
    b.push({t: 'hero', fundo: '#e0f2f1', borda: '#00796b', cor: '#004d40', titulo: 'M\u00e9dia total ' + fmt(M.T) + ' (de 1 a 6)', sub: 'Autorrelato, 36 itens. Quanto maior a m\u00e9dia, mais o conjunto de respostas se aproxima do que a escala descreve como tra\u00e7os do fen\u00f3tipo ampliado do autismo. N\u00e3o h\u00e1 ponto de corte brasileiro.'});
    b.push({t: 'cards', itens: [
        {rot: 'M\u00c9DIA TOTAL', valor: fmt(M.T), de: 'de 1 a 6', cor: '#004d40'},
        {rot: 'DISTANCIAMENTO', valor: fmt(M.A), de: '12 itens', cor: '#00796b'},
        {rot: 'RIGIDEZ', valor: fmt(M.R), de: '12 itens', cor: '#ef6c00'},
        {rot: 'LING. PRAGM\u00c1TICA', valor: fmt(M.P), de: '12 itens', cor: '#6a1b9a'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a BAPQ mede', x: 'Quanto a pr\u00f3pria pessoa se reconhece em 36 afirma\u00e7\u00f5es sobre gostar de estar com os outros, lidar com mudan\u00e7as e conversar. Foi criada para identificar, em adultos e em familiares de pessoas autistas, tra\u00e7os leves parecidos com os do autismo, sem que haja diagn\u00f3stico.'},
        {t: 'Como interpretar', x: 'Cada resposta vai de 1 (muito raramente) a 6 (muito frequentemente). Algumas afirma\u00e7\u00f5es descrevem o oposto do tra\u00e7o (por exemplo, "Eu gosto de estar com outras pessoas"); nelas o valor \u00e9 invertido antes da conta, para que um n\u00famero maior sempre signifique mais do tra\u00e7o. O resultado \u00e9 a m\u00e9dia das respostas de cada grupo e a m\u00e9dia geral.'},
        {t: 'Sobre os pontos de corte', x: c ? ('Dois conjuntos de valores s\u00e3o mostrados nas barras, separados por sexo, ambos de estudos com adultos dos Estados Unidos: os pontos originais de Hurley et al. (2007) e os pontos mais espec\u00edficos de Sasson et al. (2013), que identificam menos pessoas "falso-positivas" mas deixam passar mais. Nenhum deles foi definido para o Brasil. Os pontos n\u00e3o s\u00e3o diagn\u00f3stico.') : 'Os pontos de corte publicados s\u00e3o separados por sexo; como o sexo n\u00e3o foi informado, eles n\u00e3o s\u00e3o mostrados.'},
        {t: 'Sobre a vers\u00e3o brasileira', x: 'Na valida\u00e7\u00e3o brasileira (Prata et al., 2019), os itens se agruparam de um jeito um pouco diferente do original: cinco itens da Linguagem Pragm\u00e1tica (2, 7, 10, 11 e 29) ficaram junto do fator Interesse Social. Aqui usamos o agrupamento original porque \u00e9 o \u00fanico para o qual existem pontos de corte publicados.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de autismo nem de qualquer outro transtorno. \u00c9 o que a pessoa relatou sobre si, num momento, e precisa ser comparado com entrevista, hist\u00f3ria de vida e outras fontes.'}
    ]});
    b.push({t: 'barras', titulo: 'M\u00e9dias por grupo de afirma\u00e7\u00f5es', nota: c ? 'Cada barra vai de 1 a 6. Marcas: H = ponto de corte original (Hurley, 2007); S = ponto de Sasson (2013), para o sexo ' + (r.sexo === 'Masculino' ? 'masculino' : 'feminino') + ', ambos de adultos dos EUA.' : 'Cada barra vai de 1 a 6.', itens: SUBS.concat([{k: 'T', nome: 'M\u00e9dia total (36 itens)', cor: '#004d40'}]).map(function (s) {
        var o = {rot: s.nome + (s.k === 'T' ? '' : ' (12 itens)'), txt: 'm\u00e9dia ' + fmt(M[s.k]) + ' (de 1 a 6)', pct: pct(M[s.k]), cor: s.cor};
        if (c) o.cortes = [{pct: pct(c.orig[s.k]), rot: 'H' + fmt(c.orig[s.k])}, {pct: pct(c.sas[s.k]), rot: 'S' + fmt(c.sas[s.k])}];
        return o;
    })});
    if (c) {
        b.push({t: 'textos', titulo: 'Compara\u00e7\u00e3o com os pontos de corte publicados (adultos dos EUA)', itens: SUBS.concat([{k: 'T', nome: 'M\u00e9dia total'}]).map(function (s) {
            return {t: s.nome + ' - m\u00e9dia ' + fmt(M[s.k]), x: 'Ponto original (Hurley, 2007): ' + fmt(c.orig[s.k]) + ' - a m\u00e9dia est\u00e1 ' + compara(M[s.k], c.orig[s.k]) + '. Ponto de Sasson (2013): ' + fmt(c.sas[s.k]) + ' - a m\u00e9dia est\u00e1 ' + compara(M[s.k], c.sas[s.k]) + '.'};
        })});
    }
    b.push({t: 'textos', titulo: 'O que cada grupo mostra', itens: SUBS.map(function (s) {
        var its = ITENS.filter(function (it) { return it.sub === s.k; }).map(function (it) { return it.n; });
        return {t: s.nome + ' - itens ' + its.join(', '), x: s.desc};
    })});
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a m\u00e9dia foi calculada', x: 'Os itens 1, 3, 7, 9, 12, 15, 16, 19, 21, 23, 25, 28, 30, 34 e 36 s\u00e3o invertidos (valor = 7 - resposta). Depois, m\u00e9dia de cada grupo (soma dos 12 itens dividida por 12): Distanciamento = ' + fmt(M.A) + '; Rigidez = ' + fmt(M.R) + '; Linguagem pragm\u00e1tica = ' + fmt(M.P) + '. M\u00e9dia total = soma dos 36 itens (' + r.total + ') dividida por 36 = ' + fmt(M.T) + '.'}
    ]});
    var nomeSub = {A: 'Distanc.', R: 'Rigidez', P: 'Ling. prag.'};
    var linhas = ITENS.map(function (it) { return {c: [String(it.n), nomeSub[it.sub], it.texto, String(r.v[it.n]) + (it.inv ? ' (inv.)' : ''), String(r.p[it.n])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Grupo', w: 20, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 100, al: 'l'}, {h: 'Resposta', w: 24, al: 'c'}, {h: 'Pontos', w: 16, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) { try { if (d.versaoEscala !== 2) return null; return calcular(d.respostas, d.sexo); } catch (e) { return null; } }
var base = symMake({
    id: 'bapq', nome: 'BAPQ', cor: '#00796b', cor2: '#004d40', escalaPainel: ['BAPQ'],
    sub1: 'Question\u00e1rio do Fen\u00f3tipo Ampliado do Autismo (Broad Autism Phenotype Questionnaire) - autorrelato, 36 itens',
    sub2: 'Hurley et al. (2007) | vers\u00e3o brasileira: Prata et al. (2019)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_BAPQ = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, CORTES: CORTES};


})();
