#!/usr/bin/env python3
"""Prune AGENT_NOTES.md — keep only the 10 most recent review entries."""
import re
import datetime

NOTES_FILE = "AGENT_NOTES.md"
MAX_ENTRIES = 10

def main():
    with open(NOTES_FILE, "r") as f:
        content = f.read()

    # Split on review entry separator
    parts = content.split("\n---\n")
    header = parts[0]
    entries = parts[1:]

    if len(entries) <= MAX_ENTRIES:
        print(f"Prune skipped: only {len(entries)} entries (max {MAX_ENTRIES})")
        return

    kept = entries[-MAX_ENTRIES:]
    pruned_count = len(entries) - MAX_ENTRIES

    new_content = header + "\n---\n" + "\n---\n".join(kept)
    with open(NOTES_FILE, "w") as f:
        f.write(new_content)

    print(f"Pruned {pruned_count} old entries, kept {len(kept)}.")

if __name__ == "__main__":
    main()
