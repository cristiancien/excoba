'use strict';
// ============================================================================
// demoexcoba-svg-figures.cjs - Figuras vectoriales SVG y especificaciones
// HTML5 Canvas 100% independientes (sin imagenes externas ni recovered/).
// ============================================================================

const SVG_BASE = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;height:auto;display:block;background:#0a0e14;border-radius:4px">` +
  `<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="#ffc12b"/></marker></defs>` +
  body + `</svg>`;

const FIGURES = {
  // Geometria: triangulo rectangulo 6-8-10
  rightTriangle: SVG_BASE(420, 230, `
    <polygon points="80,190 320,190 80,50" fill="rgba(43,193,255,0.12)" stroke="#2bc1ff" stroke-width="2.5"/>
    <rect x="80" y="172" width="18" height="18" fill="none" stroke="#ffc12b" stroke-width="2"/>
    <text x="195" y="214" fill="#fff" font-size="14" font-family="Arial" text-anchor="middle">b = 8 cm</text>
    <text x="46" y="125" fill="#fff" font-size="14" font-family="Arial" text-anchor="middle">a = 6 cm</text>
    <text x="220" y="108" fill="#ffc12b" font-size="15" font-weight="bold" font-family="Arial">c = ?</text>
  `),

  // Geometria: circulo con radio r = 5
  circleRadius: SVG_BASE(360, 220, `
    <circle cx="180" cy="110" r="80" fill="rgba(0,216,179,0.12)" stroke="#00d8b3" stroke-width="2.5"/>
    <line x1="180" y1="110" x2="260" y2="110" stroke="#ffc12b" stroke-width="2.5"/>
    <circle cx="180" cy="110" r="4" fill="#ffc12b"/>
    <text x="220" y="100" fill="#ffc12b" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">r = 5 u</text>
    <text x="180" y="208" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Usa π ≈ 3.14</text>
  `),

  // Geometria: trapecio bases 10 y 6, altura 4
  trapezoid: SVG_BASE(420, 210, `
    <polygon points="120,55 300,55 350,165 70,165" fill="rgba(43,193,255,0.14)" stroke="#2bc1ff" stroke-width="2.5"/>
    <line x1="120" y1="55" x2="120" y2="165" stroke="#ffc12b" stroke-width="2" stroke-dasharray="5,4"/>
    <text x="210" y="42" fill="#fff" font-size="14" font-family="Arial" text-anchor="middle">b = 6 m</text>
    <text x="210" y="190" fill="#fff" font-size="14" font-family="Arial" text-anchor="middle">B = 10 m</text>
    <text x="148" y="116" fill="#ffc12b" font-size="14" font-weight="bold" font-family="Arial">h = 4 m</text>
  `),

  // Geometria interactiva (Tipo 24): paralelas cortadas por secante (angulos correspondientes)
  parallelAngles: SVG_BASE(480, 260, `
    <line x1="40" y1="85" x2="440" y2="85" stroke="#2bc1ff" stroke-width="3"/>
    <line x1="40" y1="185" x2="440" y2="185" stroke="#2bc1ff" stroke-width="3"/>
    <line x1="150" y1="20" x2="310" y2="245" stroke="#ffc12b" stroke-width="2.5"/>
    <text x="448" y="89" fill="#9ca3af" font-size="13" font-family="Arial">L₁</text>
    <text x="448" y="189" fill="#9ca3af" font-size="13" font-family="Arial">L₂</text>
    <text x="168" y="70" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">1</text>
    <text x="225" y="70" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">2</text>
    <text x="180" y="112" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">3</text>
    <text x="242" y="112" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">4</text>
    <text x="238" y="170" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">5</text>
    <text x="296" y="170" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">6</text>
    <text x="252" y="212" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">7</text>
    <text x="314" y="212" fill="#fff" font-size="15" font-weight="bold" font-family="Arial">8</text>
  `),

  // Fisica: circuito mixto R1 en serie con (R2 || R3)
  resistorCircuit: SVG_BASE(480, 220, `
    <rect x="60" y="45" width="360" height="130" fill="none" stroke="#2bc1ff" stroke-width="2.5"/>
    <line x1="250" y1="45" x2="250" y2="175" stroke="#2bc1ff" stroke-width="2.5"/>
    <rect x="115" y="33" width="75" height="24" fill="#182230" stroke="#ffc12b" stroke-width="2"/>
    <text x="152" y="50" fill="#ffc12b" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">R₁ = 4 Ω</text>
    <rect x="218" y="92" width="64" height="30" fill="#182230" stroke="#00d8b3" stroke-width="2"/>
    <text x="250" y="112" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">R₂ = 6 Ω</text>
    <rect x="388" y="92" width="64" height="30" fill="#182230" stroke="#00d8b3" stroke-width="2"/>
    <text x="420" y="112" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">R₃ = 6 Ω</text>
    <circle cx="60" cy="110" r="20" fill="#182230" stroke="#ffc12b" stroke-width="2"/>
    <text x="60" y="115" fill="#fff" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">14 V</text>
  `),

  // Fisica interactiva (Tipo 3): onda transversal (cresta, valle, nodo, amplitud)
  transverseWave: SVG_BASE(480, 230, `
    <line x1="30" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"/>
    <path d="M 40,115 Q 95,20 150,115 T 260,115 T 370,115 T 440,115" fill="none" stroke="#2bc1ff" stroke-width="3.5"/>
    <circle cx="95" cy="68" r="5" fill="#ffc12b"/><text x="95" y="45" fill="#ffc12b" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">A</text>
    <circle cx="205" cy="162" r="5" fill="#00d8b3"/><text x="205" y="195" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">B</text>
    <circle cx="260" cy="115" r="5" fill="#f87171"/><text x="260" y="100" fill="#f87171" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">C</text>
    <circle cx="315" cy="68" r="5" fill="#ffc12b"/><text x="315" y="45" fill="#ffc12b" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">D</text>
    <text x="240" y="218" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Eje de equilibrio — selecciona las regiones solicitadas</text>
  `),

  // Quimica: enlace ionico MgCl2 (diagrama de electrones)
  ionicBondMgCl2: SVG_BASE(480, 210, `
    <circle cx="110" cy="105" r="42" fill="rgba(43,193,255,0.14)" stroke="#2bc1ff" stroke-width="2.5"/>
    <text x="110" y="110" fill="#fff" font-size="18" font-weight="bold" font-family="Arial" text-anchor="middle">Cl⁻</text>
    <text x="110" y="168" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Z = 17 (gana 1 e⁻)</text>
    <circle cx="240" cy="105" r="46" fill="rgba(255,193,43,0.16)" stroke="#ffc12b" stroke-width="2.5"/>
    <text x="240" y="110" fill="#ffc12b" font-size="18" font-weight="bold" font-family="Arial" text-anchor="middle">Mg²⁺</text>
    <text x="240" y="168" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Z = 12 (cede 2 e⁻)</text>
    <circle cx="370" cy="105" r="42" fill="rgba(43,193,255,0.14)" stroke="#2bc1ff" stroke-width="2.5"/>
    <text x="370" y="110" fill="#fff" font-size="18" font-weight="bold" font-family="Arial" text-anchor="middle">Cl⁻</text>
    <text x="370" y="168" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Z = 17 (gana 1 e⁻)</text>
    <path d="M 196,76 Q 175,45 148,72" fill="none" stroke="#ffc12b" stroke-width="2" marker-end="url(#arr)"/>
    <path d="M 284,76 Q 305,45 332,72" fill="none" stroke="#ffc12b" stroke-width="2" marker-end="url(#arr)"/>
  `),

  // Quimica interactiva (Tipo 24): bloques de la tabla periodica
  periodicBlocks: SVG_BASE(480, 220, `
    <rect x="30" y="40" width="75" height="145" rx="4" fill="rgba(255,193,43,0.22)" stroke="#ffc12b" stroke-width="2"/>
    <text x="67" y="118" fill="#ffc12b" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Bloque s</text>
    <rect x="115" y="90" width="195" height="95" rx="4" fill="rgba(43,193,255,0.18)" stroke="#2bc1ff" stroke-width="2"/>
    <text x="212" y="142" fill="#2bc1ff" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Bloque d (transición)</text>
    <rect x="320" y="40" width="90" height="145" rx="4" fill="rgba(0,216,179,0.18)" stroke="#00d8b3" stroke-width="2"/>
    <text x="365" y="118" fill="#00d8b3" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Bloque p</text>
    <rect x="418" y="40" width="42" height="145" rx="4" fill="rgba(167,139,250,0.22)" stroke="#a78bfa" stroke-width="2"/>
    <text x="439" y="118" fill="#ddd6fe" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle">18</text>
    <text x="240" y="206" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Esquema de bloques de la tabla periódica (grupos 1–18)</text>
  `),

  // Biologia interactiva (Tipo 24): celula eucariota con organelos
  eukaryoticCell: SVG_BASE(480, 260, `
    <ellipse cx="240" cy="130" rx="205" ry="102" fill="rgba(43,193,255,0.08)" stroke="#2bc1ff" stroke-width="3"/>
    <circle cx="170" cy="125" r="46" fill="rgba(255,193,43,0.2)" stroke="#ffc12b" stroke-width="2.5"/>
    <circle cx="170" cy="125" r="14" fill="#ffc12b"/>
    <text x="170" y="158" fill="#fff" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle">Región 1</text>
    <ellipse cx="325" cy="95" rx="44" ry="22" fill="rgba(0,216,179,0.22)" stroke="#00d8b3" stroke-width="2.5"/>
    <path d="M292,95 L304,84 L316,104 L328,84 L340,104 L354,95" fill="none" stroke="#00d8b3" stroke-width="2"/>
    <text x="325" y="132" fill="#fff" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle">Región 2</text>
    <rect x="275" y="155" width="90" height="40" rx="12" fill="rgba(244,114,182,0.2)" stroke="#f472b6" stroke-width="2"/>
    <path d="M288,167 Q320,158 352,167 M288,177 Q320,168 352,177 M288,187 Q320,178 352,187" fill="none" stroke="#f472b6" stroke-width="2"/>
    <text x="320" y="210" fill="#fff" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle">Región 3</text>
    <text x="240" y="250" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Esquema de célula eucariota animal</text>
  `),

  // Ciencias naturales interactiva (Tipo 19): ciclo del agua
  waterCycle: SVG_BASE(480, 250, `
    <rect x="20" y="185" width="230" height="45" fill="rgba(43,193,255,0.28)" stroke="#2bc1ff" stroke-width="2"/>
    <text x="135" y="213" fill="#e0f2fe" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Océano / Lago</text>
    <polygon points="250,230 345,105 460,230" fill="#1f2937" stroke="#64748b" stroke-width="2"/>
    <ellipse cx="220" cy="60" rx="68" ry="24" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
    <text x="220" y="65" fill="#fff" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Nubes (2)</text>
    <path d="M 105,178 L 105,105" stroke="#ffc12b" stroke-width="3" marker-end="url(#arr)"/>
    <text x="95" y="145" fill="#ffc12b" font-size="13" font-weight="bold" font-family="Arial" text-anchor="end">Proceso 1</text>
    <path d="M 275,85 L 310,145" stroke="#00d8b3" stroke-width="3" marker-end="url(#arr)"/>
    <text x="330" y="115" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial">Proceso 3</text>
    <path d="M 320,188 L 260,210" stroke="#a78bfa" stroke-width="3" marker-end="url(#arr)"/>
    <text x="365" y="210" fill="#ddd6fe" font-size="13" font-weight="bold" font-family="Arial">Proceso 4</text>
  `),

  // Ciencias sociales (estilo diagrama Mermaid): Division de poderes constitucionales
  constitutionalFlow: SVG_BASE(480, 210, `
    <rect x="155" y="18" width="170" height="38" rx="6" fill="#1e3a5f" stroke="#2bc1ff" stroke-width="2"/>
    <text x="240" y="42" fill="#fff" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Supremo Poder Federal</text>
    <line x1="240" y1="56" x2="240" y2="95" stroke="#ffc12b" stroke-width="2" marker-end="url(#arr)"/>
    <line x1="240" y1="74" x2="85" y2="74" stroke="#ffc12b" stroke-width="2"/><line x1="85" y1="74" x2="85" y2="95" stroke="#ffc12b" stroke-width="2" marker-end="url(#arr)"/>
    <line x1="240" y1="74" x2="395" y2="74" stroke="#ffc12b" stroke-width="2"/><line x1="395" y1="74" x2="395" y2="95" stroke="#ffc12b" stroke-width="2" marker-end="url(#arr)"/>
    <rect x="20" y="102" width="130" height="62" rx="6" fill="#111827" stroke="#00d8b3" stroke-width="2"/>
    <text x="85" y="128" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Ejecutivo</text>
    <text x="85" y="148" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Administra y ejecuta</text>
    <rect x="175" y="102" width="130" height="62" rx="6" fill="#111827" stroke="#ffc12b" stroke-width="2"/>
    <text x="240" y="128" fill="#ffc12b" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Legislativo</text>
    <text x="240" y="148" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Crea y reforma leyes</text>
    <rect x="330" y="102" width="130" height="62" rx="6" fill="#111827" stroke="#2bc1ff" stroke-width="2"/>
    <text x="395" y="128" fill="#2bc1ff" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Judicial</text>
    <text x="395" y="148" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Interpreta y juzga</text>
  `),

  // Ciencias sociales interactiva (Tipo 3): regiones culturales de Mexico antiguo
  mesoamericaRegions: SVG_BASE(480, 230, `
    <rect x="28" y="30" width="135" height="165" rx="8" fill="rgba(255,193,43,0.16)" stroke="#ffc12b" stroke-width="2"/>
    <text x="95" y="105" fill="#ffc12b" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Zona Norte</text>
    <text x="95" y="128" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Caza y recolección</text>
    <rect x="175" y="30" width="135" height="165" rx="8" fill="rgba(43,193,255,0.16)" stroke="#2bc1ff" stroke-width="2"/>
    <text x="242" y="105" fill="#2bc1ff" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Zona Noroeste</text>
    <text x="242" y="128" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Oasis y riego árido</text>
    <rect x="322" y="30" width="135" height="165" rx="8" fill="rgba(0,216,179,0.18)" stroke="#00d8b3" stroke-width="2"/>
    <text x="389" y="105" fill="#00d8b3" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">Zona Centro-Sur</text>
    <text x="389" y="128" fill="#cbd5e1" font-size="11" font-family="Arial" text-anchor="middle">Maíz y grandes urbes</text>
    <text x="240" y="218" fill="#9ca3af" font-size="12" font-family="Arial" text-anchor="middle">Superáreas culturales del México prehispánico</text>
  `),

  // Humanidades: diagrama de Venn silogismo categorico
  vennSyllogism: SVG_BASE(440, 220, `
    <circle cx="220" cy="112" r="88" fill="rgba(43,193,255,0.1)" stroke="#2bc1ff" stroke-width="2.5"/>
    <text x="220" y="45" fill="#2bc1ff" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Mamíferos (M)</text>
    <circle cx="220" cy="126" r="56" fill="rgba(0,216,179,0.15)" stroke="#00d8b3" stroke-width="2.5"/>
    <text x="220" y="92" fill="#00d8b3" font-size="13" font-weight="bold" font-family="Arial" text-anchor="middle">Cetáceos (C)</text>
    <circle cx="220" cy="142" r="24" fill="rgba(255,193,43,0.22)" stroke="#ffc12b" stroke-width="2"/>
    <text x="220" y="147" fill="#ffc12b" font-size="12" font-weight="bold" font-family="Arial" text-anchor="middle">Orcas</text>
  `),
};

const CANVAS_SPECS = {
  kinematicsGraph: {
    kind: 'line-graph',
    title: 'Velocidad v(t) de un móvil en línea recta',
    xLabel: 'Tiempo t (s)',
    yLabel: 'Velocidad v (m/s)',
    xRange: [0, 10],
    yRange: [0, 20],
    points: [[0, 0], [4, 12], [8, 12], [10, 0]],
  },
  linearFunction: {
    kind: 'coord-plane',
    title: 'Recta f(x) = 2x - 2',
    xRange: [-4, 5],
    yRange: [-6, 8],
    points: [[-2, -6], [0, -2], [1, 0], [3, 4], [4, 6]],
    highlight: [[0, -2, '(0, -2)'], [3, 4, '(3, 4)']],
  },
  parabolaVertex: {
    kind: 'parabola-plot',
    title: 'Parábola f(x) = (x - 2)² - 3',
    xRange: [-2, 6],
    yRange: [-5, 7],
    a: 1, h: 2, k: -3,
  },
  statsBarChart: {
    kind: 'bar-chart',
    title: 'Libros leídos por grupo en un semestre',
    yLabel: 'Libros',
    bars: [
      { label: 'Grupo A', value: 18 },
      { label: 'Grupo B', value: 24 },
      { label: 'Grupo C', value: 14 },
      { label: 'Grupo D', value: 24 },
    ],
  },
  populationTrend: {
    kind: 'line-graph',
    title: 'Producción agrícola (toneladas) por año',
    xLabel: 'Año',
    yLabel: 'Toneladas',
    xRange: [2020, 2024],
    yRange: [0, 100],
    points: [[2020, 40], [2021, 55], [2022, 60], [2023, 80], [2024, 95]],
  },
};

module.exports = { FIGURES, CANVAS_SPECS };
