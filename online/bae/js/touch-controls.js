// ===== CONTROLES TOUCH PARA MOBILE/TABLET =====
// Só aparece em dispositivos com touch. Desktop não muda nada.

(function() {
    if (!window.dispositivoBAE || !window.dispositivoBAE.isTouch) return;

    var container = null;

    function criarContainer() {
        if (container && document.body.contains(container)) return container;
        if (container) container.remove();
        container = document.createElement('div');
        container.id = 'touch-controls';
        container.style.cssText = 'position:fixed;bottom:20px;left:0;right:0;display:none;justify-content:center;align-items:center;gap:15px;z-index:99999;padding:10px;';
        document.body.appendChild(container);
        return container;
    }

    function criarBotao(texto, cor, callback) {
        var btn = document.createElement('button');
        btn.textContent = texto;
        btn.style.cssText = 'min-width:80px;min-height:70px;border-radius:15px;border:3px solid rgba(255,255,255,0.5);font-size:18px;font-weight:bold;color:white;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3);-webkit-tap-highlight-color:transparent;user-select:none;touch-action:manipulation;background:' + cor + ';';
        
        // Usar click em vez de touchstart para melhor compatibilidade
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            btn.style.transform = 'scale(0.92)';
            setTimeout(function() { btn.style.transform = 'scale(1)'; }, 150);
            callback(e);
        });
        return btn;
    }

    function limpar() {
        if (container) { container.innerHTML = ''; container.style.display = 'none'; }
    }

    // ===== CONCENTRADA: 4 setas =====
    function mostrarBotoesConcentrada() {
        criarContainer();
        limpar();
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.maxWidth = '280px';
        container.style.margin = '0 auto';
        container.style.bottom = '20px';

        var espacoL = document.createElement('div');
        espacoL.style.cssText = 'width:80px;height:70px;';
        var btnCima = criarBotao('↑', '#3498db', function() { simularTecla('ArrowUp'); });
        var espacoR = document.createElement('div');
        espacoR.style.cssText = 'width:80px;height:70px;';
        var btnEsq = criarBotao('←', '#e67e22', function() { simularTecla('ArrowLeft'); });
        var btnBaixo = criarBotao('↓', '#3498db', function() { simularTecla('ArrowDown'); });
        var btnDir = criarBotao('→', '#e67e22', function() { simularTecla('ArrowRight'); });

        container.appendChild(espacoL);
        container.appendChild(btnCima);
        container.appendChild(espacoR);
        container.appendChild(btnEsq);
        container.appendChild(btnBaixo);
        container.appendChild(btnDir);
    }

    // ===== BOTÃO COMEÇAR (espaço) =====
    function mostrarBotaoEspaco(texto) {
        criarContainer();
        limpar();
        container.style.display = 'flex';
        container.style.flexWrap = 'nowrap';
        container.style.maxWidth = '100%';
        container.style.margin = '0 auto';
        container.style.bottom = '20px';
        var btn = criarBotao(texto || 'COMEÇAR', '#27ae60', function() { simularTecla('Space'); });
        btn.style.minWidth = '200px';
        btn.style.minHeight = '80px';
        btn.style.fontSize = '22px';
        container.appendChild(btn);
    }

    // ===== BOTÃO RESPONDER =====
    function mostrarBotaoResponder() {
        criarContainer();
        limpar();
        container.style.display = 'flex';
        container.style.flexWrap = 'nowrap';
        container.style.maxWidth = '100%';
        container.style.margin = '0 auto';
        container.style.bottom = '20px';
        var btn = criarBotao('RESPONDER', '#e74c3c', function() { simularTecla('Space'); });
        btn.style.minWidth = '220px';
        btn.style.minHeight = '90px';
        btn.style.fontSize = '24px';
        btn.style.borderRadius = '20px';
        container.appendChild(btn);
    }

    // ===== DIVIDIDA: 2 botões =====
    function mostrarBotoesDividida() {
        criarContainer();
        limpar();
        container.style.display = 'flex';
        container.style.flexWrap = 'nowrap';
        container.style.maxWidth = '100%';
        container.style.margin = '0 auto';
        container.style.bottom = '20px';
        var btnVisual = criarBotao('👁 VISUAL', '#28a745', function() { simularTecla('Space'); });
        btnVisual.style.minWidth = '150px';
        btnVisual.style.minHeight = '80px';
        btnVisual.style.fontSize = '20px';
        var btnAuditivo = criarBotao('🔊 AUDITIVO', '#007BFF', function() { simularTecla('Enter'); });
        btnAuditivo.style.minWidth = '150px';
        btnAuditivo.style.minHeight = '80px';
        btnAuditivo.style.fontSize = '20px';
        container.appendChild(btnVisual);
        container.appendChild(btnAuditivo);
    }

    function simularTecla(code) {
        var key = code;
        var keyCode = 0;
        if (code === 'Space') { key = ' '; keyCode = 32; }
        else if (code === 'Enter') { key = 'Enter'; keyCode = 13; }
        else if (code === 'ArrowUp') { key = 'ArrowUp'; keyCode = 38; }
        else if (code === 'ArrowDown') { key = 'ArrowDown'; keyCode = 40; }
        else if (code === 'ArrowLeft') { key = 'ArrowLeft'; keyCode = 37; }
        else if (code === 'ArrowRight') { key = 'ArrowRight'; keyCode = 39; }

        window._ultimaEntradaTouch = true;

        var evt = new KeyboardEvent('keydown', {
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(evt);
    }

    window.touchControls = {
        mostrarBotoesConcentrada: mostrarBotoesConcentrada,
        mostrarBotaoEspaco: mostrarBotaoEspaco,
        mostrarBotaoResponder: mostrarBotaoResponder,
        mostrarBotoesDividida: mostrarBotoesDividida,
        limpar: limpar
    };

    console.log('📱 Controles touch carregados');
})();
