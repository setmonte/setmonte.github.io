// pdf-escalas.js — Gerador de PDF central para todas as escalas SYM

function gerarPDFCompleto(dados) {
  if (!dados) dados = window._escalaDados;
  if (!dados) { alert('Calcule os resultados primeiro.'); return null; }
  if (!window.jspdf) { alert('Biblioteca PDF nao carregada.'); return null; }

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var W = 210, M = 15, TW = W - 2*M;
  var y = 0;

  // --- HEADER ---
  doc.setFillColor(30, 60, 120);
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont(undefined, 'bold');
  doc.text(limpar(dados.escala || 'Escala') + ' - RELATORIO DE AVALIACAO', W/2, 13, {align:'center'});
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Sistema SYM - Softwares para Neuropsicologia', W/2, 21, {align:'center'});
  doc.text('Data: ' + formatarData(dados.data), W/2, 27, {align:'center'});

  // --- DADOS PESSOAIS ---
  y = 38;
  doc.setFillColor(240, 244, 248);
  doc.rect(M, y, TW, 18, 'F');
  doc.setDrawColor(30, 60, 120);
  doc.setLineWidth(0.8);
  doc.line(M, y, M, y+18);
  doc.setTextColor(30, 60, 120);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('DADOS DO AVALIANDO', M+4, y+6);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  var linha1 = 'Paciente: ' + limpar(dados.paciente || 'N/I');
  if (dados.idPaciente) linha1 += '   |   ID: ' + dados.idPaciente;
  if (dados.sexo) linha1 += '   |   Sexo: ' + dados.sexo;
  doc.text(linha1, M+4, y+12);
  var linha2 = '';
  if (dados.idade) linha2 += 'Idade: ' + limpar(dados.idade);
  doc.text(linha2, M+4, y+17);

  // --- RESULTADO PRINCIPAL ---
  y = 62;
  doc.setFillColor(30, 60, 120);
  doc.rect(M, y, TW, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('RESULTADO', M+3, y+6);
  y += 13;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  if (dados.classificacao) {
    doc.text(limpar(dados.classificacao), M+4, y);
    y += 7;
  }
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  if (dados.escore != null) {
    var escoreTxt = 'Escore: ' + dados.escore;
    if (dados.pontosCorte) escoreTxt += '  (ponto de corte: ' + dados.pontosCorte + ')';
    doc.text(escoreTxt, M+4, y);
    y += 5;
  }
  if (dados.media != null) {
    doc.text('Media: ' + dados.media, M+4, y);
    y += 5;
  }
  y += 3;

  // --- DOMINIOS / SUBESCALAS ---
  if (dados.dominios && typeof dados.dominios === 'object') {
    var keys = Object.keys(dados.dominios);
    if (keys.length > 0) {
      doc.setFillColor(30, 60, 120);
      doc.rect(M, y, TW, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('DOMINIOS / SUBESCALAS', M+3, y+6);
      y += 13;

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8.5);
      keys.forEach(function(k, i) {
        if (y > 265) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(245, 247, 252);
          doc.rect(M, y-3.5, TW, 6.5, 'F');
        }
        var v = dados.dominios[k];
        doc.setFont(undefined, 'bold');
        doc.text(limpar(k), M+3, y);
        doc.setFont(undefined, 'normal');

        var detalhe = '';
        if (typeof v === 'object' && v !== null) {
          var partes = [];
          if (v.pontuacao != null) partes.push(String(v.pontuacao) + (v.max ? '/' + v.max : '') + ' pts');
          if (v.media != null) partes.push('media ' + v.media);
          if (v.classificacao) partes.push(limpar(v.classificacao));
          if (v.itens != null) partes.push(v.itens + ' itens');
          detalhe = partes.join('  |  ');
        } else {
          detalhe = String(v);
        }
        var xOffset = M + 3 + doc.getTextWidth(limpar(k)) + 3;
        if (xOffset > 90) xOffset = 90;
        doc.text(detalhe, xOffset, y);
        y += 6.5;
      });
      y += 4;
    }
  }

  // --- AVISO ---
  if (y > 255) { doc.addPage(); y = 20; }
  y += 3;
  doc.setFillColor(255, 248, 235);
  doc.rect(M, y, TW, 18, 'F');
  doc.setDrawColor(200, 150, 50);
  doc.setLineWidth(0.5);
  doc.line(M, y, M, y+18);
  doc.setTextColor(150, 80, 0);
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.text('IMPORTANTE:', M+4, y+5);
  doc.setFont(undefined, 'normal');
  doc.text('Este instrumento e de rastreio e nao possui finalidade diagnostica. Nao substitui', M+4, y+10);
  doc.text('avaliacao clinica profissional. Resultados devem ser interpretados por profissional qualificado.', M+4, y+14);

  // --- RODAPE ---
  doc.setFillColor(50, 50, 50);
  doc.rect(0, 285, W, 12, 'F');
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('SYM Online  |  ' + formatarData(dados.data) + '  |  Gerado em ' + new Date().toLocaleString('pt-BR'), W/2, 291, {align:'center'});

  // --- SALVAR ---
  var nomeArq = limpar(dados.escala||'Escala').replace(/\s+/g,'_') + '_' + limpar(dados.paciente||'').replace(/\s+/g,'_') + '_' + timestamp() + '.pdf';
  doc.save(nomeArq);

  return doc.output('datauristring');
}

function limpar(s) {
  if (!s) return '';
  return String(s)
    .replace(/[\u2600-\u27BF\uD800-\uDFFF\uFE00-\uFE0F\u200D]/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u024F]/g, '')
    .trim();
}

function formatarData(d) {
  if (!d) return new Date().toLocaleDateString('pt-BR');
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch(e) { return d; }
}

function timestamp() {
  var d = new Date();
  return d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') + String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0');
}
