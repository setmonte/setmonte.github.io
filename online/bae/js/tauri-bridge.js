// ===== BRIDGE TAURI — BAE 2.3 =====
// Substitui sistema-eliminacao.js (Electron) por chamadas Tauri

// Detecta se está rodando no Tauri
var isTauri = window.__TAURI__ !== undefined;

// Função para salvar resultados e fechar aplicação
window.salvarResultadosEFecharApp = async function() {
    try {
        const dadosCompletos = {
            paciente: window.resultadosBAE?.paciente || capturarDadosPaciente(),
            resultados: window.resultadosBAE || {},
            dataGeracao: new Date().toISOString(),
            versao: 'BAE 2.3',
            sistema: 'SΨM'
        };

        const agora = new Date();
        const timestamp = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}_${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
        const nomeArquivo = `BAE2.3_Resultados_${timestamp}.json`;
        const conteudo = JSON.stringify(dadosCompletos, null, 2);

        if (isTauri) {
            const caminho = await window.__TAURI__.core.invoke('salvar_resultados', {
                nomeArquivo: nomeArquivo,
                conteudo: conteudo
            });
            alert(`Resultados salvos em:\n${caminho}\n\nEnvie este arquivo para seu psicólogo.`);
        } else {
            // Fallback navegador: download
            const blob = new Blob([conteudo], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = nomeArquivo;
            a.click();
            alert('Resultados salvos! Envie o arquivo baixado para seu psicólogo.');
        }
    } catch (error) {
        console.error('Erro ao salvar resultados:', error);
        alert('Erro ao salvar resultados. Tente novamente.');
    }
};

// Adiciona botão de finalizar após todos os testes
function adicionarBotaoFinalizar() {
    const testesRealizados = Object.keys(window.resultadosBAE || {}).filter(k =>
        k !== 'paciente' && k !== 'testesCompletos'
    );

    if (testesRealizados.length >= 5) {
        const botoesExistentes = document.querySelectorAll('.botao-finalizar-app');
        botoesExistentes.forEach(btn => btn.remove());

        const botaoFinalizar = document.createElement('button');
        botaoFinalizar.className = 'botao-iniciar botao-finalizar-app';
        botaoFinalizar.innerHTML = '🏁 FINALIZAR E ENVIAR RESULTADOS';
        botaoFinalizar.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: #28a745; color: white; border: none;
            padding: 15px 25px; border-radius: 8px;
            font-size: 16px; font-weight: bold; cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 9999;
        `;
        botaoFinalizar.onclick = () => {
            if (confirm('Finalizar os testes?\n\n✅ Resultados serão salvos na área de trabalho\n📧 Envie o arquivo para seu psicólogo')) {
                window.salvarResultadosEFecharApp();
            }
        };
        document.body.appendChild(botaoFinalizar);
    }
}

// Monitora conclusão de testes
const originalSalvarResultado = window.salvarResultadoTeste;
if (originalSalvarResultado) {
    window.salvarResultadoTeste = function(nomeTeste, dados) {
        originalSalvarResultado(nomeTeste, dados);
        setTimeout(adicionarBotaoFinalizar, 1000);
    };
}

console.log(`✅ BAE 2.3 bridge carregado (${isTauri ? 'Tauri' : 'Navegador'})`);
