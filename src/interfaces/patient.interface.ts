/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePatientProfileDto:
 *       type: object
 *       required:
 *         - age
 *         - height
 *         - weight
 *         - bloodGroup
 *         - address
 *       properties:
 *         userId:
 *           type: string
 *           example: "64e9f24b8e7a2f001234abcd"
 *         age:
 *           type: number
 *           example: 32
 *         height:
 *           type: number
 *           example: 172
 *         weight:
 *           type: number
 *           example: 70
 *         bloodGroup:
 *           type: string
 *           enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
 *           example: "O+"
 *         address:
 *           type: string
 *           example: "12, Green Street, Bangalore"
 *         gender:
 *           type: string
 *           enum: ["male", "female", "other"]
 *           example: "male"
 *         emergencyContact:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Doe"
 *             relation:
 *               type: string
 *               example: "Wife"
 *             phone:
 *               type: string
 *               example: "+919876543210"
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Diabetes", "Hypertension"]

 *     UpdatePatientDto:
 *       type: object
 *       description: Partial fields allowed for updating a patient profile. `userId` cannot be updated.
 *       properties:
 *         age:
 *           type: number
 *           example: 33
 *         height:
 *           type: number
 *           example: 173
 *         weight:
 *           type: number
 *           example: 68
 *         bloodGroup:
 *           type: string
 *           enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
 *           example: "O+"
 *         address:
 *           type: string
 *           example: "22, Blue Street, Bangalore"
 *         gender:
 *           type: string
 *           enum: ["male", "female", "other"]
 *           example: "male"
 *         emergencyContact:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Doe"
 *             relation:
 *               type: string
 *               example: "Wife"
 *             phone:
 *               type: string
 *               example: "+919876543210"
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Hypertension"]

 *     PatientProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e9f24b8e7a2f001234abcd"
 *         userId:
 *           type: string
 *           example: "64e9f24b8e7a2f001234abcd"
 *         age:
 *           type: number
 *           example: 32
 *         height:
 *           type: number
 *           example: 172
 *         weight:
 *           type: number
 *           example: 70
 *         bloodGroup:
 *           type: string
 *           example: "O+"
 *         gender:
 *           type: string
 *           example: "male"
 *         address:
 *           type: string
 *           example: "12, Green Street, Bangalore"
 *         emergencyContact:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Doe"
 *             relation:
 *               type: string
 *               example: "Wife"
 *             phone:
 *               type: string
 *               example: "+919876543210"
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Diabetes"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export interface CreatePatientProfileDto {
  userId?: string;
  age: number;
  height: number;
  weight: number;
  bloodGroup: string;
  address: string;
  gender?: "male" | "female" | "other";
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
}

export interface UpdatePatientDto {
  age?: number;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
}

export interface PatientQuery {
  page: number;
  limit: number;
  userId?: string;
  name?: string;
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "ASC" | "DESC";
}

export interface PatientsPipelineOptions {
  page: number;
  limit: number;
  userId?: string;
  name?: string;
  sortBy: string;
  sortOrder: "DESC" | "ASC";
}
