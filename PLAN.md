# PriceFeed App — Development Plan

> Community-driven grocery price comparison platform.
> **Stack:** Next.js 16 (App Router) · Prisma · PostgreSQL · NextAuth · Tailwind + shadcn/ui · TypeScript

---

## Architecture Overview

```
app/
├── (marketing)/        # Public: home, pricing
├── (auth)/             # User auth: login, register, verify-email
├── (admin-auth)/       # Admin auth: admin/login
├── (admin)/            # Admin dashboard (sidebar layout)
│   └── admin/
│       ├── page.tsx        # Dashboard overview
│       ├── users/          # User CRUD
│       ├── stores/         # Store CRUD
│       ├── items/          # Item CRUD
│       ├── prices/         # Price CRUD
│       ├── regions/        # Region CRUD
│       └── settings/       # SystemSetting editor
├── (app)/              # Authenticated user pages (sidebar + MaintenanceGate)
│   └── dashboard/
├── maintenance/        # Standalone maintenance page
└── api/auth/           # NextAuth route handler
```

### Key Subsystems
- **Settings engine** — `lib/settings.ts` — DB-backed with 30s in-memory cache; typed accessors per category.
- **Auth** — NextAuth credentials provider; JWT w/ role, subscriptionTier, username; lockout after N failed attempts.
- **Reputation** — Points-based (submissions, verifications, store/item adds); Bronze→Platinum tiers.
- **Middleware** — Route protection: public → admin-login → auth-pages → admin → protected app routes.

---

## Phase 1 — Admin Foundation ✅ COMPLETE

### 1.1 Admin Settings System ✅
- [x] `SystemSetting` model (key/value/category/valueType/isSensitive)
- [x] `lib/settings.ts` with typed getters for all categories
- [x] Seed script for all default settings (39 settings)
- [x] Admin settings page with `SettingsForm` (grouped by category, masks sensitive values)
- [x] `updateSettings` server action with cache invalidation

### 1.2 Admin Dashboard ✅
- [x] Stats cards (users, stores, items, prices, receipts, lists, inventory, activity)
- [x] Recent signups list
- [x] Recent activity feed (PriceFeed entries)

### 1.3 Admin CRUD Pages ✅
- [x] Users — search, paginate, role badges, subscription tier, lock/unlock, delete
- [x] Stores — search, paginate, verify toggle, delete
- [x] Items — search, paginate, verify toggle, delete
- [x] Prices — search, paginate, delete
- [x] Regions — search, paginate, create/edit dialog, delete

### 1.4 Admin Auth & Middleware ✅
- [x] Separate `/admin/login` page (destructive-themed)
- [x] `adminLoginUser` server action (role pre-check)
- [x] Middleware: admin routes require `role === "admin"`

### 1.5 Settings Categories Seeded ✅
| Category    | Keys |
|-------------|------|
| auth        | allowRegistration, requireEmailVerify, minPasswordLength, sessionTimeoutHours, maxLoginAttempts, lockoutDurationMinutes |
| general     | siteName, siteDescription, contactEmail, maintenanceMode |
| email       | smtpHost, smtpPort, smtpUser, smtpPassword, fromEmailAddress, fromEmailName |
| price       | priceExpiryDays, verificationThreshold, allowAnonymousPrices, requireReceipt, maxPriceDeviation |
| reputation  | pointsPerSubmission, pointsPerVerification, pointsPerStoreAdd, pointsPerItemAdd, levelBronze, levelSilver, levelGold, levelPlatinum |
| api         | rateLimit, corsOrigins, enablePublicApi, requireApiKey, enableCaptcha, captchaSiteKey, captchaSecretKey |
| maps        | googleMapsApiKey |
| storage     | blobStoreToken |

### 1.6 Auth Hardening ✅
- [x] Failed login tracking (`failedLoginAttempts`, `lockedUntil` on User)
- [x] Configurable lockout (maxLoginAttempts, lockoutDurationMinutes from settings)
- [x] Admin unlock action
- [x] Registration gated by `allowRegistration` setting
- [x] Password length enforced by `minPasswordLength` setting
- [x] MaintenanceGate in `(app)` layout — redirects non-admin users to `/maintenance`

---

## Phase 2 — User-Facing App (Planned)

### 2.1 Dashboard
- [ ] Personalized stats (prices submitted, lists, reputation)
- [ ] Nearby store highlights
- [ ] Recent price changes in user's region

### 2.2 Store Management
- [ ] Browse/search stores
- [ ] Add new store (with Google Maps integration)
- [ ] Store detail page (prices, verified status)
- [ ] Store verification flow (community vote)

### 2.3 Item Catalog
- [ ] Browse/search items by name, brand, tag
- [ ] Add new items
- [ ] Item detail page (price history chart, stores carrying it)
- [ ] Tag management

### 2.4 Price Submissions
- [ ] Submit price for item at store
- [ ] Price verification flow (confirm/deny other users' prices)
- [ ] Price history tracking
- [ ] Price deviation warnings

### 2.5 Shopping Lists
- [ ] Create/manage lists
- [ ] Add items with quantities
- [ ] Store plan optimization (cheapest store combo)
- [ ] Share lists via token

### 2.6 Receipt OCR
- [ ] Upload receipt image (Vercel Blob storage)
- [ ] OCR processing pipeline
- [ ] Match extracted items to catalog
- [ ] Confirm/correct matches
- [ ] Auto-create price entries from confirmed matches

### 2.7 Inventory Tracking
- [ ] Track items at home
- [ ] Expiration date alerts
- [ ] Low stock warnings
- [ ] Auto-suggest shopping list from low stock

### 2.8 Reputation & Gamification
- [ ] Points display on profile
- [ ] Level badges (Bronze → Platinum)
- [ ] Leaderboard
- [ ] Activity history

---

## Phase 3 — Advanced Features (Planned)

### 3.1 Regions & Location
- [ ] Region-based price filtering
- [ ] Zip code → region mapping
- [ ] Google Maps store locator

### 3.2 Price Comparison Tools
- [ ] Compare item prices across stores
- [ ] Weekly deal highlights
- [ ] Price trend analysis

### 3.3 Spending Analytics
- [ ] Monthly spending breakdown
- [ ] Category-based spending
- [ ] Savings tracking (vs. average prices)

### 3.4 Social Features
- [ ] Price feed (activity stream)
- [ ] Follow stores
- [ ] Community price alerts

### 3.5 API & Integrations
- [ ] Public API (gated by settings)
- [ ] API key management
- [ ] Rate limiting
- [ ] CAPTCHA on public forms

### 3.6 Email System
- [ ] Transactional emails (verification, password reset)
- [ ] Price drop alerts
- [ ] Weekly digest

---

## Known Issues / TODO

- [ ] **Redirect loop on /admin** — Likely stale session cookie; clear cookies and re-login. If persists, inspect Network tab redirect chain.
- [ ] **Next.js 16 middleware deprecation warning** — "middleware" convention is deprecated in favor of "proxy". Migration needed eventually.
- [ ] `generateMetadata` in root layout reverted to static (was async DB call causing issues). Site name/description currently hardcoded in metadata.

---

## Database Migrations Applied

1. `init` — Base schema (User, Store, Item, StorePrice, etc.)
2. `add_system_settings` — SystemSetting model
3. `add_login_lockout` — failedLoginAttempts + lockedUntil on User

---

## Dev Commands

```bash
npx next dev --turbopack      # Dev server
npx next build                # Production build
npx prisma generate           # Regenerate Prisma client (after schema changes)
npx prisma migrate dev        # Run migrations
npx prisma db seed             # Seed default settings
```
