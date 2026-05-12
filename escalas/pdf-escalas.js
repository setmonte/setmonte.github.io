// pdf-escalas.js — Gerador de PDF central para todas as escalas SYM
// Usa window._escalaDados para gerar relatorio padronizado

function gerarPDFCompleto(dados) {
  if (!dados) dados = window._escalaDados;
  if (!dados) { alert('Calcule os resultados primeiro.'); return; }
  if (!window.jspdf) { alert('Biblioteca PDF nao carregada.'); return; }

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var W = 210, M = 15, TW = W - 2*M;
  var y = 0;

  // --- HEADER ---
  doc.setFillColor(30, 60, 120);
  doc.rect(0, 0, W, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text((dados.escala || 'Escala') + ' - RELATORIO DE AVALIACAO', W/2, 14, {align:'center'});
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  var subtitulo = dados.subtitulo || '';
  if (subtitulo) doc.text(subtitulo, W/2, 22, {align:'center'});
  doc.text('Sistema SYM - Softwares para Neuropsicologia', W/2, subtitulo ? 29 : 24, {align:'center'});

  // --- DADOS PESSOAIS ---
  y = 42;
  doc.setFillColor(245, 245, 245);
  doc.rect(M, y, TW, 22, 'F');
  doc.setDrawColor(30, 60, 120);
  doc.setLineWidth(0.5);
  doc.line(M, y, M, y+22);
  doc.setTextColor(30, 60, 120);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('DADOS DO AVALIANDO', M+5, y+6);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Paciente: ' + (dados.paciente || 'N/I'), M+5, y+12);
  doc.text('Data: ' + formatarData(dados.data), M+100, y+12);
  if (dados.sexo) doc.text('Sexo: ' + dados.sexo, M+5, y+18);
  if (dados.idade) doc.text('Idade: ' + dados.idade, M+100, y+18);

  // --- RESULTADO PRINCIPAL ---
  y = 70;
  doc.setFillColor(30, 60, 120);
  doc.rect(M, y, TW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('RESULTADO', M+3, y+7);
  y += 14;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  if (dados.escore != null) {
    doc.setFont(undefined, 'bold');
    doc.text('Escore Total: ' + dados.escore, M+5, y);
    y += 6;
  }
  if (dados.media != null) {
    doc.setFont(undefined, 'normal');
    doc.text('Media: ' + dados.media, M+5, y);
    y += 6;
  }
  if (dados.classificacao) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    var classLimpa = limparTexto(dados.classificacao);
    doc.text('Classificacao: ' + classLimpa, M+5, y);
    y += 8;
  }

  // --- DOMINIOS / SUBESCALAS ---
  if (dados.dominios && typeof dados.dominios === 'object') {
    y += 4;
    doc.setFillColor(30, 60, 120);
    doc.rect(M, y, TW, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('DOMINIOS / SUBESCALAS', M+3, y+7);
    y += 14;

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    var keys = Object.keys(dados.dominios);
    keys.forEach(function(k, i) {
      if (y > 270) { doc.addPage(); y = 20; }
      // Zebra
      if (i % 2 === 0) {
        doc.setFillColor(245, 248, 255);
        doc.rect(M, y-4, TW, 7, 'F');
      }
      var v = dados.dominios[k];
      var linha = limparTexto(k) + ': ';
      if (typeof v === 'object' && v !== null) {
        var partes = [];
        if (v.pontuacao != null) partes.push('Pontuacao: ' + v.pontuacao);
        if (v.media != null) partes.push('Media: ' + v.media);
        if (v.classificacao) partes.push(limparTexto(v.classificacao));
        if (v.itens != null) partes.push(v.itens + ' itens');
        if (v.max != null) partes.push('Max: ' + v.max);
        linha += partes.join(' | ');
      } else {
        linha += v;
      }
      doc.setFont(undefined, 'bold');
      doc.text(limparTexto(k), M+3, y);
      doc.setFont(undefined, 'normal');
      var valorTexto = linha.substring(limparTexto(k).length + 2);
      doc.text(valorTexto, M+3 + doc.getTextWidth(limparTexto(k) + ': '), y);
      y += 7;
    });
  }

  // --- INTERPRETACAO ---
  if (dados.interpretacao) {
    y += 6;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(30, 60, 120);
    doc.rect(M, y, TW, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('INTERPRETACAO', M+3, y+7);
    y += 14;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    var linhas = doc.splitTextToSize(limparTexto(dados.interpretacao), TW-6);
    linhas.forEach(function(l) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(l, M+3, y);
      y += 4;
    });
  }

  // --- OBSERVACOES ---
  if (dados.observacoes) {
    y += 6;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    var obsLinhas = doc.splitTextToSize('Obs: ' + limparTexto(dados.observacoes), TW-6);
    obsLinhas.forEach(function(l) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(l, M+3, y);
      y += 4;
    });
  }

  // --- RODAPE ---
  doc.setFillColor(60, 60, 60);
  doc.rect(0, 285, W, 12, 'F');
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('SYM Online | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Este documento nao substitui avaliacao profissional.', W/2, 291, {align:'center'});

  // --- SALVAR ---
  var nomeArq = (dados.escala||'Escala').replace(/\s+/g,'_') + '_' + (dados.paciente||'').replace(/\s+/g,'_') + '_' + timestamp() + '.pdf';
  doc.save(nomeArq);

  return doc.output('datauristring');
}

// Utilitarios
function limparTexto(s) {
  if (!s) return '';
  return String(s)
    .replace(/[\u2600-\u27BF\uD800-\uDFFF\uFE00-\uFE0F\u200D]/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u024F]/g, '')
    .trim();
}

function formatarData(d) {
  if (!d) return new Date().toLocaleDateString('pt-BR');
  try {
    return new Date(d).toLocaleDateString('pt-BR');
  } catch(e) { return d; }
}

function timestamp() {
  var d = new Date();
  return d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') + String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0');
}
