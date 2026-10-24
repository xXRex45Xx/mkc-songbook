---
type: object
cluster: {cluster}
universe: live
status: stub
entity: {path to the owning file}
code-name: {name in code, if different}
description: {one line}
verified: {YYYY-MM-DD @ commit, when status is verified}
---

# {Name}

{One sentence. If the product word and the file/type name differ, say both.}

## Why this shape

{The load-bearing why, not a field tour.}

## Shape

- {keys, constraints, or owning files}

Citations: `{path}:{line}`

## Connected to

- **owns:**
- **owned-by:**
- **joins:**
- **looks-like-but-is-not:**

## Known defects

{Optional. Delete this section if none. One bullet per bug: what goes wrong, then the
`path:line` that causes it. Only bugs, never field notes.}

## If you change this

- **Hits:**
- **Does not hit:**

## Surfaces

| Surface | Role |
|---|---|
| {who} | {reads / writes / none} |

## See

- Source: `{path}`
