import { AppointmentStatus } from "../enums/appoinment.enum";

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentStatus:
 *       type: string
 *       enum: [scheduled, completed, cancelled]
 *       example: scheduled
 *
 *     CreateAppointmentDto:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - scheduledAt
 *         - reason
 *       properties:
 *         patientId:
 *           type: string
 *           description: MongoDB ObjectId of the patient
 *           example: "674e8d2fc9a5d531a5e4b8f2"
 *         doctorId:
 *           type: string
 *           description: MongoDB ObjectId of the doctor
 *           example: "674e8d2fc9a5d531a5e4b8f9"
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-09T10:00:00.000Z"
 *         reason:
 *           type: string
 *           description: Reason for the appointment
 *           example: "Regular cardiac check-up"
 *         notes:
 *           type: string
 *           description: Additional notes about the appointment
 *           example: "Patient requested an early morning slot"
 *
 *     UpdateAppointmentDto:
 *       type: object
 *       properties:
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-09T14:30:00.000Z"
 *         reason:
 *           type: string
 *           example: "Follow-up for medication adjustment"
 *         status:
 *           $ref: "#/components/schemas/AppointmentStatus"
 *         notes:
 *           type: string
 *           example: "Patient rescheduled due to travel"
 */

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  scheduledAt?: Date;
  reason?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  scheduledDate?: Date;
  status?: AppointmentStatus;
  patientId?: string;
  doctorId?: string;
}

export interface AdminAppointmentQuery extends AppointmentQuery {
  patientName?: string;
  doctorName?: string;
}
