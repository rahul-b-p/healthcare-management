import crypto from "crypto";
import Joi from "joi";

/**
 * Encryption key custom validation
 * @param value
 * @param helpers
 */
export const encryptionKeyValidator = (
  value: string,
  helpers: Joi.CustomHelpers
) => {
  // Check if the key is a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(value)) {
    return helpers.error("string.hex", {
      message: "ENCRYPTION_KEY must be a valid hexadecimal string",
    });
  }

  // Convert to buffer and check length
  const keyBuffer = Buffer.from(value, "hex");

  if (keyBuffer.length !== 32) {
    return helpers.error("string.length", {
      message: `ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). Current: ${value.length} hex chars = ${keyBuffer.length} bytes`,
    });
  }

  // Test encryption/decryption
  try {
    const testString = "Test encryption";
    const algorithm = "aes-256-gcm";
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    let encrypted = cipher.update(testString, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const encryptedData = `${iv.toString("hex")}:${authTag.toString(
      "hex"
    )}:${encrypted}`;

    // Decrypt to verify
    const parts = encryptedData.split(":");
    const decipher = crypto.createDecipheriv(
      algorithm,
      keyBuffer,
      Buffer.from(parts[0], "hex")
    );
    decipher.setAuthTag(Buffer.from(parts[1], "hex"));

    let decrypted = decipher.update(parts[2], "hex", "utf8");
    decrypted += decipher.final("utf8");

    if (decrypted !== testString) {
      return helpers.error("any.invalid", {
        message: "ENCRYPTION_KEY failed encryption/decryption test",
      });
    }

    return value;
  } catch (error: any) {
    return helpers.error("any.invalid", {
      message: `ENCRYPTION_KEY is invalid: ${error.message}`,
    });
  }
};
