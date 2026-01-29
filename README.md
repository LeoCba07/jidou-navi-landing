# JidouNavi Landing Page

SEO-optimized landing page for JidouNavi with waitlist integration.

## Stack

- **Frontend:** Plain HTML/CSS/JS (no build step)
- **Backend:** Supabase (waitlist table)
- **Hosting:** Vercel (auto-deploy on push)
- **Domain:** jidou-navi.app

## Features

- Platform-specific CTAs based on launch state
- Waitlist email collection with platform segmentation
- Mobile-first responsive design
- SEO-optimized with structured data

## Configuration

Edit `script.js` to update launch state:

```js
const CONFIG = {
    launchState: 'pre-launch',  // 'pre-launch' | 'android-live' | 'both-live'
    playStoreUrl: '',           // Add when Android approved
    appStoreUrl: '',            // Add when iOS approved
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY',
};
```

## Launch Transitions

### Pre-Launch → Android Live

1. Update `launchState: 'android-live'`
2. Add `playStoreUrl`
3. Push to GitHub → Vercel auto-deploys

### Android Live → Both Live

1. Update `launchState: 'both-live'`
2. Add `appStoreUrl`
3. Push to GitHub → Vercel auto-deploys

## Local Development

Just open `index.html` in a browser. No build step needed.

For a local server:
```bash
npx serve .
```

## Deployment

Connected to Vercel for automatic deployments:
1. Push to `main` branch
2. Vercel builds and deploys automatically
3. Available at https://jidou-navi.app

## Assets Needed

Place in `/assets/`:
- `icon.png` - App icon (512x512)
- `screenshot-1.png` - Map view screenshot
- `screenshot-2.png` - Machine detail screenshot
- `screenshot-3.png` - Badges/profile screenshot
- `og-image.png` - Social sharing image (1200x630)
- `favicon-16.png` - 16x16 favicon
- `favicon-32.png` - 32x32 favicon
- `apple-touch-icon.png` - 180x180 iOS icon

## Supabase Setup

Run the migration in `../jidou-navi/supabase/migrations/006_create_waitlist_table.sql` to create the waitlist table.

## License

Private - All rights reserved
