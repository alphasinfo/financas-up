const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./src');
let count = 0;
const errors = [];

console.log('🔍 Verificando todos os arquivos TypeScript...\n');

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    let modified = false;

    // 1. Corrigir imports do next-auth
    if (content.includes('from "next-auth"') && !content.includes('from "next-auth/next"') && !content.includes('from "next-auth/providers')) {
      content = content.replace(/from "next-auth";/g, 'from "next-auth/next";');
      modified = true;
    }

    // 2. Adicionar import do tipo Session se usar getServerSession
    if (content.includes('getServerSession') && !content.includes('import type { Session }')) {
      if (content.includes('from "next-auth/next"')) {
        content = content.replace(
          /import { getServerSession } from "next-auth\/next";/g,
          'import { getServerSession } from "next-auth/next";\nimport type { Session } from "next-auth";'
        );
        modified = true;
      } else if (content.includes('from "next-auth"')) {
        content = content.replace(
          /import { getServerSession } from "next-auth";/g,
          'import { getServerSession } from "next-auth";\nimport type { Session } from "next-auth";'
        );
        modified = true;
      }
    }

    // 3. Adicionar type assertion em getServerSession
    if (content.includes('const session = await getServerSession(authOptions);') && 
        !content.includes('as Session | null')) {
      content = content.replace(
        /const session = await getServerSession\(authOptions\);/g,
        'const session = await getServerSession(authOptions) as Session | null;'
      );
      modified = true;
    }

    // 4. Corrigir verificações de sessão
    if (content.includes('if (!session)') && content.includes('session.user')) {
      content = content.replace(
        /if \(!session\) \{/g,
        'if (!session || !session.user) {'
      );
      modified = true;
    }

    // 5. Substituir session!.user por session?.user
    if (content.includes('session!.user')) {
      content = content.replace(/session!\.user/g, 'session?.user');
      modified = true;
    }

    // 6. Corrigir taxaJuros para taxaJurosMensal/taxaJurosAnual
    if (content.includes('taxaJuros:') && !content.includes('taxaJurosMensal')) {
      content = content.replace(/taxaJuros:/g, 'taxaJurosMensal:');
      modified = true;
    }

    if (modified && content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ ${file}`);
      count++;
    }
  } catch (error) {
    errors.push({ file, error: error.message });
    console.log(`❌ Erro em ${file}: ${error.message}`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`🎉 Total de arquivos corrigidos: ${count}`);
if (errors.length > 0) {
  console.log(`⚠️  Arquivos com erro: ${errors.length}`);
  errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
}
console.log('='.repeat(60));
