import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const usuario = await prisma.usuario.update({
    where: { email: "admin@lanchao.com" },
    data: { senha: senhaHash },
  });

  console.log(`✓ Senha do usuário ${usuario.email} criptografada com sucesso!`);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
