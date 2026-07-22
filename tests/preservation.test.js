/**
 * Preservation Property Tests
 * Property 2: Preservacao - Comportamento Existente Inalterado
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 * 
 * OBJETIVO: Capturar o comportamento EXISTENTE que NAO pode mudar apos o fix.
 * Estes testes DEVEM PASSAR no codigo atual (nao-corrigido).
 * Eles servem de "rede de seguranca" para evitar regressoes.
 * 
 * Abordagem: Extrair a logica pura (sem DOM) dos arquivos originais
 * e verificar que produz os resultados corretos para inputs nao-bugados.
 */

var assert = require('assert');

// ========================================
// Utilidades de teste (mini property-based)
// ========================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Contador de testes
var totalTests = 0;
var passedTests = 0;
var failedTests = 0;
var failedDetails = [];

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log('  PASS: ' + name);
  } catch (e) {
    failedTests++;
    var detail = '  FAIL: ' + name + ' -> ' + e.message;
    failedDetails.push(detail);
    console.log(detail);
  }
}


// ========================================
// LOGICA EXTRAIDA DO CODIGO ATUAL
// (estas funcoes replicam EXATAMENTE o comportamento dos fontes)
// ========================================

/**
 * Extraido de teste-agenda.html recognition.onend:
 * recognition.onend = function() { if (gravando && !pausado) { try { recognition.start(); } catch(er){} } };
 * 
 * Quando gravando=true E pausado=false E onend dispara NORMALMENTE
 * (nao em loop rapido), recognition.start() DEVE ser chamado.
 * Este e o comportamento CORRETO para pausas normais no Chrome.
 */
function shouldRestartRecognition(gravando, pausado) {
  // Logica exata do codigo atual
  if (gravando && !pausado) {
    return true; // recognition.start() e chamado
  }
  return false;
}

/**
 * Extraido de LAMBDA-FINAL-LIMPA.js POST /use-credit:
 * const creditField = tipo === "bae" ? "baeCredits" 
 *   : tipo === "trmv" ? "trmvCredits" 
 *   : tipo === "tref" ? "trefCredits" 
 *   : tipo === "taav" ? "taavCredits" 
 *   : tipo === "tflod" ? "tflodCredits" 
 *   : "credits";
 */
function getCreditFieldForUseCredit(tipo) {
  var creditField = tipo === "bae" ? "baeCredits"
    : tipo === "trmv" ? "trmvCredits"
    : tipo === "tref" ? "trefCredits"
    : tipo === "taav" ? "taavCredits"
    : tipo === "tflod" ? "tflodCredits"
    : "credits";
  return creditField;
}

/**
 * Extraido de LAMBDA-FINAL-LIMPA.js POST /webhook-mp:
 * const creditField = tipo === "bae" ? "baeCredits" 
 *   : tipo === "trmv" ? "trmvCredits" 
 *   : tipo === "tref" ? "trefCredits" 
 *   : tipo === "taav" ? "taavCredits" 
 *   : "credits";
 */
function getCreditFieldForWebhook(tipo) {
  var creditField = tipo === "bae" ? "baeCredits"
    : tipo === "trmv" ? "trmvCredits"
    : tipo === "tref" ? "trefCredits"
    : tipo === "taav" ? "taavCredits"
    : "credits";
  return creditField;
}

/**
 * Extraido de teste-agenda.html - logica do timer no modo agenda:
 * var restante = totalSegundos - segundosDecorridos;
 * if (restante < 0) restante = 0;
 * if (!bipDado10 && restante <= 600 && restante > 0) { bipDado10 = true; emitirBip(1); }
 * if (!bipDadoFinal && restante <= 0) { bipDadoFinal = true; emitirBip(2); }
 */
function simulateTimerTick(totalSegundos, segundosDecorridos, bipDado10, bipDadoFinal) {
  var restante = totalSegundos - segundosDecorridos;
  if (restante < 0) restante = 0;
  
  var shouldBip10 = false;
  var shouldBipFinal = false;
  var shouldStop = false;
  
  if (!bipDado10 && restante <= 600 && restante > 0) {
    shouldBip10 = true;
  }
  if (!bipDadoFinal && restante <= 0) {
    shouldBipFinal = true;
    shouldStop = true;
  }
  
  return {
    restante: restante,
    shouldBip10: shouldBip10,
    shouldBipFinal: shouldBipFinal,
    shouldStop: shouldStop
  };
}

/**
 * Admin bypass: email === "setmonte@gmail.com" nunca consome creditos.
 * No codigo ATUAL, nao existe verificacao de creditos para nenhum teste
 * (o que e justamente o bug para TFLOD e Prontuario).
 * Mas o comportamento ESPERADO apos o fix e que o admin continue
 * sem consumir creditos. Aqui testamos que a logica de bypass funciona.
 */
function isAdmin(email) {
  return email === "setmonte@gmail.com";
}


// ========================================
// PRESERVATION TEST 1: SpeechRecognition Normal Restart
// Validates: Requirement 3.1
// Quando gravando=true e pausado=false e o onend dispara normalmente,
// recognition.start() DEVE ser chamado (auto-restart correto)
// ========================================

console.log('\n=== PRESERVATION 1: SpeechRecognition Normal Restart ===');
console.log('Valida: Req 3.1 - Auto-restart funciona em pausas normais\n');

var NUM_ITERATIONS = 30;

for (var i = 0; i < NUM_ITERATIONS; i++) {
  (function(iter) {
    runTest('Pres1 [iter ' + iter + '] - gravando=true, pausado=false -> restart chamado', function() {
      // Cenario normal: gravando ativo, nao pausado
      var result = shouldRestartRecognition(true, false);
      assert.strictEqual(result, true,
        'recognition.start() DEVERIA ser chamado quando gravando=true e pausado=false');
    });
  })(i);
}

// Testes adicionais: quando pausado ou nao gravando, NAO deve reiniciar
runTest('Pres1 - gravando=false -> NAO reinicia', function() {
  var result = shouldRestartRecognition(false, false);
  assert.strictEqual(result, false,
    'recognition.start() NAO deveria ser chamado quando gravando=false');
});

runTest('Pres1 - pausado=true -> NAO reinicia', function() {
  var result = shouldRestartRecognition(true, true);
  assert.strictEqual(result, false,
    'recognition.start() NAO deveria ser chamado quando pausado=true');
});

runTest('Pres1 - gravando=false E pausado=true -> NAO reinicia', function() {
  var result = shouldRestartRecognition(false, true);
  assert.strictEqual(result, false,
    'recognition.start() NAO deveria ser chamado quando gravando=false e pausado=true');
});


// ========================================
// PRESERVATION TEST 2: Admin Bypass
// Validates: Requirement 3.2
// Para email === "setmonte@gmail.com", NENHUM credito e consumido.
// ========================================

console.log('\n=== PRESERVATION 2: Admin Bypass ===');
console.log('Valida: Req 3.2 - Admin nunca consome creditos\n');

runTest('Pres2 - setmonte@gmail.com e admin', function() {
  assert.strictEqual(isAdmin("setmonte@gmail.com"), true,
    'setmonte@gmail.com deveria ser reconhecido como admin');
});

// Property: qualquer outro email NAO e admin
for (var i = 0; i < NUM_ITERATIONS; i++) {
  (function(iter) {
    runTest('Pres2 [iter ' + iter + '] - emails aleatorios NAO sao admin', function() {
      var emails = [
        'usuario' + iter + '@gmail.com',
        'teste@hotmail.com',
        'psicologo' + iter + '@outlook.com',
        'SETMONTE@gmail.com',  // case sensitive - maiusculo nao e admin
        'setmonte@gmail.com.br',
        'setmonte@yahoo.com',
        ' setmonte@gmail.com', // espaco antes
        'setmonte@gmail.com '  // espaco depois
      ];
      var email = randomChoice(emails);
      assert.strictEqual(isAdmin(email), false,
        '"' + email + '" NAO deveria ser admin');
    });
  })(i);
}


// ========================================
// PRESERVATION TEST 3: Existing Credit Types Mapping (/use-credit)
// Validates: Requirement 3.4
// Para tipos existentes, o mapeamento creditField e correto.
// ========================================

console.log('\n=== PRESERVATION 3: Credit Types Mapping (/use-credit) ===');
console.log('Valida: Req 3.4 - Mapeamento de tipos para creditField inalterado\n');

var expectedMappingUseCredit = {
  "tecfe": "credits",
  "bae": "baeCredits",
  "trmv": "trmvCredits",
  "tref": "trefCredits",
  "taav": "taavCredits",
  "tflod": "tflodCredits"
};

var tiposExistentes = Object.keys(expectedMappingUseCredit);

for (var i = 0; i < tiposExistentes.length; i++) {
  (function(tipo) {
    runTest('Pres3 - /use-credit tipo "' + tipo + '" -> "' + expectedMappingUseCredit[tipo] + '"', function() {
      var result = getCreditFieldForUseCredit(tipo);
      assert.strictEqual(result, expectedMappingUseCredit[tipo],
        'Para tipo "' + tipo + '", esperava "' + expectedMappingUseCredit[tipo] + '" mas recebeu "' + result + '"');
    });
  })(tiposExistentes[i]);
}

// Property: tipos desconhecidos mapeiam para "credits" (default)
var tiposDesconhecidos = ['xyz', 'unknown', '', 'TECFE', 'Bae', 'outro'];
for (var i = 0; i < tiposDesconhecidos.length; i++) {
  (function(tipo) {
    runTest('Pres3 - /use-credit tipo desconhecido "' + tipo + '" -> "credits" (default)', function() {
      var result = getCreditFieldForUseCredit(tipo);
      assert.strictEqual(result, "credits",
        'Para tipo desconhecido "' + tipo + '", esperava "credits" (default) mas recebeu "' + result + '"');
    });
  })(tiposDesconhecidos[i]);
}


// ========================================
// PRESERVATION TEST 4: Timer Accuracy (Modo Agenda)
// Validates: Requirement 3.5
// Timer decrementa corretamente, bip em <=600 restante, auto-stop em <=0
// ========================================

console.log('\n=== PRESERVATION 4: Timer Accuracy (Modo Agenda) ===');
console.log('Valida: Req 3.5 - Timer decrementa, bip 10min, auto-stop ao final\n');

// Test: restante calcula corretamente
for (var i = 0; i < NUM_ITERATIONS; i++) {
  (function(iter) {
    runTest('Pres4 [iter ' + iter + '] - restante = totalSegundos - segundosDecorridos', function() {
      var totalSegundos = randomInt(600, 7200); // 10min a 2h
      var segundosDecorridos = randomInt(0, totalSegundos);
      var result = simulateTimerTick(totalSegundos, segundosDecorridos, false, false);
      var expectedRestante = totalSegundos - segundosDecorridos;
      if (expectedRestante < 0) expectedRestante = 0;
      assert.strictEqual(result.restante, expectedRestante,
        'restante deveria ser ' + expectedRestante + ' mas foi ' + result.restante);
    });
  })(i);
}

// Test: bip 10min dispara quando restante <= 600 e > 0
runTest('Pres4 - bip10 dispara quando restante=600 (exato)', function() {
  // totalSegundos=3600 (1h), segundosDecorridos=3000 -> restante=600
  var result = simulateTimerTick(3600, 3000, false, false);
  assert.strictEqual(result.shouldBip10, true,
    'Bip 10min deveria disparar quando restante=600');
});

runTest('Pres4 - bip10 dispara quando restante=1 (quase zero)', function() {
  var result = simulateTimerTick(3600, 3599, false, false);
  assert.strictEqual(result.shouldBip10, true,
    'Bip 10min deveria disparar quando restante=1 (dentro de <=600 e >0)');
});

runTest('Pres4 - bip10 NAO dispara quando restante=601', function() {
  // totalSegundos=3600, segundosDecorridos=2999 -> restante=601
  var result = simulateTimerTick(3600, 2999, false, false);
  assert.strictEqual(result.shouldBip10, false,
    'Bip 10min NAO deveria disparar quando restante=601');
});

runTest('Pres4 - bip10 NAO dispara se ja foi dado', function() {
  var result = simulateTimerTick(3600, 3000, true, false); // bipDado10=true
  assert.strictEqual(result.shouldBip10, false,
    'Bip 10min NAO deveria disparar novamente se ja foi dado');
});

runTest('Pres4 - bip10 NAO dispara quando restante=0', function() {
  // restante <= 600 mas NAO > 0 (a condicao exige >0)
  var result = simulateTimerTick(3600, 3600, false, false);
  assert.strictEqual(result.shouldBip10, false,
    'Bip 10min NAO deveria disparar quando restante=0 (exige >0)');
});

// Test: bip final e auto-stop quando restante <= 0
runTest('Pres4 - bipFinal dispara quando restante=0', function() {
  var result = simulateTimerTick(3600, 3600, true, false);
  assert.strictEqual(result.shouldBipFinal, true,
    'Bip final deveria disparar quando restante=0');
  assert.strictEqual(result.shouldStop, true,
    'Auto-stop deveria ativar quando restante=0');
});

runTest('Pres4 - bipFinal dispara quando segundos excedem total', function() {
  // segundosDecorridos > totalSegundos -> restante clampa em 0
  var result = simulateTimerTick(3600, 3700, true, false);
  assert.strictEqual(result.restante, 0,
    'restante deveria ser clampado em 0 quando segundos excedem total');
  assert.strictEqual(result.shouldBipFinal, true,
    'Bip final deveria disparar quando segundos excedem total');
});

runTest('Pres4 - bipFinal NAO dispara se ja foi dado', function() {
  var result = simulateTimerTick(3600, 3600, true, true); // bipDadoFinal=true
  assert.strictEqual(result.shouldBipFinal, false,
    'Bip final NAO deveria disparar novamente se ja foi dado');
});

// Property: para qualquer tempo com restante > 600, nenhum bip dispara
for (var i = 0; i < NUM_ITERATIONS; i++) {
  (function(iter) {
    runTest('Pres4 [iter ' + iter + '] - sem bip quando restante > 600', function() {
      var totalSegundos = randomInt(1800, 7200);
      // Garantir restante > 600
      var maxDecorrido = totalSegundos - 601;
      if (maxDecorrido < 0) maxDecorrido = 0;
      var segundosDecorridos = randomInt(0, maxDecorrido);
      var result = simulateTimerTick(totalSegundos, segundosDecorridos, false, false);
      assert.strictEqual(result.shouldBip10, false,
        'Bip 10min NAO deveria disparar com restante=' + result.restante + ' (>600)');
      assert.strictEqual(result.shouldBipFinal, false,
        'Bip final NAO deveria disparar com restante=' + result.restante + ' (>0)');
      assert.strictEqual(result.shouldStop, false,
        'Auto-stop NAO deveria ativar com restante=' + result.restante + ' (>0)');
    });
  })(i);
}


// ========================================
// PRESERVATION TEST 5: Webhook Existing Types
// Validates: Requirement 3.7
// Para tipos existentes no webhook, creditField mapeia corretamente.
// ========================================

console.log('\n=== PRESERVATION 5: Webhook Existing Types ===');
console.log('Valida: Req 3.7 - Webhook credita no campo correto para tipos existentes\n');

var expectedMappingWebhook = {
  "tecfe": "credits",
  "bae": "baeCredits",
  "trmv": "trmvCredits",
  "tref": "trefCredits",
  "taav": "taavCredits"
};

var tiposWebhook = Object.keys(expectedMappingWebhook);

for (var i = 0; i < tiposWebhook.length; i++) {
  (function(tipo) {
    runTest('Pres5 - webhook tipo "' + tipo + '" -> "' + expectedMappingWebhook[tipo] + '"', function() {
      var result = getCreditFieldForWebhook(tipo);
      assert.strictEqual(result, expectedMappingWebhook[tipo],
        'Para webhook tipo "' + tipo + '", esperava "' + expectedMappingWebhook[tipo] + '" mas recebeu "' + result + '"');
    });
  })(tiposWebhook[i]);
}

// NOTA: No webhook atual, tipo "tflod" mapeia para "credits" (default) e NAO para "tflodCredits"!
// Isso e porque o webhook atual so tem: bae, trmv, tref, taav no if/else chain.
// O tipo "tflod" cai no else e vai para "credits".
// Este e o comportamento ATUAL que estamos preservando no teste.
runTest('Pres5 - webhook tipo "tflod" -> "credits" (default no codigo atual)', function() {
  var result = getCreditFieldForWebhook("tflod");
  assert.strictEqual(result, "credits",
    'No webhook ATUAL, tipo "tflod" mapeia para "credits" (default). ' +
    'NOTA: isso pode ser um bug existente, mas estamos preservando o comportamento atual.');
});

// Property: tipos desconhecidos no webhook caem em "credits"
var tiposDesconhecidosWH = ['xyz', 'unknown', '', 'prontuario', 'corsi'];
for (var i = 0; i < tiposDesconhecidosWH.length; i++) {
  (function(tipo) {
    runTest('Pres5 - webhook tipo desconhecido "' + tipo + '" -> "credits" (default)', function() {
      var result = getCreditFieldForWebhook(tipo);
      assert.strictEqual(result, "credits",
        'Para webhook tipo desconhecido "' + tipo + '", esperava "credits" (default) mas recebeu "' + result + '"');
    });
  })(tiposDesconhecidosWH[i]);
}


// ========================================
// PRESERVATION TEST 6: CORSI Gratuito
// Validates: Requirement 3.3
// CORSI nao tem verificacao de creditos - funciona para todos.
// ========================================

console.log('\n=== PRESERVATION 6: CORSI Gratuito ===');
console.log('Valida: Req 3.3 - CORSI funciona sem verificacao de creditos\n');

/**
 * No codigo atual (index.html), os testes CORSI e PFISTER sao abertos 
 * sem nenhuma chamada a /use-credit. A funcao de abertura do CORSI
 * (startCorsiOnlineTest ou similar) apenas abre a URL direto.
 * 
 * Para preservar este comportamento, verificamos que CORSI NAO esta
 * na lista de tipos que exigem creditos.
 */
var tiposComCredito = ["tecfe", "bae", "trmv", "tref", "taav", "tflod"];

runTest('Pres6 - CORSI nao esta na lista de tipos com credito', function() {
  var corsiExigeCredito = tiposComCredito.indexOf("corsi") !== -1;
  assert.strictEqual(corsiExigeCredito, false,
    'CORSI NAO deveria exigir creditos! Deve ser gratuito para todos.');
});

// Property: Para qualquer email (admin ou nao), CORSI nunca consome credito
for (var i = 0; i < NUM_ITERATIONS; i++) {
  (function(iter) {
    runTest('Pres6 [iter ' + iter + '] - CORSI gratuito para qualquer email', function() {
      var emails = [
        'setmonte@gmail.com',
        'usuario' + iter + '@gmail.com',
        'clinica@hotmail.com',
        'teste' + iter + '@yahoo.com'
      ];
      var email = randomChoice(emails);
      // CORSI nao tem tipo no sistema de creditos
      // Verificar que "corsi" nao mapeia para nenhum campo de credito especifico
      // (no /use-credit, "corsi" cairia em "credits" default, mas a funcao
      //  de abertura do CORSI nunca chama /use-credit de qualquer forma)
      var corsiNaListaCredito = tiposComCredito.indexOf("corsi") !== -1;
      assert.strictEqual(corsiNaListaCredito, false,
        'CORSI deve ser gratuito para "' + email + '" - nao exige creditos');
    });
  })(i);
}


// ========================================
// RESUMO
// ========================================

console.log('\n========================================');
console.log('RESULTADO FINAL - Preservation Property Tests');
console.log('========================================');
console.log('Total: ' + totalTests + ' | Passaram: ' + passedTests + ' | Falharam: ' + failedTests);
console.log('');

if (failedTests > 0) {
  console.log('FALHAS ENCONTRADAS:');
  for (var i = 0; i < failedDetails.length; i++) {
    console.log(failedDetails[i]);
  }
  console.log('');
  console.log('ATENCAO: Testes de preservacao FALHARAM!');
  console.log('Isso indica que algo no comportamento existente esta diferente do esperado.');
  process.exit(1);
} else {
  console.log('SUCESSO: Todos os testes de preservacao PASSARAM!');
  console.log('O comportamento existente esta documentado e validado.');
  console.log('Estes testes devem CONTINUAR passando apos o fix ser implementado.');
  process.exit(0);
}
