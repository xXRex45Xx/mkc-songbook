export const testSongs = {
  hymn1: {
    _id: 'song-001',
    title: 'Amazing Grace',
    lyrics: 'Amazing grace, how sweet the sound,\nThat saved a wretch like me...',
    musicElements: {
      chord: 'C G Am F',
      tempo: 120,
      rythm: '4/4',
    },
    createdAt: '2024',
    updatedAt: new Date(),
    songFilePath: '/uploads/audio/amazing-grace.mp3',
    youtubeLink: 'https://youtube.com/watch?v=test1',
    albums: ['album-001'],
  },
  hymn2: {
    _id: 'song-002',
    title: 'It Is Well',
    lyrics: 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll...',
    musicElements: {
      chord: 'F C G Am',
      tempo: 80,
      rythm: '4/4',
    },
    createdAt: '2024',
    updatedAt: new Date(),
    songFilePath: '/uploads/audio/it-is-well.mp3',
    youtubeLink: 'https://youtube.com/watch?v=test2',
    albums: ['album-001'],
  },
};

export const createSongFixture = (overrides = {}) => ({
  _id: `song-${Date.now()}`,
  title: 'Test Song',
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
