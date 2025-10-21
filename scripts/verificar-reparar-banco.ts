import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const logFile = 'logs/banco-reparo.log';

async function repararTabelasFaltantes(tabelas: string[]) {
  console.log(`🛠️ Criando ${tabelas.length} tabelas faltantes...`);
  // Implementar lógica de criação de tabelas usando Prisma migrate
  // Nota: Em produção, isso deve ser feito via migrações
  for (const tabela of tabelas) {
    console.log(`   → Criando ${tabela}`);
    // Exemplo simplificado - na prática use DDL específica
    await prisma.$executeRawUnsafe(`CREATE TABLE \"${tabela}\" (id SERIAL PRIMARY KEY)`);
  }
}

async function criarUsuarioTeste() {
  await prisma.usuario.create({
    data: {
      email: 'teste@financasup.com',
      senha: '$2a$12$82TxeO96FS5u7...', // Hash para "123456"
      nome: 'Usuário Teste'
    }
  });
}

async function main() {
  console.log('🔍 Iniciando verificação do banco de dados...');
  
  // Detectar tipo de banco
  const dbTypeResult = await prisma.$queryRaw`SELECT 'postgresql' as db_type`
    .catch(() => [{ db_type: 'sqlite' }]);

  const dbType = Array.isArray(dbTypeResult) ? dbTypeResult[0].db_type : 'sqlite';
  console.log(`🔍 Detectado banco: ${dbType}`);

  // 1. Testar conexão
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com o banco estabelecida');
  } catch (error) {
    console.error('❌ Falha na conexão com o banco:', error);
    process.exit(1);
  }

  // 2. Listar tabelas essenciais
  const tabelasEssenciais = [
    'Usuario', 'ContaBancaria', 'CartaoCredito', 
    'Transacao', 'Fatura', 'Emprestimo'
  ];

  const tabelasFaltantes: string[] = [];
  for (const tabela of tabelasEssenciais) {
    let result;
    if (dbType === 'postgresql') {
      result = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${tabela.toLowerCase()}'
        )`
      );
    } else {
      result = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (
          SELECT 1 FROM sqlite_schema 
          WHERE type='table' AND name='${tabela.toLowerCase()}'
        )`
      );
    }
    if (!result[0].exists) {
      tabelasFaltantes.push(tabela);
    }
  }

  if (tabelasFaltantes.length > 0) {
    console.warn(`⚠️ Tabelas faltantes: ${tabelasFaltantes.join(', ')}`);
    await repararTabelasFaltantes(tabelasFaltantes);
  } else {
    console.log('✅ Todas tabelas essenciais presentes');
  }

  // 3. Verificar usuário de teste
  const usuarioTeste = await prisma.usuario.findUnique({
    where: { email: 'teste@financasup.com' }
  });

  if (!usuarioTeste) {
    console.warn('⚠️ Usuário de teste não encontrado. Recriando...');
    await criarUsuarioTeste();
  }

  console.log('🎉 Verificação concluída!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Erro durante o processo:', e);
  process.exit(1);
});
