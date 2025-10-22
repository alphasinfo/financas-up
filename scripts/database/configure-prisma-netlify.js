#!/usr/bin/env node

/**
 * Script para configurar Prisma no Netlify
 * Garante que o schema está configurado para PostgreSQL
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Prisma para Netlify...\n');

// Verificar se estamos no Netlify
if (!process.env.NETLIFY) {
  console.log('⚠️  Não está no Netlify, pulando configuração');
  process.exit(0);
}

// Caminho mais robusto - subir até a raiz do projeto
// __dirname é scripts/database, então subir 2 níveis: ../..
const schemaPath = path.resolve(__dirname, '..', '..', 'prisma', 'schema.prisma');

console.log('📁 Procurando schema em:', schemaPath);

// Verificar se o arquivo existe
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema não encontrado em:', schemaPath);
  console.error('📂 Conteúdo do diretório prisma:', fs.readdirSync(path.dirname(schemaPath)));
  process.exit(1);
}

// Ler schema atual
let schema = fs.readFileSync(schemaPath, 'utf8');

// Verificar se já está configurado para PostgreSQL
if (schema.includes('provider = "postgresql"')) {
  console.log('✅ Schema já configurado para PostgreSQL');
  process.exit(0);
}

// Substituir SQLite por PostgreSQL
schema = schema.replace(
  /provider\s*=\s*"sqlite"/g,
  'provider = "postgresql"'
);

// Salvar schema
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('✅ Schema configurado para PostgreSQL');
console.log('📝 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('📝 SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
