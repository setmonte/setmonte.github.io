var fs = require('fs');

// ===== SMI =====
var smiJs = fs.readFileSync('d:/Planilhas/site/escalas/smi/app.js', 'utf8');
var modesMatch = smiJs.match(/const modes\s*=\s*(\[[\s\S]*?\]);/);
eval('var modes=' + modesMatch[1]);
var questMatch = smiJs.match(/const allQuestions\s*=\s*(\[[\s\S]*?\]);/);
eval('var allQuestions=' + questMatch[1]);

// Converter para unicode escapes
function toUnicode(str) {
    return str.replace(/[^\x00-\x7F]/g, function(ch) {
        return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
}

// Gerar array de modos em JS
var modesJS = 'var MODOS = [\n';
modes.forEach(function(m, i) {
    modesJS += '{name:"' + toUnicode(m.name) + '",code:"' + m.code + '",items:' + JSON.stringify(m.items) + ',max:' + m.max + '}';
    if (i < modes.length - 1) modesJS += ',';
    modesJS += '\n';
});
modesJS += '];\n';

// Gerar array de questoes
var questJS = 'var QUESTOES = [\n';
allQuestions.forEach(function(q, i) {
    questJS += '{n:' + q.n + ',t:"' + toUnicode(q.t).replace(/"/g, '\\"') + '"}';
    if (i < allQuestions.length - 1) questJS += ',';
    questJS += '\n';
});
questJS += '];\n';

console.log('SMI: ' + modes.length + ' modos, ' + allQuestions.length + ' questoes');
fs.writeFileSync('d:/Planilhas/site/smi-data.txt', modesJS + '\n' + questJS, 'utf8');

// ===== YSQ-L3 =====
var ysqJs = fs.readFileSync('d:/Planilhas/site/escalas/ysq-l3/app.js', 'utf8');
var ysqQFile = fs.readFileSync('d:/Planilhas/site/escalas/ysq-l3/all-questions.js', 'utf8');

// Extrair schemas do app.js
var schemasMatch = ysqJs.match(/const schemas\s*=\s*(\[[\s\S]*?\]);/);
eval('var schemas=' + schemasMatch[1]);

// Extrair questoes do all-questions.js
var ysqQMatch = ysqQFile.match(/const allQuestions\s*=\s*(\[[\s\S]*?\]);/);
eval('var ysqQuestions=' + ysqQMatch[1]);

var schemasJS = 'var SCHEMAS = [\n';
schemas.forEach(function(s, i) {
    schemasJS += '{name:"' + toUnicode(s.name) + '",code:"' + s.code + '",items:"' + s.items + '",max:' + s.max + '}';
    if (i < schemas.length - 1) schemasJS += ',';
    schemasJS += '\n';
});
schemasJS += '];\n';

var ysqQJS = 'var QUESTOES = [\n';
ysqQuestions.forEach(function(q, i) {
    var t = (typeof q === 'string') ? q : q.t || q.text || '';
    ysqQJS += '"' + toUnicode(t).replace(/"/g, '\\"') + '"';
    if (i < ysqQuestions.length - 1) ysqQJS += ',';
    ysqQJS += '\n';
});
ysqQJS += '];\n';

console.log('YSQ-L3: ' + schemas.length + ' schemas, ' + ysqQuestions.length + ' questoes');
fs.writeFileSync('d:/Planilhas/site/ysql3-data.txt', schemasJS + '\n' + ysqQJS, 'utf8');
