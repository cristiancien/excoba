'use strict';
// ============================================================================
// demoexcoba-showcase-bank.cjs - 70 reactivos interactivos originales e
// independientes con estilo DemoExcoba (9 materias, 15 formatos, SVG, Canvas
// y LaTeX). Cero archivos externos, cero dependencias de recovered/.
// ============================================================================

const { FIGURES, CANVAS_SPECS } = require('./demoexcoba-svg-figures.cjs');

function makeBase(idx, subject, tipo, extra) {
  return {
    id: `M_${String(idx).padStart(2, '0')}`,
    packageId: 1670,
    sourcePkg: 'Muestra Interactiva',
    stage: 'DEMOEXCOBA · MUESTRA INTERACTIVA',
    subject,
    topicRef: subject,
    topicTitle: `${subject} · Reactivo interactivo #${idx}`,
    level: ((idx - 1) % 4) + 1,
    skill: `Tipo ${tipo}`,
    tipo,
    isOriginal: true,
    calculator: ['Matemáticas', 'Física', 'Química', 'Ciencias naturales'].includes(subject),
    instruccionesHtml: '',
    promptHtml: '',
    ...extra,
  };
}

function tipo4(idx, subject, inst, parrafo, tokens, explanation, extra = {}) {
  const mapped = tokens.map(([id, mostrar, opts]) => ({
    id, mostrar,
    options: opts.map((o, k) => ({ id: String.fromCharCode(65 + k), val: o[0], correcta: o[1] ? 1 : 0 })),
  }));
  const ans = mapped.map(t => (t.options.find(o => o.correcta === 1) || t.options[0]).val).join(' | ');
  return makeBase(idx, subject, 4, {
    instruccionesHtml: inst, parrafoHtml: parrafo, tokens: mapped, correctAnswer: ans, explanation, ...extra,
  });
}

function tipo5(idx, subject, inst, prompt, cats, stmts, explanation, extra = {}) {
  const categories = cats.map(([id, title]) => ({ id, title }));
  const statements = stmts.map(([id, text, category]) => ({ id: String(id), text, category }));
  const ans = categories.map(c => `${c.title}: ${statements.filter(s => s.category === c.id).map(s => s.text).join('; ')}`).join(' | ');
  return makeBase(idx, subject, 5, {
    instruccionesHtml: inst, promptHtml: prompt, categories, statements, correctAnswer: ans, explanation, ...extra,
  });
}

function tipoNum(idx, subject, tipo, inst, prompt, fields, explanation, extra = {}) {
  const mapped = fields.map(([key, label, expected, unit = '', tol = 0.05, display = '']) => ({ key, label, expected: String(expected), unit, tol, display }));
  const ans = mapped.map(f => `${f.display || f.expected}${f.unit ? ' ' + f.unit : ''}`).join(' | ');
  return makeBase(idx, subject, tipo, {
    instruccionesHtml: inst, promptHtml: prompt, fields: mapped, correctAnswer: ans, explanation, ...extra,
  });
}

function tipo18(idx, subject, tipo, inst, parrafo, correctIds, explanation, extra = {}) {
  return makeBase(idx, subject, tipo, {
    instruccionesHtml: inst, parrafoHtml: parrafo, maxSelect: correctIds.length, correctIds,
    correctAnswer: `${correctIds.length} frase(s) clave`, explanation, ...extra,
  });
}

function tipo12(idx, subject, inst, prompt, rows, explanation, extra = {}) {
  const mapped = rows.map(([key, p, expected, options]) => ({ key, prompt: p, expected, options }));
  return makeBase(idx, subject, 12, {
    instruccionesHtml: inst, promptHtml: prompt, rows: mapped,
    correctAnswer: mapped.map(r => `${r.prompt} → ${r.expected}`).join(' | '), explanation, ...extra,
  });
}

function tipoHotspot(idx, subject, tipo, inst, figureSvg, viewBox, areas, explanation) {
  const mapped = areas.map(([id, title, poly, correcta]) => ({ id, title, poly, correcta: Boolean(correcta) }));
  const correctList = mapped.filter(a => a.correcta);
  return makeBase(idx, subject, tipo, {
    instruccionesHtml: inst, figureSvg, viewBox, areas: mapped,
    targetCount: correctList.length || mapped.length,
    correctAnswer: correctList.map(a => a.title).join(' | '), explanation,
  });
}

function buildShowcaseBank() {
  const items = [];
  let n = 1;
  const add = it => items.push(it);

  // ================= 1. ESPAÑOL (10 reactivos) =================
  add(tipo5(n++, 'Español', 'Clasifica cada enunciado según corresponda a la idea principal del refrán o no.',
    'Refrán: «A palabras necias, oídos sordos».',
    [['si', 'Representa la idea del refrán'], ['no', 'No corresponde al refrán']],
    [[1, 'Conviene ignorar comentarios imprudentes o malintencionados.', 'si'],
     [2, 'Evitar responder a provocaciones mantiene la serenidad.', 'si'],
     [3, 'Todas las opiniones deben debatirse públicamente.', 'no'],
     [4, 'Quien escucha con atención siempre tiene la razón.', 'no']],
    'El refrán aconseja no prestar atención a comentarios necios o provocadores.'));

  add(tipo4(n++, 'Español', 'Haz clic en cada espacio subrayado y elige el uso correcto de la coma.',
    'Cuando terminó la lluvia<a href="t1">__</a> Sofía<a href="t2">__</a> la menor del equipo<a href="t3">__</a> propuso continuar el viaje.',
    [['t1', '__', [[',', true], ['(sin signo)', false]]],
     ['t2', '__', [[',', true], ['(sin signo)', false]]],
     ['t3', '__', [[',', true], ['(sin signo)', false]]]],
    'La subordinada antepuesta y el inciso explicativo («la menor del equipo») van entre comas.'));

  add(tipo18(n++, 'Español', 18, 'Haz clic sobre los 2 nexos adversativos presentes en el párrafo.',
    'El proyecto avanzó rápido, <a href="p1">sin embargo</a> faltaban datos de campo. <a href="p2">Por consiguiente</a> se amplió el plazo, <a href="p3">aunque</a> el presupuesto siguió igual.',
    ['p1', 'p3'], '«sin embargo» y «aunque» introducen oposición o contraste; «por consiguiente» es consecutivo.'));

  add(tipo4(n++, 'Español', 'Selecciona la forma verbal y el acento diacrítico adecuados.',
    'Espero que <a href="t1">______</a> temprano porque <a href="t2">______</a> opinión es decisiva.',
    [['t1', '______', [['vengas', true], ['vienes', false], ['venías', false]]],
     ['t2', '______', [['tu', true], ['tú', false]]]],
    '«Espero que» exige presente de subjuntivo («vengas») y el posesivo «tu» no lleva tilde.'));

  add(tipo5(n++, 'Español', 'Clasifica las palabras según su regla de acentuación ortográfica.',
    'Identifica cuáles son agudas con tilde y cuáles son graves con tilde.',
    [['aguda', 'Aguda con tilde'], ['grave', 'Grave con tilde']],
    [[1, 'canción', 'aguda'], [2, 'compás', 'aguda'], [3, 'árbol', 'grave'], [4, 'lápiz', 'grave']],
    'Agudas terminadas en n/s/vocal llevan tilde; graves terminadas en consonante distinta de n/s llevan tilde.'));

  add(makeBase(n++, 'Español', 6, {
    instruccionesHtml: 'Haz clic en las oraciones en el orden cronológico correcto para reconstruir el texto.',
    sentences: [
      { id: 's1', text: 'Primero se recolectaron muestras de agua en tres puntos del río.' },
      { id: 's2', text: 'Después se analizaron en el laboratorio para medir su turbidez y pH.' },
      { id: 's3', text: 'Finalmente se publicaron recomendaciones de saneamiento comunitario.' },
    ],
    correctAnswer: '1. Primero se recolectaron... 2. Después se analizaron... 3. Finalmente se publicaron...',
    explanation: 'Los marcadores temporales Primero → Después → Finalmente ordenan el procedimiento.',
  }));

  add(tipo18(n++, 'Español', 16, 'Selecciona las 2 frases que expresan una opinión (no un dato verificable).',
    '<a href="f1">La biblioteca abrió en 1998.</a> <a href="f2">Su sala central es la más acogedora del país.</a> <a href="f3">Alberga 42,000 volúmenes.</a> <a href="f4">Debería permanecer abierta toda la noche.</a>',
    ['f2', 'f4'], 'Los juicios valorativos («más acogedora», «debería») son opiniones; fechas y cantidades son hechos.'));

  add(tipo4(n++, 'Español', 'Completa la oración eligiendo el homófono correcto en cada espacio.',
    'Antes de <a href="t1">______</a> la carta, revisó si <a href="t2">______</a> tiempo suficiente.',
    [['t1', '______', [['echar', true], ['hechar', false]]],
     ['t2', '______', [['había', true], ['avía', false]]]],
    '«Echar» se escribe sin h y «había» proviene del verbo «haber».'));

  add(tipo12(n++, 'Español', 'Relaciona cada función de la lengua con el enunciado que la ejemplifica.',
    'Selecciona en cada fila la función predominante.',
    [['r1', '«Cierra la ventana, por favor».', 'Apelativa', ['Referencial', 'Apelativa', 'Poética']],
     ['r2', '«El agua hierve a 100 °C al nivel del mar».', 'Referencial', ['Referencial', 'Apelativa', 'Poética']],
     ['r3', '«Sus ojos eran dos faros en la niebla».', 'Poética', ['Referencial', 'Apelativa', 'Poética']]],
    'Apelativa busca influir en el receptor; referencial informa objetivamente; poética cuida la forma estética.'));

  add(tipo4(n++, 'Español', 'Lee el texto de referencia y selecciona las opciones que completan correctamente el resumen.',
    'La mayoría de los asistentes <a href="t1">______</a> puntuales y <a href="t2">______</a> su constancia al finalizar la jornada.',
    [['t1', '______', [['llegaron', true], ['llegaste', false], ['llegabas', false]]],
     ['t2', '______', [['recibieron', true], ['recibió', false]]]],
    'Con «la mayoría de + sustantivo plural» la concordancia plural («llegaron», «recibieron») es consistente.',
    {
      tipo: 23,
      skill: 'Tipo 23',
      textoRefHtml: 'Crónica escolar: El sábado se llevó a cabo el taller de redacción científica en el auditorio central. Más del ochenta por ciento de los estudiantes inscritos registró su asistencia antes de las nueve de la mañana y al concluir el programa se entregaron constancias digitales.',
    }));

  // ================= 2. MATEMÁTICAS (20 reactivos) =================
  add(tipoNum(n++, 'Matemáticas', 7, 'Observa el triángulo rectángulo y calcula la hipotenusa $c$.',
    'Aplica el teorema de Pitágoras $c = \\sqrt{a^2 + b^2}$ con los catetos indicados.',
    [['f1', 'Hipotenusa $c$:', 10, 'cm', 0.01]],
    '$c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$.', { figureSvg: FIGURES.rightTriangle }));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula el área del círculo mostrado en la figura.',
    'Usa $A = \\pi r^2$ con $\\pi \\approx 3.14$.',
    [['f1', 'Área:', 78.5, 'u²', 0.1]],
    '$A = 3.14 \\times 5^2 = 3.14 \\times 25 = 78.5\\text{ u}^2$.', { figureSvg: FIGURES.circleRadius }));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula el área del trapecio de la figura.',
    'Recuerda que $A = \\frac{(B + b)h}{2}$.',
    [['f1', 'Área:', 32, 'm²', 0.01]],
    '$A = \\frac{(10 + 6) \\times 4}{2} = \\frac{64}{2} = 32\\text{ m}^2$.', { figureSvg: FIGURES.trapezoid }));

  add(tipoHotspot(n++, 'Matemáticas', 24, 'Las rectas $L_1 \\parallel L_2$ son cortadas por una secante. Haz clic en los 2 ángulos correspondientes al ángulo 1 (incluyendo el 1 y su pareja en $L_2$).',
    FIGURES.parallelAngles, '0 0 480 260',
    [['a1', 'Ángulo 1', '145,45,195,45,195,85,145,85', true],
     ['a2', 'Ángulo 2', '205,45,255,45,255,85,205,85', false],
     ['a5', 'Ángulo 5', '215,145,265,145,265,185,215,185', true],
     ['a6', 'Ángulo 6', '275,145,325,145,325,185,275,185', false]],
    'Los ángulos 1 y 5 ocupan la misma posición relativa (superior izquierda) en ambas paralelas.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Observa la gráfica lineal en el plano cartesiano y determina la pendiente $m$.',
    'Usa los puntos destacados $(0, -2)$ y $(3, 4)$ en $m = \\frac{y_2 - y_1}{x_2 - x_1}$.',
    [['f1', 'Pendiente $m$:', 2, '', 0.01]],
    '$m = \\frac{4 - (-2)}{3 - 0} = \\frac{6}{3} = 2$.', { canvasSpec: CANVAS_SPECS.linearFunction }));

  add(tipoNum(n++, 'Matemáticas', 8, 'Observa la parábola $f(x) = (x - 2)^2 - 3$ y escribe las coordenadas $(h, k)$ de su vértice.',
    'Identifica el punto mínimo en la gráfica.',
    [['f1', 'Abscisa $h$:', 2, '', 0.01], ['f2', 'Ordenada $k$:', -3, '', 0.01]],
    'En forma canónica $f(x) = a(x - h)^2 + k$, el vértice es $(2, -3)$.', { canvasSpec: CANVAS_SPECS.parabolaVertex }));

  add(tipoNum(n++, 'Matemáticas', 7, 'Observa el gráfico de barras y calcula el promedio (media aritmética) de libros leídos por grupo.',
    'Suma los cuatro grupos y divide entre 4.',
    [['f1', 'Promedio:', 20, 'libros', 0.01]],
    '$\\bar{x} = \\frac{18 + 24 + 14 + 24}{4} = \\frac{80}{4} = 20$.', { canvasSpec: CANVAS_SPECS.statsBarChart }));

  add(tipoNum(n++, 'Matemáticas', 7, 'Resuelve la ecuación lineal y escribe el valor de $x$.',
    '$$3(x - 4) + 2 = 2x + 5$$',
    [['f1', '$x =$:', 15, '', 0.01]],
    '$3x - 12 + 2 = 2x + 5 \\Rightarrow 3x - 10 = 2x + 5 \\Rightarrow x = 15$.'));

  add(tipoNum(n++, 'Matemáticas', 15, 'Resuelve el sistema de ecuaciones lineales y escribe los valores de $x$ y $y$.',
    '$$\\begin{cases} x + y = 11 \\\\ x - y = 3 \\end{cases}$$',
    [['f1', '$x =$:', 7, '', 0.01], ['f2', '$y =$:', 4, '', 0.01]],
    'Sumando ambas ecuaciones: $2x = 14 \\Rightarrow x = 7$; sustituyendo: $y = 4$.'));

  add(tipo5(n++, 'Matemáticas', 'Clasifica cada identidad algebraica según sea correcta o incorrecta.',
    'Evalúa las expresiones para todo $a, b \\in \\mathbb{R}$.',
    [['ok', 'Identidad válida'], ['bad', 'Expresión incorrecta']],
    [[1, '$(a + b)^2 = a^2 + 2ab + b^2$', 'ok'],
     [2, '$(a - b)(a + b) = a^2 - b^2$', 'ok'],
     [3, '$(a + b)^2 = a^2 + b^2$', 'bad'],
     [4, '$\\sqrt{a^2 + b^2} = a + b$', 'bad']],
    'El binomio al cuadrado incluye el doble producto $2ab$, y la raíz no se distribuye sobre la suma.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula el valor exacto de la operación con fracciones (puedes escribir fracción o decimal).',
    '$$\\frac{3}{4} + \\frac{5}{8} - \\frac{1}{2}$$',
    [['f1', 'Resultado:', 0.875, '', 0.01, '7/8 (0.875)']],
    '$\\frac{6}{8} + \\frac{5}{8} - \\frac{4}{8} = \\frac{7}{8} = 0.875$.'));

  add(tipo4(n++, 'Matemáticas', 'Selecciona la factorización correcta del trinomio cuadrático.',
    'La expresión $x^2 - 5x + 6$ se factoriza como <a href="t1">______</a>, cuyas raíces son <a href="t2">______</a>.',
    [['t1', '______', [['$(x - 2)(x - 3)$', true], ['$(x + 2)(x + 3)$', false], ['$(x - 1)(x - 6)$', false]]],
     ['t2', '______', [['$x = 2,\\; x = 3$', true], ['$x = -2,\\; x = -3$', false]]]],
    'Dos números que suman $-5$ y multiplican $+6$ son $-2$ y $-3$.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula el precio final con descuento aplicado.',
    'Un artículo cuesta $\\$850$ y tiene un descuento del $20\\%$. ¿Cuánto se paga al final?',
    [['f1', 'Precio final:', 680, 'pesos', 0.01]],
    '$850 \\times (1 - 0.20) = 850 \\times 0.80 = 680$.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Resuelve el problema de proporcionalidad directa.',
    'Si 5 litros de pintura cubren $35\\text{ m}^2$, ¿cuántos metros cuadrados cubren 8 litros?',
    [['f1', 'Superficie:', 56, 'm²', 0.01]],
    'Rendimiento: $35 / 5 = 7\\text{ m}^2/\\text{L}$; para 8 L: $8 \\times 7 = 56\\text{ m}^2$.'));

  add(tipoNum(n++, 'Matemáticas', 22, 'Evalúa el límite polinomial.',
    '$$\\lim_{x \\to 3} (2x^2 - 4x + 1)$$',
    [['f1', 'Límite:', 7, '', 0.01]],
    'Sustituyendo $x = 3$: $2(9) - 4(3) + 1 = 18 - 12 + 1 = 7$.'));

  add(tipoNum(n++, 'Matemáticas', 22, 'Calcula la derivada evaluada en $x = 2$.',
    'Si $f(x) = x^3 - 3x^2 + 5$, calcula $f\'(2)$.',
    [['f1', '$f\'(2) =$:', 0, '', 0.01]],
    '$f\'(x) = 3x^2 - 6x \\Rightarrow f\'(2) = 3(4) - 6(2) = 0$.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula el valor del logaritmo.',
    '$$\\log_2(32) + \\log_{10}(100)$$',
    [['f1', 'Valor:', 7, '', 0.01]],
    '$\\log_2(2^5) + \\log_{10}(10^2) = 5 + 2 = 7$.'));

  add(tipo5(n++, 'Matemáticas', 'Clasifica cada número según sea racional ($\\mathbb{Q}$) o irracional ($\\mathbb{I}$).',
    'Considera la definición de cociente de enteros.',
    [['q', 'Racional (ℚ)'], ['i', 'Irracional (𝕀)']],
    [[1, '$\\frac{7}{3}$', 'q'], [2, '$0.25$', 'q'], [3, '$\\sqrt{2}$', 'i'], [4, '$\\pi$', 'i']],
    'Fracciones y decimales exactos/periódicos son racionales; $\\sqrt{2}$ y $\\pi$ no tienen periodo decimal.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula la probabilidad clásica en decimal o fracción.',
    'Al lanzar un dado justo de 6 caras, ¿cuál es la probabilidad de obtener un número mayor que 4?',
    [['f1', 'Probabilidad:', 0.3333, '', 0.02, '2/6 = 1/3 (≈ 0.33)']],
    'Casos favorables: $\\{5, 6\\}$ (2 de 6) $\\Rightarrow P = 2/6 = 1/3$.'));

  add(tipoNum(n++, 'Matemáticas', 7, 'Calcula la suma de los ángulos interiores de un pentágono convexo.',
    'Usa $S = 180^\\circ(n - 2)$ con $n = 5$.',
    [['f1', 'Suma:', 540, '°', 0.01]],
    '$S = 180^\\circ(5 - 2) = 180^\\circ \\times 3 = 540^\\circ$.'));

  // ================= 3. CIENCIAS NATURALES (5 reactivos) =================
  add(tipoHotspot(n++, 'Ciencias naturales', 19, 'Observa el ciclo del agua y haz clic en las 2 regiones que representan evaporación (Proceso 1) y precipitación (Proceso 3).',
    FIGURES.waterCycle, '0 0 480 250',
    [['w1', 'Evaporación (Proceso 1)', '25,95,125,95,125,180,25,180', true],
     ['w2', 'Condensación (Nubes 2)', '150,35,290,35,290,85,150,85', false],
     ['w3', 'Precipitación (Proceso 3)', '265,80,385,80,385,150,265,150', true],
     ['w4', 'Escorrentía (Proceso 4)', '255,180,425,180,425,225,255,225', false]],
    'La evaporación eleva el vapor desde el océano (1) y la precipitación devuelve el agua a la superficie (3).'));

  add(tipoNum(n++, 'Ciencias naturales', 11, 'Observa la gráfica $v(t)$ del móvil y escribe un instante $t$ (en segundos) donde su velocidad es constante de $12\\text{ m/s}$.',
    'Cualquier instante dentro del tramo plano horizontal es válido.',
    [['f1', 'Instante $t$:', 6, 's', 2, '4.0 – 8.0']],
    'Entre $t = 4\\text{ s}$ y $t = 8\\text{ s}$ la velocidad se mantiene constante en $12\\text{ m/s}$.', { canvasSpec: CANVAS_SPECS.kinematicsGraph }));

  add(tipo5(n++, 'Ciencias naturales', 'Clasifica los siguientes cambios de la materia como físicos o químicos.',
    'Analiza si cambia o no la composición química de la sustancia.',
    [['fis', 'Cambio físico'], ['qui', 'Cambio químico']],
    [[1, 'Fusión de un cubo de hielo', 'fis'], [2, 'Evaporación de alcohol', 'fis'],
     [3, 'Combustión de madera', 'qui'], [4, 'Oxidación del hierro', 'qui']],
    'Los cambios de estado son físicos; la combustión y oxidación generan nuevas sustancias.'));

  add(tipo4(n++, 'Ciencias naturales', 'Completa el párrafo sobre niveles tróficos en un ecosistema.',
    'Las plantas son organismos <a href="t1">______</a> porque producen su propio alimento mediante la <a href="t2">______</a>.',
    [['t1', '______', [['autótrofos', true], ['heterótrofos', false], ['descomponedores', false]]],
     ['t2', '______', [['fotosíntesis', true], ['fermentación', false], ['ósmosis', false]]]],
    'Los productores primarios (autótrofos) transforman energía luminosa en química mediante fotosíntesis.'));

  add(tipo5(n++, 'Ciencias naturales', 'Clasifica las fuentes de energía en renovables y no renovables.',
    'Considera su tasa natural de regeneración.',
    [['ren', 'Renovable'], ['noren', 'No renovable']],
    [[1, 'Energía solar fotovoltaica', 'ren'], [2, 'Energía eólica', 'ren'],
     [3, 'Petróleo crudo', 'noren'], [4, 'Carbón mineral', 'noren']],
    'Sol y viento se renuevan continuamente; los combustibles fósiles son finitos.'));

  // ================= 4. CIENCIAS SOCIALES (10 reactivos) =================
  add(tipoHotspot(n++, 'Ciencias sociales', 3, 'Observa el esquema de superáreas prehispánicas y haz clic sobre Mesoamérica (Zona Centro-Sur) y Aridoamérica (Zona Norte).',
    FIGURES.mesoamericaRegions, '0 0 480 230',
    [['m1', 'Aridoamérica (Zona Norte)', '28,30,163,30,163,195,28,195', true],
     ['m2', 'Oasisamérica (Zona Noroeste)', '175,30,310,30,310,195,175,195', false],
     ['m3', 'Mesoamérica (Zona Centro-Sur)', '322,30,457,30,457,195,322,195', true]],
    'Aridoamérica corresponde al norte árido de caza-recolección y Mesoamérica al centro-sur agrícola y urbano.'));

  add(tipo4(n++, 'Ciencias sociales', 'Observa el diagrama de la división de poderes y completa el enunciado.',
    'En México, el Poder <a href="t1">______</a> se deposita en el Congreso de la Unión para crear leyes, mientras el Poder <a href="t2">______</a> interpreta la Constitución.',
    [['t1', '______', [['Legislativo', true], ['Ejecutivo', false], ['Judicial', false]]],
     ['t2', '______', [['Judicial', true], ['Ejecutivo', false], ['Legislativo', false]]]],
    'El artículo 49 constitucional divide el Supremo Poder en Legislativo, Ejecutivo y Judicial.', { figureSvg: FIGURES.constitutionalFlow }));

  add(tipoNum(n++, 'Ciencias sociales', 7, 'Observa la gráfica de producción agrícola y calcula el incremento total de toneladas entre 2020 y 2024.',
    'Resta el valor de 2020 al de 2024.',
    [['f1', 'Incremento:', 55, 'toneladas', 0.01]],
    '$95 - 40 = 55\\text{ toneladas}$.', { canvasSpec: CANVAS_SPECS.populationTrend }));

  add(tipo5(n++, 'Ciencias sociales', 'Clasifica cada evento histórico en el siglo XIX o en el siglo XX en México.',
    'Ubica la cronología de cada proceso.',
    [['s19', 'Siglo XIX (1801–1900)'], ['s20', 'Siglo XX (1901–2000)']],
    [[1, 'Promulgación de la Constitución de 1857', 's19'], [2, 'Consumación de la Independencia (1821)', 's19'],
     [3, 'Promulgación de la Constitución de 1917', 's20'], [4, 'Expropiación Petrolera (1938)', 's20']],
    '1821 y 1857 pertenecen al siglo XIX; 1917 y 1938 al siglo XX.'));

  add(tipo18(n++, 'Ciencias sociales', 18, 'Selecciona las 2 garantías sociales consagradas originalmente en la Constitución de 1917.',
    'La Carta Magna incluyó <a href="g1">educación laica y gratuita (Art. 3°)</a>, <a href="g2">monarquía parlamentaria</a>, <a href="g3">derechos laborales y jornada de 8 horas (Art. 123)</a> y <a href="g4">feudalismo agrario</a>.',
    ['g1', 'g3'], 'Los artículos 3°, 27 y 123 distinguieron a la Constitución de 1917 por sus derechos sociales.'));

  add(tipo5(n++, 'Ciencias sociales', 'Clasifica las actividades económicas según el sector productivo.',
    'Distingue extracción primaria de transformación industrial.',
    [['prim', 'Sector primario'], ['sec', 'Sector secundario']],
    [[1, 'Agricultura y ganadería', 'prim'], [2, 'Pesca y silvicultura', 'prim'],
     [3, 'Industria automotriz', 'sec'], [4, 'Refinación petroquímica', 'sec']],
    'El primario obtiene recursos naturales; el secundario los transforma industrialmente.'));

  add(tipo12(n++, 'Ciencias sociales', 'Relaciona cada proceso mundial con el periodo o característica correspondiente.',
    'Selecciona la opción correcta en cada fila.',
    [['r1', 'Revolución Industrial (primera fase)', 'Máquina de vapor y textil', ['Máquina de vapor y textil', 'Guerra Fría', 'Feudalismo']],
     ['r2', 'Mundo bipolar (1947–1991)', 'Guerra Fría', ['Máquina de vapor y textil', 'Guerra Fría', 'Feudalismo']],
     ['r3', 'Ilustración (siglo XVIII)', 'Soberanía popular y razón', ['Soberanía popular y razón', 'Guerra Fría', 'Feudalismo']]],
    'Cada etapa responde a su transformación tecnológica o política principal.'));

  add(tipo4(n++, 'Ciencias sociales', 'Completa el concepto de geografía económica.',
    'El indicador que mide el valor monetario de los bienes y servicios finales producidos en un país durante un año es el <a href="t1">______</a>.',
    [['t1', '______', [['PIB', true], ['IPC', false], ['IDH', false]]]],
    'El Producto Interno Bruto (PIB) cuantifica la producción final anual dentro de un territorio.'));

  add(tipo5(n++, 'Ciencias sociales', 'Clasifica los derechos humanos según su dimensión cívico-política o socioeconómica.',
    'Identifica a qué ámbito pertenece cada derecho.',
    [['pol', 'Civiles y políticos'], ['soc', 'Económicos y sociales']],
    [[1, 'Derecho al voto libre y secreto', 'pol'], [2, 'Libertad de expresión', 'pol'],
     [3, 'Derecho a la salud pública', 'soc'], [4, 'Derecho a vivienda digna', 'soc']],
    'Voto y expresión son derechos políticos/civiles; salud y vivienda son derechos sociales.'));

  add(tipo18(n++, 'Ciencias sociales', 16, 'Selecciona los 2 factores que caracterizan un clima tropical húmedo (Af).',
    'Se distingue por <a href="c1">lluvias abundantes todo el año</a>, <a href="c2">temperaturas bajo cero permanentes</a>, <a href="c3">vegetación de selva alta</a> y <a href="c4">ausencia total de precipitaciones</a>.',
    ['c1', 'c3'], 'El clima Af (Köppen) mantiene altas temperaturas y precipitación constante, favoreciendo la selva.'));

  // ================= 5. LENGUAJE (5 reactivos) =================
  add(tipo18(n++, 'Lenguaje', 18, 'Haz clic sobre las 2 figuras retóricas de comparación o metáfora en el fragmento.',
    'La ciudad despierta: <a href="l1">el sol es una moneda de cobre</a> sobre el horizonte, <a href="l2">los autobuses circulan puntuales</a> y <a href="l3">sus calles brillan como ríos de plata</a>.',
    ['l1', 'l3'], '«el sol es una moneda» es metáfora y «brillan como ríos» es símil/comparación.'));

  add(tipo5(n++, 'Lenguaje', 'Clasifica cada recurso según corresponda al género narrativo o al género dramático.',
    'Recuerda la diferencia entre novela/cuento y teatro.',
    [['nar', 'Género narrativo'], ['dra', 'Género dramático']],
    [[1, 'Voz de un narrador omnisciente', 'nar'], [2, 'Capítulos y secuencia narrativa', 'nar'],
     [3, 'Acotaciones escénicas entre paréntesis', 'dra'], [4, 'Diálogos pensados para representación teatral', 'dra']],
    'El drama prescinde de narrador y se estructura en diálogos y acotaciones para escena.'));

  add(tipo4(n++, 'Lenguaje', 'Lee el fragmento de referencia y completa el análisis argumentativo.',
    'El fragmento combina un argumento de tipo <a href="t1">______</a> (al citar cifras medidas) con un argumento de <a href="t2">______</a> (al respaldarse en un organismo especialista).',
    [['t1', '______', [['empírico / de datos', true], ['ad hominem', false]]],
     ['t2', '______', [['autoridad', true], ['circular', false]]]],
    'Los datos medibles sustentan argumentos empíricos; citar instituciones especialistas corresponde a autoridad.',
    {
      tipo: 23,
      skill: 'Tipo 23',
      textoRefHtml: 'Fragmento editorial: «Durante la última década la captación pluvial escolar redujo en un 38 % el consumo de agua potable en 140 planteles, resultado respaldado por el informe técnico del Instituto Mexicano de Tecnología del Agua».',
    }));

  add(tipo4(n++, 'Lenguaje', 'Identifica la relación semántica en cada pareja.',
    '«Efímero» y «duradero» son <a href="t1">______</a>; «cálido» y «templado» son <a href="t2">______</a>.',
    [['t1', '______', [['antónimos', true], ['sinónimos', false], ['homónimos', false]]],
     ['t2', '______', [['sinónimos parciales', true], ['antónimos', false]]]],
    'Efímero/duradero expresan oposición; cálido/templado comparten campo semántico afín.'));

  add(tipo18(n++, 'Lenguaje', 18, 'Selecciona las 2 oraciones que contienen una falacia argumentativa.',
    '<a href="fa1">Tu estudio no vale nada porque llegaste tarde a la junta.</a> <a href="fa2">La muestra incluyó 1,200 encuestas aleatorias.</a> <a href="fa3">Todos compran ese producto, así que debe ser el mejor.</a>',
    ['fa1', 'fa3'], 'La primera es falacia ad hominem y la tercera es ad populum.'));

  // ================= 6. FÍSICA (5 reactivos) =================
  add(tipoNum(n++, 'Física', 7, 'Observa el circuito mixto y calcula la resistencia equivalente total $R_{\\text{eq}}$.',
    '$R_2 = 6\\,\\Omega$ y $R_3 = 6\\,\\Omega$ están en paralelo, y el conjunto en serie con $R_1 = 4\\,\\Omega$.',
    [['f1', '$R_{\\text{eq}}$:', 7, 'Ω', 0.01]],
    '$R_{23} = \\frac{6 \\times 6}{6 + 6} = 3\\,\\Omega \\Rightarrow R_{\\text{eq}} = 4 + 3 = 7\\,\\Omega$.', { figureSvg: FIGURES.resistorCircuit }));

  add(tipoNum(n++, 'Física', 7, 'Con el mismo circuito de $14\\text{ V}$ y $R_{\\text{eq}} = 7\\,\\Omega$, calcula la corriente total $I$ usando la ley de Ohm.',
    '$$I = \\frac{V}{R_{\\text{eq}}}$$',
    [['f1', 'Corriente $I$:', 2, 'A', 0.01]],
    '$I = 14\\text{ V} / 7\\,\\Omega = 2\\text{ A}$.', { figureSvg: FIGURES.resistorCircuit }));

  add(tipoHotspot(n++, 'Física', 3, 'Observa la onda transversal y haz clic en los 2 puntos que corresponden a crestas (A y D).',
    FIGURES.transverseWave, '0 0 480 230',
    [['pA', 'Cresta A', '65,25,125,25,125,90,65,90', true],
     ['pB', 'Valle B', '175,140,235,140,235,205,175,205', false],
     ['pC', 'Nodo C', '235,85,285,85,285,135,235,135', false],
     ['pD', 'Cresta D', '285,25,345,25,345,90,285,90', true]],
    'Las crestas son los puntos de máxima elongación positiva sobre el eje de equilibrio (A y D).'));

  add(tipoNum(n++, 'Física', 15, 'Calcula la energía cinética de un cuerpo de masa $m = 4\\text{ kg}$ que se mueve a $v = 5\\text{ m/s}$.',
    '$$E_c = \\frac{1}{2} m v^2$$',
    [['f1', '$E_c$:', 50, 'J', 0.01]],
    '$E_c = \\frac{1}{2}(4)(5^2) = 2 \\times 25 = 50\\text{ J}$.'));

  add(tipo5(n++, 'Física', 'Clasifica cada magnitud física como escalar o vectorial.',
    'Recuerda que los vectores requieren magnitud, dirección y sentido.',
    [['esc', 'Magnitud escalar'], ['vec', 'Magnitud vectorial']],
    [[1, 'Temperatura ($T$)', 'esc'], [2, 'Masa ($m$)', 'esc'],
     [3, 'Fuerza ($\\vec{F}$)', 'vec'], [4, 'Aceleración ($\\vec{a}$)', 'vec']],
    'Masa y temperatura quedan definidas por un escalar; fuerza y aceleración tienen dirección.'));

  // ================= 7. QUÍMICA (5 reactivos) =================
  add(tipo5(n++, 'Química', 'Observa el diagrama del enlace iónico del cloruro de magnesio ($\\text{MgCl}_2$) y clasifica cada enunciado.',
    'Analiza la transferencia de electrones entre el magnesio y el cloro.',
    [['ok', 'Correctos'], ['bad', 'Incorrectos']],
    [[1, 'El magnesio cede 2 electrones y forma el catión $\\text{Mg}^{2+}$.', 'ok'],
     [2, 'Cada átomo de cloro gana 1 electrón y forma el anión $\\text{Cl}^-$.', 'ok'],
     [3, 'Se trata de un enlace covalente no polar donde se comparten pares iguales.', 'bad'],
     [4, 'La fórmula empírica resultante es $\\text{Mg}_2\\text{Cl}$.', 'bad']],
    'El magnesio (metal) transfiere 2 electrones a dos átomos de cloro (no metal), formando $\\text{MgCl}_2$.', { figureSvg: FIGURES.ionicBondMgCl2 }));

  add(tipoHotspot(n++, 'Química', 24, 'Observa el esquema de la tabla periódica y haz clic sobre el bloque de metales de transición (d) y el grupo de gases nobles (18).',
    FIGURES.periodicBlocks, '0 0 480 220',
    [['bs', 'Bloque s', '30,40,105,40,105,185,30,185', false],
     ['bd', 'Bloque d (transición)', '115,90,310,90,310,185,115,185', true],
     ['bp', 'Bloque p', '320,40,410,40,410,185,320,185', false],
     ['g18', 'Grupo 18 (gases nobles)', '418,40,460,40,460,185,418,185', true]],
    'Los metales de transición ocupan el bloque central d (grupos 3–12) y los gases nobles el grupo 18.'));

  add(tipoNum(n++, 'Química', 7, 'Calcula la masa molar del agua ($\\text{H}_2\\text{O}$).',
    'Considera $M(\\text{H}) = 1\\text{ g/mol}$ y $M(\\text{O}) = 16\\text{ g/mol}$.',
    [['f1', 'Masa molar:', 18, 'g/mol', 0.01]],
    '$M(\\text{H}_2\\text{O}) = 2(1) + 16 = 18\\text{ g/mol}$.'));

  add(tipoNum(n++, 'Química', 22, 'Calcula el pH de una disolución acuosa con $[\\text{H}^+] = 1 \\times 10^{-3}\\text{ M}$.',
    '$$\\text{pH} = -\\log_{10}[\\text{H}^+]$$',
    [['f1', 'pH:', 3, '', 0.01]],
    '$\\text{pH} = -\\log_{10}(10^{-3}) = 3$ (medio ácido).'));

  add(tipo5(n++, 'Química', 'Clasifica las fórmulas químicas según sean óxidos metálicos o ácidos.',
    'Observa la presencia de hidrógeno ionizable o metal + oxígeno.',
    [['ox', 'Óxido metálico'], ['ac', 'Ácido']],
    [[1, '$\\text{Na}_2\\text{O}$', 'ox'], [2, '$\\text{CaO}$', 'ox'],
     [3, '$\\text{HCl}$', 'ac'], [4, '$\\text{H}_2\\text{SO}_4$', 'ac']],
    '$\\text{Na}_2\\text{O}$ y $\\text{CaO}$ son óxidos básicos; $\\text{HCl}$ y $\\text{H}_2\\text{SO}_4$ son ácidos.'));

  // ================= 8. BIOLOGÍA (5 reactivos) =================
  add(tipoHotspot(n++, 'Biología', 24, 'Observa la célula eucariota y haz clic sobre el núcleo (Región 1) y la mitocondria (Región 2).',
    FIGURES.eukaryoticCell, '0 0 480 260',
    [['o1', 'Núcleo (Región 1)', '120,75,220,75,220,175,120,175', true],
     ['o2', 'Mitocondria (Región 2)', '275,68,375,68,375,135,275,135', true],
     ['o3', 'Aparato de Golgi (Región 3)', '270,150,370,150,370,210,270,210', false]],
    'El núcleo resguarda el ADN (1) y la mitocondria genera ATP mediante respiración celular (2).'));

  add(tipo5(n++, 'Biología', 'Clasifica cada proceso celular según corresponda a mitosis o meiosis.',
    'Compara el número de divisiones y la carga cromosómica resultante.',
    [['mit', 'Mitosis'], ['mei', 'Meiosis']],
    [[1, 'Produce 2 células hijas diploides ($2n$) genéticamente idénticas.', 'mit'],
     [2, 'Permite el crecimiento y reparación de tejidos somáticos.', 'mit'],
     [3, 'Produce 4 gametos haploides ($n$) con variabilidad genética.', 'mei'],
     [4, 'Incluye entrecruzamiento cromosómico (crossing-over).', 'mei']],
    'La mitosis conserva la diploidía ($2n$); la meiosis reduce a la mitad ($n$) y genera recombinación.'));

  add(tipo4(n++, 'Biología', 'Completa el apareamiento complementario de bases nitrogenadas en el ADN.',
    'En la doble hélice de ADN, la adenina (A) se empareja con <a href="t1">______</a> y la citosina (C) con <a href="t2">______</a>.',
    [['t1', '______', [['timina (T)', true], ['uracilo (U)', false], ['guanina (G)', false]]],
     ['t2', '______', [['guanina (G)', true], ['adenina (A)', false]]]],
    'En el ADN los pares de Watson-Crick son A–T y C–G (el uracilo aparece en el ARN).'));

  add(tipoNum(n++, 'Biología', 7, 'Calcula el porcentaje esperado de descendencia heterocigota ($Aa$) en un cruce monohíbrido.',
    'Se cruzan dos progenitores heterocigotos $Aa \\times Aa$ (cuadro de Punnett). ¿Qué porcentaje será $Aa$?',
    [['f1', 'Porcentaje:', 50, '%', 0.01]],
    'Combinaciones posibles: $AA, Aa, Aa, aa \\Rightarrow 2/4 = 50\\%$.'));

  add(tipo5(n++, 'Biología', 'Clasifica las estructuras según sean características exclusivas de la célula vegetal o compartidas con la animal.',
    'Compara membrana, núcleo, pared celular y cloroplastos.',
    [['veg', 'Exclusiva vegetal'], ['amb', 'Común a ambas']],
    [[1, 'Pared celular de celulosa', 'veg'], [2, 'Cloroplastos con clorofila', 'veg'],
     [3, 'Membrana plasmática', 'amb'], [4, 'Ribosomas y núcleo', 'amb']],
    'Ambas son eucariotas (membrana, núcleo, ribosomas), pero pared de celulosa y cloroplastos son vegetales.'));

  // ================= 9. HUMANIDADES (5 reactivos) =================
  add(tipo4(n++, 'Humanidades', 'Observa el diagrama de Venn y completa la conclusión válida del silogismo.',
    'Premisa 1: Todos los cetáceos son mamíferos. Premisa 2: Todas las orcas son cetáceos. Conclusión: Todas las orcas son <a href="t1">______</a>.',
    [['t1', '______', [['mamíferos', true], ['reptiles', false], ['invertebrados', false]]]],
    'Por transitividad de inclusión de conjuntos ($\\text{Orcas} \\subset C \\subset M$), todas las orcas son mamíferos.', { figureSvg: FIGURES.vennSyllogism }));

  add(tipo5(n++, 'Humanidades', 'Clasifica cada postura filosófica como racionalismo o empirismo.',
    'Distingue la fuente principal del conocimiento en la modernidad.',
    [['rac', 'Racionalismo'], ['emp', 'Empirismo']],
    [[1, 'La razón y las ideas innatas son base del conocimiento (Descartes).', 'rac'],
     [2, 'El método deductivo matemático sirve de modelo universal.', 'rac'],
     [3, 'La mente nace como tabula rasa y aprende por experiencia (Locke).', 'emp'],
     [4, 'Las impresiones sensibles originan las ideas (Hume).', 'emp']],
    'El racionalismo prioriza la razón deductiva; el empirismo fundamenta el conocimiento en la experiencia.'));

  add(tipo18(n++, 'Humanidades', 18, 'Selecciona las 2 disciplinas filosóficas que estudian los valores morales y el conocimiento científico.',
    'Entre las ramas de la filosofía destacan la <a href="h1">ética</a>, la <a href="h2">mineralogía</a>, la <a href="h3">epistemología</a> y la <a href="h4">hidráulica</a>.',
    ['h1', 'h3'], 'La ética reflexiona sobre la moral y la epistemología sobre el conocimiento científico.'));

  add(tipo4(n++, 'Humanidades', 'Completa el enunciado sobre estética e historia del arte.',
    'El <a href="t1">______</a> rescató la proporción clásica grecorromana y el humanismo en los siglos XV y XVI, mientras que el <a href="t2">______</a> privilegió el contraste dramático y la ornamentación en el siglo XVII.',
    [['t1', '______', [['Renacimiento', true], ['Cubismo', false], ['Dadaísmo', false]]],
     ['t2', '______', [['Barroco', true], ['Minimalismo', false]]]],
    'Renacimiento (equilibrio clásico) precedió al Barroco (claroscuro y dinamismo).'));

  add(tipo5(n++, 'Humanidades', 'Clasifica cada norma según sea moral (autónoma) o jurídica (heterónoma y coercible).',
    'Analiza el origen de la obligación y el tipo de sanción.',
    [['mor', 'Norma moral'], ['jur', 'Norma jurídica']],
    [[1, 'Cumplir una promesa personal por convicción interna.', 'mor'],
     [2, 'Actuar con honestidad aun cuando nadie observa.', 'mor'],
     [3, 'Respetar los límites de velocidad bajo sanción de multa.', 'jur'],
     [4, 'Pagar impuestos establecidos por ley federal.', 'jur']],
    'Las normas morales son autónomas e incoercibles; las jurídicas provienen del Estado y son coercibles.'));

  const bySubject = new Map();
  for (const it of items) bySubject.set(it.subject, (bySubject.get(it.subject) || 0) + 1);
  const topics = [...bySubject.entries()].map(([subj, count]) => ({
    ref: subj, title: `${subj} (Muestra interactiva)`, packageId: 1670,
    stage: 'DEMOEXCOBA · MUESTRA INTERACTIVA', subject: subj, count,
  }));

  return {
    pkg: {
      id: 1670,
      datFile: 'web-showcase',
      prefix: '0.0',
      stage: 'DEMOEXCOBA',
      subject: 'Muestra Interactiva (70)',
      careerCode: 'SHOW070',
      careerName: 'DEMOEXCOBA - MUESTRA INTERACTIVA SVG/CANVAS/LATEX (70)',
      count: items.length,
      isOriginal: true,
      topics,
    },
    items,
  };
}

module.exports = { buildShowcaseBank };
