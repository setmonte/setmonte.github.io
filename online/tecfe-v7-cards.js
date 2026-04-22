// tecfe-v7-cards.js - Geracao SVG das cartas
// SEM acentos nos comentarios/strings do codigo

var WCSTCards = (function () {

  var colorMap = {
    vermelho: 'red', verde: 'green', amarelo: 'yellow', azul: 'blue'
  };
  var shapeMap = {
    triangulo: 'triangle', estrela: 'star', cruz: 'cross', circulo: 'circle'
  };

  var stimulusCards = [
    { cor: 'vermelho', forma: 'triangulo', numero: '1' },
    { cor: 'verde',    forma: 'estrela',   numero: '2' },
    { cor: 'amarelo',  forma: 'cruz',      numero: '3' },
    { cor: 'azul',     forma: 'circulo',   numero: '4' }
  ];

  function buildDeck() {
    var cores = ['vermelho', 'verde', 'amarelo', 'azul'];
    var formas = ['triangulo', 'estrela', 'cruz', 'circulo'];
    var nums = ['1', '2', '3', '4'];
    var deck = [];
    for (var i = 0; i < 64; i++) {
      deck.push({
        cor: cores[i % 4],
        forma: formas[Math.floor(i / 4) % 4],
        numero: nums[Math.floor(i / 16) % 4]
      });
    }
    return deck;
  }

  function shuffle(arr) {
    // Cria copia profunda para evitar compartilhar referencias
    var copy = [];
    for (var i = 0; i < arr.length; i++) {
      copy.push({ cor: arr[i].cor, forma: arr[i].forma, numero: arr[i].numero });
    }
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }

  function svg(shape, color, count) {
    var s = '<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect width="400" height="600" fill="#fff"/>';

    if (shape === 'triangle') {
      var pts = [
        ['200,220 140,340 260,340'],
        ['60,120 20,220 100,220', '340,380 300,480 380,480'],
        ['60,120 20,220 100,220', '340,120 300,220 380,220', '200,420 160,520 240,520'],
        ['60,120 20,220 100,220', '340,120 300,220 380,220', '60,420 20,520 100,520', '340,420 300,520 380,520']
      ];
      var p = pts[count - 1];
      for (var i = 0; i < p.length; i++) {
        s += '<polygon points="' + p[i] + '" fill="' + color + '"/>';
      }
    }

    if (shape === 'star') {
      var sp = '0,-50 14.7,-15.9 47.6,-15.9 22.1,7.6 29.4,42.3 0,20 -29.4,42.3 -22.1,7.6 -47.6,-15.9 -14.7,-15.9';
      var pos = [
        ['200,300'],
        ['100,200', '300,400'],
        ['80,180', '320,180', '200,420'],
        ['80,180', '320,180', '80,420', '320,420']
      ];
      var pp = pos[count - 1];
      for (var i = 0; i < pp.length; i++) {
        s += '<g transform="translate(' + pp[i] + ') scale(1.6)">';
        s += '<polygon fill="' + color + '" points="' + sp + '"/></g>';
      }
    }

    if (shape === 'cross') {
      var cp = [
        ['200,300'],
        ['60,200', '340,450'],
        ['60,200', '340,200', '200,450'],
        ['60,200', '340,200', '60,450', '340,450']
      ];
      var cc = cp[count - 1];
      for (var i = 0; i < cc.length; i++) {
        s += '<g transform="translate(' + cc[i] + ')">';
        s += '<rect x="-20" y="-50" width="40" height="100" fill="' + color + '"/>';
        s += '<rect x="-50" y="-20" width="100" height="40" fill="' + color + '"/>';
        s += '</g>';
      }
    }

    if (shape === 'circle') {
      var rp = [
        ['200,300'],
        ['60,200', '340,440'],
        ['60,200', '340,200', '200,440'],
        ['60,200', '340,200', '60,450', '340,450']
      ];
      var rc = rp[count - 1];
      for (var i = 0; i < rc.length; i++) {
        var xy = rc[i].split(',');
        s += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="40" fill="' + color + '"/>';
      }
    }

    s += '</svg>';
    return s;
  }

  function generateSVG(forma, cor, numero) {
    return svg(shapeMap[forma], colorMap[cor], parseInt(numero));
  }

  return {
    colorMap: colorMap,
    shapeMap: shapeMap,
    stimulusCards: stimulusCards,
    buildDeck: buildDeck,
    shuffle: shuffle,
    generateSVG: generateSVG
  };

})();
