import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        senha: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { empresa: true },
        });

        if (!usuario) return null;

        const senhaValida = await bcrypt.compare(
          credentials.senha as string,
          usuario.senha
        );

        if (!senhaValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          empresaId: usuario.empresaId,
          empresaNome: usuario.empresa.nome,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.empresaId = user.empresaId;
        token.empresaNome = user.empresaNome;
      }
      return token;
    },
    session({ session, token }) {
      session.user.empresaId = token.empresaId as string;
      session.user.empresaNome = token.empresaNome as string;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});
