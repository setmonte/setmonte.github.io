// ===== SISTEMA UNIFICADO DE BOTÕES DE NAVEGAÇÃO =====
// Botão vermelho (🛑): para teste ativo
// Botão azul (⏭️): avança para próximo teste
// Botão laranja (⏮️): volta para teste anterior

// ===== FULLSCREEN API — MODO F11 PARA TESTES =====
// Ativa fullscreen real do navegador (esconde barra de endereço, abas, tudo)
function ativarFullscreenNavegador() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(function(){});
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    // Ativa auto-hide do cursor
    ativarCursorAutoHide();
}

function desativarFullscreenNavegador() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    // Desativa auto-hide do cursor
    desativarCursorAutoHide();
}

// ===== CURSOR AUTO-HIDE (some após 2s parado) =====
var _cursorTimer = null;
var _cursorAtivo = false;

function ativarCursorAutoHide() {
    _cursorAtivo = true;
    document.addEventListener('mousemove', _mostrarCursorTemporario);
    // Esconde após 2s iniciais
    _cursorTimer = setTimeout(function() {
        document.body.classList.add('cursor-hidden');
    }, 2000);
}

function desativarCursorAutoHide() {
    _cursorAtivo = false;
    document.removeEventListener('mousemove', _mostrarCursorTemporario);
    if (_cursorTimer) { clearTimeout(_cursorTimer); _cursorTimer = null; }
    document.body.classList.remove('cursor-hidden');
}

function _mostrarCursorTemporario() {
    if (!_cursorAtivo) return;
    document.body.classList.remove('cursor-hidden');
    if (_cursorTimer) clearTimeout(_cursorTimer);
    _cursorTimer = setTimeout(function() {
        if (_cursorAtivo) document.body.classList.add('cursor-hidden');
    }, 2000);
}

// Ativa fullscreen completo: CSS (quadro ocupa tela)
function ativarFullscreenTeste(quadroId) {
    var quadro = document.getElementById(quadroId);
    if (quadro) {
        quadro.classList.add('fullscreen-teste');
        quadro.style.display = 'flex';
        var containerPai = quadro.closest('.container') || quadro.parentElement;
        if (containerPai) containerPai.classList.add('container-fullscreen');
    }
}

// Remove fullscreen completo: CSS
function desativarFullscreenTeste(quadroId) {
    var quadro = document.getElementById(quadroId);
    if (quadro) {
        quadro.classList.remove('fullscreen-teste');
        var containerPai = quadro.closest('.container-fullscreen') || quadro.closest('.container');
        if (containerPai) containerPai.classList.remove('container-fullscreen');
    }
}

// ===== HISTÓRICO DE EXECUÇÕES POR TESTE =====
// Guarda todas as execuções (parado, bypassado, refeito) para o PDF
window.historicoExecucoes = window.historicoExecucoes || {};

function registrarExecucao(nomeTeste, motivo, dados) {
    if (!window.historicoExecucoes[nomeTeste]) window.historicoExecucoes[nomeTeste] = [];
    window.historicoExecucoes[nomeTeste].push({
        execucao: window.historicoExecucoes[nomeTeste].length + 1,
        motivo: motivo,
        timestamp: new Date().toLocaleString('pt-BR'),
        dados: dados
    });
    var n = window.historicoExecucoes[nomeTeste].length;
    console.log('📝 ' + nomeTeste + ': execução #' + n + ' registrada (' + motivo + ')');
}

// Chamada quando qualquer teste INICIA - marca testes pulados como BYPASSADO
function marcarBypassados() {
    if (!window._testesNavegadosSemIniciar) return;
    window._testesNavegadosSemIniciar.forEach(function(nome) {
        if (!window.resultadosBAE[nome]) {
            salvarResultadoTeste(nome, { statusTeste: 'BYPASSADO', abandonado: true, acertos: 0, erros: 0, omissoes: 0, taxaAcerto: 0, tempoMedio: 0 });
            registrarExecucao(nome, 'BYPASSADO', window.resultadosBAE[nome]);
            console.log('⏭️ ' + nome + ' marcado como BYPASSADO');
        }
    });
    window._testesNavegadosSemIniciar = [];
}
window.marcarBypassados = marcarBypassados;

// ===== FUNÇÃO AUXILIAR: SALVA DADOS PARCIAIS DE QUALQUER TESTE =====
function salvarDadosParciais(nomeTeste, motivo) {
    if (typeof salvarResultadoTeste !== 'function') return;
    if (!motivo) motivo = 'PARADO';
    // motivo: 'PARADO' (botão vermelho), 'BYPASSADO' (botão azul), 'RETROCEDIDO' (botão laranja)

    if (nomeTeste === 'concentrada' && typeof trialDataConc !== 'undefined' && trialDataConc.length > 0) {
        const total = trialDataConc.length;
        const correctCount = trialDataConc.filter(t => t.correct).length;
        const errors = trialDataConc.filter(t => t.error).length;
        const validRTs = trialDataConc.filter(t => t.rt !== null).map(t => t.rt);
        const meanRT = validRTs.length ? validRTs.reduce((a, b) => a + b, 0) / validRTs.length : 0;
        const omissions = trialDataConc.filter(t => t.omitted).length;
        salvarResultadoTeste('concentrada', {
            acertos: correctCount,
            erros: errors,
            omissoes: omissions,
            totalTentativas: total,
            taxaAcerto: total > 0 ? (correctCount / total) * 100 : 0,
            tempoMedio: meanRT,
            temposReacao: validRTs,
            abandonado: true,
            statusTeste: motivo
        });
        console.log(`💾 Concentrada: ${total} tentativas salvas (${motivo})`);
        registrarExecucao('concentrada', motivo, window.resultadosBAE.concentrada);
    }

    if (nomeTeste === 'seletiva' && typeof acertosSeletiva !== 'undefined') {
        const totalLeoesSalvar = typeof totalLeoes !== 'undefined' ? totalLeoes : 0;
        const taxaAcerto = totalLeoesSalvar > 0 ? (acertosSeletiva / totalLeoesSalvar) * 100 : 0;
        const avgRT = temposReacaoSeletiva.length ? temposReacaoSeletiva.reduce((a, b) => a + b, 0) / temposReacaoSeletiva.length : 0;
        if (acertosSeletiva > 0 || errosSeletiva > 0) {
            salvarResultadoTeste('seletiva', {
                acertos: acertosSeletiva,
                erros: errosSeletiva,
                omissoes: totalLeoesSalvar - acertosSeletiva,
                totalLeoes: totalLeoesSalvar,
                taxaAcerto: taxaAcerto,
                tempoMedio: avgRT,
                temposReacao: [...temposReacaoSeletiva],
                abandonado: true,
                statusTeste: motivo
            });
            console.log(`💾 Seletiva: ${acertosSeletiva} acertos salvos (${motivo})`);
            registrarExecucao('seletiva', motivo, window.resultadosBAE.seletiva);
        }
    }

    if (nomeTeste === 'dividida' && typeof acertosVisuaisDividida !== 'undefined') {
        const totalAcertos = acertosVisuaisDividida + acertosAuditivosDividida;
        if (totalAcertos > 0 || errosVisuaisDividida > 0 || errosAuditivosDividida > 0) {
            const allRTs = [...temposReacaoVisuaisDividida, ...temposReacaoAuditivosDividida];
            salvarResultadoTeste('dividida', {
                acertosVisuais: acertosVisuaisDividida,
                acertosAuditivos: acertosAuditivosDividida,
                totalAcertos: totalAcertos,
                taxaAcerto: (acertosVisuaisDividida + acertosAuditivosDividida + errosVisuaisDividida + errosAuditivosDividida + omissoesVisuaisDividida + omissoesAuditivasDividida) > 0 ? (totalAcertos / (acertosVisuaisDividida + acertosAuditivosDividida + errosVisuaisDividida + errosAuditivosDividida + omissoesVisuaisDividida + omissoesAuditivasDividida)) * 100 : 0,
                tempoMedio: allRTs.length ? allRTs.reduce((a, b) => a + b, 0) / allRTs.length : 0,
                abandonado: true,
                statusTeste: motivo
            });
            console.log(`💾 Dividida: ${totalAcertos} acertos salvos (${motivo})`);
            registrarExecucao('dividida', motivo, window.resultadosBAE.dividida);
        }
    }

    if (nomeTeste === 'alternada' && typeof totalAcertos !== 'undefined') {
        if (totalAcertos > 0 || totalErros > 0) {
            const tempoMedio = temposReacaoAlternada.length > 0 ? temposReacaoAlternada.reduce((a, b) => a + b, 0) / temposReacaoAlternada.length : 0;
            const pontuacaoMaxima = configTeste ? (configTeste.alvosCor + configTeste.alvosForma + (configTeste.alvosAmbivalentes || 0)) : 1;
            salvarResultadoTeste('alternada', {
                acertos: totalAcertos,
                erros: totalErros,
                omissoes: totalOmissoes,
                taxaAcerto: pontuacaoMaxima > 0 ? (totalAcertos / pontuacaoMaxima) * 100 : 0,
                tempoMedio: tempoMedio,
                abandonado: true,
                statusTeste: motivo
            });
            console.log(`💾 Alternada: ${totalAcertos} acertos salvos (${motivo})`);
            registrarExecucao('alternada', motivo, window.resultadosBAE.alternada);
        }
    }

    if (nomeTeste === 'sustentada' && typeof acertos !== 'undefined') {
        if (acertos > 0 || respostasImpulsivas > 0) {
            const taxaAcerto = estimulosAlvo > 0 ? (acertos / estimulosAlvo) * 100 : 0;
            const tempoMedioReacao = temposReacaoSustentada.length > 0 ?
                temposReacaoSustentada.reduce((a, b) => a + b, 0) / temposReacaoSustentada.length : 0;
            salvarResultadoTeste('sustentada', {
                taxaAcerto: Math.round(taxaAcerto * 10) / 10,
                acertos: acertos,
                erros: respostasImpulsivas + (typeof respostasOpositorias !== 'undefined' ? respostasOpositorias : 0),
                omissoes: omissoes,
                totalAlvos: estimulosAlvo,
                tempoMedio: Math.round(tempoMedioReacao * 10) / 10,
                negligencias: negligencias,
                impulsividade: respostasImpulsivas,
                abandonado: true,
                statusTeste: motivo
            });
            console.log(`💾 Sustentada: ${acertos} acertos salvos (${motivo})`);
            registrarExecucao('sustentada', motivo, window.resultadosBAE.sustentada);
        }
    }
}

// ===== FUNÇÃO AUXILIAR: PARA QUALQUER TESTE ATIVO =====
function pararTesteAtivo(motivo = 'PARADO') {
    // Verifica cada flag diretamente (let no escopo global não fica em window)
    if (typeof isTestRunningConc !== 'undefined' && isTestRunningConc) {
        console.log('🛑 Parando concentrada...');
        salvarDadosParciais('concentrada', motivo);
        if (typeof pararTesteConcentrada === 'function') pararTesteConcentrada();
        return true;
    }
    if (typeof isTestRunningSeletiva !== 'undefined' && isTestRunningSeletiva) {
        console.log('🛑 Parando seletiva...');
        salvarDadosParciais('seletiva', motivo);
        if (typeof pararTesteSeletiva === 'function') pararTesteSeletiva();
        return true;
    }
    if (typeof isTesteDivididaRunning !== 'undefined' && isTesteDivididaRunning) {
        console.log('🛑 Parando dividida...');
        salvarDadosParciais('dividida', motivo);
        if (typeof pararTesteDividida === 'function') pararTesteDividida();
        return true;
    }
    if (typeof testeAtivoAlternada !== 'undefined' && testeAtivoAlternada) {
        console.log('🛑 Parando alternada...');
        salvarDadosParciais('alternada', motivo);
        testeAtivoAlternada = false;
        return true;
    }
    if (typeof testeAtivoSustentada !== 'undefined' && testeAtivoSustentada) {
        console.log('🛑 Parando sustentada...');
        salvarDadosParciais('sustentada', motivo);
        if (typeof pararTesteSustentada === 'function') pararTesteSustentada();
        return true;
    }
    return false;
}

// ===== BOTÃO VERMELHO: PARAR TESTE =====
function pararTeste() {
    if (!pararTesteAtivo('PARADO')) {
        console.log('Nenhum teste ativo encontrado');
        return;
    }
    // Mostra mensagem "Teste Finalizado" e botão Próximo
    var telaAtual = detectarTelaAtual();
    if (telaAtual) {
        var indice = ordemTelas.indexOf(telaAtual.id);
        if (indice < ordemTelas.length - 1) {
            criarBotaoProximoTeste(telaAtual.id, ordemTelas[indice + 1]);
        }
    }
}

// ===== DETECTAR TELA ATUAL =====
function detectarTelaAtual() {
    const telas = [
        { id: 'testeConcentrada', nome: 'concentrada' },
        { id: 'testeSeletiva', nome: 'seletiva' },
        { id: 'testeDividida', nome: 'dividida' },
        { id: 'paginaTesteAlternado', nome: 'alternada' },
        { id: 'testeSustentada', nome: 'sustentada' }
    ];
    for (const tela of telas) {
        const el = document.getElementById(tela.id);
        if (!el) continue;
        var display = el.style.display || window.getComputedStyle(el).display;
        if (display !== 'none') return tela;
    }
    return null;
}

// ===== ORDEM DAS TELAS =====
const ordemTelas = [
    'testeConcentrada',
    'testeSeletiva',
    'testeDividida',
    'paginaTesteAlternado',
    'testeSustentada'
];

// ===== BOTÃO AZUL: AVANÇAR PARA PRÓXIMO TESTE =====
// Rastreia testes que foram navegados sem iniciar (para marcar BYPASSADO depois)
window._testesNavegadosSemIniciar = window._testesNavegadosSemIniciar || [];

function bypassarTestes() {
    var testeParou = pararTesteAtivo('ABANDONADO');

    const telaAtual = detectarTelaAtual();
    if (!telaAtual) {
        console.log('Nenhuma tela de teste ativa');
        return;
    }

    const indiceAtual = ordemTelas.indexOf(telaAtual.id);
    if (indiceAtual === -1 || indiceAtual >= ordemTelas.length - 1) {
        console.log('Último teste - bateria finalizada');
        alert('Este é o último teste da bateria. Use o botão 📄 (roxo) para gerar o relatório PDF.');
        return;
    }

    // Se nenhum teste estava rodando, está apenas navegando
    if (!testeParou) {
        var nomesMap = {testeConcentrada:'concentrada', testeSeletiva:'seletiva', testeDividida:'dividida', paginaTesteAlternado:'alternada', testeSustentada:'sustentada'};
        var nomeAtual = nomesMap[telaAtual.id];
        if (nomeAtual && !window.resultadosBAE[nomeAtual] && window._testesNavegadosSemIniciar.indexOf(nomeAtual) === -1) {
            window._testesNavegadosSemIniciar.push(nomeAtual);
            console.log('🔀 ' + nomeAtual + ' navegado sem iniciar (será BYPASSADO se próximo iniciar)');
        }
    }

    const proximaTelaId = ordemTelas[indiceAtual + 1];
    document.getElementById(telaAtual.id).style.display = 'none';
    document.getElementById(proximaTelaId).style.display = 'block';
    console.log(`⏭️ ${telaAtual.nome} → ${proximaTelaId}`);
    mostrarBotoesNavegacao();
}

// ===== BOTÃO LARANJA: VOLTAR PARA TESTE ANTERIOR =====
function voltarTeste() {
    pararTesteAtivo('ABANDONADO');

    const telaAtual = detectarTelaAtual();
    if (!telaAtual) return;

    const indiceAtual = ordemTelas.indexOf(telaAtual.id);
    if (indiceAtual <= 0) {
        console.log('Primeiro teste - não há anterior');
        return;
    }

    const telaAnteriorId = ordemTelas[indiceAtual - 1];
    document.getElementById(telaAtual.id).style.display = 'none';
    document.getElementById(telaAnteriorId).style.display = 'block';
    
    // Marca o teste anterior para ser refeito
    var nomesMap = {testeConcentrada:'concentrada', testeSeletiva:'seletiva', testeDividida:'dividida', paginaTesteAlternado:'alternada', testeSustentada:'sustentada'};
    var testeAnterior = nomesMap[telaAnteriorId];
    if (testeAnterior && window.resultadosBAE[testeAnterior]) {
        registrarExecucao(testeAnterior, 'SERA_REFEITO', window.resultadosBAE[testeAnterior]);
        window.resultadosBAE[testeAnterior] = null;
        console.log('🔄 ' + testeAnterior + ' será refeito do zero');
    }
    
    // Reset visual e flags do teste anterior
    resetarEstadoVisualTeste(testeAnterior, telaAnteriorId);
    
    console.log(`⏮️ ${telaAtual.nome} → ${telaAnteriorId}`);
    mostrarBotoesNavegacao();
}

// ===== RESET VISUAL AO VOLTAR =====
function resetarEstadoVisualTeste(nomeTeste, telaId) {
    var btnProx = document.getElementById('proximoTesteDinamico');
    if (btnProx) btnProx.remove();
    
    if (nomeTeste === 'concentrada') {
        if (typeof testeJaFinalizadoConc !== 'undefined') testeJaFinalizadoConc = false;
        if (typeof isTestRunningConc !== 'undefined') isTestRunningConc = false;
        var quadro = document.getElementById('quadroConcentrada');
        if (quadro) quadro.innerHTML = '';
        var btn = document.getElementById('startConcentrada');
        if (btn) btn.style.display = 'block';
    } else if (nomeTeste === 'seletiva') {
        if (typeof testeJaFinalizado !== 'undefined') testeJaFinalizado = false;
        if (typeof isTestRunningSeletiva !== 'undefined') isTestRunningSeletiva = false;
        var btn = document.getElementById('startSeletiva');
        if (btn) btn.style.display = 'block';
        var animal = document.getElementById('animal');
        if (animal) animal.style.display = 'none';
    } else if (nomeTeste === 'dividida') {
        if (typeof testeJaFinalizadoDividida !== 'undefined') testeJaFinalizadoDividida = false;
        if (typeof isTesteDivididaRunning !== 'undefined') isTesteDivididaRunning = false;
        var quadro = document.getElementById('quadroDividida');
        if (quadro) quadro.innerHTML = '<div id="figuraDiv"></div>';
        var btn = document.getElementById('iniciarDividida');
        if (btn) btn.style.display = 'block';
    } else if (nomeTeste === 'alternada') {
        if (typeof testeAtivoAlternada !== 'undefined') testeAtivoAlternada = false;
        var quadro = document.getElementById('quadroAlternado');
        if (quadro) { quadro.innerHTML = '<div id="figuraEsquerda"></div><div id="figuraDireita"></div>'; quadro.style.background = ''; quadro.style.borderRadius = ''; quadro.style.boxShadow = ''; }
        var btn = document.getElementById('iniciarAlternado');
        if (btn) btn.style.display = 'block';
    } else if (nomeTeste === 'sustentada') {
        if (typeof testeAtivoSustentada !== 'undefined') testeAtivoSustentada = false;
        var quadro = document.getElementById('quadroSustentada');
        if (quadro) quadro.innerHTML = '';
        var btn = document.getElementById('iniciarSustentada');
        if (btn) btn.style.display = 'block';
    }
}

// ===== VISIBILIDADE DOS BOTÕES =====
function mostrarBotoesNavegacao() {
    if (window.dispositivoBAE && window.dispositivoBAE.isTouch) return;
    const botaoParar = document.querySelector('.botao-parar');
    const botaoBypass = document.querySelector('.botao-bypassar');
    const botaoVoltar = document.querySelector('.botao-voltar');

    if (botaoParar) botaoParar.style.display = 'block';
    if (botaoBypass) botaoBypass.style.display = 'block';

    if (botaoVoltar) {
        const telaAtual = detectarTelaAtual();
        const indice = telaAtual ? ordemTelas.indexOf(telaAtual.id) : -1;
        botaoVoltar.style.display = indice > 0 ? 'block' : 'none';
    }
}

function mostrarBotoesFixos() {
    if (window.dispositivoBAE && window.dispositivoBAE.isTouch) return;
    // Não mostra botões na tela inicial - só depois que um teste iniciar
}

function mostrarBotoesControle() {
    if (typeof configurarHoverBotoes === 'function') configurarHoverBotoes();
    mostrarBotoesNavegacao();
}
function esconderBotoesControle() {}

// ===== BOTÃO "PRÓXIMO TESTE" DINÂMICO =====
function criarBotaoProximoTeste(telaAtual, proximaTela) {
    const botaoExistente = document.getElementById('proximoTesteDinamico');
    if (botaoExistente) botaoExistente.remove();

    const botaoProximo = document.createElement('button');
    botaoProximo.id = 'proximoTesteDinamico';
    botaoProximo.className = 'botao-iniciar';
    botaoProximo.textContent = 'Próximo Teste';
    botaoProximo.style.margin = '20px auto';
    botaoProximo.style.display = 'block';

    botaoProximo.onclick = function() {
        const telaAtualEl = document.getElementById(telaAtual);
        const proximaTelaEl = document.getElementById(proximaTela);
        if (telaAtualEl) telaAtualEl.style.display = 'none';
        if (proximaTelaEl) proximaTelaEl.style.display = 'block';
        this.remove();
        // Esconde botões "Iniciar Teste" originais
        var botoesOriginais = ['startConcentrada','startSeletiva','iniciarDividida','iniciarAlternado','iniciarSustentada'];
        botoesOriginais.forEach(function(id) { var b = document.getElementById(id); if (b) b.style.display = 'none'; });
        // Inicia o próximo teste direto (pula a tela com botão "Iniciar Teste")
        switch(proximaTela) {
            case 'testeConcentrada': if (typeof startTesteConcentrada === 'function') startTesteConcentrada(); break;
            case 'testeSeletiva': if (typeof startTesteSeletiva === 'function') startTesteSeletiva(); break;
            case 'testeDividida': if (typeof iniciarTesteDividida === 'function') iniciarTesteDividida(); break;
            case 'paginaTesteAlternado': if (typeof iniciarTesteAlternado === 'function') iniciarTesteAlternado(); break;
            case 'testeSustentada': if (typeof iniciarTesteSustentada === 'function') iniciarTesteSustentada(); break;
        }
        mostrarBotoesNavegacao();
    };

    document.getElementById(telaAtual).appendChild(botaoProximo);
}

// ===== CRIAÇÃO DOS BOTÕES NO DOM =====
// Botões antigos removidos — sistema usa apenas botões hover (🛑⏭️⏮️📄)
function criarBotoesSeNaoExistirem() {}
function inicializarBotoes() {}
console.log('✅ Sistema de botões de navegação carregado!');
