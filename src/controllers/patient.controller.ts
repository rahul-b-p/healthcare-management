import { NextFunction, Request, Response } from "express";
import * as patientProfileService from "../services/patient.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import { PatientQuery } from "../interfaces/patient.interface";

export const createProfile = async (
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

    const result = await patientProfileService.createPatientProfile(
      user.userId,
      user.role,
      req.body,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.status(201).json(apiResponse(responseMessage.CREATE_PATIENT, result));
  } catch (error: any) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await patientProfileService.getPatientProfile(
      patientId,
      user.userId
    );

    res.json(apiResponse(responseMessage.PATIENT_DATA_FETCH, result));
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

    const result = await patientProfileService.getPatientProfileByUser(
      user.userId,
      user.role
    );

    res.json(apiResponse(responseMessage.PATIENT_DATA_FETCH, result));
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
    const { patientId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await patientProfileService.updatePatientProfile(
      patientId,
      user.userId,
      user.role,
      req.body,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.json(apiResponse(responseMessage.UPDATE_PATIENT, result));
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
    const { patientId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await patientProfileService.deletePatientProfile(
      patientId,
      user.userId,
      user.role,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.json(apiResponse(responseMessage.DELETE_PATIENT));
  } catch (error: any) {
    next(error);
  }
};

export const getAllPatients = async (
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

    const { data, meta } = await patientProfileService.getAllPatients(
      user.role,
      req.validatedQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_PATIENT, data), meta });
  } catch (error: any) {
    next(error);
  }
};

export const getAssignedPatients = async (
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

    const result = await patientProfileService.getAssignedPatients(
      user.userId,
      user.role
    );

    res.json(apiResponse(responseMessage.LIST_PATIENT, result));
  } catch (error: any) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await patientProfileService.getPatientAuditLogs(patientId);
    res.json(apiResponse(responseMessage.PATIENT_AUDIT, result));
  } catch (error: any) {
    next(error);
  }
};
