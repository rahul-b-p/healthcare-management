// auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt";
import * as userService from "../services/user.service";
import { UserRole } from "../enums/role.enum";
import errorMessage from "../constants/errorMessage";
import { TokenPayload } from "../interfaces/jwt.interface";

/**
 * Main authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        "Access token is required"
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Verify user still exists
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.ACCOUNT_NOT_FOUND
      );
    }

    // Attach user to request
    req.user = {
      userId: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof HttpStatusError) {
      throw error;
    }

    throw new HttpStatusError(
      HttpStatus.UNAUTHORIZED,
      errorMessage.INVALID_TOKEN
    );
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpStatusError(
          HttpStatus.UNAUTHORIZED,
          errorMessage.UNAUTHORIZED
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new HttpStatusError(
          HttpStatus.FORBIDDEN,
          errorMessage.NO_PERMISSION
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpStatusError) {
        throw error;
      }
      throw new HttpStatusError(
        HttpStatus.FORBIDDEN,
        errorMessage.UNAUTHORIZED
      );
    }
  };
};
