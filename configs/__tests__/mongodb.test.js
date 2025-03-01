const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../mongodb');
const { describe, test, expect, jest, beforeEach } = require('jest');

// Mock mongoose and dotenv
jest.mock('mongoose');
jest.mock('dotenv');

describe('MongoDB Configuration', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock process.exit
    process.exit = jest.fn();
    
    // Mock dotenv config
    dotenv.config = jest.fn();
  });

  test('should connect to MongoDB with correct URI and options', async () => {
    // Mock successful connection
    const mockConnection = {
      connection: {
        host: 'test-mongodb-host'
      }
    };
    
    mongoose.connect.mockResolvedValue(mockConnection);
    
    // Set environment variable
    process.env.MONGODB_URI = 'mongodb://test-host/test-db';
    
    // Call the connectDB function
    await connectDB();
    
    // Check that mongoose.connect was called with correct params
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://test-host/test-db',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    
    // Check that success message was logged
    expect(console.log).toHaveBeenCalledWith('MongoDB Connected: test-mongodb-host');
  });

  test('should handle connection errors and exit process', async () => {
    // Mock connection failure
    const error = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(error);
    
    // Call the connectDB function
    await connectDB();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith('MongoDB Connection Error: Connection failed');
    
    // Check that process.exit was called with code 1
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});