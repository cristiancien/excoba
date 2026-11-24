# Problemario y práctica EXCOBA

Aplicación estática de práctica con un banco de **11 300 ejercicios originales, distribuidos en 113 temas**. Cada tema contiene **100 ejercicios: 25 fáciles, 25 medios, 25 semidifíciles y 25 difíciles**, clasificados además por subtema y habilidad. Incluye bases aritméticas, álgebra, matemáticas avanzadas, ciencias, lenguaje, ciencias sociales, humanidades y contenidos económico administrativos.

El banco adapta la cobertura de los materiales de estudio proporcionados: problemario de álgebra, temario EXCOBA, guía escaneada y demostrador contestado. Los ejercicios, las respuestas y sus explicaciones fueron elaborados o reconstruidos para este proyecto. **No es un banco oficial ni reproduce la distribución, dificultad o puntuación del examen real.** Los cuatro niveles expresan una clasificación editorial; no cuentan con calibración psicométrica. Las referencias curriculares permiten comprobar la cobertura de los 126 apartados terminales del temario base, complementados con temas del demostrador.

## Ejecutar localmente

No se requiere una etapa de empaquetado ni instalar paquetes para servir los archivos estáticos. Desde la carpeta del repositorio:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000` en el navegador. Las bibliotecas externas que carga la página requieren conexión. El progreso y la configuración se guardan en ese navegador; no se sincronizan con una cuenta ni con otros dispositivos.

## Fuente y generación reproducible

La fuente editable es [`data/source-bank.json`](data/source-bank.json). Contiene enunciado, respuesta modelo, explicación o criterio, dificultad, habilidad, subtema, referencias curriculares y metadatos de las figuras. Los gráficos están en `assets/questions/`. Los identificadores como `M01.001` enlazan un ejercicio con su solución.

[`data/generate_questions.js`](data/generate_questions.js) transforma esa fuente en:

- `data/questions.js`: banco consumido por el navegador, más sus metadatos.
- `data/bank-manifest.json`: catálogo, recuentos, habilidades y cobertura curricular.

```bash
node data/generate_questions.js
node data/generate_questions.js --check
```

La segunda orden comprueba que los archivos generados coincidan exactamente con la fuente. Para revisar una compilación sin sustituir los archivos publicados:

```bash
node data/generate_questions.js --out-dir /tmp/excoba-build
```

El generador lee JSON, no ejecuta código del contenido ni usa evaluación dinámica. La versión del banco deriva de SHA-256 sobre los bytes de la fuente: cualquier edición invalida la versión anterior. La generación es determinista, sin mezcla aleatoria ni fechas añadidas. Conserva los enunciados, las respuestas y sus códigos; valida 100 preguntas por tema, 25 por nivel y cobertura de las referencias.

Los documentos Word del problemario y del solucionario se producen por separado a partir del mismo banco editorial. Editar un Word no modifica la aplicación. Para mantener ambos formatos coherentes, los cambios deben incorporarse primero al banco editorial y después regenerarse en cada formato. El problemario contiene ejercicios; el documento de soluciones contiene respuestas y explicaciones o criterios.

## Práctica y evaluación

La práctica permite seleccionar tema, nivel y habilidad. El simulacro de 180 preguntas es una modalidad de entrenamiento con selección por asignaturas; no una réplica certificada del EXCOBA. Cada sesión conserva identificadores y resultados, sin copiar todo el banco al almacenamiento local.

Las respuestas numéricas simples se comparan mediante un analizador de fracciones, decimales y unidades compatibles. El generador utiliza el mismo `parseScalar` que la aplicación. Los ejercicios que requieren justificar, demostrar, corregir un procedimiento, producir un texto o interpretar una respuesta abierta requieren revisión; una respuesta modelo no se califica por coincidencia literal. La revisión manual muestra solución y explicación para que la persona registre el resultado.

### Gemini opcional

La aplicación funciona sin Gemini. Si se activa en Configuración, la clave y el modelo seleccionado se guardan en `localStorage` del navegador. Las solicitudes salen **directamente del navegador a la API de Google**; no pasan por un servidor de este proyecto. Se envían el enunciado, contexto, descripción textual de la figura cuando existe, respuesta de referencia, criterio y respuesta escrita por la persona. La clave se transmite a Google mediante la cabecera de autenticación.

Las credenciales guardadas en el navegador son accesibles desde ese perfil y por scripts del mismo origen; conviene usar un perfil propio y borrar la configuración cuando corresponda. La disponibilidad de modelos y las cuotas dependen de la cuenta de Google. La lista de modelos se consulta con la clave configurada, sin fijar una lista supuestamente permanente.

Un error de red, credenciales, cuota, formato de respuesta o un resultado que necesita revisión **no penaliza ni registra automáticamente un fallo**. Se puede reintentar o continuar con la solución y la revisión manual. La evaluación generativa puede equivocarse: el criterio y la respuesta de referencia permanecen disponibles para revisar el resultado.

## Pruebas

La suite de comportamiento y la comprobación del banco requieren **Node.js 18 o posterior, sin instalar dependencias adicionales**:

```bash
node --test tests/*.test.cjs
node data/generate_questions.js --check
```

Las pruebas comprueban el banco, filtros, sesiones, persistencia, validación numérica, revisión manual, contratos y errores de Gemini, y generación reproducible. Los servicios externos se simulan: **no se realizan pruebas con claves reales ni llamadas de pago a la API de Google**. Las pruebas automáticas verifican estructura y comportamiento; la dificultad y la calidad de los ejercicios también requieren revisión editorial.

La comprobación adicional de las plantillas Vue usa el compilador real de Vue 3. El script `tests/compile-templates.cjs` necesita que el paquete `vue` esté instalado y sea accesible desde el repositorio:

```bash
node tests/compile-templates.cjs
```

También se puede indicar un archivo existente de la distribución global de Vue 3 mediante `VUE_COMPILER_PATH`, sin instalar el paquete en este repositorio:

```bash
VUE_COMPILER_PATH=/ruta/a/vue.global.js node tests/compile-templates.cjs
```

Usa `vue.global.js`, que incluye el compilador; la distribución `vue.runtime.global.js` no lo incluye. Esta comprobación compila las plantillas de `App.vue`, `QuizView.vue`, `SettingsPanel.vue` y `FeedbackOverlay.vue`; la inspección visual en un navegador se realiza por separado.
