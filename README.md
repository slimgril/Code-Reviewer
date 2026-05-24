# Code Reviewer — Self-Improving Review System

## Components

| Item | Purpose |
|------|---------|
| `python scripts/review.py "task done"` | Manual post-task review |
| GitHub Actions (weekly) | Auto-runs every Wednesday 02:00 Taiwan time |
| GitHub Actions (monthly) | Auto-prunes AGENT_NOTES.md on the 1st of each month |
| `AGENT_NOTES.md` | Accumulated lessons from past reviews |
| `.replit-agent-rules.md` | Active rules applied at session start |

## API Keys (GitHub Secrets)

| Secret Name | Purpose |
|-------------|---------|
| `ANTHROPIC_API_KEY` | Primary API key |
| `ANTHROPIC_API_KEY_BACKUP` | Backup API key (endpoint: `https://api123.top`) |

The client (`scripts/api_client.py`) automatically falls back to the backup key if the primary key is missing.  
Set both secrets under **Settings → Secrets and variables → Actions** in GitHub.

## No Always On Required

All scheduling is handled by GitHub Actions — no Replit Always On needed.
