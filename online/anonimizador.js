// ============================================
// ANONIMIZADOR INVISIVEL DE DADOS CLINICOS
// Para setmonte.github.io -- SYM Online
// Filtra dados identificaveis ANTES de enviar para a IA
// Recoloca dados reais APOS a resposta da IA
// ============================================

var Anonimizador = (function() {

  // === REGEX PARA DADOS IDENTIFICAVEIS ===

  // CPF: 123.456.789-00 ou 12345678900
  var REGEX_CPF = /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2}\b/g;

  // Telefone: (67) 99999-9999 ou 67999999999 ou variantes
  var REGEX_TELEFONE = /\(?\d{2}\)?[\s\-.]?\d{4,5}[\s\-.]?\d{4}/g;

  // Email
  var REGEX_EMAIL = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

  // Endereco: Rua/Av/Travessa/etc + conteudo ate o proximo ponto-final de frase
  // Captura ate encontrar ". " seguido de maiuscula, ou fim de linha
  var REGEX_ENDERECO = /\b(Rua|Av\.|Avenida|Travessa|Alameda|Pra[c\u00e7]a|Rod\.|Rodovia|Estr\.|Estrada|Beco|Viela|Largo)\s+[A-Za-z\u00C0-\u017F0-9\s,\-\u00b0.\/]+?(?=\.\s+[A-Z]|\.\s*$|$)/gi;

  // CEP: 79000-000 ou 79000000
  var REGEX_CEP = /\b\d{5}[-]?\d{3}\b/g;

  // Valores monetarios: R$ 1.000,00 ou R$12000 ou 12.000 reais
  var REGEX_DINHEIRO = /R\$\s*[\d.,]+|\b\d{1,3}(?:\.\d{3})+(?:,\d{2})?\b(?:\s*reais)?/gi;

  // RG: 1234567 SSP/MS ou similar
  var REGEX_RG = /\b\d{5,9}[\s\-]?(?:SSP|SDS|DETRAN|PC|IFP|SESP|DGPC)[\/\s]?[A-Z]{2}\b/gi;

  // === FUNCAO PRINCIPAL: MASCARAR ===
  // texto: string com a transcricao/observacao
  // contexto: { paciente: "Nome Completo", familiares: { mae: "Maria", pai: "Jose" } }
  // Retorna: { textoLimpo: "...", mapa: { "[PACIENTE]": "Joao da Silva", ... } }

  function mascarar(texto, contexto) {
    if (!texto || typeof texto !== 'string') return { textoLimpo: '', mapa: {} };

    var mapa = {};
    var resultado = texto;
    var contadorPessoa = 0;

    // 0. PRE-FILTRO: Remover emails, CPFs e telefones ANTES de mexer nos nomes
    // (evita que "joao@gmail.com" vire "[PACIENTE]@gmail.com")
    resultado = resultado.replace(REGEX_EMAIL, function(match) {
      if (!mapa['[EMAIL]']) mapa['[EMAIL]'] = match;
      return '[EMAIL_REMOVIDO]';
    });
    resultado = resultado.replace(REGEX_CPF, function(match) {
      mapa['[CPF]'] = match;
      return '[CPF_REMOVIDO]';
    });
    resultado = resultado.replace(REGEX_RG, function(match) {
      mapa['[RG]'] = match;
      return '[RG_REMOVIDO]';
    });

    // 1. Substituir nome do paciente (se fornecido)
    if (contexto && contexto.paciente && contexto.paciente.trim()) {
      var nomePaciente = contexto.paciente.trim();
      mapa['[PACIENTE]'] = nomePaciente;

      // Substituir nome completo primeiro
      resultado = _substituirNome(resultado, nomePaciente, '[PACIENTE]');

      // Substituir partes do nome (sobrenome, primeiro nome) -- minimo 3 letras
      var partes = nomePaciente.split(/\s+/);
      for (var i = 0; i < partes.length; i++) {
        if (partes[i].length > 2) {
          resultado = _substituirNome(resultado, partes[i], '[PACIENTE]');
        }
      }
    }

    // 2. Substituir nomes de familiares (se fornecidos)
    if (contexto && contexto.familiares) {
      var relacoes = Object.keys(contexto.familiares);
      for (var r = 0; r < relacoes.length; r++) {
        var relacao = relacoes[r]; // "mae", "pai", "esposa", etc.
        var nomeFamiliar = contexto.familiares[relacao];
        if (nomeFamiliar && nomeFamiliar.trim().length > 2) {
          var tag = '[' + relacao.toUpperCase() + ']';
          mapa[tag] = nomeFamiliar.trim();
          resultado = _substituirNome(resultado, nomeFamiliar.trim(), tag);
          // Partes do nome do familiar tambem
          var partesFam = nomeFamiliar.trim().split(/\s+/);
          for (var pf = 0; pf < partesFam.length; pf++) {
            if (partesFam[pf].length > 2) {
              resultado = _substituirNome(resultado, partesFam[pf], tag);
            }
          }
        }
      }
    }

    // 3. Detectar nomes proprios restantes (palavras capitalizadas em contexto de parentesco)
    resultado = resultado.replace(
      /\b([Mm][a\u00e3]e|[Pp]ai|[Ii]rm[a\u00e3][o]?|[Ee]sposa|[Mm]arido|[Nn]amorad[oa]|[Ff]ilh[oa]|[Aa]v[o\u00f3]|[Tt]i[oa]|[Pp]rim[oa]|[Ss]ogr[oa]|[Cc]unhad[oa]|[Pp]adrasto|[Mm]adrasta|[Ee]nteado|[Nn]et[oa]|[Vv]izinh[oa]|[Aa]mig[oa]|[Cc]olega|[Cc]hefe|[Pp]rofessor[a]?|[Cc]ompanheir[oa])\s+([A-Z\u00C0-\u00DC][a-z\u00E0-\u00FC]+(?:\s+[A-Z\u00C0-\u00DC][a-z\u00E0-\u00FC]+){0,3})\b/g,
      function(match, parentesco, nome) {
        contadorPessoa++;
        var tag = '[PESSOA_' + contadorPessoa + ']';
        mapa[tag] = nome;
        return parentesco + ' ' + tag;
      }
    );

    // 4. Detectar outros nomes proprios (sequencia de 2+ palavras capitalizadas que parecem nomes)
    // Palavras que NAO sao nomes (artigos, preposicoes, termos clinicos comuns)
    var NAO_NOMES = ['Escala','Teste','Hospital','Escola','Universidade','Faculdade',
      'Instituto','Centro','Clinica','Doutor','Doutora','Professor','Professora',
      'Rua','Avenida','Bairro','Cidade','Estado','Brasil','Janeiro','Fevereiro',
      'Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro',
      'Novembro','Dezembro','Segunda','Terca','Quarta','Quinta','Sexta',
      'Sabado','Domingo','DSM','CID','OMS','SUS','CAPS','UBS','CRAS',
      'Transtorno','Sindrome','Depressao','Ansiedade','TDAH','TEA','TOC','TOD',
      'Beck','Wechsler','Rorschach','Piaget','Freud','Skinner','Vygotsky',
      'Likert','Wisconsin','Stroop','Trail','Making','Corsi','Rey',
      'Nao','Sim','Muito','Pouco','Mais','Menos','Ainda','Tambem','Sempre','Nunca',
      'Hoje','Ontem','Amanha','Depois','Antes','Durante','Quando','Onde','Como',
      'Paciente','Avaliador','Terapeuta','Psicologo','Psiquiatra','Neurologista',
      'Criterio','Resultado','Dominio','Categoria','Classificacao','Pontuacao'];

    resultado = resultado.replace(
      /\b([A-Z\u00C0-\u00DC][a-z\u00E0-\u00FC]{2,}(?:\s+(?:de|da|do|dos|das|e)\s+)?[A-Z\u00C0-\u00DC][a-z\u00E0-\u00FC]{2,}(?:\s+[A-Z\u00C0-\u00DC][a-z\u00E0-\u00FC]{2,})*)\b/g,
      function(match) {
        // Verificar se ja foi substituido (contem colchetes)
        if (match.indexOf('[') >= 0) return match;
        // Verificar se e uma palavra conhecida (nao e nome)
        var primeira = match.split(/\s+/)[0];
        for (var n = 0; n < NAO_NOMES.length; n++) {
          if (primeira === NAO_NOMES[n]) return match;
        }
        // Verificar se ja esta no mapa (evitar duplicar)
        var jaExiste = false;
        var chaves = Object.keys(mapa);
        for (var c = 0; c < chaves.length; c++) {
          if (mapa[chaves[c]] === match) { jaExiste = true; break; }
        }
        if (jaExiste) return match.replace(new RegExp(_escaparRegex(match), 'gi'), chaves[c] || '[PESSOA]');
        contadorPessoa++;
        var tag = '[PESSOA_' + contadorPessoa + ']';
        mapa[tag] = match;
        return tag;
      }
    );

    // 5. Substituir telefone (nao foi movido pro pre-filtro pois nao contem nomes)
    resultado = resultado.replace(REGEX_TELEFONE, function(match) {
      if (!mapa['[TELEFONE]']) mapa['[TELEFONE]'] = match;
      return '[TELEFONE_REMOVIDO]';
    });

    // 6. Substituir endereco
    resultado = resultado.replace(REGEX_ENDERECO, function(match) {
      if (!mapa['[ENDERECO]']) mapa['[ENDERECO]'] = match;
      return '[ENDERECO_REMOVIDO]';
    });

    // 7. Substituir CEP
    resultado = resultado.replace(REGEX_CEP, function(match) {
      mapa['[CEP]'] = match;
      return '[CEP_REMOVIDO]';
    });

    // 8. Substituir valores monetarios por faixa
    resultado = resultado.replace(REGEX_DINHEIRO, function(match) {
      var valor = _extrairValor(match);
      if (valor > 0) {
        if (!mapa['[VALOR]']) mapa['[VALOR]'] = match;
        return _faixaSalarial(valor);
      }
      return match;
    });

    return { textoLimpo: resultado, mapa: mapa };
  }

  // === FUNCAO PRINCIPAL: DESMASCARAR ===
  // texto: string que voltou da IA (com tags [PACIENTE], [MAE], etc.)
  // mapa: o mesmo mapa retornado pelo mascarar()
  // Retorna: string com os dados reais de volta

  function desmascarar(texto, mapa) {
    if (!texto || !mapa) return texto || '';

    var resultado = texto;
    var chaves = Object.keys(mapa);

    // Ordenar por tamanho da chave (maior primeiro) para evitar substituicoes parciais
    chaves.sort(function(a, b) { return b.length - a.length; });

    for (var i = 0; i < chaves.length; i++) {
      var tag = chaves[i];
      var valorReal = mapa[tag];

      // Substituir a tag pelo valor real (case insensitive)
      var regex = new RegExp(_escaparRegex(tag), 'gi');
      resultado = resultado.replace(regex, valorReal);
    }

    // Limpar tags _REMOVIDO que a IA pode ter mantido
    resultado = resultado.replace(/\[CPF_REMOVIDO\]/g, '');
    resultado = resultado.replace(/\[TELEFONE_REMOVIDO\]/g, '');
    resultado = resultado.replace(/\[EMAIL_REMOVIDO\]/g, '');
    resultado = resultado.replace(/\[ENDERECO_REMOVIDO\]/g, '');
    resultado = resultado.replace(/\[CEP_REMOVIDO\]/g, '');
    resultado = resultado.replace(/\[RG_REMOVIDO\]/g, '');

    return resultado;
  }

  // === FUNCOES AUXILIARES ===

  // Substituir nome no texto (case insensitive, respeitando limites de palavra)
  function _substituirNome(texto, nome, tag) {
    if (!nome || nome.length < 3) return texto;
    var regex = new RegExp('\\b' + _escaparRegex(nome) + '\\b', 'gi');
    return texto.replace(regex, tag);
  }

  // Escapar caracteres especiais para uso em regex
  function _escaparRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Extrair valor numerico de string monetaria (R$ 12.000,00 -> 12000)
  function _extrairValor(str) {
    var limpo = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    var num = parseFloat(limpo);
    return isNaN(num) ? 0 : num;
  }

  // Converter valor exato em classe economica (IBGE/Ipea 2025)
  // Classe E: ate R$1.518 | D: R$1.518-3.500 | C: R$3.500-8.300 | B: R$8.300-18.740 | A: acima de R$18.740
  function _faixaSalarial(valor) {
    if (valor <= 1518) return '[renda classe E]';
    if (valor <= 3500) return '[renda classe D]';
    if (valor <= 8300) return '[renda classe C]';
    if (valor <= 18740) return '[renda classe B]';
    return '[renda classe A]';
  }

  // === FUNCAO DE CONVENIENCIA: MASCARAR PROMPT COMPLETO ===
  // Util para interceptar prompts ja montados (ex: TECFE, TTE)
  // Aplica apenas limpeza de CPF/tel/email/endereco (sem contexto de nomes)

  function mascararPrompt(prompt, contexto) {
    return mascarar(prompt, contexto || {});
  }

  // === API PUBLICA ===
  return {
    mascarar: mascarar,
    desmascarar: desmascarar,
    mascararPrompt: mascararPrompt
  };

})();
