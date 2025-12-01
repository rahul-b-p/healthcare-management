import bcrypt from "bcrypt";
import { logger } from "./logger";
import env from "../config/env";

export const hashPassword = async (password: string): Promise<string> => {
  logger.debug("Securing the password");
  try {
    const salt = await bcrypt.genSalt(Number(env.hashSalt));
    const hashPass = await bcrypt.hash(password, salt);

    return hashPass;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  try {
    const isValidPassword = await bcrypt.compare(password, passwordHash);

    return isValidPassword;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
