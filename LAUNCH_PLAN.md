# JidouNavi Launch Plan & Site Audit

> **STATUS: LAUNCHED 2026-07-13.** App live on Play open testing (versionCode 16), site
> flipped to android-live with maker's note, domain canonicalization fixed (apex primary,
> www 308s to it), legal pages updated (July 2026 dates + Sentry/GA disclosure), launch
> email sent: 36/36 subscribed, 0 failed. Remaining below in "What's left".

_Last updated: 2026-07-13 (originally 2026-07-08). Context: Google Play verification about to complete; production access expected within days. Goal is a **low-effort release** — ship it, send the waitlist email, one Instagram post, maybe PH/HN/Reddit. No ongoing marketing operation._

## What's left (post-launch)

- [ ] Instagram post (the one planned social action)
- [ ] Optional, after a few stable days + a review or two: Product Hunt / Show HN / r/sideproject
- [ ] Promote the Play release from open testing → Production track once vitals look clean (~1–2 weeks)
- [ ] iOS someday → see section 3 (second waitlist email to `platform = 'ios'` signups is prepped)
- [ ] Google Sign-In someday → full implementation sketch in the main repo,
      `docs/TESTER_FEEDBACK_PLAN.md` Phase 2 (Google Cloud OAuth clients, Supabase provider,
      `signInWithIdToken`, needs a new native build; on iOS would force Sign in with Apple too)
- Cheap nice-to-haves if ever bothered: square icon crop for the welcome email, WebP hero screenshots

---

## 1. Audit summary (2026-07-08)

### Healthy ✅

- **Waitlist flow**: signup → Supabase insert → welcome email (EN/ES) with server-side token verification, unsubscribe respected, duplicates handled. Well built.
- **Email DNS**: DKIM (Resend), SPF on send subdomain, DMARC present (`p=none`). Emails should land in inboxes.
- **Security headers**: CSP, HSTS, X-Frame-Options, nosniff all live.
- **SEO basics**: valid sitemap, reciprocal hreflang (EN/ES), OG image exactly 1200×630, robots.txt allows all crawlers (incl. GPTBot/ClaudeBot/PerplexityBot — good for AI discoverability), real 404 page, structured data (SoftwareApplication).
- **Message match**: landing H1 ("weird vending machines you saw on TikTok") matches the QR/social copy. Don't water it down.

### Fix before launch 🔴

1. **Domain canonicalization mismatch** — `jidou-navi.app` 307-redirects to `www.`, but every canonical tag, hreflang, og:url, sitemap URL, and email link points at the apex. Google is told the canonical is a URL that redirects away.
   **Fix (5 min, no code):** Vercel → Project → Settings → Domains → set `jidou-navi.app` as primary (www redirects to apex). Confirm Search Console property covers the apex.

2. ~~**Launch-day email doesn't exist**~~ — **built & deployed 2026-07-08**: `send-launch-email` edge function (EN/ES templates, per-user unsubscribe links, `List-Unsubscribe` headers, rate-limited, double-send-proof via `launch_email_sent_at`). Goes to ALL subscribed signups (iOS folks get an "iOS on the way" note). Gated by `ADMIN_SECRET` (stored in `.env.local`, gitignored, and set as a Supabase function secret). Test send verified. See "Sending the launch email" below.

3. ~~**ES waitlist count 404**~~ — **fixed 2026-07-08**: `es/script.js` still queried the dropped `waitlist_public_stats` view (Supabase hardening in the main repo removed it); commit `4d30d2e` had only fixed the EN script. Now both use the `waitlist_count()` RPC. Needs push to deploy.

### Nice to fix, cheap 🟡

- **`icon.png` is 896×1152 (not square)** but forced to 96×96 in the welcome email → distorted in email clients. Crop a square version.
- **ES Play badge**: `es/script.js` renders the English Play Store badge; swap URL to `play.google.com/intl/es/badges/...` when flipping launch state.
- **Sitemap `lastmod`** is stale (2026-02-17) — bump on launch day.
- **Hero screenshots** are ~1.2 MB of PNG with no width/height attrs (slow mobile LCP, layout shift). Convert to WebP if ever bothered; skip if not.
- CSP includes `api.resend.com` in connect-src — unused by the browser, removable. Cosmetic.

### Explicitly skipped (low-effort launch) ⏭️

Given the goal is "release and done", these from the original marketing research are **out of scope**: UTM capture / GA4 signup events, `/go/*` QR redirect paths, printed QR stickers/pamphlets, influencer outreach, content calendar, FAQ/SEO content expansion, shareable machine pages (`/m/:id`). Revisit only if the app unexpectedly gets traction. The one that's cheapest to resurrect later: machine share pages (biggest SEO/growth lever if it ever matters).

---

## 2. Launch-day checklist

Once the Play Store listing is live:

1. In **both** `script.js` and `es/script.js` (config is duplicated — easy to miss one):
   - `launchState: 'android-live'`
   - `playStoreUrl: '<real URL>'`
2. Add the Play Store link **statically in the HTML** too (both pages), and as `"installUrl"` in the JSON-LD — JS-off crawlers and AI assistants otherwise see no download path.
3. Bump `lastmod` in `sitemap.xml`.
4. Push → Vercel auto-deploys → verify live on a phone (EN and ES pages, form still works for iOS waitlist).
5. Send the launch email (see below).
6. Post the Instagram post. Done.

### Sending the launch email

One-time prep (before first real send): run the migration in the Supabase SQL editor
(https://supabase.com/dashboard/project/xkrsovejtlbpoznbvbha/sql):

```sql
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS launch_email_sent_at TIMESTAMPTZ;
```

Test send (both language variants to one inbox, no DB writes) — `ADMIN_SECRET` is in `.env.local`:

```bash
source .env.local
curl -X POST https://xkrsovejtlbpoznbvbha.supabase.co/functions/v1/send-launch-email \
  -H "Authorization: Bearer <ANON_KEY from script.js>" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"play_store_url":"<REAL_PLAY_URL>","test_email":"you@example.com"}'
```

Real send — same command **without** `test_email`:

```bash
  -d '{"play_store_url":"<REAL_PLAY_URL>"}'
```

Returns `{ sent, failed, failures }`. Safe to re-run: already-emailed rows are skipped via `launch_email_sent_at`. For the future iOS launch, the same function can be re-templated or the column reused after a reset.

Optional, whenever: Product Hunt / Hacker News (Show HN) / r/sideproject post. If doing these, wait a few days after launch so the app is stable and has a review or two — these are one-shot channels.

## 3. iOS launch (later)

1. Both scripts: `launchState: 'both-live'`, add `appStoreUrl`.
2. Add App Store link statically + smart app banner meta tag.
3. Second (final) waitlist email to `platform = 'ios'` signups.

---

## 4. Reference

- Hosting: Vercel, auto-deploy on push to `main`. Domain: jidou-navi.app.
- Waitlist: Supabase table `waitlist` (email, platform, lang, source, unsubscribe_token, subscribed). Count via `waitlist_count()` RPC (SECURITY DEFINER; the old `waitlist_public_stats` view was dropped during Supabase hardening).
- Email: Resend, from `noreply@jidou-navi.app`, reply-to `jidou.navi@gmail.com`.
- Edge functions: `send-welcome-email`, `unsubscribe` (in `supabase/functions/`).
- Waitlist size at last check: 37.
