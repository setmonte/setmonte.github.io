// etdah-pais-visual.js - PDF do ETDAH-PAIS (gerado pelo painel via gerarPDFEscala)
// Le os dados salvos em window._escalaDados (dominios com pontuacao, max, percentil, classificacao).
(function () {
  var AC = '#0d47a1', AC2 = '#1976d2';
  var CLS = [
    {max: 20, t: 'Inferior', cor: '#4caf50', fundo: '#e8f5e9', banda: '#c8e6c9', txt: '#ffffff'},
    {max: 40, t: 'M\u00e9dia Inferior', cor: '#8bc34a', fundo: '#f1f8e9', banda: '#dcedc8', txt: '#ffffff'},
    {max: 60, t: 'M\u00e9dia', cor: '#ffc107', fundo: '#fff8e1', banda: '#fff9c4', txt: '#333333'},
    {max: 80, t: 'M\u00e9dia Superior', cor: '#ff9800', fundo: '#fff3e0', banda: '#ffe0b2', txt: '#ffffff'},
    {max: 101, t: 'Superior', cor: '#f44336', fundo: '#ffebee', banda: '#ffcdd2', txt: '#ffffff'}
  ];
  var INTERP = [
    {alto: 'Manejo deficiente da frustra\u00e7\u00e3o, dificuldade para autorregula\u00e7\u00e3o emocional e para modular o afeto. Tend\u00eancia a reagir com hipersensibilidade emocional, exibindo respostas emocionais fortes ou imaturas. Pode apresentar temperamento explosivo, hostilidade, irritabilidade, altera\u00e7\u00e3o brusca de humor, comportamento opositor, dificuldade nos relacionamentos interpessoais e falta de empatia.',
     baixo: 'Regula\u00e7\u00e3o emocional adequada, controle emocional para agir de forma ajustada diante de situa\u00e7\u00f5es estressantes, facilidade no manejo da frustra\u00e7\u00e3o e na modula\u00e7\u00e3o do afeto, estabilidade emocional e facilidade nos relacionamentos interpessoais.'},
    {alto: 'Comportamento com ritmo acelerado e apressado, excesso de movimenta\u00e7\u00e3o corporal, a\u00e7\u00e3o sem reflex\u00e3o anterior, preju\u00edzo no sistema inibit\u00f3rio, levando a comportamentos inconsequentes e imprudentes. Tend\u00eancia a persistir diante de uma ideia, com pouca capacidade de flexibiliza\u00e7\u00e3o mental.',
     baixo: 'N\u00edvel de atividade motora e de ritmo motor dentro do esperado para a faixa et\u00e1ria, presen\u00e7a de autocontrole, conten\u00e7\u00e3o de impulsos, tend\u00eancia a agir com prud\u00eancia e flexibilidade.'},
    {alto: 'Comportamento pouco prudente, tend\u00eancia a correr riscos, dificuldade na compreens\u00e3o de princ\u00edpios gerais e das situa\u00e7\u00f5es sociais, no julgamento e na maturidade social, e em se submeter a normas. Preju\u00edzo para automonitorar o comportamento, agindo de forma inadequada e impulsiva.',
     baixo: 'Comportamento adaptativo adequado, controle cognitivo, maturidade e julgamento social, efici\u00eancia para solucionar problemas e capacidade para seguir regras e normas. Demonstra habilidade de automonitoramento.'},
    {alto: 'Preju\u00edzos em fun\u00e7\u00f5es executivas como iniciativa, alerta, engajamento e persist\u00eancia em tarefas. Dificuldade em atividades que exijam aten\u00e7\u00e3o sustentada e em reter informa\u00e7\u00f5es importantes. Baixo desempenho na finaliza\u00e7\u00e3o de tarefas, com aparente falta de responsabilidade e procrastina\u00e7\u00e3o.',
     baixo: 'Boa capacidade atencional, persist\u00eancia do esfor\u00e7o, capacidade para engajar-se em tarefas mantendo a motiva\u00e7\u00e3o do in\u00edcio ao fim, com comprometimento e responsabilidade.'}
  ];
  var ITENS = [[{"t":"\u00c9 sens\u00edvel"},{"t":"\u00c9 agressivo"},{"t":"Muda facilmente de humor"},{"t":"Tem dificuldades para se adaptar \u00e0s mudan\u00e7as"},{"t":"Implica com tudo"},{"t":"Tem fortes rea\u00e7\u00f5es emocionais (explos\u00f5es de raiva)"},{"t":"Faz birra quando quer algo"},{"t":"Sente-se infeliz"},{"t":"D\u00e1 a impress\u00e3o de estar sempre insatisfeito (nada o agrada)"},{"t":"Implica com os irm\u00e3os"},{"t":"\u00c9 irritadi\u00e7o (tudo o incomoda)"},{"t":"\u00c9 rebelde (n\u00e3o aceita nada)"},{"t":"As atividades e reuni\u00f5es familiares s\u00e3o desagrad\u00e1veis"},{"t":"Todos t\u00eam que fazer o que ele quer"},{"t":"Mostra-se tenso e r\u00edgido"},{"t":"Explode com facilidade (\u00e9 do tipo pavio curto)"},{"t":"Exige mais tempo e aten\u00e7\u00e3o dos pais do que os outros filhos"},{"t":"A hora de acordar e das refei\u00e7\u00f5es \u00e9 desagrad\u00e1vel"},{"t":"Faz amizade, mas n\u00e3o consegue mant\u00ea-la"}],[{"t":"Movimenta-se muito (parece estar ligado com um motor ou a todo vapor)"},{"t":"\u00c9 inquieto e agitado"},{"t":"Tem sempre muita pressa"},{"t":"Mexe-se e contorce-se durante as refei\u00e7\u00f5es e para realizar as tarefas de casa"},{"t":"Age sem pensar (\u00e9 impulsivo)"},{"t":"Responde antes de ouvir a pergunta inteira"},{"t":"\u00c9 imprudente"},{"t":"\u00c9 persistente e insiste diante de uma ideia"},{"t":"\u00c9 inconsequente (n\u00e3o considera os perigos da situa\u00e7\u00e3o)"},{"t":"Intromete-se em assuntos que n\u00e3o lhe dizem respeito"},{"t":"Irrita os outros com suas palha\u00e7adas"},{"t":"Faz os deveres escolares r\u00e1pido demais"},{"t":"Tende a discordar com as regras e normas de jogos"}],[{"t":"A crian\u00e7a permite que o ambiente familiar seja tranquilo e harmonioso","i":1},{"t":"Obedece aos pais e \u00e0s normas da casa","i":1},{"t":"Consegue expressar claramente os seus pensamentos","i":1},{"t":"Sabe aguardar sua vez (\u00e9 paciente)","i":1},{"t":"Aceita facilmente regras, normas e limites","i":1},{"t":"Fala pouco","i":1},{"t":"\u00c9 atento quando conversa com algu\u00e9m","i":1},{"t":"Parece ser uma crian\u00e7a/adolescente tranquila e sossegada","i":1},{"t":"\u00c9 tolerante, quando preciso","i":1},{"t":"Faz as coisas com muito cuidado, prevendo todos os riscos de suas a\u00e7\u00f5es","i":1},{"t":"Faz suas tarefas e almo\u00e7a com bastante tranquilidade","i":1},{"t":"Seu comportamento \u00e9 adequado socialmente","i":1},{"t":"Respeita normas e regras","i":1},{"t":"\u00c9 obediente","i":1}],[{"t":"\u00c9 independente para realizar as suas tarefas de casa","i":1},{"t":"\u00c9 distra\u00eddo com quase tudo"},{"t":"Parece sonhar acordado (estar no mundo da lua)"},{"t":"Inicia uma atividade com entusiasmo e dificilmente chega ao final (\u00e9 do tipo fogo de palha)"},{"t":"Mostra-se concentrado apenas em atividades de seu interesse"},{"t":"Tem dificuldade para realizar as coisas importantes (li\u00e7\u00e3o, por exemplo)"},{"t":"D\u00e1 a impress\u00e3o de que n\u00e3o ouve bem (s\u00f3 escuta o que quer)"},{"t":"Evita atividades que exigem esfor\u00e7o mental constante (deveres escolares, jogos)"},{"t":"Esquece r\u00e1pido o que acabou de ser dito"},{"t":"Dificilmente observa detalhes"},{"t":"N\u00e3o termina o que come\u00e7a"},{"t":"Ocorrem discuss\u00f5es entre os pais e a crian\u00e7a, em fun\u00e7\u00e3o da falta de responsabilidade e da falta de senso de dever"}]];
  var OPC_ROT = ['Nunca', 'Muito pouco', 'Pouco', 'Geralmente', 'Frequentemente', 'Muito frequentemente'];
  var COR_FATOR = ['#c62828', '#e65100', '#2e7d32', '#1565c0'];
  var ROTULOS_CURTOS = ['Regula\u00e7\u00e3o Emocional', 'Hiperatividade/Impulsividade', 'Comportamento Adaptativo', 'Aten\u00e7\u00e3o', 'ESCORE GERAL'];

  function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
  function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
  function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
  function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
  function classe(p) {
    if (p == null || isNaN(p)) return CLS[2];
    for (var i = 0; i < CLS.length; i++) { if (p <= CLS[i].max) return CLS[i]; }
    return CLS[4];
  }
  function dataBR(s) {
    if (!s) return new Date().toLocaleDateString('pt-BR');
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : new Date(s).toLocaleDateString('pt-BR');
  }
  function curto(doc, txt, w) {
    var l = doc.splitTextToSize(String(txt || '-'), w);
    return l.length > 1 ? l[0].replace(/\s+$/, '') + '...' : l[0];
  }
  function pdfPainel(d, r) {
    var J = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
    if (!J || !d) return false;
    var doms = d.dominios || {};
    var nomes = Object.keys(doms);
    if (nomes.length < 4) return false;
    var doc = new J('p', 'mm', 'a4');
    var ML = 15, W = 180;

    // ---------- PAGINA 1 ----------
    F(doc, AC); doc.rect(0, 0, 210, 36, 'F');
    F(doc, AC2); doc.rect(0, 36, 210, 1.6, 'F');
    T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(22);
    doc.text('ETDAH-PAIS', 105, 15, {align: 'center'});
    doc.setFont(undefined, 'normal'); doc.setFontSize(9);
    doc.text('Escala de Avalia\u00e7\u00e3o de Comportamentos Infantojuvenis no TDAH em Ambiente Familiar', 105, 22, {align: 'center'});
    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text('Vers\u00e3o para Pais  |  Relat\u00f3rio de Avalia\u00e7\u00e3o', 105, 29, {align: 'center'});

    // Dados
    F(doc, '#f1f6fb'); doc.roundedRect(ML, 44, W, 38, 2, 2, 'F');
    F(doc, AC); doc.rect(ML, 44, 1.6, 38, 'F');
    function kv(x, y, rot, val, w) {
      T(doc, '#6b7b8c'); doc.setFont(undefined, 'bold'); doc.setFontSize(7);
      doc.text(rot.toUpperCase(), x, y);
      T(doc, '#1f2d3a'); doc.setFont(undefined, 'normal'); doc.setFontSize(9.5);
      doc.text(curto(doc, val, w), x, y + 4.6);
    }
    var resp = ((d.nomeRespondente ? d.nomeRespondente + ' ' : '') + (d.respondente ? '(' + d.respondente + ')' : '')).replace(/^\s+|\s+$/g, '');
    kv(22, 51, 'Paciente', d.paciente || '-', 80);
    kv(112, 51, 'Data da avalia\u00e7\u00e3o', dataBR(d.data || (r && r.date)), 78);
    kv(22, 63, 'Sexo e idade', (d.sexo || '-') + '  |  ' + (d.idade || '-'), 80);
    kv(112, 63, 'Respondente', resp || '-', 78);
    kv(22, 75, 'ID do paciente', d.idPaciente || '-', 80);
    kv(112, 75, 'Norma utilizada', d.normaUsada || '-', 78);

    // Escore geral
    var pg = d.percentil, cg = classe(pg);
    F(doc, cg.fundo); doc.roundedRect(ML, 90, W, 26, 2, 2, 'F');
    F(doc, cg.cor); doc.rect(ML, 90, 2.2, 26, 'F');
    T(doc, '#6b7b8c'); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
    doc.text('ESCORE GERAL', 24, 98);
    T(doc, '#1f2d3a'); doc.setFontSize(22);
    doc.text('Percentil ' + (pg != null ? pg : '-'), 24, 109);
    doc.setFontSize(9); doc.setFont(undefined, 'normal'); T(doc, '#4a5a6a');
    doc.text('Escore bruto: ' + (d.escore != null ? d.escore : '-') + ' de 348', 120, 100);
    F(doc, cg.cor); doc.roundedRect(120, 104, 44, 7, 3.5, 3.5, 'F');
    T(doc, cg.txt); doc.setFont(undefined, 'bold'); doc.setFontSize(9);
    doc.text(cg.t, 142, 108.9, {align: 'center'});

    // Tabela por fator
    function secao(y, t) {
      F(doc, AC); doc.rect(ML, y, 1.6, 6, 'F');
      T(doc, AC); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
      doc.text(t, ML + 4.5, y + 4.7);
    }
    secao(124, 'Resultados por fator');
    F(doc, '#e3f2fd'); doc.rect(ML, 134, W, 7.5, 'F');
    T(doc, '#33475b'); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
    doc.text('FATOR', ML + 3, 139);
    doc.text('ESCORE BRUTO', 112, 139, {align: 'center'});
    doc.text('PERCENTIL', 142, 139, {align: 'center'});
    doc.text('CLASSIFICA\u00c7\u00c3O', 176, 139, {align: 'center'});
    var i, y, k;
    for (i = 0; i < 4; i++) {
      var dm = doms[nomes[i]] || {}, c = classe(dm.percentil);
      y = 141.5 + i * 10;
      if (i % 2 === 1) { F(doc, '#f6f9fc'); doc.rect(ML, y, W, 10, 'F'); }
      T(doc, '#1f2d3a'); doc.setFont(undefined, 'normal'); doc.setFontSize(9.5);
      doc.text(nomes[i], ML + 3, y + 6.3);
      doc.text(dm.pontuacao + ' / ' + dm.max, 112, y + 6.3, {align: 'center'});
      doc.setFont(undefined, 'bold');
      doc.text(String(dm.percentil != null ? dm.percentil : '-'), 142, y + 6.3, {align: 'center'});
      F(doc, c.cor); doc.roundedRect(160, y + 2, 32, 6, 3, 3, 'F');
      T(doc, c.txt); doc.setFontSize(8);
      doc.text(c.t, 176, y + 6.2, {align: 'center'});
    }
    D(doc, '#cfd8e3'); doc.setLineWidth(0.3); doc.line(ML, 181.5, ML + W, 181.5);

    // Grafico de percentis
    secao(188, 'Perfil em percentis');
    var x0 = 72, wT = 110, yTop = 206, passo = 11, hB = 6.5;
    doc.setFont(undefined, 'bold'); doc.setFontSize(6.5);
    for (k = 0; k < 5; k++) {
      T(doc, '#6b7b8c');
      doc.text(CLS[k].t, x0 + wT * (k * 20 + 10) / 100, 203.5, {align: 'center'});
    }
    for (i = 0; i < 5; i++) {
      var dmi = i < 4 ? (doms[nomes[i]] || {}) : {percentil: d.percentil};
      var p = dmi.percentil, ci = classe(p);
      y = yTop + i * passo;
      if (i === 4) { D(doc, '#cfd8e3'); doc.setLineWidth(0.3); doc.line(ML, y - 2.2, ML + W, y - 2.2); }
      T(doc, '#1f2d3a'); doc.setFont(undefined, i === 4 ? 'bold' : 'normal'); doc.setFontSize(8.5);
      doc.text(ROTULOS_CURTOS[i], ML, y + 4.6);
      for (k = 0; k < 5; k++) { F(doc, CLS[k].banda); doc.rect(x0 + wT * k / 5, y, wT / 5, hB, 'F'); }
      if (p != null) {
        var px = x0 + wT * Math.max(0, Math.min(100, p)) / 100;
        F(doc, ci.cor); doc.rect(x0, y + hB / 2 - 0.7, px - x0, 1.4, 'F');
        F(doc, '#ffffff'); doc.circle(px, y + hB / 2, 3, 'F');
        F(doc, ci.cor); doc.circle(px, y + hB / 2, 2.3, 'F');
        T(doc, '#1f2d3a'); doc.setFont(undefined, 'bold'); doc.setFontSize(9);
        doc.text(String(p), x0 + wT + 4, y + 4.8);
      }
    }
    y = yTop + 5 * passo - 3;
    D(doc, '#9aa7b5'); doc.setLineWidth(0.25); doc.line(x0, y, x0 + wT, y);
    T(doc, '#6b7b8c'); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
    for (k = 0; k <= 5; k++) {
      doc.line(x0 + wT * k / 5, y, x0 + wT * k / 5, y + 1.2);
      doc.text(String(k * 20), x0 + wT * k / 5, y + 4.2, {align: 'center'});
    }
    T(doc, '#6b7b8c'); doc.setFontSize(7.5); doc.setFont(undefined, 'italic');
    var nota = doc.splitTextToSize('O percentil indica a posi\u00e7\u00e3o do escore em rela\u00e7\u00e3o ao grupo normativo de mesmo sexo e faixa et\u00e1ria. Percentis mais altos indicam maior intensidade de indicadores de dificuldade no fator.', W);
    doc.text(nota, ML, y + 10);
    // ---------- PAGINA 2+ : interpretacao ----------
    function novaPagina(tit) {
      doc.addPage();
      F(doc, AC); doc.rect(0, 0, 210, 16, 'F');
      T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
      doc.text('ETDAH-PAIS - ' + (tit || 'Interpreta\u00e7\u00e3o dos resultados'), ML, 10.5);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8.5);
      doc.text(curto(doc, d.paciente || '', 70), 195, 10.5, {align: 'right'});
      return 26;
    }
    y = novaPagina();
    for (i = 0; i < 4; i++) {
      var dd = doms[nomes[i]] || {}, cc = classe(dd.percentil);
      var texto = (dd.percentil > 60) ? INTERP[i].alto : INTERP[i].baixo;
      var linhas = doc.splitTextToSize(texto, W - 10);
      var h = 12 + linhas.length * 4.1 + 3;
      if (y + h > 272) { y = novaPagina(); }
      F(doc, cc.fundo); doc.roundedRect(ML, y, W, h, 2, 2, 'F');
      F(doc, cc.cor); doc.rect(ML, y, 2.2, h, 'F');
      T(doc, '#1f2d3a'); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
      doc.text(nomes[i], ML + 6, y + 6.3);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8.5); T(doc, '#4a5a6a');
      doc.text('Percentil ' + (dd.percentil != null ? dd.percentil : '-') + '  -  ' + cc.t + '  -  Bruto ' + dd.pontuacao + '/' + dd.max, ML + 6, y + 11);
      T(doc, '#33475b'); doc.setFontSize(8.5);
      for (k = 0; k < linhas.length; k++) { doc.text(linhas[k], ML + 6, y + 16.5 + k * 4.1); }
      y += h + 4;
    }

    // ---------- RESPOSTAS DO RESPONDENTE ----------
    var rsp = d.respostas;
    if (rsp && ITENS.length === 4) {
      var TIT = 'Respostas do respondente';
      var colHead = function (yy) {
        F(doc, '#e3f2fd'); doc.rect(ML, yy, W, 6.5, 'F');
        T(doc, '#33475b'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.5);
        doc.text('N\u00ba', ML + 3, yy + 4.4);
        doc.text('ITEM', ML + 13, yy + 4.4);
        doc.text('RESPOSTA MARCADA', 128, yy + 4.4);
        doc.text('PONTOS', ML + W - 3, yy + 4.4, {align: 'right'});
        return yy + 6.5;
      };
      y = novaPagina(TIT);
      T(doc, '#6b7b8c'); doc.setFont(undefined, 'italic'); doc.setFontSize(7.5);
      doc.text('Valores marcados pelo respondente (1 a 6). Nos itens invertidos (inv), a pontua\u00e7\u00e3o \u00e9 7 menos a resposta marcada.', ML, y - 2);
      y = colHead(y + 2);
      var nIt = 0;
      for (var fx = 0; fx < 4; fx++) {
        if (y + 14 > 278) { y = novaPagina(TIT); y = colHead(y); }
        var dmf = doms[nomes[fx]] || {};
        F(doc, COR_FATOR[fx]); doc.rect(ML, y, W, 6.5, 'F');
        T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.5);
        doc.text(nomes[fx], ML + 3, y + 4.5);
        doc.text('Soma do fator: ' + (dmf.pontuacao != null ? dmf.pontuacao : '-'), ML + W - 3, y + 4.5, {align: 'right'});
        y += 6.5;
        for (var ix = 0; ix < ITENS[fx].length; ix++) {
          nIt++;
          var it = ITENS[fx][ix];
          var vv = parseInt(rsp[nIt], 10);
          var okv = vv >= 1 && vv <= 6;
          var ls = doc.splitTextToSize(it.t, 100);
          var hr = Math.max(6.2, ls.length * 3.8 + 2.6);
          if (y + hr > 280) { y = novaPagina(TIT); y = colHead(y); }
          if (ix % 2 === 1) { F(doc, '#f6f9fc'); doc.rect(ML, y, W, hr, 'F'); }
          T(doc, '#6b7b8c'); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
          doc.text(String(nIt), ML + 3, y + 4.2);
          T(doc, '#1f2d3a'); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
          for (var lk = 0; lk < ls.length; lk++) { doc.text(ls[lk], ML + 13, y + 4.2 + lk * 3.8); }
          doc.setFont(undefined, 'bold');
          doc.text(okv ? (vv + ' - ' + OPC_ROT[vv - 1]) : '-', 128, y + 4.2);
          doc.setFont(undefined, 'normal');
          var pts = okv ? (it.i ? 7 - vv : vv) : '-';
          doc.text(pts + (it.i ? ' (inv)' : ''), ML + W - 3, y + 4.2, {align: 'right'});
          y += hr;
        }
        y += 3;
      }
      y += 2;
    }
    if (d.aviso) {
      var la = doc.splitTextToSize('Observa\u00e7\u00e3o: ' + d.aviso, W - 8);
      if (y + la.length * 4 + 6 > 272) { y = novaPagina(); }
      T(doc, '#e65100'); doc.setFont(undefined, 'bold'); doc.setFontSize(8.5);
      doc.text(la, ML + 2, y + 4); y += la.length * 4 + 6;
    }
    var disc = doc.splitTextToSize('IMPORTANTE: este relat\u00f3rio \u00e9 um instrumento de apoio \u00e0 avalia\u00e7\u00e3o e n\u00e3o constitui diagn\u00f3stico. A interpreta\u00e7\u00e3o deve ser feita por profissional habilitado, integrando entrevistas, observa\u00e7\u00e3o cl\u00ednica, hist\u00f3rico e outras fontes de informa\u00e7\u00e3o.', W - 8);
    var ref = doc.splitTextToSize('Refer\u00eancia: BENCZIK, E. B. P. ETDAH-PAIS: Escala de Avalia\u00e7\u00e3o de Comportamentos Infantojuvenis no Transtorno de D\u00e9ficit de Aten\u00e7\u00e3o/Hiperatividade em Ambiente Familiar - Vers\u00e3o para Pais. S\u00e3o Paulo: Memnon, 2018.', W - 8);
    var hb = disc.length * 4 + ref.length * 3.8 + 12;
    if (y + hb > 276) { y = novaPagina(); }
    F(doc, '#fff3e0'); doc.roundedRect(ML, y, W, hb, 2, 2, 'F');
    F(doc, '#ff9800'); doc.rect(ML, y, 2.2, hb, 'F');
    T(doc, '#e65100'); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    doc.text(disc, ML + 6, y + 6);
    T(doc, '#6b7b8c'); doc.setFontSize(7.5);
    doc.text(ref, ML + 6, y + 6 + disc.length * 4 + 3);

    // ---------- Rodape ----------
    var total = doc.internal.getNumberOfPages();
    for (var pgn = 1; pgn <= total; pgn++) {
      doc.setPage(pgn);
      F(doc, '#333333'); doc.rect(0, 287, 210, 10, 'F');
      T(doc, '#cccccc'); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
      doc.text('SYM Online | ETDAH-PAIS | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | P\u00e1g. ' + pgn + '/' + total, 105, 293, {align: 'center'});
    }
    var ts = new Date();
    var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0');
    var nomeArq = String(d.paciente || 'Paciente').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    doc.save('ETDAH-PAIS_' + nomeArq + '_' + tsStr + '.pdf');
    return true;
  }

  window.SYM_ETDAHP = {pdfPainel: pdfPainel};
})();