# Fundamentação — Captação de voz e distinção "leitura difícil" x "falha técnica" no TFLOD

Documento de registro técnico-clínico das decisões tomadas sobre o tratamento do áudio no
TFLOD (Teste de Fluência Leitora Oral Digital). Serve para deixar documentado *por que* o
teste decide o que decide, já que num instrumento de avaliação a régua precisa ser estável e
justificável. Última atualização: setembro/2026.

---

## 1. O problema que motivou este documento

O TFLOD grava a leitura em voz alta do paciente e envia o áudio para transcrição via OpenAI
Whisper (na Lambda). A partir da transcrição, calcula o PCPM (palavras corretas por minuto).

Observou-se um alerta recorrente de "PCPM zero (áudio sem leitura reconhecível)". A investigação
mostrou que o código já tinha as proteções de captação corretas (espera do `onstop`, validação
de áudio vazio, retry, codec por suporte, bitrate 96k). O problema restante não é mais de
montagem do áudio: é a **fronteira entre dois casos clinicamente diferentes** que o sistema
tratava como um só.

Os dois casos:

- **Falha técnica de captação** — microfone mudo/abafado, áudio praticamente sem fala, ou o
  transcritor devolvendo texto que não corresponde ao que foi lido. Aqui o correto é pedir para
  refazer (não é resultado clínico).
- **Leitor com dificuldade real** — pessoa que lê pouco, devagar, baixinho, com pausas e trocas
  fonológicas. Aqui existe leitura de verdade e o resultado (PCPM baixo) é um dado clínico
  legítimo, que **não pode** ser descartado como erro.

O risco do desenho anterior (`if (pcpm <= 0 || acertos <= 0)` = erro) era jogar fora um leitor
com muita dificuldade, tratando-o como falha técnica.

---

## 2. Fala ruidosa x grunhido (base fonoaudiológica)

A distinção entre "a pessoa falou" e "a pessoa emitiu um som não-articulado" apoia-se em três
critérios da literatura de fonoaudiologia e de tecnologia assistiva:

- **Intencionalidade comunicativa** — na fala há intenção de produzir símbolos verbais; no
  grunhido, a emissão é reflexiva/instintiva (dor, esforço, cansaço).
- **Articulação** — a fala usa articuladores ativos e passivos (língua, lábios, dentes,
  alvéolos), modulando o trato vocal; o grunhido é essencialmente glótico/gutural (só pregas
  vocais e faringe), sem participação dos articuladores.
- **Estrutura fonêmica** — a fala forma fonemas reconhecíveis (mesmo distorcida, como na
  disartria); o grunhido não tem estrutura fonêmica.

**Menor unidade que caracteriza fala (e não grunhido):** uma sílaba do tipo consoante+vogal
(CV) — "pá", "dá", "lá", "não". A presença de uma **consoante** (especialmente oclusiva, como
/p/ e /t/) é a marca de controle motor voluntário, porque exige interromper e liberar o ar de
forma articulada — algo que um grunhido não produz. Vogal isolada sustentada ("aaah") **não
basta**, pois pode ser produzida por emissão reflexiva.

Fontes (fonoaudiologia / disartria):
- Profiles of Dysarthria: Clinical Assessment and Treatment. https://pmc.ncbi.nlm.nih.gov/articles/PMC10813547/
- Dysarthria: Best Practices for Assessing Intelligibility. https://www.speechpathology.com/articles/dysarthria-best-practices-for-assessing-20695
- An automatic measure for speech intelligibility in dysarthrias. https://pmc.ncbi.nlm.nih.gov/articles/PMC11300433/

Conteúdo das fontes foi resumido e reescrito para fins de registro (não reproduz trechos literais).

---

## 3. A descoberta que inverte parte da intuição: Whisper "alucina" com som não-fala

Um ponto crítico levantado pela literatura recente de reconhecimento de fala: quando o Whisper
recebe áudio **sem fala** (silêncio, respiração, ruído, grunhido), ele tende a **alucinar** —
inventar texto que não foi dito, muitas vezes repetindo palavras ou frases.

Consequência para o TFLOD: um paciente que apenas grunhiu ou ficou em silêncio pode gerar uma
transcrição com "palavras fantasma", produzindo um PCPM **falsamente positivo** (não zero).
Ou seja, o risco do som não-articulado no TFLOD não é ser descartado — é ser aceito como
leitura que nunca aconteceu.

Por isso a peneira precisa proteger os **dois lados**:
1. não descartar leitor real com dificuldade;
2. não aceitar alucinação/ruído como se fosse leitura.

Fontes (alucinação do Whisper / VAD):
- Investigation of Whisper ASR Hallucinations Induced by Non-Speech Audio. https://arxiv.org/html/2501.11378v1
- Reducing Hallucinated Transcripts in Whisper via Hallucination Space Projection. https://arxiv.org/html/2609.04561v1
- WhisperX: Time-Accurate Speech Transcription (uso de VAD). https://arxiv.org/html/2303.00747v1

---

## 4. Métrica de fluência: base do PCPM

A medida de fluência leitora oral usada pelo TFLOD é o WCPM (words correct per minute / PCPM).
Na aplicação tradicional, o leitor lê um trecho por 1 minuto e o avaliador calcula as palavras
corretas subtraindo as lidas incorretamente do total lido. É medida consolidada como rastreio
em Curriculum-Based Measurement.

Fontes:
- Equating Oral Reading Fluency Scores: A Model-Based Approach. https://pmc.ncbi.nlm.nih.gov/articles/PMC10795571/
- Estimating Model-Based Oral Reading Fluency: A Bayesian Approach. https://pmc.ncbi.nlm.nih.gov/articles/PMC7425326/

---

## 5. Decisão sobre "dicionário que aprende com o tempo" (adiada, com justificativa)

Foi considerada a ideia de uma IA que fosse acumulando um dicionário paralelo a cada aplicação,
ficando "mais experiente". Decisão registrada: **não implementar agora**, por dois motivos.

1. **Arquitetura.** O TFLOD roda no navegador do paciente, que é descartável — nada persiste
   entre pacientes. Para acumular de verdade, o dicionário teria que morar no servidor
   (Lambda + banco de dados, ou algo como uma planilha Google). É um projeto próprio, com custo
   e manutenção.

2. **Validade psicométrica (prioridade definida pelo usuário).** Um instrumento cuja régua
   **muda sozinha** ao longo do tempo compromete a comparabilidade entre laudos: dois resultados
   medidos em épocas diferentes deixam de ser equivalentes. Em avaliação, a régua precisa ser
   estável e documentada. A prioridade acordada é **precisão/estabilidade do teste acima da
   evolução automática**.

Registro da intenção futura: estudar, mais adiante, uma aprendizagem de fluxo separada
(por exemplo, coleta em Google Sheets), como camada de pesquisa que **não altera** o escore
clínico corrente.

---

## 6. O que NÃO foi feito (e por quê)

- **Análise acústica fina no navegador** (formantes, energia acima de 4 kHz, VAD por duração):
  tecnicamente pertinente para separar fala de grunhido, mas exige o áudio cru **antes** da
  compressão (o TFLOD grava em webm/opus). É complexo e instável em celular. Descartado por ora
  em favor de uma peneira baseada em texto, mais simples e transparente.

---

## 7. Regra adotada na peneira pós-Whisper (versão estável)

A lógica aplicada após a transcrição, sem alterar o cálculo do PCPM já existente:

- Conta quantas **palavras reais do texto-alvo** apareceram na transcrição (não fragmentos
  soltos nem palavras fora do texto).
- **Detecta alucinação**: repetição excessiva da mesma palavra/frase ou texto sem relação com o
  parágrafo lido → suspeita de áudio sem fala real → tratar como falha técnica (refazer).
- Se apareceram **pelo menos algumas palavras reais do texto** (leitura difícil que ocorreu de
  verdade) → **aceitar como resultado clínico válido** (PCPM baixo real), nunca descartar.
- Marcar como **falha técnica** somente quando: transcrição vazia, OU apenas alucinação, OU
  nenhuma palavra do texto-alvo reconhecida.

O limiar de "palavras reais do texto" que separa leitura real de falha é um parâmetro clínico,
definido pelo neuropsicólogo responsável e documentado no código do TFLOD.
