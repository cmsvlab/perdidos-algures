// Perdidos Algures — build: perdidos-algures.html (fonte, JSX via Babel no
// browser) -> index.html (produção, já compilado, sem Babel no telemóvel).
//
// Uso:  node transpile.js
//
// - Compila cada bloco <script type="text/babel"> com @babel/standalone.
// - Preset por omissão: ['react']. Se o bloco tiver data-presets="a,b",
//   usa esses (ex: env,react para o bloco de arranque que corre em ES5).
// - Tudo o resto do HTML (imports CDN, <script> normais, markup) fica igual.
// - Sincroniza a versão da cache do sw.js com a PA_VERSION, para cada deploy
//   ser detetado pelo browser (auto-update).

const fs = require('fs');
const path = require('path');
const Babel = require(path.join(__dirname, 'node_modules', '@babel', 'standalone'));

const SRC = path.join(__dirname, 'perdidos-algures.html');
const OUT = path.join(__dirname, 'index.html');
const SW  = path.join(__dirname, 'sw.js');

let html = fs.readFileSync(SRC, 'utf8');

// Compila blocos <script type="text/babel" [data-presets="..."]>...</script>
const blockRe = /<script\s+type="text\/babel"([^>]*)>([\s\S]*?)<\/script>/g;
let count = 0, errors = 0;
html = html.replace(blockRe, (full, attrs, code) => {
  count++;
  const presetsMatch = /data-presets="([^"]*)"/.exec(attrs);
  const presets = presetsMatch ? presetsMatch[1].split(',').map(s => s.trim()) : ['react'];
  try {
    const out = Babel.transform(code, { presets, compact: false, retainLines: false }).code;
    return `<script>${out}</script>`;
  } catch (e) {
    errors++;
    console.error(`  ✗ Bloco ${count}: ${String(e.message).slice(0, 120)}`);
    return full; // deixa o bloco original para não partir o ficheiro
  }
});

if (errors > 0) {
  console.error(`\nBUILD FALHOU: ${errors} de ${count} blocos com erro. index.html NÃO foi escrito.`);
  process.exit(1);
}

fs.writeFileSync(OUT, html);
console.log(`index.html escrito — ${count} blocos compilados, 0 erros.`);

// Sincroniza a cache do sw.js com a versão da app.
const verM = html.match(/PA_VERSION\s*=\s*'([^']*)'/);
if (verM && fs.existsSync(SW)) {
  const ver = verM[1];
  let sw = fs.readFileSync(SW, 'utf8');
  const before = sw;
  sw = sw.replace(/const CACHE = 'perdidos-algures-[^']*'/, `const CACHE = 'perdidos-algures-${ver}'`);
  if (sw !== before) {
    fs.writeFileSync(SW, sw);
    console.log(`sw.js cache sincronizada: perdidos-algures-${ver}`);
  } else {
    console.log(`sw.js já estava em perdidos-algures-${ver} (ou padrão não encontrado).`);
  }
}
