// tecfe-v7-main.js
// Orquestrador principal - adaptado para Tauri v2
// SEM acentos nos comentarios/strings do codigo

(function () {

  var selectStartTime = 0;

  // -- Gera ID unico do paciente: hash(nascimento + 3 primeiras letras do nome) --
  function gerarIdPaciente(nome, nascimento) {
    if (!nascimento || !nome || nome.trim().length < 1) return null;
    var n = nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z]/g,'').toLowerCase();
    var prefixo = n.substring(0, 3);
    var raw = nascimento + '+' + prefixo;
    var hash = 5381;
    for (var i = 0; i < raw.length; i++) hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    return 'P' + Math.abs(hash).toString(36).toUpperCase();
  }

  // -- API bridge: Tauri ou pywebview ou fallback --
  var API = {};
  function initAPI() {
    if (window.__TAURI__) {
      var invoke = window.__TAURI__.core.invoke;
      API.get_machine_id = function() { return invoke('get_machine_id'); };
      API.is_activated = function() { return invoke('is_activated'); };
      API.activate = function(chave) { return invoke('activate', { chave: chave }); };
      API.is_demo_available = function() { return invoke('is_demo_available'); };
      API.use_demo = function() { return invoke('use_demo'); };
      API.save_historico = function(patientId, registro) { return invoke('save_historico', { patientId: patientId, registro: registro }); };
      API.get_historico = function(patientId) { return invoke('get_historico', { patientId: patientId }); };
      API.save_pdf = function(fname, dataUrl) { return invoke('save_pdf', { filename: fname, dataUrl: dataUrl }); };
      API.auto_save = function(data) { return invoke('auto_save', { data: data }); };
      API.load_auto_save = function() { return invoke('load_auto_save'); };
      API.clear_auto_save = function() { return invoke('clear_auto_save'); };
      API.close_app = function() { return invoke('close_app'); };
      API.available = true;
    } else if (window.pywebview && window.pywebview.api) {
      API = window.pywebview.api;
      API.available = true;
    } else {
      API.available = false;
    }
  }

  // -- Exibir versao do app --
  function displayVersion() {
    if (window.__TAURI__) {
      window.__TAURI__.app.getVersion().then(function(v) {
        var els = document.querySelectorAll('#appVersion, #testVersion');
        els.forEach(function(el) { el.textContent = 'v' + v; });
        document.title = 'TECFE v' + v + ' - Teste Eletronico de Classificacao de Cartas para Funcoes Executivas';
      }).catch(function() {});
    }
  }

  // -- Interceptar fechamento da janela (X) --
  function setupCloseInterceptor() {
    if (!window.__TAURI__) return;
    window.__TAURI__.event.listen('close-requested', function() {
      if (WCSTEngine.state.isActive) {
        // Teste em andamento — perguntar antes de fechar
        window.__TAURI__.dialog.ask(
          'Teste em andamento! Deseja sair? Os dados serao salvos como abandonado.',
          { title: 'Fechar programa', kind: 'warning' }
        ).then(function(yes) {
          if (yes) {
            endTest(false, true);
          }
        });
      } else {
        // Nenhum teste ativo — fechar normalmente
        window.__TAURI__.core.invoke('close_app');
      }
    });
  }

  // -- Inicializacao --
  window.addEventListener('load', function () {
    WCSTUI.initForm();
    WCSTUI.initKeyBlock();
    setupCloseInterceptor();
    displayVersion();
    if (window.__TAURI__) {
      initAPI();
      checkActivation();
      checkForUpdates();
    } else if (window.pywebview) {
      initAPI();
      checkActivation();
    } else {
      window.addEventListener('pywebviewready', function () {
        initAPI();
        checkActivation();
      });
      setTimeout(function () {
        if (!window.pywebview && !window.__TAURI__) {
          initAPI();
          checkActivation();
        }
      }, 500);
    }
  });

  // -- Tela de ativacao --
  function checkActivation() {
    var actPage = document.getElementById('activationPage');
    var coverPage = document.getElementById('coverPage');

    if (!API.available) {
      actPage.style.display = 'none';
      coverPage.style.display = 'flex';
      checkAutoSave();
      return;
    }

    API.is_activated().then(function (ok) {
      if (ok) {
        actPage.style.display = 'none';
        coverPage.style.display = 'flex';
        checkAutoSave();
      } else {
        actPage.style.display = 'flex';
        coverPage.style.display = 'none';
        loadMachineId();
      }
    });
  }

  function loadMachineId() {
    if (!API.available) return;
    API.get_machine_id().then(function (id) {
      var el = document.getElementById('machineId');
      if (el) el.textContent = id;
    });
    API.is_demo_available().then(function (ok) {
      var btn = document.getElementById('btnDemo');
      if (btn) {
        if (ok > 0) {
          btn.disabled = false;
          btn.textContent = 'Demo (' + ok + 'x restantes)';
        } else {
          btn.disabled = true;
          btn.textContent = 'Demo esgotado';
        }
      }
    });
  }

  window.doActivate = function () {
    var input = document.getElementById('licenseKey');
    if (!input || !input.value.trim()) {
      alert('Digite a chave de ativacao.');
      return;
    }
    API.activate(input.value.trim()).then(function (ok) {
      if (ok) {
        alert('Ativado com sucesso!');
        document.getElementById('activationPage').style.display = 'none';
        document.getElementById('coverPage').style.display = 'flex';
        checkAutoSave();
      } else {
        alert('Chave invalida para esta maquina.');
      }
    });
  };

  window.doDemo = function () {
    API.use_demo().then(function (ok) {
      if (ok) {
        document.getElementById('activationPage').style.display = 'none';
        document.getElementById('coverPage').style.display = 'flex';
        checkAutoSave();
      } else {
        alert('Demo ja utilizado nesta maquina.');
      }
    });
  };

  // -- Iniciar teste --
  window.startTest = function () {
    if (!WCSTUI.validateForm()) return;

    WCSTEngine.reset();
    WCSTEngine.state.isActive = true;

    document.getElementById('coverPage').style.display = 'none';
    document.getElementById('testPage').style.display = 'flex';
    document.getElementById('exitButton').style.display = 'block';

    WCSTUI.enterFullscreen();
    WCSTUI.blockKeys(true);

    renderDeck();
    setupStimulus();
  };

  function setupStimulus() {
    WCSTUI.setupClickMatch(
      '.card.droppable',
      handleMatch
    );
  }

  function renderDeck() {
    var container = document.getElementById('responseCards');
    container.innerHTML = '';
    var deck = WCSTEngine.state.currentDeck;
    var start = WCSTEngine.state.cardIndex;
    for (var i = start; i < deck.length; i++) {
      var el = WCSTUI.createResponseCard(deck[i], i);
      container.appendChild(el);
    }
  }

  // -- Handler de combinacao (carta selecionada + carta modelo) --
  function handleMatch(selectedCard, targetCard) {
    if (!WCSTEngine.state.isActive) return;

    var selCor = selectedCard.dataset.cor;
    var selForma = selectedCard.dataset.forma;
    var selNumero = selectedCard.dataset.numero;
    var selIdx = selectedCard.dataset.idx;

    if (!selCor || !selForma || !selNumero) return;

    var targetCor = targetCard.dataset.cor;
    var targetForma = targetCard.dataset.forma;
    var targetNumero = targetCard.dataset.numero;

    var now = Date.now();
    var rt = selectStartTime > 0 ? (now - selectStartTime) / 1000 : 1.0;

    var outcome = WCSTEngine.processTrial(
      selCor, selForma, selNumero,
      targetCor, targetForma, targetNumero,
      rt
    );

    if (outcome.result.correct) {
      WCSTUI.showFeedback('Acertou!!!', 'correct', 1000);
    } else {
      WCSTUI.showFeedback('Errou!!!', 'incorrect', 1000);
    }

    selectedCard.remove();

    doAutoSave();

    if (outcome.needNewDeck) {
      var ok = WCSTEngine.loadNextDeck();
      if (ok) {
        renderDeck();
        setupStimulus();
      }
    }

    if (outcome.testEnded) {
      endTest(outcome.completedAll, false);
    }
  }

  // Captura tempo de selecao da carta
  document.addEventListener('click', function (e) {
    if (e.target.closest('.response-container .card')) {
      selectStartTime = Date.now();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && WCSTEngine.state.isActive) {
      e.preventDefault();
      window.exitTest();
    }
  });

  // -- Fim do teste --
  function endTest(completedAll, abandoned) {
    WCSTEngine.state.isActive = false;
    if (!WCSTEngine.state.endTimestamp) WCSTEngine.state.endTimestamp = Date.now();
    WCSTUI.blockKeys(false);

    if (completedAll && !abandoned) {
      WCSTUI.showFeedback('Parabens! Teste concluido!', 'parabens', 3000);
    } else if (abandoned) {
      WCSTUI.showFeedback('Teste encerrado', 'encerrado', 3000);
    } else {
      WCSTUI.showFeedback('Teste finalizado', 'exhausted', 2000);
    }

    document.getElementById('exitButton').style.display = 'none';

    var formData = WCSTUI.getFormData();
    var stats = WCSTEngine.computeStats();
    if (!stats) return;

    setTimeout(function () {
      // Tentar gerar laudo com IA antes de exportar
      var aiTimeout = new Promise(function(_, reject) {
        setTimeout(function() { reject('timeout'); }, 10000);
      });
      var aiPromise = TECFEAI.generateReport(formData, stats, abandoned);

      Promise.race([aiPromise, aiTimeout]).then(function(aiResult) {
        exportAll(formData, stats, abandoned, aiResult.laudo, aiResult.estrategia);
      }).catch(function() {
        exportAll(formData, stats, abandoned, null, null);
      });
    }, 500);
  }

  // -- Exportar tudo --
  function exportAll(formData, stats, abandoned, laudoIA, estrategia) {
    var idPac = gerarIdPaciente(formData.nome, formData.nascimento);
    formData.idPaciente = idPac || 'N/I';
    var historicoAnterior = getHistoricoLocal(formData.nome, formData.nascimento);

    function doExport(histRegs) {
      try {
        var doc = WCSTPDF.generate(formData, stats, abandoned, histRegs, laudoIA, estrategia);
        var fname = WCSTPDF.filename(formData.nome, abandoned);
        var savePromise = WCSTPDF.save(doc, fname);

        function afterSave() {
          saveHistoricoLocal(formData, stats, abandoned);

          if (API.available && idPac) {
            var statusText = 'Parcial';
            if (abandoned === 'interrompido') statusText = 'Interrompido';
            else if (abandoned) statusText = 'Abandonado';
            else if (stats.completedCategories >= 6) statusText = 'Completo';
            var registro = {
              idPaciente: idPac,
              data: new Date().toLocaleString('pt-BR'),
              status: statusText,
              categorias: stats.completedCategories,
              percentErros: stats.pctErrors.toFixed(1),
              percentPersev: stats.pctPersevErr.toFixed(1),
              tempo: Math.floor(stats.totalTime / 60) + 'min ' + Math.round(stats.totalTime % 60) + 's',
              tentativas: stats.trialsPerformed,
              estrategia: estrategia || ''
            };
            API.save_historico(idPac, registro);
          }

          if (API.available) {
            API.clear_auto_save();
          }

          WCSTUI.exitFullscreen();
          if (API.available) {
            API.close_app();
          } else {
            document.getElementById('testPage').style.display = 'none';
            document.getElementById('coverPage').style.display = 'flex';
          }
        }

        // Salvar Como via dialog do Tauri
        function doSaveAs(pdfBytes, fname) {
          if (window.__TAURI__) {
            window.__TAURI__.dialog.save({
              defaultPath: fname,
              filters: [{ name: 'PDF', extensions: ['pdf'] }]
            }).then(function(path) {
              if (path) {
                window.__TAURI__.core.invoke('save_pdf_to_path', { path: path, dataUrl: doc.output('datauristring') }).catch(function() {});
              }
              afterSave();
            }).catch(function() {
              afterSave();
            });
          } else {
            afterSave();
          }
        }

        if (savePromise && savePromise.then) {
          savePromise.then(function(result) {
            if (result && result.auto) {
              if (window.__TAURI__) {
                window.__TAURI__.dialog.message('Copia de seguranca salva em: ' + result.auto, { title: 'Backup salvo' }).then(function() {
                  doSaveAs(null, fname);
                });
              } else {
                alert('PDF salvo em: ' + result.auto);
                afterSave();
              }
            } else {
              doSaveAs(null, fname);
            }
          });
        } else {
          afterSave();
        }
      } catch(e) {
        alert('Erro ao gerar PDF: ' + e.message);
        console.error('Erro PDF:', e);
      }
    }

    if (API.available && idPac) {
      API.get_historico(idPac).then(function(regs) {
        doExport(regs && regs.length > 0 ? regs : historicoAnterior);
      });
    } else {
      doExport(historicoAnterior);
    }
  }

  window.exitTest = function () {
    if (window.__TAURI__) {
      window.__TAURI__.dialog.ask('Deseja realmente sair? Os dados serao salvos.', { title: 'Sair do teste', kind: 'warning' }).then(function(yes) {
        if (yes) endTest(false, true);
      });
    } else {
      if (!confirm('Deseja realmente sair? Os dados serao salvos.')) return;
      endTest(false, true);
    }
  };

  window.emergencyExport = function () {
    if (WCSTEngine.state.results.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }
    if (!confirm('Exportar ' + WCSTEngine.state.results.length + ' tentativas?')) return;
    var formData = WCSTUI.getFormData();
    var stats = WCSTEngine.computeStats();
    if (stats) exportAll(formData, stats, true);
  };

  // -- Auto-save completo (estado + formulario) --
  function doAutoSave() {
    if (!API.available) return;
    var data = {
      formData: WCSTUI.getFormData(),
      results: WCSTEngine.state.results,
      totalAttempts: WCSTEngine.state.totalAttempts,
      completedCategories: WCSTEngine.state.completedCategories,
      currentCategory: WCSTEngine.state.currentCategory,
      consecutiveCorrect: WCSTEngine.state.consecutiveCorrect,
      roundStats: WCSTEngine.state.roundStats,
      currentRound: WCSTEngine.state.currentRound,
      perseverativePrinciple: WCSTEngine.state.perseverativePrinciple,
      previousCategory: WCSTEngine.state.previousCategory,
      trialsToFirstCategory: WCSTEngine.state.trialsToFirstCategory,
      startTimestamp: WCSTEngine.state.startTimestamp,
      timestamp: new Date().toISOString()
    };
    API.auto_save(data);
  }

  // -- Recuperacao de teste interrompido --
  function checkAutoSave() {
    if (!API.available) return;
    API.load_auto_save().then(function(data) {
      if (!data || !data.results || data.results.length === 0) return;
      var n = data.results.length;
      var fd = data.formData;
      if (!fd || !fd.nome) return;

      var msg = 'Foi detectado um teste INTERROMPIDO de forma inesperada.\n\n' +
        'Paciente: ' + fd.nome + '\n' +
        'Tentativas realizadas: ' + n + '/128\n' +
        'Salvo em: ' + (data.timestamp || 'N/I') + '\n\n' +
        'Deseja recuperar e gerar o relatorio parcial?\n' +
        '(Sim = gera PDF parcial / Nao = descarta os dados)';

      function doRecover() {
        WCSTEngine.restoreFromAutoSave(data);
        var stats = WCSTEngine.computeStats();
        if (!stats) {
          if (API.available) API.clear_auto_save();
          return;
        }
        fd.idPaciente = gerarIdPaciente(fd.nome, fd.nascimento) || 'N/I';
        var historicoAnterior = getHistoricoLocal(fd.nome, fd.nascimento);

        function doExportRecovered(histRegs) {
          try {
            var doc = WCSTPDF.generate(fd, stats, 'interrompido', histRegs, null, null);
            var fname = WCSTPDF.filename(fd.nome, 'interrompido');
            var savePromise = WCSTPDF.save(doc, fname);

            function afterRecoverSave() {
              saveHistoricoLocal(fd, stats, 'interrompido');
              var idPac = gerarIdPaciente(fd.nome, fd.nascimento);
              if (API.available && idPac) {
                API.save_historico(idPac, {
                  idPaciente: idPac,
                  data: data.timestamp || new Date().toLocaleString('pt-BR'),
                  status: 'Interrompido',
                  categorias: stats.completedCategories,
                  percentErros: stats.pctErrors.toFixed(1),
                  percentPersev: stats.pctPersevErr.toFixed(1),
                  tempo: Math.floor(stats.totalTime / 60) + 'min ' + Math.round(stats.totalTime % 60) + 's',
                  tentativas: stats.trialsPerformed
                });
              }
              if (API.available) API.clear_auto_save();
            }

            if (savePromise && savePromise.then) {
              savePromise.then(function(result) {
                if (result && result.auto && window.__TAURI__) {
                  window.__TAURI__.dialog.message(
                    'Relatorio do teste interrompido salvo em:\n' + result.auto,
                    { title: 'Teste interrompido recuperado' }
                  ).then(function() {
                    window.__TAURI__.dialog.save({
                      defaultPath: fname,
                      filters: [{ name: 'PDF', extensions: ['pdf'] }]
                    }).then(function(path) {
                      if (path) {
                        window.__TAURI__.core.invoke('save_pdf_to_path', { path: path, dataUrl: doc.output('datauristring') }).catch(function() {});
                      }
                      afterRecoverSave();
                    }).catch(function() { afterRecoverSave(); });
                  });
                } else {
                  afterRecoverSave();
                }
              });
            } else {
              afterRecoverSave();
            }
          } catch(e) {
            console.error('Erro ao recuperar teste:', e);
            if (API.available) API.clear_auto_save();
          }
        }

        var idPac = gerarIdPaciente(fd.nome, fd.nascimento);
        if (API.available && idPac) {
          API.get_historico(idPac).then(function(regs) {
            doExportRecovered(regs && regs.length > 0 ? regs : historicoAnterior);
          });
        } else {
          doExportRecovered(historicoAnterior);
        }
      }

      function doDiscard() {
        if (API.available) API.clear_auto_save();
      }

      if (window.__TAURI__) {
        window.__TAURI__.dialog.ask(msg, { title: 'Teste interrompido detectado', kind: 'warning' }).then(function(yes) {
          if (yes) doRecover();
          else doDiscard();
        });
      } else {
        if (confirm(msg)) doRecover();
        else doDiscard();
      }
    });
  }

  // -- Historico local (localStorage fallback) --
  function initHistoricoLocal() {
    // Limpa historico antigo sem idPaciente
    var key = 'tecfe_historico';
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    var limpo = hist.filter(function(r) { return r.idPaciente; });
    localStorage.setItem(key, JSON.stringify(limpo));
  }
  initHistoricoLocal();

  function saveHistoricoLocal(formData, stats, status) {
    var key = 'tecfe_historico';
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    var idPac = gerarIdPaciente(formData.nome, formData.nascimento);
    var statusText = 'Parcial';
    if (status === 'interrompido') statusText = 'Interrompido';
    else if (status === true) statusText = 'Abandonado';
    else if (stats.completedCategories >= 6) statusText = 'Completo';
    hist.push({
      idPaciente: idPac,
      data: new Date().toLocaleString('pt-BR'),
      status: statusText,
      categorias: stats.completedCategories,
      percentErros: stats.pctErrors.toFixed(1),
      percentPersev: stats.pctPersevErr.toFixed(1),
      tempo: Math.floor(stats.totalTime / 60) + 'min ' + Math.round(stats.totalTime % 60) + 's',
      tentativas: stats.trialsPerformed
    });
    localStorage.setItem(key, JSON.stringify(hist));
  }

  function getHistoricoLocal(nome, nascimento) {
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem('tecfe_historico') || '[]'); } catch(e) {}
    var id = gerarIdPaciente(nome, nascimento);
    if (!id) return [];
    return hist.filter(function(r) {
      return r.idPaciente && r.idPaciente === id;
    });
  }

  // -- Busca automatica de historico (faixa laranja) --
  function checkHistorico() {
    var f = WCSTUI.getFormData();
    var alerta = document.getElementById('historicoAlerta');
    if (!alerta) return;
    var id = gerarIdPaciente(f.nome, f.nascimento);
    if (!id) {
      alerta.style.display = 'none';
      return;
    }
    var registros = getHistoricoLocal(f.nome, f.nascimento);

    function mostrar(regs) {
      if (!regs || regs.length === 0) {
        alerta.style.display = 'none';
        return;
      }
      var ultima = regs[regs.length - 1];
      var vezes = regs.length;
      alerta.textContent = '\u26A0 Este paciente ja realizou o teste ' +
        vezes + ' vez(es). Ultima execucao: ' + (ultima.data || 'N/I') +
        ' | Status: ' + (ultima.status || 'N/I') +
        ' | Categorias: ' + (ultima.categorias || 0);
      alerta.style.display = 'block';
    }

    if (API.available) {
      API.get_historico(id).then(function(regs) {
        if (regs && regs.length > 0) mostrar(regs);
        else mostrar(registros);
      });
    } else {
      mostrar(registros);
    }
  }

  // -- Verificacao de atualizacao automatica --
  function checkForUpdates() {
    if (!window.__TAURI__ || !window.__TAURI__.updater) return;
    window.__TAURI__.updater.check().then(function(update) {
      if (update) {
        window.__TAURI__.dialog.ask(
          'Nova versao disponivel: v' + update.version + '\n\nDeseja atualizar agora?',
          { title: 'Atualizacao disponivel', kind: 'info' }
        ).then(function(yes) {
          if (yes) {
            update.downloadAndInstall().then(function() {
              window.__TAURI__.core.invoke('close_app');
            }).catch(function(e) {
              window.__TAURI__.dialog.message(
                'Erro ao atualizar: ' + e,
                { title: 'Erro', kind: 'error' }
              );
            });
          }
        });
      }
    }).catch(function() {});
  }

  ['patientName', 'birthDate'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', checkHistorico);
      el.addEventListener('change', checkHistorico);
    }
  });

})();
