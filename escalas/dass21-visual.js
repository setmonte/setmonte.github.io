// dass21-visual.js - Desenho sob medida do DASS-21 (tela de resultados + PDF da escala e do Painel).
// Calcula, monta a tela e gera o PDF com os MESMOS dados, para tudo sair igual.
// Calculo identico ao da escala: soma de cada subescala x2 (equivalencia DASS-42), faixas de
// Lovibond & Lovibond (1995) por subescala (escore <= max da faixa).
// Aviso de desesperanca (decisao do neuropsicologo): item 10 ou 21 marcado como "Aplicou-se muito".
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    // Mesma ordem e mesmas subescalas da pagina dass-21.html (conferido em teste)
    var ITENS = [
        {texto: 'Achei dif\u00edcil me acalmar.', sub: 'E'},
        {texto: 'Percebi que estava com a boca seca.', sub: 'A'},
        {texto: 'N\u00e3o consegui ter nenhum sentimento positivo.', sub: 'D'},
        {texto: 'Tive dificuldade em respirar (ex: respira\u00e7\u00e3o ofegante, falta de ar sem ter feito esfor\u00e7o f\u00edsico).', sub: 'A'},
        {texto: 'Achei dif\u00edcil ter iniciativa para fazer as coisas.', sub: 'D'},
        {texto: 'Tive tend\u00eancia a reagir de forma exagerada em determinadas situa\u00e7\u00f5es.', sub: 'E'},
        {texto: 'Senti tremores (ex: nas m\u00e3os).', sub: 'A'},
        {texto: 'Senti que estava gastando muita energia nervosa.', sub: 'E'},
        {texto: 'Preocupei-me com situa\u00e7\u00f5es em que eu pudesse entrar em p\u00e2nico e fazer papel de rid\u00edculo(a).', sub: 'A'},
        {texto: 'Senti que n\u00e3o tinha nada a esperar do futuro.', sub: 'D'},
        {texto: 'Percebi que estava ficando agitado(a).', sub: 'E'},
        {texto: 'Achei dif\u00edcil relaxar.', sub: 'E'},
        {texto: 'Senti-me deprimido(a) e sem \u00e2nimo.', sub: 'D'},
        {texto: 'Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo.', sub: 'E'},
        {texto: 'Senti que ia entrar em p\u00e2nico.', sub: 'A'},
        {texto: 'N\u00e3o consegui me entusiasmar com nada.', sub: 'D'},
        {texto: 'Senti que n\u00e3o tinha muito valor como pessoa.', sub: 'D'},
        {texto: 'Senti que estava bastante irrit\u00e1vel.', sub: 'E'},
        {texto: 'Sabia que meu cora\u00e7\u00e3o estava alterado mesmo n\u00e3o tendo feito nenhum esfor\u00e7o f\u00edsico.', sub: 'A'},
        {texto: 'Senti medo sem motivo.', sub: 'A'},
        {texto: 'Senti que a vida n\u00e3o tinha sentido.', sub: 'D'}
    ];
    var ITENS_DESESPERANCA = [10, 21];
    var RESP = ['N\u00e3o se aplicou', 'Aplicou-se um pouco', 'Aplicou-se bastante', 'Aplicou-se muito'];
    var MAXSUB = 42;

    var NIVEIS = ['Normal', 'Leve', 'Moderado', 'Grave', 'Muito Grave'];
    var NIV = {
        'Normal': {seg: '#66bb6a', bg: '#c8e6c9', fg: '#1b5e20'},
        'Leve': {seg: '#9ccc65', bg: '#dcedc8', fg: '#33691e'},
        'Moderado': {seg: '#ffa726', bg: '#ffe0b2', fg: '#bf5600'},
        'Grave': {seg: '#ef5350', bg: '#ffcdd2', fg: '#b71c1c'},
        'Muito Grave': {seg: '#b71c1c', bg: '#ffcdd2', fg: '#7f0000'}
    };
    // Faixas (escore x2), igual a pagina: escore <= max
    var SUBS = [
        {k: 'D', nome: 'Depress\u00e3o', chave: 'Depressao', cor: '#1565c0', cortes: [9, 13, 20, 27, 999], faixas: ['0-9', '10-13', '14-20', '21-27', '28+'],
            desc: 'Humor rebaixado, falta de prazer e de iniciativa, desesperan\u00e7a e desvaloriza\u00e7\u00e3o de si.'},
        {k: 'A', nome: 'Ansiedade', chave: 'Ansiedade', cor: '#c62828', cortes: [7, 9, 14, 19, 999], faixas: ['0-7', '8-9', '10-14', '15-19', '20+'],
            desc: 'Rea\u00e7\u00f5es f\u00edsicas de ansiedade (boca seca, falta de ar, tremores, cora\u00e7\u00e3o acelerado), medo e sensa\u00e7\u00e3o de p\u00e2nico.'},
        {k: 'E', nome: 'Estresse', chave: 'Estresse', cor: '#e65100', cortes: [14, 18, 25, 33, 999], faixas: ['0-14', '15-18', '19-25', '26-33', '34+'],
            desc: 'Tens\u00e3o persistente: dificuldade de relaxar, irritabilidade, agita\u00e7\u00e3o e rea\u00e7\u00f5es exageradas.'}
    ];
    var TXT = {
        D: {
            'Normal': 'Os indicadores de humor est\u00e3o dentro da faixa esperada. Isso sugere que, na \u00faltima semana, a pessoa conseguiu manter sentimentos positivos, motiva\u00e7\u00e3o e senso de prop\u00f3sito em n\u00edveis saud\u00e1veis.',
            'Leve': 'H\u00e1 indicadores leves de humor rebaixado. A pessoa pode ter sentido alguma dificuldade de motiva\u00e7\u00e3o ou momentos de desinteresse na \u00faltima semana, o que \u00e9 comum em per\u00edodos de maior demanda.',
            'Moderado': 'Os indicadores apontam para humor moderadamente rebaixado. Isso pode se manifestar como dificuldade de sentir prazer, falta de energia, sentimentos de inadequa\u00e7\u00e3o ou desesperan\u00e7a em rela\u00e7\u00e3o ao futuro.',
            'Grave': 'Os indicadores sugerem humor significativamente rebaixado. Perda de interesse, dificuldade de se sentir valorizada(o) e falta de perspectiva podem estar impactando o dia a dia de forma importante.',
            'Muito Grave': 'Os indicadores apontam para um rebaixamento intenso do humor, que pode incluir sentimentos persistentes de vazio, desesperan\u00e7a e dificuldade em encontrar sentido. Recomenda-se avalia\u00e7\u00e3o cl\u00ednica priorit\u00e1ria.'
        },
        A: {
            'Normal': 'Os n\u00edveis de ansiedade est\u00e3o na faixa esperada. As rea\u00e7\u00f5es fisiol\u00f3gicas (batimentos card\u00edacos, respira\u00e7\u00e3o e tremores) parecem estar sob controle.',
            'Leve': 'H\u00e1 indicadores leves de ansiedade. A pessoa pode ter percebido algumas rea\u00e7\u00f5es f\u00edsicas (boca seca, respira\u00e7\u00e3o alterada) ou preocupa\u00e7\u00f5es pontuais que n\u00e3o chegaram a ser limitantes.',
            'Moderado': 'Os indicadores apontam ansiedade moderada. Sintomas como palpita\u00e7\u00f5es, sensa\u00e7\u00e3o de p\u00e2nico, tremores ou medo sem motivo aparente podem estar presentes com alguma frequ\u00eancia.',
            'Grave': 'Os indicadores sugerem ansiedade significativa. Rea\u00e7\u00f5es f\u00edsicas intensas e preocupa\u00e7\u00f5es persistentes podem estar interferindo nas atividades di\u00e1rias e no bem-estar.',
            'Muito Grave': 'Os indicadores apontam para ansiedade intensa. Sintomas f\u00edsicos frequentes e medo intenso podem estar prejudicando significativamente a qualidade de vida. Recomenda-se avalia\u00e7\u00e3o profissional.'
        },
        E: {
            'Normal': 'O n\u00edvel de estresse est\u00e1 dentro do esperado. A pessoa parece estar conseguindo lidar com as demandas di\u00e1rias sem sobrecarga excessiva.',
            'Leve': 'H\u00e1 indicadores leves de estresse. A pessoa pode ter se sentido um pouco mais irritada ou com dificuldade de relaxar, o que \u00e9 comum em semanas mais exigentes.',
            'Moderado': 'Os indicadores apontam estresse moderado. Dificuldade de relaxar, irrita\u00e7\u00e3o excessiva e sensa\u00e7\u00e3o de estar sempre "no limite" podem estar presentes no cotidiano.',
            'Grave': 'Os indicadores sugerem n\u00edvel de estresse elevado. Agita\u00e7\u00e3o, intoler\u00e2ncia, rea\u00e7\u00f5es exageradas e dificuldade de se acalmar podem estar comprometendo as rela\u00e7\u00f5es e a produtividade.',
            'Muito Grave': 'Os indicadores apontam para sobrecarga intensa de estresse. O sistema nervoso pode estar em estado de hiperativa\u00e7\u00e3o constante, afetando sono, humor e sa\u00fade f\u00edsica. Recomenda-se acompanhamento profissional.'
        }
    };
    var REFS = [
        'LOVIBOND, S. H.; LOVIBOND, P. F. Manual for the Depression Anxiety Stress Scales. 2nd ed. Sydney: Psychology Foundation, 1995.',
        'VIGNOLA, R. C. B.; TUCCI, A. M. Adaptation and validation of the Depression, Anxiety and Stress Scale (DASS) to Brazilian Portuguese. Journal of Affective Disorders, v. 155, p. 104-109, 2014.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var QV = [{bg: '#eceff1', fg: '#607d8b'}, {bg: '#fff59d', fg: '#6d5f00'}, {bg: '#ffb74d', fg: '#6d3a00'}, {bg: '#ef5350', fg: '#ffffff'}];

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function lista(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }
    function classificar(s, escore) { for (var i = 0; i < s.cortes.length; i++) { if (escore <= s.cortes[i]) return NIVEIS[i]; } return 'Muito Grave'; }

    // ===================== CALCULO =====================
    // vals: array com as 21 respostas (0 a 3), na ordem dos itens
    function calcular(vals) {
        if (!vals || vals.length !== ITENS.length) throw new Error('DASS-21: respostas incompletas');
        var i, k, out = {subs: [], vals: [], desesp: []};
        for (i = 0; i < ITENS.length; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('DASS-21: resposta invalida no item ' + (i + 1));
            out.vals.push(v);
        }
        for (k = 0; k < SUBS.length; k++) {
            var S = SUBS[k], soma = 0, itens = [], muito = [];
            for (i = 0; i < ITENS.length; i++) {
                if (ITENS[i].sub !== S.k) continue;
                soma += out.vals[i]; itens.push(i + 1);
                if (out.vals[i] === 3) muito.push(i + 1);
            }
            var escore = soma * 2, cl = classificar(S, escore);
            out.subs.push({k: S.k, nome: S.nome, chave: S.chave, cor: S.cor, desc: S.desc, cortes: S.cortes, faixas: S.faixas,
                bruto: soma, escore: escore, cl: cl, nivel: NIVEIS.indexOf(cl), itens: itens, muito: muito});
        }
        for (i = 0; i < ITENS_DESESPERANCA.length; i++) { if (out.vals[ITENS_DESESPERANCA[i] - 1] === 3) out.desesp.push(ITENS_DESESPERANCA[i]); }
        out.total = out.subs[0].escore + out.subs[1].escore + out.subs[2].escore;
        return out;
    }

    function analise(res) {
        var out = [], i, maxN = -1, topo = [];
        for (i = 0; i < res.subs.length; i++) {
            var s = res.subs[i];
            out.push({t: s.nome + ' - ' + s.cl + ' (' + s.escore + ' de 42)', x: TXT[s.k][s.cl], cor: s.cor});
            if (s.nivel > maxN) { maxN = s.nivel; topo = [s.nome]; } else if (s.nivel === maxN) topo.push(s.nome);
        }
        var lp;
        if (maxN === 0) lp = 'As tr\u00eas subescalas est\u00e3o na faixa Normal: o relato da \u00faltima semana n\u00e3o indica sofrimento emocional relevante.';
        else if (topo.length === 3) lp = 'As tr\u00eas subescalas est\u00e3o no mesmo n\u00edvel (' + NIVEIS[maxN] + '), indicando sofrimento distribu\u00eddo entre humor, ansiedade e tens\u00e3o.';
        else lp = 'O perfil mostra predom\u00ednio de ' + lista(topo).toLowerCase() + ' (faixa ' + NIVEIS[maxN] + '). Como cada subescala tem faixas pr\u00f3prias, a compara\u00e7\u00e3o \u00e9 feita pela classifica\u00e7\u00e3o, e n\u00e3o pelo n\u00famero bruto.';
        out.push({t: 'Leitura do perfil', x: lp});
        var partes = [];
        for (i = 0; i < res.subs.length; i++) { if (res.subs[i].muito.length) partes.push(res.subs[i].nome + ': ' + res.subs[i].muito.join(', ')); }
        out.push({t: 'Itens mais intensos', x: partes.length ? 'Itens marcados como "Aplicou-se muito": ' + partes.join(' | ') + '. Vale explor\u00e1-los na entrevista cl\u00ednica.' : 'Nenhum item foi marcado como "Aplicou-se muito".'});
        return out;
    }
    var AVISO = 'A DASS-21 \u00e9 um instrumento de rastreio dimensional que mede sintomas da \u00faltima semana. N\u00e3o \u00e9 diagn\u00f3stico. Os escores s\u00e3o multiplicados por 2 para equivaler \u00e0 vers\u00e3o completa (DASS-42). Interpretar por profissional qualificado.';
    function textoDesesp(res) {
        var it = [];
        for (var i = 0; i < res.desesp.length; i++) it.push('item ' + res.desesp[i] + ' ("' + ITENS[res.desesp[i] - 1].texto + '")');
        return 'Foi marcado como "Aplicou-se muito" ' + lista(it) + '. A DASS-21 n\u00e3o avalia idea\u00e7\u00e3o suicida diretamente, mas desesperan\u00e7a intensa merece investiga\u00e7\u00e3o cuidadosa do risco.';
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.dassv h2{color:#283593;margin-bottom:16px;text-align:center}' +
        '.dassv h3{color:#283593;margin:26px 0 10px;font-size:1.12em}' +
        '.dassv-sem{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:8px 0 6px}' +
        '.dassv-circ{width:150px;text-align:center}' +
        '.dassv-bola{width:112px;height:112px;border-radius:50%;margin:0 auto 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.15)}' +
        '.dassv-bola b{font-size:2em;line-height:1}.dassv-bola span{font-size:.72em;font-weight:600;opacity:.9}' +
        '.dassv-circ .nm{font-weight:700;font-size:.98em}.dassv-circ .cl{font-size:.82em;font-weight:700;padding:2px 10px;border-radius:10px;display:inline-block;margin-top:4px}' +
        '.dassv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.dassv-alerta{background:#ffebee;border:3px solid #c62828;color:#b71c1c;border-radius:12px;padding:16px 20px;margin:14px 0;line-height:1.7}' +
        '.dassv-alerta b.tit{display:block;font-size:1.06em;margin-bottom:4px}' +
        '.dassv-term{background:#fff;border-radius:10px;padding:14px 18px 10px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.06);border-left:6px solid #283593}' +
        '.dassv-term .topo{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
        '.dassv-term h4{font-size:1.03em}' +
        '.dassv-badge{display:inline-block;padding:3px 11px;border-radius:12px;font-size:.78em;font-weight:700;white-space:nowrap}' +
        '.dassv-term .dsc{font-size:.84em;color:#666;margin:4px 0 0}' +
        '.dassv-reg{position:relative;margin:46px 10px 26px}' +
        '.dassv-bar{display:flex;height:22px;border-radius:11px;overflow:hidden;box-shadow:inset 0 1px 4px rgba(0,0,0,.25)}' +
        '.dassv-bol{position:absolute;top:-40px;transform:translateX(-50%);color:#fff;padding:3px 12px;border-radius:12px;font-weight:700;white-space:nowrap}' +
        '.dassv-bol:after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid;border-top-color:inherit}' +
        '.dassv-lab{position:absolute;top:26px;transform:translateX(-50%);font-size:.7em;color:#555;white-space:nowrap}' +
        '.dassv-leg{font-size:.8em;color:#555;margin:6px 0 10px}.dassv-leg span{display:inline-block;margin-right:14px}' +
        '.dassv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle;border:1px solid #ccc}' +
        '.dassv-ml{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}' +
        '.dassv-mr{width:110px;font-size:.84em;font-weight:700}' +
        '.dassv-q{width:36px;height:34px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85em;cursor:help}' +
        '.dassv-perfil{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.dassv-perfil svg{flex:0 0 auto}' +
        '.dassv-perfil .dassv-box{flex:1 1 260px;margin:0}' +
        '.dassv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '.dassv table{width:100%;border-collapse:collapse;font-size:.84em;margin-top:6px}.dassv th{background:#283593;color:#fff;padding:7px}.dassv td{padding:6px;text-align:center;border-bottom:1px solid #eee}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('dassv-css')) return;
        var st = document.createElement('style'); st.id = 'dassv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function svgPerfil(res) {
        // Triangulo do perfil: cada ponta = escore/42 da subescala
        var cx = 130, cy = 128, R = 92, i, ang = [-90, 30, 150], pts = [], h = '<svg width="260" height="250" viewBox="0 0 260 250" role="img" aria-label="Tri\u00e2ngulo do perfil">';
        function p(a, f) { var r = a * Math.PI / 180; return [(cx + Math.cos(r) * R * f).toFixed(1), (cy + Math.sin(r) * R * f).toFixed(1)]; }
        for (var g = 1; g <= 4; g++) {
            var q = [p(ang[0], g / 4), p(ang[1], g / 4), p(ang[2], g / 4)];
            h += '<polygon points="' + q.join(' ') + '" fill="none" stroke="#cfd8dc" stroke-width="1"/>';
        }
        for (i = 0; i < 3; i++) { var e = p(ang[i], 1); h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="#cfd8dc"/>'; }
        for (i = 0; i < 3; i++) pts.push(p(ang[i], Math.max(0.03, res.subs[i].escore / MAXSUB)));
        h += '<polygon points="' + pts.join(' ') + '" fill="rgba(40,53,147,.22)" stroke="#283593" stroke-width="2.5"/>';
        for (i = 0; i < 3; i++) {
            var s = res.subs[i], n = NIV[s.cl], l = p(ang[i], 1.2);
            h += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="6" fill="' + n.seg + '" stroke="#fff" stroke-width="2"/>';
            h += '<text x="' + l[0] + '" y="' + l[1] + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + s.cor + '">' + s.nome + ' ' + s.escore + '</text>';
        }
        return h + '</svg>';
    }
    // opcoes.demo = true: nao inclui a analise escrita profissional (o modo demonstracao usa os textos proprios)
    function htmlTela(res, opcoes) {
        opcoes = opcoes || {};
        injetarCSS();
        var i, k, h = '<div class="dassv"><h2>&#129504; Resultados DASS-21</h2>';
        h += '<div class="dassv-sem">';
        for (i = 0; i < res.subs.length; i++) {
            var s = res.subs[i], n = NIV[s.cl];
            h += '<div class="dassv-circ"><div class="dassv-bola" style="background:' + n.seg + ';color:#fff"><b>' + s.escore + '</b><span>de 42</span></div>' +
                '<div class="nm" style="color:' + s.cor + '">' + s.nome + '</div><span class="cl" style="background:' + n.bg + ';color:' + n.fg + '">' + s.cl + '</span></div>';
        }
        h += '</div>';
        if (res.desesp.length) {
            h += '<div class="dassv-alerta"><b class="tit">&#9888;&#65039; ATEN\u00c7\u00c3O - DESESPERAN\u00c7A</b>' + esc(textoDesesp(res)) +
                '<br>Em situa\u00e7\u00e3o de crise: <b>CVV 188</b> (24 horas, gratuito) ou <b>SAMU 192</b>.</div>';
        }
        h += '<h3>&#127777;&#65039; Term\u00f4metros por subescala (0 a 42)</h3>';
        h += '<div class="dassv-box">Cada subescala tem as suas pr\u00f3prias faixas de gravidade (Lovibond e Lovibond, 1995). Por isso o mesmo n\u00famero pode ter classifica\u00e7\u00f5es diferentes: veja onde o marcador cai em cada r\u00e9gua.</div>';
        for (i = 0; i < res.subs.length; i++) {
            var sb = res.subs[i], nb = NIV[sb.cl], ini = 0;
            h += '<div class="dassv-term" style="border-left-color:' + sb.cor + '"><div class="topo"><h4 style="color:' + sb.cor + '">' + sb.nome + '</h4>' +
                '<span class="dassv-badge" style="background:' + nb.bg + ';color:' + nb.fg + '">' + sb.cl + ' \u00b7 ' + sb.escore + ' de 42 (bruto ' + sb.bruto + ' x2)</span></div>' +
                '<p class="dsc">' + sb.desc + '</p><div class="dassv-reg"><div class="dassv-bol" style="left:' + (sb.escore / MAXSUB * 100).toFixed(2) + '%;background:' + sb.cor + ';border-top-color:' + sb.cor + '">' + sb.escore + '</div><div class="dassv-bar">';
            for (k = 0; k < 5; k++) {
                var fim = k < 4 ? sb.cortes[k] + 1 : MAXSUB;
                h += '<div style="width:' + ((fim - ini) / MAXSUB * 100).toFixed(2) + '%;background:' + NIV[NIVEIS[k]].seg + ';' + (NIVEIS[k] === sb.cl ? '' : 'opacity:.55') + '" title="' + NIVEIS[k] + ': ' + sb.faixas[k] + '"></div>';
                ini = fim;
            }
            h += '</div>';
            h += '<div class="dassv-lab" style="left:0;transform:none">0</div>';
            for (k = 0; k < 4; k++) h += '<div class="dassv-lab" style="left:' + ((sb.cortes[k] + 1) / MAXSUB * 100).toFixed(2) + '%">' + (sb.cortes[k] + 1) + '</div>';
            h += '<div class="dassv-lab" style="left:100%;transform:translateX(-100%)">42</div></div></div>';
        }
        h += '<div class="dassv-leg">';
        for (k = 0; k < NIVEIS.length; k++) h += '<span><i style="background:' + NIV[NIVEIS[k]].seg + '"></i>' + NIVEIS[k] + '</span>';
        h += '</div>';
        h += '<h3>&#128314; Tri\u00e2ngulo do perfil</h3><div class="dassv-perfil">' + svgPerfil(res) +
            '<div class="dassv-box">Cada ponta do tri\u00e2ngulo \u00e9 uma subescala; quanto mais longe do centro, maior o escore (0 a 42). O formato mostra se o sofrimento est\u00e1 mais concentrado em humor, ansiedade ou tens\u00e3o. A cor de cada ponto indica a faixa de gravidade.</div></div>';
        h += '<h3>&#128506;&#65039; Mapa das 21 respostas</h3>';
        h += '<div class="dassv-leg">';
        for (k = 0; k < 4; k++) h += '<span><i style="background:' + QV[k].bg + '"></i>' + k + ' ' + RESP[k].toLowerCase() + '</span>';
        h += '</div>';
        for (i = 0; i < res.subs.length; i++) {
            var sm = res.subs[i];
            h += '<div class="dassv-ml"><div class="dassv-mr" style="color:' + sm.cor + '">' + sm.nome + '</div>';
            for (k = 0; k < sm.itens.length; k++) {
                var n2 = sm.itens[k], v = res.vals[n2 - 1];
                h += '<div class="dassv-q" style="background:' + QV[v].bg + ';color:' + QV[v].fg + '" title="Item ' + n2 + ': ' + esc(ITENS[n2 - 1].texto) + ' | ' + RESP[v] + '">' + n2 + '</div>';
            }
            h += '</div>';
        }
        h += '<div class="dassv-leg">Passe o mouse (ou toque) em um quadrado para ver a frase do item.</div>';
        if (!opcoes.demo) {
            var an = analise(res);
            h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
            for (i = 0; i < an.length; i++) h += '<div class="dassv-box"' + (an[i].cor ? ' style="border-left:5px solid ' + an[i].cor + '"' : '') + '><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        }
        h += '<h3>&#128203; Faixas de refer\u00eancia (escores x2)</h3><table><thead><tr><th>Subescala</th>';
        for (k = 0; k < NIVEIS.length; k++) h += '<th>' + NIVEIS[k] + '</th>';
        h += '</tr></thead><tbody>';
        for (i = 0; i < res.subs.length; i++) {
            h += '<tr><td style="font-weight:700;color:' + res.subs[i].cor + '">' + res.subs[i].nome + '</td>';
            for (k = 0; k < 5; k++) { var at = NIVEIS[k] === res.subs[i].cl; h += '<td' + (at ? ' style="background:' + NIV[NIVEIS[k]].bg + ';color:' + NIV[NIVEIS[k]].fg + ';font-weight:700"' : '') + '>' + res.subs[i].faixas[k] + '</td>'; }
            h += '</tr>';
        }
        h += '</tbody></table>';
        h += '<div class="dassv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#283593';
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
    function caixa(c, titulo, texto, corBarra) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10);
        var h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        if (corBarra) { F(doc, corBarra); doc.rect(ML, c.y, 1.6, h, 'F'); }
        var yy = c.y + 4.6;
        if (titulo) { T(doc, corBarra || AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function badge(doc, xDir, y, texto, bg, fg) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.5);
        var tw = doc.getTextWidth(pt(texto)) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.4, 2.6, 2.6, 'F');
        T(doc, fg); doc.text(pt(texto), xDir - tw / 2, y + 3.8, {align: 'center'});
    }

    function pdf(res, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);

        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('DASS-21 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Depress\u00e3o, Ansiedade e Estresse'), 105, 22, {align: 'center'});
        doc.text(pt('Lovibond e Lovibond (1995) | Vers\u00e3o brasileira: Vignola e Tucci (2014)'), 105, 28, {align: 'center'});

        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        // Semaforo-resumo
        var colW = CW / 3;
        for (i = 0; i < res.subs.length; i++) {
            var s = res.subs[i], n = NIV[s.cl], cx = ML + colW * i + colW / 2;
            F(doc, n.seg); doc.circle(cx, c.y + 13, 12.5, 'F');
            T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(17); doc.text(String(s.escore), cx, c.y + 14, {align: 'center'});
            doc.setFontSize(7); doc.setFont(undefined, 'normal'); doc.text('de 42', cx, c.y + 18.6, {align: 'center'});
            T(doc, s.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt(s.nome), cx, c.y + 31, {align: 'center'});
            doc.setFontSize(7.6); var tw = doc.getTextWidth(pt(s.cl)) + 6;
            F(doc, n.bg); doc.roundedRect(cx - tw / 2, c.y + 33, tw, 5.2, 2.5, 2.5, 'F');
            T(doc, n.fg); doc.text(pt(s.cl), cx, c.y + 36.7, {align: 'center'});
        }
        c.y += 44;

        if (res.desesp.length) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.5);
            var al = doc.splitTextToSize(pt(textoDesesp(res)), CW - 8), ha = 13 + al.length * 4 + 6;
            c.need(ha + 3);
            F(doc, '#ffebee'); doc.rect(ML, c.y, CW, ha, 'F'); D(doc, '#c62828'); doc.setLineWidth(0.8); doc.rect(ML, c.y, CW, ha, 'S');
            T(doc, '#b71c1c'); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt('ATEN\u00c7\u00c3O - DESESPERAN\u00c7A'), ML + 4, c.y + 6.5);
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.5); doc.text(al, ML + 4, c.y + 12);
            doc.setFont(undefined, 'bold'); doc.text(pt('Em crise: CVV 188 (24 horas, gratuito) ou SAMU 192.'), ML + 4, c.y + 12 + al.length * 4 + 2);
            c.y += ha + 5;
        }

        // Termometros
        secao(c, 'TERM\u00d4METROS POR SUBESCALA (0 a 42)');
        for (i = 0; i < res.subs.length; i++) {
            var sb = res.subs[i], nb = NIV[sb.cl];
            c.need(37);
            var y0 = c.y;
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, y0, CW, 34, 2, 2, 'FD');
            F(doc, sb.cor); doc.rect(ML, y0, 1.8, 34, 'F');
            T(doc, sb.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt(sb.nome), ML + 5, y0 + 6);
            badge(doc, ML + CW - 3, y0 + 2.2, sb.cl + ' - ' + sb.escore + ' de 42 (bruto ' + sb.bruto + ' x2)', nb.bg, nb.fg);
            T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6); doc.text(pt(sb.desc), ML + 5, y0 + 11);
            var bx = ML + 8, bw = CW - 16, by = y0 + 20, ini = 0;
            for (k = 0; k < 5; k++) {
                var fim = k < 4 ? sb.cortes[k] + 1 : MAXSUB, cor = NIV[NIVEIS[k]].seg;
                if (NIVEIS[k] !== sb.cl) { var cc = rgb(cor); doc.setFillColor(Math.round(cc[0] + (255 - cc[0]) * 0.45), Math.round(cc[1] + (255 - cc[1]) * 0.45), Math.round(cc[2] + (255 - cc[2]) * 0.45)); }
                else F(doc, cor);
                doc.rect(bx + ini / MAXSUB * bw, by, (fim - ini) / MAXSUB * bw + 0.2, 5.5, 'F');
                ini = fim;
            }
            var mx = bx + sb.escore / MAXSUB * bw;
            F(doc, sb.cor); doc.triangle(mx - 2.2, by - 3.4, mx + 2.2, by - 3.4, mx, by - 0.4, 'F');
            doc.setFont(undefined, 'bold'); doc.setFontSize(8); var tw2 = doc.getTextWidth(String(sb.escore)) + 5;
            doc.roundedRect(mx - tw2 / 2, by - 9, tw2, 5.6, 2, 2, 'F');
            T(doc, '#ffffff'); doc.text(String(sb.escore), mx, by - 5, {align: 'center'});
            T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.8);
            doc.text('0', bx, by + 9.2);
            for (k = 0; k < 4; k++) doc.text(String(sb.cortes[k] + 1), bx + (sb.cortes[k] + 1) / MAXSUB * bw, by + 9.2, {align: 'center'});
            doc.text('42', bx + bw, by + 9.2, {align: 'right'});
            c.y += 37;
        }
        // legenda das faixas
        var lx = ML + 2; doc.setFontSize(7.4); doc.setFont(undefined, 'normal');
        for (k = 0; k < NIVEIS.length; k++) { F(doc, NIV[NIVEIS[k]].seg); doc.roundedRect(lx, c.y - 2.8, 3.4, 3.4, 0.6, 0.6, 'F'); T(doc, '#555555'); doc.text(NIVEIS[k], lx + 5, c.y); lx += doc.getTextWidth(NIVEIS[k]) + 12; }
        c.y += 6;

        // Triangulo do perfil + tabela de faixas
        c.need(78);
        secao(c, 'TRI\u00c2NGULO DO PERFIL');
        var tcx = ML + 42, tcy = c.y + 34, R = 27, ang = [-90, 30, 150];
        function P(a, f) { var r = a * Math.PI / 180; return [tcx + Math.cos(r) * R * f, tcy + Math.sin(r) * R * f]; }
        D(doc, '#cfd8dc'); doc.setLineWidth(0.25);
        for (var g = 1; g <= 4; g++) { var A1 = P(ang[0], g / 4), B1 = P(ang[1], g / 4), C1 = P(ang[2], g / 4); doc.triangle(A1[0], A1[1], B1[0], B1[1], C1[0], C1[1], 'S'); }
        for (k = 0; k < 3; k++) { var E1 = P(ang[k], 1); doc.line(tcx, tcy, E1[0], E1[1]); }
        var pp = [];
        for (k = 0; k < 3; k++) pp.push(P(ang[k], Math.max(0.03, res.subs[k].escore / MAXSUB)));
        F(doc, '#c5cae9'); D(doc, AZ); doc.setLineWidth(0.8);
        doc.triangle(pp[0][0], pp[0][1], pp[1][0], pp[1][1], pp[2][0], pp[2][1], 'FD');
        for (k = 0; k < 3; k++) {
            F(doc, NIV[res.subs[k].cl].seg); D(doc, '#ffffff'); doc.setLineWidth(0.5); doc.circle(pp[k][0], pp[k][1], 1.8, 'FD');
            var L1 = P(ang[k], 1.28);
            T(doc, res.subs[k].cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
            doc.text(pt(res.subs[k].nome + ' ' + res.subs[k].escore), L1[0], L1[1] + 1, {align: 'center'});
        }
        // tabela de faixas ao lado
        var tx = ML + 92, ty = c.y + 6, cwT = [21, 12, 12, 15, 12, 16];
        F(doc, AZ); doc.rect(tx, ty, 88, 6, 'F');
        T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.6);
        var hd = ['Subescala', 'Normal', 'Leve', 'Moderado', 'Grave', 'Muito Grave'], xx = tx;
        for (k = 0; k < hd.length; k++) { doc.text(hd[k], xx + cwT[k] / 2, ty + 4, {align: 'center'}); xx += cwT[k]; }
        for (i = 0; i < res.subs.length; i++) {
            var ry = ty + 6 + i * 8, sr = res.subs[i]; xx = tx;
            F(doc, i % 2 ? '#f6f7fb' : '#ffffff'); doc.rect(tx, ry, 88, 8, 'F');
            T(doc, sr.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(7); doc.text(pt(sr.nome), xx + cwT[0] / 2, ry + 5.2, {align: 'center'}); xx += cwT[0];
            for (k = 0; k < 5; k++) {
                if (NIVEIS[k] === sr.cl) { F(doc, NIV[NIVEIS[k]].bg); doc.rect(xx, ry, cwT[k + 1], 8, 'F'); T(doc, NIV[NIVEIS[k]].fg); doc.setFont(undefined, 'bold'); }
                else { T(doc, '#444444'); doc.setFont(undefined, 'normal'); }
                doc.text(sr.faixas[k], xx + cwT[k + 1] / 2, ry + 5.2, {align: 'center'}); xx += cwT[k + 1];
            }
        }
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.3);
        doc.text(doc.splitTextToSize(pt('Cada ponta do tri\u00e2ngulo \u00e9 uma subescala (0 a 42). A cor do ponto indica a faixa de gravidade. As faixas destacadas na tabela s\u00e3o as obtidas.'), 88), tx, ty + 36);
        c.y += 72;

        // Mapa das respostas
        c.need(40);
        secao(c, 'MAPA DAS 21 RESPOSTAS');
        var lgx = ML + 2; doc.setFontSize(7.4); doc.setFont(undefined, 'normal');
        for (k = 0; k < 4; k++) { F(doc, QV[k].bg); D(doc, '#bdbdbd'); doc.setLineWidth(0.15); doc.roundedRect(lgx, c.y - 2.8, 3.4, 3.4, 0.6, 0.6, 'FD'); T(doc, '#555555'); var lt = k + ' ' + RESP[k].toLowerCase(); doc.text(pt(lt), lgx + 5, c.y); lgx += doc.getTextWidth(pt(lt)) + 11; }
        c.y += 4;
        for (i = 0; i < res.subs.length; i++) {
            var sm = res.subs[i], qx = ML + 32;
            T(doc, sm.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(sm.nome), ML + 2, c.y + 5.4);
            for (k = 0; k < sm.itens.length; k++) {
                var nI = sm.itens[k], v = res.vals[nI - 1];
                F(doc, QV[v].bg); doc.roundedRect(qx, c.y, 10, 8, 1.4, 1.4, 'F');
                T(doc, QV[v].fg); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(String(nI), qx + 5, c.y + 5.3, {align: 'center'});
                qx += 12;
            }
            c.y += 10.5;
        }
        c.y += 3;

        // Analise
        c.need(30);
        secao(c, 'AN\u00c1LISE DO PERFIL');
        var an = analise(res);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x, an[i].cor);

        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 3;

        // Respostas por item (continua na mesma pagina se couber o inicio da secao)
        c.y += 4;
        c.need(70);
        secao(c, 'RESPOSTAS DO PACIENTE POR SUBESCALA');
        for (i = 0; i < res.subs.length; i++) {
            var sx = res.subs[i];
            c.need(16);
            F(doc, '#e8eaf6'); doc.rect(ML, c.y, CW, 6.4, 'F');
            T(doc, sx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.8); doc.text(pt(sx.nome), ML + 3, c.y + 4.4);
            badge(doc, ML + CW - 2, c.y + 0.5, sx.cl + ' (' + sx.escore + ')', NIV[sx.cl].bg, NIV[sx.cl].fg);
            c.y += 8.6;
            for (k = 0; k < sx.itens.length; k++) {
                var ni = sx.itens[k], vi = res.vals[ni - 1];
                doc.setFont(undefined, 'normal'); doc.setFontSize(8);
                var tl = doc.splitTextToSize(pt(ni + '. ' + ITENS[ni - 1].texto), 128), hl = tl.length * 3.7 + 1.8;
                c.need(hl);
                T(doc, '#222222'); doc.text(tl, ML + 3, c.y + 3);
                T(doc, vi === 3 ? '#b71c1c' : '#000000'); doc.setFont(undefined, 'bold');
                doc.text(pt(RESP[vi] + ' (' + vi + ')'), ML + CW - 2, c.y + 3, {align: 'right'});
                c.y += hl;
            }
            c.y += 3;
        }

        // Referencias
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
            doc.text('SYM Online | DASS-21 | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('DASS-21_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    // ===================== PAINEL =====================
    // O painel guarda as 21 respostas (0 a 3) em d.respostas {1..21}. Devolve false se faltar algo.
    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'DASS-21' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) {
            var v = parseInt(d.respostas[i], 10);
            if (!(v >= 0 && v <= 3)) return false;
            vals.push(v);
        }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_DASS = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, ITENS: ITENS};
})();
