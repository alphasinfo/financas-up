const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./src/app/dashboard');
let count = 0;

console.log('🔍 Corrigindo session?.user.id em páginas...\n');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Padrão: const session = ... seguido de uso de session?.user.id
  // Adicionar verificação antes do uso

  const regex = /(const session = await getServerSession\(authOptions\) as Session \| null;\n)(  const \w+ = await \w+\([^,]+, session\?\.user\.id\);)/g;
  
  content = content.replace(regex, (match, p1, p2) => {
    const indent = p2.match(/^(\s*)/)[1];
    return `${p1}${indent}if (!session || !session.user) {\n${indent}  notFound();\n${indent}}\n\n${p2.replace('session?.user', 'session.user')}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${file}`);
    count++;
  }
});

console.log(`\n🎉 Total de arquivos corrigidos: ${count}`);
