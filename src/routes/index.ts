import { Router } from "express";
import authRoutes from "./auth.routes";
import patientRoutes from "./patient.routes";
import doctorRoutes from "./doctor.routes";
import appointmentRoutes from "./appointment.routes";
import medicalSummaryRoutes from "./medical-summary.routes";
import reportRoutes from "./report.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/patient", patientRoutes);

router.use("/doctor", doctorRoutes);

router.use("/appointment", appointmentRoutes);

router.use("/medical-summary", medicalSummaryRoutes);

router.use("/report", reportRoutes);

router.use("/users", userRoutes);

export default router;
