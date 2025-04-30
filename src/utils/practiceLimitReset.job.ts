import cron from 'node-cron';
import userModel from '../models/user.model'; 
import { logger } from '../utils/logger';

// Runs every day at midnight
export const schedulePracticeLimitReset = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info("Running daily practice limit reset job...");

            await userModel.updateMany({}, { $set: { playedPracticeGame: 0,currentSpinCount:0 } });

            logger.info("Practice game limits reset for all users.");
        } catch (error) {
            logger.error("Error while resetting practice limits", error);
        }
    });
};
