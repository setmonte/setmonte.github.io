// ===== SISTEMA DE GERAÇÃO DE PDF COM PDFMAKE =====
// Sistema que gera PDF diretamente com nome personalizado

// Variáveis globais para coleta de dados
window.resultadosBAE = window.resultadosBAE || {};
window.dadosPaciente = window.dadosPaciente || {};

// ===== FUNÇÃO PARA SALVAR RESULTADO DE TESTE =====
function salvarResultadoTeste(nomeTeste, dados) {
    console.log(`📊 Salvando resultado do teste: ${nomeTeste}`);
    window.resultadosBAE[nomeTeste] = dados;
    console.log(`✅ Resultado salvo:`, dados);
}

// ===== FUNÇÃO PARA CAPTURAR DADOS DO PACIENTE =====
function capturarDadosPaciente() {
    if (!window.resultadosBAE) {
        window.resultadosBAE = { paciente: {}, testesCompletos: {} };
    }
    
    // Se já tem dados válidos salvos, retorna sem tentar ler DOM
    if (window.resultadosBAE.paciente?.nome && window.resultadosBAE.paciente.nome !== 'Não informado') {
        return window.resultadosBAE.paciente;
    }
    
    // Captura do DOM (só funciona quando formulário está visível)
    const nome = document.getElementById('nome')?.value;
    if (!nome) {
        // Formulário não visível, retorna o que tiver
        return window.resultadosBAE.paciente || {};
    }
    
    const dados = {
        idTeste: (typeof gerarIdTeste === 'function' ? gerarIdTeste() : '') || window._idTeste || '',
        nome: nome || 'Não informado',
        dataNascimento: document.getElementById('dataNascimento')?.value || 'Não informado',
        sexo: document.querySelector('input[name="sexo"]:checked')?.value || 'Não informado',
        cpf: document.getElementById('cpf')?.value || 'Não informado',
        profissao: document.getElementById('profissao')?.value || 'Não informado',
        escolaridade: document.getElementById('escolaridade')?.value || 'Não informado',
        lateralidade: document.getElementById('lateralidade')?.value || 'Não informado',
        observacoes: document.getElementById('observacoes')?.value || 'Não informado',
        nomePsicologo: document.getElementById('nomePsicologo')?.value || 'Não informado',
        crp: document.getElementById('crp')?.value || 'Não informado',
        email: document.getElementById('email')?.value || 'Não informado',
        telefone: document.getElementById('telefone')?.value || 'Não informado',
        dataAplicacao: new Date().toLocaleDateString('pt-BR')
    };
    
    // Calcula idade
    if (dados.dataNascimento && dados.dataNascimento !== 'Não informado') {
        const age = calcularIdade(dados.dataNascimento);
        if (age) {
            dados.idade = `${age.years} anos, ${age.months} meses e ${age.days} dias`;
            dados.idadeAnos = age.years;
        }
    }
    
    window.resultadosBAE.paciente = dados;
    window.dadosPaciente = dados;
    console.log('📋 Dados do paciente capturados:', dados.nome, '| ID:', dados.idTeste);
    return dados;
}

// ===== FUNÇÃO PARA GERAR ANÁLISE DA IA =====
function gerarAnaliseIAObservadora() {
    const relatorioIA = window.obterRelatorioIA ? window.obterRelatorioIA() : null;
    
    if (!relatorioIA || relatorioIA.alertas.length === 0) {
        return [];
    }
    
    return [
        {
            text: 'ANÁLISE DA IA OBSERVADORA',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
        },
        {
            text: `Confiabilidade: ${relatorioIA.confianca}% | Testes analisados: ${relatorioIA.testesAnalisados}`,
            style: 'subtitle',
            margin: [0, 0, 0, 10]
        },
        {
            text: 'Alertas Detectados:',
            style: 'testTitle',
            margin: [0, 0, 0, 5]
        },
        {
            ul: relatorioIA.alertas.map(alerta => 
                `${alerta.teste.toUpperCase()} (${alerta.confianca}%): ${alerta.texto}`
            ),
            margin: [0, 0, 0, 10]
        },
        {
            text: `Diagnóstico Sugerido: ${relatorioIA.diagnosticoSugerido}`,
            style: 'testTitle',
            margin: [0, 10, 0, 5]
        },
        {
            text: 'Probabilidades Diagnósticas:',
            style: 'testTitle',
            margin: [0, 10, 0, 5]
        },
        {
            ul: Object.entries(relatorioIA.probabilidades)
                .sort(([,a], [,b]) => b - a)
                .map(([diag, prob]) => `${diag}: ${prob}%`),
            margin: [0, 0, 0, 15]
        }
    ];
}

// ===== FUNÇÃO PARA GERAR GRÁFICO =====
function gerarGraficoPerformance(testesRealizados, resultados) {
    return new Promise((resolve) => {
        // Cria canvas temporário
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        document.body.appendChild(canvas);
        
        const titulosTestes = {
            'concentrada': 'Concentrada',
            'seletiva': 'Seletiva', 
            'dividida': 'Dividida',
            'alternada': 'Alternada',
            'sustentada': 'Sustentada'
        };
        
        const labels = testesRealizados.map(teste => titulosTestes[teste] || teste);
        const taxas = testesRealizados.map(teste => resultados[teste].taxaAcerto || 0);
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Taxa de Acerto (%)',
                    data: taxas,
                    backgroundColor: ['#dc3545', '#3498db', '#28a745', '#ffc107', '#6c757d'],
                    borderColor: ['#c82333', '#2980b9', '#218838', '#e0a800', '#5a6268'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Performance por Domínio Atencional'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Taxa de Acerto (%)'
                        }
                    }
                }
            }
        });
        
        // Converte para imagem após renderizar
        setTimeout(() => {
            try {
                const imageData = canvas.toDataURL('image/png');
                document.body.removeChild(canvas);
                console.log('✅ Gráfico gerado com sucesso');
                resolve(imageData);
            } catch (error) {
                console.error('❌ Erro ao gerar gráfico:', error);
                document.body.removeChild(canvas);
                resolve(null);
            }
        }, 500);
    });
}

// ===== FUNÇÃO PARA GERAR PDF =====
async function gerarRelatorioPDF() {
    try {
        // Inicializa estrutura se não existir
        if (!window.resultadosBAE) {
            window.resultadosBAE = { paciente: {} };
        }
        
        // Captura dados do paciente
        const paciente = window.resultadosBAE.paciente || {};
        const resultados = window.resultadosBAE || {};
        
        // Filtra apenas os testes (exclui 'paciente' e 'testesCompletos')
        const testesRealizados = Object.keys(resultados).filter(key => 
            key !== 'paciente' && key !== 'testesCompletos' && resultados[key] !== null
        );
        
        if (testesRealizados.length === 0) {
            alert('Nenhum teste foi realizado ainda. Execute pelo menos um teste antes de gerar o relatório.\\n\\nPara testar, use no console:\\ngerarDadosSimulados()');
            return;
        }
        
        console.log('📄 Gerando PDF com dados:', { 
            paciente: paciente?.nome || 'Não definido', 
            testes: Object.keys(resultados).filter(k => k !== 'paciente' && k !== 'testesCompletos')
        });
        
        // Gera nome do arquivo no formato solicitado
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const hora = String(agora.getHours()).padStart(2, '0');
        const minuto = String(agora.getMinutes()).padStart(2, '0');
        
        const nomeArquivo = `BAE2.3_${(paciente.nome || 'PACIENTE').replace(/\\s+/g, '_').toUpperCase()}_${ano}${mes}${dia}${hora}${minuto}.pdf`;
    
    // Tenta gerar laudo com IA (com aviso visual)
    var laudoIA = null;
    if (typeof BAEAI !== 'undefined' && BAEAI.gerarLaudo) {
        // Mostra aviso
        var avisoIA = document.createElement('div');
        avisoIA.id = 'avisoIA';
        avisoIA.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#2c3e50;color:white;padding:30px 40px;border-radius:12px;z-index:99999;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.5);font-family:Arial,sans-serif;';
        avisoIA.innerHTML = '<div style="font-size:32px;margin-bottom:15px;">🤖</div><div style="font-size:16px;margin-bottom:10px;">Gerando análise clínica com IA...</div><div style="font-size:12px;color:#aaa;margin-bottom:15px;">Isso pode levar até 30 segundos</div><button id="pularIA" style="padding:8px 20px;background:#e74c3c;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px;">Pular e gerar PDF sem IA</button>';
        document.body.appendChild(avisoIA);
        
        var pulou = false;
        document.getElementById('pularIA').onclick = function() { pulou = true; };
        
        try {
            var aiTimeout = new Promise(function(_, reject) { setTimeout(function() { reject('timeout'); }, 30000); });
            var aiPular = new Promise(function(_, reject) {
                var check = setInterval(function() { if (pulou) { clearInterval(check); reject('pulou'); } }, 200);
            });
            var aiPromise = BAEAI.gerarLaudo(paciente, resultados);
            laudoIA = await Promise.race([aiPromise, aiTimeout, aiPular]);
        } catch(e) {
            if (e === 'pulou') console.log('⏭️ Usuário pulou a IA');
            else console.log('⚠️ IA timeout, PDF sai sem laudo IA');
        }
        
        var el = document.getElementById('avisoIA');
        if (el) el.remove();
    }
    
    // Cria conteúdo do PDF com pdfmake
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        
        header: {
            margin: [0, 0, 0, 20],
            table: {
                widths: ['*'],
                body: [[
                    {
                        text: [
                            { text: 'S', color: '#dc3545', fontSize: 24, bold: true },
                            { text: 'Ψ', color: '#3498db', fontSize: 24, bold: true },
                            { text: 'M', color: '#6c757d', fontSize: 24, bold: true }
                        ],
                        alignment: 'center',
                        margin: [0, 10, 0, 5]
                    }
                ]]
            },
            layout: {
                fillColor: '#2c3e50',
                hLineWidth: () => 0,
                vLineWidth: () => 0
            }
        },
        
        content: [
            // Título principal
            {
                text: 'LAUDO NEUROPSICOLÓGICO',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 5]
            },
            {
                text: 'Bateria de Atenção Eletrônica (BAE 2.3) - Sistema SΨM',
                style: 'subheader',
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            
            // Dados do paciente
            {
                text: 'DADOS DO PACIENTE',
                style: 'sectionHeader'
            },
            {
                table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                        [
                            { text: `ID: ${paciente.idTeste || ''}`, colSpan: 4, alignment: 'center', bold: true, color: '#2e7d32' }, {}, {}, {}
                        ],
                        [
                            { text: `Nome: ${paciente.nome || 'Não informado'}`, colSpan: 2 }, {},
                            { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, colSpan: 2 }, {}
                        ],
                        [
                            `Idade: ${paciente.idade || 'Não informado'}`,
                            `Sexo: ${paciente.sexo || 'Não informado'}`,
                            `CPF: ${paciente.cpf || 'Não informado'}`,
                            `Lateralidade: ${paciente.lateralidade || 'Não informado'}`
                        ],
                        [
                            `Escolaridade: ${paciente.escolaridade || 'Não informado'}`,
                            `Profissão: ${paciente.profissao || 'Não informado'}`,
                            `Psicólogo: ${paciente.nomePsicologo || 'Não informado'}`,
                            `CRP: ${paciente.crp || 'Não informado'}`
                        ],
                        [
                            { text: `Email: ${paciente.email || 'Não informado'}`, colSpan: 2 }, {},
                            { text: `Telefone: ${paciente.telefone || 'Não informado'}`, colSpan: 2 }, {}
                        ]
                    ]
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 10]
            },
            
            // Descrição da bateria
            {
                text: 'DESCRIÇÃO DA BATERIA',
                style: 'sectionHeader'
            },
            {
                text: 'A Bateria de Atenção Eletrônica (BAE 2.3) é um instrumento neuropsicológico que avalia diferentes domínios atencionais através de cinco testes:',
                margin: [0, 0, 0, 5]
            },
            {
                ul: [
                    'Atenção Concentrada: Discriminação visual focal',
                    'Atenção Seletiva: Vigilância sustentada com distração',
                    'Atenção Dividida: Processamento dual visual-auditivo',
                    'Atenção Alternada: Flexibilidade cognitiva',
                    'Atenção Sustentada: Manutenção da atenção ao longo do tempo'
                ],
                margin: [0, 0, 0, 10]
            },
            
            // Resultados
            {
                text: 'RESULTADOS - PROTOCOLO BAE 2.3',
                style: 'sectionHeader'
            },
            {
                text: 'Performance por domínio atencional',
                style: 'subtitle',
                margin: [0, 0, 0, 5]
            },
            
            // Gráfico será inserido dinamicamente
            
            // Tabela de resultados — TODOS os 5 testes, com status
            {
                table: {
                    headerRows: 1,
                    widths: ['25%', '15%', '20%', '20%', '20%'],
                    body: [
                        [
                            { text: 'Teste', style: 'tableHeader' },
                            { text: 'Taxa Acerto', style: 'tableHeader' },
                            { text: 'Tempo Médio', style: 'tableHeader' },
                            { text: 'Classificação', style: 'tableHeader' },
                            { text: 'Status', style: 'tableHeader' }
                        ],
                        ...['concentrada', 'seletiva', 'dividida', 'alternada', 'sustentada'].map(teste => {
                            const dados = resultados[teste];
                            const nomes = {
                                'concentrada': 'Concentrada',
                                'seletiva': 'Seletiva',
                                'dividida': 'Dividida',
                                'alternada': 'Alternada',
                                'sustentada': 'Sustentada'
                            };
                            
                            if (!dados) {
                                return [
                                    nomes[teste],
                                    '—',
                                    '—',
                                    '—',
                                    { text: 'NÃO REALIZADO', color: '#999' }
                                ];
                            }
                            
                            const taxa = dados.taxaAcerto || 0;
                            const tempo = parseFloat(dados.tempoMedio) || 0;
                            let classificacao = 'Normal';
                            if (taxa < 60) classificacao = 'Baixo';
                            else if (taxa > 85) classificacao = 'Superior';
                            
                            let status = dados.statusTeste || 'CONCLUÍDO';
                            var histT = window.historicoExecucoes || {}; if (histT[teste] && histT[teste].length > 0) status = 'REFEITO (' + status + ')';
                            let statusColor = '#2e7d32';
                            if (status === 'BYPASSADO') statusColor = '#ff9800';
                            else if (status === 'PARADO') statusColor = '#f44336';
                            else if (status === 'ABANDONADO') statusColor = '#f44336';
                            else if (status === 'RETROCEDIDO') statusColor = '#9c27b0';
                            
                            return [
                                nomes[teste] || teste,
                                `${taxa.toFixed(1)}%`,
                                `${tempo.toFixed(0)}ms`,
                                classificacao,
                                { text: status, color: statusColor, bold: true }
                            ];
                        })
                    ]
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 8]
            },
            
            // Detalhes por teste (só os realizados)
            ...testesRealizados.map(teste => {
                const dados = resultados[teste];
                const titulosTestes = {
                    'concentrada': 'ATENÇÃO CONCENTRADA',
                    'seletiva': 'ATENÇÃO SELETIVA',
                    'dividida': 'ATENÇÃO DIVIDIDA',
                    'alternada': 'ATENÇÃO ALTERNADA',
                    'sustentada': 'ATENÇÃO SUSTENTADA'
                };
                
                const status = dados.statusTeste || 'CONCLUÍDO';
                const faixa = dados.faixaEtaria || '';
                let detalhes = [`Status: ${status}${faixa ? ' | Faixa: ' + faixa : ''}`];
                
                if (teste === 'concentrada') {
                    detalhes = [
                        `Acertos: ${dados.acertos || 0} | Erros: ${dados.erros || 0} | Omissões: ${dados.omissoes || 0}`,
                        `Taxa de Acerto: ${(dados.taxaAcerto || 0).toFixed(1)}% | Tempo Médio: ${(dados.tempoMedio || 0).toFixed(0)}ms`,
                        `Total de Tentativas: ${dados.totalTentativas || 0}`
                    ];
                } else if (teste === 'seletiva') {
                    detalhes = [
                        `Acertos: ${dados.acertos || 0} | Erros: ${dados.erros || 0} | Omissões: ${dados.omissoes || 0}`,
                        `Taxa de Acerto: ${(dados.taxaAcerto || 0).toFixed(1)}% | Tempo Médio: ${dados.tempoMedio || 0}ms`,
                        `Total de Leões: ${dados.totalLeoes || 0} | Duração: ${dados.duracaoTeste || 0}s`,
                        `Preferência Quadrante: ${dados.quadrantePreferido || 'Equilibrada'} | Vigilância: ${dados.vigilancia || 'Normal'}`
                    ];
                } else if (teste === 'dividida') {
                    var totalAcDiv = (dados.acertosVisuais||0) + (dados.acertosAuditivos||0);
                    var totalErrDiv = (dados.errosVisuais||0) + (dados.errosAuditivos||0);
                    var totalOmDiv = (dados.omissoesVisuais||0) + (dados.omissoesAuditivas||0);
                    detalhes = [
                        `Acertos Visuais: ${dados.acertosVisuais || 0} | Erros Visuais: ${dados.errosVisuais || 0} | Omissões Visuais: ${dados.omissoesVisuais || 0}`,
                        `Acertos Auditivos: ${dados.acertosAuditivos || 0} | Erros Auditivos: ${dados.errosAuditivos || 0} | Omissões Auditivas: ${dados.omissoesAuditivas || 0}`,
                        `Total: ${totalAcDiv} acertos | ${totalErrDiv} erros | ${totalOmDiv} omissões`,
                        `Taxa de Acerto: ${(dados.taxaAcerto || 0).toFixed(1)}% | Tempo Médio: ${(dados.tempoMedio || 0).toFixed(0)}ms`
                    ];
                } else if (teste === 'alternada') {
                    detalhes = [
                        `Acertos: ${dados.acertos || 0} | Erros: ${dados.erros || 0} | Omissões: ${dados.omissoes || 0}`,
                        `Taxa de Acerto: ${(dados.taxaAcerto || 0).toFixed(1)}% | Tempo Médio: ${(dados.tempoMedio || 0).toFixed(0)}ms`,
                        `Preferência: ${dados.preferencia || 'Não detectada'} | Flexibilidade: ${dados.flexibilidade || 'Normal'}`
                    ];
                } else if (teste === 'sustentada') {
                    detalhes = [
                        `Acertos: ${dados.acertos || 0} | Erros: ${dados.erros || 0} | Omissões: ${dados.omissoes || 0}`,
                        `Taxa de Acerto: ${(dados.taxaAcerto || 0).toFixed(1)}% | Tempo Médio: ${(dados.tempoMedio || 0).toFixed(0)}ms`,
                        `Total de Alvos: ${dados.totalAlvos || 0} | Duração: ${dados.duracaoTeste || 0}s`,
                        `Negligências: ${dados.negligencias || 0} | Impulsividade: ${dados.impulsividade || 0}`
                    ];
                }
                
                return [
                    {
                        text: titulosTestes[teste],
                        style: 'testTitle',
                        margin: [0, 8, 0, 3]
                    },
                    {
                        ul: detalhes,
                        margin: [0, 0, 0, 5]
                    }
                ];
            }).flat(),
            

            // Perfil de Redes Atencionais (Posner & Petersen, 1990)
            ...(function() {
                var r = resultados;
                var items = [];
                var tOrient = [r.concentrada, r.seletiva].filter(function(t){return t;});
                var tExec = [r.dividida, r.alternada].filter(function(t){return t;});
                var tVigil = r.sustentada;
                
                var idxOrient = tOrient.length > 0 ? tOrient.map(function(t){return t.taxaAcerto||0;}).reduce(function(a,b){return a+b;},0)/tOrient.length : -1;
                var idxExec = tExec.length > 0 ? tExec.map(function(t){return t.taxaAcerto||0;}).reduce(function(a,b){return a+b;},0)/tExec.length : -1;
                var idxVigil = tVigil ? (tVigil.taxaAcerto||0) : -1;
                
                if (idxOrient < 0 && idxExec < 0 && idxVigil < 0) return [];
                
                function classificar(v) { return v >= 85 ? 'PRESERVADA' : v >= 70 ? 'ADEQUADA' : v >= 50 ? 'LIMITROFE' : 'COMPROMETIDA'; }
                function corClass(v) { return v >= 70 ? '#2e7d32' : v >= 50 ? '#ff9800' : '#dc3545'; }
                
                items.push({ text: 'PERFIL DE REDES ATENCIONAIS', style: 'sectionHeader' });
                items.push({ text: 'Modelo de Posner & Petersen (1990) - Tres redes funcionais', style: 'subtitle', margin: [0, 0, 0, 8] });
                
                var tabelaRedes = [
                    [
                        { text: 'Rede Atencional', style: 'tableHeader' },
                        { text: 'Testes', style: 'tableHeader' },
                        { text: 'Indice', style: 'tableHeader' },
                        { text: 'Classificacao', style: 'tableHeader' },
                        { text: 'Correlato Neural', style: 'tableHeader' }
                    ]
                ];
                
                if (idxOrient >= 0) {
                    tabelaRedes.push([
                        { text: 'ORIENTACAO', bold: true },
                        'Concentrada + Seletiva',
                        { text: idxOrient.toFixed(1) + '%', color: corClass(idxOrient), bold: true },
                        { text: classificar(idxOrient), color: corClass(idxOrient) },
                        'Parietal posterior, Colliculo superior'
                    ]);
                }
                if (idxExec >= 0) {
                    tabelaRedes.push([
                        { text: 'EXECUTIVA', bold: true },
                        'Dividida + Alternada',
                        { text: idxExec.toFixed(1) + '%', color: corClass(idxExec), bold: true },
                        { text: classificar(idxExec), color: corClass(idxExec) },
                        'Cortex pre-frontal, Cingulado anterior'
                    ]);
                }
                if (idxVigil >= 0) {
                    tabelaRedes.push([
                        { text: 'VIGILANCIA', bold: true },
                        'Sustentada',
                        { text: idxVigil.toFixed(1) + '%', color: corClass(idxVigil), bold: true },
                        { text: classificar(idxVigil), color: corClass(idxVigil) },
                        'Locus coeruleus, Hemisferio direito'
                    ]);
                }
                
                items.push({
                    table: { headerRows: 1, widths: ['18%', '22%', '12%', '20%', '28%'], body: tabelaRedes },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 8]
                });
                
                // Perfil qualitativo
                var potencialidades = [];
                var fragilidades = [];
                if (idxOrient >= 70) potencialidades.push('Rede de Orientacao (foco e selecao)');
                else if (idxOrient >= 0 && idxOrient < 50) fragilidades.push('Rede de Orientacao (dificuldade em direcionar e manter foco)');
                if (idxExec >= 70) potencialidades.push('Rede Executiva (flexibilidade e controle)');
                else if (idxExec >= 0 && idxExec < 50) fragilidades.push('Rede Executiva (dificuldade em alternar e dividir atencao)');
                if (idxVigil >= 70) potencialidades.push('Rede de Vigilancia (sustentacao ao longo do tempo)');
                else if (idxVigil >= 0 && idxVigil < 50) fragilidades.push('Rede de Vigilancia (fadiga e queda de desempenho ao longo do tempo)');
                
                if (potencialidades.length > 0) {
                    items.push({ text: 'POTENCIALIDADES:', style: 'testTitle', margin: [0, 5, 0, 3], color: '#2e7d32' });
                    items.push({ ul: potencialidades, margin: [0, 0, 0, 5], color: '#2e7d32' });
                }
                if (fragilidades.length > 0) {
                    items.push({ text: 'FRAGILIDADES:', style: 'testTitle', margin: [0, 5, 0, 3], color: '#dc3545' });
                    items.push({ ul: fragilidades, margin: [0, 0, 0, 5], color: '#dc3545' });
                }
                
                return items;
            })(),
            
            // Laudo da IA Gemini (se disponível)
            ...(function() {
                if (!laudoIA) return [];
                var items = [];
                if (laudoIA.parecer) {
                    items.push({ text: 'ANÁLISE CLÍNICA ASSISTIDA POR IA', style: 'sectionHeader' });
                    items.push({ text: laudoIA.parecer, margin: [0, 0, 0, 10], alignment: 'justify' });
                }
                if (laudoIA.estrategia) {
                    items.push({ text: 'ESTRATÉGIA DO PACIENTE', style: 'testTitle', margin: [0, 8, 0, 3] });
                    items.push({ text: laudoIA.estrategia, margin: [0, 0, 0, 10], alignment: 'justify' });
                }
                return items;
            })(),
            
            // Análise da IA Observadora
            ...gerarAnaliseIAObservadora(),
            
            // Histórico de execuções (se houver testes refeitos/parados/bypassados)
            ...(function() {
                var hist = window.historicoExecucoes || {};
                var temHistorico = Object.keys(hist).some(function(k) { return hist[k] && hist[k].length > 0; });
                if (!temHistorico) return [];
                var items = [{ text: 'HIST\u00d3RICO DE EXECU\u00c7\u00d5ES', style: 'sectionHeader', margin: [0, 20, 0, 10] }];
                var nomes = {concentrada:'Concentrada', seletiva:'Seletiva', dividida:'Dividida', alternada:'Alternada', sustentada:'Sustentada'};
                Object.keys(hist).forEach(function(teste) {
                    if (hist[teste] && hist[teste].length > 0) {
                        items.push({ text: nomes[teste] || teste, style: 'testTitle', margin: [0, 10, 0, 5] });
                        var detalhes = hist[teste].map(function(ex) {
                            return 'Execu\u00e7\u00e3o #' + ex.execucao + ': ' + ex.motivo + ' (' + ex.timestamp + ')' + (ex.dados && ex.dados.taxaAcerto !== undefined ? ' - Taxa: ' + (ex.dados.taxaAcerto || 0).toFixed(1) + '%' : '');
                        });
                        items.push({ ul: detalhes, margin: [0, 0, 0, 10] });
                    }
                });
                return items;
            })(),
            
            // Referências bibliográficas
            {
                text: 'REFERÊNCIAS BIBLIOGRÁFICAS',
                style: 'sectionHeader'
            },
            {
                text: [
                    'AMERICAN PSYCHIATRIC ASSOCIATION. Manual diagnóstico e estatístico de transtornos mentais: DSM-5. 5. ed. Porto Alegre: Artmed, 2014.\n\n',
                    'BANICH, M. T. The missing link: the role of interhemispheric interaction in attentional processing. Brain and Cognition, v. 36, n. 2, p. 128-157, 1998.\n\n',
                    'BARKLEY, R. A. Behavioral inhibition, sustained attention, and executive functions: constructing a unifying theory of ADHD. Psychological Bulletin, v. 121, n. 1, p. 65-94, 1997.\n\n',
                    'BARKLEY, R. A. Attention-deficit hyperactivity disorder: a handbook for diagnosis and treatment. 4. ed. New York: Guilford Press, 2019.\n\n',
                    'CASTELLANOS, F. X. et al. Varieties of attention-deficit/hyperactivity disorder-related intra-individual variability. Biological Psychiatry, v. 57, n. 11, p. 1416-1423, 2005.\n\n',
                    'CORBETTA, M.; SHULMAN, G. L. Control of goal-directed and stimulus-driven attention in the brain. Nature Reviews Neuroscience, v. 3, n. 3, p. 201-215, 2002.\n\n',
                    'FINKELMAN, M. D. et al. Computerized adaptive testing for measuring development and improvement of ability. Journal of Applied Psychology, v. 95, n. 6, p. 1076-1084, 2010.\n\n',
                    'HEATON, R. K. et al. Reliability and validity of composite scores from the NIH Toolbox Cognition Battery in adults. Journal of the International Neuropsychological Society, v. 20, n. 6, p. 588-598, 2014.\n\n',
                    'HOMMEL, B. The Simon effect as tool and heuristic. Acta Psychologica, v. 136, n. 2, p. 189-202, 2011.\n\n',
                    'ISHIHARA, S. Tests for colour-blindness. Tokyo: Handaya Hongo Harukicho, 1917.\n\n',
                    'KAIL, R. Developmental change in speed of processing during childhood and adolescence. Psychological Bulletin, v. 109, n. 3, p. 490-501, 1991.\n\n',
                    'KAHNEMAN, D. Attention and effort. Englewood Cliffs: Prentice-Hall, 1973.\n\n',
                    'KORNBLUM, S. et al. Dimensional overlap: cognitive basis for stimulus-response compatibility effects - a model and taxonomy. Psychological Review, v. 97, n. 2, p. 253-270, 1990.\n\n',
                    'LEZAK, M. D. et al. Neuropsychological assessment. 5. ed. New York: Oxford University Press, 2012.\n\n',
                    'LUCE, R. D. Response times: their role in inferring elementary mental organization. New York: Oxford University Press, 1986.\n\n',
                    'MALLOY-DINIZ, L. F. et al. Avaliação neuropsicológica. 2. ed. Porto Alegre: Artmed, 2018.\n\n',
                    'MIYAKE, A. et al. The unity and diversity of executive functions and their contributions to complex frontal lobe tasks: a latent variable analysis. Cognitive Psychology, v. 41, n. 1, p. 49-100, 2000.\n\n',
                    'PARASURAMAN, R. The attentive brain. Cambridge: MIT Press, 1998.\n\n',
                    'POSNER, M. I.; PETERSEN, S. E. The attention system of the human brain. Annual Review of Neuroscience, v. 13, p. 25-42, 1990.\n\n',
                    'RATCLIFF, R. A theory of memory retrieval. Psychological Review, v. 85, n. 2, p. 59-108, 1978.\n\n',
                    'RICCIO, C. A.; REYNOLDS, C. R. Continuous performance tests are sensitive to ADHD in adults but lack specificity: a review and critique for differential diagnosis. Archives of Clinical Neuropsychology, v. 16, n. 5, p. 445-463, 2001.\n\n',
                    'RICCIO, C. A. et al. The continuous performance test: a window on the neural substrates for attention? Archives of Clinical Neuropsychology, v. 17, n. 3, p. 235-272, 2002.\n\n',
                    'RIDDERINKHOF, K. R. et al. The role of the medial frontal cortex in cognitive control. Science, v. 306, n. 5695, p. 443-447, 2004.\n\n',
                    'SARTER, M.; GIVENS, B.; BRUNO, J. P. The cognitive neuroscience of sustained attention: where top-down meets bottom-up. Brain Research Reviews, v. 35, n. 2, p. 146-160, 2001.\n\n',
                    'SALTHOUSE, T. A. The processing-speed theory of adult age differences in cognition. Psychological Review, v. 103, n. 3, p. 403-428, 1996.\n\n',
                    'STRAUSS, E.; SHERMAN, E. M. S.; SPREEN, O. A compendium of neuropsychological tests: administration, norms, and commentary. 3. ed. New York: Oxford University Press, 2006.\n\n',
                    'TOPLAK, M. E. et al. Practitioner review: do performance-based measures and ratings of executive function assess the same construct? Journal of Child Psychology and Psychiatry, v. 54, n. 2, p. 131-143, 2013.\n\n',
                    'WEISS, D. J.; KINGSBURY, G. G. Application of computerized adaptive testing to educational problems. Journal of Educational Measurement, v. 21, n. 4, p. 361-375, 1984.\n\n',
                    'WEB CONTENT ACCESSIBILITY GUIDELINES (WCAG) 2.1. W3C Recommendation. World Wide Web Consortium, 2018. Disponível em: https://www.w3.org/WAI/WCAG21/Understanding/. Acesso em: 15 jan. 2025.',
                    '\n\nANDERSON, P. Assessment and development of executive function (EF) during childhood. Child Neuropsychology, v. 8, n. 2, p. 71-82, 2002.'
                ],
                fontSize: 8,
                alignment: 'justify'
            }
        ],
        
        footer: function(currentPage, pageCount) {
            const id = window._idTeste || '';
            return {
                text: `${id} | Relatório BAE 2.3 - Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                color: '#666666'
            };
        },
        
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: '#2c3e50'
            },
            subheader: {
                fontSize: 10,
                color: '#2c3e50'
            },
            sectionHeader: {
                fontSize: 12,
                bold: true,
                color: '#2c3e50',
                margin: [0, 10, 0, 5]
            },
            subtitle: {
                fontSize: 8,
                italics: true,
                color: '#666666'
            },
            tableHeader: {
                bold: true,
                fillColor: '#f8f9fa',
                color: '#2c3e50'
            },
            testTitle: {
                fontSize: 11,
                bold: true,
                color: '#2c3e50'
            }
        },
        defaultStyle: {
            fontSize: 9
        }
    };
    
    // Gera gráfico e depois cria PDF
    const graficoImagem = await gerarGraficoPerformance(testesRealizados, resultados);
    
    // Adiciona gráfico após a tabela
    const tabelaIndex = docDefinition.content.findIndex(item => 
        item.table && item.table.headerRows === 1
    );
    
    if (tabelaIndex !== -1 && graficoImagem) {
        docDefinition.content.splice(tabelaIndex, 0,
            {
                text: 'Gráfico de Performance por Teste',
                style: 'subtitle',
                margin: [0, 10, 0, 10]
            },
            {
                image: graficoImagem,
                width: 400,
                alignment: 'center',
                margin: [0, 0, 0, 8]
            }
        );
    }
    
    // Gera e salva o PDF
    var pdfDoc = pdfMake.createPdf(docDefinition);
    
    if (window.__TAURI__) {
        // TAURI: salva automático na área de trabalho + Salvar Como
        pdfDoc.getDataUrl(async function(dataUrl) {
            try {
                // 1. Backup automático na área de trabalho
                var caminho = await window.__TAURI__.core.invoke('salvar_pdf_desktop', {
                    nomeArquivo: nomeArquivo,
                    dataUrl: dataUrl
                });
                console.log('✅ PDF backup salvo em: ' + caminho);
                
                // 2. Salvar Como (diálogo)
                var path = await window.__TAURI__.dialog.save({
                    defaultPath: nomeArquivo,
                    filters: [{ name: 'PDF', extensions: ['pdf'] }]
                });
                if (path) {
                    await window.__TAURI__.core.invoke('salvar_pdf_path', {
                        path: path,
                        dataUrl: dataUrl
                    });
                    console.log('✅ PDF salvo em: ' + path);
                }
                
                alert('PDF salvo!\n\nBackup: ' + caminho + (path ? '\nSalvar Como: ' + path : ''));
            } catch (e) {
                console.error('Erro ao salvar PDF:', e);
                // Fallback: download normal
                pdfDoc.download(nomeArquivo);
            }
        });
    } else {
        // NAVEGADOR: download normal
        pdfDoc.download(nomeArquivo);
    }
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        alert('⚠️ Erro ao gerar PDF completo. Tentando versão simplificada...\n\nUse: gerarPDFEmergencia()');
    }
}

// ===== FUNÇÃO DE EMERGÊNCIA - PDF SEM GRÁFICO =====
function gerarPDFEmergencia() {
    const paciente = window.resultadosBAE?.paciente || {};
    const resultados = window.resultadosBAE || {};
    const testesRealizados = Object.keys(resultados).filter(key => 
        key !== 'paciente' && key !== 'testesCompletos' && resultados[key] !== null
    );
    
    if (testesRealizados.length === 0) {
        alert('Nenhum teste encontrado!');
        return;
    }
    
    const agora = new Date();
    const nomeArquivo = `BAE2.3_${(paciente.nome || 'PACIENTE').replace(/\s+/g, '_').toUpperCase()}_${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}.pdf`;
    
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [
            { text: 'LAUDO NEUROPSICOLÓGICO', fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            { text: 'Bateria de Atenção Eletrônica (BAE 2.3)', fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
            { text: 'DADOS DO PACIENTE', fontSize: 14, bold: true, margin: [0, 15, 0, 10] },
            { text: `Nome: ${paciente.nome || 'Não informado'}`, margin: [0, 5, 0, 5] },
            { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 5, 0, 20] },
            { text: 'RESULTADOS', fontSize: 14, bold: true, margin: [0, 15, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['40%', '30%', '30%'],
                    body: [
                        [{ text: 'Teste', bold: true }, { text: 'Taxa Acerto', bold: true }, { text: 'Tempo Médio', bold: true }],
                        ...testesRealizados.map(teste => {
                            const dados = resultados[teste];
                            const nomes = { concentrada: 'Concentrada', seletiva: 'Seletiva', dividida: 'Dividida', alternada: 'Alternada', sustentada: 'Sustentada' };
                            return [
                                nomes[teste] || teste,
                                `${(dados.taxaAcerto || 0).toFixed(1)}%`,
                                `${(dados.tempoMedio || 0).toFixed(0)}ms`
                            ];
                        })
                    ]
                },
                layout: 'lightHorizontalLines'
            }
        ]
    };
    
    pdfMake.createPdf(docDefinition).download(nomeArquivo);
    console.log('✅ PDF de emergência gerado!');
}

// Disponibiliza funções globalmente
window.salvarResultadoTeste = salvarResultadoTeste;
window.gerarRelatorioPDF = gerarRelatorioPDF;
window.gerarPDFEmergencia = gerarPDFEmergencia;

console.log('✅ Sistema de PDF BAE 2.3 com pdfmake carregado!');