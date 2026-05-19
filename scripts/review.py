#!/usr/bin/env python3
import sys
import datetime

def main():
    task = sys.argv[1] if len(sys.argv) > 1 else "unspecified task"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    entry = f"""
---
## Review: {timestamp}

**Task:** {task}

**Problems encountered:** (none recorded)

**Inefficiencies:** (none recorded)

**Lessons learned:** (none recorded)

**Changes applied:** (none recorded)
"""

    with open("AGENT_NOTES.md", "a") as f:
        f.write(entry)

    print(f"Review logged: {timestamp}")

if __name__ == "__main__":
    main()
