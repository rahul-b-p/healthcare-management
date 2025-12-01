import errorMessage from "../constants/errorMessage";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { JwtAuthResponse } from "../interfaces/jwt.interface";
import { signInDto } from "../interfaces/user.interface";
import { IUser } from "../models/user.model";
import { comparePassword } from "../utils/hashUtils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import * as userService from "./user.service";

/**
 * Function that execute sign in bussiness logic
 * @param signInData 
 * @returns Auth Tokens
 */
export const signIn = async (
  signInData: signInDto
): Promise<JwtAuthResponse> => {
  const { password, email, phone } = signInData;
  let user: IUser;

  switch (true) {
    case !email && !phone:
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.EMIAL_OR_PHONE_NEED
      );
    case !!email:
      user = await userService.getUserByEmail(email);
      break;
    case !!phone:
      user = await userService.getUserByPhone(phone);
      break;
    default:
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.EMIAL_OR_PHONE_NEED
      );
  }

  const isValidUser = await comparePassword(password, user.passwordHash);
  if (!isValidUser) {
    throw new HttpStatusError(
      HttpStatus.UNAUTHORIZED,
      errorMessage.INVALID_PASSWORD
    );
  }

  return {
    accessToken: generateAccessToken(user.id, user.role),
    refershToken: generateRefreshToken(user.id, user.role),
  };
};

/**
 * Function that executes refersh bussiness logic
 * @param token 
 * @returns auth Tokens
 */
export const refresh = async (token: string): Promise<JwtAuthResponse> => {
  const payload = verifyRefreshToken(token);
  const user = await userService.getUserById(payload.id);

  return {
    accessToken: generateAccessToken(user.id, user.role),
    refershToken: generateRefreshToken(user.id, user.role),
  };
};
