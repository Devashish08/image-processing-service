const { describe, test, expect, jest, beforeEach } = require('jest');
const redisClient = require('../../configs/redis');
const { getFromCache, saveToCache, getCacheKey, CACHE_TTL } = require('../imageCache');

// Mock the redis client
jest.mock('../../configs/redis', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

describe('Image Cache Utility', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console.error
    console.error = jest.fn();
  });

  describe('getCacheKey', () => {
    test('should generate correct cache key with image ID and transformation options', () => {
      const imageId = '12345';
      const transformOptions = { width: 200, height: 300, format: 'webp' };
      
      const cacheKey = getCacheKey(imageId, transformOptions);
      
      expect(cacheKey).toBe('img:12345:{"width":200,"height":300,"format":"webp"}');
    });
  });

  describe('getFromCache', () => {
    test('should return image buffer when cache hit occurs', async () => {
      // Mock cache hit
      const cachedBase64 = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      redisClient.get.mockResolvedValue(cachedBase64);
      
      const imageId = '12345';
      const transformOptions = { width: 200 };
      
      const result = await getFromCache(imageId, transformOptions);
      
      // Check that Redis client was called with correct key
      expect(redisClient.get).toHaveBeenCalledWith('img:12345:{"width":200}');
      
      // Check that we got a buffer with the decoded content
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('Hello World');
    });

    test('should return null when cache miss occurs', async () => {
      // Mock cache miss
      redisClient.get.mockResolvedValue(null);
      
      const result = await getFromCache('12345', { width: 200 });
      
      expect(result).toBeNull();
    });

    test('should handle errors and return null', async () => {
      // Mock redis error
      redisClient.get.mockRejectedValue(new Error('Redis error'));
      
      const result = await getFromCache('12345', { width: 200 });
      
      expect(console.error).toHaveBeenCalledWith(
        'Error getting image from cache:',
        expect.any(Error)
      );
      expect(result).toBeNull();
    });
  });

  describe('saveToCache', () => {
    test('should encode and save image buffer to cache', async () => {
      // Mock successful cache save
      redisClient.set.mockResolvedValue('OK');
      
      const imageId = '12345';
      const transformOptions = { width: 200 };
      const imageBuffer = Buffer.from('Test Image Data');
      
      const result = await saveToCache(imageId, transformOptions, imageBuffer);
      
      // Check Redis client was called correctly
      expect(redisClient.set).toHaveBeenCalledWith(
        'img:12345:{"width":200}',
        'VGVzdCBJbWFnZSBEYXRh', // "Test Image Data" in base64
        { EX: CACHE_TTL }
      );
      
      expect(result).toBe(true);
    });

    test('should handle errors and return false', async () => {
      // Mock Redis error
      redisClient.set.mockRejectedValue(new Error('Redis error'));
      
      const result = await saveToCache('12345', { width: 200 }, Buffer.from('test'));
      
      expect(console.error).toHaveBeenCalledWith(
        'Error saving image to cache:',
        expect.any(Error)
      );
      expect(result).toBe(false);
    });
  });
});