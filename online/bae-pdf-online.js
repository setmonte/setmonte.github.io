// BAE PDF Generator para o painel online
async function generateBAEPDF(idx) {
  try {
    var r = _baeResultCache[idx];
    if (!r) { alert('Resultado nao encontrado'); return; }
    var d = r.data || {};
    var p = d.paciente || d.formData || {};
    var nome = p.patientName || p.nome || 'Paciente';
    var nasc = p.birthDate || p.dataNascimento || '';
    var sexo = p.sex || p.sexo || '';
    var escol = p.education || p.escolaridade || '';
    var aval = p.evaluator || p.nomePsicologo || '';
    var crp = p.crp || '';
    var idade = p.idade || '';
    if (!idade && nasc) {
      var n = new Date(nasc), h = new Date();
      var a = h.getFullYear()-n.getFullYear(), m = h.getMonth()-n.getMonth();
      if (m<0){a--;m+=12;} idade = a + ' anos';
    }
    var testes = ['concentrada','seletiva','dividida','alternada','sustentada'];
    var nomes = ['Concentrada','Seletiva','Dividida','Alternada','Sustentada'];

    // Chamar IA Gemini
    var laudoIA = null;
    try {
      var k = ['AIza','SyA_','Xxm8','ObIN','uPtn','_23X','fo5p','AUWS','Nzfh','GvI'].join('');
      var resumo = 'Paciente: ' + nome + ', Idade: ' + idade + ', Sexo: ' + sexo + ', Escolaridade: ' + escol + '\n';
      testes.forEach(function(t,i) {
        var td = d[t]; if (!td) return;
        resumo += nomes[i] + ': Taxa=' + (td.taxaAcerto||0).toFixed(1) + '%, RT=' + (td.tempoMedio||0) + 'ms, Erros=' + (td.erros||0) + ', Omissoes=' + (td.omissoes||0) + '\n';
      });
      var aiPrompt = 'Voce e um neuropsicologo experiente. Analise os resultados da BAE (Bateria de Atencao Eletronica) e gere um LAUDO CLINICO breve (max 10 linhas).\n' +
        'Considere as 3 redes atencionais de Posner: Orientacao (Concentrada+Seletiva), Executiva (Dividida+Alternada), Vigilancia (Sustentada).\n' +
        resumo + '\nPortugues brasileiro. Interprete clinicamente. NAO repita numeros. Identifique potencialidades e fragilidades.';
      var aiTimeout = new Promise(function(_,rej){setTimeout(function(){rej('timeout');},30000);});
      var aiCall = fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key='+k, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({contents:[{parts:[{text:aiPrompt}]}]})
      }).then(function(r){return r.json();}).then(function(d){
        return (d.candidates&&d.candidates[0]&&d.candidates[0].content)?d.candidates[0].content.parts[0].text.trim():'';
      });
      laudoIA = await Promise.race([aiCall, aiTimeout]);
    } catch(e) { laudoIA = null; }

    // Gerar PDF com jsPDF
    var doc = new jspdf.jsPDF();
    var y = 15;
    doc.setFontSize(18); doc.setTextColor(46,125,50);
    doc.text('BAE - Bateria de Atencao Eletronica', 105, y, {align:'center'}); y+=8;
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text('Relatorio de Resultados', 105, y, {align:'center'}); y+=10;

    // Dados do paciente
    doc.setFontSize(12); doc.setTextColor(46,125,50);
    doc.text('Dados do Paciente', 14, y); y+=6;
    doc.setFontSize(9); doc.setTextColor(0);
    doc.text('Nome: ' + nome, 14, y); doc.text('Idade: ' + idade, 120, y); y+=5;
    doc.text('Sexo: ' + sexo, 14, y); doc.text('Escolaridade: ' + escol, 120, y); y+=5;
    doc.text('Avaliador: ' + aval, 14, y); doc.text('CRP: ' + crp, 120, y); y+=5;
    doc.text('Data: ' + (d.date ? new Date(d.date).toLocaleDateString('pt-BR') : ''), 14, y); y+=8;

    // Tabela de resultados
    var rows = [];
    testes.forEach(function(t,i) {
      var td = d[t];
      if (!td) { rows.push([nomes[i],'-','-','-','-','-']); return; }
      rows.push([
        nomes[i],
        (td.acertos||td.totalAcertos||0).toString(),
        (td.erros||(td.errosVisuais||0)+(td.errosAuditivos||0)||0).toString(),
        (td.omissoes||(td.omissoesVisuais||0)+(td.omissoesAuditivas||0)||0).toString(),
        (td.taxaAcerto||0).toFixed(1)+'%',
        (td.tempoMedio||0)+'ms'
      ]);
    });
    doc.autoTable({
      startY: y, head:[['Teste','Acertos','Erros','Omissoes','Taxa','RT Medio']],
      body: rows, theme:'grid',
      headStyles:{fillColor:[46,125,50],fontSize:9},
      bodyStyles:{fontSize:9}, margin:{left:14,right:14}
    });
    y = doc.lastAutoTable.finalY + 8;

    // Redes Atencionais
    var conc = d.concentrada, sel = d.seletiva, div = d.dividida, alt = d.alternada, sus = d.sustentada;
    var nOri = (conc?1:0)+(sel?1:0); var ori = nOri ? ((conc?conc.taxaAcerto:0)+(sel?sel.taxaAcerto:0))/nOri : 0;
    var nExe = (div?1:0)+(alt?1:0); var exe = nExe ? ((div?div.taxaAcerto:0)+(alt?alt.taxaAcerto:0))/nExe : 0;
    var vig = sus ? sus.taxaAcerto : 0;
    doc.setFontSize(12); doc.setTextColor(46,125,50);
    doc.text('Perfil das Redes Atencionais (Posner & Petersen, 1990)', 14, y); y+=6;
    doc.setFontSize(9); doc.setTextColor(0);
    function classif(v){return v>=85?'Adequado':v>=70?'Limitrofe':'Comprometido';}
    doc.text('Rede de Orientacao (Concentrada+Seletiva): ' + ori.toFixed(1) + '% - ' + classif(ori), 14, y); y+=5;
    doc.text('Rede Executiva (Dividida+Alternada): ' + exe.toFixed(1) + '% - ' + classif(exe), 14, y); y+=5;
    doc.text('Rede de Vigilancia (Sustentada): ' + vig.toFixed(1) + '% - ' + classif(vig), 14, y); y+=8;

    // IA
    if (laudoIA) {
      if (y > 230) { doc.addPage(); y = 15; }
      doc.setFontSize(12); doc.setTextColor(46,125,50);
      doc.text('Analise Clinica (IA Gemini)', 14, y); y+=6;
      doc.setFontSize(9); doc.setTextColor(0);
      var lines = doc.splitTextToSize(laudoIA, 180);
      doc.text(lines, 14, y);
    }

    // Rodape
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text('BAE 3.0 Online - Sistema SYM - Documento gerado automaticamente', 105, 290, {align:'center'});

    var ts = new Date().toISOString().replace(/[-:T]/g,'').slice(0,12);
    var fn = 'BAE_' + nome.replace(/\s+/g,'_') + '_' + ts + '.pdf';
    doc.save(fn);
  } catch(e) {
    alert('Erro ao gerar PDF: ' + e.message);
    console.error(e);
  }
}
