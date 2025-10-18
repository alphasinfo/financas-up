-- ============================================
-- BANCO DE DADOS COMPLETO - FINANÇAS UP
-- ============================================
-- Script SQL completo para PostgreSQL (Supabase)
-- Inclui TODAS as tabelas e colunas atualizadas
-- Versão: 2.0 (com compartilhamento e notificações)



-- ============================================
-- 1. CRIAR TABELAS (sem foreign keys)
-- ============================================



-- USUÁRIOS (com todas as novas colunas)
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "senha" TEXT,
    "imagem" TEXT,
    "logo" TEXT,
    
    -- Relatórios por email
    "enviarRelatorioEmail" BOOLEAN NOT NULL DEFAULT false,
    "diaEnvioRelatorio" INTEGER,
    "ultimoEnvioRelatorio" TIMESTAMP(3),
    
    -- Notificações
    "notificacaoEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoVencimento" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoOrcamento" BOOLEAN NOT NULL DEFAULT true,
    
    -- Configurações SMTP
    "smtpProvider" TEXT,
    "smtpEmail" TEXT,
    "smtpPassword" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpNome" TEXT,
    
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- CATEGORIAS
CREATE TABLE IF NOT EXISTS "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- CONTAS BANCÁRIAS
CREATE TABLE IF NOT EXISTS "contas_bancarias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "agencia" TEXT,
    "numero" TEXT,
    "tipo" TEXT NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoDisponivel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "temLimiteCredito" BOOLEAN NOT NULL DEFAULT false,
    "limiteCredito" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cor" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- CARTÕES DE CRÉDITO
CREATE TABLE IF NOT EXISTS "cartoes_credito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "bandeira" TEXT NOT NULL,
    "apelido" TEXT,
    "numeroMascara" TEXT,
    "limiteTotal" DOUBLE PRECISION NOT NULL,
    "limiteDisponivel" DOUBLE PRECISION NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "cor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- FATURAS
CREATE TABLE IF NOT EXISTS "faturas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartaoId" TEXT NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "dataFechamento" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("cartaoId", "mesReferencia", "anoReferencia")
);



-- EMPRÉSTIMOS
CREATE TABLE IF NOT EXISTS "emprestimos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instituicao" TEXT NOT NULL,
    "descricao" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorParcela" DOUBLE PRECISION NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "parcelasPagas" INTEGER NOT NULL DEFAULT 0,
    "taxaJurosMensal" DOUBLE PRECISION,
    "taxaJurosAnual" DOUBLE PRECISION,
    "sistemaAmortizacao" TEXT NOT NULL DEFAULT 'PRICE',
    "dataContratacao" TIMESTAMP(3) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- PAGAMENTOS DE FATURA
CREATE TABLE IF NOT EXISTS "pagamentos_fatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "faturaId" TEXT NOT NULL,
    "contaBancariaId" TEXT,
    "emprestimoId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- TRANSAÇÕES
CREATE TABLE IF NOT EXISTS "transacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataCompetencia" TIMESTAMP(3) NOT NULL,
    "dataLiquidacao" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "parcelado" BOOLEAN NOT NULL DEFAULT false,
    "parcelaAtual" INTEGER,
    "parcelaTotal" INTEGER,
    "categoriaId" TEXT,
    "contaBancariaId" TEXT,
    "cartaoCreditoId" TEXT,
    "faturaId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- PARCELAS DE EMPRÉSTIMO
CREATE TABLE IF NOT EXISTS "parcelas_emprestimo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emprestimoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("emprestimoId", "numeroParcela")
);



-- INVESTIMENTOS
CREATE TABLE IF NOT EXISTS "investimentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorAplicado" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION,
    "taxaRendimento" DOUBLE PRECISION,
    "dataAplicacao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "instituicao" TEXT,
    "observacoes" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- ORÇAMENTOS
CREATE TABLE IF NOT EXISTS "orcamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT,
    "valorLimite" DOUBLE PRECISION NOT NULL,
    "valorGasto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- METAS
CREATE TABLE IF NOT EXISTS "metas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorAlvo" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataPrazo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- CONCILIAÇÕES
CREATE TABLE IF NOT EXISTS "conciliacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "dataImportacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrosTotal" INTEGER NOT NULL,
    "registrosNovos" INTEGER NOT NULL,
    "registrosDuplicados" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "usuarioId" TEXT NOT NULL
);



-- COMPARTILHAMENTOS DE CONTA (NOVA)
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



-- CONVITES DE COMPARTILHAMENTO (NOVA)
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



-- LOGS DE ACESSO (NOVA)
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



-- ============================================
-- 2. ADICIONAR FOREIGN KEYS
-- ============================================



-- Categorias
ALTER TABLE "categorias" 
DROP CONSTRAINT IF EXISTS "categorias_usuarioId_fkey",
ADD CONSTRAINT "categorias_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Contas Bancárias
ALTER TABLE "contas_bancarias" 
DROP CONSTRAINT IF EXISTS "contas_bancarias_usuarioId_fkey",
ADD CONSTRAINT "contas_bancarias_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Cartões de Crédito
ALTER TABLE "cartoes_credito" 
DROP CONSTRAINT IF EXISTS "cartoes_credito_usuarioId_fkey",
ADD CONSTRAINT "cartoes_credito_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Faturas
ALTER TABLE "faturas" 
DROP CONSTRAINT IF EXISTS "faturas_cartaoId_fkey",
ADD CONSTRAINT "faturas_cartaoId_fkey" 
    FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Pagamentos de Fatura
ALTER TABLE "pagamentos_fatura" 
DROP CONSTRAINT IF EXISTS "pagamentos_fatura_faturaId_fkey",
ADD CONSTRAINT "pagamentos_fatura_faturaId_fkey" 
    FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pagamentos_fatura" 
DROP CONSTRAINT IF EXISTS "pagamentos_fatura_contaBancariaId_fkey",
ADD CONSTRAINT "pagamentos_fatura_contaBancariaId_fkey" 
    FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pagamentos_fatura" 
DROP CONSTRAINT IF EXISTS "pagamentos_fatura_emprestimoId_fkey",
ADD CONSTRAINT "pagamentos_fatura_emprestimoId_fkey" 
    FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;



-- Transações
ALTER TABLE "transacoes" 
DROP CONSTRAINT IF EXISTS "transacoes_usuarioId_fkey",
ADD CONSTRAINT "transacoes_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transacoes" 
DROP CONSTRAINT IF EXISTS "transacoes_categoriaId_fkey",
ADD CONSTRAINT "transacoes_categoriaId_fkey" 
    FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transacoes" 
DROP CONSTRAINT IF EXISTS "transacoes_contaBancariaId_fkey",
ADD CONSTRAINT "transacoes_contaBancariaId_fkey" 
    FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transacoes" 
DROP CONSTRAINT IF EXISTS "transacoes_cartaoCreditoId_fkey",
ADD CONSTRAINT "transacoes_cartaoCreditoId_fkey" 
    FOREIGN KEY ("cartaoCreditoId") REFERENCES "cartoes_credito" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transacoes" 
DROP CONSTRAINT IF EXISTS "transacoes_faturaId_fkey",
ADD CONSTRAINT "transacoes_faturaId_fkey" 
    FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;



-- Empréstimos
ALTER TABLE "emprestimos" 
DROP CONSTRAINT IF EXISTS "emprestimos_usuarioId_fkey",
ADD CONSTRAINT "emprestimos_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Parcelas de Empréstimo
ALTER TABLE "parcelas_emprestimo" 
DROP CONSTRAINT IF EXISTS "parcelas_emprestimo_emprestimoId_fkey",
ADD CONSTRAINT "parcelas_emprestimo_emprestimoId_fkey" 
    FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Investimentos
ALTER TABLE "investimentos" 
DROP CONSTRAINT IF EXISTS "investimentos_usuarioId_fkey",
ADD CONSTRAINT "investimentos_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Orçamentos
ALTER TABLE "orcamentos" 
DROP CONSTRAINT IF EXISTS "orcamentos_usuarioId_fkey",
ADD CONSTRAINT "orcamentos_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orcamentos" 
DROP CONSTRAINT IF EXISTS "orcamentos_categoriaId_fkey",
ADD CONSTRAINT "orcamentos_categoriaId_fkey" 
    FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;



-- Metas
ALTER TABLE "metas" 
DROP CONSTRAINT IF EXISTS "metas_usuarioId_fkey",
ADD CONSTRAINT "metas_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Conciliações
ALTER TABLE "conciliacoes" 
DROP CONSTRAINT IF EXISTS "conciliacoes_usuarioId_fkey",
ADD CONSTRAINT "conciliacoes_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Compartilhamentos de Conta (NOVO)
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



-- Convites de Compartilhamento (NOVO)
ALTER TABLE "convites_compartilhamento" 
DROP CONSTRAINT IF EXISTS "convites_compartilhamento_criadoPor_fkey",
ADD CONSTRAINT "convites_compartilhamento_criadoPor_fkey" 
    FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- Logs de Acesso (NOVO)
ALTER TABLE "logs_acesso" 
DROP CONSTRAINT IF EXISTS "logs_acesso_usuarioId_fkey",
ADD CONSTRAINT "logs_acesso_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;



-- ============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices existentes
CREATE INDEX IF NOT EXISTS "idx_categorias_usuarioId" ON "categorias"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_contas_usuarioId" ON "contas_bancarias"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_cartoes_usuarioId" ON "cartoes_credito"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_faturas_cartaoId" ON "faturas"("cartaoId");
CREATE INDEX IF NOT EXISTS "idx_transacoes_usuarioId" ON "transacoes"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_transacoes_categoriaId" ON "transacoes"("categoriaId");
CREATE INDEX IF NOT EXISTS "idx_transacoes_dataCompetencia" ON "transacoes"("dataCompetencia");
CREATE INDEX IF NOT EXISTS "idx_emprestimos_usuarioId" ON "emprestimos"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_investimentos_usuarioId" ON "investimentos"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_orcamentos_usuarioId" ON "orcamentos"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_metas_usuarioId" ON "metas"("usuarioId");

-- Novos índices
CREATE INDEX IF NOT EXISTS "idx_compartilhamentos_contaId" ON "compartilhamentos_conta"("contaId");
CREATE INDEX IF NOT EXISTS "idx_compartilhamentos_usuarioId" ON "compartilhamentos_conta"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_compartilhamentos_criadoPor" ON "compartilhamentos_conta"("criadoPor");
CREATE INDEX IF NOT EXISTS "idx_convites_email" ON "convites_compartilhamento"("email");
CREATE INDEX IF NOT EXISTS "idx_convites_token" ON "convites_compartilhamento"("token");
CREATE INDEX IF NOT EXISTS "idx_convites_criadoPor" ON "convites_compartilhamento"("criadoPor");
CREATE INDEX IF NOT EXISTS "idx_logs_usuarioId" ON "logs_acesso"("usuarioId");
CREATE INDEX IF NOT EXISTS "idx_logs_acao" ON "logs_acesso"("acao");
CREATE INDEX IF NOT EXISTS "idx_logs_criadoEm" ON "logs_acesso"("criadoEm");



-- ============================================
-- 4. VERIFICAR ESTRUTURA
-- ============================================

-- Verificar colunas da tabela usuarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Verificar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;



-- ============================================
-- 5. RESUMO DAS ALTERAÇÕES
-- ============================================

/*
✅ TABELAS PRINCIPAIS (13):
   • usuarios (com novas colunas)
   • categorias
   • contas_bancarias
   • cartoes_credito
   • faturas
   • emprestimos
   • pagamentos_fatura
   • transacoes
   • parcelas_emprestimo
   • investimentos
   • orcamentos
   • metas
   • conciliacoes

✅ NOVAS TABELAS (3):
   • compartilhamentos_conta
   • convites_compartilhamento
   • logs_acesso

✅ NOVAS COLUNAS EM USUARIOS (9):
   • notificacaoEmail
   • notificacaoVencimento
   • notificacaoOrcamento
   • smtpProvider
   • smtpEmail
   • smtpPassword
   • smtpHost
   • smtpPort
   • smtpNome

✅ FUNCIONALIDADES:
   • Sistema de email (Gmail/Outlook/Outros)
   • Notificações personalizadas
   • Compartilhamento de contas
   • Sistema de convites
   • Logs de auditoria
   • Relatórios por email
*/
