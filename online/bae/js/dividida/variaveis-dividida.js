// ===== VARIÁVEIS GLOBAIS DO TESTE DE ATENÇÃO DIVIDIDA =====
const figurasDividida = ['estrela', 'quadrado', 'triangulo'];
const frequenciasSom = [200, 400, 800];

const alvoVisual = 'triangulo';
const alvoAuditivo = 400;

// Contadores
var acertosVisuaisDividida = 0;
var acertosAuditivosDividida = 0;
var errosVisuaisDividida = 0;
var errosAuditivosDividida = 0;
var omissoesVisuaisDividida = 0;
var omissoesAuditivasDividida = 0;
var perseveracoesDividida = 0;
var temposReacaoVisuaisDividida = [];
var temposReacaoAuditivosDividida = [];

// Controle
var isTesteDivididaRunning = false;
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
let sextantesDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
let acertosPorSextanteDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
let omissoesPorSextanteDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
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
    perseveracoesDividida = 0;
    temposReacaoVisuaisDividida = [];
    temposReacaoAuditivosDividida = [];
    sequenciaEstimulosDividida = [];
    respostaVisualDetectada = false;
    respostaAuditivaDetectada = false;
    sextantesDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    acertosPorSextanteDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    omissoesPorSextanteDividida = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    sextanteAtualDividida = '';
    currentEstimulo = 0;
}
