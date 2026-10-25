#!/usr/bin/env python3
"""review-commit 01_inventory check: no tracked .env, no secrets in the diff, no file over 5 MB.

    python3 -I workflows/_tools/inventory_check.py --run RUN [PATH ...]

RUN is the run folder name, <YYYYMMDD-HHMM>-<task-slug> (workflows/CONTEXT.md section 5).
PATHs default to every changed and untracked file (git diff HEAD + untracked). Run from the
repo root. Writes workflows/review-commit/01_inventory/output/RUN/check.md (first line pass or
fail: <why>) and exits 1 on fail; exits 2 without --run. Standard library only; no shell
word-splitting involved.
"""
import datetime
import os
import re
import subprocess
import sys

OUT_DIR = "workflows/review-commit/01_inventory/output"
RUN_NAME = re.compile(r"^\d{8}-\d{4}-[a-z0-9][a-z0-9-]{0,39}$")
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
    args = sys.argv[1:]
    if len(args) < 2 or args[0] != "--run" or not RUN_NAME.match(args[1]):
        print("usage: inventory_check.py --run <YYYYMMDD-HHMM>-<task-slug> [PATH ...]")
        return 2
    out = os.path.join(OUT_DIR, args[1], "check.md")
    untracked = git("ls-files", "-o", "--exclude-standard").splitlines()
    paths = args[2:] or sorted(set(git("diff", "HEAD", "--name-only").splitlines() + untracked))
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
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as fh:
        fh.write(report)
    print(report, end="")
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
