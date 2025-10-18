const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/dashboard/orcamentos/page.tsx',
  'src/app/dashboard/metas/page.tsx',
  'src/app/dashboard/investimentos/page.tsx',
  'src/app/dashboard/financeiro/page.tsx',
  'src/app/dashboard/emprestimos/page.tsx',
  'src/app/dashboard/contas/page.tsx',
  'src/app/dashboard/cartoes/page.tsx',
];

let count = 0;

console.log('🔍 Corrigindo arquivos restantes...\n');

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // 1. Adicionar import do notFound se não existir
  if (!content.includes('import { notFound }') && !content.includes('from "next/navigation"')) {
    content = content.replace(
      /(import.*from "next\/link";)/,
      '$1\nimport { notFound } from "next/navigation";'
    );
  }

  // 2. Adicionar verificação antes de usar session?.user.id
  const patterns = [
    // Padrão: const dados = await getFunc(session?.user.id);
    {
      regex: /(const session = await getServerSession\(authOptions\) as Session \| null;\n)(  const \w+ = await \w+\(session\?\.user\.id\);)/g,
      replacement: '$1  if (!session || !session.user) {\n    notFound();\n  }\n\n  const $2'
    },
    // Padrão: const dados = await getFunc(param, session?.user.id);
    {
      regex: /(const session = await getServerSession\(authOptions\) as Session \| null;\n)(  const \w+ = await \w+\([^,]+, session\?\.user\.id\);)/g,
      replacement: '$1  if (!session || !session.user) {\n    notFound();\n  }\n\n$2'
    }
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replacement);
  });

  // 3. Substituir session?.user por session.user após verificação
  if (content.includes('if (!session || !session.user)')) {
    content = content.replace(/session\?\.user/g, 'session.user');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${file}`);
    count++;
  }
});

console.log(`\n🎉 Total de arquivos corrigidos: ${count}`);
