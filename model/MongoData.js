import mongoose from "mongoose";

const API_COLLECTION_NAME = process.env.API_COLLECTION_NAME;

/**
 * Basic model is setup for the type of data allowed in the mongodb API keys collection.
 */
const API_key_data = mongoose.Schema({
    data: { type: String, required: true },
    expirationTimestamp: { type: Date, required: true },
}, { versionKey: false });

const apiKeyDataModel = mongoose.model("apikeys", API_key_data, API_COLLECTION_NAME)

export {apiKeyDataModel}