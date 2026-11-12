// dislexia-visual.js - Desenho sob medida do Checklist de Dislexia (escala autoral SYM, 78 itens, resposta 0-10)
// (tela de resultados + PDF da escala e do Painel).
// ESCALA AUTORAL: elaborada pelo autor do site a partir de materiais publicos sobre sinais de risco para dislexia; sem validacao formal.
// CORRECAO DE PONTUACAO (11/11/2026): 44 itens tem frase POSITIVA (ex.: "Compreende as instrucoes?"). Neles "Sempre" (10) e sinal de
// BOM desempenho, entao a nota entra invertida (10 - resposta), como ja fazia o programa antigo em Python (que tinha 76 itens e outra
// numeracao). Sem isso, uma crianca sem dificuldades somava ~440 pontos (faixa "indicios significativos"). Os cortes (78/312/429/623)
// continuam os do autor e so fazem sentido com a inversao. Itens invertidos: 1, 4-16, 19, 20, 28, 29, 30, 34, 40, 45-56, 58, 59, 60,
// 62, 64, 66, 68, 69, 71, 76, 77 (conferidos pelo texto dos 78 itens do site; o Python nao tinha os itens 20 e 66).
// d.respostas guarda as respostas BRUTAS marcadas (0-10, chaves 1..78); registros sem d.pontuacaoInvertida foram salvos com a soma
// antiga (sem inversao): o PDF do Painel recalcula pelas respostas e avisa.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    var SECOES = [
        {nome: 'Linguagem oral', itens: [
            'Inicia e mant\u00e9m um di\u00e1logo?',
            'Apresenta troca de sons na fala?',
            'Apresenta vocabul\u00e1rio restrito para a idade?',
            'Compreende as instru\u00e7\u00f5es dadas pelo professor?',
            'Tem facilidade para dar nome a objetos e/ou pessoas?',
            'Identifica e produz rima nas palavras (por ex.: p\u00e3o rima com...)?',
            'Identifica e produz palavras que se iniciam com o mesmo som (Ex.: Casa come\u00e7a com o mesmo som que...)?',
            'Consegue expressar claramente seus pensamentos?',
            'Reconta uma hist\u00f3ria ou situa\u00e7\u00e3o de vida di\u00e1ria respeitando a sequ\u00eancia dos fatos?'
        ]},
        {nome: 'Habilidades preditoras da alfabetiza\u00e7\u00e3o', itens: [
            'Nomeia cores e formas geom\u00e9tricas simples?',
            'Tem no\u00e7\u00e3o espacial (em cima/embaixo, direita/esquerda)?',
            'Tem no\u00e7\u00e3o temporal (antes/depois, manh\u00e3/tarde/noite, ontem/amanh\u00e3)?',
            'Consegue dizer todos os dias da semana e os meses do ano?',
            'Diferencia letras de n\u00fameros?',
            'Nomeia todas as letras do alfabeto em ordem aleat\u00f3ria?',
            'Escreve seu nome completo corretamente?',
            'Demora para finalizar as atividades propostas pelo professor?',
            'Apresenta dificuldade para realizar atividades que envolvem escrita?',
            'Consegue soletrar palavras compostas por s\u00edlabas simples (Ex.: bola, caneta, telefone)?'
        ]},
        {nome: 'Leitura', itens: [
            'Consegue ler palavras compostas por s\u00edlabas simples sem dificuldade (Ex.: gato, comida, telefone)?',
            'Apresenta lentid\u00e3o na leitura de palavras?',
            'Apresenta lentid\u00e3o na leitura de frases?',
            'Apresenta dificuldade para associar letras ao som?',
            'Tenta adivinhar a palavra quando l\u00ea o in\u00edcio dela?',
            'Troca o som das letras p/b, t/d, f/v durante a leitura?',
            'Confunde letras/s\u00edlabas visualmente semelhantes (Ex.: m/n, a/e, u/n, p/q, em/me)?',
            'Omite letras ou palavras ao ler?',
            'Gosta de ler em voz alta na sala de aula?',
            'Compreende o texto ao fazer a leitura oral?',
            'Compreende o texto ao fazer leitura silenciosa?',
            '\u00c9 um dos \u00faltimos a terminar as tarefas que envolvem leitura?',
            'N\u00e3o consegue terminar as tarefas devido a dificuldades de leitura?'
        ]},
        {nome: 'Escrita', itens: [
            'Se recusa ou evita escrever?',
            '\u00c9 organizado no uso da folha (respeita linhas, usa margens)?',
            'Sua escrita \u00e9 incompleta, com muitas rasuras no papel?',
            'Apresenta dificuldade para copiar da lousa ou do livro?',
            'Apresenta escrita espelhada?',
            'Apresenta lentid\u00e3o para copiar e/ou escrever?',
            'Omite, adiciona ou substitui palavras inteiras ao copiar frases?',
            'Escreve corretamente palavras compostas por s\u00edlabas simples (Ex.: fogo, panela, canivete)?',
            'No ditado, confunde letras audivelmente similares (Ex.: p/b, t/d, f/v, c/g, s/z)?',
            'Na c\u00f3pia ou na escrita espont\u00e2nea, confunde letras visualmente semelhantes (Ex.: p/q, p/d, b/d, n/u, o/a, i/e)?',
            'Na c\u00f3pia ou na escrita espont\u00e2nea, confunde a sequ\u00eancia de s\u00edlabas nas palavras (Ex.: sapato - pasato)?',
            'Apresenta escrita com erros significativos quando comparado aos demais colegas de sala?'
        ]},
        {nome: 'Matem\u00e1tica', itens: [
            'Identifica semelhan\u00e7as e diferen\u00e7as em formas geom\u00e9tricas?',
            '\u00c9 capaz de fazer compara\u00e7\u00f5es envolvendo quantidade e tamanho (Ex.: mais/menos, maior/menor)?',
            'Conta oralmente at\u00e9 20 respeitando a sequ\u00eancia num\u00e9rica?',
            'Escreve e l\u00ea numerais na ordem de unidades?',
            'Faz correspond\u00eancia de n\u00famero \u00e0 quantidade (de 1 a 9)?',
            'Faz c\u00e1lculos de adi\u00e7\u00e3o e subtra\u00e7\u00e3o de unidades mentalmente?',
            'Escreve e l\u00ea numerais na ordem de dezenas?',
            'Compreende o conceito de antecessor e sucessor em dezenas?',
            'Resolve contas de dezenas sem reserva?',
            'Resolve contas de dezenas com reserva?',
            'Escreve e l\u00ea numerais na ordem de centenas?',
            'Resolve contas de centenas sem reserva?'
        ]},
        {nome: 'Aspectos motores', itens: [
            'N\u00e3o gosta ou evita desenhar?',
            'Respeita o limite da figura ao pintar?',
            'Apresenta coordena\u00e7\u00e3o motora global preservada (Ex.: pula, corre, agarra)?',
            'Apresenta coordena\u00e7\u00e3o motora fina preservada (Ex.: recorta, abotoa, amarra)?',
            'Apresenta dificuldades na preens\u00e3o do l\u00e1pis?',
            'Pressiona adequadamente (nem forte nem fraco) o l\u00e1pis no papel?',
            'As letras t\u00eam tamanho desproporcional (grandes ou pequenas)?',
            'A caligrafia \u00e9 leg\u00edvel (independente do tipo de letra utilizada)?',
            'Apresenta dificuldade para fazer o tra\u00e7ado da letra cursiva?'
        ]},
        {nome: 'Aspectos comportamentais e atencionais', itens: [
            'Aceita e segue regras?',
            'Distrai-se com facilidade?',
            'Interage com os colegas?',
            '\u00c9 organizado com a carteira e com os materiais?',
            'Esquece tarefas, letras de m\u00fasicas e/ou materiais escolares?',
            'Demonstra interesse pelas atividades propostas?',
            'Apresenta comportamento agitado durante a aula?',
            'Caminha pela sala durante as explica\u00e7\u00f5es?',
            'Apresenta dificuldade em manter a aten\u00e7\u00e3o durante as explica\u00e7\u00f5es?',
            'Solicita repeti\u00e7\u00e3o da instru\u00e7\u00e3o dada pelo professor?',
            'Compreende as instru\u00e7\u00f5es dadas pelo professor?',
            'Conclui as atividades iniciadas?',
            'Frequentemente termina as atividades com atraso?'
        ]}
    ];
    var CORES = ['#00897b', '#43a047', '#1e88e5', '#7b1fa2', '#f9a825', '#6d4c41', '#455a64'];
    var INV = {};
    [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 28, 29, 30, 34, 40, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 58, 59, 60, 62, 64, 66, 68, 69, 71, 76, 77]
        .forEach(function (n) { INV[n] = true; });
    var ITENS = [];
    SECOES.forEach(function (s, si) { s.itens.forEach(function (t) { ITENS.push({n: ITENS.length + 1, t: t, sec: si, inv: !!INV[ITENS.length + 1]}); }); });
    var TOTMAX = 780;
    var FAIXAS = [
        {ate: 78, de: 0, rot: '0 a 78', txt: 'Resultado negativo para dislexia.', fundo: '#eceff1', borda: '#607d8b', cor: '#37474f'},
        {ate: 312, de: 79, rot: '79 a 312', txt: 'Resultado improv\u00e1vel para dislexia, mas deve-se estar atento ao n\u00edvel de aprendizagem da crian\u00e7a.', fundo: '#e3f2fd', borda: '#1e88e5', cor: '#0d47a1'},
        {ate: 429, de: 313, rot: '313 a 429', txt: 'Resultados indicadores de dislexia, cabendo avaliar se cansa\u00e7o, press\u00e3o ou estresse influenciaram o desempenho.', fundo: '#fff8e1', borda: '#f9a825', cor: '#8a5a00'},
        {ate: 623, de: 430, rot: '430 a 623', txt: 'Ind\u00edcios significativos para dislexia.', fundo: '#ffe0b2', borda: '#fb8c00', cor: '#bf5600'},
        {ate: 780, de: 624, rot: '624 ou mais', txt: 'Altamente prov\u00e1vel que o avaliando tenha dislexia.', fundo: '#ffccbc', borda: '#e64a19', cor: '#9c2c0c'}
    ];
    var REFS = [
        'SYM Online. Checklist de Dislexia: escala autoral (78 itens, resposta de 0 a 10) para observa\u00e7\u00e3o de sinais de risco, elaborada a partir de materiais p\u00fablicos sobre identifica\u00e7\u00e3o de dislexia. Sem valida\u00e7\u00e3o formal; cortes definidos pelo autor.',
        'TELES, P. Dislexia: como identificar? Como intervir? Revista Portuguesa de Cl\u00ednica Geral, Lisboa, v. 20, 2004. (N\u00famero e p\u00e1ginas n\u00e3o reconfirmados.)',
        'MELO, D. G. S. et al. Avalia\u00e7\u00e3o e reabilita\u00e7\u00e3o neuropsicol\u00f3gica em crian\u00e7as com dislexia, disgrafia e discalculia. Psicologia.pt, 2019. ISSN 1646-6977. (Documento online; dados de origem conforme o arquivo, n\u00e3o reconfirmados.)',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022. (Transtorno Espec\u00edfico da Aprendizagem, com preju\u00edzo na leitura.)'
    ];
    var AVISO = 'Este checklist \u00e9 uma escala autoral de observa\u00e7\u00e3o de sinais de risco para dificuldades de leitura e escrita; n\u00e3o \u00e9 um teste validado nem diagn\u00f3stico. Os pontos de corte (78, 312, 429 e 623) foram definidos pelo autor e n\u00e3o t\u00eam normas por idade, ano escolar ou sexo. Os 44 itens escritos de forma positiva t\u00eam a nota invertida (10 menos a resposta), de modo que pontua\u00e7\u00e3o maior sempre indica mais sinais de risco. O diagn\u00f3stico de dislexia (Transtorno Espec\u00edfico da Aprendizagem, DSM-5-TR) exige avalia\u00e7\u00e3o cl\u00ednica e neuropsicol\u00f3gica completa, com hist\u00f3ria do desenvolvimento, desempenho escolar e exclus\u00e3o de outras causas (vis\u00e3o, audi\u00e7\u00e3o, ensino inadequado, aten\u00e7\u00e3o, intelig\u00eancia). Os resultados devem ser interpretados por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f0(v) { return String(Math.round(v)); }

    // ===================== CALCULO =====================
    // raw: 78 respostas brutas 0-10
    function calcular(raw, extra) {
        if (!raw || raw.length !== 78) throw new Error('Dislexia: respostas incompletas');
        var r = {raw: [], pts: [], total: 0, areas: [], extra: extra || {}}, i;
        for (i = 0; i < 78; i++) {
            var x = parseInt(raw[i], 10);
            if (!(x >= 0 && x <= 10)) throw new Error('Dislexia: resposta invalida no item ' + (i + 1));
            var p = ITENS[i].inv ? 10 - x : x;
            r.raw.push(x); r.pts.push(p); r.total += p;
        }
        SECOES.forEach(function (s, si) {
            var soma = 0, n = 0;
            ITENS.forEach(function (it, ix) { if (it.sec === si) { soma += r.pts[ix]; n++; } });
            r.areas.push({nome: s.nome, soma: soma, max: n * 10, n: n, pct: soma / (n * 10) * 100});
        });
        var fx = 0;
        for (i = 0; i < FAIXAS.length; i++) { if (r.total <= FAIXAS[i].ate) { fx = i; break; } }
        r.faixa = fx;
        return r;
    }
    function classifGeral(r) { return FAIXAS[r.faixa].txt; }
    function dadosPainel(r) {
        var o = {Total: {pontuacao: r.total, max: TOTMAX, classificacao: FAIXAS[r.faixa].txt}};
        r.areas.forEach(function (a) { o[a.nome] = {pontuacao: a.soma, max: a.max, classificacao: f0(a.pct) + '% do m\u00e1ximo'}; });
        return o;
    }
    function analise(r) {
        var out = [], ord = r.areas.slice().sort(function (a, b) { return b.pct - a.pct; });
        out.push({t: 'Resultado', x: 'Pontua\u00e7\u00e3o total ' + r.total + ' de ' + TOTMAX + ' (faixa ' + FAIXAS[r.faixa].rot + '): ' + FAIXAS[r.faixa].txt});
        out.push({t: '\u00c1reas com maior propor\u00e7\u00e3o do m\u00e1ximo', x: ord.slice(0, 3).map(function (a) { return a.nome + ' (' + f0(a.pct) + '%)'; }).join('; ') + '. Os percentuais descrevem onde o observador marcou mais sinais de risco; n\u00e3o h\u00e1 normas por \u00e1rea.'});
        out.push({t: 'Como a pontua\u00e7\u00e3o \u00e9 calculada', x: 'Cada item vale de 0 (Nunca) a 10 (Sempre). Nos 44 itens escritos de forma positiva (por exemplo, "Compreende as instru\u00e7\u00f5es dadas pelo professor?"), a nota \u00e9 invertida (10 menos a resposta). Assim, quanto maior a pontua\u00e7\u00e3o, mais sinais de risco.'});
        if (r.extra.antigo) {
            out.push({t: 'Aten\u00e7\u00e3o: registro anterior \u00e0 corre\u00e7\u00e3o', x: 'Este resultado foi enviado antes da corre\u00e7\u00e3o da pontua\u00e7\u00e3o. O sistema recalculou a nota a partir das respostas marcadas, com a invers\u00e3o dos itens positivos. A pontua\u00e7\u00e3o que aparece na lista do painel pode ser a antiga e diferir deste relat\u00f3rio.'});
        }
        return out;
    }

    // ===================== TELA (HTML) =====================
    var VERDE = '#2e7d32';
    var CSS = '' +
        '.dxv h2{color:' + VERDE + ';margin-bottom:16px;text-align:center}' +
        '.dxv h3{color:' + VERDE + ';margin:26px 0 10px;font-size:1.12em}' +
        '.dxv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.dxv-res b{font-size:1.5em;display:block}' +
        '.dxv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.dxv-bar{position:relative;height:22px;background:#e0e0e0;border-radius:11px;margin:6px 0 2px}' +
        '.dxv-bar>div{height:22px;border-radius:11px}' +
        '.dxv-faixas{display:flex;height:22px;border-radius:11px;overflow:hidden;margin:8px 0 4px;position:relative}' +
        '.dxv-faixas>div{height:22px}' +
        '.dxv-pino{position:absolute;top:-5px;width:4px;height:32px;background:#000;border-radius:2px}' +
        '.dxv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.dxv-tab th{background:' + VERDE + ';color:#fff;padding:7px 4px}.dxv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.dxv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('dxv-css')) return;
        var st = document.createElement('style'); st.id = 'dxv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, fx = FAIXAS[r.faixa], h = '<div class="dxv"><h2>&#128203; Resultados &#8212; Checklist de Dislexia</h2>';
        h += '<div class="dxv-res" style="background:' + fx.fundo + ';border-color:' + fx.borda + ';color:' + fx.cor + '"><b>' + r.total + ' / ' + TOTMAX + ' pontos</b>' + esc(fx.txt) + '</div>';
        h += '<div class="dxv-box"><b>Faixas de pontua\u00e7\u00e3o</b><div class="dxv-faixas">';
        var ant = 0;
        for (i = 0; i < FAIXAS.length; i++) { h += '<div style="width:' + ((FAIXAS[i].ate - ant) / TOTMAX * 100) + '%;background:' + FAIXAS[i].borda + ';opacity:' + (i === r.faixa ? 1 : 0.35) + '"></div>'; ant = FAIXAS[i].ate; }
        h += '<div class="dxv-pino" style="left:calc(' + Math.min(99.5, r.total / TOTMAX * 100) + '% - 2px)"></div></div>';
        h += '<div style="font-size:.8em;color:#555;line-height:1.7">';
        for (i = 0; i < FAIXAS.length; i++) h += '<span style="display:inline-block;margin-right:12px"><span style="display:inline-block;width:10px;height:10px;background:' + FAIXAS[i].borda + ';border-radius:2px"></span> ' + FAIXAS[i].rot + (i === r.faixa ? ' <b>(aqui)</b>' : '') + '</span>';
        h += '</div></div>';
        h += '<h3>&#128202; Por \u00e1rea (percentual do m\u00e1ximo)</h3><div class="dxv-box">';
        for (i = 0; i < r.areas.length; i++) {
            var a = r.areas[i];
            h += '<div style="margin:8px 0 12px"><b>' + esc(a.nome) + ':</b> ' + a.soma + ' de ' + a.max + ' (' + f0(a.pct) + '%)<div class="dxv-bar"><div style="width:' + Math.max(1, a.pct) + '%;background:' + CORES[i] + '"></div></div></div>';
        }
        h += '</div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="dxv-tab"><thead><tr><th>#</th><th style="text-align:left">Item</th><th>Resposta (0-10)</th><th>Pontos</th></tr></thead><tbody>';
        var secAtual = -1;
        for (i = 0; i < 78; i++) {
            if (ITENS[i].sec !== secAtual) { secAtual = ITENS[i].sec; h += '<tr><td colspan="4" style="background:#e8f5e9;font-weight:700;color:' + VERDE + '">' + esc(SECOES[secAtual].nome) + '</td></tr>'; }
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].t) + (ITENS[i].inv ? ' <span style="font-size:.75em;color:#6a1b9a;font-weight:700">(invertido)</span>' : '') + '</td><td style="text-align:center">' + r.raw[i] + '</td><td style="text-align:center;font-weight:700">' + r.pts[i] + '</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="dxv-box"><b>' + esc(an[i].t) + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="dxv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
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
    function secao(c, t) { c.need(16); F(c.doc, VERDE); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, VERDE); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f4f8f4'); D(doc, '#dce8dc'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, VERDE); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function barraPDF(c, rotulo, valor, max, cor) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        c.need(12);
        T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(rotulo), x0, c.y + 3.6);
        var yb = c.y + 5, hb = 5;
        F(doc, '#e0e0e0'); doc.roundedRect(x0, yb, w, hb, 2.5, 2.5, 'F');
        F(doc, cor); doc.roundedRect(x0, yb, Math.max(2, w * valor / max), hb, 2.5, 2.5, 'F');
        c.y += 12;
    }
    function faixasPDF(c, r) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4, yb = c.y + 3, hb = 6, ant = 0, i;
        c.need(24);
        for (i = 0; i < FAIXAS.length; i++) {
            var x = x0 + w * ant / TOTMAX, wf = w * (FAIXAS[i].ate - ant) / TOTMAX;
            F(doc, i === r.faixa ? FAIXAS[i].borda : '#e6e6e6'); doc.rect(x, yb, wf, hb, 'F');
            ant = FAIXAS[i].ate;
        }
        var px = x0 + w * Math.min(r.total, TOTMAX) / TOTMAX;
        D(doc, '#000000'); doc.setLineWidth(1.0); doc.line(px, yb - 1.8, px, yb + hb + 1.8);
        doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); T(doc, '#555555');
        ant = 0;
        for (i = 0; i < FAIXAS.length; i++) {
            var xc = x0 + w * ((ant + FAIXAS[i].ate) / 2) / TOTMAX;
            doc.text(pt(FAIXAS[i].rot), xc, yb + hb + 4.2, {align: 'center'});
            ant = FAIXAS[i].ate;
        }
        c.y += 21;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc), fx = FAIXAS[r.faixa];
        F(doc, VERDE); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('CHECKLIST DE DISLEXIA - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Identifica\u00e7\u00e3o precoce dos sinais de risco - 78 itens, resposta de 0 a 10'), 105, 22, {align: 'center'});
        doc.text(pt('Escala autoral SYM - sem valida\u00e7\u00e3o formal'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, VERDE); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, VERDE); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIADO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        doc.text(pt('Escola: ' + (info.escola || 'n\u00e3o informada') + '   |   Ano: ' + (info.ano || 'n\u00e3o informado')), 20, y + 22);
        c.y = 72;

        F(doc, fx.fundo); doc.rect(ML, c.y, CW, 18, 'F'); D(doc, fx.borda); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 18, 'S');
        T(doc, fx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.total + ' / ' + TOTMAX + ' pontos (faixa ' + fx.rot + ')'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(8.6); var tl = doc.splitTextToSize(pt(fx.txt), CW - 10); doc.text(tl, 105, c.y + 12.4, {align: 'center'});
        c.y += 24;

        secao(c, 'FAIXAS DE PONTUA\u00c7\u00c3O');
        faixasPDF(c, r);
        secao(c, 'PERCENTUAL DO M\u00c1XIMO POR \u00c1REA');
        r.areas.forEach(function (a, ai) { barraPDF(c, a.nome + ': ' + a.soma + ' de ' + a.max + ' (' + f0(a.pct) + '%)', a.soma, a.max, CORES[ai]); });
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
        var cn = 8, ct = 128, ca = 44, xT = ML, secAtual = -1;
        F(doc, VERDE); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item', xT + cn + 2, c.y + 4.7);
        doc.text('Resposta -> pontos', xT + cn + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < 78; i++) {
            if (ITENS[i].sec !== secAtual) {
                secAtual = ITENS[i].sec; c.need(14);
                F(doc, '#e8f5e9'); doc.rect(xT, c.y, CW, 5.6, 'F'); T(doc, VERDE); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6);
                doc.text(pt(SECOES[secAtual].nome.toUpperCase()), xT + 2, c.y + 4); c.y += 5.6;
            }
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tx = doc.splitTextToSize(pt(ITENS[i].t + (ITENS[i].inv ? ' (invertido)' : '')), ct - 3), rh = Math.max(5.4, tx.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#f4f8f4'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tx, xT + cn + 2, c.y + 3.5);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(pt(r.raw[i] + ' -> ' + r.pts[i] + ' pts'), xT + cn + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
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
            doc.text('SYM Online | Checklist de Dislexia | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('DISLEXIA_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'DISLEXIA' || !d.respostas) return false;
        var raw = [];
        for (var i = 1; i <= 78; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 10)) return false; raw.push(v); }
        var res;
        try { res = calcular(raw, {antigo: d.pontuacaoInvertida !== true}); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '', escola: d.escola || '', ano: d.ano || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_DISLEXIA = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        SECOES: SECOES, ITENS: ITENS, FAIXAS: FAIXAS};
})();
