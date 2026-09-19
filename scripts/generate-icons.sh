#!/bin/sh
# Renders the PNG app icons from public/favicon.svg with macOS's built-in sips.
set -eu
cd "$(dirname "$0")/../public"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
# Maskable icons need a full-bleed background; Android cuts its own shape out of it.
sed 's/ rx="112"//' favicon.svg > "$tmp/maskable.svg"

sips -s format png -z 192 192 favicon.svg --out pwa-192x192.png >/dev/null
sips -s format png -z 512 512 favicon.svg --out pwa-512x512.png >/dev/null
sips -s format png -z 512 512 "$tmp/maskable.svg" --out maskable-icon-512x512.png >/dev/null
sips -s format png -z 180 180 "$tmp/maskable.svg" --out apple-touch-icon-180x180.png >/dev/null
