import mongoose from "mongoose";
import PatientProfile from "../models/patient.model";
import { getEntityAuditLogs, logActivity } from "./audit-log.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { handleMongoDBError } from "../utils/mongo-error";
import { logger } from "../utils/logger";
import {
  CreatePatientProfileDto,
  PatientQuery,
  UpdatePatientDto,
} from "../interfaces/patient.interface";
import * as userService from "./user.service";
import { UserRole } from "../enums/role.enum";
import errorMessage from "../constants/errorMessage";
import { EntityType } from "../enums/entity.enum";
import { getAllPatientsPipeline } from "../pipelines/patient.pipeline";

export const createPatientProfile = async (
  user_id: string,
  userRole: string,
  profileData: CreatePatientProfileDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<any> => {
  logger.debug("Creating Patient Profile");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { bloodGroup, userId, ...remainingData } = profileData;

    if (!userId) {
      userId = user_id;
    }

    const user = await userService.getUserById(userId);
    if (user.role !== UserRole.PATIENT) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.INVALID_PATIENT
      );
    }

    const existingProfile = await PatientProfile.findOne({
      userId: userId,
    }).session(session);

    if (existingProfile) {
      throw new HttpStatusError(
        HttpStatus.CONFLICT,
        errorMessage.PATIENT_ALREADY_EXISTS
      );
    }

    const patientProfile = new PatientProfile({
      userId,
      bloodGroup: bloodGroup.toUpperCase(),
      ...remainingData,
    });

    await patientProfile.save({ session });

    await logActivity({
      entityType: EntityType.PATIENT,
      entityId: patientProfile._id as mongoose.Types.ObjectId,
      action: "create",
      performedBy: userId,
      changes: [
        { field: "age", newValue: patientProfile.age },
        { field: "bloodGroup", newValue: patientProfile.bloodGroup },
        { field: "gender", newValue: patientProfile.gender },
      ],
      context: auditContext,
    });

    await session.commitTransaction();
    return patientProfile.toSecureJSON(userRole);
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "create patient profile");
  } finally {
    session.endSession();
  }
};

export const getPatientProfile = async (
  patientId: string,
  userRole: string
): Promise<any> => {
  logger.debug(`Fetching Patient Profile of patient: ${patientId}`);
  try {
    const patientProfile = await PatientProfile.findById(patientId);

    if (!patientProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.PATIENT_NOT_FOUND
      );
    }

    return patientProfile.toSecureJSON(userRole);
  } catch (error) {
    handleMongoDBError(error, "get patient profile");
    throw error;
  }
};

export const getPatientProfileByUser = async (
  userId: string,
  userRole: string
): Promise<any> => {
  logger.debug(`Fetching patient profile by user id:${userId}`);
  try {
    const patientProfile = await PatientProfile.findOne({ userId: userId });

    if (!patientProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.PATIENT_NOT_FOUND
      );
    }

    return patientProfile.toSecureJSON(userRole);
  } catch (error) {
    handleMongoDBError(error, "get my patient profile");
    throw error;
  }
};

export const updatePatientProfile = async (
  patientId: string,
  userId: string,
  userRole: string,
  updateData: UpdatePatientDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<any> => {
  logger.debug(`Updating patient profile:${patientId}`);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const patientProfile = await PatientProfile.findById(patientId).session(
      session
    );

    if (!patientProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.PATIENT_NOT_FOUND
      );
    }

    const {
      age,
      height,
      weight,
      bloodGroup,
      address,
      gender,
      emergencyContact,
      medicalHistory,
    } = updateData;

    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (age !== undefined && patientProfile.age !== age) {
      changes.push({
        field: "age",
        oldValue: patientProfile.age,
        newValue: age,
      });
      patientProfile.age = age;
    }
    if (height !== undefined && patientProfile.height !== height) {
      changes.push({
        field: "height",
        oldValue: patientProfile.height,
        newValue: height,
      });
      patientProfile.height = height;
    }
    if (weight !== undefined && patientProfile.weight !== weight) {
      changes.push({
        field: "weight",
        oldValue: patientProfile.weight,
        newValue: weight,
      });
      patientProfile.weight = weight;
    }
    if (
      bloodGroup !== undefined &&
      patientProfile.bloodGroup !== bloodGroup.toUpperCase()
    ) {
      changes.push({
        field: "bloodGroup",
        oldValue: patientProfile.bloodGroup,
        newValue: bloodGroup.toUpperCase(),
      });
      patientProfile.bloodGroup = bloodGroup.toUpperCase();
    }
    if (address !== undefined) {
      changes.push({
        field: "address",
        oldValue: "[ENCRYPTED]",
        newValue: "[ENCRYPTED]",
      });
      patientProfile.address = address;
    }
    if (gender !== undefined && patientProfile.gender !== gender) {
      changes.push({
        field: "gender",
        oldValue: patientProfile.gender,
        newValue: gender,
      });
      patientProfile.gender = gender;
    }
    if (emergencyContact !== undefined) {
      changes.push({
        field: "emergencyContact",
        oldValue: "[ENCRYPTED]",
        newValue: "[ENCRYPTED]",
      });
      patientProfile.emergencyContact = emergencyContact;
    }
    if (medicalHistory !== undefined) {
      changes.push({
        field: "medicalHistory",
        oldValue: "[ENCRYPTED]",
        newValue: "[ENCRYPTED]",
      });
      patientProfile.medicalHistory = medicalHistory;
    }

    await patientProfile.save({ session });

    if (changes.length > 0) {
      await logActivity({
        entityType: EntityType.PATIENT,
        entityId: patientProfile._id as mongoose.Types.ObjectId,
        action: "update",
        performedBy: userId,
        changes,
        context: auditContext,
      });
    }

    await session.commitTransaction();
    return patientProfile.toSecureJSON(userRole);
  } catch (error) {
    await session.abortTransaction();
    handleMongoDBError(error, "update patient profile");
    throw error;
  } finally {
    session.endSession();
  }
};

export const deletePatientProfile = async (
  patientId: string,
  userId: string,
  role: UserRole,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<void> => {
  logger.debug(`Deleting patient profile ${patientId}`);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const patientProfile = await PatientProfile.findById(patientId).session(
      session
    );

    if (!patientProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.PATIENT_NOT_FOUND
      );
    }

    await logActivity({
      entityType: EntityType.PATIENT,
      entityId: patientProfile._id as mongoose.Types.ObjectId,
      action: "delete",
      performedBy: userId,
      changes: [
        { field: "userId", oldValue: patientProfile.userId.toString() },
        { field: "age", oldValue: patientProfile.age },
        { field: "bloodGroup", oldValue: patientProfile.bloodGroup },
      ],
      context: auditContext,
    });

    await PatientProfile.findByIdAndDelete(patientId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "delete patient profile");
  } finally {
    session.endSession();
  }
};

export const getAllPatients = async (
  userRole: UserRole,
  query: PatientQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug("Fetching all patient data");

  const { page = 1, limit = 10 } = query;
  const pipeline = getAllPatientsPipeline({
    ...query,
    page,
    limit,
    sortBy: query.sortBy || "createdAt",
    sortOrder: (query.sortOrder?.toUpperCase() as "ASC" | "DESC") || "DESC",
  });

  try {
    const result: AggregationResult[] = await PatientProfile.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return {
        data: [],
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0,
        },
      };
    }

    const patients = result[0]?.data ?? [];
    const total = result[0]?.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const patientsData = patients.map((doc: any) => {
      const patient = PatientProfile.hydrate(doc);
      return patient.toSecureJSON(userRole);
    });

    return {
      data: patientsData,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get all patients");
  }
};

export const getAssignedPatients = async (
  userId: string,
  userRole: string
): Promise<any[]> => {
  try {
    const Appointment = mongoose.model("Appointment");
    const appointments = await Appointment.find({
      doctorId: userId,
      status: { $in: ["scheduled", "in-progress", "completed"] },
    }).distinct("patientId");

    const patients = await PatientProfile.find({
      userId: { $in: appointments },
    }).populate("userId", "name email");

    const patientsData = patients.map((patient) =>
      patient.toSecureJSON(userRole)
    );

    return patientsData;
  } catch (error) {
    return handleMongoDBError(error, "get assigned patients");
  }
};

export const getPatientAuditLogs = async (patientId: string) => {
  logger.debug(`Fetching Audit Log Data for Patient: ${patientId}`);
  try {
    const patientProfile = await PatientProfile.findById(patientId);

    if (!patientProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.PATIENT_NOT_FOUND
      );
    }

    return await getEntityAuditLogs(EntityType.PATIENT, patientId);
  } catch (error) {
    return handleMongoDBError(error, "get patient audit logs");
  }
};