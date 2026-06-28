-- CreateEnum
CREATE TYPE "TipoAcompanhamento" AS ENUM ('ADICIONAL', 'ACOMPANHAMENTO');

-- AlterTable
ALTER TABLE "acompanhamentos" ADD COLUMN     "tipo" "TipoAcompanhamento" NOT NULL DEFAULT 'ACOMPANHAMENTO';
