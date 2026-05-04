// ===== FUNÇÃO DE INSTRUÇÕES =====
function mostrarInstrucoesSeletiva() {
  return new Promise(resolve => {
    const telaInstrucoes = document.createElement('div');
    telaInstrucoes.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    
    const titulo = document.createElement('h2');
    titulo.textContent = 'Atenção Seletiva';
    titulo.style.cssText = 'margin-bottom: 30px; color: #333;';
    
    const instrucoes = document.createElement('div');
    var isTouchDevice = window.dispositivoBAE && window.dispositivoBAE.isTouch;
    instrucoes.innerHTML = `
      <p style="font-size: 18px; line-height: 1.6; text-align: center; max-width: 600px; margin-bottom: 30px;">
        Neste teste, você verá animais aparecendo na tela.<br><br>
        <strong>${isTouchDevice ? 'Toque no botão RESPONDER' : 'Pressione a BARRA DE ESPAÇO'}</strong> apenas quando aparecer um <strong>LEÃO</strong> 🦁<br><br>
        Ignore todos os outros animais.<br><br>
        Seja rápido e preciso!
      </p>
    `;
    
    const botaoIniciar = document.createElement('button');
    botaoIniciar.textContent = 'Iniciar Teste';
    botaoIniciar.style.cssText = `
      padding: 15px 30px;
      font-size: 18px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 20px;
    `;
    
    telaInstrucoes.appendChild(titulo);
    telaInstrucoes.appendChild(instrucoes);
    telaInstrucoes.appendChild(botaoIniciar);
    
    document.body.appendChild(telaInstrucoes);
    
    botaoIniciar.addEventListener('click', () => {
      document.body.removeChild(telaInstrucoes);
      resolve();
    });
  });
}


// ===== FUNÇÃO PRINCIPAL QUE INICIA O TESTE =====
async function startTesteSeletiva() {
  if (typeof marcarBypassados === 'function') marcarBypassados();
  if (window.dispositivoBAE) window.dispositivoBAE.iniciarTeste('seletiva');
  console.log("Iniciando startTesteSeletiva");
  
  const birthDate = localStorage.getItem('dataNascimento');
  if (!birthDate) {
    alert("Por favor, preencha a data de nascimento.");
    return;
  }

  // Configuração por faixa etária
  CONFIG_SELETIVA = obterConfigSeletiva();
  testDuration = CONFIG_SELETIVA.duracaoSegundos;
  console.log(`🎂 Faixa: ${CONFIG_SELETIVA.faixa} (${CONFIG_SELETIVA.idadeAnos} anos)`);
  console.log(`⚙️ Duração: ${testDuration}s | Intervalo: ${CONFIG_SELETIVA.intervaloAnimal}ms`);

  // Correção 3: Reset de contadores
  resetarContadoresSeletiva();

  await mostrarInstrucoesSeletiva();
  
  const botaoIniciar = document.getElementById("startSeletiva");
  if (botaoIniciar) botaoIniciar.style.display = "none";
  
  document.addEventListener('keydown', checkResponse);
  
  isTestRunningSeletiva = true;
  mostrarBotoesControle();
  if (window.touchControls) window.touchControls.mostrarBotaoResponder();
  
  const quadro = document.getElementById("quadroSeletiva");
  
  // Criar elemento animal se não existir
  let img = document.getElementById('animal');
  if (!img) {
    img = document.createElement('img');
    img.id = 'animal';
    img.style.position = 'absolute';
    img.style.display = 'none';
    img.style.width = '76px';
    img.style.height = '76px';
    quadro.appendChild(img);
  }

  
  const contagemDiv = document.createElement('div');
  contagemDiv.style.cssText = 'display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 400px; font-size: 96px; font-weight: bold; color: #2c3e50;';
  
  const numeroDiv = document.createElement('div');
  numeroDiv.textContent = '5';
  
  const textoDiv = document.createElement('div');
  textoDiv.style.cssText = 'font-size: 28px; margin-top: 20px; color: #34495e;';
  textoDiv.textContent = 'Preparando teste seletiva...';
  
  contagemDiv.appendChild(numeroDiv);
  contagemDiv.appendChild(textoDiv);
  quadro.appendChild(contagemDiv);
  
  let countdown = 5;
  const countdownInterval = setInterval(() => {
    console.log(`⏰ Iniciando em ${countdown} segundos...`);
    numeroDiv.textContent = countdown;
    
    numeroDiv.style.transform = "scale(1.3)";
    numeroDiv.style.color = countdown === 5 ? '#e74c3c' : countdown === 4 ? '#e67e22' : countdown === 3 ? '#f39c12' : countdown === 2 ? '#f1c40f' : '#27ae60';
    setTimeout(() => {
      numeroDiv.style.transform = "scale(1)";
    }, 300);
    
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      console.log("🚀 TESTE INICIADO!");
      
      numeroDiv.textContent = "INICIAR! 🎯";
      numeroDiv.style.color = "#27ae60";
      numeroDiv.style.fontSize = "72px";
      textoDiv.textContent = "Cuidado com os leões!!... 🦁🦁🦁";
      
      setTimeout(() => {
        contagemDiv.remove();
        
        const fraseDiv = document.createElement('div');
        fraseDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; width: 100%; height: 400px; font-size: 64px; font-weight: bold; color: #f1c40f; text-shadow: 3px 3px 6px rgba(0,0,0,0.6); font-family: "Comic Sans MS", cursive, sans-serif; animation: pulse 1s infinite;';
        fraseDiv.innerHTML = '🦁 Olhe os leões! 🦁';
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
        
        quadro.appendChild(fraseDiv);
        
        setTimeout(() => {
          fraseDiv.remove();
          
          showNextAnimal();
          intervalId = setInterval(showNextAnimal, CONFIG_SELETIVA.intervaloAnimal);
        
          const timeoutMs = testDuration * 1000;
          const horaInicio = new Date();
          window._seletStartTime = performance.now();
          
          console.log(`🕰️ TESTE INICIADO! Vai durar ${testDuration} segundos`);
          
          window.timeoutPrincipal = setTimeout(() => {
            console.log(`🚨 TIMEOUT PRINCIPAL ATINGIDO!`);
            if (isTestRunningSeletiva) {
              endTesteSeletiva();
            }
          }, timeoutMs);
          
          window.timeoutBackup = setTimeout(() => {
            console.log(`🚨 TIMEOUT BACKUP ATIVADO!`);
            if (isTestRunningSeletiva) {
              endTesteSeletiva();
            }
          }, timeoutMs + 500);
          
          window.monitorInterval = setInterval(() => {
            if (!isTestRunningSeletiva) {
              clearInterval(window.monitorInterval);
              return;
            }
            const tempoDecorrido = (Date.now() - horaInicio.getTime()) / 1000;
            if (tempoDecorrido >= testDuration) {
              endTesteSeletiva();
            }
          }, 10000);
          
        }, 1000);
      }, 1000);
    }
  }, 1000);
}

function showNextAnimal(forceCall = false) {
  if (!isTestRunningSeletiva) {
    console.log("showNextAnimal: Teste não está rodando, saindo...");
    return;
  }
  
  currentAnimal = animais[Math.floor(Math.random() * animais.length)];
  
  if (currentAnimal === "leao") totalLeoes++;
  
  const img = document.getElementById("animal");
  if (!img) {
    console.error("Elemento 'animal' não encontrado");
    return;
  }
  
  img.src = `figuras/${currentAnimal}.png`;
  img.style.display = "block";
  
  // Usa tamanho real do quadro na tela
  var quadroEl = document.getElementById('quadroSeletiva');
  var quadroWidth = quadroEl ? quadroEl.clientWidth : 20 * 37.8;
  var quadroHeight = quadroEl ? quadroEl.clientHeight : 15 * 37.8;
  const margem = 10;
  const imgWidth = 76;
  const imgHeight = 76;
  
  const areaUtilWidth = quadroWidth - (2 * margem) - imgWidth;
  const areaUtilHeight = quadroHeight - (2 * margem) - imgHeight;
  
  const posX = margem + (Math.random() * areaUtilWidth);
  const posY = margem + (Math.random() * areaUtilHeight);
  
  img.style.left = `${posX}px`;
  img.style.top = `${posY}px`;
  
  // Determina sextante (quadro real, 3 colunas x 2 linhas)
  const terco = quadroWidth / 3;
  const metade = quadroHeight / 2;
  let col = posX < terco ? 0 : posX < terco * 2 ? 1 : 2;
  let lin = posY < metade ? 0 : 1;
  const sextantes = [['S1','S2','S3'],['S4','S5','S6']];
  quadranteAtualSeletiva = sextantes[lin][col];
  
  if (currentAnimal === "leao") quadrantesSeletiva[quadranteAtualSeletiva]++;
  
  startTimeSeletiva = performance.now();
  
  // Detecta omissão: se o animal anterior era leão e não houve resposta dentro do tempo de exposição
  if (!firstCall && previousAnimal === "leao" && !respondeuAnimalAnterior) {
    omissoesSeletiva++;
    console.log(`⏰ OMISSÃO: Leão não respondido no tempo de exposição (${CONFIG_SELETIVA.intervaloAnimal}ms). Total: ${omissoesSeletiva}`);
  }
  
  previousAnimal = currentAnimal;
  firstCall = false;
  respondeuAnimalAnterior = false;
}

function checkResponse(event) {
  if (!isTestRunningSeletiva || event.key !== " ") return;
  
  event.preventDefault();
  
  const reactionTime = performance.now() - startTimeSeletiva;
  var modo = window._ultimaEntradaTouch ? 'touch' : 'teclado';
  window._ultimaEntradaTouch = false;
  if (window.dispositivoBAE) window.dispositivoBAE.registrar(modo, reactionTime);
  respondeuAnimalAnterior = true;
  
  if (currentAnimal === "leao") {
    acertosSeletiva++;
    temposReacaoSeletiva.push(reactionTime);
    acertosPorQuadranteSeletiva[quadranteAtualSeletiva]++;
    console.log(`✅ ACERTO: Leão respondido (${quadranteAtualSeletiva})! Acertos: ${acertosSeletiva}`);
  } else {
    errosSeletiva++;
    console.log(`❌ ERRO: Respondeu a ${currentAnimal} (não era leão). Erros: ${errosSeletiva}`);
  }
  
  const animalImg = document.getElementById("animal");
  if (animalImg) {
    animalImg.style.display = "none";
  }
}

function endTesteSeletiva(abandonado = false) {
  if (window.touchControls) window.touchControls.limpar();
  console.log(`🎯 ENDTEST SELETIVA CHAMADO!`);
  
  if (testeJaFinalizado) {
    console.log(`⚠️ SELETIVA: endTest já foi chamado, ignorando...`);
    return;
  }
  testeJaFinalizado = true;
  
  isTestRunningSeletiva = false;
  
  // Remove listener de teclado
  document.removeEventListener('keydown', checkResponse);
  
  // Esconde botões de controle
  esconderBotoesControle();
  
  // Esconde botão parar
  const botaoParar = document.getElementById("pararSeletiva");
  if (botaoParar) {
    botaoParar.style.display = "none";
  }
  clearInterval(intervalId);
  
  if (typeof finalizarMonitoramentoTempo === 'function') {
    finalizarMonitoramentoTempo();
  }
  
  if (window.timeoutPrincipal) {
    clearTimeout(window.timeoutPrincipal);
    console.log(`🚨 Timeout principal limpo`);
  }
  if (window.timeoutBackup) {
    clearTimeout(window.timeoutBackup);
  }
  if (window.monitorInterval) {
    clearInterval(window.monitorInterval);
  }
  
  const animalImg = document.getElementById("animal");
  if (animalImg) {
    animalImg.style.display = "none";
  }
  
  // Verifica omissão do último animal antes de encerrar
  if (previousAnimal === "leao" && !respondeuAnimalAnterior) {
    omissoesSeletiva++;
    console.log(`⏰ OMISSÃO FINAL: Último leão não respondido. Total: ${omissoesSeletiva}`);
  }
  
  // Validação: omissões não pode ser maior que totalLeoes - acertos
  const omissoesCalculadas = totalLeoes - acertosSeletiva;
  if (omissoesSeletiva !== omissoesCalculadas) {
    console.log(`⚠️ Ajuste omissões: contadas=${omissoesSeletiva} calculadas=${omissoesCalculadas}`);
    omissoesSeletiva = omissoesCalculadas;
  }
  
  const avgReactionTime = temposReacaoSeletiva.length
    ? temposReacaoSeletiva.reduce((a, b) => a + b, 0) / temposReacaoSeletiva.length
    : 0;
  
  gerarAnaliseCognitivaSeletiva();
  
  const taxaAcerto = totalLeoes > 0 ? (acertosSeletiva / totalLeoes) * 100 : 0;
  const duracaoReal = window._seletStartTime ? Math.round((performance.now() - window._seletStartTime) / 1000) : testDuration;
  const resultadosSeletiva = {
    acertos: acertosSeletiva,
    erros: errosSeletiva,
    omissoes: omissoesSeletiva,
    totalLeoes: totalLeoes,
    taxaAcerto: taxaAcerto,
    tempoMedio: avgReactionTime,
    temposReacao: [...temposReacaoSeletiva],
    duracaoTeste: duracaoReal,
    quadrantesLeoes: {...quadrantesSeletiva},
    acertosPorQuadrante: {...acertosPorQuadranteSeletiva},
    faixaEtaria: CONFIG_SELETIVA ? CONFIG_SELETIVA.faixa : 'adulto',
    intervaloAnimal: CONFIG_SELETIVA ? CONFIG_SELETIVA.intervaloAnimal : 1000,
    abandonado: abandonado,
    statusTeste: abandonado ? 'ABANDONADO' : 'CONCLUÍDO',
    dispositivo: window.dispositivoBAE ? window.dispositivoBAE.obterInfoDispositivo() : null,
    modoEntrada: window.dispositivoBAE ? window.dispositivoBAE.obterResumo('seletiva') : null
  };
  
  if (typeof salvarResultadoTeste === 'function') {
    salvarResultadoTeste('seletiva', resultadosSeletiva);
  }
  
  mostrarTelaParabens();
  
  setTimeout(() => {
    criarBotaoProximoTeste('testeSeletiva', 'testeDividida');
  }, 4000);
}

function gerarAnaliseCognitivaSeletiva() {
  const taxaAcerto = totalLeoes > 0 ? (acertosSeletiva / totalLeoes) * 100 : 0;
  const totalRespostas = acertosSeletiva + errosSeletiva;
  const taxaErro = totalRespostas > 0 ? (errosSeletiva / totalRespostas) * 100 : 0;
  const taxaOmissao = totalLeoes > 0 ? (omissoesSeletiva / totalLeoes) * 100 : 0;
  const avgReactionTime = temposReacaoSeletiva.length ? 
    temposReacaoSeletiva.reduce((a, b) => a + b, 0) / temposReacaoSeletiva.length : 0;
  const faixa = CONFIG_SELETIVA ? CONFIG_SELETIVA.faixa : 'adulto';
  const limRT = CONFIG_SELETIVA || { limiarRTRapido: 400, limiarRTNormal: 600, limiarRTLento: 800 };

  console.log(`\n🧠 ANÁLISE NEUROPSICOLÓGICA - ATENÇÃO SELETIVA`);
  console.log(`🎂 Faixa: ${faixa} | Duração: ${testDuration}s`);
  
  console.log(`\n📊 VIGILÂNCIA SUSTENTADA:`);
  if (taxaAcerto >= 85) {
    console.log(`✅ EXCELENTE (${taxaAcerto.toFixed(1)}%) - Vigilância preservada (Sarter et al., 2001)`);
  } else if (taxaAcerto >= 70) {
    console.log(`✅ ADEQUADA (${taxaAcerto.toFixed(1)}%) - Dentro dos padrões normativos`);
  } else if (taxaAcerto >= 50) {
    console.log(`⚠️ LIMÍTROFE (${taxaAcerto.toFixed(1)}%) - Possível déficit atencional leve`);
  } else {
    console.log(`❌ DEFICITÁRIA (${taxaAcerto.toFixed(1)}%) - Déficit de vigilância (Riccio et al., 2002)`);
  }
  
  console.log(`\n⚡ VELOCIDADE DE PROCESSAMENTO:`);
  if (avgReactionTime < limRT.limiarRTRapido) {
    console.log(`🚀 RÁPIDA (${avgReactionTime.toFixed(0)}ms) - Processamento superior para faixa ${faixa}`);
  } else if (avgReactionTime < limRT.limiarRTNormal) {
    console.log(`✅ NORMAL (${avgReactionTime.toFixed(0)}ms) - Dentro da normalidade para faixa ${faixa}`);
  } else if (avgReactionTime < limRT.limiarRTLento) {
    console.log(`⚠️ LENTA (${avgReactionTime.toFixed(0)}ms) - Processamento reduzido para faixa ${faixa}`);
  } else {
    console.log(`❌ MUITO LENTA (${avgReactionTime.toFixed(0)}ms) - Lentificação significativa para faixa ${faixa}`);
  }
  
  console.log(`\n🛑 CONTROLE INIBITÓRIO:`);
  if (taxaErro < 5) {
    console.log(`✅ EXCELENTE (${taxaErro.toFixed(1)}%) - Controle inibitório preservado`);
  } else if (taxaErro < 15) {
    console.log(`✅ ADEQUADO (${taxaErro.toFixed(1)}%) - Dentro dos padrões normativos`);
  } else if (taxaErro < 25) {
    console.log(`⚠️ LIMÍTROFE (${taxaErro.toFixed(1)}%) - Possível impulsividade (Barkley, 1997)`);
  } else {
    console.log(`❌ DEFICITÁRIO (${taxaErro.toFixed(1)}%) - Impulsividade significativa`);
  }
  
  if (temposReacaoSeletiva.length > 5) {
    const desvioPadrao = calcularDesvioPadraoSeletiva(temposReacaoSeletiva);
    const coeficienteVariacao = avgReactionTime > 0 ? (desvioPadrao / avgReactionTime) * 100 : 0;
    console.log(`\n📈 CONSISTÊNCIA ATENCIONAL:`);
    if (coeficienteVariacao < 15) {
      console.log(`✅ ALTA (CV: ${coeficienteVariacao.toFixed(1)}%) - Desempenho estável`);
    } else if (coeficienteVariacao < 25) {
      console.log(`✅ MODERADA (CV: ${coeficienteVariacao.toFixed(1)}%) - Flutuações dentro do esperado`);
    } else {
      console.log(`⚠️ BAIXA (CV: ${coeficienteVariacao.toFixed(1)}%) - Possível fadiga (Castellanos et al., 2005)`);
    }
  }
  
  console.log(`\n🏥 INDICADORES CLÍNICOS:`);
  
  // Análise por quadrante
  console.log(`\n📍 DISTRIBUIÇÃO POR SEXTANTE:`);
  console.log(`   Leões:   S1=${quadrantesSeletiva.S1} S2=${quadrantesSeletiva.S2} S3=${quadrantesSeletiva.S3} | S4=${quadrantesSeletiva.S4} S5=${quadrantesSeletiva.S5} S6=${quadrantesSeletiva.S6}`);
  console.log(`   Acertos: S1=${acertosPorQuadranteSeletiva.S1} S2=${acertosPorQuadranteSeletiva.S2} S3=${acertosPorQuadranteSeletiva.S3} | S4=${acertosPorQuadranteSeletiva.S4} S5=${acertosPorQuadranteSeletiva.S5} S6=${acertosPorQuadranteSeletiva.S6}`);
  
  // Detecta negligência espacial
  const sextantes = ['S1','S2','S3','S4','S5','S6'];
  const taxasSextante = sextantes.map(s => quadrantesSeletiva[s] > 0 ? (acertosPorQuadranteSeletiva[s] / quadrantesSeletiva[s]) * 100 : -1).filter(t => t >= 0);
  if (taxasSextante.length >= 2) {
    const maxS = Math.max(...taxasSextante);
    const minS = Math.min(...taxasSextante);
    if (maxS - minS > 30) {
      console.log(`   ⚠️ Assimetria espacial detectada (diferença ${(maxS-minS).toFixed(0)}%) - investigar negligência`);
    } else {
      console.log(`   ✅ Distribuição espacial equilibrada`);
    }
  }

  if (taxaOmissao > 20 && taxaErro < 10) {
    console.log(`📋 Perfil compatível com TDAH Desatento (APA, 2013)`);
  } else if (taxaErro > 20 && taxaOmissao < 15) {
    console.log(`📋 Perfil compatível com TDAH Hiperativo-Impulsivo`);
  } else if (taxaOmissao > 15 && taxaErro > 15) {
    console.log(`📋 Perfil compatível com TDAH Combinado`);
  } else if (avgReactionTime > limRT.limiarRTLento && taxaAcerto < 70) {
    console.log(`📋 Possível fadiga cognitiva ou déficit de processamento`);
  } else {
    console.log(`📋 Perfil atencional dentro da normalidade para faixa ${faixa}`);
  }
}

function calcularDesvioPadraoSeletiva(array) {
  if (array.length === 0) return 0;
  const media = array.reduce((a, b) => a + b, 0) / array.length;
  const variancia = array.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / array.length;
  return Math.sqrt(variancia);
}

function mostrarTelaParabens() {
  console.log("Exibindo tela de parabéns...");

  const telaParabens = document.getElementById('telaParabens') || document.createElement('div');
  telaParabens.id = 'telaParabens';
  telaParabens.innerHTML = `
    <div class="parabens-emoji">🎉</div>
    <h2>Parabéns!</h2>
    <p>Você completou o teste!</p>
    <p class="proximo-desafio">Agora vamos para o próximo desafio!</p>
    <div class="desafio-emoji">🎯 ➡️ 🤹</div>
  `;
  
  // Anexa a #quadroSeletiva
  document.getElementById('quadroSeletiva').appendChild(telaParabens);
  
  // Exibe com transição
  telaParabens.style.display = 'flex';
  setTimeout(() => {
    telaParabens.style.transition = 'opacity 0.5s ease';
    telaParabens.style.opacity = '1';
  }, 100);
  
  // Remove após 4 segundos
  setTimeout(() => {
        const quadroSeletivaEl = document.getElementById('quadroSeletiva');
        if (quadroSeletivaEl && quadroSeletivaEl.contains(telaParabens)) {
            quadroSeletivaEl.removeChild(telaParabens);
        }
       
        mostrarBotoesNavegacao();
        
    }, 4000);
}
// Função para parar teste seletiva
function pararTesteSeletiva() {
    if (!isTestRunningSeletiva) return;
    
    console.log("🛑 TESTE SELETIVA PARADO PELO USUÁRIO");
    endTesteSeletiva(true);
}


window.startTesteSeletiva = startTesteSeletiva;
