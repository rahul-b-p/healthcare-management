// constants/errorMessages.ts
export default {
  // Common
  REQ_PAYLOAD: "Request required a payload",
  FIELD_REQUIRED: "This field is required",

  // Auth
  TOKEN_VERIFICATION_FAILED: "Token verification failed",
  INVALID_TOKEN: "Invalid token provided",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  REFRESH_TOKEN_VERIFICATION_FAILED: "Refresh token verification failed",
  SECRET_KEY_ALPHANUMERIC:
    "Secret key must be a combination of alphabets and integers.",
  MUST_BE_NUMERIC_STRING: "Must be a numeric string (e.g., '123').",
  INVALID_EXPIRATION_STRING:
    "Must be a number followed immediately by a valid unit (e.g., '123Year').",
  UNAUTHORIZED: "Unauthorized Access",
  NO_PERMISSION: "Insufficient permissions to access this resource",

  // User
  USER_NOT_FOUND: "User not found",
  INVALID_ROLE: "Invalid role",
  PASSWORD_DOSENT_MATCH: "Confirm Password doesn't match with the password",
  EMIAL_OR_PHONE_NEED: "Either Email or Phone needed in the payload",
  INVALID_PASSWORD: "Invalid Password",
  REFERSH_TOKEN_REQ: "Refresh token is required",
  ACCOUNT_NOT_FOUND: "User account not found",

  // Validation: User creation
  NAME_REQUIRED: "Name is required",
  NAME_MIN_LENGTH: "Name must be at least 2 characters long",

  PHONE_REQUIRED: "Phone number is required",
  PHONE_INVALID: "Phone number must contain 10–15 digits",

  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Email must be a valid email address",

  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters long",

  ROLE_REQUIRED: "Role is required",
  ROLE_INVALID: "Invalid role selected",

  // Patient - Newly Added
  AGE_REQUIRED: "Age is required",
  AGE_INVALID: "Age must be a number between 0 and 150",
  AGE_MIN: "Age cannot be negative",
  AGE_MAX: "Age cannot exceed 150",

  HEIGHT_REQUIRED: "Height is required",
  HEIGHT_INVALID: "Height must be between 50 and 250 cm",
  HEIGHT_MIN: "Height must be at least 50 cm",
  HEIGHT_MAX: "Height cannot exceed 250 cm",

  WEIGHT_REQUIRED: "Weight is required",
  WEIGHT_INVALID: "Weight must be between 20 and 300 kg",
  WEIGHT_MIN: "Weight must be at least 20 kg",
  WEIGHT_MAX: "Weight cannot exceed 300 kg",

  BLOOD_GROUP_REQUIRED: "Blood group is required",
  BLOOD_GROUP_INVALID:
    "Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",

  ADDRESS_REQUIRED: "Address is required",
  ADDRESS_MIN_LENGTH: "Address must be at least 5 characters long",
  ADDRESS_MAX_LENGTH: "Address must not exceed 500 characters",

  GENDER_INVALID: "Invalid gender. Must be 'male', 'female', or 'other'",

  EMERGENCY_CONTACT_NAME_REQUIRED: "Emergency contact name is required",
  EMERGENCY_CONTACT_NAME_MAX:
    "Emergency contact name must not exceed 100 characters",
  EMERGENCY_CONTACT_RELATION_REQUIRED: "Emergency contact relation is required",
  EMERGENCY_CONTACT_RELATION_MAX:
    "Emergency contact relation must not exceed 50 characters",
  EMERGENCY_CONTACT_PHONE_REQUIRED: "Emergency contact phone is required",
  EMERGENCY_CONTACT_PHONE_INVALID:
    "Invalid emergency contact phone format. Use international format (e.g., +1234567890)",

  MEDICAL_HISTORY_MAX:
    "Each medical history entry must not exceed 1000 characters",
  MEDICAL_HISTORY_INVALID: "Medical history must be an array of strings",

  UPDATE_MIN_FIELDS: "At least one field must be provided for update",
  EMERGENCY_CONTACT_MIN_UPDATE:
    "Emergency contact must have at least one field to update",

  // Query
  PAGE_MIN: "Page must be at least 1",
  LIMIT_MIN: "Limit must be at least 1",
  LIMIT_MAX: "Limit cannot exceed 100",
  INVALID_OBJECTID: "Invalid ID format. Must be a valid MongoDB ObjectId",
  SORT_BY_INVALID: "sortBy must be either 'createdAt' or 'updatedAt'",
  SORT_ORDER_INVALID: "sortOrder must be either 'asc' or 'DESC'",
  NAME_MAX_LENGTH: "Name must not exceed 100 characters",

  // Patient Errors
  INVALID_PATIENT: "Invalid User to create a patient profile",
  PATIENT_ALREADY_EXISTS: "Patient profile already exists",
  PATIENT_NOT_FOUND: "Patient profile not found",

  // Doctor
  DOCTOR_NOT_FOUND: "Doctor Profile Not Found",

  // Doctor - Validation
  USER_ID_REQUIRED: "User ID is required",
  USER_ID_INVALID: "Invalid user ID format. Must be a valid MongoDB ObjectId",

  SPECIALIZATION_REQUIRED: "Specialization is required",
  SPECIALIZATION_INVALID:
    "Invalid specialization. Must be one of the allowed values",

  QUALIFICATIONS_REQUIRED: "At least one qualification is required",
  QUALIFICATION_MAX_LENGTH: "Each qualification must not exceed 200 characters",

  LICENSE_NUMBER_REQUIRED: "License number is required",
  LICENSE_NUMBER_MAX_LENGTH: "License number must not exceed 50 characters",

  YEARS_EXPERIENCE_REQUIRED: "Years of experience is required",
  YEARS_EXPERIENCE_MIN: "Years of experience cannot be negative",

  CLINIC_LOCATION_MAX: "Clinic location must not exceed 200 characters",

  CONSULTATION_FEE_MIN: "Consultation fee cannot be negative",

  AVAILABILITY_DAYS_REQUIRED: "Availability days are required",
  AVAILABILITY_DAY_INVALID: "Invalid day. Must be a valid weekday",
  AVAILABILITY_START_TIME_REQUIRED: "Start time is required in HH:MM format",
  AVAILABILITY_END_TIME_REQUIRED: "End time is required in HH:MM format",
  AVAILABILITY_TIME_FORMAT: "Time must be in HH:MM (24-hour) format",
  AVAILABILITY_START_AFTER_END: "Start time must be before end time",

  BIO_MAX_LENGTH: "Bio must not exceed 500 characters",

  IS_ACTIVE_BOOLEAN: "isActive must be a boolean",

  MIN_EXPERIENCE_MIN: "Minimum experience cannot be negative",
  MAX_EXPERIENCE_MIN: "Maximum experience cannot be negative",
  MAX_EXPERIENCE_LT_MIN: "Maximum experience must be >= minimum experience",

  // Appointment
  PATIENT_ID_REQUIRED: "Patient ID is required",
  PATIENT_ID_INVALID:
    "Invalid patient ID format. Must be a valid MongoDB ObjectId",

  DOCTOR_ID_REQUIRED: "Doctor ID is required",
  DOCTOR_ID_INVALID:
    "Invalid doctor ID format. Must be a valid MongoDB ObjectId",

  SCHEDULED_AT_REQUIRED: "Scheduled date and time is required",
  SCHEDULED_AT_FUTURE: "Scheduled time must be in the future",

  REASON_REQUIRED: "Reason for appointment is required",
  REASON_MIN_LENGTH: "Reason must be at least 5 characters",
  REASON_MAX_LENGTH: "Reason cannot exceed 500 characters",

  NOTES_MAX_LENGTH: "Notes cannot exceed 1000 characters",

  STATUS_INVALID:
    "Status must be one of: scheduled, completed, cancelled, rescheduled",
  APPOINTMENT_NOT_FOUND: "Appointment not found",
  APPOINTMENT_CONFLICT: "Appointment scheduling conflict",

  // Medical Summary
  MEDICAL_SUMMARY_NOT_FOUND: "Medical Summary not Found",
  MEDICAL_SUMMARY_APPOINTMENT_REQUIRED: "Appointment ID is required",
  MEDICAL_SUMMARY_APPOINTMENT_INVALID: "Invalid appointment ID format",
  MEDICAL_SUMMARY_NOTES_REQUIRED: "Clinical notes are required",
  MEDICAL_SUMMARY_NOTES_MIN: "Notes must be at least 10 characters long",
  MEDICAL_SUMMARY_DIAGNOSES_REQUIRED: "At least one diagnosis is required",
  MEDICAL_SUMMARY_DIAGNOSES_INVALID:
    "Each diagnosis must be a non-empty string",
  MEDICAL_SUMMARY_PRESCRIPTION_INVALID:
    "Each prescription must be a non-empty string",
  MEDICAL_SUMMARY_VITALS_INVALID: "Vitals must be a valid object",
  MEDICAL_SUMMARY_PAGE_REQUIRED: "Page number is required",
  MEDICAL_SUMMARY_PAGE_MIN: "Page must be at least 1",
  MEDICAL_SUMMARY_LIMIT_REQUIRED: "Limit is required",
  MEDICAL_SUMMARY_LIMIT_RANGE: "Limit must be between 1 and 100",
  MEDICAL_SUMMARY_SORTBY_INVALID: "sortBy must be 'createdAt' or 'updatedAt'",
  MEDICAL_SUMMARY_SORTORDER_INVALID: "sortOrder must be 'asc' or 'desc'",
  MEDICAL_SUMMARY_ALREADY_EXISTS:
    "Medical Summary already exists for the appinment",
  CANT_GET_VISIT_REPORT: "Can't get Visit Report for incompleted visit",
};
