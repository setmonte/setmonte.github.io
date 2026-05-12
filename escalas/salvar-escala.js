// salvar-escala.js — Botão "Salvar no Painel" para todas as escalas
// Uso: após calcular resultados, setar window._escalaDados = { escala, paciente, escore, classificacao, ... }
// O botão é injetado automaticamente no container #resultados (ou onde _escalaDados.container apontar)

(function() {
  var API = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws';

  window.injetarBotaoSalvar = function(containerId) {
    var container = document.getElementById(containerId || 'resultados');
    if (!container) return;
    if (document.getElementById('bloco-salvar-painel')) return;
    var div = document.createElement('div');
    div.id = 'bloco-salvar-painel';
    div.style.cssText = 'margin-top:20px;padding:15px;background:#e8f5e9;border:1px solid #2e7d32;border-radius:8px;text-align:center;';
    div.innerHTML = '<p style="font-size:13px;color:#555;margin-bottom:8px;">Quer guardar este resultado? <a href="../online/" target="_blank">Inscreva-se gratuitamente</a> no painel S\u03A8M</p>' +
      '<button id="btnSalvarEscala" style="padding:10px 24px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">\uD83D\uDCBE Salvar no Painel</button>' +
      '<p id="msgSalvarEscala" style="margin-top:8px;font-size:12px;color:#777;"></p>';
    container.appendChild(div);
    document.getElementById('btnSalvarEscala').onclick = salvarEscala;
  };

  async function salvarEscala() {
    var dados = window._escalaDados;
    if (!dados) { alert('Calcule os resultados primeiro.'); return; }
    var email = prompt('Digite seu email cadastrado no painel S\u03A8M Online:');
    if (!email) return;
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
