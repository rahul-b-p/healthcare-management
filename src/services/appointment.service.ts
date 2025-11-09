import mongoose, { FlattenMaps } from "mongoose";
import { getEntityAuditLogs, logActivity } from "./audit-log.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { handleMongoDBError } from "../utils/mongo-error";
import { logger } from "../utils/logger";
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQuery,
  AdminAppointmentQuery,
} from "../interfaces/appointment.interface";
import { UserRole } from "../enums/role.enum";
import errorMessage from "../constants/errorMessage";
import { EntityType } from "../enums/entity.enum";
import Appointment, { IAppointment } from "../models/appointment.model";
import {
  getAllAppointmentsPipeline,
  getDoctorAppointmentsPipeline,
  getPatientAppointmentsPipeline,
} from "../pipelines/appointment.pipeline";
import { socketService } from "./socket.service";

export const createAppointment = async (
  userId: string,
  appointmentData: CreateAppointmentDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<FlattenMaps<IAppointment>> => {
  logger.debug("Creating Appointment");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = new Appointment(appointmentData);
    await appointment.save({ session });

    await logActivity({
      entityType: EntityType.APPOINTMENT,
      entityId: appointment._id as mongoose.Types.ObjectId,
      action: "create",
      performedBy: userId,
      changes: [
        { field: "patientId", newValue: appointment.patientId.toString() },
        { field: "doctorId", newValue: appointment.doctorId.toString() },
        { field: "scheduledAt", newValue: appointment.scheduledAt },
        { field: "reason", newValue: appointment.reason },
        { field: "status", newValue: appointment.status },
      ],
      context: auditContext,
    });

    await socketService.sendAppointmentCreatedNotification(appointment, userId);

    await session.commitTransaction();
    return appointment.toJSON();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "create appointment");
  } finally {
    session.endSession();
  }
};

export const updateAppointment = async (
  appointmentId: string,
  userId: string,
  userRole: string,
  updateData: UpdateAppointmentDto,
  auditContext: { ipAddress?: string; userAgent?: string }
): Promise<FlattenMaps<IAppointment>> => {
  logger.debug(`Updating appointment: ${appointmentId}`);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(
      session
    );

    if (!appointment) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.APPOINTMENT_NOT_FOUND
      );
    }

    const previousData = {
      scheduledAt: appointment.scheduledAt,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
    };

    const { scheduledAt, reason, status, notes } = updateData;
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const isStatusChanging = status && appointment.status !== status;

    if (
      scheduledAt &&
      appointment.scheduledAt.getTime() !== new Date(scheduledAt).getTime()
    ) {
      changes.push({
        field: "scheduledAt",
        oldValue: appointment.scheduledAt,
        newValue: scheduledAt,
      });
      appointment.scheduledAt = scheduledAt;
    }

    if (reason && appointment.reason !== reason) {
      changes.push({
        field: "reason",
        oldValue: appointment.reason,
        newValue: reason,
      });
      appointment.reason = reason;
    }

    if (status && appointment.status !== status) {
      changes.push({
        field: "status",
        oldValue: appointment.status,
        newValue: status,
      });
      appointment.status = status;
    }

    if (notes !== undefined && appointment.notes !== notes) {
      changes.push({
        field: "notes",
        oldValue: appointment.notes,
        newValue: notes,
      });
      appointment.notes = notes;
    }

    await appointment.save({ session });

    if (changes.length > 0) {
      await logActivity({
        entityType: EntityType.APPOINTMENT,
        entityId: appointment._id as mongoose.Types.ObjectId,
        action: "update",
        performedBy: userId,
        changes,
        context: auditContext,
      });
    }

    if (isStatusChanging) {
      await socketService.sendAppointmentStatusNotification(
        appointment,
        previousData.status,
        status!,
        userId
      );
    } else {
      await socketService.sendAppointmentUpdatedNotification(
        appointment,
        previousData,
        userId
      );
    }

    await session.commitTransaction();
    return appointment.toJSON();
  } catch (error) {
    await session.abortTransaction();
    handleMongoDBError(error, "update appointment");
    throw error;
  } finally {
    session.endSession();
  }
};

export const getDoctorAppointments = async (
  doctorId: string,
  query: AppointmentQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug(`Fetching appointments for doctor: ${doctorId}`);

  const { page = 1, limit = 10 } = query;
  const pipeline = getDoctorAppointmentsPipeline(doctorId, query);

  try {
    const result: AggregationResult[] = await Appointment.aggregate(
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

    const aggregationResult = result[0];
    const appointments = aggregationResult.data ?? [];
    const total = aggregationResult.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: appointments,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get doctor appointments");
  }
};

export const getPatientAppointments = async (
  patientId: string,
  query: AppointmentQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug(`Fetching appointments for patient: ${patientId}`);

  const { page = 1, limit = 10 } = query;
  const pipeline = getPatientAppointmentsPipeline(patientId, query);

  try {
    const result: AggregationResult[] = await Appointment.aggregate(
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

    const aggregationResult = result[0];
    const appointments = aggregationResult.data ?? [];
    const total = aggregationResult.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: appointments,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get patient appointments");
  }
};

export const getAllAppointments = async (
  query: AdminAppointmentQuery
): Promise<PaginatedResponse<any>> => {
  logger.debug("Fetching all appointments");

  const { page = 1, limit = 10 } = query;
  const pipeline = getAllAppointmentsPipeline(query);

  try {
    const result: AggregationResult[] = await Appointment.aggregate(
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

    const aggregationResult = result[0];
    const appointments = aggregationResult.data ?? [];
    const total = aggregationResult.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: appointments,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get all appointments");
  }
};

export const getAppointmentById = async (
  appointmentId: string,
  userId: string,
  userRole: string
): Promise<IAppointment> => {
  logger.debug(`Fetching appointment: ${appointmentId}`);
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "userId")
      .populate("doctorId", "userId")
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    if (!appointment) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.APPOINTMENT_NOT_FOUND
      );
    }

    if (
      userRole === UserRole.DOCTOR &&
      appointment.doctorId._id.toString() !== userId
    ) {
      throw new HttpStatusError(
        HttpStatus.FORBIDDEN,
        errorMessage.NO_PERMISSION
      );
    }

    if (
      userRole === UserRole.PATIENT &&
      appointment.patientId._id.toString() !== userId
    ) {
      throw new HttpStatusError(
        HttpStatus.FORBIDDEN,
        errorMessage.NO_PERMISSION
      );
    }

    return appointment;
  } catch (error) {
    handleMongoDBError(error, "get appointment by id");
    throw error;
  }
};

export const getAppointmentAuditLogs = async (appointmentId: string) => {
  logger.debug(`Fetching Audit Log Data for Appointment: ${appointmentId}`);
  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.APPOINTMENT_NOT_FOUND
      );
    }

    return await getEntityAuditLogs(EntityType.APPOINTMENT, appointmentId);
  } catch (error) {
    return handleMongoDBError(error, "get appointment audit logs");
  }
};
