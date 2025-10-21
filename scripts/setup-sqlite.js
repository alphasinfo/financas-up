#!/usr/bin/env node
console.log('🚀 Iniciando setup do SQLite...');

process.env.DATABASE_URL = 'file:./dev.db';
require('dotenv').config();

const { execSync } = require('child_process');

console.log('🔧 Configurando banco SQLite...');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
console.log(`PWD: ${process.cwd()}`);

try {
  console.log('📡 Executando: npx prisma db push --force-reset');
  execSync('npx prisma db push --force-reset', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });
  console.log('✅ Banco SQLite criado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao criar banco:', error.message);
  process.exit(1);
}
