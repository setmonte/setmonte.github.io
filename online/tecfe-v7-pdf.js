// tecfe-v7-pdf.js
// Exportacao PDF com tabelas normativas, logo, ABNT, grafico barras
// SEM acentos nos comentarios/strings do codigo

var WCSTPDF = (function () {

  var _logoBase64 = null;

  // Pre-carregar logo como base64
  function preloadLogo() {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      _logoBase64 = canvas.toDataURL('image/png');
    };
    img.src = 'l.png';
  }
  preloadLogo();

  // -- Logo no PDF via imagem --
  function drawLogo(doc, x, y) {
    if (_logoBase64) {
      // Centralizar: largura proporcional a altura 10mm
      doc.addImage(_logoBase64, 'PNG', 148.5 - 21, y - 10, 42, 18);
    } else {
      // Fallback texto se imagem nao carregou
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 0, 0);
      doc.text('S', x - 10, y);
      doc.setFontSize(34);
      doc.setTextColor(0, 0, 255);
      doc.text('T', x - 4, y + 2);
      doc.setFontSize(22);
      doc.setTextColor(128, 128, 128);
      doc.text('M', x + 8, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
    }
  }

  // -- Cor condicional: azul positivo, vermelho negativo --
  function valueColor(doc, val) {
    if (val < 0) doc.setTextColor(255, 0, 0);
    else if (val > 0) doc.setTextColor(0, 0, 255);
    else doc.setTextColor(0, 0, 0);
  }

  // -- Classificacao global (pior indicador) --
  function classifGlobal(stats) {
    // Classificacao por Escore T (perseveracao)
    var classT = WCSTEngine.classifyDiagnostic(stats.escoreT);
    // Classificacao por categorias
    var classCat = 'Acima da Media';
    if (stats.completedCategories === 0) classCat = 'Gravemente Comprometido';
    else if (stats.completedCategories <= 2) classCat = 'Moderadamente Comprometido';
    else if (stats.completedCategories <= 4) classCat = 'Abaixo da Media';
    else if (stats.completedCategories <= 5) classCat = 'Na Media';
    // Classificacao por % erros
    var classErr = 'Acima da Media';
    if (stats.pctErrors > 60) classErr = 'Gravemente Comprometido';
    else if (stats.pctErrors > 40) classErr = 'Moderadamente Comprometido';
    else if (stats.pctErrors > 30) classErr = 'Abaixo da Media';
    else if (stats.pctErrors > 20) classErr = 'Na Media';
    // Retorna o pior dos tres
    var ordem = ['Gravemente Comprometido','Moderado a Gravemente Comprometido','Moderadamente Comprometido','Leve a Moderadamente Comprometido','Levemente Comprometido','Abaixo da Media','Na Media','Acima da Media'];
    var iT = ordem.indexOf(classT);
    var iC = ordem.indexOf(classCat);
    var iE = ordem.indexOf(classErr);
    if (iT < 0) iT = 7;
    if (iC < 0) iC = 7;
    if (iE < 0) iE = 7;
    return ordem[Math.min(iT, iC, iE)];
  }

  // -- Gerar PDF completo --
  function generate(formData, stats, abandoned, historicoAnterior, laudoIA, estrategia) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('landscape');
    var yPos = 20;

    // Logo centralizado
    drawLogo(doc, 138, yPos);
    yPos += 14;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    var appVer = '6';
    try { var el = document.getElementById('appVersion'); if (el) appVer = el.textContent.replace('v',''); } catch(e) {}
    var isOnline = window._isOnlineTest || false;
    var title = isOnline ? 'RESULTADOS DO TECFEON v' + appVer : 'RESULTADOS DO TECFE v' + appVer;
    if (abandoned === 'interrompido') title += ' - TESTE INTERROMPIDO';
    else if (abandoned) title += ' - TESTE ABANDONADO';
    else if (stats.trialsPerformed < 128 && stats.completedCategories < 6) title += ' - TESTE PARCIAL';
    doc.text(title, 148, yPos, { align: 'center' });
    yPos += 5;

    // Dados do paciente
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    var nascFmt = formData.nascimento ? new Date(formData.nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/I';
    doc.text('Nome: ' + formData.nome + '  |  Idade: ' + formData.idade + '  |  Nasc: ' + nascFmt + '  |  Sexo: ' + (formData.sexo || 'N/I') + '  |  Lateralidade: ' + (formData.lateralidade || 'N/I'), 10, yPos);
    yPos += 4;
    doc.text('CPF: ' + (formData.cpf || 'N/I') + '  |  ID Paciente: ' + (formData.idPaciente || 'N/I'), 10, yPos);
    yPos += 4;
    doc.text('Escolaridade: ' + formData.escolaridade + '  |  Profissao: ' + (formData.profissao || 'N/I') + '  |  Avaliador: ' + (formData.avaliador || 'N/I') + '  |  CRP: ' + (formData.crp || 'N/I'), 10, yPos);
    yPos += 4;
    var min = Math.floor(stats.totalTime / 60);
    var sec = Math.round(stats.totalTime % 60);
    doc.text('Tempo: ' + min + 'min ' + sec + 's  |  Tentativas: ' + stats.trialsPerformed + '/128', 10, yPos);
    yPos += 5;

    // -- Tabela principal --
    doc.autoTable({
      startY: yPos,
      head: [['N Total de Erros', '% Erros', 'Resp Persev', '% Resp Persev', 'Erros Persev', '% Erros Persev', 'Erros Nao-Persev', '% Nivel Conceitual', 'Escore T', 'Escore Padrao']],
      body: [[
        stats.totalErrors,
        stats.pctErrors.toFixed(1),
        stats.persevResponses,
        stats.pctPersevResp.toFixed(1),
        stats.persevErrors,
        stats.pctPersevErr.toFixed(1),
        stats.nonPersevErrors,
        stats.pctConceptual.toFixed(1),
        stats.escoreT,
        stats.escorePadrao
      ]],
      willDrawCell: function (data) {
        if (data.section === 'body' && (data.column.index === 8 || data.column.index === 9)) {
          var txt = data.cell.text ? data.cell.text[0] : String(data.cell.raw || '');
          var v = parseFloat(txt);
          if (data.column.index === 8) {
            if (v < 50) data.cell.styles.textColor = [255, 0, 0];
            else if (v > 50) data.cell.styles.textColor = [0, 0, 255];
          }
          if (data.column.index === 9) {
            if (v < 100) data.cell.styles.textColor = [255, 0, 0];
            else if (v > 100) data.cell.styles.textColor = [0, 0, 255];
          }
        }
      },
      theme: 'grid',
      headStyles: { fillColor: [100, 180, 100], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      margin: { left: 10, right: 10 }
    });
    yPos = doc.lastAutoTable.finalY + 3;

    // -- Segunda tabela --
    var ltl = stats.learningToLearn !== null ? stats.learningToLearn.toFixed(2) : 'N/A';
    doc.autoTable({
      startY: yPos,
      head: [['Categorias', 'Ensaios 1a Cat.', 'Fracasso Manter', 'Aprend. a Aprender', 'Impulsividade', 'Classif. Diagnostica (Heaton)']],
      body: [[
        stats.completedCategories,
        stats.trialsToFirst,
        stats.failMaintain,
        ltl,
        stats.impulsivityIndex.toFixed(2),
        (abandoned || stats.trialsPerformed < 20) ? 'Teste Inconclusivo' : classifGlobal(stats)
      ]],
      willDrawCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
          var txt = data.cell.text ? data.cell.text[0] : String(data.cell.raw || '');
          var v = parseFloat(txt);
          if (!isNaN(v)) {
            if (v < 0) data.cell.styles.textColor = [255, 0, 0];
            else if (v > 0) data.cell.styles.textColor = [0, 0, 255];
          }
        }
      },
      theme: 'grid',
      headStyles: { fillColor: [100, 180, 100], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      margin: { left: 10, right: 10 }
    });
    yPos = doc.lastAutoTable.finalY + 3;

    // -- Estrategia identificada pela IA --
    if (estrategia) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text('ESTRATEGIA IDENTIFICADA: ', 10, yPos);
      var estratX = doc.getTextWidth('ESTRATEGIA IDENTIFICADA: ') + 10;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      var estratLines = doc.splitTextToSize(estrategia, 276 - estratX + 10);
      doc.text(estratLines[0], estratX, yPos);
      if (estratLines.length > 1) {
        for (var el = 1; el < estratLines.length; el++) {
          yPos += 3.5;
          doc.text(estratLines[el], 10, yPos);
        }
      }
      yPos += 5;
    }

    // -- Tabela comparativa normativa --
    var normH = WCSTEngine.getNormHeaton(formData.idadeAnos, formData.escolaridade);
    var normS = WCSTEngine.getNormSilva(formData.idadeAnos, formData.escolaridade);
    doc.autoTable({
      startY: yPos,
      head: [['Indicador', 'Paciente', 'Heaton 2005', 'Silva-Filho 2007']],
      body: [
        ['Categorias Completadas', stats.completedCategories, normH.catCompleted, normS.catCompleted],
        ['% Erros', stats.pctErrors.toFixed(1), normH.pctErrors.toFixed(1), normS.pctErrors.toFixed(1)],
        ['% Erros Perseverativos', stats.pctPersevErr.toFixed(1), normH.pctPersev.toFixed(1), normS.pctPersev.toFixed(1)],
        ['% Nivel Conceitual', stats.pctConceptual.toFixed(1), normH.pctConceptual.toFixed(1), normS.pctConceptual.toFixed(1)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [70, 130, 180], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      columnStyles: { 0: { halign: 'left' } },
      margin: { left: 10, right: 10 }
    });
    yPos = doc.lastAutoTable.finalY + 3;

    // -- Curva de insight --
    if (stats.insightCurve && stats.insightCurve.length > 1) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('CURVA DE INSIGHT (% acerto por bloco de 16):', 10, yPos);
      yPos += 3;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7);
      var txt = '';
      for (var i = 0; i < stats.insightCurve.length; i++) {
        txt += 'B' + (i + 1) + ':' + stats.insightCurve[i] + '%  ';
      }
      doc.text(txt, 10, yPos);
      yPos += 3;
    }

    // -- Grafico de erros (esquerda) + Analise clinica (direita) --
    var graphStartY = yPos;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('ERROS POR CATEGORIA:', 10, yPos);
    yPos += 3;

    var rs = stats.roundStats;
    var errCor = (rs[1].cor.e + (rs[2] ? rs[2].cor.e : 0));
    var errForma = (rs[1].forma.e + (rs[2] ? rs[2].forma.e : 0));
    var errNum = (rs[1].numero.e + (rs[2] ? rs[2].numero.e : 0));
    var errs = [errCor, errForma, errNum];
    var labels = ['Cor', 'Forma', 'Numero'];
    var colors = [[255, 99, 132], [54, 162, 235], [255, 206, 86]];
    var maxE = Math.max.apply(null, errs);
    if (maxE === 0) maxE = 1;
    var bw = 18;
    var mh = 25;
    var bx = 15;

    for (var i = 0; i < 3; i++) {
      var bh = (errs[i] / maxE) * mh;
      doc.setFillColor(colors[i][0], colors[i][1], colors[i][2]);
      doc.rect(bx, yPos + mh - bh, bw, bh, 'F');
      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);
      doc.text(labels[i], bx + bw / 2, yPos + mh + 4, { align: 'center' });
      doc.text('' + errs[i], bx + bw / 2, yPos + mh - bh - 1, { align: 'center' });
      bx += bw + 8;
    }

    // Analise clinica + Parecer IA (lado direito do grafico)
    var rightX = 100;
    var rightY = graphStartY;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ANALISE CLINICA:', rightX, rightY);
    rightY += 3;
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'normal');
    var analysis = WCSTEngine.getClinicalAnalysis(stats, abandoned);
    var lines = doc.splitTextToSize(analysis, 190);
    doc.text(lines, rightX, rightY);
    rightY += lines.length * 2.8 + 1;

    // Alerta de resposta aleatoria (lado direito)
    if (stats.randomAlerts && stats.randomAlerts.length > 0) {
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 0, 0);
      doc.text('ALERTA - RESPOSTA ALEATORIA DETECTADA:', rightX, rightY);
      rightY += 3;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      for (var ra = 0; ra < stats.randomAlerts.length; ra++) {
        var alerta = stats.randomAlerts[ra];
        doc.text(alerta.block + ': ' + alerta.motivos.join('; '), rightX + 2, rightY);
        rightY += 2.5;
      }
      rightY += 1;
    }

    // Parecer IA (lado direito)
    if (laudoIA) {
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 80, 0);
      doc.text('PARECER TECFE (assistido por IA):', rightX, rightY);
      rightY += 3;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      var aiLines = doc.splitTextToSize(laudoIA, 190);
      doc.text(aiLines, rightX, rightY);
      rightY += aiLines.length * 2.8 + 1;
    }

    // yPos avanca para o maior entre grafico e texto direito
    yPos = Math.max(yPos + mh + 5, rightY) + 2;

    // -- PAGINA HISTORICO: comparacoes --
    if (historicoAnterior && historicoAnterior.length > 0) {
      doc.addPage();
      yPos = 20;

      drawLogo(doc, 138, yPos);
      yPos += 14;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('COMPARATIVO DE EXECUCOES - ' + formData.nome, 148, yPos, { align: 'center' });
      yPos += 8;

      // Tabela historico
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('HISTORICO DE EXECUCOES ANTERIORES:', 10, yPos);
      yPos += 3;
      var histHead = [['Data', 'Status', 'Categorias', '% Erros', '% Persev', 'Tempo', 'Tentativas', 'Estrategia']];
      var histBody = [];
      for (var h = 0; h < historicoAnterior.length; h++) {
        var reg = historicoAnterior[h];
        histBody.push([
          reg.data || '', reg.status || '', reg.categorias || 0,
          reg.percentErros || '', reg.percentPersev || '',
          reg.tempo || '', reg.tentativas || 0,
          reg.estrategia || 'N/I'
        ]);
      }
      doc.autoTable({
        startY: yPos,
        head: histHead,
        body: histBody,
        theme: 'grid',
        headStyles: { fillColor: [255, 152, 0], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
        styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
        margin: { left: 10, right: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 8;

      // Grafico comparativo
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('GRAFICO COMPARATIVO DE EXECUCOES:', 10, yPos);
      yPos += 5;
      var compLabels = [];
      var compErros = [];
      var compPersev = [];
      for (var g = 0; g < historicoAnterior.length; g++) {
        compLabels.push((g + 1) + 'a');
        compErros.push(parseFloat(historicoAnterior[g].percentErros) || 0);
        compPersev.push(parseFloat(historicoAnterior[g].percentPersev) || 0);
      }
      compLabels.push('Atual');
      compErros.push(parseFloat(stats.pctErrors.toFixed(1)));
      compPersev.push(parseFloat(stats.pctPersevErr.toFixed(1)));
      var compMax = Math.max.apply(null, compErros.concat(compPersev));
      if (compMax === 0) compMax = 1;
      var cbw = 12;
      var cmh = 40;
      var cx = 20;
      var cxStart = 20;
      var maxCx = 260;
      for (var g = 0; g < compLabels.length; g++) {
        if (cx + cbw * 2 + 10 > maxCx) {
          cx = cxStart;
          yPos += cmh + 15;
        }
        var bh1 = (compErros[g] / compMax) * cmh;
        var bh2 = (compPersev[g] / compMax) * cmh;
        doc.setFillColor(255, 99, 132);
        doc.rect(cx, yPos + cmh - bh1, cbw, bh1, 'F');
        doc.setFillColor(54, 162, 235);
        doc.rect(cx + cbw + 2, yPos + cmh - bh2, cbw, bh2, 'F');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(compLabels[g], cx + cbw, yPos + cmh + 5, { align: 'center' });
        // Valores acima das barras
        if (bh1 > 0) doc.text('' + compErros[g], cx + cbw / 2, yPos + cmh - bh1 - 1, { align: 'center' });
        if (bh2 > 0) doc.text('' + compPersev[g], cx + cbw + 2 + cbw / 2, yPos + cmh - bh2 - 1, { align: 'center' });
        cx += cbw * 2 + 10;
      }
      // Legenda
      doc.setFontSize(7);
      doc.setFillColor(255, 99, 132);
      doc.rect(cx + 10, yPos + 5, 6, 4, 'F');
      doc.text('% Erros', cx + 18, yPos + 9);
      doc.setFillColor(54, 162, 235);
      doc.rect(cx + 10, yPos + 12, 6, 4, 'F');
      doc.text('% Persev', cx + 18, yPos + 16);
      yPos += cmh + 10;
    }

    // -- Referencias ABNT (dinamico - so nova pagina se nao couber) --
    var refsHeight = 25;
    if (yPos + refsHeight > 195) { doc.addPage(); yPos = 20; }
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('REFERENCIAS:', 10, yPos);
    yPos += 3;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(6);
    var refs = [
      'HEATON, R. K. et al. Wisconsin Card Sorting Test: manual revised and expanded. Odessa: PAR, 1993.',
      'HEATON, R. K. et al. WCST: computer version 4 - research edition. Lutz: PAR, 2005.',
      'CUNHA, J. A. et al. Teste Wisconsin de Classificacao de Cartas: adaptacao e padronizacao brasileira. Sao Paulo: Casa do Psicologo, 2005.',
      'SILVA-FILHO, J. H. Validade e normas do Wisconsin Card Sorting Test em adultos da regiao de Ribeirao Preto. 2007. Tese (Doutorado) - USP, Ribeirao Preto, 2007.',
      'LEZAK, M. D. et al. Neuropsychological Assessment. 5. ed. New York: Oxford University Press, 2012.'
    ];
    for (var i = 0; i < refs.length; i++) {
      doc.text(refs[i], 10, yPos);
      yPos += 3;
    }

    // -- Numeracao de paginas --
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(p + '/' + totalPages, 287, 200, { align: 'right' });
    }

    return doc;
  }

  // -- Gerar nome do arquivo --
  function filename(nome, abandoned) {
    var ts = WCSTUI.dateTimeStamp();
    var n = nome.replace(/\s+/g, '_');
    var suffix = '';
    if (abandoned === 'interrompido') suffix = '_INTERROMPIDO';
    else if (abandoned) suffix = '_ABANDONADO';
    return 'TECFE_' + n + '_' + ts + suffix + '.pdf';
  }

  // -- Salvar via Tauri/pywebview ou fallback browser --
  function save(doc, fname) {
    var dataUrl = doc.output('datauristring');
    if (window.__TAURI__) {
      return window.__TAURI__.core.invoke('save_pdf', { filename: fname, dataUrl: dataUrl });
    } else if (window.pywebview && window.pywebview.api) {
      return window.pywebview.api.save_pdf(fname, dataUrl);
    } else {
      doc.save(fname);
      return Promise.resolve({ success: true });
    }
  }

  return {
    generate: generate,
    filename: filename,
    save: save,
    drawLogo: drawLogo
  };

})();
