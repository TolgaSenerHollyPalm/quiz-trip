# Trip Quiz

Offline quiz and prediction game for a travel group, played on a single Android phone or tablet. Installed as a PWA from GitHub Pages; no backend.

## Development

Requires Node 26 (see `.github/workflows/deploy.yml`).

```bash
npm install
npm run dev        # http://localhost:5173/quiz-trip/
npm test           # unit tests (Vitest)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ with the service worker at http://localhost:4173/quiz-trip/
```

The service worker only runs in the production build, so test offline behaviour with `npm run build && npm run preview`.

## Question packs

Packs live in `public/packs/` and are listed in `public/packs/index.json`. The `eg-sharm-el-sheikh` pack is also built into the app, so a fresh install can play offline straight away.

`npm test` checks every pack against the schema and against `index.json` (question count, version, title…). The deploy workflow runs the tests first, so a broken pack is never published. Bump a pack's `version` (in the pack and in `index.json`) whenever its content changes.

Prediction templates are `number` or `choice`. A number template can have:

- `format: "duration"`: the value is a number of minutes, entered and shown as HH:MM.
- `params`: bounds that depend on the trip, entered in the app's trip settings, e.g.
  `"params": { "min": { "key": "minFloor", "label": "En alt kat" }, "max": { "key": "maxFloor", "label": "En üst kat" } }`.
  Templates that need the same value share the `key`.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages at `https://<user>.github.io/quiz-trip/`.

One-time setup: in the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. On the GitHub Free plan Pages only works for public repositories.

The Vite `base` in `vite.config.ts` must match the repository name.

## Icons

`public/favicon.svg` is the source for every app icon. After changing it, regenerate the PNGs (macOS only, uses the built-in `sips`):

```bash
npm run icons
```
