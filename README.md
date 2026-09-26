# TripKit

A trip companion that works offline: a countdown to departure, a packing and to-do list that follows the
vehicle and the kind of holiday, and a quiz and prediction game for the journey itself. Installed as a PWA
from GitHub Pages, on Android or iOS, and usable in a desktop browser; no backend.

The repository is still called `quiz-trip`; the app is served from its own subdomain, `https://trip.kitshelf.app`.

## Development

Requires Node 26 (see `.github/workflows/deploy.yml`).

```bash
npm install
npm run dev        # http://localhost:5173/
npm test           # unit tests (Vitest)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ with the service worker at http://localhost:4173/
```

The service worker only runs in the production build, so test offline behaviour with `npm run build && npm run preview`.

## Destinations

`public/destinations.json` lists the countries and cities a trip can be created for; `src/trips/destinations.ts`
imports it as the copy built into the app, which a first, offline launch uses. Adding a city there is enough —
no code change — but the app only picks up the published file after a deploy.

Packs are pinned to a destination: `country` plus `cityId`, both in the pack and in `index.json`. A trip that
names only a country gets every pack of that country; a trip that also names a city gets that city's packs.

## Question packs

Packs live in `public/packs/` and are listed in `public/packs/index.json`. The `eg-sharm-el-sheikh` pack is also built into the app, so a fresh install can play offline straight away.

`npm test` checks every pack against the schema and against `index.json` (question count, version, title…). The deploy workflow runs the tests first, so a broken pack is never published. Bump a pack's `version` (in the pack and in `index.json`) whenever its content changes.

To publish a new pack or an update: put the file in `public/packs/`, list it in `index.json` with its `country`
and `cityId`, bump `version` if the pack already existed, and push to `main`. Once the deploy has finished,
players press **Paketleri getir ve güncelle** on the trip's own **Soru paketleri** screen; a trip only ever
downloads the packs of the place it goes to. Packs with a higher version replace the old copy, and a pack that
fails to download or validate keeps its old copy; trips are never touched.

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

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages at `https://trip.kitshelf.app`.

One-time setup: in the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. On the GitHub Free plan Pages only works for public repositories.

The custom domain is set under **Settings → Pages → Custom domain**; its DNS is a `CNAME` from `trip` to `<user>.github.io` in Cloudflare, proxy status *DNS only*. No `CNAME` file is needed because the site is published by a GitHub Actions workflow. The Vite `base` in `vite.config.ts` is `/` because the app sits at the root of that domain; it has to go back to `/<repository>/` if the custom domain is ever removed.

## Icons

`public/favicon.svg` is the source for every app icon. After changing it, regenerate the PNGs (macOS only, uses the built-in `sips`):

```bash
npm run icons
```
