import mongoose, { Schema, Document, Types } from "mongoose";
import { EncryptionService } from "../services/encryption.service";

export interface IVitals {
  bp?: string;
  hr?: string;
  temp?: string;
  spo2?: string;
  weight?: string;
  height?: string;
}

export interface IMedicalSummary extends Document {
  appointmentId: Types.ObjectId;
  notes: string;
  diagnoses: string[];
  prescriptions: string[];
  vitals: IVitals;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Decryption methods
  getDecryptedNotes(): string;
  getDecryptedDiagnoses(): string[];
  getDecryptedPrescriptions(): string[];
  toSecureJSON(userRole: string): any;
}

const MedicalSummarySchema = new Schema<IMedicalSummary>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
      index: true,
      unique: true,
    },
    notes: {
      type: String,
      required: [true, "Clinical notes are required"],
      minlength: [10, "Notes must be at least 10 characters"],
    },
    diagnoses: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one diagnosis is required",
      },
    },
    prescriptions: {
      type: [String],
      default: [],
    },
    vitals: {
      bp: { type: String, trim: true },
      hr: { type: String, trim: true },
      temp: { type: String, trim: true },
      spo2: { type: String, trim: true },
      weight: { type: String, trim: true },
      height: { type: String, trim: true },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MedicalSummarySchema.index({ createdBy: 1 });
MedicalSummarySchema.index({ updatedBy: 1 });

MedicalSummarySchema.pre("save", function (next) {
  try {
    // Helper: encrypt if not already encrypted
    const encryptIfNeeded = (value: string): string => {
      if (!value) return value;
      const parts = value.split(":");
      if (parts.length !== 3) {
        return EncryptionService.encrypt(value);
      }
      return value; // already encrypted
    };

    // Encrypt notes
    if (this.isModified("notes") && this.notes) {
      this.notes = encryptIfNeeded(this.notes);
    }

    // Encrypt diagnoses
    if (this.isModified("diagnoses") && this.diagnoses?.length) {
      this.diagnoses = this.diagnoses.map((d) => encryptIfNeeded(d));
    }

    // Encrypt prescriptions
    if (this.isModified("prescriptions") && this.prescriptions?.length) {
      this.prescriptions = this.prescriptions.map((p) => encryptIfNeeded(p));
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

MedicalSummarySchema.methods.getDecryptedNotes = function (): string {
  try {
    return this.notes ? EncryptionService.decrypt(this.notes) : "";
  } catch (error) {
    console.error("Error decrypting notes:", error);
    return "[DECRYPTION ERROR]";
  }
};

MedicalSummarySchema.methods.getDecryptedDiagnoses = function (): string[] {
  if (!this.diagnoses || this.diagnoses.length === 0) return [];

  return this.diagnoses.map((item: string) => {
    try {
      return EncryptionService.decrypt(item);
    } catch (error) {
      console.error("Error decrypting diagnosis:", error);
      return "[DECRYPTION ERROR]";
    }
  });
};

MedicalSummarySchema.methods.getDecryptedPrescriptions = function (): string[] {
  if (!this.prescriptions || this.prescriptions.length === 0) return [];

  return this.prescriptions.map((item: string) => {
    try {
      return EncryptionService.decrypt(item);
    } catch (error) {
      console.error("Error decrypting prescription:", error);
      return "[DECRYPTION ERROR]";
    }
  });
};

MedicalSummarySchema.methods.toSecureJSON = function (userRole: string) {
  const obj: any = {
    _id: this._id,
    appointmentId: this.appointmentId,
    vitals: this.vitals,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Only authorized roles can see decrypted PII
  if (["doctor", "patient", "admin"].includes(userRole)) {
    obj.notes = this.getDecryptedNotes();
    obj.diagnoses = this.getDecryptedDiagnoses();
    obj.prescriptions = this.getDecryptedPrescriptions();
  } else {
    obj.notes = "[ENCRYPTED]";
    obj.diagnoses = this.diagnoses.map(() => "[ENCRYPTED]");
    obj.prescriptions = this.prescriptions.map(() => "[ENCRYPTED]");
  }

  return obj;
};

MedicalSummarySchema.virtual("bmi").get(function (this: IMedicalSummary) {
  if (!this.vitals.weight || !this.vitals.height) return null;

  const weight = parseFloat(this.vitals.weight.replace(/[^0-9.]/g, ""));
  const height = parseFloat(this.vitals.height.replace(/[^0-9.]/g, ""));

  if (!weight || !height) return null;

  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
});

export const MedicalSummary = mongoose.model<IMedicalSummary>(
  "MedicalSummary",
  MedicalSummarySchema
);

export default MedicalSummary;
