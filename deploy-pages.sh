#!/usr/bin/env bash
# Deploy MDAtlas to GitHub Pages for MDFacts/MDAtlas.
# NOTE: GitHub Pages needs the repo to be PUBLIC (free plan) or the MDFacts org
# on GitHub Team/Enterprise (private Pages). Enabling Pages 422s otherwise.
# Run from the repo root:  ./deploy-pages.sh
set -euo pipefail

SLUG="MDFacts/MDAtlas"
REPO="${SLUG#*/}"                                  # MDAtlas (base path is case-sensitive)
PAGES_URL="https://mdfacts.github.io/$REPO/"

echo "▸ Building with the Pages base path…"
BASE_PATH="/$REPO/" npm run build

echo "▸ Publishing the build to the gh-pages branch…"
touch dist/.nojekyll
rm -rf dist/.git
git -C dist init -q -b gh-pages
git -C dist add -A
git -C dist -c user.email=deploy@local -c user.name=deploy commit -qm "Deploy MDAtlas"
git -C dist push -f "https://github.com/$SLUG.git" gh-pages:gh-pages
rm -rf dist/.git

echo "▸ Enabling GitHub Pages (gh-pages branch, root)…"
gh api -X POST "repos/$SLUG/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null 2>&1 \
  || gh api -X PUT "repos/$SLUG/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null 2>&1 \
  || { echo "  ✗ Pages could not be enabled — the repo must be PUBLIC (free plan) or the org on GitHub Team."; exit 1; }

echo
echo "✓ Done. Live in ~1–2 min at:  $PAGES_URL"
