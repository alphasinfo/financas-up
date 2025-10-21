#!/usr/bin/env node

console.log('🚀 Iniciando build Netlify...\n');

// Definir variáveis de ambiente necessárias
process.env.DATABASE_URL = 'postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10';
process.env.NEXTAUTH_SECRET = '8Sg4me2Px3VBzR6eeyK+Kjm7sVzdrawgQgK1lKi0Rz4=';
process.env.NEXTAUTH_URL = 'https://financas-up.netlify.app';
process.env.NETLIFY = 'true';

console.log('✅ Variáveis definidas\n');

// Executar comandos sequencialmente
const { spawn } = require('child_process');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`📡 Executando: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function build() {
  try {
    await runCommand('npm', ['run', 'db:supabase']);
    await runCommand('npx', ['prisma', 'generate']);
    await runCommand('npx', ['next', 'build']);

    console.log('\n✅ Build Netlify concluído!');
  } catch (error) {
    console.error('\n❌ Erro no build:', error.message);
    process.exit(1);
  }
}

build();
