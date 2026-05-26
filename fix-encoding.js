// Converte caracteres acentuados dentro de <script> para unicode escapes
var fs = require('fs');
var path = 'd:/Planilhas/site/escalas/';
var files = fs.readdirSync(path).filter(f => f.endsWith('.html'));

var count = 0;
files.forEach(function(f) {
    var html = fs.readFileSync(path + f, 'utf8');
    var changed = false;
    
    // Encontrar blocos <script>...</script> (sem src)
    var result = html.replace(/(<script>)([\s\S]*?)(<\/script>)/g, function(match, open, code, close) {
        // Substituir caracteres acentuados por unicode escapes
        var newCode = code.replace(/[^\x00-\x7F]/g, function(ch) {
            var hex = ch.charCodeAt(0).toString(16).padStart(4, '0');
            return '\\u' + hex;
        });
        if (newCode !== code) changed = true;
        return open + newCode + close;
    });
    
    if (changed) {
        fs.writeFileSync(path + f, result, 'utf8');
        count++;
    }
});

console.log(count + ' arquivos corrigidos');
