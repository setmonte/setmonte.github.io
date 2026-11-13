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

// teaah-visual.js - TEA-AH, roteiro proprio de observacao (29 itens, 6 areas, 1-5). INSTRUMENTO EXPERIMENTAL: sem fonte publicada, sem validacao.
// REMOVIDO: pontuacao total, media geral e classificacao (Baixa/Media/Alta/Muito Alta): as areas misturam itens de direcoes opostas
// (ex.: "Entende piadas" e "Prefere brincar sozinha"), entao somas e medias nao medem nada. O relatorio so reflete as respostas:
// quais observacoes foram marcadas como Frequentemente (4) ou Sempre (5), por area. A planilha original (0-3) tinha "Provavel TEA / Provavel AH" por corte arbitrario.
// d.respostas: chaves 1..29 com 1-5. versaoEscala:2.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var AREAS = [{"nome":"Processamento Sensorial","ini":0,"n":5},{"nome":"Comunica\u00e7\u00e3o e Linguagem","ini":5,"n":5},{"nome":"Intera\u00e7\u00e3o Social","ini":10,"n":5},{"nome":"Cogni\u00e7\u00e3o e Interesses","ini":15,"n":5},{"nome":"Regula\u00e7\u00e3o Emocional","ini":20,"n":5},{"nome":"Desempenho Global","ini":25,"n":4}];
var ITENS = [{"area":"Processamento Sensorial","n":1,"texto":"Demonstra inc\u00f4modo com etiquetas, tecidos ou sapatos"},{"area":"Processamento Sensorial","n":2,"texto":"Reage de forma intensa a sons (barulho, vozes, aspirador, m\u00fasica alta)"},{"area":"Processamento Sensorial","n":3,"texto":"Evita lugares com muitas pessoas ou muito est\u00edmulo visual"},{"area":"Processamento Sensorial","n":4,"texto":"\u00c9 muito seletiva com alimentos por textura, cor ou cheiro"},{"area":"Processamento Sensorial","n":5,"texto":"Procura movimentos repetitivos (balan\u00e7ar, girar, pular)"},{"area":"Comunica\u00e7\u00e3o e Linguagem","n":1,"texto":"Usou frases completas cedo (antes dos 2 anos e meio)"},{"area":"Comunica\u00e7\u00e3o e Linguagem","n":2,"texto":"Usa linguagem literal (entende tudo ao p\u00e9 da letra)"},{"area":"Comunica\u00e7\u00e3o e Linguagem","n":3,"texto":"Fala de seus interesses de forma intensa e repetitiva"},{"area":"Comunica\u00e7\u00e3o e Linguagem","n":4,"texto":"Entende piadas, met\u00e1foras ou ironias"},{"area":"Comunica\u00e7\u00e3o e Linguagem","n":5,"texto":"Corrige adultos ou se frustra quando algo \u00e9 'injusto' ou 'errado'"},{"area":"Intera\u00e7\u00e3o Social","n":1,"texto":"Prefere brincar sozinha"},{"area":"Intera\u00e7\u00e3o Social","n":2,"texto":"Se aproxima de outras crian\u00e7as com facilidade"},{"area":"Intera\u00e7\u00e3o Social","n":3,"texto":"Demonstra empatia (percebe quando algu\u00e9m est\u00e1 triste ou bravo)"},{"area":"Intera\u00e7\u00e3o Social","n":4,"texto":"Tem amigos ou v\u00ednculos sociais est\u00e1veis"},{"area":"Intera\u00e7\u00e3o Social","n":5,"texto":"Se desregula em ambientes sociais (escola, festas, recreio)"},{"area":"Cogni\u00e7\u00e3o e Interesses","n":1,"texto":"Aprende r\u00e1pido e faz perguntas complexas para a idade"},{"area":"Cogni\u00e7\u00e3o e Interesses","n":2,"texto":"Se interessa intensamente por um tema espec\u00edfico"},{"area":"Cogni\u00e7\u00e3o e Interesses","n":3,"texto":"Demonstra criatividade ou ideias originais"},{"area":"Cogni\u00e7\u00e3o e Interesses","n":4,"texto":"Se irrita quando erra ou quando algo \u00e9 'f\u00e1cil demais'"},{"area":"Cogni\u00e7\u00e3o e Interesses","n":5,"texto":"Transfere o que aprende para novas situa\u00e7\u00f5es"},{"area":"Regula\u00e7\u00e3o Emocional","n":1,"texto":"Se desorganiza quando h\u00e1 mudan\u00e7as inesperadas"},{"area":"Regula\u00e7\u00e3o Emocional","n":2,"texto":"Chora ou se isola ap\u00f3s frustra\u00e7\u00f5es"},{"area":"Regula\u00e7\u00e3o Emocional","n":3,"texto":"Consegue nomear o que sente"},{"area":"Regula\u00e7\u00e3o Emocional","n":4,"texto":"Mostra necessidade de rotina e previsibilidade"},{"area":"Regula\u00e7\u00e3o Emocional","n":5,"texto":"Reage mal \u00e0 cr\u00edtica ou quando \u00e9 contrariado"},{"area":"Desempenho Global","n":1,"texto":"Demonstra curiosidade intensa e pensamento avan\u00e7ado"},{"area":"Desempenho Global","n":2,"texto":"Mostra sensibilidade emocional e/ou art\u00edstica elevada"},{"area":"Desempenho Global","n":3,"texto":"Apresenta descompasso entre desempenho intelectual e social"},{"area":"Desempenho Global","n":4,"texto":"Mostra habilidades not\u00e1veis em uma \u00e1rea e dificuldades em outra"}];
var OPCOES = [{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"\u00c0s vezes"},{valor:4,texto:"Frequentemente"},{valor:5,texto:"Sempre"}];

var COR = '#4a148c';
var AVISO = 'O TEA-AH \u00e9 um roteiro de observa\u00e7\u00e3o elaborado pelo profissional, sem fonte publicada e sem estudo de validade. Por isso este relat\u00f3rio n\u00e3o soma pontos, n\u00e3o compara com normas e n\u00e3o classifica: ele apenas organiza o que foi marcado como frequente ou sempre em cada \u00e1rea. As \u00e1reas misturam observa\u00e7\u00f5es de naturezas diferentes (dificuldades e potencialidades), e um mesmo comportamento pode aparecer no Transtorno do Espectro Autista, nas Altas Habilidades/Superdota\u00e7\u00e3o ou em ambos (dupla excepcionalidade) ou em nenhum deles. N\u00e3o \u00e9 diagn\u00f3stico: o resultado deve ser interpretado por profissional qualificado, junto com a entrevista, a observa\u00e7\u00e3o direta e instrumentos validados.';

function calcular(resp, ctx) {
    if (!resp) throw new Error('TEA-AH: respostas incompletas');
    var r = {v: {}, a: [], ctx: ctx || {}, freq: 0}, i;
    for (i = 1; i <= ITENS.length; i++) {
        var x = parseInt(resp[i], 10);
        if (!(x >= 1 && x <= 5)) throw new Error('TEA-AH: resposta invalida no item ' + i);
        r.v[i] = x;
    }
    AREAS.forEach(function (a) {
        var f = [], j;
        for (j = 1; j <= a.n; j++) { var g = a.ini + j; if (r.v[g] >= 4) f.push(g); }
        r.a.push({nome: a.nome, ini: a.ini, n: a.n, freq: f});
        r.freq += f.length;
    });
    return r;
}
function escore(r) { return r.freq; }
function classifGeral(r) { return r.freq + ' de ' + ITENS.length + ' observa\u00e7\u00f5es marcadas como frequentes ou sempre (sem pontua\u00e7\u00e3o total nem classifica\u00e7\u00e3o)'; }
function dadosPainel(r) {
    var o = {};
    r.a.forEach(function (a) { o[a.nome] = {pontuacao: a.freq.length, max: a.n, classificacao: a.freq.length + ' de ' + a.n + ' observa\u00e7\u00f5es frequentes/sempre'}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 1; i <= ITENS.length; i++) o[i] = r.v[i]; return o; }
function blocks(r) {
    var b = [], c = r.ctx || {};
    b.push({t: 'hero', fundo: '#f3e5f5', borda: COR, cor: '#311b92', titulo: r.freq + ' de ' + ITENS.length + ' observa\u00e7\u00f5es marcadas como frequentes ou sempre', sub: 'Roteiro experimental de observa\u00e7\u00e3o: o relat\u00f3rio organiza as respostas por \u00e1rea, sem pontua\u00e7\u00e3o total, sem pontos de corte e sem classifica\u00e7\u00e3o.'});
    b.push({t: 'cards', itens: r.a.map(function (a) { return {rot: a.nome.toUpperCase().replace('COMUNICA\u00c7\u00c3O E LINGUAGEM', 'COMUNICA\u00c7\u00c3O').replace('PROCESSAMENTO SENSORIAL', 'SENSORIAL').replace('COGNI\u00c7\u00c3O E INTERESSES', 'COGNI\u00c7\u00c3O').replace('REGULA\u00c7\u00c3O EMOCIONAL', 'EMOCIONAL').replace('DESEMPENHO GLOBAL', 'GLOBAL').replace('INTERA\u00c7\u00c3O SOCIAL', 'SOCIAL'), valor: a.freq.length + ' / ' + a.n, de: 'frequentes ou sempre', cor: COR}; })});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: [
        {t: 'O que \u00e9 este roteiro', x: 'Uma lista de 29 observa\u00e7\u00f5es sobre a crian\u00e7a, em seis \u00e1reas, que o respondente marca de "nunca" a "sempre". Ele re\u00fane comportamentos que costumam ser discutidos tanto em rela\u00e7\u00e3o ao Transtorno do Espectro Autista quanto \u00e0s Altas Habilidades/Superdota\u00e7\u00e3o.'},
        {t: 'Por que n\u00e3o h\u00e1 pontua\u00e7\u00e3o nem classifica\u00e7\u00e3o', x: 'As observa\u00e7\u00f5es de cada \u00e1rea apontam para dire\u00e7\u00f5es diferentes: algumas descrevem dificuldades (por exemplo, "Prefere brincar sozinha") e outras descrevem potencialidades ou comportamentos esperados (por exemplo, "Entende piadas"). Somar ou tirar a m\u00e9dia misturaria tudo e n\u00e3o teria significado. Tamb\u00e9m n\u00e3o existem estudos que definam pontos de corte.'},
        {t: 'Como usar', x: 'Leia as observa\u00e7\u00f5es marcadas como frequentes ou sempre em cada \u00e1rea e as demais respostas na tabela, e use-as como ponto de partida para a entrevista e a observa\u00e7\u00e3o cl\u00ednica.'}
    ].concat(c.respondente ? [{t: 'Quem respondeu', x: c.respondente}] : [])});
    b.push({t: 'textos', titulo: 'Observa\u00e7\u00f5es marcadas como frequentes ou sempre', itens: r.a.map(function (a) {
        return {t: a.nome + ' - ' + a.freq.length + ' de ' + a.n, x: a.freq.length ? a.freq.map(function (g) { return ITENS[g - 1].texto.replace(/\.$/, '') + ' (' + OPCOES[r.v[g] - 1].texto.toLowerCase() + ')'; }).join('; ') + '.' : 'Nenhuma observa\u00e7\u00e3o desta \u00e1rea foi marcada como frequente ou sempre.'};
    })});
    var linhas = ITENS.map(function (it, i) { var n = i + 1; return {c: [it.area.replace('Comunica\u00e7\u00e3o e Linguagem', 'Comunica\u00e7\u00e3o').replace('Processamento Sensorial', 'Sensorial').replace('Cogni\u00e7\u00e3o e Interesses', 'Cogni\u00e7\u00e3o').replace('Regula\u00e7\u00e3o Emocional', 'Emocional').replace('Desempenho Global', 'Global').replace('Intera\u00e7\u00e3o Social', 'Social'), String(it.n), it.texto, OPCOES[r.v[n] - 1].texto]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '\u00c1rea', w: 26, al: 'l'}, {h: '#', w: 8, al: 'c'}, {h: 'Observa\u00e7\u00e3o', w: 114, al: 'l'}, {h: 'Resposta', w: 32, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    try {
        if (d.versaoEscala !== 2) return null;
        return calcular(d.respostas, {respondente: d.respondente || ''});
    } catch (e) { return null; }
}
var base = symMake({
    id: 'teaah', nome: 'TEA-AH', cor: COR, cor2: '#311b92', escalaPainel: ['TEA-AH'],
    sub1: 'Roteiro de observa\u00e7\u00e3o de sinais associados a TEA e a Altas Habilidades (instrumento experimental) - 29 itens',
    sub2: 'Elaborado pelo profissional; sem fonte publicada e sem valida\u00e7\u00e3o',
    dadosExtra: function (r) { return r.ctx && r.ctx.respondente ? ['Respondente: ' + r.ctx.respondente] : []; },
    blocks: blocks, refs: [], fromPainel: fromPainel
});
window.SYM_TEAAH = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, AREAS: AREAS, OPCOES: OPCOES};

})();
