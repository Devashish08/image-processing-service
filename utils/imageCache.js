const redisClient = require('../configs/redis')

const CACHE_TTL = 60 * 60 * 24 * 7;


const getCacheKey = (imageId, transformOptions) => {
    return `img:${imageId}:${JSON.stringify(transformOptions)}`;
    
}

const getFromCache = async (imageId, transformOptions) => {
    try {
        const cacheKey = getCacheKey(imageId, transformOptions);
        const cachedImage = await redisClient.get(cacheKey);

        if(cachedImage) {
            return Buffer.from(cachedImage, 'base64');
        }
        return null;
    } catch (error) {
        console.log('Error getting image from cache:', error);
        return null;
    }
};

const saveToCache = async (imageId, transformOptions, imageBuffer) => {
    try {
        const cacheKey = getCacheKey(iamgeId, transformOptions);
        await redisClient.set(
            cacheKey, 
            imageBuffer.toString('base64'),
            {EX: CACHE_TTL}
        );
        return true;
    } catch (error) {
        console.error('Error saving image to cache:' error);
        return false;
    }
}

module.exports = {
    getFromCache,
    saveToCache,
    getCacheKey,
    CACHE_TTL
}