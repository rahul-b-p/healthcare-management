import { Types } from "mongoose";
import { LogOptions } from "../interfaces/audit.interface";
import AuditLog, { IAuditLog } from "../models/audit-log.model";
import { handleMongoDBError } from "../utils/mongo-error";
import { EntityType } from "../enums/entity.enum";

export const logActivity = async ({
  entityType,
  entityId,
  action,
  performedBy,
  changes = [],
  context = {},
}: LogOptions): Promise<void> => {
  const logEntry: Partial<IAuditLog> = {
    entityType,
    entityId: new Types.ObjectId(entityId),
    action,
    performedBy: new Types.ObjectId(performedBy),
    timestamp: new Date(),
    changes,
    ...context,
  };

  // For 'create', oldValue is undefined; for 'delete', newValue is undefined
  if (action === "create") {
    logEntry.changes = changes.map((c) => ({
      field: c.field,
      newValue: c.newValue,
    }));
  } else if (action === "delete") {
    logEntry.changes = changes.map((c) => ({
      field: c.field,
      oldValue: c.oldValue,
    }));
  }

  try {
    await AuditLog.create(logEntry);
  } catch (error) {
    handleMongoDBError(error);
  }
};

export const getEntityAuditLogs = async (
  entityType: EntityType,
  entityId: string
) => {
  try {
    return await AuditLog.find({
      entityType,
      entityId,
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .populate("performedBy", "name email role");
  } catch (error) {
    return handleMongoDBError(error);
  }
};
