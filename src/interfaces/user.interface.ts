/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f8a2a9b1f45a1bcd789012
 *         name:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "+919876543210"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [Admin, Doctor, Patient]
 *           example: "Patient"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUserDto:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - email
 *         - password
 *         - confirmPassword
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "+919876543210"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "StrongPassword@123"
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: "StrongPassword@123"
 *         role:
 *           type: string
 *           enum: [Admin, Doctor, Patient]
 *           example: "Patient"
 */

import { UserRole } from "../enums/role.enum";

export interface CreateUserDto {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     signInDto:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *           description: Optional — either email or phone must be provided
 *         phone:
 *           type: string
 *           example: "+919876543210"
 *           description: Optional — either phone or email must be provided
 *         password:
 *           type: string
 *           format: password
 *           example: "StrongPassword@123"
 */
export interface signInDto {
  email?: string;
  phone?: string;
  password: string;
}


export interface UserQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: UserRole;
}

export interface UsersResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}