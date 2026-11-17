---
type: area
cluster: {cluster}
universe: live
status: stub
owns: []
description: {one line}
verified: {YYYY-MM-DD @ commit, when status is verified}
---

# {Area name}

{One sentence: what this slice of the code does.}

## Files

| File | Role | Key exports |
|---|---|---|
| `{path}` | {one line} | `{name}` (`{path}:{line}`) |

## Entry points

{Routes, URLs, or calls that reach this area, with middleware chains or callers.}

## Connected to

- **objects:** {links to object cards}
- **processes:** {links to process cards}
- **calls / called by:** {other areas}

## Known defects

{Optional. Delete if none. One bullet per bug, with `path:line`.}

## If you change this

- **Hits:**
- **Does not hit:**

## See

- Source: `{path}`
- Tests: `{path}`
