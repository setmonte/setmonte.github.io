// raads-visual.js - Desenho sob medida do RAADS-R (tela de resultados + PDF da escala e do Painel).
// Instrumento: Ritvo Autism Asperger Diagnostic Scale-Revised (Ritvo et al., 2011), 80 itens, adultos (18+) com
// inteligencia media ou acima. Lista de itens, dominios e itens normativos conferidos com o artigo original,
// com o apendice do artigo sueco (Andersen et al., 2011) e com a chave de dominios publicada em Ritvo et al. (2011).
// Pontuacao por item: sintoma = 3 (agora e quando jovem), 2 (so agora), 1 (so quando jovem, antes dos 16), 0 (nunca).
// Itens NORMATIVOS (17) pontuam ao contrario: 0, 1, 2, 3. (Ritvo cita 16 no texto; o artigo sueco e listas
// publicadas apontam 17, incluindo o item 11, coerente com o conteudo do item.)
// Dominios (itens / maximo): Social 39 / 117, Interesses restritos 14 / 42, Linguagem 7 / 21, Sensorial-motor 20 / 60.
// Corte total >= 65 (sens. 97%, espec. 100% na amostra original). Cortes por dominio (Ritvo et al., 2011, Tabela 3):
// Social 31, Interesses restritos 15, Sensorial-motor 16, Linguagem 4.
// Traducao livre feita para este site (nao e a versao RAADS-R-BR).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

    // [texto, dominio (S/R/L/M), normativo]
    var IT = [
        ['Eu sou uma pessoa simp\u00e1tica.', 'S', 1],
        ['Costumo usar palavras e frases de filmes e TV em conversas.', 'L', 0],
        ['Muitas vezes fico surpreso quando outras pessoas me dizem que fui rude.', 'S', 0],
        ['\u00c0s vezes falo muito alto ou muito baixo, e n\u00e3o percebo.', 'M', 0],
        ['Frequentemente n\u00e3o sei como agir em situa\u00e7\u00f5es sociais.', 'S', 0],
        ['Consigo "me colocar no lugar dos outros".', 'S', 1],
        ['Tenho dificuldade em entender algumas frases, como "voc\u00ea \u00e9 a menina dos meus olhos".', 'L', 0],
        ['S\u00f3 gosto de conversar com pessoas que compartilham meus interesses especiais.', 'S', 0],
        ['Foco nos detalhes em vez da ideia geral.', 'R', 0],
        ['Sempre noto como a comida se sente na boca. Isso \u00e9 mais importante para mim do que o sabor.', 'M', 0],
        ['Sinto falta dos meus melhores amigos ou familiares quando estamos separados por muito tempo.', 'S', 1],
        ['\u00c0s vezes ofendo os outros dizendo o que estou pensando, mesmo sem querer.', 'S', 0],
        ['S\u00f3 gosto de pensar e falar sobre algumas poucas coisas que me interessam.', 'R', 0],
        ['Prefiro comer sozinho em um restaurante do que com algu\u00e9m que conhe\u00e7o.', 'S', 0],
        ['N\u00e3o consigo imaginar como seria ser outra pessoa.', 'L', 0],
        ['Me disseram que sou desajeitado ou descoordenado.', 'M', 0],
        ['Outras pessoas me consideram estranho ou diferente.', 'S', 0],
        ['Eu entendo quando amigos precisam ser consolados.', 'S', 1],
        ['Sou muito sens\u00edvel ao jeito como minhas roupas tocam meu corpo. Como elas s\u00e3o ao toque \u00e9 mais importante para mim do que a apar\u00eancia.', 'M', 0],
        ['Gosto de imitar o jeito de falar e agir de certas pessoas. Isso me ajuda a parecer mais normal.', 'S', 0],
        ['Pode ser muito intimidante para mim conversar com mais de uma pessoa ao mesmo tempo.', 'S', 0],
        ['Preciso "agir normalmente" para agradar aos outros e fazer com que gostem de mim.', 'S', 0],
        ['Conhecer pessoas novas costuma ser f\u00e1cil para mim.', 'S', 1],
        ['Fico muito confuso quando algu\u00e9m me interrompe enquanto falo de algo que me interessa muito.', 'R', 0],
        ['\u00c9 dif\u00edcil para mim entender como as outras pessoas est\u00e3o se sentindo enquanto conversamos.', 'S', 0],
        ['Gosto de conversar com v\u00e1rias pessoas ao mesmo tempo, por exemplo, em volta de uma mesa de jantar, na escola ou no trabalho.', 'S', 1],
        ['Levo as coisas ao p\u00e9 da letra, ent\u00e3o muitas vezes n\u00e3o percebo o que as pessoas querem dizer.', 'L', 0],
        ['\u00c9 muito dif\u00edcil para mim perceber quando algu\u00e9m est\u00e1 constrangido ou com ci\u00fame.', 'S', 0],
        ['Algumas texturas comuns, que n\u00e3o incomodam os outros, s\u00e3o muito desagrad\u00e1veis quando encostam na minha pele.', 'M', 0],
        ['Fico extremamente chateado quando o jeito como gosto de fazer as coisas muda de repente.', 'R', 0],
        ['Nunca quis nem precisei ter o que as pessoas chamam de "relacionamento \u00edntimo".', 'S', 0],
        ['\u00c9 dif\u00edcil para mim come\u00e7ar e terminar uma conversa. Preciso continuar falando at\u00e9 terminar.', 'R', 0],
        ['Eu falo com um ritmo normal.', 'M', 1],
        ['O mesmo som, cor ou textura pode mudar de repente de muito sens\u00edvel para muito apagado.', 'M', 0],
        ['A frase "voc\u00ea est\u00e1 debaixo da minha pele" me deixa muito desconfort\u00e1vel.', 'L', 0],
        ['\u00c0s vezes, o som de uma palavra ou um ru\u00eddo agudo pode ser doloroso para os meus ouvidos.', 'M', 0],
        ['Sou um tipo compreensivo de pessoa.', 'S', 1],
        ['N\u00e3o me conecto com personagens de filmes e n\u00e3o consigo sentir o que eles sentem.', 'S', 0],
        ['N\u00e3o consigo identificar quando algu\u00e9m est\u00e1 flertando comigo.', 'S', 0],
        ['Posso ver em minha mente, com detalhes exatos, coisas que me interessam.', 'R', 0],
        ['Mantenho listas de coisas que me interessam, mesmo que n\u00e3o tenham utilidade pr\u00e1tica (ex.: estat\u00edsticas esportivas, hor\u00e1rios de trens, datas hist\u00f3ricas).', 'R', 0],
        ['Quando me sinto sobrecarregado pelos meus sentidos, preciso me isolar para deslig\u00e1-los.', 'M', 0],
        ['Gosto de conversar sobre as coisas com meus amigos.', 'S', 1],
        ['N\u00e3o consigo dizer se algu\u00e9m est\u00e1 interessado ou entediado com o que estou dizendo.', 'S', 0],
        ['Pode ser muito dif\u00edcil ler a face, as m\u00e3os e os movimentos corporais de algu\u00e9m enquanto conversamos.', 'S', 0],
        ['A mesma coisa (como roupas ou temperaturas) pode parecer muito diferente para mim em momentos diferentes.', 'M', 0],
        ['Sinto-me muito confort\u00e1vel em encontros rom\u00e2nticos ou em situa\u00e7\u00f5es sociais com outras pessoas.', 'S', 1],
        ['Tento ser o mais prestativo poss\u00edvel quando outras pessoas me contam seus problemas pessoais.', 'S', 1],
        ['Me disseram que tenho uma voz incomum (ex.: mon\u00f3tona, infantil ou aguda).', 'M', 0],
        ['\u00c0s vezes, um pensamento ou assunto fica preso na minha mente e eu tenho que falar sobre ele, mesmo que ningu\u00e9m se interesse.', 'R', 0],
        ['Fa\u00e7o certas coisas com as m\u00e3os repetidamente (ex.: bater palmas, girar gravetos, agitar objetos perto dos olhos).', 'M', 0],
        ['Nunca me interessei pelo que a maioria das pessoas que conhe\u00e7o considera interessante.', 'R', 0],
        ['Sou considerado um tipo compassivo de pessoa.', 'S', 1],
        ['Me dou bem com outras pessoas seguindo um conjunto de regras espec\u00edficas que me ajudam a parecer normal.', 'S', 0],
        ['\u00c9 muito dif\u00edcil para mim trabalhar e funcionar em grupos.', 'S', 0],
        ['Quando estou conversando com algu\u00e9m, \u00e9 dif\u00edcil mudar de assunto. Se a outra pessoa muda, posso ficar muito chateado e confuso.', 'R', 0],
        ['\u00c0s vezes preciso tapar os ouvidos para bloquear ru\u00eddos dolorosos (como aspirador de p\u00f3 ou pessoas falando demais ou muito alto).', 'M', 0],
        ['Consigo bater papo e conversar sobre assuntos corriqueiros com as pessoas.', 'L', 1],
        ['\u00c0s vezes coisas que deveriam doer n\u00e3o doem (por exemplo, quando me machuco ou queimo a m\u00e3o no fog\u00e3o).', 'M', 0],
        ['Quando converso com algu\u00e9m, tenho dificuldade em saber quando \u00e9 minha vez de falar ou de ouvir.', 'S', 0],
        ['Quem me conhece melhor me considera um solit\u00e1rio.', 'S', 0],
        ['Eu costumo falar em tom normal.', 'M', 1],
        ['Gosto que as coisas sejam exatamente iguais dia ap\u00f3s dia, e at\u00e9 pequenas mudan\u00e7as na minha rotina me incomodam.', 'R', 0],
        ['Fazer amigos e socializar \u00e9 um mist\u00e9rio para mim.', 'S', 0],
        ['Girar ou balan\u00e7ar numa cadeira me acalma quando estou estressado.', 'M', 0],
        ['A express\u00e3o "ele usa o cora\u00e7\u00e3o na manga" n\u00e3o faz sentido para mim.', 'L', 0],
        ['Se estou em um lugar com muitos cheiros, texturas, ru\u00eddos ou luzes fortes, fico ansioso ou assustado.', 'M', 0],
        ['Percebo quando algu\u00e9m diz uma coisa mas quer dizer outra.', 'S', 1],
        ['Gosto de ficar sozinho o m\u00e1ximo que posso.', 'S', 0],
        ['Guardo meus pensamentos na mem\u00f3ria como fichas de arquivo e pego os que preciso procurando na pilha at\u00e9 achar o certo (ou de outro jeito s\u00f3 meu).', 'R', 0],
        ['O mesmo som \u00e0s vezes parece muito alto ou muito baixo, mesmo sabendo que n\u00e3o mudou.', 'M', 0],
        ['Gosto de passar tempo comendo e conversando com minha fam\u00edlia e meus amigos.', 'S', 1],
        ['N\u00e3o tolero coisas de que n\u00e3o gosto (como cheiros, texturas, sons ou cores).', 'M', 0],
        ['N\u00e3o gosto de ser abra\u00e7ado ou segurado.', 'M', 0],
        ['Quando vou a algum lugar, preciso seguir uma rota familiar, sen\u00e3o posso ficar muito confuso e chateado.', 'R', 0],
        ['\u00c9 dif\u00edcil descobrir o que outras pessoas esperam de mim.', 'S', 0],
        ['Gosto de ter amigos pr\u00f3ximos.', 'S', 1],
        ['As pessoas me dizem que eu dou muitos detalhes.', 'R', 0],
        ['Frequentemente me dizem que fa\u00e7o perguntas embara\u00e7osas.', 'S', 0],
        ['Tendo a apontar os erros das outras pessoas.', 'S', 0]
    ];
    var ITENS = IT.map(function (a, i) { return {n: i + 1, t: a[0], d: a[1], norm: !!a[2]}; });
    var DOM = {
        S: {nome: 'Rela\u00e7\u00e3o Social', max: 117, corte: 31, sens: '96,0', espec: '96,2', cor: '#3949ab'},
        R: {nome: 'Interesses Restritos', max: 42, corte: 15, sens: '89,6', espec: '97,1', cor: '#00897b'},
        M: {nome: 'Sensorial/Motor', max: 60, corte: 16, sens: '85,1', espec: '95,2', cor: '#8e24aa'},
        L: {nome: 'Linguagem', max: 21, corte: 4, sens: '88,6', espec: '91,5', cor: '#ef6c00'}
    };
    var ORDEM = ['S', 'R', 'M', 'L'];
    var OPCOES = ['Nunca verdadeiro', 'Verdadeiro s\u00f3 quando jovem (antes dos 16)', 'Verdadeiro s\u00f3 agora', 'Verdadeiro agora e quando jovem'];
    var CORTE = 65, TOTMAX = 240;
    var REFS = [
        'RITVO, R. A. et al. The Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R): a scale to assist the diagnosis of Autism Spectrum Disorder in adults: an international validation study. Journal of Autism and Developmental Disorders, v. 41, n. 8, p. 1076-1089, 2011. DOI: 10.1007/s10803-010-1133-5.',
        'ANDERSEN, L. M. et al. The Swedish version of the Ritvo Autism and Asperger Diagnostic Scale: Revised (RAADS-R). A validation study of a rating scale for adults. Journal of Autism and Developmental Disorders, v. 41, n. 12, p. 1635-1645, 2011.',
        'CONNER, C. M.; CRAMER, R. D.; McGONIGLE, J. J. Examining the diagnostic validity of autism measures among adults in an outpatient clinic sample. Autism in Adulthood, v. 1, n. 1, p. 60-68, 2019. DOI: 10.1089/aut.2018.0023.',
        'HARTWIG, M. D. Tradu\u00e7\u00e3o e adapta\u00e7\u00e3o transcultural do Ritvo Autism Asperger Scale Revised (RAADS-R) para o portugu\u00eas do Brasil. 2023. 179 f. Tese (Doutorado em Psicologia) - Instituto de Educa\u00e7\u00e3o, Universidade Federal Rural do Rio de Janeiro, Serop\u00e9dica, 2023.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O RAADS-R \u00e9 um instrumento de rastreio para tra\u00e7os do espectro autista em adultos (18 anos ou mais) com intelig\u00eancia m\u00e9dia ou acima, e n\u00e3o \u00e9 diagn\u00f3stico. Um escore igual ou acima de 65 indica necessidade de avalia\u00e7\u00e3o especializada; um escore abaixo n\u00e3o exclui TEA. Os itens usam autorrelato retrospectivo e podem ser influenciados por ansiedade, depress\u00e3o, TDAH, trauma e pelo mascaramento de tra\u00e7os. Esta vers\u00e3o \u00e9 uma tradu\u00e7\u00e3o livre feita para o site; a adapta\u00e7\u00e3o brasileira (RAADS-R-BR; Hartwig, 2023) ainda carece de evid\u00eancias s\u00f3lidas de validade. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function pct(v, m) { return Math.round(v / m * 100); }

    // ===================== CALCULO =====================
    // vals: 80 respostas BRUTAS (0=nunca, 1=so quando jovem, 2=so agora, 3=agora e quando jovem)
    function calcular(vals) {
        if (!vals || vals.length !== 80) throw new Error('RAADS-R: respostas incompletas');
        var r = {vals: [], pts: [], dom: {S: 0, R: 0, M: 0, L: 0}, total: 0, temporal: [0, 0, 0, 0]}, i;
        for (i = 0; i < 80; i++) {
            var v = parseInt(vals[i], 10);
            if (!(v >= 0 && v <= 3)) throw new Error('RAADS-R: resposta invalida no item ' + (i + 1));
            var p = ITENS[i].norm ? 3 - v : v;
            r.vals.push(v); r.pts.push(p);
            r.dom[ITENS[i].d] += p; r.total += p;
            if (!ITENS[i].norm) r.temporal[v]++;
        }
        r.positivo = r.total >= CORTE;
        r.acima = ORDEM.filter(function (k) { return r.dom[k] >= DOM[k].corte; });
        return r;
    }
    function classifGeral(r) { return (r.positivo ? 'RASTREIO POSITIVO (>=65) - ' : 'RASTREIO NEGATIVO (<65) - ') + r.total + '/240 [RAADS-R oficial]'; }
    function dadosPainel(r) {
        var o = {Total: {pontuacao: r.total, max: TOTMAX, classificacao: r.positivo ? 'Rastreio positivo (>=65)' : 'Rastreio negativo (<65)'}};
        ORDEM.forEach(function (k) {
            o[DOM[k].nome] = {pontuacao: r.dom[k], max: DOM[k].max, classificacao: r.dom[k] >= DOM[k].corte ? 'Acima do corte (>=' + DOM[k].corte + ')' : 'Abaixo do corte (<' + DOM[k].corte + ')'};
        });
        return o;
    }
    function analise(r) {
        var out = [], i;
        out.push({t: 'Resultado total', x: 'Escore ' + r.total + ' de 240 (corte: 65 ou mais). ' + (r.positivo ?
            'Rastreio POSITIVO: o escore est\u00e1 no n\u00edvel em que, no estudo original, 97% dos adultos com TEA pontuaram, e indica necessidade de avalia\u00e7\u00e3o diagn\u00f3stica especializada (crit\u00e9rios do DSM-5-TR).' :
            'Rastreio NEGATIVO: o escore est\u00e1 abaixo do corte do estudo original. Isso n\u00e3o exclui TEA, sobretudo em quem mascara ou compensa tra\u00e7os socialmente.')});
        var txt = ORDEM.map(function (k) { return DOM[k].nome + ' ' + r.dom[k] + '/' + DOM[k].max + (r.dom[k] >= DOM[k].corte ? ' (acima do corte ' + DOM[k].corte + ')' : ' (abaixo do corte ' + DOM[k].corte + ')'); });
        out.push({t: 'Dom\u00ednios', x: txt.join('; ') + '. ' + (r.acima.length ? 'Dom\u00ednios acima do corte: ' + r.acima.map(function (k) { return DOM[k].nome; }).join(', ') + '.' : 'Nenhum dom\u00ednio acima do corte espec\u00edfico.') + ' Os cortes por dom\u00ednio t\u00eam acur\u00e1cia menor que a do escore total; o escore total \u00e9 o indicador principal.'});
        var t = r.temporal, tot = t[0] + t[1] + t[2] + t[3];
        out.push({t: 'Perfil temporal dos sintomas', x: 'Nos 63 itens de sintoma: ' + t[3] + ' "agora e quando jovem" (tra\u00e7os persistentes desde a inf\u00e2ncia), ' + t[2] + ' "s\u00f3 agora", ' + t[1] + ' "s\u00f3 quando jovem" e ' + t[0] + ' "nunca" (de ' + tot + '). Tra\u00e7os persistentes desde antes dos 16 anos pesam a favor de um in\u00edcio no desenvolvimento; tra\u00e7os "s\u00f3 agora" pedem investigar outras explica\u00e7\u00f5es (ansiedade, depress\u00e3o, trauma).'});
        out.push({t: 'Acur\u00e1cia e limites', x: 'No estudo original (779 adultos), o corte 65 teve sensibilidade de 97% e especificidade de 100% (Ritvo et al., 2011); na vers\u00e3o sueca, 91% e 93% (Andersen et al., 2011). Em amostra de ambulat\u00f3rio (Conner et al., 2019), a acur\u00e1cia foi fraca (\u00e1rea sob a curva 0,58). Ou seja, o desempenho depende muito da popula\u00e7\u00e3o avaliada, e um escore alto pode refletir outras condi\u00e7\u00f5es.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.raadv h2{color:#1a237e;margin-bottom:16px;text-align:center}' +
        '.raadv h3{color:#1a237e;margin:26px 0 10px;font-size:1.12em}' +
        '.raadv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.raadv-res b{font-size:1.7em;display:block}' +
        '.raadv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.raadv-bar{position:relative;height:22px;background:#e0e0e0;border-radius:11px;margin:6px 0 2px}' +
        '.raadv-bar>div{height:22px;border-radius:11px}' +
        '.raadv-corte{position:absolute;top:-4px;width:3px;height:30px;background:#c62828}' +
        '.raadv-tab{width:100%;border-collapse:collapse;font-size:.88em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.raadv-tab th{background:#1a237e;color:#fff;padding:7px 5px}.raadv-tab td{padding:7px 6px;border-bottom:1px solid #eee;text-align:center}' +
        '.raadv-tab td.n{text-align:left;font-weight:700}' +
        '.raadv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('raadv-css')) return;
        var st = document.createElement('style'); st.id = 'raadv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function barra(valor, max, corte, cor, rotulo) {
        var h = '<div style="font-size:.9em;font-weight:700;color:#333">' + rotulo + '</div><div class="raadv-bar"><div style="width:' + Math.max(1, pct(valor, max)) + '%;background:' + cor + '"></div>';
        h += '<div class="raadv-corte" style="left:' + (corte / max * 100) + '%" title="corte ' + corte + '"></div></div>';
        return h + '<div style="font-size:.78em;color:#c62828;text-align:right;margin-bottom:8px">linha vermelha: corte ' + corte + '</div>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="raadv"><h2>&#129513; Resultados RAADS-R</h2>';
        var pos = r.positivo, bg = pos ? '#ffcdd2' : '#c8e6c9', bd = pos ? '#c62828' : '#2e7d32', fg = pos ? '#b71c1c' : '#1b5e20';
        h += '<div class="raadv-res" style="background:' + bg + ';border-color:' + bd + ';color:' + fg + '"><b>' + (pos ? 'RASTREIO POSITIVO' : 'RASTREIO NEGATIVO') + ' \u2014 ' + r.total + ' / 240</b>Ponto de corte: 65 ou mais</div>';
        h += '<h3>&#127919; Escore total</h3><div class="raadv-box">' + barra(r.total, TOTMAX, CORTE, pos ? '#e53935' : '#43a047', 'Total: ' + r.total + ' de 240') + '</div>';
        h += '<h3>&#128202; Dom\u00ednios</h3><div class="raadv-box">';
        for (i = 0; i < ORDEM.length; i++) { k = ORDEM[i]; h += barra(r.dom[k], DOM[k].max, DOM[k].corte, DOM[k].cor, DOM[k].nome + ': ' + r.dom[k] + ' de ' + DOM[k].max + ' (' + pct(r.dom[k], DOM[k].max) + '%)'); }
        h += '</div><div style="overflow-x:auto"><table class="raadv-tab"><thead><tr><th style="text-align:left">Dom\u00ednio</th><th>Itens</th><th>Pontos</th><th>Corte</th><th>Situa\u00e7\u00e3o</th><th>Sens./Espec. do corte</th></tr></thead><tbody>';
        var nIt = {S: 39, R: 14, M: 20, L: 7};
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i]; var ac = r.dom[k] >= DOM[k].corte;
            h += '<tr><td class="n">' + DOM[k].nome + '</td><td>' + nIt[k] + '</td><td><b>' + r.dom[k] + ' / ' + DOM[k].max + '</b></td><td>' + DOM[k].corte + '</td><td style="font-weight:700;color:' + (ac ? '#b71c1c' : '#2e7d32') + '">' + (ac ? 'acima do corte' : 'abaixo do corte') + '</td><td>' + DOM[k].sens + '% / ' + DOM[k].espec + '%</td></tr>';
        }
        h += '</tbody></table></div>';
        var t = r.temporal;
        h += '<h3>&#128337; Perfil temporal (63 itens de sintoma)</h3><div class="raadv-box">';
        var lbl = ['Nunca verdadeiro', 'S\u00f3 quando jovem', 'S\u00f3 agora', 'Agora e quando jovem'], cl = ['#90a4ae', '#ffb74d', '#4fc3f7', '#e53935'];
        for (i = 3; i >= 0; i--) h += '<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="width:150px;font-size:.88em">' + lbl[i] + '</span><div style="flex:1;background:#eee;border-radius:6px"><div style="width:' + Math.max(0.5, t[i] / 63 * 100) + '%;background:' + cl[i] + ';height:16px;border-radius:6px"></div></div><b style="width:28px;text-align:right">' + t[i] + '</b></div>';
        h += '</div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do resultado</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="raadv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="raadv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#1a237e';
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
    function barraPDF(c, rotulo, valor, max, corte, cor) {
        var doc = c.doc, x0 = ML + 52, w = CW - 52 - 4;
        c.need(10);
        T(doc, '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.4); doc.text(pt(rotulo), ML + 2, c.y + 4.6);
        F(doc, '#e0e0e0'); doc.roundedRect(x0, c.y + 0.6, w, 5.6, 2.8, 2.8, 'F');
        F(doc, cor); doc.roundedRect(x0, c.y + 0.6, Math.max(2, w * valor / max), 5.6, 2.8, 2.8, 'F');
        D(doc, '#c62828'); doc.setLineWidth(0.7); doc.line(x0 + w * corte / max, c.y - 0.8, x0 + w * corte / max, c.y + 8);
        T(doc, '#c62828'); doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); doc.text('corte ' + corte, x0 + w * corte / max, c.y + 10.6, {align: 'center'});
        c.y += 13;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('RAADS-R - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Ritvo Autism Asperger Diagnostic Scale - Revised (80 itens)'), 105, 22, {align: 'center'});
        doc.text(pt('Ritvo et al. (2011) | rastreio de tra\u00e7os do espectro autista em adultos | tradu\u00e7\u00e3o livre'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        var pos = r.positivo;
        F(doc, pos ? '#ffcdd2' : '#c8e6c9'); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, pos ? '#c62828' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(pt((pos ? 'RASTREIO POSITIVO' : 'RASTREIO NEGATIVO') + ' - ' + r.total + ' / 240'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(9); doc.text(pt('Ponto de corte: 65 ou mais'), 105, c.y + 12.6, {align: 'center'});
        c.y += 23;

        secao(c, 'ESCORE TOTAL E DOM\u00cdNIOS');
        barraPDF(c, 'Total: ' + r.total + ' / 240', r.total, TOTMAX, CORTE, pos ? '#e53935' : '#43a047');
        for (i = 0; i < ORDEM.length; i++) { k = ORDEM[i]; barraPDF(c, DOM[k].nome + ': ' + r.dom[k] + ' / ' + DOM[k].max, r.dom[k], DOM[k].max, DOM[k].corte, DOM[k].cor); }
        c.y += 2;

        secao(c, 'DETALHAMENTO POR DOM\u00cdNIO');
        var cols = [{t: 'Dom\u00ednio', w: 50, a: 'l'}, {t: 'Itens', w: 16, a: 'c'}, {t: 'Pontos', w: 26, a: 'c'}, {t: 'Corte', w: 16, a: 'c'}, {t: 'Situa\u00e7\u00e3o', w: 38, a: 'c'}, {t: 'Sens./Espec. do corte', w: 34, a: 'c'}];
        var cx = ML;
        F(doc, AZ); doc.rect(ML, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        for (i = 0; i < cols.length; i++) { doc.text(pt(cols[i].t), cols[i].a === 'l' ? cx + 2 : cx + cols[i].w / 2, c.y + 4.7, cols[i].a === 'l' ? {} : {align: 'center'}); cx += cols[i].w; }
        c.y += 7;
        var nIt = {S: 39, R: 14, M: 20, L: 7};
        for (i = 0; i < ORDEM.length; i++) {
            k = ORDEM[i]; cx = ML; var ac = r.dom[k] >= DOM[k].corte;
            if (i % 2 === 0) { F(doc, '#f3f4fb'); doc.rect(ML, c.y, CW, 7, 'F'); }
            var vv = [DOM[k].nome, String(nIt[k]), r.dom[k] + ' / ' + DOM[k].max, String(DOM[k].corte), ac ? 'acima do corte' : 'abaixo do corte', DOM[k].sens + '% / ' + DOM[k].espec + '%'];
            for (var j = 0; j < cols.length; j++) {
                if (j === 4) { T(doc, ac ? '#b71c1c' : '#2e7d32'); doc.setFont(undefined, 'bold'); } else { T(doc, '#000000'); doc.setFont(undefined, j === 0 || j === 2 ? 'bold' : 'normal'); }
                doc.setFontSize(8); doc.text(pt(vv[j]), cols[j].a === 'l' ? cx + 2 : cx + cols[j].w / 2, c.y + 4.8, cols[j].a === 'l' ? {} : {align: 'center'});
                cx += cols[j].w;
            }
            c.y += 7;
        }
        c.y += 8;

        secao(c, 'PERFIL TEMPORAL DOS SINTOMAS (63 itens)');
        var t = r.temporal, lbl = ['Nunca verdadeiro', 'S\u00f3 quando jovem', 'S\u00f3 agora', 'Agora e quando jovem'], cl = ['#90a4ae', '#ffb74d', '#4fc3f7', '#e53935'];
        for (i = 3; i >= 0; i--) {
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.4); doc.text(pt(lbl[i]), ML + 2, c.y + 4.4);
            F(doc, '#eeeeee'); doc.roundedRect(ML + 52, c.y + 0.6, CW - 52 - 14, 4.6, 2, 2, 'F');
            F(doc, cl[i]); doc.roundedRect(ML + 52, c.y + 0.6, Math.max(1.2, (CW - 52 - 14) * t[i] / 63), 4.6, 2, 2, 'F');
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.text(String(t[i]), ML + CW - 2, c.y + 4.4, {align: 'right'});
            c.y += 7;
        }
        c.y += 6;

        secao(c, 'AN\u00c1LISE DO RESULTADO');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 6;

        c.need(50);
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
            doc.text('SYM Online | RAADS-R | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('RAADS_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    // So registros da versao OFICIAL (d.versaoOficial) podem ser redesenhados; os antigos usavam itens e dominios
    // que nao correspondem ao instrumento original e nao podem ser recalculados.
    var NOTA_ANTIGA = 'ATENCAO: este registro foi aplicado com uma versao NAO OFICIAL do RAADS-R que existia no site antes de 10/11/2026 (cerca de metade dos itens, os dominios e os itens invertidos diferiam do instrumento de Ritvo et al., 2011). O resultado nao e comparavel ao RAADS-R oficial e nao pode ser recalculado. Recomenda-se reaplicar a versao oficial.';
    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'RAADS-R' || !d.versaoOficial || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= 80; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 3)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_RAADS = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        ITENS: ITENS, OPCOES: OPCOES, DOM: DOM, NOTA_ANTIGA: NOTA_ANTIGA};
})();
