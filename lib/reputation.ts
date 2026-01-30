import { prisma } from "@/lib/db";
import { getReputationSettings } from "@/lib/settings";

export type ReputationAction =
  | "price_submission"
  | "verification"
  | "store_added"
  | "item_added";

const ACTION_KEY_MAP: Record<ReputationAction, string> = {
  price_submission: "pointsPriceSubmission",
  verification: "pointsVerification",
  store_added: "pointsStoreAdded",
  item_added: "pointsItemAdded",
};

/**
 * Award reputation points to a user for an action.
 * Reads point values from system settings.
 */
export async function addReputationPoints(
  userId: number,
  action: ReputationAction
) {
  const settings = await getReputationSettings();
  const key = ACTION_KEY_MAP[action] as keyof typeof settings;
  const points = settings[key] as number;

  if (points <= 0) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationPoints: { increment: points },
    },
  });
}

/**
 * Get the reputation level name for a given point total.
 */
export async function getReputationLevel(points: number): Promise<string> {
  const s = await getReputationSettings();

  if (points >= s.levelPlatinum) return "Platinum";
  if (points >= s.levelGold) return "Gold";
  if (points >= s.levelSilver) return "Silver";
  if (points >= s.levelBronze) return "Bronze";
  return "Newcomer";
}

/**
 * Get level info for display (name + progress to next level).
 */
export async function getReputationInfo(points: number) {
  const s = await getReputationSettings();

  const levels = [
    { name: "Newcomer", min: 0 },
    { name: "Bronze", min: s.levelBronze },
    { name: "Silver", min: s.levelSilver },
    { name: "Gold", min: s.levelGold },
    { name: "Platinum", min: s.levelPlatinum },
  ];

  let currentLevel = levels[0];
  let nextLevel: (typeof levels)[0] | null = null;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] ?? null;
      break;
    }
  }

  return {
    level: currentLevel.name,
    points,
    nextLevel: nextLevel?.name ?? null,
    pointsToNextLevel: nextLevel ? nextLevel.min - points : 0,
    progress: nextLevel
      ? Math.round(
          ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) *
            100
        )
      : 100,
  };
}
