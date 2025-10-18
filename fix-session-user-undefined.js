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

console.log('🔍 Procurando por session?.user.id sem verificação...\n');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let modified = false;

  // Padrão 1: session?.user.id usado diretamente em chamada de função
  // Procurar por linhas que usam session?.user.id como argumento
  const lines = content.split('\n');
  let newLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Se encontrar session?.user.id usado como argumento
    if (line.includes('session?.user.id') && 
        !line.includes('if (') && 
        !line.includes('const ') &&
        line.includes('await ')) {
      
      // Verificar se já tem verificação antes
      let hasCheck = false;
      for (let j = Math.max(0, i - 5); j < i; j++) {
        if (lines[j].includes('if (!session') || lines[j].includes('if (!session?.user')) {
          hasCheck = true;
          break;
        }
      }

      if (!hasCheck) {
        // Adicionar verificação antes
        const indent = line.match(/^\s*/)[0];
        newLines.push(`${indent}if (!session || !session.user) {`);
        newLines.push(`${indent}  notFound();`);
        newLines.push(`${indent}}`);
        newLines.push('');
        
        // Substituir session?.user.id por session.user.id
        newLines.push(line.replace(/session\?\.user/g, 'session.user'));
        modified = true;
        i++;
        continue;
      }
    }

    // Substituir session?.user por session.user se já houver verificação
    if (line.includes('session?.user') && !line.includes('if (')) {
      // Verificar se tem verificação nas linhas anteriores
      let hasCheck = false;
      for (let j = Math.max(0, i - 10); j < i; j++) {
        if (lines[j].includes('if (!session || !session.user)') || 
            lines[j].includes('if (!session?.user)')) {
          hasCheck = true;
          break;
        }
      }

      if (hasCheck) {
        newLines.push(line.replace(/session\?\.user/g, 'session.user'));
        modified = true;
        i++;
        continue;
      }
    }

    newLines.push(line);
    i++;
  }

  if (modified) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`✅ Corrigido: ${file}`);
    count++;
  }
});

console.log(`\n🎉 Total de arquivos corrigidos: ${count}`);
