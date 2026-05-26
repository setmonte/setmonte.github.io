// Remove DOMContentLoaded wrapper e coloca execucao direta
var fs = require('fs');
var path = 'd:/Planilhas/site/escalas/';

// Escalas ja corrigidas manualmente - pular
var skip = ['aq-10.html', 'ert-pp.html', 'snap-iv.html', 'teste-botao.html', 'index.html', 'pdf-escalas.js', 'salvar-escala.js'];

var files = fs.readdirSync(path).filter(function(f) { 
    return f.endsWith('.html') && skip.indexOf(f) < 0; 
});

var fixed = 0;
files.forEach(function(f) {
    var html = fs.readFileSync(path + f, 'utf8');
    
    // Procurar o padrao: document.addEventListener('DOMContentLoaded',function(){...});
    // e substituir por execucao direta do conteudo
    
    // Regex para encontrar o bloco DOMContentLoaded
    var pattern = /document\.addEventListener\('DOMContentLoaded',\s*function\s*\(\)\s*\{([\s\S]*?)\}\);?\s*\n/;
    var match = html.match(pattern);
    
    if (!match) {
        // Tentar formato compactado
        pattern = /document\.addEventListener\('DOMContentLoaded',function\(\)\{([\s\S]*?)\}\);?\s*\n/;
        match = html.match(pattern);
    }
    
    if (!match) {
        console.log(f + ': SKIP (padrao nao encontrado)');
        return;
    }
    
    // Extrair o conteudo interno
    var content = match[1];
    
    // Substituir por execucao direta
    var newContent = '// === INICIALIZACAO ===\n' + content.trim() + '\n';
    var newHtml = html.replace(match[0], newContent + '\n');
    
    fs.writeFileSync(path + f, newHtml, 'utf8');
    console.log(f + ': CORRIGIDO');
    fixed++;
});

console.log('\nTotal: ' + fixed + ' corrigidos');
