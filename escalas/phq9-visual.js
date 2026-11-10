// phq9-visual.js - Desenho sob medida do PHQ-9 (tela de resultados + PDF da escala e do Painel).
// Calculo oficial (Kroenke, Spitzer & Williams, 2001): soma dos 9 itens (0-3) = 0 a 27; faixas 0-4 minimo, 5-9 leve,
// 10-14 moderado, 15-19 moderadamente grave, 20-27 grave. Corte >= 10 = rastreio positivo para depressao maior
// (sensibilidade 88%, especificidade 88%). PHQ-2 = itens 1 e 2 (0-6), corte >= 3 (Kroenke et al., 2003).
// Algoritmo do PHQ: sintoma "presente" = resposta >= 2 (mais da metade dos dias), exceto o item 9 (>= 1);
// 5 ou mais sintomas incluindo o item 1 ou 2 = padrao de episodio depressivo maior; 2 a 4 = outra sindrome depressiva.
// Item 9: qualquer resposta acima de zero pede avaliacao de risco (1 = atencao; >= 2 = alerta).
// Pergunta oficial de dificuldade funcional (nao entra na soma), opcional.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    var ITENS = [
        'Pouco interesse ou pouco prazer em fazer as coisas',
        'Se sentir para baixo, deprimido(a) ou sem esperan\u00e7a',
        'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume',
        'Se sentir cansado(a) ou com pouca energia',
        'Falta de apetite ou comendo demais',
        'Se sentir mal consigo mesmo(a), ou achar que voc\u00ea \u00e9 um fracasso, ou que decepcionou sua fam\u00edlia ou a voc\u00ea mesmo(a)',
        'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televis\u00e3o',
        'Lentid\u00e3o para se movimentar ou falar, a ponto das outras pessoas perceberem. Ou o contr\u00e1rio: estar t\u00e3o agitado(a) que voc\u00ea fica andando de um lado para o outro mais do que de costume',
        'Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)'
    ];
    var RESP = ['Nenhuma vez', 'V\u00e1rios dias', 'Mais da metade dos dias', 'Quase todos os dias'];
    var FUNC = ['Nenhuma dificuldade', 'Alguma dificuldade', 'Muita dificuldade', 'Extrema dificuldade'];
    var FUNC_PERGUNTA = 'Se voc\u00ea assinalou algum dos problemas acima, quanta dificuldade eles causaram para voc\u00ea realizar seu trabalho, cuidar das coisas em casa ou se relacionar com outras pessoas?';
    var FAIXAS = [
        {de: 0, ate: 4, txt: 'M\u00ednimo', seg: '#4caf50', bg: '#c8e6c9', fg: '#1b5e20'},
        {de: 5, ate: 9, txt: 'Leve', seg: '#9ccc65', bg: '#dcedc8', fg: '#33691e'},
        {de: 10, ate: 14, txt: 'Moderado', seg: '#ff9800', bg: '#ffe0b2', fg: '#bf5600'},
        {de: 15, ate: 19, txt: 'Moderadamente grave', seg: '#f4511e', bg: '#ffccbc', fg: '#bf360c'},
        {de: 20, ate: 27, txt: 'Grave', seg: '#d32f2f', bg: '#ffcdd2', fg: '#b71c1c'}
    ];
    var REFS = [
        'KROENKE, K.; SPITZER, R. L.; WILLIAMS, J. B. W. The PHQ-9: validity of a brief depression severity measure. Journal of General Internal Medicine, v. 16, n. 9, p. 606-613, 2001. DOI: 10.1046/j.1525-1497.2001.016009606.x.',
        'KROENKE, K.; SPITZER, R. L.; WILLIAMS, J. B. W. The Patient Health Questionnaire-2: validity of a two-item depression screener. Medical Care, v. 41, n. 11, p. 1284-1292, 2003.',
        'SANTOS, I. S. et al. Sensibilidade e especificidade do Patient Health Questionnaire-9 (PHQ-9) entre adultos da popula\u00e7\u00e3o geral. Cadernos de Sa\u00fade P\u00fablica, v. 29, n. 8, p. 1533-1543, 2013.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O PHQ-9 \u00e9 um instrumento de rastreio e de acompanhamento da gravidade de sintomas depressivos nas \u00faltimas 2 semanas. Um escore de 10 ou mais indica rastreio positivo para depress\u00e3o maior, mas n\u00e3o fecha diagn\u00f3stico: \u00e9 preciso investigar tamb\u00e9m transtorno bipolar, luto, uso de subst\u00e2ncias, condi\u00e7\u00f5es m\u00e9dicas e efeitos de medicamentos. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';
    var TXT = {
        'M\u00ednimo': 'Escore na faixa m\u00ednima: o relato das \u00faltimas duas semanas n\u00e3o indica sintomas depressivos relevantes.',
        'Leve': 'Escore na faixa leve: h\u00e1 alguns sintomas depressivos, geralmente sem preju\u00edzo marcante. Vale monitorar a evolu\u00e7\u00e3o.',
        'Moderado': 'Escore na faixa moderada: os sintomas depressivos aparecem com frequ\u00eancia relevante. Est\u00e1 no n\u00edvel do corte de rastreio (10) e justifica avalia\u00e7\u00e3o cl\u00ednica aprofundada.',
        'Moderadamente grave': 'Escore na faixa moderadamente grave: os sintomas depressivos s\u00e3o frequentes e intensos. Indica necessidade de avalia\u00e7\u00e3o e tratamento ativos.',
        'Grave': 'Escore na faixa grave: os sintomas depressivos est\u00e3o presentes na maior parte dos dias, com intensidade alta. Indica necessidade de avalia\u00e7\u00e3o e cuidado cl\u00ednico priorit\u00e1rios.'
    };
    function faixa(e) { for (var i = 0; i < FAIXAS.length; i++) { if (e <= FAIXAS[i].ate) return FAIXAS[i]; } return FAIXAS[4]; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    // ===================== CALCULO =====================
    // vals: 9 respostas (0-3); func: indice 0-3 da pergunta de dificuldade (ou null)
    function calcular(vals, func) {
        if (!vals || vals.length !== 9) throw new Error('PHQ-9: respostas incompletas');
        var r = {vals: [], escore: 0, sint: []}, i;
        for (i = 0; i < 9; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('PHQ-9: resposta invalida no item ' + (i + 1));
            r.vals.push(v); r.escore += v;
            if (i < 8 ? v >= 2 : v >= 1) r.sint.push(i + 1);
        }
        r.f = faixa(r.escore);
        r.rastreio = r.escore >= 10;
        r.phq2 = r.vals[0] + r.vals[1];
        r.phq2pos = r.phq2 >= 3;
        r.critA = (r.vals[0] >= 2 || r.vals[1] >= 2);
        r.nSint = r.sint.length;
        r.algoritmo = (r.nSint >= 5 && r.critA) ? 'maior' : ((r.nSint >= 2 && r.critA) ? 'outra' : 'nao');
        r.risco = r.vals[8] >= 2 ? 2 : (r.vals[8] >= 1 ? 1 : 0);
        var fv = parseInt(func, 10);
        r.func = (fv >= 0 && fv <= 3) ? fv : null;
        return r;
    }
    function classifGeral(r) {
        return r.f.txt + (r.risco ? ' | ATENCAO: item 9 positivo (avaliar risco de suicidio)' : '');
    }
    function dadosPainel(r) {
        return {
            Total: {pontuacao: r.escore, max: 27, classificacao: r.f.txt + (r.rastreio ? ' - acima do corte de rastreio (>=10)' : ' - abaixo do corte de rastreio (<10)')},
            'PHQ-2': {pontuacao: r.phq2, max: 6, classificacao: r.phq2pos ? 'Positivo (>=3)' : 'Negativo (<3)'}
        };
    }
    function alertaTexto(r) {
        if (!r.risco) return null;
        return {
            nivel: r.risco,
            titulo: r.risco >= 2 ? 'ALERTA DE RISCO DE SUIC\u00cdDIO' : 'ATEN\u00c7\u00c3O: PENSAMENTOS DE MORTE OU DE SE FERIR',
            texto: 'O item 9 (pensar em se ferir ou que seria melhor estar morto) foi marcado como "' + RESP[r.vals[8]] + '". ' +
                (r.risco >= 2 ? 'Resposta em "mais da metade dos dias" ou mais: recomenda-se avalia\u00e7\u00e3o cl\u00ednica de risco de suic\u00eddio imediata. ' : 'Qualquer resposta acima de zero neste item pede avalia\u00e7\u00e3o cl\u00ednica de risco na mesma consulta. ') +
                'Em caso de risco imediato: CVV 188 (24 horas) ou SAMU 192.'
        };
    }
    function analise(r) {
        var out = [], i;
        out.push({t: 'Gravidade', x: 'Escore total ' + r.escore + ' de 27. ' + TXT[r.f.txt]});
        out.push({t: 'Rastreio de depress\u00e3o maior (corte 10)', x: r.rastreio ?
            'Escore igual ou acima de 10: rastreio POSITIVO para depress\u00e3o maior (no estudo original, sensibilidade de 88% e especificidade de 88%; na valida\u00e7\u00e3o brasileira, 77,5% e 86,7%).' :
            'Escore abaixo de 10: rastreio negativo para depress\u00e3o maior pelo corte do estudo original (sensibilidade de 88% e especificidade de 88%; na valida\u00e7\u00e3o brasileira, 77,5% e 86,7%).'});
        out.push({t: 'PHQ-2 (itens 1 e 2)', x: 'Soma ' + r.phq2 + ' de 6 nos dois itens centrais (anedonia e humor deprimido). ' + (r.phq2pos ? 'Igual ou acima do corte 3: rastreio ultracurto positivo (sensibilidade 83%, especificidade 92%).' : 'Abaixo do corte 3: rastreio ultracurto negativo.')});
        var alg = r.algoritmo === 'maior' ? 'O padr\u00e3o de respostas atende ao algoritmo do PHQ para epis\u00f3dio depressivo maior (5 ou mais sintomas presentes, incluindo humor deprimido ou perda de interesse). \u00c9 um padr\u00e3o sugestivo, n\u00e3o um diagn\u00f3stico.' :
            (r.algoritmo === 'outra' ? 'O padr\u00e3o de respostas atende ao algoritmo do PHQ para outra s\u00edndrome depressiva (2 a 4 sintomas presentes, incluindo humor deprimido ou perda de interesse).' :
                'O padr\u00e3o de respostas n\u00e3o atende ao algoritmo do PHQ para s\u00edndrome depressiva (que exige 2 ou mais sintomas presentes, incluindo humor deprimido ou perda de interesse).');
        out.push({t: 'Sintomas presentes', x: r.nSint + ' sintoma(s) presente(s) (resposta em "mais da metade dos dias" ou mais; no item 9, qualquer resposta acima de zero)' + (r.sint.length ? ': itens ' + r.sint.join(', ') + '. ' : '. ') + alg + ' O algoritmo original tamb\u00e9m considera o preju\u00edzo funcional (pergunta final).'});
        out.push({t: 'Dificuldade funcional', x: r.func === null ? 'A pergunta sobre dificuldade funcional n\u00e3o foi respondida.' : 'Relatada: ' + FUNC[r.func].toLowerCase() + ' para trabalhar, cuidar das coisas em casa ou se relacionar com outras pessoas.' + (r.func >= 2 ? ' Indica preju\u00edzo funcional relevante.' : '')});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.phqv h2{color:#1565c0;margin-bottom:16px;text-align:center}' +
        '.phqv h3{color:#1565c0;margin:26px 0 10px;font-size:1.12em}' +
        '.phqv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.phqv-res b{font-size:1.6em;display:block}' +
        '.phqv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.phqv-row{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.phqv-row>.phqv-box{flex:1 1 260px;margin:0}' +
        '.phqv-mini{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}.phqv-mini>div{flex:1 1 200px;border-radius:10px;padding:12px 14px;font-size:.88em;border:2px solid}' +
        '.phqv-mini b{display:block;font-size:1.25em}' +
        '.phqv-folha{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.phqv-folha th{background:#1565c0;color:#fff;padding:7px 4px}.phqv-folha td{padding:7px 6px;border-bottom:1px solid #eee}' +
        '.phqv-folha td.c{text-align:center;width:80px}' +
        '.phqv-mk{display:inline-block;width:20px;height:20px;border-radius:50%}' +
        '.phqv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '@media(max-width:768px){.phqv-folha td.c{width:40px}.phqv-folha th{font-size:.7em}}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('phqv-css')) return;
        var st = document.createElement('style'); st.id = 'phqv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    // velocimetro em SVG (semicirculo 0-27)
    function svgGauge(r) {
        var cx = 150, cy = 140, R = 110, w = 30, M = 27, h = '<svg width="300" height="185" viewBox="0 0 300 185" role="img" aria-label="Veloc\u00edmetro do escore PHQ-9">';
        function ang(v) { return Math.PI * (1 - v / M); }
        function pt(v, rr) { var a = ang(v); return [(cx + Math.cos(a) * rr).toFixed(2), (cy - Math.sin(a) * rr).toFixed(2)]; }
        for (var i = 0; i < FAIXAS.length; i++) {
            var a0 = FAIXAS[i].de === 0 ? 0 : FAIXAS[i].de - 0.5, a1 = FAIXAS[i].ate === M ? M : FAIXAS[i].ate + 0.5;
            var p1 = pt(a0, R), p2 = pt(a1, R), p3 = pt(a1, R - w), p4 = pt(a0, R - w);
            h += '<path d="M' + p1[0] + ' ' + p1[1] + ' A' + R + ' ' + R + ' 0 0 1 ' + p2[0] + ' ' + p2[1] + ' L' + p3[0] + ' ' + p3[1] + ' A' + (R - w) + ' ' + (R - w) + ' 0 0 0 ' + p4[0] + ' ' + p4[1] + ' Z" fill="' + FAIXAS[i].seg + '"' + (FAIXAS[i] === r.f ? '' : ' opacity="0.45"') + '/>';
        }
        var c1 = pt(9.5, R + 4), c2 = pt(9.5, R - w - 4);
        h += '<line x1="' + c1[0] + '" y1="' + c1[1] + '" x2="' + c2[0] + '" y2="' + c2[1] + '" stroke="#4a148c" stroke-width="3" stroke-dasharray="5 3"/>';
        var cl = pt(9.5, R - w - 16);
        h += '<text x="' + cl[0] + '" y="' + cl[1] + '" text-anchor="middle" font-size="10" fill="#4a148c" font-weight="700">corte 10</text>';
        var np = pt(r.escore, R - 8);
        h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + np[0] + '" y2="' + np[1] + '" stroke="#263238" stroke-width="4" stroke-linecap="round"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#263238"/>';
        h += '<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#263238">' + r.escore + ' / 27</text>';
        h += '<text x="' + (cx - R) + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#777">0</text><text x="' + (cx + R) + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#777">27</text>';
        return h + '</svg>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="phqv"><h2>&#129504; Resultados PHQ-9</h2>';
        h += '<div class="phqv-res" style="background:' + r.f.bg + ';border-color:' + r.f.seg + ';color:' + r.f.fg + '"><b>' + r.f.txt + ' \u2014 ' + r.escore + ' / 27</b>' +
            (r.rastreio ? 'Acima do corte de rastreio (10): rastreio positivo para depress\u00e3o maior' : 'Abaixo do corte de rastreio (10)') + '</div>';
        var al = alertaTexto(r);
        if (al) {
            var c = al.nivel >= 2 ? ['#ffebee', '#c62828', '#b71c1c'] : ['#fff8e1', '#f9a825', '#e65100'];
            h += '<div style="background:' + c[0] + ';border:3px solid ' + c[1] + ';color:' + c[2] + ';border-radius:12px;padding:16px;margin:14px 0"><h3 style="margin:0 0 8px;color:' + c[2] + '">&#9888;&#65039; ' + al.titulo + '</h3><p style="line-height:1.7">' + esc(al.texto) + '</p></div>';
        }
        h += '<h3>&#127919; Veloc\u00edmetro da depress\u00e3o (0 a 27)</h3><div class="phqv-row">' + svgGauge(r) +
            '<div class="phqv-box">O ponteiro mostra o escore total nas cinco faixas oficiais: m\u00ednimo (0-4), leve (5-9), moderado (10-14), moderadamente grave (15-19) e grave (20-27). A linha tracejada marca o corte de rastreio 10.</div></div>';
        h += '<div class="phqv-mini">';
        h += '<div style="background:' + (r.phq2pos ? '#ffcdd2' : '#c8e6c9') + ';border-color:' + (r.phq2pos ? '#c62828' : '#2e7d32') + ';color:' + (r.phq2pos ? '#b71c1c' : '#1b5e20') + '">PHQ-2 (itens 1 e 2)<b>' + r.phq2 + ' / 6 \u2014 ' + (r.phq2pos ? 'positivo' : 'negativo') + '</b>corte: 3 ou mais</div>';
        h += '<div style="background:#e3f2fd;border-color:#1565c0;color:#0d47a1">Sintomas presentes<b>' + r.nSint + ' de 9</b>' + (r.algoritmo === 'maior' ? 'padr\u00e3o de epis\u00f3dio depressivo maior' : (r.algoritmo === 'outra' ? 'padr\u00e3o de outra s\u00edndrome depressiva' : 'abaixo do algoritmo do PHQ')) + '</div>';
        var fc = r.func === null ? ['#eceff1', '#90a4ae', '#546e7a', 'n\u00e3o respondida'] : (r.func >= 2 ? ['#ffcdd2', '#c62828', '#b71c1c', FUNC[r.func]] : ['#e3f2fd', '#1565c0', '#0d47a1', FUNC[r.func]]);
        h += '<div style="background:' + fc[0] + ';border-color:' + fc[1] + ';color:' + fc[2] + '">Dificuldade funcional<b>' + fc[3] + '</b>trabalho, casa e relacionamentos (n\u00e3o entra na soma)</div>';
        h += '</div>';
        h += '<h3>&#128203; Frequ\u00eancia de cada sintoma (\u00faltimas 2 semanas)</h3>';
        h += '<div style="overflow-x:auto"><table class="phqv-folha"><thead><tr><th>#</th><th style="text-align:left">Sintoma</th>';
        for (k = 0; k < 4; k++) h += '<th class="c">' + RESP[k] + '</th>';
        h += '</tr></thead><tbody>';
        var cores = ['#90a4ae', '#ffca28', '#ff9800', '#e53935'];
        for (i = 0; i < 9; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i]) + (i < 2 ? ' <span style="font-size:.75em;color:#4a148c;font-weight:700">(PHQ-2)</span>' : '') + (i === 8 ? ' <span style="font-size:.75em;color:#c62828;font-weight:700">(avaliar risco se acima de zero)</span>' : '') + '</td>';
            for (k = 0; k < 4; k++) h += '<td class="c"' + (k >= 2 ? ' style="background:#e3f2fd"' : '') + '>' + (r.vals[i] === k ? '<span class="phqv-mk" style="background:' + (i === 8 && k >= 1 ? '#c62828' : cores[k]) + '" title="' + RESP[k] + '"></span>' : '') + '</td>';
            h += '</tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="phqv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="phqv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#1565c0';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function claro(hx, f) { var c = rgb(hx); return [Math.round(c[0] + (255 - c[0]) * f), Math.round(c[1] + (255 - c[1]) * f), Math.round(c[2] + (255 - c[2]) * f)]; }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
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
        var M = 27;
        function P(v, rr) { var a = Math.PI * (1 - v / M); return [cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]; }
        for (var i = 0; i < FAIXAS.length; i++) {
            var a0 = FAIXAS[i].de === 0 ? 0 : FAIXAS[i].de - 0.5, a1 = FAIXAS[i].ate === M ? M : FAIXAS[i].ate + 0.5;
            var cor = FAIXAS[i] === r.f ? rgb(FAIXAS[i].seg) : claro(FAIXAS[i].seg, 0.5);
            doc.setFillColor(cor[0], cor[1], cor[2]);
            var passos = 24;
            for (var s = 0; s < passos; s++) {
                var v0 = a0 + (a1 - a0) * s / passos, v1 = a0 + (a1 - a0) * (s + 1) / passos + 0.02;
                var p1 = P(v0, R), p2 = P(v1, R), p3 = P(v1, R - w), p4 = P(v0, R - w);
                doc.triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], 'F');
                doc.triangle(p1[0], p1[1], p3[0], p3[1], p4[0], p4[1], 'F');
            }
        }
        var c1 = P(9.5, R + 1.5), c2 = P(9.5, R - w - 1.5);
        D(doc, '#4a148c'); doc.setLineWidth(0.8);
        if (doc.setLineDashPattern) doc.setLineDashPattern([1.4, 1], 0);
        doc.line(c1[0], c1[1], c2[0], c2[1]);
        if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
        var cl = P(9.5, R - w - 5); T(doc, '#4a148c'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.6); doc.text('corte 10', cl[0], cl[1], {align: 'center'});
        var np = P(r.escore, R - 3);
        D(doc, '#263238'); doc.setLineWidth(1.4); doc.line(cx, cy, np[0], np[1]);
        F(doc, '#263238'); doc.circle(cx, cy, 2.6, 'F');
        T(doc, '#263238'); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(r.escore + ' / 27', cx, cy + 9, {align: 'center'});
        T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text('0', cx - R, cy + 4, {align: 'center'}); doc.text('27', cx + R, cy + 4, {align: 'center'});
        // legenda das faixas
        var ly = cy + 19.5;
        doc.setFontSize(6.6);
        for (var j = 0; j < FAIXAS.length; j++) {
            var lx = ML + j * 36;
            F(doc, FAIXAS[j].seg); doc.rect(lx, ly - 2.4, 2.8, 2.8, 'F');
            T(doc, FAIXAS[j].fg); doc.setFont(undefined, 'bold'); doc.text(pt(FAIXAS[j].txt + ' ' + FAIXAS[j].de + '-' + FAIXAS[j].ate), lx + 4, ly);
        }
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('PHQ-9 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Patient Health Questionnaire-9 - Rastreio de Depress\u00e3o'), 105, 22, {align: 'center'});
        doc.text(pt('Kroenke, Spitzer & Williams (2001) | Valida\u00e7\u00e3o brasileira: Santos et al. (2013) | \u00faltimas 2 semanas'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        F(doc, r.f.bg); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, r.f.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, r.f.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.f.txt + ' - ' + r.escore + ' / 27'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.rastreio ? 'Acima do corte de rastreio (10): rastreio positivo para depress\u00e3o maior' : 'Abaixo do corte de rastreio (10)'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        var al = alertaTexto(r);
        if (al) {
            var cc = al.nivel >= 2 ? ['#ffebee', '#c62828', '#b71c1c'] : ['#fff8e1', '#f9a825', '#e65100'];
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.6);
            var aln = doc.splitTextToSize(pt(al.texto), CW - 10), ah = aln.length * 4 + 12;
            c.need(ah + 4);
            F(doc, cc[0]); doc.rect(ML, c.y, CW, ah, 'F'); D(doc, cc[1]); doc.setLineWidth(0.8); doc.rect(ML, c.y, CW, ah, 'S');
            T(doc, cc[2]); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt(al.titulo), 105, c.y + 6, {align: 'center'});
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.6); doc.text(aln, ML + 5, c.y + 11.5);
            c.y += ah + 5;
        }

        secao(c, 'VELOC\u00cdMETRO DA DEPRESS\u00c3O (0 a 27)');
        c.need(66);
        gaugePDF(doc, ML + 48, c.y + 40, 36, 10, r);
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.2);
        doc.text(doc.splitTextToSize(pt('O ponteiro mostra o escore total nas faixas oficiais. A linha tracejada marca o corte de rastreio 10.'), 80), ML + 98, c.y + 6);
        var mx = ML + 98, my = c.y + 18;
        F(doc, r.phq2pos ? '#ffcdd2' : '#c8e6c9'); doc.roundedRect(mx, my, 82, 11, 2, 2, 'F');
        T(doc, r.phq2pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.4);
        doc.text(pt('PHQ-2 (itens 1 e 2): ' + r.phq2 + '/6 - ' + (r.phq2pos ? 'positivo' : 'negativo') + ' (corte 3)'), mx + 3, my + 7);
        F(doc, '#e3f2fd'); doc.roundedRect(mx, my + 14, 82, 11, 2, 2, 'F');
        T(doc, '#0d47a1'); doc.text(pt('Sintomas presentes: ' + r.nSint + ' de 9'), mx + 3, my + 21);
        var fcb = r.func === null ? '#eceff1' : (r.func >= 2 ? '#ffcdd2' : '#e3f2fd'), fct = r.func === null ? '#546e7a' : (r.func >= 2 ? '#b71c1c' : '#0d47a1');
        F(doc, fcb); doc.roundedRect(mx, my + 28, 82, 11, 2, 2, 'F');
        T(doc, fct); doc.text(pt('Dificuldade funcional: ' + (r.func === null ? 'n\u00e3o respondida' : FUNC[r.func].toLowerCase())), mx + 3, my + 35);
        c.y += 64;

        c.need(106);
        secao(c, 'FREQU\u00caNCIA DE CADA SINTOMA (\u00faltimas 2 semanas)');
        var cn = 8, ct = 92, cw2 = 20, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 8, 'F');
        T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.8);
        doc.text('#', xT + cn / 2, c.y + 5, {align: 'center'}); doc.text('Sintoma', xT + cn + 2, c.y + 5);
        for (k = 0; k < 4; k++) doc.text(doc.splitTextToSize(pt(RESP[k]), cw2 - 1), xT + cn + ct + k * cw2 + cw2 / 2, c.y + (RESP[k].length > 14 ? 3 : 5), {align: 'center'});
        c.y += 8;
        var cores = ['#90a4ae', '#ffca28', '#ff9800', '#e53935'];
        for (i = 0; i < 9; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            var tl = doc.splitTextToSize(pt(ITENS[i] + (i < 2 ? ' (PHQ-2)' : '')), ct - 3), rh = Math.max(7.8, tl.length * 3.4 + 4.2);
            c.need(rh);
            for (k = 2; k < 4; k++) { F(doc, '#e3f2fd'); doc.rect(xT + cn + ct + k * cw2, c.y, cw2, rh, 'F'); }
            var mk = r.vals[i];
            F(doc, (i === 8 && mk >= 1) ? '#c62828' : cores[mk]); doc.circle(xT + cn + ct + mk * cw2 + cw2 / 2, c.y + rh / 2, 2.3, 'F');
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1.2, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            doc.text(tl, xT + cn + 1.5, c.y + 3.8);
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
            doc.text('SYM Online | PHQ-9 | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('PHQ9_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'PHQ-9' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 9; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals, d.dificuldadeFuncionalValor); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_PHQ9 = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        ITENS: ITENS, FUNC: FUNC, FUNC_PERGUNTA: FUNC_PERGUNTA};
})();
