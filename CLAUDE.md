# Vietnam Packing List PWA

## Project Overview
A progressive web app (PWA) packing list for a family trip to Vietnam (April 2026). Built for two people: **Aila** (child) and **Trinh**.

## Features
- Tabbed interface switching between Aila and Trinh's lists
- Categorised packing items with tap-to-check functionality
- Progress bar showing % packed per person
- Saves state to localStorage (persists between sessions)
- Installable as a PWA on mobile devices
- Service worker for offline support

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PWA:** Custom service worker (`public/sw.js`) + manifest (`public/manifest.json`)

## Key Files
- `app/page.tsx` — Main packing list UI and all logic
- `app/layout.tsx` — Root layout, metadata, service worker registration
- `app/globals.css` — Global styles
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker
- `next.config.js` — Next.js config (ESLint + TypeScript errors ignored during build)

## Deployment
- **GitHub:** https://github.com/derentemel1/18aprilPackinglistpush
- **Live URL:** https://18april-packinglistpush.vercel.app
- Vercel auto-deploys on every push to the `main` branch

## Workflow
1. Make changes to files
2. Open GitHub Desktop
3. Commit changes (write a summary)
4. Click "Push origin"
5. Vercel automatically redeploys within ~1 minute

## Notes
- `node_modules/` and `.next/` are excluded via `.gitignore`
- ESLint and TypeScript build errors are suppressed in `next.config.js` to allow deployment
