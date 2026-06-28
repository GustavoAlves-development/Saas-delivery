-- CreateEnum
CREATE TYPE "TipoEmpresa" AS ENUM ('LANCHONETE', 'PIZZARIA', 'RESTAURANTE');

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "tipo" "TipoEmpresa" NOT NULL DEFAULT 'LANCHONETE';

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "precoMedio" DECIMAL(10,2);
