// ertvt-visual.js - Desenho sob medida da ERT-VT (Escala de Rastreio para Vida Diaria no Trabalho) - escala AUTORAL (Monte)
// (tela de resultados + PDF da escala e do Painel).
// Calculo mantido como o autor definiu: 20 itens (0-4), 8 dominios (media dos itens de cada um), media geral 0-4; faixas de intensidade da media:
// <1 Minimo, <1,5 Leve, <2 Leve-Moderado, <2,5 Moderado, <3 Significativo, >=3 Intenso; corte de "risco" = media geral >= 2,5.
// Analise automatica (3 eixos, pesos e cortes do autor, mantidos): burnout = EE*0,30 + FM*0,25 + DE*0,25 + CE*0,20 (>=3 ALTO, >=2 MODERADO);
// incongruencia = DE*0,35 + AC*0,25 + CE*0,20 + PR*0,20 (mesmos cortes); insight pelos itens 10 e 20 quando a media geral >= 2,5.
// Mudancas (11/11/2026): "IA" -> "analise automatica (por regras)"; textos descritivos (saiu "Apto/Apto sem restricoes", "SITUACAO CRITICA",
// "possivel afastamento temporario" e "considerar remanejamento"); CORRECAO de logica: no "parecer integrado" havia combinacoes sem ramo
// (ex.: burnout ALTO com insight MODERADO/ADEQUADO, ou incongruencia ALTO com burnout BAIXO) que caiam em "sem indicadores de risco";
// cores neutras; numero de itens por dominio exibido (Pressao Decisoria tem 1 item, Desengajamento/Capacidade Funcional/Percepcao de Risco tem 2).
// d.respostas: chaves 1..20, valores 0-4 (igual ao registro antigo). d.dominios: nome do dominio -> {pontuacao = MEDIA (como antes), max 4, media, classificacao}.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

var ITENS=[
{texto:"Sinto cansa\u00e7o mental ao realizar tarefas repetitivas.",dominio:"FM"},
{texto:"Tenho dificuldade em manter a aten\u00e7\u00e3o por longos per\u00edodos.",dominio:"AC"},
{texto:"J\u00e1 cometi erros por distra\u00e7\u00e3o ou automatismo.",dominio:"AC"},
{texto:"Sinto que meu rendimento diminui ao longo do dia.",dominio:"FM"},
{texto:"Preciso fazer pausas frequentes para conseguir manter o foco.",dominio:"FM"},
{texto:"Sinto que meu trabalho \u00e9 mon\u00f3tono ou pouco estimulante.",dominio:"DE"},
{texto:"Tenho dificuldade em manter organiza\u00e7\u00e3o das tarefas.",dominio:"CF"},
{texto:"J\u00e1 perdi prazos ou compromissos por falha de aten\u00e7\u00e3o.",dominio:"AC"},
{texto:"Sinto desmotiva\u00e7\u00e3o em rela\u00e7\u00e3o \u00e0s atividades que realizo.",dominio:"DE"},
{texto:"Sinto que minha capacidade atual n\u00e3o acompanha as exig\u00eancias da fun\u00e7\u00e3o.",dominio:"CF"},
{texto:"Sinto desgaste emocional ap\u00f3s intera\u00e7\u00f5es dif\u00edceis no trabalho.",dominio:"EE"},
{texto:"J\u00e1 precisei controlar minha irrita\u00e7\u00e3o para evitar conflitos durante o trabalho.",dominio:"CE"},
{texto:"Sinto que preciso estar sempre em alerta no ambiente de trabalho.",dominio:"PR"},
{texto:"Tenho dificuldade em desligar do trabalho ap\u00f3s o expediente.",dominio:"EE"},
{texto:"J\u00e1 me senti inseguro(a) ou sob press\u00e3o excessiva em situa\u00e7\u00f5es de trabalho.",dominio:"PR"},
{texto:"Preciso tomar decis\u00f5es r\u00e1pidas sob press\u00e3o com frequ\u00eancia.",dominio:"PD"},
{texto:"Sinto que minha paci\u00eancia diminuiu com o tempo na fun\u00e7\u00e3o.",dominio:"CE"},
{texto:"Tenho dificuldade em manter a calma quando sou confrontado(a).",dominio:"CE"},
{texto:"Percebo cansa\u00e7o mental intenso ap\u00f3s dias de trabalho.",dominio:"EE"},
{texto:"Sinto que esse trabalho exige mais de mim emocionalmente do que consigo sustentar.",dominio:"EE"}
];
var DOMINIOS_NOMES={"FM":"Fadiga Mental","AC":"Aten\u00e7\u00e3o Concentrada","DE":"Desengajamento","CF":"Capacidade Funcional","EE":"Exaust\u00e3o Emocional","CE":"Controle Emocional","PR":"Percep\u00e7\u00e3o de Risco","PD":"Press\u00e3o Decis\u00f3ria"};
var DOMINIOS={"FM":[0,3,4],"AC":[1,2,7],"DE":[5,8],"CF":[6,9],"EE":[10,13,18,19],"CE":[11,16,17],"PR":[12,14],"PD":[15]};
var OPCOES=[{valor:0,texto:"Nunca"},{valor:1,texto:"Raramente"},{valor:2,texto:"\u00c0s vezes"},{valor:3,texto:"Frequente-<br>mente"},{valor:4,texto:"Sempre"}];

    var ORDEM = ['FM', 'AC', 'DE', 'CF', 'EE', 'CE', 'PR', 'PD'];
    var RESP = ['Nunca', 'Raramente', '\u00c0s vezes', 'Frequentemente', 'Sempre'];
    var FAIXAS = [
        {ate: 1.0, texto: 'M\u00ednimo', cor: '#90a4ae'}, {ate: 1.5, texto: 'Leve', cor: '#64b5f6'}, {ate: 2.0, texto: 'Leve-Moderado', cor: '#4db6ac'},
        {ate: 2.5, texto: 'Moderado', cor: '#f9a825'}, {ate: 3.0, texto: 'Significativo', cor: '#fb8c00'}, {ate: 99, texto: 'Intenso', cor: '#e64a19'}
    ];
    var CORTE = 2.5, AC = '#004d40', TAG = {ALTO: '#e64a19', MODERADO: '#f9a825', BAIXO: '#607d8b', ADEQUADO: '#00897b'};
    var NOTA = 'A ERT-VT \u00e9 uma escala autoral de rastreio, de natureza explorat\u00f3ria, elaborada pelo autor para observar desgaste ocupacional, fadiga cognitiva e sinais de risco de burnout em adultos que trabalham. N\u00e3o tem valida\u00e7\u00e3o psicom\u00e9trica formal nem normas; as faixas de intensidade, o corte de 2,5 e os pesos da an\u00e1lise autom\u00e1tica foram definidos pelo autor. A an\u00e1lise \u00e9 feita por regras fixas (n\u00e3o por intelig\u00eancia artificial) e deve ser revisada pelo profissional. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica nem define aptid\u00e3o para o trabalho; os resultados devem ser interpretados por profissional qualificado.';
    var REFS = [
        'MONTE, S. T. ERT-VT - Escala de Rastreio para Vida Di\u00e1ria no Trabalho. Escala autoral, sem valida\u00e7\u00e3o psicom\u00e9trica formal.',
        'CARLOTTO, M. S.; C\u00c2MARA, S. G. Propriedades psicom\u00e9tricas do Maslach Burnout Inventory em uma amostra multifuncional. Estudos de Psicologia, Campinas, v. 24, n. 3, p. 325-332, 2007.',
        'MASLACH, C.; JACKSON, S. E. The measurement of experienced burnout. Journal of Organizational Behavior, v. 2, n. 2, p. 99-113, 1981.',
        'BRASIL. Minist\u00e9rio da Sa\u00fade. Doen\u00e7as relacionadas ao trabalho: manual de procedimentos para os servi\u00e7os de sa\u00fade. Bras\u00edlia: MS, 2001.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Manual Diagn\u00f3stico e Estat\u00edstico de Transtornos Mentais (DSM-5-TR). 5. ed. rev. Porto Alegre: Artmed, 2023.'
    ];

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f1(v) { return (Math.round(v * 10) / 10).toFixed(1).replace('.', ','); }
    function f2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
    function faixaDe(m) { for (var i = 0; i < FAIXAS.length; i++) { if (m < FAIXAS[i].ate) return FAIXAS[i]; } return FAIXAS[FAIXAS.length - 1]; }

    // ===================== ANALISE AUTOMATICA (regras do autor) =====================
    function analiseRegras(resp, dm, mg) {
        var fm = dm.FM, ac = dm.AC, de = dm.DE, ee = dm.EE, ce = dm.CE, pr = dm.PR;
        var scB = (ee * 0.30) + (fm * 0.25) + (de * 0.25) + (ce * 0.20), nB, tB;
        if (scB >= 3.0) {
            nB = 'ALTO';
            tB = 'Os indicadores de desgaste s\u00e3o consistentes com um quadro de esgotamento: exaust\u00e3o emocional (' + f1(ee) + '/4) e fadiga mental (' + f1(fm) + '/4) elevadas, combinadas com desengajamento (' + f1(de) + '/4), que sugere distanciamento do trabalho. Esse padr\u00e3o sugere sobrecarga acima da capacidade de sustenta\u00e7\u00e3o atual. Pode ser \u00fatil aprofundar com avalia\u00e7\u00e3o cl\u00ednica complementar e rever a carga de trabalho junto com a pessoa.';
        } else if (scB >= 2.0) {
            nB = 'MODERADO';
            tB = 'H\u00e1 sinais moderados de desgaste, compat\u00edveis com fase inicial de sobrecarga: fadiga mental (' + f1(fm) + '/4) e exaust\u00e3o emocional (' + f1(ee) + '/4), ainda sem n\u00edvel cr\u00edtico. Pode ser um bom momento para a\u00e7\u00f5es preventivas, como manejo do estresse e monitoramento, com reavalia\u00e7\u00e3o em cerca de 3 meses (sugest\u00e3o do autor).';
        } else {
            nB = 'BAIXO';
            tB = 'N\u00e3o h\u00e1 indicadores significativos de burnout neste instrumento. Fadiga (' + f1(fm) + '/4) e exaust\u00e3o (' + f1(ee) + '/4) est\u00e3o em n\u00edveis funcionais. Manter acompanhamento preventivo.';
        }
        var scI = (de * 0.35) + (ac * 0.25) + (ce * 0.20) + (pr * 0.20), nI, tI;
        if (scI >= 3.0) {
            nI = 'ALTO';
            tI = 'H\u00e1 forte indicativo de incongru\u00eancia entre o perfil da pessoa e as exig\u00eancias da fun\u00e7\u00e3o: desengajamento elevado (' + f1(de) + '/4), dificuldade atencional (' + f1(ac) + '/4) e de controle emocional (' + f1(ce) + '/4). \u00c9 uma hip\u00f3tese a investigar, e o foco \u00e9 o encaixe entre pessoa e fun\u00e7\u00e3o, n\u00e3o uma falha da pessoa. Pode ser \u00fatil avaliar perfil e interesses vocacionais antes de qualquer decis\u00e3o sobre a fun\u00e7\u00e3o.';
        } else if (scI >= 2.0) {
            nI = 'MODERADO';
            tI = 'H\u00e1 sinais moderados de poss\u00edvel desajuste entre perfil e fun\u00e7\u00e3o (' + f1(ac) + '/4 em aten\u00e7\u00e3o e ' + f1(de) + '/4 em desengajamento), ainda em faixa manej\u00e1vel. Sugere-se acompanhamento e reavalia\u00e7\u00e3o em 3 a 6 meses (sugest\u00e3o do autor).';
        } else {
            nI = 'BAIXO';
            tI = 'N\u00e3o h\u00e1 indicadores significativos de incongru\u00eancia entre perfil e fun\u00e7\u00e3o neste instrumento.';
        }
        var i10 = resp[9], i20 = resp[19], nS, tS;
        if (mg >= 2.5) {
            if (i10 >= 3 || i20 >= 3) {
                nS = 'ALTO';
                tS = 'A pessoa reconhece claramente suas dificuldades (item 10: ' + i10 + '/4; item 20: ' + i20 + '/4). Esse reconhecimento costuma ser um fator protetor: quem nomeia a dificuldade tende a buscar solu\u00e7\u00f5es e a responder melhor a interven\u00e7\u00f5es.';
            } else if (i10 >= 2 || i20 >= 2) {
                nS = 'MODERADO';
                tS = 'O insight parece parcial: a pessoa percebe algumas dificuldades (item 10: ' + i10 + '/4; item 20: ' + i20 + '/4), mas pode estar minimizando. H\u00e1 risco de normaliza\u00e7\u00e3o do desgaste.';
            } else {
                nS = 'BAIXO';
                tS = 'H\u00e1 sinais de desgaste (m\u00e9dia ' + f1(mg) + '/4), mas a pessoa n\u00e3o reconhece que sua capacidade esteja comprometida (item 10: ' + i10 + '/4; item 20: ' + i20 + '/4). Baixo reconhecimento pode ser fator de risco, porque sem perceber o problema a pessoa tende a n\u00e3o buscar ajuda.';
            }
        } else if (i10 <= 1 && i20 <= 1) {
            nS = 'ADEQUADO';
            tS = 'Sem desgaste importante nos indicadores, e a autopercep\u00e7\u00e3o \u00e9 coerente com eles.';
        } else {
            nS = 'ALTO';
            tS = 'Os indicadores objetivos s\u00e3o relativamente baixos, mas a pessoa relata percep\u00e7\u00e3o de dificuldade. Pode indicar boa autoconsci\u00eancia ou um momento pontual de estresse.';
        }
        var p;
        if (nB === 'ALTO' && nS === 'BAIXO') p = 'Alto desgaste com baixo reconhecimento da pr\u00f3pria dificuldade: a pessoa pode estar esgotada sem perceber. Merece avalia\u00e7\u00e3o cl\u00ednica e aten\u00e7\u00e3o \u00e0s tarefas de maior risco at\u00e9 a reavalia\u00e7\u00e3o.';
        else if (nB === 'ALTO' && nS === 'ALTO') p = 'Alto desgaste, com bom reconhecimento das pr\u00f3prias limita\u00e7\u00f5es. Pode ser \u00fatil rever carga e suporte e manter acompanhamento peri\u00f3dico.';
        else if (nB === 'ALTO') p = 'Alto desgaste (insight ' + nS.toLowerCase() + '). Merece avalia\u00e7\u00e3o cl\u00ednica complementar e revis\u00e3o da carga e do suporte, com acompanhamento peri\u00f3dico.';
        else if (nB === 'MODERADO' && nI === 'ALTO') p = 'Desgaste moderado com forte indicativo de incongru\u00eancia entre perfil e fun\u00e7\u00e3o: o sofrimento parece vir mais do desajuste do que da carga em si. Pode ser \u00fatil avaliar a compatibilidade do perfil com a fun\u00e7\u00e3o.';
        else if (nB === 'MODERADO') p = 'Desgaste moderado, sem fatores agravantes cr\u00edticos neste instrumento. Momento adequado para a\u00e7\u00f5es preventivas, como pausas estruturadas e varia\u00e7\u00e3o de tarefas, com reavalia\u00e7\u00e3o em cerca de 3 meses.';
        else if (nI === 'ALTO') p = 'Desgaste baixo, mas com forte indicativo de incongru\u00eancia entre perfil e fun\u00e7\u00e3o. Pode ser \u00fatil investigar o encaixe com a fun\u00e7\u00e3o.';
        else p = 'Sem indicadores de risco significativos neste instrumento. Manter acompanhamento preventivo.';
        return {burnout: {nivel: nB, texto: tB, score: scB}, incongruencia: {nivel: nI, texto: tI, score: scI}, insight: {nivel: nS, texto: tS}, parecer: p};
    }

    // ===================== CALCULO =====================
    function calcular(vals) {
        if (!vals || vals.length !== ITENS.length) throw new Error('ERT-VT: respostas incompletas');
        var r = {v: [], soma: 0, dom: {}}, i;
        for (i = 0; i < ITENS.length; i++) {
            var x = parseInt(vals[i], 10);
            if (!(x >= 0 && x <= 4)) throw new Error('ERT-VT: resposta invalida no item ' + (i + 1));
            r.v.push(x); r.soma += x;
        }
        r.media = r.soma / ITENS.length;
        r.faixa = faixaDe(r.media);
        r.acima = r.media >= CORTE;
        var dm = {};
        ORDEM.forEach(function (k) {
            var itens = DOMINIOS[k], s = 0;
            itens.forEach(function (ix) { s += r.v[ix]; });
            dm[k] = s / itens.length;
            r.dom[k] = {media: dm[k], n: itens.length, faixa: faixaDe(dm[k]), pct: dm[k] / 4 * 100};
        });
        r.analise = analiseRegras(r.v, dm, r.media);
        return r;
    }
    function classifGeral(r) { return r.faixa.texto; }
    function dadosPainel(r) {
        var o = {};
        ORDEM.forEach(function (k) { o[DOMINIOS_NOMES[k]] = {pontuacao: r.dom[k].media, max: 4, media: r.dom[k].media, classificacao: r.dom[k].faixa.texto + ' (' + r.dom[k].n + (r.dom[k].n === 1 ? ' item)' : ' itens)')}; });
        return o;
    }
    function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
    function respostasDetalhadas(r) {
        var out = [], i;
        for (i = 0; i < ITENS.length; i++) out.push({n: i + 1, texto: ITENS[i].texto, criterio: DOMINIOS_NOMES[ITENS[i].dominio] || ITENS[i].dominio, invertido: false, valorBruto: r.v[i]});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.evv h2{color:' + AC + ';margin-bottom:16px;text-align:center}' +
        '.evv h3{color:' + AC + ';margin:26px 0 10px;font-size:1.12em}' +
        '.evv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.evv-res b{font-size:1.5em;display:block}' +
        '.evv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.evv-bar{position:relative;height:20px;background:#e0e0e0;border-radius:10px;margin:6px 0 2px}.evv-bar>div{height:20px;border-radius:10px}' +
        '.evv-corte{position:absolute;top:-4px;width:3px;height:28px;background:#37474f}' +
        '.evv-tag{display:inline-block;padding:2px 10px;border-radius:10px;font-size:.8em;font-weight:700;color:#fff;margin-bottom:6px}' +
        '.evv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.evv-tab th{background:' + AC + ';color:#fff;padding:7px 4px}.evv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.evv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('evv-css')) return;
        var st = document.createElement('style'); st.id = 'evv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    var EIXOS = [['burnout', 'Eixo 1 - Indicadores de burnout'], ['incongruencia', 'Eixo 2 - Incongru\u00eancia perfil x fun\u00e7\u00e3o'], ['insight', 'Eixo 3 - Reconhecimento da pr\u00f3pria dificuldade (insight)']];
    function htmlTela(r) {
        injetarCSS();
        var i, k, an = r.analise, h = '<div class="evv"><h2>&#128203; Resultados &#8212; ERT-VT</h2>';
        h += '<div class="evv-res" style="background:' + (r.acima ? '#ffe0b2' : '#eceff1') + ';border-color:' + (r.acima ? '#fb8c00' : '#607d8b') + ';color:' + (r.acima ? '#bf5600' : '#37474f') + '"><b>M\u00e9dia geral ' + f2(r.media) + ' / 4,00</b>' + esc(r.faixa.texto) + ' &#8212; ' + (r.acima ? 'm\u00e9dia igual ou acima de 2,5 (corte do autor)' : 'm\u00e9dia abaixo de 2,5 (corte do autor)') + '</div>';
        h += '<h3>&#128202; Por dom\u00ednio (m\u00e9dia de 0 a 4)</h3><div class="evv-box">';
        ORDEM.forEach(function (kk) {
            var d = r.dom[kk];
            h += '<div style="margin:8px 0 12px"><b>' + esc(DOMINIOS_NOMES[kk]) + '</b> <span style="font-size:.8em;color:#888">(' + d.n + (d.n === 1 ? ' item' : ' itens') + ')</span>: ' + f2(d.media) + ' &#8212; ' + esc(d.faixa.texto) + '<div class="evv-bar"><div style="width:' + Math.max(1, d.pct) + '%;background:' + d.faixa.cor + '"></div></div></div>';
        });
        h += '<div style="font-size:.8em;color:#666">Dom\u00ednios com 1 ou 2 itens t\u00eam m\u00e9dia mais inst\u00e1vel; leia-os com cautela.</div></div>';
        h += '<h3>&#128221; An\u00e1lise autom\u00e1tica (por regras)</h3>';
        EIXOS.forEach(function (e) {
            var x = an[e[0]];
            h += '<div class="evv-box"><b>' + e[1] + '</b><br><span class="evv-tag" style="background:' + TAG[x.nivel] + '">' + x.nivel + '</span><br>' + esc(x.texto) + '</div>';
        });
        h += '<div class="evv-box" style="border-left:4px solid #f9a825"><b>Resumo integrado (a revisar pelo profissional)</b><br>' + esc(an.parecer) + '</div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="evv-tab"><thead><tr><th>#</th><th style="text-align:left">Item</th><th>Dom\u00ednio</th><th>Resposta</th></tr></thead><tbody>';
        for (i = 0; i < ITENS.length; i++) h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].texto) + '</td><td style="text-align:center">' + esc(DOMINIOS_NOMES[ITENS[i].dominio]) + '</td><td style="text-align:center">' + esc(RESP[r.v[i]]) + ' (' + r.v[i] + ')</td></tr>';
        h += '</tbody></table></div><div class="evv-disc"><b>IMPORTANTE:</b> ' + esc(NOTA) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15;
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u2264/g, '<=').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, AC); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AC); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, tag, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + (tag ? 6 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f3f8f7'); D(doc, '#d9e8e5'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        if (tag) { F(doc, TAG[tag]); doc.roundedRect(ML + 5, yy - 3.4, 22, 4.6, 1.6, 1.6, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7); doc.text(tag, ML + 16, yy, {align: 'center'}); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function barraPDF(c, rotulo, media, cor) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        c.need(12);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5, hb = 5;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.5, 2.5, 'F');
        F(doc, cor); doc.roundedRect(x0, yb, Math.max(2, w * media / 4), hb, 2.5, 2.5, 'F');
        c.y += 12;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc), an = r.analise;
        F(doc, AC); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#1a237e'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('ERT-VT - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Rastreio para Vida Di\u00e1ria no Trabalho - 20 itens, 8 dom\u00ednios'), 105, 22, {align: 'center'});
        doc.text(pt('Escala autoral, sem valida\u00e7\u00e3o psicom\u00e9trica formal'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AC); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AC); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIADO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;
        var bx = r.acima ? ['#ffe0b2', '#fb8c00', '#bf5600'] : ['#eceff1', '#607d8b', '#37474f'];
        F(doc, bx[0]); doc.rect(ML, c.y, CW, 17, 'F'); D(doc, bx[1]); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 17, 'S');
        T(doc, bx[2]); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt('M\u00e9dia geral ' + f2(r.media) + ' / 4,00 - ' + r.faixa.texto), 105, c.y + 7, {align: 'center'});
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(pt(r.acima ? 'm\u00e9dia igual ou acima de 2,5 (corte do autor)' : 'm\u00e9dia abaixo de 2,5 (corte do autor)'), 105, c.y + 12.8, {align: 'center'});
        c.y += 23;
        secao(c, 'M\u00c9DIA POR DOM\u00cdNIO (0 A 4)');
        ORDEM.forEach(function (k) { var d = r.dom[k]; barraPDF(c, DOMINIOS_NOMES[k] + ' (' + d.n + (d.n === 1 ? ' item' : ' itens') + '): ' + f2(d.media) + ' - ' + d.faixa.texto, d.media, d.faixa.cor); });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text(pt('Dom\u00ednios com 1 ou 2 itens t\u00eam m\u00e9dia mais inst\u00e1vel; leia-os com cautela.'), ML + 2, c.y + 1); c.y += 8;
        secao(c, 'AN\u00c1LISE AUTOM\u00c1TICA (POR REGRAS)');
        EIXOS.forEach(function (e) { caixa(c, e[1], an[e[0]].nivel, an[e[0]].texto); });
        caixa(c, 'Resumo integrado (a revisar pelo profissional)', null, an.parecer);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(NOTA), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 6;
        c.need(60);
        secao(c, 'RESPOSTAS');
        var cn = 8, ct = 108, cd = 34, ca = 30, xT = ML;
        F(doc, AC); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item', xT + cn + 2, c.y + 4.7); doc.text('Dom\u00ednio', xT + cn + ct + cd / 2, c.y + 4.7, {align: 'center'}); doc.text('Resposta', xT + cn + ct + cd + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < ITENS.length; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tx = doc.splitTextToSize(pt(ITENS[i].texto), ct - 3), rh = Math.max(5.4, tx.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#f3f8f7'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tx, xT + cn + 2, c.y + 3.5);
            doc.setFontSize(6.8); doc.text(pt(DOMINIOS_NOMES[ITENS[i].dominio]), xT + cn + ct + cd / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.2); doc.text(pt(RESP[r.v[i]] + ' (' + r.v[i] + ')'), xT + cn + ct + cd + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
            c.y += rh;
        }
        c.y += 6;
        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.6);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.2 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.2 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | ERT-VT | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('ERT-VT_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'ERT-VT' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 4)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_ERTVT = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        respostasObj: respostasObj, respostasDetalhadas: respostasDetalhadas, ITENS: ITENS, OPCOES: OPCOES, DOMINIOS_NOMES: DOMINIOS_NOMES, NOTA: NOTA};
})();
