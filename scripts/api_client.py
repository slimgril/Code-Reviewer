#!/usr/bin/env python3
"""
API client with primary/backup key fallback.
Reads config from config/api_config.json.
Keys are loaded from environment variables (GitHub Secrets).
"""
import os
import json
import sys
from pathlib import Path

CONFIG_PATH = Path(__file__).parent.parent / "config" / "api_config.json"


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def get_api_credentials():
    """
    Returns (api_key, base_url) using primary key first; falls back to backup.
    """
    cfg = load_config()

    primary_key = os.environ.get(cfg["primary"]["key_env"], "")
    if primary_key:
        return primary_key, cfg["primary"]["base_url"]

    backup_key = os.environ.get(cfg["backup"]["key_env"], "")
    if backup_key:
        print("[api_client] Primary key not found — using backup key.", file=sys.stderr)
        return backup_key, cfg["backup"]["base_url"]

    raise EnvironmentError(
        f"No API key found. Set {cfg['primary']['key_env']} (primary) "
        f"or {cfg['backup']['key_env']} (backup) as environment variables / GitHub Secrets."
    )


if __name__ == "__main__":
    key, url = get_api_credentials()
    # Mask key for display
    masked = key[:8] + "..." + key[-4:]
    print(f"Using API endpoint: {url}")
    print(f"Key: {masked}")
