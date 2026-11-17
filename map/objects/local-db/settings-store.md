---
type: object
cluster: local-db
universe: ghost
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:61
code-name: settings
description: Ghost. Declared key-value store; no code reads or writes it.
---

# settings store

A declared IndexedDB store with no reader or writer. Store name `settings`.

## Why this shape

Declared in `STORE_SCHEMAS` for future device settings, keyPath `key`. Font size and other
preferences live in the [configs slice](../app-state/configs-slice.md) instead. Do not assume
anything persists here.

## Shape

- keyPath `key`, no indexes. `frontend/src/utils/db/indexed-db.util.js:61`

## Connected to

- **looks-like-but-is-not:** [configs slice](../app-state/configs-slice.md).

## If you change this

- **Hits:** only `STORE_SCHEMAS`. Removing it does not delete it from existing devices.
- **Does not hit:** anything at runtime.

## Surfaces

| Surface | Role |
|---|---|
| none | — |

## See

- Source: `frontend/src/utils/db/indexed-db.util.js`
