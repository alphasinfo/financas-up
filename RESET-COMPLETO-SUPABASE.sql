-- ============================================
-- RESET COMPLETO - DELETA TUDO E RECRIA
-- ============================================
-- Execute TUDO de uma vez no Supabase SQL Editor

-- 1. DELETAR TODAS AS TABELAS
DROP TABLE IF EXISTS "logs_acesso" CASCADE;
DROP TABLE IF EXISTS "convites_compartilhamento" CASCADE;
DROP TABLE IF EXISTS "compartilhamentos_conta" CASCADE;
DROP TABLE IF EXISTS "conciliacoes" CASCADE;
DROP TABLE IF EXISTS "metas" CASCADE;
DROP TABLE IF EXISTS "orcamentos" CASCADE;
DROP TABLE IF EXISTS "investimentos" CASCADE;
DROP TABLE IF EXISTS "parcelas_emprestimo" CASCADE;
DROP TABLE IF EXISTS "emprestimos" CASCADE;
DROP TABLE IF EXISTS "pagamentos_fatura" CASCADE;
DROP TABLE IF EXISTS "transacoes" CASCADE;
DROP TABLE IF EXISTS "faturas" CASCADE;
DROP TABLE IF EXISTS "cartoes_credito" CASCADE;
DROP TABLE IF EXISTS "contas_bancarias" CASCADE;
DROP TABLE IF EXISTS "categorias" CASCADE;
DROP TABLE IF EXISTS "usuarios" CASCADE;

-- 2. AGORA COPIE E COLE AQUI TODO O CONTEÚDO DO ARQUIVO:
-- scripts/utils/banco-completo-corrigido.sql
-- (Abra o arquivo, Ctrl+A, Ctrl+C, cole aqui embaixo)
