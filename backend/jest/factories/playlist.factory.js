import { v4 as uuidv4 } from 'uuid';

export const createPlaylistFactory = (overrides = {}) => ({
  _id: uuidv4(),
  name: `Test Playlist ${Date.now()}`,
  visibility: 'private',
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: uuidv4(),
  songs: [],
  ...overrides,
});

export const createPublicPlaylistFactory = (overrides = {}) =>
  createPlaylistFactory({
    ...overrides,
    visibility: 'public',
  });

export const createMembersPlaylistFactory = (overrides = {}) =>
  createPlaylistFactory({
    ...overrides,
    visibility: 'members',
  });

export const createPlaylistWithSongsFactory = (overrides = {}) =>
  createPlaylistFactory({
    ...overrides,
    songs: ['song-001', 'song-002', 'song-003'],
  });
