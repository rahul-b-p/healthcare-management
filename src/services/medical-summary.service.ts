import mongoose from "mongoose";
import MedicalSummary, {
  IMedicalSummary,
} from "../models/medical-summary.model";
import { getEntityAuditLogs, logActivity } from "./audit-log.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { handleMongoDBError } from "../utils/mongo-error";
import { logger } from "../utils/logger";
import {
  CreateMedicalSummaryDto,
  UpdateMedicalSummaryDto,
  MedicalSummaryQuery,
} from "../interfaces/medical-summary.interface";
import { UserRole } from "../enums/role.enum";
import errorMessage from "../constants/errorMessage";
import { EntityType } from "../enums/entity.enum";
import {
  getDoctorMedicalSummariesPipeline,
  getPatientMedicalSummariesPipeline,
  getAllMedicalSummariesPipeline,
} from "../pipelines/medical-summary.pipeline";
import { getAppointmentById } from "./appointment.service";
import {
  getDoctorProfileById,
  getDoctorProfileByUserId,
} from "./doctor.service";

export const createMedicalSummary = async (
  userId: string,
  userRole: string,
  medicalSummaryData: CreateMedicalSummaryDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<any> => {
  logger.debug("Creating Medical Summary");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await getAppointmentById(
      medicalSummaryData.appointmentId,
      userId,
      userRole
    );

    let doctorProfile;
    if (userRole === UserRole.DOCTOR) {
      doctorProfile = await getDoctorProfileByUserId(userId);
    } else {
      doctorProfile = await getDoctorProfileById(
        appointment.doctorId.id.toString()
      );
    }

    if (!appointment) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.APPOINTMENT_NOT_FOUND
      );
    }

    if (!doctorProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    const existingSummary = await MedicalSummary.findOne({
      appointmentId: medicalSummaryData.appointmentId,
    }).session(session);

    if (existingSummary) {
      throw new HttpStatusError(
        HttpStatus.CONFLICT,
        errorMessage.MEDICAL_SUMMARY_ALREADY_EXISTS
      );
    }

    if (appointment.doctorId.id.toString() !== doctorProfile.id.toString()) {
      throw new HttpStatusError(
        HttpStatus.FORBIDDEN,
        errorMessage.NO_PERMISSION
      );
    }

    const medicalSummary = new MedicalSummary({
      ...medicalSummaryData,
      createdBy: doctorProfile.id,
    });

    await medicalSummary.save({ session });

    await logActivity({
      entityType: EntityType.MEDICAL_SUMMARY,
      entityId: medicalSummary._id as mongoose.Types.ObjectId,
      action: "create",
      performedBy: userId,
      changes: [
        {
          field: "appointmentId",
          newValue: medicalSummary.appointmentId.toString(),
        },
        { field: "notes", newValue: "[ENCRYPTED]" },
        {
          field: "diagnoses",
          newValue: `[${medicalSummary.diagnoses.length} diagnoses]`,
        },
        {
          field: "prescriptions",
          newValue: `[${medicalSummary.prescriptions.length} prescriptions]`,
        },
      ],
      context: auditContext,
    });

    const populatedSummary = await MedicalSummary.findById(medicalSummary._id)
      .populate({
        path: "appointmentId",
        populate: [
          {
            path: "patientId",
            populate: { path: "userId", select: "name email" },
          },
          {
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
          },
        ],
      })
      .populate({
        path: "createdBy",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "updatedBy",
        populate: { path: "userId", select: "name email" },
      });

    await session.commitTransaction();
    return populatedSummary?.toSecureJSON(UserRole.DOCTOR);
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "create medical summary");
  } finally {
    session.endSession();
  }
};

export const updateMedicalSummary = async (
  medicalSummaryId: string,
  userId: string,
  userRole: string,
  updateData: UpdateMedicalSummaryDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<any> => {
  logger.debug(`Updating medical summary: ${medicalSummaryId}`);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const medicalSummary = await MedicalSummary.findById(
      medicalSummaryId
    ).session(session);

    if (!medicalSummary) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.MEDICAL_SUMMARY_NOT_FOUND
      );
    }

    if (userRole === UserRole.DOCTOR) {
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctorProfile = await DoctorProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (
        !doctorProfile ||
        medicalSummary.createdBy.toString() !== doctorProfile._id.toString()
      ) {
        throw new HttpStatusError(
          HttpStatus.FORBIDDEN,
          errorMessage.NO_PERMISSION
        );
      }
    }

    const { notes, diagnoses, prescriptions, vitals } = updateData;
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (notes && medicalSummary.notes !== notes) {
      changes.push({
        field: "notes",
        oldValue: "[ENCRYPTED]",
        newValue: "[ENCRYPTED]",
      });
      medicalSummary.notes = notes;
    }

    if (
      diagnoses &&
      JSON.stringify(medicalSummary.diagnoses) !== JSON.stringify(diagnoses)
    ) {
      changes.push({
        field: "diagnoses",
        oldValue: `[${medicalSummary.diagnoses.length} diagnoses]`,
        newValue: `[${diagnoses.length} diagnoses]`,
      });
      medicalSummary.diagnoses = diagnoses;
    }

    if (
      prescriptions !== undefined &&
      JSON.stringify(medicalSummary.prescriptions) !==
        JSON.stringify(prescriptions)
    ) {
      changes.push({
        field: "prescriptions",
        oldValue: `[${medicalSummary.prescriptions.length} prescriptions]`,
        newValue: `[${prescriptions.length} prescriptions]`,
      });
      medicalSummary.prescriptions = prescriptions;
    }

    if (vitals) {
      Object.keys(vitals).forEach((key) => {
        const vitalKey = key as keyof typeof vitals;
        if (vitals[vitalKey] !== medicalSummary.vitals?.[vitalKey]) {
          changes.push({
            field: `vitals.${vitalKey}`,
            oldValue: medicalSummary.vitals?.[vitalKey] || "null",
            newValue: vitals[vitalKey] || "null",
          });
        }
      });
      medicalSummary.vitals = { ...medicalSummary.vitals, ...vitals };
    }

    if (userRole === UserRole.DOCTOR) {
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctorProfile = await DoctorProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (doctorProfile) {
        medicalSummary.updatedBy = doctorProfile._id;
      }
    }

    await medicalSummary.save({ session });

    if (changes.length > 0) {
      await logActivity({
        entityType: EntityType.MEDICAL_SUMMARY,
        entityId: medicalSummary._id as mongoose.Types.ObjectId,
        action: "update",
        performedBy: userId,
        changes,
        context: auditContext,
      });
    }

    const updatedSummary = await MedicalSummary.findById(medicalSummaryId)
      .populate({
        path: "appointmentId",
        populate: [
          {
            path: "patientId",
            populate: { path: "userId", select: "name email" },
          },
          {
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
          },
        ],
      })
      .populate({
        path: "createdBy",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "updatedBy",
        populate: { path: "userId", select: "name email" },
      });

    await session.commitTransaction();
    return updatedSummary?.toSecureJSON(userRole);
  } catch (error) {
    await session.abortTransaction();
    handleMongoDBError(error, "update medical summary");
    throw error;
  } finally {
    session.endSession();
  }
};

export const getDoctorMedicalSummaries = async (
  doctorUserId: string,
  query: MedicalSummaryQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug(`Fetching medical summaries for doctor: ${doctorUserId}`);

  const { page = 1, limit = 10 } = query;
  const pipeline = getDoctorMedicalSummariesPipeline(doctorUserId, query);

  try {
    const result: AggregationResult[] = await MedicalSummary.aggregate(
      pipeline
    ).exec();

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

    const summaries = result[0]?.data ?? [];
    const total = result[0]?.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const summariesData = summaries.map((summary: any) => {
      const medicalSummary = MedicalSummary.hydrate(summary);
      return medicalSummary.toSecureJSON(UserRole.DOCTOR);
    });

    return {
      data: summariesData,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get doctor medical summaries");
  }
};

export const getPatientMedicalSummaries = async (
  patientUserId: string,
  query: MedicalSummaryQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug(`Fetching medical summaries for patient: ${patientUserId}`);

  const { page = 1, limit = 10 } = query;
  const pipeline = getPatientMedicalSummariesPipeline(patientUserId, query);

  try {
    const result: AggregationResult[] = await MedicalSummary.aggregate(
      pipeline
    ).exec();

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

    const summaries = result[0]?.data ?? [];
    const total = result[0]?.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const summariesData = summaries.map((summary: any) => {
      const medicalSummary = MedicalSummary.hydrate(summary);
      return medicalSummary.toSecureJSON(UserRole.PATIENT);
    });

    return {
      data: summariesData,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get patient medical summaries");
  }
};

export const getAllMedicalSummaries = async (
  query: MedicalSummaryQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug("Fetching all medical summaries");

  const { page = 1, limit = 10 } = query;
  const pipeline = getAllMedicalSummariesPipeline(query);

  try {
    const result: AggregationResult[] = await MedicalSummary.aggregate(
      pipeline
    ).exec();

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

    const summaries = result[0]?.data ?? [];
    const total = result[0]?.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const summariesData = summaries.map((summary: any) => {
      const medicalSummary = MedicalSummary.hydrate(summary);
      return medicalSummary.toSecureJSON(UserRole.ADMIN);
    });

    return {
      data: summariesData,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get all medical summaries");
  }
};

export const getMedicalSummaryById = async (
  medicalSummaryId: string,
  userId: string,
  userRole: string
): Promise<any> => {
  logger.debug(`Fetching medical summary: ${medicalSummaryId}`);
  try {
    const medicalSummary = await MedicalSummary.findById(medicalSummaryId)
      .populate({
        path: "appointmentId",
        populate: [
          {
            path: "patientId",
            populate: { path: "userId", select: "name email" },
          },
          {
            path: "doctorId",
            populate: { path: "userId", select: "name email" },
          },
        ],
      })
      .populate({
        path: "createdBy",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "updatedBy",
        populate: { path: "userId", select: "name email" },
      });

    if (!medicalSummary) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.MEDICAL_SUMMARY_NOT_FOUND
      );
    }

    if (userRole === UserRole.DOCTOR) {
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctorProfile = await DoctorProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (
        !doctorProfile ||
        medicalSummary.createdBy._id.toString() !== doctorProfile._id.toString()
      ) {
        throw new HttpStatusError(
          HttpStatus.FORBIDDEN,
          errorMessage.NO_PERMISSION
        );
      }
    }

    if (userRole === UserRole.PATIENT) {
      const PatientProfile = mongoose.model("PatientProfile");
      const patientProfile = await PatientProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (
        !patientProfile ||
        (medicalSummary as any).appointmentId.patientId._id.toString() !==
          patientProfile._id.toString()
      ) {
        throw new HttpStatusError(
          HttpStatus.FORBIDDEN,
          errorMessage.NO_PERMISSION
        );
      }
    }

    return medicalSummary.toSecureJSON(userRole);
  } catch (error) {
    handleMongoDBError(error, "get medical summary by id");
    throw error;
  }
};

export const deleteMedicalSummary = async (
  medicalSummaryId: string,
  userId: string,
  role: UserRole,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<void> => {
  logger.debug(`Deleting medical summary ${medicalSummaryId}`);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const medicalSummary = await MedicalSummary.findById(
      medicalSummaryId
    ).session(session);

    if (!medicalSummary) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.MEDICAL_SUMMARY_NOT_FOUND
      );
    }

    await logActivity({
      entityType: EntityType.MEDICAL_SUMMARY,
      entityId: medicalSummary._id as mongoose.Types.ObjectId,
      action: "delete",
      performedBy: userId,
      changes: [
        {
          field: "appointmentId",
          oldValue: medicalSummary.appointmentId.toString(),
        },
        {
          field: "diagnoses",
          oldValue: `[${medicalSummary.diagnoses.length} diagnoses]`,
        },
        {
          field: "prescriptions",
          oldValue: `[${medicalSummary.prescriptions.length} prescriptions]`,
        },
      ],
      context: auditContext,
    });

    await MedicalSummary.findByIdAndDelete(medicalSummaryId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "delete medical summary");
  } finally {
    session.endSession();
  }
};

export const getMedicalSummaryAuditLogs = async (medicalSummaryId: string) => {
  logger.debug(
    `Fetching Audit Log Data for Medical Summary: ${medicalSummaryId}`
  );
  try {
    const medicalSummary = await MedicalSummary.findById(medicalSummaryId);

    if (!medicalSummary) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.MEDICAL_SUMMARY_NOT_FOUND
      );
    }

    return await getEntityAuditLogs(
      EntityType.MEDICAL_SUMMARY,
      medicalSummaryId
    );
  } catch (error) {
    return handleMongoDBError(error, "get medical summary audit logs");
  }
};
