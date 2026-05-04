// ===== INSTRUÇÕES TESTE DIVIDIDA =====
function mostrarInstrucoesDividida() {
    const quadro = document.getElementById('quadroDividida');
    const instrucoesDiv = document.createElement('div');
    instrucoesDiv.className = 'instrucoes-dividida';
    var isTouchDevice = window.dispositivoBAE && window.dispositivoBAE.isTouch;
    var isMobile = window.innerWidth <= 768;
    if (isMobile) {
        instrucoesDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;height:auto;max-height:90vh;overflow-y:auto;padding:15px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:10px;color:white;text-align:center;font-size:14px;box-sizing:border-box;';
    }
    instrucoesDiv.innerHTML = `
        <div class="instrucoes-conteudo" ${isMobile ? 'style="font-size:14px;line-height:1.4;margin-bottom:10px;"' : ''}>
            <p><strong>Você verá figuras e ouvirá sons ao mesmo tempo.</strong></p>
            <p>Sua tarefa é detectar os ALVOS:</p>
            <div class="alvos-container" ${isMobile ? 'style="margin:10px 0;padding:10px;"' : ''}>
                <p><span class="triangulo-exemplo" ${isMobile ? 'style="border-left-width:15px;border-right-width:15px;border-bottom-width:26px;"' : ''}></span> <strong>VISUAL:</strong> Triângulo → ${isTouchDevice ? '<span class="tecla-espaco">👁️ VISUAL</span>' : '<span class="tecla-espaco">ESPAÇO</span>'}</p>
                <p>🔊 <strong>AUDITIVO:</strong> 400Hz → ${isTouchDevice ? '<span class="tecla-enter">🔊 AUDITIVO</span>' : '<span class="tecla-enter">ENTER</span>'}</p>
            </div>
            <div class="familiarizacao-container" ${isMobile ? 'style="margin:10px 0;padding:10px;"' : ''}>
                <p><strong>Familiarize-se com os sons:</strong></p>
                <div class="botoes-som">
                    <button class="botao-som" onclick="tocarSomFamiliarizacao(200)">Grave</button>
                    <button class="botao-som botao-som-alvo" onclick="tocarSomFamiliarizacao(400)">ALVO</button>
                    <button class="botao-som" onclick="tocarSomFamiliarizacao(800)">Agudo</button>
                </div>
            </div>
            <p><strong>Ignore</strong> outras figuras e sons!</p>
        </div>
        <button id="iniciarTesteDivididaAposInstrucoes" class="botao-iniciar" ${isMobile ? 'style="margin:10px auto;min-height:50px;"' : ''}>Iniciar Teste</button>
    `;
    quadro.innerHTML = '';
    quadro.classList.add('instrucoes-ativas');
    quadro.appendChild(instrucoesDiv);
    return new Promise(function(resolve) {
        setTimeout(function() {
            var botao = document.getElementById('iniciarTesteDivididaAposInstrucoes');
            if (botao) { botao.onclick = function() { quadro.classList.remove('instrucoes-ativas'); quadro.innerHTML = ''; resolve(); }; }
        }, 100);
    });
}

// ===== FAMILIARIZAÇÃO SONORA =====
function tocarSomFamiliarizacao(frequencia) {
    try {
        if (typeof window.audioContext === 'undefined') window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var ctx = window.audioContext;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) { console.log('Erro som:', e); }
}

// ===== FUNÇÃO PRINCIPAL =====
function iniciarTesteDividida() {
  if (typeof marcarBypassados === 'function') marcarBypassados();
    if (window.dispositivoBAE) window.dispositivoBAE.iniciarTeste('dividida');
    var dividida = document.getElementById('testeDividida');
    if (!dividida || dividida.style.display === 'none') return;

    console.log('🎯 Iniciando Teste de Atenção Dividida');

    var birthDate = localStorage.getItem('dataNascimento') || (document.getElementById('dataNascimento') ? document.getElementById('dataNascimento').value : '');
    if (!birthDate) { alert('Erro: Data de nascimento não encontrada.'); return; }

    CONFIG_DIVIDIDA = obterConfigDividida();
    var duracaoSegundos = CONFIG_DIVIDIDA.duracaoSegundos;
    totalEstimulosDividida = Math.floor(duracaoSegundos / (CONFIG_DIVIDIDA.intervaloEstimulo / 1000));

    console.log('🎂 Faixa: ' + CONFIG_DIVIDIDA.faixa + ' (' + CONFIG_DIVIDIDA.idadeAnos + ' anos)');
    console.log('⚙️ Duração: ' + duracaoSegundos + 's | Intervalo: ' + CONFIG_DIVIDIDA.intervaloEstimulo + 'ms | Estímulos: ' + totalEstimulosDividida);

    document.getElementById('iniciarDividida').style.display = 'none';
    document.getElementById('quadroDividida').style.display = 'block';

    resetarContadoresDividida();
    testeJaFinalizadoDividida = false;
    isTesteDivididaRunning = true;
    document.addEventListener('keydown', processarRespostaDividida);

    mostrarInstrucoesDividida().then(function() {
        if (window.touchControls) window.touchControls.mostrarBotoesDividida();
        iniciarContagemRegressivaDividida(function() {
            gerarSequenciaEstimulosDividida(totalEstimulosDividida);
            console.log('✅ Sequência: ' + sequenciaEstimulosDividida.length + ' estímulos');
            window._dividStartTime = performance.now();
            currentEstimulo = 0;
            apresentarEstimulo();
            intervalDividida = setInterval(apresentarEstimulo, CONFIG_DIVIDIDA.intervaloEstimulo);
            setTimeout(finalizarTesteDividida, duracaoSegundos * 1000);
            // Monitor backup (como seletiva)
            var _dividHoraInicio = Date.now();
            window._dividMonitor = setInterval(function() {
                if (!isTesteDivididaRunning) { clearInterval(window._dividMonitor); return; }
                if ((Date.now() - _dividHoraInicio) / 1000 >= duracaoSegundos) {
                    console.log('🚨 DIVIDIDA: Monitor backup ativado!');
                    finalizarTesteDividida();
                }
            }, 10000);
        });
    });
}

// ===== CONTAGEM REGRESSIVA =====
function iniciarContagemRegressivaDividida(callback) {
    var quadro = document.getElementById('quadroDividida');
    var contagemDiv = document.createElement('div');
    contagemDiv.className = 'contagem-regressiva';
    var numeroDiv = document.createElement('div');
    numeroDiv.className = 'contagem-numero';
    numeroDiv.textContent = '3';
    var textoDiv = document.createElement('div');
    textoDiv.className = 'contagem-texto';
    textoDiv.textContent = 'Preparando teste dividida...';
    contagemDiv.appendChild(numeroDiv);
    contagemDiv.appendChild(textoDiv);
    quadro.appendChild(contagemDiv);

    var countdown = 3;
    var interval = setInterval(function() {
        if (countdown > 0) {
            numeroDiv.textContent = countdown;
            numeroDiv.style.color = countdown === 3 ? '#e74c3c' : countdown === 2 ? '#f39c12' : '#27ae60';
            countdown--;
        } else {
            clearInterval(interval);
            numeroDiv.textContent = 'INICIAR! 🤹';
            numeroDiv.style.color = '#27ae60';
            textoDiv.textContent = 'Vamos dividir a atenção!';
            setTimeout(function() {
                contagemDiv.remove();
                var figuraDiv = document.createElement('div');
                figuraDiv.id = 'figuraDiv';
                quadro.appendChild(figuraDiv);
                callback();
            }, 1500);
        }
    }, 1000);
}

// ===== APRESENTA ESTÍMULO =====
function apresentarEstimulo() {
    if (!isTesteDivididaRunning || currentEstimulo >= totalEstimulosDividida) return;

    var quadroDividida = document.getElementById('quadroDividida');
    if (!quadroDividida || quadroDividida.style.display === 'none') {
        isTesteDivididaRunning = false;
        if (intervalDividida) clearInterval(intervalDividida);
        return;
    }

    // Verifica omissão do estímulo anterior (flags separadas)
    if (currentEstimulo > 0) {
        var estAnterior = sequenciaEstimulosDividida[currentEstimulo - 1];
        if (estAnterior) {
            if (estAnterior.figura === alvoVisual && !respostaVisualDetectada) {
                omissoesVisuaisDividida++;
                console.log('⏰ OMISSÃO VISUAL: triângulo não respondido. Total: ' + omissoesVisuaisDividida);
            }
            if (estAnterior.som === alvoAuditivo && !respostaAuditivaDetectada) {
                omissoesAuditivasDividida++;
                console.log('⏰ OMISSÃO AUDITIVA: 400Hz não respondido. Total: ' + omissoesAuditivasDividida);
            }
        }
    }

    var estimulo = sequenciaEstimulosDividida[currentEstimulo];
    if (!estimulo) return;

    figuraAtualDividida = estimulo.figura;
    somAtualDividida = estimulo.som;

    exibirFigura();
    tocarSom();

    startTimeDividida = performance.now();
    respostaVisualDetectada = false;
    respostaAuditivaDetectada = false;

    var isV = figuraAtualDividida === alvoVisual;
    var isA = somAtualDividida === alvoAuditivo;
    console.log('🎯 ' + (currentEstimulo + 1) + '/' + totalEstimulosDividida + ': ' + figuraAtualDividida + (isV ? '(ALVO)' : '') + ' + ' + somAtualDividida + 'Hz' + (isA ? '(ALVO)' : ''));

    currentEstimulo++;

    setTimeout(function() {
        var figuraDiv = document.getElementById('figuraDiv');
        if (figuraDiv && isTesteDivididaRunning) figuraDiv.innerHTML = '';
    }, CONFIG_DIVIDIDA.tempoExposicao);
}

// ===== EXIBE FIGURA =====
function exibirFigura() {
    var container = document.getElementById('figuraDiv');
    if (!container || !isTesteDivididaRunning) return;
    container.style.position = 'absolute';
    container.style.width = '60px';
    container.style.height = '60px';
    var quadroEl = document.getElementById('quadroDividida');
    var maxX = (quadroEl ? quadroEl.clientWidth : 20 * 37.8) - 60;
    var maxY = (quadroEl ? quadroEl.clientHeight : 15 * 37.8) - 60;
    container.style.left = (Math.random() * maxX) + 'px';
    container.style.top = (Math.random() * maxY) + 'px';
    
    // Determina sextante (3 colunas x 2 linhas)
    var posXval = parseFloat(container.style.left);
    var posYval = parseFloat(container.style.top);
    var terco = (quadroEl ? quadroEl.clientWidth : 20 * 37.8) / 3;
    var metade = (quadroEl ? quadroEl.clientHeight : 15 * 37.8) / 2;
    var col = posXval < terco ? 0 : posXval < terco * 2 ? 1 : 2;
    var lin = posYval < metade ? 0 : 1;
    var sextMap = [['S1','S2','S3'],['S4','S5','S6']];
    sextanteAtualDividida = sextMap[lin][col];
    if (figuraAtualDividida === alvoVisual) sextantesDividida[sextanteAtualDividida]++;
    container.innerHTML = criarFormaCSS(figuraAtualDividida, 'white');
    container.style.display = 'block';
}

// ===== CRIA FORMA CSS =====
function criarFormaCSS(forma, cor) {
    switch(forma) {
        case 'triangulo':
            return '<div style="width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:43px solid ' + cor + ';margin:8px auto;"></div>';
        case 'quadrado':
            return '<div style="width:60px;height:60px;background-color:' + cor + ';"></div>';
        case 'estrela':
            return '<div style="width:60px;height:60px;background-color:' + cor + ';clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div>';
        default:
            return '<div style="width:60px;height:60px;background-color:' + cor + ';"></div>';
    }
}

// ===== TOCA SOM =====
function tocarSom() {
    try {
        if (typeof window.audioContext === 'undefined') window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var ctx = window.audioContext;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.frequency.setValueAtTime(somAtualDividida, ctx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) { console.log('Erro som:', e); }
}

// ===== PROCESSA RESPOSTA (flags separadas visual/auditivo) =====
function processarRespostaDividida(event) {
    if (!isTesteDivididaRunning) return;
    var tempoReacao = performance.now() - startTimeDividida;

    if (event.key === ' ') {
        event.preventDefault();
        if (respostaVisualDetectada) return;
        respostaVisualDetectada = true;
        var modo = window._ultimaEntradaTouch ? 'touch' : 'teclado';
        window._ultimaEntradaTouch = false;
        if (window.dispositivoBAE) window.dispositivoBAE.registrar(modo, tempoReacao);
        if (figuraAtualDividida === alvoVisual) {
            acertosVisuaisDividida++;
            temposReacaoVisuaisDividida.push(tempoReacao);
            acertosPorSextanteDividida[sextanteAtualDividida]++;
            console.log('✅ ACERTO VISUAL! ' + tempoReacao.toFixed(0) + 'ms (' + sextanteAtualDividida + ')');
        } else {
            errosVisuaisDividida++;
            console.log('❌ ERRO VISUAL! ' + figuraAtualDividida + ' (não era triângulo)');
        }
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (respostaAuditivaDetectada) return;
        respostaAuditivaDetectada = true;
        var modoA = window._ultimaEntradaTouch ? 'touch' : 'teclado';
        window._ultimaEntradaTouch = false;
        if (window.dispositivoBAE) window.dispositivoBAE.registrar(modoA, tempoReacao);
        if (somAtualDividida === alvoAuditivo) {
            acertosAuditivosDividida++;
            temposReacaoAuditivosDividida.push(tempoReacao);
            console.log('✅ ACERTO AUDITIVO! ' + tempoReacao.toFixed(0) + 'ms');
        } else {
            errosAuditivosDividida++;
            console.log('❌ ERRO AUDITIVO! ' + somAtualDividida + 'Hz (não era 400Hz)');
        }
    }
}

// ===== PARA TESTE =====
function pararTesteDividida() {
    if (!isTesteDivididaRunning) return;
    if (window.touchControls) window.touchControls.limpar();
    isTesteDivididaRunning = false;
    document.removeEventListener('keydown', processarRespostaDividida);
    if (intervalDividida) { clearInterval(intervalDividida); intervalDividida = null; }
    
    // Limpa a tela
    var figuraDiv = document.getElementById('figuraDiv');
    if (figuraDiv) figuraDiv.innerHTML = '';
}

// ===== FINALIZA TESTE =====
var testeJaFinalizadoDividida = false;
function finalizarTesteDividida() {
    if (testeJaFinalizadoDividida) {
        console.log('⚠️ DIVIDIDA: finalizarTeste já foi chamado, ignorando...');
        return;
    }
    testeJaFinalizadoDividida = true;
    console.log('🏁 Finalizando Teste de Atenção Dividida');
    if (window._dividMonitor) { clearInterval(window._dividMonitor); window._dividMonitor = null; }
    pararTesteDividida();

    // Verifica omissão do último estímulo
    if (currentEstimulo > 0) {
        var ultimo = sequenciaEstimulosDividida[currentEstimulo - 1];
        if (ultimo) {
            if (ultimo.figura === alvoVisual && !respostaVisualDetectada) omissoesVisuaisDividida++;
            if (ultimo.som === alvoAuditivo && !respostaAuditivaDetectada) omissoesAuditivasDividida++;
        }
    }

    var duracaoReal = window._dividStartTime ? Math.round((performance.now() - window._dividStartTime) / 1000) : 0;

    var totalVisuais = acertosVisuaisDividida + errosVisuaisDividida + omissoesVisuaisDividida;
    var totalAuditivos = acertosAuditivosDividida + errosAuditivosDividida + omissoesAuditivasDividida;
    var taxaVisual = totalVisuais > 0 ? (acertosVisuaisDividida / totalVisuais) * 100 : 0;
    var taxaAuditiva = totalAuditivos > 0 ? (acertosAuditivosDividida / totalAuditivos) * 100 : 0;
    var desempenhoGeral = (taxaVisual + taxaAuditiva) / 2;
    var allRTs = temposReacaoVisuaisDividida.concat(temposReacaoAuditivosDividida);
    var tempoMedio = allRTs.length > 0 ? allRTs.reduce(function(a, b) { return a + b; }, 0) / allRTs.length : 0;

    console.log('📊 Visual: ' + acertosVisuaisDividida + ' acertos, ' + errosVisuaisDividida + ' erros, ' + omissoesVisuaisDividida + ' omissões (' + taxaVisual.toFixed(1) + '%)');
    console.log('📊 Auditivo: ' + acertosAuditivosDividida + ' acertos, ' + errosAuditivosDividida + ' erros, ' + omissoesAuditivasDividida + ' omissões (' + taxaAuditiva.toFixed(1) + '%)');
    console.log('✓ Visual: ' + acertosVisuaisDividida + '+' + errosVisuaisDividida + '+' + omissoesVisuaisDividida + '=' + totalVisuais);
    console.log('✓ Auditivo: ' + acertosAuditivosDividida + '+' + errosAuditivosDividida + '+' + omissoesAuditivasDividida + '=' + totalAuditivos);

    gerarAnaliseDividida(taxaVisual, taxaAuditiva, desempenhoGeral, tempoMedio);

    var resultados = {
        acertosVisuais: acertosVisuaisDividida,
        acertosAuditivos: acertosAuditivosDividida,
        errosVisuais: errosVisuaisDividida,
        errosAuditivos: errosAuditivosDividida,
        omissoesVisuais: omissoesVisuaisDividida,
        omissoesAuditivas: omissoesAuditivasDividida,
        totalAcertos: acertosVisuaisDividida + acertosAuditivosDividida,
        taxaAcerto: desempenhoGeral,
        tempoMedio: tempoMedio,
        duracaoTeste: duracaoReal,
        sextantesDividida: JSON.parse(JSON.stringify(sextantesDividida)),
        acertosPorSextante: JSON.parse(JSON.stringify(acertosPorSextanteDividida)),
        faixaEtaria: CONFIG_DIVIDIDA.faixa,
        intervaloEstimulo: CONFIG_DIVIDIDA.intervaloEstimulo,
        statusTeste: 'CONCLUÍDO',
        dispositivo: window.dispositivoBAE ? window.dispositivoBAE.obterInfoDispositivo() : null,
        modoEntrada: window.dispositivoBAE ? window.dispositivoBAE.obterResumo('dividida') : null
    };

    if (typeof salvarResultadoTeste === 'function') salvarResultadoTeste('dividida', resultados);

    mostrarParabensDividida();
    setTimeout(function() { criarBotaoProximoTeste('testeDividida', 'paginaTesteAlternado'); }, 4000);
}

// ===== ANÁLISE CLÍNICA POR FAIXA =====
function gerarAnaliseDividida(taxaVisual, taxaAuditiva, geral, tempoMedio) {
    var faixa = CONFIG_DIVIDIDA ? CONFIG_DIVIDIDA.faixa : 'adulto';
    var lim = CONFIG_DIVIDIDA || { limiarRTRapido: 500, limiarRTNormal: 750, limiarRTLento: 1100 };

    console.log('\n🧠 ANÁLISE NEUROPSICOLÓGICA - ATENÇÃO DIVIDIDA');
    console.log('🎂 Faixa: ' + faixa + ' | Duração: ' + CONFIG_DIVIDIDA.duracaoSegundos + 's');

    console.log('\n📊 PROCESSAMENTO DUAL:');
    if (geral >= 85) console.log('✅ EXCELENTE (' + geral.toFixed(1) + '%) - Capacidade dual preservada (Kahneman, 1973)');
    else if (geral >= 70) console.log('✅ ADEQUADA (' + geral.toFixed(1) + '%) - Dentro dos padrões normativos');
    else if (geral >= 50) console.log('⚠️ LIMÍTROFE (' + geral.toFixed(1) + '%) - Dificuldade em dividir atenção');
    else console.log('❌ DEFICITÁRIA (' + geral.toFixed(1) + '%) - Déficit de processamento dual');

    console.log('\n⚡ VELOCIDADE DE PROCESSAMENTO:');
    if (tempoMedio < lim.limiarRTRapido) console.log('🚀 RÁPIDA (' + tempoMedio.toFixed(0) + 'ms) para faixa ' + faixa);
    else if (tempoMedio < lim.limiarRTNormal) console.log('✅ NORMAL (' + tempoMedio.toFixed(0) + 'ms) para faixa ' + faixa);
    else if (tempoMedio < lim.limiarRTLento) console.log('⚠️ LENTA (' + tempoMedio.toFixed(0) + 'ms) para faixa ' + faixa);
    else console.log('❌ MUITO LENTA (' + tempoMedio.toFixed(0) + 'ms) para faixa ' + faixa);

    var diferenca = Math.abs(taxaVisual - taxaAuditiva);
    console.log('\n🔀 ASSIMETRIA INTERMODAL:');
    if (diferenca < 10) console.log('✅ EQUILIBRADA (Visual: ' + taxaVisual.toFixed(1) + '% | Auditivo: ' + taxaAuditiva.toFixed(1) + '%)');
    else {
        var melhor = taxaVisual > taxaAuditiva ? 'VISUAL' : 'AUDITIVA';
        console.log('⚠️ PREFERÊNCIA ' + melhor + ' (Visual: ' + taxaVisual.toFixed(1) + '% | Auditivo: ' + taxaAuditiva.toFixed(1) + '%) - Diferença: ' + diferenca.toFixed(1) + '%');
    }

    console.log('\n🏥 INDICADORES CLÍNICOS:');
    
    // Análise por sextante
    console.log('\n📍 DISTRIBUIÇÃO VISUAL POR SEXTANTE:');
    console.log('   Alvos:   S1=' + sextantesDividida.S1 + ' S2=' + sextantesDividida.S2 + ' S3=' + sextantesDividida.S3 + ' | S4=' + sextantesDividida.S4 + ' S5=' + sextantesDividida.S5 + ' S6=' + sextantesDividida.S6);
    console.log('   Acertos: S1=' + acertosPorSextanteDividida.S1 + ' S2=' + acertosPorSextanteDividida.S2 + ' S3=' + acertosPorSextanteDividida.S3 + ' | S4=' + acertosPorSextanteDividida.S4 + ' S5=' + acertosPorSextanteDividida.S5 + ' S6=' + acertosPorSextanteDividida.S6);

    if (geral < 50 && diferenca > 20) console.log('📋 Déficit de processamento dual com assimetria intermodal significativa');
    else if (geral < 60) console.log('📋 Possível sobrecarga do executivo central (Baddeley, 1986)');
    else console.log('📋 Perfil de atenção dividida dentro da normalidade para faixa ' + faixa);
}

// ===== PARABÉNS (sem resultados) =====
function mostrarParabensDividida() {
    var quadro = document.getElementById('quadroDividida');
    var telaParabens = document.createElement('div');
    telaParabens.className = 'parabens-dividida';
    telaParabens.innerHTML = '<div style="font-size:48px;margin-bottom:20px;">🎉</div><h2 style="margin:0 0 15px 0;font-size:28px;">Parabéns!</h2><p style="font-size:18px;margin:15px 0;">Você completou o teste!</p><p style="font-size:16px;margin:15px 0;opacity:0.9;">Agora vamos para o próximo desafio!</p><div style="font-size:32px;margin-top:20px;">🤹 ➡️ 🔄</div>';
    quadro.innerHTML = '';
    quadro.appendChild(telaParabens);
    setTimeout(function() { if (quadro.contains(telaParabens)) quadro.removeChild(telaParabens); }, 4000);
}

// ===== GERA SEQUÊNCIA COM ESPAÇAMENTO MÍNIMO =====
// Padrão CPT (Conners, 1995; TOVA): mínimo 2 distratores entre alvos
// Evita efeito de expectativa sequencial (Nickerson, 2002)
function gerarSequenciaEstimulosDividida(total) {
    var alvosVisuais = Math.floor(total * 0.1);
    var alvosAuditivos = Math.floor(total * 0.1);
    var totalAlvos = alvosVisuais + alvosAuditivos;
    var MIN_GAP = 2; // mínimo 2 distratores entre qualquer alvo

    // Cria array de tipos de alvo e embaralha
    var tiposAlvo = [];
    var i;
    for (i = 0; i < alvosVisuais; i++) tiposAlvo.push('visual');
    for (i = 0; i < alvosAuditivos; i++) tiposAlvo.push('auditivo');
    for (i = tiposAlvo.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = tiposAlvo[i]; tiposAlvo[i] = tiposAlvo[j]; tiposAlvo[j] = tmp;
    }

    // Distribui alvos com espaçamento mínimo garantido
    var tipos = new Array(total);
    for (i = 0; i < total; i++) tipos[i] = 'distrator';

    // Calcula posições válidas com espaçamento
    var posicoes = distribuirComEspacamento(total, totalAlvos, MIN_GAP);
    for (i = 0; i < posicoes.length && i < tiposAlvo.length; i++) {
        tipos[posicoes[i]] = tiposAlvo[i];
    }

    console.log('🎯 Sequência dividida: ' + totalAlvos + ' alvos (' + alvosVisuais + 'V+' + alvosAuditivos + 'A) em ' + total + ' estímulos, gap mínimo=' + MIN_GAP);

    sequenciaEstimulosDividida = tipos.map(function(tipo) {
        if (tipo === 'visual') {
            var sonsNaoAlvo = frequenciasSom.filter(function(f) { return f !== alvoAuditivo; });
            return { figura: alvoVisual, som: sonsNaoAlvo[Math.floor(Math.random() * sonsNaoAlvo.length)] };
        } else if (tipo === 'auditivo') {
            var figurasNaoAlvo = figurasDividida.filter(function(f) { return f !== alvoVisual; });
            return { figura: figurasNaoAlvo[Math.floor(Math.random() * figurasNaoAlvo.length)], som: alvoAuditivo };
        } else {
            var figurasNA = figurasDividida.filter(function(f) { return f !== alvoVisual; });
            var sonsNA = frequenciasSom.filter(function(f) { return f !== alvoAuditivo; });
            return { figura: figurasNA[Math.floor(Math.random() * figurasNA.length)], som: sonsNA[Math.floor(Math.random() * sonsNA.length)] };
        }
    });
}

// Distribui N alvos em T posições com gap mínimo entre qualquer par de alvos
function distribuirComEspacamento(totalPosicoes, totalAlvos, minGap) {
    // Gera posições candidatas (excluindo as primeiras minGap posições)
    var candidatas = [];
    for (var i = minGap; i < totalPosicoes; i++) candidatas.push(i);
    // Fisher-Yates
    for (var k = candidatas.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var tmp = candidatas[k]; candidatas[k] = candidatas[j]; candidatas[j] = tmp;
    }
    // Seleciona posições respeitando gap
    var selecionadas = [];
    for (var c = 0; c < candidatas.length && selecionadas.length < totalAlvos; c++) {
        var pos = candidatas[c];
        var valida = true;
        for (var s = 0; s < selecionadas.length; s++) {
            if (Math.abs(pos - selecionadas[s]) <= minGap) { valida = false; break; }
        }
        if (valida) selecionadas.push(pos);
    }
    selecionadas.sort(function(a, b) { return a - b; });
    return selecionadas;
}

console.log('✅ Teste de Atenção Dividida carregado!');
