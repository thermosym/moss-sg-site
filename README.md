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
- `npm run preview` — preview the build locally
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright smoke tests (needs `npm run build` or a running dev server)

## Deploy

Cloudflare Pages, GitHub integration. Build command `npm run build`, output directory `dist`, Node version `22`. Custom domain `moss.sg` is set up via Cloudflare DNS (CNAME or apex proxy).
