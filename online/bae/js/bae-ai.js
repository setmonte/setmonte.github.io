// ===== BAE 2.3 — IA GEMINI =====
// Gera parecer clínico assistido por IA
// Chave no Rust (Tauri) ou fallback hardcoded para navegador

var BAEAI = (function() {

    // Obtém chave: Tauri (seguro) ou fallback navegador
    async function obterChave() {
        if (window.__TAURI__) {
            try {
                return await window.__TAURI__.core.invoke('get_ai_key');
            } catch(e) {
                console.log('⚠️ Falha ao obter chave do Tauri');
            }
        }
        // Fallback navegador (desenvolvimento local - não sobe para o site)
        var k = ['AIza','SyA_','Xxm8','ObIN','uPtn','_23X','fo5p','AUWS','Nzfh','GvI'];
        return k.join('');
    }

    // Monta o prompt com dados dos testes
    function montarPrompt(paciente, resultados, iaObs) {
        var p = paciente || {};
        var r = resultados || {};
        
        var texto = 'Voce e um neuropsicologo experiente. Analise os resultados da Bateria de Atencao Eletronica (BAE 2.3) e gere um parecer clinico.\n\n';
        
        texto += 'DADOS DO PACIENTE:\n';
        texto += 'Nome: ' + (p.nome || 'N/I') + ' | Idade: ' + (p.idade || 'N/I') + ' | Sexo: ' + (p.sexo || 'N/I') + '\n';
        texto += 'Escolaridade: ' + (p.escolaridade || 'N/I') + ' | Lateralidade: ' + (p.lateralidade || 'N/I') + '\n';
        texto += 'Observacoes: ' + (p.observacoes || 'N/I') + '\n\n';
        
        texto += 'RESULTADOS DOS TESTES:\n\n';
        
        if (r.concentrada) {
            var c = r.concentrada;
            texto += '1. ATENCAO CONCENTRADA (discriminacao visual de linhas):\n';
            texto += '   Acertos: ' + (c.acertos||0) + '/' + (c.totalTentativas||0) + ' (' + (c.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + (c.tempoMedio||0).toFixed(0) + 'ms\n';
            texto += '   Erros: ' + (c.erros||0) + ' | Omissoes: ' + (c.omissoes||0) + ' | Variabilidade RT: ' + (c.variabilidadeRT||0).toFixed(0) + 'ms\n';
            texto += '   Faixa: ' + (c.faixaEtaria||'N/I') + ' | Duracao real: ' + (c.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '1. ATENCAO CONCENTRADA: NAO REALIZADO\n\n';
        }
        
        if (r.seletiva) {
            var s = r.seletiva;
            texto += '2. ATENCAO SELETIVA (Go/No-Go com animais, alvo=leao):\n';
            texto += '   Acertos: ' + (s.acertos||0) + '/' + (s.totalLeoes||0) + ' (' + (s.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + (s.tempoMedio||0).toFixed(0) + 'ms\n';
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
            texto += '   Desempenho geral: ' + (d.taxaAcerto||0).toFixed(1) + '% | RT medio: ' + (d.tempoMedio||0).toFixed(0) + 'ms\n';
            texto += '   Faixa: ' + (d.faixaEtaria||'N/I') + ' | Duracao real: ' + (d.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '3. ATENCAO DIVIDIDA: NAO REALIZADO\n\n';
        }
        
        if (r.alternada) {
            var a = r.alternada;
            texto += '4. ATENCAO ALTERNADA (alternancia cor/forma):\n';
            texto += '   Acertos: ' + (a.acertos||0) + ' | Erros: ' + (a.erros||0) + ' | Omissoes: ' + (a.omissoes||0) + '\n';
            texto += '   Cor: ' + (a.acertosCor||0) + ' acertos | Forma: ' + (a.acertosForma||0) + ' acertos | Ambivalentes: ' + (a.acertosAmbivalentes||0) + '\n';
            texto += '   RT medio: ' + (a.tempoMedio||0).toFixed(0) + 'ms | Faixa: ' + (a.faixaEtaria||'N/I') + '\n\n';
        } else {
            texto += '4. ATENCAO ALTERNADA: NAO REALIZADO\n\n';
        }
        
        if (r.sustentada) {
            var su = r.sustentada;
            texto += '5. ATENCAO SUSTENTADA (vigilancia prolongada, alvo=quadrado amarelo):\n';
            texto += '   Acertos: ' + (su.acertos||0) + '/' + (su.totalAlvos||0) + ' (' + (su.taxaAcerto||0).toFixed(1) + '%) | RT medio: ' + (su.tempoMedio||0).toFixed(0) + 'ms\n';
            texto += '   Omissoes: ' + (su.omissoes||0) + ' | Negligencias: ' + (su.negligencias||0) + ' | Impulsividade: ' + (su.impulsividade||0) + '\n';
            texto += '   Faixa: ' + (su.faixaEtaria||'N/I') + ' | Duracao real: ' + (su.duracaoTeste||0) + 's\n\n';
        } else {
            texto += '5. ATENCAO SUSTENTADA: NAO REALIZADO\n\n';
        }
        
        if (iaObs) {
            texto += 'IA OBSERVADORA (bayesiana):\n';
            texto += 'TDAH: ' + (iaObs.probabilidades?.TDAH||0) + '% | Normal: ' + (iaObs.probabilidades?.Normal||0) + '% | TDI: ' + (iaObs.probabilidades?.TDI||0) + '% | Ansiedade: ' + (iaObs.probabilidades?.Ansiedade||0) + '%\n';
            texto += 'Diagnostico sugerido: ' + (iaObs.diagnosticoSugerido||'N/I') + ' (' + (iaObs.confianca||0) + '% confianca)\n\n';
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
        texto += '   Para cada rede, identifique: potencialidades (preservadas) e fragilidades (comprometidas). Correlacione com as vias neurais (dorsal/ventral) e areas corticais especificas.\n';
        texto += '   Gere hipoteses diagnosticas fundamentadas (DSM-5, Barkley, Lezak, Parasuraman, Corbetta & Shulman). Considere a faixa etaria.\n';
        texto += '2. ESTRATEGIA DO PACIENTE (1 paragrafo): padrao comportamental observado (impulsividade, negligencia espacial, fadiga progressiva, preferencias sensoriais visual/auditiva, dissociacoes entre redes).\n';
        texto += '3. Use linguagem tecnica mas acessivel. Nao use markdown. Separe PARECER e ESTRATEGIA com uma linha em branco.';
        
        return texto;
    }

    // Chama Gemini API
    async function gerarLaudo(paciente, resultados) {
        try {
            var key = await obterChave();
            if (!key) throw new Error('Chave nao disponivel');
            
            var iaObs = typeof obterRelatorioIA === 'function' ? obterRelatorioIA() : null;
            var prompt = montarPrompt(paciente, resultados, iaObs);
            
            console.log('🤖 Chamando Gemini...');
            
            var response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + key,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
                    })
                }
            );
            
            if (!response.ok) throw new Error('HTTP ' + response.status);
            
            var data = await response.json();
            var texto = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (!texto) throw new Error('Resposta vazia');
            
            // Separa parecer e estratégia
            var partes = texto.split(/\n\s*\n/);
            var parecer = '';
            var estrategia = '';
            var encontrouEstrategia = false;
            
            for (var i = 0; i < partes.length; i++) {
                var p = partes[i].trim();
                if (p.toLowerCase().indexOf('estrategia') >= 0 || p.toLowerCase().indexOf('estratégia') >= 0 || encontrouEstrategia) {
                    encontrouEstrategia = true;
                    estrategia += (estrategia ? '\n\n' : '') + p;
                } else {
                    parecer += (parecer ? '\n\n' : '') + p;
                }
            }
            
            // Remove headers tipo "PARECER CLÍNICO:" ou "1."
            parecer = parecer.replace(/^(PARECER\s*(CL[IÍ]NICO)?:?\s*\n?)/i, '').trim();
            parecer = parecer.replace(/^1\.\s*/m, '').trim();
            estrategia = estrategia.replace(/^(ESTRAT[EÉ]GIA\s*(DO\s*PACIENTE)?:?\s*\n?)/i, '').trim();
            estrategia = estrategia.replace(/^2\.\s*/m, '').trim();
            
            console.log('✅ Laudo gerado: ' + parecer.length + ' chars parecer, ' + estrategia.length + ' chars estrategia');
            
            return { parecer: parecer, estrategia: estrategia };
            
        } catch(e) {
            console.error('❌ Erro IA Gemini:', e.message);
            return null;
        }
    }

    return { gerarLaudo: gerarLaudo };
})();

window.BAEAI = BAEAI;
console.log('🤖 BAE AI (Gemini) carregado');
