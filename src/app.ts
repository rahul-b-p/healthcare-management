import express from "express";
import { morganLogger } from "./utils/logger";
import router from "./routes";
import cors from "cors";
import { notFoundHandler } from "./middlewares/notFoundHandler.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

// log API Requests
app.use(morganLogger);

// cors configuration(allowed for all origins)
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// json parser middleware
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// using routes
app.use("/api", router);

// not found handler
app.use(notFoundHandler);

// express error handler
app.use(errorHandler);

export default app;
