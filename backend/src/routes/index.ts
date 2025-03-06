import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authRoutes from "./auth";
import { ensureAuthenticated } from "@middlewares/auth";

const {
  BAD_REQUEST,
  CREATED,
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
} = StatusCodes;

const baseRouter = () => {
  const router = Router();

  router.use("/auth", authRoutes);

  // Home Page
  router.get("/", (req, res) => {
    res.status(OK).json({ message: "Welcome to the API", user: req.user });
  });

  // Dashboard (Protected)
  router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.status(OK).json({ message: "Welcome to the dashboard", user: req.user });
  });

  router.use("*", (req: Request, res: Response) => {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Route not found" });
  });

  return router;
};

export default baseRouter;