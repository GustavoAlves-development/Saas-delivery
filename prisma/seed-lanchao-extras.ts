import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const empresa = await prisma.empresa.findUnique({ where: { slug: "lanchao-lanches" } });
  if (!empresa) throw new Error("Empresa lanchao-lanches não encontrada");

  // Categorias
  const catHotDogs = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Hot Dogs" },
  }) ?? await prisma.categoria.create({
    data: { nome: "Hot Dogs", empresaId: empresa.id },
  });

  const catBebidas = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Bebidas" },
  }) ?? await prisma.categoria.create({
    data: { nome: "Bebidas", empresaId: empresa.id },
  });

  const catSucos = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Sucos" },
  }) ?? await prisma.categoria.create({
    data: { nome: "Sucos", empresaId: empresa.id },
  });

  const catPorcoes = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Porções" },
  }) ?? await prisma.categoria.create({
    data: { nome: "Porções", empresaId: empresa.id },
  });

  const catBebidasAlcool = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Bebidas com Álcool" },
  }) ?? await prisma.categoria.create({
    data: { nome: "Bebidas com Álcool", empresaId: empresa.id },
  });

  console.log("Categorias prontas");

  // Hot Dogs (6 itens)
  const hotDogs = [
    { nome: "1 - Hot Simples", desc: "Batata, salsa, molho caseiro, mineserme, ketchup e mostarda", preco: 19.90 },
    { nome: "2 - Hot Duplo", desc: "2 salsichas, batata, molho caseiro, mineserme, ketchup e mostarda", preco: 21.90 },
    { nome: "3 - Hot Bacon", desc: "Salsicha, bacon, batata pão, molho caseiro, ketchup e mostarda", preco: 24.90 },
    { nome: "4 - Hot Calabresa", desc: "Salsicha, calabresa, batata pão, molho caseiro, ketchup e mostarda", preco: 24.90 },
    { nome: "5 - Hot Frango", desc: "Frango, batata pão, molho caseiro, mineserme, ketchup e mostarda", preco: 24.90 },
    { nome: "6 - Hot Misto", desc: "Salsicha, presunto, queijo, batata pão, molho caseiro, ketchup e mostarda", preco: 24.90 },
  ];

  for (const p of hotDogs) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.desc,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catHotDogs.id,
      },
    });
  }
  console.log(`${hotDogs.length} hot dogs criados`);

  // Bebidas (8 itens)
  const bebidas = [
    { nome: "Refrigerante 290ml (Garrafa)", preco: 7.00 },
    { nome: "Refrigerante 350ml (Lata)", preco: 8.50 },
    { nome: "Refrigerante 600ml (Descartável)", preco: 10.90 },
    { nome: "Refrigerante 1 Litro", preco: 12.90 },
    { nome: "Refrigerante 2 Litros", preco: 18.90 },
    { nome: "Água Mineral Sem Gás", preco: 5.50 },
    { nome: "Água Mineral Com Gás", preco: 6.00 },
    { nome: "Del Valle Lata", preco: 8.90 },
  ];

  for (const p of bebidas) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catBebidas.id,
      },
    });
  }
  console.log(`${bebidas.length} bebidas criadas`);

  // Sucos 500ml (6 itens)
  const sucos500 = [
    { nome: "Suco 500ml Abacaxi", preco: 13.90 },
    { nome: "Suco 500ml Abacaxi c/ Hortelã", preco: 13.90 },
    { nome: "Suco 500ml Acerola", preco: 13.90 },
    { nome: "Suco 500ml Maracujá", preco: 13.90 },
    { nome: "Suco 500ml Tamarindo", preco: 13.90 },
    { nome: "Suco 500ml Caju", preco: 13.90 },
  ];

  for (const p of sucos500) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catSucos.id,
      },
    });
  }

  // Sucos 1L (3 itens)
  const sucos1L = [
    { nome: "Suco 1L Laranja", preco: 26.90 },
    { nome: "Suco 1L Maracujá", preco: 24.90 },
    { nome: "Suco 1L Caju", preco: 24.90 },
  ];

  for (const p of sucos1L) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catSucos.id,
      },
    });
  }
  console.log(`${sucos500.length + sucos1L.length} sucos criados`);

  // Porções (2 itens)
  const porcoes = [
    { nome: "Batata Pequena", preco: 22.90 },
    { nome: "Batata Grande", preco: 39.90 },
  ];

  for (const p of porcoes) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catPorcoes.id,
      },
    });
  }
  console.log(`${porcoes.length} porções criadas`);

  // Bebidas com Álcool (3 itens)
  const bebidasAlcool = [
    { nome: "Skol Lata", preco: 9.90 },
    { nome: "Brahma Lata", preco: 9.90 },
    { nome: "Heineken Longneck 330ml", preco: 14.90 },
  ];

  for (const p of bebidasAlcool) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        preco: p.preco,
        empresaId: empresa.id,
        categoriaId: catBebidasAlcool.id,
      },
    });
  }
  console.log(`${bebidasAlcool.length} bebidas com álcool criadas`);

  console.log("\n✓ Lanchão Lanches atualizada com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
