# Testing Guide

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit tests (utils, middlewares)
npm run test:unit

# Run only integration tests (controllers, routes)
npm run test:integration

# Run only E2E tests
npm run test:e2e
```

## Test Organization

```
backend/
├── __tests__/
│   ├── config/              # Configuration tests
│   ├── controllers/         # Controller integration tests
│   ├── routes/              # Route/API endpoint tests
│   ├── middlewares/         # Middleware tests
│   ├── models/              # Model schema tests
│   ├── utils/               # Utility function tests
│   └── e2e/                 # End-to-end tests
├── jest/
│   ├── __mocks__/           # Manual mocks
│   ├── fixtures/            # Test data fixtures
│   ├── factories/           # Test data factories
│   └── helpers/             # Test helper functions
├── jest.config.js           # Jest configuration
└── TESTING.md              # This file
```

## Writing Tests

### Test Structure

```javascript
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { mongoose } from 'mongoose';
import { clearDatabase } from '../../jest/helpers/database.helper.js';

describe('Module Name', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });

  describe('Function Name', () => {
    it('should return expected result with valid input', async () => {
      // Arrange
      const input = { key: 'value' };
      const expected = { result: 'success' };

      // Act
      const result = await functionToTest(input);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should throw error with invalid input', async () => {
      await expect(functionToTest(null)).rejects.toThrow('Invalid input');
    });
  });
});
```

### Mocking External Dependencies

```javascript
// Mock a module
jest.mock('../../models/song.model.js', () => ({
  Song: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

// Use the mocked module
import { Song } from '../../models/song.model.js';

describe('Controller', () => {
  it('should return songs from database', async () => {
    const mockSongs = [{ _id: '1', title: 'Test' }];
    Song.find.mockResolvedValue(mockSongs);

    const result = await controllerFunction();
    
    expect(result).toEqual(mockSongs);
    expect(Song.find).toHaveBeenCalled();
  });
});
```

### API Testing with Supertest

```javascript
import request from 'supertest';
import app from '../../index.js';
import { authHelper } from '../../jest/helpers/request.helper.js';

describe('POST /api/song', () => {
  it('should create a new song', async () => {
    const token = await authHelper.getAdminToken();
    
    const response = await request(app)
      .post('/api/song')
      .set(authHelper.withAuth(token))
      .send({
        title: 'Test Song',
        lyrics: 'Test lyrics',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe('Test Song');
  });

  it('should return 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/song')
      .send({
        title: 'Test Song',
        lyrics: 'Test lyrics',
      });

    expect(response.status).toBe(401);
  });
});
```

### Testing with Test Data

```javascript
import { createSongFactory } from '../../jest/factories/song.factory.js';
import { testUsers } from '../../jest/fixtures/users.js';

describe('Song Controller', () => {
  it('should handle song creation', async () => {
    const song = createSongFactory({
      title: 'Custom Song',
      lyrics: 'Custom lyrics',
    });

    const response = await request(app)
      .post('/api/song')
      .send(song);

    expect(response.status).toBe(201);
  });
});
```

## Best Practices

1. **Descriptive Test Names**: Use `should <expected> when <condition>` format
2. **Arrange-Act-Assert**: Organize tests into clear sections
3. **Mock External Dependencies**: Use `jest.mock()` for databases, APIs, file system
4. **Test Edge Cases**: Include tests for null, undefined, empty arrays, etc.
5. **Keep Tests Independent**: Each test should be able to run in isolation
6. **Use Fixtures and Factories**: Avoid repetitive test data setup
7. **Clean Up After Tests**: Use `beforeEach` and `afterEach` for setup/teardown
8. **Test Coverage**: Aim for 80%+ coverage on critical modules

## Common Matchers

```javascript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeNull();
expect(value).toBeDefined();

// Arrays/Objects
expect(array).toContain(item);
expect(object).toHaveProperty('key');

// Functions/Promises
expect(fn).toThrow('error');
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('error');

// Mock functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(2);

// Custom matchers
expect(value).toBeValidObjectId();
```

## Environment Variables for Testing

The test suite automatically sets up:
- `DB_URI`: Points to in-memory MongoDB server
- `JWT_SECRET`: Defaults to 'test-jwt-secret'
- `NODE_ENV`: Set to 'test'

## Troubleshooting

### Tests are slow
- Use `mongodb-memory-server` for fast in-memory database
- Mock external APIs and file system operations
- Run specific test files: `npm test -- song.controller.test.js`

### Tests are flaky
- Ensure proper cleanup in `afterEach`
- Use proper async/await patterns
- Check for race conditions in tests

### Coverage is low
- Run tests with `npm run test:coverage` and open `coverage/index.html`
- Identify uncovered code paths
- Add tests for error conditions and edge cases
