// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn(),
}));

// Mock email sending
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  })),
}));

// Mock Multer file handling
jest.mock('multer', () => {
  const multer = jest.requireActual('multer');
  return {
    ...multer,
    default: () => ({
      none: jest.fn(() => jest.fn((req, res, next) => next())),
      single: jest.fn(() => jest.fn((req, res, next) => next())),
      array: jest.fn(() => jest.fn((req, res, next) => next())),
      any: jest.fn(() => jest.fn((req, res, next) => next())),
    }),
  };
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
