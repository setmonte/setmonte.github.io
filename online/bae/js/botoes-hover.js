// ===== SISTEMA DE HOVER PARA BOTÕES DE NAVEGAÇÃO =====

function configurarHoverBotoes() {
    if (document.getElementById('area-hover-botoes')) return;
    
    const areaHover = document.createElement('div');
    areaHover.id = 'area-hover-botoes';
    areaHover.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 50px;
        height: 100vh;
        z-index: 9999;
        background: transparent;
        pointer-events: auto;
    `;
    document.body.appendChild(areaHover);
    
    const containerBotoes = document.createElement('div');
    containerBotoes.id = 'container-botoes-hover';
    containerBotoes.style.cssText = `
        position: fixed;
        left: -80px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10000;
        transition: left 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(containerBotoes);
    
    moverBotoesParaContainer(containerBotoes);
    
    areaHover.addEventListener('mouseenter', () => {
        containerBotoes.style.left = '10px';
    });
    
    areaHover.addEventListener('mouseleave', () => {
        containerBotoes.style.left = '-80px';
    });
    
    containerBotoes.addEventListener('mouseenter', () => {
        containerBotoes.style.left = '10px';
    });
    
    containerBotoes.addEventListener('mouseleave', () => {
        containerBotoes.style.left = '-80px';
    });
}

function moverBotoesParaContainer(container) {
    const botaoParar = document.querySelector('.botao-parar');
    const botaoBypass = document.querySelector('.botao-bypassar');
    const botaoVoltar = document.querySelector('.botao-voltar');
    
    if (botaoParar && !botaoParar.dataset.moved) {
        estilizarBotaoHover(botaoParar, '#e74c3c', '🛑');
        botaoParar.onclick = pararTeste;
        botaoParar.dataset.moved = 'true';
        container.appendChild(botaoParar);
    }
    
    if (botaoBypass && !botaoBypass.dataset.moved) {
        estilizarBotaoHover(botaoBypass, '#3498db', '⏭️');
        botaoBypass.onclick = bypassarTestes;
        botaoBypass.dataset.moved = 'true';
        container.appendChild(botaoBypass);
    }
    
    if (botaoVoltar && !botaoVoltar.dataset.moved) {
        estilizarBotaoHover(botaoVoltar, '#f39c12', '⏮️');
        botaoVoltar.onclick = voltarTeste;
        botaoVoltar.dataset.moved = 'true';
        container.appendChild(botaoVoltar);
    }
    
    criarBotaoPDFHover(container);
}

function criarBotaoPDFHover(container) {
    if (document.getElementById('botao-pdf-hover')) return;
    
    const botaoPDF = document.createElement('button');
    botaoPDF.id = 'botao-pdf-hover';
    botaoPDF.onclick = () => {
        if (typeof gerarRelatorioPDF === 'function') {
            gerarRelatorioPDF();
        }
    };
    estilizarBotaoHover(botaoPDF, '#9b59b6', '📄');
    container.appendChild(botaoPDF);
}

function estilizarBotaoHover(botao, cor, icone) {
    botao.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: ${cor};
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    botao.textContent = icone;
    
    botao.addEventListener('mouseenter', () => {
        botao.style.transform = 'scale(1.1)';
        botao.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
    });
    
    botao.addEventListener('mouseleave', () => {
        botao.style.transform = 'scale(1)';
        botao.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(configurarHoverBotoes, 1500);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(configurarHoverBotoes, 1500);
}

window.configurarHoverBotoes = configurarHoverBotoes;