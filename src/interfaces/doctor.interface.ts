/**
 * @swagger
 * components:
 *   schemas:
 *     Availability:
 *       type: object
 *       properties:
 *         days:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Monday", "Wednesday", "Friday"]
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "17:00"
 *
 *     CreateDoctorProfileDto:
 *       type: object
 *       required:
 *         - userId
 *         - specialization
 *         - qualifications
 *         - licenseNumber
 *         - yearsOfExperience
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the doctor user (must have role DOCTOR)
 *           example: 674e8d2fc9a5d531a5e4b8f2
 *         specialization:
 *           type: string
 *           enum: [General Physician, Cardiologist, Dermatologist, Pediatrician, Neurologist, Orthopedic, Gynecologist, Psychiatrist, ENT Specialist, Ophthalmologist, Other]
 *           example: Cardiologist
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *           example: ["MBBS", "MD"]
 *         licenseNumber:
 *           type: string
 *           example: "LIC12345"
 *         yearsOfExperience:
 *           type: integer
 *           example: 10
 *         clinicLocation:
 *           type: string
 *           example: "Apollo Hospital, Bangalore"
 *         consultationFee:
 *           type: number
 *           example: 500
 *         availability:
 *           $ref: "#/components/schemas/Availability"
 *         bio:
 *           type: string
 *           example: "Cardiologist with 10 years of experience in treating cardiac patients."
 *
 *     UpdateDoctorProfileDto:
 *       type: object
 *       properties:
 *         specialization:
 *           type: string
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         licenseNumber:
 *           type: string
 *         yearsOfExperience:
 *           type: integer
 *         clinicLocation:
 *           type: string
 *         consultationFee:
 *           type: number
 *         availability:
 *           $ref: "#/components/schemas/Availability"
 *         bio:
 *           type: string
 *         isActive:
 *           type: boolean
 *
 *     DoctorProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         specialization:
 *           type: string
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         licenseNumber:
 *           type: string
 *         yearsOfExperience:
 *           type: integer
 *         clinicLocation:
 *           type: string
 *         consultationFee:
 *           type: number
 *         availability:
 *           $ref: "#/components/schemas/Availability"
 *         bio:
 *           type: string
 *         isActive:
 *           type: boolean
 *         rating:
 *           type: number
 *         totalAppointments:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export interface CreateDoctorProfileDto {
  userId: string;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  clinicLocation?: string;
  consultationFee?: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  bio?: string;
}

export interface UpdateDoctorProfileDto {
  specialization?: string;
  qualifications?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  clinicLocation?: string;
  consultationFee?: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  bio?: string;
  isActive?: boolean;
}

export interface DoctorQuery {
  page: number;
  limit: number;
  userId?: string;
  name?: string;
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "DESC";
  isActive?: boolean;
  minExperience?: number;
  maxExperience?: number;
  specialization?: string;
}
