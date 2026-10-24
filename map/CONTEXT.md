# MKC Songbook System Map — how to walk it

## Use

1. Read [AGENTS.md](AGENTS.md). Pick the cluster your change touches.
2. Open that cluster's `_index.md`. Open only the cards you need, never the whole folder.
3. On each card, follow **See** to the source. Code beats the card; if they disagree, fix the card.
4. Before a change, read the card's **If you change this**. Once `effects/` exists, start there.

## Universes

| Universe | Meaning |
|---|---|
| `live` | In force. Build and cite against it. |
| `leftover` | Still present, off the main path. Touch only if that path is in scope. |
| `ghost` | Named but not wired. Never build against it. |

Known ghosts, kept off the shelves:

- Announcements: `/announcements` route renders "Under Construction"; no backend.
- Backend E2E tests: `npm run test:e2e` exists; `backend/__tests__/e2e/` is empty.
- `@/` import alias: named in old docs, configured nowhere.

## Card status

`stub` (frontmatter + title only) → `verified` (needs a date, a commit, and `path:line`
citations) → `stale` (source changed since verification). A wrong `verified` date is worse
than `stale`.

## Maintain

From `map/`, after adding or changing cards:

- `python3 -I _tools/index.py objects/data-model objects/local-db objects/app-state`
- `python3 -I _tools/links.py`

Never hand-edit `_index.md`.

## Outside consumers

`frontend/.impeccable/live/roots.json` (untracked) holds absolute paths to `PRODUCT.md` and
`DESIGN.md`. No other outside consumer of repo paths is known.
