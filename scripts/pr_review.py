#!/usr/bin/env python3
"""AI-powered PR code review using Claude, with secrets loaded from 1Password."""

import os
import subprocess
import sys

import anthropic
from github import Github

REVIEW_PROMPT = """You are an expert code reviewer. Review the following git diff and provide:

1. **Summary** — what this PR does in 1-2 sentences
2. **Issues** — bugs, security problems, or logic errors (if any)
3. **Suggestions** — improvements for readability, performance, or maintainability
4. **Verdict** — LGTM ✅ / Needs Changes ⚠️ / Blocking Issues 🚫

Be concise. Focus on real problems, not style nitpicks.

---
{diff}
"""


def get_diff(base_sha: str, head_sha: str) -> str:
    result = subprocess.run(
        ["git", "diff", f"{base_sha}...{head_sha}"],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout[:12000]  # Limit to avoid token overflow


def review_with_claude(diff: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": REVIEW_PROMPT.format(diff=diff),
            }
        ],
    )
    return message.content[0].text


def post_comment(repo_name: str, pr_number: int, body: str) -> None:
    gh = Github(os.environ["GH_TOKEN"])
    repo = gh.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    pr.create_issue_comment(f"## 🤖 AI Code Review\n\n{body}")


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not set — skipping AI review.")
        sys.exit(0)

    base_sha = os.environ["BASE_SHA"]
    head_sha = os.environ["HEAD_SHA"]
    pr_number = int(os.environ["PR_NUMBER"])
    repo = os.environ["REPO"]

    diff = get_diff(base_sha, head_sha)
    if not diff.strip():
        print("No diff found — skipping review.")
        sys.exit(0)

    print(f"Reviewing diff ({len(diff)} chars)...")
    review = review_with_claude(diff)
    post_comment(repo, pr_number, review)
    print("Review posted successfully.")


if __name__ == "__main__":
    main()
