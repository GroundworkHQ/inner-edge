# inner-edge — Claude Code context

## Read first
Before working, read **`docs/REFERENCE.md`** — the source of truth for this project. This file is just the quick orientation.

## What this is
Fresh restart of the Inner Edge Scalping platform (futures trading education community). The prior attempt (`ies-platform`) was fully deleted — local, GitHub, Vercel, Supabase all confirmed gone — this is a clean start, not a continuation.

## Stack
TBD — deliberately deferred. Full-platform stack (framework/DB/auth/payments/etc.) will be decided later; not settled yet, don't assume the old plan carries over.

## Conventions & rules
- Secrets live in env vars / `.env.local` only, never in code. `.env.local` is gitignored. Rotate immediately if exposed.
- Commit + push at the end of each session to back up. Commit messages end with the Co-Authored-By line.
<!-- Add project-specific rules, naming conventions, and gotchas here. -->

## Current priority
Build the frontend sales/landing page. This is the only in-scope work right now — full platform stack decisions come later.
