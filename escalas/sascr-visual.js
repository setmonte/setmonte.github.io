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

// sascr-visual.js - SASC-R (Social Anxiety Scale for Children-Revised, La Greca e Stone, 1993), 22 itens (18 pontuados + 4 neutros: 2, 7, 11, 16), 1-5.
// Subescalas: FNE (itens 3,6,8,9,12,14,17,18), SAD-N (1,4,10,13,19,22), SAD-G (5,15,20,21). Total = soma dos 18 itens pontuados (18-90).
// CORRECOES: (1) a norma por sexo nunca era usada (o codigo comparava o sexo com 'M'/'F', mas o campo guarda 'Masculino'/'Feminino'); (2) removidas as faixas de classificacao por z
// (-0,5 / 1,0 / 1,5 / 2,0) e o "corte z >= 1,5", sem fonte (o artigo de adaptacao nao define ponto de corte).
// NORMAS: amostra de Portugal (486 criancas de 9 a 15 anos; Martins et al., 2014) - valores da pagina antiga, NAO conferidos (as tabelas do artigo estao em imagem). Nao ha norma brasileira.
// d.respostas: chaves 1..22 (numero do item) com a resposta 1-5, igual ao registro antigo.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{n:1, texto:"Me preocupo em ter que fazer coisas novas na frente dos outros colegas", sub:"SADN"},
{n:2, texto:"Gosto de brincar com meus colegas", sub:"NEUTRO"},
{n:3, texto:"Me preocupo com a possibilidade de ser zoado(a)", sub:"FNE"},
{n:4, texto:"Me sinto t\u00edmido(a) quando estou com meninos/meninas que n\u00e3o conhe\u00e7o", sub:"SADN"},
{n:5, texto:"S\u00f3 converso com colegas que eu conhe\u00e7o muito bem", sub:"SADG"},
{n:6, texto:"Acho que meus colegas falam de mim pelas costas", sub:"FNE"},
{n:7, texto:"Eu gosto de ler", sub:"NEUTRO"},
{n:8, texto:"Me preocupo com o que os outros colegas pensam de mim", sub:"FNE"},
{n:9, texto:"Tenho medo de que os outros possam n\u00e3o gostar de mim", sub:"FNE"},
{n:10, texto:"Fico nervoso(a) quando converso com colegas que n\u00e3o conhe\u00e7o muito bem", sub:"SADN"},
{n:11, texto:"Gosto de praticar esportes", sub:"NEUTRO"},
{n:12, texto:"Me preocupo com o que os outros dizem sobre mim", sub:"FNE"},
{n:13, texto:"Fico nervoso(a) quando conhe\u00e7o colegas novos", sub:"SADN"},
{n:14, texto:"Me preocupo que os outros colegas n\u00e3o gostem de mim", sub:"FNE"},
{n:15, texto:"Fico calado(a) quando estou em um grupo de meninos/meninas", sub:"SADG"},
{n:16, texto:"Gosto de fazer as coisas sozinho(a)", sub:"NEUTRO"},
{n:17, texto:"Acho que os outros colegas zombam de mim", sub:"FNE"},
{n:18, texto:"Se discuto com outro colega, me preocupo que ele/a possa n\u00e3o gostar de mim", sub:"FNE"},
{n:19, texto:"Tenho medo de convidar outros colegas para fazer alguma coisa comigo, porque podem dizer que n\u00e3o", sub:"SADN"},
{n:20, texto:"Me sinto nervoso(a) quando estou perto de alguns/algumas colegas", sub:"SADG"},
{n:21, texto:"Me sinto t\u00edmido(a) at\u00e9 com colegas que conhe\u00e7o bem", sub:"SADG"},
{n:22, texto:"Para mim \u00e9 dif\u00edcil pedir para outros colegas fazerem coisas comigo", sub:"SADN"}
];

var OPCOES=[
{valor:1, texto:"Nunca"},
{valor:2, texto:"Quase<br>nunca"},
{valor:3, texto:"\u00c0s<br>vezes"},
{valor:4, texto:"Quase<br>sempre"},
{valor:5, texto:"Sempre"}
];

var NORMAS={
    M: {total:{m:45.66,dp:12.40}, fne:{m:20.98,dp:6.99}, sadn:{m:14.48,dp:4.49}, sadg:{m:8.01,dp:3.12}},
    F: {total:{m:51.49,dp:12.92}, fne:{m:23.68,dp:7.10}, sadn:{m:16.32,dp:4.46}, sadg:{m:8.84,dp:3.39}},
    G: {total:{m:48.52,dp:12.89}, fne:{m:22.30,dp:7.14}, sadn:{m:15.38,dp:4.56}, sadg:{m:8.42,dp:3.27}}
};

var SUBS = [
    {k: 'FNE', nome: 'FNE - Medo de avalia\u00e7\u00e3o negativa', cur: 'FNE', n: 8, cor: '#6a1b9a', desc: 'Preocupa\u00e7\u00e3o com o que os colegas pensam, dizem ou sentem sobre a crian\u00e7a: ser zoada, criticada ou n\u00e3o ser querida.'},
    {k: 'SADN', nome: 'SAD-N - Desconforto em situa\u00e7\u00f5es novas', cur: 'SAD-N', n: 6, cor: '#00796b', desc: 'Timidez, nervosismo e evita\u00e7\u00e3o diante de colegas que a crian\u00e7a n\u00e3o conhece ou de situa\u00e7\u00f5es sociais novas.'},
    {k: 'SADG', nome: 'SAD-G - Desconforto social geral', cur: 'SAD-G', n: 4, cor: '#ef6c00', desc: 'Desconforto e inibi\u00e7\u00e3o na companhia dos colegas em geral, mesmo os conhecidos, como ficar calado(a) em grupo.'}
];
var NEUTROS = [2, 7, 11, 16];
var REFS = [
    'MARTINS, A. A. et al. Ansiedade social na inf\u00e2ncia e pr\u00e9-adolesc\u00eancia: adapta\u00e7\u00e3o para o portugu\u00eas de Portugal da SASC-R. Psicologia: Reflex\u00e3o e Cr\u00edtica, 2014.',
    'LA GRECA, A. M.; STONE, W. L. Social Anxiety Scale for Children-Revised: factor structure and concurrent validity. Journal of Clinical Child Psychology, v. 22, n. 1, p. 17-27, 1993.'
];
var AVISO = 'A SASC-R descreve a ansiedade social que a pr\u00f3pria crian\u00e7a relata em rela\u00e7\u00e3o aos colegas; \u00e9 uma escala de rastreio e n\u00e3o um diagn\u00f3stico de transtorno de ansiedade social. N\u00e3o h\u00e1 ponto de corte definido para classificar a pontua\u00e7\u00e3o. As normas usadas s\u00e3o de crian\u00e7as de Portugal (9 a 15 anos) e podem n\u00e3o representar as crian\u00e7as brasileiras; os valores das normas devem ser conferidos no artigo original. Nenhum instrumento isolado descreve a crian\u00e7a por inteiro; o resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria, a observa\u00e7\u00e3o e outras fontes (pais, escola).';

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
function normaDe(sexo) { var s = String(sexo || '').toUpperCase().charAt(0); return s === 'M' ? NORMAS.M : (s === 'F' ? NORMAS.F : NORMAS.G); }
function nomeNorma(sexo) { var s = String(sexo || '').toUpperCase().charAt(0); return s === 'M' ? 'meninos' : (s === 'F' ? 'meninas' : 'ambos os sexos'); }
function calcular(resp, sexo) {
    if (!resp) throw new Error('SASC-R: respostas incompletas');
    var r = {v: {}, sub: {}, total: 0}, i, k;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 5)) throw new Error('SASC-R: resposta invalida no item ' + i);
        r.v[i] = x;
    }
    var fne = 0, sadn = 0, sadg = 0;
    ITENS.forEach(function (it) { if (it.sub === 'FNE') fne += r.v[it.n]; else if (it.sub === 'SADN') sadn += r.v[it.n]; else if (it.sub === 'SADG') sadg += r.v[it.n]; });
    r.sub = {FNE: fne, SADN: sadn, SADG: sadg}; r.total = fne + sadn + sadg;
    r.norma = normaDe(sexo); r.grupo = nomeNorma(sexo);
    r.z = {
        total: (r.total - r.norma.total.m) / r.norma.total.dp,
        FNE: (fne - r.norma.fne.m) / r.norma.fne.dp,
        SADN: (sadn - r.norma.sadn.m) / r.norma.sadn.dp,
        SADG: (sadg - r.norma.sadg.m) / r.norma.sadg.dp
    };
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return 'Sem faixa de classifica\u00e7\u00e3o: escore ' + r.total + ' de 90 (z = ' + fmt(r.z.total) + ' na norma de ' + r.grupo + ' de Portugal)'; }
function dadosPainel(r) {
    var o = {}, mx = {FNE: 40, SADN: 30, SADG: 20};
    SUBS.forEach(function (s) { o[s.k] = {pontuacao: r.sub[s.k], max: mx[s.k], classificacao: 'z = ' + fmt(r.z[s.k])}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function pos(r, x) { return x; }
function blocks(r) {
    var b = [], nm = r.norma, mn = {FNE: 8, SADN: 6, SADG: 4}, mx = {FNE: 40, SADN: 30, SADG: 20};
    b.push({t: 'hero', fundo: '#f3e5f5', borda: '#6a1b9a', cor: '#4a148c', titulo: 'Escore ' + r.total + ' de 90 pontos (m\u00ednimo 18)', sub: 'z = ' + fmt(r.z.total) + ' em rela\u00e7\u00e3o \u00e0s ' + r.grupo + ' da amostra de refer\u00eancia (Portugal). Escala sem ponto de corte definido.'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de 18 a 90 pontos', cor: '#6a1b9a'},
        {rot: 'FNE', valor: r.sub.FNE + ' / 40', de: 'z = ' + fmt(r.z.FNE), cor: '#6a1b9a'},
        {rot: 'SAD-N', valor: r.sub.SADN + ' / 30', de: 'z = ' + fmt(r.z.SADN), cor: '#00796b'},
        {rot: 'SAD-G', valor: r.sub.SADG + ' / 20', de: 'z = ' + fmt(r.z.SADG), cor: '#ef6c00'}
    ]});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a SASC-R mede', x: 'O quanto a crian\u00e7a relata, em 18 afirma\u00e7\u00f5es, sentir ansiedade e evitar situa\u00e7\u00f5es sociais com os colegas. Os resultados se organizam em tr\u00eas grupos: medo de avalia\u00e7\u00e3o negativa (FNE), desconforto em situa\u00e7\u00f5es novas (SAD-N) e desconforto social geral (SAD-G). Quatro afirma\u00e7\u00f5es (itens 2, 7, 11 e 16) s\u00e3o neutras e n\u00e3o somam pontos.'},
        {t: 'Como interpretar', x: 'Cada resposta vale de 1 (nunca) a 5 (sempre). Quanto maior a soma, mais ansiedade social a crian\u00e7a relata. O valor z mostra a dist\u00e2ncia da m\u00e9dia das crian\u00e7as da amostra de refer\u00eancia, em desvios-padr\u00e3o: 0 \u00e9 a m\u00e9dia, valores positivos est\u00e3o acima da m\u00e9dia e negativos abaixo. N\u00e3o existe ponto de corte definido para dizer quando a ansiedade \u00e9 clinicamente significativa.'},
        {t: 'Sobre as normas', x: 'As m\u00e9dias e desvios usados v\u00eam de uma amostra de 486 crian\u00e7as de Portugal, de 9 a 15 anos (Martins et al., 2014), com valores separados para meninos e meninas, pois as meninas pontuaram mais. N\u00e3o encontrei normas brasileiras; por isso, o z deve ser lido com cautela e como apoio descritivo.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de transtorno de ansiedade social. \u00c9 o que a pr\u00f3pria crian\u00e7a relatou, num momento, e precisa ser comparado com a observa\u00e7\u00e3o de pais, professores e com a entrevista cl\u00ednica.'}
    ]});
    b.push({t: 'barras', titulo: 'Os tr\u00eas grupos de afirma\u00e7\u00f5es', nota: 'Cada barra vai do m\u00ednimo ao m\u00e1ximo poss\u00edvel. Marcas: m\u00e9dia da norma de ' + r.grupo + ' (Portugal) e 1 desvio-padr\u00e3o acima.', itens: SUBS.map(function (s) {
        var ref = nm[s.k.toLowerCase()], mi = mn[s.k], ma = mx[s.k], span = ma - mi;
        return {rot: s.nome + ' (' + s.n + ' itens)', txt: r.sub[s.k] + ' de ' + ma + ' pontos (m\u00ednimo ' + mi + ') | z = ' + fmt(r.z[s.k]), pct: (r.sub[s.k] - mi) / span * 100, cor: s.cor, cortes: [{pct: (ref.m - mi) / span * 100, rot: 'm\u00e9dia'}, {pct: (ref.m + ref.dp - mi) / span * 100, rot: '+1 DP'}]};
    }).concat([{rot: 'Total (18 itens pontuados)', txt: r.total + ' de 90 pontos (m\u00ednimo 18) | z = ' + fmt(r.z.total), pct: (r.total - 18) / 72 * 100, cor: '#4a148c', cortes: [{pct: (nm.total.m - 18) / 72 * 100, rot: 'm\u00e9dia'}, {pct: (nm.total.m + nm.total.dp - 18) / 72 * 100, rot: '+1 DP'}]}])});
    b.push({t: 'textos', titulo: 'O que cada grupo mostra', itens: SUBS.map(function (s) {
        var its = ITENS.filter(function (it) { return it.sub === s.k; }).map(function (it) { return it.n; });
        return {t: s.nome + ' - itens ' + its.join(', '), x: s.desc};
    })});
    var conta = [];
    SUBS.forEach(function (s) { conta.push(s.cur + ' = ' + r.sub[s.k]); });
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Soma das respostas (1 a 5) dos 18 itens pontuados, em tr\u00eas grupos: ' + conta.join('; ') + '. Total = ' + r.total + ' (m\u00ednimo 18, m\u00e1ximo 90). Os itens neutros (2, 7, 11 e 16) n\u00e3o entram na soma. O valor z de cada grupo \u00e9 (pontua\u00e7\u00e3o - m\u00e9dia da norma) / desvio-padr\u00e3o da norma.'}
    ]});
    var linhas = ITENS.map(function (it) { var sn = it.sub === 'NEUTRO' ? 'Neutro' : (it.sub === 'SADN' ? 'SAD-N' : (it.sub === 'SADG' ? 'SAD-G' : 'FNE')); return {c: [String(it.n), sn, it.texto, OPCOES[r.v[it.n] - 1].texto.replace(/<br>/g, ' '), it.sub === 'NEUTRO' ? '-' : String(r.v[it.n])]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Grupo', w: 16, al: 'c'}, {h: 'Afirma\u00e7\u00e3o', w: 100, al: 'l'}, {h: 'Resposta', w: 38, al: 'c'}, {h: 'Pontos', w: 20, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) { try { return calcular(d.respostas, d.sexo); } catch (e) { return null; } }
var base = symMake({
    id: 'sascr', nome: 'SASC-R', cor: '#6a1b9a', cor2: '#00796b', escalaPainel: ['SASC-R'],
    sub1: 'Escala de Ansiedade Social para Crian\u00e7as - Revisada (Social Anxiety Scale for Children-Revised) - 22 itens',
    sub2: 'La Greca e Stone (1993) | adapta\u00e7\u00e3o: Martins et al. (2014), Portugal',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_SASCR = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, NORMAS: NORMAS};

})();
