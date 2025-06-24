import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./Services/swagger.js";
import jobApplication  from "./Routes/jobApplicationRoute.js"
// import userRoutes from "./Routes/userRoutes.js";
import connectToDatabase from "./Config/db.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
//cors
app.use(
  cors({
    allowedHeaders: ["Content-Type", "token", "authorization"],
    exposedHeaders: ["token", "authorization"],
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
  })
);
//multer file store location
app.use("/uploads", express.static("src/uploads"));
// swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// database connect
connectToDatabase();
import "./Models/jobApplicationModel.js"
// routes
app.use("/api/",jobApplication);
// app.use("/api/users", userRoutes);

export default app;
