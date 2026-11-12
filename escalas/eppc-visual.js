// eppc-visual.js - Desenho sob medida da EPPC (Escala de Pilares e Pontuacoes Conjugais) - escala AUTORAL (Monte, 2025)
// (tela de resultados + PDF da escala e do Painel).
// Calculo mantido como o autor definiu: 30 itens (1-4; itens temporais aceitam 0 = "Nao aconteceu" e saem da soma do pilar).
// Eixo 1: 4 pilares (Sexual 5 itens, Financeiro 6, Divertimento 5, Projeto Futuro 5); soma proporcional a 5 itens (media dos itens validos x 5),
// faixa 5-20: ate 9 Fragilizado, 10-14 Instavel, 15+ Solido. Total 20-80: ate 36 Corpo Fragilizado, 37-58 Corpo em Ajuste, 59+ Corpo Solido.
// Eixo 2: Ponto / Exclamacao / Interrogacao (3 itens cada, 3-12): ate 5 Discreto, 6-8 Moderado, 9+ Expressivo; estilo dominante = maior soma.
// Mudancas (11/11/2026): "IA" -> "analise automatica (por regras)"; textos prescritivos suavizados; empate de estilo/pilar aparece; cores neutras
// (sem vermelho/verde); rotulos da barra em pontos (antes eram percentuais); aviso de escala autoral sem validacao formal.
// d.respostas: chaves 1..30, valores 0-4 (igual ao registro antigo). d.dominios: chaves sexual/financeiro/divertimento/projetoFuturo/ponto/exclamacao/interrogacao.
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

var PILARES = {
'Sexual': {itens: [0,1,2,3,4], nome: 'Pilar Sexual'},
'Financeiro': {itens: [5,6,7,8,9,10], nome: 'Pilar Financeiro'},
'Divertimento': {itens: [11,12,13,14,15], nome: 'Pilar Divertimento'},
'ProjetoFuturo': {itens: [16,17,18,19,20], nome: 'Pilar Projeto Futuro'}
};

var PONTUACOES = {
'Ponto': {itens: [21,22,23], nome: 'Tend\u00eancia ao Ponto'},
'Exclamacao': {itens: [24,25,26], nome: 'Tend\u00eancia \u00e0 Exclama\u00e7\u00e3o'},
'Interrogacao': {itens: [27,28,29], nome: 'Tend\u00eancia \u00e0 Interroga\u00e7\u00e3o'}
};

var ITENS = [
{texto:"Na \u00faltima vez em que tivemos intimidade f\u00edsica, senti proximidade emocional genu\u00edna \u2014 n\u00e3o apenas rotina ou obriga\u00e7\u00e3o.", secao:'pilar', pilar:'Sexual', temporal:true},
{texto:"Consigo expressar meus desejos e limites sexuais com meu(minha) parceiro(a) sem medo de julgamento.", secao:'pilar', pilar:'Sexual'},
{texto:"A frequ\u00eancia da nossa vida sexual \u00e9 satisfat\u00f3ria para mim atualmente.", secao:'pilar', pilar:'Sexual'},
{texto:"Nas \u00faltimas semanas, iniciei ou correspondi a um gesto de desejo (verbal ou f\u00edsico) do(a) meu(minha) parceiro(a).", secao:'pilar', pilar:'Sexual', temporal:true},
{texto:"Quando h\u00e1 distanciamento sexual entre n\u00f3s, conseguimos conversar sobre isso sem conflito.", secao:'pilar', pilar:'Sexual'},
{texto:"Sei exatamente como meu(minha) parceiro(a) pensa sobre gastar e poupar dinheiro.", secao:'pilar', pilar:'Financeiro'},
{texto:"Concordamos, na pr\u00e1tica (n\u00e3o s\u00f3 na teoria), sobre como o dinheiro do casal deve ser administrado.", secao:'pilar', pilar:'Financeiro'},
{texto:"Decis\u00f5es financeiras importantes s\u00e3o tomadas em conjunto, n\u00e3o impostas por um dos dois.", secao:'pilar', pilar:'Financeiro'},
{texto:"Na \u00faltima vez que discordamos sobre uma despesa, conseguimos resolver sem que sobrasse m\u00e1goa.", secao:'pilar', pilar:'Financeiro', temporal:true},
{texto:"Na \u00faltima vez que conversamos sobre uma d\u00edvida ou gasto importante, a conversa n\u00e3o virou briga.", secao:'pilar', pilar:'Financeiro', temporal:true},
{texto:"Sinto seguran\u00e7a quanto ao futuro financeiro do nosso casal.", secao:'pilar', pilar:'Financeiro'},
{texto:"Reservamos tempo de qualidade s\u00f3 para n\u00f3s, sem filhos, trabalho ou terceiros.", secao:'pilar', pilar:'Divertimento'},
{texto:"Nos \u00faltimos 30 dias, fizemos pelo menos uma atividade nova ou diferente da nossa rotina, s\u00f3 os dois.", secao:'pilar', pilar:'Divertimento', temporal:true},
{texto:"Rimos juntos com frequ\u00eancia no nosso dia a dia.", secao:'pilar', pilar:'Divertimento'},
{texto:"Sinto que meu(minha) parceiro(a) \u00e9 tamb\u00e9m meu(minha) parceiro(a) de divers\u00e3o, n\u00e3o s\u00f3 de responsabilidades.", secao:'pilar', pilar:'Divertimento'},
{texto:"Temos interesses ou atividades compartilhadas que nutrem nossa conex\u00e3o.", secao:'pilar', pilar:'Divertimento'},
{texto:"Temos uma vis\u00e3o compartilhada de para onde nossa rela\u00e7\u00e3o est\u00e1 indo.", secao:'pilar', pilar:'ProjetoFuturo'},
{texto:"Nos \u00faltimos 3 meses, conversamos sobre pelo menos um plano de longo prazo (filhos, moradia, carreira ou aposentadoria) de forma tranquila, sem evitar o assunto.", secao:'pilar', pilar:'ProjetoFuturo', temporal:true},
{texto:"Na \u00faltima vez que conversamos sobre planos de longo prazo (filhos, casa, aposentadoria, mudan\u00e7a), meu(minha) parceiro(a) participou ativamente da decis\u00e3o, n\u00e3o apenas concordou ou evitou o assunto.", secao:'pilar', pilar:'ProjetoFuturo', temporal:true},
{texto:"Quando surgem diverg\u00eancias sobre o futuro, conseguimos negociar um caminho comum.", secao:'pilar', pilar:'ProjetoFuturo'},
{texto:"Consigo citar uma decis\u00e3o importante dos \u00faltimos 6 meses em que abrimos m\u00e3o de algo que um de n\u00f3s queria, em favor do que fazia sentido pro casal.", secao:'pilar', pilar:'ProjetoFuturo', temporal:true},
{texto:"Quando discordamos, tendo a encerrar o assunto com uma posi\u00e7\u00e3o fixa, sem muito espa\u00e7o para negocia\u00e7\u00e3o.", secao:'pontuacao', tipo:'Ponto'},
{texto:"Prefiro afirmar o que penso de forma direta, mesmo que isso feche a conversa.", secao:'pontuacao', tipo:'Ponto'},
{texto:"Meu(minha) parceiro(a) costuma sentir que \u0022n\u00e3o h\u00e1 mais o que discutir\u0022 depois que eu falo.", secao:'pontuacao', tipo:'Ponto'},
{texto:"Quando algo me incomoda, expresso isso com intensidade emocional (tom mais alto, urg\u00eancia).", secao:'pontuacao', tipo:'Exclamacao'},
{texto:"Costumo demonstrar entusiasmo e efusividade quando algo bom acontece entre n\u00f3s.", secao:'pontuacao', tipo:'Exclamacao'},
{texto:"Em momentos de tens\u00e3o, minha comunica\u00e7\u00e3o tende a pressionar ou exigir uma resposta r\u00e1pida.", secao:'pontuacao', tipo:'Exclamacao'},
{texto:"Quando discordamos, costumo fazer perguntas para entender o ponto de vista do outro antes de concluir.", secao:'pontuacao', tipo:'Interrogacao'},
{texto:"Prefiro perguntar \u0022como voc\u00ea est\u00e1 vendo isso?\u0022 a afirmar minha posi\u00e7\u00e3o de imediato.", secao:'pontuacao', tipo:'Interrogacao'},
{texto:"Sinto que minhas perguntas ao(a) meu(minha) parceiro(a) abrem espa\u00e7o para di\u00e1logo, n\u00e3o s\u00e3o ret\u00f3ricas ou acusat\u00f3rias.", secao:'pontuacao', tipo:'Interrogacao'}
];

    var OPC = ['N\u00e3o aconteceu', 'Discordo totalmente', 'Discordo em parte', 'Concordo em parte', 'Concordo totalmente'];
    var PIL_ORDEM = ['Sexual', 'Financeiro', 'Divertimento', 'ProjetoFuturo'];
    var PIL_NOME = {Sexual: 'Pilar Sexual', Financeiro: 'Pilar Financeiro', Divertimento: 'Pilar Divertimento', ProjetoFuturo: 'Pilar Projeto Futuro'};
    var PIL_CHAVE = {Sexual: 'sexual', Financeiro: 'financeiro', Divertimento: 'divertimento', ProjetoFuturo: 'projetoFuturo'};
    var PON_ORDEM = ['Ponto', 'Exclamacao', 'Interrogacao'];
    var PON_NOME = {Ponto: 'Ponto (.) - Fechamento', Exclamacao: 'Exclama\u00e7\u00e3o (!) - Intensidade', Interrogacao: 'Interroga\u00e7\u00e3o (?) - Abertura'};
    var PON_CURTO = {Ponto: 'Ponto', Exclamacao: 'Exclama\u00e7\u00e3o', Interrogacao: 'Interroga\u00e7\u00e3o'};
    var PON_CHAVE = {Ponto: 'ponto', Exclamacao: 'exclamacao', Interrogacao: 'interrogacao'};
    var COR_PIL = {'Fragilizado': '#ef6c00', 'Inst\u00e1vel': '#f9a825', 'S\u00f3lido': '#00897b'};
    var COR_PON = {'Discreto': '#90a4ae', 'Moderado': '#7b1fa2', 'Expressivo': '#4a148c'};
    var CORPOS = [
        {nome: 'Corpo Fragilizado', desc: 'M\u00faltiplos pilares em risco', fundo: '#fff3e0', borda: '#ef6c00', cor: '#a64600', de: 20, ate: 36, rot: '20 a 36'},
        {nome: 'Corpo em Ajuste', desc: 'Equil\u00edbrio parcial', fundo: '#fff8e1', borda: '#f9a825', cor: '#8a5a00', de: 37, ate: 58, rot: '37 a 58'},
        {nome: 'Corpo S\u00f3lido', desc: 'Estrutura bem sustentada', fundo: '#e0f2f1', borda: '#00897b', cor: '#00574b', de: 59, ate: 80, rot: '59 a 80'}
    ];
    var AC = '#880e4f', TOTMAX = 80;
    var REFS = [
        'MONTE, S. T. Pilares e Pontua\u00e7\u00f5es: A Comunica\u00e7\u00e3o como Fundamento nas Rela\u00e7\u00f5es Afetivas Contempor\u00e2neas. 2025. (Artigo te\u00f3rico do autor - framework cl\u00ednico; base desta escala autoral.)',
        'YOUNG, J. E.; KLOSKO, J. S.; WEISHAAR, M. E. Terapia do Esquema: guia de t\u00e9cnicas cognitivo-comportamentais inovadoras. Porto Alegre: Artmed, 2008.',
        'PERLS, F.; HEFFERLINE, R.; GOODMAN, P. Gestalt-terapia. S\u00e3o Paulo: Summus, 1997.'
    ];
    var AVISO = 'A EPPC \u00e9 uma escala de constru\u00e7\u00e3o pr\u00f3pria do autor (Monte, 2025), sem valida\u00e7\u00e3o psicom\u00e9trica formal, usada como ferramenta de conversa em sess\u00e3o cl\u00ednica; n\u00e3o diagnostica a rela\u00e7\u00e3o nem substitui avalia\u00e7\u00e3o profissional. As faixas dos pilares (at\u00e9 9, 10 a 14 e 15 a 20), do corpo (at\u00e9 36, 37 a 58 e 59 a 80) e dos estilos (at\u00e9 5, 6 a 8 e 9 a 12) foram definidas pelo autor. Uso sugerido: aplicar a cada parceiro, individualmente, e comparar os perfis lado a lado. O texto da an\u00e1lise \u00e9 gerado por regras fixas (n\u00e3o por intelig\u00eancia artificial) e deve ser revisado pelo profissional.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function f2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }

    function classPilar(soma) { return soma <= 9 ? 'Fragilizado' : (soma <= 14 ? 'Inst\u00e1vel' : 'S\u00f3lido'); }
    function classPont(soma) { return soma <= 5 ? 'Discreto' : (soma <= 8 ? 'Moderado' : 'Expressivo'); }
    function idxCorpo(total) { return total <= 36 ? 0 : (total <= 58 ? 1 : 2); }

    // ===================== CALCULO =====================
    // resp: 30 valores; itens temporais aceitam 0 ("Nao aconteceu"), os demais 1-4
    function calcular(resp) {
        if (!resp || resp.length !== ITENS.length) throw new Error('EPPC: respostas incompletas');
        var r = {v: [], pil: {}, pon: {}, total: 0, naoAconteceu: 0}, i, k;
        for (i = 0; i < ITENS.length; i++) {
            var x = parseInt(resp[i], 10), min = ITENS[i].temporal ? 0 : 1;
            if (!(x >= min && x <= 4)) throw new Error('EPPC: resposta invalida no item ' + (i + 1));
            r.v.push(x);
            if (x === 0) r.naoAconteceu++;
        }
        PIL_ORDEM.forEach(function (key) {
            var soma = 0, validos = 0, itens = PILARES[key].itens;
            itens.forEach(function (ix) { if (r.v[ix] > 0) { soma += r.v[ix]; validos++; } });
            var prop = validos > 0 ? Math.round((soma / validos) * 5) : 0;
            r.pil[key] = {soma: prop, somaReal: soma, validos: validos, n: itens.length, cls: classPilar(prop), pct: Math.round(prop / 20 * 100)};
            r.total += prop;
        });
        var maior = -1;
        PON_ORDEM.forEach(function (key) {
            var soma = 0;
            PONTUACOES[key].itens.forEach(function (ix) { soma += r.v[ix]; });
            r.pon[key] = {soma: soma, media: parseFloat((soma / 3).toFixed(2)), cls: classPont(soma), pct: Math.round(soma / 12 * 100)};
            if (soma > maior) maior = soma;
        });
        r.dominante = null; r.empateDom = [];
        PON_ORDEM.forEach(function (key) { if (r.pon[key].soma === maior) { r.empateDom.push(key); if (!r.dominante) r.dominante = key; } });
        var menor = 99; r.fracos = [];
        PIL_ORDEM.forEach(function (key) { if (r.pil[key].soma < menor) menor = r.pil[key].soma; });
        PIL_ORDEM.forEach(function (key) { if (r.pil[key].soma === menor) r.fracos.push(key); });
        r.corpo = idxCorpo(r.total);
        return r;
    }
    function classifGeral(r) { return CORPOS[r.corpo].nome; }
    function dadosPainel(r) {
        var o = {};
        PIL_ORDEM.forEach(function (k) { o[PIL_CHAVE[k]] = {pontuacao: r.pil[k].soma, max: 20, classificacao: r.pil[k].cls}; });
        PON_ORDEM.forEach(function (k) { o[PON_CHAVE[k]] = {pontuacao: r.pon[k].soma, max: 12, media: r.pon[k].media, classificacao: r.pon[k].cls}; });
        return o;
    }
    function respostasObj(r) { var o = {}, i; for (i = 0; i < r.v.length; i++) o[i + 1] = r.v[i]; return o; }

    var TXT_PILAR = {
        Sexual: 'A intimidade f\u00edsica e a conex\u00e3o sexual est\u00e3o fragilizadas. Pode haver dificuldade em expressar desejos, insatisfa\u00e7\u00e3o com a frequ\u00eancia ou dist\u00e2ncia emocional na sexualidade. Segundo o framework do autor, este pilar costuma refletir o estado dos demais.',
        Financeiro: 'Quest\u00f5es de dinheiro geram tens\u00e3o no casal. Pode haver falta de acordo, ressentimentos sobre gastos ou aus\u00eancia de planejamento financeiro conjunto.',
        Divertimento: 'O casal parece funcionar mais como s\u00f3cios de responsabilidades do que como parceiros de vida. Faltam momentos de leveza, riso e prazer compartilhado.',
        ProjetoFuturo: 'H\u00e1 incerteza sobre a dire\u00e7\u00e3o do relacionamento. Pode haver falta de conversa sobre planos, diverg\u00eancias n\u00e3o negociadas ou sensa\u00e7\u00e3o de que cada um caminha para um lado.'
    };
    var TXT_ESTILO = {
        Ponto: 'Predomina o estilo Ponto (.): comunica\u00e7\u00e3o mais fechada e assertiva de um lado s\u00f3. Tende a encerrar discuss\u00f5es com posi\u00e7\u00f5es fixas, o que pode dar ao parceiro a sensa\u00e7\u00e3o de n\u00e3o ser ouvido. Pode ser \u00fatil explorar na sess\u00e3o a abertura ao di\u00e1logo.',
        Exclamacao: 'Predomina o estilo Exclama\u00e7\u00e3o (!): comunica\u00e7\u00e3o intensa e emocional. Pode aparecer como entusiasmo genu\u00edno ou como press\u00e3o e cobran\u00e7a. Vale perguntar se a intensidade \u00e9 sentida como calor ou como invas\u00e3o pelo parceiro.',
        Interrogacao: 'Predomina o estilo Interroga\u00e7\u00e3o (?): comunica\u00e7\u00e3o mais aberta e colaborativa, com tend\u00eancia a entender o outro antes de concluir. Segundo o framework do autor, este estilo costuma estar associado a maior satisfa\u00e7\u00e3o relacional (sem valida\u00e7\u00e3o emp\u00edrica).'
    };
    function analise(r) {
        var out = [], t = r.total, c = CORPOS[r.corpo];
        var pan = t <= 36 ? 'O resultado indica fragilidade estrutural em v\u00e1rios pilares (escore ' + t + ' de 80). Na conversa cl\u00ednica, vale priorizar os pilares com menor pontua\u00e7\u00e3o.'
            : (t <= 58 ? 'O resultado indica equil\u00edbrio parcial (escore ' + t + ' de 80). H\u00e1 pilares funcionais e \u00e1reas que merecem aten\u00e7\u00e3o; a rela\u00e7\u00e3o est\u00e1 em ajuste.'
                : 'O resultado indica estrutura s\u00f3lida (escore ' + t + ' de 80). Os quatro pilares est\u00e3o bem sustentados; o foco pode ser manuten\u00e7\u00e3o e fortalecimento.');
        out.push({t: 'Panorama geral - ' + c.nome, x: pan});
        if (r.fracos.length === 1) {
            out.push({t: 'Pilar que merece mais aten\u00e7\u00e3o', x: PIL_NOME[r.fracos[0]] + ' (' + r.pil[r.fracos[0]].soma + ' de 20). ' + TXT_PILAR[r.fracos[0]]});
        } else {
            out.push({t: 'Pilares que merecem mais aten\u00e7\u00e3o (empate)', x: r.fracos.map(function (k) { return PIL_NOME[k]; }).join(', ') + ' empataram com ' + r.pil[r.fracos[0]].soma + ' de 20 cada.'});
        }
        if (r.empateDom.length === 1) out.push({t: 'Estilo de pontua\u00e7\u00e3o dominante', x: TXT_ESTILO[r.dominante]});
        else out.push({t: 'Estilo de pontua\u00e7\u00e3o (empate)', x: 'Os estilos ' + r.empateDom.map(function (k) { return PON_CURTO[k]; }).join(' e ') + ' empataram com ' + r.pon[r.dominante].soma + ' de 12; n\u00e3o h\u00e1 um estilo dominante \u00fanico.'});
        if (r.naoAconteceu > 0) out.push({t: 'Itens "N\u00e3o aconteceu"', x: r.naoAconteceu + ' item(ns) temporal(is) foram marcados como "N\u00e3o aconteceu" e ficaram fora da soma do pilar; a soma do pilar \u00e9 proporcional aos itens respondidos.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.epv h2{color:' + AC + ';margin-bottom:16px;text-align:center}' +
        '.epv h3{color:' + AC + ';margin:26px 0 10px;font-size:1.12em}' +
        '.epv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.epv-res b{font-size:1.5em;display:block}' +
        '.epv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.epv-bar{height:20px;background:#e0e0e0;border-radius:10px;margin:6px 0 2px}.epv-bar>div{height:20px;border-radius:10px}' +
        '.epv-faixas{display:flex;height:22px;border-radius:11px;overflow:hidden;margin:8px 0 4px;position:relative}.epv-faixas>div{height:22px}' +
        '.epv-pino{position:absolute;top:-5px;width:4px;height:32px;background:#000;border-radius:2px}' +
        '.epv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.epv-tab th{background:' + AC + ';color:#fff;padding:7px 4px}.epv-tab td{padding:6px;border-bottom:1px solid #eee}' +
        '.epv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('epv-css')) return;
        var st = document.createElement('style'); st.id = 'epv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, c = CORPOS[r.corpo], h = '<div class="epv"><h2>&#128149; Resultados &#8212; EPPC</h2>';
        h += '<div class="epv-res" style="background:' + c.fundo + ';border-color:' + c.borda + ';color:' + c.cor + '"><b>' + r.total + ' / 80 pontos</b>' + esc(c.nome) + ' &#8212; ' + esc(c.desc) + '</div>';
        h += '<div class="epv-box"><b>Faixas do corpo (soma dos pilares)</b><div class="epv-faixas">';
        for (i = 0; i < CORPOS.length; i++) h += '<div style="width:' + ((CORPOS[i].ate - (i ? CORPOS[i - 1].ate : 0)) / 80 * 100) + '%;background:' + CORPOS[i].borda + ';opacity:' + (i === r.corpo ? 1 : 0.35) + '"></div>';
        h += '<div class="epv-pino" style="left:calc(' + Math.min(99.5, r.total / 80 * 100) + '% - 2px)"></div></div><div style="font-size:.8em;color:#555">';
        for (i = 0; i < CORPOS.length; i++) h += '<span style="display:inline-block;margin-right:12px"><span style="display:inline-block;width:10px;height:10px;background:' + CORPOS[i].borda + ';border-radius:2px"></span> ' + CORPOS[i].nome + ' ' + CORPOS[i].rot + '</span>';
        h += '</div></div>';
        h += '<h3>Eixo 1: Os quatro pilares (corpo da entidade Casal)</h3><div class="epv-box">';
        PIL_ORDEM.forEach(function (k) {
            var p = r.pil[k];
            h += '<div style="margin:8px 0 12px"><b>' + PIL_NOME[k] + ':</b> ' + p.soma + ' de 20 (' + p.pct + '%) &#8212; <b style="color:' + COR_PIL[p.cls] + '">' + p.cls + '</b>' + (p.validos < p.n ? ' <span style="font-size:.8em;color:#888">(' + p.validos + '/' + p.n + ' itens respondidos)</span>' : '') + '<div class="epv-bar"><div style="width:' + Math.max(1, p.pct) + '%;background:' + COR_PIL[p.cls] + '"></div></div></div>';
        });
        h += '</div><h3>Eixo 2: Estilo de pontua\u00e7\u00e3o comunicacional (alma da entidade Casal)</h3><div class="epv-box">';
        PON_ORDEM.forEach(function (k) {
            var p = r.pon[k], dom = r.empateDom.indexOf(k) >= 0;
            h += '<div style="margin:8px 0 12px"><b>' + PON_NOME[k] + ':</b> ' + p.soma + ' de 12 (m\u00e9dia ' + f2(p.media) + ') &#8212; <b style="color:' + COR_PON[p.cls] + '">' + p.cls + '</b>' + (dom ? ' <span style="background:' + AC + ';color:#fff;padding:2px 8px;border-radius:10px;font-size:.75em">' + (r.empateDom.length > 1 ? 'EMPATE' : 'DOMINANTE') + '</span>' : '') + '<div class="epv-bar"><div style="width:' + Math.max(1, p.pct) + '%;background:' + COR_PON[p.cls] + '"></div></div></div>';
        });
        h += '</div><h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="epv-tab"><thead><tr><th>#</th><th style="text-align:left">Afirma\u00e7\u00e3o</th><th>Resposta</th></tr></thead><tbody>';
        for (i = 0; i < ITENS.length; i++) {
            if (i === 0) h += '<tr><td colspan="3" style="background:#fce4ec;font-weight:700;color:' + AC + '">Parte I &#8212; Os quatro pilares</td></tr>';
            if (i === 21) h += '<tr><td colspan="3" style="background:#fce4ec;font-weight:700;color:' + AC + '">Parte II &#8212; Estilo de pontua\u00e7\u00e3o comunicacional</td></tr>';
            h += '<tr><td style="text-align:center;font-weight:700">' + (i + 1) + '</td><td>' + esc(ITENS[i].texto) + '</td><td style="text-align:center">' + esc(OPC[r.v[i]]) + ' (' + r.v[i] + ')</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise autom\u00e1tica (por regras)</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="epv-box"><b>' + esc(an[i].t) + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="epv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
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
        F(doc, '#fdf5f8'); D(doc, '#f1dce5'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
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
        var doc = c.doc, x0 = ML + 2, w = CW - 4, yb = c.y + 3, hb = 6, ant = 0, i;
        c.need(24);
        for (i = 0; i < CORPOS.length; i++) {
            F(doc, i === r.corpo ? CORPOS[i].borda : '#e6e6e6'); doc.rect(x0 + w * ant / 80, yb, w * (CORPOS[i].ate - ant) / 80, hb, 'F');
            ant = CORPOS[i].ate;
        }
        var px = x0 + w * Math.min(r.total, 80) / 80;
        D(doc, '#000000'); doc.setLineWidth(1.0); doc.line(px, yb - 1.8, px, yb + hb + 1.8);
        doc.setFont(undefined, 'normal'); doc.setFontSize(6.8); T(doc, '#555555'); ant = 0;
        for (i = 0; i < CORPOS.length; i++) { doc.text(pt(CORPOS[i].nome + ' (' + CORPOS[i].rot + ' pontos)'), x0 + w * ((ant + CORPOS[i].ate) / 2) / 80, yb + hb + 4.2, {align: 'center'}); ant = CORPOS[i].ate; }
        c.y += 21;
    }

    function pdf(r, info) {
        info = info || {};
        var i, doc = new window.jspdf.jsPDF(), c = new Ctx(doc), cp = CORPOS[r.corpo];
        F(doc, AC); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#c2185b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('EPPC - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala de Pilares e Pontua\u00e7\u00f5es Conjugais - 30 itens'), 105, 22, {align: 'center'});
        doc.text(pt('Framework: Terapia do Esquema + Gestalt (Monte, 2025) - escala autoral, sem valida\u00e7\u00e3o formal'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AC); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AC); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO AVALIANDO', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;
        F(doc, cp.fundo); doc.rect(ML, c.y, CW, 17, 'F'); D(doc, cp.borda); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 17, 'S');
        T(doc, cp.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt(r.total + ' / 80 pontos - ' + cp.nome), 105, c.y + 7, {align: 'center'});
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.6); doc.text(pt(cp.desc), 105, c.y + 12.6, {align: 'center'});
        c.y += 23;
        secao(c, 'FAIXAS DO CORPO (SOMA DOS PILARES)');
        faixasPDF(c, r);
        secao(c, 'EIXO 1: OS QUATRO PILARES');
        PIL_ORDEM.forEach(function (k) { var p = r.pil[k]; barraPDF(c, PIL_NOME[k] + ': ' + p.soma + ' de 20 (' + p.pct + '%) - ' + p.cls + (p.validos < p.n ? ' [' + p.validos + '/' + p.n + ' itens]' : ''), p.pct, COR_PIL[p.cls]); });
        c.y += 2;
        secao(c, 'EIXO 2: ESTILO DE PONTUA\u00c7\u00c3O COMUNICACIONAL');
        PON_ORDEM.forEach(function (k) { var p = r.pon[k], dom = r.empateDom.indexOf(k) >= 0; barraPDF(c, PON_NOME[k] + ': ' + p.soma + ' de 12 - ' + p.cls + (dom ? (r.empateDom.length > 1 ? ' [empate]' : ' [dominante]') : ''), p.pct, COR_PON[p.cls]); });
        c.y += 2;
        secao(c, 'AN\u00c1LISE AUTOM\u00c1TICA (POR REGRAS)');
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
        var cn = 8, ct = 128, ca = 44, xT = ML;
        F(doc, AC); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Afirma\u00e7\u00e3o', xT + cn + 2, c.y + 4.7); doc.text('Resposta', xT + cn + ct + ca / 2, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (i = 0; i < ITENS.length; i++) {
            if (i === 0 || i === 21) {
                c.need(14); F(doc, '#fce4ec'); doc.rect(xT, c.y, CW, 5.6, 'F'); T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6);
                doc.text(pt(i === 0 ? 'PARTE I - OS QUATRO PILARES' : 'PARTE II - ESTILO DE PONTUA\u00c7\u00c3O COMUNICACIONAL'), xT + 2, c.y + 4); c.y += 5.6;
            }
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
            var tx = doc.splitTextToSize(pt(ITENS[i].texto), ct - 3), rh = Math.max(5.4, tx.length * 3.3 + 2.4);
            c.need(rh);
            if (i % 2 === 0) { F(doc, '#fdf5f8'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(i + 1), xT + cn / 2, c.y + rh / 2 + 1, {align: 'center'});
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.text(tx, xT + cn + 2, c.y + 3.5);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.2); doc.text(pt(OPC[r.v[i]] + ' (' + r.v[i] + ')'), xT + cn + ct + ca / 2, c.y + rh / 2 + 1, {align: 'center'});
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
            doc.text('SYM Online | EPPC | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('EPPC_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'EPPC' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) { var v = parseInt(d.respostas[i], 10); if (isNaN(v)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_EPPC = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        respostasObj: respostasObj, ITENS: ITENS, PILARES: PILARES, PONTUACOES: PONTUACOES, CORPOS: CORPOS};
})();
