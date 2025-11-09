import mongoose, { PipelineStage, Types } from "mongoose";
import { MedicalSummaryQuery } from "../interfaces/medical-summary.interface";

export const getDoctorMedicalSummariesPipeline = (
  doctorUserId: string,
  query: MedicalSummaryQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    appointmentId,
  } = query;

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "doctorprofiles",
        let: { createdBy: "$createdBy" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$createdBy"] },
                  { $eq: ["$userId", new Types.ObjectId(doctorUserId)] },
                ],
              },
            },
          },
        ],
        as: "doctorProfile",
      },
    },
    {
      $match: {
        "doctorProfile.0": { $exists: true },
      },
    },
  ];

  if (appointmentId) {
    pipeline.push({
      $match: {
        appointmentId: new Types.ObjectId(appointmentId),
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "appointments",
        localField: "appointmentId",
        foreignField: "_id",
        as: "appointment",
      },
    },
    { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "patientprofiles",
        localField: "appointment.patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "patient.userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: { path: "$patientUser", preserveNullAndEmptyArrays: true } },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              notes: 1,
              diagnoses: 1,
              prescriptions: 1,
              vitals: 1,
              createdAt: 1,
              updatedAt: 1,
              appointmentId: 1,
              "appointment.scheduledAt": 1,
              "appointment.reason": 1,
              "patientUser.name": 1,
              "patientUser.email": 1,
              "patient.age": 1,
              "patient.gender": 1,
              "patient.bloodGroup": 1,
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );

  return pipeline;
};

export const getPatientMedicalSummariesPipeline = (
  patientUserId: string,
  query: MedicalSummaryQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    appointmentId,
  } = query;

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "appointments",
        let: { appointmentId: "$appointmentId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$appointmentId"] } } },
          {
            $lookup: {
              from: "patientprofiles",
              let: { patientId: "$patientId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$patientId"] },
                        { $eq: ["$userId", new Types.ObjectId(patientUserId)] },
                      ],
                    },
                  },
                },
              ],
              as: "patientProfile",
            },
          },
          {
            $match: {
              "patientProfile.0": { $exists: true },
            },
          },
        ],
        as: "appointment",
      },
    },
    {
      $match: {
        "appointment.0": { $exists: true },
      },
    },
    { $unwind: "$appointment" },
  ];

  if (appointmentId) {
    pipeline.push({
      $match: {
        appointmentId: new Types.ObjectId(appointmentId),
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "doctorprofiles",
        localField: "createdBy",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "doctor.userId",
        foreignField: "_id",
        as: "doctorUser",
      },
    },
    { $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true } },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              notes: 1,
              diagnoses: 1,
              prescriptions: 1,
              vitals: 1,
              createdAt: 1,
              updatedAt: 1,
              appointmentId: 1,
              "appointment.scheduledAt": 1,
              "appointment.reason": 1,
              "doctorUser.name": 1,
              "doctorUser.email": 1,
              "doctor.specialization": 1,
              "doctor.qualifications": 1,
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );

  return pipeline;
};

export const getAllMedicalSummariesPipeline = (
  query: MedicalSummaryQuery
): PipelineStage[] => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    appointmentId,
  } = query;

  const pipeline: PipelineStage[] = [];

  if (appointmentId) {
    pipeline.push({
      $match: {
        appointmentId: new Types.ObjectId(appointmentId),
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "appointments",
        localField: "appointmentId",
        foreignField: "_id",
        as: "appointment",
      },
    },
    { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "patientprofiles",
        localField: "appointment.patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "patient.userId",
        foreignField: "_id",
        as: "patientUser",
      },
    },
    { $unwind: { path: "$patientUser", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "doctorprofiles",
        localField: "createdBy",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "doctor.userId",
        foreignField: "_id",
        as: "doctorUser",
      },
    },
    { $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true } },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        data: [
          { $skip: Math.max(0, (page - 1) * limit) },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              notes: 1,
              diagnoses: 1,
              prescriptions: 1,
              vitals: 1,
              createdAt: 1,
              updatedAt: 1,
              appointmentId: 1,
              "appointment.scheduledAt": 1,
              "appointment.reason": 1,
              "patientUser.name": 1,
              "patientUser.email": 1,
              "patient.age": 1,
              "patient.gender": 1,
              "doctorUser.name": 1,
              "doctorUser.email": 1,
              "doctor.specialization": 1,
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );

  return pipeline;
};