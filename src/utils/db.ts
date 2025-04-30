import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    logger.info("Database connected successfully");
  } catch (error: any) {
    logger.error("Error connecting to database: ", error.message);
  }
}
