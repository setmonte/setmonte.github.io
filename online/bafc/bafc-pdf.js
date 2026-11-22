/* ============================================================
   BAFC - GERADOR DO PDF DE RESULTADOS (jsPDF)
   Fonte COM acentos. O build (montar_pdf.py) gera ../pdf/bafc-pdf.js em ASCII puro (acentos como \uXXXX),
   que e o arquivo que o painel (online/index.html) vai carregar.
   Uso:  var doc = BAFC_PDF.gerar(jspdf.jsPDF, registro);  doc.save(nome);
   "registro" = o que a bateria salva: { data: { formData, idPaciente, A, B, C, D, indices, ... } }
   Padrao visual: o mesmo dos relatorios SYM mais novos (BSL-23): faixa no topo, cartoes, regua com marcador, rodape SYM.
   Cores de classificacao: as 7 cores definidas pelo usuario nos laudos do WISC-IV e do WAIS-III.
   ============================================================ */
(function (root) {
    'use strict';
    var ML = 12, CW = 186, XR = 198, YMAX = 279;

    var COR = { prim: '#7b2cbf', prim2: '#c77dff', claro: '#f3e8ff', texto: '#263238', suave: '#607d8b', cinza: '#eceff1', borda: '#cfd8dc',
        laranja: '#e65100', laranjaFundo: '#fff3e0', laranjaBorda: '#ff9800', certo: '#43a047', erro: '#e53935', credito: '#c8e6c9' };
    /* classes na ordem 0..6 (mesmas do controlador): nome, cor de fundo, cor da letra, % de pessoas na faixa */
    var NIVEIS = [
        ['Deficit\u00e1rio', '#d32f2f', '#ffffff', '2%'], ['Lim\u00edtrofe', '#e8710a', '#ffffff', '7%'], ['M\u00e9dia Inferior', '#ffe94d', '#1a1a1a', '16%'],
        ['M\u00e9dia', '#b7e1a1', '#1a1a1a', '50%'], ['M\u00e9dia Superior', '#2e7d32', '#ffffff', '16%'], ['Superior', '#8ec1ee', '#1a1a1a', '7%'], ['Muito Superior', '#1f4e9c', '#ffffff', '2%']
    ];
    var ZC = [-2.054, -1.341, -0.674, 0.674, 1.341, 2.054];            /* percentis 2, 9, 25, 75, 91, 98 */
    var QC = ZC.map(function (z) { return 100 + 15 * z; });             /* mesmos cortes em escala de QI */
    var DOM = {
        MO: { nome: 'Mem\u00f3ria Operacional', curto: 'Mem\u00f3ria', cor: '#00897b' },
        VP: { nome: 'Velocidade de Processamento', curto: 'Velocidade', cor: '#ef6c00' },
        IV: { nome: 'Intelig\u00eancia Verbal', curto: 'Verbal', cor: '#1565c0' },
        NV: { nome: 'Intelig\u00eancia N\u00e3o-Verbal', curto: 'N\u00e3o-Verbal', cor: '#ad1457' }
    };
    var ORDEM = ['MO', 'VP', 'IV', 'NV'];
    var CHAVE_RES = { MO: 'A', VP: 'B', IV: 'C', NV: 'D' };

    var MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    function hoje() { var d = new Date(); return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear(); }

    /* Referencias (ABNT, brasileiras). Conferidas em fonte (ver LEIA-ME). Ordem alfabetica. */
    function referencias() {
        return [
            'BOCCALANDRO, Efraim Rojas. V-47: teste verbal de intelig\u00eancia. 2. ed. rev. e ampl. pelo Departamento de Pesquisas da Vetor Editora. S\u00e3o Paulo: Vetor, 2003.',
            'CORSO, Luciana Vellinho; ASSIS, \u00c9velin Fulginiti de. Interface entre a velocidade de processamento cognitivo e o desempenho aritm\u00e9tico e leitor de alunos do 5\u00ba e 7\u00ba anos do ensino fundamental. Bolema: Boletim de Educa\u00e7\u00e3o Matem\u00e1tica, v. 34, n. 66, p. 225-245, 2020. DOI: 10.1590/1980-4415v34n66a11.',
            'MONTE, Sergio Teixeira. BAFC: Bateria de Avalia\u00e7\u00e3o do Funcionamento Cognitivo. SYM Online - Centro de Testagem em Neuropsicologia Online, 2026. Dispon\u00edvel em: https://setmonte.github.io/online/teste-bafc.html. Acesso em: ' + hoje() + '.',
            'MOTA, M\u00e1rcia da. Uma introdu\u00e7\u00e3o ao estudo cognitivo da mem\u00f3ria a curto prazo: da teoria dos m\u00faltiplos armazenadores \u00e0 mem\u00f3ria de trabalho. Estudos de Psicologia (Campinas), v. 17, n. 3, p. 15-21, 2000. DOI: 10.1590/s0103-166x2000000300002.',
            'PRIMI, Ricardo. Intelig\u00eancia: avan\u00e7os nos modelos te\u00f3ricos e nos instrumentos de medida. Avalia\u00e7\u00e3o Psicol\u00f3gica, v. 2, n. 1, p. 67-77, 2003.',
            'PRIMI, Ricardo; ALMEIDA, Leandro S. Estudo de valida\u00e7\u00e3o da Bateria de Provas de Racioc\u00ednio (BPR-5). Psicologia: Teoria e Pesquisa, v. 16, n. 2, p. 165-173, 2000. DOI: 10.1590/s0102-37722000000200009.',
            'RUEDA, Fabi\u00e1n Javier Mar\u00edn; NORONHA, Ana Paula Porto; SISTO, Fermino Fernandes; SANTOS, Ac\u00e1cia Aparecida Angeli dos; CASTRO, Nelimar Ribeiro. WISC-IV: manual t\u00e9cnico. S\u00e3o Paulo: Casa do Psic\u00f3logo, 2013.',
            'SANTOS, Marco Antonio dos; PRIMI, Ricardo. Desenvolvimento de um teste informatizado para avalia\u00e7\u00e3o do racioc\u00ednio, da mem\u00f3ria e da velocidade do processamento. Estudos de Psicologia (Campinas), v. 22, n. 3, p. 241-254, 2005. DOI: 10.1590/s0103-166x2005000300003.',
            'SCHELINI, Patr\u00edcia Waltz. Teoria das intelig\u00eancias fluida e cristalizada: in\u00edcio e evolu\u00e7\u00e3o. Estudos de Psicologia (Natal), v. 11, n. 3, p. 323-332, 2006. DOI: 10.1590/s1413-294x2006000300010.',
            'WECHSLER, David. Escala de Intelig\u00eancia Wechsler para Adultos: terceira edi\u00e7\u00e3o: revis\u00e3o das normas brasileiras (WAIS-III \u2013 2020). S\u00e3o Paulo: Casapsi Livraria e Editora, 2020.'
        ];
    }

    /* ---------- utilitarios de desenho ---------- */
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u2264/g, '<=').replace(/\u00a0/g, ' ').replace(/\u03a8/g, 'Psi')
            .replace(/[^\u0000-\u00ff]/g, '?');
    }
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function fonte(doc, tam, negrito) { doc.setFont('helvetica', negrito ? 'bold' : 'normal'); doc.setFontSize(tam); }
    function tx(doc, s, x, y, o) { doc.text(pt(s), x, y, o); }
    function dataBR(s) { if (!s) { return new Date().toLocaleDateString('pt-BR'); } var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function poly(doc, pts, estilo) {
        var rel = [], i; for (i = 1; i < pts.length; i++) { rel.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]); }
        doc.lines(rel, pts[0][0], pts[0][1], [1, 1], estilo || 'F', true);
    }
    function chip(doc, x, y, s, fill, ink, tam, alinhaDireita) {
        fonte(doc, tam || 7.5, true);
        var w = doc.getTextWidth(pt(s)) + 6, h = (tam || 7.5) * 0.3528 * 1.15 + 2.2;
        if (alinhaDireita) { x = x - w; }
        F(doc, fill); doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
        T(doc, ink); doc.text(pt(s), x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' });
        return w;
    }
    function chipClasse(doc, x, y, classe, tam, alinhaDireita) { var n = NIVEIS[classe]; return chip(doc, x, y, n[0], n[1], n[2], tam, alinhaDireita); }
    function secao(c, titulo, cor) {
        need(c, 14); var doc = c.doc;
        F(doc, cor || COR.prim); doc.rect(ML, c.y, 1.6, 6, 'F');
        fonte(doc, 10.5, true); T(doc, cor || COR.prim); tx(doc, titulo.toUpperCase(), ML + 4, c.y + 4.6);
        c.y += 9.5;
    }
    function need(c, h) { if (c.y + h > YMAX) { novaPagina(c); } }
    function novaPagina(c) { c.doc.addPage(); faixaFina(c.doc, c.titulo2 || 'Resultados'); c.y = 19; }
    function faixaFina(doc, titulo) {
        F(doc, COR.prim); doc.rect(0, 0, 210, 12, 'F'); F(doc, COR.prim2); doc.rect(0, 12, 210, 1, 'F');
        fonte(doc, 10.5, true); T(doc, '#ffffff'); tx(doc, 'BAFC - ' + titulo, ML, 8);
    }
    function paragrafo(c, s, x, w, tam, cor, passo, negrito) {
        var doc = c.doc; fonte(doc, tam, negrito); T(doc, cor);
        var linhas = doc.splitTextToSize(pt(s), w), i;
        for (i = 0; i < linhas.length; i++) { doc.text(linhas[i], x, c.y + i * passo); }
        c.y += linhas.length * passo; return linhas.length;
    }
    function caixa(doc, x, y, w, h, fill, borda) { F(doc, fill); if (borda) { D(doc, borda); doc.setLineWidth(0.25); doc.roundedRect(x, y, w, h, 2, 2, 'FD'); } else { doc.roundedRect(x, y, w, h, 2, 2, 'F'); } }
    function estrela(doc, cx, cy, R, r, fill) {
        var pts = [], q, a, rr; for (q = 0; q < 10; q++) { a = (-90 + q * 36) * Math.PI / 180; rr = (q % 2 === 0) ? R : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
        F(doc, fill); poly(doc, pts, 'F');
    }
    function marcaOk(doc, x, y, cor) { D(doc, cor); doc.setLineWidth(0.5); doc.line(x - 1.1, y, x - 0.3, y + 0.9); doc.line(x - 0.3, y + 0.9, x + 1.3, y - 1.1); }

    /* ---------- dados e textos ---------- */
    function frasePercentil(p) {
        var n = Math.round(p); if (n < 1) { n = 1; } if (n > 99) { n = 99; }
        return 'Superou o desempenho de cerca de ' + n + ' em cada 100 pessoas da mesma idade (percentil ' + n + ').';
    }
    function nivelDoItem(id) { return id <= 8 ? 1 : (id <= 16 ? 2 : (id <= 24 ? 3 : 4)); }
    function tipoDoItem(id) { return id <= 2 ? 0 : (id <= 8 ? 1 : (id <= 16 ? 2 : (id <= 20 ? 3 : 4))); }
    var TIPOS_NV = ['S\u00f3 cores', 'Com figuras', 'S\u00edmbolos que giram', 'Pir\u00e2mide', 'Prisma'];
    var TOTAL_TIPO_NV = [2, 6, 8, 4, 4];
    function oQueMostra(classe) {
        if (classe <= 1) { return 'Desempenho bem abaixo do esperado para a idade nesta \u00e1rea. Vale investigar com outros instrumentos e com a hist\u00f3ria da pessoa.'; }
        if (classe === 2) { return 'Desempenho um pouco abaixo da m\u00e9dia para a idade. Em tarefas parecidas, pode ajudar ter mais tempo, repetir ou dividir em etapas.'; }
        if (classe === 3) { return 'Desempenho dentro do esperado para a idade.'; }
        if (classe === 4) { return 'Desempenho acima da m\u00e9dia para a idade: uma \u00e1rea de facilidade.'; }
        return 'Desempenho bem acima da m\u00e9dia para a idade: uma \u00e1rea de destaque.';
    }
    var O_QUE_MEDE = {
        MO: 'Guardar n\u00fameros na cabe\u00e7a por alguns segundos e us\u00e1-los: repetir na mesma ordem (ida) e de tr\u00e1s para frente (volta). A volta \u00e9 mais dif\u00edcil porque, al\u00e9m de guardar, \u00e9 preciso reorganizar.',
        VP: 'Qu\u00e3o r\u00e1pido, e com quanto cuidado, a pessoa acha o que \u00e9 pedido numa grade de figuras e n\u00fameros, quando cada toque conta. N\u00e3o vale s\u00f3 ser r\u00e1pido: errar o alvo pesa no resultado.',
        IV: 'Conhecimento e racioc\u00ednio com palavras: sin\u00f4nimos, opostos, analogias, intrusos e frases. Depende do vocabul\u00e1rio e da escolaridade, e as perguntas s\u00e3o lidas em voz alta nos primeiros itens.',
        NV: 'Racioc\u00ednio com formas, sem palavras: imaginar um molde sendo dobrado e reconhecer o s\u00f3lido que se forma. Os problemas come\u00e7am s\u00f3 com cores e terminam com pir\u00e2mides e prismas.'
    };
    function seg(ms) { return Math.round(ms / 100) / 10; }
    function vn(v) { return String(v).replace('.', ','); }
    function resultadoTexto(k, d) {
        var r = d[CHAVE_RES[k]]; if (!r) { return 'Esta \u00e1rea n\u00e3o foi aplicada.'; }
        if (k === 'MO') {
            return 'Repetiu corretamente ' + r.total + ' das ' + r.totalMaximo + ' ' + (r.totalMaximo === 1 ? 'sequ\u00eancia' : 'sequ\u00eancias') + '. Na ordem direta chegou a ' + pl(r.direta.spanMaximo, 'n\u00famero', 'n\u00fameros') + ' e, de tr\u00e1s para frente, a ' + pl(r.inversa.spanMaximo, 'n\u00famero', 'n\u00fameros') + '.';
        }
        if (k === 'VP') {
            var t = r.totais, lenta = null, i; for (i = 0; i < r.etapas.length; i++) { if (!lenta || r.etapas[i].tempoMs > lenta.tempoMs) { lenta = r.etapas[i]; } }
            var NOME_ET = { par: 'dos n\u00fameros pares', impar: 'dos n\u00fameros \u00edmpares', figura: 'da estrela', cor: 'da cor vermelha' };
            return 'Completou as 4 etapas em ' + vn(t.tempoSeg) + ' segundos. Foram ' + t.comissoes + ' toques em figuras erradas e ' + t.omissoes + ' alvos n\u00e3o tocados. A etapa mais demorada foi a ' + NOME_ET[lenta.etapa] + ' (' + vn(seg(lenta.tempoMs)) + ' s).';
        }
        if (k === 'IV') {
            var cred = (r.creditados || []).length;
            return 'Acertou ' + r.acertos + ' das ' + r.totalItens + ' perguntas' + (cred ? ' (' + cred + ' contadas pelo ponto de partida da idade e ' + r.acertosApresentados + ' de ' + r.itensApresentados + ' apresentadas)' : '') + (r.parouPorErros ? '. O teste foi interrompido por erros seguidos.' : '.');
        }
        return 'Acertou ' + r.acertos + ' dos ' + r.totalItens + ' problemas' + (r.parouPorErros ? '. O teste foi interrompido ap\u00f3s 3 erros seguidos, o que \u00e9 esperado quando os problemas passam do limite da pessoa.' : '.');
    }

    /* ---------- grafico: curva normal com as 7 faixas ---------- */
    function curva(doc, x0, y0, w, h, zMarca, rotulo) {
        var zmin = -3.2, zmax = 3.2, n = 128, passo = w / n, i, k, zc, alt, band, x;
        for (i = 0; i < n; i++) {
            zc = zmin + (i + 0.5) * (zmax - zmin) / n; band = 0; for (k = 0; k < ZC.length; k++) { if (zc >= ZC[k]) { band++; } }
            alt = h * Math.exp(-zc * zc / 2); F(doc, NIVEIS[band][1]); doc.rect(x0 + i * passo, y0 + h - alt, passo + 0.15, alt, 'F');
        }
        D(doc, '#37474f'); doc.setLineWidth(0.4);
        for (i = 0; i < n; i++) {
            var za = zmin + i * (zmax - zmin) / n, zb = zmin + (i + 1) * (zmax - zmin) / n;
            doc.line(x0 + i * passo, y0 + h - h * Math.exp(-za * za / 2), x0 + (i + 1) * passo, y0 + h - h * Math.exp(-zb * zb / 2));
        }
        D(doc, '#78909c'); doc.setLineWidth(0.3); doc.line(x0, y0 + h, x0 + w, y0 + h);
        /* cortes (QI) e nomes das faixas */
        fonte(doc, 5.8, false); T(doc, COR.suave);
        for (k = 0; k < ZC.length; k++) {
            x = x0 + (ZC[k] - zmin) / (zmax - zmin) * w; D(doc, '#78909c'); doc.line(x, y0 + h, x, y0 + h + 1.4);
            doc.text(String(Math.round(QC[k])), x, y0 + h + 4.2, { align: 'center' });
        }
        for (k = 0; k < 7; k++) {
            var ze = (k === 0) ? zmin : ZC[k - 1], zd = (k === 6) ? zmax : ZC[k];
            x = x0 + ((ze + zd) / 2 - zmin) / (zmax - zmin) * w;
            fonte(doc, 6.4, true); T(doc, '#37474f'); doc.text(pt(NIVEIS[k][0]), x, y0 + h + 8.6, { align: 'center' });
            fonte(doc, 5.8, false); T(doc, COR.suave); doc.text(pt(NIVEIS[k][3] + ' das pessoas'), x, y0 + h + 11.6, { align: 'center' });
        }
        /* marcador da pessoa */
        var zz = Math.max(zmin + 0.05, Math.min(zmax - 0.05, zMarca)); x = x0 + (zz - zmin) / (zmax - zmin) * w;
        D(doc, '#111111'); doc.setLineWidth(0.7); doc.line(x, y0 - 2, x, y0 + h);
        F(doc, '#111111'); doc.triangle(x - 2.2, y0 - 7, x + 2.2, y0 - 7, x, y0 - 2.2, 'F');
        fonte(doc, 8, true); var tw = doc.getTextWidth(pt(rotulo)) + 6; F(doc, '#111111');
        doc.roundedRect(x - tw / 2, y0 - 14, tw, 6.6, 3.3, 3.3, 'F'); T(doc, '#ffffff'); doc.text(pt(rotulo), x, y0 - 10.7, { align: 'center', baseline: 'middle' });
    }

    /* ---------- grafico: regua com as 7 faixas (escala de QI 40 a 160) ---------- */
    function regua(doc, x0, y0, w, alt, qi) {
        var lim = [40].concat(QC).concat([160]), k, xa, xb;
        for (k = 0; k < 7; k++) { xa = x0 + (lim[k] - 40) / 120 * w; xb = x0 + (lim[k + 1] - 40) / 120 * w; F(doc, NIVEIS[k][1]); doc.rect(xa, y0, xb - xa + 0.1, alt, 'F'); }
        D(doc, '#78909c'); doc.setLineWidth(0.25); doc.rect(x0, y0, w, alt, 'S');
        if (qi != null) {
            var q = Math.max(41, Math.min(159, qi)), x = x0 + (q - 40) / 120 * w;
            D(doc, '#111111'); doc.setLineWidth(0.7); doc.line(x, y0 - 1.5, x, y0 + alt + 1);
            F(doc, '#111111'); doc.triangle(x - 1.9, y0 - 4.6, x + 1.9, y0 - 4.6, x, y0 - 1.4, 'F');
        }
    }

    /* ============================================================
       PAGINA 1 - RESUMO
       ============================================================ */
    function pagina1(c, d, ix) {
        var doc = c.doc, fd = d.formData || {}, y;
        F(doc, COR.prim); doc.rect(0, 0, 210, 25, 'F'); F(doc, COR.prim2); doc.rect(0, 25, 210, 1.6, 'F');
        fonte(doc, 17, true); T(doc, '#ffffff'); tx(doc, 'BAFC - Relat\u00f3rio de Avalia\u00e7\u00e3o', ML, 12);
        fonte(doc, 9.5, false); tx(doc, 'Bateria de Avalia\u00e7\u00e3o do Funcionamento Cognitivo', ML, 19);
        y = 31;
        if (ix && ix.provisorios && ix.provisorios.length) {
            caixa(doc, ML, y, CW, 12.5, COR.laranjaFundo, null); F(doc, COR.laranjaBorda); doc.rect(ML, y, 1.6, 12.5, 'F');
            fonte(doc, 8, true); T(doc, COR.laranja); tx(doc, 'NORMAS PROVIS\u00d3RIAS - USO EXPERIMENTAL', ML + 5, y + 4.6);
            fonte(doc, 7.2, false); tx(doc, 'Os cortes de ' + ix.provisorios.map(function (k) { return DOM[k].curto; }).join(', ') + ' ainda est\u00e3o em calibra\u00e7\u00e3o. S\u00f3 a Mem\u00f3ria usa tabelas do WISC-IV e do WAIS-III.', ML + 5, y + 9);
            y += 15.5;
        }
        /* dados */
        caixa(doc, ML, y, CW, 25, '#f8f3fd', null); F(doc, COR.prim); doc.rect(ML, y, 1.6, 25, 'F');
        fonte(doc, 9, true); T(doc, COR.prim); tx(doc, 'DADOS DA PESSOA', ML + 5, y + 5.5);
        fonte(doc, 8.5, false); T(doc, COR.texto);
        var id = d.idPaciente || fd.idPaciente || '-';
        tx(doc, 'Nome: ' + (fd.patientName || '-'), ML + 5, y + 11.5); tx(doc, 'ID: ' + id, ML + 108, y + 11.5);
        tx(doc, 'Idade: ' + (fd.idade || (ix && ix.idadeAnos != null ? ix.idadeAnos + ' anos' : '-')), ML + 5, y + 16.5); tx(doc, 'Sexo: ' + (fd.sex || '-'), ML + 108, y + 16.5);
        tx(doc, 'Escolaridade: ' + (fd.education || '-'), ML + 5, y + 21.5); tx(doc, 'Data da aplica\u00e7\u00e3o: ' + dataBR(fd.dataAval || d.dataAplicacao), ML + 108, y + 21.5);
        y += 29;
        /* cartao do ICG */
        var g = ix && ix.global;
        caixa(doc, ML, y, CW, 33, '#faf6fe', '#e0c3fc');
        fonte(doc, 7.5, true); T(doc, COR.suave); tx(doc, '\u00cdNDICE COGNITIVO GLOBAL', ML + 6, y + 7);
        if (g) {
            fonte(doc, 30, true); T(doc, COR.texto); tx(doc, String(g.icg), ML + 6, y + 21);
            chipClasse(doc, ML + 6, y + 24.5, g.classe, 8);
            fonte(doc, 12, true); T(doc, COR.texto); tx(doc, (g.parcial ? 'Desempenho global parcial: ' : 'Desempenho global: ') + NIVEIS[g.classe][0], ML + 66, y + 11);
            fonte(doc, 9, false); T(doc, COR.texto);
            var l1 = doc.splitTextToSize(pt(frasePercentil(g.percentil)), 118); doc.text(l1, ML + 66, y + 17.5);
            fonte(doc, 7.3, false); T(doc, COR.suave);
            doc.text(doc.splitTextToSize(pt((g.parcial ? 'ICG PARCIAL: m\u00e9dia de ' + g.dominiosUsados.length + ' das 4 \u00e1reas, com pesos iguais. ' : 'M\u00e9dia das 4 \u00e1reas aplicadas. ') + 'Escala de QI: m\u00e9dia 100 e desvio-padr\u00e3o 15. \u00c9 um retrato do dia, n\u00e3o um r\u00f3tulo da pessoa.'), 118), ML + 66, y + 26);
        } else {
            fonte(doc, 11, true); T(doc, COR.suave); tx(doc, 'ICG n\u00e3o calculado', ML + 6, y + 18);
            fonte(doc, 8.5, false); doc.text(doc.splitTextToSize(pt('O \u00edndice global precisa de pelo menos 2 \u00e1reas aplicadas. Veja o perfil de cada \u00e1rea abaixo.'), 118), ML + 66, y + 14);
        }
        y += 37;
        /* curva */
        c.y = y; secao(c, 'Onde est\u00e1 o desempenho global'); y = c.y;
        if (g) { curva(doc, ML + 3, y + 13, CW - 6, 16, g.z, 'ICG ' + g.icg); }
        y += 13 + 16 + 14.5;
        /* perfil */
        c.y = y; secao(c, 'Perfil das 4 \u00e1reas'); y = c.y + 5;
        fonte(doc, 5.8, false); T(doc, COR.suave);
        var rx = ML + 52, rw = 100, k;
        [70, 85, 100, 115, 130].forEach(function (q) { var x = rx + (q - 40) / 120 * rw; doc.text(String(q), x, y - 3.4, { align: 'center' }); });
        tx(doc, 'QI:', rx - 6, y - 3.4);
        ORDEM.forEach(function (key) {
            var dm = ix && ix.dominios && ix.dominios[key], info = DOM[key];
            F(doc, info.cor); doc.circle(ML + 2.3, y + 5.2, 1.7, 'F');
            fonte(doc, 8.5, true); T(doc, COR.texto); tx(doc, info.nome, ML + 6, y + 4.4);
            fonte(doc, 6.6, false); T(doc, COR.suave);
            if (dm) {
                tx(doc, 'QI ' + dm.qi + '  |  percentil ' + Math.round(dm.percentil) + (dm.provisorio ? '  |  corte provis\u00f3rio' : ''), ML + 6, y + 8.6);
                regua(doc, rx, y + 3, rw, 5.2, dm.qi);
                chipClasse(doc, XR, y + 3.3, dm.classe, 6.6, true);
            } else {
                tx(doc, 'N\u00e3o aplicado', ML + 6, y + 8.6); regua(doc, rx, y + 3, rw, 5.2, null);
                F(doc, '#ffffff'); doc.rect(rx + 1, y + 3.6, rw - 2, 4, 'F'); fonte(doc, 6.6, false); T(doc, COR.suave); doc.text('n\u00e3o aplicado', rx + rw / 2, y + 6.4, { align: 'center' });
            }
            y += 12;
        });
        /* resumo */
        y += 2;
        var ds = ORDEM.filter(function (k2) { return ix && ix.dominios && ix.dominios[k2]; });
        var linhas = resumo(ix, ds);
        caixa(doc, ML, y, CW, 6 + linhas.length * 4.4, COR.cinza, null); F(doc, COR.prim2); doc.rect(ML, y, 1.6, 6 + linhas.length * 4.4, 'F');
        fonte(doc, 8, true); T(doc, COR.prim); tx(doc, 'EM RESUMO', ML + 5, y + 4.6);
        fonte(doc, 8.3, false); T(doc, COR.texto);
        for (k = 0; k < linhas.length; k++) { doc.text(pt(linhas[k]), ML + 5, y + 9.4 + k * 4.4); }
        y += 6 + linhas.length * 4.4 + 4;
        if (y + 24 <= YMAX) { comoLer(doc, y); }
    }
    function comoLer(doc, y) {
        caixa(doc, ML, y, CW, 24, '#ffffff', COR.borda); F(doc, COR.prim2); doc.rect(ML, y, 1.6, 24, 'F');
        fonte(doc, 8, true); T(doc, COR.prim); tx(doc, 'COMO LER ESTE RELAT\u00d3RIO', ML + 5, y + 5.2);
        var itens = [
            ['#b7e1a1', 'As cores', 'Cada cor \u00e9 uma faixa de desempenho para a idade; o verde-claro do meio (M\u00e9dia) re\u00fane metade das pessoas.'],
            ['#111111', 'O marcador preto', 'Mostra onde a pessoa ficou: quanto mais \u00e0 direita, maior o desempenho em rela\u00e7\u00e3o \u00e0 mesma idade.'],
            ['#8ec1ee', 'QI e percentil', 'O QI tem m\u00e9dia 100. Percentil 84, por exemplo, quer dizer que superou 84 de cada 100 pessoas da mesma idade.']
        ];
        itens.forEach(function (it, i) {
            var yy = y + 10 + i * 4.9; F(doc, it[0]); doc.roundedRect(ML + 5, yy - 2.6, 3.4, 3.4, 0.8, 0.8, 'F');
            fonte(doc, 7.3, true); T(doc, COR.texto); tx(doc, it[1], ML + 11, yy);
            fonte(doc, 7.1, false); T(doc, COR.suave); tx(doc, it[2], ML + 40, yy);
        });
    }
    function resumo(ix, ds) {
        if (!ix || !ds.length) { return ['Sem \u00e1reas aplicadas para resumir.']; }
        var maior = ds[0], menor = ds[0];
        ds.forEach(function (k) { if (ix.dominios[k].qi > ix.dominios[maior].qi) { maior = k; } if (ix.dominios[k].qi < ix.dominios[menor].qi) { menor = k; } });
        var dif = ix.dominios[maior].qi - ix.dominios[menor].qi, t;
        if (ds.length === 1) { t = 'Foi aplicada apenas a \u00e1rea ' + DOM[maior].curto + ', com desempenho na faixa ' + NIVEIS[ix.dominios[maior].classe][0] + '.'; }
        else if (dif < 15) { t = 'As \u00e1reas aplicadas ficaram em desempenhos parecidos (diferen\u00e7a de ' + dif + ' pontos de QI entre a mais alta e a mais baixa).'; }
        else { t = 'A \u00e1rea mais alta foi ' + DOM[maior].curto + ' (' + NIVEIS[ix.dominios[maior].classe][0] + ') e a mais baixa foi ' + DOM[menor].curto + ' (' + NIVEIS[ix.dominios[menor].classe][0] + '): diferen\u00e7a de ' + dif + ' pontos de QI, que merece ser observada junto com a hist\u00f3ria da pessoa.'; }
        return quebra(t, 112);
    }
    function quebra(texto, maxCar) {
        var pal = String(texto).split(' '), out = [], atual = '';
        pal.forEach(function (p) { if ((atual + ' ' + p).trim().length > maxCar) { out.push(atual); atual = p; } else { atual = (atual + ' ' + p).trim(); } });
        if (atual) { out.push(atual); } return out;
    }

    /* ============================================================
       PAGINA 2 - CADA AREA EM LINGUAGEM SIMPLES
       ============================================================ */
    function pagina2(c, d, ix) {
        var doc = c.doc; doc.addPage(); faixaFina(doc, 'Cada \u00e1rea em linguagem simples'); c.titulo2 = 'Cada \u00e1rea em linguagem simples'; c.y = 19;
        var y = 19, h = 64;
        ORDEM.forEach(function (key, idx) { blocoDominio(c, key, d, ix, y + idx * h, idx + 1); });
        c.y = y + 4 * h;
    }
    function blocoDominio(c, key, d, ix, y, numero) {
        var doc = c.doc, info = DOM[key], dm = ix && ix.dominios && ix.dominios[key], r = d[CHAVE_RES[key]], xr = 108;
        caixa(doc, ML, y, CW, 61.5, '#ffffff', COR.borda); F(doc, info.cor); doc.rect(ML, y, 2.4, 61.5, 'F');
        fonte(doc, 11, true); T(doc, info.cor); tx(doc, numero + '. ' + info.nome, ML + 6, y + 7);
        if (dm) { var wch = chipClasse(doc, XR - 3, y + 3, dm.classe, 7.5, true); fonte(doc, 7, false); T(doc, COR.suave); tx(doc, 'QI ' + dm.qi + '  |  percentil ' + Math.round(dm.percentil), XR - 3 - wch - 3, y + 6.8, { align: 'right' }); }
        else { fonte(doc, 8, true); T(doc, COR.suave); tx(doc, 'N\u00e3o aplicado', XR - 3, y + 7, { align: 'right' }); }
        /* texto da esquerda */
        c.y = y + 12.5; fonte(doc, 7, true); T(doc, COR.suave); tx(doc, 'O QUE MEDE', ML + 6, c.y); c.y += 3.4;
        paragrafo(c, O_QUE_MEDE[key], ML + 6, 90, 7.3, COR.texto, 3.35);
        c.y += 1.6; fonte(doc, 7, true); T(doc, COR.suave); tx(doc, 'SEU RESULTADO', ML + 6, c.y); c.y += 3.4;
        paragrafo(c, resultadoTexto(key, d), ML + 6, 90, 7.5, COR.texto, 3.5, false);
        if (dm) { c.y += 1.4; paragrafo(c, oQueMostra(dm.classe), ML + 6, 90, 7.3, info.cor, 3.4, true); }
        /* visual da direita */
        if (!r) { return; }
        if (key === 'MO') { visMO(doc, r, xr, y + 14); }
        if (key === 'VP') { visVP(doc, r, xr, y + 14); }
        if (key === 'IV') { visIV(doc, r, xr, y + 14); }
        if (key === 'NV') { visNV(doc, r, xr, y + 14); }
    }
    function legendaPequena(doc, s, x, y, w) { fonte(doc, 6.2, false); T(doc, COR.suave); doc.text(doc.splitTextToSize(pt(s), w || 88), x, y); }

    function visMO(doc, r, xr, y0) {
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'SEQU\u00caNCIAS LEMBRADAS (cada coluna = tamanho)', xr, y0);
        var linhas = [['Ida', r.direta, 8], ['Volta', r.inversa, 7]], li, n, t, x, colw = 10.6, yy;
        for (li = 0; li < 2; li++) {
            yy = y0 + 6 + li * 15; fonte(doc, 7.5, true); T(doc, COR.texto); tx(doc, linhas[li][0], xr, yy + 5.2);
            for (n = 2; n <= linhas[li][2]; n++) {
                x = xr + 14 + (n - 2) * colw + colw / 2; fonte(doc, 6.4, true); T(doc, COR.suave); doc.text(String(n), x, yy + 1.4, { align: 'center' });
                for (t = 1; t <= 2; t++) {
                    var tent = null, q; for (q = 0; q < linhas[li][1].tentativas.length; q++) { if (linhas[li][1].tentativas[q].nivel === n && linhas[li][1].tentativas[q].tentativa === t) { tent = linhas[li][1].tentativas[q]; } }
                    var cx = x + (t === 1 ? -2.1 : 2.1), cy = yy + 5.4;
                    if (!tent) { D(doc, '#b0bec5'); doc.setLineWidth(0.25); doc.circle(cx, cy, 1.6, 'S'); }
                    else if (tent.acertou) { F(doc, COR.certo); doc.circle(cx, cy, 1.6, 'F'); }
                    else { F(doc, COR.erro); doc.circle(cx, cy, 1.6, 'F'); }
                }
            }
        }
        fonte(doc, 8, true); T(doc, DOM.MO.cor); tx(doc, 'Maior sequ\u00eancia:  ida ' + pl(r.direta.spanMaximo, 'n\u00famero', 'n\u00fameros') + '  |  volta ' + pl(r.inversa.spanMaximo, 'n\u00famero', 'n\u00fameros'), xr, y0 + 38);
        /* legenda com bolinhas desenhadas */
        F(doc, COR.certo); doc.circle(xr + 1.6, y0 + 42.2, 1.3, 'F'); fonte(doc, 6.4, false); T(doc, COR.suave); tx(doc, 'acertou', xr + 4, y0 + 43);
        F(doc, COR.erro); doc.circle(xr + 20, y0 + 42.2, 1.3, 'F'); tx(doc, 'errou', xr + 22.4, y0 + 43);
        D(doc, '#b0bec5'); doc.setLineWidth(0.25); doc.circle(xr + 35, y0 + 42.2, 1.3, 'S'); tx(doc, 'n\u00e3o chegou aqui', xr + 37.4, y0 + 43);
    }
    function visVP(doc, r, xr, y0) {
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'A GRADE E O TEMPO DE CADA ETAPA', xr, y0);
        var cores = ['#1e88e5', '#e53935', '#43a047', '#fdd835', '#fb8c00', '#ec407a'], s = 7.3, i, j, cx, cy, ix = 0;
        var forma = ['c', 'q', 'e', 't', 'c', 'q', 'e', 'd'], nums = [24, 37, 61, 18, 55, 92, 43, 70];
        for (j = 0; j < 2; j++) { for (i = 0; i < 4; i++) {
            cx = xr + 1 + i * (s + 0.6); cy = y0 + 5 + j * (s + 0.6); F(doc, cores[ix % cores.length]);
            if (forma[ix] === 'c') { doc.circle(cx + s / 2 - 0.4, cy + s / 2, s / 2 - 0.3, 'F'); }
            else if (forma[ix] === 'q') { doc.roundedRect(cx, cy, s - 0.8, s - 0.8, 0.8, 0.8, 'F'); }
            else if (forma[ix] === 'e') { estrela(doc, cx + s / 2 - 0.4, cy + s / 2 + 0.2, s / 2, s / 4.2, cores[ix % cores.length]); }
            else if (forma[ix] === 't') { poly(doc, [[cx + s / 2 - 0.4, cy], [cx + s - 0.8, cy + s - 0.8], [cx, cy + s - 0.8]], 'F'); }
            else { poly(doc, [[cx + s / 2 - 0.4, cy], [cx + s - 0.8, cy + s / 2 - 0.4], [cx + s / 2 - 0.4, cy + s - 0.8], [cx, cy + s / 2 - 0.4]], 'F'); }
            fonte(doc, 5.4, true); T(doc, (ix % cores.length === 3) ? '#3e2723' : '#ffffff'); doc.text(String(nums[ix]), cx + s / 2 - 0.4, cy + s / 2 + 0.7, { align: 'center' });
            ix++;
        } }
        legendaPequena(doc, 'Exemplo da grade: tocar s\u00f3 no que \u00e9 pedido (pares, \u00edmpares, estrela, vermelho).', xr, y0 + 23.5, 36);
        var bx = xr + 44, by = y0 + 37, maxT = 1, k, e;
        for (k = 0; k < r.etapas.length; k++) { if (r.etapas[k].tempoMs > maxT) { maxT = r.etapas[k].tempoMs; } }
        var nomes = { par: 'Pares', impar: '\u00cdmpares', figura: 'Estrela', cor: 'Vermelho' };
        D(doc, '#b0bec5'); doc.setLineWidth(0.3); doc.line(bx - 1, by, bx + 45, by);
        for (k = 0; k < r.etapas.length; k++) {
            e = r.etapas[k]; var larg = 8, x = bx + 1.5 + k * 11.2, alt = Math.max(1, e.tempoMs / maxT * 19), nerr = e.comissoes + e.omissoes;
            F(doc, '#ef6c00'); doc.rect(x, by - alt, larg, alt, 'F');
            fonte(doc, 6.3, true); T(doc, COR.texto); doc.text(vn(seg(e.tempoMs)) + ' s', x + larg / 2, by - alt - 1.2, { align: 'center' });
            fonte(doc, 5.8, false); T(doc, COR.suave); doc.text(pt(nomes[e.etapa]), x + larg / 2, by + 3, { align: 'center' });
            fonte(doc, 5.6, true); T(doc, nerr ? COR.erro : COR.certo); doc.text(nerr + (nerr === 1 ? ' erro' : ' erros'), x + larg / 2, by + 5.9, { align: 'center' });
        }
    }
    function visIV(doc, r, xr, y0) {
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'UMA PERGUNTA DO TIPO DO TESTE (treino)', xr, y0);
        caixa(doc, xr, y0 + 2, 88, 15.4, '#f3f8ff', '#bbdefb');
        fonte(doc, 7.1, true); T(doc, COR.texto); tx(doc, 'Qual palavra significa o mesmo que "bonito"?', xr + 3, y0 + 6.4);
        var ops = ['feio', 'belo', 'velho', 'grande'], i, ox;
        for (i = 0; i < 4; i++) {
            ox = xr + 3 + i * 21; F(doc, i === 1 ? '#c8e6c9' : '#ffffff'); D(doc, i === 1 ? COR.certo : '#b0bec5'); doc.setLineWidth(0.3); doc.roundedRect(ox, y0 + 9, 19.4, 6, 1.6, 1.6, 'FD');
            fonte(doc, 6.4, true); T(doc, COR.prim); doc.text(String.fromCharCode(65 + i), ox + 2.6, y0 + 12.1, { baseline: 'middle' });
            fonte(doc, 6.6, false); T(doc, COR.texto); doc.text(ops[i], ox + 5.6, y0 + 12.1, { baseline: 'middle' });
            if (i === 1) { marcaOk(doc, ox + 17.2, y0 + 11.8, COR.certo); }
        }
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'ACERTOS POR N\u00cdVEL DE DIFICULDADE', xr, y0 + 22.6);
        var niveis = [[1, 8, 'N\u00edvel 1 (itens 1-8)'], [2, 8, 'N\u00edvel 2 (itens 9-16)'], [3, 8, 'N\u00edvel 3 (itens 17-24)'], [4, 6, 'N\u00edvel 4 (itens 25-30)']], q, ok, n2;
        for (q = 0; q < 4; q++) {
            ok = 0; n2 = niveis[q][1];
            (r.creditados || []).forEach(function (id) { if (nivelDoItem(id) === niveis[q][0]) { ok++; } });
            (r.respostas || []).forEach(function (rp) { if (nivelDoItem(rp.item) === niveis[q][0] && rp.acertou) { ok++; } });
            var yy = y0 + 25 + q * 4.9; fonte(doc, 6.4, false); T(doc, COR.texto); tx(doc, niveis[q][2], xr, yy + 2.6);
            F(doc, '#e3e8ea'); doc.roundedRect(xr + 36, yy, 40, 3.4, 1.7, 1.7, 'F'); F(doc, '#1565c0'); if (ok > 0) { doc.roundedRect(xr + 36, yy, 40 * ok / n2, 3.4, 1.7, 1.7, 'F'); }
            fonte(doc, 6.6, true); T(doc, COR.texto); tx(doc, ok + '/' + n2, xr + 78.5, yy + 2.8);
        }
    }
    function visNV(doc, r, xr, y0) {
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'DO MOLDE AO S\u00d3LIDO (exemplo do treino)', xr, y0);
        var s = 4.4, ox = xr + 1, oy = y0 + 4.2, net = [[1, 0, '#e53935'], [0, 1, '#1e88e5'], [1, 1, '#43a047'], [2, 1, '#fdd835'], [3, 1, '#8e24aa'], [1, 2, '#fb8c00']], i;
        for (i = 0; i < net.length; i++) { F(doc, net[i][2]); D(doc, '#37474f'); doc.setLineWidth(0.25); doc.rect(ox + net[i][0] * s, oy + net[i][1] * s, s, s, 'FD'); }
        D(doc, COR.suave); doc.setLineWidth(0.5); var ax = ox + 4 * s + 1.5, ay = oy + 1.5 * s;
        doc.line(ax, ay, ax + 5, ay); doc.line(ax + 3.4, ay - 1.2, ax + 5, ay); doc.line(ax + 3.4, ay + 1.2, ax + 5, ay);
        var cx = ax + 14, cy = oy + 7.4, a = 5.2, k = a * 0.866;
        D(doc, '#37474f'); doc.setLineWidth(0.3);
        F(doc, '#e53935'); poly(doc, [[cx, cy - a], [cx + k, cy - a / 2], [cx, cy], [cx - k, cy - a / 2]], 'FD');
        F(doc, '#fdd835'); poly(doc, [[cx - k, cy - a / 2], [cx, cy], [cx, cy + a], [cx - k, cy + a / 2]], 'FD');
        F(doc, '#8e24aa'); poly(doc, [[cx, cy], [cx + k, cy - a / 2], [cx + k, cy + a / 2], [cx, cy + a]], 'FD');
        legendaPequena(doc, 'Imaginar o molde dobrado e escolher, entre 5 op\u00e7\u00f5es, o s\u00f3lido que se forma.', xr, y0 + 20.4, 88);
        fonte(doc, 6.8, true); T(doc, COR.suave); tx(doc, 'ACERTOS POR TIPO DE PROBLEMA', xr, y0 + 27);
        var ok = [0, 0, 0, 0, 0], adm = [0, 0, 0, 0, 0], q;
        (r.respostas || []).forEach(function (rp) { var t = tipoDoItem(rp.item); adm[t]++; if (rp.acertou) { ok[t]++; } });
        for (q = 0; q < 5; q++) {
            var yy = y0 + 29 + q * 3.55; fonte(doc, 6.1, false); T(doc, COR.texto); tx(doc, TIPOS_NV[q], xr, yy + 2.3);
            F(doc, '#e3e8ea'); doc.roundedRect(xr + 36, yy, 40, 2.9, 1.45, 1.45, 'F');
            if (adm[q] === 0) { fonte(doc, 5.6, false); T(doc, '#90a4ae'); tx(doc, 'n\u00e3o chegou aqui', xr + 38, yy + 2.2); }
            else { F(doc, '#ad1457'); if (ok[q] > 0) { doc.roundedRect(xr + 36, yy, 40 * ok[q] / TOTAL_TIPO_NV[q], 2.9, 1.45, 1.45, 'F'); } fonte(doc, 6.3, true); T(doc, COR.texto); tx(doc, ok[q] + '/' + TOTAL_TIPO_NV[q], xr + 78.5, yy + 2.4); }
        }
    }

    /* ============================================================
       PAGINA 3 - COMPARACAO, APLICACAO, PARECER, AVISO E REFERENCIAS
       ============================================================ */
    function pagina3(c, d, ix, op) {
        var doc = c.doc; doc.addPage(); faixaFina(doc, 'Comparando as \u00e1reas e lendo o resultado'); c.titulo2 = 'Comparando as \u00e1reas e lendo o resultado'; c.y = 19;
        secao(c, 'Diferen\u00e7as entre as \u00e1reas');
        var disc = (ix && ix.discrepancias) || [];
        if (!disc.length) {
            caixa(doc, ML, c.y, CW, 9, '#e8f5e9', null); fonte(doc, 8.5, false); T(doc, '#1b5e20'); tx(doc, 'Nenhuma diferen\u00e7a entre \u00e1reas chegou a 15 pontos de QI (1 desvio-padr\u00e3o).', ML + 4, c.y + 5.6); c.y += 12.5;
        } else {
            disc.slice(0, 6).forEach(function (x) { c.y = difLinha(doc, c.y, x, ix); });
            c.y += 3;
            paragrafo(c, 'Diferen\u00e7a de 15 pontos de QI ou mais (1 desvio-padr\u00e3o) entre duas \u00e1reas merece aten\u00e7\u00e3o. Ela mostra onde a pessoa vai melhor e onde pode precisar de apoio, mas n\u00e3o indica, sozinha, nenhum diagn\u00f3stico.', ML, CW, 8, COR.suave, 3.8);
            c.y += 3;
        }
        secao(c, 'An\u00e1lise dos resultados');
        var tp = (op && op.parecer) ? [['', op.parecer]] : parecerFixo(d, ix), w = CW - 10, i, alt = 3.5, blocos = [];
        fonte(doc, 8.3, false);
        for (i = 0; i < tp.length; i++) { var ls = doc.splitTextToSize(pt(tp[i][1]), w); blocos.push(ls); alt += ls.length * 3.9 + (tp[i][0] ? 4.6 : 0) + 2.2; }
        need(c, alt + 2); var y0 = c.y;
        caixa(doc, ML, y0, CW, alt, '#f8f9fb', COR.borda); F(doc, COR.prim2); doc.rect(ML, y0, 1.6, alt, 'F');
        var yy = y0 + 5;
        for (i = 0; i < tp.length; i++) {
            if (tp[i][0]) { fonte(doc, 7.2, true); T(doc, COR.prim); tx(doc, tp[i][0].toUpperCase(), ML + 5, yy); yy += 4.2; }
            fonte(doc, 8.3, false); T(doc, COR.texto); doc.text(blocos[i], ML + 5, yy); yy += blocos[i].length * 3.9 + 2.2;
        }
        c.y = y0 + alt + 4;
        need(c, 26); var yb = c.y;
        caixa(doc, ML, yb, CW, 23, COR.laranjaFundo, null); F(doc, COR.laranjaBorda); doc.rect(ML, yb, 1.6, 23, 'F');
        fonte(doc, 8, true); T(doc, COR.laranja); tx(doc, 'IMPORTANTE', ML + 5, yb + 5);
        fonte(doc, 7.6, false);
        doc.text(doc.splitTextToSize(pt('A BAFC \u00e9 um instrumento de rastreio em desenvolvimento. Seus resultados descrevem como a pessoa se saiu neste dia, nestas tarefas, e devem ser lidos junto com a hist\u00f3ria de vida, outros instrumentos e outras fontes de informa\u00e7\u00e3o. Nenhum resultado isolado \u00e9 diagn\u00f3stico nem define aptid\u00e3o. As classes de desempenho usam as mesmas faixas das escalas Wechsler (percentis 2, 9, 25, 75, 91 e 98).'), CW - 10), ML + 5, yb + 9.4);
        c.y = yb + 27;
    }

    /* ---------- analise fixa (sem IA): texto montado por regras a partir dos resultados ---------- */
    function pl(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
    function listaE(a) { return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }
    var FORTE = {
        MO: 'guardar v\u00e1rias informa\u00e7\u00f5es ao mesmo tempo, como seguir instru\u00e7\u00f5es com v\u00e1rios passos',
        VP: 'trabalhar depressa e com aten\u00e7\u00e3o em tarefas visuais',
        IV: 'compreender e usar palavras, explica\u00e7\u00f5es e ideias',
        NV: 'raciocinar com formas e imagens, sem depender de palavras'
    };
    var ATENCAO = {
        MO: 'seguir instru\u00e7\u00f5es longas, fazer contas de cabe\u00e7a ou lembrar v\u00e1rios passos de uma vez',
        VP: 'tarefas que pedem rapidez com cuidado, como copiar, conferir ou preencher formul\u00e1rios',
        IV: 'entender textos e explica\u00e7\u00f5es com vocabul\u00e1rio mais dif\u00edcil',
        NV: 'resolver problemas visuais novos, como montar, ler esquemas e mapas'
    };
    var NOME_TIPO = ['s\u00f3 cores', 'com figuras', 'com s\u00edmbolos que giram', 'de pir\u00e2mide', 'de prisma'];
    function parecerFixo(d, ix) {
        var out = [], ds = ORDEM.filter(function (k) { return ix && ix.dominios && ix.dominios[k]; }), g = ix && ix.global, k, i;
        if (!ds.length) { return [['Vis\u00e3o geral', 'Nenhuma \u00e1rea foi aplicada ou a idade n\u00e3o permitiu a classifica\u00e7\u00e3o. N\u00e3o h\u00e1 an\u00e1lise a apresentar.']]; }
        var nomes = ds.map(function (x) { return DOM[x].curto; });
        var t = 'Foram aplicadas ' + pl(ds.length, '\u00e1rea', '\u00e1reas') + ' (' + listaE(nomes) + '). ';
        if (g) { t += (g.parcial ? 'O \u00edndice global parcial (ICG ' + g.icg + ', m\u00e9dia de ' + ds.length + ' das 4 \u00e1reas)' : 'O \u00edndice global (ICG ' + g.icg + ')') + ' ficou na faixa ' + NIVEIS[g.classe][0] + '. '; }
        else { t += 'Com uma \u00fanica \u00e1rea n\u00e3o h\u00e1 \u00edndice global; leia o resultado dela isoladamente. '; }
        out.push(['Vis\u00e3o geral', t.replace(/\s+$/, '')]);
        var fortes = ds.filter(function (x) { return ix.dominios[x].classe >= 4; }), atenc = ds.filter(function (x) { return ix.dominios[x].classe <= 2; });
        var baixos = ds.filter(function (x) { return ix.dominios[x].classe <= 1; });
        if (fortes.length) {
            out.push(['Pontos fortes', fortes.map(function (x) { return 'Em ' + DOM[x].curto + ' (' + NIVEIS[ix.dominios[x].classe][0] + ') o desempenho ficou acima da m\u00e9dia para a idade. No dia a dia, isso costuma ajudar a ' + FORTE[x] + '.'; }).join(' ')]);
        }
        if (atenc.length) {
            out.push(['Pontos de aten\u00e7\u00e3o', atenc.map(function (x) {
                var cl = ix.dominios[x].classe;
                return 'Em ' + DOM[x].curto + ' (' + NIVEIS[cl][0] + ') o desempenho ficou ' + (cl <= 1 ? 'bem abaixo' : 'um pouco abaixo') + ' da m\u00e9dia para a idade. Vale observar como a pessoa se sai em ' + ATENCAO[x] + '.';
            }).join(' ')]);
        }
        if (!fortes.length && !atenc.length) { out.push(['Pontos fortes e de aten\u00e7\u00e3o', 'Todas as \u00e1reas aplicadas ficaram dentro do esperado para a idade (faixa M\u00e9dia). Nenhuma se destacou para cima ou para baixo.']); }
        /* observacoes de processo (como a pessoa chegou ao resultado) */
        var obs = [], A = d.A, B = d.B, C = d.C, N = d.D;
        if (A && A.direta && A.inversa) {
            var di = A.direta.spanMaximo, iv = A.inversa.spanMaximo;
            if (di - iv >= 2) { obs.push('Mem\u00f3ria: a ida (' + pl(di, 'n\u00famero', 'n\u00fameros') + ') foi bem mais f\u00e1cil que a volta (' + pl(iv, 'n\u00famero', 'n\u00fameros') + '). Guardar a informa\u00e7\u00e3o funcionou melhor do que reorganiz\u00e1-la na cabe\u00e7a.'); }
            else if (iv >= di && di > 0) { obs.push('Mem\u00f3ria: a volta (' + pl(iv, 'n\u00famero', 'n\u00fameros') + ') acompanhou a ida (' + pl(di, 'n\u00famero', 'n\u00fameros') + '), sem queda ao precisar reorganizar a informa\u00e7\u00e3o.'); }
        }
        if (B && B.totais) {
            var co = B.totais.comissoes, om = B.totais.omissoes;
            if (co + om === 0) { obs.push('Velocidade: nenhum toque errado e nenhum alvo deixado para tr\u00e1s.'); }
            else if (co > om) { obs.push('Velocidade: houve mais toques em figuras erradas (' + co + ') do que alvos n\u00e3o tocados (' + om + '), um padr\u00e3o de agir antes de conferir.'); }
            else if (om > co) { obs.push('Velocidade: houve mais alvos n\u00e3o tocados (' + om + ') do que toques errados (' + co + '), um padr\u00e3o de deixar passar itens ao varrer a grade.'); }
            else { obs.push('Velocidade: toques errados (' + co + ') e alvos n\u00e3o tocados (' + om + ') apareceram na mesma quantidade.'); }
        }
        if (C) {
            var ap = C.itensApresentados || 0, rp = C.repeticoesTotal || 0;
            if (C.parouPorErros) { obs.push('Verbal: o teste foi interrompido ap\u00f3s 4 erros seguidos, o que \u00e9 esperado quando as palavras passam do vocabul\u00e1rio da pessoa.'); }
            if (ap > 0 && rp / ap >= 0.5) { obs.push('Verbal: a pessoa pediu para ouvir a pergunta de novo com frequ\u00eancia (' + pl(rp, 'vez', 'vezes') + ' em ' + pl(ap, 'item', 'itens') + '). Vale observar se h\u00e1 dificuldade em reter o que ouve.'); }
            if (C.reversao) { obs.push('Verbal: no in\u00edcio houve erros e o teste voltou a itens mais f\u00e1ceis antes de seguir.'); }
        }
        if (N) {
            var rs = N.respostas || [], ult = rs.length ? rs[rs.length - 1] : null;
            if (N.parouPorErros && ult) { obs.push('N\u00e3o-Verbal: o teste foi interrompido ap\u00f3s 3 erros seguidos, nos problemas ' + NOME_TIPO[tipoDoItem(ult.item)] + '. Os problemas anteriores foram resolvidos at\u00e9 ali.'); }
            else if (N.acertos === N.totalItens) { obs.push('N\u00e3o-Verbal: todos os problemas foram resolvidos.'); }
        }
        if (obs.length) { out.push(['Como a pessoa respondeu', obs.join(' ')]); }
        var disc = (ix && ix.discrepancias) || [];
        if (disc.length) {
            var mx = disc[0]; disc.forEach(function (x) { if (Math.abs(x.diferenca) > Math.abs(mx.diferenca)) { mx = x; } });
            out.push(['Diferen\u00e7a entre \u00e1reas', 'A maior diferen\u00e7a foi entre ' + DOM[mx.de].curto + ' e ' + DOM[mx.para].curto + ' (' + Math.abs(mx.diferenca) + ' pontos de QI). Vale perguntar, na entrevista, em que situa\u00e7\u00f5es essa diferen\u00e7a aparece no dia a dia.']);
        }
        var prov = ix && ix.provisorios && ix.provisorios.length;
        out.push(['Ponto de partida', 'Estas observa\u00e7\u00f5es s\u00e3o hip\u00f3teses para conversar com a pessoa e comparar com outras fontes de informa\u00e7\u00e3o. ' + (prov ? 'Os cortes de ' + listaE(ix.provisorios.map(function (x) { return DOM[x].curto; })) + ' ainda s\u00e3o provis\u00f3rios. ' : '') + 'Nada aqui, sozinho, define aptid\u00e3o ou fecha um diagn\u00f3stico.']);
        return out;
    }

    /* ============================================================
       PAGINA 4 - PARA ENTENDER MELHOR (aplicacao, glossario, referencias)
       ============================================================ */
    var GLOSSARIO = [
        ['QI equivalente', 'N\u00famero com m\u00e9dia 100 e desvio-padr\u00e3o 15, usado para mostrar a posi\u00e7\u00e3o da pessoa entre pessoas da mesma idade. N\u00e3o \u00e9 um laudo de QI.'],
        ['Percentil', 'Quantas pessoas, em cada 100 da mesma idade, tiveram desempenho igual ou menor. Percentil 84 quer dizer que superou 84 de cada 100.'],
        ['Faixas de classifica\u00e7\u00e3o', 'Deficit\u00e1rio (abaixo do percentil 2), Lim\u00edtrofe (2 a 8), M\u00e9dia Inferior (9 a 24), M\u00e9dia (25 a 74), M\u00e9dia Superior (75 a 90), Superior (91 a 97) e Muito Superior (98 ou mais).'],
        ['Desvio-padr\u00e3o', 'Medida de quanto os resultados costumam se afastar da m\u00e9dia. Uma diferen\u00e7a de 15 pontos de QI equivale a 1 desvio-padr\u00e3o.'],
        ['Escore ponderado', 'Escala com m\u00e9dia 10 e desvio-padr\u00e3o 3, usada nas tabelas das escalas Wechsler. Aqui aparece como "pond. equiv." no anexo.'],
        ['Norma provis\u00f3ria', 'Corte de classifica\u00e7\u00e3o ainda suposto, em calibra\u00e7\u00e3o com um grupo de pessoas. Vale para uso experimental, n\u00e3o para decis\u00f5es.'],
        ['IEP (efici\u00eancia)', '\u00cdndice da Velocidade: acertos por segundo, reduzidos pela taxa de erros (toques errados e alvos n\u00e3o tocados).'],
        ['Item creditado', 'Item inicial n\u00e3o aplicado por causa da idade (o teste come\u00e7a mais adiante) e contado como acerto, como nas escalas Wechsler.'],
        ['ICG parcial', '\u00cdndice global calculado com 2 ou 3 das 4 \u00e1reas, com pesos iguais. Serve como retrato do que foi aplicado, n\u00e3o da bateria completa.']
    ];
    function pagina4(c, d, ix) {
        var doc = c.doc; doc.addPage(); faixaFina(doc, 'Para entender melhor'); c.titulo2 = 'Para entender melhor'; c.y = 19;
        secao(c, 'Como foi a aplica\u00e7\u00e3o');
        aplicacao(d, ix).forEach(function (par) {
            need(c, 9); fonte(doc, 8, true); T(doc, DOM[par[0]] ? DOM[par[0]].cor : COR.prim); tx(doc, par[1], ML + 2, c.y + 2.8);
            fonte(doc, 8, false); T(doc, COR.texto); var ls = doc.splitTextToSize(pt(par[2]), CW - 38); doc.text(ls, ML + 36, c.y + 2.8); c.y += Math.max(5.6, ls.length * 3.8 + 1.8);
        });
        c.y += 3;
        secao(c, 'Gloss\u00e1rio');
        GLOSSARIO.forEach(function (gl) {
            fonte(doc, 7.8, false); var ls = doc.splitTextToSize(pt(gl[1]), CW - 42);
            need(c, ls.length * 3.6 + 2); fonte(doc, 7.8, true); T(doc, COR.prim); tx(doc, gl[0], ML + 2, c.y + 2.8);
            fonte(doc, 7.8, false); T(doc, COR.texto); doc.text(ls, ML + 40, c.y + 2.8); c.y += ls.length * 3.6 + 2.2;
        });
        c.y += 3;
        secao(c, 'Refer\u00eancias');
        fonte(doc, 7, false); T(doc, COR.texto);
        referencias().forEach(function (rf) { var ls = doc.splitTextToSize(pt(rf), CW - 2); need(c, ls.length * 3.2 + 1.4); doc.text(ls, ML, c.y + 2.4); c.y += ls.length * 3.2 + 1.5; });
    }
    function difLinha(doc, y, x, ix) {
        var a = ix.dominios[x.de], b = ix.dominios[x.para], x0 = ML + 4, w = 84, xa, xb;
        fonte(doc, 8, true); T(doc, COR.texto); tx(doc, DOM[x.de].curto + ' x ' + DOM[x.para].curto, x0, y + 4);
        fonte(doc, 7.4, false); T(doc, COR.suave); tx(doc, 'QI ' + a.qi + ' e QI ' + b.qi + ': diferen\u00e7a de ' + Math.abs(x.diferenca) + ' pontos', x0, y + 8.4);
        var rx = ML + 100, rw = 84;
        regua(doc, rx, y + 3, rw, 4.4, null);
        xa = rx + (Math.max(41, Math.min(159, a.qi)) - 40) / 120 * rw; xb = rx + (Math.max(41, Math.min(159, b.qi)) - 40) / 120 * rw;
        D(doc, '#111111'); doc.setLineWidth(0.6); doc.line(xa, y + 5.2, xb, y + 5.2);
        F(doc, DOM[x.de].cor); D(doc, '#ffffff'); doc.setLineWidth(0.4); doc.circle(xa, y + 5.2, 2.2, 'FD'); F(doc, DOM[x.para].cor); doc.circle(xb, y + 5.2, 2.2, 'FD');
        return y + 11.5;
    }
    function aplicacao(d, ix) {
        var L = [], A = d.A, B = d.B, C = d.C, N = d.D;
        if (A) { L.push(['MO', 'Mem\u00f3ria', 'D\u00edgitos falados por \u00e1udio, um por segundo e sem repetir. Ida e volta, parando quando as duas tentativas erram no mesmo tamanho.']); }
        if (B) { L.push(['VP', 'Velocidade', 'As 4 etapas foram feitas por inteiro, em ' + vn(B.totais.tempoSeg) + ' s no total (sem interrup\u00e7\u00e3o por regra).']); }
        if (C) {
            var t = (C.inicio > 1) ? 'Come\u00e7ou no item ' + C.inicio + ' pela idade (itens 1 a ' + (C.inicio - 1) + ' contados como acertos). ' : 'Come\u00e7ou no item 1. ';
            L.push(['IV', 'Verbal', t + C.itensApresentados + ' itens apresentados; ouviu de novo ' + pl(C.repeticoesTotal || 0, 'vez', 'vezes') + '. ' + (C.reversao ? 'Houve volta a itens anteriores. ' : '') + (C.parouPorErros ? 'Interrompido por 4 erros seguidos.' : 'Chegou ao fim.')]);
        }
        if (N) { L.push(['NV', 'N\u00e3o-Verbal', N.itensApresentados + ' problemas apresentados. ' + (N.parouPorErros ? 'Interrompido ap\u00f3s 3 erros seguidos (regra do teste).' : 'Chegou ao fim.')]); }
        return L;
    }

    /* ============================================================
       PAGINA 4 - ANEXO PARA O PROFISSIONAL
       ============================================================ */
    function pagina5(c, d, ix) {
        var doc = c.doc; doc.addPage(); faixaFina(doc, 'Anexo para o profissional'); c.titulo2 = 'Anexo para o profissional'; c.y = 19;
        secao(c, 'Resultados em n\u00fameros');
        var cols = [['\u00c1rea', 0, 'l'], ['Bruto', 52, 'c'], ['Pond. equiv.', 70, 'c'], ['QI equiv.', 92, 'c'], ['Percentil', 110, 'c'], ['Classifica\u00e7\u00e3o', 126, 'l'], ['Fonte do corte', 152, 'l']], y = c.y, i;
        F(doc, COR.prim); doc.rect(ML, y, CW, 6.2, 'F'); fonte(doc, 7, true); T(doc, '#ffffff');
        cols.forEach(function (col) { doc.text(pt(col[0]), ML + 2 + col[1] + (col[2] === 'c' ? 8 : 0), y + 4.3, { align: col[2] === 'c' ? 'center' : 'left' }); });
        y += 6.2;
        ORDEM.forEach(function (k, idx) {
            var dm = ix && ix.dominios && ix.dominios[k]; F(doc, idx % 2 ? '#f8f3fd' : '#ffffff'); doc.rect(ML, y, CW, 7, 'F');
            fonte(doc, 7.3, true); T(doc, DOM[k].cor); tx(doc, DOM[k].curto, ML + 2, y + 4.7);
            fonte(doc, 7.2, false); T(doc, COR.texto);
            if (dm) {
                var bruto = (k === 'VP') ? vn(Math.round(dm.bruto * 1000) / 1000) : String(dm.bruto);
                doc.text(bruto, ML + 2 + 60, y + 4.7, { align: 'center' }); doc.text(String(dm.pp), ML + 2 + 78, y + 4.7, { align: 'center' }); doc.text(String(dm.qi), ML + 2 + 100, y + 4.7, { align: 'center' });
                doc.text(String(Math.round(dm.percentil)), ML + 2 + 118, y + 4.7, { align: 'center' }); chipClasse(doc, ML + 2 + 126, y + 1.2, dm.classe, 6);
                fonte(doc, 6.2, false); T(doc, dm.provisorio ? COR.laranja : COR.suave); doc.text(pt(dm.provisorio ? 'provis\u00f3rio' : (dm.fonte || '').replace(/\s*\(.*$/, '')), ML + 2 + 152, y + 4.7);
            } else { tx(doc, 'n\u00e3o aplicado', ML + 2 + 52, y + 4.7); }
            y += 7;
        });
        var g = ix && ix.global;
        F(doc, '#eef7f0'); doc.rect(ML, y, CW, 7.6, 'F'); fonte(doc, 7.6, true); T(doc, COR.texto); tx(doc, 'ICG', ML + 2, y + 5);
        if (g) { doc.text(String(g.icg), ML + 2 + 100, y + 5, { align: 'center' }); doc.text(String(Math.round(g.percentil)), ML + 2 + 118, y + 5, { align: 'center' }); chipClasse(doc, ML + 2 + 126, y + 1.4, g.classe, 6.2); fonte(doc, 6.2, false); T(doc, COR.suave); tx(doc, 'm\u00e9dia dos Z', ML + 2 + 152, y + 5); }
        y += 11; c.y = y;
        paragrafo(c, 'Pond. equiv. e QI equiv. v\u00eam da posi\u00e7\u00e3o do escore bruto entre os cortes da faixa et\u00e1ria (ponderado: m\u00e9dia 10, desvio 3; QI: m\u00e9dia 100, desvio 15). Mem\u00f3ria: D\u00edgitos do WISC-IV (at\u00e9 15 anos) e do WAIS-III (16 a 89 anos). "provis\u00f3rio" = corte suposto at\u00e9 o estudo piloto.', ML, CW, 6.8, COR.suave, 3.2);
        c.y += 3;
        mapaMemoria(c, d); mapaVerbal(c, d); mapaNV(c, d); need(c, 9); legendaMapa(c.doc, c.y); c.y += 8; tabelaVelocidade(c, d);
    }
    function quadradinho(doc, x, y, s, num, estado) {
        /* estado: 'c' certo, 'e' erro, 'k' creditado, 'n' nao apresentado */
        if (estado === 'c') { F(doc, COR.certo); doc.roundedRect(x, y, s, s, 1.2, 1.2, 'F'); T(doc, '#ffffff'); }
        else if (estado === 'e') { F(doc, COR.erro); doc.roundedRect(x, y, s, s, 1.2, 1.2, 'F'); T(doc, '#ffffff'); }
        else if (estado === 'k') { F(doc, COR.credito); doc.roundedRect(x, y, s, s, 1.2, 1.2, 'F'); T(doc, '#2e7d32'); }
        else { F(doc, '#ffffff'); D(doc, '#b0bec5'); doc.setLineWidth(0.25); doc.roundedRect(x, y, s, s, 1.2, 1.2, 'FD'); T(doc, '#90a4ae'); }
        fonte(doc, 6.8, true); doc.text(String(num), x + s / 2, y + s / 2, { align: 'center', baseline: 'middle' });
    }
    function legendaMapa(doc, y) {
        var itens = [['c', 'acertou'], ['e', 'errou'], ['k', 'creditado pela idade'], ['n', 'n\u00e3o apresentado']], x = ML, i;
        for (i = 0; i < itens.length; i++) { quadradinho(doc, x, y, 4, '', itens[i][0]); fonte(doc, 6.4, false); T(doc, COR.suave); tx(doc, itens[i][1], x + 5.2, y + 3); x += 8 + doc.getTextWidth(pt(itens[i][1])) + 6; }
    }
    function mapaMemoria(c, d) {
        var A = d.A; if (!A) { return; } var doc = c.doc; need(c, 38);
        secao(c, 'Mapa das respostas - Mem\u00f3ria'); var y = c.y, s = 6.2, g = 1.1, passo = 19, x0 = ML + 16, lv, k;
        var partes = [['Ida', A.direta, 8, y + 4.6], ['Volta', A.inversa, 7, y + 4.6 + s + 5.4]];
        for (lv = 2; lv <= 8; lv++) { fonte(doc, 5.8, false); T(doc, COR.suave); doc.text(pt(lv + ' n\u00fameros'), x0 + (lv - 2) * passo + s + g / 2, y + 2.6, { align: 'center' }); }
        partes.forEach(function (pt2) {
            var tent = (pt2[1] && pt2[1].tentativas) || [], yy = pt2[3];
            fonte(doc, 7.6, true); T(doc, DOM.MO.cor); tx(doc, pt2[0], ML + 2, yy + s / 2 + 1.2);
            for (lv = 2; lv <= pt2[2]; lv++) {
                for (k = 1; k <= 2; k++) {
                    var reg = null; tent.forEach(function (t) { if (t.nivel === lv && t.tentativa === k) { reg = t; } });
                    quadradinho(doc, x0 + (lv - 2) * passo + (k - 1) * (s + g), yy, s, k, reg ? (reg.acertou ? 'c' : 'e') : 'n');
                }
            }
            fonte(doc, 6.4, false); T(doc, COR.suave); tx(doc, 'maior: ' + (pt2[1] ? pt2[1].spanMaximo : 0), x0 + 7 * passo + 1, yy + s / 2 + 1.2);
        });
        c.y = y + 4.6 + 2 * s + 5.4 + 3;
    }    function mapaVerbal(c, d) {
        var C = d.C; if (!C) { return; } var doc = c.doc; need(c, 52);
        secao(c, 'Mapa das respostas - Verbal'); var y = c.y, s = 10.2, g = 1.7, id, st, i;
        var porId = {}; (C.respostas || []).forEach(function (r) { porId[r.item] = r; });
        var cred = {}; (C.creditados || []).forEach(function (n) { cred[n] = true; });
        for (id = 1; id <= 30; id++) {
            st = porId[id] ? (porId[id].acertou ? 'c' : 'e') : (cred[id] ? 'k' : 'n');
            i = (id - 1) % 15; quadradinho(doc, ML + i * (s + g), y + (id > 15 ? s + g + 5 : 0), s, id, st);
        }
        /* faixas de modo de audio */
        function faixa(de, ate, linha, texto, cor) {
            var xa = ML + ((de - 1) % 15) * (s + g), xb = ML + ((ate - 1) % 15) * (s + g) + s, yy = y + (linha ? s + g + 5 : 0) + s + 1.2;
            F(doc, cor); doc.rect(xa, yy, xb - xa, 1.1, 'F'); fonte(doc, 5.6, false); T(doc, COR.suave); doc.text(pt(texto), (xa + xb) / 2, yy + 3.6, { align: 'center' });
        }
        faixa(1, 8, 0, '\u00e1udio autom\u00e1tico', '#90caf9'); faixa(9, 15, 0, 's\u00f3 com o bot\u00e3o ouvir', '#ffcc80');
        faixa(16, 22, 1, 's\u00f3 com o bot\u00e3o ouvir', '#ffcc80'); faixa(23, 30, 1, 's\u00f3 leitura (sem \u00e1udio)', '#b0bec5');
        c.y = y + 2 * (s + g) + 11;
    }
    function mapaNV(c, d) {
        var N = d.D; if (!N) { return; } var doc = c.doc; need(c, 48);
        secao(c, 'Mapa das respostas - N\u00e3o-Verbal'); var y = c.y, s = 10.2, g = 1.7, id, st, i, porId = {};
        (N.respostas || []).forEach(function (r) { porId[r.item] = r; });
        for (id = 1; id <= 24; id++) { st = porId[id] ? (porId[id].acertou ? 'c' : 'e') : 'n'; i = (id - 1) % 12; quadradinho(doc, ML + i * (s + g), y + (id > 12 ? s + g + 5 : 0), s, id, st); }
        var faixas = [[1, 2, 0, 's\u00f3 cores'], [3, 8, 0, 'com figuras'], [9, 12, 0, 's\u00edmbolos'], [13, 16, 1, 's\u00edmbolos que giram'], [17, 20, 1, 'pir\u00e2mide'], [21, 24, 1, 'prisma']], cores = ['#e0c3fc', '#d9b3ff', '#ce93d8', '#ce93d8', '#ffab91', '#ffe082'];
        faixas.forEach(function (f, k) {
            var xa = ML + ((f[0] - 1) % 12) * (s + g), xb = ML + ((f[1] - 1) % 12) * (s + g) + s, yy = y + (f[2] ? s + g + 5 : 0) + s + 1.2;
            F(doc, cores[k]); doc.rect(xa, yy, xb - xa, 1.1, 'F'); fonte(doc, 5.6, false); T(doc, COR.suave); doc.text(pt(f[3]), (xa + xb) / 2, yy + 3.6, { align: 'center' });
        });
        c.y = y + 2 * (s + g) + 11;
    }
    function buscaMedia(B) {
        var v = (B.etapas || []).filter(function (e) { return e.varredura && e.varredura.indice != null; });
        if (!v.length) { return '-'; }
        var s = 0; v.forEach(function (e) { s += e.varredura.indice; }); return vn(Math.round(s / v.length * 100) / 100);
    }
    function tabelaVelocidade(c, d) {
        var B = d.B; if (!B) { return; } var doc = c.doc; need(c, 46);
        secao(c, 'Velocidade - por etapa'); var y = c.y, cols = [['Etapa', 0, 'l'], ['Alvos', 46, 'c'], ['Acertos', 66, 'c'], ['Toques errados', 90, 'c'], ['N\u00e3o tocou', 118, 'c'], ['Tempo (s)', 142, 'c'], ['Busca*', 164, 'c']];
        F(doc, COR.prim); doc.rect(ML, y, CW, 6.2, 'F'); fonte(doc, 7, true); T(doc, '#ffffff');
        cols.forEach(function (col) { doc.text(pt(col[0]), ML + 2 + col[1] + (col[2] === 'c' ? 8 : 0), y + 4.3, { align: col[2] === 'c' ? 'center' : 'left' }); }); y += 6.2;
        var nomes = { par: 'N\u00fameros pares', impar: 'N\u00fameros \u00edmpares', figura: 'Estrela de 5 pontas', cor: 'Figuras vermelhas' };
        B.etapas.forEach(function (e, idx) {
            F(doc, idx % 2 ? '#f8f3fd' : '#ffffff'); doc.rect(ML, y, CW, 6.2, 'F'); fonte(doc, 7.2, false); T(doc, COR.texto); tx(doc, nomes[e.etapa], ML + 2, y + 4.3);
            [e.alvos, e.acertos, e.comissoes, e.omissoes, vn(seg(e.tempoMs)), (e.varredura && e.varredura.indice != null) ? vn(e.varredura.indice) : '-'].forEach(function (v, j) { doc.text(String(v), ML + 2 + cols[j + 1][1] + 8, y + 4.3, { align: 'center' }); }); y += 6.2;
        });
        F(doc, '#eef7f0'); doc.rect(ML, y, CW, 6.6, 'F'); fonte(doc, 7.4, true); T(doc, COR.texto); tx(doc, 'Total', ML + 2, y + 4.5);
        [B.totais.alvos, B.totais.acertos, B.totais.comissoes, B.totais.omissoes, vn(B.totais.tempoSeg), buscaMedia(B)].forEach(function (v, j) { doc.text(String(v), ML + 2 + cols[j + 1][1] + 8, y + 4.5, { align: 'center' }); });
        y += 9.4; c.y = y;
        paragrafo(c, 'IEP (efici\u00eancia) = acertos por segundo x (1 - taxa de erros) = ' + vn(B.iep) + '. A taxa de erros soma toques errados e alvos n\u00e3o tocados e divide pelo total de alvos (' + vn(B.totais.taxaErros) + ').', ML, CW, 6.8, COR.suave, 3.2);
        c.y += 1;
        paragrafo(c, '*Busca: organiza\u00e7\u00e3o da procura entre os acertos (1 = percurso curto e ordenado pela tela; perto de 0 = saltos de um lado a outro). As figuras ficam espalhadas, em posi\u00e7\u00f5es fixas e diferentes a cada etapa. \u00c9 s\u00f3 uma observa\u00e7\u00e3o, sem norma, e n\u00e3o entra nos \u00edndices.', ML, CW, 6.8, COR.suave, 3.2);
    }

    /* ---------- rodape em todas as paginas ---------- */
    function rodape(doc) {
        var tot = doc.getNumberOfPages(), pg;
        for (pg = 1; pg <= tot; pg++) {
            doc.setPage(pg); doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); fonte(doc, 7, false);
            doc.text(pt('SYM Online | BAFC | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | P\u00e1g. ' + pg + '/' + tot), 105, 291.5, { align: 'center' });
        }
    }

    function gerar(JsPDF, registro, opcoes) {
        var d = (registro && registro.data) ? registro.data : registro, ix = d.indices || null;
        var doc = new JsPDF({ unit: 'mm', format: 'a4' }), c = { doc: doc, y: 0, titulo2: 'Resultados' };
        pagina1(c, d, ix); pagina2(c, d, ix); pagina3(c, d, ix, opcoes || {}); pagina4(c, d, ix); pagina5(c, d, ix);
        rodape(doc);
        return doc;
    }
    function nomeArquivo(registro) {
        var d = (registro && registro.data) ? registro.data : registro, fd = d.formData || {}, t = new Date();
        function p2(n) { return (n < 10 ? '0' : '') + n; }
        var nome = pt(fd.patientName || 'Paciente').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return 'BAFC_' + nome + '_' + t.getFullYear() + p2(t.getMonth() + 1) + p2(t.getDate()) + '.pdf';
    }
    root.BAFC_PDF = { gerar: gerar, nomeArquivo: nomeArquivo, referencias: referencias };
    if (typeof module !== 'undefined' && module.exports) { module.exports = root.BAFC_PDF; }
})(typeof window !== 'undefined' ? window : this);
