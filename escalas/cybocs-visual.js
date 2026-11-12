// cybocs-visual.js - Desenho sob medida da CY-BOCS (Escala Yale-Brown de Obsessoes e Compulsoes - versao para criancas)
// (tela de resultados + PDF da escala e do Painel). Escala de GRAVIDADE aplicada em ENTREVISTA clinica (o profissional pontua).
// Itens/pontuacao mantidos como no site (texto da versao brasileira que circula): 10 itens principais (0-4; obsessoes 1-5, compulsoes 6-10;
// total 0-40) + 6 itens complementares (11-16, 0-4, NAO entram no total).
// Faixas de referencia (0-7, 8-15, 16-23, 24-31, 32-40) sao as da Y-BOCS ADULTA, usadas na pratica com a CY-BOCS; NAO validadas para
// criancas. Lewin et al. (2014) propuseram faixas empiricas para jovens (nao consultadas aqui) e alertam que nao servem para rastreio.
// Retirados: texto prescritivo ("intervencao imediata", "TCC + farmacologica"), classificacao "Elevado" sem fonte, media sem sentido, cores de alarme.
// d.respostas: chaves obs1..obs5, comp6..comp10, compl11..compl16 (valores 0-4), igual ao registro antigo. d.dominios: chaves
// "Obsessoes" e "Compulsoes" (sem acento, para manter as colunas da coleta anonima).
// IMPORTANTE: este arquivo e gerado 100% ASCII (acentos como \uXXXX).
(function () {
    'use strict';

var OBS = [
{num:1,titulo:"Tempo ocupado pelos Pensamentos Obsessivos",pergunta:"Quanto tempo voc\u00ea gasta com esses pensamentos que entram na sua cabe\u00e7a?",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: menos de 1 hora/dia ou intrus\u00f5es ocasionais"},
{valor:2,texto:"Moderado: 1 a 3 horas/dia ou intrus\u00f5es frequentes"},
{valor:3,texto:"Grave: 3 a 8 horas/dia ou intrus\u00f5es muito frequentes"},
{valor:4,texto:"Muito grave: mais de 8 horas/dia ou intrus\u00f5es quase constantes"}
]},
{num:2,titulo:"Interfer\u00eancia provocada pelos Pensamentos Obsessivos",pergunta:"Quanto estes pensamentos atrapalham no caminho da escola ou quando voc\u00ea est\u00e1 fazendo alguma coisa/brincando com seus amigos?",nota:"Se n\u00e3o estiver frequentando a escola no momento, avalie at\u00e9 que ponto o desempenho seria afetado se o paciente estivesse na escola.",opcoes:[
{valor:0,texto:"Nenhuma"},
{valor:1,texto:"Alguma: leve interfer\u00eancia nas atividades, mas o desempenho global n\u00e3o \u00e9 deteriorado"},
{valor:2,texto:"Moderada: clara interfer\u00eancia no desempenho social ou ocupacional, mas conseguindo ainda desempenhar"},
{valor:3,texto:"Grave: provoca deteriora\u00e7\u00e3o consider\u00e1vel no desempenho social ou ocupacional"},
{valor:4,texto:"Muito grave: incapacitante"}
]},
{num:3,titulo:"Sofrimento relacionado aos Pensamentos Obsessivos",pergunta:"Quanto estes pensamentos chateiam ou incomodam voc\u00ea?",nota:"Avalie somente a ansiedade que parece ser desencadeada pelas obsess\u00f5es, n\u00e3o a ansiedade generalizada ou a ansiedade associada a outros sintomas.",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: n\u00e3o muito perturbadora"},
{valor:2,texto:"Moderado: perturbadora, mas ainda control\u00e1vel"},
{valor:3,texto:"Grave: muito perturbadora"},
{valor:4,texto:"Muito grave: mal-estar quase constante e incapacitante"}
]},
{num:4,titulo:"Resist\u00eancia \u00e0s Obsess\u00f5es",pergunta:"Quanto voc\u00ea se esfor\u00e7a para parar ou ignorar (n\u00e3o ligar para) os pensamentos?",nota:"Avalie somente o esfor\u00e7o feito para resistir, n\u00e3o o sucesso/fracasso que tem ao tentar controlar as obsess\u00f5es. Se as obsess\u00f5es s\u00e3o m\u00ednimas, o paciente pode n\u00e3o sentir necessidade de resistir. Em tais casos, o escore 0 deve ser dado.",opcoes:[
{valor:0,texto:"Faz sempre esfor\u00e7o para resistir, ou sintomas m\u00ednimos que n\u00e3o necessitam de resist\u00eancia ativa"},
{valor:1,texto:"Tenta resistir a maior parte das vezes"},
{valor:2,texto:"Faz algum esfor\u00e7o para resistir"},
{valor:3,texto:"Cede a todas as obsess\u00f5es sem tentar control\u00e1-las, ainda que fa\u00e7a isso com alguma relut\u00e2ncia"},
{valor:4,texto:"Cede completamente a todas as obsess\u00f5es de modo volunt\u00e1rio"}
]},
{num:5,titulo:"Grau de controle sobre os Pensamentos Obsessivos",pergunta:"Quando voc\u00ea briga com os pensamentos, voc\u00ea pode ganhar deles/derrot\u00e1-los? Quanto voc\u00ea consegue controlar seus pensamentos?",nota:"A capacidade do paciente em controlar as suas obsess\u00f5es est\u00e1 mais relacionada \u00e0 intensidade dos pensamentos intrusivos.",opcoes:[
{valor:0,texto:"Controle total"},
{valor:1,texto:"Bom controle: habitualmente capaz de interromper ou afastar as obsess\u00f5es com algum esfor\u00e7o e concentra\u00e7\u00e3o"},
{valor:2,texto:"Controle moderado: algumas vezes capaz de interromper ou afastar as obsess\u00f5es"},
{valor:3,texto:"Controle leve: raramente bem-sucedido; consegue somente desviar a aten\u00e7\u00e3o com dificuldade"},
{valor:4,texto:"Nenhum controle: obsess\u00f5es experimentadas como completamente involunt\u00e1rias; raramente capaz de desviar seus pensamentos obsessivos"}
]}
];

var COMP = [
{num:6,titulo:"Tempo gasto com Comportamentos Compulsivos",pergunta:"Quanto tempo voc\u00ea gasta fazendo essas coisas (manias/h\u00e1bitos)?",nota:"Quando os rituais mais importantes est\u00e3o relacionados \u00e0s atividades do dia a dia, pergunte: quanto tempo a mais voc\u00ea usa para executar suas atividades rotineiras por causa de seus rituais?",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: passa menos de 1 hora/dia realizando compuls\u00f5es, ou execu\u00e7\u00e3o ocasional"},
{valor:2,texto:"Moderado: passa 1 a 3 horas/dia realizando compuls\u00f5es, ou execu\u00e7\u00e3o frequente"},
{valor:3,texto:"Grave: passa de 3 a 8 horas/dia realizando compuls\u00f5es, ou execu\u00e7\u00e3o muito frequente"},
{valor:4,texto:"Muito grave: passa mais de 8 horas/dia realizando compuls\u00f5es, ou execu\u00e7\u00e3o quase constante"}
]},
{num:7,titulo:"Interfer\u00eancia provocada pelos Comportamentos Compulsivos",pergunta:"Quanto esses h\u00e1bitos/manias atrapalham no caminho da escola ou quando voc\u00ea est\u00e1 fazendo alguma coisa/brincando com seus amigos?",nota:"Se n\u00e3o estiver frequentando a escola no momento, avalie at\u00e9 que ponto o desempenho seria afetado se o paciente estivesse na escola.",opcoes:[
{valor:0,texto:"Nenhuma"},
{valor:1,texto:"Alguma: leve interfer\u00eancia nas atividades, mas o desempenho global n\u00e3o est\u00e1 deteriorado"},
{valor:2,texto:"Moderada: clara interfer\u00eancia no desempenho social ou ocupacional, mas conseguindo ainda desempenhar"},
{valor:3,texto:"Grave: deteriora\u00e7\u00e3o consider\u00e1vel no desempenho social ou ocupacional"},
{valor:4,texto:"Muito grave: incapacitante"}
]},
{num:8,titulo:"Sofrimento relacionado ao Comportamento Compulsivo",pergunta:"Como voc\u00ea se sentiria se fosse impedido de fazer suas manias/h\u00e1bitos? Quanto isso deixaria voc\u00ea aborrecido/chateado?",nota:"Avalie o grau de mal-estar que o paciente teria se a execu\u00e7\u00e3o da compuls\u00e3o fosse repentinamente interrompida sem previamente ter sido reassegurada.",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: ligeiramente ansioso se as compuls\u00f5es forem interrompidas, ou ligeiramente ansioso durante a sua execu\u00e7\u00e3o"},
{valor:2,texto:"Moderado: ansiedade sobe a um n\u00edvel control\u00e1vel se as compuls\u00f5es forem interrompidas, ou ansiedade control\u00e1vel durante a sua execu\u00e7\u00e3o"},
{valor:3,texto:"Intenso: aumento proeminente e muito perturbador da ansiedade se as compuls\u00f5es forem interrompidas, ou muito perturbador durante a sua execu\u00e7\u00e3o"},
{valor:4,texto:"Muito intenso: ansiedade incapacitante por qualquer interven\u00e7\u00e3o que vise modificar as compuls\u00f5es, ou ansiedade incapacitante durante a execu\u00e7\u00e3o"}
]},
{num:9,titulo:"Resist\u00eancia \u00e0s Compuls\u00f5es",pergunta:"Quanto voc\u00ea se esfor\u00e7a para brigar com os/as h\u00e1bitos/manias?",nota:"Avalie somente o esfor\u00e7o feito para resistir, n\u00e3o o sucesso/fracasso que tem ao tentar controlar as compuls\u00f5es. Se as compuls\u00f5es s\u00e3o m\u00ednimas, o paciente pode n\u00e3o sentir necessidade de resistir. Em tais casos, o escore 0 deve ser dado.",opcoes:[
{valor:0,texto:"Faz sempre esfor\u00e7o para resistir, ou sintomas m\u00ednimos que n\u00e3o necessitam de resist\u00eancia ativa"},
{valor:1,texto:"Tenta resistir na maior parte das vezes"},
{valor:2,texto:"Faz algum esfor\u00e7o para resistir"},
{valor:3,texto:"Cede a todas as compuls\u00f5es sem tentar control\u00e1-las, ainda que fa\u00e7a isso com alguma relut\u00e2ncia"},
{valor:4,texto:"Cede completamente a todas as compuls\u00f5es de modo volunt\u00e1rio"}
]},
{num:10,titulo:"Grau de controle sobre o Comportamento Compulsivo",pergunta:"Qual \u00e9 a for\u00e7a da sensa\u00e7\u00e3o que voc\u00ea tem para fazer seus h\u00e1bitos/manias? Quando voc\u00ea tenta brigar com eles, o que acontece?",nota:"A capacidade do paciente em controlar as suas compuls\u00f5es est\u00e1 mais relacionada \u00e0 intensidade das compuls\u00f5es.",opcoes:[
{valor:0,texto:"Controle total"},
{valor:1,texto:"Bom controle: sente-se pressionado a realizar as compuls\u00f5es, mas tem algum controle volunt\u00e1rio"},
{valor:2,texto:"Controle moderado: sente-se fortemente pressionado a realizar as compuls\u00f5es e somente consegue control\u00e1-las com dificuldade"},
{valor:3,texto:"Controle leve: press\u00e3o forte para executar as compuls\u00f5es; o comportamento compulsivo tem que ser executado at\u00e9 o fim e somente com dificuldade consegue retardar a execu\u00e7\u00e3o"},
{valor:4,texto:"Nenhum controle: a press\u00e3o para realizar as compuls\u00f5es \u00e9 experimentada como completamente dominadora e involunt\u00e1ria; raramente capaz de retardar a execu\u00e7\u00e3o"}
]}
];

var COMPL = [
{num:11,titulo:"Cr\u00edtica sobre as Obsess\u00f5es e Compuls\u00f5es",pergunta:"Voc\u00ea acha que as ideias ou h\u00e1bitos fazem sentido? O que voc\u00ea pensa que poderia acontecer se voc\u00ea n\u00e3o fizesse seus h\u00e1bitos/manias? Voc\u00ea tem medo de que alguma coisa possa acontecer de verdade?",nota:"Avalie a cr\u00edtica do paciente a prop\u00f3sito da falta de sentido ou do exagero das suas obsess\u00f5es, baseado nas cren\u00e7as expressas durante a entrevista.",opcoes:[
{valor:0,texto:"Excelente cr\u00edtica: completamente racional"},
{valor:1,texto:"Boa cr\u00edtica: reconhece prontamente o absurdo ou o exagero, mas n\u00e3o parece completamente convencido de que existe apenas a ansiedade como motivo de preocupa\u00e7\u00e3o"},
{valor:2,texto:"Cr\u00edtica razo\u00e1vel: admite com relut\u00e2ncia que o pensamento ou o comportamento s\u00e3o absurdos, mas hesita"},
{valor:3,texto:"Cr\u00edtica pobre: afirma que o pensamento ou o comportamento s\u00e3o razo\u00e1veis ou n\u00e3o exagerados, mas reconhece a validade da evid\u00eancia em contr\u00e1rio"},
{valor:4,texto:"Aus\u00eancia de cr\u00edtica: delirante. Convicto de que suas preocupa\u00e7\u00f5es e comportamentos s\u00e3o razo\u00e1veis; n\u00e3o \u00e9 sens\u00edvel \u00e0 evid\u00eancia em contr\u00e1rio"}
]},
{num:12,titulo:"Evita\u00e7\u00e3o",pergunta:"Voc\u00ea n\u00e3o est\u00e1 fazendo coisas, n\u00e3o est\u00e1 indo a determinados lugares, ou n\u00e3o fica com ningu\u00e9m por causa dos seus pensamentos ou manias?",nota:"Avalie at\u00e9 que ponto o paciente deliberadamente tenta evitar. Rituais de lavagem de roupa s\u00e3o designados como compuls\u00f5es, n\u00e3o como comportamento de evita\u00e7\u00e3o.",opcoes:[
{valor:0,texto:"Sem evita\u00e7\u00e3o deliberada"},
{valor:1,texto:"Leve: m\u00ednima"},
{valor:2,texto:"Moderada: alguma evita\u00e7\u00e3o claramente presente"},
{valor:3,texto:"Intensa: grande evita\u00e7\u00e3o; proeminente"},
{valor:4,texto:"Muito intensa: evita\u00e7\u00e3o muito acentuada; o paciente faz quase tudo que pode para evitar os sintomas desencadeadores"}
]},
{num:13,titulo:"Grau de indecis\u00e3o",pergunta:"Voc\u00ea tem problema em tomar decis\u00f5es sobre alguma coisinha que as outras crian\u00e7as n\u00e3o precisariam pensar duas vezes para fazer?",nota:"Exclua a dificuldade em tomar decis\u00f5es por pensamento ruminativo. Exclua igualmente a ambival\u00eancia relacionada com escolhas que racionalmente s\u00e3o dif\u00edceis de ser tomadas.",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: alguma dificuldade em tomar decis\u00f5es sobre assuntos de pouca import\u00e2ncia"},
{valor:2,texto:"Moderado: relata espontaneamente dificuldades em tomar decis\u00f5es que outras pessoas n\u00e3o pensariam duas vezes"},
{valor:3,texto:"Intenso: pondera continuamente os pr\u00f3s e os contras sobre o que n\u00e3o \u00e9 essencial"},
{valor:4,texto:"Muito intenso: incapaz de tomar decis\u00f5es, grau de indecis\u00e3o incapacitante"}
]},
{num:14,titulo:"Senso de responsabilidade Hipervalorizado",pergunta:"Voc\u00ea se sente culpado por coisas que n\u00e3o consegue mudar ou n\u00e3o pode fazer muita coisa? Voc\u00ea se sente culpado pelo que acontece para outras pessoas?",nota:"Distinguir dos sentimentos normais de responsabilidade, de sentimentos de desvaloriza\u00e7\u00e3o e de d\u00favida patol\u00f3gica.",opcoes:[
{valor:0,texto:"Nenhum"},
{valor:1,texto:"Leve: menciona, s\u00f3 se questionado a esse prop\u00f3sito; leve senso de hiper-responsabilidade"},
{valor:2,texto:"Moderado: relatado de maneira espont\u00e2nea, claramente presente; o paciente tem grande senso de hiper-responsabilidade"},
{valor:3,texto:"Intenso: ideias proeminentes e persuasivas; profundamente preocupado em sentir responsabilidade por acontecimentos fora de seu controle volunt\u00e1rio"},
{valor:4,texto:"Extremo: senso de responsabilidade delirante (ex.: o paciente recrimina-se pela ocorr\u00eancia de um terremoto)"}
]},
{num:15,titulo:"Lentifica\u00e7\u00e3o / Transtorno de In\u00e9rcia",pergunta:"Voc\u00ea tem dificuldade em come\u00e7ar ou acabar suas coisas porque tem que faz\u00ea-las com muito cuidado? As coisas do seu dia a dia demoram mais tempo do que deveriam?",nota:"Distinguir de lentid\u00e3o psicomotora secund\u00e1ria \u00e0 depress\u00e3o. Avalie o aumento do tempo gasto para executar as atividades rotineiras.",opcoes:[
{valor:0,texto:"Nenhuma"},
{valor:1,texto:"Leve: demora ocasional em come\u00e7ar ou terminar"},
{valor:2,texto:"Moderada: prolongamento frequente das atividades rotineiras, mas habitualmente completa as tarefas"},
{valor:3,texto:"Intensa: dificuldade acentuada e abrangente em iniciar e completar as atividades rotineiras. Habitualmente atrasado"},
{valor:4,texto:"Extrema: incapaz de iniciar ou completar atividades rotineiras sem uma grande ajuda"}
]},
{num:16,titulo:"D\u00favida Patol\u00f3gica",pergunta:"Voc\u00ea acha que voc\u00ea n\u00e3o confia na sua mem\u00f3ria ou nos pr\u00f3prios olhos ou ouvidos?",nota:"Distinguir da incerteza normal. Avalie a presen\u00e7a de d\u00favida patol\u00f3gica em rela\u00e7\u00e3o \u00e0 mem\u00f3ria e percep\u00e7\u00e3o.",opcoes:[
{valor:0,texto:"Nenhuma"},
{valor:1,texto:"Leve: s\u00f3 mencionada se questionado; leve d\u00favida patol\u00f3gica. Os exemplos fornecidos encontram-se dentro dos par\u00e2metros normais"},
{valor:2,texto:"Moderada: relata-a espontaneamente; claramente presente e aparente em alguns comportamentos do paciente"},
{valor:3,texto:"Intensa: incerteza proeminente a respeito da mem\u00f3ria ou da percep\u00e7\u00e3o; d\u00favida patol\u00f3gica afeta o desempenho frequentemente"},
{valor:4,texto:"Extrema: incerteza a respeito da percep\u00e7\u00e3o, constantemente presente; d\u00favida patol\u00f3gica afeta substancialmente quase todas as atividades. Incapacitante"}
]}
];

    var TODOS = OBS.concat(COMP);
    var DIM = [[1, 6, 'Tempo ocupado'], [2, 7, 'Interfer\u00eancia'], [3, 8, 'Sofrimento'], [4, 9, 'Resist\u00eancia'], [5, 10, 'Controle']];
    var FAIXAS = [
        {de: 0, ate: 7, nome: 'Subcl\u00ednico', rot: '0 a 7', fundo: '#eceff1', borda: '#607d8b', cor: '#37474f'},
        {de: 8, ate: 15, nome: 'Leve', rot: '8 a 15', fundo: '#e3f2fd', borda: '#1e88e5', cor: '#0d47a1'},
        {de: 16, ate: 23, nome: 'Moderado', rot: '16 a 23', fundo: '#fff8e1', borda: '#f9a825', cor: '#8a5a00'},
        {de: 24, ate: 31, nome: 'Grave', rot: '24 a 31', fundo: '#ffe0b2', borda: '#fb8c00', cor: '#bf5600'},
        {de: 32, ate: 40, nome: 'Muito grave', rot: '32 a 40', fundo: '#ffccbc', borda: '#e64a19', cor: '#9c2c0c'}
    ];
    var AZ = '#1565c0', TOTMAX = 40;
    var REFS = [
        'Escala Yale-Brown de Obsess\u00f5es e Compuls\u00f5es - vers\u00e3o para crian\u00e7as (CY-BOCS): tradu\u00e7\u00e3o para o portugu\u00eas que circula na pr\u00e1tica cl\u00ednica brasileira. Autoria e dados de publica\u00e7\u00e3o n\u00e3o confirmados (o site citava ASBAHR, F. R., 1999, tamb\u00e9m n\u00e3o reconfirmado).',
        'SCAHILL, L.; RIDDLE, M. A.; McSWIGGIN-HARDIN, M.; ORT, S. I.; KING, R. A.; GOODMAN, W. K. et al. Children\'s Yale-Brown Obsessive Compulsive Scale: reliability and validity. Journal of the American Academy of Child and Adolescent Psychiatry, v. 36, n. 6, p. 844-852, 1997.',
        'GOODMAN, W. K.; RASMUSSEN, S. A.; PRICE, L. H.; RIDDLE, M. A.; RAPOPORT, J. L. Children\'s Yale-Brown Obsessive-Compulsive Scale (CY-BOCS). New Haven, CT: Yale University, 1986. (Instrumento; dados conforme cita\u00e7\u00e3o anterior do site.)',
        'LEWIN, A. B.; PIACENTINI, J.; DE NADAI, A. S.; JONES, A. M.; PERIS, T. S.; GEFFKEN, G. R.; GELLER, D. A.; NADEAU, J. M.; MURPHY, T. K.; STORCH, E. A. Defining clinical severity in pediatric obsessive-compulsive disorder. Psychological Assessment, v. 26, n. 2, p. 679-684, 2014.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'A CY-BOCS \u00e9 uma escala de gravidade, aplicada em entrevista cl\u00ednica semiestruturada; pressup\u00f5e que o diagn\u00f3stico de TOC j\u00e1 foi estabelecido e n\u00e3o serve para rastrear nem para diagnosticar. Esta vers\u00e3o traz a escala de gravidade (10 itens) e os itens complementares; n\u00e3o inclui a Lista de Sintomas da CY-BOCS. As faixas (0-7, 8-15, 16-23, 24-31 e 32-40) s\u00e3o as da Y-BOCS para adultos, usadas na pr\u00e1tica com a CY-BOCS, e n\u00e3o foram validadas para crian\u00e7as e adolescentes; Lewin et al. (2014) propuseram faixas emp\u00edricas para jovens e alertam que elas n\u00e3o devem ser usadas para rastreio. Os itens 11 a 16 n\u00e3o entram no total. Os resultados devem ser interpretados por profissional qualificado, no contexto da avalia\u00e7\u00e3o cl\u00ednica completa.';

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function chave(n) { return (n <= 5 ? 'obs' : (n <= 10 ? 'comp' : 'compl')) + n; }
    function acha(n) { for (var i = 0; i < TODOS.length; i++) { if (TODOS[i].num === n) return TODOS[i]; } for (i = 0; i < COMPL.length; i++) { if (COMPL[i].num === n) return COMPL[i]; } return null; }
    function textoOpcao(n, v) { var it = acha(n); if (!it) return ''; for (var i = 0; i < it.opcoes.length; i++) { if (it.opcoes[i].valor === v) return it.opcoes[i].texto; } return ''; }

    // ===================== CALCULO =====================
    // resp: objeto {obs1..obs5, comp6..comp10 (obrigatorios, 0-4), compl11..compl16 (opcionais)}
    function calcular(resp) {
        if (!resp) throw new Error('CY-BOCS: sem respostas');
        var r = {v: {}, compl: {}, obs: 0, comp: 0, total: 0}, i, n, x;
        for (n = 1; n <= 10; n++) {
            x = parseInt(resp[chave(n)], 10);
            if (!(x >= 0 && x <= 4)) throw new Error('CY-BOCS: item principal invalido ' + n);
            r.v[n] = x;
            if (n <= 5) r.obs += x; else r.comp += x;
        }
        for (n = 11; n <= 16; n++) {
            x = resp[chave(n)];
            if (x === null || x === undefined || x === '') { r.compl[n] = null; continue; }
            x = parseInt(x, 10);
            if (!(x >= 0 && x <= 4)) throw new Error('CY-BOCS: item complementar invalido ' + n);
            r.compl[n] = x;
        }
        r.total = r.obs + r.comp;
        r.faixa = 0;
        for (i = 0; i < FAIXAS.length; i++) { if (r.total <= FAIXAS[i].ate) { r.faixa = i; break; } }
        return r;
    }
    function classifGeral(r) { return 'Soma ' + r.total + '/40 - faixa ' + FAIXAS[r.faixa].nome + ' (referencia Y-BOCS, nao validada para criancas)'; }
    function dadosPainel(r) {
        return {
            Obsessoes: {pontuacao: r.obs, max: 20, classificacao: Math.round(r.obs / 20 * 100) + '% do m\u00e1ximo'},
            Compulsoes: {pontuacao: r.comp, max: 20, classificacao: Math.round(r.comp / 20 * 100) + '% do m\u00e1ximo'}
        };
    }
    function respostasObj(r) {
        var o = {}, n;
        for (n = 1; n <= 10; n++) o[chave(n)] = r.v[n];
        for (n = 11; n <= 16; n++) { if (r.compl[n] !== null) o[chave(n)] = r.compl[n]; }
        return o;
    }
    function analise(r) {
        var out = [], fx = FAIXAS[r.faixa];
        out.push({t: 'Resultado', x: 'Soma total ' + r.total + ' de 40 (obsess\u00f5es ' + r.obs + ' de 20; compuls\u00f5es ' + r.comp + ' de 20), na faixa "' + fx.nome + '" (' + fx.rot + ') da refer\u00eancia da Y-BOCS. Essa faixa n\u00e3o foi validada para crian\u00e7as e adolescentes; use-a para acompanhar a evolu\u00e7\u00e3o e leia a gravidade junto com a entrevista cl\u00ednica.'});
        if (r.obs > r.comp + 5) out.push({t: 'Predom\u00ednio', x: 'As obsess\u00f5es pontuaram bem mais que as compuls\u00f5es (diferen\u00e7a de ' + (r.obs - r.comp) + ' pontos).'});
        else if (r.comp > r.obs + 5) out.push({t: 'Predom\u00ednio', x: 'As compuls\u00f5es pontuaram bem mais que as obsess\u00f5es (diferen\u00e7a de ' + (r.comp - r.obs) + ' pontos).'});
        var maiores = [];
        DIM.forEach(function (d) { var s = r.v[d[0]] + r.v[d[1]]; maiores.push({n: d[2], s: s}); });
        maiores.sort(function (a, b) { return b.s - a.s; });
        out.push({t: 'Dimens\u00f5es', x: 'As dimens\u00f5es com maior pontua\u00e7\u00e3o somada (obsess\u00e3o + compuls\u00e3o) foram: ' + maiores.slice(0, 2).map(function (m) { return m.n + ' (' + m.s + ' de 8)'; }).join(' e ') + '. Nos itens de resist\u00eancia, nota maior significa menos esfor\u00e7o para resistir.'});
        var temC = false, n;
        for (n = 11; n <= 16; n++) { if (r.compl[n] !== null) temC = true; }
        out.push({t: 'Itens complementares', x: temC ? 'Os itens 11 a 16 (cr\u00edtica, evita\u00e7\u00e3o, indecis\u00e3o, responsabilidade, lentifica\u00e7\u00e3o e d\u00favida patol\u00f3gica) n\u00e3o entram no total e servem como informa\u00e7\u00e3o cl\u00ednica adicional. No item 11, nota maior significa pior cr\u00edtica.' : 'Os itens complementares (11 a 16) n\u00e3o foram pontuados; eles n\u00e3o entram no total.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.cyv h2{color:' + AZ + ';margin-bottom:16px;text-align:center}' +
        '.cyv h3{color:' + AZ + ';margin:26px 0 10px;font-size:1.12em}' +
        '.cyv-cards{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}' +
        '.cyv-card{flex:1;min-width:120px;background:#fff;padding:14px;border-radius:10px;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.06);border-top:4px solid ' + AZ + '}' +
        '.cyv-card b{display:block;font-size:2em}' +
        '.cyv-res{padding:14px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.cyv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.cyv-bar{height:16px;background:#e0e0e0;border-radius:8px;margin:3px 0 8px}.cyv-bar>div{height:16px;border-radius:8px}' +
        '.cyv-faixas{display:flex;height:22px;border-radius:11px;overflow:hidden;margin:8px 0 4px;position:relative}.cyv-faixas>div{height:22px}' +
        '.cyv-pino{position:absolute;top:-5px;width:4px;height:32px;background:#000;border-radius:2px}' +
        '.cyv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.cyv-tab th{background:' + AZ + ';color:#fff;padding:7px 4px}.cyv-tab td{padding:6px;border-bottom:1px solid #eee;vertical-align:top}' +
        '.cyv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('cyv-css')) return;
        var st = document.createElement('style'); st.id = 'cyv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    function htmlTela(r) {
        injetarCSS();
        var i, n, fx = FAIXAS[r.faixa], h = '<div class="cyv"><h2>&#128203; Resultados &#8212; CY-BOCS</h2>';
        h += '<div class="cyv-cards"><div class="cyv-card"><small>Obsess\u00f5es</small><b>' + r.obs + '</b><small>de 20</small></div><div class="cyv-card"><small>Compuls\u00f5es</small><b>' + r.comp + '</b><small>de 20</small></div><div class="cyv-card" style="border-top-color:' + fx.borda + '"><small>Total</small><b>' + r.total + '</b><small>de 40</small></div></div>';
        h += '<div class="cyv-res" style="background:' + fx.fundo + ';border-color:' + fx.borda + ';color:' + fx.cor + '">Faixa de refer\u00eancia (Y-BOCS): ' + fx.nome + ' (' + fx.rot + ')<div style="font-size:.78em;font-weight:400">n\u00e3o validada para crian\u00e7as e adolescentes</div></div>';
        h += '<div class="cyv-box"><b>Faixas da refer\u00eancia</b><div class="cyv-faixas">';
        for (i = 0; i < FAIXAS.length; i++) { h += '<div style="width:' + ((FAIXAS[i].ate - FAIXAS[i].de + 1) / 41 * 100) + '%;background:' + FAIXAS[i].borda + ';opacity:' + (i === r.faixa ? 1 : 0.35) + '"></div>'; }
        h += '<div class="cyv-pino" style="left:calc(' + Math.min(99.5, (r.total + 0.5) / 41 * 100) + '% - 2px)"></div></div><div style="font-size:.8em;color:#555">';
        for (i = 0; i < FAIXAS.length; i++) h += '<span style="display:inline-block;margin-right:12px"><span style="display:inline-block;width:10px;height:10px;background:' + FAIXAS[i].borda + ';border-radius:2px"></span> ' + FAIXAS[i].nome + ' ' + FAIXAS[i].rot + '</span>';
        h += '</div></div>';
        h += '<h3>&#128202; Por dimens\u00e3o (0 a 4)</h3><div class="cyv-box">';
        DIM.forEach(function (d) {
            h += '<div><b>' + d[2] + '</b>: obsess\u00e3o ' + r.v[d[0]] + ' | compuls\u00e3o ' + r.v[d[1]] + '<div class="cyv-bar"><div style="width:' + Math.max(1, r.v[d[0]] / 4 * 100) + '%;background:#1565c0"></div></div><div class="cyv-bar" style="margin-top:-4px"><div style="width:' + Math.max(1, r.v[d[1]] / 4 * 100) + '%;background:#00897b"></div></div></div>';
        });
        h += '<div style="font-size:.8em;color:#666">azul: obsess\u00f5es; verde: compuls\u00f5es</div></div>';
        h += '<h3>&#128203; Respostas</h3><div style="overflow-x:auto"><table class="cyv-tab"><thead><tr><th>#</th><th style="text-align:left">Item e resposta escolhida</th><th>Pontos</th></tr></thead><tbody>';
        for (n = 1; n <= 10; n++) {
            var it = acha(n);
            h += '<tr><td style="text-align:center;font-weight:700">' + n + '</td><td><b>' + esc(it.titulo) + '</b><br><span style="color:#555">' + esc(textoOpcao(n, r.v[n])) + '</span></td><td style="text-align:center;font-weight:700">' + r.v[n] + '</td></tr>';
        }
        h += '<tr><td colspan="3" style="background:#eceff1;font-weight:700;color:#37474f">Itens complementares (n\u00e3o entram no total)</td></tr>';
        for (n = 11; n <= 16; n++) {
            var ic = acha(n);
            h += '<tr><td style="text-align:center;font-weight:700">' + n + '</td><td><b>' + esc(ic.titulo) + '</b>' + (r.compl[n] === null ? '<br><span style="color:#888">n\u00e3o pontuado</span>' : '<br><span style="color:#555">' + esc(textoOpcao(n, r.compl[n])) + '</span>') + '</td><td style="text-align:center;font-weight:700">' + (r.compl[n] === null ? '-' : r.compl[n]) + '</td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="cyv-box"><b>' + esc(an[i].t) + ':</b> ' + esc(an[i].x) + '</div>';
        h += '<div class="cyv-disc"><b>IMPORTANTE:</b> ' + esc(AVISO) + '</div></div>';
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
    function secao(c, t) { c.need(16); F(c.doc, AZ); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AZ); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f5f8fc'); D(doc, '#dde6f2'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function faixasPDF(c, r) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4, yb = c.y + 3, hb = 6, i;
        c.need(24);
        for (i = 0; i < FAIXAS.length; i++) {
            var x = x0 + w * FAIXAS[i].de / 41, wf = w * (FAIXAS[i].ate - FAIXAS[i].de + 1) / 41;
            F(doc, i === r.faixa ? FAIXAS[i].borda : '#e6e6e6'); doc.rect(x, yb, wf, hb, 'F');
        }
        var px = x0 + w * (r.total + 0.5) / 41;
        D(doc, '#000000'); doc.setLineWidth(1.0); doc.line(px, yb - 1.8, px, yb + hb + 1.8);
        doc.setFont(undefined, 'normal'); doc.setFontSize(6.6); T(doc, '#555555');
        for (i = 0; i < FAIXAS.length; i++) {
            doc.text(pt(FAIXAS[i].nome + ' ' + FAIXAS[i].rot), x0 + w * ((FAIXAS[i].de + FAIXAS[i].ate + 1) / 2) / 41, yb + hb + 4.2, {align: 'center'});
        }
        c.y += 21;
    }
    function dimPDF(c, r) {
        var doc = c.doc, x0 = ML + 2, w = CW - 4;
        DIM.forEach(function (d) {
            c.need(16);
            T(doc, '#222222'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6);
            doc.text(pt(d[2] + ': obsess\u00e3o ' + r.v[d[0]] + ' | compuls\u00e3o ' + r.v[d[1]] + ' (de 4)'), x0, c.y + 3.6);
            F(doc, '#e0e0e0'); doc.roundedRect(x0, c.y + 5, w, 3.4, 1.7, 1.7, 'F'); F(doc, '#1565c0'); doc.roundedRect(x0, c.y + 5, Math.max(1.5, w * r.v[d[0]] / 4), 3.4, 1.7, 1.7, 'F');
            F(doc, '#e0e0e0'); doc.roundedRect(x0, c.y + 9.4, w, 3.4, 1.7, 1.7, 'F'); F(doc, '#00897b'); doc.roundedRect(x0, c.y + 9.4, Math.max(1.5, w * r.v[d[1]] / 4), 3.4, 1.7, 1.7, 'F');
            c.y += 15;
        });
        T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text('azul: obsess\u00f5es | verde: compuls\u00f5es', x0, c.y + 1); c.y += 6;
    }

    function pdf(r, info) {
        info = info || {};
        var i, n, doc = new window.jspdf.jsPDF(), c = new Ctx(doc), fx = FAIXAS[r.faixa];
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#00897b'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('CY-BOCS - RELAT\u00d3RIO'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Escala Yale-Brown de Obsess\u00f5es e Compuls\u00f5es - vers\u00e3o para crian\u00e7as (gravidade)'), 105, 22, {align: 'center'});
        doc.text(pt('Entrevista cl\u00ednica semiestruturada | Goodman et al. (1986); Scahill et al. (1997)'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS DO PACIENTE', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        var bx = [[ML, 'OBSESS\u00d5ES', r.obs, 20, AZ], [ML + 62, 'COMPULS\u00d5ES', r.comp, 20, '#00897b'], [ML + 124, 'TOTAL', r.total, 40, fx.borda]];
        bx.forEach(function (b) {
            F(doc, '#f5f8fc'); doc.rect(b[0], c.y, 56, 22, 'F'); F(doc, b[4]); doc.rect(b[0], c.y, 56, 1.6, 'F');
            T(doc, '#555555'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(pt(b[1]), b[0] + 28, c.y + 7, {align: 'center'});
            T(doc, '#111111'); doc.setFontSize(16); doc.text(String(b[2]), b[0] + 28, c.y + 15, {align: 'center'});
            T(doc, '#777777'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.5); doc.text('de ' + b[3], b[0] + 28, c.y + 20, {align: 'center'});
        });
        c.y += 28;
        F(doc, fx.fundo); doc.rect(ML, c.y, CW, 15, 'F'); D(doc, fx.borda); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 15, 'S');
        T(doc, fx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(10.5); doc.text(pt('Faixa de refer\u00eancia (Y-BOCS): ' + fx.nome + ' (' + fx.rot + ')'), 105, c.y + 6.5, {align: 'center'});
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8); doc.text(pt('faixa n\u00e3o validada para crian\u00e7as e adolescentes'), 105, c.y + 11.5, {align: 'center'});
        c.y += 21;

        secao(c, 'FAIXAS DA REFER\u00caNCIA');
        faixasPDF(c, r);
        secao(c, 'POR DIMENS\u00c3O (0 A 4)');
        dimPDF(c, r);

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

        c.need(50);
        secao(c, 'RESPOSTAS');
        var cn = 8, ct = 156, xT = ML;
        F(doc, AZ); doc.rect(xT, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.4);
        doc.text('#', xT + cn / 2, c.y + 4.7, {align: 'center'}); doc.text('Item e resposta escolhida', xT + cn + 2, c.y + 4.7); doc.text('Pontos', xT + cn + ct + 8, c.y + 4.7, {align: 'center'});
        c.y += 7;
        for (n = 1; n <= 16; n++) {
            if (n === 11) { c.need(14); F(doc, '#eceff1'); doc.rect(xT, c.y, CW, 5.6, 'F'); T(doc, '#37474f'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6); doc.text('ITENS COMPLEMENTARES (N\u00c3O ENTRAM NO TOTAL)', xT + 2, c.y + 4); c.y += 5.6; }
            var it = acha(n), val = n <= 10 ? r.v[n] : r.compl[n];
            var tx = val === null ? 'n\u00e3o pontuado' : textoOpcao(n, val);
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.2);
            var ln = doc.splitTextToSize(pt(tx), ct - 3), rh = 4.2 + ln.length * 3.1 + 2.2;
            c.need(rh);
            if (n % 2 === 1) { F(doc, '#f5f8fc'); doc.rect(xT, c.y, CW, rh, 'F'); }
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6); doc.text(String(n), xT + cn / 2, c.y + 4, {align: 'center'}); doc.text(pt(it.titulo), xT + cn + 2, c.y + 4);
            T(doc, '#444444'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.2); doc.text(ln, xT + cn + 2, c.y + 7.6);
            T(doc, '#000000'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(val === null ? '-' : String(val), xT + cn + ct + 8, c.y + rh / 2 + 1.2, {align: 'center'});
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
            doc.text('SYM Online | CY-BOCS | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('CY-BOCS_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'CY-BOCS' || !d.respostas) return false;
        var res;
        try { res = calcular(d.respostas); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_CYBOCS = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral,
        respostasObj: respostasObj, OBS: OBS, COMP: COMP, COMPL: COMPL, FAIXAS: FAIXAS};
})();
