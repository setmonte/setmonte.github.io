// ===== IA OBSERVADORA HÍBRIDA - BAE2 =====
// Sistema de análise progressiva baseado em evidências científicas
// Não modifica testes existentes - apenas observa e aprende

// ===== VARIÁVEIS GLOBAIS DA IA =====
window.iaObservadora = {
    perfil: {
        testesRealizados: 0,
        padroes: {},
        probabilidades: {
            TDAH: 0.15,      // Prevalência populacional base
            TDI: 0.05,       // Prevalência populacional base
            Normal: 0.70,    // Funcionamento típico
            Ansiedade: 0.10  // Transtornos ansiosos
        },
        alertas: [],
        confianca: 0,
        diagnosticoSugerido: null
    }
};

// ===== FUNÇÃO PRINCIPAL - OBSERVA RESULTADO DE TESTE =====
function iaObservarTeste(nomeTeste, dados) {
    console.log(`🤖 IA observando resultado do teste: ${nomeTeste}`);
    
    const ia = window.iaObservadora;
    ia.perfil.testesRealizados++;
    
    // Analisa padrões do teste atual
    const padraoAtual = analisarPadraoTeste(nomeTeste, dados);
    ia.perfil.padroes[nomeTeste] = padraoAtual;
    
    // Atualiza probabilidades (Bayesian updating)
    atualizarProbabilidades(padraoAtual);
    
    // Gera alertas progressivos
    gerarAlertaProgressivo();
    
    // Log para debug
    console.log(`📊 Padrão detectado:`, padraoAtual);
    console.log(`📈 Probabilidades atualizadas:`, ia.perfil.probabilidades);
    
    return ia.perfil;
}

// ===== ANÁLISE DE PADRÕES POR TESTE =====
function analisarPadraoTeste(nomeTeste, dados) {
    // Detecta modo de entrada do teste
    var resumoModo = dados.modoEntrada || (window.dispositivoBAE ? window.dispositivoBAE.obterResumo(nomeTeste) : null);
    var isTouch = resumoModo && resumoModo.touch > 0 && resumoModo.teclado === 0;
    var isMisto = resumoModo && resumoModo.touch > 0 && resumoModo.teclado > 0;
    var alternancias = resumoModo ? (resumoModo.alternanciasModo || 0) : 0;

    const padrao = {
        velocidade: classificarVelocidade(dados.tempoMedio || 0, isTouch),
        precisao: classificarPrecisao(dados.taxaAcerto || 0),
        consistencia: calcularConsistencia(dados),
        fadiga: detectarFadiga(dados),
        impulsividade: detectarImpulsividade(dados, isTouch),
        negligencia: detectarNegligencia(dados),
        modoEntrada: isTouch ? 'touch' : isMisto ? 'misto' : 'teclado',
        alternanciasModo: alternancias
    };
    
    return padrao;
}

// ===== CLASSIFICADORES BASEADOS EM LITERATURA =====
// Ajustados por faixa etária (Kail, 1991; Luce, 1986)
function obterFaixaEtariaIA() {
    const birthDate = localStorage.getItem('dataNascimento');
    if (!birthDate) return 'adulto';
    const age = typeof calcularIdade === 'function' ? calcularIdade(birthDate) : null;
    if (!age) return 'adulto';
    if (age.years < 13) return 'crianca';
    if (age.years >= 60) return 'idoso';
    return 'adulto';
}

function classificarVelocidade(tempoMedio, isTouch) {
    const faixa = obterFaixaEtariaIA();
    // Limiares ajustados: criança e idoso têm processamento mais lento (Kail, 1991)
    const limiares = {
        crianca: { muitoRapida: 500, rapida: 750, normal: 1000, lenta: 1500 },
        adulto:  { muitoRapida: 400, rapida: 600, normal: 800,  lenta: 1200 },
        idoso:   { muitoRapida: 500, rapida: 700, normal: 950,  lenta: 1400 }
    };
    const l = limiares[faixa];
    // Touch: +100ms nos limiares (diferença média teclado vs touch: 50-150ms)
    var ajuste = isTouch ? 100 : 0;
    if (tempoMedio < l.muitoRapida + ajuste) return 'MUITO_RAPIDA';
    if (tempoMedio < l.rapida + ajuste) return 'RAPIDA';
    if (tempoMedio < l.normal + ajuste) return 'NORMAL';
    if (tempoMedio < l.lenta + ajuste) return 'LENTA';
    return 'MUITO_LENTA';
}

function classificarPrecisao(taxaAcerto) {
    if (taxaAcerto >= 90) return 'EXCELENTE';
    if (taxaAcerto >= 80) return 'BOA';
    if (taxaAcerto >= 70) return 'ADEQUADA';
    if (taxaAcerto >= 60) return 'BAIXA';
    return 'MUITO_BAIXA';
}

function calcularConsistencia(dados) {
    // Análise simples baseada na variabilidade
    const tempoMedio = dados.tempoMedio || 0;
    const erros = dados.erros || 0;
    const acertos = dados.acertos || 0;
    
    if (erros === 0 && acertos > 10) return 'ALTA';
    if (erros < acertos * 0.1) return 'BOA';
    if (erros < acertos * 0.2) return 'MODERADA';
    return 'BAIXA';
}

function detectarFadiga(dados) {
    // Detecta se há sinais de fadiga cognitiva
    return dados.fadigaDetectada || (dados.omissoes || 0) > (dados.totalAlvos || 0) * 0.3;
}

function detectarImpulsividade(dados, isTouch) {
    const faixa = obterFaixaEtariaIA();
    var limiarRapido = faixa === 'crianca' ? 500 : faixa === 'idoso' ? 500 : 400;
    if (isTouch) limiarRapido += 100;
    const tempoMedio = dados.tempoMedio || 0;
    const erros = dados.erros || 0;
    return tempoMedio < limiarRapido && erros > 5;
}

function detectarNegligencia(dados) {
    // Detecta negligência espacial
    return dados.negligencias && dados.negligencias > 3;
}

// ===== ATUALIZAÇÃO BAYESIANA DE PROBABILIDADES =====
function atualizarProbabilidades(padrao) {
    const ia = window.iaObservadora;
    const prob = ia.perfil.probabilidades;
    
    // Fatores de likelihood baseados em literatura científica
    const fatores = calcularFatoresLikelihood(padrao);
    
    // Atualização Bayesiana simplificada
    Object.keys(prob).forEach(diagnostico => {
        const fator = fatores[diagnostico] || 1.0;
        prob[diagnostico] = Math.min(0.95, prob[diagnostico] * fator);
    });
    
    // Normalização para manter soma = 1
    const soma = Object.values(prob).reduce((a, b) => a + b, 0);
    Object.keys(prob).forEach(key => {
        prob[key] = prob[key] / soma;
    });
    
    // Calcula confiança do diagnóstico mais provável
    ia.perfil.confianca = Math.max(...Object.values(prob));
    ia.perfil.diagnosticoSugerido = Object.keys(prob).reduce((a, b) => 
        prob[a] > prob[b] ? a : b
    );
}

// ===== CÁLCULO DE FATORES DE LIKELIHOOD =====
function calcularFatoresLikelihood(padrao) {
    const fatores = {
        TDAH: 1.0,
        TDI: 1.0,
        Normal: 1.0,
        Ansiedade: 1.0
    };
    
    // Velocidade
    if (padrao.velocidade === 'MUITO_RAPIDA') {
        fatores.TDAH *= 2.5;  // Impulsividade
        fatores.Normal *= 0.3;
    } else if (padrao.velocidade === 'MUITO_LENTA') {
        fatores.TDI *= 3.0;   // Lentificação cognitiva
        fatores.Normal *= 0.2;
    }
    
    // Precisão
    if (padrao.precisao === 'MUITO_BAIXA') {
        fatores.TDAH *= 2.0;
        fatores.TDI *= 2.5;
        fatores.Normal *= 0.1;
    } else if (padrao.precisao === 'EXCELENTE') {
        fatores.Normal *= 2.0;
        fatores.TDAH *= 0.5;
    }
    
    // Impulsividade
    if (padrao.impulsividade) {
        fatores.TDAH *= 3.0;
        fatores.Normal *= 0.3;
    }
    
    // Fadiga
    if (padrao.fadiga) {
        fatores.TDAH *= 1.8;
        fatores.Ansiedade *= 2.0;
        fatores.Normal *= 0.4;
    }
    
    // Negligência
    if (padrao.negligencia) {
        fatores.TDI *= 2.0;
        fatores.Normal *= 0.3;
    }
    
    // Alternância de modo teclado/touch (indicador de inquietação motora)
    if (padrao.alternanciasModo > 5) {
        fatores.TDAH *= 1.5;  // Inquietação motora (Barkley, 1997)
        fatores.Normal *= 0.7;
    }
    
    return fatores;
}

// ===== GERAÇÃO DE ALERTAS PROGRESSIVOS =====
function gerarAlertaProgressivo() {
    const ia = window.iaObservadora;
    const testes = ia.perfil.testesRealizados;
    const prob = ia.perfil.probabilidades;
    const confianca = ia.perfil.confianca;
    const diagnostico = ia.perfil.diagnosticoSugerido;
    
    let alerta = null;
    
    // Alertas baseados no número de testes e confiança
    if (testes === 2 && confianca > 0.6) {
        alerta = gerarTextoAlerta(diagnostico, confianca, 'INICIAL');
    } else if (testes === 3 && confianca > 0.75) {
        alerta = gerarTextoAlerta(diagnostico, confianca, 'PROVAVEL');
    } else if (testes >= 4 && confianca > 0.85) {
        alerta = gerarTextoAlerta(diagnostico, confianca, 'CONFIRMADO');
    }
    
    if (alerta) {
        ia.perfil.alertas.push({
            teste: testes,
            confianca: Math.round(confianca * 100),
            diagnostico: diagnostico,
            texto: alerta,
            timestamp: new Date().toLocaleString('pt-BR')
        });
        
        // Exibe alerta no console (pode ser adaptado para UI)
        console.log(`🚨 ALERTA IA (${Math.round(confianca * 100)}%):`, alerta);
    }
}

// ===== GERAÇÃO DE TEXTOS CLÍNICOS =====
function gerarTextoAlerta(diagnostico, confianca, nivel) {
    const percentual = Math.round(confianca * 100);
    
    const textos = {
        TDAH: {
            INICIAL: `Padrão inicial sugere possível TDAH (${percentual}% confiança). Observar impulsividade e desatenção nos próximos testes.`,
            PROVAVEL: `Os testes executados revelam padrão compatível com TDAH (${percentual}% confiança). Recomenda-se continuar para confirmação.`,
            CONFIRMADO: `Padrão consistente altamente compatível com TDAH (${percentual}% confiança). Sugestão: avaliação clínica complementar.`
        },
        TDI: {
            INICIAL: `Detectada lentificação cognitiva (${percentual}% confiança). Investigar possível Transtorno do Desenvolvimento Intelectual.`,
            PROVAVEL: `Os testes executados até aqui revelam padrão de lentidão de reação compatível com hipótese diagnóstica de TDI (${percentual}% confiança). Contudo, há necessidade de maior esclarecimento.`,
            CONFIRMADO: `Padrão consistente de déficits cognitivos (${percentual}% confiança). Recomenda-se avaliação de QI e funcionamento adaptativo.`
        },
        Normal: {
            INICIAL: `Performance dentro da normalidade (${percentual}% confiança). Continuar monitoramento.`,
            PROVAVEL: `Funcionamento atencional adequado (${percentual}% confiança). Perfil compatível com desenvolvimento típico.`,
            CONFIRMADO: `Funcionamento cognitivo dentro da normalidade (${percentual}% confiança). Capacidades atencionais preservadas.`
        },
        Ansiedade: {
            INICIAL: `Sinais de ansiedade interferindo na performance (${percentual}% confiança). Observar fadiga e inconsistência.`,
            PROVAVEL: `Padrão sugestivo de interferência ansiosa (${percentual}% confiança). Considerar manejo de ansiedade antes da reabilitação.`,
            CONFIRMADO: `Ansiedade significativamente impactando performance (${percentual}% confiança). Intervenção psicológica recomendada.`
        }
    };
    
    return textos[diagnostico]?.[nivel] || `Padrão detectado: ${diagnostico} (${percentual}% confiança)`;
}

// ===== INTEGRAÇÃO COM SISTEMA EXISTENTE =====
// Intercepta salvamento de resultados para análise da IA
const salvarResultadoOriginal = window.salvarResultadoTeste;
window.salvarResultadoTeste = function(nomeTeste, dados) {
    // Chama função original
    if (salvarResultadoOriginal) {
        salvarResultadoOriginal(nomeTeste, dados);
    }
    
    // IA observa o resultado
    iaObservarTeste(nomeTeste, dados);
};

// ===== FUNÇÃO PARA OBTER RELATÓRIO DA IA =====
function obterRelatorioIA() {
    const ia = window.iaObservadora;
    return {
        testesAnalisados: ia.perfil.testesRealizados,
        diagnosticoSugerido: ia.perfil.diagnosticoSugerido,
        confianca: Math.round(ia.perfil.confianca * 100),
        probabilidades: Object.fromEntries(
            Object.entries(ia.perfil.probabilidades).map(([k, v]) => [k, Math.round(v * 100)])
        ),
        alertas: ia.perfil.alertas,
        padroes: ia.perfil.padroes
    };
}

// ===== FUNÇÃO PARA RESET DA IA =====
function resetIA() {
    window.iaObservadora.perfil = {
        testesRealizados: 0,
        padroes: {},
        probabilidades: {
            TDAH: 0.15,
            TDI: 0.05,
            Normal: 0.70,
            Ansiedade: 0.10
        },
        alertas: [],
        confianca: 0,
        diagnosticoSugerido: null
    };
    console.log('🤖 IA Observadora resetada');
}

// ===== DISPONIBILIZA FUNÇÕES GLOBALMENTE =====
window.iaObservarTeste = iaObservarTeste;
window.obterRelatorioIA = obterRelatorioIA;
window.resetIA = resetIA;

console.log('🤖 IA Observadora Híbrida carregada - Sistema BAE 2.4.0');
console.log('📚 Baseada em: Kail (1991), Luce (1986), Ratcliff (1978), Weiss & Kingsbury (1984), Nickerson (2002)');