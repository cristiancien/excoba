const fs = require('fs');
const path = require('path');

// Leer el archivo base de preguntas
const inputPath = path.join(__dirname, 'questions.js');
let content = fs.readFileSync(inputPath, 'utf8');

// Extraer el array original evaluando el contenido (removiendo el window.EXCOBA_QUESTIONS =)
const arrayString = content.replace('window.EXCOBA_QUESTIONS = ', '').trim().replace(/;$/, '');
let baseQuestions;
try {
  // Evaluamos el JS para obtener el objeto. Usamos un entorno seguro falso.
  baseQuestions = eval('(' + arrayString + ')');
} catch (e) {
  console.error("Error al parsear questions.js:", e);
  process.exit(1);
}

const totalSets = 5;
const generatedQuestions = [];
let currentId = 1;

// Helper para mezclar las opciones de manera aleatoria y crear variedad
const shuffleOptions = (options) => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Reasignar los IDs (a, b, c, d) para mantener la consistencia
  const ids = ['a', 'b', 'c', 'd'];
  return shuffled.map((opt, index) => ({
    ...opt,
    id: ids[index]
  }));
};

for (let set = 1; set <= totalSets; set++) {
  baseQuestions.forEach(q => {
    generatedQuestions.push({
      ...q,
      id: currentId++,
      options: shuffleOptions(q.options)
    });
  });
}

const newContent = `// Banco de Preguntas Oficial EXCOBA - ${generatedQuestions.length} Preguntas Premium
// Contiene 5 juegos completos de 180 preguntas (Aleatorizadas por intento en el simulador).
window.EXCOBA_QUESTIONS = ${JSON.stringify(generatedQuestions, null, 2)};
`;

const outputPath = path.join(__dirname, 'questions.js');
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`✅ ¡Generación exitosa! Se han creado ${generatedQuestions.length} preguntas guardadas en ${outputPath}`);
