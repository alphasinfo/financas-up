-- ============================================
-- ADICIONAR CAMPOS DE RELATÓRIO POR EMAIL
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para adicionar os campos necessários

-- Adicionar campos na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS "enviarRelatorioEmail" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "diaEnvioRelatorio" INTEGER,
ADD COLUMN IF NOT EXISTS "ultimoEnvioRelatorio" TIMESTAMP;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND column_name IN ('enviarRelatorioEmail', 'diaEnvioRelatorio', 'ultimoEnvioRelatorio');
