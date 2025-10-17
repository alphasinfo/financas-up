-- AlterTable
ALTER TABLE "contas_bancarias" ADD COLUMN "temLimiteCredito" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "contas_bancarias" ADD COLUMN "limiteCredito" DOUBLE PRECISION NOT NULL DEFAULT 0;
