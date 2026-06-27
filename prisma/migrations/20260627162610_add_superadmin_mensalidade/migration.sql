-- CreateEnum
CREATE TYPE "StatusMensalidade" AS ENUM ('TRIAL', 'EM_DIA', 'VENCIDA', 'CANCELADA');

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "plano" TEXT NOT NULL DEFAULT 'basico',
ADD COLUMN     "statusMensalidade" "StatusMensalidade" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "valorMensalidade" DECIMAL(10,2) NOT NULL DEFAULT 99.90,
ADD COLUMN     "vencimentoMensalidade" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "sessionToken" TEXT,
    "sessionExpiry" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_sessionToken_key" ON "super_admins"("sessionToken");
