import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { randomBytes } from "crypto";

const COOKIE = "sa-session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function createSASession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + SESSION_MS);
  await prisma.superAdmin.update({
    where: { id: adminId },
    data: { sessionToken: token, sessionExpiry: expiry },
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiry,
    path: "/",
  });
}

export async function getSASession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const admin = await prisma.superAdmin.findUnique({ where: { sessionToken: token } });
  if (!admin || !admin.sessionExpiry || admin.sessionExpiry < new Date()) return null;
  return admin;
}

export async function destroySASession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.superAdmin.updateMany({
      where: { sessionToken: token },
      data: { sessionToken: null, sessionExpiry: null },
    });
  }
  jar.delete(COOKIE);
}
