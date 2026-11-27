// LAUANA - carregador para paginas de PACIENTE (so o rostinho: aparece no comeco e some quando a pessoa comeca a responder).
// Quem decide se a Lauana aparece e este arquivo (uma lista so, facil de ampliar ou desligar):
//   - so quando a pessoa esta respondendo por um link (?s= ou ?d=). Nunca na impressao (?print) nem com ?semlauana.
//   - so nas pastas da lista LIBERADO abaixo. Para liberar outra familia de paginas (ex.: testes online), acrescente a pasta aqui.
// No modo paciente a Lauana NAO conversa com o servidor, NAO usa IA e NAO pergunta nome nem cidade: nada sai do aparelho.
(function () {
  try {
    var q = window.location.search || '';
    var p = new URLSearchParams(q);
    if (!(p.get('s') || p.get('d')) || p.get('print') || /[?&]semlauana(\b|=)/.test(q)) { return; }
    var LIBERADO = ['/escalas/'];
    var caminho = window.location.pathname || '', liberado = false, i;
    for (i = 0; i < LIBERADO.length; i++) { if (caminho.indexOf(LIBERADO[i]) >= 0) { liberado = true; } }
    if (!liberado || window.__lauanaCarregada) { return; }
    var eu = document.currentScript && document.currentScript.src;
    var base = eu ? eu.replace(/[^\/]*$/, '') : 'https://setmonte.github.io/lauana/';
    window.LAUANA_CONFIG = { modo: 'paciente', esconderAoComecar: 'input[type=radio],input[type=checkbox]' };
    var s = document.createElement('script');
    s.src = base + 'lauana.js?v=7';
    (document.body || document.documentElement).appendChild(s);
  } catch (e) {}
})();
