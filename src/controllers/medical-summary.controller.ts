import { NextFunction, Request, Response } from "express";
import * as medicalSummaryService from "../services/medical-summary.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import {
  MedicalSummaryQuery,
  CreateMedicalSummaryDto,
  UpdateMedicalSummaryDto,
} from "../interfaces/medical-summary.interface";

export const createMedicalSummary = async (
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

    const result = await medicalSummaryService.createMedicalSummary(
      user.userId,
      user.role,
      req.body,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res
      .status(201)
      .json(apiResponse(responseMessage.CREATE_MEDICAL_SUMMARY, result));
  } catch (error: any) {
    next(error);
  }
};

export const updateMedicalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { medicalSummaryId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await medicalSummaryService.updateMedicalSummary(
      medicalSummaryId,
      user.userId,
      user.role,
      req.body as UpdateMedicalSummaryDto,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.json(apiResponse(responseMessage.UPDATE_MEDICAL_SUMMARY, result));
  } catch (error: any) {
    next(error);
  }
};

export const getDoctorMedicalSummaries = async (
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

    const { data, meta } =
      await medicalSummaryService.getDoctorMedicalSummaries(
        user.userId,
        req.validatedQuery as MedicalSummaryQuery
      );

    res.json({
      ...apiResponse(responseMessage.LIST_MEDICAL_SUMMARY, data),
      meta,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getPatientMedicalSummaries = async (
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

    const { data, meta } =
      await medicalSummaryService.getPatientMedicalSummaries(
        user.userId,
        req.validatedQuery as MedicalSummaryQuery
      );

    res.json({
      ...apiResponse(responseMessage.LIST_MEDICAL_SUMMARY, data),
      meta,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAllMedicalSummaries = async (
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

    const { data, meta } = await medicalSummaryService.getAllMedicalSummaries(
      req.validatedQuery as MedicalSummaryQuery
    );

    res.json({
      ...apiResponse(responseMessage.LIST_MEDICAL_SUMMARY, data),
      meta,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMedicalSummaryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { medicalSummaryId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await medicalSummaryService.getMedicalSummaryById(
      medicalSummaryId,
      user.userId,
      user.role
    );

    res.json(apiResponse(responseMessage.MEDICAL_SUMMARY_DATA_FETCH, result));
  } catch (error: any) {
    next(error);
  }
};

export const deleteMedicalSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { medicalSummaryId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await medicalSummaryService.deleteMedicalSummary(
      medicalSummaryId,
      user.userId,
      user.role,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.json(apiResponse(responseMessage.DELETE_MEDICAL_SUMMARY));
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
    const { medicalSummaryId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await medicalSummaryService.getMedicalSummaryAuditLogs(
      medicalSummaryId
    );
    res.json(apiResponse(responseMessage.MEDICAL_SUMMARY_AUDIT, result));
  } catch (error: any) {
    next(error);
  }
};
