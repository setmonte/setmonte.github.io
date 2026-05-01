// ===== SISTEMA DE DADOS SIMULADOS PARA TESTE DO PDF =====

// Função para gerar dados simulados realistas
function gerarDadosSimulados() {
    console.log('🎭 Gerando dados simulados para teste do PDF...');
    
    // Dados do paciente simulados
    window.resultadosBAE.paciente = {
        idTeste: 'PSIM-TEST',
        nome: 'João Silva Santos',
        idade: '28 anos, 3 meses e 15 dias',
        idadeAnos: 28,
        sexo: 'Masculino',
        cpf: '123.456.789-00',
        profissao: 'Engenheiro de Software',
        escolaridade: 'Superior Completo',
        lateralidade: 'Destro',
        hipoteseDiagnostica: 'Investigação de possível TDAH - dificuldades de concentração no trabalho',
        nomePsicologo: 'Dra. Maria Fernanda Costa',
        crp: 'CRP 06/123456',
        email: 'maria@email.com',
        telefone: '(11)99999-9999',
        dataAplicacao: new Date().toLocaleDateString('pt-BR')
    };
    
    // Resultados simulados - Atenção Concentrada
    window.resultadosBAE.concentrada = {
        acertos: 52,
        erros: 6,
        omissoes: 2,
        totalTentativas: 60,
        taxaAcerto: 86.7,
        tempoMedio: 485,
        variabilidadeRT: 125,
        temposReacao: [420, 510, 465, 390, 520, 445, 480, 505, 435, 470],
        duracaoTeste: 178,
        faixaEtaria: 'adulto',
        diferenciaLinhas: 6,
        janelaResposta: 1500,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Resultados simulados - Atenção Seletiva
    window.resultadosBAE.seletiva = {
        acertos: 28,
        erros: 4,
        omissoes: 3,
        totalLeoes: 31,
        taxaAcerto: 90.3,
        tempoMedio: 425,
        temposReacao: [380, 450, 410, 395, 460, 420, 435, 405, 445, 415],
        duracaoTeste: 268,
        faixaEtaria: 'adulto',
        intervaloAnimal: 1000,
        quadrantesLeoes: {S1: 5, S2: 6, S3: 5, S4: 5, S5: 5, S6: 5},
        acertosPorQuadrante: {S1: 5, S2: 5, S3: 4, S4: 5, S5: 4, S6: 5},
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Resultados simulados - Atenção Dividida
    window.resultadosBAE.dividida = {
        acertosVisuais: 12,
        acertosAuditivos: 11,
        errosVisuais: 2,
        errosAuditivos: 3,
        omissoesVisuais: 1,
        omissoesAuditivas: 1,
        totalAcertos: 23,
        taxaAcerto: 76.7,
        tempoMedio: 520,
        duracaoTeste: 298,
        faixaEtaria: 'adulto',
        intervaloEstimulo: 2000,
        sextantesDividida: {S1: 3, S2: 2, S3: 3, S4: 2, S5: 3, S6: 2},
        acertosPorSextante: {S1: 2, S2: 2, S3: 3, S4: 2, S5: 2, S6: 1},
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Resultados simulados - Atenção Alternada
    window.resultadosBAE.alternada = {
        acertos: 45,
        acertosCor: 20,
        acertosForma: 22,
        acertosAmbivalentes: 3,
        erros: 8,
        omissoes: 5,
        omissoesCor: 2,
        omissoesForma: 3,
        totalAlvos: 50,
        taxaAcerto: 90.0,
        tempoMedio: 650,
        totalPares: 300,
        faixaEtaria: 'adulto',
        intervalo: 1000,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Resultados simulados - Atenção Sustentada
    window.resultadosBAE.sustentada = {
        acertos: 85,
        erros: 7,
        omissoes: 12,
        totalAlvos: 97,
        taxaAcerto: 87.6,
        tempoMedio: 445,
        duracaoTeste: 598,
        negligencias: 3,
        impulsividade: 7,
        faixaEtaria: 'adulto',
        sextantes: {
            S1: {acertos: 15, omissoes: 2, negligencias: 1, alvos: 17},
            S2: {acertos: 14, omissoes: 2, negligencias: 0, alvos: 16},
            S3: {acertos: 14, omissoes: 2, negligencias: 1, alvos: 16},
            S4: {acertos: 14, omissoes: 2, negligencias: 0, alvos: 16},
            S5: {acertos: 14, omissoes: 2, negligencias: 1, alvos: 16},
            S6: {acertos: 14, omissoes: 2, negligencias: 0, alvos: 16}
        },
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Marca todos os testes como completos
    window.resultadosBAE.testesCompletos = {
        concentrada: true,
        seletiva: true,
        dividida: true,
        alternada: true,
        sustentada: true
    };
    
    // Simula análise da IA Observadora
    if (window.simularAnaliseIA) {
        window.simularAnaliseIA();
    }
    
    console.log('✅ Dados simulados gerados com sucesso!');
    console.log('📊 Dados disponíveis:', window.resultadosBAE);
}

// Função para gerar dados simulados com perfil TDAH
function gerarDadosSimuladosTDAH() {
    console.log('🎭 Gerando dados simulados com perfil TDAH...');
    
    // Dados do paciente
    window.resultadosBAE.paciente = {
        nome: 'Ana Carolina Oliveira',
        idade: 24,
        sexo: 'Feminino',
        profissao: 'Estudante Universitária',
        escolaridade: 'Superior Incompleto',
        lateralidade: 'Destra',
        hipotese: 'Suspeita de TDAH - dificuldades acadêmicas e desatenção',
        psicologo: 'Dr. Carlos Eduardo Mendes',
        crp: 'CRP 01/987654',
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR')
    };
    
    // Perfil TDAH - mais erros e omissões
    window.resultadosBAE.concentrada = {
        acertos: 38,
        erros: 15,
        omissoes: 7,
        totalTentativas: 60,
        taxaAcerto: 63.3,
        tempoMedio: 720,
        variabilidadeRT: 280,
        temposReacao: [650, 820, 590, 750, 680, 900, 620, 780, 710, 850],
        duracaoTeste: 180,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.seletiva = {
        acertos: 18,
        erros: 12,
        omissoes: 8,
        totalLeoes: 26,
        taxaAcerto: 69.2,
        tempoMedio: 580,
        temposReacao: [520, 640, 590, 610, 570, 650, 580, 620, 560, 600],
        duracaoTeste: 270,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.dividida = {
        acertosVisuais: 8,
        acertosAuditivos: 7,
        totalAcertos: 15,
        taxaAcerto: 50.0,
        tempoMedio: 680,
        duracaoTeste: 300,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.alternada = {
        acertos: 28,
        erros: 18,
        omissoes: 12,
        totalAlvos: 40,
        taxaAcerto: 70.0,
        tempoMedio: 850,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.sustentada = {
        acertos: 45,
        erros: 18,
        omissoes: 25,
        totalAlvos: 70,
        taxaAcerto: 64.3,
        tempoMedio: 520,
        duracaoTeste: 600,
        negligencias: 12,
        impulsividade: 18,
        fadigaDetectada: true,
        quadrantes: {Q1: 8, Q2: 15, Q3: 12, Q4: 10},
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Marca todos os testes como completos
    window.resultadosBAE.testesCompletos = {
        concentrada: true,
        seletiva: true,
        dividida: true,
        alternada: true,
        sustentada: true
    };
    
    console.log('✅ Dados simulados TDAH gerados com sucesso!');
}

// Função para gerar dados simulados com desempenho superior
function gerarDadosSimuladosSuperior() {
    console.log('🎭 Gerando dados simulados com desempenho superior...');
    
    // Dados do paciente
    window.resultadosBAE.paciente = {
        nome: 'Dr. Roberto Almeida Junior',
        idade: 35,
        sexo: 'Masculino',
        profissao: 'Médico Neurologista',
        escolaridade: 'Pós-graduação',
        lateralidade: 'Destro',
        hipotese: 'Avaliação de controle - profissional da área médica',
        psicologo: 'Dra. Patricia Santos Lima',
        crp: 'CRP 02/456789',
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR')
    };
    
    // Desempenho superior
    window.resultadosBAE.concentrada = {
        acertos: 58,
        erros: 2,
        omissoes: 0,
        totalTentativas: 60,
        taxaAcerto: 96.7,
        tempoMedio: 380,
        variabilidadeRT: 45,
        temposReacao: [360, 390, 375, 385, 370, 395, 365, 380, 375, 385],
        duracaoTeste: 180,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.seletiva = {
        acertos: 32,
        erros: 1,
        omissoes: 0,
        totalLeoes: 33,
        taxaAcerto: 97.0,
        tempoMedio: 350,
        temposReacao: [330, 360, 345, 355, 340, 365, 335, 350, 345, 355],
        duracaoTeste: 270,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.dividida = {
        acertosVisuais: 14,
        acertosAuditivos: 13,
        totalAcertos: 27,
        taxaAcerto: 90.0,
        tempoMedio: 420,
        duracaoTeste: 300,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.alternada = {
        acertos: 48,
        erros: 2,
        omissoes: 1,
        totalAlvos: 51,
        taxaAcerto: 94.1,
        tempoMedio: 480,
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    window.resultadosBAE.sustentada = {
        acertos: 95,
        erros: 2,
        omissoes: 3,
        totalAlvos: 98,
        taxaAcerto: 96.9,
        tempoMedio: 385,
        duracaoTeste: 600,
        negligencias: 1,
        impulsividade: 2,
        fadigaDetectada: false,
        quadrantes: {Q1: 24, Q2: 24, Q3: 23, Q4: 24},
        abandonado: false,
        statusTeste: 'CONCLUÍDO'
    };
    
    // Marca todos os testes como completos
    window.resultadosBAE.testesCompletos = {
        concentrada: true,
        seletiva: true,
        dividida: true,
        alternada: true,
        sustentada: true
    };
    
    console.log('✅ Dados simulados SUPERIOR gerados com sucesso!');
}

// Função para limpar dados simulados
function limparDadosSimulados() {
    window.resultadosBAE = {
        paciente: {
            nome: '',
            idade: 0,
            sexo: '',
            profissao: '',
            escolaridade: '',
            lateralidade: '',
            hipotese: '',
            psicologo: '',
            crp: '',
            data: '',
            hora: ''
        },
        concentrada: null,
        seletiva: null,
        dividida: null,
        alternada: null,
        sustentada: null,
        testesCompletos: {
            concentrada: false,
            seletiva: false,
            dividida: false,
            alternada: false,
            sustentada: false
        }
    };
    console.log('🧹 Dados simulados limpos!');
}

// Disponibiliza funções globalmente
window.gerarDadosSimulados = gerarDadosSimulados;
window.gerarDadosSimuladosTDAH = gerarDadosSimuladosTDAH;
window.gerarDadosSimuladosSuperior = gerarDadosSimuladosSuperior;
window.limparDadosSimulados = limparDadosSimulados;

console.log('🎭 Sistema de dados simulados carregado!');
console.log('📋 Funções disponíveis:');
console.log('  • gerarDadosSimulados() - Perfil normal');
console.log('  • gerarDadosSimuladosTDAH() - Perfil TDAH');
console.log('  • gerarDadosSimuladosSuperior() - Perfil superior');
console.log('  • limparDadosSimulados() - Limpa dados');