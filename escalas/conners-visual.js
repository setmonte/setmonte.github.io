// conners-visual.js - Desenho sob medida da Escala de Conners para Pais, versao completa de 42 itens
// (tela de resultados + PDF da escala e do Painel). Versao brasileira atribuida a Barbosa (1995), que circula na pratica clinica.
// NAO e a Conners 3 nem a Conners 4 (MHS).
// Calculo mantido como no site: 42 itens (0-3), 3 itens invertidos (19 "Tem amigos", 23 "Aprende na escola", 24 "Gosta de ir a
// escola"), soma total 0-126, ponto de corte >= 58 (formulario circulante da versao de Barbosa; estudo original nao consultado).
// A divisao em 7 dominios segue o site. Sem normas por idade/sexo. Os rotulos de intensidade (Minimo ... Intenso) foram retirados:
// os dominios aparecem como percentual do maximo, sem classificacao.
// Os valores guardados no painel (d.respostas) ja sao PONTOS (itens invertidos ja convertidos), igual ao registro antigo.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    // [texto, dominio (1-7), invertido]
    var IT = [
        ['Desperta \u00e0 noite', 1, 0], ['Tem medo diante de novas situa\u00e7\u00f5es', 1, 0], ['Tem medo de gente', 1, 0],
        ['Tem medo de estar sozinho', 1, 0], ['Preocupa-se com doen\u00e7as e mortes', 1, 0], ['Mostra-se tenso e r\u00edgido', 1, 0],
        ['Apresenta sacudidas ou espasmos musculares', 2, 0], ['Apresenta tremores', 2, 0], ['Sente dores de cabe\u00e7a', 2, 0],
        ['Sente dores de est\u00f4mago', 2, 0], ['Tem v\u00f4mitos', 2, 0], ['Queixa-se de enfermidades e dores', 2, 0],
        ['Deixa-se levar por outras crian\u00e7as', 4, 0], ['Desafia e intimida os demais', 4, 0],
        ['\u00c9 valente (arrogante) e desrespeita seus superiores', 4, 0], ['\u00c9 descarado com os adultos', 4, 0],
        ['\u00c9 t\u00edmido diante dos amigos', 3, 0], ['Teme n\u00e3o agradar seus amigos', 3, 0], ['Tem amigos', 3, 1],
        ['\u00c9 malicioso com seus irm\u00e3os', 4, 0], ['Briga constantemente', 4, 0], ['Critica muito outras crian\u00e7as', 4, 0],
        ['Aprende na escola', 5, 1], ['Gosta de ir \u00e0 escola', 5, 1], ['Tem medo de ir \u00e0 escola', 5, 0],
        ['Desobedece as normas da escola', 5, 0], ['Mente, culpando os demais dos seus erros', 4, 0],
        ['Realiza roubos de seus pais', 4, 0], ['Realiza roubos na escola', 4, 0],
        ['Rouba em lojas, em barracas e em outros lugares', 4, 0], ['Tem problemas com a pol\u00edcia', 4, 0],
        ['Pretende fazer tudo bem feito (perfeito)', 6, 0], ['Necessita fazer sempre as coisas da mesma maneira', 6, 0],
        ['Tem objetivos muito altos (sonhar alto)', 6, 0], ['Distrai-se facilmente', 7, 0], ['Mostra-se nervoso e inquieto', 7, 0],
        ['N\u00e3o pode ficar quieto', 7, 0], ['Sobe em todas as partes', 7, 0], ['Desperta-se muito cedo', 7, 0],
        ['N\u00e3o fica quieto durante as refei\u00e7\u00f5es', 7, 0], ['Se come\u00e7a a fazer alguma coisa repetitivamente, \u00e9 imposs\u00edvel parar', 7, 0],
        ['Seus atos d\u00e3o a impress\u00e3o de serem movidos por um motor', 7, 0]
    ];
    var ITENS = IT.map(function (a, i) { return {n: i + 1, t: a[0], d: a[1], inv: !!a[2]}; });
    var DOM = {
        1: {nome: 'Ansiedade', curto: 'Ansiedade', cor: '#42a5f5'},
        2: {nome: 'Queixas Psicossom\u00e1ticas', curto: 'Psicossomaticas', cor: '#81c784'},
        3: {nome: 'Problemas Sociais', curto: 'ProblemasSociais', cor: '#ffb74d'},
        4: {nome: 'Problemas de Conduta', curto: 'Conduta', cor: '#ef5350'},
        5: {nome: 'Problemas de Aprendizagem', curto: 'Aprendizagem', cor: '#9575cd'},
        6: {nome: 'Perfeccionismo', curto: 'Perfeccionismo', cor: '#4db6ac'},
        7: {nome: 'Hiperatividade-Impulsividade', curto: 'Hiperatividade', cor: '#ff8a65'}
    };
    var ORDEM = [1, 2, 3, 4, 5, 6, 7];
    var RESP = ['Nunca', '\u00c0s vezes', 'Frequentemente', 'Sempre'];
    var CORTE = 58, TOTMAX = 126;
    var REFS = [
        'BARBOSA, G. A. Adapta\u00e7\u00e3o e valida\u00e7\u00e3o da Escala de Conners para pais no Brasil, 1995. (Vers\u00e3o de 42 itens citada na pr\u00e1tica cl\u00ednica brasileira; dados completos de publica\u00e7\u00e3o n\u00e3o confirmados.)',
        'GOYETTE, C. H.; CONNERS, C. K.; ULRICH, R. F. Normative data on revised Conners Parent and Teacher Rating Scales. Journal of Abnormal Child Psychology, v. 6, n. 2, p. 221-236, 1978.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'A Escala de Conners para Pais (vers\u00e3o de 42 itens) \u00e9 um instrumento de rastreio do comportamento infantil percebido pelos pais; n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o \u00e9 a Conners 3 nem a Conners 4 (MHS). O ponto de corte 58 \u00e9 o da vers\u00e3o adaptada por Barbosa (1995) que circula na pr\u00e1tica cl\u00ednica brasileira; o estudo original n\u00e3o foi consultado. A divis\u00e3o em dom\u00ednios e a invers\u00e3o dos itens "Tem amigos", "Aprende na escola" e "Gosta de ir \u00e0 escola" seguem a vers\u00e3o adotada pelo site, e n\u00e3o h\u00e1 normas por idade e sexo. Os percentuais por dom\u00ednio s\u00e3o descritivos, sem classifica\u00e7\u00e3o. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';

    var DOM_ITENS = {};
    ORDEM.forEach(function (k) { DOM_ITENS[k] = []; });
    ITENS.forEach(function (it, i) { DOM_ITENS[it.d].push(i); });

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f1(v) { return (Math.round(v * 10) / 10).toFixed(1).replace('.', ','); }
    function f2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }

    // ===================== CALCULO =====================
    // pts: 42 PONTOS (itens invertidos ja convertidos), cada um 0-3
    function calcular(pts, respondente, convivio) {
        if (!pts || pts.length !== 42) throw new Error('Conners: respostas incompletas');
        var r = {pts: [], bruto: [], total: 0, dom: {}, respondente: respondente || '', convivio: convivio || ''}, i;
        for (i = 0; i < 42; i++) {
            var v = parseInt(pts[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('Conners: resposta invalida no item ' + (i + 1));
            r.pts.push(v); r.bruto.push(ITENS[i].inv ? 3 - v : v); r.total += v;
        }
        ORDEM.forEach(function (k) {
            var soma = 0, idxs = DOM_ITENS[k];
            idxs.forEach(function (ix) { soma += r.pts[ix]; });
            r.dom[k] = {soma: soma, max: idxs.length * 3, n: idxs.length, media: soma / idxs.length, pct: soma / (idxs.length * 3) * 100};
        });
        r.acima = r.total >= CORTE;
        return r;
    }
    function classifGeral(r) { return 'Soma ' + r.total + '/126 - ' + (r.acima ? 'acima do ponto de corte (58)' : 'abaixo do ponto de corte (58)'); }
    function dadosPainel(r) {
        var o = {Total: {pontuacao: r.total, max: TOTMAX, classificacao: r.acima ? 'Acima do ponto de corte (>=58)' : 'Abaixo do ponto de corte (<58)'}};
        ORDEM.forEach(function (k) {
            o[DOM[k].nome] = {pontuacao: r.dom[k].soma, max: r.dom[k].max, media: Math.round(r.dom[k].media * 100) / 100, classificacao: f1(r.dom[k].pct) + '% do m\u00e1ximo'};
        });
        return o;
    }
    function analise(r) {
        var out = [], ord = ORDEM.slice().sort(function (a, b) { return r.dom[b].pct - r.dom[a].pct; });
        out.push({t: 'Resultado', x: 'Soma total ' + r.total + ' de 126, ' + (r.acima ? 'igual ou acima do ponto de corte de 58. Isso indica que o relato dos pais merece uma avalia\u00e7\u00e3o cl\u00ednica mais detalhada; n\u00e3o \u00e9 um diagn\u00f3stico.' : 'abaixo do ponto de corte de 58. Mesmo assim, olhe os dom\u00ednios individuais e a hist\u00f3ria da crian\u00e7a.')});
        out.push({t: 'Dom\u00ednios (descritivo)', x: 'Dom\u00ednios com maior propor\u00e7\u00e3o do m\u00e1ximo: ' + ord.slice(0, 3).map(function (k) { return DOM[k].nome + ' (' + f1(r.dom[k].pct) + '%)'; }).join('; ') + '. Os percentuais descrevem o relato dos pais e n\u00e3o t\u00eam classifica\u00e7\u00e3o nem norma por idade ou sexo.'});
        out.push({t: 'Sobre o ponto de corte', x: 'O corte 58 \u00e9 o da vers\u00e3o adaptada por Barbosa (1995) que circula na pr\u00e1tica cl\u00ednica brasileira; o estudo original n\u00e3o foi consultado. Tr\u00eas itens positivos ("Tem amigos", "Aprende na escola", "Gosta de ir \u00e0 escola") s\u00e3o invertidos na pontua\u00e7\u00e3o.'});
        out.push({t: 'Como usar', x: 'Esta \u00e9 a escala de pais, sobre o comportamento habitual em casa. Para uma vis\u00e3o completa, compare com o relato da escola e com a hist\u00f3ria cl\u00ednica.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.connv h2{color:#1565c0;margin-bottom:16px;text-align:center}' +
        '.connv h3{color:#1565c0;margin:26px 0 10px;font-size:1.12em}' +
        '.connv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.connv-res b{font-size:1.5em;display:block}' +
        '.connv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.connv-bar{position:relative;height:22px;background:#e0e0e0;border-radius:11px;margin:6px 0 2px}' +
        '.connv-bar>div{height:22px;border-radius:11px}' +
        '.connv-corte{position:absolute;top:-4px;width:3px;height:30px;background:#c62828}' +
        '.connv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.connv-tab th{background:#1565c0;color:#fff;padding:7px 4px}.connv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.connv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('connv-css')) return;
        var st = document.createElement('style'); st.id = 'connv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="connv"><h2>&#128203; Resultados &#8212; Escala de Conners (Pais)</h2>';
        h += '<div class="connv-res" style="background:' + (r.acima ? '#ffe0b2' : '#e3f2fd') + ';border-color:' + (r.acima ? '#fb8c00' : '#1565c0') + ';color:' + (r.acima ? '#bf5600' : '#0d47a1') + '"><b>Soma ' + r.total + ' / 126</b>' +
            (r.acima ? 'Acima do ponto de corte (58): vale aprofundar a avalia\u00e7\u00e3o' : 'Abaixo do ponto de corte (58)') + '</div>';
        h += '<div class="connv-box"><b>Soma total</b><div class="connv-bar"><div style="width:' + Math.max(1, r.total / TOTMAX * 100) + '%;background:' + (r.acima ? '#fb8c00' : '#1565c0') + '"></div><div class="connv-corte" style="left:' + (CORTE / TOTMAX * 100) + '%" title="corte 58"></div></div><div style="font-size:.8em;color:#c62828;text-align:right">linha vermelha: ponto de corte 58</div></div>';
        h += '<h3>&#128202; Percentual do m\u00e1ximo por dom\u00ednio</h3><div class="connv-box">';
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            h += '<div style="margin:8px 0 12px"><b>' + DOM[k].nome + ':</b> ' + r.dom[k].soma + ' de ' + r.dom[k].max + ' (' + f1(r.dom[k].pct) + '%)<div class="connv-bar"><div style="width:' + Math.max(1, r.dom[k].pct) + '%;background:' + DOM[k].cor + '"></div></div></div>';
        }
        h += '<div style="font-size:.82em;color:#666">Os dom\u00ednios s\u00e3o descritivos: n\u00e3o h\u00e1 classifica\u00e7\u00e3o nem normas por idade e sexo.</div></div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="connv-tab"><thead><tr><th>#</th><th style="text-align:left">Item</th><th>Resposta</th><th>Pontos</th></tr></thead><tbody>';
        for (i = 0; i < 42; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].t) + (ITENS[i].inv ? ' <span style="font-size:.75em;color:#6a1b9a;font-weight:700">(invertido)</span>' : '') + '</td><td style="text-align:center">' + RESP[r.bruto[i]] + '</td><td style="text-align:center;font-weight:700">' + r.pts[i] + '</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="connv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="connv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
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
    function barraPDF(c, rotulo, valor, max, cor, corte) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        c.need(13);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5, hb = 5;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.5, 2.5, 'F');
        F(doc, cor); doc.roundedRect(x0, yb, Math.max(2, w * valor / max), hb, 2.5, 2.5, 'F');
        if (corte != null) {
            var cx = x0 + w * corte / max;
            D(doc, '#c62828'); doc.setLineWidth(0.7); doc.line(cx, yb - 1.2, cx, yb + hb + 1.2);
            T(doc, '#c62828'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); doc.text('corte ' + corte, cx, yb + hb + 3.8, {align: 'center'});
        }
        c.y += corte != null ? 15 : 12;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('ESCALA DE CONNERS (PAIS) - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Vers\u00e3o completa de 42 itens - comportamento habitual em casa'), 105, 22, {align: 'center'});
        doc.text(pt('Vers\u00e3o brasileira atribu\u00edda a Barbosa (1995) | ponto de corte 58'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DA CRIAN\u00c7A', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Respondente: ' + (r.respondente || 'n\u00e3o informado') + (r.convivio ? '   |   Conv\u00edvio: ' + r.convivio : '')), 20, y + 22);
        c.y = 72;

        var cb = r.acima ? ['#ffe0b2', '#fb8c00', '#bf5600'] : ['#e3f2fd', '#1565c0', '#0d47a1'];
        F(doc, cb[0]); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, cb[1]); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, cb[2]); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt('Soma ' + r.total + ' / 126'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.acima ? 'Acima do ponto de corte (58): vale aprofundar a avalia\u00e7\u00e3o' : 'Abaixo do ponto de corte (58)'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'SOMA TOTAL');
        barraPDF(c, 'Total: ' + r.total + ' de 126', r.total, TOTMAX, r.acima ? '#fb8c00' : '#1565c0', CORTE);
        c.y += 2;
        secao(c, 'PERCENTUAL DO M\u00c1XIMO POR DOM\u00cdNIO');
        ORDEM.forEach(function (kk) { barraPDF(c, DOM[kk].nome + ': ' + r.dom[kk].soma + ' de ' + r.dom[kk].max + ' (' + f1(r.dom[kk].pct) + '%)', r.dom[kk].soma, r.dom[kk].max, DOM[kk].cor, null); });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2);
        doc.text(pt('Os dom\u00ednios s\u00e3o descritivos: n\u00e3o h\u00e1 classifica\u00e7\u00e3o nem normas por idade e sexo.'), ML + 2, c.y + 1);
        c.y += 8;

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
        var cn = 8, ct = 118, ca = 54, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item', xT + cn + 2, c.y + 4.7);
        doc.text('Resposta (pontos)', xT + cn + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < 42; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tl = doc.splitTextToSize(pt(ITENS[i].t + (ITENS[i].inv ? ' (invertido)' : '')), ct - 3), rh = Math.max(5.4, tl.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#f3f6fb'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tl, xT + cn + 2, c.y + 3.5);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(RESP[r.bruto[i]] + ' (' + r.pts[i] + ')'), xT + cn + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
            c.y += rh;
        }
        c.y += 6;

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
            doc.text('SYM Online | Conners (Pais) | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('CONNERS_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'CONNERS' || !d.respostas) return false;
        var pts = [];
        for (var i = 1; i <= 42; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; pts.push(v); }
        var res;
        try { res = calcular(pts, d.respondente, d.convivio); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_CONNERS = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        ITENS: ITENS, RESP: RESP, CORTE: CORTE};
})();
