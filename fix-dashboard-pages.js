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

const files = getAllFiles('./src/app/dashboard');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // 1. Adicionar import do tipo Session se usar getServerSession
  if (content.includes('getServerSession') && !content.includes('import type { Session }')) {
    // Verificar se já tem import de next-auth
    if (content.includes('from "next-auth"')) {
      content = content.replace(
        /import { getServerSession } from "next-auth";/g,
        'import { getServerSession } from "next-auth";\nimport type { Session } from "next-auth";'
      );
      modified = true;
    } else if (content.includes('from "next-auth/next"')) {
      content = content.replace(
        /import { getServerSession } from "next-auth\/next";/g,
        'import { getServerSession } from "next-auth/next";\nimport type { Session } from "next-auth";'
      );
      modified = true;
    }
  }

  // 2. Adicionar type assertion em getServerSession
  content = content.replace(
    /const session = await getServerSession\(authOptions\);/g,
    'const session = await getServerSession(authOptions) as Session | null;'
  );

  // 3. Adicionar verificação de session.user onde usa session!.user
  content = content.replace(
    /session!\.user/g,
    'session?.user'
  );

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Corrigido: ${file}`);
    count++;
  }
});

console.log(`\n🎉 Total de arquivos corrigidos: ${count}`);
