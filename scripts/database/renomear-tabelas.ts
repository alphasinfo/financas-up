import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const renomeacoes = [
  { antigo: 'emprestimos', novo: 'Emprestimo' },
  { antigo: 'transacoes', novo: 'Transacao' },
  // Adicione outras tabelas conforme necessário
];

async function main() {
  for (const { antigo, novo } of renomeacoes) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \"${antigo}\" RENAME TO \"${novo}\";`);
    console.log(`✅ ${antigo} → ${novo}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
