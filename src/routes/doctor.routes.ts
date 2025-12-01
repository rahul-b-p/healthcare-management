import { Router } from "express";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware";
import * as doctorController from "../controllers/doctor.controller";
import { UserRole } from "../enums/role.enum";
import {
  validateReqBody,
  validateReqQuery,
} from "../middlewares/request.middleeware";
import {
  createDoctorProfileSchema,
  doctorQuerySchema,
  updateDoctorProfileSchema,
} from "../schemas/doctor.scheme";

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: APIs for managing doctor profiles
 */
const router = Router();

/**
 * @swagger
 * /api/doctor/profile:
 *   post:
 *     summary: Create doctor profile
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateDoctorProfileDto"
 *     responses:
 *       201:
 *         description: Doctor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DoctorProfileResponse"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/profile",
  authenticate,
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  validateReqBody(createDoctorProfileSchema),
  doctorController.createProfile
);

/**
 * @swagger
 * /api/doctor:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctor]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, DESC]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minExperience
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxExperience
 *         schema:
 *           type: integer
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/DoctorProfileResponse"
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  validateReqQuery(doctorQuerySchema),
  doctorController.getAllDoctors
);

/**
 * @swagger
 * /api/doctor/profile/{profileId}:
 *   get:
 *     summary: Get doctor by profile ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DoctorProfileResponse"
 *       404:
 *         description: Doctor profile not found
 */
router.get("/profile/:profileId", doctorController.getProfileById);

/**
 * @swagger
 * /api/doctor/user/{userId}:
 *   get:
 *     summary: Get doctor profile by user ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DoctorProfileResponse"
 *       404:
 *         description: Doctor profile not found
 */
router.get("/user/:userId", doctorController.getProfileByUserId);

/**
 * @swagger
 * /api/doctor/me:
 *   get:
 *     summary: Get my doctor profile
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DoctorProfileResponse"
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  authenticate,
  authorizeRole(UserRole.DOCTOR),
  doctorController.getMyProfile
);

/**
 * @swagger
 * /api/doctor/profile/{profileId}:
 *   patch:
 *     summary: Update doctor profile
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateDoctorProfileDto"
 *     responses:
 *       200:
 *         description: Doctor profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/DoctorProfileResponse"
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor profile not found
 */
router.patch(
  "/profile/:profileId",
  authenticate,
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  validateReqBody(updateDoctorProfileSchema),
  doctorController.updateProfile
);

/**
 * @swagger
 * /api/doctor/profile/{profileId}:
 *   delete:
 *     summary: Delete doctor profile (Admin only)
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Doctor profile not found
 */
router.delete(
  "/profile/:profileId",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  doctorController.deleteProfile
);

export default router;
