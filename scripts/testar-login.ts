import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testarLogin() {
  try {
    console.log('🔍 Testando sistema de login...\n');

    // Pedir email
    const email = process.argv[2];
    const senha = process.argv[3];

    if (!email || !senha) {
      console.log('❌ Uso: npm run testar-login <email> <senha>');
      console.log('Exemplo: npm run testar-login usuario@exemplo.com senha123\n');
      process.exit(1);
    }

    console.log('📧 Email:', email);
    console.log('🔐 Senha:', '***'.repeat(senha.length));
    console.log('');

    // Buscar usuário
    console.log('1️⃣ Buscando usuário no banco...');
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        criadoEm: true,
        atualizadoEm: true,
      }
    });

    if (!usuario) {
      console.log('❌ ERRO: Usuário não encontrado!');
      console.log('\n📋 Usuários cadastrados:');
      const usuarios = await prisma.usuario.findMany({
        select: { email: true, nome: true }
      });
      usuarios.forEach(u => console.log(`  - ${u.email} (${u.nome})`));
      process.exit(1);
    }

    console.log('✅ Usuário encontrado!');
    console.log('   ID:', usuario.id);
    console.log('   Nome:', usuario.nome);
    console.log('   Email:', usuario.email);
    console.log('   Criado em:', usuario.criadoEm);
    console.log('');

    // Verificar se tem senha
    console.log('2️⃣ Verificando senha cadastrada...');
    if (!usuario.senha) {
      console.log('❌ ERRO: Usuário não tem senha cadastrada!');
      console.log('   Isso pode acontecer se o usuário foi criado sem senha.');
      process.exit(1);
    }

    console.log('✅ Senha cadastrada encontrada');
    console.log('   Hash:', usuario.senha.substring(0, 20) + '...');
    console.log('');

    // Verificar senha
    console.log('3️⃣ Comparando senha fornecida com hash...');
    const senhaValida = await compare(senha, usuario.senha);

    if (!senhaValida) {
      console.log('❌ ERRO: Senha incorreta!');
      console.log('   A senha fornecida não corresponde ao hash armazenado.');
      console.log('');
      console.log('💡 Dicas:');
      console.log('   - Verifique se está usando a senha correta');
      console.log('   - Senhas são case-sensitive (maiúsculas/minúsculas importam)');
      console.log('   - Se esqueceu a senha, você pode resetá-la');
      process.exit(1);
    }

    console.log('✅ Senha correta!');
    console.log('');

    console.log('🎉 SUCESSO! Login funcionaria com essas credenciais.');
    console.log('');
    console.log('📊 Resumo:');
    console.log('   ✅ Usuário existe');
    console.log('   ✅ Senha cadastrada');
    console.log('   ✅ Senha válida');
    console.log('');
    console.log('Se o login ainda não funciona no navegador, verifique:');
    console.log('   1. Se o DATABASE_URL está correto no .env');
    console.log('   2. Se o servidor Next.js está rodando');
    console.log('   3. Os logs do console no navegador (F12)');
    console.log('   4. Os logs do servidor Next.js');

  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarLogin();
