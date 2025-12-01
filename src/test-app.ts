import express from "express";
import { morganLogger } from "./utils/logger";
import router from "./routes";
import cors from "cors";
import { notFoundHandler } from "./middlewares/notFoundHandler.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(morganLogger);
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;