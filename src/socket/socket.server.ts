import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { UserRole } from "../enums/role.enum";
import { logger } from "../utils/logger";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: UserRole;
}

export class SocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://127.0.0.1:5500",
          "http://localhost:5500",
        ],
        methods: ["GET", "POST", "PATCH"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupConnectionHandling();
  }

  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.token;

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.userId;
        socket.role = decoded.role;
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupConnectionHandling() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      logger.info(`User ${socket.userId} connected with socket ${socket.id}`);

      // Store user socket mapping
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join user to their personal room
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
      }

      // Join doctor to doctor room if applicable
      if (socket.role === UserRole.DOCTOR) {
        socket.join("doctors_room");
      }

      // Join patient to patient room if applicable
      if (socket.role === UserRole.PATIENT) {
        socket.join("patients_room");
      }

      socket.on("disconnect", () => {
        logger.info(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });

      socket.on("join_appointment", (appointmentId: string) => {
        socket.join(`appointment_${appointmentId}`);
        logger.info(
          `User ${socket.userId} joined appointment room: ${appointmentId}`
        );
      });

      socket.on("leave_appointment", (appointmentId: string) => {
        socket.leave(`appointment_${appointmentId}`);
        logger.info(
          `User ${socket.userId} left appointment room: ${appointmentId}`
        );
      });
    });
  }

  // Send notification to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send notification to user room
  public sendToUserRoom(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to all doctors
  public sendToDoctors(event: string, data: any) {
    this.io.to("doctors_room").emit(event, data);
  }

  // Send notification to all patients
  public sendToPatients(event: string, data: any) {
    this.io.to("patients_room").emit(event, data);
  }

  // Send notification to specific appointment room
  public sendToAppointment(appointmentId: string, event: string, data: any) {
    this.io.to(`appointment_${appointmentId}`).emit(event, data);
  }

  // Get socket instance
  public getIO() {
    return this.io;
  }
}

let socketServer: SocketServer;

export const initializeSocket = (server: HttpServer) => {
  socketServer = new SocketServer(server);
  return socketServer;
};

export const getSocketServer = () => {
  if (!socketServer) {
    throw new Error("Socket server not initialized");
  }
  return socketServer;
};
