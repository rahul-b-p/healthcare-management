// validation/medicalSummary.schema.ts
import Joi from "joi";
import errorMessage from "../constants/errorMessage";

export const createMedicalSummarySchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required().messages({
    "any.required": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_REQUIRED,
    "string.hex": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_INVALID,
    "string.length": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_INVALID,
    "string.empty": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_REQUIRED,
  }),

  notes: Joi.string().min(10).required().messages({
    "any.required": errorMessage.MEDICAL_SUMMARY_NOTES_REQUIRED,
    "string.min": errorMessage.MEDICAL_SUMMARY_NOTES_MIN,
    "string.empty": errorMessage.MEDICAL_SUMMARY_NOTES_REQUIRED,
  }),

  diagnoses: Joi.array()
    .items(
      Joi.string().min(1).messages({
        "string.min": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_INVALID,
        "string.empty": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_INVALID,
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_REQUIRED,
      "array.min": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_REQUIRED,
    }),

  prescriptions: Joi.array()
    .items(
      Joi.string().min(1).messages({
        "string.min": errorMessage.MEDICAL_SUMMARY_PRESCRIPTION_INVALID,
        "string.empty": errorMessage.MEDICAL_SUMMARY_PRESCRIPTION_INVALID,
      })
    )
    .optional(),

  vitals: Joi.object({
    bp: Joi.string().optional(),
    hr: Joi.string().optional(),
    temp: Joi.string().optional(),
    spo2: Joi.string().optional(),
    weight: Joi.string().optional(),
    height: Joi.string().optional(),
  })
    .optional()
    .messages({
      "object.base": errorMessage.MEDICAL_SUMMARY_VITALS_INVALID,
    }),
});

export const updateMedicalSummarySchema = Joi.object({
  notes: Joi.string().min(10).optional().messages({
    "string.min": errorMessage.MEDICAL_SUMMARY_NOTES_MIN,
  }),

  diagnoses: Joi.array()
    .items(
      Joi.string().min(1).messages({
        "string.min": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_INVALID,
        "string.empty": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_INVALID,
      })
    )
    .min(1)
    .optional()
    .messages({
      "array.min": errorMessage.MEDICAL_SUMMARY_DIAGNOSES_REQUIRED,
    }),

  prescriptions: Joi.array()
    .items(
      Joi.string().min(1).messages({
        "string.min": errorMessage.MEDICAL_SUMMARY_PRESCRIPTION_INVALID,
        "string.empty": errorMessage.MEDICAL_SUMMARY_PRESCRIPTION_INVALID,
      })
    )
    .optional(),

  vitals: Joi.object({
    bp: Joi.string().optional(),
    hr: Joi.string().optional(),
    temp: Joi.string().optional(),
    spo2: Joi.string().optional(),
    weight: Joi.string().optional(),
    height: Joi.string().optional(),
  })
    .optional()
    .messages({
      "object.base": errorMessage.MEDICAL_SUMMARY_VITALS_INVALID,
    }),
}).min(1);

export const medicalSummaryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).required().messages({
    "any.required": errorMessage.MEDICAL_SUMMARY_PAGE_REQUIRED,
    "number.min": errorMessage.MEDICAL_SUMMARY_PAGE_MIN,
    "number.base": errorMessage.MEDICAL_SUMMARY_PAGE_REQUIRED,
  }),

  limit: Joi.number().integer().min(1).max(100).required().messages({
    "any.required": errorMessage.MEDICAL_SUMMARY_LIMIT_REQUIRED,
    "number.min": errorMessage.MEDICAL_SUMMARY_LIMIT_RANGE,
    "number.max": errorMessage.MEDICAL_SUMMARY_LIMIT_RANGE,
  }),

  sortBy: Joi.string().valid("createdAt", "updatedAt").optional().messages({
    "any.only": errorMessage.MEDICAL_SUMMARY_SORTBY_INVALID,
  }),

  sortOrder: Joi.string().valid("asc", "desc").optional().messages({
    "any.only": errorMessage.MEDICAL_SUMMARY_SORTORDER_INVALID,
  }),

  appointmentId: Joi.string().hex().length(24).optional().messages({
    "string.hex": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_INVALID,
    "string.length": errorMessage.MEDICAL_SUMMARY_APPOINTMENT_INVALID,
  }),
});
