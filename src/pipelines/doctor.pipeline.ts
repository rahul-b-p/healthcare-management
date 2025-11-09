import { PipelineStage, Types } from "mongoose";
import { DoctorQuery } from "../interfaces/doctor.interface";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Returns a **complete aggregation pipeline** for the DoctorProfile model.
 *
 * @param query - The DoctorQuery object (same shape you posted)
 * @returns PipelineStage[] ready to be passed to `.aggregate()`
 */
export const getAllDoctorsPipeline = (query: DoctorQuery): PipelineStage[] => {
  const {
    userId,
    name,
    sortBy,
    sortOrder,
    isActive,
    minExperience,
    maxExperience,
    specialization,
    page,
    limit,
  } = query;

  const earlyMatch: any = {};

  if (userId) earlyMatch.userId = new Types.ObjectId(userId);
  if (typeof isActive === "boolean") earlyMatch.isActive = isActive;
  if (specialization) earlyMatch.specialization = specialization;

  if (minExperience !== undefined || maxExperience !== undefined) {
    earlyMatch.yearsOfExperience = {};
    if (minExperience !== undefined)
      earlyMatch.yearsOfExperience.$gte = minExperience;
    if (maxExperience !== undefined)
      earlyMatch.yearsOfExperience.$lte = maxExperience;
  }

  const pipeline: PipelineStage[] = [];

  if (Object.keys(earlyMatch).length) {
    pipeline.push({ $match: earlyMatch });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "_user",
      pipeline: [{ $project: { name: 1 } }],
    },
  });

  pipeline.push({
    $unwind: { path: "$_user", preserveNullAndEmptyArrays: false },
  });

  pipeline.push({
    $addFields: { userName: "$_user.name" },
  });

  if (name) {
    pipeline.push({
      $match: {
        userName: { $regex: escapeRegex(name), $options: "i" },
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            _user: 0,
            __v: 0,
          },
        },
      ],
      meta: [{ $count: "total" }],
    },
  });

  return pipeline;
};
