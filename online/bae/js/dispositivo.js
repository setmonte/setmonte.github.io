// ===== DETECÇÃO DE DISPOSITIVO E MODO DE ENTRADA =====
// Registra cada interação (teclado vs touch) individualmente

window.dispositivoBAE = (function() {
    var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var w = screen.width;
    var h = screen.height;
    var maior = Math.max(w, h);
    var menor = Math.min(w, h);

    // Classificação por tamanho + touch
    var tipo;
    if (maior > 1024) {
        tipo = isTouch ? 'Desktop com touch' : 'Desktop';
    } else if (menor >= 768 || maior >= 1024) {
        tipo = 'Tablet';
    } else {
        tipo = 'Mobile';
    }

    // User agent simplificado
    var ua = navigator.userAgent;
    var modelo = '';
    if (/iPad/.test(ua)) modelo = 'iPad';
    else if (/iPhone/.test(ua)) modelo = 'iPhone';
    else if (/Android/.test(ua)) {
        var m = ua.match(/;\s*([^;)]+)\s*Build/);
        modelo = m ? m[1].trim() : 'Android';
    } else if (/Windows/.test(ua)) modelo = 'Windows';
    else if (/Mac/.test(ua)) modelo = 'Mac';
    else if (/Linux/.test(ua)) modelo = 'Linux';

    // Registro de interações por teste
    var interacoes = {};
    var testeAtual = null;

    function iniciarTeste(nome) {
        testeAtual = nome;
        if (!interacoes[nome]) interacoes[nome] = { teclado: 0, touch: 0, temposTeclado: [], temposTouch: [] };
    }

    function registrarInteracao(modo, tempoReacao) {
        if (!testeAtual || !interacoes[testeAtual]) return;
        var reg = interacoes[testeAtual];
        if (modo === 'teclado') {
            reg.teclado++;
            if (tempoReacao > 0) reg.temposTeclado.push(tempoReacao);
        } else {
            reg.touch++;
            if (tempoReacao > 0) reg.temposTouch.push(tempoReacao);
        }
    }

    function obterResumo(nomeTeste) {
        var reg = interacoes[nomeTeste || testeAtual];
        if (!reg) return { modo: 'N/A', teclado: 0, touch: 0 };
        var total = reg.teclado + reg.touch;
        var modo;
        if (reg.touch === 0) modo = 'Teclado';
        else if (reg.teclado === 0) modo = 'Touch';
        else modo = 'Misto (' + Math.round(reg.teclado / total * 100) + '% Teclado / ' + Math.round(reg.touch / total * 100) + '% Touch)';

        var mediaTeclado = reg.temposTeclado.length > 0 ? reg.temposTeclado.reduce(function(a, b) { return a + b; }, 0) / reg.temposTeclado.length : 0;
        var mediaTouch = reg.temposTouch.length > 0 ? reg.temposTouch.reduce(function(a, b) { return a + b; }, 0) / reg.temposTouch.length : 0;

        return {
            modo: modo,
            teclado: reg.teclado,
            touch: reg.touch,
            mediaTeclado: Math.round(mediaTeclado),
            mediaTouch: Math.round(mediaTouch),
            alternanciasModo: calcularAlternancias(nomeTeste)
        };
    }

    // Conta quantas vezes o paciente alternou entre teclado e touch
    var sequenciaModos = {};
    function registrarSequencia(modo) {
        if (!testeAtual) return;
        if (!sequenciaModos[testeAtual]) sequenciaModos[testeAtual] = [];
        sequenciaModos[testeAtual].push(modo);
    }

    function calcularAlternancias(nomeTeste) {
        var seq = sequenciaModos[nomeTeste || testeAtual];
        if (!seq || seq.length < 2) return 0;
        var alt = 0;
        for (var i = 1; i < seq.length; i++) {
            if (seq[i] !== seq[i - 1]) alt++;
        }
        return alt;
    }

    // Registro completo com interação + sequência
    function registrar(modo, tempoReacao) {
        registrarInteracao(modo, tempoReacao);
        registrarSequencia(modo);
    }

    function obterInfoDispositivo() {
        return {
            tipo: tipo,
            modelo: modelo,
            tela: w + 'x' + h,
            touch: isTouch,
            descricao: tipo + ' - ' + modelo + ' (' + w + 'x' + h + ') - ' + (isTouch ? 'Touch disponível' : 'Sem touch')
        };
    }

    function obterRelatorioCompleto() {
        var info = obterInfoDispositivo();
        var testes = {};
        for (var nome in interacoes) {
            testes[nome] = obterResumo(nome);
        }
        return { dispositivo: info, testes: testes };
    }

    console.log('📱 Dispositivo: ' + tipo + ' - ' + modelo + ' (' + w + 'x' + h + ') Touch=' + isTouch);

    return {
        isTouch: isTouch,
        tipo: tipo,
        iniciarTeste: iniciarTeste,
        registrar: registrar,
        obterResumo: obterResumo,
        obterInfoDispositivo: obterInfoDispositivo,
        obterRelatorioCompleto: obterRelatorioCompleto
    };
})();
