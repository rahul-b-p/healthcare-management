import Joi from 'joi';
import errorMessages from '../constants/errorMessage';
import { objectId } from './objectId.schema';



// Allowed specializations (from schema)
const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Orthopedic',
  'Gynecologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
  'Other',
];

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Time format: HH:MM (24h)
const timeFormat = Joi.string()
  .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  .message(errorMessages.AVAILABILITY_TIME_FORMAT);

// Availability sub-schema
const availabilitySchema = Joi.object({
  days: Joi.array()
    .min(1)
    .items(Joi.string().valid(...WEEK_DAYS))
    .required()
    .messages({
      'any.required': errorMessages.AVAILABILITY_DAYS_REQUIRED,
      'array.min': errorMessages.AVAILABILITY_DAYS_REQUIRED,
      'any.only': errorMessages.AVAILABILITY_DAY_INVALID,
    }),
  startTime: timeFormat
    .required()
    .messages({
      'any.required': errorMessages.AVAILABILITY_START_TIME_REQUIRED,
    }),
  endTime: timeFormat
    .required()
    .messages({
      'any.required': errorMessages.AVAILABILITY_END_TIME_REQUIRED,
    }),
}).custom((value, helpers) => {
  if (value.startTime >= value.endTime) {
    return helpers.message({ custom: errorMessages.AVAILABILITY_START_AFTER_END });
  }
  return value;
}, 'Start < End Time Validation');

export const createDoctorProfileSchema = Joi.object({
  userId: objectId.required().messages({
    'any.required': errorMessages.USER_ID_REQUIRED,
    'string.base': errorMessages.USER_ID_REQUIRED,
  }),

  specialization: Joi.string()
    .valid(...SPECIALIZATIONS)
    .required()
    .messages({
      'any.required': errorMessages.SPECIALIZATION_REQUIRED,
      'any.only': errorMessages.SPECIALIZATION_INVALID,
    }),

  qualifications: Joi.array()
    .min(1)
    .items(Joi.string().max(200).trim())
    .required()
    .messages({
      'any.required': errorMessages.QUALIFICATIONS_REQUIRED,
      'array.min': errorMessages.QUALIFICATIONS_REQUIRED,
      'string.max': errorMessages.QUALIFICATION_MAX_LENGTH,
    }),

  licenseNumber: Joi.string().max(50).trim().required().messages({
    'any.required': errorMessages.LICENSE_NUMBER_REQUIRED,
    'string.max': errorMessages.LICENSE_NUMBER_MAX_LENGTH,
  }),

  yearsOfExperience: Joi.number().min(0).required().messages({
    'any.required': errorMessages.YEARS_EXPERIENCE_REQUIRED,
    'number.min': errorMessages.YEARS_EXPERIENCE_MIN,
  }),

  clinicLocation: Joi.string().max(200).trim().optional().allow(''),

  consultationFee: Joi.number().min(0).optional().messages({
    'number.min': errorMessages.CONSULTATION_FEE_MIN,
  }),

  availability: availabilitySchema.optional(),

  bio: Joi.string().max(500).trim().optional().allow('').messages({
    'string.max': errorMessages.BIO_MAX_LENGTH,
  }),
});


export const updateDoctorProfileSchema = Joi.object({
  specialization: Joi.string()
    .valid(...SPECIALIZATIONS)
    .optional()
    .messages({
      'any.only': errorMessages.SPECIALIZATION_INVALID,
    }),

  qualifications: Joi.array()
    .min(1)
    .items(Joi.string().max(200).trim())
    .optional()
    .messages({
      'array.min': errorMessages.QUALIFICATIONS_REQUIRED,
      'string.max': errorMessages.QUALIFICATION_MAX_LENGTH,
    }),

  licenseNumber: Joi.string().max(50).trim().optional().messages({
    'string.max': errorMessages.LICENSE_NUMBER_MAX_LENGTH,
  }),

  yearsOfExperience: Joi.number().min(0).optional().messages({
    'number.min': errorMessages.YEARS_EXPERIENCE_MIN,
  }),

  clinicLocation: Joi.string().max(200).trim().optional().allow(''),

  consultationFee: Joi.number().min(0).optional().messages({
    'number.min': errorMessages.CONSULTATION_FEE_MIN,
  }),

  availability: availabilitySchema.optional(),

  bio: Joi.string().max(500).trim().optional().allow('').messages({
    'string.max': errorMessages.BIO_MAX_LENGTH,
  }),

  isActive: Joi.boolean().optional().messages({
    'boolean.base': errorMessages.IS_ACTIVE_BOOLEAN,
  }),
}).min(1).message(errorMessages.UPDATE_MIN_FIELDS);


export const doctorQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    'number.min': errorMessages.PAGE_MIN,
  }),

  limit: Joi.number().min(1).max(100).default(20).messages({
    'number.min': errorMessages.LIMIT_MIN,
    'number.max': errorMessages.LIMIT_MAX,
  }),

  userId: objectId.optional(),

  name: Joi.string().max(100).trim().optional().messages({
    'string.max': errorMessages.NAME_MAX_LENGTH,
  }),

  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt')
    .default('createdAt')
    .messages({
      'any.only': errorMessages.SORT_BY_INVALID,
    }),

  sortOrder: Joi.string()
    .valid('asc', 'DESC')
    .default('DESC')
    .messages({
      'any.only': errorMessages.SORT_ORDER_INVALID,
    }),

  isActive: Joi.boolean().optional(),

  minExperience: Joi.number().min(0).optional().messages({
    'number.min': errorMessages.MIN_EXPERIENCE_MIN,
  }),

  maxExperience: Joi.number().min(0).optional().messages({
    'number.min': errorMessages.MAX_EXPERIENCE_MIN,
  }),

  specialization: Joi.string()
    .valid(...SPECIALIZATIONS)
    .optional()
    .messages({
      'any.only': errorMessages.SPECIALIZATION_INVALID,
    }),
}).custom((value, helpers) => {
  if (
    value.minExperience !== undefined &&
    value.maxExperience !== undefined &&
    value.maxExperience < value.minExperience
  ) {
    return helpers.message({ custom: errorMessages.MAX_EXPERIENCE_LT_MIN });
  }
  return value;
}, 'min <= max experience');