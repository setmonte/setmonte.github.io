// scared-visual.js - Desenho sob medida do SCARED (versao crianca/adolescente, autorrelato, 41 itens)
// (tela de resultados + PDF da escala e do Painel).
// Calculo mantido como no site e conferido com a publicacao original (Birmaher et al., 1997): 41 itens (0-2), soma total 0-82,
// ponto de corte total >= 25; subescalas: Panico/Somatico (13 itens, >=7), Ansiedade Generalizada (9, >=9), Ansiedade de Separacao
// (8, >=5), Ansiedade Social (7, >=8), Evitacao Escolar (4, >=3).
// O corte ">= 30 mais especifico" circula na pratica, mas nao vem do artigo original; o estudo brasileiro de DeSousa et al. (2013)
// encontrou ponto otimo de 22 (sensibilidade 81,8%; especificidade 52,0%) em amostra comunitaria. Ambos aparecem so como informacao.
// Os rotulos "RASTREIO POSITIVO" e as cores de alarme foram retirados: acima/abaixo do ponto de corte.
// Texto dos itens: mantido como estava no site; NAO foi comparado com o texto oficial da versao brasileira (Isolan et al., 2011).
// d.respostas guarda os valores brutos 0-2 (chaves 1..41), igual ao registro antigo.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    var TXT = [
        'Quando estou com medo \u00e9 dif\u00edcil respirar.',
        'Tenho dor de cabe\u00e7a quando estou na escola.',
        'Eu n\u00e3o gosto de estar com pessoas que n\u00e3o conhe\u00e7o direito.',
        'Fico com medo se durmo fora de casa.',
        'Preocupo-me em rela\u00e7\u00e3o aos outros gostarem de mim.',
        'Quando estou assustado/a parece que vou desmaiar.',
        'Eu sou nervoso/a.',
        'Sigo meu pai ou minha m\u00e3e aonde quer que eles v\u00e3o.',
        'As pessoas me dizem que eu pare\u00e7o nervoso/a.',
        'Sinto-me nervoso/a com pessoas que n\u00e3o conhe\u00e7o direito.',
        'Tenho dor de est\u00f4mago na escola.',
        'Quando me assusto, parece que vou enlouquecer.',
        'Preocupo-me em ter que dormir sozinho/a.',
        'Preocupo-me em ser t\u00e3o bom/a quanto as outras crian\u00e7as.',
        'Quando me assusto, parece que as coisas n\u00e3o s\u00e3o reais.',
        'Tenho pesadelos de que algo ruim aconte\u00e7a com meus pais.',
        'Preocupo-me sobre ir \u00e0 escola.',
        'Quando me assusto, meu cora\u00e7\u00e3o bate r\u00e1pido.',
        'Fico tr\u00eamulo/a.',
        'Tenho pesadelos de que algo ruim possa me acontecer.',
        'Eu me preocupo sobre as coisas darem certo para mim.',
        'Quando me assusto, suo bastante.',
        'Eu vivo preocupado/a.',
        'Eu fico muito assustado/a sem motivo algum.',
        'Fico com medo de ficar em casa sozinho/a.',
        'Tenho dificuldade para falar com pessoas que n\u00e3o conhe\u00e7o.',
        'Quando me assusto, parece que vou sufocar.',
        'As pessoas me dizem que eu me preocupo demais.',
        'N\u00e3o gosto de estar longe da fam\u00edlia.',
        'Tenho medo de ter crises de ansiedade (ou de p\u00e2nico).',
        'Preocupo-me que algo ruim possa acontecer com meus pais.',
        'Sinto-me t\u00edmido/a com pessoas que n\u00e3o conhe\u00e7o direito.',
        'Preocupo-me com o que vai acontecer no futuro.',
        'Quando fico assustado/a, parece que vou vomitar.',
        'Preocupo-me com qu\u00e3o bem fa\u00e7o as coisas.',
        'Tenho medo de ir a escola.',
        'Preocupo-me com coisas que j\u00e1 aconteceram.',
        'Quando me assusto, fico tonto.',
        'Fico nervoso/a quando estou com outras crian\u00e7as ou adultos e tenho que fazer alguma coisa com eles me olhando (ex. falar, ler, jogar, praticar esporte).',
        'Fico nervoso/a quando vou a festas, bailes ou qualquer lugar onde vai haver pessoas que n\u00e3o conhe\u00e7o.',
        'Sou t\u00edmido/a.'
    ];
    var ITENS = TXT.map(function (t, i) { return {n: i + 1, t: t}; });

    var SUB = {
        panico: {nome: 'P\u00e2nico/Som\u00e1tico', itens: [1, 6, 9, 12, 15, 18, 19, 22, 24, 27, 30, 34, 38], corte: 7, cor: '#6d4c41'},
        gen: {nome: 'Ansiedade Generalizada', itens: [5, 7, 14, 21, 23, 28, 33, 35, 37], corte: 9, cor: '#e65100'},
        sep: {nome: 'Ansiedade de Separa\u00e7\u00e3o', itens: [4, 8, 13, 16, 20, 25, 29, 31], corte: 5, cor: '#f9a825'},
        soc: {nome: 'Ansiedade Social', itens: [3, 10, 26, 32, 39, 40, 41], corte: 8, cor: '#7b1fa2'},
        esc: {nome: 'Evita\u00e7\u00e3o Escolar', itens: [2, 11, 17, 36], corte: 3, cor: '#455a64'}
    };
    var ORDEM = ['panico', 'gen', 'sep', 'soc', 'esc'];
    var DESC = {
        panico: 'sintomas de p\u00e2nico e queixas f\u00edsicas de ansiedade',
        gen: 'preocupa\u00e7\u00e3o excessiva com v\u00e1rios assuntos',
        sep: 'medo de se separar das figuras de apego',
        soc: 'desconforto com pessoas desconhecidas e situa\u00e7\u00f5es de exposi\u00e7\u00e3o',
        esc: 'recusa ou medo de ir \u00e0 escola'
    };
    var RESP = ['N\u00e3o verdadeiro', '\u00c0s vezes verdadeiro', 'Verdadeiro'];
    var CORTE = 25, TOTMAX = 82;
    var REFS = [
        'ISOLAN, L.; SALUM, G. A.; OSOWSKI, A. T.; AMARO, E.; MANFRO, G. G. Psychometric properties of the Screen for Child Anxiety Related Emotional Disorders (SCARED) in Brazilian children and adolescents. Journal of Anxiety Disorders, v. 25, n. 5, p. 741-748, 2011.',
        'DESOUSA, D. A.; SALUM, G. A.; ISOLAN, L. R.; MANFRO, G. G. Sensitivity and specificity of the Screen for Child Anxiety Related Emotional Disorders (SCARED): a community-based study. Child Psychiatry and Human Development, v. 44, n. 3, p. 391-399, 2013. (Volume e p\u00e1ginas conforme cita\u00e7\u00e3o anterior do site; n\u00e3o reconfirmados.)',
        'BIRMAHER, B.; KHETARPAL, S.; BRENT, D.; CULLY, M.; BALACH, L.; KAUFMAN, J.; NEER, S. M. The Screen for Child Anxiety Related Emotional Disorders (SCARED): scale construction and psychometric characteristics. Journal of the American Academy of Child and Adolescent Psychiatry, v. 36, n. 4, p. 545-553, 1997.',
        'BIRMAHER, B.; BRENT, D. A.; CHIAPPETTA, L.; BRIDGE, J.; MONGA, S.; BAUGHER, M. Psychometric properties of the Screen for Child Anxiety Related Emotional Disorders (SCARED): a replication study. Journal of the American Academy of Child and Adolescent Psychiatry, v. 38, n. 10, p. 1230-1236, 1999.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O SCARED \u00e9 um instrumento de rastreio de sintomas de ansiedade em crian\u00e7as e adolescentes (8 a 18 anos), em autorrelato; n\u00e3o \u00e9 diagn\u00f3stico e n\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional. O ponto de corte de 25 \u00e9 o da publica\u00e7\u00e3o original (Birmaher et al., 1997). O valor 30, citado na pr\u00e1tica como "mais espec\u00edfico", n\u00e3o vem do artigo original; no estudo comunit\u00e1rio brasileiro de DeSousa et al. (2013) o ponto \u00f3timo foi 22 (sensibilidade 81,8% e especificidade 52,0%). Os cortes das subescalas indicam apenas que aquele grupo de sintomas merece aten\u00e7\u00e3o. Os resultados devem ser interpretados por profissional qualificado, junto com a hist\u00f3ria cl\u00ednica e, quando poss\u00edvel, o relato dos pais.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f1(v) { return (Math.round(v * 10) / 10).toFixed(1).replace('.', ','); }

    // ===================== CALCULO =====================
    // vals: 41 valores brutos 0-2
    function calcular(vals) {
        if (!vals || vals.length !== 41) throw new Error('SCARED: respostas incompletas');
        var r = {v: [], total: 0, sub: {}}, i;
        for (i = 0; i < 41; i++) {
            var x = parseInt(vals[i], 10);
            if (!(x >= 0 && x <= 2)) throw new Error('SCARED: resposta invalida no item ' + (i + 1));
            r.v.push(x); r.total += x;
        }
        ORDEM.forEach(function (k) {
            var s = 0;
            SUB[k].itens.forEach(function (n) { s += r.v[n - 1]; });
            r.sub[k] = {soma: s, max: SUB[k].itens.length * 2, corte: SUB[k].corte, acima: s >= SUB[k].corte};
        });
        r.acima = r.total >= CORTE;
        return r;
    }
    function classifGeral(r) { return 'Soma ' + r.total + '/82 - ' + (r.acima ? 'acima do ponto de corte (25)' : 'abaixo do ponto de corte (25)'); }
    function dadosPainel(r) {
        var o = {Total: {pontuacao: r.total, max: TOTMAX, classificacao: r.acima ? 'Acima do ponto de corte (>=25)' : 'Abaixo do ponto de corte (<25)'}};
        ORDEM.forEach(function (k) {
            o[SUB[k].nome] = {pontuacao: r.sub[k].soma, max: r.sub[k].max, classificacao: r.sub[k].acima ? 'Acima do corte (>=' + r.sub[k].corte + ')' : 'Abaixo do corte (<' + r.sub[k].corte + ')'};
        });
        return o;
    }
    function listaAcima(r) { return ORDEM.filter(function (k) { return r.sub[k].acima; }); }
    function analise(r) {
        var out = [], ac = listaAcima(r);
        out.push({t: 'Resultado total', x: 'Soma total ' + r.total + ' de 82, ' + (r.acima ? 'igual ou acima do ponto de corte de 25. Isso indica que os sintomas de ansiedade relatados merecem investiga\u00e7\u00e3o cl\u00ednica; n\u00e3o \u00e9 um diagn\u00f3stico.' : 'abaixo do ponto de corte de 25. O relato n\u00e3o sugere ansiedade em n\u00edvel de rastreio positivo, mas olhe as subescalas e a hist\u00f3ria da crian\u00e7a.')});
        if (ac.length) {
            out.push({t: 'Subescalas acima do corte', x: ac.map(function (k) { return SUB[k].nome + ' (' + r.sub[k].soma + ' de ' + r.sub[k].max + ', corte ' + SUB[k].corte + '): ' + DESC[k]; }).join('; ') + '. Cada subescala \u00e9 um sinal de aten\u00e7\u00e3o para o tema, e n\u00e3o um diagn\u00f3stico do transtorno correspondente.'});
        } else {
            out.push({t: 'Subescalas', x: 'Nenhuma subescala chegou ao ponto de corte.'});
        }
        out.push({t: 'Sobre os pontos de corte', x: 'O corte total de 25 \u00e9 o da publica\u00e7\u00e3o original. O valor 30, citado como mais espec\u00edfico, n\u00e3o vem do artigo original. No estudo brasileiro de DeSousa et al. (2013), em amostra comunit\u00e1ria, o ponto \u00f3timo foi 22 (sensibilidade 81,8%, especificidade 52,0%). Por isso, o resultado deve ser lido junto com a entrevista cl\u00ednica.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.scv h2{color:#e65100;margin-bottom:16px;text-align:center}' +
        '.scv h3{color:#e65100;margin:26px 0 10px;font-size:1.12em}' +
        '.scv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.scv-res b{font-size:1.5em;display:block}' +
        '.scv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.scv-bar{position:relative;height:22px;background:#e0e0e0;border-radius:11px;margin:6px 0 2px}' +
        '.scv-bar>div{height:22px;border-radius:11px}' +
        '.scv-corte{position:absolute;top:-4px;width:3px;height:30px;background:#c62828}' +
        '.scv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.scv-tab th{background:#e65100;color:#fff;padding:7px 4px}.scv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.scv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('scv-css')) return;
        var st = document.createElement('style'); st.id = 'scv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="scv"><h2>&#128203; Resultados &#8212; SCARED</h2>';
        h += '<div class="scv-res" style="background:' + (r.acima ? '#ffe0b2' : '#eceff1') + ';border-color:' + (r.acima ? '#fb8c00' : '#607d8b') + ';color:' + (r.acima ? '#bf5600' : '#37474f') + '"><b>Soma ' + r.total + ' / 82</b>' +
            (r.acima ? 'Acima do ponto de corte (25): vale investigar' : 'Abaixo do ponto de corte (25)') + '</div>';
        h += '<div class="scv-box"><b>Soma total</b><div class="scv-bar"><div style="width:' + Math.max(1, r.total / TOTMAX * 100) + '%;background:' + (r.acima ? '#fb8c00' : '#607d8b') + '"></div><div class="scv-corte" style="left:' + (CORTE / TOTMAX * 100) + '%" title="corte 25"></div></div><div style="font-size:.8em;color:#c62828;text-align:right">linha vermelha: ponto de corte 25</div></div>';
        h += '<h3>&#128202; Subescalas</h3>';
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            var s = r.sub[k];
            h += '<div class="scv-box"><b style="color:' + SUB[k].cor + '">' + SUB[k].nome + '</b>: ' + s.soma + ' de ' + s.max + ' (corte &ge; ' + s.corte + ') &#8212; <b>' + (s.acima ? 'acima do corte' : 'abaixo do corte') + '</b>' +
                '<div class="scv-bar"><div style="width:' + Math.max(1, s.soma / s.max * 100) + '%;background:' + SUB[k].cor + '"></div><div class="scv-corte" style="left:' + (s.corte / s.max * 100) + '%"></div></div></div>';
        }
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="scv-tab"><thead><tr><th>#</th><th style="text-align:left">Item</th><th>Resposta</th><th>Pontos</th></tr></thead><tbody>';
        for (i = 0; i < 41; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].t) + '</td><td style="text-align:center">' + RESP[r.v[i]] + '</td><td style="text-align:center;font-weight:700">' + r.v[i] + '</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="scv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="scv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AC = '#e65100';
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
    function secao(c, t) { c.need(16); F(c.doc, AC); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AC); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#faf6f2'); D(doc, '#eadfd5'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function barraPDF(c, rotulo, valor, max, cor, corte) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        c.need(15);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5, hb = 5;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.5, 2.5, 'F');
        F(doc, cor); doc.roundedRect(x0, yb, Math.max(2, w * valor / max), hb, 2.5, 2.5, 'F');
        var cx = x0 + w * corte / max;
        D(doc, '#c62828'); doc.setLineWidth(0.7); doc.line(cx, yb - 1.2, cx, yb + hb + 1.2);
        T(doc, '#c62828'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); doc.text('corte ' + corte, cx, yb + hb + 3.8, {align: 'center'});
        c.y += 15;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AC); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#455a64'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('SCARED - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Transtornos Relacionados \u00e0 Ansiedade Infantil - autorrelato (41 itens)'), 105, 22, {align: 'center'});
        doc.text(pt('Birmaher et al. (1997) | vers\u00e3o brasileira: Isolan et al. (2011)'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AC); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AC); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO PACIENTE', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        var cb = r.acima ? ['#ffe0b2', '#fb8c00', '#bf5600'] : ['#eceff1', '#607d8b', '#37474f'];
        F(doc, cb[0]); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, cb[1]); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, cb[2]); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt('Soma ' + r.total + ' / 82'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.acima ? 'Acima do ponto de corte (25): vale investigar' : 'Abaixo do ponto de corte (25)'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'SOMA TOTAL');
        barraPDF(c, 'Total: ' + r.total + ' de 82', r.total, TOTMAX, r.acima ? '#fb8c00' : '#607d8b', CORTE);
        c.y += 2;
        secao(c, 'SUBESCALAS');
        ORDEM.forEach(function (k) {
            var s = r.sub[k];
            barraPDF(c, SUB[k].nome + ': ' + s.soma + ' de ' + s.max + ' - ' + (s.acima ? 'acima do corte' : 'abaixo do corte'), s.soma, s.max, SUB[k].cor, s.corte);
        });
        c.y += 2;

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
        F(doc, AC); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item', xT + cn + 2, c.y + 4.7);
        doc.text('Resposta (pontos)', xT + cn + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < 41; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tl = doc.splitTextToSize(pt(ITENS[i].t), ct - 3), rh = Math.max(5.4, tl.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#faf6f2'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tl, xT + cn + 2, c.y + 3.5);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(RESP[r.v[i]] + ' (' + r.v[i] + ')'), xT + cn + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
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
            doc.text('SYM Online | SCARED | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('SCARED_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'SCARED' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 41; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 2)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_SCARED = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        ITENS: ITENS, RESP: RESP, CORTE: CORTE, SUB: SUB, ORDEM: ORDEM};
})();
