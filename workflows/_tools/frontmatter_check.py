#!/usr/bin/env python3
"""Check that every YAML frontmatter block under map/ parses.

    python3 -I workflows/_tools/frontmatter_check.py

Run from the repo root. Prints the number of blocks parsed and each bad file, and exits 1 if any
block fails to parse. Exits 2 if PyYAML is missing. Used by the map-card checks in review-commit,
fix-defect, add-backend-feature and add-frontend-feature.
"""
import glob
import sys

try:
    import yaml
except ImportError:
    print("PyYAML is not installed")
    sys.exit(2)

parsed = 0
bad = 0
for path in sorted(glob.glob("map/**/*.md", recursive=True)):
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---"):
        continue
    end = text.find("\n---", 3)
    if end == -1:
        print(f"BAD {path}: frontmatter never closes")
        bad += 1
        continue
    try:
        yaml.safe_load(text[3:end])
        parsed += 1
    except yaml.YAMLError as err:
        print(f"BAD {path}: {str(err).splitlines()[0]}")
        bad += 1
print(f"{parsed} frontmatter blocks parsed, {bad} bad")
sys.exit(1 if bad else 0)
