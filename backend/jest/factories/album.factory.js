import { v4 as uuidv4 } from 'uuid';

export const createAlbumFactory = (overrides = {}) => ({
  _id: uuidv4(),
  name: `Test Album ${Date.now()}`,
  createdAt: new Date().getFullYear().toString(),
  photoPath: '/uploads/images/test.jpg',
  photoLink: 'https://example.com/test.jpg',
  songs: [],
  ...overrides,
});

export const createAlbumWithSongsFactory = (overrides = {}) =>
  createAlbumFactory({
    ...overrides,
    songs: ['song-001', 'song-002', 'song-003'],
  });

export const createAlbumWithCoverFactory = (overrides = {}) =>
  createAlbumFactory({
    ...overrides,
    photoPath: `/uploads/images/album-${Date.now()}.jpg`,
    photoLink: `https://example.com/album-${Date.now()}.jpg`,
  });
