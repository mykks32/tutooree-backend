import express from "express";
import connectDB from "./bootstrap/database";
import cors from "cors";
import baseRouter from "./routes";
import { configurePassport } from "../src/bootstrap/passport";
import passport from "passport";
import sessionConfig from "@bootstrap/session";

const getApp = async () => {
  const app = express();

  await connectDB();

  // Middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(sessionConfig())

  // Initialize Passport
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", baseRouter());

  return app;
};

export default getApp;