export interface NotificationData {
  type:
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_UPDATED"
    | "APPOINTMENT_CANCELLED"
    | "APPOINTMENT_STATUS_CHANGED";
  appointmentId: string;
  message: string;
  timestamp: Date;
  data?: any;
}