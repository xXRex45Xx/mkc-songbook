// Mock dotenv to prevent loading actual .env file and set env vars
jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    process.env.AUDIO_STORAGE = '/tmp/audio';
    process.env.IMAGE_STORAGE = '/tmp/images';
  }),
}));

import { userImageOpts, albumImageOpts, audioOpts } from '../../config/multer.config.js';
import { ClientFaultError } from '../../utils/error.util.js';

describe('multer.config', () => {
  describe('userImageOpts', () => {
    it('should have diskStorage storage configuration', () => {
      expect(userImageOpts).toHaveProperty('storage');
      expect(userImageOpts.storage).toHaveProperty('getDestination');
      expect(userImageOpts.storage).toHaveProperty('getFilename');
    });

    it('should have file size limit of 30MB', () => {
      expect(userImageOpts.limits.fileSize).toBe(30 * 1024 * 1024);
    });

    it('should have fileFilter function', () => {
      expect(userImageOpts).toHaveProperty('fileFilter');
      expect(typeof userImageOpts.fileFilter).toBe('function');
    });

    it('should reject unsupported image format in fileFilter', (done) => {
      const mockFile = { mimetype: 'application/pdf' };
      const mockCb = jest.fn();

      userImageOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeInstanceOf(ClientFaultError);
      expect(mockCb.mock.calls[0][1]).toBe(false);
      done();
    });

    it('should accept supported image formats in fileFilter', (done) => {
      const mockFile = { mimetype: 'image/jpeg' };
      const mockCb = jest.fn();

      userImageOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeNull();
      expect(mockCb.mock.calls[0][1]).toBe(true);
      done();
    });
  });

  describe('albumImageOpts', () => {
    it('should have diskStorage storage configuration', () => {
      expect(albumImageOpts).toHaveProperty('storage');
      expect(albumImageOpts.storage).toHaveProperty('getDestination');
      expect(albumImageOpts.storage).toHaveProperty('getFilename');
    });

    it('should have file size limit of 30MB', () => {
      expect(albumImageOpts.limits.fileSize).toBe(30 * 1024 * 1024);
    });

    it('should use UUID for filename generation', (done) => {
      const mockFile = { mimetype: 'image/png' };
      let callbackCalled = false;

      albumImageOpts.storage.getFilename({}, mockFile, (_err, filename) => {
        expect(filename).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/i);
        callbackCalled = true;
      });

      expect(callbackCalled).toBe(true);
      done();
    });

    it('should reject unsupported image format in fileFilter', (done) => {
      const mockFile = { mimetype: 'video/mp4' };
      const mockCb = jest.fn();

      albumImageOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeInstanceOf(ClientFaultError);
      expect(mockCb.mock.calls[0][1]).toBe(false);
      done();
    });
  });

  describe('audioOpts', () => {
    it('should have diskStorage storage configuration', () => {
      expect(audioOpts).toHaveProperty('storage');
      expect(audioOpts.storage).toHaveProperty('getDestination');
      expect(audioOpts.storage).toHaveProperty('getFilename');
    });

    it('should have file size limit of 50MB', () => {
      expect(audioOpts.limits.fileSize).toBe(50 * 1024 * 1024);
    });

    it('should use UUID for filename generation', (done) => {
      const mockFile = { mimetype: 'audio/mpeg' };
      let callbackCalled = false;

      audioOpts.storage.getFilename({}, mockFile, (_err, filename) => {
        expect(filename).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.mp3$/i);
        callbackCalled = true;
      });

      expect(callbackCalled).toBe(true);
      done();
    });

    it('should accept audio/mpeg format in fileFilter', (done) => {
      const mockFile = { mimetype: 'audio/mpeg' };
      const mockCb = jest.fn();

      audioOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeNull();
      expect(mockCb.mock.calls[0][1]).toBe(true);
      done();
    });

    it('should accept audio/aac format in fileFilter', (done) => {
      const mockFile = { mimetype: 'audio/aac' };
      const mockCb = jest.fn();

      audioOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeNull();
      expect(mockCb.mock.calls[0][1]).toBe(true);
      done();
    });

    it('should reject non-audio format in fileFilter', (done) => {
      const mockFile = { mimetype: 'text/plain' };
      const mockCb = jest.fn();

      audioOpts.fileFilter(null, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb.mock.calls[0][0]).toBeInstanceOf(ClientFaultError);
      expect(mockCb.mock.calls[0][1]).toBe(false);
      done();
    });
  });
});
