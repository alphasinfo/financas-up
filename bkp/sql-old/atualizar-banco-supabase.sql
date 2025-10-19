-- ============================================
-- ATUALIZAÇÃO DO BANCO DE DADOS - FINANÇAS UP
-- ============================================
-- Script para adicionar novas tabelas e colunas no Supabase
-- Execute este script no SQL Editor do Supabase



-- ============================================
-- 1. ADICIONAR NOVAS COLUNAS NA TABELA USUARIOS
-- ============================================

-- Configurações de notificações
ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "notificacaoEmail" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "notificacaoVencimento" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "notificacaoOrcamento" BOOLEAN NOT NULL DEFAULT true;

-- Configurações SMTP (Email)
ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpProvider" TEXT;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpEmail" TEXT;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpPassword" TEXT;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpHost" TEXT;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER;

ALTER TABLE "usuarios" 
ADD COLUMN IF NOT EXISTS "smtpNome" TEXT;



-- ============================================
-- 2. CRIAR TABELA DE COMPARTILHAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS "compartilhamentos_conta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    UNIQUE ("contaId", "usuarioId")
);

-- Foreign Keys
ALTER TABLE "compartilhamentos_conta" 
DROP CONSTRAINT IF EXISTS "compartilhamentos_conta_contaId_fkey",
ADD CONSTRAINT "compartilhamentos_conta_contaId_fkey" 
    FOREIGN KEY ("contaId") REFERENCES "contas_bancarias" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "compartilhamentos_conta" 
DROP CONSTRAINT IF EXISTS "compartilhamentos_conta_usuarioId_fkey",
ADD CONSTRAINT "compartilhamentos_conta_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "compartilhamentos_conta" 
DROP CONSTRAINT IF EXISTS "compartilhamentos_conta_criadoPor_fkey",
ADD CONSTRAINT "compartilhamentos_conta_criadoPor_fkey" 
    FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Índices
CREATE INDEX IF NOT EXISTS "idx_compartilhamentos_contaId" ON "compartilhamentos_conta"("contaId");
CREATE INDEX IF NOT EXISTS "idx_compartilhamentos_usuarioId" ON "compartilhamentos_conta"("usuarioId");



-- ============================================
-- 3. CRIAR TABELA DE CONVITES
-- ============================================

CREATE TABLE IF NOT EXISTS "convites_compartilhamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "recursoId" TEXT,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "token" TEXT NOT NULL UNIQUE,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false,
    "aceitoEm" TIMESTAMP(3)
);

-- Foreign Keys
ALTER TABLE "convites_compartilhamento" 
DROP CONSTRAINT IF EXISTS "convites_compartilhamento_criadoPor_fkey",
ADD CONSTRAINT "convites_compartilhamento_criadoPor_fkey" 
    FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Índices
CREATE INDEX IF NOT EXISTS "idx_convites_email" ON "convites_compartilhamento"("email");
CREATE INDEX IF NOT EXISTS "idx_convites_token" ON "convites_compartilhamento"("token");
CREATE INDEX IF NOT EXISTS "idx_convites_criadoPor" ON "convites_compartilhamento"("criadoPor");



-- ============================================
-- 4. CRIAR TABELA DE LOGS DE ACESSO
-- ============================================

CREATE TABLE IF NOT EXISTS "logs_acesso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT,
    "recursoId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Keys
ALTER TABLE "logs_acesso" 
DROP CONSTRAINT IF EXISTS "logs_acesso_usuarioId_fkey",
ADD CONSTRAINT "logs_acesso_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Índices
CREATE INDEX IF NOT EXISTS "idx_logs_usuarioId" ON "logs_acesso"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_logs_acao" ON "logs_acesso"("acao");
CREATE INDEX IF NOT EXISTS "idx_logs_criadoEm" ON "logs_acesso"("criadoEm");



-- ============================================
-- 5. VERIFICAR ESTRUTURA ATUALIZADA
-- ============================================

-- Verificar novas colunas em usuarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name IN (
    'notificacaoEmail', 
    'notificacaoVencimento', 
    'notificacaoOrcamento',
    'smtpProvider',
    'smtpEmail',
    'smtpPassword',
    'smtpHost',
    'smtpPort',
    'smtpNome'
  )
ORDER BY column_name;

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'compartilhamentos_conta',
    'convites_compartilhamento',
    'logs_acesso'
  )
ORDER BY table_name;



-- ============================================
-- 6. RESUMO DAS ALTERAÇÕES
-- ============================================

/*
✅ NOVAS COLUNAS ADICIONADAS:
   • usuarios.notificacaoEmail
   • usuarios.notificacaoVencimento
   • usuarios.notificacaoOrcamento
   • usuarios.smtpProvider
   • usuarios.smtpEmail
   • usuarios.smtpPassword
   • usuarios.smtpHost
   • usuarios.smtpPort
   • usuarios.smtpNome

✅ NOVAS TABELAS CRIADAS:
   • compartilhamentos_conta (Sistema de compartilhamento)
   • convites_compartilhamento (Convites por email)
   • logs_acesso (Auditoria de acessos)

✅ FOREIGN KEYS CONFIGURADAS
✅ ÍNDICES CRIADOS PARA PERFORMANCE
✅ CONSTRAINTS ADICIONADAS

🎯 FUNCIONALIDADES HABILITADAS:
   • Configuração de email (Gmail/Outlook/Outros)
   • Notificações personalizadas
   • Compartilhamento de contas
   • Sistema de convites
   • Logs de auditoria
*/
