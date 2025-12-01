import { NextFunction, Request, Response } from "express";
import * as doctorProfileService from "../services/doctor.service";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import { HttpStatusError } from "../errors/http.error";
import { HttpStatus } from "../enums/http.enum";
import errorMessage from "../constants/errorMessage";

export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await doctorProfileService.createDoctorProfile(req.body);

    res.status(201).json(apiResponse(responseMessage.CREATE_DOCTOR, result));
  } catch (error: any) {
    next(error);
  }
};

export const getProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profileId } = req.params;

    const result = await doctorProfileService.getDoctorProfileById(profileId);

    res.json(apiResponse(responseMessage.DOCTOR_DATA_FETCH, result));
  } catch (error: any) {
    next(error);
  }
};

export const getProfileByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const result = await doctorProfileService.getDoctorProfileByUserId(userId);

    res.json(apiResponse(responseMessage.DOCTOR_DATA_FETCH, result));
  } catch (error: any) {
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    console.log(user.userId)

    const result = await doctorProfileService.getDoctorProfileByUserId(user.userId);

    res.json(apiResponse(responseMessage.DOCTOR_DATA_FETCH, result));
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profileId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await doctorProfileService.updateDoctorProfile(
      profileId,
      req.body
    );

    res.json(apiResponse(responseMessage.UPDATE_DOCTOR, result));
  } catch (error: any) {
    next(error);
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profileId } = req.params;

    const result = await doctorProfileService.deleteDoctorProfile(profileId);

    res.json(apiResponse(responseMessage.DELETE_DOCTOR, result));
  } catch (error: any) {
    next(error);
  }
};

export const getAllDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, meta } = await doctorProfileService.getAllDoctors(
      req.validatedQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_PATIENT, data), meta });
  } catch (error: any) {
    next(error);
  }
};
