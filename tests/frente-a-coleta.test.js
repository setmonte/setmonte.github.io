/**
 * Frente A - Testes da correcao da coleta anonima (coleta-anonima.js)
 *
 * Verifica DUAS correcoes:
 *   1. Trava anti-duplicacao: _jaEnviou (e window._jaEnviou) sao ativados ANTES
 *      do fetch e depois das validacoes, fechando a janela de corrida que gerava
 *      linhas duplicadas.
 *   2. Marcacao de abandono: quando um subteste da BAE tem statusTeste diferente
 *      de CONCLUIDO (ou abandonado=true), o pacote passa a incluir statusAbandono
 *      e abandonado.
 *
 * Estrategia: (a) valida a LOGICA de deteccao de abandono e (b) confirma no
 * CODIGO-FONTE real que as correcoes estao presentes e na ordem certa.
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var totalTests = 0, passedTests = 0, failedTests = 0;
function runTest(name, fn) {
    totalTests++;
    try { fn(); passedTests++; console.log('  PASS: ' + name); }
    catch (e) { failedTests++; console.log('  FAIL: ' + name + ' -> ' + e.message); }
}

var CAMINHO = path.join(__dirname, '..', 'online', 'coleta-anonima.js');
var CODIGO = fs.readFileSync(CAMINHO, 'utf8');

// Replica da funcao _statusAbandonoBAE (espelha o codigo real para testar a logica)
function statusAbandonoBAE(resultadosBAE) {
    var r = resultadosBAE || {};
    var testes = ['concentrada','seletiva','dividida','alternada','sustentada'];
    var itens = [];
    var CONCLUIDO = 'CONCLU' + String.fromCharCode(205) + 'DO';
    testes.forEach(function(t){
        if (r[t]) {
            var st = r[t].statusTeste;
            var ab = (r[t].abandonado === true) || (st && st !== CONCLUIDO && st !== 'CONCLUIDO');
            if (ab) itens.push(t + ':' + (st || 'ABANDONADO'));
        }
    });
    return { detalhe: itens.join('; '), teveAbandono: itens.length > 0 };
}

console.log('=== FRENTE A: Correcao da coleta anonima ===\n');
console.log('--- Logica de deteccao de abandono ---');

runTest('subteste ABANDONADO -> teveAbandono=true e detalhe correto', function() {
    var s = statusAbandonoBAE({ concentrada: { statusTeste: 'CONCLU\u00cdDO' }, sustentada: { statusTeste: 'ABANDONADO' } });
    assert.strictEqual(s.teveAbandono, true);
    assert.strictEqual(s.detalhe, 'sustentada:ABANDONADO');
});

runTest('BYPASSADO tambem conta como abandono', function() {
    var s = statusAbandonoBAE({ alternada: { statusTeste: 'BYPASSADO' } });
    assert.strictEqual(s.teveAbandono, true);
    assert.strictEqual(s.detalhe, 'alternada:BYPASSADO');
});

runTest('varios abandonos -> detalhe separado por "; "', function() {
    var s = statusAbandonoBAE({ sustentada: { statusTeste: 'ABANDONADO' }, alternada: { statusTeste: 'BYPASSADO' } });
    assert.strictEqual(s.teveAbandono, true);
    assert.strictEqual(s.detalhe, 'alternada:BYPASSADO; sustentada:ABANDONADO');
});

runTest('todos CONCLUIDO -> teveAbandono=false e detalhe vazio', function() {
    var s = statusAbandonoBAE({ concentrada: { statusTeste: 'CONCLU\u00cdDO' }, sustentada: { statusTeste: 'CONCLU\u00cdDO' } });
    assert.strictEqual(s.teveAbandono, false);
    assert.strictEqual(s.detalhe, '');
});

runTest('abandonado=true sem statusTeste -> rotulo ABANDONADO', function() {
    var s = statusAbandonoBAE({ dividida: { abandonado: true } });
    assert.strictEqual(s.teveAbandono, true);
    assert.strictEqual(s.detalhe, 'dividida:ABANDONADO');
});

runTest('objeto vazio -> sem abandono', function() {
    var s = statusAbandonoBAE({});
    assert.strictEqual(s.teveAbandono, false);
    assert.strictEqual(s.detalhe, '');
});

console.log('\n--- Verificacao no codigo-fonte real ---');

runTest('trava _jaEnviou fica ANTES do fetch', function() {
    var idxTrava = CODIGO.indexOf('_jaEnviou = true;');
    var idxFetch = CODIGO.indexOf('fetch(_COLETA_URL');
    assert.ok(idxTrava !== -1 && idxFetch !== -1, 'trava e fetch devem existir');
    assert.ok(idxTrava < idxFetch, 'a trava deve vir ANTES do fetch');
});

runTest('window._jaEnviou tambem e ativado antes do fetch', function() {
    var idxWin = CODIGO.indexOf('window._jaEnviou = true;');
    var idxFetch = CODIGO.indexOf('fetch(_COLETA_URL');
    assert.ok(idxWin !== -1, 'deve ativar window._jaEnviou');
    assert.ok(idxWin < idxFetch, 'window._jaEnviou deve vir antes do fetch');
});

runTest('pacote inclui statusAbandono e abandonado', function() {
    assert.ok(CODIGO.indexOf('statusAbandono: _abandonoBAE.detalhe') !== -1, 'pacote deve ter statusAbandono');
    assert.ok(CODIGO.indexOf('abandonado: _abandonoBAE.teveAbandono') !== -1, 'pacote deve ter abandonado');
});

runTest('guarda inicial de _jaEnviou permanece no topo da funcao', function() {
    assert.ok(CODIGO.indexOf('if (_jaEnviou || window._jaEnviou) return;') !== -1, 'guarda inicial deve permanecer');
});

runTest('chamada de _statusAbandonoBAE esta no ramo BAE (nao no ramo _escalaDados)', function() {
    var idxChamada = CODIGO.indexOf('_abandonoBAE = _statusAbandonoBAE();');
    var idxRamoBAE = CODIGO.indexOf('} else if (window.resultadosBAE');
    var idxRamoEscala = CODIGO.indexOf('if (window._escalaDados) {');
    assert.ok(idxChamada > idxRamoBAE, 'chamada deve estar apos o inicio do ramo BAE');
    assert.ok(idxRamoEscala < idxRamoBAE, 'ramo _escalaDados vem antes e nao contem a chamada');
});

runTest('validacoes obrigatorias continuam ANTES da trava (nao regridem)', function() {
    var idxValidacao = CODIGO.indexOf('if (!pontuacao && !dominios) return;');
    var idxTrava = CODIGO.indexOf('_jaEnviou = true;');
    assert.ok(idxValidacao !== -1, 'validacao final deve existir');
    assert.ok(idxValidacao < idxTrava, 'validacoes devem vir antes da trava (senao envio invalido travaria envios validos)');
});

console.log('\n========================================');
console.log('RESULTADO - Frente A (coleta anonima)');
console.log('========================================');
console.log('Total: ' + totalTests + ' | Passaram: ' + passedTests + ' | Falharam: ' + failedTests);
if (failedTests === 0) { console.log('SUCESSO: correcoes da Frente A validadas.'); }
else { console.log('ATENCAO: ha falhas.'); process.exit(1); }