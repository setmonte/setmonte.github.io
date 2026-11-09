// pdf-rbq-bsl.js - Gerador de PDF visual das escalas RBQ-2A e BSL-23.
// Usado pela pagina de cada escala E pelo Painel (online/index.html), para que o PDF
// tenha o mesmo visual da tela de resultados (reguas, mapa de respostas, cartoes, barras).
// Recebe so os dados basicos + as respostas e recalcula tudo aqui dentro.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';
    var CW = 180, ML = 15;

    // ---------- utilitarios ----------
    function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
    function F(doc, h) { var c = rgb(h); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, h) { var c = rgb(h); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, h) { var c = rgb(h); doc.setDrawColor(c[0], c[1], c[2]); }
    function fmt(n, d) { return n.toFixed(d === undefined ? 2 : d).replace('.', ','); }
    function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
    function hex(c) {
        var s = '#';
        for (var i = 0; i < 3; i++) { var h = Math.max(0, Math.min(255, c[i])).toString(16); s += (h.length < 2 ? '0' : '') + h; }
        return s;
    }
    function colorAt(stops, t) {
        if (t <= stops[0][0]) return stops[0][1];
        for (var i = 1; i < stops.length; i++) {
            if (t <= stops[i][0]) {
                var a = stops[i - 1], b = stops[i];
                var u = (t - a[0]) / (b[0] - a[0]);
                var ca = rgb(a[1]), cb = rgb(b[1]);
                return hex([lerp(ca[0], cb[0], u), lerp(ca[1], cb[1], u), lerp(ca[2], cb[2], u)]);
            }
        }
        return stops[stops.length - 1][1];
    }
    function gradBar(doc, x, y, w, h, stops) {
        var n = 100;
        for (var i = 0; i < n; i++) { F(doc, colorAt(stops, (i + 0.5) / n)); doc.rect(x + i * w / n, y, w / n + 0.25, h, 'F'); }
    }
    function dataBR(s) {
        if (!s) return new Date().toLocaleDateString('pt-BR');
        var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return m[3] + '/' + m[2] + '/' + m[1];
        return String(s);
    }
    function limpa(s) { return String(s || '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim(); }

    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };

    function cabecalho(doc, titulo, sub1, sub2, cor) {
        F(doc, cor); doc.rect(0, 0, 210, 35, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(titulo, 105, 15, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(sub1, 105, 23, {align: 'center'});
        doc.text(sub2, 105, 29, {align: 'center'});
    }
    function dadosBox(c, info, cor) {
        var doc = c.doc, y = 42;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F');
        F(doc, cor); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, cor); doc.setFontSize(10); doc.setFont(undefined, 'bold');
        doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text('Nome: ' + limpa(info.nome) + '   |   Sexo: ' + limpa(info.sexo), 20, y + 12);
        doc.text('Idade: ' + limpa(info.idade) + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + limpa(info.idPaciente) : ''), 20, y + 17);
        c.y = 68;
    }
    function secao(c, t, cor) {
        c.need(16);
        var doc = c.doc;
        F(doc, cor); doc.rect(ML, c.y, 1.6, 6.2, 'F');
        T(doc, cor); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
        doc.text(t, ML + 4, c.y + 4.8);
        c.y += 10;
    }
    function caixaTexto(c, titulo, texto, corTit) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var lines = doc.splitTextToSize(texto, CW - 8);
        var h = (titulo ? 5.5 : 0) + lines.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2);
        doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, corTit || '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(titulo, ML + 4, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        doc.text(lines, ML + 4, yy);
        c.y += h + 3;
    }
    function bolha(doc, cx, y, texto, cor) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(9);
        var tw = doc.getTextWidth(texto) + 7;
        F(doc, cor); doc.roundedRect(cx - tw / 2, y, tw, 6.5, 2.5, 2.5, 'F');
        doc.triangle(cx - 2.2, y + 6.4, cx + 2.2, y + 6.4, cx, y + 9, 'F');
        T(doc, '#ffffff'); doc.text(texto, cx, y + 4.6, {align: 'center'});
    }
    function legenda(c, itens) {
        var doc = c.doc, x = ML, y = c.y + 3;
        doc.setFontSize(7.5); doc.setFont(undefined, 'normal');
        for (var i = 0; i < itens.length; i++) {
            var w = doc.getTextWidth(itens[i].t) + 9;
            if (x + w > ML + CW) { x = ML; y += 5; }
            F(doc, itens[i].c); D(doc, '#bdbdbd'); doc.setLineWidth(0.15); doc.roundedRect(x, y - 2.8, 3.4, 3.4, 0.6, 0.6, 'FD');
            T(doc, '#555555'); doc.text(itens[i].t, x + 5, y);
            x += w + 3;
        }
        c.y = y + 4;
    }
    function mapa(c, n, valFn, corFn) {
        var doc = c.doc, s = 9, g = 2.4, per = Math.floor((CW + g) / (s + g));
        var rows = Math.ceil(n / per);
        c.need(rows * (s + g) + 2);
        doc.setFont(undefined, 'bold'); doc.setFontSize(9);
        for (var i = 0; i < n; i++) {
            var x = ML + (i % per) * (s + g), y = c.y + Math.floor(i / per) * (s + g);
            var cc = corFn(valFn(i));
            F(doc, cc.bg); doc.roundedRect(x, y, s, s, 1.6, 1.6, 'F');
            T(doc, cc.fg); doc.text(String(i + 1), x + s / 2, y + 6.1, {align: 'center'});
        }
        c.y += rows * (s + g) + 1;
    }
    function badge(doc, xDir, y, texto, bg, fg) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.5);
        var tw = doc.getTextWidth(texto) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.4, 2.6, 2.6, 'F');
        T(doc, fg); doc.text(texto, xDir - tw / 2, y + 3.8, {align: 'center'});
    }
    function aviso(c, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var lines = doc.splitTextToSize(texto, CW - 8);
        var h = lines.length * 3.8 + 8;
        c.need(h + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, h, 'F');
        F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, h, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(lines, ML + 4, c.y + 8.6);
        c.y += h + 3;
    }
    function referencias(c, refs, nota, cor) {
        c.need(75);
        secao(c, 'REFER\u00caNCIAS', cor);
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(9); T(doc, '#282828');
        for (var i = 0; i < refs.length; i++) {
            var l = doc.splitTextToSize(refs[i], CW - 4);
            c.need(l.length * 4.4 + 4);
            doc.text(l, ML + 2, c.y + 3); c.y += l.length * 4.4 + 4;
        }
        if (nota) {
            doc.setFontSize(8); T(doc, '#6e6e6e');
            var ln = doc.splitTextToSize(nota, CW - 4);
            c.need(ln.length * 3.8 + 4);
            doc.text(ln, ML + 2, c.y + 3); c.y += ln.length * 3.8 + 4;
        }
    }
    function rodapes(doc, sigla) {
        var total = doc.getNumberOfPages();
        for (var p = 1; p <= total; p++) {
            doc.setPage(p);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | ' + sigla + ' | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + total, 105, 291, {align: 'center'});
        }
    }
    function salvar(doc, sigla, nome) {
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save(sigla + '_' + limpa(nome).replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }
    function novoDoc() { return new window.jspdf.jsPDF(); }

    // =====================================================================
    // RBQ-2A
    // =====================================================================
    var RB_CORTE = 26, RB_M_TEA = 36, RB_M_NTEA = 25, RB_MIN = 20, RB_MAX = 60;
    var RB_FATORES = [
        {nome: "Movimentos Motores Repetitivos", itens: [2, 3, 4, 5, 6], cor: "#00897b", desc: "Movimentos do corpo, das m\u00e3os e dos dedos que se repetem, como balan\u00e7ar, girar, andar de um lado para o outro ou mexer em objetos."},
        {nome: "Rigidez e Rotina", itens: [13, 14, 15, 16, 17, 18, 19], cor: "#ef6c00", desc: "Necessidade de que as coisas fiquem sempre iguais: casa, rotina, roupas, comida e jeito de fazer as coisas. Pequenas mudan\u00e7as podem causar muito desconforto."},
        {nome: "Interesses Restritos", itens: [1, 7, 8, 10, 11, 12, 17], cor: "#5e35b1", desc: "Interesses muito focados ou fora do comum: fascina\u00e7\u00e3o por objetos espec\u00edficos, organizar em padr\u00f5es, colecionar, ter objetos favoritos e repetir as mesmas atividades."},
        {nome: "Interesses Sensoriais Incomuns", itens: [8, 9, 10, 18], cor: "#c2185b", desc: "Interesse ou sensibilidade fora do comum por sensa\u00e7\u00f5es: o jeito de olhar para objetos, cheiros, texturas ao toque e a escolha de roupas."}
    ];
    function rbClasse(m) {
        if (m < 1.5) return {txt: "Pouco presente", cor: "#2e7d32", bg: "#c8e6c9"};
        if (m < 2.0) return {txt: "Presente de forma leve", cor: "#7a5300", bg: "#fff3b0"};
        if (m < 2.5) return {txt: "Moderadamente presente", cor: "#bf360c", bg: "#ffe0b2"};
        return {txt: "Muito presente", cor: "#b71c1c", bg: "#ffcdd2"};
    }
    function rbCalc(vals) {
        var total = 0, i, f, k;
        for (i = 0; i < vals.length; i++) total += vals[i];
        var fat = [];
        for (f = 0; f < RB_FATORES.length; f++) {
            var F0 = RB_FATORES[f], soma = 0, altos = [];
            for (k = 0; k < F0.itens.length; k++) { var v = vals[F0.itens[k] - 1]; soma += v; if (v === 3) altos.push(F0.itens[k]); }
            var n = F0.itens.length, media = soma / n;
            fat.push({nome: F0.nome, desc: F0.desc, cor: F0.cor, itens: F0.itens, soma: soma, min: n, max: n * 3, media: parseFloat(media.toFixed(2)), pct: Math.round((soma - n) / (2 * n) * 100), altos: altos, cl: rbClasse(media)});
        }
        return {total: total, fat: fat};
    }
    function rbAnalise(res) {
        var out = [], total = res.total, pos = total >= RB_CORTE, f;
        var t1 = pos
            ? "O escore total foi " + total + " (de 20 a 60), igual ou acima do ponto de corte de " + RB_CORTE + ". Isso indica rastreio positivo: a pessoa relata uma quantidade de comportamentos repetitivos, rigidez e interesses restritos que merece investiga\u00e7\u00e3o cl\u00ednica."
            : "O escore total foi " + total + " (de 20 a 60), abaixo do ponto de corte de " + RB_CORTE + ". Isso indica rastreio negativo: por este instrumento, o relato n\u00e3o sugere presen\u00e7a marcante de comportamentos repetitivos e rigidez t\u00edpicos do espectro autista.";
        out.push({t: "Resultado geral", x: t1});
        var d25 = Math.abs(total - RB_M_NTEA), d36 = Math.abs(total - RB_M_TEA);
        var t2 = "Comparando com as m\u00e9dias de refer\u00eancia do material do instrumento (adultos n\u00e3o autistas: " + RB_M_NTEA + "; adultos autistas: " + RB_M_TEA + "), este escore est\u00e1 mais pr\u00f3ximo da m\u00e9dia de " + (d36 < d25 ? "adultos autistas." : "adultos n\u00e3o autistas.");
        if (pos && d36 >= d25) t2 += " Como o escore est\u00e1 acima do corte, mas ainda perto da m\u00e9dia de adultos n\u00e3o autistas, trata-se de uma faixa de transi\u00e7\u00e3o: vale interpretar com cautela.";
        out.push({t: "Compara\u00e7\u00e3o com as m\u00e9dias de refer\u00eancia", x: t2});
        var frase = {
            "Pouco presente": "aparece pouco ou quase nunca nas respostas.",
            "Presente de forma leve": "aparece de forma leve ou ocasional.",
            "Moderadamente presente": "aparece com frequ\u00eancia relevante e merece aten\u00e7\u00e3o na entrevista cl\u00ednica.",
            "Muito presente": "\u00e9 uma das \u00e1reas mais marcantes do perfil e vale ser explorada em detalhe, inclusive quanto ao impacto no dia a dia."
        };
        var melhor = res.fat[0];
        for (f = 0; f < res.fat.length; f++) {
            var ft = res.fat[f];
            if (ft.media > melhor.media) melhor = ft;
            var x = "Pontua\u00e7\u00e3o " + ft.soma + " de " + ft.max + " (m\u00e9dia " + fmt(ft.media) + " por item, em uma escala de 1 a 3). Este aspecto " + frase[ft.cl.txt];
            if (ft.altos.length) x += " Itens com a resposta mais intensa: " + ft.altos.join(', ') + ".";
            out.push({t: ft.nome, x: x});
        }
        var dest = melhor.media < 1.5 ? "Nenhum dos quatro aspectos se destacou no perfil." : "O aspecto de maior destaque no perfil foi: " + melhor.nome + ".";
        dest += " Observa\u00e7\u00e3o: alguns itens contam em mais de um aspecto (8, 10, 17 e 18), por isso a soma dos aspectos n\u00e3o \u00e9 igual ao escore total.";
        out.push({t: "Destaque do perfil", x: dest});
        return out;
    }

    function rbq2a(info) {
        var vals = info.respostas;
        if (!vals || vals.length !== 20) throw new Error('RBQ-2A: respostas incompletas');
        for (var q = 0; q < 20; q++) { if (!(vals[q] >= 1 && vals[q] <= 3)) throw new Error('RBQ-2A: resposta invalida no item ' + (q + 1)); }
        var res = rbCalc(vals), total = res.total, pos = total >= RB_CORTE, i, f;
        var COR = '#00695c';
        var doc = novoDoc(), c = new Ctx(doc);

        cabecalho(doc, 'RBQ-2A - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O', 'Question\u00e1rio de Comportamentos Repetitivos para Adultos (Barrett et al., 2015)', 'Ponto de corte >= 26 | Escore de 20 a 60', '#004d40');
        dadosBox(c, info, COR);

        // caixa de rastreio
        F(doc, pos ? '#ffcdd2' : '#c8e6c9'); doc.rect(ML, c.y, CW, 12, 'F');
        D(doc, pos ? '#c62828' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 12, 'S');
        T(doc, pos ? '#b71c1c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
        doc.text((pos ? 'RASTREIO POSITIVO' : 'RASTREIO NEGATIVO') + ' - escore ' + total + '/60 (limiar: >=' + RB_CORTE + ')', 105, c.y + 7.8, {align: 'center'});
        c.y += 18;

        // termometro
        secao(c, 'ONDE EST\u00c1 O SEU ESCORE? (20 a 60)', COR);
        c.need(46);
        var x0 = 24, x1 = 186, w = x1 - x0, by = c.y + 13, bh = 7;
        function px(v) { return x0 + (v - RB_MIN) / (RB_MAX - RB_MIN) * w; }
        var p26 = (RB_CORTE - RB_MIN) / (RB_MAX - RB_MIN);
        gradBar(doc, x0, by, w, bh, [[0, '#81c784'], [p26, '#81c784'], [p26 + 0.0001, '#ffd54f'], [0.45, '#ffb74d'], [1, '#ef5350']]);
        doc.setLineWidth(0.7);
        D(doc, '#78909c'); doc.line(px(RB_M_NTEA), by - 1, px(RB_M_NTEA), by + bh + 1);
        D(doc, '#c62828'); doc.line(px(RB_CORTE), by - 1.5, px(RB_CORTE), by + bh + 1.5);
        D(doc, '#37474f'); doc.line(px(RB_M_TEA), by - 1, px(RB_M_TEA), by + bh + 1);
        bolha(doc, px(total), by - 11, String(total), '#004d40');
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.5);
        T(doc, '#455a64'); doc.text('M\u00e9dia sem autismo: 25', px(RB_M_NTEA) - 1.2, by + bh + 5, {align: 'right'});
        T(doc, '#c62828'); doc.setFont(undefined, 'bold'); doc.text('Corte: 26', px(RB_CORTE) + 1.2, by + bh + 5);
        doc.setFont(undefined, 'normal'); T(doc, '#37474f'); doc.text('M\u00e9dia autistas: 36', px(RB_M_TEA), by + bh + 10, {align: 'center'});
        T(doc, '#777777'); doc.text('20 (m\u00ednimo)', x0, by + bh + 10); doc.text('60 (m\u00e1ximo)', x1, by + bh + 10, {align: 'right'});
        c.y = by + bh + 16;

        var an = rbAnalise(res);
        caixaTexto(c, an[0].t, an[0].x, COR);
        caixaTexto(c, an[1].t, an[1].x, COR);

        // mapa
        secao(c, 'MAPA DAS SUAS RESPOSTAS', COR);
        mapa(c, 20, function (k) { return vals[k]; }, function (v) { return v === 1 ? {bg: '#c8e6c9', fg: '#1b5e20'} : (v === 2 ? {bg: '#ffe082', fg: '#7a5300'} : {bg: '#ef9a9a', fg: '#7f0000'}); });
        legenda(c, [{c: '#c8e6c9', t: '1 = raro ou ausente'}, {c: '#ffe082', t: '2 = leve ou intermedi\u00e1rio'}, {c: '#ef9a9a', t: '3 = acentuado ou frequente'}]);
        c.y += 3;

        // aspectos (garante que o titulo nao fique sozinho no fim da pagina)
        c.need(75);
        secao(c, 'PERFIL POR ASPECTO', COR);
        caixaTexto(c, null, 'O escore total \u00e9 dividido em quatro aspectos do crit\u00e9rio B do autismo. A faixa de cada aspecto (de pouco presente a muito presente) \u00e9 uma refer\u00eancia did\u00e1tica baseada na m\u00e9dia das respostas (1 a 3); n\u00e3o \u00e9 um ponto de corte validado.');
        for (f = 0; f < res.fat.length; f++) {
            var ft = res.fat[f];
            doc.setFont(undefined, 'normal'); doc.setFontSize(8);
            var dl = doc.splitTextToSize(ft.desc, CW - 10);
            var h = 11 + dl.length * 3.7 + 3.6 + 4.2 + (ft.altos.length ? 4.2 : 0) + 3.5;
            c.need(h + 3);
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
            F(doc, ft.cor); doc.rect(ML, c.y, 1.8, h, 'F');
            T(doc, ft.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(ft.nome, ML + 5, c.y + 5.6);
            badge(doc, ML + CW - 3, c.y + 2.2, ft.cl.txt, ft.cl.bg, ft.cl.cor);
            T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.text(dl, ML + 5, c.y + 10.8);
            var yb = c.y + 11 + dl.length * 3.7;
            F(doc, '#eceff1'); doc.roundedRect(ML + 5, yb, CW - 10, 3.6, 1.8, 1.8, 'F');
            F(doc, ft.cor); doc.roundedRect(ML + 5, yb, Math.max(3.6, (CW - 10) * ft.pct / 100), 3.6, 1.8, 1.8, 'F');
            T(doc, '#444444'); doc.setFontSize(8);
            doc.text('Pontua\u00e7\u00e3o: ' + ft.soma + ' (de ' + ft.min + ' a ' + ft.max + ')  |  M\u00e9dia por item: ' + fmt(ft.media) + ' (de 1 a 3)  |  Itens: ' + ft.itens.join(', '), ML + 5, yb + 7.6);
            if (ft.altos.length) { T(doc, '#7f0000'); doc.setFontSize(7.5); doc.text('Itens com resposta mais intensa (3): ' + ft.altos.join(', '), ML + 5, yb + 11.8); }
            c.y += h + 3;
        }

        // analise
        secao(c, 'AN\u00c1LISE DO PERFIL', COR);
        for (i = 2; i < an.length; i++) caixaTexto(c, an[i].t, an[i].x, COR);
        aviso(c, 'O RBQ-2A \u00e9 um instrumento de rastreio, n\u00e3o um teste diagn\u00f3stico. Ele funciona como um term\u00f4metro: indica sinais de aten\u00e7\u00e3o, mas n\u00e3o confirma nem descarta Transtorno do Espectro Autista. O diagn\u00f3stico exige avalia\u00e7\u00e3o cl\u00ednica completa. Esta \u00e9 uma tradu\u00e7\u00e3o livre, sem estudo de valida\u00e7\u00e3o brasileira localizado; o ponto de corte e as m\u00e9dias de refer\u00eancia seguem o material de pontua\u00e7\u00e3o do instrumento e n\u00e3o foram verificados em amostra brasileira.');

        referencias(c, [
            'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders: DSM-5-TR. 5. ed., text rev. Washington, DC: APA, 2022.',
            'BARRETT, S. L.; ULJAREVIC, M.; BAKER, E. K.; RICHDALE, A. L.; JONES, C. R. G.; LEEKAM, S. R. The Adult Repetitive Behaviours Questionnaire-2 (RBQ-2A): a self-report measure of restricted and repetitive behaviours. Journal of Autism and Developmental Disorders, v. 45, n. 11, p. 3680-3692, 2015. DOI: 10.1007/s10803-015-2514-6.',
            'BARRETT, S. L.; ULJAREVIC, M.; JONES, C. R. G.; LEEKAM, S. R. Assessing subtypes of restricted and repetitive behaviour using the Adult Repetitive Behaviour Questionnaire-2 in autistic adults. Molecular Autism, v. 9, art. 58, 2018. DOI: 10.1186/s13229-018-0242-4.'
        ], 'Nota: tradu\u00e7\u00e3o livre para o portugu\u00eas, feita para este site. N\u00e3o foi localizado estudo de valida\u00e7\u00e3o brasileira do RBQ-2A. O ponto de corte (26), as m\u00e9dias de refer\u00eancia (25 e 36) e a organiza\u00e7\u00e3o em quatro aspectos seguem o material de pontua\u00e7\u00e3o do instrumento. Os estudos originais (Barrett et al., 2015) descrevem duas dimens\u00f5es: comportamentos motores repetitivos e insist\u00eancia na mesmice.', COR);

        rodapes(doc, 'RBQ-2A');
        salvar(doc, 'RBQ2A', info.nome);
    }

    // =====================================================================
    // BSL-23
    // =====================================================================
    var OPC_SINT = ["Nem um pouco", "Um pouco", "Consideravelmente", "Muito", "Muito fortemente"];
    var OPC_FREQ = ["Nenhuma vez", "Uma vez", "2 a 3 vezes", "4 a 6 vezes", "Diariamente ou com muita frequ\u00eancia"];
    var BS_COMP = ["Autoles\u00e3o", "Disse a outras pessoas que iria se matar", "Tentativa de suic\u00eddio", "Compuls\u00e3o alimentar", "V\u00f4mito provocado", "Comportamentos de alto risco", "Embriaguez", "Uso de drogas il\u00edcitas", "Uso indevido de medicamentos", "Explos\u00f5es de raiva ou brigas f\u00edsicas", "Rela\u00e7\u00f5es sexuais impulsivas"];
    var BS_FAIXAS = [
        {max: 0.3, nome: "Nenhum ou baixo", faixa: "0 a 0,3", cor: "#2e7d32", bg: "#c8e6c9", seg: "#81c784", w: 0.3},
        {max: 0.7, nome: "Suave", faixa: "0,3 a 0,7", cor: "#33691e", bg: "#dcedc8", seg: "#aed581", w: 0.4},
        {max: 1.7, nome: "Moderado", faixa: "0,7 a 1,7", cor: "#7a5f00", bg: "#fff59d", seg: "#fff176", w: 1.0},
        {max: 2.7, nome: "Alto", faixa: "1,7 a 2,7", cor: "#bf5600", bg: "#ffe0b2", seg: "#ffb74d", w: 1.0},
        {max: 3.5, nome: "Muito alto", faixa: "2,7 a 3,5", cor: "#bf360c", bg: "#ffccbc", seg: "#ff7043", w: 0.8},
        {max: 4.01, nome: "Extremamente alto", faixa: "3,5 a 4,0", cor: "#b71c1c", bg: "#ffcdd2", seg: "#e53935", w: 0.5}
    ];
    function bsFaixa(m) { for (var i = 0; i < BS_FAIXAS.length; i++) { if (m < BS_FAIXAS[i].max) return BS_FAIXAS[i]; } return BS_FAIXAS[BS_FAIXAS.length - 1]; }
    function bsCalc(vals) {
        var soma = 0, i;
        for (i = 0; i < 23; i++) soma += vals[i];
        var media = soma / 23, qv = vals[23], comp = [], nPres = 0;
        for (i = 0; i < 11; i++) { var v = vals[24 + i]; comp.push({curto: BS_COMP[i], valor: v, rotulo: OPC_FREQ[v]}); if (v > 0) nPres++; }
        var altos = [];
        for (i = 0; i < 23; i++) { if (vals[i] >= 3) altos.push(i + 1); }
        var ide = [{n: 5, rot: "Pensei em me machucar", v: vals[4]}, {n: 7, rot: "Duvidei do meu direito de viver", v: vals[6]}, {n: 18, rot: "Eu me senti atra\u00edda(o) pela ideia de morrer", v: vals[17]}];
        var risco = [], k;
        for (k = 0; k < ide.length; k++) { if (ide[k].v >= 1) risco.push({rot: "Item " + ide[k].n + " - " + ide[k].rot, resp: OPC_SINT[ide[k].v], alto: ide[k].v >= 2}); }
        for (k = 0; k < 3; k++) { var cv = comp[k].valor; if (cv >= 1) risco.push({rot: "Comportamento - " + comp[k].curto, resp: OPC_FREQ[cv], alto: (k === 0) ? (cv >= 2) : true}); }
        var grave = false;
        for (k = 0; k < risco.length; k++) { if (risco[k].alto) grave = true; }
        return {soma: soma, media: media, faixa: bsFaixa(media), qv: qv, comp: comp, nPres: nPres, altos: altos, risco: risco, grave: grave};
    }
    function bsAnalise(res) {
        var out = [], f = res.faixa, i;
        out.push({t: "Gravidade dos sintomas borderline", x: "A m\u00e9dia dos 23 itens foi " + fmt(res.media) + " (soma " + res.soma + " de 92), o que corresponde \u00e0 faixa \"" + f.nome + "\" (" + f.faixa + "). Esta m\u00e9dia resume o quanto a pessoa sofreu com os sintomas borderline na \u00faltima semana; ela mede gravidade atual dos sintomas e n\u00e3o fecha diagn\u00f3stico."});
        out.push({t: "Itens mais intensos", x: res.altos.length === 0 ? "Nenhum item foi marcado como \"Muito\" ou \"Muito fortemente\"." : "Itens marcados como \"Muito\" ou \"Muito fortemente\": " + res.altos.join(', ') + ". Vale conversar sobre eles na entrevista cl\u00ednica."});
        out.push({t: "Qualidade de vida", x: "A pessoa avaliou a qualidade do seu estado geral de vida na \u00faltima semana em " + res.qv + "% (0% = absolutamente baixo; 100% = excelente). Esta resposta n\u00e3o entra na m\u00e9dia principal e n\u00e3o tem ponto de corte; serve para acompanhar a mudan\u00e7a ao longo do tempo."});
        var cx;
        if (res.nPres === 0) cx = "Nenhum dos 11 comportamentos do BSL complementar foi relatado na \u00faltima semana.";
        else {
            var nomes = [];
            for (i = 0; i < res.comp.length; i++) { if (res.comp[i].valor > 0) nomes.push(res.comp[i].curto + " (" + res.comp[i].rotulo.toLowerCase() + ")"); }
            cx = res.nPres + " de 11 comportamentos foram relatados: " + nomes.join('; ') + ".";
        }
        out.push({t: "Comportamentos (BSL complementar)", x: cx});
        return out;
    }

    function bsl23(info) {
        var vals = info.respostas;
        if (!vals || vals.length !== 35) throw new Error('BSL-23: respostas incompletas');
        var q;
        for (q = 0; q < 35; q++) {
            var v = vals[q];
            if (q === 23) { if (!(v >= 0 && v <= 100)) throw new Error('BSL-23: qualidade de vida invalida'); }
            else if (!(v >= 0 && v <= 4)) throw new Error('BSL-23: resposta invalida no item ' + (q + 1));
        }
        var res = bsCalc(vals), f = res.faixa, i;
        var COR = '#1a237e';
        var doc = novoDoc(), c = new Ctx(doc);

        cabecalho(doc, 'BSL-23 - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O', 'Lista de Sintomas Borderline (Bohus et al., 2009; vers\u00e3o brasileira: Catelan e Nardi, 2021)', 'M\u00e9dia dos 23 itens (0 a 4) | Refer\u00eancia: \u00faltima semana', COR);
        dadosBox(c, info, COR);

        // caixa de gravidade
        F(doc, f.bg); doc.rect(ML, c.y, CW, 19, 'F');
        D(doc, f.cor); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 19, 'S');
        T(doc, f.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
        doc.text('GRAVIDADE DOS SINTOMAS BORDERLINE: ' + f.nome.toUpperCase(), 105, c.y + 7.5, {align: 'center'});
        doc.setFontSize(10.5);
        doc.text('M\u00e9dia ' + fmt(res.media) + ' (de 0 a 4)  |  soma ' + res.soma + ' de 92', 105, c.y + 14.2, {align: 'center'});
        c.y += 24;

        // alerta de risco
        if (res.risco.length > 0) {
            doc.setFontSize(8.5);
            var hA = 9 + res.risco.length * 4.6 + 13;
            c.need(hA + 3);
            F(doc, res.grave ? '#ffebee' : '#fff3e0'); doc.rect(ML, c.y, CW, hA, 'F');
            D(doc, res.grave ? '#c62828' : '#ef6c00'); doc.setLineWidth(0.8); doc.rect(ML, c.y, CW, hA, 'S');
            T(doc, res.grave ? '#b71c1c' : '#bf360c'); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
            doc.text('ALERTA DE RISCO' + (res.grave ? '' : ' (aten\u00e7\u00e3o)') + ' - autoles\u00e3o / idea\u00e7\u00e3o suicida', ML + 4, c.y + 6.4);
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.5);
            for (i = 0; i < res.risco.length; i++) doc.text('- ' + res.risco[i].rot + ': ' + res.risco[i].resp, ML + 5, c.y + 12 + i * 4.6);
            doc.setFont(undefined, 'bold');
            doc.text('Recomenda-se avalia\u00e7\u00e3o imediata do risco. Em crise: CVV 188 (24 horas, gratuito) ou SAMU 192.', ML + 4, c.y + 12 + res.risco.length * 4.6 + 3.2);
            c.y += hA + 5;
        }

        // regua
        secao(c, 'ONDE EST\u00c1 A M\u00c9DIA? (0 a 4)', COR);
        c.need(52);
        var x0 = 24, x1 = 186, w = x1 - x0, by = c.y + 13, bh = 7;
        var xx = x0;
        for (i = 0; i < BS_FAIXAS.length; i++) { var sw = BS_FAIXAS[i].w / 4 * w; F(doc, BS_FAIXAS[i].seg); doc.rect(xx, by, sw + (i < BS_FAIXAS.length - 1 ? 0.2 : 0), bh, 'F'); xx += sw; }
        bolha(doc, x0 + res.media / 4 * w, by - 11, fmt(res.media), COR);
        var lim = [0, 0.3, 0.7, 1.7, 2.7, 3.5, 4];
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.5); T(doc, '#555555');
        for (i = 0; i < lim.length; i++) doc.text(fmt(lim[i], (i === 0 || i === 6) ? 0 : 1), x0 + lim[i] / 4 * w, by + bh + 4.5, {align: 'center'});
        c.y = by + bh + 9;
        // chips das faixas
        var cx0 = ML, cy0 = c.y;
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.3);
        for (i = 0; i < BS_FAIXAS.length; i++) {
            var tx = BS_FAIXAS[i].nome + ': ' + BS_FAIXAS[i].faixa;
            var tw = doc.getTextWidth(tx) + 6;
            if (cx0 + tw > ML + CW) { cx0 = ML; cy0 += 7; }
            F(doc, BS_FAIXAS[i].bg);
            if (BS_FAIXAS[i] === f) { D(doc, BS_FAIXAS[i].cor); doc.setLineWidth(0.7); doc.roundedRect(cx0, cy0, tw, 5.4, 2.6, 2.6, 'FD'); }
            else doc.roundedRect(cx0, cy0, tw, 5.4, 2.6, 2.6, 'F');
            T(doc, BS_FAIXAS[i].cor); doc.text(tx, cx0 + 3, cy0 + 3.8);
            cx0 += tw + 2.5;
        }
        c.y = cy0 + 10;

        var an = bsAnalise(res);
        caixaTexto(c, an[0].t, an[0].x, COR);

        // mapa
        secao(c, 'MAPA DAS RESPOSTAS (23 itens)', COR);
        var CV = [{bg: '#eceff1', fg: '#607d8b'}, {bg: '#c8e6c9', fg: '#1b5e20'}, {bg: '#ffe082', fg: '#7a5300'}, {bg: '#ffb74d', fg: '#6d3a00'}, {bg: '#ef5350', fg: '#ffffff'}];
        mapa(c, 23, function (k) { return vals[k]; }, function (v) { return CV[v]; });
        legenda(c, [{c: CV[0].bg, t: '0 nem um pouco'}, {c: CV[1].bg, t: '1 um pouco'}, {c: CV[2].bg, t: '2 consideravelmente'}, {c: CV[3].bg, t: '3 muito'}, {c: CV[4].bg, t: '4 muito fortemente'}]);
        c.y += 3;
        caixaTexto(c, an[1].t, an[1].x, COR);

        // qualidade de vida
        secao(c, 'QUALIDADE DE VIDA NA \u00daLTIMA SEMANA', COR);
        c.need(34);
        var qy = c.y + 12;
        gradBar(doc, x0, qy, w, 6, [[0, '#ef5350'], [0.5, '#ffd54f'], [1, '#66bb6a']]);
        var qx = x0 + res.qv / 100 * w;
        D(doc, '#1a237e'); doc.setLineWidth(0.9); doc.line(qx, qy - 1, qx, qy + 7);
        bolha(doc, qx, qy - 10.5, res.qv + '%', COR);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.5); T(doc, '#666666');
        doc.text('0% (absolutamente baixo)', x0, qy + 11); doc.text('100% (excelente)', x1, qy + 11, {align: 'right'});
        c.y = qy + 15;
        caixaTexto(c, null, an[2].x);

        // comportamentos
        secao(c, 'COMPORTAMENTOS NA \u00daLTIMA SEMANA (BSL complementar)', COR);
        c.need(11 * 6.4 + 4);
        for (i = 0; i < res.comp.length; i++) {
            var cvv = res.comp[i].valor, rowY = c.y + i * 6.4;
            F(doc, i % 2 === 0 ? '#ffffff' : '#f6f7fb'); doc.rect(ML, rowY, CW, 6.4, 'F');
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.6);
            doc.text((i + 1) + '. ' + res.comp[i].curto, ML + 3, rowY + 4.4);
            var bgc = cvv === 0 ? '#eceff1' : (cvv === 1 ? '#fff9c4' : (cvv === 2 ? '#ffe0b2' : (cvv === 3 ? '#ffccbc' : '#ffcdd2')));
            var fgc = cvv === 0 ? '#607d8b' : (cvv === 1 ? '#7a5f00' : (cvv === 2 ? '#bf5600' : '#b71c1c'));
            badge(doc, ML + CW - 3, rowY + 0.5, res.comp[i].rotulo, bgc, fgc);
        }
        c.y += 11 * 6.4 + 3;
        caixaTexto(c, null, an[3].x);

        aviso(c, 'A BSL-23 \u00e9 um instrumento de autorrelato que mede a gravidade atual (\u00faltima semana) dos sintomas borderline. Ela n\u00e3o diagnostica o Transtorno de Personalidade Borderline e deve ser interpretada junto com entrevista cl\u00ednica, hist\u00f3ria de vida e outros instrumentos. A valida\u00e7\u00e3o brasileira dispon\u00edvel foi feita em amostra n\u00e3o cl\u00ednica. A pergunta de qualidade de vida e o BSL complementar n\u00e3o entram na m\u00e9dia principal e n\u00e3o t\u00eam pontos de corte.');

        referencias(c, [
            'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders: DSM-5-TR. 5. ed., text rev. Washington, DC: APA, 2022.',
            'BOHUS, M. et al. The short version of the Borderline Symptom List (BSL-23): development and initial data on psychometric properties. Psychopathology, v. 42, n. 1, p. 32-39, 2009.',
            'CATELAN, R. F.; NARDI, A. E. Lista de sintomas borderline - BSL-23 - nova vers\u00e3o brasileira. Relat\u00f3rio t\u00e9cnico. 2021. DOI: 10.13140/RG.2.2.29619.76321.',
            'CATELAN, R. F. et al. Psychometric properties of the Borderline Symptom List 23 for Brazilian Portuguese in a nonclinical sample. Primary Care Companion for CNS Disorders, v. 28, 2026. DOI: 10.4088/PCC.26m04184.'
        ], 'Nota: as faixas de gravidade seguem as instru\u00e7\u00f5es de corre\u00e7\u00e3o da vers\u00e3o brasileira (Catelan e Nardi, 2021). A valida\u00e7\u00e3o brasileira dispon\u00edvel foi feita em amostra n\u00e3o cl\u00ednica; par\u00e2metros cl\u00ednicos e teste-reteste ainda precisam ser estudados.', COR);

        rodapes(doc, 'BSL-23');
        salvar(doc, 'BSL23', info.nome);
    }

    window.SYM_PDF = window.SYM_PDF || {};
    window.SYM_PDF.rbq2a = rbq2a;
    window.SYM_PDF.bsl23 = bsl23;
})();
