import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Criar empresa
  const empresa = await prisma.empresa.create({
    data: {
      nome: "Lanchão Lanches",
      slug: "lanchao-lanches",
      telefoneWhatsapp: "1199999999",
      tipo: "LANCHONETE",
    },
  });
  console.log(`Empresa: ${empresa.nome}`);

  // Criar usuário admin
  const senhaHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.create({
    data: {
      email: "admin@lanchao.com",
      senha: senhaHash,
      empresaId: empresa.id,
    },
  });

  // Criar categorias
  const catHamb = await prisma.categoria.create({
    data: { nome: "Hambúrguer", empresaId: empresa.id },
  });
  const catFrango = await prisma.categoria.create({
    data: { nome: "Frango", empresaId: empresa.id },
  });
  const catTrad = await prisma.categoria.create({
    data: { nome: "Tradicionais", empresaId: empresa.id },
  });
  const catFile = await prisma.categoria.create({
    data: { nome: "Filé", empresaId: empresa.id },
  });

  console.log("Categorias criadas");

  // Hambúrgueres
  const hamburgueres = [
    { nome: "01 - X SALADA", desc: "Hambúrguer, tomate, alface, mussarela e maionese.", g: 39.90, m: 34.90, min: 25.90 },
    { nome: "02 - X SALADA DUPLO", desc: null, g: 44.90, m: null, min: null },
    { nome: "03 - X BURGUER", desc: "Hambúrguer, tomate, mussarela e maionese.", g: 39.90, m: 34.90, min: 25.90 },
    { nome: "04 - X BACON", desc: "Hambúrguer, bacon, tomate, mussarela e maionese.", g: 44.90, m: 39.90, min: 29.90 },
    { nome: "05 - X EGG", desc: "Hambúrguer, ovo, mussarela, tomate, alface e maionese.", g: 41.90, m: 36.90, min: 27.90 },
    { nome: "06 - X MOZZARELA", desc: "Hambúrguer, presunto, mussarela, tomate e maionese", g: 44.90, m: 39.90, min: null },
    { nome: "07 - X CALABRESA", desc: "Hambúrguer, calabresa, tomate, mussarela e maionese", g: 44.90, m: 39.90, min: 29.90 },
    { nome: "08 - X TUDO ESPECIAL", desc: "Hambúrguer, ovo, presunto, bacon, calabresa, milho, tomate, alface, maionese e mussarela.", g: 56.90, m: 52.90, min: null },
    { nome: "09 - X GAULÊS", desc: "Hambúrguer, bacon, ovo, bacon, presunto, mussarela, tomate, alface e maionese.", g: 53.90, m: 48.90, min: null },
    { nome: "10 - X COMPLETO", desc: "Hambúrguer, ovo, calabresa, ovo, Queijo, tomate, alface e maionese.", g: 45.90, m: 42.90, min: null },
    { nome: "11 - X CASARÃO", desc: "Hambúrguer, calabresa, ovo, Queijo, tomate, alface e maionese.", g: 45.90, m: 42.90, min: null },
  ];

  for (const p of hamburgueres) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.desc,
        preco: p.g,
        precoMedio: p.m,
        precoMini: p.min,
        empresaId: empresa.id,
        categoriaId: catHamb.id,
      },
    });
  }
  console.log(`${hamburgueres.length} hambúrgueres criados`);

  // Frango
  const frangos = [
    { nome: "13 - X FRANGO", desc: "Frango, mussarela, tomate, alface e maionese.", g: 48.90, m: 43.90, min: 32.90 },
    { nome: "14 - FRANBACON", desc: "Frango, bacon, mussarela, tomate e maionese.", g: 51.90, m: 46.90, min: null },
    { nome: "15 - AMERICANO FRANGO", desc: "Frango, alface, ovo, tomate, mussarela e maionese.", g: 49.90, m: 44.90, min: 34.90 },
    { nome: "17 - FRANBURGUER", desc: "Frango, hambúrguer, bacon, presunto, mussarela, tomate e maionese.", g: 59.90, m: 54.90, min: null },
    { nome: "18 - FRANGO CALABRESA", desc: "Frango, calabresa, queijo, alface e maionese", g: 51.90, m: 46.90, min: null },
    { nome: "19 - FRANGO PRESUNTO", desc: "Frango, presunto, queijo, alface e maionese", g: 51.90, m: 46.90, min: null },
    { nome: "20 - X TUDO FRANGO", desc: "Frango, calabresa, ovo, milho, tomate, alface, mussarela e maionese.", g: 66.90, m: 59.90, min: null },
  ];

  for (const p of frangos) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.desc,
        preco: p.g,
        precoMedio: p.m,
        precoMini: p.min,
        empresaId: empresa.id,
        categoriaId: catFrango.id,
      },
    });
  }
  console.log(`${frangos.length} franagos criados`);

  // Tradicionais
  const tradicionais = [
    { nome: "30 - BAURU", desc: "Presunto, mussarela, tomate e maionese.", g: 37.90, m: 33.90, min: 24.90 },
    { nome: "31 - MISTO", desc: "Presunto e mussarela.", g: 37.90, m: 33.90, min: 24.90 },
    { nome: "33 - VEGETARIANO", desc: "Mussarela, ovo, milho, alface, alface e maionese", g: 40.90, m: 37.90, min: null },
    { nome: "34 - AMERICANO COMUM", desc: "Presunto, alface, ovo, tomate, mussarela e maionese.", g: 40.90, m: 37.90, min: null },
  ];

  for (const p of tradicionais) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.desc,
        preco: p.g,
        precoMedio: p.m,
        precoMini: p.min,
        empresaId: empresa.id,
        categoriaId: catTrad.id,
      },
    });
  }
  console.log(`${tradicionais.length} tradicionais criados`);

  // Filé
  const files = [
    { nome: "21 - PAULISTA", desc: "Filé, ovo, presunto, alface, tomate e maionese.", g: 89.90, m: 84.90 },
    { nome: "22 - FILÉ ACEBOLADO", desc: "Filé, cebola, mussarela, tomate e maionese.", g: 90.90, m: 85.90 },
    { nome: "23 - FILÉ CALABRESA", desc: "Filé, calabresa, queijo, alface e maionese", g: 94.90, m: 86.90 },
    { nome: "24 - FILÉ BACON", desc: "Filé, bacon, mussarela, tomate e maionese.", g: 94.90, m: 89.90 },
    { nome: "25 - AMERICANO ESPECIAL", desc: "Filé, ovo, bacon, presunto, alface, tomate, mussarela e maionese.", g: 97.90, m: 92.90 },
    { nome: "26 - AMERICANO CARNE", desc: "Filé, ovo, tomate, alface e maionese.", g: 91.90, m: 86.90 },
    { nome: "27 - VOLTA AO MUNDO", desc: "Filé, ovo, calabresa, queijo, presunto, tomate, alface e maionese.", g: 109.90, m: 99.90 },
    { nome: "28 - BAURU DE CARNE", desc: "Filé, presunto, queijo, alface e maionese", g: 92.90, m: 87.90 },
    { nome: "29 - CHURRASCO", desc: "Filé e maionese", g: 86.90, m: 82.90 },
  ];

  for (const p of files) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.desc,
        preco: p.g,
        precoMedio: p.m,
        precoMini: null,
        empresaId: empresa.id,
        categoriaId: catFile.id,
      },
    });
  }
  console.log(`${files.length} filés criados`);

  // Adicionais
  const adicionais = [
    { nome: "Catupiry", preco: 10.00 },
    { nome: "Cheddar", preco: 12.00 },
    { nome: "Milho", preco: 10.00 },
  ];

  for (const ad of adicionais) {
    await prisma.acompanhamento.create({
      data: {
        nome: ad.nome,
        preco: ad.preco,
        tipo: "ADICIONAL",
        empresaId: empresa.id,
        categorias: {
          connect: [{ id: catHamb.id }, { id: catFrango.id }, { id: catTrad.id }, { id: catFile.id }],
        },
      },
    });
  }
  console.log(`${adicionais.length} adicionais criados`);

  console.log("\n✓ Lanchão Lanches cadastrada com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
