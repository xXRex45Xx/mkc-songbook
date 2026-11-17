---
type: object
cluster: data-model
universe: ghost
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: backend/models/search-history.model.js:35
code-name: SearchHistory
description: Ghost. Schema for a user's past searches; no route or controller reads or writes it.
---

# SearchHistory

A schema for logged searches. Model `SearchHistoryModel`. Ghost: only its own test imports it.

## Why this shape

`User.searchHistory` holds refs to it
(`backend/models/user.model.js:52`), but no code creates a record. Do not build against it
without first wiring a writer.

## Shape

- `userId` ObjectId ref User, required, indexed. `backend/models/search-history.model.js:36`
- `searchTerm` String, required. `:37`
- `resultCount` Number, required. `:38`
- `timestamp` Date. `:39`

## Connected to

- **owned-by:** [User](user.md), in schema only.

## If you change this

- **Hits:** `backend/__tests__/models/search-history.model.test.js` only.
- **Does not hit:** anything at runtime.

## Surfaces

| Surface | Role |
|---|---|
| none | — |

## See

- Source: `backend/models/search-history.model.js`
