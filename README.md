# Code Reviewer — Self-Improving Review System

## Components

| Item | Purpose |
|------|---------|
| `python scripts/review.py "task done"` | Manual post-task review |
| GitHub Actions (weekly) | Auto-runs every Wednesday 02:00 Taiwan time |
| GitHub Actions (monthly) | Auto-prunes AGENT_NOTES.md on the 1st of each month |
| `AGENT_NOTES.md` | Accumulated lessons from past reviews |
| `.replit-agent-rules.md` | Active rules applied at session start |
| `prompts/` | Prompt library — reusable prompt templates |

## Prompt Library

| File | Description |
|------|-------------|
| [`prompts/gemini-notebooks-10-prompts.md`](prompts/gemini-notebooks-10-prompts.md) | 10 Gemini Notebooks prompt templates (整理、拆解、生成、文案、講稿、簡報、分析、比較、靈感、優化) |
| [`prompts/17-universal-prompts.md`](prompts/17-universal-prompts.md) | 17 組萬用提示詞（寫作 5、研究 4、溝通 4、時間管理 4），適用 Claude、ChatGPT、Gemini |

## No Always On Required

All scheduling is handled by GitHub Actions — no Replit Always On needed.
