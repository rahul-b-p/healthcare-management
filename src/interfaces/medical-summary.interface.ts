import { IVitals } from "../models/medical-summary.model";

/**
 * @swagger
 * components:
 *   schemas:
 *     Vitals:
 *       type: object
 *       properties:
 *         bp:
 *           type: string
 *           example: "120/80"
 *         hr:
 *           type: string
 *           example: "75"
 *         temp:
 *           type: string
 *           example: "98.6"
 *         spo2:
 *           type: string
 *           example: "98%"
 *         weight:
 *           type: string
 *           example: "65kg"
 *         height:
 *           type: string
 *           example: "170cm"
 *
 *     MedicalSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "654b10de8cf12b6a8a5d1234"
 *         appointmentId:
 *           type: string
 *           example: "654b10de8cf12b6a8a5d1234"
 *         notes:
 *           type: string
 *           example: "Patient shows mild improvement after antibiotics."
 *         diagnoses:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Flu", "Cough"]
 *         prescriptions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Paracetamol 500mg", "Cough Syrup"]
 *         vitals:
 *           $ref: "#/components/schemas/Vitals"
 *         createdBy:
 *           type: string
 *           example: "654b10de8cf12b6a8a5d1111"
 *         updatedBy:
 *           type: string
 *           example: "654b10de8cf12b6a8a5d2222"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-08T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-08T12:00:00Z"
 *
 *     CreateMedicalSummaryDto:
 *       type: object
 *       required:
 *         - appointmentId
 *         - notes
 *         - diagnoses
 *       properties:
 *         appointmentId:
 *           type: string
 *           example: "654b10de8cf12b6a8a5d1234"
 *         notes:
 *           type: string
 *           example: "Patient shows mild improvement after antibiotics."
 *         diagnoses:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Flu", "Cough"]
 *         prescriptions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Paracetamol 500mg", "Cough Syrup"]
 *         vitals:
 *           $ref: "#/components/schemas/Vitals"
 *
 *     UpdateMedicalSummaryDto:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           example: "Patient has recovered completely."
 *         diagnoses:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Recovered from Flu"]
 *         prescriptions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["None"]
 *         vitals:
 *           $ref: "#/components/schemas/Vitals"
 */

export interface CreateMedicalSummaryDto {
  appointmentId: string;
  notes: string;
  diagnoses: string[];
  prescriptions?: string[];
  vitals?: IVitals;
}

export interface UpdateMedicalSummaryDto {
  notes?: string;
  diagnoses?: string[];
  prescriptions?: string[];
  vitals?: IVitals;
}

export interface MedicalSummaryQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  appointmentId?: string;
}