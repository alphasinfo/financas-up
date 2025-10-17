-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "imagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "cor" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contas_bancarias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cartoes_credito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartaoId" TEXT NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "dataFechamento" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pagamentos_fatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "faturaId" TEXT NOT NULL,
    "contaBancariaId" TEXT,
    "emprestimoId" TEXT,
    "valor" REAL NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagamentos_fatura_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_fatura_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_fatura_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
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
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transacoes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacoes_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "contas_bancarias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacoes_cartaoCreditoId_fkey" FOREIGN KEY ("cartaoCreditoId") REFERENCES "cartoes_credito" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacoes_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instituicao" TEXT NOT NULL,
    "descricao" TEXT,
    "valorTotal" REAL NOT NULL,
    "valorParcela" REAL NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "parcelasPagas" INTEGER NOT NULL DEFAULT 0,
    "taxaJuros" REAL,
    "dataContratacao" TIMESTAMP(3) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parcelas_emprestimo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emprestimoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parcelas_emprestimo_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "emprestimos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investimentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorAplicado" REAL NOT NULL,
    "valorAtual" REAL,
    "taxaRendimento" REAL,
    "dataAplicacao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "instituicao" TEXT,
    "observacoes" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "investimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orcamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorAlvo" REAL NOT NULL,
    "valorAtual" REAL NOT NULL DEFAULT 0,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataPrazo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conciliacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "dataImportacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrosTotal" INTEGER NOT NULL,
    "registrosNovos" INTEGER NOT NULL,
    "registrosDuplicados" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "conciliacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_cartaoId_mesReferencia_anoReferencia_key" ON "faturas"("cartaoId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_emprestimo_emprestimoId_numeroParcela_key" ON "parcelas_emprestimo"("emprestimoId", "numeroParcela");
