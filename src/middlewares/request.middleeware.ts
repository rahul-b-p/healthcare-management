import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";

export const validateReqBody = (schema: Joi.AnySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.REQ_PAYLOAD
      );
    }

    const { error } = schema
      .options({ allowUnknown: false })
      .validate(req.body);

    error
      ? next(new HttpStatusError(HttpStatus.BAD_REQUEST, error.message))
      : next();
  };
};

export const validateReqQuery = <T = any>(schema: Joi.ObjectSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errorMessage = error.details.map((d) => d.message).join("; ");
      return next(new HttpStatusError(400, errorMessage));
    }

    req.validatedQuery = value as T;
    next();
  };
};
