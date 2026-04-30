// tecfe-v7-cards.js - Geracao SVG das cartas
// SEM acentos nos comentarios/strings do codigo

var WCSTCards = (function () {

  var colorMap = {
    roxo: '#8B008B', laranja: '#FF6600', azul: '#0055CC', verde: '#228B22'
  };
  var shapeMap = {
    losango: 'diamond', hexagono: 'hexagon', estrela4: 'star4', coracao: 'heart'
  };

  var stimulusCards = [
    { cor: 'roxo',    forma: 'losango',  numero: '2' },
    { cor: 'laranja', forma: 'hexagono', numero: '3' },
    { cor: 'azul',    forma: 'estrela4', numero: '4' },
    { cor: 'verde',   forma: 'coracao',  numero: '5' }
  ];

  function buildDeck() {
    var cores = ['roxo', 'laranja', 'azul', 'verde'];
    var formas = ['losango', 'hexagono', 'estrela4', 'coracao'];
    var nums = ['2', '3', '4', '5'];
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

  // Losango (diamante)
  function drawDiamond(cx, cy, size, color) {
    var h = size;
    var w = size * 0.65;
    return '<polygon points="' +
      cx + ',' + (cy - h) + ' ' +
      (cx + w) + ',' + cy + ' ' +
      cx + ',' + (cy + h) + ' ' +
      (cx - w) + ',' + cy +
      '" fill="' + color + '"/>';
  }

  // Hexagono
  function drawHexagon(cx, cy, r, color) {
    var pts = '';
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      pts += px.toFixed(1) + ',' + py.toFixed(1) + ' ';
    }
    return '<polygon points="' + pts.trim() + '" fill="' + color + '"/>';
  }

  // Estrela de 4 pontas
  function drawStar4(cx, cy, outer, color) {
    var inner = outer * 0.35;
    var pts = '';
    for (var i = 0; i < 8; i++) {
      var angle = (Math.PI / 4) * i - Math.PI / 2;
      var r = (i % 2 === 0) ? outer : inner;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      pts += px.toFixed(1) + ',' + py.toFixed(1) + ' ';
    }
    return '<polygon points="' + pts.trim() + '" fill="' + color + '"/>';
  }

  // Coracao
  function drawHeart(cx, cy, size, color) {
    var s = size;
    return '<path d="M ' + cx + ' ' + (cy + s * 0.4) +
      ' C ' + (cx - s * 0.02) + ' ' + (cy + s * 0.15) +
      ' ' + (cx - s * 0.65) + ' ' + (cy + s * 0.1) +
      ' ' + (cx - s * 0.65) + ' ' + (cy - s * 0.2) +
      ' C ' + (cx - s * 0.65) + ' ' + (cy - s * 0.55) +
      ' ' + cx + ' ' + (cy - s * 0.55) +
      ' ' + cx + ' ' + (cy - s * 0.25) +
      ' C ' + cx + ' ' + (cy - s * 0.55) +
      ' ' + (cx + s * 0.65) + ' ' + (cy - s * 0.55) +
      ' ' + (cx + s * 0.65) + ' ' + (cy - s * 0.2) +
      ' C ' + (cx + s * 0.65) + ' ' + (cy + s * 0.1) +
      ' ' + (cx + s * 0.02) + ' ' + (cy + s * 0.15) +
      ' ' + cx + ' ' + (cy + s * 0.4) +
      ' Z" fill="' + color + '"/>';
  }

  // Disposicoes por quantidade
  // 2 = vertical (um em cima do outro)
  // 3 = diagonal (superior-direito ao inferior-esquerdo)
  // 4 = losangular (cima, direita, baixo, esquerda)
  // 5 = circular (em roda)
  function getPositions(count) {
    if (count === 2) {
      return [
        { x: 200, y: 200 },
        { x: 200, y: 420 }
      ];
    }
    if (count === 3) {
      return [
        { x: 300, y: 170 },
        { x: 200, y: 310 },
        { x: 100, y: 450 }
      ];
    }
    if (count === 4) {
      return [
        { x: 200, y: 140 },
        { x: 310, y: 300 },
        { x: 200, y: 460 },
        { x: 90,  y: 300 }
      ];
    }
    if (count === 5) {
      var cx = 200, cy = 300, r = 140;
      var pos = [];
      for (var i = 0; i < 5; i++) {
        var angle = (2 * Math.PI / 5) * i - Math.PI / 2;
        pos.push({
          x: Math.round(cx + r * Math.cos(angle)),
          y: Math.round(cy + r * Math.sin(angle))
        });
      }
      return pos;
    }
    return [];
  }

  function svg(shape, color, count) {
    var s = '<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect width="400" height="600" fill="#fff"/>';

    var positions = getPositions(count);

    for (var i = 0; i < positions.length; i++) {
      var px = positions[i].x;
      var py = positions[i].y;

      if (shape === 'diamond') {
        s += drawDiamond(px, py, 50, color);
      } else if (shape === 'hexagon') {
        s += drawHexagon(px, py, 42, color);
      } else if (shape === 'star4') {
        s += drawStar4(px, py, 48, color);
      } else if (shape === 'heart') {
        s += drawHeart(px, py, 80, color);
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
