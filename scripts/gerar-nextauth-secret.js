const crypto = require('crypto');

console.log('\n🔐 GERANDO NEXTAUTH_SECRET\n');
console.log('═'.repeat(60));

// Gerar secret
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ Secret gerado com sucesso!\n');
console.log('Copie o valor abaixo:\n');
console.log('─'.repeat(60));
console.log(secret);
console.log('─'.repeat(60));

console.log('\n📋 COMO USAR:\n');
console.log('1. Copie o valor acima');
console.log('2. Cole no arquivo .env:');
console.log('   NEXTAUTH_SECRET="' + secret + '"');
console.log('\n3. Cole no Vercel (Environment Variables):');
console.log('   Name: NEXTAUTH_SECRET');
console.log('   Value: ' + secret);
console.log('   Environment: Production');
console.log('\n4. Faça Redeploy no Vercel');
console.log('\n═'.repeat(60));
console.log('\n');
