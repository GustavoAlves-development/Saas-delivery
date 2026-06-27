-- CreateTable
CREATE TABLE "acompanhamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "acompanhamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "acompanhamentos" ADD CONSTRAINT "acompanhamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
