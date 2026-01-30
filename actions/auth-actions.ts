"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators/auth";
import { getAuthSettings } from "@/lib/settings";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(formData: FormData): Promise<AuthResult> {
  // Check if registration is allowed
  const authSettings = await getAuthSettings();
  if (!authSettings.allowRegistration) {
    return { success: false, error: "Registration is currently disabled" };
  }

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

  // Enforce min password length from settings (may be stricter than Zod default)
  if (password.length < authSettings.minPasswordLength) {
    return {
      success: false,
      error: `Password must be at least ${authSettings.minPasswordLength} characters`,
    };
  }

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
      emailVerified: !authSettings.requireEmailVerify,
    },
  });

  return { success: true };
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check lockout before attempting login
  const authSettings = await getAuthSettings();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, failedLoginAttempts: true, lockedUntil: true },
  });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000
    );
    return {
      success: false,
      error: `Account locked. Try again in ${minutesLeft} minute(s).`,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Reset failed attempts on successful login
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // Increment failed attempts
      if (user) {
        const newAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockout =
          newAttempts >= authSettings.maxLoginAttempts
            ? new Date(Date.now() + authSettings.lockoutDurationMinutes * 60000)
            : null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            lockedUntil: lockout,
          },
        });

        if (lockout) {
          return {
            success: false,
            error: `Too many failed attempts. Account locked for ${authSettings.lockoutDurationMinutes} minutes.`,
          };
        }
      }

      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function adminLoginUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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
