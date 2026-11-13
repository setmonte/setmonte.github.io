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

// pcl5-visual.js - PCL-5 (PTSD Checklist for DSM-5), 20 itens 0-4, soma 0-80, grupos B (1-5), C (6-7), D (8-14), E (15-20). Tela e PDF dos mesmos blocos.
// Calculo mantido como no site e conferido com Weathers et al. (2013) e Osorio et al. (2017): soma dos 20 itens; sintoma presente = item >= 2; regra provisoria do DSM-5:
// ao menos 1 sintoma B, 1 C, 2 D e 2 E. Cortes de referencia: 31 a 33 (Centro Nacional de TEPT, EUA; o site usava 33) e 36 (Pereira-Lima et al., 2019, amostra brasileira de 85 pessoas, SCID-5-CV).
// Retirados: caixa vermelha "Rastreio POSITIVO para TEPT" como veredito. A PCL-5 nao avalia exposicao ao evento (criterio A), duracao nem prejuizo funcional.
// d.respostas: chaves 1..20, valores 0-4 (igual ao registro antigo).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Mem\u00f3rias, pensamentos ou imagens repetitivos e perturbadores sobre a experi\u00eancia estressante?"},
{texto:"Sonhos repetitivos e perturbadores sobre a experi\u00eancia estressante?"},
{texto:"De repente sentir ou agir como se a experi\u00eancia estressante estivesse acontecendo novamente (como se voc\u00ea a estivesse revivendo)?"},
{texto:"Sentir-se muito chateado(a) quando algo lembrou voc\u00ea da experi\u00eancia estressante?"},
{texto:"Ter rea\u00e7\u00f5es f\u00edsicas fortes quando algo lembrou voc\u00ea da experi\u00eancia estressante (por exemplo: cora\u00e7\u00e3o batendo forte, dificuldade para respirar, suor)?"},
{texto:"Evitar mem\u00f3rias, pensamentos ou sentimentos relacionados \u00e0 experi\u00eancia estressante?"},
{texto:"Evitar lembretes externos da experi\u00eancia estressante (por exemplo: pessoas, lugares, conversas, atividades, objetos ou situa\u00e7\u00f5es)?"},
{texto:"Dificuldade para lembrar de partes importantes da experi\u00eancia estressante?"},
{texto:"Ter cren\u00e7as negativas fortes sobre si mesmo(a), outras pessoas ou o mundo (por exemplo: ter pensamentos como \u0027eu sou mau\u0027, \u0027n\u00e3o posso confiar em ningu\u00e9m\u0027, \u0027o mundo \u00e9 completamente perigoso\u0027)?"},
{texto:"Culpar a si mesmo(a) ou outra pessoa pelo evento estressante ou pelo que aconteceu depois?"},
{texto:"Ter sentimentos negativos fortes como medo, horror, raiva, culpa ou vergonha?"},
{texto:"Perda de interesse em atividades que costumava gostar?"},
{texto:"Sentir-se distante ou afastado(a) de outras pessoas?"},
{texto:"Dificuldade em ter sentimentos positivos (por exemplo: ser incapaz de sentir felicidade ou amor por pessoas pr\u00f3ximas)?"},
{texto:"Comportamento irrit\u00e1vel, explos\u00f5es de raiva ou agir agressivamente?"},
{texto:"Correr riscos excessivos ou fazer coisas que poderiam causar dano a voc\u00ea?"},
{texto:"Estar \u0027super alerta\u0027, vigilante ou em guarda?"},
{texto:"Sentir-se sobressaltado(a) ou assustar-se facilmente?"},
{texto:"Ter dificuldade para se concentrar?"},
{texto:"Ter problemas para dormir?"}
];

var OPCOES=[{valor:0,texto:"Nada"},{valor:1,texto:"Um pouco"},{valor:2,texto:"Moderadamente"},{valor:3,texto:"Bastante"},{valor:4,texto:"Extremamente"}];

var CLUSTERS={
"B - Intrus\u00e3o":[0,1,2,3,4],
"C - Evita\u00e7\u00e3o":[5,6],
"D - Cogni\u00e7\u00e3o/Humor negativo":[7,8,9,10,11,12,13],
"E - Reatividade":[14,15,16,17,18,19]
};

var CL = [
    {k: 'Intrusao', chave: 'B - Intrus\u00e3o', letra: 'B', nome: 'B - Reviver o ocorrido (intrus\u00e3o)', min: 1, cor: '#37474f'},
    {k: 'Evitacao', chave: 'C - Evita\u00e7\u00e3o', letra: 'C', nome: 'C - Evitar lembran\u00e7as (evita\u00e7\u00e3o)', min: 1, cor: '#00796b'},
    {k: 'Cognicao', chave: 'D - Cogni\u00e7\u00e3o/Humor negativo', letra: 'D', nome: 'D - Pensamentos e humor negativos', min: 2, cor: '#5e35b1'},
    {k: 'Reatividade', chave: 'E - Reatividade', letra: 'E', nome: 'E - Alerta e reatividade', min: 2, cor: '#ef6c00'}
];
var CORTE_INT = 33, CORTE_BR = 36;
var ZONAS = [
    {de: 0, ate: 33, cor: '#78909c', rot: '0 a 32'},
    {de: 33, ate: 36, cor: '#f9a825', rot: '33 a 35'},
    {de: 36, ate: 81, cor: '#ef6c00', rot: '36 a 80'}
];
var ZTXT = [
    'Abaixo dos dois cortes de refer\u00eancia (33 e 36).',
    'A partir do corte de 33, mas abaixo do corte brasileiro de 36.',
    'A partir dos dois cortes de refer\u00eancia (33 e 36).'
];
var ZPAINEL = ['Rastreio negativo (abaixo de 33)', 'Rastreio positivo pelo corte 33 (abaixo do corte brasileiro 36)', 'Rastreio positivo (36 ou mais)'];
var REFS = [
    'OS\u00d3RIO, F. L. et al. Posttraumatic Stress Disorder Checklist for DSM-5 (PCL-5): transcultural adaptation of the Brazilian version. Archives of Clinical Psychiatry (S\u00e3o Paulo), v. 44, n. 1, p. 10-19, 2017. DOI: 10.1590/0101-60830000000107.',
    'LIMA, E. P. et al. Cross-cultural adaptation of the Posttraumatic Stress Disorder Checklist 5 (PCL-5) and Life Events Checklist 5 (LEC-5) for the Brazilian context. Trends in Psychiatry and Psychotherapy, v. 38, n. 4, 2016.',
    'PEREIRA-LIMA, K. et al. Psychometric properties and diagnostic utility of a Brazilian version of the PCL-5 (complete and abbreviated versions). European Journal of Psychotraumatology, v. 10, n. 1, 1581020, 2019. DOI: 10.1080/20008198.2019.1581020.',
    'WEATHERS, F. W. et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD, 2013. Dispon\u00edvel em: www.ptsd.va.gov.',
    'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and statistical manual of mental disorders: DSM-5-TR. 5th ed., text rev. Washington, DC: APA, 2022.'
];
var AVISO = 'A PCL-5 mostra o quanto a pessoa foi incomodada, no \u00faltimo m\u00eas, por problemas que podem surgir depois de uma experi\u00eancia muito estressante; \u00e9 um instrumento de rastreio e n\u00e3o um diagn\u00f3stico de TEPT. Ela n\u00e3o avalia se houve exposi\u00e7\u00e3o ao evento traum\u00e1tico (crit\u00e9rio A do DSM-5), nem a dura\u00e7\u00e3o dos sintomas ou o preju\u00edzo no funcionamento, e n\u00e3o distingue o TEPT de outros quadros. Os pontos de corte variam entre estudos (31 a 38); o corte brasileiro de 36 vem de uma amostra de 85 pessoas e \u00e9 apenas um ind\u00edcio. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, em entrevista cl\u00ednica.';

function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('PCL-5: respostas incompletas');
    var r = {v: [], total: 0, cl: [], sintTot: 0, gruposOk: 0}, i, c;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x >= 0 && x <= 4)) throw new Error('PCL-5: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
    }
    for (c = 0; c < CL.length; c++) {
        var idx = CLUSTERS[CL[c].chave], soma = 0, sint = [], j;
        if (!idx) throw new Error('PCL-5: grupo ausente ' + CL[c].chave);
        for (j = 0; j < idx.length; j++) { soma += r.v[idx[j]]; if (r.v[idx[j]] >= 2) sint.push(idx[j]); }
        var ok = sint.length >= CL[c].min;
        r.cl.push({k: CL[c].k, idx: idx, soma: soma, max: idx.length * 4, sint: sint, ok: ok});
        r.sintTot += sint.length; if (ok) r.gruposOk++;
    }
    r.dsm = r.gruposOk === 4;
    r.zona = r.total < CORTE_INT ? 0 : (r.total < CORTE_BR ? 1 : 2);
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return ZPAINEL[r.zona]; }
function dadosPainel(r) {
    var o = {};
    r.cl.forEach(function (d, ix) { o[d.k] = {pontuacao: d.soma, max: d.max, classificacao: d.sint.length + ' de ' + d.idx.length + ' sintomas (item >= 2); regra DSM: ' + (d.ok ? 'atendida' : 'n\u00e3o atendida')}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function lista(a) { return a.map(function (q) { return q + 1; }).join(', '); }
function blocks(r) {
    var b = [], c, i;
    b.push({t: 'hero', fundo: '#eceff1', borda: '#37474f', cor: '#263238', titulo: 'Escore ' + r.total + ' de 80 pontos', sub: ZTXT[r.zona]});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de 0 a 80 pontos', cor: '#37474f'},
        {rot: 'SINTOMAS PRESENTES', valor: r.sintTot + ' de 20', de: 'itens com resposta 2 ou mais', cor: '#00796b'},
        {rot: 'GRUPOS DO DSM-5', valor: r.gruposOk + ' de 4', de: r.dsm ? 'regra de sintomas atendida' : 'regra de sintomas n\u00e3o atendida', cor: r.dsm ? '#ef6c00' : '#78909c'}
    ]});
    b.push({t: 'faixas', titulo: 'Escore e cortes de refer\u00eancia (33 e 36)', min: 0, max: 81, pino: r.total + 0.5, ativo: r.zona, faixas: ZONAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que a PCL-5 mede', x: 'Quanto a pessoa foi incomodada, no \u00faltimo m\u00eas, por 20 problemas que podem aparecer depois de uma experi\u00eancia muito estressante. Eles formam os quatro grupos de sintomas do TEPT no DSM-5: reviver o ocorrido (B), evitar lembran\u00e7as (C), pensamentos e humor negativos (D) e ficar em alerta e reativo (E).'},
        {t: 'Duas maneiras de olhar o resultado', x: '1) Pelo escore total (0 a 80), comparado com pontos de corte: o Centro Nacional de TEPT dos EUA sugere 31 a 33 (o site usava 33) e, numa amostra brasileira (Pereira-Lima et al., 2019), o corte 36 teve o melhor equil\u00edbrio entre acertos e erros. 2) Pelos sintomas presentes: cada item com resposta 2 ("moderadamente") ou mais conta como sintoma, e o DSM-5 pede ao menos 1 sintoma do grupo B, 1 do C, 2 do D e 2 do E.'},
        {t: 'Sobre os pontos de corte', x: 'Os estudos mostram cortes entre 31 e 38, conforme a amostra. O corte brasileiro de 36 vem de 85 pessoas atendidas numa cidade, com entrevista estruturada (SCID-5) como refer\u00eancia; vale como ind\u00edcio, n\u00e3o como norma.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de TEPT: a PCL-5 n\u00e3o avalia se houve exposi\u00e7\u00e3o ao evento (crit\u00e9rio A), a dura\u00e7\u00e3o dos sintomas nem o preju\u00edzo no funcionamento. Estar acima ou abaixo de um corte n\u00e3o substitui a entrevista cl\u00ednica.'}
    ]});
    b.push({t: 'barras', titulo: 'Os quatro grupos de sintomas', nota: 'Cada barra vai de 0 ao m\u00e1ximo do grupo. M\u00ednimo exigido pelo DSM-5: B 1, C 1, D 2, E 2 sintomas.', itens: r.cl.map(function (d, ix) {
        return {rot: CL[ix].nome + ' (itens ' + (d.idx[0] + 1) + ' a ' + (d.idx[d.idx.length - 1] + 1) + ')', txt: d.soma + ' de ' + d.max + ' pontos | ' + d.sint.length + ' de ' + d.idx.length + ' sintomas (m\u00ednimo ' + CL[ix].min + ')', pct: d.soma / d.max * 100, cor: CL[ix].cor};
    })});
    var pres = [];
    r.cl.forEach(function (d, ix) { pres.push('Grupo ' + CL[ix].letra + ': ' + (d.sint.length ? 'itens ' + lista(d.sint) : 'nenhum item') + ' (' + (d.ok ? 'm\u00ednimo atendido' : 'm\u00ednimo n\u00e3o atendido') + ')'); });
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Cada resposta vale de 0 (nada) a 4 (extremamente). A soma dos 20 itens \u00e9 o escore total: ' + r.v.join(' + ') + ' = ' + r.total + ' pontos, de um m\u00e1ximo de 80. Os grupos somam os seus itens: B (1 a 5), C (6 e 7), D (8 a 14) e E (15 a 20).'},
        {t: 'Sintomas presentes (resposta 2 ou mais)', x: pres.join(' | ') + '. ' + (r.dsm ? 'Os quatro grupos atingem o m\u00ednimo da regra de sintomas do DSM-5; \u00e9 uma regra provis\u00f3ria de rastreio, que ainda exige entrevista cl\u00ednica.' : 'Pelo menos um grupo n\u00e3o atinge o m\u00ednimo da regra de sintomas do DSM-5.')}
    ]});
    var linhas = ITENS.map(function (it, ix) {
        var g = '';
        r.cl.forEach(function (d, ci) { if (d.idx.indexOf(ix) >= 0) g = CL[ci].letra; });
        return {c: [String(ix + 1), g, it.texto, OPCOES[r.v[ix]].texto, String(r.v[ix])]};
    });
    b.push({t: 'tabela', titulo: 'Respostas (no \u00faltimo m\u00eas, quanto voc\u00ea foi incomodado(a) por...)', minAltura: 110, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Grupo', w: 14, al: 'c'}, {h: 'Item', w: 108, al: 'l'}, {h: 'Resposta', w: 34, al: 'c'}, {h: 'Pontos', w: 18, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 0 && x <= 4)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'pcl5', nome: 'PCL-5', cor: '#37474f', cor2: '#00796b', escalaPainel: ['PCL-5'],
    sub1: 'PTSD Checklist for DSM-5 - 20 itens, \u00faltimo m\u00eas',
    sub2: 'Weathers et al. (2013) | adapta\u00e7\u00e3o brasileira: Os\u00f3rio et al. (2017); Lima et al. (2016)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_PCL5 = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, CLUSTERS: CLUSTERS};

})();
