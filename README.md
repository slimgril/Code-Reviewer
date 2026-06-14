# Code Reviewer — Self-Improving Review System

## Components

| Item | Purpose |
|------|---------|
| `python scripts/review.py "task done"` | Manual post-task review |
| GitHub Actions (weekly) | Auto-runs every Wednesday 02:00 Taiwan time |
| GitHub Actions (monthly) | Auto-prunes AGENT_NOTES.md on the 1st of each month |
| GitHub Actions (daily) | Emails 全聯/家樂福 deals every day at 07:30 Taiwan time |
| `AGENT_NOTES.md` | Accumulated lessons from past reviews |
| `.replit-agent-rules.md` | Active rules applied at session start |

## No Always On Required

All scheduling is handled by GitHub Actions — no Replit Always On needed.

## Daily Grocery Deals Email

`scripts/grocery_deals.py` queries the Perplexity API for current PX Mart
(全聯) and Carrefour (家樂福) Taiwan promotions and emails a summary to
wangjohnsonwt@gmail.com. The `daily-grocery-deals` workflow runs this every
day at 07:30 Taiwan time.

Required repository secrets:

| Secret | Description |
|--------|--------------|
| `PERPLEXITY_API_KEY` | API key for the Perplexity API |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP server port (e.g. `587`); defaults to `587` if unset |
| `SMTP_USERNAME` | SMTP login username (sender address) |
| `SMTP_PASSWORD` | SMTP login password / app password |
