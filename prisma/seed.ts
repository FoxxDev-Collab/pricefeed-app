import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Seed US States + Territories as Regions ──
  const states = [
    { name: "Alabama", state: "AL" },
    { name: "Alaska", state: "AK" },
    { name: "Arizona", state: "AZ" },
    { name: "Arkansas", state: "AR" },
    { name: "California", state: "CA" },
    { name: "Colorado", state: "CO" },
    { name: "Connecticut", state: "CT" },
    { name: "Delaware", state: "DE" },
    { name: "Florida", state: "FL" },
    { name: "Georgia", state: "GA" },
    { name: "Hawaii", state: "HI" },
    { name: "Idaho", state: "ID" },
    { name: "Illinois", state: "IL" },
    { name: "Indiana", state: "IN" },
    { name: "Iowa", state: "IA" },
    { name: "Kansas", state: "KS" },
    { name: "Kentucky", state: "KY" },
    { name: "Louisiana", state: "LA" },
    { name: "Maine", state: "ME" },
    { name: "Maryland", state: "MD" },
    { name: "Massachusetts", state: "MA" },
    { name: "Michigan", state: "MI" },
    { name: "Minnesota", state: "MN" },
    { name: "Mississippi", state: "MS" },
    { name: "Missouri", state: "MO" },
    { name: "Montana", state: "MT" },
    { name: "Nebraska", state: "NE" },
    { name: "Nevada", state: "NV" },
    { name: "New Hampshire", state: "NH" },
    { name: "New Jersey", state: "NJ" },
    { name: "New Mexico", state: "NM" },
    { name: "New York", state: "NY" },
    { name: "North Carolina", state: "NC" },
    { name: "North Dakota", state: "ND" },
    { name: "Ohio", state: "OH" },
    { name: "Oklahoma", state: "OK" },
    { name: "Oregon", state: "OR" },
    { name: "Pennsylvania", state: "PA" },
    { name: "Rhode Island", state: "RI" },
    { name: "South Carolina", state: "SC" },
    { name: "South Dakota", state: "SD" },
    { name: "Tennessee", state: "TN" },
    { name: "Texas", state: "TX" },
    { name: "Utah", state: "UT" },
    { name: "Vermont", state: "VT" },
    { name: "Virginia", state: "VA" },
    { name: "Washington", state: "WA" },
    { name: "West Virginia", state: "WV" },
    { name: "Wisconsin", state: "WI" },
    { name: "Wyoming", state: "WY" },
    { name: "District of Columbia", state: "DC" },
    { name: "Puerto Rico", state: "PR" },
    { name: "Guam", state: "GU" },
    { name: "US Virgin Islands", state: "VI" },
    { name: "American Samoa", state: "AS" },
    { name: "Northern Mariana Islands", state: "MP" },
  ];

  for (const s of states) {
    await prisma.region.upsert({
      where: { id: states.indexOf(s) + 1 },
      update: {},
      create: { name: s.name, state: s.state, zipCodes: [] },
    });
  }
  console.log(`Seeded ${states.length} regions`);

  // ── Seed Default System Settings ──
  const settings = [
    // Email
    { key: "smtp_enabled", value: "false", valueType: "bool", category: "email", description: "Enable SMTP email delivery", isSensitive: false },
    { key: "smtp_host", value: "", valueType: "string", category: "email", description: "SMTP server hostname", isSensitive: false },
    { key: "smtp_port", value: "587", valueType: "int", category: "email", description: "SMTP server port", isSensitive: false },
    { key: "smtp_user", value: "", valueType: "string", category: "email", description: "SMTP username", isSensitive: true },
    { key: "smtp_password", value: "", valueType: "encrypted", category: "email", description: "SMTP password", isSensitive: true },
    { key: "smtp_from_addr", value: "noreply@pricefeed.app", valueType: "string", category: "email", description: "From email address", isSensitive: false },
    { key: "smtp_from_name", value: "PriceFeed", valueType: "string", category: "email", description: "From display name", isSensitive: false },
    // General
    { key: "site_name", value: "PriceFeed", valueType: "string", category: "general", description: "Site name", isSensitive: false },
    { key: "site_description", value: "Community-driven grocery price comparison", valueType: "string", category: "general", description: "Site description", isSensitive: false },
    { key: "contact_email", value: "support@pricefeed.app", valueType: "string", category: "general", description: "Contact email", isSensitive: false },
    { key: "maintenance_mode", value: "false", valueType: "bool", category: "general", description: "Enable maintenance mode", isSensitive: false },
    // Auth
    { key: "allow_registration", value: "true", valueType: "bool", category: "auth", description: "Allow new user registrations", isSensitive: false },
    { key: "require_email_verify", value: "false", valueType: "bool", category: "auth", description: "Require email verification", isSensitive: false },
    { key: "min_password_length", value: "8", valueType: "int", category: "auth", description: "Minimum password length", isSensitive: false },
    { key: "session_timeout_hours", value: "24", valueType: "int", category: "auth", description: "Session timeout in hours", isSensitive: false },
    { key: "max_login_attempts", value: "5", valueType: "int", category: "auth", description: "Maximum login attempts before lockout", isSensitive: false },
    { key: "lockout_duration_minutes", value: "15", valueType: "int", category: "auth", description: "Account lockout duration in minutes", isSensitive: false },
    // Prices
    { key: "price_expiry_days", value: "7", valueType: "int", category: "prices", description: "Days before prices are considered stale", isSensitive: false },
    { key: "verification_threshold", value: "3", valueType: "int", category: "prices", description: "Verifications needed to mark as verified", isSensitive: false },
    { key: "allow_anonymous_prices", value: "true", valueType: "bool", category: "prices", description: "Allow anonymous price submissions", isSensitive: false },
    { key: "require_receipt", value: "false", valueType: "bool", category: "prices", description: "Require receipt for price submissions", isSensitive: false },
    { key: "max_price_deviation", value: "50", valueType: "int", category: "prices", description: "Max allowed price deviation percentage", isSensitive: false },
    // Reputation
    { key: "points_price_submission", value: "5", valueType: "int", category: "reputation", description: "Points for submitting a price", isSensitive: false },
    { key: "points_verification", value: "2", valueType: "int", category: "reputation", description: "Points for verifying a price", isSensitive: false },
    { key: "points_store_added", value: "10", valueType: "int", category: "reputation", description: "Points for adding a store", isSensitive: false },
    { key: "points_item_added", value: "3", valueType: "int", category: "reputation", description: "Points for adding an item", isSensitive: false },
    { key: "level_bronze", value: "100", valueType: "int", category: "reputation", description: "Points for Bronze level", isSensitive: false },
    { key: "level_silver", value: "500", valueType: "int", category: "reputation", description: "Points for Silver level", isSensitive: false },
    { key: "level_gold", value: "1000", valueType: "int", category: "reputation", description: "Points for Gold level", isSensitive: false },
    { key: "level_platinum", value: "5000", valueType: "int", category: "reputation", description: "Points for Platinum level", isSensitive: false },
    // API
    { key: "api_rate_limit", value: "60", valueType: "int", category: "api", description: "API requests per minute", isSensitive: false },
    { key: "cors_origins", value: "*", valueType: "string", category: "api", description: "Allowed CORS origins", isSensitive: false },
    { key: "enable_public_api", value: "true", valueType: "bool", category: "api", description: "Enable public API access", isSensitive: false },
    { key: "require_api_key", value: "true", valueType: "bool", category: "api", description: "Require API key for public access", isSensitive: false },
    // Captcha
    { key: "captcha_enabled", value: "false", valueType: "bool", category: "api", description: "Enable Cloudflare Turnstile CAPTCHA", isSensitive: false },
    { key: "captcha_site_key", value: "", valueType: "string", category: "api", description: "Turnstile site key", isSensitive: false },
    { key: "captcha_secret_key", value: "", valueType: "encrypted", category: "api", description: "Turnstile secret key", isSensitive: true },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${settings.length} system settings`);

  // ── Seed Default Admin User ──
  const adminEmail = process.env.ADMIN_EMAIL || "admin@pricefeed.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      username: "admin",
      role: "admin",
      emailVerified: true,
      reputationPoints: 0,
    },
  });
  console.log(`Seeded admin user: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
