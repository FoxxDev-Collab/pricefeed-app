import { getPriceSettings } from "@/lib/settings";

/**
 * Check if a price is considered stale based on its submission date.
 */
export async function isPriceStale(submittedAt: Date): Promise<boolean> {
  const { priceExpiryDays } = await getPriceSettings();
  const ageMs = Date.now() - submittedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > priceExpiryDays;
}

/**
 * Check if a price has been verified by enough users.
 */
export async function isPriceVerified(verificationCount: number): Promise<boolean> {
  const { verificationThreshold } = await getPriceSettings();
  return verificationCount >= verificationThreshold;
}

/**
 * Check if a submitted price deviates too much from the average.
 * Returns true if the price is within acceptable deviation.
 */
export async function isPriceWithinDeviation(
  newPrice: number,
  averagePrice: number
): Promise<boolean> {
  if (averagePrice <= 0) return true; // no baseline to compare
  const { maxPriceDeviation } = await getPriceSettings();
  const deviationPercent =
    Math.abs((newPrice - averagePrice) / averagePrice) * 100;
  return deviationPercent <= maxPriceDeviation;
}

/**
 * Get all price validation rules for use in submission forms.
 */
export async function getPriceValidationRules() {
  const settings = await getPriceSettings();
  return {
    requireReceipt: settings.requireReceipt,
    allowAnonymous: settings.allowAnonymousPrices,
    maxDeviationPercent: settings.maxPriceDeviation,
  };
}
