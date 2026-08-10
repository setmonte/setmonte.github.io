// ===== VARIÁVEIS GLOBAIS DO TESTE DE ATENÇÃO SELETIVA =====
const animais = ["leao", "pato", "elefante", "girafa", "cachorro"];
var acertosSeletiva = 0;
var errosSeletiva = 0;
let omissoesSeletiva = 0;
var perseveracoesSeletiva = 0;
var temposReacaoSeletiva = [];
let currentAnimal;
let startTimeSeletiva;
let intervalId;
let testDuration = 0;
var isTestRunningSeletiva = false;
let previousAnimal;
var totalLeoes = 0;
let firstCall = true;
let respondeuAnimalAnterior = false;
let testeJaFinalizado = false;
let CONFIG_SELETIVA = null;
let quadrantesSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
let acertosPorQuadranteSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
let omissoesPorSextanteSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
let quadranteAtualSeletiva = '';

// ===== CONFIGURAÇÃO POR FAIXA ETÁRIA =====
function obterConfigSeletiva() {
    const birthDate = localStorage.getItem('dataNascimento');
    let anos = 25;
    if (birthDate) {
        const age = calcularIdade(birthDate);
        if (age) anos = age.years;
    }

    if (anos >= 6 && anos < 13) {
        // CRIANÇAS (6-12 anos 11 meses 29 dias)
        return {
            faixa: 'crianca',
            idadeAnos: anos,
            duracaoSegundos: 4 * 60,        // 4 minutos
            intervaloAnimal: 1200,           // 1.2s entre animais (mais tempo)
            contagemRegressiva: 5,
            // Limiares para análise clínica
            limiarRTRapido: 500,
            limiarRTNormal: 750,
            limiarRTLento: 1000
        };
    } else if (anos >= 60) {
        // IDOSOS (60+)
        return {
            faixa: 'idoso',
            idadeAnos: anos,
            duracaoSegundos: 4 * 60,        // 4 minutos
            intervaloAnimal: 1300,           // 1.3s entre animais
            contagemRegressiva: 5,
            limiarRTRapido: 500,
            limiarRTNormal: 700,
            limiarRTLento: 950
        };
    } else {
        // ADULTOS (13-59 anos 11 meses 29 dias)
        return {
            faixa: 'adulto',
            idadeAnos: anos,
            duracaoSegundos: 4.5 * 60,      // 4 minutos e 30 segundos
            intervaloAnimal: 1000,           // 1s entre animais
            contagemRegressiva: 5,
            limiarRTRapido: 400,
            limiarRTNormal: 600,
            limiarRTLento: 800
        };
    }
}

// ===== RESET DE CONTADORES =====
function resetarContadoresSeletiva() {
    acertosSeletiva = 0;
    errosSeletiva = 0;
    omissoesSeletiva = 0;
    perseveracoesSeletiva = 0;
    temposReacaoSeletiva = [];
    totalLeoes = 0;
    firstCall = true;
    respondeuAnimalAnterior = false;
    testeJaFinalizado = false;
    previousAnimal = undefined;
    currentAnimal = undefined;
    quadrantesSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    acertosPorQuadranteSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    omissoesPorSextanteSeletiva = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0 };
    quadranteAtualSeletiva = '';
}
