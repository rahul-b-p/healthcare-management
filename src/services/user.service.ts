import User, { IUser } from "../models/user.model";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { handleMongoDBError } from "../utils/mongo-error";
import { logger } from "../utils/logger";
import errorMessage from "../constants/errorMessage";
import { UserRole } from "../enums/role.enum";
import { CreateUserDto, UserQuery, UsersResponse } from "../interfaces/user.interface";
import { hashPassword } from "../utils/hashUtils";
import { FlattenMaps } from "mongoose";

/**
 * Create a new user
 */
export const createUser = async (
  userData: CreateUserDto
): Promise<FlattenMaps<IUser>> => {
  logger.debug("Creating new user");
  try {
    const { role, password, confirmPassword, ...remainingFeilds } = userData;
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.INVALID_ROLE
      );
    }
    if (password !== confirmPassword) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.PASSWORD_DOSENT_MATCH
      );
    }
    const passwordHash = await hashPassword(password);
    const user = new User({ passwordHash, role, ...remainingFeilds });
    return (await user.save()).toJSON();
  } catch (error) {
    return handleMongoDBError(error, "create user");
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  logger.debug(`Fetching user data of user with id:${userId}`);
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.USER_NOT_FOUND
      );
    }
    return user;
  } catch (error) {
    return handleMongoDBError(error, "get user by ID");
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<IUser> => {
  logger.debug(`Fetching user data of user with email:${email}`);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.USER_NOT_FOUND
      );
    }
    return user;
  } catch (error) {
    return handleMongoDBError(error, "get user by email");
  }
};

/**
 * Get user by phone
 */
export const getUserByPhone = async (phone: string): Promise<IUser> => {
  logger.debug(`Fetching user data of user with phone:${phone}`);
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.USER_NOT_FOUND
      );
    }
    return user;
  } catch (error) {
    return handleMongoDBError(error, "get user by phone");
  }
};

/**
 * Get all users with pagination, sorting and search
 */
export const getAllUsers = async (query: UserQuery): Promise<UsersResponse> => {
  logger.debug("Fetching all users");

  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    role,
  } = query;

  try {
    // Build filter object
    const filter: any = {};

    // Add role filter if provided
    if (role) {
      filter.role = role;
    }

    // Add search filter if provided
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel for better performance
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash") // Exclude password hash
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(), // Use lean for better performance since we don't need mongoose documents
      User.countDocuments(filter),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get all users");
  }
};
