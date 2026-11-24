const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');

function memoryStorage(seed = {}, limit = Infinity) {
  const data = new Map(Object.entries(seed).map(([k, v]) => [k, String(v)]));
  return {
    data,
    getItem: key => data.get(key) ?? null,
    setItem(key, value) {
      value = String(value);
      if (value.length > limit) throw new Error('QuotaExceededError');
      data.set(key, value);
    },
    removeItem: key => data.delete(key),
    clear: () => data.clear()
  };
}

function vueStub() {
  const watchers = [], unmounted = [], mounted = [];
  const read = source => Array.isArray(source) ? source.map(read) : typeof source === 'function' ? source() : source?.value;
  const api = {
    ref: value => ({ value }),
    computed: get => ({ get value() { return get(); } }),
    watch(source, callback, options = {}) {
      watchers.push(() => callback(read(source)));
      if (options.immediate) callback(read(source));
    },
    onUnmounted: fn => unmounted.push(fn),
    onMounted: fn => mounted.push(fn),
    defineAsyncComponent: loader => ({ loader })
  };
  return { api, flush: () => watchers.forEach(fn => fn()), unmount: () => unmounted.forEach(fn => fn()), mount: () => mounted.forEach(fn => fn()) };
}

function context(options = {}) {
  const vue = vueStub();
  const storage = options.storage || memoryStorage();
  const body = { classList: { add() {}, remove() {}, toggle() {} } };
  const ctx = { console, AbortController, setTimeout, clearTimeout, setInterval, clearInterval, Math, JSON,
    Vue: vue.api, localStorage: storage, innerWidth: 1200, document: { body, addEventListener() {}, removeEventListener() {} },
    ...options.globals };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  return { ctx, vue, storage,
    load(file) { vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file }); },
    component(file) {
      const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const script = text.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
      if (!script) throw new Error('Missing script in ' + file);
      return vm.runInContext('(function(){' + script.replace('export default', 'return') + '\n})()', ctx, { filename: file });
    }
  };
}
module.exports = { ROOT, memoryStorage, vueStub, context };
