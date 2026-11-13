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

// audit-visual.js - AUDIT (Alcohol Use Disorders Identification Test, OMS), 10 itens, soma 0-40. Tela e PDF dos mesmos blocos.
// Calculo mantido como no site e conferido com Babor et al. (2001): itens 1-8 valem 0-4, itens 9 e 10 valem 0, 2 ou 4; zonas I 0-7, II 8-15, III 16-19, IV 20-40.
// Retirada: classificacao por dominio do painel (Elevado/Moderado/Baixo por cortes 8 e 4), sem fonte. Mantidas as 4 zonas da OMS.
// Referencia brasileira: Lima et al. (2005, n=166, CIDI): corte 7/8, sensibilidade 100%, especificidade 76% (diagnostico CID-10 de transtornos pelo alcool).
// d.respostas: chaves 1..10, valores = pontos do item (igual ao registro antigo).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Com que frequ\u00eancia voc\u00ea consome bebidas alco\u00f3licas?",grupo:"freq"},
{texto:"Quantas doses de \u00e1lcool voc\u00ea consome em um dia t\u00edpico quando est\u00e1 bebendo?",grupo:"doses"},
{texto:"Com que frequ\u00eancia voc\u00ea consome 6 ou mais doses em uma \u00fanica ocasi\u00e3o?",grupo:"binge"},
{texto:"Com que frequ\u00eancia, durante o \u00faltimo ano, voc\u00ea achou que n\u00e3o era capaz de parar de beber uma vez que havia come\u00e7ado?",grupo:"depend"},
{texto:"Com que frequ\u00eancia, durante o \u00faltimo ano, voc\u00ea deixou de fazer algo que era esperado de voc\u00ea por causa do \u00e1lcool?",grupo:"depend"},
{texto:"Com que frequ\u00eancia, durante o \u00faltimo ano, voc\u00ea precisou de uma primeira dose pela manh\u00e3 para se sentir melhor depois de ter bebido muito?",grupo:"depend"},
{texto:"Com que frequ\u00eancia, durante o \u00faltimo ano, voc\u00ea se sentiu culpado(a) ou com remorso depois de ter bebido?",grupo:"depend"},
{texto:"Com que frequ\u00eancia, durante o \u00faltimo ano, voc\u00ea foi incapaz de lembrar o que aconteceu na noite anterior por causa do \u00e1lcool?",grupo:"depend"},
{texto:"Voc\u00ea ou outra pessoa j\u00e1 se machucou por causa do seu uso de \u00e1lcool?",grupo:"dano"},
{texto:"Algum parente, amigo, m\u00e9dico ou outro profissional de sa\u00fade j\u00e1 se preocupou com seu consumo de \u00e1lcool ou sugeriu que voc\u00ea diminuisse?",grupo:"dano"}
];

var OPCOES_GRUPO={
freq:[{valor:0,texto:"Nunca"},{valor:1,texto:"Mensalmente ou menos"},{valor:2,texto:"2-4 vezes/m\u00eas"},{valor:3,texto:"2-3 vezes/semana"},{valor:4,texto:"4 ou mais vezes/semana"}],
doses:[{valor:0,texto:"1-2"},{valor:1,texto:"3-4"},{valor:2,texto:"5-6"},{valor:3,texto:"7-9"},{valor:4,texto:"10 ou mais"}],
binge:[{valor:0,texto:"Nunca"},{valor:1,texto:"Menos que mensalmente"},{valor:2,texto:"Mensalmente"},{valor:3,texto:"Semanalmente"},{valor:4,texto:"Todos os dias ou quase"}],
depend:[{valor:0,texto:"Nunca"},{valor:1,texto:"Menos que mensalmente"},{valor:2,texto:"Mensalmente"},{valor:3,texto:"Semanalmente"},{valor:4,texto:"Todos os dias ou quase"}],
dano:[{valor:0,texto:"N\u00e3o"},{valor:2,texto:"Sim, mas n\u00e3o no \u00faltimo ano"},{valor:4,texto:"Sim, no \u00faltimo ano"}]
};

var ZONAS = [
    {de: 0, ate: 8, nome: 'Baixo risco (Zona I)', rot: '0 a 7', cor: '#78909c', fundo: '#eceff1', cortexto: '#37474f', txt: 'A pontua\u00e7\u00e3o est\u00e1 na faixa de menor risco (Zona I do manual da OMS).'},
    {de: 8, ate: 16, nome: 'Uso de risco (Zona II)', rot: '8 a 15', cor: '#f9a825', fundo: '#fff8e1', cortexto: '#8a5a00', txt: 'A pontua\u00e7\u00e3o est\u00e1 na faixa de uso de risco (Zona II): o padr\u00e3o de consumo relatado aumenta a chance de problemas.'},
    {de: 16, ate: 20, nome: 'Uso nocivo (Zona III)', rot: '16 a 19', cor: '#ef6c00', fundo: '#ffe0b2', cortexto: '#bf5600', txt: 'A pontua\u00e7\u00e3o est\u00e1 na faixa de uso nocivo (Zona III): h\u00e1 ind\u00edcios de que o consumo j\u00e1 causa ou pode estar causando preju\u00edzos.'},
    {de: 20, ate: 41, nome: 'Prov\u00e1vel depend\u00eancia (Zona IV)', rot: '20 a 40', cor: '#bf360c', fundo: '#ffccbc', cortexto: '#8d2a0a', txt: 'A pontua\u00e7\u00e3o est\u00e1 na faixa mais alta (Zona IV), em que o manual da OMS aponta a possibilidade de depend\u00eancia.'}
];
var DOM = [
    {k: 'Consumo', nome: 'Consumo (itens 1 a 3)', idx: [0, 1, 2], max: 12, desc: 'Quanto e com que frequ\u00eancia a pessoa bebe.'},
    {k: 'Dependencia', nome: 'Depend\u00eancia (itens 4 a 6)', idx: [3, 4, 5], max: 12, desc: 'Sinais de perda de controle sobre a bebida, no \u00faltimo ano.'},
    {k: 'Consequencias', nome: 'Consequ\u00eancias (itens 7 a 10)', idx: [6, 7, 8, 9], max: 16, desc: 'Culpa, esquecimentos, les\u00f5es e preocupa\u00e7\u00e3o de outras pessoas.'}
];
var CURTO = [
    'Frequ\u00eancia do consumo', 'Doses em um dia t\u00edpico', 'Seis ou mais doses numa ocasi\u00e3o', 'N\u00e3o conseguir parar de beber',
    'Deixar de fazer o que era esperado', 'Beber pela manh\u00e3 para se sentir melhor', 'Culpa ou remorso depois de beber', 'Esquecer o que aconteceu na noite anterior',
    'Les\u00e3o por causa do \u00e1lcool', 'Preocupa\u00e7\u00e3o de outras pessoas com o consumo'
];
var REFS = [
    'LIMA, C. T. et al. Concurrent and construct validity of the AUDIT in an urban Brazilian sample. Alcohol and Alcoholism, v. 40, n. 6, p. 584-589, 2005.',
    'MORETTI-PIRES, R. O.; CORRADI-WEBSTER, C. M. Adapta\u00e7\u00e3o e valida\u00e7\u00e3o do Alcohol Use Disorder Identification Test (AUDIT) para popula\u00e7\u00e3o ribeirinha do interior da Amaz\u00f4nia, Brasil. Cadernos de Sa\u00fade P\u00fablica, v. 27, n. 3, 2011.',
    'BABOR, T. F. et al. AUDIT: the Alcohol Use Disorders Identification Test: guidelines for use in primary care. 2nd ed. Geneva: World Health Organization, 2001.',
    'SAUNDERS, J. B. et al. Development of the Alcohol Use Disorders Identification Test (AUDIT): WHO collaborative project on early detection of persons with harmful alcohol consumption - II. Addiction, v. 88, n. 6, p. 791-804, 1993.'
];
var AVISO = 'O AUDIT, criado pela OMS, rastreia o consumo de \u00e1lcool que traz risco ou preju\u00edzo; n\u00e3o \u00e9 diagn\u00f3stico de transtorno por uso de \u00e1lcool nem de depend\u00eancia, depende do relato da pr\u00f3pria pessoa e n\u00e3o avalia outras subst\u00e2ncias. As zonas s\u00e3o faixas de pontua\u00e7\u00e3o do manual da OMS (Babor et al., 2001). O corte 7/8 do estudo brasileiro (Lima et al., 2005) vem de 166 pessoas de uma operadora de sa\u00fade de uma cidade e vale como refer\u00eancia. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, em entrevista cl\u00ednica.';

function validos(ix) { return OPCOES_GRUPO[ITENS[ix].grupo].map(function (o) { return o.valor; }); }
function textoOpcao(ix, valor) { var o = OPCOES_GRUPO[ITENS[ix].grupo], k; for (k = 0; k < o.length; k++) { if (o[k].valor === valor) return o[k].texto; } return ''; }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('AUDIT: respostas incompletas');
    var r = {v: [], total: 0, dom: []}, i, d;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (validos(i).indexOf(x) < 0) throw new Error('AUDIT: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x;
    }
    for (d = 0; d < DOM.length; d++) { var s = 0; DOM[d].idx.forEach(function (q) { s += r.v[q]; }); r.dom.push(s); }
    r.zona = r.total <= 7 ? 0 : (r.total <= 15 ? 1 : (r.total <= 19 ? 2 : 3));
    r.maximos = [];
    for (i = 0; i < r.v.length; i++) { if (r.v[i] === 4) r.maximos.push(i); }
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return ZONAS[r.zona].nome; }
function dadosPainel(r) {
    var o = {};
    DOM.forEach(function (d, ix) { o[d.k] = {pontuacao: r.dom[ix], max: d.max, classificacao: r.dom[ix] + ' de ' + d.max + ' pontos'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function blocks(r) {
    var z = ZONAS[r.zona], b = [], i;
    b.push({t: 'hero', fundo: z.fundo, borda: z.cor, cor: z.cortexto, titulo: 'Escore ' + r.total + ' de 40 pontos', sub: z.nome + ' - faixa de ' + z.rot + ' pontos'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de 0 a 40 pontos', cor: z.cor},
        {rot: 'CONSUMO', valor: r.dom[0] + ' / 12', de: 'itens 1 a 3', cor: '#1b5e20'},
        {rot: 'DEPEND\u00caNCIA', valor: r.dom[1] + ' / 12', de: 'itens 4 a 6', cor: '#00796b'},
        {rot: 'CONSEQU\u00caNCIAS', valor: r.dom[2] + ' / 16', de: 'itens 7 a 10', cor: '#455a64'}
    ]});
    b.push({t: 'faixas', titulo: 'Zonas de pontua\u00e7\u00e3o (manual da OMS)', min: 0, max: 41, pino: r.total + 0.5, ativo: r.zona, faixas: ZONAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que o AUDIT mede', x: 'Foi criado pela OMS para identificar padr\u00f5es de consumo de \u00e1lcool que trazem risco, que j\u00e1 causam preju\u00edzo ou que sugerem depend\u00eancia. Os tr\u00eas primeiros itens falam de quanto e com que frequ\u00eancia a pessoa bebe; a maioria dos demais fala do \u00faltimo ano.'},
        {t: 'Como interpretar', x: 'Os itens 1 a 8 valem de 0 a 4 pontos e os itens 9 e 10 valem 0, 2 ou 4. A soma vai de 0 a 40 e cai em uma das quatro zonas do manual da OMS: I (0 a 7), II (8 a 15), III (16 a 19) e IV (20 a 40). A zona \u00e9 uma faixa de pontua\u00e7\u00e3o, e n\u00e3o um diagn\u00f3stico. ' + z.txt},
        {t: 'Sobre o corte de rastreio', x: 'Num estudo brasileiro com 166 pessoas (Lima et al., 2005), o corte 7/8 identificou transtornos pelo \u00e1lcool segundo a CID-10, com sensibilidade de 100% e especificidade de 76%; \u00e9 o mesmo corte de estudos anteriores em aten\u00e7\u00e3o prim\u00e1ria. Vale como refer\u00eancia de uma amostra, n\u00e3o como norma.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de transtorno por uso de \u00e1lcool nem de depend\u00eancia. Depende de a pessoa relatar com franqueza e n\u00e3o avalia o uso de outras subst\u00e2ncias. N\u00e3o substitui a entrevista cl\u00ednica.'}
    ]});
    b.push({t: 'barras', titulo: 'Os tr\u00eas dom\u00ednios', nota: 'Cada barra vai de 0 ao m\u00e1ximo do dom\u00ednio.', itens: DOM.map(function (d, ix) {
        return {rot: d.nome, txt: r.dom[ix] + ' de ' + d.max + ' pontos. ' + d.desc, pct: r.dom[ix] / d.max * 100, cor: ['#1b5e20', '#00796b', '#455a64'][ix]};
    })});
    b.push({t: 'barras', titulo: 'Cada pergunta (0 a 4 pontos)', nota: 'Quanto maior a barra, maior a pontua\u00e7\u00e3o do item.', itens: ITENS.map(function (it, ix) {
        var p = r.v[ix];
        return {rot: 'Item ' + (ix + 1) + ' - ' + CURTO[ix], txt: '"' + textoOpcao(ix, p) + '" = ' + p + ' pt', pct: p / 4 * 100, cor: p >= 4 ? '#bf360c' : (p === 3 ? '#ef6c00' : (p === 2 ? '#f9a825' : '#90a4ae'))};
    })});
    var max4 = r.maximos.length ? r.maximos.map(function (q) { return 'item ' + (q + 1) + ' (' + CURTO[q].toLowerCase() + ')'; }).join('; ') + '. \u00c9 apenas a descri\u00e7\u00e3o das respostas dadas, sem leitura cl\u00ednica por si s\u00f3.' : 'Nenhum item atingiu a pontua\u00e7\u00e3o m\u00e1xima.';
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Com as respostas desta pessoa: ' + r.v.join(' + ') + ' = ' + r.total + ' pontos, de um m\u00e1ximo de 40. Consumo (itens 1 a 3) = ' + r.dom[0] + '; depend\u00eancia (itens 4 a 6) = ' + r.dom[1] + '; consequ\u00eancias (itens 7 a 10) = ' + r.dom[2] + '.'},
        {t: 'Itens com pontua\u00e7\u00e3o m\u00e1xima (4 pontos)', x: max4}
    ]});
    var linhas = ITENS.map(function (it, ix) {
        var dn = ix < 3 ? 'Consumo' : (ix < 6 ? 'Depend\u00eancia' : 'Consequ\u00eancias');
        return {c: [String(ix + 1), dn, it.texto, textoOpcao(ix, r.v[ix]), String(r.v[ix])]};
    });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 100, cols: [{h: '#', w: 6, al: 'c'}, {h: 'Dom\u00ednio', w: 22, al: 'c'}, {h: 'Pergunta', w: 90, al: 'l'}, {h: 'Resposta', w: 44, al: 'c'}, {h: 'Pontos', w: 18, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (validos(i - 1).indexOf(x) < 0) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'audit', nome: 'AUDIT', cor: '#1b5e20', cor2: '#455a64', escalaPainel: ['AUDIT'],
    sub1: 'Alcohol Use Disorders Identification Test - 10 itens, desenvolvido pela Organiza\u00e7\u00e3o Mundial da Sa\u00fade',
    sub2: 'Babor et al. (2001) | valida\u00e7\u00e3o brasileira: Lima et al. (2005); Moretti-Pires e Corradi-Webster (2011)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_AUDIT = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES_GRUPO: OPCOES_GRUPO, ZONAS: ZONAS};

})();
