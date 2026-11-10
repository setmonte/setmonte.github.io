// ernd-visual.js - "Mascara" visual unica das tres ERND (Escala de Rastreio do Neurodesenvolvimento):
// ERND-Adolescentes (autorrelato), ERND-Pais e ERND-Professores. Escala propria do neuropsicologo.
// Calcula, monta a tela de resultados e gera o PDF (da escala e do Painel) com os MESMOS dados.
// O calculo reproduz exatamente o das escalas: item "presente" = resposta 2 ou 3; rastreio positivo
// com itens presentes >= limiar; gravidade pela soma (faixas proprias de cada versao); media = soma / n.
// Rotulos clinicos mantidos como estavam (inclusive "Nivel 1/2/3" no TEA) ate decisao do neuropsicologo.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var CFG = {
        'ERND-ADOLESCENTES': {sigla: 'ERND-Adolescentes', versao: 'Vers\u00e3o Autorrelato - 13 a 18 anos', n: 15, limiar: 7, sub: 5, cortes: [10, 20, 32],
            cor: '#6a1b9a', cor2: '#00838f', quem: 'o(a) adolescente', fonte: 'autorrelato',
            aviso: 'Esta escala \u00e9 um instrumento de rastreio baseado nos crit\u00e9rios do DSM-5-TR e n\u00e3o possui valida\u00e7\u00e3o emp\u00edrica formal. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional, testagem neuropsicol\u00f3gica ou diagn\u00f3stico especializado. Os resultados devem ser interpretados exclusivamente por profissional qualificado.',
            avisoExtra: 'Autorrelato: indicadores de TDI (racioc\u00ednio e aprendizagem) e de TEAp (leitura, escrita e matem\u00e1tica) relatados pelo pr\u00f3prio adolescente t\u00eam confiabilidade limitada e devem ser confirmados com outros informantes (pais, professores) e com testagem cognitiva e de desempenho escolar.'},
        'ERND-PAIS': {sigla: 'ERND-Pais', versao: 'Vers\u00e3o Pais/Cuidadores - 6 a 18 anos', n: 15, limiar: 7, sub: 5, cortes: [10, 20, 32],
            cor: '#1565c0', cor2: '#00897b', quem: 'a crian\u00e7a/adolescente', fonte: 'relato dos pais/cuidadores',
            aviso: 'Esta escala \u00e9 um instrumento de rastreio baseado nos crit\u00e9rios do DSM-5-TR e n\u00e3o possui valida\u00e7\u00e3o emp\u00edrica formal. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional, testagem neuropsicol\u00f3gica ou diagn\u00f3stico especializado. Os resultados devem ser interpretados exclusivamente por profissional qualificado.'},
        'ERND-PROFESSORES': {sigla: 'ERND-Professores', versao: 'Vers\u00e3o Professores - 6 a 18 anos - 25 itens', n: 5, limiar: 3, sub: 2, cortes: [3, 7, 11],
            cor: '#37474f', cor2: '#00695c', quem: 'o(a) aluno(a)', fonte: 'relato do(a) professor(a)',
            aviso: 'Esta escala \u00e9 um instrumento de rastreio baseado nos crit\u00e9rios do DSM-5-TR e n\u00e3o possui valida\u00e7\u00e3o emp\u00edrica formal. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional. Os resultados devem ser interpretados por profissional qualificado e complementados com dados de outras fontes (pais, autorrelato, avalia\u00e7\u00e3o cl\u00ednica).'}
    };
    function cfg(s) { return CFG[String(s || '').toUpperCase()] || null; }

    var ORDEM = ['TDI', 'TDAH', 'TEA', 'TOD', 'TEAp'];
    var TR = {
        TDI: {nome: 'Transtorno do Desenvolvimento Intelectual', curto: 'Racioc\u00ednio e aprendizagem', cor: '#7b1fa2'},
        TDAH: {nome: 'Transtorno de D\u00e9ficit de Aten\u00e7\u00e3o/Hiperatividade', curto: 'Aten\u00e7\u00e3o e inquieta\u00e7\u00e3o', cor: '#e65100'},
        TEA: {nome: 'Transtorno do Espectro Autista', curto: 'Intera\u00e7\u00e3o social e comportamentos repetitivos', cor: '#1565c0'},
        TOD: {nome: 'Transtorno Opositivo Desafiador', curto: 'Irritabilidade e oposi\u00e7\u00e3o', cor: '#c62828'},
        TEAp: {nome: 'Transtorno Espec\u00edfico da Aprendizagem', curto: 'Leitura, escrita e matem\u00e1tica', cor: '#00695c'}
    };
    var DOM_NOME = {
        'Conceitual': 'Conceitual', 'Social': 'Social', 'Pratico': 'Pr\u00e1tico',
        'Desatencao': 'Desaten\u00e7\u00e3o', 'Hiperatividade': 'Hiperatividade', 'Impulsividade': 'Impulsividade',
        'Comunicacao Social': 'Comunica\u00e7\u00e3o social', 'Comportamento Restrito': 'Comportamento restrito',
        'Humor Irritavel': 'Humor irrit\u00e1vel', 'Desafiador': 'Desafiador', 'Vingatividade': 'Vingatividade',
        'Leitura': 'Leitura', 'Escrita': 'Escrita', 'Matematica': 'Matem\u00e1tica', 'Geral': 'Geral'
    };
    var GRAV = {
        'Sem indicativo': {seg: '#4caf50', bg: '#c8e6c9', fg: '#1b5e20'},
        'Leve': {seg: '#ffc107', bg: '#fff8e1', fg: '#7a5a00'},
        'Moderado': {seg: '#ff9800', bg: '#ffe0b2', fg: '#bf5600'},
        'Grave': {seg: '#f44336', bg: '#ffcdd2', fg: '#b71c1c'}
    };
    var GRAV_ORD = ['Sem indicativo', 'Leve', 'Moderado', 'Grave'];
    // TEA: "Nivel 1/2/3 de suporte" substituido por indicadores (decisao do neuropsicologo, 2026-11-09):
    // o nivel de suporte do DSM-5-TR e um julgamento clinico e nao sai da soma do questionario.
    var TEA_NIV = [null, {texto: 'Indicadores leves', nivel: ''}, {texto: 'Indicadores moderados', nivel: ''}, {texto: 'Indicadores intensos', nivel: ''}];
    var NOTA_TEA = 'O n\u00edvel de suporte do TEA (DSM-5-TR) \u00e9 definido na avalia\u00e7\u00e3o cl\u00ednica, n\u00e3o pela soma deste question\u00e1rio.';
    var RESP = ['N\u00e3o', 'Um pouco', 'Bastante', 'Demais'];
    var QV = [{bg: '#eceff1', fg: '#607d8b'}, {bg: '#fff59d', fg: '#6d5f00'}, {bg: '#ffb74d', fg: '#6d3a00'}, {bg: '#ef5350', fg: '#ffffff'}];
    var REFS = [
        'AMERICAN PSYCHIATRIC ASSOCIATION. Manual Diagn\u00f3stico e Estat\u00edstico de Transtornos Mentais (DSM-5-TR). 5. ed., texto revisado. Porto Alegre: Artmed, 2023.',
        'ROHDE, L. A.; HALPERN, R. Transtorno de d\u00e9ficit de aten\u00e7\u00e3o/hiperatividade: atualiza\u00e7\u00e3o. Jornal de Pediatria, v. 80, n. 2 (supl.), p. S61-S70, 2004.',
        'SILVA, M.; MULICK, J. A. Diagnosticando o transtorno autista: aspectos fundamentais e considera\u00e7\u00f5es pr\u00e1ticas. Psicologia: Ci\u00eancia e Profiss\u00e3o, v. 29, n. 1, p. 116-131, 2009.',
        'BORDIN, I. A. S.; MARI, J. J.; CAEIRO, M. F. Valida\u00e7\u00e3o da vers\u00e3o brasileira do Child Behavior Checklist (CBCL) (Invent\u00e1rio de Comportamentos da Inf\u00e2ncia e Adolesc\u00eancia): dados preliminares. Revista ABP-APAL, v. 17, n. 2, p. 55-66, 1995.'
    ];

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function fmt(n, d) { return Number(n).toFixed(d === undefined ? 2 : d).replace('.', ','); }
    function lista(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }

    // ===================== CALCULO =====================
    // d = {sigla, respostas:[0..3], itens:[{texto, transtorno, dominio}] (opcional), transtornos:{TDI:{itens:[idx]}} (opcional)}
    function calcular(d) {
        var c = cfg(d.sigla);
        if (!c) throw new Error('ERND: versao desconhecida ' + d.sigla);
        var total = c.n * 5, vals = d.respostas || [], i, k;
        if (vals.length !== total) throw new Error('ERND: respostas incompletas');
        for (i = 0; i < total; i++) { var v = parseInt(vals[i], 10); if (!(v >= 0 && v <= 3)) throw new Error('ERND: resposta invalida no item ' + (i + 1)); vals[i] = v; }
        var itens = d.itens && d.itens.length === total ? d.itens : null;
        var res = {cfg: c, sigla: c.sigla, vals: vals, itens: itens, tr: [], positivos: [], escore: 0};
        for (k = 0; k < ORDEM.length; k++) {
            var sig = ORDEM[k];
            var idx = (d.transtornos && d.transtornos[sig] && d.transtornos[sig].itens) ? d.transtornos[sig].itens : (function () { var a = []; for (var j = 0; j < c.n; j++) a.push(k * c.n + j); return a; })();
            var soma = 0, cp = 0, subs = {}, ordemSub = [];
            for (i = 0; i < idx.length; i++) {
                var vv = vals[idx[i]];
                soma += vv; if (vv >= 2) cp++;
                if (itens) {
                    var dn = itens[idx[i]].dominio || 'Geral';
                    if (!subs[dn]) { subs[dn] = {nome: DOM_NOME[dn] || dn, soma: 0, n: 0}; ordemSub.push(dn); }
                    subs[dn].soma += vv; subs[dn].n++;
                }
            }
            var g = soma <= c.cortes[0] ? 0 : (soma <= c.cortes[1] ? 1 : (soma <= c.cortes[2] ? 2 : 3));
            var cl = (sig === 'TEA' && g > 0) ? {texto: TEA_NIV[g].texto, nivel: TEA_NIV[g].nivel, cor: [null, '#ffc107', '#ff9800', '#f44336'][g]} :
                {texto: GRAV_ORD[g], nivel: '', cor: ['#4caf50', '#ffc107', '#ff9800', '#f44336'][g]};
            var pos = cp >= c.limiar;
            if (pos) res.positivos.push(sig);
            res.escore += soma;
            res.tr.push({sig: sig, nome: (d.transtornos && d.transtornos[sig] && d.transtornos[sig].nome) || TR[sig].nome, curto: TR[sig].curto, cor: TR[sig].cor,
                idx: idx, soma: soma, max: c.n * 3, media: parseFloat((soma / c.n).toFixed(2)), cp: cp, positivo: pos, subclinico: !pos && cp >= c.sub,
                grau: g, gravNome: GRAV_ORD[g], cl: cl, subs: ordemSub.map(function (s) { var o = subs[s]; return {nome: o.nome, media: o.soma / o.n, n: o.n}; })});
        }
        res.classificacao = res.positivos.length > 0 ? 'Rastreio positivo: ' + res.positivos.join(', ') : 'Rastreio negativo';
        // formatos para o painel
        res.domPainel = {}; res.compat = {};
        for (k = 0; k < res.tr.length; k++) {
            var t = res.tr[k];
            res.domPainel[t.sig] = {pontuacao: t.soma, max: t.max, media: t.media, itensPresentes: t.cp,
                classificacao: t.cl.texto + (t.cl.nivel ? ' - ' + t.cl.nivel : '') + (t.positivo ? ' [POSITIVO]' : '')};
            res.compat[t.sig] = {soma: t.soma, media: t.media, criteriosPresentes: t.cp, classificacao: {texto: t.cl.texto, nivel: t.cl.nivel, cor: t.cl.cor}, rastreioPositivo: t.positivo};
        }
        if (itens) {
            res.respDet = [];
            for (i = 0; i < total; i++) res.respDet.push({n: i + 1, texto: itens[i].texto, transtorno: itens[i].transtorno, dominio: itens[i].dominio, valor: vals[i]});
        }
        return res;
    }

    function analise(res) {
        var c = res.cfg, out = [], i;
        for (i = 0; i < res.tr.length; i++) {
            var t = res.tr[i], x;
            if (t.positivo) x = 'Rastreio positivo: ' + t.cp + ' de ' + c.n + ' itens marcados como "Bastante" ou "Demais" (limiar: ' + c.limiar + '). Classifica\u00e7\u00e3o pela soma: ' + t.cl.texto + (t.cl.nivel ? ' (' + t.cl.nivel.toLowerCase() + ')' : '') + '. Recomenda-se avalia\u00e7\u00e3o aprofundada para ' + t.nome + '.';
            else {
                x = 'Rastreio negativo: ' + t.cp + ' de ' + c.n + ' itens marcados como "Bastante" ou "Demais", abaixo do limiar de ' + c.limiar + '. ';
                x += t.subclinico ? 'Embora negativo, h\u00e1 indicadores subcl\u00ednicos que merecem acompanhamento.' : 'Sem indicativos significativos no momento.';
                if (t.grau >= 2) x += ' Observa\u00e7\u00e3o: a soma est\u00e1 na faixa "' + t.cl.texto + '", mas poucos itens chegaram a "Bastante" ou "Demais" - a intensidade est\u00e1 espalhada em muitos itens de grau leve. Vale observar esse padr\u00e3o na entrevista.';
            }
            if (t.subs.length > 1) {
                var top = t.subs.slice().sort(function (a, b) { return b.media - a.media; })[0];
                if (top.media >= 1.5) x += ' Subdom\u00ednio mais marcado: ' + top.nome.toLowerCase() + ' (m\u00e9dia ' + fmt(top.media) + ' de 3).';
            }
            if (t.sig === 'TEA' && t.grau > 0) x += ' ' + NOTA_TEA;
            out.push({t: t.sig + ' - ' + t.curto, x: x, cor: t.cor});
        }
        var lc;
        if (!res.positivos.length) lc = 'Nenhuma das cinco condi\u00e7\u00f5es atingiu o limiar de rastreio pelo ' + c.fonte + '.';
        else if (res.positivos.length === 1) lc = 'O rastreio foi positivo apenas para ' + res.positivos[0] + '.';
        else lc = 'O rastreio foi positivo para ' + lista(res.positivos) + '. A sobreposi\u00e7\u00e3o de indicadores \u00e9 comum nos transtornos do neurodesenvolvimento e exige diagn\u00f3stico diferencial cuidadoso.';
        lc += ' Este resultado reflete o ' + c.fonte + ' e deve ser comparado com outros informantes e com a avalia\u00e7\u00e3o cl\u00ednica.';
        out.push({t: 'Leitura conjunta', x: lc});
        // Lembretes do DSM-5-TR (decisao do neuropsicologo): aparecem so quando o padrao pede
        var porSig = {};
        for (i = 0; i < res.tr.length; i++) porSig[res.tr[i].sig] = res.tr[i];
        var lem = [];
        function elevado(s) { return porSig[s].positivo || porSig[s].grau >= 2; }
        if (elevado('TDI') && elevado('TEAp')) lem.push('TDI e TEAp: pelo DSM-5-TR, o Transtorno Espec\u00edfico da Aprendizagem s\u00f3 se aplica quando as dificuldades n\u00e3o s\u00e3o mais bem explicadas por defici\u00eancia intelectual. Com indicadores nas duas \u00e1reas, a avalia\u00e7\u00e3o do funcionamento intelectual deve vir antes da conclus\u00e3o sobre TEAp.');
        if (elevado('TDAH') && elevado('TOD')) lem.push('TDAH e TOD: as duas condi\u00e7\u00f5es aparecem juntas com frequ\u00eancia. Vale investigar se a oposi\u00e7\u00e3o \u00e9 independente ou secund\u00e1ria \u00e0 impulsividade e \u00e0 frustra\u00e7\u00e3o ligadas ao TDAH.');
        if (lem.length) out.push({t: 'Lembretes do DSM-5-TR', x: lem.join(' ')});
        return out;
    }
    function avisoCompleto(c) { return c.aviso + (c.avisoExtra ? ' ' + c.avisoExtra : ''); }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.erndv h3{margin:26px 0 10px;font-size:1.12em}' +
        '.erndv h2{margin-bottom:16px;text-align:center}' +
        '.erndv-rast{padding:18px;border-radius:12px;text-align:center;margin:10px 0;font-size:1.1em;font-weight:700}' +
        '.erndv-pos{background:#ffcdd2;border:3px solid #c62828;color:#b71c1c}.erndv-neg{background:#c8e6c9;border:3px solid #2e7d32;color:#1b5e20}' +
        '.erndv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.erndv-card{background:#fff;padding:14px 18px 12px;border-radius:10px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.08);border-left:6px solid}' +
        '.erndv-topo{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.erndv-topo h4{font-size:1.02em}' +
        '.erndv-badge{display:inline-block;padding:3px 11px;border-radius:12px;font-size:.78em;font-weight:700;white-space:nowrap}' +
        '.erndv-sub{font-size:.82em;color:#666}' +
        '.erndv-reg{position:relative;margin:40px 8px 24px}' +
        '.erndv-bar{display:flex;height:18px;border-radius:9px;overflow:hidden;box-shadow:inset 0 1px 4px rgba(0,0,0,.25)}' +
        '.erndv-bol{position:absolute;top:-34px;transform:translateX(-50%);color:#fff;padding:2px 10px;border-radius:11px;font-weight:700;font-size:.88em;white-space:nowrap}' +
        '.erndv-lab{position:absolute;top:21px;transform:translateX(-50%);font-size:.68em;color:#555}' +
        '.erndv-slots{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:16px 0 4px}' +
        '.erndv-slot{width:22px;height:22px;border-radius:50%;background:#eceff1;color:#90a4ae;font-size:.68em;font-weight:700;display:flex;align-items:center;justify-content:center}' +
        '.erndv-lim{width:0;height:30px;border-left:3px dashed #b71c1c;margin:0 3px;position:relative}' +
        '.erndv-lim span{position:absolute;top:-15px;left:-18px;font-size:.62em;color:#b71c1c;font-weight:700;white-space:nowrap}' +
        '.erndv-subs{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:8px}' +
        '.erndv-sb{flex:1 1 170px;font-size:.78em;color:#444}.erndv-sb .f{height:8px;background:#eceff1;border-radius:4px;overflow:hidden;margin-top:3px}.erndv-sb .f div{height:100%}' +
        '.erndv-leg{font-size:.8em;color:#555;margin:6px 0 10px}.erndv-leg span{display:inline-block;margin-right:14px}' +
        '.erndv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle;border:1px solid #ccc}' +
        '.erndv-ml{display:flex;align-items:center;gap:5px;margin-bottom:7px;flex-wrap:wrap}' +
        '.erndv-mr{width:70px;font-size:.84em;font-weight:700}' +
        '.erndv-q{width:32px;height:30px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.78em;cursor:help}' +
        '.erndv-perfil{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.erndv-perfil .erndv-box{flex:1 1 260px;margin:0}' +
        '.erndv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('erndv-css')) return;
        var st = document.createElement('style'); st.id = 'erndv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function svgPentagono(res) {
        var cx = 140, cy = 132, R = 92, i, n = 5, h = '<svg width="280" height="270" viewBox="0 0 280 270" role="img" aria-label="Perfil das cinco condi\u00e7\u00f5es">';
        function p(k, f) { var a = (-90 + k * 72) * Math.PI / 180; return [(cx + Math.cos(a) * R * f).toFixed(1), (cy + Math.sin(a) * R * f).toFixed(1)]; }
        for (var g = 1; g <= 4; g++) { var q = []; for (i = 0; i < n; i++) q.push(p(i, g / 4)); h += '<polygon points="' + q.join(' ') + '" fill="none" stroke="#e0e0e0"/>'; }
        var pts = [];
        for (i = 0; i < n; i++) { var e = p(i, 1); h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="#e0e0e0"/>'; pts.push(p(i, Math.max(0.03, res.tr[i].soma / res.tr[i].max))); }
        h += '<polygon points="' + pts.join(' ') + '" fill="' + res.cfg.cor + '33" stroke="' + res.cfg.cor + '" stroke-width="2.5"/>';
        for (i = 0; i < n; i++) {
            var t = res.tr[i], l = p(i, 1.2);
            h += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="5.5" fill="' + (t.positivo ? '#e53935' : t.cor) + '" stroke="#fff" stroke-width="1.5"/>';
            h += '<text x="' + l[0] + '" y="' + l[1] + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + t.cor + '">' + t.sig + ' ' + Math.round(t.soma / t.max * 100) + '%</text>';
        }
        return h + '</svg>';
    }
    function htmlTela(res) {
        injetarCSS();
        var c = res.cfg, i, k, h = '<div class="erndv"><h2 style="color:' + c.cor + '">&#129504; Resultados ' + res.sigla + '</h2>';
        h += res.positivos.length ? '<div class="erndv-rast erndv-pos">RASTREIO POSITIVO para: ' + res.positivos.join(', ') + '</div>' : '<div class="erndv-rast erndv-neg">RASTREIO NEGATIVO \u2014 nenhuma condi\u00e7\u00e3o atingiu o limiar de rastreio</div>';
        h += '<h3 style="color:' + c.cor + '">&#127777;&#65039; As cinco condi\u00e7\u00f5es</h3>';
        h += '<div class="erndv-box">Cada cart\u00e3o mostra duas coisas: a <b>soma</b> (0 a ' + (c.n * 3) + ') na r\u00e9gua das faixas de gravidade e a <b>contagem de itens</b> marcados como "Bastante" ou "Demais" (c\u00edrculos vermelhos), com a linha do limiar de rastreio (' + c.limiar + ' de ' + c.n + ').</div>';
        for (i = 0; i < res.tr.length; i++) {
            var t = res.tr[i], gv = GRAV[t.gravNome], ini = 0;
            h += '<div class="erndv-card" style="border-left-color:' + t.cor + '"><div class="erndv-topo"><h4 style="color:' + t.cor + '">' + t.sig + ' \u2014 ' + esc(t.nome) + '</h4><span class="erndv-badge" style="background:' + (t.positivo ? '#ffcdd2' : '#c8e6c9') + ';color:' + (t.positivo ? '#b71c1c' : '#1b5e20') + '">Rastreio ' + (t.positivo ? 'POSITIVO' : 'negativo') + '</span></div>';
            h += '<div class="erndv-sub">' + t.curto + ' \u00b7 Soma <b>' + t.soma + '/' + t.max + '</b> \u00b7 m\u00e9dia ' + fmt(t.media) + ' \u00b7 <span class="erndv-badge" style="background:' + gv.bg + ';color:' + gv.fg + '">' + t.cl.texto + (t.cl.nivel ? ' \u2014 ' + t.cl.nivel : '') + '</span></div>';
            h += '<div class="erndv-reg"><div class="erndv-bol" style="left:' + (t.soma / t.max * 100).toFixed(2) + '%;background:' + t.cor + '">' + t.soma + '</div><div class="erndv-bar">';
            for (k = 0; k < 4; k++) { var fim = k < 3 ? c.cortes[k] + 1 : t.max + 1; h += '<div style="width:' + ((fim - ini) / (t.max + 1) * 100).toFixed(2) + '%;background:' + GRAV[GRAV_ORD[k]].seg + ';' + (k === t.grau ? '' : 'opacity:.5') + '"></div>'; ini = fim; }
            h += '</div>';
            for (k = 0; k < 3; k++) h += '<div class="erndv-lab" style="left:' + ((c.cortes[k] + 1) / (t.max + 1) * 100).toFixed(2) + '%">' + (c.cortes[k] + 1) + '</div>';
            h += '</div><div class="erndv-slots">';
            for (k = 1; k <= c.n; k++) {
                h += '<div class="erndv-slot"' + (k <= t.cp ? ' style="background:#e53935;color:#fff"' : '') + '>' + k + '</div>';
                if (k === c.limiar && k < c.n) h += '<div class="erndv-lim"><span>limiar ' + c.limiar + '</span></div>';
            }
            h += '</div>';
            if (t.sig === 'TEA' && t.grau > 0) h += '<div class="erndv-sub" style="margin-top:4px;font-style:italic">' + NOTA_TEA + '</div>';
            if (t.subs.length > 1) {
                h += '<div class="erndv-subs">';
                for (k = 0; k < t.subs.length; k++) { var s = t.subs[k]; h += '<div class="erndv-sb">' + s.nome + ': <b>' + fmt(s.media) + '</b> de 3<div class="f"><div style="width:' + Math.max(2, s.media / 3 * 100).toFixed(1) + '%;background:' + t.cor + '"></div></div></div>'; }
                h += '</div>';
            }
            h += '</div>';
        }
        h += '<h3 style="color:' + c.cor + '">&#11088; Perfil do neurodesenvolvimento</h3><div class="erndv-perfil">' + svgPentagono(res) +
            '<div class="erndv-box">Cada ponta do pent\u00e1gono \u00e9 uma condi\u00e7\u00e3o (percentual da soma m\u00e1xima). Pontos vermelhos indicam rastreio positivo. O formato ajuda a ver se os indicadores se concentram em uma \u00e1rea ou se distribuem entre v\u00e1rias, o que \u00e9 \u00fatil para pensar em sobreposi\u00e7\u00f5es e diagn\u00f3stico diferencial.</div></div>';
        h += '<h3 style="color:' + c.cor + '">&#128506;&#65039; Mapa das respostas</h3><div class="erndv-leg">';
        for (k = 0; k < 4; k++) h += '<span><i style="background:' + QV[k].bg + '"></i>' + k + ' ' + RESP[k].toLowerCase() + '</span>';
        h += '</div>';
        for (i = 0; i < res.tr.length; i++) {
            var tm = res.tr[i];
            h += '<div class="erndv-ml"><div class="erndv-mr" style="color:' + tm.cor + '">' + tm.sig + '</div>';
            for (k = 0; k < tm.idx.length; k++) {
                var ii = tm.idx[k], v = res.vals[ii];
                h += '<div class="erndv-q" style="background:' + QV[v].bg + ';color:' + QV[v].fg + '" title="Item ' + (ii + 1) + (res.itens ? ': ' + esc(res.itens[ii].texto) : '') + ' | ' + RESP[v] + '">' + (ii + 1) + '</div>';
            }
            h += '</div>';
        }
        var an = analise(res);
        h += '<h3 style="color:' + c.cor + '">&#128221; An\u00e1lise por condi\u00e7\u00e3o</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="erndv-box"' + (an[i].cor ? ' style="border-left:5px solid ' + an[i].cor + '"' : '') + '><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="erndv-disc"><b>IMPORTANTE:</b> ' + avisoCompleto(c) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15;
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function claro(hx, f) { var c = rgb(hx); return [Math.round(c[0] + (255 - c[0]) * f), Math.round(c[1] + (255 - c[1]) * f), Math.round(c[2] + (255 - c[2]) * f)]; }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u00a0/g, ' ').replace(/\u00b7/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function Ctx(doc, cor) { this.doc = doc; this.y = 20; this.cor = cor; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, c.cor); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, c.cor); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto, cor) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.6);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        if (cor) { F(doc, cor); doc.rect(ML, c.y, 1.6, h, 'F'); }
        var yy = c.y + 4.6;
        if (titulo) { T(doc, cor || c.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.6); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function badge(doc, xDir, y, texto, bg, fg) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.2);
        var tw = doc.getTextWidth(pt(texto)) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.2, 2.5, 2.5, 'F');
        T(doc, fg); doc.text(pt(texto), xDir - tw / 2, y + 3.7, {align: 'center'});
        return tw;
    }
    function poligono(doc, pts, modo) {
        var rel = [];
        for (var i = 1; i < pts.length; i++) rel.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
        doc.lines(rel, pts[0][0], pts[0][1], [1, 1], modo, true);
    }

    function pdf(res, info) {
        info = info || {};
        var c = res.cfg, i, k, doc = new window.jspdf.jsPDF(), cx = new Ctx(doc, c.cor);
        F(doc, c.cor); doc.rect(0, 0, 210, 35, 'F'); F(doc, c.cor2); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt(res.sigla + ' - RELAT\u00d3RIO DE RASTREIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Rastreio do Neurodesenvolvimento - ' + c.versao), 105, 22, {align: 'center'});
        doc.text(pt('Baseada nos crit\u00e9rios do DSM-5-TR | ' + (c.n * 5) + ' itens | 5 condi\u00e7\u00f5es'), 105, 28, {align: 'center'});
        var y = 41, extra = [];
        if (info.informante) extra.push('Informante: ' + info.informante);
        if (info.serie) extra.push('S\u00e9rie: ' + info.serie);
        if (info.convivio) extra.push('Conv\u00edvio: ' + info.convivio);
        var bh = extra.length ? 25 : 20;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, bh, 'F'); F(doc, c.cor); doc.rect(ML, y, 1.6, bh, 'F');
        T(doc, c.cor); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIADO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        if (extra.length) { doc.setFontSize(8.2); doc.text(pt(extra.join('   |   ')).slice(0, 120), 20, y + 22); }
        cx.y = y + bh + 6;

        var pos = res.positivos.length > 0;
        F(doc, pos ? '#ffcdd2' : '#c8e6c9'); doc.rect(ML, cx.y, CW, 11, 'F'); D(doc, pos ? '#c62828' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, cx.y, CW, 11, 'S');
        T(doc, pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(10.5);
        doc.text(pt(pos ? 'RASTREIO POSITIVO para: ' + res.positivos.join(', ') : 'RASTREIO NEGATIVO - nenhuma condi\u00e7\u00e3o atingiu o limiar'), 105, cx.y + 7.2, {align: 'center'});
        cx.y += 16;

        secao(cx, 'AS CINCO CONDI\u00c7\u00d5ES');
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
        doc.text(doc.splitTextToSize(pt('R\u00e9gua = soma (0 a ' + (c.n * 3) + ') nas faixas de gravidade. C\u00edrculos vermelhos = itens marcados como "Bastante" ou "Demais"; linha tracejada = limiar de rastreio (' + c.limiar + ' de ' + c.n + ').'), CW - 4), ML + 2, cx.y);
        cx.y += 9;
        for (i = 0; i < res.tr.length; i++) {
            var t = res.tr[i], gv = GRAV[t.gravNome], temSub = t.subs.length > 1, hC = temSub ? 46 : 39;
            cx.need(hC + 3);
            var y0 = cx.y;
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, y0, CW, hC, 2, 2, 'FD');
            F(doc, t.cor); doc.rect(ML, y0, 1.8, hC, 'F');
            T(doc, t.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(9.6); doc.text(pt(t.sig + ' - ' + t.nome), ML + 5, y0 + 5.8);
            badge(doc, ML + CW - 3, y0 + 2, 'Rastreio ' + (t.positivo ? 'POSITIVO' : 'negativo'), t.positivo ? '#ffcdd2' : '#c8e6c9', t.positivo ? '#b71c1c' : '#1b5e20');
            T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
            doc.text(pt('Soma ' + t.soma + '/' + t.max + '  |  m\u00e9dia ' + fmt(t.media) + '  |  ' + t.cp + ' de ' + c.n + ' itens presentes'), ML + 5, y0 + 10.6);
            badge(doc, ML + CW - 3, y0 + 7.6, t.cl.texto + (t.cl.nivel ? ' - ' + t.cl.nivel : ''), gv.bg, gv.fg);
            // regua
            var bx = ML + 6, bw = 96, by = y0 + 20, ini = 0;
            for (k = 0; k < 4; k++) {
                var fim = k < 3 ? c.cortes[k] + 1 : t.max + 1, seg = GRAV[GRAV_ORD[k]].seg;
                if (k === t.grau) F(doc, seg); else { var cl = claro(seg, 0.5); doc.setFillColor(cl[0], cl[1], cl[2]); }
                doc.rect(bx + ini / (t.max + 1) * bw, by, (fim - ini) / (t.max + 1) * bw + 0.2, 4.6, 'F'); ini = fim;
            }
            var mx = bx + t.soma / (t.max + 1) * bw;
            F(doc, t.cor); doc.triangle(mx - 1.9, by - 3, mx + 1.9, by - 3, mx, by - 0.3, 'F');
            doc.setFont(undefined, 'bold'); doc.setFontSize(7.4); var tw = doc.getTextWidth(String(t.soma)) + 4;
            doc.roundedRect(mx - tw / 2, by - 8.2, tw, 5.2, 1.8, 1.8, 'F'); T(doc, '#ffffff'); doc.text(String(t.soma), mx, by - 4.6, {align: 'center'});
            T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.4);
            for (k = 0; k < 3; k++) doc.text(String(c.cortes[k] + 1), bx + (c.cortes[k] + 1) / (t.max + 1) * bw, by + 8, {align: 'center'});
            // circulos
            var sx = ML + 110, sy = by + 2.2, gap = c.n > 6 ? 4.6 : 9, r = c.n > 6 ? 1.8 : 3;
            for (k = 1; k <= c.n; k++) {
                F(doc, k <= t.cp ? '#e53935' : '#eceff1'); doc.circle(sx, sy, r, 'F');
                if (k === c.limiar && k < c.n) {
                    var lx = sx + gap / 2;
                    D(doc, '#b71c1c'); doc.setLineWidth(0.45);
                    if (doc.setLineDashPattern) doc.setLineDashPattern([0.9, 0.7], 0);
                    doc.line(lx, sy - 4.2, lx, sy + 4.2);
                    if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
                    T(doc, '#b71c1c'); doc.setFontSize(5.8); doc.text('limiar ' + c.limiar, lx, sy - 5, {align: 'center'});
                }
                sx += gap;
            }
            if (temSub) {
                var sbx = ML + 6, sbw = (CW - 12) / t.subs.length;
                for (k = 0; k < t.subs.length; k++) {
                    var sb = t.subs[k], xs = sbx + k * sbw;
                    T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
                    doc.text(pt(sb.nome + ': ' + fmt(sb.media) + ' de 3'), xs, y0 + 33);
                    F(doc, '#eceff1'); doc.roundedRect(xs, y0 + 35, sbw - 6, 2.6, 1.3, 1.3, 'F');
                    F(doc, t.cor); doc.roundedRect(xs, y0 + 35, Math.max(1.5, (sbw - 6) * sb.media / 3), 2.6, 1.3, 1.3, 'F');
                }
            }
            cx.y += hC + 3;
        }

        // pentagono
        cx.need(80);
        secao(cx, 'PERFIL DO NEURODESENVOLVIMENTO');
        var pcx = ML + 44, pcy = cx.y + 36, R = 28;
        function P(kk, f) { var a = (-90 + kk * 72) * Math.PI / 180; return [pcx + Math.cos(a) * R * f, pcy + Math.sin(a) * R * f]; }
        D(doc, '#e0e0e0'); doc.setLineWidth(0.25);
        for (var g = 1; g <= 4; g++) { var gp = []; for (k = 0; k < 5; k++) gp.push(P(k, g / 4)); poligono(doc, gp, 'S'); }
        for (k = 0; k < 5; k++) { var e1 = P(k, 1); doc.line(pcx, pcy, e1[0], e1[1]); }
        var pp = []; for (k = 0; k < 5; k++) pp.push(P(k, Math.max(0.03, res.tr[k].soma / res.tr[k].max)));
        var cc = claro(c.cor, 0.75); doc.setFillColor(cc[0], cc[1], cc[2]); D(doc, c.cor); doc.setLineWidth(0.8); poligono(doc, pp, 'FD');
        for (k = 0; k < 5; k++) {
            F(doc, res.tr[k].positivo ? '#e53935' : res.tr[k].cor); doc.circle(pp[k][0], pp[k][1], 1.6, 'F');
            var L1 = P(k, 1.27);
            T(doc, res.tr[k].cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
            doc.text(res.tr[k].sig + ' ' + Math.round(res.tr[k].soma / res.tr[k].max * 100) + '%', L1[0], L1[1] + 1, {align: 'center'});
        }
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        doc.text(doc.splitTextToSize(pt('Cada ponta \u00e9 uma condi\u00e7\u00e3o (percentual da soma m\u00e1xima). Pontos vermelhos indicam rastreio positivo. O formato mostra se os indicadores se concentram em uma \u00e1rea ou se distribuem entre v\u00e1rias - \u00fatil para pensar em sobreposi\u00e7\u00f5es e diagn\u00f3stico diferencial.'), 86), ML + 94, cx.y + 22);
        cx.y += 76;

        // mapa
        cx.need(14 + res.tr.length * 9);
        secao(cx, 'MAPA DAS RESPOSTAS');
        var lgx = ML + 2; doc.setFontSize(7.2); doc.setFont(undefined, 'normal');
        for (k = 0; k < 4; k++) { F(doc, QV[k].bg); D(doc, '#bdbdbd'); doc.setLineWidth(0.15); doc.roundedRect(lgx, cx.y - 2.8, 3.4, 3.4, 0.6, 0.6, 'FD'); T(doc, '#555555'); var lt = k + ' ' + RESP[k].toLowerCase(); doc.text(pt(lt), lgx + 5, cx.y); lgx += doc.getTextWidth(pt(lt)) + 11; }
        cx.y += 4;
        var qw = c.n > 6 ? 9.6 : 14;
        for (i = 0; i < res.tr.length; i++) {
            var tm = res.tr[i], qx = ML + 18;
            T(doc, tm.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(tm.sig, ML + 2, cx.y + 4.9);
            for (k = 0; k < tm.idx.length; k++) {
                var ii = tm.idx[k], v = res.vals[ii];
                F(doc, QV[v].bg); doc.roundedRect(qx, cx.y, qw - 1.2, 7, 1.2, 1.2, 'F');
                T(doc, QV[v].fg); doc.setFont(undefined, 'bold'); doc.setFontSize(6.8); doc.text(String(ii + 1), qx + (qw - 1.2) / 2, cx.y + 4.6, {align: 'center'});
                qx += qw;
            }
            cx.y += 9;
        }
        cx.y += 3;

        // analise
        cx.need(30);
        secao(cx, 'AN\u00c1LISE POR CONDI\u00c7\u00c3O');
        var an = analise(res);
        for (i = 0; i < an.length; i++) caixa(cx, an[i].t, an[i].x, an[i].cor);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(avisoCompleto(c)), CW - 8), hv = avl.length * 3.8 + 8;
        cx.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, cx.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, cx.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, cx.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, cx.y + 8.6);
        cx.y += hv + 4;

        // respostas frase por frase (quando houver os textos)
        if (res.itens) {
            cx.need(60);
            secao(cx, 'RESPOSTAS POR CONDI\u00c7\u00c3O');
            for (i = 0; i < res.tr.length; i++) {
                var tx = res.tr[i];
                cx.need(16);
                var bgc = claro(tx.cor, 0.85); doc.setFillColor(bgc[0], bgc[1], bgc[2]); doc.rect(ML, cx.y, CW, 6.4, 'F');
                T(doc, tx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(tx.sig + ' - ' + tx.nome), ML + 3, cx.y + 4.4);
                badge(doc, ML + CW - 2, cx.y + 0.6, 'soma ' + tx.soma + '/' + tx.max, '#ffffff', tx.cor);
                cx.y += 8.4;
                for (k = 0; k < tx.idx.length; k++) {
                    var ix = tx.idx[k], vi = res.vals[ix];
                    doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
                    var tl = doc.splitTextToSize(pt((ix + 1) + '. ' + res.itens[ix].texto), 140), hl = tl.length * 3.5 + 1.6;
                    cx.need(hl);
                    T(doc, '#222222'); doc.text(tl, ML + 3, cx.y + 3);
                    T(doc, vi >= 2 ? '#b71c1c' : '#000000'); doc.setFont(undefined, 'bold');
                    doc.text(pt(RESP[vi] + ' (' + vi + ')'), ML + CW - 2, cx.y + 3, {align: 'right'});
                    cx.y += hl;
                }
                cx.y += 2.5;
            }
        }

        cx.need(46);
        secao(cx, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            cx.need(rl.length * 4.3 + 4);
            doc.text(rl, ML + 2, cx.y + 3); cx.y += rl.length * 4.3 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var p = 1; p <= tot; p++) {
            doc.setPage(p);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | ' + res.sigla + ' | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save(res.sigla + '_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    // ===================== PAINEL =====================
    // Registros novos trazem respostasDetalhadas (com frases e subdominios). Registros antigos so tem as
    // respostas: o desenho e refeito pela ordem fixa das condicoes (blocos de 15 ou 5 itens), sem as frases.
    function pdfPainel(d, r) {
        var c = d ? cfg(d.escala) : null;
        if (!c || !d.respostas) return false;
        var total = c.n * 5, vals = [], itens = null, i;
        for (i = 1; i <= total; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        if (Array.isArray(d.respostasDetalhadas) && d.respostasDetalhadas.length === total) {
            itens = d.respostasDetalhadas.map(function (x) { return {texto: x.texto || '', transtorno: x.transtorno, dominio: x.dominio}; });
        }
        var tr = null;
        if (itens) { tr = {}; for (i = 0; i < itens.length; i++) { var s = itens[i].transtorno; if (!tr[s]) tr[s] = {itens: []}; tr[s].itens.push(i); } }
        var res;
        try { res = calcular({sigla: d.escala, respostas: vals, itens: itens, transtornos: tr}); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            informante: d.informante || '', serie: d.serie || '', convivio: d.convivio || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_ERND = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, config: cfg, REFS: REFS};
})();
