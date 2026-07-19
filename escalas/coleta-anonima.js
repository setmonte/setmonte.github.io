// ============================================================
// COLETA ANONIMA DE DADOS NORMATIVOS - v4 (UNIVERSAL)
// ============================================================
// Funciona em ESCALAS e TESTES ONLINE
// Detecta conclusao por multiplas estrategias
// ============================================================

(function() {
    var _COLETA_URL = 'https://script.google.com/macros/s/AKfycbzYl7-ageXnHHyvrKMb6iS_7gX2l6ZBngPpbCHNfj7YYbXylcZ_vQ9iJkrbko8ICPcW/exec';
    var _jaEnviou = false;

    function _extrairEmailProfissional() {
        // Modo demo (amostra publica) - marcar com [AMOSTRA]
        if (window._demoMode) {
            var demoEmail = window._demoEmail || '';
            if (demoEmail) return '[AMOSTRA] ' + demoEmail;
            return '[AMOSTRA] Publ.';
        }
        if (window._sessionInfo && window._sessionInfo.email) return window._sessionInfo.email;
        if (window.sessionData && window.sessionData.email) return window.sessionData.email;
        if (window.sessionInfo && window.sessionInfo.email) return window.sessionInfo.email;
        if (window.currentUser) return window.currentUser;
        if (window._sessionInfoSmi && window._sessionInfoSmi.email) return window._sessionInfoSmi.email;
        if (window._sessionInfoYsq && window._sessionInfoYsq.email) return window._sessionInfoYsq.email;
        return '';
    }

    function _extrairIdadeAnos() {
        var campo = document.getElementById('idadeCalculada') || document.getElementById('idade');
        if (campo && campo.value) {
            var match = campo.value.match(/(\d+)\s*ano/);
            if (match) return parseInt(match[1]);
            var num = parseInt(campo.value);
            if (!isNaN(num)) return num;
        }
        // resultadosBAE (BAE online)
        if (window.resultadosBAE && window.resultadosBAE.paciente) {
            if (window.resultadosBAE.paciente.idadeAnos) return window.resultadosBAE.paciente.idadeAnos;
            if (window.resultadosBAE.paciente.idade) {
                var m2 = window.resultadosBAE.paciente.idade.match(/(\d+)\s*ano/);
                if (m2) return parseInt(m2[1]);
            }
        }
        // sessionData (testes online via link)
        if (window.sessionData && window.sessionData.birthDate) {
            var nasc = new Date(window.sessionData.birthDate);
            var hoje = new Date();
            var id = hoje.getFullYear() - nasc.getFullYear();
            if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) id--;
            if (id > 0 && id < 120) return id;
        }
        // sessionInfo (TREF, TFLOD)
        if (window.sessionInfo && window.sessionInfo.birthDate) {
            var nasc2 = new Date(window.sessionInfo.birthDate);
            var hoje2 = new Date();
            var id2 = hoje2.getFullYear() - nasc2.getFullYear();
            if (hoje2.getMonth() < nasc2.getMonth() || (hoje2.getMonth() === nasc2.getMonth() && hoje2.getDate() < nasc2.getDate())) id2--;
            if (id2 > 0 && id2 < 120) return id2;
        }
        // Campo oculto dataNascimento
        var dnCampo = document.getElementById('dataNascimento');
        if (dnCampo && dnCampo.value) {
            var nasc3 = new Date(dnCampo.value);
            var hoje3 = new Date();
            var id3 = hoje3.getFullYear() - nasc3.getFullYear();
            if (hoje3.getMonth() < nasc3.getMonth() || (hoje3.getMonth() === nasc3.getMonth() && hoje3.getDate() < nasc3.getDate())) id3--;
            if (id3 > 0 && id3 < 120) return id3;
        }
        return null;
    }

    function _extrairSexo() {
        var campo = document.getElementById('sexo');
        if (campo && campo.value) return campo.value;
        if (window.resultadosBAE && window.resultadosBAE.paciente) return window.resultadosBAE.paciente.sexo || '';
        if (window.sessionData && window.sessionData.sex) return window.sessionData.sex;
        if (window.sessionInfo && window.sessionInfo.sex) return window.sessionInfo.sex;
        return '';
    }

    function _extrairEscolaridade() {
        var campo = document.getElementById('escolaridade');
        if (campo && campo.value) return campo.value;
        if (window.resultadosBAE && window.resultadosBAE.paciente) return window.resultadosBAE.paciente.escolaridade || '';
        if (window.sessionData && window.sessionData.education) return window.sessionData.education;
        if (window.sessionInfo && window.sessionInfo.education) return window.sessionInfo.education;
        return '';
    }

    function _identificarInstrumento() {
        // Prioridade 1: window._escalaDados (fonte mais confiavel)
        if (window._escalaDados && window._escalaDados.escala) return window._escalaDados.escala;
        if (window.resultadosBAE && (window.resultadosBAE.concentrada || window.resultadosBAE.seletiva || window.resultadosBAE.dividida || window.resultadosBAE.alternada || window.resultadosBAE.sustentada)) return 'BAE';
        // NAO usar titulo da pagina como fallback - pode gerar siglas invalidas
        return '';
    }

    function _formatarDominios(dominios) {
        if (!dominios) return '';
        var partes = [];
        Object.keys(dominios).forEach(function(nome) {
            var d = dominios[nome];
            var media = typeof d === 'object' ? (d.media || d.score || d.acertos || '') : d;
            partes.push(nome + ':' + media);
        });
        return partes.join('; ');
    }

    function _formatarResultadosBAE() {
        var r = window.resultadosBAE || {};
        var partes = [];
        var testes = ['concentrada', 'seletiva', 'dividida', 'alternada', 'sustentada'];
        testes.forEach(function(t) {
            if (r[t]) {
                var ac = r[t].acertos !== undefined ? r[t].acertos : (r[t].corretas !== undefined ? r[t].corretas : '');
                var er = r[t].erros !== undefined ? r[t].erros : '';
                var om = r[t].omissoes !== undefined ? r[t].omissoes : '';
                partes.push(t + '(ac:' + ac + ' er:' + er + ' om:' + om + ')');
            }
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

            // Validacoes obrigatorias para nao contaminar a coleta
            if (!instrumento) return;              // sem instrumento = nao envia
            if (instrumento.length < 3) return;    // sigla com menos de 3 chars = invalida
            if (!idade) return;                    // sem idade = nao envia

            var pontuacao = '';
            var dominios = '';
            var classificacao = '';

            if (window._escalaDados) {
                pontuacao = window._escalaDados.escore ? parseFloat(window._escalaDados.escore).toFixed(2) : '';
                dominios = _formatarDominios(window._escalaDados.dominios);
                classificacao = window._escalaDados.classificacao || '';
            } else if (window.resultadosBAE && (window.resultadosBAE.concentrada || window.resultadosBAE.seletiva || window.resultadosBAE.dividida || window.resultadosBAE.alternada || window.resultadosBAE.sustentada)) {
                dominios = _formatarResultadosBAE();
                classificacao = 'BAE';
            }

            // Sem pontuacao E sem dominios = teste nao foi calculado, nao enviar
            if (!pontuacao && !dominios) return;

            var pacote = {
                email: _extrairEmailProfissional(),
                escala: instrumento,
                idade: idade,
                sexo: sexo,
                escolaridade: escolaridade,
                pontuacao: pontuacao,
                dominios: dominios,
                classificacao: classificacao
            };

            fetch(_COLETA_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(pacote)
            }).catch(function() {});

            _jaEnviou = true;
        } catch(e) {}
    }

    // ============================================================
    // ESTRATEGIAS DE DETECCAO
    // ============================================================

    function _interceptar() {
        // 1. calcularResultados (escalas modo profissional)
        if (typeof window.calcularResultados === 'function' && !window._cr_interceptado) {
            var _orig_cr = window.calcularResultados;
            window.calcularResultados = function() {
                _orig_cr.apply(this, arguments);
                setTimeout(_enviarDadosAnonimos, 500);
            };
            window._cr_interceptado = true;
        }

        // 2. _enviarResultadosPainel (escalas modo painel)
        if (typeof window._enviarResultadosPainel === 'function' && !window._erp_interceptado) {
            var _orig_erp = window._enviarResultadosPainel;
            window._enviarResultadosPainel = function() {
                setTimeout(_enviarDadosAnonimos, 500);
                return _orig_erp.apply(this, arguments);
            };
            window._erp_interceptado = true;
        }

        // 3. salvarResultadoLambda (TREF)
        if (typeof window.salvarResultadoLambda === 'function' && !window._srl_interceptado) {
            var _orig_srl = window.salvarResultadoLambda;
            window.salvarResultadoLambda = function() {
                setTimeout(_enviarDadosAnonimos, 500);
                return _orig_srl.apply(this, arguments);
            };
            window._srl_interceptado = true;
        }

        // 4. finalizarTeste (TRMV)
        if (typeof window.finalizarTeste === 'function' && !window._ft_interceptado) {
            var _orig_ft = window.finalizarTeste;
            window.finalizarTeste = function() {
                setTimeout(_enviarDadosAnonimos, 500);
                return _orig_ft.apply(this, arguments);
            };
            window._ft_interceptado = true;
        }

        // 5. finalizarGravacao (TFLOD)
        if (typeof window.finalizarGravacao === 'function' && !window._fg_interceptado) {
            var _orig_fg = window.finalizarGravacao;
            window.finalizarGravacao = function() {
                setTimeout(_enviarDadosAnonimos, 1000);
                return _orig_fg.apply(this, arguments);
            };
            window._fg_interceptado = true;
        }

        // 6. mostrarResultados (TREF alternativo)
        if (typeof window.mostrarResultados === 'function' && !window._mr_interceptado) {
            var _orig_mr = window.mostrarResultados;
            window.mostrarResultados = function() {
                _orig_mr.apply(this, arguments);
                setTimeout(_enviarDadosAnonimos, 500);
            };
            window._mr_interceptado = true;
        }

        // 7. showEndScreen (TECFE)
        if (typeof window.showEndScreen === 'function' && !window._ses_interceptado) {
            var _orig_ses = window.showEndScreen;
            window.showEndScreen = function() {
                _orig_ses.apply(this, arguments);
                setTimeout(_enviarDadosAnonimos, 500);
            };
            window._ses_interceptado = true;
        }

        // 8. _prepararDadosEEnviar (CORSI modo painel)
        if (typeof window._prepararDadosEEnviar === 'function' && !window._pde_interceptado) {
            var _orig_pde = window._prepararDadosEEnviar;
            window._prepararDadosEEnviar = function() {
                var result = _orig_pde.apply(this, arguments);
                setTimeout(_enviarDadosAnonimos, 1500);
                return result;
            };
            window._pde_interceptado = true;
        }
    }

    // Tenta interceptar varias vezes (scripts carregam async)
    _interceptar();
    setTimeout(_interceptar, 500);
    setTimeout(_interceptar, 1500);
    setTimeout(_interceptar, 3000);
    setTimeout(_interceptar, 5000);
    setTimeout(_interceptar, 8000);
    setTimeout(_interceptar, 12000);

    // Estrategia extra: observar navegacao para pagina-concluido (TAAV, TRMV)
    function _observarNavegacao() {
        if (typeof window.navegarPara === 'function' && !window._nav_interceptado) {
            var _orig_nav = window.navegarPara;
            window.navegarPara = function(id) {
                _orig_nav.apply(this, arguments);
                if (id === 'pagina-concluido') {
                    setTimeout(_enviarDadosAnonimos, 2000);
                }
            };
            window._nav_interceptado = true;
        }
    }
    setTimeout(_observarNavegacao, 500);
    setTimeout(_observarNavegacao, 2000);
    setTimeout(_observarNavegacao, 5000);

    // Fallback: observa #resultados (escalas), #endPage (BAE)
    setTimeout(function() {
        var resultados = document.getElementById('resultados');
        if (resultados) {
            var obs = new MutationObserver(function() {
                if (resultados.style.display === 'block' && !_jaEnviou) {
                    setTimeout(_enviarDadosAnonimos, 1000);
                }
            });
            obs.observe(resultados, { attributes: true, childList: true });
        }
        var endPage = document.getElementById('endPage');
        if (endPage) {
            var obs2 = new MutationObserver(function() {
                if (endPage.style.display === 'block' || endPage.style.display === 'flex') {
                    setTimeout(_enviarDadosAnonimos, 2000);
                }
            });
            obs2.observe(endPage, { attributes: true });
        }
    }, 2000);

})();
