import { checkMongoDbConnection, connectToDatabase } from './controllers/dbControllers.js';
import { deleteSpecificValue, keyExists } from './controllers/redisController.js';
import { apiKeyDataModel } from './model/MongoData.js';
import { redisClient } from './app.js';

/**
 * API hash data is returned from the redis cache server 
 * or the database if the cache server is empty.
 */
async function getApiHashData() {
    
    let api_array = [];

    try{
        // check if key exists in redis
        if (keyExists(process.env.API_HASH_CACHE_NAME)) {
            let cachedData = await redisClient.get(process.env.API_HASH_CACHE_NAME);
            const findresult = JSON.parse(cachedData);
            
            for (var i in findresult) {
                api_array.push(findresult[i])
            }
        } else {
            // check if mongoDb is connected
            if (! await checkMongoDbConnection()) {
                await connectToDatabase();
            }

            const findresult = await apiKeyDataModel.find({}, { _id: 0 });

            for (var i in findresult) {
                api_array.push(findresult[i])
            }
        }

        return api_array;

    } catch(error) {
        console.log(error.message);
        console.log({ error: 'Internal Server Error' });
    }
}

/**
 * Clear expired API keys.
 * A scan is done every mid-noght to check what all API keys have expired
 * and are subsequently deleted.
 */
const clearExpiredApikeys = async () => {
    try {
            // get an array of all api hash values
            const ApiHashData = await getApiHashData();
            // Get todays date
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate());
    
            // check if the given client API Key exists or not
            for (let i = 0; i < ApiHashData.length; i++) {

                const ApiKeyExpiration = ApiHashData[i]["expirationTimestamp"];
                const ApiKeyExpirationDate = new Date(ApiKeyExpiration);
                const ApiKeyHash = ApiHashData[i]["data"];
                
                if (currentDate > ApiKeyExpirationDate) {
                    await apiKeyDataModel.deleteOne({data: ApiKeyHash});
                    console.log("API key successfully removed from database")
                    await deleteSpecificValue(ApiHashData[i]);
                }
            }
    } catch (error) {
        console.log(error.message);
        console.log({ error: 'Internal Server Error' });
    }
}

export {clearExpiredApikeys}