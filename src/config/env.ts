import dotenv from "dotenv";
import Joi from "joi";
import { expirationSchema } from "../schemas/jwt.schema";
import { encryptionKeyValidator } from "../validations/encryption-key.validation";

dotenv.config();

// Schema for env validation
const envSchema = Joi.object({
  // Application
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid("development", "production", "test"),

  // Database
  MONGO_URI: Joi.string().uri().required(),

  // jwt
  ACCESS_SECRET: Joi.string().required(),
  ACCESS_EXPIRE_IN: expirationSchema.required(),
  REFRESH_SECRET: Joi.string().required(),
  REFRESH_EXPIRE_IN: expirationSchema.required(),

  // Hashing
  HASH_SALT: Joi.number().required(),

  // Encryption
  ENCRYPTION_KEY:Joi.string()
    .length(64) // Must be exactly 64 hex characters
    .custom(encryptionKeyValidator, "AES-256 encryption key validation")
    .required()
    .messages({
      "string.length": "ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)",
      "any.required": "ENCRYPTION_KEY is required. Generate one using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    }),
}).unknown(true);

// Validate env vars
const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated env vars
export default {
  app: {
    port: envVars.PORT,
    environment: envVars.NODE_ENV,
    log: envVars.NODE_ENV === "development" ? "debug" : "info",
  },
  db: {
    mongoUri: envVars.MONGO_URI,
  },
  jwt: {
    accessSecret: envVars.ACCESS_SECRET,
    accessExp: envVars.ACCESS_EXPIRE_IN,
    refershSecret: envVars.REFRESH_SECRET,
    refershExp: envVars.REFRESH_EXPIRE_IN,
  },
  hashSalt: envVars.HASH_SALT,
  encryptionKey:envVars.ENCRYPTION_KEY,
};
