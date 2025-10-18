const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO COMPLETA DO PROJETO\n');
console.log('='.repeat(60));

let errors = [];
let warnings = [];

// 1. Verificar imports do next-auth
console.log('\n📦 Verificando imports do NextAuth...');
function checkNextAuthImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      checkNextAuthImports(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verificar import incorreto
      if (content.includes('from "next-auth";') && 
          !content.includes('from "next-auth/providers') &&
          !content.includes('import type')) {
        errors.push(`❌ Import incorreto em: ${filePath}`);
      }
      
      // Verificar se usa getServerSession sem type assertion
      if (content.includes('getServerSession(authOptions);') && 
          !content.includes('as Session | null')) {
        errors.push(`❌ Falta type assertion em: ${filePath}`);
      }
      
      // Verificar session?.user.id sem verificação
      if (content.includes('session?.user.id') || content.includes('session?.user')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('session?.user') && !lines[i].includes('if (')) {
            // Verificar se tem verificação nas linhas anteriores
            let hasCheck = false;
            for (let j = Math.max(0, i - 10); j < i; j++) {
              if (lines[j].includes('if (!session') || lines[j].includes('if (!session?.user')) {
                hasCheck = true;
                break;
              }
            }
            if (!hasCheck) {
              warnings.push(`⚠️  session?.user sem verificação em: ${filePath}:${i + 1}`);
            }
          }
        }
      }
      
      // Verificar const duplicado
      if (content.includes('const   const') || content.includes('const  const')) {
        errors.push(`❌ const duplicado em: ${filePath}`);
      }
      
      // Verificar Map.entries() sem downlevelIteration
      if (content.includes('.entries()') && content.includes('for (const')) {
        warnings.push(`⚠️  Uso de Map.entries() em: ${filePath} (requer downlevelIteration)`);
      }
    }
  });
}

checkNextAuthImports('./src');

// 2. Verificar tsconfig.json
console.log('\n⚙️  Verificando tsconfig.json...');
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
if (!tsconfig.compilerOptions.downlevelIteration) {
  warnings.push('⚠️  downlevelIteration não está habilitado no tsconfig.json');
}
if (!tsconfig.compilerOptions.target || tsconfig.compilerOptions.target === 'es5') {
  warnings.push('⚠️  target deveria ser es2015 ou superior');
}

// 3. Verificar schema do Prisma
console.log('\n🗄️  Verificando schema do Prisma...');
const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
if (!schema.includes('provider = "postgresql"')) {
  warnings.push('⚠️  Schema não está configurado para PostgreSQL');
}

// 4. Verificar package.json
console.log('\n📋 Verificando package.json...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
if (!packageJson.scripts.build.includes('prisma generate')) {
  warnings.push('⚠️  Script de build não inclui prisma generate');
}

// 5. Verificar .env.example
console.log('\n🔐 Verificando variáveis de ambiente...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  requiredVars.forEach(varName => {
    if (!envExample.includes(varName)) {
      warnings.push(`⚠️  Variável ${varName} não está no .env.example`);
    }
  });
}

// Relatório Final
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO FINAL\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ NENHUM PROBLEMA ENCONTRADO!');
  console.log('   O projeto está pronto para deploy.');
} else {
  if (errors.length > 0) {
    console.log(`❌ ERROS CRÍTICOS: ${errors.length}`);
    errors.forEach(err => console.log(`   ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  AVISOS: ${warnings.length}`);
    warnings.forEach(warn => console.log(`   ${warn}`));
  }
}

console.log('\n' + '='.repeat(60));

// Exit code
process.exit(errors.length > 0 ? 1 : 0);
