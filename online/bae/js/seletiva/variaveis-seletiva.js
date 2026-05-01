// ===== VARIÁVEIS GLOBAIS DO TESTE DE ATENÇÃO SELETIVA =====
const animais = ["leao", "pato", "elefante", "girafa", "cachorro"];
let acertosSeletiva = 0;
let errosSeletiva = 0;
let omissoesSeletiva = 0;
let temposReacaoSeletiva = [];
let currentAnimal;
let startTimeSeletiva;
let intervalId;
let testDuration = 0;
let isTestRunningSeletiva = false;
let previousAnimal;
let totalLeoes = 0;
let firstCall = true;
let respondeuAnimalAnterior = false;
let testeJaFinalizado = false;
let CONFIG_SELETIVA = null;
let quadrantesSeletiva = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
let acertosPorQuadranteSeletiva = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
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
    temposReacaoSeletiva = [];
    totalLeoes = 0;
    firstCall = true;
    respondeuAnimalAnterior = false;
    testeJaFinalizado = false;
    previousAnimal = undefined;
    currentAnimal = undefined;
    quadrantesSeletiva = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
    acertosPorQuadranteSeletiva = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
    quadranteAtualSeletiva = '';
}
