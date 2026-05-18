migrate((db) => {
  const dao = new Dao(db);

  const collection = new Collection({
    name: "progress",
    type: "base",
    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "questionId",
        type: "number",
        required: true
      },
      {
        name: "isCorrect",
        type: "bool",
        required: true
      },
      {
        name: "selectedOptionId",
        type: "text",
        required: true
      },
      {
        name: "shuffledOptions",
        type: "json"
      },
      {
        name: "hintUsed",
        type: "bool",
        required: true
      },
      {
        name: "score",
        type: "number",
        required: true
      }
    ],
    listRule: "@request.auth.id = user.id",
    viewRule: "@request.auth.id = user.id",
    createRule: "@request.auth.id = user.id",
    updateRule: "@request.auth.id = user.id",
    deleteRule: "@request.auth.id = user.id"
  });

  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("progress");
  if (collection) {
    dao.deleteCollection(collection);
  }
});
