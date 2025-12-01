import { Router } from "express";
import { validateReqBody } from "../middlewares/request.middleeware";
import { createUserSchema, SignInSchema } from "../schemas/user.schema";
import * as authController from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *     summary: Create a new user account
 *     description: Register a new user in the healthcare management application. Supports multiple roles such as admin, doctor, and patient.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/sign-up",
  validateReqBody(createUserSchema),
  authController.signUp
);

/**
 * @swagger
 * /api/auth/sign-in:
 *   post:
 *     summary: User login
 *     description: Authenticate an existing user using email or phone number and password. Returns JWT access and refresh tokens upon successful login.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/signInDto'
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User signed in successfully
 *                 data:
 *                   $ref: '#/components/schemas/JwtAuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/sign-in", validateReqBody(SignInSchema), authController.signIn);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     security:
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tokens Refreshed Successfully
 *                 data:
 *                   $ref: '#/components/schemas/JwtAuthResponse'
 */
router.post("/refresh", authController.refresh);

export default router;
