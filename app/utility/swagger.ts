import { Express } from "express";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Url Shortener",
      version: "1.0.0",
      description: "API Documentation",
    },
  },
  apis: [
    path.join(__dirname, "../app.ts"),
    path.join(__dirname, "../modules/*/*.ts"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use(
    process.env.SWAGGER_DOCS_ROUTE as string,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};
