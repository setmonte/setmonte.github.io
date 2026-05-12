// salvar-escala.js — Botão "Salvar no Painel" para todas as escalas
// Auto-detecta quando #resultados fica visível e injeta o botão

(function() {
  var API = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws';
  var jaInjetou = false;

  // Mensagem no topo convidando a se inscrever
  function inserirMensagemTopo() {
    var form = document.querySelector('form') || document.querySelector('.container') || document.body.firstElementChild;
    if (!form) return;
    var box = document.createElement('div');
    box.style.cssText = 'margin:10px auto 15px;padding:12px 15px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;max-width:600px;text-align:center;';
    box.innerHTML = '<p style="font-size:16px;color:#333;margin:0;">Se quiser salvar os resultados no seu painel, <a href="../online/" target="_blank">inscreva-se aqui</a>.</p>';
    form.insertBefore(box, form.firstChild);
  }

  // Executar imediatamente (script carrega no final do body)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inserirMensagemTopo);
  } else {
    inserirMensagemTopo();
  }

  // Observar quando #resultados aparece
  function iniciarObservador() {
    var el = document.getElementById('resultados');
    if (!el) return;
    var observer = new MutationObserver(function() {
      if (el.style.display !== 'none' && el.innerHTML.trim() && !jaInjetou) {
        jaInjetou = true;
        setTimeout(function() { injetarBotao(el); }, 300);
      }
    });
    observer.observe(el, { attributes: true, childList: true, attributeFilter: ['style'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarObservador);
  } else {
    iniciarObservador();
  }

  function injetarBotao(container) {
    if (document.getElementById('bloco-salvar-painel')) return;
    var div = document.createElement('div');
    div.id = 'bloco-salvar-painel';
    div.style.cssText = 'margin-top:20px;padding:15px;background:#e8f5e9;border:1px solid #2e7d32;border-radius:8px;text-align:center;';
    div.innerHTML = '<p style="font-size:13px;color:#555;margin-bottom:8px;">Se quiser salvar os resultados no seu painel, <a href="../online/" target="_blank">inscreva-se aqui</a>.</p>' +
      '<button id="btnSalvarEscala" style="padding:10px 24px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;">\uD83D\uDCBE Salvar no Painel</button>' +
      '<p id="msgSalvarEscala" style="margin-top:8px;font-size:12px;color:#777;"></p>';
    container.appendChild(div);
    document.getElementById('btnSalvarEscala').onclick = salvarEscala;
  }

  // Também expor para chamada manual (BAPQ e futuras)
  window.injetarBotaoSalvar = function(containerId) {
    jaInjetou = true;
    var container = document.getElementById(containerId || 'resultados');
    if (container) injetarBotao(container);
  };

  async function salvarEscala() {
    var dados = window._escalaDados;
    // Se não tem _escalaDados, tenta capturar automaticamente do #resultados
    if (!dados) {
      var el = document.getElementById('resultados');
      if (el) {
        dados = {
          escala: document.title.replace(/\s*[-–|].*/,'').trim(),
          paciente: (document.getElementById('nome') || document.getElementById('name') || {}).value || 'N/I',
          resultadoHTML: el.innerText.substring(0, 2000),
          data: new Date().toISOString()
        };
      }
    }
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
      else if (resp.status === 403) { msg.innerHTML = '\u274C Email nao cadastrado. <a href="../online/" target="_blank">Inscreva-se primeiro no painel</a> e tente novamente.'; msg.style.color = '#c62828'; }
      else { msg.textContent = '\u274C Erro: ' + (r.error || 'tente novamente'); msg.style.color = '#c62828'; }
    } catch (e) { msg.textContent = '\u274C Erro de conexao: ' + e.message; msg.style.color = '#c62828'; }
  }
})();
