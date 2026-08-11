// ============================================================
// ETDAH-CriAd - Correcao Automatica (Item a Item)
// Escala de Autoavaliacao do TDAH - Versao para Criancas e Adolescentes
// (Benczik, 2018) - 22 itens, 2 fatores, escala Likert 1-4
// AUTOAVALIACAO: a propria crianca/adolescente responde
// ============================================================

// === ITENS POR FATOR ===
var _criadFator1 = [
  {num:1,texto:'Nao consigo esperar o tempo suficiente para ter o que quero'},
  {num:2,texto:'Me acham agitado/a (inquieto/a)'},
  {num:3,texto:'Sou teimoso(a)'},
  {num:4,texto:'Tenho muita pressa para fazer as coisas'},
  {num:5,texto:'Todos falam que eu sou barulhento(a)'},
  {num:6,texto:'Quando percebo ja falei ou fiz coisas erradas'},
  {num:7,texto:'Dizem que falo muito'},
  {num:8,texto:'Mexo e balanco as pernas, quando estou sentado(a)'},
  {num:9,texto:'Eu me levanto da carteira durante a aula'},
  {num:10,texto:'Me movimento muito (me mexo muito)'},
  {num:11,texto:'Nao tenho paciencia de esperar (por exemplo, na fila)'},
  {num:12,texto:'Vivo correndo, ou subindo nos sofas, ou em muros ou muretas'}
];

var _criadFator2 = [
  {num:1,texto:'Preciso de mais tempo para terminar as tarefas'},
  {num:2,texto:'Presto atencao em outras coisas e me perco na licao'},
  {num:3,texto:'E dificil para mim, fazer os exercicios e as provas'},
  {num:4,texto:'Minha mae tem que me lembrar de fazer as coisas'},
  {num:5,texto:'Para mim e dificil aprender coisas novas'},
  {num:6,texto:'Meu caderno e desorganizado'},
  {num:7,texto:'Erro nas licoes por falta de atencao'},
  {num:8,texto:'E dificil terminar o que comeco'},
  {num:9,texto:'Minhas notas estao ruins'},
  {num:10,texto:'Me perco nos sinais das contas de Matematica'}
];

// === TABELAS NORMATIVAS (do manual) ===
// Cada entrada: {p: percentil, g: escore geral, f1: fator1 HI, f2: fator2 DA}

var _criadNormaGeral = [
  {p:1,g:22.7,f1:12,f2:10},{p:5,g:28.6,f1:14,f2:12},
  {p:10,g:34,f1:17,f2:13},{p:15,g:37,f1:19,f2:15},
  {p:20,g:40.6,f1:22,f2:16},{p:25,g:42.2,f1:23,f2:16},
  {p:30,g:44,f1:24,f2:17},{p:35,g:45.5,f1:26,f2:19},
  {p:40,g:47,f1:27,f2:19.2},{p:45,g:49,f1:28,f2:20},
  {p:50,g:50,f1:29,f2:21},{p:55,g:51.1,f1:30,f2:22},
  {p:60,g:53,f1:32,f2:23},{p:65,g:55,f1:33,f2:24},
  {p:70,g:58,f1:35,f2:24},{p:75,g:60,f1:36,f2:26},
  {p:80,g:62,f1:38,f2:26},{p:85,g:65.05,f1:39,f2:27},
  {p:90,g:69,f1:41,f2:29},{p:95,g:71.3,f1:44,f2:29},
  {p:99,g:81.5,f1:48,f2:37.27}
];

var _criadNorma6a7 = [
  {p:1,g:22,f1:12,f2:10},{p:5,g:23,f1:12,f2:10},
  {p:10,g:24,f1:13,f2:12},{p:15,g:29.5,f1:14,f2:13},
  {p:20,g:35,f1:16,f2:15},{p:25,g:40,f1:20,f2:16.5},
  {p:30,g:44,f1:22,f2:17},{p:35,g:45,f1:24,f2:19},
  {p:40,g:48,f1:24,f2:20},{p:45,g:48.5,f1:25.5,f2:21.5},
  {p:50,g:48.5,f1:25.5,f2:21.5},{p:55,g:51.5,f1:27,f2:24},
  {p:60,g:53,f1:29,f2:24},{p:65,g:55,f1:32,f2:26},
  {p:70,g:61,f1:37,f2:26},{p:75,g:63,f1:38,f2:28},
  {p:80,g:65,f1:39,f2:28},{p:85,g:68.5,f1:41,f2:30},
  {p:90,g:76,f1:45,f2:36},{p:95,g:80,f1:48,f2:36.5},
  {p:99,g:80,f1:48,f2:36.5}
];

var _criadNorma8a9 = [
  {p:1,g:24,f1:13,f2:11},{p:5,g:29.8,f1:15.4,f2:13.8},
  {p:10,g:33.8,f1:16,f2:16},{p:15,g:36.1,f1:17,f2:17},
  {p:20,g:39,f1:20,f2:17},{p:25,g:42.2,f1:23,f2:19},
  {p:30,g:44,f1:23,f2:19.9},{p:35,g:45,f1:24,f2:20},
  {p:40,g:45.2,f1:24.6,f2:20},{p:45,g:47,f1:25,f2:21},
  {p:50,g:48,f1:26,f2:21},{p:55,g:49,f1:26.7,f2:22},
  {p:60,g:50.4,f1:28.4,f2:22},{p:65,g:51,f1:31,f2:23},
  {p:70,g:51.8,f1:31,f2:23},{p:75,g:53.5,f1:32,f2:22},
  {p:80,g:58.2,f1:35,f2:25},{p:85,g:62,f1:36,f2:26.6},
  {p:90,g:69.8,f1:43.2,f2:28.6},{p:95,g:69.8,f1:43.2,f2:28.6},
  {p:99,g:69.8,f1:43.2,f2:28.6}
];

var _criadNorma10a11 = [
  {p:1,g:24.2,f1:14,f2:10},{p:5,g:30.4,f1:16.8,f2:12},
  {p:10,g:35.8,f1:21,f2:13},{p:15,g:40,f1:22.2,f2:15},
  {p:20,g:42,f1:25,f2:15},{p:25,g:43,f1:27,f2:16},
  {p:30,g:45,f1:27,f2:16},{p:35,g:46,f1:27.8,f2:17},
  {p:40,g:48,f1:30,f2:18},{p:45,g:50,f1:32,f2:19},
  {p:50,g:50,f1:32,f2:19},{p:55,g:52,f1:32,f2:19},
  {p:60,g:53,f1:33.8,f2:20},{p:65,g:54.2,f1:35,f2:22},
  {p:70,g:57,f1:36,f2:22.6},{p:75,g:59,f1:36,f2:23},
  {p:80,g:60,f1:38,f2:24.4},{p:85,g:66,f1:43,f2:26},
  {p:90,g:69,f1:43.6,f2:31},{p:95,g:70.6,f1:43.6,f2:31},
  {p:99,g:75.7,f1:45.9,f2:33}
];

var _criadNorma12a13 = [
  {p:1,g:24,f1:14,f2:10},{p:5,g:32.2,f1:18.4,f2:12.4},
  {p:10,g:34.8,f1:21,f2:13},{p:15,g:37,f1:22,f2:14},
  {p:20,g:40.6,f1:23.6,f2:15},{p:25,g:44,f1:24,f2:16},
  {p:30,g:45.4,f1:26,f2:16.4},{p:35,g:46,f1:27,f2:18},
  {p:40,g:47,f1:28,f2:19.2},{p:45,g:49,f1:29,f2:20},
  {p:50,g:49,f1:29,f2:20},{p:55,g:52.4,f1:30.4,f2:22},
  {p:60,g:53,f1:32,f2:22.8},{p:65,g:55.2,f1:34,f2:23},
  {p:70,g:57.6,f1:35,f2:24},{p:75,g:59,f1:36,f2:25},
  {p:80,g:62,f1:39,f2:26},{p:85,g:65.4,f1:39,f2:26},
  {p:90,g:69,f1:40.2,f2:29},{p:95,g:72.2,f1:42,f2:30.6},
  {p:99,g:72.2,f1:42,f2:30.6}
];

var _criadNorma14a15 = [
  {p:1,g:30,f1:17,f2:13},{p:5,g:35,f1:19.7,f2:15},
  {p:10,g:40.7,f1:21,f2:15.7},{p:15,g:42.5,f1:24.2,f2:16.5},
  {p:20,g:44,f1:23,f2:19.4},{p:25,g:45.25,f1:24.25,f2:20},
  {p:30,g:48,f1:27.1,f2:20},{p:35,g:49.95,f1:28,f2:20},
  {p:40,g:50.8,f1:29,f2:21},{p:45,g:52.3,f1:30,f2:22.65},
  {p:50,g:52.3,f1:30,f2:22.65},{p:55,g:55.5,f1:30.5,f2:23.5},
  {p:60,g:57.2,f1:32,f2:25},{p:65,g:60,f1:32.05,f2:26},
  {p:70,g:60,f1:34,f2:26.9},{p:75,g:62.75,f1:37,f2:27.75},
  {p:80,g:63.6,f1:38.6,f2:28},{p:85,g:67.45,f1:39,f2:29},
  {p:90,g:69,f1:44.1,f2:31},{p:95,g:71,f1:44.15,f2:32},
  {p:99,g:71,f1:44.15,f2:32}
];

// === FUNCOES AUXILIARES ===
function _criadSelecionarTabela(idade) {
  var i = parseInt(idade);
  if (isNaN(i)) return _criadNormaGeral;
  if (i >= 6 && i <= 7) return _criadNorma6a7;
  if (i >= 8 && i <= 9) return _criadNorma8a9;
  if (i >= 10 && i <= 11) return _criadNorma10a11;
  if (i >= 12 && i <= 13) return _criadNorma12a13;
  if (i >= 14 && i <= 15) return _criadNorma14a15;
  return _criadNormaGeral;
}

function _criadBuscarPercentil(escoreBruto, tabela, campo) {
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

function _criadClassificar(percentil) {
  if (percentil == null) return {texto: 'N/A', classe: 'na'};
  if (percentil <= 20) return {texto: 'Inferior', classe: 'inferior'};
  if (percentil <= 40) return {texto: 'Media Inferior', classe: 'media-inferior'};
  if (percentil <= 60) return {texto: 'Media', classe: 'media'};
  if (percentil <= 80) return {texto: 'Media Superior', classe: 'media-superior'};
  return {texto: 'Superior', classe: 'superior'};
}

function _criadCorClassif(classe) {
  if (classe === 'inferior') return '#4caf50';
  if (classe === 'media-inferior') return '#8bc34a';
  if (classe === 'media') return '#ffc107';
  if (classe === 'media-superior') return '#ff9800';
  if (classe === 'superior') return '#f44336';
  return '#999';
}

// === INTERPRETACOES TEXTUAIS (do manual) ===
var _criadInterpretacoes = {
  f1_alto: 'Hiperatividade/Impulsividade: Comportamento agitado, inquieto, excesso de atividade motora corporal, mexer-se muito, ser falante e barulhento, impaciente e com dificuldade de esperar. Falha no controle inibitorio, acao sem reflexao anterior, impulsividade, levando a comportamentos inconsequentes e imprudentes. Tendencia a ser teimoso, persistindo em uma mesma ideia com pouca flexibilidade mental. Consistente com a apresentacao dos sintomas de Hiperatividade/Impulsividade do DSM-5.',
  f1_baixo: 'Hiperatividade/Impulsividade: Nivel de atividade motora e de ritmo motor dentro do esperado para a faixa etaria. Presenca de comportamentos com caracteristicas de autocontrole, contencao de impulsos, tendencia a agir com prudencia e com flexibilidade na resolucao dos conflitos.',
  f2_alto: 'Deficit de Atencao: Prejuizos no padrao atencional relacionados com falha na atencao seletiva, sustentada e concentrada, falta de foco, falta de persistencia do esforco. Necessidade de mais tempo para finalizar tarefas, dificuldade para fazer exercicios e provas, para aprender coisas novas, desorganizacao, perder-se nas licoes, baixo desempenho escolar e problemas com memoria. Os responsaveis precisam supervisionar e lembrar a crianca/adolescente de cumprir suas responsabilidades, denotando pouca autonomia e comportamento dependente. Consistente com a apresentacao dos sintomas de Desatencao do DSM-5.',
  f2_baixo: 'Deficit de Atencao: Boa e adequada capacidade atencional, persistencia do esforco, capacidade para engajar-se em uma tarefa mantendo a motivacao necessaria do inicio ao fim, com comprometimento, independencia e autonomia.'
};

// === GERAR QUESTIONARIO HTML ===
function criadGerarQuestionario() {
  var el = document.getElementById('criadQuestionario');
  if (!el) return;
  var fatores = [
    {nome: 'Fator 1 - Hiperatividade / Impulsividade (HI)', itens: _criadFator1, id: 'f1', cor: '#e65100'},
    {nome: 'Fator 2 - Deficit de Atencao (DA)', itens: _criadFator2, id: 'f2', cor: '#1565c0'}
  ];
  var html = '';
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    html += '<div style="margin-bottom:15px;border:2px solid ' + f.cor + ';border-radius:10px;overflow:hidden;">';
    html += '<div style="background:' + f.cor + ';color:white;padding:8px 12px;font-size:12px;font-weight:bold;">' + f.nome + ' (' + f.itens.length + ' itens)';
    html += '<span style="float:right;font-size:13px;" id="criadSoma_' + f.id + '">Soma: 0</span></div>';
    html += '<div style="padding:8px;">';
    for (var i = 0; i < f.itens.length; i++) {
      var item = f.itens[i];
      html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #f0f0f0;font-size:11px;">';
      html += '<span style="min-width:22px;font-weight:bold;color:' + f.cor + ';">' + item.num + '.</span>';
      html += '<span style="flex:1;">' + item.texto + '</span>';
      html += '<input type="number" id="criad_' + f.id + '_' + i + '" min="1" max="4" style="width:36px;padding:4px;border:1px solid #ccc;border-radius:4px;text-align:center;font-size:13px;font-weight:bold;" oninput="_criadValidarItem(this);_criadAtualizarSomas();_criadAutoScroll(this)">';
      html += '</div>';
    }
    html += '</div></div>';
  }
  el.innerHTML = html;
}

// Valida que so aceita 1-4
function _criadValidarItem(el) {
  var v = parseInt(el.value);
  if (el.value !== '' && (isNaN(v) || v < 1 || v > 4)) {
    el.style.borderColor = '#f44336';
    el.style.background = '#ffebee';
  } else {
    el.style.borderColor = '#ccc';
    el.style.background = '';
  }
}

// Auto-scroll: ao digitar um valor valido, foco passa para o proximo input
function _criadAutoScroll(el) {
  var v = parseInt(el.value);
  if (el.value === '' || isNaN(v) || v < 1 || v > 4) return;
  var todos = document.querySelectorAll('#criadQuestionario input[type="number"]');
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

// === INTEGRACAO COM ABA PACIENTES ===
function criadPreencherPaciente() {
  var sel = document.getElementById('criadSelPac');
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
  var nomeEl = document.getElementById('criadNome');
  var idadeEl = document.getElementById('criadIdade');
  var sexoEl = document.getElementById('criadSexo');
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

// === ATUALIZAR SOMAS EM TEMPO REAL ===
function _criadAtualizarSomas() {
  var fatores = [
    {itens: _criadFator1, id: 'f1'},
    {itens: _criadFator2, id: 'f2'}
  ];
  var totalGeral = 0;
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    var soma = 0;
    var respondidos = 0;
    for (var i = 0; i < f.itens.length; i++) {
      var inp = document.getElementById('criad_' + f.id + '_' + i);
      if (inp && inp.value !== '') {
        var val = parseInt(inp.value);
        if (val >= 1 && val <= 4) {
          soma += val;
          respondidos++;
        }
      }
    }
    var elSoma = document.getElementById('criadSoma_' + f.id);
    if (elSoma) elSoma.textContent = 'Soma: ' + soma + ' (' + respondidos + '/' + f.itens.length + ')';
    totalGeral += soma;
  }
  var elTotal = document.getElementById('criadSomaTotal');
  if (elTotal) elTotal.textContent = totalGeral;
}

// === CALCULAR RESULTADOS ===
function criadCalcular() {
  var nome = document.getElementById('criadNome').value.trim();
  var idade = document.getElementById('criadIdade').value;
  var sexo = document.getElementById('criadSexo').value;
  if (!nome) { alert('Preencha o nome do paciente.'); return; }
  if (!idade) { alert('Preencha a idade.'); return; }
  if (!sexo) { alert('Selecione o sexo.'); return; }

  var fatores = [
    {itens: _criadFator1, id: 'f1'},
    {itens: _criadFator2, id: 'f2'}
  ];
  var escores = {};
  var totalItens = 0;
  var totalResp = 0;
  for (var fi = 0; fi < fatores.length; fi++) {
    var f = fatores[fi];
    var soma = 0;
    var resp = 0;
    for (var i = 0; i < f.itens.length; i++) {
      var inp = document.getElementById('criad_' + f.id + '_' + i);
      if (inp && inp.value !== '') {
        var val = parseInt(inp.value);
        if (val >= 1 && val <= 4) {
          soma += val;
          resp++;
        }
      }
      totalItens++;
    }
    totalResp += resp;
    escores[f.id] = soma;
  }
  if (totalResp < 22) {
    if (!confirm('Faltam ' + (22 - totalResp) + ' itens. Deseja calcular mesmo assim?')) return;
  }
  escores.geral = escores.f1 + escores.f2;

  var tabela = _criadSelecionarTabela(idade);
  var pF1 = _criadBuscarPercentil(escores.f1, tabela, 'f1');
  var pF2 = _criadBuscarPercentil(escores.f2, tabela, 'f2');
  var pG = _criadBuscarPercentil(escores.geral, tabela, 'g');

  var cF1 = _criadClassificar(pF1);
  var cF2 = _criadClassificar(pF2);
  var cG = _criadClassificar(pG);

  var faixaUsada = '';
  var i = parseInt(idade);
  if (i >= 6 && i <= 7) faixaUsada = '6 a 7 anos';
  else if (i >= 8 && i <= 9) faixaUsada = '8 a 9 anos';
  else if (i >= 10 && i <= 11) faixaUsada = '10 a 11 anos';
  else if (i >= 12 && i <= 13) faixaUsada = '12 a 13 anos';
  else if (i >= 14 && i <= 15) faixaUsada = '14 a 15 anos';
  else faixaUsada = 'Amostra Geral';

  window._criadResultado = {
    nome: nome, idade: idade, sexo: sexo,
    escores: escores,
    percentis: {f1: pF1, f2: pF2, geral: pG},
    classificacoes: {f1: cF1, f2: cF2, geral: cG},
    faixaUsada: faixaUsada,
    data: new Date().toISOString()
  };
  _criadRenderResultados();
}

// === RENDER RESULTADOS NA TELA ===
function _criadRenderResultados() {
  var el = document.getElementById('criadResultados');
  if (!el) return;
  el.style.display = 'block';
  var r = window._criadResultado;
  var html = '<p style="font-weight:bold;color:#e65100;font-size:14px;margin-bottom:10px;">Resultados da ETDAH-CriAd</p>';
  html += '<div style="background:#f5f5f5;border-radius:8px;padding:12px;margin-bottom:10px;border-left:4px solid #e65100;">';
  html += '<p style="font-weight:bold;font-size:13px;color:#333;margin-bottom:8px;">' + r.nome + ' <span style="font-weight:normal;color:#777;font-size:11px;">(' + r.idade + ' anos, ' + r.sexo + ' | Norma: ' + r.faixaUsada + ')</span></p>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
  html += '<tr style="background:#fff3e0;"><th style="padding:6px;text-align:left;">Fator</th><th style="padding:6px;text-align:center;">Bruto</th><th style="padding:6px;text-align:center;">Percentil</th><th style="padding:6px;text-align:left;">Classificacao</th></tr>';
  var linhas = [
    {n:'F1 - Hiperatividade/Impulsividade',b:r.escores.f1,p:r.percentis.f1,c:r.classificacoes.f1},
    {n:'F2 - Deficit de Atencao',b:r.escores.f2,p:r.percentis.f2,c:r.classificacoes.f2},
    {n:'ESCORE GERAL',b:r.escores.geral,p:r.percentis.geral,c:r.classificacoes.geral}
  ];
  for (var j = 0; j < linhas.length; j++) {
    var l = linhas[j];
    var bg = j === 2 ? 'background:#fff3e0;font-weight:bold;' : '';
    html += '<tr style="' + bg + 'border-bottom:1px solid #e0e0e0;"><td style="padding:5px;">' + l.n + '</td><td style="padding:5px;text-align:center;">' + l.b + '</td><td style="padding:5px;text-align:center;font-weight:bold;">' + (l.p != null ? l.p : '-') + '</td><td style="padding:5px;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;color:white;background:' + _criadCorClassif(l.c.classe) + ';">' + l.c.texto + '</span></td></tr>';
  }
  html += '</table>';
  // Interpretacoes
  html += '<div style="margin-top:12px;padding:10px;background:#fff8e1;border-radius:6px;font-size:11px;line-height:1.6;">';
  html += '<p style="font-weight:bold;margin-bottom:5px;">Interpretacao:</p>';
  html += '<p><strong>F1:</strong> ' + (r.percentis.f1 > 60 ? _criadInterpretacoes.f1_alto : _criadInterpretacoes.f1_baixo) + '</p>';
  html += '<p style="margin-top:5px;"><strong>F2:</strong> ' + (r.percentis.f2 > 60 ? _criadInterpretacoes.f2_alto : _criadInterpretacoes.f2_baixo) + '</p>';
  html += '</div>';
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;">';
  html += '<button onclick="criadGerarPDF()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#e65100,#ff9800);color:white;">Gerar PDF</button>';
  html += '<button onclick="criadLimpar()" style="padding:10px 25px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#e53935,#ef5350);color:white;margin-left:8px;">Limpar Tudo</button>';
  html += '</div>';
  el.innerHTML = html;
  el.scrollIntoView({behavior:'smooth',block:'start'});
}

function criadLimpar() {
  window._criadResultado = null;
  var el = document.getElementById('criadResultados');
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  var inputs = document.querySelectorAll('#criadQuestionario input[type="number"]');
  for (var i = 0; i < inputs.length; i++) { inputs[i].value = ''; inputs[i].style.borderColor = '#ccc'; inputs[i].style.background = ''; }
  _criadAtualizarSomas();
  var campos = ['criadNome','criadIdade','criadSexo'];
  for (var c = 0; c < campos.length; c++) { var inp = document.getElementById(campos[c]); if (inp) inp.value = ''; }
}

// === GERAR PDF ===
function criadGerarPDF() {
  if (!window._criadResultado) { alert('Calcule os resultados primeiro.'); return; }
  var jsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDF) { alert('jsPDF nao carregado.'); return; }
  var doc = new jsPDF('p', 'mm', 'a4');
  var r = window._criadResultado;
  var pageW = 210;

  // === PAGINA 1: CABECALHO + DADOS + TABELA + GRAFICO ===
  // Cabecalho
  doc.setFillColor(230,81,0); doc.rect(0,0,pageW,22,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont(undefined,'bold');
  doc.text('ETDAH-CriAd', pageW/2, 9, {align:'center'});
  doc.setFontSize(8); doc.setFont(undefined,'normal');
  doc.text('Escala de Autoavaliacao do TDAH - Versao para Criancas e Adolescentes (Benczik, 2018)', pageW/2, 15, {align:'center'});
  doc.text('Autoavaliacao respondida pela propria crianca/adolescente', pageW/2, 20, {align:'center'});

  var y = 28;
  // Dados do paciente
  doc.setTextColor(50,50,50); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Dados do Paciente', 15, y); y += 5;
  doc.setFont(undefined,'normal'); doc.setFontSize(9);
  doc.text('Nome: ' + r.nome, 15, y);
  doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 150, y); y += 5;
  doc.text('Idade: ' + r.idade + ' anos', 15, y);
  doc.text('Sexo: ' + r.sexo, 70, y);
  doc.text('Norma: ' + r.faixaUsada, 120, y); y += 7;

  // Tabela de resultados
  doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(230,81,0);
  doc.text('Resultados', 15, y); y += 5;
  // Header
  doc.setFillColor(255,243,224); doc.rect(15, y-3, 180, 7, 'F');
  doc.setFontSize(9); doc.setFont(undefined,'bold'); doc.setTextColor(50,50,50);
  doc.text('Fator', 17, y+1);
  doc.text('Bruto', 95, y+1, {align:'center'});
  doc.text('Percentil', 130, y+1, {align:'center'});
  doc.text('Classificacao', 170, y+1, {align:'center'});
  y += 8; doc.setFont(undefined,'normal');
  var lns = [
    ['F1 - Hiperatividade/Impulsividade', r.escores.f1, r.percentis.f1, r.classificacoes.f1],
    ['F2 - Deficit de Atencao', r.escores.f2, r.percentis.f2, r.classificacoes.f2],
    ['ESCORE GERAL', r.escores.geral, r.percentis.geral, r.classificacoes.geral]
  ];
  for (var li = 0; li < lns.length; li++) {
    if (li === 2) { doc.setFont(undefined,'bold'); doc.setFillColor(255,243,224); doc.rect(15,y-3,180,6,'F'); }
    doc.setTextColor(50,50,50);
    doc.text(lns[li][0], 17, y);
    doc.text(String(lns[li][1]), 95, y, {align:'center'});
    doc.text(lns[li][2] != null ? String(lns[li][2]) : '-', 130, y, {align:'center'});
    doc.text(lns[li][3].texto, 170, y, {align:'center'});
    y += 6;
  }
  doc.setFont(undefined,'normal'); y += 5;

  // === GRAFICO DE BARRAS ===
  doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(230,81,0);
  doc.text('Perfil em Percentis', 15, y); y += 6;
  var gX = 50, gW = 120, gH = 50;
  var yBase = y + gH;
  // Faixas de fundo
  var y20 = yBase - (20/100)*gH, y40 = yBase - (40/100)*gH;
  var y60 = yBase - (60/100)*gH, y80 = yBase - (80/100)*gH;
  doc.setFillColor(232,245,233); doc.rect(gX, y80, gW, yBase - y80 - (yBase-y20), 'F');
  doc.setFillColor(232,245,233); doc.rect(gX, y20, gW, yBase - y20, 'F');
  doc.setFillColor(241,248,233); doc.rect(gX, y40, gW, y20 - y40, 'F');
  doc.setFillColor(255,248,225); doc.rect(gX, y60, gW, y40 - y60, 'F');
  doc.setFillColor(255,243,224); doc.rect(gX, y80, gW, y60 - y80, 'F');
  doc.setFillColor(255,235,238); doc.rect(gX, y, gW, y80 - y, 'F');
  // Linhas guia
  doc.setDrawColor(200,200,200); doc.setLineWidth(0.2);
  doc.line(gX, y20, gX + gW, y20); doc.line(gX, y40, gX + gW, y40);
  doc.line(gX, y60, gX + gW, y60); doc.line(gX, y80, gX + gW, y80);
  // Labels
  doc.setFontSize(7); doc.setFont(undefined,'normal'); doc.setTextColor(100,100,100);
  doc.text('20', gX - 5, y20 + 1, {align:'right'});
  doc.text('40', gX - 5, y40 + 1, {align:'right'});
  doc.text('60', gX - 5, y60 + 1, {align:'right'});
  doc.text('80', gX - 5, y80 + 1, {align:'right'});
  doc.text('100', gX - 5, y + 1, {align:'right'});
  // Labels classificacao
  doc.setFontSize(6); doc.setTextColor(150,150,150);
  doc.text('Inferior', gX + gW + 2, (y20 + yBase)/2 + 1);
  doc.text('Med.Inf.', gX + gW + 2, (y40 + y20)/2 + 1);
  doc.text('Media', gX + gW + 2, (y60 + y40)/2 + 1);
  doc.text('Med.Sup.', gX + gW + 2, (y80 + y60)/2 + 1);
  doc.text('Superior', gX + gW + 2, (y + y80)/2 + 1);
  // Barras
  var percs = [r.percentis.f1, r.percentis.f2, r.percentis.geral];
  var nomes = ['HI', 'DA', 'Geral'];
  var cores = [[230,81,0],[21,101,192],[76,175,80]];
  var bW = 25, gap = (gW - 3*bW) / 4;
  for (var bi = 0; bi < 3; bi++) {
    var bx = gX + gap + bi * (bW + gap);
    var bh = (percs[bi] / 100) * gH;
    doc.setFillColor(cores[bi][0], cores[bi][1], cores[bi][2]);
    doc.rect(bx, yBase - bh, bW, bh, 'F');
    doc.setFontSize(9); doc.setFont(undefined,'bold'); doc.setTextColor(cores[bi][0], cores[bi][1], cores[bi][2]);
    doc.text(String(Math.round(percs[bi])), bx + bW/2, yBase - bh - 2, {align:'center'});
    doc.setFontSize(8); doc.setTextColor(50,50,50); doc.setFont(undefined,'normal');
    doc.text(nomes[bi], bx + bW/2, yBase + 5, {align:'center'});
  }
  y = yBase + 12;

  // === INTERPRETACAO TEXTUAL ===
  doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(230,81,0);
  doc.text('Interpretacao dos Resultados', 15, y); y += 6;
  doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(50,50,50);
  var txtF1 = r.percentis.f1 > 60 ? _criadInterpretacoes.f1_alto : _criadInterpretacoes.f1_baixo;
  var txtF2 = r.percentis.f2 > 60 ? _criadInterpretacoes.f2_alto : _criadInterpretacoes.f2_baixo;
  var linhasF1 = doc.splitTextToSize(txtF1, 175);
  var linhasF2 = doc.splitTextToSize(txtF2, 175);
  for (var lf = 0; lf < linhasF1.length; lf++) {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.text(linhasF1[lf], 17, y); y += 4;
  }
  y += 3;
  for (var lf2 = 0; lf2 < linhasF2.length; lf2++) {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.text(linhasF2[lf2], 17, y); y += 4;
  }
  y += 5;

  // === SINTESE ===
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(230,81,0);
  doc.text('Sintese', 15, y); y += 5;
  doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(50,50,50);
  var sintese = 'Na ETDAH-CriAd, ' + r.nome + ' apresentou no Fator 1 (Hiperatividade/Impulsividade) resultado classificado como ' + r.classificacoes.f1.texto + ' (Percentil = ' + Math.round(r.percentis.f1) + ') para a sua faixa etaria. ';
  sintese += 'No Fator 2 (Deficit de Atencao), obteve classificacao ' + r.classificacoes.f2.texto + ' (Percentil = ' + Math.round(r.percentis.f2) + '). ';
  sintese += 'No Escore Geral, obteve classificacao ' + r.classificacoes.geral.texto + ' (Percentil = ' + Math.round(r.percentis.geral) + '), segundo a propria percepcao da crianca/adolescente.';
  var linhasSint = doc.splitTextToSize(sintese, 175);
  for (var ls = 0; ls < linhasSint.length; ls++) {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.text(linhasSint[ls], 17, y); y += 4;
  }
  y += 5;

  // Nota importante
  if (y > 265) { doc.addPage(); y = 15; }
  doc.setFontSize(7); doc.setTextColor(120,120,120);
  var nota = 'Nota: Este instrumento e de rastreamento e nao substitui uma avaliacao clinica completa. Recomenda-se complementar com a ETDAH-PAIS e avaliacao multidisciplinar.';
  var linhasNota = doc.splitTextToSize(nota, 175);
  for (var ln = 0; ln < linhasNota.length; ln++) {
    doc.text(linhasNota[ln], 17, y); y += 3.5;
  }

  // Rodape
  doc.setFontSize(7); doc.setTextColor(150,150,150);
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), pageW/2, 290, {align:'center'});

  // Salvar
  var nomeArq = 'ETDAH-CriAd_' + r.nome.replace(/\s+/g,'_') + '_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.pdf';
  doc.save(nomeArq);
}

// === OVERRIDE switchCorrecaoSubTab para incluir CriAd ===
(function() {
  window.switchCorrecaoSubTab = function(tab) {
    var btnBvrt = document.getElementById('subTabBvrt');
    var contentBvrt = document.getElementById('correcaoBvrt');
    var btnEtdah = document.getElementById('subTabEtdah');
    var contentEtdah = document.getElementById('correcaoEtdah');
    var btnCriad = document.getElementById('subTabCriad');
    var contentCriad = document.getElementById('correcaoCriad');
    // Desativar todas
    if (btnBvrt) { btnBvrt.style.borderBottom='3px solid transparent'; btnBvrt.style.background='#f5f5f5'; btnBvrt.style.color='#777'; }
    if (contentBvrt) contentBvrt.style.display='none';
    if (btnEtdah) { btnEtdah.style.borderBottom='3px solid transparent'; btnEtdah.style.background='#f5f5f5'; btnEtdah.style.color='#777'; }
    if (contentEtdah) contentEtdah.style.display='none';
    if (btnCriad) { btnCriad.style.borderBottom='3px solid transparent'; btnCriad.style.background='#f5f5f5'; btnCriad.style.color='#777'; }
    if (contentCriad) contentCriad.style.display='none';
    // Ativar a selecionada
    if (tab === 'bvrt') {
      if (contentBvrt) contentBvrt.style.display='block';
      if (btnBvrt) { btnBvrt.style.background='#ede7f6'; btnBvrt.style.color='#4a148c'; btnBvrt.style.borderBottom='3px solid #4a148c'; }
    } else if (tab === 'etdah') {
      if (contentEtdah) contentEtdah.style.display='block';
      if (btnEtdah) { btnEtdah.style.background='#e3f2fd'; btnEtdah.style.color='#1565c0'; btnEtdah.style.borderBottom='3px solid #1565c0'; }
      etdahGerarQuestionario();
    } else if (tab === 'criad') {
      if (contentCriad) contentCriad.style.display='block';
      if (btnCriad) { btnCriad.style.background='#fff3e0'; btnCriad.style.color='#e65100'; btnCriad.style.borderBottom='3px solid #e65100'; }
      criadGerarQuestionario();
    }
  };
})();
