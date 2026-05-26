// Script para reorganizar: mover DOMContentLoaded para DEPOIS de _decodificarURL e _enviarResultadosPainel
var fs = require('fs');
var path = require('path');

var dir = 'd:/Planilhas/site/escalas/';
var files = ['escasi','sasc-r','tdi','renzulli','sobrexcitabilidade','qiiahsd','tea-ah','raads','ysq-s3',
  'ert-pp','bapq','dass-21','cat-q','asrs-18','dislexia','snap-iv',
  'ert-pb','ert-pa','ert-pd','ert-pev','ert-pet','ert-pes','ert-ph','ert-pn','ert-poc','ert-tb'];

var fixed = 0;
var skipped = 0;

files.forEach(function(f) {
  var filepath = dir + f + '.html';
  var html = fs.readFileSync(filepath, 'utf8');
  
  // Encontrar o bloco principal <script> (o maior, que contém o código da escala)
  // Padrão: DOMContentLoaded vem antes de "function _decodificarURL"
  // Precisamos mover o bloco DOMContentLoaded para o final
  
  var domMatch = html.match(/document\.addEventListener\('DOMContentLoaded',\s*function\s*\(\)\s*\{/);
  if (!domMatch) {
    // Tentar arrow function
    domMatch = html.match(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/);
  }
  if (!domMatch) {
    // Tentar formato inline
    domMatch = html.match(/document\.addEventListener\('DOMContentLoaded',function\(\)\{/);
  }
  
  var decodIdx = html.indexOf('function _decodificarURL');
  var enviarIdx = html.indexOf('async function _enviarResultadosPainel');
  
  if (!domMatch || decodIdx < 0) {
    console.log(f + ': SKIP (padrao nao encontrado)');
    skipped++;
    return;
  }
  
  var domIdx = html.indexOf(domMatch[0]);
  
  // Se DOMContentLoaded ja esta depois de _decodificarURL, pular
  if (domIdx > decodIdx) {
    console.log(f + ': JA OK');
    skipped++;
    return;
  }
  
  // Encontrar o final do bloco DOMContentLoaded
  // Ele termina com }); seguido de quebra de linha
  // Precisamos encontrar o fechamento correto contando chaves
  var startPos = domIdx;
  var braceCount = 0;
  var endPos = -1;
  var inString = false;
  var stringChar = '';
  
  for (var i = startPos; i < html.length; i++) {
    var ch = html[i];
    
    if (inString) {
      if (ch === stringChar && html[i-1] !== '\\') inString = false;
      continue;
    }
    
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    
    if (ch === '{') braceCount++;
    if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        // Encontrou o fechamento da function(){}
        // Agora precisa encontrar o ); que fecha o addEventListener
        var rest = html.substring(i+1, i+10);
        var closeMatch = rest.match(/^\s*\)\s*;/);
        if (closeMatch) {
          endPos = i + 1 + closeMatch[0].length;
          break;
        }
      }
    }
  }
  
  if (endPos < 0) {
    console.log(f + ': ERRO - nao encontrou fim do DOMContentLoaded');
    skipped++;
    return;
  }
  
  // Extrair o bloco DOMContentLoaded
  var domBlock = html.substring(startPos, endPos);
  
  // Remover o bloco da posicao original
  var before = html.substring(0, startPos);
  var after = html.substring(endPos);
  
  // Encontrar onde inserir (depois de _enviarResultadosPainel, antes do </script>)
  // Procurar o ultimo } da funcao _enviarResultadosPainel na parte "after"
  var enviarInAfter = after.indexOf('async function _enviarResultadosPainel');
  if (enviarInAfter < 0) {
    // _enviarResultadosPainel pode estar na parte "before" se ja foi movida
    // Nesse caso, inserir no final do script (antes de </script>)
    var scriptEnd = after.lastIndexOf('</script>');
    if (scriptEnd < 0) {
      console.log(f + ': ERRO - nao encontrou </script>');
      skipped++;
      return;
    }
    // Encontrar o </script> que fecha o bloco principal (primeiro que aparece)
    var firstScriptEnd = after.indexOf('</script>');
    // Inserir antes dele
    var newHtml = before + after.substring(0, firstScriptEnd) + '\n' + domBlock + '\n' + after.substring(firstScriptEnd);
    fs.writeFileSync(filepath, newHtml, 'utf8');
    console.log(f + ': CORRIGIDO (inserido antes de </script>)');
    fixed++;
    return;
  }
  
  // Encontrar o fim da funcao _enviarResultadosPainel
  var enviarStart = enviarInAfter;
  braceCount = 0;
  var enviarEnd = -1;
  for (var i = enviarStart; i < after.length; i++) {
    var ch = after[i];
    if (inString) {
      if (ch === stringChar && after[i-1] !== '\\') inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') braceCount++;
    if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        enviarEnd = i + 1;
        break;
      }
    }
  }
  
  if (enviarEnd < 0) {
    console.log(f + ': ERRO - nao encontrou fim de _enviarResultadosPainel');
    skipped++;
    return;
  }
  
  // Inserir DOMContentLoaded depois de _enviarResultadosPainel
  var newAfter = after.substring(0, enviarEnd) + '\n\n' + domBlock + '\n' + after.substring(enviarEnd);
  var newHtml = before + newAfter;
  
  fs.writeFileSync(filepath, newHtml, 'utf8');
  console.log(f + ': CORRIGIDO');
  fixed++;
});

console.log('\nTotal: ' + fixed + ' corrigidos, ' + skipped + ' pulados');
