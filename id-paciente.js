// ===== SΨM — ID ÚNICO DO PACIENTE =====
// Compartilhado entre BAE, TECFE e todas as escalas
// Mesmo paciente = mesmo ID em qualquer instrumento
// Hash djb2 de nascimento + 3 primeiras letras do nome

function gerarIdPaciente(nome, nascimento) {
    if (!nascimento || !nome || nome.trim().length < 1) return null;
    var n = nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z]/g,'').toLowerCase();
    var prefixo = n.substring(0, 3);
    var raw = nascimento + '+' + prefixo;
    var hash = 5381;
    for (var i = 0; i < raw.length; i++) hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    return 'P' + Math.abs(hash).toString(36).toUpperCase();
}

// Auto-inicializa: busca campos nome/dataNascimento e mostra ID
function initIdPaciente() {
    var nomeEl = document.getElementById('nome');
    var nascEl = document.getElementById('dataNascimento');
    if (!nomeEl || !nascEl) return;

    // Cria campo ID se não existir
    var idEl = document.getElementById('idPaciente');
    if (!idEl) {
        var container = nascEl.closest('.form-row') || nascEl.parentElement;
        var div = document.createElement('div');
        div.className = 'form-group';
        div.style.cssText = 'min-width:200px;';
        div.innerHTML = '<label for="idPaciente">ID Paciente:</label><input type="text" id="idPaciente" readonly style="background:#e8f5e8;font-weight:bold;color:#2e7d32;text-align:center;cursor:default;" placeholder="Preencha nome e nascimento">';
        // Insere após o container da data de nascimento
        var parentRow = nascEl.closest('.form-row');
        if (parentRow && parentRow.nextElementSibling) {
            parentRow.parentElement.insertBefore(div, parentRow.nextElementSibling);
        } else {
            container.parentElement.appendChild(div);
        }
        idEl = document.getElementById('idPaciente');
    }

    function atualizar() {
        var id = gerarIdPaciente(nomeEl.value, nascEl.value);
        idEl.value = id || '';
    }

    nomeEl.addEventListener('input', atualizar);
    nascEl.addEventListener('change', atualizar);
    atualizar();
}

document.addEventListener('DOMContentLoaded', initIdPaciente);
