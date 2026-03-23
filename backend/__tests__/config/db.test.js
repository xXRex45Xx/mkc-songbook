import { connect } from '../../config/db.js';
import mongoose from 'mongoose';

describe('db.config', () => {
  describe('connect', () => {
    const mockUri = 'mongodb://localhost:27017/test-db';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should connect to MongoDB with valid URI', async () => {
      const mockConnect = jest.spyOn(mongoose, 'connect').mockResolvedValue();

      await expect(connect(mockUri)).resolves.toBeUndefined();

      expect(mockConnect).toHaveBeenCalledWith(mockUri);
    });

    it('should throw error when connection fails', async () => {
      const mockError = new Error('Connection failed');
      const mockConnect = jest.spyOn(mongoose, 'connect').mockRejectedValue(mockError);

      await expect(connect(mockUri)).rejects.toThrow('Connection failed');

      expect(mockConnect).toHaveBeenCalledWith(mockUri);
    });

    it('should log error to console when connection fails', async () => {
      const mockError = new Error('Connection refused');
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
      const mockConnect = jest.spyOn(mongoose, 'connect').mockRejectedValue(mockError);

      await expect(connect(mockUri)).rejects.toThrow();

      expect(mockConsoleError).toHaveBeenCalledWith(mockError);
    });

    it('should re-throw connection errors', async () => {
      const mockError = new Error('MongoDB timeout');
      jest.spyOn(mongoose, 'connect').mockRejectedValue(mockError);

      try {
        await connect(mockUri);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });
});
