// tecfe-v7-ui.js
// Mascaras, fullscreen, bloqueio teclas, selecao por clique, idade, formulario
// SEM acentos nos comentarios/strings do codigo

var WCSTUI = (function () {

  // -- Mascara CPF: 000.000.000-00 --
  function maskCPF(input) {
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').substring(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      this.value = v;
    });
  }

  // -- Mascara CRP: 00/00000-0 --
  function maskCRP(input) {
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').substring(0, 8);
      if (v.length > 7) v = v.replace(/(\d{2})(\d{5})(\d{1})/, '$1/$2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '$1/$2');
      this.value = v;
    });
  }

  // -- Calculo de idade completa --
  function calculateAge(birthDateStr) {
    var today = new Date();
    var birth = new Date(birthDateStr + 'T00:00:00');
    if (isNaN(birth.getTime())) return '';
    var years = today.getFullYear() - birth.getFullYear();
    var months = today.getMonth() - birth.getMonth();
    var days = today.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      var lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    var r = years + ' anos';
    if (months > 0 && days > 0) r += ' ' + months + ' meses e ' + days + ' dias';
    else if (months > 0) r += ' e ' + months + ' meses';
    else if (days > 0) r += ' e ' + days + ' dias';
    return r;
  }

  function getAgeYears(birthDateStr) {
    var today = new Date();
    var birth = new Date(birthDateStr + 'T00:00:00');
    if (isNaN(birth.getTime())) return 0;
    var y = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) y--;
    return y;
  }

  // -- Fullscreen via Tauri nativo --
  function enterFullscreen() {
    if (window.__TAURI__) {
      window.__TAURI__.window.getCurrentWindow().setFullscreen(true).catch(function() {});
    } else {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (window.__TAURI__) {
      window.__TAURI__.window.getCurrentWindow().setFullscreen(false).catch(function() {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  // -- Bloqueio de teclas durante teste --
  var _blocked = false;

  function blockKeys(active) {
    _blocked = active;
  }

  function _keyHandler(e) {
    if (!_blocked) return;
    // Permite apenas Escape (para sair) e F11
    if (e.key === 'Escape' || e.key === 'F11') return;
    // Bloqueia F5, Ctrl+R, Ctrl+W, Alt+F4, etc
    if (e.key === 'F5' ||
        (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'w' || e.key === 'W')) ||
        (e.altKey && e.key === 'F4')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function initKeyBlock() {
    document.addEventListener('keydown', _keyHandler, true);
    // Bloqueia menu contexto durante teste
    document.addEventListener('contextmenu', function (e) {
      if (_blocked) e.preventDefault();
    });
  }

  // -- Selecao por clique: carta resposta + carta modelo --
  var _stimBound = false;
  var _currentMatchHandler = null;
  var _selectedCard = null;

  function setupClickMatch(stimulusSelector, onMatch) {
    _currentMatchHandler = onMatch;
    if (_stimBound) return;
    _stimBound = true;
    // Clique nas cartas modelo (destino)
    var stimCards = document.querySelectorAll(stimulusSelector);
    stimCards.forEach(function (card) {
      card.addEventListener('click', function () {
        if (!_selectedCard || !_currentMatchHandler) return;
        _currentMatchHandler(_selectedCard, this);
        this.classList.remove('over');
        if (_selectedCard) _selectedCard.classList.remove('card-selected');
        _selectedCard = null;
      });
      card.addEventListener('mouseenter', function () {
        if (_selectedCard) this.classList.add('over');
      });
      card.addEventListener('mouseleave', function () {
        this.classList.remove('over');
      });
    });
  }

  function createResponseCard(cardData, index) {
    var el = document.createElement('div');
    el.className = 'card';
    el.dataset.idx = index;
    el.dataset.cor = cardData.cor;
    el.dataset.forma = cardData.forma;
    el.dataset.numero = cardData.numero;
    el.innerHTML = WCSTCards.generateSVG(cardData.forma, cardData.cor, cardData.numero);
    el.style.cursor = 'pointer';
    el.addEventListener('click', function () {
      // Desseleciona anterior
      if (_selectedCard) _selectedCard.classList.remove('card-selected');
      // Seleciona esta
      _selectedCard = el;
      el.classList.add('card-selected');
    });
    return el;
  }

  // -- Feedback visual --
  function showFeedback(text, cssClass, duration) {
    var fb = document.getElementById('feedback');
    fb.className = '';
    fb.textContent = text;
    fb.classList.add(cssClass);
    fb.style.display = 'block';
    if (duration > 0) {
      setTimeout(function () {
        fb.style.display = 'none';
      }, duration);
    }
  }

  function hideFeedback() {
    var fb = document.getElementById('feedback');
    fb.style.display = 'none';
    fb.className = '';
  }

  // -- Timestamp formatado AAAAMMDD --
  function dateStamp() {
    var d = new Date();
    return '' + d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
  }

  function dateTimeStamp() {
    var d = new Date();
    return dateStamp() +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0');
  }

  // -- Init formulario --
  function initForm() {
    var cpfEl = document.getElementById('cpf');
    var crpEl = document.getElementById('crp');
    if (cpfEl) maskCPF(cpfEl);
    if (crpEl) maskCRP(crpEl);

    var birthEl = document.getElementById('birthDate');
    if (birthEl) {
      birthEl.addEventListener('change', function () {
        var ageEl = document.getElementById('ageDisplay');
        if (this.value) ageEl.value = calculateAge(this.value);
        else ageEl.value = '';
      });
    }
  }

  // -- Coleta dados do formulario --
  function getFormData() {
    return {
      nome: (document.getElementById('patientName').value || '').trim(),
      nascimento: document.getElementById('birthDate').value || '',
      idade: document.getElementById('ageDisplay').value || '',
      idadeAnos: getAgeYears(document.getElementById('birthDate').value || ''),
      cpf: (document.getElementById('cpf').value || '').trim(),
      sexo: document.getElementById('sex').value || '',
      lateralidade: document.getElementById('laterality').value || '',
      escolaridade: document.getElementById('education').value || '',
      profissao: (document.getElementById('profession').value || '').trim(),
      avaliador: (document.getElementById('evaluator').value || '').trim(),
      crp: (document.getElementById('crp').value || '').trim()
    };
  }

  function validateForm() {
    var f = getFormData();
    if (!f.nome || !f.nascimento || !f.escolaridade) {
      alert('Preencha os campos obrigatorios: Nome, Data de Nascimento e Escolaridade.');
      return false;
    }
    return true;
  }

  return {
    maskCPF: maskCPF,
    maskCRP: maskCRP,
    calculateAge: calculateAge,
    getAgeYears: getAgeYears,
    enterFullscreen: enterFullscreen,
    exitFullscreen: exitFullscreen,
    blockKeys: blockKeys,
    initKeyBlock: initKeyBlock,
    setupClickMatch: setupClickMatch,
    createResponseCard: createResponseCard,
    showFeedback: showFeedback,
    hideFeedback: hideFeedback,
    dateStamp: dateStamp,
    dateTimeStamp: dateTimeStamp,
    initForm: initForm,
    getFormData: getFormData,
    validateForm: validateForm
  };

})();
