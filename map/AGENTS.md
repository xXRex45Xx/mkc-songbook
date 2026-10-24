# MKC Songbook System Map — catalog

Map of the nouns (data shapes) and verbs (movements) in this repo, for agents about to change
code. The code is the source of truth; cards cite it. How to walk: [CONTEXT.md](CONTEXT.md).

## Where things live

| Path | Holds |
|---|---|
| [objects/data-model/](objects/data-model/_index.md) | Mongoose models in `backend/models/` |
| [objects/local-db/](objects/local-db/_index.md) | IndexedDB stores in `frontend/src/utils/db/` |
| [objects/app-state/](objects/app-state/_index.md) | Redux slices in `frontend/src/store/slices/` |
| `processes/` | Verb cards — slice 3, not built yet |
| `effects/` | Change-impact index — slice 4, not built yet |
| [_meta/schema.md](_meta/schema.md) | Card types and frontmatter fields |
| `_templates/` | `object.md`, `process.md`: copy to start a card |
| `_tools/` | `index.py` rebuilds `_index.md`; `links.py` checks links |

## Names that collide

| Word | Means | Is not |
|---|---|---|
| Playlist (model) | Server playlist, `backend/models/playlist.model.js` | the `playlist` slice |
| `playlist` slice | Audio playback queue | any saved playlist |
| `localPlaylists` | Device-only playlists (store + slice) | the server Playlist |
| Schedule / logbook | `LogBook` model, `service-logbook.*` files | a Playlist |
| Song (model) vs `songs` store | Server record vs its offline copy | interchangeable shapes |

## Status

All cards are `status: stub` until slice 2 fills them. A stub tells you where the source is, not
what it does: open the cited file.
