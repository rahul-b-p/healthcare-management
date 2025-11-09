import app from "./app";
import { connectDB } from "./config/db";
import env from "./config/env";
import { logger } from "./utils/logger";
import http from "http";
import { initializeSocket } from "./socket/socket.server";

/**
 * Function to initialize the server
 */
const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(env.app.port, () => {
      logger.info(
        `Application started and running at http://localhost:${env.app.port}`
      );
      logger.info(`WebSocket server initialized on port ${env.app.port}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
