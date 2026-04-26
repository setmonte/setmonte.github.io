// ============================================================
// SMI - Inventário de Modos Esquemáticos (Schema Mode Inventory)
// 124 itens, 14 modos esquemáticos
// Baseado em: Young, Klosko, Weishaar & Lobbestael
// ============================================================

const modes = [
    // MODOS CRIANÇA
    { name: "Criança Vulnerável", code: "cv", items: [1,2,3,4,5,6,7,8,9,10], max: 60 },
    { name: "Criança Zangada", code: "cz", items: [11,12,13,14,15,16,17,18,19,20], max: 60 },
    { name: "Criança Impulsiva/Indisciplinada", code: "ci", items: [21,22,23,24,25,26,27,28,29,30], max: 60 },
    { name: "Criança Feliz", code: "cf", items: [31,32,33,34,35,36,37,38,39,40], max: 60 },

    // MODOS DE ENFRENTAMENTO DISFUNCIONAIS
    { name: "Capitulador Complacente", code: "cc", items: [41,42,43,44,45,46,47,48,49,50], max: 60 },
    { name: "Protetor Desligado", code: "pd", items: [51,52,53,54,55,56,57,58,59,60], max: 60 },
    { name: "Hipercompensador", code: "hc", items: [61,62,63,64,65,66,67,68,69,70], max: 60 },

    // MODOS PAIS DISFUNCIONAIS
    { name: "Pai/Mãe Punitivo", code: "pp", items: [71,72,73,74,75,76,77,78,79,80], max: 60 },
    { name: "Pai/Mãe Exigente", code: "pe", items: [81,82,83,84,85,86,87,88,89,90], max: 60 },

    // MODOS ADULTO
    { name: "Adulto Saudável", code: "as", items: [91,92,93,94,95,96,97,98,99,100], max: 60 },

    // MODOS ADICIONAIS (Lobbestael et al.)
    { name: "Criança Solitária", code: "cs", items: [101,102,103,104,105,106], max: 36 },
    { name: "Autoengrandecedor", code: "ae", items: [107,108,109,110,111,112], max: 36 },
    { name: "Provocador e Atacante", code: "pa", items: [113,114,115,116,117,118], max: 36 },
    { name: "Predador", code: "pr", items: [119,120,121,122,123,124], max: 36 }
];

const allQuestions = [
    // CRIANÇA VULNERÁVEL (1-10)
    {n:1, t:"Eu me sinto sozinho(a) e sem apoio."},
    {n:2, t:"Eu me sinto desamparado(a) e indefeso(a)."},
    {n:3, t:"Eu me sinto perdido(a) e sem direção."},
    {n:4, t:"Eu me sinto indigno(a) de amor."},
    {n:5, t:"Eu me sinto abandonado(a) pelas pessoas."},
    {n:6, t:"Eu me sinto ansioso(a) e com medo de que coisas ruins aconteçam."},
    {n:7, t:"Eu sinto uma tristeza profunda que parece não ter fim."},
    {n:8, t:"Eu me sinto como uma criança assustada que precisa de proteção."},
    {n:9, t:"Eu sinto que ninguém me entende de verdade."},
    {n:10, t:"Eu me sinto frágil e facilmente magoado(a)."},

    // CRIANÇA ZANGADA (11-20)
    {n:11, t:"Eu sinto uma raiva intensa quando minhas necessidades não são atendidas."},
    {n:12, t:"Eu fico furioso(a) quando me sinto tratado(a) de forma injusta."},
    {n:13, t:"Eu tenho explosões de raiva que parecem desproporcionais à situação."},
    {n:14, t:"Eu sinto vontade de gritar ou bater em alguma coisa quando estou frustrado(a)."},
    {n:15, t:"Eu fico com muita raiva quando as pessoas não me dão o que eu preciso."},
    {n:16, t:"Eu me sinto enraivecido(a) por ter sido maltratado(a) na vida."},
    {n:17, t:"Eu sinto uma raiva que parece vir do fundo da minha alma."},
    {n:18, t:"Eu fico irritado(a) e impaciente com as pessoas ao meu redor."},
    {n:19, t:"Eu sinto que tenho direito de expressar minha raiva de forma intensa."},
    {n:20, t:"Eu me sinto tão zangado(a) que tenho vontade de destruir coisas."},

    // CRIANÇA IMPULSIVA/INDISCIPLINADA (21-30)
    {n:21, t:"Eu ajo por impulso sem pensar nas consequências."},
    {n:22, t:"Eu tenho dificuldade em controlar meus desejos e impulsos."},
    {n:23, t:"Eu faço coisas para me sentir bem no momento, mesmo sabendo que vou me arrepender depois."},
    {n:24, t:"Eu tenho dificuldade em seguir regras e limites."},
    {n:25, t:"Eu quero as coisas imediatamente e não consigo esperar."},
    {n:26, t:"Eu me comporto de forma egoísta, sem considerar os outros."},
    {n:27, t:"Eu tenho dificuldade em completar tarefas que considero chatas ou difíceis."},
    {n:28, t:"Eu perco o controle facilmente quando estou frustrado(a)."},
    {n:29, t:"Eu gasto dinheiro ou como em excesso sem conseguir me controlar."},
    {n:30, t:"Eu faço birra ou fico emburrado(a) quando não consigo o que quero."},

    // CRIANÇA FELIZ (31-40)
    {n:31, t:"Eu me sinto amado(a) e aceito(a) pelas pessoas importantes na minha vida."},
    {n:32, t:"Eu me sinto seguro(a) e protegido(a)."},
    {n:33, t:"Eu me sinto otimista em relação ao futuro."},
    {n:34, t:"Eu me sinto livre para expressar minhas emoções."},
    {n:35, t:"Eu me sinto confiante e capaz."},
    {n:36, t:"Eu me divirto e aproveito a vida."},
    {n:37, t:"Eu me sinto conectado(a) com as pessoas ao meu redor."},
    {n:38, t:"Eu me sinto espontâneo(a) e criativo(a)."},
    {n:39, t:"Eu me sinto satisfeito(a) com quem eu sou."},
    {n:40, t:"Eu me sinto alegre e cheio(a) de energia."},

    // CAPITULADOR COMPLACENTE (41-50)
    {n:41, t:"Eu faço o que os outros querem para evitar conflitos."},
    {n:42, t:"Eu me submeto aos desejos dos outros, mesmo quando discordo."},
    {n:43, t:"Eu coloco as necessidades dos outros sempre antes das minhas."},
    {n:44, t:"Eu tenho medo de expressar minhas opiniões por receio de rejeição."},
    {n:45, t:"Eu me esforço para agradar as pessoas, mesmo às custas do meu bem-estar."},
    {n:46, t:"Eu aceito ser maltratado(a) porque acho que mereço."},
    {n:47, t:"Eu peço desculpas excessivamente, mesmo quando não fiz nada de errado."},
    {n:48, t:"Eu permito que os outros me controlem porque tenho medo de ficar sozinho(a)."},
    {n:49, t:"Eu evito confrontos a todo custo."},
    {n:50, t:"Eu me sinto incapaz de dizer 'não' para as pessoas."},

    // PROTETOR DESLIGADO (51-60)
    {n:51, t:"Eu me desligo emocionalmente das situações para não sentir dor."},
    {n:52, t:"Eu evito pensar em coisas que me perturbam."},
    {n:53, t:"Eu me sinto entorpecido(a) e vazio(a) por dentro."},
    {n:54, t:"Eu me afasto das pessoas quando começo a me sentir próximo(a) demais."},
    {n:55, t:"Eu uso atividades (trabalho, TV, internet) para evitar sentir emoções."},
    {n:56, t:"Eu me sinto desconectado(a) dos meus próprios sentimentos."},
    {n:57, t:"Eu evito situações que possam despertar emoções fortes."},
    {n:58, t:"Eu me fecho e fico distante quando as pessoas tentam se aproximar."},
    {n:59, t:"Eu me sinto como se estivesse no 'piloto automático', apenas passando pela vida."},
    {n:60, t:"Eu prefiro ficar sozinho(a) a lidar com as emoções que surgem nos relacionamentos."},

    // HIPERCOMPENSADOR (61-70)
    {n:61, t:"Eu preciso estar no controle de tudo e de todos."},
    {n:62, t:"Eu me comporto de forma dominante e autoritária."},
    {n:63, t:"Eu ataco os outros antes que eles possam me machucar."},
    {n:64, t:"Eu me esforço para parecer perfeito(a) e sem falhas."},
    {n:65, t:"Eu me sinto superior às outras pessoas."},
    {n:66, t:"Eu manipulo situações para conseguir o que quero."},
    {n:67, t:"Eu busco status e reconhecimento para me sentir importante."},
    {n:68, t:"Eu critico os outros para me sentir melhor comigo mesmo(a)."},
    {n:69, t:"Eu trabalho excessivamente para provar meu valor."},
    {n:70, t:"Eu me recuso a mostrar qualquer vulnerabilidade."},

    // PAI/MÃE PUNITIVO (71-80)
    {n:71, t:"Eu me critico severamente quando cometo erros."},
    {n:72, t:"Eu sinto que mereço ser punido(a) quando faço algo errado."},
    {n:73, t:"Eu tenho uma voz interior que me diz que sou mau/má ou sem valor."},
    {n:74, t:"Eu me castigo (privando-me de coisas boas) quando falho."},
    {n:75, t:"Eu sinto raiva de mim mesmo(a) e me trato com crueldade."},
    {n:76, t:"Eu acredito que não mereço coisas boas na vida."},
    {n:77, t:"Eu me sinto culpado(a) quando faço algo para mim mesmo(a)."},
    {n:78, t:"Eu tenho pensamentos de que sou uma pessoa terrível."},
    {n:79, t:"Eu me envergonho profundamente de quem eu sou."},
    {n:80, t:"Eu sinto que devo sofrer pelas coisas ruins que fiz."},

    // PAI/MÃE EXIGENTE (81-90)
    {n:81, t:"Eu sinto que preciso ser perfeito(a) em tudo que faço."},
    {n:82, t:"Eu me pressiono constantemente para alcançar padrões muito altos."},
    {n:83, t:"Eu sinto que nunca é bom o suficiente, não importa o quanto eu me esforce."},
    {n:84, t:"Eu me cobro excessivamente para cumprir todas as minhas obrigações."},
    {n:85, t:"Eu sinto que devo colocar o dever acima do prazer."},
    {n:86, t:"Eu me sinto pressionado(a) a ser eficiente e produtivo(a) o tempo todo."},
    {n:87, t:"Eu me critico por não ser organizado(a) ou disciplinado(a) o suficiente."},
    {n:88, t:"Eu sinto que expressar emoções é sinal de fraqueza."},
    {n:89, t:"Eu acredito que descansar é perda de tempo."},
    {n:90, t:"Eu me sinto culpado(a) quando não estou sendo produtivo(a)."},

    // ADULTO SAUDÁVEL (91-100)
    {n:91, t:"Eu consigo cuidar de mim mesmo(a) e atender às minhas necessidades."},
    {n:92, t:"Eu consigo estabelecer limites saudáveis com as pessoas."},
    {n:93, t:"Eu aceito minhas imperfeições sem me criticar excessivamente."},
    {n:94, t:"Eu consigo lidar com situações difíceis de forma equilibrada."},
    {n:95, t:"Eu me sinto responsável pelas minhas escolhas e ações."},
    {n:96, t:"Eu consigo expressar minhas emoções de forma adequada."},
    {n:97, t:"Eu busco atividades que me dão prazer e satisfação."},
    {n:98, t:"Eu consigo manter relacionamentos saudáveis e recíprocos."},
    {n:99, t:"Eu me trato com compaixão e gentileza."},
    {n:100, t:"Eu consigo tomar decisões considerando tanto minhas necessidades quanto as dos outros."},

    // CRIANÇA SOLITÁRIA (101-106)
    {n:101, t:"Eu me sinto completamente sozinho(a) no mundo."},
    {n:102, t:"Eu sinto um vazio enorme dentro de mim que nada preenche."},
    {n:103, t:"Eu me sinto invisível, como se ninguém me notasse."},
    {n:104, t:"Eu anseio desesperadamente por conexão, mas me sinto incapaz de alcançá-la."},
    {n:105, t:"Eu me sinto como se estivesse do lado de fora, olhando para dentro."},
    {n:106, t:"Eu me sinto profundamente triste e isolado(a)."},

    // AUTOENGRANDECEDOR (107-112)
    {n:107, t:"Eu me sinto especial e com direito a tratamento diferenciado."},
    {n:108, t:"Eu acredito que as regras não se aplicam a mim."},
    {n:109, t:"Eu me sinto superior e mais importante que os outros."},
    {n:110, t:"Eu espero que os outros façam o que eu quero sem questionar."},
    {n:111, t:"Eu me sinto no direito de ter tudo o que desejo."},
    {n:112, t:"Eu desprezo pessoas que considero inferiores a mim."},

    // PROVOCADOR E ATACANTE (113-118)
    {n:113, t:"Eu provoco as pessoas para testar seus limites."},
    {n:114, t:"Eu uso sarcasmo e ironia para machucar os outros."},
    {n:115, t:"Eu humilho as pessoas quando me sinto ameaçado(a)."},
    {n:116, t:"Eu intimido os outros para conseguir o que quero."},
    {n:117, t:"Eu sinto prazer em ver os outros desconfortáveis."},
    {n:118, t:"Eu ataco verbalmente as pessoas quando me sinto contrariado(a)."},

    // PREDADOR (119-124)
    {n:119, t:"Eu elimino friamente qualquer obstáculo que esteja no meu caminho."},
    {n:120, t:"Eu não sinto remorso quando prejudico alguém para atingir meus objetivos."},
    {n:121, t:"Eu manipulo as pessoas de forma calculada para obter vantagem."},
    {n:122, t:"Eu vejo as pessoas como peças que posso usar para meus fins."},
    {n:123, t:"Eu sou capaz de ser cruel se isso me beneficiar."},
    {n:124, t:"Eu planejo cuidadosamente como dominar e controlar os outros."}
];

let currentChart = null;

function initializeApp() {
    renderQuestions();
    setupEventListeners();
    setTodayDate();
}

function setTodayDate() {
    const dateInput = document.getElementById('testDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

function setupEventListeners() {
    const form = document.getElementById('smiForm');
    if (form) form.addEventListener('submit', handleSubmit);

    const printBtn = document.getElementById('printBlankBtn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportToPDF);

    const newTestBtn = document.getElementById('newTestBtn');
    if (newTestBtn) newTestBtn.addEventListener('click', resetForm);
}

function handleSubmit(e) {
    e.preventDefault();
    displayResults(calculateResults());
}

function calculateResults() {
    const scores = new Map();
    modes.forEach(mode => {
        let total = 0;
        mode.items.forEach(i => {
            const sel = document.querySelector(`input[name="q${i}"]:checked`);
            if (sel) total += parseInt(sel.value);
        });
        scores.set(mode.code, total);
    });
    return scores;
}

function getLevel(percentage) {
    if (percentage < 40) return 'Baixa';
    if (percentage < 70) return 'Média';
    return 'Alta';
}

function displayResults(scores) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    if (!resultsSection || !resultsTable) return;

    let html = '<div class="results-grid">';
    modes.forEach(mode => {
        const score = scores.get(mode.code) || 0;
        const percentage = (score / mode.max) * 100;
        const level = getLevel(percentage);
        html += `
            <div class="mode-result">
                <div class="mode-name">${mode.name}</div>
                <div class="mode-bar">
                    <div class="mode-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="mode-score">${score}/${mode.max}</div>
                <div class="mode-level level-${level.toLowerCase()}">${level}</div>
            </div>`;
    });
    html += '</div>';
    resultsTable.innerHTML = html;

    document.getElementById('smiForm').style.display = 'none';
    document.getElementById('instructionsSection').style.display = 'none';
    resultsSection.style.display = 'block';

    renderChart(scores);
    window.scrollTo(0, 0);
}

function renderChart(scores) {
    const canvas = document.getElementById('resultsChart');
    if (!canvas) return;
    if (currentChart) currentChart.destroy();

    const colors = [
        '#e74c3c','#c0392b','#d35400','#27ae60',
        '#f39c12','#7f8c8d','#2980b9',
        '#8e44ad','#9b59b6',
        '#16a085',
        '#e67e22','#1abc9c','#c0392b','#2c3e50'
    ];

    currentChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: modes.map(m => m.name),
            datasets: [{
                label: 'Pontuação',
                data: modes.map(m => scores.get(m.code) || 0),
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Resultados dos Modos Esquemáticos',
                    font: { size: 16 }
                }
            },
            scales: {
                x: { beginAtZero: true, max: 60 }
            }
        }
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const val = id => (document.getElementById(id)?.value || '').trim() || 'Não informado';
    const selText = id => { const el = document.getElementById(id); const t = el?.selectedOptions?.[0]?.text; return (t && t !== 'Selecione') ? t : 'Não informado'; };

    pdf.setFontSize(16);
    pdf.text('Resultados SMI - Modos Esquemáticos', 105, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Nome: ${val('patientName')}`, 20, 33);
    pdf.text(`Data Nasc.: ${val('birthDate')}`, 120, 33);
    pdf.text(`Idade: ${val('patientAge')}`, 20, 40);
    pdf.text(`Sexo: ${selText('patientSex')}`, 120, 40);
    pdf.text(`Estado Civil: ${selText('maritalStatus')}`, 20, 47);
    pdf.text(`Escolaridade: ${selText('education')}`, 120, 47);
    pdf.text(`Profissão: ${val('profession')}`, 20, 54);
    pdf.text(`Terapeuta: ${val('therapistName')}`, 120, 54);
    pdf.text(`Data Aplicação: ${val('testDate')}`, 20, 61);
    pdf.text(`Obs.: ${val('observations')}`, 120, 61);

    let y = 75;
    pdf.setFontSize(10);

    const scores = calculateResults();
    modes.forEach(mode => {
        const score = scores.get(mode.code) || 0;
        const percentage = (score / mode.max) * 100;
        const level = getLevel(percentage);
        pdf.text(`${mode.name}: ${score}/${mode.max} (${percentage.toFixed(1)}%) - ${level}`, 20, y);
        y += 7;
        if (y > 270) { pdf.addPage(); y = 20; }
    });

    pdf.save(`SMI_${val('patientName')}_${val('testDate')}.pdf`);
}

function resetForm() {
    const form = document.getElementById('smiForm');
    form.reset();
    form.style.display = 'block';
    document.getElementById('instructionsSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    window.scrollTo(0, 0);
}

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    allQuestions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <div class="question-text">${q.n}. ${q.t}</div>
            <div class="options">
                ${[1,2,3,4,5,6].map(v => `
                    <div class="option">
                        <input type="radio" id="q${q.n}_${v}" name="q${q.n}" value="${v}" required>
                        <label for="q${q.n}_${v}">${v}</label>
                    </div>`).join('')}
            </div>`;
        container.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
