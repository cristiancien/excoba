const questionsData = [
    {
        id: 1,
        topic: "Matemáticas - Álgebra",
        question: "Resuelve la siguiente ecuación cuadrática: $x^2 - 5x + 6 = 0$. ¿Cuáles son los valores de $x$?",
        options: [
            { id: "a", text: "$x_1 = 2, x_2 = 3$", isCorrect: true },
            { id: "b", text: "$x_1 = -2, x_2 = -3$", isCorrect: false },
            { id: "c", text: "$x_1 = 1, x_2 = 6$", isCorrect: false },
            { id: "d", text: "$x_1 = -1, x_2 = -6$", isCorrect: false }
        ],
        hint: "Recuerda que debes buscar dos números que multiplicados den 6 y sumados den -5.",
        explanation: "Para resolver $x^2 - 5x + 6 = 0$ factorizando, buscamos dos números que:\n\n1. Multiplicados den $6$ (término independiente).\n2. Sumados den $-5$ (coeficiente de $x$).\n\nEstos números son $-2$ y $-3$. Por tanto, la ecuación se factoriza como: $(x - 2)(x - 3) = 0$.\n\nIgualando cada factor a cero obtenemos las soluciones:\n$x - 2 = 0 \\Rightarrow x_1 = 2$\n$x - 3 = 0 \\Rightarrow x_2 = 3$",
        level: 1
    },
    {
        id: 2,
        topic: "Física - Cinemática",
        question: "Un auto parte del reposo y alcanza una velocidad de $20 \\frac{m}{s}$ en $5$ segundos. ¿Cuál es su aceleración?",
        options: [
            { id: "a", text: "$5 \\frac{m}{s^2}$", isCorrect: false },
            { id: "b", text: "$4 \\frac{m}{s^2}$", isCorrect: true },
            { id: "c", text: "$100 \\frac{m}{s^2}$", isCorrect: false },
            { id: "d", text: "$15 \\frac{m}{s^2}$", isCorrect: false }
        ],
        hint: "Utiliza la fórmula de la aceleración: $a = \\frac{v_f - v_0}{t}$.",
        explanation: "La aceleración ($a$) se define como el cambio de velocidad en el tiempo. Usamos la fórmula:\n$$a = \\frac{v_f - v_0}{t}$$\n\nDonde:\n- Velocidad final ($v_f$) = $20 \\frac{m}{s}$\n- Velocidad inicial ($v_0$) = $0 \\frac{m}{s}$ (parte del reposo)\n- Tiempo ($t$) = $5 s$\n\nSustituyendo:\n$$a = \\frac{20 - 0}{5} = \\frac{20}{5} = 4 \\frac{m}{s^2}$$",
        level: 1
    },
    {
        id: 3,
        topic: "Razonamiento Espacial",
        question: "Si se despliega un cubo, ¿cuál de las siguientes es una red plana válida para formar dicho cubo?",
        options: [
            { id: "a", text: "Una cruz de 4 cuadrados verticales y 2 laterales contiguos.", isCorrect: false },
            { id: "b", text: "Una fila de 4 cuadrados con 1 cuadrado arriba del segundo y 1 abajo del tercero.", isCorrect: true },
            { id: "c", text: "Un rectángulo de 3x2 cuadrados.", isCorrect: false },
            { id: "d", text: "Una figura en forma de 'L' de 5x2.", isCorrect: false }
        ],
        hint: "Imagina que doblas los cuadrados de papel. Necesitas que las caras opuestas no se superpongan.",
        explanation: "Un cubo tiene 6 caras. La forma más común de representarlo en 2D (red plana) es como una cruz, pero otra forma muy válida es la de 4 caras en línea (que formarán las paredes laterales) y una cara a cada lado de esta línea (que serán la base y la tapa). Si imaginas doblar esta figura, los 4 cuadrados de la línea principal se cierran formando un tubo cuadrado, y las dos tapas cierran los extremos perfectamente sin chocar entre sí.",
        level: 2
    }
];

// Exponer globalmente sin usar module.exports para el entorno nodeless (CDN)
window.EXCOBA_QUESTIONS = questionsData;
