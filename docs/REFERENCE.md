# inner-edge — Reference

> Source-of-truth reference for inner-edge. Keep it current; `CLAUDE.md` points every new session here.

## 1. Overview
Inner Edge Scalping — futures trading education community. Long-term goal is replacing GoHighLevel/Discord/Stripe with a custom stack; the user's global CLAUDE.md describes an original direction (Next.js + Supabase + Clerk + Stripe + Stream + Mux + Cal.com) but that has NOT been re-confirmed for this restart — treat as background context only, not a decision.

**This is a fresh restart (2026-07-30).** The prior build (`ies-platform`) was fully deleted — local dir, GitHub repo, Vercel project, and Supabase tables all confirmed gone. Nothing carries over automatically; re-verify any assumption from the old build before relying on it.

## 2. Stack & accounts
**Full-platform stack: TBD, deliberately deferred** — not deciding today. Today's scope is just the frontend sales/landing page (see §5).
<!-- If using Supabase: this project shares the single "internal-prod" project with every other IBS/personal project. Before adding tables, check existing table names to avoid collisions and prefix new tables with this project's slug (e.g. `inner-edge_widgets` not `widgets`). Every table needs a scoping column and RLS enabled. No inner-edge/ies-prefixed tables exist in internal-prod as of 2026-07-30 (checked when scaffolding this project) — clear to use. -->

## 3. Architecture
<!-- High-level shape, data model, multi-tenancy, key decisions. -->

## 4. What's built
<!-- Done so far. -->

## 5. What's next
**Today's priority: build the frontend sales/landing page only.** Full platform (auth, payments, community/chat, courses, etc.) is out of scope until the stack decision happens.

## 6. Conventions
<!-- Naming, patterns, security rules, gotchas. -->

## 7. Open decisions
- Full-platform stack: same as the old plan (Next.js + Supabase + Clerk + Stripe + Stream + Mux + Cal.com) or something different? Deferred, to be revisited after the sales page ships.
