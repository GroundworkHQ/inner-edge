# inner-edge — Reference

> Source-of-truth reference for inner-edge. Keep it current; `CLAUDE.md` points every new session here.

## 1. Overview
**Inner Edge Scalping** — a **Forex** (FX) scalping education community run by **Wendy & Lee**, sold as one membership at **$77/mo**.

**This is Forex, not futures.** Miguel's global CLAUDE.md previously called it a "futures trading education community"; confirmed wrong and corrected at the source on 2026-08-03. Everything in the actual product is FX: the course teaches an FX strategy, charts are CADCHF on OANDA, execution is MT5 / TradeLocker.

**This is a fresh restart (2026-07-30).** The prior build (`ies-platform`) was fully deleted — local dir, GitHub repo, Vercel project and Supabase tables all confirmed gone. Nothing carries over; re-verify any assumption from the old build.

**Current scope is the marketing/sales page only.** The full platform (auth, payments, community) is deliberately deferred.

## 2. Stack & accounts
- **This site:** plain static HTML/CSS/JS. No framework, no build step, no dependencies. `index.html` + `css/styles.css` + `js/main.js` + `assets/`.
- **Hosting:** GitHub Pages on `GroundworkHQ/inner-edge` (public), proxied to **https://miguelloza.com/inner-edge/** by a rewrite in `miguelloza-forwards/vercel.json`. Push here → live in ~30s. No file sync, no `<base href>`. See the `apex-site-flow` memory note, or run `/publish inner-edge`.
- **Full-platform stack: still TBD.** Not decided.
- **Their existing systems** (not built by us): course platform at `members.inneredgescalping.com`, private Discord server, TradingView (the "IES Indicator"), MT5 / TradeLocker, FTMO for prop funding.
- Local preview: `python3 -m http.server 8080` from repo root.

## 3. Architecture
Single page, top to bottom: hero → market session bar → Discord → curriculum → coaches → value stack + price → FAQ → final CTA → footer.

**`js/main.js`** is one IIFE, no deps, six numbered sections:
1. **Ambient chart canvas** (the centrepiece, see §6)
2. **Market sessions** — real open/closed state
3. **Discord recreation** — clickable channel switching
4. **Nav** — hide over hero, drop in on scroll
5. **Scroll reveals** — IntersectionObserver
6. **Footer year**

**`css/styles.css`** — brand tokens in `:root`, derived from the bull/bear chrome logo: near-black navy base, electric blue, cyan/red as up/down accents, mono for every number. Three fonts: Saira Condensed (display), Inter (body), JetBrains Mono (numbers).

## 4. What's built

### The ambient chart (js §1)
Mirrors their real **"Inner Edge TWS Advanced"** TradingView indicator, from screenshots Miguel supplied:
- **Bollinger bands**, SMA(50) ± 2σ. (Started as a Donchian high/low channel; corrected to true stdev math on request, then period 20 → 50.)
- **Fast/slow/long EMAs** (9 / 26 / 140) in red / blue / grey, matching the real indicator's colours.
- **Neon candles** with additive `lighter` compositing rather than per-candle `shadowBlur` — ~150 blurred draws per frame was too expensive.
- **Right-hand price scale**, dashed live-price line, cyan price tag.
- **Crosshair** on a *separate overlay canvas* above `.bg-veil`, so it reads as UI not background. Painted on pointer move, not in the rAF loop, so it tracks 1:1. Hover-devices only, clears on scroll.

**Price generation uses market regimes, not a random walk** — a flat walk reads as noise. Three regimes: trend leg (50%), impulse/capitulation (24%), consolidation (26%).

⚠️ **Do not remove `flatCool`.** A guard forces a trend leg when the visible range collapses. Without a cooldown it re-fires every bar, re-picks direction toward the middle each time, and pins price in a tight oscillation — producing exactly the flatness it was meant to prevent. A headless replay measured **98% of frames flat without the cooldown, 9.9% with it** (mean spread 0.472).

### Market session bar (js §2)
Sydney / Tokyo / London / New York with genuine open-closed state and countdowns, plus a live UTC clock. Derived from **each exchange's own local time via `Intl`**, so DST is handled automatically instead of hardcoded UTC windows that break twice a year. Weekends read "opens Monday" rather than a bogus countdown. Verified against real offsets (London BST +1, NY EDT −4, Sydney AEST +10).

**This replaced a fake-price ticker.** Invented prices on a page aimed at traders is a credibility risk — they're the one audience who'd notice.

### Discord section
Their real server **rebuilt in markup, not screenshotted.** The original screenshot contained a **live Zoom link with the password embedded in the URL** — publishing it would have let anyone join their paid coaching. All 14 channels are clickable and swap the pane.

**Team/admin channels show announcement-style posts; member-conversation channels show a "Members only" lock instead.** Inventing member chatter would be fabricated social proof — deliberately not done.

### Curriculum
Six modules with the **real lesson names**, read from a PDF export of their course (needed `brew install poppler` to render). Counts: 7 / 4 / 6 / 9 / 4 = **30 core lessons**, module 06 (Live Trade Breakdowns) grows weekly.

⚠️ **Never hardcode a total lesson count.** It was "Fifty Five Lessons" until Miguel pointed out a new video lands weekly. Now framed as "Thirty core lessons" (fixed) + "New weekly" badge on module 06.

### Coaches
Wendy & Lee, real photo, full bios from their course page. Wendy: former **Paralympic Wheelchair Basketball player**, NLP Master Trainer, TEDx speaker, author, former radio host. Lee: business owner 19+ years (prestige car hire), ~4 years trading FX.

### Value stack
The 13 items, **verbatim from Miguel**. Hover reveals the description on pointer devices; on touch every description is simply shown, since there's no hover — so no JS and nothing hidden on mobile.

⚠️ **The invented dollar values were removed on purpose.** It briefly carried per-item prices totalling $1,751 "value" vs $77. Miguel had me strip them: unjustifiable numbers, and the "$1,751 value!" device reads as info-product schtick to a cynical trading audience. **$77 is now the only figure on the page.** Do not reintroduce.

### FAQ
Eight questions including the hard ones, answered honestly: no income guarantee ("be careful of anyone who does"), not financial advice, no published return targets, don't use real money until it works on demo. Honest answers cost nothing with serious traders and give better footing than a thin footer disclaimer.

## 5. What's next
**Blocking before sharing widely:**
1. ~~CTAs go nowhere~~ — resolved 2026-08-03. The one dead `href="#"` (the value-stack Join button) now points at **https://inneredgescalping.com/joinies**, which 301s to their offer page on `members.inneredgescalping.com`. Every other CTA is an in-page `#pricing` jump to that button, which is deliberate.
2. **Wendy & Lee have not approved the page**, but it's publicly live with their photo, bios and full curriculum.

**Content gaps:**
3. **Zero social proof.** No testimonials, member count or results. Biggest conversion gap; Miguel is working on it.
4. **The core claim is unproven.** "Proven Profitable FX Strategy" is asserted, never demonstrated — no equity curve, win rate, or verified track record (Myfxbook/FX Blue). In this niche that's *the* objection.
5. **Refund and trial policy unknown** — two FAQ entries deliberately not written rather than invented.
6. Module 06's lesson count is inferred (55 − 30); confirm.

**Compliance — get a real opinion:**
7. UK-based, selling education with performance language and a price. "Proven profitable" plus an offer edges toward a financial promotion. Not qualified to judge where the FCA perimeter sits; worth twenty minutes with someone who is **before** taking payments.

**Copy that is Claude's, not theirs — verify before it ships:**
- Discord announcement messages (written in their format, invented)
- Module one-line descriptions
- Value-stack item descriptions
- Hero subheadline
- FAQ answers

Their real tagline **"Trade With Precision. Win With Edge."** is now the hero H1 (replaced an invented one).

## 6. Conventions
- **No em dashes in site copy.** Verified zero on the rendered page. The source bio had one; it was rewritten.
- **`text-wrap: balance`** on headings/ledes/short paragraphs, so a one-word orphan on the last line doesn't recur as copy changes.
- **Never fabricate** testimonials, member numbers, results, prices or credentials.
- **Keep client-supplied copy verbatim** (the 13 value-stack items, module names, tagline). Ask before rewording.
- Accessibility: `<details>` for FAQ/curriculum (keyboard-native), value-stack rows focusable with `:focus-visible` matching hover, nav uses `visibility:hidden` while hidden so it leaves the tab order.
- Screenshot capture from the browser extension **fails past ~5000px scroll depth** on this page (fixed canvas + stacked `backdrop-filter`). The page is fine; verify deep sections by measuring the DOM instead.

## 7. Open decisions
- ~~Futures vs Forex in the global CLAUDE.md~~ — resolved 2026-08-03, it's Forex (see §1).
- Whether to keep the "proven profitable" language in the hero.
- Full-platform stack, once the sales page is signed off.
- Real domain: `inneredgescalping.com` is theirs and already hosts `members.` — the miguelloza.com URL is only a preview.
