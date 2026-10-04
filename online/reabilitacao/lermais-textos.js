// ===== LERMAIS - Banco de Textos Motivacionais Relacionais =====
// Programa de Leitura Motivacional para Reabilitacao
// Temas: relacoes familiares, amizades, ansiedade social, limites, convivencia
//
// ESTRUTURA DE ESCOLHA DO TEXTO:
// - Dificuldade 0 (Sem indicacao): usa a IDADE para escolher a faixa.
//     Faixa 1: 6-12 anos (crianca)  |  Faixa 2: 13+ anos (adolescente/adulto)
// - Dificuldade 1, 2 ou 3: IGNORA a idade. Sorteia entre os textos encurtados
//     do nivel indicado (uso clinico: pessoa que ainda nao le os textos normais,
//     ex.: crianca em alfabetizacao, adulto pos-AVC, etc.).
//     Nivel 1 = mais dificil (2 paragrafos) | Nivel 2 = 1 paragrafo | Nivel 3 = mais facil (3 linhas)
// Todos os textos tem numero EXATO de palavras (sem padronizacao forcada);
// a evolucao e medida por PPM e precisao, que independem do tamanho do texto.

var TEXTOS_LERMAIS = {

  // ===== FAIXA 1: CRIANCAS (6 a 12 anos) - usada quando dificuldade = 0 =====
  crianca: [
    {
      id: 'c1',
      titulo: 'O Amigo Novo',
      tema: 'fazer amigos',
      texto: 'Lucas chegou na escola nova com medo. Ele nao conhecia ninguem e sentia o coracao apertado. Na hora do recreio, ficou sozinho perto da arvore grande. Um menino chamado Pedro veio ate ele e perguntou se queria jogar bola. Lucas disse que sim, mesmo com vergonha. No comeco, ele errou alguns chutes e ficou com o rosto vermelho. Mas Pedro sorriu e disse que todo mundo erra no comeco. Aos poucos, Lucas foi se soltando. Ele descobriu que Pedro tambem tinha mudado de escola no ano passado e sabia como era dificil. Naquele dia, Lucas aprendeu algo importante. Fazer amigos nao exige ser perfeito. Basta ter coragem de dizer sim quando alguem estende a mao. Nem sempre vai dar certo na primeira vez, e tudo bem. O importante e tentar. Quando voltou para casa, Lucas contou para a mae sobre o dia. Ela ficou feliz e disse que ele tinha sido muito corajoso. Lucas dormiu naquela noite pensando que talvez a escola nova nao fosse tao ruim assim. Amanha ele ia procurar Pedro de novo para brincar.'
    },
    {
      id: 'c2',
      titulo: 'A Regra do Jogo',
      tema: 'limites e obediencia',
      texto: 'Marina adorava brincar no parque depois da escola. Sua mae sempre dizia que ela podia ficar ate as cinco horas, mas precisava voltar na hora certa. Um dia, Marina estava brincando tao feliz que esqueceu de olhar o relogio. Quando percebeu, ja passava das cinco e meia. Ela correu para casa e encontrou a mae preocupada na porta. Marina pediu desculpa e explicou que tinha perdido a hora. A mae ouviu com calma e disse que as regras existem para proteger, nao para castigar. Combinaram que Marina ia usar o alarme do relogio da mae no pulso. No dia seguinte, o alarme tocou e Marina se despediu dos amigos na hora certa. Chegou em casa e a mae estava sorrindo. Marina entendeu que seguir as regras nao tira a diversao. Na verdade, quando a mae confia nela, deixa ela fazer ainda mais coisas legais. As regras sao como as linhas do campo de futebol. Sem elas, o jogo vira bagunca e ninguem se diverte de verdade. Com elas, todo mundo sabe como jogar junto e se sentir seguro.'
    },
    {
      id: 'c3',
      titulo: 'O Dia em que Pedi Ajuda',
      tema: 'ansiedade social',
      texto: 'Beatriz era boa aluna, mas tinha muito medo de falar na frente da classe. Quando a professora pedia para ler em voz alta, seu coracao disparava e as maos ficavam frias. Ela achava que todos iam rir dela se errasse uma palavra. Um dia, a professora pediu que cada um contasse sobre o final de semana. Beatriz sentiu o estomago apertar. Ela respirou fundo, como a mae tinha ensinado, e levantou a mao. Quando comecou a falar, a voz saiu baixinha. A professora pediu que repetisse mais alto. Beatriz falou de novo, um pouco mais forte. Ninguem riu. Os colegas ouviram e ate fizeram perguntas sobre o passeio que ela fez. Quando sentou, Beatriz percebeu que suas maos ainda tremiam um pouco, mas ela estava sorrindo. Nao tinha sido perfeito, e nao precisava ser. Ela tinha conseguido. Depois da aula, a professora disse que ficou orgulhosa. Beatriz aprendeu que a coragem nao e a ausencia do medo. Coragem e fazer as coisas mesmo com medo. E a cada vez que tentamos, o medo fica um pouquinho menor que antes.'
    },
    {
      id: 'c4',
      titulo: 'Irmaos e Espacos',
      tema: 'convivencia familiar',
      texto: 'Tiago e sua irma Sofia dividiam o quarto. Ele gostava de silencio para montar seus quebra-cabecas, mas Sofia adorava cantar e dancar. Todos os dias tinha briga. Tiago gritava que ela fazia barulho demais. Sofia chorava dizendo que ele nao deixava ela se divertir. O pai reuniu os dois e trouxe uma folha de papel. Desenhou o quarto ao meio e perguntou o que cada um precisava. Tiago disse que queria pelo menos uma hora de silencio a tarde. Sofia disse que queria poder cantar sem ser chamada de chata. Juntos, fizeram um combinado. Das tres as quatro, era hora silenciosa. Das quatro as cinco, Sofia podia cantar e Tiago ia para a sala. No comeco foi estranho seguir o combinado. Mas depois de uma semana, as brigas diminuiram muito. Tiago ate comecou a gostar de ouvir Sofia cantar de longe. E Sofia aprendeu que respeitar o espaco do irmao nao significa que ele nao gosta dela. Conviver e aprender que o outro tambem tem necessidades. Quando a gente escuta o que o outro precisa, fica mais facil viver junto e ser feliz.'
    },
    {
      id: 'c5',
      titulo: 'O Grupo do Trabalho',
      tema: 'cooperacao e frustracao',
      texto: 'A professora dividiu a turma em grupos para um trabalho de ciencias. Gabriel ficou num grupo com tres colegas que ele nao conhecia muito bem. Ele queria fazer tudo sozinho porque achava que assim ficaria melhor. Mas a professora explicou que todos precisavam participar. No primeiro dia, cada um deu uma ideia diferente e ninguem concordava. Gabriel ficou irritado e cruzou os bracos. Uma colega chamada Ana disse que podiam votar. O grupo votou e escolheu uma ideia que nao era a de Gabriel. Ele ficou triste, mas decidiu ajudar mesmo assim. Surpreendeu a si mesmo quando descobriu que a ideia dos colegas era boa tambem. No final, o trabalho ficou melhor do que se ele tivesse feito sozinho. Tinha partes que ele nunca teria pensado. A professora elogiou o grupo todo e Gabriel sentiu orgulho. Ele aprendeu que trabalhar junto nao significa perder. Significa somar. As vezes a melhor ideia nao e a nossa, e tudo bem. O importante e contribuir com o que a gente sabe e deixar espaco para os outros tambem brilharem. Juntos, sempre vai ser mais.'
    }
  ],

  // ===== FAIXA 2: ADOLESCENTES (13 a 18 anos) - usada quando dificuldade = 0 =====
  adolescente: [
    {
      id: 'a1',
      titulo: 'A Conversa que Faltava',
      tema: 'comunicacao familiar',
      texto: 'Rafael tinha quinze anos e sentia que seus pais nao entendiam nada da vida dele. Cada conversa virava discussao. Ele queria sair com os amigos no sabado, mas o pai sempre dizia nao sem explicar o motivo. Um dia, em vez de bater a porta do quarto como sempre fazia, Rafael respirou fundo e voltou para a sala. Perguntou ao pai por que nao podia ir. O pai pareceu surpreso com a pergunta calma. Explicou que ficava preocupado porque nao conhecia os amigos novos. Rafael entendeu que a preocupacao nao era controle, era medo de pai. Propoz que seus amigos viessem em casa primeiro para o pai conhecer. O pai concordou. Naquela noite, Rafael percebeu que metade das brigas em casa aconteciam porque ninguem parava para ouvir o outro de verdade. Todo mundo falava, mas ninguem perguntava. Comunicacao nao e so dizer o que sente. E tambem perguntar o que o outro sente. Parece simples, mas exige maturidade. E maturidade nao vem com a idade. Vem com a pratica de escolher o dialogo antes do confronto. Nao funciona toda vez, mas funciona muito mais vezes do que o silencio ou o grito.'
    },
    {
      id: 'a2',
      titulo: 'O Lugar na Mesa',
      tema: 'pertencimento e ansiedade social',
      texto: 'Camila mudou de cidade no meio do ano letivo. Na escola nova, todos ja tinham seus grupos formados. No refeitorio, ela segurava a bandeja procurando um lugar para sentar, sentindo que todos a observavam. Na primeira semana, comeu sozinha fingindo mexer no celular. O estomago doia nao de fome, mas de ansiedade. Na segunda semana, uma garota chamada Luisa sentou ao lado dela e puxou conversa sobre musica. Camila quase nao conseguiu responder de tao nervosa. Mas Luisa era paciente e continuou voltando nos dias seguintes. Aos poucos, Camila foi apresentada a outras pessoas. Descobriu que nao precisava ser extrovertida para ser aceita. Bastava ser genuina. Tres meses depois, tinha um grupo pequeno mas verdadeiro de amigas. Olhando para tras, Camila percebeu que o mais dificil nao era encontrar pessoas legais. Era acreditar que merecia estar ali. A ansiedade social mente para a gente. Diz que somos demais ou de menos para qualquer grupo. A verdade e que todos se sentem deslocados em algum momento. A diferenca esta em quem decide ficar mesmo desconfortavel, ate que o desconforto diminua e o lugar se torne casa.'
    },
    {
      id: 'a3',
      titulo: 'Limites que Libertam',
      tema: 'desobediencia e consequencias',
      texto: 'Thiago tinha dezessete anos e odiava regras. Achava que os pais eram antiquados e que ele ja sabia cuidar de si mesmo. Comecou a chegar tarde sem avisar, mentir sobre onde estava e ignorar pedidos simples como arrumar o quarto. Sentia que estava exercendo liberdade. Ate o dia em que precisou de ajuda seria. Se meteu numa situacao complicada numa festa e nao tinha para quem ligar. Porque havia mentido tanto, nao podia contar a verdade aos pais sem revelar todas as mentiras anteriores. Ficou sozinho com o problema e sentiu medo de verdade. Quando finalmente contou tudo, esperava castigo pesado. Mas o pai disse algo que ficou na cabeca dele. Disse que confianca e como um cofrinho que demora para encher e esvazia rapido. E que limites nao existem para prender, existem para que exista uma base de seguranca. Thiago nao virou santo depois disso. Mas comecou a entender que desobedecer por impulso nao e liberdade. Liberdade de verdade vem quando as pessoas confiam em voce o suficiente para soltar. E confianca se constroi cumprindo combinados, mesmo os pequenos. Especialmente os pequenos.'
    },
    {
      id: 'a4',
      titulo: 'O Peso de Ser Popular',
      tema: 'pressao social e autenticidade',
      texto: 'Leticia era considerada popular na escola. Tinha muitos seguidores nas redes e sempre era convidada para tudo. Mas por dentro se sentia exausta. Precisava sempre estar arrumada, dizer as coisas certas e concordar com o grupo mesmo quando discordava. Se expressasse uma opiniao diferente, sentia que seria excluida. Um dia, o grupo comecou a fazer comentarios maldosos sobre uma colega nova. Leticia sabia que era errado, mas ficou em silencio. A noite, nao conseguiu dormir. Sentiu vergonha de si mesma. Na manha seguinte, tomou uma decisao. Falou para o grupo que nao queria participar daquilo. Algumas amigas a olharam estranho. Duas se afastaram. Mas tres concordaram em silencio e depois vieram falar com ela em particular. Leticia descobriu que autenticidade custa caro no comeco, mas e o unico investimento que se paga no longo prazo. Perder pessoas que so gostam de voce quando voce concorda com tudo nao e perda. E filtragem. As relacoes que sobrevivem a honestidade sao as que realmente importam. Popularidade sem liberdade de ser quem voce e nao e pertencimento. E apenas plateia. E ninguem merece viver a propria vida como ator de um papel que nao escolheu.'
    },
    {
      id: 'a5',
      titulo: 'Recomecar em Casa',
      tema: 'conflito familiar e reconstrucao',
      texto: 'Depois da separacao dos pais, Fernanda sentia raiva de tudo. Raiva do pai que saiu, da mae que chorava toda noite, do irmao que fingia que nada aconteceu. Ela descontava em casa. Respondia mal, batia portas, se isolava. Queria que alguem percebesse sua dor sem que ela precisasse dizer. Mas ninguem lia sua mente. Um dia, a mae sentou ao lado dela no quarto e nao disse nada. Ficou ali em silencio. Fernanda achou estranho, mas depois de uns minutos comecou a chorar. E a mae chorou junto. Naquele dia nao resolveram nada com palavras. Mas algo mudou. Fernanda percebeu que a mae tambem estava sofrendo e que nao era sua inimiga. Comecaram aos poucos a conversar mais. Nao sobre coisas profundas toda vez, as vezes so sobre o jantar ou uma serie. Mas essas conversas pequenas foram reconstruindo a ponte entre elas. Recomecar em casa nao significa esquecer o que aconteceu. Significa decidir que as pessoas que ficaram merecem o melhor da gente, mesmo que a gente nao esteja no melhor momento. Curar relacionamentos e um processo lento. Nao acontece num dia, mas comeca com uma escolha. A escolha de ficar quando tudo pede para sair.'
    }
  ],

  // ===== NIVEL 3: mais facil (3 linhas) - IGNORA a idade =====
  nivel3: [
    {
      id: 'n3_1',
      titulo: 'Um Novo Amigo',
      tema: 'fazer amizades',
      texto: 'Joao era novo na escola. No recreio, ficou sozinho num canto. Entao um colega chegou perto e ofereceu metade do lanche. Os dois conversaram e riram juntos. Joao entendeu que fazer um amigo comeca com um gesto simples.'
    },
    {
      id: 'n3_2',
      titulo: 'A Casa Nova',
      tema: 'mudanca de casa',
      texto: 'Hoje foi o ultimo dia na casa antiga. Pedro guardou seus brinquedos em caixas e olhou o quarto vazio. Amanha vai dormir numa cidade diferente, longe dos amigos. Ele nao sabe como vai ser a escola nova nem quem vai sentar ao seu lado.'
    },
    {
      id: 'n3_3',
      titulo: 'Os Barulhos',
      tema: 'escutar vozes',
      texto: 'As vezes Lucas escuta barulhos que os outros nao escutam. Isso o deixa assustado e confuso. Ele resolveu contar para a mae o que estava sentindo. Ela o abracou e disse que iam procurar ajuda juntos. Falar sobre o que sentimos e o primeiro passo.'
    },
    {
      id: 'n3_4',
      titulo: 'Antes da Prova',
      tema: 'ansiedade',
      texto: 'Amanha tem prova e Mariana nao consegue dormir. O coracao bate rapido e os pensamentos nao param. Ela ja estudou, mas sente um medo que nao vai embora. Fica olhando o teto, imaginando tudo o que pode dar errado.'
    },
    {
      id: 'n3_5',
      titulo: 'Meu Corpo e Meu',
      tema: 'autoprotecao',
      texto: 'Tem segredos bons, como uma festa surpresa. Mas tem segredos que deixam a gente com medo ou desconfortavel. Esses nao devem ser guardados. Se alguem pede um segredo assim, ou toca voce de um jeito que incomoda, conte para um adulto de confianca. Dizer nao e pedir ajuda sempre e o certo.'
    }
  ],

  // ===== NIVEL 2: intermediario (1 paragrafo, ~5 linhas) - IGNORA a idade =====
  nivel2: [
    {
      id: 'n2_1',
      titulo: 'A Mensagem Maldosa',
      tema: 'bullying',
      texto: 'Clara recebeu uma mensagem cruel no grupo da turma. Alguns colegas riram, mas ela ficou calada e triste a tarde inteira. No dia seguinte, uma amiga percebeu e sentou ao lado dela. Disse que aquilo era errado e que Clara nao estava sozinha. Juntas, procuraram a professora para contar o que tinha acontecido. Clara aprendeu que pedir ajuda nao e fraqueza, e coragem.'
    },
    {
      id: 'n2_2',
      titulo: 'A Regra do Meu Pai',
      tema: 'pais autoritarios',
      texto: 'Na casa de Bruno, as ordens do pai nao se discutem. Horario para tudo, resposta sempre na ponta da lingua, e um porque eu mandei encerrando qualquer conversa. Bruno queria explicar o seu lado sobre a nota baixa, mas nem teve chance de abrir a boca. Engoliu o choro e subiu para o quarto. La dentro, ficou pensando em tudo o que gostaria de ter dito e nao pode.'
    },
    {
      id: 'n2_3',
      titulo: 'As Letras que Dancam',
      tema: 'dificuldade de aprendizado',
      texto: 'Para Tiago, ler era uma luta. As letras pareciam trocar de lugar e ele demorava o dobro do tempo que os colegas. Sentia vergonha quando a professora pedia leitura em voz alta. Um dia, uma nova professora percebeu a dificuldade e passou a ajuda-lo com um metodo diferente. Aos poucos, as letras foram fazendo mais sentido. Tiago entendeu que seu cerebro so aprendia de outro jeito, e tudo bem.'
    },
    {
      id: 'n2_4',
      titulo: 'A Explosao',
      tema: 'controle emocional',
      texto: 'Gabriel perdeu o jogo e sentiu uma raiva subir que ele nao conseguiu segurar. Jogou o controle no chao, gritou com o irmao e bateu a porta com forca. Minutos depois, sozinho no quarto, o peito ainda estava quente e as maos tremiam. Ele sabia que tinha exagerado, mas naquele momento parecia impossivel frear. A raiva vinha mais rapido do que a vontade de parar.'
    },
    {
      id: 'n2_5',
      titulo: 'Sete Vezes',
      tema: 'TOC',
      texto: 'Antes de sair, Helena precisava verificar a porta sete vezes. Se parasse antes, uma angustia tomava conta dela, como se algo terrivel fosse acontecer. Ela sabia que nao fazia sentido, mas nao conseguia evitar. Cansada, procurou ajuda de uma psicologa. Aprendeu que aqueles pensamentos tinham nome e tratamento. Devagar, foi conseguindo sair de casa verificando so uma vez.'
    }
  ],

  // ===== NIVEL 1: mais dificil (2 paragrafos, ~5 linhas cada) - IGNORA a idade =====
  nivel1: [
    {
      id: 'n1_1',
      titulo: 'O Convite que Nao Veio',
      tema: 'dificuldade de socializar',
      texto: 'Rafael viu as fotos da festa nas redes sociais e sentiu um aperto no peito. Todos os colegas da turma estavam la, menos ele. Ninguem o tinha convidado. A primeira reacao foi pensar que havia algo errado consigo mesmo, que talvez ele fosse chato ou invisivel demais para merecer um lugar entre os outros. Passou a noite remoendo essa ideia sozinho no quarto. Na manha seguinte, a simples ideia de entrar na sala e encarar os colegas fazia o estomago embrulhar. E se perguntassem por que ele nao tinha ido? E se percebessem que ninguem o chamou? Rafael parou na porta da escola, respirando fundo, com as pernas pesadas. A vontade de dar meia-volta e voltar para casa era grande.'
    },
    {
      id: 'n1_2',
      titulo: 'Duas Casas',
      tema: 'separacao dos pais',
      texto: 'Quando os pais de Beatriz se separaram, a vida dela virou de cabeca para baixo. Agora eram duas casas, duas camas, duas rotinas. Ela sentia raiva de ter que arrumar a mochila toda semana e culpa por nao conseguir ficar feliz em nenhum dos dois lugares. As vezes achava que, de algum jeito, a separacao era culpa dela. Com o tempo, e conversando com uma psicologa, Beatriz foi entendendo que a separacao era uma decisao dos adultos, e nao algo que ela tivesse causado. Percebeu que continuava sendo amada pelos dois, mesmo que de enderecos diferentes. As duas casas foram, aos poucos, virando dois lugares seguros. Beatriz aprendeu que uma familia pode mudar de forma sem deixar de ser familia.'
    },
    {
      id: 'n1_3',
      titulo: 'Pode Tudo',
      tema: 'pais permissivos',
      texto: 'Na casa de Leo, nao existiam regras. Ele dormia na hora que queria, comia o que bem entendia e passava a noite nos jogos sem ninguem dizer nada. No comeco parecia o sonho de qualquer adolescente. Os amigos ate invejavam a liberdade total que ele tinha dentro de casa. Mas havia algo estranho naquele silencio dos pais. Quando Leo tirava nota baixa, ninguem comentava. Quando sumia o dia inteiro, ninguem perguntava onde tinha ido. Aos poucos, aquela liberdade comecou a parecer outra coisa, como se nao houvesse ninguem ali prestando atencao nele de verdade. Leo as vezes se perguntava se alguem notaria caso ele simplesmente nao voltasse para casa.'
    },
    {
      id: 'n1_4',
      titulo: 'Rapido Demais',
      tema: 'altas habilidades',
      texto: 'Desde pequena, Sofia pensava rapido demais. Terminava as tarefas antes de todos, fazia perguntas que a turma achava estranhas e se entediava nas aulas. Em vez de se sentir especial, muitas vezes se sentia deslocada, como se falasse uma lingua que ninguem ao redor entendia. Comecou a esconder o que sabia so para nao parecer diferente. Um dia, uma professora percebeu o potencial de Sofia e a desafiou com projetos mais complexos. Pela primeira vez, ela sentiu que podia ser ela mesma sem precisar se encolher. Conheceu outros jovens parecidos e descobriu que nao estava sozinha. Sofia entendeu que ser diferente nao era um defeito a esconder, mas uma parte dela que merecia espaco para crescer.'
    },
    {
      id: 'n1_5',
      titulo: 'O Nome do Diagnostico',
      tema: 'conviver com um diagnostico',
      texto: 'No dia em que recebeu o diagnostico, Daniel sentiu um misto de alivio e medo. Alivio porque, finalmente, aquilo que ele sentia ha anos tinha um nome. Medo porque nao sabia o que esse nome significaria dali para frente, nem como as pessoas iriam reagir ao saber. Ficou girando o papel do laudo nas maos, calado. No caminho de volta, Daniel pensava se devia contar aos amigos ou guardar so para si. Imaginava os olhares, as perguntas, os possiveis rotulos. Ao mesmo tempo, uma parte dele queria entender melhor o proprio funcionamento, aprender a lidar, buscar apoio. Entre o receio de ser reduzido a um rotulo e a vontade de finalmente se compreender, Daniel seguia pensando no que fazer com aquela nova informacao.'
    }
  ]
};

// Funcao para sortear texto por faixa etaria e nivel de dificuldade.
// - idade: idade em anos (usada apenas quando dificuldade = 0)
// - dificuldade: 0 (sem indicacao, usa idade) ou 1, 2, 3 (ignora idade, usa o nivel)
// Retorna um objeto de texto aleatorio da categoria correspondente.
function sortearTextoLermais(idade, dificuldade) {
  var categoria;
  var nivel = parseInt(dificuldade, 10);
  if (nivel === 1) {
    categoria = 'nivel1';
  } else if (nivel === 2) {
    categoria = 'nivel2';
  } else if (nivel === 3) {
    categoria = 'nivel3';
  } else {
    // Dificuldade 0 (ou nao informada): usa a idade para escolher a faixa
    categoria = (idade >= 6 && idade <= 12) ? 'crianca' : 'adolescente';
  }
  var textos = TEXTOS_LERMAIS[categoria];
  if (!textos || textos.length === 0) textos = TEXTOS_LERMAIS['adolescente'];
  var indice = Math.floor(Math.random() * textos.length);
  return textos[indice];
}
