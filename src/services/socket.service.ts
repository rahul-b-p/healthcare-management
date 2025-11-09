import mongoose from "mongoose";
import { getSocketServer } from "../socket/socket.server";
import { logger } from "../utils/logger";
import { NotificationData } from "../interfaces/notification.interface";

export class SocketService {
  private static instance: SocketService;

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Send notification when appointment is created
   */
  public async sendAppointmentCreatedNotification(
    appointment: any,
    performedBy: string
  ) {
    try {
      const socketServer = getSocketServer();

      // Safely format the date
      let formattedDate = "Not specified";
      if (appointment.scheduledAt) {
        try {
          formattedDate = new Date(
            appointment.scheduledAt
          ).toLocaleDateString();
        } catch (err) {
          formattedDate = String(appointment.scheduledAt);
        }
      }

      const notification: NotificationData = {
        type: "APPOINTMENT_CREATED",
        appointmentId: appointment._id.toString(),
        message: `New appointment scheduled for ${formattedDate}`,
        timestamp: new Date(),
        data: {
          appointment: this.sanitizeAppointment(appointment),
          performedBy,
        },
      };

      // Send to assigned doctor - fetch with populated userId
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctor = await DoctorProfile.findById(
        appointment.doctorId
      ).populate("userId");

      if (doctor && (doctor as any).userId) {
        socketServer.sendToUserRoom(
          (doctor as any).userId._id.toString(),
          "appointment_created",
          notification
        );
      }

      // Send to patient - fetch with populated userId
      const PatientProfile = mongoose.model("PatientProfile");
      const patient = await PatientProfile.findById(
        appointment.patientId
      ).populate("userId");

      if (patient && (patient as any).userId) {
        socketServer.sendToUserRoom(
          (patient as any).userId._id.toString(),
          "appointment_created",
          notification
        );
      }

      // Send to appointment room
      socketServer.sendToAppointment(
        appointment._id.toString(),
        "appointment_created",
        notification
      );

      logger.debug(
        `Appointment created notification sent for appointment: ${appointment._id}`
      );
    } catch (error) {
      logger.error("Failed to send appointment created notification", {
        error,
        appointmentId: appointment?._id,
      });
    }
  }

  /**
   * Send notification when appointment is updated
   */
  public async sendAppointmentUpdatedNotification(
    appointment: any,
    previousData: any,
    performedBy: string
  ) {
    try {
      const socketServer = getSocketServer();
      const notification: NotificationData = {
        type: "APPOINTMENT_UPDATED",
        appointmentId: appointment._id.toString(),
        message: "Appointment details have been updated",
        timestamp: new Date(),
        data: {
          appointment: this.sanitizeAppointment(appointment),
          previousData: this.sanitizeAppointment(previousData),
          changes: this.getChanges(previousData, appointment),
          performedBy,
        },
      };

      // Send to assigned doctor
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctor = await DoctorProfile.findById(
        appointment.doctorId
      ).populate("userId");
      if (doctor && (doctor as any).userId) {
        socketServer.sendToUserRoom(
          (doctor as any).userId._id.toString(),
          "appointment_updated",
          notification
        );
      }

      // Send to patient
      const PatientProfile = mongoose.model("PatientProfile");
      const patient = await PatientProfile.findById(
        appointment.patientId
      ).populate("userId");
      if (patient && (patient as any).userId) {
        socketServer.sendToUserRoom(
          (patient as any).userId._id.toString(),
          "appointment_updated",
          notification
        );
      }

      // Send to appointment room
      socketServer.sendToAppointment(
        appointment._id.toString(),
        "appointment_updated",
        notification
      );

      logger.debug(
        `Appointment updated notification sent for appointment: ${appointment._id}`
      );
    } catch (error) {
      logger.error("Failed to send appointment updated notification", {
        error,
        appointmentId: appointment?._id,
      });
    }
  }

  /**
   * Send notification when appointment status changes
   */
  public async sendAppointmentStatusNotification(
    appointment: any,
    oldStatus: string,
    newStatus: string,
    performedBy: string
  ) {
    try {
      const socketServer = getSocketServer();
      const notification: NotificationData = {
        type: "APPOINTMENT_STATUS_CHANGED",
        appointmentId: appointment._id.toString(),
        message: `Appointment status changed from ${oldStatus} to ${newStatus}`,
        timestamp: new Date(),
        data: {
          appointment: this.sanitizeAppointment(appointment),
          oldStatus,
          newStatus,
          performedBy,
        },
      };

      // Send to assigned doctor
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctor = await DoctorProfile.findById(
        appointment.doctorId
      ).populate("userId");
      if (doctor && (doctor as any).userId) {
        socketServer.sendToUserRoom(
          (doctor as any).userId._id.toString(),
          "appointment_status_changed",
          notification
        );
      }

      // Send to patient
      const PatientProfile = mongoose.model("PatientProfile");
      const patient = await PatientProfile.findById(
        appointment.patientId
      ).populate("userId");
      if (patient && (patient as any).userId) {
        socketServer.sendToUserRoom(
          (patient as any).userId._id.toString(),
          "appointment_status_changed",
          notification
        );
      }

      // Send to appointment room
      socketServer.sendToAppointment(
        appointment._id.toString(),
        "appointment_status_changed",
        notification
      );

      logger.debug(
        `Appointment status notification sent for appointment: ${appointment._id}`
      );
    } catch (error) {
      logger.error("Failed to send appointment status notification", {
        error,
        appointmentId: appointment?._id,
      });
    }
  }

  /**
   * Send notification when appointment is cancelled
   */
  public async sendAppointmentCancelledNotification(
    appointment: any,
    performedBy: string,
    reason?: string
  ) {
    try {
      const socketServer = getSocketServer();
      const notification: NotificationData = {
        type: "APPOINTMENT_CANCELLED",
        appointmentId: appointment._id.toString(),
        message: "Appointment has been cancelled",
        timestamp: new Date(),
        data: {
          appointment: this.sanitizeAppointment(appointment),
          performedBy,
          reason,
        },
      };

      // Send to assigned doctor
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctor = await DoctorProfile.findById(
        appointment.doctorId
      ).populate("userId");
      if (doctor && (doctor as any).userId) {
        socketServer.sendToUserRoom(
          (doctor as any).userId._id.toString(),
          "appointment_cancelled",
          notification
        );
      }

      // Send to patient
      const PatientProfile = mongoose.model("PatientProfile");
      const patient = await PatientProfile.findById(
        appointment.patientId
      ).populate("userId");
      if (patient && (patient as any).userId) {
        socketServer.sendToUserRoom(
          (patient as any).userId._id.toString(),
          "appointment_cancelled",
          notification
        );
      }

      // Send to appointment room
      socketServer.sendToAppointment(
        appointment._id.toString(),
        "appointment_cancelled",
        notification
      );

      logger.debug(
        `Appointment cancelled notification sent for appointment: ${appointment._id}`
      );
    } catch (error) {
      logger.error("Failed to send appointment cancelled notification", {
        error,
        appointmentId: appointment?._id,
      });
    }
  }

  private sanitizeAppointment(appointment: any) {
    if (!appointment) return null;

    // Safe extraction of IDs and names
    const patientId =
      appointment.patientId?._id?.toString() ||
      appointment.patientId?.toString() ||
      null;
    const doctorId =
      appointment.doctorId?._id?.toString() ||
      appointment.doctorId?.toString() ||
      null;

    // Try to get names from populated fields, fallback to generic names
    let patientName = "Patient";
    let doctorName = "Doctor";

    // Check if patientId is populated
    if (appointment.patientId && typeof appointment.patientId === "object") {
      if (appointment.patientId.userId?.name) {
        patientName = appointment.patientId.userId.name;
      }
    }

    // Check if doctorId is populated
    if (appointment.doctorId && typeof appointment.doctorId === "object") {
      if (appointment.doctorId.userId?.name) {
        doctorName = appointment.doctorId.userId.name;
      }
    }

    return {
      id: appointment._id?.toString() || appointment.id,
      patientId,
      doctorId,
      scheduledAt: appointment.scheduledAt,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      patientName,
      doctorName,
    };
  }

  private getChanges(previousData: any, currentData: any) {
    const changes: any = {};
    const fields = ["scheduledAt", "reason", "status", "notes"];

    fields.forEach((field) => {
      if (previousData[field] !== currentData[field]) {
        changes[field] = {
          from: previousData[field],
          to: currentData[field],
        };
      }
    });

    return changes;
  }
}

export const socketService = SocketService.getInstance();
