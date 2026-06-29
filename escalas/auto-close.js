// auto-close.js — Fecha a aba do paciente apos envio com sucesso
// Modo: observa quando a mensagem de sucesso aparece no DOM e dispara fechamento automatico
// Funciona para TODAS as escalas sem precisar editar cada uma

(function() {
  function _telaFechamento() {
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#e8f5e9,#c8e6c9);text-align:center;padding:20px;font-family:Segoe UI,Arial,sans-serif;">' +
      '<div style="background:white;border-radius:20px;padding:40px;box-shadow:0 10px 30px rgba(0,0,0,0.1);max-width:400px;width:90%;">' +
      '<div style="width:80px;height:80px;background:#2e7d32;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">' +
      '<span style="color:white;font-size:40px;">&#10004;</span></div>' +
      '<h1 style="color:#2e7d32;font-size:24px;margin-bottom:10px;">Enviado com sucesso!</h1>' +
      '<p style="font-size:15px;color:#555;margin-bottom:5px;">Os resultados foram enviados ao profissional.</p>' +
      '<p style="font-size:13px;color:#888;margin-top:20px;">Esta janela sera fechada automaticamente...</p>' +
      '<p id="_countdown" style="font-size:12px;color:#aaa;margin-top:10px;">5</p>' +
      '</div></div>';
    document.title = 'Enviado!';
    var segundos = 5;
    var countEl = document.getElementById('_countdown');
    var timer = setInterval(function() {
      segundos--;
      if (countEl) countEl.textContent = segundos > 0 ? segundos : '';
      if (segundos <= 0) clearInterval(timer);
    }, 1000);
    setTimeout(function() {
      window.open('', '_self', '');
      window.close();
    }, 3000);
    setTimeout(function() {
      try { window.location.href = 'about:blank'; } catch(e) {}
    }, 5000);
  }

  // Expor globalmente
  window._autoFechar = _telaFechamento;

  // Auto-detectar: observa quando a mensagem de sucesso aparece
  var _jaDetectou = false;
  var observer = new MutationObserver(function() {
    if (_jaDetectou) return;
    var textos = document.body.innerText || '';
    if (textos.indexOf('enviados com sucesso') >= 0 || textos.indexOf('Enviado com sucesso') >= 0 || textos.indexOf('Pode fechar') >= 0 || textos.indexOf('pode fechar') >= 0) {
      _jaDetectou = true;
      observer.disconnect();
      setTimeout(_telaFechamento, 2000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
