import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const produtos = [
  {
    nome: "32 - X Salada",
    descricao: "Hambúrguer artesanal, presunto, mussarela, tomate, alface e maionese.",
    preco: 40.00,
    precoMedio: 32.00,
  },
  {
    nome: "33 - X Bacon",
    descricao: "Hambúrguer artesanal, bacon, tomate, maionese, mussarela e alface.",
    preco: 47.00,
    precoMedio: 35.00,
  },
  {
    nome: "34 - X Egg",
    descricao: "Hambúrguer artesanal, ovo, mussarela, tomate, alface e maionese.",
    preco: 42.00,
    precoMedio: 34.00,
  },
  {
    nome: "35 - X Burguer",
    descricao: "Hambúrguer artesanal, tomate, maionese, mussarela e alface.",
    preco: 38.00,
    precoMedio: 31.00,
  },
  {
    nome: "36 - X Tudo Comum",
    descricao: "Hambúrguer artesanal, ovo, bacon, presunto, mussarela, tomate, alface e maionese.",
    preco: 55.00,
    precoMedio: null,
  },
  {
    nome: "37 - X Calabresa",
    descricao: "Hambúrguer artesanal, calabresa, tomate, maionese, mussarela e alface.",
    preco: 46.00,
    precoMedio: 35.00,
  },
  {
    nome: "38 - X Tudo Especial",
    descricao: "Hambúrguer artesanal, ovo, presunto, bacon, calabresa, milho, tomate, alface, maionese e mussarela.",
    preco: 62.00,
    precoMedio: null,
  },
  {
    nome: "39 - X Calabacon",
    descricao: "Hambúrguer artesanal, mussarela, bacon, calabresa, tomate, alface e maionese.",
    preco: 57.00,
    precoMedio: null,
  },
  {
    nome: "40 - Gauchinho",
    descricao: "Hambúrguer artesanal, bacon, ovo, mussarela, tomate, alface e maionese.",
    preco: 51.00,
    precoMedio: 41.00,
  },
  {
    nome: "41 - Franburguer",
    descricao: "Frango, hambúrguer artesanal, presunto, mussarela, tomate, maionese e alface.",
    preco: 60.00,
    precoMedio: null,
  },
  {
    nome: "42 - X Cala Tudo",
    descricao: "Hambúrguer artesanal, carne, frango, ovo, calabresa, bacon, presunto, milho, maionese, mussarela, tomate e alface.",
    preco: 86.00,
    precoMedio: null,
  },
];

async function main() {
  const empresa = await prisma.empresa.findUnique({ where: { slug: "lanches-paulista" } });
  if (!empresa) throw new Error("Empresa lanches-paulista não encontrada");

  const categoriaExistente = await prisma.categoria.findFirst({
    where: { empresaId: empresa.id, nome: "Hambúrgueres Artesanais" },
  });
  const categoria = categoriaExistente ?? await prisma.categoria.create({
    data: { nome: "Hambúrgueres Artesanais", empresaId: empresa.id },
  });

  console.log(`Categoria: ${categoria.nome} (${categoria.id})`);

  for (const p of produtos) {
    const criado = await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        precoMedio: p.precoMedio,
        empresaId: empresa.id,
        categoriaId: categoria.id,
      },
    });
    console.log(`  ✓ ${criado.nome}`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
