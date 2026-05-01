// ===== TESTE ATENÇÃO ALTERNADA - VERSÃO COMPARTIMENTADA =====
// Sistema neuropsicológico para pacientes com TDAH
// Variáveis em: variaveis-alternada.js
// Funções em: atencao-alternada.js

// ===== CONFIGURAÇÃO DINÂMICA POR IDADE =====
// Linha 6-40: Função de configuração baseada na idade
function obterConfigTeste() {
  var birthDate = localStorage.getItem('dataNascimento');
  var anos = 25;
  if (birthDate) {
    var age = calcularIdade(birthDate);
    if (age) anos = age.years;
  }

  if (anos >= 6 && anos < 13) {
    return {
      faixa: 'crianca', idadeAnos: anos,
      totalPares: 270, intervalo: 1000, contagemRegressiva: 5,
      limiarRTRapido: 500, limiarRTNormal: 750, limiarRTLento: 1000
    };
  } else if (anos >= 60) {
    return {
      faixa: 'idoso', idadeAnos: anos,
      totalPares: 270, intervalo: 1200, contagemRegressiva: 5,
      limiarRTRapido: 500, limiarRTNormal: 700, limiarRTLento: 950
    };
  } else {
    return {
      faixa: 'adulto', idadeAnos: anos,
      totalPares: 300, intervalo: 1000, contagemRegressiva: 5,
      limiarRTRapido: 400, limiarRTNormal: 600, limiarRTLento: 800
    };
  }
}

// ===== FUNÇÃO PRINCIPAL - INICIA O TESTE =====
// Linha 42-75: Função principal de inicialização do teste
function iniciarTesteAlternado() {
  if (typeof marcarBypassados === 'function') marcarBypassados();
  try {
    // Esconde botão iniciar
    const botaoIniciar = document.getElementById('iniciarAlternado');
    if (botaoIniciar) botaoIniciar.style.display = 'none';
    
    // Esconde instruções para dar espaço ao quadro
    const instrucoes = document.querySelector('#paginaTesteAlternado .instrucoes');
    if (instrucoes) instrucoes.style.display = 'none';
    
    // Obtém configuração baseada na idade
    configTeste = obterConfigTeste();
    console.log(`🎂 Faixa: ${configTeste.faixa} (${configTeste.idadeAnos} anos)`);
    console.log(`⏱️ TESTE INICIADO: ${configTeste.totalPares} pares | Intervalo: ${configTeste.intervalo}ms`);
    
    // Inicializa todas as variáveis
    resetTeste();
    
    // Gera sequência com garantias neuropsicológicas
    gerarSequenciaLimpa();
    
    // Mostra instruções antes de iniciar
    mostrarInstrucoesAlternada(() => {
      // Inicia contagem regressiva motivacional para TDAH
      iniciarContagemRegressiva(() => {
        executarTeste();
      });
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// ===== RESET COMPLETO DO TESTE =====
// Linha 77-95: Função de reset de todas as variáveis
function resetTeste() {
  testeAtivoAlternada = false;
  sequenciaTeste = [];
  parAtual = 0;
  
  acertosCor = 0;
  acertosForma = 0;
  omissoesCor = 0;
  omissoesForma = 0;
  
  totalAcertos = 0;
  acertosAmbivalentes = 0;
  totalErros = 0;
  totalOmissoes = 0;
  temposReacaoAlternada = [];
  respostasRapidas = 0;
  
  figuraAtual = { forma1: '', forma2: '', cor1: '', cor2: '' };
  figuraAnterior = { forma1: '', forma2: '', cor1: '', cor2: '' };
  
  aguardandoResposta = false;
  tempoInicioResposta = 0;
}

// ===== GERAÇÃO DE SEQUÊNCIA VERDADEIRAMENTE ALEATÓRIA =====
function gerarSequenciaLimpa() {
  // CONTROLE RIGOROSO BASEADO NA IDADE
  const totalAlvos = Math.floor(configTeste.totalPares * 0.20); // 20% do total
  const alvosAmbivalentes = Math.floor(totalAlvos * 0.10); // 2% do total (10% dos alvos)
  const alvosRestantes = totalAlvos - alvosAmbivalentes;
  const alvosCor = Math.floor(alvosRestantes / 2);
  const alvosForma = alvosRestantes - alvosCor;
  
  console.log(`🎯 DISTRIBUIÇÃO ALEATÓRIA:`);
  console.log(`🎯 Total pares: ${configTeste.totalPares}`);
  console.log(`🎯 Alvos COR: ${alvosCor}`);
  console.log(`🎯 Alvos FORMA: ${alvosForma}`);
  console.log(`🎯 Ambivalentes: ${alvosAmbivalentes}`);
  console.log(`🎯 Total alvos: ${totalAlvos} (${(totalAlvos/configTeste.totalPares*100).toFixed(1)}%)`);
  
  // Cria array com todas as posições possíveis (exceto primeira)
  let posicoesDisponiveis = [];
  for (let i = 1; i < configTeste.totalPares; i++) {
    posicoesDisponiveis.push(i);
  }
  
  // Embaralha posições usando Fisher-Yates
  for (let i = posicoesDisponiveis.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posicoesDisponiveis[i], posicoesDisponiveis[j]] = [posicoesDisponiveis[j], posicoesDisponiveis[i]];
  }
  
  // Inicializa sequência com distratores
  sequenciaTeste = new Array(configTeste.totalPares).fill('none');
  
  // Distribui alvos nas primeiras posições embaralhadas
  let posIndex = 0;
  
  // Distribui alvos de COR
  for (let i = 0; i < alvosCor; i++) {
    sequenciaTeste[posicoesDisponiveis[posIndex]] = 'cor';
    posIndex++;
  }
  
  // Distribui alvos de FORMA
  for (let i = 0; i < alvosForma; i++) {
    sequenciaTeste[posicoesDisponiveis[posIndex]] = 'forma';
    posIndex++;
  }
  
  // Distribui alvos AMBIVALENTES
  for (let i = 0; i < alvosAmbivalentes; i++) {
    sequenciaTeste[posicoesDisponiveis[posIndex]] = 'ambivalente';
    posIndex++;
  }
  
  // Salva configuração
  configTeste.alvosCor = alvosCor;
  configTeste.alvosForma = alvosForma;
  configTeste.alvosAmbivalentes = alvosAmbivalentes;
  
  console.log(`🎯 DISTRIBUIÇÃO CONCLUÍDA: ${totalAlvos} alvos espalhados aleatoriamente`);
}

// ===== INSTRUÇÕES DO TESTE =====
function mostrarInstrucoesAlternada(callback) {
  const quadro = document.getElementById('quadroAlternado');
  if (!quadro) {
    callback();
    return;
  }
  
  quadro.innerHTML = `
    <div style="
      color: white;
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: rgba(0,0,0,0.8);
      border-radius: 10px;
      margin: 20px;
    ">
      <h2 style="color: #FFD700; margin-bottom: 20px;">ATENÇÃO ALTERNADA</h2>
      <p style="font-size: 18px; margin-bottom: 15px;">
        Você verá <strong>DUAS FIGURAS</strong> lado a lado.
      </p>
      <p style="font-size: 18px; margin-bottom: 15px;">
        Pressione <strong>ESPAÇO</strong> quando as figuras tiverem:
      </p>
      <div style="font-size: 16px; margin: 20px 0;">
        • <strong>MESMA COR</strong> (ambas vermelhas, ambas azuis, etc.)<br>
        • <strong>MESMA FORMA</strong> (ambos quadrados, ambos círculos, etc.)
      </div>
      <p style="font-size: 16px; color: #FFD700;">
        <strong>NÃO</strong> pressione se forem diferentes!
      </p>
      <button onclick="this.parentElement.parentElement.remove(); arguments[0]()" 
              style="
                margin-top: 20px;
                padding: 10px 20px;
                font-size: 18px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
              ">ENTENDI - INICIAR</button>
    </div>
  `;
  
  // Configura o botão para chamar o callback
  const botao = quadro.querySelector('button');
  botao.onclick = () => {
    quadro.innerHTML = '';
    callback();
  };
}

// ===== CONTAGEM REGRESSIVA MOTIVACIONAL =====
function iniciarContagemRegressiva(callback) {
  let contador = configTeste.contagemRegressiva;
  const quadro = document.getElementById('quadroAlternado');
  if (!quadro) {
    callback();
    return;
  }
  
  function atualizarDisplay(numero) {
    quadro.innerHTML = `<div style="font-size: 72px; font-weight: bold; color: white; text-align: center; line-height: 5cm; transition: transform 0.2s ease;">${numero}</div>`;
  }
  
  atualizarDisplay(contador);
  contador--;
  
  const interval = setInterval(() => {
    if (contador >= 0) {
      if (contador > 0) {
        atualizarDisplay(contador);
      } else {
        quadro.innerHTML = `<div style="font-size: 60px; font-weight: bold; color: #27ae60; text-align: center; line-height: 5cm; transition: all 0.3s ease;">INICIAR!</div>`;
      }
      contador--;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        callback();
      }, 500);
    }
  }, 1000);
}

// ===== EXECUÇÃO PRINCIPAL DO TESTE =====
function executarTeste() {
  const tempoInicioTeste = performance.now();
  console.log(`⏱️ EXECUÇÃO INICIADA`);
  
  testeAtivoAlternada = true;
  parAtual = 0;
  
  // Remove listeners anteriores para evitar duplicação
  document.removeEventListener('keydown', processarTecla, true);
  window.removeEventListener('keydown', processarTecla, true);
  
  // Remove listener do sustentada se existir
  if (typeof processarResposta === 'function') {
    document.removeEventListener('keydown', processarResposta, true);
    document.removeEventListener('keydown', processarResposta, false);
  }
  
  // Adiciona listener único no document com capture
  document.addEventListener('keydown', processarTecla, { capture: true, passive: false });
  
  // Garante foco para captura de teclas
  document.body.focus();
  document.body.tabIndex = -1;
  
  gerarParReferencia();
  exibirPar();
  parAtual = 1;
  
  const interval = setInterval(() => {
    if (!testeAtivoAlternada || parAtual >= configTeste.totalPares) {
      const tempoFinal = performance.now() - tempoInicioTeste;
      console.log(`⏱️ TESTE FINALIZADO: ${(tempoFinal/1000).toFixed(1)}s`);
      clearInterval(interval);
      finalizarTesteAlternada();
      return;
    }
    
    if (parAtual > 1) verificarOmissao();
    
    figuraAnterior = { ...figuraAtual };
    
    const tipoAlvo = sequenciaTeste[parAtual];
    if (tipoAlvo !== 'none') {
      gerarParAlvo(tipoAlvo);
    } else {
      gerarParNaoAlvo();
    }
    
    exibirPar();
    
    aguardandoResposta = true;
    tempoInicioResposta = performance.now();
    
    parAtual++;
    
  }, configTeste.intervalo);
  
  setTimeout(() => {
    if (testeAtivoAlternada) testeAtivoAlternada = false;
  }, configTeste.totalPares * configTeste.intervalo + 2000);
}

// ===== GERAÇÃO DO PAR DE REFERÊNCIA (PRIMEIRO PAR) =====
function gerarParReferencia() {
  const formas = ['quadrado', 'circulo', 'triangulo', 'estrela'];
  const cores = ['black', 'gray', 'white', 'yellow'];
  
  figuraAtual.forma1 = formas[Math.floor(Math.random() * formas.length)];
  figuraAtual.forma2 = formas[Math.floor(Math.random() * formas.length)];
  figuraAtual.cor1 = cores[Math.floor(Math.random() * cores.length)];
  figuraAtual.cor2 = cores[Math.floor(Math.random() * cores.length)];
}

// ===== GERAÇÃO DE PAR ALVO (COR, FORMA OU AMBIVALENTE) =====
function gerarParAlvo(tipo) {
  const formas = ['quadrado', 'circulo', 'triangulo', 'estrela'];
  const cores = ['black', 'gray', 'white', 'yellow'];
  
  if (tipo === 'forma') {
    // ALVO DE FORMA: mesma forma, cores diferentes
    const formaEscolhida = formas[Math.floor(Math.random() * formas.length)];
    figuraAtual.forma1 = formaEscolhida;
    figuraAtual.forma2 = formaEscolhida;
    
    // Garante cores diferentes
    figuraAtual.cor1 = cores[Math.floor(Math.random() * cores.length)];
    do {
      figuraAtual.cor2 = cores[Math.floor(Math.random() * cores.length)];
    } while (figuraAtual.cor1 === figuraAtual.cor2);
    
  } else if (tipo === 'cor') {
    // ALVO DE COR: mesma cor, formas diferentes
    const corEscolhida = cores[Math.floor(Math.random() * cores.length)];
    figuraAtual.cor1 = corEscolhida;
    figuraAtual.cor2 = corEscolhida;
    
    // Garante formas diferentes
    figuraAtual.forma1 = formas[Math.floor(Math.random() * formas.length)];
    do {
      figuraAtual.forma2 = formas[Math.floor(Math.random() * formas.length)];
    } while (figuraAtual.forma1 === figuraAtual.forma2);
    
  } else if (tipo === 'ambivalente') {
    // AMBIVALENTE: mesma forma E mesma cor
    const formaEscolhida = formas[Math.floor(Math.random() * formas.length)];
    const corEscolhida = cores[Math.floor(Math.random() * cores.length)];
    
    figuraAtual.forma1 = formaEscolhida;
    figuraAtual.forma2 = formaEscolhida;
    figuraAtual.cor1 = corEscolhida;
    figuraAtual.cor2 = corEscolhida;
  }
}

// ===== GERAÇÃO DE PAR NÃO-ALVO (DISTRATOR) =====
function gerarParNaoAlvo() {
  const formas = ['quadrado', 'circulo', 'triangulo', 'estrela'];
  const cores = ['black', 'gray', 'white', 'yellow'];
  
  let tentativas = 0;
  
  do {
    figuraAtual.forma1 = formas[Math.floor(Math.random() * formas.length)];
    figuraAtual.forma2 = formas[Math.floor(Math.random() * formas.length)];
    figuraAtual.cor1 = cores[Math.floor(Math.random() * cores.length)];
    figuraAtual.cor2 = cores[Math.floor(Math.random() * cores.length)];
    tentativas++;
    
    // Garante que NÃO seja alvo (formas e cores diferentes)
    const mesmaForma = figuraAtual.forma1 === figuraAtual.forma2;
    const mesmaCor = figuraAtual.cor1 === figuraAtual.cor2;
    
    if (!mesmaForma && !mesmaCor) break;
    
    if (tentativas >= 50) {
      // Força formas e cores diferentes
      figuraAtual.forma1 = formas[0];
      figuraAtual.forma2 = formas[1];
      figuraAtual.cor1 = cores[0];
      figuraAtual.cor2 = cores[1];
      break;
    }
    
  } while (tentativas < 50);
}

// ===== CONTROLE DE TECLADO =====
function processarTecla(event) {
  if (!testeAtivoAlternada || !aguardandoResposta) return;
  
  if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
    event.preventDefault();
    event.stopImmediatePropagation();
    
    aguardandoResposta = false; // Bloqueia imediatamente
    
    const agora = performance.now();
    const tempoReacao = agora - tempoInicioResposta;
    processarResposta(tempoReacao);
  }
}

// ===== PROCESSAMENTO DA RESPOSTA DO USUÁRIO =====
function processarResposta(tempoReacao) {
  // LÓGICA CORRETA: Compara as 2 figuras do PAR ATUAL
  const mesmaForma = figuraAtual.forma1 === figuraAtual.forma2;
  const mesmaCor = figuraAtual.cor1 === figuraAtual.cor2;
  
  // DETECÇÃO DE ALVOS
  const temAlvoForma = mesmaForma;     // As 2 figuras têm a mesma FORMA
  const temAlvoCor = mesmaCor;         // As 2 figuras têm a mesma COR
  const temAlvoAmbivalente = temAlvoForma && temAlvoCor;  // Mesma FORMA E COR
  const temAlgumAlvo = temAlvoForma || temAlvoCor;        // Qualquer coincidência
  
  // DEBUG: Mostra o par atual
  console.log(`[${parAtual}] Par: ${figuraAtual.forma1}-${figuraAtual.cor1} + ${figuraAtual.forma2}-${figuraAtual.cor2}`);
  console.log(`[${parAtual}] Alvo: Forma=${temAlvoForma}, Cor=${temAlvoCor}, Total=${temAlgumAlvo}`);
  
  if (temAlgumAlvo) {
    temposReacaoAlternada.push(tempoReacao);
    
    // Conta respostas rápidas
    if (tempoReacao < 200) {
      respostasRapidas++;
    }
    
    if (temAlvoAmbivalente) {
      totalAcertos++;
      acertosAmbivalentes++;
      console.log(`[${parAtual}/${configTeste.totalPares}] ✅ ACERTO`);
    } else if (temAlvoCor) {
      totalAcertos++;
      acertosCor++;
      console.log(`[${parAtual}/${configTeste.totalPares}] ✅ ACERTO`);
    } else if (temAlvoForma) {
      totalAcertos++;
      acertosForma++;
      console.log(`[${parAtual}/${configTeste.totalPares}] ✅ ACERTO`);
    }
    
  } else {
    // ERRO POR IMPULSIVIDADE (apertou sem alvo)
    totalErros++;
    console.log(`[${parAtual}/${configTeste.totalPares}] ❌ ERRO`);
  }
}

// ===== VERIFICAÇÃO DE OMISSÃO =====
function verificarOmissao() {
  const tipoAnterior = sequenciaTeste[parAtual - 1];
  
  if (tipoAnterior !== 'none' && aguardandoResposta) {
    totalOmissoes++;
    
    if (tipoAnterior === 'cor') {
      omissoesCor++;
      console.log(`[${parAtual}/${configTeste.totalPares}] ⚠️ OMISSÃO`);
    } else if (tipoAnterior === 'forma') {
      omissoesForma++;
      console.log(`[${parAtual}/${configTeste.totalPares}] ⚠️ OMISSÃO`);
    } else if (tipoAnterior === 'ambivalente') {
      // Ambivalente omitido conta como omissão geral
      console.log(`[${parAtual}/${configTeste.totalPares}] ⚠️ OMISSÃO`);
    }
    
    aguardandoResposta = false;
  }
}

// ===== EXIBIÇÃO DO PAR NA TELA =====
function exibirPar() {
  const quadro = document.getElementById('quadroAlternado');
  
  quadro.style.transition = 'opacity 0.2s ease-in-out';
  quadro.style.opacity = '0';
  
  setTimeout(() => {
    quadro.innerHTML = `
      <div id="figuraEsquerda" style="flex: 1; display: flex; justify-content: center; align-items: center; animation: fadeIn 0.3s ease-out;">
        ${criarFiguraSVG(figuraAtual.forma1, figuraAtual.cor1)}
      </div>
      <div id="figuraDireita" style="flex: 1; display: flex; justify-content: center; align-items: center; animation: fadeIn 0.3s ease-out;">
        ${criarFiguraSVG(figuraAtual.forma2, figuraAtual.cor2)}
      </div>
    `;
    quadro.style.opacity = '1';
  }, 100);
}

// ===== CRIAÇÃO DE FIGURAS SVG REFINADAS =====
function criarFiguraSVG(forma, cor) {
  const tamanho = 110;  // Tamanho aumentado para melhor impacto visual
  let path = '';        // Caminho SVG da forma
  let gradientId = `gradient-${forma}-${cor}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Paleta otimizada para daltonismo
  const coresVibrantes = {
    'black': '#000000',
    'gray': '#808080', 
    'white': '#FFFFFF',
    'yellow': '#FFD700'
  };
  
  const corVibrant = coresVibrantes[cor] || cor;
  
  // Define caminho SVG baseado na forma (otimizado)
  switch(forma) {
    case 'estrela':
      path = 'M40,8 L45,25 L63,25 L49,36 L54,53 L40,42 L26,53 L31,36 L17,25 L35,25 Z';
      break;
    case 'quadrado':
      path = 'M18,18 L62,18 L62,62 L18,62 Z';
      break;
    case 'triangulo':
      path = 'M40,12 L68,60 L12,60 Z';
      break;
    case 'circulo':
      path = 'M40,40 m-28,0 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0';
      break;
    default:
      path = 'M18,18 L62,18 L62,62 L18,62 Z';
  }
  
  // SVG com gradiente, sombra e animação
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 80 80" style="filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.3)); transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${corVibrant};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${corVibrant};stop-opacity:0.7" />
      </linearGradient>
    </defs>
    <path d="${path}" fill="url(#${gradientId})" stroke="#2c3e50" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`;
}

// ===== FINALIZAÇÃO DO TESTE =====
function finalizarTesteAlternada() {
  testeAtivoAlternada = false;
  document.removeEventListener('keydown', processarTecla, { capture: true });
  document.removeEventListener('keydown', processarTecla, true);
  window.removeEventListener('keydown', processarTecla, true);
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TESTE FINALIZADO');
  console.log('='.repeat(50));
  
  // Verificação final de omissões não contadas
  // Percorre toda a sequência e conta alvos que não foram acertados
  var alvosCorGerados = 0, alvosFormaGerados = 0, alvosAmbGerados = 0;
  for (var i = 0; i < sequenciaTeste.length; i++) {
    if (sequenciaTeste[i] === 'cor') alvosCorGerados++;
    else if (sequenciaTeste[i] === 'forma') alvosFormaGerados++;
    else if (sequenciaTeste[i] === 'ambivalente') alvosAmbGerados++;
  }
  var omissoesCorReal = alvosCorGerados - acertosCor;
  var omissoesFormaReal = alvosFormaGerados - acertosForma;
  var omissoesAmbReal = alvosAmbGerados - acertosAmbivalentes;
  var totalOmissoesReal = omissoesCorReal + omissoesFormaReal + omissoesAmbReal;
  
  if (totalOmissoesReal !== totalOmissoes) {
    console.log(`⚠️ Ajuste omissões: contadas=${totalOmissoes} reais=${totalOmissoesReal}`);
    omissoesCor = omissoesCorReal;
    omissoesForma = omissoesFormaReal;
    totalOmissoes = totalOmissoesReal;
  }
  
  // Resultados essenciais
  console.log(`🎨 COR: ${acertosCor} acertos | ${omissoesCor} omissões`);
  console.log(`🔷 FORMA: ${acertosForma} acertos | ${omissoesForma} omissões`);
  console.log(`🧠 ATENÇÃO ALTERNADA: Capacidade de alternar foco entre cor e forma`);
  console.log(`🎲 AMBIVALENTES: ${acertosAmbivalentes} acertos`);
  console.log(`❌ TOTAL ERROS: ${totalErros} (apertou sem coincidência)`);
  console.log(`⚡ REAÇÕES RÁPIDAS: ${respostasRapidas} respostas <200ms (alta performance)`);
  
  // ESTATÍSTICAS DETALHADAS PARA DIAGNÓSTICO
  const totalRespostas = totalAcertos + totalErros;
  const totalAlvosGerados = configTeste.alvosCor + configTeste.alvosForma + (configTeste.alvosAmbivalentes || 0);
  const totalAcertosEsperados = totalAcertos + totalOmissoes;
  
  console.log(`📊 === DIAGNÓSTICO COMPLETO ===`);
  console.log(`📊 Você apertou espaço: ${totalRespostas} vezes`);
  console.log(`📊 Alvos gerados: ${totalAlvosGerados}`);
  console.log(`📊 Acertos + Omissões: ${totalAcertosEsperados} (deve ser = alvos gerados)`);
  console.log(`📊 Acertos detectados: ${totalAcertos}`);
  console.log(`📊 Erros detectados: ${totalErros}`);
  console.log(`📊 Omissões detectadas: ${totalOmissoes}`);
  
  // VERIFICAÇÃO DE CONSISTÊNCIA
  if (totalAcertosEsperados !== totalAlvosGerados) {
    console.log(`🚫 ERRO DE LÓGICA: Acertos+Omissões (${totalAcertosEsperados}) ≠ Gerados (${totalAlvosGerados})`);
  }
  
  if (totalRespostas > totalAlvosGerados + 50) {
    console.log(`🚫 POSSÍVEL PROBLEMA: Muitas respostas (${totalRespostas}) vs alvos (${totalAlvosGerados})`);
  }
  
  // ANÁLISE COMPORTAMENTAL MATEMÁTICA (sem adivinhar pensamentos)
  // Denominadores corretos sem incluir ambivalentes
  const totalAlvosCor = configTeste.alvosCor;
  const totalAlvosForma = configTeste.alvosForma;
  
  const taxaAcertoCor = totalAlvosCor > 0 ? (acertosCor / totalAlvosCor * 100).toFixed(1) : 0;
  const taxaAcertoForma = totalAlvosForma > 0 ? (acertosForma / totalAlvosForma * 100).toFixed(1) : 0;
  const taxaOmissaoCor = totalAlvosCor > 0 ? (omissoesCor / totalAlvosCor * 100).toFixed(1) : 0;
  const taxaOmissaoForma = totalAlvosForma > 0 ? (omissoesForma / totalAlvosForma * 100).toFixed(1) : 0;
  
  // Análise de preferência atencional com margem de erro de 3%
  const diferencaPercentual = Math.abs(taxaAcertoCor - taxaAcertoForma);
  let desempenhoAtencao = '';
  
  if (diferencaPercentual <= 3) {
    desempenhoAtencao = 'ATENÇÃO EQUILIBRADA';
  } else if (taxaAcertoCor > taxaAcertoForma) {
    desempenhoAtencao = 'PREFERÊNCIA PARA COR';
  } else {
    desempenhoAtencao = 'PREFERÊNCIA PARA FORMA';
  }
  
  // FÓRMULA NEUROPSICOLÓGICA
  const A = totalAcertos;
  const AM = acertosAmbivalentes;
  const O = totalOmissoes;
  const E = totalErros;
  
  const pontuacaoObtida = A;
  const pontuacaoMaxima = (configTeste.alvosCor + configTeste.alvosForma + (configTeste.alvosAmbivalentes || 0));
  const R = pontuacaoMaxima > 0 ? (A / pontuacaoMaxima) * 100 : 0;
  
  console.log(`🧠 DESEMPENHO ATENÇÃO ALTERNADA:`);
  console.log(`🧠 ${desempenhoAtencao}`);
  console.log(`🧠 Taxa COR: ${taxaAcertoCor}% acertos, ${taxaOmissaoCor}% omissões`);
  console.log(`🧠 Taxa FORMA: ${taxaAcertoForma}% acertos, ${taxaOmissaoForma}% omissões`);
  console.log(`📊 FÓRMULA NEUROPSICOLÓGICA:`);
  console.log(`📊 Obtido: ${A} - ${O} - ${E} = ${pontuacaoObtida.toFixed(1)}`);
  console.log(`📊 Máximo: ${pontuacaoMaxima.toFixed(1)}`);
  console.log(`📊 Taxa: ${R.toFixed(1)}%`);
  console.log(`📊 Erros por Impulsividade: ${totalErros} (não afetam detecção de alvos)`);
  
  const tempoMedio = temposReacaoAlternada.length > 0 ? temposReacaoAlternada.reduce((a, b) => a + b, 0) / temposReacaoAlternada.length : 0;
  
  console.log(`⏱️ TEMPO MÉDIO: ${tempoMedio.toFixed(0)}ms`);
  
  // Velocidade por faixa
  var lim = configTeste;
  if (tempoMedio > 0) {
    if (tempoMedio < lim.limiarRTRapido) console.log(`🚀 RÁPIDA para faixa ${lim.faixa}`);
    else if (tempoMedio < lim.limiarRTNormal) console.log(`✅ NORMAL para faixa ${lim.faixa}`);
    else if (tempoMedio < lim.limiarRTLento) console.log(`⚠️ LENTA para faixa ${lim.faixa}`);
    else console.log(`❌ MUITO LENTA para faixa ${lim.faixa}`);
  }
  
  console.log(`📈 COMPARAÇÃO: COR=${taxaAcertoCor}% vs FORMA=${taxaAcertoForma}%`);
  
  // Taxa de precisão (acertos vs total de respostas)
  const precisao = totalRespostas > 0 ? (totalAcertos / totalRespostas * 100).toFixed(1) : 0;
  console.log(`🎯 PRECISÃO: ${precisao}% (acertos/total_respostas)`);
  
  // Distribuição real vs teórica
  const alvosReais = configTeste.alvosCor + configTeste.alvosForma + (configTeste.alvosAmbivalentes || 0);
  const porcentagemAlvos = (alvosReais / configTeste.totalPares * 100).toFixed(1);
  console.log(`📈 DISTRIBUIÇÃO: ${porcentagemAlvos}% alvos (teórico: 20%)`);
  
  // Mensagem final
  let mensagemParabens = '';
  if (R >= 80) {
    mensagemParabens = '🎉 EXCELENTE! Desempenho superior!';
  } else if (R >= 60) {
    mensagemParabens = '👏 MUITO BOM! Bom desempenho!';
  } else if (R >= 40) {
    mensagemParabens = '👍 BOM! Desempenho adequado!';
  } else {
    mensagemParabens = '💪 PARABÉNS! Você completou o teste!';
  }
  
  console.log(mensagemParabens);
  
  // TELA DE PARABÉNS ELEGANTE
  const quadro = document.getElementById('quadroAlternado');
  quadro.style.transition = 'all 0.5s ease-in-out';
  quadro.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  quadro.style.borderRadius = '15px';
  quadro.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  
  quadro.innerHTML = `
    <div style="
      color: white; 
      text-align: center; 
      padding: 10px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">
      <div style="font-size: 24px; margin-bottom: 8px;">🎉 Parabéns!</div>
      <div style="font-size: 14px;">Você completou o teste!</div>
    </div>
  `;
  
  // Adiciona animações CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);
  
  salvarResultadosAlternada();
  
  // Cria botão próximo teste para sustentada
  criarBotaoProximoTeste('paginaTesteAlternado', 'testeSustentada');
}

// ===== SALVAR RESULTADOS COM FAIXA =====
// Chamada dentro de finalizarTesteAlternada, antes do botão próximo
function salvarResultadosAlternada() {
  var tempoMedio = temposReacaoAlternada.length > 0 ? temposReacaoAlternada.reduce(function(a,b){return a+b;},0) / temposReacaoAlternada.length : 0;
  var pontuacaoMaxima = (configTeste.alvosCor + configTeste.alvosForma + (configTeste.alvosAmbivalentes || 0));
  var R = pontuacaoMaxima > 0 ? (totalAcertos / pontuacaoMaxima) * 100 : 0;
  var resultados = {
    acertos: totalAcertos,
    acertosCor: acertosCor,
    acertosForma: acertosForma,
    acertosAmbivalentes: acertosAmbivalentes,
    erros: totalErros,
    omissoes: totalOmissoes,
    omissoesCor: omissoesCor,
    omissoesForma: omissoesForma,
    taxaAcerto: R,
    tempoMedio: tempoMedio,
    temposReacao: temposReacaoAlternada.slice(),
    totalPares: configTeste.totalPares,
    faixaEtaria: configTeste.faixa,
    intervalo: configTeste.intervalo,
    statusTeste: 'CONCLUÍDO'
  };
  if (typeof salvarResultadoTeste === 'function') salvarResultadoTeste('alternada', resultados);
}

// ===== DISPONIBILIZAÇÃO GLOBAL =====
// Linha 520-525: Função já é global sem IIFE
window.iniciarTesteAlternado = iniciarTesteAlternado;

document.addEventListener('DOMContentLoaded', function() {
    window.iniciarTesteAlternado = iniciarTesteAlternado;
});

console.log('✅ Teste de Atenção Alternada carregado!');

