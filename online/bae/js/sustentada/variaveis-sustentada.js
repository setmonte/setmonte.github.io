// ===== VARIÁVEIS DO TESTE DE ATENÇÃO SUSTENTADA =====
// Linha 1-50: Variáveis compartimentadas (sem IIFE)
// Ligadas com: atencao-sustentada.js

// ===== CONTROLE DO TESTE =====
// Linha 6-12: Variáveis de controle principal
var testeAtivoSustentada = false;
let inicioTeste = 0;
let fimTeste = 0;
let estimuloAtual = null;
let tipoEstimuloAtual = '';
let tempoInicioEstimulo = 0;
let respostaDetectadaSustentada = false;

// ===== CONFIGURAÇÃO DO TESTE =====
// Linha 15-20: Configurações baseadas na idade
let duracaoTeste = 0; // 6min (<13 anos) ou 10min (13+ anos)
let tempoExposicao = 1000; // 1 segundo por estímulo
let tempoIntervalo = 1000; // 1 segundo entre estímulos
let alvo = 'quadrado'; // Quadrado AMARELO pequeno
let distrator = 'circulo'; // Círculo VERMELHO grande

// ===== CONTADORES =====
// Linha 23-30: Contadores de estímulos e resultados
let totalEstimulos = 0;
var estimulosAlvo = 0;
let estimulosDistrator = 0;
var acertos = 0; // 200-650ms
let acertosComprometidos = 0; // 651-1000ms
var negligencias = 0; // 1001-2000ms
var omissoes = 0; // >2000ms
var respostasImpulsivas = 0; // Apertar no distrator

// ===== ARRAYS DE TEMPOS =====
// Linha 33-37: Arrays para análise temporal
var temposReacaoSustentada = [];
let temposAcertosComprometidos = [];
let temposNegligencias = [];
let todosTemposReacao = [];
var respostasOpositorias = 0;

// ===== CONTROLE DE SEXTANTES =====
let sextantesUsados = [];
let contadorSextantes = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
let posicoesUsadas = { S1: [], S2: [], S3: [], S4: [], S5: [], S6: [] };
let desempenhoPorSextante = {
    S1: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
    S2: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
    S3: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
    S4: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
    S5: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
    S6: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 }
};

// ===== SEQUÊNCIA E CONTROLE =====
// Linha 53-58: Sequência de estímulos e controle temporal
let sequenciaEstimulosSustentada = [];
let intervalosAleatoriosSustentada = [];
let ultimoAlvoTempo = 0;
let respostasVazioConsecutivas = 0;
let posicaoAtual = null;
let CONFIG_SUSTENTADA = null;

function obterConfigSustentada() {
    var birthDate = localStorage.getItem('dataNascimento');
    var anos = 25;
    if (birthDate) {
        var age = calcularIdade(birthDate);
        if (age) anos = age.years;
    }
    if (anos >= 6 && anos < 13) {
        return {
            faixa: 'crianca', idadeAnos: anos,
            duracaoMs: 6 * 60 * 1000,
            limiarAcerto: 800, limiarComprometido: 1200, limiarNegligencia: 2000,
            limiarRTRapido: 500, limiarRTNormal: 800, limiarRTLento: 1200
        };
    } else if (anos >= 60) {
        return {
            faixa: 'idoso', idadeAnos: anos,
            duracaoMs: 6 * 60 * 1000,
            limiarAcerto: 800, limiarComprometido: 1200, limiarNegligencia: 2500,
            limiarRTRapido: 500, limiarRTNormal: 750, limiarRTLento: 1100
        };
    } else {
        return {
            faixa: 'adulto', idadeAnos: anos,
            duracaoMs: 10 * 60 * 1000,
            limiarAcerto: 650, limiarComprometido: 1000, limiarNegligencia: 2000,
            limiarRTRapido: 400, limiarRTNormal: 600, limiarRTLento: 900
        };
    }
}

function resetarContadoresSustentada() {
    totalEstimulos = 0;
    estimulosAlvo = 0;
    estimulosDistrator = 0;
    acertos = 0;
    acertosComprometidos = 0;
    negligencias = 0;
    omissoes = 0;
    respostasImpulsivas = 0;
    respostasOpositorias = 0;
    temposReacaoSustentada = [];
    temposAcertosComprometidos = [];
    temposNegligencias = [];
    todosTemposReacao = [];
    sequenciaEstimulosSustentada = [];
    intervalosAleatoriosSustentada = [];
    sextantesUsados = [];
    contadorSextantes = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
    posicoesUsadas = { S1: [], S2: [], S3: [], S4: [], S5: [], S6: [] };
    desempenhoPorSextante = {
        S1: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
        S2: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
        S3: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
        S4: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
        S5: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 },
        S6: { acertos: 0, omissoes: 0, negligencias: 0, alvos: 0 }
    };
    ultimoAlvoTempo = 0;
    respostasVazioConsecutivas = 0;
    posicaoAtual = null;
}

// Linha 60: Log de confirmação de carregamento
console.log('✅ Variáveis do Teste de Atenção Sustentada carregadas!');