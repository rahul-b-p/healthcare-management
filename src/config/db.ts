import mongoose from "mongoose";
import env from "./env";
import { logger } from "../utils/logger";
import "../config/env";

/**
 * Function to connect mongo db using its connect uri
 */
export const connectDB = async () => {
  try {
    const mongoConnect = await mongoose.connect(env.db.mongoUri);
    logger.info(
      `Mongo DB Connected: ${
        env.app.environment !== "production" && mongoConnect.connection.host
      } `
    );

    mongoose.connection.on("disconnected", () => {
      logger.info("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.info("MongoDB connection error:", err);
    });
  } catch (error: any) {
    logger.error(`DB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
