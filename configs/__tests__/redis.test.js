const redis = require('redis');
const dotenv = require('dotenv');
const { describe, test, expect, jest, beforeEach } = require('jest');

// Mock the redis module
jest.mock('redis');

describe('Redis Configuration', () => {
  let mockRedisClient;
  let mockConnect;
  let mockOn;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mocks for Redis client
    mockConnect = jest.fn().mockResolvedValue();
    mockOn = jest.fn();
    mockRedisClient = {
      connect: mockConnect,
      on: mockOn
    };
    
    // Mock the createClient method
    redis.createClient.mockReturnValue(mockRedisClient);
    
    // Mock dotenv config
    dotenv.config = jest.fn();
  });

  test('should create Redis client with correct connection options', () => {
    // Set environment variables for test
    process.env.REDIS_HOST = 'test-host';
    process.env.REDIS_PORT = '6379';

    // Import the redis config (this will execute the file)
    require('../redis');

    // Check that createClient was called with correct params
    expect(redis.createClient).toHaveBeenCalledWith({
      url: 'redis://test-host:6379'
    });
  });

  test('should attempt to connect to Redis', async () => {
    // Import the redis config
    require('../redis');

    // Wait for any promises to resolve
    await new Promise(process.nextTick);
    
    // Check that connect was called
    expect(mockConnect).toHaveBeenCalled();
  });

  test('should register error event handler', () => {
    // Import the redis config
    require('../redis');

    // Check that on method was called with 'error' event
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('should handle connection errors gracefully', async () => {
    // Make connect method reject
    const error = new Error('Connection failed');
    mockConnect.mockRejectedValue(error);
    
    // Mock console.error
    console.error = jest.fn();
    
    // Import the redis config
    require('../redis');

    // Wait for promises to resolve/reject
    await new Promise(process.nextTick);
    
    expect(console.error).toHaveBeenCalledWith('Redis connection error:', error);
  });
});