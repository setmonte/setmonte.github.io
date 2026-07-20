// neo-pdf.js — Gera PDF dos resultados do NEO PI-R
// Variavel global para cache dos resultados (preenchida pelo index.html)
var _neoResultCache = _neoResultCache || [];

function neoGerarPDF(idx) {
  var entry = _neoResultCache[idx];
  if (!entry) { alert('Resultado nao encontrado.'); return; }
  var d = entry.data || {};
  var dom = d.dominios || {};
  var facetas = d.facetas || {};
  var paciente = d.paciente || 'Paciente';
  var idade = d.idade || '-';
  var sexo = d.sexo || '-';
  var dataAval = d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '-';
  var idPaciente = d.idPaciente || '-';

  // Norma utilizada
  var norma = (sexo === 'Masculino' || sexo === 'Feminino') ? sexo : 'Geral';

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var ml = 15;
  var lu = 180;
  var y = 0;

  // === CABECALHO ROXO ===
  doc.setFillColor(74, 20, 140);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('NEO PI-R - Inventario de Personalidade NEO Revisado', 105, 12, {align: 'center'});
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Modelo dos Cinco Grandes Fatores (Big Five) - Costa & McCrae', 105, 20, {align: 'center'});
  doc.setFontSize(8);
  doc.text('Norma: ' + norma + ' (N=160.671)', 105, 27, {align: 'center'});

  y = 40;

  // === DADOS DO PACIENTE ===
  doc.setFillColor(237, 231, 246);
  doc.rect(ml - 3, y - 5, lu + 6, 28, 'F');
  doc.setTextColor(74, 20, 140);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('DADOS DO PACIENTE', ml, y);
  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Nome: ' + paciente, ml, y);
  y += 5;
  doc.text('Idade: ' + idade + '   |   Sexo: ' + sexo + '   |   Data: ' + dataAval, ml, y);
  y += 5;
  doc.text('ID Paciente: ' + idPaciente, ml, y);
  y += 12;

  // === TABELA DOS 5 DOMINIOS ===
  doc.setTextColor(74, 20, 140);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('DOMINIOS (Big Five)', ml, y);
  y += 7;

  // Cabecalho da tabela
  doc.setFillColor(74, 20, 140);
  doc.rect(ml, y - 4, lu, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Dominio', ml + 3, y);
  doc.text('Escore T', ml + 80, y);
  doc.text('Classificacao', ml + 120, y);
  y += 8;

  // Cores por dominio
  var dominiosCores = {
    'Neuroticismo': [220, 53, 69],
    'Extroversao': [255, 152, 0],
    'Abertura': [76, 175, 80],
    'Amabilidade': [156, 39, 176],
    'Conscienciosidade': [33, 150, 243]
  };

  var dominiosOrdem = ['Neuroticismo', 'Extroversao', 'Abertura', 'Amabilidade', 'Conscienciosidade'];

  doc.setFont(undefined, 'normal');
  for (var di = 0; di < dominiosOrdem.length; di++) {
    var nomeDom = dominiosOrdem[di];
    var dadosDom = dom[nomeDom] || {};
    var cor = dominiosCores[nomeDom] || [100, 100, 100];
    var escT = dadosDom.escoreT != null ? dadosDom.escoreT : '-';
    var classif = dadosDom.classificacao || '-';

    // Fundo alternado com cor do dominio suave
    doc.setFillColor(cor[0], cor[1], cor[2]);
    doc.rect(ml, y - 3.5, 3, 6, 'F');
    if (di % 2 === 0) {
      doc.setFillColor(248, 248, 255);
      doc.rect(ml + 3, y - 3.5, lu - 3, 6, 'F');
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(nomeDom, ml + 6, y);
    doc.text(String(escT), ml + 85, y);
    doc.text(classif, ml + 120, y);
    y += 7;
  }

  y += 8;

  // === TABELA DE FACETAS (se disponivel) ===
  var facetasKeys = Object.keys(facetas);
  if (facetasKeys.length > 0) {
    // Verificar se precisa de nova pagina
    if (y > 200) { doc.addPage(); y = 15; }

    doc.setTextColor(74, 20, 140);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('FACETAS (30 Subescalas)', ml, y);
    y += 7;

    // Cabecalho
    doc.setFillColor(74, 20, 140);
    doc.rect(ml, y - 4, lu, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Faceta', ml + 3, y);
    doc.text('Escore T', ml + 90, y);
    doc.text('Classificacao', ml + 125, y);
    y += 8;

    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);

    for (var fi = 0; fi < facetasKeys.length; fi++) {
      // Paginacao
      if (y > 270) {
        doc.addPage();
        y = 15;
        // Repetir cabecalho na nova pagina
        doc.setFillColor(74, 20, 140);
        doc.rect(ml, y - 4, lu, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('Faceta', ml + 3, y);
        doc.text('Escore T', ml + 90, y);
        doc.text('Classificacao', ml + 125, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
      }

      var nomeFac = facetasKeys[fi];
      var dadosFac = facetas[nomeFac] || {};
      var escTFac = dadosFac.escoreT != null ? dadosFac.escoreT : '-';
      var classifFac = dadosFac.classificacao || '-';

      // Fundo alternado
      if (fi % 2 === 0) {
        doc.setFillColor(248, 245, 255);
        doc.rect(ml, y - 3.5, lu, 5.5, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.text(nomeFac, ml + 3, y);
      doc.text(String(escTFac), ml + 93, y);
      doc.text(classifFac, ml + 125, y);
      y += 6;
    }
  }

  // === RODAPE ===
  var totalPages = doc.internal.getNumberOfPages();
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(ml, 284, ml + lu, 284);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR') + '   |   Sistema SYM Online', ml, 288);
    doc.text('Pag. ' + pg + '/' + totalPages, ml + lu, 288, {align: 'right'});
  }

  // === DISCLAIMER (ultima pagina) ===
  doc.setPage(totalPages);
  var yDisc = 276;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.text('O NEO PI-R e um instrumento psicologico de uso exclusivo do psicologo.', ml, yDisc);

  // === SALVAR ===
  var nomeArq = paciente.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  var agora = new Date();
  var dataStr = agora.getFullYear() + String(agora.getMonth() + 1).padStart(2, '0') + String(agora.getDate()).padStart(2, '0');
  doc.save('NEO-PI-R_' + nomeArq + '_' + dataStr + '.pdf');
}
