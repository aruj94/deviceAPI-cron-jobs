import { Redis } from "ioredis";
import { redisClient } from "../app.js";

/**
 * Connect to Redis server
 * @returns Redis client
 */
const connectToRedis = async () => {
    const redisClient = new Redis({
        host: 'localhost',
        port: process.env.REDIS_PORT || 6379,
    });

    redisClient.on('error', (error) => {
        console.error('Redis connection error:', error);
    });

    return redisClient;
}

/**
 * Delete the given value from the redis cache
 * @param {*} valueToRemove 
 */
const deleteSpecificValue = async (valueToRemove) => {
    try {
        let cachedData = await redisClient.get(process.env.API_HASH_CACHE_NAME);
        const currentJsonObj = JSON.parse(cachedData);

        // Filter out the item you want to remove
        const updatedJsonObj = currentJsonObj.filter(item => item.data !== valueToRemove.data);
        
        // Serialize the modified JavaScript object back into a JSON string
        const updatedJsonValue = JSON.stringify(updatedJsonObj);

        // Update the Redis key with the new JSON string
        await redisClient.set(process.env.API_HASH_CACHE_NAME, updatedJsonValue);
        console.log('Removed the API key from Redis.');
    } catch(error) {
        console.log(error.message);
    }
}

/**
 * Check if a data key exists in redis
 * @returns bool that represents if the given key exists in redis
 */
const keyExists = async (key) => {
    const cachedData = await getCacheData(key);
    if (!cachedData) {
        return true
    }

    return false;
}

/**
 * 
 * @returns data from redis for the cache key name
 */
const getCacheData = async (key) => {
    return redisClient.get(key);
}

export {connectToRedis, deleteSpecificValue, keyExists}