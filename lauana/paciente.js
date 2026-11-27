// LAUANA - carregador para paginas de PACIENTE (so o rostinho: aparece no comeco e some quando a pessoa comeca a responder).
// Quem decide se a Lauana aparece e este arquivo (uma lista so, facil de ampliar ou desligar):
//   - so quando a pessoa esta respondendo por um link (?s= ou ?d=). Nunca na impressao (?print) nem com ?semlauana.
//   - so nas familias de paginas listadas abaixo (escalas e testes online). O painel e as paginas de reabilitacao nao entram aqui.
// No modo paciente a Lauana NAO conversa com o servidor, NAO usa IA e NAO pergunta nome nem cidade: nada sai do aparelho.
// Quando some: nas escalas, na 1a resposta marcada; nos testes, no 1o toque num botao "Iniciar..." / "Comecar...". Depois disso nao volta.
(function () {
  try {
    var q = window.location.search || '';
    var p = new URLSearchParams(q);
    if (!(p.get('s') || p.get('d')) || p.get('print') || /[?&]semlauana(\b|=)/.test(q)) { return; }
    if (window.__lauanaCarregada) { return; }
    var caminho = window.location.pathname || '';
    var arquivo = caminho.slice(caminho.lastIndexOf('/') + 1);
    var cfg = null;
    if (caminho.indexOf('/escalas/') >= 0) {
      // escalas: some na 1a resposta (bolinhas, caixas ou os botoes Sim/Nao do TDI)
      cfg = { modo: 'paciente', esconderAoComecar: 'input[type=radio],input[type=checkbox]', esconderAoClicarSel: '.item-btns button' };
    } else if (/\/online\/teste-[^\/]*\.html$/i.test(caminho) && !/backup/i.test(arquivo)) {
      // testes online (alguns cronometrados): aparece na tela de preparacao e some ao tocar em "Iniciar..." / "Comecar..."
      cfg = { modo: 'paciente', esconderAoClicarTexto: '^\\W*(iniciar|come(c|\\u00e7)ar|start)' };
    }
    if (!cfg) { return; }
    var eu = document.currentScript && document.currentScript.src;
    var base = eu ? eu.replace(/[^\/]*$/, '') : 'https://setmonte.github.io/lauana/';
    window.LAUANA_CONFIG = cfg;
    var s = document.createElement('script');
    s.src = base + 'lauana.js?v=9';
    (document.body || document.documentElement).appendChild(s);
  } catch (e) {}
})();
