import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function seed() {
  // Criar empresa Lanches Paulista
  const empresa = await prisma.empresa.upsert({
    where: { slug: "lanches-paulista" },
    update: {},
    create: {
      nome: "Lanches Paulista",
      slug: "lanches-paulista",
      telefoneWhatsapp: "5511999999999",
      taxaEntrega: 0,
      paletaCor: "amber",
    },
  });

  const senhaHash = await bcrypt.hash("admin123", 12);

  await prisma.usuario.upsert({
    where: { email: "admin@lanches-paulista.com" },
    update: {},
    create: {
      email: "admin@lanches-paulista.com",
      senha: senhaHash,
      empresaId: empresa.id,
    },
  });

  // Criar categorias
  const categLanches = await prisma.categoria.create({
    data: { nome: "Lanches", empresaId: empresa.id },
  });

  const categHotDog = await prisma.categoria.create({
    data: { nome: "Hot Dog", empresaId: empresa.id },
  });

  const categRefrigerante = await prisma.categoria.create({
    data: { nome: "Refrigerante", empresaId: empresa.id },
  });

  const categCombos = await prisma.categoria.create({
    data: { nome: "Combos", empresaId: empresa.id },
  });

  // Adicionar produtos - LANCHES
  const lanches = [
    { nome: "01 - X Salada", descricao: "Hambúrguer, presunto, mussarela, tomate, alface e maionese.", preco: 29.0 },
    { nome: "02 - X Bacon", descricao: "Hambúrguer, bacon, tomate, maionese, mussarela e alface.", preco: 36.0 },
    { nome: "03 - X Egg", descricao: "Hambúrguer, ovo, mussarela, tomate, alface e maionese.", preco: 31.0 },
    { nome: "04 - X Burguer", descricao: "Hambúrguer, tomate, maionese, mussarela e alface.", preco: 27.0 },
    { nome: "05 - X Tudo Comum", descricao: "Hambúrguer, ovo, bacon, presunto, mussarela, tomate, alface e maionese.", preco: 44.0 },
    { nome: "06 - X Calabresa", descricao: "Hambúrguer, calabresa, tomate, maionese, mussarela e alface.", preco: 35.0 },
    { nome: "07 - X Tudo Especial", descricao: "Hambúrguer, ovo, presunto, bacon, calabresa, milho, tomate, alface, maionese e mussarela.", preco: 51.0 },
    { nome: "08 - X Tudo de Frango", descricao: "Frango, ovo, bacon, presunto, calabresa, milho, tomate, alface, maionese e mussarela.", preco: 55.0 },
    { nome: "09 - Americano Comum", descricao: "Presunto, alface, ovo, tomate, mussarela e maionese.", preco: 29.0 },
    { nome: "10 - X Calabacon", descricao: "Hambúrguer, mussarela, bacon, calabresa, tomate, alface e maionese.", preco: 46.0 },
    { nome: "11 - Místo", descricao: "Presunto, mussarela, maionese e tomate.", preco: 27.0 },
    { nome: "12 - Paulista", descricao: "Carne, mussarela, alface, maionese e tomate.", preco: 43.0 },
    { nome: "13 - Filé Acebolado", descricao: "Carne, cebola, mussarela, tomate, maionese e tomate.", preco: 46.0 },
    { nome: "14 - Filé Calabresa", descricao: "Carne, calabresa, queijo, tomate, maionese e alface.", preco: 49.0 },
    { nome: "15 - Churrasco", descricao: "Carne, maionese, tomate e alface.", preco: 40.0 },
    { nome: "16 - Vegetariano", descricao: "Ovo, mussarela, milho, tomate, alface e maionese.", preco: 27.0 },
    { nome: "17 - Calabacon", descricao: "Bacon, calabresa, tomate, mussarela, presunto, maionese e alface.", preco: 41.0 },
    { nome: "18 - Gauchinho", descricao: "Hambúrguer, bacon, ovo, mussarela, alface e maionese.", preco: 40.0 },
    { nome: "19 - X Frango", descricao: "Frango, mussarela, tomate, alface e maionese.", preco: 42.0 },
    { nome: "20 - Franbacon", descricao: "Frango, bacon, mussarela, tomate, maionese e alface.", preco: 46.0 },
    { nome: "21 - Americano de Frango", descricao: "Frango, ovo, mussarela, alface, tomate e maionese.", preco: 44.0 },
    { nome: "22 - Americano Especial", descricao: "Carne, ovo, bacon, presunto, alface, tomate, maionese e mussarela.", preco: 55.0 },
    { nome: "23 - Frango Frango", descricao: "Carne, frango, presunto, ovo, mussarela, tomate, alface e maionese.", preco: 58.0 },
    { nome: "24 - Franburger", descricao: "Frango, hambúrguer, presunto, mussarela, tomate, maionese e alface.", preco: 49.0 },
    { nome: "25 - Filé Bacon", descricao: "Carne, bacon, mussarela, tomate, maionese e alface.", preco: 49.0 },
    { nome: "26 - Americano de Carne", descricao: "Carne, ovo, tomate, alface, mussarela e maionese.", preco: 47.0 },
    { nome: "27 - Bauru de Carne", descricao: "Carne, presunto, queijo, tomate, maionese e alface.", preco: 44.0 },
    { nome: "28 - Frango Calabresa", descricao: "Frango, calabresa, queijo, tomate, alface e maionese.", preco: 46.0 },
    { nome: "29 - Frango Presunto", descricao: "Frango, presunto, queijo, tomate, alface e maionese.", preco: 43.0 },
    { nome: "30 - X Cala Tudo", descricao: "Hambúrguer, carne, frango, ovo, calabresa, bacon, presunto, milho, maionese, mussarela, tomate e alface.", preco: 74.0 },
    { nome: "31 - X Tudo Carne", descricao: "Carne, ovo, bacon, milho, presunto, calabresa, tomate, alface, maionese e mussarela.", preco: 62.0 },
  ];

  const hotdogs = [
    { nome: "Cachorro Quente", descricao: "Salsicha, vinagrete, batata palha, maionese e catchup.", preco: 14.0 },
    { nome: "Cachorro Quente Duplo", descricao: "2 salsichas, vinagrete, batata palha, maionese e catchup.", preco: 16.0 },
  ];

  const refrigerantes = [
    { nome: "Coca 2L", descricao: "", preco: 16.0 },
    { nome: "Coca 600ml", descricao: "", preco: 10.0 },
    { nome: "Poty 2L", descricao: "", preco: 10.0 },
    { nome: "Poty 600ml", descricao: "", preco: 7.0 },
    { nome: "Roller 2L", descricao: "", preco: 12.0 },
    { nome: "Roller 600ml", descricao: "", preco: 7.0 },
  ];

  const combos = [
    { nome: "1️⃣ Combo - X Bacon + X Calabresa", descricao: "2 lanches: X Bacon e X Calabresa", preco: 67.0 },
    { nome: "2️⃣ Combo - X Salada + X Calabresa", descricao: "2 lanches: X Salada e X Calabresa", preco: 61.0 },
    { nome: "3️⃣ Combo - X Salada + X Bacon", descricao: "2 lanches: X Salada e X Bacon", preco: 62.0 },
    { nome: "4️⃣ Combo - X Burguer + X Salada", descricao: "2 lanches: X Burguer e X Salada", preco: 53.0 },
    { nome: "5️⃣ Combo - X Burguer + X Calabresa", descricao: "2 lanches: X Burguer e X Calabresa", preco: 59.0 },
    { nome: "6️⃣ Combo - X Burguer + X Bacon", descricao: "2 lanches: X Burguer e X Bacon", preco: 60.0 },
    { nome: "7️⃣ Combo - 2x X Salada", descricao: "2 lanches: 2x X Salada", preco: 55.0 },
    { nome: "8️⃣ Combo - 2x X Burguer", descricao: "2 lanches: 2x X Burguer", preco: 51.0 },
  ];

  // Inserir lanches
  await prisma.produto.createMany({
    data: lanches.map(l => ({
      nome: l.nome,
      descricao: l.descricao,
      preco: l.preco,
      categoriaId: categLanches.id,
      empresaId: empresa.id,
    })),
  });

  // Inserir hot dogs
  await prisma.produto.createMany({
    data: hotdogs.map(h => ({
      nome: h.nome,
      descricao: h.descricao,
      preco: h.preco,
      categoriaId: categHotDog.id,
      empresaId: empresa.id,
    })),
  });

  // Inserir refrigerantes
  await prisma.produto.createMany({
    data: refrigerantes.map(r => ({
      nome: r.nome,
      descricao: r.descricao || undefined,
      preco: r.preco,
      categoriaId: categRefrigerante.id,
      empresaId: empresa.id,
    })),
  });

  // Inserir combos
  await prisma.produto.createMany({
    data: combos.map(c => ({
      nome: c.nome,
      descricao: c.descricao,
      preco: c.preco,
      categoriaId: categCombos.id,
      empresaId: empresa.id,
    })),
  });

  console.log("✅ Seed Lanches Paulista concluído!");
  console.log("   Loja:  lanches-paulista");
  console.log("   Email: admin@lanches-paulista.com");
  console.log("   Senha: admin123");
  console.log(`   URL:   http://localhost:3000/loja/lanches-paulista`);
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
