import { UserRole } from "../enums/role.enum";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
      validatedQuery?: any;
    }
  }
}

export {};
