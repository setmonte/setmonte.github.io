// ============================================================
// ETDAH-PAIS - Correcao Automatica (Item a Item)
// Escala de Avaliacao de Comportamentos Infantojuvenis no TDAH
// em Ambiente Familiar - Versao para Pais (Benczik, 2018)
// 58 itens, 4 fatores, escala Likert 1-6
// ============================================================

// === ITENS POR FATOR ===
// Cada item: {num: numero na folha, texto: descricao, invertido: bool}
// invertido = true significa que a pontuacao e invertida (1->6, 2->5, 3->4, 4->3, 5->2, 6->1)

var _etdahFator1 = [
  {num:1,texto:'E sensivel'},
  {num:2,texto:'E agressivo'},
  {num:3,texto:'Muda facilmente de humor'},
  {num:4,texto:'Tem dificuldades para se adaptar as mudancas'},
  {num:5,texto:'Implica com tudo'},
  {num:6,texto:'Tem fortes reacoes emocionais (explosoes de raiva)'},
  {num:7,texto:'Faz birra quando quer algo'},
  {num:8,texto:'Sente-se infeliz'},
  {num:9,texto:'Da a impressao de estar sempre insatisfeito (nada o agrada)'},
  {num:10,texto:'Implica com os irmaos'},
  {num:11,texto:'E irritadico (tudo o incomoda)'},
  {num:12,texto:'E rebelde (nao aceita nada)'},
  {num:13,texto:'As atividades e reunioes familiares sao desagradaveis'},
  {num:14,texto:'Todos tem que fazer o que ele quer'},
  {num:15,texto:'Mostra-se tenso e rigido'},
  {num:16,texto:'Explode com facilidade (e do tipo pavio curto)'},
  {num:17,texto:'Exige mais tempo e atencao dos pais do que os outros filhos'},
  {num:18,texto:'A hora de acordar e das refeicoes e desagradavel'},
  {num:19,texto:'Faz amizade, mas nao consegue mante-la'}
];

var _etdahFator2 = [
  {num:1,texto:'Movimenta-se muito (parece estar ligado com um motor ou a todo vapor)'},
  {num:2,texto:'E inquieto e agitado'},
  {num:3,texto:'Tem sempre muita pressa'},
  {num:4,texto:'Mexe-se e contorce-se durante as refeicoes e para realizar as tarefas de casa'},
  {num:5,texto:'Age sem pensar (e impulsivo)'},
  {num:6,texto:'Responde antes de ouvir a pergunta inteira'},
  {num:7,texto:'E imprudente'},
  {num:8,texto:'E persistente e insiste diante de uma ideia'},
  {num:9,texto:'E inconsequente (nao considera os perigos da situacao)'},
  {num:10,texto:'Intromete-se em assuntos que nao lhe dizem respeito'},
  {num:11,texto:'Irrita os outros com suas palhacadas'},
  {num:12,texto:'Faz os deveres escolares rapido demais'},
  {num:13,texto:'Tende a discordar com as regras e normas de jogos'}
];

var _etdahFator3 = [
  {num:1,texto:'A crianca permite que o ambiente familiar seja tranquilo e harmonioso',invertido:true},
  {num:2,texto:'Obedece aos pais e as normas da casa',invertido:true},
  {num:3,texto:'Consegue expressar claramente os seus pensamentos',invertido:true},
  {num:4,texto:'Sabe aguardar sua vez (e paciente)',invertido:true},
  {num:5,texto:'Aceita facilmente regras, normas e limites',invertido:true},
  {num:6,texto:'Fala pouco',invertido:true},
  {num:7,texto:'E atento quando conversa com alguem',invertido:true},
  {num:8,texto:'Parece ser uma crianca/adolescente tranquila e sossegada',invertido:true},
  {num:9,texto:'E tolerante, quando preciso',invertido:true},
  {num:10,texto:'Faz as coisas com muito cuidado, prevendo todos os riscos de suas acoes',invertido:true},
  {num:11,texto:'Faz suas tarefas e almoca com bastante tranquilidade',invertido:true},
  {num:12,texto:'Seu comportamento e adequado socialmente',invertido:true},
  {num:13,texto:'Respeita normas e regras',invertido:true},
  {num:14,texto:'E obediente',invertido:true}
];

var _etdahFator4 = [
  {num:1,texto:'E independente para realizar as suas tarefas de casa',invertido:true},
  {num:2,texto:'E distraido com quase tudo'},
  {num:3,texto:'Parece sonhar acordado (estar no mundo da lua)'},
  {num:4,texto:'Inicia uma atividade com entusiasmo e dificilmente chega ao final (e do tipo fogo de palha)'},
  {num:5,texto:'Mostra-se concentrado apenas em atividades de seu interesse'},
  {num:6,texto:'Tem dificuldade para realizar as coisas importantes (licao, por exemplo)'},
  {num:7,texto:'Da a impressao de que nao ouve bem (so escuta o que quer)'},
  {num:8,texto:'Evita atividades que exigem esforco mental constante (deveres escolares, jogos)'},
  {num:9,texto:'Esquece rapido o que acabou de ser dito'},
  {num:10,texto:'Dificilmente observa detalhes'},
  {num:11,texto:'Nao termina o que comeca'},
  {num:12,texto:'Ocorrem discussoes entre os pais e a crianca, em funcao da falta de responsabilidade e da falta de senso de dever'}
];

// === TABELAS NORMATIVAS ===
var _etdahNormaGeral = [
  {p:1,g:72,f1:20,f2:15,f3:18,f4:12},{p:5,g:101,f1:25,f2:18,f3:25,f4:15},
  {p:10,g:107,f1:28,f2:21,f3:32,f4:17},{p:15,g:115,f1:30,f2:23,f3:35,f4:19},
  {p:20,g:121,f1:31,f2:25,f3:37,f4:21},{p:25,g:129,f1:33,f2:26,f3:40,f4:22},
  {p:30,g:133,f1:35,f2:27,f3:42,f4:23},{p:35,g:139,f1:36,f2:28,f3:44,f4:24},
  {p:40,g:144,f1:38,f2:29,f3:46,f4:26},{p:45,g:148,f1:40,f2:30,f3:48,f4:27},
  {p:50,g:153,f1:42,f2:32,f3:49,f4:29},{p:55,g:159,f1:45,f2:34,f3:51,f4:30},
  {p:60,g:166,f1:47,f2:35,f3:53,f4:32},{p:65,g:170,f1:49,f2:37,f3:54,f4:34},
  {p:70,g:177,f1:51,f2:40,f3:55,f4:35},{p:75,g:187,f1:53,f2:42,f3:57,f4:36},
  {p:80,g:193,f1:56,f2:44,f3:60,f4:39},{p:85,g:207,f1:61,f2:49,f3:61,f4:41},
  {p:90,g:218,f1:68,f2:56,f3:65,f4:46},{p:95,g:238,f1:78,f2:66,f3:69,f4:51},
  {p:99,g:266,f1:95,f2:74,f3:74,f4:64}
];

var _etdahNormaFem2a5 = [
  {p:1,g:106,f1:23,f2:21,f3:20,f4:13},{p:5,g:107,f1:24,f2:21,f3:21,f4:13},
  {p:10,g:116,f1:33,f2:22,f3:29,f4:13},{p:15,g:119,f1:35,f2:24,f3:37,f4:16},
  {p:20,g:127,f1:36,f2:25,f3:37,f4:19},{p:25,g:131,f1:37,f2:28,f3:38,f4:20},
  {p:30,g:134,f1:39,f2:29,f3:40,f4:21},{p:35,g:137,f1:41,f2:30,f3:45,f4:21},
  {p:40,g:140,f1:42,f2:31,f3:46,f4:23},{p:45,g:152,f1:45,f2:33,f3:46,f4:24},
  {p:50,g:155,f1:47,f2:34,f3:47,f4:25},{p:55,g:160,f1:49,f2:34,f3:48,f4:26},
  {p:60,g:174,f1:53,f2:35,f3:51,f4:28},{p:65,g:180,f1:53,f2:38,f3:59,f4:29},
  {p:70,g:191,f1:53,f2:42,f3:60,f4:30},{p:75,g:197,f1:54,f2:54,f3:61,f4:31},
  {p:80,g:209,f1:58,f2:67,f3:63,f4:36},{p:85,g:217,f1:62,f2:73,f3:66,f4:49},
  {p:90,g:244,f1:65,f2:74,f3:72,f4:53},{p:95,g:253,f1:77,f2:74,f3:78,f4:53},
  {p:99,g:253,f1:77,f2:74,f3:78,f4:53}
];
var _etdahNormaFem6a9 = [
  {p:1,g:88,f1:23,f2:18,f3:21,f4:15},{p:5,g:96,f1:25,f2:18,f3:22,f4:16},
  {p:10,g:108,f1:30,f2:20,f3:27,f4:18},{p:15,g:113,f1:32,f2:24,f3:28,f4:22},
  {p:20,g:124,f1:35,f2:25,f3:29,f4:23},{p:25,g:128,f1:37,f2:27,f3:35,f4:24},
  {p:30,g:135,f1:43,f2:27,f3:40,f4:24},{p:35,g:137,f1:44,f2:27,f3:44,f4:26},
  {p:40,g:144,f1:45,f2:29,f3:47,f4:26},{p:45,g:146,f1:45,f2:30,f3:49,f4:26},
  {p:50,g:162,f1:46,f2:31,f3:51,f4:27},{p:55,g:170,f1:47,f2:33,f3:55,f4:27},
  {p:60,g:176,f1:49,f2:34,f3:56,f4:30},{p:65,g:185,f1:55,f2:34,f3:57,f4:32},
  {p:70,g:187,f1:55,f2:43,f3:57,f4:32},{p:75,g:191,f1:57,f2:47,f3:59,f4:33},
  {p:80,g:193,f1:61,f2:51,f3:60,f4:35},{p:85,g:196,f1:65,f2:53,f3:61,f4:35},
  {p:90,g:211,f1:66,f2:53,f3:65,f4:37},{p:95,g:228,f1:77,f2:59,f3:71,f4:43},
  {p:99,g:228,f1:77,f2:59,f3:71,f4:43}
];
var _etdahNormaFem10a13 = [
  {p:1,g:80,f1:20,f2:14,f3:15,f4:12},{p:5,g:87,f1:22,f2:16,f3:17,f4:12},
  {p:10,g:97,f1:27,f2:18,f3:26,f4:13},{p:15,g:101,f1:29,f2:20,f3:30,f4:17},
  {p:20,g:106,f1:30,f2:20,f3:33,f4:19},{p:25,g:117,f1:30,f2:22,f3:36,f4:21},
  {p:30,g:123,f1:36,f2:23,f3:39,f4:21},{p:35,g:129,f1:39,f2:25,f3:43,f4:22},
  {p:40,g:135,f1:39,f2:25,f3:43,f4:23},{p:45,g:139,f1:41,f2:25,f3:44,f4:25},
  {p:50,g:143,f1:41,f2:26,f3:47,f4:25},{p:55,g:145,f1:43,f2:27,f3:49,f4:26},
  {p:60,g:156,f1:48,f2:29,f3:50,f4:32},{p:65,g:159,f1:49,f2:29,f3:53,f4:34},
  {p:70,g:176,f1:51,f2:30,f3:54,f4:35},{p:75,g:190,f1:53,f2:32,f3:56,f4:37},
  {p:80,g:195,f1:56,f2:38,f3:57,f4:39},{p:85,g:199,f1:66,f2:44,f3:59,f4:46},
  {p:90,g:208,f1:77,f2:47,f3:60,f4:53},{p:95,g:239,f1:84,f2:58,f3:70,f4:60},
  {p:99,g:239,f1:84,f2:58,f3:70,f4:60}
];
var _etdahNormaFem14a17 = [
  {p:1,g:72,f1:25,f2:16,f3:18,f4:12},{p:5,g:72,f1:25,f2:16,f3:18,f4:12},
  {p:10,g:78,f1:25,f2:16,f3:19,f4:12},{p:15,g:87,f1:26,f2:17,f3:22,f4:13},
  {p:20,g:95,f1:26,f2:19,f3:24,f4:14},{p:25,g:102,f1:28,f2:21,f3:28,f4:15},
  {p:30,g:109,f1:29,f2:21,f3:35,f4:17},{p:35,g:111,f1:33,f2:22,f3:36,f4:17},
  {p:40,g:112,f1:33,f2:24,f3:36,f4:21},{p:45,g:115,f1:34,f2:24,f3:37,f4:22},
  {p:50,g:117,f1:35,f2:24,f3:38,f4:23},{p:55,g:118,f1:36,f2:26,f3:39,f4:24},
  {p:60,g:122,f1:36,f2:29,f3:40,f4:24},{p:65,g:131,f1:37,f2:29,f3:41,f4:26},
  {p:70,g:144,f1:37,f2:31,f3:42,f4:29},{p:75,g:148,f1:38,f2:33,f3:45,f4:31},
  {p:80,g:149,f1:39,f2:34,f3:47,f4:33},{p:85,g:157,f1:40,f2:35,f3:49,f4:36},
  {p:90,g:170,f1:46,f2:38,f3:55,f4:38},{p:95,g:170,f1:46,f2:38,f3:55,f4:38},
  {p:99,g:170,f1:46,f2:38,f3:55,f4:38}
];

var _etdahNormaMasc2a5 = [
  {p:1,g:115,f1:30,f2:23,f3:38,f4:19},{p:5,g:115,f1:30,f2:23,f3:38,f4:19},
  {p:10,g:115,f1:31,f2:25,f3:38,f4:21},{p:15,g:137,f1:31,f2:25,f3:44,f4:21},
  {p:20,g:151,f1:33,f2:26,f3:47,f4:21},{p:25,g:157,f1:37,f2:26,f3:48,f4:23},
  {p:30,g:159,f1:39,f2:28,f3:49,f4:24},{p:35,g:161,f1:39,f2:33,f3:51,f4:25},
  {p:40,g:163,f1:40,f2:37,f3:52,f4:25},{p:45,g:165,f1:40,f2:39,f3:54,f4:26},
  {p:50,g:166,f1:43,f2:40,f3:55,f4:27},{p:55,g:168,f1:47,f2:41,f3:55,f4:30},
  {p:60,g:168,f1:47,f2:45,f3:56,f4:32},{p:65,g:169,f1:48,f2:47,f3:57,f4:33},
  {p:70,g:171,f1:50,f2:48,f3:58,f4:34},{p:75,g:175,f1:51,f2:50,f3:59,f4:35},
  {p:80,g:183,f1:53,f2:53,f3:62,f4:35},{p:85,g:197,f1:56,f2:55,f3:65,f4:36},
  {p:90,g:211,f1:57,f2:59,f3:67,f4:37},{p:95,g:211,f1:57,f2:59,f3:67,f4:37},
  {p:99,g:211,f1:57,f2:59,f3:67,f4:37}
];
var _etdahNormaMasc6a9 = [
  {p:1,g:102,f1:22,f2:21,f3:34,f4:15},{p:5,g:106,f1:24,f2:22,f3:34,f4:16},
  {p:10,g:115,f1:28,f2:23,f3:35,f4:17},{p:15,g:118,f1:30,f2:24,f3:37,f4:18},
  {p:20,g:129,f1:30,f2:26,f3:39,f4:20},{p:25,g:133,f1:31,f2:28,f3:42,f4:22},
  {p:30,g:137,f1:33,f2:29,f3:44,f4:24},{p:35,g:143,f1:36,f2:30,f3:46,f4:25},
  {p:40,g:145,f1:37,f2:30,f3:48,f4:31},{p:45,g:151,f1:37,f2:32,f3:48,f4:31},
  {p:50,g:153,f1:41,f2:34,f3:49,f4:34},{p:55,g:154,f1:45,f2:34,f3:49,f4:34},
  {p:60,g:165,f1:45,f2:35,f3:51,f4:34},{p:65,g:172,f1:48,f2:38,f3:53,f4:38},
  {p:70,g:179,f1:51,f2:43,f3:54,f4:40},{p:75,g:203,f1:54,f2:44,f3:57,f4:41},
  {p:80,g:215,f1:62,f2:47,f3:60,f4:44},{p:85,g:219,f1:65,f2:51,f3:67,f4:46},
  {p:90,g:220,f1:69,f2:61,f3:67,f4:47},{p:95,g:254,f1:86,f2:63,f3:71,f4:48},
  {p:99,g:254,f1:86,f2:63,f3:71,f4:48}
];
var _etdahNormaMasc10a13 = [
  {p:1,g:104,f1:25,f2:15,f3:27,f4:15},{p:5,g:105,f1:25,f2:21,f3:32,f4:16},
  {p:10,g:121,f1:26,f2:25,f3:38,f4:20},{p:15,g:127,f1:29,f2:27,f3:41,f4:21},
  {p:20,g:134,f1:31,f2:28,f3:44,f4:23},{p:25,g:148,f1:32,f2:29,f3:46,f4:28},
  {p:30,g:150,f1:34,f2:30,f3:49,f4:28},{p:35,g:153,f1:35,f2:32,f3:51,f4:29},
  {p:40,g:156,f1:36,f2:35,f3:51,f4:30},{p:45,g:163,f1:39,f2:35,f3:53,f4:31},
  {p:50,g:165,f1:42,f2:36,f3:53,f4:36},{p:55,g:169,f1:43,f2:39,f3:54,f4:36},
  {p:60,g:176,f1:48,f2:40,f3:55,f4:37},{p:65,g:186,f1:50,f2:41,f3:58,f4:40},
  {p:70,g:195,f1:51,f2:41,f3:59,f4:42},{p:75,g:207,f1:55,f2:44,f3:60,f4:43},
  {p:80,g:223,f1:60,f2:51,f3:60,f4:43},{p:85,g:235,f1:61,f2:56,f3:64,f4:49},
  {p:90,g:248,f1:69,f2:66,f3:65,f4:50},{p:95,g:258,f1:78,f2:68,f3:70,f4:62},
  {p:99,g:258,f1:86,f2:68,f3:70,f4:62}
];
var _etdahNormaMasc14a17 = [
  {p:1,g:84,f1:20,f2:16,f3:20,f4:15},{p:5,g:84,f1:20,f2:16,f3:21,f4:15},
  {p:10,g:95,f1:21,f2:18,f3:32,f4:16},{p:15,g:109,f1:25,f2:20,f3:34,f4:17},
  {p:20,g:112,f1:26,f2:21,f3:34,f4:17},{p:25,g:124,f1:29,f2:23,f3:35,f4:20},
  {p:30,g:130,f1:30,f2:26,f3:39,f4:22},{p:35,g:131,f1:31,f2:27,f3:41,f4:23},
  {p:40,g:132,f1:32,f2:28,f3:43,f4:26},{p:45,g:137,f1:33,f2:28,f3:43,f4:26},
  {p:50,g:142,f1:33,f2:30,f3:47,f4:27},{p:55,g:143,f1:36,f2:33,f3:51,f4:29},
  {p:60,g:143,f1:40,f2:35,f3:53,f4:32},{p:65,g:146,f1:45,f2:36,f3:53,f4:34},
  {p:70,g:162,f1:50,f2:37,f3:53,f4:34},{p:75,g:174,f1:53,f2:37,f3:53,f4:34},
  {p:80,g:189,f1:55,f2:39,f3:54,f4:36},{p:85,g:192,f1:56,f2:40,f3:59,f4:39},
  {p:90,g:192,f1:71,f2:42,f3:61,f4:41},{p:95,g:236,f1:108,f2:42,f3:66,f4:41},
  {p:99,g:236,f1:108,f2:42,f3:66,f4:41}
];

// === FUNCOES AUXILIARES ===
function _etdahSelecionarTabela(sexo, idade) {
  if (!sexo || !idade) return _etdahNormaGeral;
  var s = sexo.toLowerCase();
  var i = parseInt(idade);
  if (isNaN(i)) return _etdahNormaGeral;
  if (s === 'masculino' || s === 'm') {
    if (i >= 2 && i <= 5) return _etdahNormaMasc2a5;
    if (i >= 6 && i <= 9) return _etdahNormaMasc6a9;
    if (i >= 10 && i <= 13) return _etdahNormaMasc10a13;
    if (i >= 14 && i <= 17) return _etdahNormaMasc14a17;
  } else if (s === 'feminino' || s === 'f') {
    if (i >= 2 && i <= 5) return _etdahNormaFem2a5;
    if (i >= 6 && i <= 9) return _etdahNormaFem6a9;
    if (i >= 10 && i <= 13) return _etdahNormaFem10a13;
    if (i >= 14 && i <= 17) return _etdahNormaFem14a17;
  }
  return _etdahNormaGeral;
}

function _etdahBuscarPercentil(escoreBruto, tabela, campo) {
  if (!tabela || tabela.length === 0 || escoreBruto == null) return null;
  if (escoreBruto <= tabela[0][campo]) return tabela[0].p;
  if (escoreBruto >= tabela[tabela.length - 1][campo]) return tabela[tabela.length - 1].p;
  for (var i = 0; i < tabela.length - 1; i++) {
    var v1 = tabela[i][campo];
    var v2 = tabela[i + 1][campo];
    if (escoreBruto >= v1 && escoreBruto <= v2) {
      if (v2 === v1) return tabela[i].p;
      var prop = (escoreBruto - v1) / (v2 - v1);
      return Math.round((tabela[i].p + prop * (tabela[i + 1].p - tabela[i].p)) * 10) / 10;
    }
  }
  return 50;
}

function _etdahClassificar(percentil) {
  if (percentil == null) return {texto: 'N/A', classe: 'na'};
  if (percentil <= 20) return {texto: 'Inferior', classe: 'inferior'};
  if (percentil <= 40) return {texto: 'Media Inferior', classe: 'media-inferior'};
  if (percentil <= 60) return {texto: 'Media', classe: 'media'};
  if (percentil <= 80) return {texto: 'Media Superior', classe: 'media-superior'};
  return {texto: 'Superior', classe: 'superior'};
}

function _etdahCorClassif(classe) {
  if (classe === 'inferior') return '#4caf50';
  if (classe === 'media-inferior') return '#8bc34a';
  if (classe === 'media') return '#ffc107';
  if (classe === 'media-superior') return '#ff9800';
  if (classe === 'superior') return '#f44336';
  return '#999';
}

function _etdahInverter(valor) {
  return 7 - valor; // 1->6, 2->5, 3->4, 4->3, 5->2, 6->1
}

// === INTERPRETACOES TEXTUAIS (do manual) ===
var _etdahInterpretacoes = {
  f1_alto: 'Regulacao Emocional: Manejo deficiente da frustracao, dificuldade para autorregulacao emocional e para modular o afeto. Tendencia a reagir com hipersensibilidade emocional, exibindo respostas emocionais fortes ou imaturas. Pode apresentar temperamento explosivo, hostilidade, irritabilidade, alteracao brusca de humor, comportamento opositor, dificuldade nos relacionamentos interpessoais e falta de empatia.',
  f1_baixo: 'Regulacao Emocional: Regulacao emocional adequada, controle emocional para agir de forma ajustada diante de situacoes estressantes, facilidade no manejo da frustracao e na modulacao do afeto, estabilidade emocional e facilidade nos relacionamentos interpessoais.',
  f2_alto: 'Hiperatividade/Impulsividade: Comportamento com ritmo acelerado e apressado, excesso de movimentacao corporal, acao sem reflexao anterior, prejuizo no sistema inibitorio, levando a comportamentos inconsequentes e imprudentes. Tendencia a persistir diante de uma ideia, com pouca capacidade de flexibilizacao mental.',
  f2_baixo: 'Hiperatividade/Impulsividade: Nivel de atividade motora e de ritmo motor dentro do esperado para a faixa etaria, presenca de autocontrole, contencao de impulsos, tendencia a agir com prudencia e flexibilidade.',
  f3_alto: 'Comportamento Adaptativo: Comportamento pouco prudente, tendencia a correr riscos, dificuldade na compreensao de principios gerais e das situacoes sociais, no julgamento e na maturidade social, e em se submeter a normas. Prejuizo para automonitorar o comportamento, agindo de forma inadequada e impulsiva.',
  f3_baixo: 'Comportamento Adaptativo: Comportamento adaptativo adequado, controle cognitivo, maturidade e julgamento social, eficiencia para solucionar problemas e capacidade para seguir regras e normas. Demonstra habilidade de automonitoramento.',
  f4_alto: 'Atencao: Prejuizos em funcoes executivas como iniciativa, alerta, engajamento e persistencia em tarefas. Dificuldade em atividades que exijam atencao sustentada e em reter informacoes importantes. Baixo desempenho na finalizacao de tarefas, com aparente falta de responsabilidade e procrastinacao.',
  f4_baixo: 'Atencao: Boa capacidade atencional, persistencia do esforco, capacidade para engajar-se em tarefas mantendo a motivacao do inicio ao fim, com comprometimento e responsabilidade.'
};

// === GERAR QUESTIONARIO HTML ===
function etdahGerarQuestionario() {
  var el = document.getElementById('etdahQuestionario');
  if (!el) return;
  var fatores = [
    {nome: 'Fator 1 - Regulacao Emocional', itens: _etdahFator1, id: 'f1', cor: '#c62828'},
    {nome: 'Fator 2 - Hiperatividade / Impulsividade', itens: _etdahFator2, id: 'f2', cor: '#e65100'},
    {nome: 'Fator 3 - Comportamento Adaptativo', itens: _etdahFator3, id: 'f3', cor: '#2e7d32'},
    {nome: 'Fator 4 - Atencao', itens: _etdahFator4, id: 'f4', cor: '#1565c0'}
  ];
  var html = '';
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    html += '<div style="margin-bottom:15px;border:2px solid ' + f.cor + ';border-radius:10px;overflow:hidden;">';
    html += '<div style="background:' + f.cor + ';color:white;padding:8px 12px;font-size:12px;font-weight:bold;">' + f.nome + ' (' + f.itens.length + ' itens)';
    html += '<span style="float:right;font-size:13px;" id="etdahSoma_' + f.id + '">Soma: 0</span></div>';
    html += '<div style="padding:8px;">';
    for (var i = 0; i < f.itens.length; i++) {
      var item = f.itens[i];
      var invTag = item.invertido ? ' <span style="color:#c62828;font-size:9px;font-weight:bold;">(INV)</span>' : '';
      html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #f0f0f0;font-size:11px;">';
      html += '<span style="min-width:22px;font-weight:bold;color:' + f.cor + ';">' + item.num + '.</span>';
      html += '<span style="flex:1;">' + item.texto + invTag + '</span>';
      html += '<input type="number" id="etdah_' + f.id + '_' + i + '" min="1" max="6" style="width:36px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;font-size:13px;font-weight:bold;" oninput="_etdahValidarItem(this);_etdahAtualizarSomas();_etdahAutoScroll(this)">';
      html += '</div>';
    }
    html += '</div></div>';
  }
  el.innerHTML = html;
}

// Valida que so aceita 1-6
function _etdahValidarItem(el) {
  var v = parseInt(el.value);
  if (el.value !== '' && (isNaN(v) || v < 1 || v > 6)) {
    el.style.borderColor = '#f44336';
    el.style.background = '#ffebee';
  } else {
    el.style.borderColor = '#ccc';
    el.style.background = '';
  }
}

// Auto-scroll: ao digitar um valor valido, foco passa para o proximo input
function _etdahAutoScroll(el) {
  var v = parseInt(el.value);
  if (el.value === '' || isNaN(v) || v < 1 || v > 6) return;
  var todos = document.querySelectorAll('#etdahQuestionario input[type="number"]');
  for (var i = 0; i < todos.length; i++) {
    if (todos[i] === el && i < todos.length - 1) {
      var prox = todos[i + 1];
      prox.focus();
      prox.select();
      prox.scrollIntoView({behavior:'smooth',block:'center'});
      break;
    }
  }
}

// === ATUALIZAR SOMAS EM TEMPO REAL ===
function _etdahAtualizarSomas() {
  var fatores = [
    {itens: _etdahFator1, id: 'f1'},
    {itens: _etdahFator2, id: 'f2'},
    {itens: _etdahFator3, id: 'f3'},
    {itens: _etdahFator4, id: 'f4'}
  ];
  var totalGeral = 0;
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    var soma = 0;
    var respondidos = 0;
    for (var i = 0; i < f.itens.length; i++) {
      var inp = document.getElementById('etdah_' + f.id + '_' + i);
      if (inp && inp.value !== '') {
        var val = parseInt(inp.value);
        if (val >= 1 && val <= 6) {
          if (f.itens[i].invertido) val = _etdahInverter(val);
          soma += val;
          respondidos++;
        }
      }
    }
    var elSoma = document.getElementById('etdahSoma_' + f.id);
    if (elSoma) elSoma.textContent = 'Soma: ' + soma + ' (' + respondidos + '/' + f.itens.length + ')';
    totalGeral += soma;
  }
  var elTotal = document.getElementById('etdahSomaTotal');
  if (elTotal) elTotal.textContent = totalGeral;
}

// === CACHE DE RESPONDENTES ===
var _etdahRespondentes = [];

// === CALCULAR RESULTADOS ===
function etdahCalcular() {
  var nome = document.getElementById('etdahNome').value.trim();
  var idade = document.getElementById('etdahIdade').value;
  var sexo = document.getElementById('etdahSexo').value;
  var respondente = document.getElementById('etdahRespondente').value.trim();
  if (!nome) { alert('Preencha o nome do paciente.'); return; }
  if (!idade) { alert('Preencha a idade.'); return; }
  if (!sexo) { alert('Selecione o sexo.'); return; }
  if (!respondente) { alert('Preencha quem respondeu.'); return; }

  // Somar fatores
  var fatores = [
    {itens: _etdahFator1, id: 'f1'},
    {itens: _etdahFator2, id: 'f2'},
    {itens: _etdahFator3, id: 'f3'},
    {itens: _etdahFator4, id: 'f4'}
  ];
  var escores = {};
  var totalItens = 0;
  var totalResp = 0;
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    var soma = 0;
    var resp = 0;
    for (var i = 0; i < f.itens.length; i++) {
      var inp = document.getElementById('etdah_' + f.id + '_' + i);
      if (inp && inp.value !== '') {
        var val = parseInt(inp.value);
        if (val >= 1 && val <= 6) {
          if (f.itens[i].invertido) val = _etdahInverter(val);
          soma += val;
          resp++;
        }
      }
      totalItens++;
    }
    totalResp += resp;
    escores[f.id] = soma;
  }
  if (totalResp < 58) {
    if (!confirm('Faltam ' + (58 - totalResp) + ' itens. Deseja calcular mesmo assim?')) return;
  }
  escores.geral = escores.f1 + escores.f2 + escores.f3 + escores.f4;

  var tabela = _etdahSelecionarTabela(sexo, idade);
  var pF1 = _etdahBuscarPercentil(escores.f1, tabela, 'f1');
  var pF2 = _etdahBuscarPercentil(escores.f2, tabela, 'f2');
  var pF3 = _etdahBuscarPercentil(escores.f3, tabela, 'f3');
  var pF4 = _etdahBuscarPercentil(escores.f4, tabela, 'f4');
  var pG = _etdahBuscarPercentil(escores.geral, tabela, 'g');

  _etdahRespondentes.push({
    respondente: respondente, nome: nome, idade: idade, sexo: sexo,
    escores: escores,
    percentis: {f1: pF1, f2: pF2, f3: pF3, f4: pF4, geral: pG},
    classificacoes: {f1: _etdahClassificar(pF1), f2: _etdahClassificar(pF2), f3: _etdahClassificar(pF3), f4: _etdahClassificar(pF4), geral: _etdahClassificar(pG)},
    tabelaUsada: sexo + ', ' + idade + ' anos',
    data: new Date().toISOString()
  });
  _etdahRenderResultados();
}

// === RENDER RESULTADOS NA TELA ===
function _etdahRenderResultados() {
  var el = document.getElementById('etdahResultados');
  if (!el) return;
  el.style.display = 'block';
  var html = '<p style="font-weight:bold;color:#1565c0;font-size:14px;margin-bottom:10px;">Resultados (' + _etdahRespondentes.length + ' respondente' + (_etdahRespondentes.length > 1 ? 's' : '') + ')</p>';
  for (var i = 0; i < _etdahRespondentes.length; i++) {
    var r = _etdahRespondentes[i];
    html += '<div style="background:#f5f5f5;border-radius:8px;padding:12px;margin-bottom:10px;border-left:4px solid #1565c0;">';
    html += '<p style="font-weight:bold;font-size:13px;color:#333;margin-bottom:8px;">' + r.respondente + ' <span style="font-weight:normal;color:#777;font-size:11px;">(Norma: ' + r.tabelaUsada + ')</span></p>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html += '<tr style="background:#e3f2fd;"><th style="padding:6px;text-align:left;">Fator</th><th style="padding:6px;text-align:center;">Bruto</th><th style="padding:6px;text-align:center;">Percentil</th><th style="padding:6px;text-align:left;">Classificacao</th></tr>';
    var linhas = [
      {n:'F1 - Regulacao Emocional',b:r.escores.f1,p:r.percentis.f1,c:r.classificacoes.f1},
      {n:'F2 - Hiperatividade/Impulsividade',b:r.escores.f2,p:r.percentis.f2,c:r.classificacoes.f2},
      {n:'F3 - Comportamento Adaptativo',b:r.escores.f3,p:r.percentis.f3,c:r.classificacoes.f3},
      {n:'F4 - Atencao',b:r.escores.f4,p:r.percentis.f4,c:r.classificacoes.f4},
      {n:'ESCORE GERAL',b:r.escores.geral,p:r.percentis.geral,c:r.classificacoes.geral}
    ];
    for (var j = 0; j < linhas.length; j++) {
      var l = linhas[j];
      var bg = j === 4 ? 'background:#e8eaf6;font-weight:bold;' : '';
      html += '<tr style="' + bg + 'border-bottom:1px solid #e0e0e0;"><td style="padding:5px;">' + l.n + '</td><td style="padding:5px;text-align:center;">' + l.b + '</td><td style="padding:5px;text-align:center;font-weight:bold;">' + (l.p != null ? l.p : '-') + '</td><td style="padding:5px;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:white;background:' + _etdahCorClassif(l.c.classe) + ';">' + l.c.texto + '</span></td></tr>';
    }
    html += '</table></div>';
  }
  html += '<div style="text-align:center;margin-top:15px;">';
  html += '<button onclick="etdahGerarPDF()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#1565c0,#42a5f5);color:white;">Gerar PDF com Grafico</button>';
  html += '<button onclick="etdahLimpar()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#e53935,#ef5350);color:white;margin-left:8px;">Limpar Tudo</button>';
  html += '</div>';
  el.innerHTML = html;
  el.scrollIntoView({behavior:'smooth',block:'start'});
}

function etdahLimpar() {
  _etdahRespondentes = [];
  var el = document.getElementById('etdahResultados');
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  // Limpar inputs numericos
  var inputs = document.querySelectorAll('#etdahQuestionario input[type="number"]');
  for (var i = 0; i < inputs.length; i++) { inputs[i].value = ''; inputs[i].style.borderColor = '#ccc'; inputs[i].style.background = ''; }
  _etdahAtualizarSomas();
  var campos = ['etdahNome','etdahIdade','etdahSexo','etdahRespondente'];
  for (var c = 0; c < campos.length; c++) { var inp = document.getElementById(campos[c]); if (inp) inp.value = ''; }
}

// === GERAR PDF ===
function etdahGerarPDF() {
  if (_etdahRespondentes.length === 0) { alert('Calcule pelo menos um respondente.'); return; }
  var jsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDF) { alert('jsPDF nao carregado.'); return; }
  var doc = new jsPDF('p', 'mm', 'a4');
  var r0 = _etdahRespondentes[0];

  // PAG 1: CABECALHO + TABELA
  doc.setFillColor(21,101,192); doc.rect(0,0,210,22,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont(undefined,'bold');
  doc.text('ETDAH-PAIS', 105, 10, {align:'center'});
  doc.setFontSize(8); doc.setFont(undefined,'normal');
  doc.text('Escala de Avaliacao de Comportamentos Infantojuvenis no TDAH em Ambiente Familiar (Benczik, 2018)', 105, 16, {align:'center'});
  doc.text('Versao para Pais', 105, 20, {align:'center'});

  var y = 30;
  doc.setTextColor(50,50,50); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Dados do Paciente', 15, y); y += 6;
  doc.setFont(undefined,'normal'); doc.setFontSize(9);
  doc.text('Nome: ' + r0.nome, 15, y); y += 5;
  doc.text('Idade: ' + r0.idade + ' anos   |   Sexo: ' + r0.sexo, 15, y); y += 5;
  doc.text('Norma: ' + r0.tabelaUsada, 15, y); y += 5;
  doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 15, y); y += 10;

  // Tabela por respondente
  for (var ri = 0; ri < _etdahRespondentes.length; ri++) {
    var resp = _etdahRespondentes[ri];
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(21,101,192);
    doc.text('Respondente: ' + resp.respondente, 15, y); y += 6;
    doc.setFillColor(227,242,253); doc.rect(15, y-3, 180, 7, 'F');
    doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
    doc.text('Fator', 17, y+1); doc.text('Bruto', 95, y+1, {align:'center'});
    doc.text('Percentil', 125, y+1, {align:'center'}); doc.text('Classificacao', 165, y+1, {align:'center'});
    y += 8; doc.setFont(undefined,'normal');
    var lns = [
      ['F1 - Regulacao Emocional', resp.escores.f1, resp.percentis.f1, resp.classificacoes.f1],
      ['F2 - Hiperatividade/Impulsividade', resp.escores.f2, resp.percentis.f2, resp.classificacoes.f2],
      ['F3 - Comportamento Adaptativo', resp.escores.f3, resp.percentis.f3, resp.classificacoes.f3],
      ['F4 - Atencao', resp.escores.f4, resp.percentis.f4, resp.classificacoes.f4],
      ['ESCORE GERAL', resp.escores.geral, resp.percentis.geral, resp.classificacoes.geral]
    ];
    for (var li = 0; li < lns.length; li++) {
      if (li === 4) { doc.setFont(undefined,'bold'); doc.setFillColor(232,234,246); doc.rect(15,y-3,180,6,'F'); }
      doc.setTextColor(50,50,50); doc.text(lns[li][0], 17, y);
      doc.text(String(lns[li][1]), 95, y, {align:'center'});
      doc.text(lns[li][2] != null ? String(lns[li][2]) : '-', 125, y, {align:'center'});
      doc.text(lns[li][3].texto, 165, y, {align:'center'}); y += 6;
    }
    doc.setFont(undefined,'normal'); y += 5;
  }

  // PAG 2: GRAFICO
  doc.addPage();
  doc.setFillColor(21,101,192); doc.rect(0,0,210,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont(undefined,'bold');
  doc.text('ETDAH-PAIS - Perfil em Percentis', 105, 12, {align:'center'});
  var gy = 26;
  doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont(undefined,'normal');
  doc.text('Paciente: ' + r0.nome + '   |   ' + _etdahRespondentes.length + ' respondente(s)', 105, gy, {align:'center'});
  gy += 10;
  var gX = 35, gW = 145, gH = 85;
  var yBase = gy + gH, yTop = gy;
  var y20 = yBase - (20/100)*gH, y40 = yBase - (40/100)*gH;
  var y60 = yBase - (60/100)*gH, y80 = yBase - (80/100)*gH;
  // Faixas
  doc.setFillColor(232,245,233); doc.rect(gX, y20, gW, yBase - y20, 'F');
  doc.setFillColor(241,248,233); doc.rect(gX, y40, gW, y20 - y40, 'F');
  doc.setFillColor(255,248,225); doc.rect(gX, y60, gW, y40 - y60, 'F');
  doc.setFillColor(255,243,224); doc.rect(gX, y80, gW, y60 - y80, 'F');
  doc.setFillColor(255,235,238); doc.rect(gX, yTop, gW, y80 - yTop, 'F');
  // Labels faixas
  doc.setFontSize(6); doc.setFont(undefined,'bold');
  doc.setTextColor(46,125,50); doc.text('Inferior', gX-2, yBase-5, {align:'right'});
  doc.setTextColor(104,159,56); doc.text('Med.Inf.', gX-2, (y20+y40)/2+1, {align:'right'});
  doc.setTextColor(200,150,0); doc.text('Media', gX-2, (y40+y60)/2+1, {align:'right'});
  doc.setTextColor(230,81,0); doc.text('Med.Sup.', gX-2, (y60+y80)/2+1, {align:'right'});
  doc.setTextColor(198,40,40); doc.text('Superior', gX-2, yTop+5, {align:'right'});
  // Eixos
  doc.setDrawColor(150,150,150); doc.setLineWidth(0.3);
  doc.line(gX, yTop, gX, yBase); doc.line(gX, yBase, gX+gW, yBase);
  // Escala Y
  doc.setFontSize(6); doc.setFont(undefined,'normal'); doc.setTextColor(100,100,100);
  for (var pv = 0; pv <= 100; pv += 10) {
    var yv = yBase - (pv/100)*gH;
    doc.text(String(pv), gX-4, yv+1.5, {align:'right'});
    if (pv > 0 && pv < 100) { doc.setDrawColor(220,220,220); doc.setLineWidth(0.1); doc.line(gX, yv, gX+gW, yv); }
  }
  // Labels X
  var labX = ['F1-R.E.', 'F2-H.I.', 'F3-C.A.', 'F4-At.', 'TOTAL'];
  var stepX = gW / 4;
  doc.setFontSize(7); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
  for (var lx = 0; lx < 5; lx++) doc.text(labX[lx], gX + lx*stepX, yBase+5, {align:'center'});
  // Cores respondentes
  var cores = [[21,101,192],[211,47,47],[56,142,60],[156,39,176],[255,111,0]];
  for (var ii = 0; ii < _etdahRespondentes.length; ii++) {
    var inf = _etdahRespondentes[ii];
    var cor = cores[ii % cores.length];
    var vals = [inf.percentis.f1, inf.percentis.f2, inf.percentis.f3, inf.percentis.f4, inf.percentis.geral];
    doc.setDrawColor(cor[0],cor[1],cor[2]); doc.setLineWidth(1.0);
    for (var pi = 0; pi < 4; pi++) {
      doc.line(gX+pi*stepX, yBase-((vals[pi]||0)/100)*gH, gX+(pi+1)*stepX, yBase-((vals[pi+1]||0)/100)*gH);
    }
    doc.setFillColor(cor[0],cor[1],cor[2]); doc.setFontSize(7); doc.setTextColor(cor[0],cor[1],cor[2]);
    for (var pp = 0; pp < 5; pp++) {
      var px = gX+pp*stepX, py = yBase-((vals[pp]||0)/100)*gH;
      doc.circle(px, py, 1.5, 'F');
      doc.text(String(vals[pp]!=null?vals[pp]:''), px, py-3, {align:'center'});
    }
  }
  // Legenda
  var legY = yBase + 14;
  doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
  doc.text('Respondentes:', gX, legY); legY += 5;
  for (var lg = 0; lg < _etdahRespondentes.length; lg++) {
    var lgC = cores[lg % cores.length];
    doc.setFillColor(lgC[0],lgC[1],lgC[2]); doc.rect(gX, legY-2, 8, 3, 'F');
    doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(50,50,50);
    doc.text(_etdahRespondentes[lg].respondente, gX+11, legY); legY += 5;
  }

  // PAG 3: INTERPRETACAO TEXTUAL
  doc.addPage();
  doc.setFillColor(21,101,192); doc.rect(0,0,210,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont(undefined,'bold');
  doc.text('ETDAH-PAIS - Interpretacao dos Resultados', 105, 12, {align:'center'});
  var iy = 28;
  // Para cada respondente, mostrar interpretacao dos fatores mais evidentes
  for (var ri2 = 0; ri2 < _etdahRespondentes.length; ri2++) {
    var r2 = _etdahRespondentes[ri2];
    if (iy > 250) { doc.addPage(); iy = 20; }
    doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(21,101,192);
    doc.text('Respondente: ' + r2.respondente, 15, iy); iy += 7;
    // Interpretar cada fator
    var fats = [
      {nome:'F1',perc:r2.percentis.f1,cl:r2.classificacoes.f1,alto:_etdahInterpretacoes.f1_alto,baixo:_etdahInterpretacoes.f1_baixo},
      {nome:'F2',perc:r2.percentis.f2,cl:r2.classificacoes.f2,alto:_etdahInterpretacoes.f2_alto,baixo:_etdahInterpretacoes.f2_baixo},
      {nome:'F3',perc:r2.percentis.f3,cl:r2.classificacoes.f3,alto:_etdahInterpretacoes.f3_alto,baixo:_etdahInterpretacoes.f3_baixo},
      {nome:'F4',perc:r2.percentis.f4,cl:r2.classificacoes.f4,alto:_etdahInterpretacoes.f4_alto,baixo:_etdahInterpretacoes.f4_baixo}
    ];
    for (var fi2 = 0; fi2 < fats.length; fi2++) {
      var ft = fats[fi2];
      if (iy > 265) { doc.addPage(); iy = 20; }
      var texto = (ft.perc > 60) ? ft.alto : ft.baixo;
      var corTxt = (ft.perc > 80) ? [198,40,40] : (ft.perc > 60) ? [230,81,0] : [50,50,50];
      doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(corTxt[0],corTxt[1],corTxt[2]);
      doc.text(ft.nome + ' (Percentil ' + ft.perc + ' - ' + ft.cl.texto + '):', 15, iy); iy += 4;
      doc.setFont(undefined,'normal'); doc.setTextColor(50,50,50); doc.setFontSize(7.5);
      var linhas = doc.splitTextToSize(texto, 175);
      doc.text(linhas, 15, iy); iy += linhas.length * 3.5 + 4;
    }
    iy += 5;
  }
  // Disclaimer
  if (iy > 255) { doc.addPage(); iy = 20; }
  iy += 5;
  doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor(130,130,130);
  doc.text('IMPORTANTE: Escalas nao fazem diagnostico. Sao ferramentas auxiliares de rastreamento.', 15, iy); iy += 4;
  doc.text('Outros metodos devem ser utilizados para avaliacao completa (entrevistas, observacao, historico).', 15, iy); iy += 6;
  doc.setFont(undefined,'normal'); doc.setTextColor(80,80,80);
  doc.text('Referencia: BENCZIK, E. B. P. ETDAH-PAIS: Escala de Avaliacao de Comportamentos Infantojuvenis', 15, iy); iy += 3.5;
  doc.text('no Transtorno de Deficit de Atencao/Hiperatividade em Ambiente Familiar. Sao Paulo: Memnon, 2018.', 15, iy);

  // Rodape todas as paginas
  var totalPages = doc.internal.getNumberOfPages();
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(50,50,50); doc.rect(0,287,210,10,'F');
    doc.setTextColor(200,200,200); doc.setFontSize(7); doc.setFont(undefined,'normal');
    doc.text('SYM Online | ETDAH-PAIS | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + totalPages, 105, 293, {align:'center'});
  }
  var ts = new Date();
  var tsStr = ts.getFullYear()+String(ts.getMonth()+1).padStart(2,'0')+String(ts.getDate()).padStart(2,'0');
  doc.save('ETDAH-PAIS_' + r0.nome.replace(/\s+/g,'_') + '_' + tsStr + '.pdf');
}

// === INTEGRACAO COM ABA PACIENTES ===
function etdahPreencherPaciente() {
  var sel = document.getElementById('etdahSelPac');
  if (!sel || sel.selectedIndex === 0) return;
  var opt = sel.options[sel.selectedIndex];
  var pacId = opt.value || '';
  var pac = null;
  if (window._pacientesCache && pacId) {
    for (var i = 0; i < _pacientesCache.length; i++) {
      if (_pacientesCache[i].id === pacId) { pac = _pacientesCache[i]; break; }
    }
  }
  if (!pac) pac = { nome: opt.dataset.nome||'', dataNascimento: opt.dataset.dn||'', sexo: opt.dataset.sexo||'' };
  var nomeEl = document.getElementById('etdahNome');
  var idadeEl = document.getElementById('etdahIdade');
  var sexoEl = document.getElementById('etdahSexo');
  if (nomeEl && pac.nome) nomeEl.value = pac.nome;
  if (sexoEl && pac.sexo) sexoEl.value = pac.sexo;
  if (idadeEl && pac.dataNascimento) {
    var partes = pac.dataNascimento.split('/');
    if (partes.length === 3) {
      var nasc = new Date(partes[2], partes[1]-1, partes[0]);
      var hoje = new Date();
      var idade = hoje.getFullYear() - nasc.getFullYear();
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
      idadeEl.value = idade;
    }
  }
}

// === ADICIONAR RESPONDENTE (salva dados atuais e limpa para novo respondente) ===
function etdahAdicionarRespondente() {
  var nome = document.getElementById('etdahNome').value.trim();
  var idade = document.getElementById('etdahIdade').value;
  var sexo = document.getElementById('etdahSexo').value;
  var respondente = document.getElementById('etdahRespondente').value.trim();
  if (!nome) { alert('Preencha o nome do paciente.'); return; }
  if (!idade) { alert('Preencha a idade.'); return; }
  if (!sexo) { alert('Selecione o sexo.'); return; }
  if (!respondente) { alert('Preencha quem respondeu (ex: Mae, Pai, Professor).'); return; }
  // Verificar se todos os itens foram respondidos
  var fatores = [
    {itens: _etdahFator1, id: 'f1'},{itens: _etdahFator2, id: 'f2'},
    {itens: _etdahFator3, id: 'f3'},{itens: _etdahFator4, id: 'f4'}
  ];
  var totalResp = 0;
  var escores = {};
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi]; var soma = 0; var resp = 0;
    for (var i = 0; i < f.itens.length; i++) {
      var inp = document.getElementById('etdah_' + f.id + '_' + i);
      if (inp && inp.value !== '') {
        var val = parseInt(inp.value);
        if (val >= 1 && val <= 6) {
          if (f.itens[i].invertido) val = _etdahInverter(val);
          soma += val; resp++;
        }
      }
    }
    totalResp += resp; escores[f.id] = soma;
  }
  if (totalResp < 58) {
    if (!confirm('Faltam ' + (58 - totalResp) + ' itens para este respondente. Salvar mesmo assim?')) return;
  }
  escores.geral = escores.f1 + escores.f2 + escores.f3 + escores.f4;
  var tabela = _etdahSelecionarTabela(sexo, idade);
  var pF1 = _etdahBuscarPercentil(escores.f1, tabela, 'f1');
  var pF2 = _etdahBuscarPercentil(escores.f2, tabela, 'f2');
  var pF3 = _etdahBuscarPercentil(escores.f3, tabela, 'f3');
  var pF4 = _etdahBuscarPercentil(escores.f4, tabela, 'f4');
  var pG = _etdahBuscarPercentil(escores.geral, tabela, 'g');
  _etdahRespondentes.push({
    respondente: respondente, nome: nome, idade: idade, sexo: sexo,
    escores: escores,
    percentis: {f1: pF1, f2: pF2, f3: pF3, f4: pF4, geral: pG},
    classificacoes: {f1: _etdahClassificar(pF1), f2: _etdahClassificar(pF2), f3: _etdahClassificar(pF3), f4: _etdahClassificar(pF4), geral: _etdahClassificar(pG)},
    tabelaUsada: sexo + ', ' + idade + ' anos',
    data: new Date().toISOString()
  });
  // Atualizar info de respondentes salvos
  var infoEl = document.getElementById('etdahRespondentesInfo');
  if (infoEl) {
    infoEl.style.display = 'block';
    infoEl.innerHTML = '<strong>' + _etdahRespondentes.length + ' respondente(s) salvo(s):</strong> ' + _etdahRespondentes.map(function(r){return r.respondente;}).join(', ') + ' — <em>Preencha o proximo respondente e clique em "Calcular" para ver a comparacao.</em>';
  }
  // Limpar apenas os inputs do questionario e o campo respondente (manter nome/idade/sexo)
  var inputs = document.querySelectorAll('#etdahQuestionario input[type="number"]');
  for (var i = 0; i < inputs.length; i++) { inputs[i].value = ''; inputs[i].style.borderColor = '#ccc'; inputs[i].style.background = ''; }
  document.getElementById('etdahRespondente').value = '';
  _etdahAtualizarSomas();
  alert('Respondente "' + respondente + '" salvo! Agora preencha o proximo respondente.');
}

// === OVERRIDE switchCorrecaoSubTab ===
(function() {
  window.switchCorrecaoSubTab = function(tab) {
    var btnBvrt = document.getElementById('subTabBvrt');
    var contentBvrt = document.getElementById('correcaoBvrt');
    var btnEtdah = document.getElementById('subTabEtdah');
    var contentEtdah = document.getElementById('correcaoEtdah');
    if (btnBvrt) { btnBvrt.style.borderBottom='3px solid transparent'; btnBvrt.style.background='#f5f5f5'; btnBvrt.style.color='#777'; }
    if (contentBvrt) contentBvrt.style.display='none';
    if (btnEtdah) { btnEtdah.style.borderBottom='3px solid transparent'; btnEtdah.style.background='#f5f5f5'; btnEtdah.style.color='#777'; }
    if (contentEtdah) contentEtdah.style.display='none';
    if (tab === 'bvrt') {
      if (contentBvrt) contentBvrt.style.display='block';
      if (btnBvrt) { btnBvrt.style.background='#ede7f6'; btnBvrt.style.color='#4a148c'; btnBvrt.style.borderBottom='3px solid #4a148c'; }
    } else if (tab === 'etdah') {
      if (contentEtdah) contentEtdah.style.display='block';
      if (btnEtdah) { btnEtdah.style.background='#e3f2fd'; btnEtdah.style.color='#1565c0'; btnEtdah.style.borderBottom='3px solid #1565c0'; }
      etdahGerarQuestionario();
    }
  };
})();
