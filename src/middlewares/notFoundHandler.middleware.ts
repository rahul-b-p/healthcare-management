import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";

/**
 * Express middleware to handle not found error
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new HttpStatusError(
    HttpStatus.NOT_FOUND,
    `The requested resource ${req.originalUrl} was not found on the server`
  );
  next(error);
};
