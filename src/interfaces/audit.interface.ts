import { Types } from "mongoose";
import { IAuditLog, IChange } from "../models/audit-log.model";
import { EntityType } from "../enums/entity.enum";

export interface LogOptions {
  entityType: EntityType;
  entityId: Types.ObjectId | string;
  action: IAuditLog["action"];
  performedBy: Types.ObjectId | string;
  changes?: IChange[];
  context?: { ipAddress?: string; userAgent?: string };
}
