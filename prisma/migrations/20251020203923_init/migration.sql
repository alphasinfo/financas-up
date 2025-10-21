-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "imagem" TEXT,
    "logo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviarRelatorioEmail" BOOLEAN NOT NULL DEFAULT false,
    "diaEnvioRelatorio" INTEGER,
    "ultimoEnvioRelatorio" DATETIME,
    "notificacaoEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoVencimento" BOOLEAN NOT NULL DEFAULT true,
    "notificacaoOrcamento" BOOLEAN NOT NULL DEFAULT true,
    "smtpProvider" TEXT,
    "smtpEmail" TEXT,
    "smtpPassword" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpNome" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "agencia" TEXT,
    "numero" TEXT,
    "tipo" TEXT NOT NULL,
    "saldoInicial" REAL NOT NULL DEFAULT 0,
    "saldoAtual" REAL NOT NULL DEFAULT 0,
    "saldoDisponivel" REAL NOT NULL DEFAULT 0,
    "temLimiteCredito" BOOLEAN NOT NULL DEFAULT false,
    "limiteCredito" REAL NOT NULL DEFAULT 0,
    "cor" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contas_bancarias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "cartoes_credito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "bandeira" TEXT NOT NULL,
    "apelido" TEXT,
    "numeroMascara" TEXT,
    "limiteTotal" REAL NOT NULL,
    "limiteDisponivel" REAL NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "cor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cartoes_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartaoId" TEXT NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "dataFechamento" DATETIME NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "pagamentos_fatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "faturaId" TEXT NOT NULL,
    "contaBancariaId" TEXT,
    "emprestimo_id" INTEGER,
    "valor" REAL NOT NULL,
    "dataPagamento" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagamentos_fatura_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "pagamentos_fatura_emprestimo_id_fkey" FOREIGN KEY ("emprestimo_id") REFERENCES "emprestimos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_fatura_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataCompetencia" DATETIME NOT NULL,
    "dataLiquidacao" DATETIME,
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transacoes_cartaoCreditoId_fkey" FOREIGN KEY ("cartaoCreditoId") REFERENCES "cartoes_credito" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "transacoes_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "taxaJuros" REAL NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "descricao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investimentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorAplicado" REAL NOT NULL,
    "valorAtual" REAL,
    "taxaRendimento" REAL,
    "dataAplicacao" DATETIME NOT NULL,
    "dataVencimento" DATETIME,
    "instituicao" TEXT,
    "observacoes" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "investimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT,
    "valorLimite" REAL NOT NULL,
    "valorGasto" REAL NOT NULL DEFAULT 0,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "orcamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorAlvo" REAL NOT NULL,
    "valorAtual" REAL NOT NULL DEFAULT 0,
    "dataInicio" DATETIME NOT NULL,
    "dataPrazo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "conciliacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "dataImportacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrosTotal" INTEGER NOT NULL,
    "registrosNovos" INTEGER NOT NULL,
    "registrosDuplicados" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "conciliacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "compartilhamentos_conta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "criadoPor" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "compartilhamentos_conta_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas_bancarias" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "compartilhamentos_conta_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "compartilhamentos_conta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "convites_compartilhamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "recursoId" TEXT,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "token" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" DATETIME NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false,
    "aceitoEm" DATETIME,
    CONSTRAINT "convites_compartilhamento_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "logs_acesso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT,
    "recursoId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_acesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_categorias_usuarioId" ON "categorias"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_contas_usuarioId" ON "contas_bancarias"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_contas_usuarioId_ativa" ON "contas_bancarias"("usuarioId", "ativa");

-- CreateIndex
CREATE INDEX "idx_cartoes_usuarioId" ON "cartoes_credito"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_cartoes_usuarioId_ativo" ON "cartoes_credito"("usuarioId", "ativo");

-- CreateIndex
CREATE INDEX "idx_faturas_cartaoId" ON "faturas"("cartaoId");

-- CreateIndex
CREATE INDEX "idx_faturas_dataVencimento" ON "faturas"("dataVencimento");

-- CreateIndex
CREATE INDEX "idx_faturas_mesReferencia_anoReferencia" ON "faturas"("mesReferencia", "anoReferencia");

-- CreateIndex
CREATE INDEX "idx_faturas_status" ON "faturas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_cartaoId_mesReferencia_anoReferencia_key" ON "faturas"("cartaoId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE INDEX "idx_transacoes_cartaoCreditoId" ON "transacoes"("cartaoCreditoId");

-- CreateIndex
CREATE INDEX "idx_transacoes_categoriaId" ON "transacoes"("categoriaId");

-- CreateIndex
CREATE INDEX "idx_transacoes_contaBancariaId" ON "transacoes"("contaBancariaId");

-- CreateIndex
CREATE INDEX "idx_transacoes_dataCompetencia" ON "transacoes"("dataCompetencia");

-- CreateIndex
CREATE INDEX "idx_transacoes_faturaId" ON "transacoes"("faturaId");

-- CreateIndex
CREATE INDEX "idx_transacoes_usuarioId" ON "transacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_transacoes_usuarioId_dataCompetencia" ON "transacoes"("usuarioId", "dataCompetencia");

-- CreateIndex
CREATE INDEX "idx_transacoes_usuarioId_status" ON "transacoes"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "idx_transacoes_usuarioId_tipo_data" ON "transacoes"("usuarioId", "tipo", "dataCompetencia");

-- CreateIndex
CREATE INDEX "idx_transacoes_usuarioId_status_data" ON "transacoes"("usuarioId", "status", "dataCompetencia");

-- CreateIndex
CREATE INDEX "idx_transacoes_cartao_data" ON "transacoes"("cartaoCreditoId", "dataCompetencia");

-- CreateIndex
CREATE INDEX "idx_investimentos_usuarioId" ON "investimentos"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_orcamentos_usuarioId" ON "orcamentos"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_orcamentos_usuarioId_mesReferencia_anoReferencia" ON "orcamentos"("usuarioId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE INDEX "idx_metas_usuarioId" ON "metas"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_conciliacoes_usuarioId" ON "conciliacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "idx_compartilhamentos_conta_contaId" ON "compartilhamentos_conta"("contaId");

-- CreateIndex
CREATE INDEX "idx_compartilhamentos_conta_criadoPor" ON "compartilhamentos_conta"("criadoPor");

-- CreateIndex
CREATE INDEX "idx_compartilhamentos_conta_usuarioId" ON "compartilhamentos_conta"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "compartilhamentos_conta_contaId_usuarioId_key" ON "compartilhamentos_conta"("contaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "convites_compartilhamento_token_key" ON "convites_compartilhamento"("token");

-- CreateIndex
CREATE INDEX "idx_convites_compartilhamento_criadoPor" ON "convites_compartilhamento"("criadoPor");

-- CreateIndex
CREATE INDEX "idx_convites_compartilhamento_email" ON "convites_compartilhamento"("email");

-- CreateIndex
CREATE INDEX "idx_logs_acesso_criadoEm" ON "logs_acesso"("criadoEm");

-- CreateIndex
CREATE INDEX "idx_logs_acesso_usuarioId" ON "logs_acesso"("usuarioId");
