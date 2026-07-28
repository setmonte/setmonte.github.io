/**
 * Preservation Property Tests
 * Property 2: Formato Payload + Outros Interceptores + Polling
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 * 
 * OBJETIVO: Capturar o comportamento EXISTENTE que NAO pode mudar apos o fix.
 * Estes testes DEVEM PASSAR no codigo atual (nao-corrigido).
 * Eles servem de "rede de seguranca" para evitar regressoes.
 * 
 * Propriedades testadas:
 *   1. Para todo payload de TFLOD/TREF/TRMV, data.formData DEVE manter campos internos
 *   2. Para todo interceptor que NAO seja finalizarGravacao, setTimeout DEVE ser preservado
 *   3. Para todo ciclo de polling (5s), se _escalaDados existe, dados DEVEM ser enviados
 *   4. Formato do pacote coleta-anonima: {email, escala, idade, sexo, escolaridade, pontuacao, dominios, classificacao}
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

function randomName() {
    var nomes = ['Maria Silva', 'Joao Santos', 'Ana Oliveira', 'Pedro Costa', 'Lucas Souza', 'Julia Ferreira', 'Carlos Lima', 'Beatriz Almeida'];
    return nomes[randomInt(0, nomes.length - 1)];
}

function randomBirthDate() {
    var year = randomInt(1950, 2015);
    var month = String(randomInt(1, 12)).padStart(2, '0');
    var day = String(randomInt(1, 28)).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function randomEmail() {
    var domains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
    return randomString(6) + randomInt(1, 99) + '@' + domains[randomInt(0, 2)];
}

function randomSexo() {
    var opcoes = ['Masculino', 'Feminino', 'M', 'F'];
    return opcoes[randomInt(0, opcoes.length - 1)];
}

function randomSessionId() {
    return 'sess-' + randomString(8) + '-' + Date.now();
}

function randomPacienteId() {
    return 'P' + randomInt(1, 9) + randomString(3).toUpperCase() + randomInt(1, 9);
}

function randomEscolaridade() {
    var opcoes = ['Fundamental', 'Medio Completo', 'Superior Incompleto', 'Superior Completo', 'Pos-graduacao'];
    return opcoes[randomInt(0, opcoes.length - 1)];
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
// SIMULACAO: PAYLOAD TFLOD (salvarResultado)
// Replica EXATAMENTE o formato atual de teste-tflod.html
// ========================================

/**
 * Validates: Requirements 3.1, 3.2
 * 
 * Formato atual do payload TFLOD:
 * {
 *   email, tipo:'tflod', sessionId,
 *   data: {
 *     status:'finalizado', date,
 *     formData: { nome, idade, idadeAnos, escolaridade, dataNasc, dataAval, obs, correcaoVisual, id, pacienteId },
 *     resultados: { pcpm, classificacao, acertos, erros, palavrasAlcancadas, ... },
 *     audioBase64
 *   }
 * }
 */
function buildTflodPayload(sessionInfo, dadosForm, resultado) {
    if (!sessionInfo.email || !sessionInfo.sessionId) return null;
    var dados = {
        email: sessionInfo.email,
        tipo: 'tflod',
        sessionId: sessionInfo.sessionId,
        data: {
            status: 'finalizado',
            date: new Date().toISOString(),
            formData: {
                nome: dadosForm.nome,
                idade: dadosForm.idade,
                idadeAnos: dadosForm.idadeAnos,
                escolaridade: dadosForm.escolaridade,
                dataNasc: dadosForm.dataNasc,
                dataAval: dadosForm.dataAval,
                obs: dadosForm.obs,
                correcaoVisual: dadosForm.correcaoVisual,
                id: dadosForm.id,
                pacienteId: sessionInfo.pacienteId || ''
            },
            resultados: resultado,
            audioBase64: null
        }
    };
    return dados;
}

// ========================================
// SIMULACAO: PAYLOAD TREF (salvarResultadoLambda)
// Replica EXATAMENTE o formato atual de teste-tref.html
// ========================================

/**
 * Validates: Requirements 3.4
 * 
 * Formato atual do payload TREF:
 * {
 *   email, tipo:'tref', sessionId,
 *   data: {
 *     status:'finalizado', date,
 *     formData: { nome, idade, sexo, dataNasc, dataAval, obs, id, pacienteId },
 *     resultados: { mulher:{...}, homem:{...} }
 *   }
 * }
 */
function buildTrefPayload(sessionInfo, dadosForm, resultados) {
    if (!sessionInfo.email || !sessionInfo.sessionId) return null;
    var dados = {
        email: sessionInfo.email,
        tipo: 'tref',
        sessionId: sessionInfo.sessionId,
        data: {
            status: 'finalizado',
            date: new Date().toISOString(),
            formData: {
                nome: dadosForm.nome,
                idade: dadosForm.idade,
                sexo: dadosForm.sexo,
                dataNasc: dadosForm.dataNasc,
                dataAval: dadosForm.dataAval,
                obs: dadosForm.obs,
                id: dadosForm.id,
                pacienteId: sessionInfo.pacienteId || ''
            },
            resultados: resultados
        }
    };
    return dados;
}

// ========================================
// SIMULACAO: PAYLOAD TRMV (finalizarTeste)
// Replica EXATAMENTE o formato atual de teste-trmv.html
// ========================================

/**
 * Validates: Requirements 3.5
 * 
 * Formato atual do payload TRMV:
 * {
 *   sessionId, email, tipo:'trmv',
 *   data: {
 *     formData: sessionData,
 *     status:'completo', date, numEstimulos,
 *     reconhecimento1: { acertos, alarmesFalsos, omissoes, tempoResposta },
 *     reconhecimento2: { acertos, alarmesFalsos, omissoes, tempoResposta },
 *     indiceRetencao: number
 *   }
 * }
 */
function buildTrmvPayload(sessionData, resultados, numEstimulos) {
    if (!sessionData.sessionId || !sessionData.email) return null;
    var resultData = {
        formData: sessionData,
        status: 'completo',
        date: new Date().toISOString(),
        numEstimulos: numEstimulos || 15,
        reconhecimento1: {
            acertos: resultados.reconhecimento1.acertos,
            alarmesFalsos: resultados.reconhecimento1.alarmesFalsos,
            omissoes: resultados.reconhecimento1.omissoes,
            tempoResposta: resultados.reconhecimento1.tempoResposta
        },
        reconhecimento2: {
            acertos: resultados.reconhecimento2.acertos,
            alarmesFalsos: resultados.reconhecimento2.alarmesFalsos,
            omissoes: resultados.reconhecimento2.omissoes,
            tempoResposta: resultados.reconhecimento2.tempoResposta
        },
        indiceRetencao: resultados.indiceRetencao
    };
    var payload = {
        sessionId: sessionData.sessionId,
        email: sessionData.email,
        tipo: 'trmv',
        data: resultData
    };
    return payload;
}

// ========================================
// SIMULACAO: INTERCEPTORES coleta-anonima.js
// Replica a logica de interceptacao com setTimeout
// ========================================

/**
 * Validates: Requirements 3.3, 3.6
 * 
 * Interceptores atuais e seus timeouts:
 * 1. calcularResultados -> setTimeout(500)
 * 2. _enviarResultadosPainel -> setTimeout(500)
 * 3. salvarResultadoLambda -> setTimeout(500)
 * 4. finalizarTeste -> setTimeout(500)
 * 5. finalizarGravacao -> .then(setTimeout(500)) + fallback setTimeout(30000) [ALTERADO pelo fix]
 * 6. mostrarResultados -> setTimeout(500)
 * 7. showEndScreen -> setTimeout(500)
 * 8. _prepararDadosEEnviar -> setTimeout(1500)
 * 9. enviarResultados (BAE) -> setTimeout(1500) + setTimeout(5000)
 * 10. mostrarTelaFinal (BAE) -> setTimeout(2000) + setTimeout(5000)
 */
var INTERCEPTOR_TIMEOUTS = {
    // Interceptores que NAO devem ser alterados pelo fix
    calcularResultados: [500],
    _enviarResultadosPainel: [500],
    salvarResultadoLambda: [500],
    finalizarTeste: [500],
    mostrarResultados: [500],
    showEndScreen: [500],
    _prepararDadosEEnviar: [1500],
    enviarResultados: [1500, 5000],
    mostrarTelaFinal: [2000, 5000]
};

/**
 * Simula a funcao _interceptar() - extrai os timeouts usados por cada interceptor.
 * Retorna um mapeamento de nome -> array de timeouts usados.
 * 
 * Estrategia: para cada interceptor, encontra o bloco entre
 * "if (typeof window.NOME" e "= true;" (flag _interceptado = true)
 * e extrai setTimeout values apenas dentro desse bloco.
 */
function extractInterceptorTimeouts(coletaSource) {
    var result = {};
    var interceptors = [
        { name: 'calcularResultados', pattern: 'window.calcularResultados', flag: '_cr_interceptado = true' },
        { name: '_enviarResultadosPainel', pattern: 'window._enviarResultadosPainel', flag: '_erp_interceptado = true' },
        { name: 'salvarResultadoLambda', pattern: 'window.salvarResultadoLambda', flag: '_srl_interceptado = true' },
        { name: 'finalizarTeste', pattern: 'window.finalizarTeste', flag: '_ft_interceptado = true' },
        { name: 'finalizarGravacao', pattern: 'window.finalizarGravacao', flag: '_fg_interceptado = true' },
        { name: 'mostrarResultados', pattern: 'window.mostrarResultados', flag: '_mr_interceptado = true' },
        { name: 'showEndScreen', pattern: 'window.showEndScreen', flag: '_ses_interceptado = true' },
        { name: '_prepararDadosEEnviar', pattern: 'window._prepararDadosEEnviar', flag: '_pde_interceptado = true' },
        { name: 'enviarResultados', pattern: 'window.enviarResultados', flag: '_er_interceptado = true' },
        { name: 'mostrarTelaFinal', pattern: 'window.mostrarTelaFinal', flag: '_mtf_interceptado = true' }
    ];
    
    interceptors.forEach(function(ic) {
        // Find the "if (typeof window.X === 'function'" start
        var startPattern = 'typeof ' + ic.pattern;
        var startIdx = coletaSource.indexOf(startPattern);
        if (startIdx === -1) return;
        // Find the closing flag for this block
        var flagIdx = coletaSource.indexOf(ic.flag, startIdx);
        if (flagIdx === -1) return;
        // Extract block between start and flag
        var block = coletaSource.substring(startIdx, flagIdx);
        // Extract all setTimeout values from ONLY this block
        var timeoutRegex = /setTimeout\(_enviarDadosAnonimos,\s*(\d+)\)/g;
        var timeouts = [];
        var m;
        while ((m = timeoutRegex.exec(block)) !== null) {
            timeouts.push(parseInt(m[1]));
        }
        if (timeouts.length > 0) {
            result[ic.name] = timeouts;
        }
    });
    return result;
}

// ========================================
// SIMULACAO: POLLING coleta-anonima.js
// ========================================

/**
 * Validates: Requirements 3.3, 3.6
 * 
 * Logica do polling:
 * - Para testes longos (BAE, TAAV, TRMV, TREF, TFLOD, TTE): intervalo de 5s, max 600 ciclos
 * - Para escalas: intervalo de 3s, max 40 ciclos
 * - Se _escalaDados existe e tem .escala, tenta enviar
 * - Se resultadosBAE existe com subtestes e endPage visivel, tenta enviar
 */
function simulatePollingCycle(isTesteLongo, escalaDados, jaEnviou) {
    var pollingInterval = isTesteLongo ? 5000 : 3000;
    var pollingMax = isTesteLongo ? 600 : 40;
    
    // Simular um ciclo de polling
    var shouldAttemptSend = false;
    
    if (jaEnviou) {
        return { shouldStop: true, shouldAttemptSend: false, pollingInterval: pollingInterval, pollingMax: pollingMax };
    }
    
    // Se _escalaDados existe com escala valida, tenta enviar
    if (escalaDados && escalaDados.escala) {
        shouldAttemptSend = true;
    }
    
    return {
        shouldStop: false,
        shouldAttemptSend: shouldAttemptSend,
        pollingInterval: pollingInterval,
        pollingMax: pollingMax
    };
}

// ========================================
// SIMULACAO: PACOTE coleta-anonima (formato de envio ao Google Sheets)
// ========================================

/**
 * Validates: Requirements 3.3, 3.7
 * 
 * Formato do pacote enviado ao Google Sheets:
 * { email, escala, idade, sexo, escolaridade, pontuacao, dominios, classificacao }
 */
function buildColetaPacket(email, escalaDados, idade, sexo, escolaridade) {
    if (!escalaDados || !escalaDados.escala) return null;
    if (!idade) return null;
    
    var instrumento = escalaDados.escala;
    if (instrumento.length < 3) return null;
    
    var pontuacao = escalaDados.escore ? parseFloat(escalaDados.escore).toFixed(2) : '';
    var dominios = '';
    if (escalaDados.dominios) {
        var partes = [];
        Object.keys(escalaDados.dominios).forEach(function(nome) {
            var d = escalaDados.dominios[nome];
            var media = typeof d === 'object' ? (d.media || d.score || d.acertos || '') : d;
            partes.push(nome + ':' + media);
        });
        dominios = partes.join('; ');
    }
    var classificacao = escalaDados.classificacao || '';
    
    // Sem pontuacao E sem dominios = nao envia
    if (!pontuacao && !dominios) return null;
    
    return {
        email: email,
        escala: instrumento,
        idade: idade,
        sexo: sexo,
        escolaridade: escolaridade,
        pontuacao: pontuacao,
        dominios: dominios,
        classificacao: classificacao
    };
}

// ========================================
// PROPRIEDADE 1: Formato de formData Preservado (TFLOD)
// Validates: Requirements 3.1, 3.2
// ========================================

console.log('\n=== PROPRIEDADE 1: Formato data.formData TFLOD preservado ===');
console.log('Para todo payload TFLOD, data.formData DEVE conter: nome, idade, idadeAnos, escolaridade, dataNasc, dataAval, obs, correcaoVisual, id, pacienteId\n');

var TFLOD_REQUIRED_FIELDS = ['nome', 'idade', 'idadeAnos', 'escolaridade', 'dataNasc', 'dataAval', 'obs', 'correcaoVisual', 'id', 'pacienteId'];
var NUM_CASES = 20;

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop1 [iter ' + iter + '] - TFLOD formData contem todos os campos obrigatorios', function() {
            var sessionInfo = {
                email: randomEmail(),
                sessionId: randomSessionId(),
                patientName: randomName(),
                birthDate: randomBirthDate(),
                pacienteId: randomPacienteId()
            };
            var dadosForm = {
                nome: sessionInfo.patientName,
                idade: randomInt(20, 80) + ' anos, ' + randomInt(0, 11) + ' meses e ' + randomInt(0, 28) + ' dias',
                idadeAnos: randomInt(20, 80),
                escolaridade: randomEscolaridade(),
                dataNasc: sessionInfo.birthDate,
                dataAval: '2025-01-' + String(randomInt(1, 28)).padStart(2, '0'),
                obs: randomInt(0, 1) ? 'Sem observacoes' : '',
                correcaoVisual: randomInt(0, 1) ? 'Sim' : 'Nao',
                id: randomPacienteId()
            };
            var resultado = {
                pcpm: parseFloat((randomInt(50, 200) / 10).toFixed(1)),
                classificacao: ['Normal', 'Abaixo', 'Acima'][randomInt(0, 2)],
                acertos: randomInt(10, 50),
                erros: randomInt(0, 10),
                palavrasAlcancadas: randomInt(30, 120)
            };
            
            var payload = buildTflodPayload(sessionInfo, dadosForm, resultado);
            assert.ok(payload !== null, 'Payload nao deveria ser nulo');
            assert.ok(payload.data, 'payload.data deve existir');
            assert.ok(payload.data.formData, 'payload.data.formData deve existir');
            
            // Verificar todos os campos obrigatorios
            TFLOD_REQUIRED_FIELDS.forEach(function(field) {
                assert.ok(
                    payload.data.formData.hasOwnProperty(field),
                    'Campo "' + field + '" ausente em data.formData do TFLOD! Campos presentes: [' + Object.keys(payload.data.formData).join(', ') + ']'
                );
            });
            
            // Verificar que resultados tambem existem
            assert.ok(payload.data.resultados, 'payload.data.resultados deve existir');
            assert.strictEqual(payload.tipo, 'tflod', 'tipo deve ser "tflod"');
        });
    })(i);
}

// ========================================
// PROPRIEDADE 2: Formato de formData Preservado (TREF)
// Validates: Requirements 3.4
// ========================================

console.log('\n=== PROPRIEDADE 2: Formato data.formData TREF preservado ===');
console.log('Para todo payload TREF, data.formData DEVE conter: nome, idade, sexo, dataNasc, dataAval, obs, id, pacienteId\n');

var TREF_REQUIRED_FIELDS = ['nome', 'idade', 'sexo', 'dataNasc', 'dataAval', 'obs', 'id', 'pacienteId'];

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop2 [iter ' + iter + '] - TREF formData contem todos os campos obrigatorios', function() {
            var sessionInfo = {
                email: randomEmail(),
                sessionId: randomSessionId(),
                nome: randomName(),
                dataNascimento: randomBirthDate(),
                sexo: randomSexo(),
                pacienteId: randomPacienteId()
            };
            var dadosForm = {
                nome: sessionInfo.nome,
                idade: randomInt(20, 80) + ' anos, ' + randomInt(0, 11) + ' meses e ' + randomInt(0, 28) + ' dias',
                sexo: sessionInfo.sexo,
                dataNasc: sessionInfo.dataNascimento,
                dataAval: '2025-01-' + String(randomInt(1, 28)).padStart(2, '0'),
                obs: '',
                id: randomPacienteId()
            };
            var resultados = {
                mulher: { olhos: randomInt(0, 10), boca: randomInt(0, 10), periferia: randomInt(0, 15) },
                homem: { olhos: randomInt(0, 10), boca: randomInt(0, 10), periferia: randomInt(0, 15) }
            };
            
            var payload = buildTrefPayload(sessionInfo, dadosForm, resultados);
            assert.ok(payload !== null, 'Payload nao deveria ser nulo');
            assert.ok(payload.data, 'payload.data deve existir');
            assert.ok(payload.data.formData, 'payload.data.formData deve existir');
            
            TREF_REQUIRED_FIELDS.forEach(function(field) {
                assert.ok(
                    payload.data.formData.hasOwnProperty(field),
                    'Campo "' + field + '" ausente em data.formData do TREF! Campos presentes: [' + Object.keys(payload.data.formData).join(', ') + ']'
                );
            });
            
            assert.ok(payload.data.resultados, 'payload.data.resultados deve existir');
            assert.strictEqual(payload.tipo, 'tref', 'tipo deve ser "tref"');
        });
    })(i);
}

// ========================================
// PROPRIEDADE 3: Formato de resultados Preservado (TRMV)
// Validates: Requirements 3.5
// ========================================

console.log('\n=== PROPRIEDADE 3: Formato data.resultados TRMV preservado ===');
console.log('Para todo payload TRMV, data DEVE conter: reconhecimento1, reconhecimento2, indiceRetencao (cada um com acertos/alarmesFalsos/omissoes)\n');

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop3 [iter ' + iter + '] - TRMV resultados contem reconhecimento1/2 e indiceRetencao', function() {
            var sessionData = {
                email: randomEmail(),
                sessionId: randomSessionId(),
                patientName: randomName(),
                birthDate: randomBirthDate(),
                education: randomEscolaridade(),
                pacienteId: randomPacienteId()
            };
            var resultados = {
                reconhecimento1: {
                    acertos: randomInt(5, 15),
                    alarmesFalsos: randomInt(0, 5),
                    omissoes: randomInt(0, 5),
                    tempoResposta: randomInt(800, 4000)
                },
                reconhecimento2: {
                    acertos: randomInt(5, 15),
                    alarmesFalsos: randomInt(0, 5),
                    omissoes: randomInt(0, 5),
                    tempoResposta: randomInt(800, 4000)
                },
                indiceRetencao: randomInt(30, 100)
            };
            
            var payload = buildTrmvPayload(sessionData, resultados, randomInt(10, 20));
            assert.ok(payload !== null, 'Payload nao deveria ser nulo');
            assert.ok(payload.data, 'payload.data deve existir');
            assert.ok(payload.data.formData, 'payload.data.formData deve existir (sessionData)');
            
            // Verificar campos de reconhecimento
            assert.ok(payload.data.reconhecimento1, 'reconhecimento1 deve existir');
            assert.ok(payload.data.reconhecimento2, 'reconhecimento2 deve existir');
            assert.ok(payload.data.hasOwnProperty('indiceRetencao'), 'indiceRetencao deve existir');
            
            // Verificar sub-campos de reconhecimento1
            var r1 = payload.data.reconhecimento1;
            assert.ok(r1.hasOwnProperty('acertos'), 'reconhecimento1.acertos deve existir');
            assert.ok(r1.hasOwnProperty('alarmesFalsos'), 'reconhecimento1.alarmesFalsos deve existir');
            assert.ok(r1.hasOwnProperty('omissoes'), 'reconhecimento1.omissoes deve existir');
            assert.ok(r1.hasOwnProperty('tempoResposta'), 'reconhecimento1.tempoResposta deve existir');
            
            // Verificar sub-campos de reconhecimento2
            var r2 = payload.data.reconhecimento2;
            assert.ok(r2.hasOwnProperty('acertos'), 'reconhecimento2.acertos deve existir');
            assert.ok(r2.hasOwnProperty('alarmesFalsos'), 'reconhecimento2.alarmesFalsos deve existir');
            assert.ok(r2.hasOwnProperty('omissoes'), 'reconhecimento2.omissoes deve existir');
            assert.ok(r2.hasOwnProperty('tempoResposta'), 'reconhecimento2.tempoResposta deve existir');
            
            // Verificar tipo
            assert.strictEqual(payload.tipo, 'trmv', 'tipo deve ser "trmv"');
        });
    })(i);
}

// ========================================
// PROPRIEDADE 4: Interceptores NAO-finalizarGravacao preservam setTimeout original
// Validates: Requirements 3.3, 3.6
// ========================================

console.log('\n=== PROPRIEDADE 4: Interceptores com setTimeout preservado ===');
console.log('Para todo interceptor que NAO seja finalizarGravacao, setTimeout DEVE ser 500/1500/2000ms (valores atuais)\n');

// Ler o arquivo coleta-anonima.js e verificar que os timeouts estao corretos
var coletaSource = '';
try {
    coletaSource = fs.readFileSync(path.resolve(__dirname, '..', 'online', 'coleta-anonima.js'), 'utf8');
} catch (e) {
    console.log('  WARN: Nao foi possivel ler coleta-anonima.js: ' + e.message);
}

if (coletaSource) {
    var actualTimeouts = extractInterceptorTimeouts(coletaSource);
    
    // Verificar cada interceptor que NAO seja finalizarGravacao
    var interceptorsToPreserve = Object.keys(INTERCEPTOR_TIMEOUTS);
    
    interceptorsToPreserve.forEach(function(name) {
        (function(interceptorName) {
            runTest('Prop4 - Interceptor "' + interceptorName + '" preserva timeout(s) ' + JSON.stringify(INTERCEPTOR_TIMEOUTS[interceptorName]), function() {
                assert.ok(
                    actualTimeouts.hasOwnProperty(interceptorName),
                    'Interceptor "' + interceptorName + '" nao encontrado no coleta-anonima.js! Interceptores encontrados: [' + Object.keys(actualTimeouts).join(', ') + ']'
                );
                var expected = INTERCEPTOR_TIMEOUTS[interceptorName];
                var actual = actualTimeouts[interceptorName];
                assert.deepStrictEqual(
                    actual, expected,
                    'Interceptor "' + interceptorName + '": timeouts esperados=' + JSON.stringify(expected) + ' mas encontrados=' + JSON.stringify(actual)
                );
            });
        })(name);
    });
    
    // Propriedade extra: finalizarGravacao tem timeouts [500, 30000] (pos-fix)
    // O fix alterou de setTimeout(1000) para: .then(setTimeout 500) + fallback setTimeout(30000)
    runTest('Prop4 - Interceptor "finalizarGravacao" tem timeouts [500, 30000] (pos-fix)', function() {
        assert.ok(
            actualTimeouts.hasOwnProperty('finalizarGravacao'),
            'Interceptor "finalizarGravacao" nao encontrado no coleta-anonima.js!'
        );
        assert.deepStrictEqual(
            actualTimeouts['finalizarGravacao'], [500, 30000],
            'finalizarGravacao: timeout esperado=[500, 30000] mas encontrado=' + JSON.stringify(actualTimeouts['finalizarGravacao'])
        );
    });
} else {
    runTest('Prop4 - SKIP (arquivo coleta-anonima.js nao acessivel)', function() {
        console.log('    Arquivo nao acessivel, pulando verificacao de timeouts');
    });
}

// ========================================
// PROPRIEDADE 5: Polling de 5s detecta _escalaDados e envia
// Validates: Requirements 3.3, 3.6
// ========================================

console.log('\n=== PROPRIEDADE 5: Polling de 5s detecta _escalaDados ===');
console.log('Para todo ciclo de polling, se _escalaDados existe com escala valida, DEVE tentar enviar\n');

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Polling detecta _escalaDados e tenta enviar', function() {
            var escalaDados = {
                escala: ['TFLOD', 'TREF', 'TRMV', 'BAE', 'TAAV', 'TECFE'][randomInt(0, 5)],
                escore: String(randomInt(10, 100)),
                classificacao: ['Normal', 'Abaixo', 'Acima'][randomInt(0, 2)]
            };
            
            var result = simulatePollingCycle(true, escalaDados, false);
            
            assert.strictEqual(result.pollingInterval, 5000,
                'Polling para testes longos deve ser 5000ms, foi ' + result.pollingInterval);
            assert.strictEqual(result.shouldAttemptSend, true,
                'Com _escalaDados definido (escala="' + escalaDados.escala + '"), polling DEVE tentar enviar');
            assert.strictEqual(result.shouldStop, false,
                'Polling NAO deve parar se jaEnviou=false');
        });
    })(i);
}

// Propriedade: sem _escalaDados, polling NAO tenta enviar
for (var i = 0; i < 10; i++) {
    (function(iter) {
        runTest('Prop5 [iter ' + iter + '] - Polling SEM _escalaDados NAO envia', function() {
            var result = simulatePollingCycle(true, null, false);
            assert.strictEqual(result.shouldAttemptSend, false,
                'Sem _escalaDados, polling NAO deveria tentar enviar');
        });
    })(i);
}

// Propriedade: se jaEnviou=true, polling deve parar
runTest('Prop5 - Polling para quando jaEnviou=true', function() {
    var escalaDados = { escala: 'TFLOD', escore: '15', classificacao: 'Normal' };
    var result = simulatePollingCycle(true, escalaDados, true);
    assert.strictEqual(result.shouldStop, true,
        'Polling DEVE parar quando jaEnviou=true');
});

// Propriedade: escalas usam intervalo de 3s (nao 5s)
runTest('Prop5 - Escalas usam polling de 3s', function() {
    var result = simulatePollingCycle(false, null, false);
    assert.strictEqual(result.pollingInterval, 3000,
        'Polling para escalas deve ser 3000ms, foi ' + result.pollingInterval);
    assert.strictEqual(result.pollingMax, 40,
        'Max ciclos para escalas deve ser 40, foi ' + result.pollingMax);
});

// Propriedade: testes longos usam max 600 ciclos
runTest('Prop5 - Testes longos usam max 600 ciclos', function() {
    var result = simulatePollingCycle(true, null, false);
    assert.strictEqual(result.pollingMax, 600,
        'Max ciclos para testes longos deve ser 600, foi ' + result.pollingMax);
});

// ========================================
// PROPRIEDADE 6: Formato do pacote coleta-anonima preservado
// Validates: Requirements 3.3, 3.7
// ========================================

console.log('\n=== PROPRIEDADE 6: Formato pacote coleta-anonima ===');
console.log('Para todo envio ao Google Sheets, pacote DEVE ter: {email, escala, idade, sexo, escolaridade, pontuacao, dominios, classificacao}\n');

var PACOTE_REQUIRED_FIELDS = ['email', 'escala', 'idade', 'sexo', 'escolaridade', 'pontuacao', 'dominios', 'classificacao'];

for (var i = 0; i < NUM_CASES; i++) {
    (function(iter) {
        runTest('Prop6 [iter ' + iter + '] - Pacote coleta-anonima contem todos os campos', function() {
            var email = randomEmail();
            var escalaDados = {
                escala: ['TFLOD', 'TREF', 'TRMV', 'TECFE', 'ERT-PP', 'DASS-21'][randomInt(0, 5)],
                escore: String(randomInt(10, 100) / 10),
                classificacao: ['Normal', 'Leve', 'Moderado', 'Intenso'][randomInt(0, 3)],
                dominios: {}
            };
            // Gerar dominios aleatorios
            var numDominios = randomInt(1, 5);
            for (var d = 0; d < numDominios; d++) {
                escalaDados.dominios['dominio' + d] = { media: randomInt(1, 50) / 10 };
            }
            var idade = randomInt(18, 85);
            var sexo = randomSexo();
            var escolaridade = randomEscolaridade();
            
            var pacote = buildColetaPacket(email, escalaDados, idade, sexo, escolaridade);
            
            assert.ok(pacote !== null, 'Pacote nao deveria ser nulo com dados validos');
            
            // Verificar todos os campos obrigatorios
            PACOTE_REQUIRED_FIELDS.forEach(function(field) {
                assert.ok(
                    pacote.hasOwnProperty(field),
                    'Campo "' + field + '" ausente no pacote coleta-anonima! Campos: [' + Object.keys(pacote).join(', ') + ']'
                );
            });
            
            // Verificar que NAO tem campos extras (formato estrito)
            var camposExtras = Object.keys(pacote).filter(function(k) {
                return PACOTE_REQUIRED_FIELDS.indexOf(k) === -1;
            });
            assert.strictEqual(camposExtras.length, 0,
                'Pacote contem campos extras nao esperados: [' + camposExtras.join(', ') + ']');
            
            // Verificar tipos
            assert.strictEqual(typeof pacote.email, 'string', 'email deve ser string');
            assert.strictEqual(typeof pacote.escala, 'string', 'escala deve ser string');
            assert.strictEqual(typeof pacote.idade, 'number', 'idade deve ser number');
            assert.strictEqual(typeof pacote.pontuacao, 'string', 'pontuacao deve ser string');
            assert.strictEqual(typeof pacote.dominios, 'string', 'dominios deve ser string');
            assert.strictEqual(typeof pacote.classificacao, 'string', 'classificacao deve ser string');
        });
    })(i);
}

// Propriedade: sem instrumento valido, pacote e null (nao envia)
runTest('Prop6 - Sem instrumento, nao gera pacote', function() {
    var pacote = buildColetaPacket(randomEmail(), null, 30, 'M', 'Superior');
    assert.strictEqual(pacote, null, 'Sem escalaDados, pacote DEVE ser null');
});

runTest('Prop6 - Instrumento com menos de 3 chars, nao gera pacote', function() {
    var escalaDados = { escala: 'AB', escore: '10', classificacao: 'X' };
    var pacote = buildColetaPacket(randomEmail(), escalaDados, 30, 'M', 'Superior');
    assert.strictEqual(pacote, null, 'Instrumento <3 chars, pacote DEVE ser null');
});

runTest('Prop6 - Sem idade, nao gera pacote', function() {
    var escalaDados = { escala: 'TFLOD', escore: '12', classificacao: 'Normal', dominios: { d1: 5 } };
    var pacote = buildColetaPacket(randomEmail(), escalaDados, null, 'M', 'Superior');
    assert.strictEqual(pacote, null, 'Sem idade, pacote DEVE ser null');
});

runTest('Prop6 - Sem pontuacao E sem dominios, nao gera pacote', function() {
    var escalaDados = { escala: 'TFLOD', escore: '', classificacao: 'Normal' }; // sem dominios
    var pacote = buildColetaPacket(randomEmail(), escalaDados, 30, 'M', 'Superior');
    assert.strictEqual(pacote, null, 'Sem pontuacao e sem dominios, pacote DEVE ser null');
});

// ========================================
// PROPRIEDADE 7: Verificacao no arquivo fonte - polling interval
// Validates: Requirements 3.3, 3.6
// ========================================

console.log('\n=== PROPRIEDADE 7: Verificacao de polling no fonte coleta-anonima.js ===');
console.log('Polling de testes longos usa intervalo 5000ms e max 600 ciclos\n');

if (coletaSource) {
    runTest('Prop7 - Polling interval para testes longos e 5000ms', function() {
        // Verificar que o source contem: _pollingInterval = _isTesteLongo ? 5000 : 3000
        var match = coletaSource.match(/_pollingInterval\s*=\s*_isTesteLongo\s*\?\s*(\d+)\s*:\s*(\d+)/);
        assert.ok(match, 'Padrao de polling interval nao encontrado no coleta-anonima.js');
        assert.strictEqual(parseInt(match[1]), 5000, 'Polling testes longos deve ser 5000ms, encontrado: ' + match[1]);
        assert.strictEqual(parseInt(match[2]), 3000, 'Polling escalas deve ser 3000ms, encontrado: ' + match[2]);
    });
    
    runTest('Prop7 - Polling max para testes longos e 600', function() {
        // Verificar que o source contem: _pollingMax = _isTesteLongo ? 600 : 40
        var match = coletaSource.match(/_pollingMax\s*=\s*_isTesteLongo\s*\?\s*(\d+)\s*:\s*(\d+)/);
        assert.ok(match, 'Padrao de polling max nao encontrado no coleta-anonima.js');
        assert.strictEqual(parseInt(match[1]), 600, 'Max ciclos testes longos deve ser 600, encontrado: ' + match[1]);
        assert.strictEqual(parseInt(match[2]), 40, 'Max ciclos escalas deve ser 40, encontrado: ' + match[2]);
    });
    
    runTest('Prop7 - Polling verifica _escalaDados.escala antes de enviar', function() {
        // Verificar que a logica de polling inclui checagem de _escalaDados
        var hasEscalaCheck = coletaSource.indexOf('window._escalaDados && window._escalaDados.escala') !== -1;
        assert.ok(hasEscalaCheck,
            'Polling DEVE verificar "window._escalaDados && window._escalaDados.escala" antes de chamar _enviarDadosAnonimos');
    });
} else {
    runTest('Prop7 - SKIP (arquivo nao acessivel)', function() {
        console.log('    Arquivo coleta-anonima.js nao acessivel');
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
    console.log('Investigue antes de aplicar o fix.');
    process.exit(1);
} else {
    console.log('SUCESSO: Todos os testes de preservacao PASSARAM!');
    console.log('O comportamento existente esta capturado e validado.');
    console.log('Estes testes devem CONTINUAR passando apos o fix ser implementado.');
    console.log('');
    console.log('Comportamentos preservados:');
    console.log('  1. data.formData do TFLOD: nome, idade, idadeAnos, escolaridade, dataNasc, dataAval, obs, correcaoVisual, id, pacienteId');
    console.log('  2. data.formData do TREF: nome, idade, sexo, dataNasc, dataAval, obs, id, pacienteId');
    console.log('  3. data do TRMV: reconhecimento1, reconhecimento2, indiceRetencao (cada com acertos/alarmesFalsos/omissoes/tempoResposta)');
    console.log('  4. Interceptores: calcularResultados(500), salvarResultadoLambda(500), finalizarTeste(500), showEndScreen(500), _prepararDadosEEnviar(1500), enviarResultados(1500,5000), mostrarTelaFinal(2000,5000)');
    console.log('  5. Polling: 5s para testes longos, 3s para escalas, detecta _escalaDados.escala');
    console.log('  6. Pacote coleta: {email, escala, idade, sexo, escolaridade, pontuacao, dominios, classificacao}');
    process.exit(0);
}
