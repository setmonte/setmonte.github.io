// ===== VARIÁVEIS GLOBAIS DO TESTE DE ATENÇÃO CONCENTRADA =====
let trialDataConc = [];
let currentTrialConc = 0;
let trialsConc = [];
let canvasConc = null;
let ctxConc = null;
let isTestRunningConc = false;
let testeJaFinalizadoConc = false;

// Configuração fixa (canvas, cores)
const WIDTH_CONC = 800;
const HEIGHT_CONC = 600;
const COR_FUNDO_CONC = '#f0f0f0';
const COR_LINHA_CONC = 'black';
const ESPESSURA_LINHA_CONC = 3;

// Configuração dinâmica por idade (será definida em obterConfigConcentrada)
let CONFIG_CONC = null;

// ===== CONFIGURAÇÃO POR FAIXA ETÁRIA =====
// Baseado em Kail (1991) - velocidade de processamento por idade
// e Luce (1986) - distribuição dos tempos de reação
function obterConfigConcentrada() {
    const birthDate = localStorage.getItem('dataNascimento');
    let anos = 25; // padrão adulto
    if (birthDate) {
        const age = calcularIdade(birthDate);
        if (age) anos = age.years;
    }

    if (anos >= 6 && anos < 13) {
        // CRIANÇAS (6-12 anos 11 meses 29 dias)
        // Diferença maior (mais fácil), mais tempo para responder, menos tentativas
        return {
            faixa: 'crianca',
            idadeAnos: anos,
            numTrials: 40,              // 40 tentativas (menos fadiga)
            difference: 12,             // 12px diferença (mais perceptível)
            responseWindow: 2000,       // 2 segundos para responder
            fixationDuration: 600,      // 600ms cruz de fixação
            blankDuration: 800,         // 800ms entre tentativas
            baseLength: 100
        };
    } else if (anos >= 60) {
        // IDOSOS (60+ anos)
        // Diferença maior, mais tempo, menos tentativas (Kail, 1991 - declínio)
        return {
            faixa: 'idoso',
            idadeAnos: anos,
            numTrials: 40,              // 40 tentativas
            difference: 10,             // 10px diferença
            responseWindow: 2500,       // 2.5 segundos
            fixationDuration: 600,
            blankDuration: 800,
            baseLength: 100
        };
    } else {
        // ADULTOS (13-59 anos 11 meses 29 dias)
        // Diferença menor (mais difícil), tempo padrão
        return {
            faixa: 'adulto',
            idadeAnos: anos,
            numTrials: 60,              // 60 tentativas
            difference: 6,              // 6px diferença (discriminação fina)
            responseWindow: 1500,       // 1.5 segundos
            fixationDuration: 500,
            blankDuration: 600,
            baseLength: 100
        };
    }
}
