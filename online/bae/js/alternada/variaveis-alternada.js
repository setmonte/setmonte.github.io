// ===== VARIÁVEIS DO TESTE DE ATENÇÃO ALTERNADA =====
// Linha 1-30: Variáveis compartimentadas (sem IIFE)
// Ligadas com: atencao-alternada.js

// ===== CONTROLE DO TESTE =====
// Linha 6-10: Variáveis de controle principal
let testeAtivoAlternada = false;           // Controla se teste está rodando
let sequenciaTeste = [];          // Array com tipos de cada par (cor/forma/none)
let parAtual = 0;                 // Índice do par atual
let configTeste = null;           // Configuração baseada na idade

// ===== DADOS DAS FIGURAS =====
// Linha 12-14: Estruturas de dados das figuras
let figuraAtual = { forma1: '', forma2: '', cor1: '', cor2: '' };    // Par atual
let figuraAnterior = { forma1: '', forma2: '', cor1: '', cor2: '' }; // Par anterior (para comparação)

// ===== CONTADORES POR CATEGORIA =====
// Linha 17-20: Contadores específicos por tipo de alvo
let acertosCor = 0;      // Acertos em alvos de cor
let acertosForma = 0;    // Acertos em alvos de forma
let omissoesCor = 0;     // Omissões em alvos de cor (não respondeu)
let omissoesForma = 0;   // Omissões em alvos de forma (não respondeu)

// ===== CONTADORES GERAIS =====
// Linha 23-27: Contadores gerais e métricas
let totalAcertos = 0;        // Total de acertos normais
let acertosAmbivalentes = 0; // Acertos em casos ambivalentes (forma E cor iguais)
let totalErros = 0;          // Total de erros (apertou em não-alvos)
let totalOmissoes = 0;       // Total de omissões
let temposReacaoAlternada = [];       // Array com tempos de reação
let respostasRapidas = 0;    // Respostas < 200ms (reação rápida - alta performance)

// ===== CONTROLE DE RESPOSTA =====
// Linha 30-32: Variáveis de controle de interação
let aguardandoResposta = false;  // Se está esperando resposta do usuário
let tempoInicioResposta = 0;     // Timestamp do início da resposta

// Linha 34: Log de confirmação de carregamento
console.log('✅ Variáveis do Teste de Atenção Alternada carregadas!');