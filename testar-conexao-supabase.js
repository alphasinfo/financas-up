const { PrismaClient } = require('@prisma/client');

console.log('\n🔌 TESTANDO CONEXÃO COM SUPABASE\n');
console.log('='.repeat(70));

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testarConexao() {
  try {
    console.log('\n📡 Tentando conectar ao Supabase...\n');
    
    // Timeout de 10 segundos
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Conexão demorou mais de 10 segundos')), 10000)
    );
    
    const conexao = prisma.$connect();
    
    await Promise.race([conexao, timeout]);
    
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // Testar query simples
    console.log('📊 Testando query...');
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log('✅ Query executada com sucesso!\n');
    console.log('Resultado:', result);
    
    await prisma.$disconnect();
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ CONEXÃO OK! Supabase está acessível.\n');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.log('\n❌ ERRO DE CONEXÃO!\n');
    console.log('Mensagem:', error.message);
    console.log('\n💡 Possíveis causas:\n');
    console.log('1. URL do Supabase incorreta no .env');
    console.log('2. Senha incorreta');
    console.log('3. Supabase está pausado ou indisponível');
    console.log('4. Firewall bloqueando a conexão');
    console.log('5. Porta incorreta (deve ser 6543 com pgbouncer)\n');
    
    console.log('🔍 Verifique:\n');
    console.log('1. Acesse: https://supabase.com/dashboard/project/lfzqihajyvmdwrjtefco');
    console.log('2. Vá em Settings → Database');
    console.log('3. Copie a Connection String (URI)');
    console.log('4. Verifique se o projeto está ativo (não pausado)\n');
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testarConexao();
