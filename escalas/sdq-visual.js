// sdq-visual.js - Desenho sob medida do SDQ (tela de resultados + PDF da escala e do Painel).
// Strengths and Difficulties Questionnaire (Goodman, 1997), versao 4-17 anos para PAIS ou PROFESSOR; versao brasileira:
// Fleitlich, Cortazar e Goodman (2000). 25 itens (0-2), 5 subescalas de 5 itens; 5 itens invertidos (7, 11, 14, 21, 25).
// Total de Dificuldades = Emocional + Conduta + Hiperatividade + Colegas (0-40); Pro-social (0-10) nao entra no total.
// Faixas: 4 faixas oficiais (sdqinfo.org), DIFERENTES para pais e professor. Nao ha faixas de autoavaliacao aqui
// (a versao de autoavaliacao tem itens em primeira pessoa e faixas proprias, nao incluidas).
// SDQ (c) Robert Goodman / Youthinmind. Versoes eletronicas dependem de autorizacao da Youthinmind.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    // [texto, subescala, invertido]
    var IT = [
        ['Procura ser agrad\u00e1vel com as outras pessoas. Leva em considera\u00e7\u00e3o os sentimentos dos outros', 'S', 0],
        ['N\u00e3o consegue ficar parado(a), \u00e9 irrequieto(a) ou hiperativo(a)', 'H', 0],
        ['Queixa-se frequentemente de dor de cabe\u00e7a, dor de barriga ou enj\u00f4o', 'E', 0],
        ['Compartilha facilmente com outras crian\u00e7as (doces, brinquedos, l\u00e1pis, etc.)', 'S', 0],
        ['Frequentemente tem acessos de raiva ou crises de birra', 'C', 0],
        ['\u00c9 solit\u00e1rio(a), tende a brincar sozinho(a)', 'P', 0],
        ['Geralmente \u00e9 obediente e faz o que os adultos pedem', 'C', 1],
        ['Tem muitas preocupa\u00e7\u00f5es, frequentemente parece preocupado(a)', 'E', 0],
        ['Tenta ser atencioso(a) quando algu\u00e9m est\u00e1 machucado, triste ou doente', 'S', 0],
        ['Est\u00e1 sempre se mexendo, balan\u00e7ando pernas ou m\u00e3os', 'H', 0],
        ['Tem pelo menos um(a) bom(boa) amigo(a)', 'P', 1],
        ['Frequentemente briga com outras crian\u00e7as ou as intimida', 'C', 0],
        ['Frequentemente parece triste, desanimado(a) ou choroso(a)', 'E', 0],
        ['\u00c9 geralmente querido(a) por outras crian\u00e7as', 'P', 1],
        ['Facilmente distra\u00eddo(a), perde a concentra\u00e7\u00e3o', 'H', 0],
        ['Fica nervoso(a) ou grudado(a) em novas situa\u00e7\u00f5es, facilmente perde a confian\u00e7a', 'E', 0],
        ['\u00c9 gentil com crian\u00e7as mais novas', 'S', 0],
        ['Frequentemente mente ou engana', 'C', 0],
        ['\u00c9 alvo de provoca\u00e7\u00f5es ou bullying por outras crian\u00e7as', 'P', 0],
        ['Frequentemente oferece-se para ajudar os outros (pais, professores, outras crian\u00e7as)', 'S', 0],
        ['Pensa antes de agir', 'H', 1],
        ['Rouba coisas de casa, da escola ou de outros lugares', 'C', 0],
        ['D\u00e1-se melhor com adultos do que com outras crian\u00e7as', 'P', 0],
        ['Tem muitos medos, assusta-se facilmente', 'E', 0],
        ['Completa as tarefas que come\u00e7a, tem boa concentra\u00e7\u00e3o', 'H', 1]
    ];
    var ITENS = IT.map(function (a, i) { return {n: i + 1, t: a[0], s: a[1], inv: !!a[2]}; });
    var RESP = ['Falso', 'Mais ou menos verdadeiro', 'Verdadeiro'];
    var SUBS = {
        E: {nome: 'Sintomas Emocionais', curto: 'Emocional', max: 10},
        C: {nome: 'Problemas de Conduta', curto: 'Conduta', max: 10},
        H: {nome: 'Hiperatividade/Desaten\u00e7\u00e3o', curto: 'Hiperatividade', max: 10},
        P: {nome: 'Problemas com Colegas', curto: 'Colegas', max: 10},
        S: {nome: 'Comportamento Pr\u00f3-social', curto: 'ProSocial', max: 10},
        T: {nome: 'Total de Dificuldades', curto: 'Total', max: 40}
    };
    var ORDEM = ['E', 'C', 'H', 'P', 'S'];
    var NF_DIF = ['Pr\u00f3ximo da m\u00e9dia', 'Ligeiramente elevado', 'Alto', 'Muito alto'];
    var NF_PRO = ['Pr\u00f3ximo da m\u00e9dia', 'Ligeiramente baixo', 'Baixo', 'Muito baixo'];
    var COR = [
        {seg: '#4caf50', bg: '#c8e6c9', fg: '#1b5e20'},
        {seg: '#fbc02d', bg: '#fff3c4', fg: '#8a6d00'},
        {seg: '#fb8c00', bg: '#ffe0b2', fg: '#bf5600'},
        {seg: '#e53935', bg: '#ffcdd2', fg: '#b71c1c'}
    ];
    // limites de cada faixa (pais e professor) - sdqinfo.org, 4 faixas. Dificuldades: <= l0, <= l1, <= l2, resto.
    // Pro-social (inverso): >= l0, >= l1, >= l2, resto.
    var LIM = {
        pais: {T: [13, 16, 19], E: [3, 4, 6], C: [2, 3, 5], H: [5, 7, 8], P: [2, 3, 4], S: [8, 7, 6]},
        professor: {T: [11, 15, 18], E: [3, 4, 5], C: [2, 3, 4], H: [5, 7, 8], P: [2, 4, 5], S: [6, 5, 4]}
    };
    var REFS = [
        'GOODMAN, R. The Strengths and Difficulties Questionnaire: a research note. Journal of Child Psychology and Psychiatry, v. 38, n. 5, p. 581-586, 1997.',
        'GOODMAN, R. Psychometric properties of the Strengths and Difficulties Questionnaire. Journal of the American Academy of Child and Adolescent Psychiatry, v. 40, n. 11, p. 1337-1345, 2001.',
        'FLEITLICH, B.; CORTAZAR, P. G.; GOODMAN, R. Question\u00e1rio de Capacidades e Dificuldades (SDQ). Infanto - Revista de Neuropsiquiatria da Inf\u00e2ncia e Adolesc\u00eancia, v. 8, n. 1, p. 44-50, 2000.',
        'SAUR, A. M.; LOUREIRO, S. R. Propriedades psicom\u00e9tricas do Strengths and Difficulties Questionnaire (SDQ): revis\u00e3o da literatura. Psico-USF, v. 17, n. 1, p. 107-116, 2012.',
        'YOUTHINMIND. Scoring the SDQ (4-17 anos): faixas de classifica\u00e7\u00e3o para pais e professores. Dispon\u00edvel em: https://www.sdqinfo.org. Acesso em: 10 nov. 2026.'
    ];
    var DIREITOS = 'SDQ \u00a9 Robert Goodman / Youthinmind (www.sdqinfo.org).';
    var AVISO = 'O SDQ \u00e9 um instrumento de rastreio de dificuldades emocionais e comportamentais em crian\u00e7as e adolescentes de 4 a 17 anos; n\u00e3o \u00e9 diagn\u00f3stico. As faixas dependem de quem responde (pais ou professor) e, sempre que poss\u00edvel, conv\u00e9m comparar mais de um informante. O suplemento de impacto do SDQ (sofrimento, preju\u00edzo e sobrecarga) n\u00e3o faz parte desta vers\u00e3o. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function banda(k, v, l) {
        if (k === 'S') return v >= l[0] ? 0 : (v >= l[1] ? 1 : (v >= l[2] ? 2 : 3));
        return v <= l[0] ? 0 : (v <= l[1] ? 1 : (v <= l[2] ? 2 : 3));
    }
    function nomeFaixa(k, b) { return (k === 'S' ? NF_PRO : NF_DIF)[b]; }
    function segmentos(k, l, max) {
        if (k === 'S') return [{de: 0, ate: l[2] - 1, b: 3}, {de: l[2], ate: l[1] - 1, b: 2}, {de: l[1], ate: l[0] - 1, b: 1}, {de: l[0], ate: max, b: 0}];
        return [{de: 0, ate: l[0], b: 0}, {de: l[0] + 1, ate: l[1], b: 1}, {de: l[1] + 1, ate: l[2], b: 2}, {de: l[2] + 1, ate: max, b: 3}];
    }
    function normResp(txt) {
        var t = String(txt || '').toLowerCase();
        if (/prof/.test(t)) return {chave: 'professor', rotulo: 'Professor', nota: ''};
        if (/auto/.test(t)) return {chave: 'auto', rotulo: 'Autoavalia\u00e7\u00e3o', nota: 'Este registro foi marcado como autoavalia\u00e7\u00e3o, mas os itens aplicados estavam escritos em terceira pessoa (vers\u00e3o de pais/professor). As faixas oficiais n\u00e3o foram aplicadas; interprete apenas as pontua\u00e7\u00f5es.'};
        if (/pais|respons|m[a\u00e3]e|pai/.test(t)) return {chave: 'pais', rotulo: 'Pais ou respons\u00e1vel', nota: ''};
        return {chave: 'pais', rotulo: 'N\u00e3o informado (faixas dos pais)', nota: 'Respondente n\u00e3o informado: foram usadas as faixas dos pais. Se quem respondeu foi um professor, as faixas oficiais s\u00e3o diferentes.'};
    }

    // ===================== CALCULO =====================
    // vals: 25 respostas BRUTAS (0=falso, 1=mais ou menos, 2=verdadeiro)
    function calcular(vals, respondente, convivio) {
        if (!vals || vals.length !== 25) throw new Error('SDQ: respostas incompletas');
        var r = {vals: [], pts: [], sub: {E: 0, C: 0, H: 0, P: 0, S: 0}, total: 0, convivio: convivio || ''}, i;
        for (i = 0; i < 25; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 2)) throw new Error('SDQ: resposta invalida no item ' + (i + 1));
            var p = ITENS[i].inv ? 2 - v : v;
            r.vals.push(v); r.pts.push(p); r.sub[ITENS[i].s] += p;
        }
        r.total = r.sub.E + r.sub.C + r.sub.H + r.sub.P;
        r.resp = normResp(respondente);
        r.faixas = null;
        if (r.resp.chave !== 'auto') {
            var l = LIM[r.resp.chave];
            r.faixas = {T: banda('T', r.total, l.T)};
            ORDEM.forEach(function (k) { r.faixas[k] = banda(k, r.sub[k], l[k]); });
        }
        return r;
    }
    function valor(r, k) { return k === 'T' ? r.total : r.sub[k]; }
    function classifGeral(r) {
        return 'Total de dificuldades ' + r.total + '/40' + (r.faixas ? ' - ' + nomeFaixa('T', r.faixas.T) : ' - sem faixa (autoavalia\u00e7\u00e3o)');
    }
    function dadosPainel(r) {
        var o = {};
        ['T'].concat(ORDEM).forEach(function (k) {
            o[SUBS[k].curto] = {pontuacao: valor(r, k), max: SUBS[k].max, classificacao: r.faixas ? nomeFaixa(k, r.faixas[k]) : 'Sem faixa (autoavalia\u00e7\u00e3o)'};
        });
        return o;
    }
    function analise(r) {
        var out = [], i, k;
        if (r.faixas) {
            out.push({t: 'Resultado geral', x: 'Total de Dificuldades ' + r.total + ' de 40: ' + nomeFaixa('T', r.faixas.T).toLowerCase() + ' (faixas de ' + r.resp.rotulo.toLowerCase() + ').' + (r.faixas.T >= 2 ? ' O total est\u00e1 em n\u00edvel que justifica avalia\u00e7\u00e3o cl\u00ednica mais detalhada.' : ' O total n\u00e3o indica, por si s\u00f3, dificuldades relevantes; observe as subescalas.')});
            var altas = ['E', 'C', 'H', 'P'].filter(function (x) { return r.faixas[x] >= 2; });
            out.push({t: 'Subescalas em faixa alta', x: altas.length ? altas.map(function (x) { return SUBS[x].nome + ' (' + r.sub[x] + '/10, ' + nomeFaixa(x, r.faixas[x]).toLowerCase() + ')'; }).join('; ') + '.' : 'Nenhuma das quatro subescalas de dificuldades est\u00e1 em faixa alta ou muito alta.'});
            out.push({t: 'Comportamento pr\u00f3-social', x: 'Pontua\u00e7\u00e3o ' + r.sub.S + ' de 10: ' + nomeFaixa('S', r.faixas.S).toLowerCase() + '. Esta subescala mede pontos fortes e n\u00e3o entra no Total de Dificuldades; valores baixos indicam menos comportamentos de ajuda e coopera\u00e7\u00e3o.'});
        } else {
            out.push({t: 'Resultado geral', x: 'Total de Dificuldades ' + r.total + ' de 40. ' + r.resp.nota});
        }
        if (r.faixas && r.resp.nota) out.push({t: 'Aten\u00e7\u00e3o ao respondente', x: r.resp.nota});
        out.push({t: 'Como interpretar', x: 'As faixas oficiais s\u00e3o diferentes para pais e professor (por exemplo, no total, alto a partir de 17 para pais e de 16 para professor). Em geral, pais e professores veem a crian\u00e7a em contextos distintos; diferen\u00e7as entre os dois relatos s\u00e3o informativas e pedem investiga\u00e7\u00e3o do contexto.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.sdqv h2{color:#00695c;margin-bottom:16px;text-align:center}' +
        '.sdqv h3{color:#00695c;margin:26px 0 10px;font-size:1.12em}' +
        '.sdqv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.sdqv-res b{font-size:1.5em;display:block}' +
        '.sdqv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.sdqv-bar{display:flex;height:22px;border-radius:6px;overflow:hidden;position:relative;margin:4px 0 2px}' +
        '.sdqv-bar>div{height:22px}' +
        '.sdqv-mk{position:absolute;top:-3px;width:5px;height:28px;background:#263238;border-radius:3px;margin-left:-2px}' +
        '.sdqv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.sdqv-tab th{background:#00695c;color:#fff;padding:7px 4px}.sdqv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.sdqv-bdg{display:inline-block;padding:2px 10px;border-radius:12px;font-size:.82em;font-weight:700;border:1px solid}' +
        '.sdqv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('sdqv-css')) return;
        var st = document.createElement('style'); st.id = 'sdqv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function barraHtml(r, k) {
        var max = SUBS[k].max, v = valor(r, k), h, i;
        var segs = r.faixas ? segmentos(k, LIM[r.resp.chave][k], max) : [{de: 0, ate: max, b: -1}];
        h = '<div class="sdqv-bar">';
        for (i = 0; i < segs.length; i++) h += '<div style="width:' + ((segs[i].ate - segs[i].de + 1) / (max + 1) * 100) + '%;background:' + (segs[i].b < 0 ? '#cfd8dc' : COR[segs[i].b].seg) + ';opacity:.55;border-right:1px solid #fff"></div>';
        h += '<div class="sdqv-mk" style="left:' + ((v + 0.5) / (max + 1) * 100) + '%"></div></div>';
        return h;
    }
    function badge(r, k) {
        if (!r.faixas) return '<span class="sdqv-bdg" style="background:#eceff1;color:#546e7a;border-color:#90a4ae">sem faixa</span>';
        var c = COR[r.faixas[k]];
        return '<span class="sdqv-bdg" style="background:' + c.bg + ';color:' + c.fg + ';border-color:' + c.seg + '">' + nomeFaixa(k, r.faixas[k]) + '</span>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="sdqv"><h2>&#129504; Resultados SDQ</h2>';
        var c = r.faixas ? COR[r.faixas.T] : {seg: '#90a4ae', bg: '#eceff1', fg: '#37474f'};
        h += '<div class="sdqv-res" style="background:' + c.bg + ';border-color:' + c.seg + ';color:' + c.fg + '"><b>' + (r.faixas ? nomeFaixa('T', r.faixas.T) : 'Sem faixa') + ' \u2014 Total de Dificuldades ' + r.total + ' / 40</b>Respondente: ' + esc(r.resp.rotulo) + (r.convivio ? ' | Conv\u00edvio: ' + esc(r.convivio) : '') + '</div>';
        h += '<h3>&#128202; Perfil por subescala</h3><div class="sdqv-box">';
        ['T'].concat(ORDEM).forEach(function (kk) {
            h += '<div style="margin:10px 0 14px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"><b>' + SUBS[kk].nome + ': ' + valor(r, kk) + ' / ' + SUBS[kk].max + '</b>' + badge(r, kk) + '</div>' + barraHtml(r, kk) + '</div>';
        });
        h += '<div style="font-size:.82em;color:#666">Cores: verde = pr\u00f3ximo da m\u00e9dia, amarelo = ligeiramente elevado (ou baixo), laranja = alto (ou baixo), vermelho = muito alto (ou muito baixo). O marcador escuro mostra a pontua\u00e7\u00e3o. No pr\u00f3-social, quanto menor, pior.</div></div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="sdqv-tab"><thead><tr><th>#</th><th>Sub.</th><th style="text-align:left">Afirma\u00e7\u00e3o</th><th>Resposta</th><th>Pontos</th></tr></thead><tbody>';
        for (i = 0; i < 25; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td style="text-align:center">' + ITENS[i].s + '</td><td>' + esc(ITENS[i].t) + (ITENS[i].inv ? ' <span style="font-size:.75em;color:#6a1b9a;font-weight:700">(invertido)</span>' : '') + '</td><td style="text-align:center">' + RESP[r.vals[i]] + '</td><td style="text-align:center;font-weight:700">' + r.pts[i] + '</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="sdqv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="sdqv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#00695c';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
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
    function barraPDF(c, r, k) {
        var doc = c.doc, max = SUBS[k].max, v = valor(r, k), x0 = ML + 2, w = CW - 4, i;
        c.need(16);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(SUBS[k].nome + ': ' + v + ' / ' + max), x0, c.y + 3.6);
        var rot = r.faixas ? nomeFaixa(k, r.faixas[k]) : 'sem faixa';
        var cc = r.faixas ? COR[r.faixas[k]] : {fg: '#546e7a'};
        T(doc, cc.fg); doc.setFontSize(8.2); doc.text(pt(rot), x0 + w, c.y + 3.6, {align: 'right'});
        var segs = r.faixas ? segmentos(k, LIM[r.resp.chave][k], max) : [{de: 0, ate: max, b: -1}];
        var yb = c.y + 5.4, hb = 5.2;
        for (i = 0; i < segs.length; i++) {
            var sx = x0 + w * segs[i].de / (max + 1), sw = w * (segs[i].ate - segs[i].de + 1) / (max + 1);
            if (segs[i].b < 0) F(doc, '#cfd8dc'); else { var q = rgb(COR[segs[i].b].seg); doc.setFillColor(Math.round(q[0] + (255 - q[0]) * 0.4), Math.round(q[1] + (255 - q[1]) * 0.4), Math.round(q[2] + (255 - q[2]) * 0.4)); }
            doc.rect(sx, yb, sw, hb, 'F');
            D(doc, '#ffffff'); doc.setLineWidth(0.3); doc.line(sx + sw, yb, sx + sw, yb + hb);
        }
        var mx = x0 + w * (v + 0.5) / (max + 1);
        F(doc, '#263238'); doc.rect(mx - 0.7, yb - 1, 1.4, hb + 2, 'F');
        c.y += 14;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#fb8c00'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('SDQ - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Strengths and Difficulties Questionnaire - Question\u00e1rio de Capacidades e Dificuldades'), 105, 22, {align: 'center'});
        doc.text(pt('Goodman (1997) | vers\u00e3o brasileira: Fleitlich et al. (2000) | ' + DIREITOS), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Crian\u00e7a/Adolescente: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Respondente: ' + r.resp.rotulo + (r.convivio ? '   |   Conv\u00edvio: ' + r.convivio : '')), 20, y + 22);
        c.y = 72;

        var cb = r.faixas ? COR[r.faixas.T] : {seg: '#90a4ae', bg: '#eceff1', fg: '#37474f'};
        F(doc, cb.bg); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, cb.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, cb.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt((r.faixas ? nomeFaixa('T', r.faixas.T) : 'Sem faixa') + ' - Total de Dificuldades ' + r.total + ' / 40'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.faixas ? 'Faixas oficiais de ' + r.resp.rotulo.toLowerCase() : 'Autoavalia\u00e7\u00e3o: faixas n\u00e3o aplicadas'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'PERFIL POR SUBESCALA');
        ['T'].concat(ORDEM).forEach(function (kk) { barraPDF(c, r, kk); });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2);
        doc.text(doc.splitTextToSize(pt('Cores: verde = pr\u00f3ximo da m\u00e9dia; amarelo = ligeiramente elevado (ou baixo); laranja = alto (ou baixo); vermelho = muito alto (ou muito baixo). O marcador escuro mostra a pontua\u00e7\u00e3o. No pr\u00f3-social, quanto menor, pior.'), CW - 4), ML + 2, c.y + 1);
        c.y += 10;

        secao(c, 'AN\u00c1LISE');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 6;

        c.need(60);
        secao(c, 'RESPOSTAS');
        var cn = 8, cs = 10, ct = 118, ca = 34, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Sub.', xT + cn + cs / 2, c.y + 4.7, {align: 'center'});
        doc.text(pt('Afirma\u00e7\u00e3o'), xT + cn + cs + 2, c.y + 4.7); doc.text('Resposta (pontos)', xT + cn + cs + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < 25; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tl = doc.splitTextToSize(pt(ITENS[i].t + (ITENS[i].inv ? ' (invertido)' : '')), ct - 3), rh = Math.max(5.6, tl.length * 3.3 + 2.6);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#f3f7f6'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            doc.text(ITENS[i].s, xT + cn + cs / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tl, xT + cn + cs + 2, c.y + 3.6);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(RESP[r.vals[i]] + ' (' + r.pts[i] + ')'), xT + cn + cs + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
            c.y += rh;
        }
        c.y += 6;

        c.need(60);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.3 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.3 + 4;
        }
        c.need(8); T(doc, '#666666'); doc.setFontSize(7.6); doc.text(pt(DIREITOS), ML + 2, c.y + 3);
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | SDQ | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('SDQ_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'SDQ' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 25; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 2)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals, d.respondente, d.convivio); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_SDQ = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, ITENS: ITENS, RESP: RESP};
})();
