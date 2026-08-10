// ============================================================
// BVRT - Correcao Automatica (Teste de Retencao Visual de Benton)
// ============================================================

// Sub-abas da correcao
function switchCorrecaoSubTab(tab) {
  // Por enquanto so tem BVRT, mas preparado para futuras sub-abas
  var btn = document.getElementById('subTabBvrt');
  if (btn) { btn.style.borderBottom = '3px solid #4a148c'; btn.style.background = '#ede7f6'; btn.style.color = '#4a148c'; }
}

// Tabelas normativas - Memoria (Adm A) - Adultos por idade x escolaridade
var _bvrtNormasMemAdultos = {
  '16-17': { 'fundamental':{acertos:{m:6.8,dp:1.9},erros:{m:4.2,dp:2.8}}, 'medio':{acertos:{m:7.2,dp:1.7},erros:{m:3.8,dp:2.5}}, 'superior':{acertos:{m:7.2,dp:1.7},erros:{m:3.8,dp:2.5}} },
  '18-29': { 'fundamental':{acertos:{m:6.5,dp:2.1},erros:{m:4.5,dp:3.1}}, 'medio':{acertos:{m:7.1,dp:1.8},erros:{m:3.9,dp:2.7}}, 'superior':{acertos:{m:7.8,dp:1.6},erros:{m:3.2,dp:2.4}} },
  '30-39': { 'fundamental':{acertos:{m:6.2,dp:2.2},erros:{m:4.8,dp:3.2}}, 'medio':{acertos:{m:6.9,dp:1.9},erros:{m:4.1,dp:2.8}}, 'superior':{acertos:{m:7.6,dp:1.7},erros:{m:3.4,dp:2.5}} },
  '40-49': { 'fundamental':{acertos:{m:5.8,dp:2.3},erros:{m:5.2,dp:3.4}}, 'medio':{acertos:{m:6.6,dp:2.0},erros:{m:4.4,dp:2.9}}, 'superior':{acertos:{m:7.3,dp:1.8},erros:{m:3.7,dp:2.6}} },
  '50-59': { 'fundamental':{acertos:{m:5.5,dp:2.4},erros:{m:5.5,dp:3.5}}, 'medio':{acertos:{m:6.3,dp:2.1},erros:{m:4.7,dp:3.1}}, 'superior':{acertos:{m:7.0,dp:1.9},erros:{m:4.0,dp:2.8}} },
  '60-69': { 'fundamental':{acertos:{m:5.1,dp:2.5},erros:{m:5.9,dp:3.6}}, 'medio':{acertos:{m:5.9,dp:2.2},erros:{m:5.1,dp:3.2}}, 'superior':{acertos:{m:6.7,dp:2.0},erros:{m:4.3,dp:2.9}} },
  '70+':   { 'fundamental':{acertos:{m:4.6,dp:2.6},erros:{m:6.4,dp:3.8}}, 'medio':{acertos:{m:5.4,dp:2.3},erros:{m:5.6,dp:3.4}}, 'superior':{acertos:{m:6.2,dp:2.1},erros:{m:4.8,dp:3.1}} }
};

// Tabelas normativas - Copia (Adm C) - Adultos por idade x escolaridade
var _bvrtNormasCopAdultos = {
  '16-17': { 'fundamental':{acertos:{m:9.2,dp:1.3},erros:{m:0.8,dp:1.3}}, 'medio':{acertos:{m:9.5,dp:1.0},erros:{m:0.5,dp:1.0}}, 'superior':{acertos:{m:9.5,dp:1.0},erros:{m:0.5,dp:1.0}} },
  '18-29': { 'fundamental':{acertos:{m:9.0,dp:1.5},erros:{m:1.0,dp:1.5}}, 'medio':{acertos:{m:9.4,dp:1.1},erros:{m:0.6,dp:1.1}}, 'superior':{acertos:{m:9.7,dp:0.8},erros:{m:0.3,dp:0.8}} },
  '30-39': { 'fundamental':{acertos:{m:8.8,dp:1.6},erros:{m:1.2,dp:1.6}}, 'medio':{acertos:{m:9.2,dp:1.3},erros:{m:0.8,dp:1.3}}, 'superior':{acertos:{m:9.6,dp:0.9},erros:{m:0.4,dp:0.9}} },
  '40-49': { 'fundamental':{acertos:{m:8.5,dp:1.8},erros:{m:1.5,dp:1.8}}, 'medio':{acertos:{m:9.0,dp:1.4},erros:{m:1.0,dp:1.4}}, 'superior':{acertos:{m:9.4,dp:1.1},erros:{m:0.6,dp:1.1}} },
  '50-59': { 'fundamental':{acertos:{m:8.2,dp:1.9},erros:{m:1.8,dp:1.9}}, 'medio':{acertos:{m:8.8,dp:1.5},erros:{m:1.2,dp:1.5}}, 'superior':{acertos:{m:9.2,dp:1.2},erros:{m:0.8,dp:1.2}} },
  '60-69': { 'fundamental':{acertos:{m:7.9,dp:2.1},erros:{m:2.1,dp:2.1}}, 'medio':{acertos:{m:8.5,dp:1.7},erros:{m:1.5,dp:1.7}}, 'superior':{acertos:{m:9.0,dp:1.4},erros:{m:1.0,dp:1.4}} },
  '70+':   { 'fundamental':{acertos:{m:7.5,dp:2.3},erros:{m:2.5,dp:2.3}}, 'medio':{acertos:{m:8.1,dp:1.9},erros:{m:1.9,dp:1.9}}, 'superior':{acertos:{m:8.7,dp:1.6},erros:{m:1.3,dp:1.6}} }
};

// Categorias de erro - Memoria - Adolescentes/Universitarios (Tab 37)
var _bvrtCategMem = {
  'medio': { omissoes:{m:0.2,dp:0.6},distorcoes:{m:2.1,dp:1.9},perseveracoes:{m:0.5,dp:0.8},rotacoes:{m:0.3,dp:0.6},trocas:{m:1.1,dp:1.2},tamanho:{m:0.0,dp:0.1},esquerda:{m:1.6,dp:1.5},direita:{m:2.4,dp:2.0} },
  'superior': { omissoes:{m:0.2,dp:0.6},distorcoes:{m:1.1,dp:1.3},perseveracoes:{m:0.3,dp:0.5},rotacoes:{m:0.3,dp:0.4},trocas:{m:0.7,dp:1.0},tamanho:{m:0.0,dp:0.0},esquerda:{m:0.9,dp:1.0},direita:{m:1.6,dp:1.3} }
};

// Categorias de erro - Copia - Adolescentes/Universitarios (Tab 39)
var _bvrtCategCop = {
  'medio': { omissoes:{m:0.0,dp:0.0},distorcoes:{m:0.3,dp:0.5},perseveracoes:{m:0.0,dp:0.1},rotacoes:{m:0.0,dp:0.1},trocas:{m:0.5,dp:1.0},tamanho:{m:0.0,dp:0.0},esquerda:{m:0.3,dp:0.5},direita:{m:0.4,dp:0.9} },
  'superior': { omissoes:{m:0.0,dp:0.0},distorcoes:{m:0.2,dp:0.4},perseveracoes:{m:0.0,dp:0.0},rotacoes:{m:0.0,dp:0.0},trocas:{m:0.3,dp:0.7},tamanho:{m:0.0,dp:0.0},esquerda:{m:0.2,dp:0.4},direita:{m:0.3,dp:0.7} }
};

// Normas criancas - Memoria (Tab 29)
var _bvrtMemCrianca = {
  '7-8': {acertos:{m:5.0,dp:1.7},erros:{m:7.7,dp:3.2}},
  '9-11': {acertos:{m:5.9,dp:1.7},erros:{m:6.0,dp:3.0}},
  '12-14': {acertos:{m:6.9,dp:1.8},erros:{m:4.1,dp:2.4}}
};
var _bvrtCopCrianca = {
  '7-8': {acertos:{m:8.6,dp:1.8},erros:{m:1.6,dp:2.2}},
  '9-11': {acertos:{m:9.0,dp:1.4},erros:{m:1.2,dp:1.7}},
  '12-14': {acertos:{m:9.7,dp:0.8},erros:{m:0.3,dp:0.8}}
};
var _bvrtCategMemCrianca = {
  '7-8': { omissoes:{m:0.9,dp:1.6},distorcoes:{m:4.4,dp:2.1},perseveracoes:{m:0.9,dp:1.1},rotacoes:{m:0.8,dp:0.8},trocas:{m:0.7,dp:0.8},tamanho:{m:0.0,dp:0.3},esquerda:{m:2.9,dp:1.8},direita:{m:4.0,dp:1.9} },
  '9-11': { omissoes:{m:0.4,dp:1.0},distorcoes:{m:3.5,dp:2.2},perseveracoes:{m:0.6,dp:0.9},rotacoes:{m:0.5,dp:0.8},trocas:{m:0.8,dp:1.1},tamanho:{m:0.1,dp:0.3},esquerda:{m:2.1,dp:1.6},direita:{m:3.1,dp:1.9} },
  '12-14': { omissoes:{m:0.3,dp:0.8},distorcoes:{m:2.4,dp:1.8},perseveracoes:{m:0.5,dp:0.7},rotacoes:{m:0.2,dp:0.5},trocas:{m:0.6,dp:0.9},tamanho:{m:0.0,dp:0.0},esquerda:{m:1.5,dp:1.3},direita:{m:2.3,dp:1.5} }
};
var _bvrtCategCopCrianca = {
  '7-8': { omissoes:{m:0.2,dp:1.0},distorcoes:{m:1.1,dp:1.8},perseveracoes:{m:0.0,dp:0.0},rotacoes:{m:0.1,dp:0.3},trocas:{m:0.2,dp:0.4},tamanho:{m:0.0,dp:0.2},esquerda:{m:0.8,dp:1.0},direita:{m:0.8,dp:1.3} },
  '9-11': { omissoes:{m:0.0,dp:0.2},distorcoes:{m:0.9,dp:1.4},perseveracoes:{m:0.0,dp:0.1},rotacoes:{m:0.0,dp:0.2},trocas:{m:0.2,dp:0.6},tamanho:{m:0.0,dp:0.2},esquerda:{m:0.6,dp:0.9},direita:{m:0.6,dp:1.0} },
  '12-14': { omissoes:{m:0.0,dp:0.0},distorcoes:{m:0.2,dp:0.7},perseveracoes:{m:0.0,dp:0.0},rotacoes:{m:0.0,dp:0.1},trocas:{m:0.1,dp:0.5},tamanho:{m:0.0,dp:0.0},esquerda:{m:0.1,dp:0.4},direita:{m:0.2,dp:0.5} }
};

// Normas idosos - Memoria (Tab 41) e Copia (Tab 43)
var _bvrtMemIdoso = {
  '0-5': {acertos:{m:4.2,dp:1.6},erros:{m:9.5,dp:3.6}},
  '6-9': {acertos:{m:5.5,dp:1.9},erros:{m:7.1,dp:3.3}},
  '10-19': {acertos:{m:6.1,dp:1.9},erros:{m:6.3,dp:3.4}}
};
var _bvrtCopIdoso = {
  '0-5': {acertos:{m:8.6,dp:1.8},erros:{m:1.5,dp:1.9}},
  '6-9': {acertos:{m:9.4,dp:0.8},erros:{m:0.7,dp:0.9}},
  '10-19': {acertos:{m:9.9,dp:0.3},erros:{m:0.1,dp:0.3}}
};

// ============ FUNCOES DE CALCULO ============

function _bvrtFaixaEtaria(idade) {
  if (idade>=7&&idade<=8) return '7-8';
  if (idade>=9&&idade<=11) return '9-11';
  if (idade>=12&&idade<=14) return '12-14';
  if (idade>=15&&idade<=17) return '16-17';
  if (idade>=18&&idade<=29) return '18-29';
  if (idade>=30&&idade<=39) return '30-39';
  if (idade>=40&&idade<=49) return '40-49';
  if (idade>=50&&idade<=59) return '50-59';
  if (idade>=60&&idade<=69) return '60-69';
  if (idade>=70) return '70+';
  return null;
}

function _bvrtTipoPop(idade) {
  if (idade>=7&&idade<=14) return 'crianca';
  if (idade>=15&&idade<=69) return 'adulto';
  if (idade>=70) return 'idoso';
  return null;
}

function _bvrtCalcZ(resultado, media, dp) {
  if (dp===0||dp===undefined||dp===null) return '-';
  return (resultado - media) / dp;
}

function _bvrtClassificar(z, invertido) {
  if (z==='-'||z===null||isNaN(z)) return {texto:'N/A',classe:'esperado'};
  var valor = invertido ? z : -z;
  if (valor<=1.0) return {texto:'Desempenho esperado',classe:'esperado'};
  if (valor<=1.5) return {texto:'Sugestivo de alerta para deficit neuropsicologico',classe:'alerta'};
  if (valor<=2.0) return {texto:'Sugestivo de deficit moderado a severo',classe:'moderado'};
  return {texto:'Sugestivo de deficit de gravidade importante',classe:'importante'};
}

function _bvrtFormatZ(z) {
  if (z==='-'||z===null||isNaN(z)) return '-';
  return z.toFixed(2);
}

function _bvrtObterNormas(idade, escolaridade) {
  var tipo = _bvrtTipoPop(idade);
  var faixa = _bvrtFaixaEtaria(idade);
  var r = {memoria:null,copia:null,categMem:null,categCop:null,descricao:''};
  if (tipo==='crianca') {
    r.memoria = _bvrtMemCrianca[faixa];
    r.copia = _bvrtCopCrianca[faixa];
    r.categMem = _bvrtCategMemCrianca[faixa];
    r.categCop = _bvrtCategCopCrianca[faixa];
    r.descricao = 'Criancas/Adolescentes '+faixa+' anos (Tab 29-31)';
  } else if (tipo==='idoso') {
    var fe = '10-19';
    if (escolaridade==='fundamental') fe='0-5';
    else if (escolaridade==='medio') fe='6-9';
    r.memoria = _bvrtMemIdoso[fe];
    r.copia = _bvrtCopIdoso[fe];
    r.categMem = _bvrtCategMem['superior'];
    r.categCop = _bvrtCategCop['superior'];
    r.descricao = 'Idosos, '+fe+' anos de estudo (Tab 40-43)';
  } else {
    if (_bvrtNormasMemAdultos[faixa]&&_bvrtNormasMemAdultos[faixa][escolaridade]) {
      r.memoria = _bvrtNormasMemAdultos[faixa][escolaridade];
      r.copia = _bvrtNormasCopAdultos[faixa][escolaridade];
    }
    var ec = (escolaridade==='superior') ? 'superior' : 'medio';
    r.categMem = _bvrtCategMem[ec];
    r.categCop = _bvrtCategCop[ec];
    r.descricao = 'Adultos '+faixa+' anos, Esc. '+escolaridade+' (Tab 32-33/37-39)';
  }
  return r;
}

// Gerar tabela HTML bonita
function _bvrtGerarTabela(titulo, dados) {
  var cores = {esperado:'#2e7d32',alerta:'#f57f17',moderado:'#e65100',importante:'#b71c1c'};
  var bgs = {esperado:'#e8f5e9',alerta:'#fff8e1',moderado:'#fff3e0',importante:'#ffebee'};
  var h = '<p style="text-align:center;font-size:14px;font-weight:700;color:#4a148c;margin:18px 0 8px;">'+titulo+'</p>';
  h += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px;">';
  h += '<thead><tr style="background:linear-gradient(135deg,#4a148c,#6a1b9a);color:white;">';
  h += '<th style="padding:8px 6px;text-align:left;">Item</th><th style="padding:8px 4px;">Resultado</th><th style="padding:8px 4px;">Media</th><th style="padding:8px 4px;">DP</th><th style="padding:8px 4px;">Z-Score</th><th style="padding:8px 6px;text-align:left;">Classificacao</th>';
  h += '</tr></thead><tbody>';
  for (var i=0;i<dados.length;i++) {
    var d=dados[i];
    var bg = (i%2===0)?'#fff':'#f5f0ff';
    var cor = cores[d.cls.classe]||'#333';
    var bgBadge = bgs[d.cls.classe]||'#f5f5f5';
    h += '<tr style="background:'+bg+';">';
    h += '<td style="padding:7px 6px;border-bottom:1px solid #eee;font-weight:500;">'+d.item+'</td>';
    h += '<td style="padding:7px 4px;text-align:center;border-bottom:1px solid #eee;font-weight:700;">'+d.resultado+'</td>';
    h += '<td style="padding:7px 4px;text-align:center;border-bottom:1px solid #eee;">'+d.media+'</td>';
    h += '<td style="padding:7px 4px;text-align:center;border-bottom:1px solid #eee;">'+d.dp+'</td>';
    h += '<td style="padding:7px 4px;text-align:center;border-bottom:1px solid #eee;font-weight:700;">'+d.z+'</td>';
    h += '<td style="padding:7px 6px;border-bottom:1px solid #eee;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:'+bgBadge+';color:'+cor+';border:1px solid '+cor+'30;">'+d.cls.texto+'</span></td>';
    h += '</tr>';
  }
  h += '</tbody></table>';
  return h;
}

// ============ FUNCAO PRINCIPAL DE CALCULO ============
function bvrtCalcular() {
  var idade = parseInt(document.getElementById('bvrtIdade').value);
  var esc = document.getElementById('bvrtEscolaridade').value;
  if (!idade||idade<7) { alert('Insira uma idade valida (minimo 7 anos).'); return; }
  if (!esc) { alert('Selecione a escolaridade.'); return; }

  var normas = _bvrtObterNormas(idade, esc);
  if (!normas.memoria||!normas.copia) { alert('Normas nao encontradas para esta combinacao.'); return; }

  // Ler valores memoria
  var ma=parseFloat(document.getElementById('bvrt_mem_acertos').value)||0;
  var me=parseFloat(document.getElementById('bvrt_mem_erros').value)||0;
  var mo=parseFloat(document.getElementById('bvrt_mem_omissoes').value)||0;
  var md=parseFloat(document.getElementById('bvrt_mem_distorcoes').value)||0;
  var mp=parseFloat(document.getElementById('bvrt_mem_perseveracoes').value)||0;
  var mr=parseFloat(document.getElementById('bvrt_mem_rotacoes').value)||0;
  var mt=parseFloat(document.getElementById('bvrt_mem_trocas').value)||0;
  var mtam=parseFloat(document.getElementById('bvrt_mem_tamanho').value)||0;
  var mesq=parseFloat(document.getElementById('bvrt_mem_esquerda').value)||0;
  var mdir=parseFloat(document.getElementById('bvrt_mem_direita').value)||0;

  // Ler valores copia
  var ca=parseFloat(document.getElementById('bvrt_cop_acertos').value)||0;
  var ce=parseFloat(document.getElementById('bvrt_cop_erros').value)||0;
  var co=parseFloat(document.getElementById('bvrt_cop_omissoes').value)||0;
  var cd=parseFloat(document.getElementById('bvrt_cop_distorcoes').value)||0;
  var cp=parseFloat(document.getElementById('bvrt_cop_perseveracoes').value)||0;
  var cr=parseFloat(document.getElementById('bvrt_cop_rotacoes').value)||0;
  var ct=parseFloat(document.getElementById('bvrt_cop_trocas').value)||0;
  var ctam=parseFloat(document.getElementById('bvrt_cop_tamanho').value)||0;
  var cesq=parseFloat(document.getElementById('bvrt_cop_esquerda').value)||0;
  var cdir=parseFloat(document.getElementById('bvrt_cop_direita').value)||0;

  var nm=normas.memoria; var nc=normas.categMem;
  var ncp=normas.copia; var ncc=normas.categCop;

  // Calcular Z-Scores Memoria
  var zA=_bvrtCalcZ(ma,nm.acertos.m,nm.acertos.dp);
  var zE=_bvrtCalcZ(me,nm.erros.m,nm.erros.dp);
  var zO=nc?_bvrtCalcZ(mo,nc.omissoes.m,nc.omissoes.dp):'-';
  var zD=nc?_bvrtCalcZ(md,nc.distorcoes.m,nc.distorcoes.dp):'-';
  var zP=nc?_bvrtCalcZ(mp,nc.perseveracoes.m,nc.perseveracoes.dp):'-';
  var zR=nc?_bvrtCalcZ(mr,nc.rotacoes.m,nc.rotacoes.dp):'-';
  var zT=nc?_bvrtCalcZ(mt,nc.trocas.m,nc.trocas.dp):'-';
  var zTam=nc?_bvrtCalcZ(mtam,nc.tamanho.m,nc.tamanho.dp):'-';
  var zEsq=nc?_bvrtCalcZ(mesq,nc.esquerda.m,nc.esquerda.dp):'-';
  var zDir=nc?_bvrtCalcZ(mdir,nc.direita.m,nc.direita.dp):'-';

  var dadosMem = [
    {item:'Escore de Acertos',resultado:ma,media:nm.acertos.m.toFixed(1),dp:nm.acertos.dp.toFixed(1),z:_bvrtFormatZ(zA),cls:_bvrtClassificar(zA,false)},
    {item:'Escore de Erros',resultado:me,media:nm.erros.m.toFixed(1),dp:nm.erros.dp.toFixed(1),z:_bvrtFormatZ(zE),cls:_bvrtClassificar(zE,true)},
    {item:'Numero de Omissoes',resultado:mo,media:nc?nc.omissoes.m.toFixed(1):'?',dp:nc?nc.omissoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zO),cls:_bvrtClassificar(zO,true)},
    {item:'Numero de Distorcoes',resultado:md,media:nc?nc.distorcoes.m.toFixed(1):'?',dp:nc?nc.distorcoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zD),cls:_bvrtClassificar(zD,true)},
    {item:'Numero de Perseveracoes',resultado:mp,media:nc?nc.perseveracoes.m.toFixed(1):'?',dp:nc?nc.perseveracoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zP),cls:_bvrtClassificar(zP,true)},
    {item:'Numero de Rotacoes',resultado:mr,media:nc?nc.rotacoes.m.toFixed(1):'?',dp:nc?nc.rotacoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zR),cls:_bvrtClassificar(zR,true)},
    {item:'Numero de Trocas de Posicao',resultado:mt,media:nc?nc.trocas.m.toFixed(1):'?',dp:nc?nc.trocas.dp.toFixed(1):'?',z:_bvrtFormatZ(zT),cls:_bvrtClassificar(zT,true)},
    {item:'Numero de Erros de Tamanho',resultado:mtam,media:nc?nc.tamanho.m.toFixed(1):'?',dp:nc?nc.tamanho.dp.toFixed(1):'?',z:_bvrtFormatZ(zTam),cls:_bvrtClassificar(zTam,true)},
    {item:'Total de Erros Esquerda',resultado:mesq,media:nc?nc.esquerda.m.toFixed(1):'?',dp:nc?nc.esquerda.dp.toFixed(1):'?',z:_bvrtFormatZ(zEsq),cls:_bvrtClassificar(zEsq,true)},
    {item:'Total de Erros Direita',resultado:mdir,media:nc?nc.direita.m.toFixed(1):'?',dp:nc?nc.direita.dp.toFixed(1):'?',z:_bvrtFormatZ(zDir),cls:_bvrtClassificar(zDir,true)}
  ];

  // Calcular Z-Scores Copia
  var zcA=_bvrtCalcZ(ca,ncp.acertos.m,ncp.acertos.dp);
  var zcE=_bvrtCalcZ(ce,ncp.erros.m,ncp.erros.dp);
  var zcO=ncc?_bvrtCalcZ(co,ncc.omissoes.m,ncc.omissoes.dp):'-';
  var zcD=ncc?_bvrtCalcZ(cd,ncc.distorcoes.m,ncc.distorcoes.dp):'-';
  var zcP=ncc?_bvrtCalcZ(cp,ncc.perseveracoes.m,ncc.perseveracoes.dp):'-';
  var zcR=ncc?_bvrtCalcZ(cr,ncc.rotacoes.m,ncc.rotacoes.dp):'-';
  var zcT=ncc?_bvrtCalcZ(ct,ncc.trocas.m,ncc.trocas.dp):'-';
  var zcTam=ncc?_bvrtCalcZ(ctam,ncc.tamanho.m,ncc.tamanho.dp):'-';
  var zcEsq=ncc?_bvrtCalcZ(cesq,ncc.esquerda.m,ncc.esquerda.dp):'-';
  var zcDir=ncc?_bvrtCalcZ(cdir,ncc.direita.m,ncc.direita.dp):'-';

  var dadosCop = [
    {item:'Escore de Acertos',resultado:ca,media:ncp.acertos.m.toFixed(1),dp:ncp.acertos.dp.toFixed(1),z:_bvrtFormatZ(zcA),cls:_bvrtClassificar(zcA,false)},
    {item:'Escore de Erros',resultado:ce,media:ncp.erros.m.toFixed(1),dp:ncp.erros.dp.toFixed(1),z:_bvrtFormatZ(zcE),cls:_bvrtClassificar(zcE,true)},
    {item:'Numero de Omissoes',resultado:co,media:ncc?ncc.omissoes.m.toFixed(1):'?',dp:ncc?ncc.omissoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zcO),cls:_bvrtClassificar(zcO,true)},
    {item:'Numero de Distorcoes',resultado:cd,media:ncc?ncc.distorcoes.m.toFixed(1):'?',dp:ncc?ncc.distorcoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zcD),cls:_bvrtClassificar(zcD,true)},
    {item:'Numero de Perseveracoes',resultado:cp,media:ncc?ncc.perseveracoes.m.toFixed(1):'?',dp:ncc?ncc.perseveracoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zcP),cls:_bvrtClassificar(zcP,true)},
    {item:'Numero de Rotacoes',resultado:cr,media:ncc?ncc.rotacoes.m.toFixed(1):'?',dp:ncc?ncc.rotacoes.dp.toFixed(1):'?',z:_bvrtFormatZ(zcR),cls:_bvrtClassificar(zcR,true)},
    {item:'Numero de Trocas de Posicao',resultado:ct,media:ncc?ncc.trocas.m.toFixed(1):'?',dp:ncc?ncc.trocas.dp.toFixed(1):'?',z:_bvrtFormatZ(zcT),cls:_bvrtClassificar(zcT,true)},
    {item:'Numero de Erros de Tamanho',resultado:ctam,media:ncc?ncc.tamanho.m.toFixed(1):'?',dp:ncc?ncc.tamanho.dp.toFixed(1):'?',z:_bvrtFormatZ(zcTam),cls:_bvrtClassificar(zcTam,true)},
    {item:'Total de Erros Esquerda',resultado:cesq,media:ncc?ncc.esquerda.m.toFixed(1):'?',dp:ncc?ncc.esquerda.dp.toFixed(1):'?',z:_bvrtFormatZ(zcEsq),cls:_bvrtClassificar(zcEsq,true)},
    {item:'Total de Erros Direita',resultado:cdir,media:ncc?ncc.direita.m.toFixed(1):'?',dp:ncc?ncc.direita.dp.toFixed(1):'?',z:_bvrtFormatZ(zcDir),cls:_bvrtClassificar(zcDir,true)}
  ];

  // Exibir resultados
  var nome = document.getElementById('bvrtNome').value || 'Nao informado';
  document.getElementById('bvrtInfoNorma').innerHTML = '<p style="text-align:center;font-size:11px;color:#9e9e9e;font-style:italic;margin-bottom:5px;">Norma: '+normas.descricao+' | Paciente: '+nome+' | Idade: '+idade+' anos</p>';
  document.getElementById('bvrtTabelaMemoria').innerHTML = _bvrtGerarTabela('MEMORIA VISUAL — Administracao A (Forma C)', dadosMem);
  document.getElementById('bvrtTabelaCopia').innerHTML = _bvrtGerarTabela('COPIA — Administracao C (Forma D)', dadosCop);
  var sec = document.getElementById('bvrtResultados');
  sec.style.display = 'block';
  sec.scrollIntoView({behavior:'smooth',block:'start'});
}

// Copiar tabelas para o clipboard
function bvrtCopiar() {
  var sec = document.getElementById('bvrtResultados');
  if (sec.style.display==='none') { alert('Calcule os resultados primeiro!'); return; }
  var range = document.createRange();
  range.selectNodeContents(sec);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try { document.execCommand('copy'); alert('Tabelas copiadas! Cole no Word com Ctrl+V.'); }
  catch(e) { alert('Selecione manualmente e use Ctrl+C.'); }
  sel.removeAllRanges();
}

// Limpar campos
function bvrtLimpar() {
  var ids = ['bvrt_mem_acertos','bvrt_mem_erros','bvrt_mem_omissoes','bvrt_mem_distorcoes','bvrt_mem_perseveracoes','bvrt_mem_rotacoes','bvrt_mem_trocas','bvrt_mem_tamanho','bvrt_mem_esquerda','bvrt_mem_direita','bvrt_cop_acertos','bvrt_cop_erros','bvrt_cop_omissoes','bvrt_cop_distorcoes','bvrt_cop_perseveracoes','bvrt_cop_rotacoes','bvrt_cop_trocas','bvrt_cop_tamanho','bvrt_cop_esquerda','bvrt_cop_direita'];
  for (var i=0;i<ids.length;i++) { var el=document.getElementById(ids[i]); if(el) el.value=''; }
  document.getElementById('bvrtNome').value = '';
  document.getElementById('bvrtIdade').value = '';
  document.getElementById('bvrtEscolaridade').value = '';
  document.getElementById('bvrtResultados').style.display = 'none';
}

// ============ GERAR PDF ============
function bvrtGerarPDF() {
  var sec = document.getElementById('bvrtResultados');
  if (sec.style.display==='none') { alert('Calcule os resultados primeiro!'); return; }

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF('p');
  var pageW = 210;
  var ml = 15; // margem esquerda
  var mr = pageW - 15; // margem direita
  var y = 15;

  var nome = document.getElementById('bvrtNome').value || 'Nao informado';
  var idade = document.getElementById('bvrtIdade').value || '-';
  var esc = document.getElementById('bvrtEscolaridade').value || '-';
  var dataHoje = new Date().toLocaleDateString('pt-BR');

  // === CABECALHO ===
  doc.setFillColor(74, 20, 140); // roxo escuro
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
  doc.text('BVRT - Teste de Retencao Visual de Benton', ml, 12);
  doc.setFontSize(10); doc.setFont(undefined,'normal');
  doc.text('Correcao Automatica — Relatorio de Resultados', ml, 19);
  doc.setFontSize(8);
  doc.text('Data: ' + dataHoje, mr - 30, 12);
  y = 34;

  // === DADOS DO PACIENTE ===
  doc.setTextColor(74, 20, 140); doc.setFontSize(11); doc.setFont(undefined,'bold');
  doc.text('Dados do Paciente', ml, y); y += 6;
  doc.setDrawColor(74, 20, 140); doc.setLineWidth(0.5); doc.line(ml, y-2, mr, y-2);
  doc.setTextColor(33,33,33); doc.setFontSize(9); doc.setFont(undefined,'normal');
  doc.text('Nome: ' + nome, ml, y+2);
  doc.text('Idade: ' + idade + ' anos', ml + 90, y+2);
  doc.text('Escolaridade: ' + esc, ml + 140, y+2);
  y += 12;

  // === FUNCAO AUXILIAR PARA TABELA ===
  function desenharTabela(titulo, dados, startY) {
    var ty = startY;
    doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor(74, 20, 140);
    doc.text(titulo, ml, ty); ty += 5;

    // Cabecalho da tabela
    var cols = [ml, ml+52, ml+72, ml+88, ml+104, ml+124];
    var colW = [52, 20, 16, 16, 20, 71];
    doc.setFillColor(74, 20, 140);
    doc.rect(ml, ty-3.5, mr-ml, 5.5, 'F');
    doc.setFontSize(7.5); doc.setFont(undefined,'bold'); doc.setTextColor(255,255,255);
    doc.text('Item', cols[0]+1, ty);
    doc.text('Resultado', cols[1]+1, ty);
    doc.text('Media', cols[2]+1, ty);
    doc.text('DP', cols[3]+1, ty);
    doc.text('Z-Score', cols[4]+1, ty);
    doc.text('Classificacao', cols[5]+1, ty);
    ty += 5;

    // Linhas de dados
    doc.setFont(undefined,'normal'); doc.setTextColor(33,33,33); doc.setFontSize(7.5);
    for (var i=0; i<dados.length; i++) {
      var d = dados[i];
      // Fundo alternado
      if (i%2===0) { doc.setFillColor(245,240,255); doc.rect(ml, ty-3.2, mr-ml, 4.5, 'F'); }
      doc.setTextColor(33,33,33);
      doc.text(d.item, cols[0]+1, ty);
      doc.setFont(undefined,'bold');
      doc.text(String(d.resultado), cols[1]+1, ty);
      doc.setFont(undefined,'normal');
      doc.text(String(d.media), cols[2]+1, ty);
      doc.text(String(d.dp), cols[3]+1, ty);
      doc.setFont(undefined,'bold');
      doc.text(String(d.z), cols[4]+1, ty);
      // Cor da classificacao
      var cls = d.cls;
      if (cls.classe==='esperado') doc.setTextColor(46,125,50);
      else if (cls.classe==='alerta') doc.setTextColor(245,127,23);
      else if (cls.classe==='moderado') doc.setTextColor(230,81,0);
      else doc.setTextColor(183,28,28);
      doc.setFont(undefined,'bold'); doc.setFontSize(6.5);
      doc.text(cls.texto, cols[5]+1, ty);
      doc.setFontSize(7.5); doc.setFont(undefined,'normal');
      doc.setTextColor(33,33,33);
      ty += 4.5;
    }
    // Linha inferior
    doc.setDrawColor(74, 20, 140); doc.setLineWidth(0.3); doc.line(ml, ty-1, mr, ty-1);
    return ty + 4;
  }

  // Recalcular dados para o PDF (reutilizar a logica)
  var idadeNum = parseInt(idade);
  var normas = _bvrtObterNormas(idadeNum, esc);
  if (!normas.memoria||!normas.copia) { alert('Calcule os resultados antes de gerar o PDF.'); return; }

  var ma=parseFloat(document.getElementById('bvrt_mem_acertos').value)||0;
  var me=parseFloat(document.getElementById('bvrt_mem_erros').value)||0;
  var mo=parseFloat(document.getElementById('bvrt_mem_omissoes').value)||0;
  var md=parseFloat(document.getElementById('bvrt_mem_distorcoes').value)||0;
  var mp=parseFloat(document.getElementById('bvrt_mem_perseveracoes').value)||0;
  var mr2=parseFloat(document.getElementById('bvrt_mem_rotacoes').value)||0;
  var mt=parseFloat(document.getElementById('bvrt_mem_trocas').value)||0;
  var mtam=parseFloat(document.getElementById('bvrt_mem_tamanho').value)||0;
  var mesq=parseFloat(document.getElementById('bvrt_mem_esquerda').value)||0;
  var mdir=parseFloat(document.getElementById('bvrt_mem_direita').value)||0;

  var ca=parseFloat(document.getElementById('bvrt_cop_acertos').value)||0;
  var ce=parseFloat(document.getElementById('bvrt_cop_erros').value)||0;
  var co=parseFloat(document.getElementById('bvrt_cop_omissoes').value)||0;
  var cd=parseFloat(document.getElementById('bvrt_cop_distorcoes').value)||0;
  var cp2=parseFloat(document.getElementById('bvrt_cop_perseveracoes').value)||0;
  var cr2=parseFloat(document.getElementById('bvrt_cop_rotacoes').value)||0;
  var ct=parseFloat(document.getElementById('bvrt_cop_trocas').value)||0;
  var ctam=parseFloat(document.getElementById('bvrt_cop_tamanho').value)||0;
  var cesq=parseFloat(document.getElementById('bvrt_cop_esquerda').value)||0;
  var cdir=parseFloat(document.getElementById('bvrt_cop_direita').value)||0;

  var nm=normas.memoria; var nc=normas.categMem;
  var ncp=normas.copia; var ncc=normas.categCop;

  // Z-Scores Memoria
  var zA=_bvrtCalcZ(ma,nm.acertos.m,nm.acertos.dp); var zE=_bvrtCalcZ(me,nm.erros.m,nm.erros.dp);
  var zO=nc?_bvrtCalcZ(mo,nc.omissoes.m,nc.omissoes.dp):'-'; var zD=nc?_bvrtCalcZ(md,nc.distorcoes.m,nc.distorcoes.dp):'-';
  var zP=nc?_bvrtCalcZ(mp,nc.perseveracoes.m,nc.perseveracoes.dp):'-'; var zR=nc?_bvrtCalcZ(mr2,nc.rotacoes.m,nc.rotacoes.dp):'-';
  var zT=nc?_bvrtCalcZ(mt,nc.trocas.m,nc.trocas.dp):'-'; var zTam=nc?_bvrtCalcZ(mtam,nc.tamanho.m,nc.tamanho.dp):'-';
  var zEsq=nc?_bvrtCalcZ(mesq,nc.esquerda.m,nc.esquerda.dp):'-'; var zDir=nc?_bvrtCalcZ(mdir,nc.direita.m,nc.direita.dp):'-';

  var dadosMem = [
    {item:'Escore de Acertos',resultado:ma,media:nm.acertos.m.toFixed(1),dp:nm.acertos.dp.toFixed(1),z:_bvrtFormatZ(zA),cls:_bvrtClassificar(zA,false)},
    {item:'Escore de Erros',resultado:me,media:nm.erros.m.toFixed(1),dp:nm.erros.dp.toFixed(1),z:_bvrtFormatZ(zE),cls:_bvrtClassificar(zE,true)},
    {item:'Numero de Omissoes',resultado:mo,media:nc?nc.omissoes.m.toFixed(1):'-',dp:nc?nc.omissoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zO),cls:_bvrtClassificar(zO,true)},
    {item:'Numero de Distorcoes',resultado:md,media:nc?nc.distorcoes.m.toFixed(1):'-',dp:nc?nc.distorcoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zD),cls:_bvrtClassificar(zD,true)},
    {item:'Numero de Perseveracoes',resultado:mp,media:nc?nc.perseveracoes.m.toFixed(1):'-',dp:nc?nc.perseveracoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zP),cls:_bvrtClassificar(zP,true)},
    {item:'Numero de Rotacoes',resultado:mr2,media:nc?nc.rotacoes.m.toFixed(1):'-',dp:nc?nc.rotacoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zR),cls:_bvrtClassificar(zR,true)},
    {item:'Numero de Trocas de Posicao',resultado:mt,media:nc?nc.trocas.m.toFixed(1):'-',dp:nc?nc.trocas.dp.toFixed(1):'-',z:_bvrtFormatZ(zT),cls:_bvrtClassificar(zT,true)},
    {item:'Numero de Erros de Tamanho',resultado:mtam,media:nc?nc.tamanho.m.toFixed(1):'-',dp:nc?nc.tamanho.dp.toFixed(1):'-',z:_bvrtFormatZ(zTam),cls:_bvrtClassificar(zTam,true)},
    {item:'Total de Erros Esquerda',resultado:mesq,media:nc?nc.esquerda.m.toFixed(1):'-',dp:nc?nc.esquerda.dp.toFixed(1):'-',z:_bvrtFormatZ(zEsq),cls:_bvrtClassificar(zEsq,true)},
    {item:'Total de Erros Direita',resultado:mdir,media:nc?nc.direita.m.toFixed(1):'-',dp:nc?nc.direita.dp.toFixed(1):'-',z:_bvrtFormatZ(zDir),cls:_bvrtClassificar(zDir,true)}
  ];

  // Z-Scores Copia
  var zcA=_bvrtCalcZ(ca,ncp.acertos.m,ncp.acertos.dp); var zcE=_bvrtCalcZ(ce,ncp.erros.m,ncp.erros.dp);
  var zcO=ncc?_bvrtCalcZ(co,ncc.omissoes.m,ncc.omissoes.dp):'-'; var zcD=ncc?_bvrtCalcZ(cd,ncc.distorcoes.m,ncc.distorcoes.dp):'-';
  var zcP=ncc?_bvrtCalcZ(cp2,ncc.perseveracoes.m,ncc.perseveracoes.dp):'-'; var zcR=ncc?_bvrtCalcZ(cr2,ncc.rotacoes.m,ncc.rotacoes.dp):'-';
  var zcT=ncc?_bvrtCalcZ(ct,ncc.trocas.m,ncc.trocas.dp):'-'; var zcTam=ncc?_bvrtCalcZ(ctam,ncc.tamanho.m,ncc.tamanho.dp):'-';
  var zcEsq=ncc?_bvrtCalcZ(cesq,ncc.esquerda.m,ncc.esquerda.dp):'-'; var zcDir=ncc?_bvrtCalcZ(cdir,ncc.direita.m,ncc.direita.dp):'-';

  var dadosCop = [
    {item:'Escore de Acertos',resultado:ca,media:ncp.acertos.m.toFixed(1),dp:ncp.acertos.dp.toFixed(1),z:_bvrtFormatZ(zcA),cls:_bvrtClassificar(zcA,false)},
    {item:'Escore de Erros',resultado:ce,media:ncp.erros.m.toFixed(1),dp:ncp.erros.dp.toFixed(1),z:_bvrtFormatZ(zcE),cls:_bvrtClassificar(zcE,true)},
    {item:'Numero de Omissoes',resultado:co,media:ncc?ncc.omissoes.m.toFixed(1):'-',dp:ncc?ncc.omissoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zcO),cls:_bvrtClassificar(zcO,true)},
    {item:'Numero de Distorcoes',resultado:cd,media:ncc?ncc.distorcoes.m.toFixed(1):'-',dp:ncc?ncc.distorcoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zcD),cls:_bvrtClassificar(zcD,true)},
    {item:'Numero de Perseveracoes',resultado:cp2,media:ncc?ncc.perseveracoes.m.toFixed(1):'-',dp:ncc?ncc.perseveracoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zcP),cls:_bvrtClassificar(zcP,true)},
    {item:'Numero de Rotacoes',resultado:cr2,media:ncc?ncc.rotacoes.m.toFixed(1):'-',dp:ncc?ncc.rotacoes.dp.toFixed(1):'-',z:_bvrtFormatZ(zcR),cls:_bvrtClassificar(zcR,true)},
    {item:'Numero de Trocas de Posicao',resultado:ct,media:ncc?ncc.trocas.m.toFixed(1):'-',dp:ncc?ncc.trocas.dp.toFixed(1):'-',z:_bvrtFormatZ(zcT),cls:_bvrtClassificar(zcT,true)},
    {item:'Numero de Erros de Tamanho',resultado:ctam,media:ncc?ncc.tamanho.m.toFixed(1):'-',dp:ncc?ncc.tamanho.dp.toFixed(1):'-',z:_bvrtFormatZ(zcTam),cls:_bvrtClassificar(zcTam,true)},
    {item:'Total de Erros Esquerda',resultado:cesq,media:ncc?ncc.esquerda.m.toFixed(1):'-',dp:ncc?ncc.esquerda.dp.toFixed(1):'-',z:_bvrtFormatZ(zcEsq),cls:_bvrtClassificar(zcEsq,true)},
    {item:'Total de Erros Direita',resultado:cdir,media:ncc?ncc.direita.m.toFixed(1):'-',dp:ncc?ncc.direita.dp.toFixed(1):'-',z:_bvrtFormatZ(zcDir),cls:_bvrtClassificar(zcDir,true)}
  ];

  // Desenhar tabelas no PDF
  y = desenharTabela('MEMORIA VISUAL — Administracao A (Forma C)', dadosMem, y);
  y += 4;

  // Verificar se cabe na mesma pagina
  if (y > 180) { doc.addPage(); y = 15; }

  y = desenharTabela('COPIA — Administracao C (Forma D)', dadosCop, y);

  // Rodape
  y += 8;
  doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor(150,150,150);
  doc.text('Norma utilizada: ' + normas.descricao, ml, y);
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR') + ' | Sistema SYM Online', ml, y+4);

  // Legenda de classificacao
  y += 12;
  doc.setFontSize(7); doc.setFont(undefined,'bold'); doc.setTextColor(74, 20, 140);
  doc.text('Legenda de Classificacao:', ml, y); y += 4;
  doc.setFont(undefined,'normal');
  doc.setTextColor(46,125,50); doc.text('Desempenho esperado: Z > -1.0', ml, y); y += 3.5;
  doc.setTextColor(245,127,23); doc.text('Sugestivo de alerta para deficit: -1.0 >= Z > -1.5', ml, y); y += 3.5;
  doc.setTextColor(230,81,0); doc.text('Sugestivo de deficit moderado a severo: -1.5 >= Z > -2.0', ml, y); y += 3.5;
  doc.setTextColor(183,28,28); doc.text('Sugestivo de deficit de gravidade importante: Z <= -2.0', ml, y);

  // Salvar
  var nomeArq = 'BVRT_' + nome.replace(/[^a-zA-Z0-9]/g,'_') + '_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.pdf';
  doc.save(nomeArq);
}
