import { Router } from "express";
import { UserRole } from "../enums/role.enum";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware";
import * as appointmentController from "../controllers/appointment.controller";
import {
  validateReqBody,
  validateReqQuery,
} from "../middlewares/request.middleeware";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentQuerySchema,
  adminAppointmentQuerySchema,
} from "../schemas/appointment.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: API endpoints for managing appointments
 */

/**
 * @swagger
 * /api/appointment:
 *   post:
 *     summary: Create a new appointment
 *     description: Create an appointment. Accessible to **Admin** only.
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentDto'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
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
  authorizeRole(UserRole.ADMIN),
  validateReqBody(createAppointmentSchema),
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointment/{appointmentId}:
 *   patch:
 *     summary: Update an appointment
 *     description: Update appointment details. Accessible to **Doctor** (only assigned) and **Admin**.
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointmentDto'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:appointmentId",
  authenticate,
  authorizeRole(UserRole.DOCTOR, UserRole.ADMIN),
  validateReqBody(updateAppointmentSchema),
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /api/appointment/doctor/me:
 *   get:
 *     summary: Get appointments for logged-in doctor
 *     description: Get appointments assigned to the logged-in doctor with filters.
 *     tags: [Appointment]
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
 *         name: scheduledDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/doctor/me",
  authenticate,
  authorizeRole(UserRole.DOCTOR),
  validateReqQuery(appointmentQuerySchema),
  appointmentController.getDoctorAppointments
);

/**
 * @swagger
 * /api/appointment/patient/me:
 *   get:
 *     summary: Get appointments for logged-in patient
 *     description: Get appointments for the logged-in patient with filters.
 *     tags: [Appointment]
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
 *         name: scheduledDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/patient/me",
  authenticate,
  authorizeRole(UserRole.PATIENT),
  validateReqQuery(appointmentQuerySchema),
  appointmentController.getPatientAppointments
);

/**
 * @swagger
 * /api/appointment/admin/all:
 *   get:
 *     summary: Get all appointments (Admin only)
 *     description: Get all appointments with advanced filters and search.
 *     tags: [Appointment]
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
 *         name: scheduledDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *       - in: query
 *         name: patientName
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/admin/all",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validateReqQuery(adminAppointmentQuerySchema),
  appointmentController.getAllAppointments
);

/**
 * @swagger
 * /api/appointment/{appointmentId}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Get appointment details by ID. Doctors can only read assigned appointments.
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.get(
  "/:appointmentId",
  authenticate,
  authorizeRole(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN),
  appointmentController.getAppointmentById
);

/**
 * @swagger
 * /api/appointment/{appointmentId}/audit-logs:
 *   get:
 *     summary: Get audit logs for an appointment
 *     description: Retrieves all audit actions related to an appointment. Accessible to **Admin** only.
 *     tags: [Appointment]
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
  "/:appointmentId/audit-logs",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  appointmentController.getAuditLogs
);

export default router;