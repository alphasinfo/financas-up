-- ============================================
-- FINANÇAS UP - SQL PARA PROJETO NOVO
-- ============================================
-- Execute no Supabase SQL Editor
-- Projeto novo, SEM drops
-- ============================================

-- USUÁRIOS
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "senha" TEXT,
    "imagem" TEXT,
    "logo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviarRelatorioEmail" BOOLEAN NOT NULL DEFAULT false,
    "diaEnvioRelatorio" INTEGER,
    "ultimoEnvioRelatorio" TIMESTAMP(3),
    "notificacaoEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoVencimento" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoOrcamento" BOOLEAN NOT NULL DEFAULT true,
    "smtpProvider" TEXT,
    "smtpEmail" TEXT,
    "smtpPassword" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpNome" TEXT
);

CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "contas_bancarias" (
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

CREATE TABLE "cartoes_credito" (
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

CREATE TABLE "faturas" (
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

CREATE TABLE "pagamentos_fatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "faturaId" TEXT NOT NULL,
    "contaBancariaId" TEXT,
    "emprestimoId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "transacoes" (
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

CREATE TABLE "emprestimos" (
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

CREATE TABLE "parcelas_emprestimo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emprestimoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorAmortizacao" DOUBLE PRECISION NOT NULL,
    "valorJuros" DOUBLE PRECISION NOT NULL,
    "saldoDevedor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("emprestimoId", "numeroParcela")
);

CREATE TABLE "investimentos" (
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

CREATE TABLE "orcamentos" (
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

CREATE TABLE "metas" (
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

CREATE TABLE "conciliacoes" (
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

CREATE TABLE "compartilhamentos_conta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    UNIQUE ("contaId", "usuarioId")
);

CREATE TABLE "convites_compartilhamento" (
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

CREATE TABLE "logs_acesso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT,
    "recursoId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "categorias" ADD CONSTRAINT "categorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "cartoes_credito" ADD CONSTRAINT "cartoes_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito" ("id") ON DELETE CASCADE;
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE CASCADE;
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL;
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") ON DELETE SET NULL;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartaoCreditoId_fkey" FOREIGN KEY ("cartaoCreditoId") REFERENCES "cartoes_credito" ("id") ON DELETE SET NULL;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE SET NULL;
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "parcelas_emprestimo" ADD CONSTRAINT "parcelas_emprestimo_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") ON DELETE CASCADE;
ALTER TABLE "investimentos" ADD CONSTRAINT "investimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL;
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "conciliacoes" ADD CONSTRAINT "conciliacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas_bancarias" ("id") ON DELETE CASCADE;
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "convites_compartilhamento" ADD CONSTRAINT "convites_compartilhamento_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") ON DELETE CASCADE;
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE;

CREATE INDEX "idx_categorias_usuarioId" ON "categorias"("usuarioId");
CREATE INDEX "idx_contas_usuarioId" ON "contas_bancarias"("usuarioId");
CREATE INDEX "idx_cartoes_usuarioId" ON "cartoes_credito"("usuarioId");
CREATE INDEX "idx_faturas_cartaoId" ON "faturas"("cartaoId");
CREATE INDEX "idx_transacoes_usuarioId" ON "transacoes"("usuarioId");
CREATE INDEX "idx_emprestimos_usuarioId" ON "emprestimos"("usuarioId");
CREATE INDEX "idx_investimentos_usuarioId" ON "investimentos"("usuarioId");
CREATE INDEX "idx_orcamentos_usuarioId" ON "orcamentos"("usuarioId");
CREATE INDEX "idx_metas_usuarioId" ON "metas"("usuarioId");
