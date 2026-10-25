# MKC Songbook System Map — catalog

Map of the nouns (data shapes) and verbs (movements) in this repo, for agents about to change
code. The code is the source of truth; cards cite it. How to walk: [CONTEXT.md](CONTEXT.md).

## Where things live

| Path | Holds |
|---|---|
| [objects/](objects/CONTEXT.md) | Noun cards; how to add one |
| [objects/data-model/](objects/data-model/_index.md) | Mongoose models in `backend/models/` |
| [objects/local-db/](objects/local-db/_index.md) | IndexedDB stores in `frontend/src/utils/db/` |
| [objects/app-state/](objects/app-state/_index.md) | Redux slices in `frontend/src/store/slices/` |
| [processes/](processes/_index.md) | Verb cards: auth, sync, offline writes and audio, uploads |
| [effects/](effects/CONTEXT.md) | Change-impact index and outside consumers: open before a change |
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

Each card's status is in its folder's generated `_index.md`. Bugs: run
`grep -rn -A12 '## Known defects' map/objects map/processes`.
