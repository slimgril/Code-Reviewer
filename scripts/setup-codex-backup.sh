#!/usr/bin/env bash
# setup-codex-backup.sh
# Adds backup provider to OpenAI Codex CLI config (~/.codex/config.toml)
# Run this script on your LOCAL machine (not in CI/remote).

set -euo pipefail

CONFIG_DIR="$HOME/.codex"
CONFIG_FILE="$CONFIG_DIR/config.toml"

mkdir -p "$CONFIG_DIR"

# Check if backup provider already exists
if grep -q '\[providers\.backup\]' "$CONFIG_FILE" 2>/dev/null; then
  echo "[setup-codex-backup] Backup provider already exists in $CONFIG_FILE — skipping."
  exit 0
fi

cat >> "$CONFIG_FILE" << 'EOF'

# ---------------------------------------------------------------------------
# Backup provider — api123.top (OpenAI-compatible proxy)
# Usage: codex --provider backup
# ---------------------------------------------------------------------------
[providers.backup]
base_url = "https://api123.top/v1"
api_key  = "sk-VUyS10aOHLKoulvKuPiGyBofScYECxRhkdBErppCOdevgzLW"
EOF

echo "[setup-codex-backup] Done. Backup provider added to $CONFIG_FILE"
echo ""
echo "To use the backup provider:"
echo "  codex --provider backup \"your prompt here\""
