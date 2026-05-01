// ===== BAE 2.2 — PAINEL DE CONTROLE =====
// Histórico de pacientes testados com exportação Excel

var STORAGE_KEY = 'bae_historico';
var HISTORICO_ARQUIVO = 'bae_historico.json';

// Carrega histórico: arquivo (Tauri) ou localStorage (navegador)
async function carregarHistorico() {
    if (window.__TAURI__) {
        try {
            var caminho = await obterCaminhoHistorico();
            var conteudo = await window.__TAURI__.core.invoke('ler_arquivo', { caminho: caminho });
            return JSON.parse(conteudo || '[]');
        } catch(e) { return []; }
    }
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
}

// Salva histórico: arquivo (Tauri) ou localStorage (navegador)
async function salvarHistoricoAsync(hist) {
    if (window.__TAURI__) {
        try {
            var caminho = await obterCaminhoHistorico();
            await window.__TAURI__.core.invoke('salvar_historico_json', {
                caminho: caminho,
                conteudo: JSON.stringify(hist, null, 2)
            });
        } catch(e) { console.log('Erro ao salvar histórico:', e); }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
}

async function obterCaminhoHistorico() {
    try {
        var docs = await window.__TAURI__.path.documentDir();
        return docs + 'BAE\\' + HISTORICO_ARQUIVO;
    } catch(e) {
        return HISTORICO_ARQUIVO;
    }
}

// Compatível com código síncrono
function carregarHistoricoSync() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
}

// Registra paciente no histórico (chamado ao gerar PDF)
async function registrarPacienteHistorico() {
    var p = window.resultadosBAE?.paciente || {};
    var r = window.resultadosBAE || {};
    if (!p.nome || p.nome === 'Não informado') return;

    var hist = await carregarHistorico();
    var registro = {
        id: p.idTeste || '',
        nome: p.nome || '',
        idade: p.idade || '',
        sexo: p.sexo || '',
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        paciente: JSON.parse(JSON.stringify(p)),
        concentrada: r.concentrada ? JSON.parse(JSON.stringify(r.concentrada)) : null,
        seletiva: r.seletiva ? JSON.parse(JSON.stringify(r.seletiva)) : null,
        dividida: r.dividida ? JSON.parse(JSON.stringify(r.dividida)) : null,
        alternada: r.alternada ? JSON.parse(JSON.stringify(r.alternada)) : null,
        sustentada: r.sustentada ? JSON.parse(JSON.stringify(r.sustentada)) : null
    };
    hist.push(registro);
    await salvarHistoricoAsync(hist);
    console.log('📊 Paciente registrado no histórico: ' + p.nome);
}

// Atualiza a tabela do painel
async function atualizarPainel() {
    var hist = await carregarHistorico();
    var contador = document.getElementById('painelContador');
    var tabela = document.getElementById('painelTabela');
    if (!contador || !tabela) return;

    if (hist.length === 0) {
        contador.textContent = 'Nenhum paciente testado';
        tabela.innerHTML = '';
        return;
    }

    contador.textContent = hist.length + ' paciente(s) testado(s)';

    var html = '<p style="font-size:11px;color:#666;text-align:left;margin:0 0 3px 0;font-weight:bold;padding-left:6cm;">Taxa de acerto por subteste</p>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html += '<tr style="background:#2e7d32;color:white;"><th style="padding:6px;">ID</th><th style="padding:6px;">Nome</th><th style="padding:6px;">Data</th><th style="padding:6px;">Conc</th><th style="padding:6px;">Sel</th><th style="padding:6px;">Div</th><th style="padding:6px;">Alt</th><th style="padding:6px;">Sus</th><th style="padding:6px;" title="O=Orientação E=Executiva V=Vigilância">Perfil</th><th style="padding:6px;">PDF</th></tr>';

    // Mostra últimos 20 (mais recentes primeiro)
    var mostrar = hist.slice(-20).reverse();
    for (var i = 0; i < mostrar.length; i++) {
        var r = mostrar[i];
        var idx = hist.length - 1 - i;
        var reteste = hist.filter(function(h) { return h.id === r.id; }).length > 1 ? ' ⟲' : '';
        var bg = i % 2 === 0 ? '#fff' : '#f5f5f5';
        html += '<tr style="background:' + bg + ';">';
        html += '<td style="padding:4px;font-family:monospace;font-size:10px;">' + (r.id || '').substring(0, 8) + reteste + '</td>';
        html += '<td style="padding:4px;">' + (r.nome || '').substring(0, 15) + '</td>';
        html += '<td style="padding:4px;">' + (r.data || '') + '</td>';
        html += '<td style="padding:4px;text-align:center;">' + formatarStatus(r.concentrada) + '</td>';
        html += '<td style="padding:4px;text-align:center;">' + formatarStatus(r.seletiva) + '</td>';
        html += '<td style="padding:4px;text-align:center;">' + formatarStatus(r.dividida) + '</td>';
        html += '<td style="padding:4px;text-align:center;">' + formatarStatus(r.alternada) + '</td>';
        html += '<td style="padding:4px;text-align:center;">' + formatarStatus(r.sustentada) + '</td>';
        
        // Calcula índices por rede atencional (Posner & Petersen, 1990)
        var tOrient = [r.concentrada, r.seletiva].filter(function(t){return t;});
        var tExec = [r.dividida, r.alternada].filter(function(t){return t;});
        var tVigil = r.sustentada;
        var idxOrient = tOrient.length > 0 ? tOrient.map(function(t){return t.taxaAcerto||t.taxa||0;}).reduce(function(a,b){return a+b;},0)/tOrient.length : -1;
        var idxExec = tExec.length > 0 ? tExec.map(function(t){return t.taxaAcerto||t.taxa||0;}).reduce(function(a,b){return a+b;},0)/tExec.length : -1;
        var idxVigil = tVigil ? (tVigil.taxaAcerto||tVigil.taxa||0) : -1;
        var perfilHtml = '';
        if (idxOrient >= 0) perfilHtml += '<span style="color:' + (idxOrient>=70?'#2e7d32':idxOrient>=50?'#ff9800':'#dc3545') + ';" title="Orientação: Concentrada+Seletiva">Ori:' + idxOrient.toFixed(0) + '%</span> ';
        if (idxExec >= 0) perfilHtml += '<span style="color:' + (idxExec>=70?'#2e7d32':idxExec>=50?'#ff9800':'#dc3545') + ';" title="Executiva: Dividida+Alternada">Exe:' + idxExec.toFixed(0) + '%</span> ';
        if (idxVigil >= 0) perfilHtml += '<span style="color:' + (idxVigil>=70?'#2e7d32':idxVigil>=50?'#ff9800':'#dc3545') + ';" title="Vigilância: Sustentada">Vig:' + idxVigil.toFixed(0) + '%</span>';
        
        html += '<td style="padding:4px;text-align:center;font-size:10px;font-weight:bold;">' + (perfilHtml || '—') + '</td>';
        html += '<td style="padding:4px;text-align:center;"><button onclick="reimprimirPDF(' + idx + ')" style="background:#9b59b6;color:white;border:none;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;" title="Reimprimir PDF">📄</button></td>';
        
        html += '</tr>';
    }
    html += '</table>';
    tabela.innerHTML = html;
}

function formatarStatus(teste) {
    if (!teste) return '<span style="color:#999;">—</span>';
    var taxa = (teste.taxaAcerto || teste.taxa || 0);
    var taxaStr = (typeof taxa === 'number' ? taxa : parseFloat(taxa) || 0).toFixed(0) + '%';
    var cor = taxa >= 70 ? '#2e7d32' : taxa >= 50 ? '#ff9800' : '#dc3545';
    var status = teste.statusTeste || teste.status || '';
    var icon = status === 'CONCLUÍDO' ? '✅' : status === 'BYPASSADO' ? '⏭️' : '🛑';
    var rt = teste.tempoMedio || teste.rt || 0;
    return '<span style="color:' + cor + ';" title="' + status + ' - RT:' + (typeof rt === 'number' ? rt.toFixed(0) : rt) + 'ms">' + taxaStr + icon + '</span>';
}

// Verifica reteste ao preencher nome/data no formulário
async function verificarReteste() {
    var nome = document.getElementById('nome')?.value || '';
    var nasc = document.getElementById('dataNascimento')?.value || '';
    var alerta = document.getElementById('alertaReteste');
    if (!alerta || !nome || !nasc) { if (alerta) alerta.style.display = 'none'; return; }

    var id = typeof gerarIdTeste === 'function' ? gerarIdTeste() : '';
    if (!id) { alerta.style.display = 'none'; return; }

    var hist = await carregarHistorico();
    var anteriores = hist.filter(function(h) { return h.id === id; });
    if (anteriores.length > 0) {
        var ultimo = anteriores[anteriores.length - 1];
        alerta.textContent = '⚠️ Este paciente já realizou o teste ' + anteriores.length + ' vez(es). Última: ' + (ultimo.data || 'N/I');
        alerta.style.display = 'block';
    } else {
        alerta.style.display = 'none';
    }
}

// Exportar Excel
async function exportarExcel() {
    var hist = await carregarHistorico();
    if (hist.length === 0) { alert('Nenhum dado para exportar.'); return; }

    if (typeof ExcelJS === 'undefined') { alert('Biblioteca ExcelJS não carregada.'); return; }

    var wb = new ExcelJS.Workbook();
    var ws = wb.addWorksheet('BAE Resultados');

    // Cabeçalho
    ws.columns = [
        { header: 'ID', key: 'id', width: 12 },
        { header: 'Nome', key: 'nome', width: 25 },
        { header: 'Idade', key: 'idade', width: 20 },
        { header: 'Sexo', key: 'sexo', width: 12 },
        { header: 'Data', key: 'data', width: 12 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Conc.Taxa%', key: 'concTaxa', width: 12 },
        { header: 'Conc.RT', key: 'concRT', width: 10 },
        { header: 'Conc.Status', key: 'concStatus', width: 14 },
        { header: 'Sel.Taxa%', key: 'selTaxa', width: 12 },
        { header: 'Sel.RT', key: 'selRT', width: 10 },
        { header: 'Sel.Status', key: 'selStatus', width: 14 },
        { header: 'Div.Taxa%', key: 'divTaxa', width: 12 },
        { header: 'Div.RT', key: 'divRT', width: 10 },
        { header: 'Div.Status', key: 'divStatus', width: 14 },
        { header: 'Alt.Taxa%', key: 'altTaxa', width: 12 },
        { header: 'Alt.RT', key: 'altRT', width: 10 },
        { header: 'Alt.Status', key: 'altStatus', width: 14 },
        { header: 'Sus.Taxa%', key: 'susTaxa', width: 12 },
        { header: 'Sus.RT', key: 'susRT', width: 10 },
        { header: 'Sus.Status', key: 'susStatus', width: 14 },
        { header: 'Idx.Orientação%', key: 'idxOrient', width: 14 },
        { header: 'Idx.Executiva%', key: 'idxExec', width: 14 },
        { header: 'Idx.Vigilância%', key: 'idxVigil', width: 14 }
    ];

    // Estilo cabeçalho
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };

    // Dados
    for (var i = 0; i < hist.length; i++) {
        var r = hist[i];
        ws.addRow({
            id: r.id, nome: r.nome, idade: r.idade, sexo: r.sexo, data: r.data, hora: r.hora,
            concTaxa: r.concentrada ? (r.concentrada.taxaAcerto || r.concentrada.taxa || '') : '',
            concRT: r.concentrada ? (r.concentrada.tempoMedio || r.concentrada.rt || '') : '',
            concStatus: r.concentrada ? (r.concentrada.statusTeste || r.concentrada.status || '') : '',
            selTaxa: r.seletiva ? (r.seletiva.taxaAcerto || r.seletiva.taxa || '') : '',
            selRT: r.seletiva ? (r.seletiva.tempoMedio || r.seletiva.rt || '') : '',
            selStatus: r.seletiva ? (r.seletiva.statusTeste || r.seletiva.status || '') : '',
            divTaxa: r.dividida ? (r.dividida.taxaAcerto || r.dividida.taxa || '') : '',
            divRT: r.dividida ? (r.dividida.tempoMedio || r.dividida.rt || '') : '',
            divStatus: r.dividida ? (r.dividida.statusTeste || r.dividida.status || '') : '',
            altTaxa: r.alternada ? (r.alternada.taxaAcerto || r.alternada.taxa || '') : '',
            altRT: r.alternada ? (r.alternada.tempoMedio || r.alternada.rt || '') : '',
            altStatus: r.alternada ? (r.alternada.statusTeste || r.alternada.status || '') : '',
            susTaxa: r.sustentada ? (r.sustentada.taxaAcerto || r.sustentada.taxa || '') : '',
            susRT: r.sustentada ? (r.sustentada.tempoMedio || r.sustentada.rt || '') : '',
            susStatus: r.sustentada ? (r.sustentada.statusTeste || r.sustentada.status || '') : '',
            idxOrient: (function() {
                var ts = [r.concentrada, r.seletiva].filter(function(t){return t;});
                return ts.length > 0 ? (ts.map(function(t){return t.taxaAcerto||t.taxa||0;}).reduce(function(a,b){return a+b;},0)/ts.length).toFixed(1) : '';
            })(),
            idxExec: (function() {
                var ts = [r.dividida, r.alternada].filter(function(t){return t;});
                return ts.length > 0 ? (ts.map(function(t){return t.taxaAcerto||t.taxa||0;}).reduce(function(a,b){return a+b;},0)/ts.length).toFixed(1) : '';
            })(),
            idxVigil: r.sustentada ? (r.sustentada.taxaAcerto || r.sustentada.taxa || 0).toFixed ? (r.sustentada.taxaAcerto || r.sustentada.taxa || 0).toFixed(1) : '' : ''
        });
    }

    // Gera e baixa
    wb.xlsx.writeBuffer().then(function(buffer) {
        var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'BAE_Resultados_' + new Date().toISOString().slice(0, 10) + '.xlsx';
        a.click();
        console.log('📥 Excel exportado: ' + hist.length + ' registros');
    });
}

// Limpar histórico
async function limparHistorico() {
    if (!confirm('Tem certeza que deseja apagar todo o histórico?\n\nEsta ação não pode ser desfeita.')) return;
    localStorage.removeItem(STORAGE_KEY);
    if (window.__TAURI__) {
        try {
            var caminho = await obterCaminhoHistorico();
            await window.__TAURI__.core.invoke('salvar_resultados', { nomeArquivo: caminho, conteudo: '[]' });
        } catch(e) {}
    }
    await atualizarPainel();
    console.log('🗑️ Histórico limpo');
}

// Inicializa painel ao carregar
document.addEventListener('DOMContentLoaded', function() {
    atualizarPainel();
});

// Registra no histórico quando PDF é gerado (intercepta)
var _gerarRelatorioPDFOriginal = null;

function inicializarInterceptadorPDF() {
    if (typeof window.gerarRelatorioPDF === 'function' && !_gerarRelatorioPDFOriginal) {
        _gerarRelatorioPDFOriginal = window.gerarRelatorioPDF;
        window.gerarRelatorioPDF = async function() {
            await _gerarRelatorioPDFOriginal();
            await registrarPacienteHistorico();
            await atualizarPainel();
        };
    }
}

// Tenta inicializar imediatamente e com delay (scripts podem carregar depois)
inicializarInterceptadorPDF();
setTimeout(inicializarInterceptadorPDF, 2000);

console.log('📊 Painel de Controle BAE carregado');

// Reimprimir PDF de avaliação anterior
async function reimprimirPDF(indice) {
    var hist = await carregarHistorico();
    if (!hist[indice]) { alert('Registro não encontrado.'); return; }
    
    var reg = hist[indice];
    
    // Restaura dados no window.resultadosBAE
    var backup = JSON.parse(JSON.stringify(window.resultadosBAE || {}));
    
    window.resultadosBAE = {
        paciente: reg.paciente || { nome: reg.nome, idTeste: reg.id, idade: reg.idade, sexo: reg.sexo },
        concentrada: reg.concentrada || null,
        seletiva: reg.seletiva || null,
        dividida: reg.dividida || null,
        alternada: reg.alternada || null,
        sustentada: reg.sustentada || null
    };
    window._idTeste = reg.id;
    
    console.log('📄 Reimprimindo PDF de: ' + reg.nome + ' (' + reg.data + ')');
    
    // Gera PDF (sem registrar novamente no histórico)
    try {
        await _gerarRelatorioPDFOriginal();
    } catch(e) {
        console.error('Erro ao reimprimir:', e);
    }
    
    // Restaura dados atuais
    window.resultadosBAE = backup;
}
