// aq10-visual.js - Desenho sob medida do AQ-10 (tela de resultados + PDF da escala e do Painel).
// Calculo oficial (Allison, Auyeung & Baron-Cohen, 2012): 10 itens, resposta em 4 pontos; cada item vale 0 ou 1.
// Itens 1, 7, 8, 10 pontuam ao CONCORDAR (totalmente/parcialmente); itens 2, 3, 4, 5, 6, 9 pontuam ao DISCORDAR.
// Corte >= 6 = rastreio positivo (adultos: sensibilidade 0,88; especificidade 0,91; VPP 0,85).
// Codificacao das respostas no site: 1 = concordo totalmente ... 4 = discordo totalmente.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var ITENS = [
        {t: 'Frequentemente percebo pequenos sons que os outros n\u00e3o percebem.', acordo: true},
        {t: 'Geralmente me concentro mais no todo do que nos pequenos detalhes.', acordo: false},
        {t: 'Acho f\u00e1cil fazer mais de uma coisa ao mesmo tempo.', acordo: false},
        {t: 'Se houver uma interrup\u00e7\u00e3o, consigo voltar rapidamente ao que estava fazendo.', acordo: false},
        {t: 'Acho f\u00e1cil "ler nas entrelinhas" quando algu\u00e9m est\u00e1 falando comigo.', acordo: false},
        {t: 'Sei dizer se algu\u00e9m que est\u00e1 me ouvindo est\u00e1 ficando entediado.', acordo: false},
        {t: 'Quando estou lendo uma hist\u00f3ria, acho dif\u00edcil entender as inten\u00e7\u00f5es dos personagens.', acordo: true},
        {t: 'Gosto de colecionar informa\u00e7\u00f5es sobre categorias de coisas (ex: tipos de carros, p\u00e1ssaros, trens, plantas).', acordo: true},
        {t: 'Acho f\u00e1cil entender o que algu\u00e9m est\u00e1 pensando ou sentindo apenas olhando para o rosto da pessoa.', acordo: false},
        {t: 'Acho dif\u00edcil entender as inten\u00e7\u00f5es das pessoas.', acordo: true}
    ];
    var RESP = ['Concordo totalmente', 'Concordo parcialmente', 'Discordo parcialmente', 'Discordo totalmente'];
    var CORTE = 6;
    var REFS = [
        'ALLISON, C.; AUYEUNG, B.; BARON-COHEN, S. Toward brief "red flags" for autism screening: the Short Autism Spectrum Quotient and the Short Quantitative Checklist for Autism in toddlers in 1,000 cases and 3,000 controls. Journal of the American Academy of Child & Adolescent Psychiatry, v. 51, n. 2, p. 202-212, 2012.',
        'BARON-COHEN, S. et al. The Autism-Spectrum Quotient (AQ): evidence from Asperger syndrome/high-functioning autism, males and females, scientists and mathematicians. Journal of Autism and Developmental Disorders, v. 31, n. 1, p. 5-17, 2001.',
        'BOOTH, T. et al. Brief report: an evaluation of the AQ-10 as a brief screening instrument for ASD in adults. Journal of Autism and Developmental Disorders, 2013. DOI: 10.1007/s10803-013-1844-5.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O AQ-10 \u00e9 um instrumento de rastreio breve para tra\u00e7os do espectro autista em adultos (16 anos ou mais) sem defici\u00eancia intelectual. N\u00e3o \u00e9 diagn\u00f3stico: um resultado positivo indica necessidade de avalia\u00e7\u00e3o especializada, mas n\u00e3o confirma autismo, e um resultado negativo n\u00e3o o exclui. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function faixa(t) {
        if (t >= CORTE) return {txt: 'Rastreio positivo', seg: '#e53935', bg: '#ffcdd2', fg: '#b71c1c'};
        if (t >= 4) return {txt: 'Rastreio negativo (pr\u00f3ximo do limiar)', seg: '#ff9800', bg: '#ffe0b2', fg: '#bf5600'};
        return {txt: 'Rastreio negativo', seg: '#4caf50', bg: '#c8e6c9', fg: '#1b5e20'};
    }

    // ===================== CALCULO =====================
    // vals: 10 respostas (1 a 4)
    function calcular(vals) {
        if (!vals || vals.length !== 10) throw new Error('AQ-10: respostas incompletas');
        var r = {vals: [], pontua: [], total: 0, itensPontuados: []}, i;
        for (i = 0; i < 10; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 1 && v <= 4)) throw new Error('AQ-10: resposta invalida no item ' + (i + 1));
            var p = ITENS[i].acordo ? (v <= 2) : (v >= 3);
            r.vals.push(v); r.pontua.push(p);
            if (p) { r.total++; r.itensPontuados.push(i + 1); }
        }
        r.positivo = r.total >= CORTE;
        r.f = faixa(r.total);
        return r;
    }
    function classifGeral(r) { return (r.positivo ? 'RASTREIO POSITIVO - ' : 'RASTREIO NEGATIVO - ') + r.total + '/10'; }
    function dadosPainel(r) {
        return {Total: {pontuacao: r.total, max: 10, classificacao: r.positivo ? 'Rastreio positivo (>=6)' : 'Rastreio negativo (<6)'}};
    }
    function analise(r) {
        var out = [];
        out.push({t: 'Resultado', x: 'Escore ' + r.total + ' de 10 (corte: 6 ou mais). ' + (r.positivo ?
            'Rastreio POSITIVO: o resultado sugere presen\u00e7a de tra\u00e7os do espectro autista e indica a necessidade de encaminhamento para avalia\u00e7\u00e3o diagn\u00f3stica especializada (crit\u00e9rios do DSM-5-TR).' :
            'Rastreio NEGATIVO: o resultado n\u00e3o sugere presen\u00e7a significativa de tra\u00e7os do espectro autista pelo corte do estudo original.')});
        out.push({t: 'Itens pontuados', x: r.itensPontuados.length ? 'Itens que pontuaram: ' + r.itensPontuados.join(', ') + '. Cada item vale 1 ponto quando a resposta vai no sentido associado a tra\u00e7os autistas (concordar nos itens 1, 7, 8 e 10; discordar nos itens 2, 3, 4, 5, 6 e 9).' : 'Nenhum item pontuou.'});
        if (!r.positivo && r.total >= 4) out.push({t: 'Pr\u00f3ximo do limiar', x: 'O escore ' + r.total + ' est\u00e1 pr\u00f3ximo do corte (6). Se houver suspeita cl\u00ednica, considerar avalia\u00e7\u00e3o mais detalhada (AQ-50, RAADS-R).'});
        if (!r.positivo) out.push({t: 'Cuidado na interpreta\u00e7\u00e3o', x: 'Um resultado negativo n\u00e3o exclui TEA: pessoas que mascaram ou compensam tra\u00e7os socialmente podem pontuar abaixo do corte. A decis\u00e3o cl\u00ednica deve considerar hist\u00f3ria de desenvolvimento e observa\u00e7\u00e3o.'});
        if (r.positivo) out.push({t: 'Pr\u00f3ximos passos', x: 'Aprofundar com instrumentos mais completos (AQ-50, RAADS-R), hist\u00f3ria do desenvolvimento e entrevista cl\u00ednica. O rastreio sozinho n\u00e3o fecha diagn\u00f3stico.'});
        out.push({t: 'Desempenho do corte 6', x: 'No estudo original (adultos com e sem diagn\u00f3stico de TEA), o corte 6 teve sensibilidade de 0,88, especificidade de 0,91 e valor preditivo positivo de 0,85 (Allison et al., 2012). Esses valores v\u00eam dessa amostra e podem diferir em outros contextos e popula\u00e7\u00f5es.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.aqv h2{color:#0d47a1;margin-bottom:16px;text-align:center}' +
        '.aqv h3{color:#0d47a1;margin:26px 0 10px;font-size:1.12em}' +
        '.aqv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.aqv-res b{font-size:1.6em;display:block}' +
        '.aqv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.aqv-mini{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}.aqv-mini>div{flex:1 1 150px;border-radius:10px;padding:12px 14px;font-size:.88em;border:2px solid #90caf9;background:#e3f2fd;color:#0d47a1;text-align:center}' +
        '.aqv-mini b{display:block;font-size:1.5em}' +
        '.aqv-folha{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.aqv-folha th{background:#0d47a1;color:#fff;padding:7px 4px}.aqv-folha td{padding:7px 6px;border-bottom:1px solid #eee}' +
        '.aqv-folha td.c{text-align:center;width:78px}' +
        '.aqv-mk{display:inline-block;width:20px;height:20px;border-radius:50%}' +
        '.aqv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '@media(max-width:768px){.aqv-folha td.c{width:40px}.aqv-folha th{font-size:.7em}}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('aqv-css')) return;
        var st = document.createElement('style'); st.id = 'aqv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function barraHtml(r) {
        var h = '<div style="display:flex;gap:4px;margin:6px 0 4px">', i;
        for (i = 1; i <= 10; i++) {
            var on = i <= r.total, cor = on ? (i >= CORTE ? '#e53935' : (r.total >= 4 ? '#ff9800' : '#4caf50')) : '#e0e0e0';
            h += '<div style="flex:1;height:30px;border-radius:5px;background:' + cor + ';' + (i === CORTE ? 'outline:3px solid #4a148c;outline-offset:1px;' : '') + 'text-align:center;color:' + (on ? '#fff' : '#999') + ';font-weight:700;line-height:30px;font-size:.85em">' + i + '</div>';
        }
        return h + '</div><div style="font-size:.82em;color:#4a148c;font-weight:700;text-align:right">contorno roxo: primeiro ponto do rastreio positivo (corte 6)</div>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="aqv"><h2>&#129513; Resultados AQ-10</h2>';
        h += '<div class="aqv-res" style="background:' + r.f.bg + ';border-color:' + r.f.seg + ';color:' + r.f.fg + '"><b>' + r.f.txt.toUpperCase() + ' \u2014 ' + r.total + ' / 10</b>Ponto de corte: 6 ou mais</div>';
        h += '<h3>&#127919; Escore (0 a 10)</h3><div class="aqv-box">' + barraHtml(r) + '</div>';
        h += '<div class="aqv-mini"><div>Sensibilidade (corte 6)<b>0,88</b>no estudo original</div><div>Especificidade (corte 6)<b>0,91</b>no estudo original</div><div>Valor preditivo positivo<b>0,85</b>no estudo original</div></div>';
        h += '<h3>&#128203; Folha de respostas</h3><div style="overflow-x:auto"><table class="aqv-folha"><thead><tr><th>#</th><th style="text-align:left">Afirma\u00e7\u00e3o</th>';
        for (k = 0; k < 4; k++) h += '<th class="c">' + RESP[k] + '</th>';
        h += '<th class="c">Pontua?</th></tr></thead><tbody>';
        for (i = 0; i < 10; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].t) + '<div style="font-size:.78em;color:#0d47a1">pontua ao ' + (ITENS[i].acordo ? 'concordar' : 'discordar') + '</div></td>';
            for (k = 1; k <= 4; k++) h += '<td class="c"' + ((ITENS[i].acordo ? k <= 2 : k >= 3) ? ' style="background:#e3f2fd"' : '') + '>' + (r.vals[i] === k ? '<span class="aqv-mk" style="background:' + (r.pontua[i] ? '#e53935' : '#90a4ae') + '"></span>' : '') + '</td>';
            h += '<td class="c" style="font-weight:700;color:' + (r.pontua[i] ? '#b71c1c' : '#78909c') + '">' + (r.pontua[i] ? '1' : '0') + '</td></tr>';
        }
        h += '</tbody></table></div><div style="font-size:.8em;color:#666;margin-top:4px">Fundo azul claro: respostas que pontuam em cada item. Bolinha vermelha: resposta marcada que pontuou; cinza: n\u00e3o pontuou.</div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do resultado</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="aqv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="aqv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#0d47a1';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, AZ); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AZ); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('AQ-10 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Quociente do Espectro Autista - Vers\u00e3o Breve (Autism Spectrum Quotient-10)'), 105, 22, {align: 'center'});
        doc.text(pt('Allison, Auyeung & Baron-Cohen (2012) | rastreio em adultos'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        F(doc, r.f.bg); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, r.f.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, r.f.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.f.txt.toUpperCase() + ' - ' + r.total + ' / 10'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt('Ponto de corte: 6 ou mais'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'ESCORE (0 a 10)');
        var bw = (CW - 9 * 1.5) / 10;
        for (i = 1; i <= 10; i++) {
            var on = i <= r.total, cor = on ? (i >= CORTE ? '#e53935' : (r.total >= 4 ? '#ff9800' : '#4caf50')) : '#e0e0e0';
            var bx = ML + (i - 1) * (bw + 1.5);
            F(doc, cor); doc.rect(bx, c.y, bw, 9, 'F');
            if (i === CORTE) { D(doc, '#4a148c'); doc.setLineWidth(0.9); doc.rect(bx - 0.4, c.y - 0.4, bw + 0.8, 9.8, 'S'); }
            T(doc, on ? '#ffffff' : '#999999'); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(String(i), bx + bw / 2, c.y + 6.2, {align: 'center'});
        }
        T(doc, '#4a148c'); doc.setFontSize(7.4); doc.text(pt('contorno roxo: primeiro ponto do rastreio positivo (corte 6)'), ML + CW, c.y + 14, {align: 'right'});
        c.y += 20;
        var mini = [['Sensibilidade (corte 6)', '0,88'], ['Especificidade (corte 6)', '0,91'], ['Valor preditivo positivo', '0,85']], mw = (CW - 8) / 3;
        for (i = 0; i < 3; i++) {
            var mx = ML + i * (mw + 4);
            F(doc, '#e3f2fd'); D(doc, '#90caf9'); doc.setLineWidth(0.3); doc.roundedRect(mx, c.y, mw, 15, 2, 2, 'FD');
            T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(mini[i][1], mx + mw / 2, c.y + 7, {align: 'center'});
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4); doc.text(pt(mini[i][0] + ' - estudo original'), mx + mw / 2, c.y + 12, {align: 'center'});
        }
        c.y += 22;

        secao(c, 'FOLHA DE RESPOSTAS');
        var cn = 8, ct = 78, cc = 19, cp = 18, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 8, 'F');
        T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.6);
        doc.text('#', xT + cn / 2, c.y + 5, {align: 'center'}); doc.text(pt('Afirma\u00e7\u00e3o'), xT + cn + 2, c.y + 5);
        for (k = 0; k < 4; k++) doc.text(doc.splitTextToSize(pt(RESP[k]), cc - 2), xT + cn + ct + k * cc + cc / 2, c.y + 3.2, {align: 'center'});
        doc.text('Pontua', xT + cn + ct + 4 * cc + cp / 2, c.y + 5, {align: 'center'});
        c.y += 8;
        for (i = 0; i < 10; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            var tl = doc.splitTextToSize(pt(ITENS[i].t), ct - 3), rh = Math.max(8.6, tl.length * 3.4 + 5);
            c.need(rh);
            for (k = 0; k < 4; k++) { if (ITENS[i].acordo ? k < 2 : k >= 2) { F(doc, '#e3f2fd'); doc.rect(xT + cn + ct + k * cc, c.y, cc, rh, 'F'); } }
            var mk = r.vals[i] - 1;
            F(doc, r.pontua[i] ? '#e53935' : '#90a4ae'); doc.circle(xT + cn + ct + mk * cc + cc / 2, c.y + rh / 2, 2.3, 'F');
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1.2, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            doc.text(tl, xT + cn + 1.5, c.y + 3.8);
            T(doc, '#0d47a1'); doc.setFontSize(6.4); doc.text(pt('pontua ao ' + (ITENS[i].acordo ? 'concordar' : 'discordar')), xT + cn + 1.5, c.y + 3.8 + tl.length * 3.5);
            T(doc, r.pontua[i] ? '#b71c1c' : '#78909c'); doc.setFont(undefined, 'bold'); doc.setFontSize(9);
            doc.text(r.pontua[i] ? '1' : '0', xT + cn + ct + 4 * cc + cp / 2, c.y + rh / 2 + 1.2, {align: 'center'});
            D(doc, '#e0e0e0'); doc.setLineWidth(0.15); doc.line(xT, c.y + rh, xT + CW, c.y + rh);
            c.y += rh;
        }
        c.y += 7;

        c.need(30);
        secao(c, 'AN\u00c1LISE DO RESULTADO');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 6;

        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.3 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.3 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | AQ-10 | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('AQ10_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'AQ-10' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 10; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 1 && v <= 4)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_AQ10 = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, ITENS: ITENS};
})();
