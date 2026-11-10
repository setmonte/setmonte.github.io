// qcp-visual.js - Desenho sob medida do QCP (tela de resultados + PDF da escala e do Painel).
// Instrumento: Questionario de Crencas da Personalidade (QCP), versao brasileira do PBQ-SF
// (Personality Belief Questionnaire - Short Form; Beck & Beck, 1991; Butler et al., 2007), publicada em Leahy (2019).
// Calculo (identico ao que ja existia): EB do perfil = soma dos itens do perfil (0-4);
// Z = (EB - media clinica) / DP, arredondado a 2 casas. Medias e DP: chave do PBQ-SF em Leahy (2019), amostra clinica.
// As faixas de Z (0,5 / 1,0 / 1,5 / 2,0) sao CRITERIO DO SITE, nao vem da fonte.
// IMPORTANTE: manter este arquivo 100% ASCII (acentos so como \uXXXX).
(function () {
    'use strict';

    var NOMES = {
        'Esquizoide': 'Esquizoide', 'Paranoide': 'Paranoide', 'Passivo-agressiva': 'Passivo-agressiva',
        'Borderline': 'Borderline', 'Histrionica': 'Histri\u00f4nica', 'Antissocial': 'Antissocial',
        'Narcisista': 'Narcisista', 'Dependente': 'Dependente', 'Evitativa': 'Evitativa',
        'Obsessivo-compulsiva': 'Obsessivo-compulsiva'
    };
    var PERFIS = {
        'Esquizoide': {itens: [12, 25, 28, 29, 36, 50, 53], media: 8.99, dp: 5.60},
        'Paranoide': {itens: [3, 13, 14, 17, 24, 48, 49], media: 6.99, dp: 6.22},
        'Passivo-agressiva': {itens: [4, 7, 20, 21, 41, 47, 51], media: 8.09, dp: 5.97},
        'Borderline': {itens: [31, 39, 44, 45, 49, 56, 64, 65], media: 8.07, dp: 6.05},
        'Histrionica': {itens: [8, 22, 34, 37, 52, 54, 55], media: 6.47, dp: 6.09},
        'Antissocial': {itens: [23, 32, 35, 38, 42, 59, 61], media: 4.25, dp: 4.30},
        'Narcisista': {itens: [10, 16, 26, 27, 46, 58, 60], media: 3.42, dp: 4.23},
        'Dependente': {itens: [15, 18, 44, 45, 56, 62, 63], media: 9.26, dp: 6.12},
        'Evitativa': {itens: [1, 2, 5, 31, 33, 39, 43], media: 10.86, dp: 6.46},
        'Obsessivo-compulsiva': {itens: [6, 9, 11, 19, 30, 40, 57], media: 10.56, dp: 7.20}
    };
    var DESC = {
        'Esquizoide': ['Grupo A', 'Cren\u00e7as de que relacionamentos s\u00e3o confusos ou invasivos e de que \u00e9 melhor ficar sozinho, com valoriza\u00e7\u00e3o da independ\u00eancia e da privacidade.'],
        'Paranoide': ['Grupo A', 'Cren\u00e7as de que as pessoas t\u00eam motivos escondidos e v\u00e3o explorar ou prejudicar, com necessidade de ficar em estado de alerta.'],
        'Passivo-agressiva': ['n\u00e3o \u00e9 transtorno do DSM-5-TR', 'Cren\u00e7as de que figuras de autoridade s\u00e3o controladoras e de que regras sufocam, com resist\u00eancia indireta \u00e0s exig\u00eancias externas. Aten\u00e7\u00e3o: o transtorno de personalidade passivo-agressiva n\u00e3o consta como categoria no DSM-5-TR; o perfil descreve apenas as cren\u00e7as.'],
        'Borderline': ['Grupo B', 'Cren\u00e7as de que sentimentos desagrad\u00e1veis fogem do controle, de que n\u00e3o d\u00e1 para confiar nas pessoas e de que tens\u00e3o na rela\u00e7\u00e3o significa fracasso dela, com pensamento do tipo tudo ou nada.'],
        'Histrionica': ['Grupo B', 'Cren\u00e7as de que o valor pessoal depende de entreter, impressionar e ser o centro das aten\u00e7\u00f5es; ser ignorado \u00e9 vivido como horr\u00edvel.'],
        'Antissocial': ['Grupo B', 'Cren\u00e7as de que as regras n\u00e3o valem para si, de que \u00e9 preciso explorar antes de ser explorado e de que se pode obter o que se quer por for\u00e7a ou ast\u00facia.'],
        'Narcisista': ['Grupo B', 'Cren\u00e7as de ser especial e superior, de merecer privil\u00e9gios e de que os outros deveriam atender \u00e0s suas necessidades.'],
        'Dependente': ['Grupo C', 'Cren\u00e7as de ser carente, fr\u00e1gil e indefeso sozinho, com necessidade de algu\u00e9m por perto para decidir e agir e medo de abandono.'],
        'Evitativa': ['Grupo C', 'Cren\u00e7as de que ser exposto como inadequado \u00e9 intoler\u00e1vel e de que se deve evitar situa\u00e7\u00f5es e sentimentos desagrad\u00e1veis a todo custo.'],
        'Obsessivo-compulsiva': ['Grupo C', 'Cren\u00e7as de que erros s\u00e3o intoleravelmente graves, de que \u00e9 preciso desempenho perfeito e de que, sem sistematiza\u00e7\u00e3o, tudo ruir\u00e1.']
    };
    var OPC = ['N\u00e3o acredito nisso', 'Acredito um pouco', 'Acredito moderadamente', 'Acredito muito', 'Acredito totalmente'];
    var TOTAL = 65;
    var REFS = [
        'LEAHY, R. L. T\u00e9cnicas de Terapia Cognitiva: manual do terapeuta. 2. ed. Porto Alegre: Artmed, 2019.',
        'BUTLER, A. C. et al. The Personality Belief Questionnaire-Short Form: development and preliminary findings. Cognitive Therapy and Research, v. 31, n. 3, p. 357-370, 2007. DOI: 10.1007/s10608-006-9041-x.',
        'BECK, A. T.; BUTLER, A. C.; BROWN, G. K.; DAHLSGAARD, K. K.; NEWMAN, C. F.; BECK, J. S. Dysfunctional beliefs discriminate personality disorders. Behaviour Research and Therapy, v. 39, n. 10, p. 1213-1225, 2001. DOI: 10.1016/S0005-7967(00)00099-1.',
        'BECK, A. T.; FREEMAN, A.; DAVIS, D. D. Terapia Cognitiva dos Transtornos da Personalidade. 2. ed. Porto Alegre: Artmed, 2005.',
        'AMERICAN PSYCHIATRIC ASSOCIATION. Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR). 5th ed., text rev. Washington, DC: APA, 2022.'
    ];
    var AVISO = 'O QCP avalia o quanto a pessoa acredita em cren\u00e7as centrais associadas a perfis de personalidade (PBQ-SF); n\u00e3o mede sintomas nem fecha diagn\u00f3stico. Elevar-se em um perfil n\u00e3o equivale a ter o transtorno de personalidade correspondente. Os escores Z comparam a pessoa com uma amostra cl\u00ednica (pacientes psiqui\u00e1tricos), n\u00e3o com a popula\u00e7\u00e3o geral, e as faixas de Z usadas aqui (0,5; 1,0; 1,5; 2,0) s\u00e3o crit\u00e9rio do site, n\u00e3o da fonte original. N\u00e3o substitui avalia\u00e7\u00e3o cl\u00ednica profissional; os resultados devem ser interpretados por profissional qualificado.';

    function nome(k) { return NOMES[k] || k; }
    function z2(v) { return (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', ','); }
    function n2(v) { return v.toFixed(2).replace('.', ','); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function classe(z) {
        if (z >= 2.0) return {txt: 'Muito elevado', cor: '#c62828'};
        if (z >= 1.5) return {txt: 'Elevado', cor: '#e65100'};
        if (z >= 1.0) return {txt: 'Acima da m\u00e9dia', cor: '#f57f17'};
        if (z >= 0.5) return {txt: 'Levemente acima', cor: '#fbc02d'};
        if (z <= -1.0) return {txt: 'Abaixo da m\u00e9dia', cor: '#1565c0'};
        return {txt: 'Dentro da m\u00e9dia', cor: '#4caf50'};
    }

    // ===================== CALCULO =====================
    // resp: array com 65 respostas (0-4)
    function calcular(resp) {
        if (!resp || resp.length !== TOTAL) throw new Error('QCP: respostas incompletas');
        var i, v, r = {perfis: {}, ordem: [], elevados: [], acima: [], total: 0, mediaZ: 0};
        for (i = 0; i < TOTAL; i++) { v = parseInt(resp[i], 10); if (!(v >= 0 && v <= 4)) throw new Error('QCP: resposta invalida no item ' + (i + 1)); }
        Object.keys(PERFIS).forEach(function (k) {
            var p = PERFIS[k], eb = 0;
            p.itens.forEach(function (n) { eb += parseInt(resp[n - 1], 10); });
            var z = parseFloat(((eb - p.media) / p.dp).toFixed(2));
            var c = classe(z);
            r.perfis[k] = {eb: eb, z: z, classificacao: c.txt, cor: c.cor, maxPossivel: p.itens.length * 4, media: p.media, dp: p.dp};
            r.total += eb; r.mediaZ += z;
        });
        r.mediaZ = r.mediaZ / 10;
        r.ordem = Object.keys(r.perfis).sort(function (a, b) { return r.perfis[b].z - r.perfis[a].z; });
        r.elevados = r.ordem.filter(function (k) { return r.perfis[k].z >= 1.5; });
        r.acima = r.ordem.filter(function (k) { return r.perfis[k].z >= 1.0 && r.perfis[k].z < 1.5; });
        return r;
    }
    function dadosPainel(r) {
        var o = {};
        Object.keys(r.perfis).forEach(function (k) {
            o[k] = {pontuacao: r.perfis[k].eb, max: r.perfis[k].maxPossivel, media: r.perfis[k].z, classificacao: r.perfis[k].classificacao};
        });
        return o;
    }
    function classifGeral(r) { return r.elevados.length ? 'Perfis elevados: ' + r.elevados.join(', ') : 'Sem elevacoes significativas'; }
    function analise(r) {
        var out = [], i, k;
        if (r.elevados.length) {
            out.push({t: 'Perfis elevados (Z >= 1,5)', x: r.elevados.map(function (n) { return nome(n) + ' (Z ' + z2(r.perfis[n].z) + ')'; }).join('; ') + '. As cren\u00e7as desses perfis est\u00e3o claramente mais intensas do que a m\u00e9dia da amostra cl\u00ednica.'});
        } else {
            out.push({t: 'Perfis elevados (Z >= 1,5)', x: 'Nenhum perfil ficou 1,5 desvio-padr\u00e3o ou mais acima da m\u00e9dia da amostra cl\u00ednica.'});
        }
        if (r.acima.length) {
            out.push({t: 'Perfis acima da m\u00e9dia (1,0 <= Z < 1,5)', x: r.acima.map(function (n) { return nome(n) + ' (Z ' + z2(r.perfis[n].z) + ')'; }).join('; ') + '.'});
        }
        var rel = r.elevados.concat(r.acima);
        for (i = 0; i < rel.length; i++) {
            k = rel[i];
            out.push({t: nome(k) + ' [' + DESC[k][0] + ']', x: DESC[k][1]});
        }
        out.push({t: 'Eleva\u00e7\u00e3o geral do protocolo', x: 'M\u00e9dia dos Z dos 10 perfis: ' + z2(r.mediaZ) + '. Segundo Butler et al. (2007), a eleva\u00e7\u00e3o geral do perfil sofre influ\u00eancia de sofrimento emocional geral (ex.: depress\u00e3o, ansiedade); o que indica especificidade \u00e9 a diferen\u00e7a entre os perfis. Por isso, interprete os perfis mais altos em compara\u00e7\u00e3o com os demais.' + (r.mediaZ >= 0.5 ? ' Aqui a m\u00e9dia est\u00e1 acima de zero, o que pede aten\u00e7\u00e3o a esse efeito.' : '')});
        out.push({t: 'Itens compartilhados', x: 'Seis itens (31, 39, 44, 45, 49 e 56) contam em dois perfis, por desenho do instrumento. Por isso Borderline, Dependente, Evitativa e Paranoide tendem a se elevar juntos, e esses perfis n\u00e3o s\u00e3o totalmente independentes.'});
        out.push({t: 'Como o escore \u00e9 calculado', x: 'EB = soma das respostas (0 a 4) dos itens do perfil. Z = (EB - m\u00e9dia cl\u00ednica) / desvio-padr\u00e3o. As m\u00e9dias e desvios-padr\u00e3o v\u00eam da chave do PBQ-SF publicada em Leahy (2019), obtidas em amostra cl\u00ednica. As faixas de classifica\u00e7\u00e3o do Z s\u00e3o crit\u00e9rio do site.'});
        return out;
    }

    // ===================== TELA (HTML) =====================
    var CSS = '' +
        '.qcpv h2{color:#4a148c;margin-bottom:16px;text-align:center}' +
        '.qcpv h3{color:#4a148c;margin:26px 0 10px;font-size:1.12em}' +
        '.qcpv-res{padding:16px;border-radius:12px;text-align:center;margin:10px 0;font-weight:700;border:3px solid}' +
        '.qcpv-res b{font-size:1.25em;display:block}' +
        '.qcpv-box{background:#fff;padding:15px 18px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,.06);margin-bottom:10px;font-size:.93em;color:#444;line-height:1.7}' +
        '.qcpv-tab{width:100%;border-collapse:collapse;font-size:.86em;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
        '.qcpv-tab th{background:#4a148c;color:#fff;padding:7px 5px}.qcpv-tab td{padding:7px 6px;border-bottom:1px solid #eee;text-align:center}' +
        '.qcpv-tab td.n{text-align:left;font-weight:700}' +
        '.qcpv-bdg{display:inline-block;padding:3px 10px;border-radius:12px;font-size:.85em;font-weight:700;border:1px solid}' +
        '.qcpv-disc{background:#fff3e0;padding:15px;border-radius:8px;margin-top:20px;border-left:4px solid #ff9800;font-size:.85em;color:#e65100;line-height:1.6}';
    function injetarCSS() {
        if (typeof document === 'undefined' || document.getElementById('qcpv-css')) return;
        var st = document.createElement('style'); st.id = 'qcpv-css'; st.appendChild(document.createTextNode(CSS));
        (document.head || document.body).appendChild(st);
    }
    // grafico de barras divergentes dos escores Z (-2 a +3,5)
    var ZMIN = -2, ZMAX = 3.5;
    function svgZ(r) {
        var W = 640, L = 150, R2 = 20, top = 26, rh = 28, H = top + rh * 10 + 24, aw = W - L - R2;
        function X(z) { z = Math.max(ZMIN, Math.min(ZMAX, z)); return L + (z - ZMIN) / (ZMAX - ZMIN) * aw; }
        var h = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:640px" role="img" aria-label="Escores Z dos 10 perfis do QCP">', z, i, k;
        h += '<rect x="' + X(1.5) + '" y="' + top + '" width="' + (X(ZMAX) - X(1.5)) + '" height="' + (rh * 10) + '" fill="#ffebee"/>';
        for (z = -2; z <= 3; z++) {
            h += '<line x1="' + X(z) + '" y1="' + top + '" x2="' + X(z) + '" y2="' + (top + rh * 10) + '" stroke="' + (z === 0 ? '#555' : '#ddd') + '" stroke-width="' + (z === 0 ? 1.5 : 1) + '"/>';
            h += '<text x="' + X(z) + '" y="' + (top - 8) + '" text-anchor="middle" font-size="11" fill="#666">' + (z > 0 ? '+' : '') + z + '</text>';
        }
        h += '<line x1="' + X(1.5) + '" y1="' + top + '" x2="' + X(1.5) + '" y2="' + (top + rh * 10) + '" stroke="#c62828" stroke-width="2" stroke-dasharray="5 3"/>';
        h += '<text x="' + X(1.5) + '" y="' + (top + rh * 10 + 15) + '" text-anchor="middle" font-size="11" fill="#c62828" font-weight="700">corte de eleva\u00e7\u00e3o (Z 1,5)</text>';
        for (i = 0; i < r.ordem.length; i++) {
            k = r.ordem[i];
            var p = r.perfis[k], y = top + i * rh, x0 = X(0), x1 = X(p.z);
            h += '<text x="' + (L - 8) + '" y="' + (y + 18) + '" text-anchor="end" font-size="12" font-weight="700" fill="#333">' + esc(nome(k)) + '</text>';
            h += '<rect x="' + Math.min(x0, x1) + '" y="' + (y + 5) + '" width="' + Math.max(1, Math.abs(x1 - x0)) + '" height="18" rx="3" fill="' + p.cor + '"/>';
            var tx = p.z >= 0 ? x1 + 5 : x1 - 5;
            h += '<text x="' + tx + '" y="' + (y + 18) + '" text-anchor="' + (p.z >= 0 ? 'start' : 'end') + '" font-size="11" fill="#333">' + z2(p.z) + '</text>';
        }
        return h + '</svg>';
    }
    function htmlTela(r) {
        injetarCSS();
        var i, k, p, h = '<div class="qcpv"><h2>&#129504; Resultados QCP</h2>';
        var el = r.elevados.length > 0;
        h += '<div class="qcpv-res" style="background:' + (el ? '#ffe0b2' : '#c8e6c9') + ';border-color:' + (el ? '#e65100' : '#2e7d32') + ';color:' + (el ? '#bf360c' : '#1b5e20') + '"><b>' +
            (el ? r.elevados.length + (r.elevados.length > 1 ? ' perfis elevados' : ' perfil elevado') + ' (Z \u2265 1,5)' : 'Nenhum perfil elevado (Z \u2265 1,5)') + '</b>' +
            (el ? r.elevados.map(function (n) { return esc(nome(n)); }).join(' \u2022 ') : 'Todos os perfis abaixo de 1,5 desvio-padr\u00e3o da amostra cl\u00ednica') + '</div>';
        h += '<h3>&#128202; Escores Z por perfil</h3><div class="qcpv-box" style="text-align:center">' + svgZ(r) + '<div style="font-size:.85em;color:#666;margin-top:6px">Barras para a direita: cren\u00e7as mais intensas que a m\u00e9dia da amostra cl\u00ednica. Zona rosada: Z \u2265 1,5.</div></div>';
        h += '<h3>&#128203; Detalhamento</h3><div style="overflow-x:auto"><table class="qcpv-tab"><thead><tr><th style="text-align:left">Perfil</th><th>EB (m\u00e1x.)</th><th>M\u00e9dia cl\u00ednica</th><th>DP</th><th>Z</th><th>Classifica\u00e7\u00e3o</th></tr></thead><tbody>';
        for (i = 0; i < r.ordem.length; i++) {
            k = r.ordem[i]; p = r.perfis[k];
            h += '<tr><td class="n">' + esc(nome(k)) + '</td><td>' + p.eb + ' / ' + p.maxPossivel + '</td><td>' + n2(p.media) + '</td><td>' + n2(p.dp) + '</td><td><b>' + z2(p.z) + '</b></td>' +
                '<td><span class="qcpv-bdg" style="background:' + p.cor + '22;color:' + p.cor + ';border-color:' + p.cor + '">' + p.classificacao + '</span></td></tr>';
        }
        h += '</tbody></table></div>';
        var an = analise(r);
        h += '<h3>&#128221; An\u00e1lise dos perfis</h3>';
        for (i = 0; i < an.length; i++) h += '<div class="qcpv-box"><b>' + an[i].t + ':</b> ' + an[i].x + '</div>';
        h += '<div class="qcpv-disc"><b>IMPORTANTE:</b> ' + AVISO + '</div></div>';
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
            .replace(/\u2026/g, '...').replace(/\u2265/g, '>=').replace(/\u2022/g, '|').replace(/\u00a0/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
    }
    function dataBR(s) { if (!s) return new Date().toLocaleDateString('pt-BR'); var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s); }
    function Ctx(doc) { this.doc = doc; this.y = 20; }
    Ctx.prototype.need = function (h) { if (this.y + h > 276) { this.doc.addPage(); this.y = 20; } };
    function secao(c, t) { c.need(16); F(c.doc, AZ); c.doc.rect(ML, c.y, 1.6, 6.2, 'F'); T(c.doc, AZ); c.doc.setFont(undefined, 'bold'); c.doc.setFontSize(11); c.doc.text(pt(t), ML + 4, c.y + 4.8); c.y += 10; }
    function caixa(c, titulo, texto) {
        var doc = c.doc;
        doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        var ln = doc.splitTextToSize(pt(texto), CW - 10), h = (titulo ? 5.5 : 0) + ln.length * 4.1 + 5;
        c.need(h + 2);
        F(doc, '#f6f7fb'); D(doc, '#e3e6ee'); doc.setLineWidth(0.2); doc.roundedRect(ML, c.y, CW, h, 2, 2, 'FD');
        var yy = c.y + 4.6;
        if (titulo) { T(doc, AZ); doc.setFont(undefined, 'bold'); doc.setFontSize(9); doc.text(pt(titulo), ML + 5, yy); yy += 5; }
        T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8); doc.text(ln, ML + 5, yy);
        c.y += h + 3;
    }

    function pdf(r, info) {
        info = info || {};
        var i, k, p, doc = new window.jspdf.jsPDF(), c = new Ctx(doc);
        F(doc, AZ); doc.rect(0, 0, 210, 35, 'F'); F(doc, '#880e4f'); doc.rect(0, 33, 210, 2, 'F');
        T(doc, '#ffffff'); doc.setFontSize(15); doc.setFont(undefined, 'bold');
        doc.text(pt('QCP - RELAT\u00d3RIO DE AVALIA\u00c7\u00c3O'), 105, 14, {align: 'center'});
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Question\u00e1rio de Cren\u00e7as da Personalidade (vers\u00e3o brasileira do PBQ-SF)'), 105, 22, {align: 'center'});
        doc.text(pt('Leahy (2019) | Beck & Beck (1991) | Butler et al. (2007) | normas cl\u00ednicas'), 105, 28, {align: 'center'});
        var y = 41;
        F(doc, '#f8f9fa'); doc.rect(ML, y, CW, 25, 'F'); F(doc, AZ); doc.rect(ML, y, 1.6, 25, 'F');
        T(doc, AZ); doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.text('DADOS PESSOAIS', 20, y + 6);
        T(doc, '#000000'); doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(pt('Nome: ' + (info.nome || '') + '   |   Sexo: ' + (info.sexo || '')), 20, y + 12);
        doc.text(pt('Idade: ' + (info.idade || '') + (info.escolaridade ? '   |   Escolaridade: ' + info.escolaridade : '')), 20, y + 17);
        doc.text(pt('Data: ' + dataBR(info.dataAval) + (info.idPaciente ? '   |   ID: ' + info.idPaciente : '')), 20, y + 22);
        c.y = 72;

        var el = r.elevados.length > 0;
        F(doc, el ? '#ffe0b2' : '#c8e6c9'); doc.rect(ML, c.y, CW, 16, 'F'); D(doc, el ? '#e65100' : '#2e7d32'); doc.setLineWidth(0.7); doc.rect(ML, c.y, CW, 16, 'S');
        T(doc, el ? '#bf360c' : '#1b5e20'); doc.setFont(undefined, 'bold'); doc.setFontSize(12.5);
        doc.text(pt(el ? r.elevados.length + (r.elevados.length > 1 ? ' perfis elevados' : ' perfil elevado') + ' (Z >= 1,5)' : 'Nenhum perfil elevado (Z >= 1,5)'), 105, c.y + 7, {align: 'center'});
        doc.setFontSize(8.6);
        doc.text(doc.splitTextToSize(pt(el ? r.elevados.map(nome).join(' | ') : 'Todos os perfis abaixo de 1,5 desvio-padr\u00e3o da amostra cl\u00ednica'), CW - 8), 105, c.y + 12.6, {align: 'center'});
        c.y += 22;

        secao(c, 'ESCORES Z POR PERFIL');
        var x0 = ML + 46, aw = CW - 50, u = aw / (ZMAX - ZMIN), rh = 7, topY = c.y + 5;
        function X(z) { z = Math.max(ZMIN, Math.min(ZMAX, z)); return x0 + (z - ZMIN) * u; }
        F(doc, '#ffebee'); doc.rect(X(1.5), topY, X(ZMAX) - X(1.5), rh * 10, 'F');
        var zz;
        for (zz = -2; zz <= 3; zz++) {
            D(doc, zz === 0 ? '#555555' : '#d5d5d5'); doc.setLineWidth(zz === 0 ? 0.4 : 0.15); doc.line(X(zz), topY, X(zz), topY + rh * 10);
            T(doc, '#666666'); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text((zz > 0 ? '+' : '') + zz, X(zz), topY - 1.5, {align: 'center'});
        }
        D(doc, '#c62828'); doc.setLineWidth(0.5);
        if (doc.setLineDashPattern) doc.setLineDashPattern([1.4, 1], 0);
        doc.line(X(1.5), topY, X(1.5), topY + rh * 10);
        if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
        for (i = 0; i < r.ordem.length; i++) {
            k = r.ordem[i]; p = r.perfis[k];
            var yy = topY + i * rh;
            T(doc, '#333333'); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(pt(nome(k)), x0 - 2, yy + 4.6, {align: 'right'});
            F(doc, p.cor); var xa = X(0), xb = X(p.z); doc.rect(Math.min(xa, xb), yy + 1.2, Math.max(0.4, Math.abs(xb - xa)), 4.6, 'F');
            T(doc, '#333333'); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
            if (p.z >= 0) doc.text(z2(p.z), xb + 1.5, yy + 4.6); else doc.text(z2(p.z), xb - 1.5, yy + 4.6, {align: 'right'});
        }
        T(doc, '#c62828'); doc.setFont(undefined, 'bold'); doc.setFontSize(6.8);
        doc.text(pt('corte de eleva\u00e7\u00e3o (Z 1,5)'), X(1.5), topY + rh * 10 + 3.6, {align: 'center'});
        c.y = topY + rh * 10 + 9;

        secao(c, 'DETALHAMENTO POR PERFIL');
        var cols = [{t: 'Perfil', w: 52, a: 'l'}, {t: 'EB (m\u00e1x.)', w: 24, a: 'c'}, {t: 'M\u00e9dia cl\u00ednica', w: 26, a: 'c'}, {t: 'DP', w: 16, a: 'c'}, {t: 'Z', w: 18, a: 'c'}, {t: 'Classifica\u00e7\u00e3o', w: 44, a: 'c'}];
        var cx = ML;
        F(doc, AZ); doc.rect(ML, c.y, CW, 7, 'F'); T(doc, '#ffffff'); doc.setFont(undefined, 'bold'); doc.setFontSize(7.6);
        for (i = 0; i < cols.length; i++) { doc.text(pt(cols[i].t), cols[i].a === 'l' ? cx + 2 : cx + cols[i].w / 2, c.y + 4.7, cols[i].a === 'l' ? {} : {align: 'center'}); cx += cols[i].w; }
        c.y += 7;
        for (i = 0; i < r.ordem.length; i++) {
            k = r.ordem[i]; p = r.perfis[k]; cx = ML;
            if (i % 2 === 0) { F(doc, '#f8f5fd'); doc.rect(ML, c.y, CW, 7, 'F'); }
            var vals = [pt(nome(k)), p.eb + ' / ' + p.maxPossivel, n2(p.media), n2(p.dp), z2(p.z), p.classificacao];
            for (var j = 0; j < cols.length; j++) {
                if (j === 4) { T(doc, p.z >= 1.5 ? '#c62828' : '#000000'); doc.setFont(undefined, 'bold'); }
                else if (j === 5) { T(doc, p.cor === '#fbc02d' ? '#9a7400' : p.cor); doc.setFont(undefined, 'bold'); }
                else { T(doc, '#000000'); doc.setFont(undefined, j === 0 ? 'bold' : 'normal'); }
                doc.setFontSize(8);
                doc.text(pt(vals[j]), cols[j].a === 'l' ? cx + 2 : cx + cols[j].w / 2, c.y + 4.8, cols[j].a === 'l' ? {} : {align: 'center'});
                cx += cols[j].w;
            }
            c.y += 7;
        }
        c.y += 6;

        secao(c, 'AN\u00c1LISE DOS PERFIS');
        var an = analise(r);
        for (i = 0; i < an.length; i++) caixa(c, an[i].t, an[i].x);
        doc.setFont(undefined, 'normal'); doc.setFontSize(7.8);
        var avl = doc.splitTextToSize(pt(AVISO), CW - 8), hv = avl.length * 3.8 + 8;
        c.need(hv + 2);
        F(doc, '#fff3e0'); doc.rect(ML, c.y, CW, hv, 'F'); F(doc, '#ff9800'); doc.rect(ML, c.y, 1.4, hv, 'F');
        T(doc, '#b45a00'); doc.setFont(undefined, 'bold'); doc.text('IMPORTANTE', ML + 4, c.y + 4.6);
        doc.setFont(undefined, 'normal'); doc.text(avl, ML + 4, c.y + 8.6);
        c.y += hv + 6;

        c.need(40);
        secao(c, 'REFER\u00caNCIAS');
        T(doc, '#282828'); doc.setFont(undefined, 'normal'); doc.setFontSize(8.8);
        for (i = 0; i < REFS.length; i++) {
            var rl = doc.splitTextToSize(pt(REFS[i]), CW - 4);
            c.need(rl.length * 4.3 + 4);
            doc.text(rl, ML + 2, c.y + 3); c.y += rl.length * 4.3 + 4;
        }
        var tot = doc.getNumberOfPages();
        for (var pg = 1; pg <= tot; pg++) {
            doc.setPage(pg);
            doc.setFillColor(80, 80, 80); doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(200, 200, 200); doc.setFontSize(7); doc.setFont(undefined, 'normal');
            doc.text('SYM Online | QCP | Gerado em ' + new Date().toLocaleString('pt-BR') + ' | Pag. ' + pg + '/' + tot, 105, 291, {align: 'center'});
        }
        var ts = new Date();
        var tsStr = ts.getFullYear() + String(ts.getMonth() + 1).padStart(2, '0') + String(ts.getDate()).padStart(2, '0') + String(ts.getHours()).padStart(2, '0') + String(ts.getMinutes()).padStart(2, '0');
        doc.save('QCP_' + pt(info.nome || 'Paciente').replace(/\s+/g, '_') + '_' + tsStr + '.pdf');
    }

    function pdfPainel(d, r) {
        if (!d || String(d.escala || '').toUpperCase() !== 'QCP' || !d.respostas) return false;
        var vals = [];
        for (var i = 1; i <= TOTAL; i++) { var v = parseInt(d.respostas[i], 10); if (!(v >= 0 && v <= 4)) return false; vals.push(v); }
        var res;
        try { res = calcular(vals); } catch (e) { return false; }
        pdf(res, {nome: d.paciente || '', sexo: d.sexo || '', idade: d.idade || '', escolaridade: d.escolaridade || '', idPaciente: d.idPaciente || '',
            dataAval: (r && r.date) ? new Date(r.date).toLocaleDateString('pt-BR') : ''});
        return true;
    }

    window.SYM_QCP = {calcular: calcular, htmlTela: htmlTela, pdf: pdf, pdfPainel: pdfPainel, dadosPainel: dadosPainel, classifGeral: classifGeral, PERFIS: PERFIS, OPC: OPC};
})();
