/* Lauana - atendente virtual do SPM Online. Gerado por empacotar.js em 2026-11-28. Nao edite a mao. Desligar: ?semlauana na URL. */
/* lauana-nucleo.js */
// ============================================================
// LAUANA - NUCLEO (motor de conversa). Nao tem conhecimento aqui,
// so a "inteligencia" de entender texto. O conhecimento fica nos
// arquivos kb-*.js. Funciona no navegador e no Node (para testes).
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU = g.LAU || {};
  // gravar:false = "Etapa 1": nada e enviado/gravado no servidor (recados, cidade, interesse por idioma)
  L.config = L.config || { gravar: true, cidade: true };
  L.intents = []; L.ents = []; L.glos = []; L.escalas = []; L.temas = [];
  L.canon = {}; L.frases = []; L.insultos = {}; L.raiva = {};

  // ---------- utilidades ----------
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    if (Math.abs(m - n) > 2) { return 9; }
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[m][n];
  }
  function semEmoji(s) {
    return String(s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
      .replace(/ +([.,!?;:])/g, '$1').replace(/ {2,}/g, ' ').replace(/^\s+|\s+$/g, '');
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  L.norm = norm; L.semEmoji = semEmoji; L.pick = pick;

  // ---------- sinonimos: palavras diferentes -> um conceito ----------
  // L.sin('conceito', ['palavra1','palavra2'...])  (palavras sem acento)
  L.sin = function (conceito, palavras) {
    L.canon[conceito] = conceito;
    for (var i = 0; i < palavras.length; i++) { L.canon[palavras[i]] = conceito; }
  };
  // frases fixas trocadas antes de separar as palavras: L.frase('nao apareceu','sumir')
  L.frase = function (de, para) { L.frases.push([' ' + norm(de) + ' ', ' ' + para + ' ']); };

  function tokens(texto) {
    var t = ' ' + norm(texto) + ' ', i, out = [], w, w2, ws;
    for (i = 0; i < L.frases.length; i++) {
      while (t.indexOf(L.frases[i][0]) >= 0) { t = t.replace(L.frases[i][0], L.frases[i][1]); }
    }
    ws = t.split(' ');
    for (i = 0; i < ws.length; i++) {
      w = ws[i]; if (!w) { continue; }
      w2 = (w.length > 3 && w.charAt(w.length - 1) === 's') ? w.slice(0, -1) : w;
      out.push(L.canon[w] || L.canon[w2] || w2);
    }
    return out;
  }
  L.tokens = tokens;

  // ---------- casamento de palavras (tolera erro de digitacao) ----------
  function mkSet(toks) { var s = {}, i; for (i = 0; i < toks.length; i++) { s[toks[i]] = 1; } return s; }
  L.semFuzzy = {};   // palavras parecidas demais com outras (ex.: "cidade" x "idade"): so casam exatas
  function temToken(set, kt) {
    if (set[kt]) { return true; }
    if (L.semFuzzy[kt]) { return false; }
    if (kt.length >= 5) {
      for (var q in set) {
        if (q.length < 5) { continue; }
        var d = lev(q, kt);
        if (d <= 1 || (d === 2 && kt.length >= 8 && q.slice(0, 3) === kt.slice(0, 3))) { return true; }
      }
    }
    return false;
  }
  function casaFrase(set, toks) {
    var j, sc = 0;
    for (j = 0; j < toks.length; j++) {
      if (!temToken(set, toks[j])) { return 0; }
      sc += toks[j].length + 6;
    }
    return sc;
  }
  L.casa = function (set, frases) { // frases: lista de listas de tokens
    var best = 0, i, s;
    for (i = 0; i < frases.length; i++) { s = casaFrase(set, frases[i]); if (s > best) { best = s; } }
    return best;
  };
  function prep(lista, campo) { // transforma ["gerar link"] em listas de tokens (1 vez so)
    for (var i = 0; i < lista.length; i++) {
      if (!lista[i]._k) { lista[i]._k = (lista[i][campo] || []).map(function (f) { return tokens(f); }); }
    }
  }
  function melhorIntencao(set, modo, estado) {
    var best = null, bs = 0, i, it, s;
    prep(L.intents, 'k');
    for (i = 0; i < L.intents.length; i++) {
      it = L.intents[i];
      if (it.m && it.m.indexOf(modo) < 0) { continue; }
      // respostas "de acompanhamento" so valem logo depois de certos assuntos
      if (it.after && !(estado && estado.ultimo && it.after.indexOf(estado.ultimo.id) >= 0)) { continue; }
      s = L.casa(set, it._k);
      if (s) { s += (it.p || 0); }
      if (s > bs) { bs = s; best = it; }
    }
    return best;
  }
  function acharEntidade(set) {
    var best = null, bs = 0, i, e, s;
    prep(L.ents, 'nomes');
    for (i = 0; i < L.ents.length; i++) {
      e = L.ents[i]; s = L.casa(set, e._k);
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  }
  function acharEscala(set) {
    var best = null, bs = 0, i, e, s;
    prep(L.escalas, 'nomes');
    for (i = 0; i < L.escalas.length; i++) {
      e = L.escalas[i]; s = L.casa(set, e._k);
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  }
  function acharGlossario(set) {
    var best = null, bs = 0, i, e, s;
    prep(L.glos, 'nomes');
    for (i = 0; i < L.glos.length; i++) {
      e = L.glos[i]; s = L.casa(set, e._k);
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  }
  function acharTema(set) {
    var best = null, bs = 0, i, e, s;
    prep(L.temas, 'nomes');
    for (i = 0; i < L.temas.length; i++) {
      e = L.temas[i]; s = L.casa(set, e._k);
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  }
  L._f = { mkSet: mkSet, acharEntidade: acharEntidade, acharEscala: acharEscala,
           acharGlossario: acharGlossario, acharTema: acharTema, melhorIntencao: melhorIntencao };

  // texto por modo: aceita array, ou objeto {home:[],painel:[],paciente:[],_:[]}
  function porModo(a, modo) {
    if (!a) { return null; }
    if (Array.isArray(a)) { return a; }
    return a[modo] || a._ || null;
  }
  L.porModo = porModo;

  // ---------- clima da conversa (raiva, insulto, grito) ----------
  // palavras soltas ficam em L.raiva / L.insultos; expressoes (2+ palavras) em listas de frases
  L.raivaFrases = []; L.insultoFrases = [];
  function guardar(palavras, solto, frases) {
    palavras.forEach(function (p) {
      var t = tokens(p);
      if (t.length === 1) { solto[t[0]] = 1; } else if (t.length > 1) { frases.push(t); }
    });
  }
  L.setRaiva = function (palavras) { guardar(palavras, L.raiva, L.raivaFrases); };
  L.setInsulto = function (palavras) { guardar(palavras, L.insultos, L.insultoFrases); };
  function exato(set, frases) { // todas as palavras da frase presentes (sem tolerancia a erro)
    for (var i = 0; i < frases.length; i++) {
      var ok = true;
      for (var j = 0; j < frases[i].length; j++) { if (!set[frases[i][j]]) { ok = false; break; } }
      if (ok) { return true; }
    }
    return false;
  }
  function clima(texto, set) {
    var letras = texto.replace(/[^A-Za-z\u00C0-\u00FF]/g, ''), maius = texto.replace(/[^A-Z\u00C0-\u00DE]/g, '');
    var grito = letras.length >= 8 && maius.length / letras.length > 0.7;
    var exclam = (texto.match(/!/g) || []).length >= 3;
    var raiva = false, insulto = false, k, pesado = exato(set, L.insultoFrases);
    for (k in L.raiva) { if (set[k]) { raiva = true; break; } }
    for (k in L.insultos) { if (set[k]) { insulto = true; break; } }
    if (!raiva) { raiva = exato(set, L.raivaFrases); }
    var alvo = !!(set.voce || set.robo || set.atendente || set.lauana || set.bot);
    // palavra feia + "voce/robo/atendente" = xingou ela. Expressao pesada ("vai a ...") ja e dirigida.
    return { raiva: raiva || grito || exclam || pesado, insulto: (insulto && alvo) || pesado, xingou: insulto, grito: grito };
  }
  L.clima = clima;

  L.novoEstado = function () {
    return { ultimo: null, ent: null, esc: null, irritacao: 0, flow: null, falhas: 0,
             ultimoTexto: '', rep: 0, turnos: 0, ofereceu: null, gravados: 0 };
  };

  // ---------- montagem de respostas sobre testes e escalas ----------
  function aspectos(set) {
    return { preco: !!(set.preco || set.comprar || set.cobrar), dur: !!set.duracao, idade: !!set.idade,
             disp: !!(set.dispositivo || (set.microfone && set.precisar)), como: !!set.comoaplicar };
  }
  function acharEntidades(set) { // todas as entidades citadas (para comparar testes)
    var out = [], i, e, s;
    prep(L.ents, 'nomes');
    for (i = 0; i < L.ents.length; i++) { e = L.ents[i]; s = L.casa(set, e._k); if (s) { out.push(e); } }
    return out;
  }
  function comporEntidade(e, asp) {
    var out = [], tem = false;
    if (asp.preco) { out.push(e.preco); tem = true; }
    if (asp.dur && e.dur) { out.push(e.dur); tem = true; }
    if (asp.idade && e.idade) { out.push(e.idade); tem = true; }
    if (asp.disp && e.disp) { out.push(e.disp); tem = true; }
    if (asp.como && e.como) { out.push(e.como); tem = true; }
    if (!tem) {
      out.push(e.oque);
      if (e.extra) { out.push(e.extra); }
    }
    return out.filter(function (x) { return !!x; });
  }
  L.comporEntidade = comporEntidade;
  L.aspectos = aspectos;

  // ---------- resposta padrao ----------
  function resp(msgs, chips, extra) {
    var r = { msgs: msgs, chips: chips || [], acao: null, id: '', sem: false, neutro: false }, k;
    if (extra) { for (k in extra) { r[k] = extra[k]; } }
    return r;
  }
  L.resp = resp;
  function comoLista(a) { return Array.isArray(a) ? a : [a]; }
  function respIntent(it, modo, E) {
    var fonte = (typeof it.a === 'function') ? it.a(E, modo) : it.a; // resposta pode ser calculada na hora
    var a = porModo(fonte, modo), chips = porModo(it.c, modo) || [];
    if (!a || !a.length) { a = porModo(it.a, '_') || ['Pode me contar um pouco mais?']; }
    E.ultimo = it; E.ultimoTipo = 'intent'; E.falhas = 0;
    E.ofereceu = it.oferece || null;
    // a = lista de baloes (todos aparecem). Se it.alt, a lista tem alternativas (sorteia uma).
    var r = resp(it.alt ? comoLista(pick(a)) : a.slice(), chips, { id: it.id });
    if (it.acao) { r.acao = it.acao; }
    if (it.neutro) { r.neutro = true; }
    return r;
  }
  function respEntidade(e, set, modo, E) {
    var asp = aspectos(set), msgs = comporEntidade(e, asp), chips = [];
    E.ent = e; E.ultimoTipo = 'ent'; E.ultimo = { id: 'ent:' + e.id, s: e.simples || e.oque }; E.falhas = 0;
    if (modo !== 'paciente') {
      chips = ['Quanto custa o ' + e.nome + '?', 'Quanto tempo leva o ' + e.nome + '?', 'Qual a idade do ' + e.nome + '?'];
    }
    return resp(msgs, chips, { id: 'ent:' + e.id });
  }
  function respEscala(s, modo, E) {
    E.esc = s; E.ultimoTipo = 'esc'; E.falhas = 0; E.ultimo = { id: 'esc:' + s.id, s: s.nome };
    var m = ['A ' + s.sigla + ' (' + s.nome + ') \u00e9 uma escala de rastreio ' + s.quem + '. ' + (s.desc || '')];
    if (modo === 'paciente') { return resp(m, [], { id: 'esc:' + s.id }); }
    m.push('Ela \u00e9 gratuita. O profissional escolhe a escala no painel, envia o link, a pessoa responde pelo celular ou computador e o relat\u00f3rio em PDF fica pronto no painel. Lembrando: \u00e9 rastreio, n\u00e3o diagn\u00f3stico.');
    return resp(m, ['Como gerar o link?', 'Quais escalas existem?'], { id: 'esc:' + s.id });
  }
  function respTema(t, modo, E) {
    E.ultimoTipo = 'tema'; E.falhas = 0; E.ultimo = { id: 'tema:' + t.id, s: t.lista };
    // resposta "cruzada" (programas + escalas + preco + link do manual), montada em kb-assuntos.js
    if (modo !== 'paciente' && L.montarTema && (t.progs || t.escs)) {
      var rc = L.montarTema(t, modo);
      if (rc && rc.msgs && rc.msgs.length) { return resp(rc.msgs, rc.chips || ['Como gerar o link?'], { id: 'tema:' + t.id }); }
    }
    var m = ['Para ' + t.titulo + ' temos: ' + t.lista + '.'];
    m.push(t.nota || 'Quem escolhe o instrumento mais adequado \u00e9 o profissional, de acordo com o caso. Quer saber como aplicar?');
    return resp(m, modo === 'paciente' ? [] : ['Como gerar o link?'], { id: 'tema:' + t.id });
  }
  function respGlossario(g, E) {
    E.ultimoTipo = 'glos'; E.falhas = 0; E.ultimo = { id: 'glos:' + g.id, s: g.t };
    return resp(comoLista(g.t), g.c || [], { id: 'glos:' + g.id });
  }
  function respNaoSei(E, modo) {
    E.falhas++; E.ultimoTipo = 'nada';
    var m = (E.falhas >= 2) ? L.msg.naoSei2 : L.msg.naoSei;
    E.ofereceu = (modo === 'paciente') ? null : 'recado';
    var chips = (modo === 'paciente') ? L.chipsPadrao(modo) : ['Deixar recado ao S\u00e9rgio', 'Falar com o S\u00e9rgio'].concat(L.chipsPadrao(modo).slice(0, 2));
    return resp(comoLista(pick(m)), chips, { sem: true, id: 'nao-sei' });
  }
  L._r = { respIntent: respIntent, respEntidade: respEntidade, respEscala: respEscala,
           respTema: respTema, respGlossario: respGlossario, respNaoSei: respNaoSei };

  // ---------- o cerebro: decide o que responder ----------
  function porId(id) { for (var i = 0; i < L.intents.length; i++) { if (L.intents[i].id === id) { return L.intents[i]; } } return null; }
  L.porId = porId;

  // "que painel?": a palavra "que" logo antes do termo do glossario
  function cueQue(toks, gl) {
    var i, j;
    prep(L.glos, 'nomes');
    for (i = 0; i < toks.length - 1; i++) {
      if (toks[i] !== 'que') { continue; }
      for (j = 0; j < gl._k.length; j++) { if (gl._k[j][0] === toks[i + 1]) { return true; } }
    }
    return false;
  }
  function respCompara(lista, E) {
    var m = ['Vou te mostrar os dois lado a lado:'];
    lista.forEach(function (e) { m.push(e.nome + ': ' + e.oque); });
    m.push('Quem escolhe qual usar \u00e9 o profissional, conforme a queixa e o caso. Quer saber o pre\u00e7o ou o tempo de algum deles?');
    E.ultimoTipo = 'compara'; E.falhas = 0; E.ent = lista[0];
    return resp(m, lista.map(function (e) { return 'Quanto custa o ' + e.nome + '?'; }), { id: 'compara' });
  }

  function decidir(texto, n, toks, set, cl, E, modo) {
    var asp = aspectos(set), temAsp = asp.preco || asp.dur || asp.idade || asp.disp || asp.como;
    var curta = toks.length <= 8, it, itS, ent, esc, gl, tema, r;

    // "sim" / "nao" sozinhos (sem outro assunto) respondem a uma oferta anterior
    if (toks.length <= 4 && E.ofereceu) {
      var resto = toks.filter(function (t) { return t !== 'sim' && t !== 'nao' && t !== 'por' && t !== 'favor' && t !== 'obrigado' && t !== 'pode' && t !== 'ser'; });
      if (!resto.length) {
        if (set.sim && !set.nao) { var o = E.ofereceu; E.ofereceu = null; return L.iniciarFluxo(o, E, modo); }
        if (set.nao) { E.ofereceu = null; return resp([pick(L.msg.tudoBem)], L.chipsPadrao(modo)); }
      }
    }
    // xingamento dirigido a Lauana
    if (cl.insulto) { return resp([pick(E.irritacao >= 3 ? L.msg.ofensa2 : L.msg.ofensa)], L.chipsContato, { id: 'ofensa', neutro: true }); }

    it = melhorIntencao(set, modo, E);
    ent = acharEntidade(set);
    // assuntos genericos do site ("como funciona") nao competem quando um teste foi citado pelo nome
    if (it && it.semEnt && ent) { it = null; }
    itS = it ? (L.casa(set, it._k) + (it.p || 0)) : 0;

    // assuntos delicados (clinico, emocional, ameaca) passam na frente de tudo
    if (it && it.p >= 40) { return finalizar(respIntent(it, modo, E), it, E, modo); }

    // dois testes citados ("diferenca entre BAE e TECFE"): descreve os dois
    var ents = acharEntidades(set);
    // versao especializada (ex.: "TETaylor simplificado") citada junto com o teste-base: a pessoa quer a especializada, a menos que peca comparacao
    if (ents.length >= 2 && !/(diferenc|compar|versus|\bvs\b|\bentre\b|\be a\b|\be o\b)/.test(n)) {
      ents = ents.filter(function (e) { return !ents.some(function (o) { return o.especializa === e.id; }); });
      if (ents.length === 1) { ent = ents[0]; }
    }
    if (ents.length >= 2 && itS < 40) { return respCompara(ents.slice(0, 3), E); }

    // "que painel?", "o que e escore?" (se for um teste pelo nome, o teste tem prioridade)
    gl = acharGlossario(set);
    if (gl && (set.defin || cueQue(toks, gl)) && curta && itS < 40 && !ent) { return respGlossario(gl, E); }

    // teste ou programa citado pelo nome
    if (ent && ((temAsp && itS < 30) || L.casa(set, ent._k) >= itS)) { return respEntidade(ent, set, modo, E); }

    // escala citada pela sigla
    esc = acharEscala(set);
    if (esc && ((temAsp && itS < 30) || L.casa(set, esc._k) >= itS)) { return respEscala(esc, modo, E); }

    // pergunta curta sobre o ultimo teste citado: "e o preco?"
    if (!ent && temAsp && toks.length <= 6 && E.ent && E.ultimoTipo === 'ent') { return respEntidade(E.ent, set, modo, E); }

    // "tem escala de ansiedade?"
    tema = acharTema(set);
    if (tema && (set.escala || set.procura || set.qual || set.teste) && itS < 30) { return respTema(tema, modo, E); }

    // esclarecimento: "nao entendi", "como assim?"
    if (it && it.id === 'esclarecer') { return esclarecer(E, modo); }

    if (it) { return finalizar(respIntent(it, modo, E), it, E, modo); }

    if (gl && curta) { return respGlossario(gl, E); }
    if (cl.raiva && porId('raiva_generica')) { return respIntent(porId('raiva_generica'), modo, E); }
    return respNaoSei(E, modo);
  }

  // intents que abrem fluxo (recado, avaliacao...)
  function finalizar(r, it, E, modo) {
    if (it.acao === 'fluxo') { return L.iniciarFluxo(it.fluxo, E, modo, r); }
    return r;
  }

  function esclarecer(E, modo) {
    var u = E.ultimo;
    if (u && u.s) {
      return resp(['Claro, explico de outro jeito:'].concat(comoLista(u.s)), ['Entendi, obrigado', 'Falar com o S\u00e9rgio'], { id: 'esclarecer' });
    }
    if (u && u.a) {
      var a = porModo(u.a, modo) || [];
      if (a.length) {
        var bal = u.alt ? comoLista(pick(a)) : a;
        return resp(['Claro, vou repetir com calma:'].concat(bal), ['Entendi, obrigado', 'Falar com o S\u00e9rgio'], { id: 'esclarecer' });
      }
    }
    return resp([pick(L.msg.esclarecerSemContexto)], L.chipsPadrao(modo), { id: 'esclarecer' });
  }

  // Etapa 1 (nao grava nada): tira ofertas de "deixar recado" das respostas (frase a frase) e dos botoes
  var OFERTA = /recado|leave a message|deje(?:le)? un mensaje|dejar (?:un )?mensaje|dejarle un mensaje/i;
  function semGravar(r, E) {
    r.msgs = r.msgs.map(function (m) {
      var frases = String(m).match(/[^.!?\u2026]+[.!?\u2026]*\s*/g) || [String(m)];     // sem "lookbehind" (Safari antigo)
      return frases.filter(function (f) { return !OFERTA.test(f); }).join('').trim();
    }).filter(function (m) { return m.length > 0; });
    if (!r.msgs.length) { r.msgs = ['Pode contar comigo para o que precisar. \ud83d\ude0a']; }
    r.chips = (r.chips || []).filter(function (c) { return !OFERTA.test(c); });
    if (E.ofereceu === 'recado') { E.ofereceu = null; }
    return r;
  }

  // ---------- porta de entrada ----------
  // todas as saidas (inclusive as dos idiomas, nome e conversas guiadas) passam pelo mesmo filtro da Etapa 1
  L.processar = function (texto, E, modo) {
    var r = processarBase(texto, E, modo);
    if (L.config.gravar === false && !E._interno) { r = semGravar(r, E); }
    return r;
  };
  function processarBase(texto, E, modo) {
    texto = String(texto == null ? '' : texto).replace(/[<>]/g, '').slice(0, 500);
    E.turnos++;
    var n = norm(texto), r, i;
    if (!n) {
      if (!String(texto).trim()) { return resp([pick(L.msg.vazio)], L.chipsPadrao(modo), { id: 'vazio', neutro: true }); }
      return resp([pick(L.msg.simbolos)], L.chipsPadrao(modo), { id: 'simbolos', neutro: true });
    }
    if (L.tratarIdioma) { r = L.tratarIdioma(texto, n, E, modo); if (r) { return r; } }   // visitante estrangeiro
    if (E.flow) { r = L.fluxo(texto, n, E, modo); if (r) { return r; } }
    if (L.tratarPapel) { r = L.tratarPapel(texto, n, E, modo); if (r) { return r; } }   // profissao e tratamento Dr./Dra.
    if (L.tratarContexto) { r = L.tratarContexto(texto, n, E, modo); if (r) { return r; } }   // painel: aba e programa em que o profissional esta
    if (E.aguardandoNome && L.tratarNome) { r = L.tratarNome(texto, n, E, modo); if (r) { return r; } }
    if (E.aguardandoCidade && L.tratarCidade) { r = L.tratarCidade(texto, n, E, modo); if (r) { return r; } }
    var toks = tokens(texto), set = mkSet(toks), cl = clima(texto, set);
    E.rep = (n === E.ultimoTexto) ? E.rep + 1 : 0; E.ultimoTexto = n;
    if (cl.raiva || cl.insulto) { E.irritacao += 1; } else { E.irritacao = Math.max(0, E.irritacao - 0.5); }
    r = decidir(texto, n, toks, set, cl, E, modo);
    // mesma pergunta repetida: a pessoa nao ficou satisfeita
    if (E.rep >= 1 && !r.neutro) {
      r.msgs = [pick(L.msg.repetiu)].concat(r.msgs);
      if (modo !== 'paciente') { r.chips = ['Deixar recado ao S\u00e9rgio', 'Falar com o S\u00e9rgio']; E.ofereceu = 'recado'; }
    }
    // clima pesado: acolher primeiro, sem emoji, e mostrar o caminho humano
    if (cl.raiva && !r.neutro) {
      var nivel = Math.min(3, Math.max(1, Math.round(E.irritacao)));
      var pre = L.msg.empatia[nivel - 1];
      if (L.empatiaComNome) { pre = L.empatiaComNome(pre, E.nome, nivel); }
      r.msgs = [pre].concat(r.msgs.map(L.semEmoji));
      // a partir da 2a mensagem irritada, mostra o caminho humano (se a resposta ainda nao mostrou)
      if (nivel >= 2 && modo !== 'paciente' && r.msgs.join(' ').indexOf('WhatsApp') < 0) {
        r.msgs.push(L.msg.caminhoHumano); r.chips = ['Deixar recado ao S\u00e9rgio']; E.ofereceu = 'recado';
      }
    } else if (E.irritacao >= 1 && !r.neutro) {
      r.msgs = r.msgs.map(L.semEmoji); // depois do estresse, tom mais sobrio (sem emojis)
    }
    if (L.depoisDaResposta) { r = L.depoisDaResposta(r, cl, E, modo); }
    return r;
  }
})(typeof window !== 'undefined' ? window : global);

/* kb-base.js */
// ============================================================
// LAUANA - BASE: sinonimos, frases, mensagens fixas, atalhos.
// FONTES: site/index.html, site/online/index.html e manuais.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, S = L.sin, F = L.frase;
  L.WHATS = 'WhatsApp (67) 98423-3444';

  // ----- sinonimos (varias palavras -> 1 conceito) -----
  S('gerar', ['gero', 'gera', 'criar', 'crio', 'cria', 'fazer', 'montar', 'emitir', 'gerando', 'gerado']);
  S('enviar', ['envio', 'envia', 'mandar', 'mando', 'manda', 'mandei', 'enviei', 'passar', 'compartilhar', 'encaminhar']);
  S('link', ['linque', 'url', 'endereco']);
  S('comprar', ['compra', 'comprei', 'compre', 'pagar', 'paguei', 'pagamento', 'pago', 'pagando', 'adquirir', 'recarregar', 'recarga', 'pix', 'boleto', 'cartao', 'assinar']);
  S('credito', ['saldo', 'creditar']);
  S('sumir', ['sumiu', 'sumido', 'desapareceu', 'desaparecer', 'zerou', 'zerado']);
  S('erro', ['bug', 'falha', 'falhou', 'problema', 'travou', 'trava', 'travado', 'quebrou', 'quebrado', 'defeito', 'bugado', 'pane']);
  S('funcionar', ['funciona', 'funcionando', 'funcionou', 'funcionam', 'funcione']);
  S('preco', ['valor', 'custa', 'custo', 'custar', 'tarifa', 'mensalidade', 'caro', 'barato', 'gratis', 'gratuito', 'gratuita', 'free', 'cobra']);
  S('cobrar', ['cobrou', 'cobrando', 'cobraram', 'cobranca', 'debitou', 'descontou', 'debito']);
  S('duracao', ['demora', 'demorar', 'demorado', 'dura', 'durar', 'minuto', 'hora']);
  S('idade', ['ano', 'faixa']);
  S('dispositivo', ['celular', 'tablet', 'computador', 'pc', 'notebook', 'mobile', 'smartphone', 'iphone', 'android', 'ipad', 'desktop', 'laptop']);
  S('comoaplicar', ['aplicar', 'aplico', 'aplica', 'aplicacao', 'aplicado', 'utilizar', 'realizar']);
  S('escala', ['questionario', 'instrumento', 'inventario', 'checklist']);
  S('painel', ['dashboard']);
  S('entrar', ['entro', 'acessar', 'acesso', 'acessa', 'logar', 'login', 'loga', 'conectar']);
  S('cadastro', ['cadastrar', 'cadastrei', 'registrar', 'registro', 'inscrever', 'inscricao']);
  S('email', ['mail', 'gmail', 'hotmail', 'outlook']);
  S('sergio', ['monte', 'dono', 'criador', 'responsavel', 'desenvolvedor', 'administrador', 'admin']);
  S('contato', ['contatar', 'telefone', 'whatsapp', 'zap', 'whats', 'wpp', 'ligar', 'ligacao']);
  S('humano', ['pessoa', 'alguem', 'funcionario']);
  S('robo', ['bot', 'robot', 'maquina']);
  S('ia', ['gpt', 'chatgpt', 'openai', 'gemini', 'whisper']);
  S('voce', ['vc', 'tu']);
  S('sim', ['claro', 'aham', 'uhum', 'ok', 'certo', 'quero', 'pode']);
  S('nao', ['nunca', 'negativo', 'jamais']);
  S('defin', ['significa', 'significado', 'conceito', 'explica', 'explicar', 'explique', 'definicao']);
  S('cair', ['caiu', 'cai', 'caindo', 'caida']); S('ver', ['ve', 'vejo', 'veem', 'visualizar', 'visualizo']);
  S('cancelar', ['cancelo', 'cancela', 'cancelei', 'cancelou', 'cancelamento']);
  S('comprar', ['compro', 'comprou', 'comprando', 'compramos']);
  S('gerar', ['criou', 'criaram', 'criei']);
  S('procura', ['tem', 'existe', 'possui', 'disponivel', 'ha', 'quais', 'lista', 'listar']);
  S('urgente', ['urgencia', 'rapido', 'pressa', 'imediato']);
  S('usado', ['utilizado', 'usei', 'utilizei']);
  S('esquecer', ['esqueci', 'esquece', 'esquecido']);
  S('perder', ['perdi', 'perdeu', 'perdido', 'perdendo', 'perda']);
  S('paciente', ['avaliando', 'avaliado', 'cliente', 'filho', 'filha']);
  S('profissional', ['avaliador', 'psicologo', 'neuropsicologo', 'terapeuta', 'medico', 'doutor', 'psiquiatra']);

  // ----- frases fixas (viram um unico conceito) -----
  ['nao apareceu', 'nao aparece', 'nao apareceram', 'nao aparecem', 'nao caiu', 'nao cairam', 'nao chegou',
   'nao chegaram', 'nao entrou', 'nao entraram', 'nao liberou', 'nao liberaram', 'nao foi liberado',
   'nao foram liberados', 'nao veio', 'nao vieram', 'nao recebi', 'nao consta', 'nao esta aparecendo']
    .forEach(function (f) { F(f, 'sumir'); });
  F('quanto custa', 'preco'); F('quanto e', 'preco'); F('quanto sai', 'preco'); F('quanto pago', 'preco');
  F('quanto tempo', 'duracao'); F('quantos minutos', 'duracao'); F('a partir de quantos anos', 'idade');
  F('e mail', 'email'); F('criar conta', 'cadastro'); F('abrir conta', 'cadastro'); F('fazer conta', 'cadastro');
  F('ja foi utilizado', 'usado'); F('ja utilizado', 'usado'); F('ja foi usado', 'usado'); F('ja usado', 'usado');
  F('inteligencia artificial', 'ia'); F('o que e', 'defin'); F('o que sao', 'defin'); F('quer dizer', 'defin');
  F('como assim', 'esclarecer defin'); F('nao entendi', 'esclarecer'); F('nao entendo', 'esclarecer');
  F('nao compreendi', 'esclarecer'); F('explica melhor', 'esclarecer'); F('explique melhor', 'esclarecer');
  F('mais simples', 'esclarecer'); F('nao ficou claro', 'esclarecer'); F('pode repetir', 'esclarecer');
  F('nao sei o que fazer', 'perdido'); F('estou perdido', 'perdido'); F('estou perdida', 'perdido');
  F('por onde comeco', 'perdido'); F('por onde comecar', 'perdido'); F('nao sei por onde', 'perdido');

  // ----- atalhos (botoes) -----
  L.chipsPadrao = function (modo) {
    if (modo === 'painel') { return ['Gerar link para o paciente', 'Ver resultados', 'Cr\u00e9ditos', 'Falar com o S\u00e9rgio']; }
    if (modo === 'paciente') { return ['N\u00e3o consigo enviar', 'Problema com o microfone', 'Link j\u00e1 utilizado']; }
    return ['Como funciona o site?', 'Conhecer um teste', 'Quanto custa?', 'Falar com o S\u00e9rgio'];
  };
  L.chipsContato = ['Falar com o S\u00e9rgio', 'Deixar recado ao S\u00e9rgio'];

  // ----- frases fixas da Lauana -----
  L.msg = {
    simbolos: ['Hmm, s\u00f3 consegui ler s\u00edmbolos. \ud83d\ude05 Pode escrever com palavras? Assim eu consigo te ajudar.'],
    vazio: ['Pode escrever a sua d\u00favida. Estou aqui para ajudar. \ud83d\ude0a', 'Hmm, a mensagem chegou vazia. Pode escrever de novo?'],
    tudoBem: ['Tudo bem! Se precisar de qualquer coisa, estou por aqui. \ud83d\ude0a', 'Sem problemas! Qualquer d\u00favida, \u00e9 s\u00f3 chamar.'],
    esclarecerSemContexto: ['Claro! Me diz o que ficou confuso que eu explico com calma. \ud83d\ude0a', 'Pode me dizer qual parte n\u00e3o ficou clara? Eu explico de novo, de outro jeito.'],
    repetiu: ['Percebi que voc\u00ea repetiu, ent\u00e3o talvez eu n\u00e3o tenha explicado bem. Vou tentar de outro jeito:',
              'Desculpa se n\u00e3o fui clara. Olha de novo:'],
    naoSei: [
      ['Hmm, essa eu n\u00e3o sei te responder direitinho. \ud83d\ude05 Mas fica tranquilo! O S\u00e9rgio monitora o que acontece no site e voc\u00ea pode falar com ele pela mensagem do site ou pelos contatos dele: ' + 'WhatsApp (67) 98423-3444.',
       'Se preferir, eu mesma deixo um recado registrado para ele. Quer?'],
      ['Boa pergunta! Essa eu ainda n\u00e3o sei. \ud83e\udd14 Mas o S\u00e9rgio acompanha as ocorr\u00eancias do site, e voc\u00ea pode falar com ele pelo WhatsApp (67) 98423-3444.',
       'Quer que eu deixe um recado registrado para ele?']
    ],
    naoSei2: [
      ['Ainda n\u00e3o consegui te ajudar com isso, e quero que voc\u00ea saia daqui com uma resposta. \ud83d\udc9a O melhor caminho agora \u00e9 falar direto com o S\u00e9rgio: WhatsApp (67) 98423-3444.',
       'Se quiser, deixo um recado registrado agora mesmo. \u00c9 s\u00f3 dizer "sim".']
    ],
    empatia: [
      'Entendo, e sinto muito pelo transtorno. Vamos resolver isso.',
      'Voc\u00ea tem toda a raz\u00e3o de querer uma solu\u00e7\u00e3o r\u00e1pida. Vou direto ao ponto.',
      'Sinto muito mesmo. Para isso ser tratado com prioridade, o melhor caminho agora \u00e9 falar direto com o respons\u00e1vel.'
    ],
    caminhoHumano: 'Se preferir falar com uma pessoa, o S\u00e9rgio atende pelo WhatsApp (67) 98423-3444. Posso tamb\u00e9m deixar um recado registrado com o que aconteceu.',
    ofensa: ['Estou aqui para ajudar e quero resolver isso com voc\u00ea. Vamos conversar com respeito, combinado? Me conta o que aconteceu.',
             'Eu entendo que voc\u00ea est\u00e1 chateado(a). Me conta o que houve que eu tento ajudar. Sem ofensas, tudo bem?'],
    ofensa2: ['Quero muito ajudar, mas n\u00e3o consigo continuar assim. Se preferir falar com uma pessoa, o S\u00e9rgio atende pelo WhatsApp (67) 98423-3444. Posso deixar um recado com o que aconteceu.']
  };

  // ----- glossario: "o que e X?" / "que painel?" -----
  function G(id, nomes, t, c) { L.glos.push({ id: id, nomes: nomes, t: t, c: c || [] }); }
  G('painel', ['painel'], [
    'Desculpa, usei uma palavra que n\u00e3o expliquei! \ud83d\ude05 O painel \u00e9 a \u00e1rea do profissional aqui do site, tipo o "balc\u00e3o de trabalho" dele.',
    'L\u00e1 ele cadastra os pacientes, escolhe a escala ou o teste, gera um link para enviar ao paciente e depois v\u00ea o resultado, com o relat\u00f3rio em PDF. O painel \u00e9 gratuito.',
    'Para chegar nele, \u00e9 s\u00f3 clicar no bot\u00e3o "Acessar meu painel gratuito" l\u00e1 no topo desta p\u00e1gina.'],
    ['Como entro no painel?', 'Como funciona o site?']);
  G('escala', ['escala'], [
    'Escala \u00e9 um question\u00e1rio de rastreio: a pessoa l\u00ea algumas afirma\u00e7\u00f5es e marca o quanto aquilo combina com ela (por exemplo, "nunca", "\u00e0s vezes", "sempre"). No final o site calcula o resultado e monta um relat\u00f3rio em PDF.',
    'Aqui temos mais de 50, e s\u00e3o todas gratuitas. Ela serve para levantar sinais, n\u00e3o para dar diagn\u00f3stico.'], ['Quais escalas existem?']);
  G('teste', ['teste'], [
    'Os testes daqui s\u00e3o tarefas feitas no computador, no tablet ou no celular, como lembrar figuras, achar combina\u00e7\u00f5es, ler um texto em voz alta ou ligar c\u00edrculos na ordem. Eles mostram como a pessoa usa aten\u00e7\u00e3o, mem\u00f3ria e outras fun\u00e7\u00f5es.',
    'Servem de rastreio, ou seja, levantam pistas para o profissional investigar. N\u00e3o d\u00e3o diagn\u00f3stico sozinhos.'], ['Quais testes existem?']);
  G('rastreio', ['rastreio'], [
    'Rastreio \u00e9 uma "primeira olhada": o instrumento levanta sinais e indica se vale aprofundar a avalia\u00e7\u00e3o. Ele n\u00e3o fecha diagn\u00f3stico. Quem interpreta o resultado e decide os pr\u00f3ximos passos \u00e9 o profissional.']);
  G('link', ['link'], [
    'O link \u00e9 um endere\u00e7o de internet exclusivo que o profissional gera no painel e envia ao paciente (por WhatsApp ou e-mail). O paciente clica, responde direto no navegador, sem instalar nada, e o resultado volta para o profissional.',
    'Cada link vale para uma aplica\u00e7\u00e3o s\u00f3 e fica v\u00e1lido por at\u00e9 30 dias.'], ['Como gerar o link?']);
  G('credito', ['credito'], [
    'Cr\u00e9dito \u00e9 como uma "ficha" para usar alguns dos testes. Cada aplica\u00e7\u00e3o consome cr\u00e9ditos, e ao se cadastrar voc\u00ea ganha cr\u00e9ditos gr\u00e1tis para experimentar. As escalas e o painel n\u00e3o usam cr\u00e9dito, s\u00e3o gratuitos.'],
    ['Quanto custa?', 'Como comprar cr\u00e9ditos?']);
  G('avaliador', ['profissional'], [
    'Avaliador \u00e9 o profissional (por exemplo neuropsic\u00f3logo ou psic\u00f3logo) que aplica a escala ou o teste. Ele entra no painel, envia o link ao paciente e recebe o resultado.']);
  G('paciente', ['paciente'], [
    'Paciente (ou avaliando) \u00e9 a pessoa que responde a escala ou faz o teste. Ela s\u00f3 precisa abrir o link que o profissional enviou. N\u00e3o precisa de cadastro nem de instalar nada.']);
  G('laudo', ['laudo', 'relatorio'], [
    'O relat\u00f3rio (ou laudo) \u00e9 o documento em PDF que o site monta sozinho depois que a pessoa termina: mostra pontua\u00e7\u00f5es, classifica\u00e7\u00f5es e, em v\u00e1rios testes, uma an\u00e1lise por intelig\u00eancia artificial. O profissional l\u00ea, interpreta e decide o que usar.']);
  G('norma', ['norma'], [
    'Normas s\u00e3o tabelas de refer\u00eancia que mostram o que \u00e9 esperado para cada idade (e \u00e0s vezes escolaridade). Elas permitem dizer se o desempenho de uma pessoa est\u00e1 acima, dentro ou abaixo do esperado. Em alguns instrumentos daqui as normas ainda s\u00e3o provis\u00f3rias, e isso aparece no relat\u00f3rio.']);
  G('escore', ['escore', 'percentil', 'pontuacao'], [
    'Escore \u00e9 a pontua\u00e7\u00e3o da pessoa. Percentil mostra em que posi\u00e7\u00e3o ela ficou comparada com outras da mesma idade (por exemplo, percentil 50 \u00e9 a m\u00e9dia). Quem explica o significado para o seu caso \u00e9 o profissional que aplicou.']);
  G('ia', ['ia'], [
    'Em v\u00e1rios testes o relat\u00f3rio traz uma an\u00e1lise feita por intelig\u00eancia artificial, para ajudar o profissional a organizar o racioc\u00ednio. Antes de ir para a IA, os dados passam por um filtro que troca nomes, CPF, telefone e endere\u00e7o por etiquetas an\u00f4nimas, ent\u00e3o a IA n\u00e3o sabe quem \u00e9 o paciente. A decis\u00e3o cl\u00ednica \u00e9 sempre do profissional.']);
  G('anamnese', ['anamnese'], [
    'Anamnese \u00e9 o question\u00e1rio da hist\u00f3ria cl\u00ednica: queixas, desenvolvimento, sa\u00fade, escola, fam\u00edlia. O profissional envia por link, o respons\u00e1vel responde pelo celular e as respostas voltam organizadas para o painel.']);
  G('prontuario', ['prontuario'], [
    'O Prontu\u00e1rio IA grava a sess\u00e3o por voz, transcreve e organiza o conte\u00fado nos t\u00f3picos que o profissional escolher. O texto \u00e9 um rascunho que ele revisa e edita antes de salvar.']);
  G('reabilitacao', ['reabilitacao'], [
    'S\u00e3o programas de treino, como LERMAIS (leitura), PRAt (aten\u00e7\u00e3o) e REOCUPA (situa\u00e7\u00f5es do dia a dia). Servem para acompanhar a evolu\u00e7\u00e3o da pessoa sess\u00e3o a sess\u00e3o, e n\u00e3o para dar uma nota.']);
  G('bateria', ['bateria', 'modulo'], [
    'Bateria \u00e9 um conjunto de tarefas aplicadas juntas ou em partes. Cada parte (m\u00f3dulo ou \u00e1rea) pode ser escolhida separadamente pelo profissional.']);
  G('crp', ['crp'], ['CRP \u00e9 o Conselho Regional de Psicologia, o registro profissional dos psic\u00f3logos. O S\u00e9rgio \u00e9 neuropsic\u00f3logo, CRP 14/05739-9, em Campo Grande (MS).']);
})(typeof window !== 'undefined' ? window : global);

/* kb-sin2.js */
// ============================================================
// LAUANA - mais vocabulario (jeitos de falar, conjugacoes, giria)
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, S = L.sin, F = L.frase;
  S('obrigado', ['obg', 'vlw', 'valeu', 'brigado', 'brigada', 'obrigada']); S('que', ['q']); S('porque', ['pq', 'pqe']); S('tambem', ['tb', 'tbm']);
  S('muito', ['mto', 'muitos', 'muita']); S('mensagem', ['msg', 'msgs']); S('nao', ['n', 'nn', 'naum']); S('sim', ['blz', 'beleza', 's']);
  F('n entendi', 'esclarecer'); F('nn entendi', 'esclarecer'); F('ficou confuso', 'esclarecer'); F('nao tendi', 'esclarecer');
  // siglas que terminam em "s" nao podem perder o "s" (senao DASS vira DAS)
  ['dass', 'asrs', 'pss', 'ders', 'whodas', 'raads', 'das'].forEach(function (w) { S(w, []); });
  S('mudar', ['mudou', 'mudaram', 'mudei', 'mudanca', 'mudando', 'alterou', 'atualizou']);
  S('tentar', ['tentei', 'tentou', 'tentando', 'tento', 'tentamos']);
  S('voce', ['vcs', 'voces']); S('deixar', ['deixou', 'deixei', 'deixa', 'deixando']);
  S('oi', ['oii', 'oiii', 'oie', 'olaa', 'ola', 'eai', 'salve', 'hey', 'hi']);
  S('gerar', ['faco', 'fazem', 'faz', 'fizeram']);
  S('enviar', ['mandou', 'enviou', 'mandaram', 'enviaram']);
  S('servir', ['serve', 'servem', 'sirvo']);
  S('precisar', ['precisa', 'preciso', 'precisamos', 'necessito', 'necessario', 'precisam']);
  S('aceitar', ['aceita', 'aceitam', 'aceito']);
  S('receber', ['recebeu', 'recebi', 'recebe', 'recebo', 'recebida']);
  S('faltar', ['falta', 'faltam', 'faltou', 'faltando']);
  S('ouvir', ['ouvindo', 'ouco', 'escuto', 'escutar', 'escutando', 'ouviu']);
  S('acabar', ['acabou', 'acabaram', 'acabando']);
  S('esperar', ['esperando', 'espero', 'aguardando', 'aguardo', 'aguardar', 'esperei']);
  S('pedir', ['pede', 'pedindo', 'pediu', 'peco']);
  S('expirar', ['expirou', 'expirado', 'expirada', 'venceu', 'vencido']);
  S('citar', ['cito', 'citacao', 'citei']);
  S('ajudar', ['ajuda', 'ajudou', 'ajudando', 'ajude', 'ajudo']);
  S('cobrar', ['cobrado', 'cobrada']);
  S('preco', ['graca', 'gratuitamente']);
  S('internet', ['net']);
  S('ladrao', ['ladroes', 'ladrona']);
  S('sergio', ['gerente', 'diretoria', 'supervisor', 'chefe', 'superior', 'gestor']);
  S('microfone', ['mic']);
  F('wi fi', 'internet'); F('de graca', 'preco'); F('nao to', 'nao estar'); F('to com', 'estar com'); F('to sem', 'estar sem');
})(typeof window !== 'undefined' ? window : global);

/* lauana-fluxos.js */
// ============================================================
// LAUANA - FLUXOS (conversas com varios passos):
//  recado    = mensagem privada ao Sergio (problema, duvida, critica, sugestao)
//  avaliacao = elogio/avaliacao com estrelas (vai para o carrossel apos revisao)
// O motor so PEDE a gravacao (acao 'gravar'). Quem grava de verdade
// e a pagina (com 3 tentativas). Depois chama L.resultadoGravacao().
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, resp = L.resp, pick = L.pick, norm = L.norm;

  var CANCELAR = ['cancelar', 'cancela', 'deixa pra la', 'esquece', 'desisti', 'nao quero mais', 'sair', 'deixa quieto'];
  function querCancelar(n) {
    for (var i = 0; i < CANCELAR.length; i++) { if (n === CANCELAR[i] || n.indexOf(CANCELAR[i] + ' ') === 0) { return true; } }
    return false;
  }
  function limpa(t, max) { return String(t).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max); }
  function estrelas(n) {
    var m = n.match(/\b([1-5])\b/);
    if (m) { return parseInt(m[1], 10); }
    var pal = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5 }, ws = n.split(' '), i;
    for (i = 0; i < ws.length; i++) { if (pal[ws[i]]) { return pal[ws[i]]; } }
    return 0;
  }

  // ---------- iniciar ----------
  L.iniciarFluxo = function (tipo, E, modo, base) {
    if (L.config.gravar === false) {                    // Etapa 1: nada e gravado; encaminha por canais que ja existem
      if (tipo === 'feedback' || tipo === 'avaliacao') {
        return resp(['Que bom que voc\u00ea quer opinar! \ud83d\udcac Voc\u00ea pode deixar a sua avalia\u00e7\u00e3o (com estrelas) nesta p\u00e1gina, que o S\u00e9rgio l\u00ea com carinho: https://setmonte.github.io/depoimento/'], ['Falar com o S\u00e9rgio'], { id: 'fluxo-avaliacao-link', neutro: true });
      }
      return resp(['Por enquanto eu ainda n\u00e3o consigo anotar mensagens por aqui, mas o S\u00e9rgio responde pessoalmente pelo ' + L.WHATS + '. \ud83d\udc9a'], ['Falar com o S\u00e9rgio'], { id: 'fluxo-sem-gravar', neutro: true });
    }
    if (E.gravados >= 3) {
      return resp(['J\u00e1 registrei algumas mensagens nesta conversa, ent\u00e3o vou pausar por aqui para n\u00e3o sobrecarregar. Para algo urgente, o WhatsApp \u00e9 o caminho mais r\u00e1pido: ' + L.WHATS + '.'], [], { id: 'limite', neutro: true });
    }
    if (tipo === 'feedback') {
      E.flow = { tipo: 'feedback', passo: 'tipo', dados: {} };
      return resp(['Que bom que voc\u00ea quer deixar a sua opini\u00e3o! \ud83d\udcac Qual \u00e9 o tipo?',
                   'Elogio ou avalia\u00e7\u00e3o aparece no site (depois de revisado). Cr\u00edtica e sugest\u00e3o s\u00f3 o S\u00e9rgio l\u00ea, em particular.'],
                  ['Elogio ou avalia\u00e7\u00e3o', 'Sugest\u00e3o', 'Cr\u00edtica'], { id: 'fluxo-feedback', neutro: true });
    }
    if (tipo === 'avaliacao') {
      E.flow = { tipo: 'avaliacao', passo: 'estrelas', dados: {} };
      return resp(['Vai ser um prazer! Quantas estrelas voc\u00ea d\u00e1, de 1 a 5?'], ['5 estrelas', '4 estrelas', '3 estrelas'], { id: 'fluxo-avaliacao', neutro: true });
    }
    // recado (e variacoes: critica, sugestao)
    var d = {}, passo = 'motivo', msg = ['Claro, eu levo o seu recado ao S\u00e9rgio. \u270d\ufe0f Qual \u00e9 o assunto?'];
    var chips = ['Pagamento ou cr\u00e9ditos', 'Erro ou problema t\u00e9cnico', 'D\u00favida', 'Outro assunto'];
    if (tipo === 'critica' || tipo === 'sugestao') {
      d.motivo = (tipo === 'critica') ? 'Cr\u00edtica' : 'Sugest\u00e3o'; passo = 'texto'; chips = [];
      msg = [(tipo === 'critica' ? 'Obrigada por dizer isso com sinceridade. ' : 'Adoro sugest\u00f5es! ') + 'Pode escrever a sua mensagem aqui. S\u00f3 o S\u00e9rgio vai ler.'];
    }
    E.flow = { tipo: 'recado', passo: passo, dados: d };
    return resp(msg, chips, { id: 'fluxo-recado', neutro: true });
  };

  // ---------- passos ----------
  L.fluxo = function (texto, n, E, modo) {
    var f = E.flow, d = f.dados;
    if (querCancelar(n)) { E.flow = null; return resp(['Tudo bem, cancelei. Se quiser retomar, \u00e9 s\u00f3 me chamar. \ud83d\ude0a'], L.chipsPadrao(modo), { id: 'cancelou', neutro: true }); }

    if (f.tipo === 'feedback') {
      if (n.indexOf('elog') >= 0 || n.indexOf('avalia') >= 0) { E.flow = null; return L.iniciarFluxo('avaliacao', E, modo); }
      if (n.indexOf('suges') >= 0) { E.flow = null; return L.iniciarFluxo('sugestao', E, modo); }
      if (n.indexOf('crit') >= 0 || n.indexOf('reclam') >= 0) { E.flow = null; return L.iniciarFluxo('critica', E, modo); }
      return resp(['Me diz qual \u00e9 o tipo, por favor:'], ['Elogio ou avalia\u00e7\u00e3o', 'Sugest\u00e3o', 'Cr\u00edtica'], { neutro: true });
    }
    if (f.tipo === 'avaliacao') { return passoAvaliacao(texto, n, E, modo, f, d); }
    if (f.tipo === 'recado') { return passoRecado(texto, n, E, modo, f, d); }
    if (f.tipo === 'reenviar') {
      if (n.indexOf('tent') >= 0 || n === 'sim' || n.indexOf('reenv') >= 0) { return gravar(E, f.dados.tipoGravacao, f.dados); }
      E.flow = null; return resp(['Tudo bem. Quando quiser tentar de novo, \u00e9 s\u00f3 me chamar. \ud83d\ude0a'], L.chipsPadrao(modo), { neutro: true });
    }
    if (f.tipo === 'gravando') { return resp(['S\u00f3 um instante, estou enviando...'], [], { neutro: true }); }
    E.flow = null; return null;
  };

  function passoAvaliacao(texto, n, E, modo, f, d) {
    if (f.passo === 'estrelas') {
      var e = estrelas(n);
      if (!e) { return resp(['Me diz um n\u00famero de 1 a 5, por favor. \u2b50'], ['5 estrelas', '4 estrelas', '3 estrelas'], { neutro: true }); }
      d.nota = e; f.passo = 'texto';
      return resp(['Obrigada! Agora escreva o seu depoimento (m\u00ednimo de 20 letras). N\u00e3o coloque dados pessoais como CPF, telefone ou endere\u00e7o, combinado?'], [], { neutro: true });
    }
    if (f.passo === 'texto') {
      var t = limpa(texto, 500);
      if (t.length < 20) { return resp(['Conta um pouquinho mais? O depoimento precisa ter pelo menos 20 letras.'], [], { neutro: true }); }
      d.texto = t; f.passo = 'nome';
      return resp(['Como voc\u00ea quer assinar? Pode ser s\u00f3 as iniciais.'], E.nome ? [E.nome, 'An\u00f4nimo'] : ['An\u00f4nimo'], { neutro: true });
    }
    if (f.passo === 'nome') {
      d.nome = (n === 'anonimo') ? 'An\u00f4nimo' : limpa(texto, 40);
      d.tipoGravacao = 'depoimento';
      return gravar(E, 'depoimento', d);
    }
    return null;
  }

  function passoRecado(texto, n, E, modo, f, d) {
    if (f.passo === 'motivo') {
      d.motivo = limpa(texto, 40); f.passo = 'texto';
      return resp(['Entendi. Agora conte com suas palavras o que aconteceu ou o que voc\u00ea precisa. Quanto mais detalhe, mais f\u00e1cil de resolver.'], [], { neutro: true });
    }
    if (f.passo === 'texto') {
      var t = limpa(texto, 500);
      if (t.length < 5) { return resp(['Pode escrever um pouquinho mais? Assim o S\u00e9rgio entende melhor.'], [], { neutro: true }); }
      d.texto = t;
      if (modo === 'home') {
        f.passo = 'contato';
        return resp(['Se quiser uma resposta, deixe um WhatsApp ou e-mail para o S\u00e9rgio retornar. \u00c9 opcional: pode digitar "pular".'], ['Pular'], { neutro: true });
      }
      d.tipoGravacao = 'recado';
      return gravar(E, 'recado', d);
    }
    if (f.passo === 'contato') {
      d.contato = (n === 'pular' || n === 'nao' || n === 'nao quero') ? '' : limpa(texto, 60);
      d.tipoGravacao = 'recado';
      return gravar(E, 'recado', d);
    }
    return null;
  }

  // ---------- pedir gravacao a pagina ----------
  function gravar(E, tipo, dados) {
    if (E.nome && !dados.nome) { dados.nome = E.nome; }   // o nome que ela ja sabe acompanha o recado
    E.flow = { tipo: 'gravando', passo: 'g', dados: dados };
    var r = resp(['Enviando... \u23f3'], [], { id: 'gravar', neutro: true });
    r.acao = 'gravar'; r.dados = { tipo: tipo, dados: dados };
    return r;
  }

  // A pagina chama isto quando termina de gravar (ok = true/false)
  L.resultadoGravacao = function (E, ok, tipo, dados) {
    if (E.idioma && E.idioma !== 'pt' && L.i18n && L.i18n.en) {          // visitante estrangeiro: confirma no idioma dele (en/es direto; os outros: base em ingles + IA traduz)
      var t = L.i18n[E.idioma] || L.i18n.en, ex = L.i18n[E.idioma] ? {} : { traduzir: E.idioma };
      if (ok) { E.flow = null; E.gravados++; return resp(t.recado_ok.slice(), [], Object.assign({ id: 'gravou', neutro: true }, ex)); }
      E.flow = { tipo: 'reenviar', passo: 'r', dados: Object.assign({ tipoGravacao: tipo }, dados || {}) };
      return resp(t.recado_falhou.slice(), [E.idioma === 'es' ? 'Reintentar' : 'Try again', E.idioma === 'es' ? 'Cancelar' : 'Cancel'], Object.assign({ id: 'falhou', neutro: true }, ex));
    }
    if (ok) {
      E.flow = null; E.gravados++;
      var m = (tipo === 'depoimento')
        ? ['Pronto, recebi a sua avalia\u00e7\u00e3o! \ud83d\udc9a Muito obrigada. Ela passa por uma revis\u00e3o antes de aparecer no site.']
        : ['Recado registrado! \ud83d\udc9a O S\u00e9rgio vai ler com aten\u00e7\u00e3o.', 'Se for urgente, o WhatsApp \u00e9 mais r\u00e1pido: ' + L.WHATS + '.'];
      return resp(m, L.chipsPadrao('home'), { id: 'gravou', neutro: true });
    }
    dados = dados || {}; dados.tipoGravacao = tipo;
    E.flow = { tipo: 'reenviar', passo: 'r', dados: dados };
    return resp(['Poxa, n\u00e3o consegui enviar agora, provavelmente a conex\u00e3o oscilou. \ud83d\ude15 A sua mensagem n\u00e3o se perdeu: ela continua aqui comigo.',
                 'Quer que eu tente de novo? Se preferir, o WhatsApp tamb\u00e9m funciona: ' + L.WHATS + '.'],
                ['Tentar de novo', 'Cancelar'], { id: 'falhou', neutro: true });
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-nome.js */
// ============================================================
// LAUANA - NOME E SAUDACAO (como uma recepcionista de verdade)
//  - cumprimenta pelo horario do aparelho (bom dia / boa tarde / boa noite)
//  - pagina inicial: pergunta o nome, mas NUNCA trava o atendimento por causa disso
//  - painel: usa o que vem antes do @ do e-mail da conta
//  - link do paciente: nao pergunta nada (privacidade)
//  - usa o nome com moderacao (desculpa, agradecimento, despedida)
// O nome fica so na memoria da conversa (variavel E.nome): nao e gravado em lugar nenhum.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, norm = L.norm, resp = L.resp, pick = L.pick;

  L.saudacaoHora = function (hora) {
    var h = (typeof hora === 'number') ? hora : new Date().getHours();
    if (h >= 5 && h < 12) { return 'Bom dia'; }
    if (h >= 12 && h < 18) { return 'Boa tarde'; }
    return 'Boa noite';
  };
  function capitalizar(p) { return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); }

  // "sergio.monte99@gmail.com" -> "Sergio"   |   "12345@x.com" -> ""
  L.nomeDeEmail = function (email) {
    var local = String(email || '').split('@')[0];
    var p = local.split(/[._\-+0-9]+/).filter(function (x) { return /^[A-Za-z\u00C0-\u00FF]{2,14}$/.test(x); })[0];
    return p ? capitalizar(p) : '';
  };

  // tira "me chamo", "sou a", "meu nome e"... e devolve o primeiro nome (ou null)
  var PREFIXOS = [['pode', 'me', 'chamar', 'de'], ['pode', 'chamar', 'de'], ['meu', 'nome', 'e'], ['me', 'chama', 'de'], ['aqui', 'e'], ['me', 'chamo'], ['eu', 'sou'], ['chamo', 'me'], ['sou']];
  // quem pergunta nao esta dizendo o nome: se a frase COMECA por uma destas palavras, nao e um nome (so vale para o nome, nao para a cidade)
  var PRIMEIRA_DE_PERGUNTA = ['tem', 'tinha', 'existe', 'existem', 'quantas', 'quantos', 'quanto', 'quantidade', 'qual', 'quais', 'quem', 'onde', 'quando', 'como', 'porque', 'pq', 'por', 'pra', 'para', 'vale', 'posso', 'pode', 'podem', 'funciona', 'serve', 'sera', 'sao', 'esta', 'estao', 'tambem', 'mas', 'entao', 'se', 'eh', 'isso', 'isto', 'esse', 'essa', 'aquele', 'aquela', 'algum', 'alguma', 'alguem', 'ninguem', 'tudo', 'nada', 'que', 'bem', 'beleza', 'blz', 'opa', 'eai', 'salve'];
  var NAO_NOME = ['nao', 'sim', 'ok', 'oi', 'ola', 'tchau', 'obrigado', 'obrigada', 'ajuda', 'quero', 'preciso', 'problema', 'duvida', 'teste', 'escala', 'paciente',
    // frases como "o site tem relatorio" / "o painel faz laudo": palavras do proprio site e verbos de pergunta nunca sao nome
    'site', 'painel', 'sistema', 'plataforma', 'aplicativo', 'app', 'programa', 'agenda', 'prontuario', 'anamnese', 'relatorio', 'laudo', 'credito', 'creditos',
    'tem', 'temos', 'existe', 'existem', 'faz', 'fazem', 'possui', 'oferece', 'permite', 'aceita', 'cobra', 'custa', 'funciona', 'serve', 'envia', 'gera', 'grava'];
  L.extrairNome = function (texto) {
    var limpo = String(texto).replace(/[!.,;:()?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!limpo || /[?<>\d@\/]/.test(texto)) { return null; }
    var palavras = limpo.split(' '), nw = palavras.map(norm), i, j;
    // corta cumprimento no comeco ("oi, bom dia, ...")
    while (nw.length && ['oi', 'ola', 'bom', 'boa', 'dia', 'tarde', 'noite'].indexOf(nw[0]) >= 0 && nw.length > 1) { nw.shift(); palavras.shift(); }
    for (i = 0; i < PREFIXOS.length; i++) {
      var pf = PREFIXOS[i], ok = nw.length > pf.length;
      for (j = 0; ok && j < pf.length; j++) { if (nw[j] !== pf[j]) { ok = false; } }
      if (ok) { nw = nw.slice(pf.length); palavras = palavras.slice(pf.length); break; }
    }
    if (nw.length > 1 && (nw[0] === 'o' || nw[0] === 'a')) { nw.shift(); palavras.shift(); }
    if (nw.length < 1 || nw.length > 5) { return null; }
    if (PRIMEIRA_DE_PERGUNTA.indexOf(nw[0]) >= 0) { return null; }
    for (j = 0; j < palavras.length; j++) {
      if (!/^[A-Za-z\u00C0-\u00FF'\-]{2,20}$/.test(palavras[j]) || NAO_NOME.indexOf(nw[j]) >= 0) { return null; }
    }
    // se a frase casa EXATAMENTE com um assunto/teste/escala do site, e uma pergunta, nao um nome
    // (sem tolerancia a erro de digitacao: "Paula" nao pode virar "pausa")
    var set = L._f.mkSet(L.tokens(palavras.join(' ')));
    L._f.melhorIntencao(set, 'home', null);      // so para preparar as listas
    L._f.acharEntidade(set); L._f.acharEscala(set);
    function exato(lista) {
      for (var a = 0; a < lista.length; a++) {
        var ks = lista[a]._k || [];
        for (var b = 0; b < ks.length; b++) {
          if (ks[b].length && ks[b].every(function (t) { return set[t]; })) { return true; }
        }
      }
      return false;
    }
    if (exato(L.intents) || exato(L.ents) || exato(L.escalas)) { return null; }
    return capitalizar(palavras[0]);
  };

  // ---------- abertura da conversa ----------
  // opcoes: { hora: 0-23, email: 'fulano@x.com' }
  L.abertura = function (E, modo, opcoes) {
    opcoes = opcoes || {};
    var saud = L.saudacaoHora(opcoes.hora);
    if (modo === 'home') {
      E.aguardandoNome = true;
      return resp([saud + '! \ud83d\ude0a Eu sou a Lauana, atendente virtual daqui.', 'Como \u00e9 o seu nome?'], ['Prefiro n\u00e3o dizer'], { id: 'abertura', neutro: true });
    }
    if (modo === 'painel') {
      var nome = L.nomeDeEmail(opcoes.email);
      if (nome) { E.nome = nome; }
      return resp([saud + (nome ? ', ' + nome : '') + '! \ud83d\ude0a Eu sou a Lauana. Precisa de ajuda com o painel?'], L.chipsPadrao('painel'), { id: 'abertura', neutro: true });
    }
    return resp([saud + '! \ud83d\ude0a Eu sou a Lauana. Posso ajudar com o uso do site (microfone, envio, link). Sobre as perguntas e os resultados, quem te ajuda \u00e9 o profissional que te enviou o link.'], L.chipsPadrao('paciente'), { id: 'abertura', neutro: true });
  };

  // guarda uma pergunta que a pessoa fez ao abrir a conversa (ex.: clicou num botao do roteiro)
  L.definirPendente = function (E, msg) { E.pendenteMsg = msg; };

  var RECUSAS = ['prefiro nao', 'nao quero', 'nao precisa', 'sem nome', 'pular', 'anonimo', 'nao importa', 'nao vou dizer', 'nao falo'];
  function comPendente(E, modo, r0) {
    if (!E.pendenteMsg) { return r0; }
    var m = E.pendenteMsg; E.pendenteMsg = null;
    var r2 = L.processar(m, E, modo);
    r2.msgs = r0.msgs.slice(0, 1).concat(r2.msgs);
    return r2;
  }
  // Quando a conversa esta esperando o nome. Devolve resposta, ou null se a pessoa fez uma pergunta.
  L.tratarNome = function (texto, n, E, modo) {
    var chips = L.chipsPadrao(modo);
    var recusou = n.split(' ').length <= 5 && RECUSAS.some(function (x) { return n.indexOf(x) >= 0; });
    if (recusou) {
      E.aguardandoNome = false; E.nomePendente = false;
      return comPendente(E, modo, resp(['Tudo bem, sem problema! \ud83d\ude0a' + (E.pendenteMsg ? '' : ' Como posso te ajudar?')], chips, { id: 'nome-recusou', neutro: true }));
    }
    var nome = L.extrairNome(texto);
    if (nome) {
      E.nome = nome; E.aguardandoNome = false; E.nomePendente = false;
      var rn = comPendente(E, modo, resp(['Prazer, ' + nome + '! \ud83d\ude0a'], chips, { id: 'nome-ok', neutro: true }));
      // depois do nome, pergunta a cidade (uma vez so, e so se nao abriu outra conversa guiada)
      if (modo === 'home' && !E.flow && rn.acao !== 'gravar' && !E.cidadePerguntada && L.config.cidade !== false && L.config.gravar !== false) {
        E.cidadePerguntada = true; E.aguardandoCidade = true;
        rn.msgs.push(PERGUNTA_CIDADE);
        if (rn.id === 'nome-ok') { rn.chips = ['Prefiro n\u00e3o dizer']; }
      } else if (rn.id === 'nome-ok') { rn.msgs.push('Como posso te ajudar?'); }
      return rn;
    }
    // nao parece um nome: a pessoa ja foi direto ao assunto. Atende primeiro; pergunta de novo no maximo 1 vez.
    E.aguardandoNome = false; E.pendenteMsg = null;
    if ((E.nomePerguntas || 1) < 2) { E.nomePendente = true; }
    return null;
  };

  // ---------- CIDADE (so curiosidade: de onde o pessoal vem) ----------
  // Guarda apenas cidade/UF. Nunca junto com o nome. Opcional: "prefiro nao dizer" e aceito.
  var PERGUNTA_CIDADE = 'De que cidade voc\u00ea fala? \ud83c\udf0e \u00c9 s\u00f3 curiosidade nossa, para saber de onde o pessoal vem. Guardo apenas a cidade, sem o seu nome.';
  var UFS = ['ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'sp', 'se', 'to'];
  var MINUSCULAS = ['de', 'da', 'do', 'das', 'dos', 'e'];
  var PREFIXOS_CIDADE = [['eu', 'sou', 'de'], ['sou', 'de'], ['moro', 'em'], ['moro', 'na'], ['moro', 'no'], ['moro', 'aqui', 'em'], ['falo', 'de'], ['falo', 'da'], ['estou', 'em'], ['aqui', 'de'],
    ['aqui', 'em'], ['da', 'cidade', 'de'], ['cidade', 'de'], ['sou', 'da'], ['sou', 'do'], ['vim', 'de'], ['de'], ['em']];
  PREFIXOS_CIDADE.push(['eu', 'sou', 'da', 'cidade', 'de'], ['sou', 'da', 'cidade', 'de'], ['moro', 'na', 'cidade', 'de'], ['sou', 'natural', 'de'], ['sou', 'de', 'la', 'de']);
  PREFIXOS_CIDADE.sort(function (a, b) { return b.length - a.length; });   // o mais longo primeiro
  function titulo(p) { return MINUSCULAS.indexOf(norm(p)) >= 0 ? norm(p) : capitalizar(p); }
  // devolve { cidade: 'Campo Grande', uf: 'MS' } ou null
  var ENDERECO = ['rua', 'avenida', 'av', 'travessa', 'alameda', 'bairro', 'praca', 'rodovia', 'estrada', 'apartamento', 'apto', 'casa', 'condominio', 'quadra', 'lote', 'cep', 'numero', 'endereco', 'residencial', 'vila'];
  L.extrairCidade = function (texto) {
    // endereco (rua, bairro, numero, CEP...) NUNCA e guardado: devolve 'endereco' para ela explicar que so quer a cidade
    var pal = norm(texto).split(' ');
    if (pal.some(function (p) { return ENDERECO.indexOf(p) >= 0; }) || /\d{5}-?\d{3}/.test(texto)) { return 'endereco'; }
    if (/[?<>\d@=]/.test(texto.replace(/\s*\/\s*/g, ' '))) { return null; }
    var limpo = String(texto).replace(/[!.,;:()]/g, ' ').replace(/\s+-\s+|\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
    var palavras = limpo.split(' '), nw = palavras.map(norm), i, j, uf = '';
    if (!nw.length || nw[0] === '') { return null; }
    for (i = 0; i < PREFIXOS_CIDADE.length; i++) {
      var pf = PREFIXOS_CIDADE[i], ok = nw.length > pf.length;
      for (j = 0; ok && j < pf.length; j++) { if (nw[j] !== pf[j]) { ok = false; } }
      if (ok) { nw = nw.slice(pf.length); palavras = palavras.slice(pf.length); break; }
    }
    if (nw.length > 1 && UFS.indexOf(nw[nw.length - 1]) >= 0) { uf = nw[nw.length - 1].toUpperCase(); nw.pop(); palavras.pop(); }
    if (nw.length === 1 && nw[0].length === 2 && UFS.indexOf(nw[0]) >= 0) { return { cidade: '', uf: nw[0].toUpperCase() }; }
    if (nw.length < 1 || nw.length > 5) { return null; }
    for (j = 0; j < palavras.length; j++) {
      if (!/^[A-Za-z\u00C0-\u00FF'\-]{2,25}$/.test(palavras[j]) || NAO_NOME.indexOf(nw[j]) >= 0) { return null; }
    }
    var set = L._f.mkSet(L.tokens(palavras.join(' ')));
    L._f.melhorIntencao(set, 'home', null); L._f.acharEntidade(set); L._f.acharEscala(set);
    var listas = [L.intents, L.ents, L.escalas];
    for (i = 0; i < listas.length; i++) {
      for (j = 0; j < listas[i].length; j++) {
        var ks = listas[i][j]._k || [];
        for (var b = 0; b < ks.length; b++) { if (ks[b].length && ks[b].every(function (t) { return set[t]; })) { return null; } }
      }
    }
    return { cidade: palavras.map(titulo).join(' '), uf: uf };
  };
  L.tratarCidade = function (texto, n, E, modo) {
    E.aguardandoCidade = false;
    var chips = L.chipsPadrao(modo);
    if (n.split(' ').length <= 5 && RECUSAS.concat(['nao sei', 'nao falo']).some(function (x) { return n.indexOf(x) >= 0; })) {
      return resp(['Tudo bem, sem problema! \ud83d\ude0a Como posso te ajudar?'], chips, { id: 'cidade-recusou', neutro: true });
    }
    var c = L.extrairCidade(texto);
    if (c === 'endereco') {                    // so precisamos da cidade; nada de rua, bairro ou numero
      if (!E.tentouEndereco) {
        E.tentouEndereco = true; E.aguardandoCidade = true;
        return resp(['S\u00f3 preciso da cidade, t\u00e1? \ud83d\ude0a Nada de rua, bairro ou n\u00famero. Pode dizer s\u00f3 o nome da cidade?'], ['Prefiro n\u00e3o dizer'], { id: 'cidade-so-cidade', neutro: true });
      }
      return resp(['Tudo bem, sem problema! \ud83d\ude0a Como posso te ajudar?'], chips, { id: 'cidade-recusou', neutro: true });
    }
    if (!c) { return null; }                   // era uma pergunta: atende normalmente, sem insistir
    E.cidade = c.cidade; E.uf = c.uf;
    var onde = c.cidade ? c.cidade + (c.uf ? '/' + c.uf : '') : c.uf;
    var graca = (norm(c.cidade) === 'campo grande') ? 'Olha s\u00f3, o S\u00e9rgio tamb\u00e9m \u00e9 de Campo Grande! \ud83d\ude04' : 'Que legal, ' + onde + '! \ud83d\ude0a';
    var r = resp([graca + ' Obrigada por contar. Como posso te ajudar?'], chips, { id: 'cidade-ok', neutro: true });
    r.registro = { tipo: 'cidade', cidade: c.cidade, uf: c.uf };    // so isso e guardado (nunca o nome)
    return r;
  };

  // ---------- usar o nome com moderacao ----------
  L.empatiaComNome = function (pre, nome, nivel) {
    if (!nome) { return pre; }
    if (nivel === 1) { return pre.replace('Entendo,', 'Entendo, ' + nome + ','); }
    return nome + ', ' + pre.charAt(0).toLowerCase() + pre.slice(1);
  };
  L.depoisDaResposta = function (r, cl, E, modo) {
    // desculpa sem assunto definido: "Entendo, Ana, e sinto muito..."
    if (E.nome && r.id === 'raiva_generica' && r.msgs.length) { r.msgs[0] = r.msgs[0].replace('Entendo,', 'Entendo, ' + E.nome + ','); }
    // agradecimento e despedida com o nome
    if (E.nome && r.msgs.length && (r.id === 'obrigado' || r.id === 'obrigado2' || r.id === 'tchau')) {
      r.msgs[0] = r.msgs[0].replace(/^(At\u00e9 mais|Tchau, tchau|Por nada|Imagina|Que bom)/, '$1, ' + E.nome);
    }
    // se ainda nao sabemos o nome e a pessoa foi direto ao assunto, pergunta uma vez, no fim
    if (E.nomePendente && modo === 'home' && !r.neutro && !cl.raiva && !E.flow && r.acao !== 'gravar') {
      r.msgs.push('A prop\u00f3sito, como posso te chamar? \ud83d\ude0a');
      E.nomePendente = false; E.aguardandoNome = true; E.nomePerguntas = 2;
    }
    return r;
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-tratamento.js */
// ============================================================
// LAUANA - TRATAMENTO (Dr. / Dra.) E PROFISSAO
//  - "Sou profissional" NAO e nome: e a profissao da pessoa
//  - depois que sabe o nome e a profissao, trata por Dr. ou Dra.
//  - genero do nome: lista de nomes brasileiros (+ terminacao a/o). Nome desconhecido: ela diz com bom humor
//    e pergunta como a pessoa prefere ser tratada (nada de chutar sem avisar)
//  - se errar e a pessoa corrigir ("sou mulher"), ela pede desculpas com leveza e troca o tratamento
//  - na Etapa 3 a IA pode palpitar o genero de nomes de fora (L.generoPorIA); aqui so regras
// Tudo fica so na memoria da conversa (E.papel, E.genero): nada e gravado.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, norm = L.norm, resp = L.resp;

  // ---------- lista de nomes (sem acento, minusculo) ----------
  var MASC = ('joao jose antonio francisco carlos paulo pedro lucas luiz luis marcos marco luciano gabriel rafael daniel marcelo bruno eduardo felipe filipe rodrigo manoel manuel fernando fabio leandro gustavo guilherme leonardo matheus mateus thiago tiago diego andre alexandre ricardo roberto sergio jorge julio cesar renato vinicius vitor victor henrique anderson edson edgar edgard wellington wesley jefferson jeferson ronaldo reinaldo rogerio claudio claudemir cleber clayton cristiano cristovao davi arthur artur augusto bernardo caio cassio danilo douglas elton emerson everton fabricio flavio gilberto gilson heitor hugo igor ivan jonas joel jonathan jonatas juliano kleber leonel lourenco marcio mauricio mauro miguel murilo nelson nicolas otavio octavio osvaldo oswaldo patrick raul ruan samuel saulo silvio stefano tales tarcisio teodoro valter walter wagner washington william yuri adriano adilson alan alberto alex alexsandro aldo alfredo amauri ary ayrton benedito breno bryan celso cicero cleiton dario denis dener diogo domingos edmilson elias enzo erick erik ezequiel fabiano felix fred geraldo gilmar giovani giovanni glauber helio horacio humberto isaac jair jeremias joaquim juan junior kaique kevin lauro leo levi lincoln luan lucio magno marlon martin mario matias max maycon michel miro moises nathan neto nilton noel olavo omar orlando oscar pablo paulino plinio quintino rael ramon raimundo regis reginaldo renan rian rubens ruy salvador sandro santiago saul sebastiao severino sidney simao tadeu telmo thales theo thomas ulisses valdir vagner valdemar vando vicente vilmar vitorio wilson xavier zacarias vanderlei vander dalton dionisio emanuel enrico erasmo eliseu eder edu fausto gerson gil gregorio hamilton haroldo heron hilton ismael israel ivo jackson jairo janio jean jhonatan josue kayque kleiton laerte lazaro luca lucca bira zeca juca kaua joshua gael nikolas nicholas ian ivan davy dante romeu rui tomas tobias ubirajara vlademir zeno').split(' ');
  var FEM = ('maria ana francisca antonia adriana juliana marcia fernanda patricia aline sandra camila amanda bruna jessica leticia julia luciana vanessa mariana beatriz carolina gabriela rafaela daniela renata tatiana simone viviane cristiane claudia cristina sonia monica paula paola paloma raquel rosa rosana rosangela rita regina rebeca priscila natalia nathalia natasha livia lara larissa laura lais isabel isabela isadora helena heloisa gisele giovana fabiana fatima flavia eliane elisa elisabete elizabeth ester eva erica emilia elaine eduarda debora denise diana dayane carla carmen carmem catarina celia clara cleide cecilia bianca barbara bernadete benedita aparecida angela angelica andreia andrea alice alessandra alexandra aurea aurora ariane beth bia cida dani dri duda gabi ju lu li mari nanda pri sol thais thaisa valeria vera veronica vitoria yasmin yasmim yara zilda zelia luzia luisa lucia lourdes lidia leila kelly kelen keila karina karen jaqueline joana joyce jussara janaina ingrid iara ines irene iris ivone ivete jade jane janete jenifer jennifer lilian liliane lorena luana lucimara magda manuela margarida marina marilia marli marta mayara melissa michele michelle miriam mirian monique nadia nair neusa nicole nilza noemi odete olivia pamela rute ruth sabrina samira sara sarah selma silvia silvana sheila shirley solange sophia sofia stella stephanie suelen suzana tais tainara talita tamires tania teresa terezinha thalita thamires ursula valentina valquiria vilma wanda wendy zaira conceicao assuncao socorro consuelo dolores mercedes carmo rosario gleice gleise ketlin kethlen eloa maite hellen helen').split(' ');
  var MASC_SET = {}, FEM_SET = {}, i;
  for (i = 0; i < MASC.length; i++) { MASC_SET[MASC[i]] = 1; }
  for (i = 0; i < FEM.length; i++) { FEM_SET[FEM[i]] = 1; }

  // devolve 'm', 'f' ou null (nao sabe). Nome composto: usa o primeiro.
  L.generoDoNome = function (nome) {
    var p = norm(String(nome || '')).split(' ')[0];
    if (!p) { return null; }
    if (FEM_SET[p]) { return 'f'; }
    if (MASC_SET[p]) { return 'm'; }
    if (p.length >= 4 && /a$/.test(p)) { return 'f'; }
    if (p.length >= 4 && /o$/.test(p)) { return 'm'; }
    return null;
  };

  // ---------- tratamento ----------
  function generoDe(E) {
    if (!E.genero && E.nome) { var gg = L.generoDoNome(E.nome); if (gg) { E.genero = gg; E.generoChute = true; } }
    return E.genero || null;
  }
  L.tratamento = function (E) {
    if (!E.nome) { return ''; }
    if (E.papel !== 'prof') { return E.nome; }
    var gn = generoDe(E);
    return (gn === 'f' ? 'Dra. ' : gn === 'm' ? 'Dr. ' : 'Dr(a). ') + E.nome;
  };
  function saud(E) { return L.saudacaoHora(E.hora); }
  var SORRISO = '\ud83d\ude0a', RISADA = '\ud83d\ude04';
  function msgDesconhecido(E) {
    E.aguardandoGenero = true; E.titulado = true;
    return ['Que nome diferente, Dr(a). ' + E.nome + '! ' + RISADA, 'Daqui eu n\u00e3o consigo ver o seu g\u00eanero. Se quiser me contar, eu trato voc\u00ea do jeito que preferir, combinado?'];
  }
  var CHIPS_GENERO = ['Sou mulher', 'Sou homem', 'Pode ser Dr(a).'];

  // ---------- reconhecer profissao e genero no texto ----------
  var PROF = '(profissional|psicolog[oa]|neuropsicolog[oa]|terapeuta|psiquiatra|medic[oa]|fonoaudiolog[oa]|psicopedagog[oa]|pedagog[oa]|doutor|doutora|dr|dra|neurologista|neuropediatra|enfermeir[oa]|fisioterapeuta|assistente social)';
  var RE_PROF = new RegExp('(^| )(sou|eu sou|trabalho como|atuo como|sou um|sou uma)( o| a| um| uma)? ' + PROF + '( |$)');
  var RE_ESTUD = /(^| )sou (um |uma )?(estudante|aluno|aluna|graduando|graduanda)( |$)/;
  function generoDaProfissao(n) {
    var m = n.match(RE_PROF), w = m ? m[4] : (n === 'profissional' ? 'profissional' : '');
    if (/^(dra|doutora)$/.test(w) || /(psicologa|medica|enfermeira|pedagoga|fonoaudiologa)$/.test(w)) { return 'f'; }
    if (/^(dr|doutor)$/.test(w) || /(psicologo|medico|enfermeiro|pedagogo|fonoaudiologo)$/.test(w)) { return 'm'; }
    return null;
  }
  function souProfissional(n) { return (n.split(' ').length <= 8) && (RE_PROF.test(n) || n === 'profissional'); }
  // genero declarado: devolve 'f', 'm', 'neutro' ou null
  function generoDeclarado(n, E) {
    var k = n.split(' ');
    if (k.length > 7) { return null; }
    var explicito = /(^| )(sou|eu sou|me chame de|me chama de|pode me chamar de|pode ser|trate me|trate me como|na verdade sou|so que sou|e que sou)( |$)/.test(n);
    var perguntado = !!E.aguardandoGenero;
    if (perguntado && /(^| )(dr a|tanto faz|qualquer um|qualquer)( |$)/.test(n)) { return 'neutro'; }
    // palavras claras: aceitas se for declaracao ("sou ..."), resposta a pergunta, ou frase curta logo depois de ser tratada(o) por titulo
    var clara = explicito || perguntado || (E.titulado && k.length <= 3);
    if (clara) {
      if (/(^| )(mulher|menina|feminino|feminina)( |$)/.test(n)) { return 'f'; }
      if (/(^| )(homem|menino|masculino)( |$)/.test(n)) { return 'm'; }
    }
    // palavras ambiguas (ele, ela, Dr, Dra): so em declaracao explicita ou resposta a pergunta
    if (explicito || perguntado) {
      if (/(^| )(ela|dra|doutora)( |$)/.test(n)) { return 'f'; }
      if (/(^| )(ele|dr|doutor)( |$)/.test(n)) { return 'm'; }
    }
    return null;
  }

  // ---------- gancho principal (chamado pelo nucleo, antes de nome e cidade) ----------
  L.tratarPapel = function (texto, n, E, modo) {
    if (modo === 'paciente') { return null; }
    var gdec, rr;
    // 1) "Dr. Ana" / "Dra Ana" digitado como nome
    if (E.aguardandoNome) {
      var mt = n.match(/^(dr|dra|doutor|doutora) (.+)$/);
      if (mt) {
        E.papel = 'prof'; E.genero = (mt[1] === 'dra' || mt[1] === 'doutora') ? 'f' : 'm'; E.generoChute = false;
        return L.tratarNome(String(texto).replace(/^\s*(dr|dra|doutor|doutora)\.?\s+/i, ''), mt[2], E, modo);
      }
    }
    // 2) a pessoa estava respondendo "como prefere ser tratada(o)"
    gdec = generoDeclarado(n, E);
    // "sou psicologa" / "sou a Dra." depois de ter sido chamado por Dr.: e uma correcao
    if (!gdec && E.titulado && E.genero && souProfissional(n)) {
      var g2 = generoDaProfissao(n);
      if (g2 && g2 !== E.genero) { gdec = g2; }
    }
    if (gdec && (!souProfissional(n) || E.titulado)) {
      var jaTinha = E.genero, chutou = E.generoChute, perguntado = E.aguardandoGenero;
      E.aguardandoGenero = false;
      if (gdec === 'neutro') {
        E.generoNeutro = true;
        return resp(['Combinado! ' + SORRISO + ' ' + (E.nome ? L.tratamento(E) + ', c' : 'C') + 'omo posso ajudar?'], L.chipsPadrao(modo), { id: 'genero-neutro', neutro: true });
      }
      E.genero = gdec; E.generoChute = false; E.generoNeutro = false;
      var t = L.tratamento(E), ms;
      if (jaTinha && jaTinha !== gdec && E.titulado) {
        ms = ['Ops! ' + RISADA + ' Me perdoe! Daqui eu n\u00e3o consigo te ver pessoalmente.', saud(E) + ', ' + t + '! Como posso ajudar?'];
      } else if (jaTinha === gdec && chutou && E.titulado) {
        ms = ['Ufa, ent\u00e3o eu acertei! ' + RISADA + ' Como posso ajudar, ' + t + '?'];
      } else {
        ms = ['Anotado! ' + SORRISO + (E.nome ? ' ' + (E.papel === 'prof' ? 'Ent\u00e3o, ' + saud(E).toLowerCase() + ', ' + t + '.' : 'Prazer, ' + t + '.') : '') + ' Como posso ajudar?'];
      }
      if (E.papel === 'prof') { E.titulado = true; }
      if (E.aguardandoCidade) { ms.push('E de que cidade voc\u00ea fala? \ud83c\udf0e'); }
      return resp(ms, L.chipsPadrao(modo), { id: 'genero-ok', neutro: true });
    }
    if (E.aguardandoGenero) { E.aguardandoGenero = false; }   // fez outra pergunta: segue o assunto
    // 3) "sou estudante": nao e Dr./Dra. (deixa o fluxo normal responder)
    if (RE_ESTUD.test(n)) { if (E.papel !== 'prof') { E.papel = 'est'; } return null; }
    // 4) "sou profissional / psicologa / ..."
    if (souProfissional(n)) {
      var gp = generoDaProfissao(n);
      E.papel = 'prof';
      if (gp && !E.genero) { E.genero = gp; E.generoChute = false; }
      if (!E.nome) {
        if (E.aguardandoNome) {      // ainda nao sabe o nome: pede de novo, sem confundir profissao com nome
          return resp(['Que bom ter voc\u00ea por aqui! ' + SORRISO, 'E como \u00e9 o seu nome?'], ['Prefiro n\u00e3o dizer'], { id: 'prof-pede-nome', neutro: true });
        }
        return null;
      }
      E.aguardandoCidade = false;     // "sou psicologa" nao e uma cidade: a pergunta da cidade fica para outra hora
      if (generoDe(E)) { E._saudarTitulo = true; E.titulado = true; return null; }
      rr = resp(msgDesconhecido(E), CHIPS_GENERO, { id: 'prof-genero-pergunta', neutro: true, precisaGenero: 'saudacao' });   // com IA ligada, o widget tenta chutar antes de perguntar
      return rr;
    }
    return null;
  };

  // ---------- depois do nome: se ja sabemos que e profissional, ja trata por Dr./Dra. ----------
  var tratarNomeOrig = L.tratarNome;
  L.tratarNome = function (texto, n, E, modo) {
    var antes = E.nome, r = tratarNomeOrig(texto, n, E, modo);
    if (r && !antes && E.nome && E.papel === 'prof' && r.msgs && r.msgs.length) {
      E.titulado = true;
      if (generoDe(E)) { r.msgs[0] = 'Prazer, ' + L.tratamento(E) + '! ' + SORRISO; }
      else {
        var extra = msgDesconhecido(E);
        r.msgs = [extra[0], extra[1]]; r.chips = CHIPS_GENERO; E.aguardandoCidade = false; r.precisaGenero = 'prazer';
      }
    }
    return r;
  };

  // ---------- cumprimento com titulo antes da resposta; despedidas usam o titulo ----------
  var depoisOrig = L.depoisDaResposta;
  L.depoisDaResposta = function (r, cl, E, modo) {
    var nomeOrig = E.nome;
    if (E.papel === 'prof' && E.nome) { E.nome = L.tratamento(E); }
    try { r = depoisOrig(r, cl, E, modo); } finally { E.nome = nomeOrig; }
    if (E._saudarTitulo) {
      E._saudarTitulo = false;
      if (r && r.msgs) { r.msgs.unshift(saud(E) + ', ' + L.tratamento(E) + '! ' + SORRISO); }
    }
    return r;
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-idiomas.js */
// ============================================================
// LAUANA - IDIOMAS (atendente poliglota)
// Regras de ouro:
//  1) Avisar logo que testes e escalas estao em PORTUGUES (normas brasileiras).
//  2) NUNCA traduzir itens ou instrucoes dos testes (invalida o instrumento).
//  3) Antes de mostrar o caminho de COMPRA, o visitante passa pelo aviso de idioma.
//  4) Precos sao em reais (R$): quem converte e o banco dele; ela nao converte nem chuta.
//  5) Emergencia: numero do pais dele (o CVV 188/SAMU 192 so valem no Brasil).
//  6) Respostas ESTAVEIS ja vem traduzidas e revisadas (i18n). O que muda (precos, novidades)
//     vai para a IA traduzir na hora (r.traduzir = 'en'|'es'|...).
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, resp = L.resp, norm = L.norm, W = L.WHATS;

  // ---- vocabulario basico EN/ES: as mesmas regras entendem perguntas simples ----
  var S = L.sin;
  S('comprar', ['buy', 'purchase', 'pay', 'payment', 'comprar', 'pagar']); S('credito', ['credit', 'credito']);
  S('preco', ['price', 'cost', 'prices', 'free', 'cheap', 'precio', 'cuesta', 'cuestan', 'costo', 'valor']);
  S('teste', ['test', 'prueba', 'pruebas']); S('escala', ['scale', 'scales', 'escala']); S('painel', ['panel', 'dashboard']);
  S('entrar', ['login', 'signin', 'register', 'registrar']); S('link', ['enlace']); S('ajudar', ['help', 'ayuda', 'ayudar']);
  S('falar', ['talk', 'speak', 'hablar', 'hablo', 'contact']); S('funcionar', ['works', 'work', 'funciona']);
  S('deixar', ['leave', 'dejar']); S('recado', ['message', 'note', 'mensaje']); S('como', ['how', 'c\u00f3mo']);
  S('reembolso', ['refund', 'reembolso']); S('sergio', ['sergio']);
  S('microfone', ['microphone']); S('nao', ['not', 'dont', 'doesnt', 'cant', 'cannot', 'wont', 'isnt']);
  L.frase('how much', 'preco'); L.frase('cuanto cuesta', 'preco'); L.frase('cuanto vale', 'preco'); L.frase('cuanto cuestan', 'preco');
  L.frase('what is', 'defin'); L.frase('que es', 'defin'); L.frase('how does', 'como'); L.frase('how do i', 'como'); L.frase('how can i', 'como');
  L.frase('como puedo', 'como'); L.frase('how to', 'como');

  // ---- deteccao do idioma (palavras que so existem em cada idioma) ----
  var DIST = {
    en: 'the is are how what can you hello thanks please price buy credits where need want have my your do does which with this that i',
    es: 'hola gracias precio ayuda necesito quiero tengo enlace prueba cuanto cuesta donde puedo como por favor el la los las es son una un mi tu que',
    pt: 'ola obrigado obrigada preco ajuda preciso quero tenho teste quanto custa onde posso voce nao sim eu meu seu uma um os as com para'
  };
  var DIC = {}; Object.keys(DIST).forEach(function (k) { DIC[k] = {}; DIST[k].split(' ').forEach(function (w) { DIC[k][w] = 1; }); });
  // palavras que existem em mais de um idioma contam pouco
  ['como', 'que', 'por', 'favor', 'una', 'un', 'tu', 'es', 'la', 'el', 'i', 'a', 'o', 'e', 'us'].forEach(function (w) { DIC.en[w] = 0; DIC.es[w] = DIC.es[w] ? 0.5 : 0; DIC.pt[w] = DIC.pt[w] ? 0.5 : 0; });
  L.detectarIdioma = function (texto, atual) {
    var ws = norm(texto).split(' '), pts = { en: 0, es: 0, pt: 0 };
    ws.forEach(function (w) { ['en', 'es', 'pt'].forEach(function (k) { if (DIC[k][w]) { pts[k] += DIC[k][w]; } }); });
    var ordem = Object.keys(pts).sort(function (a, b) { return pts[b] - pts[a]; });
    if (pts[ordem[0]] >= 2 && pts[ordem[0]] > pts[ordem[1]]) { return ordem[0]; }
    if (pts[ordem[0]] >= 1 && pts[ordem[0]] > pts[ordem[1]] && ws.length <= 3 && ordem[0] !== 'pt') { return ordem[0]; }
    return atual || 'pt';
  };
  L.i18n = { en: {}, es: {} };

  // ---- textos ESTAVEIS ja traduzidos (revisar antes de publicar) ----
  var T = L.i18n;
  function TT(id) { return T[id] || T.en; }     // idiomas alem de en/es: base em ingles, traduzida pela IA (r.traduzir)
  T.en.saud = { dia: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening' };
  T.es.saud = { dia: 'Buenos d\u00edas', tarde: 'Buenas tardes', noite: 'Buenas noches' };
  T.en.abertura = function (s) { return [s + '! \ud83d\ude0a I\'m Lauana, the virtual assistant of this site.']; };
  T.es.abertura = function (s) { return [s + '! \ud83d\ude0a Soy Lauana, la asistente virtual de este sitio.']; };
  T.en.gate = ['One important thing before we start: all tests and scales on this site are in **Portuguese** (Brazilian), and their norms are Brazilian.', 'Will the person who will answer the tests read and speak Portuguese fluently?'];
  T.es.gate = ['Algo importante antes de empezar: todas las pruebas y escalas de este sitio est\u00e1n en **portugu\u00e9s** (de Brasil), y sus normas son brasile\u00f1as.', '\u00bfLa persona que va a responder las pruebas lee y habla portugu\u00e9s con fluidez?'];
  T.en.chipsGate = ['Yes, in Portuguese', 'No', 'Just visiting']; T.es.chipsGate = ['S\u00ed, en portugu\u00e9s', 'No', 'Solo estoy mirando'];
  T.en.gate_sim = ['Great, then I can help! \ud83d\ude0a Keep in mind that the norms are Brazilian and the site buttons are in Portuguese. I will tell you the Portuguese name of each button.'];
  T.es.gate_sim = ['\u00a1Perfecto, entonces puedo ayudar! \ud83d\ude0a Recuerda que las normas son brasile\u00f1as y los botones del sitio est\u00e1n en portugu\u00e9s. Te dir\u00e9 el nombre en portugu\u00e9s de cada bot\u00f3n.'];
  T.en.gate_nao = ['Thanks for telling me. Today the site is available **only in Portuguese**, so I recommend **not buying credits** for tests in another language: they would not be valid for that person.', 'If you would like the site in your language one day, I can leave a message for S\u00e9rgio so he knows there is interest.'];
  T.es.gate_nao = ['Gracias por avisarme. Hoy el sitio est\u00e1 disponible **solo en portugu\u00e9s**, por eso recomiendo **no comprar cr\u00e9ditos** para pruebas en otro idioma: no ser\u00edan v\u00e1lidas para esa persona.', 'Si alg\u00fan d\u00eda quieres el sitio en tu idioma, puedo dejar un mensaje a S\u00e9rgio para que sepa que hay inter\u00e9s.'];
  T.en.chipsNao = ['Leave a message for S\u00e9rgio', 'No, thanks']; T.es.chipsNao = ['Dejar mensaje a S\u00e9rgio', 'No, gracias'];
  T.en.gate_visita = ['Welcome! Feel free to look around and ask me anything about how the site works. \ud83d\ude0a Remember: the tests themselves are in Portuguese.'];
  T.es.gate_visita = ['\u00a1Bienvenido/a! Puedes explorar y preguntarme lo que quieras sobre c\u00f3mo funciona el sitio. \ud83d\ude0a Recuerda: las pruebas est\u00e1n en portugu\u00e9s.'];
  T.en.moeda = 'Prices are in **Brazilian reais (R$)**. If your card is accepted, your bank converts the amount with its own rate and may add international fees or taxes, so I cannot tell you the final price in your currency (the exchange rate changes every day). I also do not know whether international cards are accepted at checkout and prefer not to guess: S\u00e9rgio can confirm on WhatsApp (67) 98423-3444.';
  T.es.moeda = 'Los precios est\u00e1n en **reales brasile\u00f1os (R$)**. Si tu tarjeta es aceptada, tu banco convierte el importe con su propio tipo de cambio y puede a\u00f1adir comisiones o impuestos internacionales; por eso no puedo decirte el precio final en tu moneda (el cambio var\u00eda cada d\u00eda). Tampoco s\u00e9 si se aceptan tarjetas internacionales al pagar y prefiero no adivinar: S\u00e9rgio puede confirmarlo por WhatsApp (67) 98423-3444.';
  T.en.compra_nao = ['Because the tests are only in Portuguese, I do not recommend buying credits for someone who does not read Portuguese. If that changes (for example, a Portuguese-speaking person will answer them), tell me and I explain how to buy.'];
  T.es.compra_nao = ['Como las pruebas est\u00e1n solo en portugu\u00e9s, no recomiendo comprar cr\u00e9ditos para alguien que no lee portugu\u00e9s. Si eso cambia (por ejemplo, responder\u00e1 una persona que habla portugu\u00e9s), d\u00edmelo y te explico c\u00f3mo comprar.'];
  T.en.emergencia = ['I\'m really sorry you are going through this. \ud83d\udc9a I can only help with how to use the site, but you do not have to face this alone.', 'If you are in distress right now, please contact the emergency service of your country (for example 112 in Europe, 911 in the USA and Canada). If you are in Brazil: CVV 188 (24 hours, free) and SAMU 192.'];
  T.es.emergencia = ['Lamento mucho que est\u00e9s pasando por esto. \ud83d\udc9a Solo puedo ayudar con el uso del sitio, pero no tienes que enfrentarlo solo/a.', 'Si est\u00e1s en crisis ahora, contacta con el servicio de emergencias de tu pa\u00eds (por ejemplo 112 en Europa, 911 en Estados Unidos). Si est\u00e1s en Brasil: CVV 188 (24 horas, gratuito) y SAMU 192.'];
  // respostas de assuntos estaveis (sem numeros que mudam)
  T.en.id = {
    credito_comprar: ['Credits are bought inside the professional panel. Open the tab of the test you use, click **"Comprar Cr\u00e9ditos"** (Buy Credits), choose a plan (single or package) and click **"Comprar"** (Buy) to go to the payment page.', 'After payment, credits are added to the account automatically within about 5 minutes.'],
    creditos_como: ['A credit is like a token for some tests. Each application uses credits, and new users receive free trial credits. Scales and the panel do not use credits. Purchased credits do not expire.'],
    oque_site: ['This is an online neuropsychological assessment platform for professionals. The professional chooses a scale or test and creates a link; the patient opens it on a phone or computer, with nothing to install; the results go back to the professional with scores and a PDF report.', 'Everything the patient answers is in Portuguese.'],
    contato_sergio: ['S\u00e9rgio Teixeira Monte (neuropsychologist, Campo Grande, Brazil) can be reached on WhatsApp (67) 98423-3444. I can also leave a message for him.'],
    saudacao: ['Hello! \ud83d\ude0a How can I help?'], obrigado: ['You\'re welcome! \ud83d\udc9a'], tchau: ['Goodbye! It was a pleasure. \ud83d\udc4b'],
    'nao-sei': ['I don\'t know that one yet, and I prefer not to guess. S\u00e9rgio can help on WhatsApp (67) 98423-3444, or I can leave a message for him.']
  };
  T.es.id = {
    credito_comprar: ['Los cr\u00e9ditos se compran dentro del panel profesional. Abre la pesta\u00f1a de la prueba que usas, haz clic en **"Comprar Cr\u00e9ditos"**, elige un plan (individual o paquete) y haz clic en **"Comprar"** para ir al pago.', 'Despu\u00e9s del pago, los cr\u00e9ditos se a\u00f1aden a la cuenta autom\u00e1ticamente en unos 5 minutos.'],
    creditos_como: ['Un cr\u00e9dito es como una ficha para algunas pruebas. Cada aplicaci\u00f3n usa cr\u00e9ditos y los usuarios nuevos reciben cr\u00e9ditos de prueba gratis. Las escalas y el panel no usan cr\u00e9ditos. Los cr\u00e9ditos comprados no caducan.'],
    oque_site: ['Es una plataforma de evaluaci\u00f3n neuropsicol\u00f3gica online para profesionales. El profesional elige una escala o prueba y crea un enlace; el paciente lo abre en el m\u00f3vil u ordenador, sin instalar nada; los resultados vuelven al profesional con puntuaciones e informe en PDF.', 'Todo lo que el paciente responde est\u00e1 en portugu\u00e9s.'],
    contato_sergio: ['S\u00e9rgio Teixeira Monte (neuropsic\u00f3logo, Campo Grande, Brasil) atiende por WhatsApp (67) 98423-3444. Tambi\u00e9n puedo dejarle un mensaje.'],
    saudacao: ['\u00a1Hola! \ud83d\ude0a \u00bfEn qu\u00e9 puedo ayudar?'], obrigado: ['\u00a1De nada! \ud83d\udc9a'], tchau: ['\u00a1Hasta luego! Fue un placer. \ud83d\udc4b'],
    'nao-sei': ['Esa a\u00fan no la s\u00e9 y prefiero no adivinar. S\u00e9rgio puede ayudar por WhatsApp (67) 98423-3444, o puedo dejarle un mensaje.']
  };
  // botoes (chips) mais comuns
  T.en.chips = { 'Falar com o S\u00e9rgio': 'Talk to S\u00e9rgio', 'Deixar recado ao S\u00e9rgio': 'Leave a message for S\u00e9rgio', 'Como funciona o site?': 'How does the site work?', 'Quanto custa?': 'How much does it cost?', 'Como comprar cr\u00e9ditos?': 'How do I buy credits?' };
  T.es.chips = { 'Falar com o S\u00e9rgio': 'Hablar con S\u00e9rgio', 'Deixar recado ao S\u00e9rgio': 'Dejar mensaje a S\u00e9rgio', 'Como funciona o site?': '\u00bfC\u00f3mo funciona el sitio?', 'Quanto custa?': '\u00bfCu\u00e1nto cuesta?', 'Como comprar cr\u00e9ditos?': '\u00bfC\u00f3mo compro cr\u00e9ditos?' };
  var IDS_DINHEIRO = ['credito_comprar', 'creditos_como', 'precos', 'credito_bonus', 'pagamento_formas', 'sem_assinatura', 'saldo', 'bateria_completa', 'reembolso', 'credito_sumiu', 'cobranca_dobro', 'credito_abandono'];
  var IDS_EMERGENCIA = ['emocional', 'ansiedade_teste', 'busca_atendimento'];
  T.en.recado_ok = ['Message saved! \ud83d\udc9a S\u00e9rgio will read it. If it is urgent, WhatsApp is faster: ' + W + '.'];
  T.es.recado_ok = ['\u00a1Mensaje guardado! \ud83d\udc9a S\u00e9rgio lo leer\u00e1. Si es urgente, WhatsApp es m\u00e1s r\u00e1pido: ' + W + '.'];
  T.en.recado_falhou = ['Sorry, I could not send it right now, probably the connection. Your message is not lost: it is still here. Shall I try again? You can also use WhatsApp: ' + W + '.'];
  T.es.recado_falhou = ['Lo siento, no pude enviarlo ahora, probablemente la conexi\u00f3n. Tu mensaje no se perdi\u00f3: sigue aqu\u00ed. \u00bfLo intento de nuevo? Tambi\u00e9n puedes usar WhatsApp: ' + W + '.'];
  T.en.trad_falhou = 'I could not translate this reply into your language right now. S\u00e9rgio can help on WhatsApp ' + W + '.';
  T.es.trad_falhou = 'No pude traducir esta respuesta a tu idioma ahora. S\u00e9rgio puede ayudar por WhatsApp ' + W + '.';
  T.en.recado_pede = ['Sure! Please write your message for S\u00e9rgio (any language is fine).'];
  T.es.recado_pede = ['\u00a1Claro! Escribe tu mensaje para S\u00e9rgio (cualquier idioma sirve).'];
  T.en.recado_contato = ['Optional: leave an e-mail or WhatsApp so he can reply (or type "skip").']; T.es.recado_contato = ['Opcional: deja un correo o WhatsApp para que \u00e9l responda (o escribe "omitir").'];

  var EMERG_EN = /suicide|kill myself|want to die|wanna die|hurt myself|self harm|end my life|do not want to live|dont want to live/;
  var EMERG_ES = /quiero morir|matarme|hacerme dano|acabar con mi vida|quitarme la vida|suicidarme|no quiero vivir/;
  var SIM = ['yes', 'yeah', 'yep', 'si', 'sim', 'portuguese', 'portugues', 'fluent', 'fluente', 'claro', 'sure', 'correct'];
  var NAO = ['no', 'nao', 'not', 'nope', 'negative'];
  var VISITA = ['visiting', 'visit', 'looking', 'curious', 'mirando', 'curiosidad', 'curioso', 'just', 'solo', 'visita'];
  function qual(n) {
    var ws = n.split(' ');
    if (ws.some(function (w) { return VISITA.indexOf(w) >= 0; })) { return 'visita'; }
    if (ws.length <= 4 && ws.some(function (w) { return NAO.indexOf(w) >= 0; }) && !ws.some(function (w) { return SIM.indexOf(w) >= 0; })) { return 'nao'; }
    if (ws.length <= 6 && ws.some(function (w) { return SIM.indexOf(w) >= 0; })) { return 'sim'; }
    return null;
  }
  function chaveHora(h) { var s = L.saudacaoHora(h); return s === 'Bom dia' ? 'dia' : (s === 'Boa tarde' ? 'tarde' : 'noite'); }
  function traduzChips(chips, id) { var m = TT(id).chips; return (chips || []).map(function (c) { return m[c] || c; }); }

  // abertura quando o navegador esta em ingles/espanhol (home)
  L.aberturaIdioma = function (E, id, hora) {
    var d0 = TT(id); E.idioma = id; E.gate = 'pendente'; E.gatePerguntado = true;
    var ra = resp(d0.abertura(d0.saud[chaveHora(hora)]).concat(d0.gate), d0.chipsGate, { id: 'abertura-' + id, neutro: true });
    if (!T[id]) { ra.traduzir = id; }
    return ra;
  };
  function perguntaGate(E) { return resp(TT(E.idioma).gate, TT(E.idioma).chipsGate, { id: 'gate', neutro: true }); }

  // roda o motor normal (em portugues) e adapta a resposta para o idioma do visitante
  function responder(texto, E, modo) {
    E._interno = true; var r; try { r = L.processar(texto, E, modo); } finally { E._interno = false; }
    return adaptar(r, E, texto);
  }
  function adaptar(r, E, texto) {
    var id = E.idioma, d = TT(id);
    if (r.acao === 'fluxo' || (E.flow && E.flow.tipo === 'recado')) { E.flow = null; return iniciarRecadoEstrangeiro(E); }
    if (IDS_EMERGENCIA.indexOf(r.id) >= 0) { r.msgs = d.emergencia.slice(); r.chips = []; return r; }
    if (IDS_DINHEIRO.indexOf(r.id) >= 0) {
      if (E.gate === 'nao') { r.msgs = d.compra_nao.slice(); r.chips = d.chipsNao.slice(); return r; }
      if (E.gate === 'pendente') { E.perguntaPendente = texto; return perguntaGate(E); }
      r.msgs = (d.id[r.id] ? d.id[r.id].slice() : r.msgs.slice()).concat([d.moeda]);
      if (!d.id[r.id]) { r.traduzir = id; r.traduzirExcetoUltimo = true; }
      r.chips = traduzChips(r.chips, id); return r;
    }
    if (d.id[r.id]) { r.msgs = d.id[r.id].slice(); r.chips = traduzChips(['Falar com o S\u00e9rgio', 'Deixar recado ao S\u00e9rgio'], id); if (r.id === 'saudacao' || r.id === 'obrigado' || r.id === 'tchau') { r.chips = []; } return r; }
    r.traduzir = id; r.chips = traduzChips(r.chips, id);      // IA traduz na hora (explicar o site; nunca itens de teste)
    return r;
  }
  function iniciarRecadoEstrangeiro(E) {
    if (L.config.gravar === false) { return resp(TT(E.idioma).id.contato_sergio.slice(), traduzChips(['Falar com o S\u00e9rgio'], E.idioma), { id: 'recado-sem-gravar', neutro: true }); }
    E.idFlow = { passo: 'texto', dados: { motivo: 'Visitante estrangeiro (' + E.idioma + ')' + (E.gate === 'nao' ? ' - interesse em outro idioma' : ''), idioma: E.idioma } };
    return resp(TT(E.idioma).recado_pede, [], { id: 'recado-' + E.idioma, neutro: true });
  }
  function fluxoRecado(texto, n, E) {
    var f = E.idFlow, d = f.dados, t = String(texto).replace(/[<>]/g, '').trim().slice(0, 500);
    if (f.passo === 'texto') {
      if (t.length < 3) { return resp(TT(E.idioma).recado_pede, [], { neutro: true }); }
      d.texto = t; f.passo = 'contato'; return resp(TT(E.idioma).recado_contato, [], { neutro: true });
    }
    d.contato = (['skip', 'omitir', 'pular', 'no', 'nao'].indexOf(n) >= 0) ? '' : t.slice(0, 60);
    if (E.nome && !d.nome) { d.nome = E.nome; }
    E.idFlow = null; E.flow = { tipo: 'gravando', passo: 'g', dados: d };
    var r = resp(['\u23f3'], [], { id: 'gravar', neutro: true });
    r.acao = 'gravar'; r.dados = { tipo: 'recado', dados: d };
    return r;
  }

  // ---- porta de entrada: chamada pelo motor antes de qualquer outra coisa ----
  L.tratarIdioma = function (texto, n, E, modo) {
    if (E._interno) { return null; }
    if (E.idFlow) { return fluxoRecado(texto, n, E); }
    var traduzida = !!E._traduzida; E._traduzida = false;      // o texto ja veio traduzido para portugues pela IA (idioma alem de en/es)
    var det = traduzida ? E.idioma : L.detectarIdioma(texto, E.idioma || 'pt');
    // sofrimento: responde NA HORA no idioma da pessoa, sem passar pelo aviso de idioma
    var idEmerg = traduzida ? '' : (EMERG_EN.test(n) ? 'en' : (EMERG_ES.test(n) ? 'es' : ''));
    if (idEmerg) { E.idioma = idEmerg; return resp(T[idEmerg].emergencia.slice(), [], { id: 'emocional', neutro: true }); }
    if (det === 'pt') {
      if (E.idioma && E.idioma !== 'pt') { E.idioma = 'pt'; }     // voltou a escrever em portugues
      return null;
    }
    if (!E.gate) { E.gate = (modo === 'paciente') ? 'ok' : 'pendente'; }
    var primeira = (E.idioma !== det) || (E.gate === 'pendente' && !E.gatePerguntado);
    E.idioma = det;
    if (E.gate === 'pendente') {
      var q = qual(n);
      if (q === 'sim') { E.gate = 'ok'; return comResposta(E, modo, TT(det).gate_sim); }
      if (q === 'nao') {
        E.gate = 'nao'; var rn = resp(TT(det).gate_nao, TT(det).chipsNao, { id: 'gate-nao', neutro: true });
        rn.registro = { tipo: 'idioma', idioma: det, gate: 'nao' }; return rn;
      }
      if (q === 'visita') {
        E.gate = 'visita'; var rv = resp(TT(det).gate_visita, traduzChips(['Como funciona o site?', 'Quanto custa?'], det), { id: 'gate-visita', neutro: true });
        rv.registro = { tipo: 'idioma', idioma: det, gate: 'visita' }; return rv;
      }
      if (primeira) {                                              // 1a mensagem estrangeira: guarda a pergunta e pergunta o idioma
        E.perguntaPendente = texto; E.gatePerguntado = true;
        return resp(TT(det).abertura(TT(det).saud[chaveHora()]).concat(TT(det).gate), TT(det).chipsGate, { id: 'gate', neutro: true });
      }
    }
    if (E.gate === 'nao' && /ing|mensaje|message|leave|dejar|recado|mensagem|deixar/.test(n) && n.split(' ').length <= 6) { return iniciarRecadoEstrangeiro(E); }
    return responder(texto, E, modo);
  };
  // gate "sim": agradece e responde a pergunta que a pessoa tinha feito antes
  function comResposta(E, modo, intro) {
    var r = resp(intro.slice(), [], { id: 'gate-sim', neutro: true });
    r.registro = { tipo: 'idioma', idioma: E.idioma, gate: 'sim' };
    if (E.perguntaPendente) {
      var p = responder(E.perguntaPendente, E, modo); E.perguntaPendente = null;
      r.msgs = r.msgs.concat(p.msgs); r.chips = p.chips; if (p.traduzir) { r.traduzir = p.traduzir; }
      if (p.acao) { r.acao = p.acao; r.dados = p.dados; }
    } else { r.chips = traduzChips(['Como comprar cr\u00e9ditos?', 'Como funciona o site?', 'Falar com o S\u00e9rgio'], E.idioma); }
    return r;
  }
  // idiomas alem de en/es: o texto base e o ingles/portugues e a IA traduz na hora (o widget le r.traduzir)
  var _tratarBase = L.tratarIdioma;
  L.tratarIdioma = function (texto, n, E, modo) {
    var r = _tratarBase(texto, n, E, modo);
    if (r && E.idioma && E.idioma !== 'pt' && !T[E.idioma] && !r.traduzir) { r.traduzir = E.idioma; }
    return r;
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-rede.js */
// ============================================================
// LAUANA - REDE (envio ao servidor, Etapa 2). Sem tela: testavel no Node.
// Regras:
//  - So diz "recebi" DEPOIS que o servidor confirmou (ok:true). Ate 3 tentativas com o MESMO "rid"
//    (o servidor nao duplica) e tempo limite por tentativa.
//  - Contadores (cidade, idioma, conversa sensivel) e "perguntas sem resposta" sao silenciosos:
//    se falharem, a conversa NAO e afetada.
//  - Nunca envia o nome junto com a cidade. Nunca envia o texto de conversas sensiveis.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU;
  var SENSIVEIS = ['emocional', 'ameaca', 'golpe', 'ofensa', 'ansiedade_teste', 'busca_atendimento'];
  var R = L.rede = { api: '', fetch: null, tempo: 12000, espera: function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); } };

  function rid() { var s = '', i; for (i = 0; i < 4; i++) { s += Math.random().toString(36).slice(2, 8); } return s.slice(0, 24); }
  R.novoRid = rid;

  // 1 tentativa, com tempo limite. Resolve { http, json } ou rejeita.
  function umaTentativa(rota, corpo, tempo) {
    var f = R.fetch || g.fetch;
    if (!f) { return Promise.reject(new Error('sem fetch')); }
    var ctl = (typeof g.AbortController === 'function') ? new g.AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, tempo || R.tempo) : null;
    return f(R.api + rota, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: ctl ? ctl.signal : undefined })
      .then(function (resp) { if (timer) { clearTimeout(timer); } return resp.json().then(function (j) { return { http: resp.status, json: j || {} }; }, function () { return { http: resp.status, json: {} }; }); },
            function (e) { if (timer) { clearTimeout(timer); } throw e; });
  }
  // ate "max" tentativas (espera 0,8s, 1,6s...). Erros 4xx (exceto 429) nao adiantam repetir.
  R.postar = function (rota, corpo, max, tempo) {
    max = max || 3; var n = 0;
    function tentar() {
      n++;
      return umaTentativa(rota, corpo, tempo).then(function (r) {
        if (r.http >= 200 && r.http < 300) { return { ok: r.json.ok !== false, json: r.json, http: r.http }; }
        if (r.http >= 400 && r.http < 500 && r.http !== 429) { return { ok: false, json: r.json, http: r.http, definitivo: true }; }
        throw new Error('http ' + r.http);
      }).catch(function (e) {
        if (n < max) { return R.espera(800 * n).then(tentar); }
        return { ok: false, json: {}, http: 0, erro: String(e && e.message || e) };
      });
    }
    return tentar();
  };

  // ---------- IA (Etapa 3): segunda chance e palpite de genero. Uma tentativa so, tempo curto: se falhar, a Lauana segue pelas regras ----------
  R.cid = rid();                 // identifica esta conversa (o servidor limita quantas respostas de IA cada conversa pode ter)
  R.tempoIA = 11000;
  R.perguntarIA = function (texto, fatos, tela) {
    return R.postar('/lauana-ia', { tipo: 'resposta', texto: String(texto || '').slice(0, 300), fatos: fatos || [], tela: tela || 'home', cid: R.cid, website: '' }, 1, R.tempoIA);
  };
  R.generoIA = function (nome) {
    return R.postar('/lauana-ia', { tipo: 'genero', nome: String(nome || '').slice(0, 30), cid: R.cid, website: '' }, 1, R.tempoIA);
  };
  // ---------- Traducao (Etapa 3b): rota propria, limites proprios. Uma tentativa so; se falhar, a Lauana mostra o texto com um aviso ----------
  R.traduzirSaida = function (itens, para) {
    return R.postar('/lauana-traduzir', { modo: 'saida', para: para, itens: itens, cid: R.cid, website: '' }, 1, R.tempoIA);
  };
  R.traduzirEntrada = function (texto) {
    return R.postar('/lauana-traduzir', { modo: 'entrada', itens: [String(texto || '').slice(0, 300)], cid: R.cid, website: '' }, 1, R.tempoIA);
  };
  // Pedido de gravacao vindo da conversa (r.acao === 'gravar'): recado ou avaliacao (depoimento)
  R.enviarGravacao = function (pedido, E, tela) {
    var d = pedido.dados || {}, id = d._rid = d._rid || rid();
    if (pedido.tipo === 'depoimento') {
      return R.postar('/save-depoimento', { nome: d.nome || 'An\u00f4nimo', nota: d.nota, texto: d.texto, servico: 'Outro' });
    }
    return R.postar('/lauana-registrar', { tipo: 'recado', rid: id, motivo: d.motivo || 'Recado', texto: d.texto, nome: d.nome || E.nome || '', contato: d.contato || '', idioma: d.idioma || E.idioma || 'pt', tela: tela || 'home', website: '' });
  };

  // Registros silenciosos (nunca atrapalham a conversa)
  R.registrarSilencioso = function (r, texto, E, tela) {
    var envios = [];
    function e(corpo) { envios.push(R.postar('/lauana-registrar', corpo, 2).catch(function () { return { ok: false }; })); }
    if (r.registro && r.registro.tipo === 'cidade') { e({ tipo: 'cidade', cidade: r.registro.cidade, uf: r.registro.uf, website: '' }); }
    if (r.registro && r.registro.tipo === 'idioma') { e({ tipo: 'idioma', idioma: r.registro.idioma, gate: r.registro.gate, website: '' }); }
    if (SENSIVEIS.indexOf(r.id) >= 0) { e({ tipo: 'sensivel', id: r.id, website: '' }); }          // so a categoria, nunca o texto
    if (r.sem) { e({ tipo: 'semresposta', rid: rid(), texto: String(texto || '').slice(0, 200), tela: tela || 'home', idioma: E.idioma || 'pt', website: '' }); }
    return Promise.all(envios);
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-ia.js */
// ============================================================
// LAUANA - IA (Etapa 3): SEGUNDA CHANCE + palpite de genero. Sem tela: testavel no Node.
// Principios:
//  - As REGRAS vem primeiro. A IA so e chamada quando as regras nao souberam (r.sem) ou para chutar genero.
//  - Nunca chama a IA em link de paciente (privacidade) nem em assunto sensivel (esses nunca viram r.sem).
//  - A IA so recebe uma BASE de fatos tirada do proprio motor (precos, prazos, passo a passo). Sem base, ela nao inventa.
//  - Qualquer falha (internet, limite, IA fora do ar, resposta suspeita) = a Lauana segue com a resposta das regras.
//  - Nada e gravado aqui. O servidor limita por conversa, por hora e por dia.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, resp = L.resp, semEmoji = L.semEmoji;
  var CONTATO = 'Contato do S\u00e9rgio (respons\u00e1vel pelo site): WhatsApp (67) 98423-3444.';

  function ks(item, campo) { if (!item._k) { item._k = (item[campo] || []).map(function (f) { return L.tokens(f); }); } return item._k; }
  function lista(x) { return Array.isArray(x) ? x : (x == null ? [] : [x]); }
  function porModo(a, modo) { if (!a) { return null; } if (Array.isArray(a)) { return a; } return a[modo] || a._ || null; }
  function limpa(s, max) { return semEmoji(String(s || '')).replace(/\s+/g, ' ').trim().slice(0, max || 500); }

  // pontua uma lista de "frases-chave" contra as palavras da pergunta: quanto mais palavras de uma chave aparecem, melhor
  function pontos(set, chaves) {
    var best = 0, i, j, achou, tot, s;
    for (i = 0; i < chaves.length; i++) {
      achou = 0; tot = chaves[i].length; s = 0;
      for (j = 0; j < tot; j++) { if (set[chaves[i][j]] && chaves[i][j].length >= 3) { achou++; s += chaves[i][j].length; } }
      if (achou && achou / tot >= 0.5 && s > best) { best = s * (achou === tot ? 2 : 1); }
    }
    return best;
  }

  // ---------- a BASE de fatos que acompanha a pergunta ----------
  L.fatosPara = function (texto, modo, E) {
    var set = L._f.mkSet(L.tokens(texto)), cand = [], i, it, txt;
    for (i = 0; i < L.intents.length; i++) {
      it = L.intents[i]; if (it.m && it.m.indexOf(modo) < 0) { continue; }
      var s = pontos(set, ks(it, 'k'));
      if (!s) { continue; }
      try { txt = (typeof it.a === 'function') ? it.a(E || L.novoEstado(), modo) : it.a; } catch (e) { txt = null; }
      txt = lista(porModo(txt, modo)).join(' ');
      if (txt) { cand.push({ s: s, t: limpa(txt) }); }
    }
    for (i = 0; i < L.ents.length; i++) {
      var e = L.ents[i], se = pontos(set, ks(e, 'nomes'));
      if (!se) { continue; }
      cand.push({ s: se + 8, t: limpa(e.nome + ': ' + [e.oque, e.preco && ('Pre\u00e7o: ' + e.preco), e.dur && ('Dura\u00e7\u00e3o: ' + e.dur), e.idade && ('Idade: ' + e.idade), e.disp && ('Dispositivo: ' + e.disp), e.como && ('Como: ' + e.como), e.extra].filter(Boolean).join(' '), 600) });
    }
    for (i = 0; i < L.escalas.length; i++) {
      var c = L.escalas[i], sc = pontos(set, ks(c, 'nomes'));
      if (sc) { cand.push({ s: sc + 6, t: limpa((c.sigla || '') + ' (' + (c.nome || '') + '): escala de rastreio ' + (c.quem || '') + '. ' + (c.desc || '') + ' Gratuita; \u00e9 rastreio, n\u00e3o diagn\u00f3stico.') }); }
    }
    for (i = 0; i < L.glos.length; i++) {
      var gl = L.glos[i], sg = pontos(set, ks(gl, 'nomes'));
      if (sg) { cand.push({ s: sg, t: limpa(lista(gl.t).join(' ')) }); }
    }
    for (i = 0; i < L.temas.length; i++) {
      var tm = L.temas[i], st = pontos(set, ks(tm, 'nomes'));
      if (st) { cand.push({ s: st, t: limpa('Para ' + tm.titulo + ' temos: ' + tm.lista + '.') }); }
    }
    cand.sort(function (a, b) { return b.s - a.s; });
    var out = [], vistos = {};
    for (i = 0; i < cand.length && out.length < 5; i++) { if (cand[i].t && !vistos[cand[i].t]) { vistos[cand[i].t] = 1; out.push(cand[i].t); } }
    out.push(CONTATO);
    return out;
  };

  // ---------- quando a IA entra ----------
  L.iaAtiva = function () { return !!(L.config && L.config.ia && L.rede && L.rede.api); };
  // o widget usa isto para mostrar "digitando..." enquanto espera
  L.vaiConsultarIA = function (r, modo) {
    if (!L.iaAtiva() || !r) { return false; }
    if (r.precisaGenero) { return true; }
    return !!(r.sem && modo !== 'paciente' && !r.acao);
  };

  // palpite de genero aceito: troca a pergunta "como prefere ser tratado?" pelo cumprimento
  L.generoPorIA = function (E, gn, modo) {
    E.genero = gn; E.generoChute = true; E.aguardandoGenero = false; E.titulado = true;
    var t = L.tratamento(E);
    return resp([(E._generoVia === 'prazer' ? 'Prazer, ' : L.saudacaoHora(E.hora) + ', ') + t + '! \ud83d\ude0a Como posso ajudar?'], L.chipsPadrao(modo), { id: 'genero-ia', neutro: true });
  };

  // Devolve SEMPRE uma Promise com a resposta final (a da IA ou, se nao der, a original das regras).
  L.refinar = function (r, texto, E, modo) {
    if (!L.vaiConsultarIA(r, modo)) { return Promise.resolve(r); }
    var R = L.rede;
    if (r.precisaGenero) {
      E._generoVia = r.precisaGenero;
      return R.generoIA(E.nome).then(function (res) {
        var gn = res && res.ok && res.json && res.json.genero;
        return (gn === 'm' || gn === 'f') ? L.generoPorIA(E, gn, modo) : r;
      }, function () { return r; });
    }
    return R.perguntarIA(texto, L.fatosPara(texto, modo, E), modo).then(function (res) {
      var j = (res && res.json) || {};
      if (!res || !res.ok) { return r; }                        // limite, rede ou erro: segue com a resposta das regras
      if (j.crise && typeof j.resposta === 'string') {           // risco: CVV na hora; so a categoria e avisada ao admin
        R.postar('/lauana-registrar', { tipo: 'sensivel', id: 'emocional', website: '' }, 2).catch(function () {});
        E.ofereceu = null;
        return resp([j.resposta], ['Falar com o S\u00e9rgio'], { id: 'ia-crise', neutro: true });
      }
      if (typeof j.resposta !== 'string' || !j.resposta.trim() || j.nao_sei) { return r; }
      E.ofereceu = null; E.falhas = 0; E.ultimoTipo = 'ia';
      var ria = resp([j.resposta.trim().slice(0, 700)], L.chipsPadrao(modo), { id: 'ia', neutro: true });
      if (E.idioma && E.idioma !== 'pt') { ria.traduzir = E.idioma; }          // a resposta da IA vem em portugues: traduz para o idioma da pessoa
      return ria;
    }, function () { return r; });
  };
})(typeof window !== 'undefined' ? window : global);

/* lauana-traducao.js */
// ============================================================
// LAUANA - TRADUCAO (Etapa 3b). Sem tela: testavel no Node.
// Para visitantes de qualquer idioma (alem do portugues):
//   ENTRADA: o que a pessoa escreve (fr, de, ja...) e traduzido para PORTUGUES; as regras respondem normalmente.
//   SAIDA:   a resposta (portugues, ou o texto-base em ingles) e traduzida para o idioma da pessoa.
// Regras de ouro (as mesmas do modulo de idiomas):
//   - itens e instrucoes de testes NUNCA sao traduzidos (a Lauana nem mostra itens);
//   - precos, telefones, links e numeros saem IDENTICOS (o servidor descarta a traducao se algo mudar);
//   - se a traducao falhar ou o limite acabar, a Lauana NUNCA fica muda: mostra o texto com um aviso e o WhatsApp.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, resp = L.resp, norm = L.norm;
  var cache = {};

  // ---------- parece estar em outro idioma? (so alem de en/es, que ja tem tratamento proprio) ----------
  var NAO_LATINO = /[\u0370-\u03FF\u0400-\u04FF\u0590-\u06FF\u0900-\u097F\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/;
  var PAL = {
    fr: 'bonjour bonsoir salut merci je vous nous est sont pas les des comment avec combien coute quel quelle peux puis veux voudrais svp dans votre vos cette',
    de: 'hallo guten morgen abend danke bitte ich nicht und der ist ein eine wie kann wieviel kostet habe brauche mein ihre sie wir mit',
    it: 'ciao grazie buongiorno buonasera sono non vorrei dove perche questo il gli ho'
  };
  var FORTES = ['bonjour', 'bonsoir', 'salut', 'merci', 'hallo', 'danke', 'ciao', 'grazie', 'buongiorno', 'buonasera'];
  var DIC = {}; Object.keys(PAL).forEach(function (k) { DIC[k] = {}; PAL[k].split(' ').forEach(function (w) { DIC[k][w] = 1; }); });
  L.pareceOutroIdioma = function (texto) {
    var t = String(texto || '');
    if (NAO_LATINO.test(t)) { return true; }
    var ws = norm(t).split(' '), pts = 0, forte = false, i, k;
    if (L.detectarIdioma && L.detectarIdioma(t, 'pt') !== 'pt') { return false; }        // en/es: ja tem tratamento proprio
    for (i = 0; i < ws.length; i++) {
      for (k in DIC) { if (DIC[k][ws[i]]) { pts++; if (FORTES.indexOf(ws[i]) >= 0) { forte = true; } } }
    }
    return pts >= 2 || (forte && ws.length <= 3);
  };

  function iaOn() { return !!(L.iaAtiva && L.iaAtiva() && L.rede && L.rede.traduzirEntrada); }
  function idiomaDeFora(E) { return !!(E.idioma && E.idioma !== 'pt' && !L.i18n[E.idioma]); }

  // ---------- ENTRADA ----------
  // O widget pergunta antes de processar a mensagem
  L.precisaEntrada = function (texto, E) {
    if (!iaOn() || !String(texto || '').trim()) { return false; }
    return idiomaDeFora(E) || L.pareceOutroIdioma(texto);
  };
  // Devolve Promise<{ texto?, crise?, falha? }>:
  //   texto  = a mensagem em portugues (E.idioma ja ajustado e marcado para o motor)
  //   crise  = resposta de emergencia pronta (pedido de socorro dito em outro idioma)
  //   falha  = nao deu para traduzir e a conversa ja esta em outro idioma: aviso fixo (nunca fica muda)
  L.traduzirEntrada = function (texto, E) {
    function falhou() {
      if (idiomaDeFora(E)) { var f = resp(L.i18n.en.id['nao-sei'].slice(), [], { id: 'traducao-falhou', neutro: true, traduzir: E.idioma }); return { falha: f }; }
      return {};                                      // 1a mensagem estranha e nao deu para traduzir: segue o fluxo normal (portugues)
    }
    return L.rede.traduzirEntrada(texto).then(function (res) {
      var j = (res && res.json) || {};
      if (!res || !res.ok || j.falhou || j.limite || !j.itens || !j.itens.length) { return falhou(); }
      var idi = String(j.idioma || '').toLowerCase();
      if (j.crise && idi !== 'pt') {                       // pedido de socorro: o aviso NUNCA se perde, mesmo se o idioma nao for identificado (nesse caso, em ingles)
        var conhecido = /^[a-z]{2,3}$/.test(idi) && idi !== 'und';
        if (conhecido) { E.idioma = idi; E.gate = E.gate || 'ok'; }
        var base = (conhecido && L.i18n[idi]) || L.i18n.en;
        var rc = resp(base.emergencia.slice(), [], { id: 'emocional', neutro: true }); if (conhecido && !L.i18n[idi]) { rc.traduzir = idi; }
        return { crise: rc, texto: j.itens[0] };
      }
      if (idi === 'pt') { if (E.idioma && E.idioma !== 'pt') { E.idioma = 'pt'; } return {}; }          // era portugues: segue normal
      if (!/^[a-z]{2,3}$/.test(idi) || idi === 'und') { return falhou(); }                                          // idioma desconhecido ('und')
      E.idioma = idi; E._traduzida = true;                                                          // o motor trata o texto como "ja traduzido"
      return { texto: String(j.itens[0] || '').slice(0, 500) };
    }, function () { return falhou(); });
  };

  // ---------- SAIDA ----------
  function comAviso(r, alvo) {
    var base = L.i18n[alvo] || L.i18n.en;
    r.msgs = r.msgs.concat([base.trad_falhou]); r.traduzir = null;
    return r;
  }
  // Traduz as mensagens e os botoes da resposta para o idioma em r.traduzir. Devolve Promise<r> (nunca rejeita).
  L.traduzirSaida = function (r) {
    var alvo = r && r.traduzir;
    if (!alvo || alvo === 'pt' || !r.msgs || !r.msgs.length) { return Promise.resolve(r); }
    if (!iaOn() || !L.rede.traduzirSaida) { return Promise.resolve(comAviso(r, alvo)); }
    var nm = r.msgs.length, itens = r.msgs.concat(r.chips || []).slice(0, 10);
    var chave = alvo + '|' + itens.join('\u0001');
    if (cache[chave]) { r.msgs = cache[chave].slice(0, nm); r.chips = cache[chave].slice(nm); r.traduzir = null; return Promise.resolve(r); }
    return L.rede.traduzirSaida(itens, alvo).then(function (res) {
      var j = (res && res.json) || {};
      if (res && res.ok && !j.falhou && !j.limite && j.itens && j.itens.length === itens.length) {
        cache[chave] = j.itens.slice();
        r.msgs = j.itens.slice(0, nm); r.chips = j.itens.slice(nm); r.traduzir = null;
        return r;
      }
      return comAviso(r, alvo);
    }, function () { return comAviso(r, alvo); });
  };
  L._limparCacheTraducao = function () { cache = {}; };
})(typeof window !== 'undefined' ? window : global);

/* kb-testes.js */
// ============================================================
// LAUANA - TESTES, PROGRAMAS E FERRAMENTAS (um por um)
// FONTES: site/online/index.html (painel) e manuais manual-*.html
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU;
  var COMO = 'No painel, abra a aba do teste, clique em "Nova Aplica\u00e7\u00e3o", preencha os dados do paciente e escolha "Gerar Link" (para enviar) ou "Aplicar Localmente" (para fazer na hora, no mesmo aparelho).';
  var GRAT1 = 'Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40) e R$ 3 cada no pacote de 50 (R$ 150).';
  function T(id, nome, nomes, oque, extra, idade, dur, disp, preco, como) {
    L.ents.push({ id: id, nome: nome, nomes: nomes, oque: oque, extra: extra, idade: idade, dur: dur, disp: disp, preco: preco, como: como || COMO });
  }

  T('tecfe', 'TECFE', ['tecfe'],
    'O TECFE (Teste de Emparelhamento de Cartas com Feedback Estrat\u00e9gico) \u00e9 um rastreio de fun\u00e7\u00f5es executivas: flexibilidade mental, forma\u00e7\u00e3o de conceitos e controle inibit\u00f3rio. A pessoa classifica cartas por cor, forma ou n\u00famero e descobre a regra pelo retorno da tela. A regra muda sem avisar.',
    'O relat\u00f3rio em PDF traz parecer cl\u00ednico gerado por IA. \u00c9 inspirado no WCST.',
    'O TECFE vale de 6,5 a 89 anos, com a mesma aplica\u00e7\u00e3o e normas diferentes por idade.',
    'Dura em m\u00e9dia de 8 a 15 minutos. O teste termina ao completar 6 categorias ou ao acabar as 128 cartas.',
    'Funciona no navegador, sem instalar nada.',
    'O TECFE d\u00e1 1 cr\u00e9dito gr\u00e1tis no cadastro. Depois: R$ 20 avulso, R$ 15 cada no pacote de 10 (R$ 150) e R$ 10 cada no pacote de 50 (R$ 500).');
  T('bae', 'BAE', ['bae', 'bateria de atencao'],
    'A BAE (Bateria de Aten\u00e7\u00e3o Eletr\u00f4nica) avalia 5 tipos de aten\u00e7\u00e3o: concentrada, sustentada, alternada, dividida e seletiva. A pessoa responde a est\u00edmulos na tela e o sistema registra acertos, erros e tempo de rea\u00e7\u00e3o.',
    'O relat\u00f3rio sai em PDF com parecer cl\u00ednico por IA.',
    'A BAE vale a partir de 6 anos. O Manual T\u00e9cnico dela fica na aba Aten\u00e7\u00e3o e lembra que idade e escolaridade influenciam o desempenho.',
    'A bateria completa leva cerca de 20 a 30 minutos.',
    'A BAE s\u00f3 roda em computador (notebook ou desktop) com teclado. Celular e tablet s\u00e3o bloqueados: o paciente v\u00ea um aviso para abrir o link no computador e nenhum cr\u00e9dito \u00e9 gasto.',
    'A BAE d\u00e1 5 cr\u00e9ditos gr\u00e1tis no cadastro. Cada subteste custa 1 cr\u00e9dito e a bateria completa (5 testes) custa 5. Depois: R$ 25 por teste (2 cr\u00e9ditos por R$ 50 ou 8 por R$ 200).',
    'No painel, aba Aten\u00e7\u00e3o, clique em "Nova Aplica\u00e7\u00e3o", escolha quais dos 5 testes aplicar e gere o link. Avise o paciente para abrir no computador.');
  T('trmv', 'TRMV', ['trmv'],
    'O TRMV (Teste de Reconhecimento de Mem\u00f3ria Visual) mede mem\u00f3ria visual de reconhecimento. A pessoa memoriza figuras abstratas por 30 segundos e depois aponta quais viu entre outras. Ap\u00f3s 60 segundos, repete o reconhecimento.',
    'O PDF traz an\u00e1lise cl\u00ednica por IA.',
    'O TRMV vale a partir de 6 anos. Crian\u00e7as at\u00e9 12 anos veem 5 figuras; adultos de 13 a 59 veem 10; idosos de 60+ veem 5 ou 10, conforme a escolaridade.',
    'Dura cerca de 4 minutos.', 'Funciona no navegador.', GRAT1);
  T('taav', 'TAAV', ['taav'],
    'O TAAV (Teste de Aprendizagem e Armazenamento Visual) avalia como a pessoa aprende e guarda informa\u00e7\u00e3o visual. Ela memoriza 15 figuras em 5 tentativas seguidas, com uma lista de interfer\u00eancia, evoca\u00e7\u00e3o imediata, evoca\u00e7\u00e3o tardia (cerca de 20 minutos depois) e reconhecimento.',
    'O relat\u00f3rio mostra a curva de aprendizagem e traz an\u00e1lise por IA.',
    'O TAAV vale a partir de 6 anos.',
    'Tem etapas com intervalo de cerca de 20 minutos entre a aprendizagem e a evoca\u00e7\u00e3o tardia.', 'Funciona no navegador.', GRAT1);
  T('tref', 'TREF', ['tref'],
    'O TREF (Teste de Reconstru\u00e7\u00e3o e Escaneamento Facial) \u00e9 um rastreio experimental do processamento de rostos. A pessoa observa um rosto por 30 segundos e depois o reconstr\u00f3i de mem\u00f3ria, clicando nas regi\u00f5es. A ordem dos cliques mostra como ela "escaneia" o rosto.',
    '\u00c9 experimental e sem valida\u00e7\u00e3o formal. O resultado \u00e9 uma pista para a entrevista, n\u00e3o um diagn\u00f3stico.',
    'Crian\u00e7as de 6 a 12 anos veem 1 rosto; a partir de 13 anos, 2 rostos para comparar.',
    'Dura cerca de 5 minutos.', 'Funciona no navegador.', GRAT1);
  T('tflod', 'TFLOD', ['tflod'],
    'O TFLOD (Teste de Flu\u00eancia Leitora Oral Digital) mede a leitura em voz alta. A pessoa l\u00ea um texto por 1 minuto, o \u00e1udio \u00e9 transcrito por IA (Whisper) e o sistema calcula as palavras corretas por minuto.',
    'O paciente s\u00f3 l\u00ea e envia o \u00e1udio. A transcri\u00e7\u00e3o \u00e9 feita depois, no painel, quando o profissional clica em "Processar". Se o servi\u00e7o oscilar, basta clicar de novo, sem custo extra.',
    'Crian\u00e7as de 6 a 12 anos leem um texto de 148 palavras; a partir de 13 anos, um de 247.',
    'Dura cerca de 2 minutos.',
    'Precisa de microfone funcionando. O bot\u00e3o de iniciar s\u00f3 libera depois que a voz \u00e9 detectada. Leia perto do microfone, em ambiente silencioso.', GRAT1);
  T('tte', 'TTE', ['tte', 'trilhas'],
    'O TTE (Teste de Trilhas Eletr\u00f4nico) \u00e9 a vers\u00e3o digital do Trail Making Test. A pessoa conecta c\u00edrculos arrastando linhas: na Parte A, em ordem de n\u00fameros; na Parte B, alternando n\u00fameros e letras. Mede velocidade de processamento, aten\u00e7\u00e3o visual e flexibilidade.',
    'As normas ainda s\u00e3o provis\u00f3rias (em constru\u00e7\u00e3o).',
    'O TTE vale a partir de 8 anos.', 'Cada parte tem 25 itens.', 'Funciona no navegador, com arraste na tela ou mouse.',
    'No painel o TTE n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar o valor atual, pergunte ao S\u00e9rgio.');
  T('corsi', 'Corsi', ['corsi', 'blocos de corsi'],
    'O Corsi mede mem\u00f3ria de trabalho visuoespacial. A pessoa v\u00ea cubos acendendo em sequ\u00eancia e repete na mesma ordem (direta) e na ordem inversa.',
    'As normas ainda s\u00e3o provis\u00f3rias (em constru\u00e7\u00e3o).',
    'O Corsi vale a partir de 6 anos.', 'Cada cubo fica aceso 1 segundo, com 2 tentativas por n\u00edvel.', 'Funciona no navegador.',
    'No painel o Corsi n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar o valor atual, pergunte ao S\u00e9rgio.');
  T('tpvset', 'TPV-SET', ['tpv set', 'tpvset'],
    'O TPV-SET (Teste de Percep\u00e7\u00e3o Visual, adapta\u00e7\u00e3o do jogo SET) avalia percep\u00e7\u00e3o visual r\u00e1pida, busca visual e controle inibit\u00f3rio. A pessoa procura combina\u00e7\u00f5es v\u00e1lidas (SETs) numa grade de cartas, em 3 n\u00edveis de dificuldade. O avaliador escolhe quais n\u00edveis aplicar.',
    '\u00c9 gratuito e explorat\u00f3rio, sem valida\u00e7\u00e3o formal. O resultado \u00e9 um percentual livre, por n\u00edvel.',
    'O TPV-SET vale a partir de 6 anos.', 'Cada n\u00edvel aplicado tem 3 rodadas; o tempo por rodada \u00e9 de 25 segundos no N1, 40 no N2 e 60 no N3.', 'Funciona no navegador.',
    'O TPV-SET \u00e9 gratuito.');

  T('ideia', 'IDEIA', ['ideia'],
    'O IDEIA (Instrumento de Diverg\u00eancia e Elabora\u00e7\u00e3o de Ideias Alternativas) \u00e9 um rastreio de criatividade e pensamento divergente. A pessoa diz em voz alta usos alternativos para 20 est\u00edmulos, em 4 blocos que v\u00e3o ficando mais dif\u00edceis. O sistema transcreve por IA e analisa flu\u00eancia, flexibilidade, originalidade e elabora\u00e7\u00e3o.',
    '\u00c9 \u00fatil na investiga\u00e7\u00e3o de Altas Habilidades/Superdota\u00e7\u00e3o. Ap\u00f3s cerca de 20 segundos de sil\u00eancio, o sistema pergunta se a pessoa esgotou as ideias ou quer continuar, e h\u00e1 um bot\u00e3o para passar ao pr\u00f3ximo item.',
    'O IDEIA vale a partir de 6 anos, o mesmo teste para todas as idades; a classifica\u00e7\u00e3o ajusta por faixa et\u00e1ria.',
    'Dura cerca de 10 minutos.', 'Precisa de microfone funcionando e ambiente silencioso.',
    'O IDEIA d\u00e1 1 cr\u00e9dito gr\u00e1tis no cadastro. Depois: R$ 10 a aplica\u00e7\u00e3o avulsa ou pacote de 10 por R$ 80 (R$ 8 cada).');
  T('brpi', 'BRPI', ['brpi'],
    'A BRPI (Bateria de Rastreio do Processamento da Intelig\u00eancia) observa como a pessoa processa a informa\u00e7\u00e3o, em 4 m\u00f3dulos independentes: A (amplitude de mem\u00f3ria), B (organiza\u00e7\u00e3o e manipula\u00e7\u00e3o), C (racioc\u00ednio relacional) e D (integra\u00e7\u00e3o e decis\u00e3o). O profissional escolhe quais aplicar.',
    'O relat\u00f3rio em PDF traz tabelas, gr\u00e1ficos e an\u00e1lise por IA.',
    'A BRPI vale a partir de 6 anos (precisa de alfabetiza\u00e7\u00e3o inicial). Dos 6 aos 8 anos o relat\u00f3rio traz uma ressalva sobre o est\u00e1gio de desenvolvimento.',
    'Dura de 10 a 40 minutos, conforme os m\u00f3dulos escolhidos.', 'Funciona no navegador.',
    'Cada m\u00f3dulo aplicado consome 1 cr\u00e9dito (a bateria toda = 4). Voc\u00ea ganha 4 cr\u00e9ditos gr\u00e1tis para experimentar. Os pacotes pagos ainda n\u00e3o foram publicados.');
  T('bafc', 'BAFC', ['bafc'],
    'A BAFC (Bateria de Avalia\u00e7\u00e3o do Funcionamento Cognitivo) tem 4 \u00e1reas que podem ser aplicadas juntas ou separadas: Mem\u00f3ria Operacional (d\u00edgitos falados), Velocidade de Processamento e Aten\u00e7\u00e3o, Intelig\u00eancia Verbal e Intelig\u00eancia N\u00e3o-Verbal. O resultado \u00e9 comparado com pessoas da mesma idade e, a partir de 2 \u00e1reas, vira um \u00cdndice Cognitivo Global.',
    'Est\u00e1 em fase de coleta de dados: s\u00f3 a Mem\u00f3ria usa cortes das escalas Wechsler, as outras \u00e1reas t\u00eam cortes provis\u00f3rios (uso experimental).',
    'A BAFC vale a partir de 8 anos.',
    'Dura de 30 a 45 minutos para as 4 \u00e1reas (estimativa preliminar).',
    'Funciona em celular, tablet e computador. As instru\u00e7\u00f5es s\u00e3o faladas, ent\u00e3o use fones ou caixa de som em ambiente silencioso.',
    'A BAFC est\u00e1 gratuita temporariamente, durante a coleta de dados para as normas brasileiras.');
  T('tetaylor', 'TETaylor', ['tetaylor', 'taylor', 'figura de taylor', 'figura complexa'],
    'O TETaylor \u00e9 a vers\u00e3o eletr\u00f4nica da Figura Complexa de Taylor. O avaliador mostra a figura na tela e o paciente copia no papel; depois reproduz de mem\u00f3ria, com cron\u00f4metro autom\u00e1tico. Avalia constru\u00e7\u00e3o visuoespacial e mem\u00f3ria visual.',
    'Existe tamb\u00e9m a vers\u00e3o simplificada (TETaylorSimp), para adultos e idosos com baixa escolaridade.',
    'O TETaylor vale para adultos de 19 a 98 anos. A simplificada, para adultos e idosos com baixa escolaridade.',
    null, 'O avaliador aplica no computador e o paciente desenha no papel. Essa aplica\u00e7\u00e3o \u00e9 local (n\u00e3o tem link para o paciente).',
    'No painel o TETaylor n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar o valor atual, pergunte ao S\u00e9rgio.');
  T('tetaylorsimp', 'TETaylorSimp', ['tetaylorsimp', 'taylor simplificada', 'figura simplificada'],
    'O TETaylorSimp \u00e9 a vers\u00e3o simplificada da Figura de Taylor, pensada para adultos e idosos com baixa escolaridade. O paciente copia a figura no papel e depois a reproduz de mem\u00f3ria, e a pontua\u00e7\u00e3o tem 12 elementos.',
    null, 'Vale para adultos e idosos com baixa escolaridade.', null,
    'A aplica\u00e7\u00e3o \u00e9 local: o avaliador usa o computador e o paciente desenha no papel.',
    'No painel o TETaylorSimp n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar o valor atual, pergunte ao S\u00e9rgio.');
  T('prat', 'PRAt', ['prat'],
    'O PRAt (Programa de Reabilita\u00e7\u00e3o da Aten\u00e7\u00e3o) \u00e9 um treino de aten\u00e7\u00e3o visual: a pessoa associa a posi\u00e7\u00e3o de quadrados a cores de refer\u00eancia. O programa registra acertos, erros, omiss\u00f5es, trocas e tempo, e mostra a evolu\u00e7\u00e3o sess\u00e3o a sess\u00e3o.',
    '\u00c9 treino de reabilita\u00e7\u00e3o, n\u00e3o um teste com nota.', 'Serve para crian\u00e7as, adolescentes e adultos.', null,
    'Abre em tela cheia, com cron\u00f4metro.', 'No painel o PRAt n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar, pergunte ao S\u00e9rgio.');
  T('reocupa', 'REOCUPA', ['reocupa'],
    'O REOCUPA \u00e9 um programa de reabilita\u00e7\u00e3o na linha da Terapia Ocupacional. A pessoa l\u00ea em voz alta uma situa\u00e7\u00e3o do dia a dia e responde como lidaria com ela. O programa registra tempo de leitura, classifica\u00e7\u00e3o e evolu\u00e7\u00e3o.',
    'N\u00e3o d\u00e1 nota normativa. O profissional pode personalizar as perguntas.', null, null,
    'Usa reconhecimento de voz. Se o microfone falhar, o cron\u00f4metro continua e o profissional pode marcar o tempo manualmente.',
    'No painel o REOCUPA n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar, pergunte ao S\u00e9rgio.');
  T('lermais', 'LERMAIS', ['lermais', 'ler mais'],
    'O LERMAIS \u00e9 um programa de treino de leitura em voz alta, com an\u00e1lise em tempo real da velocidade e da precis\u00e3o. Os textos s\u00e3o motivacionais e falam de rela\u00e7\u00f5es sociais (amizade, fam\u00edlia, limites).',
    'Tem 3 n\u00edveis de dificuldade pelo tamanho do texto, para quem ainda n\u00e3o l\u00ea textos longos.',
    'Serve para quem j\u00e1 \u00e9 alfabetizado em portugu\u00eas, a partir de 6 anos.', null,
    'Usa reconhecimento de voz do navegador, ent\u00e3o precisa de microfone.',
    'No painel o LERMAIS n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar, pergunte ao S\u00e9rgio.');
  T('smart', 'SMART', ['smart'],
    'O SMART \u00e9 o n\u00facleo que reune os resultados dos testes de um paciente e, com ajuda de IA, prop\u00f5e metas de reabilita\u00e7\u00e3o no formato SMART (espec\u00edficas, mensur\u00e1veis, alcan\u00e7\u00e1veis, relevantes e com prazo).',
    'As metas s\u00e3o uma sugest\u00e3o. Quem decide o que adotar \u00e9 o profissional.', null, null, null,
    'No painel o SMART n\u00e3o mostra cobran\u00e7a por cr\u00e9dito. Se quiser confirmar, pergunte ao S\u00e9rgio.');
  T('prontuario', 'Prontu\u00e1rio', ['prontuario'],
    'O Prontu\u00e1rio IA grava a sess\u00e3o por voz, transcreve e organiza o conte\u00fado nos t\u00f3picos que o profissional escolher. Tamb\u00e9m funciona colando texto, sem gravar. O resultado \u00e9 um rascunho que o profissional revisa e edita antes de salvar.',
    'Antes de ir \u00e0 IA os dados passam por anonimiza\u00e7\u00e3o. Grave s\u00f3 com o consentimento do paciente. Funciona melhor no Chrome.',
    null, null, null,
    'O Prontu\u00e1rio d\u00e1 1 cr\u00e9dito gr\u00e1tis no cadastro. Cada cr\u00e9dito = 1 sess\u00e3o. Depois: R$ 5 avulso, R$ 4 cada no pacote de 10 (R$ 40) e R$ 3 cada no pacote de 50 (R$ 150).',
    'No painel, abra a aba Prontu\u00e1rio, crie um perfil de t\u00f3picos, escolha o paciente e clique em "Abrir Gravador".');
  T('agenda', 'Agenda', ['agenda'],
    'A Agenda cl\u00ednica serve para marcar consultas, ver o m\u00eas, a semana e o dia, sincronizar com o Google Calendar e compartilhar a agenda com colegas de confian\u00e7a. Ela tamb\u00e9m envia lembretes pelo Telegram, sem custo, na v\u00e9spera de cada atendimento.',
    'O paciente \u00e9 cadastrado uma vez e usado em todo o painel.', null, null, null,
    'No painel a Agenda n\u00e3o mostra cobran\u00e7a por cr\u00e9dito.');
  T('anamnese', 'Anamnese', ['anamnese'],
    'A Anamnese \u00e9 o question\u00e1rio da hist\u00f3ria cl\u00ednica. Tem dois tipos: Personalizada (o profissional escolhe se\u00e7\u00f5es e edita perguntas) e Infantil (modelo fixo, respondido pelos respons\u00e1veis). Vai por link, o respons\u00e1vel responde no celular sem instalar nada, e as respostas voltam para o painel, com PDF.',
    null, null, null, null, 'No painel a Anamnese n\u00e3o mostra cobran\u00e7a por cr\u00e9dito.');

  // ============ ESCALAS (gratuitas) ============
  function S(id, sigla, nome, nomes, quem, desc) {
    // aceita tambem "phq9" (sem espaco), alem de "phq 9"
    var extra = [];
    nomes.forEach(function (n) { if (n.indexOf(' ') > 0) { extra.push(n.replace(/ /g, '')); } });
    L.escalas.push({ id: id, sigla: sigla, nome: nome, nomes: nomes.concat(extra), quem: quem, desc: desc });
  }
  var A18 = 'para maiores de 18 anos';
  S('phq9', 'PHQ-9', 'Question\u00e1rio sobre a Sa\u00fade do Paciente', ['phq 9', 'phq'], A18, 'Rastreia depress\u00e3o e tem alerta de risco incluso.');
  S('gad7', 'GAD-7', 'Escala de Ansiedade Generalizada', ['gad 7', 'gad'], 'para pessoas a partir de 12 anos', 'Rastreia ansiedade generalizada.');
  S('dass21', 'DASS-21', 'Escala de Depress\u00e3o, Ansiedade e Estresse', ['dass 21', 'dass'], A18, 'Mede depress\u00e3o, ansiedade e estresse ao mesmo tempo.');
  S('pss10', 'PSS-10', 'Escala de Estresse Percebido', ['pss 10', 'pss'], 'para pessoas a partir de 12 anos', 'Avalia o estresse percebido no \u00faltimo m\u00eas.');
  S('pcl5', 'PCL-5', 'Lista de Verifica\u00e7\u00e3o do TEPT', ['pcl 5', 'pcl'], A18, 'Rastreia estresse p\u00f3s-traum\u00e1tico.');
  S('isi', 'ISI', '\u00cdndice de Gravidade da Ins\u00f4nia', ['isi', 'insonia'], A18, 'Avalia a gravidade da ins\u00f4nia.');
  S('audit', 'AUDIT', 'Teste de Identifica\u00e7\u00e3o de Problemas com \u00c1lcool (OMS)', ['audit'], A18, 'Rastreia uso problem\u00e1tico de \u00e1lcool.');
  S('ders', 'DERS', 'Escala de Dificuldades de Regula\u00e7\u00e3o Emocional', ['ders'], A18, 'Avalia 6 dimens\u00f5es da regula\u00e7\u00e3o emocional.');
  S('whodas', 'WHODAS 2.0', 'Avalia\u00e7\u00e3o de Incapacidade da OMS', ['whodas'], A18, 'Avalia funcionalidade em 6 dom\u00ednios.');
  S('asrs18', 'ASRS-18', 'Escala de Autoavalia\u00e7\u00e3o do TDAH em Adultos (OMS)', ['asrs 18', 'asrs'], A18, 'O adulto responde sobre si mesmo.');
  S('snap4', 'SNAP-IV', 'Escala de TDAH e TOD', ['snap iv', 'snap 4', 'snap'], 'para crian\u00e7as de 5 a 17 anos, respondida por pais ou professores', 'Avalia desaten\u00e7\u00e3o, hiperatividade e comportamento opositor.');
  S('conners', 'CONNERS', 'Escala de Conners para Pais', ['conners', 'conner'], 'para crian\u00e7as de 6 a 18 anos, respondida pelos pais', 'Avalia hiperatividade, ansiedade, conduta e problemas sociais.');
  S('teaR', 'TEA-R', 'Rastreio de Tra\u00e7os do Espectro Autista', ['tea r'], 'para crian\u00e7as de 6 a 12 anos, respondida por pais ou professores', 'Avalia 48 comportamentos em 8 subdom\u00ednios.');
  S('bapq', 'BAPQ', 'Fen\u00f3tipo Ampliado do Autismo', ['bapq'], A18, 'Identifica tra\u00e7os autistas subcl\u00ednicos em adultos e familiares.');
  S('raads', 'RAADS-R', 'Ritvo Autism Asperger Diagnostic Scale', ['raads', 'raads r'], 'para pessoas a partir de 16 anos', 'Rastreio detalhado de autismo em adultos, com 80 itens.');
  S('catq', 'CAT-Q', 'Question\u00e1rio de Camuflagem de Tra\u00e7os Autistas', ['cat q', 'catq'], 'para pessoas a partir de 16 anos', 'Mede o quanto a pessoa esconde ou compensa tra\u00e7os autistas.');
  S('aq10', 'AQ-10', 'Quociente do Espectro Autista, vers\u00e3o breve', ['aq 10', 'aq10'], 'para pessoas a partir de 16 anos', 'Rastreio r\u00e1pido de cerca de 2 minutos.');
  S('rbq', 'RBQ-2A', 'Comportamentos Repetitivos para Adultos', ['rbq 2a', 'rbq'], A18, 'Rastreia comportamentos repetitivos e interesses restritos.');
  S('mchat', 'M-CHAT-R', 'Rastreio de Autismo em Beb\u00eas', ['m chat', 'mchat'], 'para beb\u00eas de 16 a 30 meses, respondida pelos pais', 'Tem 20 perguntas de sim ou n\u00e3o e 3 n\u00edveis de risco.');
  S('teaah', 'TEA+AH', 'Dupla Excepcionalidade (autismo e altas habilidades)', ['tea ah', 'dupla excepcionalidade'], 'para crian\u00e7as e adolescentes de 6 a 18 anos', 'Rastreia a coexist\u00eancia de autismo e superdota\u00e7\u00e3o.');
  S('scared', 'SCARED', 'Transtornos Relacionados \u00e0 Ansiedade Infantil', ['scared'], 'para crian\u00e7as e adolescentes de 8 a 18 anos, que respondem sobre si', 'Rastreia p\u00e2nico, ansiedade generalizada, separa\u00e7\u00e3o, social e evita\u00e7\u00e3o escolar.');
  S('escasi', 'ESCASI', 'Ansiedade Social Infantil', ['escasi'], 'para crian\u00e7as de 6 a 16 anos', 'Rastreia ansiedade em crian\u00e7as.');
  S('sasc', 'SASC-R', 'Ansiedade Social para Crian\u00e7as', ['sasc r', 'sasc'], 'para crian\u00e7as de 6 a 12 anos', 'Avalia medo de avalia\u00e7\u00e3o negativa e evita\u00e7\u00e3o social.');
  S('cybocs', 'CY-BOCS', 'Escala Yale-Brown de Obsess\u00f5es e Compuls\u00f5es infantil', ['cy bocs', 'cybocs', 'bocs'], 'para crian\u00e7as e adolescentes de 6 a 17 anos', '\u00c9 uma entrevista cl\u00ednica aplicada pelo profissional.');
  S('ertTb', 'ERT-TB', 'Rastreio de Transtorno Bipolar', ['ert tb'], A18, 'Diferencia sinais de mania e hipomania.');
  S('cbcl', 'CBCL/6-18', 'Comportamentos Infantil', ['cbcl'], 'para crian\u00e7as de 6 a 18 anos', 'Avalia comportamentos da inf\u00e2ncia e adolesc\u00eancia.');
  S('sdq', 'SDQ', 'Dificuldades Infantil', ['sdq'], 'para crian\u00e7as de 4 a 17 anos', 'Rastreia dificuldades emocionais e de comportamento.');
  S('erndp', 'ERND-Pais', 'Rastreio do Neurodesenvolvimento (Pais)', ['erndp', 'ernd pais', 'ernd'], 'para filhos de 6 a 18 anos, respondida pelos pais', 'Rastreia 5 transtornos: TDI, TDAH, TEA, TOD e TEAp.');
  S('ernda', 'ERND-Adolescentes', 'Rastreio do Neurodesenvolvimento (autorrelato)', ['ernd adolescentes', 'ernd adolescente'], 'para adolescentes de 13 a 18 anos', 'O pr\u00f3prio adolescente responde sobre si.');
  S('erndprof', 'ERND-Professores', 'Rastreio do Neurodesenvolvimento (Professores)', ['ernd professores', 'ernd professor'], 'para alunos de 6 a 18 anos, respondida pelo professor', 'Vers\u00e3o reduzida, de 3 a 5 minutos.');
  S('brief2', 'BRIEF-2', 'Fun\u00e7\u00f5es Executivas (Pais e Professores)', ['brief 2', 'brief'], 'para crian\u00e7as de 5 a 18 anos', 'Pais ou professores avaliam o dia a dia: inibi\u00e7\u00e3o, flexibilidade, planejamento e organiza\u00e7\u00e3o.');
  S('dizcalc', 'DIZCALC', 'Rastreio de Discalculia', ['dizcalc', 'discalculia'], 'para crian\u00e7as de 7 a 14 anos', 'Pais ou professores respondem sobre 6 dom\u00ednios.');
  S('dislexia', 'Checklist de Dislexia', 'Rastreio de Dislexia', ['dislexia'], 'para crian\u00e7as de 6 a 14 anos', 'Avalia leitura, escrita, mem\u00f3ria e organiza\u00e7\u00e3o.');
  S('tdi', 'Escala TDI', 'Transtorno do Desenvolvimento Intelectual', ['tdi'], 'para crian\u00e7as de 6 a 18 anos, respondida por cuidadores', 'Avalia habilidades adaptativas.');
  S('qcp', 'QCP', 'Question\u00e1rio de Cren\u00e7as da Personalidade (Leahy)', ['qcp'], A18, 'Avalia cren\u00e7as de 10 perfis de personalidade.');
  S('ysqs3', 'YSQ-S3', 'Esquemas de Young, vers\u00e3o breve', ['ysq s3', 'ysq'], A18, 'Identifica 18 esquemas iniciais desadaptativos, com 90 itens.');
  S('ysql3', 'YSQ-L3', 'Esquemas de Young, vers\u00e3o longa', ['ysq l3'], A18, 'Vers\u00e3o completa com 232 itens.');
  S('smi', 'SMI', 'Invent\u00e1rio de Modos Esquem\u00e1ticos', ['smi'], A18, 'Avalia 14 modos emocionais, com 124 itens.');
  S('bsl23', 'BSL-23', 'Lista de Sintomas Borderline', ['bsl 23', 'bsl'], A18, 'Mede a gravidade dos sintomas na \u00faltima semana.');
  S('ert', 'ERT (personalidade)', 'Escalas de Rastreio de Tra\u00e7os de Personalidade', ['ert'], A18, 'H\u00e1 uma para cada tipo (PP, PEs, PEt, PA, PB, PH, PN, PEv, PD, POC), com 36 itens cada.');
  S('csbd19', 'CSBD-19', 'Comportamento Sexual Compulsivo, completa', ['csbd 19', 'csbd'], A18, 'Baseada na CID-11, avalia 5 dom\u00ednios.');
  S('csbd7', 'CSBD-7', 'Comportamento Sexual Compulsivo, r\u00e1pida', ['csbd 7'], A18, 'Vers\u00e3o breve, de cerca de 2 minutos.');
  S('hdsi', 'HDSI', 'Transtorno Hipersexual', ['hdsi'], A18, 'Baseada nos crit\u00e9rios propostos para o DSM-5.');
  S('eppc', 'EPPC', 'Escala de Pilares e Pontua\u00e7\u00f5es Conjugais', ['eppc', 'pilares conjugais'], 'para adultos em rela\u00e7\u00e3o conjugal (aplica\u00e7\u00e3o individual, por parceiro)', 'Tem 30 itens em 2 eixos: os 4 Pilares do casal (sexual, financeiro, divertimento e projeto futuro) e o Estilo de Pontua\u00e7\u00e3o. \u00c9 uma escala autoral do S\u00e9rgio Monte (Terapia do Esquema + Gestalt), sem valida\u00e7\u00e3o formal.');
  S('das', 'DAS', 'Escala de Ajustamento de Casais', ['das', 'ajustamento de casais'], A18, 'Avalia a qualidade do relacionamento em 4 dimens\u00f5es.');
  S('ertvt', 'ERT-VT', 'Vida Di\u00e1ria no Trabalho', ['ert vt', 'burnout'], A18, 'Avalia desgaste ocupacional e risco de burnout.');
  S('qiiahsd', 'QIIAHSD-R', 'Identifica\u00e7\u00e3o de Altas Habilidades', ['qiiahsd'], 'para crian\u00e7as e adolescentes de 6 a 18 anos, respondida pelos respons\u00e1veis', 'Avalia indicadores de superdota\u00e7\u00e3o.');
  S('renzulli', 'Renzulli (SRBCSS-R)', 'Caracter\u00edsticas Comportamentais de Superdota\u00e7\u00e3o', ['renzulli', 'srbcss'], 'para alunos de 6 a 18 anos, respondida pelo professor', 'Avalia criatividade, lideran\u00e7a e motiva\u00e7\u00e3o.');
  S('sobre', 'Sobreexcitabilidade', 'Sobreexcitabilidade de Dabrowski', ['sobreexcitabilidade', 'sobrexcitabilidade', 'sobre excitabilidade', 'dabrowski'], 'para crian\u00e7as de 3 a 17 anos, respondida por pais ou professores', 'Avalia 5 \u00e1reas de intensidade.');

  // ============ TEMAS: "tem escala de ansiedade?" ============
  function Tm(id, titulo, nomes, lista, nota) { L.temas.push({ id: id, titulo: titulo, nomes: nomes, lista: lista, nota: nota }); }
  Tm('tdah', 'TDAH', ['tdah', 'hiperatividade', 'desatencao', 'deficit de atencao'], 'ASRS-18 (adultos), SNAP-IV (5 a 17 anos, pais ou professores) e Conners (6 a 18 anos, pais)');
  Tm('autismo', 'autismo', ['autismo', 'tea', 'autista', 'asperger'], 'TEA-R (6 a 12 anos), M-CHAT-R (beb\u00eas de 16 a 30 meses), AQ-10, RAADS-R, CAT-Q, BAPQ e RBQ-2A (adultos) e TEA+AH (dupla excepcionalidade)');
  Tm('ansiedade', 'ansiedade', ['ansiedade', 'ansioso'], 'GAD-7 (a partir de 12 anos), DASS-21 (adultos), SCARED, ESCASI e SASC-R (infantis)');
  Tm('depressao', 'depress\u00e3o', ['depressao', 'depressivo'], 'PHQ-9 (adultos) e DASS-21 (adultos)');
  Tm('estresse', 'estresse', ['estresse', 'stress'], 'PSS-10 (a partir de 12 anos), DASS-21 (adultos) e PCL-5 (estresse p\u00f3s-traum\u00e1tico)');
  Tm('toc', 'TOC', ['toc', 'obsessivo', 'compulsivo'], 'CY-BOCS (crian\u00e7as e adolescentes, aplicada pelo profissional)');
  Tm('bipolar', 'bipolaridade', ['bipolar', 'bipolaridade', 'mania'], 'ERT-TB (adultos)');
  Tm('personalidade', 'personalidade', ['personalidade', 'borderline', 'narcisista'], 'as escalas ERT (uma para cada tipo), BSL-23, QCP e as de terapia do esquema (YSQ-S3, YSQ-L3 e SMI)');
  Tm('superdotacao', 'altas habilidades', ['superdotacao', 'superdotado', 'altas habilidades', 'ahsd'], 'QIIAHSD-R, Renzulli, Sobreexcitabilidade e TEA+AH, al\u00e9m do teste IDEIA (criatividade)');
  Tm('aprendizagem', 'dificuldades de aprendizagem', ['dislexia', 'discalculia', 'aprendizagem'], 'Checklist de Dislexia (6 a 14 anos) e DIZCALC (discalculia, 7 a 14 anos), al\u00e9m do teste TFLOD (leitura)');
  Tm('executivas', 'fun\u00e7\u00f5es executivas', ['funcoes executivas', 'executiva'], 'BRIEF-2 (pais e professores) e o teste TECFE');
  Tm('sono', 'sono', ['sono', 'dormir'], 'ISI (adultos)');
  Tm('alcool', '\u00e1lcool', ['alcool', 'bebida'], 'AUDIT (adultos, da OMS)');
  Tm('casais', 'relacionamento', ['casal', 'casais', 'conjugal', 'casamento'], 'DAS (Ajustamento de Casais) e EPPC (Pilares e Pontua\u00e7\u00f5es Conjugais)');
  Tm('sexual', 'comportamento sexual compulsivo', ['sexual', 'hipersexual'], 'CSBD-19, CSBD-7 e HDSI (adultos)');
  Tm('infantil', 'crian\u00e7as e adolescentes', ['infantil', 'crianca', 'adolescente'], 'CBCL, SDQ, SNAP-IV, Conners, ERND (pais, adolescentes e professores), BRIEF-2, SCARED e outras');
  Tm('trabalho', 'trabalho', ['trabalho', 'burnout'], 'ERT-VT (vida di\u00e1ria no trabalho e risco de burnout)');
  // testes por fun\u00e7\u00e3o (aten\u00e7\u00e3o, mem\u00f3ria...)
  Tm('memoria', 'mem\u00f3ria', ['memoria', 'lembrar', 'esquecimento'], 'TRMV (reconhecimento visual), TAAV (aprendizagem visual), Corsi (mem\u00f3ria de trabalho visuoespacial), TETaylor (mem\u00f3ria visual) e a \u00e1rea de Mem\u00f3ria Operacional da BAFC');
  Tm('atencao', 'aten\u00e7\u00e3o', ['atencao', 'concentracao', 'distracao'], 'BAE (5 tipos de aten\u00e7\u00e3o), TTE (trilhas), TPV-SET (busca visual) e o programa de treino PRAt, al\u00e9m das escalas de TDAH');
  Tm('leitura', 'leitura e linguagem', ['leitura', 'ler', 'fluencia', 'linguagem'], 'TFLOD (flu\u00eancia leitora em voz alta) e o programa de treino LERMAIS, al\u00e9m do checklist de dislexia');
  Tm('criatividade', 'criatividade', ['criatividade', 'criativo', 'pensamento divergente'], 'IDEIA (pensamento divergente, em voz alta)');
  Tm('percepcao', 'percep\u00e7\u00e3o visual', ['percepcao', 'visual', 'rosto', 'facial'], 'TPV-SET (percep\u00e7\u00e3o visual r\u00e1pida) e TREF (reconhecimento facial)');
  Tm('qi', 'intelig\u00eancia', ['qi', 'inteligencia', 'quociente', 'wisc', 'wais', 'raciocinio'], 'BRPI (processamento da intelig\u00eancia, a partir de 6 anos) e BAFC (a partir de 8 anos, com \u00cdndice Cognitivo Global e faixas como as dos laudos Wechsler)',
     'Importante: n\u00e3o s\u00e3o testes de QI cl\u00e1ssicos (como as escalas Wechsler) e n\u00e3o os substituem. S\u00e3o instrumentos de rastreio, em fase de coleta de normas.');
})(typeof window !== 'undefined' ? window : global);

/* kb-sitio.js */
// ============================================================
// LAUANA - CONHECIMENTO DO SITE (profissional, paciente, creditos...)
// Cada item: I(id, [palavras-chave], [respostas], opcoes)
//  respostas: texto, ou lista de textos (cada texto = um balao),
//             ou {home:[...], painel:[...], paciente:[...], _:[...]}
//  opcoes: m (modos), c (botoes), p (peso), s (explicacao simples),
//          oferece ('recado'), acao:'fluxo' + fluxo
// FONTES: site/index.html, site/online/index.html, manuais.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  L.sin('entrar', ['entra', 'entrou']); L.sin('abrir', ['abre', 'abrindo', 'aberto', 'abriu']);
  L.sin('carregar', ['carrega', 'carregando', 'carregou']); L.sin('desistir', ['desisto', 'desisti', 'desistiu']);
  function I(id, k, a, o) {
    o = o || {};
    var it = { id: id, k: k, a: a, p: o.p || 0 };
    if (o.m) { it.m = o.m; } if (o.c) { it.c = o.c; } if (o.s) { it.s = o.s; }
    if (o.alt) { it.alt = true; } if (o.neutro) { it.neutro = true; } if (o.after) { it.after = o.after; }
    if (o.oferece) { it.oferece = o.oferece; } if (o.acao) { it.acao = o.acao; it.fluxo = o.fluxo; }
    L.intents.push(it);
  }
  function CP() { return { home: L.chipsPadrao('home'), painel: L.chipsPadrao('painel'), paciente: L.chipsPadrao('paciente') }; }
  var SERGIO = ['Falar com o S\u00e9rgio', 'Deixar recado ao S\u00e9rgio'];

  // ---------------- conversa social ----------------
  I('saudacao', ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'opa', 'eae', 'hello', 'oi tudo bem'],
    ['Oi! Tudo bem? \ud83d\ude0a Eu sou a Lauana, atendente virtual daqui. Em que posso ajudar?', 'Ol\u00e1! Que bom te ver por aqui. \ud83d\udc4b Como posso ajudar?'], { c: CP(), alt: true });
  I('tudobem', ['tudo bem', 'como vai', 'como voce esta', 'como esta'],
    ['Tudo \u00f3timo, obrigada por perguntar! \ud83d\ude0a E com voc\u00ea? No que posso ajudar?'], { c: CP() });
  I('quem', ['quem voce', 'seu nome', 'voce robo', 'voce humano', 'voce real', 'voce ia', 'voce gente', 'quem fala'],
    ['Eu sou a Lauana, atendente virtual do S\u03a8M Online. \ud83d\ude0a Sou um rob\u00f4 de atendimento, n\u00e3o uma pessoa, mas conhe\u00e7o o site direitinho. Quando eu n\u00e3o souber algo, te levo at\u00e9 o S\u00e9rgio, que \u00e9 uma pessoa de verdade.'], { c: CP() });
  I('obrigado', ['obrigado', 'obrigada', 'valeu', 'brigado', 'agradeco', 'gratidao', 'entendi'],
    ['Por nada! \ud83d\ude0a Qualquer coisa, \u00e9 s\u00f3 chamar.', 'Imagina, fico feliz em ajudar! \ud83d\udc9a Se surgir outra d\u00favida, estou por aqui.'], { c: CP(), alt: true });
  I('tchau', ['tchau', 'ate mais', 'ate logo', 'xau', 'ate amanha'],
    ['At\u00e9 mais! Foi um prazer. \ud83d\udc4b', 'Tchau, tchau! Volte sempre. \ud83d\ude0a'], { alt: true });
  I('elogio_bot', ['voce legal', 'voce simpatica', 'gostei de voce', 'voce ajudou', 'bom atendimento', 'voce otima', 'adorei', 'parabens', 'muito bom'],
    ['Que bom ouvir isso! \ud83d\udc9a Se quiser, deixe uma avalia\u00e7\u00e3o: o S\u00e9rgio gosta muito de ler.'], { c: ['Deixar uma avalia\u00e7\u00e3o'] });
  I('perdido', ['perdido', 'ajuda', 'socorro', 'preciso ajuda', 'nao sei'],
    { _: ['Calma, eu te ajudo! \ud83d\ude0a Vamos por partes. Me diga qual destas op\u00e7\u00f5es est\u00e1 mais perto do que voc\u00ea precisa:'] }, { c: { home: ['Sou profissional', 'Recebi um link', 'S\u00f3 quero conhecer', 'Falar com o S\u00e9rgio'], painel: L.chipsPadrao('painel'), paciente: L.chipsPadrao('paciente') } });

  // ---------------- o site em geral ----------------
  I('oque_site', ['site funcionar', 'site servir', 'defin site', 'quem somos', 'sobre site', 'explicar site', 'plataforma funcionar', 'defin plataforma', 'usar site', 'usar plataforma', 'site fazer', 'site para'],
    { home: ['Bem-vindo(a)! \ud83d\ude0a Este site \u00e9 uma plataforma de avalia\u00e7\u00e3o neuropsicol\u00f3gica online, feita para profissionais como neuropsic\u00f3logos e psic\u00f3logos.',
             'Funciona em 3 passos: 1) o profissional escolhe uma escala ou teste e gera um link; 2) o paciente abre o link no celular ou computador e responde, sem instalar nada; 3) o resultado volta para o profissional, com pontua\u00e7\u00e3o, classifica\u00e7\u00e3o e relat\u00f3rio em PDF.',
             'Voc\u00ea \u00e9 profissional ou chegou aqui por um link que recebeu?'],
      _: ['\u00c9 uma plataforma em que o profissional envia escalas e testes por link e recebe o resultado pronto, com PDF, no painel.'] },
    { c: { home: ['Sou profissional', 'Recebi um link', 'S\u00f3 quero conhecer'], painel: L.chipsPadrao('painel'), paciente: L.chipsPadrao('paciente') },
      s: ['Pensa assim: \u00e9 como uma recep\u00e7\u00e3o digital. O profissional manda um question\u00e1rio ou um joguinho para o paciente fazer pelo celular, e o resultado volta pronto, em PDF.'] });

  // ---------------- entrar, cadastro, login ----------------
  I('prof_comecar', ['sou profissional', 'trabalho avaliacao', 'sou profissional psicologo', 'comecar usar', 'primeiros passos', 'como comecar'],
    { home: ['Que bom ter voc\u00ea por aqui! \ud83d\ude0a Para come\u00e7ar:', '1) Clique em "Acessar meu painel gratuito" no topo da p\u00e1gina. 2) Entre com sua conta (o cadastro \u00e9 autom\u00e1tico no primeiro acesso). 3) Cadastre um paciente e escolha uma escala ou um teste.',
             'O painel \u00e9 gratuito, e voc\u00ea ganha cr\u00e9ditos de cortesia para experimentar os testes. Se quiser, explico qualquer um dos passos.'],
      _: ['Para come\u00e7ar: cadastre um paciente na aba Pacientes, escolha a escala ou o teste, gere o link e envie ao paciente. O resultado aparece aqui no painel.'] },
    { c: { home: ['Como entro no painel?', 'Quanto custa?', 'Conhecer um teste'], painel: ['Gerar link para o paciente', 'Cadastrar paciente'], paciente: [] } });
  I('painel_acessar', ['entrar painel', 'acessar painel', 'acesso painel', 'entrar site', 'cadastro', 'onde entrar', 'entrar conta', 'minha conta', 'login', 'como entrar'],
    { home: ['Para entrar no painel, clique no bot\u00e3o "Acessar meu painel gratuito" no topo da p\u00e1gina inicial. Vai abrir a tela de login, onde voc\u00ea clica em "Entrar com sua conta".',
             'Se ainda n\u00e3o tem conta, n\u00e3o precisa de um cadastro separado: ele \u00e9 feito automaticamente no primeiro acesso. \ud83d\ude09',
             'Dica: no primeiro acesso o e-mail de verifica\u00e7\u00e3o pode cair na pasta Spam. Procure l\u00e1 e marque "N\u00e3o \u00e9 spam".'],
      painel: ['Voc\u00ea j\u00e1 est\u00e1 dentro do painel. \ud83d\ude0a Para sair, use o bot\u00e3o "Sair". Para entrar de novo, \u00e9 s\u00f3 clicar em "Entrar com sua conta".'],
      paciente: ['O paciente n\u00e3o precisa de login nem de cadastro. \u00c9 s\u00f3 abrir o link que o profissional enviou. O painel \u00e9 s\u00f3 para o profissional.'] },
    { c: { home: ['N\u00e3o chegou o e-mail', 'Quanto custa?'], painel: [], paciente: [] }, s: ['\u00c9 assim: no topo desta p\u00e1gina tem um bot\u00e3o "Acessar meu painel gratuito". Clicando nele, voc\u00ea chega numa tela com o bot\u00e3o "Entrar com sua conta". Pronto, \u00e9 por ali.'] });
  I('login_problema', ['nao entrar', 'senha', 'esquecer senha', 'recuperar senha', 'trocar senha', 'codigo', 'login erro', 'login nao funcionar', 'nao consigo login', 'conta nao funcionar'],
    ['Vamos resolver! 1) Se esqueceu a senha, na tela de login procure a op\u00e7\u00e3o de recuperar a senha. 2) Confira se est\u00e1 usando o mesmo e-mail do primeiro acesso. 3) Se o c\u00f3digo de verifica\u00e7\u00e3o n\u00e3o chegou, olhe a pasta Spam e marque "N\u00e3o \u00e9 spam". 4) Tente outro navegador (o Chrome costuma ser o mais compat\u00edvel).',
     'Se mesmo assim n\u00e3o entrar, me diga o que aparece na tela ou fale com o S\u00e9rgio: ' + W + '.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });
  I('email_spam', ['email sumir', 'email spam', 'spam', 'email verificacao', 'lixo eletronico', 'aviso email', 'notificacao email', 'nao recebi email', 'email nao chegar'],
    ['Os e-mails do site (verifica\u00e7\u00e3o do cadastro e o aviso de que o paciente concluiu a escala) podem cair na pasta Spam ou Lixo Eletr\u00f4nico. Procure l\u00e1 e clique em "N\u00e3o \u00e9 spam" para receber normalmente nas pr\u00f3ximas vezes.',
     'Se n\u00e3o estiver em nenhuma pasta, confira se digitou o e-mail certo. Persistindo, me avise que eu levo ao S\u00e9rgio.'], { oferece: 'recado', m: ['home', 'painel'] });
  I('sessao_expirou', ['sessao expirar', 'sessao expirou', 'sessao', 'deslogar', 'desconectar', 'pediu login', 'sair sozinho'],
    ['Quando aparece que a sess\u00e3o expirou, \u00e9 s\u00f3 reconectar: clique em "Entrar com sua conta" de novo. Os seus pacientes e resultados continuam salvos. \ud83d\ude09 O painel renova a sess\u00e3o automaticamente a cada 50 minutos enquanto voc\u00ea usa.'], { m: ['home', 'painel'] });
  I('outro_aparelho', ['outro aparelho', 'aviso aparelho', 'dois aparelhos', 'conta aberta'],
    ['Esse aviso aparece quando a mesma conta est\u00e1 aberta em outro aparelho ao mesmo tempo. Ele n\u00e3o bloqueia nada: serve para voc\u00ea perceber se o painel ficou aberto em outro lugar ou se algu\u00e9m est\u00e1 usando a sua senha. Se n\u00e3o foi voc\u00ea, troque a senha.'], { m: ['home', 'painel'] });

  // ---------------- precos e creditos ----------------
  I('precos', ['preco', 'quanto custa', 'tabela preco', 'tem custo', 'precisa comprar', 'tudo gratis', 'tem pagar', 'precisa pagar', 'tem custo', 'e pago'],
    ['Boa pergunta, vou te explicar de forma clara. \ud83d\ude0a S\u00e3o gratuitos: o painel, o cadastro de pacientes, a agenda e as mais de 50 escalas (com relat\u00f3rio em PDF). Tamb\u00e9m est\u00e3o gratuitos hoje o TPV-SET e, por enquanto, a BAFC.',
     'Alguns testes usam cr\u00e9ditos. Ao se cadastrar voc\u00ea ganha cr\u00e9ditos de cortesia para experimentar (por exemplo 1 no TECFE, 5 na BAE e 4 na BRPI). Depois, por aplica\u00e7\u00e3o: TECFE R$ 20 (pacotes a partir de R$ 10 cada); BAE R$ 25 por teste; TRMV, TAAV, TREF e TFLOD R$ 5 (pacotes a partir de R$ 3 cada); IDEIA R$ 10; Prontu\u00e1rio IA R$ 5 por sess\u00e3o.',
     'Os cr\u00e9ditos comprados n\u00e3o expiram. Quer o pre\u00e7o de algum teste espec\u00edfico?'],
    { c: ['Quanto custa o TECFE?', 'Como comprar cr\u00e9ditos?', 'Como funcionam os cr\u00e9ditos?'], m: ['home', 'painel'] });
  I('creditos_como', ['credito funcionar', 'credito consumir', 'usar credito', 'consumir credito', 'gastar credito', 'credito serve', 'como credito'],
    ['Cr\u00e9dito \u00e9 como uma ficha para usar alguns testes. Cada aplica\u00e7\u00e3o consome cr\u00e9ditos; escalas e painel n\u00e3o gastam cr\u00e9dito. O cr\u00e9dito \u00e9 cobrado quando a aplica\u00e7\u00e3o come\u00e7a, e antes de confirmar o painel mostra um aviso com a quantidade.',
     'Os cr\u00e9ditos de cortesia (brinde de boas-vindas) s\u00e3o usados antes dos comprados. Os comprados n\u00e3o expiram.'], { c: ['Quanto custa?', 'Como comprar cr\u00e9ditos?'], m: ['home', 'painel'] });
  I('credito_bonus', ['bonus', 'credito gratis', 'credito cortesia', 'cortesia', 'boas vindas', 'ganhar credito', 'credito brinde'],
    ['Ao se cadastrar voc\u00ea ganha cr\u00e9ditos de cortesia para experimentar: 1 no TECFE, TRMV, TAAV, TREF, TFLOD, IDEIA e Prontu\u00e1rio IA, 5 na BAE e 4 na BRPI. Eles s\u00e3o um brinde de demonstra\u00e7\u00e3o, sem valor monet\u00e1rio e n\u00e3o reembols\u00e1veis, e s\u00e3o usados antes dos cr\u00e9ditos comprados.'], { m: ['home', 'painel'] });
  I('credito_comprar', ['comprar credito', 'como comprar', 'adquirir credito', 'recarregar credito', 'onde comprar', 'comprar pacote', 'pacote'],
    ['Para comprar cr\u00e9ditos, abra a aba do teste que voc\u00ea usa e clique em "Comprar Cr\u00e9ditos". Escolha o plano (avulso ou pacote) e clique em "Comprar" para ir ao pagamento.',
     'Depois do pagamento, os cr\u00e9ditos entram automaticamente na sua conta em at\u00e9 5 minutos.'], { c: ['Paguei e n\u00e3o apareceu', 'Quanto custa?'], m: ['home', 'painel'] });
  I('credito_sumiu', ['credito sumir', 'comprar sumir', 'comprar credito sumir', 'pagamento sumir', 'pagar sumir', 'saldo sumir', 'creditos faltar'], 
    ['Fica tranquilo(a)! \ud83d\ude0a Os cr\u00e9ditos costumam entrar sozinhos em at\u00e9 5 minutos depois do pagamento, ent\u00e3o vale esperar um pouquinho e atualizar a p\u00e1gina.',
     'Se j\u00e1 passou desse tempo: h\u00e1 um monitoramento dessas ocorr\u00eancias, mas para agilizar fale com o S\u00e9rgio pelo ' + W + ', informando o e-mail da sua conta e o comprovante do pagamento. Se preferir, deixo um recado registrado agora.'],
    { oferece: 'recado', p: 15, c: SERGIO, s: ['Depois que voc\u00ea paga, o sistema libera os cr\u00e9ditos sozinho em at\u00e9 5 minutos. Se passou desse prazo e n\u00e3o apareceu, o S\u00e9rgio resolve: mande para ele o e-mail da sua conta e o comprovante pelo WhatsApp.'] });
  I('cobranca_dobro', ['cobrar duas vezes', 'cobrar dobro', 'cobrar errado', 'cobrar mais', 'cobrar indevido', 'cobrar sem fazer', 'cobrar sem teste', 'saldo errado', 'credito errado', 'credito descontado'],
    ['Sinto muito pelo susto. O site tem uma trava contra cobran\u00e7a em dobro e avisa o S\u00e9rgio quando detecta dois descontos seguidos do mesmo saldo.',
     'Se o seu saldo diminuiu mais do que deveria, fale com ele pelo ' + W + ', informando o e-mail da conta e qual teste foi. Ele confere e, se foi erro do sistema, devolve o cr\u00e9dito. Posso deixar um recado registrado para voc\u00ea.'], { oferece: 'recado', p: 12, c: SERGIO });
  I('credito_abandono', ['paciente abandonar', 'paciente desistir', 'paciente parar', 'paciente nao terminar', 'paciente nao fazer', 'credito perder', 'credito devolver', 'devolver credito', 'credito nao devolver', 'credito queimado', 'perder credito'],
    ['O cr\u00e9dito \u00e9 cobrado quando a aplica\u00e7\u00e3o come\u00e7a e n\u00e3o \u00e9 devolvido se o paciente abandonar ou n\u00e3o concluir o teste. O painel avisa isso antes de voc\u00ea confirmar.',
     'Se o problema foi falha do sistema (por exemplo, erro na transcri\u00e7\u00e3o do \u00e1udio), a situa\u00e7\u00e3o \u00e9 diferente: o S\u00e9rgio confere e pode devolver o cr\u00e9dito. Fale com ele pelo ' + W + '.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });
  I('reembolso', ['reembolso', 'estorno', 'devolver dinheiro', 'devolucao', 'cancelar compra', 'arrependimento', 'meu dinheiro', 'desistir compra', 'dinheiro de volta'],
    ['Os cr\u00e9ditos de cortesia n\u00e3o s\u00e3o reembols\u00e1veis. Para cr\u00e9ditos comprados e ainda n\u00e3o usados, o C\u00f3digo de Defesa do Consumidor (art. 49) garante o direito de arrependimento em at\u00e9 7 dias nas compras pela internet.',
     'Para pedir, fale com o suporte, o S\u00e9rgio: ' + W + '. Se quiser, deixo um recado registrado.'], { oferece: 'recado', p: 12, c: SERGIO });
  I('credito_expira', ['credito expirar', 'credito validade', 'credito vencer', 'prazo credito', 'credito vence'],
    ['Os cr\u00e9ditos comprados n\u00e3o expiram. Os de cortesia (brinde de boas-vindas) s\u00e3o usados primeiro.'], { m: ['home', 'painel'] });
  I('nota_fiscal', ['nota fiscal', 'recibo', 'fatura', 'cnpj', 'comprovante pagamento nota'],
    ['Essa informa\u00e7\u00e3o eu n\u00e3o consigo confirmar, e n\u00e3o quero te passar nada errado. Fale com o S\u00e9rgio, que \u00e9 quem informa isso: ' + W + '.'], { oferece: 'recado', c: SERGIO });
  I('bonus_bloqueado', ['bonus bloquear', 'bonus nao liberar', 'bonus negar', 'nao ganhei credito', 'credito gratis sumir', 'credito cortesia sumir', 'bonus sumir', 'bonus negado'],
    ['O b\u00f4nus de boas-vindas tem uma prote\u00e7\u00e3o contra abuso: quando o sistema percebe contas muito parecidas com a mesma pessoa, ele pode n\u00e3o conceder o b\u00f4nus de uma conta nova.',
     'Se voc\u00ea acha que foi um engano, fale com o S\u00e9rgio pelo ' + W + ': ele analisa cada caso.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });

  // ---------------- aplicar, links, resultados (profissional) ----------------
  I('gerar_link', ['gerar link', 'enviar link', 'link paciente', 'enviar escala', 'enviar teste', 'aplicar escala', 'aplicar teste', 'comoaplicar', 'mandar paciente', 'enviar paciente', 'usar painel'],
    ['Para aplicar uma escala ou teste: 1) cadastre o paciente (aba Pacientes); 2) escolha a escala ou o teste; 3) clique em "Nova Aplica\u00e7\u00e3o" (testes) ou preencha o formul\u00e1rio (escalas) e depois em "Gerar Link"; 4) copie o link ou use o bot\u00e3o WhatsApp; 5) o paciente responde e o resultado aparece no painel, com PDF.',
     'Se o paciente est\u00e1 com voc\u00ea, use "Aplicar Aqui" (ou "Aplicar Localmente" nos testes) e fa\u00e7a na hora, no mesmo aparelho.'],
    { c: ['Quanto tempo vale o link?', 'Onde vejo os resultados?'], m: ['home', 'painel'],
      s: ['Resumindo: dentro do painel voc\u00ea escolhe o teste, aperta "Gerar Link", e manda esse link pelo WhatsApp. O paciente abre, responde, e o resultado volta para o seu painel.'] });
  I('link_validade', ['link validade', 'link expirar', 'link vale', 'link duracao', 'link prazo', 'link dia', 'link uso unico', 'link quantas vezes', 'link vencer', 'link funcionar quanto'],
    ['Cada link \u00e9 de uso \u00fanico (vale para uma aplica\u00e7\u00e3o) e fica v\u00e1lido por at\u00e9 30 dias. Depois que o paciente envia os resultados, o link deixa de funcionar.'], { m: ['home', 'painel'] });
  I('link_usado', ['link usado', 'usado', 'link invalido', 'link nao abrir', 'link abrir', 'link carregar', 'link funcionar', 'link expirado', 'link problema', 'link erro'],
    { paciente: ['Cada link vale para uma \u00fanica aplica\u00e7\u00e3o: depois que os resultados s\u00e3o enviados, ele deixa de funcionar. Ele tamb\u00e9m expira em at\u00e9 30 dias ou se o profissional o cancelou.', '\u00c9 s\u00f3 pedir um link novo a quem te enviou. \ud83d\ude09'],
      _: ['O link j\u00e1 foi usado, expirou (30 dias) ou foi cancelado. Gere um novo na mesma aba; o paciente usa o novo.'] }, { c: { painel: ['Como cancelar um link?'], home: [], paciente: [] } });
  I('link_cancelar', ['link cancelar', 'cancelar link', 'link pendente', 'desfazer link', 'apagar link', 'link enviado errado'],
    ['Na aba do teste (e tamb\u00e9m no hist\u00f3rico do paciente) aparecem os links pendentes, enviados e ainda n\u00e3o respondidos, cada um com um bot\u00e3o "Cancelar". Links com mais de 30 dias saem da lista sozinhos.'], { m: ['home', 'painel'] });
  I('link_nao_chegou', ['paciente receber link', 'link chegar', 'link sumir', 'paciente nao receber', 'mandar link whatsapp'],
    ['Confira se o n\u00famero ou e-mail do paciente est\u00e3o certos. O link tamb\u00e9m pode ser copiado e colado em qualquer aplicativo de mensagem. Se o paciente disser que "n\u00e3o abre", pe\u00e7a para tentar em outro navegador ou aparelho. Se persistir, gere um novo link.'], { m: ['home', 'painel'] });
  I('aplicar_aqui', ['aplicar aqui', 'aplicar localmente', 'aplicar presencial', 'aplicar consultorio', 'sem link', 'aplicar na hora', 'aplicar agora'],
    ['Se o paciente est\u00e1 com voc\u00ea, use "Aplicar Aqui" (nas escalas) ou "Aplicar Localmente" (nos testes): a aplica\u00e7\u00e3o abre no mesmo aparelho, sem precisar enviar link.'], { m: ['home', 'painel'] });
  I('resultado_onde', ['onde resultado', 'ver resultado', 'resultado aparecer', 'resultado sumir', 'paciente responder', 'paciente terminar', 'onde ficar resultado', 'cade resultado', 'achar resultado', 'resultado nao aparecer', 'resultado'],
    { painel: ['Os resultados ficam no painel: nas escalas, na se\u00e7\u00e3o de resultados da aba; nos testes, no bot\u00e3o "Resultados" da aba do teste. Tamb\u00e9m aparecem no hist\u00f3rico do paciente (aba Pacientes). De l\u00e1 voc\u00ea abre o PDF.',
               'Se o paciente j\u00e1 terminou e n\u00e3o aparece: atualize a p\u00e1gina, veja se o link ainda consta como pendente e olhe seu e-mail (inclusive o Spam), porque o site avisa quando algu\u00e9m conclui. No TFLOD, o teste fica como "Aguardando" at\u00e9 voc\u00ea clicar em "Processar".'],
      home: ['Quando o paciente termina, o resultado aparece no painel do profissional, com pontua\u00e7\u00e3o, classifica\u00e7\u00e3o e PDF.'],
      paciente: ['Quando voc\u00ea envia, o resultado vai direto para o profissional que te enviou o link. Ele \u00e9 quem recebe, interpreta e conversa com voc\u00ea sobre isso.'] },
    { oferece: 'recado', c: { painel: ['Deixar recado ao S\u00e9rgio'], home: ['Como funciona o site?'], paciente: [] } });
  I('resultado_paciente', ['meu resultado', 'ver meu resultado', 'receber resultado', 'resultado para mim', 'cade meu resultado', 'mostrar resultado', 'nota do teste', 'minha nota', 'como fui'],
    ['O resultado vai para o profissional que te enviou o link, e \u00e9 ele quem recebe e interpreta. Por isso voc\u00ea n\u00e3o v\u00ea as pontua\u00e7\u00f5es na tela.', 'Pe\u00e7a uma devolutiva a ele: \u00e9 nessa conversa que o resultado \u00e9 explicado com cuidado e de acordo com o seu caso. \ud83d\udc9a'], { m: ['paciente', 'home'], p: 5 });
  I('pdf', ['pdf', 'baixar pdf', 'gerar pdf', 'relatorio pdf', 'pdf erro', 'pdf nao gerar', 'pdf nao abrir', 'imprimir resultado'],
    ['O relat\u00f3rio em PDF \u00e9 gerado a partir do painel: abra o resultado e clique no bot\u00e3o PDF. Se uma gera\u00e7\u00e3o falhar, o site avisa na hora e registra a ocorr\u00eancia para o S\u00e9rgio acompanhar. Se acontecer com voc\u00ea, tente de novo e, se persistir, fale com ele.'], { oferece: 'recado', m: ['home', 'painel'] });
  I('imprimir', ['imprimir', 'impressao', 'formulario branco', 'aplicar papel', 'imprimir formulario', 'versao papel'],
    ['D\u00e1 para imprimir o formul\u00e1rio em branco e aplicar no papel: na \u00e1rea das escalas do painel, use "Imprimir Formul\u00e1rio em Branco". Na Anamnese tamb\u00e9m h\u00e1 o bot\u00e3o "Imprimir".'], { m: ['home', 'painel'] });
  I('excel_csv', ['excel', 'exportar', 'csv', 'planilha', 'backup', 'baixar dado', 'importar'],
    ['D\u00e1 para exportar os resultados para Excel (nas abas de escalas e testes) e a lista de pacientes em CSV (aba Pacientes). Voc\u00ea tamb\u00e9m pode importar uma lista de pacientes por CSV. \u00c9 boa ideia fazer um backup de vez em quando. \ud83d\ude09'], { m: ['home', 'painel'] });
  I('pacientes', ['cadastrar paciente', 'novo paciente', 'editar paciente', 'importar paciente', 'duplicado', 'cadastro paciente', 'paciente repetido', 'excluir paciente', 'meus pacientes'],
    ['Na aba Pacientes voc\u00ea cadastra cada pessoa uma vez s\u00f3, e ela fica dispon\u00edvel em todos os testes, escalas, agenda e prontu\u00e1rio. Nome e data de nascimento s\u00e3o obrigat\u00f3rios, e o sistema avisa se j\u00e1 existe um cadastro parecido. D\u00e1 para buscar, exportar e importar por CSV e conferir duplicatas.',
     'Os dados dos seus pacientes s\u00e3o acess\u00edveis s\u00f3 por voc\u00ea, e o administrador do sistema n\u00e3o acessa informa\u00e7\u00f5es de pacientes.'], { m: ['home', 'painel'] });
  I('dados_usuario', ['dados usuario', 'logo pdf', 'cabecalho pdf', 'meu crp', 'personalizar pdf', 'logo clinica', 'meus dados profissionais'],
    ['Em "Dados do Usu\u00e1rio" voc\u00ea preenche uma vez seu nome, CRP, contato e logo, e eles entram automaticamente na identifica\u00e7\u00e3o dos resultados. Na aba Anamnese tamb\u00e9m d\u00e1 para personalizar o cabe\u00e7alho do PDF (logo, cores e telefones).'], { m: ['home', 'painel'] });
  I('encerrar_conta', ['encerrar conta', 'excluir conta', 'apagar conta', 'deletar conta', 'cancelar conta', 'fechar conta', 'sair definitivamente'],
    ['D\u00e1 para encerrar a conta, mas \u00e9 irrevers\u00edvel: apaga todos os pacientes, os resultados de testes e escalas e o seu registro de usu\u00e1rio. Antes, exporte os pacientes em CSV e salve os PDFs que quiser guardar.',
     'No painel h\u00e1 a op\u00e7\u00e3o "Encerrar Conta"; para confirmar, voc\u00ea digita ENCERRAR. Se tiver d\u00favida, fale antes com o S\u00e9rgio: ' + W + '.'], { m: ['home', 'painel'] });
  I('suporte_painel', ['suporte', 'suporte feedback', 'mensagem sergio', 'resposta suporte', 'notificacao painel', 'falar suporte'],
    { painel: ['No painel h\u00e1 o bot\u00e3o "\u2709 Suporte / Feedback": voc\u00ea escreve ali e a mensagem chega direto ao S\u00e9rgio, j\u00e1 identificada com a sua conta. As respostas dele aparecem em "\ud83d\udcac Resposta do Suporte", e as novidades em "\ud83d\udd14 Notifica\u00e7\u00f5es".'],
      _: ['Quem tem conta no painel pode usar o bot\u00e3o "Suporte / Feedback" para falar com o S\u00e9rgio. Para os demais, o caminho \u00e9 o ' + W + '.'] }, { oferece: 'recado' });

  // ---------------- paciente / quem recebeu um link ----------------
  I('paciente_comecar', ['recebi link', 'recebi um link', 'o que fazer', 'como responder', 'primeira vez', 'link profissional', 'link psicologo', 'responder escala', 'fazer teste', 'vou fazer'],
    ['Seja bem-vindo(a)! \ud83d\ude0a Voc\u00ea s\u00f3 precisa abrir o link que o profissional enviou, preencher o que for pedido e responder com calma e sinceridade. N\u00e3o precisa instalar nada nem criar conta.',
     'No fim, \u00e9 s\u00f3 clicar para enviar: o resultado vai direto para o profissional que te mandou o link. Procure um lugar tranquilo e, se o teste usar voz, deixe o microfone liberado.'],
    { c: { paciente: L.chipsPadrao('paciente'), home: ['Link j\u00e1 utilizado', 'Problema com o microfone', 'N\u00e3o consigo enviar'], painel: [] }, s: ['Pensa assim: o profissional te mandou um endere\u00e7o de internet (link). Voc\u00ea abre ele no celular ou computador, responde \u00e0s perguntas e aperta enviar no final. S\u00f3 isso.'] });
  I('paciente_duracao', ['demora', 'duracao', 'demorar muito', 'quanto tempo levar', 'tempo teste', 'tempo escala', 'vai demorar'],
    ['Depende do que voc\u00ea vai fazer. Escalas variam com o n\u00famero de perguntas (de uns 2 minutos at\u00e9 cerca de 20 ou mais). Os testes v\u00e3o de alguns minutos a 30 ou 45. Quem te enviou o link sabe o tempo do seu; vale perguntar antes de come\u00e7ar.'], { c: { paciente: L.chipsPadrao('paciente'), home: [], painel: [] } });
  I('paciente_dispositivo', ['dispositivo', 'aparelho', 'funcionar dispositivo', 'posso dispositivo', 'usar dispositivo', 'computador'],
    ['Quase tudo funciona no celular, tablet ou computador, direto no navegador. A exce\u00e7\u00e3o \u00e9 a BAE (bateria de aten\u00e7\u00e3o), que s\u00f3 roda em computador com teclado: no celular aparece um aviso para abrir no computador, e nenhum cr\u00e9dito \u00e9 gasto. Alguns testes usam microfone ou som.'], { m: ['home', 'paciente', 'painel'] });
  I('paciente_instalar', ['instalar', 'baixar programa', 'precisar baixar', 'aplicativo', 'app', 'download', 'precisa instalar'],
    ['N\u00e3o precisa instalar nada. Tudo roda no navegador do celular, tablet ou computador. \u00c9 s\u00f3 abrir o link.'], { c: CP() });
  I('paciente_fechou', ['fechar pagina', 'fechei', 'sem querer', 'internet cair', 'cair internet', 'acabar bateria', 'voltar', 'continuar depois', 'pausar', 'pausa', 'sair meio', 'interromper', 'parar teste', 'perdi tudo', 'desligou'],
    ['Se a p\u00e1gina fechou ou a internet caiu no meio, n\u00e3o se preocupe: avise o profissional que te enviou o link. Ele consegue ver o que ficou registrado e gerar um novo link, se precisar.',
     'Os testes foram feitos para serem feitos de uma vez, ent\u00e3o evite pausar e n\u00e3o recarregue a p\u00e1gina durante a aplica\u00e7\u00e3o.'], { c: { paciente: L.chipsPadrao('paciente'), home: [], painel: [] }, m: ['home', 'paciente'] });
  I('paciente_certo_errado', ['resposta certa', 'resposta errada', 'certo errado', 'vou passar', 'vou reprovar', 'vou ser julgado', 'medo teste', 'nervoso', 'nervosa', 'tenho que acertar', 'tem nota', 'e prova'],
    ['Fica tranquilo(a): isto n\u00e3o \u00e9 uma prova de passar ou reprovar. As escalas perguntam como voc\u00ea costuma se sentir ou agir, e os testes mostram como voc\u00ea usa a aten\u00e7\u00e3o e a mem\u00f3ria. Responda com sinceridade e fa\u00e7a o seu melhor. \ud83d\udc9a',
     'Quem interpreta tudo com cuidado \u00e9 o profissional que aplicou.'], { m: ['home', 'paciente'] });
  I('paciente_enviar', ['nao enviar', 'enviar resultado', 'botao enviar', 'faltar item', 'responder todos', 'nao deixar enviar', 'erro enviar', 'nao consigo enviar', 'nao envia', 'enviar nao funcionar', 'erro conexao'],
    ['O envio s\u00f3 funciona depois que todos os itens foram respondidos. Role a p\u00e1gina e veja se algum ficou em branco (o site informa quantos faltam).',
     'Se estiver tudo respondido, confira a internet e tente de novo. Se aparecer "Erro de conex\u00e3o", espere alguns segundos e clique outra vez. Se continuar, avise o profissional.'], { c: { paciente: L.chipsPadrao('paciente'), home: [], painel: [] }, m: ['home', 'paciente'] });
  I('sessao_invalida', ['sessao invalida', 'sem identificacao', 'link incompleto', 'novo link avaliador'],
    ['Isso acontece quando o link est\u00e1 incompleto ou foi alterado. Pe\u00e7a um novo link ao profissional que te enviou.'], { m: ['home', 'paciente'] });
  I('microfone', ['microfone', 'mic', 'voz nao detectar', 'nao escutar', 'nao gravar', 'gravacao', 'audio nao', 'permissao microfone', 'nao me ouvir', 'sem microfone', 'microfone nao funcionar', 'barra volume'],
    ['Vamos resolver o microfone: \ud83c\udfa4 1) clique no cadeado ao lado do endere\u00e7o do site e permita o microfone; 2) feche outros programas ou abas que usam o microfone; 3) fale perto dele, em volume normal e em lugar silencioso; 4) recarregue a p\u00e1gina e tente de novo.',
     'Nos testes de voz, o bot\u00e3o de iniciar s\u00f3 libera depois que o sistema detecta a sua voz. Se nada disso resolver, avise o profissional que te enviou o link.'], { c: { paciente: ['N\u00e3o consigo enviar', 'Link j\u00e1 utilizado'], home: [], painel: [] } });
  I('som_audio', ['sem som', 'nao ouvir', 'volume', 'fone', 'som nao', 'nao escuto', 'audio instrucao', 'instrucao falada'],
    ['Alguns testes t\u00eam instru\u00e7\u00f5es faladas. Use fones ou caixa de som, em lugar silencioso, e confira o volume do aparelho (e se o celular n\u00e3o est\u00e1 no modo silencioso). Se mesmo assim n\u00e3o houver som, avise o profissional.'], { m: ['home', 'paciente'] });
  I('tela_cheia', ['tela cheia', 'sair tela cheia', 'fullscreen'],
    ['Alguns testes abrem em tela cheia para voc\u00ea n\u00e3o se distrair. \u00c9 normal. Evite sair dela durante a aplica\u00e7\u00e3o.'], { m: ['home', 'paciente'] });

  // ---------------- privacidade, confianca, ciencia ----------------
  I('privacidade', ['quem ver resposta', 'quem ver meus dado', 'meus dado', 'sigilo', 'privacidade', 'confidencial', 'seguro', 'lgpd', 'compartilhar dado', 'quem ter acesso', 'dado seguro', 'dado protegido', 'meus dados sao'],
    { paciente: ['Suas respostas v\u00e3o para o profissional que te enviou o link, e \u00e9 ele quem cuida delas com sigilo profissional. Aqui no chat eu n\u00e3o pe\u00e7o nem guardo dados pessoais.'],
      _: ['Os dados dos seus pacientes s\u00e3o protegidos e acess\u00edveis apenas por voc\u00ea, e o administrador do sistema n\u00e3o acessa informa\u00e7\u00f5es de pacientes. Mesmo assim, voc\u00ea \u00e9 o controlador dos dados (LGPD): cadastre s\u00f3 o necess\u00e1rio e trate com sigilo.',
          'Quando a IA analisa resultados, antes um filtro troca nomes, CPF, telefone e endere\u00e7o por etiquetas an\u00f4nimas, ent\u00e3o ela nunca sabe quem \u00e9 o paciente. A chave da IA fica em servidor seguro, nunca no navegador.'] },
    { c: { home: ['Dados an\u00f4nimos para pesquisa', 'Como funciona o site?'], painel: [], paciente: [] } });
  I('dupla_filtragem', ['dupla filtragem', 'filtro ia', 'anonimizacao', 'anonimizar', 'ia ver nome', 'ia saber nome', 'dado ia', 'mascara'],
    ['\u00c9 uma prote\u00e7\u00e3o em duas etapas: antes de qualquer texto ir para a intelig\u00eancia artificial, um filtro troca nomes, CPFs, telefones, endere\u00e7os e valores por etiquetas an\u00f4nimas (como [PACIENTE]). A IA analisa s\u00f3 o conte\u00fado cl\u00ednico. Depois, o sistema devolve os nomes ao resultado, e o profissional v\u00ea tudo completo.',
     'O conte\u00fado cl\u00ednico \u00e9 mantido integralmente; s\u00f3 os identificadores s\u00e3o removidos.'], { m: ['home', 'painel'] });
  I('coleta_anonima', ['pesquisa', 'normatizacao', 'dado anonimo', 'coleta anonima', 'usar meus dado', 'dados anonimos para pesquisa', 'anonimo'],
    ['Dados totalmente an\u00f4nimos e n\u00e3o identific\u00e1veis, sem nome nem CPF, podem ser usados em pesquisa e na constru\u00e7\u00e3o das normas brasileiras dos testes. Isso ajuda a melhorar os instrumentos. \ud83d\ude0a'], { m: ['home', 'painel', 'paciente'] });
  I('validade', ['validado', 'validacao', 'confiavel', 'cientifico', 'base cientifica', 'norma brasileira', 'serio', 'funcionar de verdade', 'tem validade', 'e valido', 'confiar', 'confiavel', 'pode confiar', 'e confiavel'],
    ['O site \u00e9 transparente sobre isso. As escalas s\u00e3o instrumentos de dom\u00ednio p\u00fablico, digitalizados. V\u00e1rios testes (como TREF, TAAV e BAE) s\u00e3o experimentais, sem valida\u00e7\u00e3o normativa brasileira formal, ou t\u00eam normas provis\u00f3rias, e isso aparece no manual e no relat\u00f3rio.',
     'Por isso tudo aqui \u00e9 rastreio: levanta pistas para o profissional, que integra com entrevista e outros instrumentos.'], { m: ['home', 'painel'] });
  I('diagnostico', ['diagnostico', 'substituir diagnostico', 'fechar diagnostico', 'laudo valido', 'laudo oficial', 'atestado', 'isso e diagnostico', 'tem valor clinico'],
    ['Os instrumentos daqui s\u00e3o de rastreio: n\u00e3o fecham diagn\u00f3stico e n\u00e3o substituem a avalia\u00e7\u00e3o cl\u00ednica completa. O diagn\u00f3stico \u00e9 sempre do profissional, com entrevista e outros recursos.'], { m: ['home', 'painel'] });
  I('ia_laudo', ['ia diagnostico', 'ia laudo', 'ia analisar', 'analise ia', 'parecer ia', 'ia confiavel', 'ia decidir', 'ia errar'],
    ['Em v\u00e1rios testes o relat\u00f3rio traz uma an\u00e1lise feita por intelig\u00eancia artificial. Ela \u00e9 um apoio: organiza o racioc\u00ednio e levanta hip\u00f3teses, mas pode errar, e por isso o profissional revisa tudo. A decis\u00e3o cl\u00ednica \u00e9 sempre dele.'], { m: ['home', 'painel'] });
  I('referencias', ['referencia', 'citar', 'abnt', 'como citar', 'bibliografia', 'copiar referencia'],
    ['Cada teste tem o bot\u00e3o "Copiar refer\u00eancia", com a cita\u00e7\u00e3o pronta em ABNT, e os manuais trazem as refer\u00eancias usadas. Exemplo de formato: MONTE, S\u00e9rgio Teixeira. TECFE: Teste de Emparelhamento de Cartas com Feedback Estrat\u00e9gico. S\u03a8M Online, 2026.'], { m: ['home', 'painel'] });
  I('manual', ['manual', 'manual tecnico', 'fundamentacao', 'como interpretar', 'interpretar teste'],
    ['Cada teste e programa tem um "Manual T\u00e9cnico" (bot\u00e3o na aba dele) com fundamenta\u00e7\u00e3o, como \u00e9 aplicado e como interpretar o resultado. Vale ler antes da primeira aplica\u00e7\u00e3o. \ud83d\udcd2'], { m: ['home', 'painel'] });

  // ---------------- listas e ferramentas ----------------
  I('lista_testes', ['quais teste', 'que teste', 'lista teste', 'teste disponivel', 'quais teste existir', 'procura teste', 'todos teste', 'teste computadorizado'],
    ['Os testes computadorizados s\u00e3o: TECFE (fun\u00e7\u00f5es executivas), BAE (aten\u00e7\u00e3o), TRMV e TAAV (mem\u00f3ria visual), TREF (reconhecimento facial), TPV-SET (percep\u00e7\u00e3o visual), TFLOD (leitura em voz alta), TTE (trilhas), Corsi (mem\u00f3ria de trabalho), TETaylor (visuoconstru\u00e7\u00e3o), IDEIA (criatividade), BRPI e BAFC (processamento da intelig\u00eancia).',
     'Quer saber mais de algum deles?'], { c: ['O que \u00e9 o TECFE?', 'O que \u00e9 a BAE?', 'Quanto custa?'] });
  I('lista_escalas', ['quais escala', 'que escala', 'lista escala', 'escala disponivel', 'quantas escala', 'todas escala', 'procura escala', 'escala gratuita'],
    ['Temos mais de 50 escalas gratuitas, de dom\u00ednio p\u00fablico, com relat\u00f3rio em PDF. Os temas incluem: personalidade, autismo, TDAH, ansiedade, depress\u00e3o, TOC, bipolaridade, trauma, sono, \u00e1lcool, esquemas de Young, altas habilidades, aprendizagem, comportamento infantil, relacionamento e trabalho.',
     'Me diga o tema (por exemplo, "escala para ansiedade") que eu listo as op\u00e7\u00f5es.'], { c: ['Escala para TDAH', 'Escala para autismo', 'Escala para ansiedade'] });
  I('reabilitacao_lista', ['reabilitacao', 'programa reabilitacao', 'treino cognitivo', 'treinar', 'estimular'],
    ['Os programas de reabilita\u00e7\u00e3o s\u00e3o: REOCUPA (situa\u00e7\u00f5es do dia a dia, com voz), SMART (metas de reabilita\u00e7\u00e3o com IA), LERMAIS (leitura em voz alta, com gr\u00e1fico em tempo real) e PRAt (aten\u00e7\u00e3o visual). Eles servem para acompanhar a evolu\u00e7\u00e3o sess\u00e3o a sess\u00e3o, n\u00e3o para dar uma nota.'], { c: ['O que \u00e9 o LERMAIS?', 'O que \u00e9 o PRAt?'], m: ['home', 'painel'] });
  I('painel_ferramentas', ['painel ter', 'recurso', 'funcionalidade', 'ferramenta', 'aba', 'o que tem'],
    ['O painel tem: Pacientes, Escalas, os testes por \u00e1rea (Fun\u00e7\u00f5es Executivas, Aten\u00e7\u00e3o, Mem\u00f3ria, Percep\u00e7\u00e3o, Linguagem, Visuoconstrutivo, Intelig\u00eancia e AH/SD), Corre\u00e7\u00e3o de testes de papel (BVRT e ETDAH), Reabilita\u00e7\u00e3o, Anamnese, Agenda, Prontu\u00e1rio IA, Dados do Usu\u00e1rio e Suporte/Feedback.'], { c: ['Como gerar o link?', 'Quanto custa?'], m: ['home', 'painel'] });
  I('agenda_lembrete', ['lembrete', 'telegram', 'google calendar', 'agenda compartilhar', 'agendar paciente', 'lembrar consulta'],
    ['A Agenda envia lembretes de consulta pelo Telegram, sem custo: o paciente se cadastra uma vez e recebe o aviso na v\u00e9spera. Tamb\u00e9m sincroniza com o Google Calendar, tem agenda compartilhada com colegas e bot\u00e3o de WhatsApp no agendamento.'], { m: ['home', 'painel'] });
  I('programas_ocultos', ['programa oculto', 'uso exclusivo', 'pfister', 'neo pi', 'srs 2', 'vineland', 'etdah pais', 'programas privativos'],
    ['Existe uma aba "Programas Ocultos", de uso exclusivo do profissional, com instrumentos privativos (como Pfister, NEO PI-R, SRS-2, ETDAH-PAIS e Vineland-3). Para saber como ter acesso, fale com o S\u00e9rgio: ' + W + '.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });
  I('correcao', ['correcao', 'bvrt', 'correcao teste', 'calculo automatico', 'etdah', 'zscore'],
    ['Na aba Corre\u00e7\u00e3o voc\u00ea digita os escores de testes aplicados no papel (BVRT, ETDAH-PAIS e ETDAH-CriAd) e o sistema calcula Z-score, percentil e classifica\u00e7\u00e3o, e gera o PDF.'], { m: ['home', 'painel'] });
  I('conhecer', ['conhecer teste', 'experimentar', 'demonstracao', 'demo', 'testar', 'ver como', 'exemplo', 'amostra', 'so conhecer', 'teste gratis', 'quero ver', 'conhecer', 'curiosidade'],
    ['Boa ideia! \ud83e\uddea Na p\u00e1gina inicial, o bot\u00e3o "Experimentar uma escala" abre a DASS-21 (depress\u00e3o, ansiedade e estresse) em modo demonstra\u00e7\u00e3o: voc\u00ea responde e v\u00ea o resultado na hora. Seus dados s\u00e3o usados de forma an\u00f4nima, para pesquisa e normatiza\u00e7\u00e3o.',
     'Se for profissional, tamb\u00e9m pode criar o painel gratuito e testar tudo com os cr\u00e9ditos de cortesia.'], { c: ['Como entro no painel?', 'Quanto custa?'], m: ['home'] });

  // ---------------- contato e o Sergio ----------------
  I('contato_sergio', ['falar sergio', 'falar contato', 'chamar sergio', 'contato sergio', 'contato', 'numero sergio', 'como falo sergio', 'email sergio', 'quero falar humano', 'falar humano', 'atendente humano', 'ligar sergio', 'falar responsavel', 'falar alguem'],
    ['Claro! O S\u00e9rgio atende pelo ' + W + '. D\u00e1 para agendar consulta pelo Doctoralia (bot\u00e3o "Agendar", l\u00e1 embaixo na p\u00e1gina inicial) e acompanhar as novidades no Instagram @setmonte.',
     'Se preferir, eu mesma deixo um recado registrado para ele agora. Quer?'], { oferece: 'recado', c: ['Deixar recado ao S\u00e9rgio'], p: 8 });
  I('quem_sergio', ['quem sergio', 'quem criar', 'quem fazer site', 'quem dono', 'formacao sergio', 'crp sergio', 'quem responsavel', 'quem desenvolver'],
    ['O site \u00e9 do S\u00e9rgio Teixeira Monte, neuropsic\u00f3logo (CRP 14/05739-9), de Campo Grande (MS). Ele atua com avalia\u00e7\u00e3o neuropsicol\u00f3gica e desenvolve ferramentas digitais para tornar a pr\u00e1tica cl\u00ednica mais acess\u00edvel.'], { c: ['Falar com o S\u00e9rgio'] });
  I('agendar_consulta', ['marcar consulta', 'agendar consulta', 'agendar avaliacao', 'consultorio', 'valor consulta', 'onde atender', 'atender', 'fazer avaliacao com', 'quero me consultar', 'preciso de avaliacao', 'psicoterapia'],
    ['O S\u00e9rgio atende em Campo Grande (MS). Para agendar, use o bot\u00e3o "Agendar" na parte de baixo da p\u00e1gina inicial (ele leva ao Doctoralia) ou chame no ' + W + '. Valores e hor\u00e1rios de consulta s\u00f3 ele pode informar.'], { c: ['Falar com o S\u00e9rgio'] });
  I('instagram', ['instagram', 'insta', 'rede social'],
    ['O Instagram do S\u00e9rgio \u00e9 @setmonte. As novidades do site tamb\u00e9m aparecem na se\u00e7\u00e3o "\u00daltimas atualiza\u00e7\u00f5es" da p\u00e1gina inicial.'], {});
  I('depoimentos_ver', ['depoimento', 'avaliacao profissional', 'o que falar sobre', 'ver avaliacao', 'opiniao outros'],
    ['Na p\u00e1gina inicial h\u00e1 uma se\u00e7\u00e3o "Avalia\u00e7\u00f5es de profissionais" com depoimentos de quem j\u00e1 usou. E se voc\u00ea quiser contar a sua experi\u00eancia, eu levo a sua avalia\u00e7\u00e3o!'], { c: ['Deixar uma avalia\u00e7\u00e3o'], p: 3 });

  // ---------------- deixar opiniao / recado (abrem conversas guiadas) ----------------
  I('fb_avaliacao', ['deixar avaliacao', 'avaliar', 'elogio', 'elogiar', 'deixar comentario', 'comentario', 'opiniao', 'feedback', 'dar nota', 'estrela', 'deixar depoimento', 'quero avaliar'],
    ['Que bom!'], { acao: 'fluxo', fluxo: 'feedback', p: 6 });
  I('fb_sugestao', ['sugestao', 'sugerir', 'melhorar site', 'melhoria', 'funcionalidade nova', 'pedir recurso', 'seria bom'],
    ['Adoro sugest\u00f5es!'], { acao: 'fluxo', fluxo: 'sugestao', p: 6 });
  I('fb_critica', ['critica', 'criticar', 'reclamar', 'reclamacao', 'insatisfeito', 'quero reclamar', 'registrar reclamacao'],
    ['Entendi.'], { acao: 'fluxo', fluxo: 'critica', p: 6 });
  I('fb_recado', ['deixar recado', 'recado', 'deixar mensagem', 'mandar mensagem', 'recado sergio', 'avisar sergio', 'registrar ocorrencia', 'ocorrencia'],
    ['Claro.'], { acao: 'fluxo', fluxo: 'recado', p: 8 });

  // ---------------- problemas tecnicos ----------------
  I('pagina_nao_carrega', ['pagina carregar', 'tela branco', 'site fora', 'site abrir', 'site lento', 'nao carregar', 'nao abrir', 'carregar infinito', 'em branco', 'site travar', 'pagina travar', 'pagina lento'],
    ['Vamos tentar: 1) recarregue a p\u00e1gina (Ctrl + F5); 2) confira a internet; 3) tente outro navegador (o Chrome costuma ser o mais compat\u00edvel) ou uma janela an\u00f4nima; 4) limpe o cache do navegador.',
     'Se o problema continuar, me diga o que aparece e em qual p\u00e1gina, ou fale com o S\u00e9rgio: ' + W + '.'], { oferece: 'recado', c: SERGIO });
  I('navegador', ['qual navegador', 'chrome', 'safari', 'firefox', 'edge', 'navegador recomendado', 'navegador', 'brave'],
    ['O site funciona nos navegadores atuais (Chrome, Edge, Safari e Firefox). Para grava\u00e7\u00e3o de voz e para o Prontu\u00e1rio, o Chrome costuma funcionar melhor. No iPhone, o Safari \u00e9 compat\u00edvel com as grava\u00e7\u00f5es de \u00e1udio.'], {});
  I('internet', ['internet', 'conexao', 'wifi', 'rede', 'sem internet', 'internet lento', 'internet ruim', 'oscilar'],
    ['O site precisa de internet durante a aplica\u00e7\u00e3o. Alguns envios (como os de \u00e1udio) tentam de novo sozinhos se a conex\u00e3o oscilar, mas o ideal \u00e9 usar uma rede est\u00e1vel e n\u00e3o fechar a p\u00e1gina. Se a internet caiu no meio, avise o profissional.'], {});
  I('erro_geral', ['erro', 'funcionar nao', 'nao funcionar', 'problema', 'travou', 'bug', 'deu problema', 'esta com problema'],
    ['Poxa, que chato! \ud83d\ude15 Tenta recarregar a p\u00e1gina e repetir o que estava fazendo. Se continuar, me conta em qual p\u00e1gina e o que aparece na tela. O S\u00e9rgio acompanha as ocorr\u00eancias do site, e eu posso deixar um recado registrado para ele.'],
    { oferece: 'recado', c: ['Deixar recado ao S\u00e9rgio', 'Falar com o S\u00e9rgio'], p: 0 });
  I('erro_transcricao', ['transcricao erro', 'transcricao vazio', 'transcricao falhar', 'processar', 'aguardando', 'audio nao processar', 'tflod erro'],
    ['No TFLOD, a transcri\u00e7\u00e3o agora \u00e9 feita no painel: o teste aparece como "Aguardando" com os bot\u00f5es Ouvir e Processar. Clique em Processar. Se o servi\u00e7o de transcri\u00e7\u00e3o oscilar, basta clicar de novo, sem custo extra, porque o cr\u00e9dito \u00e9 cobrado uma vez s\u00f3, no in\u00edcio.',
     'Se mesmo assim falhar, avise o S\u00e9rgio: falhas do sistema s\u00e3o conferidas por ele. ' + W + '.'], { oferece: 'recado', m: ['home', 'painel'], c: SERGIO });
  I('esclarecer', ['esclarecer'], ['Claro!'], {});
  L.I = I; L.CP = CP;
})(typeof window !== 'undefined' ? window : global);

/* kb-conflito.js */
// ============================================================
// LAUANA - CONFLITOS, USUARIO ESTRESSADO, ASSUNTOS DELICADOS
// Regras de ouro da atendente:
//  1) acolher primeiro, sem discutir nem se defender;
//  2) nunca prometer reembolso, prazo ou resultado;
//  3) nunca interpretar teste, dar diagnostico ou resposta;
//  4) sempre mostrar o caminho humano (Sergio) quando houver tensao;
//  5) sofrimento emocional -> CVV 188 / SAMU 192.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, I = L.I, W = L.WHATS;
  var SERGIO = ['Falar com o S\u00e9rgio', 'Deixar recado ao S\u00e9rgio'];

  // palavras de irritacao (so mudam o TOM da resposta)
  L.setRaiva(['absurdo', 'palhacada', 'vergonha', 'lixo', 'pessimo', 'horrivel', 'ridiculo', 'roubo', 'roubaram', 'golpe',
              'enganado', 'enganaram', 'fraude', 'cansei', 'irritado', 'irritada', 'revoltado', 'revoltada', 'furioso', 'furiosa',
              'raiva', 'odio', 'inaceitavel', 'descaso', 'desrespeito', 'incompetente', 'inutil', 'porcaria', 'merda', 'porra',
              'caralho', 'droga', 'desgraca', 'safado', 'nunca mais', 'cansado', 'cansada', 'estressado', 'estressada', 'bravo', 'brava',
              'indignado', 'indignada', 'ninguem resolve', 'ninguem responde', 'de novo', 'ja falei']);
  // xingamentos (so contam se forem dirigidos a ela: voce, robo, atendente...)
  L.setInsulto(['idiota', 'imbecil', 'burra', 'burro', 'estupida', 'estupido', 'inutil', 'incompetente', 'otaria', 'babaca', 'besta',
                'retardada', 'retardado', 'lixo', 'ridicula', 'ridiculo', 'maldita', 'desgra\u00e7ada', 'vagabunda', 'cala boca', 'vai se foder', 'vai tomar']);

  // ---------------- sofrimento emocional / emergencia ----------------
  I('emocional', ['estou mal', 'nao aguento', 'desespero', 'suicidio', 'me matar', 'sem esperanca', 'angustia', 'quero morrer', 'vontade de morrer',
                  'acabar com tudo', 'nao quero viver', 'crise de panico', 'ataque de panico', 'me machucar', 'automutilacao', 'estou muito triste',
                  'estou desesperado', 'estou desesperada', 'passando mal', 'emergencia medica', 'estou em crise'],
    ['Sinto muito que voc\u00ea esteja passando por isso. \ud83d\udc9a Aqui eu s\u00f3 ajudo com o uso do site, mas voc\u00ea n\u00e3o precisa passar por isso sozinho(a).',
     'Se voc\u00ea est\u00e1 em sofrimento agora, ligue para o CVV no 188 (24 horas, gratuito). Em caso de emerg\u00eancia, ligue 192 (SAMU). E, se tiver um profissional que te acompanha, conte a ele tamb\u00e9m. Estou aqui se precisar de qualquer coisa do site.'],
    { p: 50, neutro: true });

  // ---------------- limite clinico: nunca interpretar nem dar resposta ----------------
  I('clinico', ['qual resposta', 'gabarito', 'dica teste', 'responder por mim', 'me ajudar responder', 'ajudar responder', 'resposta pergunta', 'resposta item',
                'defin meu resultado', 'defin meu laudo', 'defin meu escore', 'defin meu relatorio', 'interpretar meu resultado', 'tenho depressao', 'tenho ansiedade', 'tenho autismo', 'tenho tdah', 'sou autista', 'sou bipolar',
                'estou com depressao', 'meu diagnostico', 'sera que tenho', 'o que tenho', 'trapacear', 'colar teste', 'burlar', 'enganar teste',
                'manipular resultado', 'melhorar nota', 'treinar para teste', 'resultado normal', 'resultado alto', 'resultado baixo', 'tirei nota',
                'o que quer dizer meu resultado', 'estou doente', 'sou normal'],
    ['Essa parte eu n\u00e3o posso comentar, viu? \ud83d\ude42 Sobre as perguntas dos testes, as respostas e a interpreta\u00e7\u00e3o de resultados, quem te ajuda \u00e9 o profissional que aplicou a avalia\u00e7\u00e3o.',
     'Comigo voc\u00ea tira d\u00favidas s\u00f3 sobre o uso do site, como microfone, envio e link. Se quiser, anote a sua d\u00favida e leve para ele na devolutiva. \ud83d\udc9a'],
    { p: 45, c: { paciente: L.chipsPadrao('paciente'), home: L.chipsPadrao('home'), painel: L.chipsPadrao('painel') } });

  // ---------------- ameacas e desconfianca ----------------
  I('ameaca', ['procon', 'advogado', 'processo', 'processar', 'justica', 'denunciar', 'denuncia', 'policia', 'tribunal', 'reclame aqui', 'ouvidoria',
               'ministerio publico', 'vou processar', 'boletim de ocorrencia', 'acao judicial', 'consumidor'],
    ['Entendo, e levo isso a s\u00e9rio. Para resolver direito, o melhor caminho \u00e9 falar direto com o S\u00e9rgio, que \u00e9 o respons\u00e1vel pelo site: ' + W + '.',
     'Se quiser, deixo agora um recado registrado com tudo o que aconteceu, para ele analisar com prioridade. Me diga s\u00f3 o que houve.'],
    { p: 45, neutro: true, oferece: 'recado', c: SERGIO });
  I('golpe', ['golpe', 'fraude', 'enganar', 'enganado', 'roubar', 'roubaram', 'ladrao', 'estelionato', 'site falso', 'desconfiar', 'desconfianca'],
    ['Entendo a desconfian\u00e7a, \u00e9 saud\u00e1vel ter cuidado na internet. Algumas informa\u00e7\u00f5es que voc\u00ea mesmo pode conferir: o site \u00e9 do neuropsic\u00f3logo S\u00e9rgio Teixeira Monte (CRP 14/05739-9), de Campo Grande (MS), que tamb\u00e9m atende pelo Doctoralia e tem Instagram (@setmonte). O painel e as escalas s\u00e3o gratuitos, ent\u00e3o d\u00e1 para conhecer tudo antes de pagar qualquer coisa.',
     'Se algo em um pagamento ou cobran\u00e7a te parece errado, fale direto com ele: ' + W + '. Posso deixar um recado registrado tamb\u00e9m.'],
    { p: 42, neutro: true, oferece: 'recado', c: SERGIO });
  I('nao_responde', ['ninguem responder', 'ninguem resolver', 'sem resposta', 'esperando resposta', 'mandar mensagem nao', 'ja mandar', 'ja escrever', 'demorar responder', 'sem retorno', 'ignorar', 'ninguem atender', 'nao retornar', 'ninguem retornar', 'nao responder'],
    ['Pe\u00e7o desculpa pela demora, voc\u00ea n\u00e3o deveria ficar esperando sem retorno. Eu n\u00e3o consigo ver o hist\u00f3rico das mensagens, ent\u00e3o n\u00e3o sei em que ponto est\u00e1 o seu pedido.',
     'O caminho mais direto agora \u00e9 o WhatsApp do S\u00e9rgio: ' + W + '. Se quiser, deixo um recado novo, bem detalhado, para ele tratar com prioridade. \u00c9 s\u00f3 dizer "sim".'],
    { p: 25, oferece: 'recado', c: SERGIO });
  I('urgente', ['urgente', 'preciso agora', 'emergencia', 'pressa', 'prazo hoje', 'resolver hoje', 'urgencia'],
    ['Entendi, \u00e9 urgente. Vou direto ao ponto: para ser atendido o mais r\u00e1pido poss\u00edvel, chame o S\u00e9rgio pelo ' + W + '. Se quiser, registro tamb\u00e9m um recado marcado como urgente.',
     'Me diga em uma frase o que est\u00e1 acontecendo, que eu j\u00e1 deixo anotado.'], { p: 20, oferece: 'recado', c: SERGIO });
  I('desistir', ['desistir', 'cancelar tudo', 'nunca mais usar', 'nao uso mais', 'nao quero mais usar', 'abandonar site', 'trocar plataforma', 'vou embora'],
    ['Poxa, sinto muito que a experi\u00eancia tenha chegado a esse ponto. Antes de voc\u00ea decidir, me conta o que aconteceu? Se eu puder resolver, resolvo; se n\u00e3o, levo direto ao S\u00e9rgio, que costuma tratar essas situa\u00e7\u00f5es pessoalmente.',
     'Se mesmo assim preferir encerrar a conta, d\u00e1 para fazer pelo painel, e ela s\u00f3 \u00e9 apagada quando voc\u00ea confirma.'], { p: 15, oferece: 'recado', neutro: true, c: SERGIO });
  I('raiva_generica', [], ['Entendo, e sinto muito por isso. Me conta o que aconteceu? Assim eu consigo te ajudar ou levar direto ao S\u00e9rgio.'],
    { neutro: true, c: ['Paguei e n\u00e3o apareceu', 'Deu erro no teste', 'Falar com o S\u00e9rgio'] });

  // ---------------- fora do assunto ----------------
  I('piada', ['piada', 'conte piada', 'engracada', 'me faz rir', 'conta uma piada'],
    ['Piada de recepcionista: por que o computador foi ao m\u00e9dico? Porque estava com v\u00edrus! \ud83d\ude04 Agora me conta, como posso ajudar de verdade?'], { c: L.CP() });
  I('flerte', ['te amo', 'casar comigo', 'namorar', 'namorado', 'voce bonita', 'encontro', 'voce linda', 'sair comigo'],
    ['Que gentil! \ud83d\ude0a Mas eu sou s\u00f3 a recepcionista virtual do site, aqui para ajudar com as d\u00favidas. Posso te ajudar com alguma coisa?'], { c: L.CP() });
  I('offtopic', ['clima', 'tempo hoje', 'futebol', 'politica', 'receita', 'dever de casa', 'trabalho escola', 'capital', 'horoscopo', 'loteria', 'noticia', 'filme', 'musica', 'jogo de'],
    ['Essa foge um pouco do meu balc\u00e3o! \ud83d\ude05 Eu cuido de d\u00favidas sobre o S\u03a8M Online: escalas, testes, painel, cr\u00e9ditos e resultados. No que posso ajudar por aqui?'], { c: L.CP() });
})(typeof window !== 'undefined' ? window : global);

/* kb-extra.js */
// ============================================================
// LAUANA - ajustes e novos assuntos descobertos nos testes
// (perguntas "da vida real" que a primeira versao nao entendia)
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, I = L.I, W = L.WHATS;
  var SERGIO = ['Falar com o S\u00e9rgio', 'Deixar recado ao S\u00e9rgio'];
  L.semFuzzy.cidade = 1; L.semFuzzy.idade = 1;
  function get(id) { return L.porId(id); }
  function add(id, ks) { var it = get(id); if (it) { it.k = it.k.concat(ks); it._k = null; } }
  function rem(id, ks) { var it = get(id); if (it) { it.k = it.k.filter(function (k) { return ks.indexOf(k) < 0; }); it._k = null; } }

  L.sin('informacao', ['informacoes', 'informacoe', 'info', 'infos']);
  L.setRaiva(['pessima', 'pessimas', 'pessimos', 'horrorosa', 'horroroso', 'decepcionado', 'decepcionada', 'decepcionante', 'insatisfeito', 'insatisfeita', 'odiei', 'detestei', 'terrivel', 'ladrao']);
  L.setInsulto(['vai merda', 'vai ferrar', 'vai cuidar', 'vai foder', 'vai tomar', 'se foder']);
  L.raivaFrases = L.raivaFrases.filter(function (f) { return !(f.length === 2 && f[0] === 'de' && f[1] === 'novo'); });

  // ---- ajustes em assuntos que ja existiam ----
  rem('oque_site', ['site fazer', 'site para']);
  add('oque_site', ['informacao', 'servir isso', 'servir aqui', 'usar isso', 'como usar', 'que voce gerar', 'defin voce gerar']);
  get('oque_site').semEnt = true; add('oque_site', ['como funcionar', 'saber funcionar', 'gostar saber']);
  get('erro_transcricao').p = 30;
  add('erro_transcricao', ['tflod esperar dia', 'processar nao funcionar', 'processar funcionar', 'audio processar']);
  I('fazem_laudo', ['voce gerar laudo', 'gerar laudo', 'emitir laudo', 'laudo neuropsicologico', 'laudo pronto', 'fazer laudo'],
    ['O site gera automaticamente o relat\u00f3rio em PDF de cada instrumento: pontua\u00e7\u00f5es, classifica\u00e7\u00f5es e, em v\u00e1rios testes, uma an\u00e1lise por IA. J\u00e1 o laudo neuropsicol\u00f3gico, que \u00e9 um documento cl\u00ednico, \u00e9 elaborado pelo profissional a partir dos resultados e da avalia\u00e7\u00e3o completa.'], { m: ['home', 'painel'], p: 10 });
  var pc = get('paciente_comecar'); pc.m = ['home', 'paciente'];
  rem('microfone', ['nao escutar']); add('som_audio', ['instrucoe falada', 'nao ouvir instrucao']);
  L.sin('apagar', ['apague', 'apaguem', 'apago', 'apagou', 'apagado']); L.sin('excluir', ['exclua', 'excluam', 'excluo', 'excluiu']);
  var lu = get('link_usado'); lu.a.home = lu.a.paciente;
  add('link_usado', ['link expirar']); rem('link_validade', ['link expirar']);
  var pv = get('privacidade');
  pv.a.home = ['Os dados ficam sob responsabilidade do profissional que aplica a avalia\u00e7\u00e3o. No site, os dados cadastrados s\u00e3o protegidos e acess\u00edveis s\u00f3 por ele, e o administrador do sistema n\u00e3o acessa informa\u00e7\u00f5es de pacientes. Aqui no chat eu n\u00e3o pe\u00e7o nem guardo dados pessoais.',
               'Dados totalmente an\u00f4nimos podem ser usados em pesquisa e normatiza\u00e7\u00e3o dos testes.'];
  add('privacidade', ['aparecer nome', 'vai aparecer nome']);
  add('excel_csv', ['exportar resultado', 'baixar resultado']);
  add('pacientes', ['apagar paciente', 'remover paciente', 'deletar paciente', 'editar']);
  add('dados_usuario', ['logo', 'colocar logo', 'trocar logo']);
  add('pagina_nao_carrega', ['painel lento', 'painel travar', 'painel carregar']);
  add('sessao_expirou', ['pedir entrar', 'entrar novo', 'pedir login']);
  rem('erro_transcricao', ['aguardando']); add('erro_transcricao', ['tflod esperar', 'esperar processar', 'esperar audio']);
  add('nao_responde', ['esperar dia', 'esperar resposta', 'esperar retorno', 'esperar atendimento', 'esperar solucao']);
  add('credito_abandono', ['culpa site', 'culpa sistema', 'falha sistema', 'erro sistema', 'paciente perder', 'perder teste']);
  rem('paciente_fechou', ['voltar']);
  add('paciente_enviar', ['faltar responder', 'faltar']);
  rem('obrigado', ['entendi']); add('obrigado', ['entendi obrigado', 'entender obrigado']);
  add('paciente_comecar', ['receber profissional', 'receber isso', 'receber psicologo']);
  add('paciente_certo_errado', ['ansioso', 'ansiosa', 'estou ansioso', 'medo ir mal', 'medo errar', 'ir mal', 'medo', 'inseguro']);
  add('paciente_comecar', ['profissional enviar', 'que gerar aqui', 'que devo gerar']);
  rem('ameaca', ['processar', 'processo']); add('ameaca', ['ilegal', 'crime', 'abusivo', 'lesar', 'propaganda enganosa', 'entrar justica']);
  add('emocional', ['vontade sumir', 'sumir do mundo', 'nao ver sentido', 'nao vale pena', 'cansar viver']);
  rem('clinico', ['ajudar responder']);
  add('golpe', ['ladrao']);

  // ---- quem pode usar / buscar avaliacao ----
  // ---- respostas de acompanhamento (so depois de certos assuntos) ----
  I('credito_demora', ['hora', 'dia', 'ja passar', 'ja esperar', 'esperar muito', 'tempo', 'demorar', 'ainda nao', 'continuar sumir', 'nada ainda'],
    ['Obrigada por avisar. Se j\u00e1 passou bem mais que 5 minutos, \u00e9 um caso para o S\u00e9rgio verificar o pagamento. Chame no ' + W + ' com o e-mail da sua conta e o comprovante.',
     'Se preferir, eu registro agora um recado com esses dados, para ele ver com prioridade.'], { after: ['credito_sumiu', 'credito_comprar'], p: 40, oferece: 'recado', c: SERGIO });
  I('ja_tentei', ['ja tentar', 'continuar igual', 'mesmo problema', 'nao resolver', 'ainda nao funcionar', 'persistir', 'mesma coisa', 'nao adiantar', 'continuar problema', 'nao deu certo'],
    { paciente: ['Entendo, obrigada por tentar. Como n\u00e3o resolveu, o melhor agora \u00e9 avisar o profissional que te enviou o link e contar o que aparece na tela.', 'Se quiser, deixo um recado para o S\u00e9rgio sobre o problema t\u00e9cnico.'],
      _: ['Entendo, obrigada por tentar. Como n\u00e3o resolveu, vamos levar para o S\u00e9rgio: ele acompanha as ocorr\u00eancias do site e confere o que houve.', 'Se voc\u00ea me disser em uma frase o que aparece na tela, eu registro como recado agora.'] },
    { after: ['microfone', 'paciente_enviar', 'link_usado', 'pagina_nao_carrega', 'erro_geral', 'pdf', 'login_problema', 'som_audio', 'erro_transcricao', 'sessao_expirou', 'email_spam'], p: 35, oferece: 'recado', c: SERGIO });
  I('quem_pode_usar', ['posso usar', 'sem ser profissional', 'precisar ser profissional', 'quem poder usar', 'so para profissional', 'sou estudante', 'estudante psicologia', 'aluno psicologia', 'curso psicologia', 'sou profissional posso'],
    ['O site foi pensado para profissionais da \u00e1rea (neuropsic\u00f3logos, psic\u00f3logos e afins), que usam os resultados na pr\u00e1tica cl\u00ednica. O painel \u00e9 gratuito e o cadastro \u00e9 autom\u00e1tico no primeiro acesso.',
     'Se voc\u00ea \u00e9 estudante ou de outra \u00e1rea e quer saber se pode usar, vale confirmar com o S\u00e9rgio (' + W + '). Qualquer pessoa pode experimentar a escala de demonstra\u00e7\u00e3o (DASS-21) na p\u00e1gina inicial.'],
    { c: ['Conhecer um teste', 'Falar com o S\u00e9rgio'], m: ['home', 'painel'] });
  I('busca_avaliacao', ['paciente precisar teste', 'precisar fazer teste', 'precisar avaliacao', 'quero avaliacao', 'avaliar meu filho', 'fazer avaliacao', 'quero fazer teste', 'fazer teste comigo', 'sou paciente', 'quero ser avaliado', 'avaliacao neuropsicologica para'],
    ['Entendi! Este site \u00e9 a ferramenta que o profissional usa para aplicar os testes, ent\u00e3o o caminho \u00e9 por ele: o psic\u00f3logo ou neuropsic\u00f3logo envia um link para a pessoa responder. Se voc\u00ea j\u00e1 tem um profissional, \u00e9 s\u00f3 pedir o link a ele.',
     'Se ainda n\u00e3o tem, o S\u00e9rgio atende em Campo Grande (MS): bot\u00e3o "Agendar" na p\u00e1gina inicial ou ' + W + '.'], { c: ['Falar com o S\u00e9rgio', 'Recebi um link'], m: ['home'], p: 6 });
  I('busca_atendimento', ['precisar profissional', 'precisar terapia', 'procurar profissional', 'quero terapia', 'indicar profissional', 'preciso de ajuda psicologica', 'quero fazer terapia'],
    ['Entendo. Se voc\u00ea precisa de atendimento, o S\u00e9rgio atende em Campo Grande (MS): bot\u00e3o "Agendar" na p\u00e1gina inicial ou ' + W + '.',
     'Se estiver passando por um momento muito dif\u00edcil agora, o CVV atende 24 horas no 188 (gratuito) e, em emerg\u00eancia, o SAMU no 192.'], { p: 30, neutro: true, c: ['Falar com o S\u00e9rgio'] });

  // ---- pagamento, planos, saldo ----
  I('pagamento_formas', ['aceitar comprar', 'forma comprar', 'formas comprar', 'parcelar', 'parcelamento', 'tem parcelamento'],
    ['O pagamento \u00e9 feito num link de pagamento que abre quando voc\u00ea escolhe o plano e clica em "Comprar". As formas dispon\u00edveis aparecem l\u00e1.',
     'Se quiser saber de uma forma espec\u00edfica (como Pix ou parcelamento), pergunte ao S\u00e9rgio: ' + W + '.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'], p: 4 });
  I('sem_assinatura', ['assinatura', 'mensalidade', 'plano mensal', 'desconto', 'cupom', 'promocao', 'cancelar assinatura', 'plano anual', 'pacote desconto'],
    ['Pelo que consta no site, n\u00e3o h\u00e1 mensalidade nem assinatura: o painel e as escalas s\u00e3o gratuitos, e os testes funcionam por cr\u00e9ditos, que n\u00e3o expiram.',
     'Quanto maior o pacote, menor o valor por aplica\u00e7\u00e3o (por exemplo, no TECFE: R$ 20 avulso, R$ 15 no pacote de 10 e R$ 10 no de 50). Descontos al\u00e9m disso, s\u00f3 o S\u00e9rgio pode informar: ' + W + '.'], { oferece: 'recado', c: ['Quanto custa?', 'Falar com o S\u00e9rgio'], m: ['home', 'painel'] });
  I('saldo', ['ver saldo', 'quanto credito', 'credito restar', 'credito acabar', 'sem credito', 'acabar credito', 'credito zerar', 'quantos credito', 'credito disponivel'],
    ['O seu saldo aparece no topo da aba de cada teste (por exemplo, "X cr\u00e9ditos TECFE dispon\u00edveis"). Se acabaram, use o bot\u00e3o "Comprar Cr\u00e9ditos" na aba do teste.',
     'Se o saldo n\u00e3o bate com o que voc\u00ea esperava, me avise que eu levo ao S\u00e9rgio.'], { oferece: 'recado', c: ['Como comprar cr\u00e9ditos?', 'Falar com o S\u00e9rgio'], m: ['home', 'painel'], p: 6 });
  I('bateria_completa', ['bateria completa', 'credito por teste', 'quantos credito gastar', 'credito bateria', 'quantos credito bateria'],
    ['A BAE completa consome 5 cr\u00e9ditos (1 por subteste) e a BRPI completa, 4 (1 por m\u00f3dulo). A BAFC est\u00e1 gratuita por enquanto. Nos demais testes pagos, cada aplica\u00e7\u00e3o consome 1 cr\u00e9dito.'], { m: ['home', 'painel'], p: 8 });
  I('trocar_email', ['mudar email', 'trocar email', 'alterar email', 'email login', 'novo email', 'mudar conta'],
    ['Trocar o e-mail de login n\u00e3o \u00e9 algo que eu consiga fazer ou explicar com seguran\u00e7a, porque o login est\u00e1 ligado \u00e0 sua conta e aos seus cr\u00e9ditos. O S\u00e9rgio resolve isso: ' + W + '. Se quiser, deixo um recado registrado.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });
  I('link_whatsapp', ['enviar link contato', 'link contato', 'enviar contato link', 'copiar link', 'botao contato'],
    ['Depois de gerar o link, aparecem os bot\u00f5es "Copiar" e "WhatsApp": o WhatsApp abre a mensagem pronta com o link. Se preferir, copie e cole em qualquer aplicativo de mensagem ou e-mail.'], { m: ['home', 'painel'], p: 4 });
  I('teste_travou', ['teste travar', 'travar meio', 'teste parar', 'teste bugar', 'paciente travar', 'travou paciente', 'teste congelar'],
    ['Poxa! Se o teste travou com o paciente, pe\u00e7a para ele n\u00e3o fechar nem recarregar por um instante. Se n\u00e3o voltar, avise: me diga qual teste era e deixe um recado ao S\u00e9rgio com o e-mail da sua conta.',
     'O cr\u00e9dito \u00e9 cobrado no in\u00edcio e n\u00e3o volta quando o paciente abandona, mas, se foi falha do sistema, o S\u00e9rgio confere o caso e pode devolver.'], { oferece: 'recado', c: SERGIO, m: ['home', 'painel'] });
  I('idioma', ['ingles', 'espanhol', 'idioma', 'outro idioma', 'versao ingles', 'traduzir', 'traducao'],
    ['O site est\u00e1 em portugu\u00eas. Sobre vers\u00f5es em outros idiomas, eu n\u00e3o tenho informa\u00e7\u00e3o: pergunte ao S\u00e9rgio (' + W + ').'], { oferece: 'recado', c: SERGIO });
  I('recomendar_teste', ['melhor teste', 'qual indicar', 'teste indicado', 'recomendar teste', 'qual teste usar', 'qual aplicar', 'qual escala usar'],
    ['Quem escolhe o instrumento \u00e9 o profissional, de acordo com a queixa e o caso, e eu n\u00e3o posso recomendar. O que posso \u00e9 te mostrar o que existe para cada tema (por exemplo, "escala para TDAH" ou "teste de mem\u00f3ria") e o que cada teste mede.'], { c: ['Quais testes existem?', 'Quais escalas existem?'], p: 5 });

  // ---- paciente: duvidas do dia a dia ----
  I('paciente_depois', ['fazer depois', 'fazer mais tarde', 'deixar depois', 'outro dia', 'fazer amanha', 'posso depois'],
    ['Pode sim, dentro do prazo do link (at\u00e9 30 dias). S\u00f3 tenha em mente que, depois que voc\u00ea come\u00e7a, o ideal \u00e9 terminar de uma vez, sem pausar. Se tiver d\u00favida sobre o melhor momento, combine com o profissional que te enviou.'], { m: ['home', 'paciente'], c: { paciente: L.chipsPadrao('paciente'), home: [], painel: [] } });
  I('paciente_ajuda_terceiro', ['pedir ajuda humano responder', 'humano responder', 'responder por outra', 'responder por ele', 'responder por ela', 'outro responder', 'posso responder por', 'terceiro responder'],
    ['Depende do instrumento: quando \u00e9 para pais ou professores responderem, o profissional avisa. Quando \u00e9 voc\u00ea quem responde, as respostas devem ser suas, do seu jeito. Se precisa de ajuda s\u00f3 para ler ou mexer no aparelho, combine com o profissional antes.'], { m: ['home', 'paciente'], p: 8 });
  I('voltar_corrigir', ['errar resposta', 'errei', 'marquei errado', 'corrigir resposta', 'mudar resposta', 'trocar resposta', 'voltar pergunta', 'voltar questao', 'voltar item', 'posso voltar', 'voltar corrigir'],
    ['N\u00e3o consigo confirmar, caso a caso, se d\u00e1 para voltar e corrigir. Nas escalas (perguntas em uma p\u00e1gina s\u00f3), em geral d\u00e1 para rolar e mudar a op\u00e7\u00e3o antes de enviar. Nos testes, cada tarefa segue em sequ\u00eancia e n\u00e3o sei dizer se h\u00e1 volta.',
     'Se foi algo importante, conte ao profissional depois: ele considera isso na interpreta\u00e7\u00e3o. \ud83d\udc9a'], { m: ['home', 'paciente'], p: 6 });
  I('falar_profissional', ['falar profissional', 'contato profissional', 'falar meu profissional', 'falar quem aplicar', 'profissional que aplicar', 'falar quem enviar'],
    ['Quem te enviou o link \u00e9 o profissional que te acompanha, e o contato dele voc\u00ea j\u00e1 tem. \ud83d\ude09 Pelo site, eu s\u00f3 consigo te passar o contato do S\u00e9rgio, que \u00e9 o respons\u00e1vel pela plataforma, caso o assunto seja o funcionamento do site: ' + W + '.'], { m: ['home', 'paciente'], c: { paciente: [], home: ['Falar com o S\u00e9rgio'], painel: [] } });
  I('obrigatorio', ['obrigatorio', 'ser obrigado', 'tenho fazer', 'posso recusar', 'nao quero fazer', 'preciso fazer', 'sou obrigado'],
    ['Responder \u00e9 uma decis\u00e3o sua, em acordo com o profissional que pediu. Se tiver d\u00favida sobre a necessidade, ou se n\u00e3o quiser fazer, converse com ele antes: ele explica o objetivo e voc\u00eas decidem juntos.'], { m: ['home', 'paciente'], p: 4 });

  // ---- conflito, insatisfacao e direitos ----
  I('reincidencia', ['terceira vez', 'segunda vez', 'toda vez', 'sempre acontecer', 'acontecer novamente', 'mais uma vez', 'outra vez', 'voltar acontecer', 'terceira veze', 'toda veze'],
    ['Lamento muito que isso esteja se repetindo, e entendo a irrita\u00e7\u00e3o: ter o mesmo problema v\u00e1rias vezes cansa. Quero que o S\u00e9rgio investigue a causa, e n\u00e3o s\u00f3 o sintoma.',
     'Me conta em uma frase o que acontece (qual teste ou tela e o que aparece) e eu deixo registrado como recado para ele.'], { p: 22, oferece: 'recado', neutro: true, c: SERGIO });
  I('nao_ajuda', ['nao ajudar', 'ajudar nada', 'nao resolver', 'nao servir', 'voce nao resolver', 'nao adiantar', 'nao entender nada'],
    ['Sinto muito n\u00e3o ter ajudado at\u00e9 aqui. Vamos tentar de outro jeito: me diga, em uma frase, o que voc\u00ea precisa. Se preferir, o S\u00e9rgio resolve pessoalmente: ' + W + '.'], { p: 14, oferece: 'recado', neutro: true, c: SERGIO });
  I('ansiedade_teste', ['crise ansiedade teste', 'teste deixar ansioso', 'fiquei ansioso', 'fiquei nervoso', 'passar mal', 'tive crise', 'ansiedade fazendo', 'teste me deixar', 'senti mal teste', 'chorei'],
    ['Sinto muito que isso tenha acontecido. \ud83d\udc9a Se voc\u00ea ficou muito mal, procure apoio de quem te acompanha. Se precisar de ajuda imediata, o CVV atende 24 horas no 188 e o SAMU no 192.',
     'Conte ao profissional que aplicou o teste como voc\u00ea se sentiu: ele pode ajustar a avalia\u00e7\u00e3o com voc\u00ea. Se for sobre o funcionamento do site, posso levar um recado ao S\u00e9rgio.'], { p: 46, neutro: true, c: ['Deixar recado ao S\u00e9rgio'] });
  I('laudo_errado', ['laudo errado', 'resultado errado', 'resultado estar errado', 'diagnostico errado', 'erro laudo', 'erro resultado', 'calculo errado', 'pontuacao errado', 'nota errada', 'erro pontuacao', 'diagnosticado errado'],
    ['Entendo a preocupa\u00e7\u00e3o. Duas coisas: o site faz rastreio e n\u00e3o fecha diagn\u00f3stico, e a interpreta\u00e7\u00e3o do resultado \u00e9 do profissional que aplicou.',
     'Se voc\u00ea acha que h\u00e1 um erro de c\u00e1lculo ou de pontua\u00e7\u00e3o no relat\u00f3rio, isso \u00e9 importante: me conte qual teste e o que parece errado, ou fale direto com o S\u00e9rgio (' + W + '), que confere.'], { p: 28, oferece: 'recado', c: SERGIO });
  I('alterar_resultado', ['mudar resultado', 'alterar resultado', 'editar resultado', 'trocar resultado', 'apagar resultado', 'excluir resultado', 'refazer teste', 'refazer aplicacao', 'remover resultado'],
    ['Os resultados s\u00e3o calculados automaticamente a partir das respostas e n\u00e3o devem ser alterados \u00e0 m\u00e3o. Se houve um engano na aplica\u00e7\u00e3o (por exemplo, respondido sem querer), o caminho \u00e9 refazer a aplica\u00e7\u00e3o.',
     'Para apagar resultados que voc\u00ea n\u00e3o quer mais, as abas de escalas e testes t\u00eam o bot\u00e3o "Apagar Selecionados".'], { m: ['home', 'painel'], p: 8 });
  I('direitos_titular', ['apagar dado', 'apagar resposta', 'excluir dado', 'remover dado', 'lgpd direito', 'quero meu dado', 'acessar meu dado', 'direito titular', 'excluir minha', 'apagar minha'],
    { painel: ['Voc\u00ea pode apagar resultados com o bot\u00e3o "Apagar Selecionados" (nas abas de escalas e testes) e encerrar a conta, se quiser, o que remove pacientes, resultados e o seu registro. Exporte antes o que quiser guardar. Se precisar de ajuda com isso, fale com o S\u00e9rgio: ' + W + '.'],
      _: ['Entendo, e \u00e9 um direito seu. Os seus dados foram cadastrados pelo profissional que aplicou a avalia\u00e7\u00e3o, e ele \u00e9 o respons\u00e1vel por eles. Pe\u00e7a a ele para exclu\u00ed-los.',
          'Se n\u00e3o conseguir falar com ele, escreva para o S\u00e9rgio (' + W + ') dizendo o que precisa. Posso deixar um recado registrado.'] },
    { p: 24, oferece: 'recado', c: { home: SERGIO, paciente: SERGIO, painel: [] } });
  I('obrigado2', ['entendi obrigado', 'ficou claro', 'agora entendi', 'consegui resolver', 'deu certo', 'problema resolvido'],
    ['Que bom! \ud83d\udc9a Fico feliz que tenha dado certo. Se surgir outra d\u00favida, \u00e9 s\u00f3 chamar.'], { c: L.CP(), p: 3 });

  I('por_que_cidade', ['por que cidade', 'porque cidade', 'para que cidade', 'pra que cidade', 'cidade para que', 'por que perguntar cidade', 'guardar cidade', 'cidade guardar', 'precisar cidade', 'por que saber cidade'],
    ['\u00c9 s\u00f3 curiosidade nossa: o S\u00e9rgio gosta de saber de onde o pessoal vem. \ud83d\ude0a Guardo apenas a cidade, sem o seu nome e sem outros dados. Se preferir n\u00e3o dizer, tudo bem, \u00e9 s\u00f3 falar.'], { m: ['home'], p: 8 });

  // ---- glossario extra ----
  L.glos.push({ id: 'neuropsicologia', nomes: ['neuropsicologia', 'neuropsicologica', 'neuropsicologico'],
    t: ['Neuropsicologia estuda a rela\u00e7\u00e3o entre o c\u00e9rebro e o comportamento. A avalia\u00e7\u00e3o neuropsicol\u00f3gica usa entrevistas, escalas e testes para entender como a pessoa usa aten\u00e7\u00e3o, mem\u00f3ria, linguagem, planejamento e outras fun\u00e7\u00f5es no dia a dia.',
        'Aqui no site, os instrumentos s\u00e3o de rastreio: levantam pistas que o profissional interpreta junto com a hist\u00f3ria da pessoa.'], c: ['Como funciona o site?'] });
})(typeof window !== 'undefined' ? window : global);

/* kb-contexto.js */
// ============================================================
// LAUANA - CONTEXTO DO PAINEL (aba e programa em que o profissional esta)
// A Lauana sabe em que aba/programa voce esta (o widget le do proprio painel) e responde ESPECIFICO:
//   - abertura diz onde voce esta e oferece botoes daquela aba;
//   - perguntas vagas ("como funciona isso?", "quanto custa?", "como uso?") valem para a aba/programa atual;
//   - no painel, "agendar consulta" e a AGENDA do profissional (nunca manda para o Doctoralia do Sergio).
// Todo o texto vem do proprio painel e dos Manuais Tecnicos. Onde o painel nao diz, ela nao inventa.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, resp = L.resp, norm = L.norm, W = L.WHATS;
  function ent(id) { for (var i = 0; i < L.ents.length; i++) { if (L.ents[i].id === id) { return L.ents[i]; } } return null; }

  // ---------- 1) CORRECOES DE CONTEUDO: o "como usar" destas entidades estava com o texto padrao dos testes ("Nova Aplicacao"), que nao existe nelas ----------
  var COMO = {
    agenda: 'Clique em "+ Nova Consulta", escolha um paciente cadastrado (ou use "+ Novo Paciente" para cadastrar na hora: nome, nascimento, sexo, WhatsApp e e-mail), defina data e hor\u00e1rio e salve. A consulta aparece no calend\u00e1rio e nas listas da semana e do dia.',
    anamnese: 'Na aba Anamnese: 1) escolha o tipo (Personalizada ou Infantil); 2) preencha os dados do paciente e clique em "Copiar Link" ou "WhatsApp" (tamb\u00e9m h\u00e1 o bot\u00e3o "Preencher Aqui"); 3) o respons\u00e1vel responde pelo celular ou computador, sem instalar nada; 4) as respostas aparecem sozinhas na se\u00e7\u00e3o Resultados; 5) clique no resultado para ver ou gerar o PDF.',
    prontuario: 'Na aba Prontu\u00e1rio: 1) crie ou escolha um perfil de t\u00f3picos para o tipo de atendimento; 2) selecione o paciente (ou digite o nome); 3) clique em "Abrir Gravador" (abre uma nova janela); 4) grave a sess\u00e3o, e o sistema transcreve o que \u00e9 falado; 5) ao terminar, clique em "Resumir com IA" (ou "Gerar Prontu\u00e1rio por T\u00f3picos"); 6) revise e edite o texto e salve em HTML ou copie para o seu prontu\u00e1rio.',
    reocupa: 'Na aba Reabilita\u00e7\u00e3o, escolha o REOCUPA: 1) selecione ou preencha os dados do paciente; 2) se quiser, clique em "Configurar Perguntas" para personalizar as perguntas de cada situa\u00e7\u00e3o e salve; 3) clique em "Iniciar Sess\u00e3o" (o programa abre em nova aba); 4) compartilhe sua tela com o paciente na videochamada; 5) escolha a categoria de situa\u00e7\u00f5es-problema; 6) o paciente l\u00ea em voz alta e responde, e o programa registra o tempo e classifica sozinho; 7) confirme ou corrija a classifica\u00e7\u00e3o de cada resposta. No fim, os resultados s\u00e3o salvos e a evolu\u00e7\u00e3o fica registrada.',
    lermais: 'Na aba Reabilita\u00e7\u00e3o, escolha o LERMAIS: 1) selecione ou preencha os dados do paciente (e o n\u00edvel de dificuldade, se quiser); 2) clique em "Iniciar Sess\u00e3o" (abre em nova aba), ou use "Gerar Link" (link de uso \u00fanico, com Copiar e WhatsApp) ou "Aplicar Aqui"; 3) o paciente preenche o formul\u00e1rio e clica em "Sortear Texto"; 4) clica em "Iniciar Leitura" e l\u00ea o texto em voz alta; 5) o gr\u00e1fico mostra precis\u00e3o x velocidade em tempo real. No fim, os resultados s\u00e3o salvos para compara\u00e7\u00e3o, e "Ver Evolu\u00e7\u00e3o do Paciente" mostra o hist\u00f3rico.',
    prat: 'Na aba Reabilita\u00e7\u00e3o, escolha o PRAt: 1) clique em "Iniciar Sess\u00e3o" (o programa abre em nova aba); 2) preencha os dados do participante (nome, nascimento, sexo); 3) clique em "Iniciar Atividade" (entra em tela cheia com cron\u00f4metro); 4) o participante clica nos quadrados e escolhe a cor na paleta; 5) ao terminar, clica em "Finalizar" para ver os resultados; 6) gere o PDF ou exporte o Excel para o prontu\u00e1rio.',
    smart: 'Na aba Reabilita\u00e7\u00e3o, escolha o SMART e selecione o paciente na lista de pacientes cadastrados. O programa re\u00fane os resultados dos testes dele e gera as metas SMART de reabilita\u00e7\u00e3o cognitiva com IA. O Manual T\u00e9cnico fica na pr\u00f3pria aba.'
  };
  Object.keys(COMO).forEach(function (id) { var e = ent(id); if (e) { e.como = COMO[id]; } });
  // aparelho: a base ja afirma que quase tudo roda no celular, tablet ou computador (a BAE e a excecao); "Funciona no navegador." sozinho nao respondia "funciona no celular?"
  var DISP_PADRAO = 'Funciona no navegador, no celular, tablet ou computador. A \u00fanica exce\u00e7\u00e3o entre os testes \u00e9 a BAE, que s\u00f3 roda em computador com teclado.';
  ['trmv', 'taav', 'tref', 'corsi', 'tpvset', 'brpi', 'tecfe', 'tte'].forEach(function (id) { var e = ent(id); if (e) { e.disp = DISP_PADRAO + (id === 'tte' ? ' No TTE a pessoa arrasta a linha com o dedo ou o mouse.' : ''); } });
  // TTE: o painel nao informa uma duracao fixa; so que cada parte tem 25 itens e que o tempo de cada parte e registrado
  var tteE = ent('tte'); if (tteE) { tteE.dur = 'O painel n\u00e3o informa uma dura\u00e7\u00e3o fixa para o TTE. Cada parte (A e B) tem 25 itens, e o sistema registra o tempo de execu\u00e7\u00e3o e os erros de cada uma.'; }

  // ---------- 2) TEXTOS DAS ABAS E PROGRAMAS QUE NAO SAO ENTIDADES DA BASE ----------
  var ABAS = {
    dadosUsuario: {
      nome: 'Dados do Usu\u00e1rio',
      intro: ['Aqui voc\u00ea preenche uma vez seus dados profissionais: nome, CRP, telefone, e-mail, endere\u00e7o e o logo (opcional). Depois \u00e9 s\u00f3 clicar em "Salvar Dados".'],
      qa: [
        { chip: 'Preciso preencher tudo?', g: ['preencher', 'obrigatorio', 'opcional', 'branco'], r: ['N\u00e3o. Preencher \u00e9 opcional: se voc\u00ea deixar em branco, informa seu nome e CRP manualmente em cada teste.'] },
        { chip: 'Onde meus dados aparecem?', g: ['aparecer', 'crp', 'identificacao', 'resultado'], r: ['Se voc\u00ea preencher, seu nome e CRP entram automaticamente como identifica\u00e7\u00e3o nos resultados dos testes.'] },
        { chip: 'Como coloco meu logo?', g: ['logo', 'cabecalho', 'pdf'], r: ['Em "Dados do Usu\u00e1rio" h\u00e1 o campo Logo (opcional), com bot\u00e3o para remover. Na aba Anamnese tamb\u00e9m d\u00e1 para personalizar o cabe\u00e7alho do PDF (logo, cores e telefones).'] }
      ]
    },
    pacientes: {
      nome: 'Pacientes',
      intro: ['Aqui voc\u00ea cadastra cada paciente uma vez s\u00f3, e ele fica dispon\u00edvel em todos os testes, escalas, agenda e prontu\u00e1rio. Nome e data de nascimento s\u00e3o obrigat\u00f3rios, e o sistema avisa se j\u00e1 existe um cadastro parecido.'],
      qa: [
        { chip: 'Como cadastro um paciente?', g: ['cadastrar', 'novo', 'cadastro', 'adicionar'], r: ['Preencha nome completo e data de nascimento (obrigat\u00f3rios) e, se quiser, CPF, sexo e escolaridade, e salve. O sistema avisa se j\u00e1 existe um cadastro parecido. O paciente fica dispon\u00edvel em todos os testes, escalas, agenda e prontu\u00e1rio.'] },
        { chip: 'Como importo por CSV?', g: ['importar', 'csv', 'lista', 'planilha'], r: ['Na pr\u00f3pria aba Pacientes h\u00e1 os bot\u00f5es "Importar CSV" e "Exportar CSV". Vale fazer um backup de vez em quando.'] },
        { chip: 'O que \u00e9 Verificar Duplicatas?', g: ['duplicata', 'duplicado', 'repetido'], r: ['\u00c9 o bot\u00e3o que confere se h\u00e1 cadastros repetidos ou parecidos na sua lista de pacientes.'] },
        { chip: 'Meus pacientes ficam seguros?', g: ['seguro', 'privacidade', 'sigilo', 'acessar'], r: ['Os dados dos seus pacientes s\u00e3o acess\u00edveis s\u00f3 por voc\u00ea, e o administrador do sistema n\u00e3o acessa informa\u00e7\u00f5es de pacientes.'] }
      ]
    },
    escalas: {
      nome: 'Escalas',
      intro: ['Aqui voc\u00ea envia escalas ao paciente e recebe os resultados. S\u00e3o mais de 50 escalas, gratuitas, com relat\u00f3rio em PDF. Os bot\u00f5es principais s\u00e3o "Aplicar Escala", "Enviar Escala ao Paciente" (escolha a escala na lista), "Exportar Excel" e "Apagar Selecionados".'],
      qa: [
        { chip: 'Como envio uma escala?', g: ['enviar', 'link', 'aplicar', 'gerar'], intent: 'gerar_link' },
        { chip: 'Quais escalas existem?', g: ['existir', 'lista', 'quais', 'disponivel'], intent: 'lista_escalas' },
        { chip: 'As escalas s\u00e3o gratuitas?', g: ['gratis', 'gratuito', 'custa', 'preco', 'pagar'], r: ['Sim. As mais de 50 escalas s\u00e3o gratuitas, com relat\u00f3rio em PDF.'] },
        { chip: 'Como exporto os resultados?', g: ['exportar', 'excel', 'planilha'], intent: 'excel_csv' },
        { chip: 'Como apago resultados?', g: ['apagar', 'excluir', 'deletar', 'remover'], r: ['Marque os resultados que quer apagar (h\u00e1 a op\u00e7\u00e3o "Selecionar todos") e clique em "Apagar Selecionados".'] }
      ]
    },
    anamnese: { nome: 'Anamnese', ent: 'anamnese', chips: ['O que \u00e9 a Anamnese?', 'Como uso a Anamnese?', 'Como personalizo a anamnese?', 'Quanto custa a Anamnese?'], extra: [
      { chip: 'Como personalizo a anamnese?', g: ['personalizar', 'secao', 'pergunta', 'editar', 'cabecalho'], r: ['Na Anamnese Personalizada voc\u00ea escolhe quais se\u00e7\u00f5es incluir (role at\u00e9 o final da aba): marque ou desmarque temas, edite perguntas existentes ou adicione novas. Em "Configura\u00e7\u00f5es do PDF" d\u00e1 para personalizar o cabe\u00e7alho (logo, cores e telefones).'] }
    ] },
    agenda: { nome: 'Agenda', ent: 'agenda', chips: ['O que \u00e9 a Agenda?', 'Como marco uma consulta?', 'Como sincronizo com o Google Calendar?', 'Como compartilho minha agenda?'], extra: [
      { chip: 'Como marco uma consulta?', g: ['marcar', 'agendar', 'consulta', 'horario', 'agendamento'], r: [COMO.agenda] },
      { chip: 'Como sincronizo com o Google Calendar?', g: ['google', 'calendar', 'sincronizar', 'conectar'], r: ['Clique em "Conectar" e autorize a sincroniza\u00e7\u00e3o com o Google Calendar. Assim as consultas aparecem tamb\u00e9m na sua agenda do Google (celular e computador). A conex\u00e3o usa o login do Google: conceda o acesso s\u00f3 na sua pr\u00f3pria conta e, em computador compartilhado, saia da conta ao terminar.'] },
      { chip: 'Como compartilho minha agenda?', g: ['compartilhar', 'colega', 'autorizar', 'compartilhada'], r: ['Em "Agenda Compartilhada" voc\u00ea autoriza outros profissionais a ver a sua agenda (informando o e-mail deles) e tamb\u00e9m v\u00ea a agenda de colegas que autorizaram voc\u00ea. Compartilhe com crit\u00e9rio: a agenda mostra hor\u00e1rios e nomes de pacientes. Autorize s\u00f3 colegas de confian\u00e7a e revise a lista de vez em quando.'] },
      { chip: 'Como funcionam os lembretes?', g: ['lembrete', 'telegram', 'avisar', 'lembrar'], intent: 'agenda_lembrete' }
    ] },
    prontuario: { nome: 'Prontu\u00e1rio', ent: 'prontuario', chips: ['O que \u00e9 o Prontu\u00e1rio?', 'Como uso o Prontu\u00e1rio?', 'Quanto custa o Prontu\u00e1rio?', 'A transcri\u00e7\u00e3o saiu vazia'], extra: [
      { chip: 'O que \u00e9 perfil de t\u00f3picos?', g: ['perfil', 'topico', 'secao'], r: ['Perfil de t\u00f3picos \u00e9 a lista de se\u00e7\u00f5es que a IA vai preencher a partir da transcri\u00e7\u00e3o. Voc\u00ea cria um perfil para cada tipo de atendimento (por exemplo "Anamnese Adulto", "Devolutiva" ou "Sess\u00e3o Terap\u00eautica"), e os t\u00f3picos s\u00e3o edit\u00e1veis: adicione, remova ou renomeie conforme a sua pr\u00e1tica.'] },
      { chip: 'Posso colar um texto sem gravar?', g: ['colar', 'texto', 'gravar', 'anotacao'], r: ['Pode. Sem gravar tamb\u00e9m funciona: cole o texto direto na caixa de transcri\u00e7\u00e3o (anota\u00e7\u00f5es antigas, observa\u00e7\u00f5es) e use a IA s\u00f3 para organizar por t\u00f3picos.'] },
      { chip: 'A transcri\u00e7\u00e3o saiu vazia', g: ['vazia', 'vazio', 'transcricao', 'microfone', 'audio', 'permissao'], r: ['A transcri\u00e7\u00e3o depende do \u00e1udio: use um ambiente silencioso, o microfone razoavelmente perto e fale em volume normal (com duas pessoas, ponha o microfone entre voc\u00eas). Se vier vazia, confira a permiss\u00e3o do microfone (\u00edcone de cadeado na barra de endere\u00e7o). O Chrome costuma funcionar melhor.'] },
      { chip: 'E o sigilo das sess\u00f5es?', g: ['sigilo', 'seguro', 'lgpd', 'privacidade', 'anonimizacao', 'consentimento'], r: ['Antes de ir \u00e0 IA os dados passam por anonimiza\u00e7\u00e3o. Mesmo assim, grave s\u00f3 com o consentimento do paciente, guarde os arquivos com seguran\u00e7a e n\u00e3o compartilhe o conte\u00fado fora do contexto cl\u00ednico. A IA \u00e9 apoio: o texto \u00e9 um rascunho, e voc\u00ea revisa e assume o registro final.'] }
    ] },
    correcao: {
      nome: 'Corre\u00e7\u00e3o',
      intro: ['Aqui voc\u00ea corrige testes de papel com c\u00e1lculo autom\u00e1tico: BVRT, ETDAH-PAIS e ETDAH-CriAd. Escolha o teste, informe os dados e o programa calcula e monta a tabela para o laudo.'],
      qa: []
    },
    reabilitacao: {
      nome: 'Reabilita\u00e7\u00e3o',
      intro: ['Aqui ficam os programas de acompanhamento: REOCUPA, SMART, LERMAIS e PRAt. Escolha o programa na barra do topo da aba.'],
      qa: [
        { chip: 'Quais programas existem?', g: ['existir', 'quais', 'programa', 'lista'], r: ['REOCUPA (reabilita\u00e7\u00e3o ocupacional, com reconhecimento de voz), SMART (metas de reabilita\u00e7\u00e3o cognitiva geradas por IA), LERMAIS (flu\u00eancia leitora com reconhecimento de voz) e PRAt (reabilita\u00e7\u00e3o da aten\u00e7\u00e3o).'] }
      ]
    },
    depoimentos: {
      nome: 'Depoimentos',
      intro: ['Aqui voc\u00ea v\u00ea os depoimentos recebidos e responde. O link para as pessoas enviarem depoimento \u00e9 setmonte.github.io/depoimento/.'],
      qa: [{ chip: 'Onde envio o link?', g: ['link', 'enviar', 'pedir'], r: ['O link para enviar depoimento \u00e9 https://setmonte.github.io/depoimento/ . Quem recebe preenche nome, nota e o texto.'] }]
    },
    programasOcultos: {
      nome: 'Programas Ocultos',
      intro: ['Aqui ficam os programas de uso profissional exclusivo: Pfister, NEO PI-R, SRS-2 (Escolar, Adulto Autorrelato e Adulto Heterorrelato), ETDAH-PAIS e Vineland-3.'],
      qa: []
    },
    admin: {
      nome: 'Admin',
      intro: ['Painel administrativo, com as abas Mensagens, Enviados, Monitor, Usu\u00e1rios, Cr\u00e9ditos, Resultados e Ferramentas.'],
      qa: [{ chip: 'O que \u00e9 o cart\u00e3o da Lauana?', g: ['cartao', 'lauana', 'recado', 'visitante'], r: ['\u00c9 onde aparecem os recados deixados para o S\u00e9rgio, as cidades e os idiomas dos visitantes e as perguntas que eu n\u00e3o soube responder (\u00fateis para ampliar o que eu sei).'] }]
    }
  };

  // programas sem entidade na base: texto direto do painel
  var PROGS = {
    bvrt: { aba: 'correcao', nome: 'BVRT', oque: ['BVRT \u2014 Teste de Reten\u00e7\u00e3o Visual de Benton. C\u00e1lculo autom\u00e1tico de Z-Score e classifica\u00e7\u00e3o: voc\u00ea informa idade, escolaridade e os escores obtidos, o programa seleciona a norma correta e gera a tabela pronta para o laudo. H\u00e1 tamb\u00e9m a consulta de figuras e c\u00f3digos de erro.'],
      como: ['Em "Dados do Paciente" escolha o paciente cadastrado (ou digite manualmente), informe idade e escolaridade e preencha os escores da administra\u00e7\u00e3o aplicada (por exemplo A \u2014 Mem\u00f3ria e C \u2014 C\u00f3pia): acertos e erros por tipo (omiss\u00f5es, distor\u00e7\u00f5es, persevera\u00e7\u00f5es, rota\u00e7\u00f5es, trocas de posi\u00e7\u00e3o e erros de tamanho). O programa calcula o Z-Score e a classifica\u00e7\u00e3o.'] },
    etdah: { aba: 'correcao', nome: 'ETDAH-PAIS (corre\u00e7\u00e3o)', idade: ['O ETDAH-PAIS vale de 2 a 17 anos (normas por sexo e faixa et\u00e1ria, Benczik, 2018).'], oque: ['ETDAH-PAIS \u2014 Escala de Avalia\u00e7\u00e3o de Comportamentos Infantojuvenis no TDAH, respondida pelos pais ou respons\u00e1veis. Voc\u00ea marca a pontua\u00e7\u00e3o de cada item (1 a 6), o sistema aplica as invers\u00f5es automaticamente e calcula os percentis por sexo e faixa et\u00e1ria. P\u00fablico-alvo: 2 a 17 anos, 58 itens, 4 fatores, normas por sexo e faixa et\u00e1ria (Benczik, 2018).'],
      como: ['Escolha o paciente cadastrado (ou digite manualmente) e marque a pontua\u00e7\u00e3o de cada item, de 1 (Nunca) a 6 (Muito Frequente). O sistema inverte os itens necess\u00e1rios sozinho e calcula os percentis. D\u00e1 para adicionar v\u00e1rios respondentes (m\u00e3e, pai, professor) e comparar os perfis lado a lado no resultado.'] },
    criad: { aba: 'correcao', nome: 'ETDAH-CriAd', idade: ['O ETDAH-CriAd vale de 6 a 15 anos (normas por faixa et\u00e1ria, Benczik, 2018).'], oque: ['ETDAH-CriAd \u2014 Escala de Autoavalia\u00e7\u00e3o do TDAH (crian\u00e7as e adolescentes). \u00c9 de autorrelato: a pr\u00f3pria crian\u00e7a ou adolescente responde sobre si, e voc\u00ea registra aqui as respostas dadas na aplica\u00e7\u00e3o. Escala de 1 (Nunca) a 4 (Sempre). P\u00fablico-alvo: 6 a 15 anos, 22 itens, 2 fatores, normas por faixa et\u00e1ria (Benczik, 2018).'],
      como: ['Escolha o paciente cadastrado (ou digite manualmente), informe a idade (6 a 15) e o sexo e registre as respostas de cada item (1 Nunca, 2 Um pouco, 3 \u00c0s vezes, 4 Sempre). Depois clique em "Calcular Resultados".'] },
    pfister: { aba: 'programasOcultos', nome: 'Pfister', oque: ['Teste das Pir\u00e2mides Coloridas de Pfister: teste projetivo para avalia\u00e7\u00e3o da din\u00e2mica emocional e de indicadores cognitivos. O paciente preenche pir\u00e2mides com cores da sua prefer\u00eancia, e o programa analisa a frequ\u00eancia crom\u00e1tica, as s\u00edndromes e a f\u00f3rmula crom\u00e1tica.'] },
    neo: { aba: 'programasOcultos', nome: 'NEO PI-R', oque: ['NEO PI-R \u2014 Invent\u00e1rio de Personalidade NEO Revisado. Avalia os 5 grandes fatores (Neuroticismo, Extrovers\u00e3o, Abertura, Amabilidade e Conscienciosidade), com 240 itens e 30 facetas. Normas brasileiras (N=160.671). \u00c9 ideal para enviar por link, para o paciente responder com conforto em casa.'] },
    srs2: { aba: 'programasOcultos', nome: 'SRS-2 Escolar', idade: ['O SRS-2 Escolar vale de 4 a 18 anos.'], oque: ['SRS-2 Escolar \u2014 Escala de Responsividade Social (idade escolar, 4 a 18 anos). Avalia d\u00e9ficits na reciprocidade social associados ao TEA: 65 itens e 5 subescalas de interven\u00e7\u00e3o, respondida por pais ou professores, com normas brasileiras e Escore T por sexo.'] },
    srs2aa: { aba: 'programasOcultos', nome: 'SRS-2 Adulto (Autorrelato)', idade: ['O SRS-2 Adulto Autorrelato vale a partir de 19 anos.'], oque: ['SRS-2 Adulto Autorrelato \u2014 Escala de Responsividade Social, a partir de 19 anos. Avalia d\u00e9ficits na reciprocidade social associados ao TEA: 65 itens e 5 subescalas de interven\u00e7\u00e3o. A pr\u00f3pria pessoa responde sobre si. Normas brasileiras (ambos os sexos), com Escore T e Percentil.'] },
    srs2ah: { aba: 'programasOcultos', nome: 'SRS-2 Adulto (Heterorrelato)', idade: ['O SRS-2 Adulto Heterorrelato vale a partir de 19 anos.'], oque: ['SRS-2 Adulto Heterorrelato \u2014 Escala de Responsividade Social, a partir de 19 anos. Avalia d\u00e9ficits na reciprocidade social associados ao TEA: 65 itens e 5 subescalas de interven\u00e7\u00e3o. Um informante responde sobre a pessoa avaliada. Normas brasileiras (ambos os sexos), com Escore T e Percentil.'] },
    etdahp: { aba: 'programasOcultos', nome: 'ETDAH-PAIS', idade: ['O ETDAH-PAIS vale de 2 a 17 anos (a crian\u00e7a ou o adolescente \u00e9 o paciente cadastrado).'], oque: ['ETDAH-PAIS \u2014 Avalia\u00e7\u00e3o de Comportamentos Infantojuvenis no TDAH (vers\u00e3o para pais): 58 itens e 4 fatores (Regula\u00e7\u00e3o Emocional, Hiperatividade/Impulsividade, Comportamento Adaptativo e Aten\u00e7\u00e3o). Os pais ou respons\u00e1veis respondem pelo link. O resultado traz escore bruto, percentil e classifica\u00e7\u00e3o por fator, com normas por sexo e faixa et\u00e1ria (2 a 17 anos). O paciente cadastrado \u00e9 a crian\u00e7a ou o adolescente.'] },
    vineland3: { aba: 'programasOcultos', nome: 'Vineland-3', idade: ['O Vineland-3 vale de 0 a 90 anos.'], oque: ['Vineland-3 \u2014 Escala de Comportamento Adaptativo. Avalia 3 dom\u00ednios: Comunica\u00e7\u00e3o, Habilidades da Vida Di\u00e1ria e Socializa\u00e7\u00e3o. \u00c9 uma entrevista semiestruturada, de 0 a 90 anos, aplicada por profissional treinado.'] }
  };
  // programa que vale quando o painel nao informa qual sub-aba esta ativa
  var PADRAO = { funcExec: 'tecfe', atencao: 'bae', memoria: 'trmv', percepcao: 'tref', linguagem: 'tflod', visuoconstrutivo: 'tetaylor', inteligencia: 'ideia', reabilitacao: 'reocupa', correcao: 'bvrt', programasOcultos: 'pfister' };
  var NOME_ABA = { funcExec: 'Fun\u00e7\u00f5es Executivas', atencao: 'Aten\u00e7\u00e3o', memoria: 'Mem\u00f3ria', percepcao: 'Percep\u00e7\u00e3o', linguagem: 'Linguagem', visuoconstrutivo: 'Visuoconstrutivo', inteligencia: 'Intelig\u00eancia e AH/SD' };

  // ---------- 3) montar o contexto atual: { nome, chips, qa, intro } ----------
  function junta(a) { return (a || []).filter(Boolean); }
  function G(frases) { return frases.map(function (f) { return L.tokens(f); }); }
  // artigo e verbo certos em portugues: "o TFLOD", "a BAE", "a Agenda"; testes se APLICAM, programas e ferramentas se USAM
  var ARTIGO = { bae: 'a', agenda: 'a', anamnese: 'a' };
  var USA = { agenda: 1, anamnese: 1, prontuario: 1, reocupa: 1, lermais: 1, prat: 1, smart: 1 };
  var COMO_COM_LINK = { anamnese: 1, lermais: 1 };      // so estas ferramentas enviam link ao paciente; nas outras, "como gero o link" e a resposta geral de gerar link
  function qaDeEntidade(e) {
    var n = e.nome, art = ARTIGO[e.id] || 'o', Art = art.toUpperCase(), qa = [];
    qa.push({ aspecto: true, chip: 'O que \u00e9 ' + art + ' ' + n + '?', g: ['serve', 'funciona', 'explica', 'significa', 'resumo'], campos: ['oque', 'extra'] });
    if (e.como) { qa.push({ aspecto: true, chip: (USA[e.id] ? 'Como uso ' : 'Como aplico ') + art + ' ' + n + '?', g: (USA[e.id] && !COMO_COM_LINK[e.id]) ? ['usar', 'uso', 'comecar', 'faco', 'passo'] : ['aplicar', 'usar', 'uso', 'comecar', 'faco', 'passo', 'link', 'enviar', 'mandar', 'gerar'], campos: ['como'] }); }
    if (e.preco) { qa.push({ aspecto: true, chip: 'Quanto custa ' + art + ' ' + n + '?', g: ['custa', 'preco', 'valor', 'gratis', 'credito', 'cobranca'], campos: ['preco'] }); }
    if (e.dur) { qa.push({ aspecto: true, chip: 'Quanto tempo leva ' + art + ' ' + n + '?', g: ['duracao', 'tempo', 'demora', 'minuto'], campos: ['dur'] }); }
    if (e.idade) { qa.push({ aspecto: true, chip: 'Para que idade \u00e9 ' + art + ' ' + n + '?', g: ['idade', 'faixa', 'crianca', 'idoso', 'adulto'], campos: ['idade'] }); }
    if (e.disp) { qa.push({ aspecto: true, chip: Art + ' ' + n + ' funciona no celular?', g: ['celular', 'tablet', 'computador', 'dispositivo', 'navegador'], campos: ['disp'] }); }
    return qa;
  }
  function qaDePrograma(p) {
    var qa = [{ chip: 'O que \u00e9 o ' + p.nome + '?', g: ['serve', 'funciona', 'explica', 'significa', 'resumo'], r: p.oque }];
    if (p.como) { qa.push({ aspecto: true, chip: 'Como uso o ' + p.nome + '?', g: ['aplicar', 'usar', 'uso', 'comecar', 'faco', 'passo'], r: p.como }); }
    if (p.idade) { qa.push({ aspecto: true, chip: 'Para que idade \u00e9 o ' + p.nome + '?', g: ['idade', 'faixa', 'crianca', 'idoso', 'adulto', 'ano'], r: p.idade }); }
    return qa;
  }
  // devolve o contexto resolvido (ou null)
  L.contextoDe = function (E) {
    if (!E || !E.aba) { return null; }
    var aba = E.aba, prog = String(E.programa || '').toLowerCase(), c = null, e = null, p = null;
    var A = ABAS[aba];
    if (!prog && PADRAO[aba]) { prog = PADRAO[aba]; }
    if (aba === 'funcExec' || aba === 'atencao' || aba === 'memoria' || aba === 'percepcao' || aba === 'linguagem' || aba === 'visuoconstrutivo' || aba === 'inteligencia' || aba === 'reabilitacao' || aba === 'correcao' || aba === 'programasOcultos') {
      e = ent(prog); p = PROGS[prog] || null;
      if (e) { c = { nome: e.nome, ent: e, qa: qaDeEntidade(e), aba: aba }; if (aba === 'reabilitacao' && A) { c.qa = c.qa.concat(A.qa || []); } }
      else if (p) { c = { nome: p.nome, qa: qaDePrograma(p), aba: aba }; }
      else if (A) { c = { nome: A.nome, qa: A.qa || [], intro: A.intro, aba: aba }; }
      if (c) { c.nomeAba = A ? A.nome : (NOME_ABA[aba] || aba); }
    } else if (A) {
      if (A.ent) { e = ent(A.ent); c = { nome: A.nome, ent: e, qa: (e ? qaDeEntidade(e) : []).concat(A.extra || []), aba: aba }; }
      else { c = { nome: A.nome, qa: A.qa || [], intro: A.intro, aba: aba }; }
      c.nomeAba = A.nome;
    }
    if (!c) { return null; }
    // "O que e" primeiro, depois as perguntas mais uteis; so 4 botoes
    c.chips = (A && A.chips) ? A.chips.slice() : c.qa.slice(0, 4).map(function (q) { return q.chip; });
    return c;
  };
  L.rotuloContexto = function (E) {
    var c = L.contextoDe(E); if (!c) { return ''; }
    return (c.nomeAba && c.nomeAba !== c.nome) ? (c.nomeAba + ' > ' + c.nome) : c.nome;
  };

  // ---------- 4) o painel diz onde a pessoa esta ----------
  L.definirContexto = function (E, ctx) {
    if (!ctx || !ctx.aba) { E.aba = null; E.programa = ''; L._ctxE = null; return; }
    E.aba = String(ctx.aba); E.programa = String(ctx.programa || ''); L._ctxE = E;
  };
  function chave(E) { return E.aba ? (E.aba + '|' + String(E.programa || '').toLowerCase()) : ''; }

  // botoes padrao do painel passam a ser os da aba atual
  var chipsBase = L.chipsPadrao;
  L.chipsPadrao = function (modo) {
    if (modo === 'painel' && L._ctxE) { var c = L.contextoDe(L._ctxE); if (c && c.chips.length) { return c.chips.slice(); } }
    return chipsBase.apply(this, arguments);
  };
  // abertura: diz onde a pessoa esta
  var aberturaBase = L.abertura;
  L.abertura = function (E, modo, opcoes) {
    var r = aberturaBase.apply(this, arguments);
    if (modo === 'painel' && E.aba) {
      var rot = L.rotuloContexto(E);
      if (rot && r.msgs && r.msgs.length) {
        r.msgs[0] = r.msgs[0].replace('Precisa de ajuda com o painel?', 'Vi que voc\u00ea est\u00e1 em ' + rot + '. Quer ajuda com isso?');
        var c = L.contextoDe(E); if (c) { r.chips = c.chips.slice(); }
        E._ctxAnunciado = chave(E);
      }
    }
    return r;
  };
  // se a pessoa mudou de aba/programa com o conversa aberta: uma frase curta, com os botoes novos
  L.avisoContexto = function (E, ctx) {
    var antes = chave(E);
    L.definirContexto(E, ctx);
    var agora = chave(E);
    if (!agora || agora === E._ctxAnunciado) { return null; }
    E._ctxAnunciado = agora;
    if (!antes && !E._ctxAnunciadoAlgumaVez) { E._ctxAnunciadoAlgumaVez = true; }
    var c = L.contextoDe(E); if (!c) { return null; }
    return resp(['Vi que voc\u00ea foi para ' + L.rotuloContexto(E) + '. Quer ajuda por aqui? ' + '\ud83d\ude0a'], c.chips.slice(), { id: 'ctx-mudou', neutro: true });
  };

  // ---------- 5) responder no contexto ----------
  function dizer(c, q, E, set, modo) {
    var msgs;
    if (q.r) { msgs = q.r.slice(); }
    else if (q.intent) {
      var it = L.porId(q.intent), a = it && it.a;
      if (typeof a === 'function') { try { a = a(E, modo); } catch (x) { a = null; } }
      if (a && !Array.isArray(a)) { a = a[modo] || a._ || null; }
      msgs = a ? a.slice() : null;
    } else if (q.campos) {
      msgs = q.campos.map(function (k) { return c.ent && c.ent[k]; }).filter(Boolean);
    }
    if (!msgs || !msgs.length) { return null; }
    if (c.ent) { E.ent = c.ent; E.ultimoTipo = 'ent'; E.ultimo = { id: 'ent:' + c.ent.id, s: c.ent.simples || c.ent.oque }; }
    E.falhas = 0; E.ofereceu = null;
    var chips = c.chips.filter(function (x) { return x !== q.chip; });
    return resp(msgs, chips.slice(0, 4), { id: 'ctx' });
  }
  function introDe(c) {
    if (c.intro) { return c.intro; }
    if (c.ent) { return [c.ent.oque, c.ent.extra].filter(Boolean); }
    var q = c.qa[0]; return q && q.r ? q.r : null;
  }
  // palavras que NAO mudam o assunto de uma pergunta (no conceito canonico da base). Se a frase tiver outra palavra alem destas, nao e pergunta so de aspecto.
  // quantos assuntos da base usam cada palavra (no conceito canonico): palavra RARA = quase so existe aqui, entao e seguro o contexto responder
  var FREQ = null;
  function freqChaves() {
    if (!FREQ) {
      FREQ = {};
      L.intents.forEach(function (it) { var v = {}; (it.k || []).forEach(function (f) { L.tokens(f).forEach(function (tk) { v[tk] = 1; }); }); Object.keys(v).forEach(function (tk) { FREQ[tk] = (FREQ[tk] || 0) + 1; }); });
    }
    return FREQ;
  }
  var FILLER = null;
  function fillerSet() {
    if (!FILLER) {
      FILLER = {};
      ['como', 'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'para', 'pra', 'por', 'que', 'e', 'eu', 'me', 'meu', 'minha', 'posso', 'pode', 'podem', 'isso', 'isto', 'aqui', 'esse', 'essa', 'este', 'esta', 'nesse', 'nessa', 'neste', 'nesta', 'aba', 'tela', 'programa', 'teste', 'pagina', 'qual', 'quais', 'quanto', 'quantos', 'quanta', 'favor', 'voce', 'tem', 'ter', 'ser', 'sao', 'fica', 'ficar', 'ele', 'ela', 'funciona', 'roda', 'rodar', 'paciente', 'pacientes', 'responsavel']
        .forEach(function (w) { L.tokens(w).forEach(function (tk) { FILLER[tk] = 1; }); });
    }
    return FILLER;
  }
  // problemas de cobranca/credito: sempre resposta do motor (alem dos assuntos delicados, que o proprio motor ja marca com prioridade >= 40)
  var PROTEGIDOS = { credito_sumiu: 1, cobranca_dobro: 1, reembolso: 1, credito_demora: 1, credito_abandono: 1, nota_fiscal: 1, pagamento_formas: 1, credito_comprar: 1, bonus_bloqueado: 1, encerrar_conta: 1, direitos_titular: 1, privacidade: 1 };
  var COMPRA = /\b(comprar|compro|compra|comprei|pagamento|pagar|pix|cartao|reembolso|nota fiscal|boleto|estorno)\b/;
  var VAGO_INICIO = /^(como|o que|que|para que|pra que|qual|quais|me explica|explica|explique|ajuda|me ajuda|ajude|duvida|nao entendi|nao sei|por onde|isso|e isso)/;
  var DEITICO = /(^| )(isso|isto|aqui|aba|tela|programa|teste|pagina|escala|essa|esse|esta|este|nessa|nesse|nesta|neste)( |$)/;
  var AGENDA_PAINEL = /(^| )(agend\w*|marc\w*)( |$)/;

  L.tratarContexto = function (texto, n, E, modo) {
    if (modo !== 'painel' || !E.aba) { return null; }
    var c = L.contextoDe(E); if (!c) { return null; }
    var palavras = n.split(' ').length, i, q;
    // 1) clicou num botao da aba (texto igual ao botao)
    for (i = 0; i < c.qa.length; i++) { if (norm(c.qa[i].chip) === n) { var r1 = dizer(c, c.qa[i], E, null, modo); if (r1) { return r1; } } }
    // 2) no painel, "agendar/marcar consulta" e a Agenda do profissional (nunca o Doctoralia do Sergio)
    if (palavras <= 12 && AGENDA_PAINEL.test(n) && /consulta|paciente|horario|atendimento/.test(n) && !/sergio|doctoralia|voces|voce atende/.test(n)) {
      var cAg = L.contextoDe({ aba: 'agenda', programa: '' });
      if (cAg) { var qAg = cAg.qa.filter(function (x) { return /marco uma consulta/.test(norm(x.chip)); })[0]; var rAg = qAg && dizer(cAg, qAg, E, null, modo); if (rAg) { rAg.chips = cAg.chips.filter(function (x) { return x !== qAg.chip; }).slice(0, 4); return rAg; } }
    }
    if (palavras > 18) { return null; }
    var longa = palavras > 12;       // frases de 13 a 18 palavras: so contam as perguntas ESPECIFICAS do programa (nunca as de aspecto nem a vaga)
    var toks = L.tokens(texto), set = L._f.mkSet(toks);
    // conversa delicada (emocional, ameaca, clinico, raiva, ofensa) ou problema de cobranca/privacidade: SEMPRE o motor, nunca o contexto
    var itD = L._f.melhorIntencao(set, 'painel', E), cl = L.clima(texto, set);
    if ((itD && ((itD.p || 0) >= 40 || PROTEGIDOS[itD.id])) || cl.raiva || cl.insulto || cl.xingou) { return null; }
    // 3) a pessoa citou OUTRO teste/escala/programa: o motor normal responde sobre ele
    var outro = L._f.acharEntidade(set), esc = L._f.acharEscala(set);
    if (esc || (outro && (!c.ent || outro.id !== c.ent.id))) { return null; }
    if (COMPRA.test(n)) { return null; }                                   // comprar creditos/pagamento: respostas gerais do motor
    // 4) pergunta especifica da aba/programa (pelas palavras-chave de cada pergunta)
    var melhor = null, bs = 0, sEng = 0, fill = fillerSet(), nomeTok = {};
    var itE = L._f.melhorIntencao(set, 'painel', E); if (itE && itE._k) { sEng = L.casa(set, itE._k) + (itE.p || 0); }
    [c.nome, c.nomeAba].concat((c.ent && c.ent.nomes) || []).forEach(function (nm) { L.tokens(nm || '').forEach(function (tk) { nomeTok[tk] = 1; }); });
    for (i = 0; i < c.qa.length; i++) {
      q = c.qa[i]; if (!q._k) { q._k = G(q.g || []); }
      var s = L.casa(set, q._k); if (!s) { continue; }
      if (q.aspecto) {
        if (longa) { continue; }
        // pergunta so de aspecto ("quanto custa?", "como uso?"): o contexto manda, mas so se NAO houver outra palavra de assunto ("como gerar o link" vai para o motor)
        var gt = {}; q._k.forEach(function (f) { f.forEach(function (tk) { gt[tk] = 1; }); });
        var puro = toks.every(function (tk) { return fill[tk] || gt[tk] || nomeTok[tk]; });
        if (!puro) { continue; }
        s += 100;
      } else {
        // pergunta especifica da aba: disputa com o motor e leva uma pequena vantagem (perde se o motor reconhece um assunto bem mais forte)
        // vale se casar com 2 palavras da pergunta OU com 1 palavra rara na base (ex.: "lembrete", "csv", "logo"); uma palavra comum (ex.: "resultado") deixa o motor decidir
        var fr = freqChaves(), casadas = 0, rara = false;
        q._k.forEach(function (f) { if (L.casa(set, [f])) { casadas++; if ((fr[f[0]] || 0) <= 4) { rara = true; } } });
        if (casadas < 2 && !rara && !q.forte) { continue; }       // forte: uma frase completa ja basta ("como funciona uma sessao")
        s += q.forte ? 130 : 30;      // forte: pergunta sobre a tarefa do paciente, que vence a de aspecto ("como aplico")
      }
      if (s > bs) { bs = s; melhor = q; }
    }
    if (melhor) { var r4 = dizer(c, melhor, E, set, modo); if (r4) { return r4; } }
    // 5) pergunta vaga ("como funciona isso aqui?", "me ajuda", "nao entendi"): explica a aba/programa atual
    if (!longa && VAGO_INICIO.test(n) && (DEITICO.test(n) || palavras <= 3)) {
      var intro = introDe(c);
      if (intro) {
        if (c.ent) { E.ent = c.ent; E.ultimoTipo = 'ent'; E.ultimo = { id: 'ent:' + c.ent.id, s: c.ent.simples || c.ent.oque }; }
        E.falhas = 0; E.ofereceu = null;
        return resp(intro.slice(), c.chips.slice(), { id: 'ctx' });
      }
    }
    return null;
  };
})(typeof window !== 'undefined' ? window : global);

/* kb-auto-aplicar.js */
// ============================================================
// LAUANA - APLICA OS DADOS LIDOS DO SITE (arquivo kb-auto.js, gerado)
// Regra: o que foi escrito a mao (descricoes) NUNCA e sobrescrito.
// O sincronizador so: (1) acrescenta o que e novo, (2) atualiza precos,
// (3) atualiza a lista de novidades. Tudo marcado com auto:true.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;

  function quemDe(faixa) {
    var f = String(faixa || '').replace(/\(admin\)/i, '').trim(), m;
    if ((m = f.match(/^(\d+)\s*\+$/))) { return 'a partir de ' + m[1] + ' anos'; }
    if ((m = f.match(/^(\d+)\s*[-a]\s*(\d+)\s*(anos|meses)/i))) { return 'de ' + m[1] + ' a ' + m[2] + ' ' + m[3].toLowerCase(); }
    return f ? ('na faixa ' + f) : 'conforme indicado no painel';
  }
  function dinheiro(n) { return 'R$ ' + n; }

  // texto de preco a partir dos numeros lidos no painel
  function textoPreco(p) {
    var t = 'Ao se cadastrar voc\u00ea ganha ' + p.gratis + ' cr\u00e9dito' + (p.gratis === 1 ? '' : 's') + ' gr\u00e1tis. Depois: ' + dinheiro(p.avulso) + ' a aplica\u00e7\u00e3o avulsa';
    (p.pacotes || []).forEach(function (k) {
      t += (k.cada != null) ? ', ' + dinheiro(k.cada) + ' cada no pacote de ' + k.qtd + ' (' + dinheiro(k.cada * k.qtd) + ')'
                            : ', ' + k.qtd + ' cr\u00e9ditos por ' + dinheiro(k.total);
    });
    return t + '.';
  }
  L.textoPreco = textoPreco;

  L.aplicarAuto = function (d) {
    L.autoDados = d;
    var i, j, e, s, id;
    // 1) escalas novas (que existem no painel e a Lauana ainda nao conhecia)
    (d.escalasNovas || []).forEach(function (n) {
      var nomes = [n.sigla.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()];
      if (nomes[0].indexOf(' ') > 0) { nomes.push(nomes[0].replace(/ /g, '')); }
      L.escalas.push({ id: 'auto-' + nomes[0].replace(/ /g, ''), sigla: n.sigla, nome: n.nome, nomes: nomes, quem: quemDe(n.faixa), desc: n.rascunho || '(Ainda n\u00e3o tenho a descri\u00e7\u00e3o completa desta escala.)', auto: true });
    });
    // 2) testes novos: resposta honesta enquanto ninguem escreve a descricao
    (d.testesNovos || []).forEach(function (n) {
      var nome = n.sigla, nao = 'Ainda n\u00e3o tenho essa informa\u00e7\u00e3o sobre o ' + nome + ', e prefiro n\u00e3o chutar. Veja no painel (aba dele, bot\u00e3o Manual T\u00e9cnico) ou pergunte ao S\u00e9rgio: ' + W + '.';
      L.ents.push({ id: 'auto-' + nome.toLowerCase().replace(/[^a-z0-9]/g, ''), nome: nome, nomes: [nome.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()],
        oque: 'O ' + nome + ' \u00e9 um instrumento que apareceu h\u00e1 pouco no painel. ' + nao, extra: null, idade: nao, dur: nao, disp: nao, preco: nao, como: nao, auto: true });
    });
    // 3) precos lidos do painel
    (d.precos || []).forEach(function (p) {
      for (i = 0; i < L.ents.length; i++) {
        e = L.ents[i];
        if (L.norm(e.nome) === L.norm(p.sigla)) { e.preco = p.texto || textoPreco(p); p.nomeKB = e.nome; break; }
      }
    });
    // resumo geral de precos (2o balao do assunto "precos") sempre bate com o painel
    var it = L.porId('precos');
    if (it && (d.precos || []).length) {
      var partes = d.precos.filter(function (p) { return p.nomeKB; }).map(function (p) { return p.nomeKB + ' ' + dinheiro(p.avulso); });
      it.a[1] = 'Valor de cada aplica\u00e7\u00e3o avulsa hoje: ' + partes.join('; ') + '. Pacotes baixam o valor de cada aplica\u00e7\u00e3o (pergunte "quanto custa o ..." de um teste para ver os pacotes).';
    }
    // 4) novidades
    var nov = d.novidades || [];
    L.I('novidades', ['novidade', 'atualizacao', 'ha novo', 'lancamento', 'novo teste', 'ultimas novidade', 'o que mudar', 'o que ter novo', 'mudar site', 'tem novo'],
      function () {
        var m = ['As novidades mais recentes do site:'];
        nov.slice(0, 4).forEach(function (n) { m.push(n.data + ' \u2022 ' + n.titulo); });
        m.push('A lista completa fica na se\u00e7\u00e3o "\u00daltimas atualiza\u00e7\u00f5es" da p\u00e1gina inicial.');
        return m;
      }, { c: ['Como funciona o site?', 'Quais testes existem?'], p: 6 });
  };
})(typeof window !== 'undefined' ? window : global);

/* kb-auto.js */
// GERADO por sincronizar.js em 2026-11-27T00:43:57.682Z a partir de d:/Planilhas/site. NAO EDITE A MAO.
(function (g) { g.LAU.aplicarAuto({"escalasNovas":[],"testesNovos":[],"precos":[{"sigla":"TECFE","gratis":1,"avulso":20,"pacotes":[{"qtd":10,"cada":15},{"qtd":50,"cada":10}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 20 a aplica\u00e7\u00e3o avulsa, R$ 15 cada no pacote de 10 (R$ 150), R$ 10 cada no pacote de 50 (R$ 500)."},{"sigla":"BAE","gratis":5,"avulso":25,"pacotes":[{"qtd":2,"total":50},{"qtd":8,"total":200}],"texto":"Ao se cadastrar voc\u00ea ganha 5 cr\u00e9ditos gr\u00e1tis. Depois: R$ 25 a aplica\u00e7\u00e3o avulsa, 2 cr\u00e9ditos por R$ 50, 8 cr\u00e9ditos por R$ 200."},{"sigla":"Prontuario","gratis":1,"avulso":5,"pacotes":[{"qtd":10,"cada":4},{"qtd":50,"cada":3}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40), R$ 3 cada no pacote de 50 (R$ 150)."},{"sigla":"TRMV","gratis":1,"avulso":5,"pacotes":[{"qtd":10,"cada":4},{"qtd":50,"cada":3}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40), R$ 3 cada no pacote de 50 (R$ 150)."},{"sigla":"TAAV","gratis":1,"avulso":5,"pacotes":[{"qtd":10,"cada":4},{"qtd":50,"cada":3}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40), R$ 3 cada no pacote de 50 (R$ 150)."},{"sigla":"TREF","gratis":1,"avulso":5,"pacotes":[{"qtd":10,"cada":4},{"qtd":50,"cada":3}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40), R$ 3 cada no pacote de 50 (R$ 150)."},{"sigla":"TFLOD","gratis":1,"avulso":5,"pacotes":[{"qtd":10,"cada":4},{"qtd":50,"cada":3}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 5 a aplica\u00e7\u00e3o avulsa, R$ 4 cada no pacote de 10 (R$ 40), R$ 3 cada no pacote de 50 (R$ 150)."},{"sigla":"IDEIA","gratis":1,"avulso":10,"pacotes":[{"qtd":10,"cada":8}],"texto":"Ao se cadastrar voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis. Depois: R$ 10 a aplica\u00e7\u00e3o avulsa, R$ 8 cada no pacote de 10 (R$ 80)."}],"novidades":[{"data":"22/11","titulo":"BAFC \u2014 Bateria de Avalia\u00e7\u00e3o do Funcionamento Cognitivo"},{"data":"25/10","titulo":"TPV-SET \u2014 Teste de Percep\u00e7\u00e3o Visual (adapta\u00e7\u00e3o do jogo SET)"},{"data":"23/10","titulo":"TREF 2.0 \u2014 Novo motor de escaneamento e laudo ampliado"},{"data":"30/09","titulo":"BRPI \u2014 Bateria de Rastreio do Processamento da Intelig\u00eancia"},{"data":"29/09","titulo":"TFLOD \u2014 Novo fluxo lProcessar no painelr (fim das falhas na tela do paciente)"},{"data":"18/09","titulo":"TFLOD e IDEIA \u2014 Capta\u00e7\u00e3o de \u00e1udio mais robusta"},{"data":"18/09","titulo":"Escalas \u2014 Gera\u00e7\u00e3o de PDF refor\u00e7ada"},{"data":"26/08","titulo":"IDEIA \u2014 Instrumento de Diverg\u00eancia e Elabora\u00e7\u00e3o de Ideias Alternativas"}]}); })(typeof window !== 'undefined' ? window : global);

/* kb-curiosidades.js */
// ============================================================
// LAUANA - CURIOSIDADES, PAGAMENTO E PRECOS (carregado POR ULTIMO, depois da sincronizacao automatica de precos)
// Tudo aqui vem do que o proprio Sergio disse (27/11/2026). Onde ele nao disse, a Lauana nao inventa.
//   - Pagamento: Mercado Pago; "acho que nao aceita cartoes internacionais" (por isso ela fala com cautela).
//   - TTE, Corsi e TETaylor: sem preco porque sao programas proprietarios, disponiveis sem cobranca.
//   - O site foi construido para facilitar a testagem; so sao cobrados os programas que o Sergio construiu
//     e que tem ou tiveram custo para ele.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  function ent(id) { for (var i = 0; i < L.ents.length; i++) { if (L.ents[i].id === id) { return L.ents[i]; } } return null; }
  function intent(id) { return L.porId(id); }
  function I(id, k, a, o) {
    o = o || {};
    var it = { id: id, k: k, a: a, p: o.p || 0 };
    if (o.m) { it.m = o.m; } if (o.c) { it.c = o.c; } if (o.s) { it.s = o.s; }
    L.intents.push(it);
  }

  // ---------- 1) pagamento e cartao internacional ----------
  var pf = intent('pagamento_formas');
  if (pf) {
    ['cartao internacional', 'cartao estrangeiro', 'cartao exterior', 'pagar exterior', 'pagar fora brasil', 'mercado pago'].forEach(function (k) { pf.k.push(k); });
    pf.a = ['O pagamento \u00e9 feito pelo Mercado Pago, num link que abre quando voc\u00ea escolhe o plano e clica em "Comprar". As formas dispon\u00edveis aparecem l\u00e1.',
            'Cart\u00e3o internacional: pelo que o S\u00e9rgio sabe, o Mercado Pago n\u00e3o aceita cart\u00f5es internacionais, ent\u00e3o para quem est\u00e1 fora do Brasil o pagamento pode n\u00e3o funcionar. Para confirmar, ou para saber de uma forma espec\u00edfica (como Pix ou parcelamento), pergunte ao S\u00e9rgio: ' + W + '.'];
  }
  // para visitantes de outros idiomas (en/es tem texto proprio; os demais sao traduzidos a partir do ingles)
  if (L.i18n && L.i18n.en && L.i18n.en.moeda) {
    L.i18n.en.moeda = L.i18n.en.moeda.replace(/\s*I also do not know[\s\S]*$/, '') + ' Payments are made through Mercado Pago, which, as far as S\u00e9rgio knows, does not accept international cards, so paying from abroad may not work. S\u00e9rgio can confirm on WhatsApp ' + W + '.';
  }
  if (L.i18n && L.i18n.es && L.i18n.es.moeda) {
    L.i18n.es.moeda = L.i18n.es.moeda.replace(/\s*Tampoco s[\s\S]*$/, '') + ' Los pagos se hacen con Mercado Pago que, hasta donde S\u00e9rgio sabe, no acepta tarjetas internacionales, por lo que pagar desde el extranjero puede no funcionar. S\u00e9rgio puede confirmarlo por WhatsApp ' + W + '.';
  }

  // ---------- 2) programas sem cobranca ----------
  var COBRA = 'O site foi feito para facilitar a testagem. S\u00f3 s\u00e3o cobrados os programas que o S\u00e9rgio construiu e que t\u00eam ou tiveram custo para ele.';
  [['tte', 'TTE'], ['corsi', 'Corsi'], ['tetaylor', 'TETaylor']].forEach(function (p) {
    var e = ent(p[0]); if (e) { e.preco = 'O ' + p[1] + ' est\u00e1 dispon\u00edvel sem cobran\u00e7a: \u00e9 um programa propriet\u00e1rio. ' + COBRA; }
  });
  var simp = ent('tetaylorsimp');
  // jeitos naturais de dizer a versao simplificada (antes caiam no TETaylor normal)
  if (simp && simp.nomes) { ['tetaylor simplificado', 'tetaylor simplificada', 'taylor simplificado', 'versao simplificada tetaylor', 'versao simplificada taylor', 'tetaylor simp'].forEach(function (n) { if (simp.nomes.indexOf(n) < 0) { simp.nomes.push(n); } }); }
  if (simp) { simp.especializa = 'tetaylor'; simp.preco = 'A vers\u00e3o simplificada do TETaylor est\u00e1 dispon\u00edvel sem cobran\u00e7a. ' + COBRA; }
  var pr = intent('precos');
  if (pr && Array.isArray(pr.a) && pr.a.length) {
    pr.a[0] = pr.a[0].replace('as mais de 50 escalas (com relat\u00f3rio em PDF).', 'as mais de 50 escalas (com relat\u00f3rio em PDF), al\u00e9m do TTE, do Corsi e do TETaylor (com a vers\u00e3o simplificada).');
  }

  // ---------- 3) por que cobra / por que e barato / qual o objetivo ----------
  I('objetivo_preco', ['por que cobrar', 'por que cobra', 'por que pagar', 'por que barato', 'por que tao barato', 'por que gratis', 'por que credito', 'por que so credito', 'por que nao assinatura', 'por que nao mensalidade',
      'por que voces cobrar', 'motivo cobrar', 'objetivo site', 'objetivo do site', 'qual objetivo', 'por que site existir', 'por que criar site', 'por que fazer site', 'por que sergio criar'],
    ['O site foi constru\u00eddo para facilitar a testagem, e por isso o painel, o cadastro de pacientes, a agenda e as escalas s\u00e3o gratuitos.',
     'S\u00f3 s\u00e3o cobrados os programas que o S\u00e9rgio construiu e que t\u00eam ou tiveram custo para ele. Os programas propriet\u00e1rios, como o TTE, o Corsi e o TETaylor, ficam dispon\u00edveis sem cobran\u00e7a.'],
    { p: 12, m: ['home', 'painel'], c: ['Quanto custa?', 'Falar com o S\u00e9rgio'] });

  // ---------- 4) o site tem objetivo de lucro? (so responde se perguntarem; palavras do Sergio, 27/11/2026) ----------
  I('lucro_site', ['objetivo lucro', 'objetivo lucrativo', 'site lucrativo', 'site e lucrativo', 'fins lucrativos', 'tem fins lucrativos', 'ganhar dinheiro', 'ganha dinheiro', 'lucrar', 'visa lucro', 'e para lucro', 'quer lucro', 'lucro do site', 'sergio ganha'],
    ['O site n\u00e3o tem o objetivo de ser lucrativo. Ele foi feito para facilitar a testagem.',
     'S\u00f3 s\u00e3o cobrados os programas que o S\u00e9rgio construiu e que t\u00eam ou tiveram custo para ele.'],
    { p: 18, m: ['home', 'painel'], c: ['Quanto custa?', 'Falar com o S\u00e9rgio'] });

  // ---------- 5) como surgiu o site (so responde se perguntarem; contado pelo Sergio, 27/11/2026) ----------
  I('origem_site', ['como surgiu', 'como surgiu site', 'como surgiu ideia', 'como nasceu', 'como nasceu site', 'como comecou', 'como comecou site', 'origem site', 'origem do site', 'historia do site', 'historia site', 'como foi criado', 'como foi criado site', 'como veio ideia', 'de onde veio site', 'de onde surgiu', 'por que surgiu', 'como tudo comecou'],
    ['O site come\u00e7ou quando o S\u00e9rgio quis transformar as escalas de papel em planilhas, para a corre\u00e7\u00e3o e o resultado sa\u00edrem de forma autom\u00e1tica e mais r\u00e1pida.',
     'Depois veio a ideia de fazer avalia\u00e7\u00f5es online, em forma de rastreio. Um colega gostou da ideia e pediu para fazer o mesmo com as escalas dele. Da\u00ed surgiu a ideia de reunir v\u00e1rios testes num s\u00f3 lugar, e assim nasceu este centro de testagem.'],
    { p: 14, m: ['home', 'painel'], c: ['Quem \u00e9 o S\u00e9rgio?', 'Qual o objetivo do site?'] });

  // ---------- 6) quem e o Sergio (atualiza a resposta; dados da pagina inicial + o que ele disse) ----------
  var qs = intent('quem_sergio');
  if (qs) {
    ['quem e sergio', 'quem e o sergio', 'quem administra', 'quem monitora', 'quem cuida site', 'quem cuida do site', 'quem mantem site', 'sobre sergio', 'sobre o sergio', 'quem e o dono'].forEach(function (k) { if (qs.k.indexOf(k) < 0) { qs.k.push(k); } });
    qs.a = ['O S\u00e9rgio Teixeira Monte \u00e9 psic\u00f3logo e neuropsic\u00f3logo (CRP 14/05739-9), de Campo Grande (MS). Ele \u00e9 quem administra e monitora o site.',
            'Ele gosta de Tecnologia da Informa\u00e7\u00e3o como hobby e desenvolve ferramentas digitais para tornar a pr\u00e1tica cl\u00ednica mais acess\u00edvel.'];
  }
})(typeof window !== 'undefined' ? window : global);

/* kb-assuntos.js */
// ============================================================
// LAUANA - RESPOSTAS "CRUZADAS" POR ASSUNTO (carregado depois de kb-curiosidades.js)
// Quando alguem pergunta por um assunto ("tem algo de funcoes executivas?"), ela cruza:
//   programas (resumo + idade + preco/creditos + aba do painel + link do manual) e escalas relacionadas.
// Os dados vem das fichas que ela ja tem (L.ents e L.escalas); nada e digitado de novo.
// ABAS: confirmadas no painel (site/online/index.html), 27/11/2026.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var BASE = 'https://setmonte.github.io/';
  var CATALOGO = BASE + 'escalas/';
  var ABA = { tecfe: 'Fun\u00e7\u00f5es Executivas', tte: 'Fun\u00e7\u00f5es Executivas', bae: 'Aten\u00e7\u00e3o', trmv: 'Mem\u00f3ria', taav: 'Mem\u00f3ria', corsi: 'Mem\u00f3ria',
              tref: 'Percep\u00e7\u00e3o', tpvset: 'Percep\u00e7\u00e3o', tflod: 'Linguagem', tetaylor: 'Visuoconstrutivo', tetaylorsimp: 'Visuoconstrutivo',
              ideia: 'Intelig\u00eancia e AH/SD', brpi: 'Intelig\u00eancia e AH/SD', bafc: 'Intelig\u00eancia e AH/SD' };
  // manuais que existem de verdade em site/online/
  var MANUAL = { bae: 1, bafc: 1, brpi: 1, corsi: 1, ideia: 1, tecfe: 1, tetaylor: 1, tetaylorsimp: 1, tflod: 1, tpvset: 1, tref: 1, trmv: 1, taav: 1, tte: 1 };

  function ent(id) { for (var i = 0; i < L.ents.length; i++) { if (L.ents[i].id === id) { return L.ents[i]; } } return null; }
  function esc(id) { for (var i = 0; i < L.escalas.length; i++) { if (L.escalas[i].id === id) { return L.escalas[i]; } } return null; }
  // primeira frase de um texto (corta no primeiro ponto final seguido de espaco)
  function primeira(t) { t = String(t || ''); var m = /^[\s\S]*?[.!?](?=\s|$)/.exec(t); return (m ? m[0] : t).trim(); }
  function fim(t) { t = String(t || '').trim(); return t && !/[.!?]$/.test(t) ? t + '.' : t; }

  function balaoPrograma(id) {
    var e = ent(id); if (!e) { return null; }
    var partes = [];
    var resumo = fim(primeira(e.oque));
    // se a 1a frase nao diz o que o programa mede/avalia, acrescenta a frase da ficha que diz ("Mede ...", "Avalia ...")
    if (!/\b(mede|avalia|rastreio|observa)\b/i.test(resumo)) {
      var fr = String(e.oque || '').match(/[^.!?]+[.!?]/g) || [], j;
      for (j = 1; j < fr.length; j++) { if (/^\s*(Mede|Avalia|Observa)\b/.test(fr[j])) { resumo += ' ' + fr[j].trim(); break; } }
    }
    partes.push(e.nome + (ABA[id] ? ' (aba ' + ABA[id] + ' do painel)' : '') + ': ' + resumo);
    if (e.idade) { partes.push(fim(e.idade)); }
    if (e.preco) { partes.push(fim(e.preco)); }
    if (MANUAL[id]) { partes.push('Mais informa\u00e7\u00f5es no manual: ' + BASE + 'online/manual-' + id + '.html'); }
    return partes.join(' ');
  }
  function balaoEscalas(ids) {
    var itens = [];
    ids.forEach(function (id) { var s = esc(id); if (s) { itens.push(s.sigla + ' (' + s.quem + ')'); } });
    if (!itens.length) { return null; }
    return 'Na parte de Escalas do site, todas gratuitas, temos: ' + itens.join('; ') + '. Veja o cat\u00e1logo: ' + CATALOGO;
  }

  // monta a resposta de um assunto; devolve { msgs, chips } ou null (a resposta antiga continua valendo)
  L.montarTema = function (t, modo) {
    var msgs = [], i, b;
    var progs = (t.progs || []).filter(function (id) { return !!ent(id); });
    var nProg = progs.length;
    if (nProg) {
      msgs.push(t.intro || ('Temos sim! Para ' + t.titulo + ', ' + (nProg === 1 ? 'temos um programa' : 'temos ' + nProg + ' programas') + ':'));
      for (i = 0; i < nProg; i++) { b = balaoPrograma(progs[i]); if (b) { msgs.push(b); } }
    } else {
      msgs.push(t.intro || ('Para ' + t.titulo + ' temos escalas de rastreio:'));
    }
    b = balaoEscalas(t.escs || []); if (b) { msgs.push(b); }
    if (t.extra) { msgs.push(t.extra); }
    msgs.push(t.nota || 'Quem escolhe o instrumento mais adequado \u00e9 o profissional, de acordo com o caso. Quer saber como aplicar?');
    var chips = ['Como gerar o link?'];
    if (nProg && progs[0]) { chips.push('Quanto custa o ' + ent(progs[0]).nome + '?'); }
    return { msgs: msgs, chips: chips };
  };

  // liga cada assunto as suas fichas (programas e escalas)
  function liga(id, dados) {
    for (var i = 0; i < L.temas.length; i++) {
      if (L.temas[i].id === id) { for (var k in dados) { if (dados.hasOwnProperty(k)) { L.temas[i][k] = dados[k]; } } return L.temas[i]; }
    }
    return null;
  }
  var NOTA_QI = 'Importante: n\u00e3o s\u00e3o testes de QI cl\u00e1ssicos (como as escalas Wechsler) e n\u00e3o os substituem. S\u00e3o instrumentos de rastreio, em fase de coleta de normas. Quem escolhe o instrumento \u00e9 o profissional.';

  var te = liga('executivas', { progs: ['tecfe', 'tte'], escs: ['brief2'] });
  if (te && te.nomes) { ['funcao executiva', 'flexibilidade mental', 'planejamento'].forEach(function (n) { if (te.nomes.indexOf(n) < 0) { te.nomes.push(n); } }); }
  liga('atencao', { progs: ['bae', 'tte', 'tpvset'], escs: ['asrs18', 'snap4', 'conners'], extra: 'H\u00e1 tamb\u00e9m o programa de treino PRAt, para reabilita\u00e7\u00e3o da aten\u00e7\u00e3o. Para saber sobre ele, fale com o S\u00e9rgio: ' + W + '.' });
  liga('memoria', { progs: ['trmv', 'taav', 'corsi', 'tetaylor'], extra: 'Tamb\u00e9m h\u00e1 a \u00e1rea de Mem\u00f3ria Operacional da BAFC, na aba Intelig\u00eancia e AH/SD.' });
  liga('leitura', { progs: ['tflod'], escs: ['dislexia'], extra: 'H\u00e1 tamb\u00e9m o programa de treino LERMAIS, para leitura em voz alta. Para saber sobre ele, fale com o S\u00e9rgio: ' + W + '.' });
  liga('criatividade', { progs: ['ideia'] });
  liga('percepcao', { progs: ['tpvset', 'tref'] });
  liga('superdotacao', { progs: ['ideia'], escs: ['qiiahsd', 'renzulli', 'sobre', 'teaah'] });
  liga('aprendizagem', { progs: ['tflod'], escs: ['dislexia', 'dizcalc'] });
  var tq = liga('qi', { progs: ['brpi', 'bafc', 'ideia'], escs: ['tdi'], nota: NOTA_QI,
    intro: 'Temos sim! Na aba Intelig\u00eancia e AH/SD do painel h\u00e1 tr\u00eas programas de rastreio:' });
  if (tq && tq.nomes) { ['inteligente', 'capacidade intelectual', 'deficiencia intelectual', 'desenvolvimento intelectual', 'tdi'].forEach(function (n) { if (tq.nomes.indexOf(n) < 0) { tq.nomes.push(n); } }); }
  // temas que so tem escalas: continuam com a lista de antes, e ganham o link do catalogo
  ['tdah', 'autismo', 'ansiedade', 'depressao', 'estresse', 'toc', 'bipolar', 'personalidade', 'sono', 'alcool', 'casais', 'sexual', 'infantil', 'trabalho'].forEach(function (id) {
    for (var i = 0; i < L.temas.length; i++) {
      if (L.temas[i].id === id && L.temas[i].lista.indexOf('cat\u00e1logo') < 0) { L.temas[i].lista += '. Todas s\u00e3o gratuitas e est\u00e3o no cat\u00e1logo de escalas: ' + CATALOGO; }
    }
  });

  // ---------- correcoes gerais do motor (achadas ao testar programa por programa, 27/11/2026) ----------
  // 1) "evolucao" nao pode virar "devolucao" (chamava a resposta de reembolso): palavras parecidas demais so casam exatas
  L.semFuzzy.devolucao = 1;
  // 2) "das" e uma palavra comum ("nenhuma das respostas", "das letras"): a escala DAS so e reconhecida com mais contexto
  (function () {
    var d = esc('das');
    if (d) { d.nomes = ['escala das', 'das casal', 'das casais', 'teste das', 'ajustamento de casais', 'ajustamento conjugal', 'das ajustamento']; delete d._k; }
  })();
  // 3) mais jeitos de conjugar verbos que aparecem nas perguntas sobre os programas
  [['importar', ['importo', 'importa', 'importei', 'importando', 'importacao']], ['exportar', ['exporto', 'exporta', 'exportei', 'exportando', 'exportacao']],
   ['salvar', ['salvo', 'salva', 'salvei', 'salvando']], ['autorizar', ['autorizo', 'autoriza', 'autorizei', 'autorizando']],
   ['compartilhar', ['compartilho', 'compartilha', 'compartilhei', 'compartilhando']], ['gravar', ['gravo', 'grava', 'gravei', 'gravando', 'gravacao']],
   ['repetir', ['repito', 'repete', 'repeti', 'repetindo']], ['buscar', ['busco', 'busca', 'busquei', 'buscando']], ['achar', ['acho', 'acha', 'achei', 'achando']],
   ['cadastrar', ['cadastrei', 'cadastrando', 'cadastra']], ['preencher', ['preencho', 'preenche', 'preenchi', 'preenchendo', 'preenchimento']], ['pontuar', ['pontuo', 'pontua', 'pontuei', 'pontuando']], ['duplicata', ['duplicado', 'duplicados', 'duplicada', 'duplicadas', 'duplicar', 'duplicidade']]].forEach(function (p) { L.sin(p[0], p[1]); });

  // ---------- recursos do site (nao sao testes): onde fica no painel, custo e link do manual ----------
  var RECURSOS = { agenda: 'Agenda', anamnese: 'Anamnese', prontuario: 'Prontu\u00e1rio' };
  Object.keys(RECURSOS).forEach(function (id) {
    var e = ent(id); if (!e || (e.extra && e.extra.indexOf('/manual-' + id + '.html') >= 0)) { return; }
    var extra = (e.extra ? fim(e.extra) + ' ' : '') + 'Fica na aba ' + RECURSOS[id] + ' do painel do profissional.';
    if (e.preco) { extra += ' ' + fim(e.preco); }
    extra += ' Mais informa\u00e7\u00f5es no manual: ' + BASE + 'online/manual-' + id + '.html';
    e.extra = extra;
  });
  var ip = L.porId('pacientes');
  if (ip && Array.isArray(ip.a) && ip.a.join(' ').indexOf('manual-pacientes') < 0) {
    ip.a = ip.a.concat(['Fica na aba Pacientes do painel do profissional e n\u00e3o tem cobran\u00e7a por cr\u00e9dito. Mais informa\u00e7\u00f5es no manual: ' + BASE + 'online/manual-pacientes.html']);
  }
  // "prontuario eletronico" = Prontuario IA (apoio ao registro clinico; o texto e rascunho que o profissional revisa)
  var pe = ent('prontuario');
  if (pe && pe.nomes) { ['prontuario eletronico', 'prontuario digital', 'prontuario online', 'registro clinico'].forEach(function (n) { if (pe.nomes.indexOf(n) < 0) { pe.nomes.push(n); } }); }
  var ae = ent('agenda');
  if (ae && ae.nomes) { ['agenda eletronica', 'agenda online', 'agenda digital', 'agendamento'].forEach(function (n) { if (ae.nomes.indexOf(n) < 0) { ae.nomes.push(n); } }); }
  // "o site tem painel para o profissional?" (antes caia em "procurar profissional", porque "tem" vale por "procura")
  (function () {
    var base = L.porId('painel_ferramentas'), ac = L.porId('painel_acessar');
    var ferr = base && Array.isArray(base.a) ? base.a[0] : 'O painel tem: Pacientes, Escalas, os testes por \u00e1rea, Anamnese, Agenda e Prontu\u00e1rio IA.';
    L.intents.push({ id: 'painel_profissional', k: ['painel profissional', 'painel para profissional', 'area profissional', 'area do profissional', 'sistema profissional', 'sistema para profissional', 'plataforma profissional', 'plataforma para profissional', 'area restrita', 'painel do profissional'],
      a: { home: ['Sim! O site tem um painel gratuito para o profissional (neuropsic\u00f3logo, psic\u00f3logo e afins), onde ele cadastra pacientes, envia escalas e testes por link e recebe o relat\u00f3rio em PDF.', ferr,
                  'Para entrar, clique em "Acessar meu painel gratuito" no topo da p\u00e1gina inicial. O cadastro \u00e9 feito automaticamente no primeiro acesso.'],
           _: ['Voc\u00ea j\u00e1 est\u00e1 no painel do profissional. ' + ferr] },
      p: 45, m: ['home', 'painel'], c: ['Como entro no painel?', 'Quanto custa?'] });
  })();
  // "tem exemplo de anamnese?": nao existe exemplo publico; ela nao inventa
  (function () {
    var it = { id: 'anamnese_exemplo', k: ['exemplo anamnese', 'exemplo de anamnese', 'modelo anamnese', 'modelo de anamnese', 'ver anamnese', 'anamnese de exemplo', 'amostra anamnese', 'anamnese pronta', 'como e a anamnese', 'como fica a anamnese'],
      a: ['N\u00e3o tenho um exemplo pronto para mostrar aqui. O manual da Anamnese explica os dois tipos (Personalizada e Infantil), o que cada um traz e como o envio funciona: ' + BASE + 'online/manual-anamnese.html',
          'No painel, na aba Anamnese, voc\u00ea escolhe o tipo e pode enviar por link, preencher na hora ou imprimir. Se quiser ver um modelo, o S\u00e9rgio pode te mostrar: ' + W + '.'],
      p: 20, m: ['home', 'painel'], c: ['Como funciona a Anamnese?', 'Falar com o S\u00e9rgio'] };
    L.intents.push(it);
  })();

  // ---------- curiosidade: o nome Lauana (so responde se perguntarem; palavras do Sergio, 27/11/2026) ----------
  var I = function (id, k, a, o) { var it = { id: id, k: k, a: a, p: o.p || 0 }; if (o.m) { it.m = o.m; } if (o.c) { it.c = o.c; } L.intents.push(it); };
  I('nome_lauana', ['por que lauana', 'por que seu nome lauana', 'por que se chama lauana', 'por que voce chama lauana', 'significado lauana', 'significado do nome lauana', 'origem do nome lauana', 'origem nome lauana', 'de onde vem o nome lauana', 'quem e lauana', 'por que esse nome', 'por que lauana nome', 'porque lauana'],
    ['Meu nome \u00e9 uma homenagem que o S\u00e9rgio fez \u00e0 filha dele. \ud83d\udc9a'], { p: 16, m: ['home', 'painel'], c: ['Quem \u00e9 o S\u00e9rgio?', 'Como surgiu o site?'] });
})(typeof window !== 'undefined' ? window : global);

/* kb-programas.js */
// ============================================================
// LAUANA - APROFUNDAMENTO PROGRAMA POR PROGRAMA (carregado depois de kb-assuntos.js)
// Cada programa ganha respostas sobre COMO ELE FUNCIONA DE VERDADE na tela (botoes, o que aparece, o que acontece em cada clique).
// Fonte: o codigo do painel (site/online/index.html) e o manual do programa. Se a fonte nao diz, a Lauana NAO responde (nao inventa).
// Como acrescentar um programa: DEEP.<id> = { chips: [...], qa: [ { chip, g: [palavras-gatilho], r: [baloes] } ] }
//   - g: lista de palavras/frases; a pergunta casa se tiver 2 palavras de g, ou 1 palavra rara na base.
//   - vale dentro do painel (com a aba aberta) e tambem logo depois de a pessoa ter perguntado daquele programa.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var BASE = 'https://setmonte.github.io/';
  function ent(id) { for (var i = 0; i < L.ents.length; i++) { if (L.ents[i].id === id) { return L.ents[i]; } } return null; }
  // as respostas de cada programa ficam em L._deepDados (os arquivos kb-prog-*.js tambem escrevem la, em qualquer ordem)
  var DEEP = L._deepDados = L._deepDados || {};
  // aba do painel de cada programa (para o caso de a pergunta vir logo depois de falar do programa, sem o painel avisar a aba)
  var ABA_DE = L._deepAba = L._deepAba || {};
  ABA_DE.smart = ['reabilitacao', 'smart'];

  // ---------- 0) "sugerir" so abre o fluxo de sugestoes quando a pessoa quer sugerir algo AO SITE ----------
  var fb = L.porId('fb_sugestao');
  if (fb) { fb.k = ['sugestao', 'quero sugerir', 'queria sugerir', 'gostaria de sugerir', 'posso sugerir', 'vou sugerir', 'deixar sugestao', 'tenho uma sugestao', 'melhorar site', 'melhoria', 'funcionalidade nova', 'pedir recurso', 'seria bom']; delete fb._k; }

  // ---------- SMART ----------
  var sm = ent('smart');
  if (sm) {
    sm.como = 'Na aba Reabilita\u00e7\u00e3o, abra o SMART: 1) clique na letra inicial do nome do paciente (se a barra de letras aparecer); 2) na linha do paciente, clique em "Ver"; 3) aguarde a IA analisar os resultados dele; 4) as metas SMART aparecem na tela; 5) depois disso o bot\u00e3o "PDF" da linha fica dispon\u00edvel.';
  }
  DEEP.smart = {
    chips: ['O que \u00e9 o SMART?', 'Como gero as metas de um paciente?', 'O que acontece ao clicar numa letra?', 'Quais dados v\u00e3o para a IA?'],
    qa: [
      { chip: 'Como gero as metas de um paciente?', g: ['gerar metas', 'gerar meta', 'gerar plano', 'como funciona', 'passo a passo', 'botao ver', 'clicar ver', 'clico ver'],
        r: ['Na aba SMART: 1) clique na letra inicial do nome do paciente (a barra de letras aparece no alto da lista); 2) na tabela, clique em "Ver" na linha dele; 3) aguarde enquanto a IA analisa os resultados; 4) as metas aparecem na tela.',
            'O bot\u00e3o "PDF" da linha s\u00f3 fica dispon\u00edvel depois que as metas foram geradas.'] },
      { chip: 'O que acontece ao clicar numa letra?', g: ['letra', 'letras', 'alfabeto', 'inicial', 'barra de letras', 'filtrar'],
        r: ['As letras s\u00e3o s\u00f3 um filtro da lista de pacientes: cada uma \u00e9 a inicial do nome (A, B, C...) e mostra, entre par\u00eanteses, quantos pacientes t\u00eam aquela inicial. Ao clicar, aparece a tabela s\u00f3 com os pacientes dessa letra, com os bot\u00f5es "Ver" e "PDF". Clicar de novo na mesma letra fecha a tabela.',
            'Clicar na letra n\u00e3o gera nada: as metas s\u00f3 aparecem quando voc\u00ea clica em "Ver" na linha do paciente. Se todos os pacientes tiverem a mesma inicial, a barra n\u00e3o aparece e a lista j\u00e1 vem direto.'] },
      { chip: 'Ela sugere a reabilita\u00e7\u00e3o da pessoa?', g: ['sugerir', 'sugere', 'sugestao', 'reabilitacao', 'proposta', 'prescrever', 'plano de reabilitacao', 'metas de reabilitacao'],
        r: ['Sim, mas n\u00e3o ao clicar na letra: a letra s\u00f3 filtra a lista de pacientes. A sugest\u00e3o aparece depois que voc\u00ea clica em "Ver" na linha do paciente. O SMART reune os resultados de testes e escalas dele (e a anamnese mais recente, se houver) e a IA prop\u00f5e de 2 a 4 metas de reabilita\u00e7\u00e3o cognitiva.',
            'Cada meta traz t\u00edtulo, o instrumento relacionado e os cinco crit\u00e9rios (S, M, A, R e T). \u00c9 uma sugest\u00e3o: voc\u00ea revisa e decide o que adotar.'] },
      { chip: 'O que cada meta traz?', g: ['meta', 'metas', 'o que traz', 'o que aparece', 'resultado do smart', 'como fica'],
        r: ['Cada meta mostra: o n\u00famero e a situa\u00e7\u00e3o (reabilita\u00e7\u00e3o, manuten\u00e7\u00e3o ou monitoramento), o instrumento relacionado, um t\u00edtulo, a descri\u00e7\u00e3o completa e os cinco crit\u00e9rios SMART: Espec\u00edfica, Mensur\u00e1vel, Alcan\u00e7\u00e1vel, Relevante e Temporal (com prazo e frequ\u00eancia das sess\u00f5es).'] },
      { chip: 'O que \u00e9 reabilita\u00e7\u00e3o, manuten\u00e7\u00e3o e monitoramento?', g: ['manutencao', 'monitoramento', 'status', 'situacao da meta', 'cores', 'azul', 'verde', 'amarelo'],
        r: ['\u00c9 a situa\u00e7\u00e3o de cada meta: "Reabilita\u00e7\u00e3o" (azul) \u00e9 para uma fun\u00e7\u00e3o com d\u00e9ficit; "Manuten\u00e7\u00e3o" (verde) \u00e9 para uma fun\u00e7\u00e3o preservada, que vale manter; "Monitoramento" (amarelo) \u00e9 para acompanhar a evolu\u00e7\u00e3o.'] },
      { chip: 'E se o paciente n\u00e3o fez nenhum teste?', g: ['nenhum teste', 'sem teste', 'sem resultado', 'nenhum resultado', 'paciente novo', 'nao fez teste', 'nao tem teste', 'vazio'],
        r: ['Aparece o aviso "Nenhum resultado encontrado" e a orienta\u00e7\u00e3o de aplicar testes pelo painel primeiro. O SMART parte dos resultados que j\u00e1 existem: quanto mais testes e escalas o paciente tiver feito, mais bem fundamentadas ficam as metas.'] },
      { chip: 'Quais dados v\u00e3o para a IA?', g: ['dados enviados', 'dados ia', 'enviados ia', 'anonimo', 'anonimizacao', 'privacidade', 'lgpd', 'seguro', 'nome do paciente', 'o que vai para a ia'],
        r: ['Vai o resumo dos resultados dos testes e escalas do paciente e, se houver, o texto da anamnese mais recente. O nome \u00e9 trocado por uma etiqueta antes de ir \u00e0 IA e volta ao normal no resultado.',
            'Depois de gerar as metas, o bot\u00e3o "Ver dados enviados \u00e0 IA" mostra o texto exato que foi enviado.'] },
      { chip: 'Como gero o PDF do SMART?', g: ['pdf', 'relatorio', 'imprimir', 'baixar', 'salvar', 'exportar'],
        r: ['Clique em "PDF" na linha do paciente. O bot\u00e3o s\u00f3 libera depois que as metas foram geradas com "Ver". O PDF tem o t\u00edtulo "Programa de Reabilita\u00e7\u00e3o Cognitiva", os seus dados profissionais, os dados do paciente, o hist\u00f3rico de avalia\u00e7\u00f5es e as metas SMART sugeridas.'] },
      { chip: 'Deu erro ao gerar as metas', g: ['erro', 'falhou', 'nao gerou', 'nao funcionou', 'travou', 'demora', 'resposta vazia', 'tentar novamente'],
        r: ['Se a IA ficar fora do ar, sem conex\u00e3o ou responder em formato inesperado, o SMART avisa na tela e mostra o bot\u00e3o "Tentar novamente". Nenhuma meta \u00e9 gerada nesses casos. Se continuar falhando, fale com o S\u00e9rgio: ' + W + '.'] }
    ]
  };

  // ---------- cola: acrescenta as respostas detalhadas ao contexto de cada programa ----------
  var ctxBase = L.contextoDe;
  L.contextoDe = function (E) {
    var c = ctxBase.apply(this, arguments);
    // id do programa: a entidade da base, ou (programas sem ficha na base, como o BVRT) o que o painel informou
    var id = c ? (c.ent ? c.ent.id : String((E && (E.programa || E.aba)) || '').toLowerCase()) : '';
    if (c && id && DEEP[id] && !c._deep) {
      c._deep = true;
      // perguntas sobre "o que o paciente faz / como e o teste" ganham das de aspecto ("como aplico") e aceitam outras formas de dizer isso
      DEEP[id].qa.forEach(function (q) {
        if (!q._forte && q.g.indexOf('paciente faz') >= 0) {
          // so frases completas: palavras soltas ("retencao", "rosto", "parte b") roubariam perguntas de outras respostas
          q.g = q.g.filter(function (x) { return x.indexOf(' ') > 0; });
          q._forte = true; q.forte = true; ['tem que fazer', 'precisa fazer', 'o que ele faz', 'o que ela faz', 'o que a pessoa faz', 'o que fazer no teste'].forEach(function (x) { if (q.g.indexOf(x) < 0) { q.g.push(x); } }); }
      });
      c.qa = c.qa.concat(DEEP[id].qa);
      if (DEEP[id].chips) { c.chips = DEEP[id].chips.slice(); }
    }
    return c;
  };
  // logo depois de falar de um programa (sem o painel ter avisado a aba), as perguntas seguintes tambem valem para ele
  var trBase = L.tratarContexto;
  L.tratarContexto = function (texto, n, E, modo) {
    if (modo === 'painel' && !E.aba && E.ent && ABA_DE[E.ent.id] && DEEP[E.ent.id]) {
      var par = ABA_DE[E.ent.id];
      E.aba = par[0]; E.programa = par[1];
      try { return trBase.apply(this, arguments); } finally { E.aba = null; E.programa = ''; }
    }
    return trBase.apply(this, arguments);
  };
  L.deep = DEEP;
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-a.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote A (testes: funcoes executivas, atencao, memoria)
// Fonte: painel (site/online/index.html) e manuais manual-*.html, lidos em 27/11/2026. Onde a fonte nao diz, nao se responde.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  var ABA_DE = L._deepAba = L._deepAba || {};
  function P(id, aba, prog, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; ABA_DE[id] = [aba, prog]; }
  function Q(chip, g, r) { return { chip: chip, g: g, r: r }; }
  var RASTREIO = 'Lembrando: \u00e9 um instrumento de rastreio experimental, sem valida\u00e7\u00e3o normativa brasileira formal deste app. Use junto com o julgamento cl\u00ednico e outros instrumentos.';

  // ---------- TECFE ----------
  P('tecfe', 'funcExec', 'tecfe', ['O que \u00e9 o TECFE?', 'O que o TECFE mede?', 'Como interpreto o TECFE?', 'Quanto custa o TECFE?'], [
    Q('O que o TECFE mede?', ['mede', 'medir', 'metricas', 'metrica', 'indicadores', 'categorias completas', 'o que avalia'],
      ['O TECFE observa tr\u00eas componentes das fun\u00e7\u00f5es executivas: forma\u00e7\u00e3o de conceitos (descobrir a regra), flexibilidade cognitiva (mudar quando a regra muda) e controle inibit\u00f3rio (parar de usar a regra antiga).',
       'As m\u00e9tricas s\u00e3o: categorias completadas (at\u00e9 6), erros perseverativos, falhas em manter o set e o total de tentativas e acertos.']),
    Q('O que o paciente faz no TECFE?', ['paciente faz', 'o que faz', 'tarefa', 'cartas', 'baralho', 'como e o teste', 'descobrir regra', 'feedback'],
      ['O paciente classifica cartas por cor, forma ou n\u00famero, sem saber a regra: ele descobre pelo retorno "certo" ou "errado" a cada tentativa. Depois de uma sequ\u00eancia de acertos, a regra muda sem aviso.',
       'S\u00e3o 128 cartas (2 baralhos de 64). O teste termina ao completar 6 categorias ou quando as cartas acabam, em cerca de 8 a 15 minutos.']),
    Q('O que \u00e9 erro perseverativo?', ['perseverativo', 'perseverativos', 'perseveracao', 'erro perseverativo'],
      ['\u00c9 insistir na regra antiga depois que ela mudou. \u00c9 a m\u00e9trica-chave do TECFE: segundo o manual, a dificuldade de abandonar uma estrat\u00e9gia que deixou de funcionar \u00e9 um dos indicadores mais sens\u00edveis de comprometimento executivo (frontal).']),
    Q('O que \u00e9 falha em manter o set?', ['manter set', 'falha set', 'falhas set', 'manter o set', 'perder a regra'],
      ['\u00c9 perder a regra correta que j\u00e1 tinha sido descoberta. Segundo o manual, indica oscila\u00e7\u00e3o atencional.']),
    Q('Como interpreto o TECFE?', ['interpretar', 'interpretacao', 'interpreto', 'rigidez', 'flexibilidade preservada', 'poucas categorias', 'resultado significa', 'resultado quer dizer'],
      ['Poucas categorias completadas com muitos erros perseverativos sugerem rigidez cognitiva e pedem aprofundamento. Boas categorias com poucos erros perseverativos sugerem flexibilidade preservada. Idade e escolaridade influenciam o desempenho.',
       RASTREIO]),
    Q('Que estilos de resposta o TECFE descreve?', ['estilo', 'estilos', 'estrategia', 'sistematica', 'impulsiva', 'aleatoria', 'tentativa e erro'],
      ['Al\u00e9m dos n\u00fameros, a an\u00e1lise descreve como a pessoa resolveu o problema: sistem\u00e1tica, sistem\u00e1tica por elimina\u00e7\u00e3o, parcialmente sistem\u00e1tica, tentativa e erro, perseverativa, aleat\u00f3ria ou impulsiva.']),
    Q('Como funciona o laudo com IA do TECFE?', ['laudo', 'parecer', 'parecer clinico', 'relatorio', 'inteligencia artificial', 'anonimizado'],
      ['Ao final, o sistema gera um parecer cl\u00ednico breve com apoio de IA, a partir das m\u00e9tricas do desempenho e da idade e escolaridade. Os dados do paciente s\u00e3o anonimizados antes de irem \u00e0 IA.',
       'O parecer \u00e9 um apoio, n\u00e3o um laudo final: deve ser revisado e validado por voc\u00ea.']),
    Q('O TECFE \u00e9 igual ao WCST?', ['wcst', 'wisconsin', 'inspirado', 'baseado em'],
      ['O TECFE \u00e9 inspirado no Wisconsin Card Sorting Test (WCST), mas \u00e9 um instrumento pr\u00f3prio do site. ' + RASTREIO])
  ]);

  // ---------- TTE ----------
  P('tte', 'funcExec', 'tte', ['O que \u00e9 o TTE?', 'O que o TTE mede?', 'Como interpreto o TTE?', 'Quanto custa o TTE?'], [
    Q('O que o paciente faz no TTE?', ['paciente faz', 'o que faz', 'tarefa', 'circulos', 'arrastar', 'parte a', 'parte b', 'como e o teste'],
      ['O paciente conecta c\u00edrculos arrastando linhas, em duas partes: na Parte A liga os n\u00fameros em ordem (1, 2, 3...); na Parte B alterna n\u00fameros e letras (1, A, 2, B...). Cada parte tem 25 itens.',
       'O sistema registra o tempo e os erros de cada parte. O manual recomenda garantir que a pessoa entendeu a tarefa antes de come\u00e7ar.']),
    Q('O que o TTE mede?', ['mede', 'medir', 'metricas', 'metrica', 'resultado', 'indicadores', 'tempo a', 'tempo b'],
      ['O resultado traz: Tempo A (velocidade de processamento e busca visual), Tempo B (velocidade com altern\u00e2ncia entre n\u00fameros e letras), Erros, Raz\u00e3o B/A (\u00edndice de flexibilidade cognitiva) e Diferen\u00e7a B menos A (o custo extra da altern\u00e2ncia).']),
    Q('Para que serve a raz\u00e3o B/A?', ['razao', 'razao b a', 'b a', 'diferenca b a', 'set shifting', 'alternancia'],
      ['A raz\u00e3o B/A \u00e9 o Tempo B dividido pelo Tempo A. Ela separa o custo de alternar do custo da velocidade em si: uma raz\u00e3o alta sugere que a dificuldade est\u00e1 na flexibilidade cognitiva, e n\u00e3o s\u00f3 na lentid\u00e3o geral, algo que o Tempo B sozinho n\u00e3o distingue.']),
    Q('Como interpreto o TTE?', ['interpretar', 'interpretacao', 'interpreto', 'lentificacao', 'resultado significa', 'tempos altos', 'normas'],
      ['Tempos altos nas duas partes sugerem lentifica\u00e7\u00e3o global. Parte A preservada com Parte B muito mais lenta (raz\u00e3o B/A alta) aponta para custo de altern\u00e2ncia. Idade e escolaridade influenciam bastante.',
       'As normas de tempo ainda s\u00e3o provis\u00f3rias (em constru\u00e7\u00e3o): interprete com cautela, junto com o julgamento cl\u00ednico.'])
  ]);

  // ---------- BAE ----------
  P('bae', 'atencao', 'bae', ['O que \u00e9 a BAE?', 'Quais s\u00e3o os 5 subtestes?', 'O que significam omiss\u00f5es e comiss\u00f5es?', 'Como aplico a BAE?'], [
    Q('Quais s\u00e3o os 5 subtestes?', ['subtestes', 'subteste', 'cinco', 'cinco testes', 'tipos de atencao', 'concentrada', 'sustentada', 'alternada', 'dividida', 'seletiva'],
      ['S\u00e3o cinco: Concentrada (cancelamento: manter o foco numa busca visual), Sustentada (vigil\u00e2ncia de 5 minutos), Alternada (troca de regra, a flexibilidade atencional), Dividida (dupla tarefa) e Seletiva (focar no alvo ignorando distratores).',
       'Cada subteste vale 1 cr\u00e9dito e a bateria completa usa 5. Voc\u00ea pode aplicar s\u00f3 os que a hip\u00f3tese cl\u00ednica pedir.']),
    Q('O que significam omiss\u00f5es e comiss\u00f5es?', ['omissao', 'omissoes', 'comissao', 'comissoes', 'metricas', 'metrica', 'tr medio', 'variabilidade', 'o que mede'],
      ['Acertos s\u00e3o as respostas corretas aos alvos. Omiss\u00f5es s\u00e3o alvos que passaram sem resposta e indicam desaten\u00e7\u00e3o. Comiss\u00f5es s\u00e3o respostas a n\u00e3o-alvos e indicam impulsividade ou falha inibit\u00f3ria.',
       'O TR m\u00e9dio \u00e9 o tempo de rea\u00e7\u00e3o m\u00e9dio, e a variabilidade \u00e9 a oscila\u00e7\u00e3o desse tempo: segundo o manual, a inconsist\u00eancia costuma informar mais do que a velocidade m\u00e9dia sozinha, sobretudo na pesquisa de TDAH.']),
    Q('Como aplico a BAE?', ['aplicar', 'aplicacao', 'computador', 'teclado', 'celular bloqueado', 'ambiente', 'duracao', 'recomendacoes'],
      ['A BAE s\u00f3 roda em computador com teclado: celular e tablet s\u00e3o bloqueados (o paciente v\u00ea um aviso e nenhum cr\u00e9dito \u00e9 gasto).',
       'A bateria completa leva cerca de 20 a 30 minutos. O manual recomenda ambiente silencioso e sem interrup\u00e7\u00f5es, principalmente na Sustentada (5 minutos), e garantir que a pessoa entendeu a tarefa de cada subteste antes de come\u00e7ar.']),
    Q('Como interpreto a BAE?', ['interpretar', 'interpretacao', 'interpreto', 'perfil', 'queda progressiva', 'resultado significa', 'resultado quer dizer'],
      ['Leia o perfil por subteste, porque um tipo de aten\u00e7\u00e3o pode estar preservado e outro n\u00e3o. Queda progressiva na Sustentada sugere dificuldade de vigil\u00e2ncia; muitos erros na Alternada, de flexibilidade; na Seletiva, de controle inibit\u00f3rio.',
       'Idade e escolaridade influenciam o desempenho. ' + RASTREIO]),
    Q('Como funciona o laudo com IA da BAE?', ['laudo', 'parecer', 'relatorio', 'inteligencia artificial', 'anonimizado', 'pdf'],
      ['Ao final, o sistema gera um laudo em PDF com parecer cl\u00ednico apoiado por IA, com os dados anonimizados antes do envio. O parecer \u00e9 um apoio, n\u00e3o um laudo final: deve ser revisado e validado por voc\u00ea.'])
  ]);

  // ---------- TRMV ----------
  P('trmv', 'memoria', 'trmv', ['O que \u00e9 o TRMV?', 'Como funciona o TRMV?', 'O que significam as m\u00e9tricas do TRMV?', 'Quanto custa o TRMV?'], [
    Q('Como funciona o TRMV?', ['como funciona o teste', 'etapas', 'codificacao', 'retencao', '30 segundos', '60 segundos', 'o que faz', 'paciente faz', 'tarefa'],
      ['Tem tr\u00eas momentos: 1) codifica\u00e7\u00e3o (30 segundos): as figuras-alvo aparecem para memorizar; 2) reconhecimento imediato: a pessoa aponta quais j\u00e1 viu entre alvos e distratores; 3) reten\u00e7\u00e3o (60 segundos): ap\u00f3s um intervalo, repete o reconhecimento.',
       'O n\u00famero de figuras muda com a idade: crian\u00e7as at\u00e9 12 anos veem 5; adultos de 13 a 59, 10; idosos de 60 anos ou mais, 5 ou 10 conforme a escolaridade. Dura cerca de 4 minutos.']),
    Q('Por que o TRMV usa figuras abstratas?', ['abstratas', 'abstrato', 'poligonos', 'nao semanticos', 'figuras sem significado', 'por que figuras'],
      ['Os est\u00edmulos s\u00e3o pol\u00edgonos abstratos sem significado \u00f3bvio, de prop\u00f3sito: um desenho de "casa" seria memorizado pela palavra "casa". Formas sem nome obrigam o sistema visual a trabalhar e tornam o teste mais espec\u00edfico para a mem\u00f3ria visual.']),
    Q('O que significam as m\u00e9tricas do TRMV?', ['metricas', 'metrica', 'alarmes falsos', 'alarme falso', 'omissoes', 'indice de retencao', 'acertos', 'o que mede'],
      ['Acertos s\u00e3o as figuras-alvo reconhecidas. Alarmes falsos s\u00e3o dizer que viu uma figura nova (vi\u00e9s de resposta ou falsa mem\u00f3ria). Omiss\u00f5es s\u00e3o n\u00e3o reconhecer um alvo verdadeiro (falha de armazenamento ou recupera\u00e7\u00e3o).',
       '\u00cdndice de reten\u00e7\u00e3o \u00e9 a diferen\u00e7a de acertos entre o 2\u00ba e o 1\u00ba reconhecimento: positivo ou zero indica reten\u00e7\u00e3o preservada; negativo indica decaimento (perder 1 ou 2 figuras \u00e9 flutua\u00e7\u00e3o esperada; 3 ou mais \u00e9 decaimento significativo).']),
    Q('Como interpreto o TRMV?', ['interpretar', 'interpretacao', 'interpreto', 'consolidacao', 'codificacao fragilizada', 'resultado significa', 'resultado quer dizer'],
      ['Bom reconhecimento imediato com forte queda na reten\u00e7\u00e3o aponta para problema de consolida\u00e7\u00e3o. Baixo desempenho j\u00e1 no imediato aponta para codifica\u00e7\u00e3o fragilizada (ou desaten\u00e7\u00e3o durante a memoriza\u00e7\u00e3o). Leia omiss\u00f5es e alarmes falsos juntos, n\u00e3o s\u00f3 os acertos.',
       'Corre\u00e7\u00e3o visual (\u00f3culos ou lentes) e condi\u00e7\u00f5es da tela influenciam e devem ser garantidas antes. ' + RASTREIO]),
    Q('Como funciona o laudo do TRMV?', ['laudo', 'parecer', 'topologico', 'relatorio', 'inteligencia artificial', 'pdf'],
      ['O laudo em PDF inclui um parecer cl\u00ednico topol\u00f3gico apoiado por IA. \u00c9 um apoio e deve ser revisado por voc\u00ea.'])
  ]);

  // ---------- TAAV ----------
  P('taav', 'memoria', 'taav', ['O que \u00e9 o TAAV?', 'Como \u00e9 aplicado o TAAV?', 'O que \u00e9 a curva de aprendizagem?', 'Quanto custa o TAAV?'], [
    Q('Como \u00e9 aplicado o TAAV?', ['fases', 'etapas', 'como e aplicado', 'tentativas', 'como funciona o teste', 'paciente faz', 'o que faz', 'tarefa', 'lista de interferencia'],
      ['S\u00e3o 15 figuras de objetos comuns e as fases s\u00e3o: 1) tentativas 1 a 5: as mesmas 15 figuras s\u00e3o estudadas (cerca de 30 segundos) e reconhecidas cinco vezes seguidas; 2) lista de interfer\u00eancia: uma lista nova \u00e9 apresentada e reconhecida uma vez; 3) evoca\u00e7\u00e3o imediata das figuras da primeira lista; 4) evoca\u00e7\u00e3o tardia, cerca de 20 minutos depois; 5) reconhecimento final entre distratores.',
       'O intervalo de cerca de 20 minutos \u00e9 real, ent\u00e3o planeje o hor\u00e1rio da sess\u00e3o.']),
    Q('O que \u00e9 a curva de aprendizagem?', ['curva', 'curva de aprendizagem', 'ganho', 'aprendizagem', 'ascendente', 'achatada'],
      ['\u00c9 a evolu\u00e7\u00e3o dos acertos ao longo das 5 tentativas (T1 a T5) e, segundo o manual, o dado mais rico do TAAV. Curva ascendente indica aprendizagem preservada; curva achatada (pouco ganho de T1 para T5) sugere dificuldade de se beneficiar da repeti\u00e7\u00e3o.',
       'O ganho de aprendizagem \u00e9 T5 menos T1.']),
    Q('O que significam as m\u00e9tricas do TAAV?', ['metricas', 'metrica', 'interferencia proativa', 'interferencia retroativa', 'proativa', 'retroativa', 'evocacao tardia', 'o que mede', 'reconhecimento'],
      ['Interfer\u00eancia proativa (B menos T1) \u00e9 o efeito da lista antiga sobre o aprendizado da nova. Interfer\u00eancia retroativa (A6 menos T5) \u00e9 o efeito da lista nova sobre a mem\u00f3ria da antiga. Evoca\u00e7\u00e3o tardia (reten\u00e7\u00e3o) mostra quanto se manteve ap\u00f3s cerca de 20 minutos. Reconhecimento \u00e9 a capacidade de identificar os alvos entre distratores.']),
    Q('Como interpreto o TAAV?', ['interpretar', 'interpretacao', 'interpreto', 'consolidacao', 'resultado significa', 'resultado quer dizer', 'aprender x reter'],
      ['Curva ascendente com boa evoca\u00e7\u00e3o tardia sugere aprendizagem e mem\u00f3ria visual preservadas. Bom aprendizado (T5) com queda acentuada na tardia aponta para consolida\u00e7\u00e3o fragilizada. Forte interfer\u00eancia sugere vulnerabilidade da mem\u00f3ria \u00e0 competi\u00e7\u00e3o entre listas.',
       'Idade, escolaridade e corre\u00e7\u00e3o visual influenciam. ' + RASTREIO]),
    Q('Como funciona o laudo do TAAV?', ['laudo', 'parecer', 'relatorio', 'inteligencia artificial', 'pdf'],
      ['O laudo em PDF traz a curva de aprendizagem e uma an\u00e1lise cl\u00ednica apoiada por IA. \u00c9 um apoio e deve ser revisado por voc\u00ea.'])
  ]);

  // ---------- CORSI ----------
  P('corsi', 'memoria', 'corsi', ['O que \u00e9 o Corsi?', 'Como funciona o Corsi?', 'O que \u00e9 span direto e inverso?', 'Como interpreto o Corsi?'], [
    Q('Como funciona o Corsi?', ['como funciona o teste', 'cubos', 'blocos', 'sequencia', 'o que faz', 'paciente faz', 'tarefa', 'niveis', 'tentativas'],
      ['O paciente v\u00ea cubos acendendo em sequ\u00eancia, em perspectiva 3D, e reproduz a ordem. Primeiro na ordem direta (a mesma em que acenderam) e depois na ordem inversa (de tr\u00e1s para frente).',
       'Cada cubo fica aceso cerca de 1 segundo, com cerca de 1 segundo de intervalo, e h\u00e1 2 tentativas por n\u00edvel. A sequ\u00eancia vai aumentando at\u00e9 a pessoa n\u00e3o conseguir mais acompanhar.']),
    Q('O que \u00e9 span direto e inverso?', ['span', 'span direto', 'span inverso', 'direto', 'inverso', 'pontuacao total', 'metricas', 'resultado'],
      ['Span Direto \u00e9 a maior sequ\u00eancia reproduzida na ordem correta (capacidade de armazenamento visuoespacial). Span Inverso \u00e9 a maior na ordem inversa, que exige mais manipula\u00e7\u00e3o mental. Pontua\u00e7\u00e3o Total \u00e9 o desempenho global, combinando os n\u00edveis alcan\u00e7ados.']),
    Q('Como interpreto o Corsi?', ['interpretar', 'interpretacao', 'interpreto', 'resultado significa', 'resultado quer dizer', 'span baixo', 'span baixos', 'executivo'],
      ['Spans baixos sugerem capacidade reduzida de mem\u00f3ria de trabalho visuoespacial. Bom span direto com inverso desproporcionalmente baixo aponta para custo de manipula\u00e7\u00e3o, n\u00e3o s\u00f3 de armazenamento (componente executivo da mem\u00f3ria de trabalho).',
       'Idade e escolaridade influenciam bastante, e a perspectiva 3D pede boas condi\u00e7\u00f5es de tela. As normas ainda s\u00e3o provis\u00f3rias (em constru\u00e7\u00e3o): interprete com cautela.']),
    Q('O Corsi \u00e9 igual ao span de d\u00edgitos?', ['span de digitos', 'digitos', 'verbal', 'visuoespacial', 'diferenca'],
      ['\u00c9 o an\u00e1logo visuoespacial: o span de d\u00edgitos mede a al\u00e7a verbal da mem\u00f3ria de trabalho e o Corsi mede a al\u00e7a visuoespacial.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-a2.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote A2 (percepcao, linguagem, visuoconstrutivo)
// Fonte: painel (site/online/index.html) e manuais manual-*.html, lidos em 27/11/2026.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  var ABA_DE = L._deepAba = L._deepAba || {};
  function P(id, aba, prog, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; ABA_DE[id] = [aba, prog]; }
  function Q(chip, g, r) { return { chip: chip, g: g, r: r }; }
  var RASTREIO = 'Lembrando: \u00e9 um instrumento de rastreio experimental, sem valida\u00e7\u00e3o normativa brasileira formal. Use junto com o julgamento cl\u00ednico e outros instrumentos.';

  // ---------- TREF ----------
  P('tref', 'percepcao', 'tref', ['O que \u00e9 o TREF?', 'Como funciona o TREF?', 'Como interpreto o TREF?', 'Quanto custa o TREF?'], [
    Q('Como funciona o TREF?', ['como funciona o teste', 'o que faz', 'paciente faz', 'tarefa', 'reconstruir', 'reconstroi', 'clicar nas regioes', 'rosto', 'codificacao'],
      ['A pessoa observa um rosto por 30 segundos e depois o reconstr\u00f3i de mem\u00f3ria, clicando nas regi\u00f5es de que se lembra (olhos, boca, nariz e outras \u00e1reas). A ordem dos cliques \u00e9 registrada e mostra por onde a aten\u00e7\u00e3o dela "come\u00e7a" ao olhar um rosto.',
       'Crian\u00e7as de 6 a 12 anos veem 1 rosto (do mesmo sexo); a partir de 13 anos, 2 rostos, o que permite comparar. Dura cerca de 5 minutos.']),
    Q('O que \u00e9 o ziguezague do TREF?', ['ziguezague', 'ziguezagues', 'zig zag', 'trajetoria', 'indice de ziguezague'],
      ['\u00c9 a dist\u00e2ncia m\u00e9dia entre cliques consecutivos ao longo de toda a reconstru\u00e7\u00e3o do rosto, numa escala de 0 a 100. Valores baixos indicam que a pessoa reconstr\u00f3i regi\u00f5es vizinhas em sequ\u00eancia (caminho organizado); valores altos, que ela salta entre regi\u00f5es distantes.',
       '\u00c9 o \u00edndice que define a classifica\u00e7\u00e3o na vers\u00e3o atual (v3.2).']),
    Q('Como o TREF classifica o resultado?', ['classificacao', 'classifica', 'tipico', 'atipico', 'limiar', 'limiares', '22', 'processamento atipico'],
      ['Com 2 rostos: ziguezague acima de 22 nos dois rostos indica padr\u00e3o sugestivo de processamento at\u00edpico (e o manual recomenda investigar com outros instrumentos, como o TECFE). Alto em apenas um rosto n\u00e3o classifica como at\u00edpico.',
       'Com 1 rosto (crian\u00e7as at\u00e9 12 anos): acima de 22 aparece "escaneamento at\u00edpico de acordo com os estudos; necess\u00e1rio investigar". Os limiares s\u00e3o provis\u00f3rios e calibr\u00e1veis, e o limiar do rosto \u00fanico foi calibrado com dados de adultos.']),
    Q('O que \u00e9 a discrep\u00e2ncia no TREF?', ['discrepancia', 'diferenca entre rostos', 'dois rostos', 'comparar rostos', '18'],
      ['\u00c9 a diferen\u00e7a entre o ziguezague do primeiro e do segundo rosto (s\u00f3 existe com 2 rostos). Acima de 18 aparece como um achado a investigar no inqu\u00e9rito, e n\u00e3o como diagn\u00f3stico: pode ter v\u00e1rias causas, entre elas a reatividade ao est\u00edmulo, como na ansiedade social.']),
    Q('O que \u00e9 o IFS do TREF?', ['ifs', 'ifs o', 'fixacao social', 'indice de fixacao', 'olhos e boca', 'social first', 'periferia first', 'padrao de escaneamento'],
      ['O IFS (\u00cdndice de Fixa\u00e7\u00e3o Social) \u00e9 a porcentagem de cliques nas regi\u00f5es sociais (olhos e boca). O IFS-O d\u00e1 mais peso aos primeiros cliques. Os dois s\u00e3o s\u00f3 informativos e n\u00e3o definem a classifica\u00e7\u00e3o.',
       'O padr\u00e3o de escaneamento descreve por onde a pessoa come\u00e7ou: social-first (olhos ou boca primeiro, padr\u00e3o t\u00edpico), misto ou periferia-first (padr\u00e3o at\u00edpico). Tamb\u00e9m n\u00e3o decide a classifica\u00e7\u00e3o final.']),
    Q('Como interpreto o TREF?', ['interpretar', 'interpretacao', 'interpreto', 'limitacoes', 'exclui tea', 'resultado significa', 'resultado quer dizer', 'tea'],
      ['Ziguezague baixo nos dois rostos indica trajet\u00f3ria organizada (resultado descritivo). Alto nos dois rostos merece aprofundamento com outros instrumentos, e n\u00e3o \u00e9 diagn\u00f3stico.',
       'Cuidado: o TREF mede a ordem de reconstru\u00e7\u00e3o de mem\u00f3ria, que n\u00e3o equivale ao olhar ao vivo. Por isso um padr\u00e3o t\u00edpico n\u00e3o exclui TEA. ' + RASTREIO]),
    Q('Por que o TREF fala em vi\u00e9s do pr\u00f3prio g\u00eanero?', ['vies', 'proprio genero', 'rosto feminino', 'rosto masculino', 'own gender', 'genero do rosto', 'sexo do rosto'],
      ['Quando a pessoa responde a um rosto feminino e a um masculino, \u00e9 comum haver diferen\u00e7a de engajamento entre eles. Antes de atribuir isso a uma causa cl\u00ednica, o manual pede considerar o vi\u00e9s do pr\u00f3prio g\u00eanero: mulheres e meninas tendem a processar melhor faces femininas.',
       'Ou seja, a diferen\u00e7a entre o rosto feminino e o masculino \u00e9 um dado a interpretar com o contexto, nunca um achado diagn\u00f3stico isolado.']),
    Q('Como funciona o laudo do TREF?', ['laudo', 'pdf', 'relatorio', 'parecer', 'inteligencia artificial'],
      ['O laudo em PDF traz a classifica\u00e7\u00e3o do instrumento e uma an\u00e1lise descritiva por IA, que deve ser revisada por voc\u00ea. Segundo o manual, o PDF e a an\u00e1lise por IA ainda usam a leitura por IFS; a classifica\u00e7\u00e3o v3.2 \u00e9 a que aparece na tela de resultado.'])
  ]);

  // ---------- TPV-SET ----------
  P('tpvset', 'percepcao', 'tpvset', ['O que \u00e9 o TPV-SET?', 'Qual \u00e9 a regra do SET?', 'Quais s\u00e3o os n\u00edveis do TPV-SET?', 'Como interpreto o TPV-SET?'], [
    Q('Qual \u00e9 a regra do SET?', ['regra do set', 'o que e um set', 'set valido', 'grade', 'cartas', 'trio', 'trios', 'como funciona o teste', 'o que faz', 'paciente faz'],
      ['A tela mostra uma grade 3x3 (9 cartas). Cada carta tem cor, forma e n\u00famero de s\u00edmbolos, e cada uma dessas tr\u00eas caracter\u00edsticas tem 3 valores. Um SET \u00e9 um trio em que, para cada caracter\u00edstica considerada, as tr\u00eas cartas s\u00e3o todas iguais ou todas diferentes, nunca duas iguais e uma diferente.',
       'O programa s\u00f3 avalia o trio quando as tr\u00eas cartas est\u00e3o alinhadas (em linha, coluna ou diagonal). Trio desalinhado \u00e9 ignorado, e marcar s\u00f3 1 ou 2 cartas tamb\u00e9m n\u00e3o conta.']),
    Q('Quais s\u00e3o os n\u00edveis do TPV-SET?', ['niveis', 'nivel', 'n1', 'n2', 'n3', 'rodadas', 'tempo por rodada', 'quantos niveis'],
      ['S\u00e3o tr\u00eas, sempre em ordem crescente, e voc\u00ea escolhe no painel quais aplicar (um, dois ou os tr\u00eas); cada n\u00edvel aplicado tem 3 rodadas.',
       'N1 (percep\u00e7\u00e3o): s\u00f3 1 caracter\u00edstica, avisada numa p\u00edlula roxa "PROCURE POR", 25 segundos por rodada. N2 (mem\u00f3ria de trabalho): 2 caracter\u00edsticas, com uma p\u00edlula vermelha "IGNORE" que some depois, 40 segundos. N3 (carga total): as 3 caracter\u00edsticas ao mesmo tempo, 60 segundos.']),
    Q('Como \u00e9 o resultado do TPV-SET?', ['resultado', 'pontuacao', 'escore', 'percentual', 'faixas', 'escore geral', 'baixo intermediario alto', 'estabilidade', 'estavel'],
      ['N\u00e3o h\u00e1 nota normativa: o escore \u00e9 livre, em porcentagem de SETs corretos, por n\u00edvel e geral. As faixas descritivas provis\u00f3rias s\u00e3o Baixo (menos de 33%), Intermedi\u00e1rio (33% a 66%) e Alto (mais de 66%). O escore geral \u00e9 ponderado: N1 peso 1, N2 peso 2 e N3 peso 3, s\u00f3 com os n\u00edveis aplicados.',
       'Tamb\u00e9m h\u00e1 um indicador de estabilidade entre as 3 rodadas: amplitude at\u00e9 25 pontos percentuais \u00e9 "est\u00e1vel", acima disso "vari\u00e1vel". Valor baixo e est\u00e1vel sugere fragilidade real; baixo e vari\u00e1vel sugere inconsist\u00eancia ou distra\u00e7\u00e3o pontual.']),
    Q('O que s\u00e3o acertos, erros e omiss\u00f5es no TPV-SET?', ['erro', 'erros', 'falso set', 'falsos sets', 'omissao', 'omissoes', 'acertos', 'impulsividade', 'indicadores'],
      ['Acerto \u00e9 um trio alinhado que forma um SET v\u00e1lido. Erro (falso SET) \u00e9 um trio alinhado que n\u00e3o forma SET e, segundo o manual, dialoga com o controle inibit\u00f3rio: muitos falsos SETs sugerem poss\u00edvel impulsividade. Omiss\u00e3o \u00e9 um SET alinhado que existia e n\u00e3o foi marcado.',
       'O resultado tamb\u00e9m traz a velocidade m\u00e9dia entre cliques, o tempo m\u00e9dio at\u00e9 o 1\u00ba clique e o tempo m\u00e9dio para completar a rodada (quanto menor, melhor).']),
    Q('Como aplico o TPV-SET?', ['aplicar', 'aplicacao', 'treino', 'fluxo', 'nova aplicacao', 'como aplico'],
      ['No painel, aba Percep\u00e7\u00e3o > TPV-SET: clique em "Nova Aplica\u00e7\u00e3o", escolha o paciente e os n\u00edveis, e gere o link (aplica\u00e7\u00e3o remota) ou aplique localmente. Antes de valer, o paciente faz um treino com feedback e exemplos de SET v\u00e1lido e inv\u00e1lido. O PDF \u00e9 gerado pelo painel.',
       '\u00c9 gratuito.']),
    Q('Como interpreto o TPV-SET?', ['interpretar', 'interpretacao', 'interpreto', 'resultado significa', 'resultado quer dizer', 'exploratorio', 'validacao'],
      ['Valores muito baixos, principalmente se est\u00e1veis nas tr\u00eas rodadas, sugerem fragilidade de percep\u00e7\u00e3o ou velocidade; valores altos indicam boa percep\u00e7\u00e3o. A faixa intermedi\u00e1ria fica "em aberto" at\u00e9 haver norma.',
       'O TPV-SET \u00e9 gratuito e explorat\u00f3rio, sem valida\u00e7\u00e3o formal nem normatiza\u00e7\u00e3o: use como fonte de hip\u00f3teses, dentro de uma avalia\u00e7\u00e3o ampla, nunca isoladamente.'])
  ]);

  // ---------- TFLOD ----------
  P('tflod', 'linguagem', 'tflod', ['O que \u00e9 o TFLOD?', 'Como aplico o TFLOD?', 'O que \u00e9 o PCPM?', 'Quanto custa o TFLOD?'], [
    Q('Como aplico o TFLOD?', ['aplicar', 'aplicacao', 'como aplico', 'passo a passo', 'microfone', 'volume', 'barra de volume', 'captacao', 'ambiente silencioso'],
      ['No painel, aba Linguagem > TFLOD: "Nova Aplica\u00e7\u00e3o", preencha nome, nascimento, escolaridade e sexo, e gere o link do paciente ou use "Aplicar Localmente". O paciente confere o microfone (o bot\u00e3o s\u00f3 libera depois que a voz \u00e9 detectada), l\u00ea as instru\u00e7\u00f5es e, ao iniciar, l\u00ea o texto em voz alta por 1 minuto, com uma barra de volume ao vivo.',
       'Boa capta\u00e7\u00e3o \u00e9 essencial: pe\u00e7a leitura em bom volume, perto do microfone e em ambiente silencioso.']),
    Q('O que \u00e9 o PCPM?', ['pcpm', 'palavras corretas por minuto', 'fluencia', 'metricas', 'metrica', 'acertos', 'erros', 'palavras alcancadas', 'lcs', 'o que mede'],
      ['PCPM \u00e9 Palavras Corretas Por Minuto: junta velocidade e precis\u00e3o numa s\u00f3 m\u00e9trica (palavras lidas corretamente x 60 / tempo em segundos). Junto v\u00eam acertos, erros (omiss\u00f5es, substitui\u00e7\u00f5es e trocas fonol\u00f3gicas) e as palavras alcan\u00e7adas no texto.',
       'O alinhamento entre o que foi lido e o texto usa o algoritmo LCS (maior subsequ\u00eancia comum), que acha as palavras corretas mesmo com inser\u00e7\u00f5es, omiss\u00f5es ou repeti\u00e7\u00f5es no meio.']),
    Q('Qual \u00e9 o PCPM esperado por ano escolar?', ['esperado', 'media esperada', 'faixas', 'classificacao', 'ano escolar', 'escolaridade', 'superior', 'insuficiente', 'limitrofe'],
      ['Para crian\u00e7as, as m\u00e9dias de refer\u00eancia s\u00e3o aproximadamente: 1\u00ba ano 53, 2\u00ba ano 72, 3\u00ba ano 92, 4\u00ba ano 112, 5\u00ba ano 127, 6\u00ba e 7\u00ba anos 140 a 145 PCPM. Para adultos (8\u00ba ano em diante), cerca de 150 ou mais.',
       'A classifica\u00e7\u00e3o vai de Superior, M\u00e9dia Superior, M\u00e9dia, M\u00e9dia Inferior, Lim\u00edtrofe at\u00e9 Insuficiente. As faixas s\u00e3o refer\u00eancias da literatura (Hasbrouck e Tindal; PROLEC), n\u00e3o normas amostrais nacionais deste instrumento.']),
    Q('A transcri\u00e7\u00e3o do TFLOD corrige os erros?', ['transcricao', 'transcreve', 'whisper', 'literal', 'correcao automatica', 'trocas fonologicas', 'dislexia', 'processar'],
      ['N\u00e3o. O \u00e1udio \u00e9 transcrito por IA (Whisper) de forma literal, sem corre\u00e7\u00e3o autom\u00e1tica, preservando trocas fonol\u00f3gicas (p/b, t/d, f/v), invers\u00f5es e omiss\u00f5es, o que permite uma an\u00e1lise qualitativa de ind\u00edcios de dislexia.',
       'O paciente s\u00f3 l\u00ea e envia o \u00e1udio; a transcri\u00e7\u00e3o \u00e9 feita depois, no painel, quando voc\u00ea clica em "Processar". Se o servi\u00e7o oscilar, basta clicar de novo, sem custo extra.']),
    Q('O TFLOD pede para refazer quando a leitura \u00e9 muito ruim?', ['refazer', 'leitura dificil', 'leitor com dificuldade', 'falha tecnica', 'audio ruim', 'audio vazio', 'transcricao vazia', 'pcpm baixo'],
      ['Leitura muito dif\u00edcil n\u00e3o \u00e9 falha t\u00e9cnica: quem l\u00ea devagar, baixinho, com pausas e trocas gera um PCPM baixo que \u00e9 um resultado cl\u00ednico leg\u00edtimo, e o sistema o registra assim.',
       'O teste s\u00f3 trata como falha t\u00e9cnica (pedindo para refazer) quando o \u00e1udio realmente n\u00e3o traz leitura reconhec\u00edvel: transcri\u00e7\u00e3o vazia, som sem fala articulada ou padr\u00e3o de repeti\u00e7\u00e3o an\u00f4malo.']),
    Q('Como interpreto o TFLOD?', ['interpretar', 'interpretacao', 'interpreto', 'resultado significa', 'resultado quer dizer', 'abaixo do esperado', 'fluencia fragilizada'],
      ['Um PCPM abaixo do esperado para a escolaridade sugere flu\u00eancia fragilizada e indica aprofundar a avalia\u00e7\u00e3o; n\u00e3o \u00e9 conclus\u00e3o diagn\u00f3stica isolada. O TFLOD \u00e9 um rastreio sem valida\u00e7\u00e3o normativa brasileira formal.']),
    Q('Que textos o TFLOD usa?', ['texto', 'textos', 'palavras', '148', '247', 'crianca adulto', 'qual texto'],
      ['Crian\u00e7as de 6 a 12 anos leem um texto infantil de 148 palavras; a partir de 13 anos, um texto adulto de 247 palavras. A leitura dura 1 minuto.'])
  ]);

  // ---------- TETaylor ----------
  P('tetaylor', 'visuoconstrutivo', 'tetaylor', ['O que \u00e9 o TETaylor?', 'O paciente desenha na tela?', 'Como \u00e9 o resultado do TETaylor?', 'Qual a diferen\u00e7a para a vers\u00e3o simplificada?'], [
    Q('O paciente desenha na tela?', ['desenha', 'desenho', 'tela', 'papel', 'folha', 'lapis', 'copia', 'copiar', 'como funciona o teste', 'o que faz', 'material'],
      ['N\u00e3o. O avaliador mostra a figura na tela e o paciente desenha em uma folha de papel separada; a pontua\u00e7\u00e3o dos elementos \u00e9 registrada no sistema. Tenha papel em branco e l\u00e1pis ou caneta \u00e0 m\u00e3o antes de come\u00e7ar.',
       'Use uma folha para a c\u00f3pia e outra para a reprodu\u00e7\u00e3o de mem\u00f3ria, porque a pessoa n\u00e3o pode ver a c\u00f3pia enquanto reproduz de mem\u00f3ria. A aplica\u00e7\u00e3o \u00e9 local (n\u00e3o h\u00e1 link para o paciente).']),
    Q('Como \u00e9 o resultado do TETaylor?', ['resultado', 'pontuacao', 'escore', 'score', 'elementos', 'bruto', 'ajustado', 'escore equivalente', 'normas', 'casarotti'],
      ['S\u00e3o 18 elementos, cada um de 0 a 2 pontos (total de 0 a 36), pontuados por precis\u00e3o e posi\u00e7\u00e3o. O resultado traz: score bruto, score ajustado por idade e escolaridade, escore equivalente (0 a 4) e classifica\u00e7\u00e3o. As normas seguem Casarotti et al. (2014).']),
    Q('Como interpreto o TETaylor?', ['interpretar', 'interpretacao', 'interpreto', 'copia x memoria', 'resultado significa', 'resultado quer dizer', 'copia preservada'],
      ['Compare as duas etapas: boa c\u00f3pia com m\u00e1 reprodu\u00e7\u00e3o aponta para mem\u00f3ria visual; c\u00f3pia j\u00e1 ruim aponta para constru\u00e7\u00e3o visuoespacial ou planejamento. A pontua\u00e7\u00e3o depende do seu julgamento sobre cada elemento, ent\u00e3o siga os crit\u00e9rios padronizados. Idade, escolaridade e corre\u00e7\u00e3o visual influenciam.']),
    Q('Qual a diferen\u00e7a para a vers\u00e3o simplificada?', ['simplificada', 'simplificado', 'qual usar', 'qual versao', 'baixa escolaridade', 'diferenca'],
      ['A completa tem 18 elementos, vale para adultos de 19 a 98 anos e usa normas de Casarotti et al. (2014). A simplificada tem 12 elementos e \u00e9 para adultos e idosos com baixa escolaridade, com normas de de Paula et al. (2016). Escolha pela escolaridade e pelo objetivo: misturar normas invalida a leitura.'])
  ]);

  // ---------- TETaylorSimp ----------
  P('tetaylorsimp', 'visuoconstrutivo', 'tetaylorsimp', ['O que \u00e9 o TETaylorSimp?', 'Quando usar a vers\u00e3o simplificada?', 'Como \u00e9 o resultado do TETaylorSimp?', 'O paciente desenha na tela?'], [
    Q('Quando usar a vers\u00e3o simplificada?', ['quando usar', 'qual usar', 'indicacao', 'baixa escolaridade', 'por que simplificada', 'efeito de piso', 'diferenca', 'completa'],
      ['Para adultos e idosos, especialmente com baixa escolaridade, em quem a vers\u00e3o completa pode ser dif\u00edcil demais e gerar efeito de piso: instrumentos muito complexos penalizam a pessoa por motivos que n\u00e3o s\u00e3o cl\u00ednicos. A figura simplificada, com normas pr\u00f3prias, deixa a avalia\u00e7\u00e3o mais justa.',
       'Escolha a vers\u00e3o pela escolaridade e pelo objetivo: misturar normas invalida a leitura.']),
    Q('Como \u00e9 o resultado do TETaylorSimp?', ['resultado', 'pontuacao', 'escore', 'score', 'z score', 'zscore', 'percentil', 'elementos', 'normas', 'de paula'],
      ['S\u00e3o 12 elementos, cada um de 0 a 2 pontos (total de 0 a 24). O resultado vem em score bruto, Z-score (quantos desvios-padr\u00e3o da m\u00e9dia normativa), percentil e classifica\u00e7\u00e3o. Diferentemente da vers\u00e3o completa, n\u00e3o usa o escore equivalente de 0 a 4.',
       'As normas s\u00e3o de de Paula et al. (2016, N=100), uma amostra brasileira. Use s\u00f3 para a popula\u00e7\u00e3o compat\u00edvel.']),
    Q('O paciente desenha na tela?', ['desenha', 'desenho', 'tela', 'papel', 'folha', 'lapis', 'copia', 'copiar', 'como funciona o teste', 'o que faz', 'material'],
      ['N\u00e3o. O avaliador mostra a figura na tela e o paciente desenha em uma folha de papel separada, uma para a c\u00f3pia e outra para a reprodu\u00e7\u00e3o de mem\u00f3ria. A aplica\u00e7\u00e3o \u00e9 local: voc\u00ea usa o computador e registra a pontua\u00e7\u00e3o no sistema.']),
    Q('Como interpreto o TETaylorSimp?', ['interpretar', 'interpretacao', 'interpreto', 'z score muito negativo', 'resultado significa', 'resultado quer dizer'],
      ['Z-score muito negativo (percentil baixo) sugere desempenho abaixo do esperado para o grupo normativo. Comparar a c\u00f3pia com a mem\u00f3ria ajuda a separar dificuldade construtiva de dificuldade de mem\u00f3ria visual. A leitura deve integrar o contexto cl\u00ednico.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-b.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote B (aba Inteligencia e AH/SD: IDEIA, BRPI, BAFC)
// Fonte: painel (site/online/index.html) e manuais manual-ideia/brpi/bafc.html, lidos em 27/11/2026.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  var ABA_DE = L._deepAba = L._deepAba || {};
  function P(id, aba, prog, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; ABA_DE[id] = [aba, prog]; }
  function Q(chip, g, r) { return { chip: chip, g: g, r: r }; }

  // ---------- IDEIA ----------
  P('ideia', 'inteligencia', 'ideia', ['O que \u00e9 o IDEIA?', 'Como funciona o IDEIA?', 'O que o IDEIA mede?', 'Como o IDEIA classifica?'], [
    Q('Como funciona o IDEIA?', ['como funciona o teste', 'o que faz', 'paciente faz', 'tarefa', 'blocos', 'estimulos', 'usos alternativos', 'escuta continua', 'microfone', 'silencio'],
      ['A pessoa fala em voz alta usos alternativos para 20 est\u00edmulos, em 4 blocos de dificuldade crescente: objetos concretos (tijolo, clipe, jornal...), objetos menos \u00f3bvios (meia velha, el\u00e1stico, caixa...), conceitos abstratos (sil\u00eancio, zero, sombra...) e combina\u00e7\u00f5es (guarda-chuva + rel\u00f3gio...). O tempo m\u00e1ximo \u00e9 de 10 minutos, em segundo plano.',
       'O microfone fica ativo o tempo todo e registra cada ideia sem interromper. Depois de cerca de 20 segundos de sil\u00eancio, o sistema pergunta se a pessoa esgotou as ideias ou quer continuar, e h\u00e1 um bot\u00e3o para passar ao pr\u00f3ximo item. Precisa de microfone funcionando e ambiente silencioso.']),
    Q('O que o IDEIA mede?', ['mede', 'medir', 'metricas', 'metrica', 'fluencia', 'flexibilidade', 'originalidade', 'elaboracao', 'guilford', 'o que avalia'],
      ['O \u00e1udio \u00e9 transcrito por IA (Whisper) e analisado por IA (Gemini), que avalia cada ideia nos quatro pilares de Guilford: Flu\u00eancia (quantidade de ideias v\u00e1lidas), Flexibilidade (quantas categorias diferentes de uso), Originalidade (qu\u00e3o incomuns s\u00e3o as ideias, escala de 1 a 5) e Elabora\u00e7\u00e3o (n\u00edvel de detalhe, escala de 1 a 3).',
       'Tamb\u00e9m traz velocidade (ideias por minuto), curva temporal, repeti\u00e7\u00f5es (ideias parecidas, que indicam persevera\u00e7\u00e3o) e itens alcan\u00e7ados (de 20).']),
    Q('Como o IDEIA classifica?', ['classifica', 'classificacao', 'faixa etaria', 'faixas', 'tabela', 'tipica', 'acima da media', 'excepcional', 'media de ideias', 'normas'],
      ['A classifica\u00e7\u00e3o usa a m\u00e9dia de ideias por item alcan\u00e7ado, ajustada pela idade. O teste \u00e9 o mesmo para todas as idades. Faixas (T\u00edpica / Acima da m\u00e9dia / Alta criatividade-AH/SD / Excepcional): 6-7 anos: 3-5 / 6-7 / 8-11 / 12+; 8-9 anos: 3-5 / 6-8 / 9-12 / 13+; 10-11 anos: 3-6 / 7-9 / 10-13 / 14+.',
       '12-13 anos: 3-6 / 7-9 / 10-14 / 15+; 14-17 anos: 3-7 / 8-10 / 11-15 / 16+; adultos (18+): 3-6 / 7-10 / 10-15 / 20+. Aten\u00e7\u00e3o: s\u00e3o estimativas baseadas na literatura (Guilford, Torrance), sem valida\u00e7\u00e3o normativa brasileira formal; normas definitivas dependem de coleta de amostra.']),
    Q('O IDEIA serve para altas habilidades?', ['altas habilidades', 'ah sd', 'superdotacao', 'superdotado', 'teto alto', 'criatividade alta', 'curva temporal', 'esgotamento'],
      ['Sim, \u00e9 especialmente \u00fatil no rastreio de Altas Habilidades/Superdota\u00e7\u00e3o. Ele adota o princ\u00edpio do "teto alto": n\u00e3o h\u00e1 limite de respostas, ent\u00e3o uma pessoa muito criativa pode ultrapassar o teto da pr\u00f3pria faixa et\u00e1ria, algo que instrumentos com limite fixo n\u00e3o captam.',
       'A curva temporal tamb\u00e9m ajuda: as ideias mais criativas costumam surgir depois do esgotamento das \u00f3bvias, e quem tem AH/SD tende a manter a produ\u00e7\u00e3o por mais tempo. \u00c9 rastreio, n\u00e3o diagn\u00f3stico.']),
    Q('Como compro cr\u00e9ditos do IDEIA?', ['comprar creditos', 'plano', 'planos', 'avulso', 'pacote', 'liberados', 'quando libera', 'creditos liberados'],
      ['Em "Comprar Cr\u00e9ditos" na aba do IDEIA h\u00e1 dois planos: Avulso (R$ 10, 1 aplica\u00e7\u00e3o) e Pacote 10 (R$ 80, R$ 8 cada). Depois do pagamento, os cr\u00e9ditos s\u00e3o liberados automaticamente em at\u00e9 5 minutos.'])
  ]);

  // ---------- BRPI ----------
  P('brpi', 'inteligencia', 'brpi', ['O que \u00e9 a BRPI?', 'O que cada m\u00f3dulo faz?', 'Como a BRPI l\u00ea as respostas?', 'A BRPI \u00e9 teste de QI?'], [
    Q('O que cada m\u00f3dulo faz?', ['quatro modulos', 'cada modulo', 'quais modulos', 'o que cada modulo faz', 'modulos da brpi', 'a b c d'],
      ['S\u00e3o quatro m\u00f3dulos independentes, que podem ser aplicados juntos (na ordem A a D) ou separadamente: A (Amplitude de Mem\u00f3ria: reter e reproduzir sequ\u00eancias, na ordem direta e inversa, por via auditiva e visual), B (Organiza\u00e7\u00e3o e Manipula\u00e7\u00e3o: reorganizar a informa\u00e7\u00e3o em ordem crescente e decrescente), C (Racioc\u00ednio Relacional: descobrir a regra que liga os elementos, em 7 n\u00edveis) e D (Integra\u00e7\u00e3o e Decis\u00e3o: racioc\u00ednio simb\u00f3lico com figuras).',
       'Os problemas s\u00e3o gerados por f\u00f3rmula, ent\u00e3o nunca s\u00e3o id\u00eanticos entre aplica\u00e7\u00f5es. H\u00e1 duas tentativas por n\u00edvel, e o teto de cada trilha \u00e9 definido quando a pessoa erra as duas tentativas do mesmo n\u00edvel.']),
    Q('Como \u00e9 o m\u00f3dulo A da BRPI?', ['amplitude de memoria', 'sequencias', 'modulo', 'modulo a', 'ordem direta e inversa', 'memoria auditiva', 'modalidade'],
      ['O m\u00f3dulo A pergunta quanto a pessoa consegue conservar e reproduzir. Apresenta sequ\u00eancias que crescem de 2 at\u00e9 13 itens, alternando n\u00fameros e letras, ouvidas (voz sintetizada) ou vistas na tela, para reproduzir na mesma ordem ou de tr\u00e1s para frente. A pessoa responde escolhendo entre op\u00e7\u00f5es visuais, e cada op\u00e7\u00e3o errada representa um tipo de falha: ordem trocada, item substitu\u00eddo, sequ\u00eancia mais curta (omiss\u00e3o) ou sequ\u00eancia invertida.']),
    Q('Como \u00e9 o m\u00f3dulo B da BRPI?', ['organizacao', 'manipulacao', 'modulo', 'modulo b', 'ordenar', 'crescente', 'decrescente', 'reorganizar'],
      ['O m\u00f3dulo B pergunta se a pessoa consegue reorganizar o que conservou: ela recebe uma sequ\u00eancia e precisa orden\u00e1-la em ordem crescente ou decrescente. Isso separa manter a informa\u00e7\u00e3o de operar sobre ela: bom desempenho no A com queda no B \u00e9 uma dissocia\u00e7\u00e3o cl\u00ednica informativa. Os erros s\u00e3o classificados (identidade, omiss\u00e3o, ordena\u00e7\u00e3o incompleta, regra na dire\u00e7\u00e3o contr\u00e1ria e persevera\u00e7\u00e3o).']),
    Q('Como \u00e9 o m\u00f3dulo C da BRPI?', ['raciocinio relacional', 'modulo', 'modulo c', 'descobrir a regra', 'sete niveis', '7 niveis', 'regua de equivalencia', 'letras e numeros'],
      ['O m\u00f3dulo C avalia o racioc\u00ednio fluido: descobrir a regra que liga os elementos e aplic\u00e1-la, em 7 n\u00edveis crescentes, de uma transforma\u00e7\u00e3o simples (somar uma constante) at\u00e9 padr\u00f5es progressivos e revers\u00edveis. Cada alternativa representa uma hip\u00f3tese de racioc\u00ednio (soma, subtra\u00e7\u00e3o, multiplica\u00e7\u00e3o, divis\u00e3o, progress\u00e3o, regra invertida...), ent\u00e3o a escolha revela a estrat\u00e9gia usada.',
       'Letras e n\u00fameros usam a mesma matem\u00e1tica (A=0, B=1... J=9), com uma r\u00e9gua de equival\u00eancia vis\u00edvel na tela.']),
    Q('Como \u00e9 o m\u00f3dulo D da BRPI?', ['integracao', 'decisao', 'modulo', 'modulo d', 'raciocinio simbolico', 'figuras valem', 'regra muda', 'ouvir novamente'],
      ['O m\u00f3dulo D \u00e9 o mais complexo: cada figura vale um n\u00famero, definido por uma r\u00e9gua que muda a cada quest\u00e3o. A pessoa ret\u00e9m a associa\u00e7\u00e3o, faz a opera\u00e7\u00e3o pedida e traduz o resultado de volta para figuras. S\u00e3o 5 n\u00edveis em 4 condi\u00e7\u00f5es: D1 (informa\u00e7\u00e3o auditiva), D2 (visual), D3 (integra\u00e7\u00e3o das duas) e D4 (regra que pode mudar a cada quest\u00e3o).',
       'No n\u00edvel mais alto a opera\u00e7\u00e3o \u00e9 s\u00f3 falada, e o sistema registra quantas vezes a pessoa pediu para ouvir de novo, um indicador de como a aten\u00e7\u00e3o e a mem\u00f3ria de trabalho se sustentam.']),
    Q('Como a BRPI l\u00ea as respostas?', ['opcoes de resposta', 'janela', 'tipo de erro', 'tipos de erro', 'nenhuma das respostas', 'nra', 'padrao', 'modus operandi', 'tempo de resposta', 'perseveracao'],
      ['Cada op\u00e7\u00e3o errada foi constru\u00edda para representar um modo de errar com significado pr\u00f3prio, ent\u00e3o a escolha diz como a pessoa errou, e n\u00e3o s\u00f3 se errou. O sistema guarda o que foi apresentado, a op\u00e7\u00e3o escolhida e o tipo de comportamento dela, o tempo de resposta em milissegundos e a tentativa e o n\u00edvel.',
       'Todas as quest\u00f5es t\u00eam o bot\u00e3o "Nenhuma das respostas anteriores" (NRA), uma op\u00e7\u00e3o como as outras, cujo significado vem do conjunto das respostas. Um erro isolado diz pouco: o que importa \u00e9 o padr\u00e3o repetido. A BRPI registra comportamentos e n\u00e3o afirma inten\u00e7\u00f5es, honestidade nem diagn\u00f3sticos.']),
    Q('A BRPI \u00e9 teste de QI?', ['teste de qi', 'qi', 'normatizado', 'validado', 'validacao', 'wechsler', 'psicometrico', 'normas', 'limitacoes'],
      ['N\u00e3o. A BRPI \u00e9 um rastreio explorat\u00f3rio do processamento cognitivo, sem valida\u00e7\u00e3o psicom\u00e9trica nem amostra normativa, e n\u00e3o converte o desempenho em percentis. Ela gera hip\u00f3teses de trabalho, n\u00e3o diagn\u00f3sticos, e n\u00e3o substitui testes normatizados quando eles forem indicados.',
       'O foco \u00e9 o racioc\u00ednio fluido, a mem\u00f3ria de trabalho, as fun\u00e7\u00f5es executivas e a velocidade do racioc\u00ednio, com problemas novos a cada aplica\u00e7\u00e3o, para reduzir o peso do conhecimento pr\u00e9vio.']),
    Q('O que traz o relat\u00f3rio da BRPI?', ['relatorio', 'laudo', 'pdf', 'resultado', 'teto', 'span', 'grafico', 'escorregadas', 'exportar', 'planilha', 'analise integrada', 'inteligencia artificial'],
      ['Cada m\u00f3dulo gera seu relat\u00f3rio, com o resumo, o teto (ou span) em cada trilha, um gr\u00e1fico comparativo (por exemplo n\u00fameros x letras, auditivo x visual, direta x inversa), uma an\u00e1lise textual e o detalhamento tentativa a tentativa. L\u00e1 se distinguem as "escorregadas" (errar e acertar no mesmo n\u00edvel, que sugerem falha de aten\u00e7\u00e3o) dos erros repetidos perto do teto (limite da capacidade).',
       'A IA reune todos os m\u00f3dulos aplicados numa leitura integrada, que \u00e9 um apoio e n\u00e3o substitui seu julgamento. Os dados tamb\u00e9m podem ser exportados em planilha para pesquisa.']),
    Q('Que cuidados tenho ao aplicar a BRPI?', ['cuidados', 'aplicar', 'aplicacao', 'audio', 'som', 'ambiente silencioso', 'observacao direta', 'fones'],
      ['Use ambiente silencioso (principalmente nas tarefas auditivas), confirme que o \u00e1udio do dispositivo funciona e, sempre que poss\u00edvel, observe a pessoa durante a aplica\u00e7\u00e3o: hesita\u00e7\u00f5es, autocorre\u00e7\u00f5es e coment\u00e1rios espont\u00e2neos s\u00f3 o olhar cl\u00ednico presencial capta. A BRPI vale a partir de 6 anos e exige alfabetiza\u00e7\u00e3o inicial.'])
  ]);

  // ---------- BAFC ----------
  P('bafc', 'inteligencia', 'bafc', ['O que \u00e9 a BAFC?', 'Quais s\u00e3o as 4 \u00e1reas da BAFC?', 'Como a BAFC classifica?', 'Como aplico a BAFC?'], [
    Q('Quais s\u00e3o as 4 \u00e1reas da BAFC?', ['quatro areas', '4 areas', 'areas', 'memoria operacional', 'velocidade de processamento', 'inteligencia verbal', 'nao verbal', 'o que cada area faz', 'tarefa'],
      ['Mem\u00f3ria Operacional: d\u00edgitos falados por \u00e1udio (1 por segundo), na ordem direta (2 a 8 d\u00edgitos) e inversa (2 a 7); pontua de 0 a 26. Velocidade de Processamento e Aten\u00e7\u00e3o: 35 figuras com n\u00fameros de 2 algarismos, em 4 etapas (n\u00fameros pares, \u00edmpares, estrelas de cinco pontas e figuras vermelhas); o resultado \u00e9 um \u00edndice de efici\u00eancia.',
       'Intelig\u00eancia Verbal: 30 perguntas de m\u00faltipla escolha (sin\u00f4nimos, opostos, analogias, intrusos e frases). Intelig\u00eancia N\u00e3o-Verbal: 24 problemas de imaginar um molde dobrado e escolher o s\u00f3lido que se forma. A ordem \u00e9 sempre Mem\u00f3ria, Velocidade, Verbal e N\u00e3o-Verbal, e voc\u00ea escolhe quais aplicar.']),
    Q('Como a BAFC classifica?', ['classifica', 'classificacao', 'faixas', 'percentil', 'qi equivalente', 'escore ponderado', 'wechsler', 'deficitario', 'media superior', 'resultado'],
      ['O resultado de cada \u00e1rea \u00e9 comparado ao esperado para a mesma idade e classificado nas mesmas sete faixas dos laudos Wechsler: Deficit\u00e1rio, Lim\u00edtrofe, M\u00e9dia Inferior, M\u00e9dia, M\u00e9dia Superior, Superior e Muito Superior. O relat\u00f3rio mostra tamb\u00e9m o escore ponderado equivalente (m\u00e9dia 10), o QI equivalente (m\u00e9dia 100) e o percentil.']),
    Q('O que \u00e9 o \u00cdndice Cognitivo Global?', ['icg', 'indice cognitivo global', 'indice global', 'parcial', 'duas areas', 'media dos z', 'diferenca entre areas'],
      ['O ICG \u00e9 a m\u00e9dia dos escores Z das \u00e1reas aplicadas, com pesos iguais, convertida para a escala de QI (100 + 15 x Z m\u00e9dio) e classificada nas mesmas sete faixas. Exige no m\u00ednimo duas \u00e1reas e fica marcado como parcial quando s\u00e3o menos de quatro. Com uma \u00e1rea s\u00f3, o relat\u00f3rio mostra apenas o resultado dela.',
       'O relat\u00f3rio tamb\u00e9m destaca diferen\u00e7as de 15 pontos de QI ou mais entre duas \u00e1reas: mostram onde a pessoa vai melhor e onde pode precisar de apoio, sem indicar diagn\u00f3stico por si.']),
    Q('As normas da BAFC j\u00e1 valem?', ['normas', 'normas provisorias', 'cortes', 'cortes provisorios', 'piloto', 'validacao', 'experimental', 'fase de coleta', 'coleta de dados'],
      ['A BAFC est\u00e1 em fase de piloto. S\u00f3 a Mem\u00f3ria Operacional usa cortes de escalas Wechsler publicadas (WISC-IV, de 8 a 15 anos, e WAIS-III, de 16 a 89 anos). Os cortes de Velocidade, Verbal e N\u00e3o-Verbal s\u00e3o provis\u00f3rios e valem como uso experimental, at\u00e9 a calibra\u00e7\u00e3o com dados reais. O relat\u00f3rio traz esse aviso na primeira p\u00e1gina. Nenhum resultado isolado \u00e9 veredito.']),
    Q('Como aplico a BAFC?', ['aplicar', 'aplicacao', 'como aplico', 'nova aplicacao', 'link', 'celular', 'fones', 'som', 'oculos', 'treino', 'condicoes'],
      ['No painel, aba Intelig\u00eancia > BAFC: "Nova Aplica\u00e7\u00e3o", preencha os dados do paciente e marque as \u00e1reas. Voc\u00ea pode gerar o link (uso \u00fanico) ou aplicar no pr\u00f3prio aparelho. Funciona em celular, tablet e computador.',
       'Como instru\u00e7\u00f5es e tarefas s\u00e3o faladas, use fones ou caixa de som em ambiente silencioso. A corre\u00e7\u00e3o visual (\u00f3culos ou lentes) deve estar em uso. H\u00e1 tarefa de treino antes de cada \u00e1rea. A estimativa preliminar \u00e9 de 30 a 45 minutos para as quatro \u00e1reas.']),
    Q('O que o bot\u00e3o SAIR faz na BAFC?', ['botao sair', 'sair', 'pular area', 'pular', 'abandonado', 'nao realizado', 'concluido', 'status da area'],
      ['Durante a bateria, o bot\u00e3o SAIR (canto inferior esquerdo) oferece tr\u00eas op\u00e7\u00f5es: continuar, pular esta \u00e1rea (a bateria segue para a pr\u00f3xima) ou sair de tudo. Cada \u00e1rea fica com um status: Conclu\u00eddo, Abandonado (come\u00e7ou e foi pulada, ou a pessoa saiu ou fechou a p\u00e1gina), N\u00e3o realizado (prevista, mas a aplica\u00e7\u00e3o acabou antes) ou N\u00e3o selecionado. \u00c1reas abandonadas n\u00e3o entram nos \u00edndices.']),
    Q('Como funciona a \u00e1rea Verbal da BAFC?', ['area verbal', 'verbal', 'audio', 'ouvir', 'ponto de partida', 'itens', 'fases de audio', '13 anos'],
      ['S\u00e3o 30 itens com tr\u00eas fases: itens 1 a 8 tocam a pergunta e as respostas sozinhos (d\u00e1 para ouvir de novo at\u00e9 3 vezes); itens 9 a 22 t\u00eam o bot\u00e3o "Ouvir a pergunta", e a pessoa escolhe entre ouvir e ler; itens 23 a 30 s\u00e3o s\u00f3 leitura. A interrup\u00e7\u00e3o acontece com 4 erros seguidos.',
       'O ponto de partida depende da idade: de 8 a 12 anos come\u00e7a no item 1; a partir de 13 anos come\u00e7a no item 13, e os itens 1 a 12 contam como acertos se os itens 13 e 14 forem acertados. Errando o 13 ou o 14, o teste volta ao 12, 11, 10... at\u00e9 haver 2 acertos seguidos.']),
    Q('O que \u00e9 o IEP da \u00e1rea de Velocidade?', ['iep', 'indice de eficiencia', 'etapas', 'busca', 'figuras', 'estrelas', 'pares', 'impares', 'comissoes', 'omissoes'],
      ['O IEP (\u00edndice de efici\u00eancia de processamento) soma as quatro etapas: acertos divididos pelos segundos, reduzidos pela taxa de erros (comiss\u00f5es mais omiss\u00f5es sobre o total de alvos). Assim, ser r\u00e1pido errando muito n\u00e3o rende pontos. A pessoa toca "Terminei" ao acabar: n\u00e3o h\u00e1 interrup\u00e7\u00e3o.',
       'Cada etapa tem alvos e iscas (por exemplo, estrelas de quatro pontas n\u00e3o valem). O anexo do relat\u00f3rio traz ainda o indicador Busca, de 0 a 1, que mostra se a procura foi organizada; \u00e9 s\u00f3 observa\u00e7\u00e3o cl\u00ednica, sem norma, e n\u00e3o entra nos \u00edndices.']),
    Q('Como \u00e9 o relat\u00f3rio da BAFC?', ['relatorio', 'pdf', 'laudo', 'paginas', 'glossario', 'como ler', 'analise escrita'],
      ['O PDF \u00e9 gerado no painel, a partir dos resultados salvos, e tem 5 p\u00e1ginas, escritas para o profissional e tamb\u00e9m para quem n\u00e3o \u00e9 da \u00e1rea: resumo (dados, ICG, curva normal, perfil das quatro \u00e1reas e "Como ler este relat\u00f3rio"), cada \u00e1rea em linguagem simples com figuras e, por fim, a compara\u00e7\u00e3o entre \u00e1reas com uma an\u00e1lise escrita (pontos fortes, pontos de aten\u00e7\u00e3o e pr\u00f3ximos passos). Nesta fase n\u00e3o h\u00e1 cobran\u00e7a de cr\u00e9ditos.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-c.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote C (aba Reabilitacao: REOCUPA, LERMAIS, PRAt; o SMART esta em kb-programas.js)
// Fonte: painel (site/online/index.html) e manuais manual-reocupa/lermais/prat.html, lidos em 27/11/2026.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  var ABA_DE = L._deepAba = L._deepAba || {};
  function P(id, aba, prog, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; ABA_DE[id] = [aba, prog]; }
  function Q(chip, g, r) { return { chip: chip, g: g, r: r }; }
  var NAO_TESTE = 'N\u00e3o \u00e9 teste diagn\u00f3stico nem gera classifica\u00e7\u00e3o normativa: \u00e9 um apoio \u00e0 reabilita\u00e7\u00e3o, e a conduta cabe a voc\u00ea.';

  // ---------- REOCUPA ----------
  P('reocupa', 'reabilitacao', 'reocupa', ['O que \u00e9 o REOCUPA?', 'Como funciona uma sess\u00e3o?', 'Posso personalizar as perguntas?', 'E se o microfone falhar?'], [
    Q('Como funciona uma sess\u00e3o do REOCUPA?', ['como funciona uma sessao', 'sessao', 'passo a passo', 'paciente faz', 'o que faz', 'categoria'],
      ['Na aba Reabilita\u00e7\u00e3o, escolha o REOCUPA: 1) selecione ou preencha os dados do paciente; 2) se quiser, personalize as perguntas em "Configurar Perguntas"; 3) clique em "Iniciar Sess\u00e3o" (o programa abre em nova aba); 4) se o atendimento for por videochamada, compartilhe a tela com o paciente; 5) escolha a categoria de situa\u00e7\u00f5es-problema.',
       'O paciente l\u00ea a situa\u00e7\u00e3o em voz alta e responde; o programa registra o tempo e classifica a resposta automaticamente, e voc\u00ea confirma ou corrige a classifica\u00e7\u00e3o de cada uma. Ao final, os resultados s\u00e3o salvos e a evolu\u00e7\u00e3o fica registrada. H\u00e1 tamb\u00e9m os bot\u00f5es "Abrir Direto" e "Imprimir".']),
    Q('Posso personalizar as perguntas do REOCUPA?', ['personalizar', 'personalizar perguntas', 'configurar perguntas', 'editar perguntas', 'perguntas de acompanhamento', 'restaurar padrao', 'salvar perguntas', 'mudar perguntas'],
      ['Pode. Clique em "Configurar Perguntas" e edite a pergunta de acompanhamento de cada situa\u00e7\u00e3o, para estimular diferentes \u00e2ngulos de racioc\u00ednio conforme o objetivo terap\u00eautico. O cen\u00e1rio de cada situa\u00e7\u00e3o (em negrito) \u00e9 fixo; s\u00f3 a pergunta muda. Depois, "Salvar Perguntas", ou "Restaurar Padr\u00e3o" para voltar ao original.']),
    Q('O que o REOCUPA registra?', ['registra', 'registro', 'metricas', 'resultado', 'tempo de leitura', 'classificacao', 'evolucao', 'evolucao acumulativa', 'o que mede'],
      ['Tr\u00eas coisas: o tempo de leitura (quanto o paciente levou para ler a situa\u00e7\u00e3o em voz alta), a classifica\u00e7\u00e3o da resposta (uma leitura qualitativa da resposta adaptativa dada) e a evolu\u00e7\u00e3o acumulativa (o hist\u00f3rico ao longo das sess\u00f5es).',
       'N\u00e3o h\u00e1 escore normativo: a leitura mais rica \u00e9 a da evolu\u00e7\u00e3o entre sess\u00f5es, n\u00e3o a de uma sess\u00e3o isolada. ' + NAO_TESTE]),
    Q('E se o microfone falhar no REOCUPA?', ['microfone', 'microfone falhar', 'voz nao detectada', 'nao capta', 'mic mudo', 'permissao', 'cronometro', 'cronometrar manualmente', 'reconhecimento de voz'],
      ['Uma falha de microfone nunca interrompe o atendimento. Antes de iniciar, o programa faz um teste r\u00e1pido de microfone que n\u00e3o trava a sess\u00e3o, e o cron\u00f4metro \u00e9 sempre autom\u00e1tico: mesmo sem captar a voz (mic mudo, permiss\u00e3o negada, ambiente ruidoso), o tempo continua sendo registrado. Se preferir, voc\u00ea pode cronometrar manualmente.',
       'Se aparecer o aviso de que a voz n\u00e3o foi detectada, reposicione o microfone. Para o reconhecimento funcionar melhor, use ambiente silencioso e pe\u00e7a leitura em bom volume, perto do microfone.']),
    Q('Para que serve o REOCUPA?', ['para que serve', 'terapia ocupacional', 'objetivo', 'indicacao', 'respostas adaptativas', 'boas praticas'],
      ['\u00c9 um programa de reabilita\u00e7\u00e3o na linha da Terapia Ocupacional, para avaliar e acompanhar respostas adaptativas a situa\u00e7\u00f5es-problema do cotidiano. Escolha a categoria de situa\u00e7\u00f5es de acordo com o objetivo terap\u00eautico da sess\u00e3o, personalize as perguntas para acompanhar habilidades espec\u00edficas e registre suas observa\u00e7\u00f5es cl\u00ednicas para complementar o que o sistema capta.'])
  ]);

  // ---------- LERMAIS ----------
  P('lermais', 'reabilitacao', 'lermais', ['O que \u00e9 o LERMAIS?', 'Como funciona uma sess\u00e3o?', 'O que s\u00e3o os n\u00edveis?', 'O que \u00e9 o \u00cdndice LERMAIS?'], [
    Q('Como funciona uma sess\u00e3o do LERMAIS?', ['como funciona uma sessao', 'sessao', 'passo a passo', 'sortear texto', 'iniciar leitura', 'paciente faz', 'o que faz', 'gerar link', 'aplicar aqui', 'link de uso unico', 'copiar', 'whatsapp'],
      ['Na aba Reabilita\u00e7\u00e3o, escolha o LERMAIS e preencha os dados do paciente (e o n\u00edvel de dificuldade, se quiser). Depois h\u00e1 tr\u00eas caminhos: "Iniciar Sess\u00e3o" (abre em nova aba), "Gerar Link" (link de uso \u00fanico, com bot\u00f5es Copiar e WhatsApp) ou "Aplicar Aqui" (na hora, no mesmo aparelho).',
       'O paciente clica em "Sortear Texto", depois em "Iniciar Leitura" e l\u00ea em voz alta, no ritmo natural. O gr\u00e1fico mostra velocidade x precis\u00e3o em tempo real e, ao final, os resultados s\u00e3o salvos para comparar sess\u00f5es futuras. "Ver Evolu\u00e7\u00e3o do Paciente" mostra o hist\u00f3rico.']),
    Q('O que s\u00e3o os n\u00edveis de dificuldade do LERMAIS?', ['niveis', 'nivel', 'nivel de dificuldade', 'nivel 1', 'nivel 2', 'nivel 3', 'sem indicacao', 'texto curto', 'tamanho do texto', 'progressao', 'escada'],
      ['O n\u00edvel controla o tamanho do texto: N\u00edvel 3 (mais f\u00e1cil, 3 linhas), N\u00edvel 2 (intermedi\u00e1rio, 1 par\u00e1grafo) e N\u00edvel 1 (mais dif\u00edcil, 2 par\u00e1grafos). Nos n\u00edveis 1, 2 e 3 a idade n\u00e3o influencia o texto: um adulto e uma crian\u00e7a podem receber o mesmo, porque conta a capacidade atual de leitura.',
       'Funcionam como uma escada: comece no 3 e avance at\u00e9 o 1. Quando a leitura estiver consolidada, use "Sem indica\u00e7\u00e3o", que entrega o texto completo pela idade (6 a 12 anos, textos simples; 13 anos ou mais, textos reflexivos). \u00c9 \u00fatil em alfabetiza\u00e7\u00e3o inicial ou em reabilita\u00e7\u00e3o ap\u00f3s les\u00e3o neurol\u00f3gica.']),
    Q('O que s\u00e3o as m\u00e9tricas do LERMAIS?', ['metricas', 'metrica', 'ppm', 'precisao', 'fluencia', 'completude', 'indice lermais', 'como e calculado', 'o que mede', 'peso'],
      ['PPM \u00e9 a velocidade (palavras por minuto). Precis\u00e3o \u00e9 o percentual de palavras reconhecidas corretamente. Flu\u00eancia (de 0 a 10) mede a continuidade: cada pausa longa, de mais de 3 segundos, tira 1 ponto. Completude \u00e9 quanto do texto foi lido at\u00e9 finalizar.',
       'O \u00cdndice LERMAIS \u00e9 a m\u00e9dia ponderada de velocidade (30%), precis\u00e3o (40%) e flu\u00eancia (30%), com 150 PPM como refer\u00eancia de 100% de velocidade. A precis\u00e3o pesa mais: ler certo importa mais do que ler r\u00e1pido.']),
    Q('Como leio o gr\u00e1fico do LERMAIS?', ['grafico', 'scatter', 'como leio o grafico', 'interpretar', 'interpretacao', 'leitura apressada', 'leitura cuidadosa', 'evolucao'],
      ['No gr\u00e1fico, o ideal \u00e9 a pessoa caminhar, ao longo das sess\u00f5es, para o canto de alta velocidade e alta precis\u00e3o. Precis\u00e3o baixa com velocidade alta sugere leitura apressada; velocidade baixa com precis\u00e3o alta sugere leitura cuidadosa, mas lenta.',
       'Compare sess\u00f5es dentro do mesmo n\u00edvel (a coluna N\u00edvel do hist\u00f3rico ajuda): passar de um n\u00edvel mais curto para um mais longo j\u00e1 \u00e9 sinal de evolu\u00e7\u00e3o. ' + NAO_TESTE]),
    Q('PPM e precis\u00e3o apareceram como zero, o que fazer?', ['zero', 'ppm zero', 'precisao zero', 'nao captou', 'microfone', 'permissao do microfone', 'voz nao detectada', 'reconhecimento de voz'],
      ['Se PPM e Precis\u00e3o aparecerem como 0, o microfone n\u00e3o captou a voz. Repita a sess\u00e3o verificando a permiss\u00e3o do microfone no navegador (o \u00edcone de cadeado na barra de endere\u00e7o). O LERMAIS usa o reconhecimento de voz ao vivo do navegador, ent\u00e3o o microfone deve ficar perto da boca, em ambiente silencioso e com volume normal de fala.']),
    Q('Que textos o LERMAIS usa?', ['textos', 'texto', 'temas', 'tema', 'motivacionais', 'azul', 'rosa', 'amizade', 'familia'],
      ['Os textos s\u00e3o motivacionais e tratam de rela\u00e7\u00f5es sociais (amizade, fam\u00edlia, limites, ansiedade social, coopera\u00e7\u00e3o, autenticidade), o que torna a leitura tamb\u00e9m um est\u00edmulo socioemocional, \u00fatil para crian\u00e7as e adolescentes com dificuldades relacionais. Nos n\u00edveis 1 a 3 aparecem situa\u00e7\u00f5es reais, como bullying, mudan\u00e7a de casa, separa\u00e7\u00e3o dos pais ou conviver com um diagn\u00f3stico.',
       'O visual \u00e9 azul para meninos e rosa para meninas. Serve para quem j\u00e1 \u00e9 alfabetizado em portugu\u00eas, a partir de 6 anos, sem limite superior.'])
  ]);

  // ---------- PRAt ----------
  P('prat', 'reabilitacao', 'prat', ['O que \u00e9 o PRAt?', 'Como funciona uma sess\u00e3o?', 'O que o PRAt mede?', 'Onde fica a evolu\u00e7\u00e3o?'], [
    Q('Como funciona uma sess\u00e3o do PRAt?', ['como funciona uma sessao', 'sessao', 'passo a passo', 'iniciar atividade', 'tela cheia', 'finalizar', 'paleta', 'paciente faz', 'o que faz', 'quadrados'],
      ['Na aba Reabilita\u00e7\u00e3o, escolha o PRAt: 1) clique em "Iniciar Sess\u00e3o" (abre em nova aba); 2) preencha os dados do participante (nome, nascimento, sexo); 3) clique em "Iniciar Atividade" (entra em tela cheia, com cron\u00f4metro); 4) o participante clica nos quadrados e escolhe a cor na paleta; 5) ao terminar, clica em "Finalizar" para ver os resultados; 6) gere o PDF ou exporte o Excel para o prontu\u00e1rio.']),
    Q('O que o PRAt mede?', ['mede', 'medidas', 'metricas', 'acertos', 'erros', 'omissoes', 'trocas', 'acertos liquidos', 'desempenho', 'estrategia', 'varredura', 'mapeamento'],
      ['Acertos (associa\u00e7\u00f5es corretas de posi\u00e7\u00e3o para cor), erros, omiss\u00f5es (quadrados sem resposta, ind\u00edcio de desaten\u00e7\u00e3o), trocas (cor escolhida trocada por outra, ind\u00edcio de dificuldade de discrimina\u00e7\u00e3o ou monitoramento), acertos l\u00edquidos (acertos descontando os erros), tempo total e desempenho em segundos por figura.',
       'Al\u00e9m dos n\u00fameros, registra a estrat\u00e9gia de varredura visual e o mapeamento de coordenadas: uma varredura organizada (como linha a linha) costuma indicar melhor controle atencional do que uma busca aleat\u00f3ria.']),
    Q('Onde fica a evolu\u00e7\u00e3o do PRAt?', ['evolucao', 'historico', 'historico local', 'grafico de barras', 'navegador', 'perder historico', 'exportar', 'excel', 'pdf'],
      ['O PRAt guarda um hist\u00f3rico local por participante e mostra a evolu\u00e7\u00e3o em gr\u00e1fico de barras por aplica\u00e7\u00e3o: d\u00e1 para ver se os acertos l\u00edquidos sobem e se erros, omiss\u00f5es e tempo por figura diminuem.',
       'Aten\u00e7\u00e3o: o hist\u00f3rico fica registrado no navegador usado. Para n\u00e3o perder o acompanhamento, exporte o PDF ou o Excel para o prontu\u00e1rio ao final de cada sess\u00e3o.']),
    Q('Como interpreto o PRAt?', ['interpretar', 'interpretacao', 'interpreto', 'muitas omissoes', 'muitas trocas', 'boas praticas', 'resultado significa'],
      ['Muitas omiss\u00f5es apontam desaten\u00e7\u00e3o; muitas trocas apontam dificuldade de discrimina\u00e7\u00e3o ou monitoramento. Observe a estrat\u00e9gia de varredura, porque incentivar uma busca sistem\u00e1tica faz parte do treino. Compare aplica\u00e7\u00f5es: a leitura mais rica \u00e9 a da evolu\u00e7\u00e3o. Antes de come\u00e7ar, garanta corre\u00e7\u00e3o visual adequada e boa condi\u00e7\u00e3o de tela. ' + NAO_TESTE]),
    Q('Para quem \u00e9 o PRAt?', ['para quem', 'publico', 'populacao', 'idade', 'criancas', 'adultos', 'indicacao'],
      ['Para crian\u00e7as, adolescentes e adultos. \u00c9 um treino de aten\u00e7\u00e3o visual: o participante associa a posi\u00e7\u00e3o de quadrados a cores de refer\u00eancia, treinando varredura visual, foco atencional e controle da resposta.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-d.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote D (ferramentas do painel: Anamnese, Agenda, Prontuario, Pacientes)
// Fonte: painel (site/online/index.html) e manuais manual-anamnese/agenda/prontuario/pacientes.html, lidos em 27/11/2026.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  var ABA_DE = L._deepAba = L._deepAba || {};
  function P(id, aba, prog, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; if (aba) { ABA_DE[id] = [aba, prog]; } }
  function Q(chip, g, r, forte) { var q = { chip: chip, g: g, r: r }; if (forte) { q.forte = true; } return q; }

  // ---------- ANAMNESE (aba Anamnese) ----------
  P('anamnese', 'anamnese', '', ['O que \u00e9 a Anamnese?', 'Como uso a Anamnese?', 'Como personalizo a anamnese?', 'Quanto custa a Anamnese?'], [
    Q('Qual a diferen\u00e7a entre Personalizada e Infantil?', ['personalizada', 'infantil', 'diferenca', 'qual tipo', 'tipos', 'dois tipos', 'modelo fixo'],
      ['A Anamnese Personalizada \u00e9 ajust\u00e1vel: voc\u00ea escolhe quais se\u00e7\u00f5es incluir, edita perguntas e adiciona novas, adaptando ao seu estilo e ao perfil do paciente. A Anamnese Infantil \u00e9 um modelo fixo, voltado ao p\u00fablico infantil e respondido pelos respons\u00e1veis.',
       'Por exemplo, a anamnese de um idoso com queixa de mem\u00f3ria n\u00e3o precisa das mesmas se\u00e7\u00f5es de uma infantil. Ajustar as se\u00e7\u00f5es deixa o question\u00e1rio mais curto e relevante, o que aumenta a ades\u00e3o de quem responde.']),
    Q('Como o respons\u00e1vel responde?', ['como o responsavel responde', 'responsavel responde', 'quem responde', 'precisa instalar', 'instalar', 'celular do responsavel', 'sem instalar', 'receber respostas', 'onde aparecem'],
      ['O respons\u00e1vel abre o link no navegador do celular ou do computador, sem instalar nada e sem cadastro. Quando ele conclui, as respostas aparecem sozinhas na se\u00e7\u00e3o Resultados, no fim da aba; clique no resultado para visualizar ou gerar o PDF para o prontu\u00e1rio.',
       'Voc\u00ea tamb\u00e9m pode usar "Preencher Aqui" (presencial, na hora) ou "Imprimir". Enviar antes da primeira sess\u00e3o faz voc\u00ea chegar \u00e0 consulta j\u00e1 conhecendo o caso.']),
    Q('Como adiciono perguntas extras na anamnese?', ['perguntas extras', 'pergunta extra', 'adicionar pergunta', 'nova pergunta', 'texto longo', 'sim nao', 'texto curto', 'personalizar perguntas', 'editar perguntas'],
      ['Na Anamnese Personalizada, role at\u00e9 o final da aba: em "Personalizar Se\u00e7\u00f5es" marque ou desmarque os temas, edite perguntas existentes e, em "Perguntas Extras", digite o texto da pergunta, escolha o tipo (Texto longo, Texto curto ou Sim/N\u00e3o) e clique em "+ Adicionar".']),
    Q('Como configuro o cabe\u00e7alho do PDF da anamnese?', ['cabecalho', 'logo', 'cabecalho do pdf', 'configuracoes do pdf', 'crp', 'consultorio', 'cores', 'degrade', 'telefone', 'endereco', 'identificado'],
      ['No bot\u00e3o "Configura\u00e7\u00f5es do PDF" (no fim da aba) voc\u00ea define: logo (PNG ou JPG, clicando ou arrastando), nome do profissional, CRP, consult\u00f3rio ou cl\u00ednica, at\u00e9 tr\u00eas telefones, e-mail, endere\u00e7o e as cores (principal e secund\u00e1ria), com estilo Degrad\u00ea, Cor s\u00f3lida, Textura (linhas) ou Textura (pontos), e um preview. Clique em "Salvar Configura\u00e7\u00f5es" e o PDF sai identificado com os seus dados.']),
    Q('A anamnese \u00e9 segura?', ['segura', 'seguranca', 'lgpd', 'dados sensiveis', 'sigilo', 'confidencial', 'privacidade', 'compartilhar link'],
      ['A anamnese cont\u00e9m informa\u00e7\u00f5es pessoais e de sa\u00fade. Compartilhe o link s\u00f3 com o pr\u00f3prio paciente ou respons\u00e1vel e trate as respostas com a confidencialidade exigida pela \u00e9tica profissional e pela LGPD. Ela organiza a hist\u00f3ria cl\u00ednica; a interpreta\u00e7\u00e3o e a conduta cabem a voc\u00ea, e a anamnese digital complementa a entrevista, n\u00e3o a substitui.'])
  ]);

  // ---------- AGENDA (aba Agenda) ----------
  P('agenda', 'agenda', '', ['O que \u00e9 a Agenda?', 'Como marco uma consulta?', 'Como sincronizo com o Google Calendar?', 'Como compartilho minha agenda?'], [
    Q('Que campos tem uma consulta?', ['campos', 'campos da consulta', 'duracao', 'tipo da consulta', 'observacoes', 'o que preencho', 'nova consulta', 'hora'],
      ['Em "+ Nova Consulta": paciente (da lista ou "+ Novo Paciente" para cadastrar na hora), nome, data, hora, tipo (digite ou selecione), dura\u00e7\u00e3o em minutos, observa\u00e7\u00f5es (motivo, queixa...) e recorr\u00eancia. Depois, "Agendar". H\u00e1 tamb\u00e9m os bot\u00f5es WhatsApp e Cancelar nessa tela.']),
    Q('Posso repetir uma consulta toda semana?', ['recorrencia', 'repetir', 'semanal', 'mensal', 'diario', 'toda semana', 'varias vezes', 'repeticao', 'consultas repetidas'],
      ['Pode. No campo Recorr\u00eancia escolha Nenhuma, Di\u00e1rio, Semanal ou Mensal e, em "Repetir", digite quantas vezes. A Agenda cria as consultas repetidas.']),
    Q('Posso cadastrar paciente na hora de agendar?', ['novo paciente', 'cadastrar na hora', 'paciente novo', 'cadastro rapido', 'primeira vez', 'ligou para marcar'],
      ['Pode. Na tela de nova consulta clique em "+ Novo Paciente" e informe nome, nascimento, sexo, WhatsApp e e-mail, depois "Cadastrar e Selecionar". \u00c9 \u00fatil quando algu\u00e9m liga para marcar pela primeira vez. Esse paciente passa a existir em todo o painel (testes, anamnese e prontu\u00e1rio).']),
    Q('Como funciona a agenda compartilhada?', ['agenda compartilhada', 'compartilhar agenda', 'compartilhar', 'autorizar', 'ver agenda de outro', 'colega', 'colegas', 'gerenciar', 'quem ve minha agenda'],
      ['Em "Agenda Compartilhada", clique em "Gerenciar" e informe o e-mail do profissional em "Autorizar profissional a ver minha agenda". Tamb\u00e9m d\u00e1 para ver a agenda de colegas que autorizaram voc\u00ea.',
       'Compartilhe com crit\u00e9rio: a agenda mostra hor\u00e1rios e nomes de pacientes. Autorize s\u00f3 colegas de confian\u00e7a e revise de tempos em tempos a lista de quem tem acesso.']),
    Q('O que aparece na tela da Agenda?', ['o que aparece', 'calendario', 'mes', 'semana', 'dia', 'consultas da semana', 'consultas do dia', 'tela da agenda'],
      ['O calend\u00e1rio mensal (com setas para navegar entre os meses e os dias com consultas marcados), as consultas da semana e as consultas do dia, al\u00e9m da conex\u00e3o com o Google Calendar e da agenda compartilhada. A consulta nova aparece no calend\u00e1rio e nas listas da semana e do dia.'])
  ]);

  // ---------- PRONTUARIO (aba Prontuario) ----------
  P('prontuario', 'prontuario', '', ['O que \u00e9 o Prontu\u00e1rio?', 'Como uso o Prontu\u00e1rio?', 'Quanto custa o Prontu\u00e1rio?', 'A transcri\u00e7\u00e3o saiu vazia'], [
    Q('Quanto custa uma sess\u00e3o no Prontu\u00e1rio?', ['planos', 'plano', 'pacote', 'avulso', 'comprar creditos', 'cada credito', 'preco da sessao', 'valor da sessao', 'quanto custa sessao', 'custa sessao', 'custo da sessao', 'valor sessao'],
      ['Cada cr\u00e9dito vale 1 sess\u00e3o (grava\u00e7\u00e3o, transcri\u00e7\u00e3o e organiza\u00e7\u00e3o por t\u00f3picos com IA). Voc\u00ea ganha 1 cr\u00e9dito gr\u00e1tis no cadastro. Depois: Avulso R$ 5 (1 sess\u00e3o), Pacote 10 por R$ 40 (R$ 4 cada) e Pacote 50 por R$ 150 (R$ 3 cada).']),
    Q('Como ficam a grava\u00e7\u00e3o e o resumo?', ['gravador', 'abrir gravador', 'resumir com ia', 'gerar prontuario', 'salvar em html', 'copiar texto', 'revisar', 'editar o texto', 'como salvo', 'resumo', 'salvar', 'resumir'],
      ['Clique em "Abrir Gravador" no perfil desejado: abre uma nova janela com o gravador e os t\u00f3picos. Grave a sess\u00e3o (o sistema transcreve sozinho) e, ao finalizar, clique em "Resumir com IA" (ou "Gerar Prontu\u00e1rio por T\u00f3picos"). A IA organiza a transcri\u00e7\u00e3o s\u00f3 nos t\u00f3picos do perfil: quanto mais espec\u00edficos, melhor o resultado.',
       'Os campos s\u00e3o edit\u00e1veis. Revise, corrija o que for preciso e salve em HTML ou copie o texto para o seu prontu\u00e1rio.']),
    Q('Dicas para a transcri\u00e7\u00e3o sair boa', ['dicas de gravacao', 'qualidade do audio', 'microfone', 'duas pessoas', 'transcricao vazia', 'transcricao ruim', 'permissao do microfone', 'ambiente silencioso', 'chrome'],
      ['Use ambiente silencioso, microfone razoavelmente pr\u00f3ximo e fala em volume normal; em sess\u00e3o com duas pessoas, posicione o microfone entre voc\u00eas. Se a transcri\u00e7\u00e3o vier vazia, confira a permiss\u00e3o do microfone no navegador (\u00edcone de cadeado na barra de endere\u00e7o). O gravador funciona melhor no Chrome, no computador ou no celular.',
       'Sempre revise a transcri\u00e7\u00e3o: nomes e termos t\u00e9cnicos podem sair trocados.']),
    Q('O Prontu\u00e1rio abre pelo link direto?', ['link direto', 'abrir direto', 'abre sem painel', 'acessar direto', 'so pelo painel', 'pagina direta'],
      ['N\u00e3o. O Prontu\u00e1rio s\u00f3 abre pelo painel, n\u00e3o \u00e9 poss\u00edvel acessar a p\u00e1gina diretamente. Isso protege o consumo de cr\u00e9dito e garante que a sess\u00e3o fique vinculada ao avaliador.']),
    Q('O Prontu\u00e1rio \u00e9 seguro? A IA escreve o prontu\u00e1rio?', ['seguro', 'seguranca', 'lgpd', 'sigilo', 'consentimento', 'anonimizacao', 'a ia escreve', 'ia e autora', 'rascunho'],
      ['A sess\u00e3o tem informa\u00e7\u00f5es muito sens\u00edveis. Antes de ir \u00e0 IA, os dados passam por anonimiza\u00e7\u00e3o. Mesmo assim: grave s\u00f3 com o consentimento do paciente, guarde os arquivos com seguran\u00e7a e n\u00e3o compartilhe o conte\u00fado fora do contexto cl\u00ednico.',
       'A IA \u00e9 apoio, n\u00e3o autora: o texto organizado \u00e9 um rascunho. Voc\u00ea revisa, corrige e assume a responsabilidade cl\u00ednica pelo registro final.']),
    Q('Como crio um perfil de t\u00f3picos?', ['criar perfil', 'novo perfil', 'perfil de topicos', 'topicos', 'salvar perfil', 'um topico por linha', 'varios perfis'],
      ['Clique em "+ Criar novo perfil", d\u00ea um nome (por exemplo "Anamnese", "Devolutiva", "Entrevista com professores") e escreva os t\u00f3picos, um por linha (como Queixa, Hist\u00f3rico, Observa\u00e7\u00f5es, Conduta). Depois "Salvar perfil". Cada perfil guarda seus t\u00f3picos separadamente, ent\u00e3o crie quantos precisar.'])
  ]);

  // ---------- PACIENTES (aba Pacientes) ----------
  P('pacientes', '', '', ['Como cadastro um paciente?', 'Como importo e exporto pacientes?', 'Como busco um paciente?', 'Para que serve a data de nascimento?'], [
    Q('Que dados tem o cadastro de paciente?', ['campos', 'dados do cadastro', 'o que preencho', 'obrigatorio', 'obrigatorios', 'cpf', 'escolaridade', 'lateralidade', 'correcao visual', 'campos obrigatorios'],
      ['Nome completo e data de nascimento s\u00e3o obrigat\u00f3rios. S\u00e3o opcionais: CPF, sexo, escolaridade, lateralidade (destro, canhoto ou ambidestro), e-mail, WhatsApp (usados para enviar links) e corre\u00e7\u00e3o visual (nenhuma, \u00f3culos ou lente de contato, relevante nos testes visuais). Clique em "+ Cadastrar Paciente".']),
    Q('Para que serve a data de nascimento?', ['data de nascimento', 'nascimento', 'idade', 'por que obrigatoria', 'id unico', 'normas por idade', 'escolaridade influencia'],
      ['A data de nascimento \u00e9 usada para calcular a idade, escolher normas e textos por faixa et\u00e1ria e gerar um ID \u00fanico do paciente. Preencha nascimento e escolaridade com cuidado, porque v\u00e1rios testes escolhem normas e materiais com base nesses campos.']),
    Q('Como importo e exporto pacientes?', ['importar csv', 'exportar csv', 'csv', 'importar', 'exportar', 'importar paciente', 'importar pacientes', 'importar lista', 'exportar paciente', 'exportar pacientes', 'backup', 'planilha', 'migrar'],
      ['"Exportar CSV" baixa a lista de pacientes (serve de backup ou para usar em planilha). "Importar CSV" traz uma lista de um arquivo, \u00fatil para migrar de outro sistema. Depois de importar, confira o resultado: nomes escritos de formas diferentes podem gerar duplicatas, e o "Verificar Duplicatas" ajuda. Fa\u00e7a o Exportar CSV de tempos em tempos como backup.']),
    Q('Como busco um paciente ou acho duplicatas?', ['buscar', 'busca', 'buscar paciente', 'achar paciente', 'duplicata', 'duplicatas', 'verificar duplicatas', 'cadastro repetido', 'repetido', 'parecido'],
      ['Use a barra de busca: ela encontra por nome, CPF ou e-mail. Ao digitar um cadastro novo, o sistema avisa em tempo real se j\u00e1 existe um paciente parecido, e o bot\u00e3o "Verificar Duplicatas" varre a lista em busca de cadastros repetidos para voc\u00ea organizar.'], true),
    Q('Como encerro minha conta?', ['encerrar conta', 'apagar conta', 'excluir conta', 'deletar conta', 'cancelar conta', 'encerrar'],
      ['No fim da aba Pacientes, o bot\u00e3o "Encerrar Conta" abre uma confirma\u00e7\u00e3o: voc\u00ea digita ENCERRAR e confirma. Aten\u00e7\u00e3o: \u00e9 irrevers\u00edvel e apaga todos os pacientes, todos os resultados de testes e escalas, o seu registro de usu\u00e1rio e a conta de acesso. Antes, use "Exportar CSV" e salve os PDFs que quiser guardar. Em caso de d\u00favida, fale com o S\u00e9rgio: ' + W + '.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

/* kb-prog-e.js */
// ============================================================
// LAUANA - RESPOSTAS DETALHADAS: lote E (aba Correcao: BVRT, ETDAH-PAIS, ETDAH-CriAd; e a aba Escalas)
// Fonte: painel (site/online/index.html), lido em 27/11/2026. Esses programas nao tem manual proprio: so se afirma o que a tela mostra.
// ============================================================
(function (g) {
  'use strict';
  var L = g.LAU, W = L.WHATS;
  var DEEP = L._deepDados = L._deepDados || {};
  function P(id, chips, qa) { DEEP[id] = { chips: chips, qa: qa }; }
  function Q(chip, g, r, forte) { var q = { chip: chip, g: g, r: r }; if (forte) { q.forte = true; } return q; }

  // ---------- BVRT ----------
  P('bvrt', ['O que \u00e9 o BVRT?', 'Que dados eu preencho?', 'O que fazem os bot\u00f5es?', 'Onde vejo as figuras e os erros?'], [
    Q('Que dados eu preencho no BVRT?', ['que dados', 'campos', 'o que preencho', 'preencho', 'preencher', 'o que digito', 'administracao a', 'administracao c', 'memoria', 'copia', 'escores', 'escore de acertos'],
      ['Primeiro os dados do paciente (escolha um cadastrado ou digite o nome), a idade em anos e a escolaridade (Fundamental, Ensino M\u00e9dio ou Superior). Depois os escores de cada administra\u00e7\u00e3o: Administra\u00e7\u00e3o A (Mem\u00f3ria) e Administra\u00e7\u00e3o C (C\u00f3pia).',
       'Em cada uma voc\u00ea informa o escore de acertos (0 a 10), o escore de erros e o n\u00famero de omiss\u00f5es, distor\u00e7\u00f5es, persevera\u00e7\u00f5es, rota\u00e7\u00f5es, trocas de posi\u00e7\u00e3o e erros de tamanho, al\u00e9m do total de erros do lado esquerdo e do direito.']),
    Q('O que fazem os bot\u00f5es do BVRT?', ['botoes', 'calcular resultados', 'gerar pdf', 'copiar para laudo', 'limpar', 'tabela pronta', 'z score', 'classificacao'],
      ['"Calcular Resultados" seleciona a norma correta pela idade e escolaridade e calcula o Z-Score e a classifica\u00e7\u00e3o. "Gerar PDF" gera o documento, "Copiar para Laudo" copia a tabela pronta para colar no seu laudo e "Limpar" apaga os campos para um novo paciente.']),
    Q('Onde vejo as figuras e os c\u00f3digos de erro do BVRT?', ['figuras', 'codigos de erro', 'consulta de figuras', 'codigos', 'tabela de erros', 'como classificar o erro', 'guia de erros'],
      ['Na parte de cima da aba h\u00e1 o link "Consulta de Figuras e C\u00f3digos de Erro", que abre uma p\u00e1gina de consulta para voc\u00ea conferir as figuras e os c\u00f3digos de cada tipo de erro enquanto corrige.']),
    Q('O BVRT aplica o teste no site?', ['aplica o teste', 'aplicar no site', 'paciente faz', 'o paciente responde', 'teste de papel', 'link para o paciente', 'correcao'],
      ['N\u00e3o. O BVRT \u00e9 uma ferramenta de corre\u00e7\u00e3o: voc\u00ea aplica o teste de papel e depois digita aqui os escores e os erros que contou. O programa s\u00f3 faz o c\u00e1lculo, seleciona a norma e monta a tabela para o laudo.'], true)
  ]);

  // ---------- ETDAH-PAIS (correcao) ----------
  P('etdah', ['O que \u00e9 o ETDAH-PAIS?', 'Como pontuo os itens?', 'Posso comparar v\u00e1rios respondentes?', 'Para que idade serve?'], [
    Q('Como pontuo os itens do ETDAH-PAIS?', ['pontuar', 'pontuacao', 'item', 'itens', 'cada item', 'escala de 1 a 6', 'nunca', 'muito frequente', 'inversao', 'inversoes', 'como preencho'],
      ['Marque a pontua\u00e7\u00e3o de cada item de 1 a 6: (1) Nunca, (2) Muito Pouco, (3) Pouco, (4) Geralmente, (5) Frequentemente, (6) Muito Frequente. O sistema aplica as invers\u00f5es dos itens necess\u00e1rios sozinho e calcula os percentis por sexo e faixa et\u00e1ria.']),
    Q('Posso comparar v\u00e1rios respondentes no ETDAH-PAIS?', ['respondentes', 'varios respondentes', 'mae e pai', 'professor', 'comparar', 'lado a lado', 'adicionar respondente', 'mais de um respondente'],
      ['Pode. O bot\u00e3o "+ Respondente" adiciona outro respondente (m\u00e3e, pai, professor...) e, no resultado, os perfis aparecem lado a lado para comparar. Informe o nome do respondente no campo "Respondente".']),
    Q('O ETDAH-PAIS \u00e9 para que idade? Quantos itens tem?', ['idade', 'faixa etaria', 'itens', 'fatores', '58 itens', 'normas', 'benczik', 'quantos itens'],
      ['O p\u00fablico-alvo \u00e9 de 2 a 17 anos. S\u00e3o 58 itens em 4 fatores, com normas por sexo e faixa et\u00e1ria (Benczik, 2018). \u00c9 respondido pelos pais ou respons\u00e1veis sobre o comportamento da crian\u00e7a ou do adolescente.']),
    Q('O ETDAH-PAIS aplica no site?', ['aplica no site', 'paciente faz', 'link para os pais', 'enviar link', 'correcao', 'digitar respostas'],
      ['Nesta aba ele funciona como corre\u00e7\u00e3o: voc\u00ea registra as respostas marcadas pelos pais e clica em "Calcular Resultados" para obter o escore geral e os percentis. "Limpar Tudo" apaga os campos.'], true)
  ]);

  // ---------- ETDAH-CriAd (correcao) ----------
  P('criad', ['O que \u00e9 o ETDAH-CriAd?', 'Quem responde?', 'Como pontuo os itens?', 'Para que idade serve?'], [
    Q('Quem responde o ETDAH-CriAd?', ['quem responde', 'autorrelato', 'autoavaliacao', 'a propria crianca', 'crianca responde', 'quem preenche', 'o que registro'],
      ['\u00c9 um instrumento de autorrelato: a pr\u00f3pria crian\u00e7a ou adolescente responde sobre si mesma. Nesta aba, voc\u00ea (o profissional) registra as respostas que ela deu durante a aplica\u00e7\u00e3o.']),
    Q('Como pontuo os itens do ETDAH-CriAd?', ['pontuar', 'pontuacao', 'itens', 'escala de 1 a 4', 'nunca', 'um pouco', 'as vezes', 'sempre', 'como preencho'],
      ['Cada item recebe de 1 a 4: (1) Nunca, (2) Um pouco, (3) \u00c0s vezes, (4) Sempre. Depois, informe nome, idade (de 6 a 15 anos) e sexo, e clique em "Calcular Resultados" para ver o escore geral. "Limpar" apaga os campos.']),
    Q('O ETDAH-CriAd \u00e9 para que idade? Quantos itens tem?', ['idade', 'faixa etaria', 'itens', 'fatores', '22 itens', 'normas', 'benczik', 'quantos itens'],
      ['O p\u00fablico-alvo \u00e9 de 6 a 15 anos. S\u00e3o 22 itens em 2 fatores, com normas por faixa et\u00e1ria (Benczik, 2018).'])
  ]);

  // ---------- ESCALAS (aba Escalas) ----------
  P('escalas', ['Como envio uma escala?', 'Quem \u00e9 o respondente?', 'Como imprimo em branco?', 'Como exporto os resultados?'], [
    Q('Quem \u00e9 o respondente da escala?', ['respondente', 'quem responde', 'proprio paciente', 'pai ou mae', 'professor', 'outro responsavel', 'se aplicavel'],
      ['\u00c9 quem vai responder a escala. Escolha "N/A (pr\u00f3prio paciente)" quando a pessoa responde sobre si, "Pai/M\u00e3e", "Professor(a)" ou "Outro respons\u00e1vel" quando a escala \u00e9 respondida por terceiros, como as escalas infantis.']),
    Q('Como imprimo uma escala em branco?', ['imprimir', 'imprimir em branco', 'formulario em branco', 'papel', 'impressao', 'imprimir formulario'],
      ['Em "Aplicar Escala", escolha a escala e clique em "Imprimir Formul\u00e1rio em Branco": sai o formul\u00e1rio para preenchimento manual, \u00fatil quando n\u00e3o d\u00e1 para responder no celular ou computador.']),
    Q('Como exporto os resultados das escalas?', ['exportar', 'exportar excel', 'excel', 'planilha', 'baixar resultados', 'exportar resultados'],
      ['Use o bot\u00e3o "Exportar Excel" no topo da aba para baixar os resultados das escalas em planilha.']),
    Q('Qual a diferen\u00e7a entre Gerar Link e Aplicar Aqui?', ['gerar link', 'aplicar aqui', 'diferenca', 'link ou aplicar', 'na hora', 'no mesmo aparelho'],
      ['"Gerar Link" cria um link de uso \u00fanico, que voc\u00ea copia ou envia pelo WhatsApp para a pessoa responder no celular ou no computador dela. "Aplicar Aqui" abre a escala no seu pr\u00f3prio aparelho para a pessoa responder na hora, na sua frente.']),
    Q('Como apago resultados de escalas?', ['apagar', 'apagar selecionados', 'excluir resultados', 'deletar resultados', 'remover resultado', 'limpar resultados'],
      ['Na lista de resultados, marque os que quer remover e clique em "Apagar Selecionados". Se for preciso guardar, use "Exportar Excel" antes.'])
  ]);
})(typeof window !== 'undefined' ? window : global);

// ============================================================
// LAUANA - WIDGET (a parte que aparece na pagina)
// - Vive dentro de um Shadow DOM: o CSS e o JS do site NAO interferem nela (nem ela neles).
// - Etapa 1: nao grava nada no servidor (recados, cidade, idioma).
// - Configuracao (opcional), antes de carregar o script:
//     window.LAUANA_CONFIG = { cena: true }   // mostra o "balcao" com a atendente logo abaixo do topo da pagina
// - Desligar numa visita: acrescente ?semlauana na URL.   Abrir direto: #lauana
// ============================================================
(function (g) {
  'use strict';
  if (g.__lauanaCarregada) { return; }
  if (/[?&]semlauana(\b|=)/.test(g.location.search)) { return; }
  g.__lauanaCarregada = true;
  var L = g.LAU, cfg = g.LAUANA_CONFIG || {};
  // Etapa 1 (padrao): nada e gravado. Etapa 2: a pagina liga com LAUANA_CONFIG = { gravar: true }.
  var GRAVAR = !!cfg.gravar && !!L.rede;
  L.config.gravar = GRAVAR; L.config.cidade = GRAVAR;
  // Etapa 3: IA como segunda chance (so liga se a pagina pedir: LAUANA_CONFIG = { gravar: true, ia: true })
  var IA = GRAVAR && !!cfg.ia && !!L.refinar;
  L.config.ia = IA;
  if (GRAVAR) { L.rede.api = cfg.api || 'https://ccdzxqdclufzryxzgtvq7t5wsi0javug.lambda-url.sa-east-1.on.aws'; }
  // Etapa 4: a mesma Lauana vale para 3 telas. modo: 'home' (padrao), 'painel' (profissional logado) ou 'paciente' (link do paciente)
  var MODO = (cfg.modo === 'painel' || cfg.modo === 'paciente') ? cfg.modo : 'home';
  var E = L.novoEstado(), ocupado = false, saudou = false, pendente = null;
  // Painel: a pagina informa em que aba/programa o profissional esta (cfg.contexto devolve { aba, programa }). A Lauana responde especifico.
  function contextoAtual() { try { return (typeof cfg.contexto === 'function') ? (cfg.contexto() || null) : null; } catch (e) { return null; } }
  function atualizarContexto() { if (MODO === 'painel' && L.definirContexto) { L.definirContexto(E, contextoAtual()); } }
  function emailAtual() { try { return String((typeof cfg.email === 'function' ? cfg.email() : cfg.email) || ''); } catch (e) { return ''; } }
  if (MODO === 'paciente') { GRAVAR = false; L.config.gravar = false; L.config.cidade = false; L.config.ia = false; IA = false; }   // paciente: nada sai do aparelho dele
  var FIG = "<g id=\"lauanaFig\"><ellipse cx=\"100\" cy=\"330\" rx=\"62\" ry=\"8\" fill=\"#00000026\"/><!-- cabelo atras --><path d=\"M58 70 Q56 20 100 18 Q144 20 142 70 Q152 100 142 120 Q128 104 126 82 L74 82 Q72 104 58 120 Q48 100 58 70 Z\" fill=\"#b0733a\"/><!-- pernas e sapatos --><rect x=\"84\" y=\"258\" width=\"12\" height=\"66\" fill=\"#eaa769\"/><rect x=\"104\" y=\"258\" width=\"12\" height=\"66\" fill=\"#eaa769\"/><ellipse cx=\"88\" cy=\"326\" rx=\"13\" ry=\"5\" fill=\"#222\"/><ellipse cx=\"112\" cy=\"326\" rx=\"13\" ry=\"5\" fill=\"#222\"/><!-- saia --><path d=\"M72 214 L128 214 L136 264 L64 264 Z\" fill=\"#2b2b2b\"/><!-- pescoco --><rect x=\"92\" y=\"108\" width=\"16\" height=\"26\" fill=\"#f0a96f\"/><!-- camisa --><path d=\"M68 134 Q100 122 132 134 L136 220 L64 220 Z\" fill=\"#a9dfe0\"/><path d=\"M68 134 L50 188 L64 196 L76 154 Z\" fill=\"#a9dfe0\"/><path d=\"M132 134 L150 188 L136 196 L124 154 Z\" fill=\"#a9dfe0\"/><path d=\"M50 188 L64 196 L62 214 L50 206 Z\" fill=\"#eaa769\"/><path d=\"M150 188 L136 196 L138 214 L150 206 Z\" fill=\"#eaa769\"/><!-- colete --><path d=\"M76 136 L96 154 L99 220 L68 220 Z\" fill=\"#6e6e74\"/><path d=\"M124 136 L104 154 L101 220 L132 220 Z\" fill=\"#6e6e74\"/><path d=\"M90 128 L100 146 L110 128 Z\" fill=\"#fff\"/><!-- cordao e cracha --><path d=\"M94 130 L106 160\" stroke=\"#333\" stroke-width=\"2\" fill=\"none\"/><rect x=\"100\" y=\"158\" width=\"16\" height=\"20\" rx=\"2\" fill=\"#fff\" stroke=\"#d09a2a\" stroke-width=\"2\"/><rect x=\"103\" y=\"162\" width=\"10\" height=\"3\" fill=\"#2e7d32\"/><rect x=\"103\" y=\"168\" width=\"10\" height=\"2\" fill=\"#999\"/><!-- rosto --><ellipse cx=\"100\" cy=\"74\" rx=\"32\" ry=\"37\" fill=\"#f6bb86\"/><ellipse cx=\"78\" cy=\"86\" rx=\"6\" ry=\"4\" fill=\"#f09a8a\" opacity=\".55\"/><ellipse cx=\"122\" cy=\"86\" rx=\"6\" ry=\"4\" fill=\"#f09a8a\" opacity=\".55\"/><!-- olhos --><ellipse cx=\"88\" cy=\"73\" rx=\"7\" ry=\"8\" fill=\"#fff\" stroke=\"#6b3b1b\" stroke-width=\"1.5\"/><ellipse cx=\"112\" cy=\"73\" rx=\"7\" ry=\"8\" fill=\"#fff\" stroke=\"#6b3b1b\" stroke-width=\"1.5\"/><circle cx=\"88\" cy=\"74\" r=\"4.6\" fill=\"#8a3b12\"/><circle cx=\"112\" cy=\"74\" r=\"4.6\" fill=\"#8a3b12\"/><circle cx=\"88\" cy=\"74\" r=\"2.2\" fill=\"#111\"/><circle cx=\"112\" cy=\"74\" r=\"2.2\" fill=\"#111\"/><circle cx=\"90\" cy=\"72\" r=\"1.3\" fill=\"#fff\"/><circle cx=\"114\" cy=\"72\" r=\"1.3\" fill=\"#fff\"/><path d=\"M80 62 Q88 57 96 62\" stroke=\"#7a4a20\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M104 62 Q112 57 120 62\" stroke=\"#7a4a20\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M100 78 Q98 86 102 86\" stroke=\"#c98a5c\" stroke-width=\"1.6\" fill=\"none\"/><path d=\"M89 94 Q100 104 111 94\" stroke=\"#8a3a2a\" stroke-width=\"2.4\" fill=\"#fff\" stroke-linecap=\"round\"/><!-- franja --><path d=\"M66 66 Q78 30 118 34 Q138 40 134 66 Q118 46 98 52 Q80 56 66 66 Z\" fill=\"#c88542\"/><!-- fone de ouvido --><path d=\"M64 74 Q62 26 100 24 Q138 26 136 74\" stroke=\"#262626\" stroke-width=\"5\" fill=\"none\"/><rect x=\"57\" y=\"62\" width=\"11\" height=\"26\" rx=\"5\" fill=\"#333\"/><rect x=\"132\" y=\"62\" width=\"11\" height=\"26\" rx=\"5\" fill=\"#333\"/><path d=\"M60 88 Q62 112 88 106\" stroke=\"#262626\" stroke-width=\"3\" fill=\"none\"/><circle cx=\"90\" cy=\"106\" r=\"4.5\" fill=\"#262626\"/></g>";                                           // desenho da Lauana (SVG), inserido na empacotagem

  var CSS = [
    ':host{all:initial;font-family:"Segoe UI",Tahoma,Arial,sans-serif}',
    '*{box-sizing:border-box}',
    '.balao{position:fixed;right:18px;bottom:18px;display:flex;align-items:flex-end;gap:8px;z-index:2147483000;background:none;border:0;padding:0;cursor:pointer;font:inherit}',
    '.rosto{width:70px;height:70px;border-radius:50%;background:#eaf3fb;border:3px solid #1a5276;box-shadow:0 4px 14px rgba(0,0,0,.3);overflow:hidden;flex:none}',
    '.rosto svg{width:100%;height:100%;display:block}',
    '.dica{background:#fff;color:#1a3b52;border-radius:14px 14px 4px 14px;padding:8px 12px;font-size:13px;line-height:1.35;box-shadow:0 3px 12px rgba(0,0,0,.25);max-width:180px;text-align:left;animation:sobe .4s ease both}',
    '.balao:focus-visible,.fechar:focus-visible,.chips button:focus-visible,.env:focus-visible,.cena button:focus-visible{outline:3px solid #f5a623;outline-offset:2px}',
    '.chat{position:fixed;right:18px;bottom:18px;width:360px;max-width:calc(100vw - 16px);height:520px;max-height:calc(100vh - 24px);background:#fff;border-radius:16px;box-shadow:0 10px 36px rgba(0,0,0,.4);display:none;flex-direction:column;overflow:hidden;z-index:2147483001}',
    '.chat.on{display:flex;animation:sobe .25s ease both}',
    '.topo{background:linear-gradient(135deg,#1a5276,#2e86c1);color:#fff;padding:9px 12px;display:flex;align-items:center;gap:10px}',
    '.topo .rosto{width:42px;height:42px;border-width:2px;border-color:#fff;box-shadow:none}',
    '.topo b{font-size:15px}.topo small{display:block;opacity:.88;font-size:12px}',
    '.fechar{margin-left:auto;background:none;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:0 4px}',
    '.msgs{flex:1;overflow-y:auto;padding:12px;background:#f4f8fb}',
    '.m{max-width:86%;padding:8px 12px;border-radius:14px;margin:6px 0;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;color:#222}',
    '.m.bot{background:#fff;border:1px solid #d6e6f2;border-bottom-left-radius:4px}',
    '.m.eu{background:#1a5276;color:#fff;margin-left:auto;border-bottom-right-radius:4px}',
    '.m.dig{color:#777;font-style:italic}',
    '.m a{color:#1565c0;word-break:break-all}',
    '.chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}',
    '.chips button{border:1px solid #1a5276;background:#fff;color:#1a5276;border-radius:16px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}',
    '.chips button:hover{background:#e3f1fb}',
    '.entrada{display:flex;border-top:1px solid #d9e2ea;background:#fff}',
    '.entrada input{flex:1;border:0;padding:13px;font:inherit;font-size:14px;outline:none;min-width:0}',
    '.env{border:0;background:#1a5276;color:#fff;padding:0 18px;font-size:17px;cursor:pointer}',
    '.cena{margin:24px auto;max-width:960px;padding:0}',
    '@media (max-width:1000px){.cena{margin:16px 12px}}',
    '.cena .cartao{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:center;background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.08);border-left:5px solid #2e86c1;padding:18px 22px}',
    '.cena svg.fig{width:250px;max-width:70vw;height:auto;flex:none}',
    '.cena .fala{flex:1;min-width:250px;max-width:460px}',
    '.cena h3{margin:0 0 6px;color:#1a5276;font-size:1.15rem}',
    '.cena p{margin:0 0 10px;color:#444;font-size:.95rem;line-height:1.5}',
    '.cena button{display:block;width:100%;text-align:left;margin-top:8px;border:2px solid #9cc9ea;background:#f3f9fe;color:#1a3b52;border-radius:12px;padding:10px 12px;font:inherit;font-size:.95rem;cursor:pointer}',
    '.cena button:hover{background:#dff0fc}',
    '.bob{animation:bob 3.2s ease-in-out infinite;transform-origin:50% 100%}',
    '@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
    '@keyframes sobe{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.bob,.dica,.chat.on{animation:none}}',
    '@media (max-width:480px){.chat{right:8px;bottom:8px;width:calc(100vw - 16px);height:min(560px,88vh)}.dica{max-width:150px}}',
    '.balao{transition:opacity .25s ease}',
    // celular: rostinho menor e mais colado no canto, respeitando a area segura do iPhone; chat pela altura REAL da tela (teclado aberto); 16px no campo evita o zoom do iPhone
    '@media (max-width:600px){.balao{right:calc(10px + env(safe-area-inset-right,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));opacity:.94}.balao .rosto{width:54px;height:54px;border-width:2px}.entrada input{font-size:16px}}',
    '@media (max-width:480px){.chat{right:calc(8px + env(safe-area-inset-right,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));height:min(560px,88dvh)}}',
    '@media (max-height:480px){.chat{height:calc(100dvh - 16px);bottom:8px}}',
    '@media print{:host{display:none!important}}'
  ].join('\n');

  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + FIG + '</defs></svg>';
  var ROSTO = '<svg viewBox="52 12 96 104" aria-hidden="true"><use href="#lauanaFig"/></svg>';
  function el(raiz, sel) { return raiz.querySelector(sel); }
  function criar(tag, cls, txt) { var d = document.createElement(tag); if (cls) { d.className = cls; } if (txt != null) { d.textContent = txt; } return d; }
  function hora() { return new Date().getHours(); }
  function idiomaNavegador() {
    var n = String(g.navigator && (g.navigator.language || '') || '').toLowerCase();
    if (n.indexOf('en') === 0) { return 'en'; } if (n.indexOf('es') === 0) { return 'es'; }
    var c = n.slice(0, 2);                                       // outro idioma: so com a IA ligada (e ela quem traduz) e so na pagina inicial
    return (IA && MODO === 'home' && /^[a-z]{2}$/.test(c) && c !== 'pt') ? c : '';
  }

  // ---------- balao + janela de conversa ----------
  var host = document.createElement('div'); host.id = 'lauana-host';
  var sh = host.attachShadow({ mode: 'open' });
  sh.innerHTML = '<style>' + CSS + '</style>' + DEFS +
    '<button class="balao" type="button" aria-label="Abrir o atendimento com a Lauana"><span class="dica" id="dica">Oi! Precisa de ajuda? \ud83d\ude0a</span><span class="rosto">' + ROSTO + '</span></button>' +
    '<div class="chat" role="dialog" aria-label="Atendimento com a Lauana"><div class="topo"><span class="rosto">' + ROSTO + '</span><div><b>Lauana</b><small>atendente virtual \u2022 online</small></div>' +
    '<button class="fechar" type="button" aria-label="Fechar o atendimento">\u00d7</button></div><div class="msgs" aria-live="polite"></div>' +
    '<form class="entrada" autocomplete="off"><input type="text" maxlength="500" placeholder="Escreva sua mensagem..." aria-label="Sua mensagem"><button class="env" type="submit" aria-label="Enviar">\u27a4</button></form></div>';
  var balao = el(sh, '.balao'), chat = el(sh, '.chat'), msgs = el(sh, '.msgs'), inp = el(sh, 'input'), form = el(sh, 'form');

  // texto -> bolha com links seguros (so setmonte.github.io e wa.me; telefone vira link do WhatsApp)
  var PERMITIDOS = /^https:\/\/(setmonte\.github\.io|wa\.me)\//;
  function preencher(no, texto) {
    var partes = String(texto).split(/(https:\/\/[^\s)]+|\(67\) 98423-3444)/);
    partes.forEach(function (p) {
      if (!p) { return; }
      var url = (p.indexOf('(67)') === 0) ? 'https://wa.me/5567984233444' : p.replace(/[.,;!?]+$/, '');
      if ((p.indexOf('https://') === 0 || p.indexOf('(67)') === 0) && PERMITIDOS.test(url)) {
        var a = criar('a', '', p); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; no.appendChild(a);
      } else { no.appendChild(document.createTextNode(p)); }
    });
  }
  function rolar() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(texto, cls) { var d = criar('div', 'm ' + cls); preencher(d, texto); msgs.appendChild(d); rolar(); return d; }
  function limparChips() { var c = msgs.querySelectorAll('.chips'); for (var i = 0; i < c.length; i++) { c[i].parentNode.removeChild(c[i]); } }
  function addChips(lista) {
    if (!lista || !lista.length) { return; }
    var box = criar('div', 'chips');
    lista.forEach(function (rot) { var b = criar('button', '', rot); b.type = 'button'; b.onclick = function () { enviar(rot); }; box.appendChild(b); });
    msgs.appendChild(box); rolar();
  }
  function mostrar(r, depois) {
    ocupado = true; var i = 0;
    (function prox() {
      if (i >= r.msgs.length) { ocupado = false; addChips(r.chips); if (depois) { depois(); } return; }
      var t = r.msgs[i], dig = addMsg('Lauana est\u00e1 digitando...', 'bot dig');
      setTimeout(function () { dig.className = 'm bot'; dig.textContent = ''; preencher(dig, t); rolar(); i++; prox(); }, Math.min(1300, 320 + String(t).length * 8));
    })();
  }
  function tirarDig(d) { if (d && d.parentNode) { d.parentNode.removeChild(d); } }
  // Entrega a resposta. Se ela precisa de traducao (idioma de fora), traduz antes, com "digitando...". Nunca fica muda: se falhar, mostra com aviso.
  function entregar(r) {
    if (IA && r && r.traduzir && L.traduzirSaida) {
      ocupado = true; var d1 = addMsg('Lauana est\u00e1 digitando...', 'bot dig');
      L.traduzirSaida(r).then(function (r2) { ocupado = false; tirarDig(d1); mostrar(r2 || r); }, function () { ocupado = false; tirarDig(d1); mostrar(r); });
      return;
    }
    mostrar(r);
  }
  function enviar(texto) {
    texto = String(texto || '').slice(0, 500);
    if (ocupado || !texto.trim()) { return; }
    limparChips(); addMsg(texto, 'eu');
    // Etapa 3b: mensagem em outro idioma (alem de en/es) -> traduz para portugues antes de o motor responder
    if (IA && L.precisaEntrada && L.precisaEntrada(texto, E)) {
      ocupado = true; var d0 = addMsg('Lauana est\u00e1 digitando...', 'bot dig');
      L.traduzirEntrada(texto, E).then(function (ent) { ocupado = false; tirarDig(d0); responder(texto, ent || {}); },
                                       function () { ocupado = false; tirarDig(d0); responder(texto, {}); });
      return;
    }
    responder(texto, {});
  }
  // ent: { texto } (mensagem ja em portugues), { crise } ou { falha } (respostas prontas), ou {} (processa o texto como veio)
  function responder(texto, ent) {
    atualizarContexto();
    var r = ent.crise || ent.falha || L.processar(ent.texto != null ? ent.texto : texto, E, MODO);
    var textoPt = ent.texto != null ? ent.texto : texto;
    if (GRAVAR) { L.rede.registrarSilencioso(r, textoPt, E, MODO); }          // contadores: silencioso, nunca atrapalha
    if (GRAVAR && r.acao === 'gravar') { addMsg(r.msgs[0], 'bot'); ocupado = true; gravar(r.dados); return; }
    // Etapa 3: se as regras nao souberam (ou o genero do nome e desconhecido), a IA tenta uma vez.
    // Qualquer falha cai de volta na resposta das regras (r), sem avisar erro.
    if (IA && L.vaiConsultarIA(r, MODO)) {
      ocupado = true; var dig = addMsg('Lauana est\u00e1 digitando...', 'bot dig');
      L.refinar(r, textoPt, E, MODO).then(function (r2) { ocupado = false; tirarDig(dig); entregar(r2 || r); },
                                          function () { ocupado = false; tirarDig(dig); entregar(r); });
      return;
    }
    entregar(r);
  }
  // So diz "recebi" depois que o servidor confirmou (ate 3 tentativas). Se falhar, avisa e guarda o texto.
  function gravar(pedido) {
    L.rede.enviarGravacao(pedido, E, MODO).then(function (res) {
      ocupado = false;
      if (!res.ok && res.http === 200 && res.json && res.json.error && pedido.tipo === 'depoimento') { E.flow = null; mostrar({ msgs: [res.json.error], chips: [] }); return; }
      entregar(L.resultadoGravacao(E, res.ok, pedido.tipo, pedido.dados));
    });
  }
  function abrir(primeira) {
    chat.classList.add('on'); balao.style.display = 'none';
    atualizarContexto();
    if (!saudou) {
      saudou = true;
      var nav = (MODO === 'home') ? idiomaNavegador() : '';
      var ab = nav ? L.aberturaIdioma(E, nav, hora()) : L.abertura(E, MODO, { hora: hora(), email: emailAtual() });
      if (primeira && !nav) { L.definirPendente(E, primeira); }
      entregar(ab);
    } else {
      var nota = (MODO === 'painel' && L.avisoContexto) ? L.avisoContexto(E, contextoAtual()) : null;
      if (primeira) { enviar(primeira); } else if (nota) { entregar(nota); }
    }
    setTimeout(function () { inp.focus(); }, 60);
  }
  function fechar() { chat.classList.remove('on'); balao.style.display = 'flex'; balao.focus(); }
  balao.onclick = function () { abrir(); };
  el(sh, '.fechar').onclick = fechar;
  form.onsubmit = function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; enviar(v); };
  chat.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(); } });
  if (MODO === 'painel' && cfg.contexto) {
    setInterval(function () {
      if (!saudou || ocupado || chat.className.indexOf('on') < 0 || !L.avisoContexto) { return; }
      var nota = L.avisoContexto(E, contextoAtual()); if (nota) { entregar(nota); }
    }, 1000);
  }
  setTimeout(function () { var d = el(sh, '#dica'); if (d && chat.className.indexOf('on') < 0) { d.style.display = 'none'; } }, 14000);   // a dica some sozinha
  // so o rostinho, sem balao de fala: no paciente sempre; no painel o balao aparece so 1 vez por sessao (nao cansar quem usa todo dia)
  (function () {
    var d = el(sh, '#dica'), jaViu = false;
    if (MODO === 'painel') { try { jaViu = !!g.sessionStorage.getItem('lauana_dica'); g.sessionStorage.setItem('lauana_dica', '1'); } catch (e) {} }
    if (d && (MODO === 'paciente' || jaViu || cfg.semDica)) { d.style.display = 'none'; }
  })();
  // ---------- visibilidade ----------
  //  esconderSe: seletor CSS. Enquanto existir na pagina (ex.: um teste em tela cheia), a Lauana se esconde e volta depois.
  //  esconderAoComecar: seletor de campo (ex.: 'input[type=radio]'). Na 1a vez que a pessoa mexer nele, a Lauana some de vez (so ajuda no comeco).
  var sumiuDeVez = false;
  function aplicarVisibilidade() {
    var some = sumiuDeVez; if (!some && cfg.esconderSe) { try { some = !!document.querySelector(cfg.esconderSe); } catch (e) {} }
    host.style.display = some ? 'none' : '';
  }
  // enquanto a pagina rola (em qualquer area dela), o rostinho fica quase transparente para nao atrapalhar a leitura; volta ao parar
  var _rolando = null;
  document.addEventListener('scroll', function () {
    if (chat.className.indexOf('on') >= 0) { return; }
    balao.style.opacity = '.25'; clearTimeout(_rolando);
    _rolando = setTimeout(function () { balao.style.opacity = ''; }, 700);
  }, { capture: true, passive: true });
  if (cfg.esconderSe) { setInterval(aplicarVisibilidade, 800); }
  //  esconderAoClicarTexto: expressao regular. Na 1a vez que a pessoa tocar num botao/link cujo texto casar (ex.: "Iniciar teste"), a Lauana some de vez.
  //  esconderAoClicarSel: seletor CSS do botao (ex.: '.item-btns button' = botoes de resposta). Mesmo efeito.
  var _reTexto = null; if (cfg.esconderAoClicarTexto) { try { _reTexto = new RegExp(cfg.esconderAoClicarTexto, 'i'); } catch (e) {} }
  if (_reTexto || cfg.esconderAoClicarSel) {
    document.addEventListener('click', function (e) {
      if (sumiuDeVez) { return; }
      try {
        if (e.composedPath && e.composedPath().indexOf(host) >= 0) { return; }          // clique dentro da propria Lauana nao conta
        var c = e.target && e.target.closest ? e.target.closest('button,a,[onclick],input[type=button],input[type=submit]') : null;
        if (!c) { return; }
        var txt = String(c.textContent || c.value || '').replace(/\s+/g, ' ').trim();
        if ((cfg.esconderAoClicarSel && c.matches(cfg.esconderAoClicarSel)) || (_reTexto && _reTexto.test(txt))) { sumiuDeVez = true; chat.classList.remove('on'); aplicarVisibilidade(); }
      } catch (x) {}
    }, true);
  }
  if (cfg.esconderAoComecar) {
    document.addEventListener('change', function (e) {
      var t = e.target; if (sumiuDeVez || !t || !t.matches) { return; }
      try { if (t.matches(cfg.esconderAoComecar)) { sumiuDeVez = true; chat.classList.remove('on'); aplicarVisibilidade(); } } catch (x) {}
    }, true);
  }

  // ---------- "balcao" com a atendente (opcional, logo abaixo do topo da pagina) ----------
  function montarCena() {
    var alvo = document.querySelector('.hero');
    if (!alvo || !alvo.parentNode) { return; }
    var h2 = document.createElement('div'); h2.id = 'lauana-cena';
    var s2 = h2.attachShadow({ mode: 'open' });
    var saud = L.saudacaoHora(hora());
    s2.innerHTML = '<style>' + CSS + '</style>' + DEFS +
      '<section class="cena" aria-label="Atendimento"><div class="cartao">' +
      '<svg class="fig" viewBox="0 0 360 360" role="img" aria-label="Lauana, atendente virtual, atr\u00e1s do balc\u00e3o">' +
      '<ellipse cx="180" cy="350" rx="150" ry="9" fill="#00000022"/><rect x="14" y="238" width="332" height="14" rx="3" fill="#b9bda6"/><rect x="22" y="252" width="318" height="96" fill="#cfd3bd"/><rect x="190" y="252" width="150" height="96" fill="#a7a499"/>' +
      '<rect x="34" y="176" width="52" height="62" rx="4" fill="#2e86c1"/><rect x="39" y="181" width="42" height="50" fill="#eaf3fb"/><rect x="43" y="186" width="30" height="4" fill="#1a5276"/><rect x="43" y="194" width="34" height="3" fill="#bbb"/><rect x="43" y="200" width="30" height="3" fill="#bbb"/>' +
      '<rect x="262" y="170" width="74" height="54" rx="4" fill="#3b4a5a"/><rect x="267" y="175" width="64" height="44" fill="#eaf3fb"/><rect x="272" y="181" width="40" height="4" fill="#2e86c1"/><rect x="272" y="189" width="52" height="3" fill="#bbb"/><rect x="272" y="195" width="46" height="3" fill="#bbb"/><rect x="290" y="224" width="18" height="14" fill="#3b4a5a"/>' +
      '<g class="bob"><use href="#lauanaFig" transform="translate(80 8)"/></g></svg>' +
      '<div class="fala"><h3>' + saud + '! Eu sou a Lauana \ud83d\udc4b</h3><p>Sou a atendente virtual daqui e posso te ajudar a se achar no site. O que voc\u00ea quer fazer?</p>' +
      '<button type="button" data-p="Como funciona o site?">\ud83d\uddfa\ufe0f Entender como o site funciona</button>' +
      '<button type="button" data-p="Quero conhecer um teste">\ud83e\uddea Conhecer uma escala de exemplo</button>' +
      '<button type="button" data-p="Quero deixar um elogio">\ud83d\udcac Deixar uma avalia\u00e7\u00e3o</button></div></div></section>';
    var bs = s2.querySelectorAll('button[data-p]');
    for (var i = 0; i < bs.length; i++) { (function (b) { b.onclick = function () { abrir(b.getAttribute('data-p')); }; })(bs[i]); }
    alvo.parentNode.insertBefore(h2, alvo.nextSibling);
  }

  function iniciar() {
    document.body.appendChild(host);
    if (cfg.cena) { montarCena(); }
    if (cfg.abrir || /#lauana\b/.test(g.location.hash)) { abrir(); }
  }
  if (document.body) { iniciar(); } else { document.addEventListener('DOMContentLoaded', iniciar); }
})(window);
