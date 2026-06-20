// ===== REOCUPA - Banco de Situacoes-Problema =====
// Programa de Reabilitacao Ocupacional
// Cada situacao tem: cenario (fixo), perguntaPadrao (editavel pelo profissional), categoria, palavras-chave
// Niveis: 4=Funcional e Adaptada | 3=Em desenvolvimento | 2=Emergente | 1=Ausente

var REOCUPA_CATEGORIAS = {
    'autocuidado': { nome: 'Autocuidado', cor: '#2196F3', icone: 'banho' },
    'alimentacao': { nome: 'Alimentacao', cor: '#FF9800', icone: 'comida' },
    'socializacao': { nome: 'Socializacao', cor: '#9C27B0', icone: 'pessoas' },
    'lazer': { nome: 'Lazer e Tempo Livre', cor: '#4CAF50', icone: 'lazer' },
    'domestico': { nome: 'Atividades Domesticas', cor: '#795548', icone: 'casa' }
};

var REOCUPA_SITUACOES = [
    // === AUTOCUIDADO (id 1-5) ===
    {
        id: 1,
        cenario: 'Uma pessoa nao toma banho desde ontem.',
        perguntaPadrao: 'O que ela poderia fazer hoje para se sentir mais confortavel?',
        categoria: 'autocuidado',
        palavrasChave: {
            4: ['alarme', 'lembrete', 'visual', 'musica', 'momento', 'agradavel', 'rotina', 'horario', 'programar', 'associar', 'estrategia', 'planejar'],
            3: ['tentar', 'lembrar', 'esforcar', 'querer', 'pensar', 'talvez', 'depois', 'noite', 'rapido'],
            2: ['nao sei', 'dificil', 'complicado', 'sozinha', 'ajuda', 'alguem'],
            1: ['nada', 'nao', 'sem', 'nunca', 'impossivel', 'deixar']
        },
        respostasModelo: {
            4: 'Criar um lembrete visual, como um alarme, ou associar o banho a um momento agradavel, como ouvir musica.',
            3: 'Tentar se lembrar de forma espontanea, mas sem uma rotina clara.',
            2: 'Tomar um banho rapido so a noite, sem mudar a rotina de dia.',
            1: 'Nao faz nada e adia o banho, sem planejar.'
        }
    },
    {
        id: 2,
        cenario: 'Uma pessoa nao escova os dentes antes de dormir.',
        perguntaPadrao: 'O que ela poderia fazer para criar esse habito?',
        categoria: 'autocuidado',
        palavrasChave: {
            4: ['escova', 'visivel', 'quarto', 'rotina', 'fixa', 'antes', 'dormir', 'lembrete', 'alarme', 'horario', 'sempre', 'lugar', 'estrategia'],
            3: ['vezes', 'tentar', 'lembrar', 'esquecer', 'esforco', 'querer', 'melhorar'],
            2: ['dificil', 'sozinha', 'ajuda', 'complicado', 'as vezes', 'quando lembra'],
            1: ['nada', 'nao', 'sem', 'nunca', 'ignorar', 'deixar', 'tanto faz']
        },
        respostasModelo: {
            4: 'Colocar uma escova de dentes visivel no quarto e criar uma rotina fixa antes de dormir.',
            3: 'Escovar os dentes as vezes, de forma esquecida ou sem sequencia.',
            2: 'Escovar so quando lembra, mas sem horario fixo.',
            1: 'Nao escova os dentes, ignorando a necessidade.'
        }
    },
    {
        id: 3,
        cenario: 'Uma pessoa nao consegue se vestir sozinha pela manha.',
        perguntaPadrao: 'O que ela poderia fazer para tornar esse momento mais facil?',
        categoria: 'autocuidado',
        palavrasChave: {
            4: ['antes', 'escolher', 'dia anterior', 'separar', 'roupa', 'checklist', 'visual', 'organizar', 'preparar', 'ordem', 'sequencia', 'planejar'],
            3: ['pedir', 'ajuda', 'tentar', 'devagar', 'poucos', 'melhorar', 'pratica'],
            2: ['dificil', 'travada', 'complicado', 'sozinha', 'nao consegue', 'demora'],
            1: ['nada', 'nao', 'esperar', 'outra pessoa', 'resolver', 'nunca', 'sem']
        },
        respostasModelo: {
            4: 'Usar roupas previamente escolhidas no dia anterior ou preparar um checklist visual.',
            3: 'Pedir ajuda de outra pessoa as vezes, mas sem uma rotina clara.',
            2: 'Tenta se vestir, mas fica travada com dificuldade.',
            1: 'Nao faz nada e espera outra pessoa resolver.'
        }
    },
    {
        id: 4,
        cenario: 'Uma pessoa esquece de tomar agua ao longo do dia.',
        perguntaPadrao: 'O que ela poderia fazer para se lembrar de beber agua?',
        categoria: 'autocuidado',
        palavrasChave: {
            4: ['aplicativo', 'lembrete', 'garrafa', 'visivel', 'alarme', 'horario', 'perto', 'mesa', 'rotina', 'programar', 'marcar', 'estrategia'],
            3: ['tentar', 'lembrar', 'vez em quando', 'esforcar', 'querer', 'melhorar'],
            2: ['sede', 'esquece', 'dificil', 'complicado', 'sozinha', 'pouca'],
            1: ['nada', 'nao', 'sem', 'ignorar', 'nunca', 'deixar', 'tanto faz']
        },
        respostasModelo: {
            4: 'Usar um aplicativo de lembrete ou deixar garrafas visiveis no ambiente.',
            3: 'Lembrar de beber agua de vez em quando, mas sem rotina.',
            2: 'Tentar beber quando sente sede, mas sem intervalo regular.',
            1: 'Ignora a sede e nao toma agua.'
        }
    },
    {
        id: 5,
        cenario: 'Uma pessoa tem dificuldade para dormir a noite.',
        perguntaPadrao: 'O que ela poderia fazer antes de deitar para melhorar a qualidade do sono?',
        categoria: 'autocuidado',
        palavrasChave: {
            4: ['rotina', 'relaxar', 'livro', 'respiracao', 'sem tela', 'celular', 'desligar', 'horario', 'fixo', 'ambiente', 'escuro', 'calmo', 'musica', 'banho', 'morno'],
            3: ['tentar', 'dormir', 'cedo', 'deitar', 'esforcar', 'querer', 'melhorar'],
            2: ['dificil', 'acorda', 'noite', 'insonia', 'complicado', 'demora'],
            1: ['nada', 'nao', 'sem', 'celular', 'continua', 'nunca', 'deixar', 'tanto faz']
        },
        respostasModelo: {
            4: 'Criar uma rotina relaxante, como ler um livro ou fazer respiracao, sem telas antes de dormir.',
            3: 'Tentar dormir mais cedo, mas sem rotina definida.',
            2: 'Tenta dormir mas acorda varias vezes durante a noite.',
            1: 'Continua sem rotina, sem tentar mudar nada.'
        }
    },
    // === ALIMENTACAO (id 6-10) ===
    {
        id: 6,
        cenario: 'Uma pessoa nao se alimenta nos horarios certos e pula refeicoes.',
        perguntaPadrao: 'O que ela poderia fazer para manter uma rotina alimentar?',
        categoria: 'alimentacao',
        palavrasChave: {
            4: ['alarme', 'horario', 'fixo', 'rotina', 'lembrete', 'planejar', 'refeicao', 'organizar', 'cardapio', 'agenda', 'programar'],
            3: ['tentar', 'comer', 'lembrar', 'esforcar', 'melhorar', 'querer'],
            2: ['fome', 'esquece', 'dificil', 'complicado', 'sozinha', 'quando lembra'],
            1: ['nada', 'nao', 'sem', 'nunca', 'pular', 'deixar', 'tanto faz']
        },
        respostasModelo: {
            4: 'Criar alarmes para os horarios das refeicoes e planejar um cardapio simples.',
            3: 'Tentar comer quando lembra, sem horarios fixos.',
            2: 'Come so quando sente muita fome, sem regularidade.',
            1: 'Pula refeicoes sem se preocupar.'
        }
    },
    {
        id: 7,
        cenario: 'Uma pessoa so quer comer os mesmos alimentos todos os dias.',
        perguntaPadrao: 'O que ela poderia fazer para experimentar coisas novas?',
        categoria: 'alimentacao',
        palavrasChave: {
            4: ['poucos', 'devagar', 'misturar', 'junto', 'experimentar', 'pequena', 'quantidade', 'visual', 'bonito', 'prato', 'escolher', 'supermercado'],
            3: ['tentar', 'talvez', 'querer', 'pensar', 'provar', 'um dia'],
            2: ['dificil', 'nao gosto', 'medo', 'cheiro', 'textura', 'complicado'],
            1: ['nada', 'nao', 'sem', 'nunca', 'recusar', 'so quero', 'mesmo']
        },
        respostasModelo: {
            4: 'Introduzir um alimento novo por semana em pequena quantidade, junto com alimentos conhecidos.',
            3: 'Pensar em experimentar, mas sem plano definido.',
            2: 'Sente desconforto ao pensar em alimentos novos.',
            1: 'Recusa completamente qualquer alimento diferente.'
        }
    },
    {
        id: 8,
        cenario: 'Uma pessoa nao consegue preparar sua propria comida.',
        perguntaPadrao: 'O que ela poderia fazer para comecar a se alimentar de forma mais independente?',
        categoria: 'alimentacao',
        palavrasChave: {
            4: ['simples', 'receita', 'facil', 'passo', 'visual', 'lista', 'ingredientes', 'aprender', 'pratica', 'comecar', 'sanduiche', 'fruta'],
            3: ['tentar', 'ajuda', 'pedir', 'acompanhar', 'querer', 'aprender'],
            2: ['dificil', 'medo', 'fogao', 'complicado', 'sozinha', 'perigo'],
            1: ['nada', 'nao', 'sem', 'nunca', 'esperar', 'outra pessoa', 'deixar']
        },
        respostasModelo: {
            4: 'Comecar com receitas simples (sanduiche, fruta) usando uma lista visual de passos.',
            3: 'Pedir ajuda para acompanhar o preparo, mas sem tentar sozinha.',
            2: 'Tem medo de cozinhar e evita a cozinha.',
            1: 'Espera alguem preparar sem tentar nada.'
        }
    },
    {
        id: 9,
        cenario: 'Uma pessoa come muito rapido e nao percebe quando esta satisfeita.',
        perguntaPadrao: 'O que ela poderia fazer para comer com mais calma?',
        categoria: 'alimentacao',
        palavrasChave: {
            4: ['devagar', 'mastigar', 'pausar', 'garfo', 'mesa', 'sentar', 'sem tela', 'prestar atencao', 'saborear', 'tempo', 'cronometro'],
            3: ['tentar', 'querer', 'melhorar', 'devagar', 'esforcar'],
            2: ['dificil', 'rapido', 'ansiedade', 'complicado', 'nao percebe'],
            1: ['nada', 'nao', 'sem', 'nunca', 'tanto faz', 'continua']
        },
        respostasModelo: {
            4: 'Sentar a mesa sem telas, mastigar devagar e fazer pausas entre garfadas.',
            3: 'Tentar comer mais devagar, mas sem estrategia definida.',
            2: 'Come rapido por ansiedade e nao percebe o problema.',
            1: 'Continua comendo rapido sem tentar mudar.'
        }
    },
    {
        id: 10,
        cenario: 'Uma pessoa nao bebe agua suficiente porque nao gosta do sabor.',
        perguntaPadrao: 'O que ela poderia fazer para se hidratar melhor?',
        categoria: 'alimentacao',
        palavrasChave: {
            4: ['fruta', 'limao', 'sabor', 'gelada', 'garrafa', 'bonita', 'cha', 'suco', 'natural', 'gelo', 'hortela', 'canudo'],
            3: ['tentar', 'querer', 'talvez', 'provar', 'diferente'],
            2: ['nao gosto', 'dificil', 'esquece', 'sem vontade'],
            1: ['nada', 'nao', 'sem', 'nunca', 'recusar', 'deixar']
        },
        respostasModelo: {
            4: 'Adicionar rodelas de fruta ou limao na agua, usar garrafa colorida ou beber cha gelado.',
            3: 'Pensar em alternativas mas sem experimentar de fato.',
            2: 'Sabe que precisa beber mas nao encontra forma que goste.',
            1: 'Recusa beber agua e nao busca alternativas.'
        }
    },
    // === SOCIALIZACAO (id 11-15) ===
    {
        id: 11,
        cenario: 'Uma pessoa nao sabe como iniciar uma conversa com alguem.',
        perguntaPadrao: 'O que ela poderia fazer para se comunicar melhor?',
        categoria: 'socializacao',
        palavrasChave: {
            4: ['perguntar', 'nome', 'ola', 'cumprimentar', 'assunto', 'interesse', 'praticar', 'espelho', 'treinar', 'roteiro', 'script'],
            3: ['tentar', 'querer', 'falar', 'esforcar', 'coragem'],
            2: ['medo', 'vergonha', 'dificil', 'nao sei', 'complicado', 'ansiedade'],
            1: ['nada', 'nao', 'sem', 'nunca', 'evitar', 'ficar quieta', 'sozinha']
        },
        respostasModelo: {
            4: 'Treinar frases simples como "oi, tudo bem?" e ter assuntos preparados baseados em interesses comuns.',
            3: 'Querer falar mas nao saber por onde comecar.',
            2: 'Sente vergonha ou ansiedade ao pensar em conversar.',
            1: 'Evita qualquer contato e fica isolada.'
        }
    },
    {
        id: 12,
        cenario: 'Uma pessoa se sente muito incomodada em lugares com muitas pessoas.',
        perguntaPadrao: 'O que ela poderia fazer para lidar com isso?',
        categoria: 'socializacao',
        palavrasChave: {
            4: ['fone', 'abafador', 'tempo', 'limite', 'sair', 'descansar', 'planejar', 'horario', 'calmo', 'acompanhante', 'estrategia'],
            3: ['tentar', 'ir', 'pouco tempo', 'esforcar', 'querer'],
            2: ['medo', 'ansiedade', 'barulho', 'incomodo', 'dificil', 'mal'],
            1: ['nada', 'nao', 'sem', 'nunca', 'evitar', 'ficar em casa', 'recusar']
        },
        respostasModelo: {
            4: 'Usar fone abafador, planejar horarios mais vazios e definir um tempo limite para ficar.',
            3: 'Ir por pouco tempo mas sem estrategia de conforto.',
            2: 'Sente muito desconforto e mal-estar nesses ambientes.',
            1: 'Evita completamente e se recusa a sair.'
        }
    },
    {
        id: 13,
        cenario: 'Uma pessoa nao responde mensagens de amigos ou familiares.',
        perguntaPadrao: 'O que ela poderia fazer para manter contato?',
        categoria: 'socializacao',
        palavrasChave: {
            4: ['horario', 'fixo', 'responder', 'rotina', 'mensagem', 'curta', 'emoji', 'audio', 'agendar', 'lembrete'],
            3: ['tentar', 'querer', 'responder', 'depois', 'quando puder'],
            2: ['esquece', 'cansada', 'dificil', 'energia', 'complicado'],
            1: ['nada', 'nao', 'sem', 'nunca', 'ignorar', 'tanto faz', 'deixar']
        },
        respostasModelo: {
            4: 'Definir um horario fixo para responder mensagens, usando respostas curtas ou emojis.',
            3: 'Querer responder mas adiar sem horario definido.',
            2: 'Sente-se sem energia para manter contato.',
            1: 'Ignora todas as mensagens sem tentar.'
        }
    },
    {
        id: 14,
        cenario: 'Uma pessoa quer pedir algo em uma loja mas nao consegue falar com o atendente.',
        perguntaPadrao: 'O que ela poderia fazer?',
        categoria: 'socializacao',
        palavrasChave: {
            4: ['lista', 'escrita', 'mostrar', 'celular', 'foto', 'apontar', 'treinar', 'frase', 'pronta', 'pratica'],
            3: ['tentar', 'coragem', 'querer', 'esforcar', 'pedir'],
            2: ['medo', 'vergonha', 'ansiedade', 'trava', 'dificil', 'gagueja'],
            1: ['nada', 'nao', 'sem', 'nunca', 'desistir', 'sair', 'ir embora']
        },
        respostasModelo: {
            4: 'Preparar uma lista escrita ou mostrar no celular o que precisa, ou treinar a frase antes.',
            3: 'Tentar falar mas sem estrategia preparada.',
            2: 'Sente muita ansiedade e trava na hora.',
            1: 'Desiste e sai da loja sem pedir.'
        }
    },
    {
        id: 15,
        cenario: 'Uma pessoa nao sabe como se despedir de uma visita ou encerrar uma conversa.',
        perguntaPadrao: 'O que ela poderia fazer?',
        categoria: 'socializacao',
        palavrasChave: {
            4: ['frase', 'pronta', 'hora', 'combinar', 'sinal', 'obrigada', 'preciso ir', 'roteiro', 'treinar', 'tempo'],
            3: ['tentar', 'querer', 'falar', 'pensar', 'como'],
            2: ['dificil', 'incomodo', 'nao sei', 'complicado', 'fica'],
            1: ['nada', 'nao', 'sem', 'nunca', 'esperar', 'pessoa sair']
        },
        respostasModelo: {
            4: 'Ter frases prontas como "foi bom te ver, preciso ir agora" e combinar horario de saida antes.',
            3: 'Querer encerrar mas nao saber como dizer.',
            2: 'Fica desconfortavel mas nao consegue agir.',
            1: 'Espera a outra pessoa ir embora sem falar nada.'
        }
    },
    // === LAZER E TEMPO LIVRE (id 16-18) ===
    {
        id: 16,
        cenario: 'Uma pessoa fica o dia todo sem fazer nenhuma atividade de lazer.',
        perguntaPadrao: 'O que ela poderia fazer para ocupar o tempo livre?',
        categoria: 'lazer',
        palavrasChave: {
            4: ['lista', 'atividades', 'escolher', 'horario', 'musica', 'desenho', 'jogo', 'passear', 'hobby', 'interesse', 'agenda', 'planejar'],
            3: ['tentar', 'querer', 'pensar', 'talvez', 'algo'],
            2: ['nao sei', 'dificil', 'cansada', 'sem vontade', 'tedio'],
            1: ['nada', 'nao', 'sem', 'nunca', 'ficar', 'parada', 'tanto faz']
        },
        respostasModelo: {
            4: 'Fazer uma lista de atividades que gosta e escolher uma para cada dia.',
            3: 'Pensar em fazer algo mas sem se organizar.',
            2: 'Sente tedio mas nao tem energia para agir.',
            1: 'Fica parada o dia todo sem buscar alternativas.'
        }
    },
    {
        id: 17,
        cenario: 'Uma pessoa fica muitas horas no celular sem perceber o tempo passar.',
        perguntaPadrao: 'O que ela poderia fazer para controlar o uso?',
        categoria: 'lazer',
        palavrasChave: {
            4: ['limite', 'tempo', 'alarme', 'aplicativo', 'controle', 'horario', 'parar', 'regra', 'timer', 'substituir', 'outra atividade'],
            3: ['tentar', 'diminuir', 'querer', 'menos', 'esforcar'],
            2: ['dificil', 'vicio', 'nao consigo', 'complicado', 'perde tempo'],
            1: ['nada', 'nao', 'sem', 'nunca', 'tanto faz', 'continua', 'gosta']
        },
        respostasModelo: {
            4: 'Usar um timer ou app de controle de tempo e definir horarios para usar o celular.',
            3: 'Querer diminuir mas sem ferramenta de controle.',
            2: 'Sabe que usa demais mas nao consegue parar.',
            1: 'Continua usando sem se preocupar.'
        }
    },
    {
        id: 18,
        cenario: 'Uma pessoa tem um interesse especial mas nao sabe como transforma-lo em uma atividade prazerosa e organizada.',
        perguntaPadrao: 'O que ela poderia fazer?',
        categoria: 'lazer',
        palavrasChave: {
            4: ['horario', 'dedicar', 'organizar', 'material', 'espaco', 'rotina', 'grupo', 'curso', 'aprender', 'compartilhar', 'agenda'],
            3: ['querer', 'fazer', 'pensar', 'gostar', 'interesse'],
            2: ['dificil', 'sozinha', 'nao sei como', 'complicado'],
            1: ['nada', 'nao', 'sem', 'deixar', 'tanto faz']
        },
        respostasModelo: {
            4: 'Separar um horario fixo na semana para se dedicar ao interesse, com materiais organizados.',
            3: 'Gosta do assunto mas nao organiza tempo para pratica-lo.',
            2: 'Nao sabe como transformar o interesse em atividade.',
            1: 'Nao faz nada com o interesse.'
        }
    },
    // === ATIVIDADES DOMESTICAS (id 19-22) ===
    {
        id: 19,
        cenario: 'Uma pessoa nao consegue manter seu quarto organizado.',
        perguntaPadrao: 'O que ela poderia fazer para melhorar a organizacao?',
        categoria: 'domestico',
        palavrasChave: {
            4: ['caixa', 'lugar', 'cada coisa', 'etiqueta', 'rotina', 'pouco', 'dia', 'organizar', 'minutos', 'timer', 'visual', 'foto'],
            3: ['tentar', 'querer', 'melhorar', 'arrumar', 'esforcar'],
            2: ['dificil', 'cansada', 'bagunca', 'complicado', 'demais'],
            1: ['nada', 'nao', 'sem', 'nunca', 'tanto faz', 'deixar']
        },
        respostasModelo: {
            4: 'Definir um lugar para cada coisa com etiquetas visuais e arrumar 5 minutos por dia.',
            3: 'Querer organizar mas nao saber por onde comecar.',
            2: 'Sente-se sobrecarregada com a bagunca.',
            1: 'Deixa o quarto baguncado sem tentar mudar.'
        }
    },
    {
        id: 20,
        cenario: 'Uma pessoa precisa lavar a louca mas nao consegue comecar a tarefa.',
        perguntaPadrao: 'O que ela poderia fazer?',
        categoria: 'domestico',
        palavrasChave: {
            4: ['musica', 'timer', 'pouco', 'comecar', 'um prato', 'recompensa', 'rotina', 'apos refeicao', 'imediatamente', 'dividir'],
            3: ['tentar', 'querer', 'depois', 'esforcar', 'vai'],
            2: ['dificil', 'preguica', 'cansada', 'travada', 'demais'],
            1: ['nada', 'nao', 'sem', 'nunca', 'deixar', 'acumular', 'tanto faz']
        },
        respostasModelo: {
            4: 'Comecar com um prato so, colocar musica e lavar imediatamente apos comer.',
            3: 'Pensar em lavar mas adiar sem rotina.',
            2: 'Sente-se travada e nao consegue comecar.',
            1: 'Deixa a louca acumular sem agir.'
        }
    },
    {
        id: 21,
        cenario: 'Uma pessoa nao sabe separar roupas para lavar.',
        perguntaPadrao: 'O que ela poderia fazer para aprender essa tarefa?',
        categoria: 'domestico',
        palavrasChave: {
            4: ['cesto', 'cor', 'separar', 'claro', 'escuro', 'etiqueta', 'visual', 'foto', 'passo', 'rotina', 'dia fixo'],
            3: ['tentar', 'aprender', 'perguntar', 'querer', 'ajuda'],
            2: ['dificil', 'confuso', 'nao sei', 'complicado', 'mistura'],
            1: ['nada', 'nao', 'sem', 'nunca', 'outra pessoa', 'tanto faz']
        },
        respostasModelo: {
            4: 'Usar cestos coloridos (claro e escuro) com etiquetas visuais e ter um dia fixo para lavar.',
            3: 'Pedir ajuda para aprender mas sem praticar sozinha.',
            2: 'Fica confusa com as regras de separacao.',
            1: 'Espera outra pessoa lavar sem tentar.'
        }
    },
    {
        id: 22,
        cenario: 'Uma pessoa precisa ir ao mercado mas nao sabe o que comprar.',
        perguntaPadrao: 'O que ela poderia fazer para se organizar?',
        categoria: 'domestico',
        palavrasChave: {
            4: ['lista', 'antes', 'foto', 'geladeira', 'verificar', 'planejar', 'cardapio', 'semana', 'anotar', 'aplicativo', 'categorias'],
            3: ['tentar', 'lembrar', 'pensar', 'querer', 'organizar'],
            2: ['esquece', 'dificil', 'perda', 'complicado', 'nao sei'],
            1: ['nada', 'nao', 'sem', 'nunca', 'outra pessoa', 'tanto faz']
        },
        respostasModelo: {
            4: 'Fazer uma lista antes de sair, verificando o que falta na geladeira, organizada por categorias.',
            3: 'Tentar lembrar o que precisa mas sem lista.',
            2: 'Vai ao mercado mas esquece itens importantes.',
            1: 'Nao vai ao mercado e espera outra pessoa ir.'
        }
    }
];

// Configuracao dos niveis de classificacao
var REOCUPA_NIVEIS = {
    4: { rotulo: 'Funcional', nome: 'Funcional e Adaptada', cor: '#4CAF50', corFundo: '#E8F5E9' },
    3: { rotulo: 'Em desenvolvimento', nome: 'Em desenvolvimento e Parcialmente adaptada', cor: '#FF9800', corFundo: '#FFF3E0' },
    2: { rotulo: 'Emergente', nome: 'Emergente e Pouco adaptada', cor: '#FF5722', corFundo: '#FBE9E7' },
    1: { rotulo: 'Ausente', nome: 'Ausente e Nao adaptada', cor: '#9E9E9E', corFundo: '#F5F5F5' }
};
