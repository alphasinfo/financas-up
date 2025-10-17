const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verificarSistema() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA\n');
  console.log('='.repeat(60));

  // 1. Verificar configurações de email
  console.log('\n📧 1. CONFIGURAÇÕES DE EMAIL\n');
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        smtpProvider: true,
        smtpEmail: true,
        smtpPassword: true,
        smtpHost: true,
        smtpPort: true,
        smtpNome: true,
      },
    });

    console.log(`Total de usuários: ${usuarios.length}\n`);

    for (const usuario of usuarios) {
      console.log(`👤 ${usuario.nome} (${usuario.email})`);
      
      if (usuario.smtpProvider) {
        console.log(`   ✅ Provedor: ${usuario.smtpProvider}`);
        console.log(`   📧 Email SMTP: ${usuario.smtpEmail || 'N/A'}`);
        console.log(`   🔑 Senha: ${usuario.smtpPassword ? '***configurada***' : 'N/A'}`);
        console.log(`   🌐 Host: ${usuario.smtpHost || 'N/A'}`);
        console.log(`   🔌 Porta: ${usuario.smtpPort || 'N/A'}`);
      } else {
        console.log(`   ⚠️  Nenhuma configuração`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error.message);
  }

  // 2. Verificar convites pendentes
  console.log('='.repeat(60));
  console.log('\n📨 2. CONVITES PENDENTES\n');
  try {
    const convites = await prisma.conviteCompartilhamento.findMany({
      where: {
        aceito: false,
      },
      select: {
        id: true,
        token: true,
        email: true,
        tipo: true,
        permissao: true,
        expiraEm: true,
        criadoEm: true,
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    console.log(`Total: ${convites.length} convites\n`);
    
    for (const convite of convites) {
      const expirado = new Date() > convite.expiraEm;
      console.log(`${expirado ? '⏰' : '📧'} Para: ${convite.email}`);
      console.log(`   De: ${convite.criador.nome}`);
      console.log(`   Permissão: ${convite.permissao}`);
      console.log(`   Criado: ${convite.criadoEm.toLocaleString('pt-BR')}`);
      console.log(`   Expira: ${convite.expiraEm.toLocaleString('pt-BR')} ${expirado ? '(EXPIRADO)' : ''}`);
      console.log(`   Link: http://localhost:3000/convite/${convite.token}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar convites:', error.message);
  }

  // 3. Verificar arquivos importantes
  console.log('='.repeat(60));
  console.log('\n📁 3. ARQUIVOS DO SISTEMA\n');
  
  const arquivos = [
    'src/app/convite/[token]/page.tsx',
    'src/app/api/convites/validar/[token]/route.ts',
    'src/app/api/convites/aceitar/[token]/route.ts',
    'src/components/configuracoes/config-smtp-simples.tsx',
    'src/components/configuracoes/aba-docs.tsx',
    'src/lib/email.ts',
    'GUIA-CONFIGURACAO-EMAIL.md',
    'CORRECOES-FINAIS-EMAIL.md',
    'CORRECOES-APLICADAS-FINAL.md',
  ];

  for (const arquivo of arquivos) {
    const caminho = path.join(process.cwd(), arquivo);
    const existe = fs.existsSync(caminho);
    console.log(`${existe ? '✅' : '❌'} ${arquivo}`);
  }

  // 4. Verificar variáveis de ambiente
  console.log('\n' + '='.repeat(60));
  console.log('\n🔐 4. VARIÁVEIS DE AMBIENTE\n');
  
  const envVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
  ];

  for (const envVar of envVars) {
    const valor = process.env[envVar];
    if (valor) {
      if (envVar === 'RESEND_API_KEY') {
        console.log(`✅ ${envVar}: ${valor.substring(0, 8)}...`);
      } else if (envVar === 'DATABASE_URL') {
        console.log(`✅ ${envVar}: ***configurado***`);
      } else {
        console.log(`✅ ${envVar}: ${valor}`);
      }
    } else {
      console.log(`⚠️  ${envVar}: não configurado`);
    }
  }

  // 5. Resumo
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 5. RESUMO\n');
  
  const usuariosComEmail = await prisma.usuario.count({
    where: {
      smtpProvider: {
        not: null,
      },
    },
  });

  const convitesPendentes = await prisma.conviteCompartilhamento.count({
    where: {
      aceito: false,
      expiraEm: {
        gte: new Date(),
      },
    },
  });

  console.log(`✅ Usuários com email configurado: ${usuariosComEmail}`);
  console.log(`📨 Convites válidos pendentes: ${convitesPendentes}`);
  console.log(`🔑 Resend global: ${process.env.RESEND_API_KEY ? 'Configurado' : 'Não configurado'}`);

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!\n');

  await prisma.$disconnect();
}

verificarSistema().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
