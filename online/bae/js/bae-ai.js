// ===== BAE 2.4.0 — IA GEMINI (via Lambda proxy) =====
// Gera parecer clinico assistido por IA
// Usa o endpoint /generate-ai da Lambda (mesmo do TECFE/TRMV/TAAV)

var BAEAI = (function() {

    // URL da Lambda para analise por IA (chave fica segura no servidor)
    var LAMBDA_AI_URL = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws/generate-ai';

    // Converte milissegundos em segundos com 2 casas (ex.: 593 -> '0,59 s') para o texto da IA
    function _s(ms) {
        var v = parseFloat(ms);
        if (!isFinite(v)) v = 0;
        return (v / 1000).toFixed(2).replace('.', ',') + ' s';
    }

    // Monta o prompt com dados dos testes
    function montarPrompt(paciente, resultados, iaObs) {
        var p = paciente || {};
        var r = resultados || {};
        
        var texto = 'Voce e um neuropsicologo experiente. Analise os resultados da Bateria de Atencao Eletronica (BAE 2.4) e gere um parecer clinico.\n\n';
        
        texto += 'DADOS DO PACIENTE:\n';
        texto += 'Nome: ' + (p.nome || 'N/I') + ' | Idade: ' + (p.idade || 'N/I') + ' | Sexo: ' + (p.sexo || 'N/I') + '\n';
        texto += 'Escolaridade: ' + (p.escolaridade || 'N/I') + ' | Lateralidade: ' + (p.lateralidade || 'N/I') + '\n';
        texto += 'Observacoes: ' + (p.observacoes || 'N/I') + '\n\n';
        
        texto += 'RESULTADOS DOS TESTES:\n\n';
        
        if (r.concentrada) {
            var c = r.concentrada;
            texto += '1. ATENCAO CONCENTRADA (discriminacao visual de linhas):\n';
            texto += '   Acertos: ' + (c.acertos||0) + '/' + (c.totalTentativas||0) + ' (' + (c.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + _s(c.tempoMedio) + '\n';
            texto += '   Erros: ' + (c.erros||0) + ' | Omissoes: ' + (c.omissoes||0) + ' | Variabilidade RT: ' + _s(c.variabilidadeRT) + '\n';
            texto += '   Faixa: ' + (c.faixaEtaria||'N/I') + ' | Duracao real: ' + (c.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '1. ATENCAO CONCENTRADA: NAO REALIZADO\n\n';
        }
        
        if (r.seletiva) {
            var s = r.seletiva;
            texto += '2. ATENCAO SELETIVA (Go/No-Go com animais, alvo=leao):\n';
            texto += '   Acertos: ' + (s.acertos||0) + '/' + (s.totalLeoes||0) + ' (' + (s.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + _s(s.tempoMedio) + '\n';
            texto += '   Erros (comissoes): ' + (s.erros||0) + ' | Omissoes: ' + (s.omissoes||0) + '\n';
            texto += '   Faixa: ' + (s.faixaEtaria||'N/I') + ' | Duracao real: ' + (s.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '2. ATENCAO SELETIVA: NAO REALIZADO\n\n';
        }
        
        if (r.dividida) {
            var d = r.dividida;
            texto += '3. ATENCAO DIVIDIDA (dual-task visual+auditivo):\n';
            texto += '   Visual: ' + (d.acertosVisuais||0) + ' acertos, ' + (d.errosVisuais||0) + ' erros, ' + (d.omissoesVisuais||0) + ' omissoes\n';
            texto += '   Auditivo: ' + (d.acertosAuditivos||0) + ' acertos, ' + (d.errosAuditivos||0) + ' erros, ' + (d.omissoesAuditivas||0) + ' omissoes\n';
            texto += '   Desempenho geral: ' + (d.taxaAcerto||0).toFixed(1) + '% | RT medio: ' + _s(d.tempoMedio) + '\n';
            texto += '   Faixa: ' + (d.faixaEtaria||'N/I') + ' | Duracao real: ' + (d.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '3. ATENCAO DIVIDIDA: NAO REALIZADO\n\n';
        }
        
        if (r.alternada) {
            var a = r.alternada;
            texto += '4. ATENCAO ALTERNADA (alternancia cor/forma):\n';
            texto += '   Acertos: ' + (a.acertos||0) + ' | Erros: ' + (a.erros||0) + ' | Omissoes: ' + (a.omissoes||0) + '\n';
            texto += '   Cor: ' + (a.acertosCor||0) + ' acertos | Forma: ' + (a.acertosForma||0) + ' acertos | Ambivalentes: ' + (a.acertosAmbivalentes||0) + '\n';
            texto += '   RT medio: ' + _s(a.tempoMedio) + ' | Faixa: ' + (a.faixaEtaria||'N/I') + '\n\n';
        } else {
            texto += '4. ATENCAO ALTERNADA: NAO REALIZADO\n\n';
        }
        
        if (r.sustentada) {
            var su = r.sustentada;
            texto += '5. ATENCAO SUSTENTADA (vigilancia prolongada, alvo=quadrado amarelo):\n';
            texto += '   Acertos: ' + (su.acertos||0) + '/' + (su.totalAlvos||0) + ' (' + (su.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + _s(su.tempoMedio) + '\n';
            texto += '   Omissoes: ' + (su.omissoes||0) + ' | Negligencias: ' + (su.negligencias||0) + ' | Impulsividade: ' + (su.impulsividade||0) + '\n';
            texto += '   Faixa: ' + (su.faixaEtaria||'N/I') + ' | Duracao real: ' + (su.duracaoTeste||0) + 's\n';
            if (su.fadiga) {
                texto += '   INDICE DE FADIGA: ' + (su.fadiga.indiceFadiga||0) + '% (' + (su.fadiga.classificacao||'N/I') + ')\n';
                texto += '   Variabilidade temporal (CV): ' + (su.fadiga.variabilidadeTemporal||0) + '% (' + (su.fadiga.classificacaoCV||'N/I') + ')\n';
                if (su.fadiga.pontoRuptura) texto += '   Ponto de ruptura: bloco ' + su.fadiga.pontoRuptura + ' de ' + su.fadiga.numBlocos + '\n';
                if (su.fadiga.blocos) { su.fadiga.blocos.forEach(function(bl) { texto += '   Bloco ' + bl.bloco + ': ' + bl.taxa.toFixed(0) + '% (RT ' + _s(bl.rtMedio) + ')\n'; }); }
            }
            texto += '\n';
        } else {
            texto += '5. ATENCAO SUSTENTADA: NAO REALIZADO\n\n';
        }
        
        if (iaObs) {
            texto += 'IA OBSERVADORA (bayesiana):\n';
            texto += 'TDAH: ' + (iaObs.probabilidades?.TDAH||0) + '% | Normal: ' + (iaObs.probabilidades?.Normal||0) + '% | TDI: ' + (iaObs.probabilidades?.TDI||0) + '% | Ansiedade: ' + (iaObs.probabilidades?.Ansiedade||0) + '%\n';
            texto += 'Diagnostico sugerido: ' + (iaObs.diagnosticoSugerido||'N/I') + ' (' + (iaObs.confianca||0) + '% confianca)\n';
            texto += 'ATENCAO: estes percentuais vem de uma heuristica de apoio (pesos fixos aplicados durante a execucao), NAO sao probabilidades diagnosticas validadas. Nao os use para afastar nem para confirmar nenhum diagnostico. Se divergirem dos dados brutos, prevalecem os dados brutos e voce deve registrar a divergencia.\n\n';
        }
        
        // Perfil de erros: omissao (nao respondeu) x comissao (respondeu errado). Omissao NAO e impulsividade.
        var _linhasPerfil = [];
        var _nomesPerfil = {concentrada:'Concentrada', seletiva:'Seletiva', dividida:'Dividida', alternada:'Alternada', sustentada:'Sustentada'};
        ['concentrada','seletiva','dividida','alternada','sustentada'].forEach(function(k) {
            var x = r[k]; if (!x) return;
            var er = (k === 'dividida') ? ((x.errosVisuais||0) + (x.errosAuditivos||0)) : (x.erros||0);
            var om = (k === 'dividida') ? ((x.omissoesVisuais||0) + (x.omissoesAuditivas||0)) : (x.omissoes||0);
            var tot = er + om;
            var pctOm = tot > 0 ? Math.round(om / tot * 100) : 0;
            _linhasPerfil.push(_nomesPerfil[k] + ': comissoes (respondeu errado) = ' + er + ' | omissoes (nao respondeu) = ' + om + ' | omissoes = ' + pctOm + '% dos erros');
        });
        if (_linhasPerfil.length > 0) {
            texto += 'PERFIL DE ERROS (comissao x omissao):\n' + _linhasPerfil.join('\n') + '\n\n';
        }
        if (r.dividida && (r.dividida.acertosAuditivos||0) === 0) {
            texto += 'ALERTA: na Atencao Dividida o canal auditivo teve ZERO acertos. Descreva esse dado sem atribuir causa unica: considere a compreensao da instrucao do canal auditivo e a sobrecarga da tarefa dupla. Nao conclua gargalo fonologico nem alteracao de processamento auditivo apenas por este dado; indique que isso deve ser investigado com outros instrumentos.\n\n';
        }

        // Informacoes de dispositivo e modo de entrada
        var dispInfo = window.dispositivoBAE ? window.dispositivoBAE.obterRelatorioCompleto() : null;
        if (!dispInfo && window.resultadosBAE && window.resultadosBAE._dispositivo) {
            dispInfo = window.resultadosBAE._dispositivo;
        }
        if (dispInfo) {
            texto += 'DISPOSITIVO E MODO DE ENTRADA:\n';
            texto += 'Dispositivo: ' + (dispInfo.dispositivo ? dispInfo.dispositivo.descricao : 'N/I') + '\n';
            var nomesTestes = ['concentrada','seletiva','dividida','alternada','sustentada'];
            for (var ti = 0; ti < nomesTestes.length; ti++) {
                var nt = nomesTestes[ti];
                var dt = dispInfo.testes[nt];
                if (dt) {
                    texto += nt.charAt(0).toUpperCase() + nt.slice(1) + ': ' + dt.modo;
                    if (dt.mediaTeclado > 0) texto += ' (RT teclado: ' + _s(dt.mediaTeclado);
                    if (dt.mediaTouch > 0) texto += ', RT touch: ' + _s(dt.mediaTouch);
                    if (dt.mediaTeclado > 0 || dt.mediaTouch > 0) texto += ')';
                    if (dt.alternanciasModo > 0) texto += ' [' + dt.alternanciasModo + ' alternancias de modo]';
                    texto += '\n';
                }
            }
            texto += '\n';
        }
        
        // Indices das redes atencionais
        var tOrient = [r.concentrada, r.seletiva].filter(function(t){return t;});
        var tExec = [r.dividida, r.alternada].filter(function(t){return t;});
        var idxO = tOrient.length > 0 ? tOrient.map(function(t){return t.taxaAcerto||0;}).reduce(function(a,b){return a+b;},0)/tOrient.length : -1;
        var idxE = tExec.length > 0 ? tExec.map(function(t){return t.taxaAcerto||0;}).reduce(function(a,b){return a+b;},0)/tExec.length : -1;
        var idxV = r.sustentada ? (r.sustentada.taxaAcerto||0) : -1;
        texto += 'INDICES DAS REDES ATENCIONAIS (Posner & Petersen, 1990):\n';
        if (idxO >= 0) texto += 'Rede de Orientacao: ' + idxO.toFixed(1) + '% (concentrada + seletiva)\n';
        if (idxE >= 0) texto += 'Rede Executiva: ' + idxE.toFixed(1) + '% (dividida + alternada)\n';
        if (idxV >= 0) texto += 'Rede de Vigilancia: ' + idxV.toFixed(1) + '% (sustentada)\n';
        texto += '\n';
        
        texto += 'INSTRUCOES PARA O PARECER:\n';
        texto += '1. PARECER CLINICO (3-5 paragrafos): analise integrada baseada no modelo de tres redes atencionais de Posner & Petersen (1990):\n';
        texto += '   - REDE DE ORIENTACAO (concentrada + seletiva): cortex parietal posterior, colliculo superior, pulvinar. Avalia capacidade de direcionar e manter foco.\n';
        texto += '   - REDE EXECUTIVA (dividida + alternada): cortex pre-frontal dorsolateral, cingulado anterior, ganglios da base. Avalia flexibilidade cognitiva e controle atencional.\n';
        texto += '   - REDE DE VIGILANCIA (sustentada): locus coeruleus, sistema noradrenergico, hemisferio direito. Avalia manutencao da atencao ao longo do tempo.\n';
        texto += '   Para cada rede, identifique potencialidades (preservadas) e fragilidades (comprometidas), sempre citando os numeros dos dados acima. Correlacione com as vias neurais e areas corticais apenas como correlato funcional do modelo, sem afirmar lesao.\n';
        texto += '2. HIPOTESES: apresente hipoteses diagnosticas como HIPOTESES A INVESTIGAR (DSM-5-TR, Barkley, Lezak, Parasuraman, Corbetta & Shulman), considerando a faixa etaria. Inclua o diagnostico diferencial. Uma dissociacao entre orientacao preservada e rede executiva comprometida e compativel com mais de um quadro, inclusive o TDAH com predominio de desatencao; nao a use para excluir nenhum deles. Nunca use termos como "afasta", "descarta", "confirma" ou "diagnostico fechado": a BAE e um instrumento de avaliacao da atencao e nao fecha diagnostico sozinha. Conclua dizendo que o diagnostico depende da integracao com anamnese, observacao clinica e demais instrumentos, a cargo do profissional.\n';
        texto += '3. FIDELIDADE AOS DADOS: use somente o que esta nos dados acima. Nao cite testes que nao constam (ex.: FDT, WCST) nem condicoes nao medidas (ex.: processamento auditivo central, transtorno de aprendizagem) como se fossem achados; se mencionar, apresente como hipotese a investigar com outros instrumentos. Teste marcado como NAO REALIZADO nao permite concluir nada sobre aquele dominio (por exemplo fadiga ou vigilancia): registre como limitacao. Nao atribua interpretacao a um valor isolado, como dizer que um tempo de reacao longo "descarta" interferencia motora.\n';
        texto += '4. PERFIL DE ERROS E IMPULSIVIDADE: so afirme impulsividade se houver evidencia nos dados, isto e, muitas comissoes (respostas erradas ou em estimulos nao-alvo) combinadas com tempos de reacao rapidos. Omissoes (nao responder) NAO indicam impulsividade: sugerem desengajamento, abandono da tarefa, sobrecarga ou desatencao. Use o PERFIL DE ERROS para decidir. Se predominarem omissoes, descreva como queda de engajamento ou desistencia sob sobrecarga, nao como impulsividade. Se os dados forem mistos, diga que sao mistos.\n';
        texto += '5. ESTRATEGIA DO PACIENTE (1 paragrafo, depois do parecer): padrao comportamental observado, descrito pelos dados (perfil de erros, preferencia sensorial visual/auditiva quando houver base, dissociacoes entre redes, fadiga somente se a sustentada foi realizada). Esse paragrafo e o unico que pode conter a palavra "estrategia"; nao use essa palavra no parecer.\n';
        texto += '6. Use linguagem tecnica mas acessivel. Nao use markdown. Expresse todos os tempos de reacao em segundos com duas casas decimais (ex.: 0,59 s), exatamente como aparecem nos dados. Nao invente referencias bibliograficas. Separe PARECER e ESTRATEGIA com uma linha em branco.\n';
        texto += '7. DISPOSITIVO: Se o teste foi feito em celular ou tablet (touch), mencione que os tempos de reacao por toque tendem a ser mais lentos que por teclado (diferenca media de 0,05 a 0,15 s). Se houve modo MISTO (teclado+touch), comente sobre a alternancia de modo como possivel indicador de inquietacao motora ou desorganizacao. Se houve alternancias frequentes de modo (>5), destaque como dado clinico relevante.';
        
        return texto;
    }

    // Chama IA via Lambda proxy (mesmo endpoint do TECFE)
    async function gerarLaudo(paciente, resultados) {
        try {
            var iaObs = typeof obterRelatorioIA === 'function' ? obterRelatorioIA() : null;
            var prompt = montarPrompt(paciente, resultados, iaObs);
            
            console.log('🤖 Chamando IA via Lambda...');
            
            var response = await fetch(LAMBDA_AI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            
            if (!response.ok) throw new Error('HTTP ' + response.status);
            
            var data = await response.json();
            var texto = (data.text || '').trim();
            
            if (!texto) throw new Error('Resposta vazia');
            
            // Separa parecer e estrategia
            var partes = texto.split(/\n\s*\n/);
            var parecer = '';
            var estrategia = '';
            var encontrouEstrategia = false;
            
            for (var i = 0; i < partes.length; i++) {
                var p = partes[i].trim();
                if (p.toLowerCase().indexOf('estrategia') >= 0 || p.toLowerCase().indexOf('estrat\u00e9gia') >= 0 || encontrouEstrategia) {
                    encontrouEstrategia = true;
                    estrategia += (estrategia ? '\n\n' : '') + p;
                } else {
                    parecer += (parecer ? '\n\n' : '') + p;
                }
            }
            
            // Remove headers tipo "PARECER CLINICO:" ou "1."
            parecer = parecer.replace(/^(PARECER\s*(CL[I\u00cd]NICO)?:?\s*\n?)/i, '').trim();
            parecer = parecer.replace(/^1\.\s*/m, '').trim();
            estrategia = estrategia.replace(/^(ESTRAT[\u00c9E]GIA\s*(DO\s*PACIENTE)?:?\s*\n?)/i, '').trim();
            estrategia = estrategia.replace(/^2\.\s*/m, '').trim();
            
            console.log('\u2705 Laudo gerado: ' + parecer.length + ' chars parecer, ' + estrategia.length + ' chars estrategia');
            
            return { parecer: parecer, estrategia: estrategia };
            
        } catch(e) {
            console.error('\u274c Erro IA Lambda:', e.message);
            return null;
        }
    }

    return { gerarLaudo: gerarLaudo };
})();

window.BAEAI = BAEAI;
console.log('\uD83E\uDD16 BAE AI (via Lambda) carregado');
