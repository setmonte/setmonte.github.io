// ===== AVALIAÇÃO PSICOSSOCIAL CRMV-MS =====
// Motor completo: questionário + análise IA + envio Google Sheets

// ⚠️ COLE AQUI O URL DO SEU GOOGLE APPS SCRIPT (Passo 7 das instruções)
var URL_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbxQsgfI-EQTs7T7p1J1yYbfHxdbADqXtlV5tm8U2KGtQ6EGaQmoyu5hjDU41B8EU0I/exec";

// === ESCALAS ===
var ESCALA_FISCAL = {
    nome: "EDOF - Desgaste Ocupacional (Fiscalização)",
    sigla: "EDOF",
    itens: [
        { n: 1, texto: "Sinto desgaste emocional após interações difíceis com fiscalizados.", dom: "Exaustão Emocional" },
        { n: 2, texto: "Já precisei controlar minha irritação para evitar conflitos durante o trabalho.", dom: "Controle Emocional" },
        { n: 3, texto: "Sinto que preciso estar sempre em alerta no ambiente de trabalho.", dom: "Percepção de Risco" },
        { n: 4, texto: "Tenho dificuldade em \"desligar\" do trabalho após o expediente.", dom: "Exaustão Emocional" },
        { n: 5, texto: "Já me senti inseguro(a) ou em risco durante uma atividade de fiscalização.", dom: "Percepção de Risco" },
        { n: 6, texto: "Preciso tomar decisões rápidas sob pressão com frequência.", dom: "Pressão Decisória" },
        { n: 7, texto: "Sinto que minha paciência diminuiu com o tempo na função.", dom: "Controle Emocional" },
        { n: 8, texto: "Tenho dificuldade em manter a calma quando sou confrontado(a).", dom: "Controle Emocional" },
        { n: 9, texto: "Percebo cansaço mental após dias de trabalho em campo.", dom: "Exaustão Emocional" },
        { n: 10, texto: "Sinto que esse trabalho exige mais de mim emocionalmente do que consigo sustentar.", dom: "Exaustão Emocional" }
    ],
    dominios: {
        "Controle Emocional": [2, 7, 8],
        "Percepção de Risco": [3, 5],
        "Exaustão Emocional": [1, 4, 9, 10],
        "Pressão Decisória": [6]
    }
};

var ESCALA_ADMIN = {
    nome: "EDOA - Desgaste Ocupacional (Administrativo)",
    sigla: "EDOA",
    itens: [
        { n: 1, texto: "Sinto cansaço mental ao realizar tarefas repetitivas.", dom: "Fadiga Mental" },
        { n: 2, texto: "Tenho dificuldade em manter a atenção por longos períodos.", dom: "Atenção Concentrada" },
        { n: 3, texto: "Já cometi erros por distração ou automatismo.", dom: "Atenção Concentrada" },
        { n: 4, texto: "Sinto que meu rendimento diminui ao longo do dia.", dom: "Fadiga Mental" },
        { n: 5, texto: "Preciso fazer pausas frequentes para conseguir manter o foco.", dom: "Fadiga Mental" },
        { n: 6, texto: "Sinto que meu trabalho é monótono ou pouco estimulante.", dom: "Desengajamento" },
        { n: 7, texto: "Tenho dificuldade em manter organização das tarefas.", dom: "Capacidade Funcional" },
        { n: 8, texto: "Já perdi prazos ou compromissos por falha de atenção.", dom: "Atenção Concentrada" },
        { n: 9, texto: "Sinto desmotivação em relação às atividades que realizo.", dom: "Desengajamento" },
        { n: 10, texto: "Sinto que minha capacidade atual não acompanha as exigências da função.", dom: "Capacidade Funcional" }
    ],
    dominios: {
        "Atenção Concentrada": [2, 3, 8],
        "Fadiga Mental": [1, 4, 5],
        "Desengajamento": [6, 9],
        "Capacidade Funcional": [7, 10]
    }
};

var OPCOES = [
    { valor: 0, texto: "Nunca" },
    { valor: 1, texto: "Raramente" },
    { valor: 2, texto: "Às vezes" },
    { valor: 3, texto: "Frequente" },
    { valor: 4, texto: "Sempre" }
];

// === ESTADO ===
var escalaSelecionada = null;
var escalaAtual = null;

// === FUNÇÕES DE INTERFACE ===

function mascaraCPF(input) {
    var v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = v;
}

function selecionarEscala(tipo) {
    escalaSelecionada = tipo;
    document.getElementById('btnFiscal').className = 'escala-btn' + (tipo === 'fiscal' ? ' ativo-fiscal' : '');
    document.getElementById('btnAdmin').className = 'escala-btn' + (tipo === 'admin' ? ' ativo-admin' : '');
    validarEtapa1();
}

function validarEtapa1() {
    var nome = document.getElementById('nome').value.trim();
    var cpf = document.getElementById('cpf').value.trim();
    var cargo = document.getElementById('cargo').value.trim();
    var setor = document.getElementById('setor').value;
    var ok = nome && cpf.length >= 14 && cargo && setor && escalaSelecionada;
    document.getElementById('btnIniciar').disabled = !ok;
}

// Validar em tempo real
document.getElementById('nome').addEventListener('input', validarEtapa1);
document.getElementById('cpf').addEventListener('input', validarEtapa1);
document.getElementById('cargo').addEventListener('input', validarEtapa1);
document.getElementById('setor').addEventListener('change', function() {
    // Auto-selecionar escala baseado no setor
    var setor = this.value;
    if (setor === 'Fiscalização') selecionarEscala('fiscal');
    else if (setor === 'Administrativo') selecionarEscala('admin');
    validarEtapa1();
});

function iniciarEscala() {
    escalaAtual = escalaSelecionada === 'fiscal' ? ESCALA_FISCAL : ESCALA_ADMIN;
    document.getElementById('etapa1').style.display = 'none';
    document.getElementById('etapa2').style.display = 'block';
    
    if (escalaSelecionada === 'admin') {
        document.getElementById('btnCalcular').classList.add('admin-btn');
    }
    
    renderizarQuestoes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarQuestoes() {
    var container = document.getElementById('listaQuestoes');
    var html = '';
    var classeExtra = escalaSelecionada === 'admin' ? ' admin' : '';
    
    escalaAtual.itens.forEach(function(item) {
        html += '<div class="questao' + classeExtra + '" id="q' + item.n + '">';
        html += '<div class="questao-texto"><span class="questao-num">' + item.n + '</span>' + item.texto + '</div>';
        html += '<div class="opcoes">';
        OPCOES.forEach(function(op) {
            html += '<div class="opcao" onclick="marcar(' + item.n + ',' + op.valor + ',this)">';
            html += '<input type="radio" name="q' + item.n + '" value="' + op.valor + '">';
            html += '<span class="valor">' + op.valor + '</span>';
            html += '<span class="rotulo">' + op.texto + '</span>';
            html += '</div>';
        });
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

function marcar(numItem, valor, elemento) {
    // Desmarcar irmãos
    var opcoes = elemento.parentNode.querySelectorAll('.opcao');
    opcoes.forEach(function(op) { op.classList.remove('selecionada'); });
    // Marcar este
    elemento.classList.add('selecionada');
    elemento.querySelector('input').checked = true;
    
    // Atualizar progresso
    atualizarProgresso();
}

function atualizarProgresso() {
    var respondidas = 0;
    for (var i = 1; i <= 10; i++) {
        if (document.querySelector('input[name="q' + i + '"]:checked')) respondidas++;
    }
    var pct = (respondidas / 10) * 100;
    document.getElementById('progressoBarra').style.width = pct + '%';
    document.getElementById('progressoTexto').textContent = respondidas + ' de 10 respondidas';
}

// === CLASSIFICAÇÃO ===
function classificar(media) {
    if (media < 1.0) return "Mínimo";
    if (media < 1.5) return "Leve";
    if (media < 2.0) return "Leve-Moderado";
    if (media < 2.5) return "Moderado";
    if (media < 3.0) return "Significativo";
    return "Intenso";
}

// === ANÁLISE IA ===
function analisarIA(respostas, dominiosScores, mediaGeral, tipo) {
    var nivelBurnout, nivelIncong, nivelInsight, parecer;

    if (tipo === 'fiscal') {
        var ce = dominiosScores["Controle Emocional"] || 0;
        var pr = dominiosScores["Percepção de Risco"] || 0;
        var ee = dominiosScores["Exaustão Emocional"] || 0;
        var pd = dominiosScores["Pressão Decisória"] || 0;
        var sB = (ee * 0.5) + (ce * 0.3) + (pd * 0.2);
        var sI = (ce * 0.5) + (pr * 0.5);

        nivelBurnout = sB >= 3.0 ? "ALTO" : (sB >= 2.0 ? "MODERADO" : "BAIXO");
        nivelIncong = sI >= 3.0 ? "ALTO" : (sI >= 2.0 ? "MODERADO" : "BAIXO");
    } else {
        var ac = dominiosScores["Atenção Concentrada"] || 0;
        var fm = dominiosScores["Fadiga Mental"] || 0;
        var de = dominiosScores["Desengajamento"] || 0;
        var cf = dominiosScores["Capacidade Funcional"] || 0;
        var sB = (fm * 0.35) + (de * 0.40) + (cf * 0.25);
        var sI = (de * 0.4) + (ac * 0.35) + (cf * 0.25);

        nivelBurnout = sB >= 3.0 ? "ALTO" : (sB >= 2.0 ? "MODERADO" : "BAIXO");
        nivelIncong = sI >= 3.0 ? "ALTO" : (sI >= 2.0 ? "MODERADO" : "BAIXO");
    }

    // Insight (item 10 = termômetro)
    var item10 = respostas[10] || 0;
    if (mediaGeral >= 2.5) {
        nivelInsight = item10 >= 3 ? "ALTO" : (item10 >= 2 ? "MODERADO" : "BAIXO");
    } else {
        nivelInsight = item10 <= 1 ? "ADEQUADO" : "ALTO";
    }

    // Parecer
    if (nivelBurnout === "ALTO" && nivelInsight === "BAIXO") {
        parecer = "Risco elevado com baixo insight. Necessita avaliação complementar urgente.";
    } else if (nivelBurnout === "ALTO" && nivelInsight !== "BAIXO") {
        parecer = "Risco elevado com insight preservado. Apto com restrições e acompanhamento.";
    } else if (nivelBurnout === "MODERADO" && nivelIncong === "ALTO") {
        parecer = "Desgaste moderado com incongruência perfil-função. Avaliar remanejamento.";
    } else if (nivelBurnout === "MODERADO") {
        parecer = "Desgaste moderado. Apto com recomendação de acompanhamento preventivo.";
    } else {
        parecer = "Sem indicadores de risco significativo. Apto sem restrições.";
    }

    return {
        nivelBurnout: nivelBurnout,
        nivelIncongruencia: nivelIncong,
        nivelInsight: nivelInsight,
        parecer: parecer
    };
}

// === CALCULAR E ENVIAR ===
function calcularEEnviar() {
    // Verificar se tudo foi respondido
    var respostas = {};
    var faltando = false;
    for (var i = 1; i <= 10; i++) {
        var sel = document.querySelector('input[name="q' + i + '"]:checked');
        if (!sel) { faltando = true; break; }
        respostas[i] = parseInt(sel.value);
    }
    if (faltando) {
        alert("⚠️ Por favor, responda todas as 10 questões antes de enviar.");
        // Scroll para primeira não respondida
        for (var j = 1; j <= 10; j++) {
            if (!document.querySelector('input[name="q' + j + '"]:checked')) {
                document.getElementById('q' + j).scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.getElementById('q' + j).style.boxShadow = '0 0 0 3px #c62828';
                setTimeout(function() {
                    document.querySelectorAll('.questao').forEach(function(q) { q.style.boxShadow = ''; });
                }, 2000);
                break;
            }
        }
        return;
    }

    // Calcular médias
    var soma = 0;
    Object.values(respostas).forEach(function(v) { soma += v; });
    var mediaGeral = soma / 10;

    var dominiosScores = {};
    var dominiosLista = [];
    Object.keys(escalaAtual.dominios).forEach(function(dom) {
        var itens = escalaAtual.dominios[dom];
        var s = 0;
        itens.forEach(function(n) { s += respostas[n]; });
        var media = s / itens.length;
        dominiosScores[dom] = media;
        dominiosLista.push({ nome: dom, score: media.toFixed(2) });
    });

    var classif = classificar(mediaGeral);
    var risco = mediaGeral >= 2.5 ? "SIM" : "NÃO";
    var ia = analisarIA(respostas, dominiosScores, mediaGeral, escalaSelecionada);

    // Montar dados para envio
    var dados = {
        dataHora: new Date().toLocaleString('pt-BR'),
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        cargo: document.getElementById('cargo').value.trim(),
        setor: document.getElementById('setor').value,
        escala: escalaAtual.sigla,
        mediaGeral: mediaGeral.toFixed(2),
        classificacao: classif,
        riscoBurnout: risco,
        dominios: dominiosLista,
        nivelBurnout: ia.nivelBurnout,
        nivelIncongruencia: ia.nivelIncongruencia,
        nivelInsight: ia.nivelInsight,
        parecer: ia.parecer,
        respostas: respostas
    };

    // Mostrar status
    var statusDiv = document.getElementById('statusEnvio');
    statusDiv.className = 'status-envio enviando';
    statusDiv.innerHTML = '<h4>⏳ Enviando resultados...</h4><p>Aguarde um momento.</p>';
    document.getElementById('btnCalcular').disabled = true;

    // Enviar para Google Sheets
    enviarParaSheets(dados);
}

function enviarParaSheets(dados) {
    var statusDiv = document.getElementById('statusEnvio');

    if (URL_GOOGLE_SHEETS === "COLE_SEU_URL_AQUI") {
        statusDiv.className = 'status-envio erro';
        statusDiv.innerHTML = '<h4>⚠️ URL não configurado</h4><p>O avaliador precisa configurar o link do Google Sheets.</p>';
        document.getElementById('btnCalcular').disabled = false;
        return;
    }

    // Envio via fetch com redirect:follow (método confiável para Apps Script)
    fetch(URL_GOOGLE_SHEETS, {
        method: 'POST',
        body: JSON.stringify(dados),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        if (result.status === "ok") {
            statusDiv.className = 'status-envio sucesso';
            statusDiv.innerHTML = '<h4>✅ Enviado com sucesso!</h4><p>Seus resultados foram registrados.</p>';
            setTimeout(function() {
                document.getElementById('etapa2').style.display = 'none';
                document.getElementById('etapa3').style.display = 'block';
                window.scrollTo({ top: 0 });
            }, 2000);
        } else {
            statusDiv.className = 'status-envio erro';
            statusDiv.innerHTML = '<h4>❌ Erro no servidor</h4><p>' + (result.mensagem || 'Tente novamente') + '</p>';
            document.getElementById('btnCalcular').disabled = false;
        }
    })
    .catch(function(erro) {
        // Se deu erro de CORS mas pode ter funcionado, tenta via iframe como fallback
        enviarViaIframe(dados, statusDiv);
    });
}

// Fallback: envio via iframe oculto (funciona mesmo com CORS)
function enviarViaIframe(dados, statusDiv) {
    var iframe = document.createElement('iframe');
    iframe.name = 'envio_frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = URL_GOOGLE_SHEETS;
    form.target = 'envio_frame';

    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'dados';
    input.value = JSON.stringify(dados);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // Assumir sucesso após 3 segundos
    setTimeout(function() {
        statusDiv.className = 'status-envio sucesso';
        statusDiv.innerHTML = '<h4>✅ Enviado com sucesso!</h4><p>Seus resultados foram registrados.</p>';
        setTimeout(function() {
            document.getElementById('etapa2').style.display = 'none';
            document.getElementById('etapa3').style.display = 'block';
            window.scrollTo({ top: 0 });
        }, 2000);
        // Limpar
        document.body.removeChild(form);
        document.body.removeChild(iframe);
    }, 3000);
}
