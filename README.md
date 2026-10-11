# HIVE 🐝 — Shop smarter. Choose better.

> **Hackathon Product Engineering Solution**  
> *"Existing platforms help people buy. HIVE helps people decide where to buy."*

HIVE is a personalized shopping decision-support platform that compares online quick-commerce options (Blinkit, Zepto, Instamart, Amazon Fresh) with nearby local kirana stores and recommends the smartest purchase option.

---

## 🌟 The Core Capabilities

HIVE solves the dilemma of modern grocery purchasing across **Three Horizons**:
1. **Online Quick Commerce**: Doorstep convenience, platform fees, order delivery charges.
2. **Nearby Local Kirana Stores**: Immediate in-hand fulfillment, neighborhood support, zero delivery markups.
3. **HIVE Hybrid Shopping Optimizer**: Multi-product basket optimizer that splits your shopping list across channels to minimize total household spend while accounting for single-order delivery fees and local travel.

---

## 🎨 Design System

Built strictly according to HIVE's clean, modern visual identity:
- **Main Background**: Pure White (`#FFFFFF`)
- **Primary Green**: `#198754`
- **Dark Green**: `#146C43`
- **Pale Green Surfaces**: `#EAF7EE`
- **Text**: Dark Charcoal (`#1F2937`)
- **Borders**: Light Grey (`#E5E7EB`)
- **Subtle Bee Identity**: Honeycomb accents, bee icon badge, and clean rounded cards.

---

## 🏗 Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Charts & Insights**: Recharts
- **Database & ORM**: Prisma ORM with SQLite (zero-configuration local execution) and seamless PostgreSQL support
- **State & Forms**: React Hook Form, Zod
- **Deterministic Math Engine**: Precision-safe integer paise currency representation (100 paise = ₹1)

---

## 📐 The Recommendation Algorithm & Scoring Engine

HIVE uses a **deterministic, explainable mathematical scoring model** (0 to 100):

### 1. Effective Cost Formula
```
Online Effective Cost = Product Price + Delivery Fee + Service Fee − Platform Discounts
Kirana Effective Cost = Product Price + Estimated Travel Cost − Local Store Discounts
```
- **Travel Cost**: Configurable by transport mode:
  - Walking: ₹0
  - Two-Wheeler: ₹5/km × 2 (round trip)
  - Four-Wheeler: ₹12/km × 2 (round trip)

### 2. Feasibility Constraint
Availability is a strict prerequisite. If an option is out of stock, its suitability score is set to 0 and it cannot be recommended.

### 3. Normalized Factor Scoring (0–100)
- **Cost Factor**: Normalized relative to cost delta: 100 for cheaper, dropping proportionally as price increases.
- **Fulfillment Time Factor**: Scaled from 100 for instant fulfillment (3–5 mins) down to 20 for multi-hour deliveries.
- **Convenience Factor**: Doorstep delivery vs. stepping out.
- **Distance Factor**: Scaled based on physical proximity.
- **Trust & Quality Factor**: Store rating + verified audit bonus + user's personal trust status.

### 4. Dynamic Weight Tuning
Users can tune priorities in real time:
- **Lowest Cost**: 55% Cost weight
- **Fastest Time**: 50% Time weight
- **Urgency = "Right Now"**: Shifts 65% weight to fulfillment speed

---

## 🐝 HIVE Hybrid Shopping Optimizer

When buying a multi-item grocery list:
- Evaluates 3 scenarios:
  1. **All-Online Basket** (order delivery fee charged once per basket)
  2. **All-Local Kirana Basket** (single travel trip)
  3. **Optimized Hybrid Basket** (buys bulk/discounted items online and staples locally)
- Generates an item-by-item allocation plan with transparent trade-off explanations.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database & Seed Demo Data
```bash
pnpm run db:setup
```
*(Runs `prisma generate`, `prisma db push`, and seeds realistic Pune kirana stores and Indian grocery products).*

### 3. Run Unit Tests
```bash
pnpm test
```
Verifies:
- Acceptance Test 1 kg Rice (Online ₹100 vs Kirana ₹82)
- Feasibility constraints on out-of-stock items
- Urgency and priority dynamic recalculation
- Multi-product hybrid basket optimization

### 4. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Quick Hackathon Evaluation Guide

Use the **Role Switcher** in the top navigation bar to test all user personas with 1 click:
1. **Shopper (Aarav)**: Test product search, side-by-side comparison, and hybrid basket optimization.
2. **Store Owner (Ramesh)**: Access `/store-owner` to adjust Apna Kirana's inventory, change prices, and view live comparison impact.
3. **Administrator**: Access `/admin` to view master catalog items, stores, and registered users.

### Section 25 Acceptance Test Verification
- Click **"Test 1 kg Rice Comparison (Section 25)"** in the top banner:
  - Online: ₹80 + ₹20 delivery = **₹100** (25 mins)
  - Apna Kirana: ₹82 + ₹0 travel = **₹82** (4 mins, 350m)
  - Verdict: **Kirana recommended (Save ₹18, 21 mins faster)**.
  - Change Urgency to "Right now" or Priority to "Fastest Fulfillment" to see live weight re-balancing!

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="hive-session-secret-key-32chars-min-hackathon"
NEXTAUTH_URL="http://localhost:3000"
DEMO_MODE="true"
NEXT_PUBLIC_MAPS_ENABLED="false"
```
*(To switch to PostgreSQL, set `DATABASE_URL="postgresql://user:pass@localhost:5432/hivedb?schema=public"` and change `provider = "postgresql"` in `prisma/schema.prisma`)*.
