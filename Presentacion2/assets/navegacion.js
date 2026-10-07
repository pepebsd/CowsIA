document.getElementById('menu').addEventListener('click', function () {
  const expanded = document.getElementById('sidebar').classList.toggle('open');
  this.setAttribute('aria-expanded', String(expanded));
});
document.getElementById('print').addEventListener('click', () => window.print());
const chatExamples = {
  censo: ['¿Cuántas terneras de más de un año quedan?', '¿Quieres contar solo hembras activas? Indica el límite de edad para considerar una ternera. Después mostraría el recuento calculado y las fichas que lo respaldan.', 'Evidencia prevista: sexo, fecha de nacimiento, estado y fecha de consulta.'],
  reproduccion: ['¿Qué vacas madre llevan dos años o más sin parir?', 'Revisaría los partos registrados y los nacimientos vinculados a cada madre. Separaría las vacas sin parto registrado en ese periodo de aquellas sin historial suficiente. Un registro ausente no demuestra que no haya habido parto.', 'Evidencia prevista: madre, fecha del último parto registrado y cobertura del historial.'],
  foto: ['He fotografiado una herida. ¿Qué se aprecia?', 'Describiría los signos visibles y pediría contexto si la imagen no basta. La interpretación sería orientativa, sin confirmar un diagnóstico. Podrías revisar una propuesta de observación antes de guardarla en la ficha.', 'Contexto previsto: fotografía seleccionada, animal confirmado y antecedentes pertinentes.'],
  documentos: ['Prepara un documento con estas incidencias para mi asesor.', 'Indica la plantilla y el periodo. Reutilizaría información Oficial, Particular y Calculada para preparar un borrador con anexos, fuentes y campos pendientes. Tú o tu asesor revisaríais el documento antes de utilizarlo.', 'Propuesta futura: elaboración revisable; sin envío automático ni documento real generado.'],
  historial: ['¿Qué hicimos en casos parecidos y qué resultado hubo?', 'Compararía sucesos, decisiones y actuaciones registrados. Mostraría qué resultados constan y dónde falta contexto. La comparación ayudaría a decidir, sin afirmar que una actuación causó por sí sola el resultado.', 'Contexto previsto: historial de decisiones y sucesos, con fechas, evidencias y resultados registrados.']
};
document.querySelectorAll('[data-chat]').forEach(button => button.addEventListener('click', () => {
  const example = chatExamples[button.dataset.chat];
  document.getElementById('chat-user').textContent = example[0];
  document.getElementById('chat-assistant').textContent = example[1];
  document.getElementById('chat-evidence').textContent = example[2];
  document.querySelectorAll('[data-chat]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
}));
const search = document.getElementById('search');
if (search) search.addEventListener('input', () => {
  const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalized(search.value.trim());
  let visible = 0;
  document.querySelectorAll('.card').forEach(card => {
    card.hidden = !normalized(card.dataset.search).includes(query);
    if (!card.hidden) visible++;
  });
  document.getElementById('search-status').textContent = `${visible} documento${visible === 1 ? '' : 's'} disponible${visible === 1 ? '' : 's'}`;
});
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  const figure = button.closest('.diagram');
  const svg = figure.querySelector('svg');
  if (!svg) return;
  let scale = Number(figure.dataset.scale || 1);
  scale = button.dataset.zoom === 'reset' ? 1 : Math.min(4, Math.max(.5, scale + (button.dataset.zoom === 'in' ? .25 : -.25)));
  figure.dataset.scale = scale;
  svg.style.width = `${Number(svg.dataset.baseWidth) * scale}px`;
}));
(async function renderDiagrams() {
  const nodes = [...document.querySelectorAll('.mermaid')];
  if (!nodes.length) { document.body.dataset.diagramsReady = 'true'; return; }
  if (!window.mermaid) {
    nodes.forEach(node => node.insertAdjacentHTML('beforebegin', '<p class="diagram-error">No se ha podido cargar el visor. Comprueba que la carpeta assets acompaña a estos documentos.</p>'));
    document.body.dataset.diagramsReady = 'error';
    return;
  }
  mermaid.initialize({startOnLoad:false, securityLevel:'strict', theme:'base', themeVariables:{fontFamily:'Segoe UI, Arial, sans-serif',primaryColor:'#e9f1e9',primaryTextColor:'#203b32',primaryBorderColor:'#729c80',lineColor:'#527561',secondaryColor:'#fbf3df',tertiaryColor:'#f2f6ef'}, flowchart:{htmlLabels:false, useMaxWidth:false}, gantt:{useMaxWidth:false}});
  let failed = false;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const source = node.textContent;
    try {
      // A vertical layout keeps labels readable in document-sized viewports.
      // Only direction changes; the source definition and all edges are preserved.
      const displaySource = source.replace(/^(\s*flowchart)\s+LR\b/m, '$1 TB');
      const rendered = await mermaid.render(`cowsia-diagram-${i}`, displaySource);
      node.innerHTML = rendered.svg;
      const svg = node.querySelector('svg');
      const available = node.closest('.diagram-scroll').clientWidth - 40;
      const baseWidth = Math.min(svg.viewBox.baseVal.width, Math.max(available, 300));
      svg.dataset.baseWidth = baseWidth;
      svg.style.width = `${baseWidth}px`;
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', document.title + ' — diagrama ' + (i + 1));
    } catch (error) {
      failed = true;
      node.textContent = source;
      node.insertAdjacentHTML('beforebegin', '<p class="diagram-error">No se ha podido dibujar este diagrama. Su definición sigue disponible debajo.</p>');
      console.error(error);
    }
  }
  document.body.dataset.diagramsReady = failed ? 'error' : 'true';
})();
