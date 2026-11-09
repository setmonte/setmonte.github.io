// ert-visual.js - "Mascara" visual unica das ERTs (Escalas de Rastreio de Tracos - DSM-5-TR).
// Usada pelas 11 ERTs de criterios (PA, PB, PD, PEs, PEt, PEv, PH, PN, POC, PP, TB) e pelo Painel.
// Faz 3 coisas com os MESMOS dados: (1) calcula, (2) monta a tela de resultados, (3) gera o PDF.
// Assim a tela e o PDF (da escala e do painel) saem sempre iguais.
// O calculo reproduz exatamente o das ERTs: item invertido = 6 - resposta; criterio PRESENTE com
// media >= 3,5; SUBCLINICO com media (arredondada) >= 3,0; rastreio positivo com criterios >= limiar.
// ERT-TB: avalia os dois polos separados (DSM-5-TR): mania/hipomania >= 3 de 7 sintomas;
// depressivo >= 5 de 9, incluindo humor deprimido (9) ou anedonia (10).
// ERT-VT NAO usa esta mascara (escala propria, sem criterios).
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    // ===================== CONFIGURACAO POR ESCALA =====================
    var CFG = {
        'ERT-PA':  {sigla: 'ERT-PA',  nome: 'Tra\u00e7os de Personalidade Antissocial', alvo: 'personalidade antissocial', limiar: 3},
        'ERT-PB':  {sigla: 'ERT-PB',  nome: 'Tra\u00e7os de Personalidade Borderline', alvo: 'personalidade borderline', limiar: 5, risco: 5},
        'ERT-PD':  {sigla: 'ERT-PD',  nome: 'Tra\u00e7os de Personalidade Dependente', alvo: 'personalidade dependente', limiar: 5},
        'ERT-PES': {sigla: 'ERT-PEs', nome: 'Tra\u00e7os de Personalidade Esquizoide', alvo: 'personalidade esquizoide', limiar: 4},
        'ERT-PET': {sigla: 'ERT-PEt', nome: 'Tra\u00e7os de Personalidade Esquizot\u00edpica', alvo: 'personalidade esquizot\u00edpica', limiar: 5},
        'ERT-PEV': {sigla: 'ERT-PEv', nome: 'Tra\u00e7os de Personalidade Evitativa', alvo: 'personalidade evitativa', limiar: 4},
        'ERT-PH':  {sigla: 'ERT-PH',  nome: 'Tra\u00e7os de Personalidade Histri\u00f4nica', alvo: 'personalidade histri\u00f4nica', limiar: 5},
        'ERT-PN':  {sigla: 'ERT-PN',  nome: 'Tra\u00e7os de Personalidade Narcisista', alvo: 'personalidade narcisista', limiar: 5},
        'ERT-POC': {sigla: 'ERT-POC', nome: 'Tra\u00e7os de Personalidade Obsessivo-Compulsiva', alvo: 'personalidade obsessivo-compulsiva', limiar: 4},
        'ERT-PP':  {sigla: 'ERT-PP',  nome: 'Tra\u00e7os de Personalidade Paranoide', alvo: 'personalidade paranoide', limiar: 4},
        'ERT-TB':  {sigla: 'ERT-TB',  nome: 'Tra\u00e7os de Transtorno Bipolar', alvo: 'transtorno bipolar', limiar: 9, risco: 17,
                    tb: {mania: [1, 2, 3, 4, 5, 6, 7], limM: 3, dep: [9, 10, 11, 12, 13, 14, 15, 16, 17], limD: 5, nucleo: [9, 10], imp: 8}}
    };
    function cfg(sigla) { return CFG[String(sigla || '').toUpperCase()] || null; }

    var REFS_PADRAO = [
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.',
        'CARVALHO, L. F. Dimensional Clinical Personality Inventory 2: antecedents, development, and future improvements. Psicologia: Teoria e Pesquisa, v. 37, e37316, 2021.',
        'MILLON, T. Disorders of Personality: DSM-IV and Beyond. 2nd ed. New York: John Wiley & Sons, 1996.'
    ];

    // Faixas de intensidade (media 1 a 5) - padrao das escalas do site
    var INT = [
        {max: 2.0, txt: 'M\u00ednimo', cor: '#2e7d32', bg: '#c8e6c9', seg: '#66bb6a', de: 1.0},
        {max: 2.5, txt: 'Leve', cor: '#6d5f00', bg: '#fff9c4', seg: '#ffee58', de: 2.0},
        {max: 3.0, txt: 'Leve-Moderado', cor: '#8a5a00', bg: '#ffecb3', seg: '#ffca28', de: 2.5},
        {max: 3.5, txt: 'Moderado', cor: '#bf5600', bg: '#ffe0b2', seg: '#ffa726', de: 3.0},
        {max: 4.0, txt: 'Significativo', cor: '#bf360c', bg: '#ffccbc', seg: '#ff7043', de: 3.5},
        {max: 99, txt: 'Intenso', cor: '#b71c1c', bg: '#ffcdd2', seg: '#e53935', de: 4.0}
    ];
    function intens(m) { for (var i = 0; i < INT.length; i++) { if (m < INT[i].max) return INT[i]; } return INT[INT.length - 1]; }

    var ST = {
        presente: {txt: 'Presente', cor: '#b71c1c', bg: '#ffcdd2', bar: '#e53935'},
        sub: {txt: 'Subcl\u00ednico', cor: '#bf5600', bg: '#ffe0b2', bar: '#ffa726'},
        ausente: {txt: 'Ausente', cor: '#1b5e20', bg: '#c8e6c9', bar: '#66bb6a'}
    };
    // Cor do quadradinho do mapa (pontuacao do item, ja com inversao)
    var QV = [null, {bg: '#c8e6c9', fg: '#1b5e20'}, {bg: '#fff59d', fg: '#6d5f00'}, {bg: '#ffe082', fg: '#7a5300'}, {bg: '#ffb74d', fg: '#6d3a00'}, {bg: '#ef5350', fg: '#ffffff'}];
    var LIK = ['', 'Nunca', 'Raramente', '\u00c0s vezes', 'Frequentemente', 'Sempre'];

    function r2(x) { return parseFloat(x.toFixed(2)); }
    function fmt(n, d) { return Number(n).toFixed(d === undefined ? 2 : d).replace('.', ','); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function lista(arr) { if (arr.length <= 1) return arr.join(''); return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]; }

    // ===================== CALCULO =====================
    // d = {sigla, itens:[{n, texto, criterio, invertido, valorBruto}], criterios:{1:'nome'}, dominios:{nome:[crit...]}}
    function calcular(d) {
        var c = cfg(d.sigla);
        if (!c) throw new Error('ERT: escala desconhecida ' + d.sigla);
        var itens = d.itens || [];
        if (!itens.length) throw new Error('ERT: sem respostas');
        var keys = Object.keys(d.criterios || {}).map(Number).sort(function (a, b) { return a - b; });
        var cr = {}, i, k;
        for (i = 0; i < keys.length; i++) { cr[keys[i]] = {num: keys[i], nome: d.criterios[keys[i]], itens: [], soma: 0}; }
        var somaG = 0, respObj = {}, respDet = [];
        for (i = 0; i < itens.length; i++) {
            var it = itens[i], b = parseInt(it.valorBruto, 10), num = it.n || (i + 1);
            if (!(b >= 1 && b <= 5)) throw new Error('ERT: resposta invalida no item ' + num);
            if (!cr[it.criterio]) throw new Error('ERT: criterio inexistente no item ' + num);
            var v = it.invertido ? 6 - b : b;
            somaG += v; respObj[num] = v;
            respDet.push({n: num, texto: it.texto, criterio: it.criterio, invertido: !!it.invertido, valorBruto: b});
            cr[it.criterio].itens.push({n: num, texto: it.texto || '', inv: !!it.invertido, bruto: b, v: v});
            cr[it.criterio].soma += v;
        }
        var cp = 0, lst = [];
        for (i = 0; i < keys.length; i++) {
            var x = cr[keys[i]];
            if (!x.itens.length) throw new Error('ERT: criterio sem itens ' + x.num);
            var m = x.soma / x.itens.length;
            x.media = r2(m);
            x.presente = m >= 3.5;
            x.sub = !x.presente && x.media >= 3.0;
            x.st = x.presente ? ST.presente : (x.sub ? ST.sub : ST.ausente);
            if (x.presente) cp++;
            lst.push(x);
        }
        var mg = somaG / itens.length;
        var dom = [], domPainel = {}, nomes = Object.keys(d.dominios || {});
        for (i = 0; i < nomes.length; i++) {
            var cs = d.dominios[nomes[i]], s = 0;
            for (k = 0; k < cs.length; k++) s += cr[cs[k]].media;
            var md = r2(s / cs.length), iv = intens(md);
            dom.push({nome: nomes[i], crits: cs, media: md, int: iv});
            domPainel[nomes[i]] = {media: md, criterios: cs, pontuacao: md, max: 5, classificacao: iv.txt};
        }
        var res = {
            cfg: c, sigla: c.sigla, crit: lst, cr: cr, media: mg, int: intens(mg), cp: cp, total: lst.length,
            limiar: c.limiar, positivo: cp >= c.limiar, dom: dom, domPainel: domPainel, respObj: respObj, respDet: respDet,
            risco: (c.risco && cr[c.risco] && cr[c.risco].media >= 3.0) ? cr[c.risco] : null
        };
        if (c.tb) {
            var t = c.tb, cpM = 0, cpD = 0;
            for (k = 0; k < t.mania.length; k++) { if (cr[t.mania[k]].presente) cpM++; }
            for (k = 0; k < t.dep.length; k++) { if (cr[t.dep[k]].presente) cpD++; }
            var nuc = cr[t.nucleo[0]].presente || cr[t.nucleo[1]].presente;
            res.tb = {
                mania: {crits: t.mania, cp: cpM, total: t.mania.length, limiar: t.limM, positivo: cpM >= t.limM},
                dep: {crits: t.dep, cp: cpD, total: t.dep.length, limiar: t.limD, nucleo: nuc, positivo: cpD >= t.limD && nuc},
                imp: cr[t.imp]
            };
            res.positivo = res.tb.mania.positivo || res.tb.dep.positivo;
            res.classificacaoTB = 'Polo maniaco/hipomaniaco ' + (res.tb.mania.positivo ? 'POSITIVO' : 'negativo') + ' (' + cpM + '/' + t.mania.length + ')' +
                ' | Polo depressivo ' + (res.tb.dep.positivo ? 'POSITIVO' : 'negativo') + ' (' + cpD + '/' + t.dep.length + ')';
            res.polosPainel = {
                maniaco: {presentes: cpM, total: t.mania.length, limiar: t.limM, positivo: res.tb.mania.positivo},
                depressivo: {presentes: cpD, total: t.dep.length, limiar: t.limD, humorOuAnedonia: nuc, positivo: res.tb.dep.positivo}
            };
        }
        return res;
    }

    // ===================== TEXTOS DA ANALISE =====================
    function analise(res) {
        var out = [], i, pres = [], sub = [], c = res.cfg;
        for (i = 0; i < res.crit.length; i++) {
            if (res.crit[i].presente) pres.push(res.crit[i].nome);
            else if (res.crit[i].sub) sub.push(res.crit[i].nome);
        }
        if (res.tb) {
            var M = res.tb.mania, D = res.tb.dep, I = res.tb.imp;
            out.push({t: 'Polo man\u00edaco / hipoman\u00edaco', x: M.cp + ' de ' + M.total + ' sintomas presentes (limiar: ' + M.limiar + ' ou mais, conforme a contagem de sintomas do DSM-5-TR para epis\u00f3dio man\u00edaco/hipoman\u00edaco). Rastreio ' + (M.positivo ? 'POSITIVO' : 'negativo') + ' neste polo.'});
            out.push({t: 'Polo depressivo', x: D.cp + ' de ' + D.total + ' sintomas presentes (limiar: ' + D.limiar + ' ou mais, incluindo humor deprimido ou anedonia, conforme o DSM-5-TR para epis\u00f3dio depressivo). Humor deprimido ou anedonia: ' + (D.nucleo ? 'presente' : 'ausente') + '. Rastreio ' + (D.positivo ? 'POSITIVO' : 'negativo') + ' neste polo.'});
            out.push({t: 'Gravidade e impacto funcional', x: 'M\u00e9dia ' + fmt(I.media) + ' (de 1 a 5), faixa ' + intens(I.media).txt + ' (' + I.st.txt.toLowerCase() + '). Indica o quanto os sintomas relatados afetam a vida di\u00e1ria.'});
            var lc;
            if (M.positivo && D.positivo) lc = 'H\u00e1 sinais nos dois polos (man\u00edaco/hipoman\u00edaco e depressivo), padr\u00e3o que merece investiga\u00e7\u00e3o cl\u00ednica de tra\u00e7os bipolares.';
            else if (M.positivo) lc = 'H\u00e1 sinais no polo man\u00edaco/hipoman\u00edaco, o mais caracter\u00edstico dos transtornos bipolares. Merece investiga\u00e7\u00e3o cl\u00ednica.';
            else if (D.positivo) lc = 'H\u00e1 sinais apenas no polo depressivo. Sem o polo man\u00edaco/hipoman\u00edaco, este instrumento n\u00e3o caracteriza tra\u00e7os bipolares, mas o quadro depressivo merece investiga\u00e7\u00e3o cl\u00ednica.';
            else lc = 'Nenhum dos dois polos atingiu o limiar. Por este instrumento, os sintomas relatados n\u00e3o sugerem tra\u00e7os de transtorno bipolar.';
            out.push({t: 'Leitura conjunta', x: lc});
        } else {
            out.push({t: 'Resultado geral', x: 'Foram identificados ' + res.cp + ' de ' + res.total + ' crit\u00e9rios do DSM-5-TR com pontua\u00e7\u00e3o compat\u00edvel com presen\u00e7a (m\u00e9dia do crit\u00e9rio igual ou maior que 3,5). Como o limiar \u00e9 ' + res.limiar + ', o resultado \u00e9 de rastreio ' + (res.positivo ? 'POSITIVO: os tra\u00e7os de ' + c.alvo + ' merecem investiga\u00e7\u00e3o cl\u00ednica mais detalhada.' : 'negativo: por este instrumento, os tra\u00e7os de ' + c.alvo + ' n\u00e3o atingem a quantidade de crit\u00e9rios esperada.')});
        }
        out.push({t: 'Intensidade geral', x: 'A m\u00e9dia geral das respostas foi ' + fmt(res.media) + ' (de 1 a 5), na faixa ' + res.int.txt + '. A m\u00e9dia mostra a intensidade geral dos tra\u00e7os relatados, independentemente da contagem de crit\u00e9rios.'});
        var tc = pres.length ? 'Presentes: ' + lista(pres) + '.' : 'Nenhum crit\u00e9rio atingiu a presen\u00e7a.';
        if (sub.length) tc += ' Subcl\u00ednicos (m\u00e9dia entre 3,0 e 3,49, perto do limite): ' + lista(sub) + '.';
        tc += ' Os demais est\u00e3o ausentes.';
        out.push({t: 'Crit\u00e9rios', x: tc});
        var top = null;
        for (i = 0; i < res.dom.length; i++) { if (!top || res.dom[i].media > top.media) top = res.dom[i]; }
        if (top) out.push({t: 'Dom\u00ednio de maior destaque', x: top.media < 2 ? 'Nenhum dom\u00ednio se destacou: todos ficaram na faixa M\u00ednimo.' : 'O dom\u00ednio com maior m\u00e9dia foi ' + top.nome + ' (' + fmt(top.media) + ', faixa ' + top.int.txt + ').'});
        var max = [];
        for (i = 0; i < res.respDet.length; i++) { var it = res.respDet[i], vv = it.invertido ? 6 - it.valorBruto : it.valorBruto; if (vv === 5) max.push(it.n); }
        out.push({t: 'Itens mais intensos', x: max.length ? 'Itens com a pontua\u00e7\u00e3o m\u00e1xima (5, j\u00e1 considerando os itens invertidos): ' + max.join(', ') + '. Vale explor\u00e1-los na entrevista cl\u00ednica.' : 'Nenhum item recebeu a pontua\u00e7\u00e3o m\u00e1xima (5).'});
        return out;
    }
    function aviso(res) {
        var t = 'Esta escala \u00e9 um instrumento de rastreio baseado nos crit\u00e9rios do DSM-5-TR e n\u00e3o possui valida\u00e7\u00e3o emp\u00edrica formal. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';
        if (res.tb) t += ' Os limiares por polo seguem a contagem de sintomas do DSM-5-TR (epis\u00f3dio man\u00edaco/hipoman\u00edaco: 3 ou mais sintomas; epis\u00f3dio depressivo: 5 ou mais, incluindo humor deprimido ou anedonia). A escala n\u00e3o avalia a dura\u00e7\u00e3o nem a sequ\u00eancia dos epis\u00f3dios.';
        return t;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.ertv h3{color:#1a237e;margin:26px 0 10px;font-size:1.12em}' +
        '.ertv h2{color:#1a237e;margin-bottom:16px;text-align:center}' +
        '.ertv-rast{padding:18px;border-radius:12px;text-align:center;margin:10px 0;font-size:1.1em;font-weight:700}' +
        '.ertv-pos{background:#ffcdd2;border:3px solid #c62828;color:#b71c1c}' +
        '.ertv-neg{background:#c8e6c9;border:3px solid #2e7d32;color:#1b5e20}' +
        '.ertv-sub2{display:block;font-size:.78em;font-weight:600;margin-top:4px}' +
        '.ertv-polos{display:flex;gap:12px;flex-wrap:wrap}.ertv-polos>div{flex:1 1 260px}' +
        '.ertv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.ertv-slots{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:20px 0 6px}' +
        '.ertv-slot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9em;background:#eceff1;color:#90a4ae}' +
        '.ertv-slot.on{background:#e53935;color:#fff;box-shadow:0 2px 5px rgba(229,57,53,.4)}' +
        '.ertv-lim{width:0;height:44px;border-left:3px dashed #b71c1c;margin:0 3px;position:relative}' +
        '.ertv-lim span{position:absolute;top:-17px;left:-20px;font-size:.68em;color:#b71c1c;font-weight:700;white-space:nowrap}' +
        '.ertv-alerta{background:#ffebee;border:3px solid #c62828;color:#b71c1c;border-radius:12px;padding:16px 20px;margin:14px 0;line-height:1.7}' +
        '.ertv-alerta b.tit{display:block;font-size:1.08em;margin-bottom:4px}' +
        '.ertv-regua{position:relative;margin:58px 22px 18px}' +
        '.ertv-barra{display:flex;height:28px;border-radius:14px;overflow:hidden;box-shadow:inset 0 1px 4px rgba(0,0,0,.25)}' +
        '.ertv-bolha{position:absolute;top:-50px;transform:translateX(-50%);background:#1a237e;color:#fff;padding:4px 14px;border-radius:14px;font-weight:700;white-space:nowrap}' +
        '.ertv-bolha:after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-8px;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #1a237e}' +
        '.ertv-marca{position:absolute;top:32px;transform:translateX(-50%);font-size:.72em;color:#555}' +
        '.ertv-chips{display:flex;flex-wrap:wrap;gap:8px;margin:30px 0 8px}' +
        '.ertv-chip{padding:4px 11px;border-radius:12px;font-size:.78em;font-weight:600}' +
        '.ertv-card{background:#fff;padding:15px 18px;border-radius:10px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.08);border-left:6px solid #1a237e}' +
        '.ertv-topo{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
        '.ertv-topo h4{font-size:1.03em;color:#1a237e}' +
        '.ertv-badge{display:inline-block;padding:3px 11px;border-radius:12px;font-size:.78em;font-weight:700;white-space:nowrap}' +
        '.ertv-bf{height:14px;background:#eceff1;border-radius:7px;overflow:hidden;margin:10px 0 6px}.ertv-bp{height:100%;border-radius:7px}' +
        '.ertv-num{font-size:.86em;color:#444}' +
        '.ertv-mini{display:inline-block;margin:6px 6px 0 0;padding:2px 9px;border-radius:10px;font-size:.76em;font-weight:600}' +
        '.ertv-crit{display:flex;align-items:center;gap:10px;padding:9px 12px;background:#fff;border-bottom:1px solid #eee;flex-wrap:wrap}' +
        '.ertv-crit-n{flex:1 1 210px;font-size:.9em;color:#333}' +
        '.ertv-crit-b{flex:2 1 200px;position:relative;height:14px;background:#eceff1;border-radius:7px}' +
        '.ertv-crit-f{height:100%;border-radius:7px}' +
        '.ertv-crit-l{position:absolute;top:-5px;height:24px;border-left:2px dashed}' +
        '.ertv-crit-v{width:42px;text-align:right;font-weight:700;font-size:.88em}' +
        '.ertv-grupo{background:#e8eaf6;color:#1a237e;font-weight:700;padding:7px 12px;border-radius:6px;margin:12px 0 4px;font-size:.9em}' +
        '.ertv-leg{font-size:.8em;color:#555;margin:6px 0 10px}.ertv-leg span{display:inline-block;margin-right:14px}' +
        '.ertv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle;border:1px solid #ccc}' +
        '.ertv-ml{display:flex;align-items:center;gap:6px;margin-bottom:7px;flex-wrap:wrap}' +
        '.ertv-mr{width:190px;font-size:.78em;color:#555}' +
        '.ertv-q{min-width:36px;height:32px;padding:0 4px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82em;cursor:help}' +
        '.ertv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}' +
        '@media(max-width:768px){.ertv-mr{width:100%}.ertv-regua{margin-left:12px;margin-right:12px}}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('ertv-css')) return;
        var st = document.createElement('style'); st.id = 'ertv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlRastreio(pos, titulo, sub) {
        return '<div class="ertv-rast ' + (pos ? 'ertv-pos' : 'ertv-neg') + '">' + titulo + (sub ? '<span class="ertv-sub2">' + sub + '</span>' : '') + '</div>';
    }
    function htmlSlots(cp, total, limiar) {
        var h = '<div class="ertv-slots">';
        for (var i = 1; i <= total; i++) {
            h += '<div class="ertv-slot' + (i <= cp ? ' on' : '') + '">' + i + '</div>';
            if (i === limiar && i < total) h += '<div class="ertv-lim"><span>limiar ' + limiar + '</span></div>';
        }
        if (limiar >= total) h += '<div class="ertv-lim"><span>limiar ' + limiar + '</span></div>';
        h += '</div>';
        var dif = cp - limiar;
        h += '<div class="ertv-leg">Cada c\u00edrculo vermelho \u00e9 um crit\u00e9rio presente. ' + (dif >= 0 ? 'O limiar foi atingido' + (dif > 0 ? ' e ultrapassado em ' + dif : '') + '.' : 'Faltam ' + (-dif) + ' para atingir o limiar.') + '</div>';
        return h;
    }
    function htmlCritLinha(x) {
        var p = Math.max(3, (x.media - 1) / 4 * 100);
        return '<div class="ertv-crit"><div class="ertv-crit-n"><b>' + x.num + '.</b> ' + esc(x.nome) + '</div>' +
            '<div class="ertv-crit-b"><div class="ertv-crit-f" style="width:' + p.toFixed(1) + '%;background:' + x.st.bar + '"></div>' +
            '<div class="ertv-crit-l" style="left:50%;border-color:#f57f17" title="subcl\u00ednico 3,0"></div>' +
            '<div class="ertv-crit-l" style="left:62.5%;border-color:#c62828" title="presente 3,5"></div></div>' +
            '<div class="ertv-crit-v">' + fmt(x.media) + '</div>' +
            '<span class="ertv-badge" style="background:' + x.st.bg + ';color:' + x.st.cor + '">' + x.st.txt + '</span></div>';
    }
    function htmlTela(res) {
        injetarCSS();
        var c = res.cfg, i, k, h = '<div class="ertv">';
        h += '<h2>&#129504; Resultados ' + res.sigla + '</h2>';
        if (res.tb) {
            var M = res.tb.mania, D = res.tb.dep;
            h += '<div class="ertv-polos"><div>' + htmlRastreio(M.positivo, 'POLO MAN\u00cdACO / HIPOMAN\u00cdACO: ' + (M.positivo ? 'POSITIVO' : 'NEGATIVO'), M.cp + '/' + M.total + ' sintomas presentes (limiar: >=' + M.limiar + ')') + '</div>';
            h += '<div>' + htmlRastreio(D.positivo, 'POLO DEPRESSIVO: ' + (D.positivo ? 'POSITIVO' : 'NEGATIVO'), D.cp + '/' + D.total + ' sintomas presentes (limiar: >=' + D.limiar + ', com humor deprimido ou anedonia)') + '</div></div>';
        } else {
            h += htmlRastreio(res.positivo, 'RASTREIO ' + (res.positivo ? 'POSITIVO' : 'NEGATIVO') + ' \u2014 ' + res.cp + '/' + res.total + ' crit\u00e9rios presentes (limiar: >=' + res.limiar + ')');
        }
        if (res.risco) {
            h += '<div class="ertv-alerta"><b class="tit">&#9888;&#65039; ALERTA DE RISCO \u2014 ' + esc(res.risco.nome) + ': m\u00e9dia ' + fmt(res.risco.media) + '</b>' +
                'Recomenda-se avalia\u00e7\u00e3o imediata do risco. Em situa\u00e7\u00e3o de crise: <b>CVV 188</b> (24 horas, gratuito) ou <b>SAMU 192</b>.</div>';
        }
        h += '<h3>&#128308; Contagem de crit\u00e9rios do DSM-5-TR</h3>';
        if (res.tb) {
            h += '<div class="ertv-box"><b>Polo man\u00edaco / hipoman\u00edaco</b> \u2014 ' + res.tb.mania.cp + ' de ' + res.tb.mania.total + htmlSlots(res.tb.mania.cp, res.tb.mania.total, res.tb.mania.limiar) + '</div>';
            h += '<div class="ertv-box"><b>Polo depressivo</b> \u2014 ' + res.tb.dep.cp + ' de ' + res.tb.dep.total + ' (humor deprimido ou anedonia: ' + (res.tb.dep.nucleo ? 'presente' : 'ausente') + ')' + htmlSlots(res.tb.dep.cp, res.tb.dep.total, res.tb.dep.limiar) + '</div>';
        } else {
            h += '<div class="ertv-box"><b>' + res.cp + ' de ' + res.total + '</b> crit\u00e9rios presentes' + htmlSlots(res.cp, res.total, res.limiar) + '</div>';
        }
        // regua
        h += '<h3>&#128207; Intensidade geral (m\u00e9dia de 1 a 5)</h3>';
        h += '<div class="ertv-box">A r\u00e9gua vai de 1 (nunca) a 5 (sempre) e est\u00e1 dividida nas seis faixas de intensidade. Quanto mais \u00e0 direita e mais quente a cor, mais intensos os tra\u00e7os relatados.</div>';
        h += '<div class="ertv-regua"><div class="ertv-bolha" style="left:' + ((res.media - 1) / 4 * 100).toFixed(2) + '%">' + fmt(res.media) + '</div><div class="ertv-barra">';
        for (i = 0; i < INT.length; i++) { var fim = i < INT.length - 1 ? INT[i].max : 5; h += '<div style="width:' + ((fim - INT[i].de) / 4 * 100) + '%;background:' + INT[i].seg + '"></div>'; }
        h += '</div>';
        var mk = [1, 2, 2.5, 3, 3.5, 4, 5];
        for (i = 0; i < mk.length; i++) h += '<div class="ertv-marca" style="left:' + ((mk[i] - 1) / 4 * 100) + '%">' + fmt(mk[i], mk[i] % 1 ? 1 : 0) + '</div>';
        h += '</div><div class="ertv-chips">';
        for (i = 0; i < INT.length; i++) {
            var lab = INT[i].txt + ': ' + (i === 0 ? '1 a 2' : (i === INT.length - 1 ? '4 a 5' : fmt(INT[i].de, 1) + ' a ' + fmt(INT[i].max, 1)));
            h += '<span class="ertv-chip" style="background:' + INT[i].bg + ';color:' + INT[i].cor + ';' + (INT[i] === res.int ? 'outline:3px solid ' + INT[i].cor + ';' : '') + '">' + lab + '</span>';
        }
        h += '</div>';
        var an = analise(res);
        var nA = res.tb ? 4 : 1;
        for (i = 0; i < nA; i++) h += '<div class="ertv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        // dominios
        h += '<h3>&#129513; Dom\u00ednios</h3>';
        for (i = 0; i < res.dom.length; i++) {
            var dd = res.dom[i];
            h += '<div class="ertv-card" style="border-left-color:' + dd.int.seg + '"><div class="ertv-topo"><h4>' + esc(dd.nome) + '</h4><span class="ertv-badge" style="background:' + dd.int.bg + ';color:' + dd.int.cor + '">' + dd.int.txt + '</span></div>';
            h += '<div class="ertv-bf"><div class="ertv-bp" style="width:' + Math.max(3, (dd.media - 1) / 4 * 100).toFixed(1) + '%;background:' + dd.int.seg + '"></div></div>';
            h += '<div class="ertv-num">M\u00e9dia <b>' + fmt(dd.media) + '</b> (de 1 a 5) \u00b7 crit\u00e9rios deste dom\u00ednio:</div><div>';
            for (k = 0; k < dd.crits.length; k++) { var xc = res.cr[dd.crits[k]]; h += '<span class="ertv-mini" style="background:' + xc.st.bg + ';color:' + xc.st.cor + '">' + esc(xc.nome) + ' \u00b7 ' + xc.st.txt + '</span>'; }
            h += '</div></div>';
        }
        // criterios
        h += '<h3>&#128202; Crit\u00e9rios do DSM-5-TR</h3>';
        h += '<div class="ertv-leg">Linha laranja = 3,0 (subcl\u00ednico) \u00b7 linha vermelha = 3,5 (presente)</div>';
        h += '<div style="border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)">';
        if (res.tb) {
            var grupos = [['Polo man\u00edaco / hipoman\u00edaco', res.tb.mania.crits], ['Gravidade e impacto funcional', [c.tb.imp]], ['Polo depressivo', res.tb.dep.crits]];
            for (i = 0; i < grupos.length; i++) {
                h += '<div class="ertv-grupo">' + grupos[i][0] + '</div>';
                for (k = 0; k < grupos[i][1].length; k++) h += htmlCritLinha(res.cr[grupos[i][1][k]]);
            }
        } else {
            for (i = 0; i < res.crit.length; i++) h += htmlCritLinha(res.crit[i]);
        }
        h += '</div>';
        // mapa
        h += '<h3>&#128506;&#65039; Mapa das respostas por crit\u00e9rio</h3>';
        h += '<div class="ertv-leg"><span><i style="background:' + QV[1].bg + '"></i>1</span><span><i style="background:' + QV[2].bg + '"></i>2</span><span><i style="background:' + QV[3].bg + '"></i>3</span><span><i style="background:' + QV[4].bg + '"></i>4</span><span><i style="background:' + QV[5].bg + '"></i>5</span>a cor mostra a intensidade do tra\u00e7o (j\u00e1 considerando os itens invertidos, marcados com R). Passe o mouse ou toque para ver a frase.</div>';
        for (i = 0; i < res.crit.length; i++) {
            var x = res.crit[i];
            h += '<div class="ertv-ml"><div class="ertv-mr"><b>' + x.num + '.</b> ' + esc(x.nome) + '</div>';
            for (k = 0; k < x.itens.length; k++) {
                var q = x.itens[k];
                h += '<div class="ertv-q" style="background:' + QV[q.v].bg + ';color:' + QV[q.v].fg + '" title="Item ' + q.n + ': ' + esc(q.texto) + ' | Resposta: ' + LIK[q.bruto] + (q.inv ? ' (item invertido)' : '') + '">' + q.n + (q.inv ? 'R' : '') + '</div>';
            }
            h += '</div>';
        }
        // analise
        h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
        for (i = nA; i < an.length; i++) h += '<div class="ertv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="ertv-disc"><b>IMPORTANTE:</b> ' + aviso(res) + '</div>';
        h += '</div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#1a237e';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    // Texto seguro para a fonte padrao do PDF (Latin-1)
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
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
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 8);
        var h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 4, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 4, yy);
        c.y += h + 3;
    }
    function badge(doc, xDir, y, texto, bg, fg, fs) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(fs || 7.5);
        var tw = doc.getTextWidth(pt(texto)) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.4, 2.6, 2.6, 'F');
        T(doc, fg); doc.text(pt(texto), xDir - tw / 2, y + 3.8, {align: 'center'});
        return tw;
    }
    function bolha(doc, cx, y, texto) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(9);
        var tw = doc.getTextWidth(texto) + 7;
        F(doc, AZ); doc.roundedRect(cx - tw / 2, y, tw, 6.5, 2.5, 2.5, 'F');
        doc.triangle(cx - 2.2, y + 6.4, cx + 2.2, y + 6.4, cx, y + 9, 'F');
        T(doc, '#ffffff'); doc.text(texto, cx, y + 4.6, {align: 'center'});
    }
    function boxRastreio(doc, x, y, w, h, pos, l1, l2) {
        F(doc, pos ? '#ffcdd2' : '#c8e6c9'); doc.rect(x, y, w, h, 'F');
        D(doc, pos ? '#c62828' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(x, y, w, h, 'S');
        T(doc, pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(w < 100 ? 9.5 : 11);
        doc.text(pt(l1), x + w / 2, y + (l2 ? 6.6 : 7.8), {align: 'center'});
        if (l2) { doc.setFont(undefined, 'normal'); doc.setFontSize(w < 100 ? 7.6 : 8.5); doc.text(doc.splitTextToSize(pt(l2), w - 6), x + w / 2, y + 11.6, {align: 'center'}); }
    }
    function slotsPDF(c, rotulo, cp, total, limiar) {
        var doc = c.doc;
        c.need(26);
        T(doc, '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(rotulo), ML + 2, c.y + 3);
        var y = c.y + 13, x = ML + 7, r = 4, gap = 11.5;
        for (var i = 1; i <= total; i++) {
            F(doc, i <= cp ? '#e53935' : '#eceff1'); doc.circle(x, y, r, 'F');
            T(doc, i <= cp ? '#ffffff' : '#90a4ae'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(String(i), x, y + 1.1, {align: 'center'});
            if (i === limiar) {
                var lx = x + gap / 2;
                D(doc, '#b71c1c'); doc.setLineWidth(0.6);
                if (doc.setLineDashPattern) doc.setLineDashPattern([1.2, 1], 0);
                doc.line(lx, y - 6.5, lx, y + 6.5);
                if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
                T(doc, '#b71c1c'); doc.setFontSize(6.5); doc.text('limiar ' + limiar, lx, y - 7.5, {align: 'center'});
            }
            x += gap;
        }
        var dif = cp - limiar;
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        doc.text(pt(cp + ' de ' + total + ' presentes. ' + (dif >= 0 ? 'Limiar atingido' + (dif > 0 ? ' e ultrapassado em ' + dif : '') + '.' : 'Faltam ' + (-dif) + ' para o limiar.')), ML + 2, y + 9.5);
        c.y = y + 13;
    }
    function critPDF(c, x) {
        var doc = c.doc, y = c.y;
        c.need(7.2); y = c.y;
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.2);
        var nome = pt(x.num + '. ' + x.nome);
        while (doc.getTextWidth(nome) > 66 && nome.length > 4) nome = nome.slice(0, -2);
        if (nome !== pt(x.num + '. ' + x.nome)) nome = nome.replace(/\s*$/, '') + '...';
        doc.text(nome, ML + 2, y + 4);
        var bx = 86, bw = 66;
        F(doc, '#eceff1'); doc.roundedRect(bx, y + 1.3, bw, 3.6, 1.8, 1.8, 'F');
        F(doc, x.st.bar); doc.roundedRect(bx, y + 1.3, Math.max(3.6, (x.media - 1) / 4 * bw), 3.6, 1.8, 1.8, 'F');
        doc.setLineWidth(0.4);
        D(doc, '#f57f17'); doc.line(bx + bw * 0.5, y + 0.2, bx + bw * 0.5, y + 6);
        D(doc, '#c62828'); doc.line(bx + bw * 0.625, y + 0.2, bx + bw * 0.625, y + 6);
        T(doc, '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.2); doc.text(fmt(x.media), 162, y + 4.1, {align: 'right'});
        badge(doc, ML + CW, y + 0.6, x.st.txt, x.st.bg, x.st.cor, 7);
        c.y += 7.2;
    }

    function pdf(res, info) {
        info = info || {};
        var cf = res.cfg, i, k;
        var doc = new window.jspdf.jsPDF(), c = new Ctx(doc);

        // Cabecalho
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F');
        F(doc, '#00695c'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt(res.sigla + ' - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Rastreio para ' + cf.nome + ' (DSM-5-TR)'), 105, 22, {align: 'center'});
        doc.text(pt('Sistema SYM - Avalia\u00e7\u00e3o Neuropsicol\u00f3gica'), 105, 28, {align: 'center'});

        // Dados pessoais
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIANDO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '') + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval)), 20, y + 17);
        c.y = 66;

        // Rastreio
        if (res.tb) {
            var M = res.tb.mania, Dp = res.tb.dep;
            boxRastreio(doc, ML, c.y, 88, 20, M.positivo, 'POLO MAN\u00cdACO/HIPOMAN\u00cdACO: ' + (M.positivo ? 'POSITIVO' : 'NEGATIVO'), M.cp + '/' + M.total + ' sintomas presentes (limiar >= ' + M.limiar + ')');
            boxRastreio(doc, ML + 92, c.y, 88, 20, Dp.positivo, 'POLO DEPRESSIVO: ' + (Dp.positivo ? 'POSITIVO' : 'NEGATIVO'), Dp.cp + '/' + Dp.total + ' presentes (limiar >= ' + Dp.limiar + ', com humor deprimido ou anedonia)');
            c.y += 25;
        } else {
            boxRastreio(doc, ML, c.y, CW, 12, res.positivo, 'RASTREIO ' + (res.positivo ? 'POSITIVO' : 'NEGATIVO') + ' - ' + res.cp + '/' + res.total + ' crit\u00e9rios presentes (limiar >= ' + res.limiar + ')');
            c.y += 17;
        }

        // Alerta de risco
        if (res.risco) {
            F(doc, '#ffebee'); doc.rect(ML, c.y, CW, 17, 'F'); D(doc, '#c62828'); doc.setLineWidth(0.8); doc.rect(ML, c.y, CW, 17, 'S');
            T(doc, '#b71c1c'); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
            doc.text(pt('ALERTA DE RISCO - ' + res.risco.nome + ': m\u00e9dia ' + fmt(res.risco.media)), ML + 4, c.y + 6.5);
            doc.setFontSize(8.6); doc.setFont(undefined, 'normal');
            doc.text(pt('Recomenda-se avalia\u00e7\u00e3o imediata do risco. Em crise: CVV 188 (24 horas, gratuito) ou SAMU 192.'), ML + 4, c.y + 12.5);
            c.y += 22;
        }

        // Contagem de criterios
        secao(c, 'CONTAGEM DE CRIT\u00c9RIOS DO DSM-5-TR');
        if (res.tb) {
            slotsPDF(c, 'Polo man\u00edaco / hipoman\u00edaco', res.tb.mania.cp, res.tb.mania.total, res.tb.mania.limiar);
            slotsPDF(c, 'Polo depressivo (humor deprimido ou anedonia: ' + (res.tb.dep.nucleo ? 'presente' : 'ausente') + ')', res.tb.dep.cp, res.tb.dep.total, res.tb.dep.limiar);
        } else {
            slotsPDF(c, 'Crit\u00e9rios presentes', res.cp, res.total, res.limiar);
        }

        // Regua de intensidade
        secao(c, 'INTENSIDADE GERAL (m\u00e9dia de 1 a 5)');
        c.need(40);
        var x0 = 24, x1 = 186, w = x1 - x0, by = c.y + 13, bh = 7, xx = x0;
        for (i = 0; i < INT.length; i++) { var fim = i < INT.length - 1 ? INT[i].max : 5, sw = (fim - INT[i].de) / 4 * w; F(doc, INT[i].seg); doc.rect(xx, by, sw + 0.2, bh, 'F'); xx += sw; }
        bolha(doc, x0 + (res.media - 1) / 4 * w, by - 11, fmt(res.media));
        var mk = [1, 2, 2.5, 3, 3.5, 4, 5];
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.5); T(doc, '#555555');
        for (i = 0; i < mk.length; i++) doc.text(fmt(mk[i], mk[i] % 1 ? 1 : 0), x0 + (mk[i] - 1) / 4 * w, by + bh + 4.5, {align: 'center'});
        var cx0 = ML, cy0 = by + bh + 9;
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.3);
        for (i = 0; i < INT.length; i++) {
            var lab = pt(INT[i].txt + ': ' + (i === 0 ? '1 a 2' : (i === INT.length - 1 ? '4 a 5' : fmt(INT[i].de, 1) + ' a ' + fmt(INT[i].max, 1))));
            var tw = doc.getTextWidth(lab) + 6;
            if (cx0 + tw > ML + CW) { cx0 = ML; cy0 += 7; }
            F(doc, INT[i].bg);
            if (INT[i] === res.int) { D(doc, INT[i].cor); doc.setLineWidth(0.7); doc.roundedRect(cx0, cy0, tw, 5.4, 2.6, 2.6, 'FD'); }
            else doc.roundedRect(cx0, cy0, tw, 5.4, 2.6, 2.6, 'F');
            T(doc, INT[i].cor); doc.text(lab, cx0 + 3, cy0 + 3.8);
            cx0 += tw + 2.5;
        }
        c.y = cy0 + 10;

        var an = analise(res), nA = res.tb ? 4 : 1;
        for (i = 0; i < nA; i++) caixa(c, an[i].t, an[i].x);

        // Dominios
        c.need(45);
        secao(c, 'DOM\u00cdNIOS');
        for (i = 0; i < res.dom.length; i++) {
            var dd = res.dom[i];
            // pre-calcula a altura das etiquetas de criterio
            doc.setFont(undefined, 'bold'); doc.setFontSize(7);
            var chips = [], lx = 0, linhas = 1;
            for (k = 0; k < dd.crits.length; k++) {
                var xc = res.cr[dd.crits[k]], tx = pt(xc.nome + ' - ' + xc.st.txt), cw = doc.getTextWidth(tx) + 5;
                if (lx + cw > CW - 10) { linhas++; lx = 0; }
                chips.push({tx: tx, w: cw, st: xc.st, linha: linhas - 1, x: lx}); lx += cw + 2;
            }
            var hC = 19 + linhas * 6.2;
            c.need(hC + 3);
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, hC, 2, 2, 'FD');
            F(doc, dd.int.seg); doc.rect(ML, c.y, 1.8, hC, 'F');
            T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt(dd.nome), ML + 5, c.y + 5.8);
            badge(doc, ML + CW - 3, c.y + 2.2, dd.int.txt, dd.int.bg, dd.int.cor);
            F(doc, '#eceff1'); doc.roundedRect(ML + 5, c.y + 9, CW - 10, 3.6, 1.8, 1.8, 'F');
            F(doc, dd.int.seg); doc.roundedRect(ML + 5, c.y + 9, Math.max(3.6, (CW - 10) * (dd.media - 1) / 4), 3.6, 1.8, 1.8, 'F');
            T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
            doc.text(pt('M\u00e9dia ' + fmt(dd.media) + ' (de 1 a 5) - crit\u00e9rios deste dom\u00ednio:'), ML + 5, c.y + 17);
            doc.setFont(undefined, 'bold'); doc.setFontSize(7);
            for (k = 0; k < chips.length; k++) {
                var ch = chips[k], chy = c.y + 19 + ch.linha * 6.2;
                F(doc, ch.st.bg); doc.roundedRect(ML + 5 + ch.x, chy, ch.w, 4.8, 2.3, 2.3, 'F');
                T(doc, ch.st.cor); doc.text(ch.tx, ML + 5 + ch.x + 2.5, chy + 3.4);
            }
            c.y += hC + 3;
        }

        // Criterios
        c.need(40);
        secao(c, 'CRIT\u00c9RIOS DO DSM-5-TR');
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.5);
        doc.text(pt('Linha laranja = 3,0 (subcl\u00ednico)  |  linha vermelha = 3,5 (presente)  |  barra de 1 a 5'), ML + 2, c.y); c.y += 3;
        if (res.tb) {
            var grupos = [['Polo man\u00edaco / hipoman\u00edaco', res.tb.mania.crits], ['Gravidade e impacto funcional', [cf.tb.imp]], ['Polo depressivo', res.tb.dep.crits]];
            for (i = 0; i < grupos.length; i++) {
                c.need(14);
                F(doc, '#e8eaf6'); doc.rect(ML, c.y, CW, 6, 'F');
                T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(8.5); doc.text(pt(grupos[i][0]), ML + 3, c.y + 4.2);
                c.y += 7.5;
                for (k = 0; k < grupos[i][1].length; k++) critPDF(c, res.cr[grupos[i][1][k]]);
            }
        } else {
            for (i = 0; i < res.crit.length; i++) critPDF(c, res.crit[i]);
        }
        c.y += 4;

        // Mapa de respostas
        c.need(30);
        secao(c, 'MAPA DAS RESPOSTAS POR CRIT\u00c9RIO');
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.5);
        var lgx = ML + 2;
        for (i = 1; i <= 5; i++) { F(doc, QV[i].bg); D(doc, '#bdbdbd'); doc.setLineWidth(0.15); doc.roundedRect(lgx, c.y - 2.8, 3.4, 3.4, 0.6, 0.6, 'FD'); T(doc, '#555555'); doc.text(String(i), lgx + 4.5, c.y); lgx += 9; }
        doc.text(pt('= intensidade do tra\u00e7o (j\u00e1 com os itens invertidos, marcados com R)'), lgx + 1, c.y);
        c.y += 4;
        for (i = 0; i < res.crit.length; i++) {
            var xr = res.crit[i];
            c.need(9);
            T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            var nm = pt(xr.num + '. ' + xr.nome);
            while (doc.getTextWidth(nm) > 52 && nm.length > 4) nm = nm.slice(0, -2);
            if (nm !== pt(xr.num + '. ' + xr.nome)) nm = nm.replace(/\s*$/, '') + '...';
            doc.text(nm, ML + 2, c.y + 4.6);
            var qx = 72;
            for (k = 0; k < xr.itens.length; k++) {
                var q = xr.itens[k], qw = q.inv ? 10 : 8;
                F(doc, QV[q.v].bg); doc.roundedRect(qx, c.y, qw, 7, 1.4, 1.4, 'F');
                T(doc, QV[q.v].fg); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
                doc.text(q.n + (q.inv ? 'R' : ''), qx + qw / 2, c.y + 4.7, {align: 'center'});
                qx += qw + 1.6;
            }
            c.y += 8.6;
        }
        c.y += 3;

        // Analise
        c.need(30);
        secao(c, 'AN\u00c1LISE DO PERFIL');
        for (i = nA; i < an.length; i++) caixa(c, an[i].t, an[i].x);

        // Aviso + nota
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(aviso(res)), CW - 8), ha = avl.length * 3.8 + 8;
        c.need(ha + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, ha, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, ha, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += ha + 3;
        if (info.nota) caixa(c, 'Nota', info.nota);

        // Respostas do paciente por criterio (pagina propria)
        doc.addPage(); c.y = 20;
        secao(c, 'RESPOSTAS DO PACIENTE POR CRIT\u00c9RIO (compara\u00e7\u00e3o com o DSM-5-TR)');
        for (i = 0; i < res.crit.length; i++) {
            var xi = res.crit[i];
            c.need(16);
            F(doc, '#e8eaf6'); doc.rect(ML, c.y, CW, 6.4, 'F');
            T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6);
            doc.text(pt('Crit\u00e9rio ' + xi.num + ': ' + xi.nome), ML + 3, c.y + 4.4);
            badge(doc, ML + CW - 2, c.y + 0.5, xi.st.txt + ' (' + fmt(xi.media) + ')', xi.st.bg, xi.st.cor, 7);
            c.y += 8.6;
            for (k = 0; k < xi.itens.length; k++) {
                var qi = xi.itens[k];
                doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
                var tl = doc.splitTextToSize(pt(qi.n + '. ' + qi.texto + (qi.inv ? ' (R)' : '')), 138);
                var hl = tl.length * 3.6 + 1.6;
                c.need(hl);
                T(doc, '#222222'); doc.text(tl, ML + 3, c.y + 3);
                T(doc, '#000000'); doc.setFont(undefined, 'bold');
                doc.text(pt(LIK[qi.bruto] + ' (' + qi.bruto + ')'), ML + CW - 2, c.y + 3, {align: 'right'});
                c.y += hl;
            }
            c.y += 2.5;
        }
        c.need(8);
        T(doc, '#828282'); doc.setFont(undefined, 'italic'); doc.setFontSize(7);
        doc.text(pt('(R) = item invertido (pontua\u00e7\u00e3o invertida no c\u00e1lculo). As respostas mostradas s\u00e3o as marcadas pelo paciente.'), ML, c.y + 3);
        c.y += 8;

        // Referencias
        var refs = (info.referencias && info.referencias.length) ? info.referencias : REFS_PADRAO;
        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(9);
        for (i = 0; i < refs.length; i++) {
            var rl = doc.splitTextToSize(pt(refs[i]), CW - 4);
            c.need(rl.length * 4.4 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.4 + 4;
        }

        // Rodape em todas as paginas
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
    // Reconstroi o resultado a partir do que o painel guardou. Devolve null se faltar dado
    // (resultados antigos) - nesse caso o painel usa o PDF generico de sempre.
    function dePainel(d) {
        if (!d || !cfg(d.escala)) return null;
        var rd = d.respostasDetalhadas, cn = d.criteriosNomes, dm = d.dominios;
        if (!Array.isArray(rd) || !rd.length || !cn || typeof cn !== 'object' || !dm || typeof dm !== 'object') return null;
        var dominios = {}, ks = Object.keys(dm), i;
        for (i = 0; i < ks.length; i++) { if (!dm[ks[i]] || !Array.isArray(dm[ks[i]].criterios)) return null; dominios[ks[i]] = dm[ks[i]].criterios; }
        var itens = [];
        for (i = 0; i < rd.length; i++) {
            var b = parseInt(rd[i].valorBruto, 10);
            if (!(b >= 1 && b <= 5)) return null;
            itens.push({n: rd[i].n || (i + 1), texto: rd[i].texto || '', criterio: rd[i].criterio, invertido: !!rd[i].invertido, valorBruto: b});
        }
        try { return calcular({sigla: d.escala, itens: itens, criterios: cn, dominios: dominios}); } catch (e) { return null; }
    }
    function pdfPainel(d, r) {
        var res = dePainel(d);
        if (!res) return false;
        pdf(res, {
            nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : '',
            referencias: Array.isArray(d.referenciasPdf) ? d.referenciasPdf : [], nota: d.notaRodape || ''
        });
        return true;
    }

    window.SYM_ERT = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dePainel: dePainel, config: cfg};
})();
