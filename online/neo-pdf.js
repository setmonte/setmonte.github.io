// neo-pdf.js — Gera PDF dos resultados do NEO PI-R (estilo Vetor)
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
  var norma = (sexo === 'Masculino' || sexo === 'Feminino') ? sexo : 'Geral';

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var pag = 0;

  // Cores RGB por dominio
  var CORES = {N:[211,47,47],E:[239,108,0],O:[56,142,60],A:[123,31,162],C:[21,101,192]};

  // Descricoes polo baixo/alto - Dominios
  var DESC_D = {
    N:{nome:'NEUROTICISMO',baixo:'Apresenta maior estabilidade emocional e tende a enfrentar as pressoes do dia a dia de forma mais moderada e bem estruturada.',alto:'Apresenta menor capacidade de tolerar frustracoes e de conter seus impulsos; pode ser mais instavel e desajustado emocionalmente diante de situacoes de estresse.'},
    E:{nome:'EXTROVERSAO',baixo:'Tende a manter uma postura reservada e nao impositiva quanto a seu ponto de vista. Tem preferencia em ficar sozinho e busca em menor grau a estimulacao social.',alto:'Tem preferencia por grupos e busca, em maior grau, a estimulacao social. Tende a manter uma postura sociavel e assertiva com relacao as pessoas.'},
    O:{nome:'ABERTURA',baixo:'Apresenta maior preferencia por atividade rotineira e que lhe e familiar. Tende a ter uma gama mais limitada de interesses e a manter uma postura mais conservadora e convencional.',alto:'Apresenta maior interesse pela variedade e por tarefas e ideias novas. Tende a manter uma postura curiosa, com maior diversidade de interesses e aceita mais facilmente mudancas.'},
    A:{nome:'AMABILIDADE',baixo:'Tende a ser mais voltado para si e a ser autocentrado(a). Pode demonstrar maior desconfianca e a manter uma postura mais cetica em relacao as demais pessoas.',alto:'E propenso a manter uma postura simpatica e cordial com as pessoas. Maior anseio em ajudar e cooperar e maior preocupacao com o bem-estar alheio.'},
    C:{nome:'CONSCIENCIOSIDADE',baixo:'Apresenta menor grau de escrupulosidade; tende a ser menos exigente consigo mesmo com relacao as obrigacoes e a ser menos obstinado a atingir os objetivos.',alto:'Tende a ser mais propositado e escrupuloso em relacao aos compromissos profissionais e pessoais. Maior grau de responsabilidade e de determinacao para atingir os objetivos.'}
  };

  // Descricoes polo baixo/alto - Facetas
  var DESC_F = {
    'Ansiedade':{dom:'N',baixo:'E menos propenso(a) a estados emocionais negativos e a se preocupar com o futuro; tende a se apresentar de forma calma.',alto:'Maior propensao a se preocupar com o futuro; tende a ser mais preocupado(a) e apreensivo(a).'},
    'Raiva/Hostilidade':{dom:'N',baixo:'Apresenta menor propensao a expressar raiva e irritacao.',alto:'Tende a expressar raiva e irritabilidade e a demonstrar frustracao com mais frequencia.'},
    'Depress\u00e3o':{dom:'N',baixo:'Tem menor tendencia a sentir tristeza, desesperanca e desencorajamento.',alto:'Tem maior disposicao para sentir desesperanca, solidao e tristeza. Desencoraja-se e desanima-se mais facilmente.'},
    'Embara\u00e7o/Constrangimento':{dom:'N',baixo:'Sente-se confortavel em situacoes sociais e lida com menos angustia com situacoes constrangedoras.',alto:'Apresenta maior propensao a sentir constrangimento em situacoes sociais e a ficar desconfortavel ante outras pessoas.'},
    'Impulsividade':{dom:'N',baixo:'Apresenta uma postura mais comedida em relacao aos proprios impulsos e maior tolerancia as frustracoes.',alto:'Tem maior dificuldade em resistir a seus impulsos e menor tolerancia as frustracoes.'},
    'Vulnerabilidade':{dom:'N',baixo:'Sente maior grau de seguranca para lidar com situacoes de pressao e para tomar decisoes.',alto:'Sente maior grau de inseguranca para tomar decisoes sob pressao e para lidar com situacoes de estresse.'},
    'Acolhimento Caloroso':{dom:'E',baixo:'Apresenta maior nivel de formalidade, tende a ser reservado(a) e nao cria vinculos proximos com facilidade.',alto:'Apresenta maior facilidade em estabelecer vinculos sociais e mantem uma postura simpatica com as pessoas.'},
    'Gregarismo':{dom:'E',baixo:'Prefere desenvolver atividades em lugares tranquilos com poucas pessoas ou entao sozinho(a).',alto:'Prefere interagir e desenvolver atividades com grande numero de pessoas ao mesmo tempo e aprecia a companhia dos outros.'},
    'Assertividade':{dom:'E',baixo:'Tende a nao se posicionar de maneira afirmativa, pode hesitar para falar e prefere receber orientacao a fornece-la.',alto:'Tende a se posicionar de maneira afirmativa e a manter uma postura dominante, preferindo fornecer comandos e orientacoes aos outros.'},
    'Atividade':{dom:'E',baixo:'E propenso(a) a manter uma postura calma e prefere desenvolver as atividades de forma vagarosa.',alto:'Tende a manter uma postura entusiasmada e dinamica para desenvolver as atividades.'},
    'Busca de Sensa\u00e7\u00f5es':{dom:'E',baixo:'Aprecia a tranquilidade, evita experiencias intensas e prefere um estilo de vida mais sereno.',alto:'Prefere atividades animadas e mais agitadas e tende a ter um estilo de vida mais agitado.'},
    'Emo\u00e7\u00f5es Positivas':{dom:'E',baixo:'Tende a ser menos otimista e menos bem humorado(a). Tem menor propensao para ver o lado bom das coisas.',alto:'Tende a ser alegre e positivo(a). E mais propenso(a) a ser otimista e a ver o lado positivo das coisas.'},
    'Fantasia':{dom:'O',baixo:'Prefere lidar com atividades concretas que nao exijam maior grau de imaginacao.',alto:'Prefere lidar com atividades nas quais seja necessario maior grau de criatividade e imaginacao.'},
    'Est\u00e9tica':{dom:'O',baixo:'Apresenta menor tendencia a se sensibilizar pelas artes e menor interesse pelas formas de expressao estetica.',alto:'Tende a se sensibilizar pelas artes e maior interesse pelas formas de expressao estetica.'},
    'Sentimentos':{dom:'O',baixo:'Tende a atribuir pouca importancia aos sentimentos e expressa as emocoes com menor intensidade.',alto:'Atribui maior importancia aos sentimentos e experiencia as emocoes de forma mais intensa.'},
    'A\u00e7\u00f5es Variadas':{dom:'O',baixo:'Tem maior apego a rotina e por situacoes familiares. Pode apresentar resistencia as mudancas.',alto:'E menos interessado(a) em manter uma rotina e tende a se engajar em novas atividades.'},
    'Ideias':{dom:'O',baixo:'Apresenta uma gama mais limitada de interesses intelectuais e menor grau de curiosidade para ideias abstratas.',alto:'Tem maior interesse para ideias abstratas e apresenta mais curiosidade intelectual.'},
    'Valores':{dom:'O',baixo:'Tende a ser mais tradicionalista e conservador(a). Pode ser mais resistente a mudancas quanto aos proprios valores sociais, religiosos ou morais.',alto:'Apresenta maior abertura a reavaliar a propria postura e valores sociais, religiosos ou morais.'},
    'Confian\u00e7a':{dom:'A',baixo:'Tem maior tendencia ao ceticismo e a desconfiar das intencoes alheias.',alto:'E mais propenso(a) a acreditar que as pessoas sao bem intencionadas e tende a confiar nelas.'},
    'Franqueza':{dom:'A',baixo:'Prefere adular, apresenta maior resistencia em expressar suas reais opinioes e tende a ser mais comedido(a) em expor seu ponto de vista.',alto:'Tende a expressar mais abertamente seu ponto de vista e a expor com maior franqueza sua opiniao.'},
    'Altru\u00edsmo':{dom:'A',baixo:'Apresenta maior resistencia em se envolver nos problemas alheios e tende a ser mais autocentrado(a).',alto:'Apresenta maior disposicao para ajudar aos outros e maior predominio de uma postura atenciosa e cordial com as pessoas.'},
    'Complac\u00eancia':{dom:'A',baixo:'Tem maior disposicao a ficar ressentido(a) e pode utilizar o sarcasmo e a ironia ao se expressar.',alto:'Tende a ser compreensivo(a) com as pessoas e a inibir e a se esquecer da ofensa.'},
    'Mod\u00e9stia':{dom:'A',baixo:'Tem uma postura mais vaidosa, podendo transmitir uma imagem arrogante e presuncosa aos outros.',alto:'E inclinado(a) a ter uma postura mais humilde e comedida e busca menos o reconhecimento das pessoas ao redor.'},
    'Sensibilidade':{dom:'A',baixo:'Apresenta menor disposicao a considerar as necessidades alheias e a ser movido(a) pela compaixao.',alto:'Tem maior disposicao a considerar as necessidades alheias e a ser movido(a) pela compaixao.'},
    'Compet\u00eancia':{dom:'C',baixo:'Tende a se sentir despreparado(a) para a realizacao das tarefas e inseguro(a) quanto a sua eficiencia.',alto:'Apresenta maior prudencia na busca de informacao e se sente mais confiante em sua eficiencia para tomar decisoes.'},
    'Ordem':{dom:'C',baixo:'Apresenta menor exigencia quanto a organizacao e tende a ser menos metodico(a) na realizacao das atividades.',alto:'Tende a ser mais organizado(a) e metodico(a) na realizacao das tarefas. Planeja antecipadamente e com detalhes suas atividades.'},
    'Senso de Dever':{dom:'C',baixo:'Demonstra menor apego as suas obrigacoes e responsabilidades. Pode ser displicente quanto as questoes morais e eticas.',alto:'Tende a ser confiavel no cumprimento de seus compromissos e responsabilidades.'},
    'Esfor\u00e7o por Realiza\u00e7\u00f5es':{dom:'C',baixo:'Tem menor determinacao no alcance das metas e com as questoes profissionais.',alto:'E mais determinado(a) no trabalho e tende a ser mais motivado(a) para atingir as metas.'},
    'Autodisciplina':{dom:'C',baixo:'Apresenta menor disciplina, pode procrastinar o inicio de uma atividade e se sentir mais facilmente desencorajado(a) a finalizar projetos.',alto:'Tem maior grau de disciplina para realizar os projetos que inicia ate sua finalizacao.'},
    'Pondera\u00e7\u00e3o':{dom:'C',baixo:'Investe menor tempo na analise dos fatos e pode tomar decisoes mais precipitadas. Tende a ser espontaneo(a) e capaz de arriscar.',alto:'Despende tempo para analisar todas as variaveis antes de tomar uma decisao sendo cauteloso(a) em suas acoes.'}
  };

  // === FUNCOES AUXILIARES ===
  function wrapText(txt, maxW) {
    var words = txt.split(' '); var lines = []; var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line + (line ? ' ' : '') + words[i];
      if (doc.getTextWidth(test) > maxW && line !== '') { lines.push(line); line = words[i]; }
      else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }

  function desenharBarra(x, y, w, h, escoreT, cor) {
    var minT = 20; var maxT = 80; var range = maxT - minT;
    var pos = Math.max(0, Math.min(1, (escoreT - minT) / range));
    var barW = pos * w;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 240, 240);
    doc.rect(x, y, w, h, 'FD');
    doc.setFillColor(cor[0], cor[1], cor[2]);
    doc.rect(x, y, barW, h, 'F');
    doc.setFontSize(5.5); doc.setTextColor(100, 100, 100); doc.setFont(undefined, 'normal');
    var marcas = [{v:20,l:'20'},{v:35,l:'Baixa'},{v:45,l:'45'},{v:55,l:'Media'},{v:65,l:'65'},{v:80,l:'Alta'}];
    for (var i = 0; i < marcas.length; i++) {
      var mx = x + ((marcas[i].v - minT) / range) * w;
      doc.line(mx, y + h, mx, y + h + 1.5);
      doc.text(marcas[i].l, mx, y + h + 4.5, {align: 'center'});
    }
    doc.setFontSize(7); doc.setTextColor(0, 0, 0); doc.setFont(undefined, 'bold');
    doc.text('T=' + escoreT, x + barW, y - 1.5, {align: 'center'});
  }

  function rodape() {
    pag++;
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3); doc.line(15, 284, 195, 284);
    doc.setTextColor(150, 150, 150); doc.setFontSize(7); doc.setFont(undefined, 'normal');
    doc.text('NEO PI-R - Costa & McCrae | Normas Vetor (2023) | Gerado em: ' + new Date().toLocaleString('pt-BR'), 15, 289);
    doc.text('Pag. ' + pag, 195, 289, {align: 'right'});
  }

  function cabecalho() {
    doc.setFillColor(74, 20, 140); doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text('NEO PI-R - Inventario de Personalidade NEO Revisado', 105, 9, {align: 'center'});
    doc.setFontSize(7.5); doc.setFont(undefined, 'normal');
    doc.text('Nome: ' + paciente + '   |   Sexo: ' + sexo + '   |   Idade: ' + idade + '   |   Data: ' + dataAval, 105, 16, {align: 'center'});
    doc.text('ID: ' + idPaciente + '   |   Norma: ' + norma, 105, 20, {align: 'center'});
  }

  // Mapear nomes dos dominios para chaves
  var dominiosOrdem = ['N','E','O','A','C'];
  var domNomes = {'N':'Neuroticismo','E':'Extrovers\u00e3o','O':'Abertura','A':'Amabilidade','C':'Conscienciosidade'};

  function getDom(chave) {
    var nome = domNomes[chave];
    return dom[nome] || dom[nome.replace('\u00e3','a')] || {};
  }

  // === PAGINA 1: DOMINIOS ===
  cabecalho();
  var y = 28;
  doc.setTextColor(74, 20, 140); doc.setFontSize(12); doc.setFont(undefined, 'bold');
  doc.text('Resultados por Dominio', 105, y, {align: 'center'}); y += 3;
  doc.setDrawColor(74, 20, 140); doc.line(15, y, 195, y); y += 8;

  var barX = 58; var barW = 90; var barH = 5;

  for (var di = 0; di < dominiosOrdem.length; di++) {
    var dk = dominiosOrdem[di];
    var info = DESC_D[dk];
    var cor = CORES[dk];
    var dadosDom = getDom(dk);
    var escT = dadosDom.escoreT != null ? dadosDom.escoreT : 50;

    doc.setTextColor(cor[0], cor[1], cor[2]); doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text(info.nome, 105, y, {align: 'center'}); y += 4;

    var txtY = y;
    doc.setFontSize(6.5); doc.setFont(undefined, 'normal'); doc.setTextColor(80, 80, 80);
    var lB = wrapText(info.baixo, 46);
    var lA = wrapText(info.alto, 46);
    var maxL = Math.max(lB.length, lA.length);
    for (var li = 0; li < lB.length; li++) { doc.text(lB[li], 10, txtY + li * 3.5, {maxWidth: 46}); }
    for (var li2 = 0; li2 < lA.length; li2++) { doc.text(lA[li2], 155, txtY + li2 * 3.5, {maxWidth: 46}); }
    var midY = txtY + (maxL * 3.5 / 2) - barH / 2;
    desenharBarra(barX, midY, barW, barH, escT, cor);
    y = txtY + (maxL * 3.5) + 8;
  }
  rodape();

  // === PAGINAS DE FACETAS (uma por dominio) ===
  var facetasOrdem = {
    'N':['Ansiedade','Raiva/Hostilidade','Depress\u00e3o','Embara\u00e7o/Constrangimento','Impulsividade','Vulnerabilidade'],
    'E':['Acolhimento Caloroso','Gregarismo','Assertividade','Atividade','Busca de Sensa\u00e7\u00f5es','Emo\u00e7\u00f5es Positivas'],
    'O':['Fantasia','Est\u00e9tica','Sentimentos','A\u00e7\u00f5es Variadas','Ideias','Valores'],
    'A':['Confian\u00e7a','Franqueza','Altru\u00edsmo','Complac\u00eancia','Mod\u00e9stia','Sensibilidade'],
    'C':['Compet\u00eancia','Ordem','Senso de Dever','Esfor\u00e7o por Realiza\u00e7\u00f5es','Autodisciplina','Pondera\u00e7\u00e3o']
  };

  for (var di2 = 0; di2 < dominiosOrdem.length; di2++) {
    doc.addPage(); cabecalho();
    var dk2 = dominiosOrdem[di2];
    var info2 = DESC_D[dk2];
    var cor2 = CORES[dk2];
    y = 26;
    doc.setTextColor(cor2[0], cor2[1], cor2[2]); doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(info2.nome, 105, y, {align: 'center'}); y += 3;
    doc.setDrawColor(cor2[0], cor2[1], cor2[2]); doc.line(15, y, 195, y); y += 8;

    var facs = facetasOrdem[dk2];
    for (var fi = 0; fi < facs.length; fi++) {
      var nomeFac = facs[fi];
      var descF = DESC_F[nomeFac];
      var dadosFac = facetas[nomeFac] || {};
      var escF = dadosFac.escoreT != null ? dadosFac.escoreT : 50;

      // Se nao achar pela chave exata, tenta sem acento
      if (!dadosFac.escoreT && dadosFac.escoreT !== 0) {
        var keys = Object.keys(facetas);
        for (var ki = 0; ki < keys.length; ki++) {
          if (keys[ki].toLowerCase().indexOf(nomeFac.toLowerCase().substring(0, 5)) === 0) {
            dadosFac = facetas[keys[ki]]; escF = dadosFac.escoreT || 50; break;
          }
        }
      }

      doc.setTextColor(cor2[0], cor2[1], cor2[2]); doc.setFontSize(8.5); doc.setFont(undefined, 'bold');
      doc.text(nomeFac.toUpperCase(), 105, y, {align: 'center'}); y += 4;

      var fTxtY = y;
      doc.setFontSize(6); doc.setFont(undefined, 'normal'); doc.setTextColor(80, 80, 80);
      var fLB = wrapText(descF ? descF.baixo : '', 44);
      var fLA = wrapText(descF ? descF.alto : '', 44);
      var fMaxL = Math.max(fLB.length, fLA.length);
      for (var fli = 0; fli < fLB.length; fli++) { doc.text(fLB[fli], 10, fTxtY + fli * 3.3, {maxWidth: 44}); }
      for (var fli2 = 0; fli2 < fLA.length; fli2++) { doc.text(fLA[fli2], 157, fTxtY + fli2 * 3.3, {maxWidth: 44}); }
      var fMidY = fTxtY + (fMaxL * 3.3 / 2) - barH / 2;
      desenharBarra(barX, fMidY, barW, barH, escF, cor2);
      y = fTxtY + (fMaxL * 3.3) + 8;

      if (y > 260 && fi < facs.length - 1) {
        rodape(); doc.addPage(); cabecalho(); y = 26;
        doc.setTextColor(cor2[0], cor2[1], cor2[2]); doc.setFontSize(12); doc.setFont(undefined, 'bold');
        doc.text(info2.nome + ' (cont.)', 105, y, {align: 'center'}); y += 3;
        doc.setDrawColor(cor2[0], cor2[1], cor2[2]); doc.line(15, y, 195, y); y += 8;
      }
    }
    rodape();
  }

  // === DISCLAIMER ===
  doc.setPage(doc.internal.getNumberOfPages());
  doc.setTextColor(120, 120, 120); doc.setFontSize(6.5);
  doc.text('O NEO PI-R e um instrumento psicologico de uso exclusivo do psicologo.', 15, 278);

  // === SALVAR ===
  var nomeArq = paciente.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  var agora = new Date();
  var dataStr = agora.getFullYear() + String(agora.getMonth() + 1).padStart(2, '0') + String(agora.getDate()).padStart(2, '0');
  doc.save('NEO-PI-R_' + nomeArq + '_' + dataStr + '.pdf');
}
