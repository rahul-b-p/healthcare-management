import Joi from "joi";
import errorMessages from "../constants/errorMessage";
import {
  CreatePatientProfileDto,
  PatientQuery,
  UpdatePatientDto,
} from "../interfaces/patient.interface";
import { objectId } from "./objectId.schema";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["male", "female", "other"];

// Shared: Emergency Contact
const emergencyContactSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "any.required": errorMessages.EMERGENCY_CONTACT_NAME_REQUIRED,
    "string.empty": errorMessages.EMERGENCY_CONTACT_NAME_REQUIRED,
    "string.max": errorMessages.EMERGENCY_CONTACT_NAME_MAX,
  }),
  relation: Joi.string().trim().max(50).required().messages({
    "any.required": errorMessages.EMERGENCY_CONTACT_RELATION_REQUIRED,
    "string.empty": errorMessages.EMERGENCY_CONTACT_RELATION_REQUIRED,
    "string.max": errorMessages.EMERGENCY_CONTACT_RELATION_MAX,
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "any.required": errorMessages.EMERGENCY_CONTACT_PHONE_REQUIRED,
      "string.empty": errorMessages.EMERGENCY_CONTACT_PHONE_REQUIRED,
      "string.pattern.base": errorMessages.EMERGENCY_CONTACT_PHONE_INVALID,
    }),
});

const medicalHistoryItem = Joi.string().trim().max(1000).messages({
  "string.max": errorMessages.MEDICAL_HISTORY_MAX,
});

export const createPatientProfileSchema = Joi.object<CreatePatientProfileDto>({
  userId: objectId.optional(),
  age: Joi.number().integer().min(0).max(150).required().messages({
    "any.required": errorMessages.AGE_REQUIRED,
    "number.base": errorMessages.AGE_INVALID,
    "number.integer": errorMessages.AGE_INVALID,
    "number.min": errorMessages.AGE_MIN,
    "number.max": errorMessages.AGE_MAX,
  }),

  height: Joi.number().min(50).max(250).required().messages({
    "any.required": errorMessages.HEIGHT_REQUIRED,
    "number.base": errorMessages.HEIGHT_INVALID,
    "number.min": errorMessages.HEIGHT_MIN,
    "number.max": errorMessages.HEIGHT_MAX,
  }),

  weight: Joi.number().min(20).max(300).required().messages({
    "any.required": errorMessages.WEIGHT_REQUIRED,
    "number.base": errorMessages.WEIGHT_INVALID,
    "number.min": errorMessages.WEIGHT_MIN,
    "number.max": errorMessages.WEIGHT_MAX,
  }),

  bloodGroup: Joi.string()
    .valid(...BLOOD_GROUPS)
    .uppercase()
    .required()
    .messages({
      "any.required": errorMessages.BLOOD_GROUP_REQUIRED,
      "any.only": errorMessages.BLOOD_GROUP_INVALID,
    }),

  address: Joi.string().trim().min(5).max(500).required().messages({
    "any.required": errorMessages.ADDRESS_REQUIRED,
    "string.empty": errorMessages.ADDRESS_REQUIRED,
    "string.min": errorMessages.ADDRESS_MIN_LENGTH,
    "string.max": errorMessages.ADDRESS_MAX_LENGTH,
  }),

  gender: Joi.string()
    .valid(...GENDERS)
    .optional()
    .messages({
      "any.only": errorMessages.GENDER_INVALID,
    }),

  emergencyContact: emergencyContactSchema.optional(),

  medicalHistory: Joi.array().items(medicalHistoryItem).optional().messages({
    "array.base": errorMessages.MEDICAL_HISTORY_INVALID,
  }),
});

export const updatePatientSchema = Joi.object<UpdatePatientDto>({
  age: Joi.number().integer().min(0).max(150).optional().messages({
    "number.min": errorMessages.AGE_MIN,
    "number.max": errorMessages.AGE_MAX,
  }),

  height: Joi.number().min(50).max(250).optional().messages({
    "number.min": errorMessages.HEIGHT_MIN,
    "number.max": errorMessages.HEIGHT_MAX,
  }),

  weight: Joi.number().min(20).max(300).optional().messages({
    "number.min": errorMessages.WEIGHT_MIN,
    "number.max": errorMessages.WEIGHT_MAX,
  }),

  bloodGroup: Joi.string()
    .valid(...BLOOD_GROUPS)
    .uppercase()
    .optional()
    .messages({
      "any.only": errorMessages.BLOOD_GROUP_INVALID,
    }),

  address: Joi.string().trim().min(5).max(500).optional().messages({
    "string.min": errorMessages.ADDRESS_MIN_LENGTH,
    "string.max": errorMessages.ADDRESS_MAX_LENGTH,
  }),

  gender: Joi.string()
    .valid(...GENDERS)
    .optional()
    .messages({
      "any.only": errorMessages.GENDER_INVALID,
    }),

  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional().messages({
      "string.max": errorMessages.EMERGENCY_CONTACT_NAME_MAX,
    }),
    relation: Joi.string().trim().max(50).optional().messages({
      "string.max": errorMessages.EMERGENCY_CONTACT_RELATION_MAX,
    }),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .messages({
        "string.pattern.base": errorMessages.EMERGENCY_CONTACT_PHONE_INVALID,
      }),
  })
    .optional()
    .min(1)
    .messages({
      "object.min": errorMessages.EMERGENCY_CONTACT_MIN_UPDATE,
    }),

  medicalHistory: Joi.array().items(medicalHistoryItem).optional().messages({
    "array.base": errorMessages.MEDICAL_HISTORY_INVALID,
  }),
})
  .min(1)
  .messages({
    "object.min": errorMessages.UPDATE_MIN_FIELDS,
  });

export const patientQuerySchema = Joi.object<PatientQuery>({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": errorMessages.PAGE_MIN,
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.min": errorMessages.LIMIT_MIN,
    "number.max": errorMessages.LIMIT_MAX,
  }),

  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": errorMessages.INVALID_OBJECTID,
    }),

  name: Joi.string().trim().max(100).optional().messages({
    "string.max": errorMessages.NAME_MAX_LENGTH,
  }),

  sortBy: Joi.string()
    .valid("createdAt", "updatedAt")
    .default("createdAt")
    .messages({
      "any.only": errorMessages.SORT_BY_INVALID,
    }),

  sortOrder: Joi.string().valid("asc", "DESC").default("DESC").messages({
    "any.only": errorMessages.SORT_ORDER_INVALID,
  }),
});
