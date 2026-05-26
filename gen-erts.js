// Gera todas as ERTs baseado no template da ERT-PP
var fs = require('fs');
var dir = 'd:/Planilhas/site/escalas/';

// Ler template ERT-PP
var template = fs.readFileSync(dir + 'ert-pp.html', 'utf8');

// Configuracoes de cada ERT
var ERTS = {
    'ert-pa': {sigla:'ERT-PA', nome:'Escala de Rastreio para Tracos de Personalidade Antissocial', titulo:'Personalidade Antissocial', numCrit:7, limiar:3},
    'ert-pb': {sigla:'ERT-PB', nome:'Escala de Rastreio para Tracos de Personalidade Borderline', titulo:'Personalidade Borderline', numCrit:9, limiar:5},
    'ert-pd': {sigla:'ERT-PD', nome:'Escala de Rastreio para Tracos de Personalidade Dependente', titulo:'Personalidade Dependente', numCrit:8, limiar:5},
    'ert-pes': {sigla:'ERT-PEs', nome:'Escala de Rastreio para Tracos de Personalidade Esquizoide', titulo:'Personalidade Esquizoide', numCrit:7, limiar:4},
    'ert-pet': {sigla:'ERT-PEt', nome:'Escala de Rastreio para Tracos de Personalidade Esquizotipica', titulo:'Personalidade Esquizotipica', numCrit:9, limiar:5},
    'ert-pev': {sigla:'ERT-PEv', nome:'Escala de Rastreio para Tracos de Personalidade Evitativa', titulo:'Personalidade Evitativa', numCrit:7, limiar:4},
    'ert-ph': {sigla:'ERT-PH', nome:'Escala de Rastreio para Tracos de Personalidade Histrionica', titulo:'Personalidade Histrionica', numCrit:8, limiar:5},
    'ert-pn': {sigla:'ERT-PN', nome:'Escala de Rastreio para Tracos de Personalidade Narcisista', titulo:'Personalidade Narcisista', numCrit:9, limiar:5},
    'ert-poc': {sigla:'ERT-POC', nome:'Escala de Rastreio para Tracos de Personalidade Obsessivo-Compulsiva', titulo:'Personalidade Obsessivo-Compulsiva', numCrit:8, limiar:4},
    'ert-tb': {sigla:'ERT-TB', nome:'Escala de Rastreio para Transtorno Bipolar', titulo:'Transtorno Bipolar', numCrit:0, limiar:0}
};

Object.keys(ERTS).forEach(function(file) {
    var cfg = ERTS[file];
    var srcHtml = fs.readFileSync(dir + file + '.html', 'utf8');
    
    // Extrair ITENS, CRITERIOS, DOMINIOS do arquivo original
    var itensMatch = srcHtml.match(/var ITENS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
    var critMatch = srcHtml.match(/var CRITERIOS\s*=\s*(\{[\s\S]*?\});\s*\n/);
    var domMatch = srcHtml.match(/var DOMINIOS\s*=\s*(\{[\s\S]*?\});\s*\n/);
    
    if (!itensMatch || !critMatch || !domMatch) {
        console.log(file + ': SKIP - dados nao encontrados');
        return;
    }
    
    var itensStr = itensMatch[1];
    var critStr = critMatch[1];
    var domStr = domMatch[1];
    
    // Converter acentos para unicode escapes
    function toUnicode(s) {
        return s.replace(/[^\x00-\x7F]/g, function(ch) {
            return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
        });
    }
    
    itensStr = toUnicode(itensStr);
    critStr = toUnicode(critStr);
    domStr = toUnicode(domStr);
    
    // Contar criterios
    var numCrit = cfg.numCrit;
    try {
        eval('var _c = ' + critMatch[1]);
        numCrit = Object.keys(_c).length;
    } catch(e) {}
    
    // Determinar limiar (geralmente metade+1 dos criterios, ou especifico)
    var limiar = cfg.limiar || Math.ceil(numCrit / 2);
    
    // Gerar HTML baseado no template ERT-PP
    var html = template;
    
    // Substituir sigla e nomes
    html = html.replace(/ERT-PP/g, cfg.sigla);
    html = html.replace(/Personalidade Paranoide/g, cfg.titulo);
    html = html.replace(/Escala de Rastreio para Tra\\u00e7os de Personalidade Paranoide/g, toUnicode(cfg.nome));
    
    // Substituir ITENS
    html = html.replace(/var ITENS=\[[\s\S]*?\];/, 'var ITENS=' + itensStr + ';');
    
    // Substituir CRITERIOS
    html = html.replace(/var CRITERIOS=\{[^}]*\};/, 'var CRITERIOS=' + critStr + ';');
    
    // Substituir DOMINIOS
    html = html.replace(/var DOMINIOS=\{[^}]*\};/, 'var DOMINIOS=' + domStr + ';');
    
    // Substituir numCrit e limiar no calcularResultados
    html = html.replace(/for \(var c = 1; c <= 7; c\+\+\)/g, 'for (var c = 1; c <= ' + numCrit + '; c++)');
    html = html.replace(/cp >= 4/g, 'cp >= ' + limiar);
    html = html.replace(/\/7 criterios/g, '/' + numCrit + ' criterios');
    html = html.replace(/limiar: 4/g, 'limiar: ' + limiar);
    
    // Substituir no PDF tambem
    html = html.replace(/ERT-PP_/g, cfg.sigla.replace(/-/g,'') + '_');
    
    // Substituir escala nome no _escalaDados
    html = html.replace(/escala:'ERT-PP'/g, "escala:'" + cfg.sigla + "'");
    html = html.replace(/dados\.escala = 'ERT-PP'/g, "dados.escala = '" + cfg.sigla + "'");
    
    fs.writeFileSync(dir + file + '.html', html, 'utf8');
    console.log(file + ': GERADO (' + numCrit + ' criterios, limiar ' + limiar + ')');
});
