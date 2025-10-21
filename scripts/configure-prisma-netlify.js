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

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

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
