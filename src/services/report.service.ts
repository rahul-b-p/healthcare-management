import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";
import { UserRole } from "../enums/role.enum";
import { logger } from "../utils/logger";
import { handleMongoDBError } from "../utils/mongo-error";
import { getAppointmentById } from "./appointment.service";
import { AppointmentStatus } from "../enums/appoinment.enum";

/**
 * Generate visit report PDF
 */
export const generateVisitReportPDF = async (
  appointmentId: string,
  userId: string,
  userRole: string
): Promise<Buffer> => {
  logger.debug(`Generating visit report for appointment: ${appointmentId}`);

  try {
    console.log(appointmentId);
    const MedicalSummary = mongoose.model("MedicalSummary");

    const appointment = await getAppointmentById(
      appointmentId,
      userId,
      userRole
    );

    if (!appointment) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        errorMessage.APPOINTMENT_NOT_FOUND
      );
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new HttpStatusError(
        HttpStatus.BAD_REQUEST,
        errorMessage.CANT_GET_VISIT_REPORT
      );
    }

    // Check permissions
    if (userRole === UserRole.DOCTOR) {
      const DoctorProfile = mongoose.model("DoctorProfile");
      const doctorProfile = await DoctorProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (
        !doctorProfile ||
        appointment.doctorId._id.toString() !== doctorProfile._id.toString()
      ) {
        throw new HttpStatusError(
          HttpStatus.FORBIDDEN,
          errorMessage.NO_PERMISSION
        );
      }
    }

    // Fetch medical summary
    const medicalSummary = await MedicalSummary.findOne({ appointmentId })
      .populate({
        path: "createdBy",
        populate: { path: "userId", select: "name" },
      })
      .populate({
        path: "updatedBy",
        populate: { path: "userId", select: "name" },
      });

    if (!medicalSummary) {
      throw new HttpStatusError(
        HttpStatus.NOT_FOUND,
        "Medical summary not found for this appointment"
      );
    }

    // Generate PDF
    const pdfBuffer = await createVisitReportPDF({
      appointment,
      medicalSummary: medicalSummary.toSecureJSON(userRole),
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      generatedAt: new Date(),
    });

    return pdfBuffer;
  } catch (error) {
    return handleMongoDBError(error, "generate visit report PDF");
  }
};

/**
 * Create PDF document with visit report
 */
const createVisitReportPDF = (data: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on("error", reject);

      // Add header
      addHeader(doc, data);

      // Add patient information
      addPatientInfo(doc, data.patient);

      // Add appointment details
      addAppointmentDetails(doc, data.appointment);

      // Add medical summary
      addMedicalSummary(doc, data.medicalSummary);

      // Add vitals
      addVitals(doc, data.medicalSummary.vitals);

      // Add footer
      addFooter(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add header to PDF
 */
const addHeader = (doc: PDFKit.PDFDocument, data: any) => {
  // Hospital Logo and Title
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#2c5aa0")
    .text("MEDICAL VISIT REPORT", 50, 50, { align: "center" })
    .moveDown(0.5);

  // Separator line
  doc
    .moveTo(50, 85)
    .lineTo(550, 85)
    .strokeColor("#2c5aa0")
    .lineWidth(2)
    .stroke()
    .moveDown(1);

  doc.fontSize(10).fillColor("#666666");
};

/**
 * Add patient information section
 */
const addPatientInfo = (doc: PDFKit.PDFDocument, patient: any) => {
  const startY = 100;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text("PATIENT INFORMATION", 50, startY)
    .moveDown(0.3);

  // Patient details box
  const boxHeight = 80;
  doc
    .rect(50, startY + 20, 500, boxHeight)
    .fillColor("#f8f9fa")
    .fill()
    .strokeColor("#dee2e6")
    .stroke();

  doc.fontSize(10).font("Helvetica");

  // Column 1
  doc
    .fillColor("#333333")
    .text(`Name: ${patient.userId?.name || "N/A"}`, 60, startY + 30)
    .text(`Age: ${patient.age || "N/A"}`, 60, startY + 45)
    .text(`Gender: ${patient.gender || "N/A"}`, 60, startY + 60);

  // Column 2
  doc
    .text(`Blood Group: ${patient.bloodGroup || "N/A"}`, 200, startY + 30)
    .text(`Height: ${patient.height || "N/A"} cm`, 200, startY + 45)
    .text(`Weight: ${patient.weight || "N/A"} kg`, 200, startY + 60);

  // Column 3
  doc
    .text(`Email: ${patient.userId?.email || "N/A"}`, 350, startY + 30)
    .text(`Phone: ${patient.userId?.phone || "N/A"}`, 350, startY + 45);

  doc.moveDown(4);
};

/**
 * Add appointment details section
 */
const addAppointmentDetails = (doc: PDFKit.PDFDocument, appointment: any) => {
  const startY = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text("APPOINTMENT DETAILS", 50, startY)
    .moveDown(0.3);

  const boxHeight = 60;
  doc
    .rect(50, startY + 20, 500, boxHeight)
    .fillColor("#f8f9fa")
    .fill()
    .strokeColor("#dee2e6")
    .stroke();

  doc.fontSize(10).font("Helvetica");

  doc
    .fillColor("#333333")
    .text(
      `Doctor: ${appointment.doctorId?.userId?.name || "N/A"}`,
      60,
      startY + 30
    )
    .text(
      `Specialization: ${appointment.doctorId?.specialization || "N/A"}`,
      60,
      startY + 45
    )
    .text(
      `Appointment Date: ${new Date(
        appointment.scheduledAt
      ).toLocaleDateString()}`,
      60,
      startY + 60
    )
    .text(
      `Time: ${new Date(appointment.scheduledAt).toLocaleTimeString()}`,
      200,
      startY + 60
    )
    .text(`Status: ${appointment.status.toUpperCase()}`, 350, startY + 30);

  doc.moveDown(3.5);
};

/**
 * Add medical summary section
 */
const addMedicalSummary = (doc: PDFKit.PDFDocument, medicalSummary: any) => {
  const startY = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text("MEDICAL SUMMARY", 50, startY)
    .moveDown(0.3);

  // Clinical Notes
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Clinical Notes:", 60, doc.y)
    .moveDown(0.2);

  doc
    .font("Helvetica")
    .text(medicalSummary.notes || "No clinical notes provided.", 60, doc.y, {
      width: 480,
      align: "justify",
    })
    .moveDown(0.5);

  // Diagnoses
  if (medicalSummary.diagnoses && medicalSummary.diagnoses.length > 0) {
    doc.font("Helvetica-Bold").text("Diagnoses:", 60, doc.y).moveDown(0.2);

    medicalSummary.diagnoses.forEach((diagnosis: string, index: number) => {
      doc.font("Helvetica").text(`${index + 1}. ${diagnosis}`, 70, doc.y, {
        width: 470,
      });
    });
    doc.moveDown(0.5);
  }

  // Prescriptions
  if (medicalSummary.prescriptions && medicalSummary.prescriptions.length > 0) {
    doc.font("Helvetica-Bold").text("Prescriptions:", 60, doc.y).moveDown(0.2);

    medicalSummary.prescriptions.forEach(
      (prescription: string, index: number) => {
        doc.font("Helvetica").text(`${index + 1}. ${prescription}`, 70, doc.y, {
          width: 470,
        });
      }
    );
  }

  doc.moveDown(1);
};

/**
 * Add vitals section
 */
const addVitals = (doc: PDFKit.PDFDocument, vitals: any) => {
  if (!vitals) return;

  const startY = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text("VITAL SIGNS", 50, startY)
    .moveDown(0.3);

  const boxHeight = 70;
  doc
    .rect(50, startY + 20, 500, boxHeight)
    .fillColor("#f8f9fa")
    .fill()
    .strokeColor("#dee2e6")
    .stroke();

  doc.fontSize(10).font("Helvetica");

  const vitalY = startY + 30;

  // Row 1
  doc
    .fillColor("#333333")
    .text(`Blood Pressure: ${vitals.bp || "N/A"}`, 60, vitalY)
    .text(`Heart Rate: ${vitals.hr || "N/A"} bpm`, 200, vitalY)
    .text(`Temperature: ${vitals.temp || "N/A"} °C`, 350, vitalY);

  // Row 2
  doc
    .text(`SpO2: ${vitals.spo2 || "N/A"}%`, 60, vitalY + 15)
    .text(`Weight: ${vitals.weight || "N/A"} kg`, 200, vitalY + 15)
    .text(`Height: ${vitals.height || "N/A"} cm`, 350, vitalY + 15);

  // BMI if both weight and height are available
  if (vitals.weight && vitals.height) {
    const weight = parseFloat(vitals.weight);
    const height = parseFloat(vitals.height) / 100; // convert to meters
    const bmi = weight / (height * height);

    doc.text(`BMI: ${bmi.toFixed(1)}`, 60, vitalY + 30);
  }

  doc.moveDown(4);
};

/**
 * Add footer to PDF
 */
const addFooter = (doc: PDFKit.PDFDocument, data: any) => {
  const footerY = 750;

  // Doctor signature section
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      `Generated on: ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}`,
      50,
      footerY,
      { align: "left" }
    );

  // Doctor signature line
  doc
    .moveTo(350, footerY + 20)
    .lineTo(500, footerY + 20)
    .strokeColor("#333333")
    .lineWidth(1)
    .stroke();

  doc
    .text("Doctor Signature", 350, footerY + 25, { align: "center" })
    .text(data.doctor.userId?.name || "Doctor", 350, footerY + 40, {
      align: "center",
    })
    .text(data.doctor.specialization || "", 350, footerY + 55, {
      align: "center",
    });

  // Page number
  doc.text(`Page 1 of 1`, 50, footerY + 40, { align: "right" });

  // Confidential notice
  doc
    .fontSize(8)
    .fillColor("#999999")
    .text(
      "This document contains confidential medical information. Unauthorized distribution is prohibited.",
      50,
      footerY + 60,
      { align: "center", width: 500 }
    );
};
