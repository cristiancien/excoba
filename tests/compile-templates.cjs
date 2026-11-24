// Run with VUE_COMPILER_PATH=/path/to/vue.global.js node tests/compile-templates.cjs.
// If Vue is installed locally, its global build is used automatically.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const vuePath = process.env.VUE_COMPILER_PATH || require.resolve('vue/dist/vue.global.js');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(vuePath, 'utf8'), ctx, { filename: vuePath });
let failed = false;
const reports = [];
for (const file of ['App.vue', 'components/QuizView.vue', 'components/SettingsPanel.vue', 'components/FeedbackOverlay.vue']) {
  const text = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
  const template = text.slice(text.indexOf('<template>') + 10, text.lastIndexOf('</template>'));
  const errors = [], warnings = [];
  const render = ctx.Vue.compile(template, {
    onError: error => errors.push({ code: error.code, message: error.message, loc: error.loc }),
    onWarn: warning => warnings.push({ code: warning.code, message: warning.message }),
    decodeEntities: value => value
  });
  if (errors.length || warnings.length || typeof render !== 'function') failed = true;
  reports.push({ file, renderFunction: typeof render, errors, warnings });
}
console.log(JSON.stringify({ vue: ctx.Vue.version, reports }, null, 2));
if (failed) process.exitCode = 1;
