const redis = require("redis")
const dotenv = require("dotenv")

dotenv.config()

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

(async () => {
    try {
      await redisClient.connect();
      console.log('Redis client connected');
    } catch (err) {
      console.error('Redis connection error:', err);
    }
  })();

redisClient.on('error', (err) => {
    console.error('Redis error:', err)
});

module.exports = redisClient