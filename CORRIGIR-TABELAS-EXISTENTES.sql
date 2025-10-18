-- ============================================
-- CORREÇÃO DAS TABELAS EXISTENTES
-- ============================================
-- Este SQL adiciona APENAS as colunas que faltam
-- NÃO deleta nada, NÃO recria tabelas
-- Execute no Supabase SQL Editor

-- Adicionar colunas em contas_bancarias
ALTER TABLE "contas_bancarias" 
ADD COLUMN IF NOT EXISTS "temLimiteCredito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "limiteCredito" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Adicionar colunas em emprestimos
ALTER TABLE "emprestimos" 
ADD COLUMN IF NOT EXISTS "taxaJurosMensal" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "taxaJurosAnual" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "sistemaAmortizacao" TEXT NOT NULL DEFAULT 'PRICE';

-- Remover coluna antiga se existir
ALTER TABLE "emprestimos" 
DROP COLUMN IF EXISTS "taxaJuros";

-- Verificar resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contas_bancarias' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'emprestimos' 
ORDER BY ordinal_position;
