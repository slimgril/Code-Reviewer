#!/usr/bin/env bash
# Deploy the static Pulse site to Surge.sh (non-interactive).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DOMAIN="${SURGE_DOMAIN:-}"
if [[ -z "$DOMAIN" && -f CNAME ]]; then
  DOMAIN="$(tr -d '[:space:]' < CNAME)"
fi
DOMAIN="${DOMAIN:-pulse-timer.surge.sh}"

if [[ -z "${SURGE_TOKEN:-}" ]]; then
  cat >&2 <<'EOF'
[surge] Missing SURGE_TOKEN — cannot deploy non-interactively.

Why deploy fails without a token:
  Surge prompts for email/password when no token is present. In CI, Cloud Agent,
  or any non-TTY shell that prompt hangs or aborts, so "surge 不能部署".

Fix (one-time on your machine):
  1. npm i -g surge
  2. surge login
  3. surge token          # copy the printed token
  4. Add GitHub secret SURGE_TOKEN with that value
     (optional: SURGE_LOGIN = your Surge account email)

Then re-run:
  SURGE_TOKEN=… npm run deploy
  # or push to main to trigger .github/workflows/deploy-surge.yml
EOF
  exit 1
fi

if [[ ! -f index.html ]]; then
  echo "[surge] index.html not found in $ROOT" >&2
  exit 1
fi

echo "[surge] Deploying $ROOT → https://$DOMAIN"
npx --no-install surge "$ROOT" "$DOMAIN" --token "$SURGE_TOKEN"
echo "[surge] Done: https://$DOMAIN"
