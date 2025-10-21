import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import fs from 'fs';

const prisma = new PrismaClient();
const dbFile = 'dev.db';

async function main() {
  // Remover banco existente
  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log('🗑️ Banco antigo removido');
  }

  // Forçar criação do banco e tabelas
  await prisma.$connect();
  await prisma.$disconnect();

  // Popular dados iniciais
  const usuario = await prisma.usuario.create({
    data: {
      email: 'teste@financasup.com',
      senha: await hash('123456', 12),
      nome: 'Usuário Teste'
    }
  });

  console.log('✅ Banco inicializado com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
