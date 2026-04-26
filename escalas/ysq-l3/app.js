const schemas = [
    { name: "Privação Emocional", code: "pe", items: "1-9", max: 54 },
    { name: "Abandono", code: "ai", items: "10-26", max: 102 },
    { name: "Desconfiança/Abuso", code: "da", items: "27-43", max: 102 },
    { name: "Isolamento Social", code: "is", items: "44-53", max: 60 },
    { name: "Defectividade", code: "dv", items: "54-68", max: 90 },
    { name: "Fracasso", code: "fr", items: "69-77", max: 54 },
    { name: "Dependência", code: "di", items: "78-92", max: 90 },
    { name: "Vulnerabilidade", code: "vd", items: "93-104", max: 72 },
    { name: "Emaranhamento", code: "em", items: "105-115", max: 66 },
    { name: "Subjugação", code: "sb", items: "116-125", max: 60 },
    { name: "Autossacrifício", code: "as", items: "126-142", max: 102 },
    { name: "Inibição Emocional", code: "ie", items: "143-151", max: 54 },
    { name: "Padrões Inflexíveis", code: "pi", items: "152-167", max: 96 },
    { name: "Arrogo", code: "ag", items: "168-178", max: 66 },
    { name: "Autodisciplina Insuficiente", code: "ai2", items: "179-193", max: 90 },
    { name: "Busca de Aprovação", code: "ba", items: "194-207", max: 84 },
    { name: "Negatividade/Pessimismo", code: "np", items: "208-218", max: 66 },
    { name: "Postura Punitiva", code: "pp", items: "219-232", max: 84 }
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
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function setupEventListeners() {
    const form = document.getElementById('ysqForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    const printBtn = document.getElementById('printBlankBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printBlankForm);
    }

    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }

    const newTestBtn = document.getElementById('newTestBtn');
    if (newTestBtn) {
        newTestBtn.addEventListener('click', resetForm);
    }
}

function handleSubmit(e) {
    e.preventDefault();
    const results = calculateResults();
    displayResults(results);
}

function calculateResults() {
    const scores = new Map();
    
    schemas.forEach(schema => {
        const [start, end] = schema.items.split('-').map(Number);
        let total = 0;
        
        for (let i = start; i <= end; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                total += parseInt(selected.value);
            }
        }
        
        scores.set(schema.code, total);
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
    
    schemas.forEach(schema => {
        const score = scores.get(schema.code) || 0;
        const percentage = (score / schema.max) * 100;
        const level = getLevel(percentage);
        
        html += `
            <div class="schema-result">
                <div class="schema-name">${schema.name}</div>
                <div class="schema-bar">
                    <div class="schema-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="schema-score">${score}/${schema.max}</div>
                <div class="schema-level level-${level.toLowerCase()}">${level}</div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsTable.innerHTML = html;
    
    document.getElementById('ysqForm').style.display = 'none';
    document.getElementById('instructionsSection').style.display = 'none';
    resultsSection.style.display = 'block';
    
    renderChart(scores);
    window.scrollTo(0, 0);
}

function renderChart(scores) {
    const canvas = document.getElementById('resultsChart');
    if (!canvas) return;

    if (currentChart) {
        currentChart.destroy();
    }

    const labels = schemas.map(s => s.name);
    const data = schemas.map(s => scores.get(s.code) || 0);
    const maxValues = schemas.map(s => s.max);

    currentChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pontuação',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
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
                    text: 'Resultados dos Esquemas',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: Math.max(...maxValues)
                }
            }
        }
    });
}

function printBlankForm() {
    window.print();
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const name = document.getElementById('patientName').value || 'Não informado';
    const date = document.getElementById('testDate').value || new Date().toLocaleDateString('pt-BR');
    
    pdf.setFontSize(16);
    pdf.text('Resultados YSQ-L3', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Nome: ${name}`, 20, 35);
    pdf.text(`Data: ${date}`, 20, 42);
    
    let y = 55;
    pdf.setFontSize(10);
    
    const scores = calculateResults();
    
    schemas.forEach(schema => {
        const score = scores.get(schema.code) || 0;
        const percentage = (score / schema.max) * 100;
        const level = getLevel(percentage);
        
        pdf.text(`${schema.name}: ${score}/${schema.max} - ${level}`, 20, y);
        y += 7;
        
        if (y > 270) {
            pdf.addPage();
            y = 20;
        }
    });
    
    pdf.save(`YSQ-L3_${name}_${date}.pdf`);
}

function resetForm() {
    const form = document.getElementById('ysqForm');
    form.reset();
    form.style.display = 'block';
    
    document.getElementById('instructionsSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    
    window.scrollTo(0, 0);
}

const allQuestions = [
{n:1,t:"As pessoas não estiveram disponíveis para atender as minhas necessidades emocionais."},
{n:2,t:"Eu não tive amor e atenção suficientes."},
{n:3,t:"Eu não tive praticamente ninguém com quem pudesse contar para me dar conselhos e apoio emocional."},
{n:4,t:"Na maior parte do tempo, eu não tive ninguém para me dar afeto, cuidado e proteção, que partilhasse sua vida comigo ou que se importasse de verdade com tudo que me acontece."},
{n:5,t:"Em grande parte da minha vida, não tive alguém que quisesse se aproximar de mim e passar bastante tempo comigo."},
{n:6,t:"No geral, as pessoas não estiveram disponíveis para me dar conforto, suporte e afeto."},
{n:7,t:"Em boa parte da minha vida, eu não me senti especial para ninguém."},
{n:8,t:"Na maior parte do tempo, eu não tive ninguém que realmente me escutasse, me compreendesse ou estivesse conectado com as minhas verdadeiras necessidades e sentimentos."},
{n:9,t:"Eu poucas vezes tive uma pessoa forte para me dar conselhos sensatos ou orientação."},
{n:10,t:"Me preocupa muito que as pessoas que eu amo morram logo, ainda que não haja razões médicas para essa preocupação."},
{n:11,t:"Eu tenho uma tendência a me grudar às pessoas que são próximas de mim com medo de que elas me abandonem."},
{n:12,t:"Eu me preocupo muito que pessoas próximas a mim me deixem ou me abandonem."},
{n:13,t:"Eu sinto que me falta uma base estável de apoio emocional."},
{n:14,t:"Eu sinto que os relacionamentos importantes para mim não serão duradouros; acredito que em algum momento eles terminarão."},
{n:15,t:"Eu me sinto viciado em parceiros que não estão disponíveis para mim de forma comprometida."},
{n:16,t:"No final das contas, ficarei sozinho."},
{n:17,t:"Quando eu sinto que alguém de que gosto está se afastando de mim, me desespero."},
{n:18,t:"Às vezes eu me preocupo tanto que as pessoas possam me abandonar que eu acabo as afastando de mim."},
{n:19,t:"Eu fico chateado quando alguém me deixa sozinho, mesmo por um período curto de tempo."},
{n:20,t:"Eu não posso achar que as pessoas que me apoiam estarão disponíveis para mim quando eu precisar."},
{n:21,t:"Eu não permito me aproximar muito das outras pessoas, pois não tenho como ter certeza de que elas sempre estarão presentes."},
{n:22,t:"Parece que as pessoas importantes na minha vida estão sempre indo e vindo."},
{n:23,t:"Eu me preocupo muito que as pessoas que eu amo encontrem uma outra pessoa que elas prefiram e me deixem."},
{n:24,t:"As pessoas próximas a mim foram sempre muito imprevisíveis: uma hora elas estão disponíveis e são legais comigo; noutra, elas estão bravas, chateadas, fechadas no seu próprio mundo, brigando, etc."},
{n:25,t:"Eu preciso tanto das pessoas que fico muito preocupado com a possibilidade de perdê-las."},
{n:26,t:"Eu não posso ser eu mesmo ou expressar o que eu realmente sinto; se eu fizer isso, as pessoas me deixarão."},
{n:27,t:"Eu sinto que as pessoas vão tirar vantagem de mim."},
{n:28,t:"Eu frequentemente sinto que preciso me proteger das outras pessoas."},
{n:29,t:"Eu sinto que não posso baixar a guarda na presença de outras pessoas; senão, elas me machucarão intencionalmente."},
{n:30,t:"Se alguma pessoa é legal comigo, eu já acho que ela quer alguma coisa."}];

const q2=[{n:31,t:"É só uma questão de tempo até que alguém me traia."},{n:32,t:"A maioria das pessoas só pensa nelas mesmas."},{n:33,t:"Eu tenho muita dificuldade em confiar nas pessoas."},{n:34,t:"Eu desconfio bastante das intenções das outras pessoas."},{n:35,t:"As outras pessoas raramente são honestas; geralmente, elas não são o que aparentam."},{n:36,t:"Eu geralmente estou atento aos motivos ocultos e às segundas intenções das outras pessoas."},{n:37,t:"Se eu acho que alguma pessoa tem a intenção de me prejudicar, eu tento prejudicá-la antes."},{n:38,t:"As pessoas geralmente precisam me provar quem são para que depois eu possa confiar nelas."},{n:39,t:"Eu testo as pessoas para ver se elas estão me dizendo a verdade e se estão bem-intencionadas."},{n:40,t:"Meu lema é: 'Controle ou seja controlado'."},{n:41,t:"Eu fico com raiva quando penso na forma como fui maltratado pelas pessoas ao longo da minha vida."},{n:42,t:"Durante a minha vida, aqueles que eram próximos se aproveitaram de mim ou me usaram para os seus próprios interesses."},{n:43,t:"Eu fui abusado física, emocional ou sexualmente por pessoas importantes na minha vida."},{n:44,t:"Eu não me encaixo."},{n:45,t:"Eu sou fundamentalmente diferente das outras pessoas."},{n:46,t:"Eu não faço parte: sou uma pessoa solitária."},{n:47,t:"Eu me sinto afastado das outras pessoas."},{n:48,t:"Eu me sinto isolado e sozinho."},{n:49,t:"Eu sempre me sinto deslocado ou de fora dos grupos."},{n:50,t:"Ninguém me entende realmente."},{n:51,t:"A minha família sempre foi diferente das outras famílias próximas de nós."},{n:52,t:"Eu às vezes sinto como se eu fosse um ET."},{n:53,t:"Se eu desaparecesse amanhã, ninguém notaria."},{n:54,t:"Nenhum homem/mulher que eu deseje seria capaz de me amar depois de ver meus defeitos."},{n:55,t:"Ninguém que eu deseje iria querer ficar perto de mim se conhecesse quem eu sou de verdade."},{n:56,t:"Eu sou defeituoso e cheio de falhas por natureza."},{n:57,t:"Não importa o quanto eu tente, sinto que não serei capaz de fazer com que um homem/mulher que eu admire venha a me respeitar ou sinta que eu valho a pena."},{n:58,t:"Eu não sou digno do amor, da atenção e do respeito dos outros."},{n:59,t:"Eu sinto que não sou digno de receber amor."},{n:60,t:"Eu sou inaceitável demais em aspectos muito básicos para me mostrar as outras pessoas ou permitir que elas me conheçam bem."}];
const q3=[{n:61,t:"Se as outras pessoas descobrissem os meus defeitos fundamentais, eu não conseguiria encará-las."},{n:62,t:"Quando as pessoas gostam de mim, sinto que as estou enganando."},{n:63,t:"Eu frequentemente me sinto atraído por pessoas que são muito críticas em relação a mim ou me rejeitam."},{n:64,t:"Há algo secreto em mim; não quero que as pessoas próximas a mim descubram."},{n:65,t:"É minha culpa o fato de meus pais (ambos ou um deles) não terem conseguido me amar o suficiente."},{n:66,t:"Eu não permito que as pessoas conheçam quem eu sou de verdade."},{n:67,t:"Um dos meus maiores medos é que meus defeitos sejam expostos."},{n:68,t:"Não consigo entender como alguém poderia me amar."},{n:69,t:"Quase nada do que eu faço no trabalho (ou nos estudos) é tão bom quanto o que os outros são capazes de fazer."},{n:70,t:"Eu sou incompetente no que se refere a realizações pessoais/profissionais."},{n:71,t:"A maioria das pessoas é mais capaz do que eu no trabalho e nas realizações pessoais."},{n:72,t:"Eu sou um fracasso."},{n:73,t:"Eu não sou tão talentoso no trabalho (ou estudos) quanto a maioria das pessoas."},{n:74,t:"Eu não sou tão inteligente no trabalho (ou estudos) quanto a maioria das pessoas."},{n:75,t:"Eu sou humilhado pelas minhas falhas e inadequações no trabalho (ou estudos)."},{n:76,t:"Eu frequentemente me sinto envergonhado quando estou com outras pessoas, pois as minhas realizações não se comparam às delas."},{n:77,t:"Eu geralmente comparo minhas realizações às das outras pessoas e sinto que elas são muito mais bem-sucedidas."},{n:78,t:"Eu não sinto que sou capaz de me virar sem a ajuda dos outros no dia a dia."},{n:79,t:"Eu preciso da ajuda dos outros para conseguir viver."},{n:80,t:"Eu sinto que não consigo lidar bem sozinho com as dificuldades da vida."},{n:81,t:"Eu acredito que as outras pessoas cuidam melhor de mim do que eu mesmo."},{n:82,t:"Eu tenho dificuldade de realizar atividades novas fora do trabalho, a menos que eu tenha alguém para me orientar."},{n:83,t:"Eu me vejo como uma pessoa que depende muito dos outros no que se refere ao meu funcionamento diário."},{n:84,t:"Eu estrago tudo que tento fazer, mesmo fora do trabalho (ou estudos)."},{n:85,t:"Eu sou incapaz em quase todas as áreas na minha vida."},{n:86,t:"Se eu confiar no meu próprio julgamento para tomar decisões no dia-a-dia, eu tomarei as decisões erradas."},{n:87,t:"Me falta bom senso."},{n:88,t:"Não se pode contar com meu julgamento em situações do dia a dia."},{n:89,t:"Eu não tenho confiança na minha habilidade de resolver os problemas que surgem no dia a dia."},{n:90,t:"Eu sinto que necessito de alguém com quem possa contar para me dar conselhos a respeito de questões práticas."}];
const q4=[{n:91,t:"Eu me sinto mais como uma criança do que como um adulto quando é preciso lidar com responsabilidades do dia a dia."},{n:92,t:"Eu acho as responsabilidades do dia a dia sufocantes."},{n:93,t:"Parece que eu não consigo parar de sentir que algo ruim está prestes a acontecer."},{n:94,t:"Eu sinto que uma tragédia (natural, financeira, criminal ou de saúde) pode acontecer a qualquer momento."},{n:95,t:"Eu tenho medo de me tornar um morador de rua ou indigente."},{n:96,t:"Eu me preocupo bastante com a possibilidade de ser atacado."},{n:97,t:"Eu tomo muitas precauções para evitar ficar doente ou me ferir."},{n:98,t:"Eu me preocupo com a possibilidade de desenvolver uma doença grave, mesmo que nada sério tenha sido diagnosticado pelo médico."},{n:99,t:"Eu sou uma pessoa medrosa."},{n:100,t:"Eu me preocupo muito com as coisas ruins que acontecem no mundo: crimes, poluição, etc."},{n:101,t:"Eu frequentemente sinto que posso ficar louco."},{n:102,t:"Eu frequentemente sinto que vou ter uma crise de ansiedade."},{n:103,t:"Eu frequentemente sinto que terei um ataque cardíaco ou câncer, mesmo havendo poucas razões médicas para me preocupar."},{n:104,t:"Eu sinto que o mundo é um lugar perigoso."},{n:105,t:"Eu ainda não consegui me separar dos meus pais (ambos ou um deles) do jeito que as outras pessoas da minha idade parecem ter se separado."},{n:106,t:"Eu e meu pai/mãe temos a tendência de nos envolver demais nos problemas e na vida uns dos outros."},{n:107,t:"Eu e meu pai/mãe temos dificuldades para guardar detalhes íntimos uns dos outros sem nos sentirmos traídos ou culpados."},{n:108,t:"Eu e meus pais precisamos falar uns com os outros quase todos os dias; caso contrário, um de nós se sente culpado, magoado, desapontado ou sozinho."},{n:109,t:"Eu muitas vezes sinto que não tenho uma identidade separada da dos meus pais ou companheiro(a)."},{n:110,t:"Eu frequentemente sinto como se meus pais vivessem a minha vida ou vivessem através de mim – é como se eu não tivesse uma vida própria."},{n:111,t:"Para mim, é muito difícil manter qualquer tipo de distância das pessoas de quem sou íntimo; tenho dificuldade de preservar uma percepção de identidade separada dos outros."},{n:112,t:"Eu estou tão envolvido com meu companheiro(a) ou com meu pai/mãe que não sei quem de fato eu sou ou o que eu quero."},{n:113,t:"Eu tenho dificuldade de separar meu ponto de vista ou opinião da do meu pai/mãe ou parceiro(a)."},{n:114,t:"Quando se trata do meu pai/mãe ou parceiro(a), eu muitas vezes sinto que não tenho privacidade."},{n:115,t:"Eu sinto que meus pais (ambos ou somente um deles) estão, ou ficariam, muito magoados por eu sair de casa para morar sozinho, longe deles."},{n:116,t:"Eu deixo as pessoas fazerem as coisas como elas querem, pois tenho receio das consequências."},{n:117,t:"Eu acho que se eu fizer o que sinto vontade e insistir nas coisas que são importantes para mim, os outros não me apoiarão e poderão ficar bravos ou descontentes comigo."},{n:118,t:"Eu sinto que não tenho outra opção a não ser ceder aos desejos dos outros; se não, eles vão ficar bravos, me rejeitar ou retaliar de alguma forma."},{n:119,t:"Nas relações, eu deixo a outra pessoa ter o controle."},{n:120,t:"Eu sempre deixei as outras pessoas escolherem por mim; então, eu nem sei o que eu quero para mim mesmo."}];
const q5=[{n:121,t:"Eu sinto que as decisões importantes da minha vida não foram de fato tomadas por mim."},{n:122,t:"Eu me preocupo muito em agradar os outros para que eles não me rejeitem."},{n:123,t:"Para mim, é muito difícil exigir que meus direitos sejam respeitados e que meus sentimentos sejam levados em consideração."},{n:124,t:"Eu me vingo das pessoas nas pequenas coisas, em vez de demonstrar a minha raiva diretamente."},{n:125,t:"Eu me esforço mais do que a maioria das pessoas para evitar conflitos."},{n:126,t:"Eu coloco as necessidades dos outros antes das minhas; se não, me sinto culpado."},{n:127,t:"Eu me sinto culpado quando decepciono os outros."},{n:128,t:"Eu dou mais para os outros do que recebo em troca."},{n:129,t:"Geralmente sou eu quem acaba cuidando das pessoas que são próximas de mim."},{n:130,t:"Ao amar alguém, não há praticamente nada que eu não possa suportar."},{n:131,t:"Eu sou uma boa pessoa por pensar mais nos outros do que em mim."},{n:132,t:"No trabalho, geralmente sou eu quem se oferece para realizar tarefas extras ou trabalhar horas extras."},{n:133,t:"Não importa o quão ocupado eu esteja, eu sempre consigo arranjar tempo para os outros."},{n:134,t:"Eu posso sobreviver com muito pouco, pois minhas necessidades são mínimas."},{n:135,t:"Eu só fico feliz quando as pessoas a minha volta estão felizes."},{n:136,t:"Eu passo tanto tempo fazendo coisas para as pessoas com quem me importo, que acabo tendo pouco tempo para mim mesmo."},{n:137,t:"Eu sempre fui aquele que escuta os problemas de todo mundo."},{n:138,t:"Eu me sinto mais confortável dando um presente do que recebendo."},{n:139,t:"As pessoas consideram que faço demais pelos outros e não faço o suficiente por mim mesmo."},{n:140,t:"Não importa o quanto eu faça, eu sinto que nunca é suficiente."},{n:141,t:"Se eu faço o que eu quero, me sinto muito desconfortável."},{n:142,t:"Para mim, é muito difícil pedir que os outros cuidem das minhas necessidades."},{n:143,t:"Eu me preocupo em perder o controle das minhas ações."},{n:144,t:"Me preocupa que eu possa ferir física ou emocionalmente alguma pessoa se a minha raiva sair do controle."},{n:145,t:"Eu sinto que preciso controlar muito minhas emoções e impulsos; caso contrário, é provável que algo ruim aconteça."},{n:146,t:"Muita raiva e ressentimento se acumulam dentro de mim, e eu não expresso."},{n:147,t:"Eu me sinto constrangido demais para demonstrar sentimentos positivos para os outros (p. ex., afeto, demonstrar que me importo)."},{n:148,t:"Eu acho constrangedor demonstrar o que eu sinto para as outras pessoas."},{n:149,t:"Eu acho difícil ser caloroso e espontâneo."},{n:150,t:"Eu sou tão fechado que muitas pessoas acham que eu não tenho emoções."}];
const q6=[{n:151,t:"As pessoas acham que tenho dificuldades de expressar as emoções."},{n:152,t:"Eu tenho que ser o melhor na maioria das coisas que eu faço; não consigo aceitar o segundo lugar."},{n:153,t:"Eu me esforço para manter quase tudo em perfeita ordem."},{n:154,t:"Eu tenho que parecer o melhor possível na maior parte do tempo."},{n:155,t:"Eu tento fazer o meu melhor; não consigo me conformar em ser 'bom o suficiente'."},{n:156,t:"Eu tenho tanto a realizar que quase não há tempo para relaxar de verdade."},{n:157,t:"Quase nada do que eu faço é de fato bom o suficiente; sempre posso fazer melhor."},{n:158,t:"Eu preciso dar conta de todas as minhas responsabilidades."},{n:159,t:"Eu sinto que há uma pressão constante para que eu conquiste e termine as coisas."},{n:160,t:"Minhas relações sofrem, pois sou exigente demais comigo mesmo."},{n:161,t:"Minha saúde está sofrendo, pois coloco pressão demais sobre mim mesmo para que eu me saia bem."},{n:162,t:"Eu frequentemente sacrifico prazer e felicidade para atingir meus próprios padrões."},{n:163,t:"Quando eu cometo um erro, mereço ser fortemente criticado."},{n:164,t:"Eu não posso me despreocupar facilmente das minhas responsabilidades ou ficar arranjando desculpas para os meus erros."},{n:165,t:"Eu sou uma pessoa altamente competitiva."},{n:166,t:"Eu dou bastante ênfase ao dinheiro ou status."},{n:167,t:"No que se refere ao meu desempenho, eu preciso ser sempre o 'número um'."},{n:168,t:"Eu tenho dificuldade de aceitar um 'não' quando quero algo dos outros."},{n:169,t:"Eu muitas vezes fico bravo ou irritado se não consigo aquilo que quero."},{n:170,t:"Eu sou diferenciado e não deveria ter que aceitar muitas das restrições ou limitações impostas às outras pessoas."},{n:171,t:"Eu detesto que me mandem fazer algo ou me impeçam de fazer aquilo que eu quero."},{n:172,t:"Eu sinto que não deveria ter que seguir as regras e normas que as outras pessoas têm que seguir."},{n:173,t:"Eu sinto que o que eu tenho a oferecer tem muito mais valor quando comparado ao que os outros têm para dar."},{n:174,t:"Eu geralmente coloco as minhas necessidades na frente das dos outros."},{n:175,t:"Eu muitas vezes percebo que estou tão envolvido nas minhas próprias prioridades que não tenho tempo para dar para os amigos ou família."},{n:176,t:"As pessoas frequentemente me dizem que controlo de mais a forma como as coisas são feitas."},{n:177,t:"Eu fico muito irritado quando as pessoas não fazem aquilo que peço a elas."},{n:178,t:"Eu não consigo tolerar outras pessoas me dizendo o que fazer."},{n:179,t:"Eu tenho uma enorme dificuldade para parar de beber, fumar, comer ou outros comportamentos problemáticos."},{n:180,t:"Parece que eu não consigo me disciplinar para concluir a maioria das tarefas rotineiras ou entediantes."}];
const q7=[{n:181,t:"Eu frequentemente me permito agir conforme meus impulsos e expressar emoções que me causam problemas ou machucam outras pessoas."},{n:182,t:"Se eu não consigo atingir um objetivo, me frustro facilmente e desisto."},{n:183,t:"Eu tenho muita dificuldade em sacrificar gratificações imediatas para atingir um objetivo de longo prazo."},{n:184,t:"Quando eu começo a sentir raiva, com frequência simplesmente não consigo controlá-la."},{n:185,t:"Eu tenho a tendência de fazer coisas em excesso, mesmo sabendo que isso me faz mal."},{n:186,t:"Eu me entedio muito facilmente."},{n:187,t:"Quando as tarefas ficam difíceis, eu geralmente não consigo persistir e finalizá-las."},{n:188,t:"Eu não consigo me concentrar em nada por muito tempo."},{n:189,t:"Eu não consigo me forçar para fazer coisas de que eu não goste, mesmo quando sei que é para o meu próprio bem."},{n:190,t:"Eu perco a cabeça diante de qualquer ofensa."},{n:191,t:"Eu raramente consigo seguir com minhas resoluções ou projetos pessoais/profissionais."},{n:192,t:"Eu raramente consigo me segurar e não mostrar para as pessoas como realmente me sinto, não importa o quanto isso me custe."},{n:193,t:"Eu frequentemente faço coisas impulsivamente, e das quais me arrependerei mais tarde."},{n:194,t:"Para mim, é importante que quase todas as pessoas que eu conheço gostem de mim."},{n:195,t:"Eu me modifico dependendo das pessoas que estão comigo; assim, eles gostarão mais de mim."},{n:196,t:"Eu me esforço muito para me encaixar."},{n:197,t:"Minha autoestima é baseada principalmente na forma como as outras pessoas me veem."},{n:198,t:"Ter dinheiro e conhecer pessoas importantes me faz sentir uma pessoa que tem valor."},{n:199,t:"Eu gasto muito tempo com a minha aparência física; assim, as pessoas me valorizarão."},{n:200,t:"Minhas realizações têm mais valor para mim se os outros reparam nelas."},{n:201,t:"Eu estou tão focado em me encaixar que, às vezes, não sei quem eu sou."},{n:202,t:"Eu acho difícil estabelecer meus próprios objetivos sem levar em conta como os outros reagirão às minhas escolhas."},{n:203,t:"Quando eu olho para as minhas decisões de vida, vejo que tomei a maioria delas pensando na aprovação das outras pessoas."},{n:204,t:"Mesmo que eu não goste de uma pessoa, ainda assim quero que ela goste de mim."},{n:205,t:"Se eu não receber muita atenção dos outros, me sinto menos importante."},{n:206,t:"Quando eu faço comentários em uma reunião, ou sou apresentado a alguém em uma situação social, para mim é importante receber reconhecimento e admiração."},{n:207,t:"Receber muitos elogios dos outros me faz sentir uma pessoa de valor."},{n:208,t:"Mesmo quando as coisas parecem estar indo bem, eu sinto que é apenas uma questão de tempo para que elas começarem a dar errado."},{n:209,t:"Se algo de bom acontece, fico preocupado e pensando que algo ruim provavelmente vai acontecer depois."},{n:210,t:"Cuidado nunca é demais; quase sempre algo vai dar errado."}];
const q8=[{n:211,t:"Independentemente de quanto eu trabalhe, me preocupo com a ideia de ter problemas financeiros sérios e perder quase tudo que tenho."},{n:212,t:"Eu me preocupo que uma decisão errada possa causar um desastre."},{n:213,t:"Eu frequentemente fico obcecado com decisões pequenas, pois as consequências de cometer um erro parecem muito sérias."},{n:214,t:"Eu me sinto melhor imaginando que as coisas não darão certo para mim; dessa forma, não fico decepcionado se elas derem errado."},{n:215,t:"Eu me concentro mais nos aspectos negativos da vida e das situações do que nos positivos."},{n:216,t:"Eu tenho tendência a ser pessimista."},{n:217,t:"As pessoas próximas a mim consideram que eu me preocupo demais."},{n:218,t:"Se as pessoas ficam muito entusiasmadas com alguma coisa, eu me sinto desconfortável e sinto que devo avisá-las sobre o que pode dar errado."},{n:219,t:"Se eu cometer um erro, mereço ser punido."},{n:220,t:"Caso eu não me esforce ao máximo, tenho que me dar mal mesmo."},{n:221,t:"Não há desculpas se eu cometer um erro."},{n:222,t:"As pessoas que não fazem a parte delas devem ser punidas de alguma forma."},{n:223,t:"Na maior parte do tempo, não aceito as desculpas que os outros dão. Eles simplesmente não estão dispostos a aceitar as responsabilidades e sofrer as consequências."},{n:224,t:"Se eu não fizer a minha parte, devo sofrer as consequências."},{n:225,t:"Eu frequentemente penso nos erros que cometi e fico com raiva de mim mesmo."},{n:226,t:"Quando as pessoas fazem algo ruim, eu tenho dificuldade de perdoar e esquecer."},{n:227,t:"Eu guardo mágoas, mesmo depois de a pessoa ter se desculpado."},{n:228,t:"Eu fico chateado quando acho que alguém 'se livrou' de alguma coisa muito facilmente."},{n:229,t:"Eu fico bravo quando as pessoas inventam desculpas ou culpam os outros por seus problemas."},{n:230,t:"Não importa porque eu cometi um erro; quando faço algo errado, devo sofrer as consequências."},{n:231,t:"Eu me puno bastante por coisas que estraguei."},{n:232,t:"Sou uma pessoa má e que merece ser punida."}];
allQuestions.push(...q2,...q3,...q4,...q5,...q6,...q7,...q8);
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    allQuestions.forEach(q => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <div class="question-text">${q.n}. ${q.t}</div>
            <div class="options">
                ${[1, 2, 3, 4, 5, 6].map(value => `
                    <div class="option">
                        <input type="radio" id="q${q.n}_${value}" name="q${q.n}" value="${value}" required>
                        <label for="q${q.n}_${value}">${value}</label>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(questionDiv);
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
