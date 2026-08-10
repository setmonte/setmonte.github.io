// ============================================================
// ETDAH-PAIS - Correcao Automatica
// Escala de Avaliacao de Comportamentos Infantojuvenis no TDAH
// em Ambiente Familiar - Versao para Pais (Benczik, 2018)
// ============================================================

// Tabelas normativas - percentis por escore bruto
// Formato: array de {p: percentil, g: geral, f1: reg.emocional, f2: hiper/impuls, f3: comp.adaptativo, f4: atencao}

var _etdahNormaGeral = [
  {p:1,g:72,f1:20,f2:15,f3:18,f4:12},
  {p:5,g:101,f1:25,f2:18,f3:25,f4:15},
  {p:10,g:107,f1:28,f2:21,f3:32,f4:17},
  {p:15,g:115,f1:30,f2:23,f3:35,f4:19},
  {p:20,g:121,f1:31,f2:25,f3:37,f4:21},
  {p:25,g:129,f1:33,f2:26,f3:40,f4:22},
  {p:30,g:133,f1:35,f2:27,f3:42,f4:23},
  {p:35,g:139,f1:36,f2:28,f3:44,f4:24},
  {p:40,g:144,f1:38,f2:29,f3:46,f4:26},
  {p:45,g:148,f1:40,f2:30,f3:48,f4:27},
  {p:50,g:153,f1:42,f2:32,f3:49,f4:29},
  {p:55,g:159,f1:45,f2:34,f3:51,f4:30},
  {p:60,g:166,f1:47,f2:35,f3:53,f4:32},
  {p:65,g:170,f1:49,f2:37,f3:54,f4:34},
  {p:70,g:177,f1:51,f2:40,f3:55,f4:35},
  {p:75,g:187,f1:53,f2:42,f3:57,f4:36},
  {p:80,g:193,f1:56,f2:44,f3:60,f4:39},
  {p:85,g:207,f1:61,f2:49,f3:61,f4:41},
  {p:90,g:218,f1:68,f2:56,f3:65,f4:46},
  {p:95,g:238,f1:78,f2:66,f3:69,f4:51},
  {p:99,g:266,f1:95,f2:74,f3:74,f4:64}
];

var _etdahNormaFem2a5 = [
  {p:1,g:106,f1:23,f2:21,f3:20,f4:13},
  {p:5,g:107,f1:24,f2:21,f3:21,f4:13},
  {p:10,g:116,f1:33,f2:22,f3:29,f4:13},
  {p:15,g:119,f1:35,f2:24,f3:37,f4:16},
  {p:20,g:127,f1:36,f2:25,f3:37,f4:19},
  {p:25,g:131,f1:37,f2:28,f3:38,f4:20},
  {p:30,g:134,f1:39,f2:29,f3:40,f4:21},
  {p:35,g:137,f1:41,f2:30,f3:45,f4:21},
  {p:40,g:140,f1:42,f2:31,f3:46,f4:23},
  {p:45,g:152,f1:45,f2:33,f3:46,f4:24},
  {p:50,g:155,f1:47,f2:34,f3:47,f4:25},
  {p:55,g:160,f1:49,f2:34,f3:48,f4:26},
  {p:60,g:174,f1:53,f2:35,f3:51,f4:28},
  {p:65,g:180,f1:53,f2:38,f3:59,f4:29},
  {p:70,g:191,f1:53,f2:42,f3:60,f4:30},
  {p:75,g:197,f1:54,f2:54,f3:61,f4:31},
  {p:80,g:209,f1:58,f2:67,f3:63,f4:36},
  {p:85,g:217,f1:62,f2:73,f3:66,f4:49},
  {p:90,g:244,f1:65,f2:74,f3:72,f4:53},
  {p:95,g:253,f1:77,f2:74,f3:78,f4:53},
  {p:99,g:253,f1:77,f2:74,f3:78,f4:53}
];

var _etdahNormaFem6a9 = [
  {p:1,g:88,f1:23,f2:18,f3:21,f4:15},
  {p:5,g:96,f1:25,f2:18,f3:22,f4:16},
  {p:10,g:108,f1:30,f2:20,f3:27,f4:18},
  {p:15,g:113,f1:32,f2:24,f3:28,f4:22},
  {p:20,g:124,f1:35,f2:25,f3:29,f4:23},
  {p:25,g:128,f1:37,f2:27,f3:35,f4:24},
  {p:30,g:135,f1:43,f2:27,f3:40,f4:24},
  {p:35,g:137,f1:44,f2:27,f3:44,f4:26},
  {p:40,g:144,f1:45,f2:29,f3:47,f4:26},
  {p:45,g:146,f1:45,f2:30,f3:49,f4:26},
  {p:50,g:162,f1:46,f2:31,f3:51,f4:27},
  {p:55,g:170,f1:47,f2:33,f3:55,f4:27},
  {p:60,g:176,f1:49,f2:34,f3:56,f4:30},
  {p:65,g:185,f1:55,f2:34,f3:57,f4:32},
  {p:70,g:187,f1:55,f2:43,f3:57,f4:32},
  {p:75,g:191,f1:57,f2:47,f3:59,f4:33},
  {p:80,g:193,f1:61,f2:51,f3:60,f4:35},
  {p:85,g:196,f1:65,f2:53,f3:61,f4:35},
  {p:90,g:211,f1:66,f2:53,f3:65,f4:37},
  {p:95,g:228,f1:77,f2:59,f3:71,f4:43},
  {p:99,g:228,f1:77,f2:59,f3:71,f4:43}
];

var _etdahNormaFem10a13 = [
  {p:1,g:80,f1:20,f2:14,f3:15,f4:12},
  {p:5,g:87,f1:22,f2:16,f3:17,f4:12},
  {p:10,g:97,f1:27,f2:18,f3:26,f4:13},
  {p:15,g:101,f1:29,f2:20,f3:30,f4:17},
  {p:20,g:106,f1:30,f2:20,f3:33,f4:19},
  {p:25,g:117,f1:30,f2:22,f3:36,f4:21},
  {p:30,g:123,f1:36,f2:23,f3:39,f4:21},
  {p:35,g:129,f1:39,f2:25,f3:43,f4:22},
  {p:40,g:135,f1:39,f2:25,f3:43,f4:23},
  {p:45,g:139,f1:41,f2:25,f3:44,f4:25},
  {p:50,g:143,f1:41,f2:26,f3:47,f4:25},
  {p:55,g:145,f1:43,f2:27,f3:49,f4:26},
  {p:60,g:156,f1:48,f2:29,f3:50,f4:32},
  {p:65,g:159,f1:49,f2:29,f3:53,f4:34},
  {p:70,g:176,f1:51,f2:30,f3:54,f4:35},
  {p:75,g:190,f1:53,f2:32,f3:56,f4:37},
  {p:80,g:195,f1:56,f2:38,f3:57,f4:39},
  {p:85,g:199,f1:66,f2:44,f3:59,f4:46},
  {p:90,g:208,f1:77,f2:47,f3:60,f4:53},
  {p:95,g:239,f1:84,f2:58,f3:70,f4:60},
  {p:99,g:239,f1:84,f2:58,f3:70,f4:60}
];

var _etdahNormaFem14a17 = [
  {p:1,g:72,f1:25,f2:16,f3:18,f4:12},
  {p:5,g:72,f1:25,f2:16,f3:18,f4:12},
  {p:10,g:78,f1:25,f2:16,f3:19,f4:12},
  {p:15,g:87,f1:26,f2:17,f3:22,f4:13},
  {p:20,g:95,f1:26,f2:19,f3:24,f4:14},
  {p:25,g:102,f1:28,f2:21,f3:28,f4:15},
  {p:30,g:109,f1:29,f2:21,f3:35,f4:17},
  {p:35,g:111,f1:33,f2:22,f3:36,f4:17},
  {p:40,g:112,f1:33,f2:24,f3:36,f4:21},
  {p:45,g:115,f1:34,f2:24,f3:37,f4:22},
  {p:50,g:117,f1:35,f2:24,f3:38,f4:23},
  {p:55,g:118,f1:36,f2:26,f3:39,f4:24},
  {p:60,g:122,f1:36,f2:29,f3:40,f4:24},
  {p:65,g:131,f1:37,f2:29,f3:41,f4:26},
  {p:70,g:144,f1:37,f2:31,f3:42,f4:29},
  {p:75,g:148,f1:38,f2:33,f3:45,f4:31},
  {p:80,g:149,f1:39,f2:34,f3:47,f4:33},
  {p:85,g:157,f1:40,f2:35,f3:49,f4:36},
  {p:90,g:170,f1:46,f2:38,f3:55,f4:38},
  {p:95,g:170,f1:46,f2:38,f3:55,f4:38},
  {p:99,g:170,f1:46,f2:38,f3:55,f4:38}
];

var _etdahNormaMasc2a5 = [
  {p:1,g:115,f1:30,f2:23,f3:38,f4:19},
  {p:5,g:115,f1:30,f2:23,f3:38,f4:19},
  {p:10,g:115,f1:31,f2:25,f3:38,f4:21},
  {p:15,g:137,f1:31,f2:25,f3:44,f4:21},
  {p:20,g:151,f1:33,f2:26,f3:47,f4:21},
  {p:25,g:157,f1:37,f2:26,f3:48,f4:23},
  {p:30,g:159,f1:39,f2:28,f3:49,f4:24},
  {p:35,g:161,f1:39,f2:33,f3:51,f4:25},
  {p:40,g:163,f1:40,f2:37,f3:52,f4:25},
  {p:45,g:165,f1:40,f2:39,f3:54,f4:26},
  {p:50,g:166,f1:43,f2:40,f3:55,f4:27},
  {p:55,g:168,f1:47,f2:41,f3:55,f4:30},
  {p:60,g:168,f1:47,f2:45,f3:56,f4:32},
  {p:65,g:169,f1:48,f2:47,f3:57,f4:33},
  {p:70,g:171,f1:50,f2:48,f3:58,f4:34},
  {p:75,g:175,f1:51,f2:50,f3:59,f4:35},
  {p:80,g:183,f1:53,f2:53,f3:62,f4:35},
  {p:85,g:197,f1:56,f2:55,f3:65,f4:36},
  {p:90,g:211,f1:57,f2:59,f3:67,f4:37},
  {p:95,g:211,f1:57,f2:59,f3:67,f4:37},
  {p:99,g:211,f1:57,f2:59,f3:67,f4:37}
];

var _etdahNormaMasc6a9 = [
  {p:1,g:102,f1:22,f2:21,f3:34,f4:15},
  {p:5,g:106,f1:24,f2:22,f3:34,f4:16},
  {p:10,g:115,f1:28,f2:23,f3:35,f4:17},
  {p:15,g:118,f1:30,f2:24,f3:37,f4:18},
  {p:20,g:129,f1:30,f2:26,f3:39,f4:20},
  {p:25,g:133,f1:31,f2:28,f3:42,f4:22},
  {p:30,g:137,f1:33,f2:29,f3:44,f4:24},
  {p:35,g:143,f1:36,f2:30,f3:46,f4:25},
  {p:40,g:145,f1:37,f2:30,f3:48,f4:31},
  {p:45,g:151,f1:37,f2:32,f3:48,f4:31},
  {p:50,g:153,f1:41,f2:34,f3:49,f4:34},
  {p:55,g:154,f1:45,f2:34,f3:49,f4:34},
  {p:60,g:165,f1:45,f2:35,f3:51,f4:34},
  {p:65,g:172,f1:48,f2:38,f3:53,f4:38},
  {p:70,g:179,f1:51,f2:43,f3:54,f4:40},
  {p:75,g:203,f1:54,f2:44,f3:57,f4:41},
  {p:80,g:215,f1:62,f2:47,f3:60,f4:44},
  {p:85,g:219,f1:65,f2:51,f3:67,f4:46},
  {p:90,g:220,f1:69,f2:61,f3:67,f4:47},
  {p:95,g:254,f1:86,f2:63,f3:71,f4:48},
  {p:99,g:254,f1:86,f2:63,f3:71,f4:48}
];

var _etdahNormaMasc10a13 = [
  {p:1,g:104,f1:25,f2:15,f3:27,f4:15},
  {p:5,g:105,f1:25,f2:21,f3:32,f4:16},
  {p:10,g:121,f1:26,f2:25,f3:38,f4:20},
  {p:15,g:127,f1:29,f2:27,f3:41,f4:21},
  {p:20,g:134,f1:31,f2:28,f3:44,f4:23},
  {p:25,g:148,f1:32,f2:29,f3:46,f4:28},
  {p:30,g:150,f1:34,f2:30,f3:49,f4:28},
  {p:35,g:153,f1:35,f2:32,f3:51,f4:29},
  {p:40,g:156,f1:36,f2:35,f3:51,f4:30},
  {p:45,g:163,f1:39,f2:35,f3:53,f4:31},
  {p:50,g:165,f1:42,f2:36,f3:53,f4:36},
  {p:55,g:169,f1:43,f2:39,f3:54,f4:36},
  {p:60,g:176,f1:48,f2:40,f3:55,f4:37},
  {p:65,g:186,f1:50,f2:41,f3:58,f4:40},
  {p:70,g:195,f1:51,f2:41,f3:59,f4:42},
  {p:75,g:207,f1:55,f2:44,f3:60,f4:43},
  {p:80,g:223,f1:60,f2:51,f3:60,f4:43},
  {p:85,g:235,f1:61,f2:56,f3:64,f4:49},
  {p:90,g:248,f1:69,f2:66,f3:65,f4:50},
  {p:95,g:258,f1:78,f2:68,f3:70,f4:62},
  {p:99,g:258,f1:86,f2:68,f3:70,f4:62}
];

var _etdahNormaMasc14a17 = [
  {p:1,g:84,f1:20,f2:16,f3:20,f4:15},
  {p:5,g:84,f1:20,f2:16,f3:21,f4:15},
  {p:10,g:95,f1:21,f2:18,f3:32,f4:16},
  {p:15,g:109,f1:25,f2:20,f3:34,f4:17},
  {p:20,g:112,f1:26,f2:21,f3:34,f4:17},
  {p:25,g:124,f1:29,f2:23,f3:35,f4:20},
  {p:30,g:130,f1:30,f2:26,f3:39,f4:22},
  {p:35,g:131,f1:31,f2:27,f3:41,f4:23},
  {p:40,g:132,f1:32,f2:28,f3:43,f4:26},
  {p:45,g:137,f1:33,f2:28,f3:43,f4:26},
  {p:50,g:142,f1:33,f2:30,f3:47,f4:27},
  {p:55,g:143,f1:36,f2:33,f3:51,f4:29},
  {p:60,g:143,f1:40,f2:35,f3:53,f4:32},
  {p:65,g:146,f1:45,f2:36,f3:53,f4:34},
  {p:70,g:162,f1:50,f2:37,f3:53,f4:34},
  {p:75,g:174,f1:53,f2:37,f3:53,f4:34},
  {p:80,g:189,f1:55,f2:39,f3:54,f4:36},
  {p:85,g:192,f1:56,f2:40,f3:59,f4:39},
  {p:90,g:192,f1:71,f2:42,f3:61,f4:41},
  {p:95,g:236,f1:108,f2:42,f3:66,f4:41},
  {p:99,g:236,f1:108,f2:42,f3:66,f4:41}
];

// Seleciona tabela normativa por sexo e faixa etaria
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

// Interpola percentil a partir do escore bruto
function _etdahBuscarPercentil(escoreBruto, tabela, campo) {
  if (!tabela || tabela.length === 0 || escoreBruto == null) return null;
  // Se abaixo do minimo
  if (escoreBruto <= tabela[0][campo]) return tabela[0].p;
  // Se acima do maximo
  if (escoreBruto >= tabela[tabela.length - 1][campo]) return tabela[tabela.length - 1].p;
  // Interpolar
  for (var i = 0; i < tabela.length - 1; i++) {
    var v1 = tabela[i][campo];
    var v2 = tabela[i + 1][campo];
    if (escoreBruto >= v1 && escoreBruto <= v2) {
      if (v2 === v1) return tabela[i].p;
      var proporcao = (escoreBruto - v1) / (v2 - v1);
      return Math.round((tabela[i].p + proporcao * (tabela[i + 1].p - tabela[i].p)) * 10) / 10;
    }
  }
  return 50;
}

// Classificacao por percentil
function _etdahClassificar(percentil) {
  if (percentil == null) return {texto: 'N/A', classe: 'na'};
  if (percentil <= 20) return {texto: 'Inferior', classe: 'inferior'};
  if (percentil <= 40) return {texto: 'Media Inferior', classe: 'media-inferior'};
  if (percentil <= 60) return {texto: 'Media', classe: 'media'};
  if (percentil <= 80) return {texto: 'Media Superior', classe: 'media-superior'};
  return {texto: 'Superior', classe: 'superior'};
}

// Cache de respondentes para grafico multi-informante
var _etdahRespondentes = [];

// Funcao principal de calculo
function etdahCalcular() {
  var nome = document.getElementById('etdahNome').value.trim();
  var idade = document.getElementById('etdahIdade').value;
  var sexo = document.getElementById('etdahSexo').value;
  var respondente = document.getElementById('etdahRespondente').value.trim();
  var f1 = parseInt(document.getElementById('etdah_f1').value);
  var f2 = parseInt(document.getElementById('etdah_f2').value);
  var f3 = parseInt(document.getElementById('etdah_f3').value);
  var f4 = parseInt(document.getElementById('etdah_f4').value);

  if (!nome) { alert('Preencha o nome do paciente.'); return; }
  if (!idade) { alert('Preencha a idade.'); return; }
  if (!sexo) { alert('Selecione o sexo.'); return; }
  if (!respondente) { alert('Preencha quem respondeu.'); return; }
  if (isNaN(f1) || isNaN(f2) || isNaN(f3) || isNaN(f4)) {
    alert('Preencha todos os 4 escores brutos dos fatores.'); return;
  }

  var geral = f1 + f2 + f3 + f4;
  var tabela = _etdahSelecionarTabela(sexo, idade);
  var tabelaNome = (sexo && idade) ? (sexo + ', ' + idade + ' anos') : 'Geral';

  var pF1 = _etdahBuscarPercentil(f1, tabela, 'f1');
  var pF2 = _etdahBuscarPercentil(f2, tabela, 'f2');
  var pF3 = _etdahBuscarPercentil(f3, tabela, 'f3');
  var pF4 = _etdahBuscarPercentil(f4, tabela, 'f4');
  var pG = _etdahBuscarPercentil(geral, tabela, 'g');

  var cF1 = _etdahClassificar(pF1);
  var cF2 = _etdahClassificar(pF2);
  var cF3 = _etdahClassificar(pF3);
  var cF4 = _etdahClassificar(pF4);
  var cG = _etdahClassificar(pG);

  // Salvar no cache de respondentes
  _etdahRespondentes.push({
    respondente: respondente,
    nome: nome,
    idade: idade,
    sexo: sexo,
    escores: {f1: f1, f2: f2, f3: f3, f4: f4, geral: geral},
    percentis: {f1: pF1, f2: pF2, f3: pF3, f4: pF4, geral: pG},
    classificacoes: {f1: cF1, f2: cF2, f3: cF3, f4: cF4, geral: cG},
    tabelaUsada: tabelaNome,
    data: new Date().toISOString()
  });

  // Renderizar resultados
  _etdahRenderResultados();
}

function _etdahCorClassif(classe) {
  if (classe === 'inferior') return '#4caf50';
  if (classe === 'media-inferior') return '#8bc34a';
  if (classe === 'media') return '#ffc107';
  if (classe === 'media-superior') return '#ff9800';
  if (classe === 'superior') return '#f44336';
  return '#999';
}

function _etdahRenderResultados() {
  var el = document.getElementById('etdahResultados');
  if (!el) return;
  el.style.display = 'block';
  if (_etdahRespondentes.length === 0) {
    el.innerHTML = '<p style="color:#777;">Nenhum resultado calculado.</p>';
    return;
  }
  var html = '';
  // Tabela de todos os respondentes
  html += '<p style="font-weight:bold;color:#1565c0;font-size:14px;margin-bottom:10px;">Resultados (' + _etdahRespondentes.length + ' respondente' + (_etdahRespondentes.length > 1 ? 's' : '') + ')</p>';
  for (var i = 0; i < _etdahRespondentes.length; i++) {
    var r = _etdahRespondentes[i];
    html += '<div style="background:#f5f5f5;border-radius:8px;padding:12px;margin-bottom:10px;border-left:4px solid #1565c0;">';
    html += '<p style="font-weight:bold;font-size:13px;color:#333;margin-bottom:8px;">' + r.respondente + ' <span style="font-weight:normal;color:#777;font-size:11px;">(Norma: ' + r.tabelaUsada + ')</span></p>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html += '<tr style="background:#e3f2fd;"><th style="padding:6px;text-align:left;">Fator</th><th style="padding:6px;text-align:center;">Bruto</th><th style="padding:6px;text-align:center;">Percentil</th><th style="padding:6px;text-align:left;">Classificacao</th></tr>';
    var fatores = [
      {nome:'F1 - Regulacao Emocional',bruto:r.escores.f1,perc:r.percentis.f1,cl:r.classificacoes.f1},
      {nome:'F2 - Hiperatividade/Impulsividade',bruto:r.escores.f2,perc:r.percentis.f2,cl:r.classificacoes.f2},
      {nome:'F3 - Comportamento Adaptativo',bruto:r.escores.f3,perc:r.percentis.f3,cl:r.classificacoes.f3},
      {nome:'F4 - Atencao',bruto:r.escores.f4,perc:r.percentis.f4,cl:r.classificacoes.f4},
      {nome:'ESCORE GERAL',bruto:r.escores.geral,perc:r.percentis.geral,cl:r.classificacoes.geral}
    ];
    for (var j = 0; j < fatores.length; j++) {
      var f = fatores[j];
      var bg = j === 4 ? 'background:#e8eaf6;font-weight:bold;' : '';
      html += '<tr style="' + bg + 'border-bottom:1px solid #e0e0e0;">';
      html += '<td style="padding:5px;">' + f.nome + '</td>';
      html += '<td style="padding:5px;text-align:center;">' + f.bruto + '</td>';
      html += '<td style="padding:5px;text-align:center;font-weight:bold;">' + (f.perc != null ? f.perc : '-') + '</td>';
      html += '<td style="padding:5px;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:white;background:' + _etdahCorClassif(f.cl.classe) + ';">' + f.cl.texto + '</span></td>';
      html += '</tr>';
    }
    html += '</table></div>';
  }
  // Botoes
  html += '<div style="text-align:center;margin-top:15px;">';
  html += '<button onclick="etdahGerarPDF()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#1565c0,#42a5f5);color:white;">Gerar PDF com Grafico</button>';
  html += '<button onclick="etdahLimpar()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#e53935,#ef5350);color:white;margin-left:8px;">Limpar Tudo</button>';
  html += '</div>';
  el.innerHTML = html;
}

function etdahLimpar() {
  _etdahRespondentes = [];
  var el = document.getElementById('etdahResultados');
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  var ids = ['etdahNome','etdahIdade','etdahSexo','etdahRespondente','etdah_f1','etdah_f2','etdah_f3','etdah_f4'];
  for (var i = 0; i < ids.length; i++) {
    var inp = document.getElementById(ids[i]);
    if (inp) inp.value = '';
  }
}

function etdahGerarPDF() {
  if (_etdahRespondentes.length === 0) { alert('Calcule pelo menos um respondente antes de gerar o PDF.'); return; }
  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') { alert('jsPDF nao carregado.'); return; }
  var jsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDF) { alert('jsPDF nao disponivel.'); return; }
  var doc = new jsPDF('p', 'mm', 'a4');
  var r0 = _etdahRespondentes[0];

  // === PAGINA 1: DADOS + TABELA ===
  // Cabecalho
  doc.setFillColor(21,101,192); doc.rect(0,0,210,22,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont(undefined,'bold');
  doc.text('ETDAH-PAIS', 105, 10, {align:'center'});
  doc.setFontSize(9); doc.setFont(undefined,'normal');
  doc.text('Escala de Avaliacao de Comportamentos Infantojuvenis no TDAH - Versao para Pais', 105, 16, {align:'center'});
  doc.text('(Benczik, 2018)', 105, 20, {align:'center'});

  var y = 30;
  doc.setTextColor(50,50,50); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Dados do Paciente', 15, y); y += 7;
  doc.setFont(undefined,'normal'); doc.setFontSize(9);
  doc.text('Nome: ' + r0.nome, 15, y); y += 5;
  doc.text('Idade: ' + r0.idade + ' anos   |   Sexo: ' + r0.sexo, 15, y); y += 5;
  doc.text('Norma utilizada: ' + r0.tabelaUsada, 15, y); y += 5;
  doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 15, y); y += 10;

  // Tabela de resultados por respondente
  for (var ri = 0; ri < _etdahRespondentes.length; ri++) {
    var resp = _etdahRespondentes[ri];
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(21,101,192);
    doc.text('Respondente: ' + resp.respondente, 15, y); y += 6;
    // Header tabela
    doc.setFillColor(227,242,253); doc.rect(15, y-3, 180, 7, 'F');
    doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
    doc.text('Fator', 17, y+1);
    doc.text('Bruto', 95, y+1, {align:'center'});
    doc.text('Percentil', 125, y+1, {align:'center'});
    doc.text('Classificacao', 165, y+1, {align:'center'});
    y += 8;
    var linhas = [
      ['F1 - Regulacao Emocional', resp.escores.f1, resp.percentis.f1, resp.classificacoes.f1],
      ['F2 - Hiperatividade/Impulsividade', resp.escores.f2, resp.percentis.f2, resp.classificacoes.f2],
      ['F3 - Comportamento Adaptativo', resp.escores.f3, resp.percentis.f3, resp.classificacoes.f3],
      ['F4 - Atencao', resp.escores.f4, resp.percentis.f4, resp.classificacoes.f4],
      ['ESCORE GERAL', resp.escores.geral, resp.percentis.geral, resp.classificacoes.geral]
    ];
    doc.setFont(undefined,'normal');
    for (var li = 0; li < linhas.length; li++) {
      var ln = linhas[li];
      if (li === 4) { doc.setFont(undefined,'bold'); doc.setFillColor(232,234,246); doc.rect(15, y-3, 180, 6, 'F'); }
      doc.setTextColor(50,50,50);
      doc.text(ln[0], 17, y);
      doc.text(String(ln[1]), 95, y, {align:'center'});
      doc.text(ln[2] != null ? String(ln[2]) : '-', 125, y, {align:'center'});
      doc.text(ln[3].texto, 165, y, {align:'center'});
      y += 6;
    }
    doc.setFont(undefined,'normal');
    y += 5;
  }

  // === PAGINA 2: GRAFICO DE PERFIL ===
  doc.addPage();
  // Cabecalho
  doc.setFillColor(21,101,192); doc.rect(0,0,210,18,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont(undefined,'bold');
  doc.text('ETDAH-PAIS - Perfil em Percentis', 105, 12, {align:'center'});

  var gy = 26;
  doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont(undefined,'normal');
  doc.text('Paciente: ' + r0.nome + '   |   ' + _etdahRespondentes.length + ' respondente(s)', 105, gy, {align:'center'});
  gy += 4;
  doc.setFontSize(7);
  doc.text('Comparacao entre diferentes respondentes', 105, gy, {align:'center'});
  gy += 8;

  // Dimensoes do grafico
  var gX = 35; var gW = 145; var gH = 90;
  var yBase = gy + gH; var yTop = gy;

  // Pontos de corte em percentil (conforme classificacao ETDAH)
  // <=20 Inferior | 21-40 Media Inferior | 41-60 Media | 61-80 Media Superior | >80 Superior
  var y20 = yBase - (20/100)*gH;
  var y40 = yBase - (40/100)*gH;
  var y60 = yBase - (60/100)*gH;
  var y80 = yBase - (80/100)*gH;

  // 5 faixas coloridas (de baixo para cima)
  // Verde: 0-20 (Inferior = bom, sem prejuizo)
  doc.setFillColor(232,245,233); doc.rect(gX, y20, gW, yBase - y20, 'F');
  // Verde claro: 20-40 (Media Inferior)
  doc.setFillColor(241,248,233); doc.rect(gX, y40, gW, y20 - y40, 'F');
  // Amarelo: 40-60 (Media)
  doc.setFillColor(255,248,225); doc.rect(gX, y60, gW, y40 - y60, 'F');
  // Laranja: 60-80 (Media Superior = alerta)
  doc.setFillColor(255,243,224); doc.rect(gX, y80, gW, y60 - y80, 'F');
  // Vermelho: 80-100 (Superior = prejuizo grave)
  doc.setFillColor(255,235,238); doc.rect(gX, yTop, gW, y80 - yTop, 'F');

  // Labels das faixas (lado esquerdo)
  doc.setFontSize(6); doc.setFont(undefined,'bold');
  doc.setTextColor(46,125,50); doc.text('Inferior', gX - 2, yBase - 6, {align:'right'});
  doc.setTextColor(104,159,56); doc.text('Med.Inf.', gX - 2, (y20+y40)/2, {align:'right'});
  doc.setTextColor(255,160,0); doc.text('Media', gX - 2, (y40+y60)/2, {align:'right'});
  doc.setTextColor(230,81,0); doc.text('Med.Sup.', gX - 2, (y60+y80)/2, {align:'right'});
  doc.setTextColor(198,40,40); doc.text('Superior', gX - 2, yTop + 6, {align:'right'});

  // Linhas tracejadas nos pontos de corte
  doc.setLineWidth(0.2);
  var cortes = [y20, y40, y60, y80];
  var coresCorte = [[76,175,80],[139,195,74],[255,193,7],[255,152,0]];
  for (var ci = 0; ci < cortes.length; ci++) {
    doc.setDrawColor(coresCorte[ci][0], coresCorte[ci][1], coresCorte[ci][2]);
    for (var dx = gX; dx < gX + gW; dx += 3) { doc.line(dx, cortes[ci], dx + 1.5, cortes[ci]); }
  }

  // Eixos
  doc.setDrawColor(150,150,150); doc.setLineWidth(0.3);
  doc.line(gX, yTop, gX, yBase);
  doc.line(gX, yBase, gX + gW, yBase);

  // Escala Y (percentis)
  doc.setFontSize(6.5); doc.setFont(undefined,'normal'); doc.setTextColor(100,100,100);
  for (var pv = 0; pv <= 100; pv += 10) {
    var yv = yBase - (pv/100)*gH;
    doc.text(String(pv), gX - 4, yv + 1.5, {align:'right'});
    if (pv > 0 && pv < 100) { doc.setDrawColor(230,230,230); doc.setLineWidth(0.1); doc.line(gX, yv, gX + gW, yv); }
  }

  // Labels eixo X (5 pontos: F1, F2, F3, F4, TOTAL)
  var labelsX = ['F1 - R.E.', 'F2 - H.I.', 'F3 - C.A.', 'F4 - At.', 'TOTAL'];
  var nPontos = 5;
  var stepX = gW / (nPontos - 1);
  doc.setFontSize(7); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
  for (var lx = 0; lx < labelsX.length; lx++) {
    var px = gX + lx * stepX;
    doc.text(labelsX[lx], px, yBase + 5, {align:'center'});
  }

  // Cores para respondentes
  var cores = [[21,101,192],[211,47,47],[56,142,60],[156,39,176],[255,111,0],[0,151,167],[121,85,72]];

  // Plotar linhas de cada respondente
  for (var ii = 0; ii < _etdahRespondentes.length; ii++) {
    var inf = _etdahRespondentes[ii];
    var cor = cores[ii % cores.length];
    var vals = [inf.percentis.f1, inf.percentis.f2, inf.percentis.f3, inf.percentis.f4, inf.percentis.geral];
    // Linha
    doc.setDrawColor(cor[0], cor[1], cor[2]); doc.setLineWidth(1.0);
    for (var pi = 0; pi < vals.length - 1; pi++) {
      var px1 = gX + pi * stepX;
      var py1 = yBase - ((vals[pi] || 0)/100)*gH;
      var px2 = gX + (pi+1) * stepX;
      var py2 = yBase - ((vals[pi+1] || 0)/100)*gH;
      doc.line(px1, py1, px2, py2);
    }
    // Pontos + valores
    doc.setFillColor(cor[0], cor[1], cor[2]);
    doc.setFontSize(7); doc.setFont(undefined,'bold');
    doc.setTextColor(cor[0], cor[1], cor[2]);
    for (var pp = 0; pp < vals.length; pp++) {
      var ppx = gX + pp * stepX;
      var ppy = yBase - ((vals[pp] || 0)/100)*gH;
      doc.circle(ppx, ppy, 1.5, 'F');
      doc.text(String(vals[pp] != null ? vals[pp] : ''), ppx, ppy - 3, {align:'center'});
    }
  }

  // Legenda
  var legY = yBase + 14;
  doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
  doc.text('Respondentes:', gX, legY); legY += 5;
  for (var lgi = 0; lgi < _etdahRespondentes.length; lgi++) {
    var lgCor = cores[lgi % cores.length];
    doc.setFillColor(lgCor[0], lgCor[1], lgCor[2]);
    doc.rect(gX, legY - 2, 8, 3, 'F');
    doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(50,50,50);
    doc.text(_etdahRespondentes[lgi].respondente, gX + 11, legY);
    legY += 5;
  }

  // Nota interpretativa
  legY += 5;
  doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor(130,130,130);
  doc.text('Interpretacao: Escores altos (percentis elevados) em todos os fatores refletem prejuizo.', gX, legY);
  legY += 4;
  doc.text('Classificacao: Inferior (<=20) | Media Inferior (21-40) | Media (41-60) | Media Superior (61-80) | Superior (>80)', gX, legY);
  legY += 4;
  doc.text('Faixas: Verde = sem prejuizo | Amarelo = tipico | Laranja = alerta | Vermelho = prejuizo significativo', gX, legY);

  // Nota importante
  legY += 10;
  doc.setFontSize(7); doc.setFont(undefined,'normal'); doc.setTextColor(80,80,80);
  doc.text('IMPORTANTE: Escalas nao fazem diagnostico. Sao ferramentas auxiliares de rastreamento.', gX, legY);
  legY += 4;
  doc.text('Referencia: BENCZIK, E. B. P. ETDAH-PAIS. Sao Paulo: Memnon, 2018.', gX, legY);

  // Rodape
  var totalPages = doc.internal.getNumberOfPages();
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(50,50,50); doc.rect(0,287,210,10,'F');
    doc.setTextColor(200,200,200); doc.setFontSize(7); doc.setFont(undefined,'normal');
    doc.text('SYM Online | ETDAH-PAIS | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + totalPages, 105, 293, {align:'center'});
  }

  // Salvar
  var ts = new Date();
  var tsStr = ts.getFullYear() + String(ts.getMonth()+1).padStart(2,'0') + String(ts.getDate()).padStart(2,'0');
  doc.save('ETDAH-PAIS_' + r0.nome.replace(/\s+/g,'_') + '_' + tsStr + '.pdf');
}

// Atualiza switchCorrecaoSubTab para suportar ETDAH
(function() {
  var _origSwitch = window.switchCorrecaoSubTab;
  window.switchCorrecaoSubTab = function(tab) {
    // Reset BVRT
    var btnBvrt = document.getElementById('subTabBvrt');
    var contentBvrt = document.getElementById('correcaoBvrt');
    if (btnBvrt) { btnBvrt.style.borderBottom = '3px solid transparent'; btnBvrt.style.background = '#f5f5f5'; btnBvrt.style.color = '#777'; }
    if (contentBvrt) contentBvrt.style.display = 'none';
    // Reset ETDAH
    var btnEtdah = document.getElementById('subTabEtdah');
    var contentEtdah = document.getElementById('correcaoEtdah');
    if (btnEtdah) { btnEtdah.style.borderBottom = '3px solid transparent'; btnEtdah.style.background = '#f5f5f5'; btnEtdah.style.color = '#777'; }
    if (contentEtdah) contentEtdah.style.display = 'none';
    // Ativar selecionado
    if (tab === 'bvrt') {
      if (contentBvrt) contentBvrt.style.display = 'block';
      if (btnBvrt) { btnBvrt.style.background = '#ede7f6'; btnBvrt.style.color = '#4a148c'; btnBvrt.style.borderBottom = '3px solid #4a148c'; }
    } else if (tab === 'etdah') {
      if (contentEtdah) contentEtdah.style.display = 'block';
      if (btnEtdah) { btnEtdah.style.background = '#e3f2fd'; btnEtdah.style.color = '#1565c0'; btnEtdah.style.borderBottom = '3px solid #1565c0'; }
    }
  };
})();

// Atualiza soma total e classificacao em tempo real ao digitar
function _etdahAtualizarTotal() {
  var f1 = parseInt(document.getElementById('etdah_f1').value) || 0;
  var f2 = parseInt(document.getElementById('etdah_f2').value) || 0;
  var f3 = parseInt(document.getElementById('etdah_f3').value) || 0;
  var f4 = parseInt(document.getElementById('etdah_f4').value) || 0;
  var total = f1 + f2 + f3 + f4;
  var elTotal = document.getElementById('etdah_total');
  if (elTotal) elTotal.textContent = total > 0 ? total : '0';

  // Buscar tabela pela selecao atual
  var sexo = document.getElementById('etdahSexo').value;
  var idade = document.getElementById('etdahIdade').value;
  var tabela = _etdahSelecionarTabela(sexo, idade);

  // Classificacao de cada fator em tempo real
  var campos = [
    {id: 'etdah_f1', campo: 'f1', elClassif: 'etdah_f1_classif', valor: f1},
    {id: 'etdah_f2', campo: 'f2', elClassif: 'etdah_f2_classif', valor: f2},
    {id: 'etdah_f3', campo: 'f3', elClassif: 'etdah_f3_classif', valor: f3},
    {id: 'etdah_f4', campo: 'f4', elClassif: 'etdah_f4_classif', valor: f4}
  ];
  for (var i = 0; i < campos.length; i++) {
    var c = campos[i];
    var elC = document.getElementById(c.elClassif);
    if (!elC) continue;
    if (c.valor > 0) {
      var perc = _etdahBuscarPercentil(c.valor, tabela, c.campo);
      var cl = _etdahClassificar(perc);
      elC.textContent = 'Percentil ' + (perc != null ? perc : '-') + ' | ' + cl.texto;
      elC.style.color = _etdahCorClassif(cl.classe);
      elC.style.fontWeight = 'bold';
    } else {
      elC.textContent = '\u2014';
      elC.style.color = '#555';
      elC.style.fontWeight = 'normal';
    }
  }
  // Total
  var elTotalC = document.getElementById('etdah_total_classif');
  if (elTotalC && total > 0) {
    var percT = _etdahBuscarPercentil(total, tabela, 'g');
    var clT = _etdahClassificar(percT);
    elTotalC.textContent = 'Percentil ' + (percT != null ? percT : '-') + ' | ' + clT.texto;
    elTotalC.style.color = _etdahCorClassif(clT.classe);
    elTotalC.style.fontWeight = 'bold';
  } else if (elTotalC) {
    elTotalC.textContent = '\u2014';
    elTotalC.style.color = '#555';
    elTotalC.style.fontWeight = 'normal';
  }
}
