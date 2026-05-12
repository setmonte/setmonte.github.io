// salvar-escala.js — Sistema de salvar escalas no painel SΨM

(function() {
  var API = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws';

  // Injetar campo de email no início da escala
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form') || document.querySelector('.container') || document.body.firstElementChild;
    if (!form) return;
    var box = document.createElement('div');
    box.id = 'email-painel-box';
    box.style.cssText = 'margin:10px auto 15px;padding:12px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;max-width:600px;text-align:center;';
    box.innerHTML = '<p style="font-size:13px;color:#333;margin-bottom:6px;">Se quiser salvar os resultados no seu painel, <a href="../online/" target="_blank">inscreva-se aqui</a>.</p>' +
      '<input type="email" id="emailPainel" placeholder="seu@email.com (opcional)" style="padding:6px 12px;border:1px solid #ccc;border-radius:5px;font-size:13px;width:250px;">';
    form.insertBefore(box, form.firstChild);
  });

  // Injetar botão salvar após resultados
  window.injetarBotaoSalvar = function(containerId) {
    var container = document.getElementById(containerId || 'resultados');
    if (!container) return;
    if (document.getElementById('bloco-salvar-painel')) document.getElementById('bloco-salvar-painel').remove();
    var email = (document.getElementById('emailPainel') || {}).value || '';
    var div = document.createElement('div');
    div.id = 'bloco-salvar-painel';
    div.style.cssText = 'margin-top:20px;padding:15px;background:#e8f5e9;border:1px solid #2e7d32;border-radius:8px;text-align:center;';
    if (email) {
      div.innerHTML = '<p style="font-size:13px;color:#2e7d32;margin-bottom:8px;">Salvar resultado para: <strong>' + email + '</strong></p>' +
        '<button id="btnSalvarEscala" style="padding:10px 24px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">\uD83D\uDCBE Salvar no Painel</button>' +
        '<p id="msgSalvarEscala" style="margin-top:8px;font-size:12px;color:#777;"></p>';
    } else {
      div.innerHTML = '<p style="font-size:13px;color:#555;">Se quiser salvar os resultados no seu painel, <a href="../online/" target="_blank">inscreva-se aqui</a> e informe seu email no topo da pagina.</p>';
    }
    container.appendChild(div);
    if (email) document.getElementById('btnSalvarEscala').onclick = function() { salvarEscala(email); };
  };

  async function salvarEscala(email) {
    var dados = window._escalaDados;
    if (!dados) { alert('Calcule os resultados primeiro.'); return; }
    var msg = document.getElementById('msgSalvarEscala');
    msg.textContent = 'Salvando...';
    msg.style.color = '#555';
    try {
      var sid = 'esc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var resp = await fetch(API + '/save-escala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, email: email, data: dados })
      });
      var r = await resp.json();
      if (r.ok) { msg.textContent = '\u2705 Salvo! Acesse seu painel para ver o historico.'; msg.style.color = '#2e7d32'; }
      else { msg.textContent = '\u274C Erro: ' + (r.error || 'tente novamente'); msg.style.color = '#c62828'; }
    } catch (e) { msg.textContent = '\u274C Erro de conexao: ' + e.message; msg.style.color = '#c62828'; }
  }
})();
