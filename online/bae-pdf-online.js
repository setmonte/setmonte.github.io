// BAE PDF Online - usa o mesmo gerador do desktop
async function generateBAEPDF(idx) {
  try {
    var r = _baeResultCache[idx];
    if (!r) { alert('Resultado nao encontrado'); return; }
    var d = r.data || {};
    var p = d.paciente || d.formData || {};

    // Popula window.resultadosBAE com os dados do DynamoDB (mesmo formato do desktop)
    window.resultadosBAE = window.resultadosBAE || {};
    window.resultadosBAE.paciente = {
      idTeste: p.idTeste || p.idPaciente || '',
      nome: p.patientName || p.nome || 'Paciente',
      dataNascimento: p.birthDate || p.dataNascimento || '',
      idade: p.idade || '',
      idadeAnos: p.idadeAnos || 0,
      sexo: p.sex || p.sexo || '',
      cpf: p.cpf || '',
      escolaridade: p.education || p.escolaridade || '',
      lateralidade: p.laterality || p.lateralidade || '',
      observacoes: p.observacoes || p.hipoteseDiagnostica || '',
      nomePsicologo: p.evaluator || p.nomePsicologo || '',
      crp: p.crp || '',
      email: p.email || '',
      dataAplicacao: d.date ? new Date(d.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
    };

    // Calcular idade se não veio
    if (!window.resultadosBAE.paciente.idade && window.resultadosBAE.paciente.dataNascimento) {
      var age = typeof calcularIdade === 'function' ? calcularIdade(window.resultadosBAE.paciente.dataNascimento) : null;
      if (age) {
        window.resultadosBAE.paciente.idade = age.years + ' anos, ' + age.months + ' meses e ' + age.days + ' dias';
        window.resultadosBAE.paciente.idadeAnos = age.years;
      }
    }

    // Copiar resultados dos 5 testes
    window.resultadosBAE.concentrada = d.concentrada || null;
    window.resultadosBAE.seletiva = d.seletiva || null;
    window.resultadosBAE.dividida = d.dividida || null;
    window.resultadosBAE.alternada = d.alternada || null;
    window.resultadosBAE.sustentada = d.sustentada || null;

    window.resultadosBAE.testesCompletos = {
      concentrada: !!d.concentrada,
      seletiva: !!d.seletiva,
      dividida: !!d.dividida,
      alternada: !!d.alternada,
      sustentada: !!d.sustentada
    };

    // Chamar o gerador de PDF do desktop
    if (typeof gerarRelatorioPDF === 'function') {
      await gerarRelatorioPDF();
    } else {
      alert('Gerador de PDF nao carregado. Recarregue a pagina.');
    }
  } catch(e) {
    alert('Erro ao gerar PDF: ' + e.message);
    console.error(e);
  }
}
