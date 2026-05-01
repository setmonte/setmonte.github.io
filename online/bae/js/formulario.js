// Gera ID do paciente (hash djb2 de nascimento + 3 letras do nome)
// Mesmo paciente = mesmo ID sempre. Não reversível (privacidade)
function gerarIdTeste() {
    const nome = (document.getElementById('nome')?.value || '').trim();
    const nascimento = document.getElementById('dataNascimento')?.value || '';
    if (!nome || nome.length < 1 || !nascimento) return '';
    var n = nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z]/g,'').toLowerCase();
    var prefixo = n.substring(0, 3);
    var raw = nascimento + '+' + prefixo;
    var hash = 5381;
    for (var i = 0; i < raw.length; i++) hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    window._idTeste = 'P' + Math.abs(hash).toString(36).toUpperCase();
    return window._idTeste;
}

// Função para calcular idade em anos, meses e dias
function calcularIdade(dataNascimento) {
    // Se não receber parâmetro, pega do campo
    if (!dataNascimento) {
        dataNascimento = document.getElementById('dataNascimento').value;
    }
    
    // Pega o elemento onde será exibida a idade calculada
    const idadeDisplay = document.getElementById('idadeDisplay');
    
    // Verifica se foi inserida uma data
    if (dataNascimento) {
        // Cria objeto Date com a data de nascimento
        const nascimento = new Date(dataNascimento);
        // Cria objeto Date com a data atual
        const hoje = new Date();
        
        // Calcula a diferença inicial de anos
        let anos = hoje.getFullYear() - nascimento.getFullYear();
        // Calcula a diferença inicial de meses
        let meses = hoje.getMonth() - nascimento.getMonth();
        // Calcula a diferença inicial de dias
        let dias = hoje.getDate() - nascimento.getDate();
        
        // Se os dias são negativos, ajusta o cálculo
        if (dias < 0) {
            meses--; // Diminui um mês
            // Pega o último dia do mês anterior
            const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
            // Adiciona os dias do mês anterior
            dias += ultimoDiaMesAnterior;
        }
        
        // Se os meses são negativos, ajusta o cálculo
        if (meses < 0) {
            anos--; // Diminui um ano
            meses += 12; // Adiciona 12 meses
        }
        
        // Se existe o elemento na tela, atualiza
        if (idadeDisplay) {
            // Exibe o resultado formatado na tela
            idadeDisplay.textContent = `Idade: ${anos} anos, ${meses} meses e ${dias} dias`;
            // Torna o elemento visível
            idadeDisplay.style.display = 'block';
        }
        
        // Retorna objeto com a idade (para uso nos testes)
        return { years: anos, months: meses, days: dias };
    } else {
        // Se existe o elemento na tela, esconde
        if (idadeDisplay) {
            idadeDisplay.style.display = 'none';
        }
        // Retorna null se não há data
        return null;
    }
}

// Função para formatar CPF com pontos e hífen
function formatarCPF(cpf) {
    // Remove todos os caracteres que não são dígitos
    cpf = cpf.replace(/\D/g, '');
    // Adiciona o primeiro ponto após os 3 primeiros dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    // Adiciona o segundo ponto após os próximos 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    // Adiciona o hífen antes dos últimos 2 dígitos
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    // Retorna o CPF formatado
    return cpf;
}

// Função para formatar CRP no padrão xx/xxxxx-x
function formatarCRP(crp) {
    // Remove todos os caracteres que não são dígitos
    crp = crp.replace(/\D/g, '');
    // Adiciona a barra após os 2 primeiros dígitos
    crp = crp.replace(/(\d{2})(\d)/, '$1/$2');
    // Adiciona o hífen antes do último dígito
    crp = crp.replace(/(\d{2}\/\d{5})(\d)/, '$1-$2');
    // Retorna o CRP formatado
    return crp;
}

// Função para mostrar/ocultar campo de gênero específico
function toggleGeneroInput() {
    // Pega o elemento do campo de gênero específico
    const generoInput = document.getElementById('generoInput');
    // Pega o botão radio "Outro"
    const outroRadio = document.getElementById('outro');
    
    // Verifica se o botão "Outro" está selecionado
    if (outroRadio.checked) {
        // Mostra o campo de gênero específico
        generoInput.style.display = 'block';
        // Torna o campo obrigatório
        document.getElementById('generoEspecifico').required = true;
    } else {
        // Esconde o campo de gênero específico
        generoInput.style.display = 'none';
        // Remove a obrigatoriedade do campo
        document.getElementById('generoEspecifico').required = false;
        // Limpa o valor do campo
        document.getElementById('generoEspecifico').value = '';
    }
}

// Event listeners - só adiciona se os campos existirem (desktop)
var _dn = document.getElementById('dataNascimento');
if (_dn) _dn.addEventListener('change', function() { calcularIdade(); });
var _cpf = document.getElementById('cpf');
if (_cpf) _cpf.addEventListener('input', function(e) { e.target.value = formatarCPF(e.target.value); });
var _crp = document.getElementById('crp');
if (_crp) _crp.addEventListener('input', function(e) { e.target.value = formatarCRP(e.target.value); });
document.querySelectorAll('input[name="sexo"]').forEach(function(radio) { radio.addEventListener('change', toggleGeneroInput); });



// Função para mostrar a tela do teste de atenção concentrada
function mostrarTeste() {
    console.log('=== INICIANDO mostrarTeste() ===');
    
    // Esconde a tela do formulário
    const tela1 = document.querySelector('.container');
    console.log('Tela 1 encontrada:', tela1);
    tela1.style.display = 'none';
    console.log('Tela 1 escondida');
    
    // Mostra a tela do teste
    const tela2 = document.getElementById('testeConcentrada');
    console.log('Tela 2 encontrada:', tela2);
    tela2.style.display = 'block';
    console.log('Tela 2 mostrada');
    
    console.log('=== FIM mostrarTeste() ===');
}