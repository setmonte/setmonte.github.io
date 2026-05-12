// salvar-escala.js — Salvar no Painel SYM

(function() {
  var API = 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws';
  var jaInjetou = false;

  // Mensagem no topo
  function inserirMensagemTopo() {
    var form = document.querySelector('form') || document.querySelector('.container') || document.body.firstElementChild;
    if (!form) return;
    var box = document.createElement('div');
    box.style.cssText = 'margin:10px auto 15px;padding:12px 15px;background:#e8f5e9;border:2px solid #2e7d32;border-radius:8px;max-width:600px;text-align:center;animation:piscar 2s ease-in-out 3;';
    box.innerHTML = '<style>@keyframes piscar{0%,100%{opacity:1}50%{opacity:0.3}}</style><p style="font-size:15px;color:#2e7d32;margin:0;font-weight:bold;">Profissional? Acompanhe os resultados dos seus pacientes no <a href="../online/" target="_blank" style="color:#1565c0;">Painel SYM</a> (gratuito).</p>';
    form.insertBefore(box, form.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inserirMensagemTopo);
  } else {
    inserirMensagemTopo();
  }

  // Mostrar convite apos calcular resultados
  function mostrarConviteSalvar() {
    if (jaInjetou) return;
    jaInjetou = true;
    var target = document.getElementById('resultados') || document.getElementById('resultsSection') || document.getElementById('result') || document.getElementById('results');
    if (!target) target = document.querySelector('.resultados') || document.querySelector('.container');
    if (!target) return;
    if (document.getElementById('bloco-salvar-painel')) return;

    var div = document.createElement('div');
    div.id = 'bloco-salvar-painel';
    div.style.cssText = 'margin-top:20px;padding:18px;background:#e8f5e9;border:2px solid #2e7d32;border-radius:10px;text-align:center;';
    div.innerHTML = '<p style="font-size:14px;color:#2e7d32;margin-bottom:10px;font-weight:bold;">Seu resultado tambem pode ser salvo no seu painel profissional.</p>' +
      '<p style="font-size:12px;color:#555;margin-bottom:12px;">Acesse com sua senha ou <a href="../online/" target="_blank">inscreva-se gratuitamente</a> para acompanhar seus pacientes.</p>' +
      '<button id="btnSalvarEscala" style="padding:12px 28px;background:#2e7d32;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:bold;cursor:pointer;">Salvar no Painel</button>' +
      '<div id="painelSalvarEscala" style="display:none;margin-top:12px;"></div>' +
      '<p id="msgSalvarEscala" style="margin-top:8px;font-size:12px;color:#777;"></p>';
    target.appendChild(div);
    document.getElementById('btnSalvarEscala').onclick = iniciarFluxo;
  }

  // Chamado pelas escalas apos calcular resultados
  window.injetarBotaoSalvar = function(containerId) {
    mostrarConviteSalvar();
  };

  // Observer para escalas que nao chamam injetarBotaoSalvar
  function iniciarObservador() {
    var el = document.getElementById('resultados') || document.getElementById('result');
    if (!el) return;
    var observer = new MutationObserver(function() {
      if (el.style.display !== 'none' && el.innerHTML.trim() && !jaInjetou) {
        setTimeout(function() { mostrarConviteSalvar(); }, 500);
      }
    });
    observer.observe(el, { attributes: true, childList: true, attributeFilter: ['style'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarObservador);
  } else {
    iniciarObservador();
  }

  // Gerar PDF silenciosamente (sem download) para capturar base64
  function gerarPdfSilencioso() {
    if (!window.jspdf || !window.jspdf.jsPDF || typeof gerarRelatorioPDF !== 'function') return null;
    try {
      var _orig = window.jspdf.jsPDF;
      var pdfCapturado = null;
      // Criar wrapper temporario que captura sem salvar
      var _origProto = _orig.prototype.save;
      _orig.prototype.save = function() { pdfCapturado = this.output('datauristring'); };
      var _origAlert = window.alert;
      window.alert = function() {};
      gerarRelatorioPDF();
      _orig.prototype.save = _origProto;
      window.alert = _origAlert;
      return pdfCapturado;
    } catch(e) {
      return null;
    }
  }

  // Fluxo de salvar
  async function iniciarFluxo() {
    var email = prompt('Digite seu email cadastrado no Painel SYM Online:');
    if (!email) return;
    var msg = document.getElementById('msgSalvarEscala');
    var painel = document.getElementById('painelSalvarEscala');
    msg.textContent = 'Buscando pacientes...'; msg.style.color = '#555';

    try {
      var resp = await fetch(API + '/get-pacientes?email=' + encodeURIComponent(email));
      var data = await resp.json();
      var pacs = data.pacientes || [];

      var html = '<div style="background:#fff;border:1px solid #ccc;border-radius:6px;padding:12px;text-align:left;max-width:350px;margin:0 auto;">';
      html += '<p style="font-size:13px;font-weight:bold;margin-bottom:8px;">Selecione o paciente:</p>';
      if (pacs.length > 0) {
        html += '<select id="selPac" style="width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:13px;">';
        html += '<option value="">-- Selecione --</option>';
        pacs.forEach(function(p) { html += '<option value="' + p.id + '" data-nome="' + p.nome + '">' + p.nome + ' (' + (p.dataNascimento||'?') + ')</option>'; });
        html += '<option value="_novo">+ Novo paciente</option></select>';
      }
      html += '<div id="formNovoPac" style="' + (pacs.length > 0 ? 'display:none;' : '') + 'margin-top:8px;">';
      html += '<input id="npNome" placeholder="Nome completo" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;font-size:12px;margin-bottom:5px;">';
      html += '<input type="date" id="npDN" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;font-size:12px;">';
      html += '</div>';
      html += '<button id="btnConfSalvar" style="width:100%;margin-top:10px;padding:8px;background:#1565c0;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:bold;cursor:pointer;">Confirmar e Salvar</button>';
      html += '</div>';

      painel.innerHTML = html; painel.style.display = 'block'; msg.textContent = '';

      var sel = document.getElementById('selPac');
      if (sel) sel.onchange = function() { document.getElementById('formNovoPac').style.display = (sel.value === '_novo' || !sel.value) ? 'block' : 'none'; };
      document.getElementById('btnConfSalvar').onclick = function() { confirmar(email); };
    } catch(e) {
      if (e.message && e.message.includes('Failed')) { msg.innerHTML = '\u274C Email nao cadastrado. <a href="../online/" target="_blank">Inscreva-se primeiro</a>.'; msg.style.color = '#c62828'; }
      else { msg.textContent = '\u274C Erro: ' + e.message; msg.style.color = '#c62828'; }
    }
  }

  async function confirmar(email) {
    var msg = document.getElementById('msgSalvarEscala');
    var sel = document.getElementById('selPac');
    var pacId = sel ? sel.value : '';
    var pacNome = '';

    if (!pacId || pacId === '_novo') {
      var nome = document.getElementById('npNome').value.trim();
      var dn = document.getElementById('npDN').value;
      if (!nome || !dn) { alert('Preencha nome e data de nascimento.'); return; }
      msg.textContent = 'Cadastrando paciente...'; msg.style.color = '#555';
      try {
        var r = await fetch(API + '/save-paciente', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:email,nome:nome,dataNascimento:dn}) });
        var d = await r.json();
        if (d.ok) { pacId = d.id; pacNome = nome; } else { msg.textContent = '\u274C Erro ao cadastrar.'; msg.style.color='#c62828'; return; }
      } catch(e) { msg.textContent = '\u274C Erro de conexao.'; msg.style.color='#c62828'; return; }
    } else {
      var opt = sel.options[sel.selectedIndex];
      pacNome = opt.dataset.nome || opt.text;
    }

    var dados = window._escalaDados || {};
    if (!dados.escala) {
      dados.escala = document.title.replace(/\s*[-\u2013|].*/,'').trim();
      dados.data = new Date().toISOString();
    }
    dados.pacienteId = pacId;
    dados.paciente = pacNome;

    // Gerar PDF silenciosamente
    msg.textContent = 'Gerando PDF...'; msg.style.color = '#555';
    var pdf = gerarPdfSilencioso();
    if (pdf) { dados.pdfBase64 = pdf; }

    msg.textContent = 'Salvando...'; msg.style.color = '#555';
    try {
      var sid = 'esc-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      var resp = await fetch(API + '/save-escala', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({sessionId:sid, email:email, data:dados}) });
      var r2 = await resp.json();
      if (r2.ok) { msg.textContent = '\u2705 Salvo! Acesse seu painel para ver o resultado completo.'; msg.style.color='#2e7d32'; document.getElementById('painelSalvarEscala').style.display='none'; }
      else if (resp.status===403) { msg.innerHTML = '\u274C Email nao cadastrado. <a href="../online/" target="_blank">Inscreva-se gratuitamente</a>.'; msg.style.color='#c62828'; }
      else { msg.textContent = '\u274C ' + (r2.error||'Erro'); msg.style.color='#c62828'; }
    } catch(e) { msg.textContent = '\u274C Erro: '+e.message; msg.style.color='#c62828'; }
  }
})();
