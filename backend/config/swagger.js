const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VendorLink API",
      version: "1.0.0",
      description: "REST API documentation for the VendorLink backend",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "64a1f2c3e4b5d6e7f8a9b0c1" },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@example.com" },
            role: {
              type: "string",
              enum: ["customer", "vendor", "admin"],
              example: "vendor",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        VendorProfile: {
          type: "object",
          properties: {
            id: { type: "string", example: "64a1f2c3e4b5d6e7f8a9b0c2" },
            userId: { type: "string", example: "64a1f2c3e4b5d6e7f8a9b0c1" },
            storeName: { type: "string", example: "Tech Haven" },
            description: { type: "string", example: "Best gadgets in town" },
            category: { type: "string", example: "Electronics" },
            logo: { type: "string", example: "https://example.com/logo.png" },
            isApproved: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "An error occurred" },
          },
        },
      },
    },
  },
  // Path to files containing Swagger JSDoc comments
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
