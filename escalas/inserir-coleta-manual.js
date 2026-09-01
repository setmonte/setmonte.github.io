// ============================================================
// SCRIPT UTILITARIO - Inserir dados manualmente na coleta anonima
// Uso: node inserir-coleta-manual.js
// 
// Para os resultados da kelcirenepsicologaa@gmail.com de 05/08/2026
// que nao foram captados devido a bugs no SNAP-IV e timing no Conners
// ============================================================

var COLETA_URL = 'https://script.google.com/macros/s/AKfycbzYl7-ageXnHHyvrKMb6iS_7gX2l6ZBngPpbCHNfj7YYbXylcZ_vQ9iJkrbko8ICPcW/exec';

// ============================================================
// PREENCHA OS DADOS REAIS ABAIXO (consulte o painel da profissional)
// ============================================================

var registros = [
    {
        email: 'kelcirenepsicologaa@gmail.com',
        escala: 'CONNERS',
        idade: 0,           // <-- PREENCHER: idade em anos da crianca
        sexo: '',           // <-- PREENCHER: 'Masculino' ou 'Feminino'
        escolaridade: '',   // <-- PREENCHER: se disponivel
        pontuacao: '',      // <-- PREENCHER: escore total (soma dos 42 itens)
        dominios: '',       // <-- PREENCHER: ex: 'Conduta:12; Aprendizagem:8; ...'
        classificacao: ''   // <-- PREENCHER: ex: 'Rastreio Positivo' ou 'Rastreio Negativo'
    },
    {
        email: 'kelcirenepsicologaa@gmail.com',
        escala: 'SNAP-IV',
        idade: 0,           // <-- PREENCHER: idade em anos da crianca
        sexo: '',           // <-- PREENCHER: 'Masculino' ou 'Feminino'
        escolaridade: '',   // <-- PREENCHER: se disponivel
        pontuacao: '',      // <-- PREENCHER: escore total (somaD + somaHI + somaTOD)
        dominios: '',       // <-- PREENCHER: ex: 'Desatencao:1.78; Hiperatividade:2.00; TOD:1.25'
        classificacao: ''   // <-- PREENCHER: ex: 'D:Positivo / HI:Positivo / TOD:Negativo'
    }
];

// ============================================================
// ENVIO
// ============================================================

async function enviar() {
    for (var i = 0; i < registros.length; i++) {
        var reg = registros[i];
        if (!reg.idade || !reg.escala) {
            console.log('PULANDO registro ' + (i+1) + ' - dados incompletos (preencha idade e escala)');
            continue;
        }
        try {
            var resp = await fetch(COLETA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(reg)
            });
            console.log('Registro ' + (i+1) + ' (' + reg.escala + ') enviado - status: ' + resp.status);
        } catch(e) {
            console.log('Erro ao enviar registro ' + (i+1) + ': ' + e.message);
        }
    }
    console.log('Concluido.');
}

enviar();
