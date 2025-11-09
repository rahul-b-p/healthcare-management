import { NextFunction, Request, Response } from "express";
import * as reportService from "../services/report.service";
import { HttpStatus } from "../enums/http.enum";
import { HttpStatusError } from "../errors/http.error";
import errorMessage from "../constants/errorMessage";

export const generateVisitReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const appointmentId = req.params.appointmentId;

    if (!user) {
      throw new HttpStatusError(
        HttpStatus.UNAUTHORIZED,
        errorMessage.UNAUTHORIZED
      );
    }

    // Generate PDF
    const pdfBuffer = await reportService.generateVisitReportPDF(
      appointmentId,
      user.userId,
      user.role
    );

    // Set response headers for PDF download
    const filename = `visit-report-${appointmentId}-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error: any) {
    next(error);
  }
};
