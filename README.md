# moss.sg

Mothership site for the Moss subsystems constellation. Entry at [moss.sg](https://moss.sg).

## Dev

    nvm use
    npm install
    npm run dev

Open http://localhost:4321.

## Scripts

- `npm run dev` — Astro dev server
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the built site locally
- `npm run test` — Vitest unit tests (status, date helpers)
- `npm run test:e2e` — Playwright smoke tests (builds + previews)

## Deployment — Cloudflare Pages

1. Push to GitHub and connect the repo to Cloudflare Pages.
2. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `22`
3. Custom domain: add `moss.sg` in Pages → Custom domains. Cloudflare DNS already hosts the zone, so the CNAME records are auto-created.
4. No `_redirects` file — Cloudflare Pages serves the apex directly.

## Project structure

- `src/data/projects.ts` — add a subsystem here (append an object, push, redeploy)
- `src/data/i18n.ts` — all user-facing strings (EN + 中)
- `src/components/` — one file per visual unit; compose in `src/pages/index.astro` and `src/pages/zh/index.astro`
- `src/lib/` — pure utilities with unit tests in `tests/unit/`
- `tests/e2e/homepage.spec.ts` — smoke coverage

## Easter eggs

- The period in `moss.` on the homepage is clickable.
- Open DevTools console — there is a greeting.
- `robots.txt` has a comment that is not a rule.
- `/anything-not-a-page` → galaxy error.
