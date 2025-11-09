import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import { UserQuery } from "../interfaces/user.interface";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const { data, meta } = await userService.getAllUsers(
      req.validatedQuery as UserQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_USERS, data), meta });
  } catch (error: any) {
    next(error);
  }
};