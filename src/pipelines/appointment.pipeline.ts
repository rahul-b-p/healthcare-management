import mongoose, { PipelineStage, Types } from "mongoose";
import {
  AppointmentQuery,
  AdminAppointmentQuery,
} from "../interfaces/appointment.interface";

const COLLECTIONS = {
  PATIENT_PROFILE: "patientProfiles",
  DOCTOR_PROFILE: "doctorprofiles",
  USERS: "users",
} as const;

const ALLOWED_SORT_FIELDS = [
  "scheduledAt",
  "createdAt",
  "updatedAt",
  "status",
  "reason",
] as const;

const getSortStage = (
  sortBy: string,
  sortOrder: "asc" | "desc"
): Record<string, 1 | -1> => {
  const field = ALLOWED_SORT_FIELDS.includes(sortBy as any)
    ? sortBy
    : "scheduledAt";
  return { [field]: sortOrder === "asc" ? 1 : -1 };
};

export const getDoctorAppointmentsPipeline = (
  doctorId: string,
  query: AppointmentQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "scheduledAt",
    sortOrder = "desc",
    scheduledDate,
    status,
  } = query;

  const matchStage: any = {
    doctorId: new Types.ObjectId(doctorId),
  };

  if (scheduledDate) {
    const start = new Date(scheduledDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(scheduledDate);
    end.setHours(23, 59, 59, 999);
    matchStage.scheduledAt = { $gte: start, $lte: end };
  }

  if (status) matchStage.status = status;

  return [
    { $match: matchStage },
    {
      $lookup: {
        from: COLLECTIONS.PATIENT_PROFILE,
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "patient.userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: { path: "$patientUser", preserveNullAndEmptyArrays: true } },
    { $sort: getSortStage(sortBy, sortOrder) },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              id: { $toString: "$_id" },
              scheduledAt: 1,
              reason: 1,
              status: 1,
              notes: 1,
              createdAt: 1,
              updatedAt: 1,
              patientName: "$patientUser.name",
              patientEmail: "$patientUser.email",
              patientAge: "$patient.age",
              patientGender: "$patient.gender",
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    },
  ];
};

export const getPatientAppointmentsPipeline = (
  patientId: string,
  query: AppointmentQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "scheduledAt",
    sortOrder = "desc",
    scheduledDate,
    status,
  } = query;

  const matchStage: any = {
    patientId: new Types.ObjectId(patientId),
  };

  if (scheduledDate) {
    const start = new Date(scheduledDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(scheduledDate);
    end.setHours(23, 59, 59, 999);
    matchStage.scheduledAt = { $gte: start, $lte: end };
  }

  if (status) matchStage.status = status;

  return [
    { $match: matchStage },
    {
      $lookup: {
        from: COLLECTIONS.DOCTOR_PROFILE,
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "doctor.userId",
        foreignField: "_id",
        as: "doctorUser",
      },
    },
    { $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true } },
    { $sort: getSortStage(sortBy, sortOrder) },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              id: { $toString: "$_id" },
              scheduledAt: 1,
              reason: 1,
              status: 1,
              notes: 1,
              createdAt: 1,
              updatedAt: 1,
              doctorName: "$doctorUser.name",
              doctorEmail: "$doctorUser.email",
              doctorSpecialization: "$doctor.specialization",
              doctorQualifications: "$doctor.qualifications",
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    },
  ];
};

export const getAllAppointmentsPipeline = (
  query: AdminAppointmentQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "scheduledAt",
    sortOrder = "desc",
    scheduledDate,
    status,
    patientName,
    doctorName,
  } = query;

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: COLLECTIONS.PATIENT_PROFILE,
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "patient.userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: { path: "$patientUser", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.DOCTOR_PROFILE,
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "doctor.userId",
        foreignField: "_id",
        as: "doctorUser",
      },
    },
    { $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true } },
  ];

  const matchStage: any = {};

  if (scheduledDate) {
    const start = new Date(scheduledDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(scheduledDate);
    end.setHours(23, 59, 59, 999);
    matchStage.scheduledAt = { $gte: start, $lte: end };
  }

  if (status) matchStage.status = status;
  if (patientName)
    matchStage["patientUser.name"] = { $regex: patientName, $options: "i" };
  if (doctorName)
    matchStage["doctorUser.name"] = { $regex: doctorName, $options: "i" };

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push(
    { $sort: getSortStage(sortBy, sortOrder) },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              id: { $toString: "$_id" },
              scheduledAt: 1,
              reason: 1,
              status: 1,
              notes: 1,
              createdAt: 1,
              updatedAt: 1,
              patientName: "$patientUser.name",
              patientEmail: "$patientUser.email",
              patientAge: "$patient.age",
              patientGender: "$patient.gender",
              doctorName: "$doctorUser.name",
              doctorEmail: "$doctorUser.email",
              doctorSpecialization: "$doctor.specialization",
              doctorQualifications: "$doctor.qualifications",
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );

  return pipeline;
};