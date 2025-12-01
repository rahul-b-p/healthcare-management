import morgan from "morgan";
import winston from "winston";
import env from "../config/env";

/**
 * formatted winston logger
 */
export const logger = winston.createLogger({
  level: env.app.log,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      const formattedMessage =
        typeof message === "object"
          ? JSON.stringify(message, null, 2)
          : message;
      return `${timestamp} [${level}]: ${formattedMessage}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

const stream = {
  write: (message: any) => logger.info(message.trim()),
};

/**
 * formatted morgan logger
 */
export const morganLogger = morgan("dev", { stream });
