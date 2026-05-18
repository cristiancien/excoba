const fs = require('fs');
const path = require('path');

// Read questions.js
const questionsPath = path.join(__dirname, '../data/questions.js');
let fileContent = fs.readFileSync(questionsPath, 'utf8');

// Strip off prefix window.EXCOBA_QUESTIONS = and trailing semi-colon if present
const prefix = 'window.EXCOBA_QUESTIONS =';
const startIndex = fileContent.indexOf(prefix);
if (startIndex === -1) {
  console.error("Could not find window.EXCOBA_QUESTIONS in questions.js");
  process.exit(1);
}

let jsonText = fileContent.substring(startIndex + prefix.length).trim();
if (jsonText.endsWith(';')) {
  jsonText = jsonText.substring(0, jsonText.length - 1);
}

// Safely parse
const questions = eval('(' + jsonText + ')');
console.log(`Parsed ${questions.length} questions successfully!`);

// Generate pocketbase migration content
const migrationContent = `migrate((db) => {
  const dao = new Dao(db);

  // 1. Create the questions collection
  const collection = new Collection({
    name: "questions",
    type: "base",
    schema: [
      { name: "originalId", type: "number", required: true },
      { name: "section", type: "text", required: true },
      { name: "topic", type: "text", required: true },
      { name: "question", type: "text", required: true },
      { name: "options", type: "json", required: true },
      { name: "hint", type: "text" },
      { name: "explanation", type: "text" },
      { name: "level", type: "number" }
    ],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null
  });
  dao.saveCollection(collection);

  // Fetch created collection to use for inserting records
  const qCollection = dao.findCollectionByNameOrId("questions");

  // 2. Insert all questions
  const questionsData = ${JSON.stringify(questions, null, 2)};

  for (const q of questionsData) {
    const record = new Record(qCollection);
    record.set("originalId", q.id);
    record.set("section", q.section);
    record.set("topic", q.topic);
    record.set("question", q.question);
    record.set("options", q.options);
    record.set("hint", q.hint);
    record.set("explanation", q.explanation);
    record.set("level", q.level);
    dao.saveRecord(record);
  }

  console.log("Successfully seeded " + questionsData.length + " questions into pocketbase database!");
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("questions");
  if (collection) {
    dao.deleteCollection(collection);
  }
});
`;

const destPath = path.join(__dirname, 'pb_migrations/1715970000_init_questions.js');
fs.writeFileSync(destPath, migrationContent, 'utf8');
console.log(`Successfully generated pocketbase migration file at ${destPath}`);
