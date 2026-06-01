// ============================================================
// COLETA ANONIMA DE DADOS NORMATIVOS - v3
// ============================================================
// Intercepta AMBOS os fluxos:
// - Modo profissional: calcularResultados()
// - Modo painel (link): _enviarResultadosPainel()
// ============================================================

(function() {
    var _COLETA_URL = 'https://script.google.com/macros/s/AKfycbzYl7-ageXnHHyvrKMb6iS_7gX2l6ZBngPpbCHNfj7YYbXylcZ_vQ9iJkrbko8ICPcW/exec';
    var _jaEnviou = false;

    function _extrairIdadeAnos() {
        var campo = document.getElementById('idadeCalculada') || document.getElementById('idade');
        if (campo && campo.value) {
            var match = campo.value.match(/(\d+)\s*ano/);
            if (match) return parseInt(match[1]);
            var num = parseInt(campo.value);
            if (!isNaN(num)) return num;
        }
        if (window.resultadosBAE && window.resultadosBAE.paciente) {
            if (window.resultadosBAE.paciente.idadeAnos) return window.resultadosBAE.paciente.idadeAnos;
        }
        var dnCampo = document.getElementById('dataNascimento');
        if (dnCampo && dnCampo.value) {
            var nasc = new Date(dnCampo.value);
            var hoje = new Date();
            var id = hoje.getFullYear() - nasc.getFullYear();
            if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) id--;
            if (id > 0 && id < 120) return id;
        }
        return null;
    }

    function _extrairSexo() {
        var campo = document.getElementById('sexo');
        if (campo && campo.value) return campo.value;
        if (window.resultadosBAE && window.resultadosBAE.paciente) return window.resultadosBAE.paciente.sexo || '';
        return '';
    }

    function _extrairEscolaridade() {
        var campo = document.getElementById('escolaridade');
        if (campo && campo.value) return campo.value;
        if (window.resultadosBAE && window.resultadosBAE.paciente) return window.resultadosBAE.paciente.escolaridade || '';
        return '';
    }

    function _identificarInstrumento() {
        if (window._escalaDados && window._escalaDados.escala) return window._escalaDados.escala;
        if (window.resultadosBAE && window.resultadosBAE.concentrada) return 'BAE';
        var titulo = document.title || '';
        var match = titulo.match(/^([A-Z0-9\-]+)/);
        if (match) return match[1];
        return titulo.substring(0, 30);
    }

    function _formatarDominios(dominios) {
        if (!dominios) return '';
        var partes = [];
        Object.keys(dominios).forEach(function(nome) {
            var d = dominios[nome];
            var media = typeof d === 'object' ? (d.media || d.score || '') : d;
            partes.push(nome + ':' + media);
        });
        return partes.join('; ');
    }

    function _enviarDadosAnonimos() {
        if (_jaEnviou) return;
        try {
            var idade = _extrairIdadeAnos();
            var sexo = _extrairSexo();
            var escolaridade = _extrairEscolaridade();
            var instrumento = _identificarInstrumento();

            if (!instrumento || !idade) {
                console.log('[Coleta] Dados insuficientes: instrumento=' + instrumento + ', idade=' + idade);
                return;
            }

            var pontuacao = '';
            var dominios = '';
            var classificacao = '';

            if (window._escalaDados) {
                pontuacao = window._escalaDados.escore ? parseFloat(window._escalaDados.escore).toFixed(2) : '';
                dominios = _formatarDominios(window._escalaDados.dominios);
                classificacao = window._escalaDados.classificacao || '';
            }

            var pacote = {
                escala: instrumento,
                idade: idade,
                sexo: sexo,
                escolaridade: escolaridade,
                pontuacao: pontuacao,
                dominios: dominios,
                classificacao: classificacao
            };

            console.log('[Coleta] Enviando:', JSON.stringify(pacote));

            fetch(_COLETA_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(pacote)
            }).then(function() {
                console.log('[Coleta] Enviado com sucesso');
            }).catch(function(e) {
                console.log('[Coleta] Erro no fetch:', e);
            });

            _jaEnviou = true;
        } catch(e) {
            console.log('[Coleta] Erro geral:', e);
        }
    }

    // ============================================================
    // INTERCEPTACAO DE FUNCOES
    // ============================================================

    function _interceptar() {
        // Intercepta calcularResultados (modo profissional)
        if (typeof window.calcularResultados === 'function' && !window._cr_interceptado) {
            var _original_cr = window.calcularResultados;
            window.calcularResultados = function() {
                _original_cr();
                setTimeout(_enviarDadosAnonimos, 500);
            };
            window._cr_interceptado = true;
            console.log('[Coleta] calcularResultados interceptado');
        }

        // Intercepta _enviarResultadosPainel (modo painel/link)
        if (typeof window._enviarResultadosPainel === 'function' && !window._erp_interceptado) {
            var _original_erp = window._enviarResultadosPainel;
            window._enviarResultadosPainel = function() {
                // Envia coleta anonima ANTES de enviar ao painel
                setTimeout(_enviarDadosAnonimos, 500);
                // Chama a funcao original
                return _original_erp.apply(this, arguments);
            };
            window._erp_interceptado = true;
            console.log('[Coleta] _enviarResultadosPainel interceptado');
        }
    }

    // Tenta interceptar em varios momentos (o script carrega async)
    _interceptar();
    setTimeout(_interceptar, 500);
    setTimeout(_interceptar, 1500);
    setTimeout(_interceptar, 3000);
    setTimeout(_interceptar, 5000);

})();
