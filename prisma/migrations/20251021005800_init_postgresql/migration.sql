-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
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
    "smtpNome" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" TEXT NOT NULL,
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
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartoes_credito" (
    "id" TEXT NOT NULL,
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
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartoes_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_fatura" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "contaBancariaId" TEXT,
    "emprestimo_id" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_fatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
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
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" TEXT NOT NULL,
    "instituicao" TEXT,
    "descricao" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorParcela" DOUBLE PRECISION NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "parcelasPagas" INTEGER NOT NULL DEFAULT 0,
    "taxaJuros" DOUBLE PRECISION,
    "taxaJurosMensal" DOUBLE PRECISION,
    "taxaJurosAnual" DOUBLE PRECISION,
    "sistemaAmortizacao" TEXT NOT NULL DEFAULT 'PRICE',
    "dataContratacao" TIMESTAMP(3) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas_emprestimo" (
    "id" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorAmortizacao" DOUBLE PRECISION NOT NULL,
    "valorJuros" DOUBLE PRECISION NOT NULL,
    "saldoDevedor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "emprestimoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcelas_emprestimo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investimentos" (
    "id" TEXT NOT NULL,
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
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT,
    "valorLimite" DOUBLE PRECISION NOT NULL,
    "valorGasto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorAlvo" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataPrazo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conciliacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "dataImportacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrosTotal" INTEGER NOT NULL,
    "registrosNovos" INTEGER NOT NULL,
    "registrosDuplicados" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "conciliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compartilhamentos_conta" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "compartilhamentos_conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convites_compartilhamento" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "recursoId" TEXT,
    "permissao" TEXT NOT NULL DEFAULT 'VISUALIZAR',
    "token" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false,
    "aceitoEm" TIMESTAMP(3),

    CONSTRAINT "convites_compartilhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acesso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT,
    "recursoId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acesso_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "parcelas_emprestimo_emprestimoId_numeroParcela_key" ON "parcelas_emprestimo"("emprestimoId", "numeroParcela");

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

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cartoes_credito" ADD CONSTRAINT "cartoes_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_emprestimo_id_fkey" FOREIGN KEY ("emprestimo_id") REFERENCES "emprestimos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_fatura" ADD CONSTRAINT "pagamentos_fatura_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_cartaoCreditoId_fkey" FOREIGN KEY ("cartaoCreditoId") REFERENCES "cartoes_credito"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas_emprestimo" ADD CONSTRAINT "parcelas_emprestimo_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investimentos" ADD CONSTRAINT "investimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conciliacoes" ADD CONSTRAINT "conciliacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas_bancarias"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compartilhamentos_conta" ADD CONSTRAINT "compartilhamentos_conta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "convites_compartilhamento" ADD CONSTRAINT "convites_compartilhamento_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
