import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import env from "../config/env";
import errorMessage from "../constants/errorMessage";
import { HttpStatusError } from "../errors/http.error";
import { HttpStatus } from "../enums/http.enum";
import { StringValue, TokenPayload } from "../interfaces/jwt.interface";
import { Request } from "express";

/**
 * To sign jwt access token
 * @param id
 * @param role
 * @returns jwt token
 */
export const generateAccessToken = (id: string, role: string): string => {
  return sign({ id, role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExp as StringValue,
  });
};

/**
 * To sign jwt refresh token
 * @param id
 * @param role
 * @returns jwt token
 */
export const generateRefreshToken = (id: string, role: string): string => {
  return sign({ id, role }, env.jwt.refershSecret, {
    expiresIn: env.jwt.refershExp as StringValue,
  });
};

/**
 * To verify jwt access token
 * @param token
 * @returns token payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return verify(token, env.jwt.accessSecret) as TokenPayload;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.INVALID_TOKEN
      );
    }
    throw new HttpStatusError(
      HttpStatus.UNAUTHORIZED,
      errorMessage.TOKEN_VERIFICATION_FAILED
    );
  }
};

/**
 * To verify jwt refresh token
 * @param token
 * @returns token payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return verify(token, env.jwt.refershSecret) as TokenPayload;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.INVALID_REFRESH_TOKEN
      );
    }
    throw new HttpStatusError(
      HttpStatus.UNAUTHORIZED,
      errorMessage.REFRESH_TOKEN_VERIFICATION_FAILED
    );
  }
};

/**
 * Extract token from various sources
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
};
