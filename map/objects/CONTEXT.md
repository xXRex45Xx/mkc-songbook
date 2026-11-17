# Objects Shelf — one card per noun

Holds the noun cards, in three clusters. Each cluster's `_index.md` is generated; read it
before opening cards.

| Cluster | Source of truth |
|---|---|
| [data-model/](data-model/_index.md) | `backend/models/*.model.js` |
| [local-db/](local-db/_index.md) | `STORE_SCHEMAS` in `frontend/src/utils/db/indexed-db.util.js` |
| [app-state/](app-state/_index.md) | `frontend/src/store/slices/*.slice.js` |

## Add or update a card

- Inputs: `map/_templates/object.md`, `map/_meta/schema.md`, the source file.
- Copy the template into the cluster; fill each section from the source, citing `path:line`.
- Set `status: verified` and `verified: YYYY-MM-DD @ <commit>` only after checking every claim.
- Output: the card, then `python3 -I map/_tools/index.py map/objects/<cluster>`.

## Check

`python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage` reports 0 broken,
and the frontmatter parses as YAML.
