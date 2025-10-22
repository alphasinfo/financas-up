#!/usr/bin/env node

/**
 * Script de Otimização de Startup - Financas-Up
 * 
 * Otimiza o tempo de inicialização do projeto
 * Executa verificações e correções automáticas
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Otimizando startup do projeto...\n');

// 1. Verificar se .env.local existe
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ Arquivo .env.local não encontrado');
  console.log('✅ Criando .env.local com configurações padrão...');
  
  const envContent = `# CONFIGURAÇÃO LOCAL - FINANCAS-UP
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="8Sg4me2Px3VBzR6eeyK+Kjm7sVzdrawgQgK1lKi0Rz4="
NEXTAUTH_DEBUG=false
`;
  
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Arquivo .env.local criado\n');
} else {
  console.log('✅ Arquivo .env.local encontrado\n');
}

// 2. Verificar configuração do banco
console.log('🔍 Verificando configuração do banco de dados...');
require('dotenv').config({ path: envLocalPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log('❌ DATABASE_URL não configurada');
} else if (databaseUrl.startsWith('file:')) {
  console.log('✅ Usando SQLite local (desenvolvimento)');
} else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  console.log('✅ Usando PostgreSQL/Supabase');
} else {
  console.log('⚠️  DATABASE_URL com formato não reconhecido');
}

// 3. Verificar NextAuth
console.log('\n🔍 Verificando configuração do NextAuth...');
if (!process.env.NEXTAUTH_SECRET) {
  console.log('❌ NEXTAUTH_SECRET não configurado');
} else {
  console.log('✅ NEXTAUTH_SECRET configurado');
}

if (!process.env.NEXTAUTH_URL) {
  console.log('❌ NEXTAUTH_URL não configurado');
} else {
  console.log('✅ NEXTAUTH_URL configurado');
}

// 4. Limpar cache do Next.js
console.log('\n🧹 Limpando cache do Next.js...');
const nextCachePath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCachePath)) {
  fs.rmSync(nextCachePath, { recursive: true, force: true });
  console.log('✅ Cache do Next.js limpo');
} else {
  console.log('✅ Cache já estava limpo');
}

// 5. Verificar dependências críticas
console.log('\n📦 Verificando dependências críticas...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const criticalDeps = ['next', '@prisma/client', 'next-auth'];
criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep}: não encontrado`);
  }
});

console.log('\n🎉 Otimização concluída!');
console.log('\n💡 Dicas para melhor performance:');
console.log('   • Use "npm run dev:fast" para desenvolvimento');
console.log('   • Configure Google OAuth se necessário');
console.log('   • Use SQLite para desenvolvimento local');
console.log('   • Use PostgreSQL/Supabase para produção');