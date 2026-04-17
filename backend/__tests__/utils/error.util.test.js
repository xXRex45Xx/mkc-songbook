import {
  wrapAsync,
  ClientFaultError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServerFaultError,
} from '../../utils/error.util.js';

describe('wrapAsync', () => {
  describe('successful execution', () => {
    it('should call next with response when async function succeeds', async () => {
      const mockFn = jest.fn().mockResolvedValue();
      const mockNext = jest.fn();
      const wrapped = wrapAsync(mockFn);

      await wrapped(null, null, mockNext);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass response data to next when function returns data', async () => {
      const mockFn = jest.fn().mockResolvedValue({ data: 'test' });
      const mockNext = jest.fn();
      const wrapped = wrapAsync(mockFn);

      await wrapped(null, null, mockNext);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should pass error with statusCode to next', async () => {
      const error = new ClientFaultError('Invalid input', 400);
      const mockFn = jest.fn().mockRejectedValue(error);
      const mockNext = jest.fn();
      const wrapped = wrapAsync(mockFn);

      await wrapped(null, null, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should wrap generic errors in ServerFaultError and pass to next', async () => {
      const error = new Error('Database connection failed');
      const mockFn = jest.fn().mockRejectedValue(error);
      const mockNext = jest.fn();
      const wrapped = wrapAsync(mockFn);

      await wrapped(null, null, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError).toBeInstanceOf(ServerFaultError);
      expect(passedError.statusCode).toBe(500);
      expect(passedError.internalError).toBe(error);
    });

    it('should preserve error message for ClientFaultError', async () => {
      const error = new ClientFaultError('User not found', 404);
      const mockFn = jest.fn().mockRejectedValue(error);
      const mockNext = jest.fn();
      const wrapped = wrapAsync(mockFn);

      await wrapped(null, null, mockNext);

      const passedError = mockNext.mock.calls[0][0];
      expect(passedError).toBeInstanceOf(ClientFaultError);
      expect(passedError.message).toBe('User not found');
    });
  });
});

describe('ClientFaultError', () => {
  it('should create error with default status code 400', () => {
    const error = new ClientFaultError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
  });

  it('should create error with custom status code', () => {
    const error = new ClientFaultError('Bad request', 400);
    expect(error.statusCode).toBe(400);
  });

  it('should extend Error class', () => {
    const error = new ClientFaultError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ClientFaultError);
  });
});

describe('UnauthorizedError', () => {
  it('should create error with status code 401', () => {
    const error = new UnauthorizedError('Authentication required');
    expect(error.message).toBe('Authentication required');
    expect(error.statusCode).toBe(401);
  });

  it('should extend ClientFaultError', () => {
    const error = new UnauthorizedError('Not authenticated');
    expect(error).toBeInstanceOf(ClientFaultError);
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});

describe('ForbiddenError', () => {
  it('should create error with status code 403', () => {
    const error = new ForbiddenError('Admin access required');
    expect(error.message).toBe('Admin access required');
    expect(error.statusCode).toBe(403);
  });

  it('should extend ClientFaultError', () => {
    const error = new ForbiddenError('Insufficient permissions');
    expect(error).toBeInstanceOf(ClientFaultError);
    expect(error).toBeInstanceOf(ForbiddenError);
  });
});

describe('ServerFaultError', () => {
  it('should create error with generic message and status code 500', () => {
    const internalError = new Error('Database connection failed');
    const error = new ServerFaultError(internalError);
    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(500);
  });

  it('should preserve internal error', () => {
    const internalError = new Error('Original error message');
    const error = new ServerFaultError(internalError);
    expect(error.internalError).toBe(internalError);
    expect(error.internalError.message).toBe('Original error message');
  });

  it('should extend Error class', () => {
    const error = new ServerFaultError(new Error('test'));
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ServerFaultError);
  });
});

describe('NotFoundError', () => {
  it('should create error with status code 404', () => {
    const error = new NotFoundError('Album with ID 123 not found');
    expect(error.message).toBe('Album with ID 123 not found');
    expect(error.statusCode).toBe(404);
  });

  it('should extend ClientFaultError', () => {
    const error = new NotFoundError('User not found');
    expect(error).toBeInstanceOf(ClientFaultError);
    expect(error).toBeInstanceOf(NotFoundError);
  });
});
