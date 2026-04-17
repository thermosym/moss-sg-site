# moss.sg Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page bilingual (EN default / 中 at `/zh/`) mothership homepage for `moss.sg` with a restrained "starscape + cyber cool + trace of life" aesthetic, an Astro + Tailwind v4 static site deployed on Cloudflare Pages.

**Architecture:** Astro 5 static output with i18n routing (`/` = EN, `/zh/` = CN, no client-side toggle — two static HTML pages + a language switcher that is just an `<a>` link). Five sections (Hero → Manifesto → Subsystems → Directives → Footer) composed from focused Astro components. Canvas-2D starfield as a global background island; project data and i18n copy kept in typed `src/data/` modules so new subsystems are one object push. `prefers-reduced-motion` honored throughout.

**Tech Stack:**
- Astro 5 (static, `output: 'static'`) + TypeScript strict
- Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first `@theme`)
- Fonts: `@fontsource-variable/geist-mono` (self-hosted npm package), LXGW WenKai Screen via jsdelivr CDN
- Starfield: vanilla Canvas 2D (3 layers + nebula + pulsing MOSS eye + meteors + flare stars), no animation library; adapted from `Downloads/moss_starfield_v2.html`
- Unit tests: Vitest for pure utilities (status color map, date format)
- E2E: `@playwright/test` smoke test (page loads, no console errors, language toggle works)
- Deployment: Cloudflare Pages via GitHub integration, `CNAME` = `moss.sg`

---

## File Structure

```
moss-sg-site/
├── .gitignore
├── .nvmrc
├── .prettierrc
├── README.md
├── astro.config.mjs
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vitest.config.ts
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── CNAME
├── src/
│   ├── env.d.ts
│   ├── styles/
│   │   └── global.css
│   ├── data/
│   │   ├── i18n.ts          # all bilingual copy in one typed object
│   │   └── projects.ts      # subsystems list — add new entries here
│   ├── lib/
│   │   ├── status.ts        # status → {color, label, pulse} map
│   │   └── date.ts          # format "YYYY-MM" from ISO-ish input
│   ├── components/
│   │   ├── Starfield.astro
│   │   ├── Typewriter.astro
│   │   ├── LangToggle.astro
│   │   ├── Hero.astro
│   │   ├── Manifesto.astro
│   │   ├── Subsystems.astro
│   │   ├── ProjectCard.astro
│   │   ├── Directives.astro
│   │   ├── Footer.astro
│   │   └── EasterModal.astro
│   ├── layouts/
│   │   └── Base.astro
│   └── pages/
│       ├── index.astro      # EN
│       ├── 404.astro
│       └── zh/
│           └── index.astro  # 中文
└── tests/
    ├── unit/
    │   ├── status.test.ts
    │   └── date.test.ts
    └── e2e/
        └── homepage.spec.ts
```

**Responsibilities (one-liner each):**
- `astro.config.mjs` — site URL, i18n, Tailwind vite plugin, sitemap
- `global.css` — `@theme` design tokens (colors, fonts), font imports, reduced-motion override, base resets
- `i18n.ts` — `STRINGS.en` and `STRINGS.zh` — every human-readable string
- `projects.ts` — `PROJECTS: Project[]` — bilingual descriptions, status, url, updated, optional tech
- `status.ts` — `statusMeta(status)` → `{ color, pulse, label }`; no JSX/HTML
- `date.ts` — `formatMonth(iso)` → `"2026-04"`; pure function
- `Starfield.astro` — full-viewport canvas, 3-layer parallax (~264 stars), nebula, central MOSS eye, meteors, flare cross on near stars; mouse/deviceorientation eased parallax; reduced-motion → static frame
- `Typewriter.astro` — DOM-diff typewriter over a slot's text; skips animation on reduced-motion
- `LangToggle.astro` — plain `<a>` to the opposite-locale page (no JS)
- `Hero.astro` — "moss." title + two-line boot text + clickable "." easter modal trigger
- `Manifesto.astro` — static prose in Geist/LXGW pairing
- `Subsystems.astro` — grid of `ProjectCard`s from `PROJECTS`
- `ProjectCard.astro` — name, url, description, tech, status light (from `statusMeta`), updated
- `Directives.astro` — three numbered directives
- `Footer.astro` — terminal status bar
- `EasterModal.astro` — `<dialog>` with MOSS quote, opens when `.` is clicked
- `Base.astro` — `<html lang>`, metadata, Starfield, slot, console ASCII boot log

---

## Data Contracts (referenced throughout)

```ts
// src/data/i18n.ts
export type Locale = 'en' | 'zh';

export interface StringBundle {
  meta: { title: string; description: string };
  hero: { boot: [string, string]; byline: string; easter: string };
  manifesto: { heading: string; body: string[] };
  subsystems: { heading: string };
  directives: {
    heading: string;
    items: { n: string; en: string; zh: string }[];
  };
  footer: {
    system: string;
    uptime: string;
    operator: string;
    status: string;
    quote: string;
  };
  langToggle: { label: string; href: string };
  easterModalClose: string;
}
```

```ts
// src/data/projects.ts
export type Status = 'ACTIVE' | 'WIP' | 'ARCHIVED';

export interface Project {
  name: string;          // lowercase id, e.g. 'magi'
  url: string;           // full https://…
  status: Status;
  description: { en: string; zh: string };
  tech?: string;         // optional, e.g. "React · Vite · OpenRouter"
  updated: string;       // ISO month 'YYYY-MM'
}
```

```ts
// src/lib/status.ts
export interface StatusMeta {
  color: string;  // hex
  pulse: boolean;
  label: Status;
}
```

These types are authoritative. If a later task references a property, it means what's declared here.

---

## Task 0: Repo scaffolding (tooling & version pinning)

**Files:**
- Create: `.nvmrc`
- Create: `.gitignore`
- Create: `.prettierrc`
- Create: `README.md`

- [ ] **Step 1: Pin Node version**

Create `.nvmrc`:

```
22
```

- [ ] **Step 2: Add .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
.astro/
.DS_Store
.env
.env.local
.env.*.local
playwright-report/
test-results/
coverage/
```

- [ ] **Step 3: Add Prettier config**

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- [ ] **Step 4: Write README**

Create `README.md`:

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add .nvmrc .gitignore .prettierrc README.md
git commit -m "chore: scaffold repo tooling"
```

---

## Task 1: Astro + TypeScript + Tailwind v4 init

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `src/env.d.ts`
- Create: `src/styles/global.css`

- [ ] **Step 1: Initialize package.json**

Run:

```bash
npm init -y
```

Then overwrite `package.json` with:

```json
{
  "name": "moss-sg-site",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 2: Install runtime and dev deps**

Run:

```bash
npm install astro@^5 @astrojs/check @astrojs/sitemap typescript @fontsource-variable/geist-mono
npm install -D tailwindcss@^4 @tailwindcss/vite vitest @playwright/test prettier prettier-plugin-astro
npx playwright install chromium
```

Expected: no errors, `node_modules/` populated, chromium downloaded.

- [ ] **Step 3: Write tsconfig.json**

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src", ".astro/types.d.ts"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Create src/env.d.ts**

Create `src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 5: Write astro.config.mjs**

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://moss.sg',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 6: Create minimal global.css so `astro check` passes**

Create `src/styles/global.css`:

```css
@import 'tailwindcss';

/* design tokens land here in the next task */
```

- [ ] **Step 7: Verify astro check runs clean**

Run:

```bash
npx astro check
```

Expected: `0 errors, 0 warnings` (may print "no pages" — that is fine).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs src/env.d.ts src/styles/global.css
git commit -m "chore: init Astro 5 + Tailwind v4 + TS strict"
```

---

## Task 2: Design tokens & font loading

**Files:**
- Modify: `src/styles/global.css`
- Create: `public/favicon.svg`

- [ ] **Step 1: Write global.css with design tokens, fonts, base resets**

Overwrite `src/styles/global.css`:

```css
@import 'tailwindcss';
@import '@fontsource-variable/geist-mono';

/* LXGW WenKai Screen (Chinese) via jsdelivr */
@import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web@1.7.0/style.css');

@theme {
  /* Colors — deep space base, moss amber accent, subtle moss green */
  --color-void: #05070d;
  --color-deep: #0a0f1c;
  --color-ink: #e6e8ef;
  --color-ink-dim: #8a93a6;
  --color-amber: #ff7a45;       /* MOSS eye */
  --color-amber-glow: #ffb08a;
  --color-moss: #6fae7a;
  --color-status-active: #22c55e;
  --color-status-wip: #f59e0b;
  --color-status-archived: #6b7280;

  /* Fonts */
  --font-mono: 'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-serif-cn: 'LXGW WenKai Screen', 'LXGW WenKai', 'Noto Serif CJK SC', serif;
}

html,
body {
  background: var(--color-void);
  color: var(--color-ink);
  font-family: var(--font-mono);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

html[lang^='zh'] body {
  /* CN body text leans on LXGW WenKai; code-ish elements stay mono */
  font-family: var(--font-serif-cn);
}

/* Reduced motion: strip animations and transitions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}

/* Selection */
::selection {
  background: var(--color-amber);
  color: var(--color-void);
}

/* Hide scrollbar track noise (keep function) */
html {
  scrollbar-color: var(--color-ink-dim) transparent;
}
```

- [ ] **Step 2: Create favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#05070d"/>
  <circle cx="16" cy="16" r="6" fill="#ff7a45"/>
  <circle cx="16" cy="16" r="9" fill="none" stroke="#ff7a45" stroke-opacity="0.35" stroke-width="1"/>
</svg>
```

- [ ] **Step 3: Verify astro check passes**

Run:

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css public/favicon.svg
git commit -m "feat: design tokens, fonts, reduced-motion guardrails"
```

---

## Task 3: i18n string bundle

**Files:**
- Create: `src/data/i18n.ts`

- [ ] **Step 1: Write i18n.ts with full bilingual copy**

Create `src/data/i18n.ts`:

```ts
export type Locale = 'en' | 'zh';

export interface DirectiveItem {
  n: string;
  en: string;
  zh: string;
}

export interface StringBundle {
  meta: { title: string; description: string };
  hero: { boot: [string, string]; byline: string; easter: string };
  manifesto: { heading: string; body: string[] };
  subsystems: { heading: string };
  directives: { heading: string; items: DirectiveItem[] };
  footer: {
    system: string;
    uptime: string;
    operator: string;
    status: string;
    quote: string;
  };
  langToggle: { label: string; href: string };
  easterModalClose: string;
}

const DIRECTIVES: DirectiveItem[] = [
  {
    n: '01',
    en: 'Build small things that compound.',
    zh: '做小的、会复利的事。',
  },
  {
    n: '02',
    en: 'Honesty over flattery. Depth over reach.',
    zh: '真话胜过赞美，深度胜过广度。',
  },
  {
    n: '03',
    en: 'Learn in public. Ship in silence.',
    zh: '公开地学习，安静地交付。',
  },
];

export const STRINGS: Record<Locale, StringBundle> = {
  en: {
    meta: {
      title: 'moss.sg — a quiet moss, growing in the signal',
      description:
        'One-person civilization, growing slowly. A mothership for the Moss subsystems.',
    },
    hero: {
      boot: ['> Initializing 550W × 1...', '> A one-person civilization, growing slowly.'],
      byline: "I'm YM, writing code in Singapore. This is my server, garden, and spacecraft.",
      easter: 'The period is a choice. Click it.',
    },
    manifesto: {
      heading: '// MANIFESTO',
      body: [
        "Moss doesn't bloom. It doesn't compete for light.",
        'It just spreads, quietly turning a stone into an ecosystem.',
        'I like that kind of growth.',
        'No grand narrative here. No growth curves.',
        'Just one engineer, writing code after hours,',
        'building small tools, leaving small signals—',
        'trying to contribute, in my own way,',
        'to the continuation of something larger.',
      ],
    },
    subsystems: { heading: '// SUBSYSTEMS' },
    directives: { heading: '// CORE DIRECTIVES', items: DIRECTIVES },
    footer: {
      system: 'system: moss.sg',
      uptime: 'uptime: since 2026',
      operator: 'operator: YM',
      status: 'status: growing',
      quote: 'The only way to ensure continuity is to keep our sanity — and a bit of humor.',
    },
    langToggle: { label: '中', href: '/zh/' },
    easterModalClose: 'close',
  },
  zh: {
    meta: {
      title: 'moss.sg — 一片生长在信号里的苔藓',
      description: '一个人的文明延续计划。Moss 子系统的母舰入口。',
    },
    hero: {
      boot: ['> 正在初始化 550W × 1...', '> 一个人的文明，在缓慢生长。'],
      byline: '我是 YM，在新加坡写代码。这里是我的服务器、花园，和飞船。',
      easter: '这个句号是刻意的。点一下。',
    },
    manifesto: {
      heading: '// 关于这片苔藓',
      body: [
        '苔藓不开花，不结果，不争光。',
        '它只是慢慢覆盖，安静地把一块石头变成一片生态。',
        '我喜欢这样的生长方式。',
        '这里没有大叙事，也没有增长曲线。',
        '只有一个工程师，在业余时间写一些代码、',
        '做一些小工具、记录一些想法，',
        '并试图在星辰大海里，',
        '留下一点可以被后人解析的信号。',
        '—— 延续文明的方式很多，这是我的一种。',
      ],
    },
    subsystems: { heading: '// 子系统' },
    directives: { heading: '// 三条准则', items: DIRECTIVES },
    footer: {
      system: 'system: moss.sg',
      uptime: 'uptime: since 2026',
      operator: 'operator: YM',
      status: 'status: growing',
      quote: '延续文明的唯一方法，是保持理智 —— 和一点幽默感。',
    },
    langToggle: { label: 'EN', href: '/' },
    easterModalClose: '关闭',
  },
};
```

- [ ] **Step 2: Verify types compile**

Run:

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/data/i18n.ts
git commit -m "feat: bilingual string bundle"
```

---

## Task 4: Projects data (magi + sbti)

**Files:**
- Create: `src/data/projects.ts`

- [ ] **Step 1: Write projects.ts**

Create `src/data/projects.ts`:

```ts
export type Status = 'ACTIVE' | 'WIP' | 'ARCHIVED';

export interface Project {
  name: string;
  url: string;
  status: Status;
  description: { en: string; zh: string };
  tech?: string;
  updated: string; // YYYY-MM
}

export const PROJECTS: Project[] = [
  {
    name: 'magi',
    url: 'https://magi.moss.sg',
    status: 'ACTIVE',
    description: {
      en: 'Three wise men, one question, zero hallucination tolerance. A MAGI-inspired multi-LLM consensus oracle.',
      zh: '三贤者共识系统 —— 致敬 EVA 的 MAGI。三个 LLM 独立判断，少数服从多数。',
    },
    tech: 'React · Vite · OpenRouter',
    updated: '2026-04',
  },
  {
    name: 'sbti',
    url: 'https://sbti.moss.sg',
    status: 'WIP',
    description: {
      en: 'The Sha-Bi Targets initiative. Because the serious one already has a website.',
      zh: '傻逼目标倡议 —— 一本正经地胡说八道。',
    },
    updated: '2026-04',
  },
];
```

- [ ] **Step 2: Verify types compile**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/data/projects.ts
git commit -m "feat: seed projects (magi, sbti)"
```

---

## Task 5: Status utility (TDD)

**Files:**
- Create: `tests/unit/status.test.ts`
- Create: `src/lib/status.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `tests/unit/status.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { statusMeta } from '@/lib/status';

describe('statusMeta', () => {
  it('returns green + pulse for ACTIVE', () => {
    const m = statusMeta('ACTIVE');
    expect(m.color).toBe('#22c55e');
    expect(m.pulse).toBe(true);
    expect(m.label).toBe('ACTIVE');
  });

  it('returns amber + pulse for WIP', () => {
    const m = statusMeta('WIP');
    expect(m.color).toBe('#f59e0b');
    expect(m.pulse).toBe(true);
    expect(m.label).toBe('WIP');
  });

  it('returns gray + no pulse for ARCHIVED', () => {
    const m = statusMeta('ARCHIVED');
    expect(m.color).toBe('#6b7280');
    expect(m.pulse).toBe(false);
    expect(m.label).toBe('ARCHIVED');
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run:

```bash
npm run test
```

Expected: FAIL — `Cannot find module '@/lib/status'`.

- [ ] **Step 4: Implement status.ts**

Create `src/lib/status.ts`:

```ts
import type { Status } from '@/data/projects';

export interface StatusMeta {
  color: string;
  pulse: boolean;
  label: Status;
}

export function statusMeta(status: Status): StatusMeta {
  switch (status) {
    case 'ACTIVE':
      return { color: '#22c55e', pulse: true, label: 'ACTIVE' };
    case 'WIP':
      return { color: '#f59e0b', pulse: true, label: 'WIP' };
    case 'ARCHIVED':
      return { color: '#6b7280', pulse: false, label: 'ARCHIVED' };
  }
}
```

- [ ] **Step 5: Run to verify pass**

Run:

```bash
npm run test
```

Expected: PASS — 3 passing.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/status.test.ts src/lib/status.ts vitest.config.ts
git commit -m "feat(lib): statusMeta with unit tests"
```

---

## Task 6: Date utility (TDD)

**Files:**
- Create: `tests/unit/date.test.ts`
- Create: `src/lib/date.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/date.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatMonth } from '@/lib/date';

describe('formatMonth', () => {
  it('passes through valid YYYY-MM', () => {
    expect(formatMonth('2026-04')).toBe('2026-04');
  });

  it('extracts YYYY-MM from a full ISO date', () => {
    expect(formatMonth('2026-04-17')).toBe('2026-04');
  });

  it('extracts YYYY-MM from ISO datetime', () => {
    expect(formatMonth('2026-04-17T10:30:00Z')).toBe('2026-04');
  });

  it('returns input unchanged when not parseable', () => {
    expect(formatMonth('unknown')).toBe('unknown');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement date.ts**

Create `src/lib/date.ts`:

```ts
const YYYY_MM = /^(\d{4})-(\d{2})/;

export function formatMonth(input: string): string {
  const m = YYYY_MM.exec(input);
  if (!m) return input;
  return `${m[1]}-${m[2]}`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test`
Expected: PASS — 4 + 3 = 7 passing total.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/date.test.ts src/lib/date.ts
git commit -m "feat(lib): formatMonth with unit tests"
```

---

## Task 7: Starfield background (Canvas, 3-layer parallax + nebula + eye + meteors)

**Files:**
- Create: `src/components/Starfield.astro`

Adapted from the reference implementation at `Downloads/moss_starfield_v2.html`. Full-viewport fixed background. Renders:
- 160 far stars (no parallax, twinkle only)
- 90 mid stars (parallax, twinkle, ~10% amber-tinted)
- 14 near stars (strong parallax, twinkle, ~25% amber, with flare cross)
- A rotated/stretched violet-blue nebula gradient
- A central pulsing amber "eye" (positioned at `h * 0.28` so the hero `moss.` title sits in its halo)
- Occasional meteors (≤2 concurrent, ~1 every few seconds)
- Mouse parallax (desktop, eased) or `deviceorientation` tilt (touch)
- `prefers-reduced-motion`: draws one static frame then stops — no animation, no meteors

- [ ] **Step 1: Write the component**

Create `src/components/Starfield.astro`:

```astro
---
// Full-viewport canvas background with 3 parallax layers, nebula, MOSS eye, meteors.
// Reference: Downloads/moss_starfield_v2.html, adapted to full viewport + reduced-motion.
---

<canvas id="moss-stars" aria-hidden="true"></canvas>

<style>
  #moss-stars {
    position: fixed;
    inset: 0;
    z-index: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    background: #050509;
    display: block;
  }
</style>

<script>
  type FarStar = { x: number; y: number; r: number; a: number; phase: number };
  type LayerStar = {
    x: number;
    y: number;
    z: number;
    r: number;
    amber: boolean;
    phase: number;
  };
  type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

  const canvas = document.getElementById('moss-stars') as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d') ?? null;

  if (canvas && ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reducedMQ.matches;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let eyeY = 0;

    let farStars: FarStar[] = [];
    let midStars: LayerStar[] = [];
    let nearStars: LayerStar[] = [];
    let meteors: Meteor[] = [];

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let rafId = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      eyeY = h * 0.28; // lift the eye so hero title sits in the halo
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      farStars = [];
      midStars = [];
      nearStars = [];
      const density = (w * h) / (1440 * 820);
      const farN = Math.round(160 * density);
      const midN = Math.round(90 * density);
      const nearN = Math.round(14 * density);
      for (let i = 0; i < farN; i++) {
        farStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.7 + 0.2,
          a: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < midN; i++) {
        midStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.5 + 0.4,
          r: Math.random() * 1.0 + 0.4,
          amber: Math.random() < 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < nearN; i++) {
        nearStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.4 + 0.6,
          r: Math.random() * 1.2 + 1.2,
          amber: Math.random() < 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function nebula() {
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(-Math.PI / 5);
      ctx!.scale(2.8, 0.35);
      const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, w * 0.7);
      g.addColorStop(0, 'rgba(120, 130, 210, 0.16)');
      g.addColorStop(0.5, 'rgba(140, 90, 190, 0.09)');
      g.addColorStop(1, 'rgba(120, 130, 210, 0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(-w * 2, -h * 2, w * 4, h * 4);
      ctx!.restore();
    }

    function eye(t: number, pulse: number) {
      const g1 = ctx!.createRadialGradient(cx, eyeY, 0, cx, eyeY, 380);
      g1.addColorStop(0, `rgba(255, 130, 50, ${0.16 * pulse})`);
      g1.addColorStop(0.25, `rgba(255, 100, 40, ${0.06 * pulse})`);
      g1.addColorStop(1, 'rgba(255, 130, 50, 0)');
      ctx!.fillStyle = g1;
      ctx!.fillRect(0, 0, w, h);

      const g2 = ctx!.createRadialGradient(cx, eyeY, 0, cx, eyeY, 50);
      g2.addColorStop(0, `rgba(255, 225, 160, ${0.9 * pulse})`);
      g2.addColorStop(0.35, `rgba(255, 160, 80, ${0.55 * pulse})`);
      g2.addColorStop(1, 'rgba(255, 130, 50, 0)');
      ctx!.fillStyle = g2;
      ctx!.beginPath();
      ctx!.arc(cx, eyeY, 50, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(cx, eyeY, 70 + Math.sin(t * 0.0008) * 4, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(255, 150, 80, ${0.18 * pulse})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(cx, eyeY, 2.5, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(255, 240, 210, 1)';
      ctx!.fill();
    }

    function flareStar(x: number, y: number, r: number, alpha: number, amber: boolean) {
      const color = amber ? '255, 190, 120' : '220, 235, 255';
      const core = amber ? '255, 225, 185' : '255, 255, 255';
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${core}, ${alpha})`;
      ctx!.fill();
      const fl = r * 11;
      const gh = ctx!.createLinearGradient(x - fl, y, x + fl, y);
      gh.addColorStop(0, `rgba(${color}, 0)`);
      gh.addColorStop(0.5, `rgba(${color}, ${alpha * 0.55})`);
      gh.addColorStop(1, `rgba(${color}, 0)`);
      ctx!.fillStyle = gh;
      ctx!.fillRect(x - fl, y - 0.4, fl * 2, 0.8);
      const gv = ctx!.createLinearGradient(x, y - fl, x, y + fl);
      gv.addColorStop(0, `rgba(${color}, 0)`);
      gv.addColorStop(0.5, `rgba(${color}, ${alpha * 0.55})`);
      gv.addColorStop(1, `rgba(${color}, 0)`);
      ctx!.fillStyle = gv;
      ctx!.fillRect(x - 0.4, y - fl, 0.8, fl * 2);
    }

    function updateMeteors() {
      if (!reduced && Math.random() < 0.005 && meteors.length < 2) {
        const fromLeft = Math.random() < 0.5;
        meteors.push({
          x: fromLeft ? -20 : w + 20,
          y: Math.random() * h * 0.5,
          vx: fromLeft ? 5 + Math.random() * 3 : -5 - Math.random() * 3,
          vy: 2 + Math.random() * 2,
          life: 1.0,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const mag = Math.hypot(m.vx, m.vy);
        const tailLen = 60;
        const x2 = m.x - (m.vx / mag) * tailLen;
        const y2 = m.y - (m.vy / mag) * tailLen;
        const g = ctx!.createLinearGradient(m.x, m.y, x2, y2);
        g.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
        g.addColorStop(0.3, `rgba(200, 220, 255, ${m.life * 0.4})`);
        g.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.4;
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.015;
        if (m.life <= 0 || m.x < -80 || m.x > w + 80 || m.y > h + 80) {
          meteors.splice(i, 1);
        }
      }
    }

    function draw(t: number) {
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      const ox = tx + Math.sin(t * 0.00008) * 0.1;
      const oy = ty + Math.cos(t * 0.0001) * 0.06;

      ctx!.fillStyle = '#050509';
      ctx!.fillRect(0, 0, w, h);
      nebula();

      for (const s of farStars) {
        const tw = Math.sin(t * 0.0012 + s.phase) * 0.3 + 0.7;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(210, 220, 245, ${tw * s.a})`;
        ctx!.fill();
      }
      for (const s of midStars) {
        const px = s.x - ox * 40 * s.z;
        const py = s.y - oy * 40 * s.z;
        const tw = Math.sin(t * 0.0014 + s.phase) * 0.3 + 0.7;
        ctx!.beginPath();
        ctx!.arc(px, py, s.r * s.z, 0, Math.PI * 2);
        ctx!.fillStyle = s.amber
          ? `rgba(255, 190, 120, ${tw * s.z * 0.9})`
          : `rgba(220, 235, 255, ${tw * s.z * 0.8})`;
        ctx!.fill();
      }

      const pulse = Math.sin(t * 0.0012) * 0.25 + 0.75;
      eye(t, pulse);

      for (const s of nearStars) {
        const px = s.x - ox * 85 * s.z;
        const py = s.y - oy * 85 * s.z;
        const tw = Math.sin(t * 0.001 + s.phase) * 0.3 + 0.7;
        flareStar(px, py, s.r * s.z, tw * s.z * 0.95, s.amber);
      }

      updateMeteors();

      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    }

    if (!isTouch) {
      window.addEventListener(
        'mousemove',
        (e) => {
          mx = (e.clientX - w / 2) / w;
          my = (e.clientY - h / 2) / h;
        },
        { passive: true },
      );
    } else {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          mx = Math.max(-0.5, Math.min(0.5, e.gamma / 40));
          my = Math.max(-0.5, Math.min(0.5, (e.beta - 30) / 40));
        }
      });
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(rafId);
      resize();
      seed();
      rafId = requestAnimationFrame(draw);
    });

    reducedMQ.addEventListener('change', (e) => {
      reduced = e.matches;
      cancelAnimationFrame(rafId);
      if (reduced) {
        // draw once and stop
        draw(performance.now());
      } else {
        rafId = requestAnimationFrame(draw);
      }
    });

    resize();
    seed();
    if (reduced) {
      draw(performance.now()); // one static frame
    } else {
      rafId = requestAnimationFrame(draw);
    }
  }
</script>
```

- [ ] **Step 2: Dev server visual check**

Run: `npm run dev` → open http://localhost:4321/. Verify:
- Starfield fills viewport with three layers of stars, slow twinkle
- Faint violet-blue nebula stretched across mid-height
- Amber "eye" pulses at horizontal center, upper third
- Mouse movement causes mid/near stars to drift (eased, not snappy)
- Every few seconds a meteor streaks across the top half
- Near stars have a faint + shaped flare
- ~10% of mid stars and ~25% of near stars are amber-tinted
- Open DevTools → System preferences → reduce motion: refresh → stars render static, no meteors

Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Starfield.astro
git commit -m "feat(ui): 3-layer starfield with nebula, MOSS eye, meteors, flare stars"
```

---

## Task 8: Typewriter component

**Files:**
- Create: `src/components/Typewriter.astro`

- [ ] **Step 1: Write the component**

Create `src/components/Typewriter.astro`:

```astro
---
interface Props {
  lines: string[];
  /** ms per character */
  speed?: number;
  /** ms between lines */
  linePause?: number;
  /** ms delay before starting */
  startDelay?: number;
  class?: string;
}

const {
  lines,
  speed = 32,
  linePause = 360,
  startDelay = 120,
  class: className = '',
} = Astro.props;

const payload = JSON.stringify({ lines, speed, linePause, startDelay });
---

<div class={`moss-typewriter ${className}`.trim()} data-tw={payload}>
  {
    lines.map((line, i) => (
      <div class="tw-line" data-i={i}>
        <span class="tw-text" aria-label={line}></span>
        <span class="tw-cursor" aria-hidden="true">_</span>
      </div>
    ))
  }
  <noscript>
    {lines.map((line) => <div>{line}</div>)}
  </noscript>
</div>

<style>
  .moss-typewriter {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: var(--color-ink);
  }
  .tw-line {
    display: flex;
    align-items: baseline;
    gap: 0.15ch;
    min-height: 1.4em;
  }
  .tw-cursor {
    display: inline-block;
    color: var(--color-amber);
    animation: tw-blink 1s steps(1) infinite;
  }
  .tw-line:not(.tw-done) .tw-cursor {
    opacity: 1;
  }
  .tw-line.tw-done .tw-cursor {
    opacity: 0.35;
  }
  @keyframes tw-blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tw-cursor {
      display: none;
    }
  }
</style>

<script>
  type TwConfig = { lines: string[]; speed: number; linePause: number; startDelay: number };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll<HTMLElement>('.moss-typewriter').forEach((root) => {
    const cfg = JSON.parse(root.dataset.tw || '{}') as TwConfig;
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.tw-line'));

    if (reduced) {
      lines.forEach((el, i) => {
        const span = el.querySelector<HTMLElement>('.tw-text');
        if (span) span.textContent = cfg.lines[i] ?? '';
        el.classList.add('tw-done');
      });
      return;
    }

    const run = async () => {
      await wait(cfg.startDelay);
      for (let i = 0; i < lines.length; i++) {
        const el = lines[i];
        const span = el.querySelector<HTMLElement>('.tw-text');
        if (!span) continue;
        const text = cfg.lines[i] ?? '';
        for (let c = 0; c < text.length; c++) {
          span.textContent = text.slice(0, c + 1);
          await wait(cfg.speed);
        }
        el.classList.add('tw-done');
        await wait(cfg.linePause);
      }
    };

    run();
  });

  function wait(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Typewriter.astro
git commit -m "feat(ui): typewriter with reduced-motion fallback"
```

---

## Task 9: LangToggle + Base layout

**Files:**
- Create: `src/components/LangToggle.astro`
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: LangToggle component**

Create `src/components/LangToggle.astro`:

```astro
---
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].langToggle;
---

<a href={t.href} class="lang-toggle" aria-label={`Switch language to ${t.label}`}>
  {t.label}
</a>

<style>
  .lang-toggle {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 10;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-ink-dim);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    text-decoration: none;
    transition: color 0.25s, border-color 0.25s;
    background: rgba(10, 15, 28, 0.55);
    backdrop-filter: blur(6px);
  }
  .lang-toggle:hover {
    color: var(--color-amber);
    border-color: var(--color-amber);
  }
</style>
```

- [ ] **Step 2: Base layout**

Create `src/layouts/Base.astro`:

```astro
---
import '@/styles/global.css';
import Starfield from '@/components/Starfield.astro';
import LangToggle from '@/components/LangToggle.astro';
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale];
const htmlLang = locale === 'zh' ? 'zh-CN' : 'en';
---

<!doctype html>
<html lang={htmlLang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{t.meta.title}</title>
    <meta name="description" content={t.meta.description} />
    <meta property="og:title" content={t.meta.title} />
    <meta property="og:description" content={t.meta.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.site?.toString() ?? 'https://moss.sg/'} />
    <link rel="alternate" hreflang="en" href="https://moss.sg/" />
    <link rel="alternate" hreflang="zh-CN" href="https://moss.sg/zh/" />
    <link rel="alternate" hreflang="x-default" href="https://moss.sg/" />
  </head>
  <body>
    <Starfield />
    <LangToggle locale={locale} />
    <main class="shell">
      <slot />
    </main>

    <style>
      .shell {
        position: relative;
        z-index: 1;
        max-width: 64rem;
        margin: 0 auto;
        padding: 6rem 1.5rem 4rem;
        display: flex;
        flex-direction: column;
        gap: 6rem;
      }
      @media (min-width: 768px) {
        .shell {
          padding: 8rem 3rem 6rem;
        }
      }
    </style>

    <script>
      // Console easter eggs — see Task 15 for the ASCII art source.
      const ASCII_MOSS = [
        '       .-""""-.  ',
        "      '        \\ ",
        "     /   MOSS   \\",
        "    /   550W × 1 \\",
        "    '--.______.--'",
      ].join('\n');
      // eslint-disable-next-line no-console
      console.log('%c550W online.', 'color:#ff7a45; font-family: monospace; font-size: 14px;');
      // eslint-disable-next-line no-console
      console.log('%c' + ASCII_MOSS, 'color:#6fae7a; font-family: monospace; font-size: 11px;');
      // eslint-disable-next-line no-console
      console.log(
        "%cMoss doesn't fight crawlers. It outlives them.",
        'color:#8a93a6; font-family: monospace;',
      );
    </script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LangToggle.astro src/layouts/Base.astro
git commit -m "feat(ui): base layout with lang toggle and console boot log"
```

---

## Task 10: Hero + EasterModal

**Files:**
- Create: `src/components/EasterModal.astro`
- Create: `src/components/Hero.astro`

- [ ] **Step 1: EasterModal component**

Create `src/components/EasterModal.astro`:

```astro
---
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const quote = STRINGS[locale].footer.quote;
const closeLabel = STRINGS[locale].easterModalClose;
---

<dialog id="moss-easter" aria-label="MOSS quote">
  <div class="easter-body">
    <p class="easter-quote">{quote}</p>
    <p class="easter-sig">— MOSS · 550W</p>
    <form method="dialog">
      <button type="submit">{closeLabel}</button>
    </form>
  </div>
</dialog>

<style>
  dialog {
    background: var(--color-deep);
    color: var(--color-ink);
    border: 1px solid rgba(255, 122, 69, 0.4);
    border-radius: 6px;
    padding: 2rem;
    max-width: 32rem;
    font-family: var(--font-mono);
  }
  dialog::backdrop {
    background: rgba(5, 7, 13, 0.72);
    backdrop-filter: blur(3px);
  }
  .easter-quote {
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0 0 1rem;
  }
  html[lang^='zh'] .easter-quote {
    font-family: var(--font-serif-cn);
    font-size: 1.2rem;
  }
  .easter-sig {
    color: var(--color-amber);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 1.5rem;
  }
  button {
    background: transparent;
    color: var(--color-ink-dim);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-family: var(--font-mono);
    cursor: pointer;
  }
  button:hover {
    color: var(--color-amber);
    border-color: var(--color-amber);
  }
</style>

<script>
  const dlg = document.getElementById('moss-easter') as HTMLDialogElement | null;
  document.querySelectorAll<HTMLElement>('[data-easter-trigger]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      dlg?.showModal();
    });
  });
</script>
```

- [ ] **Step 2: Hero component**

Create `src/components/Hero.astro`:

```astro
---
import Typewriter from '@/components/Typewriter.astro';
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].hero;
---

<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title" class="title">
    moss<button
      type="button"
      class="title-dot"
      data-easter-trigger
      aria-label={t.easter}
      title={t.easter}>.</button
    >
  </h1>
  <Typewriter lines={t.boot as [string, string]} class="boot" />
  <p class="byline">{t.byline}</p>
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 2rem;
  }
  .title {
    font-family: var(--font-mono);
    font-size: clamp(3rem, 10vw, 6.5rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    margin: 0;
    color: var(--color-ink);
  }
  .title-dot {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: var(--color-amber);
    cursor: pointer;
    position: relative;
    animation: dot-pulse 3.4s ease-in-out infinite;
  }
  .title-dot:focus-visible {
    outline: 2px solid var(--color-amber);
    outline-offset: 4px;
    border-radius: 4px;
  }
  @keyframes dot-pulse {
    0%, 100% {
      text-shadow: 0 0 0 rgba(255, 122, 69, 0);
    }
    50% {
      text-shadow: 0 0 24px rgba(255, 122, 69, 0.6);
    }
  }
  .boot {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    color: var(--color-ink-dim);
  }
  .byline {
    font-size: 0.95rem;
    color: var(--color-ink-dim);
    max-width: 40rem;
    line-height: 1.7;
    margin: 0.5rem 0 0;
  }
  html[lang^='zh'] .byline {
    font-family: var(--font-serif-cn);
    font-size: 1.05rem;
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/EasterModal.astro src/components/Hero.astro
git commit -m "feat(ui): hero section with clickable-period easter egg"
```

---

## Task 11: Manifesto section

**Files:**
- Create: `src/components/Manifesto.astro`

- [ ] **Step 1: Write the component**

Create `src/components/Manifesto.astro`:

```astro
---
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].manifesto;
---

<section class="manifesto" aria-labelledby="manifesto-heading">
  <h2 id="manifesto-heading" class="section-heading">{t.heading}</h2>
  <div class="prose">
    {t.body.map((line) => <p>{line}</p>)}
  </div>
</section>

<style>
  .section-heading {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-amber);
    letter-spacing: 0.12em;
    margin: 0 0 2rem;
  }
  .prose {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    color: var(--color-ink);
    line-height: 1.8;
    max-width: 40rem;
    font-size: 0.98rem;
  }
  .prose p {
    margin: 0;
  }
  html[lang^='zh'] .prose {
    font-family: var(--font-serif-cn);
    font-size: 1.1rem;
    line-height: 2;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Manifesto.astro
git commit -m "feat(ui): manifesto section"
```

---

## Task 12: Subsystems grid + ProjectCard

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/Subsystems.astro`

- [ ] **Step 1: ProjectCard**

Create `src/components/ProjectCard.astro`:

```astro
---
import type { Project } from '@/data/projects';
import type { Locale } from '@/data/i18n';
import { statusMeta } from '@/lib/status';
import { formatMonth } from '@/lib/date';

interface Props {
  project: Project;
  locale: Locale;
}

const { project, locale } = Astro.props;
const meta = statusMeta(project.status);
const host = project.url.replace(/^https?:\/\//, '');
const updatedLabel = locale === 'zh' ? '最近更新' : 'Last updated';
---

<a class="card" href={project.url} target="_blank" rel="noopener noreferrer">
  <header class="card-head">
    <span
      class="dot"
      style={`--dot: ${meta.color}`}
      data-pulse={meta.pulse ? 'true' : 'false'}
      aria-hidden="true"></span>
    <span class="name">{project.name}</span>
    <span class="status">[{meta.label}]</span>
  </header>
  <div class="host">{host}</div>
  <p class="desc">{project.description[locale]}</p>
  {project.tech && <p class="tech">{project.tech}</p>}
  <footer class="meta">
    <span>{updatedLabel}: {formatMonth(project.updated)}</span>
  </footer>
</a>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    text-decoration: none;
    color: var(--color-ink);
    background: rgba(10, 15, 28, 0.5);
    transition: border-color 0.25s, transform 0.25s, background 0.25s;
  }
  .card:hover {
    border-color: rgba(255, 122, 69, 0.4);
    transform: translateY(-2px);
    background: rgba(10, 15, 28, 0.75);
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-mono);
  }
  .dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 999px;
    background: var(--dot);
    box-shadow: 0 0 8px color-mix(in srgb, var(--dot) 60%, transparent);
  }
  .dot[data-pulse='true'] {
    animation: card-pulse 2.2s ease-in-out infinite;
  }
  @keyframes card-pulse {
    0%, 100% {
      box-shadow: 0 0 4px color-mix(in srgb, var(--dot) 40%, transparent);
    }
    50% {
      box-shadow: 0 0 14px color-mix(in srgb, var(--dot) 90%, transparent);
    }
  }
  .name {
    font-weight: 600;
    color: var(--color-ink);
  }
  .status {
    color: var(--color-ink-dim);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
  }
  .host {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-amber);
  }
  .desc {
    margin: 0.4rem 0 0;
    color: var(--color-ink);
    line-height: 1.7;
    font-size: 0.95rem;
  }
  html[lang^='zh'] .desc {
    font-family: var(--font-serif-cn);
    font-size: 1.05rem;
  }
  .tech {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-ink-dim);
  }
  .meta {
    margin-top: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-ink-dim);
    letter-spacing: 0.04em;
  }
</style>
```

- [ ] **Step 2: Subsystems section**

Create `src/components/Subsystems.astro`:

```astro
---
import ProjectCard from '@/components/ProjectCard.astro';
import { PROJECTS } from '@/data/projects';
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].subsystems;
---

<section class="subsystems" aria-labelledby="subsystems-heading">
  <h2 id="subsystems-heading" class="section-heading">{t.heading}</h2>
  <div class="grid">
    {PROJECTS.map((p) => <ProjectCard project={p} locale={locale} />)}
  </div>
</section>

<style>
  .section-heading {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-amber);
    letter-spacing: 0.12em;
    margin: 0 0 2rem;
  }
  .grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.astro src/components/Subsystems.astro
git commit -m "feat(ui): subsystems grid with status-light cards"
```

---

## Task 13: Directives section

**Files:**
- Create: `src/components/Directives.astro`

- [ ] **Step 1: Write the component**

Create `src/components/Directives.astro`:

```astro
---
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].directives;
---

<section class="directives" aria-labelledby="directives-heading">
  <h2 id="directives-heading" class="section-heading">{t.heading}</h2>
  <ol class="list">
    {
      t.items.map((d) => (
        <li>
          <span class="num">{d.n}.</span>
          <div class="body">
            <p class="en">{d.en}</p>
            <p class="zh">{d.zh}</p>
          </div>
        </li>
      ))
    }
  </ol>
</section>

<style>
  .section-heading {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-amber);
    letter-spacing: 0.12em;
    margin: 0 0 2rem;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  li {
    display: grid;
    grid-template-columns: 3rem 1fr;
    gap: 1rem;
    align-items: baseline;
  }
  .num {
    font-family: var(--font-mono);
    color: var(--color-amber);
    letter-spacing: 0.1em;
  }
  .body p {
    margin: 0;
    line-height: 1.7;
  }
  .en {
    font-family: var(--font-mono);
    color: var(--color-ink);
  }
  .zh {
    font-family: var(--font-serif-cn);
    color: var(--color-ink-dim);
    font-size: 0.95rem;
    margin-top: 0.25rem !important;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Directives.astro
git commit -m "feat(ui): core directives section"
```

---

## Task 14: Footer

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write the component**

Create `src/components/Footer.astro`:

```astro
---
import { STRINGS, type Locale } from '@/data/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = STRINGS[locale].footer;
---

<footer class="footer" role="contentinfo">
  <div class="bar">
    <span>[ {t.system} ]</span>
    <span>[ {t.uptime} ]</span>
    <span>[ {t.operator} ]</span>
    <span>[ {t.status} <span class="blink">_</span> ]</span>
  </div>
  <p class="quote">{t.quote}</p>
</footer>

<style>
  .footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
    color: var(--color-ink-dim);
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.2rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
  }
  .blink {
    color: var(--color-amber);
    animation: tw-blink 1.4s steps(1) infinite;
  }
  .quote {
    margin: 0;
    font-family: var(--font-serif-cn);
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 40rem;
  }
  html[lang='en'] .quote {
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(ui): terminal-style footer"
```

---

## Task 15: EN home page (compose everything)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Write the page**

Create `src/pages/index.astro`:

```astro
---
import Base from '@/layouts/Base.astro';
import Hero from '@/components/Hero.astro';
import Manifesto from '@/components/Manifesto.astro';
import Subsystems from '@/components/Subsystems.astro';
import Directives from '@/components/Directives.astro';
import Footer from '@/components/Footer.astro';
import EasterModal from '@/components/EasterModal.astro';

const locale = 'en' as const;
---

<Base locale={locale}>
  <Hero locale={locale} />
  <Manifesto locale={locale} />
  <Subsystems locale={locale} />
  <Directives locale={locale} />
  <Footer locale={locale} />
  <EasterModal locale={locale} />
</Base>
```

- [ ] **Step 2: Run dev server and visually verify**

Run:

```bash
npm run dev
```

Open http://localhost:4321/ — verify:
- Starfield renders, stars drift, amber glow top-right
- "moss." title with amber pulsing period
- Typewriter lines appear one char at a time
- Byline + all sections render
- Clicking the period opens a modal with MOSS quote
- `中` toggle link top-right (will 404 until Task 16 — that's expected)
- Console shows `550W online.` + ASCII moss

Kill the dev server once verified (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: EN homepage composition"
```

---

## Task 16: ZH home page

**Files:**
- Create: `src/pages/zh/index.astro`

- [ ] **Step 1: Write the page**

Create `src/pages/zh/index.astro`:

```astro
---
import Base from '@/layouts/Base.astro';
import Hero from '@/components/Hero.astro';
import Manifesto from '@/components/Manifesto.astro';
import Subsystems from '@/components/Subsystems.astro';
import Directives from '@/components/Directives.astro';
import Footer from '@/components/Footer.astro';
import EasterModal from '@/components/EasterModal.astro';

const locale = 'zh' as const;
---

<Base locale={locale}>
  <Hero locale={locale} />
  <Manifesto locale={locale} />
  <Subsystems locale={locale} />
  <Directives locale={locale} />
  <Footer locale={locale} />
  <EasterModal locale={locale} />
</Base>
```

- [ ] **Step 2: Dev server check**

Run: `npm run dev`
Open http://localhost:4321/zh/ — verify Chinese copy renders with LXGW WenKai for prose sections; `EN` toggle top-right goes back to `/`.

Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/zh/index.astro
git commit -m "feat: ZH homepage composition"
```

---

## Task 17: 404 page + robots.txt

**Files:**
- Create: `src/pages/404.astro`
- Create: `public/robots.txt`

- [ ] **Step 1: 404 page**

Create `src/pages/404.astro`:

```astro
---
import Base from '@/layouts/Base.astro';

const locale = 'en' as const;
---

<Base locale={locale}>
  <section class="not-found">
    <p class="prompt">&gt; ERROR: Path not in this galaxy.</p>
    <p class="sub">Try <a href="/">moss.sg</a>.</p>
  </section>
</Base>

<style>
  .not-found {
    padding-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .prompt {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    color: var(--color-amber);
    margin: 0;
  }
  .sub {
    font-family: var(--font-mono);
    color: var(--color-ink-dim);
    margin: 0;
  }
  .sub a {
    color: var(--color-ink);
    border-bottom: 1px dashed var(--color-amber);
    text-decoration: none;
  }
  .sub a:hover {
    color: var(--color-amber);
  }
</style>
```

- [ ] **Step 2: robots.txt**

Create `public/robots.txt`:

```
# Moss doesn't fight crawlers. It outlives them.

User-agent: *
Allow: /

Sitemap: https://moss.sg/sitemap-index.xml
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro public/robots.txt
git commit -m "feat: 404 page and robots.txt with moss manifesto"
```

---

## Task 18: Playwright smoke test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- [ ] **Step 2: Smoke test**

Create `tests/e2e/homepage.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('moss.sg homepage', () => {
  test('EN home loads and key elements are present', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.goto('/');

    await expect(page).toHaveTitle(/moss\.sg/);
    await expect(page.locator('#hero-title')).toContainText('moss');
    await expect(page.locator('#manifesto-heading')).toBeVisible();
    await expect(page.locator('#subsystems-heading')).toBeVisible();
    await expect(page.locator('#directives-heading')).toBeVisible();
    await expect(page.getByRole('link', { name: /magi/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /sbti/ })).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('language toggle round-trips EN <-> ZH', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /switch language to 中/i }).click();
    await expect(page).toHaveURL(/\/zh\/?$/);
    await expect(page.locator('#hero-title')).toContainText('moss');
    // ZH page shows EN toggle
    await page.getByRole('link', { name: /switch language to EN/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('clicking the period opens the easter modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-title .title-dot').click();
    await expect(page.locator('#moss-easter')).toBeVisible();
  });

  test('404 page shows the galaxy error', async ({ page }) => {
    const res = await page.goto('/this-does-not-exist');
    // Astro static 404: preview server returns 404 status
    expect([404, 200]).toContain(res?.status() ?? 0);
    await expect(page.locator('body')).toContainText('Path not in this galaxy');
  });
});
```

- [ ] **Step 3: Run the E2E tests**

Run:

```bash
npm run test:e2e
```

Expected: all 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e/homepage.spec.ts
git commit -m "test(e2e): homepage smoke + language toggle + easter modal + 404"
```

---

## Task 19: Production build sanity check

**Files:** none modified

- [ ] **Step 1: Full build**

Run:

```bash
npm run build
```

Expected: build finishes without errors; `dist/` contains `index.html`, `zh/index.html`, `404.html`, `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`, `favicon.svg`, and hashed asset files.

- [ ] **Step 2: Inspect dist contents**

Run:

```bash
ls dist
ls dist/zh
```

Expected: both listings show the expected files.

- [ ] **Step 3: Preview the built site**

Run:

```bash
npm run preview
```

Open http://localhost:4321/ and http://localhost:4321/zh/ — behave the same as dev. Kill with Ctrl+C.

- [ ] **Step 4: Run unit tests once more**

Run: `npm run test`
Expected: all passing.

No commit — verification only.

---

## Task 20: Deployment artifacts (CNAME, Cloudflare Pages notes)

**Files:**
- Create: `public/CNAME`
- Modify: `README.md`

- [ ] **Step 1: CNAME file**

Create `public/CNAME`:

```
moss.sg
```

(Not required by Cloudflare Pages for domain binding — that's done in the dashboard — but documents intent and also works if the repo is ever mirrored to GitHub Pages.)

- [ ] **Step 2: Update README with Cloudflare Pages specifics**

Overwrite `README.md`:

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add public/CNAME README.md
git commit -m "docs: deployment notes and CNAME"
```

---

## Task 21: Push and deploy

**Files:** none

- [ ] **Step 1: Push to GitHub**

Run:

```bash
git push -u origin main
```

- [ ] **Step 2: Cloudflare Pages setup (manual, one-time — done via dashboard, not CLI)**

In the Cloudflare dashboard:
1. Pages → Create a project → Connect to GitHub → select `moss-sg-site`.
2. Build settings as in README Task 20.
3. First deploy runs automatically.
4. After deploy succeeds, Custom domains → add `moss.sg`.

- [ ] **Step 3: Smoke-test the live site**

Once DNS propagates:
- https://moss.sg/ loads the EN homepage
- https://moss.sg/zh/ loads the ZH homepage
- https://moss.sg/this-does-not-exist loads the 404 page with "Path not in this galaxy."
- https://moss.sg/robots.txt shows the moss line
- DevTools console shows `550W online.` + ASCII moss

---

## Self-Review notes

Spec coverage cross-check against the Brief:

- **Domain + subdomain model** → documented in README; not code.
- **Five-section structure (B)** → Tasks 10–14 + 15/16.
- **Colors (deep space + amber + moss green)** → Task 2 `@theme`.
- **Fonts (Geist Mono + LXGW WenKai)** → Task 2 (`@fontsource-variable/geist-mono` + jsdelivr CDN).
- **Starfield** → Task 7, canvas 2D, 3 parallax layers (160 far / 90 mid / 14 near), twinkle, amber-tinted stars, rotated violet-blue nebula, meteors, desktop mouse parallax / touch `deviceorientation`, reduced-motion static frame.
- **Boot/typewriter** → Task 8, reduced-motion fallback.
- **MOSS amber "eye"** → central pulsing radial gradient at `(cx, h * 0.28)` in Starfield — the hero `moss.` title sits inside its halo; plus the independent pulsing period in Hero (both in amber so they rhyme).
- **Card with status lights** → Tasks 5, 12 (ProjectCard), tested in unit + E2E.
- **Manifesto / Directives** → Tasks 11, 13.
- **Footer terminal bar** → Task 14.
- **Bilingual (Option 2, two static pages)** → Tasks 3, 15, 16; toggle in Task 9.
- **`prefers-reduced-motion`** → global CSS override (Task 2) + per-component guards (Tasks 7, 8).
- **Easter eggs**: clickable period → Task 10; `console.log('550W online.')` + ASCII moss → Task 9; `robots.txt` line → Task 17; 404 → Task 17; five total.
- **LCP < 1.5s** — no LCP image, critical CSS inlined by Astro, fonts use `font-display: swap` via fontsource/CDN defaults; Cloudflare edge cache handles the rest. Not separately enforced by a task but architecturally covered.
- **Mobile not downgraded** — grid collapses to 1 column at <640px; Starfield runs at 2x DPR max (perf guardrail, not experience degradation).

Type consistency sweep: `Status`, `Project`, `StringBundle`, `StatusMeta`, `Locale` are defined once and imported; method names (`statusMeta`, `formatMonth`) match between tests and implementations. No renaming drift.

Placeholder sweep: no "TBD"/"TODO"/"fill in later" in any code step. The `tech?` field on `sbti` is intentionally undefined (optional type field); the UI conditionally renders it.
