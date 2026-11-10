// tdi-visual.js - Desenho sob medida da Escala TDI (tela de resultados + PDF da escala e do Painel).
// Instrumento AUTORAL do SYM (nao e uma escala publicada de terceiros): 35 itens SIM/NAO respondidos por cuidadores, 3 dominios do
// funcionamento adaptativo (conceitual, social e pratico), base teorica: DSM-5-TR (Transtorno do Desenvolvimento Intelectual).
// Itens com val=0 descrevem DIFICULDADE (SIM = dificuldade presente); itens com val=1 descrevem HABILIDADE (NAO = dificuldade presente).
// Resultado: percentual de itens com dificuldade, por dominio e no total. Faixas do total (criterio do instrumento, nao do DSM-5-TR):
// <=20% funcionamento adequado; <=40% leves; <=60% moderadas; <=80% significativas; >80% graves. As faixas descrevem o relato dos
// cuidadores e NAO equivalem aos niveis de gravidade do DSM-5-TR (leve/moderado/grave/profundo), definidos pelo funcionamento adaptativo.
// Respostas guardadas no painel (d.respostas): 1 = SIM, 0 = NAO (valores BRUTOS).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    // [texto, dominio, val]  (val 0 = item de dificuldade; val 1 = item de habilidade)
    var IT = [
        ['Tem dificuldades para entender conceitos abstratos, como o tempo (ex.: ontem, amanh\u00e3, mais tarde) ou express\u00f5es que n\u00e3o s\u00e3o literais (ex.: quando algu\u00e9m diz que algo "foi um sonho de ver\u00e3o", querendo dizer que uma coisa boa durou pouco).', 'conceitual', 0],
        ['\u00c9 capaz de compreender instru\u00e7\u00f5es com v\u00e1rias etapas sem dificuldade.', 'conceitual', 1],
        ['Tem dificuldade em lembrar informa\u00e7\u00f5es aprendidas recentemente.', 'conceitual', 0],
        ['Tem dificuldades com habilidades b\u00e1sicas de autossufici\u00eancia, como higiene pessoal.', 'pratico', 0],
        ['Consegue controlar suas emo\u00e7\u00f5es de forma adequada.', 'social', 1],
        ['Necessita de ajuda frequente para realizar tarefas di\u00e1rias.', 'pratico', 0],
        ['\u00c9 capaz de entender piadas e sarcasmo.', 'social', 1],
        ['Mostra uma falta de iniciativa para realizar tarefas por conta pr\u00f3pria.', 'social', 0],
        ['Sabe identificar sentimentos e emo\u00e7\u00f5es em outras pessoas.', 'social', 1],
        ['Tem dificuldades para entender e seguir regras sociais.', 'social', 0],
        ['Necessita de ajuda constante para atividades di\u00e1rias, como cozinhar.', 'pratico', 0],
        ['Consegue realizar c\u00e1lculos matem\u00e1ticos simples.', 'conceitual', 1],
        ['Demonstra habilidades b\u00e1sicas de planejamento (ex.: pensar antes no que precisa fazer primeiro, como separar a roupa antes de se arrumar para sair).', 'conceitual', 1],
        ['Apresenta dificuldades em fazer amigos.', 'social', 0],
        ['\u00c9 capaz de resolver conflitos de forma aut\u00f4noma (ex.: conseguir resolver sozinho uma briga ou um desentendimento, sem precisar que outra pessoa intervenha).', 'social', 1],
        ['Necessita de apoio para realizar atividades cotidianas como compras.', 'pratico', 0],
        ['Demonstra um vocabul\u00e1rio limitado para sua idade.', 'conceitual', 0],
        ['Tem dificuldades para entender conceitos financeiros simples, como dinheiro.', 'conceitual', 0],
        ['Sabe gerenciar seu tempo de forma produtiva (ex.: se organizar para n\u00e3o se atrasar e dividir o dia entre as tarefas e o descanso).', 'conceitual', 1],
        ['Tem dificuldade para seguir uma rotina.', 'conceitual', 0],
        ['Consegue fazer escolhas adequadas sem orienta\u00e7\u00e3o.', 'pratico', 1],
        ['\u00c9 capaz de cuidar de suas pr\u00f3prias necessidades b\u00e1sicas.', 'pratico', 1],
        ['Mostra baixa resist\u00eancia a frustra\u00e7\u00f5es.', 'pratico', 0],
        ['Consegue comunicar bem suas ideias e necessidades.', 'pratico', 1],
        ['Sabe administrar suas pr\u00f3prias finan\u00e7as de forma adequada.', 'pratico', 1],
        ['Se sente bem com as pessoas que conhece e conversa?', 'social', 1],
        ['Apresenta pouca capacidade para resolver problemas complexos.', 'conceitual', 0],
        ['Tem dificuldade em expressar emo\u00e7\u00f5es de maneira adequada (ex.: demonstrar raiva gritando ou batendo em vez de dizer que est\u00e1 bravo, ou n\u00e3o conseguir demonstrar carinho).', 'social', 0],
        ['Tem dificuldade para lidar com mudan\u00e7as na rotina.', 'pratico', 0],
        ['Necessita de supervis\u00e3o constante para tarefas simples.', 'pratico', 0],
        ['Mant\u00e9m o foco em uma tarefa at\u00e9 conclu\u00ed-la.', 'conceitual', 1],
        ['Apresenta dificuldade para realizar tarefas que envolvam planejamento.', 'conceitual', 0],
        ['Lida bem com situa\u00e7\u00f5es inesperadas e novas.', 'pratico', 1],
        ['Mostra pouca capacidade de reflex\u00e3o sobre suas a\u00e7\u00f5es.', 'pratico', 0],
        ['Demonstra boa compreens\u00e3o das normas sociais e culturais.', 'social', 1]
    ];
    var ITENS = IT.map(function (a, i) { return {n: i + 1, t: a[0], dom: a[1], val: a[2]}; });
    var DOM = {
        conceitual: {nome: 'Conceitual', curto: 'Conceitual', cor: '#1565c0'},
        social: {nome: 'Social', curto: 'Social', cor: '#2e7d32'},
        pratico: {nome: 'Pr\u00e1tico', curto: 'Pratico', cor: '#e65100'}
    };
    var ORDEM = ['conceitual', 'social', 'pratico'];
    // faixas (limite superior do percentual inteiro) - neutras, em tons de cinza-azulado
    var FAIXAS = [
        {ate: 20, dom: 'Adequado', tot: 'Funcionamento adequado', seg: '#b0bec5', bg: '#eceff1', fg: '#37474f'},
        {ate: 40, dom: 'Leve', tot: 'Dificuldades leves', seg: '#90a4ae', bg: '#e1e8ec', fg: '#37474f'},
        {ate: 60, dom: 'Moderado', tot: 'Dificuldades moderadas', seg: '#78909c', bg: '#d5dee3', fg: '#263238'},
        {ate: 80, dom: 'Significativo', tot: 'Dificuldades significativas', seg: '#546e7a', bg: '#c3d0d7', fg: '#263238'},
        {ate: 100, dom: 'Grave', tot: 'Dificuldades graves', seg: '#37474f', bg: '#b0bec5', fg: '#1b262c'}
    ];
    var REFS = [
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.',
        'SCHALOCK, R. L.; LUCKASSON, R.; TASS\u00c9, M. J. Intellectual Disability: Definition, Diagnosis, Classification, and Systems of Supports. 12th ed. Washington, DC: American Association on Intellectual and Developmental Disabilities, 2021.',
        'SYM. Escala TDI: instrumento de rastreio de dificuldades de funcionamento adaptativo (autoral), baseado nos dom\u00ednios conceitual, social e pr\u00e1tico do DSM-5-TR. 2026.'
    ];
    var DSM = 'Segundo o DSM-5-TR, o diagn\u00f3stico de Transtorno do Desenvolvimento Intelectual exige: (A) d\u00e9ficits em fun\u00e7\u00f5es intelectuais (racioc\u00ednio, solu\u00e7\u00e3o de problemas, planejamento, pensamento abstrato, ju\u00edzo, aprendizagem acad\u00eamica e aprendizagem pela experi\u00eancia), confirmados por avalia\u00e7\u00e3o cl\u00ednica e teste de intelig\u00eancia individualizado e padronizado; (B) d\u00e9ficits no funcionamento adaptativo, nos dom\u00ednios conceitual, social e pr\u00e1tico, que limitam a participa\u00e7\u00e3o e a independ\u00eancia; e (C) in\u00edcio durante o per\u00edodo do desenvolvimento. Este instrumento explora apenas o crit\u00e9rio B, por relato de cuidadores.';
    var AVISO = 'A Escala TDI \u00e9 um instrumento de rastreio de dificuldades de funcionamento adaptativo por relato de cuidadores; n\u00e3o \u00e9 diagn\u00f3stico. As faixas de percentual s\u00e3o crit\u00e9rio do instrumento e n\u00e3o equivalem aos n\u00edveis de gravidade do DSM-5-TR (leve, moderado, grave e profundo), que dependem da avalia\u00e7\u00e3o cl\u00ednica do funcionamento adaptativo. O diagn\u00f3stico exige avalia\u00e7\u00e3o cl\u00ednica abrangente, incluindo teste de intelig\u00eancia individualizado e medida padronizada de comportamento adaptativo, e a hist\u00f3ria do desenvolvimento. Os resultados devem ser interpretados por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function pctInt(x, n) { return parseInt(((x / n) * 100).toFixed(0), 10); }
    function faixaPct(p) { for (var i = 0; i < FAIXAS.length; i++) { if (p <= FAIXAS[i].ate) return i; } return FAIXAS.length - 1; }

    // ===================== CALCULO =====================
    // resp: 35 respostas (1 = SIM, 0 = NAO)
    function calcular(resp, respondente) {
        if (!resp || resp.length !== 35) throw new Error('TDI: respostas incompletas');
        var r = {resp: [], dif: [], d: {}, total: 0, respondente: respondente || ''}, i;
        ORDEM.forEach(function (k) { r.d[k] = {dif: 0, n: 0}; });
        for (i = 0; i < 35; i++) {
            var v = parseInt(resp[i], 10);
            if (!(v === 0 || v === 1)) throw new Error('TDI: resposta invalida no item ' + (i + 1));
            var tem = (ITENS[i].val === 0 && v === 1) || (ITENS[i].val === 1 && v === 0);
            r.resp.push(v); r.dif.push(tem);
            r.d[ITENS[i].dom].n++;
            if (tem) { r.d[ITENS[i].dom].dif++; r.total++; }
        }
        ORDEM.forEach(function (k) { r.d[k].pct = pctInt(r.d[k].dif, r.d[k].n); r.d[k].faixa = faixaPct(r.d[k].pct); });
        r.pct = pctInt(r.total, 35);
        r.faixa = faixaPct(r.pct);
        return r;
    }
    function classifGeral(r) { return FAIXAS[r.faixa].tot + ' (' + r.pct + '%)'; }
    function dadosPainel(r) {
        var o = {};
        ORDEM.forEach(function (k) { o[DOM[k].curto] = {pontuacao: r.d[k].dif, max: r.d[k].n, classificacao: FAIXAS[r.d[k].faixa].dom}; });
        return o;
    }
    function analise(r) {
        var out = [], i, k;
        out.push({t: 'Resultado geral', x: 'O relato indica dificuldade em ' + r.total + ' de 35 itens (' + r.pct + '%): ' + FAIXAS[r.faixa].tot.toLowerCase() + ' pelos crit\u00e9rios do instrumento.'});
        out.push({t: 'Por dom\u00ednio', x: ORDEM.map(function (kk) { return DOM[kk].nome + ': ' + r.d[kk].dif + ' de ' + r.d[kk].n + ' (' + r.d[kk].pct + '%, ' + FAIXAS[r.d[kk].faixa].dom.toLowerCase() + ')'; }).join('; ') + '.'});
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            var itens = [];
            ITENS.forEach(function (it, ix) { if (it.dom === k && r.dif[ix]) itens.push(ix + 1); });
            out.push({t: 'Itens com dificuldade - ' + DOM[k].nome, x: itens.length ? 'Itens ' + itens.join(', ') + '.' : 'Nenhum item com dificuldade neste dom\u00ednio.'});
        }
        out.push({t: 'Crit\u00e9rios do DSM-5-TR', x: DSM});
        out.push({t: 'Como interpretar', x: 'Compare o relato com o esperado para a idade e a cultura do avaliado, considere o contexto (apoios recebidos, oportunidades) e complemente com testes padronizados de intelig\u00eancia e de comportamento adaptativo e com a hist\u00f3ria do desenvolvimento.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.tdiv h2{color:#37474f;margin-bottom:16px;text-align:center}' +
        '.tdiv h3{color:#37474f;margin:26px 0 10px;font-size:1.12em}' +
        '.tdiv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.tdiv-res b{font-size:1.4em;display:block}' +
        '.tdiv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.tdiv-bar{display:flex;height:22px;border-radius:6px;overflow:hidden;position:relative;margin:4px 0 2px}' +
        '.tdiv-bar>div{height:22px}' +
        '.tdiv-mk{position:absolute;top:-3px;width:5px;height:28px;background:#b71c1c;border-radius:3px;margin-left:-2px}' +
        '.tdiv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.tdiv-tab th{background:#37474f;color:#fff;padding:7px 4px}.tdiv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.tdiv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('tdiv-css')) return;
        var st = document.createElement('style'); st.id = 'tdiv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function barraHtml(pct) {
        var h = '<div class="tdiv-bar">', i, de = 0;
        for (i = 0; i < FAIXAS.length; i++) {
            var largura = FAIXAS[i].ate - de + (i === 0 ? 1 : 0);
            h += '<div style="width:' + (largura / 101 * 100) + '%;background:' + FAIXAS[i].seg + ';opacity:.65;border-right:1px solid #fff"></div>';
            de = FAIXAS[i].ate;
        }
        return h + '<div class="tdiv-mk" style="left:' + ((pct + 0.5) / 101 * 100) + '%"></div></div>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, f = FAIXAS[r.faixa], h = '<div class="tdiv"><h2>&#128203; Resultados TDI</h2>';
        h += '<div class="tdiv-res" style="background:' + f.bg + ';border-color:' + f.seg + ';color:' + f.fg + '"><b>' + f.tot + ' \u2014 ' + r.pct + '% de dificuldades</b>' + r.total + ' de 35 itens com dificuldade relatada' + (r.respondente ? ' | Respondente: ' + esc(r.respondente) : '') + '</div>';
        h += '<h3>&#128202; Percentual de dificuldades</h3><div class="tdiv-box">';
        h += '<div style="margin:6px 0 12px"><b>Total: ' + r.total + ' de 35 (' + r.pct + '%)</b>' + barraHtml(r.pct) + '</div>';
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            h += '<div style="margin:10px 0 12px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"><b>' + DOM[k].nome + ': ' + r.d[k].dif + ' de ' + r.d[k].n + ' (' + r.d[k].pct + '%)</b><span>' + FAIXAS[r.d[k].faixa].dom + '</span></div>' + barraHtml(r.d[k].pct) + '</div>';
        }
        h += '<div style="font-size:.82em;color:#666">Faixas (percentual de itens com dificuldade): at\u00e9 20% adequado | 21-40% leve | 41-60% moderado | 61-80% significativo | acima de 80% grave. S\u00e3o crit\u00e9rio do instrumento, n\u00e3o do DSM-5-TR. O marcador vermelho mostra o resultado.</div></div>';
        h += '<h3>&#128203; Respostas por dom\u00ednio</h3>';
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i];
            h += '<div style="overflow-x:auto;margin-bottom:12px"><table class="tdiv-tab"><thead><tr><th colspan="4" style="text-align:left;background:' + DOM[k].cor + '">' + DOM[k].nome + '</th></tr><tr><th>#</th><th style="text-align:left">Afirma\u00e7\u00e3o</th><th>Resposta</th><th>Dificuldade</th></tr></thead><tbody>';
            ITENS.forEach(function (it, ix) {
                if (it.dom !== k) return;
                h += '<tr' + (r.dif[ix] ? ' style="background:#eceff1"' : '') + '><td style="text-align:center;font-weight:700">' + (ix + 1) + '</td><td>' + esc(it.t) + '</td><td style="text-align:center">' + (r.resp[ix] === 1 ? 'SIM' : 'N\u00c3O') + '</td><td style="text-align:center;font-weight:700">' + (r.dif[ix] ? 'sim' : '-') + '</td></tr>';
            });
            h += '</tbody></table></div>';
        }
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="tdiv-box"><b>' + an[i].t + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="tdiv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#37474f';
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
    function barraPDF(c, rotulo, pct, destaque) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4, i, de = 0;
        c.need(14);
        T(doc, '#222222'); doc.setFont(undefined, destaque ? 'bold' : 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5.2, hb = 5.4;
        for (i = 0; i < FAIXAS.length; i++) {
            var largura = (FAIXAS[i].ate - de + (i === 0 ? 1 : 0)) / 101 * w;
            var q = rgb(FAIXAS[i].seg); doc.setFillColor(Math.round(q[0] + (255 - q[0]) * 0.3), Math.round(q[1] + (255 - q[1]) * 0.3), Math.round(q[2] + (255 - q[2]) * 0.3));
            doc.rect(x0 + (de + (i === 0 ? 0 : 1)) / 101 * w, yb, largura, hb, 'F');
            de = FAIXAS[i].ate;
        }
        F(doc, '#b71c1c'); doc.rect(x0 + w * (Math.min(100, pct) + 0.5) / 101 - 0.7, yb - 1, 1.4, hb + 2, 'F');
        c.y += 13;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, f = FAIXAS[r.faixa], doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#78909c'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('TDI - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Avalia\u00e7\u00e3o de Transtorno do Desenvolvimento Intelectual (rastreio)'), 105, 22, {align: 'center'});
        doc.text(pt('Funcionamento adaptativo: conceitual, social e pr\u00e1tico | base: DSM-5-TR | instrumento autoral SYM'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Respondente: ' + (r.respondente || 'n\u00e3o informado')), 20, y + 22);
        c.y = 72;

        F(doc, f.bg); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, f.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, f.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(f.tot + ' - ' + r.pct + '% de dificuldades'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt(r.total + ' de 35 itens com dificuldade relatada'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'PERCENTUAL DE DIFICULDADES');
        barraPDF(c, 'Total: ' + r.total + ' de 35 (' + r.pct + '%)', r.pct, true);
        ORDEM.forEach(function (kk) { barraPDF(c, DOM[kk].nome + ': ' + r.d[kk].dif + ' de ' + r.d[kk].n + ' (' + r.d[kk].pct + '% - ' + FAIXAS[r.d[kk].faixa].dom.toLowerCase() + ')', r.d[kk].pct, false); });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2);
        doc.text(doc.splitTextToSize(pt('Faixas (percentual de itens com dificuldade): at\u00e9 20% adequado | 21-40% leve | 41-60% moderado | 61-80% significativo | acima de 80% grave. S\u00e3o crit\u00e9rio do instrumento, n\u00e3o do DSM-5-TR. O marcador vermelho mostra o resultado.'), CW - 4), ML + 2, c.y + 1);
        c.y += 12;

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

        for (k = 0; k < ORDEM.length; k++) {
            var kk = ORDEM[k];
            c.need(40);
            secao(c, 'RESPOSTAS - DOM\u00cdNIO ' + DOM[kk].nome.toUpperCase());
            var cn = 8, ct = 128, ca = 22, cd = 22, xT = ML;
            F(doc, DOM[kk].cor); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
            doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text(pt('Afirma\u00e7\u00e3o'), xT + cn + 2, c.y + 4.7);
            doc.text('Resposta', xT + cn + ct + ca / 2, c.y + 4.7, {align: 'center'}); doc.text('Dificuldade', xT + cn + ct + ca + cd / 2, c.y + 4.7, {align: 'center'});
            c.y += 7;
            var par = 0;
            for (i = 0; i < 35; i++) {
                if (ITENS[i].dom !== kk) continue;
                doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
                var tl = doc.splitTextToSize(pt(ITENS[i].t), ct - 3), rh = Math.max(5.6, tl.length * 3.3 + 2.6);
                c.need(rh);
                if (r.dif[i]) { F(doc, '#eceff1'); doc.rect(xT, c.y, CW, rh, 'F'); } else if (par % 2 === 0) { F(doc, '#f7f9fa'); doc.rect(xT, c.y, CW, rh, 'F'); }
                par++;
                T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
                T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tl, xT + cn + 2, c.y + 3.6);
                T(doc, '#000000'); doc.setFont(undefined, 'bold');
                doc.text(r.resp[i] === 1 ? 'SIM' : pt('N\u00c3O'), xT + cn + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
                doc.text(r.dif[i] ? 'sim' : '-', xT + cn + ct + ca + cd / 2, c.y + rh / 2 + 1, {align: 'center'});
                c.y += rh;
            }
            c.y += 5;
        }

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
            doc.text('SYM Online | TDI | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('TDI_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'TDI' || !d.respostas) return false;
        var resp = [];
        for (var i = 1; i <= 35; i++) { var v = parseInt(d.respostas[i], 10); if (!(v === 0 || v === 1)) return false; resp.push(v); }
        var res;
        try { res = calcular(resp, d.respondente); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_TDI = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, ITENS: ITENS};
})();
