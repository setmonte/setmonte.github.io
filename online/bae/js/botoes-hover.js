// ===== SISTEMA DE HOVER PARA BOTÕES DE NAVEGAÇÃO =====

function configurarHoverBotoes() {
    if (document.getElementById('btn-hamburger')) return;
    if (document.getElementById('area-hover-botoes')) return;
    
    var isTouch = window.dispositivoBAE && window.dispositivoBAE.isTouch;
    
    if (isTouch) {
        var btnHamburger = document.createElement('button');
        btnHamburger.id = 'btn-hamburger';
        btnHamburger.textContent = '\u2630';
        btnHamburger.style.cssText = 'position:fixed;left:10px;top:10px;width:45px;height:45px;border-radius:50%;border:none;background:#333;color:white;font-size:24px;cursor:pointer;z-index:10001;box-shadow:0 2px 8px rgba(0,0,0,0.3);-webkit-tap-highlight-color:transparent;';
        document.body.appendChild(btnHamburger);
        
        var containerBotoes = document.createElement('div');
        containerBotoes.id = 'container-botoes-hover';
        containerBotoes.style.cssText = 'position:fixed;left:-80px;top:60px;z-index:10000;transition:left 0.3s ease;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(containerBotoes);
        
        var bp = document.createElement('button');
        estilizarBotaoHover(bp, '#e74c3c', '\ud83d\uded1');
        bp.onclick = pararTeste;
        containerBotoes.appendChild(bp);
        
        var bb = document.createElement('button');
        estilizarBotaoHover(bb, '#3498db', '\u23ed\ufe0f');
        bb.onclick = bypassarTestes;
        containerBotoes.appendChild(bb);
        
        var bv = document.createElement('button');
        estilizarBotaoHover(bv, '#f39c12', '\u23ee\ufe0f');
        bv.onclick = voltarTeste;
        containerBotoes.appendChild(bv);
        
        criarBotaoPDFHover(containerBotoes);
        
        var aberto = false;
        btnHamburger.addEventListener('click', function() {
            aberto = !aberto;
            containerBotoes.style.left = aberto ? '10px' : '-80px';
            btnHamburger.textContent = aberto ? '\u2715' : '\u2630';
        });
        
        document.addEventListener('click', function(e) {
            if (aberto && !containerBotoes.contains(e.target) && e.target !== btnHamburger) {
                aberto = false;
                containerBotoes.style.left = '-80px';
                btnHamburger.textContent = '\u2630';
            }
        });
    } else {
        // DESKTOP: hover na lateral esquerda (comportamento original)
        var areaHover = document.createElement('div');
        areaHover.id = 'area-hover-botoes';
        areaHover.style.cssText = 'position:fixed;left:0;top:0;width:50px;height:100vh;z-index:9999;background:transparent;pointer-events:auto;';
        document.body.appendChild(areaHover);
        
        var containerBotoes = document.createElement('div');
        containerBotoes.id = 'container-botoes-hover';
        containerBotoes.style.cssText = 'position:fixed;left:-80px;top:50%;transform:translateY(-50%);z-index:10000;transition:left 0.3s ease;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(containerBotoes);
        
        moverBotoesParaContainer(containerBotoes);
        
        areaHover.addEventListener('mouseenter', function() { containerBotoes.style.left = '10px'; });
        areaHover.addEventListener('mouseleave', function() { containerBotoes.style.left = '-80px'; });
        containerBotoes.addEventListener('mouseenter', function() { containerBotoes.style.left = '10px'; });
        containerBotoes.addEventListener('mouseleave', function() { containerBotoes.style.left = '-80px'; });
    }
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
    
    // Rotulo explicativo ao lado do botao (os botoes continuam escondidos na lateral;
    // o texto so aparece ao passar o mouse / tocar no botao). Escolhido pela cor.
    var rotulos = {
        '#e74c3c': 'Encerrar este teste (ABANDONAR)',
        '#3498db': 'Pular para o pr\u00f3ximo teste',
        '#f39c12': 'Voltar ao teste anterior',
        '#9b59b6': 'Finalizar bateria e enviar resultados'
    };
    if (rotulos[cor]) {
        botao.title = rotulos[cor];
        botao.setAttribute('aria-label', rotulos[cor]);
        botao.style.position = 'relative';
        var rotulo = document.createElement('span');
        rotulo.textContent = rotulos[cor];
        rotulo.style.cssText = 'position:absolute;left:70px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.85);color:#fff;font-size:14px;font-family:Arial,sans-serif;font-weight:normal;padding:6px 10px;border-radius:6px;white-space:nowrap;pointer-events:none;display:none;';
        botao.appendChild(rotulo);
        // No toque nao existe "passar o mouse": o menu ja abre pelo botao hamburguer, entao o texto fica sempre visivel
        if (window.dispositivoBAE && window.dispositivoBAE.isTouch) rotulo.style.display = 'block';
        botao.addEventListener('mouseenter', function() { rotulo.style.display = 'block'; });
        botao.addEventListener('mouseleave', function() { rotulo.style.display = 'none'; });
        botao.addEventListener('focus', function() { rotulo.style.display = 'block'; });
        botao.addEventListener('blur', function() { rotulo.style.display = 'none'; });
    }
    
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
    // Hover so configura depois que iniciar bateria (chamado por mostrarBotoesControle)
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Hover so configura depois que iniciar bateria
}

window.configurarHoverBotoes = configurarHoverBotoes;