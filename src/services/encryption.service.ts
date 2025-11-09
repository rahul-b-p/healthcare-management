import crypto from "crypto";
import { logger } from "../utils/logger";
import env from "../config/env";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Class which handles encryption service with crypto
 */
export class EncryptionService {
  private static key: Buffer = Buffer.isBuffer(env.encryptionKey)
    ? env.encryptionKey
    : Buffer.from(env.encryptionKey, "hex");

  static encrypt(text: string): string {
    logger.debug("Encryptiong Essensial Data");

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  static decrypt(encryptedData: string): string {
    logger.debug("Decrypting Essensial Data");

    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      this.key,
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
