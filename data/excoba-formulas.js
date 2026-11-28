/** Catálogo oficial de referencia del Formulario EXCOBA (con variables, uso y mini-ejemplos). */
(function (root) {
  'use strict';

  const EXCOBA_FORMULAS = {
    tabs: [
      { id: 'mat', label: 'Matemáticas' },
      { id: 'fis', label: 'Física' },
      { id: 'qui', label: 'Química' },
      { id: 'uni', label: 'Tablas y Conversión' },
    ],
    sections: {
      mat: [
        {
          title: 'Áreas y perímetros',
          tags: 'area perimetro triangulo circulo trapecio poligono geometria',
          lines: [
            '$A_{\\triangle} = \\frac{b \\cdot h}{2}, \\quad A_{\\text{trap}} = \\frac{(B + b)h}{2}$',
            '$A_{\\circ} = \\pi r^2, \\quad P_{\\circ} = 2\\pi r \\quad (\\pi \\approx 3.1416)$',
            'Ángulos interiores de polígono: $S = 180^\\circ(n - 2)$',
          ],
          vars: '$b, B$: bases · $h$: altura · $r$: radio · $n$: número de lados.',
          tip: 'En círculos, verifica si el dato es radio ($r$) o diámetro ($d = 2r$).',
          example: 'Ej. Trapecio $B=10, b=6, h=4 \\Rightarrow A = \\frac{(16)(4)}{2} = 32$.',
        },
        {
          title: 'Teorema de Pitágoras y trigonometría',
          tags: 'pitagoras hipotenusa cateto seno coseno tangente triangulo rectangulo',
          lines: [
            '$c^2 = a^2 + b^2 \\Rightarrow c = \\sqrt{a^2 + b^2}$',
            '$\\sin\\theta = \\frac{\\text{CO}}{H}, \\quad \\cos\\theta = \\frac{\\text{CA}}{H}, \\quad \\tan\\theta = \\frac{\\text{CO}}{\\text{CA}}$',
            '$\\sin^2\\theta + \\cos^2\\theta = 1$',
          ],
          vars: '$c$ o $H$: hipotenusa (lado más largo) · $\\text{CO}$: cateto opuesto · $\\text{CA}$: cateto adyacente.',
          tip: 'Si buscas un cateto, resta: $a = \\sqrt{c^2 - b^2}$.',
          example: 'Ej. Catetos $6$ y $8 \\Rightarrow c = \\sqrt{36 + 64} = 10$.',
        },
        {
          title: 'Álgebra, factorización y cuadrática',
          tags: 'algebra ecuacion cuadratica formula general binomio factorizacion raices',
          lines: [
            '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad (ax^2 + bx + c = 0)$',
            '$(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\quad a^2 - b^2 = (a - b)(a + b)$',
            '$a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}$',
          ],
          vars: '$\\Delta = b^2 - 4ac$: discriminante ($\\Delta > 0$: 2 raíces reales; $\\Delta = 0$: 1 raíz doble).',
          tip: 'Para $x^2 + bx + c = 0$, busca dos números que sumen $b$ y multipliquen $c$.',
          example: 'Ej. $x^2 - 5x + 6 = (x - 2)(x - 3) \\Rightarrow x = 2,\\; 3$.',
        },
        {
          title: 'Recta, parábola y distancia',
          tags: 'pendiente recta parabola vertice distancia punto medio analitica',
          lines: [
            '$m = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad y - y_1 = m(x - x_1), \\quad y = mx + b$',
            '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}, \\quad M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$',
            'Parábola: $f(x) = a(x - h)^2 + k \\Rightarrow \\text{vértice } (h, k)$',
          ],
          vars: '$m$: pendiente ($m_1 \\cdot m_2 = -1$ si son perpendiculares; $m_1 = m_2$ si son paralelas).',
          tip: 'El vértice de $ax^2 + bx + c$ tiene abscisa $h = -\\frac{b}{2a}$.',
          example: 'Ej. Puntos $(0,-2)$ y $(3,4) \\Rightarrow m = \\frac{4-(-2)}{3-0} = 2$.',
        },
        {
          title: 'Logaritmos, probabilidad y estadística',
          tags: 'logaritmo media promedio probabilidad desviacion porcentaje',
          lines: [
            '$\\log_b(N) = x \\iff b^x = N, \\quad \\log_b(xy) = \\log_b x + \\log_b y$',
            '$\\bar{x} = \\frac{\\sum x_i}{n}, \\quad P(A) = \\frac{\\text{casos favorables}}{\\text{casos totales}}$',
          ],
          vars: '$\\bar{x}$: media aritmética · $P(A) \\in [0, 1]$ (o $0\\%$ a $100\\%$).',
          tip: 'Recuerda que $\\log_{10}(10^k) = k$ y $\\ln(e^k) = k$.',
          example: 'Ej. $\\log_2(32) = 5$ porque $2^5 = 32$.',
        },
        {
          title: 'Cálculo diferencial e integral básico',
          tags: 'derivada integral limite calculo pendiente tangente',
          lines: [
            '$\\frac{d}{dx}(c) = 0, \\quad \\frac{d}{dx}(x^n) = n x^{n-1}$',
            '$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$',
          ],
          vars: 'La derivada $f\'(x_0)$ da la pendiente de la recta tangente en $x_0$.',
          tip: 'En máximos o mínimos locales se cumple $f\'(x) = 0$.',
          example: 'Ej. $f(x) = x^3 - 3x^2 \\Rightarrow f\'(x) = 3x^2 - 6x$.',
        },
      ],
      fis: [
        {
          title: 'Cinemática (MRU y MRUA)',
          tags: 'velocidad aceleracion distancia tiempo caida libre cinematica mru mrua',
          lines: [
            '$v = \\frac{d}{t}, \\quad a = \\frac{v_f - v_0}{t}$',
            '$d = v_0 t + \\frac{1}{2}a t^2, \\quad v_f^2 = v_0^2 + 2 a d$',
          ],
          vars: '$v_0$: velocidad inicial (m/s) · $v_f$: final · $a$: aceleración ($\\text{m/s}^2$) · $g \\approx 9.81\\text{ m/s}^2$.',
          tip: 'En gráficas $v(t)$, la pendiente es la aceleración y el área bajo la curva es la distancia.',
          example: 'Ej. Si $v = 12\\text{ m/s}$ constante por $4\\text{ s} \\Rightarrow d = 48\\text{ m}$.',
        },
        {
          title: 'Dinámica, trabajo y energía',
          tags: 'fuerza newton masa trabajo potencia energia cinetica potencial',
          lines: [
            '$F = m a, \\quad w = m g, \\quad W = F d \\cos\\theta, \\quad P = \\frac{W}{t}$',
            '$E_c = \\frac{1}{2}m v^2, \\quad E_p = m g h, \\quad E_m = E_c + E_p$',
          ],
          vars: '$F$: Newton (N) · $W, E$: Joule (J) · $P$: Watt (W = J/s).',
          tip: 'Sin fricción, la energía mecánica total $E_c + E_p$ se conserva.',
          example: 'Ej. $m = 4\\text{ kg}, v = 5\\text{ m/s} \\Rightarrow E_c = \\frac{1}{2}(4)(25) = 50\\text{ J}$.',
        },
        {
          title: 'Electricidad y circuitos',
          tags: 'ohm voltaje corriente resistencia circuito serie paralelo potencia',
          lines: [
            '$V = I R, \\quad P = V I = I^2 R = \\frac{V^2}{R}$',
            'Serie: $R_{\\text{eq}} = R_1 + R_2$ · Paralelo: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$',
          ],
          vars: '$V$: volts (V) · $I$: amperes (A) · $R$: ohms ($\\Omega$).',
          tip: 'Para 2 resistencias iguales en paralelo: $R_{\\text{eq}} = R / 2$.',
          example: 'Ej. $6\\,\\Omega \\parallel 6\\,\\Omega = 3\\,\\Omega$; en serie con $4\\,\\Omega \\Rightarrow 7\\,\\Omega$.',
        },
        {
          title: 'Fluidos, calor y ondas',
          tags: 'densidad presion calor temperatura kelvin onda frecuencia longitud',
          lines: [
            '$\\rho = \\frac{m}{V}, \\quad P = \\frac{F}{A}, \\quad P_h = \\rho g h$',
            '$Q = m c \\Delta T, \\quad T(\\text{K}) = T(^\\circ\\text{C}) + 273.15$',
            '$v = \\lambda f, \\quad T = \\frac{1}{f}$',
          ],
          vars: '$\\rho$: densidad ($\\text{kg/m}^3$) · $P$: pascal (Pa) · $\\lambda$: longitud de onda (m) · $f$: hertz (Hz).',
          tip: 'En una onda transversal, la cresta es el máximo positivo y el nodo cruza el eje.',
          example: 'Ej. $\\lambda = 2\\text{ m}, f = 5\\text{ Hz} \\Rightarrow v = 10\\text{ m/s}$.',
        },
      ],
      qui: [
        {
          title: 'Mol, masa molar y molaridad',
          tags: 'mol masa molar molaridad concentracion disolucion estequiometria avogadro',
          lines: [
            '$n = \\frac{m}{M}, \\quad M_{\\text{molaridad}} = \\frac{n}{V(\\text{L})}, \\quad C_1 V_1 = C_2 V_2$',
            '$N_A = 6.022 \\times 10^{23}\\text{ partículas/mol}$',
          ],
          vars: '$n$: moles · $m$: masa (g) · $M$: masa molar (g/mol) · $V$: volumen en litros.',
          tip: 'Para diluciones ($C_1 V_1 = C_2 V_2$), ambos volúmenes deben estar en la misma unidad.',
          example: 'Ej. $36\\text{ g}$ de $\\text{H}_2\\text{O}$ ($M=18$) $\\Rightarrow n = 36/18 = 2\\text{ mol}$.',
        },
        {
          title: 'Gases ideales',
          tags: 'gas ideal presion volumen temperatura boyle charles',
          lines: [
            '$P V = n R T, \\quad \\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}$',
            '$R = 0.0821\\text{ }\\frac{\\text{L}\\cdot\\text{atm}}{\\text{mol}\\cdot\\text{K}}$',
          ],
          vars: '$P$: atm · $V$: L · $T$: siempre en **Kelvin** ($\\text{K} = ^\\circ\\text{C} + 273.15$).',
          tip: 'Nunca sustituyas temperatura en °C directamente en las leyes de los gases.',
          example: 'Ej. $25^\\circ\\text{C} = 298.15\\text{ K}$.',
        },
        {
          title: 'Ácidos, bases y escala de pH',
          tags: 'ph poh acido base neutro concentracion hidrogeno',
          lines: [
            '$\\text{pH} = -\\log_{10}[\\text{H}^+], \\quad \\text{pOH} = -\\log_{10}[\\text{OH}^-]$',
            '$\\text{pH} + \\text{pOH} = 14 \\quad (25^\\circ\\text{C})$',
          ],
          vars: '$\\text{pH} < 7$: ácido · $\\text{pH} = 7$: neutro · $\\text{pH} > 7$: básico / alcalino.',
          tip: 'Si $[\\text{H}^+] = 10^{-k}\\text{ M}$, entonces directamente $\\text{pH} = k$.',
          example: 'Ej. $[\\text{H}^+] = 10^{-3}\\text{ M} \\Rightarrow \\text{pH} = 3,\\; \\text{pOH} = 11$.',
        },
        {
          title: 'Masas atómicas y enlaces frecuentes',
          tags: 'masa atomica tabla periodica ionico covalente metal no metal',
          lines: [
            '$\\text{H}=1,\\; \\text{C}=12,\\; \\text{N}=14,\\; \\text{O}=16,\\; \\text{Na}=23$',
            '$\\text{Mg}=24.3,\\; \\text{S}=32,\\; \\text{Cl}=35.5,\\; \\text{K}=39,\\; \\text{Ca}=40$',
          ],
          vars: 'Iónico: metal cede $e^-$ a no metal · Covalente: no metales comparten $e^-$.',
          tip: 'Grupo 1 (+1), Grupo 2 (+2), Halógenos Grupo 17 (-1), Gases nobles Grupo 18 (estables).',
          example: 'Ej. $\\text{Mg}^{2+} + 2\\text{Cl}^- \\rightarrow \\text{MgCl}_2$.',
        },
      ],
      uni: [
        {
          title: 'Conversiones frecuentes',
          tags: 'conversion unidades metros kilometros horas segundos litros grados radianes',
          lines: [
            '$1\\text{ km} = 1000\\text{ m}, \\quad 1\\text{ m} = 100\\text{ cm}, \\quad 1\\text{ h} = 3600\\text{ s}$',
            '$\\text{km/h} \\xrightarrow{\\div 3.6} \\text{m/s}, \\quad 1\\text{ L} = 1000\\text{ mL} = 1000\\text{ cm}^3$',
            '$180^\\circ = \\pi\\text{ rad} \\Rightarrow \\text{rad} = \\text{grados} \\cdot \\frac{\\pi}{180}$',
          ],
          vars: 'Prefijos SI: kilo ($10^3$), centi ($10^{-2}$), mili ($10^{-3}$), micro ($10^{-6}$).',
          tip: 'Para pasar de $\\text{m/s}$ a $\\text{km/h}$ multiplica por $3.6$.',
          example: 'Ej. $72\\text{ km/h} \\div 3.6 = 20\\text{ m/s}$.',
        },
        {
          title: 'Ángulos notables (trigonometría)',
          tags: 'angulos notables 30 45 60 90 seno coseno tangente tabla',
          lines: [
            '$30^\\circ: \\sin=\\frac{1}{2},\\; \\cos=\\frac{\\sqrt{3}}{2},\\; \\tan=\\frac{1}{\\sqrt{3}}$',
            '$45^\\circ: \\sin=\\frac{\\sqrt{2}}{2},\\; \\cos=\\frac{\\sqrt{2}}{2},\\; \\tan=1$',
            '$60^\\circ: \\sin=\\frac{\\sqrt{3}}{2},\\; \\cos=\\frac{1}{2},\\; \\tan=\\sqrt{3}$',
          ],
          vars: '$0^\\circ: \\sin=0,\\; \\cos=1$ · $90^\\circ: \\sin=1,\\; \\cos=0$.',
          tip: 'Regla rápida del seno para $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$: $\\frac{\\sqrt{0}, \\sqrt{1}, \\sqrt{2}, \\sqrt{3}, \\sqrt{4}}{2}$.',
          example: 'Ej. $\\sin(30^\\circ) = \\frac{\\sqrt{1}}{2} = 0.5$.',
        },
        {
          title: 'Constantes y valores útiles',
          tags: 'constantes raiz pi gravedad velocidad luz',
          lines: [
            '$\\sqrt{2} \\approx 1.414, \\quad \\sqrt{3} \\approx 1.732, \\quad \\pi \\approx 3.1416$',
            '$g \\approx 9.81\\text{ m/s}^2, \\quad c \\approx 3 \\times 10^8\\text{ m/s}$',
          ],
          vars: 'En problemas de examen suele indicarse si se redondea $\\pi \\approx 3.14$ o $g \\approx 9.8$.',
          tip: 'Puedes usar la calculadora científica en modo grados (DEG) mientras consultas estas constantes.',
          example: 'Ej. $2\\pi(5) \\approx 31.42$.',
        },
      ],
    },
  };

  root.EXCOBA_FORMULAS = EXCOBA_FORMULAS;
  if (typeof module === 'object' && module.exports) module.exports = EXCOBA_FORMULAS;
})(typeof window !== 'undefined' ? window : globalThis);
