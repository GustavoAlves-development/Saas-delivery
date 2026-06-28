-- CreateTable
CREATE TABLE "_AdicionalCategorias" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdicionalCategorias_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AdicionalCategorias_B_index" ON "_AdicionalCategorias"("B");

-- AddForeignKey
ALTER TABLE "_AdicionalCategorias" ADD CONSTRAINT "_AdicionalCategorias_A_fkey" FOREIGN KEY ("A") REFERENCES "acompanhamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdicionalCategorias" ADD CONSTRAINT "_AdicionalCategorias_B_fkey" FOREIGN KEY ("B") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
