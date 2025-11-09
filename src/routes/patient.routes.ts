import { Router } from "express";
import { UserRole } from "../enums/role.enum";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware";
import * as patientController from "../controllers/patient.controller";
import {
  validateReqBody,
  validateReqQuery,
} from "../middlewares/request.middleeware";
import {
  createPatientProfileSchema,
  patientQuerySchema,
  updatePatientSchema,
} from "../schemas/patient.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: API endpoints for managing patient profiles
 */

/**
 * @swagger
 * /api/patient:
 *   post:
 *     summary: Create a new patient profile
 *     description: Create a patient profile. Accessible to **Patient** and **Admin** roles only.
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePatientProfileDto'
 *     responses:
 *       201:
 *         description: Patient profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientProfile'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  authorizeRole(UserRole.PATIENT, UserRole.ADMIN),
  validateReqBody(createPatientProfileSchema),
  patientController.createProfile
);

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Get all patient profiles
 *     description: Returns all patient profiles with pagination and sorting. Accessible to **Admin** only.
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, DESC]
 *           example: DESC
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           example: 64e9f24b8e7a2f001234abcd
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: Jhon Doe
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validateReqQuery(patientQuerySchema),
  patientController.getAllPatients
);

/**
 * @swagger
 * /api/patient/assigned:
 *   get:
 *     summary: Get patients assigned to the logged-in doctor
 *     description: Accessible only by **Doctor** role.
 *     tags: [Patient]
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned patients
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/assigned",
  authenticate,
  authorizeRole(UserRole.DOCTOR),
  patientController.getAssignedPatients
);

/**
 * @swagger
 * /api/patient/me:
 *   get:
 *     summary: Get the logged-in patient's own profile
 *     tags: [Patient]
 *     responses:
 *       200:
 *         description: Retrieved profile successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientProfile'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  authenticate,
  authorizeRole(UserRole.PATIENT),
  patientController.getMyProfile
);

/**
 * @swagger
 * /api/patient/{patientId}:
 *   get:
 *     summary: Get a patient profile by ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64e9f24b8e7a2f001234abcd
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.get(
  "/:patientId",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.PATIENT),
  patientController.getProfile
);

/**
 * @swagger
 * /api/patient/{patientId}:
 *   patch:
 *     summary: Update a patient profile
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientDto'
 *     responses:
 *       200:
 *         description: Patient profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.patch(
  "/:patientId",
  authenticate,
  validateReqBody(updatePatientSchema),
  patientController.updateProfile
);

/**
 * @swagger
 * /api/patient/{patientId}:
 *   delete:
 *     summary: Delete a patient profile
 *     description: Permanently deletes a patient profile. **Admin only**.
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient not found
 */
router.delete(
  "/:patientId",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  patientController.deleteProfile
);

/**
 * @swagger
 * /api/patient/{patientId}/audit-logs:
 *   get:
 *     summary: Get audit logs for a patient
 *     description: Retrieves all audit actions related to a patient. Accessible to **Admin** only.
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:patientId/audit-logs",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  patientController.getAuditLogs
);

export default router;
