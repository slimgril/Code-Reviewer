#!/usr/bin/env python3
"""Bundle this repo's docs into one Markdown file to upload as a NotebookLM source.

NotebookLM has no public API, so there's no way to push content to it
programmatically — this just prepares a single file that's easy to upload
by hand at notebooklm.google.com (Add source > choose file).
"""
import datetime
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTPUT_FILE = REPO_ROOT / "notebooklm_export.md"
SOURCE_FILES = ["README.md", "AGENT_NOTES.md", ".replit-agent-rules.md"]

def main():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sections = [f"# Code Reviewer — NotebookLM Export\n\nGenerated: {timestamp}\n"]

    for name in SOURCE_FILES:
        path = REPO_ROOT / name
        if not path.exists():
            continue
        sections.append(f"\n---\n\n## {name}\n\n{path.read_text().strip()}\n")

    OUTPUT_FILE.write_text("\n".join(sections))
    print(f"Wrote {OUTPUT_FILE.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    main()
