import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../enums/role.enum";

/**
 * Interface for DoctorProfile document
 */
export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  clinicLocation?: string;
  consultationFee?: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  bio?: string;
  isActive: boolean;
  rating?: number; // Average rating from patients (populated later)
  totalAppointments?: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
      validate: {
        validator: async function (userId: Types.ObjectId) {
          const user = await mongoose.model("users").findById(userId);
          return user && user.role === UserRole.DOCTOR;
        },
        message: "Referenced user must have role DOCTOR",
      },
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "General Physician",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Neurologist",
        "Orthopedic",
        "Gynecologist",
        "Psychiatrist",
        "ENT Specialist",
        "Ophthalmologist",
        "Other",
      ],
    },
    qualifications: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "At least one qualification is required",
      },
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
    },
    clinicLocation: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    availability: {
      days: {
        type: [String],
        validate: {
          validator: (days: string[]) =>
            days.every((d) =>
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].includes(d)
            ),
          message: "Invalid day in availability",
        },
      },
      startTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        validate: {
          validator: function (this: IDoctorProfile, time: string) {
            if (!this.availability?.endTime) return true;
            return time < this.availability.endTime;
          },
          message: "Start time must be before end time",
        },
      },
      endTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalAppointments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const r = ret as any;
        r.id = r._id.toString();
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

// Indexes for performance
doctorProfileSchema.index({ user: 1 }, { unique: true });
doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ isActive: 1 });
doctorProfileSchema.index({ "availability.days": 1 });

// Virtual populate appointments (optional, for future use)
doctorProfileSchema.virtual("appointments", {
  ref: "Appointment", // Assuming you have an Appointment model
  localField: "user",
  foreignField: "doctor",
});

const DoctorProfile = mongoose.model<IDoctorProfile>(
  "DoctorProfile",
  doctorProfileSchema
);

export default DoctorProfile;
