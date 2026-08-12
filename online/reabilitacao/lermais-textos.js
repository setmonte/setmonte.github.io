// ===== LERMAIS - Banco de Textos Motivacionais Relacionais =====
// Programa de Leitura Motivacional para Reabilitacao
// Temas: relacoes familiares, amizades, ansiedade social, limites, convivencia
// Faixa 1: 6-12 anos (linguagem simples, frases curtas)
// Faixa 2: 13-18 anos (linguagem mais elaborada, reflexiva)

var TEXTOS_LERMAIS = {

  // ===== FAIXA 1: CRIANCAS (6 a 12 anos) =====
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

  // ===== FAIXA 2: ADOLESCENTES (13 a 18 anos) =====
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
      texto: 'Camila mudou de cidade no meio do ano letivo. Na escola nova, todos ja tinham seus grupos formados. No refeitorio, ela segurava a bandeja procurando um lugar para sentar, sentindo que todos a observavam. Na primeira semana, comeu sozinha fingindo mexer no celular. O estomago doía nao de fome, mas de ansiedade. Na segunda semana, uma garota chamada Luisa sentou ao lado dela e puxou conversa sobre musica. Camila quase nao conseguiu responder de tao nervosa. Mas Luisa era paciente e continuou voltando nos dias seguintes. Aos poucos, Camila foi apresentada a outras pessoas. Descobriu que nao precisava ser extrovertida para ser aceita. Bastava ser genuina. Tres meses depois, tinha um grupo pequeno mas verdadeiro de amigas. Olhando para tras, Camila percebeu que o mais dificil nao era encontrar pessoas legais. Era acreditar que merecia estar ali. A ansiedade social mente para a gente. Diz que somos demais ou de menos para qualquer grupo. A verdade e que todos se sentem deslocados em algum momento. A diferenca esta em quem decide ficar mesmo desconfortavel, ate que o desconforto diminua e o lugar se torne casa.'
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
  ]
};

// Funcao para sortear texto por faixa etaria
// Recebe a idade em anos e retorna um texto aleatorio da faixa correspondente
function sortearTextoLermais(idade) {
  var faixa = (idade >= 6 && idade <= 12) ? 'crianca' : 'adolescente';
  var textos = TEXTOS_LERMAIS[faixa];
  if (!textos || textos.length === 0) textos = TEXTOS_LERMAIS['adolescente'];
  var indice = Math.floor(Math.random() * textos.length);
  return textos[indice];
}
