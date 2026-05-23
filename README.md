# Code Reviewer — Self-Improving Review System

## Components

| Item | Purpose |
|------|---------|
| `python scripts/review.py "task done"` | Manual post-task review |
| `python scripts/pr_review.py` | AI-powered PR review via Claude |
| GitHub Actions (weekly) | Auto-runs every Wednesday 02:00 Taiwan time |
| GitHub Actions (monthly) | Auto-prunes AGENT_NOTES.md on the 1st of each month |
| GitHub Actions (PR review) | Auto-reviews every PR with Claude AI |
| `AGENT_NOTES.md` | Accumulated lessons from past reviews |
| `.replit-agent-rules.md` | Active rules applied at session start |

## Secret Management (1Password)

All API keys are stored in **1Password** and injected into GitHub Actions via the
[1Password GitHub Actions integration](https://developer.1password.com/docs/ci-cd/github-actions/).

Only `OP_SERVICE_ACCOUNT_TOKEN` needs to be stored in GitHub Secrets.

See [1password-setup.md](./1password-setup.md) for full setup instructions.

## No Always On Required

All scheduling is handled by GitHub Actions — no Replit Always On needed.
