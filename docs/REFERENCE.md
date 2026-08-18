# inner-edge — Reference

> Source-of-truth reference for inner-edge. Keep it current; `CLAUDE.md` points every new session here.

## 1. Overview
**Inner Edge Scalping** — a **Forex** (FX) scalping education community run by **Wendy & Lee**, sold as one membership at **$77/mo**.

**This is Forex, not futures.** Miguel's global CLAUDE.md previously called it a "futures trading education community"; confirmed wrong and corrected at the source on 2026-08-03. Everything in the actual product is FX: the course teaches an FX strategy, charts are CADCHF on OANDA, execution is MT5 / TradeLocker.

**This is a fresh restart (2026-07-30).** The prior build (`ies-platform`) was fully deleted — local dir, GitHub repo, Vercel project and Supabase tables all confirmed gone. Nothing carries over; re-verify any assumption from the old build.

**Current scope is the marketing/sales page only.** The full platform (auth, payments, community) is deliberately deferred.

## 2. Stack & accounts
- **This site:** plain static HTML/CSS/JS. No framework, no build step, no dependencies. `index.html` + `css/styles.css` + `js/main.js` + `assets/`.
- **Hosting, live since 2026-08-17:** **Vercel**, project `inner-edge` (`prj_XfdwqNVtloQOQ8S7rz8HhG24Nmdi`), production branch `main`, serving **https://inneredgescalping.com** and `www`. Push to `main` → deployed. See §9 for the cutover and the DNS.
- **`miguelloza.com/inner-edge/` is retired**, 2026-08-17. It was the pre-launch preview; once the real domain went live it was a second public copy of the same page. The rewrites in `miguelloza-forwards/vercel.json` were replaced with **307 redirects** here, so old preview links still land on the real site (deep links too, `/inner-edge/joinies` chains through to the members offer). Do not restore the proxy. Unfinished work goes to a `preview` branch instead.
- GitHub Pages still builds this repo at `groundworkhq.github.io/inner-edge/`, harmlessly, because no `CNAME` is committed. Nothing points at it.
- ⚠️ **This repo has no `CNAME` on purpose.** Adding one hands the domain to GitHub Pages and breaks the Vercel setup. The domain is attached on the Vercel side.
- **Full-platform stack: still TBD.** Not decided.
- **Their existing systems** (not built by us): course platform at `members.inneredgescalping.com`, private Discord server, TradingView (the "IES Indicator"), MT5 / TradeLocker, FTMO for prop funding, and a **GoHighLevel sub-account** that is the actual CRM (see §8).
- Local preview: `python3 -m http.server 8080` from repo root.

### Link preview / Open Graph — added 2026-08-17
The card shown when the URL is dropped in Discord, iMessage or Slack. Before this the page had **no OG tags at all**, so platforms fell back to a narrow favicon strip.

- **`<title>`, `og:title` and `twitter:title` are all the same string** and should stay that way: **"Inner Edge Scalping | Trade With Precision. Win With Edge."** Miguel's wording, settled 2026-08-17. It carries the brand name, which search results and a browser tab need, and their real tagline, which is what the shared card should lead with. An earlier version split them, tagline in the card and brand in the tab; that was replaced because one string does both jobs.
- ⚠️ **`og:image` must be an absolute URL.** A relative path silently fails in most scrapers. It points at `https://inneredgescalping.com/assets/og-card.jpg`, so it only resolves on the real domain.
- **`assets/og-card.jpg` is generated, 1200x630**, from `~/Documents/Images/blacklogo.png` (the Inner Edge oval wordmark, 1535x962). Miguel's choice 2026-08-17, replacing a first attempt built from the square WL badge. **Crop, do not pad.** The artwork's textured background runs to the edges, so letterboxing it onto a flat `--void` canvas leaves a visible seam; cropping to the OG ratio fills the frame. The oval sits mid-frame so trimming top and bottom costs nothing:
  ```
  sips -c 806 1535 blacklogo.png -o /tmp/c.png      # centre-crop to 1.905:1
  sips -z 630 1200 /tmp/c.png -o /tmp/og.png
  sips -s format jpeg -s formatOptions 82 /tmp/og.png -o assets/og-card.jpg
  ```
- ⚠️ **Bump `?v=` on the `og:image` URL whenever the image changes.** Scrapers cache by URL, so replacing the file alone leaves the old picture in every future unfurl. Currently `?v=2`.
- **Favicons are two different renderings on purpose**, settled 2026-08-17 after testing at real size:
  - `favicon-32.png` — a **flattened** mark: navy disc, solid gold WL. Untouched, and it must stay this way. The real badge artwork resampled to 32px collapses into a dark blob with the WL barely legible, and the tab icon is the most-seen instance of the brand.
  - `favicon-180/192/512.png` — the **actual WL badge artwork** (`~/Downloads/WhatsApp_Image_2026-02-28_at_12.15.37.jpeg`, 1024x1024 square). At Apple-touch and Android-icon sizes there is enough room for the bull, bear, candles and stars to read, and it looks far better than the flat mark.
  - ⚠️ **Do not unify them for consistency.** That was considered and rejected. If you change either, render at 32px and look at it first.
  - ⚠️ **Browsers cache favicons harder than almost anything.** The large ones carry `?v=2`; bump it on any change or you will not see the new icon and will assume the change failed.
- ⚠️ **Platforms cache unfurls hard.** Editing these tags does not update a preview that already exists in a Discord or iMessage thread. Some only re-scrape on a new URL. Test in a fresh channel, and do not assume a stale card means the tags are wrong.

### Branching
**`main` is production on every host this site has used.** A push to `main` is a deploy, so "back up my work" and "publish this" are the same action there. Keep them apart:

- **Shippable work goes straight to `main`.** Fix, commit, push, live in ~30s.
- **Work that is not ready goes on a branch.** Commit and push it as often as you like. Merge to `main` when it is signed off, and that merge is the moment it goes live.

Solo project, so **no PRs and no review step**. Merge directly.

⚠️ **A pushed branch is no longer free.** On GitHub Pages it deployed nothing, because Pages builds `main` only. **Since the site moved to Vercel on 2026-08-17, every pushed branch publishes a URL.** That old assumption is the one to unlearn — this branch predates the move, so if you are reading it here, check §2 and §9 on `main` for current hosting.

**The branch to show people is `preview`.** Cross-project convention agreed 2026-08-17: every project binds `<slug>.miguelloza.com` to its own `preview` branch, so the rule is identical everywhere. Runbook and the `noindex` requirement live in `miguelloza-forwards/README.md`, section "Preview subdomains". Set up for this project on 2026-08-17.

⚠️ **Deployment protection varies per Vercel project, so check before assuming.** `rekindle` has Vercel Authentication on (`all_except_custom_domains`) and its previews cannot be shared. **This project has it off**, so `inner-edge-git-<branch>-groundworkhq-projects.vercel.app` is publicly reachable with no login. An earlier note here claimed all previews were gated; that was generalised from `rekindle` and is wrong.

**The subdomain is about presentation, not access.** Since the raw Vercel URL already works, the reason to use `inner-edge.miguelloza.com` is that it looks like infrastructure Miguel owns rather than a git preview, and it does not leak the team slug or branch name. Miguel's call, and the right one for work a client is paying for.

⚠️ **The repo is public.** Anything pushed to any branch is publicly readable straight away, on either host, even when it is not rendered on the live page. Check member names, account numbers and personal data before pushing, not just before merging.

Branches: `main` is production, `preview` is what `inner-edge.miguelloza.com` serves, `wins-wall` holds the unfinished social proof section (§4). `apex-domain` was merged and deleted on 2026-08-17.

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

### Wins wall (social proof) — added 2026-08-14
Section `#wins`, between coaches and curriculum. Two distinct blocks, and the difference between them matters:

- **`WINS`** (js §7) — real member messages, **verbatim**, rendered as Discord-flavoured cards. Currently one entry: Matty K., Jul 2026.
- **`MILESTONES`** — proof we hold with **no message attached**. Phrased as our statement of fact, never as a quote, because the member never said it. Currently one entry: Lee B., prop firm stage two, Aug 2026.

⚠️ **Never turn a milestone into a quote.** Lee B. sent a certificate, not a sentence. Writing a testimonial for him would be exactly the fabrication this page has refused everywhere else.

**The section renders nothing and stays `hidden` while `WINS` is empty**, so a stub can never ship to the live page.

**Source material was two screenshots, and neither is published as an image.** Rebuilt in markup instead, same call as the Discord section (§4) and for the same class of reason:
- Matty's Discord post embedded a screenshot of his **prop firm email**, which showed his full legal name ("Matthew Kettle") and a **KYC link**. Same shape as the Zoom-link incident.
- Lee's certificate carried the **issuer's logo and the Managing Director's handwritten signature**. Republishing a third party's signature on a client sales page is a worse problem than the name on it.

**Naming: full name by default, abbreviated only on request.** Miguel's call on 2026-08-14. Matty Kettle is named in full with permission; **Lee Baldwin is `Lee B.` because he specifically asked**. A uniform first-name-plus-initial rule was proposed and rejected, so the inconsistency is deliberate, not an oversight. Do not "tidy" it by abbreviating both.

⚠️ **`Lee B.` collides with coach Lee Saunders.** Unresolved. On the same page it can read as the coach endorsing himself.

**Prop firm named generically** ("a prop firm") rather than as Alpha Capital, since nobody has asked them for permission to use their brand.

A risk note sits under the section: individual results, trading carries risk, no promise of earnings.

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
1. ~~CTAs go nowhere~~ — resolved 2026-08-03. **Every "Pricing" / "Join" / "Get Instant Access" link on the page** (6 total: nav "Pricing" and "Join Now", hero, value-stack Join, final CTA, footer "Pricing") points at **https://inneredgescalping.com/joinies**, which redirects to their offer page on `members.inneredgescalping.com`. Miguel's call to send the nav and footer "Pricing" links off-site too, not just the buttons. Note this leaves `id="pricing"` on `.vs__pay` with nothing linking to it, and there is no longer any in-page route to the price.
2. ~~Wendy & Lee have not approved the page~~ — **resolved 2026-08-14, they have signed off.** Note the sign-off covers the page as it stands on `main`. The social proof section (§4, branch `wins-wall`) is **not** part of it and is still unapproved and unfinished.

**Content gaps:**
3. **Social proof — started 2026-08-14, not yet enough to ship.** The `#wins` section exists and renders, but on **one message and one milestone**. One card centred under a full-width heading reads as thin, which is worse than no section at all. Target 5-6 messages before this goes live. Still the biggest conversion gap.
   - Permission confirmed for both: **Matty Kettle in full**, **Lee B. abbreviated at his request**.
   - **Waiting on one asset:** the original of the prop firm pass email Matty posted, cropped to the achievement. The copy embedded in the Discord post is a ~145x315 thumbnail and is illegible at display size, so it needs the original upload. Until it arrives his card is quote + badge, which is a fine state to ship.
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
- **Members are named in full where they have agreed, abbreviated where they asked.** Messages are quoted verbatim including typos. Before publishing any member image, check what else is in the frame: full legal names, account numbers, balances, KYC or onboarding links, third-party signatures.
- **Keep client-supplied copy verbatim** (the 13 value-stack items, module names, tagline). Ask before rewording.
- Accessibility: `<details>` for FAQ/curriculum (keyboard-native), value-stack rows focusable with `:focus-visible` matching hover, nav uses `visibility:hidden` while hidden so it leaves the tab order.
- Screenshot capture from the browser extension **fails past ~5000px scroll depth** on this page (fixed canvas + stacked `backdrop-filter`). The page is fine; verify deep sections by measuring the DOM instead.

## 7. Open decisions
- ~~Futures vs Forex in the global CLAUDE.md~~ — resolved 2026-08-03, it's Forex (see §1).
- Whether to keep the "proven profitable" language in the hero.
- Full-platform stack, once the sales page is signed off.
- Real domain: `inneredgescalping.com` is theirs and already hosts `members.` — the miguelloza.com URL is only a preview.

## 8. GoHighLevel CRM
Discovered 2026-08-04 when the official HighLevel MCP was wired into Claude Code. **The `highlevel` MCP server is bound to this sub-account and no other** — every operation it runs hits Inner Edge Scalping. Verified with `list_locations` + `get-location`. See the `reference_highlevel-mcp` memory note for the server setup itself.

### Sub-account
| | |
|---|---|
| Name | Inner Edge Scalping |
| Location ID | `06KFUoalbbFOPinVxNeY` |
| Company (agency) ID | `uDnUWn0Id47pe3f98hdL` |
| Created | 2026-02-25 |
| Website on file | `https://inneredgescalping.com` |
| Account email | `team.inneredge@gmail.com` |
| Address / timezone | 11 Kingsway, Colchester, Essex CO5 0LS, GB / Europe/London |
| SaaS mode | `setup_pending` (Stripe customer `cus_U5ZSJSqpJafpvI`, Twilio rebilling disabled) |

**Users (3):** Miguel Loza (`team.inneredge@gmail.com`, **admin**), Wendy Smith (`coachwend72@gmail.com`, user), **Lee Saunders** (`leeisfx@gmail.com`, user). Lee's surname was unknown until now; the site only ever says "Lee". Don't change site copy over this — see §6.

### Contacts — 111 total (2026-08-04)
Roughly what's in there, from a full two-page pull:

- **Every record is `type: lead`.** Nothing is marked customer/won, no opportunities and no populated custom fields anywhere. The CRM is a list, not a pipeline — treat any "member vs churned" read as inferred from tags, not from state.
- **Tags:** `skool-migrant` 61, `cc` 11 (Coaching Corner), `ies-cancellation` 10, `ies-member` 2, `1:1` 1. **42 contacts carry no tag at all.**
  - ⚠️ `ies-member` is on **Wendy and Lee only**. It does not mark paying members. Do not use it as a member count.
- **Source:** `membership` 60, none 37, `payment_link` 8, "Coaching Corner 1:1" variants 6.
- **Signup shape:** 62 of 111 landed in March 2026 — that's the Skool → GHL migration, a CSV import (`attributionSource: {sessionSource: "CRM UI", medium: "csv_import"}`). The remaining ~49 trickled in Apr–Aug, so organic adds run roughly 10/month.
- **Geography:** GB 55, US 24, IE 1, 20 unset. UK-majority audience, which matters for the FCA question in §5.
- **Phone numbers on ~15 of 111.** Email is effectively the only channel; any SMS/voice plan is dead on arrival without a collection step first.
- **Assignment:** Lee 12, Wendy 2, 97 unassigned. Assignment appears to happen only on Coaching Corner bookings.
- Test/system records are mixed in with real ones (`intercom@goforclose.com`, `jojjy@mailinator.com`, an "Admin Email" contact, Miguel's own two addresses, family). Any count taken raw is inflated by ~6.
- At least three people exist as duplicate contacts under different addresses (e.g. Jayden Adams x3, Sid O x2, Brandon Roberti x2). `allowDuplicateContact` is `false` but dedupe keys on email+phone, so a second address makes a second person.

### How money actually reaches them
Attribution on the booked contacts shows the real path, which is **not** the sales page:
`GHL calendar widget (api.leadconnectorhq.com/widget/booking/…)` → `buy.stripe.com` / `book.stripe.com` payment link, with some traffic through `link.fastpaydirect.com`. Calendar IDs seen: `xZfRi7H03O5qpvplLinH` (Coaching Corner 1:1), `kKVFqVYupYumqADzHPth`, `HqZvVYe5r7yuFaylZ6cn`, plus Wendy's personal calendar `V9DkRCtI48rKOcDXBAnj`. Recurring membership billing is separate and lives on `members.inneredgescalping.com`.

### What this changes
- **The social-proof gap in §5 is now measurable, not just missing.** ~105 real contacts and 10 tagged cancellations exist. Retention/churn numbers could be pulled, but only via the members platform and Stripe — GHL alone can't tell you who is currently paying.
- **`ies-cancellation` is the only churn signal in here** and it's manual, so it's a floor, not a rate.
- ⚠️ **Read-only in practice, by choice.** The MCP grant is a fixed read **+ write** bundle (no read-only option), and this is a live client CRM with 100+ real people in it. Do not create, update, tag or delete contacts, and never trigger a workflow or send from it, without Miguel saying so for that specific action.
- ⚠️ **Never export the contact list into a repo, artifact or shared doc.** Names, emails and phone numbers of UK residents — GDPR applies, and it's Wendy & Lee's data, not ours.

## 9. Apex domain migration (inneredgescalping.com)

**Status: SHIPPED 2026-08-17.** `inneredgescalping.com` serves this site from Vercel. Approach changed mid-branch from GitHub Pages meta-refresh folders to Vercel redirects (see below); `apex-domain` was merged to `main`. Miguel owns the domain and is the only person who edits it.

**What was actually done on the day:** Vercel project `inner-edge` (`prj_XfdwqNVtloQOQ8S7rz8HhG24Nmdi`) created against `GroundworkHQ/inner-edge`, production branch `main`, both `inneredgescalping.com` and `www` attached. At Namecheap, apex `A` `162.159.140.166` → `76.76.21.21`, and `www` `CNAME` `sites.ludicrous.cloud` → `cname.vercel-dns.com`. Nothing else touched. Verified: apex serves the page byte-identical to the deployment, all seven redirects resolve correctly, `members` and all email records unchanged.

⚠️ **Vercel's dashboard permanently shows a nameserver mismatch** (`ns1/ns2.vercel-dns.com` intended vs `dns1/dns2.registrar-servers.com` current). This is expected and not a fault — the domain is configured by A/CNAME record, not by delegating nameservers to Vercel. Do not "fix" it by moving nameservers; that would take the email records and `members` with it. Wendy & Lee do not use the GHL redirect panel, and GHL is not the long-term home, so the redirects were moved into this repo rather than left there.

### Where the domain stood before
Namecheap DNS. Three hostnames on GoHighLevel (`*.ludicrous.cloud`): apex, `www`, and `members`. The apex had no homepage at all; `/` was itself a redirect into a paid offer.

⚠️ **This domain does carry email, and an earlier version of this section said it did not.** That was wrong and it is the dangerous kind of wrong, because it invites someone to "tidy up" records that are load-bearing. `dig` on the apex misses them — they all sit on subdomains. The real set, confirmed in the Namecheap panel 2026-08-17:

| Record | Host | Purpose |
|---|---|---|
| `TXT` | `resend._domainkey.mail` | Resend DKIM |
| `MX` | `send.mail` | `feedback-smtp.us-east-1.amazonses.com`, Resend bounce handling |
| `TXT` | `_dmarc` | `v=DMARC1; p=none;` |

**What it is for: Gmail's "send mail as" feature**, sending through Resend on `mail.inneredgescalping.com`. So the DKIM record is what keeps those messages authenticated. If it disappeared, mail would start landing in spam and the obvious suspect would be Gmail, not DNS — which is exactly why this is written down here.

**Never touch these during a hosting change.** The apex migration only ever needs `@` and `www`.

### The redirects
Pulled from GHL `fetch-redirects-list` on 2026-08-14 and regenerated into static files, never retyped by hand.

| Path | Target |
|---|---|
| `/joinies` | members offer `fd60666b` — the 6 CTAs on the page use this |
| `/join` | `tally.so/r/BzGL5e` |
| `/coachingcorner` | `book.stripe.com/…bjW05` |
| `/booking` | GHL calendar `xZfRi7H03O5qpvplLinH` |
| `/groupcoaching` | `link.fastpaydirect.com/…5f01` |
| `/JournalReview` | `forms.gle/LX94WqqdsDzhkutU6` |
| `/CCJournalReview` | `forms.gle/RGxEuSnFN5jCYLhs6` |

`/` is deliberately absent: that path is the site now. `/replay` was deleted from GHL on 2026-08-14 at Miguel's instruction and is **not** carried over.

**These are real server-side permanent redirects, served by Vercel from `vercel.json`.** No HTML, no JS, no folders.

⚠️ **Vercel issues `308`, not `301`, for `"permanent": true`.** Verified against the live deployment. Same permanent semantics, except 308 also preserves the request method. Nothing to fix, but don't go "correcting" it to 301 after reading an older note, and don't treat a 308 in a link checker as a misconfiguration.

**Why not GitHub Pages.** It was built that way first and then replaced. GitHub Pages cannot do server-side redirects, so each path needed a folder holding a `<meta http-equiv="refresh">` page, and casing needed a lookup map in `404.html` because GHL matched case-insensitively and Pages does not. That map was the problem: **GitHub Pages serves `404.html` with an actual HTTP 404 status** before any JS runs. A human still lands in the right place, but link checkers, email click-tracking and GHL's own link handling see a dead link. These seven paths live in emails and Discord posts, so that mattered more than it would on an ordinary page. Deleted in favour of Vercel on 2026-08-17.

⚠️ **Casing is handled by character classes inside a path parameter**, e.g. `/:p([jJ][oO][iI][nN][iI][eE][sS])`. Ugly, but it is the form Vercel actually supports — raw regex is only honoured inside a named parameter, and enumerating casings one by one silently misses variants like `/joinIes`. Note **macOS is case-insensitive, so the folder approach physically could not hold `JournalReview/` and `journalreview/` as separate directories** anyway; this has no such limit.

⚠️ **`/ccjournalreview` must stay ordered before `/journalreview`** in the redirects array. Vercel takes the first match. They do not actually collide (each pattern is anchored end to end, verified), but the ordering is the cheap insurance and there is no reason to rely on the anchoring alone.

Verified 2026-08-17 by compiling `vercel.json` against `path-to-regexp` 6.2.1, the matcher Vercel uses, and resolving every path first-match-wins: all three casings of all seven paths route correctly, `/join` does not swallow `/joinies`, `/journalreview` does not swallow `/ccjournalreview`, and `/`, `/replay` and unknown paths correctly match nothing. **Not yet verified against a live deployment** — no Vercel project exists for this repo yet.

### Still to do
1. **Create the Vercel project** on `GroundworkHQ/inner-edge`, team `GroudworkHQ's Projects` (`team_9zmKkgaDkKH00r0j2unAXI5z`, note the typo in the team name, it is theirs). Static repo, no build command, no framework preset.
2. **Add `inneredgescalping.com` + `www` to that project**, then take the DNS records **from what Vercel shows you at that moment**. Do not reuse records written down here or anywhere else — Vercel has changed its published apex IP before, and a stale one silently fails.
3. **Namecheap:** apex `A` currently `162.159.140.166` and `www` `CNAME` currently `sites.ludicrous.cloud`, both → the Vercel values from step 2.
4. ⚠️ **`members` CNAME must not be touched.** It points at `clientportal.ludicrous.cloud` and is the live course platform and billing.
5. Re-verify the seven redirects against the live deployment, since the pre-flight check above was static analysis only.

### Branch previews
Vercel gives every branch push its own preview URL, which GitHub Pages cannot — Pages builds one branch. That is the route to showing Wendy & Lee the `wins-wall` work without merging it into an already signed-off `main`.

⚠️ **Preview URLs are login-gated by default.** The account default, confirmed on the `rekindle` project 2026-08-17, is Vercel Authentication on `all_except_custom_domains`. Miguel can open a preview link; Wendy & Lee cannot, they would need Vercel accounts with team access. To send them one, either disable Vercel Authentication for this project (previews become reachable by anyone holding the link) or use password protection (paid). Left at the default deliberately — it is a call to make per share, not a default to quietly flip.

### Rollback
**Leave the GHL redirects configured.** They go inert the moment the apex moves but are not deleted, so pointing the apex `A` record back at `162.159.140.166` restores the previous behaviour immediately. Do not tidy them up until this has been live and stable for a while.

⚠️ **Permanent redirects are cached hard by browsers**, which the old meta-refresh version was not. Rollback restores the *server* behaviour immediately, but anyone who already hit a redirected path keeps going to the same target until their cache clears. If a destination URL is likely to change soon (the Stripe and fastpaydirect links especially), consider `"permanent": false` on that one entry rather than discovering it the hard way.

### Known side effect
~~Adding `CNAME` breaks the `miguelloza.com/inner-edge/` preview.~~ Resolved by moving to Vercel — no `CNAME` is committed, so GitHub Pages keeps serving `groundworkhq.github.io/inner-edge/` and the proxy preview survives the cutover. §2 records this. The `apex-site-flow` memory note needs no change.
