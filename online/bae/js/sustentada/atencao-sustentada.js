// ===== TESTE ATENÇÃO SUSTENTADA - VERSÃO COMPARTIMENTADA =====
// Sistema neuropsicológico de vigilância sustentada
// Variáveis em: variaveis-sustentada.js
// Funções em: atencao-sustentada.js

// ===== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO =====
// Linha 7-20: Função principal de inicialização do teste
function iniciarTesteSustentada() {
  if (typeof marcarBypassados === 'function') marcarBypassados();
    if (window.dispositivoBAE) window.dispositivoBAE.iniciarTeste('sustentada');
    console.log("=== INICIANDO TESTE DE ATENÇÃO SUSTENTADA ===");
    
    try {
        CONFIG_SUSTENTADA = obterConfigSustentada();
        duracaoTeste = CONFIG_SUSTENTADA.duracaoMs;
        console.log(`🎂 Faixa: ${CONFIG_SUSTENTADA.faixa} (${CONFIG_SUSTENTADA.idadeAnos} anos)`);
        console.log(`⚙️ Duração: ${duracaoTeste/1000}s | Acerto: <${CONFIG_SUSTENTADA.limiarAcerto}ms | Comprometido: <${CONFIG_SUSTENTADA.limiarComprometido}ms`);
        resetarContadoresSustentada();
        prepararInterfaceSustentada();
    } catch (error) {
        console.error("ERRO no teste sustentada:", error);
    }
}



// ===== PREPARAÇÃO DA INTERFACE =====
// Linha 44-55: Preparação da interface do teste
function prepararInterfaceSustentada() {
    const botaoIniciar = document.getElementById('iniciarSustentada');
    if (botaoIniciar) botaoIniciar.style.display = 'none';
    
    prepararQuadroEstimulosSustentada();
    document.addEventListener('keydown', processarRespostaSustentada);
    if (window.touchControls) window.touchControls.mostrarBotaoResponder();
    
    setTimeout(() => {
        mostrarInstrucoesSustentada(() => {
            iniciarContagemRegressivaSustentada();
        });
    }, 1000);
}

// ===== PREPARAÇÃO DO QUADRO DE ESTÍMULOS =====
// Linha 57-70: Preparação do quadro preto
function prepararQuadroEstimulosSustentada() {
    const quadro = document.getElementById('quadroSustentada');
    if (quadro) {
        quadro.textContent = '';
        quadro.style.display = 'flex';
        quadro.style.justifyContent = 'center';
        quadro.style.alignItems = 'center';
        quadro.style.width = '20cm';
        quadro.style.height = '15cm';
        quadro.style.backgroundColor = 'black';
        quadro.style.margin = '20px auto';
        quadro.style.border = '2px solid #333';
        quadro.style.position = 'relative';
    }
}

// ===== INSTRUÇÕES DO TESTE =====
function mostrarInstrucoesSustentada(callback) {
    const quadro = document.getElementById('quadroSustentada');
    if (!quadro) {
        callback();
        return;
    }
    
    var isTouchDevice = window.dispositivoBAE && window.dispositivoBAE.isTouch;
    quadro.innerHTML = `
        <div style="
            color: white;
            text-align: center;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: rgba(0,0,0,0.9);
            border-radius: 10px;
            margin: 20px;
        ">
            <h2 style="color: #FFD700; margin-bottom: 20px;">ATENÇÃO SUSTENTADA</h2>
            <p style="font-size: 18px; margin-bottom: 15px;">
                Você verá <strong>QUADRADOS AMARELOS</strong> pequenos aparecendo na tela preta.
            </p>
            <p style="font-size: 18px; margin-bottom: 15px;">
                ${isTouchDevice ? 'Toque em <strong>RESPONDER</strong>' : 'Pressione <strong>ESPAÇO</strong>'} sempre que ver um <strong>QUADRADO AMARELO</strong>.
            </p>
            <div style="font-size: 16px; margin: 20px 0; color: #FF6B6B;">
                • <strong>NÃO</strong> ${isTouchDevice ? 'toque' : 'pressione'} para círculos vermelhos<br>
                • <strong>NÃO</strong> ${isTouchDevice ? 'toque' : 'pressione'} quando a tela estiver vazia
            </div>
            <p style="font-size: 16px; color: #FFD700;">
                Mantenha atenção por vários minutos!
            </p>
            <button style="
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

// ===== CONTAGEM REGRESSIVA =====
// Linha 72-110: Contagem regressiva motivacional
function iniciarContagemRegressivaSustentada() {
    const botaoIniciar = document.getElementById('iniciarSustentada');
    if (botaoIniciar) botaoIniciar.style.display = 'none';
    
    const quadro = document.getElementById('quadroSustentada');
    if (!quadro) return;
    
    const contagemDiv = document.createElement('div');
    contagemDiv.style.display = 'flex';
    contagemDiv.style.justifyContent = 'center';
    contagemDiv.style.alignItems = 'center';
    contagemDiv.style.width = '100%';
    contagemDiv.style.height = '100%';
    contagemDiv.style.fontSize = '120px';
    contagemDiv.style.fontWeight = 'bold';
    contagemDiv.style.color = 'white';
    contagemDiv.style.textShadow = '3px 3px 6px rgba(0,0,0,0.8)';
    
    const numeroDiv = document.createElement('div');
    numeroDiv.style.transition = 'transform 0.3s ease-in-out, color 0.3s ease';
    numeroDiv.textContent = '3';
    
    contagemDiv.appendChild(numeroDiv);
    quadro.appendChild(contagemDiv);
    
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        numeroDiv.textContent = countdown;
        numeroDiv.style.transform = 'scale(1.3)';
        numeroDiv.style.color = countdown === 1 ? '#27ae60' : '#ffffff';
        
        setTimeout(() => {
            numeroDiv.style.transform = 'scale(1)';
        }, 300);
        
        countdown--;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            
            numeroDiv.textContent = 'INICIAR!';
            numeroDiv.style.color = '#27ae60';
            numeroDiv.style.transform = 'scale(1.4)';
            
            setTimeout(() => {
                contagemDiv.remove();
                iniciarSequenciaEstimulosSustentada();
            }, 1000);
        }
    }, 1000);
}

// ===== SEQUÊNCIA DE ESTÍMULOS =====
// Linha 112-120: Inicialização da sequência
function iniciarSequenciaEstimulosSustentada() {
    testeAtivoSustentada = true;
    inicioTeste = performance.now();
    
    gerarSequenciaEstimulosSustentada();
    executarLoopEstimulosSustentada();
}

// ===== GERAÇÃO DE SEQUÊNCIA ALEATÓRIA =====
// Linha 122-170: Geração da sequência balanceada
function gerarSequenciaEstimulosSustentada() {
    sequenciaEstimulosSustentada = [];
    intervalosAleatoriosSustentada = [];
    
    const totalSegundos = duracaoTeste / 1000;
    const estimativaEstimulos = Math.floor(totalSegundos / 3);
    
    // Cria array balanceado
    const alvos = Math.floor(estimativaEstimulos * 0.20);
    const distratores = Math.floor(estimativaEstimulos * 0.25);
    const vazios = estimativaEstimulos - alvos - distratores;
    
    // Preenche array com quantidades exatas
    const sequenciaBase = [];
    for (let i = 0; i < alvos; i++) sequenciaBase.push('alvo');
    for (let i = 0; i < distratores; i++) sequenciaBase.push('distrator');
    for (let i = 0; i < vazios; i++) sequenciaBase.push('vazio');
    
    // Embaralha para distribuir uniformemente
    for (let i = sequenciaBase.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sequenciaBase[i], sequenciaBase[j]] = [sequenciaBase[j], sequenciaBase[i]];
    }
    
    // Evita sequências longas de alvos
    for (let i = 0; i < sequenciaBase.length - 2; i++) {
        if (sequenciaBase[i] === 'alvo' && sequenciaBase[i + 1] === 'alvo' && sequenciaBase[i + 2] === 'alvo') {
            // Troca o terceiro alvo por um vazio
            for (let j = i + 3; j < sequenciaBase.length; j++) {
                if (sequenciaBase[j] === 'vazio') {
                    [sequenciaBase[i + 2], sequenciaBase[j]] = [sequenciaBase[j], sequenciaBase[i + 2]];
                    break;
                }
            }
        }
    }
    
    sequenciaEstimulosSustentada = sequenciaBase;
    estimulosAlvo = alvos;
    estimulosDistrator = distratores;
    
    // Gera intervalos aleatórios
    for (let i = 0; i < estimativaEstimulos; i++) {
        const intervaloAleatorio = Math.random() * 4500 + 1500;
        intervalosAleatoriosSustentada.push(intervaloAleatorio);
    }
    
    console.log(`SEQUENCIA GERADA: ${estimativaEstimulos} estimulos (${alvos} alvos, ${distratores} distratores, ${vazios} vazios)`);
}

// ===== LOOP PRINCIPAL DE EXECUÇÃO =====
// Linha 172-210: Loop principal do teste
function executarLoopEstimulosSustentada() {
    let indiceAtual = 0;
    let tempoInicioLoop = performance.now();
    
    function proximoEstimulo() {
        const tempoDecorrido = performance.now() - tempoInicioLoop;
        if (!testeAtivoSustentada || tempoDecorrido >= duracaoTeste) {
            finalizarTesteSustentada();
            return;
        }
        
        if (indiceAtual >= sequenciaEstimulosSustentada.length) {
            finalizarTesteSustentada();
            return;
        }
        
        const tipoEstimulo = sequenciaEstimulosSustentada[indiceAtual];
        const posicaoEstimulo = exibirEstimulo(tipoEstimulo);
        posicaoAtual = posicaoEstimulo;
        
        totalEstimulos++;
        respostaDetectadaSustentada = false;
        tempoInicioEstimulo = performance.now();
        
        if (totalEstimulos % 10 === 0) {
            console.log(`Progresso: Estimulo ${totalEstimulos}/${sequenciaEstimulosSustentada.length}`);
        }
        
        if (tipoEstimulo === 'alvo') {
            setTimeout(() => {
                if (!respostaDetectadaSustentada) {
                    omissoes++;
                    var sext = posicaoAtual ? posicaoAtual.sextante : null;
                    if (sext && desempenhoPorSextante[sext]) desempenhoPorSextante[sext].omissoes++;
                    console.log(`⏰ OMISSÃO! Sem resposta (${sext || ''}). Total: ${omissoes}`);
                }
            }, CONFIG_SUSTENTADA ? CONFIG_SUSTENTADA.limiarNegligencia : 2000);
        }
        
        const intervaloAleatorio = intervalosAleatoriosSustentada[indiceAtual] || 3000;
        indiceAtual++;
        setTimeout(proximoEstimulo, intervaloAleatorio);
    }
    
    proximoEstimulo();
}

// ===== EXIBIÇÃO DE ESTÍMULO =====
// Linha 212-250: Exibição dos estímulos na tela
function exibirEstimulo(tipo) {
    const quadro = document.getElementById('quadroSustentada');
    
    // Remove apenas estímulos anteriores
    const estimulosAnteriores = quadro.querySelectorAll('.estimulo');
    estimulosAnteriores.forEach(el => el.remove());
    
    tipoEstimuloAtual = tipo;
    
    // Gera posição no grid
    const posicao = gerarPosicaoAleatoria(tipo);
    
    if (tipo === 'alvo') {
        // Quadrado AMARELO pequeno
        const quadrado = document.createElement('div');
        quadrado.className = 'estimulo';
        quadrado.style.position = 'absolute';
        quadrado.style.left = posicao.x + 'px';
        quadrado.style.top = posicao.y + 'px';
        quadrado.style.width = '20px';
        quadrado.style.height = '20px';
        quadrado.style.backgroundColor = '#FFD700';
        quadrado.style.border = '2px solid #333';
        quadrado.style.zIndex = '10';
        quadro.appendChild(quadrado);
        
    } else if (tipo === 'distrator') {
        // Círculo VERMELHO
        const circulo = document.createElement('div');
        circulo.className = 'estimulo';
        circulo.style.position = 'absolute';
        circulo.style.left = posicao.x + 'px';
        circulo.style.top = posicao.y + 'px';
        circulo.style.width = '20px';
        circulo.style.height = '20px';
        circulo.style.backgroundColor = 'red';
        circulo.style.borderRadius = '50%';
        circulo.style.border = '2px solid #333';
        circulo.style.zIndex = '10';
        quadro.appendChild(circulo);
    }
    
    // Remove estímulo após 1 segundo
    setTimeout(() => {
        const estimulosAtuais = quadro.querySelectorAll('.estimulo');
        estimulosAtuais.forEach(el => el.remove());
    }, 1000);
    
    return posicao;
}

// ===== GERAÇÃO DE POSIÇÃO COM CONTROLE DE QUADRANTES =====
// Linha 252-280: Geração de posições aleatórias
function gerarPosicaoAleatoria(tipoEstimulo) {
    const colunas = 18;
    const linhas = 18;
    var quadroEl = document.getElementById('quadroSustentada');
    var quadroW = quadroEl ? quadroEl.clientWidth : 20 * 37.8;
    var quadroH = quadroEl ? quadroEl.clientHeight : 15 * 37.8;
    const larguraCelula = quadroW / colunas;
    const alturaCelula = quadroH / linhas;
    
    let sextante, coluna, linha;
    
    if (tipoEstimulo === 'alvo') {
        sextante = escolherSextanteEquilibrado();
        const posicaoEscolhida = escolherPosicaoUniforme(sextante);
        coluna = posicaoEscolhida.coluna;
        linha = posicaoEscolhida.linha;
    } else {
        coluna = Math.floor(Math.random() * colunas);
        linha = Math.floor(Math.random() * linhas);
        sextante = null;
    }
    
    const x = (coluna * larguraCelula) + (larguraCelula / 2) - 10;
    const y = (linha * alturaCelula) + (alturaCelula / 2) - 10;
    
    return { x, y, coluna, linha, sextante };
}

// ===== ESCOLHA DE POSIÇÃO UNIFORME NO QUADRANTE =====
// Linha 282-320: Escolha uniforme de posições
function escolherPosicaoUniforme(sextante) {
    const posicoesUsadasSext = posicoesUsadas[sextante];
    if (posicoesUsadasSext.length >= 54) posicoesUsadas[sextante] = [];
    
    let coluna, linha, chave;
    // Grid: 6 colunas x 9 linhas por sextante (18col/3=6, 18lin/2=9)
    do {
        const localColuna = Math.floor(Math.random() * 6);
        const localLinha = Math.floor(Math.random() * 9);
        const sextIdx = { S1:[0,0], S2:[1,0], S3:[2,0], S4:[0,1], S5:[1,1], S6:[2,1] };
        const [ci, li] = sextIdx[sextante];
        coluna = localColuna + ci * 6;
        linha = localLinha + li * 9;
        chave = `${linha}-${coluna}`;
    } while (posicoesUsadas[sextante].includes(chave));
    
    posicoesUsadas[sextante].push(chave);
    desempenhoPorSextante[sextante].alvos++;
    return { coluna, linha };
}

// ===== ESCOLHA DE QUADRANTE EQUILIBRADA =====
// Linha 322-340: Escolha equilibrada de quadrantes
function escolherSextanteEquilibrado() {
    const sextantes = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    const contadores = Object.values(contadorSextantes);
    const minCount = Math.min(...contadores);
    const disponiveis = sextantes.filter(s => contadorSextantes[s] === minCount);
    const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    sextantesUsados.push(escolhido);
    contadorSextantes[escolhido]++;
    return escolhido;
}

// ===== PROCESSAMENTO DE RESPOSTA =====
// Linha 342-400: Processamento das respostas do usuário
function processarRespostaSustentada(event) {
    if (!testeAtivoSustentada) return;
    
    if (event.code === 'Space') {
        event.preventDefault();
        
        if (respostaDetectadaSustentada) return;
        
        const tempoReacao = performance.now() - tempoInicioEstimulo;
        var modo = window._ultimaEntradaTouch ? 'touch' : 'teclado';
        window._ultimaEntradaTouch = false;
        if (window.dispositivoBAE) window.dispositivoBAE.registrar(modo, tempoReacao);
        respostaDetectadaSustentada = true;
        todosTemposReacao.push(tempoReacao);
        
        console.log(`RESPOSTA: Tipo=${tipoEstimuloAtual}, Tempo=${tempoReacao.toFixed(0)}ms`);
        
        if (tipoEstimuloAtual === 'alvo') {
            ultimoAlvoTempo = performance.now();
            respostasVazioConsecutivas = 0;
            var limAcerto = CONFIG_SUSTENTADA ? CONFIG_SUSTENTADA.limiarAcerto : 650;
            var limCompr = CONFIG_SUSTENTADA ? CONFIG_SUSTENTADA.limiarComprometido : 1000;
            var limNeg = CONFIG_SUSTENTADA ? CONFIG_SUSTENTADA.limiarNegligencia : 2000;
            var sext = posicaoAtual ? posicaoAtual.sextante : null;
            
            if (tempoReacao <= limAcerto) {
                acertos++;
                temposReacaoSustentada.push(tempoReacao);
                if (sext && desempenhoPorSextante[sext]) desempenhoPorSextante[sext].acertos++;
                console.log(`ACERTO! ${tempoReacao.toFixed(0)}ms (${sext || ''}). Total: ${acertos}`);
                
            } else if (tempoReacao <= limCompr) {
                acertosComprometidos++;
                temposAcertosComprometidos.push(tempoReacao);
                console.log(`ACERTO COMPROMETIDO! ${tempoReacao.toFixed(0)}ms. Total: ${acertosComprometidos}`);
                
            } else if (tempoReacao <= limNeg) {
                negligencias++;
                temposNegligencias.push(tempoReacao);
                if (sext && desempenhoPorSextante[sext]) desempenhoPorSextante[sext].negligencias++;
                console.log(`NEGLIGENCIA! ${tempoReacao.toFixed(0)}ms. Total: ${negligencias}`);
            }
            
        } else if (tipoEstimuloAtual === 'distrator') {
            // IMPULSIVIDADE: Apertou espaço no círculo vermelho
            respostasImpulsivas++;
            respostasVazioConsecutivas = 0;
            console.log(`IMPULSIVIDADE! Apertou no circulo vermelho. Total: ${respostasImpulsivas}`);
            
        } else if (tipoEstimuloAtual === 'vazio') {
            // Analisa resposta na tela vazia
            const tempoDesdeUltimoAlvo = performance.now() - ultimoAlvoTempo;
            respostasVazioConsecutivas++;
            
            if (tempoDesdeUltimoAlvo >= 1001 && tempoDesdeUltimoAlvo <= 2000 && respostasVazioConsecutivas === 1) {
                // NEGLIGÊNCIA: 1001-2000ms após alvo
                negligencias++;
                temposNegligencias.push(tempoDesdeUltimoAlvo);
                console.log(`NEGLIGENCIA! Reagiu ${tempoDesdeUltimoAlvo.toFixed(0)}ms apos alvo. Total: ${negligencias}`);
                
            } else {
                // COMPORTAMENTO OPOSITOR: Múltiplas respostas ou muito tardias
                respostasOpositorias++;
                console.log(`COMPORTAMENTO OPOSITOR! Multiplas respostas inadequadas. Total: ${respostasOpositorias}`);
            }
        }
    }
}

// ===== FINALIZAÇÃO DO TESTE =====
// Linha 402-450: Finalização e cálculo de resultados
function finalizarTesteSustentada() {
    if (window.touchControls) window.touchControls.limpar();
    testeAtivoSustentada = false;
    fimTeste = performance.now();
    
    document.removeEventListener('keydown', processarRespostaSustentada, true);
    document.removeEventListener('keydown', processarRespostaSustentada, false);
    
    calcularEstatisticasFinais();
    exibirResultadosFinais();
}

// ===== FUNÇÃO PARA PARAR TESTE SUSTENTADA =====
// Linha 452-470: Função de parada forçada
function pararTesteSustentada() {
    console.log('🛑 PARANDO TESTE SUSTENTADA');
    
    testeAtivoSustentada = false;
    
    // Remove listeners
    document.removeEventListener('keydown', processarRespostaSustentada, true);
    document.removeEventListener('keydown', processarRespostaSustentada, false);
    
    // Limpa quadro
    const quadro = document.getElementById('quadroSustentada');
    if (quadro) {
        const estimulos = quadro.querySelectorAll('.estimulo');
        estimulos.forEach(el => el.remove());
    }
    
    console.log('✅ Teste sustentada parado');
}

// ===== CÁLCULO DE ESTATÍSTICAS FINAIS =====
// Linha 472-485: Cálculo das estatísticas
function calcularEstatisticasFinais() {
    const duracaoReal = (fimTeste - inicioTeste) / 1000;
    const taxaAcerto = estimulosAlvo > 0 ? (acertos / estimulosAlvo) * 100 : 0;
    const tempoMedioReacao = temposReacaoSustentada.length > 0 ? 
        temposReacaoSustentada.reduce((a, b) => a + b, 0) / temposReacaoSustentada.length : 0;
    
    console.log(`Estatísticas: ${duracaoReal.toFixed(1)}s | ${taxaAcerto.toFixed(1)}% acerto | ${tempoMedioReacao.toFixed(0)}ms médio | ${respostasImpulsivas} impulsivas`);
}

// ===== EXIBIÇÃO DE RESULTADOS FINAIS =====
// Linha 487-530: Exibição dos resultados na tela
function exibirResultadosFinais() {
    const quadro = document.getElementById('quadroSustentada');
    
    const taxaAcerto = estimulosAlvo > 0 ? (acertos / estimulosAlvo) * 100 : 0;
    const tempoMedioReacao = temposReacaoSustentada.length > 0 ? 
        temposReacaoSustentada.reduce((a, b) => a + b, 0) / temposReacaoSustentada.length : 0;
    
    quadro.textContent = '';
    
    const container = document.createElement('div');
    container.style.cssText = 'color: white; text-align: center; padding: 40px; font-size: 24px;';
    
    const titulo = document.createElement('h2');
    titulo.style.cssText = 'color: #27ae60; margin-bottom: 30px;';
    titulo.textContent = '🏁 Parabéns!';
    
    const p1 = document.createElement('p');
    p1.style.cssText = 'font-size: 18px; margin: 20px 0;';
    p1.textContent = 'Você completou o teste!';
    
    container.appendChild(titulo);
    container.appendChild(p1);
    quadro.appendChild(container);
    
    console.log('🏁 TESTE SUSTENTADA FINALIZADO');
    
    // Verificação de totais
    var totalRespondidos = acertos + acertosComprometidos + negligencias + omissoes;
    if (totalRespondidos !== estimulosAlvo) {
        console.log(`⚠️ Ajuste: respondidos=${totalRespondidos} alvos=${estimulosAlvo}`);
        omissoes = estimulosAlvo - acertos - acertosComprometidos - negligencias;
        if (omissoes < 0) omissoes = 0;
    }
    console.log(`✅ ${acertos}/${estimulosAlvo} (${taxaAcerto.toFixed(1)}%) | ⚠️ ${omissoes} omissões | 🟠 ${negligencias} negligências | ⚡ ${respostasImpulsivas} impulsivas`);
    console.log(`📍 SEXTANTES: S1=${desempenhoPorSextante.S1.alvos}/${desempenhoPorSextante.S1.acertos} S2=${desempenhoPorSextante.S2.alvos}/${desempenhoPorSextante.S2.acertos} S3=${desempenhoPorSextante.S3.alvos}/${desempenhoPorSextante.S3.acertos} | S4=${desempenhoPorSextante.S4.alvos}/${desempenhoPorSextante.S4.acertos} S5=${desempenhoPorSextante.S5.alvos}/${desempenhoPorSextante.S5.acertos} S6=${desempenhoPorSextante.S6.alvos}/${desempenhoPorSextante.S6.acertos}`);
    
    // Análise clínica por faixa
    var faixa = CONFIG_SUSTENTADA ? CONFIG_SUSTENTADA.faixa : 'adulto';
    var lim = CONFIG_SUSTENTADA || { limiarRTRapido: 400, limiarRTNormal: 600, limiarRTLento: 900 };
    console.log(`\n🧠 ANÁLISE NEUROPSICOLÓGICA - ATENÇÃO SUSTENTADA`);
    console.log(`🎂 Faixa: ${faixa}`);
    
    if (taxaAcerto >= 85) console.log(`✅ VIGILÂNCIA EXCELENTE (${taxaAcerto.toFixed(1)}%)`);
    else if (taxaAcerto >= 70) console.log(`✅ VIGILÂNCIA ADEQUADA (${taxaAcerto.toFixed(1)}%)`);
    else if (taxaAcerto >= 50) console.log(`⚠️ VIGILÂNCIA LIMÍTROFE (${taxaAcerto.toFixed(1)}%)`);
    else console.log(`❌ VIGILÂNCIA DEFICITÁRIA (${taxaAcerto.toFixed(1)}%)`);
    
    if (tempoMedioReacao > 0) {
        if (tempoMedioReacao < lim.limiarRTRapido) console.log(`🚀 RT RÁPIDO (${tempoMedioReacao.toFixed(0)}ms) para faixa ${faixa}`);
        else if (tempoMedioReacao < lim.limiarRTNormal) console.log(`✅ RT NORMAL (${tempoMedioReacao.toFixed(0)}ms) para faixa ${faixa}`);
        else if (tempoMedioReacao < lim.limiarRTLento) console.log(`⚠️ RT LENTO (${tempoMedioReacao.toFixed(0)}ms) para faixa ${faixa}`);
        else console.log(`❌ RT MUITO LENTO (${tempoMedioReacao.toFixed(0)}ms) para faixa ${faixa}`);
    }
    
    if (respostasImpulsivas > 5) console.log(`⚠️ IMPULSIVIDADE ELEVADA: ${respostasImpulsivas} respostas em distratores`);
    if (negligencias > 3) console.log(`⚠️ NEGLIGÊNCIA DETECTADA: ${negligencias} respostas tardias`);
    if (omissoes > estimulosAlvo * 0.3) console.log(`⚠️ OMISSÕES ELEVADAS: ${omissoes} (${(omissoes/estimulosAlvo*100).toFixed(0)}%) - possível fadiga ou desatenção`);
    
    salvarResultadoTesteSustentada();
    
    // Mostra botão próximo teste
    setTimeout(() => {
        mostrarBotoesNavegacao();
    }, 4000);
}

// ===== SALVAMENTO NO SISTEMA GLOBAL =====
// Linha 532-550: Salvamento dos resultados
function salvarResultadoTesteSustentada() {
    // Não sobrescrever se já foi salvo como ABANDONADO
    if (window.resultadosBAE && window.resultadosBAE.sustentada && window.resultadosBAE.sustentada.statusTeste === 'ABANDONADO') return;
    const taxaAcerto = estimulosAlvo > 0 ? (acertos / estimulosAlvo) * 100 : 0;
    const tempoMedioReacao = temposReacaoSustentada.length > 0 ? 
        temposReacaoSustentada.reduce((a, b) => a + b, 0) / temposReacaoSustentada.length : 0;
    
    const totalErros = respostasImpulsivas + respostasOpositorias;
    
    const resultados = {
        taxaAcerto: Math.round(taxaAcerto * 10) / 10,
        acertos: acertos,
        erros: totalErros,
        omissoes: omissoes,
        totalAlvos: estimulosAlvo,
        tempoMedio: Math.round(tempoMedioReacao * 10) / 10,
        duracaoTeste: Math.floor((fimTeste - inicioTeste) / 1000),
        negligencias: negligencias,
        impulsividade: respostasImpulsivas,
        sextantes: JSON.parse(JSON.stringify(desempenhoPorSextante)),
        faixaEtaria: (window.idadePaciente || 18) < 13 ? 'crianca' : (window.idadePaciente || 18) >= 60 ? 'idoso' : 'adulto',
        statusTeste: 'CONCLUÍDO',
        dispositivo: window.dispositivoBAE ? window.dispositivoBAE.obterInfoDispositivo() : null,
        modoEntrada: window.dispositivoBAE ? window.dispositivoBAE.obterResumo('sustentada') : null
    };
    
    if (typeof salvarResultadoTeste === 'function') {
        salvarResultadoTeste('sustentada', resultados);
    } else {
        if (!window.resultadosBAE) window.resultadosBAE = {};
        window.resultadosBAE.sustentada = resultados;
    }
}

// ===== DISPONIBILIZAÇÃO GLOBAL =====
// Linha 552-560: Exposição das funções globais
window.iniciarTesteSustentada = iniciarTesteSustentada;
window.pararTesteSustentada = pararTesteSustentada;

document.addEventListener('DOMContentLoaded', function() {
    window.iniciarTesteSustentada = iniciarTesteSustentada;
    window.pararTesteSustentada = pararTesteSustentada;
});

console.log('✅ Teste de Atenção Sustentada carregado!');