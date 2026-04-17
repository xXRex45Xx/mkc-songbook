export const testAlbums = {
  album1: {
    _id: 'album-001',
    name: 'Classic Hymns',
    createdAt: '2024',
    photoPath: '/uploads/images/classic-hymns.jpg',
    photoLink: 'https://example.com/classic-hymns.jpg',
    songs: ['song-001', 'song-002'],
  },
  album2: {
    _id: 'album-002',
    name: 'Worship Collection',
    createdAt: '2024',
    photoPath: '/uploads/images/worship.jpg',
    photoLink: 'https://example.com/worship.jpg',
    songs: ['song-003', 'song-004'],
  },
};

export const createAlbumFixture = (overrides = {}) => ({
  _id: `album-${Date.now()}`,
  name: 'Test Album',
  createdAt: new Date().getFullYear().toString(),
  photoPath: '/uploads/images/test.jpg',
  photoLink: 'https://example.com/test.jpg',
  songs: [],
  ...overrides,
});
