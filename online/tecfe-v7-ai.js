// tecfe-v7-ai.js
// Geracao de laudo clinico via Gemini AI (via Lambda proxy)
// SEM acentos nos comentarios/strings do codigo

var TECFEAI = (function () {

  var API_URL = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws/generate-ai';

  function buildPrompt(formData, stats, abandoned) {
    var status = 'completo';
    if (abandoned === 'interrompido') status = 'interrompido inesperadamente';
    else if (abandoned) status = 'abandonado pelo avaliador';
    else if (stats.trialsPerformed < 128 && stats.completedCategories < 6) status = 'parcial (cartas esgotadas)';

    var prompt = 'Voce e um neuropsicologo experiente. Gere um LAUDO CLINICO breve (maximo 8 linhas) ' +
      'baseado nos resultados abaixo do Teste Eletronico de Classificacao de Cartas (TECFE), ' +
      'versao computadorizada do Wisconsin Card Sorting Test.\n\n' +
      'DADOS DO PACIENTE:\n' +
      '- Idade: ' + formData.idade + '\n' +
      '- Escolaridade: ' + formData.escolaridade + '\n' +
      '- Sexo: ' + (formData.sexo || 'N/I') + '\n\n' +
      'RESULTADOS:\n' +
      '- Status do teste: ' + status + '\n' +
      '- Tentativas: ' + stats.trialsPerformed + '/128\n' +
      '- Categorias completadas: ' + stats.completedCategories + '/6\n' +
      '- Total de erros: ' + stats.totalErrors + ' (' + stats.pctErrors.toFixed(1) + '%)\n' +
      '- Erros perseverativos: ' + stats.persevErrors + ' (' + stats.pctPersevErr.toFixed(1) + '%)\n' +
      '- Respostas perseverativas: ' + stats.persevResponses + ' (' + stats.pctPersevResp.toFixed(1) + '%)\n' +
      '- Nivel conceitual: ' + stats.pctConceptual.toFixed(1) + '%\n' +
      '- Escore T: ' + stats.escoreT + '\n' +
      '- Escore Padrao: ' + stats.escorePadrao + '\n' +
      '- Ensaios 1a categoria: ' + stats.trialsToFirst + '\n' +
      '- Fracasso em manter contexto: ' + stats.failMaintain + '\n' +
      '- Aprendendo a aprender: ' + (stats.learningToLearn !== null ? stats.learningToLearn.toFixed(2) : 'N/A') + '\n' +
      '- Impulsividade: ' + stats.impulsivityIndex.toFixed(2) + '\n';

    if (stats.randomAlerts && stats.randomAlerts.length > 0) {
      prompt += '- ALERTA: Padrao de resposta aleatoria detectado em ' + stats.randomAlerts.length + ' bloco(s)\n';
    }

    prompt += '\nSEQUENCIA DE RESPOSTAS (categoria vigente | match | resultado):\n';
    var results = (typeof WCSTEngine !== 'undefined' && WCSTEngine.state) ? (WCSTEngine.state.results || []) : [];
    var maxShow = Math.min(results.length, 40);
    for (var i = 0; i < maxShow; i++) {
      var r = results[i];
      prompt += (i+1) + ': ' + r.category + ' | ' + r.match + ' | ' + (r.correct ? 'OK' : 'ERRO') + (r.perseverative ? ' (persev)' : '') + '\n';
    }
    if (results.length > 40) prompt += '... (mais ' + (results.length - 40) + ' tentativas)\n';

    prompt += '\nINSTRUCOES:\n' +
      '- Escreva em portugues brasileiro, linguagem tecnica mas acessivel\n' +
      '- Mencione funcoes executivas avaliadas (flexibilidade cognitiva, controle inibitorio, formacao de conceitos)\n' +
      '- Interprete os indicadores em relacao ao esperado para a faixa etaria\n' +
      '- Se houver alerta de resposta aleatoria, mencione que pode comprometer a validade\n' +
      '- NAO inclua recomendacoes de tratamento\n' +
      '- NAO repita os numeros, interprete-os clinicamente\n' +
      '- Termine com uma conclusao sobre o funcionamento executivo global\n' +
      '- Na ULTIMA LINHA, escreva EXATAMENTE neste formato (sem mais nada depois):\n' +
      '  ESTRATEGIA: [classificacao] - [descricao breve]\n' +
      '  Classificacoes possiveis: Sistematica, Sistematica por eliminacao, Parcialmente sistematica, Tentativa e erro, Perseverativa, Aleatoria, Impulsiva\n' +
      '  Exemplo: ESTRATEGIA: Sistematica por eliminacao - descartou hipoteses apos feedback negativo';

    return prompt;
  }

  function generateReport(formData, stats, abandoned) {
    return new Promise(function (resolve, reject) {
      var prompt = buildPrompt(formData, stats, abandoned);

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var text = (data.text || '').trim();
        var estrategia = '';
        var laudo = text;
        var idx = text.indexOf('ESTRATEGIA:');
        if (idx >= 0) {
          estrategia = text.substring(idx).replace(/^ESTRAT[EÉ]GIA:\s*/i, '').trim();
          laudo = text.substring(0, idx).trim();
        }
        resolve({ laudo: laudo, estrategia: estrategia });
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }

  return {
    generateReport: generateReport
  };

})();
