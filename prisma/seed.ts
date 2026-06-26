import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function seed() {
  const empresa = await prisma.empresa.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      nome: "Restaurante Demo",
      slug: "demo",
      telefoneWhatsapp: "5511999999999",
      taxaEntrega: 5.0,
    },
  });

  const senhaHash = await bcrypt.hash("admin123", 12);

  await prisma.usuario.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      senha: senhaHash,
      empresaId: empresa.id,
    },
  });

  const categoria = await prisma.categoria.upsert({
    where: { id: empresa.id + "_lanches" },
    update: {},
    create: { id: empresa.id + "_lanches", nome: "Lanches", empresaId: empresa.id },
  });

  await prisma.produto.createMany({
    data: [
      {
        nome: "X-Burguer",
        descricao: "Hambúrguer artesanal com queijo e alface",
        preco: 25.9,
        categoriaId: categoria.id,
        empresaId: empresa.id,
      },
      {
        nome: "X-Bacon",
        descricao: "Hambúrguer com bacon crocante e molho especial",
        preco: 32.9,
        categoriaId: categoria.id,
        empresaId: empresa.id,
      },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log("   Email: admin@demo.com");
  console.log("   Senha: admin123");
  console.log(`   Loja:  /loja/${empresa.slug}`);
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
