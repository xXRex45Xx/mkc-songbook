import { v4 as uuidv4 } from 'uuid';

export const createSongFactory = (overrides = {}) => ({
  _id: uuidv4(),
  title: `Test Song ${Date.now()}`,
  lyrics: 'Test lyrics go here...',
  musicElements: {
    chord: 'C G Am F',
    tempo: 120,
    rythm: '4/4',
  },
  createdAt: new Date().getFullYear().toString(),
  updatedAt: new Date(),
  songFilePath: '/uploads/audio/test.mp3',
  youtubeLink: '',
  albums: [],
  ...overrides,
});

export const createSongWithAlbumFactory = (overrides = {}) =>
  createSongFactory({
    ...overrides,
    albums: ['album-001', 'album-002'],
  });

export const createSongWithAudioFactory = (overrides = {}) =>
  createSongFactory({
    ...overrides,
    songFilePath: `/uploads/audio/song-${Date.now()}.mp3`,
  });

export const createSongWithYouTubeFactory = (overrides = {}) =>
  createSongFactory({
    ...overrides,
    youtubeLink: `https://youtube.com/watch?v=${uuidv4()}`,
  });
