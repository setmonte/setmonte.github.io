// snap-visual.js - Desenho sob medida do SNAP-IV (tela de resultados + PDF da escala e do Painel).
// MTA-SNAP-IV, 26 itens (Swanson, Nolan & Pelham); versao brasileira: Mattos, Serra-Pinheiro, Rohde e Pinto (2006) - estudo de
// traducao e adaptacao semantica (sem validacao nem normas brasileiras).
// Escala 0-3 (nem um pouco, so um pouco, bastante, demais). Dominios: Desatencao (itens 1-9), Hiperatividade/Impulsividade
// (10-18), TOD (19-26); Combinado = itens 1-18. Escore do dominio = MEDIA dos itens.
// Cortes de Swanson (aprox. percentil 95; provisorios; amostra americana), DIFERENTES para pais e professor:
//   Desatencao 1,78 (pais) / 2,56 (professor); Hiperatividade 1,44 / 1,78; Combinado 1,67 / 2,00; TOD 1,88 / 1,38.
// Equivalem a somas: pais D>=16, HI>=13, C>=30, TOD>=15; professor D>=23, HI>=16, C>=36, TOD>=11 (comparamos pela SOMA para
// nao depender de arredondamento).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    // [texto, dominio]
    var IT = [
        ['N\u00e3o consegue prestar muita aten\u00e7\u00e3o a detalhes ou comete erros por descuido nos trabalhos da escola ou tarefas.', 'D'],
        ['Tem dificuldade de manter a aten\u00e7\u00e3o em tarefas ou atividades de lazer.', 'D'],
        ['Parece n\u00e3o estar ouvindo quando se fala diretamente com ele(a).', 'D'],
        ['N\u00e3o segue instru\u00e7\u00f5es at\u00e9 o fim e n\u00e3o termina deveres de escola, tarefas ou obriga\u00e7\u00f5es.', 'D'],
        ['Tem dificuldade para organizar tarefas e atividades.', 'D'],
        ['Evita, n\u00e3o gosta ou se envolve contra a vontade em tarefas que exigem esfor\u00e7o mental prolongado.', 'D'],
        ['Perde coisas necess\u00e1rias para atividades (ex: brinquedos, deveres da escola, l\u00e1pis ou livros).', 'D'],
        ['Distrai-se com est\u00edmulos externos.', 'D'],
        ['\u00c9 esquecido(a) em atividades do dia a dia.', 'D'],
        ['Mexe com as m\u00e3os ou os p\u00e9s ou se remexe na cadeira.', 'HI'],
        ['Sai do lugar na sala de aula ou em outras situa\u00e7\u00f5es em que se espera que fique sentado(a).', 'HI'],
        ['Corre de um lado para outro ou sobe demais nas coisas em situa\u00e7\u00f5es em que isto \u00e9 inapropriado.', 'HI'],
        ['Tem dificuldade em brincar ou envolver-se em atividades de lazer de forma calma.', 'HI'],
        ['N\u00e3o para ou frequentemente est\u00e1 a "mil por hora".', 'HI'],
        ['Fala em excesso.', 'HI'],
        ['Responde as perguntas de forma precipitada antes delas terem sido terminadas.', 'HI'],
        ['Tem dificuldade de esperar sua vez.', 'HI'],
        ['Interrompe os outros ou se intromete (ex: intromete-se nas conversas ou jogos).', 'HI'],
        ['Descontrola-se (perde a paci\u00eancia).', 'TOD'],
        ['Discute com adultos.', 'TOD'],
        ['Desafia ou se recusa a obedecer pedidos ou regras dos adultos.', 'TOD'],
        ['Faz coisas de prop\u00f3sito que incomodam os outros.', 'TOD'],
        ['Culpa os outros pelos seus erros ou mau comportamento.', 'TOD'],
        ['\u00c9 irrit\u00e1vel e facilmente incomodado(a) pelos outros.', 'TOD'],
        ['Fica bravo(a) e ressentido(a).', 'TOD'],
        ['\u00c9 maldoso(a) e vingativo(a).', 'TOD']
    ];
    var ITENS = IT.map(function (a, i) { return {n: i + 1, t: a[0], d: a[1]}; });
    var RESP = ['Nem um pouco', 'S\u00f3 um pouco', 'Bastante', 'Demais'];
    var DOM = {
        D: {nome: 'Desaten\u00e7\u00e3o', curto: 'Desatencao', n: 9, cor: '#1565c0'},
        HI: {nome: 'Hiperatividade/Impulsividade', curto: 'Hiperatividade', n: 9, cor: '#6a1b9a'},
        C: {nome: 'Combinado (itens 1-18)', curto: 'Combinado', n: 18, cor: '#00695c'},
        TOD: {nome: 'Transtorno Opositor Desafiador', curto: 'TOD', n: 8, cor: '#e65100'}
    };
    var ORDEM = ['D', 'HI', 'C', 'TOD'];
    var CORTE = {
        pais: {D: {soma: 16, media: '1,78'}, HI: {soma: 13, media: '1,44'}, C: {soma: 30, media: '1,67'}, TOD: {soma: 15, media: '1,88'}},
        professor: {D: {soma: 23, media: '2,56'}, HI: {soma: 16, media: '1,78'}, C: {soma: 36, media: '2,00'}, TOD: {soma: 11, media: '1,38'}}
    };
    var REFS = [
        'MATTOS, P. et al. Apresenta\u00e7\u00e3o de uma vers\u00e3o em portugu\u00eas para uso no Brasil do instrumento MTA-SNAP-IV de avalia\u00e7\u00e3o de sintomas de transtorno do d\u00e9ficit de aten\u00e7\u00e3o/hiperatividade e sintomas de transtorno desafiador e de oposi\u00e7\u00e3o. Revista de Psiquiatria do Rio Grande do Sul, v. 28, n. 3, p. 290-297, 2006.',
        'BUSSING, R. et al. Parent and teacher SNAP-IV ratings of attention deficit/hyperactivity disorder symptoms: psychometric properties and normative ratings from a school district sample. Assessment, v. 15, n. 3, p. 317-328, 2008.',
        'MTA COOPERATIVE GROUP. A 14-month randomized clinical trial of treatment strategies for attention-deficit/hyperactivity disorder. Archives of General Psychiatry, v. 56, n. 12, p. 1073-1086, 1999.',
        'SWANSON, J. M. SNAP-IV scoring instructions: cut-offs for parent and teacher ratings. Dispon\u00edvel em: http://www.columbia.edu/itc/hs/medical/residency/peds/new_compeds_site/pdfs_new/genpeds_webdocs/SNAP-IV_Scoring_Instructions.pdf. Acesso em: 10 nov. 2026.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O SNAP-IV \u00e9 um instrumento de rastreio de sintomas de TDAH e TOD baseado nos crit\u00e9rios do DSM-IV (mantidos no DSM-5-TR); n\u00e3o \u00e9 diagn\u00f3stico. Os cortes de Swanson s\u00e3o provis\u00f3rios (aproximam o percentil 95) e v\u00eam de amostra americana, e s\u00e3o diferentes para pais e professor; a vers\u00e3o brasileira (Mattos et al., 2006) \u00e9 de tradu\u00e7\u00e3o e ainda n\u00e3o tem normas brasileiras. O diagn\u00f3stico exige avalia\u00e7\u00e3o cl\u00ednica abrangente (in\u00edcio na inf\u00e2ncia, preju\u00edzo funcional em mais de um contexto e exclus\u00e3o de outras causas). Conv\u00e9m comparar pais e professor.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
    function normResp(txt) {
        var t = String(txt || '').toLowerCase();
        if (/prof/.test(t)) return {chave: 'professor', rotulo: 'Professor(a)', nota: ''};
        if (/pai|m[a\u00e3]e|respons|pais/.test(t) && !/outro/.test(t)) return {chave: 'pais', rotulo: 'Pais ou respons\u00e1vel', nota: ''};
        if (/outro/.test(t)) return {chave: 'pais', rotulo: 'Outro respons\u00e1vel (cortes dos pais)', nota: 'Respondente "outro respons\u00e1vel": foram usados os cortes dos pais.'};
        return {chave: 'pais', rotulo: 'N\u00e3o informado (cortes dos pais)', nota: 'Respondente n\u00e3o informado: foram usados os cortes dos pais. Se quem respondeu foi um professor, os cortes oficiais s\u00e3o diferentes.'};
    }

    // ===================== CALCULO =====================
    // vals: 26 respostas (0-3)
    function calcular(vals, respondente, convivio) {
        if (!vals || vals.length !== 26) throw new Error('SNAP-IV: respostas incompletas');
        var r = {vals: [], soma: {D: 0, HI: 0, TOD: 0, C: 0}, media: {}, pos: {}, sint: {D: 0, HI: 0, TOD: 0}, convivio: convivio || ''}, i;
        for (i = 0; i < 26; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('SNAP-IV: resposta invalida no item ' + (i + 1));
            r.vals.push(v);
            var d = ITENS[i].d;
            r.soma[d] += v;
            if (d !== 'TOD') r.soma.C += v;
            if (v >= 2) r.sint[d]++;
        }
        r.resp = normResp(respondente);
        var cz = CORTE[r.resp.chave];
        ORDEM.forEach(function (k) {
            r.media[k] = r.soma[k] / DOM[k].n;
            r.pos[k] = r.soma[k] >= cz[k].soma;
        });
        r.apresentacao = (r.pos.D && r.pos.HI) ? 'TDAH - padr\u00e3o combinado (desaten\u00e7\u00e3o + hiperatividade/impulsividade)' :
            (r.pos.D ? 'TDAH - padr\u00e3o predominantemente desatento' : (r.pos.HI ? 'TDAH - padr\u00e3o predominantemente hiperativo/impulsivo' : 'Rastreio de TDAH negativo'));
        return r;
    }
    function classifGeral(r) {
        return 'D:' + (r.pos.D ? 'Positivo' : 'Negativo') + ' / HI:' + (r.pos.HI ? 'Positivo' : 'Negativo') + ' / TOD:' + (r.pos.TOD ? 'Positivo' : 'Negativo');
    }
    function dadosPainel(r) {
        var o = {};
        ORDEM.forEach(function (k) {
            o[DOM[k].curto] = {pontuacao: r.soma[k], max: DOM[k].n * 3, media: Math.round(r.media[k] * 100) / 100, classificacao: r.pos[k] ? 'Positivo' : 'Negativo'};
        });
        return o;
    }
    function analise(r, notaAntigo) {
        var out = [], cz = CORTE[r.resp.chave];
        out.push({t: 'Resultado', x: r.apresentacao + '. ' + (r.pos.TOD ? 'Rastreio POSITIVO tamb\u00e9m para TOD (comportamento opositor-desafiador): recomenda-se avalia\u00e7\u00e3o cl\u00ednica.' : 'Rastreio negativo para TOD.')});
        out.push({t: 'Cortes usados (' + r.resp.rotulo + ')', x: ORDEM.map(function (k) { return DOM[k].nome + ': m\u00e9dia ' + f2(r.media[k]) + ' (' + (r.pos[k] ? 'acima' : 'abaixo') + ' do corte ' + cz[k].media + ')'; }).join('; ') + '. Os cortes de Swanson aproximam o percentil 95 e s\u00e3o provis\u00f3rios; n\u00e3o h\u00e1 normas brasileiras.'});
        out.push({t: 'Contagem de sintomas (refer\u00eancia DSM-5-TR)', x: 'Itens marcados "bastante" ou "demais": desaten\u00e7\u00e3o ' + r.sint.D + ' de 9; hiperatividade/impulsividade ' + r.sint.HI + ' de 9; TOD ' + r.sint.TOD + ' de 8. Para TDAH, o DSM-5-TR pede 6 ou mais sintomas em um dos grupos (5 ou mais a partir dos 17 anos), al\u00e9m de in\u00edcio na inf\u00e2ncia e preju\u00edzo em mais de um contexto.'});
        out.push({t: 'Como interpretar', x: 'Os cortes s\u00e3o diferentes para pais e professor, e os dois relatos costumam divergir por verem a crian\u00e7a em contextos distintos. Se poss\u00edvel, aplique com os dois e compare. Resultado positivo indica necessidade de avalia\u00e7\u00e3o, n\u00e3o diagn\u00f3stico.'});
        if (r.resp.nota) out.push({t: 'Aten\u00e7\u00e3o ao respondente', x: r.resp.nota});
        if (notaAntigo) out.push({t: 'Registro anterior \u00e0 corre\u00e7\u00e3o dos cortes', x: 'Este registro foi salvo antes de 10/11/2026, quando o painel classificava com m\u00e9dia >= 1,5 em todos os dom\u00ednios (corte sem fonte). Este relat\u00f3rio foi recalculado com os cortes oficiais de Swanson; a classifica\u00e7\u00e3o exibida na lista do painel pode diferir.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.snapv h2{color:#e65100;margin-bottom:16px;text-align:center}' +
        '.snapv h3{color:#e65100;margin:26px 0 10px;font-size:1.12em}' +
        '.snapv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.snapv-res b{font-size:1.35em;display:block}' +
        '.snapv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.snapv-bar{position:relative;height:22px;background:#e0e0e0;border-radius:11px;margin:6px 0 2px}' +
        '.snapv-bar>div{height:22px;border-radius:11px}' +
        '.snapv-corte{position:absolute;top:-4px;width:3px;height:30px;background:#c62828}' +
        '.snapv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.snapv-tab th{background:#e65100;color:#fff;padding:7px 4px}.snapv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.snapv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('snapv-css')) return;
        var st = document.createElement('style'); st.id = 'snapv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r, notaAntigo) {
        injetarCSS();
        var i, k, cz = CORTE[r.resp.chave], h = '<div class="snapv"><h2>&#128203; Resultados SNAP-IV</h2>';
        var pos = r.pos.D || r.pos.HI || r.pos.TOD;
        h += '<div class="snapv-res" style="background:' + (pos ? '#ffe0b2' : '#c8e6c9') + ';border-color:' + (pos ? '#e65100' : '#2e7d32') + ';color:' + (pos ? '#bf360c' : '#1b5e20') + '"><b>' + esc(r.apresentacao) + '</b>Respondente: ' + esc(r.resp.rotulo) + (r.convivio ? ' | Conv\u00edvio: ' + esc(r.convivio) : '') + '</div>';
        h += '<h3>&#128202; M\u00e9dia por dom\u00ednio (0 a 3) e corte</h3><div class="snapv-box">';
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            h += '<div style="margin:10px 0 12px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"><b>' + DOM[k].nome + ': m\u00e9dia ' + f2(r.media[k]) + ' (soma ' + r.soma[k] + ' de ' + DOM[k].n * 3 + ')</b><b style="color:' + (r.pos[k] ? '#c62828' : '#2e7d32') + '">' + (r.pos[k] ? 'ACIMA do corte' : 'abaixo do corte') + ' (' + cz[k].media + ')</b></div>' +
                '<div class="snapv-bar"><div style="width:' + Math.max(1, r.media[k] / 3 * 100) + '%;background:' + (r.pos[k] ? '#e53935' : DOM[k].cor) + '"></div><div class="snapv-corte" style="left:' + (parseFloat(cz[k].media.replace(',', '.')) / 3 * 100) + '%" title="corte ' + cz[k].media + '"></div></div></div>';
        }
        h += '<div style="font-size:.82em;color:#666">Linha vermelha: corte de ' + esc(r.resp.rotulo.toLowerCase()) + ' (Swanson, provis\u00f3rio). A escala vai de 0 a 3.</div></div>';
        h += '<h3>&#128203; Itens marcados "bastante" ou "demais"</h3><div class="snapv-box">Desaten\u00e7\u00e3o: <b>' + r.sint.D + ' de 9</b> | Hiperatividade/Impulsividade: <b>' + r.sint.HI + ' de 9</b> | TOD: <b>' + r.sint.TOD + ' de 8</b></div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="snapv-tab"><thead><tr><th>#</th><th>Dom.</th><th style="text-align:left">Item</th><th>Resposta (pontos)</th></tr></thead><tbody>';
        for (i = 0; i < 26; i++) {
            h += '<tr' + (r.vals[i] >= 2 ? ' style="background:#fff3e0"' : '') + '><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td style="text-align:center">' + ITENS[i].d + '</td><td>' + esc(ITENS[i].t) + '</td><td style="text-align:center;font-weight:700">' + RESP[r.vals[i]] + ' (' + r.vals[i] + ')</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r, notaAntigo);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="snapv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="snapv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#e65100';
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
        var doc = c.doc, cz = CORTE[r.resp.chave][k], x0 = ML + 2, w = CW - 4, mv = r.media[k];
        c.need(17);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6);
        doc.text(pt(DOM[k].nome + ': m\u00e9dia ' + f2(mv) + ' (soma ' + r.soma[k] + ' de ' + DOM[k].n * 3 + ')'), x0, c.y + 3.6);
        T(doc, r.pos[k] ? '#c62828' : '#2e7d32'); doc.setFontSize(8.2);
        doc.text(pt((r.pos[k] ? 'ACIMA do corte' : 'abaixo do corte') + ' (' + cz.media + ')'), x0 + w, c.y + 3.6, {align: 'right'});
        var yb = c.y + 5.6, hb = 5.4;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.7, 2.7, 'F');
        F(doc, r.pos[k] ? '#e53935' : DOM[k].cor); doc.roundedRect(x0, yb, Math.max(2, w * mv / 3), hb, 2.7, 2.7, 'F');
        var cx = x0 + w * parseFloat(cz.media.replace(',', '.')) / 3;
        D(doc, '#c62828'); doc.setLineWidth(0.7); doc.line(cx, yb - 1.2, cx, yb + hb + 1.2);
        T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.4);
        for (var t = 0; t <= 3; t++) doc.text(String(t), x0 + w * t / 3, yb + hb + 3.8, {align: 'center'});
        c.y += 16;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('SNAP-IV - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Avalia\u00e7\u00e3o de TDAH e TOD (MTA-SNAP-IV, 26 itens)'), 105, 22, {align: 'center'});
        doc.text(pt('Swanson, Nolan & Pelham | vers\u00e3o brasileira: Mattos et al. (2006) | cortes de Swanson'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Crian\u00e7a/Adolescente: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Respondente: ' + r.resp.rotulo + (r.convivio ? '   |   Conv\u00edvio: ' + r.convivio : '')), 20, y + 22);
        c.y = 72;

        var pos = r.pos.D || r.pos.HI || r.pos.TOD;
        F(doc, pos ? '#ffe0b2' : '#c8e6c9'); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, pos ? '#e65100' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, pos ? '#bf360c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(11.5);
        doc.text(doc.splitTextToSize(pt(r.apresentacao), CW - 8), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(8.8); doc.text(pt(r.pos.TOD ? 'Rastreio positivo tamb\u00e9m para TOD' : 'Rastreio negativo para TOD'), 105, c.y + 13, {align: 'center'});
        c.y += 22;

        secao(c, 'M\u00c9DIA POR DOM\u00cdNIO (0 a 3) E CORTE');
        ORDEM.forEach(function (k) { barraPDF(c, r, k); });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2);
        doc.text(pt('Linha vermelha: corte de ' + r.resp.rotulo.toLowerCase() + ' (Swanson, provis\u00f3rio). Itens marcados "bastante" ou "demais": desaten\u00e7\u00e3o ' + r.sint.D + '/9, hiperatividade ' + r.sint.HI + '/9, TOD ' + r.sint.TOD + '/8.'), ML + 2, c.y + 1);
        c.y += 8;

        secao(c, 'AN\u00c1LISE');
        var an = analise(r, info.notaAntigo);
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
        var cn = 8, cs = 10, ct = 122, ca = 40, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Dom.', xT + cn + cs / 2, c.y + 4.7, {align: 'center'});
        doc.text('Item', xT + cn + cs + 2, c.y + 4.7); doc.text('Resposta (pontos)', xT + cn + cs + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < 26; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tl = doc.splitTextToSize(pt(ITENS[i].t), ct - 3), rh = Math.max(5.6, tl.length * 3.3 + 2.6);
            c.need(rh);
            if (r.vals[i] >= 2) { F(doc, '#fff3e0'); doc.rect(xT, c.y, CW, rh, 'F'); } else if (i % 2 === 0) { F(doc, '#f7f7f7'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            doc.text(ITENS[i].d, xT + cn + cs / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tl, xT + cn + cs + 2, c.y + 3.6);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(RESP[r.vals[i]] + ' (' + r.vals[i] + ')'), xT + cn + cs + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
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
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | SNAP-IV | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('SNAPIV_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'SNAP-IV' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 26; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals, d.respondente, d.convivio); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '', notaAntigo: !d.cortesOficiais,
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_SNAP = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, ITENS: ITENS, RESP: RESP};
})();
