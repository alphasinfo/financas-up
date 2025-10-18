const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/from "next-auth";/g, 'from "next-auth/next";');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Corrigido: ${file}`);
    count++;
  }
});

console.log(`\nTotal de arquivos corrigidos: ${count}`);
