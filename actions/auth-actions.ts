"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    username: formData.get("username") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const { email, password, username } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { success: false, error: "An account with this email already exists" };
    }
    return { success: false, error: "This username is already taken" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      role: "user",
      emailVerified: false,
    },
  });

  return { success: true };
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function adminLoginUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Pre-check: verify the user exists and has an admin role before signing in
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    return { success: false, error: "Access denied" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid credentials" };
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirect: false });
}
