import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { logger } from "../utils/logger";
import { HttpStatusError } from "../errors/http.error";

/**
 * Express error hanadler middleware
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof HttpStatusError) {
    logger.warn(err.message);

    const response: Record<string, any> = {
      message: err.message,
    };

    // Include stack only in non-production environments
    if (process.env.NODE_ENV !== "production" && err.stack) {
      response.stack = err.stack;
    }

    res.status(err.status).json(response);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON format. Please check your request body.",
      statusCode: 400,
    });
    return;
  }

  logger.error(err.message);
  res.status(500).json({ status: "error", message: "Something went wrong" });
};
