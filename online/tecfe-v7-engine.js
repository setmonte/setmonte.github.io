// tecfe-v7-engine.js
// Motor do teste TECFE - logica, perseveracao, escores
// SEM acentos nos comentarios/strings do codigo

var WCSTEngine = (function () {

  // -- Estado do teste --
  var state = {
    currentCategory: 'cor',
    consecutiveCorrect: 0,
    totalAttempts: 0,
    maxAttempts: 128,
    completedCategories: 0,
    currentRound: 1,
    categoriesInRound: 0,
    isActive: false,
    results: [],
    randomAlerts: [],
    perseverativePrinciple: null,
    previousCategory: null,
    trialsToFirstCategory: null,
    startTimestamp: null,
    endTimestamp: null,
    roundStats: {
      1: { cor: { e: 0, c: 0 }, forma: { e: 0, c: 0 }, numero: { e: 0, c: 0 } },
      2: { cor: { e: 0, c: 0 }, forma: { e: 0, c: 0 }, numero: { e: 0, c: 0 } }
    },
    // Baralhos
    rounds: [],
    currentDeckIndex: 0,
    currentDeck: [],
    cardIndex: 0
  };

  function reset() {
    state.currentCategory = 'cor';
    state.consecutiveCorrect = 0;
    state.totalAttempts = 0;
    state.completedCategories = 0;
    state.currentRound = 1;
    state.categoriesInRound = 0;
    state.isActive = false;
    state.results = [];
    state.randomAlerts = [];
    state.perseverativePrinciple = null;
    state.previousCategory = null;
    state.trialsToFirstCategory = null;
    state.startTimestamp = Date.now();
    state.endTimestamp = null;
    state.roundStats = {
      1: { cor: { e: 0, c: 0 }, forma: { e: 0, c: 0 }, numero: { e: 0, c: 0 } },
      2: { cor: { e: 0, c: 0 }, forma: { e: 0, c: 0 }, numero: { e: 0, c: 0 } }
    };
    state.rounds = [
      WCSTCards.shuffle(WCSTCards.buildDeck()),
      WCSTCards.shuffle(WCSTCards.buildDeck())
    ];
    state.currentDeckIndex = 0;
    state.currentDeck = state.rounds[0];
    state.cardIndex = 0;
  }

  function loadNextDeck() {
    state.currentDeckIndex++;
    if (state.currentDeckIndex >= state.rounds.length) return false;
    state.currentDeck = state.rounds[state.currentDeckIndex];
    state.cardIndex = 0;
    return true;
  }

  // -- Restaurar estado a partir de auto-save (para recuperacao de teste interrompido) --
  function restoreFromAutoSave(data) {
    state.results = data.results || [];
    state.totalAttempts = data.totalAttempts || state.results.length;
    state.completedCategories = data.completedCategories || 0;
    state.currentCategory = data.currentCategory || 'cor';
    state.consecutiveCorrect = data.consecutiveCorrect || 0;
    state.currentRound = data.currentRound || 1;
    state.perseverativePrinciple = data.perseverativePrinciple || null;
    state.previousCategory = data.previousCategory || null;
    state.trialsToFirstCategory = data.trialsToFirstCategory || null;
    state.startTimestamp = data.startTimestamp || Date.now();
    state.endTimestamp = Date.now();
    state.isActive = false;
    if (data.roundStats) {
      state.roundStats = data.roundStats;
    }
  }

  // -- Mudanca de categoria --
  function changeCategory() {
    var cats = ['cor', 'forma', 'numero'];
    var idx = cats.indexOf(state.currentCategory);
    state.previousCategory = state.currentCategory;
    state.currentCategory = cats[(idx + 1) % 3];
    state.completedCategories++;
    state.categoriesInRound++;
    state.perseverativePrinciple = state.previousCategory;

    if (state.categoriesInRound === 3) {
      state.currentRound++;
      state.categoriesInRound = 0;
    }
  }

  // -- Processar tentativa --
  function processTrial(dragCor, dragForma, dragNumero, targetCor, targetForma, targetNumero, reactionTime) {
    var matchCor = (dragCor === targetCor);
    var matchForma = (dragForma === targetForma);
    var matchNumero = (dragNumero === targetNumero);

    // Salva categoria ANTES de possivel mudanca
    var trialCategory = state.currentCategory;

    // Acerto conforme categoria vigente
    var isCorrect = false;
    if (trialCategory === 'cor' && matchCor) isCorrect = true;
    if (trialCategory === 'forma' && matchForma) isCorrect = true;
    if (trialCategory === 'numero' && matchNumero) isCorrect = true;

    // Tipo de match
    var matchType = '';
    if (matchCor) matchType += 'C';
    if (matchForma) matchType += (matchType ? '+' : '') + 'F';
    if (matchNumero) matchType += (matchType ? '+' : '') + 'N';
    if (!matchType) matchType = 'O';

    // -- Perseveracao corrigida (Heaton et al.) --
    var isPerseverative = false;
    if (state.perseverativePrinciple) {
      // Resposta que corresponde ao principio perseverativo (categoria anterior)
      if (state.perseverativePrinciple === 'cor' && matchCor) isPerseverative = true;
      if (state.perseverativePrinciple === 'forma' && matchForma) isPerseverative = true;
      if (state.perseverativePrinciple === 'numero' && matchNumero) isPerseverative = true;
    }
    // Na 1a categoria nao ha perseveracao (sem principio anterior)

    // Erro perseverativo = perseverativo E incorreto
    var isPerseverativeError = (isPerseverative && !isCorrect);

    // Atualiza stats por rodada
    var rnd = state.currentRound <= 2 ? state.currentRound : 2;
    if (state.roundStats[rnd] && state.roundStats[rnd][trialCategory]) {
      if (isCorrect) state.roundStats[rnd][trialCategory].c++;
      else state.roundStats[rnd][trialCategory].e++;
    } else {
      // Rodada extra (nao deveria ocorrer, mas protege)
      if (state.roundStats[2] && state.roundStats[2][trialCategory]) {
        if (isCorrect) state.roundStats[2][trialCategory].c++;
        else state.roundStats[2][trialCategory].e++;
      }
    }

    // Sequencia de acertos
    if (isCorrect) {
      state.consecutiveCorrect++;
      if (state.consecutiveCorrect >= 10) {
        if (state.completedCategories === 0 && state.trialsToFirstCategory === null) {
          state.trialsToFirstCategory = state.totalAttempts + 1;
        }
        changeCategory();
        state.consecutiveCorrect = 0;
        if (state.completedCategories >= 6) {
          state.isActive = false;
          state.endTimestamp = Date.now();
        }
      }
    } else {
      state.consecutiveCorrect = 0;
    }

    state.totalAttempts++;
    state.cardIndex++;

    var result = {
      trial: state.totalAttempts,
      category: trialCategory,
      match: matchType,
      correct: isCorrect,
      perseverative: isPerseverative,
      perseverativeError: isPerseverativeError,
      reactionTime: reactionTime
    };
    state.results.push(result);

    // Verifica se precisa trocar baralho
    var needNewDeck = false;
    if (state.cardIndex >= 64 && state.currentDeckIndex < 1) {
      needNewDeck = true;
    }

    // Verifica fim por tentativas
    if (state.totalAttempts >= state.maxAttempts) {
      state.isActive = false;
      state.endTimestamp = Date.now();
    }

    // Detectar resposta aleatoria (a cada 16 tentativas)
    if (state.totalAttempts % 16 === 0 && state.totalAttempts >= 16) {
      var alertaRandom = detectRandomResponding(state.results, state.totalAttempts);
      if (alertaRandom && !state.randomAlerts) state.randomAlerts = [];
      if (alertaRandom) state.randomAlerts.push(alertaRandom);
    }

    return {
      result: result,
      testEnded: !state.isActive,
      completedAll: state.completedCategories >= 6,
      needNewDeck: needNewDeck
    };
  }

  // -- Calculos finais --
  function computeStats() {
    var r = state.results;
    var n = r.length;
    if (n === 0) return null;

    var totalCorrect = 0;
    var totalErrors = 0;
    var persevResponses = 0;
    var persevErrors = 0;
    var nonPersevErrors = 0;
    var conceptualLevel = 0;
    var totalRT = 0;
    var streak = 0;
    var failMaintain = 0;

    for (var i = 0; i < n; i++) {
      totalRT += r[i].reactionTime;
      if (r[i].correct) {
        totalCorrect++;
        streak++;
      } else {
        totalErrors++;
        if (streak >= 5 && streak < 10) failMaintain++;
        streak = 0;
      }
      if (r[i].perseverative) persevResponses++;
      if (r[i].perseverativeError) persevErrors++;
      if (!r[i].correct && !r[i].perseverative) nonPersevErrors++;
    }

    // Nivel conceitual: sequencias de 3+ acertos consecutivos
    conceptualLevel = 0;
    var run = 0;
    for (var i = 0; i < n; i++) {
      if (r[i].correct) {
        run++;
      } else {
        if (run >= 3) conceptualLevel += run;
        run = 0;
      }
    }
    if (run >= 3) conceptualLevel += run;

    // Aprendendo a aprender (corrigido)
    var catTrials = [];
    var ct = 0;
    var cc = 0;
    for (var i = 0; i < n; i++) {
      ct++;
      if (r[i].correct) {
        cc++;
        if (cc >= 10) {
          catTrials.push(ct);
          ct = 0;
          cc = 0;
        }
      } else {
        cc = 0;
      }
    }
    var learningToLearn = null;
    if (catTrials.length >= 3) {
      // Diferenca media entre eficiencias sucessivas
      var diffs = [];
      for (var i = 1; i < catTrials.length; i++) {
        var effPrev = (10 / catTrials[i - 1]) * 100;
        var effCurr = (10 / catTrials[i]) * 100;
        diffs.push(effCurr - effPrev);
      }
      var sum = 0;
      for (var j = 0; j < diffs.length; j++) sum += diffs[j];
      learningToLearn = sum / diffs.length;
    } else if (catTrials.length === 2) {
      var eff1 = (10 / catTrials[0]) * 100;
      var eff2 = (10 / catTrials[1]) * 100;
      learningToLearn = eff2 - eff1;
    }

    var base = 128;
    var pctErrors = (totalErrors / base) * 100;
    var pctPersevResp = (persevResponses / base) * 100;
    var pctPersevErr = (persevErrors / base) * 100;
    var pctNonPersevErr = (nonPersevErrors / base) * 100;
    var pctConceptual = n > 0 ? (conceptualLevel / n) * 100 : 0;

    // Escore T e Padrao (baseado em z-score de erros perseverativos)
    // Media e DP normativos aproximados (Heaton 2005)
    var scores = calcTScores(pctPersevErr);

    // Indice de impulsividade: erros nas primeiras 10 tentativas / 10
    var earlyErrors = 0;
    var earlyN = Math.min(10, n);
    for (var i = 0; i < earlyN; i++) {
      if (!r[i].correct) earlyErrors++;
    }
    var impulsivityIndex = earlyErrors / earlyN;

    // Curva de insight: % acerto por blocos de 16
    var insightCurve = [];
    for (var b = 0; b < n; b += 16) {
      var blockCorrect = 0;
      var blockN = 0;
      for (var j = b; j < Math.min(b + 16, n); j++) {
        blockN++;
        if (r[j].correct) blockCorrect++;
      }
      insightCurve.push(blockN > 0 ? Math.round((blockCorrect / blockN) * 100) : 0);
    }

    return {
      trialsPerformed: n,
      totalCorrect: totalCorrect,
      totalErrors: totalErrors,
      persevResponses: persevResponses,
      persevErrors: persevErrors,
      nonPersevErrors: nonPersevErrors,
      conceptualLevel: conceptualLevel,
      pctErrors: pctErrors,
      pctPersevResp: pctPersevResp,
      pctPersevErr: pctPersevErr,
      pctNonPersevErr: pctNonPersevErr,
      pctConceptual: pctConceptual,
      completedCategories: state.completedCategories,
      trialsToFirst: state.trialsToFirstCategory || 0,
      failMaintain: failMaintain,
      learningToLearn: learningToLearn,
      avgRT: totalRT / n,
      totalTime: ((state.endTimestamp || Date.now()) - state.startTimestamp) / 1000,
      escoreT: scores.t,
      escorePadrao: scores.p,
      impulsivityIndex: impulsivityIndex,
      insightCurve: insightCurve,
      randomAlerts: state.randomAlerts || [],
      roundStats: state.roundStats
    };
  }

  // -- Escore T e Padrao via z-score --
  // Norma brasileira Silva-Filho 2007 (universitarios 18-30, n=223)
  // Media e DP de % erros perseverativos: 13.73, 8.01
  function calcTScores(pctPersevErr) {
    var mean = 13.73;
    var sd = 8.01;
    var z = (pctPersevErr - mean) / sd;
    // Inverter: menos erros persev = melhor = T mais alto
    var t = Math.round(50 - z * 10);
    var p = Math.round(100 - z * 15);
    return { t: t, p: p, z: z };
  }

  // -- Classificacao diagnostica Heaton et al. (1993) Tabela 1 --
  // Baseado no Escore T
  function classifyDiagnostic(escoreT) {
    if (escoreT <= 19) return 'Gravemente Comprometido';
    if (escoreT <= 24) return 'Moderado a Gravemente Comprometido';
    if (escoreT <= 29) return 'Moderadamente Comprometido';
    if (escoreT <= 34) return 'Leve a Moderadamente Comprometido';
    if (escoreT <= 39) return 'Levemente Comprometido';
    if (escoreT <= 44) return 'Abaixo da Media';
    if (escoreT <= 54) return 'Na Media';
    return 'Acima da Media';
  }

  // -- Classificacao z-score (5 faixas) --
  function classifyZScore(z) {
    if (z <= -2) return 'Muito Abaixo da Media';
    if (z <= -1) return 'Abaixo da Media';
    if (z <= 1) return 'Media';
    if (z <= 2) return 'Acima da Media';
    return 'Muito Acima da Media';
  }

  // -- Tabela normativa Heaton 2005 (amostra americana n=899) --
  function getNormHeaton(ageYears, education) {
    var norm = { catCompleted: 5.4, pctErrors: 15.0, pctPersev: 10.5, pctConceptual: 62.0 };
    if (ageYears <= 10) norm = { catCompleted: 3.5, pctErrors: 30.0, pctPersev: 20.0, pctConceptual: 40.0 };
    else if (ageYears <= 15) norm = { catCompleted: 4.5, pctErrors: 22.0, pctPersev: 14.0, pctConceptual: 52.0 };
    else if (ageYears <= 29) norm = { catCompleted: 5.75, pctErrors: 19.13, pctPersev: 9.20, pctConceptual: 76.94 };
    else if (ageYears <= 49) norm = { catCompleted: 5.4, pctErrors: 14.0, pctPersev: 10.0, pctConceptual: 64.0 };
    else if (ageYears <= 64) norm = { catCompleted: 4.8, pctErrors: 18.0, pctPersev: 13.0, pctConceptual: 56.0 };
    else norm = { catCompleted: 3.8, pctErrors: 25.0, pctPersev: 18.0, pctConceptual: 45.0 };
    return norm;
  }

  // -- Tabela normativa Silva-Filho 2007 (amostra brasileira n=223, 18-30 anos) --
  function getNormSilva(ageYears, education) {
    // Dados reais da tese: universitarios Ribeirao Preto
    var norm = { catCompleted: 5.21, pctErrors: 26.23, pctPersev: 13.73, pctConceptual: 67.21 };
    if (ageYears <= 10) norm = { catCompleted: 3.0, pctErrors: 35.0, pctPersev: 22.0, pctConceptual: 35.0 };
    else if (ageYears <= 15) norm = { catCompleted: 4.0, pctErrors: 25.0, pctPersev: 16.0, pctConceptual: 48.0 };
    else if (ageYears <= 30) norm = { catCompleted: 5.21, pctErrors: 26.23, pctPersev: 13.73, pctConceptual: 67.21 };
    else if (ageYears <= 49) norm = { catCompleted: 5.0, pctErrors: 17.0, pctPersev: 11.5, pctConceptual: 58.0 };
    else if (ageYears <= 64) norm = { catCompleted: 4.2, pctErrors: 22.0, pctPersev: 15.0, pctConceptual: 50.0 };
    else norm = { catCompleted: 3.2, pctErrors: 30.0, pctPersev: 20.0, pctConceptual: 40.0 };
    return norm;
  }

  // -- Analise clinica --
  function getClinicalAnalysis(stats, abandoned) {
    var a = '';
    var cat = stats.completedCategories;
    var pe = stats.pctPersevErr;
    var fm = stats.failMaintain;
    var n = stats.trialsPerformed;

    if (abandoned === 'interrompido') {
      a += 'TESTE INTERROMPIDO INESPERADAMENTE apos ' + n + ' de 128 tentativas (queda de energia, falha do sistema ou fechamento acidental). ';
      a += 'Os resultados abaixo sao PARCIAIS e nao devem ser utilizados para fins de interpretacao clinica definitiva. ';
      a += 'Recomenda-se a reaplicacao completa do instrumento. ';
      if (n < 20) {
        a += 'O numero de tentativas e insuficiente para qualquer inferencia sobre o funcionamento executivo.';
        return a;
      }
      a += 'A titulo informativo, os indicadores parciais sugerem: ';
    } else if (abandoned) {
      a += 'TESTE INTERROMPIDO apos ' + n + ' de 128 tentativas. ';
      a += 'Os resultados abaixo sao PARCIAIS e nao devem ser utilizados para fins de interpretacao clinica. ';
      a += 'Recomenda-se a reaplicacao completa do instrumento. ';
      if (n < 20) {
        a += 'O numero de tentativas e insuficiente para qualquer inferencia sobre o funcionamento executivo.';
        return a;
      }
      a += 'A titulo informativo, os indicadores parciais sugerem: ';
    } else if (n < 128 && cat < 6) {
      a += 'TESTE PARCIAL (' + n + ' tentativas). Resultados devem ser interpretados com cautela. ';
    }

    if (cat >= 6) a += 'Desempenho NORMAL: capacidade adequada de formacao de conceitos, flexibilidade cognitiva e aprendizagem de regras. ';
    else if (cat >= 4) a += 'Desempenho LIMITROFE: dificuldade moderada na formacao de conceitos e flexibilidade cognitiva. ';
    else if (cat >= 2) a += 'Desempenho PREJUDICADO: dificuldade significativa na formacao de conceitos abstratos e flexibilidade mental. ';
    else a += 'Desempenho SEVERAMENTE PREJUDICADO: grave comprometimento nas funcoes executivas. ';

    if (pe > 20) a += 'Presenca de PERSEVERACAO ELEVADA, sugerindo rigidez cognitiva e dificuldade em inibir respostas inadequadas. ';
    else if (pe > 10) a += 'Perseveracao MODERADA, indicando alguma dificuldade no controle inibitorio. ';
    else a += 'Perseveracao dentro dos limites normais. ';

    if (fm > 2) a += 'FRACASSO EM MANTER O CONTEXTO elevado, sugerindo deficit na memoria de trabalho e/ou atencao sustentada.';
    else if (fm > 0) a += 'Leve dificuldade em manter o contexto, podendo indicar lapsos atencionais.';
    else a += 'Boa capacidade de manter o contexto e atencao sustentada.';

    return a;
  }

  // -- Deteccao de resposta aleatoria --
  function detectRandomResponding(results, currentTrial) {
    var start = currentTrial - 16;
    if (start < 0) return null;
    var block = results.slice(start, currentTrial);
    var totalRT = 0;
    var correct = 0;
    var matches = {};
    for (var i = 0; i < block.length; i++) {
      totalRT += block[i].reactionTime;
      if (block[i].correct) correct++;
      var m = block[i].match;
      matches[m] = (matches[m] || 0) + 1;
    }
    var avgRT = totalRT / 16;
    var pctCorrect = (correct / 16) * 100;
    var maxRepeat = 0;
    for (var k in matches) { if (matches[k] > maxRepeat) maxRepeat = matches[k]; }
    var pctRepeat = (maxRepeat / 16) * 100;

    var motivos = [];
    if (avgRT < 0.8) motivos.push('tempo medio muito rapido (' + avgRT.toFixed(2) + 's)');
    if (pctCorrect >= 18 && pctCorrect <= 32) motivos.push('taxa de acerto proxima ao acaso (' + pctCorrect.toFixed(0) + '%)');
    if (pctRepeat > 70) motivos.push('repeticao excessiva da mesma resposta (' + pctRepeat.toFixed(0) + '%)');

    if (motivos.length >= 2) {
      return {
        trial: currentTrial,
        block: 'tentativas ' + (start + 1) + '-' + currentTrial,
        motivos: motivos
      };
    }
    return null;
  }

  return {
    state: state,
    reset: reset,
    loadNextDeck: loadNextDeck,
    restoreFromAutoSave: restoreFromAutoSave,
    processTrial: processTrial,
    computeStats: computeStats,
    calcTScores: calcTScores,
    classifyZScore: classifyZScore,
    classifyDiagnostic: classifyDiagnostic,
    getNormHeaton: getNormHeaton,
    getNormSilva: getNormSilva,
    getClinicalAnalysis: getClinicalAnalysis
  };

})();
