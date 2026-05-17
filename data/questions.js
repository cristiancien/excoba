const questionsData = [
    // ==========================================
    // TEMA 1: MATEMÁTICAS (Primaria, Secundaria y Bachillerato)
    // ==========================================
    {
        id: 1,
        topic: "Matemáticas - Jerarquía de Operaciones",
        question: "Calcula el resultado de la siguiente operación: $5 + 3 \\times 2^3 - (8 \\div 2)$",
        options: [
            { id: "a", text: "$60$", isCorrect: false },
            { id: "b", text: "$25$", isCorrect: true },
            { id: "c", text: "$29$", isCorrect: false },
            { id: "d", text: "$21$", isCorrect: false }
        ],
        hint: "Recuerda la jerarquía: primero paréntesis, luego potencias, después multiplicación/división y al final suma/resta.",
        explanation: "Siguiendo el orden correcto de las operaciones (PEMDAS):\n\n1. **Paréntesis**: $(8 \\div 2) = 4$\n2. **Potencias**: $2^3 = 8$\n3. **Multiplicación**: $3 \\times 8 = 24$\n4. **Suma y Resta**: Queda $5 + 24 - 4 = 29 - 4 = 25$.\n\n¡Por lo tanto, la respuesta correcta es **$25$**!",
        level: 1
    },
    {
        id: 2,
        topic: "Matemáticas - Productos Notables",
        question: "Desarrolla el siguiente binomio al cuadrado: $(2x - 3y)^2$",
        options: [
            { id: "a", text: "$4x^2 - 9y^2$", isCorrect: false },
            { id: "b", text: "$4x^2 - 12xy + 9y^2$", isCorrect: true },
            { id: "c", text: "$4x^2 + 12xy + 9y^2$", isCorrect: false },
            { id: "d", text: "$2x^2 - 6xy + 3y^2$", isCorrect: false }
        ],
        hint: "La regla es: el cuadrado del primero, menos el doble producto del primero por el segundo, más el cuadrado del segundo: $(a - b)^2 = a^2 - 2ab + b^2$.",
        explanation: "Aplicamos la regla del binomio al cuadrado $(a - b)^2 = a^2 - 2ab + b^2$:\n\n- Cuadrado del primer término: $(2x)^2 = 4x^2$\n- Doble producto del primero por el segundo: $2 \\times (2x) \\times (3y) = 12xy$\n- Cuadrado del segundo término: $(3y)^2 = 9y^2$\n\nUniendo todo con el signo correspondiente obtenemos: **$4x^2 - 12xy + 9y^2$**.",
        level: 2
    },
    {
        id: 3,
        topic: "Matemáticas - Geometría Plana",
        question: "¿Cuál es el área de un círculo cuyo diámetro mide $10\\text{ cm}$? (Considera $\\pi \\approx 3.1416$)",
        options: [
            { id: "a", text: "$78.54\\text{ cm}^2$", isCorrect: true },
            { id: "b", text: "$314.16\\text{ cm}^2$", isCorrect: false },
            { id: "c", text: "$31.42\\text{ cm}^2$", isCorrect: false },
            { id: "d", text: "$15.71\\text{ cm}^2$", isCorrect: false }
        ],
        hint: "Cuidado: te dan el diámetro. La fórmula del área usa el radio ($r = \\frac{\\text{diámetro}}{2}$).",
        explanation: "1. Primero calculamos el radio del círculo:\n   $$r = \\frac{D}{2} = \\frac{10\\text{ cm}}{2} = 5\\text{ cm}$$\n2. Usamos la fórmula del área del círculo ($A = \\pi r^2$):\n   $$A = \\pi \\times 5^2 = 25\\pi$$\n3. Sustituyendo el valor aproximado de $\\pi$:\n   $$A \\approx 25 \\times 3.1416 = 78.54\\text{ cm}^2$$",
        level: 1
    },
    {
        id: 4,
        topic: "Matemáticas - Trigonometría",
        question: "En un triángulo rectángulo, si el cateto opuesto al ángulo $\\theta$ mide $3\\text{ m}$ y la hipotenusa mide $5\\text{ m}$, ¿cuál es el valor de $\\cos(\\theta)$?",
        options: [
            { id: "a", text: "$0.6$", isCorrect: false },
            { id: "b", text: "$0.8$", isCorrect: true },
            { id: "c", text: "$0.75$", isCorrect: false },
            { id: "d", text: "$1.33$", isCorrect: false }
        ],
        hint: "Primero encuentra el cateto adyacente usando el Teorema de Pitágoras ($a^2 + b^2 = c^2$). Luego recuerda que $\\cos(\\theta) = \\frac{\\text{cateto adyacente}}{\\text{hipotenusa}}$.",
        explanation: "1. **Teorema de Pitágoras**: $C_a^2 + C_o^2 = H^2$\n   $$C_a^2 + 3^2 = 5^2 \\Rightarrow C_a^2 + 9 = 25 \\Rightarrow C_a^2 = 16 \\Rightarrow C_a = 4\\text{ m}$$\n2. **Definición de Coseno**:\n   $$\\cos(\\theta) = \\frac{C_a}{H} = \\frac{4}{5} = 0.8$$",
        level: 2
    },
    {
        id: 5,
        topic: "Matemáticas - Geometría Analítica",
        question: "¿Cuál es la pendiente de la recta que pasa por los puntos $A(1, 2)$ y $B(3, 8)$?",
        options: [
            { id: "a", text: "$m = 3$", isCorrect: true },
            { id: "b", text: "$m = -3$", isCorrect: false },
            { id: "c", text: "$m = \\frac{1}{3}$", isCorrect: false },
            { id: "d", text: "$m = 2$", isCorrect: false }
        ],
        hint: "La fórmula de la pendiente es $m = \\frac{y_2 - y_1}{x_2 - x_1}$.",
        explanation: "Usando los puntos $A(x_1, y_1) = (1, 2)$ y $B(x_2, y_2) = (3, 8)$:\n\n$$m = \\frac{8 - 2}{3 - 1} = \\frac{6}{2} = 3$$\n\nLa pendiente de la recta es **$3$**.",
        level: 2
    },
    {
        id: 6,
        topic: "Matemáticas - Ecuación de la Circunferencia",
        question: "¿Cuál es el centro y el radio de la circunferencia con la ecuación $(x - 2)^2 + (y + 4)^2 = 9$?",
        options: [
            { id: "a", text: "Centro $(2, -4)$, Radio = $3$", isCorrect: true },
            { id: "b", text: "Centro $(-2, 4)$, Radio = $9$", isCorrect: false },
            { id: "c", text: "Centro $(2, -4)$, Radio = $9$", isCorrect: false },
            { id: "d", text: "Centro $(-2, 4)$, Radio = $3$", isCorrect: false }
        ],
        hint: "La ecuación ordinaria de la circunferencia es $(x - h)^2 + (y - k)^2 = r^2$, donde $(h, k)$ es el centro y $r$ es el radio.",
        explanation: "Dada la ecuación:\n$$(x - 2)^2 + (y + 4)^2 = 9$$\n\nComparando con la forma ordinaria $(x - h)^2 + (y - k)^2 = r^2$:\n- $-h = -2 \\Rightarrow h = 2$\n- $-k = 4 \\Rightarrow k = -4$\n- $r^2 = 9 \\Rightarrow r = 3$\n\nPor tanto, el Centro es **$(2, -4)$** y el Radio es **$3$**.",
        level: 3
    },

    // ==========================================
    // TEMA 2: FÍSICA (Cinemática, Dinámica y Fluidos)
    // ==========================================
    {
        id: 7,
        topic: "Física - Dinámica (Leyes de Newton)",
        question: "Si se aplica una fuerza neta de $15\\text{ N}$ sobre un objeto de masa $3\\text{ kg}$, ¿cuál será su aceleración?",
        options: [
            { id: "a", text: "$45\\text{ m/s}^2$", isCorrect: false },
            { id: "b", text: "$5\\text{ m/s}^2$", isCorrect: true },
            { id: "c", text: "$0.2\\text{ m/s}^2$", isCorrect: false },
            { id: "d", text: "$12\\text{ m/s}^2$", isCorrect: false }
        ],
        hint: "Aplica la Segunda Ley de Newton: $F = m \\cdot a$. Despeja la aceleración.",
        explanation: "La Segunda Ley de Newton establece que:\n$$F = m \\cdot a$$\n\nDespejando la aceleración ($a$):\n$$a = \\frac{F}{m}$$\n\nSustituyendo los datos:\n$$a = \\frac{15\\text{ N}}{3\\text{ kg}} = 5\\text{ m/s}^2$$",
        level: 2
    },
    {
        id: 8,
        topic: "Física - Hidrostática (Presión)",
        question: "Un bloque metálico pesa $100\\text{ N}$ y se apoya sobre una superficie cuadrada de $0.5\\text{ m}$ de lado. ¿Cuánta presión ejerce sobre el suelo?",
        options: [
            { id: "a", text: "$200\\text{ Pa}$", isCorrect: false },
            { id: "b", text: "$400\\text{ Pa}$", isCorrect: true },
            { id: "c", text: "$50\\text{ Pa}$", isCorrect: false },
            { id: "d", text: "$800\\text{ Pa}$", isCorrect: false }
        ],
        hint: "Primero calcula el área de la superficie de contacto ($A = \\text{lado}^2$). Luego usa la fórmula de presión: $P = \\frac{F}{A}$.",
        explanation: "1. **Calcular el Área**: Como la superficie es cuadrada con lado $0.5\\text{ m}$:\n   $$A = 0.5\\text{ m} \\times 0.5\\text{ m} = 0.25\\text{ m}^2$$\n2. **Calcular la Presión**: Usando la fórmula $P = \\frac{F}{A}$ (donde la fuerza $F$ es el peso de $100\\text{ N}$):\n   $$P = \\frac{100\\text{ N}}{0.25\\text{ m}^2} = 400\\text{ Pa}$$\n\nPor lo tanto, la presión ejercida es de **$400\\text{ Pa}$**.",
        level: 3
    },
    {
        id: 9,
        topic: "Física - Energía Mecánica",
        question: "¿Cuál es la energía potencial de un objeto de $2\\text{ kg}$ situado a una altura de $10\\text{ m}$? (Considera $g = 9.8\\text{ m/s}^2$)",
        options: [
            { id: "a", text: "$196\\text{ J}$", isCorrect: true },
            { id: "b", text: "$98\\text{ J}$", isCorrect: false },
            { id: "c", text: "$20\\text{ J}$", isCorrect: false },
            { id: "d", text: "$200\\text{ J}$", isCorrect: false }
        ],
        hint: "Usa la fórmula de energía potencial gravitatoria: $E_p = m \\cdot g \\cdot h$.",
        explanation: "La energía potencial gravitatoria se calcula con:\n$$E_p = m \\cdot g \\cdot h$$\n\nSustituyendo los valores del problema:\n- Masa ($m$) = $2\\text{ kg}$\n- Gravedad ($g$) = $9.8\\text{ m/s}^2$\n- Altura ($h$) = $10\\text{ m}$\n\n$$E_p = 2 \\times 9.8 \\times 10 = 196\\text{ Joules (J)}$$",
        level: 2
    },

    // ==========================================
    // TEMA 3: ESPAÑOL Y LENGUAJE (Ortografía, Léxico y Redacción)
    // ==========================================
    {
        id: 10,
        topic: "Español - Funciones del Lenguaje",
        question: "Identifica la función del lenguaje predominante en la frase: '¡Cierra la puerta inmediatamente al salir!'",
        options: [
            { id: "a", text: "Metalingüística", isCorrect: false },
            { id: "b", text: "Apelativa o Conativa", isCorrect: true },
            { id: "c", text: "Referencial o Informativa", isCorrect: false },
            { id: "d", text: "Poética", isCorrect: false }
        ],
        hint: "Piensa en cuál es el objetivo principal del emisor: ¿expresar sentimientos, informar un hecho u ordenar/convencer al receptor?",
        explanation: "La **función apelativa o conativa** se centra en el receptor. Su objetivo es influir en la conducta del oyente mediante órdenes, peticiones, sugerencias o preguntas. En este caso, '¡Cierra la puerta!' es un mandato directo, por lo que es claramente apelativa.",
        level: 2
    },
    {
        id: 11,
        topic: "Español - Ortografía y Acentuación",
        question: "¿Cuál de las siguientes palabras está acentuada INCORRECTAMENTE?",
        options: [
            { id: "a", text: "Exámen", isCorrect: true },
            { id: "b", text: "Canción", isCorrect: false },
            { id: "c", text: "Árbol", isCorrect: false },
            { id: "d", text: "Sábado", isCorrect: false }
        ],
        hint: "Pronuncia la palabra 'examen'. ¿Dónde lleva la sílaba tónica? ¿Qué tipo de palabra es (aguda, grave o esdrújula) y cuál es su regla?",
        explanation: "La palabra **'examen'** es una palabra grave (penúltima sílaba tónica: ex-a-men) que termina en la letra 'n'. De acuerdo con la regla de acentuación, las palabras graves **no** llevan tilde si terminan en 'n', 's' o vocal. Por tanto, escribir 'Exámen' es incorrecto.",
        level: 1
    },

    // ==========================================
    // TEMA 4: CIENCIAS SOCIALES E HISTORIA
    // ==========================================
    {
        id: 12,
        topic: "Historia - Culturas Prehispánicas",
        question: "¿Qué cultura de Mesoamérica es conocida como la 'cultura madre' y destaca por tallar gigantescas cabezas de piedra?",
        options: [
            { id: "a", text: "Cultura Maya", isCorrect: false },
            { id: "b", text: "Cultura Olmeca", isCorrect: true },
            { id: "c", text: "Cultura Mexica", isCorrect: false },
            { id: "d", text: "Cultura Tolteca", isCorrect: false }
        ],
        hint: "Se establecieron principalmente en los estados actuales de Veracruz y Tabasco durante el período Preclásico.",
        explanation: "La **cultura Olmeca** es considerada la 'cultura madre' de Mesoamérica porque sentó las bases de muchas tradiciones, escrituras, calendarios y deidades que heredaron otras culturas posteriores. Son mundialmente famosos por sus impresionantes cabezas colosales talladas en basalto.",
        level: 1
    },
    {
        id: 13,
        topic: "Geografía - Coordenadas Geográficas",
        question: "¿Cómo se llama la distancia angular medida en grados respecto al Ecuador terrestre (norte o sur)?",
        options: [
            { id: "a", text: "Altitud", isCorrect: false },
            { id: "b", text: "Latitud", isCorrect: true },
            { id: "c", text: "Longitud", isCorrect: false },
            { id: "d", text: "Azimut", isCorrect: false }
        ],
        hint: "El ecuador divide la tierra en Hemisferio Norte y Sur. Los meridianos (como Greenwich) miden este u oeste.",
        explanation: "- La **Latitud** es la distancia medida en grados respecto al Ecuador (Línea horizontal base). Va de $0^\\circ$ a $90^\\circ$ (Norte o Sur).\n- La **Longitud** se mide respecto al meridiano de Greenwich (este u oeste).",
        level: 2
    }
];

// Agregar dinámicamente más preguntas progresivas hasta completar un banco robusto
const extraQuestions = [
    {
        id: 14,
        topic: "Matemáticas - Sucesiones Aritméticas",
        question: "Determina el término general ($a_n$) de la siguiente sucesión aritmética: $3, 7, 11, 15, ...$",
        options: [
            { id: "a", text: "$a_n = 4n - 1$", isCorrect: true },
            { id: "b", text: "$a_n = 3n + 1$", isCorrect: false },
            { id: "c", text: "$a_n = 4n + 3$", isCorrect: false },
            { id: "d", text: "$a_n = 2n + 1$", isCorrect: false }
        ],
        hint: "Encuentra la diferencia común ($d$) entre términos sucesivos y aplica la fórmula $a_n = a_1 + (n - 1)d$.",
        explanation: "1. El primer término es $a_1 = 3$.\n2. La diferencia común es $d = 7 - 3 = 4$.\n3. Aplicamos la fórmula del término general:\n   $$a_n = 3 + (n - 1)4 = 3 + 4n - 4 = 4n - 1$$\n\n¡Por lo tanto, la respuesta correcta es **$a_n = 4n - 1$**!",
        level: 2
    },
    {
        id: 15,
        topic: "Física - Electrostática (Ley de Coulomb)",
        question: "Si la distancia entre dos cargas eléctricas cargadas del mismo signo se reduce a la mitad, ¿qué ocurre con la fuerza de repulsión entre ellas?",
        options: [
            { id: "a", text: "Se reduce a la mitad.", isCorrect: false },
            { id: "b", text: "Se cuadruplica.", isCorrect: true },
            { id: "c", text: "Permanece igual.", isCorrect: false },
            { id: "d", text: "Se duplica.", isCorrect: false }
        ],
        hint: "La Ley de Coulomb establece que la fuerza es inversamente proporcional al cuadrado de la distancia ($F \\propto \\frac{1}{r^2}$).",
        explanation: "De acuerdo con la Ley de Coulomb, la fuerza eléctrica entre dos cargas es inversamente proporcional al cuadrado de la distancia que las separa:\n$$F = k \\frac{q_1 q_2}{r^2}$$\n\nSi la distancia ($r$) se reduce a la mitad ($r' = \\frac{r}{2}$), el nuevo denominador se convierte en:\n$$(r')^2 = \\left(\\frac{r}{2}\\right)^2 = \\frac{r^2}{4}$$\n\nEl factor $\\frac{1}{4}$ en el denominador pasa a multiplicar en el numerador, haciendo que la nueva fuerza sea **$4$ veces mayor** que la original ($4F$).",
        level: 3
    },
    {
        id: 16,
        topic: "Español - Léxico y Semántica",
        question: "Elige el par de palabras que representan un ejemplo claro de palabras homógrafas.",
        options: [
            { id: "a", text: "Vino (bebida) / Vino (del verbo venir)", isCorrect: true },
            { id: "b", text: "Casa (vivienda) / Caza (acción de cazar)", isCorrect: false },
            { id: "c", text: "Cerca (próximo) / Lejos (distante)", isCorrect: false },
            { id: "d", text: "Tubos (conductos) / Tuvo (del verbo tener)", isCorrect: false }
        ],
        hint: "Homógrafas significa que se escriben exactamente igual pero tienen significados diferentes.",
        explanation: "- Las palabras **homógrafas** se escriben idénticamente pero significan cosas distintas (ej. 'Vino' de bebida y 'Vino' de venir).\n- Las palabras que suenan igual pero se escriben diferente (como 'casa/caza' o 'tubo/tuvo') se denominan **homófonas**.",
        level: 1
    },
    {
        id: 17,
        topic: "Historia - Independencia de México",
        question: "¿Cuál de los siguientes personajes históricos es reconocido por redactar el documento 'Sentimientos de la Nación' en 1813?",
        options: [
            { id: "a", text: "Miguel Hidalgo y Costilla", isCorrect: false },
            { id: "b", text: "José María Morelos y Pavón", isCorrect: true },
            { id: "c", text: "Agustín de Iturbide", isCorrect: false },
            { id: "d", text: "Vicente Guerrero", isCorrect: false }
        ],
        hint: "Es conocido como el 'Siervo de la Nación' y continuó el movimiento insurgente después de la muerte de Hidalgo.",
        explanation: "**José María Morelos y Pavón** redactó y leyó el documento 'Sentimientos de la Nación' durante la apertura del Congreso de Anáhuac en Chilpancingo. En él se planteó por primera vez la total independencia de América de la corona española y la abolición de la esclavitud.",
        level: 2
    },
    {
        id: 18,
        topic: "Matemáticas - Cálculo de Probabilidades",
        question: "Si lanzas dos dados de 6 caras al mismo tiempo, ¿cuál es la probabilidad de que la suma de los dos dados sea exactamente 7?",
        options: [
            { id: "a", text: "$\\frac{1}{6}$", isCorrect: true },
            { id: "b", text: "$\\frac{1}{12}$", isCorrect: false },
            { id: "c", text: "$\\frac{1}{36}$", isCorrect: false },
            { id: "d", text: "$\\frac{5}{36}$", isCorrect: false }
        ],
        hint: "Encuentra el total de resultados posibles ($6 \\times 6 = 36$) y cuántas combinaciones suman exactamente 7 (ej. 1+6, 2+5...).",
        explanation: "1. **Espacio Muestral**: Hay $6 \\times 6 = 36$ resultados posibles al lanzar dos dados.\n2. **Casos Favorables**: Las combinaciones que suman 7 son:\n   - $(1, 6)$, $(2, 5)$, $(3, 4)$, $(4, 3)$, $(5, 2)$, $(6, 1)$ (en total 6 casos).\n3. **Probabilidad**:\n   $$P = \\frac{\\text{Casos favorables}}{\\text{Casos totales}} = \\frac{6}{36} = \\frac{1}{6}$$",
        level: 2
    },
    {
        id: 19,
        topic: "Química - Tabla Periódica",
        question: "¿Qué tipo de enlace químico se forma cuando un metal transfiere completamente sus electrones a un no metal?",
        options: [
            { id: "a", text: "Enlace Covalente polar", isCorrect: false },
            { id: "b", text: "Enlace Iónico", isCorrect: true },
            { id: "c", text: "Enlace Metálico", isCorrect: false },
            { id: "d", text: "Enlace Covalente no polar", isCorrect: false }
        ],
        hint: "La transferencia de electrones produce iones cargados (cationes y aniones) que se atraen mutuamente.",
        explanation: "El **enlace iónico** se genera mediante la transferencia completa de uno o más electrones desde un átomo metálico (que se convierte en un catión con carga positiva) hacia uno no metálico (que pasa a ser un anión negativo), atrayéndose electrostáticamente.",
        level: 2
    },
    {
        id: 20,
        topic: "Literatura - Movimientos Literarios",
        question: "¿A qué corriente literaria pertenece la famosa obra 'Cien años de soledad' del escritor Gabriel García Márquez?",
        options: [
            { id: "a", text: "Modernismo", isCorrect: false },
            { id: "b", text: "Realismo Mágico", isCorrect: true },
            { id: "c", text: "Romanticismo", isCorrect: false },
            { id: "d", text: "Barroco", isCorrect: false }
        ],
        hint: "Es el movimiento del 'Boom latinoamericano' caracterizado por introducir elementos fantásticos como algo cotidiano.",
        explanation: "**Gabriel García Márquez** es el máximo exponente del **Realismo Mágico**, una corriente literaria hispanoamericana del siglo XX que muestra lo irreal o extraño como algo común y ordinario del día a día.",
        level: 2
    },
    {
        id: 21,
        topic: "Biología - División Celular",
        question: "¿Cuál es el proceso de división celular que da origen a cuatro células hijas haploides genéticamente distintas, ocurriendo exclusivamente en células sexuales?",
        options: [
            { id: "a", text: "Mitosis", isCorrect: false },
            { id: "b", text: "Meiosis", isCorrect: true },
            { id: "c", text: "Fisión binaria", isCorrect: false },
            { id: "d", text: "Citocinesis", isCorrect: false }
        ],
        hint: "Piensa en el proceso necesario para producir óvulos y espermatozoides con la mitad del material genético.",
        explanation: "La **Meiosis** es un proceso especial de división celular en organismos con reproducción sexual. Consiste en dos divisiones nucleares consecutivas que reducen a la mitad el número de cromosomas (de diploide $2n$ a haploide $n$), generando 4 gametos (células sexuales) genéticamente diferentes debido a la recombinación genética.",
        level: 2
    },
    {
        id: 22,
        topic: "Matemáticas - Sistemas de Ecuaciones",
        question: "Resuelve el siguiente sistema de ecuaciones de $2 \\times 2$:\n$$\\begin{cases} x + y = 5 \\\\ 2x - y = 4 \\end{cases}$$\n¿Cuáles son los valores de $x$ y $y$?",
        options: [
            { id: "a", text: "$x = 3, y = 2$", isCorrect: true },
            { id: "b", text: "$x = 2, y = 3$", isCorrect: false },
            { id: "c", text: "$x = 4, y = 1$", isCorrect: false },
            { id: "d", text: "$x = 1, y = 4$", isCorrect: false }
        ],
        hint: "Puedes usar el método de suma y resta (eliminación) sumando directamente ambas ecuaciones para eliminar la variable $y$.",
        explanation: "Usamos el método de **Suma y Resta** (Eliminación):\n1. Sumamos ambas ecuaciones directamente:\n   $$(x + y) + (2x - y) = 5 + 4$$\n   $$3x = 9 \\Rightarrow x = 3$$\n2. Sustituimos $x = 3$ en la primera ecuación:\n   $$3 + y = 5 \\Rightarrow y = 2$$\n\nLa solución es **$x = 3, y = 2$**.",
        level: 2
    },
    {
        id: 23,
        topic: "Física - Termodinámica",
        question: "¿Qué cantidad de calor se requiere para elevar la temperatura de $100\\text{ g}$ de agua de $20^\\circ\\text{C}$ a $50^\\circ\\text{C}$? (Considera el calor específico del agua $c = 1\\text{ cal/g}^\\circ\\text{C}$)",
        options: [
            { id: "a", text: "$3,000\\text{ cal}$", isCorrect: true },
            { id: "b", text: "$1,500\\text{ cal}$", isCorrect: false },
            { id: "c", text: "$5,000\\text{ cal}$", isCorrect: false },
            { id: "d", text: "$300\\text{ cal}$", isCorrect: false }
        ],
        hint: "Usa la fórmula de calor sensible: $Q = m \\cdot c \\cdot \\Delta T$, donde $\\Delta T = T_f - T_i$.",
        explanation: "1. Calculamos la variación de temperatura:\n   $$\\Delta T = 50^\\circ\\text{C} - 20^\\circ\\text{C} = 30^\\circ\\text{C}$$\n2. Usamos la fórmula $Q = m \\cdot c \\cdot \\Delta T$:\n   $$Q = 100\\text{ g} \\times 1\\text{ cal/g}^\\circ\\text{C} \\times 30^\\circ\\text{C}$$\n   $$Q = 3,000\\text{ calorías (cal)}$$\n\nSe requieren exactamente **$3,000\\text{ cal}$**.",
        level: 3
    },
    {
        id: 24,
        topic: "Español - Acento Diacrítico",
        question: "Selecciona la oración redactada de manera ortográficamente CORRECTA con respecto al acento diacrítico.",
        options: [
            { id: "a", text: "Él me dijo que sí vendría a tomar el té.", isCorrect: true },
            { id: "b", text: "El me dijo que si vendría a tomar el te.", isCorrect: false },
            { id: "c", text: "Él me dijo que si vendría a tomar el te.", isCorrect: false },
            { id: "d", text: "El me dijo que sí vendría a tomar el té.", isCorrect: false }
        ],
        hint: "Recuerda que: 'él' (pronombre), 'sí' (afirmación) y 'té' (infusión) llevan tilde diacrítica para distinguirse de sus contrapartes.",
        explanation: "- **Él** (pronombre personal) lleva tilde, a diferencia del artículo **el**.\n- **Sí** (afirmación) lleva tilde, a diferencia del condicional **si**.\n- **Té** (bebida) lleva tilde, a diferencia del pronombre reflexivo **te**.\n\nPor lo tanto, la oración correcta es: **'Él me dijo que sí vendría a tomar el té.'**",
        level: 2
    },
    {
        id: 25,
        topic: "Historia - Revolución Mexicana",
        question: "¿Qué plan proclamó Francisco I. Madero en 1910 llamando a las armas bajo el lema 'Sufragio efectivo, no reelección' contra Porfirio Díaz?",
        options: [
            { id: "a", text: "Plan de San Luis", isCorrect: true },
            { id: "b", text: "Plan de Ayala", isCorrect: false },
            { id: "c", text: "Plan de Guadalupe", isCorrect: false },
            { id: "d", text: "Plan de Tuxtepec", isCorrect: false }
        ],
        hint: "Se firmó en Texas y convocó al levantamiento armado nacional para el 20 de noviembre de 1910.",
        explanation: "El **Plan de San Luis** fue proclamado por Francisco I. Madero el 5 de octubre de 1910. Su objetivo principal era desconocer la reelección de Porfirio Díaz y convocar al pueblo de México a iniciar la revolución armada el **20 de noviembre de 1910**.",
        level: 2
    },
    {
        id: 26,
        topic: "Matemáticas - Geometría Analítica (La Elipse)",
        question: "Dada la ecuación de la elipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$, ¿cuál es la longitud de su eje mayor?",
        options: [
            { id: "a", text: "$10$", isCorrect: true },
            { id: "b", text: "$5$", isCorrect: false },
            { id: "c", text: "$6$", isCorrect: false },
            { id: "d", text: "$8$", isCorrect: false }
        ],
        hint: "La ecuación ordinaria es $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ donde $a^2$ es el denominador más grande. La longitud del eje mayor es $2a$.",
        explanation: "1. Identificamos $a^2$ como el mayor denominador:\n   $$a^2 = 25 \\Rightarrow a = 5$$\n2. La longitud del **eje mayor** es $2a$:\n   $$\\text{Eje mayor} = 2 \\times 5 = 10$$\n\n(La longitud del eje menor es $2b = 2 \\times 3 = 6$).",
        level: 3
    },
    {
        id: 27,
        topic: "Español - Prototipos Textuales",
        question: "¿Qué tipo de texto o prototipo de redacción tiene como finalidad principal defender una postura mediante razones válidas para convencer al receptor?",
        options: [
            { id: "a", text: "Texto Argumentativo", isCorrect: true },
            { id: "b", text: "Texto Descriptivo", isCorrect: false },
            { id: "c", text: "Texto Expositivo", isCorrect: false },
            { id: "d", text: "Texto Narrativo", isCorrect: false }
        ],
        hint: "Consiste en dar razones coherentes, evidencias o justificaciones para validar una opinión propia o refutar otra.",
        explanation: "El **texto argumentativo** tiene como objetivo expresar opiniones o debatirlas con el fin de persuadir o convencer al receptor. Se basa en una tesis apoyada por premisas y conclusiones bien fundamentadas.",
        level: 2
    },
    {
        id: 28,
        topic: "Física - Cinemática (Tiro Parabólico)",
        question: "¿Con qué ángulo de inclinación debe dispararse un proyectil para lograr su alcance horizontal MÁXIMO?",
        options: [
            { id: "a", text: "$45^\\circ$", isCorrect: true },
            { id: "b", text: "$30^\\circ$", isCorrect: false },
            { id: "c", text: "$60^\\circ$", isCorrect: false },
            { id: "d", text: "$90^\\circ$", isCorrect: false }
        ],
        hint: "El alcance depende de la función trigonométrica $\\sin(2\\theta)$. El seno alcanza su valor máximo ($1$) en $90^\\circ$.",
        explanation: "La fórmula para el alcance horizontal máximo ($R$) en tiro parabólico es:\n$$R = \\frac{v_0^2 \\sin(2\\theta)}{g}$$\n\nPara que $R$ sea máximo, el factor $\\sin(2\\theta)$ debe ser igual a su valor máximo, que es $1$:\n$$\\sin(2\\theta) = 1 \\Rightarrow 2\\theta = 90^\\circ \\Rightarrow \\theta = 45^\\circ$$\n\nPor tanto, el alcance máximo se logra a los **$45^\\circ$**.",
        level: 3
    },
    {
        id: 29,
        topic: "Geografía - Recursos Naturales",
        question: "¿Cuál de las siguientes opciones describe de manera correcta un recurso natural no renovable?",
        options: [
            { id: "a", text: "El petróleo", isCorrect: true },
            { id: "b", text: "La energía solar", isCorrect: false },
            { id: "c", text: "El viento (energía eólica)", isCorrect: false },
            { id: "d", text: "La madera de bosques sustentables", isCorrect: false }
        ],
        hint: "Son recursos que existen en cantidades limitadas en la naturaleza y cuya tasa de regeneración es extremadamente lenta (toma millones de años).",
        explanation: "Los **recursos no renovables** son aquellos depósitos limitados de la naturaleza que no se pueden regenerar a una escala de tiempo humana (ej. el petróleo, carbón, gas natural y minerales). La energía solar, eólica e hidráulica son consideradas recursos inagotables o renovables.",
        level: 1
    },
    {
        id: 30,
        topic: "Literatura - Fábula vs Epopeya",
        question: "¿Cuál es la característica definitoria que distingue a una fábula de una epopeya literaria?",
        options: [
            { id: "a", text: "La fábula incluye siempre una moraleja o enseñanza al final.", isCorrect: true },
            { id: "b", text: "La epopeya está escrita exclusivamente en prosa breve.", isCorrect: false },
            { id: "c", text: "La fábula narra viajes de héroes legendarios e imperios.", isCorrect: false },
            { id: "d", text: "La epopeya tiene personajes compuestos solo de plantas.", isCorrect: false }
        ],
        hint: "Las fábulas son relatos cortos con animales personificados orientados a enseñar valores morales a los niños.",
        explanation: "La **fábula** es un relato breve, generalmente en prosa o verso, protagonizado por animales humanizados que concluye con una **moraleja** (enseñanza moral). Por otro lado, la **epopeya** es una composición poética extensa que narra las hazañas heroicas y legendarias de los héroes de una nación (ej. la *Ilíada* o la *Odisea*).",
        level: 2
    },
    {
        id: 31,
        topic: "Física - Cinemática (MRUA)",
        question: "Un auto parte del reposo y acelera uniformemente a razón de $3\\text{ m/s}^2$ durante $4\\text{ s}$. ¿Qué distancia recorre en ese tiempo?",
        options: [
            { id: "a", text: "$24\\text{ m}$", isCorrect: true },
            { id: "b", text: "$12\\text{ m}$", isCorrect: false },
            { id: "c", text: "$48\\text{ m}$", isCorrect: false },
            { id: "d", text: "$16\\text{ m}$", isCorrect: false }
        ],
        hint: "Como parte del reposo, su velocidad inicial es $v_0 = 0$. Usa la fórmula: $d = v_0 t + \\frac{1}{2} a t^2$.",
        explanation: "El **Movimiento Rectilíneo Uniformemente Acelerado (MRUA)** modela este comportamiento con la fórmula:\n$$d = v_0 t + \\frac{1}{2} a t^2$$\n\nSustituyendo los datos del problema:\n- Velocidad inicial ($v_0$) = $0\\text{ m/s}$ (parte del reposo)\n- Aceleración ($a$) = $3\\text{ m/s}^2$\n- Tiempo ($t$) = $4\\text{ s}$\n\n$$d = 0 \\times 4 + \\frac{1}{2} \\times 3 \\times 4^2$$\n$$d = 0 + \\frac{1}{2} \\times 3 \\times 16$$\n$$d = 1.5 \\times 16 = 24\\text{ metros (m)}$$\n\n¡Por lo tanto, recorre exactamente **$24\\text{ m}$**!",
        level: 2
    },
    {
        id: 32,
        topic: "Matemáticas - Funciones Racionales",
        question: "¿Cuál es la ecuación de la asíntota vertical de la función racional $f(x) = \\frac{2x + 3}{x - 4}$?",
        options: [
            { id: "a", text: "$x = 4$", isCorrect: true },
            { id: "b", text: "$x = -4$", isCorrect: false },
            { id: "c", text: "$y = 2$", isCorrect: false },
            { id: "d", text: "$x = 2$", isCorrect: false }
        ],
        hint: "La asíntota vertical ocurre en los valores de $x$ que hacen que el denominador de la función sea igual a cero.",
        explanation: "Las **asíntotas verticales** son rectas verticales que corresponden a los valores de $x$ donde la función racional no está definida (el denominador se anula y la función tiende al infinito).\n\n1. Tomamos el denominador de la función $f(x) = \\frac{2x+3}{x-4}$:\n   $$x - 4 = 0$$\n2. Despejamos $x$:\n   $$x = 4$$\n\nPor tanto, la recta **$x = 4$** es la asíntota vertical. (Nota: $y = 2$ es la asíntota horizontal).",
        level: 3
    },
    {
        id: 33,
        topic: "Español - Léxico y Semántica",
        question: "En el enunciado: 'El científico mostró un comportamiento *altruista* al donar la patente de su vacuna', ¿cuál es el sinónimo más adecuado para la palabra en cursiva?",
        options: [
            { id: "a", text: "Desinteresado", isCorrect: true },
            { id: "b", text: "Egoísta", isCorrect: false },
            { id: "c", text: "Avaricioso", isCorrect: false },
            { id: "d", text: "Orgulloso", isCorrect: false }
        ],
        hint: "Analiza el contexto: donar una patente médica beneficia a toda la humanidad sin buscar ganancia personal directa.",
        explanation: "La palabra **altruista** hace referencia a una persona que procura el bien ajeno de manera desinteresada, incluso a costa de su propio interés. Por lo tanto, el sinónimo perfecto en este contexto es **desinteresado**.",
        level: 1
    },
    {
        id: 34,
        topic: "Historia - La Ilustración colonial",
        question: "¿Qué movimiento intelectual del siglo XVIII promovía el uso de la razón, el progreso científico y la crítica al absolutismo, influyendo directamente en la futura independencia de América?",
        options: [
            { id: "a", text: "La Ilustración", isCorrect: true },
            { id: "b", text: "El Renacimiento", isCorrect: false },
            { id: "c", text: "El Humanismo", isCorrect: false },
            { id: "d", text: "La Reforma Protestante", isCorrect: false }
        ],
        hint: "También se le conoce como el 'Siglo de las Luces' y sus exponentes fueron pensadores como Rousseau, Montesquieu y Voltaire.",
        explanation: "La **Ilustración** fue un movimiento filosófico y cultural europeo del siglo XVIII que sostenía que la razón humana podía combatir la ignorancia, la superstición y la tiranía para construir un mundo mejor. Sus ideas de libertad e igualdad sirvieron de base doctrinal para las revoluciones e independencias americanas.",
        level: 2
    },
    {
        id: 35,
        topic: "Biología - Genética de Mendel",
        question: "Si cruzamos dos plantas heterocigotas de flores rojas ($Rr$, donde el rojo $R$ es dominante sobre el blanco $r$), ¿cuál es la proporción fenotípica esperada en la descendencia?",
        options: [
            { id: "a", text: "$3$ plantas rojas y $1$ planta blanca", isCorrect: true },
            { id: "b", text: "$1$ planta roja y $3$ plantas blancas", isCorrect: false },
            { id: "c", text: "$2$ plantas rojas y $2$ plantas blancas", isCorrect: false },
            { id: "d", text: "Todas las plantas serán rojas", isCorrect: false }
        ],
        hint: "Haz el cuadro de Punnett cruzando $R$ y $r$ con otro $R$ y $r$. Los genotipos resultantes son $RR$, $Rr$, $Rr$, y $rr$.",
        explanation: "Al cruzar dos plantas heterocigotas ($Rr \\times Rr$), elaboramos el **Cuadro de Punnett**:\n\n$$\\begin{array}{c|cc} & R & r \\\\ \\hline R & RR & Rr \\\\ r & Rr & rr \\end{array}$$\n\n1. **Análisis de Genotipos**:\n   - $1/4$ Homocigoto dominante ($RR$)\n   - $2/4$ Heterocigoto ($Rr$)\n   - $1/4$ Homocigoto recesivo ($rr$)\n2. **Análisis de Fenotipos (Aspecto físico)**:\n   - Tanto $RR$ como $Rr$ expresan el color dominante (flores rojas): $1 + 2 = 3$ partes.\n   - Solo $rr$ expresa el color recesivo (flores blancas): $1$ parte.\n\nPor tanto, la proporción fenotípica esperada es **$3$ rojas por cada $1$ blanca** ($3:1$).",
        level: 2
    },
    {
        id: 36,
        topic: "Matemáticas - Logaritmos",
        question: "Resuelve la siguiente ecuación para hallar el valor de $x$: $\\log_2(x) = 5$",
        options: [
            { id: "a", text: "$32$", isCorrect: true },
            { id: "b", text: "$10$", isCorrect: false },
            { id: "c", text: "$25$", isCorrect: false },
            { id: "d", text: "$16$", isCorrect: false }
        ],
        hint: "Usa la definición fundamental de los logaritmos: si $\\log_b(y) = x$, entonces $b^x = y$.",
        explanation: "Aplicando la definición de un **logaritmo**:\n$$\\log_b(y) = x \\Longleftrightarrow b^x = y$$\n\nEn la ecuación dada:\n$$\\log_2(x) = 5$$\n\nLa base es $2$, el exponente es $5$, por lo tanto:\n$$x = 2^5$$\n$$x = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$$\n\n¡Por lo tanto, la respuesta correcta es **$32$**!",
        level: 3
    },
    {
        id: 37,
        topic: "Química - Balanceo de Ecuaciones",
        question: "¿Qué coeficiente debe colocarse frente al $O_2$ para balancear completamente la siguiente ecuación de combustión?\n$$CH_4 + \\_\\_ O_2 \\longrightarrow CO_2 + 2H_2O$$",
        options: [
            { id: "a", text: "$2$", isCorrect: true },
            { id: "b", text: "$1$", isCorrect: false },
            { id: "c", text: "$3$", isCorrect: false },
            { id: "d", text: "$4$", isCorrect: false }
        ],
        hint: "Cuenta el número total de átomos de Oxígeno ($O$) en el lado derecho de la ecuación (productos) y asegúrate de tener el mismo número en el lado izquierdo (reactivos).",
        explanation: "Siguiendo la **Ley de Conservación de la Materia**, el número de átomos de cada elemento debe ser igual en reactivos y productos:\n\n1. Contamos los átomos en los productos (lado derecho):\n   - Carbono ($C$): $1$ (en $CO_2$)\n   - Hidrógeno ($H$): $4$ (en $2H_2O$)\n   - Oxígeno ($O$): $2$ (de $CO_2$) + $2$ (de $2H_2O$) = $4$ átomos de Oxígeno en total.\n2. Lado izquierdo (reactivos):\n   - Tenemos $CH_4$ ($1C$ y $4H$, balanceados).\n   - Para tener $4$ átomos de Oxígeno ($O$), necesitamos colocar un coeficiente **$2$** delante de la molécula diatómica de Oxígeno ($O_2$):\n     $$2 \\times O_2 = 4\\text{ átomos de O}$$\n\nLa ecuación balanceada es: **$CH_4 + 2O_2 \\longrightarrow CO_2 + 2H_2O$**.",
        level: 2
    },
    {
        id: 38,
        topic: "Física - Leyes de Kepler",
        question: "¿Qué establece la Primera Ley de Kepler sobre el movimiento de los planetas alrededor del Sol?",
        options: [
            { id: "a", text: "Los planetas se mueven en órbitas elípticas con el Sol en uno de los focos.", isCorrect: true },
            { id: "b", text: "Las órbitas son perfectamente circulares con el Sol en el centro.", isCorrect: false },
            { id: "c", text: "El cuadrado del período orbital es proporcional al cubo de la distancia.", isCorrect: false },
            { id: "d", text: "Los planetas se mueven más rápido cuando están más lejos del Sol.", isCorrect: false }
        ],
        hint: "Kepler revolucionó la astronomía al descartar los círculos perfectos de Copérnico e introducir una figura cónica ovalada.",
        explanation: "La **Primera Ley de Kepler (Ley de las Órbitas)** establece que todos los planetas se desplazan alrededor del Sol describiendo **órbitas elípticas**, donde el Sol no está en el centro, sino en uno de los dos **focos** de la elipse.",
        level: 2
    },
    {
        id: 39,
        topic: "Literatura - Géneros Literarios",
        question: "¿A qué género literario pertenece una obra escrita en verso o prosa estructurada principalmente en diálogos y acotaciones, diseñada para ser representada en un escenario ante un público?",
        options: [
            { id: "a", text: "Género Dramático", isCorrect: true },
            { id: "b", text: "Género Lírico", isCorrect: false },
            { id: "c", text: "Género Narrativo", isCorrect: false },
            { id: "d", text: "Género Didáctico", isCorrect: false }
        ],
        hint: "Es el género del teatro, donde la historia se cuenta a través de las acciones y conversaciones de los actores, sin narrador.",
        explanation: "El **Género Dramático** comprende aquellas obras creadas para ser representadas en un teatro por actores que asumen personajes. Sus herramientas estructurales fundamentales son los **diálogos** de los personajes y las **acotaciones** (indicaciones del autor sobre vestuario, movimientos o escenografía).",
        level: 2
    },
    {
        id: 40,
        topic: "Arquitectura - Razonamiento Espacial",
        question: "Si doblamos una plantilla plana en cruz de $6$ cuadrados para formar un cubo tridimensional, ¿cuántos vértices tendrá la figura final resultante?",
        options: [
            { id: "a", text: "$8$ vértices", isCorrect: true },
            { id: "b", text: "$6$ vértices", isCorrect: false },
            { id: "c", text: "$12$ vértices", isCorrect: false },
            { id: "d", text: "$16$ vértices", isCorrect: false }
        ],
        hint: "No te confundas entre caras (lados planos), aristas (bordes) y vértices (puntos o esquinas donde se unen las líneas). Un cubo tiene 6 caras.",
        explanation: "Esta es una pregunta fundamental de **razonamiento espacial** para aspirantes de Arquitectura:\n\n- Un **cubo** es un poliedro regular de tres dimensiones.\n- Consta de **$6$ caras** cuadradas.\n- Posee **$12$ aristas** (las líneas de unión de las caras).\n- Posee **$8$ vértices** (las esquinas de unión de las aristas, $4$ en la base inferior y $4$ en la tapa superior).\n\nIndependientemente del patrón bidimensional del que partas para doblarlo, la figura final tridimensional (el cubo) siempre conserva exactamente **$8$ vértices**.",
        level: 3
    }
];

// Integrar todas las preguntas al banco final expuesto globalmente
window.EXCOBA_QUESTIONS = [...questionsData, ...extraQuestions];
