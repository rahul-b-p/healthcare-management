import mongoose, { Document, Schema, Types } from "mongoose";
import { AppointmentStatus } from "../enums/appoinment.enum";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  scheduledAt: Date;
  reason: string;
  status: AppointmentStatus;
  notes: string;
}

// Appointment Schema
const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile", // or 'users' if patient is directly a user
      required: true,
      validate: {
        validator: async function (id: Types.ObjectId) {
          const patient = await mongoose.model("PatientProfile").findById(id);
          return !!patient;
        },
        message: "Invalid patient ID",
      },
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
      validate: {
        validator: async function (id: Types.ObjectId) {
          const doctor = await mongoose.model("DoctorProfile").findById(id);
          return !!doctor;
        },
        message: "Invalid doctor ID",
      },
    },

    scheduledAt: {
      type: Date,
      required: true,
      validate: {
        validator: (date: Date) => date > new Date(),
        message: "Scheduled time must be in the future",
      },
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Reason must be at least 5 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        if (ret && ret._id !== undefined && ret._id !== null) {
          ret.id = typeof ret._id === "string" ? ret._id : String(ret._id);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
appointmentSchema.index({ patientId: 1, scheduledAt: -1 });
appointmentSchema.index({ doctorId: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledAt: 1 });

// Virtual: Populate patient name (optional, for API response)
appointmentSchema.virtual("patient", {
  ref: "PatientProfile",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.virtual("doctor", {
  ref: "DoctorProfile",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in toJSON/toObject
appointmentSchema.set("toJSON", { virtuals: true });
appointmentSchema.set("toObject", { virtuals: true });

// Create and export model
const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
