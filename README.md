# TripKit

A trip companion that works offline: a countdown to departure, a packing and to-do list that follows the
vehicle and the kind of holiday, and a quiz and prediction game for the journey itself. Installed as a PWA
from GitHub Pages, on Android or iOS, and usable in a desktop browser; no backend.

The repository, and with it the Pages URL, is still called `quiz-trip`.

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

To publish a new pack or an update: put the file in `public/packs/`, list it in `index.json`, bump `version` if the pack already existed, and push to `main`. Once the deploy has finished, players press **Paketleri güncelle** on the home screen. New packs are downloaded, packs with a higher version replace the old copy, and a pack that fails to download or validate keeps its old copy; trips are never touched.

GitHub Pages' CDN keeps serving the previous `index.json` and pack files for up to 10 minutes after a deploy (`cache-control: max-age=600`; it ignores query strings and `no-cache` request headers, so the app cannot bypass it). If the app says everything is up to date or that the server file is not updated yet, try again a few minutes later.

A pack can bring its own question categories, which is what a themed pack (a hotel, a series, a park) needs:
`"categories": [{ "id": "spongebob", "label": "SpongeBob" }, …]`. Every question's `category` must be one of the
pack's ids. A pack without a `categories` list uses the built-in six (`history`, `mythology`, `geography`, `food`,
`language`, `culture`).

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
