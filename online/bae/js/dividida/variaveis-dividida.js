// ===== VARIÁVEIS GLOBAIS DO TESTE DE ATENÇÃO DIVIDIDA =====
const figurasDividida = ['estrela', 'quadrado', 'triangulo'];
const frequenciasSom = [200, 400, 800];

const alvoVisual = 'triangulo';
const alvoAuditivo = 400;

// Contadores
let acertosVisuaisDividida = 0;
let acertosAuditivosDividida = 0;
let errosVisuaisDividida = 0;
let errosAuditivosDividida = 0;
let omissoesVisuaisDividida = 0;
let omissoesAuditivasDividida = 0;
let temposReacaoVisuaisDividida = [];
let temposReacaoAuditivosDividida = [];

// Controle
let isTesteDivididaRunning = false;
let currentEstimulo = 0;
let totalEstimulosDividida = 0;
let startTimeDividida = 0;
let intervalDividida = null;
let figuraAtualDividida = '';
let somAtualDividida = 0;
let respostaVisualDetectada = false;
let respostaAuditivaDetectada = false;
let sequenciaEstimulosDividida = [];
let CONFIG_DIVIDIDA = null;
let sextantesDividida = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
let acertosPorSextanteDividida = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
let sextanteAtualDividida = '';

// ===== CONFIGURAÇÃO POR FAIXA ETÁRIA =====
// Kahneman (1973) - teoria da capacidade atencional
// Parasuraman (1998) - atenção dividida e processamento dual
function obterConfigDividida() {
    const birthDate = localStorage.getItem('dataNascimento');
    let anos = 25;
    if (birthDate) {
        const age = calcularIdade(birthDate);
        if (age) anos = age.years;
    }

    if (anos >= 6 && anos < 13) {
        return {
            faixa: 'crianca',
            idadeAnos: anos,
            duracaoSegundos: 3 * 60,        // 3 minutos
            intervaloEstimulo: 2500,         // 2.5s entre estímulos
            tempoExposicao: 1200,            // 1.2s visível
            limiarRTRapido: 600,
            limiarRTNormal: 900,
            limiarRTLento: 1300
        };
    } else if (anos >= 60) {
        return {
            faixa: 'idoso',
            idadeAnos: anos,
            duracaoSegundos: 3 * 60,
            intervaloEstimulo: 2800,
            tempoExposicao: 1400,
            limiarRTRapido: 600,
            limiarRTNormal: 850,
            limiarRTLento: 1200
        };
    } else {
        return {
            faixa: 'adulto',
            idadeAnos: anos,
            duracaoSegundos: 5 * 60,         // 5 minutos
            intervaloEstimulo: 2000,          // 2s entre estímulos
            tempoExposicao: 1000,             // 1s visível
            limiarRTRapido: 500,
            limiarRTNormal: 750,
            limiarRTLento: 1100
        };
    }
}

// ===== RESET =====
function resetarContadoresDividida() {
    acertosVisuaisDividida = 0;
    acertosAuditivosDividida = 0;
    errosVisuaisDividida = 0;
    errosAuditivosDividida = 0;
    omissoesVisuaisDividida = 0;
    omissoesAuditivasDividida = 0;
    temposReacaoVisuaisDividida = [];
    temposReacaoAuditivosDividida = [];
    sequenciaEstimulosDividida = [];
    respostaVisualDetectada = false;
    respostaAuditivaDetectada = false;
    sextantesDividida = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
    acertosPorSextanteDividida = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
    sextanteAtualDividida = '';
    currentEstimulo = 0;
}
