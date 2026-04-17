// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({ error: null })),
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.ALLOWED_ORIGINS ??= 'http://localhost:3000';
process.env.IMAGE_STORAGE ??= 'uploads/images';
process.env.AUDIO_STORAGE ??= 'uploads/audio';
process.env.DEFAULT_ADMIN_EMAIL ??= 'admin@mkc.com';
process.env.DEFAULT_ADMIN_NAME ??= 'Admin User';
process.env.DEFAULT_ADMIN_PHOTO_LINK ??= 'https://example.com/admin.jpg';
process.env.PORT ??= '3001';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value) => `hashed:${value}`),
  compare: jest.fn(async (value, hashedValue) => hashedValue === `hashed:${value}`),
}));

// Mock file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(jest.requireActual('fs').createReadStream),
  createWriteStream: jest.fn(jest.requireActual('fs').createWriteStream),
  existsSync: jest.fn(jest.requireActual('fs').existsSync),
  mkdirSync: jest.fn(jest.requireActual('fs').mkdirSync),
  unlink: jest.fn(jest.requireActual('fs').unlink),
  unlinkSync: jest.fn(jest.requireActual('fs').unlinkSync),
  statSync: jest.fn(jest.requireActual('fs').statSync),
}));

// Mock email sending
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  })),
}));

// Mock Multer file handling
jest.mock('multer', () => {
  const actualMulter = jest.requireActual('multer');
  const mockedMulter = jest.fn(() => ({
    none: jest.fn(() => jest.fn((req, res, next) => next())),
    single: jest.fn(() => jest.fn((req, res, next) => next())),
    array: jest.fn(() => jest.fn((req, res, next) => next())),
    any: jest.fn(() => jest.fn((req, res, next) => next())),
  }));

  mockedMulter.diskStorage = actualMulter.diskStorage;
  mockedMulter.MulterError = actualMulter.MulterError;

  return mockedMulter;
});

// Extend Jest expect matchers
expect.extend({
  toBeValidObjectId(received) {
    const mongoose = jest.requireActual('mongoose');
    const isValid = mongoose.Types.ObjectId.isValid(received);
    return {
      pass: isValid,
      message: () =>
        `expected ${received} to be a valid MongoDB ObjectId`,
    };
  },
});
