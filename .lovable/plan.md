# Aetheria — single-screen portal (final build package)

## What the visitor sees
One full screen (no scrolling) on a deep space background with stars and planets. Steps change in place with a smooth "portal" transition:

1. Language: Armenian (default), Russian, English. The currency follows the language: ֏ / ₽ / $.
2. Project type: landing page, corporate site, online store, web app, 3D experience (each shows a "from" price).
3. Style: 4 cards with colour swatches (Void Luxe, Swiss minimal, Cyber, Warm Editorial).
4. Features: 3D, multi-language, user accounts, payments, Telegram/CRM, admin panel (pick several).
5. Timeline: Express ×1.25, Standard ×1, Flagship ×1.3.
6. Result: an animated live price, a summary, a contact form (name, phone/Telegram, email), an "Estimate PDF" button (print) and "Send request". Then a thank-you screen with a "New project" button.

The whole time you can see: the logo, a step progress bar, Back/Continue buttons, the language switch, the sound button, and a "Our work" button that opens a side panel of projects (cards with task/result and a link to the case page).

## Logic
- Prices and translations already exist in `src/lib/portal.ts` (tested): price = (base + features) × timeline multiplier, converted to AMD ×4.5 and USD ÷90.
- Choices are saved in the browser, so a reload continues from the same step.
- Keyboard: Enter goes forward, Backspace/Left arrow goes back.
- A request goes through the existing secure lead submission (spam and rate limits, Telegram notification). The type, style, features and price are sent in RUB.
- Light sound effects on steps and on success (off by default).

## Technical details
- New `src/components/portal/Portal.tsx` (state machine with steps 1–6, AnimatePresence transitions), `PortalSteps.tsx` (option cards), `WorkDrawer.tsx` (projects from `public-content.ts`).
- `src/routes/index.tsx` is replaced with a slim route: 100dvh, overflow hidden, reuses `ParticleField` plus the CSS planets, and the head() is updated with three-language metadata.
- The old long-page components stay in the repo but are not used. `/work/$slug`, `/admin`, the sitemap and the lead route stay unchanged.
- Add a test for the AMD/USD conversion and the timeline multiplier in `portal.test.ts`.
- Checks: tests, build log, Playwright at 384px and 1280px going through all 6 steps up to sending a test request.
