import { Router } from "express";
import { UserRole } from "../enums/role.enum";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware";
import * as reportController from "../controllers/report.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: API endpoints for generating reports
 */

/**
 * @swagger
 * /api/report/visit/{appointmentId}:
 *   get:
 *     summary: Generate visit report PDF
 *     description: Generate a PDF visit report for an appointment. Accessible to **Doctor** and **Admin** roles only.
 *     tags: [Report]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID
 *     responses:
 *       200:
 *         description: PDF report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.get(
  "/visit/:appointmentId",
  authenticate,
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  reportController.generateVisitReport
);

export default router;
