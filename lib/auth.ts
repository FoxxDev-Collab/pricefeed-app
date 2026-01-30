import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators/auth";
import type { Role, SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    subscriptionTier: SubscriptionTier;
    username: string | null;
    isEmailVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      subscriptionTier: SubscriptionTier;
      username: string | null;
      isEmailVerified: boolean;
    };
  }
}

// JWT type is extended via the next-auth module augmentation above
// The jwt callback below handles adding custom fields to the token

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: String(user.id),
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          username: user.username,
          isEmailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
        token.username = user.username;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
      session.user.username = token.username as string | null;
      session.user.isEmailVerified = token.isEmailVerified as boolean;
      return session;
    },
  },
});
