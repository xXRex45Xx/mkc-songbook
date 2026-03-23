// Mock dotenv to prevent loading actual .env file and set env vars
jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
  }),
}));

// Mock passport using a function to avoid hoisting issues
let mockUse;
jest.mock('passport', () => ({
  use: (...args) => mockUse(...args),
}));

import passport from 'passport';

describe('passport.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret';
    
    // Reset mockUse for each test
    mockUse = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should register local strategy with passport.use', async () => {
    jest.mock('../../models/user.model.js', () => ({
      findOne: jest.fn(),
    }));

    const mockCompare = jest.fn().mockResolvedValue(true);
    jest.mock('bcrypt', () => ({
      compare: mockCompare,
    }));

    await import('../../config/passport.config.js');

    expect(mockUse).toHaveBeenCalledTimes(2); // Local + JWT
  });

  it('should register JWT strategy with passport.use', async () => {
    jest.mock('../../models/user.model.js', () => ({
      findById: jest.fn(),
    }));

    const { default: passportConfig } = await import('../../config/passport.config.js');

    expect(mockUse).toHaveBeenCalledTimes(2);
  });
});
