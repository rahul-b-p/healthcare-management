import { NextFunction, Request, Response } from "express";
import * as appointmentService from "../services/appointment.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";
import { apiResponse } from "../utils/api-response";
import responseMessage from "../constants/responseMessage";
import {
  AppointmentQuery,
  AdminAppointmentQuery,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "../interfaces/appointment.interface";

export const createAppointment = async (
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

    const result = await appointmentService.createAppointment(
      user.userId,
      req.body as CreateAppointmentDto,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res
      .status(201)
      .json(apiResponse(responseMessage.CREATE_APPOINTMENT, result));
  } catch (error: any) {
    next(error);
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await appointmentService.updateAppointment(
      appointmentId,
      user.userId,
      user.role,
      req.body as UpdateAppointmentDto,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }
    );

    res.json(apiResponse(responseMessage.UPDATE_APPOINTMENT, result));
  } catch (error: any) {
    next(error);
  }
};

export const getDoctorAppointments = async (
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

    const { data, meta } = await appointmentService.getDoctorAppointments(
      user.userId,
      req.validatedQuery as AppointmentQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_APPOINTMENT, data), meta });
  } catch (error: any) {
    next(error);
  }
};

export const getPatientAppointments = async (
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

    const { data, meta } = await appointmentService.getPatientAppointments(
      user.userId,
      req.validatedQuery as AppointmentQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_APPOINTMENT, data), meta });
  } catch (error: any) {
    next(error);
  }
};

export const getAllAppointments = async (
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

    const { data, meta } = await appointmentService.getAllAppointments(
      req.validatedQuery as AdminAppointmentQuery
    );

    res.json({ ...apiResponse(responseMessage.LIST_APPOINTMENT, data), meta });
  } catch (error: any) {
    next(error);
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await appointmentService.getAppointmentById(
      appointmentId,
      user.userId,
      user.role
    );

    res.json(apiResponse(responseMessage.APPOINTMENT_DATA_FETCH, result));
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
    const { appointmentId } = req.params;
    const user = req.user;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    const result = await appointmentService.getAppointmentAuditLogs(
      appointmentId
    );
    res.json(apiResponse(responseMessage.APPOINTMENT_AUDIT, result));
  } catch (error: any) {
    next(error);
  }
};
