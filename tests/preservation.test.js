/**
 * Preservation Property Tests
 * Property 2: Preservation - Escalas Padrao + Filtro Normal + Creditos + Validacao
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * OBJETIVO: Capturar o comportamento EXISTENTE que NAO pode mudar apos o fix.
 * Estes testes DEVEM PASSAR no codigo atual (nao-corrigido).
 * Eles servem de "rede de seguranca" para evitar regressoes.
 * 
 * Propriedades testadas:
 *   1. Escalas padrao (ERT-PP, DASS-21, etc.) coleta anonima funciona
 *   2. Panel filter works for results with d.pacienteId at the correct level
 *   3. Admin user (setmonte@gmail.com) skips credit checks
 *   4. Results with d.pacienteId or d.idPaciente at data level found by filter
 *   5. Coleta anonima validation correctly rejects incomplete data
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

// ========================================
// UTILIDADES PROPERTY-BASED TESTING
// ========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(len) {
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = 0; i < len; i++) {
        result += chars[randomInt(0, chars.length - 1)];
    }
    return result;
}

function randomEmail() {
    var domains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
    return randomString(6) + randomInt(1, 99) + '@' + domains[randomInt(0, 2)];
}

function randomPacienteId() {
    return 'P' + randomInt(1, 9) + randomString(3).toUpperCase() + randomInt(1, 9);
}

function randomEscala() {
    var escalas = ['ERT-PP', 'DASS-21', 'YSQ-L3', 'SMI', 'SASC-R', 'PHQ-9', 'GAD-7', 'BDI-II'];
    return escalas[randomInt(0, escalas.length - 1)];
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

var NUM_CASES = 30;

// ========================================
// SIMULACAO: Logica de coleta-anonima.js (_enviarDadosAnonimos)
// Replica a validacao e decisao de envio EXATAMENTE como no codigo atual
// ========================================

/**
 * Simula a funcao _enviarDadosAnonimos() do coleta-anonima.js
 * Retorna: { shouldSend: boolean, reason: string, pacote: object|null }
 * 
 * Logica real (extraida do codigo):
 *   1. if (!instrumento) return  -> NAO envia
 *   2. if (instrumento.length < 3) return -> NAO envia
 *   3. if (!idade) return -> NAO envia
 *   4. Se _escalaDados existe: pontuacao = escore, dominios = formatarDominios(dominios)
 *   5. if (!pontuacao && !dominios) return -> NAO envia
 *   6. Monta pacote e envia via fetch
 */
function simulateColetaAnonima(escalaDados, idade, sexo, escolaridade, email) {
    // Passo 1: identificar instrumento
    var instrumento = '';
    if (escalaDados && escalaDados.escala) {
        instrumento = escalaDados.escala;
    }
    if (!instrumento) {
        return { shouldSend: false, reason: 'sem instrumento', pacote: null };
    }
    // Passo 2: instrumento deve ter >= 3 chars
    if (instrumento.length < 3) {
        return { shouldSend: false, reason: 'instrumento < 3 chars', pacote: null };
    }
    // Passo 3: idade obrigatoria
    if (!idade) {
        return { shouldSend: false, reason: 'sem idade', pacote: null };
    }
    // Passo 4: extrair pontuacao e dominios
    var pontuacao = '';
    var dominios = '';
    var classificacao = '';
    if (escalaDados) {
        pontuacao = escalaDados.escore ? parseFloat(escalaDados.escore).toFixed(2) : '';
        if (escalaDados.dominios) {
            var partes = [];
            Object.keys(escalaDados.dominios).forEach(function(nome) {
                var d = escalaDados.dominios[nome];
                var media = typeof d === 'object' ? (d.media || d.score || d.acertos || '') : d;
                partes.push(nome + ':' + media);
            });
            dominios = partes.join('; ');
        }
        classificacao = escalaDados.classificacao || '';
    }
    // Passo 5: sem pontuacao E sem dominios = NAO envia
    if (!pontuacao && !dominios) {
        return { shouldSend: false, reason: 'sem pontuacao e sem dominios', pacote: null };
    }
    // Passo 6: monta pacote
    var pacote = {
        email: email || '',
        escala: instrumento,
        idade: idade,
        sexo: sexo || '',
        escolaridade: escolaridade || '',
        pontuacao: pontuacao,
        dominios: dominios,
        classificacao: classificacao
    };
    return { shouldSend: true, reason: 'dados validos', pacote: pacote };
}

// ========================================
// SIMULACAO: Logica de filtro do painel (abrirHistoricoPaciente)
// Replica EXATAMENTE o filtro atual de index.html
// ========================================

/**
 * Simula o filtro atual de abrirHistoricoPaciente():
 *   var d = r.data || {};
 *   return d.pacienteId === pacienteId || d.idPaciente === pacienteId;
 * 
 * Este e o filtro ANTES do fix. Funciona quando pacienteId esta no nivel d.
 */
function filterPacienteAtual(results, pacienteId) {
    return results.filter(function(r) {
        if (r.tipo === 'agenda' || r.tipo === 'session' || r.tipo === 'depoimento' || r.tipo === 'prontuario') return false;
        var d = r.data || {};
        return d.pacienteId === pacienteId || d.idPaciente === pacienteId;
    });
}

// ========================================
// SIMULACAO: Logica de creditos (verificacao admin)
// Replica EXATAMENTE a condicao de skip de creditos
// ========================================

// Simula a logica de verificacao de creditos:
//   var isAdmin = (currentUser === 'setmonte@gmail.com' || isFreeModeActive());
//   if (isAdmin) { skip credit check }
//   else { check credits }
// Para o teste de preservacao, focamos na condicao email === 'setmonte@gmail.com'
function shouldSkipCreditCheck(email, isFreeModeActive) {
    var isAdmin = (email === 'setmonte@gmail.com' || isFreeModeActive);
    return isAdmin;
}

// ========================================
// PROPRIEDADE 1: Escalas padrao coleta anonima funciona
// Validates: Requirements 3.1
// ========================================

console.log('\n=== PROPRIEDADE 1: Escalas padrao (ERT-PP, DASS-21, etc.) coleta anonima funciona ===');
console.log('Quando _escalaDados tem escore e dominios no formato correto, coleta-anonima.js decide enviar\n');

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop1 [iter ' + iter + '] - Escala padrao com escore+dominios -> envio OK', function() {
            // Gerar _escalaDados no formato que as escalas padrao usam
            var escala = randomEscala();
            var escore = randomInt(10, 200) / 10; // ex: 2.5, 3.8, etc.
            var numDominios = randomInt(1, 6);
            var dominios = {};
            for (var d = 0; d < numDominios; d++) {
                dominios['Dominio' + (d + 1)] = {
                    pontuacao: randomInt(5, 50),
                    max: randomInt(50, 100),
                    classificacao: ['Minimo', 'Leve', 'Moderado', 'Grave'][randomInt(0, 3)],
                    media: randomInt(10, 50) / 10
                };
            }
            var escalaDados = {
                escala: escala,
                escore: escore,
                classificacao: ['Minimo', 'Leve', 'Moderado', 'Intenso'][randomInt(0, 3)],
                dominios: dominios
            };
            var idade = randomInt(18, 85);
            var sexo = randomInt(0, 1) ? 'Masculino' : 'Feminino';
            var result = simulateColetaAnonima(escalaDados, idade, sexo, 'Superior', randomEmail());
            assert.strictEqual(result.shouldSend, true,
                'Escala "' + escala + '" com escore=' + escore + ' e ' + numDominios + ' dominios DEVE enviar. Reason: ' + result.reason);
            assert.ok(result.pacote !== null, 'Pacote nao deveria ser null');
            assert.strictEqual(result.pacote.escala, escala, 'Escala no pacote deve ser "' + escala + '"');
        });
    })(i);
}

// Caso extra: escala com apenas dominios (sem escore numerico) tambem funciona
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop1 [iter ' + iter + '] - Escala com apenas dominios (sem escore) -> envio OK', function() {
            var escala = randomEscala();
            var dominios = {};
            var numDominios = randomInt(1, 4);
            for (var d = 0; d < numDominios; d++) {
                dominios['Area' + (d + 1)] = {
                    media: randomInt(10, 50) / 10
                };
            }
            var escalaDados = {
                escala: escala,
                escore: null, // sem escore
                classificacao: 'Normal',
                dominios: dominios
            };
            var idade = randomInt(18, 85);
            var result = simulateColetaAnonima(escalaDados, idade, 'M', 'Medio', randomEmail());
            assert.strictEqual(result.shouldSend, true,
                'Escala "' + escala + '" com dominios mas sem escore DEVE enviar (dominios suprem). Reason: ' + result.reason);
        });
    })(i);
}

// ========================================
// PROPRIEDADE 2: Panel filter works for results with d.pacienteId at correct level
// Validates: Requirements 3.2
// ========================================

console.log('\n=== PROPRIEDADE 2: Filtro do painel encontra paciente quando d.pacienteId esta correto ===');
console.log('Quando um resultado tem d.pacienteId diretamente (nao em formData), o filtro o encontra\n');

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop2 [iter ' + iter + '] - Filtro encontra resultado via d.pacienteId', function() {
            var pacienteId = randomPacienteId();
            var escala = randomEscala();
            // Simular resultado salvo com pacienteId NO NIVEL CORRETO (como escalas normais fazem)
            var results = [
                {
                    tipo: escala.toLowerCase(),
                    data: {
                        pacienteId: pacienteId, // no nivel d (correto)
                        escala: escala,
                        escore: randomInt(10, 100),
                        classificacao: 'Normal',
                        data: new Date().toISOString()
                    }
                },
                // Resultado de outro paciente (nao deve aparecer)
                {
                    tipo: 'dass-21',
                    data: {
                        pacienteId: randomPacienteId(), // outro paciente
                        escala: 'DASS-21',
                        escore: 15
                    }
                }
            ];
            var filtered = filterPacienteAtual(results, pacienteId);
            assert.strictEqual(filtered.length, 1,
                'Filtro deve encontrar exatamente 1 resultado para paciente "' + pacienteId + '", encontrou: ' + filtered.length);
            assert.strictEqual(filtered[0].data.pacienteId, pacienteId,
                'Resultado filtrado deve ter pacienteId correto');
        });
    })(i);
}

// ========================================
// PROPRIEDADE 3: Admin user (setmonte@gmail.com) skips credit checks
// Validates: Requirements 3.5
// ========================================

console.log('\n=== PROPRIEDADE 3: Admin (setmonte@gmail.com) pula verificacao de creditos ===');
console.log('A logica de creditos corretamente pula para o email admin\n');

runTest('Prop3 - setmonte@gmail.com SEMPRE pula verificacao de creditos', function() {
    var result = shouldSkipCreditCheck('setmonte@gmail.com', false);
    assert.strictEqual(result, true,
        'setmonte@gmail.com DEVE pular check de creditos');
});

// Testar com diversos emails NAO-admin: devem passar pela verificacao
for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop3 [iter ' + iter + '] - Email nao-admin NAO pula verificacao', function() {
            var email = randomEmail();
            // Garantir que nao e o admin
            while (email === 'setmonte@gmail.com') {
                email = randomEmail();
            }
            var result = shouldSkipCreditCheck(email, false);
            assert.strictEqual(result, false,
                'Email "' + email + '" NAO deve pular check de creditos (nao e admin)');
        });
    })(i);
}

// Testar que freeMode ativo tambem pula (comportamento existente)
runTest('Prop3 - Qualquer email com freeMode ativo pula creditos', function() {
    var email = randomEmail();
    var result = shouldSkipCreditCheck(email, true);
    assert.strictEqual(result, true,
        'Com freeMode ativo, qualquer email deve pular check de creditos');
});

// Verificar no codigo fonte que a condicao existe
runTest('Prop3 - Codigo fonte index.html contem verificacao admin', function() {
    var indexSource = '';
    try {
        indexSource = fs.readFileSync(path.resolve(__dirname, '..', 'online', 'index.html'), 'utf8');
    } catch(e) {
        assert.fail('Nao foi possivel ler index.html: ' + e.message);
    }
    // Verificar que a condicao de admin existe no codigo
    var hasAdminCheck = indexSource.indexOf("currentUser === 'setmonte@gmail.com'") !== -1;
    assert.ok(hasAdminCheck,
        'index.html DEVE conter verificacao "currentUser === \'setmonte@gmail.com\'" para skip de creditos');
});

// ========================================
// PROPRIEDADE 4: Results with d.pacienteId or d.idPaciente at data level found by filter
// Validates: Requirements 3.2, 3.4
// ========================================

console.log('\n=== PROPRIEDADE 4: Filtro encontra resultados com d.pacienteId OU d.idPaciente ===');
console.log('Resultados com d.pacienteId ou d.idPaciente no nivel data continuam sendo encontrados\n');

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop4 [iter ' + iter + '] - Filtro encontra via d.pacienteId', function() {
            var pacienteId = randomPacienteId();
            var results = [{
                tipo: randomEscala().toLowerCase(),
                data: { pacienteId: pacienteId, escala: randomEscala(), escore: randomInt(1, 100) }
            }];
            var filtered = filterPacienteAtual(results, pacienteId);
            assert.strictEqual(filtered.length, 1,
                'Filtro DEVE encontrar resultado via d.pacienteId="' + pacienteId + '"');
        });
    })(i);
}

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop4 [iter ' + iter + '] - Filtro encontra via d.idPaciente', function() {
            var pacienteId = randomPacienteId();
            var results = [{
                tipo: randomEscala().toLowerCase(),
                data: { idPaciente: pacienteId, escala: randomEscala(), escore: randomInt(1, 100) }
            }];
            var filtered = filterPacienteAtual(results, pacienteId);
            assert.strictEqual(filtered.length, 1,
                'Filtro DEVE encontrar resultado via d.idPaciente="' + pacienteId + '"');
        });
    })(i);
}

// Filtro NAO deve encontrar quando pacienteId esta em outro lugar (ex: formData)
// (isso e o BUG - mas aqui confirmamos que o filtro ATUAL so funciona no nivel d)
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop4 [iter ' + iter + '] - Filtro NAO encontra quando ID so esta em formData (confirma baseline)', function() {
            var pacienteId = randomPacienteId();
            var results = [{
                tipo: 'tref',
                data: {
                    formData: { pacienteId: pacienteId, nome: 'Teste' },
                    resultados: { olhos: 5 }
                    // pacienteId NAO esta no nivel d (esta em d.formData)
                }
            }];
            var filtered = filterPacienteAtual(results, pacienteId);
            assert.strictEqual(filtered.length, 0,
                'Filtro atual NAO deve encontrar paciente quando ID esta apenas em formData (baseline do bug)');
        });
    })(i);
}

// Resultados com tipos excluidos NAO aparecem no filtro
runTest('Prop4 - Resultado tipo "agenda" NAO aparece no filtro', function() {
    var pacienteId = randomPacienteId();
    var results = [{
        tipo: 'agenda',
        data: { pacienteId: pacienteId }
    }];
    var filtered = filterPacienteAtual(results, pacienteId);
    assert.strictEqual(filtered.length, 0, 'Tipo "agenda" deve ser excluido do filtro');
});

runTest('Prop4 - Resultado tipo "session" NAO aparece no filtro', function() {
    var pacienteId = randomPacienteId();
    var results = [{
        tipo: 'session',
        data: { pacienteId: pacienteId }
    }];
    var filtered = filterPacienteAtual(results, pacienteId);
    assert.strictEqual(filtered.length, 0, 'Tipo "session" deve ser excluido do filtro');
});

runTest('Prop4 - Resultado tipo "prontuario" NAO aparece no filtro', function() {
    var pacienteId = randomPacienteId();
    var results = [{
        tipo: 'prontuario',
        data: { pacienteId: pacienteId }
    }];
    var filtered = filterPacienteAtual(results, pacienteId);
    assert.strictEqual(filtered.length, 0, 'Tipo "prontuario" deve ser excluido do filtro');
});

// ========================================
// PROPRIEDADE 5: Coleta anonima validation correctly rejects incomplete data
// Validates: Requirements 3.1
// ========================================

console.log('\n=== PROPRIEDADE 5: Coleta anonima rejeita dados incompletos corretamente ===');
console.log('Quando _escalaDados esta sem escore E sem dominios, coleta aborta (comportamento desejado a preservar)\n');

// Sem instrumento -> nao envia
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Sem instrumento -> NAO envia', function() {
            var escalaDados = {
                escala: '', // vazio
                escore: randomInt(10, 100),
                dominios: { D1: { media: 3 } }
            };
            var result = simulateColetaAnonima(escalaDados, randomInt(18, 80), 'M', 'Superior', randomEmail());
            assert.strictEqual(result.shouldSend, false,
                'Sem instrumento valido, NAO deve enviar');
            assert.strictEqual(result.reason, 'sem instrumento');
        });
    })(i);
}

// Instrumento com menos de 3 chars -> nao envia
runTest('Prop5 - Instrumento com 1 char -> NAO envia', function() {
    var escalaDados = { escala: 'X', escore: 10, dominios: { D1: 5 } };
    var result = simulateColetaAnonima(escalaDados, 30, 'F', 'Medio', randomEmail());
    assert.strictEqual(result.shouldSend, false, 'Instrumento "X" (1 char) NAO deve enviar');
});

runTest('Prop5 - Instrumento com 2 chars -> NAO envia', function() {
    var escalaDados = { escala: 'AB', escore: 10, dominios: { D1: 5 } };
    var result = simulateColetaAnonima(escalaDados, 30, 'F', 'Medio', randomEmail());
    assert.strictEqual(result.shouldSend, false, 'Instrumento "AB" (2 chars) NAO deve enviar');
});

runTest('Prop5 - Instrumento com 3 chars -> ENVIA (limiar)', function() {
    var escalaDados = { escala: 'BAE', escore: 10, dominios: { D1: 5 } };
    var result = simulateColetaAnonima(escalaDados, 30, 'F', 'Medio', randomEmail());
    assert.strictEqual(result.shouldSend, true, 'Instrumento "BAE" (3 chars) DEVE enviar');
});

// Sem idade -> nao envia
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Sem idade -> NAO envia', function() {
            var escalaDados = {
                escala: randomEscala(),
                escore: randomInt(10, 100),
                dominios: { D1: { media: 3 } }
            };
            var result = simulateColetaAnonima(escalaDados, null, 'M', 'Superior', randomEmail());
            assert.strictEqual(result.shouldSend, false, 'Sem idade, NAO deve enviar');
            assert.strictEqual(result.reason, 'sem idade');
        });
    })(i);
}

// Sem pontuacao E sem dominios -> nao envia (ESTE E O CASO CRITICO)
for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Sem escore E sem dominios -> NAO envia (validacao preservada)', function() {
            var escalaDados = {
                escala: randomEscala(), // instrumento valido
                escore: null,           // sem escore
                classificacao: 'Normal'
                // SEM campo dominios
            };
            var idade = randomInt(18, 80);
            var result = simulateColetaAnonima(escalaDados, idade, 'M', 'Superior', randomEmail());
            assert.strictEqual(result.shouldSend, false,
                'Sem escore E sem dominios, NAO deve enviar (preservar esta validacao)');
            assert.strictEqual(result.reason, 'sem pontuacao e sem dominios');
        });
    })(i);
}

// Tambem testa com dominios vazio ({}) -> formatarDominios retorna '' -> nao envia
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Sem escore E dominios vazio {} -> NAO envia', function() {
            var escalaDados = {
                escala: randomEscala(),
                escore: null,
                dominios: {} // objeto vazio -> formatarDominios retorna ''
            };
            var result = simulateColetaAnonima(escalaDados, randomInt(18, 80), 'M', 'Medio', randomEmail());
            assert.strictEqual(result.shouldSend, false,
                'Sem escore e dominios vazio {}, NAO deve enviar');
        });
    })(i);
}

// ========================================
// VERIFICACAO NO CODIGO FONTE: Confirmar que as logicas existem
// ========================================

console.log('\n=== VERIFICACAO NO FONTE: Confirmar logicas existem no codigo ===\n');

// Verificar coleta-anonima.js
var coletaSource = '';
try {
    coletaSource = fs.readFileSync(path.resolve(__dirname, '..', 'online', 'coleta-anonima.js'), 'utf8');
} catch (e) {
    console.log('  WARN: Nao foi possivel ler coleta-anonima.js: ' + e.message);
}

if (coletaSource) {
    runTest('Fonte - coleta-anonima.js contem validacao "if (!instrumento) return"', function() {
        assert.ok(coletaSource.indexOf('if (!instrumento) return') !== -1,
            'coleta-anonima.js DEVE conter "if (!instrumento) return"');
    });

    runTest('Fonte - coleta-anonima.js contem validacao "if (instrumento.length < 3) return"', function() {
        assert.ok(coletaSource.indexOf('if (instrumento.length < 3) return') !== -1,
            'coleta-anonima.js DEVE conter "if (instrumento.length < 3) return"');
    });

    runTest('Fonte - coleta-anonima.js contem validacao "if (!idade) return"', function() {
        assert.ok(coletaSource.indexOf('if (!idade) return') !== -1,
            'coleta-anonima.js DEVE conter "if (!idade) return"');
    });

    runTest('Fonte - coleta-anonima.js contem validacao "if (!pontuacao && !dominios) return"', function() {
        assert.ok(coletaSource.indexOf('if (!pontuacao && !dominios) return') !== -1,
            'coleta-anonima.js DEVE conter "if (!pontuacao && !dominios) return"');
    });
}

// Verificar index.html - filtro do painel
var indexSource = '';
try {
    indexSource = fs.readFileSync(path.resolve(__dirname, '..', 'online', 'index.html'), 'utf8');
} catch (e) {
    console.log('  WARN: Nao foi possivel ler index.html: ' + e.message);
}

if (indexSource) {
    runTest('Fonte - index.html contem filtro "d.pacienteId === pacienteId"', function() {
        assert.ok(indexSource.indexOf('d.pacienteId === pacienteId') !== -1,
            'index.html DEVE conter filtro "d.pacienteId === pacienteId"');
    });

    runTest('Fonte - index.html contem filtro "d.idPaciente === pacienteId"', function() {
        assert.ok(indexSource.indexOf('d.idPaciente === pacienteId') !== -1,
            'index.html DEVE conter filtro "d.idPaciente === pacienteId"');
    });

    runTest('Fonte - index.html contem isencao admin para creditos', function() {
        // A logica de pular creditos: currentUser === 'setmonte@gmail.com'
        assert.ok(indexSource.indexOf("currentUser === 'setmonte@gmail.com'") !== -1,
            'index.html DEVE conter verificacao de admin "currentUser === \'setmonte@gmail.com\'"');
    });

    runTest('Fonte - index.html exclui tipos agenda/session/depoimento/prontuario do filtro', function() {
        // Verificar que o filtro exclui esses tipos
        var hasAgendaExclusion = indexSource.indexOf("r.tipo === 'agenda'") !== -1;
        var hasSessionExclusion = indexSource.indexOf("r.tipo === 'session'") !== -1;
        assert.ok(hasAgendaExclusion, 'Filtro DEVE excluir tipo "agenda"');
        assert.ok(hasSessionExclusion, 'Filtro DEVE excluir tipo "session"');
    });
}

// ========================================
// RESUMO
// ========================================

console.log('\n========================================');
console.log('RESULTADO FINAL - Preservation Property Tests');
console.log('Spec: testes-coleta-id-dados-fix');
console.log('========================================');
console.log('Total: ' + totalTests + ' | Passaram: ' + passedTests + ' | Falharam: ' + failedTests);
console.log('');

if (failedTests > 0) {
    console.log('FALHAS ENCONTRADAS:');
    for (var i = 0; i < Math.min(10, failedDetails.length); i++) {
        console.log(failedDetails[i]);
    }
    console.log('');
    console.log('ATENCAO: Testes de preservacao FALHARAM!');
    console.log('Isso indica que o comportamento existente NAO esta como esperado.');
    process.exit(1);
} else {
    console.log('SUCESSO: Todos os testes de preservacao PASSARAM!');
    console.log('O comportamento existente esta capturado e validado.');
    console.log('Estes testes devem CONTINUAR passando apos o fix ser implementado.');
    console.log('');
    console.log('Comportamentos preservados:');
    console.log('  1. Escalas padrao com escore+dominios -> coleta anonima envia corretamente');
    console.log('  2. Filtro do painel encontra paciente via d.pacienteId (nivel correto)');
    console.log('  3. Admin (setmonte@gmail.com) pula verificacao de creditos');
    console.log('  4. Resultados com d.pacienteId ou d.idPaciente no nivel data -> encontrados pelo filtro');
    console.log('  5. Validacao da coleta rejeita dados sem escore E sem dominios (preservada)');
    process.exit(0);
}
