import express from "express";
import morgan from "morgan";
import cors from "cors";
// import userRoutes from "./Routes/userRoutes.js";
import connectToDatabase from "./Config/db.js"

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

// database connect
connectToDatabase();
// routes
// app.use("/api/users", userRoutes);

export default app;
