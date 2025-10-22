#!/usr/bin/env node
process.env.DATABASE_URL = 'file:./dev.db';
require('dotenv').config();

console.log('🚀 Configurando banco SQLite...');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

const { execSync } = require('child_process');

try {
  console.log('📡 Criando tabelas...');
  execSync('npx prisma db push --force-reset', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });

  console.log('📡 Executando seed...');
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });

  console.log('✅ Banco SQLite configurado e populado com sucesso!');
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
