import mongoose, { Schema, Document, Types } from "mongoose";
import { EncryptionService } from "../services/encryption.service";

export interface IPatientProfile extends Document {
  userId: Types.ObjectId;
  age: number;
  height: number;
  weight: number;
  bloodGroup: string;
  address: string;
  gender?: "male" | "female" | "other";
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
  
  // Virtual methods for encrypted fields
  getDecryptedAddress(): string;
  getDecryptedEmergencyContact(): any;
  getDecryptedMedicalHistory(): string[];
  toSecureJSON(userRole: string): any;
}

const patientSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: [0, "Age cannot be negative"],
      max: [150, "Age seems unrealistic"],
    },
    address: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
      min: [50, "Height too low"],
      max: [250, "Height too high"],
    },
    weight: {
      type: Number,
      required: true,
      min: [20, "Weight too low"],
      max: [300, "Weight too high"],
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      uppercase: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    emergencyContact: {
      name: {
        type: String,
      },
      relation: { 
        type: String, 
        trim: true 
      },
      phone: {
        type: String,
      },
    },
    medicalHistory: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "patientProfiles",
  }
);

// Pre-save middleware to encrypt sensitive fields
patientSchema.pre("save", function (next) {
  try {
    // Encrypt address if modified
    if (this.isModified("address") && this.address) {
      // Check if already encrypted (has the format iv:authTag:data)
      if (!this.address.includes(":") || this.address.split(":").length !== 3) {
        this.address = EncryptionService.encrypt(this.address);
      }
    }

    // Encrypt emergency contact name if modified
    if (
      this.emergencyContact &&
      this.isModified("emergencyContact.name") &&
      this.emergencyContact.name
    ) {
      if (
        !this.emergencyContact.name.includes(":") ||
        this.emergencyContact.name.split(":").length !== 3
      ) {
        this.emergencyContact.name = EncryptionService.encrypt(
          this.emergencyContact.name
        );
      }
    }

    // Encrypt emergency contact phone if modified
    if (
      this.emergencyContact &&
      this.isModified("emergencyContact.phone") &&
      this.emergencyContact.phone
    ) {
      if (
        !this.emergencyContact.phone.includes(":") ||
        this.emergencyContact.phone.split(":").length !== 3
      ) {
        this.emergencyContact.phone = EncryptionService.encrypt(
          this.emergencyContact.phone
        );
      }
    }

    // Encrypt medical history if modified
    if (this.isModified("medicalHistory") && this.medicalHistory) {
      this.medicalHistory = this.medicalHistory.map((item) => {
        // Check if already encrypted
        if (!item.includes(":") || item.split(":").length !== 3) {
          return EncryptionService.encrypt(item);
        }
        return item;
      });
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Methods to decrypt sensitive data
patientSchema.methods.getDecryptedAddress = function (): string {
  try {
    return EncryptionService.decrypt(this.address);
  } catch (error) {
    console.error("Error decrypting address:", error);
    return "[DECRYPTION ERROR]";
  }
};

patientSchema.methods.getDecryptedEmergencyContact = function () {
  if (!this.emergencyContact) return null;

  try {
    return {
      name: this.emergencyContact.name
        ? EncryptionService.decrypt(this.emergencyContact.name)
        : null,
      relation: this.emergencyContact.relation,
      phone: this.emergencyContact.phone
        ? EncryptionService.decrypt(this.emergencyContact.phone)
        : null,
    };
  } catch (error) {
    console.error("Error decrypting emergency contact:", error);
    return {
      name: "[DECRYPTION ERROR]",
      relation: this.emergencyContact.relation,
      phone: "[DECRYPTION ERROR]",
    };
  }
};

patientSchema.methods.getDecryptedMedicalHistory = function (): string[] {
  if (!this.medicalHistory || this.medicalHistory.length === 0) return [];

  try {
    return this.medicalHistory.map((item: string) => {
      try {
        return EncryptionService.decrypt(item);
      } catch (error) {
        console.error("Error decrypting medical history item:", error);
        return "[DECRYPTION ERROR]";
      }
    });
  } catch (error) {
    console.error("Error decrypting medical history:", error);
    return [];
  }
};

// Method to get sanitized patient data based on user role
patientSchema.methods.toSecureJSON = function (userRole: string) {
  const obj: any = {
    _id: this._id,
    userId: this.userId,
    age: this.age,
    bloodGroup: this.bloodGroup,
    gender: this.gender,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Full access for patient, doctor, and admin
  if (["patient", "doctor", "admin"].includes(userRole)) {
    obj.address = this.getDecryptedAddress();
    obj.height = this.height;
    obj.weight = this.weight;
    obj.emergencyContact = this.getDecryptedEmergencyContact();
    obj.medicalHistory = this.getDecryptedMedicalHistory();
  }

  return obj;
};

const PatientProfile = mongoose.model<IPatientProfile>(
  "PatientProfile",
  patientSchema
);

export default PatientProfile;