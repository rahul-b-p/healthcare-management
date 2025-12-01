import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

export interface IAuditLog extends Document {
  entityType: "appointment" | "medicalSummary" | "patient";
  entityId: Types.ObjectId;
  action: "create" | "update" | "delete";
  timestamp: Date;
  performedBy: Types.ObjectId;
  changes: IChange[];
  ipAddress?: string;
  userAgent?: string;
}

const changeSchema = new Schema<IChange>(
  {
    field: { type: String, required: true, trim: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const auditLogSchema = new Schema<IAuditLog>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["appointment", "medicalSummary", "patient"],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete"],
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    changes: {
      type: [changeSchema],
      default: [],
      validate: {
        validator: (v: IChange[]) => v.length === 0 || v.every((c) => c.field),
        message: "Each change must have a 'field'",
      },
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  {
    collection: "auditLogs",
    timestamps: false,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });

const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
