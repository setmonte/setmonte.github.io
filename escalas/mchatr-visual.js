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

// mchatr-visual.js - M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised, with Follow-Up; Robins, Fein e Barton, 2009), 20 itens Sim/Nao, 16 a 30 meses. Tela e PDF dos mesmos blocos.
// Algoritmo OFICIAL (mchatscreen.com/mchat-rf/scoring, atualizado em 2025): conta-se o numero de respostas de probabilidade elevada; itens 2, 5 e 12 sao invertidos
// (SIM = probabilidade elevada), nos demais NAO = probabilidade elevada. 0-2: baixa probabilidade (triagem negativa; reavaliar aos 24 meses se < 2 anos);
// 3-7: probabilidade moderada (aplicar o Follow-Up nos itens com resposta elevada; se 2 ou mais continuarem elevados, triagem positiva);
// 8-20: alta probabilidade (triagem positiva; dispensa o Follow-Up). Subconjuntos de itens (ex.: "best7") nao sao mais recomendados.
// d.respostas: chaves 1..20 com os PONTOS do item (1 = probabilidade elevada), igual ao registro antigo.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Se voc\u00ea aponta algo do outro lado do c\u00f4modo, seu filho(a) olha para esse objeto? (por exemplo, se voc\u00ea aponta para um brinquedo ou animal, seu filho(a) olha para o brinquedo ou animal?)",inv:false},
{texto:"Voc\u00ea j\u00e1 se perguntou se seu filho(a) poderia ser surdo(a)?",inv:true},
{texto:"Seu filho(a) brinca de faz de conta? (por exemplo: finge beber de um copinho vazio, finge falar ao telefone, finge dar comida a uma boneca ou bicho de pel\u00facia?)",inv:false},
{texto:"Seu filho(a) gosta de subir em objetos? (por exemplo: m\u00f3veis, brinquedos do parquinho, escadas?)",inv:false},
{texto:"Seu filho(a) faz movimentos incomuns com os dedos perto dos olhos? (por exemplo: mexe os dedos perto dos olhos?)",inv:true},
{texto:"Seu filho(a) aponta com o dedo para pedir algo ou para conseguir ajuda? (por exemplo: aponta para uma comida ou brinquedo que est\u00e1 fora do alcance?)",inv:false},
{texto:"Seu filho(a) aponta com o dedo para mostrar algo interessante? (por exemplo: aponta para um avi\u00e3o no c\u00e9u ou para um caminh\u00e3o grande na rua?)",inv:false},
{texto:"Seu filho(a) se interessa por outras crian\u00e7as? (por exemplo: seu filho(a) observa outras crian\u00e7as, sorri para elas ou vai at\u00e9 elas?)",inv:false},
{texto:"Seu filho(a) mostra objetos para voc\u00ea, levantando-os para voc\u00ea ver - n\u00e3o para conseguir ajuda, mas apenas para compartilhar? (por exemplo: mostra uma flor, bicho de pel\u00facia ou caminh\u00e3o de brinquedo?)",inv:false},
{texto:"Seu filho(a) responde quando voc\u00ea chama pelo nome dele(a)? (por exemplo: ele(a) olha para voc\u00ea, fala ou balbucia, ou para o que est\u00e1 fazendo quando voc\u00ea chama pelo nome dele(a)?)",inv:false},
{texto:"Quando voc\u00ea sorri para seu filho(a), ele(a) sorri de volta?",inv:false},
{texto:"Seu filho(a) fica incomodado(a) com barulhos do dia a dia? (por exemplo: aspirador de p\u00f3 ou m\u00fasica alta?)",inv:true},
{texto:"Seu filho(a) anda?",inv:false},
{texto:"Seu filho(a) olha nos seus olhos quando voc\u00ea fala com ele(a), brinca com ele(a) ou o(a) veste?",inv:false},
{texto:"Seu filho(a) tenta copiar o que voc\u00ea faz? (por exemplo: dar tchau, bater palmas, ou fazer um barulho engra\u00e7ado que voc\u00ea fez?)",inv:false},
{texto:"Se voc\u00ea vira a cabe\u00e7a para olhar algo, seu filho(a) olha ao redor para ver o que voc\u00ea est\u00e1 olhando?",inv:false},
{texto:"Seu filho(a) tenta fazer com que voc\u00ea olhe para ele(a)? (por exemplo: seu filho(a) olha para voc\u00ea esperando elogio, ou diz \u0027olha\u0027 ou \u0027olha para mim\u0027?)",inv:false},
{texto:"Seu filho(a) entende quando voc\u00ea pede para fazer algo? (por exemplo: se voc\u00ea n\u00e3o apontar, seu filho(a) entende \u0027coloque o livro na cadeira\u0027 ou \u0027me traga o cobertor\u0027?)",inv:false},
{texto:"Se algo novo acontece, seu filho(a) olha para o seu rosto para ver como voc\u00ea se sente? (por exemplo: se ele(a) ouve um barulho estranho ou assustador, ou v\u00ea um brinquedo novo, ele(a) olha para o seu rosto?)",inv:false},
{texto:"Seu filho(a) gosta de atividades com movimento? (por exemplo: ser balan\u00e7ado(a) ou quicado(a) no seu joelho?)",inv:false}
];

var OPCOES_NORMAL=[{valor:0,texto:"Sim"},{valor:1,texto:"N\u00e3o"}];
var OPCOES_INV=[{valor:1,texto:"Sim"},{valor:0,texto:"N\u00e3o"}];

var CURTO = [
    'Olhar para o que voc\u00ea aponta', 'Voc\u00ea j\u00e1 se perguntou se \u00e9 surdo(a)', 'Brincar de faz de conta', 'Gostar de subir em objetos', 'Movimentos incomuns dos dedos perto dos olhos',
    'Apontar para pedir algo', 'Apontar para mostrar algo interessante', 'Interesse por outras crian\u00e7as', 'Mostrar objetos para compartilhar', 'Responder quando chamado(a) pelo nome',
    'Sorrir de volta', 'Incomodar-se com barulhos do dia a dia', 'Andar', 'Olhar nos olhos', 'Imitar o que voc\u00ea faz', 'Seguir o seu olhar',
    'Tentar fazer voc\u00ea olhar para ele(a)', 'Entender o que voc\u00ea pede', 'Olhar para o seu rosto diante de algo novo', 'Gostar de atividades com movimento'
];
var FAIXAS = [
    {de: 0, ate: 3, nome: 'Baixa probabilidade', rot: '0 a 2', cor: '#78909c', fundo: '#eceff1', cortexto: '#37474f'},
    {de: 3, ate: 8, nome: 'Probabilidade moderada', rot: '3 a 7', cor: '#f9a825', fundo: '#fff8e1', cortexto: '#8a5a00'},
    {de: 8, ate: 21, nome: 'Alta probabilidade', rot: '8 a 20', cor: '#c62828', fundo: '#ffebee', cortexto: '#8d1f1f'}
];
var PAINEL = ['Baixa probabilidade (0 a 2): triagem negativa', 'Probabilidade moderada (3 a 7): aplicar o Follow-Up', 'Alta probabilidade (8 a 20): triagem positiva'];
var REFS = [
    'TRANSLATION into Brazilian Portuguese and validation of the M-CHAT-R/F scale for early screening of autism spectrum disorder. Revista Paulista de Pediatria, v. 41, e2021262, 2022.',
    'LOSAPIO, M. F.; POND\u00c9, M. P. Tradu\u00e7\u00e3o para o portugu\u00eas da escala M-CHAT para rastreamento precoce de autismo. Revista de Psiquiatria do Rio Grande do Sul, v. 30, n. 3, p. 221-229, 2008. DOI: 10.1590/S0101-81082008000400011.',
    'ROBINS, D. L.; FEIN, D.; BARTON, M. The Modified Checklist for Autism in Toddlers, Revised, with Follow-Up (M-CHAT-R/F)\u2122. 2009. Dispon\u00edvel em: www.mchatscreen.com.',
    'ROBINS, D. L.; CASAGRANDE, K.; BARTON, M.; CHEN, C.-M. A.; DUMONT-MATHIEU, T.; FEIN, D. Validation of the Modified Checklist for Autism in Toddlers, Revised with Follow-up (M-CHAT-R/F). Pediatrics, v. 133, n. 1, p. 37-45, 2014. DOI: 10.1542/peds.2013-1813.',
    'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and statistical manual of mental disorders: DSM-5-TR. 5th ed., text rev. Washington, DC: APA, 2022.'
];
var COPY = 'M-CHAT-R/F\u2122 \u00a9 2009 Diana Robins, Deborah Fein e Marianne Barton. Instrumento dispon\u00edvel em www.mchatscreen.com.';
var AVISO = 'O M-CHAT-R/F \u00e9 um instrumento de triagem respondido pelos pais ou cuidadores, para crian\u00e7as de 16 a 30 meses; n\u00e3o \u00e9 diagn\u00f3stico de autismo. Uma pontua\u00e7\u00e3o baixa n\u00e3o exclui o diagn\u00f3stico e uma pontua\u00e7\u00e3o alta n\u00e3o o confirma: o resultado indica a necessidade de investigar melhor. ' + COPY + ' Nenhum instrumento isolado descreve a crian\u00e7a por inteiro; o resultado deve ser interpretado por profissional qualificado, junto com a avalia\u00e7\u00e3o cl\u00ednica e o acompanhamento do desenvolvimento.';

function mesesDe(idade) { var m = String(idade == null ? '' : idade).match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }
function calcular(vals, idade) {
    if (!vals || vals.length !== ITENS.length) throw new Error('M-CHAT-R: respostas incompletas');
    var r = {v: [], total: 0, elev: [], meses: mesesDe(idade)}, i;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x === 0 || x === 1)) throw new Error('M-CHAT-R: resposta invalida no item ' + (i + 1));
        r.v.push(x); r.total += x; if (x === 1) r.elev.push(i);
    }
    r.faixa = r.total <= 2 ? 0 : (r.total <= 7 ? 1 : 2);
    r.foraIdade = r.meses != null && (r.meses < 16 || r.meses > 30);
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return PAINEL[r.faixa]; }
function dadosPainel() { return {}; }
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
function respostaTxt(ix, p) { var inv = !!ITENS[ix].inv; return (inv ? p === 1 : p === 0) ? 'Sim' : 'N\u00e3o'; }
function lista(a) { return a.map(function (q) { return q + 1; }).join(', '); }
function blocks(r) {
    var f = FAIXAS[r.faixa], b = [], i;
    var etapa = r.faixa === 0 ? 'Nenhuma al\u00e9m do acompanhamento' : (r.faixa === 1 ? 'Aplicar o Follow-Up' : 'Triagem positiva');
    b.push({t: 'hero', fundo: f.fundo, borda: f.cor, cor: f.cortexto, titulo: r.total + ' de 20 respostas de probabilidade elevada', sub: f.nome + ' (faixa ' + f.rot + ')'});
    b.push({t: 'cards', itens: [
        {rot: 'RESPOSTAS ELEVADAS', valor: r.total + ' / 20', de: 'itens que apontam probabilidade elevada', cor: f.cor},
        {rot: 'IDADE', valor: r.meses != null ? r.meses + ' meses' : '-', de: r.foraIdade ? 'fora da faixa de 16 a 30 meses' : 'faixa validada: 16 a 30 meses', cor: r.foraIdade ? '#ef6c00' : '#00796b'},
        {rot: 'PR\u00d3XIMA ETAPA (PROTOCOLO)', valor: etapa, de: 'conforme os autores do instrumento', cor: '#37474f'}
    ]});
    b.push({t: 'faixas', titulo: 'Pontua\u00e7\u00e3o e faixas oficiais', min: 0, max: 21, pino: r.total + 0.5, ativo: r.faixa, faixas: FAIXAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    var ler = [
        {t: 'O que o M-CHAT-R/F \u00e9', x: 'Um question\u00e1rio de 20 perguntas de sim ou n\u00e3o, respondido por pais ou cuidadores, para crian\u00e7as de 16 a 30 meses. Ele procura sinais precoces que justifiquem investigar o desenvolvimento e a possibilidade de autismo. \u00c9 uma triagem: n\u00e3o faz diagn\u00f3stico.'},
        {t: 'Como a pontua\u00e7\u00e3o funciona', x: 'Conta-se quantas respostas indicam probabilidade elevada. Na maioria dos itens \u00e9 a resposta "N\u00e3o"; nos itens 2, 5 e 12 \u00e9 a resposta "Sim". A pontua\u00e7\u00e3o usa os 20 itens: os autores n\u00e3o recomendam mais usar subconjuntos de itens.'},
        {t: 'Resultado desta crian\u00e7a', x: r.faixa === 0 ? 'Pontua\u00e7\u00e3o de 0 a 2: baixa probabilidade, triagem negativa. Pelo protocolo dos autores, n\u00e3o h\u00e1 Follow-Up; se a crian\u00e7a tem menos de 2 anos, repete-se a triagem aos 24 meses, e o acompanhamento do desenvolvimento continua.' : (r.faixa === 1 ? 'Pontua\u00e7\u00e3o de 3 a 7: probabilidade moderada. Pelo protocolo dos autores, aplica-se o Follow-Up, uma entrevista curta feita pelo profissional apenas sobre os itens com resposta elevada (' + lista(r.elev) + '). Se 2 ou mais itens continuarem indicando probabilidade elevada depois do Follow-Up, a triagem \u00e9 positiva.' : 'Pontua\u00e7\u00e3o de 8 a 20: alta probabilidade, triagem positiva. Pelo protocolo dos autores, o Follow-Up n\u00e3o \u00e9 necess\u00e1rio e a crian\u00e7a deve ser encaminhada para avalia\u00e7\u00e3o diagn\u00f3stica e de interven\u00e7\u00e3o precoce.')},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico de autismo. Uma pontua\u00e7\u00e3o baixa n\u00e3o exclui o diagn\u00f3stico e uma pontua\u00e7\u00e3o alta n\u00e3o o confirma: depende da observa\u00e7\u00e3o do comportamento habitual da crian\u00e7a pelos pais e deve ser seguida de avalia\u00e7\u00e3o cl\u00ednica. A decis\u00e3o sobre encaminhamentos \u00e9 do profissional que acompanha a crian\u00e7a.'},
        {t: 'Sobre a precis\u00e3o do instrumento', x: 'No estudo de valida\u00e7\u00e3o original (Robins et al., 2014; 16.071 crian\u00e7as atendidas em consultas de rotina), entre as crian\u00e7as com 3 ou mais pontos e 2 ou mais depois do Follow-Up, 47,5% receberam diagn\u00f3stico de autismo e 94,6% tinham alguma altera\u00e7\u00e3o ou preocupa\u00e7\u00e3o com o desenvolvimento. No estudo de tradu\u00e7\u00e3o e valida\u00e7\u00e3o para o portugu\u00eas do Brasil, a sensibilidade foi de 88,2% e a especificidade de 53,6% no corte acima de 2 pontos; o diagn\u00f3stico foi relatado pelos pais, em question\u00e1rio online e sem o Follow-Up, o que pode ter reduzido a precis\u00e3o.'}
    ];
    if (r.foraIdade) ler.unshift({t: 'Aten\u00e7\u00e3o: idade fora da faixa', x: 'A crian\u00e7a tem ' + r.meses + ' meses. O M-CHAT-R/F foi desenvolvido e validado para crian\u00e7as de 16 a 30 meses; fora dessa faixa, a interpreta\u00e7\u00e3o fica menos segura.'});
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: ler});
    var el = r.elev.length ? r.elev.map(function (q) { return 'item ' + (q + 1) + ' (' + CURTO[q].toLowerCase() + ')'; }).join('; ') + '.' : 'Nenhum item.';
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: [
        {t: 'Itens com resposta de probabilidade elevada', x: el + (r.faixa === 1 ? ' S\u00e3o os itens que o Follow-Up deve investigar.' : '')},
        {t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Cada item com resposta de probabilidade elevada vale 1 ponto: "N\u00e3o" nos itens 1, 3, 4, 6 a 11 e 13 a 20; "Sim" nos itens 2, 5 e 12. A soma vai de 0 a 20 e, nesta crian\u00e7a, foi ' + r.total + '.'}
    ]});
    var linhas = ITENS.map(function (it, ix) { return {c: [String(ix + 1), CURTO[ix], respostaTxt(ix, r.v[ix]), r.v[ix] === 1 ? 'Probabilidade elevada' : 'Esperado']}; });
    b.push({t: 'tabela', titulo: 'Respostas (texto completo das perguntas na vers\u00e3o aplicada)', minAltura: 100, cols: [{h: '#', w: 8, al: 'c'}, {h: 'Comportamento', w: 90, al: 'l'}, {h: 'Resposta', w: 28, al: 'c'}, {h: 'Resultado', w: 54, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x === 0 || x === 1)) return null; v.push(x); }
    return calcular(v, d.idade);
}
var base = symMake({
    id: 'mchatr', nome: 'M-CHAT-R', cor: '#c62828', cor2: '#37474f', escalaPainel: ['M-CHAT-R'],
    sub1: 'M-CHAT-R/F - Question\u00e1rio Modificado para a Triagem do Autismo em Crian\u00e7as entre 16 e 30 meses, Revisado, com Entrevista de Seguimento',
    sub2: 'Robins, Fein e Barton (2009) | valida\u00e7\u00e3o brasileira: Revista Paulista de Pediatria (2022)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_MCHATR = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES_NORMAL: OPCOES_NORMAL, OPCOES_INV: OPCOES_INV, FAIXAS: FAIXAS};

})();
