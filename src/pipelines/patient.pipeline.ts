import mongoose from "mongoose";
import { PatientsPipelineOptions } from "../interfaces/patient.interface";

/**
 * Exports pipeline for aggregation
 * @param options 
 * @returns pipeline
 */
export const getAllPatientsPipeline = (
  options: PatientsPipelineOptions
): any[] => {
  const { page, limit, userId, name, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [];

  // Lookup user data
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  });

  pipeline.push({
    $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
  });

  // Build match conditions
  const $match: any = {};
  if (userId) $match.userId = new mongoose.Types.ObjectId(userId);
  if (name) $match["user.name"] = { $regex: name, $options: "i" };

  if (Object.keys($match).length) pipeline.push({ $match });

  // Facet for pagination
  pipeline.push({
    $facet: {
      data: [
        { $sort: { [sortBy]: sortOrder === "DESC" ? -1 : 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            userId: 1,
            age: 1,
            height: 1,
            weight: 1,
            bloodGroup: 1,
            address: 1,
            gender: 1,
            emergencyContact: 1,
            medicalHistory: 1,
            createdAt: 1,
            updatedAt: 1,
            user: { _id: 1, name: 1, email: 1 },
          },
        },
      ],
      meta: [{ $count: "total" }],
    },
  });

  return pipeline;
};
