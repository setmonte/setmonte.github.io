// catq-visual.js - Desenho sob medida do CAT-Q (tela de resultados + PDF da escala e do Painel).
// VERSAO OFICIAL (corrigida em 2026-11-09): 25 itens de Hull et al. (2019), na ordem oficial,
// conferidos no formulario oficial (Universidade de Bristol) e no artigo original.
//   Respostas 1-7 (Discordo totalmente ... Concordo totalmente). Itens invertidos: 3, 12, 19, 22, 24 (8 - resposta).
//   Compensacao = 1,4,5,8,11,14,17,20,23 | Mascaramento = 2,6,9,12,15,18,21,24 | Assimilacao = 3,7,10,13,16,19,22,25
// NAO ha ponto de corte validado. O resultado e comparado as medias de referencia por item
// (Hull et al., 2019, Tabela 3): total 4,79 (autistas) x 3,48 (nao autistas); Compensacao 4,42 x 2,89;
// Mascaramento 4,55 x 4,29; Assimilacao 5,29 x 3,32. 100 pontos aparece so como referencia informal.
// Traducao livre para o portugues (decisao do neuropsicologo); existe versao brasileira dos autores em preprint (CAT-Q-BR).
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var ITENS = [
        {texto: 'Quando estou interagindo com algu\u00e9m, copio deliberadamente sua linguagem corporal ou suas express\u00f5es faciais.', sub: 'C', inv: false},
        {texto: 'Monitoro minha linguagem corporal ou minhas express\u00f5es faciais para parecer relaxado(a).', sub: 'M', inv: false},
        {texto: 'Raramente sinto necessidade de "fazer um papel" para conseguir passar por uma situa\u00e7\u00e3o social.', sub: 'A', inv: true},
        {texto: 'Desenvolvi um roteiro para seguir em situa\u00e7\u00f5es sociais (por exemplo, uma lista de perguntas ou de assuntos para conversar).', sub: 'C', inv: false},
        {texto: 'Repito frases que ouvi outras pessoas dizerem, exatamente do mesmo jeito que as ouvi pela primeira vez.', sub: 'C', inv: false},
        {texto: 'Ajusto minha linguagem corporal ou minhas express\u00f5es faciais para parecer interessado(a) na pessoa com quem estou interagindo.', sub: 'M', inv: false},
        {texto: 'Em situa\u00e7\u00f5es sociais, sinto que estou "atuando" em vez de ser eu mesmo(a).', sub: 'A', inv: false},
        {texto: 'Nas minhas intera\u00e7\u00f5es sociais, uso comportamentos que aprendi observando outras pessoas interagindo.', sub: 'C', inv: false},
        {texto: 'Sempre penso na impress\u00e3o que causo nas outras pessoas.', sub: 'M', inv: false},
        {texto: 'Preciso do apoio de outras pessoas para socializar.', sub: 'A', inv: false},
        {texto: 'Pratico minhas express\u00f5es faciais e minha linguagem corporal para garantir que pare\u00e7am naturais.', sub: 'C', inv: false},
        {texto: 'N\u00e3o sinto necessidade de fazer contato visual com outras pessoas se eu n\u00e3o quiser.', sub: 'M', inv: true},
        {texto: 'Tenho que me for\u00e7ar a interagir com as pessoas quando estou em situa\u00e7\u00f5es sociais.', sub: 'A', inv: false},
        {texto: 'Tentei melhorar minha compreens\u00e3o das habilidades sociais observando outras pessoas.', sub: 'C', inv: false},
        {texto: 'Monitoro minha linguagem corporal ou minhas express\u00f5es faciais para parecer interessado(a) na pessoa com quem estou interagindo.', sub: 'M', inv: false},
        {texto: 'Em situa\u00e7\u00f5es sociais, tento encontrar maneiras de evitar interagir com os outros.', sub: 'A', inv: false},
        {texto: 'Pesquisei as regras das intera\u00e7\u00f5es sociais (por exemplo, estudando psicologia ou lendo livros sobre o comportamento humano) para melhorar minhas pr\u00f3prias habilidades sociais.', sub: 'C', inv: false},
        {texto: 'Estou sempre atento(a) \u00e0 impress\u00e3o que causo nas outras pessoas.', sub: 'M', inv: false},
        {texto: 'Sinto-me livre para ser eu mesmo(a) quando estou com outras pessoas.', sub: 'A', inv: true},
        {texto: 'Aprendo como as pessoas usam o corpo e o rosto para interagir assistindo \u00e0 televis\u00e3o ou a filmes, ou lendo fic\u00e7\u00e3o.', sub: 'C', inv: false},
        {texto: 'Ajusto minha linguagem corporal ou minhas express\u00f5es faciais para parecer relaxado(a).', sub: 'M', inv: false},
        {texto: 'Quando converso com outras pessoas, sinto que a conversa flui naturalmente.', sub: 'A', inv: true},
        {texto: 'Passei tempo aprendendo habilidades sociais com programas de televis\u00e3o e filmes, e tento us\u00e1-las nas minhas intera\u00e7\u00f5es.', sub: 'C', inv: false},
        {texto: 'Em intera\u00e7\u00f5es sociais, n\u00e3o presto aten\u00e7\u00e3o ao que meu rosto ou meu corpo est\u00e3o fazendo.', sub: 'M', inv: true},
        {texto: 'Em situa\u00e7\u00f5es sociais, sinto que estou fingindo ser "normal".', sub: 'A', inv: false}
    ];
    var RESP = ['', 'Discordo totalmente', 'Discordo', 'Discordo parcialmente', 'Nem concordo nem discordo', 'Concordo parcialmente', 'Concordo', 'Concordo totalmente'];
    var REF_TOTAL = {aut: 4.79, nao: 3.48};
    var SUBS = [
        {k: 'C', nome: 'Compensa\u00e7\u00e3o', chave: 'Compensacao', cor: '#7b1fa2', aut: 4.42, nao: 2.89,
            desc: 'Estrat\u00e9gias aprendidas para compensar dificuldades sociais: copiar express\u00f5es, seguir roteiros, estudar regras sociais e aprender com TV, filmes e observa\u00e7\u00e3o.'},
        {k: 'M', nome: 'Mascaramento', chave: 'Mascaramento', cor: '#c2185b', aut: 4.55, nao: 4.29,
            desc: 'Monitorar e ajustar o rosto, o corpo e o contato visual para esconder caracter\u00edsticas e transmitir uma imagem esperada (relaxado, interessado).'},
        {k: 'A', nome: 'Assimila\u00e7\u00e3o', chave: 'Assimilacao', cor: '#e65100', aut: 5.29, nao: 3.32,
            desc: 'Esfor\u00e7o para se encaixar: sensa\u00e7\u00e3o de atuar ou fingir ser "normal", for\u00e7ar a intera\u00e7\u00e3o e depender do apoio de outras pessoas.'}
    ];
    var REFS = [
        'HULL, L.; MANDY, W.; LAI, M.-C.; BARON-COHEN, S.; ALLISON, C.; SMITH, P.; PETRIDES, K. V. Development and validation of the Camouflaging Autistic Traits Questionnaire (CAT-Q). Journal of Autism and Developmental Disorders, v. 49, n. 3, p. 819-833, 2019. DOI: 10.1007/s10803-018-3792-6.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var ZONA = [
        {txt: 'Abaixo da m\u00e9dia de n\u00e3o autistas', bg: '#c8e6c9', fg: '#1b5e20', seg: '#66bb6a'},
        {txt: 'Entre as m\u00e9dias de n\u00e3o autistas e de autistas', bg: '#ffe0b2', fg: '#bf5600', seg: '#ffa726'},
        {txt: 'Na m\u00e9dia de autistas ou acima', bg: '#f8bbd0', fg: '#880e4f', seg: '#d81b60'}
    ];
    function zona(m, ref) { return m < ref.nao ? ZONA[0] : (m < ref.aut ? ZONA[1] : ZONA[2]); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function fmt(n, d) { return Number(n).toFixed(d === undefined ? 2 : d).replace('.', ','); }
    function lista(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }

    // ===================== CALCULO =====================
    // vals: 25 respostas BRUTAS (1 a 7), na ordem oficial
    function calcular(vals) {
        if (!vals || vals.length !== ITENS.length) throw new Error('CAT-Q: respostas incompletas');
        var r = {bruto: [], pont: [], subs: [], total: 0}, i, k;
        for (i = 0; i < ITENS.length; i++) {
            var b = parseInt(vals[i], 10);
            if (!(b >= 1 && b <= 7)) throw new Error('CAT-Q: resposta invalida no item ' + (i + 1));
            var v = ITENS[i].inv ? 8 - b : b;
            r.bruto.push(b); r.pont.push(v); r.total += v;
        }
        for (k = 0; k < SUBS.length; k++) {
            var S = SUBS[k], soma = 0, itens = [], altos = [];
            for (i = 0; i < ITENS.length; i++) {
                if (ITENS[i].sub !== S.k) continue;
                soma += r.pont[i]; itens.push(i + 1); if (r.pont[i] >= 6) altos.push(i + 1);
            }
            var media = soma / itens.length;
            r.subs.push({k: S.k, nome: S.nome, chave: S.chave, cor: S.cor, desc: S.desc, ref: {aut: S.aut, nao: S.nao},
                soma: soma, min: itens.length, max: itens.length * 7, media: parseFloat(media.toFixed(2)), mediaRaw: media, z: zona(media, S), itens: itens, altos: altos});
        }
        r.media = r.total / ITENS.length;
        r.z = zona(r.media, REF_TOTAL);
        r.classificacao = 'Camuflagem total ' + r.total + '/175 (media ' + r.media.toFixed(2) + ' por item) - ' + r.z.txt.replace(/\u00e9/g, 'e').replace(/\u00e3/g, 'a') + ' [CAT-Q oficial]';
        return r;
    }
    function dadosPainel(r) {
        var o = {};
        for (var i = 0; i < r.subs.length; i++) {
            var s = r.subs[i];
            o[s.chave] = {pontuacao: s.soma, max: s.max, media: s.media, classificacao: s.z.txt};
        }
        return o;
    }

    function analise(r) {
        var out = [], i, maior = null;
        out.push({t: 'Camuflagem total', x: 'Escore total ' + r.total + ' (de 25 a 175), m\u00e9dia de ' + fmt(r.media) + ' por item (escala de 1 a 7). Comparado \u00e0s m\u00e9dias de refer\u00eancia do estudo original (n\u00e3o autistas: 3,48; autistas: 4,79), o resultado fica na faixa: ' + r.z.txt.toLowerCase() + '. Quanto maior o escore, mais estrat\u00e9gias de camuflagem a pessoa relata usar.'});
        for (i = 0; i < r.subs.length; i++) {
            var s = r.subs[i];
            if (!maior || s.mediaRaw > maior.mediaRaw) maior = s;
            out.push({t: s.nome, x: 'Pontua\u00e7\u00e3o ' + s.soma + ' (de ' + s.min + ' a ' + s.max + '), m\u00e9dia ' + fmt(s.media) + ' por item. Refer\u00eancias: n\u00e3o autistas ' + fmt(s.ref.nao) + ', autistas ' + fmt(s.ref.aut) + '. Faixa: ' + s.z.txt.toLowerCase() + '.' + (s.altos.length ? ' Itens com maior concord\u00e2ncia (6 ou 7, j\u00e1 com a invers\u00e3o): ' + s.altos.join(', ') + '.' : ''), cor: s.cor});
        }
        out.push({t: 'Estrat\u00e9gia predominante', x: 'A subescala com maior m\u00e9dia foi ' + maior.nome + ' (' + fmt(maior.media) + '). ' + (maior.k === 'C' ? 'Isso sugere uso mais intenso de estrat\u00e9gias aprendidas para compensar dificuldades sociais.' : (maior.k === 'M' ? 'Isso sugere maior monitoramento e ajuste da pr\u00f3pria apresenta\u00e7\u00e3o (rosto, corpo, contato visual).' : 'Isso sugere maior esfor\u00e7o para se encaixar, com sensa\u00e7\u00e3o de atuar ou fingir em situa\u00e7\u00f5es sociais.')) + ' Observa\u00e7\u00e3o: em Mascaramento, as m\u00e9dias de autistas e n\u00e3o autistas s\u00e3o pr\u00f3ximas, por isso essa subescala diferencia menos os grupos.'});
        return out;
    }
    var AVISO = 'O CAT-Q mede estrat\u00e9gias de camuflagem social relatadas pela pr\u00f3pria pessoa. N\u00e3o diagnostica autismo: pessoas n\u00e3o autistas tamb\u00e9m camuflam, e um escore baixo n\u00e3o descarta autismo. N\u00e3o h\u00e1 ponto de corte validado; as faixas comparam o resultado com as m\u00e9dias de refer\u00eancia do estudo original (Hull et al., 2019). Camuflagem elevada \u00e9 comum em mulheres e em pessoas com diagn\u00f3stico tardio, e se associa a ansiedade, depress\u00e3o e menor bem-estar.';
    var NOTA_TRAD = 'Tradu\u00e7\u00e3o livre para o portugu\u00eas dos 25 itens oficiais (Hull et al., 2019). Existe uma vers\u00e3o brasileira dos pr\u00f3prios autores (CAT-Q-BR) ainda em preprint; esta tradu\u00e7\u00e3o pode ser substitu\u00edda por ela quando publicada. Escala de 1 a 7; itens invertidos: 3, 12, 19, 22 e 24.';

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.catv h2{color:#4a148c;margin-bottom:16px;text-align:center}' +
        '.catv h3{color:#4a148c;margin:26px 0 10px;font-size:1.12em}' +
        '.catv-res{padding:18px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.catv-res b{font-size:1.8em;display:block}' +
        '.catv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.catv-reg{position:relative;margin:50px 14px 48px}' +
        '.catv-bar{height:22px;border-radius:11px;background:linear-gradient(90deg,#e8eaf6,#ce93d8 55%,#8e24aa);box-shadow:inset 0 1px 4px rgba(0,0,0,.25)}' +
        '.catv-bol{position:absolute;top:-42px;transform:translateX(-50%);background:#4a148c;color:#fff;padding:3px 12px;border-radius:12px;font-weight:700;white-space:nowrap}' +
        '.catv-bol:after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid #4a148c}' +
        '.catv-ref{position:absolute;top:-4px;height:30px;border-left:3px solid}' +
        '.catv-rl{position:absolute;font-size:.7em;white-space:nowrap;transform:translateX(-50%);line-height:1.2;text-align:center}' +
        '.catv-card{background:#fff;padding:15px 18px 6px;border-radius:10px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.08);border-left:6px solid}' +
        '.catv-topo{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.catv-topo h4{font-size:1.03em}' +
        '.catv-badge{display:inline-block;padding:3px 11px;border-radius:12px;font-size:.78em;font-weight:700}' +
        '.catv-dsc{font-size:.84em;color:#666;margin:4px 0 0}' +
        '.catv-leg{font-size:.8em;color:#555;margin:6px 0 10px}.catv-leg span{display:inline-block;margin-right:14px}' +
        '.catv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:middle;border:1px solid #ccc}' +
        '.catv-ml{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}' +
        '.catv-mr{width:130px;font-size:.84em;font-weight:700}' +
        '.catv-q{min-width:36px;height:34px;padding:0 3px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82em;cursor:help}' +
        '.catv-perfil{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.catv-perfil .catv-box{flex:1 1 260px;margin:0}' +
        '.catv-nota{background:#f3e5f5;border-left:4px solid #7b1fa2;padding:12px 15px;border-radius:8px;font-size:.85em;color:#4a148c;margin-top:12px}' +
        '.catv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('catv-css')) return;
        var st = document.createElement('style'); st.id = 'catv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    // cor do quadradinho (pontuacao 1-7, ja com inversao)
    function corQ(v) {
        var c = [null, '#eceff1', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#8e24aa', '#4a148c'];
        return {bg: c[v], fg: v >= 6 ? '#ffffff' : '#4a148c'};
    }
    function pct(m) { return ((m - 1) / 6 * 100).toFixed(2); }
    function reguaHTML(media, ref, cor, rotulo) {
        var h = '<div class="catv-reg"><div class="catv-bol" style="left:' + pct(media) + '%;background:' + cor + '">' + rotulo + '</div><div class="catv-bar"></div>';
        h += '<div class="catv-ref" style="left:' + pct(ref.nao) + '%;border-color:#2e7d32"></div><div class="catv-ref" style="left:' + pct(ref.aut) + '%;border-color:#880e4f"></div>';
        h += '<div class="catv-rl" style="left:' + pct(ref.nao) + '%;top:30px;color:#2e7d32">n\u00e3o autistas<br><b>' + fmt(ref.nao) + '</b></div>';
        h += '<div class="catv-rl" style="left:' + pct(ref.aut) + '%;top:30px;color:#880e4f">autistas<br><b>' + fmt(ref.aut) + '</b></div>';
        h += '<div class="catv-rl" style="left:0;transform:none;top:-18px;color:#777">1</div><div class="catv-rl" style="left:100%;transform:translateX(-100%);top:-18px;color:#777">7</div></div>';
        return h;
    }
    function svgPerfil(r) {
        var cx = 130, cy = 128, R = 92, i, ang = [-90, 30, 150], pts = [], ptsA = [], ptsN = [], h = '<svg width="260" height="250" viewBox="0 0 260 250" role="img" aria-label="Tri\u00e2ngulo do perfil">';
        function p(a, f) { var rr = a * Math.PI / 180; return [(cx + Math.cos(rr) * R * f).toFixed(1), (cy + Math.sin(rr) * R * f).toFixed(1)]; }
        function f(m) { return Math.max(0.03, (m - 1) / 6); }
        for (var g = 1; g <= 3; g++) { h += '<polygon points="' + [p(ang[0], g / 3), p(ang[1], g / 3), p(ang[2], g / 3)].join(' ') + '" fill="none" stroke="#e0e0e0"/>'; }
        for (i = 0; i < 3; i++) { var e = p(ang[i], 1); h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '" stroke="#e0e0e0"/>'; }
        for (i = 0; i < 3; i++) { ptsN.push(p(ang[i], f(r.subs[i].ref.nao))); ptsA.push(p(ang[i], f(r.subs[i].ref.aut))); pts.push(p(ang[i], f(r.subs[i].mediaRaw))); }
        h += '<polygon points="' + ptsN.join(' ') + '" fill="none" stroke="#2e7d32" stroke-width="1.5" stroke-dasharray="4 3"/>';
        h += '<polygon points="' + ptsA.join(' ') + '" fill="none" stroke="#880e4f" stroke-width="1.5" stroke-dasharray="4 3"/>';
        h += '<polygon points="' + pts.join(' ') + '" fill="rgba(123,31,162,.25)" stroke="#4a148c" stroke-width="2.5"/>';
        for (i = 0; i < 3; i++) {
            var l = p(ang[i], 1.2);
            h += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="5" fill="' + r.subs[i].cor + '"/>';
            h += '<text x="' + l[0] + '" y="' + l[1] + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + r.subs[i].cor + '">' + r.subs[i].nome + ' ' + fmt(r.subs[i].media, 1) + '</text>';
        }
        return h + '</svg>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, h = '<div class="catv"><h2>&#129504; Resultados CAT-Q</h2>';
        h += '<div class="catv-res" style="background:' + r.z.bg + ';border-color:' + r.z.seg + ';color:' + r.z.fg + '"><b>' + r.total + ' / 175</b>Camuflagem total \u2014 m\u00e9dia ' + fmt(r.media) + ' por item \u00b7 ' + r.z.txt + '</div>';
        h += '<h3>&#128207; Onde est\u00e1 a camuflagem total? (m\u00e9dia por item, 1 a 7)</h3>';
        h += '<div class="catv-box">O CAT-Q n\u00e3o tem ponto de corte. A r\u00e9gua mostra a m\u00e9dia da pessoa ao lado das m\u00e9dias de refer\u00eancia do estudo original: verde = adultos n\u00e3o autistas, vinho = adultos autistas. (Refer\u00eancia informal citada por algumas fontes: 100 pontos no total, cerca de 4 por item.)</div>';
        h += reguaHTML(r.media, REF_TOTAL, '#4a148c', fmt(r.media));
        h += '<h3>&#129513; Subescalas</h3>';
        for (i = 0; i < r.subs.length; i++) {
            var s = r.subs[i];
            h += '<div class="catv-card" style="border-left-color:' + s.cor + '"><div class="catv-topo"><h4 style="color:' + s.cor + '">' + s.nome + ' \u2014 ' + s.soma + ' de ' + s.max + '</h4><span class="catv-badge" style="background:' + s.z.bg + ';color:' + s.z.fg + '">' + s.z.txt + '</span></div>';
            h += '<p class="catv-dsc">' + s.desc + '</p>' + reguaHTML(s.mediaRaw, s.ref, s.cor, fmt(s.media)) + '</div>';
        }
        h += '<h3>&#128314; Perfil de camuflagem</h3><div class="catv-perfil">' + svgPerfil(r) +
            '<div class="catv-box">Cada ponta \u00e9 uma subescala (m\u00e9dia de 1 a 7). O tri\u00e2ngulo roxo \u00e9 a pessoa; a linha tracejada verde \u00e9 a m\u00e9dia de n\u00e3o autistas e a vinho, a de autistas. Assim d\u00e1 para ver em que tipo de camuflagem o relato se aproxima de cada grupo.</div></div>';
        h += '<h3>&#128506;&#65039; Mapa das 25 respostas</h3>';
        h += '<div class="catv-leg">Cor mais escura = mais camuflagem (pontua\u00e7\u00e3o de 1 a 7, j\u00e1 com os itens invertidos, marcados com R). Passe o mouse ou toque para ver a frase.</div>';
        for (i = 0; i < r.subs.length; i++) {
            var sm = r.subs[i];
            h += '<div class="catv-ml"><div class="catv-mr" style="color:' + sm.cor + '">' + sm.nome + '</div>';
            for (k = 0; k < sm.itens.length; k++) {
                var n = sm.itens[k], c = corQ(r.pont[n - 1]);
                h += '<div class="catv-q" style="background:' + c.bg + ';color:' + c.fg + '" title="Item ' + n + ': ' + esc(ITENS[n - 1].texto) + ' | Resposta: ' + RESP[r.bruto[n - 1]] + (ITENS[n - 1].inv ? ' (item invertido)' : '') + '">' + n + (ITENS[n - 1].inv ? 'R' : '') + '</div>';
            }
            h += '</div>';
        }
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise do perfil</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="catv-box"' + (an[i].cor ? ' style="border-left:5px solid ' + an[i].cor + '"' : '') + '><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="catv-nota">' + NOTA_TRAD + '</div>';
        h += '<div class="catv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
        return h;
    }

    // ===================== PDF =====================
    var CW = 180, ML = 15, AZ = '#4a148c';
    function rgb(hx) { hx = hx.replace('#', ''); return [parseInt(hx.substr(0, 2), 16), parseInt(hx.substr(2, 2), 16), parseInt(hx.substr(4, 2), 16)]; }
    function F(doc, hx) { var c = rgb(hx); doc.setFillColor(c[0], c[1], c[2]); }
    function T(doc, hx) { var c = rgb(hx); doc.setTextColor(c[0], c[1], c[2]); }
    function D(doc, hx) { var c = rgb(hx); doc.setDrawColor(c[0], c[1], c[2]); }
    function pt(s) {
        return String(s == null ? '' : s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
            .replace(/\u2026/g, '...').replace(/\u00a0/g, ' ').replace(/\u00b7/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, AZ); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AZ); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto, cor) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        if (cor) { F(doc, cor); doc.rect(ML, c.y, 1.6, h, 'F'); }
        var yy = c.y + 4.6;
        if (titulo) { T(doc, cor || AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }
    function badge(doc, xDir, y, texto, bg, fg) {
        doc.setFont(undefined, 'bold'); doc.setFontSize(7.3);
        var tw = doc.getTextWidth(pt(texto)) + 6;
        F(doc, bg); doc.roundedRect(xDir - tw, y, tw, 5.4, 2.6, 2.6, 'F');
        T(doc, fg); doc.text(pt(texto), xDir - tw / 2, y + 3.8, {align: 'center'});
    }
    function reguaPDF(doc, x0, y, w, media, ref, cor, rotulo) {
        var stops = [[0, [232, 234, 246]], [0.55, [206, 147, 216]], [1, [142, 36, 170]]], n = 80;
        for (var i = 0; i < n; i++) {
            var t = (i + 0.5) / n, a = t < 0.55 ? stops[0] : stops[1], b = t < 0.55 ? stops[1] : stops[2], u = (t - a[0]) / (b[0] - a[0]);
            doc.setFillColor(Math.round(a[1][0] + (b[1][0] - a[1][0]) * u), Math.round(a[1][1] + (b[1][1] - a[1][1]) * u), Math.round(a[1][2] + (b[1][2] - a[1][2]) * u));
            doc.rect(x0 + i * w / n, y, w / n + 0.2, 5, 'F');
        }
        function px(m) { return x0 + (m - 1) / 6 * w; }
        doc.setLineWidth(0.8); D(doc, '#2e7d32'); doc.line(px(ref.nao), y - 1.2, px(ref.nao), y + 6.2);
        D(doc, '#880e4f'); doc.line(px(ref.aut), y - 1.2, px(ref.aut), y + 6.2);
        doc.setFont(undefined, 'normal'); doc.setFontSize(6.8);
        T(doc, '#2e7d32'); doc.text(pt('n\u00e3o autistas ' + fmt(ref.nao)), px(ref.nao), y + 9.5, {align: 'center'});
        T(doc, '#880e4f'); doc.text(pt('autistas ' + fmt(ref.aut)), px(ref.aut), y + (Math.abs(px(ref.aut) - px(ref.nao)) < 22 ? 13 : 9.5), {align: 'center'});
        T(doc, '#888888'); doc.text('1', x0, y - 1.5); doc.text('7', x0 + w, y - 1.5, {align: 'right'});
        var mx = px(media);
        doc.setFont(undefined, 'bold'); doc.setFontSize(8); var tw = doc.getTextWidth(rotulo) + 5;
        F(doc, cor); doc.roundedRect(mx - tw / 2, y - 9.6, tw, 5.6, 2, 2, 'F'); doc.triangle(mx - 1.8, y - 4.1, mx + 1.8, y - 4.1, mx, y - 1.2, 'F');
        T(doc, '#ffffff'); doc.text(rotulo, mx, y - 5.6, {align: 'center'});
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#e91e63'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('CAT-Q - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Question\u00e1rio de Camuflagem de Tra\u00e7os Autistas (Camouflaging Autistic Traits Questionnaire)'), 105, 22, {align: 'center'});
        doc.text(pt('Hull et al. (2019) | 25 itens oficiais | tradu\u00e7\u00e3o livre'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 20, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 20, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + '   |   Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 17);
        c.y = 67;

        F(doc, r.z.bg); doc.rect(ML, c.y, CW, 18, 'F'); D(doc, r.z.seg); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 18, 'S');
        T(doc, r.z.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(14); doc.text(r.total + ' / 175', 105, c.y + 7.6, {align: 'center'});
        doc.setFontSize(9); doc.text(pt('Camuflagem total - m\u00e9dia ' + fmt(r.media) + ' por item - ' + r.z.txt), 105, c.y + 13.8, {align: 'center'});
        c.y += 24;

        secao(c, 'CAMUFLAGEM TOTAL (m\u00e9dia por item, 1 a 7)');
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        doc.text(doc.splitTextToSize(pt('Sem ponto de corte validado. Linhas: m\u00e9dia de adultos n\u00e3o autistas (verde) e de autistas (vinho) no estudo original. Refer\u00eancia informal citada por algumas fontes: 100 pontos no total (cerca de 4 por item).'), CW - 4), ML + 2, c.y);
        c.y += 14;
        reguaPDF(doc, ML + 10, c.y, CW - 20, r.media, REF_TOTAL, AZ, fmt(r.media));
        c.y += 18;

        secao(c, 'SUBESCALAS');
        for (i = 0; i < r.subs.length; i++) {
            var s = r.subs[i];
            doc.setFont(undefined, 'normal'); doc.setFontSize(7.6);
            var dl = doc.splitTextToSize(pt(s.desc), CW - 10), hC = 12 + dl.length * 3.4 + 24;
            c.need(hC + 3);
            F(doc, '#ffffff'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, hC, 2, 2, 'FD');
            F(doc, s.cor); doc.rect(ML, c.y, 1.8, hC, 'F');
            T(doc, s.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(10); doc.text(pt(s.nome + ' - ' + s.soma + ' de ' + s.max), ML + 5, c.y + 6);
            badge(doc, ML + CW - 3, c.y + 2.2, s.z.txt, s.z.bg, s.z.fg);
            T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.6); doc.text(dl, ML + 5, c.y + 11);
            reguaPDF(doc, ML + 12, c.y + 12 + dl.length * 3.4 + 9, CW - 24, s.mediaRaw, s.ref, s.cor, fmt(s.media));
            c.y += hC + 3;
        }

        // Perfil (triangulo)
        c.need(76);
        secao(c, 'PERFIL DE CAMUFLAGEM');
        var tcx = ML + 42, tcy = c.y + 34, R = 27, ang = [-90, 30, 150];
        function P(a, f) { var rr = a * Math.PI / 180; return [tcx + Math.cos(rr) * R * f, tcy + Math.sin(rr) * R * f]; }
        function fr(m) { return Math.max(0.03, (m - 1) / 6); }
        D(doc, '#e0e0e0'); doc.setLineWidth(0.25);
        for (var g = 1; g <= 3; g++) { var A1 = P(ang[0], g / 3), B1 = P(ang[1], g / 3), C1 = P(ang[2], g / 3); doc.triangle(A1[0], A1[1], B1[0], B1[1], C1[0], C1[1], 'S'); }
        function tri(arr, modo) { doc.triangle(arr[0][0], arr[0][1], arr[1][0], arr[1][1], arr[2][0], arr[2][1], modo); }
        var pN = [], pA = [], pp = [];
        for (k = 0; k < 3; k++) { pN.push(P(ang[k], fr(r.subs[k].ref.nao))); pA.push(P(ang[k], fr(r.subs[k].ref.aut))); pp.push(P(ang[k], fr(r.subs[k].mediaRaw))); }
        F(doc, '#e1bee7'); D(doc, AZ); doc.setLineWidth(0.8); tri(pp, 'FD');
        if (doc.setLineDashPattern) doc.setLineDashPattern([1.2, 1], 0);
        doc.setLineWidth(0.5); D(doc, '#2e7d32'); tri(pN, 'S'); D(doc, '#880e4f'); tri(pA, 'S');
        if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
        for (k = 0; k < 3; k++) {
            F(doc, r.subs[k].cor); doc.circle(pp[k][0], pp[k][1], 1.6, 'F');
            var L1 = P(ang[k], 1.3);
            T(doc, r.subs[k].cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8);
            doc.text(pt(r.subs[k].nome + ' ' + fmt(r.subs[k].media, 1)), L1[0], L1[1] + 1, {align: 'center'});
        }
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        doc.text(doc.splitTextToSize(pt('Cada ponta \u00e9 uma subescala (m\u00e9dia de 1 a 7). \u00c1rea roxa = a pessoa. Tracejado verde = m\u00e9dia de n\u00e3o autistas; tracejado vinho = m\u00e9dia de autistas (Hull et al., 2019).'), 84), ML + 96, c.y + 20);
        c.y += 72;

        // Mapa
        c.need(40);
        secao(c, 'MAPA DAS 25 RESPOSTAS');
        T(doc, '#555555'); doc.setFont(undefined, 'normal'); doc.setFontSize(7.4);
        doc.text(pt('Cor mais escura = mais camuflagem (1 a 7, j\u00e1 com os itens invertidos, marcados com R).'), ML + 2, c.y); c.y += 4;
        for (i = 0; i < r.subs.length; i++) {
            var sm = r.subs[i], qx = ML + 34;
            T(doc, sm.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.6); doc.text(pt(sm.nome), ML + 2, c.y + 5.4);
            for (k = 0; k < sm.itens.length; k++) {
                var n = sm.itens[k], cq = corQ(r.pont[n - 1]), qw = ITENS[n - 1].inv ? 12 : 10;
                F(doc, cq.bg); doc.roundedRect(qx, c.y, qw, 8, 1.4, 1.4, 'F');
                T(doc, cq.fg); doc.setFont(undefined, 'bold'); doc.setFontSize(7.8); doc.text(n + (ITENS[n - 1].inv ? 'R' : ''), qx + qw / 2, c.y + 5.3, {align: 'center'});
                qx += qw + 2;
            }
            c.y += 10.5;
        }
        c.y += 3;

        c.need(30);
        secao(c, 'AN\u00c1LISE DO PERFIL');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x, an[i].cor);
        caixa(c, 'Nota sobre a tradu\u00e7\u00e3o', NOTA_TRAD, AZ);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 4;

        // Respostas por subescala
        c.need(70);
        secao(c, 'RESPOSTAS DO PACIENTE POR SUBESCALA');
        for (i = 0; i < r.subs.length; i++) {
            var sx = r.subs[i];
            c.need(16);
            F(doc, '#f3e5f5'); doc.rect(ML, c.y, CW, 6.4, 'F');
            T(doc, sx.cor); doc.setFont(undefined, 'bold'); doc.setFontSize(8.8); doc.text(pt(sx.nome), ML + 3, c.y + 4.4);
            badge(doc, ML + CW - 2, c.y + 0.5, 'm\u00e9dia ' + fmt(sx.media), sx.z.bg, sx.z.fg);
            c.y += 8.6;
            for (k = 0; k < sx.itens.length; k++) {
                var ni = sx.itens[k];
                doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
                var tl = doc.splitTextToSize(pt(ni + '. ' + ITENS[ni - 1].texto + (ITENS[ni - 1].inv ? ' (R)' : '')), 128), hl = tl.length * 3.6 + 1.8;
                c.need(hl);
                T(doc, '#222222'); doc.text(tl, ML + 3, c.y + 3);
                T(doc, '#000000'); doc.setFont(undefined, 'bold');
                doc.text(pt(RESP[r.bruto[ni - 1]] + ' (' + r.bruto[ni - 1] + ')'), ML + CW - 2, c.y + 3, {align: 'right'});
                c.y += hl;
            }
            c.y += 3;
        }
        c.need(8);
        T(doc, '#828282'); doc.setFont(undefined, 'italic'); doc.setFontSize(7);
        doc.text(pt('(R) = item invertido (pontua\u00e7\u00e3o = 8 - resposta). As respostas mostradas s\u00e3o as marcadas pelo paciente.'), ML, c.y + 3);
        c.y += 8;

        c.need(30);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(9);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.4 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.4 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var p = 1; p <= tot; p++) {
            doc.setPage(p);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | CAT-Q | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + p + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('CATQ_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    // ===================== PAINEL =====================
    // So registros da versao oficial (d.versaoOficial) podem ser redesenhados; os antigos usavam
    // outras perguntas e nao podem ser recalculados (o painel mostra o PDF generico com nota).
    var NOTA_ANTIGO = 'ATEN\u00c7\u00c3O: este registro foi aplicado com uma vers\u00e3o N\u00c3O OFICIAL do CAT-Q que existia no site antes de 09/11/2026 (perguntas, subescalas e ponto de corte diferentes do instrumento original de Hull et al., 2019). O resultado n\u00e3o \u00e9 compar\u00e1vel ao CAT-Q oficial e n\u00e3o pode ser recalculado. Recomenda-se reaplicar a vers\u00e3o oficial.';
    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'CAT-Q' || !d.versaoOficial || !d.respostasBrutas) return false;
        var vals = [];
        for (var i = 1; i <= ITENS.length; i++) {
            var v = parseInt(d.respostasBrutas[i], 10);
            if (!(v >= 1 && v <= 7)) return false;
            vals.push(v);
        }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_CATQ = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, ITENS: ITENS, RESP: RESP, NOTA_ANTIGO: NOTA_ANTIGO};
})();
