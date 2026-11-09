// asrs18-visual.js - Desenho sob medida da ASRS-18 (tela de resultados + PDF da escala e do Painel).
// Calcula, monta a tela e gera o PDF com os MESMOS dados, para tudo sair igual.
//
// PONTOS DE CORTE OFICIAIS (ASRS v1.1 / OMS, escala 0-4) - corrigidos em 2026-11-09:
//   item conta como sintoma a partir de "As vezes" (2): itens 1, 2, 3, 9, 12, 16 e 18
//   item conta como sintoma a partir de "Frequentemente" (3): demais itens
//   Parte A (itens 1 a 6): 4 ou mais itens no corte = rastreio positivo.
// (Antes os cortes estavam um nivel acima, como se a escala fosse 1-5.)
//
// Comparacao com o DSM-5-TR (apoio de leitura, decisao do neuropsicologo): adultos (17+) precisam de
// 5 ou mais sintomas de desatencao e/ou de hiperatividade-impulsividade. A ASRS v1.1 foi construida
// sobre o DSM-IV; a contagem nao e ponto de corte validado da escala.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var ITENS = [
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para finalizar os detalhes finais de um projeto, depois que as partes mais dif\u00edceis j\u00e1 foram feitas?', dom: 'D', parte: 'A', corte: 2},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para colocar as coisas em ordem quando precisa realizar uma tarefa que exige organiza\u00e7\u00e3o?', dom: 'D', parte: 'A', corte: 2},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem problemas para lembrar de compromissos ou obriga\u00e7\u00f5es?', dom: 'D', parte: 'A', corte: 2},
        {texto: 'Quando voc\u00ea tem uma tarefa que exige muita concentra\u00e7\u00e3o, com que frequ\u00eancia voc\u00ea evita ou adia o in\u00edcio?', dom: 'D', parte: 'A', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea fica se mexendo na cadeira ou balan\u00e7ando as m\u00e3os ou os p\u00e9s quando precisa ficar sentado(a) por muito tempo?', dom: 'HI', parte: 'A', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea se sente excessivamente ativo(a) e compelido(a) a fazer coisas, como se estivesse "movido(a) por um motor"?', dom: 'HI', parte: 'A', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea comete erros por falta de aten\u00e7\u00e3o quando tem de trabalhar num projeto chato ou dif\u00edcil?', dom: 'D', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para manter a aten\u00e7\u00e3o quando est\u00e1 fazendo um trabalho chato ou repetitivo?', dom: 'D', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas est\u00e3o falando diretamente com voc\u00ea?', dom: 'D', parte: 'B', corte: 2},
        {texto: 'Com que frequ\u00eancia voc\u00ea coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?', dom: 'D', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea se distrai com atividades ou barulho ao seu redor?', dom: 'D', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea levanta da cadeira em reuni\u00f5es ou em outras situa\u00e7\u00f5es onde deveria ficar sentado(a)?', dom: 'HI', parte: 'B', corte: 2},
        {texto: 'Com que frequ\u00eancia voc\u00ea se sente inquieto(a) ou agitado(a)?', dom: 'HI', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para sossegar e relaxar quando tem tempo livre para si?', dom: 'HI', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea se pega falando demais em situa\u00e7\u00f5es sociais?', dom: 'HI', parte: 'B', corte: 3},
        {texto: 'Quando voc\u00ea est\u00e1 conversando, com que frequ\u00eancia voc\u00ea se pega terminando as frases das pessoas antes delas?', dom: 'HI', parte: 'B', corte: 2},
        {texto: 'Com que frequ\u00eancia voc\u00ea tem dificuldade para esperar nas situa\u00e7\u00f5es em que \u00e9 necess\u00e1rio aguardar a sua vez?', dom: 'HI', parte: 'B', corte: 3},
        {texto: 'Com que frequ\u00eancia voc\u00ea interrompe os outros quando eles est\u00e3o ocupados?', dom: 'HI', parte: 'B', corte: 2}
    ];
    var RESP = ['Nunca', 'Raramente', '\u00c0s vezes', 'Frequentemente', 'Muito frequentemente'];
    var RESP_CURTO = ['Nunca', 'Raramente', '\u00c0s vezes', 'Frequente', 'Muito freq.'];
    var LIM_A = 4, LIM_DSM = 5;
    var DOMS = [
        {k: 'D', nome: 'Desaten\u00e7\u00e3o', chave: 'Desatencao', cor: '#1565c0', bg: '#e3f2fd',
            desc: 'Dificuldade de organiza\u00e7\u00e3o, de manter a aten\u00e7\u00e3o, de concluir tarefas, esquecimentos e distra\u00e7\u00e3o.'},
        {k: 'HI', nome: 'Hiperatividade / Impulsividade', chave: 'Hiperatividade', cor: '#00897b', bg: '#e0f2f1',
            desc: 'Inquieta\u00e7\u00e3o, sensa\u00e7\u00e3o de "motor ligado", dificuldade de esperar, falar demais e interromper.'}
    ];
    var REFS = [
        'KESSLER, R. C. et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population. Psychological Medicine, v. 35, n. 2, p. 245-256, 2005.',
        'MATTOS, P.; SEGENREICH, D.; SABOYA, E.; LOUZ\u00c3, M.; DIAS, G.; ROMANO, M. Adapta\u00e7\u00e3o transcultural para o portugu\u00eas da escala Adult Self-Report Scale para avalia\u00e7\u00e3o do transtorno de d\u00e9ficit de aten\u00e7\u00e3o/hiperatividade (TDAH) em adultos. Revista de Psiquiatria Cl\u00ednica, v. 33, n. 4, p. 188-194, 2006.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var NIVMED = [
        {max: 1.0, txt: 'Baixa', seg: '#66bb6a', bg: '#c8e6c9', fg: '#1b5e20'},
        {max: 2.0, txt: 'Leve', seg: '#d4e157', bg: '#f0f4c3', fg: '#5f6b00'},
        {max: 3.0, txt: 'Moderada', seg: '#ffa726', bg: '#ffe0b2', fg: '#bf5600'},
        {max: 9, txt: 'Elevada', seg: '#e53935', bg: '#ffcdd2', fg: '#b71c1c'}
    ];
    function nivMedia(m) { for (var i = 0; i < NIVMED.length; i++) { if (m < NIVMED[i].max) return NIVMED[i]; } return NIVMED[NIVMED.length - 1]; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function fmt(n, d) { return Number(n).toFixed(d === undefined ? 2 : d).replace('.', ','); }

    // ===================== CALCULO =====================
    function calcular(vals) {
        if (!vals || vals.length !== ITENS.length) throw new Error('ASRS-18: respostas incompletas');
        var i, k, r = {vals: [], acima: [], partA: 0, dom: [], muito: []};
        for (i = 0; i < ITENS.length; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 4)) throw new Error('ASRS-18: resposta invalida no item ' + (i + 1));
            r.vals.push(v);
            var ac = v >= ITENS[i].corte;
            r.acima.push(ac);
            if (ac && ITENS[i].parte === 'A') r.partA++;
            if (v === 4) r.muito.push(i + 1);
        }
        r.positivo = r.partA >= LIM_A;
        r.totalAcima = 0;
        for (i = 0; i < r.acima.length; i++) if (r.acima[i]) r.totalAcima++;
        for (k = 0; k < DOMS.length; k++) {
            var Dm = DOMS[k], soma = 0, n = 0, sint = 0, itens = [];
            for (i = 0; i < ITENS.length; i++) {
                if (ITENS[i].dom !== Dm.k) continue;
                soma += r.vals[i]; n++; itens.push(i + 1); if (r.acima[i]) sint++;
            }
            var media = soma / n;
            r.dom.push({k: Dm.k, nome: Dm.nome, chave: Dm.chave, cor: Dm.cor, bg: Dm.bg, desc: Dm.desc, soma: soma, max: n * 4, n: n,
                media: parseFloat(media.toFixed(2)), mediaRaw: media, niv: nivMedia(media), sint: sint, dsm: sint >= LIM_DSM, itens: itens});
        }
        var dD = r.dom[0].dsm, dH = r.dom[1].dsm;
        r.apresentacao = dD && dH ? 'Combinada' : (dD ? 'Predominantemente desatenta' : (dH ? 'Predominantemente hiperativa/impulsiva' : 'Abaixo da contagem do DSM-5-TR'));
        r.classificacao = (r.positivo ? 'Rastreio Positivo' : 'Rastreio Negativo') + ' (' + r.partA + '/6) | DSM-5-TR: ' + r.dom[0].sint + '/9 desatencao, ' + r.dom[1].sint + '/9 hiperatividade-impulsividade';
        return r;
    }
    function classDominio(d) { return (d.dsm ? 'Acima do limiar DSM-5-TR' : 'Abaixo do limiar DSM-5-TR') + ' (' + d.sint + '/9 sintomas)'; }
    // Dados para o painel (mesmo formato de sempre + campos novos)
    function dadosPainel(r) {
        var o = {};
        for (var i = 0; i < r.dom.length; i++) {
            var d = r.dom[i];
            o[d.chave] = {pontuacao: d.soma, max: d.max, media: d.media, classificacao: classDominio(d), sintomas: d.sint};
        }
        return o;
    }

    function analise(r) {
        var out = [], D = r.dom[0], H = r.dom[1];
        out.push({t: 'Parte A (rastreio da OMS)', x: r.partA + ' dos 6 itens da Parte A atingiram o ponto de corte (limiar: 4 ou mais). ' +
            (r.positivo ? 'Rastreio POSITIVO: os sintomas relatados s\u00e3o altamente compat\u00edveis com TDAH em adultos e justificam investiga\u00e7\u00e3o cl\u00ednica aprofundada.' : 'Rastreio negativo: pela Parte A, os sintomas relatados n\u00e3o atingem o padr\u00e3o de rastreio do TDAH em adultos.')});
        out.push({t: 'Contagem de sintomas (DSM-5-TR)', x: 'Desaten\u00e7\u00e3o: ' + D.sint + ' de 9 sintomas no ponto de corte. Hiperatividade/impulsividade: ' + H.sint + ' de 9. Para adultos, o DSM-5-TR pede 5 ou mais sintomas em pelo menos um dos dois dom\u00ednios.'});
        var ap;
        if (r.apresentacao === 'Combinada') ap = 'A contagem atinge o limiar nos dois dom\u00ednios, padr\u00e3o compat\u00edvel com a apresenta\u00e7\u00e3o combinada.';
        else if (D.dsm) ap = 'A contagem atinge o limiar apenas em desaten\u00e7\u00e3o, padr\u00e3o compat\u00edvel com a apresenta\u00e7\u00e3o predominantemente desatenta.';
        else if (H.dsm) ap = 'A contagem atinge o limiar apenas em hiperatividade/impulsividade, padr\u00e3o compat\u00edvel com a apresenta\u00e7\u00e3o predominantemente hiperativa/impulsiva.';
        else ap = 'Nenhum dos dois dom\u00ednios atinge a contagem de 5 sintomas.';
        ap += ' Lembrete: o DSM-5-TR tamb\u00e9m exige in\u00edcio antes dos 12 anos, presen\u00e7a em dois ou mais contextos e preju\u00edzo funcional, aspectos que a ASRS n\u00e3o avalia.';
        out.push({t: 'Apresenta\u00e7\u00e3o sugerida pela contagem', x: ap});
        out.push({t: 'Intensidade por dom\u00ednio', x: 'Desaten\u00e7\u00e3o: m\u00e9dia ' + fmt(D.media) + ' (de 0 a 4), intensidade ' + D.niv.txt.toLowerCase() + '. Hiperatividade/impulsividade: m\u00e9dia ' + fmt(H.media) + ', intensidade ' + H.niv.txt.toLowerCase() + '.'});
        out.push({t: 'Itens mais frequentes', x: r.muito.length ? 'Itens marcados como "Muito frequentemente": ' + r.muito.join(', ') + '. Vale explor\u00e1-los na entrevista cl\u00ednica.' : 'Nenhum item foi marcado como "Muito frequentemente".'});
        return out;
    }
    var AVISO = 'A ASRS-18 \u00e9 um instrumento de rastreio para TDAH em adultos (refer\u00eancia: \u00faltimos 6 meses). A Parte A \u00e9 o rastreio principal; resultado positivo indica necessidade de avalia\u00e7\u00e3o cl\u00ednica especializada. N\u00e3o \u00e9 diagn\u00f3stico. A compara\u00e7\u00e3o com o DSM-5-TR \u00e9 um apoio de leitura: a ASRS v1.1 foi constru\u00edda sobre o DSM-IV e a contagem n\u00e3o \u00e9 ponto de corte validado da escala.';
    var NOTA_RECALC = 'Resultado recalculado com os pontos de corte oficiais da ASRS v1.1 (OMS). Este registro foi feito antes da corre\u00e7\u00e3o dos cortes no site (09/11/2026); a classifica\u00e7\u00e3o mostrada aqui pode ser diferente da registrada originalmente.';

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.asrsv h2{color:#1565c0;margin-bottom:16px;text-align:center}' +
        '.asrsv h3{color:#1565c0;margin:26px 0 10px;font-size:1.12em}' +
        '.asrsv-rast{padding:18px;border-radius:12px;text-align:center;margin:10px 0;font-size:1.1em;font-weight:700}' +
        '.asrsv-pos{background:#ffcdd2;border:3px solid #c62828;color:#b71c1c}.asrsv-neg{background:#c8e6c9;border:3px solid #2e7d32;color:#1b5e20}' +
        '.asrsv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.asrsv-slots{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:20px 0 6px}' +
        '.asrsv-slot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9em;background:#eceff1;color:#90a4ae}' +
        '.asrsv-lim{width:0;height:44px;border-left:3px dashed #b71c1c;margin:0 3px;position:relative}' +
        '.asrsv-lim span{position:absolute;top:-17px;left:-20px;font-size:.68em;color:#b71c1c;font-weight:700;white-space:nowrap}' +
        '.asrsv-leg{font-size:.8em;color:#555;margin:6px 0 10px}.asrsv-leg span{display:inline-block;margin-right:14px}' +
        '.asrsv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle;border:1px solid #ccc}' +
        '.asrsv-dois{display:flex;gap:12px;flex-wrap:wrap}.asrsv-dois>div{flex:1 1 300px}' +
        '.asrsv-card{background:#fff;padding:15px 18px;border-radius:10px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.08);border-left:6px solid #1565c0}' +
        '.asrsv-topo{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.asrsv-topo h4{font-size:1.03em}' +
        '.asrsv-badge{display:inline-block;padding:3px 11px;border-radius:12px;font-size:.78em;font-weight:700;white-space:nowrap}' +
        '.asrsv-bf{height:14px;background:#eceff1;border-radius:7px;overflow:hidden;margin:10px 0 6px}.asrsv-bp{height:100%;border-radius:7px}' +
        '.asrsv-num{font-size:.86em;color:#444}.asrsv-dsc{font-size:.84em;color:#666;margin-top:4px}' +
        '.asrsv-ap{padding:14px 18px;border-radius:10px;margin:12px 0;font-weight:700;text-align:center;border:2px solid #1565c0;background:#e3f2fd;color:#0d47a1}' +
        '.asrsv-folha{width:100%;border-collapse:collapse;font-size:.82em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.asrsv-folha th{background:#1565c0;color:#fff;padding:7px 4px;font-size:.92em}' +
        '.asrsv-folha td{padding:6px 5px;border-bottom:1px solid #eceff1;vertical-align:middle}' +
        '.asrsv-folha td.c{text-align:center;width:64px}.asrsv-folha td.sh{background:#c5cae9}' +
        '.asrsv-folha tr.parte td{background:#e8eaf6;color:#1a237e;font-weight:700}' +
        '.asrsv-mk{display:inline-block;width:18px;height:18px;border-radius:50%}' +
        '.asrsv-dom{display:inline-block;padding:1px 6px;border-radius:8px;font-size:.78em;font-weight:700;margin-right:4px}' +
        '.asrsv-nota{background:#e3f2fd;border-left:4px solid #1565c0;padding:12px 15px;border-radius:8px;font-size:.85em;color:#0d47a1;margin-top:12px}' +
        '.asrsv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '@media(max-width:768px){.asrsv-folha td.c{width:34px}.asrsv-folha th.c{font-size:.7em}}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('asrsv-css')) return;
        var st = document.createElement('style'); st.id = 'asrsv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function slots(cp, total, limiar, cor) {
        var h = '<div class="asrsv-slots">';
        for (var i = 1; i <= total; i++) {
            h += '<div class="asrsv-slot"' + (i <= cp ? ' style="background:' + cor + ';color:#fff"' : '') + '>' + i + '</div>';
            if (i === limiar && i < total) h += '<div class="asrsv-lim"><span>limiar ' + limiar + '</span></div>';
        }
        return h + '</div>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="asrsv"><h2>&#129504; Resultados ASRS-18</h2>';
        h += '<div class="asrsv-rast ' + (r.positivo ? 'asrsv-pos' : 'asrsv-neg') + '">PARTE A: RASTREIO ' + (r.positivo ? 'POSITIVO' : 'NEGATIVO') + ' \u2014 ' + r.partA + '/6 itens no ponto de corte (limiar: >=4)</div>';
        h += '<div class="asrsv-box"><b>Parte A</b> \u2014 cada c\u00edrculo colorido \u00e9 um dos 6 itens de rastreio que atingiu o ponto de corte oficial.' + slots(r.partA, 6, LIM_A, r.positivo ? '#e53935' : '#1565c0') + '</div>';
        h += '<h3>&#128202; Contagem de sintomas comparada ao DSM-5-TR</h3>';
        h += '<div class="asrsv-dois">';
        for (i = 0; i < r.dom.length; i++) {
            var d = r.dom[i];
            h += '<div class="asrsv-box" style="border-left:5px solid ' + d.cor + '"><b style="color:' + d.cor + '">' + d.nome + '</b> \u2014 ' + d.sint + ' de 9 sintomas' + slots(d.sint, 9, LIM_DSM, d.cor) +
                '<span class="asrsv-badge" style="background:' + (d.dsm ? '#ffcdd2' : '#c8e6c9') + ';color:' + (d.dsm ? '#b71c1c' : '#1b5e20') + '">' + (d.dsm ? 'Atinge' : 'N\u00e3o atinge') + ' o limiar do DSM-5-TR (5 ou mais)</span></div>';
        }
        h += '</div><div class="asrsv-ap">Apresenta\u00e7\u00e3o sugerida pela contagem: ' + r.apresentacao + '</div>';
        h += '<h3>&#129513; Intensidade por dom\u00ednio (m\u00e9dia de 0 a 4)</h3><div class="asrsv-dois">';
        for (i = 0; i < r.dom.length; i++) {
            var dd = r.dom[i];
            h += '<div><div class="asrsv-card" style="border-left-color:' + dd.cor + '"><div class="asrsv-topo"><h4 style="color:' + dd.cor + '">' + dd.nome + '</h4><span class="asrsv-badge" style="background:' + dd.niv.bg + ';color:' + dd.niv.fg + '">Intensidade ' + dd.niv.txt.toLowerCase() + '</span></div>' +
                '<div class="asrsv-bf"><div class="asrsv-bp" style="width:' + Math.max(3, dd.media / 4 * 100).toFixed(1) + '%;background:' + dd.cor + '"></div></div>' +
                '<div class="asrsv-num">M\u00e9dia <b>' + fmt(dd.media) + '</b> \u00b7 soma ' + dd.soma + ' de ' + dd.max + '</div><div class="asrsv-dsc">' + dd.desc + '</div></div></div>';
        }
        h += '</div>';
        // folha de respostas igual a oficial
        h += '<h3>&#128203; Folha de respostas (como no formul\u00e1rio da OMS)</h3>';
        h += '<div class="asrsv-leg"><span><i style="background:#c5cae9"></i>\u00e1rea sombreada = ponto de corte do item</span><span><i style="background:#e53935;border-radius:50%"></i>resposta no corte</span><span><i style="background:#90a4ae;border-radius:50%"></i>resposta abaixo do corte</span></div>';
        h += '<div style="overflow-x:auto"><table class="asrsv-folha"><thead><tr><th>#</th><th style="text-align:left">Pergunta</th>';
        for (k = 0; k < 5; k++) h += '<th class="c">' + RESP_CURTO[k] + '</th>';
        h += '</tr></thead><tbody>';
        for (i = 0; i < ITENS.length; i++) {
            if (i === 0) h += '<tr class="parte"><td colspan="7">Parte A \u2014 rastreio (6 itens)</td></tr>';
            if (i === 6) h += '<tr class="parte"><td colspan="7">Parte B \u2014 complementar (12 itens)</td></tr>';
            var it = ITENS[i], dm = it.dom === 'D' ? r.dom[0] : r.dom[1];
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td><span class="asrsv-dom" style="background:' + dm.bg + ';color:' + dm.cor + '">' + (it.dom === 'D' ? 'D' : 'H/I') + '</span>' + esc(it.texto) + '</td>';
            for (k = 0; k < 5; k++) {
                var sh = k >= it.corte, mk = r.vals[i] === k;
                h += '<td class="c' + (sh ? ' sh' : '') + '">' + (mk ? '<span class="asrsv-mk" style="background:' + (r.acima[i] ? '#e53935' : '#90a4ae') + '" title="' + RESP[k] + '"></span>' : '') + '</td>';
            }
            h += '</tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="asrsv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="asrsv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#1565c0';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u00a0/g, ' ').replace(/\u00b7/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) {
        if (!s) return new Date().toLocaleDateString('pt-BR');
        var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s);
    }
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) {
        c.need(16);
        F(c.doc, AZ); c.doc.rect(ML, c.y, 1.6, 6.2, 'F');
        T(c.doc, AZ); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11);
        c.doc.text(pt(t), ML + 4, c.y + 4.8);
        c.y += 10;
    }
    function caixa(c, titulo, texto, cor) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        if (cor) { F(doc, cor); doc.rect(ML, c.y, 1.6, h, 'F'); }
        var yy = c.y + 4.6;
        if (titulo) { T(doc, cor || AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function badge(doc, xDir, y, texto, bg, fg) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        var tw = doc.getTextWidth(pt(texto)) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.4, 2.6, 2.6, 'F');
        T(doc, fg); doc.text(pt(texto), xDir - tw / 2, y + 3.8, {align: 'center'});
    }
    function slotsPDF(doc, x0, y, cp, total, limiar, cor) {
        var x = x0, gap = 9.2, r = 3.4;
        for (var i = 1; i <= total; i++) {
            F(doc, i <= cp ? cor : '#eceff1'); doc.circle(x, y, r, 'F');
            T(doc, i <= cp ? '#ffffff' : '#90a4ae'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.2); doc.text(String(i), x, y + 1, {align: 'center'});
            if (i === limiar && i < total) {
                var lx = x + gap / 2;
                D(doc, '#b71c1c'); doc.setLineWidth(0.5);
                if (doc.setLineDashPattern) doc.setLineDashPattern([1.1, 0.9], 0);
                doc.line(lx, y - 5.5, lx, y + 5.5);
                if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
                T(doc, '#b71c1c'); doc.setFontSize(6); doc.text('limiar ' + limiar, lx, y - 6.4, {align: 'center'});
            }
            x += gap;
        }
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('ASRS-18 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Autoavalia\u00e7\u00e3o do TDAH em Adultos (ASRS v1.1 - OMS)'), 105, 22, {align: 'center'});
        doc.text(pt('Kessler et al. (2005) | Vers\u00e3o brasileira: Mattos et al. (2006)'), 105, 28, {align: 'center'});

        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        if (info.recalculado) { caixa(c, 'Nota', NOTA_RECALC + (info.classificacaoOriginal ? ' Classifica\u00e7\u00e3o registrada originalmente: ' + info.classificacaoOriginal + '.' : ''), AZ); }

        // Rastreio Parte A
        c.need(30);
        F(doc, r.positivo ? '#ffcdd2' : '#c8e6c9'); doc.rect(ML, c.y, CW, 12, 'F');
        D(doc, r.positivo ? '#c62828' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 12, 'S');
        T(doc, r.positivo ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(10.5);
        doc.text(pt('PARTE A: RASTREIO ' + (r.positivo ? 'POSITIVO' : 'NEGATIVO') + ' - ' + r.partA + '/6 itens no ponto de corte (limiar >= 4)'), 105, c.y + 7.8, {align: 'center'});
        c.y += 17;
        T(doc, '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text('Itens da Parte A no ponto de corte', ML + 2, c.y + 2);
        slotsPDF(doc, ML + 8, c.y + 11, r.partA, 6, LIM_A, r.positivo ? '#e53935' : AZ);
        c.y += 20;

        // DSM-5-TR
        secao(c, 'CONTAGEM DE SINTOMAS COMPARADA AO DSM-5-TR');
        c.need(48);
        for (i = 0; i < r.dom.length; i++) {
            var d = r.dom[i], x0 = ML + i * 92, w = 88;
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(x0, c.y, w, 34, 2, 2, 'FD');
            F(doc, d.cor); doc.rect(x0, c.y, 1.6, 34, 'F');
            T(doc, d.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(d.nome), x0 + 4, c.y + 5.5);
            T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.text(pt(d.sint + ' de 9 sintomas no ponto de corte'), x0 + 4, c.y + 10.5);
            slotsPDF(doc, x0 + 7, c.y + 19.5, d.sint, 9, LIM_DSM, d.cor);
            badge(doc, x0 + w - 3, c.y + 26.5, (d.dsm ? 'Atinge' : 'N\u00e3o atinge') + ' o limiar (5 ou mais)', d.dsm ? '#ffcdd2' : '#c8e6c9', d.dsm ? '#b71c1c' : '#1b5e20');
        }
        c.y += 38;
        F(doc, '#e3f2fd'); D(doc, AZ); doc.setLineWidth(0.6); doc.roundedRect(ML, c.y, CW, 9, 2, 2, 'FD');
        T(doc, '#0d47a1'); doc.setFont(undefined, 'bold'); doc.setFontSize(9.5);
        doc.text(pt('Apresenta\u00e7\u00e3o sugerida pela contagem: ' + r.apresentacao), 105, c.y + 6, {align: 'center'});
        c.y += 14;

        // Intensidade
        secao(c, 'INTENSIDADE POR DOM\u00cdNIO (m\u00e9dia de 0 a 4)');
        c.need(30);
        for (i = 0; i < r.dom.length; i++) {
            var dd = r.dom[i], xx = ML + i * 92, ww = 88;
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(xx, c.y, ww, 26, 2, 2, 'FD');
            F(doc, dd.cor); doc.rect(xx, c.y, 1.6, 26, 'F');
            T(doc, dd.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(dd.nome), xx + 4, c.y + 5.5);
            badge(doc, xx + ww - 3, c.y + 8, 'Intensidade ' + dd.niv.txt.toLowerCase(), dd.niv.bg, dd.niv.fg);
            F(doc, '#eceff1'); doc.roundedRect(xx + 4, c.y + 15.5, ww - 8, 3.4, 1.7, 1.7, 'F');
            F(doc, dd.cor); doc.roundedRect(xx + 4, c.y + 15.5, Math.max(3.4, (ww - 8) * dd.media / 4), 3.4, 1.7, 1.7, 'F');
            T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
            doc.text(pt('M\u00e9dia ' + fmt(dd.media) + '  |  soma ' + dd.soma + ' de ' + dd.max), xx + 4, c.y + 23.4);
        }
        c.y += 31;

        // Folha de respostas
        c.need(60);
        secao(c, 'FOLHA DE RESPOSTAS (como no formul\u00e1rio da OMS)');
        var cn = 8, ct = 97, cc = 15, xT = ML, yH = c.y;
        function cabecalho() {
            F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F');
            T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.8);
            doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Pergunta', xT + cn + 2, c.y + 4.7);
            for (var q = 0; q < 5; q++) doc.text(pt(RESP_CURTO[q]), xT + cn + ct + q * cc + cc / 2, c.y + 4.7, {align: 'center'});
            c.y += 7;
        }
        cabecalho();
        for (i = 0; i < ITENS.length; i++) {
            if (i === 0 || i === 6) {
                if (c.y + 6 > 276) { doc.addPage(); c.y = 20; cabecalho(); }
                F(doc, '#e8eaf6'); doc.rect(xT, c.y, CW, 5.6, 'F');
                T(doc, '#1a237e'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6);
                doc.text(pt(i === 0 ? 'Parte A - rastreio (6 itens)' : 'Parte B - complementar (12 itens)'), xT + 2, c.y + 4);
                c.y += 5.6;
            }
            var it = ITENS[i];
            doc.setFont(undefined, 'normal'); doc.setFontSize(7);
            var tl = doc.splitTextToSize(pt((it.dom === 'D' ? '[D] ' : '[H/I] ') + it.texto), ct - 3), rh = Math.max(7, tl.length * 3.1 + 2.4);
            if (c.y + rh > 276) { doc.addPage(); c.y = 20; cabecalho(); }
            for (k = 0; k < 5; k++) {
                var cx = xT + cn + ct + k * cc;
                if (k >= it.corte) { F(doc, '#c5cae9'); doc.rect(cx, c.y, cc, rh, 'F'); }
                if (r.vals[i] === k) { F(doc, r.acima[i] ? '#e53935' : '#90a4ae'); doc.circle(cx + cc / 2, c.y + rh / 2, 2.1, 'F'); }
            }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1.1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text(tl, xT + cn + 1.5, c.y + 3.6);
            D(doc, '#e0e0e0'); doc.setLineWidth(0.15); doc.line(xT, c.y + rh, xT + CW, c.y + rh);
            c.y += rh;
        }
        c.y += 3;
        var lgx = ML + 2; doc.setFontSize(7.2); doc.setFont(undefined, 'normal');
        F(doc, '#c5cae9'); doc.rect(lgx, c.y - 2.8, 3.4, 3.4, 'F'); T(doc, '#555555'); doc.text(pt('\u00e1rea sombreada = ponto de corte'), lgx + 5, c.y); lgx += 50;
        F(doc, '#e53935'); doc.circle(lgx + 1.7, c.y - 1.1, 1.7, 'F'); doc.text('resposta no corte', lgx + 5, c.y); lgx += 32;
        F(doc, '#90a4ae'); doc.circle(lgx + 1.7, c.y - 1.1, 1.7, 'F'); doc.text('resposta abaixo do corte', lgx + 5, c.y);
        c.y += 7;

        // Analise
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

        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(9);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.4 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.4 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var p = 1; p <= tot; p++) {
            doc.setPage(p);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | ASRS-18 | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('ASRS18_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    // ===================== PAINEL =====================
    // Recalcula a partir das 18 respostas salvas (0 a 4). Registros sem 'cortesOficiais' sao anteriores
    // a correcao: o PDF recebe a nota de recalculo e mostra a classificacao original.
    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'ASRS-18' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) {
            var v = parseInt(d.respostas[i], 10);
            if (!(v >= 0 && v <= 4)) return false;
            vals.push(v);
        }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        var antigo = !d.cortesOficiais;
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : '',
            recalculado: antigo, classificacaoOriginal: antigo ? pt(d.classificacao || '') : ''});
        return true;
    }

    window.SYM_ASRS = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, ITENS: ITENS};
})();
