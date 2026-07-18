# JidouNavi Landing Page

Landing page for [JidouNavi](https://jidou-navi.app) — launched July 2026 with the Android app live on Google Play.

## Stack

- **Frontend:** Plain HTML/CSS/JS (no build step)
- **Backend:** Supabase (waitlist table + edge functions for emails)
- **Hosting:** Vercel (auto-deploy on push to `main`)
- **Domain:** jidou-navi.app

## Structure

```
index.html          Main landing page (English)
es/                 Spanish version (index, privacy, terms, delete-account, unsubscribe)
privacy.html        Privacy policy
terms.html          Terms of service
delete-account.html Account deletion instructions (Play Store requirement)
unsubscribe.html    Email unsubscribe page
404.html            Error page
supabase/           Migrations + edge functions (welcome, launch, unsubscribe emails)
LAUNCH_PLAN.md      Launch checklist (complete) + post-launch notes
```

## Launch State

Configured in `script.js` (and mirrored in `es/script.js`):

```js
const CONFIG = {
    launchState: 'android-live', // 'pre-launch' | 'android-live' | 'both-live'
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.jidounavi.app',
    appStoreUrl: '',             // Add when iOS ships
    ...
};
```

When iOS launches: set `launchState: 'both-live'`, add `appStoreUrl`, update both `script.js` files, push.

## Emails

Supabase edge functions in `supabase/functions/`:

- `send-welcome-email` — sent on waitlist signup
- `send-launch-email` — launch announcement (EN/ES, double-send-proof via `launch_email_sent` flag; already sent)
- `unsubscribe` — handles unsubscribe links

Deploy with the Supabase CLI (`supabase functions deploy <name>`); the project is already linked.

## Local Development

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Deployment

Push to `main` → Vercel auto-deploys to https://jidou-navi.app.

## License

Private - All rights reserved
