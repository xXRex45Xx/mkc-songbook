#!/usr/bin/env python3
"""review-commit 01_inventory check: no tracked .env, no secrets in the diff, no file over 5 MB.

    python3 -I workflows/_tools/inventory_check.py [PATH ...]

PATHs default to every changed and untracked file (git diff HEAD + untracked). Run from the
repo root. Writes workflows/review-commit/01_inventory/output/check.md (first line pass or
fail: <why>) and exits 1 on fail. Standard library only; no shell word-splitting involved.
"""
import datetime
import os
import re
import subprocess
import sys

OUT = "workflows/review-commit/01_inventory/output/check.md"
SECRET = re.compile(
    r"""(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"<]{8,}"""
    r"|mongodb\+srv://[^:<\s]+:[^@<\s]+@"
    r"|-----BEGIN [A-Z ]*PRIVATE KEY",
    re.I,
)
MAX_BYTES = 5 * 1024 * 1024


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def main():
    untracked = git("ls-files", "-o", "--exclude-standard").splitlines()
    paths = sys.argv[1:] or sorted(set(git("diff", "HEAD", "--name-only").splitlines() + untracked))
    env = [f for f in git("ls-files").splitlines() if re.search(r"(^|/)\.env$", f)]
    text = git("diff", "HEAD", "--", *paths) if paths else ""
    for f in paths:
        if f in untracked and os.path.isfile(f):
            with open(f, errors="ignore") as fh:
                text += fh.read()
    hits = [line.strip()[:120] for line in text.splitlines() if SECRET.search(line)]
    big = [f for f in paths if os.path.isfile(f) and os.path.getsize(f) > MAX_BYTES]

    problems = [n for n, v in (("tracked .env", env), ("secret", hits), ("over 5 MB", big)) if v]
    verdict = "pass" if not problems else "fail: " + ", ".join(problems)
    report = (
        f"{verdict}\n\nType: Script ({datetime.date.today()}), {len(paths)} files checked\n"
        f"- .env tracked: {env or '(nothing)'}\n"
        f"- secret patterns: {hits or '(nothing)'}\n"
        f"- files > 5 MB: {big or '(nothing)'}\n"
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        fh.write(report)
    print(report, end="")
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
