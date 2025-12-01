import Joi from "joi";
import errorMessage from "../constants/errorMessage";
import { UserRole } from "../enums/role.enum";

const passwordSchema = Joi.string().min(8).messages({
  "string.empty": errorMessage.PASSWORD_REQUIRED,
  "string.min": errorMessage.PASSWORD_MIN_LENGTH,
});
const phoneSchema = Joi.string()
  .pattern(/^\+?[0-9]{10,15}$/)
  .required()
  .messages({
    "string.empty": errorMessage.PHONE_REQUIRED,
    "string.pattern.base": errorMessage.PHONE_INVALID,
  });

const emailSchema = Joi.string().email().messages({
  "string.empty": errorMessage.EMAIL_REQUIRED,
  "string.email": errorMessage.EMAIL_INVALID,
});

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": errorMessage.NAME_REQUIRED,
    "string.min": errorMessage.NAME_MIN_LENGTH,
  }),

  phone: phoneSchema.required(),

  email: emailSchema.required(),

  password: passwordSchema,
  confirmPassword: passwordSchema,
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      "any.only": errorMessage.ROLE_INVALID,
      "string.empty": errorMessage.ROLE_REQUIRED,
    }),
});

export const SignInSchema = Joi.object({
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).required(),
  limit: Joi.number().integer().min(1).max(100).required(),
  sortBy: Joi.string()
    .valid("name", "email", "phone", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  search: Joi.string().optional().allow(""),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
});
