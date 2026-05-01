function startTesteConcentrada() {
  if (typeof marcarBypassados === 'function') marcarBypassados();
  console.log("Iniciando startTesteConcentrada");

  const birthDate = localStorage.getItem('dataNascimento');
  if (!birthDate) {
    alert("Por favor, preencha a data de nascimento.");
    return;
  }

  // Obtém configuração por faixa etária
  CONFIG_CONC = obterConfigConcentrada();
  console.log(`🎂 Faixa: ${CONFIG_CONC.faixa} (${CONFIG_CONC.idadeAnos} anos)`);
  console.log(`⚙️ Tentativas: ${CONFIG_CONC.numTrials} | Diferença: ${CONFIG_CONC.difference}px | Janela: ${CONFIG_CONC.responseWindow}ms`);

  const botaoIniciar = document.getElementById("startConcentrada");
  if (botaoIniciar) botaoIniciar.style.display = "none";

  isTestRunningConc = true;
  testeJaFinalizadoConc = false;
  mostrarBotoesControle();
  currentTrialConc = 0;
  trialDataConc = [];

  // Gera tentativas balanceadas
  const metade = Math.floor(CONFIG_CONC.numTrials / 2);
  trialsConc = [];
  for (let i = 0; i < metade; i++) {
    trialsConc.push({ type: 'horizontal', target: Math.random() > 0.5 ? 'left' : 'right' });
  }
  for (let i = 0; i < CONFIG_CONC.numTrials - metade; i++) {
    trialsConc.push({ type: 'vertical', target: Math.random() > 0.5 ? 'top' : 'bottom' });
  }
  trialsConc = shuffleArrayConc(trialsConc);

  const quadro = document.getElementById("quadroConcentrada");
  if (!quadro) return;

  canvasConc = document.createElement('canvas');
  ctxConc = canvasConc.getContext('2d');
  canvasConc.width = WIDTH_CONC;
  canvasConc.height = HEIGHT_CONC;
  canvasConc.style.border = '2px solid #333';
  canvasConc.style.borderRadius = '8px';
  quadro.appendChild(canvasConc);

  showInstructionsConc();
}

function shuffleArrayConc(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clearScreenConc() {
  ctxConc.fillStyle = COR_FUNDO_CONC;
  ctxConc.fillRect(0, 0, WIDTH_CONC, HEIGHT_CONC);
}

function drawFixationConc() {
  ctxConc.strokeStyle = COR_LINHA_CONC;
  ctxConc.lineWidth = ESPESSURA_LINHA_CONC;
  const cx = WIDTH_CONC / 2;
  const cy = HEIGHT_CONC / 2;
  ctxConc.beginPath();
  ctxConc.moveTo(cx - 12, cy);
  ctxConc.lineTo(cx + 12, cy);
  ctxConc.moveTo(cx, cy - 12);
  ctxConc.lineTo(cx, cy + 12);
  ctxConc.stroke();
}

function drawLinesConc(trial) {
  const baseLength = CONFIG_CONC.baseLength;
  const difference = CONFIG_CONC.difference;
  const cx = WIDTH_CONC / 2;
  const cy = HEIGHT_CONC / 2;
  const spacing = 90;

  ctxConc.strokeStyle = COR_LINHA_CONC;
  ctxConc.lineWidth = ESPESSURA_LINHA_CONC;

  if (trial.type === 'horizontal') {
    const leftLen = trial.target === 'left' ? baseLength + difference : baseLength;
    const rightLen = trial.target === 'right' ? baseLength + difference : baseLength;
    ctxConc.beginPath();
    ctxConc.moveTo(cx - spacing, cy - leftLen / 2);
    ctxConc.lineTo(cx - spacing, cy + leftLen / 2);
    ctxConc.stroke();
    ctxConc.beginPath();
    ctxConc.moveTo(cx + spacing, cy - rightLen / 2);
    ctxConc.lineTo(cx + spacing, cy + rightLen / 2);
    ctxConc.stroke();
  }

  if (trial.type === 'vertical') {
    const topLen = trial.target === 'top' ? baseLength + difference : baseLength;
    const bottomLen = trial.target === 'bottom' ? baseLength + difference : baseLength;
    ctxConc.beginPath();
    ctxConc.moveTo(cx - topLen / 2, cy - spacing);
    ctxConc.lineTo(cx + topLen / 2, cy - spacing);
    ctxConc.stroke();
    ctxConc.beginPath();
    ctxConc.moveTo(cx - bottomLen / 2, cy + spacing);
    ctxConc.lineTo(cx + bottomLen / 2, cy + spacing);
    ctxConc.stroke();
  }
}

function showInstructionsConc() {
  clearScreenConc();
  ctxConc.fillStyle = 'black';
  ctxConc.textAlign = 'center';
  const centerX = WIDTH_CONC / 2;

  const lines = [
    "ATENÇÃO CONCENTRADA",
    "",
    "Você verá pares de linhas brevemente.",
    "Uma será ligeiramente mais longa que a outra.",
    "",
    "Sua tarefa é indicar QUAL LINHA É MAIS LONGA",
    "usando as TECLAS DE SETA do teclado:",
    "",
    "←  = LINHA da ESQUERDA",
    "→  = LINHA da DIREITA",
    "↑  = LINHA de CIMA",
    "↓  = LINHA de BAIXO",
    "",
    "Responda assim que perceber.",
    `O teste tem ${CONFIG_CONC.numTrials} tentativas.`,
    "",
    "PRESSIONE ESPAÇO PARA COMEÇAR"
  ];

  const startY = 80;
  lines.forEach((line, i) => {
    const y = startY + i * 30;
    if (i === 0) {
      ctxConc.font = 'bold 24px Arial';
      ctxConc.fillStyle = 'black';
    } else if (i === lines.length - 1) {
      ctxConc.font = 'bold 20px Arial';
      ctxConc.fillStyle = '#007BFF';
    } else {
      ctxConc.font = '18px Arial';
      ctxConc.fillStyle = 'black';
    }
    ctxConc.fillText(line, centerX, y);
  });

  const startListener = (e) => {
    if (e.code === 'Space' && isTestRunningConc) {
      e.preventDefault();
      document.removeEventListener('keydown', startListener);
      window._concStartTime = performance.now();
      runTrialConc();
    }
  };
  document.addEventListener('keydown', startListener);
}

function runTrialConc() {
  if (!isTestRunningConc) return;

  if (currentTrialConc >= trialsConc.length) {
    endTesteConcentrada();
    return;
  }

  const trial = trialsConc[currentTrialConc];
  const trialStart = performance.now();
  let response = null;
  let rt = null;

  clearScreenConc();
  drawFixationConc();

  setTimeout(() => {
    if (!isTestRunningConc) return;

    clearScreenConc();
    drawLinesConc(trial);

    const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const responseListener = (e) => {
      if (validKeys.includes(e.key)) {
        e.preventDefault();
        if (response === null) {
          response = e.key;
          rt = performance.now() - trialStart;
          document.removeEventListener('keydown', responseListener);
        }
      }
    };
    document.addEventListener('keydown', responseListener);

    setTimeout(() => {
      document.removeEventListener('keydown', responseListener);
      if (response === null) rt = null;

      let correct = false;
      if (trial.type === 'horizontal') {
        correct = (trial.target === 'left' && response === 'ArrowLeft') ||
                  (trial.target === 'right' && response === 'ArrowRight');
      } else if (trial.type === 'vertical') {
        correct = (trial.target === 'top' && response === 'ArrowUp') ||
                  (trial.target === 'bottom' && response === 'ArrowDown');
      }

      trialDataConc.push({
        trial: currentTrialConc + 1,
        type: trial.type,
        target: trial.target,
        response: response,
        rt: rt,
        correct: correct ? 1 : 0,
        error: (response !== null && !correct) ? 1 : 0,
        omitted: response === null
      });

      clearScreenConc();
      setTimeout(() => {
        currentTrialConc++;
        runTrialConc();
      }, CONFIG_CONC.blankDuration);
    }, CONFIG_CONC.responseWindow);
  }, CONFIG_CONC.fixationDuration);
}

function endTesteConcentrada(abandonado = false) {
  console.log("🎯 ENDTEST CONCENTRADA CHAMADO!");

  if (testeJaFinalizadoConc) {
    console.log("⚠️ CONCENTRADA: endTest já foi chamado, ignorando...");
    return;
  }
  testeJaFinalizadoConc = true;
  isTestRunningConc = false;
  esconderBotoesControle();

  // Duração real do teste
  const duracaoReal = window._concStartTime ? Math.round((performance.now() - window._concStartTime) / 1000) : 0;

  const total = trialDataConc.length;
  const correctCount = trialDataConc.filter(t => t.correct).length;
  const errors = trialDataConc.filter(t => t.error).length;
  const omissions = trialDataConc.filter(t => t.omitted).length;
  const accuracy = total > 0 ? correctCount / total : 0;
  const validRTs = trialDataConc.filter(t => t.rt !== null).map(t => t.rt);
  const meanRT = validRTs.length ? validRTs.reduce((a, b) => a + b, 0) / validRTs.length : 0;
  const variabilityRT = validRTs.length > 1 ?
    Math.sqrt(validRTs.map(rt => (rt - meanRT) ** 2).reduce((a, b) => a + b) / validRTs.length) : 0;

  gerarAnaliseCognitivaConcentrada(accuracy, meanRT, variabilityRT);

  const resultadosConcentrada = {
    acertos: correctCount,
    erros: errors,
    omissoes: omissions,
    totalTentativas: total,
    taxaAcerto: accuracy * 100,
    tempoMedio: meanRT,
    variabilidadeRT: variabilityRT,
    temposReacao: validRTs,
    duracaoTeste: duracaoReal,
    faixaEtaria: CONFIG_CONC.faixa,
    diferenciaLinhas: CONFIG_CONC.difference,
    janelaResposta: CONFIG_CONC.responseWindow,
    abandonado: abandonado,
    statusTeste: abandonado ? 'ABANDONADO' : 'CONCLUÍDO'
  };

  if (typeof salvarResultadoTeste === 'function') {
    salvarResultadoTeste('concentrada', resultadosConcentrada);
  }

  mostrarTelaParabensConc();

  setTimeout(() => {
    criarBotaoProximoTeste('testeConcentrada', 'testeSeletiva');
  }, 4000);
}

function gerarAnaliseCognitivaConcentrada(accuracy, meanRT, variabilityRT) {
  console.log("\n🧠 ANÁLISE NEUROPSICOLÓGICA - ATENÇÃO CONCENTRADA");
  console.log(`📊 Acurácia: ${(accuracy * 100).toFixed(1)}%`);
  console.log(`⏱️ Tempo médio: ${meanRT.toFixed(0)}ms`);
  console.log(`📈 Variabilidade: ${variabilityRT.toFixed(0)}ms`);
  console.log(`🎂 Faixa: ${CONFIG_CONC.faixa} | Diferença: ${CONFIG_CONC.difference}px | Janela: ${CONFIG_CONC.responseWindow}ms`);

  // Limiares ajustados por faixa etária (Kail, 1991; Luce, 1986)
  let limiarLento, limiarMuitoLento, limiarVariabilidade;
  if (CONFIG_CONC.faixa === 'crianca') {
    limiarLento = 900;
    limiarMuitoLento = 1200;
    limiarVariabilidade = 200;
  } else if (CONFIG_CONC.faixa === 'idoso') {
    limiarLento = 850;
    limiarMuitoLento = 1100;
    limiarVariabilidade = 180;
  } else {
    limiarLento = 650;
    limiarMuitoLento = 900;
    limiarVariabilidade = 130;
  }

  console.log("\n🔍 HIPÓTESE CLÍNICA:");
  if (meanRT >= limiarLento && meanRT <= limiarLento + 130 && variabilityRT > limiarVariabilidade && accuracy > 0.8) {
    console.log("📌 PERFIL: Risco de dificuldades associadas à dislexia");
    console.log(`• Tempo de reação lento para a faixa ${CONFIG_CONC.faixa} (>${limiarLento}ms) com alta variabilidade`);
    console.log("• Acurácia preservada: sugere lentidão no processamento visual rápido");
  } else if (meanRT > limiarMuitoLento && variabilityRT > limiarVariabilidade + 50 && accuracy < 0.75) {
    console.log("📌 PERFIL: Instabilidade atencional ampla");
    console.log(`• Lentidão significativa para a faixa ${CONFIG_CONC.faixa} (>${limiarMuitoLento}ms), alta variabilidade e erros frequentes`);
  } else if (accuracy < 0.6) {
    console.log("📌 PERFIL: Déficit de discriminação visual");
    console.log("• Acurácia abaixo de 60% independente da velocidade");
  } else {
    console.log(`✅ PERFIL: Atenção focal dentro do esperado para faixa ${CONFIG_CONC.faixa}`);
  }
}

function pararTesteConcentrada() {
  if (!isTestRunningConc) return;
  console.log("🛑 TESTE CONCENTRADA PARADO PELO USUÁRIO");
  endTesteConcentrada(true);
}

function mostrarTelaParabensConc() {
  clearScreenConc();
  ctxConc.fillStyle = 'black';
  ctxConc.font = 'bold 32px Arial';
  ctxConc.textAlign = 'center';
  ctxConc.fillText('Parabéns!', WIDTH_CONC/2, HEIGHT_CONC/2 - 40);
  ctxConc.font = '20px Arial';
  ctxConc.fillText('Você terminou este teste!', WIDTH_CONC/2, HEIGHT_CONC/2 + 20);
}
