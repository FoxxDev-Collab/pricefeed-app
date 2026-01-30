import type { SubscriptionTier } from "@prisma/client";

export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    items: number;
    stores: number;
    activeLists: number;
    priceSubmissionsPerMonth: number;
    receiptScansPerMonth: number;
    inventoryItems: number;
    multiStorePlan: boolean;
    priceHistoryDays: number;
    compareStores: number;
  }
> = {
  free: {
    items: 50,
    stores: 5,
    activeLists: 3,
    priceSubmissionsPerMonth: 50,
    receiptScansPerMonth: 3,
    inventoryItems: 25,
    multiStorePlan: false,
    priceHistoryDays: 30,
    compareStores: 3,
  },
  pro: {
    items: Infinity,
    stores: 25,
    activeLists: 20,
    priceSubmissionsPerMonth: 500,
    receiptScansPerMonth: 30,
    inventoryItems: 200,
    multiStorePlan: true,
    priceHistoryDays: 365,
    compareStores: 10,
  },
  business: {
    items: Infinity,
    stores: Infinity,
    activeLists: Infinity,
    priceSubmissionsPerMonth: Infinity,
    receiptScansPerMonth: Infinity,
    inventoryItems: Infinity,
    multiStorePlan: true,
    priceHistoryDays: Infinity,
    compareStores: Infinity,
  },
};

export const REPUTATION_LEVELS = {
  bronze: 100,
  silver: 500,
  gold: 1000,
  platinum: 5000,
} as const;

export function getReputationLevel(points: number): string {
  if (points >= REPUTATION_LEVELS.platinum) return "Platinum";
  if (points >= REPUTATION_LEVELS.gold) return "Gold";
  if (points >= REPUTATION_LEVELS.silver) return "Silver";
  if (points >= REPUTATION_LEVELS.bronze) return "Bronze";
  return "Newcomer";
}
