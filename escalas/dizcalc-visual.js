// dizcalc-visual.js - Desenho sob medida do DIZCALC (Escala de Rastreio de Discalculia) - escala AUTORAL (Monte, 2026)
// (tela de resultados + PDF da escala e do Painel).
// Calculo mantido como o autor definiu: 30 itens (0-3), 6 dominios de 5 itens (0-15), total 0-90; faixas 0-15, 16-30, 31-50, 51-90.
// Mudancas (11/11/2026): a faixa mais alta nao diz mais "Encaminhar para avaliacao" (conduta); cores neutras (sem vermelho/verde);
// respondente e convivio agora chegam ao Painel (antes so o convivio) e ficam num bloco sempre visivel; dominios do painel no padrao
// {pontuacao, max, classificacao} (antes eram numeros soltos); aviso de escala autoral sem validacao formal.
// d.respostas: chaves 1..30, valores 0-3 (igual ao registro antigo). d.dominios: chaves SensoNumerico, MemoriaFatos, Procedimentos,
// Raciocinio, CognicaoEspacial, ImpactoEmocional (mantidas, por causa das colunas da coleta anonima).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

var ITENS=[
{texto:"Tem dificuldade para entender qual n\u00famero \u00e9 maior ou menor (ex: confunde se 8 \u00e9 maior que 6)",dom:"SN"},
{texto:"N\u00e3o consegue estimar quantidades sem contar (ex: quantas balas tem no pote?)",dom:"SN"},
{texto:"Precisa usar os dedos para fazer contas simples que crian\u00e7as da mesma idade j\u00e1 fazem de cabe\u00e7a",dom:"SN"},
{texto:"Tem dificuldade para entender o conceito de \u0027metade\u0027, \u0027dobro\u0027 ou \u0027um quarto\u0027",dom:"SN"},
{texto:"Confunde a ordem dos n\u00fameros (ex: acha que 21 vem depois de 29)",dom:"SN"},
{texto:"N\u00e3o consegue memorizar a tabuada, mesmo depois de muito treino",dom:"MF"},
{texto:"Precisa recontar do zero para resolver somas que j\u00e1 deveria saber de cor (ex: 3+4)",dom:"MF"},
{texto:"Esquece procedimentos matem\u00e1ticos que acabou de aprender (ex: aprende hoje, amanh\u00e3 n\u00e3o lembra)",dom:"MF"},
{texto:"Demora muito mais que os colegas para responder c\u00e1lculos b\u00e1sicos",dom:"MF"},
{texto:"Conta nos dedos para opera\u00e7\u00f5es que outras crian\u00e7as da mesma idade j\u00e1 automatizaram",dom:"MF"},
{texto:"Confunde os sinais das opera\u00e7\u00f5es (+ com \u00d7, - com \u00f7)",dom:"PC"},
{texto:"N\u00e3o entende o conceito de \u0027emprestar\u0027 ou \u0027carregar\u0027 (vai-um) nas opera\u00e7\u00f5es",dom:"PC"},
{texto:"Come\u00e7a a conta pelo lado errado (pela esquerda em vez da direita)",dom:"PC"},
{texto:"Pula etapas no meio da conta sem perceber",dom:"PC"},
{texto:"Alinha os n\u00fameros errado nas contas armadas (unidade com dezena)",dom:"PC"},
{texto:"N\u00e3o consegue identificar qual opera\u00e7\u00e3o usar em um problema de texto (ex: \u0027se tenho 5 e ganho 3...\u0027)",dom:"RM"},
{texto:"Tem muita dificuldade com problemas que envolvem mais de uma etapa",dom:"RM"},
{texto:"N\u00e3o percebe quando um resultado est\u00e1 absurdamente errado (ex: aceita que 3x4=72)",dom:"RM"},
{texto:"N\u00e3o consegue aplicar conceitos matem\u00e1ticos em situa\u00e7\u00f5es do dia a dia (troco, pre\u00e7o)",dom:"RM"},
{texto:"Decora f\u00f3rmulas mas n\u00e3o entende por que funcionam",dom:"RM"},
{texto:"Tem dificuldade para ler horas em rel\u00f3gio anal\u00f3gico (de ponteiros)",dom:"CE"},
{texto:"Confunde-se com dinheiro (n\u00e3o sabe se uma nota de 10 \u0027paga\u0027 algo de 7 reais)",dom:"CE"},
{texto:"Tem dificuldade com medidas (metros, quilos, litros) e suas rela\u00e7\u00f5es",dom:"CE"},
{texto:"Confunde direita/esquerda com frequ\u00eancia",dom:"CE"},
{texto:"N\u00e3o consegue interpretar gr\u00e1ficos ou tabelas simples",dom:"CE"},
{texto:"Evita atividades que envolvam n\u00fameros (jogos de tabuleiro, troco, receitas)",dom:"IE"},
{texto:"Fica visivelmente ansioso(a) ou frustrado(a) ao fazer tarefas de matem\u00e1tica",dom:"IE"},
{texto:"Diz que \u0027odeia matem\u00e1tica\u0027 ou que \u0027\u00e9 burro(a) para n\u00fameros\u0027",dom:"IE"},
{texto:"Chora ou se recusa a fazer li\u00e7\u00e3o de matem\u00e1tica",dom:"IE"},
{texto:"O desempenho em matem\u00e1tica \u00e9 muito inferior ao de leitura/escrita",dom:"IE"}
];

var OPCOES=[{valor:0,texto:"Nunca"},{valor:1,texto:"\u00c0s vezes"},{valor:2,texto:"Frequentemente"},{valor:3,texto:"Sempre"}];

var DOMINIOS_MAP={"SN":"Senso Num\u00e9rico","MF":"Mem\u00f3ria de Fatos","PC":"Procedimentos de C\u00e1lculo","RM":"Racioc\u00ednio Matem\u00e1tico","CE":"Cogni\u00e7\u00e3o Espacial-Temporal","IE":"Impacto Emocional"};

    var DOM_ORDEM = ['SN', 'MF', 'PC', 'RM', 'CE', 'IE'];
    var DOM_CHAVE = {SN: 'SensoNumerico', MF: 'MemoriaFatos', PC: 'Procedimentos', RM: 'Raciocinio', CE: 'CognicaoEspacial', IE: 'ImpactoEmocional'};
    var DOM_COR = {SN: '#e65100', MF: '#8d6e63', PC: '#1e88e5', RM: '#43a047', CE: '#7b1fa2', IE: '#455a64'};
    var RESP = ['Nunca', '\u00c0s vezes', 'Frequentemente', 'Sempre'];
    var FAIXAS = [
        {de: 0, ate: 15, nome: 'Baixo risco', rot: '0 a 15', fundo: '#eceff1', borda: '#607d8b', cor: '#37474f'},
        {de: 16, ate: 30, nome: 'Risco moderado - investigar', rot: '16 a 30', fundo: '#fff8e1', borda: '#f9a825', cor: '#8a5a00'},
        {de: 31, ate: 50, nome: 'Risco elevado - avalia\u00e7\u00e3o recomendada', rot: '31 a 50', fundo: '#ffe0b2', borda: '#fb8c00', cor: '#bf5600'},
        {de: 51, ate: 90, nome: 'Risco muito elevado', rot: '51 a 90', fundo: '#ffccbc', borda: '#e64a19', cor: '#9c2c0c'}
    ];
    var AC = '#e65100', TOTMAX = 90;
    var REFS = [
        'SILVA, P. A. da; SANTOS, F. H. dos. Discalculia do desenvolvimento: avalia\u00e7\u00e3o da representa\u00e7\u00e3o num\u00e9rica pela ZAREKI-R. Psicologia: Teoria e Pesquisa, v. 27, n. 2, p. 169-177, 2011.',
        'GEARY, D. C. Mathematics and learning disabilities. Journal of Learning Disabilities, v. 37, n. 1, p. 4-15, 2004.',
        'BUTTERWORTH, B. Developmental dyscalculia. In: CAMPBELL, J. I. D. (Ed.). Handbook of Mathematical Cognition. New York: Psychology Press, 2005. p. 455-467.',
        'DEHAENE, S. The Number Sense. New York: Oxford University Press, 1997.',
        'ASHCRAFT, M. H. Math anxiety: personal, educational, and cognitive consequences. Current Directions in Psychological Science, v. 11, n. 5, p. 181-185, 2002.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022. (Transtorno Espec\u00edfico da Aprendizagem, com preju\u00edzo na matem\u00e1tica.)',
        'MONTE, S. T. DIZCALC - Escala de Rastreio de Discalculia. 2026. (Escala autoral, constru\u00edda a partir de indicadores comportamentais da literatura; sem valida\u00e7\u00e3o emp\u00edrica formal.)'
    ];
    var AVISO = 'O DIZCALC \u00e9 uma escala autoral (Monte, 2026) de rastreio, baseada em indicadores comportamentais descritos na literatura; n\u00e3o possui valida\u00e7\u00e3o emp\u00edrica formal e n\u00e3o tem normas por idade, ano escolar ou sexo. As faixas (0-15, 16-30, 31-50 e 51-90) foram definidas pelo autor. Dificuldades em matem\u00e1tica t\u00eam muitas causas (ensino, aten\u00e7\u00e3o, ansiedade, linguagem, intelig\u00eancia, vis\u00e3o), e o diagn\u00f3stico de discalculia (Transtorno Espec\u00edfico da Aprendizagem, DSM-5-TR) exige avalia\u00e7\u00e3o neuropsicol\u00f3gica completa. O resultado indica necessidade de investiga\u00e7\u00e3o, e n\u00e3o diagn\u00f3stico. Deve ser interpretado por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    // ===================== CALCULO =====================
    function calcular(vals, extra) {
        if (!vals || vals.length !== ITENS.length) throw new Error('DIZCALC: respostas incompletas');
        var r = {v: [], dom: {}, total: 0, extra: extra || {}}, i;
        DOM_ORDEM.forEach(function (k) { r.dom[k] = {soma: 0, n: 0, max: 0}; });
        for (i = 0; i < ITENS.length; i++) {
            var x = parseInt(vals[i], 10);
            if (!(x >= 0 && x <= 3)) throw new Error('DIZCALC: resposta invalida no item ' + (i + 1));
            r.v.push(x); r.total += x;
            r.dom[ITENS[i].dom].soma += x; r.dom[ITENS[i].dom].n++; r.dom[ITENS[i].dom].max += 3;
        }
        DOM_ORDEM.forEach(function (k) { r.dom[k].pct = r.dom[k].soma / r.dom[k].max * 100; });
        r.faixa = 0;
        for (i = 0; i < FAIXAS.length; i++) { if (r.total <= FAIXAS[i].ate) { r.faixa = i; break; } }
        return r;
    }
    function classifGeral(r) { return FAIXAS[r.faixa].nome; }
    function dadosPainel(r) {
        var o = {};
        DOM_ORDEM.forEach(function (k) { o[DOM_CHAVE[k]] = {pontuacao: r.dom[k].soma, max: r.dom[k].max, classificacao: Math.round(r.dom[k].pct) + '% do m\u00e1ximo'}; });
        return o;
    }
    function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }
    function analise(r) {
        var out = [], ord = DOM_ORDEM.slice().sort(function (a, b) { return r.dom[b].pct - r.dom[a].pct; }), fx = FAIXAS[r.faixa];
        out.push({t: 'Resultado', x: 'Pontua\u00e7\u00e3o total ' + r.total + ' de 90, na faixa "' + fx.nome + '" (' + fx.rot + '). A faixa indica o quanto o relato merece investiga\u00e7\u00e3o; n\u00e3o \u00e9 diagn\u00f3stico.'});
        out.push({t: 'Dom\u00ednios com maior propor\u00e7\u00e3o do m\u00e1ximo', x: ord.slice(0, 3).map(function (k) { return DOMINIOS_MAP[k] + ' (' + Math.round(r.dom[k].pct) + '%)'; }).join('; ') + '. Os percentuais descrevem o relato de quem respondeu; n\u00e3o h\u00e1 normas por dom\u00ednio.'});
        if (r.dom.IE.pct >= 50 && r.dom.SN.pct < 40 && r.dom.MF.pct < 40) out.push({t: 'Impacto emocional', x: 'O dom\u00ednio Impacto Emocional (ansiedade, evita\u00e7\u00e3o) est\u00e1 alto, mas os dom\u00ednios de senso num\u00e9rico e mem\u00f3ria de fatos est\u00e3o baixos. Isso pode indicar ansiedade com a matem\u00e1tica sem dificuldade num\u00e9rica de base; vale investigar.'});
        out.push({t: 'Quem respondeu', x: (r.extra.respondente ? r.extra.respondente : 'Respondente n\u00e3o informado') + (r.extra.convivio ? ' - conv\u00edvio: ' + r.extra.convivio : '') + '. Compare com o relato da escola e com o desempenho em provas de matem\u00e1tica.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.dzv h2{color:' + AC + ';margin-bottom:16px;text-align:center}' +
        '.dzv h3{color:' + AC + ';margin:26px 0 10px;font-size:1.12em}' +
        '.dzv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.dzv-res b{font-size:1.5em;display:block}' +
        '.dzv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.dzv-bar{height:20px;background:#e0e0e0;border-radius:10px;margin:6px 0 2px}.dzv-bar>div{height:20px;border-radius:10px}' +
        '.dzv-faixas{display:flex;height:22px;border-radius:11px;overflow:hidden;margin:8px 0 4px;position:relative}.dzv-faixas>div{height:22px}' +
        '.dzv-pino{position:absolute;top:-5px;width:4px;height:32px;background:#000;border-radius:2px}' +
        '.dzv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.dzv-tab th{background:' + AC + ';color:#fff;padding:7px 4px}.dzv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.dzv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('dzv-css')) return;
        var st = document.createElement('style'); st.id = 'dzv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, fx = FAIXAS[r.faixa], h = '<div class="dzv"><h2>&#128203; Resultados &#8212; DIZCALC</h2>';
        h += '<div class="dzv-res" style="background:' + fx.fundo + ';border-color:' + fx.borda + ';color:' + fx.cor + '"><b>' + r.total + ' / 90 pontos</b>' + esc(fx.nome) + '</div>';
        h += '<div class="dzv-box"><b>Faixas de pontua\u00e7\u00e3o</b><div class="dzv-faixas">';
        for (i = 0; i < FAIXAS.length; i++) h += '<div style="width:' + ((FAIXAS[i].ate - FAIXAS[i].de + 1) / 91 * 100) + '%;background:' + FAIXAS[i].borda + ';opacity:' + (i === r.faixa ? 1 : 0.35) + '"></div>';
        h += '<div class="dzv-pino" style="left:calc(' + Math.min(99.5, (r.total + 0.5) / 91 * 100) + '% - 2px)"></div></div><div style="font-size:.8em;color:#555">';
        for (i = 0; i < FAIXAS.length; i++) h += '<span style="display:inline-block;margin-right:12px"><span style="display:inline-block;width:10px;height:10px;background:' + FAIXAS[i].borda + ';border-radius:2px"></span> ' + FAIXAS[i].rot + '</span>';
        h += '</div></div><h3>&#128202; Por dom\u00ednio (0 a 15)</h3><div class="dzv-box">';
        DOM_ORDEM.forEach(function (k) {
            var d = r.dom[k];
            h += '<div style="margin:8px 0 12px"><b>' + esc(DOMINIOS_MAP[k]) + ' (' + k + '):</b> ' + d.soma + ' de ' + d.max + ' (' + Math.round(d.pct) + '%)<div class="dzv-bar"><div style="width:' + Math.max(1, d.pct) + '%;background:' + DOM_COR[k] + '"></div></div></div>';
        });
        h += '</div><h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="dzv-tab"><thead><tr><th>#</th><th style="text-align:left">Item</th><th>Dom.</th><th>Resposta</th></tr></thead><tbody>';
        for (i = 0; i < ITENS.length; i++) {
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].texto) + '</td><td style="text-align:center">' + ITENS[i].dom + '</td><td style="text-align:center">' + RESP[r.v[i]] + ' (' + r.v[i] + ')</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="dzv-box"><b>' + esc(an[i].t) + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="dzv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
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
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#fbf6f2'); D(doc, '#efe3d9'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function barraPDF(c, rotulo, pct, cor) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        c.need(12);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5, hb = 5;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.5, 2.5, 'F');
        F(doc, cor); doc.roundedRect(x0, yb, Math.max(2, w * pct / 100), hb, 2.5, 2.5, 'F');
        c.y += 12;
    }
    function faixasPDF(c, r) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4, yb = c.y + 3, hb = 6, i;
        c.need(24);
        for (i = 0; i < FAIXAS.length; i++) { F(doc, i === r.faixa ? FAIXAS[i].borda : '#e6e6e6'); doc.rect(x0 + w * FAIXAS[i].de / 91, yb, w * (FAIXAS[i].ate - FAIXAS[i].de + 1) / 91, hb, 'F'); }
        var px = x0 + w * (r.total + 0.5) / 91;
        D(doc, '#000000'); doc.setLineWidth(1.0); doc.line(px, yb - 1.8, px, yb + hb + 1.8);
        doc.setFont(undefined, 'normal'); doc.setFontSize(6.8); T(doc, '#555555');
        for (i = 0; i < FAIXAS.length; i++) doc.text(pt(FAIXAS[i].rot), x0 + w * ((FAIXAS[i].de + FAIXAS[i].ate + 1) / 2) / 91, yb + hb + 4.2, {align: 'center'});
        c.y += 21;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc), fx = FAIXAS[r.faixa];
        F(doc, AC); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#455a64'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('DIZCALC - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Rastreio de Discalculia - 30 itens, 6 dom\u00ednios (7 a 14 anos)'), 105, 22, {align: 'center'});
        doc.text(pt('Monte (2026) - escala autoral, sem valida\u00e7\u00e3o formal'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AC); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AC); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIADO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Respondente: ' + (r.extra.respondente || 'n\u00e3o informado') + (r.extra.convivio ? '   |   Conv\u00edvio: ' + r.extra.convivio : '')), 20, y + 22);
        c.y = 72;
        F(doc, fx.fundo); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, fx.borda); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, fx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.total + ' / 90 pontos'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9.4); doc.text(pt(fx.nome + ' (faixa ' + fx.rot + ')'), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;
        secao(c, 'FAIXAS DE PONTUA\u00c7\u00c3O');
        faixasPDF(c, r);
        secao(c, 'PERCENTUAL DO M\u00c1XIMO POR DOM\u00cdNIO (0 A 15)');
        DOM_ORDEM.forEach(function (k) { var d = r.dom[k]; barraPDF(c, DOMINIOS_MAP[k] + ' (' + k + '): ' + d.soma + ' de ' + d.max + ' (' + Math.round(d.pct) + '%)', d.pct, DOM_COR[k]); });
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
        var cn = 8, ct = 124, cd = 12, ca = 36, xT = ML;
        F(doc, AC); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item', xT + cn + 2, c.y + 4.7); doc.text('Dom.', xT + cn + ct + cd / 2, c.y + 4.7, {align: 'center'}); doc.text('Resposta', xT + cn + ct + cd + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < ITENS.length; i++) {
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tx = doc.splitTextToSize(pt(ITENS[i].texto), ct - 3), rh = Math.max(5.4, tx.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#fbf6f2'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tx, xT + cn + 2, c.y + 3.5);
            doc.text(ITENS[i].dom, xT + cn + ct + cd / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(RESP[r.v[i]] + ' (' + r.v[i] + ')'), xT + cn + ct + cd + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
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
            doc.text('SYM Online | DIZCALC | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('DIZCALC_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'DIZCALC' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals, {respondente: d.respondente || '', convivio: d.convivio || ''}); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_DIZCALC = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        respostasObj: respostasObj, ITENS: ITENS, OPCOES: OPCOES, DOMINIOS_MAP: DOMINIOS_MAP, FAIXAS: FAIXAS};
})();
