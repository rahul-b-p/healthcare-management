import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";
import * as authService from "../services/auth.service";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import { HttpStatusError } from "../errors/http.error";
import { HttpStatus } from "../enums/http.enum";
import errorMessage from "../constants/errorMessage";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(apiResponse(responseMessage.USER_SIGNED_UP, newUser));
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authTokens = await authService.signIn(req.body);
    res.json(apiResponse(responseMessage.SIGNI_IN, authTokens));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshHeader = req.headers["x-refresh-token"];

    if (!refreshHeader) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.REFERSH_TOKEN_REQ
      );
    }

    const refreshToken: string = Array.isArray(refreshHeader)
      ? refreshHeader[0]
      : refreshHeader;

    const authTokens = await authService.refresh(refreshToken);
    res.json(apiResponse(responseMessage.REFRESHED, authTokens));
  } catch (error) {
    next(error);
  }
};
