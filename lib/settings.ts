import { prisma } from "@/lib/db";

// In-memory cache with TTL to avoid hitting DB on every request
let settingsCache: Map<string, string | null> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

async function loadSettings(): Promise<Map<string, string | null>> {
  const now = Date.now();
  if (settingsCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return settingsCache;
  }

  const rows = await prisma.systemSetting.findMany();
  const map = new Map<string, string | null>();
  for (const row of rows) {
    map.set(row.key, row.value);
  }

  settingsCache = map;
  cacheTimestamp = now;
  return map;
}

/** Invalidate the settings cache (call after admin updates settings) */
export function invalidateSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
}

/** Get a raw string setting value */
export async function getSetting(key: string): Promise<string | null> {
  const map = await loadSettings();
  return map.get(key) ?? null;
}

/** Get a boolean setting (defaults to false) */
export async function getBoolSetting(key: string): Promise<boolean> {
  const val = await getSetting(key);
  return val === "true";
}

/** Get an integer setting (defaults to provided fallback) */
export async function getIntSetting(key: string, fallback: number = 0): Promise<number> {
  const val = await getSetting(key);
  if (val === null || val === "") return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/** Get multiple settings at once as a typed object */
export async function getSettingsMap(keys: string[]): Promise<Record<string, string | null>> {
  const map = await loadSettings();
  const result: Record<string, string | null> = {};
  for (const key of keys) {
    result[key] = map.get(key) ?? null;
  }
  return result;
}

// ── Typed setting accessors for each category ──

export async function getAuthSettings() {
  return {
    allowRegistration: await getBoolSetting("allow_registration"),
    requireEmailVerify: await getBoolSetting("require_email_verify"),
    minPasswordLength: await getIntSetting("min_password_length", 8),
    sessionTimeoutHours: await getIntSetting("session_timeout_hours", 24),
    maxLoginAttempts: await getIntSetting("max_login_attempts", 5),
    lockoutDurationMinutes: await getIntSetting("lockout_duration_minutes", 15),
  };
}

export async function getGeneralSettings() {
  return {
    siteName: (await getSetting("site_name")) || "PriceFeed",
    siteDescription: (await getSetting("site_description")) || "Community-driven grocery price comparison",
    contactEmail: (await getSetting("contact_email")) || "support@pricefeed.app",
    maintenanceMode: await getBoolSetting("maintenance_mode"),
  };
}

export async function getEmailSettings() {
  return {
    smtpEnabled: await getBoolSetting("smtp_enabled"),
    smtpHost: (await getSetting("smtp_host")) || "",
    smtpPort: await getIntSetting("smtp_port", 587),
    smtpUser: (await getSetting("smtp_user")) || "",
    smtpPassword: (await getSetting("smtp_password")) || "",
    fromAddr: (await getSetting("smtp_from_addr")) || "noreply@pricefeed.app",
    fromName: (await getSetting("smtp_from_name")) || "PriceFeed",
  };
}

export async function getPriceSettings() {
  return {
    priceExpiryDays: await getIntSetting("price_expiry_days", 7),
    verificationThreshold: await getIntSetting("verification_threshold", 3),
    allowAnonymousPrices: await getBoolSetting("allow_anonymous_prices"),
    requireReceipt: await getBoolSetting("require_receipt"),
    maxPriceDeviation: await getIntSetting("max_price_deviation", 50),
  };
}

export async function getReputationSettings() {
  return {
    pointsPriceSubmission: await getIntSetting("points_price_submission", 5),
    pointsVerification: await getIntSetting("points_verification", 2),
    pointsStoreAdded: await getIntSetting("points_store_added", 10),
    pointsItemAdded: await getIntSetting("points_item_added", 3),
    levelBronze: await getIntSetting("level_bronze", 100),
    levelSilver: await getIntSetting("level_silver", 500),
    levelGold: await getIntSetting("level_gold", 1000),
    levelPlatinum: await getIntSetting("level_platinum", 5000),
  };
}

export async function getApiSettings() {
  return {
    apiRateLimit: await getIntSetting("api_rate_limit", 60),
    corsOrigins: (await getSetting("cors_origins")) || "*",
    enablePublicApi: await getBoolSetting("enable_public_api"),
    requireApiKey: await getBoolSetting("require_api_key"),
    captchaEnabled: await getBoolSetting("captcha_enabled"),
    captchaSiteKey: (await getSetting("captcha_site_key")) || "",
    captchaSecretKey: (await getSetting("captcha_secret_key")) || "",
  };
}

export async function getMapsSettings() {
  return {
    googleApiKey: (await getSetting("google_api_key_maps")) || "",
  };
}

export async function getStorageSettings() {
  return {
    blobStoreToken: (await getSetting("blob_store_token")) || "",
  };
}
