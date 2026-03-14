export const testPlaylists = {
  publicPlaylist: {
    _id: 'playlist-001',
    name: 'Sunday Service',
    visibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: 'user-001',
    songs: ['song-001', 'song-002'],
  },
  privatePlaylist: {
    _id: 'playlist-002',
    name: 'Practice Songs',
    visibility: 'private',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: 'user-002',
    songs: ['song-003'],
  },
};

export const createPlaylistFixture = (overrides = {}) => ({
  _id: `playlist-${Date.now()}`,
  name: 'Test Playlist',
  visibility: 'private',
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: 'user-001',
  songs: [],
  ...overrides,
});
