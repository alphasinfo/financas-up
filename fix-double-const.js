const fs = require('fs');

const files = [
  'src/app/dashboard/orcamentos/page.tsx',
  'src/app/dashboard/metas/page.tsx',
  'src/app/dashboard/financeiro/page.tsx',
  'src/app/dashboard/emprestimos/page.tsx',
  'src/app/dashboard/contas/page.tsx',
  'src/app/dashboard/cartoes/page.tsx',
];

let count = 0;

console.log('🔍 Corrigindo const duplicado...\n');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Remover const duplicado
  content = content.replace(/const\s+const\s+/g, 'const ');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${file}`);
    count++;
  }
});

console.log(`\n🎉 Total de arquivos corrigidos: ${count}`);
