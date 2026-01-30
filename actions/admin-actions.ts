"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { invalidateSettingsCache } from "@/lib/settings";
import { sendTestEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// ── User Management ──

export async function updateUserRole(userId: number, role: "user" | "admin" | "moderator") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function toggleUserEmailVerified(userId: number) {
  await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: !user.emailVerified },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: number) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function updateUserSubscription(userId: number, tier: "free" | "pro" | "business") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { subscriptionTier: tier } });
  revalidatePath("/admin/users");
}

// ── Store Management ──

export async function verifyStore(storeId: number) {
  await requireAdmin();
  await prisma.store.update({
    where: { id: storeId },
    data: { verified: true, verificationCount: { increment: 1 } },
  });
  revalidatePath("/admin/stores");
}

export async function toggleStorePrivacy(storeId: number) {
  await requireAdmin();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  await prisma.store.update({
    where: { id: storeId },
    data: { isPrivate: !store.isPrivate },
  });
  revalidatePath("/admin/stores");
}

export async function deleteStore(storeId: number) {
  await requireAdmin();
  await prisma.store.delete({ where: { id: storeId } });
  revalidatePath("/admin/stores");
}

// ── Item Management ──

export async function verifyItem(itemId: number) {
  await requireAdmin();
  await prisma.item.update({
    where: { id: itemId },
    data: { verified: true, verificationCount: { increment: 1 } },
  });
  revalidatePath("/admin/items");
}

export async function toggleItemPrivacy(itemId: number) {
  await requireAdmin();
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });
  await prisma.item.update({
    where: { id: itemId },
    data: { isPrivate: !item.isPrivate },
  });
  revalidatePath("/admin/items");
}

export async function deleteItem(itemId: number) {
  await requireAdmin();
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath("/admin/items");
}

// ── Price Management ──

export async function deletePrice(priceId: number) {
  await requireAdmin();
  await prisma.storePrice.delete({ where: { id: priceId } });
  revalidatePath("/admin/prices");
}

// ── Region Management ──

export async function createRegion(data: { name: string; state: string; zipCodes: string[] }) {
  await requireAdmin();
  await prisma.region.create({ data });
  revalidatePath("/admin/regions");
}

export async function updateRegion(regionId: number, data: { name?: string; state?: string; zipCodes?: string[] }) {
  await requireAdmin();
  await prisma.region.update({ where: { id: regionId }, data });
  revalidatePath("/admin/regions");
}

export async function deleteRegion(regionId: number) {
  await requireAdmin();
  await prisma.region.delete({ where: { id: regionId } });
  revalidatePath("/admin/regions");
}

// ── Settings Management ──

export async function getSettingsByCategory(category: string) {
  await requireAdmin();
  return prisma.systemSetting.findMany({
    where: { category },
    orderBy: { key: "asc" },
  });
}

export async function updateSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.systemSetting.update({
    where: { key },
    data: { value },
  });
  invalidateSettingsCache();
  revalidatePath("/admin/settings");
}

export async function updateSettings(settings: { key: string; value: string }[]) {
  await requireAdmin();
  await prisma.$transaction(
    settings.map((s) =>
      prisma.systemSetting.update({
        where: { key: s.key },
        data: { value: s.value },
      })
    )
  );
  invalidateSettingsCache();
  revalidatePath("/admin/settings");
}

// ── Admin Test Actions ──

export async function adminSendTestEmail(to: string) {
  const admin = await requireAdmin();
  const result = await sendTestEmail(to || admin.email);
  return result;
}

export async function adminUnlockUser(userId: number) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  revalidatePath("/admin/users");
}
