// gad7-visual.js - Desenho sob medida do GAD-7 (tela de resultados + PDF da escala e do Painel).
// Calculo oficial (Spitzer et al., 2006): soma dos 7 itens (0-3) = 0 a 21; faixas 0-4 minimo, 5-9 leve,
// 10-14 moderado, 15-21 grave. Corte >= 10 = provavel TAG no rastreio (sensibilidade 89%, especificidade 82%).
// GAD-2 = itens 1 e 2 (0-6), corte >= 3 (Kroenke et al., 2007).
// Pergunta oficial de dificuldade funcional (nao entra na soma), opcional.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var ITENS = [
        'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
        'N\u00e3o ser capaz de impedir ou de controlar as preocupa\u00e7\u00f5es',
        'Preocupar-se muito com diversas coisas',
        'Dificuldade para relaxar',
        'Ficar t\u00e3o agitado(a) que se torna dif\u00edcil permanecer sentado(a)',
        'Ficar facilmente aborrecido(a) ou irrit\u00e1vel',
        'Sentir medo como se algo horr\u00edvel fosse acontecer'
    ];
    var RESP = ['Nenhuma vez', 'V\u00e1rios dias', 'Mais da metade dos dias', 'Quase todos os dias'];
    var FUNC = ['Nenhuma dificuldade', 'Alguma dificuldade', 'Muita dificuldade', 'Extrema dificuldade'];
    var FUNC_PERGUNTA = 'Se voc\u00ea assinalou algum dos problemas acima, quanta dificuldade eles causaram para voc\u00ea realizar seu trabalho, cuidar das coisas em casa ou se relacionar com outras pessoas?';
    var FAIXAS = [
        {de: 0, ate: 4, txt: 'M\u00ednimo', seg: '#4caf50', bg: '#c8e6c9', fg: '#1b5e20'},
        {de: 5, ate: 9, txt: 'Leve', seg: '#9ccc65', bg: '#dcedc8', fg: '#33691e'},
        {de: 10, ate: 14, txt: 'Moderado', seg: '#ff9800', bg: '#ffe0b2', fg: '#bf5600'},
        {de: 15, ate: 21, txt: 'Grave', seg: '#f44336', bg: '#ffcdd2', fg: '#b71c1c'}
    ];
    var REFS = [
        'SPITZER, R. L.; KROENKE, K.; WILLIAMS, J. B. W.; L\u00d6WE, B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, v. 166, n. 10, p. 1092-1097, 2006.',
        'KROENKE, K.; SPITZER, R. L.; WILLIAMS, J. B. W.; MONAHAN, P. O.; L\u00d6WE, B. Anxiety disorders in primary care: prevalence, impairment, comorbidity, and detection. Annals of Internal Medicine, v. 146, n. 5, p. 317-325, 2007.',
        'MORENO, A. L. et al. Factor structure, reliability, and item parameters of the Brazilian-Portuguese version of the GAD-7 questionnaire. Temas em Psicologia, v. 24, n. 1, p. 367-376, 2016. DOI: 10.9788/tp2016.1-25.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O GAD-7 \u00e9 um instrumento de rastreio validado para ansiedade generalizada (refer\u00eancia: \u00faltimas 2 semanas). Um escore de 10 ou mais indica prov\u00e1vel Transtorno de Ansiedade Generalizada no rastreio, mas n\u00e3o fecha diagn\u00f3stico: o GAD-7 tamb\u00e9m se eleva em p\u00e2nico, ansiedade social e TEPT. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';
    var TXT = {
        'M\u00ednimo': 'Escore na faixa m\u00ednima: o relato das \u00faltimas duas semanas n\u00e3o indica sintomas de ansiedade relevantes.',
        'Leve': 'Escore na faixa leve: h\u00e1 sintomas de ansiedade em alguns dias, geralmente sem preju\u00edzo marcante. Vale monitorar a evolu\u00e7\u00e3o.',
        'Moderado': 'Escore na faixa moderada: os sintomas de ansiedade aparecem com frequ\u00eancia relevante. Est\u00e1 acima do corte de rastreio (10) e justifica avalia\u00e7\u00e3o cl\u00ednica aprofundada.',
        'Grave': 'Escore na faixa grave: os sintomas de ansiedade est\u00e3o presentes na maior parte dos dias. Est\u00e1 bem acima do corte de rastreio e indica necessidade de avalia\u00e7\u00e3o e cuidado cl\u00ednico priorit\u00e1rios.'
    };
    function faixa(e) { for (var i = 0; i < FAIXAS.length; i++) { if (e <= FAIXAS[i].ate) return FAIXAS[i]; } return FAIXAS[3]; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    // ===================== CALCULO =====================
    // vals: 7 respostas (0-3); func: indice 0-3 da pergunta de dificuldade (ou null)
    function calcular(vals, func) {
        if (!vals || vals.length !== 7) throw new Error('GAD-7: respostas incompletas');
        var r = {vals: [], escore: 0, freq: []}, i;
        for (i = 0; i < 7; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('GAD-7: resposta invalida no item ' + (i + 1));
            r.vals.push(v); r.escore += v; if (v >= 2) r.freq.push(i + 1);
        }
        r.f = faixa(r.escore);
        r.tag = r.escore >= 10;
        r.gad2 = r.vals[0] + r.vals[1];
        r.gad2pos = r.gad2 >= 3;
        var fv = parseInt(func, 10);
        r.func = (fv >= 0 && fv <= 3) ? fv : null;
        return r;
    }
    function dadosPainel(r) {
        return {
            Total: {pontuacao: r.escore, max: 21, classificacao: r.f.txt + (r.tag ? ' - acima do corte de rastreio (>=10)' : ' - abaixo do corte de rastreio (<10)')},
            'GAD-2': {pontuacao: r.gad2, max: 6, classificacao: r.gad2pos ? 'Positivo (>=3)' : 'Negativo (<3)'}
        };
    }
    function analise(r) {
        var out = [];
        out.push({t: 'Gravidade', x: 'Escore total ' + r.escore + ' de 21. ' + TXT[r.f.txt]});
        out.push({t: 'Rastreio de TAG (corte 10)', x: r.tag ? 'Escore igual ou acima de 10: rastreio POSITIVO para prov\u00e1vel Transtorno de Ansiedade Generalizada (no estudo original, sensibilidade de 89% e especificidade de 82%). Investigar tamb\u00e9m p\u00e2nico, ansiedade social e TEPT, que elevam o GAD-7.' : 'Escore abaixo de 10: rastreio negativo para Transtorno de Ansiedade Generalizada pelo corte do estudo original.'});
        out.push({t: 'GAD-2 (itens 1 e 2)', x: 'Soma ' + r.gad2 + ' de 6 nos dois itens centrais (nervosismo e preocupa\u00e7\u00e3o incontrol\u00e1vel). ' + (r.gad2pos ? 'Igual ou acima do corte 3: rastreio ultracurto positivo.' : 'Abaixo do corte 3: rastreio ultracurto negativo.')});
        out.push({t: 'Sintomas mais frequentes', x: r.freq.length ? 'Itens presentes em mais da metade dos dias ou quase todos os dias: ' + r.freq.map(function (n) { return n + ' (' + ITENS[n - 1].toLowerCase() + ')'; }).join('; ') + '.' : 'Nenhum sintoma foi relatado em mais da metade dos dias.'});
        out.push({t: 'Dificuldade funcional', x: r.func === null ? 'A pergunta sobre dificuldade funcional n\u00e3o foi respondida.' : 'Relatada: ' + FUNC[r.func].toLowerCase() + ' para trabalhar, cuidar das coisas em casa ou se relacionar com outras pessoas.' + (r.func >= 2 ? ' Indica preju\u00edzo funcional relevante.' : '')});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.gadv h2{color:#6a1b9a;margin-bottom:16px;text-align:center}' +
        '.gadv h3{color:#6a1b9a;margin:26px 0 10px;font-size:1.12em}' +
        '.gadv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.gadv-res b{font-size:1.6em;display:block}' +
        '.gadv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.gadv-row{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.gadv-row>.gadv-box{flex:1 1 260px;margin:0}' +
        '.gadv-mini{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}.gadv-mini>div{flex:1 1 200px;border-radius:10px;padding:12px 14px;font-size:.88em;border:2px solid}' +
        '.gadv-mini b{display:block;font-size:1.25em}' +
        '.gadv-folha{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.gadv-folha th{background:#6a1b9a;color:#fff;padding:7px 4px}.gadv-folha td{padding:7px 6px;border-bottom:1px solid #eee}' +
        '.gadv-folha td.c{text-align:center;width:80px}' +
        '.gadv-mk{display:inline-block;width:20px;height:20px;border-radius:50%}' +
        '.gadv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '@media(max-width:768px){.gadv-folha td.c{width:40px}.gadv-folha th{font-size:.7em}}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('gadv-css')) return;
        var st = document.createElement('style'); st.id = 'gadv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    // velocimetro em SVG (semicirculo 0-21)
    function svgGauge(r) {
        var cx = 150, cy = 140, R = 110, w = 30, h = '<svg width="300" height="185" viewBox="0 0 300 185" role="img" aria-label="Veloc\u00edmetro do escore GAD-7">';
        function ang(v) { return Math.PI * (1 - v / 21); }
        function pt(v, rr) { var a = ang(v); return [(cx + Math.cos(a) * rr).toFixed(2), (cy - Math.sin(a) * rr).toFixed(2)]; }
        for (var i = 0; i < FAIXAS.length; i++) {
            var a0 = FAIXAS[i].de === 0 ? 0 : FAIXAS[i].de - 0.5, a1 = FAIXAS[i].ate === 21 ? 21 : FAIXAS[i].ate + 0.5;
            var p1 = pt(a0, R), p2 = pt(a1, R), p3 = pt(a1, R - w), p4 = pt(a0, R - w);
            h += '<path d="M' + p1[0] + ' ' + p1[1] + ' A' + R + ' ' + R + ' 0 0 1 ' + p2[0] + ' ' + p2[1] + ' L' + p3[0] + ' ' + p3[1] + ' A' + (R - w) + ' ' + (R - w) + ' 0 0 0 ' + p4[0] + ' ' + p4[1] + ' Z" fill="' + FAIXAS[i].seg + '"' + (FAIXAS[i] === r.f ? '' : ' opacity="0.45"') + '/>';
            var lp = pt((FAIXAS[i].de + FAIXAS[i].ate) / 2, R + 14);
            h += '<text x="' + lp[0] + '" y="' + lp[1] + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + FAIXAS[i].fg + '">' + FAIXAS[i].txt + '</text>';
        }
        var c1 = pt(9.5, R + 4), c2 = pt(9.5, R - w - 4);
        h += '<line x1="' + c1[0] + '" y1="' + c1[1] + '" x2="' + c2[0] + '" y2="' + c2[1] + '" stroke="#4a148c" stroke-width="3" stroke-dasharray="5 3"/>';
        var cl = pt(9.5, R - w - 16);
        h += '<text x="' + cl[0] + '" y="' + cl[1] + '" text-anchor="middle" font-size="10" fill="#4a148c" font-weight="700">corte 10</text>';
        var np = pt(r.escore, R - 8);
        h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + np[0] + '" y2="' + np[1] + '" stroke="#263238" stroke-width="4" stroke-linecap="round"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#263238"/>';
        h += '<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#263238">' + r.escore + ' / 21</text>';
        h += '<text x="' + (cx - R) + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#777">0</text><text x="' + (cx + R) + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#777">21</text>';
        return h + '</svg>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="gadv"><h2>&#129504; Resultados GAD-7</h2>';
        h += '<div class="gadv-res" style="background:' + r.f.bg + ';border-color:' + r.f.seg + ';color:' + r.f.fg + '"><b>' + r.f.txt + ' \u2014 ' + r.escore + ' / 21</b>' +
            (r.tag ? 'Acima do corte de rastreio (10): prov\u00e1vel Transtorno de Ansiedade Generalizada' : 'Abaixo do corte de rastreio (10)') + '</div>';
        h += '<h3>&#127919; Veloc\u00edmetro da ansiedade (0 a 21)</h3><div class="gadv-row">' + svgGauge(r) +
            '<div class="gadv-box">O ponteiro mostra o escore total nas quatro faixas oficiais: m\u00ednimo (0-4), leve (5-9), moderado (10-14) e grave (15-21). A linha tracejada marca o corte de rastreio 10, a partir do qual o Transtorno de Ansiedade Generalizada \u00e9 prov\u00e1vel.</div></div>';
        h += '<div class="gadv-mini">';
        h += '<div style="background:' + (r.gad2pos ? '#ffcdd2' : '#c8e6c9') + ';border-color:' + (r.gad2pos ? '#c62828' : '#2e7d32') + ';color:' + (r.gad2pos ? '#b71c1c' : '#1b5e20') + '">GAD-2 (itens 1 e 2)<b>' + r.gad2 + ' / 6 \u2014 ' + (r.gad2pos ? 'positivo' : 'negativo') + '</b>corte: 3 ou mais</div>';
        var fc = r.func === null ? ['#eceff1', '#90a4ae', '#546e7a', 'n\u00e3o respondida'] : (r.func >= 2 ? ['#ffcdd2', '#c62828', '#b71c1c', FUNC[r.func]] : ['#e3f2fd', '#1565c0', '#0d47a1', FUNC[r.func]]);
        h += '<div style="background:' + fc[0] + ';border-color:' + fc[1] + ';color:' + fc[2] + '">Dificuldade funcional<b>' + fc[3] + '</b>trabalho, casa e relacionamentos (n\u00e3o entra na soma)</div>';
        h += '</div>';
        h += '<h3>&#128203; Frequ\u00eancia de cada sintoma (\u00faltimas 2 semanas)</h3>';
        h += '<div style="overflow-x:auto"><table class="gadv-folha"><thead><tr><th>#</th><th style="text-align:left">Sintoma</th>';
        for (k = 0; k < 4; k++) h += '<th class="c">' + RESP[k] + '</th>';
        h += '</tr></thead><tbody>';
        var cores = ['#90a4ae', '#ffca28', '#ff9800', '#e53935'];
        for (i = 0; i < 7; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i]) + (i < 2 ? ' <span style="font-size:.75em;color:#6a1b9a;font-weight:700">(GAD-2)</span>' : '') + '</td>';
            for (k = 0; k < 4; k++) h += '<td class="c"' + (k >= 2 ? ' style="background:#f3e5f5"' : '') + '>' + (r.vals[i] === k ? '<span class="gadv-mk" style="background:' + cores[k] + '" title="' + RESP[k] + '"></span>' : '') + '</td>';
            h += '</tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="gadv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="gadv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#6a1b9a';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function claro(hx, f) { var c = rgb(hx); return [Math.round(c[0] + (255 - c[0]) * f), Math.round(c[1] + (255 - c[1]) * f), Math.round(c[2] + (255 - c[2]) * f)]; }
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
    function gaugePDF(doc, cx, cy, R, w, r) {
        function P(v, rr) { var a = Math.PI * (1 - v / 21); return [cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]; }
        for (var i = 0; i < FAIXAS.length; i++) {
            var a0 = FAIXAS[i].de === 0 ? 0 : FAIXAS[i].de - 0.5, a1 = FAIXAS[i].ate === 21 ? 21 : FAIXAS[i].ate + 0.5;
            var cor = FAIXAS[i] === r.f ? rgb(FAIXAS[i].seg) : claro(FAIXAS[i].seg, 0.5);
            doc.setFillColor(cor[0], cor[1], cor[2]);
            var passos = 24;
            for (var s = 0; s < passos; s++) {
                var v0 = a0 + (a1 - a0) * s / passos, v1 = a0 + (a1 - a0) * (s + 1) / passos + 0.02;
                var p1 = P(v0, R), p2 = P(v1, R), p3 = P(v1, R - w), p4 = P(v0, R - w);
                doc.triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], 'F');
                doc.triangle(p1[0], p1[1], p3[0], p3[1], p4[0], p4[1], 'F');
            }
            var lp = P((FAIXAS[i].de + FAIXAS[i].ate) / 2, R + 5);
            T(doc, FAIXAS[i].fg); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4); doc.text(pt(FAIXAS[i].txt), lp[0], lp[1], {align: 'center'});
        }
        var c1 = P(9.5, R + 1.5), c2 = P(9.5, R - w - 1.5);
        D(doc, '#4a148c'); doc.setLineWidth(0.8);
        if (doc.setLineDashPattern) doc.setLineDashPattern([1.4, 1], 0);
        doc.line(c1[0], c1[1], c2[0], c2[1]);
        if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
        var cl = P(9.5, R - w - 5); T(doc, '#4a148c'); doc.setFontSize(6.6); doc.text('corte 10', cl[0], cl[1], {align: 'center'});
        var np = P(r.escore, R - 3);
        D(doc, '#263238'); doc.setLineWidth(1.4); doc.line(cx, cy, np[0], np[1]);
        F(doc, '#263238'); doc.circle(cx, cy, 2.6, 'F');
        T(doc, '#263238'); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(r.escore + ' / 21', cx, cy + 9, {align: 'center'});
        T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text('0', cx - R, cy + 4, {align: 'center'}); doc.text('21', cx + R, cy + 4, {align: 'center'});
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('GAD-7 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Generalized Anxiety Disorder-7 - Rastreio de Ansiedade Generalizada'), 105, 22, {align: 'center'});
        doc.text(pt('Spitzer et al. (2006) | Vers\u00e3o brasileira: Moreno et al. (2016) | \u00faltimas 2 semanas'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        F(doc, r.f.bg); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, r.f.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, r.f.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.f.txt + ' - ' + r.escore + ' / 21'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.tag ? 'Acima do corte de rastreio (10): prov\u00e1vel Transtorno de Ansiedade Generalizada' : 'Abaixo do corte de rastreio (10)'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'VELOC\u00cdMETRO DA ANSIEDADE (0 a 21)');
        gaugePDF(doc, ML + 48, c.y + 40, 36, 10, r);
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.2);
        doc.text(doc.splitTextToSize(pt('O ponteiro mostra o escore total nas faixas oficiais: m\u00ednimo (0-4), leve (5-9), moderado (10-14) e grave (15-21). A linha tracejada marca o corte de rastreio 10.'), 80), ML + 98, c.y + 8);
        // mini-indicadores
        var mx = ML + 98, my = c.y + 26;
        F(doc, r.gad2pos ? '#ffcdd2' : '#c8e6c9'); doc.roundedRect(mx, my, 82, 11, 2, 2, 'F');
        T(doc, r.gad2pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6);
        doc.text(pt('GAD-2 (itens 1 e 2): ' + r.gad2 + '/6 - ' + (r.gad2pos ? 'positivo' : 'negativo') + ' (corte 3)'), mx + 3, my + 7);
        var fcb = r.func === null ? '#eceff1' : (r.func >= 2 ? '#ffcdd2' : '#e3f2fd'), fct = r.func === null ? '#546e7a' : (r.func >= 2 ? '#b71c1c' : '#0d47a1');
        F(doc, fcb); doc.roundedRect(mx, my + 14, 82, 11, 2, 2, 'F');
        T(doc, fct); doc.text(pt('Dificuldade funcional: ' + (r.func === null ? 'n\u00e3o respondida' : FUNC[r.func].toLowerCase())), mx + 3, my + 21);
        c.y += 56;

        secao(c, 'FREQU\u00caNCIA DE CADA SINTOMA (\u00faltimas 2 semanas)');
        var cn = 8, ct = 92, cc = 20, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F');
        T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.8);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Sintoma', xT + cn + 2, c.y + 4.7);
        for (k = 0; k < 4; k++) doc.text(doc.splitTextToSize(pt(RESP[k]), cc - 1), xT + cn + ct + k * cc + cc / 2, c.y + (RESP[k].length > 14 ? 3 : 4.7), {align: 'center'});
        c.y += 7;
        var cores = ['#90a4ae', '#ffca28', '#ff9800', '#e53935'];
        for (i = 0; i < 7; i++) {
            var rh = 8.5;
            for (k = 2; k < 4; k++) { F(doc, '#f3e5f5'); doc.rect(xT + cn + ct + k * cc, c.y, cc, rh, 'F'); }
            var mk = r.vals[i];
            F(doc, cores[mk]); doc.circle(xT + cn + ct + mk * cc + cc / 2, c.y + rh / 2, 2.3, 'F');
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(String(i + 1), xT + cn / 2, c.y + 5.5, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            doc.text(doc.splitTextToSize(pt(ITENS[i] + (i < 2 ? ' (GAD-2)' : '')), ct - 3), xT + cn + 1.5, c.y + 3.8);
            D(doc, '#e0e0e0'); doc.setLineWidth(0.15); doc.line(xT, c.y + rh, xT + CW, c.y + rh);
            c.y += rh;
        }
        c.y += 6;

        c.need(30);
        secao(c, 'AN\u00c1LISE DO PERFIL');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 4;

        c.need(30);
        secao(c, 'RESPOSTAS DO PACIENTE');
        for (i = 0; i < 7; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(8);
            var tl = doc.splitTextToSize(pt((i + 1) + '. ' + ITENS[i]), 130), hl = tl.length * 3.7 + 2;
            c.need(hl);
            T(doc, '#222222'); doc.text(tl, ML + 3, c.y + 3);
            T(doc, r.vals[i] >= 2 ? '#b71c1c' : '#000000'); doc.setFont(undefined, 'bold');
            doc.text(pt(RESP[r.vals[i]] + ' (' + r.vals[i] + ')'), ML + CW - 2, c.y + 3, {align: 'right'});
            c.y += hl;
        }
        doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        var tf = doc.splitTextToSize(pt(FUNC_PERGUNTA), 130); c.need(tf.length * 3.7 + 4);
        T(doc, '#222222'); doc.text(tf, ML + 3, c.y + 3);
        T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(r.func === null ? 'n\u00e3o respondida' : FUNC[r.func]), ML + CW - 2, c.y + 3, {align: 'right'});
        c.y += tf.length * 3.7 + 6;

        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.3 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.3 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var p = 1; p <= tot; p++) {
            doc.setPage(p);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | GAD-7 | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('GAD7_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'GAD-7' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 7; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals, d.dificuldadeFuncionalValor); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_GAD7 = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, ITENS: ITENS, FUNC: FUNC, FUNC_PERGUNTA: FUNC_PERGUNTA};
})();
