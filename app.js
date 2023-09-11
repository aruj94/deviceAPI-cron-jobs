import Express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import cron from 'node-cron';
import { connectToRedis } from "./controllers/redisController.js";
import { connectToDatabase } from "./controllers/dbControllers.js";
import { clearExpiredApikeys } from "./cron_jobs.js";

const app = Express();
dotenv.config();

const PORT = process.env.PORT || 3001;

const redisClient = await connectToRedis();
await connectToDatabase();

app.use(Express.json());
app.use(cors());

// Schedule a job to run every one minutes
//const job = cron.schedule("*/1 * * * *", clearExpiredApikeys);
// Schedule a job to run every midnight
const job = cron.schedule('0 0 * * *', clearExpiredApikeys)

app.listen(PORT);


export {redisClient}