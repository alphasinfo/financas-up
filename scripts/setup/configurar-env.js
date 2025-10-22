const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');

console.log('\n🔧 CONFIGURANDO .ENV AUTOMATICAMENTE\n');
console.log('═'.repeat(60));

// Gerar novo secret
const newSecret = crypto.randomBytes(32).toString('base64');

console.log('\n1️⃣ Gerando novo NEXTAUTH_SECRET...');
console.log('   ✅ Secret gerado: ' + newSecret.substring(0, 20) + '...');

// Ler .env atual
let envContent = '';
try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n2️⃣ Lendo .env existente...');
    console.log('   ✅ Arquivo encontrado');
  } else {
    console.log('\n2️⃣ Arquivo .env não existe, criando novo...');
  }
} catch (error) {
  console.log('\n2️⃣ Criando novo arquivo .env...');
}

// Atualizar ou adicionar NEXTAUTH_SECRET
console.log('\n3️⃣ Atualizando NEXTAUTH_SECRET...');

if (envContent.includes('NEXTAUTH_SECRET=')) {
  // Substituir existente
  envContent = envContent.replace(
    /NEXTAUTH_SECRET=.*/,
    `NEXTAUTH_SECRET="${newSecret}"`
  );
  console.log('   ✅ NEXTAUTH_SECRET atualizado');
} else {
  // Adicionar novo
  if (!envContent.endsWith('\n') && envContent.length > 0) {
    envContent += '\n';
  }
  envContent += `\n# NextAuth Secret\nNEXTAUTH_SECRET="${newSecret}"\n`;
  console.log('   ✅ NEXTAUTH_SECRET adicionado');
}

// Atualizar ou adicionar NEXTAUTH_URL
console.log('\n4️⃣ Verificando NEXTAUTH_URL...');

if (!envContent.includes('NEXTAUTH_URL=')) {
  envContent += `NEXTAUTH_URL="http://localhost:3000"\n`;
  console.log('   ✅ NEXTAUTH_URL adicionado (localhost)');
} else {
  console.log('   ✅ NEXTAUTH_URL já existe');
}

// Salvar .env
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n5️⃣ Salvando arquivo .env...');
  console.log('   ✅ Arquivo salvo com sucesso!');
} catch (error) {
  console.error('\n❌ Erro ao salvar .env:', error.message);
  process.exit(1);
}

console.log('\n═'.repeat(60));
console.log('\n✅ CONFIGURAÇÃO LOCAL COMPLETA!\n');
console.log('📋 PRÓXIMOS PASSOS:\n');
console.log('1. ✅ .env configurado localmente');
console.log('\n2. ⚠️  CONFIGURAR NO VERCEL:');
console.log('   a) Acesse: https://vercel.com/seu-projeto/settings/environment-variables');
console.log('   b) Adicione ou atualize:');
console.log('      Name: NEXTAUTH_SECRET');
console.log('      Value: ' + newSecret);
console.log('      Environment: Production');
console.log('\n   c) Adicione também:');
console.log('      Name: NEXTAUTH_URL');
console.log('      Value: https://financas-up.vercel.app');
console.log('      Environment: Production');
console.log('\n3. 🔄 Fazer REDEPLOY no Vercel');
console.log('\n4. 🧪 Testar login em: https://financas-up.vercel.app/login');
console.log('\n═'.repeat(60));
console.log('\n');
