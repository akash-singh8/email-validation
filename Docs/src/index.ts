// src/app.ts
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { RegisterRoutes } from "../tsoaRoute/routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

RegisterRoutes(app);

const mongodb_uri = process.env.MONGODB_URI;

if (!mongodb_uri) {
  console.error("MONGODB_URI environment variable is not defined.");
} else {
  mongoose.connect(mongodb_uri, { dbName: "linkValidator" });

  const db = mongoose.connection;

  db.once("open", () => {
    console.log("MongoDB connected");

    const PORT: number = parseInt(process.env.PORT || "3000", 10);

    app.listen(PORT, () => {
      console.log("Server listening on port:", PORT);
    });
  });

  db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
}
