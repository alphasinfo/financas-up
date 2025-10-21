#!/usr/bin/env node

/**
 * Script para configurar ambiente Netlify localmente para testes
 * Uso: npm run setup:netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando ambiente Netlify local...\n');

// Verificar se .env.netlify existe
const envNetlifyPath = path.join(__dirname, '..', '.env.netlify');
const envExamplePath = path.join(__dirname, '..', '.env.netlify.example');

if (!fs.existsSync(envNetlifyPath)) {
  console.log('❌ Arquivo .env.netlify não encontrado!');
  console.log('📋 Copie o arquivo .env.netlify.example e configure suas variáveis:');
  console.log('   cp .env.netlify.example .env.netlify');
  console.log('   # Edite .env.netlify com suas configurações reais');
  process.exit(1);
}

// Verificar se as variáveis essenciais estão definidas
require('dotenv').config({ path: envNetlifyPath });

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('🔍 Verificando variáveis obrigatórias...\n');

let allValid = true;
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value || value.includes('[project-ref]') || value.includes('[gerar-novo-secret')) {
    console.log(`❌ ${varName}: NÃO CONFIGURADO ou usando placeholder`);
    allValid = false;
  } else {
    console.log(`✅ ${varName}: OK`);
  }
}

if (!allValid) {
  console.log('\n❌ Algumas variáveis não estão configuradas corretamente!');
  console.log('📝 Edite o arquivo .env.netlify com os valores reais.');
  process.exit(1);
}

console.log('\n✅ Ambiente Netlify configurado com sucesso!');
console.log('\n🎯 Para testar localmente com Netlify:');
console.log('   npm run build:netlify  # Testa o build');
console.log('   npm run dev           # Roda com configurações Netlify');

// Simular variável NETLIFY=true
process.env.NETLIFY = 'true';

console.log('\n🔧 Ambiente configurado para simular Netlify localmente.');
console.log('💡 Use este ambiente para testar compatibilidade antes do deploy.');
