import swaggerJsdoc from "swagger-jsdoc";
import env from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Healthcare management application",
      version: "1.0.0",
      description:
        "Schedule and manage patient appointments. Maintain patient medical summaries. Generate analytics on patient visits and appointment patterns. Provide real-time appointment status updates via WebSockets. Ensure secure handling of sensitive patient data using industry best practices. Implement role-based authentication with JWT tokens.",
    },
    servers: [
      {
        url: `http://localhost:${env.app.port}`,
      },
    ],
    components: {
      securitySchemes: {
        accessToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token for authenticating API requests",
        },
        refreshToken: {
          type: "apiKey",
          in: "header",
          name: "x-refresh-token",
          description: "Refresh token for obtaining new access tokens",
        },
      },
    },
    security: [
      {
        accessToken: [],
      },
    ],
  },
  // JSDoc path patterns
  apis: ["./src/routes/*.ts", "./src/interfaces/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);