#!/usr/bin/env bash
# Publish MDAtlas to GitHub Pages (public) under the authenticated gh account.
# Run this yourself from the repo root: ./deploy-pages.sh
set -euo pipefail

REPO="mdatlas"
USER="$(gh api user -q .login)"                 # e.g. PARAD111GM
PAGES_URL="https://$(echo "$USER" | tr '[:upper:]' '[:lower:]').github.io/$REPO/"

echo "▸ Building with the Pages base path…"
BASE_PATH="/$REPO/" npm run build

echo "▸ Creating the public repo and pushing source…"
if ! gh repo view "$USER/$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --source=. --remote=origin --push \
    --description "MDAtlas — interactive 3D body symptom explorer (possible explanations, not a diagnosis)"
else
  echo "  repo already exists — pushing current branch"
  git push -u origin "$(git branch --show-current)"
fi

echo "▸ Deploying the built app to the gh-pages branch…"
touch dist/.nojekyll                            # serve files as-is (no Jekyll)
rm -rf dist/.git
git -C dist init -q -b gh-pages
git -C dist add -A
git -C dist -c user.email=deploy@local -c user.name=deploy commit -qm "Deploy MDAtlas"
git -C dist push -f "https://github.com/$USER/$REPO.git" gh-pages:gh-pages
rm -rf dist/.git

echo "▸ Enabling GitHub Pages (gh-pages branch, root)…"
gh api -X POST "repos/$USER/$REPO/pages" \
  -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null 2>&1 \
  || gh api -X PUT "repos/$USER/$REPO/pages" \
       -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null 2>&1 || true

echo
echo "✓ Done. Live in ~1–2 min at:  $PAGES_URL"
echo "  (Settings ▸ Pages will show the exact URL and build status.)"
