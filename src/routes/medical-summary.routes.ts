import { Router } from "express";
import { UserRole } from "../enums/role.enum";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware";
import * as medicalSummaryController from "../controllers/medical-summary.controller";
import {
  validateReqBody,
  validateReqQuery,
} from "../middlewares/request.middleeware";
import {
  createMedicalSummarySchema,
  updateMedicalSummarySchema,
  medicalSummaryQuerySchema,
} from "../schemas/medical-summary.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MedicalSummary
 *   description: API endpoints for managing medical summaries
 */

/**
 * @swagger
 * /api/medical-summary:
 *   post:
 *     summary: Create a new medical summary
 *     description: Create a medical summary. Accessible to **Doctor** and **Admin** roles only.
 *     tags: [MedicalSummary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicalSummaryDto'
 *     responses:
 *       201:
 *         description: Medical summary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalSummary'
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
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  validateReqBody(createMedicalSummarySchema),
  medicalSummaryController.createMedicalSummary
);

/**
 * @swagger
 * /api/medical-summary/{medicalSummaryId}:
 *   patch:
 *     summary: Update a medical summary
 *     description: Update medical summary details. Accessible to **Doctor** (only creator) and **Admin**.
 *     tags: [MedicalSummary]
 *     parameters:
 *       - in: path
 *         name: medicalSummaryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicalSummaryDto'
 *     responses:
 *       200:
 *         description: Medical summary updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Medical summary not found
 */
router.patch(
  "/:medicalSummaryId",
  authenticate,
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  validateReqBody(updateMedicalSummarySchema),
  medicalSummaryController.updateMedicalSummary
);

/**
 * @swagger
 * /api/medical-summary/doctor/me:
 *   get:
 *     summary: Get medical summaries created by logged-in doctor
 *     description: Get medical summaries with filters. Accessible to **Doctor** only.
 *     tags: [MedicalSummary]
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
 *         name: appointmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical summaries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/doctor/me",
  authenticate,
  authorizeRole(UserRole.DOCTOR),
  validateReqQuery(medicalSummaryQuerySchema),
  medicalSummaryController.getDoctorMedicalSummaries
);

/**
 * @swagger
 * /api/medical-summary/patient/me:
 *   get:
 *     summary: Get medical summaries for logged-in patient
 *     description: Get medical summaries for the logged-in patient with filters.
 *     tags: [MedicalSummary]
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
 *         name: appointmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical summaries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/patient/me",
  authenticate,
  authorizeRole(UserRole.PATIENT),
  validateReqQuery(medicalSummaryQuerySchema),
  medicalSummaryController.getPatientMedicalSummaries
);

/**
 * @swagger
 * /api/medical-summary/admin/all:
 *   get:
 *     summary: Get all medical summaries (Admin only)
 *     description: Get all medical summaries with filters.
 *     tags: [MedicalSummary]
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
 *         name: appointmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical summaries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/admin/all",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validateReqQuery(medicalSummaryQuerySchema),
  medicalSummaryController.getAllMedicalSummaries
);

/**
 * @swagger
 * /api/medical-summary/{medicalSummaryId}:
 *   get:
 *     summary: Get medical summary by ID
 *     description: Get medical summary details by ID. Doctors can only read their created summaries, patients can only read their own summaries.
 *     tags: [MedicalSummary]
 *     parameters:
 *       - in: path
 *         name: medicalSummaryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Medical summary not found
 */
router.get(
  "/:medicalSummaryId",
  authenticate,
  authorizeRole(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN),
  medicalSummaryController.getMedicalSummaryById
);

/**
 * @swagger
 * /api/medical-summary/{medicalSummaryId}:
 *   delete:
 *     summary: Delete a medical summary
 *     description: Permanently deletes a medical summary. **Admin only**.
 *     tags: [MedicalSummary]
 *     parameters:
 *       - in: path
 *         name: medicalSummaryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical summary deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Medical summary not found
 */
router.delete(
  "/:medicalSummaryId",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  medicalSummaryController.deleteMedicalSummary
);

/**
 * @swagger
 * /api/medical-summary/{medicalSummaryId}/audit-logs:
 *   get:
 *     summary: Get audit logs for a medical summary
 *     description: Retrieves all audit actions related to a medical summary. Accessible to **Admin** only.
 *     tags: [MedicalSummary]
 *     parameters:
 *       - in: path
 *         name: medicalSummaryId
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
  "/:medicalSummaryId/audit-logs",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  medicalSummaryController.getAuditLogs
);

export default router;
