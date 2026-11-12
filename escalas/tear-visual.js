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

// tear-visual.js - TEA-R (Escala de Rastreio de Tracos do Espectro Autista), 48 itens, 8 subdominios, respondida por pais/professores.
// Tela e PDF gerados pelos MESMOS blocos (nucleo comum). Instrumento "em desenvolvimento", sem validacao empirica formal.
// VERSAO 2 (11/11/2026, decisao do autor): 6 opcoes de resposta: "Nao se aplica" e "Nao observei" (fora do calculo) e 0 "Nao tem o
// comportamento", 1 "As vezes", 2 "Quase sempre", 3 "Sempre". Pontuacao 0-3; itens invertidos = 3 - valor. Regra de leitura unica, ancorada no
// DSM-5-TR, para todas as idades: percentual do subdominio (soma / (respondidos x 3)) >= 66 = "Criterio presente"; 33 a 65 = "Traco de
// comportamento"; < 33 = "Sem indicativo"; "Dados insuficientes" se respondidos < 4. Convergencia: A = 3 de 3 subdominios com criterio presente
// e B >= 2 de 4 (alta); parcial: (A 3 e B 1) ou (A 2 e B >= 2). Os cortes 33/66 sao regra de leitura, sem estudo de sensibilidade/especificidade.
// REGISTROS ANTIGOS (sem d.versaoEscala = 2): so tinham 1-3 e cortes por faixa etaria (6-8 / 9-12); sao recalculados do jeito antigo, com nota.
// d.respostas: chaves 1..48, valores "NA","NO","0","1","2","3" (ou null); d.faixaEtaria guardada.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS = [
{texto:"Quando algu\u00e9m est\u00e1 triste ou chorando perto dela, reage de alguma forma (se aproxima, pergunta, chama um adulto).",subdominio:"A1",invertido:false},
{texto:"Inicia espontaneamente uma conversa ou brincadeira com outras pessoas, sem esperar ser chamada.",subdominio:"A1",invertido:false},
{texto:"Compartilha objetos, descobertas ou conquistas com outras pessoas por iniciativa pr\u00f3pria.",subdominio:"A1",invertido:false},
{texto:"Demonstra alegria vis\u00edvel e cont\u00e1gio emocional positivo ao interagir com outras pessoas.",subdominio:"A1",invertido:false},
{texto:"Percebe quando est\u00e1 incomodando ou interrompendo uma conversa/brincadeira em andamento.",subdominio:"A1",invertido:false},
{texto:"Corresponde a cumprimentos, sorrisos ou gestos sociais iniciados por outras pessoas.",subdominio:"A1",invertido:false},
{texto:"Olha para o rosto de quem est\u00e1 falando com ela durante a conversa.",subdominio:"A2",invertido:false},
{texto:"Usa gestos (apontar, acenar, balan\u00e7ar a cabe\u00e7a) para se comunicar, al\u00e9m da fala.",subdominio:"A2",invertido:false},
{texto:"A express\u00e3o facial combina com o que est\u00e1 sentindo ou dizendo no momento.",subdominio:"A2",invertido:false},
{texto:"Percebe o humor de outra pessoa (bom ou mau) s\u00f3 pela express\u00e3o do rosto ou tom de voz, sem que digam.",subdominio:"A2",invertido:false},
{texto:"Demonstra entendimento de piadas, ironia ou brincadeiras verbais feitas por outras pessoas.",subdominio:"A2",invertido:false},
{texto:"Ajusta o volume ou o jeito de falar dependendo de quem est\u00e1 ouvindo.",subdominio:"A2",invertido:false},
{texto:"Demonstra interesse em participar de brincadeiras ou atividades em grupo.",subdominio:"A3",invertido:false},
{texto:"Consegue manter uma amizade ou v\u00ednculo de forma est\u00e1vel ao longo do tempo.",subdominio:"A3",invertido:false},
{texto:"Se ajusta \u00e0s regras de uma brincadeira mesmo quando n\u00e3o foi ela quem as prop\u00f4s.",subdominio:"A3",invertido:false},
{texto:"Se adapta com facilidade a novos grupos ou colegas, mesmo em situa\u00e7\u00f5es pouco familiares.",subdominio:"A3",invertido:false},
{texto:"Percebe quando n\u00e3o est\u00e1 sendo bem recebida em um grupo e ajusta seu comportamento.",subdominio:"A3",invertido:false},
{texto:"Demonstra alegria vis\u00edvel ao encontrar ou reencontrar um amigo/colega.",subdominio:"A3",invertido:false},
{texto:"Faz movimentos repetitivos com as m\u00e3os, dedos ou corpo (balan\u00e7ar, girar, bater palmas) sem prop\u00f3sito aparente.",subdominio:"B1",invertido:false},
{texto:"Repete palavras, frases ou sons de forma repetitiva, fora do contexto da conversa.",subdominio:"B1",invertido:false},
{texto:"Anda na ponta dos p\u00e9s ou apresenta outros padr\u00f5es motores incomuns ao se locomover.",subdominio:"B1",invertido:false},
{texto:"Alinha, organiza ou enfileira objetos de forma repetitiva.",subdominio:"B1",invertido:false},
{texto:"Repete a mesma pergunta v\u00e1rias vezes mesmo j\u00e1 sabendo a resposta.",subdominio:"B1",invertido:false},
{texto:"Balan\u00e7a o corpo, bate os p\u00e9s ou se mexe repetidamente quando concentrada ou ansiosa.",subdominio:"B1",invertido:false},
{texto:"Fica visivelmente incomodada quando uma rotina ou plano muda sem aviso pr\u00e9vio.",subdominio:"B2",invertido:false},
{texto:"Insiste em seguir sempre o mesmo caminho, sequ\u00eancia ou ordem para realizar tarefas do dia a dia.",subdominio:"B2",invertido:false},
{texto:"Reage com choro, irrita\u00e7\u00e3o ou resist\u00eancia forte diante de mudan\u00e7as pequenas e inesperadas.",subdominio:"B2",invertido:false},
{texto:"Lida bem com mudan\u00e7as inesperadas na rotina, sem grande desconforto aparente.",subdominio:"B2",invertido:true},
{texto:"Precisa que objetos ou pertences estejam sempre no mesmo lugar ou organizados de um jeito espec\u00edfico.",subdominio:"B2",invertido:false},
{texto:"Demonstra desconforto quando uma atividade \u00e9 interrompida antes do esperado.",subdominio:"B2",invertido:false},
{texto:"Tem um assunto ou tema favorito sobre o qual fala com frequ\u00eancia, mesmo quando o outro n\u00e3o demonstra interesse.",subdominio:"B3",invertido:false},
{texto:"Prefere repetir a mesma atividade espec\u00edfica em vez de experimentar coisas novas.",subdominio:"B3",invertido:false},
{texto:"Sabe uma quantidade incomum de detalhes sobre um assunto espec\u00edfico de seu interesse.",subdominio:"B3",invertido:false},
{texto:"Demonstra forte resist\u00eancia a interromper uma atividade de seu interesse espec\u00edfico.",subdominio:"B3",invertido:false},
{texto:"Alterna com facilidade entre diferentes brincadeiras, temas e atividades ao longo do dia.",subdominio:"B3",invertido:true},
{texto:"Coleciona, organiza ou categoriza itens relacionados a um interesse espec\u00edfico.",subdominio:"B3",invertido:false},
{texto:"Tampa os ouvidos ou se incomoda visivelmente com determinados sons do ambiente.",subdominio:"B4",invertido:false},
{texto:"Evita ou recusa determinadas texturas de roupa, tecido, alimento ou material.",subdominio:"B4",invertido:false},
{texto:"Busca ativamente est\u00edmulos sensoriais espec\u00edficos (girar, balan\u00e7ar o corpo, tocar texturas repetidamente).",subdominio:"B4",invertido:false},
{texto:"Permanece tranquila mesmo em ambientes barulhentos, muito iluminados ou com muitos est\u00edmulos sensoriais.",subdominio:"B4",invertido:true},
{texto:"Reage de forma intensa a luzes fortes, cheiros ou toques inesperados.",subdominio:"B4",invertido:false},
{texto:"Parece n\u00e3o perceber dor, frio ou calor na mesma intensidade que outras crian\u00e7as da idade.",subdominio:"B4",invertido:false},
{texto:"Prefere seguir regras e instru\u00e7\u00f5es exatamente como foram dadas, mesmo quando outras crian\u00e7as adaptam.",subdominio:"BAP",invertido:false},
{texto:"Corrige outras pessoas quando percebe uma informa\u00e7\u00e3o incorreta, mesmo em situa\u00e7\u00f5es informais.",subdominio:"BAP",invertido:false},
{texto:"Usa um vocabul\u00e1rio ou forma de falar considerada formal demais para a idade.",subdominio:"BAP",invertido:false},
{texto:"Consegue adaptar a forma de contar uma hist\u00f3ria ou explicar algo dependendo de quem est\u00e1 ouvindo.",subdominio:"BAP",invertido:true},
{texto:"Prefere jogos ou brincadeiras com regras claras e previs\u00edveis a brincadeiras livres e improvisadas.",subdominio:"BAP",invertido:false},
{texto:"Demonstra desconforto percept\u00edvel quando um combinado muda sem aviso pr\u00e9vio.",subdominio:"BAP",invertido:false}
];

var CORTES = {
    "A1":{"6-8":{leve:38,sig:55},"9-12":{leve:30,sig:48}},
    "A2":{"6-8":{leve:38,sig:55},"9-12":{leve:30,sig:48}},
    "A3":{"6-8":{leve:42,sig:58},"9-12":{leve:28,sig:45}},
    "B1":{"6-8":{leve:40,sig:55},"9-12":{leve:25,sig:42}},
    "B2":{"6-8":{leve:45,sig:60},"9-12":{leve:30,sig:50}},
    "B3":{"6-8":{leve:45,sig:60},"9-12":{leve:30,sig:50}},
    "B4":{"6-8":{leve:40,sig:55},"9-12":{leve:32,sig:50}},
    "BAP":{"6-8":{leve:42,sig:58},"9-12":{leve:30,sig:48}}
};

var SUBDOMINIOS_INFO = {
    "A1":{nome:"A1 \u2014 Reciprocidade Socioemocional",bloco:"A",cor:"#1565c0"},
    "A2":{nome:"A2 \u2014 Comunica\u00e7\u00e3o N\u00e3o Verbal",bloco:"A",cor:"#1976d2"},
    "A3":{nome:"A3 \u2014 Relacionamentos e Brincadeira",bloco:"A",cor:"#1e88e5"},
    "B1":{nome:"B1 \u2014 Estereotipias Motoras/Verbais",bloco:"B",cor:"#00695c"},
    "B2":{nome:"B2 \u2014 Rigidez e Insis\u00eancia em Rotina",bloco:"B",cor:"#00796b"},
    "B3":{nome:"B3 \u2014 Interesses Fixos e Intensos",bloco:"B",cor:"#00897b"},
    "B4":{nome:"B4 \u2014 Reatividade Sensorial",bloco:"B",cor:"#26a69a"},
    "BAP":{nome:"BAP \u2014 Fen\u00f3tipo Ampliado",bloco:"BAP",cor:"#7b1fa2"}
};

var ORDEM = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4', 'BAP'];
var OPCOES = [
    {valor: 'NA', texto: 'N\u00e3o se aplica'},
    {valor: 'NO', texto: 'N\u00e3o observei'},
    {valor: '0', texto: 'N\u00e3o tem o comportamento'},
    {valor: '1', texto: '\u00c0s vezes'},
    {valor: '2', texto: 'Quase sempre'},
    {valor: '3', texto: 'Sempre'}
];
var ROT = {NA: 'N\u00e3o se aplica', NO: 'N\u00e3o observei', '0': 'N\u00e3o tem o comportamento', '1': '\u00c0s vezes', '2': 'Quase sempre', '3': 'Sempre'};
var CRIT = {traco: 33, criterio: 66};
var COR_CL = {'Crit\u00e9rio presente': '#e64a19', 'Tra\u00e7o de comportamento': '#f9a825', 'Tra\u00e7o significativo': '#e64a19', 'Tra\u00e7o leve': '#f9a825', 'Sem indicativo': '#607d8b', 'Dados insuficientes': '#b0bec5'};
var INTERP = {
    A1: 'Avalia a capacidade de iniciar e responder a intera\u00e7\u00f5es socioemocionais. Escores elevados indicam dificuldades em compartilhar emo\u00e7\u00f5es, responder a pistas sociais e iniciar contato espont\u00e2neo.',
    A2: 'Avalia o uso e a compreens\u00e3o de gestos, express\u00e3o facial e contato visual. Escores elevados indicam comunica\u00e7\u00e3o gestual reduzida e dificuldade em perceber sinais n\u00e3o verbais.',
    A3: 'Avalia o interesse e a capacidade de formar e manter relacionamentos. Escores elevados indicam dificuldades em adaptar o comportamento ao contexto social e manter v\u00ednculos est\u00e1veis.',
    B1: 'Avalia comportamentos motores ou verbais repetitivos. Escores elevados indicam movimentos repetitivos, ecolalia ou maneirismos motores.',
    B2: 'Avalia a rigidez comportamental e a necessidade de previsibilidade. Escores elevados indicam dificuldades acentuadas com mudan\u00e7as e forte depend\u00eancia de rotinas.',
    B3: 'Avalia a intensidade e a restri\u00e7\u00e3o dos interesses. Escores elevados indicam interesse restrito e intenso em poucos temas, com resist\u00eancia a diversificar atividades.',
    B4: 'Avalia hipo ou hipersensibilidade sensorial. Escores elevados indicam reatividade at\u00edpica a est\u00edmulos sensoriais (sons, texturas, luzes, dor).',
    BAP: 'Avalia caracter\u00edsticas subcl\u00ednicas relacionadas ao espectro autista. Pontua\u00e7\u00f5es elevadas podem indicar tra\u00e7os do fen\u00f3tipo ampliado, presentes em familiares ou como variante sem impacto funcional. N\u00e3o entra nos crit\u00e9rios A/B.'
};
var REFS = [
    'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.',
    'CONSTANTINO, J. N.; GRUBER, C. P. Social Responsiveness Scale, Second Edition (SRS-2). Torrance, CA: Western Psychological Services, 2012.',
    'RUTTER, M.; BAILEY, A.; LORD, C. The Social Communication Questionnaire (SCQ). Los Angeles: Western Psychological Services, 2003.',
    'Nota: o TEA-R \u00e9 um instrumento em desenvolvimento, sem valida\u00e7\u00e3o emp\u00edrica formal pr\u00f3pria. A regra de leitura (33% e 66%) foi definida pelo autor a partir da l\u00f3gica do DSM-5-TR.'
];
var AVISO = 'O TEA-R \u00e9 um instrumento de rastreio (triagem), e n\u00e3o um teste diagn\u00f3stico: pode indicar sinais de aten\u00e7\u00e3o, mas n\u00e3o confirma nem descarta o Transtorno do Espectro Autista. O diagn\u00f3stico exige avalia\u00e7\u00e3o cl\u00ednica presencial multiprofissional, com pelo menos dois informantes, entrevista de desenvolvimento e testes complementares. A regra de leitura (66% ou mais = crit\u00e9rio presente; 33% a 65% = tra\u00e7o de comportamento) foi definida pelo autor a partir da l\u00f3gica do DSM-5-TR e n\u00e3o vem de estudo de sensibilidade e especificidade com amostra cl\u00ednica. O perfil final deve combinar mais de um informante. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional.';

function faixaDe(anos) { return anos < 9 ? '6-8' : '9-12'; }
function valorPontuavel(x) { return !(x === null || x === undefined || x === 'NA' || x === 'NO'); }

function calcularSubdominios(resp, faixa, legacy) {
    var res = {}, maxItem = 3;
    ORDEM.forEach(function (sd) {
        var idxs = [], i;
        for (i = 0; i < ITENS.length; i++) { if (ITENS[i].subdominio === sd) idxs.push(i); }
        var soma = 0, resp_ = 0;
        idxs.forEach(function (ix) {
            var r = resp[ix];
            if (!valorPontuavel(r)) return;
            var val = parseInt(r, 10);
            if (ITENS[ix].invertido) val = (legacy ? 4 : 3) - val;
            soma += val; resp_++;
        });
        var total = idxs.length, insuf = resp_ < 4 && total >= 6, max = resp_ * maxItem;
        var pct = (max > 0) ? Math.round((soma / max) * 100) : 0, cl = 'Sem indicativo';
        if (insuf) cl = 'Dados insuficientes';
        else if (legacy) {
            var corte = CORTES[sd][legacy];
            if (pct >= corte.sig) cl = 'Tra\u00e7o significativo'; else if (pct >= corte.leve) cl = 'Tra\u00e7o leve';
        } else if (pct >= CRIT.criterio) cl = 'Crit\u00e9rio presente';
        else if (pct >= CRIT.traco) cl = 'Tra\u00e7o de comportamento';
        res[sd] = {pontuacao: soma, max: max, respondidos: resp_, total: total, pct: pct, classificacao: cl, insuf: insuf, media: resp_ > 0 ? parseFloat((soma / resp_).toFixed(2)) : 0};
    });
    return res;
}

// resp: 48 valores ("NA","NO","0","1","2","3" ou null); faixa: '6-8' ou '9-12' (so usada nos registros antigos); extra.legacy = true para registros antigos
function calcular(resp, faixa, extra) {
    extra = extra || {};
    if (!resp || resp.length !== ITENS.length) throw new Error('TEA-R: respostas incompletas');
    if (faixa !== '6-8' && faixa !== '9-12') throw new Error('TEA-R: faixa etaria invalida');
    var legacy = !!extra.legacy, validos_ = legacy ? ['1', '2', '3'] : ['0', '1', '2', '3'], i;
    for (i = 0; i < resp.length; i++) {
        var x = resp[i];
        if (x !== null && x !== 'NA' && x !== 'NO' && validos_.indexOf(String(x)) < 0) throw new Error('TEA-R: resposta invalida no item ' + (i + 1));
    }
    var r = {resp: resp.map(function (x) { return (x === null || x === 'NA' || x === 'NO') ? x : String(x); }), faixa: faixa, extra: extra, legacy: legacy};
    r.sds = calcularSubdominios(r.resp, faixa, legacy ? faixa : false);
    r.validos = 0;
    r.resp.forEach(function (x) { if (valorPontuavel(x)) r.validos++; });
    var SIG = legacy ? 'Tra\u00e7o significativo' : 'Crit\u00e9rio presente';
    r.contA = 0; r.contB = 0;
    ['A1', 'A2', 'A3'].forEach(function (s) { if (r.sds[s].classificacao === SIG) r.contA++; });
    ['B1', 'B2', 'B3', 'B4'].forEach(function (s) { if (r.sds[s].classificacao === SIG) r.contB++; });
    if (r.contA === 3 && r.contB >= 2) { r.classe = 'alta'; r.texto = 'Alta converg\u00eancia com crit\u00e9rios TEA (A: 3/3 | B: ' + r.contB + '/4)'; }
    else if ((r.contA === 3 && r.contB === 1) || (r.contA === 2 && r.contB >= 2)) { r.classe = 'parcial'; r.texto = 'Converg\u00eancia parcial \u2014 acompanhamento indicado (A: ' + r.contA + '/3 | B: ' + r.contB + '/4)'; }
    else { r.classe = 'sem'; r.texto = 'Sem converg\u00eancia diagn\u00f3stica (A: ' + r.contA + '/3 | B: ' + r.contB + '/4)'; }
    var soma = 0, n = 0;
    ORDEM.forEach(function (s) { if (!r.sds[s].insuf && r.sds[s].respondidos > 0) { soma += r.sds[s].pct; n++; } });
    r.pctGeral = n > 0 ? Math.round(soma / n) : 0;
    r.sempreLeve = legacy ? ORDEM.filter(function (s) { return CORTES[s][faixa].leve <= 33; }) : [];
    return r;
}
var NOMES_PAINEL = {A1: 'Crit. A1 - Reciprocidade Socioemocional', A2: 'Crit. A2 - Comunicacao Nao Verbal', A3: 'Crit. A3 - Relacionamentos e Brincadeira', B1: 'Crit. B1 - Estereotipias Motoras/Verbais', B2: 'Crit. B2 - Rigidez e Rotina', B3: 'Crit. B3 - Interesses Fixos e Intensos', B4: 'Crit. B4 - Reatividade Sensorial', BAP: 'Fenotipo Ampliado (BAP)'};
function dadosPainel(r) {
    var o = {};
    ORDEM.forEach(function (s) { var d = r.sds[s]; o[NOMES_PAINEL[s]] = {pontuacao: d.pontuacao, max: d.max, classificacao: d.classificacao, media: d.media}; });
    return o;
}
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.resp.length; i++) o[i + 1] = r.resp[i]; return o; }
function classifGeral(r) { return r.texto; }

var HERO = {
    alta: {fundo: '#ffe0b2', borda: '#fb8c00', cor: '#bf5600'},
    parcial: {fundo: '#fff8e1', borda: '#f9a825', cor: '#8a5a00'},
    sem: {fundo: '#eceff1', borda: '#607d8b', cor: '#37474f'}
};
function blocks(r) {
    var b = [], h = HERO[r.classe], ex = r.extra || {}, leg = r.legacy;
    b.push({t: 'hero', fundo: h.fundo, borda: h.borda, cor: h.cor, titulo: r.texto, sub: (leg ? 'Faixa et\u00e1ria ' + r.faixa + ' anos | ' : '') + 'm\u00e9dia dos subdom\u00ednios ' + r.pctGeral + '% | itens pontuados ' + r.validos + '/48'});
    var av = [];
    if (leg) av.push({t: 'Registro da vers\u00e3o anterior', x: 'Este registro foi respondido na vers\u00e3o anterior da escala (sem a op\u00e7\u00e3o "N\u00e3o tem o comportamento", cada item valia de 1 a 3, com cortes por faixa et\u00e1ria). Foi recalculado do mesmo jeito que na \u00e9poca; os resultados n\u00e3o s\u00e3o compar\u00e1veis com os da vers\u00e3o atual.'});
    if (ex.alertaFaixa) av.push({t: 'Idade fora da faixa', x: 'A idade calculada est\u00e1 fora da faixa do instrumento (6 a 12 anos). Interprete com cautela adicional.'});
    if (r.validos < 38) av.push({t: 'Poucos itens pontuados', x: 'Apenas ' + r.validos + ' itens foram pontuados (excluindo "N\u00e3o se aplica" e "N\u00e3o observei"). Resultados com menos de 38 itens pontuados podem n\u00e3o ser confi\u00e1veis.'});
    if (av.length) b.push({t: 'textos', itens: av});
    b.push({t: 'barras', titulo: 'Resultado por subdom\u00ednio (percentual do m\u00e1ximo)',
        nota: leg ? 'Linhas: pontos de corte de tra\u00e7o leve e tra\u00e7o significativo para a faixa ' + r.faixa + ' anos.' : 'Linhas: 33% (tra\u00e7o de comportamento) e 66% (crit\u00e9rio presente).',
        itens: ORDEM.map(function (s) {
            var d = r.sds[s], cortes = leg ? [{pct: CORTES[s][r.faixa].leve, rot: 'leve ' + CORTES[s][r.faixa].leve}, {pct: CORTES[s][r.faixa].sig, rot: 'sig. ' + CORTES[s][r.faixa].sig}] : [{pct: CRIT.traco, rot: '33'}, {pct: CRIT.criterio, rot: '66'}];
            return {rot: SUBDOMINIOS_INFO[s].nome, txt: d.insuf ? 'Dados insuficientes (' + d.respondidos + ' de ' + d.total + ' itens; m\u00ednimo 4)' : d.classificacao + ' - ' + d.pct + '% (' + d.pontuacao + '/' + d.max + ' pontos, ' + d.respondidos + '/' + d.total + ' itens)',
                pct: d.insuf ? 0 : d.pct, cor: COR_CL[d.classificacao], cortes: cortes};
        })});
    var t = [];
    t.push({t: 'Crit\u00e9rios do DSM-5-TR', x: 'Crit\u00e9rio A (comunica\u00e7\u00e3o social): ' + r.contA + ' de 3 subdom\u00ednios com ' + (leg ? 'tra\u00e7o significativo' : 'crit\u00e9rio presente') + '. Crit\u00e9rio B (comportamentos restritos e repetitivos): ' + r.contB + ' de 4. A converg\u00eancia \u00e9 "alta" quando A tem 3 de 3 e B tem pelo menos 2; \u00e9 "parcial" com A 3 e B 1, ou A 2 e B pelo menos 2. O subdom\u00ednio BAP n\u00e3o entra nesses crit\u00e9rios.'});
    if (!leg) t.push({t: 'Regra de leitura dos subdom\u00ednios', x: 'Cada item vale de 0 ("N\u00e3o tem o comportamento") a 3 ("Sempre"). O percentual de cada subdom\u00ednio \u00e9 a soma dos pontos dividida pelo m\u00e1ximo poss\u00edvel dos itens respondidos. 66% ou mais (em m\u00e9dia, "quase sempre") \u00e9 lido como crit\u00e9rio presente; de 33% a 65% (em m\u00e9dia, "\u00e0s vezes"), como tra\u00e7o de comportamento; abaixo de 33%, como sem indicativo. \u00c9 uma regra de leitura do autor, ancorada na l\u00f3gica do DSM-5-TR, e n\u00e3o vem de estudo de sensibilidade e especificidade. Itens de frase positiva t\u00eam a nota invertida (3 menos a resposta).'});
    if (r.sempreLeve.length) t.push({t: 'Sobre a calibra\u00e7\u00e3o da vers\u00e3o anterior', x: 'A vers\u00e3o anterior n\u00e3o tinha a op\u00e7\u00e3o "Nunca": cada item valia de 1 a 3, e o percentual m\u00ednimo poss\u00edvel em qualquer subdom\u00ednio era 33%. Na faixa ' + r.faixa + ' anos, o ponto de corte de tra\u00e7o leve era igual ou menor que 33% em ' + r.sempreLeve.join(', ') + ', e por isso esse(s) subdom\u00ednio(s) nunca aparecia(m) como "Sem indicativo".'});
    b.push({t: 'textos', titulo: 'Como ler o resultado', itens: t});
    b.push({t: 'textos', titulo: 'Interpreta\u00e7\u00e3o por subdom\u00ednio', itens: ORDEM.map(function (s) { return {t: SUBDOMINIOS_INFO[s].nome, x: INTERP[s]}; })});
    var linhas = [], atual = null, i;
    for (i = 0; i < ITENS.length; i++) {
        if (ITENS[i].subdominio !== atual) { atual = ITENS[i].subdominio; linhas.push({grupo: SUBDOMINIOS_INFO[atual].nome}); }
        var x = r.resp[i], pts = '-';
        if (valorPontuavel(x)) pts = String(ITENS[i].invertido ? (leg ? 4 : 3) - parseInt(x, 10) : parseInt(x, 10));
        linhas.push({c: [String(i + 1), ITENS[i].texto + (ITENS[i].invertido ? ' (invertido)' : ''), x === null ? 'Sem resposta' : ROT[x], pts]});
    }
    b.push({t: 'tabela', titulo: 'Respostas', cols: [{h: '#', w: 8, al: 'c'}, {h: 'Item', w: 108, al: 'l'}, {h: 'Resposta', w: 42, al: 'c'}, {h: 'Pontos', w: 22, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var resp = [], i;
    for (i = 1; i <= ITENS.length; i++) {
        var v = d.respostas[i];
        if (v === undefined) return null;
        resp.push(v === null ? null : String(v));
    }
    var faixa = d.faixaEtaria;
    if (faixa !== '6-8' && faixa !== '9-12') {
        var m = String(d.idade || '').match(/(\d+)\s*ano/);
        if (!m) return null;
        faixa = faixaDe(parseInt(m[1], 10));
    }
    return calcular(resp, faixa, {legacy: d.versaoEscala !== 2, respondente: d.respondente || '', convivio: d.convivio || '', nomeRespondente: d.nomeRespondente || ''});
}
var base = symMake({
    id: 'tear', nome: 'TEA-R', cor: '#1565c0', cor2: '#00897b', escalaPainel: ['TEA-R'],
    sub1: 'Escala de Rastreio de Tra\u00e7os do Espectro Autista - 48 itens, 8 subdom\u00ednios (6 a 12 anos)',
    sub2: 'DSM-5-TR (crit\u00e9rios A e B) + Fen\u00f3tipo Ampliado (BAP) | instrumento em desenvolvimento, sem valida\u00e7\u00e3o formal',
    dadosTitulo: 'DADOS DA CRIAN\u00c7A',
    dadosExtra: function (r) {
        var ex = r.extra || {};
        return ['Respondente: ' + (ex.respondente || 'n\u00e3o informado') + (ex.nomeRespondente ? ' (' + ex.nomeRespondente + ')' : '') + (ex.convivio ? '   |   Conv\u00edvio: ' + ex.convivio : '')];
    },
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_TEAR = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
    respostasObj: respostasObj, faixaDe: faixaDe, ITENS: ITENS, OPCOES: OPCOES, CORTES: CORTES, CRIT: CRIT, SUBDOMINIOS_INFO: SUBDOMINIOS_INFO};

})();
