import mongoose, { FlattenMaps } from "mongoose";
import DoctorProfile, { IDoctorProfile } from "../models/doctor.model";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import { handleMongoDBError } from "../utils/mongo-error";
import { logger } from "../utils/logger";
import {
  CreateDoctorProfileDto,
  DoctorQuery,
  UpdateDoctorProfileDto,
} from "../interfaces/doctor.interface";
import errorMessage from "../constants/errorMessage";
import { getAllDoctorsPipeline } from "../pipelines/doctor.pipeline";

export const createDoctorProfile = async (
  profileData: CreateDoctorProfileDto
): Promise<FlattenMaps<IDoctorProfile>> => {
  const { userId } = profileData;
  logger.debug(`Creating doctor profile for user: ${userId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctorProfile = new DoctorProfile(profileData);
    await doctorProfile.save({ session });
    await session.commitTransaction();

    return doctorProfile.toJSON();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "create doctor profile");
  } finally {
    session.endSession();
  }
};

export const getDoctorProfileById = async (
  profileId: string
): Promise<FlattenMaps<IDoctorProfile>> => {
  logger.debug(`Getting doctor profile by ID: ${profileId}`);

  try {
    const doctorProfile = await DoctorProfile.findById(profileId).populate(
      "userId",
      "name email phone"
    );

    if (!doctorProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    return doctorProfile.toJSON();
  } catch (error) {
    return handleMongoDBError(error, "get doctor profile");
  }
};

export const getDoctorProfileByUserId = async (
  userId: string
): Promise<FlattenMaps<IDoctorProfile>> => {
  logger.debug(`Getting doctor profile by user ID: ${userId}`);

  try {
    const doctorProfile = await DoctorProfile.findOne({
      userId,
    }).populate("userId", "name email phone");

    if (!doctorProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    return doctorProfile.toJSON();
  } catch (error) {
    return handleMongoDBError(error, "get doctor profile by user ID");
  }
};

export const updateDoctorProfile = async (
  profileId: string,
  updateData: UpdateDoctorProfileDto
): Promise<FlattenMaps<IDoctorProfile>> => {
  logger.debug(`Updating doctor profile: ${profileId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctorProfile = await DoctorProfile.findById(profileId).session(
      session
    );

    if (!doctorProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    Object.assign(doctorProfile, updateData);
    await doctorProfile.save({ session });
    await session.commitTransaction();

    return doctorProfile.toJSON();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "update doctor profile");
  } finally {
    session.endSession();
  }
};

export const deleteDoctorProfile = async (profileId: string): Promise<void> => {
  logger.debug(`Deleting doctor profile: ${profileId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctorProfile = await DoctorProfile.findById(profileId).session(
      session
    );

    if (!doctorProfile) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    await DoctorProfile.findByIdAndDelete(profileId).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return handleMongoDBError(error, "delete doctor profile");
  } finally {
    session.endSession();
  }
};

export const getAllDoctors = async (
  query: DoctorQuery
): Promise<PaginatedResponse<any>> => {
  const { page = 1, limit = 20 } = query;
  const pipeline = getAllDoctorsPipeline(query);

  try {
    const result: AggregationResult[] = await DoctorProfile.aggregate(
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

    const data = result[0]?.data ?? [];
    const total = result[0]?.meta[0]?.total ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  } catch (error) {
    return handleMongoDBError(error, "get all doctors");
  }
};

export const incrementAppointmentCount = async (
  profileId: string
): Promise<{ success: boolean; newCount?: number }> => {
  logger.debug(
    `Incrementing appointment count for doctor profile: ${profileId}`
  );

  try {
    const result = await DoctorProfile.findByIdAndUpdate(
      profileId,
      { $inc: { totalAppointments: 1 } },
      { new: true }
    );

    if (!result) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.DOCTOR_NOT_FOUND
      );
    }

    return {
      success: true,
      newCount: result.totalAppointments,
    };
  } catch (error) {
    return handleMongoDBError(error, "increment appointment count");
  }
};
