import Joi from "joi";
import errorMessages from "../constants/errorMessage";
import { AppointmentStatus } from "../enums/appoinment.enum";
import { objectId } from "./objectId.schema";

// Date in future
const futureDate = Joi.date().greater("now").messages({
  "date.greater": errorMessages.SCHEDULED_AT_FUTURE,
});

const APPOINTMENT_STATUS_VALUES = Object.values(AppointmentStatus);

export const createAppointmentSchema = Joi.object({
  patientId: objectId.required().messages({
    "any.required": errorMessages.PATIENT_ID_REQUIRED,
  }),

  doctorId: objectId.required().messages({
    "any.required": errorMessages.DOCTOR_ID_REQUIRED,
  }),

  scheduledAt: futureDate.required().messages({
    "any.required": errorMessages.SCHEDULED_AT_REQUIRED,
  }),

  reason: Joi.string().min(5).max(500).trim().required().messages({
    "any.required": errorMessages.REASON_REQUIRED,
    "string.min": errorMessages.REASON_MIN_LENGTH,
    "string.max": errorMessages.REASON_MAX_LENGTH,
  }),

  notes: Joi.string().max(1000).trim().optional().allow("").messages({
    "string.max": errorMessages.NOTES_MAX_LENGTH,
  }),
});

export const updateAppointmentSchema = Joi.object({
  scheduledAt: futureDate.optional(),

  reason: Joi.string().min(5).max(500).trim().optional().messages({
    "string.min": errorMessages.REASON_MIN_LENGTH,
    "string.max": errorMessages.REASON_MAX_LENGTH,
  }),

  status: Joi.string()
    .valid(...APPOINTMENT_STATUS_VALUES)
    .optional()
    .messages({
      "any.only": errorMessages.STATUS_INVALID,
    }),

  notes: Joi.string().max(1000).trim().optional().allow("").messages({
    "string.max": errorMessages.NOTES_MAX_LENGTH,
  }),
})
  .min(1)
  .message(errorMessages.UPDATE_MIN_FIELDS);

export const appointmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": errorMessages.PAGE_MIN,
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.min": errorMessages.LIMIT_MIN,
    "number.max": errorMessages.LIMIT_MAX,
  }),

  sortBy: Joi.string()
    .valid("scheduledAt", "createdAt", "updatedAt")
    .default("scheduledAt")
    .messages({
      "any.only": errorMessages.SORT_BY_INVALID,
    }),

  sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
    "any.only": errorMessages.SORT_ORDER_INVALID,
  }),

  scheduledDate: Joi.date().optional(),

  status: Joi.string()
    .valid(...APPOINTMENT_STATUS_VALUES)
    .optional()
    .messages({
      "any.only": errorMessages.STATUS_INVALID,
    }),

  patientId: objectId.optional(),
  doctorId: objectId.optional(),
});

export const adminAppointmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": errorMessages.PAGE_MIN,
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.min": errorMessages.LIMIT_MIN,
    "number.max": errorMessages.LIMIT_MAX,
  }),

  sortBy: Joi.string()
    .valid("scheduledAt", "createdAt", "updatedAt")
    .default("scheduledAt")
    .messages({
      "any.only": errorMessages.SORT_BY_INVALID,
    }),

  sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
    "any.only": errorMessages.SORT_ORDER_INVALID,
  }),

  scheduledDate: Joi.date().optional(),

  status: Joi.string()
    .valid(...APPOINTMENT_STATUS_VALUES)
    .optional()
    .messages({
      "any.only": errorMessages.STATUS_INVALID,
    }),

  patientName: Joi.string().trim().max(100).optional().allow("").messages({
    "string.max": errorMessages.NAME_MAX_LENGTH,
  }),

  doctorName: Joi.string().trim().max(100).optional().allow("").messages({
    "string.max": errorMessages.NAME_MAX_LENGTH,
  }),
});
