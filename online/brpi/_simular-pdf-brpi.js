/* ============================================================
   SIMULADOR DE PDF DA BRPI (ferramenta de desenvolvimento)
   ------------------------------------------------------------
   PARA QUE SERVE:
   Fazer a BRPI inteira leva ~40 min. Para ajustar o PDF sem
   repetir isso toda vez, este script cria um PACIENTE FALSO com
   os 4 modulos preenchidos no MESMO formato que os modulos reais
   enviam (o "sino"/postMessage) e chama o gerador de PDF do painel.

   COMO USAR (2 formas):
   1) No painel (online/index.html), abra o Console (F12) e cole o
      conteudo deste arquivo. Depois rode:  simularPdfBRPI();
   2) Ou carregue o arquivo:  copie e cole tudo. Ele NAO roda sozinho.

   OBS: e uma ferramenta interna. Nao vai para producao / nao tem link.
   Formato dos dados baseado em:
     - Modulo A: dados.spans = { aud_dir_num, aud_dir_let, ... } (0..13)
     - Modulo B: dados.spans = { aud_cre_num, aud_cre_let, ... } (0..13)
     - Modulo C: dados.teto  = { aud_num, aud_let, vis_num, vis_let } (nivel resolvido)
     - Modulo D: dados.teto  = { D1, D2, D3, D4 } (0..5)
   O registro completo (r.data) espelha o que o controlador salva:
     { formData, status:'completo', modulosAplicados, A, B, C, D, dataAplicacao }
   ============================================================ */

/* Monta e retorna o registro de um paciente BRPI simulado.
   Voce pode passar valores para variar o perfil; sem argumentos usa
   um perfil "medio" plausivel. */
function _brpiPacienteSimulado(opcoes) {
    opcoes = opcoes || {};

    // --- Dados do paciente (formData: mesmas chaves do site) ---
    var formData = {
        patientName: opcoes.nome || 'Paciente Simulado (TESTE)',
        birthDate: opcoes.nascimento || '2012-05-10',
        sex: opcoes.sexo || 'Masculino',
        education: opcoes.escolaridade || '6o ano do Ensino Fundamental',
        laterality: 'Destro',
        correcaoVisual: 'Nao',
        cpf: '',
        evaluator: 'Avaliador de Teste',
        crp: 'CRP 00/00000',
        obs: 'Registro FICTICIO gerado pelo simulador de PDF. Nao e um paciente real.',
        email: 'teste@exemplo.com',
        pacienteId: 'SIM' + Date.now().toString(36).slice(-5).toUpperCase()
    };

    // --- Modulo A: Amplitude de Memoria (spans = maior comprimento acertado, 0..13) ---
    var A = {
        modulo: 'A',
        spans: {
            aud_dir_num: 6, aud_dir_let: 5,
            aud_inv_num: 4, aud_inv_let: 4,
            vis_dir_num: 6, vis_dir_let: 5,
            vis_inv_num: 4, vis_inv_let: 3
        },
        registros: [],
        paciente: {}
    };

    // --- Modulo B: Organizacao e Manipulacao (spans = teto por subtrilha) ---
    var B = {
        modulo: 'B',
        spans: {
            aud_cre_num: 5, aud_cre_let: 4,
            aud_dec_num: 4, aud_dec_let: 3,
            vis_cre_num: 5, vis_cre_let: 4,
            vis_dec_num: 4, vis_dec_let: 3
        },
        registros: [],
        paciente: {}
    };

    // --- Modulo C: Raciocinio Relacional (teto = nivel resolvido por subtrilha, 0..7) ---
    var C = {
        modulo: 'C',
        teto: { aud_num: 5, aud_let: 4, vis_num: 6, vis_let: 5 },
        registros: [],
        paciente: {}
    };

    // --- Modulo D: Integracao e Decisao (teto = nivel resolvido por condicao, 0..5) ---
    var D = {
        modulo: 'D',
        teto: { D1: 4, D2: 3, D3: 3, D4: 2 },
        registros: [],
        paciente: {}
    };

    // Permite pedir so alguns modulos: _brpiPacienteSimulado({ modulos:['A','C'] })
    var quais = opcoes.modulos || ['A', 'B', 'C', 'D'];
    var mapa = { A: A, B: B, C: C, D: D };

    var data = {
        sessionId: 'sim-' + Date.now().toString(36),
        formData: formData,
        status: 'completo',
        modulosAplicados: quais.slice(),
        dataAplicacao: new Date().toISOString()
    };
    quais.forEach(function(m) { data[m] = mapa[m]; });

    return { sessionId: data.sessionId, data: data };
}

/* Gera o PDF da BRPI usando o paciente simulado, SEM servidor.
   Reaproveita o gerador real do painel (_gerarPdfBrpiReal se existir,
   senao gerarPdfBrpi via cache). */
function simularPdfBRPI(opcoes) {
    var r = _brpiPacienteSimulado(opcoes);
    console.log('[SIM BRPI] Paciente simulado:', r);

    // Caminho 1: chamar direto o gerador real, se exposto
    if (typeof _gerarPdfBrpiReal === 'function') {
        _gerarPdfBrpiReal(r);
        console.log('[SIM BRPI] PDF gerado via _gerarPdfBrpiReal().');
        return r;
    }
    // Caminho 2: injetar no cache e usar gerarPdfBrpi(0)
    if (typeof _brpiResultCache !== 'undefined' && typeof gerarPdfBrpi === 'function') {
        _brpiResultCache = [r];
        gerarPdfBrpi(0);
        console.log('[SIM BRPI] PDF gerado via gerarPdfBrpi(0) (cache injetado).');
        return r;
    }
    console.error('[SIM BRPI] Nao encontrei o gerador de PDF da BRPI nesta pagina. Abra o painel (index.html).');
    return r;
}
