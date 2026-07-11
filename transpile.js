// Perdidos Algures — build: perdidos-algures.html (fonte) -> index.html (produção).
//
//   node transpile.js
//
// O fonte corre JSX no browser via @babel/standalone (bom para desenvolver).
// A produção não deve fazer isso — é lento no telemóvel. Este script:
//   1. Compila cada bloco <script type="text/babel"> para React.createElement
//      (runtime CLÁSSICO — sem imports de jsx-runtime, que não correm em
//       <script> simples).
//   2. Reescreve o <head>: React de desenvolvimento -> produção minificada,
//      e remove o CDN do @babel/standalone (a produção já vem compilada).
//   3. Sincroniza a versão da cache do sw.js com a PA_VERSION.
//
// Tudo o resto do ficheiro fica igual.

const fs = require('fs');
const path = require('path');
// Requer @babel/standalone. Instala uma vez na pasta do projeto:  npm install @babel/standalone
let Babel;
try { Babel = require('@babel/standalone'); }
catch (e) {
  console.error('Falta @babel/standalone. Corre primeiro:  npm install @babel/standalone');
  process.exit(1);
}

const SRC = path.join(__dirname, 'perdidos-algures.html');
const OUT = path.join(__dirname, 'index.html');
const SW  = path.join(__dirname, 'sw.js');

let html = fs.readFileSync(SRC, 'utf8');

// ── 1. Compilar blocos <script type="text/babel"> (runtime clássico) ──────────
function presetSpec(name) {
  // Forçamos runtime clássico no preset-react para emitir React.createElement,
  // em vez do runtime automático (que usa import de "react/jsx-runtime").
  return name === 'react' ? ['react', { runtime: 'classic' }] : name;
}

const blockRe = /<script\s+type="text\/babel"([^>]*)>([\s\S]*?)<\/script>/g;
let count = 0, errors = 0;
html = html.replace(blockRe, (full, attrs, code) => {
  count++;
  const pm = /data-presets="([^"]*)"/.exec(attrs);
  const presets = pm
    ? pm[1].split(',').map(s => presetSpec(s.trim()))
    : [presetSpec('react')];
  try {
    const out = Babel.transform(code, { presets, compact: false, retainLines: false }).code;
    return `<script>${out}</script>`;
  } catch (e) {
    errors++;
    console.error(`  ✗ Bloco ${count}: ${String(e.message).slice(0, 140)}`);
    return full;
  }
});

if (errors > 0) {
  console.error(`\nBUILD FALHOU: ${errors}/${count} blocos com erro. index.html NÃO foi escrito.`);
  process.exit(1);
}

// ── 2. Reescrever o <head> para produção ──────────────────────────────────────
const beforeHead = html;

// React dev -> produção minificada (sem integrity: o hash é diferente do de dev).
html = html.replace(
  /<script\s+src="https:\/\/unpkg\.com\/react@([\d.]+)\/umd\/react\.development\.js"[^>]*><\/script>/,
  '<script src="https://unpkg.com/react@$1/umd/react.production.min.js" crossorigin="anonymous"></script>'
);
html = html.replace(
  /<script\s+src="https:\/\/unpkg\.com\/react-dom@([\d.]+)\/umd\/react-dom\.development\.js"[^>]*><\/script>/,
  '<script src="https://unpkg.com/react-dom@$1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>'
);
// Remover o @babel/standalone (a produção já vem compilada; a linha inteira sai).
html = html.replace(
  /\n?[ \t]*<script\s+src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"[^>]*><\/script>/,
  ''
);

if (html === beforeHead) {
  console.warn('  ⚠ Aviso: o <head> não foi alterado (padrões de React/Babel não encontrados). Verifica os CDNs no fonte.');
}

fs.writeFileSync(OUT, html);
console.log(`index.html escrito — ${count} blocos compilados (runtime clássico), head de produção, 0 erros.`);

// ── 3. Sincronizar cache do sw.js com a versão ────────────────────────────────
const verM = html.match(/PA_VERSION\s*=\s*'([^']*)'/);
if (verM && fs.existsSync(SW)) {
  const ver = verM[1];
  let sw = fs.readFileSync(SW, 'utf8');
  const before = sw;
  sw = sw.replace(/const CACHE = 'perdidos-algures-[^']*'/, `const CACHE = 'perdidos-algures-${ver}'`);
  if (sw !== before) { fs.writeFileSync(SW, sw); console.log(`sw.js cache sincronizada: perdidos-algures-${ver}`); }
  else { console.log(`sw.js já estava em perdidos-algures-${ver}.`); }
}
