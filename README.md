# Code Reviewer — Self-Improving Review System

## Components

| Item | Purpose |
|------|---------|
| `python scripts/review.py "task done"` | Manual post-task review |
| GitHub Actions (weekly) | Auto-runs every Wednesday 02:00 Taiwan time |
| GitHub Actions (monthly) | Auto-prunes AGENT_NOTES.md on the 1st of each month |
| GitHub Actions (Surge) | Deploys Pulse static site to `pulse-timer.surge.sh` |
| `AGENT_NOTES.md` | Accumulated lessons from past reviews |
| `.replit-agent-rules.md` | Active rules applied at session start |

## No Always On Required

All scheduling is handled by GitHub Actions — no Replit Always On needed.

## Surge deploy (Pulse timer)

Static site root is published with [Surge.sh](https://surge.sh).

**Why deploy used to fail:** the repo had no Surge config, and without `SURGE_TOKEN` the CLI asks for interactive login — that hangs or aborts in CI / Cloud Agent.

**One-time setup**

```bash
npm i -g surge
surge login
surge token   # copy token
```

Add GitHub Actions secrets:

- `SURGE_TOKEN` (required) — from `surge token`
- `SURGE_LOGIN` (optional) — Surge account email

**Deploy**

```bash
npm ci
SURGE_TOKEN=… npm run deploy
```

Or push site files to `main` / run workflow **Deploy Surge**. Domain is set in `CNAME` (default `pulse-timer.surge.sh`).
