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

// pss10-visual.js - PSS-10 (Escala de Estresse Percebido), 10 itens 0-4, itens 4,5,7,8 invertidos (4 - resposta), total 0-40. Tela e PDF dos mesmos blocos.
// Calculo mantido como no site e conferido com Cohen e Williamson (1988): soma dos 10 itens apos inverter os itens positivos.
// A escala NAO tem pontos de corte oficiais: as faixas 0-13 / 14-26 / 27-40 sao de uso comum na literatura (convencao) e sao apresentadas assim.
// Retirados: vermelho de alarme e qualquer sugestao de conduta. d.respostas: chaves 1..10, valores brutos 0-4 (igual ao registro antigo).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).

var ITENS=[
{texto:"Com que frequ\u00eancia voc\u00ea ficou aborrecido(a) por causa de algo que aconteceu inesperadamente?"},
{texto:"Com que frequ\u00eancia voc\u00ea sentiu que era incapaz de controlar as coisas importantes da sua vida?"},
{texto:"Com que frequ\u00eancia voc\u00ea se sentiu nervoso(a) e estressado(a)?"},
{texto:"Com que frequ\u00eancia voc\u00ea se sentiu confiante em sua capacidade de lidar com seus problemas pessoais?",inv:true},
{texto:"Com que frequ\u00eancia voc\u00ea sentiu que as coisas estavam indo do seu jeito?",inv:true},
{texto:"Com que frequ\u00eancia voc\u00ea achou que n\u00e3o conseguiria dar conta de todas as coisas que tinha para fazer?"},
{texto:"Com que frequ\u00eancia voc\u00ea foi capaz de controlar as irrita\u00e7\u00f5es da sua vida?",inv:true},
{texto:"Com que frequ\u00eancia voc\u00ea sentiu que estava no controle de tudo?",inv:true},
{texto:"Com que frequ\u00eancia voc\u00ea ficou irritado(a) por causa de coisas que estavam fora do seu controle?"},
{texto:"Com que frequ\u00eancia voc\u00ea sentiu que os problemas se acumularam a ponto de n\u00e3o conseguir super\u00e1-los?"}
];

var OPCOES=[{valor:0,texto:"Nunca"},{valor:1,texto:"Quase nunca"},{valor:2,texto:"\u00c0s vezes"},{valor:3,texto:"Com alguma frequ\u00eancia"},{valor:4,texto:"Muito frequentemente"}];

var FAIXAS = [
    {de: 0, ate: 14, nome: 'Estresse percebido na faixa baixa', rot: '0 a 13', cor: '#78909c', fundo: '#eceff1', cortexto: '#37474f'},
    {de: 14, ate: 27, nome: 'Estresse percebido na faixa intermedi\u00e1ria', rot: '14 a 26', cor: '#f9a825', fundo: '#fff8e1', cortexto: '#8a5a00'},
    {de: 27, ate: 41, nome: 'Estresse percebido na faixa alta', rot: '27 a 40', cor: '#e64a19', fundo: '#ffccbc', cortexto: '#9c2c0c'}
];
var CLASSIF_PAINEL = ['Baixo estresse', 'Estresse moderado', 'Alto estresse'];
var TXT = [
    'A pontua\u00e7\u00e3o est\u00e1 na faixa baixa de estresse percebido: no \u00faltimo m\u00eas, a pessoa relatou com pouca frequ\u00eancia sentir a vida imprevis\u00edvel, incontrol\u00e1vel ou sobrecarregada.',
    'A pontua\u00e7\u00e3o est\u00e1 na faixa intermedi\u00e1ria de estresse percebido: no \u00faltimo m\u00eas, a pessoa relatou sentir, com alguma frequ\u00eancia, que a vida estava imprevis\u00edvel, incontrol\u00e1vel ou sobrecarregada.',
    'A pontua\u00e7\u00e3o est\u00e1 na faixa alta de estresse percebido: no \u00faltimo m\u00eas, a pessoa relatou sentir, com frequ\u00eancia, que a vida estava imprevis\u00edvel, incontrol\u00e1vel ou sobrecarregada.'
];
var REFS = [
    'COHEN, S.; KAMARCK, T.; MERMELSTEIN, R. A global measure of perceived stress. Journal of Health and Social Behavior, v. 24, n. 4, p. 385-396, 1983.',
    'COHEN, S.; WILLIAMSON, G. Perceived stress in a probability sample of the United States. In: SPACAPAN, S.; OSKAMP, S. (ed.). The social psychology of health. Newbury Park: Sage, 1988. p. 31-67.',
    'LUFT, C. D. B.; SANCHES, S. O.; MAZO, G. Z.; ANDRADE, A. Vers\u00e3o brasileira da Escala de Estresse Percebido: tradu\u00e7\u00e3o e valida\u00e7\u00e3o para idosos. Revista de Sa\u00fade P\u00fablica, v. 41, n. 4, p. 606-615, 2007.',
    'REIS, R. S.; HINO, A. A. F.; A\u00d1EZ, C. R. R. Perceived Stress Scale: reliability and validity study in Brazil. Journal of Health Psychology, v. 15, n. 1, p. 107-114, 2010. DOI: 10.1177/1359105309346343.'
];
var AVISO = 'A PSS-10 mede o estresse percebido no \u00faltimo m\u00eas (o quanto a pessoa sente a vida imprevis\u00edvel, incontrol\u00e1vel e sobrecarregada); n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica. A escala n\u00e3o possui pontos de corte oficiais: as faixas 0-13, 14-26 e 27-40 s\u00e3o de uso comum na literatura e servem apenas como refer\u00eancia descritiva. Nenhum instrumento isolado descreve a pessoa por inteiro; o resultado deve ser interpretado por profissional qualificado, junto com a hist\u00f3ria cl\u00ednica.';

function pontos(it, x) { return it.inv ? 4 - x : x; }
function calcular(vals) {
    if (!vals || vals.length !== ITENS.length) throw new Error('PSS-10: respostas incompletas');
    var r = {v: [], p: [], total: 0, neg: 0, pos: 0}, i;
    for (i = 0; i < ITENS.length; i++) {
        var x = parseInt(vals[i], 10);
        if (!(x >= 0 && x <= 4)) throw new Error('PSS-10: resposta invalida no item ' + (i + 1));
        var p = pontos(ITENS[i], x);
        r.v.push(x); r.p.push(p); r.total += p;
        if (ITENS[i].inv) r.pos += p; else r.neg += p;
    }
    r.faixa = r.total <= 13 ? 0 : (r.total <= 26 ? 1 : 2);
    return r;
}
function escore(r) { return r.total; }
function classifGeral(r) { return CLASSIF_PAINEL[r.faixa]; }
function dadosPainel() { return {}; }
function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
// Rotulos curtos (apenas para as barras; o texto completo de cada item aparece na tabela de respostas)
var CURTO = [
    'Aborrecimento por algo inesperado',
    'Sentir-se incapaz de controlar o importante',
    'Sentir-se nervoso(a) e estressado(a)',
    'Confian\u00e7a para lidar com os problemas',
    'Sentir que as coisas iam do seu jeito',
    'N\u00e3o dar conta de tudo o que tinha a fazer',
    'Conseguir controlar as irrita\u00e7\u00f5es',
    'Sentir-se no controle de tudo',
    'Irrita\u00e7\u00e3o com o que est\u00e1 fora do controle',
    'Problemas acumulados a ponto de n\u00e3o super\u00e1-los'
];
function corNivel(p) { return p >= 4 ? '#bf360c' : (p === 3 ? '#e65100' : (p === 2 ? '#f9a825' : (p === 1 ? '#90a4ae' : '#b0bec5'))); }
function barraItem(r, ix) {
    var it = ITENS[ix], x = r.v[ix], p = r.p[ix];
    var txt = it.inv
        ? '"' + OPCOES[x].texto + '" (resposta ' + x + ') = ' + p + ' pt'
        : '"' + OPCOES[x].texto + '" = ' + p + ' pt';
    return {rot: 'Item ' + (ix + 1) + ' - ' + CURTO[ix] + (it.inv ? ' (invertido)' : ''), txt: txt, pct: p / 4 * 100, cor: corNivel(p)};
}
function blocks(r) {
    var f = FAIXAS[r.faixa], b = [], ix, neg = [], pos = [], max4 = [], conta = [];
    for (ix = 0; ix < ITENS.length; ix++) {
        (ITENS[ix].inv ? pos : neg).push(barraItem(r, ix));
        if (r.p[ix] === 4) max4.push('item ' + (ix + 1) + ' (' + CURTO[ix].toLowerCase() + ')');
        if (ITENS[ix].inv) conta.push('item ' + (ix + 1) + ': respondeu ' + r.v[ix] + ' e vale 4 - ' + r.v[ix] + ' = ' + r.p[ix]);
    }
    b.push({t: 'hero', fundo: f.fundo, borda: f.cor, cor: f.cortexto, titulo: 'Escore ' + r.total + ' de 40 pontos', sub: f.nome + ' (refer\u00eancia ' + f.rot + ')'});
    b.push({t: 'cards', itens: [
        {rot: 'ESCORE TOTAL', valor: String(r.total), de: 'de 40 pontos', cor: f.cor},
        {rot: 'DO M\u00c1XIMO', valor: Math.round(r.total / 40 * 100) + '%', de: 'da pontua\u00e7\u00e3o poss\u00edvel', cor: '#e65100'},
        {rot: 'ITENS NEGATIVOS', valor: r.neg + ' / 24', de: 'itens 1, 2, 3, 6, 9, 10', cor: '#bf360c'},
        {rot: 'ITENS POSITIVOS', valor: r.pos + ' / 16', de: 'itens 4, 5, 7 e 8', cor: '#00897b'}
    ]});
    b.push({t: 'faixas', titulo: 'Onde o escore se encontra (faixas de uso comum, sem pontos de corte oficiais)', min: 0, max: 41, pino: r.total + 0.5, ativo: r.faixa, faixas: FAIXAS.map(function (x) { return {de: x.de, ate: x.ate, cor: x.cor, rot: x.rot}; })});
    var ler = [
        {t: 'O que a PSS-10 mede', x: 'O quanto, no \u00faltimo m\u00eas, a pessoa sentiu a vida como imprevis\u00edvel, fora de controle e sobrecarregada. A escala n\u00e3o conta quantos acontecimentos dif\u00edceis houve: mostra como a pessoa os percebeu.'},
        {t: 'O que este resultado indica', x: TXT[r.faixa] + ' Quanto maior o escore, maior o estresse percebido naquele per\u00edodo.'},
        {t: 'O que este resultado n\u00e3o diz', x: 'N\u00e3o \u00e9 diagn\u00f3stico, n\u00e3o aponta a causa do estresse e n\u00e3o diz se h\u00e1 ansiedade, depress\u00e3o ou outro quadro. \u00c9 uma fotografia do \u00faltimo m\u00eas, que pode mudar com o momento de vida.'}
    ];
    b.push({t: 'textos', titulo: 'Como ler este resultado', itens: ler});
    b.push({t: 'barras', titulo: 'Itens de sentido negativo', nota: 'Quanto maior a barra, mais estresse percebido.', itens: neg});
    b.push({t: 'barras', titulo: 'Itens de sentido positivo (pontua\u00e7\u00e3o invertida)', nota: 'Aqui "Nunca" vale 4 e "Muito frequentemente" vale 0, pois os itens falam de sentir-se no controle.', itens: pos});
    var t = [];
    t.push({t: 'Como a pontua\u00e7\u00e3o foi calculada', x: 'Nos itens 1, 2, 3, 6, 9 e 10, cada resposta vale de 0 (Nunca) a 4 (Muito frequentemente). Nos itens 4, 5, 7 e 8 a conta \u00e9 invertida, porque eles falam de sentir-se no controle: ' + conta.join('; ') + '. A soma dos 10 itens d\u00e1 o escore, de 0 a 40.'});
    t.push({t: 'Respostas com pontua\u00e7\u00e3o m\u00e1xima (4 pontos)', x: max4.length ? 'Itens: ' + max4.join('; ') + '. Descri\u00e7\u00e3o das respostas dadas, sem leitura cl\u00ednica por si s\u00f3.' : 'Nenhum item atingiu a pontua\u00e7\u00e3o m\u00e1xima.'});
    b.push({t: 'textos', titulo: 'Entendendo a conta', itens: t});
    var linhas = ITENS.map(function (it, ix) { return {c: [String(ix + 1), it.texto, OPCOES[r.v[ix]].texto, String(r.p[ix]) + (it.inv ? ' (inv.)' : '')]}; });
    b.push({t: 'tabela', titulo: 'Respostas', minAltura: 110, cols: [{h: '#', w: 8, al: 'c'}, {h: 'Item', w: 100, al: 'l'}, {h: 'Resposta', w: 44, al: 'c'}, {h: 'Pontos', w: 28, al: 'c'}], linhas: linhas});
    b.push({t: 'aviso', x: AVISO});
    return b;
}
function fromPainel(d) {
    var v = [], i;
    for (i = 1; i <= ITENS.length; i++) { var x = parseInt(d.respostas[i], 10); if (!(x >= 0 && x <= 4)) return null; v.push(x); }
    return calcular(v);
}
var base = symMake({
    id: 'pss10', nome: 'PSS-10', cor: '#e65100', cor2: '#bf360c', escalaPainel: ['PSS-10'],
    sub1: 'Escala de Estresse Percebido (Perceived Stress Scale) - 10 itens, \u00faltimo m\u00eas',
    sub2: 'Cohen, Kamarck e Mermelstein (1983); Cohen e Williamson (1988) | adapta\u00e7\u00e3o brasileira: Luft et al. (2007); Reis et al. (2010)',
    blocks: blocks, refs: REFS, fromPainel: fromPainel
});
window.SYM_PSS10 = {calcular: calcular, htmlTela: base.htmlTela, pdf: base.pdf, pdfPainel: base.pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, respostasObj: respostasObj, escore: escore, ITENS: ITENS, OPCOES: OPCOES, FAIXAS: FAIXAS};

})();
